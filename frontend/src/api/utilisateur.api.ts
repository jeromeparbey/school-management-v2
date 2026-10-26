// frontend2/src/api/utilisateur.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  Utilisateur,
  CreateUtilisateurPayload,
  UpdateUtilisateurPayload,
  ListUtilisateursParams,
  ListUtilisateursResult,
  ToggleUtilisateurPayload,
  ChangePasswordUtilisateurPayload,
  ResetPasswordUtilisateurPayload,
  DeleteResult,
} from '../types/utilisateur.types';

// ============================================
// SERVICE UTILISATEUR — 1 fonction = 1 route backend
// ============================================
export const utilisateurApi = {
  /** GET /utilisateurs — 🔒 Liste paginée + filtres */
  list: (params?: ListUtilisateursParams) =>
    apiClient
      .get<ApiResponse<ListUtilisateursResult>>('/utilisateurs', { params })
      .then((r) => r.data),

  /** GET /utilisateurs/:id — 🔒 Détail (avec profils métier) */
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Utilisateur>>(`/utilisateurs/${id}`)
      .then((r) => r.data),

  /** GET /utilisateurs/me — 🔒 Profil de l'utilisateur connecté */
  me: () =>
    apiClient
      .get<ApiResponse<Utilisateur>>('/utilisateurs/me')
      .then((r) => r.data),

  /** POST /utilisateurs — 🔒 Création (admin) */
  create: (payload: CreateUtilisateurPayload) =>
    apiClient
      .post<ApiResponse<Utilisateur>>('/utilisateurs', payload)
      .then((r) => r.data),

  /** PUT /utilisateurs/:id — 🔒 Mise à jour (admin) */
  update: (id: string, payload: UpdateUtilisateurPayload) =>
    apiClient
      .put<ApiResponse<Utilisateur>>(`/utilisateurs/${id}`, payload)
      .then((r) => r.data),

  /** PATCH /utilisateurs/:id/toggle — 🔒 Activer / désactiver */
  toggle: (id: string, payload: ToggleUtilisateurPayload) =>
    apiClient
      .patch<ApiResponse<Utilisateur>>(
        `/utilisateurs/${id}/toggle`,
        payload
      )
      .then((r) => r.data),

  /** PATCH /utilisateurs/:id/reset-password — 🔒 Reset par admin */
  resetPassword: (id: string, payload: ResetPasswordUtilisateurPayload) =>
    apiClient
      .patch<ApiResponse<null>>(
        `/utilisateurs/${id}/reset-password`,
        payload
      )
      .then((r) => r.data),

  /** PATCH /utilisateurs/me/password — 🔒 Changement par l'utilisateur lui-même */
  changePassword: (payload: ChangePasswordUtilisateurPayload) =>
    apiClient
      .patch<ApiResponse<null>>('/utilisateurs/me/password', payload)
      .then((r) => r.data),

  /** DELETE /utilisateurs/:id — 🔒 Soft delete */
  softDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteResult>>(`/utilisateurs/${id}`)
      .then((r) => r.data),

  /** DELETE /utilisateurs/:id/hard — 🔒 Hard delete */
  hardDelete: (id: string) =>
    apiClient
      .delete<ApiResponse<DeleteResult>>(`/utilisateurs/${id}/hard`)
      .then((r) => r.data),

  // ════════════════════════════════════════════
  // PHOTO — SELF (utilisateur connecté)
  // ⚠️ IMPORTANT : NE PAS mettre Content-Type manuellement !
  //    Axios détecte FormData et ajoute automatiquement :
  //    "Content-Type: multipart/form-data; boundary=----xyz"
  //    Si on force "multipart/form-data" sans boundary, multer
  //    ne peut pas parser et req.file reste undefined.
  // ════════════════════════════════════════════

  /** POST /utilisateurs/me/photo — Upload de SA photo */
  uploadMyPhoto: (formData: FormData) =>
    apiClient
      .post<ApiResponse<{ photoProfil: string }>>(
        '/utilisateurs/me/photo',
        formData
        // ✅ PAS de headers — Axios gère le boundary auto
      )
      .then((r) => r.data),

  /** DELETE /utilisateurs/me/photo — Supprimer SA photo */
  deleteMyPhoto: () =>
    apiClient
      .delete<ApiResponse<null>>('/utilisateurs/me/photo')
      .then((r) => r.data),

  // ════════════════════════════════════════════
  // PHOTO — ADMIN (sur un autre utilisateur)
  // ════════════════════════════════════════════

  /** POST /utilisateurs/:id/photo — Upload photo d'un user (admin) */
  uploadUserPhoto: (id: string, formData: FormData) =>
    apiClient
      .post<ApiResponse<{ photoProfil: string }>>(
        `/utilisateurs/${id}/photo`,
        formData
        // ✅ PAS de headers — Axios gère le boundary auto
      )
      .then((r) => r.data),

  /** DELETE /utilisateurs/:id/photo — Supprimer photo (admin) */
  deleteUserPhoto: (id: string) =>
    apiClient
      .delete<ApiResponse<null>>(`/utilisateurs/${id}/photo`)
      .then((r) => r.data),
};