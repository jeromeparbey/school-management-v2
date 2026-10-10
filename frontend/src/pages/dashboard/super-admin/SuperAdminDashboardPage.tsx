// frontend2/src/pages/dashboard/super-admin/SuperAdminDashboardPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/AuthContext';
import {
  // Icônes principales
  BuildingOfficeIcon,
  ServerIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CogIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  ChartBarIcon,
  SparklesIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  ArrowRightIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  LockClosedIcon,
  CpuChipIcon,
  CircleStackIcon,
  SignalIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

// ============================================
// TYPES
// ============================================
interface StatCard {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
  bgColor: string;
  hint?: string;
}

interface EtablissementRecent {
  id: string;
  nom: string;
  code: string;
  ville: string;
  plan: 'GRATUIT' | 'BASIQUE' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
  statut: 'ACTIF' | 'PROVISIONING' | 'SUSPENDU' | 'ARCHIVE';
  utilisateurs: number;
  dateCreation: string;
}

interface ProvisioningJob {
  id: string;
  etablissement: string;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ECHEC';
  progression: number;
  message?: string;
}

interface AlerteSysteme {
  id: number;
  type: 'danger' | 'warning' | 'info' | 'success';
  titre: string;
  description: string;
  href: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const SuperAdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // ============================================
  // DONNÉES STATIQUES (à brancher sur API)
  // ============================================

  // --- KPIs Super Admin ---
  const stats: StatCard[] = [
    {
      title: 'Établissements',
      value: '24',
      change: '+3',
      trend: 'up',
      icon: BuildingOfficeIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hint: 'Actifs sur la plateforme',
    },
    {
      title: 'Utilisateurs totaux',
      value: '18 542',
      change: '+12.5%',
      trend: 'up',
      icon: UserGroupIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hint: 'Tous établissements',
    },
    {
      title: 'Revenus mensuels',
      value: '48 200 €',
      change: '+8.7%',
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hint: 'Abonnements + factures',
    },
    {
      title: 'Uptime serveur',
      value: '99.97%',
      change: '+0.02%',
      trend: 'up',
      icon: ServerIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hint: '30 derniers jours',
    },
  ];

  // --- Croissance de la plateforme (12 mois) ---
  const croissancePlateforme = [
    { mois: 'Jan', etablissements: 14, utilisateurs: 8200, revenus: 28000 },
    { mois: 'Fév', etablissements: 15, utilisateurs: 9100, revenus: 30500 },
    { mois: 'Mar', etablissements: 17, utilisateurs: 10400, revenus: 34200 },
    { mois: 'Avr', etablissements: 18, utilisateurs: 11800, revenus: 36800 },
    { mois: 'Mai', etablissements: 19, utilisateurs: 13200, revenus: 39400 },
    { mois: 'Juin', etablissements: 20, utilisateurs: 14800, revenus: 42100 },
    { mois: 'Juil', etablissements: 21, utilisateurs: 15600, revenus: 44200 },
    { mois: 'Août', etablissements: 21, utilisateurs: 16100, revenus: 43600 },
    { mois: 'Sep', etablissements: 22, utilisateurs: 17200, revenus: 45800 },
    { mois: 'Oct', etablissements: 23, utilisateurs: 17900, revenus: 46900 },
    { mois: 'Nov', etablissements: 24, utilisateurs: 18300, revenus: 47600 },
    { mois: 'Déc', etablissements: 24, utilisateurs: 18542, revenus: 48200 },
  ];

  // --- Répartition par plan d'abonnement (camembert) ---
  const repartitionPlans = [
    { name: 'PREMIUM', value: 8, color: '#DC2626' },
    { name: 'STANDARD', value: 9, color: '#F59E0B' },
    { name: 'BASIQUE', value: 5, color: '#3B82F6' },
    { name: 'ENTERPRISE', value: 2, color: '#8B5CF6' },
  ];

  // --- Établissements récents ---
  const etablissementsRecents: EtablissementRecent[] = [
    {
      id: 'ETB-024',
      nom: 'École Victor Hugo',
      code: 'victor-hugo',
      ville: 'Abidjan',
      plan: 'PREMIUM',
      statut: 'ACTIF',
      utilisateurs: 1240,
      dateCreation: 'Il y a 2h',
    },
    {
      id: 'ETB-023',
      nom: 'Lycée Sainte-Marie',
      code: 'sainte-marie',
      ville: 'Dakar',
      plan: 'STANDARD',
      statut: 'ACTIF',
      utilisateurs: 890,
      dateCreation: 'Il y a 1j',
    },
    {
      id: 'ETB-022',
      nom: 'Collège Moderne',
      code: 'college-moderne',
      ville: 'Bamako',
      plan: 'ENTERPRISE',
      statut: 'ACTIF',
      utilisateurs: 2100,
      dateCreation: 'Il y a 3j',
    },
    {
      id: 'ETB-021',
      nom: 'Institut International',
      code: 'institut-intl',
      ville: 'Lomé',
      plan: 'BASIQUE',
      statut: 'PROVISIONING',
      utilisateurs: 0,
      dateCreation: 'Il y a 5j',
    },
    {
      id: 'ETB-020',
      nom: 'Groupe Scolaire Espoir',
      code: 'gs-espoir',
      ville: 'Ouagadougou',
      plan: 'PREMIUM',
      statut: 'ACTIF',
      utilisateurs: 1560,
      dateCreation: 'Il y a 1 sem',
    },
  ];

  // --- Jobs de provisioning en cours ---
  const provisioningJobs: ProvisioningJob[] = [
    {
      id: 'PROV-001',
      etablissement: 'Institut International',
      statut: 'EN_COURS',
      progression: 65,
      message: 'Création des tables...',
    },
    {
      id: 'PROV-002',
      etablissement: 'Nouvelle École Dakar',
      statut: 'EN_ATTENTE',
      progression: 0,
      message: 'File d\'attente...',
    },
    {
      id: 'PROV-003',
      etablissement: 'Collège Saint-Joseph',
      statut: 'TERMINE',
      progression: 100,
      message: 'Prêt à l\'emploi',
    },
  ];

  // --- Alertes système ---
  const alertesSysteme: AlerteSysteme[] = [
    {
      id: 1,
      type: 'danger',
      titre: '3 établissements en retard de paiement',
      description: 'Montant total : 12 400 €',
      href: '/dashboard/factures',
    },
    {
      id: 2,
      type: 'warning',
      titre: 'Provisioning en cours : Institut International',
      description: 'Progression : 65%',
      href: '/dashboard/provisioning',
    },
    {
      id: 3,
      type: 'info',
      titre: 'Sauvegarde quotidienne effectuée',
      description: 'Toutes les bases de données',
      href: '/dashboard/sauvegardes',
    },
    {
      id: 4,
      type: 'success',
      titre: '2 nouveaux abonnements PREMIUM',
      description: 'Revenus additionnels : +2 400 €',
      href: '/dashboard/abonnements',
    },
  ];

  // --- Actions rapides ---
  const quickActions = [
    {
      title: 'Nouvel établissement',
      icon: PlusIcon,
      bgColor: 'bg-gradient-to-br from-red-500 to-red-600',
      href: '/dashboard/etablissements/nouveau',
    },
    {
      title: 'Lancer provisioning',
      icon: ServerIcon,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      href: '/dashboard/provisioning',
    },
    {
      title: 'Gérer abonnements',
      icon: CreditCardIcon,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      href: '/dashboard/abonnements',
    },
    {
      title: 'Sauvegardes',
      icon: ArrowPathIcon,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      href: '/dashboard/sauvegardes',
    },
  ];

  // --- Activités récentes ---
  const activitesRecentes = [
    {
      id: 1,
      titre: 'Nouvel établissement créé',
      desc: 'École Victor Hugo — Abidjan',
      time: 'Il y a 2h',
      icon: BuildingOfficeIcon,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      id: 2,
      titre: 'Provisioning terminé',
      desc: 'Collège Saint-Joseph — Prêt',
      time: 'Il y a 4h',
      icon: CheckCircleIcon,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      id: 3,
      titre: 'Nouvel abonnement PREMIUM',
      desc: 'Lycée Sainte-Marie — 12 mois',
      time: 'Il y a 6h',
      icon: CreditCardIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      id: 4,
      titre: 'Sauvegarde automatique',
      desc: 'Toutes les bases — 02:00 AM',
      time: 'Il y a 8h',
      icon: CircleStackIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 5,
      titre: 'Facture payée',
      desc: 'Collège Moderne — 1 200 €',
      time: 'Il y a 1j',
      icon: BanknotesIcon,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  // ============================================
  // HELPERS
  // ============================================
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'ENTERPRISE':
        return { bg: 'bg-purple-50', text: 'text-purple-600' };
      case 'PREMIUM':
        return { bg: 'bg-red-50', text: 'text-red-600' };
      case 'STANDARD':
        return { bg: 'bg-amber-50', text: 'text-amber-600' };
      case 'BASIQUE':
        return { bg: 'bg-blue-50', text: 'text-blue-600' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600' };
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'ACTIF':
        return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
      case 'PROVISIONING':
        return { bg: 'bg-blue-50', text: 'text-blue-600' };
      case 'SUSPENDU':
        return { bg: 'bg-orange-50', text: 'text-orange-600' };
      case 'ARCHIVE':
        return { bg: 'bg-gray-50', text: 'text-gray-600' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600' };
    }
  };

  const getJobStatutColor = (statut: string) => {
    switch (statut) {
      case 'TERMINE':
        return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
      case 'EN_COURS':
        return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
      case 'EN_ATTENTE':
        return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
      case 'ECHEC':
        return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
    }
  };

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="space-y-8">
      {/* ============================================
          BANNIÈRE DE BIENVENUE
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20 relative overflow-hidden"
      >
        {/* Décorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Console Super Admin
                </h2>
                <p className="text-xs text-red-100">
                  Accès total au système multi-tenant
                </p>
              </div>
            </div>
            <p className="text-sm text-red-100 mt-2">
              Bonjour {user?.prenom} 👋 •{' '}
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/etablissements"
              className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <BuildingOfficeIcon className="w-4 h-4" />
              Établissements
            </Link>
            <Link
              to="/dashboard/etablissements/nouveau"
              className="px-4 py-2 bg-white text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              <SparklesIcon className="w-4 h-4" />
              Nouvel établissement
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ============================================
          KPIs (4 cartes)
          ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-400">vs mois dernier</span>
                </div>
                {stat.hint && (
                  <p className="text-[10px] text-gray-400 mt-1 italic">{stat.hint}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ============================================
          GRAPHIQUE 1 : Croissance de la plateforme
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-900">Croissance de la plateforme</h3>
            <p className="text-xs text-gray-500 mt-0.5">Établissements, utilisateurs et revenus sur 12 mois</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Établissements
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-orange-400 rounded-full"></span>
              Utilisateurs
            </span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={croissancePlateforme} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEtab" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FB923C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="mois"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94A3B8' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94A3B8' }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="etablissements"
                stroke="#DC2626"
                strokeWidth={2.5}
                fill="url(#colorEtab)"
              />
              <Area
                type="monotone"
                dataKey="utilisateurs"
                stroke="#FB923C"
                strokeWidth={2.5}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ============================================
          GRAPHIQUES LIGNE 2 : Plans + Provisioning
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camembert plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Répartition par plan</h3>
            <span className="text-xs text-gray-400">24 établissements</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={repartitionPlans}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {repartitionPlans.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {repartitionPlans.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Jobs de provisioning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ServerIcon className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-bold text-gray-900">Provisioning en cours</h3>
                <p className="text-xs text-gray-500 mt-0.5">Suivi en temps réel</p>
              </div>
            </div>
            <Link
              to="/dashboard/provisioning"
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Voir tout
            </Link>
          </div>

          <div className="space-y-4">
            {provisioningJobs.map((job, index) => {
              const colors = getJobStatutColor(job.statut);
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`p-4 rounded-xl border-2 ${colors.border} ${colors.bg}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500">{job.id}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {job.etablissement}
                      </span>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}
                    >
                      {job.statut === 'EN_COURS'
                        ? 'En cours'
                        : job.statut === 'TERMINE'
                        ? 'Terminé'
                        : job.statut === 'ECHEC'
                        ? 'Échec'
                        : 'En attente'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden mb-2">
                    <motion.div
                      className={`h-full rounded-full ${
                        job.statut === 'TERMINE'
                          ? 'bg-emerald-500'
                          : job.statut === 'EN_COURS'
                          ? 'bg-blue-500'
                          : job.statut === 'ECHEC'
                          ? 'bg-red-500'
                          : 'bg-gray-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progression}%` }}
                      transition={{ duration: 1, delay: 0.4 + index * 0.1 }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600">{job.message}</p>
                    <span className="text-xs font-bold text-gray-900">
                      {job.progression}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ============================================
          ALERTES SYSTÈME
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <BellAlertIcon className="w-5 h-5 text-orange-500" />
            Alertes système
          </h3>
          <span className="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded-full font-bold">
            {alertesSysteme.length} éléments
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alertesSysteme.map((alerte, index) => {
            const colors =
              {
                warning: {
                  bg: 'bg-orange-50',
                  text: 'text-orange-700',
                  icon: 'text-orange-500',
                  border: 'border-orange-100',
                },
                danger: {
                  bg: 'bg-red-50',
                  text: 'text-red-700',
                  icon: 'text-red-500',
                  border: 'border-red-100',
                },
                info: {
                  bg: 'bg-blue-50',
                  text: 'text-blue-700',
                  icon: 'text-blue-500',
                  border: 'border-blue-100',
                },
                success: {
                  bg: 'bg-emerald-50',
                  text: 'text-emerald-700',
                  icon: 'text-emerald-500',
                  border: 'border-emerald-100',
                },
              }[alerte.type] ||
              {
                bg: 'bg-gray-50',
                text: 'text-gray-700',
                icon: 'text-gray-500',
                border: 'border-gray-100',
              };

            return (
              <motion.div
                key={alerte.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                <Link
                  to={alerte.href}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${colors.border} ${colors.bg} hover:shadow-sm transition-all group`}
                >
                  <div
                    className={`w-2 h-10 rounded-full ${
                      alerte.type === 'warning'
                        ? 'bg-orange-400'
                        : alerte.type === 'danger'
                        ? 'bg-red-400'
                        : alerte.type === 'info'
                        ? 'bg-blue-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${colors.text}`}>
                      {alerte.titre}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{alerte.description}</p>
                  </div>
                  <ArrowRightIcon
                    className={`w-4 h-4 ${colors.icon} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ============================================
          ACTIONS RAPIDES
          ============================================ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Actions rapides</h2>
          <span className="text-xs text-gray-400">Console d'administration</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to={action.href}
                className={`${action.bgColor} rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 block`}
              >
                <action.icon className="w-7 h-7 text-white mb-2" />
                <p className="text-sm font-semibold text-white truncate">
                  {action.title}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ============================================
          ÉTABLISSEMENTS RÉCENTS + ACTIVITÉS
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Établissements récents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-gray-900">Établissements récents</h3>
            </div>
            <Link
              to="/dashboard/etablissements"
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Voir tous
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Établissement
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ville
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {etablissementsRecents.map((etab) => {
                  const planColors = getPlanColor(etab.plan);
                  const statutColors = getStatutColor(etab.statut);
                  return (
                    <tr key={etab.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{etab.nom}</p>
                        <p className="text-xs text-gray-500 font-mono">{etab.code}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {etab.ville}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${planColors.bg} ${planColors.text}`}
                        >
                          {etab.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statutColors.bg} ${statutColors.text}`}
                        >
                          {etab.statut === 'PROVISIONING'
                            ? 'Provisioning'
                            : etab.statut === 'ACTIF'
                            ? 'Actif'
                            : etab.statut === 'SUSPENDU'
                            ? 'Suspendu'
                            : 'Archivé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                        {etab.utilisateurs.toLocaleString('fr-FR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Activités récentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Activités récentes</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Voir tout
            </button>
          </div>
          <div className="space-y-4">
            {activitesRecentes.map((activite, index) => (
              <motion.div
                key={activite.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors group"
              >
                <div className={`p-2 rounded-xl ${activite.bg} ${activite.color}`}>
                  <activite.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activite.titre}</p>
                  <p className="text-xs text-gray-600 truncate">{activite.desc}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activite.time}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600">
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============================================
          RACCOURCIS SUPER ADMIN
          ============================================ */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Console système</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Utilisateurs globaux',
              desc: 'Super admins & admins système',
              icon: UserGroupIcon,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
              href: '/dashboard/utilisateurs-globaux',
            },
            {
              title: 'Rôles globaux',
              desc: 'Permissions catalogue',
              icon: LockClosedIcon,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              href: '/dashboard/roles-globaux',
            },
            {
              title: 'Logs d\'audit',
              desc: 'Activité système',
              icon: ShieldCheckIcon,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              href: '/dashboard/audit',
            },
            {
              title: 'Statistiques serveur',
              desc: 'CPU, RAM, disque',
              icon: CpuChipIcon,
              color: 'text-red-600',
              bg: 'bg-red-50',
              href: '/dashboard/stats-serveur',
            },
            {
              title: 'Bases de données',
              desc: 'Schémas tenants',
              icon: CircleStackIcon,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              href: '/dashboard/schemas',
            },
            {
              title: 'Configuration',
              desc: 'Paramètres plateforme',
              icon: CogIcon,
              color: 'text-gray-600',
              bg: 'bg-gray-50',
              href: '/dashboard/config',
            },
            {
              title: 'Facturation',
              desc: 'Factures & paiements',
              icon: ReceiptPercentIcon,
              color: 'text-indigo-600',
              bg: 'bg-indigo-50',
              href: '/dashboard/factures',
            },
            {
              title: 'Monitoring',
              desc: 'Santé de la plateforme',
              icon: SignalIcon,
              color: 'text-cyan-600',
              bg: 'bg-cyan-50',
              href: '/dashboard/stats-serveur',
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.03 }}
              whileHover={{ y: -3 }}
            >
              <Link
                to={item.href}
                className="block bg-white rounded-2xl p-5 border border-gray-100/50 shadow-sm hover:shadow-md transition-all group"
              >
                <div className={`inline-flex p-2 rounded-xl ${item.bg} mb-3`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ============================================
          SANTÉ DE LA PLATEFORME
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center gap-2 mb-6">
          <GlobeAltIcon className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-bold text-gray-900">Santé de la plateforme</h3>
            <p className="text-xs text-gray-500 mt-0.5">Monitoring en temps réel</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'CPU', value: '32%', status: 'Bon', color: 'bg-emerald-500', pourcentage: 32 },
            { label: 'Mémoire RAM', value: '58%', status: 'Bon', color: 'bg-blue-500', pourcentage: 58 },
            { label: 'Disque', value: '71%', status: 'Attention', color: 'bg-amber-500', pourcentage: 71 },
            { label: 'Latence API', value: '48ms', status: 'Excellent', color: 'bg-emerald-500', pourcentage: 15 },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.05 }}
              className="p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">{item.label}</span>
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                  item.status === 'Excellent' || item.status === 'Bon'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.status}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">{item.value}</p>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${item.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pourcentage}%` }}
                  transition={{ duration: 1, delay: 0.9 + index * 0.05 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ============================================
          PIED DE PAGE
          ============================================ */}
      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-200">
        <p>© 2024 EduManage. Tous droits réservés.</p>
        <p className="mt-1">
          Console Super Admin • Version 1.0.0 • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default SuperAdminDashboardPage;