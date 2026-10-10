// backend/src/modules/mon-etablissement/mon-etablissement.validation.ts

import { z } from 'zod';

const heureRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const JourSemaineEnum = z.enum([
  'LUNDI',
  'MARDI',
  'MERCREDI',
  'JEUDI',
  'VENDREDI',
  'SAMEDI',
  'DIMANCHE',
]);

const TypeEtablissementEnum = z.enum([
  'PUBLIC',
  'PRIVE',
  'PRIVE_LAIQUE',
  'PRIVE_CONFESSIONNEL',
  'INTERNATIONAL',
]);

/**
 * Schéma de mise à jour de son établissement par le directeur.
 * ⚠️ PAS de code, schemaName, planAbonnement, maxUtilisateurs ici.
 */
export const updateMonEtablissementSchema = z.object({
  body: z
    .object({
      nom: z.string().min(2).max(200).optional(),
      logo: z.string().url('URL invalide').nullable().optional(),
      adresse: z.string().max(300).nullable().optional(),
      ville: z.string().max(100).nullable().optional(),
      pays: z.string().max(100).optional(),
      telephone: z
        .string()
        .max(30)
        .regex(/^[+0-9 ()-]+$/, 'Format de téléphone invalide')
        .nullable()
        .optional(),
      email: z.string().email().max(150).nullable().optional(),
      siteWeb: z.string().url('URL invalide').nullable().optional(),
      numeroAgrement: z.string().max(100).nullable().optional(),
      devise: z.string().length(3).optional(),
      fuseauHoraire: z.string().max(50).optional(),
      formatDate: z.string().max(20).optional(),
      joursOuvrables: z.array(JourSemaineEnum).min(1).optional(),
      heureDebut: z.string().regex(heureRegex).optional(),
      heureFin: z.string().regex(heureRegex).optional(),
      toleranceRetard: z.number().int().min(0).max(120).optional(),
      tauxHeureSup: z.number().min(1).max(3).optional(),
      type: TypeEtablissementEnum.optional(),
    })
    .strict(), // 🔥 Rejette tout champ non autorisé
});

export type UpdateMonEtablissementInput = z.infer<
  typeof updateMonEtablissementSchema
>['body'];