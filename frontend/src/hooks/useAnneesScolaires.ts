// frontend2/src/hooks/useAnneesScolaires.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { anneeScolaireApi } from '../api/anneeScolaire.api';
import { useToast } from '../context/ToastContext';
import type {
  ListAnneesScolairesParams,
  CreateAnneeScolairePayload,
  UpdateAnneeScolairePayload,
  AnneesScolairesListResult,
} from '../types/anneeScolaire.types';

// ═══════════════════════════════════════════════════════════
// 🔑 QUERY KEYS
// ═══════════════════════════════════════════════════════════

export const anneeScolaireKeys = {
  all: ['annees-scolaires'] as const,
  lists: () => [...anneeScolaireKeys.all, 'list'] as const,
  list: (params?: ListAnneesScolairesParams) =>
    [...anneeScolaireKeys.lists(), params ?? {}] as const,
  details: () => [...anneeScolaireKeys.all, 'detail'] as const,
  detail: (id: string) => [...anneeScolaireKeys.details(), id] as const,
  active: () => [...anneeScolaireKeys.all, 'active'] as const,
};

// ═══════════════════════════════════════════════════════════
// 🧰 HELPERS
// ═══════════════════════════════════════════════════════════

function normalizeListResponse(res: any): AnneesScolairesListResult {
  // Cas 1 : data = { data: AnneeScolaire[], pagination }
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      annees: res.data.data,
      pagination: res.data.pagination ?? {
        page: 1,
        limit: 20,
        total: res.data.data.length,
        totalPages: 1,
      },
    };
  }

  // Cas 2 : data = AnneeScolaire[] direct
  if (Array.isArray(res?.data)) {
    return {
      annees: res.data,
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
    annees: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
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
  if (anyErr?.response?.data) {
    console.error('   Data backend:', anyErr.response.data);
  }
  if (status === 401) {
    console.error('   💡 401 : Token manquant/expiré');
  } else if (status === 403) {
    console.error('   💡 403 : Rôle non autorisé');
  } else if (status === 404) {
    console.error('   💡 404 : Année/route introuvable');
  } else if (status === 409) {
    console.error('   💡 409 : Conflit (classes rattachées)');
  } else if (status === 500) {
    console.error('   💡 500 : Erreur backend');
  }
};

// ═══════════════════════════════════════════════════════════
// 📅 QUERIES
// ═══════════════════════════════════════════════════════════

export function useAnneesScolaires(params?: ListAnneesScolairesParams) {
  return useQuery<AnneesScolairesListResult>({
    queryKey: anneeScolaireKeys.list(params),
    queryFn: async () => {
      logStart('useAnneesScolaires', { params });
      try {
        const res = await anneeScolaireApi.list(params);
        const normalized = normalizeListResponse(res);

        logSuccess('useAnneesScolaires', {
          total: normalized.pagination.total,
          items: normalized.annees.length,
          sample: normalized.annees[0]?.nom ?? '—',
        });

        return normalized;
      } catch (err) {
        logError('useAnneesScolaires', err, 'Échec du chargement');
        throw err;
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

/**
 * ✅ NOUVEAU : Détail d'une année scolaire
 * Utilisé par AnneeScolaireDetailPage et AnneeScolaireEditerPage
 */
export function useAnneeScolaire(id: string | undefined) {
  return useQuery({
    queryKey: anneeScolaireKeys.detail(id ?? ''),
    queryFn: async () => {
      logStart('useAnneeScolaire', { id });
      try {
        const res = await anneeScolaireApi.getById(id!);
        logSuccess('useAnneeScolaire', {
          nom: (res as any)?.data?.nom,
          estActive: (res as any)?.data?.estActive,
        });
        return res;
      } catch (err) {
        logError('useAnneeScolaire', err, 'Échec chargement année');
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

/**
 * Année scolaire active (une seule à la fois)
 */
export function useAnneeScolaireActive() {
  return useQuery({
    queryKey: anneeScolaireKeys.active(),
    queryFn: async () => {
      logStart('useAnneeScolaireActive');
      try {
        const res = await anneeScolaireApi.getActive();
        logSuccess('useAnneeScolaireActive', {
          nom: (res as any)?.data?.nom ?? 'aucune',
        });
        return res;
      } catch (err) {
        logError('useAnneeScolaireActive', err, 'Échec chargement année active');
        throw err;
      }
    },
    staleTime: 60_000,
  });
}

// ═══════════════════════════════════════════════════════════
// 📝 MUTATIONS
// ═══════════════════════════════════════════════════════════

export function useCreateAnneeScolaire() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: CreateAnneeScolairePayload) => {
      logStart('useCreateAnneeScolaire', {
        nom: payload.nom,
        dateDebut: payload.dateDebut,
        dateFin: payload.dateFin,
        estActive: payload.estActive,
      });
      return anneeScolaireApi.create(payload);
    },
    onSuccess: (res) => {
      const created = (res as any)?.data;
      logSuccess('useCreateAnneeScolaire', {
        id: created?.id,
        nom: created?.nom,
      });
      qc.invalidateQueries({ queryKey: anneeScolaireKeys.lists() });
      qc.invalidateQueries({ queryKey: anneeScolaireKeys.active() });
      toast.success(`Année créée : ${created?.nom ?? '—'}`);
    },
    onError: (err) => {
      logError('useCreateAnneeScolaire', err, 'Échec de la création');
      toast.error(getErrorMessage(err, 'Échec de la création'));
    },
  });
}

export function useUpdateAnneeScolaire() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAnneeScolairePayload;
    }) => {
      logStart('useUpdateAnneeScolaire', {
        id,
        champsModifies: Object.keys(payload),
      });
      return anneeScolaireApi.update(id, payload);
    },
    onSuccess: (_res, variables) => {
      logSuccess('useUpdateAnneeScolaire', { id: variables.id });
      qc.invalidateQueries({ queryKey: anneeScolaireKeys.lists() });
      qc.invalidateQueries({
        queryKey: anneeScolaireKeys.detail(variables.id),
      });
      qc.invalidateQueries({ queryKey: anneeScolaireKeys.active() });
      toast.success('Année mise à jour');
    },
    onError: (err) => {
      logError('useUpdateAnneeScolaire', err, 'Échec de la mise à jour');
      toast.error(getErrorMessage(err, 'Échec de la mise à jour'));
    },
  });
}

export function useHardDeleteAnneeScolaire() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      logStart('useHardDeleteAnneeScolaire', { id });
      return anneeScolaireApi.hardDelete(id);
    },
    onSuccess: (_res, id) => {
      logSuccess('useHardDeleteAnneeScolaire', { id });
      qc.removeQueries({ queryKey: anneeScolaireKeys.detail(id) });
      qc.invalidateQueries({ queryKey: anneeScolaireKeys.lists() });
      qc.invalidateQueries({ queryKey: anneeScolaireKeys.active() });
      toast.success('Année supprimée définitivement');
    },
    onError: (err) => {
      logError('useHardDeleteAnneeScolaire', err, 'Échec de la suppression');
      toast.error(getErrorMessage(err, 'Échec de la suppression'));
    },
  });
}