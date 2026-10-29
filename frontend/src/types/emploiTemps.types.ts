// frontend2/src/types/emploiTemps.types.ts

// ============================================
// ENUMS
// ============================================

export type JourSemaine =
  | 'LUNDI'
  | 'MARDI'
  | 'MERCREDI'
  | 'JEUDI'
  | 'VENDREDI'
  | 'SAMEDI'
  | 'DIMANCHE';

export const JOURS: JourSemaine[] = [
  'LUNDI',
  'MARDI',
  'MERCREDI',
  'JEUDI',
  'VENDREDI',
  'SAMEDI',
  'DIMANCHE',
];

// ============================================
// RÉSUMÉS (relations imbriquées)
// ============================================

export interface NiveauSummary {
  id: string;
  nom: string;
  code: string;
  ordre?: number;
}

export interface ClasseSummary {
  id: string;
  nom: string;
  code: string;
  salle: string | null;
  /** 🆕 Ajouté — présent si le backend l'inclut dans le select */
  capacite?: number | null;
  /** 🆕 Ajouté — niveau de la classe */
  niveau?: NiveauSummary | null;
}

export interface EnseignantSummary {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  specialite: string | null;
  photo: string | null;
  /** 🆕 Ajouté — contact enseignant */
  email?: string | null;
  telephone?: string | null;
  /** 🆕 Ajouté — qualification (ex: "Master 2") */
  qualification?: string | null;
  estActif?: boolean;
}

export interface MatiereSummary {
  id: string;
  nom: string;
  code: string;
  coefficient: number;
  dureeCours: number;
  /** 🆕 Ajouté — description optionnelle */
  description?: string | null;
}

export interface AnneeScolaireSummary {
  id: string;
  nom: string;
  estActive: boolean;
}

// ============================================
// MODÈLE PRINCIPAL
// ============================================

export interface EmploiTemps {
  id: string;
  jour: JourSemaine;
  heureDebut: string; // "HH:mm"
  heureFin: string;   // "HH:mm"
  classeId: string;
  enseignantId: string;
  matiereId: string;
  salle: string | null;
  estRecurrent: boolean;
  valableDu: string;       // ISO date
  valableAu: string | null;
  estActive: boolean;
  creePar: string;
  anneeScolaireId: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations (toujours incluses par le backend)
  classe?: ClasseSummary;
  enseignant?: EnseignantSummary;
  matiere?: MatiereSummary;
  anneeScolaire?: AnneeScolaireSummary | null;
}

// ============================================
// PAYLOADS
// ============================================

export interface CreateEmploiTempsPayload {
  jour: JourSemaine;
  heureDebut: string;
  heureFin: string;
  classeId: string;
  enseignantId: string;
  matiereId: string;
  salle?: string | null;
  estRecurrent?: boolean;
  valableDu: string;
  valableAu?: string | null;
  estActive?: boolean;
  anneeScolaireId?: string | null;
}

export interface UpdateEmploiTempsPayload {
  jour?: JourSemaine;
  heureDebut?: string;
  heureFin?: string;
  classeId?: string;
  enseignantId?: string;
  matiereId?: string;
  salle?: string | null;
  estRecurrent?: boolean;
  valableDu?: string;
  valableAu?: string | null;
  estActive?: boolean;
  anneeScolaireId?: string | null;
}

// ============================================
// CHECK CONFLITS
// ============================================

export interface CheckConflitsPayload {
  jour: JourSemaine;
  heureDebut: string;
  heureFin: string;
  classeId: string;
  enseignantId: string;
  salle?: string | null;
  valableDu: string;
  valableAu?: string | null;
  excludeId?: string;
}

export interface Conflit {
  type: 'CLASSE' | 'ENSEIGNANT' | 'SALLE';
  message: string;
  slot: EmploiTemps;
}

export interface CheckConflitsResult {
  hasConflits: boolean;
  conflits: Conflit[];
}

// ============================================
// PARAMS DE LISTE
// ============================================

export type SortByEmploiTemps = 'jour' | 'heureDebut' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface ListEmploisTempsParams {
  page?: number;
  limit?: number;
  search?: string;
  classeId?: string;
  enseignantId?: string;
  matiereId?: string;
  anneeScolaireId?: string;
  jour?: JourSemaine;
  estActive?: boolean;
  sortBy?: SortByEmploiTemps;
  sortOrder?: SortOrder;
}

// ============================================
// RÉSULTATS
// ============================================

/** GET /emplois-temps → { data: EmploiTemps[], pagination } */
export interface ListEmploisTempsResult {
  data: EmploiTemps[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Résultat normalisé pour le hook */
export interface EmploisTempsListResult {
  emploisTemps: EmploiTemps[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** GET /emplois-temps/by-classe/:id → { slots, parJour } */
export interface EmploiTempsByClasseResult {
  slots: EmploiTemps[];
  parJour: Record<JourSemaine, EmploiTemps[]>;
}

/** GET /emplois-temps/by-enseignant/:id → { slots, parJour, stats } */
export interface EmploiTempsByEnseignantResult {
  slots: EmploiTemps[];
  parJour: Record<JourSemaine, EmploiTemps[]>;
  stats: {
    totalSlots: number;
    totalHeuresHebdo: number;
    classes: string[];
  };
}

/** DELETE → { id, message } */
export interface DeleteEmploiTempsResult {
  id: string;
  message: string;
}