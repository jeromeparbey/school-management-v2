// frontend2/src/pages/dashboard/directeur/plans-scolarite/PlanScolariteEditerPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  BanknotesIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  usePlanScolarite,
  useUpdatePlanScolarite,
} from '../../../../hooks/usePlanScolarite';
import { useNiveaux } from '../../../../hooks/useNiveaux';
import { useClasses } from '../../../../hooks/useClasses';
import { useToast } from '../../../../context/ToastContext';
import type { UpdatePlanScolaritePayload } from '../../../../types/planScolarite.types';
import type { Niveau } from '../../../../types/niveau.types';
import type { Classe } from '../../../../types/classe.types';

// ============================================
// TYPES
// ============================================

interface AutreFraisItem {
  cle: string;
  montant: number;
}

// ============================================
// COMPOSANT
// ============================================

const PlanScolariteEditerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: planData, isLoading } = usePlanScolarite(id);
  const updateMutation = useUpdatePlanScolarite();

  const { data: niveauxData } = useNiveaux({ limit: 200 });
  const niveaux: Niveau[] = useMemo(
    () => niveauxData?.niveaux ?? [],
    [niveauxData]
  );

  const { data: classesData } = useClasses({ limit: 200 });
  const classes: Classe[] = useMemo(
    () => classesData?.classes ?? [],
    [classesData]
  );

  const plan = planData?.data;

  const [form, setForm] = useState({
    nom: '',
    description: '',
    niveauId: '',
    classeId: '',
    fraisInscription: 0,
    fraisScolarite: 0,
    devise: 'XOF',
    estActif: true,
  });
  const [autresFrais, setAutresFrais] = useState<AutreFraisItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Pré-remplissage
  useEffect(() => {
    if (plan && !initialized) {
      setForm({
        nom: plan.nom,
        description: plan.description ?? '',
        niveauId: plan.niveauId ?? '',
        classeId: plan.classeId ?? '',
        fraisInscription: plan.fraisInscription,
        fraisScolarite: plan.fraisScolarite,
        devise: plan.devise,
        estActif: plan.estActif,
      });

      // Convertir autresFrais en tableau
      if (plan.autresFrais && typeof plan.autresFrais === 'object') {
        const entries = Object.entries(
          plan.autresFrais as Record<string, number>
        );
        setAutresFrais(
          entries.map(([cle, montant]) => ({
            cle,
            montant: Number(montant) || 0,
          }))
        );
      }

      setInitialized(true);
    }
  }, [plan, initialized]);

  const updateField = <K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  const addAutreFrais = () => {
    setAutresFrais((prev) => [...prev, { cle: '', montant: 0 }]);
  };

  const updateAutreFrais = (
    index: number,
    field: keyof AutreFraisItem,
    value: string | number
  ) => {
    setAutresFrais((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeAutreFrais = (index: number) => {
    setAutresFrais((prev) => prev.filter((_, i) => i !== index));
  };

  // Calcul montant total
  const montantTotal = useMemo(() => {
    const autresTotal = autresFrais.reduce(
      (sum, f) => sum + (Number(f.montant) || 0),
      0
    );
    return form.fraisInscription + form.fraisScolarite + autresTotal;
  }, [form.fraisInscription, form.fraisScolarite, autresFrais]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !plan) return;

    const errs: Record<string, string> = {};
    if (!form.nom.trim()) errs.nom = 'Le nom est obligatoire';
    if (form.fraisInscription < 0)
      errs.fraisInscription = 'Le montant doit être positif';
    if (form.fraisScolarite < 0)
      errs.fraisScolarite = 'Le montant doit être positif';

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning('Formulaire incomplet', 'Vérifiez les champs en rouge.');
      return;
    }

    try {
      const autresFraisObj: Record<string, number> = {};
      autresFrais.forEach((f) => {
        if (f.cle.trim()) {
          autresFraisObj[f.cle.trim()] = f.montant;
        }
      });

      const payload: UpdatePlanScolaritePayload = {
        nom: form.nom.trim(),
        description: form.description.trim() || null,
        niveauId: form.niveauId || null,
        classeId: form.classeId || null,
        fraisInscription: form.fraisInscription,
        fraisScolarite: form.fraisScolarite,
        autresFrais:
          Object.keys(autresFraisObj).length > 0 ? autresFraisObj : null,
        montantTotal,
        devise: form.devise,
        estActif: form.estActif,
      };

      await updateMutation.mutateAsync({ id, payload });
      navigate(`/dashboard/plans-scolarite/${id}`);
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

  if (!plan) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Plan introuvable</p>
        <Link
          to="/dashboard/plans-scolarite"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to={`/dashboard/plans-scolarite/${id}`}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BanknotesIcon className="w-7 h-7 text-amber-600" />
            Modifier le plan
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{plan.nom}</p>
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
          <input
            type="text"
            value={form.nom}
            onChange={(e) => updateField('nom', e.target.value)}
            maxLength={100}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
              errors.nom ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.nom && (
            <p className="text-xs text-red-600 mt-1.5">{errors.nom}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"
          />
        </div>

        {/* Niveau + Classe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Niveau
            </label>
            <select
              value={form.niveauId}
              onChange={(e) => updateField('niveauId', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">-- Tous niveaux --</option>
              {niveaux.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.ordre}. {n.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Classe
            </label>
            <select
              value={form.classeId}
              onChange={(e) => updateField('classeId', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">-- Toutes classes --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Devise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Devise
          </label>
          <select
            value={form.devise}
            onChange={(e) => updateField('devise', e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="XOF">XOF</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="MAD">MAD</option>
            <option value="GHS">GHS</option>
          </select>
        </div>

        {/* Frais */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CurrencyDollarIcon className="w-4 h-4 text-amber-500" />
            Frais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Frais d'inscription ({form.devise})
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={form.fraisInscription}
                onChange={(e) =>
                  updateField('fraisInscription', Number(e.target.value) || 0)
                }
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                  errors.fraisInscription
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Frais de scolarité ({form.devise})
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={form.fraisScolarite}
                onChange={(e) =>
                  updateField('fraisScolarite', Number(e.target.value) || 0)
                }
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                  errors.fraisScolarite
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
            </div>
          </div>

          {/* Autres frais */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Autres frais
              </label>
              <button
                type="button"
                onClick={addAutreFrais}
                className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Ajouter
              </button>
            </div>

            {autresFrais.length === 0 ? (
              <p className="text-xs text-gray-500 py-2">
                Aucun autre frais
              </p>
            ) : (
              <div className="space-y-2">
                {autresFrais.map((f, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={f.cle}
                      onChange={(e) =>
                        updateAutreFrais(index, 'cle', e.target.value)
                      }
                      placeholder="Nom du frais"
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={f.montant}
                      onChange={(e) =>
                        updateAutreFrais(
                          index,
                          'montant',
                          Number(e.target.value) || 0
                        )
                      }
                      className="w-32 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeAutreFrais(index)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                Montant total
              </span>
              <span className="text-2xl font-bold text-amber-700">
                {new Intl.NumberFormat('fr-FR').format(montantTotal)}{' '}
                {form.devise}
              </span>
            </div>
          </div>
        </div>

        {/* Statut */}
        <div className="border-t border-gray-100 pt-6">
          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={form.estActif}
              onChange={(e) => updateField('estActif', e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Plan actif</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Le plan peut être assigné aux élèves.
              </p>
            </div>
          </label>
        </div>

        {/* Info box */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-0.5">Attention</p>
            <p className="text-blue-700">
              Modifier le montant total peut impacter les paiements et
              assignments existants. Vérifiez avant de valider.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to={`/dashboard/plans-scolarite/${id}`}
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

export default PlanScolariteEditerPage;