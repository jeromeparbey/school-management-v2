// backend/src/modules/import/export.types.ts

/**
 * Options d'export d'élèves.
 */
export interface ExportElevesOptions {
  /** Inclure les élèves archivés (défaut: false) */
  inclureArchives?: boolean;

  /** Inclure les colonnes d'identité (défaut: true) */
  inclureIdentite?: boolean;

  /** Inclure les données de classe (défaut: true) */
  inclureClasse?: boolean;

  /** Inclure le plan de scolarité (défaut: true) */
  inclurePlan?: boolean;

  /** Inclure les échéances (défaut: true) */
  inclureEcheances?: boolean;

  /** Inclure les responsables (défaut: true) */
  inclureResponsables?: boolean;

  /** Filtrer par classe (cuid) */
  classeId?: string;

  /** Filtrer par année scolaire (cuid) */
  anneeScolaireId?: string;

  /** Nombre de lignes vides ajoutées à la fin (défaut: 20) */
  lignesVides?: number;

  /** Nombre max d'élèves exportés (défaut: 5000) */
  limite?: number;
}

/**
 * Format d'export.
 */
export type ExportFormat = 'csv' | 'xlsx';