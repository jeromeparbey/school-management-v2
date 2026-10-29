// frontend2/src/pages/dashboard/directeur/emploi-temps/EmploiTempsNouvellePage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useCreateEmploiTemps,
  useCheckConflitsEmploiTemps,
} from '../../../../hooks/useEmploisTemps';
import { useClasses } from '../../../../hooks/useClasses';
import { useEnseignants } from '../../../../hooks/useEnseignants';
import { useMatieres } from '../../../../hooks/useMatieres';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import type {
  CreateEmploiTempsPayload,
  JourSemaine,
  Conflit,
} from '../../../../types/emploiTemps.types';

// ============================================
// HELPERS
// ============================================

const JOURS: JourSemaine[] = [
  'LUNDI',
  'MARDI',
  'MERCREDI',
  'JEUDI',
  'VENDREDI',
  'SAMEDI',
  'DIMANCHE',
];

const JOURS_LABEL: Record<JourSemaine, string> = {
  LUNDI: 'Lundi',
  MARDI: 'Mardi',
  MERCREDI: 'Mercredi',
  JEUDI: 'Jeudi',
  VENDREDI: 'Vendredi',
  SAMEDI: 'Samedi',
  DIMANCHE: 'Dimanche',
};

const todayISO = () => new Date().toISOString().slice(0, 10);

function extractList<T = any>(res: any, keys: string[] = []): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  for (const k of keys) if (Array.isArray(res[k])) return res[k] as T[];
  for (const k of ['data', 'items', 'results'])
    if (Array.isArray(res[k])) return res[k] as T[];
  return [];
}

// ============================================
// PAGE
// ============================================

const EmploiTempsNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateEmploiTemps();
  const checkConflitsMutation = useCheckConflitsEmploiTemps();

  // Référentiels
  const { data: classesData } = useClasses({ limit: 100 });
  const { data: enseignantsData } = useEnseignants({ limit: 100 });
  const { data: matieresData } = useMatieres({ limit: 100 });
  const { data: anneesData } = useAnneesScolaires({ limit: 50 });

  const classes = useMemo(
    () => extractList<any>(classesData, ['classes', 'data']),
    [classesData]
  );
  const enseignants = useMemo(
    () => extractList<any>(enseignantsData, ['enseignants', 'data']),
    [enseignantsData]
  );
  const matieres = useMemo(
    () => extractList<any>(matieresData, ['matieres', 'data']),
    [matieresData]
  );
  const annees = useMemo(
    () => extractList<any>(anneesData, ['annees', 'anneesScolaires', 'data']),
    [anneesData]
  );

  // Formulaire
  const [form, setForm] = useState<CreateEmploiTempsPayload>({
    jour: 'LUNDI',
    heureDebut: '08:00',
    heureFin: '10:00',
    classeId: '',
    enseignantId: '',
    matiereId: '',
    salle: null,
    estRecurrent: true,
    valableDu: todayISO(),
    valableAu: null,
    estActive: true,
    anneeScolaireId: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflits, setConflits] = useState<Conflit[] | null>(null);

  // Recherche inline
  const [searchClasse, setSearchClasse] = useState('');
  const [searchEnseignant, setSearchEnseignant] = useState('');
  const [searchMatiere, setSearchMatiere] = useState('');
  const [openClasse, setOpenClasse] = useState(false);
  const [openEnseignant, setOpenEnseignant] = useState(false);
  const [openMatiere, setOpenMatiere] = useState(false);

  const selectedClasse = useMemo(
    () => classes.find((c: any) => c.id === form.classeId),
    [classes, form.classeId]
  );
  const selectedEnseignant = useMemo(
    () => enseignants.find((e: any) => e.id === form.enseignantId),
    [enseignants, form.enseignantId]
  );
  const selectedMatiere = useMemo(
    () => matieres.find((m: any) => m.id === form.matiereId),
    [matieres, form.matiereId]
  );
  const selectedAnnee = useMemo(
    () => annees.find((a: any) => a.id === form.anneeScolaireId),
    [annees, form.anneeScolaireId]
  );

  // Filtres
  const filteredClasses = useMemo(() => {
    const q = searchClasse.trim().toLowerCase();
    if (!q) return classes.slice(0, 50);
    return classes
      .filter((c: any) =>
        `${c.nom} ${c.code ?? ''}`.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [classes, searchClasse]);

  const filteredEnseignants = useMemo(() => {
    const q = searchEnseignant.trim().toLowerCase();
    if (!q) return enseignants.slice(0, 50);
    return enseignants
      .filter((e: any) =>
        `${e.prenom} ${e.nom} ${e.matricule ?? ''}`.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [enseignants, searchEnseignant]);

  const filteredMatieres = useMemo(() => {
    const q = searchMatiere.trim().toLowerCase();
    if (!q) return matieres.slice(0, 50);
    return matieres
      .filter((m: any) =>
        `${m.nom} ${m.code ?? ''}`.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [matieres, searchMatiere]);

  // Pré-sélection année active
  useEffect(() => {
    if (!form.anneeScolaireId && annees.length > 0) {
      const active = annees.find((a: any) => a.estActive);
      if (active) {
        setForm((f) => ({ ...f, anneeScolaireId: active.id }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annees]);

  // Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm((f) => ({
      ...f,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
    if (errors[name]) {
      setErrors((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
    }
  };

  const selectClasse = (c: any) => {
    setForm((f) => ({ ...f, classeId: c.id }));
    setSearchClasse(`${c.nom}${c.code ? ` (${c.code})` : ''}`);
    setOpenClasse(false);
    setConflits(null);
  };
  const clearClasse = () => {
    setForm((f) => ({ ...f, classeId: '' }));
    setSearchClasse('');
  };

  const selectEnseignant = (e: any) => {
    setForm((f) => ({ ...f, enseignantId: e.id }));
    setSearchEnseignant(`${e.prenom} ${e.nom}`);
    setOpenEnseignant(false);
    setConflits(null);
  };
  const clearEnseignant = () => {
    setForm((f) => ({ ...f, enseignantId: '' }));
    setSearchEnseignant('');
  };

  const selectMatiere = (m: any) => {
    setForm((f) => ({ ...f, matiereId: m.id }));
    setSearchMatiere(`${m.nom}${m.code ? ` (${m.code})` : ''}`);
    setOpenMatiere(false);
    setConflits(null);
  };
  const clearMatiere = () => {
    setForm((f) => ({ ...f, matiereId: '' }));
    setSearchMatiere('');
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.classeId) e.classeId = 'Classe requise';
    if (!form.enseignantId) e.enseignantId = 'Enseignant requis';
    if (!form.matiereId) e.matiereId = 'Matière requise';
    if (!form.heureDebut) e.heureDebut = 'Heure de début requise';
    if (!form.heureFin) e.heureFin = 'Heure de fin requise';
    if (form.heureDebut >= form.heureFin)
      e.heureFin = 'Heure de fin doit être après le début';
    if (!form.valableDu) e.valableDu = 'Date de début requise';
    if (
      form.valableAu &&
      new Date(form.valableAu) <= new Date(form.valableDu)
    ) {
      e.valableAu = 'Date de fin doit être après le début';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCheckConflits = async () => {
    if (!form.classeId || !form.enseignantId || !form.heureDebut || !form.heureFin) {
      setErrors((p) => ({
        ...p,
        classeId: !form.classeId ? 'Classe requise' : p.classeId,
        enseignantId: !form.enseignantId ? 'Enseignant requis' : p.enseignantId,
      }));
      return;
    }
    try {
      const res = await checkConflitsMutation.mutateAsync({
        jour: form.jour,
        heureDebut: form.heureDebut,
        heureFin: form.heureFin,
        classeId: form.classeId,
        enseignantId: form.enseignantId,
        salle: form.salle,
        valableDu: form.valableDu,
        valableAu: form.valableAu,
      });
      const payload = (res as any)?.data ?? res;
      setConflits(payload?.conflits ?? []);
    } catch {
      /* toasté */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const created = await createMutation.mutateAsync(form);
      const id = (created as any)?.data?.id ?? (created as any)?.id;
      navigate(id ? `/dashboard/emploi-temps/${id}` : '/dashboard/emploi-temps');
    } catch {
      /* toasté */
    }
  };

  return (
    <div className="space-y-6 w-full max-w-[1200px] mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/emploi-temps" className="hover:text-gray-900">Emploi du temps</Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Nouveau créneau</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex items-start gap-4">
          <Link
            to="/dashboard/emploi-temps"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <CalendarDaysIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Nouveau créneau
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Créez un créneau d'emploi du temps. Les conflits sont détectés
              automatiquement.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 space-y-5"
      >
        {/* Jour */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Jour <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {JOURS.map((j) => (
              <button
                key={j}
                type="button"
                onClick={() => setForm((f) => ({ ...f, jour: j }))}
                className={`px-3 py-2 text-sm rounded-lg font-medium border transition-all ${
                  form.jour === j
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {JOURS_LABEL[j].slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Horaire */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Heure de début <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="heureDebut"
              value={form.heureDebut}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                errors.heureDebut ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.heureDebut && (
              <p className="text-xs text-red-600 mt-1">{errors.heureDebut}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Heure de fin <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="heureFin"
              value={form.heureFin}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                errors.heureFin ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.heureFin && (
              <p className="text-xs text-red-600 mt-1">{errors.heureFin}</p>
            )}
          </div>
        </div>

        {/* Classe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                  errors.classeId ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {openClasse && (
                <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                  {filteredClasses.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Aucune classe
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
                        className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 border-b last:border-b-0"
                      >
                        <AcademicCapIcon className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {c.nom}
                          </p>
                          <p className="text-xs text-gray-500">{c.code}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg">
              <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
              <p className="flex-1 text-sm font-medium text-gray-900">
                {selectedClasse.nom}
              </p>
              <button
                type="button"
                onClick={clearClasse}
                className="p-1 text-gray-500 hover:bg-white rounded"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          {errors.classeId && (
            <p className="text-xs text-red-600 mt-1">{errors.classeId}</p>
          )}
        </div>

        {/* Enseignant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Enseignant <span className="text-red-500">*</span>
          </label>
          {!selectedEnseignant ? (
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher un enseignant…"
                value={searchEnseignant}
                onChange={(e) => {
                  setSearchEnseignant(e.target.value);
                  setOpenEnseignant(true);
                }}
                onFocus={() => setOpenEnseignant(true)}
                onBlur={() =>
                  setTimeout(() => setOpenEnseignant(false), 150)
                }
                className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                  errors.enseignantId ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {openEnseignant && (
                <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                  {filteredEnseignants.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Aucun enseignant
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
                        className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 border-b last:border-b-0"
                      >
                        <UserCircleIcon className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {e.prenom} {e.nom}
                          </p>
                          <p className="text-xs text-gray-500">
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
            <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg">
              <UserCircleIcon className="w-5 h-5 text-indigo-600" />
              <p className="flex-1 text-sm font-medium text-gray-900">
                {selectedEnseignant.prenom} {selectedEnseignant.nom}
              </p>
              <button
                type="button"
                onClick={clearEnseignant}
                className="p-1 text-gray-500 hover:bg-white rounded"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          {errors.enseignantId && (
            <p className="text-xs text-red-600 mt-1">{errors.enseignantId}</p>
          )}
        </div>

        {/* Matière */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Matière <span className="text-red-500">*</span>
          </label>
          {!selectedMatiere ? (
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher une matière…"
                value={searchMatiere}
                onChange={(e) => {
                  setSearchMatiere(e.target.value);
                  setOpenMatiere(true);
                }}
                onFocus={() => setOpenMatiere(true)}
                onBlur={() => setTimeout(() => setOpenMatiere(false), 150)}
                className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                  errors.matiereId ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {openMatiere && (
                <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                  {filteredMatieres.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Aucune matière
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
                        className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 border-b last:border-b-0"
                      >
                        <BookOpenIcon className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {m.nom}
                          </p>
                          <p className="text-xs text-gray-500">{m.code}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg">
              <BookOpenIcon className="w-5 h-5 text-indigo-600" />
              <p className="flex-1 text-sm font-medium text-gray-900">
                {selectedMatiere.nom}
              </p>
              <button
                type="button"
                onClick={clearMatiere}
                className="p-1 text-gray-500 hover:bg-white rounded"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          {errors.matiereId && (
            <p className="text-xs text-red-600 mt-1">{errors.matiereId}</p>
          )}
        </div>

        {/* Salle + Année */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Salle (optionnel)
            </label>
            <input
              type="text"
              name="salle"
              value={form.salle ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, salle: e.target.value || null }))
              }
              placeholder="Ex: Salle A1"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Année scolaire
            </label>
            <select
              value={form.anneeScolaireId ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  anneeScolaireId: e.target.value || null,
                }))
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">— Aucune —</option>
              {annees.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.nom}
                  {a.estActive ? ' (active)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Validité */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Valable du <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="valableDu"
              value={form.valableDu}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                errors.valableDu ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.valableDu && (
              <p className="text-xs text-red-600 mt-1">{errors.valableDu}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Valable au (optionnel)
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
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="estRecurrent"
              checked={form.estRecurrent ?? true}
              onChange={handleChange}
              className="w-4 h-4 rounded text-indigo-600"
            />
            Cours récurrent (chaque semaine)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="estActive"
              checked={form.estActive ?? true}
              onChange={handleChange}
              className="w-4 h-4 rounded text-indigo-600"
            />
            Créneau actif immédiatement
          </label>
        </div>

        {/* Vérifier conflits */}
        <div className="border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={handleCheckConflits}
            disabled={checkConflitsMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 font-medium disabled:opacity-50"
          >
            {checkConflitsMutation.isPending ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Vérification…
              </>
            ) : (
              <>
                <ExclamationTriangleIcon className="w-4 h-4" />
                Vérifier les conflits avant création
              </>
            )}
          </button>

          {conflits !== null && (
            <div className="mt-3">
              {conflits.length === 0 ? (
                <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800 font-medium">
                    Aucun conflit détecté. Vous pouvez créer le créneau en
                    toute sécurité.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 font-medium">
                      {conflits.length} conflit(s) détecté(s)
                    </p>
                  </div>
                  <ul className="space-y-1.5 pl-7">
                    {conflits.map((c, idx) => (
                      <li key={idx} className="text-xs text-red-700">
                        <span className="font-bold">[{c.type}]</span>{' '}
                        {c.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
          <InformationCircleIcon className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-800">
            Le système vérifie automatiquement les conflits de <strong>classe</strong>,{' '}
            <strong>enseignant</strong> et <strong>salle</strong> avant chaque
            enregistrement.
          </p>
        </div>

        {/* Erreur globale */}
        {createMutation.isError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 whitespace-pre-line">
              {(createMutation.error as any)?.response?.data?.message ??
                (createMutation.error as any)?.message ??
                'Une erreur est survenue'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
          <Link
            to="/dashboard/emploi-temps"
            className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending || (conflits !== null && conflits.length > 0)}
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
                Créer le créneau
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default EmploiTempsNouvellePage;