// frontend2/src/hooks/useMatieres.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { matiereApi } from '../api/matiere.api';
import { useToast } from '../context/ToastContext';
import type {
  ListMatieresParams,
  CreateMatierePayload,
  UpdateMatierePayload,
  MatieresListResult,
  Matiere,
  MatiereDetail,
  AffecterEnseignantPayload,
  AffectationMatiere,
} from '../types/matiere.types';

// ──────────────────────────────────────────
// QUERY KEYS
// ──────────────────────────────────────────

export const matiereKeys = {
  all: ['matieres'] as const,
  lists: () => [...matiereKeys.all, 'list'] as const,
  list: (params?: ListMatieresParams) =>
    [...matiereKeys.lists(), params ?? {}] as const,
  details: () => [...matiereKeys.all, 'detail'] as const,
  detail: (id: string) => [...matiereKeys.details(), id] as const,
};

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

function normalize(res: any): MatieresListResult {
  const payload = res?.data ?? res;

  if (payload?.data && Array.isArray(payload.data)) {
    return {
      matieres: payload.data,
      pagination:
        payload.pagination ?? {
          page: 1,
          limit: 50,
          total: payload.data.length,
          totalPages: 1,
        },
    };
  }

  if (Array.isArray(payload)) {
    return {
      matieres: payload,
      pagination: {
        page: 1,
        limit: 50,
        total: payload.length,
        totalPages: 1,
      },
    };
  }

  return {
    matieres: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

function getErrorMessage(err: unknown, fallback = 'Erreur'): string {
  const e = err as any;
  return (
    e?.response?.data?.message ??
    e?.response?.data?.error ??
    e?.message ??
    fallback
  );
}

function unwrapMatiere(res: any): Matiere | null {
  if (res?.data) return res.data as Matiere;
  if (res?.id) return res as Matiere;
  return null;
}

function unwrapMatiereDetail(res: any): MatiereDetail | null {
  if (res?.data) return res.data as MatiereDetail;
  if (res?.id) return res as MatiereDetail;
  return null;
}

/**
 * Merge partiel sécurisé : on ne fusionne QUE les champs scalaires
 * de `Matiere` dans le `MatiereDetail` en cache.
 * On exclut `niveau`, `_count` et toute relation qui pourrait avoir
 * un type plus étroit dans `MatiereDetail`.
 */
function mergeMatiereIntoDetail(
  old: MatiereDetail | undefined,
  patch: Matiere
): MatiereDetail | undefined {
  if (!old) return undefined;
  return {
    ...old,
    // champs scalaires uniquement
    nom: patch.nom,
    code: patch.code,
    niveauId: patch.niveauId,
    coefficient: patch.coefficient,
    dureeCours: patch.dureeCours,
    description: patch.description,
    estActive: patch.estActive,
    estArchive: patch.estArchive,
    createdAt: patch.createdAt,
    updatedAt: patch.updatedAt,
    // ⚠️ on garde old.niveau (NiveauDetail), old._count, old.professeurs,
    // old.classes, old.affectations, old.emploisTemps, old.emploiTempsParJour, old._stats
  };
}

// ──────────────────────────────────────────
// LECTURE
// ──────────────────────────────────────────

export function useMatieres(params?: ListMatieresParams) {
  return useQuery<MatieresListResult>({
    queryKey: matiereKeys.list(params),
    queryFn: async () => normalize(await matiereApi.list(params)),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useMatiere(id: string | undefined) {
  return useQuery<MatiereDetail>({
    queryKey: matiereKeys.detail(id ?? ''),
    queryFn: async () => {
      const res = await matiereApi.getById(id!);
      const matiere = unwrapMatiereDetail(res);
      if (!matiere) throw new Error('Matière introuvable');
      return matiere;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ──────────────────────────────────────────
// MUTATIONS — CRUD
// ──────────────────────────────────────────

export function useCreateMatiere() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: CreateMatierePayload) => matiereApi.create(payload),
    onSuccess: (res) => {
      const matiere = unwrapMatiere(res);
      qc.invalidateQueries({ queryKey: matiereKeys.lists() });

      if ((res as any)?.data?._affectation) {
        qc.invalidateQueries({ queryKey: ['classes'] });
        qc.invalidateQueries({ queryKey: ['enseignants'] });
      }

      if (matiere) {
        // ⚠️ On NE met PAS en cache ici : la réponse `create` n'a pas
        // les relations de detail. On laisse `useMatiere` fetcher proprement.
        toast.success(`Matière créée : ${matiere.nom}`);
      } else {
        toast.success('Matière créée');
      }
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, 'Échec de la création')),
  });
}

export function useUpdateMatiere() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMatierePayload;
    }) => matiereApi.update(id, payload),
    onSuccess: (res, vars) => {
      const matiere = unwrapMatiere(res);
      qc.invalidateQueries({ queryKey: matiereKeys.lists() });
      qc.invalidateQueries({ queryKey: matiereKeys.detail(vars.id) });

      // ✅ Merge sécurisé : ne remplace QUE les champs scalaires.
      if (matiere) {
        qc.setQueryData<MatiereDetail | undefined>(
          matiereKeys.detail(vars.id),
          (old) => mergeMatiereIntoDetail(old, matiere)
        );
      }

      toast.success('Matière mise à jour');
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, 'Échec de la mise à jour')),
  });
}

export function useSoftDeleteMatiere() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => matiereApi.softDelete(id),
    onSuccess: (_r, id) => {
      qc.invalidateQueries({ queryKey: matiereKeys.lists() });
      qc.invalidateQueries({ queryKey: matiereKeys.detail(id) });
      toast.success('Matière archivée');
    },
    onError: (err) => toast.error(getErrorMessage(err, "Échec de l'archivage")),
  });
}

export function useHardDeleteMatiere() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => matiereApi.hardDelete(id),
    onSuccess: (_r, id) => {
      qc.removeQueries({ queryKey: matiereKeys.detail(id) });
      qc.invalidateQueries({ queryKey: matiereKeys.lists() });
      toast.success('Matière supprimée définitivement');
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, 'Échec de la suppression')),
  });
}

// ──────────────────────────────────────────
// MUTATION — AFFECTATION ENSEIGNANT
// POST /matieres/:id/affecter-enseignant
// ──────────────────────────────────────────

export function useAffecterEnseignant() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation<
    AffectationMatiere,
    unknown,
    { matiereId: string; payload: AffecterEnseignantPayload }
  >({
    // ✅ On extrait `.data` car matiereApi retourne ApiResponse<AffectationMatiere>
    mutationFn: async ({ matiereId, payload }) => {
      const res = await matiereApi.affecterEnseignant(matiereId, payload);
      return res.data as AffectationMatiere;
    },
    onSuccess: (affectation, vars) => {
      qc.invalidateQueries({ queryKey: matiereKeys.lists() });
      qc.invalidateQueries({ queryKey: matiereKeys.detail(vars.matiereId) });
      qc.invalidateQueries({ queryKey: ['classes'] });
      qc.invalidateQueries({ queryKey: ['enseignants'] });

      const nom = affectation?.enseignant
        ? `${affectation.enseignant.prenom} ${affectation.enseignant.nom}`.trim()
        : 'Enseignant';
      toast.success(`${nom} affecté à la matière`);
    },
    onError: (err) =>
      toast.error(getErrorMessage(err, "Échec de l'affectation")),
  });
}