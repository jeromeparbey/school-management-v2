// backend/src/modules/paiement/paiement.validation.ts

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

const MOYENS_PAIEMENT = [
  'ESPECES',
  'VIREMENT',
  'MOBILE_MONEY',
  'CARTE',
  'CHEQUE',
  'AUTRE',
] as const;

// ──────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────
export const createPaiementSchema = z.object({
  body: z
    .object({
      eleveId: cuidLike,
      montant: z.number().positive('Le montant doit être positif'),
      datePaiement: z.string().datetime().optional(),
      moyen: z.enum(MOYENS_PAIEMENT),
      referenceMoyen: z.string().trim().max(100).nullable().optional(),
      notes: z.string().trim().max(500).nullable().optional(),
      assignmentId: cuidLike.nullable().optional(),
      /** 🆕 Optionnel : associer directement à une classe (rarement utilisé) */
      classeId: cuidLike.nullable().optional(),
      allocations: z
        .array(
          z.object({
            echeanceId: cuidLike,
            montant: z.number().positive(),
          })
        )
        .optional(),
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────
export const updatePaiementSchema = z.object({
  body: z
    .object({
      notes: z.string().trim().max(500).nullable().optional(),
    })
    .strict()
    .refine((d) => Object.keys(d).length > 0, {
      message: 'Au moins un champ doit être fourni',
    }),
  params: z.object({ id: cuidLike }),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// ANNULER
// ──────────────────────────────────────────
export const annulerPaiementSchema = z.object({
  body: z
    .object({
      motifAnnulation: z.string().trim().min(3).max(500),
    })
    .strict(),
  params: z.object({ id: cuidLike }),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// ID
// ──────────────────────────────────────────
export const paiementIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// LIST
// ──────────────────────────────────────────
export const listPaiementsSchema = z.object({
  query: z
    .object({
      page: intCoerce(1).optional().default(1),
      limit: intCoerce(1, 200).optional().default(50),
      search: z.string().trim().max(100).optional(),
      eleveId: cuidLike.optional(),
      /** 🆕 Filtre par classe (via inscriptions actives) */
      classeId: cuidLike.optional(),
      moyen: z.enum(MOYENS_PAIEMENT).optional(),
      statut: z.enum(['COMPLET', 'ANNULE', 'REMBOURSE']).optional(),
      dateDebut: z.string().datetime().optional(),
      dateFin: z.string().datetime().optional(),
      sortBy: z
        .enum(['datePaiement', 'montant', 'createdAt'])
        .optional()
        .default('datePaiement'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    })
    .strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────
export type CreatePaiementInput = z.infer<typeof createPaiementSchema>['body'];
export type UpdatePaiementInput = z.infer<typeof updatePaiementSchema>['body'];
export type AnnulerPaiementInput = z.infer<typeof annulerPaiementSchema>['body'];
export type ListPaiementsQuery = z.infer<typeof listPaiementsSchema>['query'];