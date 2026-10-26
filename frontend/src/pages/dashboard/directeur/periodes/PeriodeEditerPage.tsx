// frontend2/src/pages/dashboard/directeur/periodes/PeriodeEditerPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import {
  usePeriode,
  useUpdatePeriode,
} from '../../../../hooks/usePeriodes';
import { useToast } from '../../../../context/ToastContext';
import type {
  UpdatePeriodePayload,
  TypePeriode,
} from '../../../../types/periode.types';

const TYPES: { value: TypePeriode; label: string }[] = [
  { value: 'TRIMESTRE', label: 'Trimestre' },
  { value: 'SEMESTRE', label: 'Semestre' },
  { value: 'BULLETIN', label: 'Bulletin' },
];

const PeriodeEditerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: periodeData, isLoading } = usePeriode(id);
  const updateMutation = useUpdatePeriode();

  const periode = periodeData?.data;

  const [form, setForm] = useState<UpdatePeriodePayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Pré-remplissage
  useEffect(() => {
    if (periode && !initialized) {
      setForm({
        nom: periode.nom,
        type: periode.type,
        dateDebut: periode.dateDebut,
        dateFin: periode.dateFin,
        ordre: periode.ordre,
        estActive: periode.estActive,
        estCloturee: periode.estCloturee,
      });
      setInitialized(true);
    }
  }, [periode, initialized]);

  const updateField = <K extends keyof UpdatePeriodePayload>(
    field: K,
    value: UpdatePeriodePayload[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !periode) return;

    const errs: Record<string, string> = {};
    if (!form.nom?.trim()) errs.nom = 'Le nom est obligatoire';

    if (form.dateDebut && form.dateFin) {
      if (new Date(form.dateDebut) >= new Date(form.dateFin)) {
        errs.dateFin = 'La date de fin doit être après la date de début';
      }
    }

    if (form.ordre !== undefined && (form.ordre < 1 || form.ordre > 10)) {
      errs.ordre = "L'ordre doit être entre 1 et 10";
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
          type: form.type,
          dateDebut: form.dateDebut
            ? new Date(form.dateDebut).toISOString()
            : undefined,
          dateFin: form.dateFin
            ? new Date(form.dateFin).toISOString()
            : undefined,
          ordre: form.ordre,
          estActive: form.estActive,
          estCloturee: form.estCloturee,
        },
      });
      navigate(`/dashboard/periodes/${id}`);
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

  if (!periode) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Période introuvable</p>
        <Link
          to="/dashboard/periodes"
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
          to={`/dashboard/periodes/${id}`}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="w-7 h-7 text-amber-600" />
            Modifier la période
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{periode.nom}</p>
        </div>
      </div>

      {/* Info : période clôturée */}
      {periode.estCloturee && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <LockClosedIcon className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm text-amber-800">
            <p className="font-medium mb-0.5">Période clôturée</p>
            <p className="text-xs text-amber-700">
              Cette période est clôturée. Rouvrez-la d'abord depuis la page de
              détail si vous voulez modifier ses dates ou son ordre.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nom ?? ''}
            onChange={(e) => updateField('nom', e.target.value)}
            maxLength={100}
            disabled={periode.estCloturee}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none disabled:opacity-50 ${
              errors.nom ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.nom && (
            <p className="text-xs text-red-600 mt-1.5">{errors.nom}</p>
          )}
        </div>

        {/* Type + Ordre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Type
            </label>
            <select
              value={form.type ?? 'TRIMESTRE'}
              onChange={(e) =>
                updateField('type', e.target.value as TypePeriode)
              }
              disabled={periode.estCloturee}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none disabled:opacity-50"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ordre
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.ordre ?? 1}
              onChange={(e) =>
                updateField('ordre', Number(e.target.value) || 1)
              }
              disabled={periode.estCloturee}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none disabled:opacity-50 ${
                errors.ordre ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.ordre && (
              <p className="text-xs text-red-600 mt-1.5">{errors.ordre}</p>
            )}
          </div>
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
              onChange={(e) => updateField('dateDebut', e.target.value)}
              disabled={periode.estCloturee}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none disabled:opacity-50 ${
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
              onChange={(e) => updateField('dateFin', e.target.value)}
              disabled={periode.estCloturee}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none disabled:opacity-50 ${
                errors.dateFin ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.dateFin && (
              <p className="text-xs text-red-600 mt-1.5">{errors.dateFin}</p>
            )}
          </div>
        </div>

        {/* Statuts */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={form.estActive ?? true}
              onChange={(e) =>
                updateField('estActive', e.target.checked)
              }
              disabled={periode.estCloturee}
              className="mt-0.5 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Période active
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Les notes peuvent être saisies.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
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
                Clôturer la période
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                ⚠️ Une fois clôturée, aucune note ne pourra être modifiée.
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to={`/dashboard/periodes/${id}`}
            className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending || periode.estCloturee}
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

export default PeriodeEditerPage;