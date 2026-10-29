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
  userId: string;
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

// ══════════════════════════════════════════
// CONSTANTES MÉTIER
// ══════════════════════════════════════════

const MONTANT_MIN_PARTIEL = 500;
const TOLERANCE = 0.01;

// ══════════════════════════════════════════
// GÉNÉRATION DE RÉFÉRENCE
// ══════════════════════════════════════════

async function generateReference(client: any): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
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

// ══════════════════════════════════════════
// INCLUDES
// ══════════════════════════════════════════

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
    select: { id: true, prenom: true, nom: true, email: true },
  },
  annuleParUtilisateur: {
    select: { id: true, prenom: true, nom: true },
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
    select: { id: true, numeroRecu: true, cheminPDF: true },
  },
  assignment: {
    select: {
      id: true,
      planScolariteId: true,
      montantPersonnalise: true,
    },
  },
} as const;

// ══════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════

/**
 * Calcule le montant déjà payé sur une échéance (paiements COMPLETS),
 * en excluant éventuellement un paiement.
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
 * Retourne le résumé COMPLET d'une tranche pour UN élève :
 *  - le montant nominal de la tranche
 *  - le total payé sur cette tranche (cumul TOUS paiements COMPLETS)
 *  - le restant à payer
 *  - le statut (PAYEE / PARTIELLE / IMPAYEE / EN_RETARD)
 *  - le détail des paiements antérieurs
 *
 * C'est LA fonction à utiliser partout où on affiche une tranche
 * dans le contexte d'un paiement.
 */
