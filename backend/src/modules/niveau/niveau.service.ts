// backend/src/modules/niveau/niveau.service.ts

import { getTenantClient } from '../../config/tenant-db.js';
import { AppError } from '../../utils/AppError.js';
import type {
  CreateNiveauInput,
  UpdateNiveauInput,
  ListNiveauxQuery,
} from './niveau.validation.js';

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

export interface NiveauContext {
  schemaName: string;
  etablissementId: string;
}

interface ListResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) {
    throw new AppError(
      `Client tenant introuvable pour le schéma "${schemaName}"`,
      500
    );
  }
  return client;
}

/**
 * Vérifie l'unicité du code de niveau (contrainte DB @unique).
 */
async function assertCodeUnique(
  client: Awaited<ReturnType<typeof getClient>>,
  code: string,
  excludeId?: string
): Promise<void> {
  const existing = await client.niveau.findFirst({
    where: {
      code,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (existing) {
    throw new AppError(
      `Le code "${code}" est déjà utilisé par un autre niveau`,
      409
    );
  }
}

/**
 * Sérialisation standard d'un niveau (avec compteurs utiles).
 */
const niveauInclude = {
  _count: {
    select: {
      classes: true,
      matieres: true,
      plansScolarite: true,
      reglesEvaluation: true,
    },
  },
} as const;

// ──────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────

export class NiveauService {
  // ────────── CREATE ──────────

  async create(ctx: NiveauContext, input: CreateNiveauInput) {
    const client = await getClient(ctx.schemaName);

    await assertCodeUnique(client, input.code);

    try {
      return await client.niveau.create({
        data: {
          nom: input.nom,
          code: input.code,
          description: input.description ?? null,
          ordre: input.ordre ?? 0,
        },
        include: niveauInclude,
      });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'P2002') {
        throw new AppError(
          `Le code "${input.code}" est déjà utilisé`,
          409
        );
      }
      throw err;
    }
  }

  // ────────── LIST ──────────

  async findAll(
    ctx: NiveauContext,
    q: ListNiveauxQuery
  ): Promise<ListResult<unknown>> {
    const client = await getClient(ctx.schemaName);

    const where: Record<string, unknown> = {};

    if (q.search) {
      where.OR = [
        { nom: { contains: q.search, mode: 'insensitive' } },
        { code: { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [q.sortBy]: q.sortOrder,
    };

    const [total, data] = await Promise.all([
      client.niveau.count({ where }),
      client.niveau.findMany({
        where,
        include: niveauInclude,
        orderBy,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ]);

    return {
      data,
      pagination: {
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit) || 1,
      },
    };
  }

  // ────────── GET BY ID ──────────

  async findById(ctx: NiveauContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const niveau = await client.niveau.findUnique({
      where: { id },
      include: {
        ...niveauInclude,
        classes: {
          where: { estArchive: false },
          select: { id: true, nom: true, code: true, estActive: true },
          orderBy: { nom: 'asc' },
        },
        matieres: {
          where: { estArchive: false },
          select: { id: true, nom: true, code: true, coefficient: true },
          orderBy: { nom: 'asc' },
        },
      },
    });

    if (!niveau) throw new AppError('Niveau introuvable', 404);
    return niveau;
  }

  // ────────── UPDATE ──────────

  async update(ctx: NiveauContext, id: string, input: UpdateNiveauInput) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.niveau.findUnique({
      where: { id },
      select: { id: true, code: true },
    });
    if (!existing) throw new AppError('Niveau introuvable', 404);

    if (input.code && input.code !== existing.code) {
      await assertCodeUnique(client, input.code, id);
    }

    try {
      return await client.niveau.update({
        where: { id },
        data: {
          ...(input.nom !== undefined && { nom: input.nom }),
          ...(input.code !== undefined && { code: input.code }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.ordre !== undefined && { ordre: input.ordre }),
        },
        include: niveauInclude,
      });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'P2002') {
        throw new AppError(
          `Le code "${input.code}" est déjà utilisé`,
          409
        );
      }
      throw err;
    }
  }

  // ────────── DELETE (hard uniquement — pas de soft delete sur Niveau) ──────────

  async hardDelete(ctx: NiveauContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.niveau.findUnique({
      where: { id },
      select: { id: true, nom: true },
    });
    if (!existing) throw new AppError('Niveau introuvable', 404);

    // Vérification d'intégrité référentielle
    const [nbClasses, nbMatieres, nbPlans, nbRegles] = await Promise.all([
      client.classe.count({ where: { niveauId: id } }),
      client.matiere.count({ where: { niveauId: id } }),
      client.planScolarite.count({ where: { niveauId: id } }),
      client.regleEvaluation.count({ where: { niveauId: id } }),
    ]);

    const total = nbClasses + nbMatieres + nbPlans + nbRegles;
    if (total > 0) {
      throw new AppError(
        `Suppression impossible : le niveau est référencé par ` +
          `${nbClasses} classe(s), ${nbMatieres} matière(s), ` +
          `${nbPlans} plan(s) de scolarité, ${nbRegles} règle(s) d'évaluation. ` +
          `Supprimez ou réassignez ces éléments d'abord.`,
        409
      );
    }

    await client.niveau.delete({ where: { id } });
    return { id, message: 'Niveau supprimé définitivement' };
  }
}

// ──────────────────────────────────────────
// Export unique
// ──────────────────────────────────────────

export const niveauService = new NiveauService();