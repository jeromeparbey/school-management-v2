// frontend2/src/pages/dashboard/directeur/echeances/EcheanceDetailPage.tsx

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ReceiptPercentIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
  IdentificationIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ReceiptRefundIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {
  useEcheance,
  useEcheanceEleves,
  useHardDeleteEcheance,
} from '../../../../hooks/useEcheance';
import type {
  EleveEcheance,
  StatutEleveEcheance,
  StatutGlobalEcheance,
} from '../../../../types/echeance.types';

// ============================================
// HELPERS
// ============================================

/** 💰 Formate en Francs CFA — jamais XOF/XAF affiché */
const formatMoney = (amount: number | null | undefined) => {
  if (amount == null) return '0 F CFA';
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' F CFA';
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTime = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const joursRestants = (dateLimite: string): number => {
  const diff = new Date(dateLimite).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const MOYENS_LABEL: Record<string, string> = {
  ESPECES: 'Espèces',
  VIREMENT: 'Virement',
  MOBILE_MONEY: 'Mobile Money',
  CARTE: 'Carte',
  CHEQUE: 'Chèque',
  AUTRE: 'Autre',
};

const STATUT_ELEVE_META: Record<
  StatutEleveEcheance,
  { bg: string; text: string; label: string; icon: any }
> = {
  PAYEE: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    label: 'Payée',
    icon: CheckCircleIcon,
  },
  PARTIELLE: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    label: 'Partielle',
    icon: CurrencyDollarIcon,
  },
  IMPAYEE: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: 'Impayée',
    icon: XCircleIcon,
  },
  EN_RETARD: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    label: 'En retard',
    icon: ExclamationTriangleIcon,
  },
};

const STATUT_GLOBAL_META: Record<
  StatutGlobalEcheance,
  { bg: string; text: string; label: string; icon: any }
> = {
  SOLDE: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    label: 'Soldée',
    icon: CheckCircleIcon,
  },
  EN_COURS: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    label: 'En cours',
    icon: ClockIcon,
  },
  IMPAYE: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    label: 'Impayée',
    icon: XCircleIcon,
  },
  EN_RETARD: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    label: 'En retard',
    icon: ExclamationTriangleIcon,
  },
};

