// frontend/src/api/auth.api.ts
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
  type ResetPasswordPayload,
  type ChangePasswordPayload,
  type UpdateProfilePayload,
  type Tokens,
} from '../types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

// Instance axios avec intercepteur pour access token
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // nécessaire si refresh token en cookie httpOnly
  headers: { 'Content-Type': 'application/json' },
});

// Ajout automatique du Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion du 401 → tentative de refresh automatique
let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

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
      .post<ApiResponse<null>>('/auth/forgot-password', payload)
      .then((r) => r.data),

  /** POST /auth/reset-password */
  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient
      .post<ApiResponse<null>>('/auth/reset-password', payload)
      .then((r) => r.data),

  /** POST /auth/logout */
  logout: () =>
    apiClient.post<ApiResponse<null>>('/auth/logout').then((r) => r.data),

  /** GET /auth/me — 🔒 */
  me: () =>
    apiClient.get<ApiResponse<User>>('/auth/me').then((r) => r.data),

  /** PUT /auth/me — 🔒 */
  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient
      .put<ApiResponse<User>>('/auth/me', payload)
      .then((r) => r.data),

  /** POST /auth/change-password — 🔒 */
  changePassword: (payload: ChangePasswordPayload) =>
    apiClient
      .post<ApiResponse<null>>('/auth/change-password', payload)
      .then((r) => r.data),
};