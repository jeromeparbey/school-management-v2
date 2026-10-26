// frontend2/src/pages/dashboard/directeur/utilisateurs/UtilisateurDetailPage.tsx

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  KeyIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BanknotesIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  GlobeAltIcon,
  HeartIcon,
  LanguageIcon,
  UserIcon,
  PowerIcon,
  LockClosedIcon,
  FingerPrintIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import {
  useUtilisateur,
  useToggleUtilisateur,
  useSoftDeleteUtilisateur,
  useHardDeleteUtilisateur,
  useResetPasswordUtilisateur,
} from '../../../../hooks/useUtilisateurs';
import type { RoleUtilisateur, Utilisateur } from '../../../../types/utilisateur.types';

// ============================================
// HELPERS
// ============================================
const ROLE_STYLES: Record<
  string,
  { bg: string; text: string; border: string; label: string; icon: React.ComponentType<any> }
> = {
  DIRECTEUR: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    label: 'Directeur',
    icon: ShieldCheckIcon,
  },
  ADMIN: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Administrateur',
    icon: Cog6ToothIcon,
  },
  ENSEIGNANT: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Enseignant',
    icon: AcademicCapIcon,
  },
  ELEVE: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Élève',
    icon: BookOpenIcon,
  },
  SURVEILLANT: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'Surveillant',
    icon: UserGroupIcon,
  },
  SECRETAIRE: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    label: 'Secrétaire',
    icon: ClipboardDocumentCheckIcon,
  },
  PARENT: {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
    label: 'Parent',
    icon: UserIcon,
  },
  BIBLIOTHECAIRE: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    label: 'Bibliothécaire',
    icon: BookOpenIcon,
  },
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

const safeInitials = (prenom?: string | null, nom?: string | null): string => {
  const p = (prenom ?? '').trim();
  const n = (nom ?? '').trim();
  const i1 = p.length > 0 ? p.charAt(0).toUpperCase() : '?';
  const i2 = n.length > 0 ? n.charAt(0).toUpperCase() : '';
  return (i1 + i2) || '?';
};

// ============================================
// COMPOSANTS UTILITAIRES
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
      <div className="text-sm font-medium text-gray-900 break-words">
        {value}
      </div>
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
// ONGLETS
// ============================================
type TabKey = 'infos' | 'profil' | 'activite' | 'securite';

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const UtilisateurDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('infos');

  // --- Requête détail ---
  const { data, isLoading, isError, error, refetch } = useUtilisateur(id);

  // --- Mutations ---
  const toggleMutation = useToggleUtilisateur();
  const softDeleteMutation = useSoftDeleteUtilisateur();
  const hardDeleteMutation = useHardDeleteUtilisateur();
  const resetPasswordMutation = useResetPasswordUtilisateur();

  // --- Extraction robuste ---
  const u: Utilisateur | undefined =
    (data as any)?.data?.utilisateur ??
    (data as any)?.data ??
    (data as any) ??
    undefined;

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const handleToggle = async () => {
    if (!u) return;
    if (!confirm(`${u.estActif ? 'Désactiver' : 'Activer'} "${u.prenom} ${u.nom}" ?`)) return;
    try {
      await toggleMutation.mutateAsync({
        id: u.id,
        payload: { estActif: !u.estActif },
      });
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur');
    }
  };

  const handleResetPassword = async () => {
    if (!u) return;
    const newPassword = prompt(
      `Nouveau mot de passe pour "${u.prenom} ${u.nom}" :\n\n` +
        `(8+ caractères, majuscule, minuscule, chiffre, caractère spécial)`
    );
    if (!newPassword) return;
    if (newPassword.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync({
        id: u.id,
        payload: { nouveauMotDePasse: newPassword },
      });
      alert('✅ Mot de passe réinitialisé. Communiquez-le à l\'utilisateur.');
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur');
    }
  };

  const handleSoftDelete = async () => {
    if (!u) return;
    if (!confirm(`Désactiver (soft delete) "${u.prenom} ${u.nom}" ?`)) return;
    try {
      await softDeleteMutation.mutateAsync(u.id);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur');
    }
  };

  const handleHardDelete = async () => {
    if (!u) return;
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\n` +
        `Utilisateur : ${u.prenom} ${u.nom}\n` +
        `Email : ${u.email}\n\n` +
        `Cette action est IRRÉVERSIBLE.\n\n` +
        `Continuer ?`
    );
    if (!confirmed) return;

    const doubleCheck = prompt(`Pour confirmer, tapez l'email : "${u.email}"`);
    if (doubleCheck !== u.email) {
      alert('Email incorrect. Suppression annulée.');
      return;
    }

    try {
      await hardDeleteMutation.mutateAsync(u.id);
      navigate('/dashboard/utilisateurs');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement de l'utilisateur...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // RENDU : Erreur
  // ─────────────────────────────────────────
  if (isError || !u) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Utilisateur introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue lors du chargement'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/dashboard/utilisateurs"
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
  const roleStyle = ROLE_STYLES[u.role] ?? ROLE_STYLES.ELEVE;
  const RoleIcon = roleStyle.icon;

  // On ne désactive pas / supprime pas un DIRECTEUR
  const canToggle = u.role !== 'DIRECTEUR';
  const canDelete = u.role !== 'DIRECTEUR';

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
        <Link to="/dashboard/utilisateurs" className="hover:text-gray-900">
          Utilisateurs
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">
          {u.prenom} {u.nom}
        </span>
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
              to="/dashboard/utilisateurs"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
              title="Retour"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            {u.photoProfil ? (
              <img
                src={u.photoProfil}
                alt={`${u.prenom} ${u.nom}`}
                className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border border-gray-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {safeInitials(u.prenom, u.nom)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {u.prenom} {u.nom}
                </h1>
                {u.estActif ? (
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
                {u.emailVerifie ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                    <EnvelopeIcon className="w-3.5 h-3.5" />
                    Email vérifié
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">
                    <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                    Email non vérifié
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <EnvelopeIcon className="w-4 h-4" />
                  {u.email}
                </span>
                {u.telephone && (
                  <span className="flex items-center gap-1">
                    <PhoneIcon className="w-4 h-4" />
                    {u.telephone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  Créé {formatDate(u.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                >
                  <RoleIcon className="w-3.5 h-3.5" />
                  {roleStyle.label}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  <IdentificationIcon className="w-3.5 h-3.5" />
                  ID : {u.id.slice(0, 8)}…
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0">
            <Link
              to={`/dashboard/utilisateurs/${u.id}/editer`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Modifier
            </Link>

            <button
              onClick={handleResetPassword}
              disabled={resetPasswordMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-50"
            >
              <KeyIcon className="w-4 h-4" />
              Reset mot de passe
            </button>

            {canToggle && (
              <button
                onClick={handleToggle}
                disabled={toggleMutation.isPending}
                className={`inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors border disabled:opacity-50 ${
                  u.estActif
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                }`}
              >
                <PowerIcon className="w-4 h-4" />
                {u.estActif ? 'Désactiver' : 'Activer'}
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleHardDelete}
                disabled={hardDeleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
              >
                <TrashIcon className="w-4 h-4" />
                Supprimer
              </button>
            )}
          </div>
        </div>

        {/* Info : directeur non modifiable */}
        {u.role === 'DIRECTEUR' && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-orange-800">
              <p className="font-semibold mb-0.5">Compte Directeur protégé</p>
              <p className="text-orange-700">
                Un directeur ne peut pas être désactivé ni supprimé via cet
                endpoint. Contactez le SUPER_ADMIN si nécessaire.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ============================================
          STATS RAPIDES
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Dernière connexion"
          value={u.derniereConnexion ? formatDate(u.derniereConnexion) : 'Jamais'}
          icon={ClockIcon}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Email vérifié"
          value={u.emailVerifie ? 'Oui' : 'Non'}
          icon={EnvelopeIcon}
          color={u.emailVerifie ? 'text-emerald-600' : 'text-amber-600'}
          bgColor={u.emailVerifie ? 'bg-emerald-50' : 'bg-amber-50'}
        />
        <StatCard
          label="Statut"
          value={u.estActif ? 'Actif' : 'Inactif'}
          icon={u.estActif ? CheckCircleIcon : XCircleIcon}
          color={u.estActif ? 'text-emerald-600' : 'text-gray-600'}
          bgColor={u.estActif ? 'bg-emerald-50' : 'bg-gray-100'}
        />
        <StatCard
          label="Créé le"
          value={formatDate(u.createdAt)}
          icon={CalendarDaysIcon}
          color="text-violet-600"
          bgColor="bg-violet-50"
        />
      </div>

      {/* ============================================
          ONGLETS
          ============================================ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100">
          {[
            { key: 'infos' as TabKey, label: 'Informations', icon: UserCircleIcon },
            { key: 'profil' as TabKey, label: 'Profil métier', icon: BriefcaseIcon },
            { key: 'activite' as TabKey, label: 'Activité', icon: ClockIcon },
            { key: 'securite' as TabKey, label: 'Sécurité', icon: LockClosedIcon },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
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
                  <IdentificationIcon className="w-4 h-4 text-blue-500" />
                  Identité
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow label="Prénom" value={u.prenom} icon={UserIcon} />
                  <InfoRow label="Nom" value={u.nom} icon={UserIcon} />
                  <InfoRow label="Email" value={u.email} icon={EnvelopeIcon} />
                  <InfoRow
                    label="Téléphone"
                    value={u.telephone ?? '—'}
                    icon={PhoneIcon}
                  />
                  <InfoRow
                    label="ID utilisateur"
                    value={
                      <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                        {u.id}
                      </span>
                    }
                    icon={IdentificationIcon}
                  />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                  Rôle & statut
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Rôle"
                    value={
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                      >
                        {roleStyle.label}
                      </span>
                    }
                    icon={RoleIcon}
                  />
                  <InfoRow
                    label="Compte actif"
                    value={
                      u.estActif ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircleIcon className="w-4 h-4" /> Oui
                        </span>
                      ) : (
                        <span className="text-gray-600 flex items-center gap-1">
                          <XCircleIcon className="w-4 h-4" /> Non
                        </span>
                      )
                    }
                    icon={PowerIcon}
                  />
                  <InfoRow
                    label="Email vérifié"
                    value={
                      u.emailVerifie ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircleIcon className="w-4 h-4" /> Oui
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1">
                          <ExclamationTriangleIcon className="w-4 h-4" /> Non
                        </span>
                      )
                    }
                    icon={EnvelopeIcon}
                  />
                </div>
              </div>

              {/* Colonne droite : Photo + métadonnées */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <UserCircleIcon className="w-4 h-4 text-blue-500" />
                  Photo de profil
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center">
                  {u.photoProfil ? (
                    <img
                      src={u.photoProfil}
                      alt={`${u.prenom} ${u.nom}`}
                      className="w-32 h-32 rounded-2xl object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-4xl">
                      {safeInitials(u.prenom, u.nom)}
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4 text-blue-500" />
                  Métadonnées
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Créé le"
                    value={formatDateTime(u.createdAt)}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Dernière modification"
                    value={formatDateTime(u.updatedAt)}
                    icon={ClockIcon}
                  />
                  <InfoRow
                    label="Dernière connexion"
                    value={
                      u.derniereConnexion
                        ? formatDateTime(u.derniereConnexion)
                        : 'Jamais connecté'
                    }
                    icon={ClockIcon}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET : PROFIL MÉTIER
              ═══════════════════════════════════════ */}
          {activeTab === 'profil' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* ELEVE */}
              {u.role === 'ELEVE' && (u as any).eleve && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <BookOpenIcon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Élève — {(u as any).eleve.matricule}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {(u as any).eleve.statut === 'ACTIF'
                            ? 'Élève actif'
                            : `Statut : ${(u as any).eleve.statut}`}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4">
                        <InfoRow
                          label="Matricule"
                          value={
                            <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                              {(u as any).eleve.matricule}
                            </span>
                          }
                          icon={IdentificationIcon}
                        />
                        <InfoRow
                          label="Sexe"
                          value={(u as any).eleve.sexe === 'M' ? 'Masculin' : 'Féminin'}
                          icon={UserIcon}
                        />
                        <InfoRow
                          label="Date de naissance"
                          value={formatDate((u as any).eleve.dateNaissance)}
                          icon={CalendarDaysIcon}
                        />
                        <InfoRow
                          label="Lieu de naissance"
                          value={(u as any).eleve.lieuNaissance ?? '—'}
                          icon={MapPinIcon}
                        />
                        <InfoRow
                          label="Nationalité"
                          value={(u as any).eleve.nationalite ?? '—'}
                          icon={GlobeAltIcon}
                        />
                      </div>

                      <div className="bg-white rounded-xl p-4">
                        <InfoRow
                          label="Adresse"
                          value={(u as any).eleve.adresse ?? '—'}
                          icon={MapPinIcon}
                        />
                        <InfoRow
                          label="Groupe sanguin"
                          value={(u as any).eleve.groupeSanguin ?? '—'}
                          icon={HeartIcon}
                        />
                        <InfoRow
                          label="Allergies"
                          value={(u as any).eleve.allergies ?? 'Aucune'}
                          icon={ExclamationTriangleIcon}
                        />
                        <InfoRow
                          label="Info médicale"
                          value={(u as any).eleve.infoMedicale ?? '—'}
                          icon={HeartIcon}
                        />
                        <InfoRow
                          label="Statut"
                          value={(u as any).eleve.statut}
                          icon={CheckCircleIcon}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Responsables */}
                  {(u as any).eleve.responsables?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <UserGroupIcon className="w-4 h-4 text-emerald-500" />
                        Responsables ({(u as any).eleve.responsables.length})
                      </h3>
                      <div className="space-y-2">
                        {(u as any).eleve.responsables.map((r: any) => (
                          <div
                            key={r.id}
                            className="bg-gray-50 rounded-xl p-4 flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                              {safeInitials(r.prenom, r.nom)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {r.prenom} {r.nom}
                                {r.estPrincipal && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                    Principal
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {r.lien} • {r.telephone}
                                {r.email && ` • ${r.email}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inscriptions */}
                  {(u as any).eleve.inscriptions?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AcademicCapIcon className="w-4 h-4 text-emerald-500" />
                        Inscriptions ({(u as any).eleve.inscriptions.length})
                      </h3>
                      <div className="space-y-2">
                        {(u as any).eleve.inscriptions.map((i: any) => (
                          <div
                            key={i.id}
                            className="bg-gray-50 rounded-xl p-4 flex items-center justify-between"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {i.classe?.nom ?? '—'}{' '}
                                {i.classe?.niveau?.nom && (
                                  <span className="text-sm text-gray-500">
                                    ({i.classe.niveau.nom})
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {i.anneeScolaire?.nom} • Inscrit le{' '}
                                {formatDate(i.dateInscription)}
                              </p>
                            </div>
                            {i.estActive && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ENSEIGNANT */}
              {u.role === 'ENSEIGNANT' && (u as any).enseignant && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <AcademicCapIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Enseignant — {(u as any).enseignant.matricule}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {(u as any).enseignant.typeContrat} •{' '}
                          {(u as any).enseignant.estActif ? 'Actif' : 'Inactif'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4">
                        <InfoRow
                          label="Matricule"
                          value={
                            <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                              {(u as any).enseignant.matricule}
                            </span>
                          }
                          icon={IdentificationIcon}
                        />
                        <InfoRow
                          label="Sexe"
                          value={
                            (u as any).enseignant.sexe === 'M'
                              ? 'Masculin'
                              : 'Féminin'
                          }
                          icon={UserIcon}
                        />
                        <InfoRow
                          label="Date de naissance"
                          value={formatDate((u as any).enseignant.dateNaissance)}
                          icon={CalendarDaysIcon}
                        />
                        <InfoRow
                          label="Date d'embauche"
                          value={formatDate((u as any).enseignant.dateEmbauche)}
                          icon={CalendarDaysIcon}
                        />
                      </div>

                      <div className="bg-white rounded-xl p-4">
                        <InfoRow
                          label="Type de contrat"
                          value={(u as any).enseignant.typeContrat}
                          icon={BriefcaseIcon}
                        />
                        <InfoRow
                          label="Qualification"
                          value={(u as any).enseignant.qualification ?? '—'}
                          icon={AcademicCapIcon}
                        />
                        <InfoRow
                          label="Spécialité"
                          value={(u as any).enseignant.specialite ?? '—'}
                          icon={BookOpenIcon}
                        />
                        <InfoRow
                          label="Salaire de base"
                          value={formatMoney((u as any).enseignant.salaireBase)}
                          icon={BanknotesIcon}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Affectations */}
                  {(u as any).enseignant.affectations?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <BuildingOfficeIcon className="w-4 h-4 text-blue-500" />
                        Affectations ({(u as any).enseignant.affectations.length})
                      </h3>
                      <div className="space-y-2">
                        {(u as any).enseignant.affectations.map((a: any) => (
                          <div
                            key={a.id}
                            className="bg-gray-50 rounded-xl p-4 flex items-center justify-between"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {a.matiere?.nom} → {a.classe?.nom}
                              </p>
                              <p className="text-xs text-gray-500">
                                {a.heuresHebdo} h/semaine • {a.anneeScolaire?.nom}
                              </p>
                            </div>
                            {a.estPrincipal && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                Principal
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SURVEILLANT */}
              {u.role === 'SURVEILLANT' && (u as any).surveillant && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <UserGroupIcon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Surveillant — {(u as any).surveillant.matricule}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Zone : {(u as any).surveillant.zoneSurveillance ?? 'Non assignée'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4">
                      <InfoRow
                        label="Matricule"
                        value={(u as any).surveillant.matricule}
                        icon={IdentificationIcon}
                      />
                      <InfoRow
                        label="Sexe"
                        value={
                          (u as any).surveillant.sexe === 'M'
                            ? 'Masculin'
                            : 'Féminin'
                        }
                        icon={UserIcon}
                      />
                      <InfoRow
                        label="Date de naissance"
                        value={formatDate((u as any).surveillant.dateNaissance)}
                        icon={CalendarDaysIcon}
                      />
                      <InfoRow
                        label="Date d'embauche"
                        value={formatDate((u as any).surveillant.dateEmbauche)}
                        icon={CalendarDaysIcon}
                      />
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <InfoRow
                        label="Type de contrat"
                        value={(u as any).surveillant.typeContrat}
                        icon={BriefcaseIcon}
                      />
                      <InfoRow
                        label="Zone de surveillance"
                        value={(u as any).surveillant.zoneSurveillance ?? '—'}
                        icon={MapPinIcon}
                      />
                      <InfoRow
                        label="Adresse"
                        value={(u as any).surveillant.adresse ?? '—'}
                        icon={MapPinIcon}
                      />
                      <InfoRow
                        label="Statut"
                        value={
                          (u as any).surveillant.estActif ? 'Actif' : 'Inactif'
                        }
                        icon={CheckCircleIcon}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PARENT */}
              {u.role === 'PARENT' && (u as any).parent && (
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <UserGroupIcon className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Parent / Tuteur
                      </h3>
                      <p className="text-sm text-gray-600">
                        {(u as any).parent.profession ?? 'Profession non renseignée'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4">
                      <InfoRow
                        label="Profession"
                        value={(u as any).parent.profession ?? '—'}
                        icon={BriefcaseIcon}
                      />
                      <InfoRow
                        label="Adresse"
                        value={(u as any).parent.adresse ?? '—'}
                        icon={MapPinIcon}
                      />
                      <InfoRow
                        label="Téléphone secondaire"
                        value={(u as any).parent.telephoneSecondaire ?? '—'}
                        icon={PhoneIcon}
                      />
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <InfoRow
                        label="Enfants rattachés"
                        value={
                          (u as any).parent.enfants?.length ?? 0
                        }
                        icon={UserIcon}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN / DIRECTEUR / SECRETAIRE / BIBLIOTHECAIRE : pas de profil métier */}
              {!['ELEVE', 'ENSEIGNANT', 'SURVEILLANT', 'PARENT'].includes(u.role) && (
                <div className="text-center py-12">
                  <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucun profil métier
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Le rôle « {roleStyle.label} » ne dispose pas de profil métier
                    dédié. Toutes les informations sont dans l'onglet
                    « Informations ».
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET : ACTIVITÉ
              ═══════════════════════════════════════ */}
          {activeTab === 'activite' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                  label="Dernière connexion"
                  value={
                    u.derniereConnexion
                      ? formatDateTime(u.derniereConnexion)
                      : 'Jamais'
                  }
                  icon={ClockIcon}
                  color="text-blue-600"
                  bgColor="bg-blue-50"
                />
                <StatCard
                  label="Compte créé"
                  value={formatDateTime(u.createdAt)}
                  icon={CalendarDaysIcon}
                  color="text-violet-600"
                  bgColor="bg-violet-50"
                />
                <StatCard
                  label="Dernière modification"
                  value={formatDateTime(u.updatedAt)}
                  icon={ArrowPathIcon}
                  color="text-amber-600"
                  bgColor="bg-amber-50"
                />
                <StatCard
                  label="Jours depuis création"
                  value={`${Math.floor(
                    (Date.now() - new Date(u.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )} jours`}
                  icon={CalendarDaysIcon}
                  color="text-emerald-600"
                  bgColor="bg-emerald-50"
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-gray-500" />
                  Chronologie
                </h3>
                <InfoRow
                  label="Compte créé le"
                  value={formatDateTime(u.createdAt)}
                  icon={CalendarDaysIcon}
                />
                <InfoRow
                  label="Dernière modification"
                  value={formatDateTime(u.updatedAt)}
                  icon={ArrowPathIcon}
                />
                <InfoRow
                  label="Dernière connexion"
                  value={
                    u.derniereConnexion
                      ? formatDateTime(u.derniereConnexion)
                      : 'Aucune connexion enregistrée'
                  }
                  icon={ClockIcon}
                />
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET : SÉCURITÉ
              ═══════════════════════════════════════ */}
          {activeTab === 'securite' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <LockClosedIcon className="w-4 h-4 text-gray-500" />
                  Authentification
                </h3>
                <InfoRow
                  label="Email vérifié"
                  value={
                    u.emailVerifie ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4" /> Oui
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-4 h-4" /> Non
                      </span>
                    )
                  }
                  icon={EnvelopeIcon}
                />
                <InfoRow
                  label="Compte actif"
                  value={
                    u.estActif ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4" /> Oui
                      </span>
                    ) : (
                      <span className="text-gray-600 flex items-center gap-1">
                        <XCircleIcon className="w-4 h-4" /> Non
                      </span>
                    )
                  }
                  icon={PowerIcon}
                />
                <InfoRow
                  label="Jeton d'actualisation"
                  value={
                    <span className="text-xs text-gray-500 italic">
                      {u.estActif ? 'Session active possible' : 'Session révoquée'}
                    </span>
                  }
                  icon={KeyIcon}
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <FingerPrintIcon className="w-4 h-4" />
                  Actions de sécurité
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Ces actions sont sensibles. Utilisez-les avec précaution.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleResetPassword}
                    disabled={resetPasswordMutation.isPending}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                  >
                    <KeyIcon className="w-4 h-4" />
                    Réinitialiser le mot de passe
                  </button>
                  {canToggle && (
                    <button
                      onClick={handleToggle}
                      disabled={toggleMutation.isPending}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-50 disabled:opacity-50"
                    >
                      <PowerIcon className="w-4 h-4" />
                      {u.estActif ? 'Désactiver' : 'Activer'} le compte
                    </button>
                  )}
                </div>
              </div>

              {/* Alerte role sensible */}
              {u.role === 'DIRECTEUR' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-orange-800">
                    <p className="font-semibold mb-0.5">
                      Compte Directeur protégé
                    </p>
                    <p className="text-orange-700">
                      Les actions de désactivation, suppression et reset
                      password par un non-SUPER_ADMIN sont bloquées pour ce rôle.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
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
              • <strong>Modifier</strong> : met à jour les informations du compte
              (le rôle n'est pas modifiable ici).
            </li>
            <li>
              • <strong>Reset mot de passe</strong> : génère un nouveau mot de
              passe hashé, révoque les sessions actives.
            </li>
            <li>
              • <strong>Désactiver</strong> : bloque la connexion, conserve le
              compte (réversible).
            </li>
            <li>
              • <strong>Supprimer</strong> : ⚠️ IRRÉVERSIBLE. Supprime le compte
              et son profil métier (cascade).
            </li>
            {u.role === 'DIRECTEUR' && (
              <li className="text-orange-700 font-semibold">
                • Un DIRECTEUR ne peut pas être désactivé/supprimé via cette page.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UtilisateurDetailPage;