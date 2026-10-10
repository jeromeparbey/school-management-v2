// src/pages/dashboard/secretaire/SecretaireDashboardPage.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/AuthContext';
import {
  // Icons
  UserGroupIcon,
  CreditCardIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  BellIcon,
  PhoneIcon,
  UserPlusIcon,
  PrinterIcon,
  ClipboardDocumentCheckIcon,
  InboxIcon,
  BanknotesIcon as CashIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
  href?: string;
}

interface PaiementRecent {
  id: string;
  eleve: string;
  classe: string;
  montant: number;
  moyen: 'Espèces' | 'Mobile Money' | 'Virement' | 'Chèque';
  date: string;
  statut: 'complet' | 'partiel';
}

interface EcheanceProche {
  id: string;
  eleve: string;
  classe: string;
  echeance: string;
  montant: number;
  dateLimite: string;
  joursRestants: number;
  statut: 'urgent' | 'bientot' | 'ok';
}

interface ActionRapide {
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  href: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const SecretaireDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // ============================================
  // DONNÉES (à brancher sur API)
  // ============================================

  // --- KPIs Secrétaire ---
  const stats: StatCard[] = [
    {
      title: 'Paiements aujourd\'hui',
      value: '24',
      change: '+18%',
      trend: 'up',
      icon: CreditCardIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hint: 'Encaissés depuis 8h',
      href: '/dashboard/paiements',
    },
    {
      title: 'Recettes du jour',
      value: '485,000 FCFA',
      change: '+22.4%',
      trend: 'up',
      icon: BanknotesIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hint: 'Tous moyens confondus',
      href: '/dashboard/paiements',
    },
    {
      title: 'Échéances en retard',
      value: '12',
      change: '+3',
      trend: 'down',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hint: 'À relancer aujourd\'hui',
      href: '/dashboard/echeances',
    },
    {
      title: 'Inscriptions du mois',
      value: '38',
      change: '+9.1%',
      trend: 'up',
      icon: UserPlusIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hint: 'Nouveaux + réinscriptions',
      href: '/dashboard/inscriptions',
    },
  ];

  // --- Encaissements des 7 derniers jours ---
  const encaissements7j = [
    { jour: 'Lun', montant: 320000 },
    { jour: 'Mar', montant: 415000 },
    { jour: 'Mer', montant: 280000 },
    { jour: 'Jeu', montant: 520000 },
    { jour: 'Ven', montant: 610000 },
    { jour: 'Sam', montant: 380000 },
    { jour: 'Dim', montant: 0 },
  ];

  // --- Moyens de paiement (camembert) ---
  const moyensPaiement = [
    { name: 'Mobile Money', value: 185000, color: '#3B82F6', icon: DevicePhoneMobileIcon },
    { name: 'Espèces', value: 142000, color: '#10B981', icon: CashIcon },
    { name: 'Virement', value: 98000, color: '#8B5CF6', icon: BuildingLibraryIcon },
    { name: 'Chèque', value: 60000, color: '#F59E0B', icon: DocumentTextIcon },
  ];

  // --- Derniers paiements (5 derniers) ---
  const derniersPaiements: PaiementRecent[] = [
    { id: 'PAY-2841', eleve: 'Marie Dubois', classe: '6ème A', montant: 250000, moyen: 'Mobile Money', date: 'Il y a 5 min', statut: 'complet' },
    { id: 'PAY-2840', eleve: 'Jean Martin', classe: '3ème D', montant: 180000, moyen: 'Espèces', date: 'Il y a 25 min', statut: 'complet' },
    { id: 'PAY-2839', eleve: 'Awa Diallo', classe: '5ème B', montant: 220000, moyen: 'Virement', date: 'Il y a 1h', statut: 'complet' },
    { id: 'PAY-2838', eleve: 'Paul Kouassi', classe: '2nde A', montant: 150000, moyen: 'Mobile Money', date: 'Il y a 2h', statut: 'partiel' },
    { id: 'PAY-2837', eleve: 'Fatou Ndiaye', classe: '4ème C', montant: 300000, moyen: 'Chèque', date: 'Il y a 3h', statut: 'complet' },
  ];

