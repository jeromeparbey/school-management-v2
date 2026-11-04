// backend/src/modules/reduction/reduction.service.ts

import { getTenantClient } from '../../config/tenant-db.js';
import { AppError } from '../../utils/AppError.js';
import type {
  CreateReductionInput,
  UpdateReductionInput,
  ListReductionsQuery,
} from './reduction.validation.js';

export interface ReductionContext {
  schemaName: string;
  etablissementId: string;
  userId: string;
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

const TOLERANCE = 0.01;

// ══════════════════════════════════════════
// INCLUDES
// ══════════════════════════════════════════

const reductionInclude = {
  eleve: {
    select: {
      id: true,
      matricule: true,
      prenom: true,
      nom: true,
      sexe: true,
      photo: true,
    },
  },
  assignmentScolarite: {
    select: {
      id: true,
      montantPersonnalise: true,
      statut: true,
      planScolarite: {
        select: {
          id: true,
          nom: true,
          montantTotal: true,
          devise: true,
        },
      },
    },
  },
  approbateur: {
    select: { id: true, prenom: true, nom: true },
  },
} as const;

// ══════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════

/**
 * Calcule le montant de la réduction en fonction du type.
 * - FIXE → valeur directe
 * - POURCENTAGE → pourcentage du montant du plan
 */
function calculerMontantReduction(
  type: 'FIXE' | 'POURCENTAGE',
  valeur: number,
  montantPlan: number
): number {
  if (type === 'FIXE') return valeur;
  return (montantPlan * valeur) / 100;
}

/**
 * Vérifie qu'une réduction n'existe pas déjà pour le même assignment
 * (règle métier : 1 seule réduction active par assignment).
 */
async function assertNoDuplicateReduction(
  client: any,
  assignmentScolariteId: string,
  excludeId?: string
) {
  const existing = await client.reduction.findFirst({
    where: {
      assignmentScolariteId,
      ...(excludeId && { NOT: { id: excludeId } }),
    },
    select: { id: true },
  });
  if (existing) {
    throw new AppError(
      'Une réduction existe déjà pour cet assignment. Modifiez-la au lieu d\'en créer une nouvelle.',
      409
    );
  }
}

// ══════════════════════════════════════════
// SERVICE
// ══════════════════════════════════════════

export class ReductionService {
  // ──────────────────────────────────────────
  // CREATE
  // ──────────────────────────────────────────

