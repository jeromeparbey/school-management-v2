// frontend2/src/hooks/usePlanScolarite.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { planScolariteApi } from '../api/planScolarite.api';
import { useToast } from '../context/ToastContext';
import type {
  ListPlansScolariteParams,
  CreatePlanScolaritePayload,
  UpdatePlanScolaritePayload,
  PlanScolarite,
  PlansScolariteListResult,
} from '../types/planScolarite.types';

// ═══════════════════════════════════════════════════════════
// 🔑 QUERY KEYS
// ═══════════════════════════════════════════════════════════

export const planScolariteKeys = {
  all: ['plans-scolarite'] as const,
  lists: () => [...planScolariteKeys.all, 'list'] as const,
  list: (params?: ListPlansScolariteParams) =>
    [...planScolariteKeys.lists(), params ?? {}] as const,
  details: () => [...planScolariteKeys.all, 'detail'] as const,
  detail: (id: string) => [...planScolariteKeys.details(), id] as const,
};

// ═══════════════════════════════════════════════════════════
// 🧰 HELPERS — Normalisation de la réponse
// ═══════════════════════════════════════════════════════════

/**
 * Normalise la réponse API (gère les deux formats possibles) :
 * - { success, data: { data: PlanScolarite[], pagination } }
 * - { success, data: PlanScolarite[], pagination }
 */
function normalizeListResponse(res: any): PlansScolariteListResult {
  // Cas 1 : double wrapping
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      plans: res.data.data,
      pagination: res.data.pagination ?? {
        page: 1,
        limit: 50,
        total: res.data.data.length,
        totalPages: 1,
      },
    };
  }

  // Cas 2 : simple wrapping
  if (Array.isArray(res?.data)) {
    return {
      plans: res.data,
      pagination: res.pagination ?? {
        page: 1,
        limit: 50,
        total: res.data.length,
        totalPages: 1,
      },
    };
  }

  // Fallback
  return {
    plans: [],
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
    console.error('   💡 404 : Plan/route introuvable');
  } else if (status === 409) {
    console.error('   💡 409 : Conflit (assignments rattachés)');
  } else if (status === 500) {
    console.error('   💡 500 : Erreur backend');
  }
};

// ═══════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════

/**
 * Liste paginée des plans de scolarité avec filtres.
 */
export function usePlansScolarite(params?: ListPlansScolariteParams) {
  return useQuery<PlansScolariteListResult>({
    queryKey: planScolariteKeys.list(params),
    queryFn: async () => {
      logStart('usePlansScolarite', { params });
      try {
        const res = await planScolariteApi.list(params);
        const normalized = normalizeListResponse(res);

        logSuccess('usePlansScolarite', {
          total: normalized.pagination.total,
          items: normalized.plans.length,
          sample: normalized.plans[0]?.nom ?? '—',
        });

        return normalized;
      } catch (err) {
        logError('usePlansScolarite', err, 'Échec du chargement');
        throw err;
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Détail d'un plan de scolarité (avec échéances).
 */
export function usePlanScolarite(id: string | undefined) {
  return useQuery({
    queryKey: planScolariteKeys.detail(id ?? ''),
    queryFn: async () => {
      logStart('usePlanScolarite', { id });
      try {
        const res = await planScolariteApi.getById(id!);
        logSuccess('usePlanScolarite', {
          nom: (res as any)?.data?.nom,
          montantTotal: (res as any)?.data?.montantTotal,
        });
        return res;
      } catch (err) {
        logError('usePlanScolarite', err, 'Échec chargement plan');
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
 * Création d'un plan de scolarité.
 */
export function useCreatePlanScolarite() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: CreatePlanScolaritePayload) => {
      logStart('useCreatePlanScolarite', {
        nom: payload.nom,
        montantTotal: payload.montantTotal,
        anneeScolaireId: payload.anneeScolaireId,
      });
      return planScolariteApi.create(payload);
    },
    onSuccess: (res) => {
      const created = (res as any)?.data;
      logSuccess('useCreatePlanScolarite', {
        id: created?.id,
        nom: created?.nom,
      });
      qc.invalidateQueries({ queryKey: planScolariteKeys.lists() });
      toast.success(`Plan créé : ${created?.nom ?? '—'}`);
    },
    onError: (err) => {
      logError('useCreatePlanScolarite', err, 'Échec de la création');
      toast.error(getErrorMessage(err, 'Échec de la création'));
    },
  });
}

/**
 * Mise à jour d'un plan de scolarité.
 */
export function useUpdatePlanScolarite() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePlanScolaritePayload;
    }) => {
      logStart('useUpdatePlanScolarite', {
        id,
        champsModifies: Object.keys(payload),
      });
      return planScolariteApi.update(id, payload);
    },
    onSuccess: (_res, variables) => {
      logSuccess('useUpdatePlanScolarite', { id: variables.id });
      qc.invalidateQueries({ queryKey: planScolariteKeys.lists() });
      qc.invalidateQueries({
        queryKey: planScolariteKeys.detail(variables.id),
      });
      toast.success('Plan mis à jour');
    },
    onError: (err) => {
      logError('useUpdatePlanScolarite', err, 'Échec de la mise à jour');
      toast.error(getErrorMessage(err, 'Échec de la mise à jour'));
    },
  });
}

/**
 * Suppression définitive d'un plan de scolarité.
 */
export function useHardDeletePlanScolarite() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      logStart('useHardDeletePlanScolarite', { id });
      return planScolariteApi.hardDelete(id);
    },
    onSuccess: (_res, id) => {
      logSuccess('useHardDeletePlanScolarite', { id });
      qc.removeQueries({ queryKey: planScolariteKeys.detail(id) });
      qc.invalidateQueries({ queryKey: planScolariteKeys.lists() });
      toast.success('Plan supprimé définitivement');
    },
    onError: (err) => {
      logError('useHardDeletePlanScolarite', err, 'Échec de la suppression');
      toast.error(getErrorMessage(err, 'Échec de la suppression'));
    },
  });
}