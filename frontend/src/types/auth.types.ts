// frontend2/src/types/auth.types.ts

// ============================================
// SCOPE (multi-tenant)
// ============================================
export type UserScope = 'TENANT' | 'GLOBAL';

// ============================================
// RÔLES UTILISATEUR (9 rôles)
// ============================================
export type RoleUtilisateur =
  | 'SUPER_ADMIN'      // Administrateur global multi-tenant
  | 'ADMIN'            // Admin système de l'établissement
  | 'DIRECTEUR'        // Directeur d'établissement
  | 'SECRETAIRE'       // Secrétaire
  | 'ENSEIGNANT'       // Enseignant
  | 'SURVEILLANT'      // Surveillant
  | 'PARENT'           // Parent d'élève
  | 'ELEVE'            // Élève
  | 'BIBLIOTHECAIRE';  // Bibliothécaire

// ============================================
// 🆕 ÉTABLISSEMENT (info publique)
// ============================================
export interface EtablissementInfo {
  id: string;
  nom: string;
  code: string;
  logo: string | null;
  ville: string | null;
  pays: string;
  devise: string;
  type: string;
  planAbonnement: string;
  fuseauHoraire: string;
  formatDate: string;
  telephone: string | null;
  email: string | null;
}

// ============================================
// UTILISATEUR
// ============================================
export interface User {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: RoleUtilisateur;
  estActif: boolean;
  emailVerifie: boolean;
  telephone: string | null;
  photoProfil: string | null;
  derniereConnexion: Date | null;
  createdAt: Date;
  updatedAt: Date;

  /** Scope : 'TENANT' (établissement) ou 'GLOBAL' (super-admin) */
  scope?: UserScope;

  /** Établissement du user (uniquement pour scope TENANT) */
  etablissement?: EtablissementInfo | null;
}

// ============================================
// TOKENS
// ============================================
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// ============================================
// PAYLOADS
// ============================================
export interface LoginPayload {
  email: string;
  motDePasse: string;
  etablissementId?: string;
}

export interface RegisterPayload {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  role?: RoleUtilisateur;
  telephone?: string;
  etablissementId?: string;
}

export interface VerifyOtpPayload {
  userId: string;
  otp: string;
  etablissementId?: string;
}

export interface ResendOtpPayload {
  userId: string;
  etablissementId?: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface ForgotPasswordPayload {
  email: string;
  etablissementId?: string;
}

// ⭐ AJOUT — OTP reset password
export interface VerifyResetOtpPayload {
  email: string;
  otp: string;
  etablissementId: string;
}

export interface ResetPasswordPayload {
  token: string;
  nouveauMotDePasse: string;
  etablissementId?: string;
}

export interface ChangePasswordPayload {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}

export interface UpdateProfilePayload {
  prenom?: string;
  nom?: string;
  telephone?: string;
  photoProfil?: string;
}

// ============================================
// RÉPONSES API
// ============================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

export interface AuthResponse {
  user: User;
  etablissement?: EtablissementInfo | null;
  tokens: Tokens;
  scope?: UserScope;
}

// ⭐ AJOUT — retours des endpoints reset password
export interface ForgotPasswordResponse {
  email: string;
  etablissementId: string | null;
}

export interface VerifyResetOtpResponse {
  resetToken: string;
  etablissementId: string;
}