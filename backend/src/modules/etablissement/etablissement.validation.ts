// backend/src/modules/etablissement/etablissement.validation.ts

import { z } from 'zod';

// ─────────────────────────────────────────────────────────
// ENUMS (existants)
// ─────────────────────────────────────────────────────────

export const TypeEtablissementEnum = z.enum([
  'PUBLIC', 'PRIVE', 'PRIVE_LAIQUE', 'PRIVE_CONFESSIONNEL', 'INTERNATIONAL',
]);

export const PlanAbonnementEnum = z.enum([
  'GRATUIT', 'BASIQUE', 'STANDARD', 'PREMIUM', 'ENTERPRISE',
]);

export const StatutProvisionnementEnum = z.enum([
  'EN_ATTENTE', 'EN_COURS', 'TERMINE', 'ECHEC',
]);

const JourSemaineEnum = z.enum([
  'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE',
]);

// ─────────────────────────────────────────────────────────
// 🔥 SCHÉMA DIRECTEUR (nouveau)
// ─────────────────────────────────────────────────────────

/**
 * Bloc `directeur` envoyé lors de la création d'un établissement.
 * Le mot de passe est hashé côté service avant insertion dans le tenant.
 */
export const directeurInputSchema = z.object({
  email: z
    .string({ error: "L'email du directeur est obligatoire" })
    .email('Email du directeur invalide')
    .max(150),

  motDePasse: z
    .string({ error: 'Le mot de passe du directeur est obligatoire' })
    .min(8, 'Minimum 8 caractères')
    .max(128)
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
    .regex(
      /[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\;'`~]/,
      'Doit contenir au moins un caractère spécial'
    ),

  prenom: z
    .string({ error: 'Le prénom du directeur est obligatoire' })
    .min(2, 'Minimum 2 caractères')
    .max(100),

  nom: z
    .string({ error: 'Le nom du directeur est obligatoire' })
    .min(2, 'Minimum 2 caractères')
    .max(100),

  telephone: z
    .string()
    .max(30)
    .regex(/^[+0-9 ()-]+$/, 'Format de téléphone invalide')
    .optional()
    .nullable(),

  photoProfil: z.string().url('URL invalide').optional().nullable(),
});

// ─────────────────────────────────────────────────────────
// SCHÉMA DE BASE
// ─────────────────────────────────────────────────────────

const heureRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const etablissementBaseSchema = z.object({
  nom: z.string({ error: 'Le nom est obligatoire' }).min(2).max(200),
  code: z
    .string({ error: 'Le code est obligatoire' })
    .min(2)
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, 'Majuscules, chiffres, _ ou - uniquement'),
  type: TypeEtablissementEnum.default('PRIVE'),
  logo: z.string().url().optional().nullable(),
  adresse: z.string().max(300).optional().nullable(),
  ville: z.string().max(100).optional().nullable(),
  pays: z.string().max(100).default("Côte d'Ivoire"),
  telephone: z.string().max(30).regex(/^[+0-9 ()-]+$/).optional().nullable(),
  email: z.string().email().optional().nullable(),
  siteWeb: z.string().url().optional().nullable(),
  numeroAgrement: z.string().max(100).optional().nullable(),
  devise: z.string().length(3).default('XOF'),
  fuseauHoraire: z.string().default('Africa/Abidjan'),
  formatDate: z.string().default('DD/MM/YYYY'),
  joursOuvrables: z.array(JourSemaineEnum).min(1)
    .default(['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI']),
  heureDebut: z.string().regex(heureRegex).default('08:00'),
  heureFin: z.string().regex(heureRegex).default('17:00'),
  toleranceRetard: z.number().int().min(0).max(120).default(15),
  tauxHeureSup: z.number().min(1).max(3).default(1.5),
  planAbonnement: PlanAbonnementEnum.default('STANDARD'),
  dateExpiration: z.coerce.date().optional().nullable(),
  maxUtilisateurs: z.number().int().min(1).default(1000),
});

// ─────────────────────────────────────────────────────────
// CREATE — directeur OBLIGATOIRE
// ─────────────────────────────────────────────────────────

export const createEtablissementSchema = z.object({
  body: etablissementBaseSchema.extend({
    directeur: directeurInputSchema,   // 🔥 obligatoire
  }),
});

// ─────────────────────────────────────────────────────────
// UPDATE — directeur INTERDIT
// ─────────────────────────────────────────────────────────

export const updateEtablissementSchema = z.object({
  params: z.object({ id: z.string().cuid('ID invalide') }),
  body: etablissementBaseSchema
    .omit({ code: true })
    .partial(),   // ← on n'accepte PAS de directeur ici
});

// ─────────────────────────────────────────────────────────
// AUTRES SCHÉMAS (inchangés)
// ─────────────────────────────────────────────────────────

export const etablissementIdSchema = z.object({
  params: z.object({ id: z.string().cuid('ID invalide') }),
});

export const listEtablissementsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),
    type: TypeEtablissementEnum.optional(),
    planAbonnement: PlanAbonnementEnum.optional(),
    statutProvisionnement: StatutProvisionnementEnum.optional(),
    estActif: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
    estArchive: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
    ville: z.string().optional(),
    pays: z.string().optional(),
    sortBy: z.enum(['nom', 'code', 'createdAt', 'dateExpiration']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const toggleEtablissementSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    estActif: z.boolean({ error: 'estActif est obligatoire' }),
    motif: z.string().max(500).optional(),
  }),
});

export const reprovisionnerEtablissementSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});

// Types
export type CreateEtablissementInput = z.infer<typeof createEtablissementSchema>['body'];
export type UpdateEtablissementInput = z.infer<typeof updateEtablissementSchema>['body'];
export type ListEtablissementsQuery = z.infer<typeof listEtablissementsSchema>['query'];