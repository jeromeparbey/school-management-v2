// backend/src/modules/catalogue/etablissement/etablissement.validation.ts

import { z } from 'zod';

// ─────────────────────────────────────────────────────────
// ENUMS (miroir exact du schéma global Prisma)
// ─────────────────────────────────────────────────────────

export const TypeEtablissementEnum = z.enum([
  'PUBLIC',
  'PRIVE',
  'PRIVE_LAIQUE',
  'PRIVE_CONFESSIONNEL',
  'INTERNATIONAL',
]);

export const PlanAbonnementEnum = z.enum([
  'GRATUIT',
  'BASIQUE',
  'STANDARD',
  'PREMIUM',
  'ENTERPRISE',
]);

export const StatutProvisionnementEnum = z.enum([
  'EN_ATTENTE',
  'EN_COURS',
  'TERMINE',
  'ECHEC',
]);

const JourSemaineEnum = z.enum([
  'LUNDI',
  'MARDI',
  'MERCREDI',
  'JEUDI',
  'VENDREDI',
  'SAMEDI',
  'DIMANCHE',
]);

// ─────────────────────────────────────────────────────────
// SCHEMA DE BASE RÉUTILISABLE
// ─────────────────────────────────────────────────────────

const heureRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * ⚠️ IMPORTANT : `code` est la clé utilisée par le ProvisioningService
 * pour générer le `schemaName` (ex: "ECOLE-A" → "tenant_ecole_a").
 * - Il doit être UNIQUE dans le catalogue global.
 * - Il est IMMUABLE après création (sinon on casserait le schéma PG).
 */
const etablissementBaseSchema = z.object({
  nom: z
    .string({ error: 'Le nom est obligatoire' })
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),

  code: z
    .string({ error: 'Le code est obligatoire' })
    .min(2, 'Le code doit contenir au moins 2 caractères')
    .max(50, 'Le code ne peut pas dépasser 50 caractères')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Le code doit contenir uniquement des majuscules, chiffres, _ ou -'
    ),

  type: TypeEtablissementEnum.default('PRIVE'),

  logo: z.string().url('URL de logo invalide').optional().nullable(),
  adresse: z.string().max(300).optional().nullable(),
  ville: z.string().max(100).optional().nullable(),
  pays: z.string().max(100).default("Côte d'Ivoire"),
  telephone: z
    .string()
    .max(30, 'Téléphone trop long')
    .regex(/^[+0-9 ()-]+$/, 'Format de téléphone invalide')
    .optional()
    .nullable(),
  email: z.string().email('Email invalide').optional().nullable(),
  siteWeb: z.string().url('URL invalide').optional().nullable(),
  numeroAgrement: z.string().max(100).optional().nullable(),

  devise: z
    .string()
    .length(3, 'La devise doit contenir 3 caractères (ex: XOF)')
    .default('XOF'),
  fuseauHoraire: z.string().default('Africa/Abidjan'),
  formatDate: z.string().default('DD/MM/YYYY'),

  joursOuvrables: z
    .array(JourSemaineEnum)
    .min(1, 'Au moins un jour ouvrable')
    .default(['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI']),

  heureDebut: z.string().regex(heureRegex, 'Format HH:MM attendu').default('08:00'),
  heureFin: z.string().regex(heureRegex, 'Format HH:MM attendu').default('17:00'),
  toleranceRetard: z.number().int().min(0).max(120).default(15),
  tauxHeureSup: z.number().min(1).max(3).default(1.5),

  planAbonnement: PlanAbonnementEnum.default('STANDARD'),
  dateExpiration: z.coerce.date().optional().nullable(),
  maxUtilisateurs: z.number().int().min(1).default(1000),
});

// ─────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────

/**
 * Champs strictement nécessaires au provisioning.
 * Le `schemaName` est généré automatiquement par le service (jamais exposé).
 * Le `statutProvisionnement` est géré par le service (EN_COURS → TERMINE).
 */
export const createEtablissementSchema = z.object({
  body: etablissementBaseSchema,
});

// ─────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────

/**
 * ⚠️ `code` est IMMUABLE (car lié au schemaName PostgreSQL).
 * ⚠️ On ne peut PAS modifier `schemaName` ni `statutProvisionnement` via l'API.
 */
export const updateEtablissementSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID invalide'),
  }),
  body: etablissementBaseSchema
    .partial()
    .omit({ code: true }), // code immuable
});

// ─────────────────────────────────────────────────────────
// PARAMS : id
// ─────────────────────────────────────────────────────────

export const etablissementIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID invalide'),
  }),
});

// ─────────────────────────────────────────────────────────
// LIST : pagination + filtres + tri
// ─────────────────────────────────────────────────────────

export const listEtablissementsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),

    type: TypeEtablissementEnum.optional(),
    planAbonnement: PlanAbonnementEnum.optional(),
    statutProvisionnement: StatutProvisionnementEnum.optional(),

    estActif: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
    estArchive: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),

    ville: z.string().optional(),
    pays: z.string().optional(),

    sortBy: z
      .enum(['nom', 'code', 'createdAt', 'dateExpiration'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

// ─────────────────────────────────────────────────────────
// TOGGLE (activer / désactiver)
// ─────────────────────────────────────────────────────────

export const toggleEtablissementSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID invalide'),
  }),
  body: z.object({
    estActif: z.boolean({
      error: 'estActif est obligatoire',
    }),
    motif: z.string().max(500).optional(),
  }),
});

// ─────────────────────────────────────────────────────────
// RÉ-PROVISIONNEMENT (utile si le 1er provisioning a échoué)
// ─────────────────────────────────────────────────────────

export const reprovisionnerEtablissementSchema = z.object({
  params: z.object({
    id: z.string().cuid('ID invalide'),
  }),
});

// ─────────────────────────────────────────────────────────
// TYPES TYPESCRIPT EXPORTÉS (bonus DX)
// ─────────────────────────────────────────────────────────

export type CreateEtablissementInput = z.infer<
  typeof createEtablissementSchema
>['body'];
export type UpdateEtablissementInput = z.infer<
  typeof updateEtablissementSchema
>['body'];
export type ListEtablissementsQuery = z.infer<
  typeof listEtablissementsSchema
>['query'];