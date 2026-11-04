// frontend2/src/pages/dashboard/directeur/statistiques/StatistiquesPage.tsx

import React, { useMemo, useState, useEffect } from 'react';
import {
  UserGroupIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ReceiptPercentIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useEleves } from '../../../../hooks/useEleves';
import { useClasses } from '../../../../hooks/useClasses';
import { useEnseignants } from '../../../../hooks/useEnseignants';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import { usePaiements } from '../../../../hooks/usePaiements';

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const formatMoney = (amount: number | null | undefined, devise = 'XOF') => {
  if (amount == null) return '—';
  const value = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount);
  const upper = devise.toUpperCase();
  if (upper === 'XOF' || upper === 'XAF') return `${value} F CFA`;
  if (upper === 'EUR') return `${value} €`;
  if (upper === 'USD') return `${value} $`;
  return `${value} ${devise}`;
};

const formatMoneyShort = (amount: number) => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return String(amount);
};

/**
 * ✅ FIX TS2322 : formatter Recharts accepte `ValueType | undefined`.
 */
const moneyTooltipFormatter: any = (value: any) => {
  const num = typeof value === 'number' ? value : Number(value) || 0;
  return formatMoney(num);
};

/**
 * 🆕 Utilitaire universel d'extraction de tableau
 * Gère tous les formats de réponse possibles :
 *   - { data: { <key>: [...] } }
 *   - { data: { data: [...] } }
 *   - { <key>: [...] }
 *   - { data: [...] }
 *   - [...]
 */
function extractArray(source: any, key: string): any[] {
  if (!source) return [];
  // Format 1 : { data: { <key>: [...] } }
  if (Array.isArray(source?.data?.[key])) return source.data[key];
  // Format 2 : { data: { data: [...] } }
  if (Array.isArray(source?.data?.data)) return source.data.data;
  // Format 3 : { <key>: [...] }
  if (Array.isArray(source?.[key])) return source[key];
  // Format 4 : { data: [...] }
  if (Array.isArray(source?.data)) return source.data;
  // Format 5 : [...] direct
  if (Array.isArray(source)) return source;
  return [];
}

const MOYENS_LABEL: Record<string, string> = {
  ESPECES: 'Espèces',
  VIREMENT: 'Virement',
  MOBILE_MONEY: 'Mobile Money',
  CARTE: 'Carte',
  CHEQUE: 'Chèque',
  AUTRE: 'Autre',
};

const SEXE_COLORS = ['#3b82f6', '#ec4899'];
const NIVEAU_COLORS = [
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
];
const MOYEN_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

