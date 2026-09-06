// backend/src/modules/auth/auth.types.ts

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  role?: 'DIRECTEUR' | 'SECRETAIRE' | 'ENSEIGNANT' | 'PARENT' | 'ADMIN';
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

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: string;
  estActif: boolean;
  emailVerifie: boolean;
  telephone?: string | null;
  photoProfil?: string | null;
  derniereConnexion?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOtpStore {
  otp: string;
  expiresAt: number;
  attempts: number;
}

export interface IResetTokenStore {
  token: string;
  expiresAt: number;
  used: boolean;
}

// Déclaration globale pour le stockage
declare global {
  var otpStore: Map<string, IOtpStore>;
  var resetTokenStore: Map<string, IResetTokenStore>;
}