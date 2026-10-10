// frontend2/src/api/mon-etablissement.api.ts

import { apiClient } from './auth.api';
import type { Etablissement } from '../types/etablissement.api';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

/**
 * 🎯 Type du payload de mise à jour.
 *
 * ⚠️ Tous les champs acceptent `null` en plus de `undefined`
 * car Prisma renvoie `null` pour les champs optionnels non définis,
 * et on doit pouvoir envoyer `null` pour effacer une valeur.
 */
export interface UpdateMonEtablissementPayload {
  nom?: string;
  logo?: string | null;
  adresse?: string | null;
  ville?: string | null;
  pays?: string;
  telephone?: string | null;
  email?: string | null;
  siteWeb?: string | null;
  numeroAgrement?: string | null;
  devise?: string;
  fuseauHoraire?: string;
  formatDate?: string;
  joursOuvrables?: string[];
  heureDebut?: string | null;
  heureFin?: string | null;
  toleranceRetard?: number;
  tauxHeureSup?: number;
  type?: string;
}

export const monEtablissementApi = {
  /**
   * GET /mon-etablissement
   * Récupère l'établissement du directeur connecté.
   */
  get: () =>
    apiClient
      .get<ApiResponse<Etablissement>>('/mon-etablissement')
      .then((r) => r.data),

  /**
   * PUT /mon-etablissement
   * Met à jour l'établissement du directeur connecté.
   */
  update: (payload: UpdateMonEtablissementPayload) =>
    apiClient
      .put<ApiResponse<Etablissement>>('/mon-etablissement', payload)
      .then((r) => r.data),
};