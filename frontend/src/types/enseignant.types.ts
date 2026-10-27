// frontend2/src/types/enseignant.types.ts

// ============================================
// ENUMS
// ============================================

export type StatutPresence =
  | 'PRESENT'
  | 'ABSENT'
  | 'RETARD'
  | 'EXCUSE'
  | 'CONGE'
  | 'FORMATION';

export type StatutDemande =
  | 'BROUILLON'
  | 'SOUMISE'
  | 'APPROUVEE'
  | 'REJETEE'
  | 'ANNULEE';

export type StatutPaie =
  | 'BROUILLON'
  | 'CALCULEE'
  | 'APPROUVEE'
  | 'PAYEE'
  | 'ANNULEE';

export type StatutReclamation =
  | 'OUVERTE'
  | 'EN_COURS'
  | 'RESOLUE'
  | 'FERMEE';

export type Priorite = 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';

export type TypeAbsence =
  | 'CONGES_ANNUELS'
  | 'MALADIE'
  | 'MATERNITE'
  | 'PATERNITE'
  | 'PERSONNELLE'
  | 'NON_PAYEE'
  | 'FORMATION';

export type JourSemaine =
  | 'LUNDI'
  | 'MARDI'
  | 'MERCREDI'
  | 'JEUDI'
  | 'VENDREDI'
  | 'SAMEDI'
  | 'DIMANCHE';

export type StatutCours = 'EN_COURS' | 'PROCHAIN' | 'TERMINE' | 'A_VENIR';

// ============================================
// RÉSUMÉS (relations imbriquées)
// ============================================

export interface UtilisateurSummary {
  id: string;
  email: string;
  emailVerifie: boolean;
  estActif: boolean;
  derniereConnexion?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClasseSummary {
  id: string;
  nom: string;
  code: string;
  salle?: string | null;
}

export interface MatiereSummary {
  id: string;
  nom: string;
  code: string;
}

export interface AnneeScolaireSummary {
  id: string;
  nom: string;
  estActive?: boolean;
}

export interface PeriodePaieSummary {
  id: string;
  nom: string;
}

export interface ApprobateurSummary {
  id: string;
  prenom: string;
  nom: string;
}

// ============================================
// AFFECTATIONS
// ============================================

export interface Affectation {
  id: string;
  enseignantId: string;
  classeId: string;
  matiereId: string;
  anneeScolaireId: string;
  heuresHebdo: number | null;
  estPrincipal: boolean;
  valableDu: string;
  valableAu: string | null;
  estActive: boolean;
  createdAt: string;
  updatedAt: string;
  classe?: ClasseSummary;
  matiere?: MatiereSummary;
  anneeScolaire?: AnneeScolaireSummary;
}

// ============================================
// EMPLOI DU TEMPS
// ============================================

export interface EmploiTemps {
  id: string;
  jour: JourSemaine;
  heureDebut: string;
  heureFin: string;
  classeId: string;
  enseignantId: string;
  matiereId: string;
  salle: string | null;
  estRecurrent: boolean;
  valableDu: string;
  valableAu: string | null;
  estActive: boolean;
  anneeScolaireId: string | null;
  createdAt: string;
  updatedAt: string;
  classe?: ClasseSummary;
  matiere?: MatiereSummary;
  anneeScolaire?: AnneeScolaireSummary | null;

