// frontend2/src/api/echeance.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  Echeance,
  CreateEcheancePayload,
  UpdateEcheancePayload,
  ListEcheancesParams,
  ListEcheancesResult,
  EcheancesByPlanResult,
  DeleteEcheanceResult,
} from '../types/echeance.types';

// ============================================
// SERVICE ÉCHÉANCE — 1 fonction = 1 route backend
// ============================================

export const echeanceApi = {
  /** GET /echeances — 🔒 Liste paginée + filtres */
  list: (params?: ListEcheancesParams) =>
    apiClient
      .get<ApiResponse<ListEcheancesResult>>('/echeances', { params })
      .then((r) => r.data),

  /** GET /echeances/by-plan/:planScolariteId — 🔒 Échéances + stats d'un plan */
  listByPlan: (planScolariteId: string) =>
    apiClient
      .get<ApiResponse<EcheancesByPlanResult>>(
        `/echeances/by-plan/${planScolariteId}`
      )
      .then((r) => r.data),

  /** GET /echeances/:id — 🔒 Détail */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Echeance>>(`/echeances/${id}`)
      .then((r) => r.data),

  /** POST /echeances — 🔒 Création */
  create: (payload: CreateEcheancePayload) =>
    apiClient
      .post<ApiResponse<Echeance>>('/echeances', payload)
      .then((r) => r.data),

  /** PUT /echeances/:id — 🔒 Mise à jour */
  update: (id: string, payload: UpdateEcheancePayload) =>
    apiClient
      .put<ApiResponse<Echeance>>(`/echeances/${id}`, payload)
      .then((r) => r.data),

  /** DELETE /echeances/:id — 🔒 Suppression définitive */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteEcheanceResult>>(`/echeances/${id}`)
      .then((r) => r.data),
};