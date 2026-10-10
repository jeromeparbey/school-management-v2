// frontend/src/types/auth.types.ts

export type RoleUtilisateur =
  | 'DIRECTEUR'
  | 'SECRETAIRE'
  | 'ENSEIGNANT'
  | 'PARENT'
  | 'ADMIN';

export interface User {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: RoleUtilisateur;
  estActif: boolean;
  emailVerifie: boolean;
  telephone?: string | null;
  photoProfil?: string | null;
  derniereConnexion?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: Tokens;
}

export interface ApiResponse<T> {
  status: number;
  message?: string;
  data?: T;
  timestamp: string;
}

// ============ PAYLOADS ============

export interface LoginPayload {
  email: string;
  motDePasse: string;
}

export interface RegisterPayload {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  role?: RoleUtilisateur;
  telephone?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;               // ⚠️ adapter au schéma exact (codeOtp ?)
}

export interface ResendOtpPayload {
  email: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  nouveauMotDePasse: string;  // ⚠️ adapter au schéma exact
}

export interface ChangePasswordPayload {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}

export interface UpdateProfilePayload {
  prenom?: string;
  nom?: string;
  telephone?: string | null;
  photoProfil?: string | null;
}