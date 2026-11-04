// backend/src/modules/inscription/inscription.service.ts

import { getTenantClient } from '../../config/tenant-db.js';
import { AppError } from '../../utils/AppError.js';
import type {
  CreateInscriptionInput,
  UpdateInscriptionInput,
  ListInscriptionsQuery,
  InscrireEtPayerInput,
} from './inscription.validation.js';

export interface InscriptionContext {
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

const inscriptionInclude = {
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
  classe: {
    select: {
      id: true,
      nom: true,
      code: true,
      capacite: true,
      niveau: { select: { id: true, nom: true, code: true } },
    },
  },
  anneeScolaire: {
    select: { id: true, nom: true, estActive: true },
  },
} as const;

// ══════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════

/**
 * Récupère le plan de scolarité applicable à une classe.
 *
 * ⚠️ POLITIQUE MÉTIER : seul le plan SPÉCIFIQUE à la classe est pris.
 * Le fallback "plan du niveau" a été retiré pour éviter qu'une classe
 * sans plan propre hérite silencieusement du plan d'une autre classe
 * du même niveau (bug : échéances d'une autre classe affichées).
 *
 * Si plusieurs plans existent pour la même classe, on prend le plus récent.
 */
async function findPlanForClasse(
  client: any,
  classeId: string,
  anneeScolaireId: string
) {
  return client.planScolarite.findFirst({
    where: {
      classeId,
      anneeScolaireId,
      estActif: true,
    },
    include: {
      echeances: { orderBy: { ordre: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Calcule le résumé financier d'un assignment.
 *
 * ⭐ Inclut désormais :
 *  - Les frais d'inscription (toujours visibles)
 *  - Les autres frais (avec leur vrai libellé)
 *  - Les échéances réelles du plan
 *  - Un statut global de paiement
 */
async function getResumeFinancierAssignment(
  client: any,
  assignmentId: string
) {
  const assignment = await client.assignmentScolarite.findUnique({
    where: { id: assignmentId },
    include: {
      planScolarite: {
        include: {
          echeances: { orderBy: { ordre: 'asc' } },
        },
      },
      paiements: {
        where: { statut: 'COMPLET' },
        include: {
          allocations: {
            include: {
              echeance: { select: { id: true, nom: true, montant: true } },
            },
          },
        },
      },
      reductions: true,
    },
  });
  if (!assignment) return null;

  const plan = assignment.planScolarite;
  const montantTotal = assignment.montantPersonnalise
    ?? plan?.montantTotal
    ?? 0;

  // Réductions
  const totalReduction = (assignment.reductions ?? []).reduce(
    (s: number, r: any) => {
      if (r.type === 'FIXE') return s + r.valeur;
      if (r.type === 'POURCENTAGE') return s + (montantTotal * r.valeur) / 100;
      return s;
    },
    0
  );

  const duTheorique = Math.max(0, montantTotal - totalReduction);

  const totalPaye = (assignment.paiements ?? []).reduce(
    (s: number, p: any) => s + (p.montant ?? 0),
    0
  );

  const restant = Math.max(0, duTheorique - totalPaye);

  // Statut global
  let statutGlobal: 'PAYE' | 'PARTIEL' | 'IMPAYE';
  if (totalPaye <= TOLERANCE) statutGlobal = 'IMPAYE';
  else if (restant <= TOLERANCE) statutGlobal = 'PAYE';
  else statutGlobal = 'PARTIEL';

  // ──────────────────────────────────────────
  // ÉCHÉANCES RÉELLES DU PLAN
  // ──────────────────────────────────────────
  const echeancesReelles = (plan?.echeances ?? []).map((e: any) => {
    const payeSurEcheance = (assignment.paiements ?? []).reduce(
      (s: number, p: any) => {
        const allocs = (p.allocations ?? []).filter(
          (a: any) => a.echeanceId === e.id
        );
        return s + allocs.reduce((ss: number, a: any) => ss + a.montant, 0);
      },
      0
    );
    const restantEcheance = Math.max(0, e.montant - payeSurEcheance);

    let statut: 'PAYEE' | 'PARTIELLE' | 'IMPAYEE' | 'EN_RETARD';
    if (restantEcheance <= TOLERANCE) statut = 'PAYEE';
    else if (payeSurEcheance > TOLERANCE) statut = 'PARTIELLE';
    else {
      const jours = Math.ceil(
        (new Date(e.dateLimite).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );
      statut = jours < 0 ? 'EN_RETARD' : 'IMPAYEE';
    }

    return {
      id: e.id,
      nom: e.nom,
      ordre: e.ordre,
      montant: e.montant,
      dateLimite: e.dateLimite,
      paye: payeSurEcheance,
      restant: restantEcheance,
      statut,
      estPayee: restantEcheance <= TOLERANCE,
      type: 'ECHEANCE' as const,
    };
  });

  // ──────────────────────────────────────────
  // ⭐ FRAIS D'INSCRIPTION + AUTRES FRAIS
  // On les ajoute au résumé, avec leur vrai libellé
  // et en calculant ce qui a été payé dessus.
  // ──────────────────────────────────────────
  const fraisVirtuels: any[] = [];

  // Frais d'inscription
  const fraisInscription = Number(plan?.fraisInscription ?? 0);
  if (fraisInscription > 0) {
    // Chercher une échéance existante "inscription" (créée par resolveAllocation)
    const echeanceInscription = (plan?.echeances ?? []).find(
      (e: any) =>
        e.nom?.toLowerCase().includes('inscription') ||
        e.ordre === 0
    );

    // Si elle existe, on l'a déjà dans echeancesReelles → skip
    if (!echeanceInscription) {
      // Sinon on l'affiche comme virtuelle : rien payé pour l'instant
      fraisVirtuels.push({
        id: '__frais_inscription__',
        nom: "Frais d'inscription",
        ordre: 0,
        montant: fraisInscription,
        dateLimite: null,
        paye: 0,
        restant: fraisInscription,
        statut: 'IMPAYEE',
        estPayee: false,
        type: 'FRAIS_INSCRIPTION' as const,
      });
    }
  }

  // Autres frais
  const autresFrais = plan?.autresFrais as Record<string, number> | null;
  if (autresFrais && typeof autresFrais === 'object') {
    Object.entries(autresFrais).forEach(([libelle, montant], idx) => {
      const montantNum = Number(montant);
      if (montantNum <= 0) return;

      // Chercher une échéance existante avec ce libellé
      const echeanceExistante = (plan?.echeances ?? []).find(
        (e: any) => e.nom === libelle
      );

      // Si elle existe, on l'a déjà dans echeancesReelles → skip
      if (echeanceExistante) return;

      fraisVirtuels.push({
        id: `__autre_frais_${idx}__`,
        nom: libelle,
        ordre: 100 + idx,
        montant: montantNum,
        dateLimite: null,
        paye: 0,
        restant: montantNum,
        statut: 'IMPAYEE',
        estPayee: false,
        type: 'AUTRE_FRAIS' as const,
      });
    });
  }

  // Fusion : frais virtuels (inscription/autres) + échéances réelles
  const echeances = [...fraisVirtuels, ...echeancesReelles];

  return {
    montantTotal,
    totalReduction,
    duTheorique,
    totalPaye,
    restant,
    statutGlobal, // ⭐ NOUVEAU
    tauxPaiement:
      duTheorique > 0 ? Math.round((totalPaye / duTheorique) * 100) : 0,
    echeances,
  };
}

/**
 * Génère une référence unique de paiement.
 */
async function generatePaymentReference(tx: any): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `PAY-${yyyy}${mm}-`;
  const last = await tx.paiement.findFirst({
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

/**
 * Résout une allocation en créant l'échéance si nécessaire.
 *
 * ⭐ AMÉLIORÉ : le nom de l'échéance créée reprend le vrai libellé
 * (ex: "Uniforme", "Cantine") au lieu de "Autre frais" générique.
 */
async function resolveAllocation(
  tx: any,
  planId: string,
  plan: any,
  alloc: { echeanceId: string; montant: number }
): Promise<{ echeanceId: string; montant: number }> {
  // Cas 1 : frais d'inscription virtuel
  if (alloc.echeanceId === '__frais_inscription__') {
    let echeance = await tx.echeance.findFirst({
      where: {
        planScolariteId: planId,
        OR: [
          { nom: { contains: 'inscription', mode: 'insensitive' } },
          { ordre: 0 },
        ],
      },
    });

    if (!echeance) {
      echeance = await tx.echeance.create({
        data: {
          planScolariteId: planId,
          nom: "Frais d'inscription",
          montant: plan.fraisInscription || alloc.montant,
          dateLimite: new Date(),
          ordre: 0,
        },
      });
    }

    return { echeanceId: echeance.id, montant: alloc.montant };
  }

  // Cas 2 : autre frais virtuel (ex: __autre_frais_0__)
  if (alloc.echeanceId.startsWith('__autre_frais_')) {
    // ⭐ Extraire l'index pour retrouver le vrai libellé
    const match = alloc.echeanceId.match(/__autre_frais_(\d+)__/);
    const index = match ? parseInt(match[1], 10) : -1;

    const autresFrais = plan.autresFrais as Record<string, number> | null;
    let vraiLibelle = 'Autre frais';
    let vraiMontant = alloc.montant;

    if (autresFrais && typeof autresFrais === 'object') {
      const entries = Object.entries(autresFrais).filter(
        ([, m]) => Number(m) > 0
      );
      if (index >= 0 && index < entries.length) {
        vraiLibelle = entries[index][0];
        vraiMontant = Number(entries[index][1]);
      }
    }

    // Chercher une échéance existante avec ce libellé exact
    let echeance = await tx.echeance.findFirst({
      where: {
        planScolariteId: planId,
        nom: vraiLibelle,
      },
    });

    if (!echeance) {
      echeance = await tx.echeance.create({
        data: {
          planScolariteId: planId,
          nom: vraiLibelle, // ⭐ vrai libellé (Uniforme, Cantine…)
          montant: vraiMontant,
          dateLimite: new Date(),
          ordre: 100 + index,
        },
      });
    }

    return { echeanceId: echeance.id, montant: alloc.montant };
  }

  // Cas 3 : échéance réelle
  return alloc;
}

// ══════════════════════════════════════════
// SERVICE
// ══════════════════════════════════════════

export class InscriptionService {
  // ══════════════════════════════════════════
  // CREATE (simple — sans paiement)
  // ══════════════════════════════════════════

  async create(ctx: InscriptionContext, input: CreateInscriptionInput) {
    const client = await getClient(ctx.schemaName);

    // 1. Vérifier l'élève
    const eleve = await client.eleve.findUnique({
      where: { id: input.eleveId },
      select: { id: true, statut: true },
    });
    if (!eleve) throw new AppError('Élève introuvable', 404);
    if (eleve.statut === 'ARCHIVE') {
      throw new AppError("Impossible d'inscrire un élève archivé", 400);
    }

    // 2. Vérifier la classe
    const classe = await client.classe.findUnique({
      where: { id: input.classeId },
      select: { id: true, capacite: true, estArchive: true },
    });
    if (!classe) throw new AppError('Classe introuvable', 404);
    if (classe.estArchive) {
      throw new AppError(
        "Impossible de s'inscrire dans une classe archivée",
        400
      );
    }

    // 3. Vérifier l'année
    const annee = await client.anneeScolaire.findUnique({
      where: { id: input.anneeScolaireId },
      select: { id: true, estArchive: true },
    });
    if (!annee) throw new AppError('Année scolaire introuvable', 404);
    if (annee.estArchive) {
      throw new AppError(
        "Impossible de s'inscrire dans une année archivée",
        400
      );
    }

    // 4. Capacité
    if (classe.capacite) {
      const nbInscrits = await client.inscription.count({
        where: {
          classeId: input.classeId,
          anneeScolaireId: input.anneeScolaireId,
          estActive: true,
        },
      });
      if (nbInscrits >= classe.capacite) {
        throw new AppError(
          `Classe pleine (${nbInscrits}/${classe.capacite})`,
          409
        );
      }
    }

    // 5. Transaction
    try {
      const result = await client.$transaction(async (tx: any) => {
        const inscription = await tx.inscription.create({
          data: {
            eleveId: input.eleveId,
            classeId: input.classeId,
            anneeScolaireId: input.anneeScolaireId,
            dateInscription: input.dateInscription
              ? new Date(input.dateInscription)
              : new Date(),
            estActive: input.estActive ?? true,
          },
        });

        const plan = await findPlanForClasse(
          tx,
          input.classeId,
          input.anneeScolaireId
        );
        let assignment = null;
        if (plan) {
          const existing = await tx.assignmentScolarite.findUnique({
            where: {
              eleveId_planScolariteId_anneeScolaireId: {
                eleveId: input.eleveId,
                planScolariteId: plan.id,
                anneeScolaireId: input.anneeScolaireId,
              },
            },
          });
          if (!existing) {
            assignment = await tx.assignmentScolarite.create({
              data: {
                eleveId: input.eleveId,
                planScolariteId: plan.id,
                classeId: input.classeId,
                anneeScolaireId: input.anneeScolaireId,
                statut: 'ACTIF',
              },
            });
          } else {
            assignment = existing;
          }
        }

        return { inscription, assignment, plan };
      });

      const inscriptionComplete = await client.inscription.findUnique({
        where: { id: result.inscription.id },
        include: inscriptionInclude,
      });

      return {
        ...inscriptionComplete,
        planScolarite: result.plan
          ? {
              id: result.plan.id,
              nom: result.plan.nom,
              montantTotal: result.plan.montantTotal,
              fraisInscription: result.plan.fraisInscription,
              fraisScolarite: result.plan.fraisScolarite,
              autresFrais: result.plan.autresFrais,
              devise: result.plan.devise,
              nombreEcheances: result.plan.echeances?.length ?? 0,
            }
          : null,
        assignment: result.assignment,
      };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError(
          'Cet élève est déjà inscrit dans cette classe pour cette année',
          409
        );
      }
      throw err;
    }
  }

  // ══════════════════════════════════════════
  // INSCRIRE + PAYER (transaction atomique)
  // ══════════════════════════════════════════

  async inscrireEtPayer(
    ctx: InscriptionContext,
    input: InscrireEtPayerInput
  ) {
    const client = await getClient(ctx.schemaName);

    // 1. Vérifications
    const eleve = await client.eleve.findUnique({
      where: { id: input.eleveId },
      select: { id: true, statut: true, prenom: true, nom: true },
    });
    if (!eleve) throw new AppError('Élève introuvable', 404);
    if (eleve.statut === 'ARCHIVE') {
      throw new AppError("Impossible d'inscrire un élève archivé", 400);
    }

    const classe = await client.classe.findUnique({
      where: { id: input.classeId },
      select: { id: true, capacite: true, estArchive: true },
    });
    if (!classe) throw new AppError('Classe introuvable', 404);
    if (classe.estArchive) {
      throw new AppError(
        "Impossible de s'inscrire dans une classe archivée",
        400
      );
    }

    if (classe.capacite) {
      const nbInscrits = await client.inscription.count({
        where: {
          classeId: input.classeId,
          anneeScolaireId: input.anneeScolaireId,
          estActive: true,
        },
      });
      if (nbInscrits >= classe.capacite) {
        throw new AppError(
          `Classe pleine (${nbInscrits}/${classe.capacite})`,
          409
        );
      }
    }

    // 2. Plan
    const plan = await findPlanForClasse(
      client,
      input.classeId,
      input.anneeScolaireId
    );
    if (!plan) {
      throw new AppError(
        'Aucun plan de scolarité actif pour cette classe/année. Créez-en un avant.',
        400
      );
    }

    // 3. Valider les allocations
    if (input.allocations && input.allocations.length > 0) {
      const totalAlloue = input.allocations.reduce(
        (s, a) => s + a.montant,
        0
      );
      if (totalAlloue > input.montantPaiement + TOLERANCE) {
        throw new AppError(
          `Le total des allocations (${totalAlloue}) dépasse le montant du paiement (${input.montantPaiement})`,
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

        // Ignorer les frais virtuels (créés automatiquement)
        if (
          alloc.echeanceId === '__frais_inscription__' ||
          alloc.echeanceId.startsWith('__autre_frais_')
        ) {
          continue;
        }

        const echeance = await client.echeance.findUnique({
          where: { id: alloc.echeanceId },
          select: { id: true, nom: true, montant: true, planScolariteId: true },
        });
        if (!echeance) {
          throw new AppError(
            `Échéance introuvable : ${alloc.echeanceId}`,
            404
          );
        }
        if (echeance.planScolariteId !== plan.id) {
          throw new AppError(
            `L'échéance "${echeance.nom}" n'appartient pas au plan de cette classe`,
            400
          );
        }
        if (alloc.montant > echeance.montant + TOLERANCE) {
          throw new AppError(
            `L'allocation sur "${echeance.nom}" dépasse son montant (${echeance.montant})`,
            400
          );
        }
      }
    }

    // 4. Transaction
    try {
      const result = await client.$transaction(async (tx: any) => {
        // 4.1. Inscription
        const inscription = await tx.inscription.create({
          data: {
            eleveId: input.eleveId,
            classeId: input.classeId,
            anneeScolaireId: input.anneeScolaireId,
            dateInscription: input.dateInscription
              ? new Date(input.dateInscription)
              : new Date(),
            estActive: true,
          },
        });

        // 4.2. Assignment
        let assignment = await tx.assignmentScolarite.findUnique({
          where: {
            eleveId_planScolariteId_anneeScolaireId: {
              eleveId: input.eleveId,
              planScolariteId: plan.id,
              anneeScolaireId: input.anneeScolaireId,
            },
          },
        });
        if (!assignment) {
          assignment = await tx.assignmentScolarite.create({
            data: {
              eleveId: input.eleveId,
              planScolariteId: plan.id,
              classeId: input.classeId,
              anneeScolaireId: input.anneeScolaireId,
              statut: 'ACTIF',
            },
          });
        } else if (!assignment.classeId) {
          // ⭐ Mise à jour si l'assignment existant n'avait pas de classeId
          assignment = await tx.assignmentScolarite.update({
            where: { id: assignment.id },
            data: { classeId: input.classeId },
          });
        }

        // 4.3. Résoudre les allocations
        const allocationsResolues: { echeanceId: string; montant: number }[] =
          [];
        for (const alloc of input.allocations ?? []) {
          const resolved = await resolveAllocation(tx, plan.id, plan, alloc);
          allocationsResolues.push(resolved);
        }

        // 4.4. Référence paiement
        const reference = await generatePaymentReference(tx);

        // 4.5. Paiement
        const paiement = await tx.paiement.create({
          data: {
            reference,
            eleveId: input.eleveId,
            montant: input.montantPaiement,
            datePaiement: input.datePaiement
              ? new Date(input.datePaiement)
              : new Date(),
            moyen: input.moyen,
            referenceMoyen: input.referenceMoyen ?? null,
            caissierId: ctx.userId,
            notes:
              input.notes ??
              `Inscription + paiement initial (${eleve.prenom} ${eleve.nom})`,
            statut: 'COMPLET',
            assignmentId: assignment.id,
          },
        });

        // 4.6. Allocations
        if (allocationsResolues.length > 0) {
          await tx.allocationPaiement.createMany({
            data: allocationsResolues.map((a) => ({
              paiementId: paiement.id,
              echeanceId: a.echeanceId,
              montant: a.montant,
            })),
          });

          // 4.7. Recalculer estPayee pour chaque échéance touchée
          const echeanceIds = [
            ...new Set(allocationsResolues.map((a) => a.echeanceId)),
          ];

          for (const echeanceId of echeanceIds) {
            const totalAlloue = await tx.allocationPaiement.aggregate({
              where: {
                echeanceId,
                paiement: { statut: 'COMPLET' },
              },
              _sum: { montant: true },
            });
            const echeance = await tx.echeance.findUnique({
              where: { id: echeanceId },
              select: { montant: true },
            });
            const nouveauEstPayee =
              !!echeance &&
              (totalAlloue._sum.montant ?? 0) >=
                echeance.montant - TOLERANCE;

            await tx.echeance.update({
              where: { id: echeanceId },
              data: { estPayee: nouveauEstPayee },
            });
          }
        }

        return { inscription, assignment, paiement, reference };
      });

      // 5. Recharger + enrichir
      const inscriptionComplete = await client.inscription.findUnique({
        where: { id: result.inscription.id },
        include: inscriptionInclude,
      });

      const resume = await getResumeFinancierAssignment(
        client,
        result.assignment.id
      );

      const paiementComplet = await client.paiement.findUnique({
        where: { id: result.paiement.id },
        include: {
          allocations: {
            include: {
              echeance: {
                select: {
                  id: true,
                  nom: true,
                  ordre: true,
                  montant: true,
                  dateLimite: true,
                },
              },
            },
          },
        },
      });

      return {
        inscription: inscriptionComplete,
        planScolarite: {
          id: plan.id,
          nom: plan.nom,
          montantTotal: plan.montantTotal,
          fraisInscription: plan.fraisInscription,
          fraisScolarite: plan.fraisScolarite,
          autresFrais: plan.autresFrais,
          devise: plan.devise,
        },
        assignment: result.assignment,
        paiement: {
          ...paiementComplet,
          reference: result.reference,
        },
        resumeFinancier: resume,
      };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError(
          'Cet élève est déjà inscrit dans cette classe pour cette année',
          409
        );
      }
      throw err;
    }
  }

  // ══════════════════════════════════════════
  // LIST
  // ══════════════════════════════════════════

  async findAll(ctx: InscriptionContext, q: ListInscriptionsQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};

    if (q.search) {
      where.eleve = {
        OR: [
          { nom: { contains: q.search, mode: 'insensitive' } },
          { prenom: { contains: q.search, mode: 'insensitive' } },
          { matricule: { contains: q.search, mode: 'insensitive' } },
        ],
      };
    }
    if (q.eleveId) where.eleveId = q.eleveId;
    if (q.classeId) where.classeId = q.classeId;
    if (q.anneeScolaireId) where.anneeScolaireId = q.anneeScolaireId;

    if (q.estActive !== undefined && q.estActive !== null) {
      const val: any = q.estActive;
      where.estActive = val === true || val === 'true' || val === '1';
    }

    const allowedSort = ['dateInscription', 'createdAt'] as const;
    type SortField = (typeof allowedSort)[number];

    const sortBy: SortField =
      q.sortBy && (allowedSort as readonly string[]).includes(q.sortBy)
        ? (q.sortBy as SortField)
        : 'dateInscription';
    const sortOrder: 'asc' | 'desc' = q.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      client.inscription.count({ where }),
      client.inscription.findMany({
        where,
        include: inscriptionInclude,
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

  // ══════════════════════════════════════════
  // GET BY ID
  // ══════════════════════════════════════════

  async findById(ctx: InscriptionContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const inscription = await client.inscription.findUnique({
      where: { id },
      include: inscriptionInclude,
    });
    if (!inscription) throw new AppError('Inscription introuvable', 404);

    const plan = await findPlanForClasse(
      client,
      inscription.classeId,
      inscription.anneeScolaireId
    );

    let assignment = null;
    let resumeFinancier = null;

    if (plan) {
      assignment = await client.assignmentScolarite.findUnique({
        where: {
          eleveId_planScolariteId_anneeScolaireId: {
            eleveId: inscription.eleveId,
            planScolariteId: plan.id,
            anneeScolaireId: inscription.anneeScolaireId,
          },
        },
      });

      if (assignment) {
        resumeFinancier = await getResumeFinancierAssignment(
          client,
          assignment.id
        );
      }
    }

    const paiements = await client.paiement.findMany({
      where: {
        eleveId: inscription.eleveId,
        ...(assignment && { assignmentId: assignment.id }),
        statut: 'COMPLET',
      },
      include: {
        allocations: {
          include: {
            echeance: {
              select: {
                id: true,
                nom: true,
                ordre: true,
                montant: true,
                dateLimite: true,
              },
            },
          },
        },
        caissier: { select: { prenom: true, nom: true } },
      },
      orderBy: { datePaiement: 'desc' },
    });

    return {
      ...inscription,
      planScolarite: plan
        ? {
            id: plan.id,
            nom: plan.nom,
            montantTotal: plan.montantTotal,
            fraisInscription: plan.fraisInscription,
            fraisScolarite: plan.fraisScolarite,
            autresFrais: plan.autresFrais,
            devise: plan.devise,
            echeances: (plan.echeances ?? []).map((e: any) => ({
              id: e.id,
              nom: e.nom,
              ordre: e.ordre,
              montant: e.montant,
              dateLimite: e.dateLimite,
              estPayee: e.estPayee,
            })),
          }
        : null,
      assignment,
      resumeFinancier,
      paiements,
    };
  }

  // ══════════════════════════════════════════
  // PREVIEW INSCRIPTION
  // ══════════════════════════════════════════

  async previewInscription(
    ctx: InscriptionContext,
    params: {
      eleveId: string;
      classeId: string;
      anneeScolaireId: string;
    }
  ) {
    const client = await getClient(ctx.schemaName);

    const { eleveId, classeId, anneeScolaireId } = params;

    if (!eleveId || !classeId || !anneeScolaireId) {
      throw new AppError(
        'eleveId, classeId et anneeScolaireId sont requis',
        400
      );
    }

    // 1. Élève
    const eleve = await client.eleve.findUnique({
      where: { id: eleveId },
      select: {
        id: true,
        matricule: true,
        prenom: true,
        nom: true,
        sexe: true,
        photo: true,
        statut: true,
      },
    });
    if (!eleve) throw new AppError('Élève introuvable', 404);

    // 2. Classe
    const classe = await client.classe.findUnique({
      where: { id: classeId },
      select: {
        id: true,
        nom: true,
        code: true,
        capacite: true,
        estArchive: true,
        niveau: { select: { id: true, nom: true, code: true } },
      },
    });
    if (!classe) throw new AppError('Classe introuvable', 404);

    // Compter les inscrits dans CETTE classe pour CETTE année
    const nbInscrits = await client.inscription.count({
      where: { classeId, anneeScolaireId, estActive: true },
    });
    const placesRestantes = classe.capacite
      ? Math.max(0, classe.capacite - nbInscrits)
      : null;
    const classePleine =
      classe.capacite != null && nbInscrits >= classe.capacite;

    // 3. Déjà inscrit ?
    const dejaInscrit = await client.inscription.findUnique({
      where: {
        eleveId_classeId_anneeScolaireId: {
          eleveId,
          classeId,
          anneeScolaireId,
        },
      },
      select: { id: true, estActive: true },
    });

    // 4. Plan
    const plan = await findPlanForClasse(client, classeId, anneeScolaireId);

    // 5. Résumé financier
    let resumeFinancier = null;
    if (plan) {
      const assignment = await client.assignmentScolarite.findUnique({
        where: {
          eleveId_planScolariteId_anneeScolaireId: {
            eleveId,
            planScolariteId: plan.id,
            anneeScolaireId,
          },
        },
      });
      if (assignment) {
        resumeFinancier = await getResumeFinancierAssignment(
          client,
          assignment.id
        );
      }
    }

    return {
      eleve,
      classe: {
        ...classe,
        nbInscrits,
        placesRestantes,
        classePleine,
      },
      dejaInscrit: dejaInscrit?.estActive ?? false,
      inscriptionExistanteId: dejaInscrit?.id ?? null,
      planScolarite: plan
        ? {
            id: plan.id,
            nom: plan.nom,
            montantTotal: plan.montantTotal,
            fraisInscription: plan.fraisInscription,
            fraisScolarite: plan.fraisScolarite,
            autresFrais: plan.autresFrais,
            devise: plan.devise,
            echeances: (plan.echeances ?? []).map((e: any) => ({
              id: e.id,
              nom: e.nom,
              ordre: e.ordre,
              montant: e.montant,
              dateLimite: e.dateLimite,
              estPayee: e.estPayee,
            })),
          }
        : null,
      resumeFinancier,
    };
  }

  // ══════════════════════════════════════════
  // UPDATE
  // ══════════════════════════════════════════

  async update(
    ctx: InscriptionContext,
    id: string,
    input: UpdateInscriptionInput
  ) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.inscription.findUnique({
      where: { id },
      select: { id: true, classeId: true },
    });
    if (!existing) throw new AppError('Inscription introuvable', 404);

    const patch: any = {};
    if (input.classeId !== undefined) patch.classeId = input.classeId;
    if (input.anneeScolaireId !== undefined)
      patch.anneeScolaireId = input.anneeScolaireId;
    if (input.dateInscription !== undefined)
      patch.dateInscription = new Date(input.dateInscription);
    if (input.estActive !== undefined) patch.estActive = input.estActive;

    try {
      return await client.inscription.update({
        where: { id },
        data: patch,
        include: inscriptionInclude,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError(
          'Cet élève est déjà inscrit dans cette classe pour cette année',
          409
        );
      }
      throw err;
    }
  }

  // ══════════════════════════════════════════
  // SOFT DELETE
  // ══════════════════════════════════════════

  async softDelete(ctx: InscriptionContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.inscription.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new AppError('Inscription introuvable', 404);

    await client.inscription.update({
      where: { id },
      data: { estActive: false },
    });

    return { id, message: 'Inscription désactivée' };
  }

  // ══════════════════════════════════════════
  // HARD DELETE
  // ══════════════════════════════════════════

  async hardDelete(ctx: InscriptionContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.inscription.findUnique({
      where: { id },
      include: {
        eleve: { select: { id: true } },
        anneeScolaire: { select: { id: true } },
        classe: { select: { id: true } },
      },
    });
    if (!existing) throw new AppError('Inscription introuvable', 404);

    const nbPaiements = await client.paiement.count({
      where: {
        eleveId: existing.eleveId,
        statut: 'COMPLET',
      },
    });

    if (nbPaiements > 0) {
      throw new AppError(
        `Suppression impossible : ${nbPaiements} paiement(s) rattaché(s) à cet élève. Désactivez l'inscription à la place.`,
        409
      );
    }

    const plan = await findPlanForClasse(
      client,
      existing.classeId,
      existing.anneeScolaireId
    );
    if (plan) {
      await client.assignmentScolarite.deleteMany({
        where: {
          eleveId: existing.eleveId,
          planScolariteId: plan.id,
          anneeScolaireId: existing.anneeScolaireId,
        },
      });
    }

    await client.inscription.delete({ where: { id } });
    return { id, message: 'Inscription supprimée définitivement' };
  }
}

export const inscriptionService = new InscriptionService();