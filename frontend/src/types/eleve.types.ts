// frontend2/src/types/eleve.types.ts

// ============================================
// ENUMS
// ============================================

export type StatutEleve =
  | 'ACTIF'
  | 'TRANSFERE'
  | 'SORTI'
  | 'SUSPENDU'
  | 'ARCHIVE';

export type StatutScolarite = 'ACTIF' | 'COMPLET' | 'ANNULE' | 'EN_RETARD';

// ============================================
// RÉSUMÉS (relations imbriquées)
// ============================================

export interface UtilisateurSummary {
  id: string;
  email: string;
  emailVerifie: boolean;
  estActif: boolean;
  derniereConnexion?: string | null;
}

export interface ClasseSummary {
  id: string;
  nom: string;
  code: string;
}

export interface AnneeScolaireSummary {
  id: string;
  nom: string;
  estActive?: boolean;
}

export interface InscriptionSummary {
  id: string;
  classeId: string;
  anneeScolaireId: string;
  dateInscription: string;
  estActive: boolean;
  classe?: ClasseSummary;
  anneeScolaire?: AnneeScolaireSummary;
}

// ============================================
// 🆕 PLAN DE SCOLARITÉ (résumé pour assignment)
// ============================================

export interface PlanScolariteSummary {
  id: string;
  nom: string;
  montantTotal: number;
  devise: string;
  fraisInscription?: number;
  fraisScolarite?: number;
}

// ============================================
// 🆕 ASSIGNMENT SCOLARITÉ (retourné par findById)
// ============================================

export interface AssignmentScolarite {
  id: string;
  eleveId: string;
  planScolariteId: string;
  classeId: string | null;
  anneeScolaireId: string;
  montantPersonnalise: number | null;
  statut: StatutScolarite;
  createdAt: string;
  updatedAt: string;
  planScolarite?: PlanScolariteSummary;
  anneeScolaire?: AnneeScolaireSummary;
}

// ============================================
// PARENT (résumé)
// ============================================

export interface ParentSummary {
  id: string;
  profession: string | null;
  adresse: string | null;
  telephoneSecondaire: string | null;
  utilisateur?: {
    id: string;
    email: string;
    prenom: string;
    nom: string;
    telephone: string | null;
    photoProfil: string | null;
  };
}

// ============================================
// PARENT-ELEVE (relation)
// ============================================

export interface ParentEleveLink {
  id: string;
  parentId: string;
  eleveId: string;
  lien: string;
  estPrincipal: boolean;
  peutRecupererEleve: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: ParentSummary;
}

// ============================================
// RESPONSABLE
// ============================================

export interface Responsable {
  id: string;
  prenom: string;
  nom: string;
  lien: string;
  telephone: string;
  email: string | null;
  adresse: string | null;
  profession: string | null;
  estPrincipal: boolean;
  eleveId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 🎓 ÉLÈVE (modèle principal — UNIQUE)
// ============================================

export interface Eleve {
  // Identité
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: 'M' | 'F';
  dateNaissance: string;
  lieuNaissance: string | null;
  nationalite: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  photo: string | null;

  // Médical
  infoMedicale: string | null;
  groupeSanguin: string | null;
  allergies: string | null;

  // Statut
  statut: StatutEleve;

  // FK
  utilisateurId: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  utilisateur?: UtilisateurSummary;
  inscriptions?: InscriptionSummary[];
  parents?: ParentEleveLink[];
  responsables?: Responsable[];

  // 🆕 Scolarité (retourné par findById)
  assignmentsScolarite?: AssignmentScolarite[];

  // 🆕 Warning non bloquant retourné par create quand aucun plan n'existe
  _warnings?: string[];

  // Compteurs
  _count?: {
    paiements: number;
    notes: number;
    presences: number;
    absences: number;
    empruntsLivres: number;
    bulletins?: number;
    incidents?: number;
    objectifs?: number;
    reductions?: number;
    communications?: number;
    membresGroupesTD?: number;
    objectifsSuivis?: number;
  };
}

// ============================================
// PAYLOADS (CREATE / UPDATE)
// ============================================

export interface CreateElevePayload {
  // Compte utilisateur (optionnel)
  email?: string | null;
  motDePasse?: string | null;

  // Profil élève (obligatoire)
  prenom: string;
  nom: string;
  sexe: 'M' | 'F';
  dateNaissance: string;
  lieuNaissance?: string | null;
  nationalite?: string | null;
  adresse?: string | null;
  telephone?: string | null;
  photo?: string | null;
  infoMedicale?: string | null;
  groupeSanguin?: string | null;
  allergies?: string | null;
  statut?: StatutEleve;

  // 🆕 Inscription automatique (optionnel)
  /** Si fourni : inscription + assignment scolarité auto */
  classeId?: string | null;
  /** Sinon : utilise l'année scolaire active */
  anneeScolaireId?: string | null;
}

export interface UpdateElevePayload {
  // Compte utilisateur
  email?: string | null;
  motDePasse?: string | null;
  createCompte?: boolean;

  // Profil élève
  prenom?: string;
  nom?: string;
  sexe?: 'M' | 'F';
  dateNaissance?: string;
  lieuNaissance?: string | null;
  nationalite?: string | null;
  adresse?: string | null;
  telephone?: string | null;
  photo?: string | null;
  infoMedicale?: string | null;
  groupeSanguin?: string | null;
  allergies?: string | null;
  statut?: StatutEleve;

  // 🆕 Changement de classe (optionnel)
  /** null → retire de la classe active ; cuid → réinscrit */
  classeId?: string | null;
  anneeScolaireId?: string | null;
}

// ============================================
// PARAMS DE LISTE (query string)
// ============================================

export interface ListElevesParams {
  page?: number;
  limit?: number;
  search?: string;
  statut?: StatutEleve;
  sexe?: 'M' | 'F';
  hasCompte?: boolean;
  classeId?: string;
  anneeScolaireId?: string;
  sortBy?: 'nom' | 'prenom' | 'matricule' | 'dateNaissance' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// RÉSULTATS DE LISTE
// ============================================

/** Structure brute renvoyée par le backend dans `data` */
export interface ListElevesResult {
  data: Eleve[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Structure normalisée retournée par le hook `useEleves` */
export interface ElevesListResult {
  eleves: Eleve[];
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

export interface DeleteEleveResult {
  id: string;
  message: string;
}