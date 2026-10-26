// frontend2/src/api/anneeScolaire.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  AnneeScolaire,
  CreateAnneeScolairePayload,
  UpdateAnneeScolairePayload,
  ListAnneesScolairesParams,
  ListAnneesScolairesResult,
} from '../types/anneeScolaire.types';

export const anneeScolaireApi = {
  list: (params?: ListAnneesScolairesParams) =>
    apiClient.get<ApiResponse<ListAnneesScolairesResult>>('/annees-scolaires', { params }).then((r) => r.data),

  getActive: () =>
    apiClient.get<ApiResponse<AnneeScolaire | null>>('/annees-scolaires/active').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<AnneeScolaire>>(`/annees-scolaires/${id}`).then((r) => r.data),

  create: (payload: CreateAnneeScolairePayload) =>
    apiClient.post<ApiResponse<AnneeScolaire>>('/annees-scolaires', payload).then((r) => r.data),

  update: (id: string, payload: UpdateAnneeScolairePayload) =>
    apiClient.put<ApiResponse<AnneeScolaire>>(`/annees-scolaires/${id}`, payload).then((r) => r.data),

  hardDelete: (id: string) =>
    apiClient.delete<ApiResponse<{ id: string; message: string }>>(`/annees-scolaires/${id}`).then((r) => r.data),
};