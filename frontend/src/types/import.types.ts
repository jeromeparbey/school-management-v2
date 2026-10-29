// frontend2/src/types/import.types.ts

/**
 * Ligne d'import (miroir du backend EleveImportRow).
 * Toutes les colonnes sont optionnelles SAUF prenom, nom, sexe, dateNaissance.
 */
export interface EleveImportRow {
  // Élève (obligatoire)
  prenom: string;
  nom: string;
  sexe: 'M' | 'F';
  dateNaissance: string;

  // Élève (optionnel)
  lieuNaissance?: string;
  nationalite?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  photo?: string;
  infoMedicale?: string;
  groupeSanguin?: string;
  allergies?: string;

  // Classe
  classeNom?: string;
  classeCode?: string;
  classeCapacite?: number;
  classeSalle?: string;
  niveauCode?: string;
  niveauNom?: string;

  // Année
  anneeScolaireNom?: string;
  anneeScolaireDebut?: string;
  anneeScolaireFin?: string;

  // Plan
  planNom?: string;
  planFraisInscription?: number;
  planFraisScolarite?: number;
  planDevise?: string;

  // Échéances 1-5
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

  // Responsable
  responsablePrenom?: string;
  responsableNom?: string;
  responsableLien?: string;
  responsableTelephone?: string;
  responsableEmail?: string;
  responsableProfession?: string;
}

export interface ImportOptions {
  creerClassesAuto?: boolean;
  creerAnneeAuto?: boolean;
  creerPlanAuto?: boolean;
  creerEcheancesAuto?: boolean;
  creerResponsables?: boolean;
  ignorerErreurs?: boolean;
  dryRun?: boolean;
}

export interface ImportElevesPayload {
  lignes: EleveImportRow[];
  options?: ImportOptions;
}

export interface ImportDetail {
  ligne: number;
  eleve?: { id: string; matricule: string; prenom?: string; nom?: string };
  erreur?: string;
  warnings?: string[];
}

export interface ImportErreurDetaillee {
  ligne: number;
  message: string;
  champs?: string[];
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
  details: ImportDetail[];
  erreursDetaillees: ImportErreurDetaillee[];
}