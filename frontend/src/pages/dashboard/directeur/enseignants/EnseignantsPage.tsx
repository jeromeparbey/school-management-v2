// frontend2/src/pages/dashboard/directeur/enseignants/EnseignantsPage.tsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
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
  BanknotesIcon,
  BriefcaseIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import {
  useEnseignants,
  useSoftDeleteEnseignant,
  useHardDeleteEnseignant,
} from '../../../../hooks/useEnseignants';
import type {
  Enseignant,
  ListEnseignantsParams,
} from '../../../../types/enseignant.types';

// ============================================
// HELPERS
// ============================================

type SortOption = NonNullable<ListEnseignantsParams['sortBy']>;

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatMoneyShort = (amount: number) => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
  return `${amount}`;
};

const CONTRAT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  CDI: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'CDI' },
  CDD: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'CDD' },
  VACATAIRE: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Vacataire' },
  STAGE: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Stage' },
};

const getContratStyle = (typeContrat: string) =>
  CONTRAT_COLORS[typeContrat.toUpperCase()] ?? {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    label: typeContrat,
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
// SOUS-COMPOSANT : Carte enseignant
// ============================================

interface EnseignantCardProps {
  enseignant: Enseignant;
  onSoftDelete: (e: Enseignant) => void;
  onHardDelete: (e: Enseignant) => void;
  isDeleting: boolean;
}

const EnseignantCard: React.FC<EnseignantCardProps> = ({
  enseignant,
  onSoftDelete,
  onHardDelete,
  isDeleting,
}) => {
  const contratStyle = getContratStyle(enseignant.typeContrat);
  const nbAffectations = enseignant._count?.affectations ?? 0;
  const nbClasses = nbAffectations; // approximation

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${
        enseignant.estArchive
          ? 'border-orange-200 bg-orange-50/20'
          : 'border-gray-100'
      }`}
    >
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-3">
          {enseignant.photo ? (
            <img
              src={enseignant.photo}
              alt={enseignant.nom}
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 ${
                enseignant.sexe === 'F'
                  ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-500'
              }`}
            >
              {enseignant.prenom.charAt(0)}
              {enseignant.nom.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {enseignant.prenom} {enseignant.nom}
            </h3>
            <p className="text-xs text-gray-500 font-mono">
              {enseignant.matricule}
            </p>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${contratStyle.bg} ${contratStyle.text}`}
              >
                <BriefcaseIcon className="w-3 h-3" />
                {contratStyle.label}
              </span>

              {enseignant.estArchive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                  <XCircleIcon className="w-3 h-3" />
                  Archivé
                </span>
              ) : enseignant.estActif ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  <CheckCircleIcon className="w-3 h-3" />
                  Actif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  <XCircleIcon className="w-3 h-3" />
                  Inactif
                </span>
              )}

              {enseignant.utilisateur ? (
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
      </div>

      {/* Spécialité */}
      {enseignant.specialite && (
        <div className="px-5 pb-3">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Spécialité :</span>{' '}
            {enseignant.specialite}
          </p>
          {enseignant.qualification && (
            <p className="text-xs text-gray-500 mt-0.5">
              🎓 {enseignant.qualification}
            </p>
          )}
        </div>
      )}

      {/* Contacts */}
      <div className="px-5 py-3 border-t border-gray-100 space-y-1.5 text-sm">
        {enseignant.telephone && (
          <p className="text-gray-600 text-xs flex items-center gap-1.5">
            <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
            {enseignant.telephone}
          </p>
        )}
        {enseignant.email && (
          <p className="text-gray-600 text-xs truncate flex items-center gap-1.5">
            <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400" />
            {enseignant.email}
          </p>
        )}
      </div>

      {/* Stats mini */}
      <div className="px-5 py-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-gray-500">Salaire</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">
            {formatMoneyShort(enseignant.salaireBase)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Affectations</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">
            {nbAffectations}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Notes</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">
            {enseignant._count?.notes ?? 0}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <Link
          to={`/dashboard/enseignants/${enseignant.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <EyeIcon className="w-4 h-4" />
          Voir
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to={`/dashboard/enseignants/${enseignant.id}/editer`}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
            title="Modifier"
            aria-label={`Modifier ${enseignant.prenom} ${enseignant.nom}`}
          >
            <PencilSquareIcon className="w-4 h-4" />
          </Link>

          {!enseignant.estArchive && (
            <button
              onClick={() => onSoftDelete(enseignant)}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
              title="Archiver"
              aria-label={`Archiver ${enseignant.prenom} ${enseignant.nom}`}
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onHardDelete(enseignant)}
            disabled={isDeleting}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-50"
            title="Supprimer définitivement"
            aria-label={`Supprimer ${enseignant.prenom} ${enseignant.nom}`}
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

const EnseignantsPage: React.FC = () => {
  // Filtres
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<
    'all' | 'actif' | 'inactif'
  >('all');
  const [contratFilter, setContratFilter] = useState('');
  const [hasCompteFilter, setHasCompteFilter] = useState<
    'all' | 'true' | 'false'
  >('all');
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Params API
  const params = useMemo<ListEnseignantsParams>(
    () => ({
      page,
      limit: 12,
      search: search.trim() || undefined,
      estActif:
        statutFilter === 'all' ? undefined : statutFilter === 'actif',
      estArchive: showArchived ? undefined : false,
      typeContrat: contratFilter || undefined,
      hasCompte:
        hasCompteFilter === 'all' ? undefined : hasCompteFilter === 'true',
      sortBy,
      sortOrder,
    }),
    [
      page,
      search,
      statutFilter,
      contratFilter,
      hasCompteFilter,
      showArchived,
      sortBy,
      sortOrder,
    ]
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useEnseignants(params);

  const softDeleteMutation = useSoftDeleteEnseignant();
  const hardDeleteMutation = useHardDeleteEnseignant();

  // Données normalisées
  const enseignants: Enseignant[] = useMemo(
    () => data?.enseignants ?? [],
    [data]
  );
  const pagination = data?.pagination;

  // Stats
  const stats = useMemo(() => {
    const actifs = enseignants.filter((e) => e.estActif && !e.estArchive).length;
    const masseSalariale = enseignants.reduce(
      (sum, e) => sum + (e.salaireBase ?? 0),
      0
    );
    const avecCompte = enseignants.filter((e) => e.utilisateur).length;
    return { actifs, masseSalariale, avecCompte };
  }, [enseignants]);

  // Handlers
  const handleSoftDelete = async (enseignant: Enseignant) => {
    if (
      !confirm(
        `Archiver "${enseignant.prenom} ${enseignant.nom}" ?\n\nLe compte sera désactivé et l'enseignant ne pourra plus se connecter.`
      )
    )
      return;
    try {
      await softDeleteMutation.mutateAsync(enseignant.id);
    } catch {
      /* toast géré */
    }
  };

  const handleHardDelete = async (enseignant: Enseignant) => {
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\n${enseignant.prenom} ${enseignant.nom}\nMatricule : ${enseignant.matricule}\n\nCette action est IRRÉVERSIBLE.\nSi des affectations, notes ou paies existent, la suppression échouera.\n\nContinuer ?`
    );
    if (!confirmed) return;

    setDeletingId(enseignant.id);
    try {
      await hardDeleteMutation.mutateAsync(enseignant.id);
    } catch {
      /* toast géré */
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatutFilter('all');
    setContratFilter('');
    setHasCompteFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const activeFiltersCount = [
    search,
    statutFilter !== 'all' ? 'x' : '',
    contratFilter,
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
            <AcademicCapIcon className="h-7 w-7 text-indigo-600" />
            Gestion des enseignants
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination?.total ?? 0} enseignant(s) au total
            {activeFiltersCount > 0 && (
              <span className="ml-2 text-indigo-600 font-medium">
                ({enseignants.length} filtré
                {enseignants.length > 1 ? 's' : ''})
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
            <BuildingOfficeIcon className="h-4 w-4" />
            Classes
          </Link>

          <Link
            to="/dashboard/enseignants/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvel enseignant
          </Link>
        </div>
      </div>

      {/* ============================================
          STATISTIQUES
          ============================================ */}
      {!isLoading && !isError && enseignants.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Enseignants affichés"
            value={enseignants.length}
            icon={AcademicCapIcon}
            color="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <StatCard
            label="Actifs"
            value={stats.actifs}
            icon={CheckCircleIcon}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            label="Masse salariale"
            value={formatMoneyShort(stats.masseSalariale)}
            icon={BanknotesIcon}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
          <StatCard
            label="Avec compte"
            value={stats.avecCompte}
            icon={EnvelopeIcon}
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
          {/* Recherche */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, matricule, email, spécialité…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
              className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
              title="Trier par"
            >
              <option value="createdAt-desc">Plus récents</option>
              <option value="createdAt-asc">Plus anciens</option>
              <option value="nom-asc">Nom (A → Z)</option>
              <option value="nom-desc">Nom (Z → A)</option>
              <option value="matricule-asc">Matricule (A → Z)</option>
              <option value="dateEmbauche-desc">Embauche (récent)</option>
              <option value="dateEmbauche-asc">Embauche (ancien)</option>
            </select>
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              activeFiltersCount > 0
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            aria-expanded={showFilters}
          >
            <FunnelIcon className="h-4 w-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Badges filtres actifs */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                🔍 "{search}"
                <button
                  onClick={() => {
                    setSearch('');
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
                {statutFilter === 'actif' ? '✅ Actifs' : '⛔ Inactifs'}
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
            {contratFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                💼 {contratFilter}
                <button
                  onClick={() => {
                    setContratFilter('');
                    setPage(1);
                  }}
                  className="hover:text-blue-900"
                  title="Retirer"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {hasCompteFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                {hasCompteFilter === 'true'
                  ? '✉️ Avec compte'
                  : '⛔ Sans compte'}
                <button
                  onClick={() => {
                    setHasCompteFilter('all');
                    setPage(1);
                  }}
                  className="hover:text-purple-900"
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
                      setStatutFilter(e.target.value as any);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="all">Tous</option>
                    <option value="actif">Actifs</option>
                    <option value="inactif">Inactifs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Type de contrat
                  </label>
                  <select
                    value={contratFilter}
                    onChange={(e) => {
                      setContratFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Tous</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="VACATAIRE">Vacataire</option>
                    <option value="STAGE">Stage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Compte utilisateur
                  </label>
                  <select
                    value={hasCompteFilter}
                    onChange={(e) => {
                      setHasCompteFilter(e.target.value as any);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  Inclure les enseignants archivés
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Indicateur rafraîchissement */}
      {isFetching && !isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <ArrowPathIcon className="h-4 w-4 animate-spin text-indigo-600" />
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
              'Impossible de charger les enseignants.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      ) : enseignants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-full mb-4">
            <AcademicCapIcon className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Aucun enseignant
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {activeFiltersCount > 0
              ? 'Aucun enseignant ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre premier enseignant.'}
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
              to="/dashboard/enseignants/nouveau"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Créer mon premier enseignant
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {enseignants.map((e: Enseignant) => (
              <EnseignantCard
                key={e.id}
                enseignant={e}
                onSoftDelete={handleSoftDelete}
                onHardDelete={handleHardDelete}
                isDeleting={deletingId === e.id}
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
            enseignant(s)
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
                      ? 'bg-indigo-600 text-white border-indigo-600'
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

export default EnseignantsPage;