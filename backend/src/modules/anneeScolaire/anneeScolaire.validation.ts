// backend/src/modules/anneeScolaire/anneeScolaire.validation.ts

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

export const createAnneeScolaireSchema = z.object({
  body: z.object({
    nom: z.string().trim().min(1).max(50),
    dateDebut: z.string().datetime(),
    dateFin: z.string().datetime(),
    estActive: z.boolean().optional().default(false),
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateAnneeScolaireSchema = z.object({
  body: z.object({
    nom: z.string().trim().min(1).max(50).optional(),
    dateDebut: z.string().datetime().optional(),
    dateFin: z.string().datetime().optional(),
    estActive: z.boolean().optional(),
    estArchive: z.boolean().optional(),
  }).strict().refine((d) => Object.keys(d).length > 0, {
    message: 'Au moins un champ doit être fourni',
  }),
  params: z.object({ id: cuidLike }),
  query: z.object({}).optional(),
});

export const anneeScolaireIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listAnneesScolairesSchema = z.object({
  query: z.object({
    page: intCoerce(1).optional().default(1),
    limit: intCoerce(1, 200).optional().default(20),
    search: z.string().trim().max(100).optional(),
    estActive: booleanCoerce.optional(),
    estArchive: booleanCoerce.optional(),
    sortBy: z.enum(['nom', 'dateDebut', 'dateFin', 'createdAt']).optional().default('dateDebut'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }).strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

export type CreateAnneeScolaireInput = z.infer<typeof createAnneeScolaireSchema>['body'];
export type UpdateAnneeScolaireInput = z.infer<typeof updateAnneeScolaireSchema>['body'];
export type ListAnneesScolairesQuery = z.infer<typeof listAnneesScolairesSchema>['query'];