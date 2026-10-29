// frontend2/src/pages/dashboard/directeur/matieres/MatieresPage.tsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpenIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  AcademicCapIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  FolderOpenIcon,
  UsersIcon,
  PresentationChartLineIcon,
  UserPlusIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import {
  useMatieres,
  useSoftDeleteMatiere,
  useHardDeleteMatiere,
} from '../../../../hooks/useMatieres';
import { useNiveaux } from '../../../../hooks/useNiveaux';
import type {
  Matiere,
  ListMatieresParams,
} from '../../../../types/matiere.types';

// ============================================
// HELPERS
// ============================================

type SortOption = NonNullable<ListMatieresParams['sortBy']>;

function extractList<T = any>(res: any, preferredKeys: string[] = []): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  for (const key of preferredKeys) {
    if (Array.isArray(res[key])) return res[key] as T[];
  }
  for (const key of ['data', 'items', 'results']) {
    if (Array.isArray(res[key])) return res[key] as T[];
  }
  return [];
}

// ============================================
// STAT CARD
// ============================================

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
  <div className="bg-white rounded-xl border border-gray-100 p-4">
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1 truncate">
          {value}
        </p>
        {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className={`p-2 rounded-lg ${bgColor} shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

// ============================================
// CARTE MATIÈRE — THÈME VERT
// ============================================

interface MatiereCardProps {
  matiere: Matiere;
  onSoftDelete: (m: Matiere) => void;
  onHardDelete: (m: Matiere) => void;
  isDeleting: boolean;
}

const MatiereCard: React.FC<MatiereCardProps> = ({
  matiere,
  onSoftDelete,
  onHardDelete,
  isDeleting,
}) => {
  const counts = matiere._count ?? {
    notes: 0,
    affectations: 0,
    emploisTemps: 0,
    reglesEvaluation: 0,
    documents: 0,
    groupesTD: 0,
  };
  const nbProfesseurs = counts.affectations;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${
        matiere.estArchive
          ? 'border-orange-200 bg-orange-50/20'
          : !matiere.estActive
          ? 'border-gray-300 bg-gray-50/30'
          : 'border-gray-100'
      }`}
    >
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-3">
          {/* ✅ Dégradé vert (au lieu du violet) */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <BookOpenIcon className="w-7 h-7" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {matiere.nom}
            </h3>
            <p className="text-xs text-gray-500 font-mono">{matiere.code}</p>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {matiere.niveau && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                  <AcademicCapIcon className="w-3 h-3" />
                  {matiere.niveau.nom}
                </span>
              )}

              {matiere.estArchive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                  <XCircleIcon className="w-3 h-3" />
                  Archivée
                </span>
              ) : matiere.estActive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  <CheckCircleIcon className="w-3 h-3" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  <XCircleIcon className="w-3 h-3" />
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {matiere.description && (
        <div className="px-5 pb-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {matiere.description}
          </p>
        </div>
      )}

      {/* Détails pédagogiques */}
      <div className="px-5 py-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-gray-600">
          <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
          <span>
            Durée :{' '}
            <strong className="text-gray-900">
              {matiere.dureeCours ?? 60} min
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <AcademicCapIcon className="w-3.5 h-3.5 text-gray-400" />
          <span>
            Coef.{' '}
            <strong className="text-gray-900">
              {matiere.coefficient ?? '—'}
            </strong>
          </span>
        </div>
      </div>

      {/* Profs & Activité */}
      <div className="px-5 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">
          Enseignants & Activité
        </p>
        <div className="grid grid-cols-3 gap-2">
          {/* ✅ Vert au lieu d'indigo */}
          <div className="text-center bg-emerald-50 rounded-lg py-2">
            <p className="text-lg font-bold text-emerald-700">
              {nbProfesseurs}
            </p>
            <p className="text-[10px] text-emerald-600 font-medium">
              Professeur{nbProfesseurs > 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-center bg-green-50 rounded-lg py-2">
            <p className="text-lg font-bold text-green-700">
              {counts.notes}
            </p>
            <p className="text-[10px] text-green-600 font-medium">Notes</p>
          </div>
          <div className="text-center bg-teal-50 rounded-lg py-2">
            <p className="text-lg font-bold text-teal-700">
              {counts.emploisTemps}
            </p>
            <p className="text-[10px] text-teal-600 font-medium">Créneaux</p>
          </div>
        </div>

        {/* Autres compteurs compacts */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
          <span title="Règles d'évaluation">
            📋 {counts.reglesEvaluation} règle(s)
          </span>
          <span title="Documents">
            📄 {counts.documents} doc(s)
          </span>
          <span title="Groupes TD">
            👥 {counts.groupesTD} groupe(s)
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        {/* ✅ Lien "Voir" en vert */}
        <Link
          to={`/dashboard/matieres/${matiere.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          <EyeIcon className="w-4 h-4" />
          Voir
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to={`/dashboard/matieres/${matiere.id}/editer`}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
            title="Modifier"
            aria-label={`Modifier ${matiere.nom}`}
          >
            <PencilSquareIcon className="w-4 h-4" />
          </Link>

          {!matiere.estArchive && (
            <button
              onClick={() => onSoftDelete(matiere)}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
              title="Archiver"
              aria-label={`Archiver ${matiere.nom}`}
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onHardDelete(matiere)}
            disabled={isDeleting}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-50"
            title="Supprimer définitivement"
            aria-label={`Supprimer ${matiere.nom}`}
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

const MatieresPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [niveauFilter, setNiveauFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState<
    'all' | 'actif' | 'inactif'
  >('all');
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Référentiel niveaux
  const { data: niveauxData } = useNiveaux({ limit: 100 });
  const niveaux = useMemo(
    () => extractList<any>(niveauxData, ['niveaux', 'data']),
    [niveauxData]
  );

  // Params API
  const params = useMemo<ListMatieresParams>(
    () => ({
      page,
      limit: 12,
      search: search.trim() || undefined,
      niveauId: niveauFilter || undefined,
      estActive:
        statutFilter === 'all' ? undefined : statutFilter === 'actif',
      estArchive: showArchived ? undefined : false,
      sortBy,
      sortOrder,
    }),
    [
      page,
      search,
      niveauFilter,
      statutFilter,
      showArchived,
      sortBy,
      sortOrder,
    ]
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useMatieres(params);

  const softDeleteMutation = useSoftDeleteMatiere();
  const hardDeleteMutation = useHardDeleteMatiere();

  const matieres: Matiere[] = data?.matieres ?? [];
  const pagination = data?.pagination;

  // Stats globales
  const stats = useMemo(() => {
    const actives = matieres.filter((m) => m.estActive && !m.estArchive).length;
    const totalProfs = matieres.reduce(
      (s, m) => s + (m._count?.affectations ?? 0),
      0
    );
    const totalNotes = matieres.reduce(
      (s, m) => s + (m._count?.notes ?? 0),
      0
    );
    const totalCreneaux = matieres.reduce(
      (s, m) => s + (m._count?.emploisTemps ?? 0),
      0
    );
    return { actives, totalProfs, totalNotes, totalCreneaux };
  }, [matieres]);

  // Handlers
  const handleSoftDelete = async (matiere: Matiere) => {
    if (
      !confirm(
        `Archiver la matière "${matiere.nom}" ?\n\nElle ne sera plus disponible pour les affectations et notes.`
      )
    )
      return;
    try {
      await softDeleteMutation.mutateAsync(matiere.id);
    } catch {
      /* toast géré */
    }
  };

  const handleHardDelete = async (matiere: Matiere) => {
    const nbNotes = matiere._count?.notes ?? 0;
    const nbAffectations = matiere._count?.affectations ?? 0;

    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\n${matiere.nom} (${matiere.code})\n\n${
        nbNotes > 0 || nbAffectations > 0
          ? `⚠️ Cette matière a ${nbNotes} note(s) et ${nbAffectations} affectation(s).\nLa suppression échouera — utilisez "Archiver".\n\n`
          : ''
      }Cette action est IRRÉVERSIBLE.\n\nContinuer ?`
    );
    if (!confirmed) return;

    setDeletingId(matiere.id);
    try {
      await hardDeleteMutation.mutateAsync(matiere.id);
    } catch {
      /* toast géré */
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setNiveauFilter('');
    setStatutFilter('all');
    setSortBy('nom');
    setSortOrder('asc');
    setPage(1);
  };

  const activeFiltersCount = [
    search,
    niveauFilter,
    statutFilter !== 'all' ? 'x' : '',
  ].filter(Boolean).length;

  const niveauLabel = niveaux.find((n: any) => n.id === niveauFilter)?.nom;

  return (
    <div className="p-6 space-y-5">
      {/* ============================================
          EN-TÊTE — THÈME VERT
          ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpenIcon className="h-7 w-7 text-emerald-600" />
            Gestion des matières
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination?.total ?? 0} matière(s) au total
            {activeFiltersCount > 0 && (
              <span className="ml-2 text-emerald-600 font-medium">
                ({matieres.length} filtrée{matieres.length > 1 ? 's' : ''})
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
            to="/dashboard/niveaux"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            title="Gérer les niveaux"
          >
            <AcademicCapIcon className="h-4 w-4" />
            Niveaux
          </Link>

          {/* ✅ Bouton CTA en vert */}
          <Link
            to="/dashboard/matieres/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvelle matière
          </Link>
        </div>
      </div>

      {/* ============================================
          STATISTIQUES — THÈME VERT
          ============================================ */}
      {!isLoading && !isError && matieres.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Matières affichées"
            value={matieres.length}
            icon={BookOpenIcon}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            label="Actives"
            value={stats.actives}
            icon={CheckCircleIcon}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            label="Professeurs impliqués"
            value={stats.totalProfs}
            icon={UsersIcon}
            color="text-teal-600"
            bgColor="bg-teal-50"
            hint="cumul des affectations"
          />
          <StatCard
            label="Notes totales"
            value={stats.totalNotes}
            icon={DocumentTextIcon}
            color="text-lime-600"
            bgColor="bg-lime-50"
            hint={`${stats.totalCreneaux} créneau(x)`}
          />
        </div>
      )}

      {/* ============================================
          RECHERCHE + FILTRES — THÈME VERT
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, code, description…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
              className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
              title="Trier par"
            >
              <option value="nom-asc">Nom (A → Z)</option>
              <option value="nom-desc">Nom (Z → A)</option>
              <option value="code-asc">Code (A → Z)</option>
              <option value="coefficient-desc">Coefficient (décroissant)</option>
              <option value="coefficient-asc">Coefficient (croissant)</option>
              <option value="createdAt-desc">Plus récentes</option>
              <option value="createdAt-asc">Plus anciennes</option>
            </select>
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
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
          <div className="flex flex-wrap gap-2 mt-3">
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                🔍 "{search}"
                <button
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="hover:text-emerald-900"
                  title="Retirer"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {niveauFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                🎓 {niveauLabel ?? 'Niveau'}
                <button
                  onClick={() => {
                    setNiveauFilter('');
                    setPage(1);
                  }}
                  className="hover:text-green-900"
                  title="Retirer"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {statutFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
                {statutFilter === 'actif' ? '✅ Actives' : '⛔ Inactives'}
                <button
                  onClick={() => {
                    setStatutFilter('all');
                    setPage(1);
                  }}
                  className="hover:text-teal-900"
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
                    Niveau
                  </label>
                  <select
                    value={niveauFilter}
                    onChange={(e) => {
                      setNiveauFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">Tous les niveaux</option>
                    {niveaux.map((n: any) => (
                      <option key={n.id} value={n.id}>
                        {n.nom}
                      </option>
                    ))}
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
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="all">Tous</option>
                    <option value="actif">Actives</option>
                    <option value="inactif">Inactives</option>
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
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  Inclure les matières archivées
                </label>
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
              'Impossible de charger les matières.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : matieres.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4">
            <BookOpenIcon className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Aucune matière
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {activeFiltersCount > 0
              ? 'Aucune matière ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre première matière.'}
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
              to="/dashboard/matieres/nouveau"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Créer ma première matière
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {matieres.map((m: Matiere) => (
              <MatiereCard
                key={m.id}
                matiere={m}
                onSoftDelete={handleSoftDelete}
                onHardDelete={handleHardDelete}
                isDeleting={deletingId === m.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ============================================
          PAGINATION — THÈME VERT
          ============================================ */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Page <strong>{pagination.page}</strong> sur{' '}
            <strong>{pagination.totalPages}</strong> — {pagination.total}{' '}
            matière(s)
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
                      ? 'bg-emerald-600 text-white border-emerald-600'
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

export default MatieresPage;