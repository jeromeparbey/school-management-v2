// backend/src/modules/auth/auth.validation.ts

import { z } from 'zod';

// ============================================
// SCHÉMAS DE BASE RÉUTILISABLES
// ============================================

const emailSchema = z
  .string()
  .email('Email invalide')
  .toLowerCase()
  .trim();

const passwordSchema = z
  .string()
  .min(8, 'Au moins 8 caractères')
  .max(128, 'Maximum 128 caractères');

const telephoneSchema = z
  .string()
  .regex(/^\+?[0-9\s\-().]{7,20}$/, 'Numéro de téléphone invalide')
  .trim();

const sexeSchema = z.enum(['M', 'F', 'MASCULIN', 'FEMININ', 'AUTRE'], {
  message: 'Sexe invalide (M, F, MASCULIN, FEMININ)',
});

const typeContratSchema = z.enum(
  ['CDI', 'CDD', 'VACATAIRE', 'STAGIAIRE', 'BENEVOLE'],
  { message: 'Type de contrat invalide' }
);

const groupeSanguinSchema = z.enum([
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
]);

/** Vérifie qu'une date est valide et que l'âge est entre 2 et 100 ans */
const dateNaissanceSchema = z.string().refine(
  (val) => {
    const d = new Date(val);
    if (isNaN(d.getTime())) return false;
    const age = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 2 && age <= 100;
  },
  { message: 'Date de naissance invalide (âge entre 2 et 100 ans)' }
);

/** Vérifie qu'une date est valide */
const dateEmbaucheSchema = z
  .string()
  .refine((val) => !isNaN(new Date(val).getTime()), "Date d'embauche invalide");

// ============================================
// SCHÉMAS DES ROUTES
// ============================================

/** POST /register */
export const registerSchema = z.object({
  email: emailSchema,
  motDePasse: passwordSchema,
  prenom: z.string().min(1, 'Prénom requis').trim(),
  nom: z.string().min(1, 'Nom requis').trim(),
  role: z
    .enum(['DIRECTEUR', 'SECRETAIRE', 'ENSEIGNANT', 'PARENT', 'ADMIN'])
    .optional(),
  telephone: telephoneSchema.optional(),
});

/** POST /login */
export const loginSchema = z.object({
  email: emailSchema,
  motDePasse: z.string().min(1, 'Mot de passe requis'),
});

/** POST /verify-otp */
export const verifyOtpSchema = z.object({
  userId: z.string().min(1, 'userId requis'),
  otp: z.string().regex(/^\d{6}$/, 'OTP = 6 chiffres'),
});

/** POST /resend-otp */
export const resendOtpSchema = z.object({
  userId: z.string().min(1, 'userId requis'),
});

/** POST /refresh */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

/** POST /forgot-password */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/** POST /reset-password */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  nouveauMotDePasse: passwordSchema,
});

/** POST /change-password */
export const changePasswordSchema = z.object({
  ancienMotDePasse: z.string().min(1, 'Ancien mot de passe requis'),
  nouveauMotDePasse: passwordSchema,
});

/** PUT /me */
export const updateProfileSchema = z.object({
  prenom: z.string().min(1).optional(),
  nom: z.string().min(1).optional(),
  telephone: telephoneSchema.optional(),
  photoProfil: z.string().url('URL de photo invalide').optional(),
});

// ============================================
// SCHÉMAS SPÉCIALISÉS — ÉLÈVE ET SURVEILLANT
// ============================================

/** POST /register/eleve */
export const registerEleveSchema = z.object({
  // Compte utilisateur
  email: emailSchema,
  motDePasse: passwordSchema,
  prenom: z.string().min(1, 'Prénom requis').trim(),
  nom: z.string().min(1, 'Nom requis').trim(),
  telephone: telephoneSchema.optional(),

  // Profil élève
  sexe: sexeSchema,
  dateNaissance: dateNaissanceSchema,
  lieuNaissance: z.string().max(150).optional(),
  nationalite: z.string().max(100).optional(),
  adresse: z.string().max(255).optional(),
  groupeSanguin: groupeSanguinSchema.optional(),
  allergies: z.string().max(500).optional(),
  infoMedicale: z.string().max(1000).optional(),

  // Établissement (obligatoire en multi-tenant)
  etablissementId: z
    .string()
    .min(1, "L'identifiant de l'établissement est requis"),
});

/** POST /register/surveillant */
export const registerSurveillantSchema = z.object({
  // Compte utilisateur
  email: emailSchema,
  motDePasse: passwordSchema,
  prenom: z.string().min(1, 'Prénom requis').trim(),
  nom: z.string().min(1, 'Nom requis').trim(),
  telephone: telephoneSchema,

  // Profil surveillant
  sexe: sexeSchema,
  dateNaissance: dateNaissanceSchema.optional(),
  adresse: z.string().max(255).optional(),
  dateEmbauche: dateEmbaucheSchema,
  typeContrat: typeContratSchema,
  zoneSurveillance: z.string().max(100).optional(),

  // Établissement (obligatoire)
  etablissementId: z
    .string()
    .min(1, "L'identifiant de l'établissement est requis"),
});

/** POST /login/eleve */
export const loginEleveSchema = z.object({
  email: emailSchema,
  motDePasse: z.string().min(1, 'Mot de passe requis'),
});

/** POST /login/surveillant */
export const loginSurveillantSchema = z.object({
  email: emailSchema,
  motDePasse: z.string().min(1, 'Mot de passe requis'),
});