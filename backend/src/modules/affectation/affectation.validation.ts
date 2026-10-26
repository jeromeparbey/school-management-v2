// backend/src/modules/affectation/affectation.validation.ts

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
export const createAffectationSchema = z.object({
  body: z.object({
    enseignantId: cuidLike,
    classeId: cuidLike,
    matiereId: cuidLike,
    anneeScolaireId: cuidLike,
    heuresHebdo: z.number().min(0).max(100).optional().default(0),
    estPrincipal: z.boolean().optional().default(false),
    valableDu: dateLike,
    valableAu: dateLike.nullable().optional(),
    estActive: z.boolean().optional().default(true),
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────
export const updateAffectationSchema = z.object({
  body: z.object({
    enseignantId: cuidLike.optional(),
    classeId: cuidLike.optional(),
    matiereId: cuidLike.optional(),
    anneeScolaireId: cuidLike.optional(),
    heuresHebdo: z.number().min(0).max(100).optional(),
    estPrincipal: z.boolean().optional(),
    valableDu: dateLike.optional(),
    valableAu: dateLike.nullable().optional(),
    estActive: z.boolean().optional(),
  }).strict().refine((d) => Object.keys(d).length > 0, {
    message: 'Au moins un champ doit être fourni',
  }),
  params: z.object({ id: cuidLike }),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// ID
// ──────────────────────────────────────────
export const affectationIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// LIST
// ──────────────────────────────────────────
export const listAffectationsSchema = z.object({
  query: z.object({
    page: intCoerce(1).optional().default(1),
    limit: intCoerce(1, 200).optional().default(50),
    search: z.string().trim().max(100).optional(),
    enseignantId: cuidLike.optional(),
    classeId: cuidLike.optional(),
    matiereId: cuidLike.optional(),
    anneeScolaireId: cuidLike.optional(),
    estActive: booleanCoerce.optional(),
    estPrincipal: booleanCoerce.optional(),
    sortBy: z
      .enum(['createdAt', 'heuresHebdo', 'valableDu'])
      .optional()
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }).strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────
export type CreateAffectationInput = z.infer<typeof createAffectationSchema>['body'];
export type UpdateAffectationInput = z.infer<typeof updateAffectationSchema>['body'];
export type ListAffectationsQuery = z.infer<typeof listAffectationsSchema>['query'];