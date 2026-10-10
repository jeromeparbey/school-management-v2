// frontend2/src/hooks/useEtablissements.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { etablissementApi } from '../api/etablissement.api';
import type {
  CreateEtablissementPayload,
  UpdateEtablissementPayload,
  ListEtablissementsParams,
  ToggleEtablissementPayload,
  ReprovisionnerEtablissementPayload,
} from '../types/etablissement.api';

// ============================================
// CLÉS DE CACHE (centralisées)
// ============================================
export const etablissementKeys = {
  all: ['etablissements'] as const,
  lists: () => [...etablissementKeys.all, 'list'] as const,
  list: (params?: ListEtablissementsParams) =>
    [...etablissementKeys.lists(), params ?? {}] as const,
  stats: () => [...etablissementKeys.all, 'stats'] as const,
  details: () => [...etablissementKeys.all, 'detail'] as const,
  detail: (id: string) => [...etablissementKeys.details(), id] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Liste paginée + filtrée des établissements.
 *
 * @example
 * const { data, isLoading } = useEtablissements({ page: 1, limit: 10 });
 * console.log(data?.items, data?.pagination);
 */
export function useEtablissements(params?: ListEtablissementsParams) {
  return useQuery({
    queryKey: etablissementKeys.list(params),
    queryFn: () => etablissementApi.list(params),
    staleTime: 30_000, // 30s
    select: (res) => res.data,
  });
}

/**
 * Statistiques globales du catalogue.
 *
 * @example
 * const { data: stats } = useEtablissementStats();
 * console.log(stats?.total, stats?.actifs);
 */
export function useEtablissementStats() {
  return useQuery({
    queryKey: etablissementKeys.stats(),
    queryFn: () => etablissementApi.stats(),
    staleTime: 60_000, // 1 min
    select: (res) => res.data,
  });
}

/**
 * Détail d'un établissement (inclut le directeur du tenant).
 *
 * @example
 * const { data: etab } = useEtablissement(id);
 * console.log(etab?.directeur);
 */
export function useEtablissement(id: string, enabled = true) {
  return useQuery({
    queryKey: etablissementKeys.detail(id),
    queryFn: () => etablissementApi.getById(id),
    enabled: !!id && enabled,
    staleTime: 30_000,
    select: (res) => res.data,
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * 🎯 Créer un établissement + son DIRECTEUR initial.
 *
 * ⚠️ Le payload DOIT contenir `directeur: { email, motDePasse, prenom, nom }`.
 * Le backend effectue le provisioning complet en une seule requête.
 *
 * @example
 * const create = useCreateEtablissement();
 * await create.mutateAsync({
 *   nom: 'École Victor Hugo',
 *   code: 'victor-hugo',
 *   ville: 'Abidjan',
 *   directeur: {
 *     email: 'directeur@victor-hugo.edu',
 *     motDePasse: 'MotDePasse123!',
 *     prenom: 'Jean',
 *     nom: 'Dupont',
 *   },
 * });
 */
export function useCreateEtablissement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEtablissementPayload) =>
      etablissementApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: etablissementKeys.lists() });
      qc.invalidateQueries({ queryKey: etablissementKeys.stats() });
    },
  });
}

/**
 * Mettre à jour un établissement.
 *
 * @example
 * const update = useUpdateEtablissement(id);
 * await update.mutateAsync({ nom: 'Nouveau nom' });
 */
export function useUpdateEtablissement(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateEtablissementPayload) =>
      etablissementApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: etablissementKeys.detail(id) });
      qc.invalidateQueries({ queryKey: etablissementKeys.lists() });
    },
  });
}

/**
 * Activer / désactiver un établissement.
 *
 * @example
 * const toggle = useToggleEtablissement();
 * await toggle.mutateAsync({ id, payload: { estActif: false } });
 */
export function useToggleEtablissement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ToggleEtablissementPayload;
    }) => etablissementApi.toggle(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: etablissementKeys.detail(id) });
      qc.invalidateQueries({ queryKey: etablissementKeys.lists() });
    },
  });
}

/**
 * Archiver un établissement (soft delete).
 *
 * @example
 * const archive = useArchiveEtablissement();
 * await archive.mutateAsync(id);
 */
export function useArchiveEtablissement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => etablissementApi.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: etablissementKeys.lists() });
      qc.invalidateQueries({ queryKey: etablissementKeys.stats() });
    },
  });
}

/**
 * Relancer le provisioning d'un établissement en échec.
 *
 * @example
 * const repro = useReprovisionnerEtablissement();
 * await repro.mutateAsync({ id });
 */
export function useReprovisionnerEtablissement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: ReprovisionnerEtablissementPayload;
    }) => etablissementApi.reprovisionner(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: etablissementKeys.detail(id) });
      qc.invalidateQueries({ queryKey: etablissementKeys.lists() });
    },
  });
}

/**
 * Suppression définitive (hard delete) — IRRÉVERSIBLE.
 *
 * @example
 * const del = useHardDeleteEtablissement();
 * await del.mutateAsync(id);
 */
export function useHardDeleteEtablissement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => etablissementApi.hardDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: etablissementKeys.lists() });
      qc.invalidateQueries({ queryKey: etablissementKeys.stats() });
    },
  });
}

// ============================================
// HOOK COMPOSITE (optionnel)
// ============================================

/**
 * Hook tout-en-un pour une page de gestion d'établissements.
 * Regroupe toutes les mutations + la liste + les stats.
 *
 * @example
 * const {
 *   etablissements, isLoading, stats,
 *   createEtablissement, toggleEtablissement, ...
 * } = useEtablissementsManager({ page: 1, limit: 10 });
 */
export function useEtablissementsManager(
  params?: ListEtablissementsParams,
  detailId?: string
) {
  const listQuery = useEtablissements(params);
  const statsQuery = useEtablissementStats();
  const detailQuery = useEtablissement(detailId ?? '', !!detailId);

  const createMutation = useCreateEtablissement();
  const updateMutation = useUpdateEtablissement(detailId ?? '');
  const toggleMutation = useToggleEtablissement();
  const archiveMutation = useArchiveEtablissement();
  const reprovisionMutation = useReprovisionnerEtablissement();
  const deleteMutation = useHardDeleteEtablissement();

  return {
    // Data
    etablissements: listQuery.data?.items ?? [],
    pagination: listQuery.data?.pagination,
    stats: statsQuery.data,
    detail: detailQuery.data,

    // Loading states
    isLoading: listQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    isLoadingDetail: detailQuery.isLoading,

    // Error states
    isError: listQuery.isError,
    error: listQuery.error,

    // Refetch
    refetch: listQuery.refetch,
    refetchStats: statsQuery.refetch,
    refetchDetail: detailQuery.refetch,

    // Mutations
    createEtablissement: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateEtablissement: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    toggleEtablissement: (id: string, estActif: boolean) =>
      toggleMutation.mutateAsync({ id, payload: { estActif } }),
    isToggling: toggleMutation.isPending,

    archiveEtablissement: archiveMutation.mutateAsync,
    isArchiving: archiveMutation.isPending,

    reprovisionnerEtablissement: (
      id: string,
      payload?: ReprovisionnerEtablissementPayload
    ) => reprovisionMutation.mutateAsync({ id, payload }),
    isReprovisionning: reprovisionMutation.isPending,

    deleteEtablissement: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}