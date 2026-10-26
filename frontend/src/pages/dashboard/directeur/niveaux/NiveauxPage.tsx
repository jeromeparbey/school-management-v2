// frontend2/src/pages/dashboard/directeur/niveaux/NiveauxPage.tsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import {
  useNiveaux,
  useHardDeleteNiveau,
} from '../../../../hooks/useNiveaux';
import type {
  Niveau,
  ListNiveauxParams,
} from '../../../../types/niveau.types';

// ============================================
// SOUS-COMPOSANT : Carte niveau
// ============================================

interface NiveauCardProps {
  niveau: Niveau;
  onHardDelete: (n: Niveau) => void;
  isDeleting: boolean;
}

const NiveauCard: React.FC<NiveauCardProps> = ({
  niveau,
  onHardDelete,
  isDeleting,
}) => {
  const nbClasses = niveau._count?.classes ?? 0;
  const nbMatieres = niveau._count?.matieres ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {niveau.ordre}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {niveau.nom}
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  {niveau.code}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {niveau.description && (
        <div className="px-5 pb-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {niveau.description}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-gray-600">
          <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
          <strong className="text-gray-900">{nbClasses}</strong> classe
          {nbClasses > 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <BookOpenIcon className="h-4 w-4 text-gray-400" />
          <strong className="text-gray-900">{nbMatieres}</strong> matière
          {nbMatieres > 1 ? 's' : ''}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
        <Link
          to={`/dashboard/niveaux/${niveau.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <EyeIcon className="h-4 w-4" />
          Voir le détail
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to={`/dashboard/niveaux/${niveau.id}/editer`}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onHardDelete(niveau)}
            disabled={isDeleting}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
            title="Supprimer"
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

const NiveauxPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const params = useMemo<ListNiveauxParams>(
    () => ({
      page,
      limit: 12,
      search: search.trim() || undefined,
      sortBy: 'ordre',
      sortOrder: 'asc',
    }),
    [page, search]
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useNiveaux(params);

  const hardDeleteMutation = useHardDeleteNiveau();

  // ✅ CORRIGÉ : le hook retourne { niveaux, pagination }
  const niveaux: Niveau[] = data?.niveaux ?? [];
  const pagination = data?.pagination;

  const handleHardDelete = async (niveau: Niveau) => {
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nNiveau : ${niveau.nom}\nCode : ${niveau.code}\n\nCette action est IRRÉVERSIBLE.\nSi des classes ou matières y sont rattachées, la suppression échouera.\n\nContinuer ?`
    );
    if (!confirmed) return;

    setDeletingId(niveau.id);
    try {
      await hardDeleteMutation.mutateAsync(niveau.id);
    } catch {
      /* toast géré */
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* ============================================
          EN-TÊTE
          ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AcademicCapIcon className="h-7 w-7 text-indigo-600" />
            Gestion des niveaux
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination?.total ?? 0} niveau(x) au total
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Rafraîchir */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
            title="Rafraîchir"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
          </button>

          {/* Lien vers les classes (symétrie) */}
          <Link
            to="/dashboard/classes"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            title="Gérer les classes"
          >
            <BuildingOfficeIcon className="h-4 w-4" />
            Classes
          </Link>

          {/* Lien vers la page de création dédiée */}
          <Link
            to="/dashboard/niveaux/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Nouveau niveau
          </Link>
        </div>
      </div>

      {/* ============================================
          RECHERCHE
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, code ou description…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* ============================================
          CONTENU
          ============================================ */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
            >
              <div className="h-10 w-10 bg-gray-100 rounded-xl mb-3" />
              <div className="h-5 bg-gray-100 rounded w-2/3 mb-2" />
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
              'Impossible de charger les niveaux.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : niveaux.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-full mb-4">
            <AcademicCapIcon className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Aucun niveau
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {search
              ? 'Aucun niveau ne correspond à votre recherche.'
              : 'Commencez par créer votre premier niveau (6ème, 5ème, CM2…).'}
          </p>
          <Link
            to="/dashboard/niveaux/nouveau"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            Créer mon premier niveau
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {niveaux.map((niveau: Niveau) => (
              <NiveauCard
                key={niveau.id}
                niveau={niveau}
                onHardDelete={handleHardDelete}
                isDeleting={deletingId === niveau.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ============================================
          PAGINATION
          ============================================ */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page <strong>{pagination.page}</strong> sur{' '}
            <strong>{pagination.totalPages}</strong> — {pagination.total}{' '}
            niveau(x) au total
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

export default NiveauxPage;