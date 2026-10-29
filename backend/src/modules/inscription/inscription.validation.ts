// backend/src/modules/inscription/inscription.validation.ts

import { z } from 'zod';

const cuidLike = z.string().min(1).max(64);
const dateLike = z.union([z.string(), z.date()]).transform(
  (v) => (v instanceof Date ? v : new Date(v))
);

const intCoerce = (min?: number, max?: number) => {
  let s = z.coerce.number().int();
  if (min !== undefined) s = s.min(min);
  if (max !== undefined) s = s.max(max);
  return s;
};

// ──────────────────────────────────────────
// 🆕 SCHEMA INSCRIRE + PAYER
// ──────────────────────────────────────────

const ALLOCATION_SCHEMA = z.object({
  echeanceId: cuidLike,
  montant: z.number().positive(),
});

export const inscrireEtPayerSchema = z.object({
  body: z
    .object({
      eleveId: cuidLike,
      classeId: cuidLike,
      anneeScolaireId: cuidLike,
      dateInscription: dateLike.optional(),
      // Paiement
      montantPaiement: z.number().positive(),
      moyen: z.enum([
        'ESPECES',
        'VIREMENT',
        'MOBILE_MONEY',
        'CARTE',
        'CHEQUE',
        'AUTRE',
      ]),
      referenceMoyen: z.string().max(100).nullable().optional(),
      datePaiement: dateLike.optional(),
      notes: z.string().max(500).nullable().optional(),
      allocations: z.array(ALLOCATION_SCHEMA).optional(),
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// CREATE (simple)
// ──────────────────────────────────────────

export const createInscriptionSchema = z.object({
  body: z
    .object({
      eleveId: cuidLike,
      classeId: cuidLike,
      anneeScolaireId: cuidLike,
      dateInscription: dateLike.optional(),
      estActive: z.boolean().optional(),
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────

export const updateInscriptionSchema = z.object({
  body: z
    .object({
      classeId: cuidLike.optional(),
      anneeScolaireId: cuidLike.optional(),
      dateInscription: dateLike.optional(),
      estActive: z.boolean().optional(),
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

export const inscriptionIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// LIST
// ──────────────────────────────────────────

export const listInscriptionsSchema = z.object({
  query: z
    .object({
      page: intCoerce(1).optional().default(1),
      limit: intCoerce(1, 200).optional().default(50),
      search: z.string().trim().max(100).optional(),
      eleveId: cuidLike.optional(),
      classeId: cuidLike.optional(),
      anneeScolaireId: cuidLike.optional(),
      estActive: z.enum(['true', 'false']).optional(),
      sortBy: z.enum(['dateInscription', 'createdAt']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    })
    .strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

// ──────────────────────────────────────────
// 🆕 PREVIEW
// ──────────────────────────────────────────

export const previewInscriptionSchema = z.object({
  query: z
    .object({
      eleveId: cuidLike,
      classeId: cuidLike,
      anneeScolaireId: cuidLike,
    })
    .strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────

export type CreateInscriptionInput = z.infer<
  typeof createInscriptionSchema
>['body'];
export type UpdateInscriptionInput = z.infer<
  typeof updateInscriptionSchema
>['body'];
export type ListInscriptionsQuery = z.infer<
  typeof listInscriptionsSchema
>['query'];
export type InscrireEtPayerInput = z.infer<
  typeof inscrireEtPayerSchema
>['body'];