// frontend2/src/api/eleve.api.ts

import { apiClient } from './auth.api';
import type { ApiResponse } from '../types/auth.types';
import type {
  Eleve,
  CreateElevePayload,
  UpdateElevePayload,
  ListElevesParams,
  ListElevesResult,
  DeleteEleveResult,
} from '../types/eleve.types';

export const eleveApi = {
  list: (params?: ListElevesParams) =>
    apiClient.get<ApiResponse<ListElevesResult>>('/eleves', { params }).then((r) => r.data),
  getById: (id: string) =>
    apiClient.get<ApiResponse<Eleve>>(`/eleves/${id}`).then((r) => r.data),
  create: (payload: CreateElevePayload) =>
    apiClient.post<ApiResponse<Eleve>>('/eleves', payload).then((r) => r.data),
  update: (id: string, payload: UpdateElevePayload) =>
    apiClient.put<ApiResponse<Eleve>>(`/eleves/${id}`, payload).then((r) => r.data),
  softDelete: (id: string) =>
    apiClient.delete<ApiResponse<DeleteEleveResult>>(`/eleves/${id}`).then((r) => r.data),
  hardDelete: (id: string) =>
    apiClient.delete<ApiResponse<DeleteEleveResult>>(`/eleves/${id}/hard`).then((r) => r.data),
};