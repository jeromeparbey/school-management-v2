// frontend2/src/pages/dashboard/bibliothecaire/BibliothecaireDashboardPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/AuthContext';
import {
  // Icônes principales
  BookOpenIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ClockIcon,
  Squares2X2Icon,
  ArrowPathIcon,
  ChartBarIcon,
  SparklesIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon,
  ArrowRightIcon,
  BanknotesIcon,
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

interface EmpruntRecent {
  id: string;
  livre: string;
  auteur: string;
  eleve: string;
  classe: string;
  dateEmprunt: string;
  dateRetour: string;
  statut: 'EN_COURS' | 'RETOURNE' | 'EN_RETARD';
}

interface LivrePopulaire {
  titre: string;
  auteur: string;
  emprunts: number;
  categorie: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const BibliothecaireDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // ============================================
  // DONNÉES STATIQUES (à brancher sur API)
  // ============================================

  // --- KPIs Bibliothécaire ---
  const stats: StatCard[] = [
    {
      title: 'Total Livres',
      value: '3 542',
      change: '+124',
      trend: 'up',
      icon: BookOpenIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hint: 'Dans le catalogue',
    },
    {
      title: 'Emprunts en cours',
      value: '87',
      change: '+12',
      trend: 'up',
      icon: ArchiveBoxIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hint: 'Actuellement sortis',
    },
    {
      title: 'Retards',
      value: '14',
      change: '+5',
      trend: 'down',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hint: 'Emprunts en retard',
    },
    {
      title: 'Adhérents actifs',
      value: '428',
      change: '+18',
      trend: 'up',
      icon: UserGroupIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hint: 'Élèves + enseignants',
    },
  ];

  // --- Emprunts par mois (12 mois) ---
  const empruntsMensuels = [
    { mois: 'Jan', emprunts: 82, retours: 76 },
    { mois: 'Fév', emprunts: 94, retours: 88 },
    { mois: 'Mar', emprunts: 108, retours: 102 },
    { mois: 'Avr', emprunts: 96, retours: 91 },
    { mois: 'Mai', emprunts: 112, retours: 105 },
    { mois: 'Juin', emprunts: 78, retours: 82 },
    { mois: 'Juil', emprunts: 34, retours: 40 },
    { mois: 'Août', emprunts: 28, retours: 30 },
    { mois: 'Sep', emprunts: 118, retours: 108 },
    { mois: 'Oct', emprunts: 124, retours: 118 },
    { mois: 'Nov', emprunts: 132, retours: 126 },
    { mois: 'Déc', emprunts: 142, retours: 134 },
  ];

  // --- Répartition par catégorie (camembert) ---
  const repartitionCategories = [
    { name: 'Littérature', value: 1240, color: '#3B82F6' },
    { name: 'Sciences', value: 890, color: '#8B5CF6' },
    { name: 'Histoire', value: 620, color: '#10B981' },
    { name: 'Arts', value: 420, color: '#F59E0B' },
    { name: 'Autres', value: 372, color: '#EF4444' },
  ];

  // --- Top livres populaires ---
  const livresPopulaires: LivrePopulaire[] = [
    { titre: 'Le Petit Prince', auteur: 'A. de Saint-Exupéry', emprunts: 42, categorie: 'Littérature' },
    { titre: 'L\'Étranger', auteur: 'Albert Camus', emprunts: 38, categorie: 'Littérature' },
    { titre: 'Une si longue lettre', auteur: 'Mariama Bâ', emprunts: 35, categorie: 'Littérature' },
    { titre: 'L\'Enfant noir', auteur: 'Camara Laye', emprunts: 31, categorie: 'Littérature' },
    { titre: 'Voyage au bout de la nuit', auteur: 'Céline', emprunts: 28, categorie: 'Littérature' },
  ];

  // --- Emprunts récents ---
  const empruntsRecents: EmpruntRecent[] = [
    {
      id: 'EMP-1042',
      livre: 'Le Petit Prince',
      auteur: 'A. de Saint-Exupéry',
      eleve: 'Marie Dubois',
      classe: '6ème A',
      dateEmprunt: 'Il y a 2h',
      dateRetour: '15/01/2025',
      statut: 'EN_COURS',
    },
    {
      id: 'EMP-1041',
      livre: 'L\'Étranger',
      auteur: 'Albert Camus',
      eleve: 'Jean Martin',
      classe: '3ème D',
      dateEmprunt: 'Il y a 1j',
      dateRetour: '10/01/2025',
      statut: 'EN_RETARD',
    },
    {
      id: 'EMP-1040',
      livre: 'Une si longue lettre',
      auteur: 'Mariama Bâ',
      eleve: 'Awa Diallo',
      classe: '5ème B',
      dateEmprunt: 'Il y a 3j',
      dateRetour: '20/01/2025',
      statut: 'EN_COURS',
    },
    {
      id: 'EMP-1039',
      livre: 'L\'Enfant noir',
      auteur: 'Camara Laye',
      eleve: 'Paul Kouassi',
      classe: '2nde A',
      dateEmprunt: 'Il y a 5j',
      dateRetour: '08/01/2025',
      statut: 'RETOURNE',
    },
    {
      id: 'EMP-1038',
      livre: 'Voyage au bout de la nuit',
      auteur: 'Céline',
      eleve: 'Fatou Ndiaye',
      classe: '1ère C',
      dateEmprunt: 'Il y a 6j',
      dateRetour: '12/01/2025',
      statut: 'EN_RETARD',
    },
  ];

  // --- Alertes bibliothécaire ---
  const alertes = [
    { id: 1, type: 'danger', title: '14 emprunts en retard', desc: 'Relances à envoyer', href: '/dashboard/emprunts/retard' },
    { id: 2, type: 'warning', title: '5 livres à réparer', desc: 'État dégradé signalé', href: '/dashboard/livres' },
    { id: 3, type: 'info', title: '3 nouvelles demandes d\'adhésion', desc: 'En attente de validation', href: '/dashboard/utilisateurs' },
    { id: 4, type: 'success', title: 'Inventaire mensuel terminé', desc: 'Aucune anomalie majeure', href: '/dashboard/livres' },
  ];

  // --- Actions rapides ---
  const quickActions = [
    {
      title: 'Nouvel emprunt',
      icon: ArchiveBoxIcon,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      href: '/dashboard/emprunts/nouveau',
    },
    {
      title: 'Ajouter un livre',
      icon: PlusIcon,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      href: '/dashboard/livres/nouveau',
    },
    {
      title: 'Enregistrer retour',
      icon: ArrowPathIcon,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      href: '/dashboard/retours',
    },
    {
      title: 'Rechercher un livre',
      icon: MagnifyingGlassIcon,
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
      href: '/dashboard/livres',
    },
  ];

  // --- Activités récentes ---
  const activitesRecentes = [
    { id: 1, titre: 'Nouvel emprunt', desc: 'Le Petit Prince → Marie Dubois (6ème A)', time: 'Il y a 2h', icon: ArchiveBoxIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 2, titre: 'Retour enregistré', desc: 'L\'Enfant noir — Camara Laye', time: 'Il y a 4h', icon: CheckCircleIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 3, titre: 'Nouveau livre ajouté', desc: 'Les Misérables — Victor Hugo', time: 'Il y a 6h', icon: BookOpenIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 4, titre: 'Retard signalé', desc: 'L\'Étranger — Jean Martin (3ème D)', time: 'Il y a 1j', icon: ExclamationTriangleIcon, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 5, titre: 'Catégorie mise à jour', desc: 'Sciences → 890 livres', time: 'Il y a 2j', icon: Squares2X2Icon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

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
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">
              Bonjour {user?.prenom} 👋
            </h2>
            <p className="text-sm text-emerald-100 mt-1">
              Bienvenue dans votre espace bibliothèque •{' '}
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
              to="/dashboard/livres"
              className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <BookOpenIcon className="w-4 h-4" />
              Catalogue
            </Link>
            <Link
              to="/dashboard/emprunts/nouveau"
              className="px-4 py-2 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Nouvel emprunt
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
          GRAPHIQUE 1 : Emprunts vs Retours
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-900">Activité de la bibliothèque</h3>
            <p className="text-xs text-gray-500 mt-0.5">Emprunts vs Retours sur 12 mois</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
              Emprunts
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
              Retours
            </span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={empruntsMensuels} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <Bar dataKey="emprunts" fill="#10B981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="retours" fill="#60A5FA" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ============================================
          GRAPHIQUES LIGNE 2 : Catégories + Top livres
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camembert catégories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Répartition par catégorie</h3>
            <span className="text-xs text-gray-400">3 542 livres</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={repartitionCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {repartitionCategories.map((entry, index) => (
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
            {repartitionCategories.map((item) => (
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

        {/* Top 5 livres populaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Top 5 livres les plus empruntés</h3>
              <p className="text-xs text-gray-500 mt-0.5">Sur les 3 derniers mois</p>
            </div>
            <Link
              to="/dashboard/livres"
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Voir tout
            </Link>
          </div>
          <div className="space-y-4">
            {livresPopulaires.map((livre, index) => (
              <motion.div
                key={livre.titre}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm ${
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                      ? 'bg-gray-400'
                      : index === 2
                      ? 'bg-amber-600'
                      : 'bg-blue-500'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{livre.titre}</p>
                  <p className="text-xs text-gray-500">{livre.auteur}</p>
                </div>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                  {livre.categorie}
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{livre.emprunts}</p>
                  <p className="text-xs text-gray-400">emprunts</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============================================
          ALERTES BIBLIOTHÉCAIRE
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
          <span className="text-xs text-gray-400">Raccourcis bibliothèque</span>
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
          ACTIVITÉS + EMPRUNTS RÉCENTS
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activités récentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
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
                transition={{ delay: 0.6 + index * 0.05 }}
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

        {/* Emprunts récents (tableau) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ArchiveBoxIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900">Derniers emprunts</h3>
            </div>
            <Link
              to="/dashboard/emprunts"
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
                    Livre
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Élève
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Retour prévu
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {empruntsRecents.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {e.id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {e.livre}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{e.auteur}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{e.eleve}</p>
                      <p className="text-xs text-gray-500">{e.classe}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {e.dateRetour}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          e.statut === 'EN_COURS'
                            ? 'bg-blue-50 text-blue-600'
                            : e.statut === 'RETOURNE'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {e.statut === 'EN_COURS'
                          ? 'En cours'
                          : e.statut === 'RETOURNE'
                          ? 'Retourné'
                          : 'En retard'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* ============================================
          RACCOURCIS BIBLIOTHÈQUE
          ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Catalogue complet',
            desc: '3 542 livres disponibles',
            icon: BookOpenIcon,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/dashboard/livres',
          },
          {
            title: 'Emprunts en retard',
            desc: '14 à relancer',
            icon: ExclamationTriangleIcon,
            color: 'text-red-600',
            bg: 'bg-red-50',
            href: '/dashboard/emprunts/retard',
          },
          {
            title: 'Catégories',
            desc: 'Gérer les classements',
            icon: Squares2X2Icon,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            href: '/dashboard/categories-livres',
          },
          {
            title: 'Statistiques',
            desc: 'Vue détaillée de la bibliothèque',
            icon: ChartBarIcon,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            href: '/dashboard/statistiques',
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
          CITATION / CONSEIL DU JOUR
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50"
      >
        <div className="flex items-start gap-3">
          <SparklesIcon className="w-6 h-6 text-emerald-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              "Un livre est un rêve que vous tenez dans vos mains."
            </p>
            <p className="text-xs text-gray-500 mt-1">— Neil Gaiman</p>
          </div>
        </div>
      </motion.div>

      {/* ============================================
          PIED DE PAGE
          ============================================ */}
      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-200">
        <p>© 2024 EduManage. Tous droits réservés.</p>
        <p className="mt-1">
          Espace Bibliothécaire • Version 1.0.0 • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default BibliothecaireDashboardPage;