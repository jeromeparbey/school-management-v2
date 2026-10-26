// backend/src/modules/utilisateur/utilisateur.validation.ts

import { z } from 'zod';

// ──────────────────────────────────────────
// ENUMS
// ──────────────────────────────────────────

export const RoleUtilisateurEnum = z.enum([
  'DIRECTEUR',
  'SECRETAIRE',
  'ENSEIGNANT',
  'SURVEILLANT',
  'PARENT',
  'ELEVE',
  'ADMIN',
  'BIBLIOTHECAIRE',
]);

const SexeEnum = z.enum(['M', 'F', 'MASCULIN', 'FEMININ', 'AUTRE']);

const TypeContratEnum = z.enum(['CDI', 'CDD', 'VACATAIRE', 'STAGIAIRE', 'BENEVOLE']);

const GroupeSanguinEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

const motDePasseSchema = z
  .string({ error: 'Mot de passe obligatoire' })
  .min(8, 'Minimum 8 caractères')
  .max(128)
  .regex(/[a-z]/, 'Doit contenir une minuscule')
  .regex(/[A-Z]/, 'Doit contenir une majuscule')
  .regex(/[0-9]/, 'Doit contenir un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Doit contenir un caractère spécial');

const telephoneSchema = z
  .string()
  .max(30)
  .regex(/^[+0-9 ()-]+$/, 'Format téléphone invalide');

const dateSchema = z.string().refine((v) => !isNaN(new Date(v).getTime()), {
  message: 'Date invalide',
});

// ──────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────

export const createUtilisateurSchema = z.object({
  body: z
    .object({
      email: z.string().email('Email invalide').max(150),
      motDePasse: motDePasseSchema,
      prenom: z.string().min(2, 'Minimum 2 caractères').max(100),
      nom: z.string().min(2, 'Minimum 2 caractères').max(100),
      role: RoleUtilisateurEnum,
      telephone: telephoneSchema.optional().nullable(),
      photoProfil: z.string().url('URL invalide').optional().nullable(),

      // Profil métier
      sexe: SexeEnum.optional(),
      dateNaissance: dateSchema.optional(),
      adresse: z.string().max(300).optional().nullable(),

      // Élève
      lieuNaissance: z.string().max(100).optional().nullable(),
      nationalite: z.string().max(100).optional().nullable(),
      groupeSanguin: GroupeSanguinEnum.optional().nullable(),
      allergies: z.string().max(500).optional().nullable(),
      infoMedicale: z.string().max(1000).optional().nullable(),

      // Enseignant / Surveillant
      dateEmbauche: dateSchema.optional(),
      typeContrat: TypeContratEnum.optional(),
      qualification: z.string().max(200).optional().nullable(),
      specialite: z.string().max(200).optional().nullable(),
      salaireBase: z.number().nonnegative().optional(),
      infosBancaires: z.record(z.string(), z.any()).optional().nullable(),
      zoneSurveillance: z.string().max(100).optional().nullable(),
    })
    .superRefine((data, ctx) => {
      // Champs requis par rôle
      if (data.role === 'ELEVE') {
        if (!data.sexe) {
          ctx.addIssue({
            code: 'custom',
            path: ['sexe'],
            message: 'sexe requis pour un élève',
          });
        }
        if (!data.dateNaissance) {
          ctx.addIssue({
            code: 'custom',
            path: ['dateNaissance'],
            message: 'dateNaissance requise pour un élève',
          });
        }
      }

      if (data.role === 'ENSEIGNANT' || data.role === 'SURVEILLANT') {
        if (!data.telephone) {
          ctx.addIssue({
            code: 'custom',
            path: ['telephone'],
            message: 'telephone requis',
          });
        }
        if (!data.sexe) {
          ctx.addIssue({
            code: 'custom',
            path: ['sexe'],
            message: 'sexe requis',
          });
        }
      }

      if (data.role === 'ENSEIGNANT') {
        if (!data.dateNaissance) {
          ctx.addIssue({
            code: 'custom',
            path: ['dateNaissance'],
            message: 'dateNaissance requise',
          });
        }
        if (!data.dateEmbauche) {
          ctx.addIssue({
            code: 'custom',
            path: ['dateEmbauche'],
            message: "dateEmbauche requise",
          });
        }
        if (data.salaireBase === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: ['salaireBase'],
            message: 'salaireBase requis',
          });
        }
      }

      if (data.role === 'SURVEILLANT' && !data.dateEmbauche) {
        ctx.addIssue({
          code: 'custom',
          path: ['dateEmbauche'],
          message: "dateEmbauche requise",
        });
      }
    }),
});