// ═══════════════════════════════════════════════════════════
// KPI CARD
// ═══════════════════════════════════════════════════════════

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'teal' | 'purple';
  trend?: number;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  Icon,
  color = 'emerald',
  trend,
}) => {
  const map = {
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    rose: 'bg-rose-50 text-rose-600 ring-rose-100',
    teal: 'bg-teal-50 text-teal-600 ring-teal-100',
    purple: 'bg-purple-50 text-purple-600 ring-purple-100',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 truncate">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          )}
          {trend !== undefined && (
            <p
              className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${
                trend >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend >= 0 ? (
                <ArrowTrendingUpIcon className="w-3 h-3" />
              ) : (
                <ArrowTrendingDownIcon className="w-3 h-3" />
              )}
              {Math.abs(trend).toFixed(1)}% vs mois dernier
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ring-4 ${map[color]} shrink-0`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

const StatistiquesPage: React.FC = () => {
  const [selectedAnneeId, setSelectedAnneeId] = useState<string>('');

  // ─── Requêtes ───
  const { data: anneesData } = useAnneesScolaires({ limit: 50 });
  const {
    data: elevesData,
    isLoading: loadingEleves,
    refetch: refetchEleves,
  } = useEleves({ limit: 1000, sortBy: 'nom', sortOrder: 'asc' });
  const {
    data: classesData,
    isLoading: loadingClasses,
    refetch: refetchClasses,
  } = useClasses({ limit: 200 });
  const {
    data: enseignantsData,
    isLoading: loadingEnseignants,
    refetch: refetchEnseignants,
  } = useEnseignants({ limit: 500 });
  const {
    data: paiementsData,
    isLoading: loadingPaiements,
    refetch: refetchPaiements,
  } = usePaiements({ limit: 200, sortBy: 'datePaiement', sortOrder: 'desc' });

  const isLoading =
    loadingEleves || loadingClasses || loadingEnseignants || loadingPaiements;

  const refetchAll = () => {
    refetchEleves();
    refetchClasses();
    refetchEnseignants();
    refetchPaiements();
  };

  // ═══════════════════════════════════════════════════════════
  // 🆕 EXTRACTION UNIVERSELLE DES DONNÉES
  // ═══════════════════════════════════════════════════════════

  const annees: any[] = useMemo(
    () => extractArray(anneesData, 'annees'),
    [anneesData]
  );
  const eleves: any[] = useMemo(
    () => extractArray(elevesData, 'eleves'),
    [elevesData]
  );
  const classes: any[] = useMemo(
    () => extractArray(classesData, 'classes'),
    [classesData]
  );
  const enseignants: any[] = useMemo(
    () => extractArray(enseignantsData, 'enseignants'),
    [enseignantsData]
  );
  const paiements: any[] = useMemo(
    () => extractArray(paiementsData, 'paiements'),
    [paiementsData]
  );

  // 🔍 DEBUG TEMPORAIRE (à retirer en production)
  useEffect(() => {
    console.group('🔍 [StatistiquesPage] Debug données');
    console.log('📅 Annees brutes:', anneesData);
    console.log('📅 Annees extraites:', annees);
    console.log('👨‍🎓 Élèves bruts:', elevesData);
    console.log('👨‍🎓 Élèves extraits:', eleves.length);
    console.log('🏫 Classes brutes:', classesData);
    console.log('🏫 Classes extraites:', classes.length);
    console.log('👨‍🏫 Enseignants bruts:', enseignantsData);
    console.log('👨‍🏫 Enseignants extraits:', enseignants.length);
    console.log('💰 Paiements bruts:', paiementsData);
    console.log('💰 Paiements extraits:', paiements.length);
    console.groupEnd();
  }, [anneesData, elevesData, classesData, enseignantsData, paiementsData]);

  // ─── Année active ───
  const anneeActive = useMemo(
    () => annees.find((a: any) => a.estActive) ?? annees[0] ?? null,
    [annees]
  );

  const anneeIdEffectif = selectedAnneeId || anneeActive?.id || '';

  // ═══════════════════════════════════════════════════════════
  // STATISTIQUES EFFECTIFS
  // ═══════════════════════════════════════════════════════════

  const effectifs = useMemo(() => {
    // 🆕 On accepte ACTIF et on ignore seulement ARCHIVE/SORTI
    const actifs = eleves.filter(
      (e) => e.statut === 'ACTIF' || (!e.statut && !e.estArchive)
    );
    const garcons = actifs.filter((e) => e.sexe === 'M').length;
    const filles = actifs.filter((e) => e.sexe === 'F').length;

    const parNiveau: Record<string, number> = {};
    actifs.forEach((e) => {
      const niveau =
        e.inscriptions?.[0]?.classe?.niveau?.nom ??
        e.inscriptions?.[0]?.classe?.niveauNom ??
        e.inscriptions?.[0]?.classe?.nom ??
        'Non assigné';
      parNiveau[niveau] = (parNiveau[niveau] ?? 0) + 1;
    });

    // 🆕 Enseignants : on accepte estActif !== false et on exclut estArchive === true
    const enseignantsActifs = enseignants.filter(
      (e) => e.estActif !== false && e.estArchive !== true
    );

    // 🆕 Classes : idem
    const classesActives = classes.filter(
      (c) => c.estActive !== false && c.estArchive !== true
    );

    return {
      totalEleves: actifs.length,
      totalEnseignants: enseignantsActifs.length,
      totalClasses: classesActives.length,
      repartitionSexe: [
        { sexe: 'Masculin', count: garcons },
        { sexe: 'Féminin', count: filles },
      ],
      repartitionNiveaux: Object.entries(parNiveau)
        .map(([niveau, count]) => ({ niveau, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6),
    };
  }, [eleves, enseignants, classes]);

  // ═══════════════════════════════════════════════════════════
  // STATISTIQUES FINANCES
  // ═══════════════════════════════════════════════════════════

  const finances = useMemo(() => {
    const paiementsComplets = paiements.filter(
      (p) => p.statut === 'COMPLET'
    );
    const totalEncaisse = paiementsComplets.reduce(
      (s, p) => s + (p.montant ?? 0),
      0
    );

    const totalAttendu = classes.reduce((s, c: any) => {
      const plan = c.planScolarite;
      const montantParEleve = plan?.montantTotal ?? 0;
      const effectif = c._count?.inscriptions ?? 0;
      return s + montantParEleve * effectif;
    }, 0);

    const totalImpaye = Math.max(0, totalAttendu - totalEncaisse);
    const tauxRecouvrement =
      totalAttendu > 0 ? (totalEncaisse / totalAttendu) * 100 : 0;

    const now = new Date();
    const evolutionMensuelle: { mois: string; montant: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const monthPaiements = paiementsComplets.filter((p) => {
        const date = new Date(p.datePaiement);
        return date >= d && date < nextMonth;
      });
      const montant = monthPaiements.reduce(
        (s, p) => s + (p.montant ?? 0),
        0
      );
      evolutionMensuelle.push({
        mois: d.toLocaleDateString('fr-FR', { month: 'short' }),
        montant,
      });
    }

    const parMoyen: Record<string, number> = {};
    paiementsComplets.forEach((p) => {
      const moyen = p.moyen ?? 'AUTRE';
      parMoyen[moyen] = (parMoyen[moyen] ?? 0) + (p.montant ?? 0);
    });
    const repartitionMoyens = Object.entries(parMoyen)
      .map(([moyen, montant]) => ({
        moyen: MOYENS_LABEL[moyen] ?? moyen,
        montant,
      }))
      .sort((a, b) => b.montant - a.montant);

    return {
      totalAttendu,
      totalEncaisse,
      totalImpaye,
      tauxRecouvrement: Math.round(tauxRecouvrement * 10) / 10,
      evolutionMensuelle,
      repartitionMoyens,
      nombrePaiements: paiementsComplets.length,
    };
  }, [paiements, classes]);

  // ═══════════════════════════════════════════════════════════
  // STATISTIQUES SCOLARITÉ
  // ═══════════════════════════════════════════════════════════

  const scolarite = useMemo(() => {
    const classesAvecMoyenne = classes
      .filter((c: any) => c.moyenneGenerale != null)
      .map((c: any) => ({
        classe: c.nom,
        moyenne: c.moyenneGenerale,
        effectif: c._count?.inscriptions ?? 0,
      }))
      .sort((a, b) => b.moyenne - a.moyenne)
      .slice(0, 5);

    const moyenneGenerale =
      classesAvecMoyenne.length > 0
        ? classesAvecMoyenne.reduce((s, c) => s + c.moyenne, 0) /
          classesAvecMoyenne.length
        : 0;

    const classesAvecReussite = classes.filter(
      (c: any) => c.tauxReussite != null
    );
    const tauxReussite =
      classesAvecReussite.length > 0
        ? classesAvecReussite.reduce(
            (s: number, c: any) => s + c.tauxReussite,
            0
          ) / classesAvecReussite.length
        : 0;

    return {
      moyenneGenerale: Math.round(moyenneGenerale * 100) / 100,
      tauxReussite: Math.round(tauxReussite * 10) / 10,
      topClasses: classesAvecMoyenne.map((c, i) => ({
        rang: i + 1,
        ...c,
      })),
    };
  }, [classes]);

  // ═══════════════════════════════════════════════════════════
  // STATISTIQUES PRÉSENCES (placeholder — à connecter au backend)
  // ═══════════════════════════════════════════════════════════

  const presences = useMemo(() => {
    return {
      tauxPresence: 92.4,
      tauxAbsence: 4.8,
      tauxRetard: 2.8,
      presencesParMois: [
        { mois: 'Sept', presents: 580, absents: 35, retards: 18 },
        { mois: 'Oct', presents: 610, absents: 28, retards: 22 },
        { mois: 'Nov', presents: 595, absents: 32, retards: 15 },
        { mois: 'Déc', presents: 540, absents: 45, retards: 20 },
        { mois: 'Jan', presents: 620, absents: 25, retards: 12 },
      ],
    };
  }, []);

  // ─── Loading state ───
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="text-gray-500 mt-4">Chargement des statistiques…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            Statistiques & Tableau de bord
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Vue d'ensemble — {anneeActive?.nom ?? 'Année en cours'}
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
            <select
              value={anneeIdEffectif}
              onChange={(e) => setSelectedAnneeId(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer appearance-none"
            >
              {annees.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.nom}
                  {a.estActive ? ' (active)' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={refetchAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* ═══════════ KPI EFFECTIFS ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Élèves inscrits"
          value={effectifs.totalEleves}
          Icon={UserGroupIcon}
          color="emerald"
        />
        <KpiCard
          title="Enseignants"
          value={effectifs.totalEnseignants}
          Icon={AcademicCapIcon}
          color="teal"
        />
        <KpiCard
          title="Classes actives"
          value={effectifs.totalClasses}
          Icon={BuildingOfficeIcon}
          color="purple"
        />
        <KpiCard
          title="Moyenne générale"
          value={
            scolarite.moyenneGenerale > 0
              ? `${scolarite.moyenneGenerale}/20`
              : '—'
          }
          subtitle={
            scolarite.tauxReussite > 0
              ? `Réussite : ${scolarite.tauxReussite}%`
              : undefined
          }
          Icon={CheckCircleIcon}
          color="emerald"
        />
      </div>

      {/* ═══════════ KPI FINANCES ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total attendu"
          value={formatMoney(finances.totalAttendu)}
          Icon={CurrencyDollarIcon}
          color="blue"
        />
        <KpiCard
          title="Total encaissé"
          value={formatMoney(finances.totalEncaisse)}
          subtitle={`Taux : ${finances.tauxRecouvrement}%`}
          Icon={BanknotesIcon}
          color="emerald"
        />
        <KpiCard
          title="Impayés"
          value={formatMoney(finances.totalImpaye)}
          Icon={ExclamationTriangleIcon}
          color="rose"
        />
        <KpiCard
          title="Paiements enregistrés"
          value={finances.nombrePaiements}
          subtitle="Total transactions"
          Icon={ReceiptPercentIcon}
          color="amber"
        />
      </div>

      {/* ═══════════ CHARTS EFFECTIFS ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par sexe */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Répartition par sexe
          </h3>
          {effectifs.repartitionSexe.every((s) => s.count === 0) ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400 italic">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={effectifs.repartitionSexe}
                  dataKey="count"
                  nameKey="sexe"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ sexe, count }: any) => `${sexe}: ${count}`}
                >
                  {effectifs.repartitionSexe.map((_, i) => (
                    <Cell
                      key={i}
                      fill={SEXE_COLORS[i % SEXE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Effectifs par niveau */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Effectifs par niveau
          </h3>
          {effectifs.repartitionNiveaux.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400 italic">
              Aucun niveau avec des inscrits
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={effectifs.repartitionNiveaux}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="niveau" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {effectifs.repartitionNiveaux.map((_, i) => (
                    <Cell
                      key={i}
                      fill={NIVEAU_COLORS[i % NIVEAU_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ═══════════ ÉVOLUTION FINANCES ═══════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Évolution des encaissements (6 derniers mois)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={finances.evolutionMensuelle}>
            <defs>
              <linearGradient id="gEm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => formatMoneyShort(Number(v) || 0)}
            />
            <Tooltip formatter={moneyTooltipFormatter} />
            <Area
              type="monotone"
              dataKey="montant"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#gEm)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ═══════════ RÉPARTITION MOYENS DE PAIEMENT ═══════════ */}
      {finances.repartitionMoyens.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Répartition par moyen de paiement
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={finances.repartitionMoyens}
                dataKey="montant"
                nameKey="moyen"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                paddingAngle={3}
                label={({ moyen, montant }: any) =>
                  `${moyen}: ${formatMoneyShort(montant)}`
                }
              >
                {finances.repartitionMoyens.map((_, i) => (
                  <Cell key={i} fill={MOYEN_COLORS[i % MOYEN_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={moneyTooltipFormatter} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ═══════════ PRÉSENCES + TOP CLASSES ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Présences */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Présences du personnel
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={presences.presencesParMois}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="presents"
                stackId="a"
                fill="#10b981"
                name="Présents"
              />
              <Bar dataKey="retards" stackId="a" fill="#f59e0b" name="Retards" />
              <Bar
                dataKey="absents"
                stackId="a"
                fill="#ef4444"
                name="Absents"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top classes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-lg">🏆</span>
            Top 5 classes
          </h3>

          {scolarite.topClasses.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-sm text-gray-400 italic">
              <ChartBarIcon className="w-12 h-12 mb-2 text-gray-300" />
              Aucune moyenne de classe disponible
              <p className="text-xs mt-1">
                Les moyennes apparaîtront après la saisie des notes
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="text-left py-3">Rang</th>
                    <th className="text-left py-3">Classe</th>
                    <th className="text-right py-3">Effectif</th>
                    <th className="text-right py-3">Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {scolarite.topClasses.map((c) => (
                    <tr
                      key={c.rang}
                      className="border-b border-gray-100 hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            c.rang === 1
                              ? 'bg-amber-100 text-amber-800'
                              : c.rang === 2
                              ? 'bg-gray-100 text-gray-800'
                              : c.rang === 3
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {c.rang}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-gray-900">
                        {c.classe}
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        {c.effectif}
                      </td>
                      <td
                        className={`py-3 text-right font-bold ${
                          c.moyenne >= 14
                            ? 'text-emerald-600'
                            : c.moyenne >= 10
                            ? 'text-blue-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {c.moyenne.toFixed(2)}/20
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ INFOS ANNÉE ═══════════ */}
      {anneeActive && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <CalendarDaysIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-900">
                Année scolaire : {anneeActive.nom}
                {anneeActive.estActive && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase">
                    Active
                  </span>
                )}
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Du{' '}
                {new Date(anneeActive.dateDebut).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}{' '}
                au{' '}
                {new Date(anneeActive.dateFin).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatistiquesPage;