// frontend2/src/pages/dashboard/directeur/reductions/ReductionsListPage.tsx

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ReceiptPercentIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  BanknotesIcon,
  UserGroupIcon,
  SparklesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  useReductions,
  useHardDeleteReduction,
  useReductionStats,
} from '../../../../hooks/useReduction';
import { useToast } from '../../../../context/ToastContext';
import type {
  Reduction,
  ListReductionsParams,
  TypeReduction,
} from '../../../../types/reduction.types';

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

type SortOption = NonNullable<ListReductionsParams['sortBy']>;

const formatMoney = (amount: number | null | undefined, devise = 'F CFA') => {
  if (amount == null) return '—';
  const value = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount);
  const upper = devise.toUpperCase();
  if (upper === 'XOF' || upper === 'XAF') return `${value} F CFA`;
  if (upper === 'EUR') return `${value} €`;
  if (upper === 'USD') return `${value} $`;
  return `${value} ${devise}`;
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const TYPE_LABEL: Record<TypeReduction, string> = {
  FIXE: 'Montant fixe',
  POURCENTAGE: 'Pourcentage',
};

const TYPE_COLOR: Record<
  TypeReduction,
  { bg: string; text: string; border: string }
> = {
  FIXE: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  POURCENTAGE: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
};

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

const ReductionsListPage: React.FC = () => {
  const toast = useToast();

  // Filtres
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeReduction | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Params
  const params = useMemo<ListReductionsParams>(
    () => ({
      page,
      limit,
      search: search.trim() || undefined,
      type: typeFilter || undefined,
      sortBy,
      sortOrder,
    }),
    [page, limit, search, typeFilter, sortBy, sortOrder]
  );

  // Requêtes
  const { data, isLoading, isFetching, isError, refetch } =
    useReductions(params);
  const { data: statsData } = useReductionStats();
  const hardDelete = useHardDeleteReduction();

  const reductions = data?.data ?? [];
  const pagination = data?.pagination;
  const stats = (statsData as any)?.data ?? null;

  // Handlers
  const handleDelete = async (reduction: Reduction) => {
    const confirmed = window.confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nRéduction : ${reduction.motif}\nÉlève : ${reduction.eleve?.prenom} ${reduction.eleve?.nom}\n\nCette action est IRRÉVERSIBLE.\n\nContinuer ?`
    );
    if (!confirmed) return;

    setDeletingId(reduction.id);
    try {
      await hardDelete.mutateAsync(reduction.id);
    } catch {
      /* toast géré */
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const activeFiltersCount = [
    search,
    typeFilter ? 'x' : '',
  ].filter(Boolean).length;

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* ═══════════════════════════════════════
          EN-TÊTE
          ═══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <ReceiptPercentIcon className="w-6 h-6" />
            </div>
            Réductions
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {pagination?.total ?? 0} réduction(s) au total
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                <SparklesIcon className="w-3 h-3" />
                {reductions.length} filtrée{reductions.length > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Rafraîchir"
            aria-label="Rafraîchir"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
          </button>

          <Link
            to="/dashboard/reductions/nouvelle"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvelle réduction
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          STATISTIQUES
          ═══════════════════════════════════════ */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total réductions"
            value={stats?.totalReductions ?? pagination?.total ?? 0}
            icon={ReceiptPercentIcon}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            label="Montant total réduit"
            value={formatMoney(stats?.montantTotalReduit ?? 0)}
            icon={BanknotesIcon}
            color="text-teal-600"
            bgColor="bg-teal-50"
          />
          <StatCard
            label="Fixe"
            value={
              stats?.parType?.find((p: any) => p.type === 'FIXE')?.nombre ?? 0
            }
            icon={ChartBarIcon}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
            hint="réductions fixes"
          />
          <StatCard
            label="Pourcentage"
            value={
              stats?.parType?.find((p: any) => p.type === 'POURCENTAGE')
                ?.nombre ?? 0
            }
            icon={ChartBarIcon}
            color="text-teal-600"
            bgColor="bg-teal-50"
            hint="réductions %"
          />
        </div>
      )}

      {/* ═══════════════════════════════════════
          RECHERCHE + FILTRES
          ═══════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher (motif, élève, matricule…)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                aria-label="Effacer la recherche"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <ArrowsUpDownIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
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
              className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none appearance-none cursor-pointer transition-all"
            >
              <option value="createdAt-desc">Plus récentes</option>
              <option value="createdAt-asc">Plus anciennes</option>
              <option value="valeur-desc">Valeur (décroissante)</option>
              <option value="valeur-asc">Valeur (croissante)</option>
              <option value="approuveLe-desc">Approuvées (récent)</option>
              <option value="approuveLe-asc">Approuvées (ancien)</option>
            </select>
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
              activeFiltersCount > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            aria-expanded={showFilters}
          >
            <FunnelIcon className="h-4 w-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-emerald-600 text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Badges filtres actifs */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                🔍 "{search}"
                <button
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="hover:text-emerald-900"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {typeFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-200">
                {TYPE_LABEL[typeFilter]}
                <button
                  onClick={() => {
                    setTypeFilter('');
                    setPage(1);
                  }}
                  className="hover:text-teal-900"
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
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Type de réduction
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as TypeReduction | '');
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              >
                <option value="">Tous les types</option>
                <option value="FIXE">Montant fixe</option>
                <option value="POURCENTAGE">Pourcentage</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Indicateur rafraîchissement */}
      {isFetching && !isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <ArrowPathIcon className="h-4 w-4 animate-spin text-emerald-600" />
          Actualisation…
        </div>
      )}

      {/* ═══════════════════════════════════════
          CONTENU
          ═══════════════════════════════════════ */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="animate-pulse p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-9 h-9 bg-gray-100 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold">Erreur de chargement</p>
          <p className="text-red-600 text-sm mt-1">
            Impossible de charger les réductions.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : reductions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4">
            <ReceiptPercentIcon className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Aucune réduction
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {activeFiltersCount > 0
              ? 'Aucune réduction ne correspond à vos critères.'
              : 'Commencez par créer votre première réduction.'}
          </p>
          {activeFiltersCount > 0 ? (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Réinitialiser les filtres
            </button>
          ) : (
            <Link
              to="/dashboard/reductions/nouvelle"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-semibold shadow-md shadow-emerald-500/20 transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              Créer ma première réduction
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Élève
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Valeur
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Montant réduit
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Motif
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Approuvé le
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reductions.map((r) => {
                  const typeStyle = TYPE_COLOR[r.type];
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-sm">
                            {r.eleve?.prenom?.[0]}
                            {r.eleve?.nom?.[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {r.eleve?.prenom} {r.eleve?.nom}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {r.eleve?.matricule}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
                        >
                          {TYPE_LABEL[r.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {r.type === 'POURCENTAGE'
                            ? `${r.valeur}%`
                            : formatMoney(r.valeur)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-bold text-emerald-700">
                          {formatMoney(
                            r._meta?.montantReduction ?? 0,
                            r.assignmentScolarite?.planScolarite?.devise ??
                              'XOF'
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 truncate max-w-xs">
                          {r.motif}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">
                          {formatDate(r.approuveLe)}
                        </p>
                        <p className="text-xs text-gray-500">
                          par {r.approbateur?.prenom}{' '}
                          {r.approbateur?.nom}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            to={`/dashboard/reductions/${r.id}`}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Voir"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/dashboard/reductions/${r.id}/editer`}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(r)}
                            disabled={deletingId === r.id}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            {deletingId === r.id ? (
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

      {/* ═══════════════════════════════════════
          PAGINATION
          ═══════════════════════════════════════ */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <p className="text-sm text-gray-500">
            Page <strong className="text-gray-900">{pagination.page}</strong> sur{' '}
            <strong className="text-gray-900">{pagination.totalPages}</strong> —{' '}
            {pagination.total} réduction(s)
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ««
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-600 shadow-sm'
                      : 'border-gray-200 hover:bg-emerald-50 hover:border-emerald-200'
                  }`}
                >
                  {p}
                </button>
              ))}

            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
            <button
              onClick={() => setPage(pagination.totalPages)}
              disabled={page >= pagination.totalPages}
              className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              »»
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SOUS-COMPOSANT
// ═══════════════════════════════════════════════════════════

interface StatCardProps {
  label: string;
  value: string | number;
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
  <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-1 truncate">
          {value}
        </p>
        {hint && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{hint}</p>
        )}
      </div>
      <div className={`p-2.5 rounded-xl ${bgColor} shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

export default ReductionsListPage;