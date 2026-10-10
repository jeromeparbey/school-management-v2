// frontend2/src/hooks/useMonEtablissement.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  monEtablissementApi,
  type UpdateMonEtablissementPayload,
} from '../api/mon-etablissement.api';

// ============================================
// CLÉS DE CACHE
// ============================================
export const monEtablissementKeys = {
  all: ['mon-etablissement'] as const,
  detail: () => [...monEtablissementKeys.all, 'detail'] as const,
};

// ============================================
// QUERY
// ============================================
export function useMonEtablissement() {
  return useQuery({
    queryKey: monEtablissementKeys.detail(),
    queryFn: () => monEtablissementApi.get(),
    staleTime: 60_000,
    select: (res) => res.data,
  });
}

// ============================================
// MUTATION
// ============================================
export function useUpdateMonEtablissement() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMonEtablissementPayload) =>
      monEtablissementApi.update(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: monEtablissementKeys.all });
    },
  });
}