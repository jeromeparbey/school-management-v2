// frontend2/src/pages/dashboard/directeur/enseignants/EnseignantDetailPage.tsx

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  IdentificationIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  FolderIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import {
  useEnseignant,
  useSoftDeleteEnseignant,
  useHardDeleteEnseignant,
} from '../../../../hooks/useEnseignants';

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

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';

const CONTRAT_COLORS: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  CDI: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'CDI' },
  CDD: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'CDD' },
  VACATAIRE: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    label: 'Vacataire',
  },
  STAGE: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Stage' },
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

// Panneau "Coming soon" pour les onglets sans hooks
const ComingSoonPanel: React.FC<{
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  count?: number;
  color?: string;
  link?: string;
  linkLabel?: string;
}> = ({
  icon: Icon,
  title,
  description,
  count,
  color = 'text-gray-400',
  link,
  linkLabel,
}) => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
      <Icon className={`w-10 h-10 ${color}`} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
    <p className="text-gray-500 mb-4 max-w-md mx-auto">{description}</p>
    {count !== undefined && count > 0 && (
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full">
          <CheckCircleIcon className="w-4 h-4" />
          {count} élément(s) enregistré(s)
        </span>
        {link && (
          <Link
            to={link}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            {linkLabel ?? 'Voir les détails'}
          </Link>
        )}
      </div>
    )}
  </div>
);

// Onglet avec badge count (réutilisable)
const TabBadge: React.FC<{ count: number }> = ({ count }) =>
  count > 0 ? (
    <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-600 rounded-full">
      {count}
    </span>
  ) : null;

// ============================================
// PAGE PRINCIPALE
// ============================================
type TabKey =
  | 'infos'
  | 'affectations'
  | 'emploiTemps'
  | 'notes'
  | 'paies'
  | 'presences'
  | 'absences'
  | 'heuresSupp'
  | 'avances'
  | 'reclamations'
  | 'historiqueSalaire'
  | 'groupesTD'
  | 'documents'
  | 'communications';

const EnseignantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('infos');

  const { data: enseignantData, isLoading, isError, error, refetch } =
    useEnseignant(id);

  const softDeleteMutation = useSoftDeleteEnseignant();
  const hardDeleteMutation = useHardDeleteEnseignant();

  const enseignant = enseignantData?.data;

  const handleSoftDelete = async () => {
    if (!enseignant) return;
    if (
      !confirm(
        `Archiver "${enseignant.prenom} ${enseignant.nom}" ?\n\nLe compte sera désactivé et l'enseignant ne pourra plus se connecter.`
      )
    )
      return;
    try {
      await softDeleteMutation.mutateAsync(enseignant.id);
      navigate('/dashboard/enseignants');
    } catch {
      /* toast géré */
    }
  };

  const handleHardDelete = async () => {
    if (!enseignant) return;
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\n${enseignant.prenom} ${enseignant.nom}\nMatricule : ${enseignant.matricule}\n\nCette action est IRRÉVERSIBLE.\n\nContinuer ?`
    );
    if (!confirmed) return;

    const doubleCheck = prompt(
      `Pour confirmer, tapez le matricule : "${enseignant.matricule}"`
    );
    if (doubleCheck !== enseignant.matricule) {
      alert('Matricule incorrect. Suppression annulée.');
      return;
    }

    try {
      await hardDeleteMutation.mutateAsync(enseignant.id);
      navigate('/dashboard/enseignants');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="text-gray-500 mt-4">Chargement…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // Erreur
  // ─────────────────────────────────────────
  if (isError || !enseignant) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Enseignant introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/dashboard/enseignants"
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

  const contratStyle = CONTRAT_COLORS[enseignant.typeContrat.toUpperCase()] ?? {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    label: enseignant.typeContrat,
  };

  // Compteurs
  const nbAffectations = enseignant._count?.affectations ?? 0;
  const nbNotes = enseignant._count?.notes ?? 0;
  const nbEmploisTemps = enseignant._count?.emploisTemps ?? 0;
  const nbPaies = enseignant._count?.paies ?? 0;
  const nbAbsences = enseignant._count?.absences ?? 0;
  const nbHeuresSupp = enseignant._count?.heuresSupp ?? 0;
  // Ces compteurs ne sont pas dans _count par défaut du schéma — à étendre
  // dans le service côté backend si besoin :
  const nbPresences = 0;
  const nbAvances = 0;
  const nbReclamations = 0;
  const nbHistoriquesSalaire = 0;
  const nbGroupesTD = 0;
  const nbDocuments = 0;
  const nbCommunications = 0;

  // Onglets (groupés en 2 rangées pour lisibilité)
  const tabsRow1 = [
    { key: 'infos', label: 'Informations', icon: IdentificationIcon },
    {
      key: 'affectations',
      label: 'Affectations',
      icon: BuildingOfficeIcon,
      badge: nbAffectations,
    },
    {
      key: 'emploiTemps',
      label: 'Emploi du temps',
      icon: ClockIcon,
      badge: nbEmploisTemps,
    },
    { key: 'notes', label: 'Notes', icon: DocumentTextIcon, badge: nbNotes },
    { key: 'paies', label: 'Paies', icon: ChartBarIcon, badge: nbPaies },
  ];

  const tabsRow2 = [
    {
      key: 'presences',
      label: 'Présences',
      icon: CheckCircleIcon,
      badge: nbPresences,
    },
    {
      key: 'absences',
      label: 'Absences',
      icon: CalendarIcon,
      badge: nbAbsences,
    },
    {
      key: 'heuresSupp',
      label: 'Heures supp.',
      icon: ClockIcon,
      badge: nbHeuresSupp,
    },
    {
      key: 'avances',
      label: 'Avances',
      icon: BanknotesIcon,
      badge: nbAvances,
    },
    {
      key: 'reclamations',
      label: 'Réclamations',
      icon: ExclamationCircleIcon,
      badge: nbReclamations,
    },
    {
      key: 'historiqueSalaire',
      label: 'Historique salaire',
      icon: ArrowTrendingUpIcon,
      badge: nbHistoriquesSalaire,
    },
    {
      key: 'groupesTD',
      label: 'Groupes TD',
      icon: UserGroupIcon,
      badge: nbGroupesTD,
    },
    {
      key: 'documents',
      label: 'Documents',
      icon: FolderIcon,
      badge: nbDocuments,
    },
    {
      key: 'communications',
      label: 'Communications',
      icon: ChatBubbleLeftRightIcon,
      badge: nbCommunications,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════
          BREADCRUMB
          ═══════════════════════════════════════════ */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/enseignants" className="hover:text-gray-900">
          Enseignants
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">
          {enseignant.prenom} {enseignant.nom}
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
              to="/dashboard/enseignants"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            {enseignant.photo ? (
              <img
                src={enseignant.photo}
                alt={enseignant.nom}
                className="w-20 h-20 rounded-2xl object-cover border border-gray-100 shrink-0"
              />
            ) : (
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0 ${
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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {enseignant.prenom} {enseignant.nom}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border ${contratStyle.bg} ${contratStyle.text}`}
                >
                  <BriefcaseIcon className="w-3.5 h-3.5" />
                  {contratStyle.label}
                </span>
                {enseignant.estArchive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-full">
                    <XCircleIcon className="w-3.5 h-3.5" />
                    Archivé
                  </span>
                ) : enseignant.estActif ? (
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

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                  {enseignant.matricule}
                </span>
                {enseignant.specialite && (
                  <span className="flex items-center gap-1">
                    <BookOpenIcon className="w-4 h-4" />
                    {enseignant.specialite}
                  </span>
                )}
                {enseignant.telephone && (
                  <a
                    href={`tel:${enseignant.telephone}`}
                    className="flex items-center gap-1 hover:text-indigo-600"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    {enseignant.telephone}
                  </a>
                )}
                {enseignant.email && (
                  <a
                    href={`mailto:${enseignant.email}`}
                    className="flex items-center gap-1 hover:text-indigo-600"
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    {enseignant.email}
                  </a>
                )}
              </div>

              {enseignant.utilisateur && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  Compte actif
                  {enseignant.utilisateur.emailVerifie && (
                    <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 rounded-full">
                      email vérifié
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            <Link
              to={`/dashboard/enseignants/${enseignant.id}/editer`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 border border-amber-200"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Modifier
            </Link>
            {!enseignant.estArchive && (
              <button
                onClick={handleSoftDelete}
                disabled={softDeleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 font-medium rounded-lg hover:bg-orange-100 border border-orange-200 disabled:opacity-50"
              >
                <XCircleIcon className="w-4 h-4" />
                Archiver
              </button>
            )}
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
          STATS RAPIDES (9 cartes)
          ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          label="Affectations"
          value={nbAffectations}
          icon={BuildingOfficeIcon}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Emploi du temps"
          value={nbEmploisTemps}
          icon={ClockIcon}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          label="Notes"
          value={nbNotes}
          icon={DocumentTextIcon}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Paies"
          value={nbPaies}
          icon={ChartBarIcon}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatCard
          label="Absences"
          value={nbAbsences}
          icon={CalendarIcon}
          color="text-rose-600"
          bgColor="bg-rose-50"
        />
        <StatCard
          label="Heures supp."
          value={nbHeuresSupp}
          icon={ArrowTrendingUpIcon}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          label="Avances"
          value={nbAvances}
          icon={BanknotesIcon}
          color="text-cyan-600"
          bgColor="bg-cyan-50"
        />
        <StatCard
          label="Réclamations"
          value={nbReclamations}
          icon={ExclamationCircleIcon}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          label="Groupes TD"
          value={nbGroupesTD}
          icon={UserGroupIcon}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
      </div>

      {/* ═══════════════════════════════════════════
          ONGLETS (2 rangées scrollables)
          ═══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        {/* Tab bar — 2 rangées */}
        <div className="border-b border-gray-100">
          {/* Rangée 1 : onglets principaux */}
          <div className="flex overflow-x-auto border-b border-gray-100">
            {tabsRow1.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <TabBadge count={tab.badge ?? 0} />
              </button>
            ))}
          </div>

          {/* Rangée 2 : onglets RH */}
          <div className="flex overflow-x-auto bg-gray-50/50">
            {tabsRow2.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                <TabBadge count={tab.badge ?? 0} />
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* ═══════════════════════════════════════
              ONGLET 1 : INFORMATIONS
              ═══════════════════════════════════════ */}
          {activeTab === 'infos' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <UserCircleIcon className="w-4 h-4 text-indigo-500" />
                  Identité
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Nom complet"
                    value={`${enseignant.prenom} ${enseignant.nom}`}
                    icon={UserCircleIcon}
                  />
                  <InfoRow
                    label="Matricule"
                    value={
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                        {enseignant.matricule}
                      </span>
                    }
                    icon={IdentificationIcon}
                  />
                  <InfoRow
                    label="Sexe"
                    value={enseignant.sexe === 'M' ? 'Masculin' : 'Féminin'}
                    icon={UserCircleIcon}
                  />
                  <InfoRow
                    label="Date de naissance"
                    value={formatDate(enseignant.dateNaissance)}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Adresse"
                    value={enseignant.adresse ?? '—'}
                    icon={MapPinIcon}
                  />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-indigo-500" />
                  Contact
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Téléphone"
                    value={
                      <a
                        href={`tel:${enseignant.telephone}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {enseignant.telephone}
                      </a>
                    }
                    icon={PhoneIcon}
                  />
                  <InfoRow
                    label="Email"
                    value={
                      enseignant.email ? (
                        <a
                          href={`mailto:${enseignant.email}`}
                          className="text-indigo-600 hover:underline"
                        >
                          {enseignant.email}
                        </a>
                      ) : (
                        '—'
                      )
                    }
                    icon={EnvelopeIcon}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BriefcaseIcon className="w-4 h-4 text-indigo-500" />
                  Contrat
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Type de contrat"
                    value={
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${contratStyle.bg} ${contratStyle.text}`}
                      >
                        {contratStyle.label}
                      </span>
                    }
                    icon={BriefcaseIcon}
                  />
                  <InfoRow
                    label="Date d'embauche"
                    value={formatDate(enseignant.dateEmbauche)}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Qualification"
                    value={enseignant.qualification ?? '—'}
                    icon={AcademicCapIcon}
                  />
                  <InfoRow
                    label="Spécialité"
                    value={enseignant.specialite ?? '—'}
                    icon={BookOpenIcon}
                  />
                  <InfoRow
                    label="Salaire de base"
                    value={
                      <span className="font-semibold text-emerald-600">
                        {formatMoney(enseignant.salaireBase)}
                      </span>
                    }
                    icon={BanknotesIcon}
                  />
                </div>

                {enseignant.utilisateur && (
                  <>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                      <UserCircleIcon className="w-4 h-4 text-indigo-500" />
                      Compte utilisateur
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <InfoRow
                        label="Email de connexion"
                        value={enseignant.utilisateur.email}
                        icon={EnvelopeIcon}
                      />
                      <InfoRow
                        label="Email vérifié"
                        value={
                          enseignant.utilisateur.emailVerifie ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <CheckCircleIcon className="w-4 h-4" />
                              Oui
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-orange-600">
                              <ExclamationTriangleIcon className="w-4 h-4" />
                              Non
                            </span>
                          )
                        }
                        icon={CheckCircleIcon}
                      />
                      <InfoRow
                        label="Dernière connexion"
                        value={formatDateTime(
                          enseignant.utilisateur.derniereConnexion
                        )}
                        icon={ClockIcon}
                      />
                      <InfoRow
                        label="Compte actif"
                        value={
                          enseignant.utilisateur.estActif ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <CheckCircleIcon className="w-4 h-4" />
                              Oui
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircleIcon className="w-4 h-4" />
                              Non
                            </span>
                          )
                        }
                        icon={UserCircleIcon}
                      />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 2 : AFFECTATIONS
              ═══════════════════════════════════════ */}
          {activeTab === 'affectations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={BuildingOfficeIcon}
                title="Affectations"
                description="Classes et matières auxquelles cet enseignant est affecté."
                count={nbAffectations}
                color="text-blue-500"
                link={
                  nbAffectations > 0
                    ? `/dashboard/affectations?enseignantId=${enseignant.id}`
                    : undefined
                }
                linkLabel="Voir les affectations"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 3 : EMPLOI DU TEMPS
              ═══════════════════════════════════════ */}
          {activeTab === 'emploiTemps' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={ClockIcon}
                title="Emploi du temps"
                description="Créneaux hebdomadaires d'enseignement."
                count={nbEmploisTemps}
                color="text-purple-500"
                link={
                  nbEmploisTemps > 0
                    ? `/dashboard/emploi-temps?enseignantId=${enseignant.id}`
                    : undefined
                }
                linkLabel="Voir l'emploi du temps"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 4 : NOTES
              ═══════════════════════════════════════ */}
          {activeTab === 'notes' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={DocumentTextIcon}
                title="Notes saisies"
                description="Notes saisies par cet enseignant."
                count={nbNotes}
                color="text-emerald-500"
                link={
                  nbNotes > 0
                    ? `/dashboard/notes?enseignantId=${enseignant.id}`
                    : undefined
                }
                linkLabel="Voir les notes"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 5 : PAIES
              ═══════════════════════════════════════ */}
          {activeTab === 'paies' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={ChartBarIcon}
                title="Bulletins de paie"
                description="Historique des paies de cet enseignant."
                count={nbPaies}
                color="text-orange-500"
                link={
                  nbPaies > 0
                    ? `/dashboard/paie?enseignantId=${enseignant.id}`
                    : undefined
                }
                linkLabel="Voir les paies"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 6 : PRÉSENCES
              ═══════════════════════════════════════ */}
          {activeTab === 'presences' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={CheckCircleIcon}
                title="Présences"
                description="Historique des pointages et présences de cet enseignant."
                count={nbPresences}
                color="text-emerald-500"
                link={
                  nbPresences > 0
                    ? `/dashboard/presences?enseignantId=${enseignant.id}`
                    : undefined
                }
                linkLabel="Voir les présences"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 7 : ABSENCES
              ═══════════════════════════════════════ */}
          {activeTab === 'absences' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={CalendarIcon}
                title="Absences"
                description="Demandes et historique d'absences (congés, maladie, etc.)."
                count={nbAbsences}
                color="text-rose-500"
                link={
                  nbAbsences > 0
                    ? `/dashboard/absences?enseignantId=${enseignant.id}`
                    : undefined
                }
                linkLabel="Voir les absences"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 8 : HEURES SUPPLÉMENTAIRES
              ═══════════════════════════════════════ */}
          {activeTab === 'heuresSupp' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={ClockIcon}
                title="Heures supplémentaires"
                description="Heures supplémentaires effectuées par cet enseignant."
                count={nbHeuresSupp}
                color="text-amber-500"
                link={
                  nbHeuresSupp > 0
                    ? `/dashboard/heures-supp?enseignantId=${enseignant.id}`
                    : undefined
                }
                linkLabel="Voir les heures supp."
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 9 : AVANCES
              ═══════════════════════════════════════ */}
          {activeTab === 'avances' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={BanknotesIcon}
                title="Avances sur salaire"
                description="Demandes et historique d'avances sur salaire."
                count={nbAvances}
                color="text-cyan-500"
                link={
                  nbAvances > 0
                    ? `/dashboard/avances?enseignantId=${enseignant.id}`
                    : undefined
                }
                linkLabel="Voir les avances"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 10 : RÉCLAMATIONS
              ═══════════════════════════════════════ */}
          {activeTab === 'reclamations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={ExclamationCircleIcon}
                title="Réclamations"
                description="Réclamations et demandes RH soumises par cet enseignant."
                count={nbReclamations}
                color="text-red-500"
                link={
                  nbReclamations > 0
                    ? `/dashboard/reclamations?enseignantId=${enseignant.id}`
                    : undefined
                }
                linkLabel="Voir les réclamations"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 11 : HISTORIQUE SALAIRE
              ═══════════════════════════════════════ */}
          {activeTab === 'historiqueSalaire' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={ArrowTrendingUpIcon}
                title="Historique des salaires"
                description="Évolution du salaire de base de cet enseignant."
                count={nbHistoriquesSalaire}
                color="text-green-500"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 12 : GROUPES TD
              ═══════════════════════════════════════ */}
          {activeTab === 'groupesTD' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={UserGroupIcon}
                title="Groupes TD"
                description="Groupes de travaux dirigés animés par cet enseignant."
                count={nbGroupesTD}
                color="text-indigo-500"
                link={
                  nbGroupesTD > 0
                    ? `/dashboard/groupes-td?enseignantId=${enseignant.id}`
                    : undefined
                }
                linkLabel="Voir les groupes TD"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 13 : DOCUMENTS
              ═══════════════════════════════════════ */}
          {activeTab === 'documents' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={FolderIcon}
                title="Documents"
                description="Supports de cours, exercices et documents partagés."
                count={nbDocuments}
                color="text-blue-500"
                link={
                  nbDocuments > 0
                    ? `/dashboard/documents?enseignantId=${enseignant.id}`
                    : undefined
                }
                linkLabel="Voir les documents"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 14 : COMMUNICATIONS
              ═══════════════════════════════════════ */}
          {activeTab === 'communications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={ChatBubbleLeftRightIcon}
                title="Communications"
                description="Messages échangés avec parents et administration."
                count={nbCommunications}
                color="text-teal-500"
                link={
                  nbCommunications > 0
                    ? `/dashboard/messages?enseignantId=${enseignant.id}`
                    : undefined
                }
                linkLabel="Voir les communications"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          ACTIONS BAS DE PAGE
          ═══════════════════════════════════════════ */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <Link
          to="/dashboard/enseignants"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour à la liste
        </Link>
        <Link
          to={`/dashboard/enseignants/${enseignant.id}/editer`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium border border-amber-200"
        >
          <PencilSquareIcon className="w-4 h-4" />
          Modifier cet enseignant
        </Link>
      </div>
    </div>
  );
};

export default EnseignantDetailPage;