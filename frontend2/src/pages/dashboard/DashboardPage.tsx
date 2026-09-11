// src/pages/dashboard/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/AuthContext';
import {
  // Navigation
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  
  // Cards
  UsersIcon,
  BookOpenIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  
  // Actions
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  EllipsisVerticalIcon,
  
  // Dashboard
  RocketLaunchIcon,
  SparklesIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [notifications, setNotifications] = useState(3);

  // ============================================
  // DONNÉES STATIQUES
  // ============================================
  
  const stats: StatCard[] = [
    {
      title: 'Total Élèves',
      value: '1,284',
      change: '+12.5%',
      trend: 'up',
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Enseignants',
      value: '48',
      change: '+3.2%',
      trend: 'up',
      icon: AcademicCapIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Revenus du mois',
      value: '€12,450',
      change: '+8.7%',
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Taux de présence',
      value: '94.2%',
      change: '-2.1%',
      trend: 'down',
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const recentActivities: Activity[] = [
    {
      id: 1,
      type: 'student',
      title: 'Nouvel élève inscrit',
      description: 'Marie Dubois - Classe de 6ème A',
      time: 'Il y a 15 minutes',
      icon: UsersIcon,
      color: 'text-blue-600',
    },
    {
      id: 2,
      type: 'payment',
      title: 'Paiement reçu',
      description: 'Frais de scolarité - Famille Martin',
      time: 'Il y a 2 heures',
      icon: CreditCardIcon,
      color: 'text-emerald-600',
    },
    {
      id: 3,
      type: 'absence',
      title: 'Absence signalée',
      description: 'Jean Dupont - 5ème B (maladie)',
      time: 'Il y a 3 heures',
      icon: ExclamationCircleIcon,
      color: 'text-red-600',
    },
    {
      id: 4,
      type: 'teacher',
      title: 'Nouvel enseignant',
      description: 'M. Pierre Laurent - Mathématiques',
      time: 'Il y a 5 heures',
      icon: AcademicCapIcon,
      color: 'text-purple-600',
    },
    {
      id: 5,
      type: 'class',
      title: 'Emploi du temps mis à jour',
      description: 'Classe de Terminale S - Nouveau planning',
      time: 'Il y a 1 jour',
      icon: CalendarIcon,
      color: 'text-indigo-600',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      title: 'Ajouter un élève',
      icon: UserGroupIcon,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      href: '/students/add',
    },
    {
      title: 'Enregistrer paiement',
      icon: CreditCardIcon,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      href: '/payments/add',
    },
    {
      title: 'Créer un bulletin',
      icon: DocumentTextIcon,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      href: '/grades/create',
    },
    {
      title: 'Gérer les présences',
      icon: ClockIcon,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
      href: '/attendance',
    },
  ];

  const upcomingEvents = [
    {
      title: 'Réunion des enseignants',
      date: 'Aujourd\'hui, 15:00',
      type: 'Meeting',
      color: 'bg-blue-500',
    },
    {
      title: 'Conseil de classe',
      date: 'Demain, 10:00',
      type: 'Academic',
      color: 'bg-purple-500',
    },
    {
      title: 'Remise des bulletins',
      date: 'Vendredi, 14:00',
      type: 'Event',
      color: 'bg-emerald-500',
    },
  ];

  // ============================================
  // EFFETS
  // ============================================
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================
  // MENU DE NAVIGATION
  // ============================================
  
  const navigation = [
    { name: 'Tableau de bord', icon: HomeIcon, href: '/dashboard' },
    { name: 'Élèves', icon: UserGroupIcon, href: '/students' },
    { name: 'Enseignants', icon: AcademicCapIcon, href: '/teachers' },
    { name: 'Paiements', icon: CurrencyDollarIcon, href: '/payments' },
    { name: 'Emploi du temps', icon: CalendarIcon, href: '/schedule' },
    { name: 'Bulletins', icon: DocumentTextIcon, href: '/grades' },
    { name: 'Statistiques', icon: ChartBarIcon, href: '/statistics' },
    { name: 'Paramètres', icon: Cog6ToothIcon, href: '/settings' },
  ];

  // ============================================
  // RENDU
  // ============================================
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ============================================
      SIDEBAR
      ============================================ */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-2xl md:shadow-none md:relative md:translate-x-0 ${
          isMobile ? 'translate-x-0' : ''
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">EduManage</span>
              <span className="text-xs text-gray-400 block -mt-0.5">Pro</span>
            </div>
          </Link>
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Profil */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
              <span className="text-lg font-bold text-blue-600">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <BellIcon className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {notifications}
                </span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-240px)]">
          {navigation.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  location.pathname === item.href
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    location.pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-400 group-hover:text-blue-600'
                  }`}
                />
                <span className="text-sm font-medium">{item.name}</span>
                {location.pathname === item.href && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Déconnexion */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </motion.aside>

      {/* ============================================
      MAIN CONTENT
      ============================================ */}
      <div className="flex-1 min-w-0">
        {/* ============================================
        TOP BAR
        ============================================ */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                {/* Bouton menu mobile */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>

                {/* Titre et période */}
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Tableau de bord
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Bienvenue, {user?.prenom} 👋
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Recherche */}
                <div className="hidden sm:relative sm:flex items-center">
                  <MagnifyingGlassIcon className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="pl-9 pr-4 py-2 w-48 lg:w-64 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none text-sm"
                  />
                </div>

                {/* Période */}
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="hidden sm:block px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                </select>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <BellIcon className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ============================================
        CONTENU PRINCIPAL
        ============================================ */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-8">
          {/* ============================================
          STATISTIQUES
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
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
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
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

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
          ACTIVITÉS RÉCENTES ET ÉVÉNEMENTS
          ============================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activités récentes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <div className={`p-2 rounded-xl bg-gray-100 ${activity.color}`}>
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.description}
                      </p>
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
              transition={{ delay: 0.4 }}
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
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-2 h-12 ${event.color} rounded-full flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {event.title}
                      </p>
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
                transition={{ delay: 0.5 }}
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
          PERFORMANCE ET STATISTIQUES
          ============================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance par classe */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Performance par classe</h3>
                <button className="text-sm text-blue-600 font-medium">Détails</button>
              </div>
              <div className="space-y-3">
                {[
                  { name: '6ème A', value: 92, color: 'bg-blue-500' },
                  { name: '5ème B', value: 85, color: 'bg-emerald-500' },
                  { name: '4ème C', value: 78, color: 'bg-purple-500' },
                  { name: '3ème D', value: 88, color: 'bg-orange-500' },
                  { name: '2nde A', value: 81, color: 'bg-indigo-500' },
                ].map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
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
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Répartition des paiements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Répartition des paiements</h3>
                <span className="text-xs text-gray-400">Ce mois</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Frais de scolarité', amount: '€8,450', percentage: 68, color: 'bg-blue-500' },
                  { label: 'Frais d\'inscription', amount: '€2,100', percentage: 17, color: 'bg-purple-500' },
                  { label: 'Autres frais', amount: '€1,900', percentage: 15, color: 'bg-emerald-500' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.amount}</p>
                      </div>
                      <span className="text-sm text-gray-600">{item.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        className={`h-full ${item.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-lg font-bold text-gray-900">€12,450</span>
                </div>
              </div>
            </motion.div>
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
        </main>
      </div>

      {/* ============================================
      OVERLAY MOBILE
      ============================================ */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;