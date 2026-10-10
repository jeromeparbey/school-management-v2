// frontend2/src/api/etablissement.api.ts

import { apiClient } from './auth.api';
import type {
  Etablissement,
  EtablissementStats,
  EtablissementListResponse,
  EtablissementWithDirecteur,
  CreateEtablissementPayload,
  UpdateEtablissementPayload,
  ListEtablissementsParams,
  ToggleEtablissementPayload,
  ReprovisionnerEtablissementPayload,
} from '../types/etablissement.api';

// ============================================
// TYPE DE RÉPONSE API
// ============================================
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

// ============================================
// HELPER : construit les query params
// ============================================
const buildParams = (
  params?: ListEtablissementsParams
): Record<string, string> => {
  if (!params) return {};
  const out: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      out[key] = String(value);
    }
  });
  return out;
};

// ============================================
// SERVICE
// ============================================
export const etablissementApi = {
  /**
   * GET /etablissements
   * Liste paginée avec filtres.
   */
// frontend2/src/api/etablissement.api.ts

list: (params?: ListEtablissementsParams) =>
  apiClient
    .get<{
      success: boolean;
      items: EtablissementListResponse['items'];
      pagination: EtablissementListResponse['pagination'];
    }>('/etablissements', {
      params: buildParams(params),
    })
    .then((r) => ({
      success: r.data.success,
      data: {
        items: r.data.items,
        pagination: r.data.pagination,
      },
    })),
  /**
   * GET /etablissements/stats
   * Statistiques globales du catalogue.
   */
  stats: () =>
    apiClient
      .get<ApiResponse<EtablissementStats>>('/etablissements/stats')
      .then((r) => r.data),

  /**
   * GET /etablissements/:id
   * Détail d'un établissement + directeur du tenant.
   */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Etablissement>>(`/etablissements/${id}`)
      .then((r) => r.data),

  /**
   * POST /etablissements
   * 🎯 Créer un nouvel établissement + son DIRECTEUR initial.
   *
   * ⚠️ Le champ `directeur` est OBLIGATOIRE dans le payload.
   * Le backend va :
   *   1. Provisionner le schéma PostgreSQL
   *   2. Créer le DIRECTEUR dans le tenant (Utilisateur + Directeur)
   *   3. Retourner l'établissement + le directeur créé
   */
  create: (payload: CreateEtablissementPayload) =>
    apiClient
      .post<ApiResponse<EtablissementWithDirecteur>>('/etablissements', payload)
      .then((r) => r.data),

  /**
   * PUT /etablissements/:id
   * Mettre à jour un établissement (le directeur n'est PAS modifiable ici).
   */
  update: (id: string, payload: UpdateEtablissementPayload) =>
    apiClient
      .put<ApiResponse<Etablissement>>(`/etablissements/${id}`, payload)
      .then((r) => r.data),

  /**
   * PATCH /etablissements/:id/toggle
   * Activer ou désactiver un établissement.
   */
  toggle: (id: string, payload: ToggleEtablissementPayload) =>
    apiClient
      .patch<ApiResponse<Etablissement>>(`/etablissements/${id}/toggle`, payload)
      .then((r) => r.data),

  /**
   * PATCH /etablissements/:id/archive
   * Archiver un établissement (soft delete).
   */
  archive: (id: string) =>
    apiClient
      .patch<ApiResponse<Etablissement>>(`/etablissements/${id}/archive`)
      .then((r) => r.data),

  /**
   * POST /etablissements/:id/reprovisionner
   * Relancer le provisioning d'un établissement en échec.
   */
  reprovisionner: (
    id: string,
    payload?: ReprovisionnerEtablissementPayload
  ) =>
    apiClient
      .post<ApiResponse<Etablissement>>(
        `/etablissements/${id}/reprovisionner`,
        payload ?? {}
      )
      .then((r) => r.data),

  /**
   * DELETE /etablissements/:id
   * ⚠️ Suppression définitive (hard delete) — IRRÉVERSIBLE.
   * Refusé si des utilisateurs globaux/abonnements/factures sont liés.
   */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<null>>(`/etablissements/${id}`)
      .then((r) => r.data),
};