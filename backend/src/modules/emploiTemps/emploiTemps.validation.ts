// backend/src/modules/emploiTemps/emploiTemps.validation.ts

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

const JOURS = [
  'LUNDI',
  'MARDI',
  'MERCREDI',
  'JEUDI',
  'VENDREDI',
  'SAMEDI',
  'DIMANCHE',
] as const;

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// ──────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────
export const createEmploiTempsSchema = z.object({
  body: z.object({
    jour: z.enum(JOURS),
    heureDebut: z.string().regex(timeRegex, 'Format HH:MM requis'),
    heureFin: z.string().regex(timeRegex, 'Format HH:MM requis'),
    classeId: cuidLike,
    enseignantId: cuidLike,
    matiereId: cuidLike,
    salle: z.string().trim().max(50).nullable().optional(),
    estRecurrent: z.boolean().optional().default(true),
    valableDu: dateLike,
    valableAu: dateLike.nullable().optional(),
    estActive: z.boolean().optional().default(true),
    anneeScolaireId: cuidLike.nullable().optional(),
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────
export const updateEmploiTempsSchema = z.object({
  body: z.object({
    jour: z.enum(JOURS).optional(),
    heureDebut: z.string().regex(timeRegex).optional(),
    heureFin: z.string().regex(timeRegex).optional(),
    classeId: cuidLike.optional(),
    enseignantId: cuidLike.optional(),
    matiereId: cuidLike.optional(),
    salle: z.string().trim().max(50).nullable().optional(),
    estRecurrent: z.boolean().optional(),
    valableDu: dateLike.optional(),
    valableAu: dateLike.nullable().optional(),
    estActive: z.boolean().optional(),
    anneeScolaireId: cuidLike.nullable().optional(),
  }).strict().refine((d) => Object.keys(d).length > 0, {
    message: 'Au moins un champ doit être fourni',
  }),
  params: z.object({ id: cuidLike }),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// ID
// ──────────────────────────────────────────
export const emploiTempsIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// CHECK CONFLITS
// ──────────────────────────────────────────
export const checkConflitsSchema = z.object({
  body: z.object({
    jour: z.enum(JOURS),
    heureDebut: z.string().regex(timeRegex),
    heureFin: z.string().regex(timeRegex),
    classeId: cuidLike,
    enseignantId: cuidLike,
    salle: z.string().trim().max(50).nullable().optional(),
    valableDu: dateLike,
    valableAu: dateLike.nullable().optional(),
    excludeId: cuidLike.optional(),     // pour l'update
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// LIST
// ──────────────────────────────────────────
export const listEmploisTempsSchema = z.object({
  query: z.object({
    page: intCoerce(1).optional().default(1),
    limit: intCoerce(1, 500).optional().default(100),
    search: z.string().trim().max(100).optional(),
    classeId: cuidLike.optional(),
    enseignantId: cuidLike.optional(),
    matiereId: cuidLike.optional(),
    anneeScolaireId: cuidLike.optional(),
    jour: z.enum(JOURS).optional(),
    estActive: booleanCoerce.optional(),
    sortBy: z
      .enum(['jour', 'heureDebut', 'createdAt'])
      .optional()
      .default('heureDebut'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }).strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────
export type CreateEmploiTempsInput = z.infer<typeof createEmploiTempsSchema>['body'];
export type UpdateEmploiTempsInput = z.infer<typeof updateEmploiTempsSchema>['body'];
export type CheckConflitsInput = z.infer<typeof checkConflitsSchema>['body'];
export type ListEmploisTempsQuery = z.infer<typeof listEmploisTempsSchema>['query'];