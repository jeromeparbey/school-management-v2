// frontend2/src/hooks/usePeriodes.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { periodeApi } from '../api/periode.api';
import { useToast } from '../context/ToastContext';
import type {
  ListPeriodesParams,
  CreatePeriodePayload,
  UpdatePeriodePayload,
  PeriodesListResult,
} from '../types/periode.types';

// ═══════════════════════════════════════════════════════════
// 🔑 QUERY KEYS
// ═══════════════════════════════════════════════════════════

export const periodeKeys = {
  all: ['periodes'] as const,
  lists: () => [...periodeKeys.all, 'list'] as const,
  list: (params?: ListPeriodesParams) =>
    [...periodeKeys.lists(), params ?? {}] as const,
  details: () => [...periodeKeys.all, 'detail'] as const,
  detail: (id: string) => [...periodeKeys.details(), id] as const,
};

// ═══════════════════════════════════════════════════════════
// 🧰 HELPERS — Normalisation de la réponse
// ═══════════════════════════════════════════════════════════

/**
 * Normalise la réponse API (gère les deux formats possibles) :
 * - { success, data: { data: Periode[], pagination } }
 * - { success, data: Periode[], pagination }
 */
function normalizeListResponse(res: any): PeriodesListResult {
  // Cas 1 : double wrapping
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      periodes: res.data.data,
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
      periodes: res.data,
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
    periodes: [],
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
    console.error('   💡 404 : Période/route introuvable');
  } else if (status === 409) {
    console.error('   💡 409 : Ordre déjà utilisé ou dépendances');
  } else if (status === 500) {
    console.error('   💡 500 : Erreur backend');
  }
};

// ═══════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════

/**
 * Liste paginée des périodes avec filtres.
 */
export function usePeriodes(params?: ListPeriodesParams) {
  return useQuery<PeriodesListResult>({
    queryKey: periodeKeys.list(params),
    queryFn: async () => {
      logStart('usePeriodes', { params });
      try {
        const res = await periodeApi.list(params);
        const normalized = normalizeListResponse(res);

        logSuccess('usePeriodes', {
          total: normalized.pagination.total,
          items: normalized.periodes.length,
          sample: normalized.periodes[0]?.nom ?? '—',
        });

        return normalized;
      } catch (err) {
        logError('usePeriodes', err, 'Échec du chargement');
        throw err;
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Détail d'une période.
 */
export function usePeriode(id: string | undefined) {
  return useQuery({
    queryKey: periodeKeys.detail(id ?? ''),
    queryFn: async () => {
      logStart('usePeriode', { id });
      try {
        const res = await periodeApi.getById(id!);
        logSuccess('usePeriode', {
          nom: (res as any)?.data?.nom,
          type: (res as any)?.data?.type,
        });
        return res;
      } catch (err) {
        logError('usePeriode', err, 'Échec chargement période');
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
 * Création d'une période.
 */
export function useCreatePeriode() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: CreatePeriodePayload) => {
      logStart('useCreatePeriode', {
        nom: payload.nom,
        type: payload.type,
        ordre: payload.ordre,
      });
      return periodeApi.create(payload);
    },
    onSuccess: (res) => {
      const created = (res as any)?.data;
      logSuccess('useCreatePeriode', {
        id: created?.id,
        nom: created?.nom,
      });
      qc.invalidateQueries({ queryKey: periodeKeys.lists() });
      toast.success(`Période créée : ${created?.nom ?? '—'}`);
    },
    onError: (err) => {
      logError('useCreatePeriode', err, 'Échec de la création');
      toast.error(getErrorMessage(err, 'Échec de la création'));
    },
  });
}

/**
 * Mise à jour d'une période.
 */
export function useUpdatePeriode() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePeriodePayload;
    }) => {
      logStart('useUpdatePeriode', {
        id,
        champsModifies: Object.keys(payload),
      });
      return periodeApi.update(id, payload);
    },
    onSuccess: (_res, variables) => {
      logSuccess('useUpdatePeriode', { id: variables.id });
      qc.invalidateQueries({ queryKey: periodeKeys.lists() });
      qc.invalidateQueries({
        queryKey: periodeKeys.detail(variables.id),
      });
      toast.success('Période mise à jour');
    },
    onError: (err) => {
      logError('useUpdatePeriode', err, 'Échec de la mise à jour');
      toast.error(getErrorMessage(err, 'Échec de la mise à jour'));
    },
  });
}

/**
 * Suppression définitive d'une période.
 */
export function useHardDeletePeriode() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      logStart('useHardDeletePeriode', { id });
      return periodeApi.hardDelete(id);
    },
    onSuccess: (_res, id) => {
      logSuccess('useHardDeletePeriode', { id });
      qc.removeQueries({ queryKey: periodeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: periodeKeys.lists() });
      toast.success('Période supprimée définitivement');
    },
    onError: (err) => {
      logError('useHardDeletePeriode', err, 'Échec de la suppression');
      toast.error(getErrorMessage(err, 'Échec de la suppression'));
    },
  });
}