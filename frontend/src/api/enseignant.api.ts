// frontend2/src/api/enseignant.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  Enseignant,
  CreateEnseignantPayload,
  UpdateEnseignantPayload,
  ListEnseignantsParams,
  ListEnseignantsResult,
  DeleteEnseignantResult,
} from '../types/enseignant.types';

export const enseignantApi = {
  /** GET /enseignants */
  list: (params?: ListEnseignantsParams) =>
    apiClient
      .get<ApiResponse<ListEnseignantsResult>>('/enseignants', { params })
      .then((r) => r.data),

  /** GET /enseignants/:id */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Enseignant>>(`/enseignants/${id}`)
      .then((r) => r.data),

  /** POST /enseignants */
  create: (payload: CreateEnseignantPayload) =>
    apiClient
      .post<ApiResponse<Enseignant>>('/enseignants', payload)
      .then((r) => r.data),

  /** PUT /enseignants/:id */
  update: (id: string, payload: UpdateEnseignantPayload) =>
    apiClient
      .put<ApiResponse<Enseignant>>(`/enseignants/${id}`, payload)
      .then((r) => r.data),

  /** DELETE /enseignants/:id (soft) */
  softDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteEnseignantResult>>(`/enseignants/${id}`)
      .then((r) => r.data),

  /** DELETE /enseignants/:id/hard */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteEnseignantResult>>(`/enseignants/${id}/hard`)
      .then((r) => r.data),
};