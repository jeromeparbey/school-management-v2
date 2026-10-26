// backend/src/modules/echeance/echeance.service.ts

import { getTenantClient } from '../../config/tenant-db';
import { AppError } from '../../utils/AppError';
import type {
  CreateEcheanceInput,
  UpdateEcheanceInput,
  ListEcheancesQuery,
} from './echeance.validation';

export interface EcheanceContext {
  schemaName: string;
  etablissementId: string;
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

// ──────────────────────────────────────────
// INCLUDES
// ──────────────────────────────────────────

const echeanceInclude = {
  planScolarite: {
    select: {
      id: true,
      nom: true,
      montantTotal: true,
      devise: true,
      anneeScolaireId: true,
    },
  },
  allocationsPaiement: {
    select: {
      id: true,
      montant: true,
      paiementId: true,
      paiement: {
        select: {
          id: true,
          reference: true,
          datePaiement: true,
          statut: true,
        },
      },
    },
  },
  _count: {
    select: { allocationsPaiement: true },
  },
} as const;

// ──────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────

export class EcheanceService {
  // ──────────────────────────────────────────
  // CREATE
  // ──────────────────────────────────────────

  async create(ctx: EcheanceContext, input: CreateEcheanceInput) {
    const client = await getClient(ctx.schemaName);

    // Vérifier le plan de scolarité
    const plan = await client.planScolarite.findUnique({
      where: { id: input.planScolariteId },
      select: { id: true, montantTotal: true, devise: true },
    });
    if (!plan) throw new AppError('Plan de scolarité introuvable', 404);

    // Vérifier l'unicité de l'ordre dans le plan
    const dup = await client.echeance.findFirst({
      where: {
        planScolariteId: input.planScolariteId,
        ordre: input.ordre ?? 0,
      },
      select: { id: true },
    });
    if (dup) {
      throw new AppError(
        `Une échéance avec l'ordre ${input.ordre ?? 0} existe déjà pour ce plan`,
        409
      );
    }

    // Vérifier que la somme des échéances ne dépasse pas le montant total du plan
    const totalActuel = await client.echeance.aggregate({
      where: { planScolariteId: input.planScolariteId },
      _sum: { montant: true },
    });
    const nouveauTotal =
      (totalActuel._sum.montant ?? 0) + input.montant;

    if (nouveauTotal > plan.montantTotal + 0.01) {
      throw new AppError(
        `Le total des échéances (${nouveauTotal}) dépasse le montant du plan (${plan.montantTotal} ${plan.devise})`,
        400
      );
    }

    return client.echeance.create({
      data: {
        planScolariteId: input.planScolariteId,
        nom: input.nom.trim(),
        montant: input.montant,
        dateLimite: input.dateLimite,
        ordre: input.ordre ?? 0,
      },
      include: echeanceInclude,
    });
  }

  // ──────────────────────────────────────────
  // LIST
  // ──────────────────────────────────────────

  async findAll(ctx: EcheanceContext, q: ListEcheancesQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};
    if (q.search) {
      where.nom = { contains: q.search, mode: 'insensitive' };
    }
    if (q.planScolariteId) where.planScolariteId = q.planScolariteId;
    if (q.estPayee !== undefined) where.estPayee = q.estPayee;

    const allowedSort = ['ordre', 'nom', 'montant', 'dateLimite', 'createdAt'];
    const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'ordre';
    const sortOrder = q.sortOrder === 'desc' ? 'desc' : 'asc';

    const [total, data] = await Promise.all([
      client.echeance.count({ where }),
      client.echeance.findMany({
        where,
        include: echeanceInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ]);

    // Résumé des montants
    const totalMontant = await client.echeance.aggregate({
      where,
      _sum: { montant: true },
    });

    return {
      data,
      pagination: {
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit) || 1,
      },
      summary: {
        totalMontant: totalMontant._sum.montant ?? 0,
      },
    };
  }

  // ──────────────────────────────────────────
  // GET BY ID
  // ──────────────────────────────────────────

  async findById(ctx: EcheanceContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const echeance = await client.echeance.findUnique({
      where: { id },
      include: echeanceInclude,
    });

    if (!echeance) throw new AppError('Échéance introuvable', 404);
    return echeance;
  }

