// frontend2/src/context/ToastContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ToastContainer, type Toast, type ToastType } from '../components/ui/Toast';

// ============================================
// TYPES DU CONTEXTE
// ============================================
interface ToastContextValue {
  /** Afficher un toast générique */
  show: (toast: Omit<Toast, 'id'>) => string;

  /** Succès */
  success: (title: string, message?: string, options?: Partial<Toast>) => string;

  /** Erreur */
  error: (title: string, message?: string, options?: Partial<Toast>) => string;

  /** Warning */
  warning: (title: string, message?: string, options?: Partial<Toast>) => string;

  /** Info */
  info: (title: string, message?: string, options?: Partial<Toast>) => string;

  /** 🎯 Extraire et afficher automatiquement une erreur API */
  fromApiError: (
    err: unknown,
    fallbackTitle?: string,
    fallbackMessage?: string
  ) => string;

  /** 🎯 Extraire et afficher automatiquement une réponse API */
  fromApiResponse: <T = any>(
    res: { success?: boolean; message?: string; data?: T },
    successTitle?: string,
    successMessage?: string
  ) => void;

  /** Fermer un toast par ID */
  dismiss: (id: string) => void;

  /** Fermer tous les toasts */
  dismissAll: () => void;
}

// ============================================
// CONTEXTE
// ============================================
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ============================================
// HELPERS : Extraction d'erreur API
// ============================================
interface ExtractedError {
  title: string;
  message: string;
  details?: string;
}

/**
 * Extrait les informations d'une erreur Axios/API et les formate
 * pour un toast lisible.
 */
export function extractApiError(err: unknown): ExtractedError {
  // Valeurs par défaut
  const fallback: ExtractedError = {
    title: 'Erreur',
    message: 'Une erreur inattendue est survenue.',
  };

  if (!err || typeof err !== 'object') return fallback;

  const e = err as any;

  // Réponse API structurée
  const responseData = e.response?.data;
  const status = e.response?.status;

  // Cas 1 : Erreur de validation Zod (backend renvoie errors[])
  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    const details = responseData.errors
      .map((er: any) => `• ${er.champ ?? er.path?.join('.') ?? 'champ'}: ${er.message}`)
      .join('\n');

    return {
      title: responseData?.message ?? 'Données invalides',
      message: details,
      details,
    };
  }

  // Cas 2 : Message API direct
  if (responseData?.message) {
    return {
      title: status ? `Erreur ${status}` : 'Erreur',
      message: responseData.message,
    };
  }

  // Cas 3 : 429 Rate limit
  if (status === 429) {
    return {
      title: 'Trop de tentatives',
      message:
        responseData?.message ??
        'Vous avez fait trop de requêtes. Réessayez dans quelques minutes.',
    };
  }

  // Cas 4 : 401 Non autorisé
  if (status === 401) {
    return {
      title: 'Session expirée',
      message: 'Veuillez vous reconnecter pour continuer.',
    };
  }

  // Cas 5 : 403 Accès refusé
  if (status === 403) {
    return {
      title: 'Accès refusé',
      message: "Vous n'avez pas les permissions nécessaires.",
    };
  }

  // Cas 6 : 404 Introuvable
  if (status === 404) {
    return {
      title: 'Ressource introuvable',
      message: responseData?.message ?? "La ressource demandée n'existe pas.",
    };
  }

  // Cas 7 : 500+ Erreur serveur
  if (status && status >= 500) {
    return {
      title: 'Erreur serveur',
      message:
        responseData?.message ??
        'Le serveur a rencontré un problème. Réessayez plus tard.',
    };
  }

  // Cas 8 : Erreur réseau (pas de réponse)
  if (e.message === 'Network Error' || !e.response) {
    return {
      title: 'Erreur réseau',
      message:
        'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
    };
  }

  // Cas 9 : Erreur générique
  return {
    title: 'Erreur',
    message: e.message ?? fallback.message,
  };
}

// ============================================
// PROVIDER
// ============================================
interface ToastProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ─────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Ajoute un toast en respectant la limite maxToasts.
   * Retourne l'ID du toast.
   */
  const show = useCallback(
    (toast: Omit<Toast, 'id'>): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newToast: Toast = { ...toast, id };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        return updated.slice(0, maxToasts);
      });

      return id;
    },
    [maxToasts]
  );

  // ─────────────────────────────────────────
  // RACCOURCIS
  // ─────────────────────────────────────────

  const success = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) =>
      show({
        type: 'success',
        title,
        message,
        duration: 4000,
        ...options,
      }),
    [show]
  );

  const error = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) =>
      show({
        type: 'error',
        title,
        message,
        duration: 7000, // les erreurs restent plus longtemps
        ...options,
      }),
    [show]
  );

  const warning = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) =>
      show({
        type: 'warning',
        title,
        message,
        duration: 5000,
        ...options,
      }),
    [show]
  );

  const info = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) =>
      show({
        type: 'info',
        title,
        message,
        duration: 4000,
        ...options,
      }),
    [show]
  );

  // ─────────────────────────────────────────
  // 🎯 EXTRACTION AUTOMATIQUE
  // ─────────────────────────────────────────

  const fromApiError = useCallback(
    (err: unknown, fallbackTitle?: string, fallbackMessage?: string): string => {
      const extracted = extractApiError(err);

      console.error('🔴 [Toast] Erreur API:', err);

      return error(
        fallbackTitle ?? extracted.title,
        fallbackMessage ?? extracted.message,
        {
          // Afficher les détails (validation Zod) dans le toast
          duration: 10000,
        }
      );
    },
    [error]
  );

  const fromApiResponse = useCallback(
    <T,>(
      res: { success?: boolean; message?: string; data?: T },
      successTitle = 'Succès',
      successMessage?: string
    ) => {
      if (res.success === false) {
        error(
          res.message ?? 'Opération échouée',
          undefined,
          { duration: 7000 }
        );
        return;
      }

      success(
        successTitle,
        successMessage ?? res.message ?? 'Opération réussie.',
        { duration: 4000 }
      );
    },
    [success, error]
  );

  // ─────────────────────────────────────────
  // VALEUR MÉMOÏSÉE
  // ─────────────────────────────────────────
  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success,
      error,
      warning,
      info,
      fromApiError,
      fromApiResponse,
      dismiss,
      dismissAll,
    }),
    [
      show,
      success,
      error,
      warning,
      info,
      fromApiError,
      fromApiResponse,
      dismiss,
      dismissAll,
    ]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts}
        onClose={dismiss}
        position={position}
      />
    </ToastContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error(
      'useToast doit être utilisé à l\'intérieur d\'un <ToastProvider>'
    );
  }
  return ctx;
}