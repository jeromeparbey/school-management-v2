// frontend2/src/pages/dashboard/directeur/eleves/EleveDetailPage.tsx

import React, { useMemo, useState } from 'react';
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

const formatMoney = (amount: number | null | undefined) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
};

const calculerAge = (dateNaissance: string) => {
  const diff = Date.now() - new Date(dateNaissance).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const JOURS_LABEL: Record<string, string> = {
  LUNDI: 'Lundi',
  MARDI: 'Mardi',
  MERCREDI: 'Mercredi',
  JEUDI: 'Jeudi',
  VENDREDI: 'Vendredi',
  SAMEDI: 'Samedi',
  DIMANCHE: 'Dimanche',
};

const STATUT_COLORS: Record<
  string,
  { bg: string; text: string; label: string; icon: any }
> = {
  ACTIF: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Actif', icon: CheckCircleIcon },
  TRANSFERE: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Transféré', icon: ArrowPathIcon },
  SORTI: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Sorti', icon: XCircleIcon },
  SUSPENDU: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Suspendu', icon: ExclamationTriangleIcon },
  ARCHIVE: { bg: 'bg-red-50', text: 'text-red-700', label: 'Archivé', icon: XCircleIcon },
};

const STATUT_ECHEANCE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  PAYEE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Payée' },
  PARTIELLE: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Partielle' },
  IMPAYEE: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Impayée' },
  EN_RETARD: { bg: 'bg-red-100', text: 'text-red-700', label: 'En retard' },
};

const STATUT_PRESENCE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  PRESENT: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Présent' },
  ABSENT: { bg: 'bg-red-100', text: 'text-red-700', label: 'Absent' },
  RETARD: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Retard' },
  EXCUSE: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Excusé' },
  SORTIE_ANTICIPEE: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Sortie anticipée' },
};

