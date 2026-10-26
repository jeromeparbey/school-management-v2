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