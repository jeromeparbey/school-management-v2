// frontend2/src/types/periode.types.ts

// ============================================
// ENUMS
// ============================================

export type TypePeriode = 'TRIMESTRE' | 'SEMESTRE' | 'BULLETIN';

// ============================================
// RÉSUMÉS (relations imbriquées)
// ============================================

export interface AnneeScolaireSummary {
  id: string;
  nom: string;
  estActive: boolean;
}

// ============================================
// MODÈLE PRINCIPAL
// ============================================

export interface Periode {
  id: string;
  nom: string;
  type: TypePeriode;
  dateDebut: string;
  dateFin: string;
  ordre: number;
  anneeScolaireId: string;
  estActive: boolean;
  estCloturee: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  anneeScolaire?: AnneeScolaireSummary;

  // Compteurs
  _count?: {
    notes: number;
    bulletins: number;
    appreciations: number;
  };
}

// ============================================
// PAYLOADS
// ============================================

export interface CreatePeriodePayload {
  nom: string;
  type: TypePeriode;
  dateDebut: string;
  dateFin: string;
  ordre: number;
  anneeScolaireId: string;
  estActive?: boolean;
  estCloturee?: boolean;
}

export interface UpdatePeriodePayload {
  nom?: string;
  type?: TypePeriode;
  dateDebut?: string;
  dateFin?: string;
  ordre?: number;
  estActive?: boolean;
  estCloturee?: boolean;
}

// ============================================
// PARAMS DE LISTE
// ============================================

export interface ListPeriodesParams {
  page?: number;
  limit?: number;
  search?: string;
  anneeScolaireId?: string;
  type?: TypePeriode;
  estActive?: boolean;
  estCloturee?: boolean;
  sortBy?: 'nom' | 'ordre' | 'dateDebut' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// RÉSULTATS
// ============================================

/** Structure brute renvoyée par le backend dans `data` */
export interface ListPeriodesResult {
  data: Periode[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Structure normalisée retournée par le hook `usePeriodes` */
export interface PeriodesListResult {
  periodes: Periode[];
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

export interface DeletePeriodeResult {
  id: string;
  message: string;
}