// frontend2/src/pages/dashboard/directeur/classes/ClassesPage.tsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ArchiveBoxIcon,
  EyeIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowsUpDownIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  useClasses,
  useSoftDeleteClasse,
  useHardDeleteClasse,
} from '../../../../hooks/useClasses';
import { useNiveaux } from '../../../../hooks/useNiveaux';
import type {
  Classe,
  ListClassesParams,
} from '../../../../types/classe.types';
import type { Niveau } from '../../../../types/niveau.types';

// ============================================
// TYPES
// ============================================

type SortOption = NonNullable<ListClassesParams['sortBy']>;

// ============================================
// SOUS-COMPOSANT : Carte classe
// ============================================

interface ClasseCardProps {
  classe: Classe;
  onSoftDelete: (c: Classe) => void;
  onHardDelete: (c: Classe) => void;
  isDeleting: boolean;
}

const ClasseCard: React.FC<ClasseCardProps> = ({
  classe,
  onSoftDelete,
  onHardDelete,
  isDeleting,
}) => {
  const effectif = classe._count?.inscriptions ?? 0;
  const capacite = classe.capacite ?? 0;
  const taux = capacite > 0 ? Math.round((effectif / capacite) * 100) : 0;

  const tauxColor =
    taux > 90
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : taux > 75
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`group bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all ${
        classe.estArchive
          ? 'border-orange-200 bg-orange-50/20'
          : 'border-gray-100 hover:border-emerald-200'
      }`}
    >
      {/* Header carte */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-3">
          {/* Icône dans carré gradient */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
              classe.estArchive
                ? 'bg-gradient-to-br from-orange-400 to-amber-500'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
            }`}
          >
            <BuildingOfficeIcon className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {classe.nom}
              </h3>
              {classe.estArchive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase rounded-full">
                  <ArchiveBoxIcon className="w-3 h-3" />
                  Archivée
                </span>
              )}
              {!classe.estArchive && !classe.estActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-full">
                  <XCircleIcon className="w-3 h-3" />
                  Inactive
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {classe.code} • {classe.niveau?.nom ?? 'Sans niveau'}
            </p>
          </div>

          {capacite > 0 && (
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full border ${tauxColor} flex-shrink-0`}
            >
              {taux}%
            </span>
          )}
        </div>
      </div>

      {/* Infos */}
      <div className="px-5 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <UserGroupIcon className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>
            <strong className="text-gray-900">{effectif}</strong>
            {capacite > 0 ? ` / ${capacite}` : ''} élève
            {effectif > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <BuildingOfficeIcon className="h-4 w-4 text-gray-400 shrink-0" />
          <span>
            {classe.salle ? (
              <>
                Salle{' '}
                <strong className="text-gray-900">{classe.salle}</strong>
              </>
            ) : (
              <span className="text-gray-400 italic">Salle non définie</span>
            )}
          </span>
        </div>

        {classe.anneeScolaire && (
          <div className="flex items-center gap-2 text-gray-600">
            <AcademicCapIcon className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate">
              {classe.anneeScolaire.nom}
              {classe.anneeScolaire.estActive && (
                <span className="ml-1 text-xs text-emerald-600 font-medium">
                  (active)
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-4 mt-3 border-t border-gray-100 flex items-center justify-between">
        <Link
          to={`/dashboard/classes/${classe.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <EyeIcon className="h-4 w-4" />
          Voir le détail
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to={`/dashboard/classes/${classe.id}/editer`}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Modifier"
            aria-label={`Modifier ${classe.nom}`}
          >
            <PencilSquareIcon className="h-4 w-4" />
          </Link>

          {!classe.estArchive && (
            <button
              onClick={() => onSoftDelete(classe)}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Archiver"
              aria-label={`Archiver ${classe.nom}`}
            >
              <ArchiveBoxIcon className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => onHardDelete(classe)}
            disabled={isDeleting}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
            title="Supprimer définitivement"
            aria-label={`Supprimer ${classe.nom}`}
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
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
  >
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-1 truncate">
          {value}
        </p>
      </div>
      <div className={`p-2.5 rounded-xl ${bgColor} shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </motion.div>
);

// ============================================
// PAGE PRINCIPALE
// ============================================

const ClassesPage: React.FC = () => {
  // Filtres
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [niveauFilter, setNiveauFilter] = useState('');
  const [estActiveFilter, setEstActiveFilter] = useState<
    'all' | 'true' | 'false'
  >('all');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Niveaux
  const { data: niveauxData } = useNiveaux({ limit: 200 });
  const niveaux: Niveau[] = useMemo(
    () => niveauxData?.niveaux ?? [],
    [niveauxData]
  );

  // Params API
  const params = useMemo<ListClassesParams>(
    () => ({
      page,
      limit: 12,
      search: search.trim() || undefined,
      niveauId: niveauFilter || undefined,
      estActive:
        estActiveFilter === 'all' ? undefined : estActiveFilter === 'true',
      sortBy,
      sortOrder,
    }),
    [page, search, niveauFilter, estActiveFilter, sortBy, sortOrder]
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useClasses(params);

  const softDeleteMutation = useSoftDeleteClasse();
  const hardDeleteMutation = useHardDeleteClasse();

  const classes: Classe[] = useMemo(() => data?.classes ?? [], [data]);
  const pagination = data?.pagination;

  // Statistiques rapides
  const stats = useMemo(() => {
    const totalCapacite = classes.reduce(
      (sum, c) => sum + (c.capacite ?? 0),
      0
    );
    const totalEffectif = classes.reduce(
      (sum, c) => sum + (c._count?.inscriptions ?? 0),
      0
    );
    const actives = classes.filter(
      (c) => c.estActive && !c.estArchive
    ).length;

    return {
      totalCapacite,
      totalEffectif,
      actives,
    };
  }, [classes]);

  // Handlers
  const handleSoftDelete = async (classe: Classe) => {
    if (
      !confirm(
        `Archiver la classe "${classe.nom}" ?\n\nLes inscriptions actives doivent être retirées avant.`
      )
    )
      return;
    try {
      await softDeleteMutation.mutateAsync(classe.id);
    } catch {
      /* toast géré */
    }
  };

  const handleHardDelete = async (classe: Classe) => {
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nClasse : ${classe.nom}\nCode : ${classe.code}\n\nCette action est IRRÉVERSIBLE.\n\nContinuer ?`
    );
    if (!confirmed) return;

    const doubleCheck = prompt(
      `Pour confirmer, tapez le code : "${classe.code}"`
    );
    if (doubleCheck !== classe.code) {
      alert('Code incorrect. Suppression annulée.');
      return;
    }

    setDeletingId(classe.id);
    try {
      await hardDeleteMutation.mutateAsync(classe.id);
    } catch {
      /* toast géré */
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setNiveauFilter('');
    setEstActiveFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const activeFiltersCount = [
    search,
    niveauFilter,
    estActiveFilter !== 'all' ? 'x' : '',
  ].filter(Boolean).length;

  const selectedNiveau = niveaux.find((n) => n.id === niveauFilter);

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* ============================================
          EN-TÊTE
          ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <BuildingOfficeIcon className="w-6 h-6" />
            </div>
            Gestion des classes
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {pagination?.total ?? 0} classe(s) au total
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                <SparklesIcon className="w-3 h-3" />
                {classes.length} filtrée{classes.length > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Rafraîchir */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Rafraîchir"
            aria-label="Rafraîchir la liste"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
          </button>

          {/* Niveaux */}
          <Link
            to="/dashboard/niveaux"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            title="Gérer les niveaux"
          >
            <AcademicCapIcon className="h-4 w-4" />
            Niveaux
          </Link>

          {/* Nouvelle classe */}
          <Link
            to="/dashboard/classes/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvelle classe
          </Link>
        </div>
      </div>

      {/* ============================================
          STATISTIQUES RAPIDES
          ============================================ */}
      {!isLoading && !isError && classes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Classes affichées"
            value={classes.length}
            icon={BuildingOfficeIcon}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            label="Actives"
            value={stats.actives}
            icon={CheckCircleIcon}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            label="Élèves inscrits"
            value={stats.totalEffectif}
            icon={UserGroupIcon}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            label="Capacité totale"
            value={stats.totalCapacite || '—'}
            icon={AcademicCapIcon}
            color="text-teal-600"
            bgColor="bg-teal-50"
          />
        </div>
      )}

      {/* ============================================
          RECHERCHE + FILTRES
          ============================================ */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher par nom, code ou salle…"
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
                title="Effacer la recherche"
                aria-label="Effacer la recherche"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tri */}
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
              title="Trier par"
            >
              <option value="createdAt-desc">Plus récentes</option>
              <option value="createdAt-asc">Plus anciennes</option>
              <option value="nom-asc">Nom (A → Z)</option>
              <option value="nom-desc">Nom (Z → A)</option>
              <option value="capacite-desc">Capacité (décroissante)</option>
              <option value="capacite-asc">Capacité (croissante)</option>
            </select>
          </div>

          {/* Bouton filtres */}
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

        {/* Badges des filtres actifs */}
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
                  title="Retirer ce filtre"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedNiveau && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-200">
                🎓 {selectedNiveau.nom}
                <button
                  onClick={() => {
                    setNiveauFilter('');
                    setPage(1);
                  }}
                  className="hover:text-teal-900"
                  title="Retirer ce filtre"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {estActiveFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                {estActiveFilter === 'true' ? '✅ Actives' : '⛔ Inactives'}
                <button
                  onClick={() => {
                    setEstActiveFilter('all');
                    setPage(1);
                  }}
                  className="hover:text-emerald-900"
                  title="Retirer ce filtre"
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
                    Niveau
                  </label>
                  <select
                    value={niveauFilter}
                    onChange={(e) => {
                      setNiveauFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  >
                    <option value="">Tous les niveaux</option>
                    {niveaux.map((n: Niveau) => (
                      <option key={n.id} value={n.id}>
                        {n.ordre}. {n.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Statut
                  </label>
                  <select
                    value={estActiveFilter}
                    onChange={(e) => {
                      setEstActiveFilter(e.target.value as any);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  >
                    <option value="all">Toutes</option>
                    <option value="true">Actives</option>
                    <option value="false">Inactives</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={resetFilters}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Indicateur rafraîchissement */}
      {isFetching && !isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <ArrowPathIcon className="h-4 w-4 animate-spin text-emerald-600" />
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl" />
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
              'Impossible de charger les classes.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4">
            <BuildingOfficeIcon className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Aucune classe
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {activeFiltersCount > 0
              ? 'Aucune classe ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre première classe pour organiser vos élèves.'}
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
              to="/dashboard/classes/nouveau"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-semibold shadow-md shadow-emerald-500/20 transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              Créer ma première classe
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {classes.map((classe: Classe) => (
              <ClasseCard
                key={classe.id}
                classe={classe}
                onSoftDelete={handleSoftDelete}
                onHardDelete={handleHardDelete}
                isDeleting={deletingId === classe.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ============================================
          PAGINATION
          ============================================ */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <p className="text-sm text-gray-500">
            Page <strong className="text-gray-900">{pagination.page}</strong> sur{' '}
            <strong className="text-gray-900">{pagination.totalPages}</strong> —{' '}
            {pagination.total} classe(s) au total
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Première page"
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
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
            <button
              onClick={() => setPage(pagination.totalPages)}
              disabled={page >= pagination.totalPages}
              className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

export default ClassesPage;