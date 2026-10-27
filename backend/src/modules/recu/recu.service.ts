// backend/src/modules/recu/recu.service.ts

import { getTenantClient } from '../../config/tenant-db';
import { AppError } from '../../utils/AppError';
import crypto from 'crypto';
import type {
  GenererRecuInput,
  ListRecusQuery,
} from './recu.validation';

export interface RecuContext {
  schemaName: string;
  etablissementId: string;
  userId: string;
}

type FormatImpression = 'A4' | 'A5' | '80MM';

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

// ──────────────────────────────────────────
// GÉNÉRATION DU NUMÉRO DE REÇU
// ──────────────────────────────────────────

async function generateNumeroRecu(client: any): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `REC-${year}-`;

  const last = await client.recu.findFirst({
    where: { numeroRecu: { startsWith: prefix } },
    orderBy: { numeroRecu: 'desc' },
    select: { numeroRecu: true },
  });

  let next = 1;
  if (last?.numeroRecu) {
    const parts = last.numeroRecu.split('-');
    next = parseInt(parts[parts.length - 1], 10) + 1;
  }

  return `${prefix}${String(next).padStart(6, '0')}`;
}

// ──────────────────────────────────────────
// CODE DE VÉRIFICATION (QR)
// ──────────────────────────────────────────