  // --- Échéances proches (7 jours) ---
  const echeancesProches: EcheanceProche[] = [
    { id: 'ECH-1024', eleve: 'Ibrahim Traoré', classe: '6ème B', echeance: 'Tranche 2', montant: 150000, dateLimite: '15 Déc', joursRestants: 2, statut: 'urgent' },
    { id: 'ECH-1025', eleve: 'Aïcha Koné', classe: '5ème A', echeance: 'Tranche 2', montant: 150000, dateLimite: '18 Déc', joursRestants: 5, statut: 'bientot' },
    { id: 'ECH-1026', eleve: 'Moussa Diop', classe: '3ème C', echeance: 'Tranche 3', montant: 200000, dateLimite: '20 Déc', joursRestants: 7, statut: 'ok' },
    { id: 'ECH-1027', eleve: 'Awa Sow', classe: '2nde B', echeance: 'Tranche 2', montant: 175000, dateLimite: '16 Déc', joursRestants: 3, statut: 'urgent' },
  ];

  // --- Actions rapides secrétaire ---
  const actionsRapides: ActionRapide[] = [
    {
      title: 'Nouveau paiement',
      description: 'Encaisser et générer un reçu',
      icon: CreditCardIcon,
      color: 'text-white',
      bgColor: 'bg-linear-to-br from-emerald-500 to-emerald-600',
      href: '/dashboard/paiements/nouveau',
    },
    {
      title: 'Nouvelle inscription',
      description: 'Inscrire un nouvel élève',
      icon: UserPlusIcon,
      color: 'text-white',
      bgColor: 'bg-linear-to-br from-blue-500 to-blue-600',
      href: '/dashboard/eleves/nouveau',
    },
    {
      title: 'Imprimer un reçu',
      description: 'Réimprimer un reçu existant',
      icon: PrinterIcon,
      color: 'text-white',
      bgColor: 'bg-linear-to-br from-purple-500 to-purple-600',
      href: '/dashboard/recus',
    },
    {
      title: 'Envoyer une relance',
      description: 'Relancer les échéances en retard',
      icon: EnvelopeIcon,
      color: 'text-white',
      bgColor: 'bg-linear-to-br from-orange-500 to-orange-600',
      href: '/dashboard/relances',
    },
  ];

  // --- Tâches du jour ---
  const tachesJour = [
    { id: 1, title: 'Relancer 12 échéances en retard', type: 'urgent', done: false, href: '/dashboard/echeances' },
    { id: 2, title: 'Valider 5 inscriptions en attente', type: 'normal', done: false, href: '/dashboard/inscriptions' },
    { id: 3, title: 'Imprimer les reçus du jour (24)', type: 'normal', done: false, href: '/dashboard/recus' },
    { id: 4, title: 'Rappeler la famille Diop', type: 'info', done: false, href: '/dashboard/eleves' },
    { id: 5, title: 'Envoyer la circulaire parents', type: 'normal', done: true, href: '/dashboard/notifications' },
  ];

  // --- Dernières inscriptions ---
  const dernieresInscriptions = [
    { id: 1, eleve: 'Aminata Bâ', classe: '6ème A', type: 'Nouvelle', date: 'Il y a 1h', statut: 'validée' },
    { id: 2, eleve: 'Kofi Mensah', classe: '4ème B', type: 'Réinscription', date: 'Il y a 3h', statut: 'en attente' },
    { id: 3, eleve: 'Sofia Alassane', classe: '2nde C', type: 'Nouvelle', date: 'Il y a 5h', statut: 'validée' },
    { id: 4, eleve: 'Yann Kouadio', classe: '5ème A', type: 'Réinscription', date: 'Hier', statut: 'validée' },
  ];

  // --- Emails envoyés récents ---
  const emailsRecents = [
    { id: 1, destinataire: 'parent.martin@email.com', sujet: 'Reçu de paiement #PAY-2840', statut: 'ENVOYE', date: 'Il y a 30 min' },
    { id: 2, destinataire: 'parent.diallo@email.com', sujet: 'Rappel échéance Tranche 2', statut: 'ENVOYE', date: 'Il y a 2h' },
    { id: 3, destinataire: 'parent.kone@email.com', sujet: 'Confirmation inscription', statut: 'ECHEC', date: 'Il y a 3h' },
    { id: 4, destinataire: 'parent.traore@email.com', sujet: 'Reçu de paiement #PAY-2837', statut: 'ENVOYE', date: 'Il y a 5h' },
  ];

  // ============================================
  // HELPERS
  // ============================================
  const moyenIcon: Record<string, any> = {
    'Espèces': CashIcon,
    'Mobile Money': DevicePhoneMobileIcon,
    'Virement': BuildingLibraryIcon,
    'Chèque': DocumentTextIcon,
  };

