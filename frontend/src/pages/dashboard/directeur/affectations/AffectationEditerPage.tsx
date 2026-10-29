// frontend2/src/pages/dashboard/directeur/affectations/AffectationEditerPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowUturnLeftIcon,
  UserCircleIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import {
  useAffectation,
  useUpdateAffectation,
  useHardDeleteAffectation,
} from '../../../../hooks/useAffectations';
import { useEnseignants } from '../../../../hooks/useEnseignants';
import { useClasses } from '../../../../hooks/useClasses';
import { useMatieres } from '../../../../hooks/useMatieres';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import type { UpdateAffectationPayload } from '../../../../types/affectation.types';

// ============================================
// HELPERS
// ============================================

const toDateInput = (iso: string | null | undefined): string => {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
};

interface FormState {
  enseignantId: string;
  classeId: string;
  /** ✅ null = titulaire de classe (primaire, sans matière) */
  matiereId: string | null;
  anneeScolaireId: string;
  heuresHebdo: number;
  estPrincipal: boolean;
  valableDu: string;
  valableAu: string;
  estActive: boolean;
}

const EMPTY_FORM: FormState = {
  enseignantId: '',
  classeId: '',
  matiereId: null,
  anneeScolaireId: '',
  heuresHebdo: 0,
  estPrincipal: false,
  valableDu: '',
  valableAu: '',
  estActive: true,
};

// ============================================
// PAGE
// ============================================

const AffectationEditerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Requêtes
  const {
    data: affectation,
    isLoading,
    isError,
    error,
  } = useAffectation(id);

  const updateMutation = useUpdateAffectation();
  const hardDeleteMutation = useHardDeleteAffectation();

  // Référentiels
  const { data: enseignantsData } = useEnseignants({ limit: 100 });
  const { data: classesData } = useClasses({ limit: 100 });
  const { data: matieresData } = useMatieres({ limit: 100 });
  const { data: anneesData } = useAnneesScolaires({ limit: 50 });

  const enseignants = (enseignantsData as any)?.enseignants ?? [];
  const classes = classesData?.classes ?? [];
  const matieres =
    (matieresData as any)?.matieres ?? (matieresData as any)?.data ?? [];
  const annees = anneesData?.annees ?? [];

  // Formulaire
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [initialForm, setInitialForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmHardDelete, setConfirmHardDelete] = useState(false);

  // Pré-remplir quand les données arrivent
  useEffect(() => {
    if (affectation) {
      const filled: FormState = {
        enseignantId: affectation.enseignantId,
        classeId: affectation.classeId,
        matiereId: affectation.matiereId ?? null, // ✅ null si titulaire
        anneeScolaireId: affectation.anneeScolaireId,
        heuresHebdo: affectation.heuresHebdo ?? 0,
        estPrincipal: affectation.estPrincipal,
        valableDu: toDateInput(affectation.valableDu),
        valableAu: toDateInput(affectation.valableAu),
        estActive: affectation.estActive,
      };
      setForm(filled);
      setInitialForm(filled);
    }
  }, [affectation]);

  // Détection de changements
  const isDirty = useMemo(() => {
    return (
      form.enseignantId !== initialForm.enseignantId ||
      form.classeId !== initialForm.classeId ||
      form.matiereId !== initialForm.matiereId ||
      form.anneeScolaireId !== initialForm.anneeScolaireId ||
      form.heuresHebdo !== initialForm.heuresHebdo ||
      form.estPrincipal !== initialForm.estPrincipal ||
      form.valableDu !== initialForm.valableDu ||
      form.valableAu !== initialForm.valableAu ||
      form.estActive !== initialForm.estActive
    );
  }, [form, initialForm]);

  // Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? Number(value)
          : value,
    }));
    if (errors[name]) {
      setErrors((p) => {
        const next = { ...p };
        delete next[name];
        return next;
      });
    }
  };

  /** 🔑 Handler spécifique pour la matière (gère la valeur vide → null) */
  const handleMatiereChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      // ✅ '' → null (titulaire) ; cuid → matière sélectionnée
      matiereId: value === '' ? null : value,
    }));
    if (errors.matiereId) {
      setErrors((p) => {
        const next = { ...p };
        delete next.matiereId;
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.enseignantId) e.enseignantId = 'Enseignant requis';
    if (!form.classeId) e.classeId = 'Classe requise';
    // ✅ matiereId N'EST PAS requis (nullable = titulaire)
    if (!form.anneeScolaireId) e.anneeScolaireId = 'Année scolaire requise';
    if (!form.valableDu) e.valableDu = 'Date de début requise';
    if (
      form.valableAu &&
      new Date(form.valableAu) <= new Date(form.valableDu)
    ) {
      e.valableAu = 'La date de fin doit être après la date de début';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: UpdateAffectationPayload = {};
    if (form.enseignantId !== initialForm.enseignantId)
      payload.enseignantId = form.enseignantId;
    if (form.classeId !== initialForm.classeId) payload.classeId = form.classeId;
    // ✅ matiereId : null explicite si on a vidé la matière
    if (form.matiereId !== initialForm.matiereId)
      payload.matiereId = form.matiereId;
    if (form.anneeScolaireId !== initialForm.anneeScolaireId)
      payload.anneeScolaireId = form.anneeScolaireId;
    if (form.heuresHebdo !== initialForm.heuresHebdo)
      payload.heuresHebdo = form.heuresHebdo;
    if (form.estPrincipal !== initialForm.estPrincipal)
      payload.estPrincipal = form.estPrincipal;
    if (form.valableDu !== initialForm.valableDu)
      payload.valableDu = form.valableDu;
    if (form.valableAu !== initialForm.valableAu)
      payload.valableAu = form.valableAu || null;
    if (form.estActive !== initialForm.estActive)
      payload.estActive = form.estActive;

    if (Object.keys(payload).length === 0) {
      navigate(`/dashboard/affectations/${id}`);
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: id!, payload });
      navigate(`/dashboard/affectations/${id}`);
    } catch {
      /* toasté */
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
  };

  const handleHardDelete = async () => {
    try {
      await hardDeleteMutation.mutateAsync(id!);
      navigate('/dashboard/affectations');
    } catch {
      /* toasté */
    }
  };

  // ─────────── Loading ───────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="text-gray-500 mt-4">Chargement…</p>
        </div>
      </div>
    );
  }

  // ─────────── Erreur ───────────
  if (isError || !affectation) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Affectation introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/dashboard/affectations"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Retour
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────── Render ───────────
  return (
    <div className="space-y-6 w-full max-w-[1200px] mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/affectations" className="hover:text-gray-900">
          Affectations
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link
          to={`/dashboard/affectations/${affectation.id}`}
          className="hover:text-gray-900 truncate max-w-[200px]"
        >
          {affectation.enseignant?.prenom} {affectation.enseignant?.nom}
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
            to={`/dashboard/affectations/${affectation.id}`}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <PencilSquareIcon className="w-8 h-8" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                Modifier l'affectation
              </h1>
              {isDirty && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-amber-50 text-amber-700 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Modifications non enregistrées
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {affectation.enseignant?.prenom} {affectation.enseignant?.nom} →{' '}
              {affectation.classe?.nom}
              {affectation.matiere?.nom
                ? ` · ${affectation.matiere.nom}`
                : ' · Titulaire'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Formulaire */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 space-y-5"
      >
        {/* Enseignant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Enseignant <span className="text-red-500">*</span>
          </label>
          <select
            name="enseignantId"
            value={form.enseignantId}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
              errors.enseignantId ? 'border-red-400' : 'border-gray-200'
            }`}
          >
            <option value="">— Sélectionner un enseignant —</option>
            {enseignants.map((e: any) => (
              <option key={e.id} value={e.id}>
                {e.prenom} {e.nom}
                {e.matricule ? ` (${e.matricule})` : ''}
                {e.specialite ? ` · ${e.specialite}` : ''}
              </option>
            ))}
          </select>
          {errors.enseignantId && (
            <p className="text-xs text-red-600 mt-1">{errors.enseignantId}</p>
          )}
        </div>

        {/* Classe + Matière */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Classe <span className="text-red-500">*</span>
            </label>
            <select
              name="classeId"
              value={form.classeId}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                errors.classeId ? 'border-red-400' : 'border-gray-200'
              }`}
            >
              <option value="">— Sélectionner —</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                  {c.code ? ` (${c.code})` : ''}
                </option>
              ))}
            </select>
            {errors.classeId && (
              <p className="text-xs text-red-600 mt-1">{errors.classeId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Matière{' '}
              <span className="text-gray-400 text-xs">(optionnel)</span>
            </label>
            <select
              name="matiereId"
              value={form.matiereId ?? ''}
              onChange={handleMatiereChange}
              // ✅ Plus de required
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                errors.matiereId ? 'border-red-400' : 'border-gray-200'
              }`}
            >
              {/* ✅ Option "Aucune matière" en tête */}
              <option value="">👤 Aucune matière — Titulaire de classe</option>
              {matieres.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                  {m.code ? ` (${m.code})` : ''}
                </option>
              ))}
            </select>
            {form.matiereId === null && (
              <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                <UserCircleIcon className="w-3 h-3" />
                Mode titulaire : cet enseignant couvrira la classe entière
              </p>
            )}
            {errors.matiereId && (
              <p className="text-xs text-red-600 mt-1">{errors.matiereId}</p>
            )}
          </div>
        </div>

        {/* Année scolaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Année scolaire <span className="text-red-500">*</span>
          </label>
          <select
            name="anneeScolaireId"
            value={form.anneeScolaireId}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
              errors.anneeScolaireId ? 'border-red-400' : 'border-gray-200'
            }`}
          >
            <option value="">— Sélectionner —</option>
            {annees.map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.nom}
                {a.estActive ? ' (active)' : ''}
              </option>
            ))}
          </select>
          {errors.anneeScolaireId && (
            <p className="text-xs text-red-600 mt-1">
              {errors.anneeScolaireId}
            </p>
          )}
        </div>

        {/* Heures + Principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Heures / semaine
            </label>
            <input
              type="number"
              name="heuresHebdo"
              min={0}
              max={100}
              step={0.5}
              value={form.heuresHebdo}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">0 à 100 heures</p>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                name="estPrincipal"
                checked={form.estPrincipal}
                onChange={handleChange}
                className="w-4 h-4 rounded text-indigo-600"
              />
              Enseignant principal de cette classe
            </label>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Valable du <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="valableDu"
              value={form.valableDu}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                errors.valableDu ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.valableDu && (
              <p className="text-xs text-red-600 mt-1">{errors.valableDu}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Valable au{' '}
              <span className="text-gray-400 text-xs">(optionnel)</span>
            </label>
            <input
              type="date"
              name="valableAu"
              value={form.valableAu}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                errors.valableAu ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.valableAu && (
              <p className="text-xs text-red-600 mt-1">{errors.valableAu}</p>
            )}
          </div>
        </div>

        {/* Active */}
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            name="estActive"
            checked={form.estActive}
            onChange={handleChange}
            className="w-4 h-4 rounded text-indigo-600"
          />
          Affectation active
        </label>

        {/* Info unicité — s'adapte au cas titulaire */}
        <div className="flex items-start gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
          <InformationCircleIcon className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-800">
            <p className="font-semibold mb-0.5">Contrainte d'unicité</p>
            <p>
              {form.matiereId ? (
                <>
                  Un enseignant ne peut être affecté qu'une seule fois à la même
                  combinaison <strong>(classe + matière + année)</strong>.
                </>
              ) : (
                <>
                  Un enseignant ne peut être <strong>titulaire</strong> que
                  d'une seule fois par classe et par année.
                </>
              )}{' '}
              Si vous changez l'un de ces champs et qu'un doublon existe déjà, la
              modification sera refusée (erreur 409).
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
          {/* Zone gauche : suppression + reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmHardDelete(true)}
              disabled={hardDeleteMutation.isPending}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 font-medium disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </button>
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                title="Revenir aux valeurs initiales"
              >
                <ArrowUturnLeftIcon className="w-4 h-4" />
                Réinitialiser
              </button>
            )}
          </div>

          {/* Zone droite : annuler + enregistrer */}
          <div className="flex items-center gap-2 sm:justify-end">
            <Link
              to={`/dashboard/affectations/${affectation.id}`}
              className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              title={!isDirty ? 'Aucune modification à enregistrer' : undefined}
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

      {/* Dialog suppression */}
      {confirmHardDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Supprimer définitivement
                </h2>
                <p className="text-xs text-gray-500">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700">
              L'affectation de{' '}
              <strong>
                {affectation.enseignant?.prenom} {affectation.enseignant?.nom}
              </strong>{' '}
              pour <strong>{affectation.classe?.nom}</strong>
              {affectation.matiere?.nom ? (
                <> — <strong>{affectation.matiere.nom}</strong></>
              ) : (
                <> (titulaire de classe)</>
              )}{' '}
              sera supprimée définitivement.
            </p>

            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                Si des notes ont été saisies pour cette affectation, la
                suppression échouera (erreur 409). Utilisez plutôt "Désactiver"
                depuis la fiche détail.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmHardDelete(false)}
                className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleHardDelete}
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

export default AffectationEditerPage;