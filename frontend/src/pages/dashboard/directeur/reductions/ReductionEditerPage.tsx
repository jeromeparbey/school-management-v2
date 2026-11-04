// frontend2/src/pages/dashboard/directeur/reductions/ReductionEditerPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ReceiptPercentIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  SparklesIcon,
  InformationCircleIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  useReduction,
  useUpdateReduction,
} from '../../../../hooks/useReduction';
import { useToast } from '../../../../context/ToastContext';
import { MoneyInput } from '../../../../components/ui/MoneyInput';
import type { TypeReduction } from '../../../../types/reduction.types';

// ═══════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════

const TYPE_OPTIONS: { value: TypeReduction; label: string; desc: string }[] =
  [
    {
      value: 'FIXE',
      label: 'Montant fixe',
      desc: 'Réduction en F CFA (ex: 5000 F CFA)',
    },
    {
      value: 'POURCENTAGE',
      label: 'Pourcentage',
      desc: 'Réduction en % du plan (ex: 15%)',
    },
  ];

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

const ReductionEditerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: reductionData, isLoading, isError } = useReduction(id);
  const updateMutation = useUpdateReduction();

  const reduction: any = (reductionData as any)?.data ?? reductionData;

  const [form, setForm] = useState({
    type: 'FIXE' as TypeReduction,
    valeur: 0,
    motif: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pré-remplir le formulaire
  useEffect(() => {
    if (reduction) {
      setForm({
        type: reduction.type,
        valeur: reduction.valeur,
        motif: reduction.motif,
      });
    }
  }, [reduction]);

  const updateField = <K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.motif.trim()) errs.motif = 'Le motif est obligatoire';
    else if (form.motif.trim().length < 3)
      errs.motif = 'Minimum 3 caractères';

    if (form.type === 'FIXE') {
      if (form.valeur <= 0) errs.valeur = 'Le montant doit être supérieur à 0';
    } else {
      if (form.valeur <= 0 || form.valeur > 100)
        errs.valeur = 'Le pourcentage doit être entre 0 et 100';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning('Formulaire incomplet', 'Vérifiez les champs en rouge.');
    }
    return Object.keys(errs).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateMutation.mutateAsync({
        id: id!,
        payload: {
          type: form.type,
          valeur: form.valeur,
          motif: form.motif.trim(),
        },
      });
      toast.success('Réduction mise à jour');
      setTimeout(() => navigate('/dashboard/reductions'), 1500);
    } catch {
      /* toasté */
    }
  };

  // ─────────── Loading ───────────
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

  // ─────────── Erreur ───────────
  if (isError || !reduction) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Réduction introuvable</p>
        <Link
          to="/dashboard/reductions"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour aux réductions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 p-6">
      {/* ═══════════ EN-TÊTE ═══════════ */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/reductions"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          title="Retour"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <ReceiptPercentIcon className="w-5 h-5" />
            </div>
            Modifier la réduction
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {reduction.eleve?.prenom} {reduction.eleve?.nom}
          </p>
        </div>
      </div>

      {/* ═══════════ FORMULAIRE ═══════════ */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de réduction <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateField('type', opt.value)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  form.type === opt.value
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-gray-50 border-gray-200 hover:border-emerald-200'
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">
                  {opt.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Valeur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {form.type === 'FIXE'
              ? 'Montant de la réduction (F CFA)'
              : 'Pourcentage de réduction (%)'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            {form.type === 'FIXE' ? (
              <MoneyInput
                value={form.valeur}
                onChange={(v) => updateField('valeur', v)}
                placeholder="0"
                min={0}
                step={1000}
                withThousandsSeparator
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
                  errors.valeur
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
            ) : (
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={form.valeur || ''}
                onChange={(e) =>
                  updateField('valeur', Number(e.target.value) || 0)
                }
                placeholder="0"
                className={`w-full pl-10 pr-16 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
                  errors.valeur
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
            )}
            {form.type === 'POURCENTAGE' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                %
              </span>
            )}
          </div>
          {errors.valeur && (
            <p className="text-xs text-red-600 mt-1.5">{errors.valeur}</p>
          )}
        </div>

        {/* Motif */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Motif <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.motif}
            onChange={(e) => updateField('motif', e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Ex: Bourse partielle, fratrie, situation sociale…"
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-all ${
              errors.motif ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          <div className="flex items-center justify-between mt-1.5">
            {errors.motif ? (
              <p className="text-xs text-red-600">{errors.motif}</p>
            ) : (
              <p className="text-xs text-gray-500">
                Raison de la réduction (visible sur le reçu)
              </p>
            )}
            <span className="text-xs text-gray-400">
              {form.motif.length}/500
            </span>
          </div>
        </div>

        {/* Info box */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="text-xs text-emerald-800">
            <p className="font-semibold mb-0.5">Modification</p>
            <p className="text-emerald-700">
              Les modifications seront automatiquement répercutées sur le
              solde restant de l'élève. Le calcul est refait côté serveur.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to="/dashboard/reductions"
            className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Mise à jour…
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReductionEditerPage;