
// frontend2/src/pages/dashboard/super-admin/EtablissementDetailPage.tsx

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  ServerIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  IdentificationIcon,
  BriefcaseIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  UsersIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  KeyIcon,
  UserIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  useEtablissement,
  useToggleEtablissement,
  useArchiveEtablissement,
  useHardDeleteEtablissement,
  useReprovisionnerEtablissement,
} from '../../../hooks/useEtablissements';

// ============================================
// HELPERS
// ============================================
const PLAN_COLORS: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  ENTERPRISE: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    label: 'Enterprise',
  },
  PREMIUM: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Premium',
  },
  STANDARD: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'Standard',
  },
  BASIQUE: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Basique',
  },
  GRATUIT: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    label: 'Gratuit',
  },
};

const TYPE_LABELS: Record<string, string> = {
  PUBLIC: 'Public',
  PRIVE: 'Privé',
  PRIVE_LAIQUE: 'Privé laïque',
  PRIVE_CONFESSIONNEL: 'Privé confessionnel',
  INTERNATIONAL: 'International',
};

const STATUT_PROV: Record<
  string,
  { bg: string; text: string; label: string; icon: React.ComponentType<any> }
> = {
  TERMINE: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    label: 'Terminé',
    icon: CheckCircleIcon,
  },
  EN_COURS: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    label: 'En cours',
    icon: ArrowPathIcon,
  },
  EN_ATTENTE: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: 'En attente',
    icon: ClockIcon,
  },
  ECHEC: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    label: 'Échec',
    icon: ExclamationTriangleIcon,
  },
};

const STATUT_FACTURE: Record<string, { bg: string; text: string; label: string }> = {
  EN_ATTENTE: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'En attente' },
  PAYEE: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Payée' },
  EN_RETARD: { bg: 'bg-red-50', text: 'text-red-700', label: 'En retard' },
  ANNULEE: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Annulée' },
  REMBOURSEE: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Remboursée' },
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

const formatMoney = (amount: number | null | undefined, devise = 'XOF') => {
  if (amount === null || amount === undefined) return '—';
  return `${amount.toLocaleString('fr-FR')} ${devise}`;
};

