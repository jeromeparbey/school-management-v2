// frontend2/src/pages/dashboard/eleve/EleveDashboardPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/AuthContext';
import {
  // Icônes principales
  BookOpenIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  FolderOpenIcon,
  FlagIcon,
  ArchiveBoxIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  SparklesIcon,
  EllipsisVerticalIcon,
  ArrowRightIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  LightBulbIcon,
  PencilSquareIcon,
  LifebuoyIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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

interface CoursJour {
  id: string;
  heure: string;
  matiere: string;
  salle: string;
  prof: string;
  couleur: string;
  statut: 'TERMINE' | 'EN_COURS' | 'A_VENIR';
}

interface Devoir {
  id: string;
  matiere: string;
  titre: string;
  dateLimite: string;
  urgence: 'HAUTE' | 'MOYENNE' | 'BASSE';
}

interface NoteRecente {
  id: string;
  matiere: string;
  note: number;
  bareme: number;
  coefficient: number;
  date: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const EleveDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // ============================================
  // DONNÉES STATIQUES (à brancher sur API)
  // ============================================

  // --- KPIs Élève ---
  const stats: StatCard[] = [
    {
      title: 'Moyenne générale',
      value: '14.8/20',
      change: '+0.5',
      trend: 'up',
      icon: AcademicCapIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hint: 'Trimestre en cours',
    },
    {
      title: 'Rang dans la classe',
      value: '5ème',
      change: '+2',
      trend: 'up',
      icon: TrophyIcon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      hint: 'Sur 32 élèves',
    },
    {
      title: 'Taux de présence',
      value: '96%',
      change: '+1%',
      trend: 'up',
      icon: ClockIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hint: 'Ce trimestre',
    },
    {
      title: 'Devoirs à rendre',
      value: '3',
      change: '-2',
      trend: 'down',
      icon: FolderOpenIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hint: 'Cette semaine',
    },
  ];

  // --- Évolution des moyennes par matière (5 dernières évaluations) ---
  const evolutionMoyennes = [
    { eval: 'Eval 1', maths: 14, francais: 13, histoire: 15 },
    { eval: 'Eval 2', maths: 15, francais: 14, histoire: 14 },
    { eval: 'Eval 3', maths: 13, francais: 15, histoire: 16 },
    { eval: 'Eval 4', maths: 16, francais: 14, histoire: 15 },
    { eval: 'Eval 5', maths: 15, francais: 15, histoire: 15 },
  ];

  // --- Moyennes par matière (barres) ---
  const moyennesMatieres = [
    { matiere: 'Maths', moyenne: 15 },
    { matiere: 'Français', moyenne: 14 },
    { matiere: 'Histoire', moyenne: 15 },
    { matiere: 'Anglais', moyenne: 16 },
    { matiere: 'SVT', moyenne: 13 },
    { matiere: 'Physique', moyenne: 14 },
  ];

  // --- Emploi du temps du jour ---
  const coursJour: CoursJour[] = [
    {
      id: 'C1',
      heure: '08:00',
      matiere: 'Mathématiques',
      salle: 'A12',
      prof: 'M. Diallo',
      couleur: 'bg-blue-500',
      statut: 'TERMINE',
    },
    {
      id: 'C2',
      heure: '10:00',
      matiere: 'Français',
      salle: 'B05',
      prof: 'Mme Martin',
      couleur: 'bg-purple-500',
      statut: 'EN_COURS',
    },
    {
      id: 'C3',
      heure: '14:00',
      matiere: 'Histoire-Géo',
      salle: 'C08',
      prof: 'M. Kouassi',
      couleur: 'bg-amber-500',
      statut: 'A_VENIR',
    },
    {
      id: 'C4',
      heure: '16:00',
      matiere: 'Anglais',
      salle: 'A03',
      prof: 'Mme Johnson',
      couleur: 'bg-emerald-500',
      statut: 'A_VENIR',
    },
  ];

  // --- Devoirs à rendre ---
  const devoirsARendre: Devoir[] = [
    {
      id: 'D1',
      matiere: 'Mathématiques',
      titre: 'Exercices 12 à 15 page 45',
      dateLimite: 'Demain',
      urgence: 'HAUTE',
    },
    {
      id: 'D2',
      matiere: 'Français',
      titre: 'Dissertation sur la poésie',
      dateLimite: 'Vendredi',
      urgence: 'MOYENNE',
    },
    {
      id: 'D3',
      matiere: 'Histoire',
      titre: 'Fiche de lecture - Chapitre 3',
      dateLimite: 'Lundi',
      urgence: 'BASSE',
    },
  ];

  // --- Dernières notes ---
  const notesRecentes: NoteRecente[] = [
    { id: 'N1', matiere: 'Mathématiques', note: 16, bareme: 20, coefficient: 3, date: 'Il y a 3j' },
    { id: 'N2', matiere: 'Français', note: 14, bareme: 20, coefficient: 2, date: 'Il y a 5j' },
    { id: 'N3', matiere: 'Anglais', note: 15.5, bareme: 20, coefficient: 2, date: 'Il y a 1 sem' },
    { id: 'N4', matiere: 'Histoire', note: 15, bareme: 20, coefficient: 2, date: 'Il y a 1 sem' },
  ];

  // --- Objectifs personnels ---
  const objectifs = [
    { id: 'O1', titre: 'Moyenne 15/20 en Maths', progression: 80, statut: 'ACTIF' },
    { id: 'O2', titre: 'Lire 5 livres ce trimestre', progression: 60, statut: 'ACTIF' },
    { id: 'O3', titre: 'Assiduité 100%', progression: 96, statut: 'ACTIF' },
  ];

  // --- Alertes élève ---
  const alertes = [
    {
      id: 1,
      type: 'warning',
      title: 'Contrôle de Maths vendredi',
      desc: 'Chapitre 5 - Révisions conseillées',
      href: '/dashboard/mes-notes',
    },
    {
      id: 2,
      type: 'danger',
      title: 'Bulletin T1 disponible',
      desc: 'À consulter et signer par les parents',
      href: '/dashboard/mes-bulletins',
    },
    {
      id: 3,
      type: 'info',
      title: 'Nouveau communiqué',
      desc: 'Sortie pédagogique le 20 janvier',
      href: '/dashboard/communiques',
    },
    {
      id: 4,
      type: 'success',
      title: 'Note d\'Anglais reçue',
      desc: '15.5/20 - Félicitations !',
      href: '/dashboard/mes-notes',
    },
  ];

  // --- Actions rapides ---
  const quickActions = [
    {
      title: 'Mes notes',
      icon: DocumentTextIcon,
      bgColor: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      href: '/dashboard/mes-notes',
    },
    {
      title: 'Mes bulletins',
      icon: AcademicCapIcon,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      href: '/dashboard/mes-bulletins',
    },
    {
      title: 'Bibliothèque',
      icon: BookOpenIcon,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      href: '/dashboard/bibliotheque',
    },
    {
      title: 'Mes objectifs',
      icon: FlagIcon,
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
      href: '/dashboard/mes-objectifs',
    },
  ];

  // --- Activités récentes ---
  const activitesRecentes = [
    {
      id: 1,
      titre: 'Nouvelle note en Maths',
      desc: '16/20 - Devoir surveillé',
      time: 'Il y a 3h',
      icon: DocumentTextIcon,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      id: 2,
      titre: 'Devoir assigné',
      desc: 'Français - Dissertation à rendre vendredi',
      time: 'Il y a 5h',
      icon: FolderOpenIcon,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      id: 3,
      titre: 'Nouveau communiqué',
      desc: 'Sortie pédagogique - 20 janvier',
      time: 'Il y a 1j',
      icon: MegaphoneIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 4,
      titre: 'Emprunt bibliothèque',
      desc: 'Le Petit Prince - À rendre le 15/01',
      time: 'Il y a 2j',
      icon: ArchiveBoxIcon,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      id: 5,
      titre: 'Badge obtenu',
      desc: 'Assiduité exemplaire - Novembre',
      time: 'Il y a 3j',
      icon: TrophyIcon,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  // --- Événements à venir ---
  const evenementsAVenir = [
    { titre: 'Contrôle de Maths', date: 'Vendredi, 08:00', type: 'Examen', color: 'bg-indigo-500' },
    { titre: 'Sortie pédagogique', date: 'Lundi 20/01, 09:00', type: 'Sortie', color: 'bg-emerald-500' },
    { titre: 'Conseil de classe', date: 'Vendredi 24/01, 16:00', type: 'Réunion', color: 'bg-purple-500' },
  ];

  // ============================================
  // HELPERS
  // ============================================
  const getNoteColor = (note: number, bareme: number) => {
    const pourcentage = (note / bareme) * 100;
    if (pourcentage >= 75) return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
    if (pourcentage >= 50) return { bg: 'bg-blue-50', text: 'text-blue-600' };
    return { bg: 'bg-red-50', text: 'text-red-600' };
  };

  const getUrgenceColor = (urgence: string) => {
    switch (urgence) {
      case 'HAUTE':
        return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' };
      case 'MOYENNE':
        return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' };
      case 'BASSE':
        return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' };
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
        className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">
              Salut {user?.prenom} ! 👋
            </h2>
            <p className="text-sm text-blue-100 mt-1">
              Prêt pour une nouvelle journée ? Voici ton aperçu •{' '}
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
              to="/dashboard/mon-emploi-temps"
              className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Emploi du temps
            </Link>
            <Link
              to="/dashboard/mes-notes"
              className="px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              <DocumentTextIcon className="w-4 h-4" />
              Mes notes
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
          EMPLOI DU JOUR + DEVOIRS À RENDRE
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cours du jour */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-gray-900">Mes cours aujourd'hui</h3>
                <p className="text-xs text-gray-500 mt-0.5">4 cours programmés</p>
              </div>
            </div>
            <Link
              to="/dashboard/mon-emploi-temps"
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Voir tout
            </Link>
          </div>

          <div className="space-y-3">
            {coursJour.map((cours, index) => (
              <motion.div
                key={cours.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                  cours.statut === 'EN_COURS'
                    ? 'border-indigo-300 bg-indigo-50'
                    : cours.statut === 'TERMINE'
                    ? 'border-gray-100 bg-gray-50 opacity-60'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className={`w-1 h-12 ${cours.couleur} rounded-full`} />
                <div className="w-16 text-center">
                  <span className="text-sm font-bold text-gray-900">{cours.heure}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    {cours.matiere}
                    {cours.statut === 'EN_COURS' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                        En cours
                      </span>
                    )}
                    {cours.statut === 'TERMINE' && (
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Salle {cours.salle} • {cours.prof}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Devoirs à rendre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FolderOpenIcon className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="font-bold text-gray-900">Devoirs à rendre</h3>
                <p className="text-xs text-gray-500 mt-0.5">{devoirsARendre.length} devoirs en attente</p>
              </div>
            </div>
            <Link
              to="/dashboard/mes-devoirs"
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Voir tout
            </Link>
          </div>

          <div className="space-y-3">
            {devoirsARendre.map((devoir, index) => {
              const colors = getUrgenceColor(devoir.urgence);
              return (
                <motion.div
                  key={devoir.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={`flex items-center justify-between p-3 border rounded-xl ${colors.border} ${colors.bg}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{devoir.matiere}</p>
                    <p className="text-xs text-gray-600 truncate">{devoir.titre}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${colors.bg} ${colors.text} whitespace-nowrap`}
                    >
                      {devoir.dateLimite}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Citation motivation */}
          <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100/50">
            <div className="flex items-start gap-3">
              <LightBulbIcon className="w-5 h-5 text-indigo-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Astuce du jour
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Commence par le devoir le plus urgent pour ne pas accumuler de stress.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============================================
          GRAPHIQUES : Évolution + Moyennes par matière
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Évolution de mes notes</h3>
              <p className="text-xs text-gray-500 mt-0.5">5 dernières évaluations</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                Maths
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                Français
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                Histoire
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionMoyennes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="eval"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                />
                <YAxis
                  domain={[10, 20]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(v) => `${Number(v)}/20`}
                />
                <Line
                  type="monotone"
                  dataKey="maths"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#6366F1' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="francais"
                  stroke="#A855F7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#A855F7' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="histoire"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#F59E0B' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Moyennes par matière */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Mes moyennes par matière</h3>
              <p className="text-xs text-gray-500 mt-0.5">Trimestre en cours</p>
            </div>
            <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full font-bold">
              +0.5 vs T2
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moyennesMatieres}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="matiere"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                />
                <YAxis
                  domain={[0, 20]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(v) => `${Number(v)}/20`}
                />
                <Bar dataKey="moyenne" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ============================================
          DERNIÈRES NOTES + OBJECTIFS
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dernières notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-gray-900">Mes dernières notes</h3>
            </div>
            <Link
              to="/dashboard/mes-notes"
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Voir toutes
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Matière
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Coeff
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notesRecentes.map((note) => {
                  const colors = getNoteColor(note.note, note.bareme);
                  return (
                    <tr key={note.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {note.matiere}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${colors.bg} ${colors.text}`}
                        >
                          {note.note}/{note.bareme}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        ×{note.coefficient}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 text-right">
                        {note.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Objectifs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center gap-2 mb-6">
            <FlagIcon className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-gray-900">Mes objectifs</h3>
          </div>
          <div className="space-y-5">
            {objectifs.map((obj, index) => (
              <motion.div
                key={obj.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {obj.titre}
                  </span>
                  <span className="text-xs font-bold text-gray-900">{obj.progression}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${obj.progression}%` }}
                    transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <Link
            to="/dashboard/mes-objectifs"
            className="mt-6 block text-center text-sm text-orange-600 font-medium hover:underline"
          >
            Gérer mes objectifs →
          </Link>
        </motion.div>
      </div>

      {/* ============================================
          ALERTES
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <BellIcon className="w-5 h-5 text-indigo-500" />
            Mes notifications
          </h3>
          <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full font-bold">
            {alertes.length} nouvelles
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
                transition={{ delay: 0.8 + index * 0.05 }}
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
          <h2 className="text-lg font-bold text-gray-900">Mes raccourcis</h2>
          <span className="text-xs text-gray-400">Accès rapide</span>
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
          ACTIVITÉS + ÉVÉNEMENTS
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activités récentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Activités récentes</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Voir tout
            </button>
          </div>
          <div className="space-y-3">
            {activitesRecentes.map((activite, index) => (
              <motion.div
                key={activite.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
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

        {/* Événements à venir */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">À venir</h3>
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
              {evenementsAVenir.length} événements
            </span>
          </div>

          <div className="space-y-4">
            {evenementsAVenir.map((event, index) => (
              <motion.div
                key={event.titre}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + index * 0.1 }}
                className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-2 h-12 ${event.color} rounded-full flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{event.titre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{event.date}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {event.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============================================
          RACCOURCIS ÉLÈVE
          ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Mon profil',
            desc: 'Informations personnelles',
            icon: UserCircleIcon,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            href: '/dashboard/mon-profil',
          },
          {
            title: 'Mes corrections',
            desc: 'Devoirs corrigés',
            icon: PencilSquareIcon,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            href: '/dashboard/mes-corrections',
          },
          {
            title: 'Mes appréciations',
            desc: 'Commentaires des profs',
            icon: ClipboardDocumentListIcon,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            href: '/dashboard/mes-appreciations',
          },
          {
            title: 'Support & FAQ',
            desc: 'Besoin d\'aide ?',
            icon: LifebuoyIcon,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            href: '/dashboard/support',
          },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 + index * 0.05 }}
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
          CITATION / MOTIVATION
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100/50"
      >
        <div className="flex items-start gap-3">
          <SparklesIcon className="w-6 h-6 text-indigo-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              "Le succès, c'est la somme de petits efforts répétés jour après jour."
            </p>
            <p className="text-xs text-gray-500 mt-1">— Robert Collier</p>
          </div>
        </div>
      </motion.div>

      {/* ============================================
          PIED DE PAGE
          ============================================ */}
      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-200">
        <p>© 2024 EduManage. Tous droits réservés.</p>
        <p className="mt-1">
          Espace Élève • Version 1.0.0 • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default EleveDashboardPage;