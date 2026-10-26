// hooks/useNiveaux.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { niveauApi } from '../api/niveau.api';
import { useToast } from '../context/ToastContext';
import type {
  ListNiveauxParams,
  CreateNiveauPayload,
  UpdateNiveauPayload,
  Niveau,
} from '../types/niveau.types';

// ═══════════════════════════════════════════════════════════
// 🔑 QUERY KEYS
// ═══════════════════════════════════════════════════════════

export const niveauKeys = {
  all: ['niveaux'] as const,
  lists: () => [...niveauKeys.all, 'list'] as const,
  list: (params?: ListNiveauxParams) =>
    [...niveauKeys.lists(), params ?? {}] as const,
  details: () => [...niveauKeys.all, 'detail'] as const,
  detail: (id: string) => [...niveauKeys.details(), id] as const,
};

// ═══════════════════════════════════════════════════════════
// 🧰 HELPERS — Normalisation de la réponse
// ═══════════════════════════════════════════════════════════

/**
 * Extrait le tableau de niveaux + pagination depuis une réponse API
 * qui peut être :
 *  - { success, data: Niveau[], pagination }               (backend actuel)
 *  - { success, data: { data: Niveau[], pagination } }     (contrat ApiResponse)
 *
 * → Retourne TOUJOURS { niveaux: Niveau[], pagination }
 */
function normalizeListResponse(res: any): {
  niveaux: Niveau[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} {
  // Cas 1 : data = { data: Niveau[], pagination }  (double wrapping)
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      niveaux: res.data.data,
      pagination: res.data.pagination ?? {
        page: 1,
        limit: 20,
        total: res.data.data.length,
        totalPages: 1,
      },
    };
  }

  // Cas 2 : data = Niveau[] direct  (simple wrapping)
  if (Array.isArray(res?.data)) {
    return {
      niveaux: res.data,
      pagination: res.pagination ?? {
        page: 1,
        limit: 20,
        total: res.data.length,
        totalPages: 1,
      },
    };
  }

  // Fallback
  return {
    niveaux: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
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
  if (anyErr?.response?.data) {
    console.error('   Data backend:', anyErr.response.data);
  }
  if (status === 401) {
    console.error('   💡 401 : Token manquant/expiré → reconnecte-toi');
  } else if (status === 403) {
    console.error('   💡 403 : Rôle non autorisé');
  } else if (status === 404) {
    console.error('   💡 404 : Niveau/route introuvable');
  } else if (status === 409) {
    console.error('   💡 409 : Code déjà utilisé ou niveau référencé');
  } else if (status === 500) {
    console.error('   💡 500 : Erreur backend → voir terminal serveur');
  }
};

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const anyErr = err as any;
  return anyErr?.response?.data?.message ?? anyErr?.message ?? fallback;
}

// ═══════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════

export function useNiveaux(params?: ListNiveauxParams) {
  return useQuery({
    queryKey: niveauKeys.list(params),
    queryFn: async () => {
      logStart('useNiveaux', { params });
      try {
        const res = await niveauApi.list(params);

        // ✅ Normalisation : retourne TOUJOURS { niveaux, pagination }
        const normalized = normalizeListResponse(res);

        logSuccess('useNiveaux', {
          total: normalized.pagination.total,
          items: normalized.niveaux.length,
          sample: normalized.niveaux[0]?.nom ?? '—',
        });

        return normalized;
      } catch (err) {
        logError('useNiveaux', err, 'Échec du chargement');
        throw err;
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useNiveau(id: string | undefined) {
  return useQuery({
    queryKey: niveauKeys.detail(id ?? ''),
    queryFn: async () => {
      logStart('useNiveau', { id });
      try {
        const res = await niveauApi.getById(id!);

        // ✅ Le détail a TOUJOURS la forme { success, data: Niveau }
        const niveau = (res as any)?.data ?? null;

        logSuccess('useNiveau', {
          nom: niveau?.nom ?? '—',
          code: niveau?.code ?? '—',
        });

        return res;
      } catch (err) {
        logError('useNiveau', err, 'Échec chargement niveau');
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

export function useCreateNiveau() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: CreateNiveauPayload) => {
      logStart('useCreateNiveau', {
        nom: payload.nom,
        code: payload.code,
        ordre: payload.ordre,
      });
      return niveauApi.create(payload);
    },
    onSuccess: (res) => {
      const created = (res as any)?.data;
      logSuccess('useCreateNiveau', {
        id: created?.id,
        code: created?.code,
      });
      qc.invalidateQueries({ queryKey: niveauKeys.lists() });
      toast.success(`Niveau créé : ${created?.nom ?? '—'}`);
    },
    onError: (err) => {
      logError('useCreateNiveau', err, 'Échec de la création');
      toast.error(getErrorMessage(err, 'Échec de la création'));
    },
  });
}

export function useUpdateNiveau() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateNiveauPayload;
    }) => {
      logStart('useUpdateNiveau', {
        id,
        champsModifies: Object.keys(payload),
      });
      return niveauApi.update(id, payload);
    },
    onSuccess: (_res, variables) => {
      logSuccess('useUpdateNiveau', { id: variables.id });
      qc.invalidateQueries({ queryKey: niveauKeys.lists() });
      qc.invalidateQueries({ queryKey: niveauKeys.detail(variables.id) });
      toast.success('Niveau mis à jour');
    },
    onError: (err) => {
      logError('useUpdateNiveau', err, 'Échec de la mise à jour');
      toast.error(getErrorMessage(err, 'Échec de la mise à jour'));
    },
  });
}

export function useHardDeleteNiveau() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      logStart('useHardDeleteNiveau', { id });
      return niveauApi.hardDelete(id);
    },
    onSuccess: (_res, id) => {
      logSuccess('useHardDeleteNiveau', { id });
      qc.removeQueries({ queryKey: niveauKeys.detail(id) });
      qc.invalidateQueries({ queryKey: niveauKeys.lists() });
      toast.success('Niveau supprimé définitivement');
    },
    onError: (err) => {
      logError('useHardDeleteNiveau', err, 'Échec de la suppression');
      toast.error(getErrorMessage(err, 'Échec de la suppression'));
    },
  });
}