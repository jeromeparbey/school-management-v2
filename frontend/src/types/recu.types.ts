// frontend2/src/types/recu.types.ts

// ============================================
// ENUMS / CONSTANTES
// ============================================

export type FormatImpression = 'A4' | 'A5' | '80MM';

export type MoyenPaiement =
  | 'ESPECES'
  | 'VIREMENT'
  | 'MOBILE_MONEY'
  | 'CARTE'
  | 'CHEQUE'
  | 'AUTRE';

// ============================================
// RÉSUMÉS (relations imbriquées)
// ============================================

export interface PaiementSummary {
  id: string;
  reference: string;
  moyen: MoyenPaiement;
  referenceMoyen: string | null;
  statut: 'COMPLET' | 'ANNULE' | 'REMBOURSE';
}

export interface EleveSummary {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: 'M' | 'F' | string;
  photo: string | null;
}

export interface UtilisateurSummary {
  id: string;
  prenom: string;
  nom: string;
}

export interface EcheanceCouverte {
  nom: string;
  montant: number;
  ordre?: number;
}

// ============================================
// REÇU (modèle principal)
// ============================================

export interface Recu {
  id: string;

  // Identification
  numeroRecu: string;
  paiementId: string;
  eleveId: string;

  // Snapshot élève (figé)
  nomEleve: string;
  eleveMatricule: string;
  elevePrenom: string;
  eleveNom: string;
  eleveSexe: string | null;

  // Snapshot classe (figé)
  nomClasse: string;
  classeNom: string | null;
  classeCode: string | null;
  niveauNom: string | null;
  anneeScolaireNom: string | null;

  // Snapshot établissement (figé)
  etablissementNom: string;
  etablissementLogo: string | null;
  etablissementAdresse: string | null;
  etablissementVille: string | null;
  etablissementPays: string | null;
  etablissementTelephone: string | null;
  etablissementEmail: string | null;
  etablissementSiteWeb: string | null;
  etablissementCode: string;
  etablissementAgrement: string | null;
  etablissementDevise: string;

  // Détails financiers
  montant: number;
  montantPaye: number;
  montantReduction: number;
  montantRestant: number;
  soldeApres: number;
  devise: string;
  referencePaiement: string;
  moyenPaiement: MoyenPaiement;
  moyenPaiementLabel: string;
  datePaiement: string;
  echeancesCouvertes: EcheanceCouverte[];

  // Impression
  formatImprime: FormatImpression | null;
  cheminPDF: string | null;
  cheminPDF_A4: string | null;
  cheminPDF_A5: string | null;
  cheminPDF_80MM: string | null;
  nombreImpressions: number;
  derniereImpression: string | null;

  // Vérification
  codeVerification: string;
  urlVerification: string | null;

  // Génération
  generePar: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  paiement?: PaiementSummary;
  eleve?: EleveSummary;
  generateur?: UtilisateurSummary;
}

// ============================================
// PAYLOADS
// ============================================

export interface GenererRecuPayload {
  paiementId: string;
}

// ============================================
// PARAMS DE LISTE
// ============================================

export interface ListRecusParams {
  page?: number;
  limit?: number;
  search?: string;
  eleveId?: string;
  dateDebut?: string;
  dateFin?: string;
  sortBy?: 'datePaiement' | 'montant' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// RÉSULTATS
// ============================================

export interface ListRecusResult {
  data: Recu[];
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
export interface RecusListResult {
  recus: Recu[];
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

export interface RecusByEleveResult {
  recus: Recu[];
}

// ============================================
// VÉRIFICATION PUBLIQUE
// ============================================

export interface VerificationRecuResult {
  valide: boolean;
  message: string;
  recu?: {
    numeroRecu: string;
    nomEleve: string;
    nomClasse: string;
    montantPaye: number;
    devise: string;
    datePaiement: string;
    moyenPaiementLabel: string;
    etablissementNom: string;
    etablissementCode: string;
    soldeApres: number;
    createdAt: string;
  };
}

// ============================================
// SUPPRESSION
// ============================================

export interface DeleteRecuResult {
  id: string;
  message: string;
}