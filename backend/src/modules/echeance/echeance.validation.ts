// backend/src/modules/echeance/echeance.validation.ts

import { z } from 'zod';

const cuidLike = z.string().min(1).max(64);
const dateLike = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v : new Date(v)));

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
export const createEcheanceSchema = z.object({
  body: z
    .object({
      planScolariteId: cuidLike,
      nom: z.string().trim().min(1).max(100),
      montant: z.number().positive('Le montant doit être positif'),
      dateLimite: dateLike,
      ordre: z.number().int().min(0).max(100).optional().default(0),
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────
export const updateEcheanceSchema = z.object({
  body: z
    .object({
      nom: z.string().trim().min(1).max(100).optional(),
      montant: z.number().positive().optional(),
      dateLimite: dateLike.optional(),
      ordre: z.number().int().min(0).max(100).optional(),
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
export const echeanceIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// LIST
// ──────────────────────────────────────────
export const listEcheancesSchema = z.object({
  query: z
    .object({
      page: intCoerce(1).optional().default(1),
      limit: intCoerce(1, 200).optional().default(50),
      search: z.string().trim().max(100).optional(),
      planScolariteId: cuidLike.optional(),
      estPayee: booleanCoerce.optional(),
      sortBy: z
        .enum(['ordre', 'nom', 'montant', 'dateLimite', 'createdAt'])
        .optional()
        .default('ordre'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
    })
    .strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────
export type CreateEcheanceInput = z.infer<typeof createEcheanceSchema>['body'];
export type UpdateEcheanceInput = z.infer<typeof updateEcheanceSchema>['body'];
export type ListEcheancesQuery = z.infer<typeof listEcheancesSchema>['query'];