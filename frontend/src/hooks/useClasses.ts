// frontend2/src/hooks/useClasses.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { classeApi } from '../api/classe.api';
import { useToast } from '../context/ToastContext';
import type {
  ListClassesParams,
  CreateClassePayload,
  UpdateClassePayload,
  Classe,
  ClassesListResult,
} from '../types/classe.types';

// ═══════════════════════════════════════════════════════════
// 🔑 QUERY KEYS
// ═══════════════════════════════════════════════════════════

export const classeKeys = {
  all: ['classes'] as const,
  lists: () => [...classeKeys.all, 'list'] as const,
  list: (params?: ListClassesParams) =>
    [...classeKeys.lists(), params ?? {}] as const,
  byAnnee: (anneeScolaireId: string) =>
    [...classeKeys.all, 'by-annee', anneeScolaireId] as const,
  details: () => [...classeKeys.all, 'detail'] as const,
  detail: (id: string) => [...classeKeys.details(), id] as const,
  eleves: (id: string) => [...classeKeys.all, 'eleves', id] as const,
  stats: (id: string) => [...classeKeys.all, 'stats', id] as const,
};

// ═══════════════════════════════════════════════════════════
// 🧰 HELPERS — Normalisation de la réponse
// ═══════════════════════════════════════════════════════════

/**
 * Extrait le tableau de classes + pagination depuis une réponse API
 * qui peut être :
 *  - { success, data: Classe[], pagination }              (backend simple)
 *  - { success, data: { data: Classe[], pagination } }    (contrat ApiResponse)
 *
 * → Retourne TOUJOURS { classes: Classe[], pagination }
 */