// ============================================
// SOUS-COMPOSANTS
// ============================================

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    {Icon && (
      <div className="p-2 bg-gray-50 rounded-lg shrink-0">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  </div>
);

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
  <div className="bg-white rounded-xl border border-gray-100 p-4">
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1 truncate">{value}</p>
        {hint && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{hint}</p>
        )}
      </div>
      <div className={`p-2 rounded-lg ${bgColor} shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

// ─── Ligne élève (expandable) ───
interface EleveRowProps {
  e: EleveEcheance;
}

const EleveRow: React.FC<EleveRowProps> = ({ e }) => {
  const [open, setOpen] = useState(false);
  const meta = STATUT_ELEVE_META[e.statut];
  const Icon = meta.icon;
  const pct =
    e.duTheorique > 0
      ? Math.min(100, (e.montantPaye / e.duTheorique) * 100)
      : 0;
  const estAJour = e.restant <= 0.01;

  return (
    <>
      <tr
        className={`hover:bg-gray-50 transition-colors ${
          e.enRetard ? 'bg-red-50/30' : ''
        }`}
      >
        {/* Élève */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            {e.eleve.photo ? (
              <img
                src={e.eleve.photo}
                alt=""
                className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0"
              />
            ) : (
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                  e.eleve.sexe === 'F'
                    ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                }`}
              >
                {e.eleve.prenom?.[0]}
                {e.eleve.nom?.[0]}
              </div>
            )}
            <div className="min-w-0">
              <Link
                to={`/dashboard/eleves/${e.eleve.id}`}
                className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
              >
                {e.eleve.prenom} {e.eleve.nom}
              </Link>
              <p className="text-[11px] text-gray-500 font-mono">
                {e.eleve.matricule}
              </p>
            </div>
          </div>
        </td>

        {/* Classe */}
        <td className="px-4 py-3">
          {e.classe ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">
              <AcademicCapIcon className="w-3 h-3" />
              {e.classe.nom}
            </span>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </td>

        {/* Dû */}
        <td className="px-4 py-3 text-right text-sm text-gray-700">
          {formatMoney(e.duTheorique)}
          {e.totalReduction > 0 && (
            <p className="text-[10px] text-emerald-600">
              −{formatMoney(e.totalReduction)} réduc.
            </p>
          )}
        </td>

        {/* Payé + barre */}
        <td className="px-4 py-3 text-right">
          <p className="text-sm font-semibold text-emerald-700">
            {formatMoney(e.montantPaye)}
          </p>
          <div className="mt-1 h-1.5 w-24 ml-auto bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                pct >= 100
                  ? 'bg-emerald-500'
                  : e.enRetard
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </td>

        {/* Restant — toujours affiché (0 F CFA si soldé) */}
        <td className="px-4 py-3 text-right">
          <p
            className={`text-sm font-semibold ${
              estAJour ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {formatMoney(e.restant)}
          </p>
        </td>

        {/* Statut */}
        <td className="px-4 py-3 text-center">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${meta.bg} ${meta.text}`}
          >
            <Icon className="w-3 h-3" />
            {meta.label}
            {e.enRetard && e.joursRetard > 0 && (
              <span className="ml-0.5">+{e.joursRetard}j</span>
            )}
          </span>
        </td>

        {/* Actions */}
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            {e.paiements.length > 0 && (
              <button
                onClick={() => setOpen((v) => !v)}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                title={open ? 'Masquer les paiements' : 'Voir les paiements'}
              >
                {open ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </button>
            )}
            <Link
              to={`/dashboard/eleves/${e.eleve.id}`}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Voir la fiche élève"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </Link>
          </div>
        </td>
      </tr>

      {/* Paiements individuels expandables */}
      <AnimatePresence>
        {open && e.paiements.length > 0 && (
          <tr>
            <td colSpan={7} className="px-4 pb-3 bg-gray-50/60">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 pt-2">
                  Paiements sur cette échéance ({e.paiements.length})
                </p>
                <div className="space-y-1.5">
                  {e.paiements.map((p) => (
                    <Link
                      key={p.id}
                      to={`/dashboard/paiements/${p.id}`}
                      className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-medium text-gray-900">
                          {p.reference}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {formatDate(p.datePaiement)} •{' '}
                          {MOYENS_LABEL[p.moyen] ?? p.moyen}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-emerald-700">
                          {formatMoney(p.montant)}
                        </p>
                        <p className="text-[10px] text-blue-600">Voir →</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================
// PAGE PRINCIPALE
// ============================================

type TabKey = 'infos' | 'eleves' | 'paiements';

/**
 * Filtre de statut pour la liste des élèves.
 * - all       : tous
 * - PAYEE     : élèves ayant payé l'intégralité
 * - PARTIELLE : élèves ayant payé une partie
 * - IMPAYEE   : élèves n'ayant rien payé (mais pas en retard)
 * - EN_RETARD : élèves n'ayant rien payé ET échéance dépassée
 * - en_regle  : cumul PAYEE + PARTIELLE (ceux à jour ou partiels)
 */
type StatutFilter =
  | 'all'
  | StatutEleveEcheance
  | 'en_regle';

const EcheanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('eleves');

  // ─── Élèves : filtres ───
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<StatutFilter>('all');
  const [sortBy, setSortBy] = useState<
    'restant' | 'nom' | 'statut' | 'paye'
  >('restant');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ─── Query 1 : détail brut de l'échéance ───
  const {
    data: echeanceRaw,
    isLoading: isLoadingEcheance,
    isError: isErrorEcheance,
    error: errorEcheance,
    refetch: refetchEcheance,
  } = useEcheance(id);

  // ─── Query 2 : vue classe (élèves + stats) ───
  // ⚠️ On ne transmet PAS le filtre 'en_regle' au backend (non supporté).
  //    On filtre 'en_regle' côté client sur la page courante OU on fetch tout
  //    et on laisse le backend filtrer pour les statuts simples.
  const backendStatut =
    statutFilter === 'all' || statutFilter === 'en_regle'
      ? undefined
      : statutFilter;

  const {
    data: vueClasse,
    isLoading: isLoadingEleves,
    isError: isErrorEleves,
    error: errorEleves,
    refetch: refetchEleves,
    isFetching: isFetchingEleves,
  } = useEcheanceEleves(id, {
    page,
    limit: 100,
    search: search.trim() || undefined,
    statut: backendStatut,
    sortBy,
    sortOrder,
  });

  const hardDeleteMutation = useHardDeleteEcheance();

  const echeance = echeanceRaw?.data;
  const stats = vueClasse?.stats;
  const echeanceEnrichie = vueClasse?.echeance;
  const pagination = vueClasse?.pagination;

  // 💰 Devise : toujours F CFA
  // (on ne lit plus `devise` du backend pour l'affichage)

  // ─── Statut global calculé ───
  const statutGlobal: StatutGlobalEcheance =
    echeanceEnrichie?.statutGlobal ?? stats?.statutGlobal ?? 'IMPAYE';
  const statutGlobalMeta = STATUT_GLOBAL_META[statutGlobal];
  const StatutGlobalIcon = statutGlobalMeta.icon;

  const jours = echeance ? joursRestants(echeance.dateLimite) : 0;
  const enRetard = jours < 0;

  // ─── Paiements agrégés ───
  const allocations = echeance?.allocationsPaiement ?? [];

  // ─── Élèves filtrés côté client pour "en_regle" ───
  const elevesAffiches = (() => {
    const base = vueClasse?.eleves ?? [];
    if (statutFilter === 'en_regle') {
      return base.filter(
        (e) => e.statut === 'PAYEE' || e.statut === 'PARTIELLE'
      );
    }
    return base;
  })();

  // ─── Handlers ───
  const handleHardDelete = async () => {
    if (!echeance) return;
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nÉchéance : ${echeance.nom}\nMontant : ${formatMoney(
        echeance.montant
      )}\n\nCette action est IRRÉVERSIBLE.\n\n⚠️ Si des paiements y sont rattachés, la suppression échouera.\n\nContinuer ?`
    );
    if (!confirmed) return;

    try {
      await hardDeleteMutation.mutateAsync(echeance.id);
      navigate(`/dashboard/plans-scolarite/${echeance.planScolariteId}`);
    } catch {
      /* toast géré */
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatutFilter('all');
    setSortBy('restant');
    setSortOrder('desc');
    setPage(1);
  };

  const activeFiltersCount = [
    search,
    statutFilter !== 'all' ? 'x' : '',
  ].filter(Boolean).length;

  // ─── Loading initial ───
  if (isLoadingEcheance || isLoadingEleves) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-500 mt-4">Chargement…</p>
        </div>
      </div>
    );
  }

  // ─── Erreur ───
  if (isErrorEcheance || !echeance) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Échéance introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(errorEcheance as any)?.response?.data?.message ??
              'Une erreur est survenue'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/dashboard/echeances"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Retour
            </Link>
            <button
              onClick={() => {
                refetchEcheance();
                refetchEleves();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Compteurs rapides pour l'onglet Élèves ───
  const nbEnRegle = stats
    ? stats.nombrePayees + stats.nombrePartielles
    : 0;
  const nbEnRetard = stats?.nombreEnRetard ?? 0;

  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/echeances" className="hover:text-gray-900">
          Échéances
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">
          {echeance.nom}
        </span>
      </nav>

      {/* EN-TÊTE */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Link
              to={`/dashboard/plans-scolarite/${echeance.planScolariteId}`}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
              title="Retour au plan"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shrink-0">
              {echeance.ordre}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {echeance.nom}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${statutGlobalMeta.bg} ${statutGlobalMeta.text}`}
                >
                  <StatutGlobalIcon className="w-3.5 h-3.5" />
                  {statutGlobalMeta.label}
                </span>
                {echeanceEnrichie?.planScolarite?.classe && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                    <AcademicCapIcon className="w-3.5 h-3.5" />
                    {echeanceEnrichie.planScolarite.classe.nom}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                {echeance.planScolarite && (
                  <Link
                    to={`/dashboard/plans-scolarite/${echeance.planScolariteId}`}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <BanknotesIcon className="w-4 h-4" />
                    {echeance.planScolarite.nom}
                  </Link>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDaysIcon className="w-4 h-4" />
                  {formatDate(echeance.dateLimite)}
                </span>
                {stats && (
                  <span className="flex items-center gap-1">
                    <UsersIcon className="w-4 h-4" />
                    {stats.nombreEleves} élève(s)
                  </span>
                )}
                <span
                  className={`flex items-center gap-1 font-medium ${
                    enRetard
                      ? 'text-rose-600'
                      : jours <= 7
                      ? 'text-amber-600'
                      : 'text-gray-600'
                  }`}
                >
                  <ClockIcon className="w-4 h-4" />
                  {enRetard
                    ? `En retard de ${Math.abs(jours)} jour(s)`
                    : `Dans ${jours} jour(s)`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            <Link
              to={`/dashboard/echeances/${echeance.id}/editer`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 border border-amber-200"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Modifier
            </Link>
            <button
              onClick={handleHardDelete}
              disabled={hardDeleteMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 border border-red-200 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      </motion.div>

      {/* STATS GLOBALES */}
      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Montant attendu"
              value={formatMoney(stats.montantAttendu)}
              icon={BanknotesIcon}
              color="text-blue-600"
              bgColor="bg-blue-50"
              hint={`${stats.nombreEleves} élève(s)`}
            />
            <StatCard
              label="Encaissé"
              value={formatMoney(stats.montantEncaisse)}
              icon={CheckCircleIcon}
              color="text-emerald-600"
              bgColor="bg-emerald-50"
              hint={`${stats.tauxRecouvrement}% du total`}
            />
            <StatCard
              label="Restant"
              value={formatMoney(stats.montantRestant)}
              icon={ExclamationCircleIcon}
              color="text-red-600"
              bgColor="bg-red-50"
              hint={`${stats.nombreEleves - stats.nombrePayees} élève(s) concerné(s)`}
            />
            <StatCard
              label="Taux de recouvrement"
              value={`${stats.tauxRecouvrement}%`}
              icon={ChartBarIcon}
              color="text-purple-600"
              bgColor="bg-purple-50"
              hint={
                stats.nombreEnRetard > 0
                  ? `${stats.nombreEnRetard} en retard`
                  : 'Aucun retard'
              }
            />
          </div>

          {/* Barre de progression + répartition */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-900">
                Recouvrement global
              </p>
              <p className="text-sm font-bold text-gray-900">
                {stats.tauxRecouvrement}%
              </p>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  stats.tauxRecouvrement >= 100
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                    : stats.nombreEnRetard > 0
                    ? 'bg-gradient-to-r from-orange-400 to-red-500'
                    : 'bg-gradient-to-r from-blue-400 to-blue-600'
                }`}
                style={{ width: `${Math.min(100, stats.tauxRecouvrement)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-gray-600">Payées</span>
                <span className="ml-auto font-semibold text-gray-900">
                  {stats.nombrePayees}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-600">Partielles</span>
                <span className="ml-auto font-semibold text-gray-900">
                  {stats.nombrePartielles}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-gray-600">Impayées</span>
                <span className="ml-auto font-semibold text-gray-900">
                  {stats.nombreImpayees}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-gray-600">En retard</span>
                <span className="ml-auto font-semibold text-gray-900">
                  {stats.nombreEnRetard}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ONGLETS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {[
            { key: 'infos', label: 'Informations', icon: IdentificationIcon },
            {
              key: 'eleves',
              label: 'Élèves de la classe',
              icon: UserGroupIcon,
              badge: stats?.nombreEleves ?? 0,
            },
            {
              key: 'paiements',
              label: 'Paiements rattachés',
              icon: ReceiptRefundIcon,
              badge: allocations.length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-600 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ═══ Onglet Infos ═══ */}
          {activeTab === 'infos' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <IdentificationIcon className="w-4 h-4 text-blue-500" />
                  Identification
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Nom"
                    value={echeance.nom}
                    icon={ReceiptPercentIcon}
                  />
                  <InfoRow
                    label="Ordre"
                    value={echeance.ordre}
                    icon={IdentificationIcon}
                  />
                  <InfoRow
                    label="Montant"
                    value={formatMoney(echeance.montant)}
                    icon={BanknotesIcon}
                  />
                  <InfoRow
                    label="Date limite"
                    value={
                      <div>
                        {formatDate(echeance.dateLimite)}
                        <span
                          className={`ml-2 text-xs font-medium ${
                            enRetard
                              ? 'text-rose-600'
                              : jours <= 7
                              ? 'text-amber-600'
                              : 'text-gray-500'
                          }`}
                        >
                          ({enRetard ? 'en retard' : `dans ${jours}j`})
                        </span>
                      </div>
                    }
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Statut global"
                    value={
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${statutGlobalMeta.bg} ${statutGlobalMeta.text}`}
                      >
                        <StatutGlobalIcon className="w-3.5 h-3.5" />
                        {statutGlobalMeta.label}
                      </span>
                    }
                    icon={StatutGlobalIcon}
                  />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-blue-500" />
                  Métadonnées
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Créée le"
                    value={formatDateTime(echeance.createdAt)}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Modifiée le"
                    value={formatDateTime(echeance.updatedAt)}
                    icon={ClockIcon}
                  />
                  <InfoRow
                    label="ID"
                    value={
                      <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                        {echeance.id}
                      </span>
                    }
                    icon={IdentificationIcon}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BanknotesIcon className="w-4 h-4 text-blue-500" />
                  Plan de scolarité
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Plan"
                    value={
                      echeance.planScolarite ? (
                        <Link
                          to={`/dashboard/plans-scolarite/${echeance.planScolarite.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {echeance.planScolarite.nom}
                        </Link>
                      ) : (
                        '—'
                      )
                    }
                    icon={BanknotesIcon}
                  />
                  <InfoRow
                    label="Montant total du plan"
                    value={
                      echeance.planScolarite
                        ? formatMoney(echeance.planScolarite.montantTotal)
                        : '—'
                    }
                    icon={CurrencyDollarIcon}
                  />
                  <InfoRow
                    label="Classe concernée"
                    value={
                      echeanceEnrichie?.planScolarite?.classe ? (
                        <Link
                          to={`/dashboard/classes/${echeanceEnrichie.planScolarite.classe.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {echeanceEnrichie.planScolarite.classe.nom}
                        </Link>
                      ) : (
                        '—'
                      )
                    }
                    icon={AcademicCapIcon}
                  />
                  <InfoRow
                    label="Niveau"
                    value={echeanceEnrichie?.planScolarite?.niveau?.nom ?? '—'}
                    icon={AcademicCapIcon}
                  />
                  <InfoRow
                    label="Année scolaire"
                    value={
                      echeanceEnrichie?.planScolarite?.anneeScolaire?.nom ?? '—'
                    }
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow label="Devise" value="F CFA" icon={CurrencyDollarIcon} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ Onglet Élèves ═══ */}
          {activeTab === 'eleves' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {isErrorEleves ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-700 font-medium">
                    Impossible de charger les élèves
                  </p>
                  <p className="text-red-600 text-sm mt-1">
                    {(errorEleves as any)?.response?.data?.message ?? '—'}
                  </p>
                  <button
                    onClick={() => refetchEleves()}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <>
                  {/* Filtres */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher un élève (nom, matricule)…"
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
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <select
                        value={statutFilter}
                        onChange={(e) => {
                          setStatutFilter(e.target.value as StatutFilter);
                          setPage(1);
                        }}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="all">Tous les statuts</option>
                        <option value="en_regle">
                          En règle (payé + partiel)
                        </option>
                        <option value="PAYEE">Payée (intégral)</option>
                        <option value="PARTIELLE">Partielle</option>
                        <option value="IMPAYEE">Impayée</option>
                        <option value="EN_RETARD">En retard</option>
                      </select>

                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [by, order] = e.target.value.split('-') as [
                            typeof sortBy,
                            'asc' | 'desc'
                          ];
                          setSortBy(by);
                          setSortOrder(order);
                          setPage(1);
                        }}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="restant-desc">Restant (décroissant)</option>
                        <option value="restant-asc">Restant (croissant)</option>
                        <option value="nom-asc">Nom (A → Z)</option>
                        <option value="nom-desc">Nom (Z → A)</option>
                        <option value="paye-desc">Payé (décroissant)</option>
                        <option value="paye-asc">Payé (croissant)</option>
                        <option value="statut-asc">Statut (A → Z)</option>
                      </select>

                      {activeFiltersCount > 0 && (
                        <button
                          onClick={resetFilters}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                        >
                          <XMarkIcon className="h-4 w-4" />
                          Effacer
                        </button>
                      )}
                    </div>

                    {/* Résumé rapide des statuts */}
                    {stats && (
                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                          <CheckCircleIcon className="w-3 h-3" />
                          {nbEnRegle} en règle
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 rounded-full font-medium">
                          <ExclamationTriangleIcon className="w-3 h-3" />
                          {nbEnRetard} en retard
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                          <XCircleIcon className="w-3 h-3" />
                          {stats.nombreImpayees} impayé(s)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Indicateur rafraîchissement */}
                  {isFetchingEleves && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <ArrowPathIcon className="h-4 w-4 animate-spin text-blue-600" />
                      Actualisation…
                    </div>
                  )}

                  {/* Liste vide */}
                  {elevesAffiches.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
                        <UserGroupIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Aucun élève
                      </h3>
                      <p className="text-gray-500 mb-4 max-w-md mx-auto">
                        {activeFiltersCount > 0
                          ? 'Aucun élève ne correspond aux filtres.'
                          : 'Aucun élève n’est assigné à ce plan de scolarité.'}
                      </p>
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={resetFilters}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg"
                        >
                          Réinitialiser les filtres
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Élève
                              </th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Classe
                              </th>
                              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Dû
                              </th>
                              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Payé
                              </th>
                              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                Restant
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
                              {elevesAffiches.map((e) => (
                                <EleveRow key={e.assignmentId} e={e} />
                              ))}
                            </AnimatePresence>
                          </tbody>
                          <tfoot className="bg-gray-50 border-t border-gray-200">
                            <tr>
                              <td
                                colSpan={2}
                                className="px-4 py-3 text-sm font-semibold text-gray-700 text-right"
                              >
                                Totaux :
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-blue-700 text-right">
                                {formatMoney(stats?.montantAttendu ?? 0)}
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-emerald-700 text-right">
                                {formatMoney(stats?.montantEncaisse ?? 0)}
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-red-700 text-right">
                                {formatMoney(stats?.montantRestant ?? 0)}
                              </td>
                              <td colSpan={2} />
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Pagination */}
                      {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between gap-3 pt-2">
                          <p className="text-sm text-gray-500">
                            Page <strong>{pagination.page}</strong> sur{' '}
                            <strong>{pagination.totalPages}</strong> —{' '}
                            {pagination.total} élève(s)
                          </p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                setPage((p) => Math.max(1, p - 1))
                              }
                              disabled={page <= 1}
                              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Précédent
                            </button>
                            <button
                              onClick={() =>
                                setPage((p) =>
                                  Math.min(pagination.totalPages, p + 1)
                                )
                              }
                              disabled={page >= pagination.totalPages}
                              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Suivant
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ═══ Onglet Paiements ═══ */}
          {activeTab === 'paiements' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {allocations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
                    <ReceiptRefundIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucun paiement rattaché
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Aucun paiement n'a encore été alloué à cette échéance.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Référence
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Montant alloué
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Statut
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allocations.map((alloc) => (
                        <tr
                          key={alloc.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-mono text-gray-700">
                            {alloc.paiement?.reference ?? alloc.paiementId}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(alloc.paiement?.datePaiement)}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                            {formatMoney(alloc.montant)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {alloc.paiement?.statut === 'COMPLET' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                                <CheckCircleIcon className="w-3 h-3" />
                                Complet
                              </span>
                            ) : alloc.paiement?.statut === 'ANNULE' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-rose-50 text-rose-700 rounded-full">
                                <XCircleIcon className="w-3 h-3" />
                                Annulé
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                {alloc.paiement?.statut ?? '—'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {alloc.paiement && (
                              <Link
                                to={`/dashboard/paiements/${alloc.paiement.id}`}
                                className="text-sm text-blue-600 hover:underline font-medium"
                              >
                                Voir
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* ACTIONS BAS DE PAGE */}
      <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
        <Link
          to="/dashboard/echeances"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour à la liste
        </Link>
        <Link
          to={`/dashboard/plans-scolarite/${echeance.planScolariteId}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
        >
          <BanknotesIcon className="w-4 h-4" />
          Voir le plan de scolarité
        </Link>
        <Link
          to={`/dashboard/echeances/${echeance.id}/editer`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium border border-amber-200"
        >
          <PencilSquareIcon className="w-4 h-4" />
          Modifier
        </Link>
      </div>
    </div>
  );
};

export default EcheanceDetailPage;