const STATUT_DEMANDE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  BROUILLON: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Brouillon' },
  SOUMISE: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Soumise' },
  APPROUVEE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Approuvée' },
  REJETEE: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejetée' },
  ANNULEE: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Annulée' },
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
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
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

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, bgColor, hint }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4">
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1 truncate">{value}</p>
        {hint && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{hint}</p>}
      </div>
      <div className={`p-2 rounded-lg ${bgColor} shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

const EmptyPanel: React.FC<{
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  color?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, description, color = 'text-gray-400', action }) => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
      <Icon className={`w-10 h-10 ${color}`} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
    <p className="text-gray-500 mb-4 max-w-md mx-auto">{description}</p>
    {action}
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
  | 'infos' | 'inscriptions' | 'notes' | 'bulletins' | 'paiements'
  | 'presences' | 'absences' | 'emploiTemps' | 'equipe'
  | 'parents' | 'responsables' | 'emprunts' | 'incidents'
  | 'objectifs' | 'reductions' | 'communications';

const EleveDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('infos');

  const { data: eleveData, isLoading, isError, error, refetch } = useEleve(id);

  const softDeleteMutation = useSoftDeleteEleve();
  const hardDeleteMutation = useHardDeleteEleve();

  const eleve = eleveData;

  const handleSoftDelete = async () => {
    if (!eleve) return;
    if (!confirm(`Archiver "${eleve.prenom} ${eleve.nom}" ?\n\nLe compte sera désactivé et l'élève passera au statut ARCHIVÉ.`)) return;
    try {
      await softDeleteMutation.mutateAsync(eleve.id);
      navigate('/dashboard/eleves');
    } catch { /* toast géré */ }
  };

  const handleHardDelete = async () => {
    if (!eleve) return;
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\n${eleve.prenom} ${eleve.nom}\nMatricule : ${eleve.matricule}\n\nCette action est IRRÉVERSIBLE.\n\nContinuer ?`
    );
    if (!confirmed) return;
    const doubleCheck = prompt(`Pour confirmer, tapez le matricule : "${eleve.matricule}"`);
    if (doubleCheck !== eleve.matricule) {
      alert('Matricule incorrect. Suppression annulée.');
      return;
    }
    try {
      await hardDeleteMutation.mutateAsync(eleve.id);
      navigate('/dashboard/eleves');
    } catch { /* toast géré */ }
  };

  // ─── Données dérivées (stables entre renders) ───
  const derived = useMemo(() => {
    if (!eleve) return null;
    const finance = eleve._finance;
    const stats = eleve._stats;
    const classeActuelle = eleve.classeActive ?? eleve.inscriptions?.[0]?.classe ?? null;
    const age = calculerAge(eleve.dateNaissance);

    const echeances = (eleve.assignmentsScolarite ?? []).flatMap((a: any) =>
      (a.planScolarite?.echeances ?? []).map((e: any) => ({
        ...e,
        planNom: a.planScolarite?.nom,
        classeNom: a.classe?.nom ?? null,
      }))
    );

    return {
      finance,
      stats,
      classeActuelle,
      age,
      echeances,
      nbInscriptions: eleve.inscriptions?.length ?? 0,
      nbNotes: eleve._count?.notes ?? 0,
      nbBulletins: eleve._count?.bulletins ?? 0,
      nbPaiements: eleve._count?.paiements ?? 0,
      nbPresences: eleve._count?.presences ?? 0,
      nbAbsences: eleve._count?.absences ?? 0,
      nbParents: eleve.parents?.length ?? 0,
      nbResponsables: eleve.responsables?.length ?? 0,
      nbEmprunts: eleve._count?.empruntsLivres ?? 0,
      nbIncidents: eleve._count?.incidents ?? 0,
      nbObjectifs: eleve._count?.objectifs ?? 0,
      nbReductions: eleve._count?.reductions ?? 0,
      nbCommunications: eleve._count?.communications ?? 0,
      nbEmploiTemps: eleve.emploiTemps?.length ?? 0,
      nbEquipe: eleve.equipePedagogique?.length ?? 0,
    };
  }, [eleve]);

  // ─── Loading ───
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

  // ─── Erreur ───
  if (isError || !eleve || !derived) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Élève introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ?? 'Une erreur est survenue'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link to="/dashboard/eleves" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg">
              <ArrowLeftIcon className="w-4 h-4" /> Retour
            </Link>
            <button onClick={() => refetch()} className="px-4 py-2 bg-red-600 text-white rounded-lg">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    finance, stats, classeActuelle, age, echeances,
    nbInscriptions, nbNotes, nbBulletins, nbPaiements,
    nbPresences, nbAbsences, nbParents, nbResponsables,
    nbEmprunts, nbIncidents, nbObjectifs, nbReductions,
    nbCommunications, nbEmploiTemps, nbEquipe,
  } = derived;

  const statutStyle = STATUT_COLORS[eleve.statut] ?? STATUT_COLORS.ACTIF;
  const StatutIcon = statutStyle.icon;

  // ─── Onglets ───
  const tabsRow1 = [
    { key: 'infos', label: 'Informations', icon: IdentificationIcon, badge: 0 },
    { key: 'inscriptions', label: 'Inscriptions', icon: AcademicCapIcon, badge: nbInscriptions },
    { key: 'notes', label: 'Notes', icon: DocumentTextIcon, badge: nbNotes },
    { key: 'bulletins', label: 'Bulletins', icon: DocumentTextIcon, badge: nbBulletins },
    { key: 'paiements', label: 'Paiements', icon: BanknotesIcon, badge: nbPaiements },
  ];

  const tabsRow2 = [
    { key: 'presences', label: 'Présences', icon: CheckCircleIcon, badge: nbPresences },
    { key: 'absences', label: 'Absences', icon: CalendarIcon, badge: nbAbsences },
    { key: 'emploiTemps', label: 'Emploi du temps', icon: ClockIcon, badge: nbEmploiTemps },
    { key: 'equipe', label: 'Équipe pédagogique', icon: UserGroupIcon, badge: nbEquipe },
    { key: 'parents', label: 'Parents', icon: UserIcon, badge: nbParents },
    { key: 'responsables', label: 'Responsables', icon: UserCircleIcon, badge: nbResponsables },
    { key: 'emprunts', label: 'Bibliothèque', icon: BookOpenIcon, badge: nbEmprunts },
    { key: 'incidents', label: 'Incidents', icon: ExclamationCircleIcon, badge: nbIncidents },
    { key: 'objectifs', label: 'Objectifs', icon: ChartBarIcon, badge: nbObjectifs },
    { key: 'reductions', label: 'Réductions', icon: ReceiptPercentIcon, badge: nbReductions },
    { key: 'communications', label: 'Communications', icon: ChatBubbleLeftRightIcon, badge: nbCommunications },
  ];

  return (
    <div className="space-y-6">
      {/* ─────────── BREADCRUMB ─────────── */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/eleves" className="hover:text-gray-900">Élèves</Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">
          {eleve.prenom} {eleve.nom}
        </span>
      </nav>

      {/* ─────────── EN-TÊTE ─────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Link to="/dashboard/eleves" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            {eleve.photo ? (
              <img src={eleve.photo} alt={eleve.nom} className="w-20 h-20 rounded-2xl object-cover border border-gray-100 shrink-0" />
            ) : (
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0 ${
                eleve.sexe === 'F'
                  ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-500'
              }`}>
                {eleve.prenom.charAt(0)}{eleve.nom.charAt(0)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {eleve.prenom} {eleve.nom}
                </h1>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${statutStyle.bg} ${statutStyle.text}`}>
                  <StatutIcon className="w-3.5 h-3.5" /> {statutStyle.label}
                </span>
                {classeActuelle && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                    <AcademicCapIcon className="w-3.5 h-3.5" /> {classeActuelle.nom}
                  </span>
                )}
                {/* 🆕 Badge financier */}
                {finance && (
                  finance.estEnRetard ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-full">
                      <ExclamationCircleIcon className="w-3.5 h-3.5" />
                      En retard {formatMoney(finance.totalRetard)}
                    </span>
                  ) : finance.estAJour ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      À jour
                    </span>
                  ) : null
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">{eleve.matricule}</span>
                <span className="flex items-center gap-1">🎂 {age} ans</span>
                <span className="flex items-center gap-1">
                  {eleve.sexe === 'F' ? '♀' : '♂'} {eleve.sexe === 'F' ? 'Féminin' : 'Masculin'}
                </span>
                {eleve.telephone && (
                  <a href={`tel:${eleve.telephone}`} className="flex items-center gap-1 hover:text-blue-600">
                    <PhoneIcon className="w-4 h-4" /> {eleve.telephone}
                  </a>
                )}
                {eleve.email && (
                  <a href={`mailto:${eleve.email}`} className="flex items-center gap-1 hover:text-blue-600">
                    <EnvelopeIcon className="w-4 h-4" /> {eleve.email}
                  </a>
                )}
              </div>

              {eleve.utilisateur && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircleIcon className="w-3.5 h-3.5" /> Compte actif
                  {eleve.utilisateur.emailVerifie && (
                    <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 rounded-full">email vérifié</span>
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
              <PencilSquareIcon className="w-4 h-4" /> Modifier
            </Link>
            {eleve.statut !== 'ARCHIVE' && (
              <button
                onClick={handleSoftDelete}
                disabled={softDeleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 font-medium rounded-lg hover:bg-orange-100 border border-orange-200 disabled:opacity-50"
              >
                <XCircleIcon className="w-4 h-4" /> Archiver
              </button>
            )}
            <button
              onClick={handleHardDelete}
              disabled={hardDeleteMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 border border-red-200 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" /> Supprimer
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─────────── STATS RAPIDES ─────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Reste à payer"
          value={formatMoney(finance?.totalRestant ?? 0)}
          icon={BanknotesIcon}
          color="text-red-600"
          bgColor="bg-red-50"
          hint={finance?.nombreEcheances ? `${finance.nombreEcheances - finance.nombreEcheancesPayees} échéance(s)` : '—'}
        />
        <StatCard
          label="En retard"
          value={formatMoney(finance?.totalRetard ?? 0)}
          icon={ExclamationCircleIcon}
          color="text-orange-600"
          bgColor="bg-orange-50"
          hint={finance?.nombreEcheancesRetard ? `${finance.nombreEcheancesRetard} échéance(s)` : 'Aucun'}
        />
        <StatCard
          label="Taux paiement"
          value={`${finance?.tauxPaiement ?? 0}%`}
          icon={ChartBarIcon}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          hint={finance ? `${formatMoney(finance.totalPaye)} / ${formatMoney(finance.totalDu)}` : '—'}
        />
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

      {/* ─────────── ONGLETS ─────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="border-b border-gray-100">
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
                <tab.icon className="w-4 h-4" /> {tab.label}
                <TabBadge count={tab.badge ?? 0} />
              </button>
            ))}
          </div>
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
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                <TabBadge count={tab.badge ?? 0} />
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* ═══ INFOS ═══ */}
          {activeTab === 'infos' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <UserCircleIcon className="w-4 h-4 text-blue-500" /> Identité
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow label="Nom complet" value={`${eleve.prenom} ${eleve.nom}`} icon={UserCircleIcon} />
                  <InfoRow label="Matricule" value={<span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">{eleve.matricule}</span>} icon={IdentificationIcon} />
                  <InfoRow label="Sexe" value={eleve.sexe === 'M' ? 'Masculin' : 'Féminin'} icon={UserCircleIcon} />
                  <InfoRow label="Date de naissance" value={<div>{formatDate(eleve.dateNaissance)}<span className="ml-2 text-xs text-gray-500">({age} ans)</span></div>} icon={CalendarDaysIcon} />
                  <InfoRow label="Lieu de naissance" value={eleve.lieuNaissance ?? '—'} icon={MapPinIcon} />
                  <InfoRow label="Nationalité" value={eleve.nationalite ?? '—'} icon={UserCircleIcon} />
                  <InfoRow label="Adresse" value={eleve.adresse ?? '—'} icon={MapPinIcon} />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-blue-500" /> Contact
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow label="Téléphone" value={eleve.telephone ? <a href={`tel:${eleve.telephone}`} className="text-blue-600 hover:underline">{eleve.telephone}</a> : '—'} icon={PhoneIcon} />
                  <InfoRow label="Email" value={eleve.email ? <a href={`mailto:${eleve.email}`} className="text-blue-600 hover:underline">{eleve.email}</a> : '—'} icon={EnvelopeIcon} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <HeartIcon className="w-4 h-4 text-blue-500" /> Informations médicales
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow label="Groupe sanguin" value={eleve.groupeSanguin ? <span className="font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded">{eleve.groupeSanguin}</span> : '—'} icon={HeartIcon} />
                  <InfoRow label="Allergies" value={eleve.allergies ?? '—'} icon={AlertIcon} />
                  <InfoRow label="Informations médicales" value={eleve.infoMedicale ?? '—'} icon={InformationCircleIcon} />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <AcademicCapIcon className="w-4 h-4 text-blue-500" /> Scolarité actuelle
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow label="Classe" value={classeActuelle ? <div><span className="font-semibold">{classeActuelle.nom}</span><span className="ml-2 font-mono text-xs text-gray-500">{classeActuelle.code}</span></div> : 'Aucune inscription active'} icon={AcademicCapIcon} />
                  <InfoRow label="Statut" value={<span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statutStyle.bg} ${statutStyle.text}`}>{statutStyle.label}</span>} icon={StatutIcon} />
                </div>

                {eleve.utilisateur && (
                  <>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                      <UserCircleIcon className="w-4 h-4 text-blue-500" /> Compte utilisateur
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <InfoRow label="Email de connexion" value={eleve.utilisateur.email} icon={EnvelopeIcon} />
                      <InfoRow label="Email vérifié" value={eleve.utilisateur.emailVerifie ? <span className="flex items-center gap-1 text-emerald-600"><CheckCircleIcon className="w-4 h-4" /> Oui</span> : <span className="flex items-center gap-1 text-orange-600"><ExclamationTriangleIcon className="w-4 h-4" /> Non</span>} icon={CheckCircleIcon} />
                      <InfoRow label="Dernière connexion" value={formatDateTime(eleve.utilisateur.derniereConnexion)} icon={ClockIcon} />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ INSCRIPTIONS ═══ */}
          {activeTab === 'inscriptions' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {!eleve.inscriptions || eleve.inscriptions.length === 0 ? (
                <EmptyPanel icon={AcademicCapIcon} title="Aucune inscription" description="Cet élève n'a aucune inscription enregistrée." color="text-blue-500" />
              ) : (
                <div className="space-y-2">
                  {eleve.inscriptions.map((i: any) => (
                    <div key={i.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{i.classe?.nom} <span className="font-mono text-xs text-gray-500">{i.classe?.code}</span></p>
                        <p className="text-xs text-gray-500 mt-0.5">{i.anneeScolaire?.nom} — inscrit le {formatDate(i.dateInscription)}</p>
                      </div>
                      {i.estActive && (
                        <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full shrink-0">Active</span>
                      )}
                    </div>
                  ))}
                  <Link to={`/dashboard/inscriptions?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    <AcademicCapIcon className="w-4 h-4" /> Gérer les inscriptions
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ NOTES ═══ */}
          {activeTab === 'notes' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {!eleve.notes || eleve.notes.length === 0 ? (
                <EmptyPanel
                  icon={DocumentTextIcon}
                  title={`${nbNotes} note(s) enregistrée(s)`}
                  description="Aucune note récente à afficher. Consultez la liste complète."
                  color="text-emerald-500"
                  action={nbNotes > 0 && (
                    <Link to={`/dashboard/notes?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
                      <DocumentTextIcon className="w-4 h-4" /> Voir toutes les notes
                    </Link>
                  )}
                />
              ) : (
                <div className="space-y-2">
                  {eleve.notes.slice(0, 15).map((n: any) => (
                    <div key={n.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{n.matiere?.nom} — {n.regleEvaluation?.nom ?? n.regleEvaluation?.type}</p>
                        <p className="text-xs text-gray-500">{n.periode?.nom} • {formatDate(n.dateSaisie)} {n.enseignant && `• ${n.enseignant.prenom} ${n.enseignant.nom}`}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-gray-900">{n.valeur}<span className="text-xs text-gray-400">/{n.regleEvaluation?.baremeMax ?? 20}</span></p>
                        <p className="text-[10px] text-gray-500">coef. {n.coefficient}</p>
                      </div>
                    </div>
                  ))}
                  <Link to={`/dashboard/notes?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
                    <DocumentTextIcon className="w-4 h-4" /> Voir toutes les notes
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ BULLETINS ═══ */}
          {activeTab === 'bulletins' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <EmptyPanel
                icon={DocumentTextIcon}
                title={`${nbBulletins} bulletin(s)`}
                description="Consultez les bulletins validés de cet élève."
                color="text-purple-500"
                action={nbBulletins > 0 && (
                  <Link to={`/dashboard/bulletins?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
                    <DocumentTextIcon className="w-4 h-4" /> Voir les bulletins
                  </Link>
                )}
              />
            </motion.div>
          )}

          {/* ═══ PAIEMENTS (le gros morceau) ═══ */}
          {activeTab === 'paiements' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Résumé financier */}
              {finance && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">Total dû</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{formatMoney(finance.totalDu)}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs text-emerald-700">Total payé</p>
                    <p className="text-lg font-bold text-emerald-700 mt-1">{formatMoney(finance.totalPaye)}</p>
                  </div>
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-xs text-red-700">Total restant</p>
                    <p className="text-lg font-bold text-red-700 mt-1">{formatMoney(finance.totalRestant)}</p>
                  </div>
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <p className="text-xs text-orange-700">En retard</p>
                    <p className="text-lg font-bold text-orange-700 mt-1">{formatMoney(finance.totalRetard)}</p>
                    <p className="text-[10px] text-orange-600 mt-0.5">{finance.nombreEcheancesRetard} échéance(s)</p>
                  </div>
                </div>
              )}

              {/* Barre de progression */}
              {finance && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-gray-700">Progression du paiement</p>
                    <p className="text-xs font-bold text-gray-900">{finance.tauxPaiement}%</p>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        finance.estEnRetard ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, finance.tauxPaiement)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Échéances */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-500" /> Échéances
                  <span className="text-xs font-normal text-gray-500">({echeances.length})</span>
                </h3>
                {echeances.length === 0 ? (
                  <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-xl">Aucune échéance</div>
                ) : (
                  <div className="space-y-2">
                    {echeances.map((e: any) => {
                      const meta = e._meta ?? { statut: e.estPayee ? 'PAYEE' : 'IMPAYEE', montantPaye: 0, restant: e.montant, enRetard: false, joursRetard: 0 };
                      const st = STATUT_ECHEANCE_COLORS[meta.statut] ?? STATUT_ECHEANCE_COLORS.IMPAYEE;
                      return (
                        <div key={e.id} className="rounded-xl border border-gray-200 bg-white p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-gray-900 truncate">{e.nom}</p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${st.bg} ${st.text}`}>
                                  {st.label}
                                </span>
                                {meta.enRetard && meta.joursRetard > 0 && (
                                  <span className="text-[10px] text-red-600 font-medium">+{meta.joursRetard}j</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Échéance : {formatDate(e.dateLimite)} • {e.planNom}
                              </p>
                              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <p className="text-gray-500">Montant</p>
                                  <p className="font-semibold text-gray-900">{formatMoney(e.montant)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Payé</p>
                                  <p className="font-semibold text-emerald-600">{formatMoney(meta.montantPaye)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Restant</p>
                                  <p className="font-semibold text-red-600">{formatMoney(meta.restant)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Historique paiements */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BanknotesIcon className="w-4 h-4 text-orange-500" /> Historique des paiements
                  <span className="text-xs font-normal text-gray-500">({eleve.paiements?.length ?? 0})</span>
                </h3>
                {!eleve.paiements || eleve.paiements.length === 0 ? (
                  <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-xl">Aucun paiement enregistré</div>
                ) : (
                  <div className="space-y-2">
                    {eleve.paiements.slice(0, 15).map((p: any) => (
                      <div key={p.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 font-mono">{p.reference}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(p.datePaiement)} • {p.moyen}
                            {p.caissier && ` • par ${p.caissier.prenom} ${p.caissier.nom}`}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-gray-900">{formatMoney(p.montant)}</p>
                          <p className={`text-[10px] font-bold ${
                            p.statut === 'COMPLET' ? 'text-emerald-600' : p.statut === 'ANNULE' ? 'text-red-600' : 'text-gray-600'
                          }`}>{p.statut}</p>
                        </div>
                      </div>
                    ))}
                    <Link to={`/dashboard/paiements?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
                      <BanknotesIcon className="w-4 h-4" /> Voir tous les paiements
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ PRÉSENCES ═══ */}
          {activeTab === 'presences' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {!eleve.presences || eleve.presences.length === 0 ? (
                <EmptyPanel
                  icon={CheckCircleIcon}
                  title={`${nbPresences} pointage(s)`}
                  description="Aucune présence récente à afficher."
                  color="text-cyan-500"
                  action={nbPresences > 0 && (
                    <Link to={`/dashboard/presences-eleves?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium">
                      Voir les présences
                    </Link>
                  )}
                />
              ) : (
                <div className="space-y-2">
                  {eleve.presences.map((p: any) => {
                    const st = STATUT_PRESENCE_COLORS[p.statut] ?? STATUT_PRESENCE_COLORS.PRESENT;
                    return (
                      <div key={p.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">{formatDate(p.date)}</p>
                          <p className="text-xs text-gray-500">
                            {p.heureArrivee && `Arrivée ${new Date(p.heureArrivee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                            {p.motif && ` • ${p.motif}`}
                          </p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${st.bg} ${st.text}`}>{st.label}</span>
                      </div>
                    );
                  })}
                  <Link to={`/dashboard/presences-eleves?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium">
                    Voir toutes les présences
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ ABSENCES ═══ */}
          {activeTab === 'absences' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {!eleve.absences || eleve.absences.length === 0 ? (
                <EmptyPanel
                  icon={CalendarIcon}
                  title={`${nbAbsences} absence(s)`}
                  description="Aucune absence récente à afficher."
                  color="text-rose-500"
                  action={nbAbsences > 0 && (
                    <Link to={`/dashboard/absences-eleves?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-medium">
                      Voir les absences
                    </Link>
                  )}
                />
              ) : (
                <div className="space-y-2">
                  {eleve.absences.map((a: any) => {
                    const st = STATUT_DEMANDE_COLORS[a.statut] ?? STATUT_DEMANDE_COLORS.SOUMISE;
                    return (
                      <div key={a.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{a.motif}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(a.dateDebut)} → {formatDate(a.dateFin)} • {a.type}
                          </p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${st.bg} ${st.text}`}>{st.label}</span>
                      </div>
                    );
                  })}
                  <Link to={`/dashboard/absences-eleves?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-medium">
                    Voir toutes les absences
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ EMPLOI DU TEMPS ═══ */}
          {activeTab === 'emploiTemps' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {!eleve.emploiTemps || eleve.emploiTemps.length === 0 ? (
                <EmptyPanel
                  icon={ClockIcon}
                  title="Aucun emploi du temps"
                  description="Aucun créneau n'est défini pour la classe active de cet élève."
                  color="text-blue-500"
                />
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    eleve.emploiTemps.reduce((acc: Record<string, any[]>, c: any) => {
                      if (!acc[c.jour]) acc[c.jour] = [];
                      acc[c.jour].push(c);
                      return acc;
                    }, {})
                  ).map(([jour, cours]) => (
                    <div key={jour}>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{JOURS_LABEL[jour] ?? jour}</p>
                      <div className="space-y-2">
                        {(cours as any[]).map((c) => (
                          <div key={c.id} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                            <div className="w-14 text-center font-mono text-xs shrink-0 text-gray-700">
                              <p className="font-bold">{c.heureDebut}</p>
                              <p className="text-[10px] text-gray-400">→</p>
                              <p>{c.heureFin}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{c.matiere?.nom}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {c.enseignant?.prenom} {c.enseignant?.nom}
                                {c.salle && ` · ${c.salle}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ ÉQUIPE PÉDAGOGIQUE ═══ */}
          {activeTab === 'equipe' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {!eleve.equipePedagogique || eleve.equipePedagogique.length === 0 ? (
                <EmptyPanel
                  icon={UserGroupIcon}
                  title="Aucun enseignant affecté"
                  description="Aucun enseignant n'est affecté à la classe active de cet élève."
                  color="text-blue-500"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {eleve.equipePedagogique.map((aff: any) => (
                    <div key={aff.id} className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                        {aff.enseignant?.prenom?.charAt(0) ?? '?'}
                        {aff.enseignant?.nom?.charAt(0) ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {aff.enseignant?.prenom} {aff.enseignant?.nom}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{aff.matiere?.nom}</p>
                        {aff.heuresHebdo != null && (
                          <p className="text-[10px] text-gray-400 mt-0.5">{aff.heuresHebdo}h/sem</p>
                        )}
                      </div>
                      {aff.estPrincipal && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold shrink-0">PRINCIPAL</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ PARENTS ═══ */}
          {activeTab === 'parents' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {eleve.parents && eleve.parents.length > 0 ? (
                <div className="space-y-3">
                  {eleve.parents.map((pe: any) => (
                    <div key={pe.id} className="bg-gray-50 rounded-xl p-4 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold shrink-0">
                        {pe.parent?.utilisateur?.prenom?.charAt(0) ?? '?'}
                        {pe.parent?.utilisateur?.nom?.charAt(0) ?? '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">
                            {pe.parent?.utilisateur?.prenom} {pe.parent?.utilisateur?.nom}
                          </p>
                          {pe.estPrincipal && (
                            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">Parent principal</span>
                          )}
                          <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">{pe.lien}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{pe.parent?.utilisateur?.email}</p>
                        {pe.parent?.utilisateur?.telephone && (
                          <p className="text-xs text-gray-500">{pe.parent.utilisateur.telephone}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <Link to={`/dashboard/parents?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
                    <UserIcon className="w-4 h-4" /> Gérer les parents
                  </Link>
                </div>
              ) : (
                <EmptyPanel icon={UserIcon} title="Aucun parent enregistré" description="Aucun parent n'est encore lié à cet élève." color="text-purple-500" />
              )}
            </motion.div>
          )}

          {/* ═══ RESPONSABLES ═══ */}
          {activeTab === 'responsables' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {eleve.responsables && eleve.responsables.length > 0 ? (
                <div className="space-y-3">
                  {eleve.responsables.map((r: any) => (
                    <div key={r.id} className="bg-gray-50 rounded-xl p-4 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
                        {r.prenom?.charAt(0)}{r.nom?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{r.prenom} {r.nom}</p>
                          <span className="px-2 py-0.5 text-xs bg-teal-100 text-teal-700 rounded-full">{r.lien}</span>
                          {r.estPrincipal && (
                            <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">Principal</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{r.telephone}{r.email && ` — ${r.email}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyPanel icon={UserCircleIcon} title="Aucun responsable" description="Aucun responsable n'est enregistré pour cet élève." color="text-teal-500" />
              )}
            </motion.div>
          )}

          {/* ═══ EMPRUNTS ═══ */}
          {activeTab === 'emprunts' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <EmptyPanel
                icon={BookOpenIcon}
                title={`${nbEmprunts} emprunt(s)`}
                description="Livres empruntés par cet élève."
                color="text-indigo-500"
                action={nbEmprunts > 0 && (
                  <Link to={`/dashboard/bibliotheque?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                    Voir les emprunts
                  </Link>
                )}
              />
            </motion.div>
          )}

          {/* ═══ INCIDENTS ═══ */}
          {activeTab === 'incidents' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <EmptyPanel
                icon={ExclamationCircleIcon}
                title={`${nbIncidents} incident(s)`}
                description="Incidents disciplinaires signalés pour cet élève."
                color="text-red-500"
                action={nbIncidents > 0 && (
                  <Link to={`/dashboard/incidents?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                    Voir les incidents
                  </Link>
                )}
              />
            </motion.div>
          )}

          {/* ═══ OBJECTIFS ═══ */}
          {activeTab === 'objectifs' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <EmptyPanel
                icon={ChartBarIcon}
                title={`${nbObjectifs} objectif(s)`}
                description="Objectifs pédagogiques assignés à cet élève."
                color="text-teal-500"
                action={nbObjectifs > 0 && (
                  <Link to={`/dashboard/objectifs?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium">
                    Voir les objectifs
                  </Link>
                )}
              />
            </motion.div>
          )}

          {/* ═══ RÉDUCTIONS ═══ */}
          {activeTab === 'reductions' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <EmptyPanel
                icon={ReceiptPercentIcon}
                title={`${nbReductions} réduction(s)`}
                description="Réductions et bourses appliquées sur la scolarité."
                color="text-amber-500"
                action={nbReductions > 0 && (
                  <Link to={`/dashboard/reductions?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium">
                    Voir les réductions
                  </Link>
                )}
              />
            </motion.div>
          )}

          {/* ═══ COMMUNICATIONS ═══ */}
          {activeTab === 'communications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <EmptyPanel
                icon={ChatBubbleLeftRightIcon}
                title={`${nbCommunications} communication(s)`}
                description="Messages échangés concernant cet élève."
                color="text-teal-500"
                action={nbCommunications > 0 && (
                  <Link to={`/dashboard/messages?eleveId=${eleve.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium">
                    Voir les communications
                  </Link>
                )}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* ─────────── ACTIONS BAS DE PAGE ─────────── */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <Link to="/dashboard/eleves" className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
          <ArrowLeftIcon className="w-4 h-4" /> Retour à la liste
        </Link>
        <Link
          to={`/dashboard/eleves/${eleve.id}/editer`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium border border-amber-200"
        >
          <PencilSquareIcon className="w-4 h-4" /> Modifier cet élève
        </Link>
      </div>
    </div>
  );
};

export default EleveDetailPage;