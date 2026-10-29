// frontend2/src/api/classe.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  Classe,
  CreateClassePayload,
  UpdateClassePayload,
  ListClassesParams,
  ListClassesResult,
  ClasseElevesResult,
  ClasseStatistiquesResult,
  DeleteClasseResult,
} from '../types/classe.types';

// ============================================
// SERVICE CLASSE — 1 fonction = 1 route backend
// ============================================

export const classeApi = {
  /** GET /classes — 🔒 Liste paginée + filtres */
  list: (params?: ListClassesParams) =>
    apiClient
      .get<ApiResponse<ListClassesResult>>('/classes', { params })
      .then((r) => r.data),

  /** GET /classes/by-annee/:anneeScolaireId — 🔒 Classes d'une année */
  listByAnnee: (anneeScolaireId: string) =>
    apiClient
      .get<ApiResponse<Classe[]>>(`/classes/by-annee/${anneeScolaireId}`)
      .then((r) => r.data),

  /** GET /classes/:id — 🔒 Détail (avec emploisTemps + affectations) */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Classe>>(`/classes/${id}`)
      .then((r) => r.data),

  /** GET /classes/:id/eleves — 🔒 Élèves inscrits dans la classe */
  listEleves: (id: string) =>
    apiClient
      .get<ApiResponse<ClasseElevesResult>>(`/classes/${id}/eleves`)
      .then((r) => r.data),

  /** GET /classes/:id/statistiques — 🔒 Statistiques de la classe */
  statistiques: (id: string) =>
    apiClient
      .get<ApiResponse<ClasseStatistiquesResult>>(
        `/classes/${id}/statistiques`
      )
      .then((r) => r.data),

  /** POST /classes — 🔒 Création */
  create: (payload: CreateClassePayload) =>
    apiClient
      .post<ApiResponse<Classe>>('/classes', payload)
      .then((r) => r.data),

  /** PUT /classes/:id — 🔒 Mise à jour */
  update: (id: string, payload: UpdateClassePayload) =>
    apiClient
      .put<ApiResponse<Classe>>(`/classes/${id}`, payload)
      .then((r) => r.data),

  /** DELETE /classes/:id — 🔒 Soft delete (archivage) */
  softDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteClasseResult>>(`/classes/${id}`)
      .then((r) => r.data),

  /** DELETE /classes/:id/hard — 🔒 Hard delete (définitif) */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteClasseResult>>(`/classes/${id}/hard`)
      .then((r) => r.data),
};