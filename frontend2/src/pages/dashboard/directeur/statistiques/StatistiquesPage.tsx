import React from 'react';
import {
  UserGroupIcon, AcademicCapIcon, BuildingOfficeIcon,
  CurrencyDollarIcon, BanknotesIcon, ExclamationTriangleIcon,
  ClockIcon, ArrowPathIcon, ChartBarIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';

const data = {
  effectifs: {
    totalEleves: 487, totalEnseignants: 32, totalClasses: 18,
    repartitionSexe: [
      { sexe: 'Masculin', count: 256 }, { sexe: 'Féminin', count: 231 },
    ],
    repartitionNiveaux: [
      { niveau: 'Primaire', count: 180 }, { niveau: '6ème', count: 95 },
      { niveau: '5ème', count: 88 }, { niveau: '4ème', count: 72 },
      { niveau: '3ème', count: 52 },
    ],
  },
  finances: {
    totalAttendu: 145_000_000, totalEncaisse: 118_500_000,
    totalImpaye: 26_500_000, tauxRecouvrement: 81.7,
    evolutionMensuelle: [
      { mois: 'Sept', montant: 28_500_000 }, { mois: 'Oct', montant: 22_300_000 },
      { mois: 'Nov', montant: 19_800_000 }, { mois: 'Déc', montant: 15_200_000 },
      { mois: 'Jan', montant: 12_700_000 }, { mois: 'Fév', montant: 10_500_000 },
      { mois: 'Mars', montant: 9_500_000 },
    ],
    repartitionMoyens: [
      { moyen: 'Espèces', montant: 52_000_000 },
      { moyen: 'Mobile Money', montant: 38_500_000 },
      { moyen: 'Virement', montant: 18_000_000 },
      { moyen: 'Chèque', montant: 10_000_000 },
    ],
  },
  presences: {
    tauxPresence: 92.4, tauxAbsence: 4.8, tauxRetard: 2.8,
    presencesParMois: [
      { mois: 'Sept', presents: 580, absents: 35, retards: 18 },
      { mois: 'Oct', presents: 610, absents: 28, retards: 22 },
      { mois: 'Nov', presents: 595, absents: 32, retards: 15 },
      { mois: 'Déc', presents: 540, absents: 45, retards: 20 },
      { mois: 'Jan', presents: 620, absents: 25, retards: 12 },
    ],
  },
  scolarite: {
    moyenneGenerale: 12.8, tauxReussite: 87.5,
    topClasses: [
      { rang: 1, classe: '3ème A', moyenne: 15.42, effectif: 28 },
      { rang: 2, classe: 'CM2 B', moyenne: 14.87, effectif: 32 },
      { rang: 3, classe: '4ème A', moyenne: 14.25, effectif: 30 },
      { rang: 4, classe: 'CM1 A', moyenne: 13.98, effectif: 29 },
      { rang: 5, classe: '5ème B', moyenne: 13.56, effectif: 31 },
    ],
  },
};

const fmt = (v: number) => new Intl.NumberFormat('fr-FR').format(v) + ' XOF';
const SEXE_COLORS = ['#3b82f6', '#ec4899'];
const NIVEAU_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
const MOYEN_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const KpiCard = ({ title, value, subtitle, Icon, color = 'blue', trend }: any) => {
  const map: any = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    green: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    red: 'bg-rose-50 text-rose-600 ring-rose-100',
    yellow: 'bg-amber-50 text-amber-600 ring-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    purple: 'bg-purple-50 text-purple-600 ring-purple-100',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`mt-2 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% vs mois dernier
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ring-4 ${map[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const StatistiquesPage: React.FC = () => {
  const { effectifs, finances, presences, scolarite } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChartBarIcon className="h-7 w-7 text-blue-600" />
            Statistiques & Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-gray-500">Vue d'ensemble — année 2024-2025</p>
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>2024-2025</option>
            <option>2023-2024</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <ArrowPathIcon className="h-4 w-4" /> Actualiser
          </button>
        </div>
      </div>

      {/* KPI Effectifs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Élèves inscrits" value={effectifs.totalEleves} icon={UserGroupIcon} Icon={UserGroupIcon} color="blue" trend={3.2} />
        <KpiCard title="Enseignants" value={effectifs.totalEnseignants} Icon={AcademicCapIcon} color="indigo" trend={1.5} />
        <KpiCard title="Classes" value={effectifs.totalClasses} Icon={BuildingOfficeIcon} color="purple" />
        <KpiCard title="Moyenne générale" value={`${scolarite.moyenneGenerale}/20`} subtitle={`Réussite : ${scolarite.tauxReussite}%`} Icon={CheckCircleIcon} color="green" trend={0.8} />
      </div>

      {/* KPI Finances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Total attendu" value={fmt(finances.totalAttendu)} Icon={CurrencyDollarIcon} color="blue" />
        <KpiCard title="Total encaissé" value={fmt(finances.totalEncaisse)} subtitle={`Taux : ${finances.tauxRecouvrement}%`} Icon={BanknotesIcon} color="green" trend={5.4} />
        <KpiCard title="Impayés" value={fmt(finances.totalImpaye)} Icon={ExclamationTriangleIcon} color="red" trend={-2.1} />
        <KpiCard title="Demandes en attente" value={7} subtitle="Absences / avances" Icon={ClockIcon} color="yellow" />
      </div>

      {/* Effectifs charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Répartition par sexe</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={effectifs.repartitionSexe} dataKey="count" nameKey="sexe" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} label={({ sexe, count }: any) => `${sexe}: ${count}`}>
                {effectifs.repartitionSexe.map((_, i) => <Cell key={i} fill={SEXE_COLORS[i % SEXE_COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Effectifs par niveau</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={effectifs.repartitionNiveaux}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="niveau" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {effectifs.repartitionNiveaux.map((_, i) => <Cell key={i} fill={NIVEAU_COLORS[i % NIVEAU_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Évolution finances */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Évolution des encaissements</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={finances.evolutionMensuelle}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Area type="monotone" dataKey="montant" stroke="#3b82f6" strokeWidth={2} fill="url(#g1)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Présences + Top classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Présences du personnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={presences.presencesParMois}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip /><Legend />
              <Bar dataKey="presents" stackId="a" fill="#10b981" name="Présents" />
              <Bar dataKey="retards" stackId="a" fill="#f59e0b" name="Retards" />
              <Bar dataKey="absents" stackId="a" fill="#ef4444" name="Absents" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">🏆 Top 5 classes</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                <th className="text-left py-3">Rang</th>
                <th className="text-left py-3">Classe</th>
                <th className="text-right py-3">Effectif</th>
                <th className="text-right py-3">Moyenne</th>
              </tr>
            </thead>
            <tbody>
              {scolarite.topClasses.map((c) => (
                <tr key={c.rang} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${c.rang === 1 ? 'bg-yellow-100 text-yellow-800' : c.rang === 2 ? 'bg-gray-100 text-gray-800' : c.rang === 3 ? 'bg-orange-100 text-orange-800' : 'bg-blue-50 text-blue-700'}`}>{c.rang}</span>
                  </td>
                  <td className="py-3 font-medium text-gray-900">{c.classe}</td>
                  <td className="py-3 text-right text-gray-600">{c.effectif}</td>
                  <td className={`py-3 text-right font-bold ${c.moyenne >= 14 ? 'text-emerald-600' : 'text-blue-600'}`}>{c.moyenne.toFixed(2)}/20</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatistiquesPage;