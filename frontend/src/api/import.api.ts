// frontend2/src/api/import.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  ImportElevesPayload,
  ImportResult,
} from '../types/import.types';

export const importApi = {
  /** POST /import/eleves — Import complet d'élèves */
  importEleves: (payload: ImportElevesPayload) =>
    apiClient
      .post<ApiResponse<ImportResult>>('/import/eleves', payload, {
        timeout: 300_000, // 5 min (gros fichiers)
      })
      .then((r) => r.data),

  /** GET /import/template — Téléchargement du CSV modèle */
  downloadTemplate: () =>
    apiClient
      .get('/import/template', { responseType: 'blob' })
      .then((r) => r.data as Blob),
};