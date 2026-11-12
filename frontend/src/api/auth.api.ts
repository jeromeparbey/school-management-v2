// frontend2/src/api/auth.api.ts

import axios, { type AxiosInstance } from 'axios';
import {
  type AuthResponse,
  type ApiResponse,
  type User,
  type LoginPayload,
  type RegisterPayload,
  type VerifyOtpPayload,
  type ResendOtpPayload,
  type RefreshTokenPayload,
  type ForgotPasswordPayload,
  type ForgotPasswordResponse,
  type VerifyResetOtpPayload,
  type VerifyResetOtpResponse,
  type ResetPasswordPayload,
  type ChangePasswordPayload,
  type UpdateProfilePayload,
  type Tokens,
} from '../types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

// ============================================
// CONSTANTES DE SESSION
// ============================================

/** Intervalle de refresh proactif : 8 min (avant expiration à 15 min) */
const PROACTIVE_REFRESH_INTERVAL_MS = 8 * 60 * 1000;

/** Clé sessionStorage pour restaurer la route après login */
export const REDIRECT_AFTER_LOGIN_KEY = 'redirectAfterLogin';

// ============================================
// INSTANCE AXIOS
// ============================================
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Ajout automatique du Bearer token ───
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// GESTION DU 401 → REFRESH AUTOMATIQUE
// ============================================
let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

/**
 * Sauvegarde la route actuelle AVANT de rediriger vers /login.
 * Permet de restaurer la navigation après reconnexion.
 */
const saveCurrentRoute = () => {
  const path = window.location.pathname + window.location.search;
  if (
    path &&
    path !== '/login' &&
    path !== '/register' &&
    !path.startsWith('/login?') &&
    !path.startsWith('/register?')
  ) {
    sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, path);
  }
};

/**
 * Vide les tokens et redirige vers /login.
 * La route actuelle est sauvegardée pour restauration.
 */
const forceLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  saveCurrentRoute();
  window.location.href = '/login';
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // Pas de refresh token → on force le logout mais on sauvegarde la route
        forceLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post<ApiResponse<{ tokens: Tokens }>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );
        const newTokens = data.data!.tokens;
        localStorage.setItem('accessToken', newTokens.accessToken);
        localStorage.setItem('refreshToken', newTokens.refreshToken);

        pendingQueue.forEach((cb) => cb(newTokens.accessToken));
        pendingQueue = [];

        original.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return apiClient(original);
      } catch (e) {
        forceLogout();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// 🆕 REFRESH PROACTIF
// ============================================

let proactiveRefreshTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Rafraîchit le token d'accès en arrière-plan.
 * Appelé par AuthContext après login.
 */
export const refreshTokenNow = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const { data } = await axios.post<ApiResponse<{ tokens: Tokens }>>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken }
    );
    const newTokens = data.data!.tokens;
    localStorage.setItem('accessToken', newTokens.accessToken);
    localStorage.setItem('refreshToken', newTokens.refreshToken);
    return true;
  } catch {
    return false;
  }
};

/**
 * Démarre le refresh proactif (toutes les 8 min).
 * Idempotent : ne fait rien si déjà démarré.
 */
export const startProactiveRefresh = () => {
  if (proactiveRefreshTimer) return;

  proactiveRefreshTimer = setInterval(async () => {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) return;
    await refreshTokenNow();
  }, PROACTIVE_REFRESH_INTERVAL_MS);
};

/**
 * Arrête le refresh proactif.
 */
export const stopProactiveRefresh = () => {
  if (proactiveRefreshTimer) {
    clearInterval(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }
};

// ============================================
// SERVICE AUTH — 1 fonction = 1 route backend
// ============================================
export const authApi = {
  /** POST /auth/register */
  register: (payload: RegisterPayload) =>
    apiClient
      .post<ApiResponse<AuthResponse>>('/auth/register', payload)
      .then((r) => r.data),

  /** POST /auth/login */
  login: (payload: LoginPayload) =>
    apiClient
      .post<ApiResponse<AuthResponse>>('/auth/login', payload)
      .then((r) => r.data),

  /** POST /auth/verify-otp */
  verifyOtp: (payload: VerifyOtpPayload) =>
    apiClient
      .post<ApiResponse<AuthResponse>>('/auth/verify-otp', payload)
      .then((r) => r.data),

  /** POST /auth/resend-otp */
  resendOtp: (payload: ResendOtpPayload) =>
    apiClient
      .post<ApiResponse<null>>('/auth/resend-otp', payload)
      .then((r) => r.data),

  /** POST /auth/refresh */
  refresh: (payload: RefreshTokenPayload) =>
    apiClient
      .post<ApiResponse<{ tokens: Tokens }>>('/auth/refresh', payload)
      .then((r) => r.data),

  /** POST /auth/forgot-password */
  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient
      .post<ApiResponse<ForgotPasswordResponse>>(
        '/auth/forgot-password',
        payload
      )
      .then((r) => r.data),

  /** POST /auth/verify-reset-otp */
  verifyResetOtp: (payload: VerifyResetOtpPayload) =>
    apiClient
      .post<ApiResponse<VerifyResetOtpResponse>>(
        '/auth/verify-reset-otp',
        payload
      )
      .then((r) => r.data),

  /** POST /auth/reset-password */
  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient
      .post<ApiResponse<null>>('/auth/reset-password', payload)
      .then((r) => r.data),

  /** POST /auth/logout */
  logout: () =>
    apiClient.post<ApiResponse<null>>('/auth/logout').then((r) => r.data),

  /** GET /auth/me */
  me: () =>
    apiClient
      .get<ApiResponse<User | { user: User; etablissement: any }>>('/auth/me')
      .then((r) => r.data),

  /** PUT /auth/me */
  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient
      .put<ApiResponse<User>>('/auth/me', payload)
      .then((r) => r.data),

  /** POST /auth/change-password */
  changePassword: (payload: ChangePasswordPayload) =>
    apiClient
      .post<ApiResponse<null>>('/auth/change-password', payload)
      .then((r) => r.data),
};