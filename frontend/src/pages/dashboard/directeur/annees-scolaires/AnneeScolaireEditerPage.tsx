// frontend2/src/pages/dashboard/directeur/annees-scolaires/AnneeScolaireEditerPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  useAnneeScolaire,
  useUpdateAnneeScolaire,
} from '../../../../hooks/useAnneesScolaires';
import { useToast } from '../../../../context/ToastContext';
import type { UpdateAnneeScolairePayload } from '../../../../types/anneeScolaire.types';

const AnneeScolaireEditerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: anneeData, isLoading } = useAnneeScolaire(id);
  const updateMutation = useUpdateAnneeScolaire();

  const annee = anneeData?.data;

  const [form, setForm] = useState<UpdateAnneeScolairePayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (annee && !initialized) {
      setForm({
        nom: annee.nom,
        dateDebut: annee.dateDebut,
        dateFin: annee.dateFin,
        estActive: annee.estActive,
        estArchive: annee.estArchive,
      });
      setInitialized(true);
    }
  }, [annee, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !annee) return;

    const errs: Record<string, string> = {};
    if (!form.nom?.trim()) errs.nom = 'Le nom est obligatoire';
    if (form.dateDebut && form.dateFin) {
      if (new Date(form.dateDebut) >= new Date(form.dateFin)) {
        errs.dateFin = 'La date de fin doit être après la date de début';
      }
    }

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
          dateDebut: form.dateDebut
            ? new Date(form.dateDebut).toISOString()
            : undefined,
          dateFin: form.dateFin
            ? new Date(form.dateFin).toISOString()
            : undefined,
          estActive: form.estActive,
          estArchive: form.estArchive,
        },
      });
      navigate(`/dashboard/annees-scolaires/${id}`);
    } catch {
      /* toast géré */
    }
  };

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

  if (!annee) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Année introuvable</p>
        <Link
          to="/dashboard/annees-scolaires"
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
          to={`/dashboard/annees-scolaires/${id}`}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="w-7 h-7 text-amber-600" />
            Modifier l'année scolaire
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{annee.nom}</p>
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
              value={form.nom ?? ''}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
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
              Date de début
            </label>
            <input
              type="date"
              value={form.dateDebut?.slice(0, 10) ?? ''}
              onChange={(e) =>
                setForm({ ...form, dateDebut: e.target.value })
              }
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date de fin
            </label>
            <input
              type="date"
              value={form.dateFin?.slice(0, 10) ?? ''}
              onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                errors.dateFin ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.dateFin && (
              <p className="text-xs text-red-600 mt-1.5">{errors.dateFin}</p>
            )}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={form.estActive ?? false}
              onChange={(e) =>
                setForm({ ...form, estActive: e.target.checked })
              }
              className="mt-0.5 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Année scolaire active
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Si activée, désactive automatiquement les autres années.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={form.estArchive ?? false}
              onChange={(e) =>
                setForm({ ...form, estArchive: e.target.checked })
              }
              className="mt-0.5 w-5 h-5 rounded text-orange-600 focus:ring-orange-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Archiver cette année
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Les années archivées n'apparaissent plus dans les sélections.
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to={`/dashboard/annees-scolaires/${id}`}
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
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnneeScolaireEditerPage;