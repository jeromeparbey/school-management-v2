// frontend2/src/pages/dashboard/directeur/affectations/AffectationsPage.tsx

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  BookOpenIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  useAffectations,
  useCreateAffectation,
  useSoftDeleteAffectation,
  useHardDeleteAffectation,
} from '../../../../hooks/useAffectations';
import { useEnseignants } from '../../../../hooks/useEnseignants';
import { useClasses } from '../../../../hooks/useClasses';
import { useMatieres } from '../../../../hooks/useMatieres';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import type {
  Affectation,
  CreateAffectationPayload,
  ListAffectationsParams,
  SortByAffectation,
} from '../../../../types/affectation.types';

// ============================================
// HELPERS
// ============================================

const formatDate = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatHours = (h: number | null | undefined) =>
  h == null ? '—' : `${h}h/sem`;

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
// STAT CARD
// ============================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
  hint?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  hint,
}) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4">
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1 truncate">{value}</p>
        {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className={`p-2 rounded-lg ${bgColor} shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

// ============================================
// MODAL CRÉATION (recherche inline)
// ============================================

interface AffectationFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAffectationPayload) => Promise<void>;
  isSubmitting: boolean;
  enseignants: any[];
  classes: any[];
  matieres: any[];
  annees: any[];
  isLoadingRefs: boolean;
  errorRefs?: string | null;
}

const AffectationFormModal: React.FC<AffectationFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  enseignants,
  classes,
  matieres,
  annees,
  isLoadingRefs,
  errorRefs,
}) => {
  const [form, setForm] = useState({
    enseignantId: '',
    classeId: '',
    matiereId: '',
    anneeScolaireId: '',
    heuresHebdo: 0,
    estPrincipal: false,
    valableDu: todayISO(),
    valableAu: '',
    estActive: true,
  });

  // Recherche inline
  const [searchEnseignant, setSearchEnseignant] = useState('');
  const [searchClasse, setSearchClasse] = useState('');
  const [searchMatiere, setSearchMatiere] = useState('');
  const [searchAnnee, setSearchAnnee] = useState('');

  const [showEnseignantDD, setShowEnseignantDD] = useState(false);
  const [showClasseDD, setShowClasseDD] = useState(false);
  const [showMatiereDD, setShowMatiereDD] = useState(false);
  const [showAnneeDD, setShowAnneeDD] = useState(false);

  // Init année active
  React.useEffect(() => {
    if (!form.anneeScolaireId && annees.length > 0) {
      const active = annees.find((a: any) => a.estActive);
      if (active) {
        setForm((f) => ({ ...f, anneeScolaireId: active.id }));
        setSearchAnnee(`${active.nom}${active.estActive ? ' (active)' : ''}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annees]);

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
    () => matieres.find((m: any) => m.id === form.matiereId) ?? null,
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
        const hay = `${e.prenom} ${e.nom} ${e.matricule ?? ''}`.toLowerCase();
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
      .filter((a: any) => {
        const hay = `${a.nom}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [annees, searchAnnee]);

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
  };

  const handleSelectEnseignant = (e: any) => {
    setForm((f) => ({ ...f, enseignantId: e.id }));
    setSearchEnseignant(`${e.prenom} ${e.nom}`);
    setShowEnseignantDD(false);
  };
  const handleClearEnseignant = () => {
    setForm((f) => ({ ...f, enseignantId: '' }));
    setSearchEnseignant('');
  };

  const handleSelectClasse = (c: any) => {
    setForm((f) => ({ ...f, classeId: c.id }));
    setSearchClasse(`${c.nom} (${c.code})`);
    setShowClasseDD(false);
  };
  const handleClearClasse = () => {
    setForm((f) => ({ ...f, classeId: '' }));
    setSearchClasse('');
  };

  const handleSelectMatiere = (m: any) => {
    setForm((f) => ({ ...f, matiereId: m.id }));
    setSearchMatiere(`${m.nom} (${m.code})`);
    setShowMatiereDD(false);
  };
  const handleClearMatiere = () => {
    setForm((f) => ({ ...f, matiereId: '' }));
    setSearchMatiere('');
  };

  const handleSelectAnnee = (a: any) => {
    setForm((f) => ({ ...f, anneeScolaireId: a.id }));
    setSearchAnnee(`${a.nom}${a.estActive ? ' (active)' : ''}`);
    setShowAnneeDD(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.enseignantId ||
      !form.classeId ||
      !form.matiereId ||
      !form.anneeScolaireId ||
      !form.valableDu
    ) {
      return;
    }
    await onSubmit({
      enseignantId: form.enseignantId,
      classeId: form.classeId,
      matiereId: form.matiereId,
      anneeScolaireId: form.anneeScolaireId,
      heuresHebdo: form.heuresHebdo,
      estPrincipal: form.estPrincipal,
      valableDu: form.valableDu,
      valableAu: form.valableAu || null,
      estActive: form.estActive,
    });
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
        onClick={onClose}
      >
        <motion.form
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Nouvelle affectation
                </h2>
                <p className="text-xs text-gray-500">
                  Assignez un enseignant à une classe/matière
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {errorRefs && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{errorRefs}</p>
              </div>
            )}

            {/* ═══════ ENSEIGNANT (recherche) ═══════ */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Enseignant <span className="text-red-500">*</span>
                {isLoadingRefs && (
                  <span className="ml-2 text-[10px] text-indigo-600">
                    Chargement…
                  </span>
                )}
              </label>

              {!selectedEnseignant ? (
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Rechercher un enseignant (nom, matricule)…"
                    value={searchEnseignant}
                    onChange={(e) => {
                      setSearchEnseignant(e.target.value);
                      setShowEnseignantDD(true);
                    }}
                    onFocus={() => setShowEnseignantDD(true)}
                    onBlur={() =>
                      setTimeout(() => setShowEnseignantDD(false), 150)
                    }
                    disabled={isLoadingRefs || enseignants.length === 0}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  />
                  {showEnseignantDD && !isLoadingRefs && (
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
                              handleSelectEnseignant(e);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 border-b last:border-b-0"
                          >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs shrink-0">
                              {e.prenom?.[0]}
                              {e.nom?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {e.prenom} {e.nom}
                              </p>
                              <p className="text-xs text-gray-500">
                                {e.matricule}
                                {e.specialite && ` — ${e.specialite}`}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold shrink-0">
                    {selectedEnseignant.prenom?.[0]}
                    {selectedEnseignant.nom?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedEnseignant.prenom} {selectedEnseignant.nom}
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedEnseignant.matricule}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearEnseignant}
                    className="p-1 text-gray-500 hover:bg-white rounded"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* ═══════ CLASSE + MATIÈRE ═══════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Classe */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Classe <span className="text-red-500">*</span>
                </label>

                {!selectedClasse ? (
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Rechercher une classe…"
                      value={searchClasse}
                      onChange={(e) => {
                        setSearchClasse(e.target.value);
                        setShowClasseDD(true);
                      }}
                      onFocus={() => setShowClasseDD(true)}
                      onBlur={() =>
                        setTimeout(() => setShowClasseDD(false), 150)
                      }
                      disabled={isLoadingRefs || classes.length === 0}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                    />
                    {showClasseDD && !isLoadingRefs && (
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
                                handleSelectClasse(c);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 border-b last:border-b-0"
                            >
                              <div className="w-8 h-8 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                                <AcademicCapIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {c.nom}
                                </p>
                                <p className="text-xs text-gray-500">
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
                  <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="w-9 h-9 rounded-md bg-indigo-600 flex items-center justify-center text-white shrink-0">
                      <AcademicCapIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedClasse.nom}
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedClasse.code}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearClasse}
                      className="p-1 text-gray-500 hover:bg-white rounded"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Matière */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Matière <span className="text-red-500">*</span>
                </label>

                {!selectedMatiere ? (
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Rechercher une matière…"
                      value={searchMatiere}
                      onChange={(e) => {
                        setSearchMatiere(e.target.value);
                        setShowMatiereDD(true);
                      }}
                      onFocus={() => setShowMatiereDD(true)}
                      onBlur={() =>
                        setTimeout(() => setShowMatiereDD(false), 150)
                      }
                      disabled={isLoadingRefs || matieres.length === 0}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                    />
                    {showMatiereDD && !isLoadingRefs && (
                      <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
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
                                handleSelectMatiere(m);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 border-b last:border-b-0"
                            >
                              <div className="w-8 h-8 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                                <BookOpenIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {m.nom}
                                </p>
                                <p className="text-xs text-gray-500">
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
                  <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="w-9 h-9 rounded-md bg-indigo-600 flex items-center justify-center text-white shrink-0">
                      <BookOpenIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedMatiere.nom}
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedMatiere.code}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearMatiere}
                      className="p-1 text-gray-500 hover:bg-white rounded"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ═══════ ANNÉE (recherche) ═══════ */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Année scolaire <span className="text-red-500">*</span>
              </label>

              {!selectedAnnee ? (
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Rechercher une année…"
                    value={searchAnnee}
                    onChange={(e) => {
                      setSearchAnnee(e.target.value);
                      setShowAnneeDD(true);
                    }}
                    onFocus={() => setShowAnneeDD(true)}
                    onBlur={() =>
                      setTimeout(() => setShowAnneeDD(false), 150)
                    }
                    disabled={isLoadingRefs || annees.length === 0}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  />
                  {showAnneeDD && !isLoadingRefs && (
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
                              handleSelectAnnee(a);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 border-b last:border-b-0"
                          >
                            <div className="w-8 h-8 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                              <CalendarDaysIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {a.nom}
                              </p>
                            </div>
                            {a.estActive && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
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
                <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="w-9 h-9 rounded-md bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <CalendarDaysIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedAnnee.nom}
                    </p>
                  </div>
                  {selectedAnnee.estActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Heures + Principal */}
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
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="estPrincipal"
                    checked={form.estPrincipal}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  Enseignant principal de la classe
                </label>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Valable au (optionnel)
                </label>
                <input
                  type="date"
                  name="valableAu"
                  value={form.valableAu}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Active */}
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="estActive"
                checked={form.estActive}
                onChange={handleChange}
                className="w-4 h-4 rounded text-indigo-600"
              />
              Affectation active
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <Link
              to="/dashboard/affectations/nouveau"
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Ouvrir la page complète →
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isLoadingRefs ||
                  !form.enseignantId ||
                  !form.classeId ||
                  !form.matiereId ||
                  !form.anneeScolaireId
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Enregistrement…
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    Créer
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// PAGE PRINCIPALE
// ============================================

const AffectationsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [enseignantId, setEnseignantId] = useState('');
  const [classeId, setClasseId] = useState('');
  const [matiereId, setMatiereId] = useState('');
  const [anneeScolaireId, setAnneeScolaireId] = useState('');
  const [estActiveFilter, setEstActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [sortBy, setSortBy] = useState<SortByAffectation>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ✅ limit: 100 au lieu de 500 → sinon 400 "Données invalides"
  const {
    data: enseignantsData,
    isLoading: isLoadingEnseignants,
    isError: isErrorEnseignants,
    error: errorEnseignants,
  } = useEnseignants({ limit: 100 });

  const {
    data: classesData,
    isLoading: isLoadingClasses,
    isError: isErrorClasses,
    error: errorClasses,
  } = useClasses({ limit: 100 });

  const {
    data: matieresData,
    isLoading: isLoadingMatieres,
    isError: isErrorMatieres,
    error: errorMatieres,
  } = useMatieres({ limit: 100 });

  const {
    data: anneesData,
    isLoading: isLoadingAnnees,
    isError: isErrorAnnees,
    error: errorAnnees,
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

  const refsErrors = [
    isErrorEnseignants &&
      `Enseignants : ${(errorEnseignants as any)?.response?.data?.message ?? 'erreur'}`,
    isErrorClasses &&
      `Classes : ${(errorClasses as any)?.response?.data?.message ?? 'erreur'}`,
    isErrorMatieres &&
      `Matières : ${(errorMatieres as any)?.response?.data?.message ?? 'erreur'}`,
    isErrorAnnees &&
      `Années : ${(errorAnnees as any)?.response?.data?.message ?? 'erreur'}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const params = useMemo<ListAffectationsParams>(
    () => ({
      page,
      limit: 20,
      search: search.trim() || undefined,
      enseignantId: enseignantId || undefined,
      classeId: classeId || undefined,
      matiereId: matiereId || undefined,
      anneeScolaireId: anneeScolaireId || undefined,
      estActive:
        estActiveFilter === 'all' ? undefined : estActiveFilter === 'true',
      sortBy,
      sortOrder,
    }),
    [
      page,
      search,
      enseignantId,
      classeId,
      matiereId,
      anneeScolaireId,
      estActiveFilter,
      sortBy,
      sortOrder,
    ]
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useAffectations(params);

  const createMutation = useCreateAffectation();
  const softDeleteMutation = useSoftDeleteAffectation();
  const hardDeleteMutation = useHardDeleteAffectation();

  const affectations: Affectation[] = data?.data ?? [];
  const pagination = data?.pagination;

  const stats = useMemo(() => {
    const total = affectations.length;
    const actives = affectations.filter((a) => a.estActive).length;
    const heuresTotal = affectations.reduce(
      (s, a) => s + (a.heuresHebdo ?? 0),
      0
    );
    const classesSet = new Set(affectations.map((a) => a.classeId));
    return { total, actives, heuresTotal, nbClasses: classesSet.size };
  }, [affectations]);

  const handleCreate = async (payload: CreateAffectationPayload) => {
    try {
      await createMutation.mutateAsync(payload);
      setModalOpen(false);
    } catch {
      /* toasté */
    }
  };

  const handleSoftDelete = async (a: Affectation) => {
    if (
      !confirm(
        `Désactiver cette affectation ?\n\n${a.enseignant?.prenom} ${a.enseignant?.nom} — ${a.classe?.nom} — ${a.matiere?.nom}`
      )
    )
      return;
    try {
      await softDeleteMutation.mutateAsync(a.id);
    } catch {
      /* toasté */
    }
  };

  const handleHardDelete = async (a: Affectation) => {
    if (
      !confirm(
        `⚠️ SUPPRESSION DÉFINITIVE\n\n${a.enseignant?.prenom} ${a.enseignant?.nom} — ${a.classe?.nom} — ${a.matiere?.nom}\n\nCette action est IRRÉVERSIBLE.`
      )
    )
      return;
    setDeletingId(a.id);
    try {
      await hardDeleteMutation.mutateAsync(a.id);
    } catch {
      /* toasté */
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setEnseignantId('');
    setClasseId('');
    setMatiereId('');
    setAnneeScolaireId('');
    setEstActiveFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const activeFiltersCount = [
    search,
    enseignantId,
    classeId,
    matiereId,
    anneeScolaireId,
    estActiveFilter !== 'all' ? 'x' : '',
  ].filter(Boolean).length;

  return (
    <div className="p-6 space-y-5">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserGroupIcon className="h-7 w-7 text-indigo-600" />
            Affectations enseignants
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination?.total ?? 0} affectation(s) au total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            title="Rafraîchir"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <PlusIcon className="h-4 w-4" />
            Création rapide
          </button>
          <Link
            to="/dashboard/affectations/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvelle affectation
          </Link>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && !isError && affectations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Affichées"
            value={stats.total}
            icon={UserGroupIcon}
            color="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <StatCard
            label="Actives"
            value={stats.actives}
            icon={CheckCircleIcon}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            label="Heures / semaine"
            value={`${stats.heuresTotal}h`}
            icon={ClockIcon}
            color="text-amber-600"
            bgColor="bg-amber-50"
            hint="cumulées"
          />
          <StatCard
            label="Classes"
            value={stats.nbClasses}
            icon={AcademicCapIcon}
            color="text-purple-600"
            bgColor="bg-purple-50"
            hint="représentées"
          />
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher (enseignant, classe, matière…)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="relative">
            <ArrowsUpDownIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-') as [
                  SortByAffectation,
                  'asc' | 'desc'
                ];
                setSortBy(by);
                setSortOrder(order);
                setPage(1);
              }}
              className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
            >
              <option value="createdAt-desc">Plus récentes</option>
              <option value="createdAt-asc">Plus anciennes</option>
              <option value="heuresHebdo-desc">Heures (décroissant)</option>
              <option value="heuresHebdo-asc">Heures (croissant)</option>
            </select>
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              activeFiltersCount > 0
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="h-4 w-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3 pt-3 border-t border-gray-100">
                {/* Enseignant */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Enseignant
                  </label>
                  <select
                    value={enseignantId}
                    onChange={(e) => {
                      setEnseignantId(e.target.value);
                      setPage(1);
                    }}
                    disabled={isLoadingEnseignants || enseignants.length === 0}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  >
                    <option value="">
                      {isLoadingEnseignants
                        ? 'Chargement…'
                        : enseignants.length === 0
                        ? 'Aucun'
                        : `Tous (${enseignants.length})`}
                    </option>
                    {enseignants.map((e: any) => (
                      <option key={e.id} value={e.id}>
                        {e.prenom} {e.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Classe */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Classe
                  </label>
                  <select
                    value={classeId}
                    onChange={(e) => {
                      setClasseId(e.target.value);
                      setPage(1);
                    }}
                    disabled={isLoadingClasses || classes.length === 0}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  >
                    <option value="">
                      {isLoadingClasses
                        ? 'Chargement…'
                        : classes.length === 0
                        ? 'Aucune'
                        : `Toutes (${classes.length})`}
                    </option>
                    {classes.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Matière */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Matière
                  </label>
                  <select
                    value={matiereId}
                    onChange={(e) => {
                      setMatiereId(e.target.value);
                      setPage(1);
                    }}
                    disabled={isLoadingMatieres || matieres.length === 0}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  >
                    <option value="">
                      {isLoadingMatieres
                        ? 'Chargement…'
                        : matieres.length === 0
                        ? 'Aucune'
                        : `Toutes (${matieres.length})`}
                    </option>
                    {matieres.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Année */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Année
                  </label>
                  <select
                    value={anneeScolaireId}
                    onChange={(e) => {
                      setAnneeScolaireId(e.target.value);
                      setPage(1);
                    }}
                    disabled={isLoadingAnnees || annees.length === 0}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  >
                    <option value="">
                      {isLoadingAnnees
                        ? 'Chargement…'
                        : annees.length === 0
                        ? 'Aucune'
                        : `Toutes (${annees.length})`}
                    </option>
                    {annees.map((a: any) => (
                      <option key={a.id} value={a.id}>
                        {a.nom}
                        {a.estActive ? ' (active)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Statut
                  </label>
                  <select
                    value={estActiveFilter}
                    onChange={(e) => {
                      setEstActiveFilter(e.target.value as any);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="all">Toutes</option>
                    <option value="true">Actives</option>
                    <option value="false">Inactives</option>
                  </select>
                </div>
              </div>

              {refsErrors && (
                <div className="flex items-start gap-2 mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{refsErrors}</p>
                </div>
              )}

              {activeFiltersCount > 0 && (
                <div className="flex justify-end mt-3">
                  <button
                    onClick={resetFilters}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Effacer tous les filtres
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold">Erreur de chargement</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Impossible de charger les affectations.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : affectations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-full mb-4">
            <UserGroupIcon className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Aucune affectation
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {activeFiltersCount > 0
              ? 'Aucune affectation ne correspond à vos critères.'
              : 'Commencez par assigner un enseignant à une classe.'}
          </p>
          {activeFiltersCount > 0 ? (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Réinitialiser les filtres
            </button>
          ) : (
            <Link
              to="/dashboard/affectations/nouveau"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Créer ma première affectation
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Enseignant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Classe</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Matière</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Année</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Heures</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {affectations.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs shrink-0">
                          {a.enseignant?.prenom?.[0] ?? '?'}
                          {a.enseignant?.nom?.[0] ?? '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {a.enseignant?.prenom} {a.enseignant?.nom}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {a.enseignant?.matricule}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{a.classe?.nom}</p>
                      {a.classe?.code && <p className="text-xs text-gray-500">{a.classe.code}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{a.matiere?.nom}</p>
                      {a.matiere?.code && <p className="text-xs text-gray-500">{a.matiere.code}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{a.anneeScolaire?.nom}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-gray-900">{formatHours(a.heuresHebdo)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {a.estActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                          <CheckCircleIcon className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                          <XCircleIcon className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/dashboard/affectations/${a.id}/editer`}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                          title="Modifier"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </Link>
                        {a.estActive && (
                          <button
                            onClick={() => handleSoftDelete(a)}
                            disabled={softDeleteMutation.isPending}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg disabled:opacity-50"
                            title="Désactiver"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleHardDelete(a)}
                          disabled={deletingId === a.id}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-50"
                          title="Supprimer"
                        >
                          {deletingId === a.id ? (
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Page <strong>{pagination.page}</strong> sur{' '}
            <strong>{pagination.totalPages}</strong> — {pagination.total} affectation(s)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="px-3 text-sm text-gray-700">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <AffectationFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
          enseignants={enseignants}
          classes={classes}
          matieres={matieres}
          annees={annees}
          isLoadingRefs={isLoadingRefs}
          errorRefs={refsErrors || null}
        />
      )}
    </div>
  );
};

export default AffectationsPage;