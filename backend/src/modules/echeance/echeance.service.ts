// backend/src/modules/echeance/echeance.service.ts

import { getTenantClient } from '../../config/tenant-db.js';
import { AppError } from '../../utils/AppError.js';
import type {
  CreateEcheanceInput,
  UpdateEcheanceInput,
  ListEcheancesQuery,
} from './echeance.validation.js';

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
          eleveId: true,
          moyen: true,
        },
      },
    },
  },
  _count: {
    select: { allocationsPaiement: true },
  },
} as const;

// ──────────────────────────────────────────
// TYPES INTERNES
// ──────────────────────────────────────────

export type StatutEleveEcheance =
  | 'PAYEE'
  | 'PARTIELLE'
  | 'IMPAYEE'
  | 'EN_RETARD';

export type StatutGlobalEcheance =
  | 'SOLDE'
  | 'EN_COURS'
  | 'IMPAYE'
  | 'EN_RETARD';

interface FindElevesQuery {
  page?: number;
  limit?: number;
  search?: string;
  statut?: StatutEleveEcheance | 'all';
  sortBy?: 'restant' | 'nom' | 'statut' | 'paye';
  sortOrder?: 'asc' | 'desc';
}

// ──────────────────────────────────────────
// HELPERS INTERNES
// ──────────────────────────────────────────

/**
 * Calcule le statut d'un élève sur une échéance donnée.
 */
function computeStatutEleve(params: {
  duTheorique: number;
  montantPaye: number;
  joursRetard: number;
}): StatutEleveEcheance {
  const { duTheorique, montantPaye, joursRetard } = params;
  const restant = Math.max(0, duTheorique - montantPaye);
  if (restant <= 0.01) return 'PAYEE';
  if (montantPaye > 0.01) return 'PARTIELLE';
  if (joursRetard > 0) return 'EN_RETARD';
  return 'IMPAYEE';
}

/**
 * Calcule le statut GLOBAL d'une échéance à partir des élèves.
 * → C'est la VRAIE source de vérité : estPayee sur Echeance est un cache
 *   qui peut être stale, alors que les allocations sont la réalité.
 */
function computeStatutGlobal(stats: {
  nombreEleves: number;
  nombrePayees: number;
  nombrePartielles: number;
  nombreImpayees: number;
  nombreEnRetard: number;
}): StatutGlobalEcheance {
  if (stats.nombreEleves === 0) return 'IMPAYE';
  if (stats.nombrePayees === stats.nombreEleves) return 'SOLDE';
  if (stats.nombreEnRetard > 0) return 'EN_RETARD';
  if (stats.nombrePayees + stats.nombrePartielles > 0) return 'EN_COURS';
  return 'IMPAYE';
}

// ──────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────

export class EcheanceService {
  // ══════════════════════════════════════════
  // CREATE
  // ══════════════════════════════════════════

