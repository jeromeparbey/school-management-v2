// frontend2/src/pages/dashboard/DashboardPage.tsx

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/AuthContext';
import {
  UserGroupIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  MapPinIcon,
  PencilSquareIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

import {
  ResponsiveContainer,
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

// ─── HOOKS RÉELS ───
import { useEleves } from '../../hooks/useEleves';
import { useEnseignants } from '../../hooks/useEnseignants';
import { usePaiements } from '../../hooks/usePaiements';
import { useEcheances } from '../../hooks/useEcheance';
import { useClasses } from '../../hooks/useClasses';
import { useMatieres } from '../../hooks/useMatieres';
import { useInscriptions } from '../../hooks/useInscriptions';

// ═══════════════════════════════════════════════════════════
// HELPERS — F CFA partout
// ═══════════════════════════════════════════════════════════

/**
 * 💰 Formate un montant en F CFA.
 * - Si devise = 'XOF', 'FCFA', 'F CFA' → affiche 'F CFA'
 * - Sinon → affiche la devise fournie
 */
const formatMoney = (n: number | null | undefined, devise = 'F CFA') => {
  const amount = n == null ? 0 : Math.round(n);
  const formatted = new Intl.NumberFormat('fr-FR').format(amount);

  // ⚠️ Normalisation : XOF → F CFA
  const normalizedDevise =
    !devise || devise === 'XOF' || devise === 'FCFA'
      ? 'F CFA'
      : devise;

  return `${formatted} ${normalizedDevise}`;
};

/**
 * 🔢 Formate un nombre (séparateurs de milliers).
 */
const formatNumber = (n: number | null | undefined) => {
  if (n == null) return '0';
  return new Intl.NumberFormat('fr-FR').format(n);
};

/**
 * 📅 Formate une date courte (ex: "12 jan").
 */
const formatDateShort = (d: string | Date | null | undefined) => {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });
};

// ═══════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════

