// frontend2/src/api/matiere.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  Matiere,
  MatiereDetail,
  CreateMatierePayload,
  UpdateMatierePayload,
  ListMatieresParams,
  ListMatieresResult,
  DeleteMatiereResult,
  AffecterEnseignantPayload,
  AffectationMatiere,
} from '../types/matiere.types';

// ============================================
// SERVICE MATIÈRE — 1 fonction = 1 route backend
// ============================================
export const matiereApi = {
  /** GET /matieres — 🔒 Liste paginée + filtres */
  list: (params?: ListMatieresParams) =>
    apiClient
      .get<ApiResponse<ListMatieresResult>>('/matieres', { params })
      .then((r) => r.data),

  /** GET /matieres/:id — 🔒 Détail complet (niveau + profs + emploi du temps) */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<MatiereDetail>>(`/matieres/${id}`)
      .then((r) => r.data),

  /** POST /matieres — 🔒 Création (+ affectation optionnelle en transaction) */
  create: (payload: CreateMatierePayload) =>
    apiClient
      .post<ApiResponse<Matiere>>('/matieres', payload)
      .then((r) => r.data),

  /** PUT /matieres/:id — 🔒 Mise à jour */
  update: (id: string, payload: UpdateMatierePayload) =>
    apiClient
      .put<ApiResponse<Matiere>>(`/matieres/${id}`, payload)
      .then((r) => r.data),

  /** 🆕 POST /matieres/:id/affecter-enseignant — 🔒 Affecter un enseignant */
  affecterEnseignant: (id: string, payload: AffecterEnseignantPayload) =>
    apiClient
      .post<ApiResponse<AffectationMatiere>>(
        `/matieres/${id}/affecter-enseignant`,
        payload
      )
      .then((r) => r.data),

  /** DELETE /matieres/:id — 🔒 Soft delete (archivage) */
  softDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteMatiereResult>>(`/matieres/${id}`)
      .then((r) => r.data),

  /** DELETE /matieres/:id/hard — 🔒 Hard delete (définitif) */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteMatiereResult>>(`/matieres/${id}/hard`)
      .then((r) => r.data),
};