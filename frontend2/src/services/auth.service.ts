// frontend2/src/services/auth.service.ts
import { authApi, apiClient } from '../api/auth.api';
import type {
  User,
  Tokens,
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  UpdateProfilePayload,
} from '../types/auth.types';

// ============================================
// CLÉS DE STOCKAGE
// ============================================
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'authUser';

// ============================================
// SERVICE AUTH
// ============================================

class AuthService {
  // ------------------------------------------
  // TOKENS
  // ------------------------------------------
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(tokens: Tokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  // ------------------------------------------
  // UTILISATEUR (cache local)
  // ------------------------------------------
  getCachedUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  setCachedUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearCachedUser(): void {
    localStorage.removeItem(USER_KEY);
  }

  // ------------------------------------------
  // ÉTAT
  // ------------------------------------------
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  clearAll(): void {
    this.clearTokens();
    this.clearCachedUser();
  }

  // ------------------------------------------
  // ACTIONS API
  // ------------------------------------------

  async login(payload: LoginPayload): Promise<User> {
    const res = await authApi.login(payload);
    if (!res.data) throw new Error(res.message ?? 'Échec de la connexion');

    const { user, tokens } = res.data;
    this.setTokens(tokens);
    this.setCachedUser(user);
    return user;
  }

  async register(payload: RegisterPayload): Promise<User> {
    const res = await authApi.register(payload);
    if (!res.data) throw new Error(res.message ?? "Échec de l'inscription");

    const { user, tokens } = res.data;
    this.setTokens(tokens);
    this.setCachedUser(user);
    return user;
  }

  async verifyOtp(payload: VerifyOtpPayload): Promise<User> {
    const res = await authApi.verifyOtp(payload);
    if (!res.data) throw new Error(res.message ?? 'OTP invalide');

    const { user, tokens } = res.data;
    this.setTokens(tokens);
    this.setCachedUser(user);
    return user;
  }

  async resendOtp(payload: ResendOtpPayload): Promise<void> {
    await authApi.resendOtp(payload);
  }

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await authApi.forgotPassword(payload);
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await authApi.resetPassword(payload);
  }

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await authApi.changePassword(payload);
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const res = await authApi.updateProfile(payload);
    if (!res.data) throw new Error(res.message ?? 'Échec de la mise à jour');

    this.setCachedUser(res.data);
    return res.data;
  }

  async fetchMe(): Promise<User> {
    const res = await authApi.me();
    if (!res.data) throw new Error(res.message ?? 'Utilisateur introuvable');

    this.setCachedUser(res.data);
    return res.data;
  }

  async refresh(): Promise<Tokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('Aucun refresh token disponible');

    const res = await authApi.refresh({ refreshToken });
    if (!res.data) throw new Error(res.message ?? 'Échec du refresh');

    this.setTokens(res.data.tokens);
    return res.data.tokens;
  }

  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // On ignore les erreurs réseau : on veut quand même purger le client
    } finally {
      this.clearAll();
    }
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================
export const authService = new AuthService();

// Ré-export pratique pour les intercepteurs
export { apiClient };