// frontend2/src/pages/dashboard/directeur/niveaux/NiveauDetailPage.tsx

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
  BuildingOfficeIcon,
  BookOpenIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {
  useNiveau,
  useHardDeleteNiveau,
} from '../../../../hooks/useNiveaux';

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
// InfoRow
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
// Page principale
// ============================================
const NiveauDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'infos' | 'classes' | 'matieres'>(
    'infos'
  );

  const { data: niveauData, isLoading, isError, error, refetch } =
    useNiveau(id);
  const hardDeleteMutation = useHardDeleteNiveau();

  const niveau = niveauData?.data;

  const handleHardDelete = async () => {
    if (!niveau) return;
    const confirmed = confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nNiveau : ${niveau.nom}\nCode : ${niveau.code}\n\nCette action est IRRÉVERSIBLE.\nSi des classes ou matières y sont rattachées, la suppression échouera.\n\nContinuer ?`
    );
    if (!confirmed) return;

    try {
      await hardDeleteMutation.mutateAsync(niveau.id);
      navigate('/dashboard/niveaux');
    } catch {
      /* toast géré */
    }
  };

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

  if (isError || !niveau) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Niveau introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue lors du chargement'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/dashboard/niveaux"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Retour
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

  const nbClasses = niveau._count?.classes ?? 0;
  const nbMatieres = niveau._count?.matieres ?? 0;
  const nbPlans = niveau._count?.plansScolarite ?? 0;
  const nbRegles = niveau._count?.reglesEvaluation ?? 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/niveaux" className="hover:text-gray-900">
          Niveaux
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">
          {niveau.nom}
        </span>
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
              to="/dashboard/niveaux"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 flex-shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {niveau.ordre}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {niveau.nom}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
                  <AcademicCapIcon className="w-3.5 h-3.5" />
                  Ordre {niveau.ordre}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
                <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                  {niveau.code}
                </span>
              </div>

              {niveau.description && (
                <p className="mt-3 text-sm text-gray-600">
                  {niveau.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0">
            <Link
              to={`/dashboard/niveaux/${niveau.id}/editer`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Modifier
            </Link>
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

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Classes</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {nbClasses}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50">
              <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Matières</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {nbMatieres}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50">
              <BookOpenIcon className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Plans scolarité</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {nbPlans}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-50">
              <ChartBarIcon className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Règles éval.</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {nbRegles}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-orange-50">
              <CheckCircleIcon className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {[
            { key: 'infos', label: 'Informations', icon: IdentificationIcon },
            {
              key: 'classes',
              label: 'Classes',
              icon: BuildingOfficeIcon,
              badge: nbClasses,
            },
            {
              key: 'matieres',
              label: 'Matières',
              icon: BookOpenIcon,
              badge: nbMatieres,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
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
          {/* Onglet Infos */}
          {activeTab === 'infos' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Identité
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Nom"
                    value={niveau.nom}
                    icon={AcademicCapIcon}
                  />
                  <InfoRow
                    label="Code"
                    value={
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                        {niveau.code}
                      </span>
                    }
                    icon={IdentificationIcon}
                  />
                  <InfoRow
                    label="Ordre"
                    value={niveau.ordre}
                    icon={AcademicCapIcon}
                  />
                  <InfoRow
                    label="Description"
                    value={niveau.description ?? '—'}
                    icon={BookOpenIcon}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Métadonnées
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <InfoRow
                    label="Créé le"
                    value={formatDateTime(niveau.createdAt)}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="Modifié le"
                    value={formatDateTime(niveau.updatedAt)}
                    icon={CalendarDaysIcon}
                  />
                  <InfoRow
                    label="ID"
                    value={
                      <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                        {niveau.id}
                      </span>
                    }
                    icon={IdentificationIcon}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Onglet Classes */}
          {activeTab === 'classes' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {niveau.classes && niveau.classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {niveau.classes.map((classe) => (
                    <Link
                      key={classe.id}
                      to={`/dashboard/classes/${classe.id}`}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {classe.nom}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {classe.code}
                          </p>
                        </div>
                        {classe.estActive ? (
                          <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucune classe
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Aucune classe n'est rattachée à ce niveau.
                  </p>
                  <Link
                    to="/dashboard/classes/nouveau"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Créer une classe
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* Onglet Matières */}
          {activeTab === 'matieres' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {niveau.matieres && niveau.matieres.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {niveau.matieres.map((matiere) => (
                    <div
                      key={matiere.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <p className="font-semibold text-gray-900">
                        {matiere.nom}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {matiere.code}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Coefficient : {matiere.coefficient}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Aucune matière
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Aucune matière n'est rattachée à ce niveau.
                  </p>
                  <Link
                    to="/dashboard/matieres"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Gérer les matières
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NiveauDetailPage;