const DashboardPage: React.FC = () => {
  const { user, etablissement } = useAuth();

  // ✅ Devise normalisée : si 'XOF' → 'F CFA'
  const devise =
    !etablissement?.devise ||
    etablissement.devise === 'XOF' ||
    etablissement.devise === 'FCFA'
      ? 'F CFA'
      : etablissement.devise;

  // ═══════════════════════════════════════════════════════════
  // CHARGEMENT DES DONNÉES RÉELLES
  // ═══════════════════════════════════════════════════════════

  // Élèves
  const { data: elevesData, isLoading: loadingEleves } = useEleves({
    limit: 1,
    statut: 'ACTIF',
  });
  const totalEleves = elevesData?.pagination?.total ?? 0;

  // Enseignants
  const { data: enseignantsData, isLoading: loadingEnseignants } =
    useEnseignants({ limit: 1, estActif: true, estArchive: false });
  const totalEnseignants = enseignantsData?.pagination?.total ?? 0;

  // Classes
  const { data: classesData, isLoading: loadingClasses } = useClasses({
    limit: 1,
    estActive: true,
    estArchive: false,
  });
  const totalClasses = classesData?.pagination?.total ?? 0;

  // Matières
  const { data: matieresData } = useMatieres({
    limit: 1,
    estActive: true,
    estArchive: false,
  });
  const totalMatieres = matieresData?.pagination?.total ?? 0;

  // Paiements (50 derniers)
  const { data: paiementsData, isLoading: loadingPaiements } = usePaiements({
    limit: 50,
    sortBy: 'datePaiement',
    sortOrder: 'desc',
  });
  const paiements = paiementsData?.paiements ?? [];
  const totalEncaisse = paiementsData?.summary?.totalMontant ?? 0;

  // Échéances
  const { data: echeancesData, isLoading: loadingEcheances } = useEcheances({
    limit: 50,
    sortBy: 'dateLimite',
    sortOrder: 'asc',
  });
  const echeances = echeancesData?.echeances ?? [];

  // Inscriptions récentes
  const { data: inscriptionsData } = useInscriptions({
    limit: 5,
    estActive: true,
    sortBy: 'dateInscription',
    sortOrder: 'desc',
  });
  const inscriptionsRecentes = inscriptionsData?.inscriptions ?? [];

  // ═══════════════════════════════════════════════════════════
  // CALCULS DÉRIVÉS
  // ═══════════════════════════════════════════════════════════

  // Échéances en retard
  const echeancesEnRetard = useMemo(() => {
    const now = new Date();
    return echeances.filter(
      (e) => !e.estPayee && new Date(e.dateLimite) < now
    );
  }, [echeances]);

  // Échéances à venir (7 jours)
  const echeancesProches = useMemo(() => {
    const now = new Date();
    const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return echeances.filter((e) => {
      const dl = new Date(e.dateLimite);
      return !e.estPayee && dl >= now && dl <= in7d;
    });
  }, [echeances]);

  // Évolution sur 12 mois
  const revenueData = useMemo(() => {
    const months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
    ];
    const buckets: Record<number, number> = {};
    for (let i = 0; i < 12; i++) buckets[i] = 0;

    paiements
      .filter((p) => p.statut === 'COMPLET')
      .forEach((p) => {
        const d = new Date(p.datePaiement);
        if (d.getFullYear() === new Date().getFullYear()) {
          buckets[d.getMonth()] += p.montant;
        }
      });

    return months.map((mois, i) => ({
      mois,
      revenus: buckets[i],
    }));
  }, [paiements]);

  // Répartition paiements par moyen
  const paymentSplit = useMemo(() => {
    const counts: Record<string, number> = {};
    paiements
      .filter((p) => p.statut === 'COMPLET')
      .forEach((p) => {
        counts[p.moyen] = (counts[p.moyen] ?? 0) + p.montant;
      });

    const colors: Record<string, string> = {
      ESPECES: '#3B82F6',
      MOBILE_MONEY: '#8B5CF6',
      VIREMENT: '#10B981',
      CARTE: '#F59E0B',
      CHEQUE: '#EF4444',
      AUTRE: '#6B7280',
    };

    return Object.entries(counts).map(([moyen, value]) => ({
      name: moyen.replace('_', ' '),
      value,
      color: colors[moyen] ?? '#6B7280',
    }));
  }, [paiements]);

  const derniersPaiements = useMemo(() => paiements.slice(0, 5), [paiements]);

  // Alertes dynamiques
  const alertes = useMemo(() => {
    const items: Array<{
      id: number;
      type: 'warning' | 'danger' | 'info' | 'success';
      title: string;
      desc: string;
      href: string;
    }> = [];

    if (echeancesEnRetard.length > 0) {
      items.push({
        id: 1,
        type: 'danger',
        title: `${echeancesEnRetard.length} échéance(s) en retard`,
        desc: `Montant total : ${formatMoney(
          echeancesEnRetard.reduce((s, e) => s + e.montant, 0),
          devise
        )}`,
        href: '/dashboard/echeances',
      });
    }

    if (echeancesProches.length > 0) {
      items.push({
        id: 2,
        type: 'warning',
        title: `${echeancesProches.length} échéance(s) cette semaine`,
        desc: 'À encaisser dans les 7 prochains jours',
        href: '/dashboard/echeances',
      });
    }

    if (inscriptionsRecentes.length > 0) {
      items.push({
        id: 3,
        type: 'info',
        title: `${inscriptionsRecentes.length} nouvelle(s) inscription(s)`,
        desc: 'Récemment ajoutées au système',
        href: '/dashboard/inscriptions',
      });
    }

    if (items.length === 0) {
      items.push({
        id: 0,
        type: 'success',
        title: 'Tout est à jour',
        desc: 'Aucune alerte pour le moment',
        href: '/dashboard/statistiques',
      });
    }

    return items;
  }, [echeancesEnRetard, echeancesProches, inscriptionsRecentes, devise]);

  // Activités récentes
  const recentActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      title: string;
      description: string;
      time: string;
      icon: any;
      color: string;
    }> = [];

    inscriptionsRecentes.slice(0, 3).forEach((ins) => {
      activities.push({
        id: `ins-${ins.id}`,
        title: 'Nouvelle inscription',
        description: `${ins.eleve?.prenom ?? ''} ${
          ins.eleve?.nom ?? ''
        } — ${ins.classe?.nom ?? ''}`,
        time: formatDateShort(ins.dateInscription),
        icon: UserGroupIcon,
        color: 'text-blue-600',
      });
    });

    paiements.slice(0, 3).forEach((p) => {
      activities.push({
        id: `pay-${p.id}`,
        title: 'Paiement reçu',
        description: `${p.reference} — ${formatMoney(p.montant, devise)}`,
        time: formatDateShort(p.datePaiement),
        icon: CreditCardIcon,
        color: 'text-emerald-600',
      });
    });

    return activities.slice(0, 5);
  }, [inscriptionsRecentes, paiements, devise]);

  const isLoading =
    loadingEleves ||
    loadingEnseignants ||
    loadingClasses ||
    loadingPaiements ||
    loadingEcheances;

  // ═══════════════════════════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════════════════════════

  const stats = [
    {
      title: 'Total Élèves',
      value: formatNumber(totalEleves),
      trend: 'up' as const,
      change: 'Actifs',
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hint: `${totalClasses} classes`,
    },
    {
      title: 'Enseignants',
      value: formatNumber(totalEnseignants),
      trend: 'up' as const,
      change: 'Actifs',
      icon: AcademicCapIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hint: `${totalMatieres} matières`,
    },
    {
      title: 'Encaissé (50 derniers)',
      value: formatMoney(totalEncaisse, devise),
      trend: 'up' as const,
      change: `${paiements.length} paiements`,
      icon: CurrencyDollarIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hint: 'Total encaissé',
    },
    {
      title: 'Échéances en retard',
      value: formatNumber(echeancesEnRetard.length),
      trend:
        echeancesEnRetard.length > 0 ? ('down' as const) : ('up' as const),
      change: `${echeancesProches.length} à venir`,
      icon: ClockIcon,
      color:
        echeancesEnRetard.length > 0 ? 'text-red-600' : 'text-emerald-600',
      bgColor:
        echeancesEnRetard.length > 0 ? 'bg-red-50' : 'bg-emerald-50',
      hint: 'À traiter',
    },
  ];

  // ═══════════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="space-y-8">
      {/* BANNIÈRE DE BIENVENUE */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            {etablissement?.logo ? (
              <img
                src={etablissement.logo}
                alt={etablissement.nom}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-lg">
                {etablissement?.nom.charAt(0).toUpperCase() ?? 'E'}
              </div>
            )}

            <div className="min-w-0">
              <h2 className="text-xl md:text-2xl font-bold">
                Bonjour {user?.prenom} 👋
              </h2>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/15 backdrop-blur rounded-full text-xs font-medium">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  Directeur
                </span>
                {etablissement && (
                  <span className="text-sm text-emerald-100">
                    de{' '}
                    <strong className="font-semibold text-white">
                      {etablissement.nom}
                    </strong>
                  </span>
                )}
              </div>

              {etablissement && (
                <div className="flex items-center gap-3 mt-2 text-xs text-emerald-100 flex-wrap">
                  {etablissement.ville && (
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-3.5 h-3.5" />
                      {etablissement.ville}, {etablissement.pays}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <BuildingOfficeIcon className="w-3.5 h-3.5" />
                    <span className="font-mono">{etablissement.code}</span>
                  </span>
                  <span className="hidden md:flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {new Date().toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0">
            <Link
              to="/dashboard/mon-etablissement"
              className="px-4 py-2.5 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-lg"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Voir mon établissement
            </Link>
            <Link
              to="/dashboard/statistiques"
              className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Statistiques</span>
            </Link>
            <Link
              to="/dashboard/parametres"
              className="p-2.5 bg-white/15 hover:bg-white/25 backdrop-blur rounded-lg transition-colors"
              title="Paramètres"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 truncate">
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
                      stat.trend === 'up'
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                {stat.hint && (
                  <p className="text-[10px] text-gray-400 mt-1 italic">
                    {stat.hint}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* GRAPHIQUE : Évolution financière */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-900">Évolution financière</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Revenus sur 12 mois (basé sur les paiements réels)
            </p>
          </div>
          {loadingPaiements && (
            <ArrowPathIcon className="w-4 h-4 text-emerald-600 animate-spin" />
          )}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient
                  id="colorRevenus"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#10B981"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#10B981"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F1F5F9"
                vertical={false}
              />
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
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  fontSize: 12,
                }}
                formatter={(v) => formatMoney(Number(v), devise)}
              />
              <Area
                type="monotone"
                dataKey="revenus"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#colorRevenus)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* GRAPHIQUES : Recouvrement + Répartition paiements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">
                Résumé des échéances
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {echeances.length} échéance(s) sur 50 dernières
              </p>
            </div>
            <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full font-bold">
              {echeances.filter((e) => e.estPayee).length} /{' '}
              {echeances.length} payées
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Payées
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  {echeances.filter((e) => e.estPayee).length}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${
                      echeances.length > 0
                        ? (echeances.filter((e) => e.estPayee).length /
                            echeances.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  En retard
                </span>
                <span className="text-sm font-bold text-red-600">
                  {echeancesEnRetard.length}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{
                    width: `${
                      echeances.length > 0
                        ? (echeancesEnRetard.length / echeances.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  À venir (7 jours)
                </span>
                <span className="text-sm font-bold text-orange-600">
                  {echeancesProches.length}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{
                    width: `${
                      echeances.length > 0
                        ? (echeancesProches.length / echeances.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Répartition paiements</h3>
            <span className="text-xs text-gray-400">
              {paiements.length} total
            </span>
          </div>

          {paymentSplit.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-center text-sm text-gray-400">
              Aucun paiement enregistré
            </div>
          ) : (
            <>
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
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #E2E8F0',
                        fontSize: 12,
                      }}
                      formatter={(v) => formatMoney(Number(v), devise)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {paymentSplit.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatMoney(item.value, devise)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-lg font-bold text-emerald-600">
                  {formatMoney(totalEncaisse, devise)}
                </span>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ALERTES */}
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
            {alertes.length} élément(s)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alertes.map((alerte, index) => {
            const colors = {
              warning: {
                bg: 'bg-orange-50',
                text: 'text-orange-700',
                icon: 'text-orange-500',
                border: 'border-orange-100',
                bar: 'bg-orange-400',
              },
              danger: {
                bg: 'bg-red-50',
                text: 'text-red-700',
                icon: 'text-red-500',
                border: 'border-red-100',
                bar: 'bg-red-400',
              },
              info: {
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                icon: 'text-blue-500',
                border: 'border-blue-100',
                bar: 'bg-blue-400',
              },
              success: {
                bg: 'bg-emerald-50',
                text: 'text-emerald-700',
                icon: 'text-emerald-500',
                border: 'border-emerald-100',
                bar: 'bg-emerald-400',
              },
            }[alerte.type];

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
                  <div className={`w-2 h-10 rounded-full ${colors.bar}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${colors.text}`}>
                      {alerte.title}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {alerte.desc}
                    </p>
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

      {/* ACTIVITÉS + À VENIR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Activités récentes</h3>
            <Link
              to="/dashboard/inscriptions"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              Voir tout
            </Link>
          </div>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Aucune activité récente
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="flex items-start gap-4 p-3 hover:bg-emerald-50/30 rounded-xl transition-colors group"
                >
                  <div
                    className={`p-2 rounded-xl bg-gray-100 ${activity.color}`}
                  >
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Prochaines échéances</h3>
            <span className="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded-full font-medium">
              {echeancesProches.length} cette semaine
            </span>
          </div>
          {echeancesProches.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Aucune échéance cette semaine
            </p>
          ) : (
            <div className="space-y-3">
              {echeancesProches.slice(0, 5).map((ech, index) => (
                <motion.div
                  key={ech.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="flex items-start gap-3 p-3 border border-orange-100 bg-orange-50/30 rounded-xl hover:bg-orange-50 transition-colors"
                >
                  <div className="w-2 h-12 bg-orange-400 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ech.nom}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatMoney(ech.montant, devise)} —{' '}
                      {formatDateShort(ech.dateLimite)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* DERNIERS PAIEMENTS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BanknotesIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">
              Derniers paiements reçus
            </h3>
          </div>
          <Link
            to="/dashboard/paiements"
            className="text-sm text-emerald-600 font-medium hover:underline"
          >
            Voir tous les paiements
          </Link>
        </div>
        {derniersPaiements.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Aucun paiement enregistré
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Élève
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Moyen
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {derniersPaiements.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {p.reference}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {(p as any).eleve
                        ? `${(p as any).eleve.prenom} ${(p as any).eleve.nom}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                        {p.moyen.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">
                      {formatMoney(p.montant, devise)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 text-right">
                      {formatDateShort(p.datePaiement)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* RACCOURCIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Mon établissement',
            desc: 'Infos & configuration',
            icon: BuildingOfficeIcon,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            href: '/dashboard/mon-etablissement',
          },
          {
            title: 'Paie du personnel',
            desc: 'Bulletins & salaires',
            icon: BanknotesIcon,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            href: '/dashboard/paie',
          },
          {
            title: 'Échéances',
            desc: `${echeancesProches.length} à venir`,
            icon: ReceiptPercentIcon,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            href: '/dashboard/echeances',
          },
          {
            title: 'Statistiques',
            desc: 'Analyses détaillées',
            icon: ChartBarIcon,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/dashboard/statistiques',
          },
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
              <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                {item.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Loading global overlay */}
      {isLoading && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium z-50">
          <ArrowPathIcon className="w-4 h-4 animate-spin" />
          Chargement des données…
        </div>
      )}
    </div>
  );
};

export default DashboardPage;