  async create(ctx: ReductionContext, input: CreateReductionInput) {
    const client = await getClient(ctx.schemaName);

    // 1. Vérifier l'élève
    const eleve = await client.eleve.findUnique({
      where: { id: input.eleveId },
      select: { id: true, statut: true },
    });
    if (!eleve) throw new AppError('Élève introuvable', 404);
    if (eleve.statut === 'ARCHIVE') {
      throw new AppError(
        'Impossible d\'appliquer une réduction à un élève archivé',
        400
      );
    }

    // 2. Vérifier l'assignment
    const assignment = await client.assignmentScolarite.findUnique({
      where: { id: input.assignmentScolariteId },
      include: {
        planScolarite: {
          select: { id: true, montantTotal: true, devise: true },
        },
      },
    });
    if (!assignment) {
      throw new AppError('Assignment de scolarité introuvable', 404);
    }

    // 3. Vérifier que l'assignment appartient bien à l'élève
    if (assignment.eleveId !== input.eleveId) {
      throw new AppError(
        'L\'assignment ne correspond pas à l\'élève sélectionné',
        400
      );
    }

    // 4. Vérifier qu'il n'y a pas déjà une réduction
    await assertNoDuplicateReduction(client, input.assignmentScolariteId);

    // 5. Vérifier l'approbateur
    const approbateur = await client.utilisateur.findUnique({
      where: { id: input.approuvePar },
      select: { id: true, role: true, estActif: true },
    });
    if (!approbateur) {
      throw new AppError('Approbateur introuvable', 404);
    }
    if (!approbateur.estActif) {
      throw new AppError('L\'approbateur n\'est pas actif', 400);
    }

    // 6. Vérifier la cohérence montant
    const montantPlan = Number(
      assignment.montantPersonnalise ??
        assignment.planScolarite?.montantTotal ??
        0
    );
    const montantReduction = calculerMontantReduction(
      input.type,
      input.valeur,
      montantPlan
    );

    if (montantReduction > montantPlan + TOLERANCE) {
      throw new AppError(
        `La réduction (${montantReduction}) dépasse le montant du plan (${montantPlan})`,
        400
      );
    }

    // 7. Créer la réduction
    try {
      return await client.reduction.create({
        data: {
          eleveId: input.eleveId,
          assignmentScolariteId: input.assignmentScolariteId,
          type: input.type,
          valeur: input.valeur,
          motif: input.motif.trim(),
          approuvePar: input.approuvePar,
          approuveLe: input.approuveLe
            ? new Date(input.approuveLe)
            : new Date(),
        },
        include: reductionInclude,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError('Une réduction existe déjà', 409);
      }
      if (err?.code === 'P2003') {
        throw new AppError(
          'Référence invalide (élève, assignment ou approbateur)',
          400
        );
      }
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // LIST
  // ──────────────────────────────────────────

  async findAll(ctx: ReductionContext, q: ListReductionsQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};

    if (q.search) {
      where.OR = [
        { motif: { contains: q.search, mode: 'insensitive' } },
        { eleve: { nom: { contains: q.search, mode: 'insensitive' } } },
        { eleve: { prenom: { contains: q.search, mode: 'insensitive' } } },
        { eleve: { matricule: { contains: q.search, mode: 'insensitive' } } },
      ];
    }

    if (q.eleveId) where.eleveId = q.eleveId;
    if (q.assignmentScolariteId)
      where.assignmentScolariteId = q.assignmentScolariteId;
    if (q.type) where.type = q.type;
    if (q.approuvePar) where.approuvePar = q.approuvePar;

    if (q.dateDebut || q.dateFin) {
      where.approuveLe = {};
      if (q.dateDebut) where.approuveLe.gte = new Date(q.dateDebut);
      if (q.dateFin) where.approuveLe.lte = new Date(q.dateFin);
    }

    const allowedSort = ['createdAt', 'valeur', 'approuveLe'];
    const sortBy = allowedSort.includes(q.sortBy)
      ? q.sortBy
      : 'createdAt';
    const sortOrder = q.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      client.reduction.count({ where }),
      client.reduction.findMany({
        where,
        include: reductionInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ]);

    // Enrichir avec montant calculé
    const dataEnrichie = data.map((r: any) => {
      const montantPlan = Number(
        r.assignmentScolarite?.montantPersonnalise ??
          r.assignmentScolarite?.planScolarite?.montantTotal ??
          0
      );
      const montantReduction = calculerMontantReduction(
        r.type,
        r.valeur,
        montantPlan
      );
      return {
        ...r,
        _meta: {
          montantPlan,
          montantReduction,
          montantNet: Math.max(0, montantPlan - montantReduction),
        },
      };
    });

    return {
      data: dataEnrichie,
      pagination: {
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit) || 1,
      },
    };
  }

  // ──────────────────────────────────────────
  // GET BY ID
  // ──────────────────────────────────────────

  async findById(ctx: ReductionContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const reduction = await client.reduction.findUnique({
      where: { id },
      include: reductionInclude,
    });

    if (!reduction) throw new AppError('Réduction introuvable', 404);

    const montantPlan = Number(
      reduction.assignmentScolarite?.montantPersonnalise ??
        reduction.assignmentScolarite?.planScolarite?.montantTotal ??
        0
    );
    const montantReduction = calculerMontantReduction(
      reduction.type,
      reduction.valeur,
      montantPlan
    );

    return {
      ...reduction,
      _meta: {
        montantPlan,
        montantReduction,
        montantNet: Math.max(0, montantPlan - montantReduction),
      },
    };
  }

  // ──────────────────────────────────────────
  // GET BY ELEVE
  // ──────────────────────────────────────────

  async findByEleve(ctx: ReductionContext, eleveId: string) {
    const client = await getClient(ctx.schemaName);

    const eleve = await client.eleve.findUnique({
      where: { id: eleveId },
      select: { id: true },
    });
    if (!eleve) throw new AppError('Élève introuvable', 404);

    const reductions = await client.reduction.findMany({
      where: { eleveId },
      include: reductionInclude,
      orderBy: { createdAt: 'desc' },
    });

    const totalReduction = reductions.reduce((s: number, r: any) => {
      const montantPlan = Number(
        r.assignmentScolarite?.montantPersonnalise ??
          r.assignmentScolarite?.planScolarite?.montantTotal ??
          0
      );
      return s + calculerMontantReduction(r.type, r.valeur, montantPlan);
    }, 0);

    return { reductions, totalReduction };
  }

  // ──────────────────────────────────────────
  // UPDATE
  // ──────────────────────────────────────────

  async update(
    ctx: ReductionContext,
    id: string,
    input: UpdateReductionInput
  ) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.reduction.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new AppError('Réduction introuvable', 404);

    const patch: any = {};
    if (input.type !== undefined) patch.type = input.type;
    if (input.valeur !== undefined) patch.valeur = input.valeur;
    if (input.motif !== undefined) patch.motif = input.motif.trim();
    if (input.approuvePar !== undefined)
      patch.approuvePar = input.approuvePar;
    if (input.approuveLe !== undefined)
      patch.approuveLe = input.approuveLe
        ? new Date(input.approuveLe)
        : null;

    return client.reduction.update({
      where: { id },
      data: patch,
      include: reductionInclude,
    });
  }

