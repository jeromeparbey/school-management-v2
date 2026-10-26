// hooks/useUtilisateurs.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { utilisateurApi } from '../api/utilisateur.api';
import { utilisateurKeys } from './queryKeys';
import { useToast } from '../context/ToastContext';
import type {
  ListUtilisateursParams,
  CreateUtilisateurPayload,
  UpdateUtilisateurPayload,
  ToggleUtilisateurPayload,
  ChangePasswordUtilisateurPayload,
  ResetPasswordUtilisateurPayload,
} from '../types/utilisateur.types';

// ═══════════════════════════════════════════════════════════
// 🔍 LOG HELPERS
// ═══════════════════════════════════════════════════════════

/** Log coloré (console navigateur) */
const logStart = (hook: string, detail?: any) => {
  const ts = new Date().toLocaleTimeString('fr-FR');
  console.log(
    `%c🎣 [${hook}] ${ts} → Début`,
    'color:#7c3aed;font-weight:bold'
  );
  if (detail !== undefined) {
    console.log('   📦 Détails:', detail);
  }
};

const logSuccess = (hook: string, detail?: any) => {
  const ts = new Date().toLocaleTimeString('fr-FR');
  console.log(
    `%c✅ [${hook}] ${ts} → Succès`,
    'color:#16a34a;font-weight:bold'
  );
  if (detail !== undefined) {
    console.log('   📦 Résultat:', detail);
  }
};

const logError = (hook: string, err: unknown, fallback: string) => {
  const ts = new Date().toLocaleTimeString('fr-FR');
  const anyErr = err as any;
  const status = anyErr?.response?.status;
  const message =
    anyErr?.response?.data?.message ?? anyErr?.message ?? fallback;

  console.error(
    `%c❌ [${hook}] ${ts} → Erreur`,
    'color:#dc2626;font-weight:bold'
  );
  console.error('   Status:', status ?? 'NETWORK ERROR');
  console.error('   Message:', message);
  if (anyErr?.response?.data) {
    console.error('   Data backend:', anyErr.response.data);
  }
  if (status === 401) {
    console.error('   💡 401 : Token manquant/expiré → reconnecte-toi');
  } else if (status === 403) {
    console.error('   💡 403 : Rôle non autorisé');
  } else if (status === 404) {
    console.error('   💡 404 : Route/ressource introuvable');
  } else if (status === 500) {
    console.error('   💡 500 : Erreur backend → voir terminal serveur');
  }
};

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const anyErr = err as any;
  return anyErr?.response?.data?.message ?? anyErr?.message ?? fallback;
}

// ═══════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════