function generateCodeVerification(): string {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

// ──────────────────────────────────────────
// TYPES INTERNES
// ──────────────────────────────────────────

interface EcheanceStatus {
  echeanceId: string;
  nom: string;
  ordre: number;
  montant: number;
  montantPaye: number;         // cumul avant ce paiement
  montantPayeApres: number;    // cumul après ce paiement
  montantRestant: number;
  dateLimite: string;
  estPayee: boolean;
  estPartielle: boolean;
  estEnRetard: boolean;
  joursRestants: number;       // négatif si dépassé
}

interface DetailsFinanciers {
  // Plan
  planNom: string;
  montantTotal: number;
  montantReduction: number;
  montantNet: number;
  devise: string;

  // Avant ce paiement
  montantPayeAvant: number;
  montantRestantAvant: number;

  // Après ce paiement (inclut ce paiement)
  montantPayeApres: number;
  montantRestantApres: number;
  pourcentagePaye: number;

  // Statut global
  estSolde: boolean;
  estAJour: boolean;
  estEnRetard: boolean;
  echeancesEnRetard: number;
  prochaineEcheance?: {
    nom: string;
    montant: number;
    dateLimite: string;
    joursRestants: number;
  };

  // Détail par échéance
  echeances: EcheanceStatus[];
}

// ──────────────────────────────────────────
// CALCUL DÉTAILLÉ DES FINANCES
// ──────────────────────────────────────────

async function calculerDetailsFinanciers(
  client: any,
  eleveId: string,
  assignmentId: string | null | undefined,
  paiementCourantId: string,     // pour exclure le paiement actuel du "cumul avant"
  montantPaiementCourant: number
): Promise<DetailsFinanciers> {
  const emptyDetails: DetailsFinanciers = {
    planNom: '—',
    montantTotal: 0,
    montantReduction: 0,
    montantNet: 0,
    devise: 'XOF',
    montantPayeAvant: 0,
    montantRestantAvant: 0,
    montantPayeApres: 0,
    montantRestantApres: 0,
    pourcentagePaye: 0,
    estSolde: false,
    estAJour: false,
    estEnRetard: false,
    echeancesEnRetard: 0,
    echeances: [],
  };

  // 1. Récupérer l'assignment complet avec plan, échéances, paiements, réductions
  const assignment = assignmentId
    ? await client.assignmentScolarite.findUnique({
        where: { id: assignmentId },
        include: {
          planScolarite: {
            include: {
              echeances: { orderBy: { ordre: 'asc' } },
            },
          },
          reductions: true,
          paiements: {
            where: { statut: 'COMPLET' },
            select: {
              id: true,
              montant: true,
              allocations: {
                select: {
                  echeanceId: true,
                  montant: true,
                },
              },
            },
          },
        },
      })
    : await client.assignmentScolarite.findFirst({
        where: { eleveId, statut: 'ACTIF' },
        include: {
          planScolarite: {
            include: {
              echeances: { orderBy: { ordre: 'asc' } },
            },
          },
          reductions: true,
          paiements: {
            where: { statut: 'COMPLET' },
            select: {
              id: true,
              montant: true,
              allocations: {
                select: {
                  echeanceId: true,
                  montant: true,
                },
              },
            },
          },
        },
      });

  if (!assignment) return emptyDetails;

  const plan = assignment.planScolarite;
  const devise = plan.devise ?? 'XOF';
  const montantTotal = plan.montantTotal;

  // 2. Réductions
  const montantReduction = assignment.reductions.reduce(
    (sum: number, r: any) => {
      if (r.type === 'FIXE') return sum + r.valeur;
      return sum + (montantTotal * r.valeur) / 100;
    },
    0
  );
  const montantNet = Math.max(0, montantTotal - montantReduction);

  // 3. Calcul "avant ce paiement" (exclure le paiement courant)
  const paiementsAvant = assignment.paiements.filter(
    (p: any) => p.id !== paiementCourantId
  );
  const montantPayeAvant = paiementsAvant.reduce(
    (s: number, p: any) => s + p.montant,
    0
  );
  const montantRestantAvant = Math.max(0, montantNet - montantPayeAvant);

  // 4. Calcul "après ce paiement"
  const montantPayeApres = montantPayeAvant + montantPaiementCourant;
  const montantRestantApres = Math.max(0, montantNet - montantPayeApres);
  const pourcentagePaye =
    montantNet > 0
      ? Math.min(100, Math.round((montantPayeApres / montantNet) * 100))
      : 100;
  const estSolde = montantRestantApres <= 0.01;

  // 5. Cumul des allocations par échéance (avant + après)
  const cumulAvantParEcheance = new Map<string, number>();
  const cumulApresParEcheance = new Map<string, number>();

  for (const p of assignment.paiements) {
    const isCurrent = p.id === paiementCourantId;
    for (const alloc of p.allocations ?? []) {
      // Cumul "après" = tous les paiements (y compris le courant)
      cumulApresParEcheance.set(
        alloc.echeanceId,
        (cumulApresParEcheance.get(alloc.echeanceId) ?? 0) + alloc.montant
      );
      // Cumul "avant" = tous sauf le courant
      if (!isCurrent) {
        cumulAvantParEcheance.set(
          alloc.echeanceId,
          (cumulAvantParEcheance.get(alloc.echeanceId) ?? 0) + alloc.montant
        );
      }
    }
  }

  // 6. Construire le statut par échéance
  const today = new Date();
  const echeances: EcheanceStatus[] = plan.echeances.map((e: any) => {
    const montantPayeAvEch = cumulAvantParEcheance.get(e.id) ?? 0;
    const montantPayeApEch = cumulApresParEcheance.get(e.id) ?? 0;
    const montantRestantEch = Math.max(0, e.montant - montantPayeApEch);
    const estPayee = montantRestantEch <= 0.01;
    const estPartielle =
      montantPayeApEch > 0 && !estPayee;
    const dateLimite = new Date(e.dateLimite);
    const joursRestants = Math.ceil(
      (dateLimite.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const estEnRetard = !estPayee && joursRestants < 0;

    return {
      echeanceId: e.id,
      nom: e.nom,
      ordre: e.ordre,
      montant: e.montant,
      montantPaye: montantPayeAvEch,
      montantPayeApres: montantPayeApEch,
      montantRestant: montantRestantEch,
      dateLimite: dateLimite.toISOString(),
      estPayee,
      estPartielle,
      estEnRetard,
      joursRestants,
    };
  });

  // 7. Statistiques globales
  const echeancesEnRetard = echeances.filter((e) => e.estEnRetard).length;
  const estEnRetard = echeancesEnRetard > 0;
  const estAJour = !estSolde && !estEnRetard;

  // 8. Prochaine échéance à payer (la plus proche dans le futur ou en retard)
  const prochainesEcheances = echeances
    .filter((e) => !e.estPayee)
    .sort((a, b) => a.ordre - b.ordre);
  const prochaine = prochainesEcheances[0];

  return {
    planNom: plan.nom,
    montantTotal,
    montantReduction,
    montantNet,
    devise,
    montantPayeAvant,
    montantRestantAvant,
    montantPayeApres,
    montantRestantApres,
    pourcentagePaye,
    estSolde,
    estAJour,
    estEnRetard,
    echeancesEnRetard,
    ...(prochaine && {
      prochaineEcheance: {
        nom: prochaine.nom,
        montant: prochaine.montantRestant,
        dateLimite: prochaine.dateLimite,
        joursRestants: prochaine.joursRestants,
      },
    }),
    echeances,
  };
}

// ──────────────────────────────────────────
// HELPERS DE LABEL
// ──────────────────────────────────────────

const MOYEN_LABEL: Record<string, string> = {
  ESPECES: 'Espèces',
  VIREMENT: 'Virement bancaire',
  MOBILE_MONEY: 'Mobile Money',
  CARTE: 'Carte bancaire',
  CHEQUE: 'Chèque',
  AUTRE: 'Autre',
};

// ──────────────────────────────────────────
// INCLUDES
// ──────────────────────────────────────────

const recuInclude = {
  paiement: {
    select: {
      id: true,
      reference: true,
      moyen: true,
      referenceMoyen: true,
      statut: true,
    },
  },
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
  generateur: {
    select: {
      id: true,
      prenom: true,
      nom: true,
    },
  },
} as const;

// ──────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────

export class RecuService {
  // ──────────────────────────────────────────
  // GÉNÉRER
  // ──────────────────────────────────────────

  async generer(ctx: RecuContext, input: GenererRecuInput) {
    const client = await getClient(ctx.schemaName);

    // 1. Récupérer le paiement
    const paiement = await client.paiement.findUnique({
      where: { id: input.paiementId },
      include: {
        eleve: {
          include: {
            inscriptions: {
              where: { estActive: true },
              include: {
                classe: {
                  include: {
                    niveau: { select: { id: true, nom: true } },
                  },
                },
                anneeScolaire: { select: { id: true, nom: true } },
              },
              orderBy: { dateInscription: 'desc' },
              take: 1,
            },
          },
        },
        allocations: {
          include: {
            echeance: {
              select: {
                id: true,
                nom: true,
                montant: true,
                ordre: true,
                dateLimite: true,
              },
            },
          },
        },
        assignment: {
          include: {
            planScolarite: true,
            reductions: true,
          },
        },
        recu: { select: { id: true } },
      },
    });

    if (!paiement) throw new AppError('Paiement introuvable', 404);
    if (paiement.statut !== 'COMPLET') {
      throw new AppError(
        'Impossible de générer un reçu pour un paiement non complété',
        400
      );
    }
    if (paiement.recu) {
      throw new AppError('Un reçu existe déjà pour ce paiement', 409);
    }

    // 2. Établissement
    const { globalPrisma } = await import('../../config/global-db');
    const etablissement = await globalPrisma.etablissement.findUnique({
      where: { id: ctx.etablissementId },
      select: {
        id: true,
        nom: true,
        code: true,
        logo: true,
        adresse: true,
        ville: true,
        pays: true,
        telephone: true,
        email: true,
        siteWeb: true,
        numeroAgrement: true,
        devise: true,
      },
    });
    if (!etablissement) {
      throw new AppError('Établissement introuvable', 404);
    }

    // 3. Infos classe
    const inscription = paiement.eleve.inscriptions[0];
    const nomClasse = inscription?.classe?.nom ?? 'Non inscrit';
    const codeClasse = inscription?.classe?.code ?? null;
    const nomNiveau = inscription?.classe?.niveau?.nom ?? null;
    const nomAnnee = inscription?.anneeScolaire?.nom ?? null;

    // 4. Détails financiers enrichis (calcul AVANT insertion, en excluant ce paiement)
    const details = await calculerDetailsFinanciers(
      client,
      paiement.eleveId,
      paiement.assignmentId,
      paiement.id,
      paiement.montant
    );

    // 5. Échéances couvertes par CE paiement (avec statut détaillé)
    const echeancesCouvertes = paiement.allocations.map((a: any) => {
      const echStatus = details.echeances.find(
        (e) => e.echeanceId === a.echeance.id
      );
      return {
        nom: a.echeance.nom,
        montant: a.montant,                     // montant de CE paiement sur cette échéance
        ordre: a.echeance.ordre,
        dateLimite: a.echeance.dateLimite,
        montantEcheanceTotal: a.echeance.montant,
        montantPayeCumule: echStatus?.montantPayeApres ?? a.montant,
        montantRestantSurEcheance: echStatus?.montantRestant ?? 0,
        estPayee: echStatus?.estPayee ?? false,
        estPartielle: echStatus?.estPartielle ?? false,
        estEnRetard: echStatus?.estEnRetard ?? false,
      };
    });

    // 6. Numéro + code
    const numeroRecu = await generateNumeroRecu(client);
    const codeVerification = generateCodeVerification();
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const urlVerification = `${baseUrl}/verifier-recu/${codeVerification}`;

    // 7. Construire le snapshot financier complet
    const snapshotFinancier = {
      // Plan
      planNom: details.planNom,
      montantTotalPlan: details.montantTotal,
      montantReduction: details.montantReduction,
      montantNet: details.montantNet,
      devise: details.devise,

      // Situation avant ce paiement
      montantPayeAvant: details.montantPayeAvant,
      montantRestantAvant: details.montantRestantAvant,

      // Situation après ce paiement
      montantPayeApres: details.montantPayeApres,
      montantRestantApres: details.montantRestantApres,
      pourcentagePaye: details.pourcentagePaye,

      // Statut global
      estSolde: details.estSolde,
      estAJour: details.estAJour,
      estEnRetard: details.estEnRetard,
      echeancesEnRetard: details.echeancesEnRetard,

      // Prochaine échéance
      prochaineEcheance: details.prochaineEcheance ?? null,

      // Détail complet par échéance
      echeances: details.echeances,

      // Généré à
      calculeLe: new Date().toISOString(),
    };

    // 8. Créer le reçu
    return client.recu.create({
      data: {
        numeroRecu,
        paiementId: paiement.id,
        eleveId: paiement.eleveId,
        nomEleve: `${paiement.eleve.prenom} ${paiement.eleve.nom}`,
        nomClasse,
        montant: paiement.montant,
        datePaiement: paiement.datePaiement,
        moyenPaiement: paiement.moyen,
        echeancesCouvertes: echeancesCouvertes as any,  // enrichi
        soldeApres: details.montantRestantApres,
        generePar: ctx.userId,
        cheminPDF: null,

        // Snapshot établissement
        etablissementNom: etablissement.nom,
        etablissementLogo: etablissement.logo,
        etablissementAdresse: etablissement.adresse,
        etablissementVille: etablissement.ville,
        etablissementPays: etablissement.pays,
        etablissementTelephone: etablissement.telephone,
        etablissementEmail: etablissement.email,
        etablissementSiteWeb: etablissement.siteWeb,
        etablissementCode: etablissement.code,
        etablissementAgrement: etablissement.numeroAgrement,
        etablissementDevise: etablissement.devise,

        // Snapshot élève
        eleveMatricule: paiement.eleve.matricule,
        elevePrenom: paiement.eleve.prenom,
        eleveNom: paiement.eleve.nom,
        eleveSexe: paiement.eleve.sexe,

        // Snapshot classe
        classeNom: nomClasse,
        classeCode: codeClasse,
        niveauNom: nomNiveau,
        anneeScolaireNom: nomAnnee,

        // Détails financiers
        montantPaye: paiement.montant,
        montantReduction: details.montantReduction,
        montantRestant: details.montantRestantApres,
        devise: etablissement.devise,
        referencePaiement: paiement.reference,
        moyenPaiementLabel: MOYEN_LABEL[paiement.moyen] ?? paiement.moyen,

        // Vérification
        codeVerification,
        urlVerification,

        // 🆕 Snapshot financier complet (JSON libre)
        // ⚠️ Si ton schéma Prisma a un champ `detailsFinanciers Json?`, décommente.
        // Sinon, ces données sont déjà réparties dans `echeancesCouvertes` + `soldeApres`.
         detailsFinanciers: snapshotFinancier,
      },
      include: recuInclude,
    });
  }

  // ──────────────────────────────────────────
  // LIST
  // ──────────────────────────────────────────

  async findAll(ctx: RecuContext, q: ListRecusQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};
    if (q.search) {
      where.OR = [
        { numeroRecu: { contains: q.search, mode: 'insensitive' } },
        { nomEleve: { contains: q.search, mode: 'insensitive' } },
        { nomClasse: { contains: q.search, mode: 'insensitive' } },
        { codeVerification: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    if (q.eleveId) where.eleveId = q.eleveId;

    if (q.dateDebut || q.dateFin) {
      where.datePaiement = {};
      if (q.dateDebut) where.datePaiement.gte = new Date(q.dateDebut);
      if (q.dateFin) where.datePaiement.lte = new Date(q.dateFin);
    }

    const allowedSort = ['datePaiement', 'montant', 'createdAt'];
    const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'datePaiement';
    const sortOrder = q.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      client.recu.count({ where }),
      client.recu.findMany({
        where,
        include: recuInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ]);

    // ✅ Correction : `montant` (champ réel du modèle Prisma)
    const totalMontant = await client.recu.aggregate({
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

  async findById(ctx: RecuContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const recu = await client.recu.findUnique({
      where: { id },
      include: recuInclude,
    });

    if (!recu) throw new AppError('Reçu introuvable', 404);
    return recu;
  }

  // ──────────────────────────────────────────
  // GET BY NUMÉRO
  // ──────────────────────────────────────────

  async findByNumero(ctx: RecuContext, numeroRecu: string) {
    const client = await getClient(ctx.schemaName);

    const recu = await client.recu.findUnique({
      where: { numeroRecu },
      include: recuInclude,
    });

    if (!recu) throw new AppError('Reçu introuvable', 404);
    return recu;
  }

  // ──────────────────────────────────────────
  // VÉRIFICATION PUBLIQUE
  // ──────────────────────────────────────────

  async verifier(ctx: RecuContext, codeVerification: string) {
    const client = await getClient(ctx.schemaName);

    const recu = await client.recu.findUnique({
      where: { codeVerification },
      select: {
        numeroRecu: true,
        nomEleve: true,
        nomClasse: true,
        montantPaye: true,
        montantRestant: true,
        devise: true,
        datePaiement: true,
        moyenPaiementLabel: true,
        etablissementNom: true,
        etablissementCode: true,
        soldeApres: true,
        echeancesCouvertes: true,
        createdAt: true,
      },
    });

    if (!recu) {
      return {
        valide: false,
        message: 'Aucun reçu ne correspond à ce code de vérification',
      };
    }

    return {
      valide: true,
      recu,
      message: 'Reçu authentifié',
    };
  }

  // ──────────────────────────────────────────
  // GET BY ELEVE
  // ──────────────────────────────────────────

  async findByEleve(ctx: RecuContext, eleveId: string) {
    const client = await getClient(ctx.schemaName);

    const recus = await client.recu.findMany({
      where: { eleveId },
      include: recuInclude,
      orderBy: { datePaiement: 'desc' },
    });

    return recus;
  }

  // ──────────────────────────────────────────
  // MARQUER COMME IMPRIMÉ
  // ──────────────────────────────────────────

  async marquerImprime(
    ctx: RecuContext,
    id: string,
    format: FormatImpression
  ) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.recu.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new AppError('Reçu introuvable', 404);

    const patch: any = {
      nombreImpressions: { increment: 1 },
      derniereImpression: new Date(),
      formatImprime: format,
    };

    if (format === 'A4') patch.cheminPDF_A4 = `/recus/${id}-A4.pdf`;
    if (format === 'A5') patch.cheminPDF_A5 = `/recus/${id}-A5.pdf`;
    if (format === '80MM') patch.cheminPDF_80MM = `/recus/${id}-80MM.pdf`;

    return client.recu.update({
      where: { id },
      data: patch,
    });
  }

  // ──────────────────────────────────────────
  // HARD DELETE
  // ──────────────────────────────────────────

  async hardDelete(ctx: RecuContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.recu.findUnique({
      where: { id },
      select: { id: true, numeroRecu: true },
    });
    if (!existing) throw new AppError('Reçu introuvable', 404);

    await client.recu.delete({ where: { id } });
    return {
      id,
      message: `Reçu ${existing.numeroRecu} supprimé définitivement`,
    };
  }
}

export const recuService = new RecuService();