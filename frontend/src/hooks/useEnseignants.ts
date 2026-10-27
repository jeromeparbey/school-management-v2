// frontend2/src/hooks/useEnseignants.ts

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { enseignantApi } from '../api/enseignant.api';
import { useToast } from '../context/ToastContext';
import type {
  ListEnseignantsParams,
  CreateEnseignantPayload,
  UpdateEnseignantPayload,
  EnseignantsListResult,
  Enseignant,
} from '../types/enseignant.types';

// ──────────────────────────────────────────
// QUERY KEYS
// ──────────────────────────────────────────

export const enseignantKeys = {
  all: ['enseignants'] as const,
  lists: () => [...enseignantKeys.all, 'list'] as const,
  list: (params?: ListEnseignantsParams) => [...enseignantKeys.lists(), params ?? {}] as const,
  details: () => [...enseignantKeys.all, 'detail'] as const,
  detail: (id: string) => [...enseignantKeys.details(), id] as const,
};

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

function normalize(res: any): EnseignantsListResult {
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      enseignants: res.data.data,
      pagination:
        res.data.pagination ??
        { page: 1, limit: 20, total: res.data.data.length, totalPages: 1 },
    };
  }
  if (Array.isArray(res?.data)) {
    return {
      enseignants: res.data,
      pagination:
        res.pagination ??
        { page: 1, limit: 20, total: res.data.length, totalPages: 1 },
    };
  }
  return {
    enseignants: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const e = err as any;
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

/**
 * 🆕 Extrait l'enseignant renvoyé par l'API quel que soit le wrapping :
 *  - { success, data: Enseignant, timestamp }     → res.data
 *  - { success, data: { data: Enseignant } }      → res.data.data
 *  - Enseignant direct                            → res
 */
function unwrapEnseignant(res: any): Enseignant | null {
  if (res?.data?.data) return res.data.data as Enseignant;
  if (res?.data && typeof res.data === 'object' && 'id' in res.data) {
    return res.data as Enseignant;
  }
  if (res && typeof res === 'object' && 'id' in res) {
    return res as Enseignant;
  }
  return null;
}

// ──────────────────────────────────────────
// LECTURE
// ──────────────────────────────────────────

export function useEnseignants(params?: ListEnseignantsParams) {
  return useQuery<EnseignantsListResult>({
    queryKey: enseignantKeys.list(params),
    queryFn: async () => normalize(await enseignantApi.list(params)),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useEnseignant(id: string | undefined) {
  return useQuery<Enseignant>({
    // ✅ Type de retour : Enseignant (pas ApiResponse<Enseignant>)
    queryKey: enseignantKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await enseignantApi.getById(id!);
      const enseignant = unwrapEnseignant(res);
      if (!enseignant) {
        throw new Error('Enseignant introuvable dans la réponse');
      }
      return enseignant;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ──────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────

export function useCreateEnseignant() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: CreateEnseignantPayload) =>
      enseignantApi.create(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: enseignantKeys.lists() });

      const enseignant = unwrapEnseignant(res);

      if (enseignant?.motDePasseTemporaire) {
        toast.warning(
          '⚠️ Compte créé avec mot de passe temporaire',
          'Communiquez-le manuellement à l\'enseignant.'
        );
      } else if (enseignant) {
        qc.setQueryData(enseignantKeys.detail(enseignant.id), enseignant);
        toast.success(
          `Enseignant créé : ${enseignant.prenom} ${enseignant.nom}`
        );
      } else {
        toast.success('Enseignant créé');
      }
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, 'Échec de la création')),
  });
}

// ──────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────

export function useUpdateEnseignant() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEnseignantPayload;
    }) => enseignantApi.update(id, payload),
    onSuccess: (res, v) => {
      qc.invalidateQueries({ queryKey: enseignantKeys.lists() });
      qc.invalidateQueries({ queryKey: enseignantKeys.detail(v.id) });

      const enseignant = unwrapEnseignant(res);
      if (enseignant) {
        qc.setQueryData(enseignantKeys.detail(v.id), enseignant);
      }

      toast.success('Enseignant mis à jour');
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, 'Échec de la mise à jour')),
  });
}

// ──────────────────────────────────────────
// SOFT DELETE
// ──────────────────────────────────────────

export function useSoftDeleteEnseignant() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => enseignantApi.softDelete(id),
    onSuccess: (_r, id) => {
      qc.invalidateQueries({ queryKey: enseignantKeys.lists() });
      qc.invalidateQueries({ queryKey: enseignantKeys.detail(id) });
      toast.success('Enseignant archivé');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}

// ──────────────────────────────────────────
// HARD DELETE
// ──────────────────────────────────────────

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