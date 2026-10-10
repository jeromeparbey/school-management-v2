// src/pages/dashboard/admin/AdminDashboardPage.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/AuthContext';
import {
  // Système
  UserGroupIcon,
  ShieldCheckIcon,
  KeyIcon,
  FingerPrintIcon,
  // Monitoring
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  ServerStackIcon,
  CpuChipIcon,
  CircleStackIcon,
  SignalIcon,
  // Configuration
  Cog6ToothIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowPathIcon,
  // UI
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisVerticalIcon,
  SparklesIcon,
  PlusIcon,
  DocumentTextIcon,
  TrashIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  ClockIcon,
  GlobeAltIcon,
  CommandLineIcon,
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
  RadialBarChart,
  RadialBar,
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
  href?: string;
}

interface SystemMetric {
  label: string;
  value: number;
  unit: string;
  color: string;
  status: 'ok' | 'warning' | 'danger';
}

interface LogEntry {
  id: string;
  user: string;
  action: string;
  entite: string;
  statut: 'SUCCES' | 'ECHEC' | 'ATTENTE';
  ip: string;
  time: string;
}

interface UserEntry {
  id: string;
  email: string;
  nom: string;
  role: string;
  actif: boolean;
  derniereConnexion: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('7j');

  // ============================================
  // DONNÉES (à brancher sur API)
  // ============================================

  // --- KPIs Admin ---
  const stats: StatCard[] = [
    {
      title: 'Utilisateurs',
      value: '156',
      change: '+8',
      trend: 'up',
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hint: '148 actifs • 8 inactifs',
      href: '/dashboard/utilisateurs',
    },
    {
      title: 'Logs aujourd\'hui',
      value: '2,847',
      change: '+12%',
      trend: 'up',
      icon: ClipboardDocumentListIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hint: '12 erreurs • 2,835 succès',
      href: '/dashboard/audit',
    },
    {
      title: 'Emails envoyés',
      value: '342',
      change: '+5%',
      trend: 'up',
      icon: EnvelopeIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hint: '98.2% délivrés',
      href: '/dashboard/logs-email',
    },
    {
      title: 'Uptime système',
      value: '99.8%',
      change: '+0.1%',
      trend: 'up',
      icon: SignalIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hint: '30 jours glissants',
      href: '/dashboard/monitoring',
    },
  ];

  // --- Métriques système ---
  const systemMetrics: SystemMetric[] = [
    { label: 'CPU', value: 42, unit: '%', color: '#3B82F6', status: 'ok' },
    { label: 'RAM', value: 68, unit: '%', color: '#8B5CF6', status: 'ok' },
    { label: 'Disque', value: 82, unit: '%', color: '#F59E0B', status: 'warning' },
    { label: 'Bande passante', value: 35, unit: '%', color: '#10B981', status: 'ok' },
  ];

  // --- Requêtes API (dernières 24h) ---
  const requetes24h = [
    { heure: '00h', requetes: 120, erreurs: 2 },
    { heure: '03h', requetes: 85, erreurs: 1 },
    { heure: '06h', requetes: 240, erreurs: 3 },
    { heure: '09h', requetes: 890, erreurs: 8 },
    { heure: '12h', requetes: 1240, erreurs: 12 },
    { heure: '15h', requetes: 1580, erreurs: 15 },
    { heure: '18h', requetes: 980, erreurs: 6 },
    { heure: '21h', requetes: 520, erreurs: 3 },
  ];

  // --- Répartition utilisateurs par rôle ---
  const usersParRole = [
    { name: 'Enseignants', value: 48, color: '#8B5CF6' },
    { name: 'Parents', value: 82, color: '#3B82F6' },
    { name: 'Élèves', value: 20, color: '#10B981' },
    { name: 'Secrétaires', value: 4, color: '#F59E0B' },
    { name: 'Directeurs', value: 2, color: '#EF4444' },
  ];

  // --- Connexions (7 derniers jours) ---
  const connexions7j = [
    { jour: 'Lun', connexions: 145 },
    { jour: 'Mar', connexions: 168 },
    { jour: 'Mer', connexions: 132 },
    { jour: 'Jeu', connexions: 189 },
    { jour: 'Ven', connexions: 201 },
    { jour: 'Sam', connexions: 84 },
    { jour: 'Dim', connexions: 42 },
  ];

