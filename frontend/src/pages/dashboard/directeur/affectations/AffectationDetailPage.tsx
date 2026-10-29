// frontend2/src/pages/dashboard/directeur/affectations/AffectationDetailPage.tsx

import React, { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  UserCircleIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClockIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useAffectation,
  useSoftDeleteAffectation,
  useHardDeleteAffectation,
} from '../../../../hooks/useAffectations';
import type { Affectation } from '../../../../types/affectation.types';

// ============================================
// HELPERS
// ============================================

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

// ============================================
// SOUS-COMPOSANTS
// ============================================

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

// ============================================
// PAGE
// ============================================

type TabKey = 'overview' | 'enseignant' | 'classe' | 'matiere' | 'meta';

const AffectationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: affectation, isLoading, isError, error, refetch } =
    useAffectation(id);

  const softDeleteMutation = useSoftDeleteAffectation();
  const hardDeleteMutation = useHardDeleteAffectation();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [confirmHardDelete, setConfirmHardDelete] = useState(false);

  // ─────────── Loading ───────────
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

  // ─────────── Erreur ───────────
  if (isError || !affectation) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Affectation introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/dashboard/affectations"
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

  // ─────────── Handlers ───────────
  const handleSoftDelete = async () => {
    if (
      !confirm(
        `Désactiver cette affectation ?\n\n${affectation.enseignant?.prenom} ${affectation.enseignant?.nom} — ${affectation.classe?.nom} — ${affectation.matiere?.nom}\n\nL'affectation restera en base mais ne sera plus active.`
      )
    )
      return;
    try {
      await softDeleteMutation.mutateAsync(affectation.id);
      refetch();
    } catch {
      /* toasté */
    }
  };

  const handleHardDelete = async () => {
    try {
      await hardDeleteMutation.mutateAsync(affectation.id);
      navigate('/dashboard/affectations');
    } catch {
      /* toasté */
    }
  };

  // ─────────── Tabs config ───────────
  const tabs = [
    { key: 'overview', label: "Vue d'ensemble", icon: ChartBarIcon },
    { key: 'enseignant', label: 'Enseignant', icon: UserCircleIcon },
    { key: 'classe', label: 'Classe', icon: AcademicCapIcon },
    { key: 'matiere', label: 'Matière', icon: BookOpenIcon },
    { key: 'meta', label: 'Métadonnées', icon: IdentificationIcon },
  ];

  return (
    <div className="space-y-6 w-full max-w-[1400px] mx-auto pb-12">
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
        <span className="text-gray-900 font-medium truncate">
          {affectation.enseignant?.prenom} {affectation.enseignant?.nom} →{' '}
          {affectation.classe?.nom}
        </span>
      </nav>

      {/* ─────────── EN-TÊTE ─────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Link
              to="/dashboard/affectations"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            {/* Avatar enseignant — dégradé vert */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
              {affectation.enseignant?.prenom?.[0] ?? '?'}
              {affectation.enseignant?.nom?.[0] ?? '?'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {affectation.enseignant?.prenom}{' '}
                  {affectation.enseignant?.nom}
                </h1>
                {affectation.estActive ? (
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
                {affectation.estPrincipal && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-amber-50 text-amber-700 rounded-full">
                    ⭐ Principal
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                {affectation.enseignant?.matricule && (
                  <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                    {affectation.enseignant.matricule}
                  </span>
                )}
                {affectation.enseignant?.specialite && (
                  <span className="flex items-center gap-1">
                    <BookOpenIcon className="w-4 h-4" />
                    {affectation.enseignant.specialite}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap text-sm">
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                  <AcademicCapIcon className="w-3.5 h-3.5" />
                  {affectation.classe?.nom}
                </span>
                <span className="text-gray-400">→</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                  <BookOpenIcon className="w-3.5 h-3.5" />
                  {affectation.matiere?.nom}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-teal-50 text-teal-700 rounded-full">
                  <CalendarDaysIcon className="w-3.5 h-3.5" />
                  {affectation.anneeScolaire?.nom}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            <button
              onClick={() => refetch()}
              className="p-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              title="Rafraîchir"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            <Link
              to={`/dashboard/affectations/${affectation.id}/editer`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 border border-amber-200"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Modifier
            </Link>
            {affectation.estActive && (
              <button
                onClick={handleSoftDelete}
                disabled={softDeleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 font-medium rounded-lg hover:bg-orange-100 border border-orange-200 disabled:opacity-50"
              >
                <XCircleIcon className="w-4 h-4" />
                Désactiver
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

      {/* ─────────── STATS ─────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Heures / semaine"
          value={
            affectation.heuresHebdo != null
              ? `${affectation.heuresHebdo}h`
              : '—'
          }
          icon={ClockIcon}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Statut"
          value={affectation.estActive ? 'Active' : 'Inactive'}
          icon={affectation.estActive ? CheckCircleIcon : XCircleIcon}
          color={
            affectation.estActive ? 'text-emerald-600' : 'text-gray-600'
          }
          bgColor={
            affectation.estActive ? 'bg-emerald-50' : 'bg-gray-100'
          }
        />
        <StatCard
          label="Principal"
          value={affectation.estPrincipal ? 'Oui' : 'Non'}
          icon={UserCircleIcon}
          color={
            affectation.estPrincipal ? 'text-amber-600' : 'text-gray-400'
          }
          bgColor={affectation.estPrincipal ? 'bg-amber-50' : 'bg-gray-100'}
        />
        <StatCard
          label="Année scolaire"
          value={affectation.anneeScolaire?.nom ?? '—'}
          icon={CalendarDaysIcon}
          color="text-teal-600"
          bgColor="bg-teal-50"
          hint={affectation.anneeScolaire?.estActive ? 'Active' : undefined}
        />
      </div>

      {/* ─────────── ONGLETS ─────────── */}
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
                  to={`/dashboard/enseignants/${affectation.enseignantId}`}
                  className="flex flex-col items-center gap-1 p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <UserCircleIcon className="w-5 h-5 text-emerald-600" />
                  <p className="text-xs font-medium text-emerald-700">
                    Fiche enseignant
                  </p>
                </Link>
                <Link
                  to={`/dashboard/classes/${affectation.classeId}`}
                  className="flex flex-col items-center gap-1 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <AcademicCapIcon className="w-5 h-5 text-green-600" />
                  <p className="text-xs font-medium text-green-700">
                    Fiche classe
                  </p>
                </Link>
                <Link
                  to={`/dashboard/matieres/${affectation.matiereId}`}
                  className="flex flex-col items-center gap-1 p-3 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors"
                >
                  <BookOpenIcon className="w-5 h-5 text-teal-600" />
                  <p className="text-xs font-medium text-teal-700">
                    Fiche matière
                  </p>
                </Link>
                <Link
                  to={`/dashboard/notes?affectationId=${affectation.id}`}
                  className="flex flex-col items-center gap-1 p-3 bg-lime-50 rounded-xl hover:bg-lime-100 transition-colors"
                >
                  <DocumentTextIcon className="w-5 h-5 text-lime-600" />
                  <p className="text-xs font-medium text-lime-700">Notes</p>
                </Link>
              </div>

              {/* Résumé rapide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <UserCircleIcon className="w-4 h-4 text-emerald-600" />
                    Enseignant
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <InfoRow
                      label="Nom complet"
                      value={`${affectation.enseignant?.prenom ?? ''} ${
                        affectation.enseignant?.nom ?? ''
                      }`}
                      icon={UserCircleIcon}
                    />
                    <InfoRow
                      label="Matricule"
                      value={
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                          {affectation.enseignant?.matricule ?? '—'}
                        </span>
                      }
                      icon={IdentificationIcon}
                    />
                    <InfoRow
                      label="Spécialité"
                      value={affectation.enseignant?.specialite ?? '—'}
                      icon={BookOpenIcon}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AcademicCapIcon className="w-4 h-4 text-emerald-600" />
                    Classe & Matière
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <InfoRow
                      label="Classe"
                      value={
                        <span>
                          {affectation.classe?.nom}{' '}
                          {affectation.classe?.code && (
                            <span className="font-mono text-xs text-gray-500">
                              ({affectation.classe.code})
                            </span>
                          )}
                        </span>
                      }
                      icon={AcademicCapIcon}
                    />
                    <InfoRow
                      label="Matière"
                      value={
                        <span>
                          {affectation.matiere?.nom}{' '}
                          {affectation.matiere?.coefficient && (
                            <span className="text-xs text-gray-500">
                              (Coef. {affectation.matiere.coefficient})
                            </span>
                          )}
                        </span>
                      }
                      icon={BookOpenIcon}
                    />
                    <InfoRow
                      label="Année scolaire"
                      value={
                        <div>
                          {affectation.anneeScolaire?.nom}
                          {affectation.anneeScolaire?.estActive && (
                            <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      }
                      icon={CalendarDaysIcon}
                    />
                  </div>
                </div>
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
                  to={`/dashboard/enseignants/${affectation.enseignantId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  Voir la fiche
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
              </div>

              {/* Carte enseignant */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                    {affectation.enseignant?.prenom?.[0] ?? '?'}
                    {affectation.enseignant?.nom?.[0] ?? '?'}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {affectation.enseignant?.prenom}{' '}
                      {affectation.enseignant?.nom}
                    </p>
                    <p className="text-sm text-gray-500 font-mono">
                      {affectation.enseignant?.matricule}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <InfoRow
                  label="Nom complet"
                  value={`${affectation.enseignant?.prenom ?? ''} ${
                    affectation.enseignant?.nom ?? ''
                  }`}
                  icon={UserCircleIcon}
                />
                <InfoRow
                  label="Matricule"
                  value={
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                      {affectation.enseignant?.matricule ?? '—'}
                    </span>
                  }
                  icon={IdentificationIcon}
                />
                <InfoRow
                  label="Spécialité"
                  value={affectation.enseignant?.specialite ?? '—'}
                  icon={BookOpenIcon}
                />
                <InfoRow
                  label="Email"
                  value={affectation.enseignant?.email ?? '—'}
                  icon={IdentificationIcon}
                />
                <InfoRow
                  label="Téléphone"
                  value={affectation.enseignant?.telephone ?? '—'}
                  icon={IdentificationIcon}
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
                  to={`/dashboard/classes/${affectation.classeId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  Voir la fiche
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
                    <AcademicCapIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {affectation.classe?.nom}
                    </p>
                    <p className="text-sm text-emerald-700 font-mono">
                      {affectation.classe?.code}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <InfoRow
                  label="Nom"
                  value={affectation.classe?.nom ?? '—'}
                  icon={AcademicCapIcon}
                />
                <InfoRow
                  label="Code"
                  value={
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                      {affectation.classe?.code ?? '—'}
                    </span>
                  }
                  icon={IdentificationIcon}
                />
                <InfoRow
                  label="Salle"
                  value={affectation.classe?.salle ?? '—'}
                  icon={BuildingOfficeIcon}
                />
                <InfoRow
                  label="Capacité"
                  value={
                    affectation.classe?.capacite != null
                      ? `${affectation.classe.capacite} élèves`
                      : '—'
                  }
                  icon={UserGroupIcon}
                />
              </div>
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
                  to={`/dashboard/matieres/${affectation.matiereId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  Voir la fiche
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0">
                    <BookOpenIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {affectation.matiere?.nom}
                    </p>
                    <p className="text-sm text-teal-700 font-mono">
                      {affectation.matiere?.code}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <InfoRow
                  label="Nom"
                  value={affectation.matiere?.nom ?? '—'}
                  icon={BookOpenIcon}
                />
                <InfoRow
                  label="Code"
                  value={
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                      {affectation.matiere?.code ?? '—'}
                    </span>
                  }
                  icon={IdentificationIcon}
                />
                <InfoRow
                  label="Coefficient"
                  value={affectation.matiere?.coefficient ?? '—'}
                  icon={BookOpenIcon}
                />
                <InfoRow
                  label="Durée du cours"
                  value={
                    affectation.matiere?.dureeCours != null
                      ? `${affectation.matiere.dureeCours} minutes`
                      : '—'
                  }
                  icon={ClockIcon}
                />
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
                  label="ID affectation"
                  value={
                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200 break-all">
                      {affectation.id}
                    </span>
                  }
                  icon={IdentificationIcon}
                />
                <InfoRow
                  label="Enseignant (ID)"
                  value={
                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200 break-all">
                      {affectation.enseignantId}
                    </span>
                  }
                  icon={UserCircleIcon}
                />
                <InfoRow
                  label="Classe (ID)"
                  value={
                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200 break-all">
                      {affectation.classeId}
                    </span>
                  }
                  icon={AcademicCapIcon}
                />
                <InfoRow
                  label="Matière (ID)"
                  value={
                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200 break-all">
                      {affectation.matiereId ?? '—'}
                    </span>
                  }
                  icon={BookOpenIcon}
                />
                <InfoRow
                  label="Année (ID)"
                  value={
                    <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200 break-all">
                      {affectation.anneeScolaireId}
                    </span>
                  }
                  icon={CalendarDaysIcon}
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <InfoRow
                  label="Créée le"
                  value={formatDateTime(affectation.createdAt)}
                  icon={CalendarDaysIcon}
                />
                <InfoRow
                  label="Modifiée le"
                  value={formatDateTime(affectation.updatedAt)}
                  icon={ClockIcon}
                />
                <InfoRow
                  label="Valable du"
                  value={formatDate(affectation.valableDu)}
                  icon={CalendarDaysIcon}
                />
                <InfoRow
                  label="Valable au"
                  value={formatDate(affectation.valableAu)}
                  icon={CalendarDaysIcon}
                />
              </div>

              {/* Info technique */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <InformationCircleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">
                      À propos de la suppression
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Si des notes ont été saisies pour cette affectation, la
                      suppression échouera. Utilisez <strong>Désactiver</strong>{' '}
                      à la place.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ─────────── ACTIONS BAS DE PAGE ─────────── */}
      <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
        <Link
          to="/dashboard/affectations"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour à la liste
        </Link>
        <Link
          to={`/dashboard/affectations/${affectation.id}/editer`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium border border-amber-200"
        >
          <PencilSquareIcon className="w-4 h-4" />
          Modifier cette affectation
        </Link>
      </div>

      {/* ─────────── DIALOG HARD DELETE ─────────── */}
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
              L'affectation de{' '}
              <strong>
                {affectation.enseignant?.prenom} {affectation.enseignant?.nom}
              </strong>{' '}
              pour <strong>{affectation.classe?.nom}</strong> —{' '}
              <strong>{affectation.matiere?.nom}</strong> sera supprimée
              définitivement.
            </p>

            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                Si des notes ont été saisies pour cette affectation, la
                suppression échouera (erreur 409). Dans ce cas, utilisez
                "Désactiver" à la place.
              </p>
            </div>

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

export default AffectationDetailPage;