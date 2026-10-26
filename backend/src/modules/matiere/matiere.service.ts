// backend/src/modules/matiere/matiere.service.ts

import { getTenantClient } from '../../config/tenant-db';
import { AppError } from '../../utils/AppError';
import type {
  CreateMatiereInput,
  UpdateMatiereInput,
  ListMatieresQuery,
} from './matiere.validation';

export interface MatiereContext {
  schemaName: string;
  etablissementId: string;
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

const matiereInclude = {
  niveau: { select: { id: true, nom: true, code: true, ordre: true } },
  _count: {
    select: {
      notes: true,
      affectations: true,
      emploisTemps: true,
      reglesEvaluation: true,
      documents: true,
      groupesTD: true,
    },
  },
} as const;

export class MatiereService {
  async create(ctx: MatiereContext, input: CreateMatiereInput) {
    const client = await getClient(ctx.schemaName);

    // Vérifier le niveau
    const niveau = await client.niveau.findUnique({
      where: { id: input.niveauId },
      select: { id: true },
    });
    if (!niveau) throw new AppError('Niveau introuvable', 404);

    // Vérifier l'unicité du code
    const dup = await client.matiere.findUnique({
      where: { code: input.code },
      select: { id: true },
    });
    if (dup) throw new AppError(`Le code "${input.code}" est déjà utilisé`, 409);

    try {
      return await client.matiere.create({
        data: {
          nom: input.nom.trim(),
          code: input.code.trim().toUpperCase(),
          niveauId: input.niveauId,
          coefficient: input.coefficient ?? 1.0,
          dureeCours: input.dureeCours ?? 60,
          description: input.description ?? null,
          estActive: input.estActive ?? true,
        },
        include: matiereInclude,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError('Ce code de matière est déjà utilisé', 409);
      }
      if (err?.code === 'P2003') {
        throw new AppError('Référence invalide (niveau inexistant)', 400);
      }
      throw err;
    }
  }

  async findAll(ctx: MatiereContext, q: ListMatieresQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};
    if (q.search) {
      where.OR = [
        { nom: { contains: q.search, mode: 'insensitive' } },
        { code: { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    if (q.niveauId) where.niveauId = q.niveauId;
    if (q.estActive !== undefined) where.estActive = q.estActive;
    if (q.estArchive !== undefined) where.estArchive = q.estArchive;

    const allowedSort = ['nom', 'code', 'coefficient', 'createdAt'];
    const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'nom';
    const sortOrder = q.sortOrder === 'desc' ? 'desc' : 'asc';

    const [total, data] = await Promise.all([
      client.matiere.count({ where }),
      client.matiere.findMany({
        where,
        include: matiereInclude,
        orderBy: { [sortBy]: sortOrder },
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

  async findById(ctx: MatiereContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const matiere = await client.matiere.findUnique({
      where: { id },
      include: {
        ...matiereInclude,
        niveau: true,
        reglesEvaluation: { take: 10 },
        documents: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!matiere) throw new AppError('Matière introuvable', 404);
    return matiere;
  }

  async update(ctx: MatiereContext, id: string, input: UpdateMatiereInput) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.matiere.findUnique({
      where: { id },
      select: { id: true, code: true },
    });
    if (!existing) throw new AppError('Matière introuvable', 404);

    if (input.niveauId) {
      const niveau = await client.niveau.findUnique({
        where: { id: input.niveauId },
        select: { id: true },
      });
      if (!niveau) throw new AppError('Niveau introuvable', 404);
    }

    if (input.code && input.code !== existing.code) {
      const dup = await client.matiere.findUnique({
        where: { code: input.code },
        select: { id: true },
      });
      if (dup) throw new AppError('Ce code est déjà utilisé', 409);
    }

    const patch: any = {};
    if (input.nom !== undefined) patch.nom = input.nom.trim();
    if (input.code !== undefined) patch.code = input.code.trim().toUpperCase();
    if (input.niveauId !== undefined) patch.niveauId = input.niveauId;
    if (input.coefficient !== undefined) patch.coefficient = input.coefficient;
    if (input.dureeCours !== undefined) patch.dureeCours = input.dureeCours;
    if (input.description !== undefined) patch.description = input.description;
    if (input.estActive !== undefined) patch.estActive = input.estActive;
    if (input.estArchive !== undefined) patch.estArchive = input.estArchive;

    try {
      return await client.matiere.update({
        where: { id },
        data: patch,
        include: matiereInclude,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError('Ce code est déjà utilisé', 409);
      }
      throw err;
    }
  }

  async softDelete(ctx: MatiereContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.matiere.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new AppError('Matière introuvable', 404);

    await client.matiere.update({
      where: { id },
      data: { estActive: false, estArchive: true },
    });

    return { id, message: 'Matière archivée' };
  }

  async hardDelete(ctx: MatiereContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.matiere.findUnique({
      where: { id },
      select: { id: true, nom: true },
    });
    if (!existing) throw new AppError('Matière introuvable', 404);

    // Vérifier les dépendances
    const [nbNotes, nbAffectations, nbEmplois, nbRegles] = await Promise.all([
      client.note.count({ where: { matiereId: id } }),
      client.affectationEnseignant.count({ where: { matiereId: id } }),
      client.emploiTemps.count({ where: { matiereId: id } }),
      client.regleEvaluation.count({ where: { matiereId: id } }),
    ]);

    const total = nbNotes + nbAffectations + nbEmplois + nbRegles;
    if (total > 0) {
      throw new AppError(
        `Suppression impossible : référencée par ${nbNotes} note(s), ${nbAffectations} affectation(s), ${nbEmplois} emploi(s) du temps, ${nbRegles} règle(s). Archivez à la place.`,
        409
      );
    }

    await client.matiere.delete({ where: { id } });
    return { id, message: 'Matière supprimée définitivement' };
  }
}

export const matiereService = new MatiereService();