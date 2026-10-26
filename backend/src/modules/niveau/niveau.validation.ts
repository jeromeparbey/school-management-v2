// backend/src/modules/niveau/niveau.validation.ts

import { z } from 'zod';

const cuidLike = z.string().min(1, 'Identifiant requis').max(64);

const booleanCoerce = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((v) => v === true || v === 'true' || v === '1');

const intCoerce = (min?: number, max?: number) => {
  let s = z.coerce.number().int();
  if (min !== undefined) s = s.min(min);
  if (max !== undefined) s = s.max(max);
  return s;
};

// ──────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────

export const createNiveauSchema = z.object({
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
      description: z
        .string()
        .trim()
        .max(500, 'La description ne peut pas dépasser 500 caractères')
        .nullable()
        .optional(),
      ordre: z
        .number()
        .int()
        .min(0, "L'ordre doit être positif ou nul")
        .max(1000)
        .optional()
        .default(0),
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────

export const updateNiveauSchema = z.object({
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
      description: z.string().trim().max(500).nullable().optional(),
      ordre: z.number().int().min(0).max(1000).optional(),
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

export const niveauIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// LIST
// ──────────────────────────────────────────

export const listNiveauxSchema = z.object({
  query: z
    .object({
      page: intCoerce(1).optional().default(1),
      limit: intCoerce(1, 200).optional().default(20),
      search: z.string().trim().max(100).optional(),
      sortBy: z
        .enum(['nom', 'code', 'ordre', 'createdAt', 'updatedAt'])
        .optional()
        .default('ordre'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
    })
    .strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

// ──────────────────────────────────────────
// TYPES EXPORTÉS
// ──────────────────────────────────────────

export type CreateNiveauInput = z.infer<typeof createNiveauSchema>['body'];
export type UpdateNiveauInput = z.infer<typeof updateNiveauSchema>['body'];
export type ListNiveauxQuery = z.infer<typeof listNiveauxSchema>['query'];