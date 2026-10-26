// frontend2/src/pages/dashboard/directeur/periodes/PeriodeNouvellePage.tsx

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useCreatePeriode } from '../../../../hooks/usePeriodes';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import { useToast } from '../../../../context/ToastContext';
import type {
  CreatePeriodePayload,
  TypePeriode,
} from '../../../../types/periode.types';
import type { AnneeScolaire } from '../../../../types/anneeScolaire.types';

// ============================================
// CONSTANTES
// ============================================

const TYPES: { value: TypePeriode; label: string; description: string }[] = [
  {
    value: 'TRIMESTRE',
    label: 'Trimestre',
    description: '3 périodes par an (1er, 2e, 3e trimestre)',
  },
  {
    value: 'SEMESTRE',
    label: 'Semestre',
    description: '2 périodes par an (1er, 2e semestre)',
  },
  {
    value: 'BULLETIN',
    label: 'Bulletin',
    description: 'Période personnalisée',
  },
];

// ============================================
// ÉTAT INITIAL
// ============================================

const initialForm: CreatePeriodePayload = {
  nom: '',
  type: 'TRIMESTRE',
  dateDebut: '',
  dateFin: '',
  ordre: 1,
  anneeScolaireId: '',
  estActive: true,
  estCloturee: false,
};

// ============================================
// COMPOSANT
// ============================================

const PeriodeNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<CreatePeriodePayload>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreatePeriode();

  // Années scolaires
  const { data: anneesData, isLoading: loadingAnnees } = useAnneesScolaires({
    limit: 100,
    sortBy: 'dateDebut',
    sortOrder: 'desc',
  });

  const anneesScolaires: AnneeScolaire[] = useMemo(
    () => anneesData?.annees ?? [],
    [anneesData]
  );

  // Auto-sélectionner l'année active
  const [autoSelected, setAutoSelected] = useState(false);
  React.useEffect(() => {
    if (!autoSelected && anneesScolaires.length > 0 && !form.anneeScolaireId) {
      const active = anneesScolaires.find((a) => a.estActive);
      if (active) {
        setForm((f) => ({ ...f, anneeScolaireId: active.id }));
        setAutoSelected(true);
      }
    }
  }, [anneesScolaires, autoSelected, form.anneeScolaireId]);

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const updateField = <K extends keyof CreatePeriodePayload>(
    field: K,
    value: CreatePeriodePayload[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.nom.trim()) {
      errs.nom = 'Le nom est obligatoire';
    } else if (form.nom.trim().length > 100) {
      errs.nom = 'Maximum 100 caractères';
    }

    if (!form.dateDebut) {
      errs.dateDebut = 'La date de début est obligatoire';
    }
    if (!form.dateFin) {
      errs.dateFin = 'La date de fin est obligatoire';
    }
    if (form.dateDebut && form.dateFin) {
      if (new Date(form.dateDebut) >= new Date(form.dateFin)) {
        errs.dateFin = 'La date de fin doit être après la date de début';
      }
    }

    if (!form.anneeScolaireId) {
      errs.anneeScolaireId = "L'année scolaire est obligatoire";
    }

    if (form.ordre < 1 || form.ordre > 10) {
      errs.ordre = "L'ordre doit être entre 1 et 10";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning('Formulaire incomplet', 'Vérifiez les champs en rouge.');
    }

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload: CreatePeriodePayload = {
        nom: form.nom.trim(),
        type: form.type,
        dateDebut: new Date(form.dateDebut).toISOString(),
        dateFin: new Date(form.dateFin).toISOString(),
        ordre: form.ordre,
        anneeScolaireId: form.anneeScolaireId,
        estActive: form.estActive ?? true,
        estCloturee: form.estCloturee ?? false,
      };

      const res = await createMutation.mutateAsync(payload);

      if (res.success && res.data) {
        toast.success(
          'Période créée ! 🎉',
          `"${res.data.nom}" (${res.data.type}) a été créée.`,
          {
            duration: 4000,
            action: {
              label: 'Voir le détail',
              onClick: () =>
                navigate(`/dashboard/periodes/${res.data!.id}`),
            },
          }
        );
        setTimeout(() => navigate('/dashboard/periodes'), 1500);
      }
    } catch {
      /* toast géré par le hook */
    }
  };

  // Type sélectionné
  const selectedType = TYPES.find((t) => t.value === form.type);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/periodes"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          title="Retour"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="w-7 h-7 text-blue-600" />
            Nouvelle période
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Créez une période (trimestre, semestre ou bulletin)
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* ─── Section Type ─── */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-blue-500" />
            Type de période
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => updateField('type', t.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  form.type === t.value
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">
                  {t.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t.description}
                </p>
              </button>
            ))}
          </div>

          {selectedType && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <InformationCircleIcon className="w-3.5 h-3.5" />
              {selectedType.description}
            </p>
          )}
        </div>

        {/* ─── Section Identification ─── */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="w-4 h-4 text-blue-500" />
            Identification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom de la période <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => updateField('nom', e.target.value)}
                placeholder="Ex: 1er Trimestre"
                maxLength={100}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  errors.nom ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.nom && (
                <p className="text-xs text-red-600 mt-1.5">{errors.nom}</p>
              )}
            </div>

            {/* Année scolaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Année scolaire <span className="text-red-500">*</span>
              </label>
              <select
                value={form.anneeScolaireId}
                onChange={(e) =>
                  updateField('anneeScolaireId', e.target.value)
                }
                disabled={loadingAnnees}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  errors.anneeScolaireId
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                } ${loadingAnnees ? 'opacity-50' : ''}`}
              >
                <option value="">
                  {loadingAnnees
                    ? 'Chargement…'
                    : anneesScolaires.length === 0
                    ? 'Aucune année disponible'
                    : '-- Sélectionner une année --'}
                </option>
                {anneesScolaires.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nom}
                    {a.estActive ? ' (active)' : ''}
                  </option>
                ))}
              </select>
              {anneesScolaires.length === 0 && !loadingAnnees && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1 text-xs text-amber-800">
                    <p className="font-medium mb-1">
                      Aucune année scolaire n'existe
                    </p>
                    <Link
                      to="/dashboard/annees-scolaires/nouveau"
                      className="text-amber-900 underline hover:no-underline"
                    >
                      Créer une année scolaire
                    </Link>
                  </div>
                </div>
              )}
              {errors.anneeScolaireId && (
                <p className="text-xs text-red-600 mt-1.5">
                  {errors.anneeScolaireId}
                </p>
              )}
            </div>

            {/* Ordre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ordre <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.ordre}
                onChange={(e) =>
                  updateField('ordre', Number(e.target.value) || 1)
                }
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  errors.ordre ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Position dans l'année (1 = première période)
              </p>
              {errors.ordre && (
                <p className="text-xs text-red-600 mt-1.5">{errors.ordre}</p>
              )}
            </div>
          </div>
        </div>

        {/* ─── Section Dates ─── */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="w-4 h-4 text-blue-500" />
            Période
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.dateDebut?.slice(0, 10) ?? ''}
                onChange={(e) => updateField('dateDebut', e.target.value)}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  errors.dateDebut
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              {errors.dateDebut && (
                <p className="text-xs text-red-600 mt-1.5">
                  {errors.dateDebut}
                </p>
              )}
            </div>

            {/* Date fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date de fin <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.dateFin?.slice(0, 10) ?? ''}
                onChange={(e) => updateField('dateFin', e.target.value)}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  errors.dateFin
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              {errors.dateFin && (
                <p className="text-xs text-red-600 mt-1.5">
                  {errors.dateFin}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ─── Section Statut ─── */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <LockClosedIcon className="w-4 h-4 text-blue-500" />
            Statut
          </h2>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={form.estActive ?? true}
                onChange={(e) =>
                  updateField('estActive', e.target.checked)
                }
                className="mt-0.5 w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Période active
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Les notes pourront être saisies pendant cette période.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={form.estCloturee ?? false}
                onChange={(e) =>
                  updateField('estCloturee', e.target.checked)
                }
                className="mt-0.5 w-5 h-5 rounded text-orange-600 focus:ring-orange-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Clôturer immédiatement
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  ⚠️ Une période clôturée ne peut plus recevoir de notes.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Info box */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-0.5">À propos</p>
            <p className="text-blue-700">
              Chaque période est rattachée à une année scolaire. L'ordre doit
              être unique pour une même année (ex: Trimestre 1 → ordre 1,
              Trimestre 2 → ordre 2…).
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to="/dashboard/periodes"
            className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Création…
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" />
                Créer la période
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PeriodeNouvellePage;