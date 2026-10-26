// frontend2/src/hooks/useInscriptions.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { inscriptionApi } from '../api/inscription.api';
import { useToast } from '../context/ToastContext';
import type {
  ListInscriptionsParams,
  CreateInscriptionPayload,
  UpdateInscriptionPayload,
  InscriptionsListResult,
  Inscription,
} from '../types/inscription.types';

// ──────────────────────────────────────────
// QUERY KEYS
// ──────────────────────────────────────────

export const inscriptionKeys = {
  all: ['inscriptions'] as const,
  lists: () => [...inscriptionKeys.all, 'list'] as const,
  list: (params?: ListInscriptionsParams) =>
    [...inscriptionKeys.lists(), params ?? {}] as const,
  details: () => [...inscriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...inscriptionKeys.details(), id] as const,
};

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

function normalize(res: any): InscriptionsListResult {
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      inscriptions: res.data.data,
      pagination:
        res.data.pagination ??
        { page: 1, limit: 50, total: res.data.data.length, totalPages: 1 },
    };
  }
  if (Array.isArray(res?.data)) {
    return {
      inscriptions: res.data,
      pagination:
        res.pagination ??
        { page: 1, limit: 50, total: res.data.length, totalPages: 1 },
    };
  }
  return {
    inscriptions: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const e = err as any;
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

function unwrapInscription(res: any): Inscription | null {
  if (res?.data?.data) return res.data.data as Inscription;
  if (res?.data && typeof res.data === 'object' && 'id' in res.data) {
    return res.data as Inscription;
  }
  return null;
}

// ──────────────────────────────────────────
// HOOKS DE LECTURE
// ──────────────────────────────────────────

export function useInscriptions(params?: ListInscriptionsParams) {
  return useQuery<InscriptionsListResult>({
    queryKey: inscriptionKeys.list(params),
    queryFn: async () => normalize(await inscriptionApi.list(params)),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useInscription(id: string | undefined) {
  return useQuery<Inscription>({
    queryKey: inscriptionKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await inscriptionApi.getById(id!);
      const inscription = unwrapInscription(res);
      if (!inscription) throw new Error('Inscription introuvable');
      return inscription;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ──────────────────────────────────────────
// HOOKS DE MUTATION
// ──────────────────────────────────────────

export function useCreateInscription() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: CreateInscriptionPayload) =>
      inscriptionApi.create(payload),
    onSuccess: (res) => {
      const inscription = unwrapInscription(res);
      qc.invalidateQueries({ queryKey: inscriptionKeys.lists() });
      if (inscription) {
        qc.setQueryData(inscriptionKeys.detail(inscription.id), inscription);
        toast.success(
          `Inscription créée : ${inscription.eleve?.prenom ?? ''} ${
            inscription.eleve?.nom ?? ''
          } → ${inscription.classe?.nom ?? ''}`.trim()
        );
      } else {
        toast.success('Inscription créée');
      }
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "Échec de l'inscription")),
  });
}

export function useUpdateInscription() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateInscriptionPayload;
    }) => inscriptionApi.update(id, payload),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: inscriptionKeys.lists() });
      qc.invalidateQueries({ queryKey: inscriptionKeys.detail(v.id) });
      toast.success('Inscription mise à jour');
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, 'Échec de la mise à jour')),
  });
}

export function useSoftDeleteInscription() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => inscriptionApi.softDelete(id),
    onSuccess: (_r, id) => {
      qc.invalidateQueries({ queryKey: inscriptionKeys.lists() });
      qc.invalidateQueries({ queryKey: inscriptionKeys.detail(id) });
      toast.success('Inscription désactivée');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}

export function useHardDeleteInscription() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => inscriptionApi.hardDelete(id),
    onSuccess: (_r, id) => {
      qc.removeQueries({ queryKey: inscriptionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: inscriptionKeys.lists() });
      toast.success('Inscription supprimée définitivement');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}