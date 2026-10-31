// backend/src/modules/eleve/eleve.service.ts

import { getTenantClient } from '../../config/tenant-db.js';
import { AppError } from '../../utils/AppError.js';
import { compteService } from '../compte/compte.service.js';
import type {
  CreateEleveInput,
  UpdateEleveInput,
  ListElevesQuery,
} from './eleve.validation.js';

export interface EleveContext {
  schemaName: string;
  etablissementId: string;
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError(`Client tenant introuvable`, 500);
  return client;
}

// ──────────────────────────────────────────
// MATRICULE
// ──────────────────────────────────────────

async function generateMatricule(client: any): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `ELV-${year}-`;
  const last = await client.eleve.findFirst({
    where: { matricule: { startsWith: pattern } },
    orderBy: { matricule: 'desc' },
    select: { matricule: true },
  });
  let next = 1;
  if (last?.matricule) {
    const parts = last.matricule.split('-');
    next = parseInt(parts[parts.length - 1], 10) + 1;
  }
  return `${pattern}${String(next).padStart(4, '0')}`;
}

// ──────────────────────────────────────────
// RÉSOLUTION ANNÉE SCOLAIRE ACTIVE
// ──────────────────────────────────────────

async function resolveAnneeScolaireActive(
  client: any,
  anneeScolaireId?: string | null
): Promise<{ id: string; nom: string }> {
  if (anneeScolaireId) {
    const annee = await client.anneeScolaire.findUnique({
      where: { id: anneeScolaireId },
      select: { id: true, nom: true },
    });
    if (!annee) throw new AppError('Année scolaire introuvable', 404);
    return annee;
  }
  const active = await client.anneeScolaire.findFirst({
    where: { estActive: true, estArchive: false },
    select: { id: true, nom: true },
    orderBy: { dateDebut: 'desc' },
  });
  if (!active) {
    throw new AppError(
      "Aucune année scolaire active. Activez une année avant d'inscrire un élève.",
      400
    );
  }
  return active;
}

// ──────────────────────────────────────────
// RÉSOLUTION DU PLAN DE SCOLARITÉ POUR UNE CLASSE
// ──────────────────────────────────────────

async function resolvePlanScolariteForClasse(
  client: any,
  classe: { id: string; niveauId: string },
  anneeScolaireId: string
): Promise<{ id: string; nom: string; montantTotal: number } | null> {
  const planClasse = await client.planScolarite.findFirst({
    where: { anneeScolaireId, classeId: classe.id, estActif: true },
    select: { id: true, nom: true, montantTotal: true },
    orderBy: { createdAt: 'desc' },
  });
  if (planClasse) return planClasse;

  const planNiveau = await client.planScolarite.findFirst({
    where: {
      anneeScolaireId,
      niveauId: classe.niveauId,
      classeId: null,
      estActif: true,
    },
    select: { id: true, nom: true, montantTotal: true },
    orderBy: { createdAt: 'desc' },
  });
  if (planNiveau) return planNiveau;

  return null;
}

// ──────────────────────────────────────────
// HELPERS FINANCIERS
// ──────────────────────────────────────────

/** Retourne le total payé (allocations COMPLET) sur une échéance. */
async function getMontantPayeSurEcheance(
  client: any,
  echeanceId: string
): Promise<number> {
  const agg = await client.allocationPaiement.aggregate({
    where: { echeanceId, paiement: { statut: 'COMPLET' } },
    _sum: { montant: true },
  });
  return agg._sum.montant ?? 0;
}

/**
 * 🆕 Enrichit une échéance avec les métas financières :
 * montantPayé, restant, statut calculé (payée, partielle, impayée, en retard).
 */
