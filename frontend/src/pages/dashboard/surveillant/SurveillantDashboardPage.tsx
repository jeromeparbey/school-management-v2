// frontend2/src/pages/dashboard/surveillant/SurveillantDashboardPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/AuthContext';
import {
  // Icônes principales
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BellAlertIcon,
  MegaphoneIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

import {
  ResponsiveContainer,
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

interface IncidentRecent {
  id: string;
  type: string;
  gravite: 'MINEUR' | 'MODERE' | 'GRAVE' | 'TRES_GRAVE';
  titre: string;
  eleve: string;
  classe: string;
  statut: 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'FERME';
  date: string;
}

interface SurveillanceJour {
  id: string;
  zone: string;
  heureDebut: string;
  heureFin: string;
  type: 'COUR' | 'RECREATION' | 'CANTINE' | 'ENTREE' | 'SORTIE';
  statut: 'A_VENIR' | 'EN_COURS' | 'TERMINEE';
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const SurveillantDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // ============================================
  // DONNÉES STATIQUES (à brancher sur API)
  // ============================================

  // --- KPIs Surveillant ---
  const stats: StatCard[] = [
    {
      title: 'Incidents signalés',
      value: '23',
      change: '+5',
      trend: 'down',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hint: 'Ce mois-ci',
    },
    {
      title: 'Incidents résolus',
      value: '18',
      change: '+7',
      trend: 'up',
      icon: CheckCircleIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hint: 'Taux de résolution 78%',
    },
    {
      title: 'Présences élèves',
      value: '94.2%',
      change: '+1.2%',
      trend: 'up',
      icon: ClipboardDocumentCheckIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hint: 'Moyenne cette semaine',
    },
    {
      title: 'Surveillances aujourd\'hui',
      value: '4',
      change: '2 restantes',
      trend: 'up',
      icon: ShieldCheckIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hint: 'Planning du jour',
    },
  ];

  // --- Incidents par semaine (4 semaines) ---
  const incidentsHebdo = [
    { semaine: 'S1', signales: 6, resolus: 4 },
    { semaine: 'S2', signales: 8, resolus: 6 },
    { semaine: 'S3', signales: 5, resolus: 5 },
    { semaine: 'S4', signales: 4, resolus: 3 },
  ];

  // --- Répartition incidents par type (camembert) ---
  const repartitionIncidents = [
    { name: 'Disputes', value: 8, color: '#3B82F6' },
    { name: 'Retards répétés', value: 6, color: '#F59E0B' },
    { name: 'Absences injustifiées', value: 5, color: '#EF4444' },
    { name: 'Insubordination', value: 3, color: '#8B5CF6' },
    { name: 'Autres', value: 1, color: '#10B981' },
  ];

  // --- Surveillance du jour (planning) ---
  const surveillancesJour: SurveillanceJour[] = [
    {
      id: 'SURV-001',
      zone: 'Cour principale',
      heureDebut: '10:00',
      heureFin: '10:30',
      type: 'RECREATION',
      statut: 'TERMINEE',
    },
    {
      id: 'SURV-002',
      zone: 'Entrée bâtiment B',
      heureDebut: '12:00',
      heureFin: '12:30',
      type: 'SORTIE',
      statut: 'EN_COURS',
    },
    {
      id: 'SURV-003',
      zone: 'Cantine',
      heureDebut: '12:30',
      heureFin: '13:30',
      type: 'CANTINE',
      statut: 'A_VENIR',
    },
    {
      id: 'SURV-004',
      zone: 'Cour arrière',
      heureDebut: '15:00',
      heureFin: '15:30',
      type: 'RECREATION',
      statut: 'A_VENIR',
    },
  ];

  // --- Incidents récents ---
  const incidentsRecents: IncidentRecent[] = [
    {
      id: 'INC-2041',
      type: 'DISPUTE',
      gravite: 'MODERE',
      titre: 'Dispute entre élèves',
      eleve: 'Jean Martin',
      classe: '3ème D',
      statut: 'EN_COURS',
      date: 'Il y a 30 min',
    },
    {
      id: 'INC-2040',
      type: 'RETARD_REPETE',
      gravite: 'MINEUR',
      titre: 'Retard répété',
      eleve: 'Awa Diallo',
      classe: '5ème B',
      statut: 'RESOLU',
      date: 'Il y a 2h',
    },
    {
      id: 'INC-2039',
      type: 'ABSENCE_INJUSTIFIEE',
      gravite: 'MODERE',
      titre: 'Absence non justifiée',
      eleve: 'Paul Kouassi',
      classe: '2nde A',
      statut: 'OUVERT',
      date: 'Il y a 4h',
    },
    {
      id: 'INC-2038',
      type: 'INSUBORDINATION',
      gravite: 'GRAVE',
      titre: 'Manque de respect envers un enseignant',
      eleve: 'Fatou Ndiaye',
      classe: '1ère C',
      statut: 'EN_COURS',
      date: 'Il y a 6h',
    },
    {
      id: 'INC-2037',
      type: 'DISPUTE',
      gravite: 'MINEUR',
      titre: 'Altercation légère',
      eleve: 'Marie Dubois',
      classe: '6ème A',
      statut: 'RESOLU',
      date: 'Il y a 1j',
    },
  ];

  // --- Alertes surveillant ---
  const alertes = [
    {
      id: 1,
      type: 'danger',
      title: '3 incidents graves non traités',
      desc: 'Escalade requise vers la direction',
      href: '/dashboard/incidents',
    },
    {
      id: 2,
      type: 'warning',
      title: '2 élèves en retard répété',
      desc: 'Convocations à envoyer aux parents',
      href: '/dashboard/incidents',
    },
    {
      id: 3,
      type: 'info',
      title: 'Réunion surveillants à 17h',
      desc: 'Salle de réunion - Bâtiment A',
      href: '/dashboard/communiques',
    },
    {
      id: 4,
      type: 'success',
      title: 'Cour principale - RAS',
      desc: 'Aucun incident signalé ce matin',
      href: '/dashboard/surveillances',
    },
  ];

  // --- Actions rapides ---
  const quickActions = [
    {
      title: 'Signaler un incident',
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-gradient-to-br from-red-500 to-red-600',
      href: '/dashboard/incidents/signaler',
    },
    {
      title: 'Noter une présence',
      icon: ClipboardDocumentCheckIcon,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      href: '/dashboard/presences-eleves',
    },
    {
      title: 'Rechercher un élève',
      icon: MagnifyingGlassIcon,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      href: '/dashboard/eleves/recherche',
    },
    {
      title: 'Mes zones',
      icon: MapPinIcon,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      href: '/dashboard/mes-zones',
    },
  ];

  // --- Activités récentes ---
  const activitesRecentes = [
    {
      id: 1,
      titre: 'Incident signalé',
      desc: 'Dispute entre élèves - Cour principale',
      time: 'Il y a 30 min',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      id: 2,
      titre: 'Présences enregistrées',
      desc: 'Classe 5ème B - 28/30 présents',
      time: 'Il y a 1h',
      icon: ClipboardDocumentCheckIcon,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      id: 3,
      titre: 'Surveillance terminée',
      desc: 'Zone : Cour principale (10:00-10:30)',
      time: 'Il y a 2h',
      icon: ShieldCheckIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 4,
      titre: 'Retard signalé',
      desc: 'Jean Dupont - 3ème D',
      time: 'Il y a 3h',
      icon: ClockIcon,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      id: 5,
      titre: 'Incident résolu',
      desc: 'Altercation - Médiation réussie',
      time: 'Il y a 4h',
      icon: CheckCircleIcon,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  // ============================================
  // HELPERS
  // ============================================
  const getGraviteColor = (gravite: string) => {
    switch (gravite) {
      case 'MINEUR':
        return { bg: 'bg-blue-50', text: 'text-blue-600' };
      case 'MODERE':
        return { bg: 'bg-orange-50', text: 'text-orange-600' };
      case 'GRAVE':
        return { bg: 'bg-red-50', text: 'text-red-600' };
      case 'TRES_GRAVE':
        return { bg: 'bg-red-100', text: 'text-red-700' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600' };
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'OUVERT':
        return { bg: 'bg-red-50', text: 'text-red-600' };
      case 'EN_COURS':
        return { bg: 'bg-orange-50', text: 'text-orange-600' };
      case 'RESOLU':
        return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
      case 'FERME':
        return { bg: 'bg-gray-50', text: 'text-gray-600' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600' };
    }
  };

  const getTypeSurveillanceLabel = (type: string) => {
    switch (type) {
      case 'COUR':
        return 'Cours';
      case 'RECREATION':
        return 'Récréation';
      case 'CANTINE':
        return 'Cantine';
      case 'ENTREE':
        return 'Entrée';
      case 'SORTIE':
        return 'Sortie';
      default:
        return type;
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
        className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6" />
              <h2 className="text-xl font-bold">
                Bonjour {user?.prenom} 👋
              </h2>
            </div>
            <p className="text-sm text-amber-100 mt-1">
              Espace Surveillant •{' '}
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
              to="/dashboard/mon-planning"
              className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Mon planning
            </Link>
            <Link
              to="/dashboard/incidents/signaler"
              className="px-4 py-2 bg-white text-amber-600 hover:bg-amber-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Signaler un incident
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
          GRAPHIQUE 1 : Incidents par semaine
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incidents signés vs résolus (barres) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Incidents par semaine</h3>
              <p className="text-xs text-gray-500 mt-0.5">Signalés vs résolus sur 4 semaines</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Signalés
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                Résolus
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentsHebdo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="semaine"
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
                <Bar dataKey="signales" fill="#EF4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="resolus" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Camembert répartition incidents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Types d'incidents</h3>
            <span className="text-xs text-gray-400">23 total</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={repartitionIncidents}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {repartitionIncidents.map((entry, index) => (
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
            {repartitionIncidents.map((item) => (
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
      </div>

      {/* ============================================
          PLANNING DU JOUR
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-gray-900">Mes surveillances aujourd'hui</h3>
              <p className="text-xs text-gray-500 mt-0.5">Planning du jour</p>
            </div>
          </div>
          <Link
            to="/dashboard/mon-planning"
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            Voir tout le planning
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {surveillancesJour.map((surv, index) => {
            const statutColor =
              surv.statut === 'TERMINEE'
                ? { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: CheckCircleIcon }
                : surv.statut === 'EN_COURS'
                ? { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-300', icon: ClockIcon }
                : { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: CalendarIcon };

            return (
              <motion.div
                key={surv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className={`rounded-xl border-2 ${statutColor.border} ${statutColor.bg} p-4`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-gray-500">{surv.id}</span>
                  <statutColor.icon className={`w-5 h-5 ${statutColor.text}`} />
                </div>
                <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <MapPinIcon className="w-4 h-4" />
                  {surv.zone}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {surv.heureDebut} - {surv.heureFin}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-white rounded-full text-gray-700">
                    {getTypeSurveillanceLabel(surv.type)}
                  </span>
                  {surv.statut === 'EN_COURS' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                      En cours
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ============================================
          ALERTES
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
            Alertes & actions requises
          </h3>
          <span className="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded-full font-bold">
            {alertes.length} éléments
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alertes.map((alerte, index) => {
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
                      {alerte.title}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{alerte.desc}</p>
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
          <span className="text-xs text-gray-400">Raccourcis surveillance</span>
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
          INCIDENTS RÉCENTS + ACTIVITÉS
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incidents récents (tableau) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-gray-900">Incidents récents</h3>
            </div>
            <Link
              to="/dashboard/incidents"
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
                    Réf.
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Élève
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Gravité
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {incidentsRecents.map((inc) => {
                  const graviteColor = getGraviteColor(inc.gravite);
                  const statutColor = getStatutColor(inc.statut);
                  return (
                    <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {inc.id}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {inc.titre}
                        </p>
                        <p className="text-xs text-gray-500">{inc.date}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{inc.eleve}</p>
                        <p className="text-xs text-gray-500">{inc.classe}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${graviteColor.bg} ${graviteColor.text}`}
                        >
                          {inc.gravite}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statutColor.bg} ${statutColor.text}`}
                        >
                          {inc.statut === 'EN_COURS'
                            ? 'En cours'
                            : inc.statut === 'OUVERT'
                            ? 'Ouvert'
                            : inc.statut === 'RESOLU'
                            ? 'Résolu'
                            : 'Fermé'}
                        </span>
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
                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
              >
                <div className={`p-2 rounded-xl ${activite.bg} ${activite.color}`}>
                  <activite.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activite.titre}</p>
                  <p className="text-xs text-gray-600 truncate">{activite.desc}</p>
                  <p className="text-xs text-gray-400 mt-1">{activite.time}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600">
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============================================
          RACCOURCIS SURVEILLANT
          ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Mes zones',
            desc: 'Zones sous surveillance',
            icon: MapPinIcon,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/dashboard/mes-zones',
          },
          {
            title: 'Mes incidents',
            desc: 'Incidents signalés',
            icon: ExclamationTriangleIcon,
            color: 'text-red-600',
            bg: 'bg-red-50',
            href: '/dashboard/mes-incidents',
          },
          {
            title: 'Présences élèves',
            desc: 'Enregistrer/consulter',
            icon: ClipboardDocumentCheckIcon,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            href: '/dashboard/presences-eleves',
          },
          {
            title: 'Absences élèves',
            desc: 'Justificatifs & suivi',
            icon: XCircleIcon,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            href: '/dashboard/absences-eleves',
          },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.05 }}
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

      {/* ============================================
          CITATION / CONSEIL
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-100/50"
      >
        <div className="flex items-start gap-3">
          <SparklesIcon className="w-6 h-6 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              "La discipline est le pont entre les objectifs et les accomplissements."
            </p>
            <p className="text-xs text-gray-500 mt-1">— Jim Rohn</p>
          </div>
        </div>
      </motion.div>

      {/* ============================================
          PIED DE PAGE
          ============================================ */}
      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-200">
        <p>© 2024 EduManage. Tous droits réservés.</p>
        <p className="mt-1">
          Espace Surveillant • Version 1.0.0 • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default SurveillantDashboardPage;