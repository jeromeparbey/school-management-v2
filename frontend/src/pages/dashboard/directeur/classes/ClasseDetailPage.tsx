// frontend2/src/pages/dashboard/directeur/classes/ClasseDetailPage.tsx

import React, { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ArchiveBoxIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  UsersIcon,
  IdentificationIcon,
  ClockIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  StarIcon,
  PlusIcon,
  BookOpenIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useClasse,
  useClasseEleves,
  useClasseStatistiques,
  useSoftDeleteClasse,
  useHardDeleteClasse,
} from '../../../../hooks/useClasses';
import { useAffectationsByClasse } from '../../../../hooks/useAffectations';

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

const formatDateShort = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
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

const calculerAge = (dateNaissance: string) => {
  const diff = Date.now() - new Date(dateNaissance).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const JOURS_ORDER = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
const JOURS_LABEL: Record<string, string> = {
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
      <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
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
  value: number | string;
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
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1 truncate">{value}</p>
        {hint && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{hint}</p>
        )}
      </div>
      <div className={`p-2 rounded-lg ${bgColor} shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

type TabKey = 'infos' | 'eleves' | 'emploiTemps' | 'equipe' | 'statistiques';

const ClasseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('infos');

  // Recherche élèves
  const [searchEleve, setSearchEleve] = useState('');
  const [filterSexe, setFilterSexe] = useState<'all' | 'M' | 'F'>('all');

  // ─── Requêtes ───
  const { data: classeData, isLoading, isError, error, refetch } = useClasse(id);
  const { data: elevesData, isLoading: loadingEleves } = useClasseEleves(id);
  const { data: statsData, isLoading: loadingStats } =
    useClasseStatistiques(id);
  const { data: affectationsData, isLoading: loadingAffectations } =
    useAffectationsByClasse(id);

  // ─── Mutations ───
  const softDeleteMutation = useSoftDeleteClasse();
  const hardDeleteMutation = useHardDeleteClasse();

  const classe = classeData?.data;

  // ─── Élèves ───
  const eleves = useMemo(() => {
    if (!elevesData) return [];
    const any = elevesData as any;
    if (Array.isArray(any?.data?.eleves)) return any.data.eleves;
    if (Array.isArray(any?.eleves)) return any.eleves;
    if (Array.isArray(any?.data)) return any.data;
    return [];
  }, [elevesData]);

  // ─── Élèves filtrés ───
  const filteredEleves = useMemo(() => {
    let list = eleves;
    if (filterSexe !== 'all') {
      list = list.filter((e: any) => e.sexe === filterSexe);
    }
    const q = searchEleve.trim().toLowerCase();
    if (q) {
      list = list.filter((e: any) => {
        const hay = `${e.prenom ?? ''} ${e.nom ?? ''} ${
          e.matricule ?? ''
        }`.toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }, [eleves, searchEleve, filterSexe]);

  // ─── Emploi du temps (à plat, groupé par jour) ───
  const emploiTemps = useMemo(() => {
    if (!classe) return [];
    const any = classe as any;
    const raw = any.emploisTemps ?? any.emploiTemps ?? [];
    if (!Array.isArray(raw)) return [];

    return JOURS_ORDER.map((jour) => ({
      jour,
      label: JOURS_LABEL[jour],
      cours: raw
        .filter((c: any) => c.jour === jour)
        .sort((a: any, b: any) =>
          (a.heureDebut ?? '').localeCompare(b.heureDebut ?? '')
        ),
    })).filter((d) => d.cours.length > 0);
  }, [classe]);

  // ─── Équipe pédagogique / Titulaire ───
  const affectations = useMemo(() => {
    if (!affectationsData) return [];
    const any = affectationsData as any;
    if (Array.isArray(any?.data)) return any.data;
    if (Array.isArray(any)) return any;
    return [];
  }, [affectationsData]);

  const titulaire = useMemo(
    () =>
      affectations.find(
        (a: any) => a.estPrincipal === true || a.matiereId === null
      ) ?? null,
    [affectations]
  );

  const autresEnseignants = useMemo(
    () =>
      affectations.filter(
        (a: any) => a.id !== titulaire?.id && a.matiereId !== null
      ),
    [affectations, titulaire]
  );

  // ─── Stats ───
  const stats = statsData?.data;
  const effectif =
    classe?._count?.inscriptions ?? eleves.length ?? 0;
  const capacite = classe?.capacite ?? 0;
  const placesRestantes =
    stats?.classe?.placesRestantes ??
    (capacite > 0 ? Math.max(capacite - effectif, 0) : null);
  const tauxOccupation =
    capacite > 0 ? Math.round((effectif / capacite) * 100) : 0;

  // ─── Handlers ───
  const handleSoftDelete = async () => {
    if (!classe) return;
    if (
      !confirm(
        `Archiver la classe "${classe.nom}" ?\n\nLes inscriptions actives doivent être retirées avant.`
      )
    )
      return;
    try {
      await softDeleteMutation.mutateAsync(classe.id);
      navigate('/dashboard/classes');
    } catch {
      /* toast géré */
    }
  };

  const handleHardDelete = async () => {
    if (!classe) return;
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nClasse : ${classe.nom}\nCode : ${classe.code}\n\nCette action est IRRÉVERSIBLE.\n\nContinuer ?`
    );
    if (!confirmed) return;

    const doubleCheck = prompt(
      `Pour confirmer, tapez le code : "${classe.code}"`
    );
    if (doubleCheck !== classe.code) {
      alert('Code incorrect. Suppression annulée.');
      return;
    }

    try {
      await hardDeleteMutation.mutateAsync(classe.id);
      navigate('/dashboard/classes');
    } catch {
      /* toast géré */
    }
  };

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="text-gray-500 mt-4">Chargement de la classe…</p>
        </div>
      </div>
    );
  }

  // ─── Erreur ───
  if (isError || !classe) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Classe introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue lors du chargement'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/dashboard/classes"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Retour à la liste
            </Link>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* ═══════════ BREADCRUMB ═══════════ */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/classes" className="hover:text-gray-900">
          Classes
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">
          {classe.nom}
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
              to="/dashboard/classes"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <BuildingOfficeIcon className="w-10 h-10" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {classe.nom}
                </h1>
                {classe.estArchive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-full">
                    <ArchiveBoxIcon className="w-3.5 h-3.5" />
                    Archivée
                  </span>
                ) : classe.estActive ? (
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
                {titulaire && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">
                    <StarIcon className="w-3.5 h-3.5" />
                    Titulaire : {titulaire.enseignant?.prenom}{' '}
                    {titulaire.enseignant?.nom}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                  {classe.code}
                </span>
                {classe.niveau && (
                  <span className="flex items-center gap-1">
                    <AcademicCapIcon className="w-4 h-4" />
                    {classe.niveau.nom}
                  </span>
                )}
                {classe.salle && (
                  <span className="flex items-center gap-1">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    Salle {classe.salle}
                  </span>
                )}
                {classe.anneeScolaire && (
                  <span className="flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    {classe.anneeScolaire.nom}
                    {classe.anneeScolaire.estActive && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
                        active
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Barre de capacité */}
              {capacite > 0 && (
                <div className="mt-3 max-w-md">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>
                      Effectif : {effectif} / {capacite}
                    </span>
                    <span
                      className={`font-semibold ${
                        tauxOccupation > 90
                          ? 'text-rose-600'
                          : tauxOccupation > 75
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {tauxOccupation}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        tauxOccupation > 90
                          ? 'bg-rose-500'
                          : tauxOccupation > 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(tauxOccupation, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            <Link
              to={`/dashboard/classes/${classe.id}/editer`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 border border-amber-200"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Modifier
            </Link>
            {!classe.estArchive && (
              <button
                onClick={handleSoftDelete}
                disabled={softDeleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 font-medium rounded-lg hover:bg-orange-100 border border-orange-200 disabled:opacity-50"
              >
                <ArchiveBoxIcon className="w-4 h-4" />
                Archiver
              </button>
            )}
            <button
              onClick={handleHardDelete}
              disabled={hardDeleteMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 border border-red-200 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══════════ KPI ═══════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Inscrits"
          value={effectif}
          icon={UsersIcon}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          hint={capacite > 0 ? `sur ${capacite}` : undefined}
        />
        <StatCard
          label="Places restantes"
          value={placesRestantes ?? '—'}
          icon={CheckCircleIcon}
          color="text-blue-600"
          bgColor="bg-blue-50"
          hint={
            tauxOccupation > 0
              ? `${tauxOccupation}% occupé`
              : undefined
          }
        />
        <StatCard
          label="Enseignants"
          value={affectations.length}
          icon={AcademicCapIcon}
          color="text-purple-600"
          bgColor="bg-purple-50"
          hint={titulaire ? 'Titulaire désigné' : 'Sans titulaire'}
        />
        <StatCard
          label="Moyenne générale"
          value={
            stats?.moyenneGenerale != null
              ? `${stats.moyenneGenerale.toFixed(2)}/20`
              : '—'
          }
          icon={ChartBarIcon}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* ═══════════ ONGLETS ═══════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {[
            { key: 'infos', label: 'Informations', icon: IdentificationIcon },
            {
              key: 'eleves',
              label: 'Élèves',
              icon: UsersIcon,
              badge: effectif,
            },
            {
              key: 'emploiTemps',
              label: 'Emploi du temps',
              icon: ClockIcon,
              badge: emploiTemps.reduce(
                (s, d) => s + d.cours.length,
                0
              ),
            },
            {
              key: 'equipe',
              label: 'Équipe pédagogique',
              icon: UserGroupIcon,
              badge: affectations.length,
            },
            {
              key: 'statistiques',
              label: 'Statistiques',
              icon: ChartBarIcon,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
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
          {/* ═══════════════════════════════════════
              ONGLET : INFORMATIONS
              ═══════════════════════════════════════ */}
          {activeTab === 'infos' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <IdentificationIcon className="w-4 h-4 text-emerald-500" />
                  Identité
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Nom"
                    value={classe.nom}
                    icon={BuildingOfficeIcon}
                  />
                  <InfoRow
                    label="Code unique"
                    value={
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                        {classe.code}
                      </span>
                    }
                    icon={IdentificationIcon}
                  />
                  <InfoRow
                    label="Niveau"
                    value={classe.niveau?.nom ?? '—'}
                    icon={AcademicCapIcon}
                  />
                  <InfoRow
                    label="Salle"
                    value={classe.salle ?? '—'}
                    icon={BuildingOfficeIcon}
                  />
                  <InfoRow
                    label="Capacité"
                    value={classe.capacite ?? '—'}
                    icon={UserGroupIcon}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4 text-emerald-500" />
                  Année scolaire
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Année"
                    value={
                      classe.anneeScolaire ? (
                        <div className="flex items-center gap-2">
                          {classe.anneeScolaire.nom}
                          {classe.anneeScolaire.estActive && (
                            <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                              active
                            </span>
                          )}
                        </div>
                      ) : (
                        '—'
                      )
                    }
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Inscriptions"
                    value={effectif}
                    icon={UsersIcon}
                  />
                  <InfoRow
                    label="Emplois du temps"
                    value={classe._count?.emploisTemps ?? emploiTemps.reduce(
                      (s, d) => s + d.cours.length,
                      0
                    )}
                    icon={ClockIcon}
                  />
                  <InfoRow
                    label="Affectations"
                    value={classe._count?.affectations ?? affectations.length}
                    icon={AcademicCapIcon}
                  />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <StarIcon className="w-4 h-4 text-amber-500" />
                  Titulaire de classe
                </h3>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  {titulaire ? (
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shrink-0">
                        {titulaire.enseignant?.prenom?.[0]}
                        {titulaire.enseignant?.nom?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {titulaire.enseignant?.prenom}{' '}
                          {titulaire.enseignant?.nom}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {titulaire.enseignant?.matricule}
                        </p>
                      </div>
                      <Link
                        to={`/dashboard/enseignants/${titulaire.enseignantId}`}
                        className="p-2 text-amber-600 hover:bg-white rounded-lg"
                        title="Voir la fiche"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-800 text-center">
                      Aucun titulaire désigné pour cette classe
                    </p>
                  )}
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-emerald-500" />
                  Métadonnées
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Créée le"
                    value={formatDateTime(classe.createdAt)}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Modifiée le"
                    value={formatDateTime(classe.updatedAt)}
                    icon={ClockIcon}
                  />
                  <InfoRow
                    label="ID"
                    value={
                      <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                        {classe.id}
                      </span>
                    }
                    icon={IdentificationIcon}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET : ÉLÈVES
              ═══════════════════════════════════════ */}
          {activeTab === 'eleves' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Recherche + filtre */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un élève (nom, matricule)…"
                    value={searchEleve}
                    onChange={(e) => setSearchEleve(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  {searchEleve && (
                    <button
                      onClick={() => setSearchEleve('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <select
                  value={filterSexe}
                  onChange={(e) =>
                    setFilterSexe(e.target.value as 'all' | 'M' | 'F')
                  }
                  className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="all">Tous les sexes</option>
                  <option value="M">Garçons</option>
                  <option value="F">Filles</option>
                </select>

                <Link
                  to={`/dashboard/inscriptions/nouvelle?classeId=${classe.id}&anneeScolaireId=${classe.anneeScolaireId}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 whitespace-nowrap"
                >
                  <PlusIcon className="w-4 h-4" />
                  Inscrire
                </Link>
              </div>

              {/* Info */}
              {!loadingEleves && eleves.length > 0 && (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {filteredEleves.length} élève(s) affiché(s)
                    {filteredEleves.length < eleves.length &&
                      ` sur ${eleves.length}`}
                  </span>
                  <span>
                    Effectif : {effectif}
                    {capacite > 0 && ` / ${capacite}`}
                  </span>
                </div>
              )}

              {/* Liste */}
              {loadingEleves ? (
                <div className="text-center py-12">
                  <ArrowPathIcon className="w-8 h-8 text-emerald-600 mx-auto animate-spin" />
                  <p className="text-sm text-gray-500 mt-2">
                    Chargement des élèves…
                  </p>
                </div>
              ) : eleves.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucun élève inscrit
                  </h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    Les élèves inscrits dans cette classe apparaîtront ici.
                  </p>
                  <Link
                    to={`/dashboard/inscriptions/nouvelle?classeId=${classe.id}&anneeScolaireId=${classe.anneeScolaireId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Inscrire un élève
                  </Link>
                </div>
              ) : filteredEleves.length === 0 ? (
                <div className="text-center py-12">
                  <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Aucun élève ne correspond à votre recherche.
                  </p>
                  <button
                    onClick={() => {
                      setSearchEleve('');
                      setFilterSexe('all');
                    }}
                    className="mt-3 text-sm text-emerald-600 hover:underline font-medium"
                  >
                    Réinitialiser
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Élève
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Matricule
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Naissance
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Sexe
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Statut
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredEleves.map((eleve: any) => {
                        const age = eleve.dateNaissance
                          ? calculerAge(eleve.dateNaissance)
                          : null;
                        return (
                          <tr
                            key={eleve.id}
                            className="hover:bg-gray-50/50"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3 min-w-0">
                                {eleve.photo ? (
                                  <img
                                    src={eleve.photo}
                                    alt={eleve.nom}
                                    className="w-9 h-9 rounded-full object-cover shrink-0"
                                  />
                                ) : (
                                  <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                                      eleve.sexe === 'F'
                                        ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                                        : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                                    }`}
                                  >
                                    {eleve.prenom?.[0]}
                                    {eleve.nom?.[0]}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <Link
                                    to={`/dashboard/eleves/${eleve.id}`}
                                    className="text-sm font-medium text-gray-900 hover:text-emerald-600 truncate block"
                                  >
                                    {eleve.prenom} {eleve.nom}
                                  </Link>
                                  {age != null && (
                                    <p className="text-[10px] text-gray-500">
                                      {age} ans
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-mono text-gray-700">
                                {eleve.matricule}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {formatDateShort(eleve.dateNaissance)}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              {eleve.sexe === 'M' ? '♂' : '♀'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                                  eleve.statut === 'ACTIF'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {eleve.statut}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                to={`/dashboard/eleves/${eleve.id}`}
                                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline font-medium"
                              >
                                Fiche
                                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET : EMPLOI DU TEMPS
              ═══════════════════════════════════════ */}
          {activeTab === 'emploiTemps' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-emerald-500" />
                  Emploi du temps de la classe
                </h3>
                <Link
                  to={`/dashboard/emploi-temps?classeId=${classe.id}`}
                  className="text-xs text-emerald-600 hover:underline font-medium"
                >
                  Gérer l'emploi du temps →
                </Link>
              </div>

              {emploiTemps.length === 0 ? (
                <div className="text-center py-12">
                  <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucun créneau
                  </h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    Aucun emploi du temps n'est défini pour cette classe.
                  </p>
                  <Link
                    to={`/dashboard/emploi-temps/nouveau?classeId=${classe.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Créer un emploi du temps
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {emploiTemps.map((jour) => (
                    <div key={jour.jour}>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {jour.label}
                        <span className="text-[10px] font-normal text-gray-400">
                          ({jour.cours.length} cours)
                        </span>
                      </p>
                      <div className="space-y-2">
                        {jour.cours.map((c: any) => (
                          <div
                            key={c.id}
                            className="bg-gray-50 rounded-lg p-3 flex items-center gap-3"
                          >
                            <div className="w-16 text-center font-mono text-xs shrink-0 text-gray-700">
                              <p className="font-bold">{c.heureDebut}</p>
                              <p className="text-[10px] text-gray-400">→</p>
                              <p>{c.heureFin}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {c.matiere?.nom ?? 'Cours générique'}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {c.enseignant?.prenom}{' '}
                                {c.enseignant?.nom}
                                {c.salle && ` · Salle ${c.salle}`}
                              </p>
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

          {/* ═══════════════════════════════════════
              ONGLET : ÉQUIPE PÉDAGOGIQUE
              ═══════════════════════════════════════ */}
          {activeTab === 'equipe' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <UserGroupIcon className="w-4 h-4 text-emerald-500" />
                  Équipe pédagogique ({affectations.length})
                </h3>
                <Link
                  to={`/dashboard/affectations?classeId=${classe.id}`}
                  className="text-xs text-emerald-600 hover:underline font-medium"
                >
                  Gérer les affectations →
                </Link>
              </div>

              {loadingAffectations ? (
                <div className="text-center py-8">
                  <ArrowPathIcon className="w-8 h-8 text-emerald-600 mx-auto animate-spin" />
                  <p className="text-sm text-gray-500 mt-2">
                    Chargement…
                  </p>
                </div>
              ) : affectations.length === 0 ? (
                <div className="text-center py-12">
                  <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucun enseignant affecté
                  </h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    Assignez des enseignants à cette classe pour qu'ils
                    apparaissent ici.
                  </p>
                  <Link
                    to={`/dashboard/affectations/nouveau?classeId=${classe.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Affecter un enseignant
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {affectations.map((aff: any) => (
                    <div
                      key={aff.id}
                      className={`rounded-xl border p-4 flex items-start gap-3 ${
                        aff.estPrincipal
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${
                          aff.estPrincipal
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        }`}
                      >
                        {aff.enseignant?.prenom?.[0]}
                        {aff.enseignant?.nom?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Link
                            to={`/dashboard/enseignants/${aff.enseignantId}`}
                            className="text-sm font-semibold text-gray-900 hover:text-emerald-600 truncate"
                          >
                            {aff.enseignant?.prenom} {aff.enseignant?.nom}
                          </Link>
                          {aff.estPrincipal && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                              <StarIcon className="w-2.5 h-2.5" />
                              PRINCIPAL
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {aff.matiere?.nom ?? 'Titulaire de classe'}
                        </p>
                        {aff.heuresHebdo != null && aff.heuresHebdo > 0 && (
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {aff.heuresHebdo}h/semaine
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET : STATISTIQUES
              ═══════════════════════════════════════ */}
          {activeTab === 'statistiques' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {loadingStats ? (
                <div className="text-center py-12">
                  <ArrowPathIcon className="w-8 h-8 text-emerald-600 mx-auto animate-spin" />
                  <p className="text-sm text-gray-500 mt-2">
                    Chargement des statistiques…
                  </p>
                </div>
              ) : !stats ? (
                <div className="text-center py-12">
                  <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Statistiques indisponibles
                  </h3>
                  <p className="text-gray-500">
                    Aucune donnée statistique pour cette classe.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-emerald-500" />
                      Effectif
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">Inscrits</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.effectif.inscrits}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">Actifs</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {stats.effectif.actifs}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">Capacité</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.classe.capacite ?? '—'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">
                          Places restantes
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {stats.classe.placesRestantes ?? '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                      Répartition par sexe
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      {Object.keys(stats.effectif.parSexe).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(stats.effectif.parSexe).map(
                            ([sexe, nb]: any) => {
                              const total = stats.effectif.actifs || 1;
                              const pct = Math.round((nb / total) * 100);
                              return (
                                <div key={sexe}>
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-900">
                                      {sexe === 'M'
                                        ? 'Garçons'
                                        : sexe === 'F'
                                        ? 'Filles'
                                        : sexe}
                                    </span>
                                    <span className="text-gray-600">
                                      {nb} ({pct}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-white rounded-full h-2">
                                    <div
                                      className={`h-full rounded-full ${
                                        sexe === 'M'
                                          ? 'bg-blue-500'
                                          : 'bg-pink-500'
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Aucune donnée
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                      Performance
                    </h3>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                      <p className="text-xs text-gray-600 uppercase tracking-wider">
                        Moyenne générale de la classe
                      </p>
                      <p
                        className={`text-4xl font-bold mt-1 ${
                          stats.moyenneGenerale === null
                            ? 'text-gray-400'
                            : stats.moyenneGenerale >= 14
                            ? 'text-emerald-600'
                            : stats.moyenneGenerale >= 10
                            ? 'text-blue-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {stats.moyenneGenerale !== null
                          ? `${stats.moyenneGenerale.toFixed(2)}/20`
                          : '—'}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Basée sur les bulletins validés de la classe
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClasseDetailPage;