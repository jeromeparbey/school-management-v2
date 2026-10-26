// frontend2/src/pages/dashboard/directeur/niveaux/NiveauNouvellePage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  IdentificationIcon,
  SparklesIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useCreateNiveau } from '../../../../hooks/useNiveaux';
import { useToast } from '../../../../context/ToastContext';
import type { CreateNiveauPayload } from '../../../../types/niveau.types';

const initialForm: CreateNiveauPayload = {
  nom: '',
  code: '',
  description: null,
  ordre: 0,
};

const NiveauNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<CreateNiveauPayload>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateNiveau();

  const updateField = <K extends keyof CreateNiveauPayload>(
    field: K,
    value: CreateNiveauPayload[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!form.nom.trim()) {
      errs.nom = 'Le nom est obligatoire';
    } else if (form.nom.trim().length < 2) {
      errs.nom = 'Minimum 2 caractères';
    }
    if (!form.code.trim()) {
      errs.code = 'Le code est obligatoire';
    } else if (!/^[A-Z0-9_-]+$/.test(form.code)) {
      errs.code = 'Majuscules, chiffres, _ ou - uniquement';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning('Formulaire incomplet', 'Vérifiez les champs en rouge.');
      return;
    }

    try {
      const res = await createMutation.mutateAsync({
        nom: form.nom.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description?.trim() || null,
        ordre: form.ordre ?? 0,
      });

      if (res.success && res.data) {
        toast.success(
          'Niveau créé ! 🎉',
          `"${res.data.nom}" (${res.data.code}) a été créé avec succès.`,
          {
            duration: 4000,
            action: {
              label: 'Voir le détail',
              onClick: () =>
                navigate(`/dashboard/niveaux/${res.data!.id}`),
            },
          }
        );
        setTimeout(() => navigate('/dashboard/niveaux'), 1500);
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
          to="/dashboard/niveaux"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AcademicCapIcon className="w-7 h-7 text-indigo-600" />
            Nouveau niveau
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Créez un niveau scolaire (6ème, 5ème, CM2…)
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
            <AcademicCapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={form.nom}
              onChange={(e) => updateField('nom', e.target.value)}
              placeholder="Ex: 6ème"
              maxLength={100}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none ${
                errors.nom ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.nom && (
            <p className="text-xs text-red-600 mt-1.5">{errors.nom}</p>
          )}
        </div>

        {/* Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Code unique <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={form.code}
              onChange={(e) =>
                updateField(
                  'code',
                  e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '')
                )
              }
              placeholder="Ex: 6EME"
              maxLength={50}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono uppercase ${
                errors.code ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            MAJUSCULES, chiffres, tirets et underscores uniquement
          </p>
          {errors.code && (
            <p className="text-xs text-red-600 mt-1.5">{errors.code}</p>
          )}
        </div>

        {/* Ordre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Ordre
          </label>
          <input
            type="number"
            min={0}
            max={1000}
            value={form.ordre ?? 0}
            onChange={(e) =>
              updateField(
                'ordre',
                e.target.value ? Number(e.target.value) : 0
              )
            }
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <p className="text-xs text-gray-500 mt-1.5">
            Plus petit = affiché en premier (ex: 1 pour 6ème, 2 pour 5ème…)
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            value={form.description ?? ''}
            onChange={(e) =>
              updateField('description', e.target.value || null)
            }
            rows={3}
            maxLength={500}
            placeholder="Description optionnelle…"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
          />
          <p className="text-xs text-gray-500 mt-1.5">
            {(form.description?.length ?? 0)} / 500 caractères
          </p>
        </div>

        {/* Info box */}
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div className="text-xs text-indigo-800">
            <p className="font-semibold mb-0.5">À propos du code</p>
            <p className="text-indigo-700">
              Le code doit être unique et ne pourra plus être modifié
              facilement. Utilisez un code court et parlant (ex:{' '}
              <code className="bg-indigo-100 px-1 rounded">6EME</code>,{' '}
              <code className="bg-indigo-100 px-1 rounded">CM2</code>).
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to="/dashboard/niveaux"
            className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Création…
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" />
                Créer le niveau
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NiveauNouvellePage;