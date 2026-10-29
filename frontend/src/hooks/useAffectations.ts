// frontend2/src/hooks/useAffectations.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { affectationApi } from '../api/affectation.api';
import { useToast } from '../context/ToastContext';
import type {
  ListAffectationsParams,
  CreateAffectationPayload,
  UpdateAffectationPayload,
  Affectation,
  ListAffectationsResult,
  AffectationsByEnseignantResult,
} from '../types/affectation.types';

// ──────────────────────────────────────────
// QUERY KEYS
// ──────────────────────────────────────────

export const affectationKeys = {
  all: ['affectations'] as const,
  lists: () => [...affectationKeys.all, 'list'] as const,
  list: (params?: ListAffectationsParams) =>
    [...affectationKeys.lists(), params ?? {}] as const,
  details: () => [...affectationKeys.all, 'detail'] as const,
  detail: (id: string) => [...affectationKeys.details(), id] as const,
  byEnseignant: (enseignantId: string, anneeScolaireId?: string) =>
    [
      ...affectationKeys.all,
      'by-enseignant',
      enseignantId,
      anneeScolaireId ?? 'all',
    ] as const,
  byClasse: (classeId: string) =>
    [...affectationKeys.all, 'by-classe', classeId] as const,
};

// ──────────────────────────────────────────
// HELPERS — Normalisation des réponses
// ──────────────────────────────────────────

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const e = err as any;
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

/**
 * Normalise une réponse liste qui peut arriver sous 3 formes :
 *  1. { success, data: { data: [...], pagination } }   (double wrapping)
 *  2. { success, data: [...], pagination }              (simple wrapping — backend actuel)
 *  3. { success, data: { affectations: [...], pagination } }
 *
 * → Retourne TOUJOURS { data: Affectation[], pagination }
 */
function normalizeListResponse(res: any): ListAffectationsResult {
  // Cas 1 : double wrapping
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      data: res.data.data,
      pagination: res.data.pagination ?? {
        page: 1,
        limit: 50,
        total: res.data.data.length,
        totalPages: 1,
      },
    };
  }

  // Cas 2 : simple wrapping ← ← ← VOTRE BACKEND ACTUEL
  if (Array.isArray(res?.data)) {
    return {
      data: res.data,
      pagination: res.pagination ?? {
        page: 1,
        limit: 50,
        total: res.data.length,
        totalPages: 1,
      },
    };
  }

  // Cas 3 : { data: { affectations: [...] } }
  if (Array.isArray(res?.data?.affectations)) {
    return {
      data: res.data.affectations,
      pagination: res.data.pagination ?? {
        page: 1,
        limit: 50,
        total: res.data.affectations.length,
        totalPages: 1,
      },
    };
  }

  // Fallback : rien
  return {
    data: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

/**
 * Extrait une Affectation depuis une réponse API :
 *  - { success, data: Affectation }  → res.data
 *  - { success, data: { affectation: Affectation } } → res.data.affectation
 *  - Affectation directe (rare) → res
 */
function unwrapAffectation(res: any): Affectation | null {
  if (!res) return null;
  if (res.data && res.data.id) return res.data as Affectation;
  if (res.data && res.data.affectation) return res.data.affectation;
  if (res.id) return res as Affectation;
  return null;
}

/**
 * Normalise la réponse de /affectations/by-enseignant/:id
 *  - { success, data: { affectations, stats } } → res.data
 *  - { affectations, stats }                     → res
 */
function normalizeByEnseignantResponse(
  res: any
): AffectationsByEnseignantResult {
  const empty: AffectationsByEnseignantResult = {
    affectations: [],
    stats: {
      nombreAffectations: 0,
      totalHeuresHebdo: 0,
      classes: [],
      matieres: [],
    },
  };

  if (!res) return empty;

  if (res.data?.affectations) return res.data;
  if (res.affectations) return res as AffectationsByEnseignantResult;
  return empty;
}

// ──────────────────────────────────────────
// LOG HELPERS (cohérents avec useEcheances)
// ──────────────────────────────────────────

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
  const e = err as any;
  const status = e?.response?.status;
  const message = e?.response?.data?.message ?? e?.message ?? fallback;

  console.error(
    `%c❌ [${hook}] ${ts} → Erreur`,
    'color:#dc2626;font-weight:bold'
  );
  console.error('   Status:', status ?? 'NETWORK ERROR');
  console.error('   Message:', message);

  if (status === 401) console.error('   💡 401 : Token manquant/expiré');
  else if (status === 403) console.error('   💡 403 : Rôle non autorisé');
  else if (status === 404) console.error('   💡 404 : Affectation introuvable');
  else if (status === 409)
    console.error('   💡 409 : Doublon ou dépendances');
  else if (status === 500)
    console.error('   💡 500 : Erreur backend → voir terminal');
};

// ──────────────────────────────────────────
// LECTURE
// ──────────────────────────────────────────

