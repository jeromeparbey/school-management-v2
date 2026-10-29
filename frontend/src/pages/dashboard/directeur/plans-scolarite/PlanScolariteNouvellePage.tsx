// frontend2/src/pages/dashboard/directeur/plans-scolarite/PlanScolariteNouvellePage.tsx

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BanknotesIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  PlusIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  ReceiptPercentIcon,
  ChevronRightIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
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

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface AutreFraisItem {
  cle: string;
  montant: number;
}

// ═══════════════════════════════════════════════════════════
// ÉTAT INITIAL
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════

const PlanScolariteNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(initialForm);
  const [autresFrais, setAutresFrais] = useState<AutreFraisItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🆕 États pour la recherche classe
  const [searchClasse, setSearchClasse] = useState('');
  const [showClasseDropdown, setShowClasseDropdown] = useState(false);
  const classeDropdownRef = useRef<HTMLDivElement>(null);

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

  const { data: niveauxData, isLoading: loadingNiveaux } = useNiveaux({
    limit: 200,
  });
  const niveaux: Niveau[] = useMemo(
    () => niveauxData?.niveaux ?? [],
    [niveauxData]
  );

  const { data: classesData, isLoading: loadingClasses } = useClasses({
    limit: 200,
  });
  const classes: Classe[] = useMemo(
    () => classesData?.classes ?? [],
    [classesData]
  );

  // ═══════════════════════════════════════════════════════════
  // FILTRAGE INTELLIGENT DES CLASSES
  // ═══════════════════════════════════════════════════════════

  const classesFiltrees = useMemo(() => {
    return classes.filter((c) => {
      if (form.niveauId && c.niveauId !== form.niveauId) return false;
      if (form.anneeScolaireId && c.anneeScolaireId !== form.anneeScolaireId)
        return false;
      if (c.estArchive) return false;
      return true;
    });
  }, [classes, form.niveauId, form.anneeScolaireId]);

  // 🆕 Filtre par recherche texte
  const classesRecherchees = useMemo(() => {
    const q = searchClasse.trim().toLowerCase();
    if (!q) return classesFiltrees;
    return classesFiltrees.filter((c) => {
      const hay = `${c.nom} ${c.code} ${c.salle ?? ''} ${
        c.niveau?.nom ?? ''
      }`.toLowerCase();
      return hay.includes(q);
    });
  }, [classesFiltrees, searchClasse]);

  // ─── Année active par défaut ───
  const [autoSelected, setAutoSelected] = useState(false);
  useEffect(() => {
    if (!autoSelected && anneesScolaires.length > 0 && !form.anneeScolaireId) {
      const active = anneesScolaires.find((a) => a.estActive);
      if (active) {
        setForm((f) => ({ ...f, anneeScolaireId: active.id }));
        setAutoSelected(true);
      }
    }
  }, [anneesScolaires, autoSelected, form.anneeScolaireId]);

  // ─── Fermer le dropdown classe au clic externe ───
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        classeDropdownRef.current &&
        !classeDropdownRef.current.contains(e.target as Node)
      ) {
        setShowClasseDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Handlers ───
  const updateField = <K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  const handleNiveauChange = (niveauId: string) => {
    updateField('niveauId', niveauId);

    if (form.classeId && niveauId) {
      const classeActuelle = classes.find((c) => c.id === form.classeId);
      if (classeActuelle && classeActuelle.niveauId !== niveauId) {
        updateField('classeId', '');
        setSearchClasse('');
      }
    }
  };

  const handleSelectClasse = (classe: Classe) => {
    updateField('classeId', classe.id);
    setSearchClasse('');
    setShowClasseDropdown(false);

    // Auto-remplir le niveau depuis la classe
    if (classe.niveauId && classe.niveauId !== form.niveauId) {
      updateField('niveauId', classe.niveauId);
    }
  };

  const handleClearClasse = () => {
    updateField('classeId', '');
    setSearchClasse('');
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

    const hasInvalidAutresFrais = autresFrais.some(
      (f) => !f.cle.trim() || f.montant < 0
    );
    if (hasInvalidAutresFrais) {
      errs.autresFrais =
        'Tous les autres frais doivent avoir un nom et un montant valide';
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

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  const selectedClasse = useMemo(
    () => classes.find((c) => c.id === form.classeId),
    [classes, form.classeId]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/plans-scolarite" className="hover:text-gray-900">
          Plans de scolarité
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Nouveau</span>
      </nav>

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex items-start gap-4">
          <Link
            to="/dashboard/plans-scolarite"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
            title="Retour"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <BanknotesIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BanknotesIcon className="w-7 h-7 text-emerald-600" />
              Nouveau plan de scolarité
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Définissez les frais et échéances d'une scolarité
            </p>
          </div>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* ═══════════ SECTION 1 : INFORMATIONS GÉNÉRALES ═══════════ */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-4 h-4 text-emerald-600" />
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
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              />
            </div>

            {/* Année + Devise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Année scolaire <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={form.anneeScolaireId}
                    onChange={(e) => {
                      updateField('anneeScolaireId', e.target.value);
                      if (form.classeId) {
                        const classe = classes.find(
                          (c) => c.id === form.classeId
                        );
                        if (
                          classe &&
                          classe.anneeScolaireId !== e.target.value
                        ) {
                          updateField('classeId', '');
                          setSearchClasse('');
                        }
                      }
                    }}
                    disabled={loadingAnnees}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
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
                </div>
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
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="XOF">XOF (FCFA)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="MAD">MAD (Dirham)</option>
                  <option value="GHS">GHS (Cedi)</option>
                </select>
              </div>
            </div>

            {/* ═══════════ Niveau + Classe ═══════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Niveau */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>
                    Niveau{' '}
                    <span className="text-gray-400 text-xs">(optionnel)</span>
                  </span>
                  {form.niveauId && (
                    <button
                      type="button"
                      onClick={() => {
                        updateField('niveauId', '');
                        updateField('classeId', '');
                        setSearchClasse('');
                      }}
                      className="text-[10px] text-emerald-600 hover:underline"
                    >
                      Réinitialiser
                    </button>
                  )}
                </label>
                <div className="relative">
                  <AcademicCapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <select
                    value={form.niveauId}
                    onChange={(e) => handleNiveauChange(e.target.value)}
                    disabled={loadingNiveaux}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                  >
                    <option value="">
                      {loadingNiveaux ? 'Chargement…' : '-- Tous niveaux --'}
                    </option>
                    {niveaux.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.ordre}. {n.nom} ({n.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 🆕 Classe — Combobox avec recherche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>
                    Classe{' '}
                    <span className="text-gray-400 text-xs">(optionnel)</span>
                  </span>
                  {form.classeId && (
                    <button
                      type="button"
                      onClick={handleClearClasse}
                      className="text-[10px] text-emerald-600 hover:underline"
                    >
                      Effacer
                    </button>
                  )}
                </label>

                <div className="relative" ref={classeDropdownRef}>
                  <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />

                  <input
                    type="text"
                    value={searchClasse}
                    onChange={(e) => {
                      setSearchClasse(e.target.value);
                      setShowClasseDropdown(true);
                    }}
                    onFocus={() => setShowClasseDropdown(true)}
                    placeholder={
                      selectedClasse
                        ? `${selectedClasse.nom} (${selectedClasse.code})`
                        : 'Rechercher une classe…'
                    }
                    disabled={loadingClasses}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                  />

                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {loadingClasses ? (
                      <ArrowPathIcon className="w-4 h-4 text-gray-400 animate-spin" />
                    ) : searchClasse || form.classeId ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchClasse('');
                          updateField('classeId', '');
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    ) : (
                      <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 pointer-events-none" />
                    )}
                  </div>

                  {showClasseDropdown && !loadingClasses && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          {classesRecherchees.length} classe(s)
                          {form.niveauId && ' · filtrées par niveau'}
                          {searchClasse.trim() &&
                            ` · "${searchClasse}"`}
                        </p>
                      </div>

                      {/* Bouton "Toutes les classes" */}
                      <button
                        type="button"
                        onClick={() => {
                          updateField('classeId', '');
                          setSearchClasse('');
                          setShowClasseDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 hover:bg-emerald-50 flex items-center gap-2 border-b border-gray-100 ${
                          !form.classeId ? 'bg-emerald-50' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                          <UsersIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            Toutes les classes
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Aucune restriction
                          </p>
                        </div>
                        {!form.classeId && (
                          <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </button>

                      {/* Liste filtrée */}
                      {classesRecherchees.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          {searchClasse.trim() ? (
                            <>
                              Aucune classe ne correspond à «&nbsp;
                              <strong>{searchClasse}</strong>&nbsp;»
                            </>
                          ) : form.niveauId ? (
                            'Aucune classe pour ce niveau'
                          ) : (
                            'Aucune classe disponible'
                          )}
                        </div>
                      ) : (
                        classesRecherchees.map((c) => {
                          const isSelected = form.classeId === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectClasse(c)}
                              className={`w-full text-left px-3 py-2.5 hover:bg-emerald-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0 ${
                                isSelected ? 'bg-emerald-50' : ''
                              }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                                <UsersIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {c.nom}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {c.code}
                                  {c.capacite
                                    ? ` · ${c.capacite} places`
                                    : ''}
                                </p>
                              </div>
                              {isSelected && (
                                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Info contextuelle */}
                {form.niveauId && classesFiltrees.length > 0 && (
                  <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                    ✅ {classesFiltrees.length} classe(s) pour ce niveau
                  </p>
                )}
                {form.niveauId &&
                  classesFiltrees.length === 0 &&
                  !loadingClasses && (
                    <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                      ⚠️ Aucune classe pour ce niveau
                    </p>
                  )}
                {!form.niveauId && classes.length > 0 && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    💡 Sélectionnez un niveau pour filtrer
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ SECTION 2 : FRAIS ═══════════ */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
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
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
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
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
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
                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
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
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
                      className="w-32 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
          <div className="mt-4 p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <ReceiptPercentIcon className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Montant total
                </span>
              </div>
              <span className="text-3xl font-bold">
                {new Intl.NumberFormat('fr-FR').format(montantTotal)}{' '}
                <span className="text-lg">{form.devise}</span>
              </span>
            </div>
            {errors.montantTotal && (
              <p className="text-xs text-red-100 mt-1.5">
                {errors.montantTotal}
              </p>
            )}
          </div>
        </div>

        {/* ═══════════ SECTION 3 : STATUT ═══════════ */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            Statut
          </h2>

          <label className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl cursor-pointer hover:bg-emerald-100/50 transition-colors">
            <input
              type="checkbox"
              checked={form.estActif}
              onChange={(e) => updateField('estActif', e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Plan actif
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Le plan pourra être assigné aux élèves et utilisé pour la
                facturation.
              </p>
            </div>
          </label>
        </div>

        {/* Info box */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="text-xs text-emerald-800">
            <p className="font-semibold mb-1">Prochaines étapes</p>
            <ul className="space-y-0.5 text-emerald-700">
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
            className="px-4 py-2.5 text-sm text-gray-700 font-medium rounded-lg hover:bg-gray-100"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
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
      </motion.form>
    </div>
  );
};

export default PlanScolariteNouvellePage;