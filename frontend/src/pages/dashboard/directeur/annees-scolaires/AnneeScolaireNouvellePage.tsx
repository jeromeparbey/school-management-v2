// frontend2/src/pages/dashboard/directeur/annees-scolaires/AnneeScolaireNouvellePage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useCreateAnneeScolaire } from '../../../../hooks/useAnneesScolaires';
import { useToast } from '../../../../context/ToastContext';
import type { CreateAnneeScolairePayload } from '../../../../types/anneeScolaire.types';

const AnneeScolaireNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<CreateAnneeScolairePayload>({
    nom: '',
    dateDebut: '',
    dateFin: '',
    estActive: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateAnneeScolaire();

  const updateField = <K extends keyof CreateAnneeScolairePayload>(
    field: K,
    value: CreateAnneeScolairePayload[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.nom.trim()) {
      errs.nom = 'Le nom est obligatoire';
    } else if (form.nom.trim().length > 50) {
      errs.nom = 'Maximum 50 caractères';
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
      const res = await createMutation.mutateAsync({
        nom: form.nom.trim(),
        dateDebut: new Date(form.dateDebut).toISOString(),
        dateFin: new Date(form.dateFin).toISOString(),
        estActive: form.estActive ?? false,
      });

      if (res.success && res.data) {
        toast.success(
          'Année scolaire créée ! 🎉',
          `"${res.data.nom}" a été créée avec succès.`,
          {
            duration: 4000,
            action: {
              label: 'Voir',
              onClick: () =>
                navigate(`/dashboard/annees-scolaires/${res.data!.id}`),
            },
          }
        );
        setTimeout(() => navigate('/dashboard/annees-scolaires'), 1500);
      }
    } catch {
      /* toast géré */
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/annees-scolaires"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="w-7 h-7 text-emerald-600" />
            Nouvelle année scolaire
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Créez une nouvelle année scolaire (ex: 2025-2026)
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nom <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={form.nom}
              onChange={(e) => updateField('nom', e.target.value)}
              placeholder="Ex: 2025-2026"
              maxLength={50}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none ${
                errors.nom ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.nom && (
            <p className="text-xs text-red-600 mt-1.5">{errors.nom}</p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date de début <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.dateDebut?.slice(0, 10) ?? ''}
              onChange={(e) => updateField('dateDebut', e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none ${
                errors.dateDebut ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.dateDebut && (
              <p className="text-xs text-red-600 mt-1.5">{errors.dateDebut}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date de fin <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.dateFin?.slice(0, 10) ?? ''}
              onChange={(e) => updateField('dateFin', e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none ${
                errors.dateFin ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.dateFin && (
              <p className="text-xs text-red-600 mt-1.5">{errors.dateFin}</p>
            )}
          </div>
        </div>

        {/* Toggle actif */}
        <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={form.estActive ?? false}
            onChange={(e) => updateField('estActive', e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Année scolaire active
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Une seule année peut être active à la fois. Les autres seront
              désactivées automatiquement.
            </p>
          </div>
        </label>

        {/* Info box */}
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="text-xs text-emerald-800">
            <p className="font-semibold mb-0.5">À propos</p>
            <p className="text-emerald-700">
              L'année scolaire est le conteneur global pour les classes, les
              périodes et les bulletins. Elle doit être active pour être
              utilisée dans les opérations courantes.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to="/dashboard/annees-scolaires"
            className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Création…
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" />
                Créer l'année
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnneeScolaireNouvellePage;