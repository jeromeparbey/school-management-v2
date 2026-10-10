// src/pages/dashboard/DashboardPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/AuthContext';
import {
  // Navigation / Actions rapides
  UserGroupIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  CreditCardIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EllipsisVerticalIcon,
  SparklesIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
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

interface Activity {
  id: number;
  type: 'student' | 'teacher' | 'payment' | 'class' | 'absence';
  title: string;
  description: string;
  time: string;
  icon: any;
  color: string;
}

interface QuickAction {
  title: string;
  icon: any;
  color: string;
  bgColor: string;
  href: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // ============================================
  // DONNÉES STATIQUES (à brancher sur API)
  // ============================================

  // --- KPIs Directeur ---
  const stats: StatCard[] = [
    {
      title: 'Total Élèves',
      value: '1,284',
      change: '+12.5%',
      trend: 'up',
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hint: 'Inscrits cette année',
    },
    {
      title: 'Enseignants',
      value: '48',
      change: '+3.2%',
      trend: 'up',
      icon: AcademicCapIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hint: 'Actifs',
    },
    {
      title: 'Revenus du mois',
      value: '€12,450',
      change: '+8.7%',
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hint: 'Paiements encaissés',
    },
    {
      title: 'Taux de présence',
      value: '94.2%',
      change: '-2.1%',
      trend: 'down',
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hint: 'Moyenne élèves + profs',
    },
  ];

  // --- Évolution revenus/dépenses (12 mois) ---
  const revenueData = [
    { mois: 'Jan', revenus: 8200, depenses: 5400 },
    { mois: 'Fév', revenus: 9100, depenses: 5600 },
    { mois: 'Mar', revenus: 10400, depenses: 6100 },
    { mois: 'Avr', revenus: 9800, depenses: 5900 },
    { mois: 'Mai', revenus: 11200, depenses: 6300 },
    { mois: 'Juin', revenus: 12800, depenses: 6800 },
    { mois: 'Juil', revenus: 7500, depenses: 5200 },
    { mois: 'Août', revenus: 6900, depenses: 4800 },
    { mois: 'Sep', revenus: 13500, depenses: 7100 },
    { mois: 'Oct', revenus: 11800, depenses: 6600 },
    { mois: 'Nov', revenus: 12100, depenses: 6400 },
    { mois: 'Déc', revenus: 12450, depenses: 6200 },
  ];

  // --- Taux de recouvrement par mois ---
  const recoveryData = [
    { mois: 'Sep', taux: 78 },
    { mois: 'Oct', taux: 82 },
    { mois: 'Nov', taux: 86 },
    { mois: 'Déc', taux: 91 },
  ];

  // --- Répartition paiements (camembert) ---
  const paymentSplit = [
    { name: 'Frais de scolarité', value: 8450, color: '#3B82F6' },
    { name: 'Frais inscription', value: 2100, color: '#8B5CF6' },
    { name: 'Autres frais', value: 1900, color: '#10B981' },
  ];

  // --- Effectifs par niveau ---
  const effectifsNiveaux = [
    { niveau: 'Primaire', eleves: 420 },
    { niveau: 'Collège', eleves: 510 },
    { niveau: 'Lycée', eleves: 354 },
  ];

  // --- Performance par classe ---
  const classePerformance = [
    { name: '6ème A', value: 92, color: 'bg-blue-500' },
    { name: '5ème B', value: 85, color: 'bg-emerald-500' },
    { name: '4ème C', value: 78, color: 'bg-purple-500' },
    { name: '3ème D', value: 88, color: 'bg-orange-500' },
    { name: '2nde A', value: 81, color: 'bg-indigo-500' },
  ];

  // --- Derniers paiements ---
  const derniersPaiements = [
    { id: 'PAY-2841', eleve: 'Marie Dubois', classe: '6ème A', montant: 250000, moyen: 'Mobile Money', date: 'Il y a 15 min' },
    { id: 'PAY-2840', eleve: 'Jean Martin', classe: '3ème D', montant: 180000, moyen: 'Espèces', date: 'Il y a 1h' },
    { id: 'PAY-2839', eleve: 'Awa Diallo', classe: '5ème B', montant: 220000, moyen: 'Virement', date: 'Il y a 3h' },
    { id: 'PAY-2838', eleve: 'Paul Kouassi', classe: '2nde A', montant: 300000, moyen: 'Chèque', date: 'Il y a 5h' },
  ];

  // --- Alertes Directeur ---
  const alertes = [
    { id: 1, type: 'warning', title: '3 échéances en retard', desc: 'Élèves sans paiement depuis 15 jours', href: '/dashboard/echeances' },
    { id: 2, type: 'danger', title: '2 absences non justifiées', desc: 'Enseignants - à valider', href: '/dashboard/absences' },
    { id: 3, type: 'info', title: 'Bulletins T1 à valider', desc: '4 classes en attente', href: '/dashboard/notes/bulletins' },
    { id: 4, type: 'success', title: 'Objectif recouvrement 91%', desc: 'Dépassé de +6% ce mois', href: '/dashboard/statistiques' },
  ];

  // --- Activités récentes ---
  const recentActivities: Activity[] = [
    { id: 1, type: 'student', title: 'Nouvel élève inscrit', description: 'Marie Dubois - Classe de 6ème A', time: 'Il y a 15 minutes', icon: UserGroupIcon, color: 'text-blue-600' },
    { id: 2, type: 'payment', title: 'Paiement reçu', description: 'Frais de scolarité - Famille Martin', time: 'Il y a 2 heures', icon: CreditCardIcon, color: 'text-emerald-600' },
    { id: 3, type: 'absence', title: 'Absence signalée', description: 'Jean Dupont - 5ème B (maladie)', time: 'Il y a 3 heures', icon: ExclamationCircleIcon, color: 'text-red-600' },
    { id: 4, type: 'teacher', title: 'Nouvel enseignant', description: 'M. Pierre Laurent - Mathématiques', time: 'Il y a 5 heures', icon: AcademicCapIcon, color: 'text-purple-600' },
    { id: 5, type: 'class', title: 'Emploi du temps mis à jour', description: 'Classe de Terminale S - Nouveau planning', time: 'Il y a 1 jour', icon: CalendarIcon, color: 'text-indigo-600' },
  ];

  // --- Actions rapides ---
  const quickActions: QuickAction[] = [
    { title: 'Ajouter un élève', icon: UserGroupIcon, color: 'text-white', bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600', href: '/dashboard/eleves/nouveau' },
    { title: 'Enregistrer paiement', icon: CreditCardIcon, color: 'text-white', bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600', href: '/dashboard/paiements/nouveau' },
    { title: 'Créer un bulletin', icon: DocumentTextIcon, color: 'text-white', bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600', href: '/dashboard/notes/bulletins' },
    { title: 'Gérer les présences', icon: ClockIcon, color: 'text-white', bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600', href: '/dashboard/presences' },
  ];

  // --- Événements à venir ---
  const upcomingEvents = [
    { title: 'Réunion des enseignants', date: "Aujourd'hui, 15:00", type: 'Meeting', color: 'bg-blue-500' },
    { title: 'Conseil de classe', date: 'Demain, 10:00', type: 'Academic', color: 'bg-purple-500' },
    { title: 'Remise des bulletins', date: 'Vendredi, 14:00', type: 'Event', color: 'bg-emerald-500' },
  ];

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="space-y-8">
      {/* ============================================
          BANNIÈRE DE BIENVENUE (Directeur)
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">
              Bonjour {user?.prenom} 👋
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              Voici un aperçu complet de votre établissement •{' '}
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/statistiques"
              className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <ChartBarIcon className="w-4 h-4" />
              Voir les statistiques
            </Link>
            <Link
              to="/dashboard/rapports"
              className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              <DocumentTextIcon className="w-4 h-4" />
              Générer un rapport
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
                  <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
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
          GRAPHIQUE 1 : Évolution Revenus vs Dépenses
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-900">Évolution financière</h3>
            <p className="text-xs text-gray-500 mt-0.5">Revenus vs Dépenses sur 12 mois</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Revenus
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              Dépenses
            </span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                 formatter={(v) => `€${Number(v).toLocaleString('fr-FR')}`}
              />
              <Area type="monotone" dataKey="revenus" stroke="#3B82F6" strokeWidth={2.5} fill="url(#colorRevenus)" />
              <Area type="monotone" dataKey="depenses" stroke="#F87171" strokeWidth={2.5} fill="url(#colorDepenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ============================================
          GRAPHIQUES LIGNE 2 : Recouvrement + Camembert
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Taux de recouvrement (ligne) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Taux de recouvrement</h3>
              <p className="text-xs text-gray-500 mt-0.5">Objectif : 90% • Actuel : 91%</p>
            </div>
            <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full font-bold">
              +6% vs objectif
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recoveryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} formatter={(v) => `${Number(v).toFixed(1)}%`} />
                <Line type="monotone" dataKey="taux" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 5, fill: '#8B5CF6' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Camembert paiements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Répartition paiements</h3>
            <span className="text-xs text-gray-400">Ce mois</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentSplit}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentSplit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}formatter={(v) => `€${Number(v).toLocaleString('fr-FR')}`}
 />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {paymentSplit.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">€{item.value.toLocaleString('fr-FR')}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-lg font-bold text-gray-900">€12,450</span>
          </div>
        </motion.div>
      </div>

      {/* ============================================
          GRAPHIQUES LIGNE 3 : Effectifs + Top classes
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Effectifs par niveau (barres) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Effectifs par niveau</h3>
              <p className="text-xs text-gray-500 mt-0.5">Total : 1,284 élèves</p>
            </div>
            <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={effectifsNiveaux}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="niveau" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Bar dataKey="eleves" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Performance par classe (barres horizontales) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Performance par classe</h3>
              <p className="text-xs text-gray-500 mt-0.5">Moyennes générales</p>
            </div>
            <Link to="/dashboard/classes" className="text-sm text-blue-600 font-medium hover:underline">
              Détails
            </Link>
          </div>
          <div className="space-y-3">
            {classePerformance.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-600">{item.value}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className={`h-full ${item.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============================================
          ALERTES DIRECTEUR
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
            Alertes & actions requises
          </h3>
          <span className="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded-full font-bold">
            {alertes.length} éléments
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alertes.map((alerte, index) => {
            const colors = {
              warning: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-500', border: 'border-orange-100' },
              danger: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-500', border: 'border-red-100' },
              info: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500', border: 'border-blue-100' },
              success: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500', border: 'border-emerald-100' },
            }[alerte.type] || { bg: 'bg-gray-50', text: 'text-gray-700', icon: 'text-gray-500', border: 'border-gray-100' };

            return (
              <motion.div
                key={alerte.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 + index * 0.05 }}
              >
                <Link
                  to={alerte.href}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${colors.border} ${colors.bg} hover:shadow-sm transition-all group`}
                >
                  <div className={`w-2 h-10 rounded-full ${
                    alerte.type === 'warning' ? 'bg-orange-400' :
                    alerte.type === 'danger' ? 'bg-red-400' :
                    alerte.type === 'info' ? 'bg-blue-400' : 'bg-emerald-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${colors.text}`}>{alerte.title}</p>
                    <p className="text-xs text-gray-600 truncate">{alerte.desc}</p>
                  </div>
                  <ArrowRightIcon className={`w-4 h-4 ${colors.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
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
          <span className="text-xs text-gray-400">Raccourcis</span>
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
                <action.icon className={`w-7 h-7 ${action.color} mb-2`} />
                <p className={`text-sm font-semibold ${action.color} truncate`}>
                  {action.title}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ============================================
          ACTIVITÉS + DERNIERS PAIEMENTS + ÉVÉNEMENTS
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activités récentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Activités récentes</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Voir tout
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
              >
                <div className={`p-2 rounded-xl bg-gray-100 ${activity.color}`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600">
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Événements à venir */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">À venir</h3>
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
              3 événements
            </span>
          </div>

          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-2 h-12 ${event.color} rounded-full flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{event.date}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {event.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Citation du jour */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100/50"
          >
            <div className="flex items-start gap-3">
              <SparklesIcon className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  "L'éducation est l'arme la plus puissante pour changer le monde."
                </p>
                <p className="text-xs text-gray-500 mt-1">— Nelson Mandela</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ============================================
          DERNIERS PAIEMENTS (tableau)
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BanknotesIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">Derniers paiements reçus</h3>
          </div>
          <Link to="/dashboard/paiements" className="text-sm text-blue-600 font-medium hover:underline">
            Voir tous les paiements
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Référence</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Élève</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Classe</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Moyen</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {derniersPaiements.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{p.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.eleve}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.classe}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                      {p.moyen}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">
                    {p.montant.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 text-right">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ============================================
          RACCOURCIS DIRECTEUR (modules sensibles)
          ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Paie du personnel', desc: '8 bulletins à valider', icon: BanknotesIcon, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/paie' },
          { title: 'Réductions', desc: '3 demandes en attente', icon: ReceiptPercentIcon, color: 'text-purple-600', bg: 'bg-purple-50', href: '/dashboard/reductions' },
          { title: 'Audit & Logs', desc: 'Consulter les actions', icon: CheckCircleIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/dashboard/audit' },
          { title: 'Paramètres', desc: 'Établissement & système', icon: ChartBarIcon, color: 'text-orange-600', bg: 'bg-orange-50', href: '/dashboard/parametres' },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + index * 0.05 }}
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
          PIED DE PAGE
          ============================================ */}
      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-200">
        <p>© 2024 EduManage. Tous droits réservés.</p>
        <p className="mt-1">
          Version 1.0.0 • {new Date().getFullYear()} • Made with ❤️
        </p>
      </footer>
    </div>
  );
};

export default DashboardPage;