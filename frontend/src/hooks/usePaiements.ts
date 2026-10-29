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

/** 💰 Formate en F CFA (jamais XOF) */
function formatMoney(n: number | null | undefined): string {
  if (n == null) return '0 F CFA';
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' F CFA';
}

/**
 * Normalise une réponse liste qui peut arriver sous 3 formes :
 *  1. { success, data: { data: Paiement[], pagination } }
 *  2. { success, data: Paiement[], pagination }               ← backend actuel
 *  3. { success, data: { paiements: [], pagination } }
 */
function normalizeListResponse(res: any): PaiementsListResult {
  // Cas 1 : double wrapping
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      paiements: res.data.data,
      pagination: res.data.pagination ?? {
        page: 1,
        limit: 50,
        total: res.data.data.length,
        totalPages: 1,
      },
      summary: res.data.summary ?? { totalMontant: 0 },
    };
  }

  // Cas 2 : simple wrapping ← backend actuel
  if (Array.isArray(res?.data)) {
    return {
      paiements: res.data,
      pagination: res.pagination ?? {
        page: 1,
        limit: 50,
        total: res.data.length,
        totalPages: 1,
      },
      summary: res.summary ?? { totalMontant: 0 },
    };
  }

  // Cas 3 : { data: { paiements: [] } }
  if (Array.isArray(res?.data?.paiements)) {
    return {
      paiements: res.data.paiements,
      pagination: res.data.pagination ?? {
        page: 1,
        limit: 50,
        total: res.data.paiements.length,
        totalPages: 1,
      },
      summary: res.data.summary ?? { totalMontant: 0 },
    };
  }

  // Fallback
  return {
    paiements: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
    summary: { totalMontant: 0 },
  };
}

/**
 * Extrait un Paiement depuis une réponse API :
 *  - { data: Paiement }
 *  - { data: { data: Paiement } }
 *  - Paiement direct
 */
function unwrapPaiement(res: any): Paiement | null {
  if (!res) return null;
  if (res.data && res.data.id) return res.data as Paiement;
  if (res.data?.data && res.data.data.id) return res.data.data as Paiement;
  if (res.id) return res as Paiement;
  return null;
}

/**
 * Normalise la réponse de /paiements/by-eleve/:id
 */
function normalizeByEleveResponse(res: any): PaiementsByEleveResult {
  const empty: PaiementsByEleveResult = { paiements: [], total: 0 };

  if (!res) return empty;

  // { data: { paiements, total } }
  if (res.data?.paiements) return res.data;
  // { paiements, total }
  if (res.paiements) return res as PaiementsByEleveResult;
  // { data: [] } (fallback)
  if (Array.isArray(res.data)) {
    return { paiements: res.data, total: 0 };
  }
  return empty;
}

/**
 * Normalise la réponse de /paiements/stats
 */
function normalizeStatsResponse(res: any): PaiementStatsResult {
  const empty: PaiementStatsResult = {
    totalMontant: 0,
    nombrePaiements: 0,
    parMoyen: [],
  };

  if (!res) return empty;
  if (res.data?.totalMontant != null) return res.data;
  if (res.totalMontant != null) return res as PaiementStatsResult;
  return empty;
}

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const e = err as any;
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

// ──────────────────────────────────────────
// LOG HELPERS
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
  else if (status === 404) console.error('   💡 404 : Paiement introuvable');
  else if (status === 409) console.error('   💡 409 : Doublon ou dépendances');
  else if (status === 500) console.error('   💡 500 : Erreur backend');
};

// ──────────────────────────────────────────
// HOOKS DE LECTURE
// ──────────────────────────────────────────

/**
 * Liste paginée des paiements.
 */
