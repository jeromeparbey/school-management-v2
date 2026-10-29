// frontend2/src/pages/dashboard/directeur/inscriptions/InscriptionDetailPage.tsx

import React, { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  AcademicCapIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  IdentificationIcon,
  BuildingOffice2Icon,
  BanknotesIcon,
  ReceiptPercentIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import {
  useInscription,
  useSoftDeleteInscription,
  useInscriptions,
} from '../../../../hooks/useInscriptions';

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const formatMoney = (n: number | null | undefined) => {
  if (n == null) return '0 F CFA';
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' F CFA';
};

const formatDate = (d: string | null | undefined): string => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTime = (d: string | null | undefined): string => {
  if (!d) return '—';
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MOYENS_LABEL: Record<string, string> = {
  ESPECES: 'Espèces',
  VIREMENT: 'Virement',
  MOBILE_MONEY: 'Mobile Money',
  CARTE: 'Carte',
  CHEQUE: 'Chèque',
  AUTRE: 'Autre',
};

const STATUT_ECHEANCE_META: Record<
  string,
  { bg: string; text: string; label: string; icon: any }
> = {
  PAYEE: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    label: 'Payée',
    icon: CheckCircleIcon,
  },
  PARTIELLE: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    label: 'Partielle',
    icon: CurrencyDollarIcon,
  },
  IMPAYEE: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    label: 'Impayée',
    icon: XCircleIcon,
  },
  EN_RETARD: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    label: 'En retard',
    icon: ExclamationTriangleIcon,
  },
};

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

type TabKey = 'overview' | 'plan' | 'paiements' | 'historique';

const InscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: inscription, isLoading, isError } = useInscription(id);
  const softDelete = useSoftDeleteInscription();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Charger les inscriptions de la classe/année pour afficher les élèves
  const { data: inscriptionsClasseData } = useInscriptions({
    classeId: inscription?.classeId,
    anneeScolaireId: inscription?.anneeScolaireId,
    estActive: true,
    limit: 200,
  });

  const inscriptionsClasse = useMemo(() => {
    if (!inscriptionsClasseData) return [];
    const any = inscriptionsClasseData as any;
    if (Array.isArray(any.inscriptions)) return any.inscriptions;
    if (Array.isArray(any.data)) return any.data;
    return [];
  }, [inscriptionsClasseData]);

  const elevesDeLaClasse = useMemo(() => {
    return inscriptionsClasse.map((i: any) => ({
      id: i.id,
      eleve: i.eleve,
      dateInscription: i.dateInscription,
      estActive: i.estActive,
    }));
  }, [inscriptionsClasse]);

  const handleDelete = () => {
    if (!id || !inscription) return;
    const nom = `${inscription.eleve?.prenom ?? ''} ${inscription.eleve?.nom ?? ''}`;
    if (!window.confirm(`Désactiver l'inscription de "${nom}" ?`)) return;
    softDelete.mutate(id, {
      onSuccess: () => navigate('/dashboard/inscriptions'),
    });
  };

  // ─────────── Loading ───────────
  if (isLoading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto space-y-6">
        <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  // ─────────── Erreur ───────────
  if (isError || !inscription) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Inscription introuvable</p>
        <p className="text-sm text-gray-500 mt-1">
          Cette inscription a peut-être été supprimée ou désactivée.
        </p>
        <Link
          to="/dashboard/inscriptions"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  const eleveNom = `${inscription.eleve?.prenom ?? ''} ${inscription.eleve?.nom ?? ''}`.trim();
  const hasBeenUpdated =
    new Date(inscription.updatedAt).getTime() >
    new Date(inscription.createdAt).getTime() + 1000;

  const plan = inscription.planScolarite ?? null;
  const resumeFinancier = inscription.resumeFinancier ?? null;
  const paiements = inscription.paiements ?? [];
  const echeances = resumeFinancier?.echeances ?? [];

  const capacite = inscription.classe?.capacite ?? null;
  const nbInscrits = elevesDeLaClasse.filter(
    (e : any) => e.estActive
  ).length;
  const placesRestantes =
    capacite != null ? Math.max(0, capacite - nbInscrits) : null;

  const totalPaye = resumeFinancier?.totalPaye ?? 0;
  const restant = resumeFinancier?.restant ?? 0;
  const montantTotal = resumeFinancier?.duTheorique ?? plan?.montantTotal ?? 0;
  const tauxPaiement = resumeFinancier?.tauxPaiement ?? 0;

  const echeancesPayees = echeances.filter(
    (e: any) => e.statut === 'PAYEE'
  ).length;
  const echeancesPartielles = echeances.filter(
    (e: any) => e.statut === 'PARTIELLE'
  ).length;
  const echeancesImpayees = echeances.filter(
    (e: any) => e.statut === 'IMPAYEE' || e.statut === 'EN_RETARD'
  ).length;

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* ═══════════ BREADCRUMB + ACTIONS ═══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard/eleves/inscriptions"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Link
                to="/dashboard/eleves/inscriptions"
                className="hover:text-gray-700"
              >
                Inscriptions
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate">
                {eleveNom || 'Détail'}
              </span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 truncate">
              <AcademicCapIcon className="w-7 h-7 text-emerald-600 shrink-0" />
              Détail de l'inscription
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/dashboard/inscriptions/${inscription.id}/editer`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 border border-amber-200"
          >
            <PencilSquareIcon className="w-4 h-4" />
            Éditer
          </Link>
          {inscription.estActive && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={softDelete.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 border border-red-200 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              Désactiver
            </button>
          )}
        </div>
      </div>

      {/* ═══════════ LAYOUT 2 COLONNES ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─────────── COLONNE PRINCIPALE ─────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ─── Statut ─── */}
          <div
            className={`rounded-2xl border p-5 ${
              inscription.estActive
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {inscription.estActive ? (
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <XCircleIcon className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`font-semibold ${
                      inscription.estActive
                        ? 'text-emerald-800'
                        : 'text-gray-700'
                    }`}
                  >
                    {inscription.estActive
                      ? 'Inscription active'
                      : 'Inscription inactive'}
                  </p>
                  {inscription.estActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      En cours
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    inscription.estActive
                      ? 'text-emerald-700'
                      : 'text-gray-500'
                  }`}
                >
                  {inscription.estActive
                    ? "L'élève est actuellement inscrit dans cette classe pour cette année scolaire."
                    : "Cette inscription a été désactivée. L'élève n'est plus compté dans cette classe."}
                </p>
              </div>
            </div>
          </div>

          {/* ─── Élève + Classe + Année ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <UserCircleIcon className="w-4 h-4 text-emerald-500" />
                Élève inscrit
              </h2>
              {inscription.eleve?.id && (
                <Link
                  to={`/dashboard/eleves/${inscription.eleve.id}`}
                  className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline font-medium"
                >
                  Voir la fiche
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                {inscription.eleve?.prenom?.[0]}
                {inscription.eleve?.nom?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-lg truncate">
                  {inscription.eleve?.prenom} {inscription.eleve?.nom}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                    <IdentificationIcon className="w-3.5 h-3.5" />
                    {inscription.eleve?.matricule}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      inscription.eleve?.statut === 'ACTIF'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {inscription.eleve?.statut}
                  </span>
                </div>
              </div>
            </div>

            {/* Classe + Année en dessous */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <BuildingOffice2Icon className="w-3.5 h-3.5" />
                  Classe
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-base font-bold text-gray-900">
                    {inscription.classe?.nom ?? '—'}
                  </p>
                  {inscription.classe?.code && (
                    <span className="text-xs font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                      {inscription.classe.code}
                    </span>
                  )}
                </div>
                {capacite != null && (
                  <p className="text-xs text-gray-500 mt-1">
                    {nbInscrits} / {capacite} inscrits
                    {placesRestantes != null && (
                      <>
                        {' — '}
                        <strong className="text-emerald-700">
                          {placesRestantes} place(s) restante(s)
                        </strong>
                      </>
                    )}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <CalendarDaysIcon className="w-3.5 h-3.5" />
                  Année scolaire
                </p>
                <p className="text-base font-bold text-gray-900 mt-1">
                  {inscription.anneeScolaire?.nom ?? '—'}
                </p>
                {inscription.anneeScolaire?.estActive && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Année active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ─── ONGLETS ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex overflow-x-auto border-b border-gray-100">
              {[
                {
                  key: 'overview',
                  label: "Vue d'ensemble",
                  icon: ChartBarIcon,
                },
                {
                  key: 'plan',
                  label: 'Plan & frais',
                  icon: ReceiptPercentIcon,
                  badge: echeances.length,
                },
                {
                  key: 'paiements',
                  label: 'Paiements',
                  icon: BanknotesIcon,
                  badge: paiements.length,
                },
                {
                  key: 'historique',
                  label: 'Historique',
                  icon: ClockIcon,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabKey)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-600 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* ═══ VUE D'ENSEMBLE ═══ */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  {/* Stats rapides */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Total dû</p>
                      <p className="text-base font-bold text-gray-900 mt-0.5">
                        {formatMoney(montantTotal)}
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <p className="text-xs text-emerald-700">Payé</p>
                      <p className="text-base font-bold text-emerald-800 mt-0.5">
                        {formatMoney(totalPaye)}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3">
                      <p className="text-xs text-red-700">Restant</p>
                      <p className="text-base font-bold text-red-800 mt-0.5">
                        {formatMoney(restant)}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs text-blue-700">Taux</p>
                      <p className="text-base font-bold text-blue-800 mt-0.5">
                        {tauxPaiement}%
                      </p>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-700">
                        Progression du paiement
                      </p>
                      <p className="text-xs font-bold text-gray-900">
                        {tauxPaiement}%
                      </p>
                    </div>
                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          tauxPaiement >= 100
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                            : echeancesImpayees > 0
                            ? 'bg-gradient-to-r from-orange-400 to-red-500'
                            : 'bg-gradient-to-r from-blue-400 to-blue-600'
                        }`}
                        style={{ width: `${Math.min(100, tauxPaiement)}%` }}
                      />
                    </div>
                  </div>

                  {/* Répartition des échéances */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-xl font-bold text-emerald-600">
                        {echeancesPayees}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Payées</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-600">
                        {echeancesPartielles}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Partielles</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-red-600">
                        {echeancesImpayees}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Impayées</p>
                    </div>
                  </div>

                  {/* Liste des élèves de la classe */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <UserGroupIcon className="w-3.5 h-3.5" />
                        Élèves inscrits dans cette classe
                      </h4>
                      <span className="text-xs text-gray-500">
                        {nbInscrits} élève(s)
                      </span>
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {elevesDeLaClasse.map((ins: any) => (
                        <Link
                          key={ins.id}
                          to={`/dashboard/inscriptions/${ins.id}`}
                          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                            ins.id === inscription.id
                              ? 'bg-emerald-50 border border-emerald-200'
                              : 'border border-transparent'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              ins.eleve?.sexe === 'F'
                                ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                                : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                            }`}
                          >
                            {ins.eleve?.prenom?.[0]}
                            {ins.eleve?.nom?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {ins.eleve?.prenom} {ins.eleve?.nom}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Inscrit le {formatDate(ins.dateInscription)}
                            </p>
                          </div>
                          {ins.id === inscription.id && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                              Vous
                            </span>
                          )}
                          {!ins.estActive && (
                            <span className="text-[10px] text-gray-500">
                              Inactif
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ PLAN & FRAIS ═══ */}
              {activeTab === 'plan' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  {!plan ? (
                    <div className="text-center py-8 text-gray-500">
                      <ReceiptPercentIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucun plan de scolarité associé.</p>
                    </div>
                  ) : (
                    <>
                      {/* Infos plan */}
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Plan</span>
                          <span className="font-semibold text-gray-900">
                            {plan.nom}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Frais d'inscription
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatMoney(plan.fraisInscription)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Frais de scolarité
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatMoney(plan.fraisScolarite)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                          <span className="font-medium text-gray-700">
                            Total plan
                          </span>
                          <span className="font-bold text-gray-900 text-base">
                            {formatMoney(plan.montantTotal)}
                          </span>
                        </div>
                      </div>

                      {/* Échéances */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <DocumentTextIcon className="w-3.5 h-3.5" />
                          Échéances ({echeances.length})
                        </h4>

                        {echeances.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">
                            Aucune échéance enregistrée.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {echeances.map((e: any) => {
                              const meta =
                                STATUT_ECHEANCE_META[e.statut] ??
                                STATUT_ECHEANCE_META.IMPAYEE;
                              const Icon = meta.icon;
                              const pct =
                                e.montant > 0
                                  ? Math.min(100, (e.paye / e.montant) * 100)
                                  : 0;

                              return (
                                <div
                                  key={e.id}
                                  className="bg-white rounded-xl border border-gray-200 p-3"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                                        {e.ordre + 1}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {e.nom}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                          Limite :{' '}
                                          {formatDate(e.dateLimite)}
                                        </p>
                                      </div>
                                    </div>
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.bg} ${meta.text} shrink-0`}
                                    >
                                      <Icon className="w-3 h-3" />
                                      {meta.label}
                                    </span>
                                  </div>

                                  {/* Progression */}
                                  <div className="mt-2">
                                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                      <div
                                        className={`h-full ${
                                          pct >= 100
                                            ? 'bg-emerald-500'
                                            : e.statut === 'EN_RETARD'
                                            ? 'bg-red-500'
                                            : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Montants */}
                                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                                    <div>
                                      <p className="text-gray-500">Total</p>
                                      <p className="font-semibold text-gray-900">
                                        {formatMoney(e.montant)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Payé</p>
                                      <p className="font-semibold text-emerald-700">
                                        {formatMoney(e.paye)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Restant</p>
                                      <p
                                        className={`font-semibold ${
                                          e.restant > 0.01
                                            ? 'text-red-600'
                                            : 'text-gray-400'
                                        }`}
                                      >
                                        {formatMoney(e.restant)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* ═══ PAIEMENTS ═══ */}
              {activeTab === 'paiements' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {paiements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BanknotesIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Aucun paiement enregistré</p>
                      <p className="text-xs mt-1">
                        Les paiements apparaîtront ici une fois encaissés.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          {paiements.length} paiement(s)
                        </h4>
                        <Link
                          to={`/dashboard/paiements?eleveId=${inscription.eleveId}`}
                          className="text-xs text-emerald-600 hover:underline font-medium"
                        >
                          Voir tous les paiements →
                        </Link>
                      </div>

                      <div className="space-y-2">
                        {paiements.map((p: any) => (
                          <Link
                            key={p.id}
                            to={`/dashboard/paiements/${p.id}`}
                            className="block bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-mono font-medium text-gray-900">
                                    {p.reference}
                                  </p>
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                      p.statut === 'COMPLET'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}
                                  >
                                    {p.statut}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {formatDateTime(p.datePaiement)} —{' '}
                                  {MOYENS_LABEL[p.moyen] ?? p.moyen}
                                  {p.caissier &&
                                    ` — par ${p.caissier.prenom} ${p.caissier.nom}`}
                                </p>
                                {p.allocations?.length > 0 && (
                                  <p className="text-[10px] text-emerald-600 mt-0.5">
                                    {p.allocations.length} échéance(s) couverte(s)
                                  </p>
                                )}
                              </div>
                              <p className="text-sm font-bold text-gray-900 shrink-0">
                                {formatMoney(p.montant)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* ═══ HISTORIQUE ═══ */}
              {activeTab === 'historique' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ol className="relative border-l-2 border-gray-200 ml-2 space-y-6">
                    <li className="ml-6">
                      <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          Inscription créée
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(inscription.createdAt)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Date d'inscription effective :{' '}
                        <strong>{formatDate(inscription.dateInscription)}</strong>
                      </p>
                    </li>

                    {hasBeenUpdated && (
                      <li className="ml-6">
                        <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow" />
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            Dernière modification
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(inscription.updatedAt)}
                          </p>
                        </div>
                      </li>
                    )}

                    <li className="ml-6">
                      <div
                        className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 border-white shadow ${
                          inscription.estActive
                            ? 'bg-emerald-500'
                            : 'bg-gray-400'
                        }`}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {inscription.estActive
                            ? 'Statut actuel : active'
                            : 'Statut actuel : inactive'}
                        </p>
                      </div>
                    </li>
                  </ol>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* ─────────── SIDEBAR ─────────── */}
        <div className="space-y-4">
          {/* Actions rapides */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Actions rapides
            </h3>
            <div className="space-y-2">
              <Link
                to={`/dashboard/inscriptions/${inscription.id}/editer`}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 font-medium"
              >
                <PencilSquareIcon className="w-4 h-4 text-amber-600" />
                Éditer l'inscription
              </Link>
              {inscription.eleve?.id && (
                <Link
                  to={`/dashboard/eleves/${inscription.eleve.id}`}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 font-medium"
                >
                  <UserCircleIcon className="w-4 h-4 text-blue-600" />
                  Voir la fiche élève
                </Link>
              )}
              {inscription.classe?.id && (
                <Link
                  to={`/dashboard/classes/${inscription.classe.id}`}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 font-medium"
                >
                  <AcademicCapIcon className="w-4 h-4 text-indigo-600" />
                  Voir la classe
                </Link>
              )}
              {inscription.eleve?.id && (
                <Link
                  to={`/dashboard/paiements?eleveId=${inscription.eleve.id}`}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 font-medium"
                >
                  <BanknotesIcon className="w-4 h-4 text-emerald-600" />
                  Paiements de l'élève
                </Link>
              )}
              {inscription.estActive && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={softDelete.isPending}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 font-medium disabled:opacity-50"
                >
                  <TrashIcon className="w-4 h-4" />
                  Désactiver l'inscription
                </button>
              )}
            </div>
          </div>

          {/* Récap financier */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-5 text-white">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-90 mb-3 flex items-center gap-1.5">
              <ChartBarIcon className="w-4 h-4" />
              Récapitulatif financier
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-80">Total dû</span>
                <span className="font-semibold">{formatMoney(montantTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">Payé</span>
                <span className="font-semibold text-emerald-200">
                  {formatMoney(totalPaye)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/20">
                <span className="font-medium">Restant</span>
                <span
                  className={`font-bold text-lg ${
                    restant > 0.01 ? 'text-amber-200' : 'text-emerald-200'
                  }`}
                >
                  {formatMoney(restant)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="opacity-80 text-xs">Taux</span>
                <div className="flex items-center gap-2 flex-1 ml-3">
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all"
                      style={{ width: `${Math.min(100, tauxPaiement)}%` }}
                    />
                  </div>
                  <span className="font-bold text-xs shrink-0">
                    {tauxPaiement}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info technique */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Informations
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-gray-500">ID inscription</dt>
                <dd className="font-mono text-xs text-gray-900 mt-0.5 break-all">
                  {inscription.id}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Élève (ID)</dt>
                <dd className="font-mono text-xs text-gray-900 mt-0.5 break-all">
                  {inscription.eleveId}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Classe (ID)</dt>
                <dd className="font-mono text-xs text-gray-900 mt-0.5 break-all">
                  {inscription.classeId}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Année (ID)</dt>
                <dd className="font-mono text-xs text-gray-900 mt-0.5 break-all">
                  {inscription.anneeScolaireId}
                </dd>
              </div>
            </dl>
          </div>

          {/* Aide */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-800">
                  À propos de la désactivation
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  La désactivation ne supprime pas l'inscription. Elle sera
                  conservée dans l'historique mais ne sera plus comptée comme
                  active.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscriptionDetailPage;