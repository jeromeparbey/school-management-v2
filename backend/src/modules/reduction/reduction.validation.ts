// backend/src/modules/reduction/reduction.validation.ts

import { z } from 'zod';

const cuidLike = z.string().min(1).max(64);

const intCoerce = (min?: number, max?: number) => {
  let s = z.coerce.number().int();
  if (min !== undefined) s = s.min(min);
  if (max !== undefined) s = s.max(max);
  return s;
};

const TYPES_REDUCTION = ['FIXE', 'POURCENTAGE'] as const;

// ──────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────
export const createReductionSchema = z.object({
  body: z
    .object({
      eleveId: cuidLike,
      assignmentScolariteId: cuidLike,
      type: z.enum(TYPES_REDUCTION),
      valeur: z.number().min(0, 'La valeur doit être positive'),
      motif: z.string().trim().min(3, 'Minimum 3 caractères').max(500),
      approuvePar: cuidLike, // userId du directeur/admin
      approuveLe: z.string().datetime().optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
      // ✅ Si POURCENTAGE → valeur entre 0 et 100
      if (data.type === 'POURCENTAGE' && data.valeur > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['valeur'],
          message: 'Un pourcentage doit être entre 0 et 100',
        });
      }
      // ✅ Si FIXE → valeur > 0
      if (data.type === 'FIXE' && data.valeur <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['valeur'],
          message: 'Une réduction fixe doit être supérieure à 0',
        });
      }
    }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────
export const updateReductionSchema = z.object({
  body: z
    .object({
      type: z.enum(TYPES_REDUCTION).optional(),
      valeur: z.number().min(0).optional(),
      motif: z.string().trim().min(3).max(500).optional(),
      approuvePar: cuidLike.optional(),
      approuveLe: z.string().datetime().nullable().optional(),
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
export const reductionIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// LIST
// ──────────────────────────────────────────
export const listReductionsSchema = z.object({
  query: z
    .object({
      page: intCoerce(1).optional().default(1),
      limit: intCoerce(1, 200).optional().default(50),
      search: z.string().trim().max(100).optional(),
      eleveId: cuidLike.optional(),
      assignmentScolariteId: cuidLike.optional(),
      type: z.enum(TYPES_REDUCTION).optional(),
      approuvePar: cuidLike.optional(),
      dateDebut: z.string().datetime().optional(),
      dateFin: z.string().datetime().optional(),
      sortBy: z
        .enum(['createdAt', 'valeur', 'approuveLe'])
        .optional()
        .default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    })
    .strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────
export type CreateReductionInput = z.infer<
  typeof createReductionSchema
>['body'];
export type UpdateReductionInput = z.infer<
  typeof updateReductionSchema
>['body'];
export type ListReductionsQuery = z.infer<
  typeof listReductionsSchema
>['query'];