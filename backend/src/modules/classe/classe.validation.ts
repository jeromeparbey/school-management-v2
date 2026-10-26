// backend/src/modules/classe/classe.validation.ts

import { z } from 'zod';

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

const cuidLike = z.string().min(1, 'Identifiant requis').max(64);

/**
 * Coerce un booléen depuis query string ("true" / "false" / "1" / "0")
 * ou depuis un booléen natif JSON.
 */
const booleanCoerce = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((v) => v === true || v === 'true' || v === '1');

/**
 * Coerce un entier depuis query string.
 */
const intCoerce = (min?: number, max?: number) => {
  let s = z.coerce.number().int();
  if (min !== undefined) s = s.min(min);
  if (max !== undefined) s = s.max(max);
  return s;
};

// ──────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────

export const createClasseSchema = z.object({
  body: z
    .object({
      nom: z
        .string()
        .trim()
        .min(1, 'Le nom est obligatoire')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
      code: z
        .string()
        .trim()
        .min(1, 'Le code est obligatoire')
        .max(50, 'Le code ne peut pas dépasser 50 caractères')
        .regex(
          /^[A-Za-z0-9_-]+$/,
          'Le code ne peut contenir que des lettres, chiffres, tirets et underscores'
        ),
      capacite: z
        .number()
        .int()
        .positive('La capacité doit être positive')
        .max(500, 'La capacité ne peut pas dépasser 500')
        .nullable()
        .optional(),
      salle: z
        .string()
        .trim()
        .max(50, 'La salle ne peut pas dépasser 50 caractères')
        .nullable()
        .optional(),
      anneeScolaireId: cuidLike,
      niveauId: cuidLike,
      estActive: z.boolean().optional().default(true),
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────

export const updateClasseSchema = z.object({
  body: z
    .object({
      nom: z.string().trim().min(1).max(100).optional(),
      code: z
        .string()
        .trim()
        .min(1)
        .max(50)
        .regex(/^[A-Za-z0-9_-]+$/, 'Code invalide')
        .optional(),
      capacite: z.number().int().positive().max(500).nullable().optional(),
      salle: z.string().trim().max(50).nullable().optional(),
      anneeScolaireId: cuidLike.optional(),
      niveauId: cuidLike.optional(),
      estActive: z.boolean().optional(),
      estArchive: z.boolean().optional(),
    })
    .strict()
    .refine((d) => Object.keys(d).length > 0, {
      message: 'Au moins un champ doit être fourni',
    }),
  params: z.object({ id: cuidLike }),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// ID PARAM
// ──────────────────────────────────────────

export const classeIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// LIST (query params)
// ──────────────────────────────────────────

export const listClassesSchema = z.object({
  query: z
    .object({
      page: intCoerce(1).optional().default(1),
      limit: intCoerce(1, 200).optional().default(20),
      search: z.string().trim().max(100).optional(),
      anneeScolaireId: cuidLike.optional(),
      niveauId: cuidLike.optional(),
      estActive: booleanCoerce.optional(),
      estArchive: booleanCoerce.optional(),
      sortBy: z
        .enum([
          'nom',
          'code',
          'capacite',
          'createdAt',
          'updatedAt',
        ])
        .optional()
        .default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    })
    .strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

// ──────────────────────────────────────────
// TYPES INFÉRÉS (exportés pour le service/controller)
// ──────────────────────────────────────────

export type CreateClasseInput = z.infer<typeof createClasseSchema>['body'];
export type UpdateClasseInput = z.infer<typeof updateClasseSchema>['body'];
export type ListClassesQuery = z.infer<typeof listClassesSchema>['query'];