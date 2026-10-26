// frontend2/src/api/niveau.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  Niveau,
  CreateNiveauPayload,
  UpdateNiveauPayload,
  ListNiveauxParams,
  ListNiveauxResult,
  DeleteNiveauResult,
} from '../types/niveau.types';

// ============================================
// SERVICE NIVEAU — 1 fonction = 1 route backend
// ============================================
export const niveauApi = {
  /** GET /niveaux — 🔒 Liste paginée + recherche */
  list: (params?: ListNiveauxParams) =>
    apiClient
      .get<ApiResponse<ListNiveauxResult>>('/niveaux', { params })
      .then((r) => r.data),

  /** GET /niveaux/:id — 🔒 Détail (avec classes et matières) */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Niveau>>(`/niveaux/${id}`)
      .then((r) => r.data),

  /** POST /niveaux — 🔒 Création */
  create: (payload: CreateNiveauPayload) =>
    apiClient
      .post<ApiResponse<Niveau>>('/niveaux', payload)
      .then((r) => r.data),

  /** PUT /niveaux/:id — 🔒 Mise à jour */
  update: (id: string, payload: UpdateNiveauPayload) =>
    apiClient
      .put<ApiResponse<Niveau>>(`/niveaux/${id}`, payload)
      .then((r) => r.data),

  /** DELETE /niveaux/:id — 🔒 Suppression définitive (si non référencé) */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteNiveauResult>>(`/niveaux/${id}`)
      .then((r) => r.data),
};