// frontend2/src/hooks/usePaiements.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { paiementApi } from '../api/paiement.api';
import { useToast } from '../context/ToastContext';
import type {
  ListPaiementsParams,
  CreatePaiementPayload,
  UpdatePaiementPayload,
  AnnulerPaiementPayload,
  PaiementsListResult,
  Paiement,
  PaiementsByEleveResult,
  PaiementStatsResult,
} from '../types/paiement.types';

// ──────────────────────────────────────────
// QUERY KEYS
// ──────────────────────────────────────────

export const paiementKeys = {
  all: ['paiements'] as const,
  lists: () => [...paiementKeys.all, 'list'] as const,
  list: (params?: ListPaiementsParams) =>
    [...paiementKeys.lists(), params ?? {}] as const,
  details: () => [...paiementKeys.all, 'detail'] as const,
  detail: (id: string) => [...paiementKeys.details(), id] as const,
  byEleve: (eleveId: string) =>
    [...paiementKeys.all, 'by-eleve', eleveId] as const,
  stats: (params?: { dateDebut?: string; dateFin?: string }) =>
    [...paiementKeys.all, 'stats', params ?? {}] as const,
};

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

function normalize(res: any): PaiementsListResult {
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      paiements: res.data.data,
      pagination:
        res.data.pagination ??
        { page: 1, limit: 50, total: res.data.data.length, totalPages: 1 },
      summary: res.data.summary ?? { totalMontant: 0 },
    };
  }
  if (Array.isArray(res?.data)) {
    return {
      paiements: res.data,
      pagination:
        res.pagination ??
        { page: 1, limit: 50, total: res.data.length, totalPages: 1 },
      summary: res.summary ?? { totalMontant: 0 },
    };
  }
  return {
    paiements: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
    summary: { totalMontant: 0 },
  };
}

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const e = err as any;
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

function unwrapPaiement(res: any): Paiement | null {
  if (res?.data?.data) return res.data.data as Paiement;
  if (res?.data && typeof res.data === 'object' && 'id' in res.data) {
    return res.data as Paiement;
  }
  return null;
}

// ──────────────────────────────────────────
// HOOKS DE LECTURE
// ──────────────────────────────────────────

export function usePaiements(params?: ListPaiementsParams) {
  return useQuery<PaiementsListResult>({
    queryKey: paiementKeys.list(params),
    queryFn: async () => normalize(await paiementApi.list(params)),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function usePaiement(id: string | undefined) {
  return useQuery<Paiement>({
    queryKey: paiementKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await paiementApi.getById(id!);
      const paiement = unwrapPaiement(res);
      if (!paiement) throw new Error('Paiement introuvable dans la réponse');
      return paiement;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function usePaiementsByEleve(eleveId: string | undefined) {
  return useQuery<PaiementsByEleveResult>({
    queryKey: paiementKeys.byEleve(eleveId ?? ''),
    queryFn: async () => {
      const res = await paiementApi.listByEleve(eleveId!);
      const any = res as any;
      return (
        any?.data ?? {
          paiements: [],
          total: 0,
        }
      );
    },
    enabled: !!eleveId,
    staleTime: 30_000,
  });
}

export function usePaiementStats(params?: {
  dateDebut?: string;
  dateFin?: string;
}) {
  return useQuery<PaiementStatsResult>({
    queryKey: paiementKeys.stats(params),
    queryFn: async () => {
      const res = await paiementApi.stats(params);
      const any = res as any;
      return (
        any?.data ?? {
          totalMontant: 0,
          nombrePaiements: 0,
          parMoyen: [],
        }
      );
    },
    staleTime: 60_000,
  });
}

// ──────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────

export function useCreatePaiement() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: CreatePaiementPayload) =>
      paiementApi.create(payload),
    onSuccess: (res) => {
      const paiement = unwrapPaiement(res);

      qc.invalidateQueries({ queryKey: paiementKeys.lists() });
      qc.invalidateQueries({ queryKey: paiementKeys.all });

      if (paiement) {
        qc.setQueryData(paiementKeys.detail(paiement.id), paiement);
        qc.invalidateQueries({
          queryKey: paiementKeys.byEleve(paiement.eleveId),
        });
        toast.success(
          `Paiement enregistré : ${paiement.reference} (${paiement.montant.toLocaleString()} ${
            (paiement as any).devise ?? 'XOF'
          })`
        );
      } else {
        toast.success('Paiement enregistré');
      }
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "Échec de l'enregistrement")),
  });
}

// ──────────────────────────────────────────
// UPDATE (notes)
// ──────────────────────────────────────────

export function useUpdatePaiement() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePaiementPayload;
    }) => paiementApi.update(id, payload),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: paiementKeys.lists() });
      qc.invalidateQueries({ queryKey: paiementKeys.detail(v.id) });
      toast.success('Paiement mis à jour');
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, 'Échec de la mise à jour')),
  });
}

// ──────────────────────────────────────────
// ANNULER
// ──────────────────────────────────────────

export function useAnnulerPaiement() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AnnulerPaiementPayload;
    }) => paiementApi.annuler(id, payload),
    onSuccess: (res, v) => {
      const paiement = unwrapPaiement(res);

      qc.invalidateQueries({ queryKey: paiementKeys.lists() });
      qc.invalidateQueries({ queryKey: paiementKeys.detail(v.id) });
      qc.invalidateQueries({ queryKey: paiementKeys.all });

      if (paiement) {
        qc.invalidateQueries({
          queryKey: paiementKeys.byEleve(paiement.eleveId),
        });
      }

      toast.success('Paiement annulé');
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "Échec de l'annulation")),
  });
}

// ──────────────────────────────────────────
// HARD DELETE
// ──────────────────────────────────────────

export function useHardDeletePaiement() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => paiementApi.hardDelete(id),
    onSuccess: (_r, id) => {
      qc.removeQueries({ queryKey: paiementKeys.detail(id) });
      qc.invalidateQueries({ queryKey: paiementKeys.lists() });
      qc.invalidateQueries({ queryKey: paiementKeys.all });
      toast.success('Paiement supprimé définitivement');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}