// ──────────────────────────────────────────
// UPDATE (tout optionnel, pas de motDePasse)
// ──────────────────────────────────────────

export const updateUtilisateurSchema = z.object({
  params: z.object({ id: z.string().cuid('ID invalide') }),
  body: z
    .object({
      email: z.string().email('Email invalide').max(150).optional(),
      prenom: z.string().min(2).max(100).optional(),
      nom: z.string().min(2).max(100).optional(),
      telephone: telephoneSchema.optional().nullable(),
      photoProfil: z.string().url().optional().nullable(),
      role: RoleUtilisateurEnum.optional(),
      estActif: z.boolean().optional(),

      sexe: SexeEnum.optional(),
      dateNaissance: dateSchema.optional(),
      adresse: z.string().max(300).optional().nullable(),

      lieuNaissance: z.string().max(100).optional().nullable(),
      nationalite: z.string().max(100).optional().nullable(),
      groupeSanguin: GroupeSanguinEnum.optional().nullable(),
      allergies: z.string().max(500).optional().nullable(),
      infoMedicale: z.string().max(1000).optional().nullable(),

      typeContrat: TypeContratEnum.optional(),
      qualification: z.string().max(200).optional().nullable(),
      specialite: z.string().max(200).optional().nullable(),
      salaireBase: z.number().nonnegative().optional(),
      infosBancaires: z.record(z.string(), z.any()).optional().nullable(),
      zoneSurveillance: z.string().max(100).optional().nullable(),
    })
    .refine((d) => Object.keys(d).length > 0, {
      message: 'Aucun champ à mettre à jour',
    }),
});

// ──────────────────────────────────────────
// ID seul
// ──────────────────────────────────────────

export const utilisateurIdSchema = z.object({
  params: z.object({ id: z.string().cuid('ID invalide') }),
});

// ──────────────────────────────────────────
// LIST
// ──────────────────────────────────────────

export const listUtilisateursSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),
    role: RoleUtilisateurEnum.optional(),
    estActif: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
    sortBy: z.enum(['nom', 'email', 'role', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

// ──────────────────────────────────────────
// TOGGLE ACTIF
// ──────────────────────────────────────────

export const toggleUtilisateurSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    estActif: z.boolean({ error: 'estActif obligatoire' }),
  }),
});

// ──────────────────────────────────────────
// CHANGE PASSWORD (self)
// ──────────────────────────────────────────

export const changePasswordSchema = z.object({
  body: z
    .object({
      ancienMotDePasse: z.string({ error: 'Ancien mot de passe requis' }),
      nouveauMotDePasse: motDePasseSchema,
    })
    .refine((d) => d.ancienMotDePasse !== d.nouveauMotDePasse, {
      message: 'Le nouveau mot de passe doit être différent',
      path: ['nouveauMotDePasse'],
    }),
});

// ──────────────────────────────────────────
// RESET PASSWORD (admin)
// ──────────────────────────────────────────

export const resetPasswordSchema = z.object({
  params: z.object({ id: z.string().cuid('ID invalide') }),
  body: z.object({
    nouveauMotDePasse: motDePasseSchema,
  }),
});

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────

export type CreateUtilisateurBody = z.infer<typeof createUtilisateurSchema>['body'];
export type UpdateUtilisateurBody = z.infer<typeof updateUtilisateurSchema>['body'];
export type ListUtilisateursQ = z.infer<typeof listUtilisateursSchema>['query'];