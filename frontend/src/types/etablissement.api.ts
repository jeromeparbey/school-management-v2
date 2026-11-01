// frontend2/src/types/etablissement.types.ts

// ============================================
// ENUMS
// ============================================

export type TypeEtablissement =
  | 'PUBLIC'
  | 'PRIVE'
  | 'PRIVE_LAIQUE'
  | 'PRIVE_CONFESSIONNEL'
  | 'INTERNATIONAL';

export type PlanAbonnement =
  | 'GRATUIT'
  | 'BASIQUE'
  | 'STANDARD'
  | 'PREMIUM'
  | 'ENTERPRISE';

export type StatutProvisionnement =
  | 'EN_ATTENTE'
  | 'EN_COURS'
  | 'TERMINE'
  | 'ECHEC';

// ============================================
// DIRECTEUR INITIAL (obligatoire à la création)
// ============================================

export interface DirecteurInitial {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  telephone?: string | null;
  photoProfil?: string | null;
}

/** Directeur tel que retourné par l'API (sans motDePasse) */
export interface DirecteurPublic {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: 'DIRECTEUR';
  telephone: string | null;
  photoProfil?: string | null;
  estActif: boolean;
  emailVerifie: boolean;
  derniereConnexion?: string | null;
  createdAt: string;
  directeur?: {
    id: string;
    dateNomination: string | null;
    signature: string | null;
  } | null;
}

// ============================================
// ENTITÉ PRINCIPALE
// ============================================

export interface Etablissement {
  id: string;
  nom: string;
  code: string;
  schemaName: string;

  type: TypeEtablissement;
  logo: string | null;

  adresse: string | null;
  ville: string | null;
  pays: string;
  telephone: string | null;
  email: string | null;
  siteWeb: string | null;
  numeroAgrement: string | null;

  devise: string;
  fuseauHoraire: string;
  formatDate: string;

  joursOuvrables: string[];
  heureDebut: string | null;
  heureFin: string | null;
  toleranceRetard: number;
  tauxHeureSup: number;

  estActif: boolean;
  estArchive: boolean;

  planAbonnement: PlanAbonnement;
  dateExpiration: string | null;
  maxUtilisateurs: number;

  statutProvisionnement: StatutProvisionnement;
  erreurProvisionnement: string | null;

  createdAt: string;
  updatedAt: string;

  directeur?: DirecteurPublic | null;

  _count?: {
    utilisateursGlobaux?: number;
    abonnements?: number;
    factures?: number;
  };

  utilisateursGlobaux?: Array<{
    id: string;
    email: string;
    prenom: string;
    nom: string;
    role: string;
    estActif: boolean;
    createdAt: string;
  }>;

  abonnements?: Array<{
    id: string;
    plan: PlanAbonnement;
    dateDebut: string;
    dateFin: string;
    montantMensuel: number;
    estActif: boolean;
  }>;

  factures?: Array<{
    id: string;
    numeroFacture: string;
    montant: number;
    dateEmission: string;
    dateEcheance: string;
    datePaiement: string | null;
    statut: string;
  }>;
}

// ============================================
// STATISTIQUES
// ============================================

export interface EtablissementStats {
  total: number;
  actifs: number;
  inactifs: number;

  /** 🆕 Nombre d'établissements actuellement en provisioning (EN_ATTENTE + EN_COURS) */
  enProvisionnement: number;

  /** 🆕 Nombre d'établissements dont le provisioning a échoué */
  enEchec: number;

  /** 🆕 Somme des utilisateurs globaux de tous les établissements (via _count) */
  utilisateursTotaux: number;

  /** 🆕 Revenus mensuels agrégés (abonnements actifs) */
  revenusMensuels: number;

  parPlan: Array<{
    planAbonnement: PlanAbonnement;
    _count: { _all: number };
  }>;

  parType: Array<{
    type: TypeEtablissement;
    _count: { _all: number };
  }>;

  parProvisionnement: Array<{
    statutProvisionnement: StatutProvisionnement;
    _count: { _all: number };
  }>;
}

// ============================================
// HELPERS STATS
// ============================================

/** Extrait le compteur d'un tableau `par*` renvoyé par Prisma */
export function countFromStatut(
  rows: EtablissementStats['parProvisionnement'],
  statut: StatutProvisionnement,
): number {
  return rows.find((r) => r.statutProvisionnement === statut)?._count._all ?? 0;
}

/** Nombre total en provisioning (EN_ATTENTE + EN_COURS) */
export function totalEnProvisionnement(stats: EtablissementStats): number {
  return (
    countFromStatut(stats.parProvisionnement, 'EN_ATTENTE') +
    countFromStatut(stats.parProvisionnement, 'EN_COURS')
  );
}

// ============================================
// PAYLOADS
// ============================================

export interface CreateEtablissementPayload {
  nom: string;
  code: string;

  ville?: string;
  email?: string;
  telephone?: string;
  type?: TypeEtablissement;
  logo?: string;
  adresse?: string;
  pays?: string;
  siteWeb?: string;
  numeroAgrement?: string;
  devise?: string;
  fuseauHoraire?: string;
  formatDate?: string;
  joursOuvrables?: string[];
  heureDebut?: string;
  heureFin?: string;
  toleranceRetard?: number;
  tauxHeureSup?: number;
  planAbonnement?: PlanAbonnement;
  dateExpiration?: string;
  maxUtilisateurs?: number;

  directeur: DirecteurInitial;
}

export interface UpdateEtablissementPayload {
  nom?: string;
  logo?: string;

  adresse?: string;
  ville?: string;
  pays?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  numeroAgrement?: string;

  devise?: string;
  fuseauHoraire?: string;
  formatDate?: string;

  joursOuvrables?: string[];
  heureDebut?: string;
  heureFin?: string;
  toleranceRetard?: number;
  tauxHeureSup?: number;

  planAbonnement?: PlanAbonnement;
  dateExpiration?: string;
  maxUtilisateurs?: number;
}

export interface ListEtablissementsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: TypeEtablissement;
  planAbonnement?: PlanAbonnement;
  statutProvisionnement?: StatutProvisionnement;
  estActif?: boolean;
  estArchive?: boolean;
  ville?: string;
  pays?: string;
  sortBy?: 'nom' | 'createdAt' | 'updatedAt' | 'planAbonnement';
  sortOrder?: 'asc' | 'desc';
}

export interface ToggleEtablissementPayload {
  estActif: boolean;
}

export interface ReprovisionnerEtablissementPayload {
  resetData?: boolean;
  raison?: string;
}

// ============================================
// RÉPONSES API
// ============================================

export interface EtablissementListResponse {
  items: Etablissement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EtablissementWithDirecteur extends Etablissement {
  directeur: DirecteurPublic;
}