  const moyenColor: Record<string, string> = {
    'Espèces': 'bg-emerald-50 text-emerald-600',
    'Mobile Money': 'bg-blue-50 text-blue-600',
    'Virement': 'bg-purple-50 text-purple-600',
    'Chèque': 'bg-orange-50 text-orange-600',
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
        className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">
              Bonjour {user?.prenom} 👋
            </h2>
            <p className="text-sm text-emerald-100 mt-1">
              Voici votre espace de gestion quotidienne •{' '}
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-200 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher un élève, un reçu..."
                className="pl-9 pr-4 py-2 w-64 bg-white/15 backdrop-blur placeholder-emerald-100 border border-white/20 rounded-lg text-sm outline-none focus:bg-white/25 transition-colors"
              />
            </div>
            <Link
              to="/dashboard/paiements/nouveau"
              className="px-4 py-2 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon className="w-4 h-4" />
              Encaisser
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
                    <span className="text-xs text-gray-400">vs hier</span>
                  </div>
                  {stat.hint && (
                    <p className="text-[10px] text-gray-400 mt-1 italic">{stat.hint}</p>
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
          ACTIONS RAPIDES SECRÉTAIRE
          ============================================ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Actions rapides</h2>
          <span className="text-xs text-gray-400">Raccourcis</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actionsRapides.map((action, index) => (
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
                className={`${action.bgColor} rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 block h-full`}
              >
                <action.icon className={`w-7 h-7 ${action.color} mb-3`} />
                <p className={`text-sm font-bold ${action.color} mb-1`}>
                  {action.title}
                </p>
                <p className="text-xs text-white/80 leading-snug">
                  {action.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ============================================
          TÂCHES DU JOUR
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Tâches du jour</h3>
          </div>
          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-bold">
            {tachesJour.filter((t) => !t.done).length} à faire
          </span>
        </div>

        <div className="space-y-2">
          {tachesJour.map((tache, index) => {
            const typeColors = {
              urgent: { bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-500', text: 'text-red-700' },
              normal: { bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-500', text: 'text-blue-700' },
              info: { bg: 'bg-gray-50', border: 'border-gray-100', dot: 'bg-gray-400', text: 'text-gray-700' },
            }[tache.type] || { bg: 'bg-gray-50', border: 'border-gray-100', dot: 'bg-gray-400', text: 'text-gray-700' };

            return (
              <motion.div
                key={tache.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Link
                  to={tache.href}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${typeColors.border} ${typeColors.bg} hover:shadow-sm transition-all group ${tache.done ? 'opacity-60' : ''}`}
                >
                  <div className={`w-2 h-8 rounded-full ${tache.done ? 'bg-emerald-400' : typeColors.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${tache.done ? 'line-through text-gray-500' : typeColors.text}`}>
                      {tache.title}
                    </p>
                  </div>
                  {tache.done ? (
                    <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <ArrowRightIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ============================================
          GRAPHIQUE : Encaissements 7 derniers jours
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-900">Encaissements des 7 derniers jours</h3>
            <p className="text-xs text-gray-500 mt-0.5">Total : 2,525,000 FCFA</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7j">7 jours</option>
            <option value="30j">30 jours</option>
            <option value="mois">Ce mois</option>
          </select>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={encaissements7j} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEncaissement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                formatter={(v) => `${Number(v).toLocaleString('fr-FR')} FCFA`}
              />
              <Area type="monotone" dataKey="montant" stroke="#10B981" strokeWidth={2.5} fill="url(#colorEncaissement)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ============================================
          LIGNE : Moyens paiement + Échéances proches
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Moyens de paiement (camembert) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Moyens de paiement</h3>
            <span className="text-xs text-gray-400">Aujourd'hui</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moyensPaiement}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {moyensPaiement.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(v) => `${Number(v).toLocaleString('fr-FR')} FCFA`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {moyensPaiement.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <Icon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.value.toLocaleString('fr-FR')}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Total encaissé</span>
            <span className="text-lg font-bold text-emerald-600">485,000 FCFA</span>
          </div>
        </motion.div>

        {/* Échéances proches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-gray-900">Échéances à venir</h3>
            </div>
            <Link to="/dashboard/echeances" className="text-sm text-blue-600 font-medium hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {echeancesProches.map((echeance, index) => {
              const statutConfig = {
                urgent: { bg: 'bg-red-50', border: 'border-red-100', badge: 'bg-red-500', label: 'Urgent' },
                bientot: { bg: 'bg-orange-50', border: 'border-orange-100', badge: 'bg-orange-500', label: 'Bientôt' },
                ok: { bg: 'bg-blue-50', border: 'border-blue-100', badge: 'bg-blue-500', label: 'OK' },
              }[echeance.statut];

              return (
                <motion.div
                  key={echeance.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <Link
                    to={`/dashboard/echeances/${echeance.id}`}
                    className={`flex items-center gap-4 p-3 rounded-xl border ${statutConfig.border} ${statutConfig.bg} hover:shadow-sm transition-all group`}
                  >
                    <div className="flex-shrink-0">
                      <span className={`inline-block w-2 h-10 rounded-full ${statutConfig.badge}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{echeance.eleve}</p>
                        <span className="text-xs px-2 py-0.5 bg-white text-gray-600 rounded-full border border-gray-200">
                          {echeance.classe}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {echeance.echeance} • Limite : {echeance.dateLimite}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{echeance.montant.toLocaleString('fr-FR')} FCFA</p>
                      <p className={`text-xs font-medium ${
                        echeance.joursRestants <= 2 ? 'text-red-600' :
                        echeance.joursRestants <= 5 ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        J-{echeance.joursRestants}
                      </p>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ============================================
          DERNIERS PAIEMENTS
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BanknotesIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">Derniers paiements reçus</h3>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/paiements/nouveau"
              className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg font-medium hover:bg-emerald-100 transition-colors flex items-center gap-1"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Nouveau
            </Link>
            <Link to="/dashboard/paiements" className="text-sm text-blue-600 font-medium hover:underline">
              Voir tout
            </Link>
          </div>
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
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {derniersPaiements.map((p) => {
                const MoyenIcon = moyenIcon[p.moyen];
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{p.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.eleve}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.classe}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${moyenColor[p.moyen]}`}>
                        {MoyenIcon && <MoyenIcon className="w-3.5 h-3.5" />}
                        {p.moyen}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">
                      {p.montant.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.statut === 'complet' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-full">
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          Complet
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-50 text-orange-600 rounded-full">
                          <ExclamationCircleIcon className="w-3.5 h-3.5" />
                          Partiel
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 text-right">{p.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/dashboard/recus/${p.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Imprimer le reçu"
                        >
                          <PrinterIcon className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Plus d'options"
                        >
                          <EllipsisVerticalIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ============================================
          LIGNE : Dernières inscriptions + Emails
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernières inscriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <UserPlusIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Dernières inscriptions</h3>
            </div>
            <Link to="/dashboard/inscriptions" className="text-sm text-blue-600 font-medium hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {dernieresInscriptions.map((insc, index) => (
              <motion.div
                key={insc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">
                    {insc.eleve.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{insc.eleve}</p>
                  <p className="text-xs text-gray-500">
                    {insc.classe} • <span className={insc.type === 'Nouvelle' ? 'text-emerald-600' : 'text-blue-600'}>{insc.type}</span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {insc.statut === 'validée' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-full">
                      <CheckCircleIcon className="w-3 h-3" />
                      Validée
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-50 text-orange-600 rounded-full">
                      <ClockIcon className="w-3 h-3" />
                      En attente
                    </span>
                  )}
                  <p className="text-[10px] text-gray-400 mt-0.5">{insc.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Emails envoyés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">Emails envoyés</h3>
            </div>
            <Link to="/dashboard/emails" className="text-sm text-blue-600 font-medium hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {emailsRecents.map((email, index) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  email.statut === 'ENVOYE' ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  {email.statut === 'ENVOYE' ? (
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{email.sujet}</p>
                  <p className="text-xs text-gray-500 truncate">{email.destinataire}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{email.date}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                  email.statut === 'ENVOYE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {email.statut}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============================================
          RACCOURCIS SECRÉTAIRE
          ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Inscriptions', desc: '5 en attente', icon: UserPlusIcon, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/inscriptions' },
          { title: 'Reçus', desc: '24 aujourd\'hui', icon: InboxIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/dashboard/recus' },
          { title: 'Responsables', desc: 'Contacter les parents', icon: PhoneIcon, color: 'text-purple-600', bg: 'bg-purple-50', href: '/dashboard/responsables' },
          { title: 'Emploi du temps', desc: 'Consulter les plannings', icon: CalendarIcon, color: 'text-orange-600', bg: 'bg-orange-50', href: '/dashboard/emploi-temps' },
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

export default SecretaireDashboardPage;