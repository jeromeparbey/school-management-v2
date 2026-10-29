// frontend2/src/pages/dashboard/enseignant/EnseignantDashboardPage.tsx

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/AuthContext';
import {
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ClockIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  BellIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  SparklesIcon,
  PlusIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  MapPinIcon,
  ChartBarIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
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

import { useEnseignant } from '../../../hooks/useEnseignants';
import { useAffectationsByEnseignant } from '../../../hooks/useAffectations';
import { useEmploiTempsByEnseignant } from '../../../hooks/useEmploisTemps';
import type { EnseignantDetail } from '../../../types/enseignant.types';

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const formatMoney = (n: number | null | undefined, devise = 'F CFA') => {
  if (n == null) return `0 ${devise}`;
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(n))} ${devise}`;
};

const formatNumber = (n: number | null | undefined) =>
  n == null ? '0' : new Intl.NumberFormat('fr-FR').format(n);

const formatDateShort = (d: string | Date | null | undefined) => {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const formatDateLong = (d: string | Date | null | undefined) => {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const JOURS_FR: Record<string, string> = {
  LUNDI: 'Lundi',
  MARDI: 'Mardi',
  MERCREDI: 'Mercredi',
  JEUDI: 'Jeudi',
  VENDREDI: 'Vendredi',
  SAMEDI: 'Samedi',
  DIMANCHE: 'Dimanche',
};

const JOURS_JS_TO_KEY = [
  'DIMANCHE',
  'LUNDI',
  'MARDI',
  'MERCREDI',
  'JEUDI',
  'VENDREDI',
  'SAMEDI',
];

const parseTime = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10));
  return (h ?? 0) * 60 + (m ?? 0);
};

const STATUT_PAIE_LABEL: Record<string, string> = {
  BROUILLON: 'Brouillon',
  CALCULEE: 'Calculée',
  APPROUVEE: 'Approuvée',
  PAYEE: 'Payée',
  ANNULEE: 'Annulée',
  PREVISIONNEL: 'Prévisionnel',
};

const STATUT_PAIE_CONFIG: Record<string, { bg: string; text: string }> = {
  BROUILLON: { bg: 'bg-gray-50', text: 'text-gray-600' },
  CALCULEE: { bg: 'bg-blue-50', text: 'text-blue-600' },
  APPROUVEE: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  PAYEE: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  ANNULEE: { bg: 'bg-red-50', text: 'text-red-600' },
  PREVISIONNEL: { bg: 'bg-gray-50', text: 'text-gray-600' },
};

const STATUT_DEMANDE_LABEL: Record<string, string> = {
  BROUILLON: 'Brouillon',
  SOUMISE: 'Soumise',
  APPROUVEE: 'Approuvée',
  REJETEE: 'Rejetée',
  ANNULEE: 'Annulée',
};

const STATUT_DEMANDE_CONFIG: Record<string, { bg: string; text: string }> = {
  BROUILLON: { bg: 'bg-gray-50', text: 'text-gray-600' },
  SOUMISE: { bg: 'bg-orange-50', text: 'text-orange-600' },
  APPROUVEE: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  REJETEE: { bg: 'bg-red-50', text: 'text-red-600' },
  ANNULEE: { bg: 'bg-gray-50', text: 'text-gray-600' },
};

const STATUT_COURS_CONFIG: Record<
  string,
  { bg: string; border: string; badge: string; text: string; label: string }
> = {
  TERMINE: {
    bg: 'bg-gray-50',
    border: 'border-gray-100',
    badge: 'bg-gray-400',
    text: 'text-gray-500',
    label: 'Terminé',
  },
  EN_COURS: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-500',
    text: 'text-emerald-700',
    label: 'En cours',
  },
  PROCHAIN: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    badge: 'bg-blue-500',
    text: 'text-blue-700',
    label: 'Prochain',
  },
  A_VENIR: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    badge: 'bg-blue-500',
    text: 'text-blue-700',
    label: 'À venir',
  },
};

// ═══════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════

const EnseignantDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // ─── Récupération de l'ID enseignant depuis le user connecté ───
  // Le user (JWT) contient normalement `enseignantId` ou on peut le retrouver
  // via l'utilisateur. On s'appuie sur `user.enseignantId` (ajoutez-le dans
  // le payload JWT si absent).
  const enseignantId: string | undefined =
    (user as any)?.enseignantId ?? (user as any)?.enseignant?.id;

  // ─── Appels API réels ───
  const {
    data: enseignantRaw,
    isLoading: loadingEnseignant,
    isError: errorEnseignant,
  } = useEnseignant(enseignantId);

  const {
    data: affectationsData,
    isLoading: loadingAffectations,
  } = useAffectationsByEnseignant(enseignantId);

  const {
    data: emploiTempsData,
    isLoading: loadingEDT,
  } = useEmploiTempsByEnseignant(enseignantId);

  // Cast enrichi
  const enseignant = enseignantRaw as EnseignantDetail | undefined;

  const isLoading =
    loadingEnseignant || loadingAffectations || loadingEDT;

  // Devise (normalisée)
  const devise =
    (enseignant as any)?.devise ?? 'F CFA';

  // ═══════════════════════════════════════════════════════════
  // DÉRIVÉS — à partir des vraies données
  // ═══════════════════════════════════════════════════════════

  // ─── Mes classes (affectations actives) ───
  const mesClasses = useMemo(() => {
    const fromAffectations =
      affectationsData?.affectations?.filter((a: any) => a.estActive) ?? [];

    // Fallback : si le endpoint by-enseignant ne renvoie rien, on prend
    // les affectations incluses dans findById
    const list =
      fromAffectations.length > 0
        ? fromAffectations
        : (enseignant?.affectations ?? []).filter((a: any) => a.estActive);

    return list.map((a: any) => {
      const classeNom = a.classe?.nom ?? '—';
      const matiereNom = a.matiere?.nom ?? 'Titulaire';
      const effectif = a.classe?._count?.inscriptions ?? 0;
      const heures = a.heuresHebdo ?? 0;

      return {
        id: a.id,
        classeId: a.classe?.id ?? '',
        nom: classeNom,
        matiere: matiereNom,
        eleves: effectif,
        heuresHebdo: heures,
        moyenne: 0, // calculé côté bulletins — voir note
      };
    });
  }, [affectationsData, enseignant]);

  // ─── Cours du jour (depuis emploisTemps) ───
  const coursJour = useMemo(() => {
    const now = new Date();
    const jourActuel = JOURS_JS_TO_KEY[now.getDay()];

    // Priorité : emploisTemps enrichis depuis findById
    const source: any[] =
      (enseignant?.emploisTemps as any[]) ??
      (emploiTempsData as any)?.slots ??
      [];

    return source
      .filter((e) => e.jour === jourActuel && e.estActive !== false)
      .map((e) => {
        // Si le backend a déjà calculé _statut, on l'utilise
        const statutBackend: string | undefined = e._statut;

        let statut: 'TERMINE' | 'EN_COURS' | 'A_VENIR' | 'PROCHAIN' =
          'A_VENIR';

        if (statutBackend === 'EN_COURS') statut = 'EN_COURS';
        else if (statutBackend === 'TERMINE') statut = 'TERMINE';
        else if (statutBackend === 'PROCHAIN') statut = 'PROCHAIN';
        else {
          // fallback calcul local
          const debut = parseTime(e.heureDebut);
          const fin = parseTime(e.heureFin);
          const nowMin = now.getHours() * 60 + now.getMinutes();
          if (nowMin >= fin) statut = 'TERMINE';
          else if (nowMin >= debut && nowMin < fin) statut = 'EN_COURS';
          else statut = 'A_VENIR';
        }

        return {
          id: e.id,
          heure: `${e.heureDebut} - ${e.heureFin}`,
          matiere: e.matiere?.nom ?? 'Cours',
          classeId: e.classe?.id ?? '',
          classe: e.classe?.nom ?? '—',
          salle: e.salle ?? e.classe?.salle ?? '—',
          statut,
          type: e.matiere ? 'Cours' : 'Titulaire',
        };
      })
      .sort((a, b) => a.heure.localeCompare(b.heure));
  }, [enseignant, emploiTempsData]);

  // ─── KPIs ───
  const statsHeures = enseignant?._statsHeures;
  const statsPresence = enseignant?._statsPresence;
  const statsPaie = enseignant?._statsPaie;

  const nbClasses = mesClasses.length;
  const nbElevesTotal = mesClasses.reduce((s, c) => s + c.eleves, 0);

  // Notes à saisir : on n'a pas de compteur dédié dans findById.
  // On peut l'estimer à partir des affectations * matières sans notes.
  // → On expose 0 par défaut, à brancher sur un futur endpoint dédié.
  const notesASaisir = 0;

  const stats: Array<{
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down';
    icon: any;
    color: string;
    bgColor: string;
    hint?: string;
    href?: string;
  }> = [
    {
      title: 'Mes classes',
      value: formatNumber(nbClasses),
      change: `${mesClasses.filter((c) => c.heuresHebdo > 0).length} actives`,
      trend: 'up',
      icon: AcademicCapIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hint:
        mesClasses.length > 0
          ? mesClasses.map((c) => c.nom).join(', ')
          : 'Aucune classe affectée',
      href: '/dashboard/mes-classes',
    },
    {
      title: 'Mes élèves',
      value: formatNumber(nbElevesTotal),
      change: `${nbClasses} classes`,
      trend: 'up',
      icon: UserGroupIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hint: 'Total toutes classes confondues',
      href: '/dashboard/mes-classes',
    },
    {
      title: 'Notes à saisir',
      value: formatNumber(notesASaisir),
      change: notesASaisir > 0 ? 'À traiter' : 'À jour',
      trend: notesASaisir > 0 ? 'down' : 'up',
      icon: PencilSquareIcon,
      color: notesASaisir > 0 ? 'text-orange-600' : 'text-emerald-600',
      bgColor: notesASaisir > 0 ? 'bg-orange-50' : 'bg-emerald-50',
      hint: 'Devoirs + compositions du mois',
      href: '/dashboard/notes/saisie',
    },
    {
      title: 'Heures / semaine',
      value: `${formatNumber(statsHeures?.heuresSemaine ?? 0)}h`,
      change: statsHeures?.totalHeuresSupp
        ? `+${statsHeures.totalHeuresSupp}h supp.`
        : '—',
      trend: 'up',
      icon: ClockIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hint: statsHeures?.heuresSuppEnAttente
        ? `${statsHeures.heuresSuppEnAttente}h en attente`
        : 'Aucune heure supp. en attente',
      href: '/dashboard/mon-emploi-temps',
    },
  ];

  // ─── Moyennes par classe ───
  // → les moyennes réelles viennent des bulletins (non inclus dans findById).
  // On affiche une barre basée sur les heures si dispo, sinon 0.
  // À remplacer par un futur GET /enseignants/:id/moyennes.
  const moyennesClasses = useMemo(
    () =>
      mesClasses.map((c) => ({
        classe: c.nom,
        moyenne: c.moyenne, // 0 par défaut — à brancher sur bulletins
        effectif: c.eleves,
        heures: c.heuresHebdo,
      })),
    [mesClasses]
  );

  // ─── Évolution des heures par jour de la semaine ───
  const evolutionMoyennes = useMemo(() => {
    const source: any[] =
      (enseignant?.emploisTemps as any[]) ??
      (emploiTempsData as any)?.slots ??
      [];

    const order = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
    const map: Record<string, number> = {};
    order.forEach((j) => (map[j] = 0));

    source
      .filter((e) => e.estActive !== false)
      .forEach((e) => {
        if (map[e.jour] !== undefined) {
          map[e.jour] +=
            (parseTime(e.heureFin) - parseTime(e.heureDebut)) / 60;
        }
      });

    return order.map((j) => ({
      mois: JOURS_FR[j]?.slice(0, 3) ?? j,
      moyenne: Math.round(map[j] * 10) / 10,
    }));
  }, [enseignant, emploiTempsData]);

  // ─── Radar compétences (basé sur les stats réelles) ───
  const radarCompetences = useMemo(() => {
    const sp = statsPresence;
    const sh = statsHeures;

    return [
      {
        competence: 'Assiduité',
        valeur: sp?.tauxPresence ?? 0,
      },
      {
        competence: 'Ponctualité',
        valeur:
          sp && sp.totalJours > 0
            ? Math.max(
                0,
                Math.round(
                  ((sp.presencesPresentes - sp.presencesRetard) /
                    sp.totalJours) *
                    100
                )
              )
            : 0,
      },
      {
        competence: 'Charge horaire',
        valeur: Math.min(
          100,
          Math.round(((sh?.heuresSemaine ?? 0) / 25) * 100)
        ),
      },
      {
        competence: 'Engagement',
        valeur: Math.min(
          100,
          Math.round(
            ((sp?.presencesPresentes ?? 0) / Math.max(1, sp?.totalJours ?? 1)) *
              100
          )
        ),
      },
      {
        competence: 'Heures supp.',
        valeur: Math.min(
          100,
          Math.round(((sh?.totalHeuresSupp ?? 0) / 20) * 100)
        ),
      },
      {
        competence: 'Disponibilité',
        valeur: sp?.tauxPresence ?? 0,
      },
    ];
  }, [statsPresence, statsHeures]);

  // ─── Répartition notes (à défaut : répartition heures par matière) ───
  const repartitionNotes = useMemo(() => {
    // On n'a pas le détail notes → on répartit les classes par matière
    const byMatiere: Record<string, number> = {};
    mesClasses.forEach((c) => {
      byMatiere[c.matiere] = (byMatiere[c.matiere] ?? 0) + 1;
    });

    const palette = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];

    return Object.entries(byMatiere).map(([name, value], i) => ({
      name,
      value,
      color: palette[i % palette.length],
    }));
  }, [mesClasses]);

  // ─── Heures supp (5 dernières) ───
  const heuresSuppList = useMemo(() => {
    return (enseignant?.heuresSupp ?? []).slice(0, 5).map((h) => ({
      id: h.id,
      date: formatDateShort(h.date),
      heures: h.heures,
      motif: h.motif ?? 'Heures supplémentaires',
      statut: h.statut,
    }));
  }, [enseignant]);

  // ─── Absences (5 dernières) ───
  const mesAbsences = useMemo(() => {
    return (enseignant?.absences ?? []).slice(0, 5).map((a) => {
      const debut = new Date(a.dateDebut);
      const fin = new Date(a.dateFin);
      const jours = Math.max(
        1,
        Math.round((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)) +
          1
      );
      return {
        id: a.id,
        date: formatDateShort(a.dateDebut),
        duree: `${jours} jour${jours > 1 ? 's' : ''}`,
        motif: a.type.replace(/_/g, ' '),
        statut: a.statut,
      };
    });
  }, [enseignant]);

  // ─── Paies récentes (4 dernières) ───
  const paiesRecentes = useMemo(() => {
    return (enseignant?.paies ?? []).slice(0, 4).map((p) => ({
      id: p.id,
      mois: p.periode?.nom ?? '—',
      net: p.totalNet,
      statut: p.statut,
      payeLe: p.payeLe,
    }));
  }, [enseignant]);

  // ─── Alertes dynamiques ───
  const alertes = useMemo(() => {
    const items: Array<{
      id: number;
      type: 'warning' | 'info' | 'success';
      title: string;
      desc: string;
      href: string;
    }> = [];

    if ((statsHeures?.heuresSuppEnAttente ?? 0) > 0) {
      items.push({
        id: 1,
        type: 'warning',
        title: `${statsHeures!.heuresSuppEnAttente}h supp. en attente`,
        desc: 'En attente de validation par la direction',
        href: '/dashboard/mes-heures-supp',
      });
    }

    if (enseignant?.prochainCours) {
      const pc = enseignant.prochainCours;
      items.push({
        id: 2,
        type: 'info',
        title: `Prochain cours : ${JOURS_FR[pc.jour] ?? pc.jour} ${pc.heureDebut}`,
        desc: pc.minutesAvant
          ? `Dans ${pc.minutesAvant} min`
          : 'Programmé',
        href: '/dashboard/mon-emploi-temps',
      });
    }

    if (statsPresence && statsPresence.tauxPresence < 90) {
      items.push({
        id: 3,
        type: 'warning',
        title: `Taux de présence : ${statsPresence.tauxPresence}%`,
        desc: `${statsPresence.presencesAbsent} absence(s) ce mois`,
        href: '/dashboard/mes-presences',
      });
    }

    if (items.length === 0) {
      items.push({
        id: 0,
        type: 'success',
        title: 'Tout est à jour',
        desc: 'Aucune action requise pour le moment',
        href: '/dashboard/statistiques',
      });
    }

    return items.slice(0, 3);
  }, [statsHeures, statsPresence, enseignant]);

  // ─── Activités récentes ───
  const activites = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      description: string;
      time: string;
      icon: any;
      color: string;
    }> = [];

    (enseignant?.heuresSupp ?? []).slice(0, 2).forEach((h) => {
      items.push({
        id: `hs-${h.id}`,
        title: 'Heures supplémentaires',
        description: `${h.heures}h — ${h.motif ?? 'Sans motif'} (${STATUT_DEMANDE_LABEL[h.statut] ?? h.statut})`,
        time: formatDateShort(h.date),
        icon: ClockIcon,
        color:
          h.statut === 'APPROUVEE' ? 'text-emerald-600' : 'text-orange-600',
      });
    });

    (enseignant?.absences ?? []).slice(0, 2).forEach((a) => {
      items.push({
        id: `ab-${a.id}`,
        title: 'Absence',
        description: `${a.type.replace(/_/g, ' ')} — ${STATUT_DEMANDE_LABEL[a.statut] ?? a.statut}`,
        time: formatDateShort(a.dateDebut),
        icon: ExclamationTriangleIcon,
        color:
          a.statut === 'APPROUVEE' ? 'text-emerald-600' : 'text-red-600',
      });
    });

    (enseignant?.documents ?? []).slice(0, 1).forEach((d) => {
      items.push({
        id: `doc-${d.id}`,
        title: 'Document',
        description: d.titre,
        time: formatDateShort(d.createdAt),
        icon: DocumentTextIcon,
        color: 'text-purple-600',
      });
    });

    return items.slice(0, 5);
  }, [enseignant]);

  // ═══════════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════════

  if (errorEnseignant) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-lg font-bold text-gray-900">
          Impossible de charger les données de l'enseignant
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Vérifiez votre connexion ou contactez l'administrateur.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ══════════════════════════════════════════════════════
          BANNIÈRE
          ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {enseignant?.photo ? (
              <img
                src={enseignant.photo}
                alt={enseignant.nom}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-lg">
                {enseignant?.prenom?.charAt(0)?.toUpperCase() ?? 'E'}
                {enseignant?.nom?.charAt(0)?.toUpperCase() ?? ''}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-emerald-100 text-xs font-medium mb-1">
                <AcademicCapIcon className="w-4 h-4" />
                ESPACE ENSEIGNANT
              </div>
              <h2 className="text-xl md:text-2xl font-bold">
                Bonjour {enseignant?.prenom ?? user?.prenom} 👋
              </h2>
              <p className="text-sm text-emerald-100 mt-1">
                Vous avez{' '}
                <strong className="text-white">{coursJour.length} cours</strong>{' '}
                aujourd'hui • {formatDateLong(new Date())}
              </p>
              {enseignant?.matricule && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/15 backdrop-blur rounded-full text-xs font-medium mt-2">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  Matricule : {enseignant.matricule}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/dashboard/notes/saisie"
              className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Saisir des notes
            </Link>
            <Link
              to="/dashboard/mon-emploi-temps"
              className="px-4 py-2 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Mon emploi du temps
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          KPIs
          ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Link
              to={stat.href || '#'}
              className="block bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50 hover:shadow-md transition-all duration-300"
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
                    <p className="text-[10px] text-gray-400 mt-1 italic truncate">
                      {stat.hint}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor} shrink-0`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          ALERTES
          ══════════════════════════════════════════════════════ */}
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
              warning: {
                bg: 'bg-orange-50',
                text: 'text-orange-700',
                border: 'border-orange-100',
                bar: 'bg-orange-400',
              },
              info: {
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                border: 'border-blue-100',
                bar: 'bg-blue-400',
              },
              success: {
                bg: 'bg-emerald-50',
                text: 'text-emerald-700',
                border: 'border-emerald-100',
                bar: 'bg-emerald-400',
              },
            }[alerte.type];

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
                    <p className={`text-sm font-semibold ${colors.text}`}>
                      {alerte.title}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {alerte.desc}
                    </p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          COURS DU JOUR + ACTIONS RAPIDES
          ══════════════════════════════════════════════════════ */}
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
              <h3 className="font-bold text-gray-900">
                Mes cours aujourd'hui
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {coursJour.filter((c) => c.statut === 'TERMINE').length}{' '}
                terminés •{' '}
                {coursJour.filter((c) => c.statut === 'EN_COURS').length} en
                cours •{' '}
                {
                  coursJour.filter(
                    (c) =>
                      c.statut === 'A_VENIR' || c.statut === 'PROCHAIN'
                  ).length
                }{' '}
                à venir
              </p>
            </div>
            <Link
              to="/dashboard/mon-emploi-temps"
              className="text-sm text-emerald-600 font-medium hover:underline"
            >
              Voir l'emploi du temps
            </Link>
          </div>

          {coursJour.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
              Aucun cours programmé aujourd'hui
            </div>
          ) : (
            <div className="space-y-3">
              {coursJour.map((cours, index) => {
                const config = STATUT_COURS_CONFIG[cours.statut];
                const Icon =
                  cours.statut === 'EN_COURS'
                    ? PlayCircleIcon
                    : CalendarIcon;

                return (
                  <motion.div
                    key={cours.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Link
                      to={`/dashboard/mes-classes/${cours.classeId}`}
                      className={`flex items-center gap-4 p-4 rounded-xl border ${config.border} ${config.bg} hover:shadow-sm transition-all group`}
                    >
                      <div
                        className={`w-2 h-12 rounded-full ${config.badge} flex-shrink-0`}
                      />

                      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white border border-gray-100 flex-shrink-0">
                        <Icon className={`w-6 h-6 ${config.text}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-gray-900">
                            {cours.heure}
                          </p>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}
                          >
                            {config.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            • {cours.type}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 mt-1">
                          {cours.matiere} •{' '}
                          <span className="text-emerald-600">
                            {cours.classe}
                          </span>
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
          )}
        </motion.div>

        {/* Actions rapides */}
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
              {
                title: 'Saisir des notes',
                icon: PencilSquareIcon,
                bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
                href: '/dashboard/notes/saisie',
              },
              {
                title: 'Marquer présences',
                icon: ClipboardDocumentCheckIcon,
                bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
                href: '/dashboard/presences-eleves',
              },
              {
                title: 'Ajouter appréciation',
                icon: ChatBubbleLeftRightIcon,
                bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
                href: '/dashboard/appreciations',
              },
              {
                title: 'Demander heures supp.',
                icon: PlusIcon,
                bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
                href: '/dashboard/mes-heures-supp/nouveau',
              },
              {
                title: 'Poser une absence',
                icon: CalendarIcon,
                bg: 'bg-gradient-to-br from-red-500 to-red-600',
                href: '/dashboard/mes-absences/nouveau',
              },
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
                  <span className="text-sm font-semibold flex-1">
                    {action.title}
                  </span>
                  <ChevronRightIcon className="w-4 h-4 opacity-70" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════
          GRAPHIQUE : Volume horaire par jour
          ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-900">
              Mes heures de cours par jour
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Basé sur l'emploi du temps actif
            </p>
          </div>
          {loadingEDT && (
            <ArrowPathIcon className="w-4 h-4 text-emerald-600 animate-spin" />
          )}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={evolutionMoyennes}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="colorMoyenne"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                formatter={(v) => `${Number(v).toFixed(1)}h`}
              />
              <Area
                type="monotone"
                dataKey="moyenne"
                stroke="#10B981"
                strokeWidth={3}
                fill="url(#colorMoyenne)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          RADAR COMPÉTENCES + RÉPARTITION
          ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">
                Mes indicateurs clés
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Basé sur présence & charge horaire
              </p>
            </div>
            <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full font-bold">
              Taux présence {statsPresence?.tauxPresence ?? 0}%
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarCompetences}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis
                  dataKey="competence"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                />
                <Radar
                  name="Score"
                  dataKey="valeur"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    fontSize: 12,
                  }}
                  formatter={(v) => `${v}%`}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">
                Répartition des classes
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Par matière enseignée
              </p>
            </div>
            <span className="text-xs text-gray-400">
              Total : {mesClasses.length} classes
            </span>
          </div>
          {repartitionNotes.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              Aucune affectation
            </div>
          ) : (
            <>
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
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #E2E8F0',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {repartitionNotes.map((item) => (
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
                      {item.value} classe{item.value > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MES CLASSES
          ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">Mes classes</h3>
          </div>
          <Link
            to="/dashboard/mes-classes"
            className="text-sm text-emerald-600 font-medium hover:underline"
          >
            Voir toutes mes classes
          </Link>
        </div>

        {mesClasses.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400">
            Aucune classe ne vous est affectée pour le moment
          </div>
        ) : (
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
                  to={`/dashboard/mes-classes/${classe.classeId}`}
                  className="block bg-white rounded-xl p-4 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-emerald-50">
                      <BookOpenIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-xs text-gray-400">
                      {classe.heuresHebdo}h/sem
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {classe.nom}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {classe.matiere}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <UserGroupIcon className="w-3.5 h-3.5" />
                      {classe.eleves} élèves
                    </div>
                    <span className="text-xs font-medium text-emerald-600">
                      {classe.heuresHebdo}h
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          HEURES SUPP + ABSENCES
          ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heures supp */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-gray-900">
                Mes heures supplémentaires
              </h3>
            </div>
            <Link
              to="/dashboard/mes-heures-supp"
              className="text-sm text-emerald-600 font-medium hover:underline"
            >
              Voir tout
            </Link>
          </div>

          <div className="mb-4 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-700 font-medium">
                  Total validé
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatNumber(statsHeures?.totalHeuresSupp ?? 0)}h
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-orange-700 font-medium">
                  En attente
                </p>
                <p className="text-lg font-bold text-orange-900">
                  {formatNumber(statsHeures?.heuresSuppEnAttente ?? 0)}h
                </p>
              </div>
            </div>
          </div>

          {heuresSuppList.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Aucune heure supplémentaire enregistrée
            </p>
          ) : (
            <div className="space-y-2">
              {heuresSuppList.map((hs, index) => {
                const config =
                  STATUT_DEMANDE_CONFIG[hs.statut] ??
                  STATUT_DEMANDE_CONFIG.BROUILLON;
                return (
                  <motion.div
                    key={hs.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-orange-600">
                        {hs.heures}h
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {hs.motif}
                      </p>
                      <p className="text-xs text-gray-500">{hs.date}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-bold ${config.bg} ${config.text}`}
                    >
                      {STATUT_DEMANDE_LABEL[hs.statut] ?? hs.statut}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Absences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-gray-900">Mes absences</h3>
            </div>
            <Link
              to="/dashboard/mes-absences"
              className="text-xs text-emerald-600 font-medium hover:underline"
            >
              Voir tout
            </Link>
          </div>

          {mesAbsences.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Aucune absence enregistrée
            </p>
          ) : (
            <div className="space-y-2">
              {mesAbsences.map((ab, index) => {
                const config =
                  STATUT_DEMANDE_CONFIG[ab.statut] ??
                  STATUT_DEMANDE_CONFIG.BROUILLON;
                return (
                  <motion.div
                    key={ab.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-red-600 text-center leading-tight">
                        {ab.duree}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {ab.motif}
                      </p>
                      <p className="text-[10px] text-gray-500">{ab.date}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-bold ${config.bg} ${config.text}`}
                    >
                      {STATUT_DEMANDE_LABEL[ab.statut] ?? ab.statut}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}

          <Link
            to="/dashboard/mes-absences/nouveau"
            className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Poser une absence
          </Link>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MA PAIE + MES PRÉSENCES
          ══════════════════════════════════════════════════════ */}
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
            <Link
              to="/dashboard/ma-paie"
              className="text-sm text-emerald-600 font-medium hover:underline"
            >
              Voir tout
            </Link>
          </div>

          {enseignant?.resumeSalaire && (
            <div className="mb-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-700 font-medium">
                    Net à percevoir (
                    {enseignant.resumeSalaire.periode?.nom ??
                      STATUT_PAIE_LABEL[enseignant.resumeSalaire.statut] ??
                      'Prévisionnel'}
                    )
                  </p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {formatMoney(enseignant.resumeSalaire.totalNet, devise)}
                  </p>
                  <p className="text-[10px] text-emerald-600 mt-1">
                    Base : {formatMoney(enseignant.resumeSalaire.salaireBase, devise)}{' '}
                    • H. supp :{' '}
                    {formatMoney(
                      enseignant.resumeSalaire.montantHeuresSupp,
                      devise
                    )}
                  </p>
                </div>
                {enseignant.resumeSalaire.statut === 'PAYEE' ? (
                  <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
                ) : (
                  <ClockIcon className="w-10 h-10 text-orange-500" />
                )}
              </div>
            </div>
          )}

          {paiesRecentes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Aucune paie enregistrée pour le moment
            </p>
          ) : (
            <div className="space-y-2">
              {paiesRecentes.map((p, index) => {
                const config =
                  STATUT_PAIE_CONFIG[p.statut] ??
                  STATUT_PAIE_CONFIG.BROUILLON;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-emerald-600 text-center leading-tight">
                        {p.mois.slice(0, 6)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Salaire net
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.payeLe
                          ? `Payé le ${formatDateShort(p.payeLe)}`
                          : 'En attente de paiement'}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {formatMoney(p.net, devise)}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-bold ${config.bg} ${config.text}`}
                    >
                      {STATUT_PAIE_LABEL[p.statut] ?? p.statut}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Présences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-gray-900">Mes présences</h3>
            </div>
            <Link
              to="/dashboard/mes-presences"
              className="text-xs text-emerald-600 font-medium hover:underline"
            >
              Voir tout
            </Link>
          </div>

          <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700 font-medium">
                  Taux de présence
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {statsPresence?.tauxPresence ?? 0}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-700 font-medium">
                  Jours suivis
                </p>
                <p className="text-lg font-bold text-blue-900">
                  {statsPresence?.totalJours ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {[
              {
                label: 'Présent',
                value: statsPresence?.presencesPresentes ?? 0,
                color: 'bg-emerald-50 text-emerald-600',
                bar: 'bg-emerald-500',
              },
              {
                label: 'Retard',
                value: statsPresence?.presencesRetard ?? 0,
                color: 'bg-orange-50 text-orange-600',
                bar: 'bg-orange-500',
              },
              {
                label: 'Absent',
                value: statsPresence?.presencesAbsent ?? 0,
                color: 'bg-red-50 text-red-600',
                bar: 'bg-red-500',
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.color}`}
                  >
                    {item.value}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.bar} rounded-full`}
                    style={{
                      width: `${
                        (statsPresence?.totalJours ?? 0) > 0
                          ? (item.value /
                              (statsPresence?.totalJours ?? 1)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════
          ACTIVITÉS RÉCENTES
          ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900">Activités récentes</h3>
          <Link
            to="/dashboard/activites"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            Voir tout
          </Link>
        </div>

        {activites.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Aucune activité récente
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activites.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + index * 0.05 }}
                className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors"
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
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          RACCOURCIS
          ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Mes classes',
            desc: `${nbClasses} classe(s)`,
            icon: AcademicCapIcon,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/dashboard/mes-classes',
          },
          {
            title: 'Mes présences',
            desc: `${statsPresence?.tauxPresence ?? 0}% présence`,
            icon: ClipboardDocumentCheckIcon,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            href: '/dashboard/mes-presences',
          },
          {
            title: 'Mes avances',
            desc: 'Demander une avance',
            icon: CurrencyDollarIcon,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            href: '/dashboard/mes-avances',
          },
          {
            title: 'Mes réclamations',
            desc: 'Signaler un problème',
            icon: ChatBubbleOvalLeftEllipsisIcon,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            href: '/dashboard/mes-reclamations',
          },
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
              <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                {item.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          CITATION
          ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 rounded-2xl border border-emerald-100"
      >
        <div className="flex items-start gap-3">
          <SparklesIcon className="w-6 h-6 text-emerald-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 italic">
              "Un enseignant est celui qui aide à découvrir, pas celui qui
              dicte."
            </p>
            <p className="text-xs text-gray-500 mt-1">
              — Proverbe pédagogique
            </p>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════ */}
      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-200">
        <p>© {new Date().getFullYear()} EduManage. Tous droits réservés.</p>
        <p className="mt-1">Version 1.0.0 • Made with ❤️</p>
      </footer>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium z-50">
          <ArrowPathIcon className="w-4 h-4 animate-spin" />
          Chargement des données…
        </div>
      )}
    </div>
  );
};

export default EnseignantDashboardPage;