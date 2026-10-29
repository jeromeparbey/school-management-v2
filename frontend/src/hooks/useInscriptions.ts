// frontend2/src/hooks/useInscriptions.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { inscriptionApi } from '../api/inscription.api';
import { useToast } from '../context/ToastContext';
import type {
  ListInscriptionsParams,
  CreateInscriptionPayload,
  UpdateInscriptionPayload,
  InscriptionsListResult,
  Inscription,
  PreviewInscriptionResult,
  InscrireEtPayerPayload,
  InscrireEtPayerResult,
} from '../types/inscription.types';

// ═══════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════

export const inscriptionKeys = {
  all: ['inscriptions'] as const,
  lists: () => [...inscriptionKeys.all, 'list'] as const,
  list: (params?: ListInscriptionsParams) =>
    [...inscriptionKeys.lists(), params ?? {}] as const,
  details: () => [...inscriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...inscriptionKeys.details(), id] as const,
  previews: () => [...inscriptionKeys.all, 'preview'] as const,
  preview: (params: {
    eleveId: string;
    classeId: string;
    anneeScolaireId: string;
  }) => [...inscriptionKeys.previews(), params] as const,
};

// ═══════════════════════════════════════════════════════════
// NORMALISATION — 5 formats possibles
// ═══════════════════════════════════════════════════════════

/**
 * Normalise une réponse liste en { inscriptions, pagination }.
 *
 * Formats gérés :
 *  0. `[Inscription, ...]`                              (tableau direct)
 *  1. `{ data: { data: [], pagination } }`              (double wrapping)
 *  2. `{ data: [], pagination }`                        ← backend actuel
 *  3. `{ data: { inscriptions: [], pagination } }`      (objet nommé)
 *  4. `{ inscriptions: [], pagination }`                (sans "data")
 */
