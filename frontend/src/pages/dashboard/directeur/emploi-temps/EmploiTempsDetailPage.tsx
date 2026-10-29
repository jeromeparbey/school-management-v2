// frontend2/src/pages/dashboard/directeur/emploi-temps/EmploiTempsDetailPage.tsx

import React, { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ClockIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  ArrowPathRoundedSquareIcon,
  PlayCircleIcon,
  InformationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  UsersIcon,
  CalendarIcon,
  SparklesIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import {
  useEmploiTemps,
  useSoftDeleteEmploiTemps,
  useHardDeleteEmploiTemps,
  useToggleEmploiTemps,
  useDupliquerEmploiTemps,
  useEmploisTemps,
} from '../../../../hooks/useEmploisTemps';
import type { EmploiTemps, JourSemaine } from '../../../../types/emploiTemps.types';

// ═══════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════

const JOURS_LABEL: Record<JourSemaine, string> = {
  LUNDI: 'Lundi',
  MARDI: 'Mardi',
  MERCREDI: 'Mercredi',
  JEUDI: 'Jeudi',
  VENDREDI: 'Vendredi',
  SAMEDI: 'Samedi',
  DIMANCHE: 'Dimanche',
};

const JOURS: JourSemaine[] = [
  'LUNDI',
  'MARDI',
  'MERCREDI',
  'JEUDI',
  'VENDREDI',
  'SAMEDI',
  'DIMANCHE',
];

const JOURS_JS = [
  'DIMANCHE',
  'LUNDI',
  'MARDI',
  'MERCREDI',
  'JEUDI',
  'VENDREDI',
  'SAMEDI',
];

const JOURS_ORDER: Record<string, number> = {
  LUNDI: 1,
  MARDI: 2,
  MERCREDI: 3,
  JEUDI: 4,
  VENDREDI: 5,
  SAMEDI: 6,
  DIMANCHE: 7,
};

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const parseTime = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

const formatDate = (d: string | null | undefined) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTime = (d: string | null | undefined) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface TemporalStatus {
  kind: 'EN_COURS' | 'PROCHAIN_AUJ' | 'A_VENIR_SEMAINE' | 'TERMINE_AUJ' | 'PASSE';
  label: string;
  sublabel: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

function computeTemporalStatus(emploi: EmploiTemps): TemporalStatus {
  const now = new Date();
  const todayKey = JOURS_JS[now.getDay()];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const debut = parseTime(emploi.heureDebut);
  const fin = parseTime(emploi.heureFin);

  const valableDu = emploi.valableDu ? new Date(emploi.valableDu) : null;
  const valableAu = emploi.valableAu ? new Date(emploi.valableAu) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (valableDu && today < valableDu) {
    return {
      kind: 'A_VENIR_SEMAINE',
      label: 'Pas encore commencé',
      sublabel: `Débute le ${formatDate(emploi.valableDu)}`,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      icon: ClockIcon,
    };
  }
  if (valableAu && today > valableAu) {
    return {
      kind: 'PASSE',
      label: 'Terminé (période écoulée)',
      sublabel: `Fin le ${formatDate(emploi.valableAu)}`,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-200',
      icon: XCircleIcon,
    };
  }

  if (emploi.jour === todayKey) {
    if (nowMinutes >= debut && nowMinutes < fin) {
      return {
        kind: 'EN_COURS',
        label: 'En cours',
        sublabel: `Reste ${fin - nowMinutes} min`,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-300',
        icon: PlayCircleIcon,
      };
    }
    if (nowMinutes < debut) {
      return {
        kind: 'PROCHAIN_AUJ',
        label: "Aujourd'hui — à venir",
        sublabel: `Dans ${debut - nowMinutes} min (${emploi.heureDebut})`,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
        icon: ClockIcon,
      };
    }
    return {
      kind: 'TERMINE_AUJ',
      label: "Aujourd'hui — terminé",
      sublabel: `Fini à ${emploi.heureFin}`,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-200',
      icon: CheckCircleIcon,
    };
  }

  const todayNum = JOURS_ORDER[todayKey] ?? 0;
  const slotNum = JOURS_ORDER[emploi.jour] ?? 0;
  if (slotNum > todayNum) {
    const jours = slotNum - todayNum;
    return {
      kind: 'A_VENIR_SEMAINE',
      label: `Dans ${jours} jour${jours > 1 ? 's' : ''}`,
      sublabel: `${JOURS_LABEL[emploi.jour]} à ${emploi.heureDebut}`,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-300',
      icon: CalendarIcon,
    };
  }
  return {
    kind: 'PASSE',
    label: 'Passé (cette semaine)',
    sublabel: `${JOURS_LABEL[emploi.jour]} — semaine précédente`,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    icon: XCircleIcon,
  };
}

// ═══════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════════════════

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    {Icon && (
      <div className="p-2 bg-white rounded-lg shrink-0 border border-gray-100">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

type TabKey = 'overview' | 'matiere' | 'enseignant' | 'classe' | 'meta';

const EmploiTempsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: emploi, isLoading, isError, error, refetch } =
    useEmploiTemps(id);

  const softDelete = useSoftDeleteEmploiTemps();
  const hardDelete = useHardDeleteEmploiTemps();
  const toggle = useToggleEmploiTemps();
  const dupliquer = useDupliquerEmploiTemps();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDupliquer, setShowDupliquer] = useState(false);
  const [targetJour, setTargetJour] = useState<JourSemaine | ''>('');

  // Autres créneaux du même jour (même classe)
  const { data: autresData } = useEmploisTemps(
    emploi
      ? {
          classeId: emploi.classeId,
          jour: emploi.jour,
          estActive: true,
          limit: 50,
          sortBy: 'heureDebut',
          sortOrder: 'asc',
        }
      : undefined
  );

  const autresCreneaux = useMemo(() => {
    const list = autresData?.emploisTemps ?? [];
    return list.filter((e: any) => e.id !== emploi?.id);
  }, [autresData, emploi]);

  const status = useMemo(() => {
    if (!emploi) return null;
    return computeTemporalStatus(emploi);
  }, [emploi]);

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="text-gray-500 mt-4">Chargement…</p>
        </div>
      </div>
    );
  }

  // ─── Erreur ───
  if (isError || !emploi || !status) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Créneau introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ?? 'Une erreur est survenue'}
          </p>
          <Link
            to="/dashboard/emploi-temps"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Retour
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = status.icon;

  const handleToggle = async () => {
    try {
      await toggle.mutateAsync(emploi.id);
      refetch();
    } catch {
      /* toasté */
    }
  };

  const handleDupliquer = async () => {
    try {
      await dupliquer.mutateAsync({
        id: emploi.id,
        targetJour: targetJour || undefined,
      });
      setShowDupliquer(false);
      setTargetJour('');
    } catch {
      /* toasté */
    }
  };

  const handleDelete = async () => {
    try {
      await hardDelete.mutateAsync(emploi.id);
      navigate('/dashboard/emploi-temps');
    } catch {
      /* toasté */
    }
  };

  const dureeMinutes =
    parseTime(emploi.heureFin) - parseTime(emploi.heureDebut);
  const dureeLabel =
    dureeMinutes >= 60
      ? `${Math.floor(dureeMinutes / 60)}h${
          dureeMinutes % 60 ? ` ${dureeMinutes % 60}min` : ''
        }`
      : `${dureeMinutes} min`;

  // Onglets
  const tabs = [
    { key: 'overview', label: "Vue d'ensemble", icon: ChartBarIcon },
    { key: 'matiere', label: 'Matière', icon: BookOpenIcon },
    { key: 'enseignant', label: 'Enseignant', icon: UserCircleIcon },
    { key: 'classe', label: 'Classe', icon: AcademicCapIcon },
    { key: 'meta', label: 'Métadonnées', icon: IdentificationIcon },
  ];

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="space-y-6 w-full max-w-[1400px] mx-auto pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/emploi-temps" className="hover:text-gray-900">
          Emploi du temps
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">
          {JOURS_LABEL[emploi.jour]} {emploi.heureDebut}-{emploi.heureFin}
        </span>
      </nav>

      {/* ═══════════ EN-TÊTE ═══════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Link
              to="/dashboard/emploi-temps"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <CalendarDaysIcon className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {emploi.matiere?.nom ?? 'Cours'}
                </h1>
                {emploi.estActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
                    <XCircleIcon className="w-3.5 h-3.5" />
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                <span className="flex items-center gap-1 font-medium text-emerald-700">
                  <CalendarDaysIcon className="w-4 h-4" />
                  {JOURS_LABEL[emploi.jour]}
                </span>
                <span className="flex items-center gap-1 font-mono font-semibold">
                  <ClockIcon className="w-4 h-4" />
                  {emploi.heureDebut} — {emploi.heureFin}
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    ({dureeLabel})
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <AcademicCapIcon className="w-4 h-4" />
                  {emploi.classe?.nom}
                </span>
                <span className="flex items-center gap-1">
                  <UserCircleIcon className="w-4 h-4" />
                  {emploi.enseignant?.prenom} {emploi.enseignant?.nom}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            <button
              onClick={handleToggle}
              disabled={toggle.isPending}
              className={`inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg border disabled:opacity-50 ${
                emploi.estActive
                  ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {emploi.estActive ? (
                <>
                  <XCircleIcon className="w-4 h-4" />
                  Désactiver
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  Activer
                </>
              )}
            </button>
            <button
              onClick={() => setShowDupliquer(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 font-medium rounded-lg hover:bg-purple-100 border border-purple-200"
            >
              <ArrowPathRoundedSquareIcon className="w-4 h-4" />
              Dupliquer
            </button>
            <Link
              to={`/dashboard/emploi-temps/${emploi.id}/editer`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 border border-amber-200"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Modifier
            </Link>
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 border border-red-200"
            >
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══════════ STATUT TEMPOREL ═══════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border-2 p-5 ${status.bgColor} ${status.borderColor}`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-full ${status.bgColor} border-2 ${status.borderColor} flex items-center justify-center shrink-0`}
          >
            <StatusIcon className={`w-7 h-7 ${status.textColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-lg font-bold ${status.textColor}`}>
              {status.label}
            </p>
            <p className={`text-sm ${status.textColor} opacity-90 mt-0.5`}>
              {status.sublabel}
            </p>
          </div>
          {status.kind === 'EN_COURS' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          )}
        </div>
      </motion.div>

      {/* ═══════════ ONGLETS ═══════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ═══ OVERVIEW ═══ */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Raccourcis */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link
                  to={`/dashboard/enseignants/${emploi.enseignantId}`}
                  className="flex flex-col items-center gap-1 p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <UserCircleIcon className="w-5 h-5 text-emerald-600" />
                  <p className="text-xs font-medium text-emerald-700">
                    Fiche enseignant
                  </p>
                </Link>
                <Link
                  to={`/dashboard/classes/${emploi.classeId}`}
                  className="flex flex-col items-center gap-1 p-3 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
                >
                  <AcademicCapIcon className="w-5 h-5 text-teal-600" />
                  <p className="text-xs font-medium text-teal-700">
                    Fiche classe
                  </p>
                </Link>
                <Link
                  to={`/dashboard/matieres/${emploi.matiereId}`}
                  className="flex flex-col items-center gap-1 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <BookOpenIcon className="w-5 h-5 text-green-600" />
                  <p className="text-xs font-medium text-green-700">
                    Fiche matière
                  </p>
                </Link>
                <Link
                  to={`/dashboard/emploi-temps?classeId=${emploi.classeId}`}
                  className="flex flex-col items-center gap-1 p-3 bg-lime-50 rounded-xl hover:bg-lime-100 transition-colors"
                >
                  <CalendarDaysIcon className="w-5 h-5 text-lime-600" />
                  <p className="text-xs font-medium text-lime-700">
                    Planning classe
                  </p>
                </Link>
              </div>

              {/* Résumé */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpenIcon className="w-5 h-5 text-emerald-600" />
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Matière
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 truncate">
                    {emploi.matiere?.nom}
                  </p>
                  <p className="text-xs text-gray-600 font-mono mt-0.5">
                    {emploi.matiere?.code}
                  </p>
                </div>
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AcademicCapIcon className="w-5 h-5 text-teal-600" />
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                      Classe
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 truncate">
                    {emploi.classe?.nom}
                  </p>
                  <p className="text-xs text-gray-600 font-mono mt-0.5">
                    {emploi.classe?.code}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCircleIcon className="w-5 h-5 text-green-600" />
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                      Enseignant
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 truncate">
                    {emploi.enseignant?.prenom} {emploi.enseignant?.nom}
                  </p>
                  <p className="text-xs text-gray-600 font-mono mt-0.5">
                    {emploi.enseignant?.matricule}
                  </p>
                </div>
              </div>

              {/* Autres créneaux */}
              {autresCreneaux.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-emerald-600" />
                    Autres cours de {emploi.classe?.nom} le {JOURS_LABEL[emploi.jour]}
                    <span className="text-xs font-normal text-gray-500">
                      ({autresCreneaux.length})
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {autresCreneaux.map((c: any) => (
                      <Link
                        key={c.id}
                        to={`/dashboard/emploi-temps/${c.id}`}
                        className="block rounded-xl border border-gray-200 bg-white p-3 hover:border-emerald-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-14 text-center font-mono text-xs shrink-0 text-gray-700">
                            <p className="font-bold">{c.heureDebut}</p>
                            <p className="text-[10px] text-gray-400">→</p>
                            <p>{c.heureFin}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {c.matiere?.nom}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {c.enseignant?.prenom} {c.enseignant?.nom}
                              {c.salle && ` · ${c.salle}`}
                            </p>
                          </div>
                          <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ MATIÈRE ═══ */}
          {activeTab === 'matiere' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <BookOpenIcon className="w-4 h-4 text-emerald-600" />
                  Matière
                </h3>
                <Link
                  to={`/dashboard/matieres/${emploi.matiereId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  Voir la fiche
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-green-600 flex items-center justify-center text-white shrink-0">
                    <BookOpenIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {emploi.matiere?.nom}
                    </p>
                    <p className="text-sm text-green-700 font-mono">
                      {emploi.matiere?.code}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <InfoRow
                  label="Nom"
                  value={emploi.matiere?.nom ?? '—'}
                  icon={BookOpenIcon}
                />
                <InfoRow
                  label="Code"
                  value={
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                      {emploi.matiere?.code ?? '—'}
                    </span>
                  }
                  icon={IdentificationIcon}
                />
                {emploi.matiere?.coefficient != null && (
                  <InfoRow
                    label="Coefficient"
                    value={emploi.matiere.coefficient}
                    icon={AcademicCapIcon}
                  />
                )}
                {emploi.matiere?.dureeCours != null && (
                  <InfoRow
                    label="Durée standard"
                    value={`${emploi.matiere.dureeCours} minutes`}
                    icon={ClockIcon}
                  />
                )}
                {emploi.matiere?.description && (
                  <InfoRow
                    label="Description"
                    value={emploi.matiere.description}
                    icon={DocumentTextIcon}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ ENSEIGNANT ═══ */}
          {activeTab === 'enseignant' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <UserCircleIcon className="w-4 h-4 text-emerald-600" />
                  Enseignant
                </h3>
                <Link
                  to={`/dashboard/enseignants/${emploi.enseignantId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  Voir la fiche
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <div className="flex items-center gap-4">
                  {emploi.enseignant?.photo ? (
                    <img
                      src={emploi.enseignant.photo}
                      alt={emploi.enseignant.nom}
                      className="w-16 h-16 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                      {emploi.enseignant?.prenom?.[0] ?? '?'}
                      {emploi.enseignant?.nom?.[0] ?? '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-gray-900">
                      {emploi.enseignant?.prenom} {emploi.enseignant?.nom}
                    </p>
                    {emploi.enseignant?.matricule && (
                      <p className="text-sm text-gray-600 font-mono">
                        {emploi.enseignant.matricule}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                {emploi.enseignant?.specialite && (
                  <InfoRow
                    label="Spécialité"
                    value={emploi.enseignant.specialite}
                    icon={BookOpenIcon}
                  />
                )}
                {emploi.enseignant?.qualification && (
                  <InfoRow
                    label="Qualification"
                    value={emploi.enseignant.qualification}
                    icon={AcademicCapIcon}
                  />
                )}
                {emploi.enseignant?.email && (
                  <InfoRow
                    label="Email"
                    value={
                      <a
                        href={`mailto:${emploi.enseignant.email}`}
                        className="text-emerald-600 hover:underline"
                      >
                        {emploi.enseignant.email}
                      </a>
                    }
                    icon={EnvelopeIcon}
                  />
                )}
                {emploi.enseignant?.telephone && (
                  <InfoRow
                    label="Téléphone"
                    value={
                      <a
                        href={`tel:${emploi.enseignant.telephone}`}
                        className="text-emerald-600 hover:underline"
                      >
                        {emploi.enseignant.telephone}
                      </a>
                    }
                    icon={PhoneIcon}
                  />
                )}
                <InfoRow
                  label="Statut"
                  value={
                    emploi.enseignant?.estActif === false ? (
                      <span className="text-xs font-semibold text-red-700">
                        Inactif
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700">
                        Actif
                      </span>
                    )
                  }
                  icon={CheckCircleIcon}
                />
              </div>
            </motion.div>
          )}

          {/* ═══ CLASSE ═══ */}
          {activeTab === 'classe' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <AcademicCapIcon className="w-4 h-4 text-emerald-600" />
                  Classe
                </h3>
                <Link
                  to={`/dashboard/classes/${emploi.classeId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  Voir la fiche
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0">
                    <AcademicCapIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {emploi.classe?.nom}
                    </p>
                    <p className="text-sm text-teal-700 font-mono">
                      {emploi.classe?.code}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <InfoRow
                  label="Nom"
                  value={emploi.classe?.nom ?? '—'}
                  icon={AcademicCapIcon}
                />
                <InfoRow
                  label="Code"
                  value={
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                      {emploi.classe?.code ?? '—'}
                    </span>
                  }
                  icon={IdentificationIcon}
                />
                {emploi.classe?.salle && (
                  <InfoRow
                    label="Salle"
                    value={emploi.classe.salle}
                    icon={BuildingOfficeIcon}
                  />
                )}
                {emploi.classe?.capacite != null && (
                  <InfoRow
                    label="Capacité"
                    value={`${emploi.classe.capacite} élèves`}
                    icon={UsersIcon}
                  />
                )}
                {emploi.classe?.niveau && (
                  <InfoRow
                    label="Niveau"
                    value={emploi.classe.niveau.nom}
                    icon={AcademicCapIcon}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ MÉTADONNÉES ═══ */}
          {activeTab === 'meta' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <IdentificationIcon className="w-4 h-4 text-emerald-600" />
                Métadonnées
              </h3>

              <div className="bg-gray-50 rounded-xl p-4">
                <InfoRow
                  label="ID créneau"
                  value={
                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200 break-all">
                      {emploi.id}
                    </span>
                  }
                  icon={IdentificationIcon}
                />
                <InfoRow
                  label="Année scolaire"
                  value={
                    <div>
                      {emploi.anneeScolaire?.nom ?? '—'}
                      {emploi.anneeScolaire?.estActive && (
                        <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  }
                  icon={CalendarIcon}
                />
                <InfoRow
                  label="Valable du"
                  value={formatDate(emploi.valableDu)}
                  icon={CalendarIcon}
                />
                <InfoRow
                  label="Valable au"
                  value={formatDate(emploi.valableAu)}
                  icon={CalendarIcon}
                />
                <InfoRow
                  label="Récurrent"
                  value={
                    emploi.estRecurrent
                      ? 'Oui (chaque semaine)'
                      : 'Non (unique)'
                  }
                  icon={ArrowPathRoundedSquareIcon}
                />
                <InfoRow
                  label="Créé le"
                  value={formatDateTime(emploi.createdAt)}
                  icon={CalendarIcon}
                />
                <InfoRow
                  label="Modifié le"
                  value={formatDateTime(emploi.updatedAt)}
                  icon={ClockIcon}
                />
              </div>

              {/* Info créneau */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <InformationCircleIcon className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-emerald-800">
                    <p className="font-semibold mb-0.5">
                      À propos de ce créneau
                    </p>
                    <p>
                      Ce créneau se répète chaque semaine le{' '}
                      <strong>{JOURS_LABEL[emploi.jour]}</strong> de{' '}
                      <strong>{emploi.heureDebut}</strong> à{' '}
                      <strong>{emploi.heureFin}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══════════ ACTIONS BAS DE PAGE ═══════════ */}
      <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
        <Link
          to="/dashboard/emploi-temps"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour au planning
        </Link>
        <Link
          to={`/dashboard/emploi-temps/${emploi.id}/editer`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium border border-amber-200"
        >
          <PencilSquareIcon className="w-4 h-4" />
          Modifier ce créneau
        </Link>
      </div>

      {/* ═══════════ DIALOG DUPLIQUER ═══════════ */}
      {showDupliquer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <ArrowPathRoundedSquareIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Dupliquer ce créneau
                </h2>
                <p className="text-xs text-gray-500">
                  Même classe, matière, enseignant
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jour cible
              </label>
              <select
                value={targetJour}
                onChange={(e) => setTargetJour(e.target.value as JourSemaine)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">— Choisir un jour —</option>
                {JOURS.filter((j) => j !== emploi.jour).map((j) => (
                  <option key={j} value={j}>
                    {JOURS_LABEL[j]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDupliquer(false)}
                className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleDupliquer}
                disabled={dupliquer.isPending || !targetJour}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-60"
              >
                {dupliquer.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Duplication…
                  </>
                ) : (
                  <>
                    <ArrowPathRoundedSquareIcon className="w-4 h-4" />
                    Dupliquer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ DIALOG SUPPRESSION ═══════════ */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Supprimer le créneau
                </h2>
                <p className="text-xs text-gray-500">Action irréversible.</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              Le créneau{' '}
              <strong>
                {JOURS_LABEL[emploi.jour]} {emploi.heureDebut}—{emploi.heureFin}
              </strong>{' '}
              ({emploi.matiere?.nom}) sera supprimé définitivement.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={hardDelete.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {hardDelete.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Suppression…
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Supprimer
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

// Import manquant
import { DocumentTextIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default EmploiTempsDetailPage;