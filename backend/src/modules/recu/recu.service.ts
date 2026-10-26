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
// CALCUL DU SOLDE APRÈS
// ──────────────────────────────────────────

async function calculerDetailsFinanciers(
  client: any,
  eleveId: string,
  assignmentId?: string | null
): Promise<{
  montantTotal: number;
  montantReduction: number;
  montantPaye: number;
  montantRestant: number;
}> {
  let assignment;
  if (assignmentId) {
    assignment = await client.assignmentScolarite.findUnique({
      where: { id: assignmentId },
      include: {
        planScolarite: true,
        paiements: { where: { statut: 'COMPLET' }, select: { montant: true } },
        reductions: true,
      },
    });
  } else {
    assignment = await client.assignmentScolarite.findFirst({
      where: { eleveId, statut: 'ACTIF' },
      include: {
        planScolarite: true,
        paiements: { where: { statut: 'COMPLET' }, select: { montant: true } },
        reductions: true,
      },
    });
  }

  if (!assignment) {
    return { montantTotal: 0, montantReduction: 0, montantPaye: 0, montantRestant: 0 };
  }

  const montantTotal = assignment.planScolarite.montantTotal;

  const montantReduction = assignment.reductions.reduce((sum: number, r: any) => {
    if (r.type === 'FIXE') return sum + r.valeur;
    return sum + (montantTotal * r.valeur) / 100;
  }, 0);

  const montantNet = Math.max(0, montantTotal - montantReduction);

  const montantPaye = assignment.paiements.reduce(
    (sum: number, p: any) => sum + p.montant,
    0
  );

  return {
    montantTotal,
    montantReduction,
    montantPaye,
    montantRestant: Math.max(0, montantNet - montantPaye),
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

    // 1. Récupérer le paiement avec toutes les relations
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
              select: { id: true, nom: true, montant: true, ordre: true },
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

    // 2. Récupérer l'établissement (catalogue global)
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

    // 3. Infos classe / niveau / année
    const inscription = paiement.eleve.inscriptions[0];
    const nomClasse = inscription?.classe?.nom ?? 'Non inscrit';
    const codeClasse = inscription?.classe?.code ?? null;
    const nomNiveau = inscription?.classe?.niveau?.nom ?? null;
    const nomAnnee = inscription?.anneeScolaire?.nom ?? null;

    // 4. Échéances couvertes
    const echeancesCouvertes = paiement.allocations.map((a: any) => ({
      nom: a.echeance.nom,
      montant: a.montant,
      ordre: a.echeance.ordre,
    }));

    // 5. Détails financiers
    const details = await calculerDetailsFinanciers(
      client,
      paiement.eleveId,
      paiement.assignmentId
    );

    // 6. Numéro + code de vérification
    const numeroRecu = await generateNumeroRecu(client);
    const codeVerification = generateCodeVerification();

    // 7. URL de vérification publique
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const urlVerification = `${baseUrl}/verifier-recu/${codeVerification}`;

    // 8. Créer le reçu avec snapshot complet
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
        echeancesCouvertes,
        soldeApres: details.montantRestant,
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
        montantRestant: details.montantRestant,
        devise: etablissement.devise,
        referencePaiement: paiement.reference,
        moyenPaiementLabel: MOYEN_LABEL[paiement.moyen] ?? paiement.moyen,

        // Vérification
        codeVerification,
        urlVerification,
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

    const totalMontant = await client.recu.aggregate({
      where,
      _sum: { montantPaye: true },
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
        totalMontant: totalMontant._sum.montantPaye ?? 0,
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
        devise: true,
        datePaiement: true,
        moyenPaiementLabel: true,
        etablissementNom: true,
        etablissementCode: true,
        soldeApres: true,
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

    // Mise à jour du chemin spécifique au format
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