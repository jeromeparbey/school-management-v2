// frontend2/src/hooks/useEmploisTemps.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { emploiTempsApi } from '../api/emploiTemps.api';
import { useToast } from '../context/ToastContext';
import type {
  ListEmploisTempsParams,
  CreateEmploiTempsPayload,
  UpdateEmploiTempsPayload,
  CheckConflitsPayload,
  CheckConflitsResult,
  EmploisTempsListResult,
  EmploiTemps,
  EmploiTempsByClasseResult,
  EmploiTempsByEnseignantResult,
} from '../types/emploiTemps.types';

// ═══════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════

export const emploiTempsKeys = {
  all: ['emplois-temps'] as const,

  lists: () => [...emploiTempsKeys.all, 'list'] as const,
  list: (params?: ListEmploisTempsParams) =>
    [...emploiTempsKeys.lists(), params ?? {}] as const,

  details: () => [...emploiTempsKeys.all, 'detail'] as const,
  detail: (id: string) => [...emploiTempsKeys.details(), id] as const,

  byClasse: (classeId: string, anneeScolaireId?: string) =>
    [
      ...emploiTempsKeys.all,
      'by-classe',
      classeId,
      anneeScolaireId ?? 'all',
    ] as const,
  byEnseignant: (enseignantId: string, anneeScolaireId?: string) =>
    [
      ...emploiTempsKeys.all,
      'by-enseignant',
      enseignantId,
      anneeScolaireId ?? 'all',
    ] as const,
  byEleve: (eleveId: string) =>
    [...emploiTempsKeys.all, 'by-eleve', eleveId] as const,
};

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const e = err as any;
  return (
    e?.response?.data?.message ??
    e?.response?.data?.error ??
    e?.message ??
    fallback
  );
}

/**
 * Normalise la réponse d'une liste d'emplois du temps.
 * Gère : { data: { data: [], pagination } } / { data: [], pagination } / { emploisTemps: [] }
 */
function normalizeListResponse(res: any): EmploisTempsListResult {
  const payload = res?.data ?? res;

  // Cas 1 : { data: [...], pagination } (simple wrapping)
  if (payload?.data && Array.isArray(payload.data)) {
    return {
      emploisTemps: payload.data,
      pagination:
        payload.pagination ?? {
          page: 1,
          limit: 100,
          total: payload.data.length,
          totalPages: 1,
        },
    };
  }

  // Cas 2 : tableau brut
  if (Array.isArray(payload)) {
    return {
      emploisTemps: payload,
      pagination: {
        page: 1,
        limit: 100,
        total: payload.length,
        totalPages: 1,
      },
    };
  }

  // Cas 3 : { emploisTemps: [...], pagination }
  if (Array.isArray(payload?.emploisTemps)) {
    return {
      emploisTemps: payload.emploisTemps,
      pagination:
        payload.pagination ?? {
          page: 1,
          limit: 100,
          total: payload.emploisTemps.length,
          totalPages: 1,
        },
    };
  }

  // Fallback
  return {
    emploisTemps: [],
    pagination: { page: 1, limit: 100, total: 0, totalPages: 1 },
  };
}

/**
 * Extrait un EmploiTemps d'une réponse wrappée.
 */
function unwrapEmploiTemps(res: any): EmploiTemps | null {
  if (!res) return null;
  if (res.data?.data?.id) return res.data.data as EmploiTemps;
  if (res.data?.id) return res.data as EmploiTemps;
  if (res.id) return res as EmploiTemps;
  return null;
}

/**
 * Extrait un résultat `by-classe` (contient classe + slots + parJour + stats).
 */
function unwrapByClasse(res: any): EmploiTempsByClasseResult | null {
  if (!res) return null;
  if (res.data?.classe && res.data?.slots) return res.data as EmploiTempsByClasseResult;
  if (res.classe && res.slots) return res as EmploiTempsByClasseResult;
  return null;
}

/**
 * Extrait un résultat `by-enseignant` (contient enseignant + slots + parJour + stats).
 */
