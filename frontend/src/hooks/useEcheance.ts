// frontend2/src/hooks/useEcheance.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { echeanceApi } from '../api/echeance.api';
import { useToast } from '../context/ToastContext';
import type {
  ListEcheancesParams,
  CreateEcheancePayload,
  UpdateEcheancePayload,
  EcheancesListResult,
} from '../types/echeance.types';

// ═══════════════════════════════════════════════════════════
// 🔑 QUERY KEYS
// ═══════════════════════════════════════════════════════════

export const echeanceKeys = {
  all: ['echeances'] as const,
  lists: () => [...echeanceKeys.all, 'list'] as const,
  list: (params?: ListEcheancesParams) =>
    [...echeanceKeys.lists(), params ?? {}] as const,
  byPlan: (planScolariteId: string) =>
    [...echeanceKeys.all, 'by-plan', planScolariteId] as const,
  details: () => [...echeanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...echeanceKeys.details(), id] as const,
};

// ═══════════════════════════════════════════════════════════
// 🧰 HELPERS — Normalisation de la réponse
// ═══════════════════════════════════════════════════════════

/**
 * Normalise la réponse API (gère les deux formats possibles) :
 * - { success, data: { data: Echeance[], pagination } }
 * - { success, data: Echeance[], pagination }
 */
function normalizeListResponse(res: any): EcheancesListResult {
  // Cas 1 : double wrapping
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      echeances: res.data.data,
      pagination: res.data.pagination ?? {
        page: 1,
        limit: 50,
        total: res.data.data.length,
        totalPages: 1,
      },
      summary: res.data.summary ?? res.summary,
    };
  }

  // Cas 2 : simple wrapping
  if (Array.isArray(res?.data)) {
    return {
      echeances: res.data,
      pagination: res.pagination ?? {
        page: 1,
        limit: 50,
        total: res.data.length,
        totalPages: 1,
      },
      summary: res.summary,
    };
  }

  // Fallback
  return {
    echeances: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const anyErr = err as any;
  return anyErr?.response?.data?.message ?? anyErr?.message ?? fallback;
}

// ═══════════════════════════════════════════════════════════
// 🔍 LOG HELPERS
// ═══════════════════════════════════════════════════════════

const logStart = (hook: string, detail?: any) => {
  const ts = new Date().toLocaleTimeString('fr-FR');
  console.log(
    `%c🎣 [${hook}] ${ts} → Début`,
    'color:#7c3aed;font-weight:bold'
  );
  if (detail !== undefined) console.log('   📦 Détails:', detail);
};

const logSuccess = (hook: string, detail?: any) => {
  const ts = new Date().toLocaleTimeString('fr-FR');
  console.log(
    `%c✅ [${hook}] ${ts} → Succès`,
    'color:#16a34a;font-weight:bold'
  );
  if (detail !== undefined) console.log('   📦 Résultat:', detail);
};

const logError = (hook: string, err: unknown, fallback: string) => {
  const ts = new Date().toLocaleTimeString('fr-FR');
  const anyErr = err as any;
  const status = anyErr?.response?.status;
  const message =
    anyErr?.response?.data?.message ?? anyErr?.message ?? fallback;

  console.error(
    `%c❌ [${hook}] ${ts} → Erreur`,
    'color:#dc2626;font-weight:bold'
  );
  console.error('   Status:', status ?? 'NETWORK ERROR');
  console.error('   Message:', message);

  if (status === 401) {
    console.error('   💡 401 : Token manquant/expiré');
  } else if (status === 403) {
    console.error('   💡 403 : Rôle non autorisé');
  } else if (status === 404) {
    console.error('   💡 404 : Échéance/route introuvable');
  } else if (status === 409) {
    console.error('   💡 409 : Ordre déjà utilisé ou paiements rattachés');
  } else if (status === 500) {
    console.error('   💡 500 : Erreur backend');
  }
};

// ═══════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════

/**
 * Liste paginée des échéances avec filtres.
 */