  // --- Derniers logs d'audit ---
  const derniersLogs: LogEntry[] = [
    { id: 'L1', user: 'directeur@test.com', action: 'CREATE', entite: 'Eleve', statut: 'SUCCES', ip: '192.168.1.10', time: 'Il y a 2 min' },
    { id: 'L2', user: 'secretaire@test.com', action: 'UPDATE', entite: 'Paiement', statut: 'SUCCES', ip: '192.168.1.12', time: 'Il y a 5 min' },
    { id: 'L3', user: 'directeur@test.com', action: 'DELETE', entite: 'Note', statut: 'ECHEC', ip: '192.168.1.10', time: 'Il y a 12 min' },
    { id: 'L4', user: 'enseignant@test.com', action: 'LOGIN', entite: 'Utilisateur', statut: 'SUCCES', ip: '192.168.1.20', time: 'Il y a 18 min' },
    { id: 'L5', user: 'inconnu@test.com', action: 'LOGIN', entite: 'Utilisateur', statut: 'ECHEC', ip: '203.0.113.42', time: 'Il y a 25 min' },
  ];

  // --- Utilisateurs récents ---
  const utilisateursRecents: UserEntry[] = [
    { id: 'U1', email: 'nouveau.prof@test.com', nom: 'Sophie Bernard', role: 'ENSEIGNANT', actif: true, derniereConnexion: 'Il y a 1h' },
    { id: 'U2', email: 'parent3@test.com', nom: 'Ahmed Diallo', role: 'PARENT', actif: true, derniereConnexion: 'Il y a 3h' },
    { id: 'U3', email: 'secretaire2@test.com', nom: 'Fatou Sow', role: 'SECRETAIRE', actif: true, derniereConnexion: 'Il y a 5h' },
    { id: 'U4', email: 'ancien@test.com', nom: 'Marc Petit', role: 'ENSEIGNANT', actif: false, derniereConnexion: 'Il y a 30j' },
  ];

  // --- Alertes système ---
  const alertes = [
    { id: 1, type: 'danger', title: 'Espace disque faible', desc: '82% utilisé - Nettoyage recommandé', href: '/dashboard/monitoring' },
    { id: 2, type: 'warning', title: '12 erreurs API', desc: 'Dernières 24h - À investiguer', href: '/dashboard/audit' },
    { id: 3, type: 'info', title: 'Sauvegarde planifiée', desc: 'Demain à 02:00', href: '/dashboard/sauvegardes' },
    { id: 4, type: 'success', title: 'Dernière sauvegarde OK', desc: 'Il y a 6h • 2.4 GB', href: '/dashboard/sauvegardes' },
  ];

