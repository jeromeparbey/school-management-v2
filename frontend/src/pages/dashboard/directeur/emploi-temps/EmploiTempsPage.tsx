// frontend2/src/pages/dashboard/directeur/emploi-temps/EmploiTempsPage.tsx

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  ClockIcon,
  BookOpenIcon,
  MapPinIcon,
  UserCircleIcon,
  FunnelIcon,
  XMarkIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MapIcon,
  BuildingOffice2Icon,
  ArrowPathRoundedSquareIcon,
} from '@heroicons/react/24/outline';
import {
  useEmploisTemps,
  useSoftDeleteEmploiTemps,
  useHardDeleteEmploiTemps,
  useToggleEmploiTemps,
} from '../../../../hooks/useEmploisTemps';
import { useClasses } from '../../../../hooks/useClasses';
import { useEnseignants } from '../../../../hooks/useEnseignants';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import type {
  EmploiTemps,
  JourSemaine,
} from '../../../../types/emploiTemps.types';

// ═══════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════

const JOURS: JourSemaine[] = [
  'LUNDI',
  'MARDI',
  'MERCREDI',
  'JEUDI',
  'VENDREDI',
  'SAMEDI',
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

const JOURS_JS = [
  'DIMANCHE',
  'LUNDI',
  'MARDI',
  'MERCREDI',
  'JEUDI',
  'VENDREDI',
  'SAMEDI',
];

// Palette de couleurs par matière (cyclique)
const MATIERE_COLORS = [
  { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', ring: 'ring-emerald-200' },
  { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', ring: 'ring-blue-200' },
  { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', ring: 'ring-purple-200' },
  { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', ring: 'ring-amber-200' },
  { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300', ring: 'ring-rose-200' },
  { bg: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300', ring: 'ring-teal-200' },
  { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300', ring: 'ring-indigo-200' },
  { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', ring: 'ring-orange-200' },
];

const getMatiereColor = (matiereId: string, matiereCode?: string) => {
  const key = matiereCode ?? matiereId;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return MATIERE_COLORS[Math.abs(hash) % MATIERE_COLORS.length];
};

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

const todayKey = (): JourSemaine => {
  const jsDay = new Date().getDay();
  return JOURS_JS[jsDay] as JourSemaine;
};

const parseTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Trouver la plage horaire globale (min début / max fin)
function computeTimeRange(slots: EmploiTemps[]): { start: number; end: number } {
  if (slots.length === 0) {
    return { start: parseTime('07:00'), end: parseTime('18:00') };
  }
  let min = Infinity;
  let max = -Infinity;
  for (const s of slots) {
    min = Math.min(min, parseTime(s.heureDebut));
    max = Math.max(max, parseTime(s.heureFin));
  }
  // Arrondir à l'heure
  min = Math.floor(min / 60) * 60;
  max = Math.ceil(max / 60) * 60;
  // Au minimum 8h d'amplitude
  if (max - min < 8 * 60) max = min + 8 * 60;
  return { start: min, end: max };
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT : Bloc créneau (grille)
// ═══════════════════════════════════════════════════════════

interface SlotBlockProps {
  slot: EmploiTemps;
  timeStart: number;
  totalMinutes: number;
  onDelete: (s: EmploiTemps) => void;
  isDeleting: boolean;
  compact?: boolean;
}

const SlotBlock: React.FC<SlotBlockProps> = ({
  slot,
  timeStart,
  totalMinutes,
  onDelete,
  isDeleting,
  compact = false,
}) => {
  const color = getMatiereColor(slot.matiereId, slot.matiere?.code);

  const startMin = parseTime(slot.heureDebut);
  const endMin = parseTime(slot.heureFin);

  const top = ((startMin - timeStart) / totalMinutes) * 100;
  const height = ((endMin - startMin) / totalMinutes) * 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`absolute left-1 right-1 rounded-lg border-l-4 ${color.border} ${color.light} shadow-sm hover:shadow-md transition-all group overflow-hidden`}
      style={{
        top: `${top}%`,
        height: `${height}%`,
        minHeight: compact ? '32px' : '44px',
      }}
    >
      {/* Boutons hover */}
      <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Link
          to={`/dashboard/emploi-temps/${slot.id}/editer`}
          className="p-1 bg-white/90 text-amber-600 hover:bg-amber-50 rounded shadow-sm"
          title="Modifier"
          onClick={(e) => e.stopPropagation()}
        >
          <PencilSquareIcon className="w-3 h-3" />
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(slot);
          }}
          disabled={isDeleting}
          className="p-1 bg-white/90 text-rose-600 hover:bg-rose-50 rounded shadow-sm"
          title="Supprimer"
        >
          {isDeleting ? (
            <ArrowPathIcon className="w-3 h-3 animate-spin" />
          ) : (
            <TrashIcon className="w-3 h-3" />
          )}
        </button>
      </div>

      <div className="p-1.5 h-full flex flex-col justify-start overflow-hidden">
        <p className={`text-[10px] font-bold ${color.text} truncate leading-tight`}>
          {slot.matiere?.nom ?? 'Matière'}
        </p>
        <p className="text-[9px] text-gray-700 truncate leading-tight">
          {slot.classe?.nom}
        </p>
        {!compact && (
          <>
            <p className="text-[9px] text-gray-600 truncate leading-tight">
              {slot.enseignant?.prenom} {slot.enseignant?.nom}
            </p>
  {(() => {
  // ✅ Salle effective : celle du créneau, sinon celle de la classe
  const salleEffective = slot.salle ?? slot.classe?.salle;
  if (!salleEffective) return null;
  return (
    <p className="text-[8px] text-gray-500 truncate leading-tight flex items-center gap-0.5">
      <MapPinIcon className="w-2 h-2" />
      {salleEffective}
      {!slot.salle && slot.classe?.salle && (
        <span className="text-[7px] text-gray-400 italic ml-0.5">(classe)</span>
      )}
    </p>
  );
})()}
            <p className="text-[8px] text-gray-400 mt-auto leading-tight">
              {slot.heureDebut} → {slot.heureFin}
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════

type ViewMode = 'semaine' | 'liste';

const EmploiTempsPage: React.FC = () => {
  const [classeId, setClasseId] = useState('');
  const [enseignantId, setEnseignantId] = useState('');
  const [anneeScolaireId, setAnneeScolaireId] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('semaine');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [compactMode, setCompactMode] = useState(false);

  // Référentiels
  const { data: classesData } = useClasses({ limit: 100 });
  const { data: enseignantsData } = useEnseignants({ limit: 100 });
  const { data: anneesData } = useAnneesScolaires({ limit: 50 });

  const classes = useMemo(
    () => extractList<any>(classesData, ['classes', 'data']),
    [classesData]
  );
  const enseignants = useMemo(
    () => extractList<any>(enseignantsData, ['enseignants', 'data']),
    [enseignantsData]
  );
  const annees = useMemo(
    () => extractList<any>(anneesData, ['annees', 'anneesScolaires', 'data']),
    [anneesData]
  );

  // Params
  const params = useMemo(
    () => ({
      page: 1,
      limit: 500,
      classeId: classeId || undefined,
      enseignantId: enseignantId || undefined,
      anneeScolaireId: anneeScolaireId || undefined,
      estActive: true,
      sortBy: 'heureDebut' as const,
      sortOrder: 'asc' as const,
    }),
    [classeId, enseignantId, anneeScolaireId]
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useEmploisTemps(params);

  const softDelete = useSoftDeleteEmploiTemps();
  const hardDelete = useHardDeleteEmploiTemps();
  const toggle = useToggleEmploiTemps();

  const emploisTemps: EmploiTemps[] = data?.emploisTemps ?? [];
  const today = todayKey();

  // Plage horaire globale
  const { start: timeStart, end: timeEnd } = useMemo(
    () => computeTimeRange(emploisTemps),
    [emploisTemps]
  );
  const totalMinutes = timeEnd - timeStart;

  // Heures affichées (graduations)
  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let m = timeStart; m <= timeEnd; m += 60) arr.push(m);
    return arr;
  }, [timeStart, timeEnd]);

  // Group par jour
  const parJour = useMemo(() => {
    const map: Record<JourSemaine, EmploiTemps[]> = {
      LUNDI: [],
      MARDI: [],
      MERCREDI: [],
      JEUDI: [],
      VENDREDI: [],
      SAMEDI: [],
      DIMANCHE: [],
    };
    for (const e of emploisTemps) {
      if (map[e.jour]) map[e.jour].push(e);
    }
    return map;
  }, [emploisTemps]);

  // Stats
  const stats = useMemo(() => {
    const total = emploisTemps.length;
    const totalHeures = emploisTemps.reduce((s, e) => {
      return s + (parseTime(e.heureFin) - parseTime(e.heureDebut)) / 60;
    }, 0);
    const matieresSet = new Set(
      emploisTemps.map((e) => e.matiereId).filter(Boolean)
    );
    const classesSet = new Set(
      emploisTemps.map((e) => e.classeId).filter(Boolean)
    );
    const sallesSet = new Set(
      emploisTemps.map((e) => e.salle).filter(Boolean)
    );
    const profsSet = new Set(
      emploisTemps.map((e) => e.enseignantId).filter(Boolean)
    );
    return {
      total,
      totalHeures: Math.round(totalHeures * 10) / 10,
      nbMatieres: matieresSet.size,
      nbClasses: classesSet.size,
      nbSalles: sallesSet.size,
      nbProfs: profsSet.size,
    };
  }, [emploisTemps]);

  // Actions
  const handleSoftDelete = async (e: EmploiTemps) => {
    if (
      !confirm(
        `Désactiver ce créneau ?\n\n${JOURS_LABEL[e.jour]} ${e.heureDebut}-${e.heureFin} — ${e.matiere?.nom ?? ''}`
      )
    )
      return;
    try {
      await softDelete.mutateAsync(e.id);
    } catch {
      /* toasté */
    }
  };

  const handleHardDelete = async (e: EmploiTemps) => {
    if (
      !confirm(
        `⚠️ SUPPRESSION DÉFINITIVE\n\n${JOURS_LABEL[e.jour]} ${e.heureDebut}-${e.heureFin}\n${e.matiere?.nom ?? ''} — ${e.classe?.nom ?? ''}\n\nCette action est IRRÉVERSIBLE.`
      )
    )
      return;
    setDeletingId(e.id);
    try {
      await hardDelete.mutateAsync(e.id);
    } catch {
      /* toasté */
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setClasseId('');
    setEnseignantId('');
    setAnneeScolaireId('');
  };

  const activeFiltersCount = [classeId, enseignantId, anneeScolaireId].filter(
    Boolean
  ).length;

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* EN-TÊTE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="h-7 w-7 text-emerald-600" />
            Emploi du temps
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {stats.total} créneau(x) actif(s) · {stats.totalHeures}h/semaine
            {activeFiltersCount > 0 && (
              <span className="ml-2 text-emerald-600 font-medium">
                (filtré{stats.total > 1 ? 's' : ''})
              </span>
            )}
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
          <Link
            to="/dashboard/emploi-temps/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Nouveau créneau
          </Link>
        </div>
      </div>

      {/* STATS */}
      {!isLoading && !isError && emploisTemps.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Créneaux', value: stats.total, icon: ClockIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Heures / semaine', value: `${stats.totalHeures}h`, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Matières', value: stats.nbMatieres, icon: BookOpenIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Classes', value: stats.nbClasses, icon: AcademicCapIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Salles utilisées', value: stats.nbSalles, icon: BuildingOffice2Icon, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5 truncate">{s.value}</p>
                </div>
                <div className={`p-1.5 rounded-lg ${s.bg} shrink-0`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FILTRES + VUES */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Classe</label>
            <select
              value={classeId}
              onChange={(e) => setClasseId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Toutes les classes</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Enseignant</label>
            <select
              value={enseignantId}
              onChange={(e) => setEnseignantId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Tous les enseignants</option>
              {enseignants.map((e: any) => (
                <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Année scolaire</label>
            <select
              value={anneeScolaireId}
              onChange={(e) => setAnneeScolaireId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Toutes les années</option>
              {annees.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.nom}{a.estActive ? ' (active)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('semaine')}
              className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 ${
                viewMode === 'semaine'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Squares2X2Icon className="w-3.5 h-3.5" />
              Semaine
            </button>
            <button
              onClick={() => setViewMode('liste')}
              className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 ${
                viewMode === 'liste'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListBulletIcon className="w-3.5 h-3.5" />
              Liste
            </button>
          </div>

          {viewMode === 'semaine' && (
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={compactMode}
                onChange={(e) => setCompactMode(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600"
              />
              Mode compact
            </label>
          )}

          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline flex items-center gap-1"
            >
              <XMarkIcon className="w-3 h-3" />
              Effacer les filtres ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {/* CONTENU */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="grid grid-cols-6 gap-2">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold">Erreur de chargement</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ?? 'Impossible de charger les créneaux.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : emploisTemps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4">
            <CalendarDaysIcon className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Aucun créneau</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {activeFiltersCount > 0
              ? 'Aucun créneau ne correspond à vos critères.'
              : 'Commencez par créer votre premier créneau.'}
          </p>
          {activeFiltersCount === 0 && (
            <Link
              to="/dashboard/emploi-temps/nouveau"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Créer mon premier créneau
            </Link>
          )}
        </div>
      ) : viewMode === 'semaine' ? (
        // ═══════════════════════════════════════════════════════
        // VUE SEMAINE — GRILLE PRO
        // ═══════════════════════════════════════════════════════
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* En-tête des jours */}
          <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-gray-200 bg-gray-50">
            <div className="p-2 text-[10px] font-bold text-gray-500 uppercase text-center">
              Heure
            </div>
            {JOURS.map((jour) => {
              const isToday = jour === today;
              const count = parJour[jour]?.length ?? 0;
              return (
                <div
                  key={jour}
                  className={`p-2 text-center border-l border-gray-200 ${
                    isToday ? 'bg-emerald-100' : ''
                  }`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isToday ? 'text-emerald-700' : 'text-gray-700'
                    }`}
                  >
                    {JOURS_LABEL[jour].slice(0, 3)}
                  </p>
                  <p className="text-[9px] text-gray-500 mt-0.5">
                    {count} cours
                  </p>
                </div>
              );
            })}
          </div>

          {/* Corps avec grille horaire */}
          <div
            className="relative grid grid-cols-[60px_repeat(6,1fr)]"
            style={{ height: `${Math.max(400, (totalMinutes / 60) * 60)}px` }}
          >
            {/* Colonne des heures */}
            <div className="relative border-r border-gray-200 bg-gray-50/50">
              {hours.map((m) => (
                <div
                  key={m}
                  className="absolute left-0 right-0 text-center text-[10px] font-medium text-gray-500"
                  style={{
                    top: `${((m - timeStart) / totalMinutes) * 100}%`,
                    transform: 'translateY(-50%)',
                  }}
                >
                  {formatTime(m)}
                </div>
              ))}
            </div>

            {/* Colonnes des jours */}
            {JOURS.map((jour) => {
              const isToday = jour === today;
              const slots = parJour[jour] ?? [];
              return (
                <div
                  key={jour}
                  className={`relative border-l border-gray-200 ${
                    isToday ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  {/* Lignes horaires */}
                  {hours.map((m, idx) => (
                    <div
                      key={m}
                      className={`absolute left-0 right-0 border-t ${
                        idx === 0 ? 'border-transparent' : 'border-gray-100'
                      }`}
                      style={{
                        top: `${((m - timeStart) / totalMinutes) * 100}%`,
                      }}
                    />
                  ))}

                  {/* Ligne "maintenant" (si aujourd'hui) */}
                  {isToday &&
                    (() => {
                      const now = new Date();
                      const nowMin = now.getHours() * 60 + now.getMinutes();
                      if (nowMin < timeStart || nowMin > timeEnd) return null;
                      return (
                        <div
                          className="absolute left-0 right-0 z-20 pointer-events-none"
                          style={{
                            top: `${((nowMin - timeStart) / totalMinutes) * 100}%`,
                          }}
                        >
                          <div className="relative">
                            <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-rose-500" />
                            <div className="h-0.5 bg-rose-500" />
                          </div>
                        </div>
                      );
                    })()}

                  {/* Créneaux */}
                  {slots.map((slot) => (
                    <SlotBlock
                      key={slot.id}
                      slot={slot}
                      timeStart={timeStart}
                      totalMinutes={totalMinutes}
                      onDelete={handleHardDelete}
                      isDeleting={deletingId === slot.id}
                      compact={compactMode}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        // ═══════════════════════════════════════════════════════
        // VUE LISTE
        // ═══════════════════════════════════════════════════════
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jour</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Horaire</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Matière</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Classe</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Enseignant</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Salle</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...emploisTemps]
                  .sort((a, b) => {
                    const ja = JOURS.indexOf(a.jour);
                    const jb = JOURS.indexOf(b.jour);
                    if (ja !== jb) return ja - jb;
                    return parseTime(a.heureDebut) - parseTime(b.heureDebut);
                  })
                  .map((e) => {
                    const color = getMatiereColor(e.matiereId, e.matiere?.code);
                    return (
                      <tr key={e.id} className="hover:bg-gray-50/50">
                        <td className="px-3 py-3">
                          <span className="text-sm font-medium text-gray-900">
                            {JOURS_LABEL[e.jour]}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-mono text-sm text-gray-700">
                            {e.heureDebut} → {e.heureFin}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-1 h-8 rounded-full ${color.bg}`} />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {e.matiere?.nom}
                              </p>
                              {e.matiere?.code && (
                                <p className="text-[10px] text-gray-500 font-mono">
                                  {e.matiere.code}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <AcademicCapIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {e.classe?.nom}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <UserCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {e.enseignant?.prenom} {e.enseignant?.nom}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
  {(() => {
    // ✅ Salle effective : créneau → fallback classe
    const salleEffective = e.salle ?? e.classe?.salle;
    const isFromClasse = !e.salle && !!e.classe?.salle;

    if (!salleEffective) {
      return <span className="text-xs text-gray-400">—</span>;
    }

    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
          isFromClasse
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}
        title={
          isFromClasse
            ? 'Salle par défaut de la classe'
            : 'Salle assignée au créneau'
        }
      >
        <MapPinIcon className="w-3 h-3" />
        {salleEffective}
        {isFromClasse && (
          <span className="text-[9px] opacity-70 ml-0.5">(classe)</span>
        )}
      </span>
    );
  })()}
</td>
                        <td className="px-3 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              to={`/dashboard/emploi-temps/${e.id}`}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Voir"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/dashboard/emploi-temps/${e.id}/editer`}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                              title="Modifier"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleHardDelete(e)}
                              disabled={deletingId === e.id}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded disabled:opacity-50"
                              title="Supprimer"
                            >
                              {deletingId === e.id ? (
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                              ) : (
                                <TrashIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Légende couleurs */}
      {!isLoading && emploisTemps.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="font-medium">Légende :</span>
          {Array.from(
            new Map(
              emploisTemps
                .filter((e) => e.matiere)
                .map((e) => [
                  e.matiereId,
                  { nom: e.matiere!.nom, code: e.matiere!.code },
                ])
            ).values()
          )
            .slice(0, 10)
            .map((m) => {
              const color = getMatiereColor(m.code, m.code);
              return (
                <span key={m.code} className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-sm ${color.bg}`} />
                  {m.nom}
                </span>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default EmploiTempsPage;