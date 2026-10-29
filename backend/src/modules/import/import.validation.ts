// backend/src/modules/import/import.validation.ts

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Transforme '' | null | undefined en `undefined` avant d'appliquer le schéma.
 * Permet de traiter les cellules vides d'Excel comme "non renseignées".
 */
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val: unknown) => {
    if (val === '' || val === null || val === undefined) return undefined;
    return val;
  }, schema.optional());

/**
 * Accepte '' | null | undefined | number | string-numérique.
 * Retourne `undefined` si vide, sinon un `number` valide.
 * Rejette les strings non numériques (au lieu de renvoyer `NaN`).
 */
const numberLike = z.preprocess(
  (v: unknown) => {
    if (v === '' || v === null || v === undefined) return undefined;
    if (typeof v === 'number') return isNaN(v) ? undefined : v;
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (trimmed === '') return undefined;
      const n = Number(trimmed);
      return isNaN(n) ? undefined : n;
    }
    return undefined;
  },
  z.number().min(0).optional()
);

// ═══════════════════════════════════════════════════════════
// LIGNE D'IMPORT
// ═══════════════════════════════════════════════════════════

export const eleveImportRowSchema = z.object({
  // ─── Élève (obligatoire) ───
  prenom: z.string().trim().min(1, 'Prénom requis').max(100),
  nom: z.string().trim().min(1, 'Nom requis').max(100),
  sexe: z.enum(['M', 'F']),
  dateNaissance: z.string().min(1, 'Date de naissance requise'),

  // ─── Élève (optionnel) ───
  lieuNaissance: emptyToUndefined(z.string().max(200)),
  nationalite: emptyToUndefined(z.string().max(100)),
  adresse: emptyToUndefined(z.string().max(300)),
  telephone: emptyToUndefined(z.string().max(30)),
  email: emptyToUndefined(z.string().email().max(150)),
  photo: emptyToUndefined(z.string().max(500)),
  infoMedicale: emptyToUndefined(z.string().max(500)),
  groupeSanguin: emptyToUndefined(z.string().max(10)),
  allergies: emptyToUndefined(z.string().max(500)),

  // ─── Classe ───
  classeNom: emptyToUndefined(z.string().max(100)),
  classeCode: emptyToUndefined(z.string().max(50)),
  classeCapacite: numberLike,
  classeSalle: emptyToUndefined(z.string().max(50)),
  niveauCode: emptyToUndefined(z.string().max(50)),
  niveauNom: emptyToUndefined(z.string().max(100)),

  // ─── Année scolaire ───
  anneeScolaireNom: emptyToUndefined(z.string().max(50)),
  anneeScolaireDebut: emptyToUndefined(z.string()),
  anneeScolaireFin: emptyToUndefined(z.string()),

  // ─── Plan de scolarité ───
  planNom: emptyToUndefined(z.string().max(100)),
  planFraisInscription: numberLike,
  planFraisScolarite: numberLike,
  planDevise: emptyToUndefined(z.string().max(10)),

  // ─── Échéances (jusqu'à 5) ───
  echeance1Nom: emptyToUndefined(z.string().max(100)),
  echeance1Montant: numberLike,
  echeance1DateLimite: emptyToUndefined(z.string()),
  echeance2Nom: emptyToUndefined(z.string().max(100)),
  echeance2Montant: numberLike,
  echeance2DateLimite: emptyToUndefined(z.string()),
  echeance3Nom: emptyToUndefined(z.string().max(100)),
  echeance3Montant: numberLike,
  echeance3DateLimite: emptyToUndefined(z.string()),
  echeance4Nom: emptyToUndefined(z.string().max(100)),
  echeance4Montant: numberLike,
  echeance4DateLimite: emptyToUndefined(z.string()),
  echeance5Nom: emptyToUndefined(z.string().max(100)),
  echeance5Montant: numberLike,
  echeance5DateLimite: emptyToUndefined(z.string()),

  // ─── Responsable (parent) ───
  responsablePrenom: emptyToUndefined(z.string().max(100)),
  responsableNom: emptyToUndefined(z.string().max(100)),
  responsableLien: emptyToUndefined(z.string().max(50)),
  responsableTelephone: emptyToUndefined(z.string().max(30)),
  responsableEmail: emptyToUndefined(z.string().email().max(150)),
  responsableProfession: emptyToUndefined(z.string().max(100)),
});

// ═══════════════════════════════════════════════════════════
// OPTIONS
// ═══════════════════════════════════════════════════════════

export const importOptionsSchema = z
  .object({
    creerClassesAuto: z.boolean().optional().default(true),
    creerAnneeAuto: z.boolean().optional().default(true),
    creerPlanAuto: z.boolean().optional().default(true),
    creerEcheancesAuto: z.boolean().optional().default(true),
    creerResponsables: z.boolean().optional().default(true),
    ignorerErreurs: z.boolean().optional().default(false),
    dryRun: z.boolean().optional().default(false),
  })
  .strict();

// ═══════════════════════════════════════════════════════════
// PAYLOAD GLOBAL
// ═══════════════════════════════════════════════════════════

export const importElevesSchema = z.object({
  body: z
    .object({
      lignes: z.array(eleveImportRowSchema).min(1).max(2000),
      options: importOptionsSchema.optional(),
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type EleveImportRow = z.infer<typeof eleveImportRowSchema>;
export type ImportOptions = z.infer<typeof importOptionsSchema>;
export type ImportElevesInput = z.infer<
  typeof importElevesSchema
>['body'];