export function useUtilisateurs(params?: ListUtilisateursParams) {
  return useQuery({
    queryKey: utilisateurKeys.list(params),
    queryFn: async () => {
      logStart('useUtilisateurs', { params });
      try {
        const res = await utilisateurApi.list(params);
        logSuccess('useUtilisateurs', {
          total: (res as any)?.pagination?.total ?? 'N/A',
          items: (res as any)?.items?.length ?? 'N/A',
        });
        return res;
      } catch (err) {
        logError('useUtilisateurs', err, 'Échec du chargement');
        throw err;
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useUtilisateur(id: string | undefined) {
  return useQuery({
    queryKey: utilisateurKeys.detail(id ?? ''),
    queryFn: async () => {
      logStart('useUtilisateur', { id });
      try {
        const res = await utilisateurApi.getById(id!);
        logSuccess('useUtilisateur', {
          email: (res as any)?.email,
          role: (res as any)?.role,
        });
        return res;
      } catch (err) {
        logError('useUtilisateur', err, 'Échec chargement utilisateur');
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCurrentUtilisateur() {
  return useQuery({
    queryKey: utilisateurKeys.me(),
    queryFn: async () => {
      logStart('useCurrentUtilisateur');
      try {
        const res = await utilisateurApi.me();
        logSuccess('useCurrentUtilisateur', {
          email: (res as any)?.email,
          role: (res as any)?.role,
        });
        return res;
      } catch (err) {
        logError('useCurrentUtilisateur', err, 'Échec chargement profil');
        throw err;
      }
    },
    staleTime: 60_000,
  });
}

// ═══════════════════════════════════════════════════════════
// MUTATIONS — UTILISATEUR
// ═══════════════════════════════════════════════════════════

export function useCreateUtilisateur() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: CreateUtilisateurPayload) => {
      logStart('useCreateUtilisateur', {
        email: payload.email,
        role: payload.role,
        prenom: payload.prenom,
        nom: payload.nom,
      });
      return utilisateurApi.create(payload);
    },
    onSuccess: (res) => {
      logSuccess('useCreateUtilisateur', {
        id: (res as any)?.data?.id,
        email: (res as any)?.data?.email,
      });
      qc.invalidateQueries({ queryKey: utilisateurKeys.lists() });
      toast.success(
        `Utilisateur créé : ${(res as any).data?.prenom} ${(res as any).data?.nom}`
      );
    },
    onError: (err) => {
      logError('useCreateUtilisateur', err, 'Échec de la création');
      toast.error(getErrorMessage(err, 'Échec de la création'));
    },
  });
}

export function useUpdateUtilisateur() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUtilisateurPayload;
    }) => {
      logStart('useUpdateUtilisateur', {
        id,
        champsModifies: Object.keys(payload),
      });
      return utilisateurApi.update(id, payload);
    },
    onSuccess: (_res, variables) => {
      logSuccess('useUpdateUtilisateur', { id: variables.id });
      qc.invalidateQueries({ queryKey: utilisateurKeys.lists() });
      qc.invalidateQueries({
        queryKey: utilisateurKeys.detail(variables.id),
      });
      qc.invalidateQueries({ queryKey: utilisateurKeys.me() });
      toast.success('Utilisateur mis à jour');
    },
    onError: (err) => {
      logError('useUpdateUtilisateur', err, 'Échec de la mise à jour');
      toast.error(getErrorMessage(err, 'Échec de la mise à jour'));
    },
  });
}

export function useToggleUtilisateur() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ToggleUtilisateurPayload;
    }) => {
      logStart('useToggleUtilisateur', {
        id,
        nouvelleValeur: payload.estActif,
      });
      return utilisateurApi.toggle(id, payload);
    },
    onSuccess: (_res, variables) => {
      logSuccess('useToggleUtilisateur', {
        id: variables.id,
        estActif: variables.payload.estActif,
      });
      qc.invalidateQueries({ queryKey: utilisateurKeys.lists() });
      qc.invalidateQueries({
        queryKey: utilisateurKeys.detail(variables.id),
      });
      toast.success(
        variables.payload.estActif
          ? 'Utilisateur activé'
          : 'Utilisateur désactivé'
      );
    },
    onError: (err) => {
      logError('useToggleUtilisateur', err, 'Échec du changement de statut');
      toast.error(getErrorMessage(err, 'Échec du changement de statut'));
    },
  });
}

export function useResetPasswordUtilisateur() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ResetPasswordUtilisateurPayload;
    }) => {
      logStart('useResetPasswordUtilisateur', {
        id,
        longueurNouveauPwd: payload.nouveauMotDePasse?.length,
      });
      return utilisateurApi.resetPassword(id, payload);
    },
    onSuccess: (_res, variables) => {
      logSuccess('useResetPasswordUtilisateur', { id: variables.id });
      qc.invalidateQueries({
        queryKey: utilisateurKeys.detail(variables.id),
      });
      toast.success('Mot de passe réinitialisé');
    },
    onError: (err) => {
      logError('useResetPasswordUtilisateur', err, 'Échec de la réinitialisation');
      toast.error(getErrorMessage(err, 'Échec de la réinitialisation'));
    },
  });
}

export function useChangePasswordUtilisateur() {
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: ChangePasswordUtilisateurPayload) => {
      logStart('useChangePasswordUtilisateur', {
        longueurAncien: payload.ancienMotDePasse?.length,
        longueurNouveau: payload.nouveauMotDePasse?.length,
      });
      return utilisateurApi.changePassword(payload);
    },
    onSuccess: () => {
      logSuccess('useChangePasswordUtilisateur');
      toast.success('Mot de passe modifié');
    },
    onError: (err) => {
      logError('useChangePasswordUtilisateur', err, 'Échec du changement');
      toast.error(getErrorMessage(err, 'Échec du changement'));
    },
  });
}

export function useSoftDeleteUtilisateur() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      logStart('useSoftDeleteUtilisateur', { id });
      return utilisateurApi.softDelete(id);
    },
    onSuccess: () => {
      logSuccess('useSoftDeleteUtilisateur');
      qc.invalidateQueries({ queryKey: utilisateurKeys.lists() });
      toast.success('Utilisateur désactivé (soft delete)');
    },
    onError: (err) => {
      logError('useSoftDeleteUtilisateur', err, 'Échec de la suppression');
      toast.error(getErrorMessage(err, 'Échec de la suppression'));
    },
  });
}