  // ============================================
  // HELPERS
  // ============================================
  const statutLogConfig: Record<string, { bg: string; text: string; icon: any }> = {
    SUCCES: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircleIcon },
    ECHEC: { bg: 'bg-red-50', text: 'text-red-600', icon: XCircleIcon },
    ATTENTE: { bg: 'bg-orange-50', text: 'text-orange-600', icon: ClockIcon },
  };

  const roleBadge: Record<string, string> = {
    DIRECTEUR: 'bg-red-50 text-red-600',
    SECRETAIRE: 'bg-emerald-50 text-emerald-600',
    ENSEIGNANT: 'bg-purple-50 text-purple-600',
    PARENT: 'bg-blue-50 text-blue-600',
    ADMIN: 'bg-gray-900 text-white',
  };

  const metricStatusColor = {
    ok: 'bg-emerald-500',
    warning: 'bg-orange-500',
    danger: 'bg-red-500',
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
        className="bg-linear-to-r from-gray-900 via-slate-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg shadow-gray-900/20 relative overflow-hidden"
      >
        {/* Effet décoratif */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-medium mb-1">
              <CommandLineIcon className="w-4 h-4" />
              CONSOLE D'ADMINISTRATION
            </div>
            <h2 className="text-xl font-bold">
              Bonjour {user?.prenom} 👋
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              Système opérationnel • <strong className="text-emerald-400">99.8% uptime</strong> •{' '}
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/audit"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/10"
            >
              <ClipboardDocumentListIcon className="w-4 h-4" />
              Voir les logs
            </Link>
            <Link
              to="/dashboard/utilisateurs"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Nouvel utilisateur
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ============================================
          KPIs
          ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Link
              to={stat.href || '#'}
              className="block bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50 hover:shadow-md transition-all duration-300"
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
                  </div>
                  {stat.hint && (
                    <p className="text-[10px] text-gray-400 mt-1 italic truncate">{stat.hint}</p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ============================================
          MÉTRIQUES SYSTÈME (Barres de progression)
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ServerStackIcon className="w-5 h-5 text-cyan-600" />
            <div>
              <h3 className="font-bold text-gray-900">Santé du système</h3>
              <p className="text-xs text-gray-500 mt-0.5">Métriques temps réel</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full font-bold flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Opérationnel
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                <span className={`text-xs font-bold ${
                  metric.status === 'ok' ? 'text-emerald-600' :
                  metric.status === 'warning' ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {metric.value}{metric.unit}
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: metric.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${metricStatusColor[metric.status]}`} />
                <span className="text-[10px] text-gray-500 uppercase font-bold">
                  {metric.status === 'ok' ? 'Normal' : metric.status === 'warning' ? 'Attention' : 'Critique'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ============================================
          GRAPHIQUE : Requêtes API 24h
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-900">Activité API</h3>
            <p className="text-xs text-gray-500 mt-0.5">Requêtes et erreurs sur 24h</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
              Requêtes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              Erreurs
            </span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={requetes24h} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRequetes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorErreurs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="heure" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Area type="monotone" dataKey="requetes" stroke="#06B6D4" strokeWidth={2.5} fill="url(#colorRequetes)" />
              <Area type="monotone" dataKey="erreurs" stroke="#F87171" strokeWidth={2.5} fill="url(#colorErreurs)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ============================================
          LIGNE : Répartition utilisateurs + Connexions
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition utilisateurs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Répartition des rôles</h3>
              <p className="text-xs text-gray-500 mt-0.5">156 utilisateurs</p>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usersParRole}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {usersParRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {usersParRole.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Connexions 7j */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Connexions récentes</h3>
              <p className="text-xs text-gray-500 mt-0.5">7 derniers jours • Total 961 connexions</p>
            </div>
            <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full font-bold">
              +18% vs semaine passée
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={connexions7j}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Bar dataKey="connexions" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ============================================
          ALERTES SYSTÈME
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
            Alertes système
          </h3>
          <span className="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded-full font-bold">
            {alertes.length} alertes
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {alertes.map((alerte, index) => {
            const colors = {
              danger: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', bar: 'bg-red-500' },
              warning: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', bar: 'bg-orange-500' },
              info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', bar: 'bg-blue-500' },
              success: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', bar: 'bg-emerald-500' },
            }[alerte.type] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100', bar: 'bg-gray-500' };

            return (
              <motion.div
                key={alerte.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
              >
                <Link
                  to={alerte.href}
                  className={`block p-3 rounded-xl border ${colors.border} ${colors.bg} hover:shadow-sm transition-all group h-full`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-10 rounded-full ${colors.bar} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${colors.text}`}>{alerte.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{alerte.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ============================================
          DERNIERS LOGS D'AUDIT
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-900">Derniers logs d'audit</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-9 pr-4 py-1.5 w-48 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <Link to="/dashboard/audit" className="text-sm text-cyan-600 font-medium hover:underline">
              Voir tout
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entité</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {derniersLogs.map((log) => {
                const config = statutLogConfig[log.statut];
                const StatusIcon = config.icon;
                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-gray-600">{log.user}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                        log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600' :
                        log.action === 'UPDATE' ? 'bg-blue-50 text-blue-600' :
                        log.action === 'DELETE' ? 'bg-red-50 text-red-600' :
                        log.action === 'LOGIN' ? 'bg-purple-50 text-purple-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{log.entite}</td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">{log.ip}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-full ${config.bg} ${config.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {log.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 text-right">{log.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ============================================
          UTILISATEURS RÉCENTS
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Utilisateurs récents</h3>
          </div>
          <Link to="/dashboard/utilisateurs" className="text-sm text-cyan-600 font-medium hover:underline">
            Gérer les utilisateurs
          </Link>
        </div>

        <div className="space-y-2">
          {utilisateursRecents.map((u, index) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                u.actif ? 'bg-linear-to-br from-blue-100 to-purple-100' : 'bg-gray-100'
              }`}>
                <span className="text-xs font-bold text-blue-600">
                  {u.nom.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{u.nom}</p>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
              </div>
              <span className={`hidden sm:inline-block text-[10px] font-bold uppercase px-2 py-1 rounded-full ${roleBadge[u.role] || 'bg-gray-100 text-gray-600'}`}>
                {u.role}
              </span>
              <div className="text-right flex-shrink-0 hidden md:block">
                <p className="text-xs text-gray-500">{u.derniereConnexion}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                  u.actif ? 'text-emerald-600' : 'text-gray-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${u.actif ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {u.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Désactiver">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ============================================
          RACCOURCIS ADMIN
          ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Utilisateurs', desc: '156 comptes', icon: UserGroupIcon, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/utilisateurs' },
          { title: 'Rôles & Permissions', desc: 'Configurer les accès', icon: ShieldCheckIcon, color: 'text-purple-600', bg: 'bg-purple-50', href: '/dashboard/roles' },
          { title: 'Logs email', desc: '342 envoyés', icon: EnvelopeIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/dashboard/logs-email' },
          { title: 'Sauvegardes', desc: 'Dernière : 6h', icon: ArrowPathIcon, color: 'text-orange-600', bg: 'bg-orange-50', href: '/dashboard/sauvegardes' },
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
              <p className="text-sm font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">
                {item.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ============================================
          LIGNE : Configuration & Maintenance
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Configuration</h3>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { title: 'Établissement', desc: 'Nom, logo, adresse, devise', icon: BuildingOfficeIcon, href: '/dashboard/etablissement' },
              { title: 'Années scolaires', desc: '2024-2025 en cours', icon: CalendarIcon, href: '/dashboard/annees' },
              { title: 'Règles d\'évaluation', desc: 'Barèmes et coefficients', icon: ClipboardDocumentListIcon, href: '/dashboard/regles-evaluation' },
              { title: 'Paramètres système', desc: 'Emails, notifications, paie', icon: Cog6ToothIcon, href: '/dashboard/parametres' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + index * 0.05 }}
              >
                <Link
                  to={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-cyan-50 transition-colors">
                    <item.icon className="w-4 h-4 text-gray-600 group-hover:text-cyan-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Maintenance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-gray-900">Maintenance rapide</h3>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Lancer une sauvegarde', desc: 'Sauvegarde manuelle de la base', icon: ArrowPathIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', action: 'Sauvegarder' },
              { title: 'Nettoyer les logs', desc: 'Supprimer les logs > 30 jours', icon: TrashIcon, color: 'text-red-600', bg: 'bg-red-50', action: 'Nettoyer' },
              { title: 'Vider le cache', desc: 'Redis + cache application', icon: CpuChipIcon, color: 'text-blue-600', bg: 'bg-blue-50', action: 'Vider' },
              { title: 'Tester les emails', desc: 'Envoyer un email de test', icon: EnvelopeIcon, color: 'text-purple-600', bg: 'bg-purple-50', action: 'Tester' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-cyan-200 transition-colors"
              >
                <div className={`p-2 rounded-lg ${item.bg} flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                </div>
                <button className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                  {item.action}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============================================
          CITATION DU JOUR
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="p-5 bg-linear-to-br from-gray-900 via-slate-800 to-gray-900 rounded-2xl border border-gray-700 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start gap-3">
          <SparklesIcon className="w-6 h-6 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-white italic">
              "Un bon système ne se voit pas. Il fonctionne, simplement."
            </p>
            <p className="text-xs text-gray-400 mt-1">— Principe DevOps</p>
          </div>
        </div>
      </motion.div>

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

export default AdminDashboardPage;