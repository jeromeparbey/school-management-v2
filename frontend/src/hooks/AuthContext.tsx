// frontend2/src/hooks/AuthContext.tsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api/auth.api';
import type {
  User,
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  UpdateProfilePayload,
  UserScope,
  EtablissementInfo,
} from '../types/auth.types';

// ============================================
// CLÉS DE CACHE
// ============================================
const CACHE_KEYS = {
  USER: 'auth_user',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  SCOPE: 'auth_scope',
  ETABLISSEMENT: 'etablissement',
} as const;

// ============================================
// HELPERS CACHE (locaux)
// ============================================
const cache = {
  getUser(): User | null {
    try {
      const raw = localStorage.getItem(CACHE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser(u: User | null): void {
    if (u) {
      localStorage.setItem(CACHE_KEYS.USER, JSON.stringify(u));
    } else {
      localStorage.removeItem(CACHE_KEYS.USER);
    }
  },

  getEtablissement(): EtablissementInfo | null {
    try {
      const raw = localStorage.getItem(CACHE_KEYS.ETABLISSEMENT);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setEtablissement(e: EtablissementInfo | null): void {
    if (e) {
      localStorage.setItem(CACHE_KEYS.ETABLISSEMENT, JSON.stringify(e));
    } else {
      localStorage.removeItem(CACHE_KEYS.ETABLISSEMENT);
    }
  },

  getScope(): UserScope | null {
    const s = localStorage.getItem(CACHE_KEYS.SCOPE);
    return s === 'TENANT' || s === 'GLOBAL' ? s : null;
  },

  setScope(s: UserScope | null): void {
    if (s) {
      localStorage.setItem(CACHE_KEYS.SCOPE, s);
    } else {
      localStorage.removeItem(CACHE_KEYS.SCOPE);
    }
  },

  getAccessToken(): string | null {
    return localStorage.getItem(CACHE_KEYS.ACCESS_TOKEN);
  },

  setAccessToken(t: string | null): void {
    if (t) {
      localStorage.setItem(CACHE_KEYS.ACCESS_TOKEN, t);
    } else {
      localStorage.removeItem(CACHE_KEYS.ACCESS_TOKEN);
    }
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(CACHE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(t: string | null): void {
    if (t) {
      localStorage.setItem(CACHE_KEYS.REFRESH_TOKEN, t);
    } else {
      localStorage.removeItem(CACHE_KEYS.REFRESH_TOKEN);
    }
  },

  hasToken(): boolean {
    return !!localStorage.getItem(CACHE_KEYS.ACCESS_TOKEN);
  },

  clearAll(): void {
    localStorage.removeItem(CACHE_KEYS.USER);
    localStorage.removeItem(CACHE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(CACHE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(CACHE_KEYS.SCOPE);
    localStorage.removeItem(CACHE_KEYS.ETABLISSEMENT);
  },
};

// ============================================
// HELPERS LOGIQUES
// ============================================

/**
 * Extrait un message d'erreur lisible depuis une exception Axios / Error.
 */
const extractErrorMessage = (e: unknown, fallback: string): string => {
  if (typeof e === 'object' && e !== null) {
    const err = e as {
      response?: { data?: { message?: string }; status?: number };
      message?: string;
    };

    if (err.response?.data?.message) return err.response.data.message;

    if (err.response?.status === 429) {
      return 'Trop de tentatives. Réessayez dans quelques minutes.';
    }

    return err.message ?? fallback;
  }
  return fallback;
};

/**
 * Détecte le scope depuis le user (fallback si non fourni par le backend).
 */
const inferScope = (u: User | null): UserScope | null => {
  if (!u) return null;
  if (u.role === 'SUPER_ADMIN') return 'GLOBAL';
  return 'TENANT';
};

/**
 * Vérifie qu'un objet ressemble à un User valide.
 */
const isValidUser = (u: any): u is User => {
  return (
    u &&
    typeof u === 'object' &&
    typeof u.id === 'string' &&
    typeof u.role === 'string'
  );
};

/**
 * Extrait l'établissement d'un User.
 */
const extractEtablissement = (u: User | null): EtablissementInfo | null => {
  if (!u) return null;
  if (u.etablissement) return u.etablissement;
  return cache.getEtablissement();
};

/**
 * Enrichit un user avec scope + etablissement.
 */
const enrichUser = (
  user: User,
  etablissement: EtablissementInfo | null,
  scope?: UserScope
): User => {
  return {
    ...user,
    scope: scope ?? inferScope(user) ?? undefined,
    etablissement: etablissement ?? null,
  };
};

// ============================================
// TYPES DU CONTEXTE
// ============================================
interface AuthContextValue {
  // État
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;

  // Scope & helpers
  scope: UserScope | null;
  isSuperAdmin: boolean;
  isTenantUser: boolean;

  // Établissement
  etablissement: EtablissementInfo | null;
  etablissementNom: string | null;
  etablissementCode: string | null;
  etablissementVille: string | null;
  hasEtablissement: boolean;

  // Actions
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<User>;
  resendOtp: (payload: ResendOtpPayload) => Promise<void>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // ─────────────────────────────────────────
  // ÉTAT INITIAL (synchrone depuis le cache)
  // ─────────────────────────────────────────
  const [user, setUser] = useState<User | null>(() => {
    const cached = cache.getUser();
    return isValidUser(cached) ? cached : null;
  });

  const [etablissement, setEtablissement] = useState<EtablissementInfo | null>(
    () => {
      const cachedUser = cache.getUser();
      return extractEtablissement(isValidUser(cachedUser) ? cachedUser : null);
    }
  );

  const [scope, setScope] = useState<UserScope | null>(() => {
    const cachedUser = cache.getUser();
    return inferScope(isValidUser(cachedUser) ? cachedUser : null);
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    cache.hasToken()
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const didInit = useRef(false);

  // ─────────────────────────────────────────
  // HELPER : applique un user + persiste
  // ─────────────────────────────────────────
  const applyUser = useCallback((u: User) => {
    setUser(u);
    setScope(inferScope(u));
    setEtablissement(u.etablissement ?? null);
    setIsAuthenticated(true);

    // Persister
    cache.setUser(u);
    if (u.scope) cache.setScope(u.scope);
    if (u.etablissement) cache.setEtablissement(u.etablissement);
  }, []);

  // ─────────────────────────────────────────
  // HELPER : persiste les tokens
  // ─────────────────────────────────────────
  const applyTokens = useCallback((tokens: { accessToken: string; refreshToken: string }) => {
    cache.setAccessToken(tokens.accessToken);
    cache.setRefreshToken(tokens.refreshToken);
  }, []);

  // ─────────────────────────────────────────
  // RESTAURATION DE SESSION AU DÉMARRAGE
  // ─────────────────────────────────────────
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const restoreSession = async () => {
      const hasToken = cache.hasToken();

      console.log('🔵 [AuthContext] restoreSession — hasToken:', hasToken);

      // ─── Cas 1 : Pas de token → non connecté
      if (!hasToken) {
        cache.clearAll();
        setUser(null);
        setIsAuthenticated(false);
        setScope(null);
        setEtablissement(null);
        setIsInitializing(false);
        return;
      }

      // ─── Cas 2 : Cache disponible → afficher immédiatement
      const cached = cache.getUser();
      if (isValidUser(cached)) {
        setUser(cached);
        setScope(inferScope(cached));
        setEtablissement(extractEtablissement(cached));
        setIsAuthenticated(true);
      }

      // ─── Cas 3 : Vérifier avec l'API (best-effort)
      try {
        const res = await authApi.me();

        if (res.success && res.data) {
          const payload: any = res.data;
          const freshUser: User = payload.user
            ? enrichUser(payload.user, payload.etablissement)
            : enrichUser(payload, payload.etablissement);

          setUser(freshUser);
          setScope(inferScope(freshUser));
          setEtablissement(freshUser.etablissement ?? null);
          setIsAuthenticated(true);

          cache.setUser(freshUser);
          if (freshUser.scope) cache.setScope(freshUser.scope);
          if (freshUser.etablissement) cache.setEtablissement(freshUser.etablissement);
        }
      } catch (err: any) {
        const status = err?.response?.status;

        // 401 → tenter refresh
        if (status === 401) {
          try {
            const refreshToken = cache.getRefreshToken();
            if (!refreshToken) throw new Error('No refresh token');

            const refreshRes = await authApi.refresh({ refreshToken });

            if (refreshRes.success && refreshRes.data) {
              applyTokens(refreshRes.data.tokens);

              // Re-fetch me
              const meRes = await authApi.me();
              if (meRes.success && meRes.data) {
                const payload: any = meRes.data;
                const freshUser: User = payload.user
                  ? enrichUser(payload.user, payload.etablissement)
                  : enrichUser(payload, payload.etablissement);

                applyUser(freshUser);
              }
            }
          } catch {
            // Refresh échoué → déconnexion
            cache.clearAll();
            setUser(null);
            setIsAuthenticated(false);
            setScope(null);
            setEtablissement(null);
          }
        }
        // Autres erreurs (500, réseau) → garder le cache
      } finally {
        setIsInitializing(false);
      }
    };

    void restoreSession();
  }, [applyUser, applyTokens]);

  // ─────────────────────────────────────────
  // WRAPPER : gestion d'erreur + loading
  // ─────────────────────────────────────────
  const run = useCallback(
    async <T,>(fn: () => Promise<T>, fallbackError: string): Promise<T> => {
      setIsLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (e) {
        const msg = extractErrorMessage(e, fallbackError);
        setError(msg);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ─────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────

  const login = useCallback(
    (payload: LoginPayload) =>
      run(async () => {
        const res = await authApi.login(payload);

        if (!res.success || !res.data) {
          throw new Error(res.message ?? 'Échec de connexion');
        }

        const { user: rawUser, tokens, etablissement: etab, scope: s } = res.data;

        const u = enrichUser(rawUser, etab ?? null, s);
        applyTokens(tokens);
        applyUser(u);

        return u;
      }, 'Erreur de connexion'),
    [run, applyTokens, applyUser]
  );

  const register = useCallback(
    (payload: RegisterPayload) =>
      run(async () => {
        const res = await authApi.register(payload);

        if (!res.success || !res.data) {
          throw new Error(res.message ?? "Échec de l'inscription");
        }

        const { user: rawUser, tokens, etablissement: etab } = res.data;

        const u = enrichUser(rawUser, etab ?? null);
        applyTokens(tokens);
        applyUser(u);

        return u;
      }, "Erreur lors de l'inscription"),
    [run, applyTokens, applyUser]
  );

  const verifyOtp = useCallback(
    (payload: VerifyOtpPayload) =>
      run(async () => {
        const res = await authApi.verifyOtp(payload);

        if (!res.success || !res.data) {
          throw new Error(res.message ?? 'OTP invalide');
        }

        const { user: rawUser, tokens, etablissement: etab } = res.data;

        const u = enrichUser(rawUser, etab ?? null);
        applyTokens(tokens);
        applyUser(u);

        return u;
      }, 'OTP invalide ou expiré'),
    [run, applyTokens, applyUser]
  );

  const resendOtp = useCallback(
    (payload: ResendOtpPayload) =>
      run(async () => {
        const res = await authApi.resendOtp(payload);
        if (!res.success) {
          throw new Error(res.message ?? "Échec de l'envoi OTP");
        }
      }, "Erreur lors de l'envoi de l'OTP"),
    [run]
  );

  const forgotPassword = useCallback(
    (payload: ForgotPasswordPayload) =>
      run(async () => {
        const res = await authApi.forgotPassword(payload);
        if (!res.success) {
          throw new Error(res.message ?? 'Échec de la demande');
        }
      }, 'Erreur lors de la demande'),
    [run]
  );

  const resetPassword = useCallback(
    (payload: ResetPasswordPayload) =>
      run(async () => {
        const res = await authApi.resetPassword(payload);
        if (!res.success) {
          throw new Error(res.message ?? 'Échec de la réinitialisation');
        }
      }, 'Erreur de réinitialisation'),
    [run]
  );

  const changePassword = useCallback(
    (payload: ChangePasswordPayload) =>
      run(async () => {
        const res = await authApi.changePassword(payload);
        if (!res.success) {
          throw new Error(res.message ?? 'Échec du changement');
        }
      }, 'Erreur lors du changement'),
    [run]
  );

  const updateProfile = useCallback(
    (payload: UpdateProfilePayload) =>
      run(async () => {
        const res = await authApi.updateProfile(payload);
        if (!res.success || !res.data) {
          throw new Error(res.message ?? 'Erreur mise à jour');
        }

        const u = res.data;
        setUser(u);
        cache.setUser(u);

        return u;
      }, 'Erreur de mise à jour du profil'),
    [run]
  );

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      if (res.success && res.data) {
        const payload: any = res.data;
        const freshUser: User = payload.user
          ? enrichUser(payload.user, payload.etablissement)
          : enrichUser(payload, payload.etablissement);

        applyUser(freshUser);
      }
    } catch {
      console.warn('⚠️ [AuthContext] refreshUser a échoué');
    }
  }, [applyUser]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout().catch(() => {});
    } finally {
      cache.clearAll();
      setUser(null);
      setIsAuthenticated(false);
      setScope(null);
      setEtablissement(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // ─────────────────────────────────────────
  // HELPERS DÉRIVÉS
  // ─────────────────────────────────────────
  const isSuperAdmin = useMemo(
    () => user?.role === 'SUPER_ADMIN' || scope === 'GLOBAL',
    [user?.role, scope]
  );

  const isTenantUser = useMemo(
    () => !!user && !isSuperAdmin,
    [user, isSuperAdmin]
  );

  const etablissementNom = useMemo(
    () => etablissement?.nom ?? null,
    [etablissement]
  );

  const etablissementCode = useMemo(
    () => etablissement?.code ?? null,
    [etablissement]
  );

  const etablissementVille = useMemo(
    () => etablissement?.ville ?? null,
    [etablissement]
  );

  const hasEtablissement = useMemo(
    () => etablissement !== null,
    [etablissement]
  );

  // ─────────────────────────────────────────
  // VALEUR MÉMOÏSÉE
  // ─────────────────────────────────────────
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      isInitializing,
      error,
      scope,
      isSuperAdmin,
      isTenantUser,
      etablissement,
      etablissementNom,
      etablissementCode,
      etablissementVille,
      hasEtablissement,
      login,
      register,
      verifyOtp,
      resendOtp,
      forgotPassword,
      resetPassword,
      changePassword,
      updateProfile,
      logout,
      refreshUser,
      clearError,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      isInitializing,
      error,
      scope,
      isSuperAdmin,
      isTenantUser,
      etablissement,
      etablissementNom,
      etablissementCode,
      etablissementVille,
      hasEtablissement,
      login,
      register,
      verifyOtp,
      resendOtp,
      forgotPassword,
      resetPassword,
      changePassword,
      updateProfile,
      logout,
      refreshUser,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// HOOK
// ============================================
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      'useAuth doit être utilisé à l’intérieur d’un <AuthProvider>'
    );
  }
  return ctx;
}