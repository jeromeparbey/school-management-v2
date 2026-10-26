// frontend2/src/api/periode.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  Periode,
  CreatePeriodePayload,
  UpdatePeriodePayload,
  ListPeriodesParams,
  ListPeriodesResult,
  DeletePeriodeResult,
} from '../types/periode.types';

// ============================================
// SERVICE PÉRIODE — 1 fonction = 1 route backend
// ============================================

export const periodeApi = {
  /** GET /periodes — 🔒 Liste paginée + filtres */
  list: (params?: ListPeriodesParams) =>
    apiClient
      .get<ApiResponse<ListPeriodesResult>>('/periodes', { params })
      .then((r) => r.data),

  /** GET /periodes/:id — 🔒 Détail */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Periode>>(`/periodes/${id}`)
      .then((r) => r.data),

  /** POST /periodes — 🔒 Création */
  create: (payload: CreatePeriodePayload) =>
    apiClient
      .post<ApiResponse<Periode>>('/periodes', payload)
      .then((r) => r.data),

  /** PUT /periodes/:id — 🔒 Mise à jour */
  update: (id: string, payload: UpdatePeriodePayload) =>
    apiClient
      .put<ApiResponse<Periode>>(`/periodes/${id}`, payload)
      .then((r) => r.data),

  /** DELETE /periodes/:id — 🔒 Suppression définitive */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeletePeriodeResult>>(`/periodes/${id}`)
      .then((r) => r.data),
};