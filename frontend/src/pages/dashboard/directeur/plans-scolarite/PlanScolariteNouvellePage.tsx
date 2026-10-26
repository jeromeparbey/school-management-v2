// frontend2/src/pages/dashboard/directeur/plans-scolarite/PlanScolariteNouvellePage.tsx

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BanknotesIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useCreatePlanScolarite } from '../../../../hooks/usePlanScolarite';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import { useNiveaux } from '../../../../hooks/useNiveaux';
import { useClasses } from '../../../../hooks/useClasses';
import { useToast } from '../../../../context/ToastContext';
import type { CreatePlanScolaritePayload } from '../../../../types/planScolarite.types';
import type { AnneeScolaire } from '../../../../types/anneeScolaire.types';
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
// ÉTAT INITIAL
// ============================================

const initialForm = {
  nom: '',
  description: '',
  anneeScolaireId: '',
  niveauId: '',
  classeId: '',
  fraisInscription: 0,
  fraisScolarite: 0,
  devise: 'XOF',
  estActif: true,
};

// ============================================
// COMPOSANT
// ============================================

const PlanScolariteNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(initialForm);
  const [autresFrais, setAutresFrais] = useState<AutreFraisItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreatePlanScolarite();

  // ─── Data ───
  const { data: anneesData, isLoading: loadingAnnees } = useAnneesScolaires({
    limit: 100,
    sortBy: 'dateDebut',
    sortOrder: 'desc',
  });
  const anneesScolaires: AnneeScolaire[] = useMemo(
    () => anneesData?.annees ?? [],
    [anneesData]
  );

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

  // Auto-sélection de l'année active
  const [autoSelected, setAutoSelected] = useState(false);
  React.useEffect(() => {
    if (!autoSelected && anneesScolaires.length > 0 && !form.anneeScolaireId) {
      const active = anneesScolaires.find((a) => a.estActive);
      if (active) {
        setForm((f) => ({ ...f, anneeScolaireId: active.id }));
        setAutoSelected(true);
      }
    }
  }, [anneesScolaires, autoSelected, form.anneeScolaireId]);

  // ─── Handlers ───
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

  // ─── Validation ───
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.nom.trim()) {
      errs.nom = 'Le nom est obligatoire';
    } else if (form.nom.trim().length > 100) {
      errs.nom = 'Maximum 100 caractères';
    }

    if (!form.anneeScolaireId) {
      errs.anneeScolaireId = "L'année scolaire est obligatoire";
    }

    if (form.fraisInscription < 0) {
      errs.fraisInscription = 'Le montant doit être positif';
    }
    if (form.fraisScolarite < 0) {
      errs.fraisScolarite = 'Le montant doit être positif';
    }

    // Vérifier les autres frais
    const hasInvalidAutresFrais = autresFrais.some(
      (f) => !f.cle.trim() || f.montant < 0
    );
    if (hasInvalidAutresFrais) {
      errs.autresFrais = 'Tous les autres frais doivent avoir un nom et un montant valide';
    }

    if (montantTotal <= 0) {
      errs.montantTotal = 'Le montant total doit être supérieur à 0';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning('Formulaire incomplet', 'Vérifiez les champs en rouge.');
    }

    return Object.keys(errs).length === 0;
  };

  // ─── Submit ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Construire l'objet autresFrais
      const autresFraisObj: Record<string, number> = {};
      autresFrais.forEach((f) => {
        if (f.cle.trim()) {
          autresFraisObj[f.cle.trim()] = f.montant;
        }
      });

      const payload: CreatePlanScolaritePayload = {
        nom: form.nom.trim(),
        description: form.description.trim() || null,
        anneeScolaireId: form.anneeScolaireId,
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

      const res = await createMutation.mutateAsync(payload);

      if (res.success && res.data) {
        toast.success(
          'Plan de scolarité créé ! 🎉',
          `"${res.data.nom}" a été créé. Montant total : ${new Intl.NumberFormat(
            'fr-FR'
          ).format(res.data.montantTotal)} ${res.data.devise}`,
          {
            duration: 4000,
            action: {
              label: 'Voir le détail',
              onClick: () =>
                navigate(`/dashboard/plans-scolarite/${res.data!.id}`),
            },
          }
        );
        setTimeout(() => navigate('/dashboard/plans-scolarite'), 1500);
      }
    } catch {
      /* toast géré par le hook */
    }
  };

  // ─── Rendu ───
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/plans-scolarite"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          title="Retour"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BanknotesIcon className="w-7 h-7 text-blue-600" />
            Nouveau plan de scolarité
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Définissez les frais et échéances d'une scolarité
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* ═══ Section Informations générales ═══ */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <InformationCircleIcon className="w-4 h-4 text-blue-500" />
            Informations générales
          </h2>

          <div className="space-y-4">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom du plan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => updateField('nom', e.target.value)}
                placeholder="Ex: Plan 6ème 2025-2026"
                maxLength={100}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
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
                placeholder="Description optionnelle…"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Année + Devise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Année scolaire <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.anneeScolaireId}
                  onChange={(e) =>
                    updateField('anneeScolaireId', e.target.value)
                  }
                  disabled={loadingAnnees}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
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
                  {anneesScolaires.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nom}
                      {a.estActive ? ' (active)' : ''}
                    </option>
                  ))}
                </select>
                {errors.anneeScolaireId && (
                  <p className="text-xs text-red-600 mt-1.5">
                    {errors.anneeScolaireId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Devise
                </label>
                <select
                  value={form.devise}
                  onChange={(e) => updateField('devise', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="XOF">XOF (FCFA)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="MAD">MAD (Dirham)</option>
                  <option value="GHS">GHS (Cedi)</option>
                </select>
              </div>
            </div>

            {/* Niveau + Classe (optionnels) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Niveau <span className="text-gray-400 text-xs">(optionnel)</span>
                </label>
                <select
                  value={form.niveauId}
                  onChange={(e) => updateField('niveauId', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">-- Tous niveaux --</option>
                  {niveaux.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.ordre}. {n.nom} ({n.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Classe <span className="text-gray-400 text-xs">(optionnel)</span>
                </label>
                <select
                  value={form.classeId}
                  onChange={(e) => updateField('classeId', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">-- Toutes classes --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Section Frais ═══ */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CurrencyDollarIcon className="w-4 h-4 text-blue-500" />
            Frais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Frais inscription */}
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
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  errors.fraisInscription
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              {errors.fraisInscription && (
                <p className="text-xs text-red-600 mt-1.5">
                  {errors.fraisInscription}
                </p>
              )}
            </div>

            {/* Frais scolarité */}
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
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  errors.fraisScolarite
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              {errors.fraisScolarite && (
                <p className="text-xs text-red-600 mt-1.5">
                  {errors.fraisScolarite}
                </p>
              )}
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
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Ajouter
              </button>
            </div>

            {autresFrais.length === 0 ? (
              <p className="text-xs text-gray-500 py-2">
                Aucun autre frais (uniforme, cantine, transport…)
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
                      placeholder="Ex: Uniforme"
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                      placeholder="Montant"
                      className="w-32 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeAutreFrais(index)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Retirer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.autresFrais && (
              <p className="text-xs text-red-600 mt-1.5">
                {errors.autresFrais}
              </p>
            )}
          </div>

          {/* Total */}
          <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                Montant total
              </span>
              <span className="text-2xl font-bold text-blue-700">
                {new Intl.NumberFormat('fr-FR').format(montantTotal)}{' '}
                {form.devise}
              </span>
            </div>
            {errors.montantTotal && (
              <p className="text-xs text-red-600 mt-1.5">
                {errors.montantTotal}
              </p>
            )}
          </div>
        </div>

        {/* ═══ Section Statut ═══ */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-blue-500" />
            Statut
          </h2>

          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={form.estActif}
              onChange={(e) => updateField('estActif', e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Plan actif
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Le plan pourra être assigné aux élèves et utilisé pour la facturation.
              </p>
            </div>
          </label>
        </div>

        {/* Info box */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-0.5">Prochaines étapes</p>
            <ul className="space-y-0.5 text-blue-700">
              <li>• Ajouter les échéances (tranches de paiement)</li>
              <li>• Assigner le plan à des élèves</li>
              <li>• Enregistrer les paiements</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to="/dashboard/plans-scolarite"
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
                Créer le plan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanScolariteNouvellePage;