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

export type StatutEcheance =
  | 'PAYEE'
  | 'PARTIELLE'
  | 'IMPAYEE'
  | 'EN_RETARD';

export type StatutPaiement = 'COMPLET' | 'ANNULE' | 'REMBOURSE';

export type MoyenPaiement =
  | 'ESPECES'
  | 'VIREMENT'
  | 'MOBILE_MONEY'
  | 'CARTE'
  | 'CHEQUE'
  | 'AUTRE';

export type StatutPresenceEleve =
  | 'PRESENT'
  | 'ABSENT'
  | 'RETARD'
  | 'EXCUSE'
  | 'SORTIE_ANTICIPEE';

export type StatutDemande =
  | 'BROUILLON'
  | 'SOUMISE'
  | 'APPROUVEE'
  | 'REJETEE'
  | 'ANNULEE';

export type TypeAbsenceEleve =
  | 'MALADIE'
  | 'RAISON_FAMILIALE'
  | 'VOYAGE'
  | 'DISPENSE'
  | 'AUTRE';

export type JourSemaine =
  | 'LUNDI'
  | 'MARDI'
  | 'MERCREDI'
  | 'JEUDI'
  | 'VENDREDI'
  | 'SAMEDI'
  | 'DIMANCHE';

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
// PLAN DE SCOLARITÉ
// ============================================

/** Résumé léger (listes) */
export interface PlanScolariteSummary {
  id: string;
  nom: string;
  montantTotal: number;
  devise: string;
  fraisInscription?: number;
  fraisScolarite?: number;
  /** Compteurs optionnels (findAll élève) */
  echeances?: EcheanceResume[];
}

/** Échéance telle que renvoyée en liste (sans allocations) */
export interface EcheanceResume {
  id: string;
  nom: string;
  montant: number;
  dateLimite: string;
  ordre: number;
  estPayee: boolean;
}

// ============================================
// ÉCHÉANCES ENRICHIES (détail)
// ============================================

export interface PaiementLienEcheance {
  id: string;
  reference: string;
  datePaiement: string;
  statut: StatutPaiement;
}

export interface AllocationPaiement {
  id: string;
  montant: number;
  paiementId: string;
  paiement?: PaiementLienEcheance;
}

/** Métadonnées calculées côté backend */
export interface EcheanceMeta {
  montantTotal: number;
  montantPaye: number;
  restant: number;
  statut: StatutEcheance;
  enRetard: boolean;
  joursRetard: number;
  estPayeeCompletement: boolean;
  estPartielle: boolean;
  nombreAllocations: number;
}

/** Échéance complète retournée par findById */
export interface EcheanceDetail extends EcheanceResume {
  planScolariteId?: string;
  allocationsPaiement?: AllocationPaiement[];
  _meta?: EcheanceMeta;
}

/** Plan avec échéances détaillées */
export interface PlanScolariteDetail extends PlanScolariteSummary {
  echeances: EcheanceDetail[];
}

// ============================================
// ASSIGNMENT SCOLARITÉ
// ============================================

/** Version légère (listes) */
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
  classe?: ClasseSummary | null;
}

/** Version détaillée (findById) */
export interface AssignmentScolariteDetail extends AssignmentScolarite {
  planScolarite?: PlanScolariteDetail;
  paiements?: PaiementResume[];
  reductions?: ReductionResume[];
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
// PAIEMENTS
// ============================================

export interface CaissierSummary {
  id: string;
  prenom: string;
  nom: string;
  email: string;
}

export interface RecuSummary {
  id: string;
  numeroRecu: string;
  cheminPDF?: string | null;
}

export interface AllocationPaiementDetail {
  id: string;
  montant: number;
  echeance?: {
    id: string;
    nom: string;
    montant: number;
    dateLimite: string;
  };
}

export interface PaiementResume {
  id: string;
  reference: string;
  montant: number;
  datePaiement: string;
  statut: StatutPaiement;
  moyen: MoyenPaiement;
}

export interface PaiementDetail extends PaiementResume {
  recu?: RecuSummary | null;
  caissier?: CaissierSummary;
  allocations?: AllocationPaiementDetail[];
}

// ============================================
// PRÉSENCES ÉLÈVE
// ============================================

export interface PresenceEleveResume {
  id: string;
  date: string;
  heureArrivee: string | null;
  statut: StatutPresenceEleve;
  motif: string | null;
  justificatif: string | null;
  notes: string | null;
  createdAt: string;
}

// ============================================
// ABSENCES ÉLÈVE
// ============================================

export interface AbsenceEleveResume {
  id: string;
  dateDebut: string;
  dateFin: string;
  type: TypeAbsenceEleve;
  motif: string;
  statut: StatutDemande;
  justificatif: string | null;
  approuveLe: string | null;
  motifRejet: string | null;
  createdAt: string;
}

// ============================================
// NOTES (résumé)
// ============================================

export interface NoteResume {
  id: string;
  valeur: number;
  coefficient: number;
  commentaire: string | null;
  dateSaisie: string;
  estValide: boolean;
  matiere?: { id: string; nom: string; code: string };
  periode?: { id: string; nom: string; type: string };
  regleEvaluation?: {
    id: string;
    nom: string;
    type: string;
    coefficient: number;
    baremeMax: number;
  };
  enseignant?: { id: string; prenom: string; nom: string } | null;
}

// ============================================
// BULLETINS (résumé)
// ============================================

export interface BulletinResume {
  id: string;
  moyenneGenerale: number;
  rang: number | null;
  effectifClasse: number | null;
  appreciationGenerale: string | null;
  estValide: boolean;
  genereLe: string;
  cheminPDF?: string | null;
  periode?: { id: string; nom: string };
  anneeScolaire?: { id: string; nom: string };
  classe?: { id: string; nom: string };
}

// ============================================
// EMPRUNTS BIBLIOTHÈQUE (résumé)
// ============================================

export interface EmpruntLivreResume {
  id: string;
  dateEmprunt: string;
  dateRetourPrevue: string;
  dateRetourReelle: string | null;
  statut: string;
  penalite: number;
  livre?: { id: string; titre: string; auteur: string };
}

// ============================================
// INCIDENTS (résumé)
// ============================================

export interface IncidentResume {
  id: string;
  type: string;
  gravite: string;
  titre: string;
  description: string;
  dateIncident: string;
  statut: string;
  lieu?: string | null;
}

// ============================================
// OBJECTIFS (résumé)
// ============================================

export interface ObjectifResume {
  id: string;
  titre: string;
  description: string | null;
  type: string;
  dateDebut: string;
  dateFin: string;
  valeurCible: number | null;
  valeurActuelle: number | null;
  unite: string | null;
  statut: string;
  priorite: string;
  enseignant?: { id: string; prenom: string; nom: string } | null;
  periode?: { id: string; nom: string } | null;
}

// ============================================
// RÉDUCTIONS (résumé)
// ============================================

export interface ReductionResume {
  id: string;
  type: 'FIXE' | 'POURCENTAGE';
  valeur: number;
  motif: string;
  approuveLe?: string;
}

// ============================================
// EMPLOI DU TEMPS (classe active)
// ============================================

export interface EmploiTempsResume {
  id: string;
  jour: JourSemaine;
  heureDebut: string;
  heureFin: string;
  salle: string | null;
  matiere?: { id: string; nom: string; code: string };
  enseignant?: {
    id: string;
    prenom: string;
    nom: string;
    specialite: string | null;
  };
}

// ============================================
// ÉQUIPE PÉDAGOGIQUE (classe active)
// ============================================

export interface AffectationEnseignantResume {
  id: string;
  heuresHebdo: number | null;
  estPrincipal: boolean;
  enseignant?: {
    id: string;
    prenom: string;
    nom: string;
    specialite: string | null;
    email: string | null;
    telephone: string | null;
    photo: string | null;
  };
  matiere?: { id: string; nom: string; code: string };
}

// ============================================
// RÉSUMÉ FINANCIER (agrégé backend)
// ============================================

export interface EcheanceEnRetard {
  assignmentId: string;
  planNom?: string;
  echeanceId: string;
  nom: string;
  dateLimite: string;
  montant: number;
  paye: number;
  restant: number;
  joursRetard: number;
}

export interface ProchaineEcheance {
  assignmentId: string;
  planNom?: string;
  echeanceId: string;
  nom: string;
  dateLimite: string;
  montant: number;
  paye: number;
  restant: number;
}

export interface PlanFinanceSummary {
  assignmentId: string;
  planId?: string;
  planNom?: string;
  montantTotal: number;
  montantPaye: number;
  restant: number;
  nombreEcheances: number;
  nombrePayees: number;
}

export interface FinanceResume {
  totalDu: number;
  totalPaye: number;
  totalRestant: number;
  totalReduit: number;
  totalRetard: number;
  tauxPaiement: number;
  nombreEcheances: number;
  nombreEcheancesPayees: number;
  nombreEcheancesRetard: number;
  estAJour: boolean;
  estEnRetard: boolean;
  echeancesEnRetard: EcheanceEnRetard[];
  prochainesEcheances: ProchaineEcheance[];
  parPlan: PlanFinanceSummary[];
}

// ============================================
// STATS DÉRIVÉES (backend)
// ============================================

export interface EleveStats {
  nombrePaiements: number;
  montantTotalPaye: number;
  nombrePresences: number;
  nombreAbsences: number;
  nombreNotes: number;
  nombreBulletins: number;
}

// ============================================
// ÉLÈVE (modèle principal)
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

  // Relations (liste)
  utilisateur?: UtilisateurSummary;
  inscriptions?: InscriptionSummary[];
  parents?: ParentEleveLink[];
  responsables?: Responsable[];

  // Scolarité (retourné par findById / findAll)
  assignmentsScolarite?: AssignmentScolarite[];

  // Warning non bloquant retourné par create
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
// ÉLÈVE DÉTAILLÉ (findById — tout enrichi)
// ============================================

export interface EleveDetail extends Omit<Eleve, 'assignmentsScolarite'> {
  // Override : version détaillée
  assignmentsScolarite?: AssignmentScolariteDetail[];

  // Listes récentes
  paiements?: PaiementDetail[];
  presences?: PresenceEleveResume[];
  absences?: AbsenceEleveResume[];
  notes?: NoteResume[];
  bulletins?: BulletinResume[];
  empruntsLivres?: EmpruntLivreResume[];
  incidents?: IncidentResume[];
  objectifs?: ObjectifResume[];
  reductions?: ReductionResume[];

  // Contexte classe active
  classeActive?: ClasseSummary | null;
  emploiTemps?: EmploiTempsResume[];
  equipePedagogique?: AffectationEnseignantResume[];

  // Agrégats calculés backend
  _finance?: FinanceResume;
  _stats?: EleveStats;
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

  // Inscription automatique (optionnel)
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

  // Changement de classe (optionnel)
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