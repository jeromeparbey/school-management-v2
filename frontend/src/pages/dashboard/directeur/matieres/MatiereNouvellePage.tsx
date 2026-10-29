// frontend2/src/pages/dashboard/directeur/matieres/MatiereNouvellePage.tsx

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpenIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserGroupIcon,
  UserPlusIcon,
  PlusIcon ,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import {
  useCreateMatiere,
  useAffecterEnseignant,
} from '../../../../hooks/useMatieres';
import {
  useEnseignants,
  useCreateEnseignant,
} from '../../../../hooks/useEnseignants';
import { useNiveaux } from '../../../../hooks/useNiveaux';
import { useClasses } from '../../../../hooks/useClasses';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import { useToast } from '../../../../context/ToastContext';
import type {
  CreateMatierePayload,
  AffecterEnseignantPayload,
} from '../../../../types/matiere.types';
import type { Enseignant } from '../../../../types/enseignant.types';

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function extractList<T = any>(res: any, keys: string[] = []): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  for (const k of keys) if (Array.isArray(res[k])) return res[k] as T[];
  for (const k of ['data', 'items', 'results'])
    if (Array.isArray(res[k])) return res[k] as T[];
  return [];
}

const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

const MatiereNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const createMutation = useCreateMatiere();
  const affecterMutation = useAffecterEnseignant();
  const createEnseignantMutation = useCreateEnseignant();

  // ─── Référentiels ───
  const { data: niveauxData } = useNiveaux({ limit: 100 });
  const niveaux = useMemo(
    () => extractList<any>(niveauxData, ['niveaux', 'data']),
    [niveauxData]
  );

  const { data: classesData } = useClasses({ limit: 200 });
  const classes = useMemo(
    () => extractList<any>(classesData, ['classes', 'data']),
    [classesData]
  );

  const { data: anneesData } = useAnneesScolaires({ limit: 50 });
  const annees = useMemo(
    () => extractList<any>(anneesData, ['annees', 'data']),
    [anneesData]
  );

  // ─── Enseignants ───
  const { data: enseignantsData, isLoading: enseignantsLoading } =
    useEnseignants({ limit: 200, sortBy: 'nom', sortOrder: 'asc' });
  const enseignants = useMemo(
    () => enseignantsData?.enseignants ?? [],
    [enseignantsData]
  );

  // ─── Form principal ───
  const [form, setForm] = useState<CreateMatierePayload>({
    nom: '',
    code: '',
    niveauId: '',
    coefficient: 1,
    dureeCours: 60,
    description: '',
    estActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Section affectation (optionnelle) ───
  const [affectationActive, setAffectationActive] = useState(false);
  const [classeId, setClasseId] = useState('');
  const [anneeScolaireId, setAnneeScolaireId] = useState('');
  const [heuresHebdo, setHeuresHebdo] = useState<number>(4);
  const [profsSelectionnes, setProfsSelectionnes] = useState<Enseignant[]>([]);

  // ─── Recherches ───
  const [searchProf, setSearchProf] = useState('');
  const [showProfDropdown, setShowProfDropdown] = useState(false);
  const [searchClasse, setSearchClasse] = useState('');
  const [showClasseDropdown, setShowClasseDropdown] = useState(false);

  // ─── Refs pour click-outside ───
  const profDropdownRef = useRef<HTMLDivElement>(null);
  const classeDropdownRef = useRef<HTMLDivElement>(null);

  // ─── Fermer les dropdowns au clic externe ───
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profDropdownRef.current &&
        !profDropdownRef.current.contains(e.target as Node)
      ) {
        setShowProfDropdown(false);
      }
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

  // ─── Modal création rapide enseignant ───
  const [showCreateEnseignant, setShowCreateEnseignant] = useState(false);
  const [newEnseignant, setNewEnseignant] = useState({
    prenom: '',
    nom: '',
    sexe: 'M' as 'M' | 'F',
    dateNaissance: '',
    telephone: '',
    email: '',
    dateEmbauche: toDateInput(new Date()),
    typeContrat: 'CDI',
    salaireBase: 0,
  });
  const [newEnseignantErrors, setNewEnseignantErrors] = useState<
    Record<string, string>
  >({});

  // ─── Année active par défaut ───
  useEffect(() => {
    if (!anneeScolaireId && annees.length > 0) {
      const active = annees.find((a: any) => a.estActive);
      if (active) setAnneeScolaireId(active.id);
    }
  }, [annees, anneeScolaireId]);

  // ─── Filtres dropdowns ───
  const filteredProfs = useMemo(() => {
    const q = searchProf.trim().toLowerCase();
    const base = enseignants.filter((e: any) => e.estArchive !== true);
    const filtered = !q
      ? base
      : base.filter((e: any) => {
          const hay = `${e.prenom} ${e.nom} ${e.matricule} ${
            e.email ?? ''
          } ${e.specialite ?? ''}`.toLowerCase();
          return hay.includes(q);
        });
    return filtered
      .filter((e: any) => !profsSelectionnes.some((p) => p.id === e.id))
      .slice(0, 50);
  }, [enseignants, searchProf, profsSelectionnes]);

  // ─── Liste "disponibles" sans filtre de recherche (pour l'affichage initial) ───
  const profsDisponibles = useMemo(() => {
    return enseignants
      .filter((e: any) => e.estArchive !== true)
      .filter((e: any) => !profsSelectionnes.some((p) => p.id === e.id));
  }, [enseignants, profsSelectionnes]);

  const filteredClasses = useMemo(() => {
    const q = searchClasse.trim().toLowerCase();
    if (!q) return classes.slice(0, 50);
    return classes
      .filter((c: any) => `${c.nom} ${c.code}`.toLowerCase().includes(q))
      .slice(0, 50);
  }, [classes, searchClasse]);

  const selectedClasse = useMemo(
    () => classes.find((c: any) => c.id === classeId) ?? null,
    [classes, classeId]
  );

  const selectedAnnee = useMemo(
    () => annees.find((a: any) => a.id === anneeScolaireId) ?? null,
    [annees, anneeScolaireId]
  );

  // ─── Handlers form ───
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm((f) => ({
      ...f,
      [name]:
        type === 'number'
          ? Number(value)
          : type === 'checkbox'
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

  // ─── Sélection prof ───
  const handleAddProf = (prof: Enseignant) => {
    setProfsSelectionnes((prev) => [...prev, prof]);
    setSearchProf('');
    setShowProfDropdown(false);
  };

  const handleRemoveProf = (id: string) => {
    setProfsSelectionnes((prev) => prev.filter((p) => p.id !== id));
  };

  // ─── Sélection classe ───
  const handleSelectClasse = (c: any) => {
    setClasseId(c.id);
    setSearchClasse(`${c.nom} (${c.code})`);
    setShowClasseDropdown(false);
    setErrors((x) => ({ ...x, classeId: '' }));
  };

  const handleClearClasse = () => {
    setClasseId('');
    setSearchClasse('');
  };

  // ══════════════════════════════════════════
  // VALIDATION
  // ══════════════════════════════════════════

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.nom.trim()) e.nom = 'Nom requis';
    if (!form.code.trim()) e.code = 'Code requis';
    else if (!/^[A-Z0-9_-]+$/.test(form.code.trim().toUpperCase()))
      e.code = 'Majuscules, chiffres, _ ou - uniquement';
    if (!form.niveauId) e.niveauId = 'Niveau requis';
    if (form.coefficient == null || form.coefficient <= 0)
      e.coefficient = 'Coefficient > 0';
    if (form.dureeCours == null || form.dureeCours <= 0)
      e.dureeCours = 'Durée > 0';

    if (affectationActive) {
      if (profsSelectionnes.length === 0)
        e.profs = 'Sélectionnez au moins un professeur';
      if (!classeId) e.classeId = 'Sélectionnez une classe';
      if (!anneeScolaireId) e.anneeScolaireId = 'Sélectionnez une année';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ══════════════════════════════════════════
  // SUBMIT
  // ══════════════════════════════════════════

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.warning('Formulaire incomplet');
      return;
    }

    try {
      const created = await createMutation.mutateAsync({
        ...form,
        nom: form.nom.trim(),
        code: form.code.trim().toUpperCase(),
      });

      const createdMatiere = (created as any)?.data ?? created;
      const matiereId: string | undefined = createdMatiere?.id;
      if (!matiereId) {
        toast.error('Matière créée mais ID introuvable');
        navigate('/dashboard/matieres');
        return;
      }

      if (affectationActive && profsSelectionnes.length > 0) {
        const payloads: AffecterEnseignantPayload[] = profsSelectionnes.map(
          (p) => ({
            enseignantId: p.id,
            classeId,
            anneeScolaireId,
            heuresHebdo,
          })
        );

        const results = await Promise.allSettled(
          payloads.map((pl) =>
            affecterMutation.mutateAsync({ matiereId, payload: pl })
          )
        );

        const ok = results.filter((r) => r.status === 'fulfilled').length;
        const ko = results.length - ok;

        if (ko === 0) {
          toast.success(`Matière créée + ${ok} professeur(s) affecté(s)`);
        } else if (ok > 0) {
          toast.warning(
            `Matière créée. ${ok} affectation(s) réussie(s), ${ko} échec(s).`
          );
        } else {
          toast.warning(
            'Matière créée mais aucune affectation réussie. Vérifiez les doublons.'
          );
        }
      } else {
        toast.success(`Matière créée : ${createdMatiere.nom ?? form.nom}`);
      }

      navigate(`/dashboard/matieres/${matiereId}`);
    } catch {
      /* toasté */
    }
  };

  // ══════════════════════════════════════════
  // CRÉATION RAPIDE ENSEIGNANT
  // ══════════════════════════════════════════

  const handleCreateEnseignant = async () => {
    const errs: Record<string, string> = {};
    if (!newEnseignant.prenom.trim()) errs.prenom = 'Prénom requis';
    if (!newEnseignant.nom.trim()) errs.nom = 'Nom requis';
    if (!newEnseignant.dateNaissance)
      errs.dateNaissance = 'Date de naissance requise';
    if (!newEnseignant.telephone.trim())
      errs.telephone = 'Téléphone requis';
    if (!newEnseignant.dateEmbauche)
      errs.dateEmbauche = "Date d'embauche requise";
    if (newEnseignant.salaireBase <= 0)
      errs.salaireBase = 'Salaire > 0';

    setNewEnseignantErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const res = await createEnseignantMutation.mutateAsync({
        prenom: newEnseignant.prenom.trim(),
        nom: newEnseignant.nom.trim(),
        sexe: newEnseignant.sexe,
        dateNaissance: newEnseignant.dateNaissance,
        telephone: newEnseignant.telephone.trim(),
        email: newEnseignant.email.trim() || null,
        dateEmbauche: newEnseignant.dateEmbauche,
        typeContrat: newEnseignant.typeContrat,
        salaireBase: newEnseignant.salaireBase,
        estActif: true,
      } as any);

      const created = (res as any)?.data ?? res;
      if (created?.id) {
        setProfsSelectionnes((prev) => [...prev, created]);
        toast.success(
          `Enseignant créé et ajouté : ${created.prenom} ${created.nom}`
        );
        setShowCreateEnseignant(false);
        setNewEnseignant({
          prenom: '',
          nom: '',
          sexe: 'M',
          dateNaissance: '',
          telephone: '',
          email: '',
          dateEmbauche: toDateInput(new Date()),
          typeContrat: 'CDI',
          salaireBase: 0,
        });
        setNewEnseignantErrors({});
      }
    } catch {
      /* toasté */
    }
  };

  const isPending = createMutation.isPending || affecterMutation.isPending;

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="space-y-6 w-full max-w-[1200px] mx-auto pb-12">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/matieres" className="hover:text-gray-900">
          Matières
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Nouvelle matière</span>
      </nav>

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex items-start gap-4">
          <Link
            to="/dashboard/matieres"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <BookOpenIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpenIcon className="w-7 h-7 text-emerald-600" />
              Nouvelle matière
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Créez une matière et affectez-lui un ou plusieurs professeurs.
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
        {/* ═══════════ SECTION 1 : INFOS MATIÈRE ═══════════ */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-4 h-4 text-emerald-600" />
            Informations de la matière
          </h2>

          {/* Nom */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom de la matière <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              placeholder="Ex: Mathématiques"
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
                errors.nom ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.nom && (
              <p className="text-xs text-red-600 mt-1">{errors.nom}</p>
            )}
          </div>

          {/* Code + Niveau */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Ex: MATH"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none uppercase ${
                  errors.code ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.code && (
                <p className="text-xs text-red-600 mt-1">{errors.code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Niveau <span className="text-red-500">*</span>
              </label>
              <select
                name="niveauId"
                value={form.niveauId}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
                  errors.niveauId ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <option value="">— Sélectionner un niveau —</option>
                {niveaux.map((n: any) => (
                  <option key={n.id} value={n.id}>
                    {n.nom} ({n.code})
                  </option>
                ))}
              </select>
              {errors.niveauId && (
                <p className="text-xs text-red-600 mt-1">{errors.niveauId}</p>
              )}
            </div>
          </div>

          {/* Coefficient + Durée */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Coefficient <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="coefficient"
                min={0.1}
                step={0.1}
                value={form.coefficient ?? 1}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
                  errors.coefficient ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.coefficient && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.coefficient}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Durée (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="dureeCours"
                min={15}
                step={15}
                value={form.dureeCours ?? 60}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
                  errors.dureeCours ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.dureeCours && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.dureeCours}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description ?? ''}
              onChange={handleChange}
              rows={3}
              placeholder="Description optionnelle…"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              name="estActive"
              checked={form.estActive ?? true}
              onChange={handleChange}
              className="w-4 h-4 rounded text-emerald-600"
            />
            Matière active immédiatement
          </label>
        </div>

        {/* ═══════════ SECTION 2 : AFFECTATION PROFESSEURS ═══════════ */}
        <div className="border-t border-gray-100 pt-6">
          <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl cursor-pointer select-none">
            <input
              type="checkbox"
              checked={affectationActive}
              onChange={(e) => setAffectationActive(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4 text-emerald-600" />
                Affecter un ou plusieurs professeurs
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Sélectionnez une classe, une année, puis un ou plusieurs
                enseignants. Toutes les affectations seront créées en une fois.
              </p>
            </div>
          </label>

          <AnimatePresence>
            {affectationActive && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-4">
                  {/* Classe + Année */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Classe */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Classe <span className="text-red-500">*</span>
                      </label>

                      {!selectedClasse ? (
                        <div className="relative" ref={classeDropdownRef}>
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Rechercher une classe…"
                            value={searchClasse}
                            onChange={(e) => {
                              setSearchClasse(e.target.value);
                              setShowClasseDropdown(true);
                            }}
                            onFocus={() => setShowClasseDropdown(true)}
                            className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
                              errors.classeId
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-200'
                            }`}
                          />
                          {showClasseDropdown && (
                            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                              {filteredClasses.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                  Aucune classe ne correspond
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
                                    className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 flex items-center gap-3 border-b last:border-b-0"
                                  >
                                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                                      <AcademicCapIcon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {c.nom}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {c.code}
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
                          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                            <AcademicCapIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">
                              {selectedClasse.nom}
                            </p>
                            <p className="text-xs text-gray-600">
                              {selectedClasse.code}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleClearClasse}
                            className="p-1.5 text-gray-500 hover:bg-white rounded-lg"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {errors.classeId && (
                        <p className="text-xs text-red-600 mt-1.5">
                          {errors.classeId}
                        </p>
                      )}
                    </div>

                    {/* Année */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Année scolaire <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={anneeScolaireId}
                          onChange={(e) => {
                            setAnneeScolaireId(e.target.value);
                            setErrors((x) => ({
                              ...x,
                              anneeScolaireId: '',
                            }));
                          }}
                          className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
                            errors.anneeScolaireId
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <option value="">— Sélectionner une année —</option>
                          {annees.map((a: any) => (
                            <option key={a.id} value={a.id}>
                              {a.nom} {a.estActive ? '(active)' : ''}
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
                  </div>

                  {/* Heures hebdo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Heures hebdomadaires (par professeur)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={heuresHebdo}
                      onChange={(e) =>
                        setHeuresHebdo(Number(e.target.value))
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                 {/* ═══════════ PROFESSEURS ═══════════ */}
<div>
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700">
      Professeurs <span className="text-red-500">*</span>
    </label>
    <span className="text-xs text-gray-500">
      {profsDisponibles.length} disponible(s)
    </span>
  </div>

  {/* 1️⃣ CHAMP DE RECHERCHE (filtre la liste en dessous) */}
  <div className="relative mb-2">
    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
    <input
      type="text"
      placeholder="Rechercher un professeur…"
      value={searchProf}
      onChange={(e) => setSearchProf(e.target.value)}
      className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none ${
        errors.profs ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`}
    />
    {searchProf && (
      <button
        type="button"
        onClick={() => setSearchProf('')}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
        aria-label="Effacer la recherche"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    )}
    {enseignantsLoading && (
      <ArrowPathIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
    )}
  </div>

  {/* 2️⃣ LISTE DES PROFS FILTRÉE (toujours visible, comme pour la classe) */}
  {enseignantsLoading ? (
    <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2 text-xs text-gray-500">
      <ArrowPathIcon className="w-4 h-4 animate-spin" />
      Chargement des professeurs…
    </div>
  ) : filteredProfs.length === 0 ? (
    <div className="p-4 bg-gray-50 rounded-lg text-xs text-gray-500 text-center">
      {searchProf.trim() ? (
        <>
          Aucun professeur ne correspond à «&nbsp;
          <strong>{searchProf}</strong>&nbsp;».
          <button
            type="button"
            onClick={() => setShowCreateEnseignant(true)}
            className="block mx-auto mt-2 text-emerald-600 font-medium hover:underline text-xs"
          >
            + Créer ce professeur
          </button>
        </>
      ) : enseignants.length === 0 ? (
        "Aucun professeur dans l'établissement"
      ) : (
        'Tous les professeurs sont déjà sélectionnés'
      )}
    </div>
  ) : (
    <div className="max-h-56 overflow-y-auto bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-100">
      {filteredProfs.map((p: any) => (
        <button
          key={p.id}
          type="button"
          onClick={() => handleAddProf(p)}
          className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 flex items-center gap-3 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm shrink-0">
            {p.prenom?.[0]}
            {p.nom?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate flex items-center gap-2">
              {p.prenom} {p.nom}
              {p.estActif === false && (
                <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 rounded font-medium">
                  Inactif
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {p.matricule}
              {p.specialite && <> — {p.specialite}</>}
            </p>
          </div>
          <PlusIcon className="w-4 h-4 text-emerald-600 shrink-0" />
        </button>
      ))}
    </div>
  )}

  {/* 3️⃣ BOUTON "CRÉER UN PROFESSEUR" */}
  <button
    type="button"
    onClick={() => setShowCreateEnseignant(true)}
    className="w-full mt-2 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
  >
    <UserPlusIcon className="w-3.5 h-3.5" />
    Créer un professeur
  </button>

  {/* 4️⃣ CHIPS PROFS SÉLECTIONNÉS */}
  {profsSelectionnes.length > 0 && (
    <div className="mt-3">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
        Sélectionnés ({profsSelectionnes.length})
      </p>
      <div className="flex flex-wrap gap-2">
        {profsSelectionnes.map((p) => (
          <span
            key={p.id}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-full"
          >
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
              {p.prenom[0]}
              {p.nom[0]}
            </span>
            <span className="font-medium">
              {p.prenom} {p.nom}
            </span>
            <button
              type="button"
              onClick={() => handleRemoveProf(p.id)}
              className="text-emerald-600 hover:text-emerald-900"
              aria-label={`Retirer ${p.prenom} ${p.nom}`}
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )}

  {errors.profs && (
    <p className="text-xs text-red-600 mt-1.5">{errors.profs}</p>
  )}

  {/* Récap */}
  {profsSelectionnes.length > 0 && selectedClasse && selectedAnnee && (
    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
      <p className="font-semibold text-emerald-800 mb-1">
        ✅ Récapitulatif
      </p>
      <p className="text-emerald-700">
        {profsSelectionnes.length} professeur(s) seront affectés à{' '}
        <strong>{selectedClasse.nom}</strong> pour{' '}
        <strong>{selectedAnnee.nom}</strong> à{' '}
        <strong>{heuresHebdo}h/semaine</strong> chacun.
      </p>
    </div>
  )}


                    {/* Récap */}
                    {profsSelectionnes.length > 0 &&
                      selectedClasse &&
                      selectedAnnee && (
                        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                          <p className="font-semibold text-emerald-800 mb-1">
                            ✅ Récapitulatif
                          </p>
                          <p className="text-emerald-700">
                            {profsSelectionnes.length} professeur(s) seront
                            affectés à <strong>{selectedClasse.nom}</strong>{' '}
                            pour <strong>{selectedAnnee.nom}</strong> à{' '}
                            <strong>{heuresHebdo}h/semaine</strong> chacun.
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info code unique */}
        <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
          <InformationCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-800">
            <p className="font-semibold mb-0.5">Code unique</p>
            <p>
              Le code de la matière doit être unique. Il sera automatiquement
              mis en majuscules.
            </p>
          </div>
        </div>

        {/* Erreur globale */}
        {(createMutation.isError || affecterMutation.isError) && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">
              {((createMutation.error ?? affecterMutation.error) as any)
                ?.response?.data?.message ??
                ((createMutation.error ?? affecterMutation.error) as any)
                  ?.message ??
                'Une erreur est survenue'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to="/dashboard/matieres"
            className="px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {isPending ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                {affectationActive && profsSelectionnes.length > 1
                  ? `Création + ${profsSelectionnes.length} affectations…`
                  : 'Création…'}
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                {affectationActive && profsSelectionnes.length > 0
                  ? `Créer la matière + affecter ${profsSelectionnes.length} prof(s)`
                  : 'Créer la matière'}
              </>
            )}
          </button>
        </div>
      </motion.form>

      {/* ═══════════ MODAL CRÉATION RAPIDE ENSEIGNANT ═══════════ */}
      {showCreateEnseignant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserPlusIcon className="w-5 h-5 text-emerald-600" />
                Création rapide d'un professeur
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateEnseignant(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Créez un professeur avec les informations minimales. Il sera
              automatiquement ajouté à la liste des affectations.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={newEnseignant.prenom}
                  onChange={(e) =>
                    setNewEnseignant((f) => ({
                      ...f,
                      prenom: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg ${
                    newEnseignantErrors.prenom
                      ? 'border-red-300'
                      : 'border-gray-200'
                  }`}
                />
                {newEnseignantErrors.prenom && (
                  <p className="text-xs text-red-600 mt-1">
                    {newEnseignantErrors.prenom}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={newEnseignant.nom}
                  onChange={(e) =>
                    setNewEnseignant((f) => ({ ...f, nom: e.target.value }))
                  }
                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg ${
                    newEnseignantErrors.nom
                      ? 'border-red-300'
                      : 'border-gray-200'
                  }`}
                />
                {newEnseignantErrors.nom && (
                  <p className="text-xs text-red-600 mt-1">
                    {newEnseignantErrors.nom}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Sexe
                </label>
                <div className="flex gap-2">
                  {(['M', 'F'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setNewEnseignant((f) => ({ ...f, sexe: s }))
                      }
                      className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium ${
                        newEnseignant.sexe === s
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {s === 'M' ? '♂ M' : '♀ F'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  value={newEnseignant.dateNaissance}
                  onChange={(e) =>
                    setNewEnseignant((f) => ({
                      ...f,
                      dateNaissance: e.target.value,
                    }))
                  }
                  max={toDateInput(new Date())}
                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg ${
                    newEnseignantErrors.dateNaissance
                      ? 'border-red-300'
                      : 'border-gray-200'
                  }`}
                />
                {newEnseignantErrors.dateNaissance && (
                  <p className="text-xs text-red-600 mt-1">
                    {newEnseignantErrors.dateNaissance}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={newEnseignant.telephone}
                  onChange={(e) =>
                    setNewEnseignant((f) => ({
                      ...f,
                      telephone: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg ${
                    newEnseignantErrors.telephone
                      ? 'border-red-300'
                      : 'border-gray-200'
                  }`}
                />
                {newEnseignantErrors.telephone && (
                  <p className="text-xs text-red-600 mt-1">
                    {newEnseignantErrors.telephone}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={newEnseignant.email}
                  onChange={(e) =>
                    setNewEnseignant((f) => ({
                      ...f,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date d'embauche *
                </label>
                <input
                  type="date"
                  value={newEnseignant.dateEmbauche}
                  onChange={(e) =>
                    setNewEnseignant((f) => ({
                      ...f,
                      dateEmbauche: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg ${
                    newEnseignantErrors.dateEmbauche
                      ? 'border-red-300'
                      : 'border-gray-200'
                  }`}
                />
                {newEnseignantErrors.dateEmbauche && (
                  <p className="text-xs text-red-600 mt-1">
                    {newEnseignantErrors.dateEmbauche}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Type de contrat
                </label>
                <select
                  value={newEnseignant.typeContrat}
                  onChange={(e) =>
                    setNewEnseignant((f) => ({
                      ...f,
                      typeContrat: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="VACATAIRE">Vacataire</option>
                  <option value="STAGE">Stage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Salaire de base (F CFA) *
              </label>
              <input
                type="number"
                min={0}
                step="1000"
                value={newEnseignant.salaireBase || ''}
                onChange={(e) =>
                  setNewEnseignant((f) => ({
                    ...f,
                    salaireBase: Number(e.target.value),
                  }))
                }
                className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg ${
                  newEnseignantErrors.salaireBase
                    ? 'border-red-300'
                    : 'border-gray-200'
                }`}
              />
              {newEnseignantErrors.salaireBase && (
                <p className="text-xs text-red-600 mt-1">
                  {newEnseignantErrors.salaireBase}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowCreateEnseignant(false)}
                className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleCreateEnseignant}
                disabled={createEnseignantMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-60"
              >
                {createEnseignantMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Création…
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    Créer et ajouter
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatiereNouvellePage;