// src/pages/dashboard/enseignant/EnseignantDashboardPage.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/AuthContext';
import {
  // Pédagogie
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  // Carrière
  ClockIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  // Communication
  BellIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  // UI
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon,
  SparklesIcon,
  PlusIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  MapPinIcon,
  ChartBarIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
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

interface MesClasse {
  id: string;
  nom: string;
  matiere: string;
  eleves: number;
  heuresHebdo: number;
  moyenne: number;
  color: string;
}

interface CoursJour {
  id: string;
  heure: string;
  matiere: string;
  classe: string;
  salle: string;
  statut: 'a-venir' | 'en-cours' | 'termine';
  type: string;
}

interface ActiviteRecente {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: any;
  color: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const EnseignantDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('semaine');

  // ============================================
  // DONNÉES (à brancher sur API)
  // ============================================

  // --- KPIs Enseignant ---
  const stats: StatCard[] = [
    {
      title: 'Mes classes',
      value: '5',
      change: '+0',
      trend: 'up',
      icon: AcademicCapIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hint: '6ème A, 5ème B, 4ème C, 3ème D, 2nde A',
      href: '/dashboard/mes-classes',
    },
    {
      title: 'Mes élèves',
      value: '142',
      change: '+8',
      trend: 'up',
      icon: UserGroupIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hint: 'Total toutes classes confondues',
      href: '/dashboard/mes-classes',
    },
    {
      title: 'Notes à saisir',
      value: '24',
      change: '-6',
      trend: 'down',
      icon: PencilSquareIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hint: 'Devoirs + compositions du mois',
      href: '/dashboard/notes/saisie',
    },
    {
      title: 'Heures / semaine',
      value: '22h',
      change: '+2h',
      trend: 'up',
      icon: ClockIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hint: 'Contrat : 20h + 2h supp',
      href: '/dashboard/mon-emploi-temps',
    },
  ];

  // --- Moyennes de mes classes ---
  const moyennesClasses = [
    { classe: '6ème A', moyenne: 14.2, effectif: 32 },
    { classe: '5ème B', moyenne: 12.8, effectif: 28 },
    { classe: '4ème C', moyenne: 13.5, effectif: 30 },
    { classe: '3ème D', moyenne: 11.9, effectif: 26 },
    { classe: '2nde A', moyenne: 13.0, effectif: 26 },
  ];

  // --- Évolution moyennes sur l'année ---
  const evolutionMoyennes = [
    { mois: 'Sep', moyenne: 12.5 },
    { mois: 'Oct', moyenne: 13.1 },
    { mois: 'Nov', moyenne: 13.4 },
    { mois: 'Déc', moyenne: 13.0 },
    { mois: 'Jan', moyenne: 13.6 },
    { mois: 'Fév', moyenne: 13.9 },
  ];

  // --- Radar compétences pédagogiques ---
  const radarCompetences = [
    { competence: 'Assiduité', valeur: 92 },
    { competence: 'Pédagogie', valeur: 88 },
    { competence: 'Communication', valeur: 85 },
    { competence: 'Évaluation', valeur: 90 },
    { competence: 'Ponctualité', valeur: 95 },
    { competence: 'Discipline', valeur: 87 },
  ];

  // --- Mes classes détaillées ---
  const mesClasses: MesClasse[] = [
    { id: 'C1', nom: '6ème A', matiere: 'Mathématiques', eleves: 32, heuresHebdo: 5, moyenne: 14.2, color: 'bg-blue-500' },
    { id: 'C2', nom: '5ème B', matiere: 'Mathématiques', eleves: 28, heuresHebdo: 4, moyenne: 12.8, color: 'bg-emerald-500' },
    { id: 'C3', nom: '4ème C', matiere: 'Mathématiques', eleves: 30, heuresHebdo: 5, moyenne: 13.5, color: 'bg-purple-500' },
    { id: 'C4', nom: '3ème D', matiere: 'Mathématiques', eleves: 26, heuresHebdo: 4, moyenne: 11.9, color: 'bg-orange-500' },
    { id: 'C5', nom: '2nde A', matiere: 'Mathématiques', eleves: 26, heuresHebdo: 4, moyenne: 13.0, color: 'bg-indigo-500' },
  ];

  // --- Cours du jour ---
  const coursJour: CoursJour[] = [
    { id: 'CR1', heure: '08:00 - 09:00', matiere: 'Mathématiques', classe: '6ème A', salle: 'Salle 12', statut: 'termine', type: 'Cours' },
    { id: 'CR2', heure: '09:00 - 10:00', matiere: 'Mathématiques', classe: '5ème B', salle: 'Salle 08', statut: 'termine', type: 'Cours' },
    { id: 'CR3', heure: '10:15 - 11:15', matiere: 'Mathématiques', classe: '4ème C', salle: 'Salle 15', statut: 'en-cours', type: 'Cours' },
    { id: 'CR4', heure: '14:00 - 15:00', matiere: 'Mathématiques', classe: '3ème D', salle: 'Salle 21', statut: 'a-venir', type: 'Devoir surveillé' },
    { id: 'CR5', heure: '15:15 - 16:15', matiere: 'Mathématiques', classe: '2nde A', salle: 'Salle 05', statut: 'a-venir', type: 'Cours' },
  ];

  // --- Répartition notes (camembert) ---
  const repartitionNotes = [
    { name: 'Notes saisies', value: 186, color: '#10B981' },
    { name: 'En attente', value: 24, color: '#F59E0B' },
    { name: 'Validées', value: 162, color: '#3B82F6' },
  ];

  // --- Mes heures supp ---
  const heuresSupp = [
    { id: 'HS1', date: '15 Déc', heures: 2, motif: 'Remplacement M. Diallo', statut: 'APPROUVEE' },
    { id: 'HS2', date: '12 Déc', heures: 1.5, motif: 'Soutien scolaire', statut: 'APPROUVEE' },
    { id: 'HS3', date: '10 Déc', heures: 2, motif: 'Conseil de classe', statut: 'SOUMISE' },
    { id: 'HS4', date: '08 Déc', heures: 3, motif: 'Surveillance examen', statut: 'APPROUVEE' },
  ];

  // --- Mes absences ---
  const mesAbsences = [
    { id: 'AB1', date: '05 Déc', duree: '1 jour', motif: 'Maladie', statut: 'APPROUVEE' },
    { id: 'AB2', date: '28 Nov', duree: '2 jours', motif: 'Congé personnel', statut: 'APPROUVEE' },
    { id: 'AB3', date: '20 Nov', duree: '0.5 jour', motif: 'Rendez-vous médical', statut: 'APPROUVEE' },
  ];

  // --- Ma paie récente ---
  const paieRecente = [
    { mois: 'Déc', net: 385000, statut: 'PAYEE' },
    { mois: 'Nov', net: 378000, statut: 'PAYEE' },
    { mois: 'Oct', net: 385000, statut: 'PAYEE' },
    { mois: 'Sep', net: 350000, statut: 'PAYEE' },
  ];

  // --- Activités récentes ---
  const activites: ActiviteRecente[] = [
    { id: 1, title: 'Notes saisies', description: 'Devoir Mathématiques - 6ème A (32 élèves)', time: 'Il y a 20 min', icon: PencilSquareIcon, color: 'text-blue-600' },
    { id: 2, title: 'Heures supp. approuvées', description: '2h - Remplacement M. Diallo', time: 'Il y a 2h', icon: CheckCircleIcon, color: 'text-emerald-600' },
    { id: 3, title: 'Bulletin généré', description: 'Trimestre 1 - 5ème B', time: 'Il y a 5h', icon: DocumentTextIcon, color: 'text-purple-600' },
    { id: 4, title: 'Absence approuvée', description: '1 jour - Maladie (05 Déc)', time: 'Hier', icon: CheckCircleIcon, color: 'text-emerald-600' },
    { id: 5, title: 'Réclamation fermée', description: 'Sujet : Problème salle informatique', time: 'Il y a 2 jours', icon: ChatBubbleLeftRightIcon, color: 'text-orange-600' },
  ];

  // --- Alertes Enseignant ---
  const alertes = [
    { id: 1, type: 'warning', title: '24 notes à saisir', desc: 'Avant vendredi 20 Déc', href: '/dashboard/notes/saisie' },
    { id: 2, type: 'info', title: 'Conseil de classe', desc: '3ème D - Demain 10h', href: '/dashboard/mon-emploi-temps' },
    { id: 3, type: 'success', title: 'Heures supp. approuvées', desc: '+2h ce mois (375 000 FCFA)', href: '/dashboard/mes-heures-supp' },
  ];

  // ============================================
  // HELPERS
  // ============================================
  const statutCoursConfig = {
    'termine': { bg: 'bg-gray-50', border: 'border-gray-100', badge: 'bg-gray-400', text: 'text-gray-500', label: 'Terminé' },
    'en-cours': { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-500', text: 'text-emerald-700', label: 'En cours' },
    'a-venir': { bg: 'bg-blue-50', border: 'border-blue-100', badge: 'bg-blue-500', text: 'text-blue-700', label: 'À venir' },
  };

  const statutPaieConfig: Record<string, { bg: string; text: string; label: string }> = {
    PAYEE: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Payée' },
    APPROUVEE: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Approuvée' },
    SOUMISE: { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Soumise' },
    BROUILLON: { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Brouillon' },
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
        className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-100 text-xs font-medium mb-1">
              <AcademicCapIcon className="w-4 h-4" />
              ESPACE ENSEIGNANT
            </div>
            <h2 className="text-xl font-bold">
              Bonjour M. {user?.prenom} 👋
            </h2>
            <p className="text-sm text-indigo-100 mt-1">
              Vous avez <strong className="text-white">5 cours</strong> aujourd'hui •{' '}
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/notes/saisie"
              className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Saisir des notes
            </Link>
            <Link
              to="/dashboard/mon-emploi-temps"
              className="px-4 py-2 bg-white text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Mon emploi du temps
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
          ALERTES ENSEIGNANT
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
            Mes rappels
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
          LIGNE : Cours du jour + Actions rapides
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cours du jour */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Mes cours aujourd'hui</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {coursJour.filter((c) => c.statut === 'termine').length} terminés •{' '}
                {coursJour.filter((c) => c.statut === 'en-cours').length} en cours •{' '}
                {coursJour.filter((c) => c.statut === 'a-venir').length} à venir
              </p>
            </div>
            <Link to="/dashboard/mon-emploi-temps" className="text-sm text-blue-600 font-medium hover:underline">
              Voir l'emploi du temps
            </Link>
          </div>

          <div className="space-y-3">
            {coursJour.map((cours, index) => {
              const config = statutCoursConfig[cours.statut];
              const Icon = cours.statut === 'en-cours' ? PlayCircleIcon : CalendarIcon;

              return (
                <motion.div
                  key={cours.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Link
                    to={`/dashboard/mes-classes/${cours.classe}`}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${config.border} ${config.bg} hover:shadow-sm transition-all group`}
                  >
                    <div className={`w-2 h-12 rounded-full ${config.badge} flex-shrink-0`} />

                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white border border-gray-100 flex-shrink-0">
                      <Icon className={`w-6 h-6 ${config.text}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">{cours.heure}</p>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-gray-400">• {cours.type}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        {cours.matiere} • <span className="text-blue-600">{cours.classe}</span>
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <MapPinIcon className="w-3 h-3" />
                        {cours.salle}
                      </div>
                    </div>

                    <ChevronRightIcon className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions rapides Enseignant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Actions rapides</h3>
            <span className="text-xs text-gray-400">Raccourcis</span>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Saisir des notes', icon: PencilSquareIcon, bg: 'bg-linear-to-br from-blue-500 to-blue-600', href: '/dashboard/notes/saisie' },
              { title: 'Marquer présences', icon: ClipboardDocumentCheckIcon, bg: 'bg-linear-to-br from-emerald-500 to-emerald-600', href: '/dashboard/presences-eleves' },
              { title: 'Ajouter appréciation', icon: ChatBubbleLeftRightIcon, bg: 'bg-linear-to-br from-purple-500 to-purple-600', href: '/dashboard/appreciations' },
              { title: 'Demander heures supp.', icon: PlusIcon, bg: 'bg-linear-to-br from-orange-500 to-orange-600', href: '/dashboard/mes-heures-supp/nouveau' },
              { title: 'Poser une absence', icon: CalendarIcon, bg: 'bg-linear-to-br from-red-500 to-red-600', href: '/dashboard/mes-absences/nouveau' },
            ].map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <Link
                  to={action.href}
                  className={`${action.bg} rounded-xl p-3 flex items-center gap-3 shadow-md hover:shadow-lg transition-all text-white`}
                >
                  <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold flex-1">{action.title}</span>
                  <ChevronRightIcon className="w-4 h-4 opacity-70" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============================================
          GRAPHIQUE : Évolution moyennes classes
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-900">Évolution des moyennes de mes classes</h3>
            <p className="text-xs text-gray-500 mt-0.5">Sur l'année scolaire en cours</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
          </select>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolutionMoyennes} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMoyenne" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis domain={[10, 16]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                formatter={(v) => `${Number(v).toFixed(1)}/20`}
              />
              <Area type="monotone" dataKey="moyenne" stroke="#8B5CF6" strokeWidth={3} fill="url(#colorMoyenne)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ============================================
          LIGNE : Radar compétences + Répartition notes
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar compétences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Mes compétences pédagogiques</h3>
              <p className="text-xs text-gray-500 mt-0.5">Évaluation trimestrielle</p>
            </div>
            <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-full font-bold">
              89% moyen
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarCompetences}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="competence" tick={{ fontSize: 11, fill: '#64748B' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Radar name="Score" dataKey="valeur" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} strokeWidth={2} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(v) => `${v}%`}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Répartition notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">État de mes notes</h3>
              <p className="text-xs text-gray-500 mt-0.5">Trimestre 1 en cours</p>
            </div>
            <span className="text-xs text-gray-400">Total : 372 notes</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={repartitionNotes}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {repartitionNotes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {repartitionNotes.map((item) => (
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
      </div>

      {/* ============================================
          MES CLASSES (cartes)
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Mes classes</h3>
          </div>
          <Link to="/dashboard/mes-classes" className="text-sm text-blue-600 font-medium hover:underline">
            Voir toutes mes classes
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {mesClasses.map((classe, index) => (
            <motion.div
              key={classe.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={`/dashboard/mes-classes/${classe.id}`}
                className="block bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${classe.color.replace('bg-', 'bg-').replace('500', '50')}`}>
                    <BookOpenIcon className={`w-5 h-5 ${classe.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="text-xs text-gray-400">{classe.heuresHebdo}h/sem</span>
                </div>

                <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {classe.nom}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">{classe.matiere}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <UserGroupIcon className="w-3.5 h-3.5" />
                    {classe.eleves} élèves
                  </div>
                  <span className={`text-sm font-bold ${
                    classe.moyenne >= 14 ? 'text-emerald-600' :
                    classe.moyenne >= 12 ? 'text-blue-600' :
                    classe.moyenne >= 10 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {classe.moyenne.toFixed(1)}/20
                  </span>
                </div>

                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    className={`h-full ${classe.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(classe.moyenne / 20) * 100}%` }}
                    transition={{ duration: 1, delay: 0.8 + index * 0.05 }}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ============================================
          LIGNE : Moyennes classes + Mes heures supp
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Moyennes par classe (barres) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Moyennes par classe</h3>
              <p className="text-xs text-gray-500 mt-0.5">Moyenne générale : 13.1/20</p>
            </div>
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moyennesClasses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="classe" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(v) => `${Number(v).toFixed(1)}/20`}
                />
                <Bar dataKey="moyenne" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Mes heures supp */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-gray-900">Mes heures supplémentaires</h3>
            </div>
            <Link to="/dashboard/mes-heures-supp" className="text-sm text-blue-600 font-medium hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="mb-4 p-4 bg-linear-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-700 font-medium">Total ce mois</p>
                <p className="text-2xl font-bold text-orange-900">8.5h</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-orange-700 font-medium">Montant estimé</p>
                <p className="text-lg font-bold text-orange-900">375 000 FCFA</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {heuresSupp.map((hs, index) => {
              const config = statutPaieConfig[hs.statut];
              return (
                <motion.div
                  key={hs.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-orange-600">{hs.heures}h</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{hs.motif}</p>
                    <p className="text-xs text-gray-500">{hs.date}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${config.bg} ${config.text}`}>
                    {config.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ============================================
          LIGNE : Ma paie + Mes absences
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ma paie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BanknotesIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900">Ma paie récente</h3>
            </div>
            <Link to="/dashboard/ma-paie" className="text-sm text-blue-600 font-medium hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="mb-4 p-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-700 font-medium">Net à percevoir (Déc)</p>
                <p className="text-2xl font-bold text-emerald-900">385 000 FCFA</p>
              </div>
              <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
            </div>
          </div>

          <div className="space-y-2">
            {paieRecente.map((p, index) => (
              <motion.div
                key={p.mois}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-emerald-600">{p.mois}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Salaire net</p>
                  <p className="text-xs text-gray-500">Virement bancaire</p>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {p.net.toLocaleString('fr-FR')} FCFA
                </span>
                <span className="text-xs px-2 py-1 rounded-full font-bold bg-emerald-50 text-emerald-600">
                  Payée
                </span>
                <button className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DocumentTextIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mes absences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-gray-900">Mes absences</h3>
            </div>
            <Link to="/dashboard/mes-absences" className="text-xs text-blue-600 font-medium hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="space-y-2">
            {mesAbsences.map((ab, index) => (
              <motion.div
                key={ab.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-red-600">{ab.duree}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{ab.motif}</p>
                  <p className="text-[10px] text-gray-500">{ab.date}</p>
                </div>
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              </motion.div>
            ))}
          </div>

          <Link
            to="/dashboard/mes-absences/nouveau"
            className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Poser une absence
          </Link>
        </motion.div>
      </div>

      {/* ============================================
          ACTIVITÉS RÉCENTES
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900">Activités récentes</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Voir tout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activites.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 + index * 0.05 }}
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

      {/* ============================================
          RACCOURCIS ENSEIGNANT
          ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Mes classes', desc: 'Voir mes 5 classes', icon: AcademicCapIcon, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/mes-classes' },
          { title: 'Mes présences', desc: 'Historique de présence', icon: ClockIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/dashboard/mes-presences' },
          { title: 'Mes avances', desc: 'Demander une avance', icon: CurrencyDollarIcon, color: 'text-purple-600', bg: 'bg-purple-50', href: '/dashboard/mes-avances' },
          { title: 'Mes réclamations', desc: 'Signaler un problème', icon: ChatBubbleOvalLeftEllipsisIcon, color: 'text-orange-600', bg: 'bg-orange-50', href: '/dashboard/mes-reclamations' },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 + index * 0.05 }}
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
        transition={{ delay: 1.5 }}
        className="p-5 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-purple-100"
      >
        <div className="flex items-start gap-3">
          <SparklesIcon className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 italic">
              "Un enseignant est celui qui aide à découvrir, pas celui qui dicte."
            </p>
            <p className="text-xs text-gray-500 mt-1">— Proverbe pédagogique</p>
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

export default EnseignantDashboardPage;