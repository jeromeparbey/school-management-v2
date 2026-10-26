// frontend2/src/pages/dashboard/directeur/paiements/PaiementsListPage.tsx

import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowPathIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  ReceiptPercentIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import {
  usePaiements,
  useAnnulerPaiement,
} from '../../../../hooks/usePaiements';
import { useToast } from '../../../../context/ToastContext';
import type {
  ListPaiementsParams,
  MoyenPaiement,
  StatutPaiement,
} from '../../../../types/paiement.types';

// ──────────────────────────────────────────
// CONSTANTES
// ──────────────────────────────────────────

const MOYENS: { value: MoyenPaiement; label: string; color: string }[] = [
  { value: 'ESPECES', label: 'Espèces', color: 'bg-emerald-50 text-emerald-700' },
  { value: 'VIREMENT', label: 'Virement', color: 'bg-blue-50 text-blue-700' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money', color: 'bg-amber-50 text-amber-700' },
  { value: 'CARTE', label: 'Carte', color: 'bg-indigo-50 text-indigo-700' },
  { value: 'CHEQUE', label: 'Chèque', color: 'bg-purple-50 text-purple-700' },
  { value: 'AUTRE', label: 'Autre', color: 'bg-gray-100 text-gray-700' },
];

const STATUTS: { value: StatutPaiement; label: string }[] = [
  { value: 'COMPLET', label: 'Complet' },
  { value: 'ANNULE', label: 'Annulé' },
  { value: 'REMBOURSE', label: 'Remboursé' },
];

const moyenLabel = (m: MoyenPaiement) =>
  MOYENS.find((x) => x.value === m)?.label ?? m;
const moyenColor = (m: MoyenPaiement) =>
  MOYENS.find((x) => x.value === m)?.color ?? 'bg-gray-100 text-gray-700';

const formatMontant = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

// ──────────────────────────────────────────
// PAGE
// ──────────────────────────────────────────

const PaiementsListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Filtres
  const [search, setSearch] = useState('');
  const [moyen, setMoyen] = useState<MoyenPaiement | ''>('');
  const [statut, setStatut] = useState<StatutPaiement | ''>('COMPLET');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<
    'datePaiement' | 'montant' | 'createdAt'
  >('datePaiement');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Dialog annulation
  const [annulerId, setAnnulerId] = useState<string | null>(null);
  const [motifAnnulation, setMotifAnnulation] = useState('');
  const annulerMutation = useAnnulerPaiement();

  const params: ListPaiementsParams = useMemo(
    () => ({
      page,
      limit,
      search: search.trim() || undefined,
      moyen: moyen || undefined,
      statut: statut || undefined,
      dateDebut: dateDebut ? new Date(dateDebut).toISOString() : undefined,
      dateFin: dateFin ? new Date(dateFin + 'T23:59:59').toISOString() : undefined,
      sortBy,
      sortOrder,
    }),
    [page, limit, search, moyen, statut, dateDebut, dateFin, sortBy, sortOrder]
  );

  const { data, isLoading, isFetching, isError, refetch } = usePaiements(params);

  const paiements = data?.paiements ?? [];
  const pagination = data?.pagination;
  const summary = data?.summary ?? { totalMontant: 0 };

  // Stats locales (page courante)
  const pageStats = useMemo(() => {
    const complets = paiements.filter((p) => p.statut === 'COMPLET');
    const annules = paiements.filter((p) => p.statut === 'ANNULE');
    return {
      complets: complets.length,
      annules: annules.length,
      montantPage: complets.reduce((s, p) => s + p.montant, 0),
    };
  }, [paiements]);

  const resetFilters = () => {
    setSearch('');
    setMoyen('');
    setStatut('COMPLET');
    setDateDebut('');
    setDateFin('');
    setPage(1);
  };

  const hasActiveFilters =
    !!search.trim() ||
    !!moyen ||
    statut !== 'COMPLET' ||
    !!dateDebut ||
    !!dateFin;

  const toggleSort = (key: typeof sortBy) => {
    if (sortBy === key) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(key);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleAnnuler = async () => {
    if (!annulerId) return;
    if (motifAnnulation.trim().length < 3) {
      toast.warning('Motif trop court', 'Minimum 3 caractères.');
      return;
    }
    try {
      await annulerMutation.mutateAsync({
        id: annulerId,
        payload: { motifAnnulation: motifAnnulation.trim() },
      });
      setAnnulerId(null);
      setMotifAnnulation('');
    } catch {
      /* toasté */
    }
  };

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BanknotesIcon className="w-7 h-7 text-emerald-600" />
            Paiements
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérer les encaissements et paiements des élèves
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
            to="/dashboard/paiements/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg"
          >
            <PlusIcon className="w-5 h-5" />
            Nouveau paiement
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total global (filtre)"
          value={`${formatMontant(summary.totalMontant)} XOF`}
          icon={BanknotesIcon}
          color="emerald"
        />
        <StatCard
          label="Montant page courante"
          value={`${formatMontant(pageStats.montantPage)} XOF`}
          icon={ReceiptPercentIcon}
          color="blue"
        />
        <StatCard
          label="Complets (page)"
          value={pageStats.complets}
          icon={CheckCircleIcon}
          color="emerald"
        />
        <StatCard
          label="Annulés (page)"
          value={pageStats.annules}
          icon={XCircleIcon}
          color="red"
        />
      </div>

      {/* Filtres */}
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
          <div className="relative lg:col-span-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Référence, nom, prénom, matricule…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <select
            value={moyen}
            onChange={(e) => {
              setMoyen(e.target.value as MoyenPaiement | '');
              setPage(1);
            }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">Tous les moyens</option>
            {MOYENS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={statut}
            onChange={(e) => {
              setStatut(e.target.value as StatutPaiement | '');
              setPage(1);
            }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">Tous les statuts</option>
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Du</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => {
                setDateDebut(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Au</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => {
                setDateFin(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="py-16 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 font-medium">
              Erreur de chargement des paiements
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 text-sm text-emerald-600 hover:underline font-medium"
            >
              Réessayer
            </button>
          </div>
        ) : paiements.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[12%]" />
                <col className="w-[24%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Élève
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => toggleSort('montant')}
                      className="inline-flex items-center gap-1 hover:text-gray-700"
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
                    Moyen
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => toggleSort('datePaiement')}
                      className="inline-flex items-center gap-1 hover:text-gray-700"
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
                    Statut
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paiements.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-medium text-gray-900 truncate">
                        {p.reference}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs shrink-0">
                          {p.eleve?.prenom?.[0]}
                          {p.eleve?.nom?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {p.eleve?.prenom} {p.eleve?.nom}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {p.eleve?.matricule}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900">
                        {formatMontant(p.montant)}
                      </p>
                      <p className="text-xs text-gray-500">XOF</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${moyenColor(
                          p.moyen
                        )}`}
                      >
                        {moyenLabel(p.moyen)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(p.datePaiement).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      {p.statut === 'COMPLET' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          Complet
                        </span>
                      )}
                      {p.statut === 'ANNULE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                          <XCircleIcon className="w-3.5 h-3.5" />
                          Annulé
                        </span>
                      )}
                      {p.statut === 'REMBOURSE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                          <XCircleIcon className="w-3.5 h-3.5" />
                          Remboursé
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/dashboard/paiements/${p.id}`)
                          }
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                          title="Voir le détail"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {p.recu?.cheminPDF && (
                          <a
                            href={p.recu.cheminPDF}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Télécharger le reçu"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </a>
                        )}
                        {p.statut === 'COMPLET' && (
                          <button
                            type="button"
                            onClick={() => {
                              setAnnulerId(p.id);
                              setMotifAnnulation('');
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Annuler le paiement"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        )}
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
              <strong>{pagination.total}</strong> paiement(s) — page{' '}
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

      {/* Dialog annulation */}
      {annulerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Annuler le paiement
                </h2>
                <p className="text-xs text-gray-500">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Motif d'annulation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motifAnnulation}
                onChange={(e) => setMotifAnnulation(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Expliquez la raison de l'annulation (min 3 caractères)…"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {motifAnnulation.length}/500
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAnnulerId(null);
                  setMotifAnnulation('');
                }}
                className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAnnuler}
                disabled={
                  annulerMutation.isPending ||
                  motifAnnulation.trim().length < 3
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {annulerMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Annulation…
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-4 h-4" />
                    Confirmer l'annulation
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

// ═══════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'blue' | 'red' | 'indigo' | 'amber';
}> = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
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
        <p className="text-base font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
};

const TableSkeleton: React.FC = () => (
  <div className="p-4 space-y-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 animate-pulse">
        <div className="w-16 h-3 bg-gray-200 rounded" />
        <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-2 bg-gray-100 rounded w-1/4" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-6 bg-gray-100 rounded-full w-16" />
      </div>
    ))}
  </div>
);

const EmptyState: React.FC<{
  hasFilters: boolean;
  onResetFilters: () => void;
}> = ({ hasFilters, onResetFilters }) => (
  <div className="py-16 text-center">
    <BanknotesIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
    <p className="text-gray-600 font-medium">
      {hasFilters
        ? 'Aucun paiement ne correspond aux filtres'
        : "Aucun paiement pour l'instant"}
    </p>
    <p className="text-xs text-gray-500 mt-1">
      {hasFilters
        ? 'Essayez d\'ajuster vos critères de recherche.'
        : 'Enregistrez le premier paiement pour commencer.'}
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
        to="/dashboard/paiements/nouveau"
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
      >
        <PlusIcon className="w-4 h-4" />
        Nouveau paiement
      </Link>
    </div>
  </div>
);

export default PaiementsListPage;