function unwrapByEnseignant(res: any): EmploiTempsByEnseignantResult | null {
  if (!res) return null;
  if (res.data?.enseignant && res.data?.slots)
    return res.data as EmploiTempsByEnseignantResult;
  if (res.enseignant && res.slots)
    return res as EmploiTempsByEnseignantResult;
  return null;
}

/**
 * Invalide tous les caches liés à un emploi du temps
 * (liste, détail, vue classe, vue enseignant, vue élève, et domaines métier).
 */
function invalidateAllEmploiTemps(
  qc: ReturnType<typeof useQueryClient>,
  id?: string
) {
  qc.invalidateQueries({ queryKey: emploiTempsKeys.lists() });

  if (id) {
    qc.invalidateQueries({ queryKey: emploiTempsKeys.detail(id) });
  }

  // Invalider toutes les vues spécifiques en une seule fois
  qc.invalidateQueries({ queryKey: [...emploiTempsKeys.all, 'by-classe'] });
  qc.invalidateQueries({ queryKey: [...emploiTempsKeys.all, 'by-enseignant'] });
  qc.invalidateQueries({ queryKey: [...emploiTempsKeys.all, 'by-eleve'] });

  // Domaines métier liés
  ['classes', 'enseignants', 'eleves', 'matieres'].forEach((domain) => {
    qc.invalidateQueries({ queryKey: [domain] });
  });
}

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

export function useEmploisTemps(params?: ListEmploisTempsParams) {
  return useQuery<EmploisTempsListResult>({
    queryKey: emploiTempsKeys.list(params),
    queryFn: async () => normalizeListResponse(await emploiTempsApi.list(params)),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useEmploiTemps(id: string | undefined) {
  return useQuery<EmploiTemps>({
    queryKey: emploiTempsKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await emploiTempsApi.getById(id!);
      const emploi = unwrapEmploiTemps(res);
      if (!emploi) throw new Error('Emploi du temps introuvable');
      return emploi;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useEmploiTempsByClasse(
  classeId: string | undefined,
  anneeScolaireId?: string
) {
  return useQuery<EmploiTempsByClasseResult>({
    queryKey: emploiTempsKeys.byClasse(classeId ?? '', anneeScolaireId),
    queryFn: async () => {
      const res = await emploiTempsApi.listByClasse(
        classeId!,
        anneeScolaireId
      );
      const data = unwrapByClasse(res);
      if (!data) throw new Error('Emploi du temps de la classe introuvable');
      return data;
    },
    enabled: !!classeId,
    staleTime: 30_000,
  });
}

export function useEmploiTempsByEnseignant(
  enseignantId: string | undefined,
  anneeScolaireId?: string
) {
  return useQuery<EmploiTempsByEnseignantResult>({
    queryKey: emploiTempsKeys.byEnseignant(
      enseignantId ?? '',
      anneeScolaireId
    ),
    queryFn: async () => {
      const res = await emploiTempsApi.listByEnseignant(
        enseignantId!,
        anneeScolaireId
      );
      const data = unwrapByEnseignant(res);
      if (!data) throw new Error("Emploi du temps de l'enseignant introuvable");
      return data;
    },
    enabled: !!enseignantId,
    staleTime: 30_000,
  });
}

export function useEmploiTempsByEleve(eleveId: string | undefined) {
  return useQuery<EmploiTempsByClasseResult>({
    queryKey: emploiTempsKeys.byEleve(eleveId ?? ''),
    queryFn: async () => {
      const res = await emploiTempsApi.listByEleve(eleveId!);
      const data = unwrapByClasse(res);
      if (!data) throw new Error("Emploi du temps de l'élève introuvable");
      return data;
    },
    enabled: !!eleveId,
    staleTime: 30_000,
  });
}

// ═══════════════════════════════════════════════════════════
// CHECK CONFLITS (mutation, car à la demande)
// ═══════════════════════════════════════════════════════════

export function useCheckConflitsEmploiTemps() {
  return useMutation<CheckConflitsResult, unknown, CheckConflitsPayload>({
    mutationFn: async (payload) => {
      const res = await emploiTempsApi.checkConflits(payload);
      return (res?.data ?? res) as CheckConflitsResult;
    },
  });
}

// ═══════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════

export function useCreateEmploiTemps() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: CreateEmploiTempsPayload) =>
      emploiTempsApi.create(payload),
    onSuccess: (res) => {
      const emploi = unwrapEmploiTemps(res);
      invalidateAllEmploiTemps(qc);

      if (emploi) {
        qc.setQueryData(emploiTempsKeys.detail(emploi.id), emploi);
        toast.success(
          `Créneau créé : ${emploi.matiere?.nom ?? 'Matière'} — ${
            emploi.classe?.nom ?? 'Classe'
          } (${emploi.jour} ${emploi.heureDebut}-${emploi.heureFin})`
        );
      } else {
        toast.success('Créneau créé');
      }
    },
    onError: (err) => {
      const status = (err as any)?.response?.status;
      if (status === 409) {
        toast.error(
          getErrorMessage(
            err,
            'Conflit détecté : vérifiez la classe, le professeur ou la salle'
          )
        );
      } else {
        toast.error(getErrorMessage(err, 'Échec de la création'));
      }
    },
  });
}

export function useUpdateEmploiTemps() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEmploiTempsPayload;
    }) => emploiTempsApi.update(id, payload),
    onSuccess: (res, vars) => {
      const emploi = unwrapEmploiTemps(res);
      invalidateAllEmploiTemps(qc, vars.id);

      if (emploi) {
        qc.setQueryData(emploiTempsKeys.detail(vars.id), emploi);
      }

      toast.success('Créneau mis à jour');
    },
    onError: (err) => {
      const status = (err as any)?.response?.status;
      if (status === 409) {
        toast.error(
          getErrorMessage(
            err,
            'Conflit détecté : vérifiez la classe, le professeur ou la salle'
          )
        );
      } else {
        toast.error(getErrorMessage(err, 'Échec de la mise à jour'));
      }
    },
  });
}

