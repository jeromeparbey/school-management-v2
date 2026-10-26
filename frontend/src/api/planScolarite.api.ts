// frontend2/src/api/planScolarite.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  PlanScolarite,
  CreatePlanScolaritePayload,
  UpdatePlanScolaritePayload,
  ListPlansScolariteParams,
  ListPlansScolariteResult,
  DeletePlanScolariteResult,
} from '../types/planScolarite.types';

// ============================================
// SERVICE PLAN SCOLARITÉ — 1 fonction = 1 route backend
// ============================================

export const planScolariteApi = {
  /** GET /plans-scolarite — 🔒 Liste paginée + filtres */
  list: (params?: ListPlansScolariteParams) =>
    apiClient
      .get<ApiResponse<ListPlansScolariteResult>>('/plans-scolarite', {
        params,
      })
      .then((r) => r.data),

  /** GET /plans-scolarite/:id — 🔒 Détail (avec échéances) */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<PlanScolarite>>(`/plans-scolarite/${id}`)
      .then((r) => r.data),

  /** POST /plans-scolarite — 🔒 Création */
  create: (payload: CreatePlanScolaritePayload) =>
    apiClient
      .post<ApiResponse<PlanScolarite>>('/plans-scolarite', payload)
      .then((r) => r.data),

  /** PUT /plans-scolarite/:id — 🔒 Mise à jour */
  update: (id: string, payload: UpdatePlanScolaritePayload) =>
    apiClient
      .put<ApiResponse<PlanScolarite>>(`/plans-scolarite/${id}`, payload)
      .then((r) => r.data),

  /** DELETE /plans-scolarite/:id — 🔒 Suppression définitive */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeletePlanScolariteResult>>(
        `/plans-scolarite/${id}`
      )
      .then((r) => r.data),
};