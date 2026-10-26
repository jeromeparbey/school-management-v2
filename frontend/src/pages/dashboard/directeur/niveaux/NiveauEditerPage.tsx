// frontend2/src/pages/dashboard/directeur/niveaux/NiveauEditerPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  IdentificationIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { useNiveau, useUpdateNiveau } from '../../../../hooks/useNiveaux';
import { useToast } from '../../../../context/ToastContext';
import type { UpdateNiveauPayload } from '../../../../types/niveau.types';

const NiveauEditerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: niveauData, isLoading } = useNiveau(id);
  const updateMutation = useUpdateNiveau();

  const niveau = niveauData?.data;

  const [form, setForm] = useState<UpdateNiveauPayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (niveau && !initialized) {
      setForm({
        nom: niveau.nom,
        code: niveau.code,
        description: niveau.description,
        ordre: niveau.ordre,
      });
      setInitialized(true);
    }
  }, [niveau, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !niveau) return;

    const errs: Record<string, string> = {};
    if (!form.nom?.trim()) errs.nom = 'Le nom est obligatoire';
    if (!form.code?.trim()) errs.code = 'Le code est obligatoire';
    else if (!/^[A-Z0-9_-]+$/.test(form.code))
      errs.code = 'Majuscules, chiffres, _ ou - uniquement';

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning('Formulaire incomplet', 'Vérifiez les champs en rouge.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          nom: form.nom?.trim(),
          code: form.code?.trim().toUpperCase(),
          description: form.description?.trim() || null,
          ordre: form.ordre,
        },
      });
      navigate(`/dashboard/niveaux/${id}`);
    } catch {
      /* toast géré */
    }
  };

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

  if (!niveau) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Niveau introuvable</p>
        <Link
          to="/dashboard/niveaux"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to={`/dashboard/niveaux/${id}`}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AcademicCapIcon className="w-7 h-7 text-amber-600" />
            Modifier le niveau
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{niveau.nom}</p>
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
              value={form.nom ?? ''}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                errors.nom ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.nom && (
            <p className="text-xs text-red-600 mt-1">{errors.nom}</p>
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
              value={form.code ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  code: e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9_-]/g, ''),
                })
              }
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none font-mono uppercase ${
                errors.code ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.code && (
            <p className="text-xs text-red-600 mt-1">{errors.code}</p>
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
              setForm({
                ...form,
                ordre: e.target.value ? Number(e.target.value) : 0,
              })
            }
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            value={form.description ?? ''}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value || null })
            }
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to={`/dashboard/niveaux/${id}`}
            className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
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
      </form>
    </div>
  );
};

export default NiveauEditerPage;