// frontend2/src/api/paiement.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  Paiement,
  CreatePaiementPayload,
  UpdatePaiementPayload,
  AnnulerPaiementPayload,
  ListPaiementsParams,
  ListPaiementsResult,
  PaiementsByEleveResult,
  PaiementStatsResult,
  DeletePaiementResult,
} from '../types/paiement.types';

// ============================================
// SERVICE PAIEMENT — 1 fonction = 1 route backend
// ============================================

export const paiementApi = {
  /** GET /paiements — 🔒 Liste paginée + filtres + summary */
  list: (params?: ListPaiementsParams) =>
    apiClient
      .get<ApiResponse<ListPaiementsResult>>('/paiements', { params })
      .then((r) => r.data),

  /** GET /paiements/:id — 🔒 Détail */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Paiement>>(`/paiements/${id}`)
      .then((r) => r.data),

  /** GET /paiements/by-eleve/:eleveId — 🔒 Paiements d'un élève */
  listByEleve: (eleveId: string) =>
    apiClient
      .get<ApiResponse<PaiementsByEleveResult>>(
        `/paiements/by-eleve/${eleveId}`
      )
      .then((r) => r.data),

  /** GET /paiements/stats — 🔒 Statistiques globales */
  stats: (params?: { dateDebut?: string; dateFin?: string }) =>
    apiClient
      .get<ApiResponse<PaiementStatsResult>>('/paiements/stats', { params })
      .then((r) => r.data),

  /** POST /paiements — 🔒 Création */
  create: (payload: CreatePaiementPayload) =>
    apiClient
      .post<ApiResponse<Paiement>>('/paiements', payload)
      .then((r) => r.data),

  /** PUT /paiements/:id — 🔒 Mise à jour (notes uniquement) */
  update: (id: string, payload: UpdatePaiementPayload) =>
    apiClient
      .put<ApiResponse<Paiement>>(`/paiements/${id}`, payload)
      .then((r) => r.data),

  /** POST /paiements/:id/annuler — 🔒 Annulation */
  annuler: (id: string, payload: AnnulerPaiementPayload) =>
    apiClient
      .post<ApiResponse<Paiement>>(`/paiements/${id}/annuler`, payload)
      .then((r) => r.data),

  /** DELETE /paiements/:id/hard — 🔒 Suppression définitive (paiement annulé uniquement) */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeletePaiementResult>>(`/paiements/${id}/hard`)
      .then((r) => r.data),
};