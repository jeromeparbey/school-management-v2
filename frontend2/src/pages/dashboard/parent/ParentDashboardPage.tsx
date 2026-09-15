// src/pages/dashboard/parent/ParentDashboardPage.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/AuthContext';
import {
  // Mes enfants
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  // Finances
  CreditCardIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  // Communication
  BellIcon,
  EnvelopeIcon,
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
  PrinterIcon,
  PhoneIcon,
  MapPinIcon,
  ChevronRightIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  
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

interface Enfant {
  id: string;
  prenom: string;
  nom: string;
  classe: string;
  matricule: string;
  moyenne: number;
  rang: number;
  effectif: number;
  couleur: string;
  photo?: string;
}

interface NoteRecente {
  id: string;
  matiere: string;
  valeur: number;
  bareme: number;
  type: string;
  date: string;
  enfant: string;
  appreciation?: string;
}

interface PaiementRecent {
  id: string;
  reference: string;
  montant: number;
  date: string;
  moyen: string;
  enfant: string;
  statut: 'COMPLET' | 'PARTIEL';
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const ParentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedEnfant, setSelectedEnfant] = useState<string | null>(null);

  // ============================================
  // DONNÉES (à brancher sur API)
  // ============================================

  // --- Mes enfants (2 enfants) ---
  const enfants: Enfant[] = [
    {
      id: 'E1',
      prenom: 'Lucas',
      nom: 'Martin',
      classe: '6ème A',
      matricule: 'ELV-2024-001',
      moyenne: 14.2,
      rang: 5,
      effectif: 32,
      couleur: 'bg-blue-500',
    },
    {
      id: 'E2',
      prenom: 'Emma',
      nom: 'Martin',
      classe: '4ème C',
      matricule: 'ELV-2024-002',
      moyenne: 15.8,
      rang: 2,
      effectif: 30,
      couleur: 'bg-pink-500',
    },
  ];

  // --- KPIs Parent ---
  const stats: StatCard[] = [
    {
      title: 'Mes enfants',
      value: '2',
      change: '+0',
      trend: 'up',
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hint: 'Lucas (6ème A) • Emma (4ème C)',
      href: '/dashboard/mes-enfants',
    },
    {
      title: 'Moyenne générale',
      value: '15.0/20',
      change: '+0.8',
      trend: 'up',
      icon: TrophyIcon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      hint: 'Sur les 2 enfants',
      href: '/dashboard/bulletins',
    },
    {
      title: 'Solde à payer',
      value: '250,000 FCFA',
      change: '-22%',
      trend: 'down',
      icon: CreditCardIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hint: 'Prochaine échéance : 20 Déc',
      href: '/dashboard/echeances',
    },
    {
      title: 'Notifications',
      value: '4',
      change: '+2',
      trend: 'up',
      icon: BellIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hint: '2 non lues',
      href: '/dashboard/notifications',
    },
  ];

  // --- Évolution moyennes Lucas vs Emma ---
  const evolutionMoyennes = [
    { mois: 'Sep', lucas: 13.5, emma: 15.0 },
    { mois: 'Oct', lucas: 14.0, emma: 15.4 },
    { mois: 'Nov', lucas: 13.8, emma: 15.6 },
    { mois: 'Déc', lucas: 14.2, emma: 15.8 },
    { mois: 'Jan', lucas: 14.5, emma: 15.9 },
    { mois: 'Fév', lucas: 14.2, emma: 15.8 },
  ];

  // --- Détail par matière (dernier bulletin) ---
  const notesParMatiere = [
    { matiere: 'Maths', lucas: 15, emma: 17 },
    { matiere: 'Français', lucas: 13, emma: 16 },
    { matiere: 'Anglais', lucas: 14, emma: 15 },
    { matiere: 'Histoire', lucas: 12, emma: 16 },
    { matiere: 'Sciences', lucas: 16, emma: 14 },
    { matiere: 'Sport', lucas: 18, emma: 17 },
  ];

  // --- Répartition des notes Lucas ---
  const repartitionLucas = [
    { name: 'Excellent (16-20)', value: 4, color: '#10B981' },
    { name: 'Bien (14-16)', value: 8, color: '#3B82F6' },
    { name: 'Moyen (10-14)', value: 6, color: '#F59E0B' },
    { name: 'Faible (<10)', value: 1, color: '#EF4444' },
  ];

  // --- Notes récentes ---
  const notesRecentes: NoteRecente[] = [
    { id: 'N1', matiere: 'Mathématiques', valeur: 16, bareme: 20, type: 'Devoir', date: '15 Déc', enfant: 'Lucas', appreciation: 'Très bon travail' },
    { id: 'N2', matiere: 'Français', valeur: 18, bareme: 20, type: 'Composition', date: '14 Déc', enfant: 'Emma', appreciation: 'Excellent !' },
    { id: 'N3', matiere: 'Sciences', valeur: 14, bareme: 20, type: 'TP', date: '12 Déc', enfant: 'Lucas', appreciation: 'Bien' },
    { id: 'N4', matiere: 'Histoire', valeur: 12, bareme: 20, type: 'Test', date: '10 Déc', enfant: 'Lucas', appreciation: 'Peut mieux faire' },
    { id: 'N5', matiere: 'Anglais', valeur: 15, bareme: 20, type: 'Oral', date: '08 Déc', enfant: 'Emma', appreciation: 'Bon niveau' },
  ];

  // --- Prochaines échéances ---
  const echeancesProches = [
    { id: 'ECH-1024', enfant: 'Lucas Martin', echeance: 'Tranche 2', montant: 150000, dateLimite: '20 Déc', joursRestants: 7, statut: 'bientot' },
    { id: 'ECH-1025', enfant: 'Emma Martin', echeance: 'Tranche 2', montant: 100000, dateLimite: '20 Déc', joursRestants: 7, statut: 'bientot' },
    { id: 'ECH-1026', enfant: 'Lucas Martin', echeance: 'Tranche 3', montant: 150000, dateLimite: '15 Mar', joursRestants: 92, statut: 'ok' },
  ];

  // --- Derniers paiements ---
  const paiementsRecents: PaiementRecent[] = [
    { id: 'P1', reference: 'PAY-2835', montant: 250000, date: '01 Déc', moyen: 'Mobile Money', enfant: 'Lucas + Emma', statut: 'COMPLET' },
    { id: 'P2', reference: 'PAY-2790', montant: 150000, date: '15 Oct', moyen: 'Espèces', enfant: 'Lucas', statut: 'COMPLET' },
    { id: 'P3', reference: 'PAY-2745', montant: 100000, date: '10 Sep', moyen: 'Virement', enfant: 'Emma', statut: 'COMPLET' },
  ];

  // --- Absences des enfants ---
  const absencesEnfants = [
    { id: 'A1', enfant: 'Lucas', date: '05 Déc', duree: '1 jour', motif: 'Maladie', justifiee: true },
    { id: 'A2', enfant: 'Emma', date: '28 Nov', duree: '0.5 jour', motif: 'Rendez-vous médical', justifiee: true },
    { id: 'A3', enfant: 'Lucas', date: '15 Nov', duree: '1 jour', motif: 'Non justifiée', justifiee: false },
  ];

  // --- Emploi du temps du jour ---
  const coursJour = [
    { id: 'C1', enfant: 'Lucas', heure: '08:00', matiere: 'Mathématiques', salle: 'Salle 12' },
    { id: 'C2', enfant: 'Lucas', heure: '10:15', matiere: 'Français', salle: 'Salle 08' },
    { id: 'C3', enfant: 'Emma', heure: '09:00', matiere: 'Anglais', salle: 'Salle 21' },
    { id: 'C4', enfant: 'Emma', heure: '14:00', matiere: 'Sciences', salle: 'Labo 3' },
  ];

  // --- Alertes Parent ---
  const alertes = [
    { id: 1, type: 'warning', title: 'Échéance dans 7 jours', desc: '250 000 FCFA à régler avant le 20 Déc', href: '/dashboard/echeances' },
    { id: 2, type: 'info', title: 'Bulletins disponibles', desc: 'Trimestre 1 - Lucas & Emma', href: '/dashboard/bulletins' },
    { id: 3, type: 'success', title: 'Emma : 2ème de sa classe', desc: 'Félicitations ! Moyenne 15.8/20', href: '/dashboard/mes-enfants' },
  ];

  // ============================================
  // HELPERS
  // ============================================
  const getNoteColor = (note: number, bareme: number) => {
    const pct = (note / bareme) * 100;
    if (pct >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500' };
    if (pct >= 60) return { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-500' };
    if (pct >= 50) return { bg: 'bg-orange-50', text: 'text-orange-600', bar: 'bg-orange-500' };
    return { bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-500' };
  };

  const getStatutEcheance = (statut: string) => {
    return {
      urgent: { bg: 'bg-red-50', border: 'border-red-100', badge: 'bg-red-500', label: 'Urgent', text: 'text-red-600' },
      bientot: { bg: 'bg-orange-50', border: 'border-orange-100', badge: 'bg-orange-500', label: 'Bientôt', text: 'text-orange-600' },
      ok: { bg: 'bg-blue-50', border: 'border-blue-100', badge: 'bg-blue-500', label: 'OK', text: 'text-blue-600' },
    }[statut] || { bg: 'bg-gray-50', border: 'border-gray-100', badge: 'bg-gray-500', label: 'OK', text: 'text-gray-600' };
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
        className="bg-linear-to-r from-amber-500 via-orange-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-100 text-xs font-medium mb-1">
              <UserGroupIcon className="w-4 h-4" />
              ESPACE PARENT
            </div>
            <h2 className="text-xl font-bold">
              Bonjour {user?.prenom} 👋
            </h2>
            <p className="text-sm text-amber-100 mt-1">
              Suivi de <strong className="text-white">Lucas</strong> et <strong className="text-white">Emma</strong> •{' '}
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/echeances"
              className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <CreditCardIcon className="w-4 h-4" />
              Payer maintenant
            </Link>
            <Link
              to="/dashboard/bulletins"
              className="px-4 py-2 bg-white text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              <DocumentTextIcon className="w-4 h-4" />
              Voir les bulletins
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
          ALERTES PARENT
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <BellIcon className="w-5 h-5 text-orange-500" />
            Mes notifications importantes
          </h3>
          <span className="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded-full font-bold">
            {alertes.length} éléments
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {alertes.map((alerte, index) => {
            const colors = {
              warning: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', bar: 'bg-orange-400' },
              info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', bar: 'bg-blue-400' },
              success: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', bar: 'bg-emerald-400' },
            }[alerte.type] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100', bar: 'bg-gray-400' };

            return (
              <motion.div
                key={alerte.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Link
                  to={alerte.href}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${colors.border} ${colors.bg} hover:shadow-sm transition-all group`}
                >
                  <div className={`w-2 h-10 rounded-full ${colors.bar}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${colors.text}`}>{alerte.title}</p>
                    <p className="text-xs text-gray-600 truncate">{alerte.desc}</p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ============================================
          MES ENFANTS (cartes)
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Mes enfants</h3>
          </div>
          <Link to="/dashboard/mes-enfants" className="text-sm text-blue-600 font-medium hover:underline">
            Voir les détails
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enfants.map((enfant, index) => (
            <motion.div
              key={enfant.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={`/dashboard/mes-enfants/${enfant.id}`}
                className="block bg-linear-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl ${enfant.couleur} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <span className="text-white font-bold text-2xl">
                      {enfant.prenom[0]}{enfant.nom[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {enfant.prenom} {enfant.nom}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                        {enfant.classe}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{enfant.matricule}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="bg-white rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-medium">MOYENNE GÉNÉRALE</p>
                    <p className={`text-xl font-bold mt-0.5 ${
                      enfant.moyenne >= 14 ? 'text-emerald-600' :
                      enfant.moyenne >= 12 ? 'text-blue-600' :
                      enfant.moyenne >= 10 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {enfant.moyenne.toFixed(1)}/20
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-medium">RANG</p>
                    <p className="text-xl font-bold text-gray-900 mt-0.5">
                      {enfant.rang}<span className="text-sm text-gray-400 font-normal">/{enfant.effectif}</span>
                    </p>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Performance</span>
                    <span className="font-medium text-gray-700">{((enfant.moyenne / 20) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${enfant.couleur} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(enfant.moyenne / 20) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarSolidIcon
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(enfant.moyenne / 4) ? 'text-amber-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ============================================
          GRAPHIQUE : Évolution moyennes Lucas vs Emma
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-900">Évolution des moyennes</h3>
            <p className="text-xs text-gray-500 mt-0.5">Comparaison Lucas vs Emma</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Lucas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-pink-500 rounded-full"></span>
              Emma
            </span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolutionMoyennes} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLucas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEmma" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis domain={[10, 20]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                formatter={(v) => `${Number(v).toFixed(1)}/20`}
              />
              <Area type="monotone" dataKey="lucas" stroke="#3B82F6" strokeWidth={2.5} fill="url(#colorLucas)" />
              <Area type="monotone" dataKey="emma" stroke="#EC4899" strokeWidth={2.5} fill="url(#colorEmma)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ============================================
          LIGNE : Notes par matière + Répartition
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes par matière (barres groupées) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Notes par matière</h3>
              <p className="text-xs text-gray-500 mt-0.5">Dernier bulletin (Trimestre 1)</p>
            </div>
            <Link to="/dashboard/bulletins" className="text-sm text-blue-600 font-medium hover:underline">
              Voir bulletins
            </Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={notesParMatiere}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="matiere" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(v) => `${v}/20`}
                />
                <Bar dataKey="lucas" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Lucas" />
                <Bar dataKey="emma" fill="#EC4899" radius={[6, 6, 0, 0]} name="Emma" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Répartition notes Lucas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Notes de Lucas</h3>
              <p className="text-xs text-gray-500 mt-0.5">19 notes au total</p>
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={repartitionLucas}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {repartitionLucas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {repartitionLucas.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value} notes</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============================================
          DERNIÈRES NOTES
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Dernières notes</h3>
          </div>
          <Link to="/dashboard/bulletins" className="text-sm text-blue-600 font-medium hover:underline">
            Voir toutes les notes
          </Link>
        </div>

        <div className="space-y-2">
          {notesRecentes.map((note, index) => {
            const config = getNoteColor(note.valeur, note.bareme);
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className={`w-14 h-14 rounded-xl ${config.bg} flex flex-col items-center justify-center flex-shrink-0`}>
                  <span className={`text-lg font-bold ${config.text}`}>{note.valeur}</span>
                  <span className="text-[10px] text-gray-500">/{note.bareme}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{note.matiere}</p>
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {note.type}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      note.enfant === 'Lucas' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                    }`}>
                      {note.enfant}
                    </span>
                  </div>
                  {note.appreciation && (
                    <p className="text-xs text-gray-500 mt-0.5 italic">"{note.appreciation}"</p>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{note.date}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ============================================
          LIGNE : Échéances + Paiements récents
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Échéances proches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
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

          <div className="mb-4 p-4 bg-linear-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-700 font-medium">Total à payer</p>
                <p className="text-2xl font-bold text-orange-900">250 000 FCFA</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-orange-700 font-medium">Prochaine</p>
                <p className="text-sm font-bold text-orange-900">20 Déc (J-7)</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {echeancesProches.map((echeance, index) => {
              const config = getStatutEcheance(echeance.statut);
              return (
                <motion.div
                  key={echeance.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                >
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${config.border} ${config.bg}`}>
                    <div className={`w-2 h-12 rounded-full ${config.badge} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{echeance.enfant}</p>
                      <p className="text-xs text-gray-500">
                        {echeance.echeance} • Limite : {echeance.dateLimite}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">
                        {echeance.montant.toLocaleString('fr-FR')}
                      </p>
                      <p className={`text-xs font-medium ${config.text}`}>
                        J-{echeance.joursRestants}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Paiements récents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BanknotesIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900">Paiements récents</h3>
            </div>
            <Link to="/dashboard/mes-paiements" className="text-sm text-blue-600 font-medium hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="space-y-3">
            {paiementsRecents.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{p.reference}</p>
                  <p className="text-xs text-gray-500">{p.enfant} • {p.moyen}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-emerald-600">
                    {p.montant.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-400">{p.date}</p>
                </div>
                <button
                  className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Imprimer le reçu"
                >
                  <PrinterIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============================================
          LIGNE : Absences + Cours du jour
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Absences des enfants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-gray-900">Absences récentes</h3>
            </div>
            <Link to="/dashboard/absences" className="text-sm text-blue-600 font-medium hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="space-y-2">
            {absencesEnfants.map((abs, index) => (
              <motion.div
                key={abs.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  abs.justifiee ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  {abs.justifiee ? (
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{abs.enfant}</p>
                  <p className="text-xs text-gray-500">
                    {abs.duree} • {abs.motif}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{abs.date}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    abs.justifiee ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {abs.justifiee ? 'Justifiée' : 'Non justifiée'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cours du jour */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Cours d'aujourd'hui</h3>
            </div>
            <Link to="/dashboard/emploi-temps" className="text-sm text-blue-600 font-medium hover:underline">
              Emploi du temps
            </Link>
          </div>

          <div className="space-y-2">
            {coursJour.map((cours, index) => (
              <motion.div
                key={cours.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
              >
                <div className="w-14 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-700">{cours.heure}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{cours.matiere}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      cours.enfant === 'Lucas' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                    }`}>
                      {cours.enfant}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <MapPinIcon className="w-3 h-3" />
                    {cours.salle}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============================================
          RACCOURCIS PARENT
          ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Bulletins', desc: 'Consulter les notes', icon: DocumentTextIcon, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/bulletins' },
          { title: 'Mes paiements', desc: 'Historique & reçus', icon: BanknotesIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/dashboard/mes-paiements' },
          { title: 'Emploi du temps', desc: 'Planning des enfants', icon: CalendarIcon, color: 'text-purple-600', bg: 'bg-purple-50', href: '/dashboard/emploi-temps' },
          { title: 'Contacter l\'école', desc: 'Envoyer une réclamation', icon: PhoneIcon, color: 'text-orange-600', bg: 'bg-orange-50', href: '/dashboard/reclamations' },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + index * 0.05 }}
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
          CITATION DU JOUR
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="p-5 bg-linear-to-br from-amber-50 via-orange-50 to-pink-50 rounded-2xl border border-orange-100"
      >
        <div className="flex items-start gap-3">
          <SparklesIcon className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 italic">
              "L'éducation est le plus grand héritage qu'un parent puisse laisser à ses enfants."
            </p>
            <p className="text-xs text-gray-500 mt-1">— Proverbe africain</p>
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

export default ParentDashboardPage;