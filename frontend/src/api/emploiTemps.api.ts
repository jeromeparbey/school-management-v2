// frontend2/src/api/emploiTemps.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  EmploiTemps,
  CreateEmploiTempsPayload,
  UpdateEmploiTempsPayload,
  CheckConflitsPayload,
  CheckConflitsResult,
  ListEmploisTempsParams,
  ListEmploisTempsResult,
  EmploiTempsByClasseResult,
  EmploiTempsByEnseignantResult,
  DeleteEmploiTempsResult,
} from '../types/emploiTemps.types';

// ============================================
// SERVICE EMPLOI DU TEMPS — 1 fonction = 1 route backend
// ============================================
export const emploiTempsApi = {
  /** GET /emplois-temps — 🔒 Liste paginée + filtres */
  list: (params?: ListEmploisTempsParams) =>
    apiClient
      .get<ApiResponse<ListEmploisTempsResult>>('/emplois-temps', { params })
      .then((r) => r.data),

  /** GET /emplois-temps/:id — 🔒 Détail */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<EmploiTemps>>(`/emplois-temps/${id}`)
      .then((r) => r.data),

  /** GET /emplois-temps/by-classe/:classeId — 🔒 Emploi du temps d'une classe (vue semaine) */
  listByClasse: (classeId: string, anneeScolaireId?: string) =>
    apiClient
      .get<ApiResponse<EmploiTempsByClasseResult>>(
        `/emplois-temps/by-classe/${classeId}`,
        { params: anneeScolaireId ? { anneeScolaireId } : undefined }
      )
      .then((r) => r.data),

  /** GET /emplois-temps/by-enseignant/:enseignantId — 🔒 Emploi du temps d'un enseignant */
  listByEnseignant: (enseignantId: string, anneeScolaireId?: string) =>
    apiClient
      .get<ApiResponse<EmploiTempsByEnseignantResult>>(
        `/emplois-temps/by-enseignant/${enseignantId}`,
        { params: anneeScolaireId ? { anneeScolaireId } : undefined }
      )
      .then((r) => r.data),

  /** GET /emplois-temps/by-eleve/:eleveId — 🔒 Emploi du temps de la classe active de l'élève */
  listByEleve: (eleveId: string) =>
    apiClient
      .get<ApiResponse<EmploiTempsByClasseResult>>(
        `/emplois-temps/by-eleve/${eleveId}`
      )
      .then((r) => r.data),

  /** POST /emplois-temps/check-conflits — 🔒 Vérification de conflits avant création */
  checkConflits: (payload: CheckConflitsPayload) =>
    apiClient
      .post<ApiResponse<CheckConflitsResult>>(
        '/emplois-temps/check-conflits',
        payload
      )
      .then((r) => r.data),

  /** POST /emplois-temps — 🔒 Création */
  create: (payload: CreateEmploiTempsPayload) =>
    apiClient
      .post<ApiResponse<EmploiTemps>>('/emplois-temps', payload)
      .then((r) => r.data),

  /** PUT /emplois-temps/:id — 🔒 Mise à jour */
  update: (id: string, payload: UpdateEmploiTempsPayload) =>
    apiClient
      .put<ApiResponse<EmploiTemps>>(`/emplois-temps/${id}`, payload)
      .then((r) => r.data),

  /** PATCH /emplois-temps/:id/toggle — 🔒 Activer/désactiver */
  toggleActif: (id: string) =>
    apiClient
      .patch<ApiResponse<EmploiTemps>>(`/emplois-temps/${id}/toggle`)
      .then((r) => r.data),

  /** POST /emplois-temps/:id/dupliquer — 🔒 Dupliquer un créneau sur un autre jour */
  dupliquer: (id: string, targetJour?: string) =>
    apiClient
      .post<ApiResponse<EmploiTemps>>(
        `/emplois-temps/${id}/dupliquer`,
        targetJour ? { targetJour } : {}
      )
      .then((r) => r.data),

  /** DELETE /emplois-temps/:id — 🔒 Soft delete (désactivation) */
  softDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteEmploiTempsResult>>(`/emplois-temps/${id}`)
      .then((r) => r.data),

  /** DELETE /emplois-temps/:id/hard — 🔒 Hard delete (définitif) */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteEmploiTempsResult>>(
        `/emplois-temps/${id}/hard`
      )
      .then((r) => r.data),
};