  async create(ctx: EcheanceContext, input: CreateEcheanceInput) {
    const client = await getClient(ctx.schemaName);

    const plan = await client.planScolarite.findUnique({
      where: { id: input.planScolariteId },
      select: { id: true, montantTotal: true, devise: true },
    });
    if (!plan) throw new AppError('Plan de scolarité introuvable', 404);

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

    const totalActuel = await client.echeance.aggregate({
      where: { planScolariteId: input.planScolariteId },
      _sum: { montant: true },
    });
    const nouveauTotal = (totalActuel._sum.montant ?? 0) + input.montant;

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

  // ══════════════════════════════════════════
  // LIST — avec stats rapides de chaque échéance
  // ══════════════════════════════════════════

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

    // 🆕 Pour chaque échéance, ajouter le nombre d'élèves du plan + montant total attendu
    const planIds = [
      ...new Set(data.map((e: any) => e.planScolariteId)),
    ] as string[];

    const assignmentsByPlan = await client.assignmentScolarite.groupBy({
      by: ['planScolariteId'],
      where: { planScolariteId: { in: planIds } },
      _count: { _all: true },
    });

    const countByPlan = new Map<string, number>(
      assignmentsByPlan.map((a: any) => [a.planScolariteId, a._count._all])
    );

    const enriched = data.map((e: any) => {
      const nombreEleves = countByPlan.get(e.planScolariteId) ?? 0;
      return {
        ...e,
        _meta: {
          nombreEleves,
          montantAttendu: nombreEleves * e.montant,
          devise: e.planScolarite?.devise ?? 'XOF',
        },
      };
    });

    const totalMontant = await client.echeance.aggregate({
      where,
      _sum: { montant: true },
    });

    return {
      data: enriched,
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

  // ══════════════════════════════════════════
  // GET BY ID
  // ══════════════════════════════════════════

  async findById(ctx: EcheanceContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const echeance = await client.echeance.findUnique({
      where: { id },
      include: echeanceInclude,
    });

    if (!echeance) throw new AppError('Échéance introuvable', 404);
    return echeance;
  }

  // ══════════════════════════════════════════
  // GET BY PLAN
  // ══════════════════════════════════════════

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

  // ══════════════════════════════════════════
  // 🆕 GET ELEVES D'UNE ÉCHÉANCE (vue classe)
  // ══════════════════════════════════════════

  async findEleves(
    ctx: EcheanceContext,
    id: string,
    q: FindElevesQuery = {}
  ) {
    const client = await getClient(ctx.schemaName);
    const page = q.page && q.page > 0 ? q.page : 1;
    const limit = q.limit && q.limit > 0 ? Math.min(q.limit, 200) : 50;

    // ─── 1. Charger l'échéance + plan + classe + assignments ───
    const echeance = await client.echeance.findUnique({
      where: { id },
      include: {
        planScolarite: {
          include: {
            anneeScolaire: {
              select: { id: true, nom: true, estActive: true },
            },
            niveau: { select: { id: true, nom: true, code: true } },
            classe: { select: { id: true, nom: true, code: true } },
            assignments: {
              include: {
                eleve: {
                  select: {
                    id: true,
                    matricule: true,
                    prenom: true,
                    nom: true,
                    sexe: true,
                    photo: true,
                    statut: true,
                  },
                },
                classe: { select: { id: true, nom: true, code: true } },
                reductions: {
                  select: { id: true, type: true, valeur: true },
                },
              },
            },
          },
        },
        allocationsPaiement: {
          include: {
            paiement: {
              select: {
                id: true,
                reference: true,
                datePaiement: true,
                statut: true,
                eleveId: true,
                moyen: true,
              },
            },
          },
        },
      },
    });

    if (!echeance) throw new AppError('Échéance introuvable', 404);

    const devise = echeance.planScolarite.devise || 'XOF';
    const montantEcheance = echeance.montant;

    // ─── 2. Regrouper les allocations par élève (COMPLET uniquement) ───
    const allocationsParEleve = new Map<
      string,
      {
        montant: number;
        paiements: {
          id: string;
          reference: string;
          datePaiement: Date;
          moyen: string;
          montant: number;
        }[];
      }
    >();

    for (const alloc of echeance.allocationsPaiement) {
      if (alloc.paiement?.statut !== 'COMPLET') continue;
      const eleveId = alloc.paiement.eleveId;
      if (!eleveId) continue;
      const entry = allocationsParEleve.get(eleveId) ?? {
        montant: 0,
        paiements: [],
      };
      entry.montant += alloc.montant;
      entry.paiements.push({
        id: alloc.paiement.id,
        reference: alloc.paiement.reference,
        datePaiement: alloc.paiement.datePaiement,
        moyen: alloc.paiement.moyen,
        montant: alloc.montant,
      });
      allocationsParEleve.set(eleveId, entry);
    }

    // ─── 3. Calcul du retard global ───
    const maintenant = Date.now();
    const dateLimiteMs = new Date(echeance.dateLimite).getTime();
    const joursRetard =
      maintenant > dateLimiteMs
        ? Math.floor((maintenant - dateLimiteMs) / (1000 * 60 * 60 * 24))
        : 0;

    // ─── 4. Construire la liste des élèves (1 ligne = 1 assignment) ───
    const eleves = echeance.planScolarite.assignments.map((a: any) => {
      const alloc = allocationsParEleve.get(a.eleveId) ?? {
        montant: 0,
        paiements: [],
      };

      const totalReduction = (a.reductions ?? []).reduce(
        (s: number, r: any) => {
          if (r.type === 'FIXE') return s + r.valeur;
          if (r.type === 'POURCENTAGE')
            return s + (montantEcheance * r.valeur) / 100;
          return s;
        },
        0
      );
      const duTheorique = Math.max(0, montantEcheance - totalReduction);
      const montantPaye = Math.min(alloc.montant, duTheorique);
      const restant = Math.max(0, duTheorique - montantPaye);

      const statut = computeStatutEleve({
        duTheorique,
        montantPaye,
        joursRetard,
      });

      return {
        assignmentId: a.id,
        eleve: a.eleve,
        classe: a.classe,
        montantDu: montantEcheance,
        duTheorique,
        totalReduction,
        montantPaye,
        restant,
        statut,
        enRetard: restant > 0.01 && joursRetard > 0,
        joursRetard: restant > 0.01 ? joursRetard : 0,
        paiements: alloc.paiements.sort(
          (x, y) =>
            new Date(y.datePaiement).getTime() -
            new Date(x.datePaiement).getTime()
        ),
      };
    });

    // ─── 5. Filtres serveur ───
    let filtered = eleves;
    if (q.search) {
      const s = q.search.toLowerCase();
      filtered = filtered.filter(
        (e: any) =>
          e.eleve?.nom?.toLowerCase().includes(s) ||
          e.eleve?.prenom?.toLowerCase().includes(s) ||
          e.eleve?.matricule?.toLowerCase().includes(s)
      );
    }
    if (q.statut && q.statut !== 'all') {
      filtered = filtered.filter((e: any) => e.statut === q.statut);
    }

    // ─── 6. Tri ───
    const sortBy = q.sortBy ?? 'restant';
    const sortOrder = q.sortOrder ?? 'desc';
    const dir = sortOrder === 'asc' ? 1 : -1;

    filtered.sort((a: any, b: any) => {
      // Les retards toujours en premier
      if (a.enRetard !== b.enRetard) return a.enRetard ? -1 : 1;
      if (sortBy === 'nom') {
        const an = `${a.eleve?.nom ?? ''} ${a.eleve?.prenom ?? ''}`.toLowerCase();
        const bn = `${b.eleve?.nom ?? ''} ${b.eleve?.prenom ?? ''}`.toLowerCase();
        return an.localeCompare(bn) * dir;
      }
      if (sortBy === 'paye') return (a.montantPaye - b.montantPaye) * dir;
      if (sortBy === 'statut') return a.statut.localeCompare(b.statut) * dir;
      return (a.restant - b.restant) * dir;
    });

    const total = filtered.length;
    const data = filtered.slice((page - 1) * limit, page * limit);

    // ─── 7. Statistiques globales (sur TOUS les élèves) ───
    const montantAttendu = eleves.reduce(
      (s: number, e: any) => s + e.duTheorique,
      0
    );
    const montantEncaisse = eleves.reduce(
      (s: number, e: any) => s + e.montantPaye,
      0
    );
    const montantRestant = eleves.reduce(
      (s: number, e: any) => s + e.restant,
      0
    );

    const nombrePayees = eleves.filter((e: any) => e.statut === 'PAYEE').length;
    const nombrePartielles = eleves.filter(
      (e: any) => e.statut === 'PARTIELLE'
    ).length;
    const nombreImpayees = eleves.filter(
      (e: any) => e.statut === 'IMPAYEE'
    ).length;
    const nombreEnRetard = eleves.filter(
      (e: any) => e.statut === 'EN_RETARD'
    ).length;

    const statutGlobal = computeStatutGlobal({
      nombreEleves: eleves.length,
      nombrePayees,
      nombrePartielles,
      nombreImpayees,
      nombreEnRetard,
    });

    const stats = {
      nombreEleves: eleves.length,
      montantAttendu,
      montantEncaisse,
      montantRestant,
      tauxRecouvrement:
        montantAttendu > 0
          ? Math.round((montantEncaisse / montantAttendu) * 100)
          : 0,
      nombrePayees,
      nombrePartielles,
      nombreImpayees,
      nombreEnRetard,
      joursRetard,
      dateLimite: echeance.dateLimite,
      devise,
      statutGlobal,
      // pourcentages par statut (utiles pour les barres visuelles)
      pourcentagePayees:
        eleves.length > 0
          ? Math.round((nombrePayees / eleves.length) * 100)
          : 0,
      pourcentagePartielles:
        eleves.length > 0
          ? Math.round((nombrePartielles / eleves.length) * 100)
          : 0,
      pourcentageImpayees:
        eleves.length > 0
          ? Math.round((nombreImpayees / eleves.length) * 100)
          : 0,
      pourcentageEnRetard:
        eleves.length > 0
          ? Math.round((nombreEnRetard / eleves.length) * 100)
          : 0,
    };

    return {
      echeance: {
        id: echeance.id,
        nom: echeance.nom,
        montant: echeance.montant,
        dateLimite: echeance.dateLimite,
        ordre: echeance.ordre,
        estPayee: echeance.estPayee,
        statutGlobal,
        planScolarite: {
          id: echeance.planScolarite.id,
          nom: echeance.planScolarite.nom,
          montantTotal: echeance.planScolarite.montantTotal,
          devise,
          anneeScolaire: echeance.planScolarite.anneeScolaire,
          niveau: echeance.planScolarite.niveau,
          classe: echeance.planScolarite.classe,
        },
      },
      eleves: data,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // ══════════════════════════════════════════
  // UPDATE
  // ══════════════════════════════════════════

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

  // ══════════════════════════════════════════
  // HARD DELETE
  // ══════════════════════════════════════════

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