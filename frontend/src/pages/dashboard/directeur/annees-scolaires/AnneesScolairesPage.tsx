// frontend2/src/pages/dashboard/directeur/annees-scolaires/AnneesScolairesPage.tsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import {
  useAnneesScolaires,
  useHardDeleteAnneeScolaire,
} from '../../../../hooks/useAnneesScolaires';
import type {
  AnneeScolaire,
  ListAnneesScolairesParams,
} from '../../../../types/anneeScolaire.types';

// ============================================
// HELPERS
// ============================================
const formatDate = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// ============================================
// SOUS-COMPOSANT : Carte année scolaire
// ============================================

interface AnneeCardProps {
  annee: AnneeScolaire;
  onHardDelete: (a: AnneeScolaire) => void;
  isDeleting: boolean;
}

const AnneeCard: React.FC<AnneeCardProps> = ({
  annee,
  onHardDelete,
  isDeleting,
}) => {
  const nbClasses = annee._count?.classes ?? 0;
  const nbPeriodes = annee._count?.periodes ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${
        annee.estActive
          ? 'border-emerald-200 bg-emerald-50/20'
          : annee.estArchive
          ? 'border-orange-200 bg-orange-50/20'
          : 'border-gray-100'
      }`}
    >
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {annee.nom}
              </h3>
              {annee.estActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  <CheckCircleIcon className="w-3 h-3" />
                  Active
                </span>
              )}
              {annee.estArchive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                  <XCircleIcon className="w-3 h-3" />
                  Archivée
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <CalendarDaysIcon className="w-3.5 h-3.5" />
              {formatDate(annee.dateDebut)} → {formatDate(annee.dateFin)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-gray-600">
          <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
          <strong className="text-gray-900">{nbClasses}</strong> classe
          {nbClasses > 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <AcademicCapIcon className="h-4 w-4 text-gray-400" />
          <strong className="text-gray-900">{nbPeriodes}</strong> période
          {nbPeriodes > 1 ? 's' : ''}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
        <Link
          to={`/dashboard/annees-scolaires/${annee.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <EyeIcon className="h-4 w-4" />
          Voir le détail
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to={`/dashboard/annees-scolaires/${annee.id}/editer`}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Modifier"
            aria-label={`Modifier ${annee.nom}`}
          >
            <PencilSquareIcon className="h-4 w-4" />
          </Link>

          <button
            onClick={() => onHardDelete(annee)}
            disabled={isDeleting}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
            title="Supprimer"
            aria-label={`Supprimer ${annee.nom}`}
          >
            {isDeleting ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// PAGE PRINCIPALE
// ============================================

const AnneesScolairesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [estActiveFilter, setEstActiveFilter] = useState<
    'all' | 'true' | 'false'
  >('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const params = useMemo<ListAnneesScolairesParams>(
    () => ({
      page,
      limit: 12,
      search: search.trim() || undefined,
      estActive:
        estActiveFilter === 'all' ? undefined : estActiveFilter === 'true',
      sortBy: 'dateDebut',
      sortOrder: 'desc',
    }),
    [page, search, estActiveFilter]
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useAnneesScolaires(params);

  const hardDeleteMutation = useHardDeleteAnneeScolaire();

  // ✅ CORRIGÉ : le hook retourne { annees, pagination }
  const annees: AnneeScolaire[] = useMemo(
    () => data?.annees ?? [],
    [data]
  );
  const pagination = data?.pagination;

  const handleHardDelete = async (annee: AnneeScolaire) => {
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nAnnée : ${annee.nom}\n\nCette action est IRRÉVERSIBLE.\nSi des classes sont rattachées, la suppression échouera.\n\nContinuer ?`
    );
    if (!confirmed) return;

    setDeletingId(annee.id);
    try {
      await hardDeleteMutation.mutateAsync(annee.id);
    } catch {
      /* toast géré */
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="h-7 w-7 text-emerald-600" />
            Gestion des années scolaires
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination?.total ?? 0} année(s) au total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
            title="Rafraîchir"
            aria-label="Rafraîchir"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
          </button>

          <Link
            to="/dashboard/classes"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            title="Gérer les classes"
          >
            <BuildingOfficeIcon className="h-4 w-4" />
            Classes
          </Link>

          <Link
            to="/dashboard/annees-scolaires/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvelle année
          </Link>
        </div>
      </div>

      {/* Recherche + Filtre */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une année…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={estActiveFilter}
            onChange={(e) => {
              setEstActiveFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">Toutes</option>
            <option value="true">Actives</option>
            <option value="false">Inactives</option>
          </select>
        </div>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
            >
              <div className="h-6 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold">Erreur de chargement</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Impossible de charger les années.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : annees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4">
            <CalendarDaysIcon className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Aucune année scolaire
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {search
              ? 'Aucune année ne correspond à votre recherche.'
              : 'Commencez par créer votre première année scolaire (ex: 2025-2026).'}
          </p>
          <Link
            to="/dashboard/annees-scolaires/nouveau"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            Créer ma première année
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {annees.map((annee: AnneeScolaire) => (
              <AnneeCard
                key={annee.id}
                annee={annee}
                onHardDelete={handleHardDelete}
                isDeleting={deletingId === annee.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page <strong>{pagination.page}</strong> sur{' '}
            <strong>{pagination.totalPages}</strong> — {pagination.total}{' '}
            année(s)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnneesScolairesPage;