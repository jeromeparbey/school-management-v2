// frontend2/src/pages/dashboard/directeur/classes/ClasseDetailPage.tsx

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ArchiveBoxIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  UsersIcon,
  IdentificationIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import {
  useClasse,
  useClasseEleves,
  useClasseStatistiques,
  useSoftDeleteClasse,
  useHardDeleteClasse,
} from '../../../../hooks/useClasses';

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
// PAGE PRINCIPALE
// ============================================
const ClasseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'infos' | 'eleves' | 'statistiques'
  >('infos');

  // Requêtes
  const { data: classeData, isLoading, isError, error, refetch } = useClasse(id);
  const { data: elevesData, isLoading: loadingEleves } = useClasseEleves(
    activeTab === 'eleves' ? id : undefined
  );
  const { data: statsData, isLoading: loadingStats } = useClasseStatistiques(
    activeTab === 'statistiques' ? id : undefined
  );

  // Mutations
  const softDeleteMutation = useSoftDeleteClasse();
  const hardDeleteMutation = useHardDeleteClasse();

  const classe = classeData?.data;

  // Handlers
  const handleSoftDelete = async () => {
    if (!classe) return;
    if (
      !confirm(
        `Archiver la classe "${classe.nom}" ?\n\nLes inscriptions actives doivent être retirées avant.`
      )
    )
      return;
    try {
      await softDeleteMutation.mutateAsync(classe.id);
      navigate('/dashboard/classes');
    } catch {
      /* toast géré */
    }
  };

  const handleHardDelete = async () => {
    if (!classe) return;
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nClasse : ${classe.nom}\nCode : ${classe.code}\n\nCette action est IRRÉVERSIBLE.\n\nContinuer ?`
    );
    if (!confirmed) return;

    const doubleCheck = prompt(
      `Pour confirmer, tapez le code : "${classe.code}"`
    );
    if (doubleCheck !== classe.code) {
      alert('Code incorrect. Suppression annulée.');
      return;
    }

    try {
      await hardDeleteMutation.mutateAsync(classe.id);
      navigate('/dashboard/classes');
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
          <p className="text-gray-500 mt-4">Chargement de la classe…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // Erreur
  // ─────────────────────────────────────────
  if (isError || !classe) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Classe introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue lors du chargement'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/dashboard/classes"
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

  const effectif = classe._count?.inscriptions ?? 0;
  const capacite = classe.capacite ?? 0;
  const tauxOccupation =
    capacite > 0 ? Math.round((effectif / capacite) * 100) : 0;

  const eleves = elevesData?.data?.eleves ?? [];
  const stats = statsData?.data;

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
        <Link to="/dashboard/classes" className="hover:text-gray-900">
          Classes
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">
          {classe.nom}
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
              to="/dashboard/classes"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
              title="Retour"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              <BuildingOfficeIcon className="w-10 h-10" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {classe.nom}
                </h1>
                {classe.estArchive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-full">
                    <ArchiveBoxIcon className="w-3.5 h-3.5" />
                    Archivée
                  </span>
                ) : classe.estActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    <XCircleIcon className="w-3.5 h-3.5" />
                    Inactive
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                  {classe.code}
                </span>
                {classe.niveau && (
                  <span className="flex items-center gap-1">
                    <AcademicCapIcon className="w-4 h-4" />
                    {classe.niveau.nom}
                  </span>
                )}
                {classe.salle && (
                  <span className="flex items-center gap-1">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    Salle {classe.salle}
                  </span>
                )}
              </div>

              {/* Barre de capacité */}
              {capacite > 0 && (
                <div className="mt-3 max-w-md">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>
                      Effectif : {effectif} / {capacite}
                    </span>
                    <span
                      className={`font-semibold ${
                        tauxOccupation > 90
                          ? 'text-rose-600'
                          : tauxOccupation > 75
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {tauxOccupation}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        tauxOccupation > 90
                          ? 'bg-rose-500'
                          : tauxOccupation > 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(tauxOccupation, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0">
            <Link
              to={`/dashboard/classes/${classe.id}/editer`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Modifier
            </Link>

            {!classe.estArchive && (
              <button
                onClick={handleSoftDelete}
                disabled={softDeleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 font-medium rounded-lg hover:bg-orange-100 transition-colors border border-orange-200 disabled:opacity-50"
              >
                <ArchiveBoxIcon className="w-4 h-4" />
                Archiver
              </button>
            )}

            <button
              onClick={handleHardDelete}
              disabled={hardDeleteMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      </motion.div>

      {/* ============================================
          STATS RAPIDES
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Inscrits"
          value={effectif}
          icon={UsersIcon}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Capacité"
          value={capacite || '—'}
          icon={UserGroupIcon}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          label="Places restantes"
          value={
            stats?.classe?.placesRestantes ??
            (capacite > 0 ? Math.max(capacite - effectif, 0) : '—')
          }
          icon={CheckCircleIcon}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Moyenne générale"
          value={
            stats?.moyenneGenerale !== null &&
            stats?.moyenneGenerale !== undefined
              ? `${stats.moyenneGenerale.toFixed(2)}/20`
              : '—'
          }
          icon={ChartBarIcon}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* ============================================
          ONGLETS
          ============================================ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {[
            { key: 'infos', label: 'Informations', icon: IdentificationIcon },
            {
              key: 'eleves',
              label: 'Élèves',
              icon: UsersIcon,
              badge: effectif,
            },
            {
              key: 'statistiques',
              label: 'Statistiques',
              icon: ChartBarIcon,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
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
          {/* ═══════════════════════════════════════
              ONGLET : INFORMATIONS
              ═══════════════════════════════════════ */}
          {activeTab === 'infos' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <IdentificationIcon className="w-4 h-4 text-blue-500" />
                  Identité
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Nom"
                    value={classe.nom}
                    icon={BuildingOfficeIcon}
                  />
                  <InfoRow
                    label="Code unique"
                    value={
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                        {classe.code}
                      </span>
                    }
                    icon={IdentificationIcon}
                  />
                  <InfoRow
                    label="Niveau"
                    value={classe.niveau?.nom ?? '—'}
                    icon={AcademicCapIcon}
                  />
                  <InfoRow
                    label="Salle"
                    value={classe.salle ?? '—'}
                    icon={BuildingOfficeIcon}
                  />
                  <InfoRow
                    label="Capacité"
                    value={classe.capacite ?? '—'}
                    icon={UserGroupIcon}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4 text-blue-500" />
                  Année scolaire
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Année"
                    value={
                      classe.anneeScolaire ? (
                        <div className="flex items-center gap-2">
                          {classe.anneeScolaire.nom}
                          {classe.anneeScolaire.estActive && (
                            <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                              active
                            </span>
                          )}
                        </div>
                      ) : (
                        '—'
                      )
                    }
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Inscriptions"
                    value={effectif}
                    icon={UsersIcon}
                  />
                  <InfoRow
                    label="Emplois du temps"
                    value={classe._count?.emploisTemps ?? 0}
                    icon={ClockIcon}
                  />
                  <InfoRow
                    label="Affectations"
                    value={classe._count?.affectations ?? 0}
                    icon={AcademicCapIcon}
                  />
                </div>

                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-blue-500" />
                  Métadonnées
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Créée le"
                    value={formatDateTime(classe.createdAt)}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Modifiée le"
                    value={formatDateTime(classe.updatedAt)}
                    icon={ClockIcon}
                  />
                  <InfoRow
                    label="ID"
                    value={
                      <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                        {classe.id}
                      </span>
                    }
                    icon={IdentificationIcon}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET : ÉLÈVES
              ═══════════════════════════════════════ */}
          {activeTab === 'eleves' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {loadingEleves ? (
                <div className="text-center py-12">
                  <ArrowPathIcon className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
                  <p className="text-sm text-gray-500 mt-2">
                    Chargement des élèves…
                  </p>
                </div>
              ) : eleves.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucun élève inscrit
                  </h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    Les élèves inscrits dans cette classe apparaîtront ici.
                  </p>
                  <Link
                    to="/dashboard/eleves"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <UsersIcon className="w-4 h-4" />
                    Gérer les inscriptions
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Matricule
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Nom & Prénom
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Sexe
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Naissance
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {eleves.map((eleve) => (
                        <tr
                          key={eleve.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-mono text-gray-700">
                            {eleve.matricule}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {eleve.photo ? (
                                <img
                                  src={eleve.photo}
                                  alt={eleve.nom}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                  {eleve.prenom.charAt(0)}
                                  {eleve.nom.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {eleve.nom} {eleve.prenom}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-700">
                            {eleve.sexe === 'M' ? '♂' : '♀'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(eleve.dateNaissance)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                eleve.statut === 'ACTIF'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {eleve.statut}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ONGLET : STATISTIQUES
              ═══════════════════════════════════════ */}
          {activeTab === 'statistiques' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {loadingStats ? (
                <div className="text-center py-12">
                  <ArrowPathIcon className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
                  <p className="text-sm text-gray-500 mt-2">
                    Chargement des statistiques…
                  </p>
                </div>
              ) : !stats ? (
                <div className="text-center py-12">
                  <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Statistiques indisponibles
                  </h3>
                  <p className="text-gray-500">
                    Aucune donnée statistique pour cette classe.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Effectif */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-blue-500" />
                      Effectif
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">Inscrits</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.effectif.inscrits}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">Actifs</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {stats.effectif.actifs}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">Capacité</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.classe.capacite ?? '—'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">
                          Places restantes
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {stats.classe.placesRestantes ?? '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Répartition par sexe */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                      Répartition par sexe
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      {Object.keys(stats.effectif.parSexe).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(stats.effectif.parSexe).map(
                            ([sexe, nb]) => {
                              const total = stats.effectif.actifs || 1;
                              const pct = Math.round((nb / total) * 100);
                              return (
                                <div key={sexe}>
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-900">
                                      {sexe === 'M'
                                        ? 'Garçons'
                                        : sexe === 'F'
                                        ? 'Filles'
                                        : sexe}
                                    </span>
                                    <span className="text-gray-600">
                                      {nb} ({pct}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-white rounded-full h-2">
                                    <div
                                      className={`h-full rounded-full ${
                                        sexe === 'M'
                                          ? 'bg-blue-500'
                                          : 'bg-pink-500'
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Aucune donnée
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Moyenne */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                      Performance
                    </h3>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <p className="text-xs text-gray-600 uppercase tracking-wider">
                        Moyenne générale de la classe
                      </p>
                      <p
                        className={`text-4xl font-bold mt-1 ${
                          stats.moyenneGenerale === null
                            ? 'text-gray-400'
                            : stats.moyenneGenerale >= 14
                            ? 'text-emerald-600'
                            : stats.moyenneGenerale >= 10
                            ? 'text-blue-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {stats.moyenneGenerale !== null
                          ? `${stats.moyenneGenerale.toFixed(2)}/20`
                          : '—'}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Basée sur les bulletins validés de la classe
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClasseDetailPage;