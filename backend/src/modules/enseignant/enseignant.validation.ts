// backend/src/modules/enseignant/enseignant.validation.ts

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
export const createEnseignantSchema = z.object({
  body: z
    .object({
      // ─── Compte utilisateur (optionnel) ───
      email: z.string().email().max(150).nullable().optional(),
      motDePasse: z.string().min(8).max(128).nullable().optional(),

      // ─── Profil enseignant (obligatoire) ───
      prenom: z.string().trim().min(2).max(100),
      nom: z.string().trim().min(2).max(100),
      sexe: z.enum(['M', 'F']),
      dateNaissance: dateLike,
      telephone: z.string().trim().min(1).max(30),
      adresse: z.string().trim().max(300).nullable().optional(),
      photo: z.string().trim().max(500).nullable().optional(),
      dateEmbauche: dateLike,
      typeContrat: z.string().trim().min(1).max(50),
      qualification: z.string().trim().max(200).nullable().optional(),
      specialite: z.string().trim().max(200).nullable().optional(),
      salaireBase: z.number().min(0),
      infosBancaires: z.any().nullable().optional(),
      estActif: z.boolean().optional().default(true),
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────
export const updateEnseignantSchema = z.object({
  body: z
    .object({
      // ─── Compte utilisateur ───
      email: z.string().email().max(150).nullable().optional(),
      motDePasse: z.string().min(8).max(128).nullable().optional(),
      // Si l'enseignant n'a pas encore de compte, on peut en créer un
      createCompte: z.boolean().optional(),

      // ─── Profil enseignant ───
      prenom: z.string().trim().min(2).max(100).optional(),
      nom: z.string().trim().min(2).max(100).optional(),
      sexe: z.enum(['M', 'F']).optional(),
      dateNaissance: dateLike.optional(),
      telephone: z.string().trim().min(1).max(30).optional(),
      adresse: z.string().trim().max(300).nullable().optional(),
      photo: z.string().trim().max(500).nullable().optional(),
      dateEmbauche: dateLike.optional(),
      typeContrat: z.string().trim().min(1).max(50).optional(),
      qualification: z.string().trim().max(200).nullable().optional(),
      specialite: z.string().trim().max(200).nullable().optional(),
      salaireBase: z.number().min(0).optional(),
      infosBancaires: z.any().nullable().optional(),
      estActif: z.boolean().optional(),
      estArchive: z.boolean().optional(),
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
export const enseignantIdSchema = z.object({
  params: z.object({ id: cuidLike }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

// ──────────────────────────────────────────
// LIST
// ──────────────────────────────────────────
export const listEnseignantsSchema = z.object({
  query: z
    .object({
      page: intCoerce(1).optional().default(1),
      limit: intCoerce(1, 200).optional().default(20),
      search: z.string().trim().max(100).optional(),
      estActif: booleanCoerce.optional(),
      estArchive: booleanCoerce.optional(),
      typeContrat: z.string().trim().max(50).optional(),
      hasCompte: booleanCoerce.optional(), // filtrer par présence de compte
      sortBy: z
        .enum(['nom', 'prenom', 'matricule', 'dateEmbauche', 'createdAt'])
        .optional()
        .default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    })
    .strict(),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

export type CreateEnseignantInput = z.infer<typeof createEnseignantSchema>['body'];
export type UpdateEnseignantInput = z.infer<typeof updateEnseignantSchema>['body'];
export type ListEnseignantsQuery = z.infer<typeof listEnseignantsSchema>['query'];