function normalizeListResponse(res: any): InscriptionsListResult {
  // Cas 0 : tableau direct
  if (Array.isArray(res)) {
    return {
      inscriptions: res,
      pagination: {
        page: 1,
        limit: 50,
        total: res.length,
        totalPages: 1,
      },
    };
  }

  // Cas 1 : double wrapping
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      inscriptions: res.data.data,
      pagination: res.data.pagination ?? {
        page: 1,
        limit: 50,
        total: res.data.data.length,
        totalPages: 1,
      },
    };
  }

  // Cas 2 : simple wrapping (backend actuel)
  if (Array.isArray(res?.data)) {
    return {
      inscriptions: res.data,
      pagination: res.pagination ?? {
        page: 1,
        limit: 50,
        total: res.data.length,
        totalPages: 1,
      },
    };
  }

  // Cas 3 : { data: { inscriptions: [], pagination } }
  if (Array.isArray(res?.data?.inscriptions)) {
    return {
      inscriptions: res.data.inscriptions,
      pagination: res.data.pagination ?? {
        page: 1,
        limit: 50,
        total: res.data.inscriptions.length,
        totalPages: 1,
      },
    };
  }

  // Cas 4 : { inscriptions: [], pagination }
  if (Array.isArray(res?.inscriptions)) {
    return {
      inscriptions: res.inscriptions,
      pagination: res.pagination ?? {
        page: 1,
        limit: 50,
        total: res.inscriptions.length,
        totalPages: 1,
      },
    };
  }

  // Fallback
  return {
    inscriptions: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

// ═══════════════════════════════════════════════════════════
// UNWRAP HELPERS
// ═══════════════════════════════════════════════════════════

function unwrapInscription(res: any): Inscription | null {
  if (!res) return null;
  if (res.data?.data?.id) return res.data.data as Inscription;
  if (res.data?.id) return res.data as Inscription;
  if (res.id) return res as Inscription;
  return null;
}

function unwrapPreview(res: any): PreviewInscriptionResult | null {
  if (!res) return null;
  if (res.data?.eleve && res.data?.classe) return res.data;
  if (res.eleve && res.classe) return res as PreviewInscriptionResult;
  return null;
}

function unwrapInscrireEtPayer(res: any): InscrireEtPayerResult | null {
  if (!res) return null;
  if (res.data?.inscription && res.data?.paiement) return res.data;
  if (res.inscription && res.paiement) return res as InscrireEtPayerResult;
  return null;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const e = err as any;
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

function formatMoney(n: number | null | undefined): string {
  if (n == null) return '0 F CFA';
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' F CFA';
}

// ═══════════════════════════════════════════════════════════
// LOG HELPERS
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
  const e = err as any;
  const status = e?.response?.status;
  const message = e?.response?.data?.message ?? e?.message ?? fallback;

  console.error(
    `%c❌ [${hook}] ${ts} → Erreur`,
    'color:#dc2626;font-weight:bold'
  );
  console.error('   Status:', status ?? 'NETWORK ERROR');
  console.error('   Message:', message);

  if (status === 400) console.error('   💡 400 : Query/body invalide');
  else if (status === 401) console.error('   💡 401 : Token manquant/expiré');
  else if (status === 403) console.error('   💡 403 : Rôle non autorisé');
  else if (status === 404) console.error('   💡 404 : Route introuvable');
  else if (status === 409) console.error('   💡 409 : Doublon / capacité');
  else if (status === 500) console.error('   💡 500 : Erreur backend');
};

// ═══════════════════════════════════════════════════════════
// HOOKS DE LECTURE
// ═══════════════════════════════════════════════════════════

/**
 * Liste paginée des inscriptions.
 */
export function useInscriptions(params?: ListInscriptionsParams) {
  return useQuery<InscriptionsListResult>({
    queryKey: inscriptionKeys.list(params),
    queryFn: async () => {
      logStart('useInscriptions', { params });
      try {
        const res = await inscriptionApi.list(params);
        const normalized = normalizeListResponse(res);

        logSuccess('useInscriptions', {
          total: normalized.pagination.total,
          items: normalized.inscriptions.length,
        });

        return normalized;
      } catch (err) {
        logError('useInscriptions', err, 'Échec du chargement');
        throw err;
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Détail d'une inscription (avec plan + paiements + résumé).
 */
export function useInscription(id: string | undefined) {
  return useQuery<Inscription>({
    queryKey: inscriptionKeys.detail(id ?? ''),
    queryFn: async () => {
      logStart('useInscription', { id });
      try {
        const res = await inscriptionApi.getById(id!);
        const inscription = unwrapInscription(res);
        if (!inscription) throw new Error('Inscription introuvable');

        logSuccess('useInscription', {
          id: inscription.id,
          eleve: `${inscription.eleve?.prenom ?? ''} ${
            inscription.eleve?.nom ?? ''
          }`.trim(),
        });

        return inscription;
      } catch (err) {
        logError('useInscription', err, 'Échec chargement inscription');
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

/**
 * Aperçu avant inscription : élève, classe (capacité), plan, résumé financier.
 */
export function usePreviewInscription(
  params: {
    eleveId: string;
    classeId: string;
    anneeScolaireId: string;
  },
  options?: { enabled?: boolean }
) {
  const enabled =
    options?.enabled !== false &&
    !!params.eleveId &&
    !!params.classeId &&
    !!params.anneeScolaireId;

  return useQuery<PreviewInscriptionResult>({
    queryKey: inscriptionKeys.preview(params),
    queryFn: async () => {
      logStart('usePreviewInscription', { params });
      try {
        const res = await inscriptionApi.preview(params);
        const preview = unwrapPreview(res);
        if (!preview) throw new Error('Aperçu inscription invalide');

        logSuccess('usePreviewInscription', {
          eleve: `${preview.eleve?.prenom ?? ''} ${
            preview.eleve?.nom ?? ''
          }`.trim(),
          placesRestantes: preview.classe.placesRestantes,
          dejaInscrit: preview.dejaInscrit,
          plan: preview.planScolarite?.nom,
        });

        return preview;
      } catch (err) {
        logError('usePreviewInscription', err, 'Échec de l’aperçu');
        throw err;
      }
    },
    enabled,
    staleTime: 30_000,
  });
}

// ═══════════════════════════════════════════════════════════
// HOOKS DE MUTATION
// ═══════════════════════════════════════════════════════════

/**
 * Création simple (sans paiement).
 */
export function useCreateInscription() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: CreateInscriptionPayload) => {
      logStart('useCreateInscription', {
        eleveId: payload.eleveId,
        classeId: payload.classeId,
      });
      return inscriptionApi.create(payload);
    },
    onSuccess: (res) => {
      const inscription = unwrapInscription(res);
      logSuccess('useCreateInscription', { id: inscription?.id });

      // Invalider les caches
      qc.invalidateQueries({ queryKey: inscriptionKeys.lists() });
      qc.invalidateQueries({ queryKey: ['echeances'] });
      qc.invalidateQueries({ queryKey: ['eleves'] });

      if (inscription) {
        qc.setQueryData(inscriptionKeys.detail(inscription.id), inscription);
        toast.success(
          `Inscription créée : ${inscription.eleve?.prenom ?? ''} ${
            inscription.eleve?.nom ?? ''
          } → ${inscription.classe?.nom ?? ''}`.trim()
        );
      } else {
        toast.success('Inscription créée');
      }
    },
    onError: (err) => {
      logError('useCreateInscription', err, "Échec de l'inscription");
      toast.error(getErrorMessage(err, "Échec de l'inscription"));
    },
  });
}

/**
 * Inscription + paiement atomique.
 * Crée l'inscription, l'assignment de scolarité et le paiement en une transaction.
 */
export function useInscrireEtPayer() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation<InscrireEtPayerResult, any, InscrireEtPayerPayload>({
    mutationFn: async (payload) => {
      logStart('useInscrireEtPayer', {
        eleveId: payload.eleveId,
        classeId: payload.classeId,
        montant: payload.montantPaiement,
        allocations: payload.allocations?.length ?? 0,
      });

      const res = await inscriptionApi.inscrireEtPayer(payload);
      const result = unwrapInscrireEtPayer(res);
      if (!result) {
        throw new Error('Réponse inscription + paiement invalide');
      }

      return result;
    },
    onSuccess: (result) => {
      logSuccess('useInscrireEtPayer', {
        inscriptionId: result.inscription?.id,
        paiementRef: result.paiement?.reference,
        montant: result.paiement?.montant,
        tauxPaiement: result.resumeFinancier?.tauxPaiement,
      });

      // Invalider tous les caches concernés
      qc.invalidateQueries({ queryKey: inscriptionKeys.lists() });
      qc.invalidateQueries({ queryKey: ['paiements'] });
      qc.invalidateQueries({ queryKey: ['echeances'] });
      qc.invalidateQueries({ queryKey: ['eleves'] });
      qc.invalidateQueries({ queryKey: ['assignments'] });

      // Mettre en cache le détail
      if (result.inscription?.id) {
        qc.setQueryData(
          inscriptionKeys.detail(result.inscription.id),
          result.inscription
        );
      }

      // Toast détaillé
      const montant = result.paiement?.montant ?? 0;
      const restant = result.resumeFinancier?.restant ?? 0;
      const eleveNom = `${result.inscription?.eleve?.prenom ?? ''} ${
        result.inscription?.eleve?.nom ?? ''
      }`.trim();

      toast.success(
        `Inscription + paiement : ${eleveNom} — ${formatMoney(
          montant
        )} payé, reste ${formatMoney(restant)}`
      );
    },
    onError: (err) => {
      logError('useInscrireEtPayer', err, "Échec inscription + paiement");
      toast.error(getErrorMessage(err, "Échec inscription + paiement"));
    },
  });
}

/**
 * Mise à jour d'une inscription.
 */
export function useUpdateInscription() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateInscriptionPayload;
    }) => {
      logStart('useUpdateInscription', {
        id,
        champsModifies: Object.keys(payload),
      });
      return inscriptionApi.update(id, payload);
    },
    onSuccess: (_r, v) => {
      logSuccess('useUpdateInscription', { id: v.id });
      qc.invalidateQueries({ queryKey: inscriptionKeys.lists() });
      qc.invalidateQueries({ queryKey: inscriptionKeys.detail(v.id) });
      toast.success('Inscription mise à jour');
    },
    onError: (err) => {
      logError('useUpdateInscription', err, 'Échec de la mise à jour');
      toast.error(getErrorMessage(err, 'Échec de la mise à jour'));
    },
  });
}

/**
 * Désactivation (soft delete).
 */
export function useSoftDeleteInscription() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => {
      logStart('useSoftDeleteInscription', { id });
      return inscriptionApi.softDelete(id);
    },
    onSuccess: (_r, id) => {
      logSuccess('useSoftDeleteInscription', { id });
      qc.invalidateQueries({ queryKey: inscriptionKeys.lists() });
      qc.invalidateQueries({ queryKey: inscriptionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ['eleves'] });
      toast.success('Inscription désactivée');
    },
    onError: (err) => {
      logError('useSoftDeleteInscription', err, 'Échec');
      toast.error(getErrorMessage(err, 'Échec'));
    },
  });
}

/**
 * Suppression définitive.
 */
export function useHardDeleteInscription() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => {
      logStart('useHardDeleteInscription', { id });
      return inscriptionApi.hardDelete(id);
    },
    onSuccess: (_r, id) => {
      logSuccess('useHardDeleteInscription', { id });
      qc.removeQueries({ queryKey: inscriptionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: inscriptionKeys.lists() });
      qc.invalidateQueries({ queryKey: ['eleves'] });
      toast.success('Inscription supprimée définitivement');
    },
    onError: (err) => {
      logError('useHardDeleteInscription', err, 'Échec');
      toast.error(getErrorMessage(err, 'Échec'));
    },
  });
}