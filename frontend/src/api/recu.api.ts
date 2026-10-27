// frontend2/src/api/recu.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  Recu,
  GenererRecuPayload,
  ListRecusParams,
  ListRecusResult,
  RecusByEleveResult,
  VerificationRecuResult,
  DeleteRecuResult,
  FormatImpression,
} from '../types/recu.types';

// ============================================
// SERVICE REÇU — 1 fonction = 1 route backend
// ============================================

export const recuApi = {
  /** GET /recus — 🔒 Liste paginée + filtres + summary */
  list: (params?: ListRecusParams) =>
    apiClient
      .get<ApiResponse<ListRecusResult>>('/recus', { params })
      .then((r) => r.data),

  /** GET /recus/:id — 🔒 Détail */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Recu>>(`/recus/${id}`)
      .then((r) => r.data),

  /** GET /recus/by-numero/:numero — 🔒 Par numéro */
  getByNumero: (numero: string) =>
    apiClient
      .get<ApiResponse<Recu>>(`/recus/by-numero/${numero}`)
      .then((r) => r.data),

  /** GET /recus/by-eleve/:eleveId — 🔒 Reçus d'un élève */
  listByEleve: (eleveId: string) =>
    apiClient
      .get<ApiResponse<RecusByEleveResult>>(`/recus/by-eleve/${eleveId}`)
      .then((r) => r.data),

  /** POST /recus/generer — 🔒 Génération à partir d'un paiement */
  generer: (payload: GenererRecuPayload) =>
    apiClient
      .post<ApiResponse<Recu>>('/recus/generer', payload)
      .then((r) => r.data),

  /** GET /recus/:id/pdf?format=A4|A5|80MM — 🔒 Téléchargement PDF */
  downloadPDF: (id: string, format: FormatImpression = 'A4') =>
    apiClient
      .get<Blob>(`/recus/${id}/pdf`, {
        params: { format },
        responseType: 'blob',
      })
      .then((r) => r.data),

  /** GET /recus/:id/pdf/preview?format=... — 🔒 Aperçu PDF (sans marquer imprimé) */
  previewPDF: (id: string, format: FormatImpression = 'A4') =>
    apiClient
      .get<Blob>(`/recus/${id}/pdf/preview`, {
        params: { format },
        responseType: 'blob',
      })
      .then((r) => r.data),

  /** GET /recus/verifier/:code?schema=... — 🌐 PUBLIC */
  verifier: (code: string, schema: string) =>
    apiClient
      .get<ApiResponse<VerificationRecuResult>>(
        `/recus/verifier/${code}`,
        { params: { schema } }
      )
      .then((r) => r.data),

  /** DELETE /recus/:id/hard — 🔒 Suppression définitive */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteRecuResult>>(`/recus/${id}/hard`)
      .then((r) => r.data),
};

// ============================================
// HELPER : Téléchargement de PDF (blob)
// ============================================

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}