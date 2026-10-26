// backend/src/modules/periode/periode.validation.ts

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

export const createPeriodeSchema = z.object({
  body: z.object({
    nom: z.string().trim().min(1).max(100),
    type: z.enum(['TRIMESTRE', 'SEMESTRE', 'BULLETIN']),
    dateDebut: z.string().datetime(),
    dateFin: z.string().datetime(),
    ordre: z.number().int().min(1).max(10),
    anneeScolaireId: cuidLike,
    estActive: z.boolean().optional().default(true),
    estCloturee: z.boolean().optional().default(false),
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updatePeriodeSchema = z.object({
  body: z.object({
    nom: z.string().trim().min(1).max(100).optional(),
    type: z.enum(['TRIMESTRE', 'SEMESTRE', 'BULLETIN']).optional(),
    dateDebut: z.string().datetime().optional(),
    dateFin: z.string().datetime().optional(),
    ordre: z.number().int().min(1).max(10).optional(),
    estActive: z.boolean().optional(),
    estCloturee: z.boolean().optional(),
  }).strict().refine((d) => Object.keys(d).length > 0, {
    message: 'Au moins un champ doit être fourni',
  }),
  params: z.object({ id: cuidLike }),
  query: z.object({}).optional(),
});

export const periodeIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listPeriodesSchema = z.object({
  query: z.object({
    page: intCoerce(1).optional().default(1),
    limit: intCoerce(1, 200).optional().default(50),
    search: z.string().trim().max(100).optional(),
    anneeScolaireId: cuidLike.optional(),
    type: z.enum(['TRIMESTRE', 'SEMESTRE', 'BULLETIN']).optional(),
    estActive: booleanCoerce.optional(),
    estCloturee: booleanCoerce.optional(),
    sortBy: z.enum(['nom', 'ordre', 'dateDebut', 'createdAt']).optional().default('ordre'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }).strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

export type CreatePeriodeInput = z.infer<typeof createPeriodeSchema>['body'];
export type UpdatePeriodeInput = z.infer<typeof updatePeriodeSchema>['body'];
export type ListPeriodesQuery = z.infer<typeof listPeriodesSchema>['query'];