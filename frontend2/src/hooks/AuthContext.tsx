// frontend2/src/context/AuthContext.tsx
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
import { authService } from '../services/auth.service';
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
} from '../types/auth.types';

// ============================================
// TYPES DU CONTEXTE
// ============================================
interface AuthContextValue {
  // État
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;      // action en cours (login, register…)
  isInitializing: boolean; // restauration initiale de session
  error: string | null;

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

// ============================================
// CONTEXTE
// ============================================
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================
// HELPERS
// ============================================
const extractErrorMessage = (e: unknown, fallback: string): string => {
  if (typeof e === 'object' && e !== null) {
    const err = e as { response?: { data?: { message?: string } }; message?: string };
    return err.response?.data?.message ?? err.message ?? fallback;
  }
  return fallback;
};

// ============================================
// PROVIDER
// ============================================
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => authService.getCachedUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    authService.isAuthenticated()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Empêche les doubles exécutions en React 18 StrictMode
  const didInit = useRef(false);

  // ------------------------------------------
  // RESTAURATION DE SESSION AU DÉMARRAGE
  // ------------------------------------------
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const restoreSession = async () => {
      const hasToken = authService.isAuthenticated();

      if (!hasToken) {
        authService.clearAll();
        setUser(null);
        setIsAuthenticated(false);
        setIsInitializing(false);
        return;
      }

      try {
        // Priorité : utiliser le cache puis vérifier en arrière-plan
        const cached = authService.getCachedUser();
        if (cached) setUser(cached);

        const fresh = await authService.fetchMe();
        setUser(fresh);
        setIsAuthenticated(true);
      } catch {
        // Token expiré / invalide → on tente un refresh
        try {
          await authService.refresh();
          const fresh = await authService.fetchMe();
          setUser(fresh);
          setIsAuthenticated(true);
        } catch {
          authService.clearAll();
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    void restoreSession();
  }, []);

  // ------------------------------------------
  // WRAPPER : exécute une action avec gestion d'erreur
  // ------------------------------------------
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

  // ------------------------------------------
  // ACTIONS
  // ------------------------------------------
  const login = useCallback(
    (payload: LoginPayload) =>
      run(async () => {
        const u = await authService.login(payload);
        setUser(u);
        setIsAuthenticated(true);
        return u;
      }, 'Erreur de connexion'),
    [run]
  );

  const register = useCallback(
    (payload: RegisterPayload) =>
      run(async () => {
        const u = await authService.register(payload);
        setUser(u);
        setIsAuthenticated(true);
        return u;
      }, "Erreur lors de l'inscription"),
    [run]
  );

  const verifyOtp = useCallback(
    (payload: VerifyOtpPayload) =>
      run(async () => {
        const u = await authService.verifyOtp(payload);
        setUser(u);
        setIsAuthenticated(true);
        return u;
      }, 'OTP invalide ou expiré'),
    [run]
  );

  const resendOtp = useCallback(
    (payload: ResendOtpPayload) =>
      run(() => authService.resendOtp(payload), "Erreur lors de l'envoi de l'OTP"),
    [run]
  );

  const forgotPassword = useCallback(
    (payload: ForgotPasswordPayload) =>
      run(() => authService.forgotPassword(payload), 'Erreur lors de la demande'),
    [run]
  );

  const resetPassword = useCallback(
    (payload: ResetPasswordPayload) =>
      run(() => authService.resetPassword(payload), 'Erreur de réinitialisation'),
    [run]
  );

  const changePassword = useCallback(
    (payload: ChangePasswordPayload) =>
      run(() => authService.changePassword(payload), 'Erreur lors du changement'),
    [run]
  );

  const updateProfile = useCallback(
    (payload: UpdateProfilePayload) =>
      run(async () => {
        const u = await authService.updateProfile(payload);
        setUser(u);
        return u;
      }, 'Erreur de mise à jour du profil'),
    [run]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await authService.fetchMe();
      setUser(u);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // ------------------------------------------
  // VALEUR MÉMOÏSÉE
  // ------------------------------------------
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      isInitializing,
      error,
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
    throw new Error('useAuth doit être utilisé à l’intérieur d’un <AuthProvider>');
  }
  return ctx;
}