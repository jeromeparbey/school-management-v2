// frontend2/src/pages/dashboard/directeur/echeances/EcheanceDetailPage.tsx

import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ReceiptPercentIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  IdentificationIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  LockClosedIcon,
  ReceiptRefundIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  useEcheance,
  useHardDeleteEcheance,
} from '../../../../hooks/useEcheance';

// ============================================
// HELPERS
// ============================================

const formatMoney = (amount: number, devise = 'XOF') =>
  new Intl.NumberFormat('fr-FR').format(amount) + ` ${devise}`;

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
// PAGE PRINCIPALE
// ============================================

type TabKey = 'infos' | 'paiements';

const EcheanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('infos');

  const { data: echeanceData, isLoading, isError, error, refetch } =
    useEcheance(id);

  const hardDeleteMutation = useHardDeleteEcheance();

  const echeance = echeanceData?.data;

  // ─────────────────────────────────────────
  // Calculs financiers
  // ─────────────────────────────────────────
  const devise = echeance?.planScolarite?.devise ?? 'XOF';

  const montantCouvert = useMemo(() => {
    if (!echeance?.allocationsPaiement) return 0;
    return echeance.allocationsPaiement.reduce(
      (sum, a) => sum + (a.montant ?? 0),
      0
    );
  }, [echeance]);

  const montantRestant = useMemo(() => {
    if (!echeance) return 0;
    return Math.max(0, echeance.montant - montantCouvert);
  }, [echeance, montantCouvert]);

  const pourcentageCouvert = useMemo(() => {
    if (!echeance || echeance.montant <= 0) return 0;
    return Math.min(100, Math.round((montantCouvert / echeance.montant) * 100));
  }, [echeance, montantCouvert]);

  // ─────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────
  const handleHardDelete = async () => {
    if (!echeance) return;

    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nÉchéance : ${echeance.nom}\nMontant : ${formatMoney(
        echeance.montant,
        devise
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

  // ─────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-500 mt-4">Chargement…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // Erreur
  // ─────────────────────────────────────────
  if (isError || !echeance) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Échéance introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
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
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const jours = joursRestants(echeance.dateLimite);
  const enRetard = !echeance.estPayee && jours < 0;
  const proche = !echeance.estPayee && jours >= 0 && jours <= 7;
  const nbPaiements = echeance.allocationsPaiement?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════
          BREADCRUMB
          ═══════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════
          EN-TÊTE
          ═══════════════════════════════════════════ */}
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
                {echeance.estPayee ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Payée
                  </span>
                ) : enRetard ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-rose-50 text-rose-700 rounded-full">
                    <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                    En retard
                  </span>
                ) : proche ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">
                    <ClockIcon className="w-3.5 h-3.5" />
                    Bientôt
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    <XCircleIcon className="w-3.5 h-3.5" />
                    En attente
                  </span>
                )}
              </div>

              {echeance.planScolarite && (
                <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                  <Link
                    to={`/dashboard/plans-scolarite/${echeance.planScolariteId}`}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <BanknotesIcon className="w-4 h-4" />
                    {echeance.planScolarite.nom}
                  </Link>
                  <span className="flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    {formatDate(echeance.dateLimite)}
                  </span>
                  {!echeance.estPayee && (
                    <span
                      className={`flex items-center gap-1 font-medium ${
                        enRetard
                          ? 'text-rose-600'
                          : proche
                          ? 'text-amber-600'
                          : 'text-gray-600'
                      }`}
                    >
                      <ClockIcon className="w-4 h-4" />
                      {enRetard
                        ? `En retard de ${Math.abs(jours)} jour(s)`
                        : `Dans ${jours} jour(s)`}
                    </span>
                  )}
                </div>
              )}
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

      {/* ═══════════════════════════════════════════
          MONTANT + PROGRESSION
          ═══════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-blue-100 uppercase tracking-wider">
              Montant de l'échéance
            </p>
            <p className="text-4xl font-bold mt-1">
              {formatMoney(echeance.montant, devise)}
            </p>
          </div>
          <CurrencyDollarIcon className="w-16 h-16 text-blue-200 hidden sm:block" />
        </div>

        {/* Barre de progression */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-blue-100 mb-2">
            <span>
              Couvert :{' '}
              <strong className="text-white">
                {formatMoney(montantCouvert, devise)}
              </strong>
            </span>
            <span>
              Restant :{' '}
              <strong className="text-white">
                {formatMoney(montantRestant, devise)}
              </strong>
            </span>
          </div>
          <div className="w-full bg-blue-900/30 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pourcentageCouvert >= 100
                  ? 'bg-emerald-400'
                  : pourcentageCouvert >= 50
                  ? 'bg-amber-400'
                  : 'bg-white'
              }`}
              style={{ width: `${pourcentageCouvert}%` }}
            />
          </div>
          <p className="text-xs text-blue-100 text-right mt-1">
            {pourcentageCouvert}% couvert
          </p>
        </div>

        {/* Détails 3 colonnes */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-400/30">
          <div>
            <p className="text-xs text-blue-100">Montant payé</p>
            <p className="text-lg font-semibold mt-0.5">
              {formatMoney(montantCouvert, devise)}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-100">Montant restant</p>
            <p className="text-lg font-semibold mt-0.5">
              {formatMoney(montantRestant, devise)}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-100">Paiements</p>
            <p className="text-lg font-semibold mt-0.5">{nbPaiements}</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          STATS RAPIDES
          ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Montant"
          value={formatMoney(echeance.montant, devise)}
          icon={BanknotesIcon}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Couvert"
          value={`${pourcentageCouvert}%`}
          icon={CheckCircleIcon}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Paiements"
          value={nbPaiements}
          icon={ReceiptRefundIcon}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          label="Jours restants"
          value={
            echeance.estPayee
              ? '—'
              : enRetard
              ? `-${Math.abs(jours)}j`
              : `${jours}j`
          }
          icon={ClockIcon}
          color={enRetard ? 'text-rose-600' : 'text-orange-600'}
          bgColor={enRetard ? 'bg-rose-50' : 'bg-orange-50'}
        />
      </div>

      {/* ═══════════════════════════════════════════
          ONGLETS
          ═══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {[
            { key: 'infos', label: 'Informations', icon: IdentificationIcon },
            {
              key: 'paiements',
              label: 'Paiements rattachés',
              icon: ReceiptRefundIcon,
              badge: nbPaiements,
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
                    label="Date limite"
                    value={
                      <div>
                        {formatDate(echeance.dateLimite)}
                        {!echeance.estPayee && (
                          <span
                            className={`ml-2 text-xs font-medium ${
                              enRetard
                                ? 'text-rose-600'
                                : proche
                                ? 'text-amber-600'
                                : 'text-gray-500'
                            }`}
                          >
                            ({enRetard ? 'en retard' : `dans ${jours}j`})
                          </span>
                        )}
                      </div>
                    }
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Statut"
                    value={
                      echeance.estPayee ? (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircleIcon className="w-4 h-4" />
                          Payée intégralement
                        </span>
                      ) : enRetard ? (
                        <span className="flex items-center gap-1 text-rose-600">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          En retard
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-700">
                          <ClockIcon className="w-4 h-4" />
                          En attente ({formatMoney(montantRestant, devise)}{' '}
                          restant)
                        </span>
                      )
                    }
                    icon={echeance.estPayee ? CheckCircleIcon : ClockIcon}
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
                        ? formatMoney(
                            echeance.planScolarite.montantTotal,
                            devise
                          )
                        : '—'
                    }
                    icon={CurrencyDollarIcon}
                  />
                  <InfoRow
                    label="Devise"
                    value={devise}
                    icon={CurrencyDollarIcon}
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
            </motion.div>
          )}

          {/* ═══ Onglet Paiements ═══ */}
          {activeTab === 'paiements' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {nbPaiements > 0 && echeance.allocationsPaiement ? (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1 text-sm text-blue-800">
                      <p className="font-medium mb-0.5">
                        {nbPaiements} paiement(s) rattaché(s)
                      </p>
                      <p className="text-xs text-blue-700">
                        Ces paiements ont contribué à couvrir cette échéance.
                        Total alloué :{' '}
                        <strong>{formatMoney(montantCouvert, devise)}</strong> sur{' '}
                        {formatMoney(echeance.montant, devise)}.
                      </p>
                    </div>
                  </div>

                  {/* Tableau des paiements */}
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
                        {echeance.allocationsPaiement.map((alloc) => (
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
                              {formatMoney(alloc.montant, devise)}
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
                      <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr>
                          <td
                            colSpan={2}
                            className="px-4 py-3 text-sm font-semibold text-gray-700 text-right"
                          >
                            Total alloué :
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-blue-700 text-right">
                            {formatMoney(montantCouvert, devise)}
                          </td>
                          <td colSpan={2} className="px-4 py-3" />
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Statut de couverture */}
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      echeance.estPayee
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    {echeance.estPayee ? (
                      <CheckCircleIcon className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    )}
                    <div
                      className={`flex-1 text-sm ${
                        echeance.estPayee
                          ? 'text-emerald-800'
                          : 'text-amber-800'
                      }`}
                    >
                      {echeance.estPayee ? (
                        <>
                          <p className="font-semibold">
                            Échéance intégralement couverte
                          </p>
                          <p className="text-xs mt-0.5">
                            Le total des paiements alloués atteint ou dépasse le
                            montant de l'échéance.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold">
                            Échéance partiellement couverte
                          </p>
                          <p className="text-xs mt-0.5">
                            Reste à couvrir :{' '}
                            <strong>{formatMoney(montantRestant, devise)}</strong>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
                    <ReceiptRefundIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucun paiement rattaché
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Aucun paiement n'a encore été alloué à cette échéance. Les
                    paiements apparaîtront ici automatiquement lorsque le
                    caissier les enregistrera.
                  </p>
                  <Link
                    to={`/dashboard/paiements/nouveau?eleveId=&echeanceId=${echeance.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    <BanknotesIcon className="w-4 h-4" />
                    Enregistrer un paiement
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          ACTIONS BAS DE PAGE
          ═══════════════════════════════════════════ */}
      <div className="flex items-center justify-center gap-3 pt-4">
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