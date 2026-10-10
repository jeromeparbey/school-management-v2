// backend/src/modules/directeur/directeur.validation.ts

import { z } from 'zod';

// ============================================================
// SCHÉMAS RÉUTILISABLES
// ============================================================

const motDePasseSchema = z
  .string({ error: 'Le mot de passe est obligatoire' })
  .min(8, 'Minimum 8 caractères')
  .max(128, 'Maximum 128 caractères')
  .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
  .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
  .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
  .regex(
    /[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\;'`~]/,
    'Doit contenir au moins un caractère spécial'
  );

const emailSchema = z
  .string({ error: "L'email est obligatoire" })
  .email('Email invalide')
  .max(150)
  .transform((v) => v.toLowerCase().trim());

const telephoneSchema = z
  .string()
  .max(30)
  .regex(/^[+0-9 ()-]+$/, 'Format de téléphone invalide')
  .optional()
  .nullable();

// ============================================================
// CREATE
// ============================================================

export const createDirecteurSchema = z.object({
  body: z.object({
    email: emailSchema,
    motDePasse: motDePasseSchema,
    prenom: z
      .string({ error: 'Le prénom est obligatoire' })
      .min(2)
      .max(100)
      .transform((v) => v.trim()),
    nom: z
      .string({ error: 'Le nom est obligatoire' })
      .min(2)
      .max(100)
      .transform((v) => v.trim()),
    telephone: telephoneSchema,
    photoProfil: z.string().url('URL invalide').optional().nullable(),
    dateNomination: z.coerce.date().optional().nullable(),
    signature: z.string().max(500).optional().nullable(),
  }),
});

// ============================================================
// UPDATE (tous les champs optionnels sauf l'id)
// ============================================================

export const updateDirecteurSchema = z.object({
  params: z.object({ id: z.string().cuid('ID invalide') }),
  body: z
    .object({
      email: emailSchema.optional(),
      motDePasse: motDePasseSchema.optional(),
      prenom: z.string().min(2).max(100).optional(),
      nom: z.string().min(2).max(100).optional(),
      telephone: telephoneSchema,
      photoProfil: z.string().url().optional().nullable(),
      estActif: z.boolean().optional(),
      dateNomination: z.coerce.date().optional().nullable(),
      signature: z.string().max(500).optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Au moins un champ doit être fourni',
    }),
});

// ============================================================
// ID PARAMS
// ============================================================

export const directeurIdSchema = z.object({
  params: z.object({ id: z.string().cuid('ID invalide') }),
});

// ============================================================
// LIST : pagination + filtres
// ============================================================

export const listDirecteursSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),
    estActif: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
    sortBy: z.enum(['nom', 'email', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

// ============================================================
// TOGGLE
// ============================================================

export const toggleDirecteurSchema = z.object({
  params: z.object({ id: z.string().cuid('ID invalide') }),
  body: z.object({
    estActif: z.boolean({
      error: 'estActif est obligatoire (booléen)',
    }),
  }),
});

// ============================================================
// CHANGE PASSWORD (par le SUPER_ADMIN)
// ============================================================

export const changeDirecteurPasswordSchema = z.object({
  params: z.object({ id: z.string().cuid('ID invalide') }),
  body: z.object({
    nouveauMotDePasse: motDePasseSchema,
  }),
});

// ============================================================
// TYPES EXPORTÉS
// ============================================================

export type CreateDirecteurInput = z.infer<
  typeof createDirecteurSchema
>['body'];
export type UpdateDirecteurInput = z.infer<
  typeof updateDirecteurSchema
>['body'];
export type ListDirecteursQuery = z.infer<
  typeof listDirecteursSchema
>['query'];