function normalizeListResponse(res: any): ClassesListResult {
  // Cas 1 : data = { data: Classe[], pagination }  (double wrapping)
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      classes: res.data.data,
      pagination: res.data.pagination ?? {
        page: 1,
        limit: 20,
        total: res.data.data.length,
        totalPages: 1,
      },
    };
  }

  // Cas 2 : data = Classe[] direct  (simple wrapping)
  if (Array.isArray(res?.data)) {
    return {
      classes: res.data,
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
    classes: [],
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
    console.error('   💡 404 : Classe/année/niveau introuvable');
  } else if (status === 409) {
    console.error(
      '   💡 409 : Code dupliqué OU inscriptions actives OU références'
    );
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

export function useClasses(params?: ListClassesParams) {
  return useQuery<ClassesListResult>({
    queryKey: classeKeys.list(params),
    queryFn: async () => {
      logStart('useClasses', { params });
      try {
        const res = await classeApi.list(params);

        // ✅ Normalisation : retourne TOUJOURS { classes, pagination }
        const normalized = normalizeListResponse(res);

        logSuccess('useClasses', {
          total: normalized.pagination.total,
          items: normalized.classes.length,
          sample: normalized.classes[0]?.nom ?? '—',
        });

        return normalized;
      } catch (err) {
        logError('useClasses', err, 'Échec du chargement');
        throw err;
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useClassesByAnnee(anneeScolaireId: string | undefined) {
  return useQuery({
    queryKey: classeKeys.byAnnee(anneeScolaireId ?? ''),
    queryFn: async () => {
      logStart('useClassesByAnnee', { anneeScolaireId });
      try {
        const res = await classeApi.listByAnnee(anneeScolaireId!);

        // ✅ Le backend renvoie directement un tableau pour by-annee
        //    On normalise aussi pour être safe
        const classes: Classe[] = Array.isArray((res as any)?.data)
          ? (res as any).data
          : Array.isArray((res as any)?.data?.data)
          ? (res as any).data.data
          : [];

        logSuccess('useClassesByAnnee', { total: classes.length });
        return { ...res, classes };
      } catch (err) {
        logError('useClassesByAnnee', err, 'Échec chargement classes');
        throw err;
      }
    },
    enabled: !!anneeScolaireId,
    staleTime: 30_000,
  });
}

export function useClasse(id: string | undefined) {
  return useQuery({
    queryKey: classeKeys.detail(id ?? ''),
    queryFn: async () => {
      logStart('useClasse', { id });
      try {
        const res = await classeApi.getById(id!);
        logSuccess('useClasse', {
          nom: (res as any)?.data?.nom,
          code: (res as any)?.data?.code,
        });
        return res;
      } catch (err) {
        logError('useClasse', err, 'Échec chargement classe');
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useClasseEleves(id: string | undefined) {
  return useQuery({
    queryKey: classeKeys.eleves(id ?? ''),
    queryFn: async () => {
      logStart('useClasseEleves', { classeId: id });
      try {
        const res = await classeApi.listEleves(id!);
        logSuccess('useClasseEleves', {
          nbEleves: (res as any)?.data?.eleves?.length ?? 'N/A',
        });
        return res;
      } catch (err) {
        logError('useClasseEleves', err, 'Échec chargement élèves');
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useClasseStatistiques(id: string | undefined) {
  return useQuery({
    queryKey: classeKeys.stats(id ?? ''),
    queryFn: async () => {
      logStart('useClasseStatistiques', { classeId: id });
      try {
        const res = await classeApi.statistiques(id!);
        logSuccess('useClasseStatistiques', {
          inscrits: (res as any)?.data?.effectif?.inscrits,
          moyenne: (res as any)?.data?.moyenneGenerale,
        });
        return res;
      } catch (err) {
        logError('useClasseStatistiques', err, 'Échec chargement statistiques');
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 60_000,
  });
}

// ═══════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════

export function useCreateClasse() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: CreateClassePayload) => {
      logStart('useCreateClasse', {
        nom: payload.nom,
        code: payload.code,
        niveauId: payload.niveauId,
        anneeScolaireId: payload.anneeScolaireId,
      });
      return classeApi.create(payload);
    },
    onSuccess: (res) => {
      const created = (res as any)?.data;
      logSuccess('useCreateClasse', {
        id: created?.id,
        code: created?.code,
      });
      qc.invalidateQueries({ queryKey: classeKeys.lists() });
      if (created?.anneeScolaireId) {
        qc.invalidateQueries({
          queryKey: classeKeys.byAnnee(created.anneeScolaireId),
        });
      }
      toast.success(`Classe créée : ${created?.nom ?? '—'}`);
    },
    onError: (err) => {
      logError('useCreateClasse', err, 'Échec de la création');
      toast.error(getErrorMessage(err, 'Échec de la création'));
    },
  });
}

export function useUpdateClasse() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateClassePayload;
    }) => {
      logStart('useUpdateClasse', {
        id,
        champsModifies: Object.keys(payload),
      });
      return classeApi.update(id, payload);
    },
    onSuccess: (_res, variables) => {
      logSuccess('useUpdateClasse', { id: variables.id });
      qc.invalidateQueries({ queryKey: classeKeys.lists() });
      qc.invalidateQueries({ queryKey: classeKeys.detail(variables.id) });
      toast.success('Classe mise à jour');
    },
    onError: (err) => {
      logError('useUpdateClasse', err, 'Échec de la mise à jour');
      toast.error(getErrorMessage(err, 'Échec de la mise à jour'));
    },
  });
}

export function useSoftDeleteClasse() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      logStart('useSoftDeleteClasse', { id });
      return classeApi.softDelete(id);
    },
    onSuccess: (_res, id) => {
      logSuccess('useSoftDeleteClasse', { id });
      qc.invalidateQueries({ queryKey: classeKeys.lists() });
      qc.invalidateQueries({ queryKey: classeKeys.detail(id) });
      toast.success('Classe archivée');
    },
    onError: (err) => {
      logError('useSoftDeleteClasse', err, 'Échec de l’archivage');
      toast.error(getErrorMessage(err, 'Échec de l’archivage'));
    },
  });
}

export function useHardDeleteClasse() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      logStart('useHardDeleteClasse', { id });
      return classeApi.hardDelete(id);
    },
    onSuccess: (_res, id) => {
      logSuccess('useHardDeleteClasse', { id });
      qc.removeQueries({ queryKey: classeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: classeKeys.lists() });
      toast.success('Classe supprimée définitivement');
    },
    onError: (err) => {
      logError('useHardDeleteClasse', err, 'Échec de la suppression');
      toast.error(getErrorMessage(err, 'Échec de la suppression'));
    },
  });
}