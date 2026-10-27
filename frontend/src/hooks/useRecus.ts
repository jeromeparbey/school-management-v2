// frontend2/src/hooks/useRecus.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { recuApi, downloadBlob } from '../api/recu.api';
import { useToast } from '../context/ToastContext';
import type {
  ListRecusParams,
  GenererRecuPayload,
  RecusListResult,
  Recu,
  RecusByEleveResult,
  VerificationRecuResult,
  FormatImpression,
} from '../types/recu.types';

// ──────────────────────────────────────────
// QUERY KEYS
// ──────────────────────────────────────────

export const recuKeys = {
  all: ['recus'] as const,
  lists: () => [...recuKeys.all, 'list'] as const,
  list: (params?: ListRecusParams) =>
    [...recuKeys.lists(), params ?? {}] as const,
  details: () => [...recuKeys.all, 'detail'] as const,
  detail: (id: string) => [...recuKeys.details(), id] as const,
  byNumero: (numero: string) =>
    [...recuKeys.all, 'by-numero', numero] as const,
  byEleve: (eleveId: string) =>
    [...recuKeys.all, 'by-eleve', eleveId] as const,
  verifier: (code: string, schema: string) =>
    [...recuKeys.all, 'verifier', code, schema] as const,
};

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

function normalize(res: any): RecusListResult {
  if (res?.data && Array.isArray(res.data.data)) {
    return {
      recus: res.data.data,
      pagination:
        res.data.pagination ??
        { page: 1, limit: 50, total: res.data.data.length, totalPages: 1 },
      summary: res.data.summary ?? { totalMontant: 0 },
    };
  }
  if (Array.isArray(res?.data)) {
    return {
      recus: res.data,
      pagination:
        res.pagination ??
        { page: 1, limit: 50, total: res.data.length, totalPages: 1 },
      summary: res.summary ?? { totalMontant: 0 },
    };
  }
  return {
    recus: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
    summary: { totalMontant: 0 },
  };
}

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const e = err as any;
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

function unwrapRecu(res: any): Recu | null {
  if (res?.data?.data) return res.data.data as Recu;
  if (res?.data && typeof res.data === 'object' && 'id' in res.data) {
    return res.data as Recu;
  }
  return null;
}

// ──────────────────────────────────────────
// HOOKS DE LECTURE
// ──────────────────────────────────────────

export function useRecus(params?: ListRecusParams) {
  return useQuery<RecusListResult>({
    queryKey: recuKeys.list(params),
    queryFn: async () => normalize(await recuApi.list(params)),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useRecu(id: string | undefined) {
  return useQuery<Recu>({
    queryKey: recuKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await recuApi.getById(id!);
      const recu = unwrapRecu(res);
      if (!recu) throw new Error('Reçu introuvable dans la réponse');
      return recu;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useRecuByNumero(numero: string | undefined) {
  return useQuery<Recu>({
    queryKey: recuKeys.byNumero(numero ?? ''),
    queryFn: async () => {
      const res = await recuApi.getByNumero(numero!);
      const recu = unwrapRecu(res);
      if (!recu) throw new Error('Reçu introuvable dans la réponse');
      return recu;
    },
    enabled: !!numero,
    staleTime: 30_000,
  });
}

export function useRecusByEleve(eleveId: string | undefined) {
  return useQuery<RecusByEleveResult>({
    queryKey: recuKeys.byEleve(eleveId ?? ''),
    queryFn: async () => {
      const res = await recuApi.listByEleve(eleveId!);
      const any = res as any;
      // Backend renvoie un tableau direct ou { data: [...] }
      const list = Array.isArray(any?.data)
        ? any.data
        : Array.isArray(any?.data?.recus)
        ? any.data.recus
        : Array.isArray(any)
        ? any
        : [];
      return { recus: list };
    },
    enabled: !!eleveId,
    staleTime: 30_000,
  });
}

export function useVerifierRecu(
  code: string | undefined,
  schema: string | undefined
) {
  return useQuery<VerificationRecuResult>({
    queryKey: recuKeys.verifier(code ?? '', schema ?? ''),
    queryFn: async () => {
      const res = await recuApi.verifier(code!, schema!);
      const any = res as any;
      return (
        any?.data ?? {
          valide: false,
          message: 'Aucun reçu trouvé',
        }
      );
    },
    enabled: !!code && !!schema,
    staleTime: 5 * 60_000, // vérification = données quasi statiques
    retry: false,
  });
}

// ──────────────────────────────────────────
// CREATE (génération)
// ──────────────────────────────────────────

export function useGenererRecu() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: GenererRecuPayload) => recuApi.generer(payload),
    onSuccess: (res) => {
      const recu = unwrapRecu(res);

      qc.invalidateQueries({ queryKey: recuKeys.lists() });
      qc.invalidateQueries({ queryKey: recuKeys.all });

      if (recu) {
        qc.setQueryData(recuKeys.detail(recu.id), recu);
        qc.invalidateQueries({
          queryKey: recuKeys.byEleve(recu.eleveId),
        });
        toast.success(`Reçu généré : ${recu.numeroRecu}`);
      } else {
        toast.success('Reçu généré');
      }
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, 'Échec de la génération du reçu')),
  });
}

// ──────────────────────────────────────────
// PDF (téléchargement / aperçu)
// ──────────────────────────────────────────

export function useDownloadRecuPDF() {
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      numeroRecu,
      format = 'A4',
    }: {
      id: string;
      numeroRecu: string;
      format?: FormatImpression;
    }) => {
      const blob = await recuApi.downloadPDF(id, format);
      downloadBlob(blob, `${numeroRecu}-${format}.pdf`);
      return { id, numeroRecu, format };
    },
    onSuccess: ({ numeroRecu, format }) => {
      toast.success(`PDF ${format} téléchargé (${numeroRecu})`);
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, 'Échec du téléchargement du PDF')),
  });
}

export function usePreviewRecuPDF() {
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      format = 'A4',
    }: {
      id: string;
      format?: FormatImpression;
    }) => {
      const blob = await recuApi.previewPDF(id, format);
      const url = URL.createObjectURL(blob);
      // Ouvre dans un nouvel onglet
      window.open(url, '_blank');
      // Libère l'URL après un délai (l'onglet a déjà chargé le blob)
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return { id, format };
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "Échec de l'aperçu du PDF")),
  });
}

// ──────────────────────────────────────────
// HARD DELETE
// ──────────────────────────────────────────

export function useHardDeleteRecu() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => recuApi.hardDelete(id),
    onSuccess: (_r, id) => {
      qc.removeQueries({ queryKey: recuKeys.detail(id) });
      qc.invalidateQueries({ queryKey: recuKeys.lists() });
      qc.invalidateQueries({ queryKey: recuKeys.all });
      toast.success('Reçu supprimé définitivement');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Échec')),
  });
}