function enrichirEcheance(echeance: any, now = new Date()) {
  const allocationsPayees = (echeance.allocationsPaiement ?? []).filter(
    (a: any) => a.paiement?.statut === 'COMPLET'
  );
  const montantPaye = allocationsPayees.reduce(
    (s: number, a: any) => s + a.montant,
    0
  );
  const montantTotal = echeance.montant ?? 0;
  const restant = Math.max(0, montantTotal - montantPaye);
  const enRetard = !echeance.estPayee && new Date(echeance.dateLimite) < now;
  const joursRetard = enRetard
    ? Math.floor(
        (now.getTime() - new Date(echeance.dateLimite).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  let statut: 'PAYEE' | 'PARTIELLE' | 'IMPAYEE' | 'EN_RETARD';
  if (montantPaye >= montantTotal - 0.01) statut = 'PAYEE';
  else if (enRetard) statut = 'EN_RETARD';
  else if (montantPaye > 0) statut = 'PARTIELLE';
  else statut = 'IMPAYEE';

  return {
    ...echeance,
    _meta: {
      montantTotal,
      montantPaye,
      restant,
      statut,
      enRetard,
      joursRetard,
      estPayeeCompletement: montantPaye >= montantTotal - 0.01,
      estPartielle: montantPaye > 0 && montantPaye < montantTotal - 0.01,
      nombreAllocations: allocationsPayees.length,
    },
  };
}

/**
 * 🆕 Construit le résumé financier global d'un élève à partir
 * de tous ses assignments actifs et de leurs échéances.
 */
async function buildResumeFinancier(client: any, eleveId: string) {
  const assignments = await client.assignmentScolarite.findMany({
    where: { eleveId, statut: { in: ['ACTIF', 'EN_RETARD'] } },
    include: {
      planScolarite: {
        include: {
          echeances: {
            include: {
              allocationsPaiement: {
                include: {
                  paiement: { select: { id: true, statut: true } },
                },
              },
            },
          },
        },
      },
      reductions: {
        select: { id: true, type: true, valeur: true, motif: true },
      },
    },
  });

  const now = new Date();
  let totalDu = 0;
  let totalPaye = 0;
  let totalReduit = 0;
  let totalRetard = 0;
  let nombreEcheances = 0;
  let nombreEcheancesPayees = 0;
  let nombreEcheancesRetard = 0;
  const echeancesEnRetard: any[] = [];
  const prochainesEcheances: any[] = [];

  for (const assignment of assignments) {
    // réduction appliquée au plan
    const reduction = (assignment.reductions ?? []).reduce(
      (sum: number, r: any) => {
        if (r.type === 'FIXE') return sum + r.valeur;
        // POURCENTAGE : appliqué au prorata plus bas, on stocke juste le %
        return sum;
      },
      0
    );
    const pourcentageReduction = (assignment.reductions ?? [])
      .filter((r: any) => r.type === 'POURCENTAGE')
      .reduce((sum: number, r: any) => sum + r.valeur, 0);

    const echeances = assignment.planScolarite?.echeances ?? [];
    for (const ech of echeances) {
      const montantReduit =
        ech.montant * (1 - pourcentageReduction / 100) - reduction / echeances.length;
      const montantEffectif = Math.max(0, montantReduit);
      const montantPaye = (ech.allocationsPaiement ?? [])
        .filter((a: any) => a.paiement?.statut === 'COMPLET')
        .reduce((s: number, a: any) => s + a.montant, 0);

      const restant = Math.max(0, montantEffectif - montantPaye);
      const enRetard =
        restant > 0.01 && new Date(ech.dateLimite) < now;
      const joursRetard = enRetard
        ? Math.floor(
            (now.getTime() - new Date(ech.dateLimite).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      totalDu += montantEffectif;
      totalPaye += montantPaye;
      totalReduit += ech.montant - montantEffectif;
      nombreEcheances += 1;

      if (montantPaye >= montantEffectif - 0.01) nombreEcheancesPayees += 1;

      if (enRetard) {
        totalRetard += restant;
        nombreEcheancesRetard += 1;
        echeancesEnRetard.push({
          assignmentId: assignment.id,
          planNom: assignment.planScolarite?.nom,
          echeanceId: ech.id,
          nom: ech.nom,
          dateLimite: ech.dateLimite,
          montant: montantEffectif,
          paye: montantPaye,
          restant,
          joursRetard,
        });
      } else if (restant > 0.01) {
        prochainesEcheances.push({
          assignmentId: assignment.id,
          planNom: assignment.planScolarite?.nom,
          echeanceId: ech.id,
          nom: ech.nom,
          dateLimite: ech.dateLimite,
          montant: montantEffectif,
          paye: montantPaye,
          restant,
        });
      }
    }
  }

  const totalRestant = Math.max(0, totalDu - totalPaye);
  const tauxPaiement = totalDu > 0 ? (totalPaye / totalDu) * 100 : 100;

  echeancesEnRetard.sort(
    (a, b) => new Date(a.dateLimite).getTime() - new Date(b.dateLimite).getTime()
  );
  prochainesEcheances.sort(
    (a, b) => new Date(a.dateLimite).getTime() - new Date(b.dateLimite).getTime()
  );

  return {
    totalDu,
    totalPaye,
    totalRestant,
    totalReduit,
    totalRetard,
    tauxPaiement: Math.round(tauxPaiement * 100) / 100,
    nombreEcheances,
    nombreEcheancesPayees,
    nombreEcheancesRetard,
    estAJour: totalRestant <= 0.01,
    estEnRetard: totalRetard > 0.01,
    echeancesEnRetard,
    prochainesEcheances: prochainesEcheances.slice(0, 5),
    // Détail par plan
    parPlan: assignments.map((a: any) => {
      const echs = a.planScolarite?.echeances ?? [];
      const paye = echs.reduce(
        (s: number, e: any) =>
          s +
          (e.allocationsPaiement ?? [])
            .filter((al: any) => al.paiement?.statut === 'COMPLET')
            .reduce((ss: number, al: any) => ss + al.montant, 0),
        0
      );
      const du = echs.reduce((s: number, e: any) => s + e.montant, 0);
      return {
        assignmentId: a.id,
        planId: a.planScolarite?.id,
        planNom: a.planScolarite?.nom,
        montantTotal: du,
        montantPaye: paye,
        restant: Math.max(0, du - paye),
        nombreEcheances: echs.length,
        nombrePayees: echs.filter(
          (e: any) =>
            (e.allocationsPaiement ?? [])
              .filter((al: any) => al.paiement?.statut === 'COMPLET')
              .reduce((s: number, al: any) => s + al.montant, 0) >=
            e.montant - 0.01
        ).length,
      };
    }),
  };
}

// ──────────────────────────────────────────
// INCLUDES PARTAGÉS
// ──────────────────────────────────────────

const eleveInclude = {
  utilisateur: {
    select: {
      id: true,
      email: true,
      emailVerifie: true,
      estActif: true,
      derniereConnexion: true,
    },
  },
  inscriptions: {
    where: { estActive: true },
    include: {
      classe: { select: { id: true, nom: true, code: true } },
      anneeScolaire: { select: { id: true, nom: true, estActive: true } },
    },
    orderBy: { dateInscription: 'desc' as const },
    take: 5,
  },
  assignmentsScolarite: {
    where: { statut: 'ACTIF' },
    orderBy: { createdAt: 'desc' as const },
    take: 3,
    select: {
      id: true,
      planScolariteId: true,
      classeId: true,
      anneeScolaireId: true,
      montantPersonnalise: true,
      statut: true,
      createdAt: true,
      planScolarite: {
        select: {
          id: true,
          nom: true,
          montantTotal: true,
          devise: true,
          fraisInscription: true,
          fraisScolarite: true,
          echeances: {
            select: {
              id: true,
              nom: true,
              montant: true,
              dateLimite: true,
              ordre: true,
              estPayee: true,
            },
            orderBy: { ordre: 'asc' as const },
          },
        },
      },
      anneeScolaire: { select: { id: true, nom: true } },
      classe: { select: { id: true, nom: true, code: true } },
    },
  },
  parents: {
    include: {
      parent: {
        include: {
          utilisateur: {
            select: {
              id: true,
              email: true,
              prenom: true,
              nom: true,
              telephone: true,
              photoProfil: true,
            },
          },
        },
      },
    },
    orderBy: [{ estPrincipal: 'desc' as const }, { createdAt: 'asc' as const }],
  },
  responsables: {
    orderBy: [{ estPrincipal: 'desc' as const }, { nom: 'asc' as const }],
  },
  _count: {
    select: {
      paiements: true,
      notes: true,
      presences: true,
      absences: true,
      empruntsLivres: true,
      bulletins: true,
      incidents: true,
      objectifs: true,
      reductions: true,
      communications: true,
      membresGroupesTD: true,
      objectifsSuivis: true,
    },
  },
} as const;

// ──────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────

export class EleveService {
  // ──────────────────────────────────────────
  // CREATE
  // ──────────────────────────────────────────

  async create(ctx: EleveContext, input: CreateEleveInput) {
    const client = await getClient(ctx.schemaName);

    let classe: {
      id: string;
      niveauId: string;
      nom: string;
      code: string;
    } | null = null;
    if (input.classeId) {
      classe = await client.classe.findUnique({
        where: { id: input.classeId },
        select: { id: true, niveauId: true, nom: true, code: true },
      });
      if (!classe) throw new AppError('Classe introuvable', 404);
    }

    const anneeScolaire = await resolveAnneeScolaireActive(
      client,
      input.anneeScolaireId
    );

    let planScolarite: {
      id: string;
      nom: string;
      montantTotal: number;
    } | null = null;
    if (classe) {
      planScolarite = await resolvePlanScolariteForClasse(
        client,
        classe,
        anneeScolaire.id
      );
    }

    const matricule = await generateMatricule(client);

    const compteResult = await compteService.createOrLinkUser(ctx, {
      email: input.email,
      motDePasse: input.motDePasse,
      prenom: input.prenom,
      nom: input.nom,
      role: 'ELEVE',
      telephone: input.telephone,
      photoProfil: input.photo,
      matricule,
      hasProfilCheck: (u) => !!u.eleve,
    });

    try {
      const result = await client.$transaction(async (tx: any) => {
        const created = await tx.eleve.create({
          data: {
            matricule,
            prenom: input.prenom.trim(),
            nom: input.nom.trim(),
            sexe: input.sexe,
            dateNaissance: input.dateNaissance,
            lieuNaissance: input.lieuNaissance ?? null,
            nationalite: input.nationalite ?? null,
            adresse: input.adresse ?? null,
            telephone: input.telephone ?? null,
            email: compteResult.email,
            photo: input.photo ?? null,
            infoMedicale: input.infoMedicale ?? null,
            groupeSanguin: input.groupeSanguin ?? null,
            allergies: input.allergies ?? null,
            statut: input.statut ?? 'ACTIF',
            utilisateurId: compteResult.utilisateurId,
          },
        });

        if (classe) {
          await tx.inscription.create({
            data: {
              eleveId: created.id,
              classeId: classe.id,
              anneeScolaireId: anneeScolaire.id,
              estActive: true,
            },
          });
        }

        let assignmentId: string | null = null;
        if (classe && planScolarite) {
          const assignment = await tx.assignmentScolarite.create({
            data: {
              eleveId: created.id,
              planScolariteId: planScolarite.id,
              classeId: classe.id,
              anneeScolaireId: anneeScolaire.id,
              statut: 'ACTIF',
            },
            select: { id: true },
          });
          assignmentId = assignment.id;
        }

        let echeancesInfo: {
          total: number;
          dejaPayees: number;
          impayees: number;
          montantImpaye: number;
        } | null = null;

        if (planScolarite) {
          const [total, dejaPayees, impayeesAgg] = await Promise.all([
            tx.echeance.count({
              where: { planScolariteId: planScolarite.id },
            }),
            tx.echeance.count({
              where: { planScolariteId: planScolarite.id, estPayee: true },
            }),
            tx.echeance.aggregate({
              where: { planScolariteId: planScolarite.id, estPayee: false },
              _sum: { montant: true },
              _count: { _all: true },
            }),
          ]);
          echeancesInfo = {
            total,
            dejaPayees,
            impayees: impayeesAgg._count._all,
            montantImpaye: impayeesAgg._sum.montant ?? 0,
          };
        }

        return {
          eleveId: created.id,
          matricule,
          assignmentId,
          planScolarite,
          echeancesInfo,
        };
      });

      const eleveComplet = await client.eleve.findUnique({
        where: { id: result.eleveId },
        include: eleveInclude,
      });

      const warnings: string[] = [];
      if (classe && !planScolarite) {
        warnings.push(
          `Aucun plan de scolarité actif trouvé pour la classe ${classe.nom} (${classe.code}). ` +
            `L'élève a été inscrit mais aucun assignment de scolarité n'a été créé.`
        );
      }
      if (
        planScolarite &&
        result.echeancesInfo &&
        result.echeancesInfo.total === 0
      ) {
        warnings.push(
          `Le plan de scolarité "${planScolarite.nom}" ne contient aucune échéance. ` +
            `Créez des échéances depuis le plan pour permettre les paiements.`
        );
      }

      return {
        ...eleveComplet,
        _meta: {
          planAssigned: !!planScolarite,
          assignmentId: result.assignmentId,
          echeancesInfo: result.echeancesInfo,
        },
        ...(warnings.length > 0 && { _warnings: warnings }),
      };
    } catch (err: any) {
      if (compteResult.created && compteResult.utilisateurId) {
        await compteService.deleteLinkedUser(ctx, compteResult.utilisateurId);
      }
      if (err?.code === 'P2002') {
        throw new AppError(
          err.meta?.target?.includes('email')
            ? 'Cet email est déjà utilisé'
            : 'Ce matricule existe déjà',
          409
        );
      }
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // LIST
  // ──────────────────────────────────────────

  async findAll(ctx: EleveContext, q: ListElevesQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};

    if (q.search) {
      where.OR = [
        { nom: { contains: q.search, mode: 'insensitive' } },
        { prenom: { contains: q.search, mode: 'insensitive' } },
        { matricule: { contains: q.search, mode: 'insensitive' } },
        { email: { contains: q.search, mode: 'insensitive' } },
        { telephone: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    if (q.statut) where.statut = q.statut;
    if (q.sexe) where.sexe = q.sexe;
    if (q.hasCompte === true) where.utilisateurId = { not: null };
    if (q.hasCompte === false) where.utilisateurId = null;

    if (q.classeId || q.anneeScolaireId) {
      where.inscriptions = {
        some: {
          estActive: true,
          ...(q.classeId && { classeId: q.classeId }),
          ...(q.anneeScolaireId && { anneeScolaireId: q.anneeScolaireId }),
        },
      };
    }

    const allowedSort = ['nom', 'prenom', 'matricule', 'dateNaissance', 'createdAt'];
    const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'createdAt';
    const sortOrder = q.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      client.eleve.count({ where }),
      client.eleve.findMany({
        where,
        include: eleveInclude,
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

  // ──────────────────────────────────────────
  // GET BY ID — DÉTAIL COMPLET
  // ──────────────────────────────────────────

  async findById(ctx: EleveContext, id: string) {
    const client = await getClient(ctx.schemaName);
    const now = new Date();

    // 1. Charger l'élève avec les includes de base
    const eleve = await client.eleve.findUnique({
      where: { id },
      include: {
        ...eleveInclude,
        inscriptions: {
          include: {
            classe: { select: { id: true, nom: true, code: true } },
            anneeScolaire: {
              select: { id: true, nom: true, estActive: true },
            },
          },
          orderBy: { dateInscription: 'desc' },
        },

        // 🆕 Assignments complets + plan + échéances + allocations
        assignmentsScolarite: {
          include: {
            planScolarite: {
              select: {
                id: true,
                nom: true,
                montantTotal: true,
                devise: true,
                fraisInscription: true,
                fraisScolarite: true,
                echeances: {
                  orderBy: { ordre: 'asc' },
                  include: {
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
                  },
                },
              },
            },
            anneeScolaire: { select: { id: true, nom: true } },
            classe: { select: { id: true, nom: true, code: true } },
            paiements: {
              select: {
                id: true,
                reference: true,
                montant: true,
                datePaiement: true,
                statut: true,
                moyen: true,
              },
              orderBy: { datePaiement: 'desc' as const },
              take: 20,
            },
            reductions: {
              select: {
                id: true,
                type: true,
                valeur: true,
                motif: true,
                approuveLe: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },

        // 🆕 Paiements directs (liste récente pour onglet)
        paiements: {
          take: 20,
          orderBy: { datePaiement: 'desc' as const },
          include: {
            recu: {
              select: { id: true, numeroRecu: true, cheminPDF: true },
            },
            caissier: {
              select: { id: true, prenom: true, nom: true, email: true },
            },
            allocations: {
              include: {
                echeance: {
                  select: {
                    id: true,
                    nom: true,
                    montant: true,
                    dateLimite: true,
                  },
                },
              },
            },
          },
        },

        // 🆕 Présences récentes
        presences: {
          take: 10,
          orderBy: { date: 'desc' as const },
          select: {
            id: true,
            date: true,
            heureArrivee: true,
            statut: true,
            motif: true,
            justificatif: true,
            notes: true,
            createdAt: true,
          },
        },

        // 🆕 Absences récentes
        absences: {
          take: 10,
          orderBy: { dateDebut: 'desc' as const },
          select: {
            id: true,
            dateDebut: true,
            dateFin: true,
            type: true,
            motif: true,
            statut: true,
            justificatif: true,
            approuveLe: true,
            motifRejet: true,
            createdAt: true,
          },
        },

        // Notes (pour onglet Notes — 10 dernières)
        notes: {
          take: 10,
          orderBy: { dateSaisie: 'desc' as const },
          include: {
            matiere: { select: { id: true, nom: true, code: true } },
            periode: { select: { id: true, nom: true, type: true } },
            regleEvaluation: {
              select: {
                id: true,
                nom: true,
                type: true,
                coefficient: true,
                baremeMax: true,
              },
            },
            enseignant: {
              select: { id: true, prenom: true, nom: true },
            },
          },
        },

        bulletins: {
          take: 5,
          orderBy: { genereLe: 'desc' },
          include: {
            periode: { select: { id: true, nom: true } },
            anneeScolaire: { select: { id: true, nom: true } },
            classe: { select: { id: true, nom: true } },
          },
        },
        empruntsLivres: {
          take: 5,
          orderBy: { dateEmprunt: 'desc' },
          include: {
            livre: { select: { id: true, titre: true, auteur: true } },
          },
        },
        incidents: {
          take: 5,
          orderBy: { dateIncident: 'desc' },
        },
        objectifs: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            enseignant: { select: { id: true, prenom: true, nom: true } },
            periode: { select: { id: true, nom: true } },
          },
        },
        reductions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!eleve) throw new AppError('Élève introuvable', 404);

    // 2. Enrichir les échéances (paiement partiel, retard…)
    const assignmentsEnrichis = (eleve.assignmentsScolarite ?? []).map(
      (a: any) => ({
        ...a,
        planScolarite: a.planScolarite
          ? {
              ...a.planScolarite,
              echeances: (a.planScolarite.echeances ?? []).map((e: any) =>
                enrichirEcheance(e, now)
              ),
            }
          : null,
      })
    );

    // 3. Résumé financier global
    const resumeFinancier = await buildResumeFinancier(client, id);

    // 4. 🆕 Emploi du temps de la classe active
    const classeActive = eleve.inscriptions?.find(
      (i: any) => i.estActive && i.classe
    )?.classe;
    let emploiTemps: any[] = [];
    let equipePedagogique: any[] = [];

    if (classeActive) {
      const [edt, affectations] = await Promise.all([
        client.emploiTemps.findMany({
          where: { classeId: classeActive.id, estActive: true },
          include: {
            matiere: { select: { id: true, nom: true, code: true } },
            enseignant: {
              select: { id: true, prenom: true, nom: true, specialite: true },
            },
          },
          orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
        }),
        client.affectationEnseignant.findMany({
          where: { classeId: classeActive.id, estActive: true },
          include: {
            enseignant: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                specialite: true,
                email: true,
                telephone: true,
                photo: true,
              },
            },
            matiere: { select: { id: true, nom: true, code: true } },
          },
        }),
      ]);
      emploiTemps = edt;
      equipePedagogique = affectations;
    }

    // 5. Construire la réponse
    return {
      ...eleve,
      assignmentsScolarite: assignmentsEnrichis,
      classeActive,
      emploiTemps,
      equipePedagogique,
      _finance: resumeFinancier, // 🆕 résumé financier complet
      _stats: {
        // 🆕 quelques compteurs dérivés pour le front
        nombrePaiements:
          (eleve.paiements ?? []).filter((p: any) => p.statut === 'COMPLET')
            .length,
        montantTotalPaye: (eleve.paiements ?? [])
          .filter((p: any) => p.statut === 'COMPLET')
          .reduce((s: number, p: any) => s + p.montant, 0),
        nombrePresences: eleve._count?.presences ?? 0,
        nombreAbsences: eleve._count?.absences ?? 0,
        nombreNotes: eleve._count?.notes ?? 0,
        nombreBulletins: eleve._count?.bulletins ?? 0,
      },
    };
  }

  // ──────────────────────────────────────────
  // UPDATE
  // ──────────────────────────────────────────

  async update(ctx: EleveContext, id: string, input: UpdateEleveInput) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.eleve.findUnique({
      where: { id },
      select: {
        id: true,
        utilisateurId: true,
        matricule: true,
        email: true,
      },
    });
    if (!existing) throw new AppError('Élève introuvable', 404);

    let utilisateurId = existing.utilisateurId;

    if (!utilisateurId && input.createCompte) {
      if (!input.email) {
        throw new AppError('Email requis pour créer un compte utilisateur', 400);
      }
      const compteResult = await compteService.createOrLinkUser(ctx, {
        email: input.email,
        motDePasse: input.motDePasse,
        prenom: input.prenom ?? '',
        nom: input.nom ?? '',
        role: 'ELEVE',
        telephone: input.telephone,
        photoProfil: input.photo,
        matricule: existing.matricule,
        hasProfilCheck: (u) => !!u.eleve,
      });
      utilisateurId = compteResult.utilisateurId;
    }

    if (utilisateurId) {
      await compteService.updateLinkedUser(ctx, utilisateurId, {
        email: input.email,
        motDePasse: input.motDePasse,
        prenom: input.prenom,
        nom: input.nom,
        telephone: input.telephone,
        photoProfil: input.photo,
      });
    }

    const patch: any = {};
    if (input.prenom !== undefined) patch.prenom = input.prenom.trim();
    if (input.nom !== undefined) patch.nom = input.nom.trim();
    if (input.sexe !== undefined) patch.sexe = input.sexe;
    if (input.dateNaissance !== undefined)
      patch.dateNaissance = input.dateNaissance;
    if (input.lieuNaissance !== undefined)
      patch.lieuNaissance = input.lieuNaissance;
    if (input.nationalite !== undefined) patch.nationalite = input.nationalite;
    if (input.adresse !== undefined) patch.adresse = input.adresse;
    if (input.telephone !== undefined) patch.telephone = input.telephone;
    if (input.email !== undefined)
      patch.email = input.email?.toLowerCase().trim() ?? null;
    if (input.photo !== undefined) patch.photo = input.photo;
    if (input.infoMedicale !== undefined)
      patch.infoMedicale = input.infoMedicale;
    if (input.groupeSanguin !== undefined)
      patch.groupeSanguin = input.groupeSanguin;
    if (input.allergies !== undefined) patch.allergies = input.allergies;
    if (input.statut !== undefined) patch.statut = input.statut;
    if (utilisateurId && utilisateurId !== existing.utilisateurId) {
      patch.utilisateurId = utilisateurId;
    }

    const changementClasse = (input as any).classeId !== undefined;
    const nouvelleClasseId: string | null = (input as any).classeId ?? null;

    try {
      const updated = await client.$transaction(async (tx: any) => {
        const eleveMaj = await tx.eleve.update({
          where: { id },
          data: patch,
        });

        if (changementClasse) {
          if (nouvelleClasseId) {
            const classe = await tx.classe.findUnique({
              where: { id: nouvelleClasseId },
              select: { id: true, niveauId: true, nom: true, code: true },
            });
            if (!classe) throw new AppError('Classe introuvable', 404);

            const anneeScolaire = await resolveAnneeScolaireActive(
              tx,
              (input as any).anneeScolaireId ?? null
            );

            await tx.inscription.updateMany({
              where: { eleveId: id, estActive: true },
              data: { estActive: false },
            });

            await tx.inscription.create({
              data: {
                eleveId: id,
                classeId: classe.id,
                anneeScolaireId: anneeScolaire.id,
                estActive: true,
              },
            });

            const plan = await resolvePlanScolariteForClasse(
              tx,
              classe,
              anneeScolaire.id
            );

            if (plan) {
              const deja = await tx.assignmentScolarite.findFirst({
                where: {
                  eleveId: id,
                  planScolariteId: plan.id,
                  anneeScolaireId: anneeScolaire.id,
                },
                select: { id: true },
              });
              if (!deja) {
                await tx.assignmentScolarite.create({
                  data: {
                    eleveId: id,
                    planScolariteId: plan.id,
                    classeId: classe.id,
                    anneeScolaireId: anneeScolaire.id,
                    statut: 'ACTIF',
                  },
                });
              }
            }
          } else {
            await tx.inscription.updateMany({
              where: { eleveId: id, estActive: true },
              data: { estActive: false },
            });
          }
        }

        return eleveMaj;
      });

      return client.eleve.findUnique({
        where: { id: updated.id },
        include: eleveInclude,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError('Cet email est déjà utilisé', 409);
      }
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // SOFT DELETE
  // ──────────────────────────────────────────

  async softDelete(ctx: EleveContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.eleve.findUnique({
      where: { id },
      select: { id: true, utilisateurId: true, statut: true },
    });
    if (!existing) throw new AppError('Élève introuvable', 404);

    if (existing.statut === 'ARCHIVE') {
      return { id, message: 'Élève déjà archivé' };
    }

    await client.eleve.update({
      where: { id },
      data: { statut: 'ARCHIVE' },
    });

    if (existing.utilisateurId) {
      await client.utilisateur.update({
        where: { id: existing.utilisateurId },
        data: { estActif: false, jetonActualisation: null },
      });
    }

    return { id, message: 'Élève archivé et compte désactivé' };
  }

  // ──────────────────────────────────────────
  // HARD DELETE
  // ──────────────────────────────────────────

  async hardDelete(ctx: EleveContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.eleve.findUnique({
      where: { id },
      select: { id: true, utilisateurId: true, matricule: true },
    });
    if (!existing) throw new AppError('Élève introuvable', 404);

    const [
      nbInscriptions,
      nbPaiements,
      nbNotes,
      nbBulletins,
      nbPresences,
      nbAbsences,
      nbIncidents,
      nbEmprunts,
      nbAssignments,
    ] = await Promise.all([
      client.inscription.count({ where: { eleveId: id } }),
      client.paiement.count({ where: { eleveId: id } }),
      client.note.count({ where: { eleveId: id } }),
      client.bulletin.count({ where: { eleveId: id } }),
      client.presenceEleve.count({ where: { eleveId: id } }),
      client.absenceEleve.count({ where: { eleveId: id } }),
      client.incident.count({ where: { eleveId: id } }),
      client.empruntLivre.count({ where: { eleveId: id } }),
      client.assignmentScolarite.count({ where: { eleveId: id } }),
    ]);

    const total =
      nbInscriptions +
      nbPaiements +
      nbNotes +
      nbBulletins +
      nbPresences +
      nbAbsences +
      nbIncidents +
      nbEmprunts +
      nbAssignments;

    if (total > 0) {
      throw new AppError(
        `Suppression impossible : ${nbInscriptions} inscription(s), ` +
          `${nbPaiements} paiement(s), ${nbNotes} note(s), ` +
          `${nbBulletins} bulletin(s), ${nbPresences} présence(s), ` +
          `${nbAbsences} absence(s), ${nbIncidents} incident(s), ` +
          `${nbEmprunts} emprunt(s), ${nbAssignments} assignment(s). ` +
          `Archivez l'élève à la place.`,
        409
      );
    }

    const utilisateurId = existing.utilisateurId;

    await client.eleve.delete({ where: { id } });

    if (utilisateurId) {
      await compteService.deleteLinkedUser(ctx, utilisateurId);
    }

    return { id, message: 'Élève et compte supprimés définitivement' };
  }
}

export const eleveService = new EleveService();