  // ──────────────────────────────────────────
  // HARD DELETE
  // ──────────────────────────────────────────

  async hardDelete(ctx: ReductionContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.reduction.findUnique({
      where: { id },
      select: { id: true, motif: true },
    });
    if (!existing) throw new AppError('Réduction introuvable', 404);

    await client.reduction.delete({ where: { id } });
    return { id, message: 'Réduction supprimée définitivement' };
  }

  // ──────────────────────────────────────────
  // STATS
  // ──────────────────────────────────────────

  async stats(
    ctx: ReductionContext,
    filters?: { dateDebut?: string; dateFin?: string }
  ) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};
    if (filters?.dateDebut || filters?.dateFin) {
      where.approuveLe = {};
      if (filters.dateDebut)
        where.approuveLe.gte = new Date(filters.dateDebut);
      if (filters.dateFin)
        where.approuveLe.lte = new Date(filters.dateFin);
    }

    const [total, parType] = await Promise.all([
      client.reduction.count({ where }),
      client.reduction.groupBy({
        by: ['type'],
        where,
        _count: { _all: true },
        _sum: { valeur: true },
      }),
    ]);

    // Montant total réduit (recaculé)
    const allReductions = await client.reduction.findMany({
      where,
      include: {
        assignmentScolarite: {
          select: {
            montantPersonnalise: true,
            planScolarite: { select: { montantTotal: true } },
          },
        },
      },
    });

    const montantTotalReduit = allReductions.reduce(
      (s: number, r: any) => {
        const montantPlan = Number(
          r.assignmentScolarite?.montantPersonnalise ??
            r.assignmentScolarite?.planScolarite?.montantTotal ??
            0
        );
        return s + calculerMontantReduction(r.type, r.valeur, montantPlan);
      },
      0
    );

    return {
      totalReductions: total,
      montantTotalReduit,
      parType: parType.map((row: any) => ({
        type: row.type,
        nombre: row._count._all,
        valeurTotale: row._sum.valeur ?? 0,
      })),
    };
  }
}

export const reductionService = new ReductionService();