// frontend2/src/pages/dashboard/directeur/echeances/EcheanceEditerPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ReceiptPercentIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import {
  useEcheance,
  useUpdateEcheance,
} from '../../../../hooks/useEcheance';
import { useToast } from '../../../../context/ToastContext';
import type { UpdateEcheancePayload } from '../../../../types/echeance.types';

// ============================================
// COMPOSANT
// ============================================

const EcheanceEditerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: echeanceData, isLoading } = useEcheance(id);
  const updateMutation = useUpdateEcheance();

  const echeance = echeanceData?.data;

  const [form, setForm] = useState<UpdateEcheancePayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Pré-remplissage
  useEffect(() => {
    if (echeance && !initialized) {
      setForm({
        nom: echeance.nom,
        montant: echeance.montant,
        dateLimite: echeance.dateLimite,
        ordre: echeance.ordre,
      });
      setInitialized(true);
    }
  }, [echeance, initialized]);

  const updateField = <K extends keyof UpdateEcheancePayload>(
    field: K,
    value: UpdateEcheancePayload[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !echeance) return;

    const errs: Record<string, string> = {};
    if (!form.nom?.trim()) errs.nom = 'Le nom est obligatoire';
    if (form.montant !== undefined && form.montant <= 0)
      errs.montant = 'Le montant doit être supérieur à 0';
    if (form.ordre !== undefined && (form.ordre < 0 || form.ordre > 100))
      errs.ordre = "L'ordre doit être entre 0 et 100";

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
          montant: form.montant,
          dateLimite: form.dateLimite
            ? new Date(form.dateLimite).toISOString()
            : undefined,
          ordre: form.ordre,
        },
      });
      navigate(`/dashboard/plans-scolarite/${echeance.planScolariteId}`);
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

  if (!echeance) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Échéance introuvable</p>
        <Link
          to="/dashboard/echeances"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </Link>
      </div>
    );
  }

  const devise = echeance.planScolarite?.devise ?? 'XOF';
  const isPayee = echeance.estPayee;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to={`/dashboard/plans-scolarite/${echeance.planScolariteId}`}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ReceiptPercentIcon className="w-7 h-7 text-amber-600" />
            Modifier l'échéance
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {echeance.nom} — {echeance.planScolarite?.nom}
          </p>
        </div>
      </div>

      {/* Info : échéance payée */}
      {isPayee && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <LockClosedIcon className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm text-emerald-800">
            <p className="font-medium mb-0.5">Échéance payée</p>
            <p className="text-xs text-emerald-700">
              Cette échéance a été entièrement payée. Vous pouvez toujours
              modifier le nom ou la date limite, mais le montant ne devrait plus
              changer.
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
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
              errors.nom ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.nom && (
            <p className="text-xs text-red-600 mt-1.5">{errors.nom}</p>
          )}
        </div>

        {/* Montant + Ordre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Montant ({devise})
            </label>
            <div className="relative">
              <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                min={0}
                step={1000}
                value={form.montant ?? 0}
                onChange={(e) =>
                  updateField('montant', Number(e.target.value) || 0)
                }
                disabled={isPayee}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none disabled:opacity-50 ${
                  errors.montant
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
            </div>
            {errors.montant && (
              <p className="text-xs text-red-600 mt-1.5">{errors.montant}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ordre
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.ordre ?? 0}
              onChange={(e) =>
                updateField('ordre', Number(e.target.value) || 0)
              }
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                errors.ordre ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.ordre && (
              <p className="text-xs text-red-600 mt-1.5">{errors.ordre}</p>
            )}
          </div>
        </div>

        {/* Date limite */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Date limite
          </label>
          <div className="relative">
            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={form.dateLimite?.slice(0, 10) ?? ''}
              onChange={(e) => updateField('dateLimite', e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                errors.dateLimite
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200'
              }`}
            />
          </div>
          {errors.dateLimite && (
            <p className="text-xs text-red-600 mt-1.5">{errors.dateLimite}</p>
          )}
        </div>

        {/* Info paiements existants */}
        {echeance._count?.allocationsPaiement ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
            <div className="text-xs text-gray-700">
              <p className="font-semibold mb-0.5">Paiements rattachés</p>
              <p>
                {echeance._count.allocationsPaiement} paiement(s) sont
                actuellement alloués à cette échéance. Modifier le montant peut
                affecter le calcul du solde.
              </p>
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to={`/dashboard/plans-scolarite/${echeance.planScolariteId}`}
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

export default EcheanceEditerPage;