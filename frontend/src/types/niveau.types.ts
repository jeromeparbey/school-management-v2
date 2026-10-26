// frontend2/src/types/niveau.types.ts

// ============================================
// MODÈLE MÉTIER
// ============================================

export interface Niveau {
  id: string;
  nom: string;
  code: string;
  description: string | null;
  ordre: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    classes: number;
    matieres: number;
    plansScolarite: number;
    reglesEvaluation: number;
  };
  classes?: Array<{
    id: string;
    nom: string;
    code: string;
    estActive: boolean;
  }>;
  matieres?: Array<{
    id: string;
    nom: string;
    code: string;
    coefficient: number;
  }>;
}

// ============================================
// PAYLOADS (CREATE / UPDATE)
// ============================================

export interface CreateNiveauPayload {
  nom: string;
  code: string;
  description?: string | null;
  ordre?: number;
}

export interface UpdateNiveauPayload {
  nom?: string;
  code?: string;
  description?: string | null;
  ordre?: number;
}

// ============================================
// PARAMS DE LISTE (query string)
// ============================================

export interface ListNiveauxParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'nom' | 'code' | 'ordre' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// RÉSULTAT DE LISTE — STRUCTURE API BRUTE
// ============================================
// ⚠️ Représente la structure renvoyée par le backend DANS `data` :
//    {
//      success: true,
//      status: 200,
//      data: { data: Niveau[], pagination: {...} },   ← ListNiveauxResult
//      timestamp: "..."
//    }
// Utilisé par `niveau.api.ts` comme type générique :
//    apiClient.get<ApiResponse<ListNiveauxResult>>('/niveaux')

export interface ListNiveauxResult {
  data: Niveau[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// RÉSULTAT NORMALISÉ — RETOURNÉ PAR useNiveaux
// ============================================
// ⚠️ Le hook `useNiveaux` normalise la réponse pour retourner :
//    { niveaux: Niveau[], pagination: {...} }
// Quel que soit le wrapping backend (simple ou double `.data`).
// Utilisé dans les composants :
//    const { niveaux, pagination } = data ?? {};

export interface NiveauxListResult {
  niveaux: Niveau[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
// RÉSULTAT DE SUPPRESSION
// ============================================

export interface DeleteNiveauResult {
  id: string;
  message: string;
}