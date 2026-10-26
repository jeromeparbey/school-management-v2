// frontend2/src/pages/dashboard/directeur/echeances/EcheanceNouvellePage.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ReceiptPercentIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon,
  InformationCircleIcon,
  BanknotesIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { useCreateEcheance } from '../../../../hooks/useEcheance';
import { usePlansScolarite } from '../../../../hooks/usePlanScolarite';
import { useEcheancesByPlan } from '../../../../hooks/useEcheance';
import { useToast } from '../../../../context/ToastContext';
import type { CreateEcheancePayload } from '../../../../types/echeance.types';
import type { PlanScolarite } from '../../../../types/planScolarite.types';

// ============================================
// HELPERS
// ============================================

const formatMoney = (amount: number, devise = 'XOF') =>
  new Intl.NumberFormat('fr-FR').format(amount) + ` ${devise}`;

// ============================================
// ÉTAT INITIAL
// ============================================

const initialForm: CreateEcheancePayload = {
  planScolariteId: '',
  nom: '',
  montant: 0,
  dateLimite: '',
  ordre: 1,
};

// ============================================
// COMPOSANT
// ============================================

const EcheanceNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState<CreateEcheancePayload>({
    ...initialForm,
    planScolariteId: searchParams.get('planScolariteId') ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateEcheance();

  // Plans disponibles
  const { data: plansData, isLoading: loadingPlans } = usePlansScolarite({
    limit: 200,
    estActif: true,
  });
  const plans: PlanScolarite[] = useMemo(
    () => plansData?.plans ?? [],
    [plansData]
  );

  // Échéances du plan sélectionné (pour éviter les doublons d'ordre et calculer le reste)
  const { data: echeancesData } = useEcheancesByPlan(
    form.planScolariteId || undefined
  );

  const echeancesExistantes = echeancesData?.data?.echeances ?? [];
  const planStats = echeancesData?.data?.stats;
  const planSelectionne = plans.find((p) => p.id === form.planScolariteId);

  // Auto-suggest ordre suivant
  useEffect(() => {
    if (form.planScolariteId && echeancesExistantes.length > 0 && form.ordre === 1) {
      const maxOrdre = Math.max(...echeancesExistantes.map((e) => e.ordre));
      setForm((f) => ({ ...f, ordre: maxOrdre + 1 }));
    }
  }, [form.planScolariteId, echeancesExistantes.length]);

  // ─────────────────────────────────────────
  const updateField = <K extends keyof CreateEcheancePayload>(
    field: K,
    value: CreateEcheancePayload[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  // ─────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.planScolariteId) {
      errs.planScolariteId = 'Le plan de scolarité est obligatoire';
    }

    if (!form.nom.trim()) {
      errs.nom = 'Le nom est obligatoire';
    } else if (form.nom.trim().length > 100) {
      errs.nom = 'Maximum 100 caractères';
    }

    if (form.montant <= 0) {
      errs.montant = 'Le montant doit être supérieur à 0';
    }

    // Vérifier que la somme ne dépasse pas le plan
    if (planSelectionne && planStats) {
      const nouveauTotal = (planStats.totalEcheances ?? 0) + form.montant;
      if (nouveauTotal > planSelectionne.montantTotal + 0.01) {
        errs.montant = `Le total des échéances (${formatMoney(
          nouveauTotal,
          planSelectionne.devise
        )}) dépasse le montant du plan (${formatMoney(
          planSelectionne.montantTotal,
          planSelectionne.devise
        )})`;
      }
    }

    if (!form.dateLimite) {
      errs.dateLimite = 'La date limite est obligatoire';
    }

    if (form.ordre !== undefined && (form.ordre < 0 || form.ordre > 100)) {
      errs.ordre = "L'ordre doit être entre 0 et 100";
    }

    // Vérifier ordre unique
    if (
      echeancesExistantes.some((e) => e.ordre === (form.ordre ?? 1))
    ) {
      errs.ordre = `Une échéance avec l'ordre ${form.ordre} existe déjà`;
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning('Formulaire incomplet', 'Vérifiez les champs en rouge.');
    }

    return Object.keys(errs).length === 0;
  };

  // ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload: CreateEcheancePayload = {
        planScolariteId: form.planScolariteId,
        nom: form.nom.trim(),
        montant: form.montant,
        dateLimite: new Date(form.dateLimite).toISOString(),
        ordre: form.ordre ?? 1,
      };

      const res = await createMutation.mutateAsync(payload);

      if (res.success && res.data) {
        toast.success(
          'Échéance créée ! 🎉',
          `"${res.data.nom}" a été créée.`,
          {
            duration: 4000,
            action: {
              label: 'Voir les échéances du plan',
              onClick: () =>
                navigate(
                  `/dashboard/plans-scolarite/${form.planScolariteId}`
                ),
            },
          }
        );
        setTimeout(
          () => navigate(`/dashboard/plans-scolarite/${form.planScolariteId}`),
          1500
        );
      }
    } catch {
      /* toast géré par le hook */
    }
  };

  // ─────────────────────────────────────────
  const montantRestant = planStats?.montantRestantAPlanifier ?? null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/echeances"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          title="Retour"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ReceiptPercentIcon className="w-7 h-7 text-blue-600" />
            Nouvelle échéance
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ajoutez une tranche de paiement à un plan de scolarité
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* Plan de scolarité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Plan de scolarité <span className="text-red-500">*</span>
          </label>
          <select
            value={form.planScolariteId}
            onChange={(e) => updateField('planScolariteId', e.target.value)}
            disabled={loadingPlans}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              errors.planScolariteId
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200'
            } ${loadingPlans ? 'opacity-50' : ''}`}
          >
            <option value="">
              {loadingPlans
                ? 'Chargement…'
                : plans.length === 0
                ? 'Aucun plan disponible'
                : '-- Sélectionner un plan --'}
            </option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom} — {formatMoney(p.montantTotal, p.devise)}
              </option>
            ))}
          </select>
          {errors.planScolariteId && (
            <p className="text-xs text-red-600 mt-1.5">
              {errors.planScolariteId}
            </p>
          )}

          {plans.length === 0 && !loadingPlans && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1 text-xs text-amber-800">
                <p className="font-medium mb-1">
                  Aucun plan de scolarité n'existe
                </p>
                <Link
                  to="/dashboard/plans-scolarite/nouveau"
                  className="text-amber-900 underline hover:no-underline"
                >
                  Créer un plan de scolarité
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Aperçu du plan sélectionné */}
        {planSelectionne && planStats && (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <BanknotesIcon className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-semibold text-gray-900">
                {planSelectionne.nom}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-gray-500">Montant total</p>
                <p className="font-bold text-gray-900">
                  {formatMoney(
                    planSelectionne.montantTotal,
                    planSelectionne.devise
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Déjà planifié</p>
                <p className="font-bold text-gray-900">
                  {formatMoney(
                    planStats.totalEcheances,
                    planSelectionne.devise
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Restant à planifier</p>
                <p
                  className={`font-bold ${
                    montantRestant === 0
                      ? 'text-emerald-600'
                      : 'text-orange-600'
                  }`}
                >
                  {formatMoney(
                    montantRestant ?? 0,
                    planSelectionne.devise
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nom de l'échéance <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nom}
            onChange={(e) => updateField('nom', e.target.value)}
            placeholder="Ex: 1ère tranche"
            maxLength={100}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
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
              Montant <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                min={0}
                step={1000}
                value={form.montant}
                onChange={(e) =>
                  updateField('montant', Number(e.target.value) || 0)
                }
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  errors.montant
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
            </div>
            {errors.montant && (
              <p className="text-xs text-red-600 mt-1.5">{errors.montant}</p>
            )}
            {planSelectionne && form.montant > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {formatMoney(form.montant, planSelectionne.devise)}
              </p>
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
              value={form.ordre ?? 1}
              onChange={(e) =>
                updateField('ordre', Number(e.target.value) || 0)
              }
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.ordre ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.ordre ? (
              <p className="text-xs text-red-600 mt-1.5">{errors.ordre}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Position dans le plan (0 = première)
              </p>
            )}
          </div>
        </div>

        {/* Date limite */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Date limite <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={form.dateLimite?.slice(0, 10) ?? ''}
              onChange={(e) => updateField('dateLimite', e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
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

        {/* Info box */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-0.5">Comment ça marche ?</p>
            <p className="text-blue-700">
              Une fois créée, cette échéance peut recevoir des paiements
              partiels ou complets. Elle sera marquée comme <strong>payée</strong>{' '}
              automatiquement lorsque le total des paiements alloués atteindra
              son montant.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to="/dashboard/echeances"
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
                Créer l'échéance
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EcheanceNouvellePage;