  /** 🆕 Statut calculé côté front (ou renvoyé par le service enrichi) */
  _statut?: StatutCours;
  _minutesRestantes?: number;
  _minutesAvant?: number;
}

/** 🆕 Cours enrichi avec statut calculé */
export interface CoursCalcule {
  id: string;
  jour: JourSemaine;
  heureDebut: string;
  heureFin: string;
  statut: StatutCours;
  classe?: ClasseSummary;
  matiere?: MatiereSummary;
  salle?: string | null;
  minutesRestantes?: number;
  minutesAvant?: number;
}

// ============================================
// ABSENCES
// ============================================

export interface Absence {
  id: string;
  enseignantId: string;
  type: TypeAbsence;
  dateDebut: string;
  dateFin: string;
  motif: string;
  pieceJointe: string | null;
  statut: StatutDemande;
  approuvePar: string | null;
  approuveLe: string | null;
  motifRejet: string | null;
  createdAt: string;
  updatedAt: string;
  approbateur?: ApprobateurSummary | null;
}

// ============================================
// HEURES SUPPLÉMENTAIRES
// ============================================

export interface HeureSupp {
  id: string;
  enseignantId: string;
  date: string;
  heureDebut: string | null;
  heureFin: string | null;
  heures: number;
  motif: string | null;
  statut: StatutDemande;
  approuvePar: string | null;
  approuveLe: string | null;
  createdAt: string;
  updatedAt: string;
  approbateur?: ApprobateurSummary | null;
}

// ============================================
// AVANCES
// ============================================

export interface Avance {
  id: string;
  enseignantId: string;
  montant: number;
  motif: string;
  dateDemandee: string;
  remboursementPrevu: string | null;
  statut: StatutDemande;
  approuvePar: string | null;
  approuveLe: string | null;
  motifRejet: string | null;
  integreePaie: boolean;
  createdAt: string;
  updatedAt: string;
  approbateur?: ApprobateurSummary | null;
}

// ============================================
// RÉCLAMATIONS
// ============================================

export interface Reclamation {
  id: string;
  enseignantId: string;
  categorie: string;
  sujet: string;
  description: string;
  piecesJointes: string[];
  priorite: Priorite;
  statut: StatutReclamation;
  assigneA: string | null;
  reponse: string | null;
  fermeeLe: string | null;
  createdAt: string;
  updatedAt: string;
  assigneUtilisateur?: ApprobateurSummary | null;
}

// ============================================
// PAIES
// ============================================

export interface Paie {
  id: string;
  enseignantId: string;
  periodeId: string;
  salaireBase: number;
  heuresSupp: number;
  montantHeuresSupp: number;
  primes: Record<string, number> | null;
  retenues: Record<string, number> | null;
  avances: number;
  totalBrut: number;
  totalNet: number;
  statut: StatutPaie;
  approuvePar: string | null;
  approuveLe: string | null;
  payeLe: string | null;
  referencePaiement: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  periode?: PeriodePaieSummary;
  approbateur?: ApprobateurSummary | null;
}

// ============================================
// HISTORIQUE SALAIRE
// ============================================

export interface HistoriqueSalaire {
  id: string;
  enseignantId: string;
  ancienSalaire: number;
  nouveauSalaire: number;
  dateEffet: string;
  motif: string;
  approuvePar: string;
  createdAt: string;
  approbateur?: ApprobateurSummary;
}

// ============================================
// PRÉSENCES
// ============================================

export interface Presence {
  id: string;
  enseignantId: string;
  heureArrivee: string | null;
  heureDepart: string | null;
  date: string;
  statut: StatutPresence;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// GROUPES TD
// ============================================

export interface GroupeTD {
  id: string;
  nom: string;
  description: string | null;
  classeId: string | null;
  matiereId: string | null;
  anneeScolaireId: string | null;
  enseignantId: string;
  creePar: string;
  estPayant: boolean;
  montantMensuel: number | null;
  montantTotal: number | null;
  devise: string;
  capaciteMax: number | null;
  jourSemaine: JourSemaine | null;
  heureDebut: string | null;
  heureFin: string | null;
  salle: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  estActif: boolean;
  estArchive: boolean;
  createdAt: string;
  updatedAt: string;
  classe?: ClasseSummary | null;
  matiere?: MatiereSummary | null;
  anneeScolaire?: AnneeScolaireSummary | null;
}

// ============================================
// DOCUMENTS
// ============================================

export interface Document {
  id: string;
  titre: string;
  description: string | null;
  type: string;
  categorie: string | null;
  cheminFichier: string;
  tailleFichier: number | null;
  typeMime: string | null;
  matiereId: string | null;
  classeId: string | null;
  niveauId: string | null;
  estPublic: boolean;
  estTelechargeable: boolean;
  telechargements: number;
  creePar: string;
  enseignantId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// MODÈLE PRINCIPAL
// ============================================

export interface Enseignant {
  // Identité
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: 'M' | 'F';
  dateNaissance: string;
  telephone: string;
  email: string | null;
  adresse: string | null;
  photo: string | null;

  // Contrat
  dateEmbauche: string;
  typeContrat: string;
  qualification: string | null;
  specialite: string | null;
  salaireBase: number;
  infosBancaires?: any;

  // Statut
  estActif: boolean;
  estArchive: boolean;

  // FK
  utilisateurId: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  utilisateur?: UtilisateurSummary;

  // 🆕 Relations détaillées (uniquement retournées par findById)
  affectations?: Affectation[];
  emploisTemps?: EmploiTemps[];
  absences?: Absence[];
  heuresSupp?: HeureSupp[];
  avances?: Avance[];
  reclamations?: Reclamation[];
  paies?: Paie[];
  historiquesSalaire?: HistoriqueSalaire[];
  groupesTD?: GroupeTD[];
  documents?: Document[];
  presences?: Presence[];

  // 🆕 Cours calculés (statut EN_COURS / PROCHAIN / etc.)
  coursEnCours?: CoursCalcule | null;
  prochainCours?: CoursCalcule | null;
  dernierCoursTermine?: CoursCalcule | null;

  // 🆕 Statistiques calculées (backend)
  _statsHeures?: {
    heuresSemaine: number;
    totalHeuresSupp: number;
    heuresSuppEnAttente: number;
  };
  _statsPresence?: {
    tauxPresence: number;
    presencesPresentes: number;
    presencesRetard: number;
    presencesAbsent: number;
    totalJours: number;
  };
  _statsPaie?: {
    totalPaieAnne: number;
    nombreMoisPayes: number;
    derniereDatePaiement: string | null;
  };

  // Compteurs
  _count?: {
    affectations: number;
    emploisTemps: number;
    notes: number;
    absences: number;
    heuresSupp: number;
    paies: number;
    // 🆕 ajoutés
    presences?: number;
    avances?: number;
    reclamations?: number;
    historiquesSalaire?: number;
    groupesTD?: number;
    documents?: number;
    communications?: number;
  };

  // Retour de create uniquement
  motDePasseTemporaire?: string | null;
}

// ============================================
// PAYLOADS
// ============================================

export interface CreateEnseignantPayload {
  email?: string | null;
  motDePasse?: string | null;

  prenom: string;
  nom: string;
  sexe: 'M' | 'F';
  dateNaissance: string;
  telephone: string;
  adresse?: string | null;
  photo?: string | null;
  dateEmbauche: string;
  typeContrat: string;
  qualification?: string | null;
  specialite?: string | null;
  salaireBase: number;
  infosBancaires?: any;
  estActif?: boolean;
}

export interface UpdateEnseignantPayload {
  email?: string | null;
  motDePasse?: string | null;
  createCompte?: boolean;

  prenom?: string;
  nom?: string;
  sexe?: 'M' | 'F';
  dateNaissance?: string;
  telephone?: string;
  adresse?: string | null;
  photo?: string | null;
  dateEmbauche?: string;
  typeContrat?: string;
  qualification?: string | null;
  specialite?: string | null;
  salaireBase?: number;
  infosBancaires?: any;
  estActif?: boolean;
  estArchive?: boolean;
}

// ============================================
// PARAMS DE LISTE
// ============================================

export interface ListEnseignantsParams {
  page?: number;
  limit?: number;
  search?: string;
  estActif?: boolean;
  estArchive?: boolean;
  typeContrat?: string;
  hasCompte?: boolean;
  sortBy?: 'nom' | 'prenom' | 'matricule' | 'dateEmbauche' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// RÉSULTATS DE LISTE
// ============================================

export interface ListEnseignantsResult {
  data: Enseignant[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface EnseignantsListResult {
  enseignants: Enseignant[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface DeleteEnseignantResult {
  id: string;
  message: string;
}