export function useEcheances(params?: ListEcheancesParams) {
  return useQuery<EcheancesListResult>({
    queryKey: echeanceKeys.list(params),
    queryFn: async () => {
      logStart('useEcheances', { params });
      try {
        const res = await echeanceApi.list(params);
        const normalized = normalizeListResponse(res);

        logSuccess('useEcheances', {
          total: normalized.pagination.total,
          items: normalized.echeances.length,
          sample: normalized.echeances[0]?.nom ?? '—',
        });

        return normalized;
      } catch (err) {
        logError('useEcheances', err, 'Échec du chargement');
        throw err;
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Échéances d'un plan de scolarité + statistiques.
 */
export function useEcheancesByPlan(planScolariteId: string | undefined) {
  return useQuery({
    queryKey: echeanceKeys.byPlan(planScolariteId ?? ''),
    queryFn: async () => {
      logStart('useEcheancesByPlan', { planScolariteId });
      try {
        const res = await echeanceApi.listByPlan(planScolariteId!);
        logSuccess('useEcheancesByPlan', {
          nombre: (res as any)?.data?.echeances?.length,
          pourcentageCouvert: (res as any)?.data?.stats?.pourcentageCouvert,
        });
        return res;
      } catch (err) {
        logError('useEcheancesByPlan', err, 'Échec chargement échéances');
        throw err;
      }
    },
    enabled: !!planScolariteId,
    staleTime: 30_000,
  });
}

/**
 * Détail d'une échéance.
 */
export function useEcheance(id: string | undefined) {
  return useQuery({
    queryKey: echeanceKeys.detail(id ?? ''),
    queryFn: async () => {
      logStart('useEcheance', { id });
      try {
        const res = await echeanceApi.getById(id!);
        logSuccess('useEcheance', {
          nom: (res as any)?.data?.nom,
          montant: (res as any)?.data?.montant,
        });
        return res;
      } catch (err) {
        logError('useEcheance', err, 'Échec chargement échéance');
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ═══════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Création d'une échéance.
 */
export function useCreateEcheance() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: CreateEcheancePayload) => {
      logStart('useCreateEcheance', {
        nom: payload.nom,
        montant: payload.montant,
        planScolariteId: payload.planScolariteId,
      });
      return echeanceApi.create(payload);
    },
    onSuccess: (res) => {
      const created = (res as any)?.data;
      logSuccess('useCreateEcheance', {
        id: created?.id,
        nom: created?.nom,
      });
      // Invalider la liste générale
      qc.invalidateQueries({ queryKey: echeanceKeys.lists() });
      // Invalider les échéances du plan concerné
      if (created?.planScolariteId) {
        qc.invalidateQueries({
          queryKey: echeanceKeys.byPlan(created.planScolariteId),
        });
      }
      toast.success(`Échéance créée : ${created?.nom ?? '—'}`);
    },
    onError: (err) => {
      logError('useCreateEcheance', err, 'Échec de la création');
      toast.error(getErrorMessage(err, 'Échec de la création'));
    },
  });
}

/**
 * Mise à jour d'une échéance.
 */
export function useUpdateEcheance() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEcheancePayload;
    }) => {
      logStart('useUpdateEcheance', {
        id,
        champsModifies: Object.keys(payload),
      });
      return echeanceApi.update(id, payload);
    },
    onSuccess: (res, variables) => {
      const updated = (res as any)?.data;
      logSuccess('useUpdateEcheance', { id: variables.id });
      qc.invalidateQueries({ queryKey: echeanceKeys.lists() });
      qc.invalidateQueries({
        queryKey: echeanceKeys.detail(variables.id),
      });
      if (updated?.planScolariteId) {
        qc.invalidateQueries({
          queryKey: echeanceKeys.byPlan(updated.planScolariteId),
        });
      }
      toast.success('Échéance mise à jour');
    },
    onError: (err) => {
      logError('useUpdateEcheance', err, 'Échec de la mise à jour');
      toast.error(getErrorMessage(err, 'Échec de la mise à jour'));
    },
  });
}

/**
 * Suppression définitive d'une échéance.
 */
export function useHardDeleteEcheance() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      logStart('useHardDeleteEcheance', { id });
      return echeanceApi.hardDelete(id);
    },
    onSuccess: (_res, id) => {
      logSuccess('useHardDeleteEcheance', { id });
      qc.removeQueries({ queryKey: echeanceKeys.detail(id) });
      qc.invalidateQueries({ queryKey: echeanceKeys.lists() });
      // Invalider tous les plans (car on ne connaît pas le planScolariteId ici)
      qc.invalidateQueries({ queryKey: echeanceKeys.all });
      toast.success('Échéance supprimée définitivement');
    },
    onError: (err) => {
      logError('useHardDeleteEcheance', err, 'Échec de la suppression');
      toast.error(getErrorMessage(err, 'Échec de la suppression'));
    },
  });
}