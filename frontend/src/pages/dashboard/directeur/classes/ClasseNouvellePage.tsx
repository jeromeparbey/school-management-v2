// frontend2/src/pages/dashboard/directeur/classes/ClasseNouvellePage.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  IdentificationIcon,
  UserGroupIcon,
  MapPinIcon,
  SparklesIcon,
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useCreateClasse } from '../../../../hooks/useClasses';
import { useNiveaux } from '../../../../hooks/useNiveaux';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import { useToast } from '../../../../context/ToastContext';
import type { CreateClassePayload } from '../../../../types/classe.types';
import type { Niveau } from '../../../../types/niveau.types';
import type { AnneeScolaire } from '../../../../types/anneeScolaire.types';

// ============================================
// HELPERS
// ============================================
const normalizeCode = (value: string): string => {
  return value
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 50);
};

// ============================================
// ÉTAT INITIAL
// ============================================
const initialForm: CreateClassePayload = {
  nom: '',
  code: '',
  capacite: null,
  salle: null,
  anneeScolaireId: '',
  niveauId: '',
  estActive: true,
};

// ============================================
// COMPOSANT
// ============================================
const ClasseNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<CreateClassePayload>(initialForm);
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateClasse();

  // ─── Niveaux ───
  const { data: niveauxData, isLoading: loadingNiveaux } = useNiveaux({
    limit: 200,
    sortBy: 'ordre',
    sortOrder: 'asc',
  });

  const niveaux: Niveau[] = useMemo(
    () => niveauxData?.niveaux ?? [],
    [niveauxData]
  );

  const selectedNiveau = useMemo(
    () => niveaux.find((n: Niveau) => n.id === form.niveauId),
    [niveaux, form.niveauId]
  );

  // ─── Années scolaires ───
  const { data: anneesData, isLoading: loadingAnnees } = useAnneesScolaires({
    limit: 200,
    sortBy: 'dateDebut',
    sortOrder: 'desc',
  });

  const anneesScolaires: AnneeScolaire[] = useMemo(
    () => anneesData?.annees ?? [],
    [anneesData]
  );

  const selectedAnnee = useMemo(
    () => anneesScolaires.find((a) => a.id === form.anneeScolaireId),
    [anneesScolaires, form.anneeScolaireId]
  );

  // ✅ Auto-sélectionner l'année active si elle existe
  useEffect(() => {
    if (!form.anneeScolaireId && anneesScolaires.length > 0) {
      const active = anneesScolaires.find((a) => a.estActive);
      if (active) {
        setForm((f) => ({ ...f, anneeScolaireId: active.id }));
      }
    }
  }, [anneesScolaires, form.anneeScolaireId]);

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const updateField = <K extends keyof CreateClassePayload>(
    field: K,
    value: CreateClassePayload[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  // ─────────────────────────────────────────
  // VALIDATION ÉTAPE 1 (identité)
  // ─────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.nom.trim()) {
      errs.nom = 'Le nom est obligatoire';
    } else if (form.nom.trim().length < 2) {
      errs.nom = 'Minimum 2 caractères';
    } else if (form.nom.trim().length > 100) {
      errs.nom = 'Maximum 100 caractères';
    }

    if (!form.code.trim()) {
      errs.code = 'Le code est obligatoire';
    } else if (!/^[A-Z0-9_-]+$/.test(form.code)) {
      errs.code = 'Majuscules, chiffres, _ ou - uniquement';
    } else if (form.code.length < 2) {
      errs.code = 'Minimum 2 caractères';
    } else if (form.code.length > 50) {
      errs.code = 'Maximum 50 caractères';
    }

    if (!form.niveauId) {
      errs.niveauId = 'Le niveau est obligatoire';
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      toast.warning(
        'Formulaire incomplet',
        `${Object.keys(errs).length} champ(s) nécessitent votre attention.`
      );
    }

    return Object.keys(errs).length === 0;
  };

  // ─────────────────────────────────────────
  // VALIDATION ÉTAPE 2 (détails)
  // ─────────────────────────────────────────
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.anneeScolaireId.trim()) {
      errs.anneeScolaireId = "L'année scolaire est obligatoire";
    }

    if (
      form.capacite !== null &&
      form.capacite !== undefined &&
      (form.capacite < 1 || form.capacite > 500)
    ) {
      errs.capacite = 'Entre 1 et 500';
    }

    if (form.salle && form.salle.length > 50) {
      errs.salle = 'Maximum 50 caractères';
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      toast.warning(
        'Formulaire incomplet',
        `${Object.keys(errs).length} champ(s) nécessitent votre attention.`
      );
    }

    return Object.keys(errs).length === 0;
  };

  // ─────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────
  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─────────────────────────────────────────
  // SOUMISSION
  // ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    try {
      const payload: CreateClassePayload = {
        nom: form.nom.trim(),
        code: form.code.trim().toUpperCase(),
        capacite: form.capacite ?? null,
        salle: form.salle?.trim() || null,
        anneeScolaireId: form.anneeScolaireId.trim(),
        niveauId: form.niveauId,
        estActive: form.estActive ?? true,
      };

      const res = await createMutation.mutateAsync(payload);

      if (res.success && res.data) {
        toast.success(
          'Classe créée ! 🎉',
          `"${res.data.nom}" (${res.data.code}) a été créée avec succès.`,
          {
            duration: 4000,
            action: {
              label: 'Voir le détail',
              onClick: () =>
                navigate(`/dashboard/classes/${res.data!.id}`),
            },
          }
        );

        setTimeout(() => {
          navigate('/dashboard/classes');
        }, 1500);
      } else {
        toast.error(
          'Échec de la création',
          res.message ?? 'Le serveur a renvoyé une réponse invalide.'
        );
      }
    } catch {
      /* toast géré par le hook */
    }
  };

  // ─────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* ============================================
          EN-TÊTE
          ============================================ */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/classes"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            title="Retour"
            aria-label="Retour à la liste des classes"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BuildingOfficeIcon className="w-7 h-7 text-blue-600" />
              Nouvelle classe
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Créez une nouvelle classe pour votre établissement
            </p>
          </div>
        </div>

        {/* ✅ Liens contextuels */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            to="/dashboard/niveaux"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            title="Gérer les niveaux"
          >
            <AcademicCapIcon className="h-4 w-4" />
            Niveaux
          </Link>
          <Link
            to="/dashboard/annees-scolaires"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            title="Gérer les années scolaires"
          >
            <CalendarDaysIcon className="h-4 w-4" />
            Années
          </Link>
        </div>
      </div>

      {/* ============================================
          INDICATEUR D'ÉTAPES
          ============================================ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6">
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {[
            { n: 1, label: 'Identité', icon: IdentificationIcon },
            { n: 2, label: 'Configuration', icon: AdjustmentsHorizontalIcon },
          ].map((s, idx) => (
            <React.Fragment key={s.n}>
              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step > s.n
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : step === s.n
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s.n ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <s.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-400 font-medium">
                    Étape {s.n}
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      step >= s.n ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
              </div>

              {idx === 0 && (
                <div
                  className={`w-8 md:w-16 h-1 rounded-full transition-all ${
                    step > 1 ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ============================================
          FORMULAIRE
          ============================================ */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8"
      >
        <AnimatePresence mode="wait">
          {/* ═══════════════════════════════════════
              ÉTAPE 1 : IDENTITÉ
              ═══════════════════════════════════════ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <IdentificationIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Identité de la classe
                  </h2>
                  <p className="text-xs text-gray-500">Nom, code et niveau</p>
                </div>
              </div>

              {/* Nom */}
              <div>
                <label
                  htmlFor="classe-nom"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Nom de la classe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="classe-nom"
                    type="text"
                    value={form.nom}
                    onChange={(e) => updateField('nom', e.target.value)}
                    placeholder="Ex: 3ème A"
                    maxLength={100}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.nom
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  {errors.nom ? (
                    <p className="text-xs text-red-600">{errors.nom}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Nom complet de la classe (ex: 3ème A, CM2 B…)
                    </p>
                  )}
                  <span className="text-xs text-gray-400">
                    {form.nom.length}/100
                  </span>
                </div>
              </div>

              {/* Code */}
              <div>
                <label
                  htmlFor="classe-code"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Code unique <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="classe-code"
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      updateField('code', normalizeCode(e.target.value))
                    }
                    placeholder="Ex: 3EME-A-2025"
                    maxLength={50}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono uppercase transition-all ${
                      errors.code
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  {errors.code ? (
                    <p className="text-xs text-red-600">{errors.code}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      MAJUSCULES, chiffres, tirets et underscores (2-50)
                    </p>
                  )}
                  <span className="text-xs text-gray-400">
                    {form.code.length}/50
                  </span>
                </div>
                {form.code && (
                  <p className="text-xs text-gray-500 mt-1">
                    Aperçu :{' '}
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {form.code}
                    </span>
                  </p>
                )}
              </div>

              {/* Niveau */}
              <div>
                <label
                  htmlFor="classe-niveau"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Niveau <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AcademicCapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    id="classe-niveau"
                    value={form.niveauId}
                    onChange={(e) => updateField('niveauId', e.target.value)}
                    disabled={loadingNiveaux}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.niveauId
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200'
                    } ${loadingNiveaux ? 'opacity-50' : ''}`}
                  >
                    <option value="">
                      {loadingNiveaux
                        ? 'Chargement…'
                        : niveaux.length === 0
                        ? 'Aucun niveau disponible'
                        : '-- Sélectionner un niveau --'}
                    </option>
                    {niveaux.map((n: Niveau) => (
                      <option key={n.id} value={n.id}>
                        {n.ordre}. {n.nom} ({n.code})
                      </option>
                    ))}
                  </select>
                </div>

                {niveaux.length === 0 && !loadingNiveaux && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="flex-1 text-xs text-amber-800">
                      <p className="font-medium mb-1">
                        Aucun niveau n'existe encore
                      </p>
                      <p className="text-amber-700 mb-2">
                        Un niveau est obligatoire pour créer une classe (6ème,
                        5ème, CM2…).
                      </p>
                      <Link
                        to="/dashboard/niveaux/nouveau"
                        className="inline-flex items-center gap-1 font-medium text-amber-900 underline hover:no-underline"
                      >
                        <AcademicCapIcon className="w-3.5 h-3.5" />
                        Créer un niveau maintenant
                      </Link>
                    </div>
                  </div>
                )}

                {errors.niveauId && (
                  <p className="text-xs text-red-600 mt-1.5">
                    {errors.niveauId}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ÉTAPE 2 : CONFIGURATION
              ═══════════════════════════════════════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Récap étape 1 */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <SparklesIcon className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Récapitulatif
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Classe <strong>{form.nom}</strong> (
                      <span className="font-mono">{form.code}</span>) — Niveau{' '}
                      <strong>{selectedNiveau?.nom ?? form.niveauId}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <AdjustmentsHorizontalIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Configuration
                  </h2>
                  <p className="text-xs text-gray-500">
                    Année, capacité et localisation
                  </p>
                </div>
              </div>

              {/* ✅ Année scolaire — SELECT */}
              <div>
                <label
                  htmlFor="classe-annee"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Année scolaire <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    id="classe-annee"
                    value={form.anneeScolaireId}
                    onChange={(e) =>
                      updateField('anneeScolaireId', e.target.value)
                    }
                    disabled={loadingAnnees}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
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

                {/* ✅ Aperçu de l'année sélectionnée */}
                {selectedAnnee && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                    <p className="font-semibold mb-0.5">
                      📅 {selectedAnnee.nom}
                    </p>
                    <p className="text-blue-700">
                      Du{' '}
                      {new Date(selectedAnnee.dateDebut).toLocaleDateString(
                        'fr-FR',
                        { day: 'numeric', month: 'long', year: 'numeric' }
                      )}{' '}
                      au{' '}
                      {new Date(selectedAnnee.dateFin).toLocaleDateString(
                        'fr-FR',
                        { day: 'numeric', month: 'long', year: 'numeric' }
                      )}
                      {selectedAnnee.estActive && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                          ✓ Active
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* ✅ Alerte + lien si aucune année */}
                {anneesScolaires.length === 0 && !loadingAnnees && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="flex-1 text-xs text-amber-800">
                      <p className="font-medium mb-1">
                        Aucune année scolaire n'existe
                      </p>
                      <p className="text-amber-700 mb-2">
                        Une année scolaire est obligatoire pour créer une classe
                        (ex: 2025-2026).
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

              {/* Capacité + Salle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="classe-capacite"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Capacité
                  </label>
                  <div className="relative">
                    <UserGroupIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="classe-capacite"
                      type="number"
                      min={1}
                      max={500}
                      value={form.capacite ?? ''}
                      onChange={(e) =>
                        updateField(
                          'capacite',
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      placeholder="35"
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                        errors.capacite
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.capacite ? (
                    <p className="text-xs text-red-600 mt-1.5">
                      {errors.capacite}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1.5">
                      Nombre maximum d'élèves
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="classe-salle"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Salle
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="classe-salle"
                      type="text"
                      value={form.salle ?? ''}
                      onChange={(e) =>
                        updateField('salle', e.target.value || null)
                      }
                      placeholder="Ex: B12"
                      maxLength={50}
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                        errors.salle
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.salle && (
                    <p className="text-xs text-red-600 mt-1.5">
                      {errors.salle}
                    </p>
                  )}
                </div>
              </div>

              {/* Toggle actif */}
              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={form.estActive ?? true}
                  onChange={(e) =>
                    updateField('estActive', e.target.checked)
                  }
                  className="mt-0.5 w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Classe active dès la création
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Les élèves pourront être inscrits immédiatement dans cette
                    classe.
                  </p>
                </div>
              </label>

              {/* Info box */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-0.5">Prochaines étapes</p>
                  <ul className="space-y-0.5 text-blue-700">
                    <li>• Inscrire des élèves dans la classe</li>
                    <li>• Affecter des enseignants aux matières</li>
                    <li>• Créer l'emploi du temps</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================
            ACTIONS
            ============================================ */}
        <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-100">
          <div>
            {step === 2 && (
              <button
                type="button"
                onClick={handlePrev}
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Précédent
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/classes"
              className="hidden sm:inline-flex px-4 py-2.5 text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Annuler
            </Link>

            {step === 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={niveaux.length === 0}
                title={
                  niveaux.length === 0
                    ? 'Créez un niveau avant de continuer'
                    : 'Passer à l’étape suivante'
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Suivant
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={
                  createMutation.isPending || anneesScolaires.length === 0
                }
                title={
                  anneesScolaires.length === 0
                    ? 'Créez une année scolaire avant de valider'
                    : 'Créer la classe'
                }
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Création en cours…
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    Créer la classe
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* ============================================
          INFO BAS DE PAGE
          ============================================ */}
      <div className="text-center text-xs text-gray-400">
        <p>
          💡 La création d'une classe est immédiate. Vous pourrez ensuite y
          inscrire des élèves et définir son emploi du temps.
        </p>
      </div>
    </div>
  );
};

export default ClasseNouvellePage;