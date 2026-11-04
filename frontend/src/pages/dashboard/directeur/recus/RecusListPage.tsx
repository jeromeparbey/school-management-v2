// frontend2/src/pages/dashboard/directeur/recus/RecusListPage.tsx

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  PrinterIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
  useRecus,
  useDownloadRecuPDF,
} from '../../../../hooks/useRecus';
import { useToast } from '../../../../context/ToastContext';
import type {
  ListRecusParams,
  FormatImpression,
} from '../../../../types/recu.types';

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const formatMontant = (n: number | null | undefined) => {
  if (n == null) return '0';
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const MOYENS_LABEL: Record<string, string> = {
  ESPECES: 'Espèces',
  VIREMENT: 'Virement',
  MOBILE_MONEY: 'Mobile Money',
  CARTE: 'Carte',
  CHEQUE: 'Chèque',
  AUTRE: 'Autre',
};

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

const RecusListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<
    'datePaiement' | 'montant' | 'createdAt'
  >('datePaiement');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const params: ListRecusParams = useMemo(
    () => ({
      page,
      limit,
      search: search.trim() || undefined,
      dateDebut: dateDebut ? new Date(dateDebut).toISOString() : undefined,
      dateFin: dateFin
        ? new Date(dateFin + 'T23:59:59').toISOString()
        : undefined,
      sortBy,
      sortOrder,
    }),
    [page, limit, search, dateDebut, dateFin, sortBy, sortOrder]
  );

  const { data, isLoading, isFetching, isError, refetch } = useRecus(params);
  const downloadPDF = useDownloadRecuPDF();

  const recus = data?.recus ?? [];
  const pagination = data?.pagination;
  const summary = data?.summary ?? { totalMontant: 0 };

  const resetFilters = () => {
    setSearch('');
    setDateDebut('');
    setDateFin('');
    setPage(1);
  };

  const hasActiveFilters = !!search.trim() || !!dateDebut || !!dateFin;

  const toggleSort = (key: typeof sortBy) => {
    if (sortBy === key) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(key);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleDownload = (
    recu: (typeof recus)[number],
    format: FormatImpression
  ) => {
    downloadPDF.mutate({
      id: recu.id,
      numeroRecu: recu.numeroRecu,
      format,
    });
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5 p-6">
      {/* ═══════════════════════════════════════
          EN-TÊTE
          ═══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <DocumentTextIcon className="w-6 h-6" />
            </div>
            Reçus
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Historique des reçus de paiement
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
        >
          <ArrowPathIcon
            className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
          />
          Rafraîchir
        </button>
      </div>

      {/* ═══════════════════════════════════════
          STATS
          ═══════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard
          label="Total reçus"
          value={pagination?.total ?? 0}
          icon={DocumentTextIcon}
          color="emerald"
        />
        <StatCard
          label="Montant total (filtre)"
          value={`${formatMontant(summary.totalMontant)} F CFA`}
          icon={BanknotesIcon}
          color="teal"
        />
        <StatCard
          label="Page courante"
          value={recus.length}
          icon={CheckCircleIcon}
          color="emerald"
        />
      </div>

      {/* ═══════════════════════════════════════
          FILTRES
          ═══════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FunnelIcon className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Filtres
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="N° reçu, nom élève, classe, code…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">
              Du
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => {
                setDateDebut(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">
              Au
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => {
                setDateFin(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          TABLE
          ═══════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="py-16 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 font-medium">
              Erreur de chargement des reçus
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 text-sm text-emerald-600 hover:underline font-medium"
            >
              Réessayer
            </button>
          </div>
        ) : recus.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[24%]" />
                <col className="w-[14%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    N° Reçu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Élève
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Classe
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => toggleSort('montant')}
                      className="inline-flex items-center gap-1 hover:text-emerald-600 transition-colors"
                    >
                      Montant
                      {sortBy === 'montant' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUpIcon className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDownIcon className="w-3.5 h-3.5" />
                        ))}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => toggleSort('datePaiement')}
                      className="inline-flex items-center gap-1 hover:text-emerald-600 transition-colors"
                    >
                      Date
                      {sortBy === 'datePaiement' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUpIcon className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDownIcon className="w-3.5 h-3.5" />
                        ))}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Moyen
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recus.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-gray-900 truncate">
                        {r.numeroRecu}
                      </p>
                      {r.nombreImpressions > 0 && (
                        <p className="text-[10px] text-gray-500">
                          <PrinterIcon className="w-3 h-3 inline mr-0.5" />
                          {r.nombreImpressions} impression(s)
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-sm">
                          {r.elevePrenom?.[0] ?? r.nomEleve?.[0]}
                          {r.eleveNom?.[0] ?? r.nomEleve?.split(' ')[1]?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {r.nomEleve}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {r.eleveMatricule}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {r.nomClasse}
                      </p>
                      {r.classeCode && (
                        <p className="text-xs text-gray-500 truncate">
                          {r.classeCode}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-emerald-700">
                        {formatMontant(r.montantPaye)}
                      </p>
                      <p className="text-xs text-gray-500">F CFA</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(r.datePaiement).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                        {MOYENS_LABEL[r.moyenPaiement] ?? r.moyenPaiement}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/dashboard/recus/${r.id}`)
                          }
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Voir le détail"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(r, 'A4')}
                          disabled={downloadPDF.isPending}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Télécharger PDF A4"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-600">
              <strong className="text-gray-900">{pagination.total}</strong>{' '}
              reçu(s) — page{' '}
              <strong className="text-gray-900">{pagination.page}</strong> sur{' '}
              {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
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
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
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
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
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

// ═══════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════════════════

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'teal';
}> = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    teal: 'bg-teal-50 text-teal-600',
  }[color];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
      <div
        className={`w-10 h-10 rounded-xl ${colorClasses} flex items-center justify-center shrink-0`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium truncate uppercase tracking-wider">
          {label}
        </p>
        <p className="text-lg font-bold text-gray-900 truncate mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
};

const TableSkeleton: React.FC = () => (
  <div className="p-4 space-y-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 animate-pulse">
        <div className="w-20 h-3 bg-gray-200 rounded" />
        <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-2 bg-gray-100 rounded w-1/4" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-6 bg-gray-100 rounded-full w-20" />
      </div>
    ))}
  </div>
);

const EmptyState: React.FC<{
  hasFilters: boolean;
  onResetFilters: () => void;
}> = ({ hasFilters, onResetFilters }) => (
  <div className="py-16 text-center">
    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4">
      <DocumentTextIcon className="w-10 h-10 text-emerald-600" />
    </div>
    <p className="text-gray-900 font-semibold text-lg mb-1">
      {hasFilters
        ? 'Aucun reçu ne correspond aux filtres'
        : "Aucun reçu pour l'instant"}
    </p>
    <p className="text-sm text-gray-500 mt-1">
      {hasFilters
        ? "Essayez d'ajuster vos critères de recherche."
        : 'Les reçus sont générés depuis les paiements.'}
    </p>
    {hasFilters && (
      <button
        type="button"
        onClick={onResetFilters}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium shadow-md shadow-emerald-500/20 transition-all"
      >
        Réinitialiser les filtres
      </button>
    )}
  </div>
);

export default RecusListPage;