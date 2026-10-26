// frontend2/src/pages/dashboard/directeur/periodes/PeriodeDetailPage.tsx

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  UserCircleIcon,
  IdentificationIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import {
  usePeriode,
  useHardDeletePeriode,
  useUpdatePeriode,
} from '../../../../hooks/usePeriodes';
import type { TypePeriode } from '../../../../types/periode.types';

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

const TYPE_COLORS: Record<TypePeriode, { bg: string; text: string; label: string }> = {
  TRIMESTRE: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Trimestre' },
  SEMESTRE: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Semestre' },
  BULLETIN: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Bulletin' },
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
      <div className="p-2 bg-gray-50 rounded-lg shrink-0">
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
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
}) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

// ============================================
// PAGE PRINCIPALE
// ============================================

type TabKey = 'infos' | 'notes' | 'bulletins';

const PeriodeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('infos');

  const { data: periodeData, isLoading, isError, error, refetch } =
    usePeriode(id);

  const hardDeleteMutation = useHardDeletePeriode();
  const updateMutation = useUpdatePeriode();

  const periode = periodeData?.data;

  // ─────────────────────────────────────────
  const handleHardDelete = async () => {
    if (!periode) return;
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nPériode : ${periode.nom}\nType : ${periode.type}\n\nCette action est IRRÉVERSIBLE.\n\nContinuer ?`
    );
    if (!confirmed) return;

    try {
      await hardDeleteMutation.mutateAsync(periode.id);
      navigate('/dashboard/periodes');
    } catch {
      /* toast géré */
    }
  };

  const handleToggleCloture = async () => {
    if (!periode) return;
    const action = periode.estCloturee ? 'rouvrir' : 'clôturer';
    if (!confirm(`Voulez-vous ${action} la période "${periode.nom}" ?`)) return;

    try {
      await updateMutation.mutateAsync({
        id: periode.id,
        payload: { estCloturee: !periode.estCloturee },
      });
    } catch {
      /* toast géré */
    }
  };

  // ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-500 mt-4">Chargement…</p>
        </div>
      </div>
    );
  }

  if (isError || !periode) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Période introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/dashboard/periodes"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Retour
            </Link>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const typeStyle = TYPE_COLORS[periode.type];
  const nbNotes = periode._count?.notes ?? 0;
  const nbBulletins = periode._count?.bulletins ?? 0;
  const nbAppreciations = periode._count?.appreciations ?? 0;

  // Calcul durée
  const dureeJours = Math.round(
    (new Date(periode.dateFin).getTime() -
      new Date(periode.dateDebut).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/periodes" className="hover:text-gray-900">
          Périodes
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">
          {periode.nom}
        </span>
      </nav>

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Link
              to="/dashboard/periodes"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shrink-0">
              {periode.ordre}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {periode.nom}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${typeStyle.bg} ${typeStyle.text}`}
                >
                  {typeStyle.label}
                </span>
                {periode.estCloturee ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    <LockClosedIcon className="w-3.5 h-3.5" />
                    Clôturée
                  </span>
                ) : periode.estActive ? (
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

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <CalendarDaysIcon className="w-4 h-4" />
                  {formatDate(periode.dateDebut)} →{' '}
                  {formatDate(periode.dateFin)}
                </span>
                {periode.anneeScolaire && (
                  <span className="flex items-center gap-1">
                    <AcademicCapIcon className="w-4 h-4" />
                    {periode.anneeScolaire.nom}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {dureeJours} jours
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            {!periode.estCloturee && (
              <Link
                to={`/dashboard/periodes/${periode.id}/editer`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 border border-amber-200"
              >
                <PencilSquareIcon className="w-4 h-4" />
                Modifier
              </Link>
            )}
            <button
              onClick={handleToggleCloture}
              disabled={updateMutation.isPending}
              className={`inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                periode.estCloturee
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200'
              }`}
            >
              {periode.estCloturee ? (
                <>
                  <LockClosedIcon className="w-4 h-4" />
                  Rouvrir
                </>
              ) : (
                <>
                  <LockClosedIcon className="w-4 h-4" />
                  Clôturer
                </>
              )}
            </button>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Notes"
          value={nbNotes}
          icon={DocumentTextIcon}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Bulletins"
          value={nbBulletins}
          icon={DocumentTextIcon}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Appréciations"
          value={nbAppreciations}
          icon={ChartBarIcon}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          label="Durée"
          value={`${dureeJours}j`}
          icon={ClockIcon}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {[
            { key: 'infos', label: 'Informations', icon: IdentificationIcon },
            {
              key: 'notes',
              label: 'Notes',
              icon: DocumentTextIcon,
              badge: nbNotes,
            },
            {
              key: 'bulletins',
              label: 'Bulletins',
              icon: ChartBarIcon,
              badge: nbBulletins,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50'
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
          {/* ═══ Onglet Infos ═══ */}
          {activeTab === 'infos' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <IdentificationIcon className="w-4 h-4 text-blue-500" />
                  Identification
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Nom"
                    value={periode.nom}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Type"
                    value={
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${typeStyle.bg} ${typeStyle.text}`}
                      >
                        {typeStyle.label}
                      </span>
                    }
                    icon={DocumentTextIcon}
                  />
                  <InfoRow
                    label="Ordre"
                    value={periode.ordre}
                    icon={IdentificationIcon}
                  />
                  <InfoRow
                    label="Année scolaire"
                    value={
                      periode.anneeScolaire ? (
                        <div className="flex items-center gap-2">
                          {periode.anneeScolaire.nom}
                          {periode.anneeScolaire.estActive && (
                            <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                              active
                            </span>
                          )}
                        </div>
                      ) : (
                        '—'
                      )
                    }
                    icon={AcademicCapIcon}
                  />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4 text-blue-500" />
                  Période
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Date de début"
                    value={formatDate(periode.dateDebut)}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Date de fin"
                    value={formatDate(periode.dateFin)}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Durée"
                    value={`${dureeJours} jours`}
                    icon={ClockIcon}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                  Statut
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Active"
                    value={
                      periode.estActive ? (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircleIcon className="w-4 h-4" />
                          Oui
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-600">
                          <XCircleIcon className="w-4 h-4" />
                          Non
                        </span>
                      )
                    }
                    icon={CheckCircleIcon}
                  />
                  <InfoRow
                    label="Clôturée"
                    value={
                      periode.estCloturee ? (
                        <span className="flex items-center gap-1 text-gray-700">
                          <LockClosedIcon className="w-4 h-4" />
                          Oui
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <LockClosedIcon className="w-4 h-4" />
                          Non (ouverte)
                        </span>
                      )
                    }
                    icon={LockClosedIcon}
                  />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-blue-500" />
                  Métadonnées
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Créée le"
                    value={formatDateTime(periode.createdAt)}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Modifiée le"
                    value={formatDateTime(periode.updatedAt)}
                    icon={ClockIcon}
                  />
                  <InfoRow
                    label="ID"
                    value={
                      <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                        {periode.id}
                      </span>
                    }
                    icon={IdentificationIcon}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ Onglet Notes ═══ */}
          {activeTab === 'notes' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {nbNotes > 0 ? (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        {nbNotes} note(s) saisie(s)
                      </p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Notes rattachées à cette période.
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/dashboard/notes?periodeId=${periode.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    Voir les notes
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucune note
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Aucune note n'a encore été saisie pour cette période.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ Onglet Bulletins ═══ */}
          {activeTab === 'bulletins' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {nbBulletins > 0 ? (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                    <ChartBarIcon className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-900">
                        {nbBulletins} bulletin(s) généré(s)
                      </p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Bulletins rattachés à cette période.
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/dashboard/bulletins?periodeId=${periode.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
                  >
                    <ChartBarIcon className="w-4 h-4" />
                    Voir les bulletins
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucun bulletin
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Aucun bulletin n'a encore été généré pour cette période.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Actions bas de page */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <Link
          to="/dashboard/periodes"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour à la liste
        </Link>
        {!periode.estCloturee && (
          <Link
            to={`/dashboard/periodes/${periode.id}/editer`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium border border-amber-200"
          >
            <PencilSquareIcon className="w-4 h-4" />
            Modifier cette période
          </Link>
        )}
      </div>
    </div>
  );
};

export default PeriodeDetailPage;