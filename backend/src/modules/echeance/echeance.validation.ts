// backend/src/modules/echeance/echeance.validation.ts

import { z } from 'zod';

// ══════════════════════════════════════════
// HELPERS RÉUTILISABLES
// ══════════════════════════════════════════

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

// ══════════════════════════════════════════
// CONSTANTES DE DOMAINE
// ══════════════════════════════════════════

const STATUTS_ELEVE = [
  'PAYEE',
  'PARTIELLE',
  'IMPAYEE',
  'EN_RETARD',
] as const;

const SORT_BY_ELEVES = ['restant', 'nom', 'statut', 'paye'] as const;

const SORT_BY_ECHEANCES = [
  'ordre',
  'nom',
  'montant',
  'dateLimite',
  'createdAt',
] as const;

// ══════════════════════════════════════════
// 🆕 LIST ELEVES D'UNE ÉCHÉANCE (vue classe)
// GET /echeances/:id/eleves
// ══════════════════════════════════════════
// backend/src/modules/echeance/echeance.validation.ts

// ══════════════════════════════════════════
// 🆕 LIST ELEVES D'UNE ÉCHÉANCE (vue classe)
// GET /echeances/:id/eleves
// ══════════════════════════════════════════

export const listElevesEcheanceSchema = z.object({
  params: z.object({
    id: cuidLike,
  }),
  query: z
    .object({
      page: intCoerce(1).default(1),
      limit: intCoerce(1, 200).default(50),
      search: z.string().trim().max(120).optional(),
      statut: z.enum([...STATUTS_ELEVE, 'all']).default('all'),
      sortBy: z.enum(SORT_BY_ELEVES).default('restant'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    })
    .strict()
    .optional()
    .transform((v) => v ?? {
      page: 1,
      limit: 50,
      statut: 'all' as const,
      sortBy: 'restant' as const,
      sortOrder: 'desc' as const,
    }),
  body: z.object({}).optional(),
});

// ══════════════════════════════════════════
// CREATE
// POST /echeances
// ══════════════════════════════════════════

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

// ══════════════════════════════════════════
// UPDATE
// PUT /echeances/:id
// ══════════════════════════════════════════

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

// ══════════════════════════════════════════
// BY ID (DELETE, GET /:id)
// ══════════════════════════════════════════

export const echeanceIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ══════════════════════════════════════════
// LIST (échéances)
// GET /echeances
// ══════════════════════════════════════════

export const listEcheancesSchema = z.object({
  query: z
    .object({
      page: intCoerce(1).optional().default(1),
      limit: intCoerce(1, 200).optional().default(50),
      search: z.string().trim().max(100).optional(),
      planScolariteId: cuidLike.optional(),
      estPayee: booleanCoerce.optional(),
      sortBy: z.enum(SORT_BY_ECHEANCES).optional().default('ordre'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
    })
    .strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

// ══════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════

export type CreateEcheanceInput = z.infer<
  typeof createEcheanceSchema
>['body'];

export type UpdateEcheanceInput = z.infer<
  typeof updateEcheanceSchema
>['body'];

export type ListEcheancesQuery = z.infer<
  typeof listEcheancesSchema
>['query'];

export type ListElevesEcheanceQuery = z.infer<
  typeof listElevesEcheanceSchema
>['query'];