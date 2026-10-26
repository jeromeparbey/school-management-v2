// frontend2/src/types/classe.types.ts

// ============================================
// MODÈLE MÉTIER
// ============================================

export interface NiveauSummary {
  id: string;
  nom: string;
  code: string;
  ordre: number;
}

export interface AnneeScolaireSummary {
  id: string;
  nom: string;
  estActive: boolean;
}

export interface Classe {
  id: string;
  nom: string;
  code: string;
  capacite: number | null;
  salle: string | null;
  anneeScolaireId: string;
  niveauId: string;
  estActive: boolean;
  estArchive: boolean;
  createdAt: string;
  updatedAt: string;
  niveau?: NiveauSummary;
  anneeScolaire?: AnneeScolaireSummary;
  _count?: {
    inscriptions: number;
    emploisTemps: number;
    affectations: number;
    assignments?: number;
    bulletins?: number;
  };
}

// ============================================
// PAYLOADS (CREATE / UPDATE)
// ============================================

export interface CreateClassePayload {
  nom: string;
  code: string;
  capacite?: number | null;
  salle?: string | null;
  anneeScolaireId: string;
  niveauId: string;
  estActive?: boolean;
}

export interface UpdateClassePayload {
  nom?: string;
  code?: string;
  capacite?: number | null;
  salle?: string | null;
  anneeScolaireId?: string;
  niveauId?: string;
  estActive?: boolean;
  estArchive?: boolean;
}

// ============================================
// PARAMS DE LISTE (query string)
// ============================================

export interface ListClassesParams {
  page?: number;
  limit?: number;
  search?: string;
  anneeScolaireId?: string;
  niveauId?: string;
  estActive?: boolean;
  estArchive?: boolean;
  sortBy?: 'nom' | 'code' | 'capacite' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// PAGINATION RÉUTILISABLE
// ============================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// RÉSULTAT DE LISTE — STRUCTURE API BRUTE
// ============================================
// ⚠️ Représente la structure renvoyée par le backend DANS `data` :
//    {
//      success: true,
//      status: 200,
//      data: { data: Classe[], pagination: {...} },   ← ListClassesResult
//      timestamp: "..."
//    }
// Utilisé par `classe.api.ts` comme type générique :
//    apiClient.get<ApiResponse<ListClassesResult>>('/classes')

export interface ListClassesResult {
  data: Classe[];
  pagination: Pagination;
}

// ============================================
// 🆕 RÉSULTAT NORMALISÉ — RETOURNÉ PAR useClasses
// ============================================
// ⚠️ Le hook `useClasses` normalise la réponse pour retourner :
//    { classes: Classe[], pagination: {...} }
// Quel que soit le wrapping backend (simple ou double `.data`).
// Utilisé dans les composants :
//    const { classes, pagination } = data ?? {};

export interface ClassesListResult {
  classes: Classe[];
  pagination: Pagination;
}

// ============================================
// RÉSULTAT ÉLÈVES D'UNE CLASSE
// ============================================

export interface ClasseElevesResult {
  classe: { id: string; nom: string };
  eleves: Array<{
    id: string;
    matricule: string;
    prenom: string;
    nom: string;
    sexe: string;
    dateNaissance: string | null;
    photo: string | null;
    statut: string;
  }>;
}

// ============================================
// RÉSULTAT STATISTIQUES D'UNE CLASSE
// ============================================

export interface ClasseStatistiquesResult {
  classe: {
    id: string;
    nom: string;
    capacite: number | null;
    placesRestantes: number | null;
  };
  effectif: {
    inscrits: number;
    actifs: number;
    parSexe: Record<string, number>;
  };
  moyenneGenerale: number | null;
}

// ============================================
// RÉSULTAT DE SUPPRESSION
// ============================================

export interface DeleteClasseResult {
  id: string;
  message: string;
}