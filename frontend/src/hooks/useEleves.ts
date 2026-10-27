// frontend2/src/hooks/useEleves.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { eleveApi } from '../api/eleve.api';
import { useToast } from '../context/ToastContext';
import type {
  ListElevesParams,
  CreateElevePayload,
  UpdateElevePayload,
  ElevesListResult,
  Eleve,
  EleveDetail,
  FinanceResume,
  EleveStats,
  EcheanceDetail,
  EmploiTempsResume,
  AffectationEnseignantResume,
} from '../types/eleve.types';

// ──────────────────────────────────────────
// QUERY KEYS
// ──────────────────────────────────────────

export const eleveKeys = {
  all: ['eleves'] as const,
  lists: () => [...eleveKeys.all, 'list'] as const,
  list: (params?: ListElevesParams) =>
    [...eleveKeys.lists(), params ?? {}] as const,
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
        res.data.pagination ?? {
          page: 1,
          limit: 20,
          total: res.data.data.length,
          totalPages: 1,
        },
    };
  }
  if (Array.isArray(res?.data)) {
    return {
      eleves: res.data,
      pagination:
        res.pagination ?? {
          page: 1,
          limit: 20,
          total: res.data.length,
          totalPages: 1,
        },
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
function unwrapEleve(res: any): EleveDetail | null {
  if (res?.data?.data) return res.data.data as EleveDetail;
  if (res?.data && typeof res.data === 'object' && 'id' in res.data) {
    return res.data as EleveDetail;
  }
  return null;
}

/**
 * Invalide tous les caches "élève" + les caches métier liés.
 * Utilisé après création / mise à jour / suppression.
 */
function invalidateAllEleveRelated(
  qc: ReturnType<typeof useQueryClient>,
  id?: string
) {
  qc.invalidateQueries({ queryKey: eleveKeys.lists() });
  if (id) {
    qc.invalidateQueries({ queryKey: eleveKeys.detail(id) });
  }
  [
    'paiements',
    'echeances',
    'assignments-scolarite',
    'inscriptions',
    'presences-eleves',
    'absences-eleves',
    'notes',
    'bulletins',
    'reductions',
    'emplois-temps',
    'affectations-enseignants',
  ].forEach((domain) => {
    qc.invalidateQueries({ queryKey: [domain] });
  });
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

/**
 * Détail complet de l'élève — inclut :
 * - infos, parents, responsables, inscriptions
 * - assignmentsScolarite (avec échéances enrichies `_meta`)
 * - paiements, presences, absences, notes, bulletins, etc.
 * - classeActive, emploiTemps, equipePedagogique
 * - _finance (résumé financier) et _stats (compteurs dérivés)
 */
export function useEleve(id: string | undefined) {
  return useQuery<EleveDetail>({
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
// 🆕 HOOKS DÉRIVÉS (sélecteurs)
// Tous partagent la même queryKey → une seule requête réseau.
// ──────────────────────────────────────────

/** Récupère uniquement le résumé financier. */
export function useEleveFinance(id: string | undefined) {
  return useQuery<EleveDetail, Error, FinanceResume | undefined>({
    queryKey: eleveKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await eleveApi.getById(id!);
      const eleve = unwrapEleve(res);
      if (!eleve) throw new Error('Élève introuvable');
      return eleve;
    },
    enabled: !!id,
    staleTime: 30_000,
    select: (eleve) => eleve._finance,
  });
}

/**
 * Aplatit toutes les échéances de tous les assignments.
 * Chaque échéance est enrichie du plan et de l'assignment.
 */
export function useEleveEcheances(id: string | undefined) {
  return useQuery<
    EleveDetail,
    Error,
    Array<
      EcheanceDetail & {
        assignmentId: string;
        planId?: string;
        planNom?: string;
        classeNom?: string | null;
      }
    >
  >({
    queryKey: eleveKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await eleveApi.getById(id!);
      const eleve = unwrapEleve(res);
      if (!eleve) throw new Error('Élève introuvable');
      return eleve;
    },
    enabled: !!id,
    staleTime: 30_000,
    select: (eleve) => {
      const out: Array<
        EcheanceDetail & {
          assignmentId: string;
          planId?: string;
          planNom?: string;
          classeNom?: string | null;
        }
      > = [];
      for (const a of eleve.assignmentsScolarite ?? []) {
        for (const e of a.planScolarite?.echeances ?? []) {
          out.push({
            ...e,
            assignmentId: a.id,
            planId: a.planScolarite?.id,
            planNom: a.planScolarite?.nom,
            classeNom: a.classe?.nom ?? null,
          });
        }
      }
      return out;
    },
  });
}

/** Emploi du temps de la classe active. */
export function useEleveEmploiTemps(id: string | undefined) {
  return useQuery<EleveDetail, Error, EmploiTempsResume[]>({
    queryKey: eleveKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await eleveApi.getById(id!);
      const eleve = unwrapEleve(res);
      if (!eleve) throw new Error('Élève introuvable');
      return eleve;
    },
    enabled: !!id,
    staleTime: 30_000,
    select: (eleve) => eleve.emploiTemps ?? [],
  });
}

/** Équipe pédagogique (enseignants) de la classe active. */
export function useEleveEquipePedagogique(id: string | undefined) {
  return useQuery<EleveDetail, Error, AffectationEnseignantResume[]>({
    queryKey: eleveKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await eleveApi.getById(id!);
      const eleve = unwrapEleve(res);
      if (!eleve) throw new Error('Élève introuvable');
      return eleve;
    },
    enabled: !!id,
    staleTime: 30_000,
    select: (eleve) => eleve.equipePedagogique ?? [],
  });
}

/**
 * Compteurs dérivés (finance + stats) pour les cartes du dashboard élève.
 */
export function useEleveDashboardStats(id: string | undefined) {
  const q = useEleve(id);
  return useMemo(
    () => ({
      ...q,
      finance: q.data?._finance,
      stats: q.data?._stats,
    }),
    [q]
  );
}

/**
 * Petit hook pratique pour savoir en un coup d'œil si l'élève a du retard
 * ou des échéances en attente. Utile dans les listes / badges.
 */
export function useEleveFinanceFlags(id: string | undefined) {
  const { data, isLoading, isError } = useEleveFinance(id);
  return useMemo(
    () => ({
      isLoading,
      isError,
      estAJour: data?.estAJour ?? true,
      estEnRetard: data?.estEnRetard ?? false,
      totalRetard: data?.totalRetard ?? 0,
      totalRestant: data?.totalRestant ?? 0,
      nombreEcheancesRetard: data?.nombreEcheancesRetard ?? 0,
      prochaineEcheance: data?.prochainesEcheances?.[0] ?? null,
    }),
    [data, isLoading, isError]
  );
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

      invalidateAllEleveRelated(qc);

      if (eleve) {
        qc.setQueryData(eleveKeys.detail(eleve.id), eleve);
        toast.success(`Élève créé : ${eleve.prenom} ${eleve.nom}`);
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
 * - Si `payload.classeId` est fourni → réinscription automatique.
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

      invalidateAllEleveRelated(qc, v.id);

      if (eleve) {
        qc.setQueryData(eleveKeys.detail(v.id), eleve);
      }

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
      invalidateAllEleveRelated(qc, id);
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
      invalidateAllEleveRelated(qc);
      toast.success('Élève supprimé définitivement');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}