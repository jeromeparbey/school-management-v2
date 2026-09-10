// backend/src/modules/auth/auth.validation.ts

import { z } from 'zod';

// ============================================
// SCHÉMAS DES ROUTES
// ============================================

/** POST /register */
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(8, 'Au moins 8 caractères'),
  prenom: z.string().min(1, 'Prénom requis'),
  nom: z.string().min(1, 'Nom requis'),
  role: z
    .enum(['DIRECTEUR', 'SECRETAIRE', 'ENSEIGNANT', 'PARENT', 'ADMIN'])
    .optional(),
  telephone: z.string().optional(),
});

/** POST /login */
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
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
  email: z.string().email('Email invalide'),
});

/** POST /reset-password */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  nouveauMotDePasse: z.string().min(8, 'Au moins 8 caractères'),
});

/** POST /change-password */
export const changePasswordSchema = z.object({
  ancienMotDePasse: z.string().min(1, 'Ancien mot de passe requis'),
  nouveauMotDePasse: z.string().min(8, 'Au moins 8 caractères'),
});

/** PUT /me */
export const updateProfileSchema = z.object({
  prenom: z.string().min(1).optional(),
  nom: z.string().min(1).optional(),
  telephone: z.string().optional(),
  photoProfil: z.string().optional(),
});