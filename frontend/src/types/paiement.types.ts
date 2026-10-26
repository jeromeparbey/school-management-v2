// frontend2/src/types/paiement.types.ts

// ============================================
// ENUMS
// ============================================

export type MoyenPaiement =
  | 'ESPECES'
  | 'VIREMENT'
  | 'MOBILE_MONEY'
  | 'CARTE'
  | 'CHEQUE'
  | 'AUTRE';

export type StatutPaiement = 'COMPLET' | 'ANNULE' | 'REMBOURSE';

// ============================================
// RÉSUMÉS (relations imbriquées)
// ============================================

export interface EleveSummary {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: string;
  photo: string | null;
  statut: string;
}

export interface UtilisateurSummary {
  id: string;
  prenom: string;
  nom: string;
  email?: string;
}

export interface EcheanceSummary {
  id: string;
  nom: string;
  montant: number;
  dateLimite: string;
  ordre: number;
}

export interface AllocationPaiement {
  id: string;
  paiementId: string;
  echeanceId: string;
  montant: number;
  createdAt: string;
  echeance?: EcheanceSummary;
}

export interface RecuSummary {
  id: string;
  numeroRecu: string;
  cheminPDF: string | null;
}

export interface AssignmentSummary {
  id: string;
  planScolariteId: string;
  montantPersonnalise: number | null;
}

// ============================================
// PAIEMENT (modèle principal)
// ============================================

export interface Paiement {
  id: string;
  reference: string;
  eleveId: string;
  montant: number;
  datePaiement: string;
  moyen: MoyenPaiement;
  referenceMoyen: string | null;
  caissierId: string;
  notes: string | null;
  statut: StatutPaiement;
  createdAt: string;
  updatedAt: string;
  annuleLe: string | null;
  motifAnnulation: string | null;
  annulePar: string | null;
  assignmentId: string | null;

  // Relations
  eleve?: EleveSummary;
  caissier?: UtilisateurSummary;
  annuleParUtilisateur?: UtilisateurSummary | null;
  allocations?: AllocationPaiement[];
  recu?: RecuSummary | null;
  assignment?: AssignmentSummary | null;
}

// ============================================
// PAYLOADS
// ============================================

export interface AllocationInput {
  echeanceId: string;
  montant: number;
}

export interface CreatePaiementPayload {
  eleveId: string;
  montant: number;
  /** Format ISO 8601 */
  datePaiement?: string;
  moyen: MoyenPaiement;
  referenceMoyen?: string | null;
  notes?: string | null;
  assignmentId?: string | null;
  allocations?: AllocationInput[];
}

export interface UpdatePaiementPayload {
  notes?: string | null;
}

export interface AnnulerPaiementPayload {
  motifAnnulation: string;
}

// ============================================
// PARAMS DE LISTE
// ============================================

export interface ListPaiementsParams {
  page?: number;
  limit?: number;
  search?: string;
  eleveId?: string;
  moyen?: MoyenPaiement;
  statut?: StatutPaiement;
  dateDebut?: string;
  dateFin?: string;
  sortBy?: 'datePaiement' | 'montant' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// RÉSULTATS
// ============================================

export interface ListPaiementsResult {
  data: Paiement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalMontant: number;
  };
}

/** Structure normalisée pour les hooks */
export interface PaiementsListResult {
  paiements: Paiement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalMontant: number;
  };
}

export interface PaiementsByEleveResult {
  paiements: Paiement[];
  total: number;
}

export interface PaiementStatsResult {
  totalMontant: number;
  nombrePaiements: number;
  parMoyen: Array<{
    moyen: MoyenPaiement;
    montant: number;
    nombre: number;
  }>;
}

export interface DeletePaiementResult {
  id: string;
  message: string;
}