export function useHardDeleteUtilisateur() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      logStart('useHardDeleteUtilisateur', { id });
      return utilisateurApi.hardDelete(id);
    },
    onSuccess: (_res, id) => {
      logSuccess('useHardDeleteUtilisateur', { id });
      qc.removeQueries({ queryKey: utilisateurKeys.detail(id) });
      qc.invalidateQueries({ queryKey: utilisateurKeys.lists() });
      toast.success('Utilisateur supprimé définitivement');
    },
    onError: (err) => {
      logError('useHardDeleteUtilisateur', err, 'Échec de la suppression');
      toast.error(getErrorMessage(err, 'Échec de la suppression'));
    },
  });
}

// ═══════════════════════════════════════════════════════════
// PHOTO — SELF
// ═══════════════════════════════════════════════════════════

export function useUploadMyPhoto() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      logStart('useUploadMyPhoto', {
        fileName: file.name,
        fileType: file.type,
        fileSizeKB: (file.size / 1024).toFixed(1),
      });

      const fd = new FormData();
      fd.append('photo', file);

      // Vérifie ce que contient le FormData
      console.log('   📦 FormData construit:');
      for (const [key, value] of fd.entries()) {
        if (value instanceof File) {
          console.log(
            `      └─ "${key}": FILE "${value.name}" (${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`      └─ "${key}": ${value}`);
        }
      }

      return utilisateurApi.uploadMyPhoto(fd);
    },
    onSuccess: (res) => {
      logSuccess('useUploadMyPhoto', {
        photoProfil: (res as any)?.data?.photoProfil,
      });
      qc.invalidateQueries({ queryKey: utilisateurKeys.me() });
      qc.invalidateQueries({ queryKey: utilisateurKeys.lists() });
      toast.success('Photo mise à jour');
    },
    onError: (err) => {
      logError('useUploadMyPhoto', err, 'Échec upload photo');
      toast.error(getErrorMessage(err, 'Échec upload photo'));
    },
  });
}

export function useDeleteMyPhoto() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async () => {
      logStart('useDeleteMyPhoto');
      return utilisateurApi.deleteMyPhoto();
    },
    onSuccess: () => {
      logSuccess('useDeleteMyPhoto');
      qc.invalidateQueries({ queryKey: utilisateurKeys.me() });
      toast.success('Photo supprimée');
    },
    onError: (err) => {
      logError('useDeleteMyPhoto', err, 'Échec suppression');
      toast.error(getErrorMessage(err, 'Échec suppression'));
    },
  });
}

// ═══════════════════════════════════════════════════════════
// PHOTO — ADMIN (sur un autre utilisateur)
// ═══════════════════════════════════════════════════════════

export function useUploadUserPhoto() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      logStart('useUploadUserPhoto', {
        targetUserId: id,
        fileName: file.name,
        fileType: file.type,
        fileSizeKB: (file.size / 1024).toFixed(1),
      });

      const fd = new FormData();
      fd.append('photo', file);

      // Vérifie ce que contient le FormData
      console.log('   📦 FormData construit:');
      for (const [key, value] of fd.entries()) {
        if (value instanceof File) {
          console.log(
            `      └─ "${key}": FILE "${value.name}" (${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`      └─ "${key}": ${value}`);
        }
      }

      return utilisateurApi.uploadUserPhoto(id, fd);
    },
    onSuccess: (res, vars) => {
      logSuccess('useUploadUserPhoto', {
        targetUserId: vars.id,
        photoProfil: (res as any)?.data?.photoProfil,
      });
      qc.invalidateQueries({ queryKey: utilisateurKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: utilisateurKeys.lists() });
      toast.success('Photo mise à jour');
    },
    onError: (err) => {
      logError('useUploadUserPhoto', err, 'Échec upload photo');
      toast.error(getErrorMessage(err, 'Échec upload photo'));
    },
  });
}

export function useDeleteUserPhoto() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      logStart('useDeleteUserPhoto', { targetUserId: id });
      return utilisateurApi.deleteUserPhoto(id);
    },
    onSuccess: (_res, id) => {
      logSuccess('useDeleteUserPhoto', { targetUserId: id });
      qc.invalidateQueries({ queryKey: utilisateurKeys.detail(id) });
      qc.invalidateQueries({ queryKey: utilisateurKeys.lists() });
      toast.success('Photo supprimée');
    },
    onError: (err) => {
      logError('useDeleteUserPhoto', err, 'Échec suppression');
      toast.error(getErrorMessage(err, 'Échec suppression'));
    },
  });
}
