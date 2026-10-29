// frontend2/src/pages/dashboard/directeur/matieres/MatiereEditerPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import {
  useMatiere,
  useUpdateMatiere,
  useHardDeleteMatiere,
} from '../../../../hooks/useMatieres';
import { useNiveaux } from '../../../../hooks/useNiveaux';
import type { UpdateMatierePayload } from '../../../../types/matiere.types';

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function extractList<T = any>(res: any, keys: string[] = []): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  for (const k of keys) if (Array.isArray(res[k])) return res[k] as T[];
  for (const k of ['data', 'items', 'results'])
    if (Array.isArray(res[k])) return res[k] as T[];
  return [];
}

interface FormState {
  nom: string;
  code: string;
  niveauId: string;
  coefficient: number | null;
  dureeCours: number | null;
  description: string;
  estActive: boolean;
}

const EMPTY: FormState = {
  nom: '',
  code: '',
  niveauId: '',
  coefficient: 1,
  dureeCours: 60,
  description: '',
  estActive: true,
};

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

const MatiereEditerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: matiere, isLoading, isError, error } = useMatiere(id);
  const updateMutation = useUpdateMatiere();
  const hardDeleteMutation = useHardDeleteMatiere();

  const { data: niveauxData } = useNiveaux({ limit: 100 });
  const niveaux = useMemo(
    () => extractList<any>(niveauxData, ['niveaux', 'data']),
    [niveauxData]
  );

  const [form, setForm] = useState<FormState>(EMPTY);
  const [initial, setInitial] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Hydrate
  useEffect(() => {
    if (matiere) {
      const f: FormState = {
        nom: matiere.nom,
        code: matiere.code,
        niveauId: matiere.niveauId,
        coefficient: matiere.coefficient,
        dureeCours: matiere.dureeCours,
        description: matiere.description ?? '',
        estActive: matiere.estActive,
      };
      setForm(f);
      setInitial(f);
    }
  }, [matiere]);

  const isDirty = useMemo(
    () =>
      form.nom !== initial.nom ||
      form.code !== initial.code ||
      form.niveauId !== initial.niveauId ||
      form.coefficient !== initial.coefficient ||
      form.dureeCours !== initial.dureeCours ||
      form.description !== initial.description ||
      form.estActive !== initial.estActive,
    [form, initial]
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm((f) => ({
      ...f,
      [name]:
        type === 'number'
          ? value === ''
            ? null
            : Number(value)
          : type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
    if (errors[name]) {
      setErrors((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.nom.trim()) e.nom = 'Nom requis';
    if (!form.code.trim()) e.code = 'Code requis';
    else if (!/^[A-Z0-9_-]+$/.test(form.code.trim().toUpperCase()))
      e.code = 'Majuscules, chiffres, _ ou - uniquement';
    if (!form.niveauId) e.niveauId = 'Niveau requis';
    if (form.coefficient == null || form.coefficient <= 0)
      e.coefficient = 'Coefficient > 0';
    if (form.dureeCours == null || form.dureeCours <= 0)
      e.dureeCours = 'Durée > 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !isDirty) return;

    const payload: UpdateMatierePayload = {};
    if (form.nom !== initial.nom) payload.nom = form.nom.trim();
    if (form.code !== initial.code)
      payload.code = form.code.trim().toUpperCase();
    if (form.niveauId !== initial.niveauId)
      payload.niveauId = form.niveauId;
    if (form.coefficient !== initial.coefficient)
      payload.coefficient = form.coefficient;
    if (form.dureeCours !== initial.dureeCours)
      payload.dureeCours = form.dureeCours;
    if (form.description !== initial.description)
      payload.description = form.description || null;
    if (form.estActive !== initial.estActive)
      payload.estActive = form.estActive;

    try {
      await updateMutation.mutateAsync({ id: id!, payload });
      navigate(`/dashboard/matieres/${id}`);
    } catch {
      /* toasté */
    }
  };

  const handleDelete = async () => {
    try {
      await hardDeleteMutation.mutateAsync(id!);
      navigate('/dashboard/matieres');
    } catch {
      /* toasté */
    }
  };

  // ══════════════════════════════════════════
  // ÉTATS DE CHARGEMENT
  // ══════════════════════════════════════════

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="text-gray-500 mt-4">Chargement…</p>
        </div>
      </div>
    );
  }

  if (isError || !matiere) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Matière introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ?? 'Une erreur est survenue'}
          </p>
          <Link
            to="/dashboard/matieres"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Retour
          </Link>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════

  return (
    <div className="space-y-6 w-full max-w-[1200px] mx-auto pb-12">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/matieres" className="hover:text-gray-900">
          Matières
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link
          to={`/dashboard/matieres/${matiere.id}`}
          className="hover:text-gray-900 truncate max-w-[200px]"
        >
          {matiere.nom}
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Modifier</span>
      </nav>

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex items-start gap-4">
          <Link
            to={`/dashboard/matieres/${matiere.id}`}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <PencilSquareIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <PencilSquareIcon className="w-7 h-7 text-emerald-600" />
                Modifier la matière
              </h1>
              {isDirty && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-amber-50 text-amber-700 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Modifications non enregistrées
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {matiere.nom} ({matiere.code})
            </p>
          </div>
        </div>
      </motion.div>

      {/* Formulaire */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* ═══════ SECTION 1 : INFOS MATIÈRE ═══════ */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-4 h-4 text-emerald-600" />
            Informations de la matière
          </h2>

          {/* Nom */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom de la matière <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              placeholder="Ex: Mathématiques"
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
                errors.nom ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.nom && (
              <p className="text-xs text-red-600 mt-1">{errors.nom}</p>
            )}
          </div>

          {/* Code + Niveau */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Ex: MATH"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none uppercase ${
                  errors.code ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.code && (
                <p className="text-xs text-red-600 mt-1">{errors.code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Niveau <span className="text-red-500">*</span>
              </label>
              <select
                name="niveauId"
                value={form.niveauId}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
                  errors.niveauId ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <option value="">— Sélectionner —</option>
                {niveaux.map((n: any) => (
                  <option key={n.id} value={n.id}>
                    {n.nom} ({n.code})
                  </option>
                ))}
              </select>
              {errors.niveauId && (
                <p className="text-xs text-red-600 mt-1">{errors.niveauId}</p>
              )}
            </div>
          </div>

          {/* Coefficient + Durée */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Coefficient <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="coefficient"
                min={0.1}
                step={0.1}
                value={form.coefficient ?? ''}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
                  errors.coefficient ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.coefficient && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.coefficient}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Durée (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="dureeCours"
                min={15}
                step={15}
                value={form.dureeCours ?? ''}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
                  errors.dureeCours ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.dureeCours && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.dureeCours}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Description optionnelle…"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              name="estActive"
              checked={form.estActive}
              onChange={handleChange}
              className="w-4 h-4 rounded text-emerald-600"
            />
            Matière active
          </label>
        </div>

        {/* Info code unique */}
        <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
          <InformationCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-800">
            <p className="font-semibold mb-0.5">Code unique</p>
            <p>
              Le code de la matière doit être unique. Une erreur 409 sera
              renvoyée si un doublon existe.
            </p>
          </div>
        </div>

        {/* Erreur globale */}
        {updateMutation.isError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">
              {(updateMutation.error as any)?.response?.data?.message ??
                (updateMutation.error as any)?.message ??
                'Une erreur est survenue'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={hardDeleteMutation.isPending}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 font-medium disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </button>
            {isDirty && (
              <button
                type="button"
                onClick={() => {
                  setForm(initial);
                  setErrors({});
                }}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
              >
                <ArrowUturnLeftIcon className="w-4 h-4" />
                Réinitialiser
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:justify-end">
            <Link
              to={`/dashboard/matieres/${matiere.id}`}
              className="px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </div>
      </motion.form>

      {/* ═══════════ MODAL SUPPRESSION ═══════════ */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Supprimer définitivement
                </h2>
                <p className="text-xs text-gray-500">Action irréversible.</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              La matière <strong>{matiere.nom}</strong> sera supprimée
              définitivement. Cette action ne peut pas être annulée.
            </p>
            <p className="text-xs text-gray-500 italic">
              💡 Astuce : si la matière est référencée (notes, affectations,
              emplois du temps), la suppression échouera. Utilisez
              l'archivage à la place.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={hardDeleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {hardDeleteMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Suppression…
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Supprimer définitivement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatiereEditerPage;