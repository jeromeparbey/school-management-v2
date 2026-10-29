// frontend2/src/hooks/useImport.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importApi } from '../api/import.api';
import { useToast } from '../context/ToastContext';
import type {
  ImportElevesPayload,
  ImportResult,
} from '../types/import.types';

export const importKeys = {
  all: ['import'] as const,
  template: () => [...importKeys.all, 'template'] as const,
};

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const e = err as any;
  return (
    e?.response?.data?.message ??
    e?.response?.data?.error ??
    e?.message ??
    fallback
  );
}

// ──────────────────────────────────────────
// MUTATION — Import élèves
// ──────────────────────────────────────────

export function useImportEleves() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation<ImportResult, unknown, ImportElevesPayload>({
    mutationFn: async (payload) => {
      const res = await importApi.importEleves(payload);
      const data = (res as any)?.data ?? res;
      if (!data) throw new Error('Réponse vide du serveur');
      return data as ImportResult;
    },
    onSuccess: (result) => {
      // Invalider les caches concernés
      qc.invalidateQueries({ queryKey: ['eleves'] });
      qc.invalidateQueries({ queryKey: ['classes'] });
      qc.invalidateQueries({ queryKey: ['inscriptions'] });
      qc.invalidateQueries({ queryKey: ['niveaux'] });
      qc.invalidateQueries({ queryKey: ['annees'] });
      qc.invalidateQueries({ queryKey: ['plans-scolarite'] });
      qc.invalidateQueries({ queryKey: ['responsables'] });

      if (result.erreurs === 0) {
        toast.success(
          `✅ Import terminé : ${result.elevesCrees} élève(s) créé(s)`,
          `Classes : ${result.classesCreees} · Plans : ${result.plansCrees} · Échéances : ${result.echeancesCreees}`
        );
      } else {
        toast.warning(
          `⚠️ Import partiel : ${result.succes}/${result.totalLignes}`,
          `${result.erreurs} ligne(s) en erreur`
        );
      }
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Échec de l'import"));
    },
  });
}

// ──────────────────────────────────────────
// TÉLÉCHARGEMENT DU TEMPLATE
// ──────────────────────────────────────────

export function useDownloadImportTemplate() {
  const toast = useToast();

  return useMutation<Blob, unknown, void>({
    mutationFn: () => importApi.downloadTemplate(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template-import-eleves.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Template téléchargé');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Échec du téléchargement'));
    },
  });
}