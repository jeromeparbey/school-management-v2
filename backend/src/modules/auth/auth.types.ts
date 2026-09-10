// backend/src/modules/auth/auth.types.ts

import type { RoleUtilisateur } from '@prisma/client';

// ============================================
// REQUÊTES
// ============================================

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  role?: RoleUtilisateur;
  telephone?: string;
}

export interface VerifyOtpRequest {
  userId: string;
  otp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  nouveauMotDePasse: string;
}

export interface ChangePasswordRequest {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}

// ============================================
// RÉPONSES
// ============================================

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: RoleUtilisateur;
  estActif: boolean;
  emailVerifie: boolean;
  telephone?: string | null;
  photoProfil?: string | null;
  derniereConnexion?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// STORES EN MÉMOIRE (OTP / RESET TOKEN)
// ============================================

export interface IOtpStore {
  otp: string;
  expiresAt: number;
  attempts: number;
}

/** Le token de réinitialisation contient aussi l'userId associé */
export interface IResetTokenStore {
  token: string;
  userId: string;
  expiresAt: number;
  used: boolean;
}

// ============================================
// DÉCLARATION GLOBALE (une seule fois, non-optionnelle)
// ============================================

declare global {
  // eslint-disable-next-line no-var
  var otpStore: Map<string, IOtpStore>;
  // eslint-disable-next-line no-var
  var resetTokenStore: Map<string, IResetTokenStore>;
}

export {};