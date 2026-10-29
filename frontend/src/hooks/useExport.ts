// frontend2/src/hooks/useExport.ts

import { useMutation } from '@tanstack/react-query';
import { exportApi, type ExportElevesParams } from '../api/export.api';
import { useToast } from '../context/ToastContext';

// ─── Helper téléchargement ───
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const e = err as any;
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

// ═══════════════════════════════════════════════════════════
// EXPORT ÉLÈVES — XLSX (avec vraies données)
// ═══════════════════════════════════════════════════════════

export function useExportElevesXlsx() {
  const toast = useToast();

  return useMutation<Blob, unknown, ExportElevesParams | undefined>({
    mutationFn: (params) => exportApi.exportElevesXlsx(params),
    onSuccess: (blob) => {
      downloadBlob(blob, `eleves-export-${today()}.xlsx`);
      toast.success('✅ Export Excel téléchargé');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Échec de l'export Excel"));
    },
  });
}

// ═══════════════════════════════════════════════════════════
// EXPORT ÉLÈVES — CSV
// ═══════════════════════════════════════════════════════════

export function useExportElevesCsv() {
  const toast = useToast();

  return useMutation<Blob, unknown, ExportElevesParams | undefined>({
    mutationFn: (params) => exportApi.exportElevesCsv(params),
    onSuccess: (blob) => {
      downloadBlob(blob, `eleves-export-${today()}.csv`);
      toast.success('✅ Export CSV téléchargé');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, "Échec de l'export CSV"));
    },
  });
}