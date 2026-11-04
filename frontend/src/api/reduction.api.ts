// frontend2/src/api/reduction.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  Reduction,
  CreateReductionPayload,
  UpdateReductionPayload,
  ListReductionsParams,
  ListReductionsResult,
  ReductionStats,
  ReductionsByEleveResult,
  DeleteReductionResult,
} from '../types/reduction.types';

// ============================================
// SERVICE REDUCTION — 1 fonction = 1 route backend
// ============================================

export const reductionApi = {
  /** GET /reductions — 🔒 Liste paginée + filtres */
  list: (params?: ListReductionsParams) =>
    apiClient
      .get<ApiResponse<ListReductionsResult>>('/reductions', { params })
      .then((r) => r.data),

  /** GET /reductions/stats — 🔒 Statistiques globales */
  stats: (params?: { dateDebut?: string; dateFin?: string }) =>
    apiClient
      .get<ApiResponse<ReductionStats>>('/reductions/stats', { params })
      .then((r) => r.data),

  /** GET /reductions/by-eleve/:eleveId — 🔒 Réductions d'un élève */
  listByEleve: (eleveId: string) =>
    apiClient
      .get<ApiResponse<ReductionsByEleveResult>>(
        `/reductions/by-eleve/${eleveId}`
      )
      .then((r) => r.data),

  /** GET /reductions/:id — 🔒 Détail d'une réduction */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Reduction>>(`/reductions/${id}`)
      .then((r) => r.data),

  /** POST /reductions — 🔒 Création */
  create: (payload: CreateReductionPayload) =>
    apiClient
      .post<ApiResponse<Reduction>>('/reductions', payload)
      .then((r) => r.data),

  /** PUT /reductions/:id — 🔒 Mise à jour */
  update: (id: string, payload: UpdateReductionPayload) =>
    apiClient
      .put<ApiResponse<Reduction>>(`/reductions/${id}`, payload)
      .then((r) => r.data),

  /** DELETE /reductions/:id/hard — 🔒 Suppression définitive */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteReductionResult>>(`/reductions/${id}/hard`)
      .then((r) => r.data),
};