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
}

export interface AnneeScolaireSummary {
  id: string;
  nom: string;
  estActive: boolean;
}

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