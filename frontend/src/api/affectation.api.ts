// frontend2/src/api/affectation.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  Affectation,
  CreateAffectationPayload,
  UpdateAffectationPayload,
  ListAffectationsParams,
  ListAffectationsResult,
  AffectationsByEnseignantResult,
  AffectationsByClasseResult,
  DeleteAffectationResult,
} from '../types/affectation.types';

// ============================================
// SERVICE AFFECTATION — 1 fonction = 1 route backend
// ============================================
export const affectationApi = {
  /** GET /affectations — 🔒 Liste paginée + filtres */
  list: (params?: ListAffectationsParams) =>
    apiClient
      .get<ApiResponse<ListAffectationsResult>>('/affectations', { params })
      .then((r) => r.data),

  /** GET /affectations/by-enseignant/:enseignantId — 🔒 Affectations d'un enseignant */
  listByEnseignant: (enseignantId: string, anneeScolaireId?: string) =>
    apiClient
      .get<ApiResponse<AffectationsByEnseignantResult>>(
        `/affectations/by-enseignant/${enseignantId}`,
        { params: anneeScolaireId ? { anneeScolaireId } : undefined }
      )
      .then((r) => r.data),

  /** GET /affectations/by-classe/:classeId — 🔒 Affectations d'une classe */
  listByClasse: (classeId: string) =>
    apiClient
      .get<ApiResponse<AffectationsByClasseResult>>(
        `/affectations/by-classe/${classeId}`
      )
      .then((r) => r.data),

  /** GET /affectations/:id — 🔒 Détail */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Affectation>>(`/affectations/${id}`)
      .then((r) => r.data),

  /** POST /affectations — 🔒 Création */
  create: (payload: CreateAffectationPayload) =>
    apiClient
      .post<ApiResponse<Affectation>>('/affectations', payload)
      .then((r) => r.data),

  /** PUT /affectations/:id — 🔒 Mise à jour */
  update: (id: string, payload: UpdateAffectationPayload) =>
    apiClient
      .put<ApiResponse<Affectation>>(`/affectations/${id}`, payload)
      .then((r) => r.data),

  /** DELETE /affectations/:id — 🔒 Soft delete (désactivation) */
  softDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteAffectationResult>>(`/affectations/${id}`)
      .then((r) => r.data),

  /** DELETE /affectations/:id/hard — 🔒 Hard delete (définitif) */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteAffectationResult>>(
        `/affectations/${id}/hard`
      )
      .then((r) => r.data),
};