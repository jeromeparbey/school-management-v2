// frontend2/src/hooks/useReduction.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { reductionApi } from '../api/reduction.api';
import { useToast } from '../context/ToastContext';
import type {
  ListReductionsParams,
  CreateReductionPayload,
  UpdateReductionPayload,
  Reduction,
  ListReductionsResult,
} from '../types/reduction.types';

// ═══════════════════════════════════════════════════════════
// 🔑 QUERY KEYS
// ═══════════════════════════════════════════════════════════

export const reductionKeys = {
  all: ['reductions'] as const,
  lists: () => [...reductionKeys.all, 'list'] as const,
  list: (params?: ListReductionsParams) =>
    [...reductionKeys.lists(), params ?? {}] as const,
  details: () => [...reductionKeys.all, 'detail'] as const,
  detail: (id: string) => [...reductionKeys.details(), id] as const,
  byEleve: (eleveId: string) =>
    [...reductionKeys.all, 'by-eleve', eleveId] as const,
  stats: (params?: any) =>
    [...reductionKeys.all, 'stats', params ?? {}] as const,
};

// ═══════════════════════════════════════════════════════════
// 🧰 HELPERS
// ═══════════════════════════════════════════════════════════

function normalizeListResponse(res: any): ListReductionsResult {
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      data: res.data.data,
      pagination: res.data.pagination ?? {
        page: 1,
        limit: 20,
        total: res.data.data.length,
        totalPages: 1,
      },
    };
  }
  if (Array.isArray(res?.data)) {
    return {
      data: res.data,
      pagination: res.pagination ?? {
        page: 1,
        limit: 20,
        total: res.data.length,
        totalPages: 1,
      },
    };
  }
  return {
    data: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const anyErr = err as any;
  return anyErr?.response?.data?.message ?? anyErr?.message ?? fallback;
}

// ═══════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════

export function useReductions(params?: ListReductionsParams) {
  return useQuery<ListReductionsResult>({
    queryKey: reductionKeys.list(params),
    queryFn: async () => {
      const res = await reductionApi.list(params);
      return normalizeListResponse(res);
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useReduction(id: string | undefined) {
  return useQuery({
    queryKey: reductionKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await reductionApi.getById(id!);
      return res;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useReductionsByEleve(eleveId: string | undefined) {
  return useQuery({
    queryKey: reductionKeys.byEleve(eleveId ?? ''),
    queryFn: async () => {
      const res = await reductionApi.listByEleve(eleveId!);
      return res;
    },
    enabled: !!eleveId,
    staleTime: 30_000,
  });
}

export function useReductionStats(params?: {
  dateDebut?: string;
  dateFin?: string;
}) {
  return useQuery({
    queryKey: reductionKeys.stats(params),
    queryFn: async () => {
      const res = await reductionApi.stats(params);
      return res;
    },
    staleTime: 60_000,
  });
}

// ═══════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════

export function useCreateReduction() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: CreateReductionPayload) => {
      return reductionApi.create(payload);
    },
    onSuccess: (res) => {
      const created = (res as any)?.data;
      qc.invalidateQueries({ queryKey: reductionKeys.lists() });
      if (created?.eleveId) {
        qc.invalidateQueries({
          queryKey: reductionKeys.byEleve(created.eleveId),
        });
      }
      toast.success(`Réduction créée : ${created?.motif ?? '—'}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Échec de la création'));
    },
  });
}

export function useUpdateReduction() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateReductionPayload;
    }) => {
      return reductionApi.update(id, payload);
    },
    onSuccess: (_res, variables) => {
      qc.invalidateQueries({ queryKey: reductionKeys.lists() });
      qc.invalidateQueries({
        queryKey: reductionKeys.detail(variables.id),
      });
      toast.success('Réduction mise à jour');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Échec de la mise à jour'));
    },
  });
}

export function useHardDeleteReduction() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return reductionApi.hardDelete(id);
    },
    onSuccess: (_res, id) => {
      qc.removeQueries({ queryKey: reductionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: reductionKeys.lists() });
      toast.success('Réduction supprimée définitivement');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Échec de la suppression'));
    },
  });
}