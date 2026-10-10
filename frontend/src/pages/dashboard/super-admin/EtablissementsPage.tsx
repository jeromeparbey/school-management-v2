// frontend2/src/pages/dashboard/super-admin/EtablissementsPage.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CreditCardIcon,
  ServerIcon,
  MapPinIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import {
  useEtablissements,
  useEtablissementStats,
  useToggleEtablissement,
  useArchiveEtablissement,
  useHardDeleteEtablissement,
  useReprovisionnerEtablissement,
} from '../../../hooks/useEtablissements';
import type {
  Etablissement,
  ListEtablissementsParams,
} from '../../../types/etablissement.api';

// ============================================
// HELPERS
// ============================================
const PLAN_COLORS: Record<string, string> = {
  ENTERPRISE: 'bg-purple-50 text-purple-700 border-purple-200',
  PREMIUM: 'bg-red-50 text-red-700 border-red-200',
  STANDARD: 'bg-amber-50 text-amber-700 border-amber-200',
  BASIQUE: 'bg-blue-50 text-blue-700 border-blue-200',
  GRATUIT: 'bg-gray-100 text-gray-700 border-gray-200',
};

const STATUT_PROV_COLORS: Record<string, string> = {
  TERMINE: 'bg-emerald-50 text-emerald-700',
  EN_COURS: 'bg-blue-50 text-blue-700',
  EN_ATTENTE: 'bg-gray-100 text-gray-700',
  ECHEC: 'bg-red-50 text-red-700',
};

const STATUT_PROV_LABELS: Record<string, string> = {
  TERMINE: 'Terminé',
  EN_COURS: 'En cours',
  EN_ATTENTE: 'En attente',
  ECHEC: 'Échec',
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// ============================================
// COMPOSANT STAT CARD
// ============================================
interface StatCardProps {
  label: string;
  value: number | string;
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
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-5"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {hint && <p className="text-[10px] text-gray-400 mt-1 italic">{hint}</p>}
      </div>
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </motion.div>
);

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const EtablissementsPage: React.FC = () => {
  // --- Filtres ---
  const [filters, setFilters] = useState<ListEtablissementsParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // --- Requêtes ---
  const { data, isLoading, isError, error, refetch, isFetching } =
    useEtablissements(filters);
  const { data: stats, isLoading: statsLoading } = useEtablissementStats();

  // --- Mutations ---
  const toggleMutation = useToggleEtablissement();
  const archiveMutation = useArchiveEtablissement();
  const deleteMutation = useHardDeleteEtablissement();
  const reprovisionMutation = useReprovisionnerEtablissement();

  // --- Handlers ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1, search: searchInput.trim() || undefined }));
  };

  const handleToggle = async (etab: Etablissement) => {
    if (!confirm(`${etab.estActif ? 'Désactiver' : 'Activer'} "${etab.nom}" ?`))
      return;
    try {
      await toggleMutation.mutateAsync({
        id: etab.id,
        payload: { estActif: !etab.estActif },
      });
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur');
    }
  };

  const handleArchive = async (etab: Etablissement) => {
    if (!confirm(`Archiver "${etab.nom}" ?\n\nCette action est réversible.`))
      return;
    try {
      await archiveMutation.mutateAsync(etab.id);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur');
    }
  };

  const handleDelete = async (etab: Etablissement) => {
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\n` +
        `Établissement : ${etab.nom}\n` +
        `Code : ${etab.code}\n\n` +
        `Cette action est IRRÉVERSIBLE.\n` +
        `Elle supprimera également le schéma PostgreSQL.\n\n` +
        `Continuer ?`
    );
    if (!confirmed) return;

    const doubleCheck = prompt(
      `Pour confirmer, tapez le code de l'établissement : "${etab.code}"`
    );
    if (doubleCheck !== etab.code) {
      alert('Code incorrect. Suppression annulée.');
      return;
    }

    try {
      await deleteMutation.mutateAsync(etab.id);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur');
    }
  };

  const handleReprovisionner = async (etab: Etablissement) => {
    if (
      !confirm(
        `Relancer le provisioning de "${etab.nom}" ?\n\n` +
          `Statut actuel : ${etab.statutProvisionnement}`
      )
    )
      return;
    try {
      await reprovisionMutation.mutateAsync({ id: etab.id });
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur');
    }
  };

  const resetFilters = () => {
    setFilters({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
    setSearchInput('');
  };

  const setPage = (page: number) => {
    setFilters((f) => ({ ...f, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Pagination ---
  const totalPages = data?.pagination.totalPages ?? 1;
  const currentPage = data?.pagination.page ?? 1;

  // ─────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ============================================
          EN-TÊTE
          ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BuildingOfficeIcon className="w-7 h-7 text-red-600" />
            Établissements
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion du catalogue multi-tenant
            {data?.pagination && (
              <span className="ml-1">
                • {data.pagination.total} établissement
                {data.pagination.total > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Rafraîchir"
          >
            <ArrowPathIcon
              className={`w-5 h-5 text-gray-600 ${isFetching ? 'animate-spin' : ''}`}
            />
          </button>
          <Link
            to="/dashboard/etablissements/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            Nouvel établissement
          </Link>
        </div>
      </div>

      {/* ============================================
          STATS RAPIDES
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats?.total ?? '—'}
          icon={BuildingOfficeIcon}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          label="Actifs"
          value={stats?.actifs ?? '—'}
          icon={CheckCircleIcon}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Inactifs"
          value={stats?.inactifs ?? '—'}
          icon={XCircleIcon}
          color="text-gray-600"
          bgColor="bg-gray-100"
        />
        <StatCard
          label="En provisioning"
          value={
            stats?.parProvisionnement?.find(
              (p) => p.statutProvisionnement === 'EN_COURS'
            )?._count._all ?? 0
          }
          icon={ServerIcon}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
      </div>

      {/* ============================================
          RECHERCHE + FILTRES
          ============================================ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, code, ville..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Rechercher
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`px-4 py-2.5 rounded-lg border font-medium transition-colors flex items-center gap-2 ${
                showFilters
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-5 h-5" />
              Filtres
              {Object.keys(filters).filter(
                (k) =>
                  !['page', 'limit', 'sortBy', 'sortOrder', 'search'].includes(k) &&
                  filters[k as keyof ListEtablissementsParams] !== undefined
              ).length > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {
                    Object.keys(filters).filter(
                      (k) =>
                        !['page', 'limit', 'sortBy', 'sortOrder', 'search'].includes(
                          k
                        ) &&
                        filters[k as keyof ListEtablissementsParams] !== undefined
                    ).length
                  }
                </span>
              )}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                {/* Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                    Type
                  </label>
                  <select
                    value={filters.type ?? ''}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        page: 1,
                        type: (e.target.value as any) || undefined,
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="">Tous</option>
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVE">Privé</option>
                    <option value="PRIVE_LAIQUE">Privé laïque</option>
                    <option value="PRIVE_CONFESSIONNEL">Confessionnel</option>
                    <option value="INTERNATIONAL">International</option>
                  </select>
                </div>

                {/* Plan */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                    Plan
                  </label>
                  <select
                    value={filters.planAbonnement ?? ''}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        page: 1,
                        planAbonnement: (e.target.value as any) || undefined,
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="">Tous</option>
                    <option value="GRATUIT">Gratuit</option>
                    <option value="BASIQUE">Basique</option>
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>

                {/* Statut provisioning */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                    Provisioning
                  </label>
                  <select
                    value={filters.statutProvisionnement ?? ''}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        page: 1,
                        statutProvisionnement: (e.target.value as any) || undefined,
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="">Tous</option>
                    <option value="TERMINE">Terminé</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="ECHEC">Échec</option>
                  </select>
                </div>

                {/* Statut actif */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                    Statut
                  </label>
                  <select
                    value={
                      filters.estActif === undefined
                        ? ''
                        : String(filters.estActif)
                    }
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        page: 1,
                        estActif:
                          e.target.value === ''
                            ? undefined
                            : e.target.value === 'true',
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="">Tous</option>
                    <option value="true">Actifs</option>
                    <option value="false">Inactifs</option>
                  </select>
                </div>

                {/* Reset */}
                <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============================================
          TABLEAU
          ============================================ */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement des établissements...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Erreur de chargement</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : !data?.items?.length ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-12 text-center">
          <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Aucun établissement
          </h3>
          <p className="text-gray-500 mb-4">
            {filters.search || filters.type || filters.planAbonnement
              ? 'Aucun résultat pour ces filtres.'
              : 'Commencez par créer votre premier établissement.'}
          </p>
          <Link
            to="/dashboard/etablissements/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <PlusIcon className="w-5 h-5" />
            Créer un établissement
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Établissement
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Localisation
                  </th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Provisioning
                  </th>
                  <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-right px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((etab) => (
                  <motion.tr
                    key={etab.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Établissement */}
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        {etab.logo ? (
                          <img
                            src={etab.logo}
                            alt={etab.nom}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {etab.nom.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {etab.nom}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {etab.code}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Localisation */}
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span>{etab.ville ?? '—'}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{etab.pays}</p>
                    </td>

                    {/* Plan */}
                    <td className="px-4 md:px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${
                          PLAN_COLORS[etab.planAbonnement] ??
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {etab.planAbonnement}
                      </span>
                    </td>

                    {/* Provisioning */}
                    <td className="px-4 md:px-6 py-4 text-center hidden lg:table-cell">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                          STATUT_PROV_COLORS[etab.statutProvisionnement] ??
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {STATUT_PROV_LABELS[etab.statutProvisionnement] ??
                          etab.statutProvisionnement}
                      </span>
                      {etab.erreurProvisionnement && (
                        <p
                          className="text-xs text-red-500 mt-1 truncate max-w-[150px] mx-auto"
                          title={etab.erreurProvisionnement}
                        >
                          ⚠️ Erreur
                        </p>
                      )}
                    </td>

                    {/* Statut actif */}
                    <td className="px-4 md:px-6 py-4 text-center">
                      {etab.estActif ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          <XCircleIcon className="w-3.5 h-3.5" />
                          Inactif
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Voir */}
                        <Link
                          to={`/dashboard/etablissements/${etab.id}`}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Voir le détail"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>

                        {/* Modifier */}
                        <Link
                          to={`/dashboard/etablissements/${etab.id}/editer`}
                          className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Modifier"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </Link>

                        {/* Toggle actif/inactif */}
                        <button
                          onClick={() => handleToggle(etab)}
                          disabled={toggleMutation.isPending}
                          className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50"
                          title={etab.estActif ? 'Désactiver' : 'Activer'}
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>

                        {/* Reprovisionner (si ECHEC) */}
                        {etab.statutProvisionnement === 'ECHEC' && (
                          <button
                            onClick={() => handleReprovisionner(etab)}
                            disabled={reprovisionMutation.isPending}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                            title="Relancer le provisioning"
                          >
                            <ServerIcon className="w-4 h-4" />
                          </button>
                        )}

                        {/* Archiver */}
                        <button
                          onClick={() => handleArchive(etab)}
                          disabled={
                            archiveMutation.isPending || etab.estArchive
                          }
                          className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
                          title="Archiver"
                        >
                          <ArchiveBoxIcon className="w-4 h-4" />
                        </button>

                        {/* Supprimer */}
                        <button
                          onClick={() => handleDelete(etab)}
                          disabled={deleteMutation.isPending}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Supprimer définitivement"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ============================================
              PAGINATION
              ============================================ */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="text-sm text-gray-500">
                Page <strong>{currentPage}</strong> sur <strong>{totalPages}</strong>
                <span className="hidden sm:inline">
                  {' '}
                  • {data.pagination.total} résultat
                  {data.pagination.total > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ============================================
          INFO BAS DE PAGE
          ============================================ */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <Squares2X2Icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <p className="font-semibold mb-0.5">À propos des actions</p>
          <ul className="space-y-0.5 text-blue-700">
            <li>
              • <strong>Désactiver</strong> : l'établissement ne peut plus se
              connecter, mais les données restent intactes.
            </li>
            <li>
              • <strong>Archiver</strong> : masque l'établissement des listes
              actives (réversible).
            </li>
            <li>
              • <strong>Supprimer</strong> : ⚠️ IRRÉVERSIBLE. Refusé si des
              utilisateurs globaux, abonnements ou factures sont liés.
            </li>
            <li>
              • <strong>Reprovisionner</strong> : disponible uniquement si le
              provisioning a échoué.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EtablissementsPage;