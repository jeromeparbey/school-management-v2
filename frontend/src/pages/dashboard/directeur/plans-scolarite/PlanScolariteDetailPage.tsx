// frontend2/src/pages/dashboard/directeur/plans-scolarite/PlanScolariteDetailPage.tsx

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BanknotesIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  IdentificationIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  usePlanScolarite,
  useHardDeletePlanScolarite,
} from '../../../../hooks/usePlanScolarite';

// ============================================
// HELPERS
// ============================================

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

const formatMoney = (amount: number, devise: string) =>
  new Intl.NumberFormat('fr-FR').format(amount) + ` ${devise}`;

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

type TabKey = 'infos' | 'echeances' | 'assignments';

const PlanScolariteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('infos');

  const { data: planData, isLoading, isError, error, refetch } =
    usePlanScolarite(id);

  const hardDeleteMutation = useHardDeletePlanScolarite();

  const plan = planData?.data;

  const handleHardDelete = async () => {
    if (!plan) return;
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nPlan : ${plan.nom}\nMontant : ${formatMoney(
        plan.montantTotal,
        plan.devise
      )}\n\nCette action est IRRÉVERSIBLE.\n\nContinuer ?`
    );
    if (!confirmed) return;

    try {
      await hardDeleteMutation.mutateAsync(plan.id);
      navigate('/dashboard/plans-scolarite');
    } catch {
      /* toast géré */
    }
  };

  // Loading
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

  // Erreur
  if (isError || !plan) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Plan introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/dashboard/plans-scolarite"
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

  const nbEcheances = plan._count?.echeances ?? 0;
  const nbAssignments = plan._count?.assignments ?? 0;

  // Calcul montant autres frais
  const autresFraisObj = plan.autresFrais as Record<string, number> | null;
  const autresFraisEntries = autresFraisObj
    ? Object.entries(autresFraisObj)
    : [];
  const totalAutresFrais = autresFraisEntries.reduce(
    (sum, [, montant]) => sum + (Number(montant) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/plans-scolarite" className="hover:text-gray-900">
          Plans de scolarité
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">{plan.nom}</span>
      </nav>

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Link
              to="/dashboard/plans-scolarite"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shrink-0">
              <BanknotesIcon className="w-10 h-10" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {plan.nom}
                </h1>
                {plan.estActif ? (
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
              </div>

              {plan.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {plan.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                {plan.anneeScolaire && (
                  <span className="flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    {plan.anneeScolaire.nom}
                  </span>
                )}
                {plan.niveau && (
                  <span className="flex items-center gap-1">
                    <AcademicCapIcon className="w-4 h-4" />
                    {plan.niveau.nom}
                  </span>
                )}
                {plan.classe && (
                  <span className="flex items-center gap-1">
                    <AcademicCapIcon className="w-4 h-4" />
                    {plan.classe.nom}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            <Link
              to={`/dashboard/plans-scolarite/${plan.id}/editer`}
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

      {/* Montant total en évidence */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-100 uppercase tracking-wider">
              Montant total du plan
            </p>
            <p className="text-4xl font-bold mt-1">
              {formatMoney(plan.montantTotal, plan.devise)}
            </p>
          </div>
          <CurrencyDollarIcon className="w-16 h-16 text-blue-200" />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-400/30">
          <div>
            <p className="text-xs text-blue-100">Inscription</p>
            <p className="text-lg font-semibold mt-0.5">
              {formatMoney(plan.fraisInscription, plan.devise)}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-100">Scolarité</p>
            <p className="text-lg font-semibold mt-0.5">
              {formatMoney(plan.fraisScolarite, plan.devise)}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-100">Autres frais</p>
            <p className="text-lg font-semibold mt-0.5">
              {formatMoney(totalAutresFrais, plan.devise)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Échéances"
          value={nbEcheances}
          icon={ClockIcon}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Assignments"
          value={nbAssignments}
          icon={UserGroupIcon}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Frais totaux"
          value={formatMoney(plan.montantTotal, plan.devise)}
          icon={BanknotesIcon}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          label="Devise"
          value={plan.devise}
          icon={CurrencyDollarIcon}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {[
            { key: 'infos', label: 'Informations', icon: IdentificationIcon },
            {
              key: 'echeances',
              label: 'Échéances',
              icon: ClockIcon,
              badge: nbEcheances,
            },
            {
              key: 'assignments',
              label: 'Assignments',
              icon: UserGroupIcon,
              badge: nbAssignments,
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
                    value={plan.nom}
                    icon={BanknotesIcon}
                  />
                  <InfoRow
                    label="Description"
                    value={plan.description ?? '—'}
                    icon={DocumentTextIcon}
                  />
                  <InfoRow
                    label="Année scolaire"
                    value={plan.anneeScolaire?.nom ?? '—'}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Niveau"
                    value={plan.niveau?.nom ?? 'Tous niveaux'}
                    icon={AcademicCapIcon}
                  />
                  <InfoRow
                    label="Classe"
                    value={plan.classe?.nom ?? 'Toutes classes'}
                    icon={AcademicCapIcon}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4 text-blue-500" />
                  Détails financiers
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Frais d'inscription"
                    value={formatMoney(plan.fraisInscription, plan.devise)}
                    icon={BanknotesIcon}
                  />
                  <InfoRow
                    label="Frais de scolarité"
                    value={formatMoney(plan.fraisScolarite, plan.devise)}
                    icon={BanknotesIcon}
                  />
                  {autresFraisEntries.length > 0 && (
                    <InfoRow
                      label="Autres frais"
                      value={
                        <div className="space-y-1">
                          {autresFraisEntries.map(([cle, montant]) => (
                            <div
                              key={cle}
                              className="flex items-center justify-between text-xs"
                            >
                              <span className="text-gray-600">{cle}</span>
                              <span className="font-medium">
                                {formatMoney(Number(montant), plan.devise)}
                              </span>
                            </div>
                          ))}
                        </div>
                      }
                      icon={DocumentTextIcon}
                    />
                  )}
                  <InfoRow
                    label="Montant total"
                    value={
                      <span className="font-bold text-blue-600">
                        {formatMoney(plan.montantTotal, plan.devise)}
                      </span>
                    }
                    icon={CurrencyDollarIcon}
                  />
                  <InfoRow
                    label="Devise"
                    value={plan.devise}
                    icon={CurrencyDollarIcon}
                  />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-blue-500" />
                  Métadonnées
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Créé le"
                    value={formatDateTime(plan.createdAt)}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Modifié le"
                    value={formatDateTime(plan.updatedAt)}
                    icon={ClockIcon}
                  />
                  <InfoRow
                    label="ID"
                    value={
                      <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                        {plan.id}
                      </span>
                    }
                    icon={IdentificationIcon}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ Onglet Échéances ═══ */}
          {activeTab === 'echeances' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {plan.echeances && plan.echeances.length > 0 ? (
                <div className="space-y-3">
                  {plan.echeances.map((echeance) => (
                    <div
                      key={echeance.id}
                      className="bg-gray-50 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {echeance.ordre}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {echeance.nom}
                          </p>
                          <p className="text-xs text-gray-500">
                            Date limite : {formatDate(echeance.dateLimite)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatMoney(echeance.montant, plan.devise)}
                        </p>
                        {echeance.estPayee ? (
                          <span className="text-xs text-emerald-600 font-medium">
                            ✓ Payée
                          </span>
                        ) : (
                          <span className="text-xs text-orange-600 font-medium">
                            En attente
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucune échéance
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Ce plan n'a pas encore d'échéances définies.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ Onglet Assignments ═══ */}
          {activeTab === 'assignments' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {nbAssignments > 0 ? (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                    <UserGroupIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        {nbAssignments} élève(s) assigné(s) à ce plan
                      </p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Élèves dont la scolarité est régie par ce plan.
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/dashboard/assignments-scolarite?planScolariteId=${plan.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    <UserGroupIcon className="w-4 h-4" />
                    Voir les assignments
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucun assignment
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Aucun élève n'est encore assigné à ce plan.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Actions bas de page */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <Link
          to="/dashboard/plans-scolarite"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour à la liste
        </Link>
        <Link
          to={`/dashboard/plans-scolarite/${plan.id}/editer`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium border border-amber-200"
        >
          <PencilSquareIcon className="w-4 h-4" />
          Modifier ce plan
        </Link>
      </div>
    </div>
  );
};

export default PlanScolariteDetailPage;