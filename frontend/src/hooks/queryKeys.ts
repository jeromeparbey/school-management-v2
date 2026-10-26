// frontend2/src/hooks/queryKeys.ts

import type { ListUtilisateursParams } from '../types/utilisateur.types';

export const utilisateurKeys = {
  all: ['utilisateurs'] as const,
  lists: () => [...utilisateurKeys.all, 'list'] as const,
  list: (params?: ListUtilisateursParams) =>
    [...utilisateurKeys.lists(), params ?? {}] as const,
  details: () => [...utilisateurKeys.all, 'detail'] as const,
  detail: (id: string) => [...utilisateurKeys.details(), id] as const,
  me: () => [...utilisateurKeys.all, 'me'] as const,
};