async function getResumeTranche(
  client: any,
  echeanceId: string,
  eleveId: string,
  excludePaiementId?: string
) {
  // 1. Charger l'échéance
  const echeance = await client.echeance.findUnique({
    where: { id: echeanceId },
    select: {
      id: true,
      nom: true,
      ordre: true,
      montant: true,
      dateLimite: true,
      estPayee: true,
    },
  });
  if (!echeance) throw new AppError('Échéance introuvable', 404);

  // 2. Charger TOUS les paiements COMPLETS de CET élève sur CETTE échéance
  //    (on exclut le paiement en cours si fourni)
  const allocations = await client.allocationPaiement.findMany({
    where: {
      echeanceId,
      paiement: { eleveId, statut: 'COMPLET' },
      ...(excludePaiementId && { paiementId: { not: excludePaiementId } }),
    },
    include: {
      paiement: {
        select: {
          id: true,
          reference: true,
          datePaiement: true,
          moyen: true,
          caissier: { select: { prenom: true, nom: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // 3. Construire l'historique
  const historique = allocations.map((a: any) => ({
    paiementId: a.paiement.id,
    reference: a.paiement.reference,
    datePaiement: a.paiement.datePaiement,
    moyen: a.paiement.moyen,
    montant: a.montant,
    caissier: a.paiement.caissier
      ? `${a.paiement.caissier.prenom} ${a.paiement.caissier.nom}`
      : null,
  }));

  // 4. Calculs financiers
  const montantTotal = echeance.montant;
  const totalPaye = historique.reduce(
    (s: number, h: any) => s + h.montant,
    0
  );
  const restant = Math.max(0, montantTotal - totalPaye);

  // 5. Statut
  const maintenant = Date.now();
  const dateLimiteMs = new Date(echeance.dateLimite).getTime();
  const enRetard = maintenant > dateLimiteMs && restant > TOLERANCE;
  const joursRetard = enRetard
    ? Math.floor((maintenant - dateLimiteMs) / (1000 * 60 * 60 * 24))
    : 0;

  let statut: 'PAYEE' | 'PARTIELLE' | 'IMPAYEE' | 'EN_RETARD';
  if (restant <= TOLERANCE) statut = 'PAYEE';
  else if (totalPaye > TOLERANCE) statut = 'PARTIELLE';
  else if (joursRetard > 0) statut = 'EN_RETARD';
  else statut = 'IMPAYEE';

  return {
    echeance: {
      id: echeance.id,
      nom: echeance.nom,
      ordre: echeance.ordre,
      montant: echeance.montant,
      dateLimite: echeance.dateLimite,
    },
    montantTotal,
    totalPaye,
    restant,
    statut,
    enRetard,
    joursRetard,
    nombrePaiements: historique.length,
    historique,
  };
}

/**
 * Extrait la classe active d'un élève.
 */
function extractClasseActive(eleve: any) {
  const ins = eleve?.inscriptions?.find((i: any) => i.classe) ?? null;
  return {
    classeId: ins?.classeId ?? null,
    classeNom: ins?.classe?.nom ?? null,
    classeCode: ins?.classe?.code ?? null,
  };
}

/**
 * Enrichit un paiement avec les infos de classe à la racine.
 */
function enrichirPaiementAvecClasse(paiement: any) {
  if (!paiement) return paiement;
  const { classeId, classeNom, classeCode } = extractClasseActive(
    paiement.eleve
  );
  return { ...paiement, classeId, classeNom, classeCode };
}

/**
 * Enrichit une allocation avec le résumé complet de sa tranche
 * (montant total, total payé, restant, statut, historique).
 *
 * ⚠️ C'est ce qui permet à l'UI d'afficher pour chaque allocation :
 *    - Tranche "1ère tranche" — Total 30 000 F CFA
 *    - Payé 5 000 F CFA
 *    - Restant 25 000 F CFA
 */
async function enrichirAllocation(
  client: any,
  alloc: any,
  eleveId: string,
  currentPaiementId?: string
) {
  const echeance = alloc.echeance;
  if (!echeance) return alloc;

  // ⚠️ IMPORTANT : on exclut le paiement en cours pour avoir
  //    le "total payé AVANT" et calculer le restant après
  const resume = await getResumeTranche(
    client,
    alloc.echeanceId,
    eleveId,
    currentPaiementId
  );

  // Total payé après CE paiement (résumé + allocation courante)
  const totalPayeApres = resume.totalPaye + alloc.montant;
  const restantApres = Math.max(0, resume.montantTotal - totalPayeApres);

  // Statut après ce paiement
  let statutApres: 'PAYEE' | 'PARTIELLE' | 'IMPAYEE' | 'EN_RETARD';
  if (restantApres <= TOLERANCE) statutApres = 'PAYEE';
  else if (totalPayeApres > TOLERANCE) statutApres = 'PARTIELLE';
  else if (resume.joursRetard > 0) statutApres = 'EN_RETARD';
  else statutApres = 'IMPAYEE';

  return {
    ...alloc,
    // 🆕 Résumé complet de la tranche pour l'UI
    tranche: {
      id: resume.echeance.id,
      nom: resume.echeance.nom,
      ordre: resume.echeance.ordre,
      dateLimite: resume.echeance.dateLimite,
      montantTotal: resume.montantTotal,
      totalPaye: totalPayeApres,
      restant: restantApres,
      statut: statutApres,
      enRetard: resume.enRetard && restantApres > TOLERANCE,
      joursRetard: resume.joursRetard,
      nombrePaiements: resume.nombrePaiements + 1,
      historique: resume.historique,
    },
    _meta: {
      montantEcheance: resume.montantTotal,
      totalPayeAvant: resume.totalPaye,
      totalPayeApres,
      restantAvant: resume.restant,
      restantApres,
      estPayeeCompletement: restantApres <= TOLERANCE,
      estPartielle: totalPayeApres > TOLERANCE && restantApres > TOLERANCE,
      enRetard: resume.enRetard && restantApres > TOLERANCE,
      joursRetard: resume.joursRetard,
      statut: statutApres,
      dateLimite: resume.echeance.dateLimite,
      ordre: resume.echeance.ordre,
      paiementsAnterieurs: resume.historique,
      nombrePaiementsAnterieurs: resume.nombrePaiements,
    },
  };
}

// ══════════════════════════════════════════
// SERVICE
// ══════════════════════════════════════════

export class PaiementService {
  // ──────────────────────────────────────────
  // CREATE
  // ──────────────────────────────────────────

  async create(ctx: PaiementContext, input: CreatePaiementInput) {
    const client = await getClient(ctx.schemaName);

    // ── 1. Vérifier l'élève ──
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

    // ── 2. Montant minimum ──
    if (input.montant < MONTANT_MIN_PARTIEL) {
      throw new AppError(
        `Le montant minimum d'un paiement est de ${MONTANT_MIN_PARTIEL} F CFA`,
        400
      );
    }

    // ── 3. Valider les allocations ──
    if (input.allocations && input.allocations.length > 0) {
      const totalAlloue = input.allocations.reduce(
        (sum, a) => sum + a.montant,
        0
      );

      if (totalAlloue > input.montant + TOLERANCE) {
        throw new AppError(
          `Le total des allocations (${totalAlloue}) ne peut pas dépasser le montant du paiement (${input.montant})`,
          400
        );
      }

      for (const alloc of input.allocations) {
        if (alloc.montant <= 0) {
          throw new AppError(
            `Montant d'allocation invalide pour l'échéance ${alloc.echeanceId}`,
            400
          );
        }

        const echeance = await client.echeance.findUnique({
          where: { id: alloc.echeanceId },
          select: { id: true, nom: true, montant: true },
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

        if (restantDu <= TOLERANCE) {
          throw new AppError(
            `L'échéance "${echeance.nom}" est déjà entièrement payée`,
            400
          );
        }

        if (alloc.montant > restantDu + TOLERANCE) {
          throw new AppError(
            `L'allocation sur "${echeance.nom}" (${alloc.montant}) dépasse le restant dû (${restantDu})`,
            400
          );
        }
      }
    }

    // ── 4. Vérifier l'assignment ──
    if (input.assignmentId) {
      const assignment = await client.assignmentScolarite.findUnique({
        where: { id: input.assignmentId },
        select: { id: true },
      });
      if (!assignment) {
        throw new AppError('Assignment de scolarité introuvable', 404);
      }
    }

    // ── 5. Générer la référence ──
    const reference = await generateReference(client);

    // 🆕 6. Date de paiement : on utilise la date fournie OU l'instant présent
    //    (l'heure est préservée si datePaiement est fourni avec heure)
    const datePaiement = input.datePaiement
      ? new Date(input.datePaiement)
      : new Date();

    // ── 7. Transaction ──
    try {
      const result = await client.$transaction(async (tx: any) => {
        const paiement = await tx.paiement.create({
          data: {
            reference,
            eleveId: input.eleveId,
            montant: input.montant,
            datePaiement, // 🆕 avec heure réelle
            moyen: input.moyen,
            referenceMoyen: input.referenceMoyen ?? null,
            caissierId: ctx.userId,
            notes: input.notes ?? null,
            statut: 'COMPLET',
            assignmentId: input.assignmentId ?? null,
          },
        });

        if (input.allocations && input.allocations.length > 0) {
          await tx.allocationPaiement.createMany({
            data: input.allocations.map((a) => ({
              paiementId: paiement.id,
              echeanceId: a.echeanceId,
              montant: a.montant,
            })),
          });

          // Mettre à jour estPayee sur chaque échéance
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
              (totalAlloueEcheance._sum.montant ?? 0) >=
                echeance.montant - TOLERANCE
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

      // ── 8. Recharger + enrichir ──
      const paiementComplet = await client.paiement.findUnique({
        where: { id: result.id },
        include: paiementInclude,
      });

      if (!paiementComplet) {
        throw new AppError('Erreur lors du rechargement du paiement', 500);
      }

      // 🆕 Enrichir chaque allocation avec le résumé de sa tranche
      const allocationsEnrichies = await Promise.all(
        (paiementComplet.allocations ?? []).map((alloc: any) =>
          enrichirAllocation(
            client,
            alloc,
            paiementComplet.eleveId,
            paiementComplet.id
          )
        )
      );

      const totalAlloue = (input.allocations ?? []).reduce(
        (s, a) => s + a.montant,
        0
      );
      const resteNonAlloue = Math.max(0, input.montant - totalAlloue);

      const warningNonAlloue =
        resteNonAlloue > TOLERANCE
          ? `⚠️ ${resteNonAlloue} F CFA du paiement ne sont pas alloués à une échéance.`
          : null;

      const enriched = enrichirPaiementAvecClasse(paiementComplet);

      return {
        ...enriched,
        allocations: allocationsEnrichies,
        _summary: {
          montantPaye: input.montant,
          totalAlloue,
          resteNonAlloue,
          nombreEcheances: (input.allocations ?? []).length,
          warningNonAlloue,
          estPartiel: resteNonAlloue > TOLERANCE,
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

    if (q.search) {
      where.OR = [
        { reference: { contains: q.search, mode: 'insensitive' } },
        { eleve: { nom: { contains: q.search, mode: 'insensitive' } } },
        { eleve: { prenom: { contains: q.search, mode: 'insensitive' } } },
        { eleve: { matricule: { contains: q.search, mode: 'insensitive' } } },
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

    if (q.classeId) {
      where.eleve = {
        ...(where.eleve ?? {}),
        inscriptions: {
          some: { estActive: true, classeId: q.classeId },
        },
      };
    }

    if (q.dateDebut || q.dateFin) {
      where.datePaiement = {};
      if (q.dateDebut) where.datePaiement.gte = new Date(q.dateDebut);
      if (q.dateFin) where.datePaiement.lte = new Date(q.dateFin);
    }

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

    // 🆕 Enrichir chaque paiement AVEC le résumé de ses tranches
    const dataEnrichie = await Promise.all(
      data.map(async (paiement: any) => {
        const enriched = enrichirPaiementAvecClasse(paiement);

        // Enrichir chaque allocation de CE paiement
        const allocationsEnrichies = await Promise.all(
          (paiement.allocations ?? []).map((alloc: any) =>
            enrichirAllocation(
              client,
              alloc,
              paiement.eleveId,
              paiement.id
            )
          )
        );

        return {
          ...enriched,
          allocations: allocationsEnrichies,
        };
      })
    );

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

    // 🆕 Enrichir chaque allocation avec le résumé COMPLET de sa tranche
    const allocationsEnrichies = await Promise.all(
      (paiement.allocations ?? []).map((alloc: any) =>
        enrichirAllocation(client, alloc, paiement.eleveId, paiement.id)
      )
    );

    const totalAlloue = (paiement.allocations ?? []).reduce(
      (s: number, a: any) => s + a.montant,
      0
    );
    const resteNonAlloue = Math.max(0, paiement.montant - totalAlloue);

    const enriched = enrichirPaiementAvecClasse(paiement);

    return {
      ...enriched,
      allocations: allocationsEnrichies,
      _summary: {
        montantPaye: paiement.montant,
        totalAlloue,
        resteNonAlloue,
        nombreEcheances: (paiement.allocations ?? []).length,
        warningNonAlloue:
          resteNonAlloue > TOLERANCE
            ? `⚠️ ${resteNonAlloue} F CFA non alloués à une échéance.`
            : null,
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

    // 🆕 Enrichir chaque paiement
    const dataEnrichie = await Promise.all(
      paiements.map(async (paiement: any) => {
        const enriched = enrichirPaiementAvecClasse(paiement);
        const allocationsEnrichies = await Promise.all(
          (paiement.allocations ?? []).map((alloc: any) =>
            enrichirAllocation(
              client,
              alloc,
              paiement.eleveId,
              paiement.id
            )
          )
        );
        return { ...enriched, allocations: allocationsEnrichies };
      })
    );

    return { paiements: dataEnrichie, total };
  }

  // ──────────────────────────────────────────
  // GET HISTORIQUE D'UNE ÉCHÉANCE (pour un élève)
  // ──────────────────────────────────────────

  async getHistoriqueEcheanceEleve(
    ctx: PaiementContext,
    eleveId: string,
    echeanceId: string
  ) {
    const client = await getClient(ctx.schemaName);

    // Réutilise le helper
    const resume = await getResumeTranche(
      client,
      echeanceId,
      eleveId
    );

    // Récupérer l'échéance avec plan pour info complémentaire
    const echeance = await client.echeance.findUnique({
      where: { id: echeanceId },
      select: {
        id: true,
        nom: true,
        montant: true,
        dateLimite: true,
        ordre: true,
        estPayee: true,
        planScolarite: {
          select: { id: true, nom: true, devise: true },
        },
      },
    });
    if (!echeance) throw new AppError('Échéance introuvable', 404);

    return {
      echeance: {
        ...echeance,
        planScolarite: echeance.planScolarite,
      },
      // 🆕 Résumé complet
      montantTotal: resume.montantTotal,
      totalPaye: resume.totalPaye,
      restant: resume.restant,
      statut: resume.statut,
      enRetard: resume.enRetard,
      joursRetard: resume.joursRetard,
      nombrePaiements: resume.nombrePaiements,
      // 🆕 Historique détaillé
      historique: resume.historique,
    };
  }

  // ──────────────────────────────────────────
  // UPDATE
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
          (totalRestant._sum.montant ?? 0) >= echeance.montant - TOLERANCE;

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
  // STATS
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
  // HARD DELETE
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