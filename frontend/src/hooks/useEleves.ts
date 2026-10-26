// frontend2/src/hooks/useEleves.ts

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { eleveApi } from '../api/eleve.api';
import { useToast } from '../context/ToastContext';
import type {
  ListElevesParams,
  CreateElevePayload,
  UpdateElevePayload,
  ElevesListResult,
  Eleve,
} from '../types/eleve.types';

// ──────────────────────────────────────────
// QUERY KEYS
// ──────────────────────────────────────────

export const eleveKeys = {
  all: ['eleves'] as const,
  lists: () => [...eleveKeys.all, 'list'] as const,
  list: (params?: ListElevesParams) => [...eleveKeys.lists(), params ?? {}] as const,
  details: () => [...eleveKeys.all, 'detail'] as const,
  detail: (id: string) => [...eleveKeys.details(), id] as const,
};

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

function normalize(res: any): ElevesListResult {
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      eleves: res.data.data,
      pagination:
        res.data.pagination ??
        { page: 1, limit: 20, total: res.data.data.length, totalPages: 1 },
    };
  }
  if (Array.isArray(res?.data)) {
    return {
      eleves: res.data,
      pagination:
        res.pagination ??
        { page: 1, limit: 20, total: res.data.length, totalPages: 1 },
    };
  }
  return {
    eleves: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const e = err as any;
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

/** Extrait l'élève renvoyé par l'API quel que soit le wrapping (data / direct) */
function unwrapEleve(res: any): Eleve | null {
  if (res?.data?.data) return res.data.data as Eleve;
  if (res?.data && typeof res.data === 'object' && 'id' in res.data) {
    return res.data as Eleve;
  }
  return null;
}

// ──────────────────────────────────────────
// HOOKS DE LECTURE
// ──────────────────────────────────────────

export function useEleves(params?: ListElevesParams) {
  return useQuery<ElevesListResult>({
    queryKey: eleveKeys.list(params),
    queryFn: async () => normalize(await eleveApi.list(params)),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useEleve(id: string | undefined) {
  return useQuery<Eleve>({
    queryKey: eleveKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await eleveApi.getById(id!);
      const eleve = unwrapEleve(res);
      if (!eleve) throw new Error('Élève introuvable dans la réponse');
      return eleve;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ──────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────

/**
 * Crée un élève.
 * - Si `payload.classeId` est fourni → inscription + assignment scolarité auto.
 * - Si la classe n'a pas de plan actif → l'API renvoie `_warnings` (non bloquant).
 */
export function useCreateEleve() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: CreateElevePayload) => eleveApi.create(payload),
    onSuccess: (res) => {
      const eleve = unwrapEleve(res);

      qc.invalidateQueries({ queryKey: eleveKeys.lists() });

      if (eleve) {
        // Pré-remplir le cache détail pour éviter un refetch immédiat
        qc.setQueryData(eleveKeys.detail(eleve.id), eleve);

        toast.success(`Élève créé : ${eleve.prenom} ${eleve.nom}`);

        // 🆕 Warnings non bloquants (ex: classe sans plan de scolarité)
        if (eleve._warnings?.length) {
          eleve._warnings.forEach((w) => toast.warning(w));
        }
      } else {
        toast.success('Élève créé');
      }
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, 'Échec de la création')),
  });
}

// ──────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────

/**
 * Met à jour un élève.
 * - Si `payload.classeId` est fourni → réinscription automatique
 *   (désactive l'ancienne inscription, crée la nouvelle, assignment si plan).
 * - Si `payload.classeId === null` → retire l'élève de sa classe active.
 */
export function useUpdateEleve() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateElevePayload;
    }) => eleveApi.update(id, payload),
    onSuccess: (res, v) => {
      const eleve = unwrapEleve(res);

      qc.invalidateQueries({ queryKey: eleveKeys.lists() });
      qc.invalidateQueries({ queryKey: eleveKeys.detail(v.id) });

      // 🆕 Le changement de classe impacte les inscriptions et la scolarité
      if (v.payload.classeId !== undefined) {
        qc.invalidateQueries({ queryKey: ['inscriptions', 'list'] });
        qc.invalidateQueries({ queryKey: ['assignments-scolarite', 'list'] });
      }

      // Warnings éventuels
      if (eleve?._warnings?.length) {
        eleve._warnings.forEach((w) => toast.warning(w));
      } else {
        toast.success('Élève mis à jour');
      }
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, 'Échec de la mise à jour')),
  });
}

// ──────────────────────────────────────────
// SOFT DELETE
// ──────────────────────────────────────────

export function useSoftDeleteEleve() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => eleveApi.softDelete(id),
    onSuccess: (_r, id) => {
      qc.invalidateQueries({ queryKey: eleveKeys.lists() });
      qc.invalidateQueries({ queryKey: eleveKeys.detail(id) });
      toast.success('Élève archivé');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}

// ──────────────────────────────────────────
// HARD DELETE
// ──────────────────────────────────────────

export function useHardDeleteEleve() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => eleveApi.hardDelete(id),
    onSuccess: (_r, id) => {
      qc.removeQueries({ queryKey: eleveKeys.detail(id) });
      qc.invalidateQueries({ queryKey: eleveKeys.lists() });
      toast.success('Élève supprimé définitivement');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}