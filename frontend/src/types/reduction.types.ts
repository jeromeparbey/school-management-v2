// frontend2/src/types/reduction.types.ts

// ══════════════════════════════════════════════
// TYPES DE BASE
// ══════════════════════════════════════════════

export type TypeReduction = 'FIXE' | 'POURCENTAGE';

export interface ReductionEleve {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: string;
  photo: string | null;
}

export interface ReductionPlan {
  id: string;
  nom: string;
  montantTotal: number;
  devise: string;
}

export interface ReductionAssignment {
  id: string;
  montantPersonnalise: number | null;
  statut: string;
  planScolarite: ReductionPlan | null;
}

export interface ReductionApprobateur {
  id: string;
  prenom: string;
  nom: string;
}

export interface ReductionMeta {
  montantPlan: number;
  montantReduction: number;
  montantNet: number;
}

// ══════════════════════════════════════════════
// ENTITÉ
// ══════════════════════════════════════════════

export interface Reduction {
  id: string;
  eleveId: string;
  assignmentScolariteId: string;
  type: TypeReduction;
  valeur: number;
  motif: string;
  approuvePar: string;
  approuveLe: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  eleve: ReductionEleve;
  assignmentScolarite: ReductionAssignment;
  approbateur: ReductionApprobateur;

  // Meta (calculs backend)
  _meta?: ReductionMeta;
}

// ══════════════════════════════════════════════
// PAYLOADS
// ══════════════════════════════════════════════

export interface CreateReductionPayload {
  eleveId: string;
  assignmentScolariteId: string;
  type: TypeReduction;
  valeur: number;
  motif: string;
  approuvePar: string;
  approuveLe?: string;
}

export interface UpdateReductionPayload {
  type?: TypeReduction;
  valeur?: number;
  motif?: string;
  approuvePar?: string;
  approuveLe?: string | null;
}

// ══════════════════════════════════════════════
// LIST
// ══════════════════════════════════════════════

export interface ListReductionsParams {
  page?: number;
  limit?: number;
  search?: string;
  eleveId?: string;
  assignmentScolariteId?: string;
  type?: TypeReduction;
  approuvePar?: string;
  dateDebut?: string;
  dateFin?: string;
  sortBy?: 'createdAt' | 'valeur' | 'approuveLe';
  sortOrder?: 'asc' | 'desc';
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListReductionsResult {
  data: Reduction[];
  pagination: Pagination;
}

// ══════════════════════════════════════════════
// RÉPONSES SPÉCIFIQUES
// ══════════════════════════════════════════════

export interface ReductionStats {
  totalReductions: number;
  montantTotalReduit: number;
  parType: Array<{
    type: TypeReduction;
    nombre: number;
    valeurTotale: number;
  }>;
}

export interface ReductionsByEleveResult {
  reductions: Reduction[];
  totalReduction: number;
}

export interface DeleteReductionResult {
  id: string;
  message: string;
}