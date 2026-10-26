// frontend2/src/pages/dashboard/directeur/inscriptions/InscriptionEditerPage.tsx

import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  useInscription,
  useUpdateInscription,
} from '../../../../hooks/useInscriptions';
import { useClasses } from '../../../../hooks/useClasses';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import { useToast } from '../../../../context/ToastContext';
import type { AnneeScolaire } from '../../../../types/anneeScolaire.types'; // ⚠️ adapte le chemin si besoin

const InscriptionEditerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: inscription, isLoading } = useInscription(id);
  const updateMutation = useUpdateInscription();

  const { data: classesData } = useClasses({ limit: 200 });
  const classes = classesData?.classes ?? [];

  // ✅ Correction : le champ est `annees`, pas `anneesScolaires` / `data`
  const { data: anneesData } = useAnneesScolaires({ limit: 50 });
  const annees: AnneeScolaire[] = anneesData?.annees ?? [];

  const [classeId, setClasseId] = useState('');
  const [anneeScolaireId, setAnneeScolaireId] = useState('');
  const [dateInscription, setDateInscription] = useState('');
  const [estActive, setEstActive] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (inscription && !initialized) {
      setClasseId(inscription.classeId);
      setAnneeScolaireId(inscription.anneeScolaireId);
      setDateInscription(inscription.dateInscription.slice(0, 10));
      setEstActive(inscription.estActive);
      setInitialized(true);
    }
  }, [inscription, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const errs: Record<string, string> = {};
    if (!classeId) errs.classeId = 'Sélectionnez une classe';
    if (!anneeScolaireId) errs.anneeScolaireId = 'Sélectionnez une année';
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning('Formulaire incomplet');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          classeId,
          anneeScolaireId,
          dateInscription: new Date(dateInscription).toISOString(),
          estActive,
        },
      });
      navigate(`/dashboard/inscriptions/${id}`);
    } catch {
      /* toast géré par le hook */
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!inscription) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Inscription introuvable</p>
        <Link
          to="/dashboard/inscriptions"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to={`/dashboard/inscriptions/${id}`}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AcademicCapIcon className="w-7 h-7 text-amber-600" />
            Éditer l'inscription
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {inscription.eleve?.prenom} {inscription.eleve?.nom} —{' '}
            {inscription.eleve?.matricule}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* Info élève (non modifiable) */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-xs text-gray-500 uppercase font-bold mb-1">
            Élève (non modifiable)
          </p>
          <p className="text-sm font-medium text-gray-900">
            {inscription.eleve?.prenom} {inscription.eleve?.nom} —{' '}
            {inscription.eleve?.matricule}
          </p>
        </div>

        {/* Classe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Classe <span className="text-red-500">*</span>
          </label>
          <select
            value={classeId}
            onChange={(e) => {
              setClasseId(e.target.value);
              setErrors((x) => ({ ...x, classeId: '' }));
            }}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
              errors.classeId ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          >
            <option value="">— Sélectionner une classe —</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} ({c.code})
              </option>
            ))}
          </select>
          {errors.classeId && (
            <p className="text-xs text-red-600 mt-1.5">{errors.classeId}</p>
          )}
        </div>

        {/* Année */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Année scolaire <span className="text-red-500">*</span>
          </label>
          <select
            value={anneeScolaireId}
            onChange={(e) => {
              setAnneeScolaireId(e.target.value);
              setErrors((x) => ({ ...x, anneeScolaireId: '' }));
            }}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
              errors.anneeScolaireId
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200'
            }`}
          >
            <option value="">— Sélectionner une année —</option>
            {annees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nom} {a.estActive ? '(active)' : ''}
              </option>
            ))}
          </select>
          {errors.anneeScolaireId && (
            <p className="text-xs text-red-600 mt-1.5">
              {errors.anneeScolaireId}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Date d'inscription
          </label>
          <div className="relative">
            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateInscription}
              onChange={(e) => setDateInscription(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        {/* Est active */}
        <label className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl cursor-pointer hover:bg-emerald-100/50">
          <input
            type="checkbox"
            checked={estActive}
            onChange={(e) => setEstActive(e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded text-emerald-600"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Inscription active
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Décochez pour désactiver cette inscription (l'élève ne sera plus
              compté comme inscrit dans cette classe).
            </p>
          </div>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to={`/dashboard/inscriptions/${id}`}
            className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
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

export default InscriptionEditerPage;