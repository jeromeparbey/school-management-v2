// backend/src/modules/recu/recu.validation.ts

import { z } from 'zod';

const cuidLike = z.string().min(1).max(64);

const intCoerce = (min?: number, max?: number) => {
  let s = z.coerce.number().int();
  if (min !== undefined) s = s.min(min);
  if (max !== undefined) s = s.max(max);
  return s;
};

// ──────────────────────────────────────────
// GÉNÉRER (à partir d'un paiement existant)
// ──────────────────────────────────────────
export const genererRecuSchema = z.object({
  body: z.object({
    paiementId: cuidLike,
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// ID
// ──────────────────────────────────────────
export const recuIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// LIST
// ──────────────────────────────────────────
export const listRecusSchema = z.object({
  query: z.object({
    page: intCoerce(1).optional().default(1),
    limit: intCoerce(1, 200).optional().default(50),
    search: z.string().trim().max(100).optional(),
    eleveId: cuidLike.optional(),
    dateDebut: z.string().datetime().optional(),
    dateFin: z.string().datetime().optional(),
    sortBy: z
      .enum(['datePaiement', 'montant', 'createdAt'])
      .optional()
      .default('datePaiement'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }).strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────
export type GenererRecuInput = z.infer<typeof genererRecuSchema>['body'];
export type ListRecusQuery = z.infer<typeof listRecusSchema>['query'];