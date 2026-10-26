// backend/src/modules/inscription/inscription.validation.ts

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

export const createInscriptionSchema = z.object({
  body: z.object({
    eleveId: cuidLike,
    classeId: cuidLike,
    anneeScolaireId: cuidLike,
    dateInscription: z.string().datetime().optional(),
    estActive: z.boolean().optional().default(true),
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateInscriptionSchema = z.object({
  body: z.object({
    classeId: cuidLike.optional(),
    anneeScolaireId: cuidLike.optional(),
    dateInscription: z.string().datetime().optional(),
    estActive: z.boolean().optional(),
  }).strict().refine((d) => Object.keys(d).length > 0, {
    message: 'Au moins un champ doit être fourni',
  }),
  params: z.object({ id: cuidLike }),
  query: z.object({}).optional(),
});

export const inscriptionIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listInscriptionsSchema = z.object({
  query: z.object({
    page: intCoerce(1).optional().default(1),
    limit: intCoerce(1, 200).optional().default(50),
    search: z.string().trim().max(100).optional(),
    eleveId: cuidLike.optional(),
    classeId: cuidLike.optional(),
    anneeScolaireId: cuidLike.optional(),
    estActive: booleanCoerce.optional(),
    sortBy: z.enum(['dateInscription', 'createdAt']).optional().default('dateInscription'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }).strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

export type CreateInscriptionInput = z.infer<typeof createInscriptionSchema>['body'];
export type UpdateInscriptionInput = z.infer<typeof updateInscriptionSchema>['body'];
export type ListInscriptionsQuery = z.infer<typeof listInscriptionsSchema>['query'];