// frontend2/src/types/affectation.types.ts

// ============================================
// RÉSUMÉS (relations imbriquées)
// ============================================

export interface EnseignantSummary {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  specialite: string | null;
  photo: string | null;
  // 🆕 ajoutés pour la page détail
  email?: string | null;
  telephone?: string | null;
  estActif?: boolean;
}

export interface ClasseSummary {
  id: string;
  nom: string;
  code: string;
  salle: string | null;
  // 🆕 ajoutés pour la page détail
  capacite?: number | null;
  niveau?: { id: string; nom: string; code: string } | null;
}

export interface MatiereSummary {
  id: string;
  nom: string;
  code: string;
  coefficient: number;
  // 🆕 ajouté pour la page détail
  dureeCours?: number | null;
}

export interface AnneeScolaireSummary {
  id: string;
  nom: string;
  estActive: boolean;
}

// ============================================
// MODÈLE PRINCIPAL
// ============================================

export interface Affectation {
  id: string;
  enseignantId: string;
  classeId: string;
  /** ✅ null = titulaire de classe (primaire, sans matière spécifique) */
  matiereId: string | null;
  anneeScolaireId: string;
  heuresHebdo: number | null;
  estPrincipal: boolean;
  valableDu: string; // ISO date
  valableAu: string | null; // ISO date | null
  estActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations (toujours incluses par le backend)
  enseignant?: EnseignantSummary;
  classe?: ClasseSummary;
  matiere?: MatiereSummary;
  anneeScolaire?: AnneeScolaireSummary;
}

// ============================================
// PAYLOADS
// ============================================

export interface CreateAffectationPayload {
  enseignantId: string;
  classeId: string;
  /**
   * ✅ Optionnel + nullable :
   *   - null / undefined → titulaire de classe (primaire)
   *   - cuid              → affectation à une matière spécifique
   */
  matiereId?: string | null;
  anneeScolaireId: string;
  heuresHebdo?: number;
  estPrincipal?: boolean;
  valableDu: string; // ISO date
  valableAu?: string | null;
  estActive?: boolean;
}

export interface UpdateAffectationPayload {
  enseignantId?: string;
  classeId?: string;
  /**
   * ✅ null explicite → transforme l'affectation en titulaire
   *   undefined    → ne change pas la matière existante
   */
  matiereId?: string | null;
  anneeScolaireId?: string;
  heuresHebdo?: number;
  estPrincipal?: boolean;
  valableDu?: string;
  valableAu?: string | null;
  estActive?: boolean;
}

// ============================================
// PARAMS DE LISTE
// ============================================

export type SortByAffectation = 'createdAt' | 'heuresHebdo' | 'valableDu';
export type SortOrder = 'asc' | 'desc';

export interface ListAffectationsParams {
  page?: number;
  limit?: number;
  search?: string;
  enseignantId?: string;
  classeId?: string;
  matiereId?: string;
  anneeScolaireId?: string;
  estActive?: boolean;
  estPrincipal?: boolean;
  estTitulaire?: boolean;
  sortBy?: SortByAffectation;
  sortOrder?: SortOrder;
}

// ============================================
// RÉSULTATS
// ============================================

export interface ListAffectationsResult {
  data: Affectation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AffectationsListResult {
  affectations: Affectation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AffectationsByEnseignantResult {
  affectations: Affectation[];
  stats: {
    nombreAffectations: number;
    totalHeuresHebdo: number;
    classes: string[];
    matieres: string[];
  };
}

export type AffectationsByClasseResult = Affectation[];

export interface DeleteAffectationResult {
  id: string;
  message: string;
}