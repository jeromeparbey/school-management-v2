
import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
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
  AcademicCapIcon,
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
  ExclamationCircleIcon,
  CalendarIcon,
  UserIcon,
  ReceiptPercentIcon,
  HeartIcon,
  ExclamationTriangleIcon as AlertIcon,
} from '@heroicons/react/24/outline';
import {
  useEleve,
  useSoftDeleteEleve,
  useHardDeleteEleve,
} from '../../../../hooks/useEleves';

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

const calculerAge = (dateNaissance: string) => {
  const diff = Date.now() - new Date(dateNaissance).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const STATUT_COLORS: Record<
  string,
  { bg: string; text: string; label: string; icon: any }
> = {
  ACTIF: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    label: 'Actif',
    icon: CheckCircleIcon,
  },
  TRANSFERE: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    label: 'Transféré',
    icon: ArrowPathIcon,
  },
  SORTI: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    label: 'Sorti',
    icon: XCircleIcon,
  },
  SUSPENDU: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    label: 'Suspendu',
    icon: ExclamationTriangleIcon,
  },
  ARCHIVE: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    label: 'Archivé',
    icon: XCircleIcon,
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
  | 'inscriptions'
  | 'notes'
  | 'bulletins'
  | 'paiements'
  | 'presences'
  | 'absences'
  | 'parents'
  | 'responsables'
  | 'emprunts'
  | 'incidents'
  | 'objectifs'
  | 'reductions'
  | 'communications';

const EleveDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('infos');

  const { data: eleveData, isLoading, isError, error, refetch } =
    useEleve(id);

  const softDeleteMutation = useSoftDeleteEleve();
  const hardDeleteMutation = useHardDeleteEleve();

  const eleve = eleveData;

  const handleSoftDelete = async () => {
    if (!eleve) return;
    if (
      !confirm(
        `Archiver "${eleve.prenom} ${eleve.nom}" ?\n\nLe compte sera désactivé et l'élève passera au statut ARCHIVÉ.`
      )
    )
      return;
    try {
      await softDeleteMutation.mutateAsync(eleve.id);
      navigate('/dashboard/eleves');
    } catch {
      /* toast géré */
    }
  };

  const handleHardDelete = async () => {
    if (!eleve) return;
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\n${eleve.prenom} ${eleve.nom}\nMatricule : ${eleve.matricule}\n\nCette action est IRRÉVERSIBLE.\n\nContinuer ?`
    );
    if (!confirmed) return;

    const doubleCheck = prompt(
      `Pour confirmer, tapez le matricule : "${eleve.matricule}"`
    );
    if (doubleCheck !== eleve.matricule) {
      alert('Matricule incorrect. Suppression annulée.');
      return;
    }

    try {
      await hardDeleteMutation.mutateAsync(eleve.id);
      navigate('/dashboard/eleves');
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
  if (isError || !eleve) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Élève introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/dashboard/eleves"
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

  const statutStyle =
    STATUT_COLORS[eleve.statut] ?? STATUT_COLORS.ACTIF;
  const StatutIcon = statutStyle.icon;
  const age = calculerAge(eleve.dateNaissance);
  const classeActuelle = eleve.inscriptions?.[0]?.classe;

  // Compteurs
  const nbInscriptions = eleve.inscriptions?.length ?? 0;
  const nbNotes = eleve._count?.notes ?? 0;
  const nbBulletins = 0; // à ajouter dans _count
  const nbPaiements = eleve._count?.paiements ?? 0;
  const nbPresences = eleve._count?.presences ?? 0;
  const nbAbsences = eleve._count?.absences ?? 0;
  const nbParents = eleve.parents?.length ?? 0;
  const nbResponsables = eleve.responsables?.length ?? 0;
  const nbEmprunts = eleve._count?.empruntsLivres ?? 0;
  const nbIncidents = 0; // à ajouter dans _count
  const nbObjectifs = 0; // à ajouter dans _count
  const nbReductions = 0; // à ajouter dans _count
  const nbCommunications = 0; // à ajouter dans _count

  // Onglets (2 rangées)
  const tabsRow1 = [
    { key: 'infos', label: 'Informations', icon: IdentificationIcon },
    {
      key: 'inscriptions',
      label: 'Inscriptions',
      icon: AcademicCapIcon,
      badge: nbInscriptions,
    },
    { key: 'notes', label: 'Notes', icon: DocumentTextIcon, badge: nbNotes },
    {
      key: 'bulletins',
      label: 'Bulletins',
      icon: DocumentTextIcon,
      badge: nbBulletins,
    },
    {
      key: 'paiements',
      label: 'Paiements',
      icon: BanknotesIcon,
      badge: nbPaiements,
    },
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
      key: 'parents',
      label: 'Parents',
      icon: UserIcon,
      badge: nbParents,
    },
    {
      key: 'responsables',
      label: 'Responsables',
      icon: UserCircleIcon,
      badge: nbResponsables,
    },
    {
      key: 'emprunts',
      label: 'Bibliothèque',
      icon: BookOpenIcon,
      badge: nbEmprunts,
    },
    {
      key: 'incidents',
      label: 'Incidents',
      icon: ExclamationCircleIcon,
      badge: nbIncidents,
    },
    {
      key: 'objectifs',
      label: 'Objectifs',
      icon: ChartBarIcon,
      badge: nbObjectifs,
    },
    {
      key: 'reductions',
      label: 'Réductions',
      icon: ReceiptPercentIcon,
      badge: nbReductions,
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
        <Link to="/dashboard/eleves" className="hover:text-gray-900">
          Élèves
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">
          {eleve.prenom} {eleve.nom}
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
              to="/dashboard/eleves"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            {eleve.photo ? (
              <img
                src={eleve.photo}
                alt={eleve.nom}
                className="w-20 h-20 rounded-2xl object-cover border border-gray-100 shrink-0"
              />
            ) : (
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0 ${
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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {eleve.prenom} {eleve.nom}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${statutStyle.bg} ${statutStyle.text}`}
                >
                  <StatutIcon className="w-3.5 h-3.5" />
                  {statutStyle.label}
                </span>
                {classeActuelle && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                    <AcademicCapIcon className="w-3.5 h-3.5" />
                    {classeActuelle.nom}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                  {eleve.matricule}
                </span>
                <span className="flex items-center gap-1">
                  🎂 {age} ans
                </span>
                <span className="flex items-center gap-1">
                  {eleve.sexe === 'F' ? '♀' : '♂'}{' '}
                  {eleve.sexe === 'F' ? 'Féminin' : 'Masculin'}
                </span>
                {eleve.telephone && (
                  <a
                    href={`tel:${eleve.telephone}`}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    {eleve.telephone}
                  </a>
                )}
                {eleve.email && (
                  <a
                    href={`mailto:${eleve.email}`}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    {eleve.email}
                  </a>
                )}
              </div>

              {eleve.utilisateur && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  Compte actif
                  {eleve.utilisateur.emailVerifie && (
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
              to={`/dashboard/eleves/${eleve.id}/editer`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 border border-amber-200"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Modifier
            </Link>
            {eleve.statut !== 'ARCHIVE' && (
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
          label="Inscriptions"
          value={nbInscriptions}
          icon={AcademicCapIcon}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Notes"
          value={nbNotes}
          icon={DocumentTextIcon}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Paiements"
          value={nbPaiements}
          icon={BanknotesIcon}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatCard
          label="Présences"
          value={nbPresences}
          icon={CheckCircleIcon}
          color="text-cyan-600"
          bgColor="bg-cyan-50"
        />
        <StatCard
          label="Absences"
          value={nbAbsences}
          icon={CalendarIcon}
          color="text-rose-600"
          bgColor="bg-rose-50"
        />
        <StatCard
          label="Parents"
          value={nbParents}
          icon={UserIcon}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          label="Emprunts livres"
          value={nbEmprunts}
          icon={BookOpenIcon}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <StatCard
          label="Incidents"
          value={nbIncidents}
          icon={ExclamationCircleIcon}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          label="Objectifs"
          value={nbObjectifs}
          icon={ChartBarIcon}
          color="text-teal-600"
          bgColor="bg-teal-50"
        />
      </div>

      {/* ═══════════════════════════════════════════
          ONGLETS (2 rangées)
          ═══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="border-b border-gray-100">
          {/* Rangée 1 */}
          <div className="flex overflow-x-auto border-b border-gray-100">
            {tabsRow1.map((tab) => (
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
                <TabBadge count={tab.badge ?? 0} />
              </button>
            ))}
          </div>

          {/* Rangée 2 */}
          <div className="flex overflow-x-auto bg-gray-50/50">
            {tabsRow2.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 bg-white'
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
                  <UserCircleIcon className="w-4 h-4 text-blue-500" />
                  Identité
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Nom complet"
                    value={`${eleve.prenom} ${eleve.nom}`}
                    icon={UserCircleIcon}
                  />
                  <InfoRow
                    label="Matricule"
                    value={
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                        {eleve.matricule}
                      </span>
                    }
                    icon={IdentificationIcon}
                  />
                  <InfoRow
                    label="Sexe"
                    value={eleve.sexe === 'M' ? 'Masculin' : 'Féminin'}
                    icon={UserCircleIcon}
                  />
                  <InfoRow
                    label="Date de naissance"
                    value={
                      <div>
                        {formatDate(eleve.dateNaissance)}
                        <span className="ml-2 text-xs text-gray-500">
                          ({age} ans)
                        </span>
                      </div>
                    }
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Lieu de naissance"
                    value={eleve.lieuNaissance ?? '—'}
                    icon={MapPinIcon}
                  />
                  <InfoRow
                    label="Nationalité"
                    value={eleve.nationalite ?? '—'}
                    icon={UserCircleIcon}
                  />
                  <InfoRow
                    label="Adresse"
                    value={eleve.adresse ?? '—'}
                    icon={MapPinIcon}
                  />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-blue-500" />
                  Contact
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Téléphone"
                    value={
                      eleve.telephone ? (
                        <a
                          href={`tel:${eleve.telephone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {eleve.telephone}
                        </a>
                      ) : (
                        '—'
                      )
                    }
                    icon={PhoneIcon}
                  />
                  <InfoRow
                    label="Email"
                    value={
                      eleve.email ? (
                        <a
                          href={`mailto:${eleve.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {eleve.email}
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
                  <HeartIcon className="w-4 h-4 text-blue-500" />
                  Informations médicales
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Groupe sanguin"
                    value={
                      eleve.groupeSanguin ? (
                        <span className="font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded">
                          {eleve.groupeSanguin}
                        </span>
                      ) : (
                        '—'
                      )
                    }
                    icon={HeartIcon}
                  />
                  <InfoRow
                    label="Allergies"
                    value={eleve.allergies ?? '—'}
                    icon={AlertIcon}
                  />
                  <InfoRow
                    label="Informations médicales"
                    value={eleve.infoMedicale ?? '—'}
                    icon={InformationCircleIcon}
                  />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <AcademicCapIcon className="w-4 h-4 text-blue-500" />
                  Scolarité actuelle
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Classe"
                    value={
                      classeActuelle ? (
                        <div>
                          <span className="font-semibold">
                            {classeActuelle.nom}
                          </span>
                          <span className="ml-2 font-mono text-xs text-gray-500">
                            {classeActuelle.code}
                          </span>
                        </div>
                      ) : (
                        'Aucune inscription active'
                      )
                    }
                    icon={AcademicCapIcon}
                  />
                  <InfoRow
                    label="Statut"
                    value={
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statutStyle.bg} ${statutStyle.text}`}
                      >
                        {statutStyle.label}
                      </span>
                    }
                    icon={StatutIcon}
                  />
                </div>

                {eleve.utilisateur && (
                  <>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                      <UserCircleIcon className="w-4 h-4 text-blue-500" />
                      Compte utilisateur
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <InfoRow
                        label="Email de connexion"
                        value={eleve.utilisateur.email}
                        icon={EnvelopeIcon}
                      />
                      <InfoRow
                        label="Email vérifié"
                        value={
                          eleve.utilisateur.emailVerifie ? (
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
                          eleve.utilisateur.derniereConnexion
                        )}
                        icon={ClockIcon}
                      />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 2 : INSCRIPTIONS
              ═══════════════════════════════════════ */}
          {activeTab === 'inscriptions' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={AcademicCapIcon}
                title="Inscriptions"
                description="Historique des inscriptions de cet élève."
                count={nbInscriptions}
                color="text-blue-500"
                link={
                  nbInscriptions > 0
                    ? `/dashboard/inscriptions?eleveId=${eleve.id}`
                    : undefined
                }
                linkLabel="Voir les inscriptions"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 3 : NOTES
              ═══════════════════════════════════════ */}
          {activeTab === 'notes' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={DocumentTextIcon}
                title="Notes"
                description="Toutes les notes obtenues par cet élève."
                count={nbNotes}
                color="text-emerald-500"
                link={
                  nbNotes > 0
                    ? `/dashboard/notes?eleveId=${eleve.id}`
                    : undefined
                }
                linkLabel="Voir les notes"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 4 : BULLETINS
              ═══════════════════════════════════════ */}
          {activeTab === 'bulletins' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={DocumentTextIcon}
                title="Bulletins"
                description="Bulletins scolaires validés de cet élève."
                count={nbBulletins}
                color="text-purple-500"
                link={
                  nbBulletins > 0
                    ? `/dashboard/bulletins?eleveId=${eleve.id}`
                    : undefined
                }
                linkLabel="Voir les bulletins"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 5 : PAIEMENTS
              ═══════════════════════════════════════ */}
          {activeTab === 'paiements' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={BanknotesIcon}
                title="Paiements"
                description="Historique des paiements de scolarité et reçus."
                count={nbPaiements}
                color="text-orange-500"
                link={
                  nbPaiements > 0
                    ? `/dashboard/paiements?eleveId=${eleve.id}`
                    : undefined
                }
                linkLabel="Voir les paiements"
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
                description="Historique des présences et retards de cet élève."
                count={nbPresences}
                color="text-cyan-500"
                link={
                  nbPresences > 0
                    ? `/dashboard/presences-eleves?eleveId=${eleve.id}`
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
                description="Absences justifiées et non justifiées."
                count={nbAbsences}
                color="text-rose-500"
                link={
                  nbAbsences > 0
                    ? `/dashboard/absences-eleves?eleveId=${eleve.id}`
                    : undefined
                }
                linkLabel="Voir les absences"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 8 : PARENTS
              ═══════════════════════════════════════ */}
          {activeTab === 'parents' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {eleve.parents && eleve.parents.length > 0 ? (
                <div className="space-y-3">
                  {eleve.parents.map((pe: any) => (
                    <div
                      key={pe.id}
                      className="bg-gray-50 rounded-xl p-4 flex items-start gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0">
                        {pe.parent?.utilisateur?.prenom?.charAt(0) ?? '?'}
                        {pe.parent?.utilisateur?.nom?.charAt(0) ?? '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">
                            {pe.parent?.utilisateur?.prenom}{' '}
                            {pe.parent?.utilisateur?.nom}
                          </p>
                          {pe.estPrincipal && (
                            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                              Parent principal
                            </span>
                          )}
                          <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                            {pe.lien}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {pe.parent?.utilisateur?.email}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link
                    to={`/dashboard/parents?eleveId=${eleve.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                  >
                    <UserIcon className="w-4 h-4" />
                    Gérer les parents
                  </Link>
                </div>
              ) : (
                <ComingSoonPanel
                  icon={UserIcon}
                  title="Aucun parent enregistré"
                  description="Aucun parent n'est encore lié à cet élève."
                  color="text-purple-500"
                />
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 9 : RESPONSABLES
              ═══════════════════════════════════════ */}
          {activeTab === 'responsables' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {eleve.responsables && eleve.responsables.length > 0 ? (
                <div className="space-y-3">
                  {eleve.responsables.map((r: any) => (
                    <div
                      key={r.id}
                      className="bg-gray-50 rounded-xl p-4 flex items-start gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
                        {r.prenom?.charAt(0)}
                        {r.nom?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">
                            {r.prenom} {r.nom}
                          </p>
                          <span className="px-2 py-0.5 text-xs bg-teal-100 text-teal-700 rounded-full">
                            {r.lien}
                          </span>
                          {r.estPrincipal && (
                            <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {r.telephone}
                          {r.email && ` — ${r.email}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ComingSoonPanel
                  icon={UserCircleIcon}
                  title="Aucun responsable"
                  description="Aucun responsable n'est enregistré pour cet élève."
                  color="text-teal-500"
                />
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 10 : EMPRUNTS BIBLIOTHÈQUE
              ═══════════════════════════════════════ */}
          {activeTab === 'emprunts' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={BookOpenIcon}
                title="Emprunts bibliothèque"
                description="Livres empruntés par cet élève."
                count={nbEmprunts}
                color="text-indigo-500"
                link={
                  nbEmprunts > 0
                    ? `/dashboard/bibliotheque?eleveId=${eleve.id}`
                    : undefined
                }
                linkLabel="Voir les emprunts"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 11 : INCIDENTS
              ═══════════════════════════════════════ */}
          {activeTab === 'incidents' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={ExclamationCircleIcon}
                title="Incidents"
                description="Incidents disciplinaires signalés pour cet élève."
                count={nbIncidents}
                color="text-red-500"
                link={
                  nbIncidents > 0
                    ? `/dashboard/incidents?eleveId=${eleve.id}`
                    : undefined
                }
                linkLabel="Voir les incidents"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 12 : OBJECTIFS
              ═══════════════════════════════════════ */}
          {activeTab === 'objectifs' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={ChartBarIcon}
                title="Objectifs"
                description="Objectifs pédagogiques assignés à cet élève."
                count={nbObjectifs}
                color="text-teal-500"
                link={
                  nbObjectifs > 0
                    ? `/dashboard/objectifs?eleveId=${eleve.id}`
                    : undefined
                }
                linkLabel="Voir les objectifs"
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET 13 : RÉDUCTIONS
              ═══════════════════════════════════════ */}
          {activeTab === 'reductions' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ComingSoonPanel
                icon={ReceiptPercentIcon}
                title="Réductions"
                description="Réductions et bourses appliquées sur la scolarité."
                count={nbReductions}
                color="text-amber-500"
                link={
                  nbReductions > 0
                    ? `/dashboard/reductions?eleveId=${eleve.id}`
                    : undefined
                }
                linkLabel="Voir les réductions"
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
                description="Messages échangés concernant cet élève."
                count={nbCommunications}
                color="text-teal-500"
                link={
                  nbCommunications > 0
                    ? `/dashboard/messages?eleveId=${eleve.id}`
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
          to="/dashboard/eleves"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour à la liste
        </Link>
        <Link
          to={`/dashboard/eleves/${eleve.id}/editer`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium border border-amber-200"
        >
          <PencilSquareIcon className="w-4 h-4" />
          Modifier cet élève
        </Link>
      </div>
    </div>
  );
};

export default EleveDetailPage;