// frontend2/src/types/planScolarite.types.ts

// ============================================
// RÉSUMÉS (relations imbriquées)
// ============================================

export interface AnneeScolaireSummary {
  id: string;
  nom: string;
  estActive: boolean;
}

export interface NiveauSummary {
  id: string;
  nom: string;
  code: string;
}

export interface ClasseSummary {
  id: string;
  nom: string;
  code: string;
}

// ============================================
// ÉCHÉANCE (relation)
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
}

// ============================================
// MODÈLE PRINCIPAL
// ============================================

export interface PlanScolarite {
  id: string;
  nom: string;
  description: string | null;
  anneeScolaireId: string;
  niveauId: string | null;
  classeId: string | null;
  fraisInscription: number;
  fraisScolarite: number;
  autresFrais?: Record<string, any> | null;
  montantTotal: number;
  devise: string;
  estActif: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  anneeScolaire?: AnneeScolaireSummary;
  niveau?: NiveauSummary;
  classe?: ClasseSummary;
  echeances?: Echeance[];

  // Compteurs
  _count?: {
    echeances: number;
    assignments: number;
  };
}

// ============================================
// PAYLOADS
// ============================================

export interface CreatePlanScolaritePayload {
  nom: string;
  description?: string | null;
  anneeScolaireId: string;
  niveauId?: string | null;
  classeId?: string | null;
  fraisInscription?: number;
  fraisScolarite?: number;
  autresFrais?: Record<string, any> | null;
  montantTotal: number;
  devise?: string;
  estActif?: boolean;
}

export interface UpdatePlanScolaritePayload {
  nom?: string;
  description?: string | null;
  niveauId?: string | null;
  classeId?: string | null;
  fraisInscription?: number;
  fraisScolarite?: number;
  autresFrais?: Record<string, any> | null;
  montantTotal?: number;
  devise?: string;
  estActif?: boolean;
}

// ============================================
// PARAMS DE LISTE
// ============================================

export interface ListPlansScolariteParams {
  page?: number;
  limit?: number;
  search?: string;
  anneeScolaireId?: string;
  niveauId?: string;
  classeId?: string;
  estActif?: boolean;
  sortBy?: 'nom' | 'montantTotal' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// RÉSULTATS
// ============================================

/** Structure brute renvoyée par le backend dans `data` */
export interface ListPlansScolariteResult {
  data: PlanScolarite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Structure normalisée retournée par le hook `usePlansScolarite` */
export interface PlansScolariteListResult {
  plans: PlanScolarite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DeletePlanScolariteResult {
  id: string;
  message: string;
}