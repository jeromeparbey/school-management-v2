// frontend2/src/hooks/useEnseignants.ts

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { enseignantApi } from '../api/enseignant.api';
import { useToast } from '../context/ToastContext';
import type {
  ListEnseignantsParams, CreateEnseignantPayload, UpdateEnseignantPayload, EnseignantsListResult,
} from '../types/enseignant.types';

export const enseignantKeys = {
  all: ['enseignants'] as const,
  lists: () => [...enseignantKeys.all, 'list'] as const,
  list: (params?: ListEnseignantsParams) => [...enseignantKeys.lists(), params ?? {}] as const,
  details: () => [...enseignantKeys.all, 'detail'] as const,
  detail: (id: string) => [...enseignantKeys.details(), id] as const,
};

function normalize(res: any): EnseignantsListResult {
  if (res?.data && Array.isArray(res.data.data)) {
    return { enseignants: res.data.data, pagination: res.data.pagination ?? { page: 1, limit: 20, total: res.data.data.length, totalPages: 1 } };
  }
  if (Array.isArray(res?.data)) {
    return { enseignants: res.data, pagination: res.pagination ?? { page: 1, limit: 20, total: res.data.length, totalPages: 1 } };
  }
  return { enseignants: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
}

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const e = err as any;
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

export function useEnseignants(params?: ListEnseignantsParams) {
  return useQuery<EnseignantsListResult>({
    queryKey: enseignantKeys.list(params),
    queryFn: async () => normalize(await enseignantApi.list(params)),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useEnseignant(id: string | undefined) {
  return useQuery({
    queryKey: enseignantKeys.detail(id ?? ''),
    queryFn: () => enseignantApi.getById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateEnseignant() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (payload: CreateEnseignantPayload) => enseignantApi.create(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: enseignantKeys.lists() });
      const enseignant = (res as any)?.data;
      if (enseignant?.motDePasseTemporaire) {
        toast.warning('⚠️ Compte créé avec mot de passe temporaire');
      } else {
        toast.success(`Enseignant créé : ${enseignant?.prenom} ${enseignant?.nom}`);
      }
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec de la création')),
  });
}

export function useUpdateEnseignant() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEnseignantPayload }) => enseignantApi.update(id, payload),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: enseignantKeys.lists() });
      qc.invalidateQueries({ queryKey: enseignantKeys.detail(v.id) });
      toast.success('Enseignant mis à jour');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec de la mise à jour')),
  });
}

export function useSoftDeleteEnseignant() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => enseignantApi.softDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enseignantKeys.lists() });
      toast.success('Enseignant archivé');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}

export function useHardDeleteEnseignant() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => enseignantApi.hardDelete(id),
    onSuccess: (_r, id) => {
      qc.removeQueries({ queryKey: enseignantKeys.detail(id) });
      qc.invalidateQueries({ queryKey: enseignantKeys.lists() });
      toast.success('Enseignant supprimé définitivement');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}