// ============================================
// COMPOSANT : InfoRow
// ============================================
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    {Icon && (
      <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
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

// ============================================
// COMPOSANT : StatCard
// ============================================
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
// COMPOSANT PRINCIPAL
// ============================================
const EtablissementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'infos' | 'directeur' | 'abonnements' | 'factures'
  >('infos');

  // --- Requête détail ---
  const { data: etab, isLoading, isError, error, refetch } = useEtablissement(
    id ?? ''
  );

  // --- Mutations ---
  const toggleMutation = useToggleEtablissement();
  const archiveMutation = useArchiveEtablissement();
  const deleteMutation = useHardDeleteEtablissement();
  const reprovisionMutation = useReprovisionnerEtablissement();

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const handleToggle = async () => {
    if (!etab) return;
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

  const handleArchive = async () => {
    if (!etab) return;
    if (!confirm(`Archiver "${etab.nom}" ?\n\nCette action est réversible.`))
      return;
    try {
      await archiveMutation.mutateAsync(etab.id);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur');
    }
  };

  const handleDelete = async () => {
    if (!etab) return;
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\n` +
        `Établissement : ${etab.nom}\n` +
        `Code : ${etab.code}\n\n` +
        `Cette action est IRRÉVERSIBLE.\n\n` +
        `Continuer ?`
    );
    if (!confirmed) return;

    const doubleCheck = prompt(
      `Pour confirmer, tapez le code : "${etab.code}"`
    );
    if (doubleCheck !== etab.code) {
      alert('Code incorrect. Suppression annulée.');
      return;
    }

    try {
      await deleteMutation.mutateAsync(etab.id);
      navigate('/dashboard/etablissements');
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur');
    }
  };

  const handleReprovisionner = async () => {
    if (!etab) return;
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

  // ─────────────────────────────────────────
  // RENDU : Loading
  // ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement de l'établissement...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // RENDU : Erreur
  // ─────────────────────────────────────────
  if (isError || !etab) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Établissement introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue lors du chargement'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/dashboard/etablissements"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Retour à la liste
            </Link>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // DONNÉES DÉRIVÉES
  // ─────────────────────────────────────────
  const planStyle = PLAN_COLORS[etab.planAbonnement] ?? PLAN_COLORS.GRATUIT;
  const statutProv = STATUT_PROV[etab.statutProvisionnement] ?? STATUT_PROV.EN_ATTENTE;
  const StatutIcon = statutProv.icon;

  const directeur = etab.directeur;

  // ─────────────────────────────────────────
  // RENDU PRINCIPAL
  // ─────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ============================================
          BREADCRUMB
          ============================================ */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link
          to="/dashboard/etablissements"
          className="hover:text-gray-900"
        >
          Établissements
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">{etab.nom}</span>
      </nav>

      {/* ============================================
          EN-TÊTE
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Identité */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Link
              to="/dashboard/etablissements"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
              title="Retour"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            {etab.logo ? (
              <img
                src={etab.logo}
                alt={etab.nom}
                className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border border-gray-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {etab.nom.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {etab.nom}
                </h1>
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
                {etab.estArchive && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-full">
                    <ArchiveBoxIcon className="w-3.5 h-3.5" />
                    Archivé
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                  {etab.code}
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  {etab.ville ?? '—'}, {etab.pays}
                </span>
                <span className="flex items-center gap-1">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  {TYPE_LABELS[etab.type] ?? etab.type}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${planStyle.bg} ${planStyle.text} ${planStyle.border}`}
                >
                  <BriefcaseIcon className="w-3.5 h-3.5" />
                  {planStyle.label}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statutProv.bg} ${statutProv.text}`}
                >
                  <StatutIcon
                    className={`w-3.5 h-3.5 ${
                      etab.statutProvisionnement === 'EN_COURS'
                        ? 'animate-spin'
                        : ''
                    }`}
                  />
                  Provisioning : {statutProv.label}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0">
            <Link
              to={`/dashboard/etablissements/${etab.id}/editer`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Modifier
            </Link>

            <button
              onClick={handleToggle}
              disabled={toggleMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 font-medium rounded-lg hover:bg-purple-100 transition-colors border border-purple-200 disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${
                  toggleMutation.isPending ? 'animate-spin' : ''
                }`}
              />
              {etab.estActif ? 'Désactiver' : 'Activer'}
            </button>

            {etab.statutProvisionnement === 'ECHEC' && (
              <button
                onClick={handleReprovisionner}
                disabled={reprovisionMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-50"
              >
                <ServerIcon className="w-4 h-4" />
                Reprovisionner
              </button>
            )}

            <button
              onClick={handleArchive}
              disabled={archiveMutation.isPending || etab.estArchive}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 font-medium rounded-lg hover:bg-orange-100 transition-colors border border-orange-200 disabled:opacity-50"
            >
              <ArchiveBoxIcon className="w-4 h-4" />
              Archiver
            </button>

            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>

        {/* Message erreur provisioning */}
        {etab.statutProvisionnement === 'ECHEC' && etab.erreurProvisionnement && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">
                Erreur de provisioning
              </p>
              <p className="text-sm text-red-600 mt-1 font-mono">
                {etab.erreurProvisionnement}
              </p>
            </div>
            <button
              onClick={handleReprovisionner}
              disabled={reprovisionMutation.isPending}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Relancer
            </button>
          </div>
        )}
      </motion.div>

      {/* ============================================
          STATS RAPIDES
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Utilisateurs globaux"
          value={etab._count?.utilisateursGlobaux ?? 0}
          icon={UsersIcon}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          label="Abonnements"
          value={etab._count?.abonnements ?? 0}
          icon={CreditCardIcon}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Factures"
          value={etab._count?.factures ?? 0}
          icon={DocumentTextIcon}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Max utilisateurs"
          value={etab.maxUtilisateurs}
          icon={UsersIcon}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* ============================================
          ONGLETS
          ============================================ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100">
          {[
            { key: 'infos', label: 'Informations', icon: BuildingOfficeIcon },
            {
              key: 'directeur',
              label: 'Directeur',
              icon: UserCircleIcon,
              badge: directeur ? 1 : 0,
            },
            {
              key: 'abonnements',
              label: 'Abonnements',
              icon: CreditCardIcon,
              badge: etab.abonnements?.length ?? 0,
            },
            {
              key: 'factures',
              label: 'Factures',
              icon: DocumentTextIcon,
              badge: etab.factures?.length ?? 0,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-red-500 text-red-600 bg-red-50/50'
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
          {/* ═══════════════════════════════════════
              ONGLET : INFORMATIONS
              ═══════════════════════════════════════ */}
          {activeTab === 'infos' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Colonne gauche : Identité */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <IdentificationIcon className="w-4 h-4 text-red-500" />
                  Identité
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Nom"
                    value={etab.nom}
                    icon={BuildingOfficeIcon}
                  />
                  <InfoRow
                    label="Code unique"
                    value={
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                        {etab.code}
                      </span>
                    }
                    icon={IdentificationIcon}
                  />
                  <InfoRow
                    label="Schéma PostgreSQL"
                    value={
                      <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                        {etab.schemaName}
                      </span>
                    }
                    icon={ServerIcon}
                  />
                  <InfoRow
                    label="Type"
                    value={TYPE_LABELS[etab.type] ?? etab.type}
                    icon={BuildingOfficeIcon}
                  />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <Cog6ToothIcon className="w-4 h-4 text-red-500" />
                  Configuration
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Plan d'abonnement"
                    value={
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${planStyle.bg} ${planStyle.text} ${planStyle.border}`}
                      >
                        {planStyle.label}
                      </span>
                    }
                    icon={BriefcaseIcon}
                  />
                  <InfoRow
                    label="Date d'expiration"
                    value={formatDate(etab.dateExpiration)}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Max utilisateurs"
                    value={etab.maxUtilisateurs.toLocaleString('fr-FR')}
                    icon={UsersIcon}
                  />
                  <InfoRow
                    label="Devise"
                    value={etab.devise}
                    icon={CurrencyDollarIcon}
                  />
                </div>
              </div>

              {/* Colonne droite : Contact + Localisation + Config pédagogique */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <GlobeAltIcon className="w-4 h-4 text-red-500" />
                  Localisation
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Adresse"
                    value={etab.adresse ?? '—'}
                    icon={MapPinIcon}
                  />
                  <InfoRow
                    label="Ville"
                    value={etab.ville ?? '—'}
                    icon={MapPinIcon}
                  />
                  <InfoRow
                    label="Pays"
                    value={etab.pays}
                    icon={GlobeAltIcon}
                  />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-red-500" />
                  Contact
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Email"
                    value={
                      etab.email ? (
                        <a
                          href={`mailto:${etab.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {etab.email}
                        </a>
                      ) : (
                        '—'
                      )
                    }
                    icon={EnvelopeIcon}
                  />
                  <InfoRow
                    label="Téléphone"
                    value={
                      etab.telephone ? (
                        <a
                          href={`tel:${etab.telephone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {etab.telephone}
                        </a>
                      ) : (
                        '—'
                      )
                    }
                    icon={PhoneIcon}
                  />
                  <InfoRow
                    label="Site web"
                    value={
                      etab.siteWeb ? (
                        <a
                          href={etab.siteWeb}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {etab.siteWeb}
                        </a>
                      ) : (
                        '—'
                      )
                    }
                    icon={GlobeAltIcon}
                  />
                  <InfoRow
                    label="N° Agrément"
                    value={etab.numeroAgrement ?? '—'}
                    icon={DocumentTextIcon}
                  />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-red-500" />
                  Rythme scolaire
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Jours ouvrables"
                    value={
                      <div className="flex flex-wrap gap-1 mt-1">
                        {etab.joursOuvrables.map((j) => (
                          <span
                            key={j}
                            className="px-2 py-0.5 text-xs bg-white text-gray-700 rounded border border-gray-200"
                          >
                            {j.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    }
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Horaires"
                    value={`${etab.heureDebut ?? '—'} → ${etab.heureFin ?? '—'}`}
                    icon={ClockIcon}
                  />
                  <InfoRow
                    label="Tolérance retard"
                    value={`${etab.toleranceRetard} minutes`}
                    icon={ClockIcon}
                  />
                  <InfoRow
                    label="Taux heure supplémentaire"
                    value={`×${etab.tauxHeureSup}`}
                    icon={ReceiptPercentIcon}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET : DIRECTEUR
              ═══════════════════════════════════════ */}
          {activeTab === 'directeur' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {directeur ? (
                <div className="space-y-6">
                  {/* Carte profil directeur */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                    <div className="flex items-start gap-5">
                      {directeur.photoProfil ? (
                        <img
                          src={directeur.photoProfil}
                          alt={`${directeur.prenom} ${directeur.nom}`}
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0">
                          {directeur.prenom.charAt(0).toUpperCase()}
                          {directeur.nom.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-bold text-gray-900">
                            {directeur.prenom} {directeur.nom}
                          </h2>
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-white text-orange-700 rounded-full border border-orange-200">
                            <ShieldCheckIcon className="w-3.5 h-3.5" />
                            DIRECTEUR
                          </span>
                          {directeur.estActif ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                              <XCircleIcon className="w-3.5 h-3.5" />
                              Inactif
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-600">
                          <a
                            href={`mailto:${directeur.email}`}
                            className="flex items-center gap-1.5 hover:text-orange-600"
                          >
                            <EnvelopeIcon className="w-4 h-4" />
                            {directeur.email}
                          </a>
                          {directeur.telephone && (
                            <a
                              href={`tel:${directeur.telephone}`}
                              className="flex items-center gap-1.5 hover:text-orange-600"
                            >
                              <PhoneIcon className="w-4 h-4" />
                              {directeur.telephone}
                            </a>
                          )}
                        </div>

                        {directeur.emailVerifie && (
                          <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            Email vérifié
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Détails du compte */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <UserCircleIcon className="w-4 h-4 text-orange-500" />
                        Compte utilisateur
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <InfoRow
                          label="ID utilisateur"
                          value={
                            <span className="font-mono text-xs">
                              {directeur.id}
                            </span>
                          }
                          icon={IdentificationIcon}
                        />
                        <InfoRow
                          label="Email"
                          value={directeur.email}
                          icon={EnvelopeIcon}
                        />
                        <InfoRow
                          label="Rôle"
                          value={directeur.role}
                          icon={ShieldCheckIcon}
                        />
                        <InfoRow
                          label="Email vérifié"
                          value={
                            directeur.emailVerifie ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" />
                                Oui
                              </span>
                            ) : (
                              <span className="text-orange-600 flex items-center gap-1">
                                <ExclamationTriangleIcon className="w-4 h-4" />
                                Non
                              </span>
                            )
                          }
                          icon={EnvelopeIcon}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-orange-500" />
                        Activité
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <InfoRow
                          label="Dernière connexion"
                          value={formatDateTime(directeur.derniereConnexion)}
                          icon={ClockIcon}
                        />
                        <InfoRow
                          label="Compte créé le"
                          value={formatDateTime(directeur.createdAt)}
                          icon={CalendarDaysIcon}
                        />
                        {directeur.directeur && (
                          <>
                            <InfoRow
                              label="Date de nomination"
                              value={formatDate(
                                directeur.directeur.dateNomination
                              )}
                              icon={CalendarDaysIcon}
                            />
                            {directeur.directeur.signature && (
                              <InfoRow
                                label="Signature"
                                value={
                                  <span className="text-xs italic">
                                    {directeur.directeur.signature}
                                  </span>
                                }
                                icon={PencilSquareIcon}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800">
                      <p className="font-semibold mb-0.5">
                        Compte directeur initial
                      </p>
                      <p className="text-blue-700">
                        Ce compte a été créé automatiquement lors du
                        provisioning de l'établissement. Le directeur peut se
                        connecter immédiatement avec son email et son mot de
                        passe.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucun directeur
                  </h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    {etab.statutProvisionnement === 'TERMINE'
                      ? 'Aucun directeur n\'a été trouvé dans le schéma du tenant.'
                      : 'Le provisioning doit être terminé pour que le directeur soit créé.'}
                  </p>
                  {etab.statutProvisionnement !== 'TERMINE' && (
                    <button
                      onClick={handleReprovisionner}
                      disabled={reprovisionMutation.isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <ServerIcon className="w-4 h-4" />
                      Relancer le provisioning
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET : ABONNEMENTS
              ═══════════════════════════════════════ */}
          {activeTab === 'abonnements' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {etab.abonnements && etab.abonnements.length > 0 ? (
                <div className="space-y-3">
                  {etab.abonnements.map((abo: any) => (
                    <div
                      key={abo.id}
                      className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-50 rounded-xl">
                            <CreditCardIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Plan {abo.plan}
                            </p>
                            <p className="text-sm text-gray-500">
                              Du {formatDate(abo.dateDebut)} au{' '}
                              {formatDate(abo.dateFin)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Mensuel</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatMoney(abo.montantMensuel, etab.devise)}
                            </p>
                          </div>

                          {abo.estActif ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              <XCircleIcon className="w-3.5 h-3.5" />
                              Inactif
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucun abonnement
                  </h3>
                  <p className="text-gray-500">
                    Aucun abonnement actif pour cet établissement.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET : FACTURES
              ═══════════════════════════════════════ */}
          {activeTab === 'factures' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {etab.factures && etab.factures.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          N° Facture
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Montant
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Émise le
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Échéance
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {etab.factures.map((fact: any) => {
                        const statutStyle =
                          STATUT_FACTURE[fact.statut] ??
                          STATUT_FACTURE.EN_ATTENTE;
                        return (
                          <tr key={fact.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm font-mono text-gray-700">
                              {fact.numeroFacture}
                            </td>
                            <td className="px-4 py-4 text-sm font-bold text-gray-900 text-right">
                              {formatMoney(fact.montant, etab.devise)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {formatDate(fact.dateEmission)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {formatDate(fact.dateEcheance)}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span
                                className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statutStyle.bg} ${statutStyle.text}`}
                              >
                                {statutStyle.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucune facture
                  </h3>
                  <p className="text-gray-500">
                    Aucune facture émise pour cet établissement.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* ============================================
          MÉTADONNÉES
          ============================================ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Cog6ToothIcon className="w-4 h-4 text-gray-500" />
          Métadonnées
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow
            label="ID établissement"
            value={
              <span className="font-mono text-xs bg-gray-50 px-2 py-0.5 rounded">
                {etab.id}
              </span>
            }
            icon={IdentificationIcon}
          />
          <InfoRow
            label="Créé le"
            value={formatDateTime(etab.createdAt)}
            icon={CalendarDaysIcon}
          />
          <InfoRow
            label="Dernière modification"
            value={formatDateTime(etab.updatedAt)}
            icon={ClockIcon}
          />
          <InfoRow
            label="Fuseau horaire"
            value={etab.fuseauHoraire}
            icon={ClockIcon}
          />
        </div>
      </div>

      {/* ============================================
          INFO BAS DE PAGE
          ============================================ */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <p className="font-semibold mb-0.5">Actions disponibles</p>
          <ul className="space-y-0.5 text-blue-700">
            <li>
              • <strong>Modifier</strong> : met à jour les informations de
              l'établissement (le directeur n'est pas modifiable ici).
            </li>
            <li>
              • <strong>Désactiver</strong> : bloque la connexion des
              utilisateurs, conserve toutes les données.
            </li>
            <li>
              • <strong>Archiver</strong> : masque l'établissement des listes
              actives (réversible).
            </li>
            <li>
              • <strong>Supprimer</strong> : ⚠️ IRRÉVERSIBLE. Refusé si des
              utilisateurs globaux, abonnements ou factures sont liés.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EtablissementDetailPage;