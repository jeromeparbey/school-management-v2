// frontend2/src/pages/dashboard/directeur/affectations/AffectationNouvellePage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useCreateAffectation } from '../../../../hooks/useAffectations';
import { useEnseignants } from '../../../../hooks/useEnseignants';
import { useClasses } from '../../../../hooks/useClasses';
import { useMatieres } from '../../../../hooks/useMatieres';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import type { CreateAffectationPayload } from '../../../../types/affectation.types';

// ============================================
// HELPERS
// ============================================

const todayISO = () => new Date().toISOString().slice(0, 10);

function extractList<T = any>(res: any, preferredKeys: string[] = []): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  for (const key of preferredKeys) {
    if (Array.isArray(res[key])) return res[key] as T[];
  }
  for (const key of ['data', 'items', 'results']) {
    if (Array.isArray(res[key])) return res[key] as T[];
  }
  return [];
}

// ============================================
// PAGE
// ============================================

const AffectationNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateAffectation();

  // ─── Référentiels ───
  const {
    data: enseignantsData,
    isLoading: isLoadingEnseignants,
    isError: isErrorEnseignants,
  } = useEnseignants({ limit: 100 });
  const {
    data: classesData,
    isLoading: isLoadingClasses,
    isError: isErrorClasses,
  } = useClasses({ limit: 100 });
  const {
    data: matieresData,
    isLoading: isLoadingMatieres,
    isError: isErrorMatieres,
  } = useMatieres({ limit: 100 });
  const {
    data: anneesData,
    isLoading: isLoadingAnnees,
    isError: isErrorAnnees,
  } = useAnneesScolaires({ limit: 50 });

  const enseignants = useMemo(
    () => extractList<any>(enseignantsData, ['enseignants', 'data']),
    [enseignantsData]
  );
  const classes = useMemo(
    () => extractList<any>(classesData, ['classes', 'data']),
    [classesData]
  );
  const matieres = useMemo(
    () => extractList<any>(matieresData, ['matieres', 'data']),
    [matieresData]
  );
  const annees = useMemo(
    () => extractList<any>(anneesData, ['annees', 'anneesScolaires', 'data']),
    [anneesData]
  );

  const isLoadingRefs =
    isLoadingEnseignants ||
    isLoadingClasses ||
    isLoadingMatieres ||
    isLoadingAnnees;

  const hasRefsError =
    isErrorEnseignants ||
    isErrorClasses ||
    isErrorMatieres ||
    isErrorAnnees;

  // ─── Formulaire (matière optionnelle → null par défaut) ───
  const [form, setForm] = useState<CreateAffectationPayload>({
    enseignantId: '',
    classeId: '',
    matiereId: null,
    anneeScolaireId: '',
    heuresHebdo: 0,
    estPrincipal: false,
    valableDu: todayISO(),
    valableAu: null,
    estActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Recherches
  const [searchEnseignant, setSearchEnseignant] = useState('');
  const [searchClasse, setSearchClasse] = useState('');
  const [searchMatiere, setSearchMatiere] = useState('');
  const [searchAnnee, setSearchAnnee] = useState('');

  const [openEnseignant, setOpenEnseignant] = useState(false);
  const [openClasse, setOpenClasse] = useState(false);
  const [openMatiere, setOpenMatiere] = useState(false);
  const [openAnnee, setOpenAnnee] = useState(false);

  // Sélections courantes
  const selectedEnseignant = useMemo(
    () => enseignants.find((e: any) => e.id === form.enseignantId) ?? null,
    [enseignants, form.enseignantId]
  );
  const selectedClasse = useMemo(
    () => classes.find((c: any) => c.id === form.classeId) ?? null,
    [classes, form.classeId]
  );
  const selectedMatiere = useMemo(
    () =>
      form.matiereId
        ? matieres.find((m: any) => m.id === form.matiereId) ?? null
        : null,
    [matieres, form.matiereId]
  );
  const selectedAnnee = useMemo(
    () => annees.find((a: any) => a.id === form.anneeScolaireId) ?? null,
    [annees, form.anneeScolaireId]
  );

  // Filtres
  const filteredEnseignants = useMemo(() => {
    const q = searchEnseignant.trim().toLowerCase();
    if (!q) return enseignants.slice(0, 50);
    return enseignants
      .filter((e: any) => {
        const hay = `${e.prenom} ${e.nom} ${e.matricule ?? ''} ${
          e.specialite ?? ''
        }`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [enseignants, searchEnseignant]);

  const filteredClasses = useMemo(() => {
    const q = searchClasse.trim().toLowerCase();
    if (!q) return classes.slice(0, 50);
    return classes
      .filter((c: any) => {
        const hay = `${c.nom} ${c.code ?? ''}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [classes, searchClasse]);

  const filteredMatieres = useMemo(() => {
    const q = searchMatiere.trim().toLowerCase();
    if (!q) return matieres.slice(0, 50);
    return matieres
      .filter((m: any) => {
        const hay = `${m.nom} ${m.code ?? ''}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [matieres, searchMatiere]);

  const filteredAnnees = useMemo(() => {
    const q = searchAnnee.trim().toLowerCase();
    if (!q) return annees.slice(0, 50);
    return annees
      .filter((a: any) => (a.nom ?? '').toLowerCase().includes(q))
      .slice(0, 50);
  }, [annees, searchAnnee]);

  // Pré-sélectionner l'année active
  useEffect(() => {
    if (!form.anneeScolaireId && annees.length > 0) {
      const active = annees.find((a: any) => a.estActive);
      if (active) {
        setForm((f) => ({ ...f, anneeScolaireId: active.id }));
        setSearchAnnee(active.nom);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annees]);

  // ─── Handlers sélection ───
  const selectEnseignant = (e: any) => {
    setForm((f) => ({ ...f, enseignantId: e.id }));
    setSearchEnseignant(`${e.prenom} ${e.nom}`);
    setOpenEnseignant(false);
    setErrors((x) => ({ ...x, enseignantId: '' }));
  };
  const clearEnseignant = () => {
    setForm((f) => ({ ...f, enseignantId: '' }));
    setSearchEnseignant('');
  };

  const selectClasse = (c: any) => {
    setForm((f) => ({ ...f, classeId: c.id }));
    setSearchClasse(`${c.nom}${c.code ? ` (${c.code})` : ''}`);
    setOpenClasse(false);
    setErrors((x) => ({ ...x, classeId: '' }));
  };
  const clearClasse = () => {
    setForm((f) => ({ ...f, classeId: '' }));
    setSearchClasse('');
  };

  const selectMatiere = (m: any) => {
    setForm((f) => ({ ...f, matiereId: m.id }));
    setSearchMatiere(`${m.nom}${m.code ? ` (${m.code})` : ''}`);
    setOpenMatiere(false);
    setErrors((x) => ({ ...x, matiereId: '' }));
  };
  /** 🔑 Remet en mode "titulaire" (matière = null) */
  const clearMatiere = () => {
    setForm((f) => ({ ...f, matiereId: null }));
    setSearchMatiere('');
  };
  /** 🔑 Sélectionne explicitement "Aucune matière" */
  const selectNoMatiere = () => {
    setForm((f) => ({ ...f, matiereId: null }));
    setSearchMatiere('');
    setOpenMatiere(false);
  };

  const selectAnnee = (a: any) => {
    setForm((f) => ({ ...f, anneeScolaireId: a.id }));
    setSearchAnnee(a.nom);
    setOpenAnnee(false);
    setErrors((x) => ({ ...x, anneeScolaireId: '' }));
  };

  // ─── Autres handlers ───
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? Number(value)
          : value,
    }));
    if (errors[name]) {
      setErrors((p) => {
        const next = { ...p };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.enseignantId) e.enseignantId = 'Enseignant requis';
    if (!form.classeId) e.classeId = 'Classe requise';
    // ✅ matiereId N'EST PAS requis (nullable = titulaire)
    if (!form.anneeScolaireId) e.anneeScolaireId = 'Année scolaire requise';
    if (!form.valableDu) e.valableDu = 'Date de début requise';
    if (form.valableAu && new Date(form.valableAu) <= new Date(form.valableDu)) {
      e.valableAu = 'La date de fin doit être après la date de début';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const created = await createMutation.mutateAsync({
        ...form,
        // ✅ matiereId : null explicite si pas de matière
        matiereId: form.matiereId || null,
        valableAu: form.valableAu || null,
      });
      const createdId = (created as any)?.data?.id ?? (created as any)?.id;
      if (createdId) {
        navigate(`/dashboard/affectations/${createdId}`);
      } else {
        navigate('/dashboard/affectations');
      }
    } catch {
      /* toasté */
    }
  };

  // ✅ matiereId n'est plus obligatoire
  const canSubmit =
    !createMutation.isPending &&
    !!form.enseignantId &&
    !!form.classeId &&
    !!form.anneeScolaireId;

  // ═══════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════
  return (
    <div className="space-y-6 w-full max-w-[1200px] mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/affectations" className="hover:text-gray-900">
          Affectations
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Nouvelle affectation</span>
      </nav>

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex items-start gap-4">
          <Link
            to="/dashboard/affectations"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <UserGroupIcon className="w-8 h-8" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Nouvelle affectation
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Assignez un enseignant à une classe pour une matière (optionnelle)
              sur une année scolaire.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Grid 2 colonnes : formulaire + résumé latéral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══════════════ COLONNE FORMULAIRE ═══════════════ */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 space-y-6"
        >
          {/* Erreur globale */}
          {createMutation.isError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-red-700 whitespace-pre-line">
                {(createMutation.error as any)?.response?.data?.message ??
                  (createMutation.error as any)?.message ??
                  'Une erreur est survenue'}
              </div>
            </div>
          )}

          {hasRefsError && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Certaines données de référence n'ont pas pu être chargées.
                Vérifiez que des enseignants, classes, matières et années
                existent.
              </p>
            </div>
          )}

          {/* ══════ SECTION 1 : Enseignant ══════ */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Enseignant
              </h2>
            </div>

            {!selectedEnseignant ? (
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                <input
                  type="text"
                  placeholder={
                    isLoadingEnseignants
                      ? 'Chargement…'
                      : 'Rechercher un enseignant (nom, matricule)…'
                  }
                  value={searchEnseignant}
                  onChange={(e) => {
                    setSearchEnseignant(e.target.value);
                    setOpenEnseignant(true);
                  }}
                  onFocus={() => setOpenEnseignant(true)}
                  onBlur={() =>
                    setTimeout(() => setOpenEnseignant(false), 150)
                  }
                  disabled={isLoadingEnseignants || enseignants.length === 0}
                  className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 ${
                    errors.enseignantId ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {isLoadingEnseignants && (
                  <ArrowPathIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}

                {openEnseignant && !isLoadingEnseignants && (
                  <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                    {filteredEnseignants.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        {enseignants.length === 0
                          ? 'Aucun enseignant disponible'
                          : 'Aucun résultat'}
                      </div>
                    ) : (
                      filteredEnseignants.map((e: any) => (
                        <button
                          key={e.id}
                          type="button"
                          onMouseDown={(ev) => {
                            ev.preventDefault();
                            selectEnseignant(e);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 flex items-center gap-3 border-b last:border-b-0"
                        >
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs shrink-0">
                            {e.prenom?.[0]}
                            {e.nom?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {e.prenom} {e.nom}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {e.matricule}
                              {e.specialite && ` · ${e.specialite}`}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold shrink-0">
                  {selectedEnseignant.prenom?.[0]}
                  {selectedEnseignant.nom?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">
                    {selectedEnseignant.prenom} {selectedEnseignant.nom}
                  </p>
                  <p className="text-xs text-gray-600">
                    {selectedEnseignant.matricule}
                    {selectedEnseignant.specialite &&
                      ` · ${selectedEnseignant.specialite}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearEnseignant}
                  className="p-1.5 text-gray-500 hover:bg-white rounded-lg"
                  title="Changer"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {errors.enseignantId && (
              <p className="text-xs text-red-600 mt-1">{errors.enseignantId}</p>
            )}
          </div>

          {/* ══════ SECTION 2 : Classe & Matière ══════ */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Classe & Matière
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Classe */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Classe <span className="text-red-500">*</span>
                </label>

                {!selectedClasse ? (
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Rechercher une classe…"
                      value={searchClasse}
                      onChange={(e) => {
                        setSearchClasse(e.target.value);
                        setOpenClasse(true);
                      }}
                      onFocus={() => setOpenClasse(true)}
                      onBlur={() => setTimeout(() => setOpenClasse(false), 150)}
                      disabled={isLoadingClasses || classes.length === 0}
                      className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 ${
                        errors.classeId ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />

                    {openClasse && !isLoadingClasses && (
                      <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                        {filteredClasses.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            {classes.length === 0
                              ? 'Aucune classe disponible'
                              : 'Aucun résultat'}
                          </div>
                        ) : (
                          filteredClasses.map((c: any) => (
                            <button
                              key={c.id}
                              type="button"
                              onMouseDown={(ev) => {
                                ev.preventDefault();
                                selectClasse(c);
                              }}
                              className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 flex items-center gap-3 border-b last:border-b-0"
                            >
                              <div className="w-9 h-9 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                                <AcademicCapIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {c.nom}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {c.code}
                                  {c.capacite != null &&
                                    ` — ${c.capacite} places`}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center text-white shrink-0">
                      <AcademicCapIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {selectedClasse.nom}
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedClasse.code}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearClasse}
                      className="p-1.5 text-gray-500 hover:bg-white rounded-lg"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {errors.classeId && (
                  <p className="text-xs text-red-600 mt-1">{errors.classeId}</p>
                )}
              </div>

              {/* Matière — OPTIONNELLE */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Matière{' '}
                  <span className="text-gray-400 text-xs">(optionnel)</span>
                </label>

                {!selectedMatiere ? (
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={
                        form.matiereId === null
                          ? 'Titulaire — ou rechercher une matière…'
                          : 'Rechercher une matière…'
                      }
                      value={searchMatiere}
                      onChange={(e) => {
                        setSearchMatiere(e.target.value);
                        setOpenMatiere(true);
                      }}
                      onFocus={() => setOpenMatiere(true)}
                      onBlur={() => setTimeout(() => setOpenMatiere(false), 150)}
                      disabled={isLoadingMatieres || matieres.length === 0}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                    />

                    {openMatiere && !isLoadingMatieres && (
                      <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                        {/* ✅ Option "Aucune matière" en tête */}
                        <button
                          type="button"
                          onMouseDown={(ev) => {
                            ev.preventDefault();
                            selectNoMatiere();
                          }}
                          className={`w-full text-left px-3 py-2.5 hover:bg-amber-50 flex items-center gap-3 border-b ${
                            form.matiereId === null ? 'bg-amber-50' : ''
                          }`}
                        >
                          <div className="w-9 h-9 rounded-md bg-amber-500 flex items-center justify-center text-white shrink-0">
                            <UserCircleIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              Aucune matière
                            </p>
                            <p className="text-xs text-gray-500">
                              Titulaire de classe
                            </p>
                          </div>
                          {form.matiereId === null && (
                            <CheckCircleIcon className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                        </button>

                        {filteredMatieres.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            {matieres.length === 0
                              ? 'Aucune matière disponible'
                              : 'Aucun résultat'}
                          </div>
                        ) : (
                          filteredMatieres.map((m: any) => (
                            <button
                              key={m.id}
                              type="button"
                              onMouseDown={(ev) => {
                                ev.preventDefault();
                                selectMatiere(m);
                              }}
                              className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 flex items-center gap-3 border-b last:border-b-0"
                            >
                              <div className="w-9 h-9 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                                <BookOpenIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {m.nom}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {m.code}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center text-white shrink-0">
                      <BookOpenIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {selectedMatiere.nom}
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedMatiere.code}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearMatiere}
                      className="p-1.5 text-gray-500 hover:bg-white rounded-lg"
                      title="Retirer la matière (devenir titulaire)"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Bandeau "Titulaire" quand matière = null */}
                {form.matiereId === null && !selectedMatiere && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                    <UserCircleIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Mode <strong>titulaire</strong> — cet enseignant couvrira
                      la classe entière.
                    </span>
                  </div>
                )}

                {errors.matiereId && (
                  <p className="text-xs text-red-600 mt-1">{errors.matiereId}</p>
                )}
              </div>
            </div>
          </div>

          {/* ══════ SECTION 3 : Année scolaire ══════ */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                3
              </div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Année scolaire
              </h2>
            </div>

            {!selectedAnnee ? (
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rechercher une année…"
                  value={searchAnnee}
                  onChange={(e) => {
                    setSearchAnnee(e.target.value);
                    setOpenAnnee(true);
                  }}
                  onFocus={() => setOpenAnnee(true)}
                  onBlur={() => setTimeout(() => setOpenAnnee(false), 150)}
                  disabled={isLoadingAnnees || annees.length === 0}
                  className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 ${
                    errors.anneeScolaireId
                      ? 'border-red-400'
                      : 'border-gray-200'
                  }`}
                />

                {openAnnee && !isLoadingAnnees && (
                  <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                    {filteredAnnees.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        {annees.length === 0
                          ? 'Aucune année disponible'
                          : 'Aucun résultat'}
                      </div>
                    ) : (
                      filteredAnnees.map((a: any) => (
                        <button
                          key={a.id}
                          type="button"
                          onMouseDown={(ev) => {
                            ev.preventDefault();
                            selectAnnee(a);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 flex items-center gap-3 border-b last:border-b-0"
                        >
                          <div className="w-9 h-9 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                            <CalendarDaysIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {a.nom}
                            </p>
                          </div>
                          {a.estActive && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold shrink-0">
                              ACTIVE
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <div className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center text-white shrink-0">
                  <CalendarDaysIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">
                    {selectedAnnee.nom}
                  </p>
                </div>
                {selectedAnnee.estActive && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                    ACTIVE
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setForm((f) => ({ ...f, anneeScolaireId: '' }));
                    setSearchAnnee('');
                  }}
                  className="p-1.5 text-gray-500 hover:bg-white rounded-lg"
                  title="Changer"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {errors.anneeScolaireId && (
              <p className="text-xs text-red-600 mt-1">
                {errors.anneeScolaireId}
              </p>
            )}
          </div>

          {/* ══════ SECTION 4 : Détails ══════ */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                4
              </div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Détails de l'affectation
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Heures / semaine
                </label>
                <input
                  type="number"
                  name="heuresHebdo"
                  min={0}
                  max={100}
                  step={0.5}
                  value={form.heuresHebdo}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">0 à 100 heures</p>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="estPrincipal"
                    checked={form.estPrincipal}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  Enseignant principal de cette classe
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Valable du <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="valableDu"
                  value={form.valableDu}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                    errors.valableDu ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.valableDu && (
                  <p className="text-xs text-red-600 mt-1">{errors.valableDu}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Valable au{' '}
                  <span className="text-gray-400 text-xs">(optionnel)</span>
                </label>
                <input
                  type="date"
                  name="valableAu"
                  value={form.valableAu ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      valableAu: e.target.value || null,
                    }))
                  }
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                    errors.valableAu ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.valableAu && (
                  <p className="text-xs text-red-600 mt-1">{errors.valableAu}</p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none mt-4">
              <input
                type="checkbox"
                name="estActive"
                checked={form.estActive}
                onChange={handleChange}
                className="w-4 h-4 rounded text-indigo-600"
              />
              Affectation active immédiatement
            </label>
          </div>

          {/* Info 409 — adapté selon matière/titulaire */}
          <div className="flex items-start gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
            <InformationCircleIcon className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-800">
              <p className="font-semibold mb-0.5">Contrainte d'unicité</p>
              <p>
                {form.matiereId ? (
                  <>
                    Un enseignant ne peut être affecté qu'une seule fois à la
                    même combinaison{' '}
                    <strong>(classe + matière + année)</strong>.
                  </>
                ) : (
                  <>
                    Un enseignant ne peut être <strong>titulaire</strong> que
                    d'une seule fois par classe et par année.
                  </>
                )}{' '}
                Une erreur 409 sera renvoyée si un doublon existe.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
            <Link
              to="/dashboard/affectations"
              className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Création…
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  Créer l'affectation
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* ═══════════════ COLONNE RÉSUMÉ ═══════════════ */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl shadow-lg p-6 text-white sticky top-4"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-90 mb-3">
              Récapitulatif
            </h3>

            {!selectedEnseignant &&
            !selectedClasse &&
            !selectedAnnee ? (
              <p className="text-sm text-white/70 italic">
                Sélectionnez les champs pour voir le résumé…
              </p>
            ) : (
              <div className="space-y-3">
                {selectedEnseignant && (
                  <div className="flex items-start gap-2">
                    <UserCircleIcon className="w-4 h-4 mt-0.5 shrink-0 opacity-80" />
                    <div className="min-w-0">
                      <p className="text-xs opacity-70">Enseignant</p>
                      <p className="font-semibold truncate">
                        {selectedEnseignant.prenom} {selectedEnseignant.nom}
                      </p>
                    </div>
                  </div>
                )}

                {selectedClasse && (
                  <div className="flex items-start gap-2">
                    <AcademicCapIcon className="w-4 h-4 mt-0.5 shrink-0 opacity-80" />
                    <div className="min-w-0">
                      <p className="text-xs opacity-70">Classe</p>
                      <p className="font-semibold truncate">
                        {selectedClasse.nom} ({selectedClasse.code})
                      </p>
                    </div>
                  </div>
                )}

                {/* Matière OU Titulaire */}
                <div className="flex items-start gap-2">
                  {selectedMatiere ? (
                    <BookOpenIcon className="w-4 h-4 mt-0.5 shrink-0 opacity-80" />
                  ) : (
                    <UserCircleIcon className="w-4 h-4 mt-0.5 shrink-0 opacity-80" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs opacity-70">Matière</p>
                    {selectedMatiere ? (
                      <p className="font-semibold truncate">
                        {selectedMatiere.nom}
                      </p>
                    ) : (
                      <p className="font-semibold italic">
                        Titulaire de classe
                      </p>
                    )}
                  </div>
                </div>

                {selectedAnnee && (
                  <div className="flex items-start gap-2">
                    <CalendarDaysIcon className="w-4 h-4 mt-0.5 shrink-0 opacity-80" />
                    <div className="min-w-0">
                      <p className="text-xs opacity-70">Année scolaire</p>
                      <p className="font-semibold">
                        {selectedAnnee.nom}
                        {selectedAnnee.estActive && (
                          <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">
                            ACTIVE
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {(form.heuresHebdo ?? 0) > 0 && (
                  <div className="flex items-start gap-2">
                    <ClockIcon className="w-4 h-4 mt-0.5 shrink-0 opacity-80" />
                    <div className="min-w-0">
                      <p className="text-xs opacity-70">Heures / semaine</p>
                      <p className="font-semibold">{form.heuresHebdo ?? 0}h</p>
                    </div>
                  </div>
                )}

                {form.estPrincipal && (
                  <div className="pt-2 border-t border-white/20">
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-400 text-amber-900 px-2 py-0.5 rounded font-bold">
                      ⭐ Enseignant principal
                    </span>
                  </div>
                )}

                {form.estActive && (
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-400 text-emerald-900 px-2 py-0.5 rounded font-bold">
                      <CheckCircleIcon className="w-3 h-3" />
                      Active immédiatement
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Aide */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Aide
            </h4>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold shrink-0">•</span>
                Recherchez en tapant le <strong>nom</strong>, le{' '}
                <strong>code</strong> ou le <strong>matricule</strong>.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold shrink-0">•</span>
                <span>
                  <strong>Matière optionnelle</strong> : laissez vide pour
                  désigner un <strong>titulaire de classe</strong> (primaire).
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold shrink-0">•</span>
                Les 50 premiers résultats s'affichent ; affinez la recherche si
                besoin.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold shrink-0">•</span>
                L'année scolaire <strong>active</strong> est pré-sélectionnée
                automatiquement.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffectationNouvellePage;