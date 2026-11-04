// frontend2/src/pages/dashboard/directeur/reductions/ReductionNouvellePage.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ReceiptPercentIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  SparklesIcon,
  InformationCircleIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useCreateReduction } from '../../../../hooks/useReduction';
import { useEleves } from '../../../../hooks/useEleves';
import { useToast } from '../../../../context/ToastContext';
import { MoneyInput } from '../../../../components/ui/MoneyInput';
import type {
  CreateReductionPayload,
  TypeReduction,
} from '../../../../types/reduction.types';
import type { Eleve } from '../../../../types/eleve.types';

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

const formatMoney = (amount: number | null | undefined, devise = 'F CFA') => {
  if (amount == null) return '—';
  const value = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount);
  const upper = devise.toUpperCase();
  if (upper === 'XOF' || upper === 'XAF') return `${value} F CFA`;
  if (upper === 'EUR') return `${value} €`;
  if (upper === 'USD') return `${value} $`;
  return `${value} ${devise}`;
};

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

const ReductionNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState<CreateReductionPayload>({
    eleveId: searchParams.get('eleveId') ?? '',
    assignmentScolariteId: '',
    type: 'FIXE',
    valeur: 0,
    motif: '',
    approuvePar: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchEleve, setSearchEleve] = useState('');
  const [showEleveDropdown, setShowEleveDropdown] = useState(false);

  const createMutation = useCreateReduction();

  // Récupérer l'ID utilisateur depuis localStorage
  useEffect(() => {
    try {
      const raw =
        localStorage.getItem('user') ||
        localStorage.getItem('auth_user') ||
        localStorage.getItem('authUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        const userId =
          parsed?.id ?? parsed?.userId ?? parsed?._id ?? parsed?.user?.id;
        if (userId) {
          setForm((f) => ({ ...f, approuvePar: userId }));
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Élèves
  const { data: elevesData, isLoading: loadingEleves } = useEleves({
    limit: 500,
    sortBy: 'nom',
    sortOrder: 'asc',
  });

  const eleves: Eleve[] = useMemo(() => {
    if (!elevesData) return [];
    const any = elevesData as any;
    if (Array.isArray(any.eleves)) return any.eleves;
    if (Array.isArray(any.data)) return any.data;
    return [];
  }, [elevesData]);

  const selectedEleve = useMemo(
    () => eleves.find((e) => e.id === form.eleveId),
    [eleves, form.eleveId]
  );

  // ═══════════════════════════════════════════════════════════
  // 🆕 EXTRACTION AUTOMATIQUE DE L'ASSIGNMENT
  // ═══════════════════════════════════════════════════════════

  /**
   * Récupère l'assignment actif de l'élève sélectionné.
   * Un élève peut avoir plusieurs inscriptions, mais une seule active.
   * On prend la première inscription active avec un assignment.
   */
  const assignmentActif = useMemo(() => {
    if (!selectedEleve) return null;

    // L'élève peut avoir ses inscriptions/assignments dans plusieurs formats
    const anyEleve = selectedEleve as any;

    // 1. Chercher dans `assignmentsScolarite` (si fourni par l'API)
    const assignments = anyEleve.assignmentsScolarite ?? [];
    if (Array.isArray(assignments) && assignments.length > 0) {
      // Priorité : assignment ACTIF
      const actif = assignments.find(
        (a: any) => a.statut === 'ACTIF' || a.statut === 'ACTIVE'
      );
      if (actif) return actif;
      // Fallback : premier assignment
      return assignments[0];
    }

    // 2. Chercher dans les inscriptions → assignment
    const inscriptions = anyEleve.inscriptions ?? [];
    if (Array.isArray(inscriptions)) {
      const insActive = inscriptions.find(
        (i: any) => i.estActive || i.statut === 'ACTIF'
      );
      if (insActive?.assignment || insActive?.assignmentScolarite) {
        return insActive.assignment ?? insActive.assignmentScolarite;
      }
    }

    return null;
  }, [selectedEleve]);

  /**
   * Extrait les infos utiles du plan de scolarité pour affichage.
   */
  const planInfo = useMemo(() => {
    if (!assignmentActif) return null;

    const plan =
      assignmentActif.planScolarite ??
      assignmentActif.plan ??
      null;

    if (!plan) {
      return {
        assignmentId: assignmentActif.id,
        planNom: 'Plan de scolarité',
        montantTotal: assignmentActif.montantPersonnalise ?? 0,
        devise: 'XOF',
      };
    }

    return {
      assignmentId: assignmentActif.id,
      planNom: plan.nom ?? 'Plan de scolarité',
      montantTotal:
        assignmentActif.montantPersonnalise ??
        plan.montantTotal ??
        0,
      devise: plan.devise ?? 'XOF',
    };
  }, [assignmentActif]);

  // ═══════════════════════════════════════════════════════════
  // 🆕 AUTO-REMPLISSAGE DE L'ASSIGNMENT QUAND L'ÉLÈVE CHANGE
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    if (planInfo?.assignmentId) {
      // Auto-remplir avec l'assignment détecté
      setForm((f) => ({
        ...f,
        assignmentScolariteId: planInfo.assignmentId,
      }));
      // Nettoyer l'erreur si elle existait
      setErrors((e) => ({ ...e, assignmentScolariteId: '' }));
    } else if (selectedEleve) {
      // Élève sélectionné mais aucun assignment → vider
      setForm((f) => ({ ...f, assignmentScolariteId: '' }));
    }
  }, [planInfo?.assignmentId, selectedEleve]);

  // Filtre élèves
  const filteredEleves = useMemo(() => {
    const q = searchEleve.trim().toLowerCase();
    const base = eleves.filter((e) => e.statut === 'ACTIF');
    if (!q) return base.slice(0, 50);
    return base
      .filter((e) => {
        const hay = `${e.prenom} ${e.nom} ${e.matricule}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [eleves, searchEleve]);

  const updateField = <K extends keyof CreateReductionPayload>(
    field: K,
    value: CreateReductionPayload[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.eleveId) errs.eleveId = 'Sélectionnez un élève';
    if (!form.assignmentScolariteId)
      errs.assignmentScolariteId =
        "Cet élève n'a pas de plan de scolarité assigné";
    if (!form.motif.trim()) errs.motif = 'Le motif est obligatoire';
    else if (form.motif.trim().length < 3)
      errs.motif = 'Minimum 3 caractères';

    if (!form.approuvePar)
      errs.approuvePar = 'Utilisateur non identifié (reconnectez-vous)';

    if (form.type === 'FIXE') {
      if (form.valeur <= 0) errs.valeur = 'Le montant doit être supérieur à 0';
    } else {
      if (form.valeur <= 0 || form.valeur > 100)
        errs.valeur = 'Le pourcentage doit être entre 0 et 100';
    }

    // Vérifier que la réduction ne dépasse pas le montant du plan
    if (planInfo && form.type === 'FIXE' && form.valeur > planInfo.montantTotal) {
      errs.valeur = `La réduction (${formatMoney(
        form.valeur,
        planInfo.devise
      )}) dépasse le montant du plan (${formatMoney(
        planInfo.montantTotal,
        planInfo.devise
      )})`;
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
      const payload: CreateReductionPayload = {
        eleveId: form.eleveId,
        assignmentScolariteId: form.assignmentScolariteId,
        type: form.type,
        valeur: form.valeur,
        motif: form.motif.trim(),
        approuvePar: form.approuvePar,
      };

      const res = await createMutation.mutateAsync(payload);

      if (res.success && res.data) {
        toast.success('Réduction créée ! 🎉', `Motif : ${res.data.motif}`, {
          duration: 4000,
          action: {
            label: 'Voir le détail',
            onClick: () => navigate(`/dashboard/reductions/${res.data!.id}`),
          },
        });
        setTimeout(() => navigate('/dashboard/reductions'), 1500);
      }
    } catch {
      /* toast géré */
    }
  };

  // Bouton submit désactivé si pas d'assignment
  const canSubmit =
    !!form.eleveId && !!form.assignmentScolariteId && !createMutation.isPending;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 p-6">
      {/* En-tête */}
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
            Nouvelle réduction
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Appliquez une réduction à un élève
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* ═══════════ ÉLÈVE ═══════════ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Élève <span className="text-red-500">*</span>
          </label>

          {!selectedEleve ? (
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Rechercher un élève…"
                value={searchEleve}
                onChange={(e) => {
                  setSearchEleve(e.target.value);
                  setShowEleveDropdown(true);
                }}
                onFocus={() => setShowEleveDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowEleveDropdown(false), 150)
                }
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
                  errors.eleveId
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              {loadingEleves && (
                <ArrowPathIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}

              {showEleveDropdown && !loadingEleves && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                  {filteredEleves.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      {searchEleve.trim()
                        ? 'Aucun élève ne correspond'
                        : 'Aucun élève disponible'}
                    </div>
                  ) : (
                    filteredEleves.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onMouseDown={(ev) => {
                          ev.preventDefault();
                          updateField('eleveId', e.id);
                          setSearchEleve(`${e.prenom} ${e.nom}`);
                          setShowEleveDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 flex items-center gap-3 border-b last:border-b-0 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {e.prenom[0]}
                          {e.nom[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {e.prenom} {e.nom}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {e.matricule}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold shrink-0">
                {selectedEleve.prenom[0]}
                {selectedEleve.nom[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">
                  {selectedEleve.prenom} {selectedEleve.nom}
                </p>
                <p className="text-xs text-gray-600">
                  {selectedEleve.matricule}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateField('eleveId', '');
                  setSearchEleve('');
                }}
                className="p-1.5 text-gray-500 hover:bg-white rounded-lg transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          {errors.eleveId && (
            <p className="text-xs text-red-600 mt-1.5">{errors.eleveId}</p>
          )}
        </div>

        {/* ═══════════ PLAN DE SCOLARITÉ (LECTURE SEULE) ═══════════ */}
        {selectedEleve && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Plan de scolarité
            </label>

            {planInfo ? (
              // ✅ Assignment trouvé → affichage lecture seule
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold text-emerald-900">
                        {planInfo.planNom}
                      </p>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-600 text-white rounded-full">
                        Assigné
                      </span>
                    </div>
                    <p className="text-sm text-emerald-800">
                      Montant du plan :{' '}
                      <strong className="text-lg">
                        {formatMoney(
                          planInfo.montantTotal,
                          planInfo.devise
                        )}
                      </strong>
                    </p>
                    <p className="text-[10px] text-emerald-700 mt-1 font-mono">
                      Assignment ID : {planInfo.assignmentId}
                    </p>
                  </div>
                </div>

                {/* Aperçu réduction */}
                {form.valeur > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-200 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-emerald-700">Montant plan</p>
                      <p className="font-bold text-gray-900 mt-0.5">
                        {formatMoney(
                          planInfo.montantTotal,
                          planInfo.devise
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-700">Réduction</p>
                      <p className="font-bold text-amber-700 mt-0.5">
                        -{' '}
                        {form.type === 'FIXE'
                          ? formatMoney(form.valeur, planInfo.devise)
                          : formatMoney(
                              (planInfo.montantTotal * form.valeur) / 100,
                              planInfo.devise
                            )}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-700">Net à payer</p>
                      <p className="font-bold text-emerald-700 mt-0.5">
                        {formatMoney(
                          Math.max(
                            0,
                            planInfo.montantTotal -
                              (form.type === 'FIXE'
                                ? form.valeur
                                : (planInfo.montantTotal * form.valeur) / 100)
                          ),
                          planInfo.devise
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // ❌ Aucun assignment → alerte + bouton désactivé
              <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-900">
                      Aucun plan de scolarité assigné
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      Cet élève n'a pas d'assignment de scolarité actif. Il
                      doit d'abord être inscrit dans une classe avec un plan
                      de scolarité.
                    </p>
                    <Link
                      to={`/dashboard/inscriptions/nouvelle?eleveId=${selectedEleve.id}`}
                      className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition-colors"
                    >
                      <ArrowPathIcon className="w-3.5 h-3.5" />
                      Inscrire cet élève
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {errors.assignmentScolariteId && (
              <p className="text-xs text-red-600 mt-1.5">
                {errors.assignmentScolariteId}
              </p>
            )}
          </div>
        )}

        {/* ═══════════ TYPE DE RÉDUCTION ═══════════ */}
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
                disabled={!planInfo}
                className={`text-left p-3 rounded-xl border transition-all ${
                  form.type === opt.value
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-gray-50 border-gray-200 hover:border-emerald-200'
                } ${!planInfo ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <p className="text-sm font-semibold text-gray-900">
                  {opt.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════ VALEUR ═══════════ */}
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
                disabled={!planInfo}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
                  errors.valeur
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                } ${!planInfo ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                disabled={!planInfo}
                className={`w-full pl-10 pr-16 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
                  errors.valeur
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                } ${!planInfo ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        {/* ═══════════ MOTIF ═══════════ */}
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

        {/* ═══════════ INFO BOX ═══════════ */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="text-xs text-emerald-800">
            <p className="font-semibold mb-0.5">Comment ça marche ?</p>
            <p className="text-emerald-700">
              Une fois créée, la réduction sera automatiquement déduite du
              solde restant de l'élève. Le calcul est fait par le serveur
              selon le type choisi.
            </p>
          </div>
        </div>

        {/* Erreur approuvePar */}
        {errors.approuvePar && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            ⚠️ {errors.approuvePar}
          </div>
        )}

        {/* ═══════════ ACTIONS ═══════════ */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to="/dashboard/reductions"
            className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={!canSubmit}
            title={
              !form.eleveId
                ? 'Sélectionnez un élève'
                : !form.assignmentScolariteId
                ? "Cet élève n'a pas de plan de scolarité"
                : 'Créer la réduction'
            }
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Création…
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" />
                Créer la réduction
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReductionNouvellePage;