// frontend2/src/pages/dashboard/directeur/eleves/ElevesPage.tsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  XMarkIcon,
  AcademicCapIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import {
  useEleves,
  useSoftDeleteEleve,
  useHardDeleteEleve,
} from '../../../../hooks/useEleves';
import type {
  Eleve,
  ListElevesParams,
  StatutEleve,
} from '../../../../types/eleve.types';

// ============================================
// HELPERS
// ============================================

type SortOption = NonNullable<ListElevesParams['sortBy']>;

const STATUT_COLORS: Record<StatutEleve, string> = {
  ACTIF: 'bg-emerald-50 text-emerald-700',
  TRANSFERE: 'bg-blue-50 text-blue-700',
  SORTI: 'bg-gray-100 text-gray-600',
  SUSPENDU: 'bg-orange-50 text-orange-700',
  ARCHIVE: 'bg-red-50 text-red-700',
};

const STATUT_LABELS: Record<StatutEleve, string> = {
  ACTIF: 'Actif',
  TRANSFERE: 'Transféré',
  SORTI: 'Sorti',
  SUSPENDU: 'Suspendu',
  ARCHIVE: 'Archivé',
};

const calculerAge = (dateNaissance: string) => {
  const diff = Date.now() - new Date(dateNaissance).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
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
// SOUS-COMPOSANT : Carte élève (mobile)
// ============================================

interface EleveCardProps {
  eleve: Eleve;
  onSoftDelete: (e: Eleve) => void;
  onHardDelete: (e: Eleve) => void;
  isDeleting: boolean;
}

const EleveCard: React.FC<EleveCardProps> = ({
  eleve,
  onSoftDelete,
  onHardDelete,
  isDeleting,
}) => {
  const classeActuelle = eleve.inscriptions?.[0]?.classe;
  const age = calculerAge(eleve.dateNaissance);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${
        eleve.statut === 'ARCHIVE'
          ? 'border-red-200 bg-red-50/20'
          : 'border-gray-100'
      }`}
    >
      {/* Header */}
      <div className="p-5 pb-3 flex items-start gap-3">
        {eleve.photo ? (
          <img
            src={eleve.photo}
            alt={eleve.nom}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 ${
              eleve.sexe === 'F'
                ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                : 'bg-gradient-to-br from-blue-500 to-indigo-500'
            }`}
          >
            {eleve.prenom.charAt(0)}
            {eleve.nom.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {eleve.prenom} {eleve.nom}
          </h3>
          <p className="text-xs text-gray-500 font-mono">{eleve.matricule}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                STATUT_COLORS[eleve.statut]
              }`}
            >
              {STATUT_LABELS[eleve.statut]}
            </span>
            {eleve.utilisateur ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                <EnvelopeIcon className="w-3 h-3" />
                Compte
              </span>
            ) : (
              <span className="text-xs text-gray-400">Sans compte</span>
            )}
          </div>
        </div>
      </div>

      {/* Infos */}
      <div className="px-5 py-3 border-t border-gray-100 space-y-1.5 text-sm">
        {classeActuelle && (
          <div className="flex items-center gap-2 text-gray-600">
            <AcademicCapIcon className="w-4 h-4 text-gray-400" />
            <strong className="text-gray-900">{classeActuelle.nom}</strong>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-xs">🎂</span>
          <span>
            {age} ans — né{eleve.sexe === 'F' ? 'e' : ''} le{' '}
            {formatDate(eleve.dateNaissance)}
          </span>
        </div>
        {eleve.telephone && (
          <p className="text-gray-600 text-xs flex items-center gap-1.5">
            <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
            {eleve.telephone}
          </p>
        )}
        {eleve.email && (
          <p className="text-gray-600 text-xs truncate flex items-center gap-1.5">
            <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400" />
            {eleve.email}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <Link
          to={`/dashboard/eleves/${eleve.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <EyeIcon className="w-4 h-4" />
          Voir le détail
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to={`/dashboard/eleves/${eleve.id}/editer`}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
            title="Modifier"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </Link>
          {eleve.statut !== 'ARCHIVE' && (
            <button
              onClick={() => onSoftDelete(eleve)}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
              title="Archiver"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onHardDelete(eleve)}
            disabled={isDeleting}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-50"
            title="Supprimer"
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

const ElevesPage: React.FC = () => {
  // Filtres
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<StatutEleve | ''>('');
  const [sexeFilter, setSexeFilter] = useState<'M' | 'F' | ''>('');
  const [hasCompteFilter, setHasCompteFilter] = useState<
    'all' | 'true' | 'false'
  >('all');
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Params API
  const params = useMemo<ListElevesParams>(
    () => ({
      page,
      limit: 12,
      search: search.trim() || undefined,
      statut: statutFilter || (showArchived ? undefined : 'ACTIF'),
      sexe: sexeFilter || undefined,
      hasCompte:
        hasCompteFilter === 'all' ? undefined : hasCompteFilter === 'true',
      sortBy,
      sortOrder,
    }),
    [page, search, statutFilter, sexeFilter, hasCompteFilter, showArchived, sortBy, sortOrder]
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useEleves(params);

  const softDeleteMutation = useSoftDeleteEleve();
  const hardDeleteMutation = useHardDeleteEleve();

  // Données normalisées
  const eleves: Eleve[] = useMemo(() => data?.eleves ?? [], [data]);
  const pagination = data?.pagination;

  // Statistiques rapides
  const stats = useMemo(() => {
    const actifs = eleves.filter((e) => e.statut === 'ACTIF').length;
    const avecCompte = eleves.filter((e) => e.utilisateur).length;
    const sansCompte = eleves.filter((e) => !e.utilisateur).length;
    return { actifs, avecCompte, sansCompte };
  }, [eleves]);

  // Handlers
  const handleSoftDelete = async (eleve: Eleve) => {
    if (
      !confirm(
        `Archiver l'élève "${eleve.prenom} ${eleve.nom}" ?\n\nLe compte sera désactivé et l'élève passera au statut ARCHIVÉ.`
      )
    )
      return;
    try {
      await softDeleteMutation.mutateAsync(eleve.id);
    } catch {
      /* toast géré */
    }
  };

  const handleHardDelete = async (eleve: Eleve) => {
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\n${eleve.prenom} ${eleve.nom}\nMatricule : ${eleve.matricule}\n\nCette action est IRRÉVERSIBLE.\nSi des inscriptions, paiements ou notes existent, la suppression échouera.\n\nContinuer ?`
    );
    if (!confirmed) return;

    setDeletingId(eleve.id);
    try {
      await hardDeleteMutation.mutateAsync(eleve.id);
    } catch {
      /* toast géré */
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatutFilter('');
    setSexeFilter('');
    setHasCompteFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const activeFiltersCount = [
    search,
    statutFilter,
    sexeFilter,
    hasCompteFilter !== 'all' ? 'x' : '',
  ].filter(Boolean).length;

  return (
    <div className="p-6 space-y-5">
      {/* ============================================
          EN-TÊTE
          ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserGroupIcon className="h-7 w-7 text-blue-600" />
            Gestion des élèves
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination?.total ?? 0} élève(s) au total
            {activeFiltersCount > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                ({eleves.length} filtré{eleves.length > 1 ? 's' : ''})
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
            to="/dashboard/classes"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            title="Gérer les classes"
          >
            <AcademicCapIcon className="h-4 w-4" />
            Classes
          </Link>

          <Link
            to="/dashboard/eleves/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvel élève
          </Link>
        </div>
      </div>

      {/* ============================================
          STATISTIQUES RAPIDES
          ============================================ */}
      {!isLoading && !isError && eleves.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Élèves affichés"
            value={eleves.length}
            icon={UserGroupIcon}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            label="Actifs"
            value={stats.actifs}
            icon={CheckCircleIcon}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            label="Avec compte"
            value={stats.avecCompte}
            icon={EnvelopeIcon}
            color="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <StatCard
            label="Sans compte"
            value={stats.sansCompte}
            icon={XCircleIcon}
            color="text-gray-600"
            bgColor="bg-gray-100"
          />
        </div>
      )}

      {/* ============================================
          RECHERCHE + FILTRES
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, matricule, email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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

          {/* Tri */}
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
              <option value="createdAt-desc">Plus récents</option>
              <option value="createdAt-asc">Plus anciens</option>
              <option value="nom-asc">Nom (A → Z)</option>
              <option value="nom-desc">Nom (Z → A)</option>
              <option value="matricule-asc">Matricule (A → Z)</option>
            </select>
          </div>

          {/* Bouton filtres */}
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
            {statutFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                {STATUT_LABELS[statutFilter]}
                <button
                  onClick={() => {
                    setStatutFilter('');
                    setPage(1);
                  }}
                  className="hover:text-emerald-900"
                  title="Retirer"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {sexeFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-50 text-pink-700 text-xs font-medium rounded-full">
                {sexeFilter === 'M' ? '👦 Garçons' : '👧 Filles'}
                <button
                  onClick={() => {
                    setSexeFilter('');
                    setPage(1);
                  }}
                  className="hover:text-pink-900"
                  title="Retirer"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {hasCompteFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                {hasCompteFilter === 'true'
                  ? '✉️ Avec compte'
                  : '⛔ Sans compte'}
                <button
                  onClick={() => {
                    setHasCompteFilter('all');
                    setPage(1);
                  }}
                  className="hover:text-indigo-900"
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Statut
                  </label>
                  <select
                    value={statutFilter}
                    onChange={(e) => {
                      setStatutFilter(e.target.value as StatutEleve | '');
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="ACTIF">Actif</option>
                    <option value="SUSPENDU">Suspendu</option>
                    <option value="TRANSFERE">Transféré</option>
                    <option value="SORTI">Sorti</option>
                    <option value="ARCHIVE">Archivé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Sexe
                  </label>
                  <select
                    value={sexeFilter}
                    onChange={(e) => {
                      setSexeFilter(e.target.value as 'M' | 'F' | '');
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Tous</option>
                    <option value="M">Garçons</option>
                    <option value="F">Filles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Compte
                  </label>
                  <select
                    value={hasCompteFilter}
                    onChange={(e) => {
                      setHasCompteFilter(e.target.value as any);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="all">Tous</option>
                    <option value="true">Avec compte</option>
                    <option value="false">Sans compte</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => {
                      setShowArchived(e.target.checked);
                      setPage(1);
                    }}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  Inclure les élèves archivés
                </label>
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
                <div className="h-14 w-14 bg-gray-100 rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold">Erreur de chargement</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Impossible de charger les élèves.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : eleves.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-4">
            <UserGroupIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Aucun élève
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {activeFiltersCount > 0
              ? 'Aucun élève ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre premier élève.'}
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
              to="/dashboard/eleves/nouveau"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Créer mon premier élève
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {eleves.map((eleve: Eleve) => (
              <EleveCard
                key={eleve.id}
                eleve={eleve}
                onSoftDelete={handleSoftDelete}
                onHardDelete={handleHardDelete}
                isDeleting={deletingId === eleve.id}
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
            élève(s)
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

export default ElevesPage;