// backend/src/modules/eleve/eleve.validation.ts

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

export const createEleveSchema = z.object({
  body: z
    .object({
      // ─── Compte utilisateur (optionnel) ───
      email: z.string().email().max(150).nullable().optional(),
      motDePasse: z.string().min(8).max(128).nullable().optional(),

      // ─── Profil élève (obligatoire) ───
      prenom: z.string().trim().min(1).max(100),
      nom: z.string().trim().min(1).max(100),
      sexe: z.enum(['M', 'F']),
      dateNaissance: dateLike,
      lieuNaissance: z.string().trim().max(100).nullable().optional(),
      nationalite: z.string().trim().max(100).nullable().optional(),
      adresse: z.string().trim().max(300).nullable().optional(),
      telephone: z.string().trim().max(30).nullable().optional(),
      photo: z.string().trim().max(500).nullable().optional(),
      infoMedicale: z.string().trim().max(1000).nullable().optional(),
      groupeSanguin: z.string().trim().max(10).nullable().optional(),
      allergies: z.string().trim().max(500).nullable().optional(),
      statut: z
        .enum(['ACTIF', 'TRANSFERE', 'SORTI', 'SUSPENDU', 'ARCHIVE'])
        .optional()
        .default('ACTIF'),

      // ─── 🆕 Inscription automatique (optionnel) ───
      // Si fourni : création auto de l'Inscription + AssignmentScolarite
      classeId: cuidLike.nullable().optional(),
      // Sinon : utilise l'année scolaire active
      anneeScolaireId: cuidLike.nullable().optional(),
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────

export const updateEleveSchema = z.object({
  body: z
    .object({
      // ─── Compte utilisateur ───
      email: z.string().email().max(150).nullable().optional(),
      motDePasse: z.string().min(8).max(128).nullable().optional(),
      createCompte: z.boolean().optional(),

      // ─── Profil élève ───
      prenom: z.string().trim().min(1).max(100).optional(),
      nom: z.string().trim().min(1).max(100).optional(),
      sexe: z.enum(['M', 'F']).optional(),
      dateNaissance: dateLike.optional(),
      lieuNaissance: z.string().trim().max(100).nullable().optional(),
      nationalite: z.string().trim().max(100).nullable().optional(),
      adresse: z.string().trim().max(300).nullable().optional(),
      telephone: z.string().trim().max(30).nullable().optional(),
      photo: z.string().trim().max(500).nullable().optional(),
      infoMedicale: z.string().trim().max(1000).nullable().optional(),
      groupeSanguin: z.string().trim().max(10).nullable().optional(),
      allergies: z.string().trim().max(500).nullable().optional(),
      statut: z
        .enum(['ACTIF', 'TRANSFERE', 'SORTI', 'SUSPENDU', 'ARCHIVE'])
        .optional(),

      // ─── 🆕 Changement de classe (optionnel) ───
      // null  → retire l'élève de sa classe active
      // cuid  → réinscrit dans cette classe (désactive l'ancienne inscription)
      classeId: cuidLike.nullable().optional(),
      anneeScolaireId: cuidLike.nullable().optional(),
    })
    .strict()
    .refine((d) => Object.keys(d).length > 0, {
      message: 'Au moins un champ doit être fourni',
    }),
  params: z.object({ id: cuidLike }),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// AUTRES SCHÉMAS (inchangés)
// ──────────────────────────────────────────

export const eleveIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listElevesSchema = z.object({
  query: z
    .object({
      page: intCoerce(1).optional().default(1),
      limit: intCoerce(1, 10000).optional().default(10000),
      search: z.string().trim().max(100).optional(),
      statut: z
        .enum(['ACTIF', 'TRANSFERE', 'SORTI', 'SUSPENDU', 'ARCHIVE'])
        .optional(),
      sexe: z.enum(['M', 'F']).optional(),
      hasCompte: booleanCoerce.optional(),
      classeId: cuidLike.optional(),
      anneeScolaireId: cuidLike.optional(),
      sortBy: z
        .enum(['nom', 'prenom', 'matricule', 'dateNaissance', 'createdAt'])
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

export type CreateEleveInput = z.infer<typeof createEleveSchema>['body'];
export type UpdateEleveInput = z.infer<typeof updateEleveSchema>['body'];
export type ListElevesQuery = z.infer<typeof listElevesSchema>['query'];