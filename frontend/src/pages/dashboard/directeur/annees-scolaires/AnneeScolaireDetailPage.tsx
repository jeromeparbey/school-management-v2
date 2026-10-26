// frontend2/src/pages/dashboard/directeur/annees-scolaires/AnneeScolaireDetailPage.tsx

import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useAnneeScolaire,
  useHardDeleteAnneeScolaire,
} from '../../../../hooks/useAnneesScolaires';

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
// InfoRow
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

// ============================================
// PAGE
// ============================================

const AnneeScolaireDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: anneeData, isLoading, isError, error, refetch } =
    useAnneeScolaire(id);
  const hardDeleteMutation = useHardDeleteAnneeScolaire();

  const annee = anneeData?.data;

  const handleHardDelete = async () => {
    if (!annee) return;
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nAnnée : ${annee.nom}\n\nCette action est IRRÉVERSIBLE.\n\nContinuer ?`
    );
    if (!confirmed) return;

    try {
      await hardDeleteMutation.mutateAsync(annee.id);
      navigate('/dashboard/annees-scolaires');
    } catch {
      /* toast géré */
    }
  };

  // ─────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────
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

  // ─────────────────────────────────────────
  // Erreur
  // ─────────────────────────────────────────
  if (isError || !annee) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Année introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/dashboard/annees-scolaires"
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

  const nbClasses = annee._count?.classes ?? 0;
  const nbPeriodes = annee._count?.periodes ?? 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link
          to="/dashboard/annees-scolaires"
          className="hover:text-gray-900"
        >
          Années scolaires
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">{annee.nom}</span>
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
              to="/dashboard/annees-scolaires"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shrink-0">
              <CalendarDaysIcon className="w-8 h-8" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {annee.nom}
                </h1>
                {annee.estActive && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Active
                  </span>
                )}
                {annee.estArchive && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-full">
                    <XCircleIcon className="w-3.5 h-3.5" />
                    Archivée
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formatDate(annee.dateDebut)} → {formatDate(annee.dateFin)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            <Link
              to={`/dashboard/annees-scolaires/${annee.id}/editer`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 border border-amber-200"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Modifier
            </Link>
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
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Classes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{nbClasses}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Périodes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{nbPeriodes}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Statut</p>
          <p className="text-sm font-bold mt-1">
            {annee.estActive ? (
              <span className="text-emerald-600">Active</span>
            ) : annee.estArchive ? (
              <span className="text-orange-600">Archivée</span>
            ) : (
              <span className="text-gray-600">Inactive</span>
            )}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Durée</p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            {Math.round(
              (new Date(annee.dateFin).getTime() -
                new Date(annee.dateDebut).getTime()) /
                (1000 * 60 * 60 * 24 * 30)
            )}{' '}
            mois
          </p>
        </div>
      </div>

      {/* Informations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
            Informations
          </h3>
          <div className="bg-gray-50 rounded-xl p-4">
            <InfoRow label="Nom" value={annee.nom} icon={CalendarDaysIcon} />
            <InfoRow
              label="Date de début"
              value={formatDate(annee.dateDebut)}
              icon={CalendarDaysIcon}
            />
            <InfoRow
              label="Date de fin"
              value={formatDate(annee.dateFin)}
              icon={CalendarDaysIcon}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
            Métadonnées
          </h3>
          <div className="bg-gray-50 rounded-xl p-4">
            <InfoRow
              label="Créée le"
              value={formatDateTime(annee.createdAt)}
              icon={CalendarDaysIcon}
            />
            <InfoRow
              label="Modifiée le"
              value={formatDateTime(annee.updatedAt)}
              icon={CalendarDaysIcon}
            />
            <InfoRow
              label="ID"
              value={
                <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                  {annee.id}
                </span>
              }
              icon={IdentificationIcon}
            />
          </div>
        </div>
      </div>

      {/* Lien vers les classes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Classes de cette année
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {nbClasses} classe(s) rattachée(s)
            </p>
          </div>
          <Link
            to={`/dashboard/classes?anneeScolaireId=${annee.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <BuildingOfficeIcon className="w-4 h-4" />
            Voir les classes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnneeScolaireDetailPage;