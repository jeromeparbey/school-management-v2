// frontend2/src/types/echeance.types.ts

// ============================================
// RÉSUMÉS (relations imbriquées)
// ============================================

export interface PlanScolariteSummary {
  id: string;
  nom: string;
  montantTotal: number;
  devise: string;
  anneeScolaireId: string;

  // 🆕 Relations enrichies (optionnelles)
  // — retournées par /echeances/:id/eleves et echeanceInclude
  anneeScolaire?: { id: string; nom: string; estActive: boolean } | null;
  niveau?: { id: string; nom: string; code: string } | null;
  classe?: { id: string; nom: string; code: string } | null;
}

export interface PaiementSummary {
  id: string;
  reference: string;
  datePaiement: string;
  statut: 'COMPLET' | 'ANNULE' | 'REMBOURSE';
}

export interface AllocationPaiementSummary {
  id: string;
  montant: number;
  paiementId: string;
  paiement?: PaiementSummary;
}

// ============================================
// MODÈLE PRINCIPAL
// ============================================

export interface Echeance {
  id: string;
  planScolariteId: string;
  nom: string;
  montant: number;
  dateLimite: string;
  ordre: number;
  estPayee: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  planScolarite?: PlanScolariteSummary;
  allocationsPaiement?: AllocationPaiementSummary[];

  // Compteurs
  _count?: {
    allocationsPaiement: number;
  };

  // 🆕 Métadonnées enrichies (calculées côté backend dans findAll)
  _meta?: {
    nombreEleves: number;
    montantAttendu: number;
    devise: string;
  };
}

// ============================================
// PAYLOADS
// ============================================

export interface CreateEcheancePayload {
  planScolariteId: string;
  nom: string;
  montant: number;
  dateLimite: string;
  ordre?: number;
}

export interface UpdateEcheancePayload {
  nom?: string;
  montant?: number;
  dateLimite?: string;
  ordre?: number;
}

// ============================================
// PARAMS DE LISTE
// ============================================

export interface ListEcheancesParams {
  page?: number;
  limit?: number;
  search?: string;
  planScolariteId?: string;
  /** 🆕 Filtre par élève (via assignments de scolarité) */
  eleveId?: string;
  estPayee?: boolean;
  sortBy?: 'ordre' | 'nom' | 'montant' | 'dateLimite' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// RÉSULTATS
// ============================================

/** Structure brute renvoyée par le backend dans `data` */
export interface ListEcheancesResult {
  data: Echeance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    totalMontant: number;
  };
}

/** Structure normalisée retournée par `useEcheances` */
export interface EcheancesListResult {
  echeances: Echeance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    totalMontant: number;
  };
}

/** Résultat de `/by-plan/:planScolariteId` */
export interface EcheancesByPlanResult {
  plan: PlanScolariteSummary;
  echeances: Echeance[];
  stats: {
    nombreEcheances: number;
    totalEcheances: number;
    montantRestantAPlanifier: number;
    montantCouvert: number;
    pourcentageCouvert: number;
  };
}

export interface DeleteEcheanceResult {
  id: string;
  message: string;
}

// ============================================
// 🆕 VUE CLASSE — ÉLÈVES D'UNE ÉCHÉANCE
// GET /echeances/:id/eleves
// ============================================

/** Statut personnel d'un élève sur une échéance */
export type StatutEleveEcheance =
  | 'PAYEE'
  | 'PARTIELLE'
  | 'IMPAYEE'
  | 'EN_RETARD';

/** Statut global calculé de l'échéance (à partir de tous les élèves) */
export type StatutGlobalEcheance =
  | 'SOLDE'
  | 'EN_COURS'
  | 'IMPAYE'
  | 'EN_RETARD';

/** Paiement individuel lié à une échéance pour un élève */
export interface PaiementEcheanceEleve {
  id: string;
  reference: string;
  datePaiement: string;
  moyen: string;
  montant: number;
}

/** Ligne élève (1 assignment = 1 élève) dans la vue classe */
export interface EleveEcheance {
  assignmentId: string;
  eleve: {
    id: string;
    matricule: string;
    prenom: string;
    nom: string;
    sexe: string;
    photo?: string | null;
    statut: string;
  };
  classe: { id: string; nom: string; code: string } | null;

  /** Montant nominal de l'échéance (avant réductions) */
  montantDu: number;
  /** Montant dû après réductions actives */
  duTheorique: number;
  /** Montant total des réductions actives */
  totalReduction: number;
  /** Montant effectivement payé sur CETTE échéance (paiements COMPLETS) */
  montantPaye: number;
  /** Restant à payer (duTheorique − montantPaye) */
  restant: number;

  statut: StatutEleveEcheance;
  enRetard: boolean;
  joursRetard: number;

  paiements: PaiementEcheanceEleve[];
}

/** Statistiques globales calculées sur TOUS les élèves du plan */
export interface EcheanceStats {
  nombreEleves: number;
  montantAttendu: number;
  montantEncaisse: number;
  montantRestant: number;
  tauxRecouvrement: number; // 0..100
  nombrePayees: number;
  nombrePartielles: number;
  nombreImpayees: number;
  nombreEnRetard: number;
  joursRetard: number;
  dateLimite: string;
  devise: string;
  statutGlobal: StatutGlobalEcheance;

  // Pourcentages par statut (utiles pour les barres visuelles)
  pourcentagePayees: number;
  pourcentagePartielles: number;
  pourcentageImpayees: number;
  pourcentageEnRetard: number;
}

/** Enveloppe de l'échéance renvoyée dans la vue classe */
export interface EcheanceVueClasse {
  id: string;
  nom: string;
  montant: number;
  dateLimite: string;
  ordre: number;
  estPayee: boolean;
  statutGlobal: StatutGlobalEcheance;
  planScolarite: {
    id: string;
    nom: string;
    montantTotal: number;
    devise: string;
    anneeScolaire?: { id: string; nom: string; estActive: boolean } | null;
    niveau?: { id: string; nom: string; code: string } | null;
    classe?: { id: string; nom: string; code: string } | null;
  };
}

/** Réponse complète de GET /echeances/:id/eleves */
export interface EcheanceElevesResponse {
  echeance: EcheanceVueClasse;
  eleves: EleveEcheance[];
  stats: EcheanceStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Params acceptés par useEcheanceEleves */
export interface ListElevesEcheanceParams {
  page?: number;
  limit?: number;
  search?: string;
  statut?: StatutEleveEcheance | 'all';
  sortBy?: 'restant' | 'nom' | 'statut' | 'paye';
  sortOrder?: 'asc' | 'desc';
}