export function useAffectations(params?: ListAffectationsParams) {
  return useQuery<ListAffectationsResult>({
    queryKey: affectationKeys.list(params),
    queryFn: async () => {
      logStart('useAffectations', { params });
      try {
        const res = await affectationApi.list(params);
        const normalized = normalizeListResponse(res);

        logSuccess('useAffectations', {
          total: normalized.pagination.total,
          items: normalized.data.length,
          sample: normalized.data[0]?.id ?? '—',
        });

        return normalized;
      } catch (err) {
        logError('useAffectations', err, 'Échec du chargement');
        throw err;
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useAffectation(id: string | undefined) {
  return useQuery<Affectation>({
    queryKey: affectationKeys.detail(id ?? ''),
    queryFn: async () => {
      logStart('useAffectation', { id });
      try {
        const res = await affectationApi.getById(id!);
        const aff = unwrapAffectation(res);
        if (!aff) throw new Error('Affectation introuvable');

        logSuccess('useAffectation', {
          id: aff.id,
          classe: aff.classe?.nom,
          enseignant: `${aff.enseignant?.prenom ?? ''} ${
            aff.enseignant?.nom ?? ''
          }`.trim(),
        });

        return aff;
      } catch (err) {
        logError('useAffectation', err, 'Échec chargement affectation');
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useAffectationsByEnseignant(
  enseignantId: string | undefined,
  anneeScolaireId?: string
) {
  return useQuery<AffectationsByEnseignantResult>({
    queryKey: affectationKeys.byEnseignant(
      enseignantId ?? '',
      anneeScolaireId
    ),
    queryFn: async () => {
      logStart('useAffectationsByEnseignant', {
        enseignantId,
        anneeScolaireId,
      });
      try {
        const res = await affectationApi.listByEnseignant(
          enseignantId!,
          anneeScolaireId
        );
        const normalized = normalizeByEnseignantResponse(res);

        logSuccess('useAffectationsByEnseignant', {
          nombre: normalized.affectations.length,
          heures: normalized.stats.totalHeuresHebdo,
        });

        return normalized;
      } catch (err) {
        logError(
          'useAffectationsByEnseignant',
          err,
          'Échec chargement affectations'
        );
        throw err;
      }
    },
    enabled: !!enseignantId,
    staleTime: 30_000,
  });
}

export function useAffectationsByClasse(classeId: string | undefined) {
  return useQuery<Affectation[]>({
    queryKey: affectationKeys.byClasse(classeId ?? ''),
    queryFn: async () => {
      logStart('useAffectationsByClasse', { classeId });
      try {
        const res = await affectationApi.listByClasse(classeId!);

        // Normalisation : tableau direct OU objet { data: [] }
        let list: Affectation[] = [];
        if (Array.isArray(res?.data)) list = res.data;
        else if (Array.isArray(res)) list = res as any;
        else if (Array.isArray((res as any)?.data?.data))
          list = (res as any).data.data;

        logSuccess('useAffectationsByClasse', { nombre: list.length });
        return list;
      } catch (err) {
        logError(
          'useAffectationsByClasse',
          err,
          'Échec chargement affectations classe'
        );
        throw err;
      }
    },
    enabled: !!classeId,
    staleTime: 30_000,
  });
}

// ──────────────────────────────────────────
// MUTATIONS
// ──────────────────────────────────────────

export function useCreateAffectation() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: CreateAffectationPayload) =>
      affectationApi.create(payload),
    onSuccess: (res) => {
      const aff = unwrapAffectation(res);
      qc.invalidateQueries({ queryKey: affectationKeys.lists() });

      if (aff) {
        qc.setQueryData(affectationKeys.detail(aff.id), aff);
        qc.invalidateQueries({
          queryKey: affectationKeys.byClasse(aff.classeId),
        });
        qc.invalidateQueries({
          queryKey: affectationKeys.byEnseignant(aff.enseignantId),
        });
        toast.success(
          `Affectation créée : ${aff.enseignant?.prenom ?? ''} ${
            aff.enseignant?.nom ?? ''
          } → ${aff.classe?.nom ?? ''}`
        );
      } else {
        toast.success('Affectation créée');
      }
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, 'Échec de la création')),
  });
}

export function useUpdateAffectation() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAffectationPayload;
    }) => affectationApi.update(id, payload),
    onSuccess: (res, vars) => {
      const aff = unwrapAffectation(res);
      qc.invalidateQueries({ queryKey: affectationKeys.lists() });
      qc.invalidateQueries({ queryKey: affectationKeys.detail(vars.id) });
      if (aff) {
        qc.invalidateQueries({
          queryKey: affectationKeys.byClasse(aff.classeId),
        });
        qc.invalidateQueries({
          queryKey: affectationKeys.byEnseignant(aff.enseignantId),
        });
      }
      toast.success('Affectation mise à jour');
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, 'Échec de la mise à jour')),
  });
}

export function useSoftDeleteAffectation() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => affectationApi.softDelete(id),
    onSuccess: (_r, id) => {
      qc.invalidateQueries({ queryKey: affectationKeys.lists() });
      qc.invalidateQueries({ queryKey: affectationKeys.detail(id) });
      toast.success('Affectation désactivée');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}

export function useHardDeleteAffectation() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => affectationApi.hardDelete(id),
    onSuccess: (_r, id) => {
      qc.removeQueries({ queryKey: affectationKeys.detail(id) });
      qc.invalidateQueries({ queryKey: affectationKeys.lists() });
      toast.success('Affectation supprimée définitivement');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}