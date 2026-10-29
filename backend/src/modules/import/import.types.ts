// backend/src/modules/import/import.types.ts

/**
 * Ligne d'import d'un élève (template Excel/CSV).
 * Toutes les colonnes sont optionnelles SAUF prenom, nom, sexe, dateNaissance.
 */
export interface EleveImportRow {
  // ─── Élève ───
  prenom: string;
  nom: string;
  sexe: 'M' | 'F';
  dateNaissance: string; // ISO ou format lisible
  lieuNaissance?: string;
  nationalite?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  photo?: string;
  infoMedicale?: string;
  groupeSanguin?: string;
  allergies?: string;

  // ─── Classe ───
  classeNom?: string;       // ex: "6ème A"
  classeCode?: string;      // ex: "6A"
  classeCapacite?: number;  // 30
  classeSalle?: string;     // "Salle 12"
  niveauCode?: string;      // ex: "6EME"
  niveauNom?: string;       // ex: "Sixième"

  // ─── Année scolaire ───
  anneeScolaireNom?: string; // ex: "2025-2026"
  anneeScolaireDebut?: string;
  anneeScolaireFin?: string;

  // ─── Plan de scolarité ───
  planNom?: string;
  planFraisInscription?: number;
  planFraisScolarite?: number;
  planDevise?: string;

  // ─── Échéances (jusqu'à 5) ───
  echeance1Nom?: string;
  echeance1Montant?: number;
  echeance1DateLimite?: string;
  echeance2Nom?: string;
  echeance2Montant?: number;
  echeance2DateLimite?: string;
  echeance3Nom?: string;
  echeance3Montant?: number;
  echeance3DateLimite?: string;
  echeance4Nom?: string;
  echeance4Montant?: number;
  echeance4DateLimite?: string;
  echeance5Nom?: string;
  echeance5Montant?: number;
  echeance5DateLimite?: string;

  // ─── Responsable (parent) ───
  responsablePrenom?: string;
  responsableNom?: string;
  responsableLien?: string;      // "Père", "Mère", "Tuteur"
  responsableTelephone?: string;
  responsableEmail?: string;
  responsableProfession?: string;
}

export interface ImportResult {
  totalLignes: number;
  succes: number;
  erreurs: number;
  warnings: number;
  elevesCrees: number;
  classesCreees: number;
  plansCrees: number;
  echeancesCreees: number;
  inscriptionsCreees: number;
  assignmentsCrees: number;
  responsablesCrees: number;

  details: {
    ligne: number;
    eleve?: { id: string; matricule: string; nom: string };
    erreur?: string;
    warnings?: string[];
  }[];

  erreursDetaillees: {
    ligne: number;
    message: string;
    champs?: string[];
  }[];
}