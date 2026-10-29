// frontend2/src/pages/dashboard/directeur/paiements/PaiementDetailPage.tsx

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  TrashIcon,
  BanknotesIcon,
  UserCircleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon,
  ReceiptPercentIcon,
  ClockIcon,
  IdentificationIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowTrendingDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import {
  usePaiement,
  useAnnulerPaiement,
  useHardDeletePaiement,
} from '../../../../hooks/usePaiements';
import {
  useGenererRecu,
  useDownloadRecuPDF,
  usePreviewRecuPDF,
} from '../../../../hooks/useRecus';
import { useToast } from '../../../../context/ToastContext';

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════

const MOYENS_LABEL: Record<string, string> = {
  ESPECES: 'Espèces',
  VIREMENT: 'Virement',
  MOBILE_MONEY: 'Mobile Money',
  CARTE: 'Carte',
  CHEQUE: 'Chèque',
  AUTRE: 'Autre',
};

/** 💰 F CFA */
const formatMoney = (n: number | null | undefined) => {
  if (n == null) return '0 F CFA';
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' F CFA';
};

/** 📅 Date string */
const formatDateStr = (d: string | null | undefined): string => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/** 🕐 Heure string */
const formatHeureStr = (d: string | null | undefined): string => {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Extrait les tranches avec leur résumé */
function getTranches(paiement: any) {
  if (!Array.isArray(paiement?.allocations)) return [];
  return paiement.allocations.map((alloc: any) => {
    const tranche = alloc.tranche ?? null;
    const meta = alloc._meta ?? null;
    return {
      id: alloc.id,
      echeanceId: alloc.echeanceId,
      nom: tranche?.nom ?? alloc.echeance?.nom ?? '—',
      ordre: tranche?.ordre ?? alloc.echeance?.ordre ?? 0,
      dateLimite: tranche?.dateLimite ?? alloc.echeance?.dateLimite,
      montantTotal: tranche?.montantTotal ?? alloc.echeance?.montant ?? 0,
      totalPaye: tranche?.totalPaye ?? meta?.totalPayeApres ?? alloc.montant ?? 0,
      restant: tranche?.restant ?? meta?.restantApres ?? 0,
      montantAlloue: alloc.montant ?? 0,
      statut: tranche?.statut ?? meta?.statut ?? 'IMPAYEE',
      enRetard: tranche?.enRetard ?? meta?.enRetard ?? false,
      joursRetard: tranche?.joursRetard ?? meta?.joursRetard ?? 0,
      historique: tranche?.historique ?? meta?.paiementsAnterieurs ?? [],
      nombrePaiements: tranche?.nombrePaiements ?? 0,
    };
  });
}

// ══════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════

const PaiementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: paiement, isLoading, isError, refetch } = usePaiement(id);
  const annulerMutation = useAnnulerPaiement();
  const hardDeleteMutation = useHardDeletePaiement();

  // Reçus
  const genererRecu = useGenererRecu();
  const downloadPDF = useDownloadRecuPDF();
  const previewPDF = usePreviewRecuPDF();

  const [showAnnuler, setShowAnnuler] = useState(false);
  const [motifAnnulation, setMotifAnnulation] = useState('');
  const [showHardDelete, setShowHardDelete] = useState(false);
  const [expandedTranche, setExpandedTranche] = useState<string | null>(null);

  const handleAnnuler = async () => {
    if (!id) return;
    if (motifAnnulation.trim().length < 3) {
      toast.warning('Motif trop court', 'Minimum 3 caractères.');
      return;
    }
    try {
      await annulerMutation.mutateAsync({
        id,
        payload: { motifAnnulation: motifAnnulation.trim() },
      });
      setShowAnnuler(false);
      setMotifAnnulation('');
    } catch {
      /* toasté */
    }
  };

  const handleHardDelete = async () => {
    if (!id) return;
    try {
      await hardDeleteMutation.mutateAsync(id);
      navigate('/dashboard/paiements');
    } catch {
      /* toasté */
    }
  };

  /** Garantit qu'un reçu existe pour ce paiement, sinon le génère */
  const ensureRecu = async (): Promise<{
    id: string;
    numeroRecu: string;
  } | null> => {
    if (!paiement) return null;
    if (paiement.recu?.id && paiement.recu?.numeroRecu) {
      return {
        id: paiement.recu.id,
        numeroRecu: paiement.recu.numeroRecu,
      };
    }
    try {
      const res = await genererRecu.mutateAsync({ paiementId: paiement.id });
      const created = (res as any)?.data ?? res;
      if (created?.id && created?.numeroRecu) {
        return { id: created.id, numeroRecu: created.numeroRecu };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handlePreviewRecu = async () => {
    const recu = await ensureRecu();
    if (!recu) return;
    previewPDF.mutate({ id: recu.id, format: 'A4' });
  };

  const handleDownloadRecu = async (format: 'A4' | 'A5' | '80MM' = 'A4') => {
    const recu = await ensureRecu();
    if (!recu) return;
    downloadPDF.mutate({
      id: recu.id,
      numeroRecu: recu.numeroRecu,
      format,
    });
  };

  const isPendingPDF = downloadPDF.isPending || previewPDF.isPending;

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
  if (isError || !paiement) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Paiement introuvable</p>
        <Link
          to="/dashboard/paiements"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  const eleveNom = `${paiement.eleve?.prenom ?? ''} ${paiement.eleve?.nom ?? ''}`.trim();
  const canAnnuler = paiement.statut === 'COMPLET';
  const canHardDelete = paiement.statut === 'ANNULE';
  const hasRecu = !!paiement.recu?.id;

  // ─── Tranches ───
  const tranches = getTranches(paiement);

  // ─── Totaux ───
  const totalAlloue = (paiement.allocations ?? []).reduce(
    (s: number, a: any) => s + (a.montant ?? 0),
    0
  );
  const resteNonAlloue = Math.max(0, (paiement.montant ?? 0) - totalAlloue);
  const resteGlobal = tranches.reduce((s: number, t: any) => s + t.restant, 0);
  const tranchesEnRetard = tranches.filter((t: any) => t.enRetard).length;
  const tranchesSoldees = tranches.filter((t: any) => t.statut === 'PAYEE').length;

  // ─── Classe ───
  const classeActive =
    paiement.eleve?.inscriptions?.find((i: any) => i.estActive)?.classe ?? null;

  // ─── Dates ───
  const datePaiementStr = formatDateStr(paiement.datePaiement);
  const heurePaiementStr = formatHeureStr(paiement.datePaiement);

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* ═══════════════════════════════════════════
          BREADCRUMB + ACTIONS
          ═══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard/paiements"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Link to="/dashboard/paiements" className="hover:text-gray-700">
                Paiements
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium font-mono truncate">
                {paiement.reference}
              </span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 truncate">
              <BanknotesIcon className="w-7 h-7 text-emerald-600 shrink-0" />
              Détail du paiement
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* 🆕 Voir le reçu */}
          {hasRecu && (
            <Link
              to={`/dashboard/recus/${paiement.recu!.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-blue-200 text-blue-700 font-medium rounded-lg hover:bg-blue-50"
            >
              <DocumentTextIcon className="w-4 h-4" />
              Voir le reçu
            </Link>
          )}

          {/* 🆕 Aperçu PDF */}
          <button
            type="button"
            onClick={handlePreviewRecu}
            disabled={isPendingPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 font-medium rounded-lg hover:bg-purple-100 border border-purple-200 disabled:opacity-50"
          >
            <PrinterIcon className="w-4 h-4" />
            Aperçu
          </button>

          {/* 🆕 Télécharger A4 */}
          <button
            type="button"
            onClick={() => handleDownloadRecu('A4')}
            disabled={isPendingPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            PDF A4
          </button>

          {/* 🆕 Ticket 80mm */}
          <button
            type="button"
            onClick={() => handleDownloadRecu('80MM')}
            disabled={isPendingPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <ReceiptPercentIcon className="w-4 h-4" />
            Ticket 80mm
          </button>

          {canAnnuler && (
            <button
              type="button"
              onClick={() => setShowAnnuler(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600"
            >
              <XCircleIcon className="w-4 h-4" />
              Annuler
            </button>
          )}

          {canHardDelete && (
            <button
              type="button"
              onClick={() => setShowHardDelete(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800"
            >
              <TrashIcon className="w-4 h-4" />
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          STATS RAPIDES
          ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Montant encaissé</p>
          <p className="text-xl font-bold text-emerald-700 mt-1 truncate">
            {formatMoney(paiement.montant)}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {datePaiementStr} · {heurePaiementStr}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Alloué aux tranches</p>
          <p className="text-xl font-bold text-blue-700 mt-1 truncate">
            {formatMoney(totalAlloue)}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {tranches.length} tranche(s)
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Reste sur tranches</p>
          <p
            className={`text-xl font-bold mt-1 truncate ${
              resteGlobal > 0.01 ? 'text-red-600' : 'text-gray-400'
            }`}
          >
            {formatMoney(resteGlobal)}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {tranchesSoldees}/{tranches.length} soldée(s)
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Moyen de paiement</p>
          <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
            {MOYENS_LABEL[paiement.moyen] ?? paiement.moyen}
          </p>
          {paiement.referenceMoyen && (
            <p className="text-[10px] font-mono text-gray-400 mt-0.5 truncate">
              {paiement.referenceMoyen}
            </p>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          LAYOUT 2 COLONNES
          ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─────────── COLONNE PRINCIPALE ─────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statut */}
          <div
            className={`rounded-2xl border p-5 ${
              paiement.statut === 'COMPLET'
                ? 'bg-emerald-50 border-emerald-200'
                : paiement.statut === 'ANNULE'
                ? 'bg-red-50 border-red-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  paiement.statut === 'COMPLET'
                    ? 'bg-emerald-100'
                    : paiement.statut === 'ANNULE'
                    ? 'bg-red-100'
                    : 'bg-amber-100'
                }`}
              >
                {paiement.statut === 'COMPLET' ? (
                  <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`font-semibold ${
                      paiement.statut === 'COMPLET'
                        ? 'text-emerald-800'
                        : paiement.statut === 'ANNULE'
                        ? 'text-red-800'
                        : 'text-amber-800'
                    }`}
                  >
                    {paiement.statut === 'COMPLET' && 'Paiement complet'}
                    {paiement.statut === 'ANNULE' && 'Paiement annulé'}
                    {paiement.statut === 'REMBOURSE' && 'Paiement remboursé'}
                  </p>
                  {paiement.statut === 'COMPLET' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Validé
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    paiement.statut === 'COMPLET'
                      ? 'text-emerald-700'
                      : paiement.statut === 'ANNULE'
                      ? 'text-red-700'
                      : 'text-amber-700'
                  }`}
                >
                  {paiement.statut === 'COMPLET' &&
                    'Ce paiement a été encaissé et validé.'}
                  {paiement.statut === 'ANNULE' &&
                    `Annulé le ${formatDateStr(
                      paiement.annuleLe
                    )} à ${formatHeureStr(paiement.annuleLe)} — Motif : ${
                      paiement.motifAnnulation ?? '—'
                    }`}
                  {paiement.statut === 'REMBOURSE' &&
                    "Le montant a été remboursé à l'élève ou sa famille."}
                </p>
              </div>
            </div>
          </div>

          {/* Montant & Référence */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ReceiptPercentIcon className="w-4 h-4 text-emerald-500" />
              Montant & Référence
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Montant encaissé</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">
                  {formatMoney(paiement.montant)}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5" />
                  {datePaiementStr} à {heurePaiementStr}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Référence</p>
                <p className="text-lg font-mono font-semibold text-gray-900 mt-1">
                  {paiement.reference}
                </p>
                {paiement.recu?.numeroRecu && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <DocumentTextIcon className="w-3.5 h-3.5" />
                    Reçu N° {paiement.recu.numeroRecu}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">Moyen de paiement</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {MOYENS_LABEL[paiement.moyen] ?? paiement.moyen}
                </p>
              </div>
              {paiement.referenceMoyen && (
                <div>
                  <p className="text-xs text-gray-500">Référence du moyen</p>
                  <p className="text-sm font-mono text-gray-900 mt-1">
                    {paiement.referenceMoyen}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Élève */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <UserCircleIcon className="w-4 h-4 text-blue-500" />
                Élève
              </h2>
              {paiement.eleve?.id && (
                <Link
                  to={`/dashboard/eleves/${paiement.eleve.id}`}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                >
                  Voir la fiche
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {paiement.eleve?.prenom?.[0]}
                {paiement.eleve?.nom?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 truncate">
                  {eleveNom}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                    <IdentificationIcon className="w-3.5 h-3.5" />
                    {paiement.eleve?.matricule}
                  </span>
                  {classeActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      <AcademicCapIcon className="w-3.5 h-3.5" />
                      {classeActive.nom}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ TRANCHES CONCERNÉES ═══ */}
          {tranches.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4 text-indigo-500" />
                  Tranches concernées
                </h2>
                <span className="text-xs text-gray-500">
                  {tranches.length} tranche(s)
                </span>
              </div>

              <div className="space-y-3">
                {tranches.map((t: any, i: number) => {
                  const isExpanded = expandedTranche === t.id;
                  const pct =
                    t.montantTotal > 0
                      ? Math.min(100, (t.totalPaye / t.montantTotal) * 100)
                      : 0;

                  return (
                    <div
                      key={t.id}
                      className={`rounded-xl border ${
                        t.enRetard
                          ? 'border-amber-200 bg-amber-50/30'
                          : t.statut === 'PAYEE'
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-gray-200 bg-gray-50/50'
                      }`}
                    >
                      {/* En-tête */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                              {i + 1}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {t.nom}
                                </p>
                                {t.statut === 'PAYEE' && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                    <CheckCircleIcon className="w-3 h-3" />
                                    Payée
                                  </span>
                                )}
                                {t.statut === 'PARTIELLE' && (
                                  <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                    Partielle
                                  </span>
                                )}
                                {t.enRetard && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                    <ClockIcon className="w-3 h-3" />
                                    +{t.joursRetard}j
                                  </span>
                                )}
                              </div>
                              {t.dateLimite && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Limite : {formatDateStr(t.dateLimite)}
                                </p>
                              )}
                            </div>
                          </div>
                          {t.nombrePaiements > 0 && (
                            <button
                              onClick={() =>
                                setExpandedTranche(isExpanded ? null : t.id)
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUpIcon className="w-3.5 h-3.5" />
                                  Masquer
                                </>
                              ) : (
                                <>
                                  <ChevronDownIcon className="w-3.5 h-3.5" />
                                  Historique ({t.nombrePaiements})
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Progression */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">Payé sur la tranche</span>
                            <span
                              className={`font-bold ${
                                pct >= 100
                                  ? 'text-emerald-700'
                                  : t.enRetard
                                  ? 'text-amber-700'
                                  : 'text-blue-700'
                              }`}
                            >
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                pct >= 100
                                  ? 'bg-emerald-500'
                                  : t.enRetard
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Montants */}
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-gray-500">Montant total</p>
                            <p className="font-bold text-gray-900">
                              {formatMoney(t.montantTotal)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Payé (cumulé)</p>
                            <p className="font-bold text-emerald-700">
                              {formatMoney(t.totalPaye)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Restant</p>
                            <p
                              className={`font-bold ${
                                t.restant > 0.01 ? 'text-red-600' : 'text-gray-400'
                              }`}
                            >
                              {formatMoney(t.restant)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Ce paiement</p>
                            <p className="font-bold text-indigo-700">
                              {formatMoney(t.montantAlloue)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Historique expandable */}
                      <AnimatePresence>
                        {isExpanded && t.historique.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2 border-t border-gray-200/50">
                              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Historique des paiements sur cette tranche
                              </p>
                              <div className="space-y-1">
                                {t.historique.map((h: any) => (
                                  <div
                                    key={h.paiementId}
                                    className="flex items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100 text-xs"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                      <span className="font-mono font-medium text-gray-900">
                                        {h.reference}
                                      </span>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-gray-600">
                                        {formatDateStr(h.datePaiement)}
                                      </span>
                                      {h.caissier && (
                                        <>
                                          <span className="text-gray-400">•</span>
                                          <span className="text-gray-500 flex items-center gap-1">
                                            <UserIcon className="w-3 h-3" />
                                            {h.caissier}
                                          </span>
                                        </>
                                      )}
                                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">
                                        {MOYENS_LABEL[h.moyen] ?? h.moyen}
                                      </span>
                                    </div>
                                    <span className="font-bold text-emerald-700 shrink-0">
                                      {formatMoney(h.montant)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Résumé */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Montant encaissé</span>
                  <span className="font-bold text-gray-900">
                    {formatMoney(paiement.montant)}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Total alloué</span>
                  <span className="font-bold text-blue-700">
                    {formatMoney(totalAlloue)}
                  </span>
                </div>
                {resteNonAlloue > 0.01 && (
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500">Reste non alloué</span>
                    <span className="font-bold text-orange-600">
                      {formatMoney(resteNonAlloue)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-500 font-medium">
                    Reste global sur les tranches
                  </span>
                  <span
                    className={`font-bold ${
                      resteGlobal > 0.01 ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {resteGlobal > 0.01 ? (
                      <span className="flex items-center gap-1">
                        <ArrowTrendingDownIcon className="w-3.5 h-3.5" />
                        {formatMoney(resteGlobal)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Soldé
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {paiement.notes && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                Notes
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {paiement.notes}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-blue-500" />
              Historique du paiement
            </h2>
            <ol className="relative border-l-2 border-gray-200 ml-2 space-y-6">
              <li className="ml-6">
                <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    Paiement créé
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateStr(paiement.createdAt)} ·{' '}
                    {formatHeureStr(paiement.createdAt)}
                  </p>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Encaissé par{' '}
                  <strong>
                    {paiement.caissier?.prenom} {paiement.caissier?.nom}
                  </strong>{' '}
                  le {datePaiementStr} à {heurePaiementStr}
                </p>
              </li>

              {paiement.statut === 'ANNULE' && paiement.annuleLe && (
                <li className="ml-6">
                  <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow" />
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      Paiement annulé
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateStr(paiement.annuleLe)} ·{' '}
                      {formatHeureStr(paiement.annuleLe)}
                    </p>
                  </div>
                  {paiement.annuleParUtilisateur && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      Annulé par{' '}
                      <strong>
                        {paiement.annuleParUtilisateur.prenom}{' '}
                        {paiement.annuleParUtilisateur.nom}
                      </strong>
                    </p>
                  )}
                  {paiement.motifAnnulation && (
                    <p className="text-xs text-red-700 mt-1 italic">
                      « {paiement.motifAnnulation} »
                    </p>
                  )}
                </li>
              )}

              <li className="ml-6">
                <div
                  className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 border-white shadow ${
                    paiement.statut === 'COMPLET'
                      ? 'bg-emerald-500'
                      : 'bg-gray-400'
                  }`}
                />
                <p className="text-sm font-medium text-gray-900">
                  Statut actuel :{' '}
                  {paiement.statut === 'COMPLET'
                    ? 'Complet'
                    : paiement.statut === 'ANNULE'
                    ? 'Annulé'
                    : 'Remboursé'}
                </p>
              </li>
            </ol>
          </div>
        </div>

        {/* ─────────── SIDEBAR ─────────── */}
        <div className="space-y-6">
          {/* Actions reçu */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <DocumentTextIcon className="w-4 h-4 text-blue-600" />
              Reçu
            </h3>
            <div className="space-y-2">
              {hasRecu && (
                <Link
                  to={`/dashboard/recus/${paiement.recu!.id}`}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 font-medium"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  Voir le reçu N° {paiement.recu!.numeroRecu}
                </Link>
              )}
              <button
                type="button"
                onClick={handlePreviewRecu}
                disabled={isPendingPDF}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 font-medium disabled:opacity-50"
              >
                <PrinterIcon className="w-4 h-4" />
                Aperçu du reçu
              </button>
              <button
                type="button"
                onClick={() => handleDownloadRecu('A4')}
                disabled={isPendingPDF}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 font-medium disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Télécharger PDF A4
              </button>
              <button
                type="button"
                onClick={() => handleDownloadRecu('80MM')}
                disabled={isPendingPDF}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 font-medium disabled:opacity-50"
              >
                <ReceiptPercentIcon className="w-4 h-4" />
                Ticket 80mm
              </button>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Actions rapides
            </h3>
            <div className="space-y-2">
              {paiement.eleve?.id && (
                <Link
                  to={`/dashboard/eleves/${paiement.eleve.id}`}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 font-medium"
                >
                  <UserCircleIcon className="w-4 h-4 text-blue-600" />
                  Voir la fiche élève
                </Link>
              )}
              {canAnnuler && (
                <button
                  type="button"
                  onClick={() => setShowAnnuler(true)}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 font-medium"
                >
                  <XCircleIcon className="w-4 h-4" />
                  Annuler ce paiement
                </button>
              )}
              {canHardDelete && (
                <button
                  type="button"
                  onClick={() => setShowHardDelete(true)}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                >
                  <TrashIcon className="w-4 h-4" />
                  Supprimer définitivement
                </button>
              )}
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ChartBarIcon className="w-4 h-4 text-emerald-600" />
              Récapitulatif
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500">Montant encaissé</dt>
                <dd className="font-semibold text-gray-900 text-right">
                  {formatMoney(paiement.montant)}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500">Alloué aux tranches</dt>
                <dd className="font-semibold text-blue-700 text-right">
                  {formatMoney(totalAlloue)}
                </dd>
              </div>
              {resteNonAlloue > 0.01 && (
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Reste non alloué</dt>
                  <dd className="font-semibold text-orange-600 text-right">
                    {formatMoney(resteNonAlloue)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-2 pt-2 border-t border-gray-100">
                <dt className="text-gray-500">Tranches concernées</dt>
                <dd className="font-semibold text-gray-900 text-right">
                  {tranches.length}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500">Tranches soldées</dt>
                <dd className="font-semibold text-emerald-700 text-right">
                  {tranchesSoldees}
                </dd>
              </div>
              {tranchesEnRetard > 0 && (
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">En retard</dt>
                  <dd className="font-semibold text-amber-700 text-right">
                    {tranchesEnRetard}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-2 pt-2 border-t border-gray-100">
                <dt className="text-gray-500">Reste global</dt>
                <dd
                  className={`font-bold text-right ${
                    resteGlobal > 0.01 ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {formatMoney(resteGlobal)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Caissier */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Encaissé par
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                {paiement.caissier?.prenom?.[0]}
                {paiement.caissier?.nom?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {paiement.caissier?.prenom} {paiement.caissier?.nom}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {paiement.caissier?.email ?? '—'}
                </p>
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
                <dt className="text-xs text-gray-500">ID paiement</dt>
                <dd className="font-mono text-xs text-gray-900 mt-0.5 break-all">
                  {paiement.id}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Élève (ID)</dt>
                <dd className="font-mono text-xs text-gray-900 mt-0.5 break-all">
                  {paiement.eleveId}
                </dd>
              </div>
              {paiement.assignmentId && (
                <div>
                  <dt className="text-xs text-gray-500">Assignment (ID)</dt>
                  <dd className="font-mono text-xs text-gray-900 mt-0.5 break-all">
                    {paiement.assignmentId}
                  </dd>
                </div>
              )}
              {paiement.recu && (
                <div>
                  <dt className="text-xs text-gray-500">Reçu N°</dt>
                  <dd className="font-mono text-xs text-gray-900 mt-0.5">
                    {paiement.recu.numeroRecu}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Dialog annulation */}
      {showAnnuler && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Annuler le paiement
                </h2>
                <p className="text-xs text-gray-500">
                  Référence : {paiement.reference}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Motif d'annulation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motifAnnulation}
                onChange={(e) => setMotifAnnulation(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Expliquez la raison de l'annulation (min 3 caractères)…"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAnnuler(false);
                  setMotifAnnulation('');
                }}
                className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAnnuler}
                disabled={
                  annulerMutation.isPending ||
                  motifAnnulation.trim().length < 3
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {annulerMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Annulation…
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-4 h-4" />
                    Confirmer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog hard delete */}
      {showHardDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <TrashIcon className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Supprimer définitivement
                </h2>
                <p className="text-xs text-gray-500">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700">
              Le paiement <strong>{paiement.reference}</strong> sera supprimé
              définitivement, ainsi que son reçu associé. Cette action ne peut
              pas être annulée.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowHardDelete(false)}
                className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleHardDelete}
                disabled={hardDeleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 disabled:opacity-60"
              >
                {hardDeleteMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Suppression…
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Supprimer définitivement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaiementDetailPage;