// backend/src/modules/paiement/paiement.service.ts

import { getTenantClient } from '../../config/tenant-db';
import { AppError } from '../../utils/AppError';
import type {
  CreatePaiementInput,
  UpdatePaiementInput,
  AnnulerPaiementInput,
  ListPaiementsQuery,
} from './paiement.validation';

export interface PaiementContext {
  schemaName: string;
  etablissementId: string;
  userId: string;               // Caissier (utilisateur qui encaisse)
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

// ──────────────────────────────────────────
// GÉNÉRATION DE RÉFÉRENCE UNIQUE
// ──────────────────────────────────────────

async function generateReference(client: any): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const prefix = `PAY-${year}${month}-`;

  const last = await client.paiement.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: 'desc' },
    select: { reference: true },
  });

  let next = 1;
  if (last?.reference) {
    const parts = last.reference.split('-');
    next = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}${String(next).padStart(6, '0')}`;
}

// ──────────────────────────────────────────
// INCLUDES PARTAGÉS
// ──────────────────────────────────────────

const paiementInclude = {
  eleve: {
    select: {
      id: true,
      matricule: true,
      prenom: true,
      nom: true,
      sexe: true,
      photo: true,
      statut: true,
      // 🆕 Inscription active pour récupérer la classe
      inscriptions: {
        where: { estActive: true },
        select: {
          id: true,
          classeId: true,
          classe: { select: { id: true, nom: true, code: true } },
        },
        take: 1,
      },
    },
  },
  caissier: {
    select: {
      id: true,
      prenom: true,
      nom: true,
      email: true,
    },
  },
  annuleParUtilisateur: {
    select: {
      id: true,
      prenom: true,
      nom: true,
    },
  },
  allocations: {
    include: {
      echeance: {
        select: {
          id: true,
          nom: true,
          montant: true,
          dateLimite: true,
          ordre: true,
          estPayee: true,
        },
      },
    },
  },
  recu: {
    select: {
      id: true,
      numeroRecu: true,
      cheminPDF: true,
    },
  },
  assignment: {
    select: {
      id: true,
      planScolariteId: true,
      montantPersonnalise: true,
    },
  },
} as const;

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

/**
 * Retourne le montant déjà payé (cumul des allocations de paiements COMPLETS)
 * sur une échéance donnée, en excluant éventuellement un paiement en cours.
 */
async function getMontantPayeSurEcheance(
  client: any,
  echeanceId: string,
  excludePaiementId?: string
): Promise<number> {
  const agg = await client.allocationPaiement.aggregate({
    where: {
      echeanceId,
      ...(excludePaiementId && { paiementId: { not: excludePaiementId } }),
      paiement: { statut: 'COMPLET' },
    },
    _sum: { montant: true },
  });
  return agg._sum.montant ?? 0;
}

/**
 * 🆕 Extrait la classe active d'un élève depuis ses inscriptions
 */
function extractClasseActive(eleve: any): {
  classeId: string | null;
  classeNom: string | null;
  classeCode: string | null;
} {
  const ins = eleve?.inscriptions?.find((i: any) => i.classe) ?? null;
  return {
    classeId: ins?.classeId ?? null,
    classeNom: ins?.classe?.nom ?? null,
    classeCode: ins?.classe?.code ?? null,
  };
}

/**
 * 🆕 Enrichit un paiement avec les infos de classe à la racine
 */
function enrichirPaiementAvecClasse(paiement: any) {
  if (!paiement) return paiement;
  const { classeId, classeNom, classeCode } = extractClasseActive(paiement.eleve);
  return {
    ...paiement,
    classeId,
    classeNom,
    classeCode,
  };
}

// ──────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────

export class PaiementService {
  // ──────────────────────────────────────────
  // CREATE
  // ──────────────────────────────────────────

  async create(ctx: PaiementContext, input: CreatePaiementInput) {
    const client = await getClient(ctx.schemaName);

    // 1. Vérifier l'élève
    const eleve = await client.eleve.findUnique({
      where: { id: input.eleveId },
      select: { id: true, statut: true, prenom: true, nom: true },
    });
    if (!eleve) throw new AppError('Élève introuvable', 404);
    if (eleve.statut === 'ARCHIVE') {
      throw new AppError(
        "Impossible d'encaisser un paiement pour un élève archivé",
        400
      );
    }

    // 2. Validation des allocations (partiels autorisés)
    if (input.allocations && input.allocations.length > 0) {
      const totalAlloue = input.allocations.reduce(
        (sum, a) => sum + a.montant,
        0
      );

      // Seule règle stricte : ne pas dépasser le montant
      if (totalAlloue > input.montant + 0.01) {
        throw new AppError(
          `Le total des allocations (${totalAlloue}) ne peut pas dépasser le montant du paiement (${input.montant})`,
          400
        );
      }

      // Vérifier chaque échéance
      for (const alloc of input.allocations) {
        if (alloc.montant <= 0) {
          throw new AppError(
            `Montant d'allocation invalide pour l'échéance ${alloc.echeanceId}`,
            400
          );
        }

        const echeance = await client.echeance.findUnique({
          where: { id: alloc.echeanceId },
          select: { id: true, nom: true, montant: true, estPayee: true },
        });
        if (!echeance) {
          throw new AppError(
            `Échéance introuvable : ${alloc.echeanceId}`,
            404
          );
        }

        const dejaPaye = await getMontantPayeSurEcheance(
          client,
          alloc.echeanceId
        );
        const restantDu = Math.max(0, echeance.montant - dejaPaye);

        if (restantDu <= 0.01) {
          throw new AppError(
            `L'échéance "${echeance.nom}" est déjà entièrement payée`,
            400
          );
        }

        if (alloc.montant > restantDu + 0.01) {
          throw new AppError(
            `L'allocation sur "${echeance.nom}" (${alloc.montant}) dépasse le restant dû (${restantDu})`,
            400
          );
        }
      }
    }

    // 3. Vérifier l'assignment
    if (input.assignmentId) {
      const assignment = await client.assignmentScolarite.findUnique({
        where: { id: input.assignmentId },
        select: { id: true },
      });
      if (!assignment) {
        throw new AppError('Assignment de scolarité introuvable', 404);
      }
    }

    // 4. Générer la référence
    const reference = await generateReference(client);

    // 5. Transaction
    try {
      const result = await client.$transaction(async (tx: any) => {
        const paiement = await tx.paiement.create({
          data: {
            reference,
            eleveId: input.eleveId,
            montant: input.montant,
            datePaiement: input.datePaiement
              ? new Date(input.datePaiement)
              : new Date(),
            moyen: input.moyen,
            referenceMoyen: input.referenceMoyen ?? null,
            caissierId: ctx.userId,
            notes: input.notes ?? null,
            statut: 'COMPLET',
            assignmentId: input.assignmentId ?? null,
          },
        });

        // Allocations
        if (input.allocations && input.allocations.length > 0) {
          await tx.allocationPaiement.createMany({
            data: input.allocations.map((a) => ({
              paiementId: paiement.id,
              echeanceId: a.echeanceId,
              montant: a.montant,
            })),
          });

          for (const alloc of input.allocations) {
            const totalAlloueEcheance =
              await tx.allocationPaiement.aggregate({
                where: {
                  echeanceId: alloc.echeanceId,
                  paiement: { statut: 'COMPLET' },
                },
                _sum: { montant: true },
              });

            const echeance = await tx.echeance.findUnique({
              where: { id: alloc.echeanceId },
              select: { montant: true },
            });

            if (
              echeance &&
              (totalAlloueEcheance._sum.montant ?? 0) >= echeance.montant - 0.01
            ) {
              await tx.echeance.update({
                where: { id: alloc.echeanceId },
                data: { estPayee: true },
              });
            }
          }
        }

        return paiement;
      });

      // 6. Recharger + enrichir
      const paiementComplet = await client.paiement.findUnique({
        where: { id: result.id },
        include: paiementInclude,
      });

      if (!paiementComplet) {
        throw new AppError('Erreur lors du rechargement du paiement', 500);
      }

      // Enrichir chaque allocation
      const allocationsEnrichies = await Promise.all(
        (paiementComplet.allocations ?? []).map(async (alloc: any) => {
          const totalPaye = await getMontantPayeSurEcheance(
            client,
            alloc.echeanceId
          );
          const montantEcheance = alloc.echeance?.montant ?? 0;
          const restant = Math.max(0, montantEcheance - totalPaye);

          return {
            ...alloc,
            _meta: {
              montantEcheance,
              totalPayeApres: totalPaye,
              restantApres: restant,
              estPayeeCompletement: restant <= 0.01,
              estPartielle: totalPaye > 0 && restant > 0.01,
            },
          };
        })
      );

      const totalAlloue = (input.allocations ?? []).reduce(
        (s, a) => s + a.montant,
        0
      );
      const resteNonAlloue = Math.max(0, input.montant - totalAlloue);

      // 🆕 Ajouter la classe à la racine
      const enriched = enrichirPaiementAvecClasse(paiementComplet);

      return {
        ...enriched,
        allocations: allocationsEnrichies,
        _summary: {
          montantPaye: input.montant,
          totalAlloue,
          resteNonAlloue,
          nombreEcheances: (input.allocations ?? []).length,
        },
      };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError('Conflit de référence unique', 409);
      }
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // LIST
  // ──────────────────────────────────────────

  async findAll(ctx: PaiementContext, q: ListPaiementsQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};

    // Recherche texte
    if (q.search) {
      where.OR = [
        { reference: { contains: q.search, mode: 'insensitive' } },
        { eleve: { nom: { contains: q.search, mode: 'insensitive' } } },
        { eleve: { prenom: { contains: q.search, mode: 'insensitive' } } },
        { eleve: { matricule: { contains: q.search, mode: 'insensitive' } } },
        // 🆕 Recherche par classe (nom ou code)
        {
          eleve: {
            inscriptions: {
              some: {
                estActive: true,
                classe: {
                  OR: [
                    { nom: { contains: q.search, mode: 'insensitive' } },
                    { code: { contains: q.search, mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
        },
      ];
    }

    if (q.eleveId) where.eleveId = q.eleveId;
    if (q.moyen) where.moyen = q.moyen;
    if (q.statut) where.statut = q.statut;

    // 🆕 Filtre par classe
    if (q.classeId) {
      where.eleve = {
        ...(where.eleve ?? {}),
        inscriptions: {
          some: { estActive: true, classeId: q.classeId },
        },
      };
    }

    // Filtre dates
    if (q.dateDebut || q.dateFin) {
      where.datePaiement = {};
      if (q.dateDebut) where.datePaiement.gte = new Date(q.dateDebut);
      if (q.dateFin) where.datePaiement.lte = new Date(q.dateFin);
    }

    // Tri
    const allowedSort = ['datePaiement', 'montant', 'createdAt'];
    const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'datePaiement';
    const sortOrder = q.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      client.paiement.count({ where }),
      client.paiement.findMany({
        where,
        include: paiementInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ]);

    const totalMontant = await client.paiement.aggregate({
      where,
      _sum: { montant: true },
    });

    // 🆕 Enrichir chaque paiement avec la classe à la racine
    const dataEnrichie = data.map(enrichirPaiementAvecClasse);

    return {
      data: dataEnrichie,
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

  async findById(ctx: PaiementContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const paiement = await client.paiement.findUnique({
      where: { id },
      include: paiementInclude,
    });

    if (!paiement) throw new AppError('Paiement introuvable', 404);

    const allocationsEnrichies = await Promise.all(
      (paiement.allocations ?? []).map(async (alloc: any) => {
        const totalPaye = await getMontantPayeSurEcheance(
          client,
          alloc.echeanceId
        );
        const montantEcheance = alloc.echeance?.montant ?? 0;
        const restant = Math.max(0, montantEcheance - totalPaye);

        return {
          ...alloc,
          _meta: {
            montantEcheance,
            totalPayeApres: totalPaye,
            restantApres: restant,
            estPayeeCompletement: restant <= 0.01,
            estPartielle: totalPaye > 0 && restant > 0.01,
          },
        };
      })
    );

    const totalAlloue = (paiement.allocations ?? []).reduce(
      (s: number, a: any) => s + a.montant,
      0
    );
    const resteNonAlloue = Math.max(0, paiement.montant - totalAlloue);

    // 🆕 Classe à la racine
    const enriched = enrichirPaiementAvecClasse(paiement);

    return {
      ...enriched,
      allocations: allocationsEnrichies,
      _summary: {
        montantPaye: paiement.montant,
        totalAlloue,
        resteNonAlloue,
        nombreEcheances: (paiement.allocations ?? []).length,
      },
    };
  }

  // ──────────────────────────────────────────
  // GET BY ELEVE
  // ──────────────────────────────────────────

  async findByEleve(ctx: PaiementContext, eleveId: string) {
    const client = await getClient(ctx.schemaName);

    const paiements = await client.paiement.findMany({
      where: { eleveId },
      include: paiementInclude,
      orderBy: { datePaiement: 'desc' },
    });

    const total = paiements
      .filter((p: any) => p.statut === 'COMPLET')
      .reduce((sum: number, p: any) => sum + p.montant, 0);

    const dataEnrichie = paiements.map(enrichirPaiementAvecClasse);

    return { paiements: dataEnrichie, total };
  }

  // ──────────────────────────────────────────
  // UPDATE (notes uniquement)
  // ──────────────────────────────────────────

  async update(ctx: PaiementContext, id: string, input: UpdatePaiementInput) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.paiement.findUnique({
      where: { id },
      select: { id: true, statut: true },
    });
    if (!existing) throw new AppError('Paiement introuvable', 404);
    if (existing.statut === 'ANNULE') {
      throw new AppError('Impossible de modifier un paiement annulé', 400);
    }

    const patch: any = {};
    if (input.notes !== undefined) patch.notes = input.notes;

    return client.paiement.update({
      where: { id },
      data: patch,
      include: paiementInclude,
    });
  }

  // ──────────────────────────────────────────
  // ANNULER
  // ──────────────────────────────────────────

  async annuler(ctx: PaiementContext, id: string, input: AnnulerPaiementInput) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.paiement.findUnique({
      where: { id },
      select: { id: true, statut: true, montant: true },
    });
    if (!existing) throw new AppError('Paiement introuvable', 404);
    if (existing.statut === 'ANNULE') {
      throw new AppError('Ce paiement est déjà annulé', 400);
    }

    await client.$transaction(async (tx: any) => {
      await tx.paiement.update({
        where: { id },
        data: {
          statut: 'ANNULE',
          annuleLe: new Date(),
          motifAnnulation: input.motifAnnulation,
          annulePar: ctx.userId,
        },
      });

      const allocations = await tx.allocationPaiement.findMany({
        where: { paiementId: id },
        select: { echeanceId: true, montant: true },
      });

      for (const alloc of allocations) {
        const totalRestant = await tx.allocationPaiement.aggregate({
          where: {
            echeanceId: alloc.echeanceId,
            paiementId: { not: id },
            paiement: { statut: 'COMPLET' },
          },
          _sum: { montant: true },
        });

        const echeance = await tx.echeance.findUnique({
          where: { id: alloc.echeanceId },
          select: { montant: true },
        });

        const estPayee =
          echeance &&
          (totalRestant._sum.montant ?? 0) >= echeance.montant - 0.01;

        await tx.echeance.update({
          where: { id: alloc.echeanceId },
          data: { estPayee: estPayee ?? false },
        });
      }
    });

    return client.paiement.findUnique({
      where: { id },
      include: paiementInclude,
    });
  }

  // ──────────────────────────────────────────
  // STATISTIQUES
  // ──────────────────────────────────────────

  async stats(
    ctx: PaiementContext,
    filters?: { dateDebut?: string; dateFin?: string }
  ) {
    const client = await getClient(ctx.schemaName);

    const where: any = { statut: 'COMPLET' };
    if (filters?.dateDebut || filters?.dateFin) {
      where.datePaiement = {};
      if (filters.dateDebut)
        where.datePaiement.gte = new Date(filters.dateDebut);
      if (filters.dateFin) where.datePaiement.lte = new Date(filters.dateFin);
    }

    const [total, count, parMoyen] = await Promise.all([
      client.paiement.aggregate({ where, _sum: { montant: true } }),
      client.paiement.count({ where }),
      client.paiement.groupBy({
        by: ['moyen'],
        where,
        _sum: { montant: true },
        _count: { _all: true },
      }),
    ]);

    return {
      totalMontant: total._sum.montant ?? 0,
      nombrePaiements: count,
      parMoyen: parMoyen.map((row: any) => ({
        moyen: row.moyen,
        montant: row._sum.montant ?? 0,
        nombre: row._count._all,
      })),
    };
  }

  // ──────────────────────────────────────────
  // HARD DELETE (rare)
  // ──────────────────────────────────────────

  async hardDelete(ctx: PaiementContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.paiement.findUnique({
      where: { id },
      select: { id: true, statut: true, reference: true },
    });
    if (!existing) throw new AppError('Paiement introuvable', 404);
    if (existing.statut !== 'ANNULE') {
      throw new AppError(
        'Seuls les paiements annulés peuvent être supprimés définitivement',
        400
      );
    }

    const recu = await client.recu.findUnique({
      where: { paiementId: id },
      select: { id: true },
    });

    await client.$transaction(async (tx: any) => {
      if (recu) {
        await tx.recu.delete({ where: { id: recu.id } });
      }
      await tx.paiement.delete({ where: { id } });
    });

    return { id, message: 'Paiement supprimé définitivement' };
  }
}

export const paiementService = new PaiementService();