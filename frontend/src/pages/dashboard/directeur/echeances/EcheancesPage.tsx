// frontend2/src/pages/dashboard/directeur/echeances/EcheancesPage.tsx

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
  BanknotesIcon,
  ClockIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';
import {
  useEcheances,
  useHardDeleteEcheance,
} from '../../../../hooks/useEcheance';
import type {
  Echeance,
  ListEcheancesParams,
} from '../../../../types/echeance.types';

// ============================================
// HELPERS
// ============================================

type SortOption = NonNullable<ListEcheancesParams['sortBy']>;

const formatMoney = (amount: number, devise = 'XOF') =>
  new Intl.NumberFormat('fr-FR').format(amount) + ` ${devise}`;

const formatDate = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/** Retourne le nombre de jours avant la date limite (négatif = en retard) */
const joursRestants = (dateLimite: string): number => {
  const diff = new Date(dateLimite).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
// SOUS-COMPOSANT : Ligne échéance (tableau)
// ============================================

interface EcheanceRowProps {
  echeance: Echeance;
  onHardDelete: (e: Echeance) => void;
  isDeleting: boolean;
}

const EcheanceRow: React.FC<EcheanceRowProps> = ({
  echeance,
  onHardDelete,
  isDeleting,
}) => {
  const jours = joursRestants(echeance.dateLimite);
  const enRetard = !echeance.estPayee && jours < 0;
  const proche = !echeance.estPayee && jours >= 0 && jours <= 7;

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`hover:bg-gray-50 transition-colors ${
        enRetard ? 'bg-rose-50/40' : proche ? 'bg-amber-50/40' : ''
      }`}
    >
      {/* Ordre */}
      <td className="px-4 py-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
          {echeance.ordre}
        </div>
      </td>

      {/* Nom + plan */}
      <td className="px-4 py-4">
        <div>
          <p className="font-semibold text-gray-900">{echeance.nom}</p>
          {echeance.planScolarite && (
            <p className="text-xs text-gray-500 mt-0.5">
              {echeance.planScolarite.nom}
            </p>
          )}
        </div>
      </td>

      {/* Montant */}
      <td className="px-4 py-4 text-right">
        <p className="font-bold text-gray-900">
          {formatMoney(
            echeance.montant,
            echeance.planScolarite?.devise ?? 'XOF'
          )}
        </p>
      </td>

      {/* Date limite */}
      <td className="px-4 py-4">
        <div>
          <p className="text-sm text-gray-900">
            {formatDate(echeance.dateLimite)}
          </p>
          {!echeance.estPayee && (
            <p
              className={`text-xs mt-0.5 ${
                enRetard
                  ? 'text-rose-600 font-medium'
                  : proche
                  ? 'text-amber-600 font-medium'
                  : 'text-gray-500'
              }`}
            >
              {enRetard
                ? `En retard de ${Math.abs(jours)} jour(s)`
                : `Dans ${jours} jour(s)`}
            </p>
          )}
        </div>
      </td>

      {/* Statut */}
      <td className="px-4 py-4 text-center">
        {echeance.estPayee ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
            <CheckCircleIcon className="w-3 h-3" />
            Payée
          </span>
        ) : enRetard ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 rounded-full">
            <ExclamationTriangleIcon className="w-3 h-3" />
            En retard
          </span>
        ) : proche ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">
            <ClockIcon className="w-3 h-3" />
            Bientôt
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
            <XCircleIcon className="w-3 h-3" />
            En attente
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/dashboard/echeances/${echeance.id}`}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Voir"
            aria-label={`Voir ${echeance.nom}`}
          >
            <EyeIcon className="w-4 h-4" />
          </Link>
          <Link
            to={`/dashboard/echeances/${echeance.id}/editer`}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Modifier"
            aria-label={`Modifier ${echeance.nom}`}
          >
            <PencilSquareIcon className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onHardDelete(echeance)}
            disabled={isDeleting}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
            title="Supprimer"
            aria-label={`Supprimer ${echeance.nom}`}
          >
            {isDeleting ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ============================================
// PAGE PRINCIPALE
// ============================================

const EcheancesPage: React.FC = () => {
  // Filtres
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<
    'all' | 'payee' | 'impayee'
  >('all');
  const [sortBy, setSortBy] = useState<SortOption>('ordre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Params API
  const params = useMemo<ListEcheancesParams>(
    () => ({
      page,
      limit: 20,
      search: search.trim() || undefined,
      estPayee:
        statutFilter === 'all'
          ? undefined
          : statutFilter === 'payee'
          ? true
          : false,
      sortBy,
      sortOrder,
    }),
    [page, search, statutFilter, sortBy, sortOrder]
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useEcheances(params);

  const hardDeleteMutation = useHardDeleteEcheance();

  // Données normalisées
  const echeances: Echeance[] = useMemo(
    () => data?.echeances ?? [],
    [data]
  );
  const pagination = data?.pagination;

  // Statistiques
  const stats = useMemo(() => {
    const payees = echeances.filter((e) => e.estPayee).length;
    const enRetard = echeances.filter(
      (e) => !e.estPayee && joursRestants(e.dateLimite) < 0
    ).length;
    const totalMontant = echeances.reduce((sum, e) => sum + e.montant, 0);
    return { payees, enRetard, totalMontant };
  }, [echeances]);

  // Handlers
  const handleHardDelete = async (echeance: Echeance) => {
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nÉchéance : ${echeance.nom}\nMontant : ${formatMoney(
        echeance.montant,
        echeance.planScolarite?.devise ?? 'XOF'
      )}\n\nCette action est IRRÉVERSIBLE.\n\n⚠️ Si des paiements y sont rattachés, la suppression échouera.\n\nContinuer ?`
    );
    if (!confirmed) return;

    setDeletingId(echeance.id);
    try {
      await hardDeleteMutation.mutateAsync(echeance.id);
    } catch {
      /* toast géré */
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatutFilter('all');
    setSortBy('ordre');
    setSortOrder('asc');
    setPage(1);
  };

  const activeFiltersCount = [
    search,
    statutFilter !== 'all' ? 'x' : '',
  ].filter(Boolean).length;

  return (
    <div className="p-6 space-y-5">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ReceiptPercentIcon className="h-7 w-7 text-blue-600" />
            Échéances
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination?.total ?? 0} échéance(s) au total
            {activeFiltersCount > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                ({echeances.length} filtrée{echeances.length > 1 ? 's' : ''})
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
            to="/dashboard/plans-scolarite"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            title="Voir les plans de scolarité"
          >
            <BanknotesIcon className="h-4 w-4" />
            Plans
          </Link>

          <Link
            to="/dashboard/echeances/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvelle échéance
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      {!isLoading && !isError && echeances.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Échéances affichées"
            value={echeances.length}
            icon={CalendarDaysIcon}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            label="Payées"
            value={stats.payees}
            icon={CheckCircleIcon}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            label="En retard"
            value={stats.enRetard}
            icon={ExclamationTriangleIcon}
            color="text-rose-600"
            bgColor="bg-rose-50"
          />
          <StatCard
            label="Montant total"
            value={formatMoney(stats.totalMontant)}
            icon={BanknotesIcon}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
        </div>
      )}

      {/* Recherche + filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une échéance…"
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
              <option value="ordre-asc">Ordre (croissant)</option>
              <option value="ordre-desc">Ordre (décroissant)</option>
              <option value="dateLimite-asc">Date limite (proche)</option>
              <option value="dateLimite-desc">Date limite (lointaine)</option>
              <option value="montant-desc">Montant (décroissant)</option>
              <option value="montant-asc">Montant (croissant)</option>
              <option value="nom-asc">Nom (A → Z)</option>
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
                    Statut de paiement
                  </label>
                  <select
                    value={statutFilter}
                    onChange={(e) => {
                      setStatutFilter(e.target.value as any);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="all">Toutes</option>
                    <option value="payee">Payées</option>
                    <option value="impayee">Impayées</option>
                  </select>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="flex justify-end mt-3">
                  <button
                    onClick={resetFilters}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
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

      {/* Contenu */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="animate-pulse p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-9 w-9 bg-gray-100 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-24" />
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
            {(error as any)?.response?.data?.message ??
              'Impossible de charger les échéances.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : echeances.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-4">
            <ReceiptPercentIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Aucune échéance
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {activeFiltersCount > 0
              ? 'Aucune échéance ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre première échéance.'}
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
              to="/dashboard/echeances/nouveau"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Créer ma première échéance
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-16">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Échéance
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Montant
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Date limite
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
                <AnimatePresence mode="popLayout">
                  {echeances.map((echeance) => (
                    <EcheanceRow
                      key={echeance.id}
                      echeance={echeance}
                      onHardDelete={handleHardDelete}
                      isDeleting={deletingId === echeance.id}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Page <strong>{pagination.page}</strong> sur{' '}
            <strong>{pagination.totalPages}</strong> — {pagination.total}{' '}
            échéance(s)
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

export default EcheancesPage;