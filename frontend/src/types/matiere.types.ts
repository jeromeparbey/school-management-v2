// frontend2/src/types/matiere.types.ts

// ============================================
// RÉSUMÉS (relations imbriquées)
// ============================================

export interface NiveauSummary {
  id: string;
  nom: string;
  code: string;
  ordre: number;
}

export interface NiveauDetail {
  id: string;
  nom: string;
  code: string;
  description: string | null;
  ordre: number;
  createdAt: string;
  updatedAt: string;
}

// 🆕 Enseignant (résumé léger)
export interface EnseignantSummary {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  specialite?: string | null;
  photo?: string | null;
  estActif?: boolean;
}

// 🆕 Classe (résumé léger)
export interface ClasseSummary {
  id: string;
  nom: string;
  code: string;
  salle?: string | null;
  niveau?: NiveauSummary | null;
}

// 🆕 Année scolaire (résumé)
export interface AnneeScolaireSummary {
  id: string;
  nom: string;
  estActive: boolean;
}

// ============================================
// COMPTEURS (via _count)
// ============================================

export interface MatiereCount {
  notes: number;
  affectations: number;
  emploisTemps: number;
  reglesEvaluation: number;
  documents: number;
  groupesTD: number;
}

// ============================================
// 🆕 AFFECTATION ENSEIGNANT ↔ MATIÈRE
// ============================================

export interface AffectationMatiere {
  id: string;
  enseignantId: string;
  classeId: string;
  matiereId?: string | null;
  anneeScolaireId: string;
  heuresHebdo: number | null;
  estPrincipal: boolean;
  estActive: boolean;
  valableDu: string;
  valableAu?: string | null;
  enseignant?: EnseignantSummary;
  classe?: ClasseSummary;
  anneeScolaire?: AnneeScolaireSummary;
}

// ============================================
// 🆕 CRÉNEAU EMPLOI DU TEMPS (pour cette matière)
// ============================================

export type JourSemaine =
  | 'LUNDI'
  | 'MARDI'
  | 'MERCREDI'
  | 'JEUDI'
  | 'VENDREDI'
  | 'SAMEDI'
  | 'DIMANCHE';

export interface EmploiTempsCreneau {
  id: string;
  jour: JourSemaine;
  heureDebut: string;
  heureFin: string;
  salle?: string | null;
  classe?: ClasseSummary | null;
  enseignant?: EnseignantSummary | null;
}

// ============================================
// 🆕 STATS DÉRIVÉES (retournées par findById)
// ============================================

export interface MatiereStats {
  nombreProfesseurs: number;
  nombreAffectations: number;
  nombreCreneaux: number;
  nombreClasses: number;
  nombreNotes: number;
  nombreReglesEvaluation: number;
  nombreDocuments: number;
  nombreGroupesTD: number;
}

// ============================================
// MODÈLE PRINCIPAL
// ============================================

export interface Matiere {
  id: string;
  nom: string;
  code: string;
  niveauId: string;
  coefficient: number | null;
  dureeCours: number | null;
  description: string | null;
  estActive: boolean;
  estArchive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations (optionnelles selon le contexte)
  niveau?: NiveauSummary | NiveauDetail;
  _count?: MatiereCount;
}

/** Version détaillée (findById) */
export interface MatiereDetail extends Matiere {
  niveau?: NiveauDetail;

  // 🆕 Professeurs affectés (dédoublonnés)
  professeurs?: EnseignantSummary[];

  // 🆕 Classes où la matière est enseignée
  classes?: ClasseSummary[];

  // 🆕 Affectations complètes
  affectations?: AffectationMatiere[];

  // 🆕 Créneaux emploi du temps (à plat)
  emploisTemps?: EmploiTempsCreneau[];

  // 🆕 Emploi du temps groupé par jour
  emploiTempsParJour?: Array<{
    jour: JourSemaine;
    cours: EmploiTempsCreneau[];
  }>;

  // 🆕 Stats dérivées
  _stats?: MatiereStats;

  // Règles d'évaluation (aperçu)
  reglesEvaluation?: Array<{
    id: string;
    nom: string;
    type: string;
    coefficient: number;
    baremeMin: number;
    baremeMax: number;
    seuilReussite: number;
  }>;

  // Documents (aperçu)
  documents?: Array<{
    id: string;
    titre: string;
    type: string;
    cheminFichier: string;
    createdAt: string;
  }>;
}

// ============================================
// PAYLOADS
// ============================================

export interface CreateMatierePayload {
  nom: string;
  code: string;
  niveauId: string;
  /** ✅ null autorisé (matière générique primaire) */
  coefficient?: number | null;
  /** ✅ null autorisé */
  dureeCours?: number | null;
  description?: string | null;
  estActive?: boolean;

  // 🆕 Affectation optionnelle d'enseignant (transaction)
  enseignantId?: string;
  classeId?: string;
  anneeScolaireId?: string;
  heuresHebdo?: number;
}

export interface UpdateMatierePayload {
  nom?: string;
  code?: string;
  niveauId?: string;
  /** ✅ null autorisé (effacer) */
  coefficient?: number | null;
  /** ✅ null autorisé (effacer) */
  dureeCours?: number | null;
  description?: string | null;
  estActive?: boolean;
  estArchive?: boolean;
}

// 🆕 Payload pour la route dédiée POST /matieres/:id/affecter-enseignant
export interface AffecterEnseignantPayload {
  enseignantId: string;
  classeId: string;
  anneeScolaireId: string;
  heuresHebdo?: number;
}

// ============================================
// PARAMS DE LISTE
// ============================================

export type SortByMatiere = 'nom' | 'code' | 'coefficient' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface ListMatieresParams {
  page?: number;
  limit?: number;
  search?: string;
  niveauId?: string;
  estActive?: boolean;
  estArchive?: boolean;
  sortBy?: SortByMatiere;
  sortOrder?: SortOrder;
}

// ============================================
// RÉSULTATS
// ============================================

/** GET /matieres → { data: Matiere[], pagination } */
export interface ListMatieresResult {
  data: Matiere[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Résultat normalisé pour le hook */
export interface MatieresListResult {
  matieres: Matiere[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** DELETE → { id, message } */
export interface DeleteMatiereResult {
  id: string;
  message: string;
}