// frontend2/src/pages/dashboard/directeur/inscriptions/InscriptionsListPage.tsx

import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  EyeIcon,
  TrashIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useInscriptions,
  useSoftDeleteInscription,
} from '../../../../hooks/useInscriptions';
import { useClasses } from '../../../../hooks/useClasses';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import { useToast } from '../../../../context/ToastContext';
import type { ListInscriptionsParams } from '../../../../types/inscription.types';
import type { AnneeScolaire } from '../../../../types/anneeScolaire.types';

type SortKey = 'dateInscription' | 'createdAt';

const InscriptionsListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // ─────────── Filtres ───────────
  const [search, setSearch] = useState('');
  const [estActive, setEstActive] = useState<boolean | undefined>(true);
  const [classeId, setClasseId] = useState('');
  const [anneeScolaireId, setAnneeScolaireId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<SortKey>('dateInscription');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ─────────── Sélection multiple ───────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ─────────── Lookups filtres ───────────
  const { data: classesData } = useClasses({ limit: 200 });
  const classes = classesData?.classes ?? [];

  const { data: anneesData } = useAnneesScolaires({ limit: 50 });
  const annees: AnneeScolaire[] = useMemo(() => {
    if (!anneesData) return [];
    const any = anneesData as any;
    if (Array.isArray(any.annees)) return any.annees;
    if (Array.isArray(any.data)) return any.data;
    return [];
  }, [anneesData]);

  // ─────────── Requête ───────────
  const params: ListInscriptionsParams = useMemo(
    () => ({
      page,
      limit,
      search: search.trim() || undefined,
      estActive,
      classeId: classeId || undefined,
      anneeScolaireId: anneeScolaireId || undefined,
      sortBy,
      sortOrder,
    }),
    [
      page,
      limit,
      search,
      estActive,
      classeId,
      anneeScolaireId,
      sortBy,
      sortOrder,
    ]
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useInscriptions(params);
  const softDelete = useSoftDeleteInscription();

  const inscriptions = data?.inscriptions ?? [];
  const pagination = data?.pagination;

  // ─────────── Statistiques ───────────
  const stats = useMemo(() => {
    const actives = inscriptions.filter((i) => i.estActive).length;
    const inactives = inscriptions.length - actives;
    return { actives, inactives };
  }, [inscriptions]);

  // ─────────── Handlers ───────────
  const resetFilters = () => {
    setSearch('');
    setEstActive(true);
    setClasseId('');
    setAnneeScolaireId('');
    setPage(1);
  };

  const hasActiveFilters =
    !!search.trim() || estActive !== true || !!classeId || !!anneeScolaireId;

  const handleDelete = (id: string, nom: string) => {
    if (!window.confirm(`Désactiver l'inscription de "${nom}" ?`)) return;
    softDelete.mutate(id);
  };

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === inscriptions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(inscriptions.map((i) => i.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Désactiver ${selectedIds.size} inscription(s) sélectionnée(s) ?`
      )
    )
      return;
    for (const id of selectedIds) {
      try {
        await softDelete.mutateAsync(id);
      } catch {
        /* déjà toasté par le hook */
      }
    }
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} inscription(s) désactivée(s)`);
  };

  // ─────────── Rendu ───────────
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      {/* ═══════════ EN-TÊTE ═══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AcademicCapIcon className="w-7 h-7 text-blue-600" />
            Inscriptions
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérer les inscriptions des élèves dans les classes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
            />
            Rafraîchir
          </button>
          <Link
            to="/dashboard/inscriptions/nouvelle"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg"
          >
            <PlusIcon className="w-5 h-5" />
            Nouvelle inscription
          </Link>
        </div>
      </div>

      {/* ═══════════ STATS ═══════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total (page)"
          value={inscriptions.length}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatCard
          label="Actives"
          value={stats.actives}
          icon={CheckCircleIcon}
          color="emerald"
        />
        <StatCard
          label="Inactives"
          value={stats.inactives}
          icon={XCircleIcon}
          color="gray"
        />
        <StatCard
          label="Total global"
          value={pagination?.total ?? 0}
          icon={AcademicCapIcon}
          color="indigo"
        />
      </div>

      {/* ═══════════ FILTRES ═══════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FunnelIcon className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Filtres
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs text-red-600 hover:underline font-medium"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Recherche */}
          <div className="relative lg:col-span-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un élève (nom, prénom, matricule)…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Statut */}
          <select
            value={estActive === undefined ? '' : String(estActive)}
            onChange={(e) => {
              const v = e.target.value;
              setEstActive(v === '' ? undefined : v === 'true');
              setPage(1);
            }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Actives uniquement</option>
            <option value="false">Inactives uniquement</option>
          </select>

          {/* Classe */}
          <select
            value={classeId}
            onChange={(e) => {
              setClasseId(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Toutes les classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} ({c.code})
              </option>
            ))}
          </select>

          {/* Année */}
          <select
            value={anneeScolaireId}
            onChange={(e) => {
              setAnneeScolaireId(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none md:col-span-2 lg:col-span-1"
          >
            <option value="">Toutes les années</option>
            {annees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nom} {a.estActive ? '(active)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ═══════════ BARRE ACTIONS GROUPÉES ═══════════ */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-blue-800 font-medium">
            {selectedIds.size} inscription(s) sélectionnée(s)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-blue-700 hover:underline font-medium"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={softDelete.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              Désactiver
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ TABLE ═══════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="py-16 text-center">
            <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 font-medium">
              Erreur de chargement des inscriptions
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 text-sm text-blue-600 hover:underline font-medium"
            >
              Réessayer
            </button>
          </div>
        ) : inscriptions.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-10" />
                <col className="w-[28%]" />
                <col className="w-[18%]" />
                <col className="w-[15%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        inscriptions.length > 0 &&
                        selectedIds.size === inscriptions.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Élève
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Classe
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Année
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => toggleSort('dateInscription')}
                      className="inline-flex items-center gap-1 hover:text-gray-700"
                    >
                      Date
                      {sortBy === 'dateInscription' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUpIcon className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDownIcon className="w-3.5 h-3.5" />
                        ))}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inscriptions.map((i) => {
                  const isSelected = selectedIds.has(i.id);
                  return (
                    <tr
                      key={i.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(i.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm shrink-0">
                            {i.eleve?.prenom?.[0]}
                            {i.eleve?.nom?.[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {i.eleve?.prenom} {i.eleve?.nom}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {i.eleve?.matricule}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 font-medium truncate">
                          {i.classe?.nom ?? '—'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {i.classe?.code ?? ''}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 truncate">
                          {i.anneeScolaire?.nom ?? '—'}
                        </p>
                        {i.anneeScolaire?.estActive && (
                          <span className="inline-block text-xs font-medium text-emerald-600">
                            ● active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(i.dateInscription).toLocaleDateString(
                          'fr-FR'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {i.estActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                            <XCircleIcon className="w-3.5 h-3.5" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/dashboard/inscriptions/${i.id}`)
                            }
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            title="Voir le détail"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/dashboard/inscriptions/${i.id}/editer`)
                            }
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            title="Éditer"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          {i.estActive && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  i.id,
                                  `${i.eleve?.prenom ?? ''} ${i.eleve?.nom ?? ''}`
                                )
                              }
                              disabled={softDelete.isPending}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                              title="Désactiver"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ═══════════ PAGINATION ═══════════ */}
        {pagination && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-600">
              <strong>{pagination.total}</strong> inscription(s) — page{' '}
              <strong>{pagination.page}</strong> sur {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-600 px-2">
                {page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'emerald' | 'gray' | 'indigo';
}> = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    gray: 'bg-gray-100 text-gray-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  }[color];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg ${colorClasses} flex items-center justify-center shrink-0`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const TableSkeleton: React.FC = () => (
  <div className="p-4 space-y-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 animate-pulse">
        <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-2 bg-gray-100 rounded w-1/4" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-3 bg-gray-200 rounded w-16" />
      </div>
    ))}
  </div>
);

const EmptyState: React.FC<{
  hasFilters: boolean;
  onResetFilters: () => void;
}> = ({ hasFilters, onResetFilters }) => (
  <div className="py-16 text-center">
    <UserGroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
    <p className="text-gray-600 font-medium">
      {hasFilters ? 'Aucune inscription ne correspond aux filtres' : 'Aucune inscription pour l\'instant'}
    </p>
    <p className="text-xs text-gray-500 mt-1">
      {hasFilters
        ? 'Essayez d\'ajuster vos critères de recherche.'
        : 'Créez la première inscription pour commencer.'}
    </p>
    <div className="mt-4 flex items-center justify-center gap-3">
      {hasFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium hover:underline"
        >
          Réinitialiser les filtres
        </button>
      )}
      <Link
        to="/dashboard/inscriptions/nouvelle"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
      >
        <PlusIcon className="w-4 h-4" />
        Créer une inscription
      </Link>
    </div>
  </div>
);

export default InscriptionsListPage;