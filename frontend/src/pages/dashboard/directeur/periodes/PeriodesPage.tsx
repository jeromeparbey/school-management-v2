// frontend2/src/pages/dashboard/directeur/periodes/PeriodesPage.tsx

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
  LockClosedIcon,
  LockOpenIcon,
  DocumentTextIcon,
  ChartBarIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import {
  usePeriodes,
  useHardDeletePeriode,
} from '../../../../hooks/usePeriodes';
import type {
  Periode,
  ListPeriodesParams,
  TypePeriode,
} from '../../../../types/periode.types';

// ============================================
// HELPERS
// ============================================

type SortOption = NonNullable<ListPeriodesParams['sortBy']>;

const TYPE_COLORS: Record<TypePeriode, { bg: string; text: string; label: string }> = {
  TRIMESTRE: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Trimestre' },
  SEMESTRE: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Semestre' },
  BULLETIN: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Bulletin' },
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// ============================================
// SOUS-COMPOSANT : Carte statistique
// ============================================

interface StatCardProps {
  label: string;
  value: string | number;
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
// SOUS-COMPOSANT : Carte période
// ============================================

interface PeriodeCardProps {
  periode: Periode;
  onHardDelete: (p: Periode) => void;
  isDeleting: boolean;
}

const PeriodeCard: React.FC<PeriodeCardProps> = ({
  periode,
  onHardDelete,
  isDeleting,
}) => {
  const typeStyle = TYPE_COLORS[periode.type];
  const nbNotes = periode._count?.notes ?? 0;
  const nbBulletins = periode._count?.bulletins ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${
        periode.estCloturee
          ? 'border-gray-300 bg-gray-50/30'
          : periode.estActive
          ? 'border-emerald-200 bg-emerald-50/20'
          : 'border-gray-100'
      }`}
    >
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {periode.ordre}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {periode.nom}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full mt-0.5 ${typeStyle.bg} ${typeStyle.text}`}
                >
                  {typeStyle.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 shrink-0">
            {periode.estCloturee ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                <LockClosedIcon className="w-3 h-3" />
                Clôturée
              </span>
            ) : periode.estActive ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                <CheckCircleIcon className="w-3 h-3" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                <XCircleIcon className="w-3 h-3" />
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
          <span>
            {formatDate(periode.dateDebut)} → {formatDate(periode.dateFin)}
          </span>
        </div>
      </div>

      {/* Année */}
      {periode.anneeScolaire && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AcademicCapIcon className="w-4 h-4 text-gray-400" />
            <span>
              {periode.anneeScolaire.nom}
              {periode.anneeScolaire.estActive && (
                <span className="ml-1 text-xs text-emerald-600 font-medium">
                  (active)
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-5 py-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-center">
        <div>
          <p className="text-xs text-gray-500">Notes</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">{nbNotes}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Bulletins</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">{nbBulletins}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <Link
          to={`/dashboard/periodes/${periode.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <EyeIcon className="w-4 h-4" />
          Voir
        </Link>

        <div className="flex items-center gap-1">
          {!periode.estCloturee && (
            <Link
              to={`/dashboard/periodes/${periode.id}/editer`}
              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
              title="Modifier"
              aria-label={`Modifier ${periode.nom}`}
            >
              <PencilSquareIcon className="w-4 h-4" />
            </Link>
          )}
          <button
            onClick={() => onHardDelete(periode)}
            disabled={isDeleting}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-50"
            title="Supprimer"
            aria-label={`Supprimer ${periode.nom}`}
          >
            {isDeleting ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <TrashIcon className="w-4 h-4" />
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

const PeriodesPage: React.FC = () => {
  // Filtres
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypePeriode | ''>('');
  const [statutFilter, setStatutFilter] = useState<
    'all' | 'active' | 'cloturee' | 'inactive'
  >('all');
  const [sortBy, setSortBy] = useState<SortOption>('ordre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Params API
  const params = useMemo<ListPeriodesParams>(() => {
    const p: ListPeriodesParams = {
      page,
      limit: 12,
      search: search.trim() || undefined,
      type: typeFilter || undefined,
      sortBy,
      sortOrder,
    };

    if (statutFilter === 'active') {
      p.estActive = true;
      p.estCloturee = false;
    } else if (statutFilter === 'cloturee') {
      p.estCloturee = true;
    } else if (statutFilter === 'inactive') {
      p.estActive = false;
      p.estCloturee = false;
    }

    return p;
  }, [page, search, typeFilter, statutFilter, sortBy, sortOrder]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    usePeriodes(params);

  const hardDeleteMutation = useHardDeletePeriode();

  // Données normalisées
  const periodes: Periode[] = useMemo(
    () => data?.periodes ?? [],
    [data]
  );
  const pagination = data?.pagination;

  // Statistiques
  const stats = useMemo(() => {
    const actives = periodes.filter((p) => p.estActive && !p.estCloturee).length;
    const cloturees = periodes.filter((p) => p.estCloturee).length;
    const totalNotes = periodes.reduce(
      (sum, p) => sum + (p._count?.notes ?? 0),
      0
    );
    return { actives, cloturees, totalNotes };
  }, [periodes]);

  // Handlers
  const handleHardDelete = async (periode: Periode) => {
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nPériode : ${periode.nom} (${periode.type})\nOrdre : ${periode.ordre}\n\nCette action est IRRÉVERSIBLE.\n\n⚠️ Si des notes ou bulletins y sont rattachés, la suppression échouera.\n\nContinuer ?`
    );
    if (!confirmed) return;

    setDeletingId(periode.id);
    try {
      await hardDeleteMutation.mutateAsync(periode.id);
    } catch {
      /* toast géré */
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStatutFilter('all');
    setSortBy('ordre');
    setSortOrder('asc');
    setPage(1);
  };

  const activeFiltersCount = [
    search,
    typeFilter,
    statutFilter !== 'all' ? 'x' : '',
  ].filter(Boolean).length;

  return (
    <div className="p-6 space-y-5">
      {/* ============================================
          EN-TÊTE
          ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="h-7 w-7 text-blue-600" />
            Gestion des périodes
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination?.total ?? 0} période(s) au total
            {activeFiltersCount > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                ({periodes.length} filtrée{periodes.length > 1 ? 's' : ''})
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
            aria-label="Rafraîchir"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
          </button>

          <Link
            to="/dashboard/annees"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            title="Gérer les années scolaires"
          >
            <AcademicCapIcon className="h-4 w-4" />
            Années
          </Link>

          <Link
            to="/dashboard/periodes/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvelle période
          </Link>
        </div>
      </div>

      {/* ============================================
          STATISTIQUES
          ============================================ */}
      {!isLoading && !isError && periodes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Périodes affichées"
            value={periodes.length}
            icon={CalendarDaysIcon}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            label="Actives"
            value={stats.actives}
            icon={CheckCircleIcon}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            label="Clôturées"
            value={stats.cloturees}
            icon={LockClosedIcon}
            color="text-gray-600"
            bgColor="bg-gray-100"
          />
          <StatCard
            label="Notes saisies"
            value={stats.totalNotes}
            icon={DocumentTextIcon}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
        </div>
      )}

      {/* ============================================
          RECHERCHE + FILTRES
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une période…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Effacer"
                aria-label="Effacer la recherche"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <ArrowsUpDownIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-') as [
                  SortOption,
                  'asc' | 'desc'
                ];
                setSortBy(by);
                setSortOrder(order);
                setPage(1);
              }}
              className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              title="Trier par"
            >
              <option value="ordre-asc">Ordre (1 → 10)</option>
              <option value="ordre-desc">Ordre (10 → 1)</option>
              <option value="dateDebut-asc">Date début (ancienne)</option>
              <option value="dateDebut-desc">Date début (récente)</option>
              <option value="nom-asc">Nom (A → Z)</option>
              <option value="nom-desc">Nom (Z → A)</option>
            </select>
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              activeFiltersCount > 0
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            aria-expanded={showFilters}
          >
            <FunnelIcon className="h-4 w-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Badges filtres actifs */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                🔍 "{search}"
                <button
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="hover:text-blue-900"
                  title="Retirer"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {typeFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                {TYPE_COLORS[typeFilter].label}
                <button
                  onClick={() => {
                    setTypeFilter('');
                    setPage(1);
                  }}
                  className="hover:text-indigo-900"
                  title="Retirer"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {statutFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                {statutFilter === 'active'
                  ? '✅ Actives'
                  : statutFilter === 'cloturee'
                  ? '🔒 Clôturées'
                  : '⛔ Inactives'}
                <button
                  onClick={() => {
                    setStatutFilter('all');
                    setPage(1);
                  }}
                  className="hover:text-emerald-900"
                  title="Retirer"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Tout effacer
            </button>
          </div>
        )}

        {/* Filtres avancés */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value as TypePeriode | '');
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Tous les types</option>
                    <option value="TRIMESTRE">Trimestre</option>
                    <option value="SEMESTRE">Semestre</option>
                    <option value="BULLETIN">Bulletin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Statut
                  </label>
                  <select
                    value={statutFilter}
                    onChange={(e) => {
                      setStatutFilter(e.target.value as any);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="all">Tous</option>
                    <option value="active">Actives</option>
                    <option value="cloturee">Clôturées</option>
                    <option value="inactive">Inactives</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Indicateur rafraîchissement */}
      {isFetching && !isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <ArrowPathIcon className="h-4 w-4 animate-spin text-blue-600" />
          Actualisation…
        </div>
      )}

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
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-gray-100 rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
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
              'Impossible de charger les périodes.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : periodes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-4">
            <CalendarDaysIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Aucune période
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {activeFiltersCount > 0
              ? 'Aucune période ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre première période (Trimestre 1, Semestre 1…).'}
          </p>
          {activeFiltersCount > 0 ? (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Réinitialiser les filtres
            </button>
          ) : (
            <Link
              to="/dashboard/periodes/nouveau"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Créer ma première période
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {periodes.map((periode: Periode) => (
              <PeriodeCard
                key={periode.id}
                periode={periode}
                onHardDelete={handleHardDelete}
                isDeleting={deletingId === periode.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ============================================
          PAGINATION
          ============================================ */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Page <strong>{pagination.page}</strong> sur{' '}
            <strong>{pagination.totalPages}</strong> — {pagination.total}{' '}
            période(s)
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Première page"
            >
              ««
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Précédent
            </button>

            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                const start = Math.max(
                  1,
                  Math.min(page - 2, pagination.totalPages - 4)
                );
                return start + i;
              }
            )
              .filter((p) => p >= 1 && p <= pagination.totalPages)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    p === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}

            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
            <button
              onClick={() => setPage(pagination.totalPages)}
              disabled={page >= pagination.totalPages}
              className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Dernière page"
            >
              »»
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodesPage;