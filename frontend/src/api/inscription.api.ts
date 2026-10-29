// frontend2/src/api/inscription.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  Inscription,
  CreateInscriptionPayload,
  UpdateInscriptionPayload,
  ListInscriptionsParams,
  ListInscriptionsResult,
  DeleteInscriptionResult,
  PreviewInscriptionResult,
  InscrireEtPayerPayload,
  InscrireEtPayerResult,
} from '../types/inscription.types';

// ============================================
// SERVICE INSCRIPTION — 1 fonction = 1 route backend
// ============================================

export const inscriptionApi = {
  /** GET /inscriptions — 🔒 Liste paginée + filtres */
  list: (params?: ListInscriptionsParams) =>
    apiClient
      .get<ApiResponse<ListInscriptionsResult>>('/inscriptions', { params })
      .then((r) => r.data),

  /** 🆕 GET /inscriptions/preview — 🔒 Aperçu avant inscription */
  preview: (params: {
    eleveId: string;
    classeId: string;
    anneeScolaireId: string;
  }) =>
    apiClient
      .get<ApiResponse<PreviewInscriptionResult>>('/inscriptions/preview', {
        params,
      })
      .then((r) => r.data),

  /** GET /inscriptions/:id — 🔒 Détail */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Inscription>>(`/inscriptions/${id}`)
      .then((r) => r.data),

  /** POST /inscriptions — 🔒 Création simple (sans paiement) */
  create: (payload: CreateInscriptionPayload) =>
    apiClient
      .post<ApiResponse<Inscription>>('/inscriptions', payload)
      .then((r) => r.data),

  /** 🆕 POST /inscriptions/inscrire-et-payer — 🔒 Inscription + paiement atomique */
  inscrireEtPayer: (payload: InscrireEtPayerPayload) =>
    apiClient
      .post<ApiResponse<InscrireEtPayerResult>>(
        '/inscriptions/inscrire-et-payer',
        payload
      )
      .then((r) => r.data),

  /** PUT /inscriptions/:id — 🔒 Mise à jour */
  update: (id: string, payload: UpdateInscriptionPayload) =>
    apiClient
      .put<ApiResponse<Inscription>>(`/inscriptions/${id}`, payload)
      .then((r) => r.data),

  /** DELETE /inscriptions/:id — 🔒 Désactivation (soft) */
  softDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteInscriptionResult>>(`/inscriptions/${id}`)
      .then((r) => r.data),

  /** DELETE /inscriptions/:id/hard — 🔒 Suppression définitive */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteInscriptionResult>>(`/inscriptions/${id}/hard`)
      .then((r) => r.data),
};