export function usePaiements(params?: ListPaiementsParams) {
  return useQuery<PaiementsListResult>({
    queryKey: paiementKeys.list(params),
    queryFn: async () => {
      logStart('usePaiements', { params });
      try {
        const res = await paiementApi.list(params);
        const normalized = normalizeListResponse(res);

        logSuccess('usePaiements', {
          total: normalized.pagination.total,
          items: normalized.paiements.length,
          sample: normalized.paiements[0]?.reference ?? '—',
        });

        return normalized;
      } catch (err) {
        logError('usePaiements', err, 'Échec du chargement');
        throw err;
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Détail d'un paiement (avec résumé des tranches).
 */
export function usePaiement(id: string | undefined) {
  return useQuery<Paiement>({
    queryKey: paiementKeys.detail(id ?? ''),
    queryFn: async () => {
      logStart('usePaiement', { id });
      try {
        const res = await paiementApi.getById(id!);
        const paiement = unwrapPaiement(res);
        if (!paiement) {
          throw new Error('Paiement introuvable dans la réponse');
        }

        logSuccess('usePaiement', {
          reference: paiement.reference,
          montant: paiement.montant,
          allocations: paiement.allocations?.length ?? 0,
        });

        return paiement;
      } catch (err) {
        logError('usePaiement', err, 'Échec chargement paiement');
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

/**
 * Paiements d'un élève.
 */
export function usePaiementsByEleve(eleveId: string | undefined) {
  return useQuery<PaiementsByEleveResult>({
    queryKey: paiementKeys.byEleve(eleveId ?? ''),
    queryFn: async () => {
      logStart('usePaiementsByEleve', { eleveId });
      try {
        const res = await paiementApi.listByEleve(eleveId!);
        const normalized = normalizeByEleveResponse(res);

        logSuccess('usePaiementsByEleve', {
          nombre: normalized.paiements.length,
          total: normalized.total,
        });

        return normalized;
      } catch (err) {
        logError('usePaiementsByEleve', err, 'Échec chargement paiements');
        throw err;
      }
    },
    enabled: !!eleveId,
    staleTime: 30_000,
  });
}

/**
 * Statistiques des paiements.
 */
export function usePaiementStats(params?: {
  dateDebut?: string;
  dateFin?: string;
}) {
  return useQuery<PaiementStatsResult>({
    queryKey: paiementKeys.stats(params),
    queryFn: async () => {
      logStart('usePaiementStats', { params });
      try {
        const res = await paiementApi.stats(params);
        const normalized = normalizeStatsResponse(res);

        logSuccess('usePaiementStats', {
          total: normalized.totalMontant,
          nombre: normalized.nombrePaiements,
        });

        return normalized;
      } catch (err) {
        logError('usePaiementStats', err, 'Échec chargement statistiques');
        throw err;
      }
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
    mutationFn: (payload: CreatePaiementPayload) => {
      logStart('useCreatePaiement', {
        eleveId: payload.eleveId,
        montant: payload.montant,
        moyen: payload.moyen,
        allocations: payload.allocations?.length ?? 0,
      });
      return paiementApi.create(payload);
    },
    onSuccess: (res) => {
      const paiement = unwrapPaiement(res);
      logSuccess('useCreatePaiement', {
        id: paiement?.id,
        reference: paiement?.reference,
        montant: paiement?.montant,
      });

      // Invalider toutes les listes
      qc.invalidateQueries({ queryKey: paiementKeys.lists() });
      qc.invalidateQueries({ queryKey: paiementKeys.all });

      // Invalider les échéances (car estPayee peut avoir changé)
      qc.invalidateQueries({ queryKey: ['echeances'] });

      if (paiement) {
        qc.setQueryData(paiementKeys.detail(paiement.id), paiement);
        qc.invalidateQueries({
          queryKey: paiementKeys.byEleve(paiement.eleveId),
        });
        toast.success(
          `Paiement enregistré : ${paiement.reference} — ${formatMoney(
            paiement.montant
          )}`
        );
      } else {
        toast.success('Paiement enregistré');
      }
    },
    onError: (err) => {
      logError('useCreatePaiement', err, "Échec de l'enregistrement");
      toast.error(getErrorMessage(err, "Échec de l'enregistrement"));
    },
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
    }) => {
      logStart('useUpdatePaiement', {
        id,
        champsModifies: Object.keys(payload),
      });
      return paiementApi.update(id, payload);
    },
    onSuccess: (_res, v) => {
      logSuccess('useUpdatePaiement', { id: v.id });
      qc.invalidateQueries({ queryKey: paiementKeys.lists() });
      qc.invalidateQueries({ queryKey: paiementKeys.detail(v.id) });
      toast.success('Paiement mis à jour');
    },
    onError: (err) => {
      logError('useUpdatePaiement', err, 'Échec de la mise à jour');
      toast.error(getErrorMessage(err, 'Échec de la mise à jour'));
    },
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
    }) => {
      logStart('useAnnulerPaiement', { id, motif: payload.motifAnnulation });
      return paiementApi.annuler(id, payload);
    },
    onSuccess: (res, v) => {
      const paiement = unwrapPaiement(res);
      logSuccess('useAnnulerPaiement', { id: v.id });

      qc.invalidateQueries({ queryKey: paiementKeys.lists() });
      qc.invalidateQueries({ queryKey: paiementKeys.detail(v.id) });
      qc.invalidateQueries({ queryKey: paiementKeys.all });

      // Invalider les échéances (car les estPayee redeviennent false)
      qc.invalidateQueries({ queryKey: ['echeances'] });

      if (paiement) {
        qc.invalidateQueries({
          queryKey: paiementKeys.byEleve(paiement.eleveId),
        });
      }

      toast.success('Paiement annulé');
    },
    onError: (err) => {
      logError('useAnnulerPaiement', err, "Échec de l'annulation");
      toast.error(getErrorMessage(err, "Échec de l'annulation"));
    },
  });
}

// ──────────────────────────────────────────
// HARD DELETE
// ──────────────────────────────────────────

export function useHardDeletePaiement() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => {
      logStart('useHardDeletePaiement', { id });
      return paiementApi.hardDelete(id);
    },
    onSuccess: (_r, id) => {
      logSuccess('useHardDeletePaiement', { id });
      qc.removeQueries({ queryKey: paiementKeys.detail(id) });
      qc.invalidateQueries({ queryKey: paiementKeys.lists() });
      qc.invalidateQueries({ queryKey: paiementKeys.all });
      toast.success('Paiement supprimé définitivement');
    },
    onError: (err) => {
      logError('useHardDeletePaiement', err, 'Échec de la suppression');
      toast.error(getErrorMessage(err, 'Échec de la suppression'));
    },
  });
}