// frontend2/src/api/export.api.ts

import { apiClient } from './auth.api';

export interface ExportElevesParams {
  classeId?: string;
  anneeScolaireId?: string;
  inclureArchives?: boolean;
  lignesVides?: number;
  limite?: number;
}

export const exportApi = {
  /** Télécharge un fichier Excel (.xlsx) avec les élèves */
  exportElevesXlsx: (params?: ExportElevesParams) =>
    apiClient
      .get('/import/export/eleves.xlsx', {
        params,
        responseType: 'blob',
        timeout: 120_000,
      })
      .then((r) => r.data as Blob),

  /** Télécharge un fichier CSV avec les élèves */
  exportElevesCsv: (params?: ExportElevesParams) =>
    apiClient
      .get('/import/export/eleves.csv', {
        params,
        responseType: 'blob',
        timeout: 120_000,
      })
      .then((r) => r.data as Blob),
};