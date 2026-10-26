// frontend2/src/pages/dashboard/directeur/classes/ClasseEditerPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  IdentificationIcon,
  UserGroupIcon,
  MapPinIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useClasse, useUpdateClasse } from '../../../../hooks/useClasses';
import { useNiveaux } from '../../../../hooks/useNiveaux';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import { useToast } from '../../../../context/ToastContext';
import type { UpdateClassePayload } from '../../../../types/classe.types';
import type { Niveau } from '../../../../types/niveau.types';
import type { AnneeScolaire } from '../../../../types/anneeScolaire.types';

const ClasseEditerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: classeData, isLoading } = useClasse(id);

  // ✅ Niveaux normalisés
  const { data: niveauxData } = useNiveaux({
    limit: 200,
    sortBy: 'ordre',
    sortOrder: 'asc',
  });

  // ✅ NOUVEAU : années scolaires
  const { data: anneesData, isLoading: loadingAnnees } = useAnneesScolaires({
    limit: 200,
    sortBy: 'dateDebut',
    sortOrder: 'desc',
  });

  const updateMutation = useUpdateClasse();

  const classe = classeData?.data;

  // ✅ Niveaux
  const niveaux: Niveau[] = useMemo(
    () => niveauxData?.niveaux ?? [],
    [niveauxData]
  );

  // ✅ Années scolaires
  const anneesScolaires: AnneeScolaire[] = useMemo(
    () => anneesData?.annees ?? [],
    [anneesData]
  );

  const [form, setForm] = useState<UpdateClassePayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Pré-remplissage
  useEffect(() => {
    if (classe && !initialized) {
      setForm({
        nom: classe.nom,
        code: classe.code,
        capacite: classe.capacite,
        salle: classe.salle,
        niveauId: classe.niveauId,
        anneeScolaireId: classe.anneeScolaireId,
        estActive: classe.estActive,
      });
      setInitialized(true);
    }
  }, [classe, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !classe) return;

    const errs: Record<string, string> = {};
    if (!form.nom?.trim()) errs.nom = 'Le nom est obligatoire';
    if (!form.code?.trim()) errs.code = 'Le code est obligatoire';
    else if (!/^[A-Z0-9_-]+$/.test(form.code))
      errs.code = 'Majuscules, chiffres, _ ou - uniquement';
    if (!form.anneeScolaireId)
      errs.anneeScolaireId = "L'année scolaire est obligatoire";

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
          capacite: form.capacite ?? null,
          salle: form.salle?.trim() || null,
          niveauId: form.niveauId,
          anneeScolaireId: form.anneeScolaireId,
          estActive: form.estActive,
        },
      });
      navigate(`/dashboard/classes/${id}`);
    } catch {
      /* toast géré */
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-500 mt-4">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!classe) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Classe introuvable</p>
        <Link
          to="/dashboard/classes"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to={`/dashboard/classes/${id}`}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BuildingOfficeIcon className="w-7 h-7 text-amber-600" />
            Modifier la classe
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{classe.nom}</p>
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
            <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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

        {/* Niveau */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Niveau <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <AcademicCapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={form.niveauId ?? ''}
              onChange={(e) =>
                setForm({ ...form, niveauId: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            >
              <option value="">-- Sélectionner --</option>
              {niveaux.map((n: Niveau) => (
                <option key={n.id} value={n.id}>
                  {n.ordre}. {n.nom} ({n.code})
                </option>
              ))}
            </select>
          </div>
          {niveaux.length === 0 && (
            <p className="text-xs text-amber-600 mt-1.5">
              ⚠️ Aucun niveau disponible. Créez-en un d'abord.
            </p>
          )}
        </div>

        {/* ✅ Année scolaire — SELECT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Année scolaire <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={form.anneeScolaireId ?? ''}
              onChange={(e) =>
                setForm({ ...form, anneeScolaireId: e.target.value })
              }
              disabled={loadingAnnees}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
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
              {anneesScolaires.map((a: AnneeScolaire) => (
                <option key={a.id} value={a.id}>
                  {a.nom}
                  {a.estActive ? ' (active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Alerte si aucune année */}
          {anneesScolaires.length === 0 && !loadingAnnees && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1 text-xs text-amber-800">
                <p className="font-medium mb-1">
                  Aucune année scolaire n'existe
                </p>
                <p className="text-amber-700 mb-2">
                  Une année scolaire est obligatoire pour rattacher une classe.
                </p>
                <Link
                  to="/dashboard/annees-scolaires/nouveau"
                  className="inline-flex items-center gap-1 font-medium text-amber-900 underline hover:no-underline"
                >
                  <CalendarDaysIcon className="w-3.5 h-3.5" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Capacité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Capacité
            </label>
            <div className="relative">
              <UserGroupIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                min={1}
                max={500}
                value={form.capacite ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    capacite: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Nombre maximum d'élèves
            </p>
          </div>

          {/* Salle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Salle
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={form.salle ?? ''}
                onChange={(e) =>
                  setForm({ ...form, salle: e.target.value || null })
                }
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Statut */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.estActive ?? true}
            onChange={(e) =>
              setForm({ ...form, estActive: e.target.checked })
            }
            className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm text-gray-700">
            Classe active (les élèves peuvent être inscrits)
          </span>
        </label>

        {/* Info box */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-0.5">Attention</p>
            <p className="text-blue-700">
              Changer l'année scolaire peut affecter les inscriptions et les
              bulletins existants. Vérifiez avant de modifier.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to={`/dashboard/classes/${id}`}
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

export default ClasseEditerPage;