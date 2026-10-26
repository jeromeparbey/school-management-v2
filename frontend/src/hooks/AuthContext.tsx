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
import {
  authApi,
 
} from '../api/auth.api';
import type {
  User,
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
   ForgotPasswordResponse,       // ⭐ depuis types/auth.types
  VerifyResetOtpResponse,
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
// TYPE GUARDS
// ============================================

const isValidUser = (u: any): u is User => {
  return (
    u &&
    typeof u === 'object' &&
    typeof u.id === 'string' &&
    typeof u.role === 'string'
  );
};

const isEtablissement = (e: any): e is EtablissementInfo => {
  return (
    e !== null &&
    typeof e === 'object' &&
    !Array.isArray(e) &&
    typeof e.id === 'string' &&
    typeof e.nom === 'string'
  );
};

// ============================================
// HELPERS CACHE (locaux)
// ============================================
const cache = {
  getUser(): User | null {
    try {
      const raw = localStorage.getItem(CACHE_KEYS.USER);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!isValidUser(parsed)) {
        localStorage.removeItem(CACHE_KEYS.USER);
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem(CACHE_KEYS.USER);
      return null;
    }
  },

  setUser(u: User | null): void {
    if (isValidUser(u)) {
      localStorage.setItem(CACHE_KEYS.USER, JSON.stringify(u));
    } else {
      localStorage.removeItem(CACHE_KEYS.USER);
    }
  },

  getEtablissement(): EtablissementInfo | null {
    try {
      const raw = localStorage.getItem(CACHE_KEYS.ETABLISSEMENT);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!isEtablissement(parsed)) {
        localStorage.removeItem(CACHE_KEYS.ETABLISSEMENT);
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem(CACHE_KEYS.ETABLISSEMENT);
      return null;
    }
  },

  setEtablissement(e: EtablissementInfo | null): void {
    if (isEtablissement(e)) {
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

const isApiSuccess = (res: any): boolean => {
  if (!res) return false;
  if (res.data !== undefined && res.data !== null) return true;
  if (typeof res.status === 'number') return res.status < 400;
  return false;
};

const isApiError = (res: any): boolean => {
  if (!res) return true;
  if (typeof res.status === 'number' && res.status >= 400) return true;
  return false;
};

const inferScope = (u: User | null): UserScope | null => {
  if (!u) return null;
  if (u.role === 'SUPER_ADMIN') return 'GLOBAL';
  return 'TENANT';
};

const extractEtablissement = (u: User | null): EtablissementInfo | null => {
  if (!u) return cache.getEtablissement();
  if (isEtablissement(u.etablissement)) return u.etablissement;
  return cache.getEtablissement();
};

const enrichUser = (
  user: User,
  etablissement: EtablissementInfo | null,
  scope?: UserScope
): User => {
  return {
    ...user,
    scope: scope ?? inferScope(user) ?? undefined,
    etablissement: isEtablissement(etablissement) ? etablissement : null,
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

  // ⭐ MODIFIÉ : retourne { email, etablissementId }
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<ForgotPasswordResponse>;

  // ⭐ NOUVEAU : vérifie l'OTP de reset et retourne un resetToken
  verifyResetOtp: (payload: {
    email: string;
    otp: string;
    etablissementId: string;
  }) => Promise<VerifyResetOtpResponse>;

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
  // NETTOYAGE ONE-SHOT DU LOCALSTORAGE
  // ─────────────────────────────────────────
  useEffect(() => {
    const jsonKeys = [
      CACHE_KEYS.USER,
      CACHE_KEYS.ETABLISSEMENT,
      CACHE_KEYS.SCOPE,
    ];
    for (const k of jsonKeys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      try {
        JSON.parse(raw);
      } catch {
        console.warn(
          `⚠️ [AuthContext] Entrée localStorage corrompue supprimée: ${k}`,
          raw
        );
        localStorage.removeItem(k);
      }
    }
  }, []);

  // ─────────────────────────────────────────
  // HELPER : applique un user + persiste
  // ─────────────────────────────────────────
  const applyUser = useCallback((u: User) => {
    setUser(u);
    setScope(inferScope(u));
    setEtablissement(
      isEtablissement(u.etablissement) ? u.etablissement : null
    );
    setIsAuthenticated(true);

    cache.setUser(u);
    if (u.scope) cache.setScope(u.scope);
    if (isEtablissement(u.etablissement)) cache.setEtablissement(u.etablissement);
  }, []);

  // ─────────────────────────────────────────
  // HELPER : persiste les tokens
  // ─────────────────────────────────────────
  const applyTokens = useCallback(
    (tokens: { accessToken: string; refreshToken: string }) => {
      cache.setAccessToken(tokens.accessToken);
      cache.setRefreshToken(tokens.refreshToken);
    },
    []
  );

  // ─────────────────────────────────────────
  // RESTAURATION DE SESSION AU DÉMARRAGE
  // ─────────────────────────────────────────
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const restoreSession = async () => {
      const hasToken = cache.hasToken();

      console.log('🔵 [AuthContext] restoreSession — hasToken:', hasToken);

      if (!hasToken) {
        cache.clearAll();
        setUser(null);
        setIsAuthenticated(false);
        setScope(null);
        setEtablissement(null);
        setIsInitializing(false);
        return;
      }

      const cached = cache.getUser();
      if (isValidUser(cached)) {
        setUser(cached);
        setScope(inferScope(cached));
        setEtablissement(extractEtablissement(cached));
        setIsAuthenticated(true);
      }

      try {
        const res = await authApi.me();

        if (isApiSuccess(res) && res.data) {
          const payload: any = res.data;
          const freshUser: User = payload.user
            ? enrichUser(payload.user, payload.etablissement)
            : enrichUser(payload, payload.etablissement);

          setUser(freshUser);
          setScope(inferScope(freshUser));
          setEtablissement(
            isEtablissement(freshUser.etablissement)
              ? freshUser.etablissement
              : null
          );
          setIsAuthenticated(true);

          cache.setUser(freshUser);
          if (freshUser.scope) cache.setScope(freshUser.scope);
          if (isEtablissement(freshUser.etablissement))
            cache.setEtablissement(freshUser.etablissement);
        }
      } catch (err: any) {
        const status = err?.response?.status;

        if (status === 401) {
          try {
            const refreshToken = cache.getRefreshToken();
            if (!refreshToken) throw new Error('No refresh token');

            const refreshRes = await authApi.refresh({ refreshToken });

            if (isApiSuccess(refreshRes) && refreshRes.data) {
              applyTokens(refreshRes.data.tokens);

              const meRes = await authApi.me();
              if (isApiSuccess(meRes) && meRes.data) {
                const payload: any = meRes.data;
                const freshUser: User = payload.user
                  ? enrichUser(payload.user, payload.etablissement)
                  : enrichUser(payload, payload.etablissement);

                applyUser(freshUser);
              }
            }
          } catch {
            cache.clearAll();
            setUser(null);
            setIsAuthenticated(false);
            setScope(null);
            setEtablissement(null);
          }
        }
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

        if (!res.data || !res.data.user || !res.data.tokens) {
          throw new Error(res.message ?? 'Échec de connexion');
        }

        const {
          user: rawUser,
          tokens,
          etablissement: etab,
          scope: s,
        } = res.data;

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

        if (!res.data || !res.data.user || !res.data.tokens) {
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

        if (!res.data || !res.data.user || !res.data.tokens) {
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
        if (isApiError(res)) {
          throw new Error(res.message ?? "Échec de l'envoi OTP");
        }
      }, "Erreur lors de l'envoi de l'OTP"),
    [run]
  );

  // ⭐ MODIFIÉ : retourne { email, etablissementId }
  const forgotPassword = useCallback(
    (payload: ForgotPasswordPayload) =>
      run(async () => {
        const res = await authApi.forgotPassword(payload);
        if (isApiError(res)) {
          throw new Error(res.message ?? 'Échec de la demande');
        }
        return (res.data ?? {
          email: payload.email,
          etablissementId: null,
        }) as ForgotPasswordResponse;
      }, 'Erreur lors de la demande'),
    [run]
  );

  // ⭐ NOUVEAU : vérifie l'OTP de reset
  const verifyResetOtp = useCallback(
    (payload: { email: string; otp: string; etablissementId: string }) =>
      run(async () => {
        const res = await authApi.verifyResetOtp(payload);
        if (isApiError(res)) {
          throw new Error(res.message ?? 'Code invalide ou expiré');
        }
        if (!res.data?.resetToken) {
          throw new Error('Réponse invalide du serveur (resetToken manquant)');
        }
        return res.data as VerifyResetOtpResponse;
      }, 'Code OTP invalide ou expiré'),
    [run]
  );

  const resetPassword = useCallback(
    (payload: ResetPasswordPayload) =>
      run(async () => {
        const res = await authApi.resetPassword(payload);
        if (isApiError(res)) {
          throw new Error(res.message ?? 'Échec de la réinitialisation');
        }
      }, 'Erreur de réinitialisation'),
    [run]
  );

  const changePassword = useCallback(
    (payload: ChangePasswordPayload) =>
      run(async () => {
        const res = await authApi.changePassword(payload);
        if (isApiError(res)) {
          throw new Error(res.message ?? 'Échec du changement');
        }
      }, 'Erreur lors du changement'),
    [run]
  );

  const updateProfile = useCallback(
    (payload: UpdateProfilePayload) =>
      run(async () => {
        const res = await authApi.updateProfile(payload);
        if (!res.data) {
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
      if (isApiSuccess(res) && res.data) {
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
      verifyResetOtp,   // ⭐ AJOUT
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
      verifyResetOtp,   // ⭐ AJOUT
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