export function useToggleEmploiTemps() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => emploiTempsApi.toggleActif(id),
    onSuccess: (res, id) => {
      const emploi = unwrapEmploiTemps(res);
      invalidateAllEmploiTemps(qc, id);

      if (emploi) {
        qc.setQueryData(emploiTempsKeys.detail(id), emploi);
        toast.success(
          emploi.estActive ? 'Créneau activé' : 'Créneau désactivé'
        );
      } else {
        toast.success('Statut mis à jour');
      }
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}

export function useDupliquerEmploiTemps() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, targetJour }: { id: string; targetJour?: string }) =>
      emploiTempsApi.dupliquer(id, targetJour),
    onSuccess: (res) => {
      const emploi = unwrapEmploiTemps(res);
      invalidateAllEmploiTemps(qc);

      if (emploi) {
        qc.setQueryData(emploiTempsKeys.detail(emploi.id), emploi);
        toast.success(
          `Créneau dupliqué sur ${emploi.jour} (${emploi.heureDebut}-${emploi.heureFin})`
        );
      } else {
        toast.success('Créneau dupliqué');
      }
    },
    onError: (err) => {
      const status = (err as any)?.response?.status;
      if (status === 409) {
        toast.error(
          getErrorMessage(err, 'Conflit détecté sur le jour cible')
        );
      } else {
        toast.error(getErrorMessage(err, 'Échec de la duplication'));
      }
    },
  });
}

export function useSoftDeleteEmploiTemps() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => emploiTempsApi.softDelete(id),
    onSuccess: (_r, id) => {
      invalidateAllEmploiTemps(qc, id);
      toast.success('Créneau désactivé');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}

export function useHardDeleteEmploiTemps() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => emploiTempsApi.hardDelete(id),
    onSuccess: (_r, id) => {
      qc.removeQueries({ queryKey: emploiTempsKeys.detail(id) });
      invalidateAllEmploiTemps(qc);
      toast.success('Créneau supprimé définitivement');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}