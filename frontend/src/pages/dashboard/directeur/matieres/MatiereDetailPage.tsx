// frontend2/src/pages/dashboard/directeur/matieres/MatiereDetailPage.tsx

import React, { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpenIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  ClockIcon,
  IdentificationIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  FolderOpenIcon,
  UsersIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChartBarIcon,
  ArrowTopRightOnSquareIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  PresentationChartLineIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useMatiere,
  useSoftDeleteMatiere,
  useHardDeleteMatiere,
} from '../../../../hooks/useMatieres';
import type {
  AffectationMatiere,
  EmploiTempsCreneau,
  EnseignantSummary,
  JourSemaine,
  ClasseSummary,
} from '../../../../types/matiere.types';

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const formatDate = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTime = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const JOURS_ORDER: JourSemaine[] = [
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

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
  hint?: string;
  link?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  hint,
  link,
}) => {
  const content = (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 truncate">
            {value}
          </p>
          {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
        </div>
        <div className={`p-2 rounded-lg ${bgColor} shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
};

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

type TabKey = 'overview' | 'professeurs' | 'emploi' | 'activite' | 'meta';

const MatiereDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: matiere, isLoading, isError, error, refetch } =
    useMatiere(id);

  const softDeleteMutation = useSoftDeleteMatiere();
  const hardDeleteMutation = useHardDeleteMatiere();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [confirmHardDelete, setConfirmHardDelete] = useState(false);

  // ─── Recherche ───
  const [searchProf, setSearchProf] = useState('');
  const [searchCreneau, setSearchCreneau] = useState('');

  // ─── Données dérivées ───
  const professeurs: EnseignantSummary[] = matiere?.professeurs ?? [];
  const classes: ClasseSummary[] = matiere?.classes ?? [];
  const affectations: AffectationMatiere[] = matiere?.affectations ?? [];
  const emploisTemps: EmploiTempsCreneau[] = matiere?.emploisTemps ?? [];
  const emploiTempsParJour = matiere?.emploiTempsParJour ?? [];
  const stats = matiere?._stats;
  const counts = matiere?._count ?? {
    notes: 0,
    affectations: 0,
    emploisTemps: 0,
    reglesEvaluation: 0,
    documents: 0,
    groupesTD: 0,
  };

  // ─── Filtres profs ───
  const filteredProfs = useMemo(() => {
    const q = searchProf.trim().toLowerCase();
    if (!q) return professeurs;
    return professeurs.filter((p) => {
      const hay = `${p.prenom} ${p.nom} ${p.matricule} ${
        p.specialite ?? ''
      }`.toLowerCase();
      return hay.includes(q);
    });
  }, [professeurs, searchProf]);

  // ─── Filtres créneaux ───
  const filteredEmploiParJour = useMemo(() => {
    const q = searchCreneau.trim().toLowerCase();
    if (!q) return emploiTempsParJour;
    return emploiTempsParJour
      .map((jour: any) => ({
        jour: jour.jour,
        cours: jour.cours.filter((c: any) => {
          const hay = `${c.enseignant?.prenom ?? ''} ${c.enseignant?.nom ?? ''} ${
            c.classe?.nom ?? ''
          } ${c.salle ?? ''} ${c.heureDebut} ${c.heureFin}`.toLowerCase();
          return hay.includes(q);
        }),
      }))
      .filter((j: any) => j.cours.length > 0);
  }, [emploiTempsParJour, searchCreneau]);

  // ─── Handlers ───
  const handleSoftDelete = async () => {
    if (!matiere) return;
    if (
      !confirm(
        `Archiver la matière "${matiere.nom}" ?\n\nElle ne sera plus disponible pour les affectations et notes.`
      )
    )
      return;
    try {
      await softDeleteMutation.mutateAsync(matiere.id);
      refetch();
    } catch {
      /* toasté */
    }
  };

  const handleHardDelete = async () => {
    if (!matiere) return;
    try {
      await hardDeleteMutation.mutateAsync(matiere.id);
      navigate('/dashboard/matieres');
    } catch {
      /* toasté */
    }
  };

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
  if (isError || !matiere) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Matière introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/dashboard/matieres"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Retour
            </Link>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const nbProfesseurs = stats?.nombreProfesseurs ?? professeurs.length;

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="space-y-6 w-full max-w-[1400px] mx-auto pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/matieres" className="hover:text-gray-900">
          Matières
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">
          {matiere.nom}
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
              to="/dashboard/matieres"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <BookOpenIcon className="w-10 h-10" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {matiere.nom}
                </h1>
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {matiere.code}
                </span>
                {matiere.estArchive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-full">
                    <XCircleIcon className="w-3.5 h-3.5" />
                    Archivée
                  </span>
                ) : matiere.estActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    <XCircleIcon className="w-3.5 h-3.5" />
                    Inactive
                  </span>
                )}
              </div>

              {matiere.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {matiere.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                {matiere.niveau && (
                  <span className="flex items-center gap-1">
                    <AcademicCapIcon className="w-4 h-4" />
                    {matiere.niveau.nom}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {matiere.dureeCours ?? 60} min
                </span>
                <span className="flex items-center gap-1">
                  <AcademicCapIcon className="w-4 h-4" />
                  Coef. {matiere.coefficient ?? '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            <button
              onClick={() => refetch()}
              className="p-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              title="Rafraîchir"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            <Link
              to={`/dashboard/matieres/${matiere.id}/editer`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 border border-amber-200"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Modifier
            </Link>
            {!matiere.estArchive && (
              <button
                onClick={handleSoftDelete}
                disabled={softDeleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 font-medium rounded-lg hover:bg-orange-100 border border-orange-200 disabled:opacity-50"
              >
                <XCircleIcon className="w-4 h-4" />
                Archiver
              </button>
            )}
            <button
              onClick={() => setConfirmHardDelete(true)}
              disabled={hardDeleteMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 border border-red-200 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══════════ STATS ═══════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Professeurs"
          value={nbProfesseurs}
          icon={UsersIcon}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          hint="affectations actives"
        />
        <StatCard
          label="Classes"
          value={stats?.nombreClasses ?? classes.length}
          icon={BuildingOffice2Icon}
          color="text-teal-600"
          bgColor="bg-teal-50"
          hint="où elle est enseignée"
        />
        <StatCard
          label="Notes saisies"
          value={counts.notes}
          icon={DocumentTextIcon}
          color="text-green-600"
          bgColor="bg-green-50"
          hint="élèves notés"
        />
        <StatCard
          label="Créneaux EDT"
          value={counts.emploisTemps}
          icon={CalendarDaysIcon}
          color="text-lime-600"
          bgColor="bg-lime-50"
          hint="emplois du temps"
        />
        <StatCard
          label="Règles d'éval."
          value={counts.reglesEvaluation}
          icon={ClipboardDocumentListIcon}
          color="text-purple-600"
          bgColor="bg-purple-50"
          hint="devoirs, tests…"
        />
        <StatCard
          label="Documents"
          value={counts.documents}
          icon={FolderOpenIcon}
          color="text-rose-600"
          bgColor="bg-rose-50"
          hint="supports de cours"
        />
      </div>

      {/* ═══════════ ONGLETS ═══════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {[
            { key: 'overview', label: "Vue d'ensemble", icon: ChartBarIcon },
            {
              key: 'professeurs',
              label: 'Professeurs',
              icon: UsersIcon,
              badge: professeurs.length,
            },
            {
              key: 'emploi',
              label: 'Emploi du temps',
              icon: CalendarDaysIcon,
              badge: emploisTemps.length,
            },
            {
              key: 'activite',
              label: 'Activité pédagogique',
              icon: ClipboardDocumentListIcon,
            },
            { key: 'meta', label: 'Métadonnées', icon: IdentificationIcon },
          ].map((tab) => (
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
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-600 rounded-full">
                  {tab.badge}
                </span>
              )}
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Infos générales */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpenIcon className="w-4 h-4 text-emerald-600" />
                    Informations générales
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <InfoRow
                      label="Nom complet"
                      value={matiere.nom}
                      icon={BookOpenIcon}
                    />
                    <InfoRow
                      label="Code"
                      value={
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                          {matiere.code}
                        </span>
                      }
                      icon={IdentificationIcon}
                    />
                    <InfoRow
                      label="Niveau"
                      value={matiere.niveau?.nom ?? '—'}
                      icon={AcademicCapIcon}
                    />
                    <InfoRow
                      label="Coefficient"
                      value={matiere.coefficient ?? '—'}
                      icon={AcademicCapIcon}
                    />
                    <InfoRow
                      label="Durée du cours"
                      value={`${matiere.dureeCours ?? 60} minutes`}
                      icon={ClockIcon}
                    />
                    <InfoRow
                      label="Description"
                      value={matiere.description ?? '—'}
                      icon={DocumentTextIcon}
                    />
                  </div>
                </div>

                {/* Classes où la matière est enseignée */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BuildingOffice2Icon className="w-4 h-4 text-emerald-600" />
                    Classes concernées ({classes.length})
                  </h3>
                  {classes.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center text-sm text-gray-500">
                      Aucune classe associée pour le moment.
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 max-h-64 overflow-y-auto">
                      {classes.map((c) => (
                        <Link
                          key={c.id}
                          to={`/dashboard/classes/${c.id}`}
                          className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all"
                        >
                          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                            <AcademicCapIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {c.nom}
                            </p>
                            <p className="text-xs text-gray-500">
                              {c.code}
                              {c.niveau && <> — {c.niveau.nom}</>}
                            </p>
                          </div>
                          <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Raccourcis */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                <Link
                  to={`/dashboard/affectations?matiereId=${matiere.id}`}
                  className="flex flex-col items-center gap-1 p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <UsersIcon className="w-5 h-5 text-emerald-600" />
                  <p className="text-xs font-medium text-emerald-700">
                    Affectations
                  </p>
                </Link>
                <Link
                  to={`/dashboard/notes?matiereId=${matiere.id}`}
                  className="flex flex-col items-center gap-1 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <DocumentTextIcon className="w-5 h-5 text-green-600" />
                  <p className="text-xs font-medium text-green-700">Notes</p>
                </Link>
                <Link
                  to={`/dashboard/documents?matiereId=${matiere.id}`}
                  className="flex flex-col items-center gap-1 p-3 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
                >
                  <FolderOpenIcon className="w-5 h-5 text-teal-600" />
                  <p className="text-xs font-medium text-teal-700">Documents</p>
                </Link>
                <Link
                  to={`/dashboard/regles-evaluation?matiereId=${matiere.id}`}
                  className="flex flex-col items-center gap-1 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <ClipboardDocumentListIcon className="w-5 h-5 text-purple-600" />
                  <p className="text-xs font-medium text-purple-700">
                    Règles
                  </p>
                </Link>
              </div>
            </motion.div>
          )}

          {/* ═══ PROFESSEURS ═══ */}
          {activeTab === 'professeurs' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-emerald-600" />
                  Professeurs affectés ({profSelectionnesLength(professeurs)})
                </h3>
                <Link
                  to={`/dashboard/matieres/${matiere.id}/affecter`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  <UsersIcon className="w-4 h-4" />
                  Gérer les affectations
                </Link>
              </div>

              {/* Recherche */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un professeur (nom, matricule, spécialité)…"
                  value={searchProf}
                  onChange={(e) => setSearchProf(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                {searchProf && (
                  <button
                    onClick={() => setSearchProf('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {filteredProfs.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <UsersIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {searchProf.trim()
                      ? 'Aucun professeur ne correspond à votre recherche.'
                      : 'Aucun professeur affecté à cette matière.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredProfs.map((p) => {
                    // Trouver les affectations pour ce prof
                    const profAffectations = affectations.filter(
                      (a) => a.enseignant?.id === p.id
                    );
                    const nbClasses = new Set(
                      profAffectations.map((a) => a.classe?.id).filter(Boolean)
                    ).size;

                    return (
                      <div
                        key={p.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          {p.photo ? (
                            <img
                              src={p.photo}
                              alt={`${p.prenom} ${p.nom}`}
                              className="w-12 h-12 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shrink-0">
                              {p.prenom?.[0]}
                              {p.nom?.[0]}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {p.prenom} {p.nom}
                            </p>
                            <p className="text-xs text-gray-500">
                              {p.matricule}
                              {p.specialite && <> — {p.specialite}</>}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {p.estActif === false && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 rounded font-medium">
                                  Inactif
                                </span>
                              )}
                              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-medium">
                                {nbClasses} classe(s)
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                                {profAffectations.length} affectation(s)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Affectations détaillées */}
                        {profAffectations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                            {profAffectations.slice(0, 3).map((a) => (
                              <div
                                key={a.id}
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="text-gray-600 truncate">
                                  {a.classe?.nom}
                                </span>
                                <span className="text-gray-500 shrink-0">
                                  {a.heuresHebdo ?? 0}h/sem
                                </span>
                              </div>
                            ))}
                            {profAffectations.length > 3 && (
                              <p className="text-[10px] text-gray-400 italic">
                                +{profAffectations.length - 3} autre(s)…
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ EMPLOI DU TEMPS ═══ */}
          {activeTab === 'emploi' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4 text-emerald-600" />
                  Emploi du temps ({emploisTemps.length} créneau(x))
                </h3>
                <Link
                  to={`/dashboard/emplois-temps?matiereId=${matiere.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  <PresentationChartLineIcon className="w-4 h-4" />
                  Gérer l'emploi du temps
                </Link>
              </div>

              {/* Recherche */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un créneau (prof, classe, salle, heure)…"
                  value={searchCreneau}
                  onChange={(e) => setSearchCreneau(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                {searchCreneau && (
                  <button
                    onClick={() => setSearchCreneau('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {filteredEmploiParJour.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <CalendarDaysIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {searchCreneau.trim()
                      ? 'Aucun créneau ne correspond à votre recherche.'
                      : "Aucun créneau d'emploi du temps pour cette matière."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEmploiParJour.map((jour: any) => (
                    <div
                      key={jour.jour}
                      className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
                    >
                      <div className="bg-emerald-600 px-4 py-2 flex items-center justify-between">
                        <p className="text-sm font-bold text-white">
                          {JOURS_LABEL[jour.jour as JourSemaine] ?? jour.jour}
                        </p>
                        <span className="text-xs text-emerald-100">
                          {jour.cours.length} cours
                        </span>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {jour.cours
                          .sort((a: any, b: any) =>
                            a.heureDebut.localeCompare(b.heureDebut)
                          )
                          .map((c: any) => (
                            <div
                              key={c.id}
                              className="flex items-center gap-3 p-3 bg-white hover:bg-emerald-50/30 transition-colors"
                            >
                              <div className="w-16 text-center shrink-0">
                                <p className="text-sm font-bold text-gray-900">
                                  {c.heureDebut}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {c.heureFin}
                                </p>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {c.classe?.nom ?? '—'}
                                  </p>
                                  {c.classe?.code && (
                                    <span className="text-[10px] font-mono bg-gray-50 px-1.5 py-0.5 rounded text-gray-600">
                                      {c.classe.code}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
                                  {c.enseignant && (
                                    <span className="inline-flex items-center gap-1">
                                      <UserCircleIcon className="w-3 h-3" />
                                      {c.enseignant.prenom} {c.enseignant.nom}
                                    </span>
                                  )}
                                  {c.salle && (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPinIcon className="w-3 h-3" />
                                      {c.salle}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ ACTIVITÉ PÉDAGOGIQUE ═══ */}
          {activeTab === 'activite' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ClipboardDocumentListIcon className="w-4 h-4 text-emerald-600" />
                  Résumé d'activité
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      Notes saisies
                    </span>
                    <Link
                      to={`/dashboard/notes?matiereId=${matiere.id}`}
                      className="font-bold text-emerald-600 hover:underline"
                    >
                      {counts.notes} →
                    </Link>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      Créneaux EDT
                    </span>
                    <span className="font-bold text-gray-900">
                      {counts.emploisTemps}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      Règles d'évaluation
                    </span>
                    <Link
                      to={`/dashboard/regles-evaluation?matiereId=${matiere.id}`}
                      className="font-bold text-emerald-600 hover:underline"
                    >
                      {counts.reglesEvaluation} →
                    </Link>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Documents</span>
                    <Link
                      to={`/dashboard/documents?matiereId=${matiere.id}`}
                      className="font-bold text-emerald-600 hover:underline"
                    >
                      {counts.documents} →
                    </Link>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Groupes TD</span>
                    <span className="font-bold text-gray-900">
                      {counts.groupesTD}
                    </span>
                  </div>
                </div>
              </div>

              {/* Règles d'évaluation */}
              {matiere.reglesEvaluation && matiere.reglesEvaluation.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ClipboardDocumentListIcon className="w-4 h-4 text-emerald-600" />
                    Règles d'évaluation ({matiere.reglesEvaluation.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matiere.reglesEvaluation.map((r: any) => (
                      <div
                        key={r.id}
                        className="bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {r.nom}
                          </p>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded uppercase">
                            {r.type}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                          <div>
                            <p className="text-gray-500">Coef.</p>
                            <p className="font-semibold text-gray-900">
                              {r.coefficient}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Barème</p>
                            <p className="font-semibold text-gray-900">
                              {r.baremeMin}-{r.baremeMax}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Seuil</p>
                            <p className="font-semibold text-gray-900">
                              {r.seuilReussite}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {matiere.documents && matiere.documents.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FolderOpenIcon className="w-4 h-4 text-emerald-600" />
                    Derniers documents ({matiere.documents.length})
                  </h3>
                  <div className="space-y-2">
                    {matiere.documents.map((d: any) => (
                      <div
                        key={d.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                          <DocumentTextIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {d.titre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {d.type} — {formatDate(d.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ MÉTADONNÉES ═══ */}
          {activeTab === 'meta' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <IdentificationIcon className="w-4 h-4 text-emerald-600" />
                Métadonnées
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <InfoRow
                  label="ID matière"
                  value={
                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200 break-all">
                      {matiere.id}
                    </span>
                  }
                  icon={IdentificationIcon}
                />
                <InfoRow
                  label="Niveau (ID)"
                  value={
                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200 break-all">
                      {matiere.niveauId}
                    </span>
                  }
                  icon={AcademicCapIcon}
                />
                <InfoRow
                  label="Créée le"
                  value={formatDateTime(matiere.createdAt)}
                  icon={CalendarDaysIcon}
                />
                <InfoRow
                  label="Modifiée le"
                  value={formatDateTime(matiere.updatedAt)}
                  icon={ClockIcon}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══════════ ACTIONS BAS DE PAGE ═══════════ */}
      <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
        <Link
          to="/dashboard/matieres"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour à la liste
        </Link>
        <Link
          to={`/dashboard/matieres/${matiere.id}/editer`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium border border-amber-200"
        >
          <PencilSquareIcon className="w-4 h-4" />
          Modifier cette matière
        </Link>
      </div>

      {/* ═══════════ DIALOG SUPPRESSION ═══════════ */}
      {confirmHardDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Supprimer définitivement
                </h2>
                <p className="text-xs text-gray-500">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700">
              La matière <strong>{matiere.nom}</strong> ({matiere.code}) sera
              supprimée définitivement.
            </p>

            {(counts.notes > 0 || counts.affectations > 0) && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">
                  ⚠️ Cette matière est référencée par {counts.notes} note(s) et{' '}
                  {counts.affectations} affectation(s). La suppression
                  échouera. Utilisez <strong>Archiver</strong> à la place.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setConfirmHardDelete(false)}
                className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleHardDelete}
                disabled={hardDeleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {hardDeleteMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Suppression…
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Supprimer définitivement
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

// Helper : nombre de profs uniques
function profSelectionnesLength(profs: EnseignantSummary[]): number {
  return new Set(profs.map((p) => p.id)).size;
}

export default MatiereDetailPage;