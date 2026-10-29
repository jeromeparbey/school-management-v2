// frontend2/src/types/inscription.types.ts

// ============================================
// RÉSUMÉS (relations imbriquées)
// ============================================

export interface EleveSummary {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: 'M' | 'F' | string;
  photo: string | null;
  statut: 'ACTIF' | 'TRANSFERE' | 'SORTI' | 'SUSPENDU' | 'ARCHIVE' | string;
}

export interface ClasseSummary {
  id: string;
  nom: string;
  code: string;
  capacite: number | null;
  niveau?: { id: string; nom: string; code: string } | null;
}

export interface AnneeScolaireSummary {
  id: string;
  nom: string;
  estActive: boolean;
}

// ============================================
// 🆕 TYPES UTILITAIRES
// ============================================

export type MoyenPaiement =
  | 'ESPECES'
  | 'VIREMENT'
  | 'MOBILE_MONEY'
  | 'CARTE'
  | 'CHEQUE'
  | 'AUTRE';

export type StatutPaiement = 'COMPLET' | 'ANNULE' | 'REMBOURSE';

export type StatutEcheance =
  | 'PAYEE'
  | 'PARTIELLE'
  | 'IMPAYEE'
  | 'EN_RETARD';

// ============================================
// INSCRIPTION (modèle principal)
// ============================================

export interface Inscription {
  id: string;
  eleveId: string;
  classeId: string;
  anneeScolaireId: string;
  dateInscription: string;
  estActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  eleve?: EleveSummary;
  classe?: ClasseSummary;
  anneeScolaire?: AnneeScolaireSummary;

  // 🆕 Détails optionnels (retournés par findById)
  planScolarite?: PlanScolariteResume | null;
  assignment?: AssignmentResume | null;
  resumeFinancier?: ResumeFinancier | null;
  paiements?: PaiementResume[];
}

// ============================================
// 🆕 RÉSUMÉS FINANCIERS
// ============================================

/**
 * Une échéance du plan, avec son état de paiement pour un élève.
 */
export interface EcheanceResume {
  id: string;
  nom: string;
  ordre: number;
  montant: number;
  dateLimite: string;
  paye: number;
  restant: number;
  statut: StatutEcheance;
}

/**
 * Plan de scolarité tel qu'exposé dans le contexte inscription.
 */
export interface PlanScolariteResume {
  id: string;
  nom: string;
  montantTotal: number;
  fraisInscription: number;
  fraisScolarite: number;
  autresFrais?: any;
  devise: string;
  /** 🆕 Optionnel : utile pour l'affichage */
  anneeScolaireId?: string;
  niveauId?: string | null;
  classeId?: string | null;
  nombreEcheances?: number;
  echeances?: EcheanceResume[];
}

/**
 * Résumé financier d'un assignment (pour un élève + plan).
 */
export interface ResumeFinancier {
  montantTotal: number;
  totalReduction: number;
  duTheorique: number;
  totalPaye: number;
  restant: number;
  /** 0..100 */
  tauxPaiement: number;
  echeances: EcheanceResume[];
}

/**
 * Assignment de scolarité (lien élève ↔ plan).
 */
export interface AssignmentResume {
  id: string;
  eleveId: string;
  planScolariteId: string;
  classeId: string | null;
  anneeScolaireId: string;
  montantPersonnalise?: number | null;
  statut: 'ACTIF' | 'COMPLET' | 'ANNULE' | 'EN_RETARD';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Paiement lié à une inscription.
 */
export interface PaiementResume {
  id: string;
  reference: string;
  montant: number;
  datePaiement: string;
  moyen: MoyenPaiement;
  referenceMoyen?: string | null;
  statut: StatutPaiement;
  notes?: string | null;
  caissier?: { prenom: string; nom: string } | null;
  allocations?: {
    id: string;
    montant: number;
    echeanceId: string;
    echeance?: {
      id: string;
      nom: string;
      ordre: number;
      montant: number;
      dateLimite: string;
    } | null;
  }[];
}

// ============================================
// PAYLOADS (CREATE / UPDATE)
// ============================================

export interface CreateInscriptionPayload {
  eleveId: string;
  classeId: string;
  anneeScolaireId: string;
  /** Format ISO 8601 (ex: 2025-01-15T08:00:00.000Z) */
  dateInscription?: string;
  estActive?: boolean;
}

export interface UpdateInscriptionPayload {
  classeId?: string;
  anneeScolaireId?: string;
  dateInscription?: string;
  estActive?: boolean;
}

// ============================================
// 🆕 PAYLOAD — INSCRIRE + PAYER
// ============================================

export interface AllocationPaiementInput {
  echeanceId: string;
  montant: number;
}

export interface InscrireEtPayerPayload {
  // Inscription
  eleveId: string;
  classeId: string;
  anneeScolaireId: string;
  dateInscription?: string;

  // Paiement
  montantPaiement: number;
  moyen: MoyenPaiement;
  referenceMoyen?: string | null;
  datePaiement?: string;
  notes?: string | null;
  allocations?: AllocationPaiementInput[];
}

// ============================================
// 🆕 RÉSULTAT — INSCRIRE + PAYER
// ============================================

export interface InscrireEtPayerResult {
  inscription: Inscription;
  planScolarite: PlanScolariteResume;
  assignment: AssignmentResume;
  paiement: PaiementResume;
  resumeFinancier: ResumeFinancier;
}

// ============================================
// 🆕 RÉSULTAT — PREVIEW (avant inscription)
// ============================================

export interface PreviewInscriptionResult {
  eleve: EleveSummary;
  classe: ClasseSummary & {
    nbInscrits: number;
    placesRestantes: number | null;
    classePleine: boolean;
    estArchive: boolean;
  };
  dejaInscrit: boolean;
  inscriptionExistanteId: string | null;
  planScolarite: PlanScolariteResume | null;
  resumeFinancier: ResumeFinancier | null;
}

// ============================================
// PARAMS DE LISTE (query string)
// ============================================

export interface ListInscriptionsParams {
  page?: number;
  limit?: number;
  search?: string;
  eleveId?: string;
  classeId?: string;
  anneeScolaireId?: string;
  estActive?: boolean;
  sortBy?: 'dateInscription' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// RÉSULTATS DE LISTE
// ============================================

/** Structure brute renvoyée par le backend dans `data` */
export interface ListInscriptionsResult {
  data: Inscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Structure normalisée pour les hooks */
export interface InscriptionsListResult {
  inscriptions: Inscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// RÉSULTAT DE SUPPRESSION
// ============================================

export interface DeleteInscriptionResult {
  id: string;
  message: string;
}