  // ──────────────────────────────────────────
  // GET BY PLAN
  // ──────────────────────────────────────────

  async findByPlan(ctx: EcheanceContext, planScolariteId: string) {
    const client = await getClient(ctx.schemaName);

    const plan = await client.planScolarite.findUnique({
      where: { id: planScolariteId },
      select: { id: true, nom: true, montantTotal: true, devise: true },
    });
    if (!plan) throw new AppError('Plan de scolarité introuvable', 404);

    const echeances = await client.echeance.findMany({
      where: { planScolariteId },
      include: echeanceInclude,
      orderBy: { ordre: 'asc' },
    });

    const totalEcheances = echeances.reduce(
      (sum: number, e: any) => sum + e.montant,
      0
    );
    const montantCouvert = echeances
      .filter((e: any) => e.estPayee)
      .reduce((sum: number, e: any) => sum + e.montant, 0);

    return {
      plan,
      echeances,
      stats: {
        nombreEcheances: echeances.length,
        totalEcheances,
        montantRestantAPlanifier: Math.max(
          0,
          plan.montantTotal - totalEcheances
        ),
        montantCouvert,
        pourcentageCouvert:
          plan.montantTotal > 0
            ? Math.round((montantCouvert / plan.montantTotal) * 100)
            : 0,
      },
    };
  }

  // ──────────────────────────────────────────
  // UPDATE
  // ──────────────────────────────────────────

  async update(ctx: EcheanceContext, id: string, input: UpdateEcheanceInput) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.echeance.findUnique({
      where: { id },
      select: {
        id: true,
        planScolariteId: true,
        ordre: true,
        montant: true,
        estPayee: true,
      },
    });
    if (!existing) throw new AppError('Échéance introuvable', 404);

    // Vérifier l'ordre unique si modifié
    if (input.ordre !== undefined && input.ordre !== existing.ordre) {
      const dup = await client.echeance.findFirst({
        where: {
          planScolariteId: existing.planScolariteId,
          ordre: input.ordre,
          NOT: { id },
        },
        select: { id: true },
      });
      if (dup) {
        throw new AppError(
          `Une échéance avec l'ordre ${input.ordre} existe déjà`,
          409
        );
      }
    }

    // Vérifier le total si montant modifié
    if (input.montant !== undefined && input.montant !== existing.montant) {
      const plan = await client.planScolarite.findUnique({
        where: { id: existing.planScolariteId },
        select: { montantTotal: true, devise: true },
      });
      if (!plan) throw new AppError('Plan de scolarité introuvable', 404);

      const totalActuel = await client.echeance.aggregate({
        where: {
          planScolariteId: existing.planScolariteId,
          NOT: { id },
        },
        _sum: { montant: true },
      });
      const nouveauTotal = (totalActuel._sum.montant ?? 0) + input.montant;

      if (nouveauTotal > plan.montantTotal + 0.01) {
        throw new AppError(
          `Le total des échéances (${nouveauTotal}) dépasse le montant du plan (${plan.montantTotal} ${plan.devise})`,
          400
        );
      }
    }

    const patch: any = {};
    if (input.nom !== undefined) patch.nom = input.nom.trim();
    if (input.montant !== undefined) patch.montant = input.montant;
    if (input.dateLimite !== undefined) patch.dateLimite = input.dateLimite;
    if (input.ordre !== undefined) patch.ordre = input.ordre;

    return client.echeance.update({
      where: { id },
      data: patch,
      include: echeanceInclude,
    });
  }

  // ──────────────────────────────────────────
  // HARD DELETE
  // ──────────────────────────────────────────

  async hardDelete(ctx: EcheanceContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.echeance.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        montant: true,
        _count: { select: { allocationsPaiement: true } },
      },
    });
    if (!existing) throw new AppError('Échéance introuvable', 404);

    // Vérifier si des paiements sont rattachés
    if (existing._count.allocationsPaiement > 0) {
      throw new AppError(
        `Suppression impossible : ${existing._count.allocationsPaiement} paiement(s) rattaché(s) à cette échéance. Annulez les paiements d'abord.`,
        409
      );
    }

    await client.echeance.delete({ where: { id } });
    return {
      id,
      message: `Échéance "${existing.nom}" supprimée définitivement`,
    };
  }
}

export const echeanceService = new EcheanceService();