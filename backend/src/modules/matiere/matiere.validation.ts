// backend/src/modules/matiere/matiere.validation.ts

import { z } from 'zod';

const cuidLike = z.string().min(1).max(64);

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
export const createMatiereSchema = z.object({
  body: z
    .object({
      nom: z.string().trim().min(2).max(100),
      code: z
        .string()
        .trim()
        .min(2)
        .max(50)
        .regex(/^[A-Z0-9_-]+$/, 'Majuscules, chiffres, _ ou - uniquement'),
      niveauId: cuidLike,
      coefficient: z.number().min(0).max(10).optional().default(1.0),
      dureeCours: z.number().int().min(15).max(300).optional().default(60),
      description: z.string().trim().max(500).nullable().optional(),
      estActive: z.boolean().optional().default(true),
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────
export const updateMatiereSchema = z.object({
  body: z
    .object({
      nom: z.string().trim().min(2).max(100).optional(),
      code: z
        .string()
        .trim()
        .min(2)
        .max(50)
        .regex(/^[A-Z0-9_-]+$/)
        .optional(),
      niveauId: cuidLike.optional(),
      coefficient: z.number().min(0).max(10).optional(),
      dureeCours: z.number().int().min(15).max(300).optional(),
      description: z.string().trim().max(500).nullable().optional(),
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
// ID
// ──────────────────────────────────────────
export const matiereIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// LIST
// ──────────────────────────────────────────
export const listMatieresSchema = z.object({
  query: z
    .object({
      page: intCoerce(1).optional().default(1),
      limit: intCoerce(1, 200).optional().default(50),
      search: z.string().trim().max(100).optional(),
      niveauId: cuidLike.optional(),
      estActive: booleanCoerce.optional(),
      estArchive: booleanCoerce.optional(),
      sortBy: z
        .enum(['nom', 'code', 'coefficient', 'createdAt'])
        .optional()
        .default('nom'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
    })
    .strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

export type CreateMatiereInput = z.infer<typeof createMatiereSchema>['body'];
export type UpdateMatiereInput = z.infer<typeof updateMatiereSchema>['body'];
export type ListMatieresQuery = z.infer<typeof listMatieresSchema>['query'];