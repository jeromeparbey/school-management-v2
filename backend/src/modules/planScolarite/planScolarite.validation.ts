// backend/src/modules/planScolarite/planScolarite.validation.ts

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

// ──────────────────────────────────────────
// 🆕 AUTRES FRAIS : Record<libellé, montant> strict
// ──────────────────────────────────────────
const autresFraisSchema = z
  .record(
    z.string().trim().min(1, 'Le libellé ne peut pas être vide').max(100),
    z.number().min(0, 'Le montant doit être positif')
  )
  .nullable()
  .optional()
  .transform((v) => {
    if (!v) return null;
    // Retirer les entrées à 0 ou vides
    const cleaned: Record<string, number> = {};
    for (const [k, val] of Object.entries(v)) {
      const key = k.trim();
      if (key && val > 0) cleaned[key] = val;
    }
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  });

// ──────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────
export const createPlanScolariteSchema = z
  .object({
    body: z
      .object({
        nom: z.string().trim().min(2).max(100),
        description: z.string().trim().max(500).nullable().optional(),
        anneeScolaireId: cuidLike,
        niveauId: cuidLike.nullable().optional(),
        classeId: cuidLike.nullable().optional(),
        fraisInscription: z.number().min(0).optional().default(0),
        fraisScolarite: z.number().min(0).optional().default(0),
        autresFrais: autresFraisSchema,
        montantTotal: z.number().min(0),
        devise: z.string().trim().length(3).optional().default('XOF'),
        estActif: z.boolean().optional().default(true),
      })
      .strict()
      .superRefine((data, ctx) => {
        // 🔥 Vérifier que montantTotal = fraisInscription + fraisScolarite + sum(autresFrais)
        const autresSum = data.autresFrais
          ? Object.values(data.autresFrais).reduce((s, v) => s + v, 0)
          : 0;
        const expected =
          (data.fraisInscription ?? 0) +
          (data.fraisScolarite ?? 0) +
          autresSum;

        // Tolérance de 1 pour éviter les erreurs d'arrondi flottant
        if (Math.abs(data.montantTotal - expected) > 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['montantTotal'],
            message: `Le montant total (${data.montantTotal}) ne correspond pas à la somme des frais (${expected})`,
          });
        }
      }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  });

// ──────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────
export const updatePlanScolariteSchema = z.object({
  body: z
    .object({
      nom: z.string().trim().min(2).max(100).optional(),
      description: z.string().trim().max(500).nullable().optional(),
      niveauId: cuidLike.nullable().optional(),
      classeId: cuidLike.nullable().optional(),
      fraisInscription: z.number().min(0).optional(),
      fraisScolarite: z.number().min(0).optional(),
      autresFrais: autresFraisSchema,
      montantTotal: z.number().min(0).optional(),
      devise: z.string().trim().length(3).optional(),
      estActif: z.boolean().optional(),
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
export const planScolariteIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// LIST
// ──────────────────────────────────────────
export const listPlansScolariteSchema = z.object({
  query: z
    .object({
      page: intCoerce(1).optional().default(1),
      limit: intCoerce(1, 200).optional().default(50),
      search: z.string().trim().max(100).optional(),
      anneeScolaireId: cuidLike.optional(),
      niveauId: cuidLike.optional(),
      classeId: cuidLike.optional(),
      estActif: booleanCoerce.optional(),
      sortBy: z
        .enum(['nom', 'montantTotal', 'createdAt'])
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
export type CreatePlanScolariteInput = z.infer<
  typeof createPlanScolariteSchema
>['body'];
export type UpdatePlanScolariteInput = z.infer<
  typeof updatePlanScolariteSchema
>['body'];
export type ListPlansScolariteQuery = z.infer<
  typeof listPlansScolariteSchema
>['query'];