// frontend2/src/pages/dashboard/directeur/recus/RecuDetailPage.tsx

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  EyeIcon,
  BanknotesIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useRecu,
  useDownloadRecuPDF,
  usePreviewRecuPDF,
  useHardDeleteRecu,
} from '../../../../hooks/useRecus';
import type { FormatImpression } from '../../../../types/recu.types';

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════

const formatMoney = (
  amount: number | null | undefined,
  devise: string = 'F CFA'
): string => {
  if (amount == null) return '—';
  const value = amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const upper = (devise || '').toUpperCase();
  if (upper === 'XOF' || upper === 'XAF') return `${value} F CFA`;
  if (upper === 'EUR') return `${value} €`;
  if (upper === 'USD') return `${value} $`;
  if (upper === 'GBP') return `${value} £`;
  if (upper === 'MAD') return `${value} DH`;
  if (upper === 'NGN') return `${value} ₦`;
  return devise ? `${value} ${devise}` : `${value} F CFA`;
};

function resolveDevise(recu: any): string {
  return recu?.etablissementDevise || recu?.devise || 'F CFA';
}

// ══════════════════════════════════════════════
// CONFIG FORMATS
// ══════════════════════════════════════════════

const FORMATS: {
  value: FormatImpression;
  label: string;
  desc: string;
  icon: string;
}[] = [
  { value: 'A4', label: 'A4', desc: 'Format officiel', icon: '📄' },
  { value: 'A5', label: 'A5', desc: 'Format compact', icon: '📋' },
  { value: '80MM', label: '80 mm', desc: 'Ticket thermique', icon: '🧾' },
];

// ══════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════

const RecuDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: recu, isLoading, isError } = useRecu(id);
  const downloadPDF = useDownloadRecuPDF();
  const previewPDF = usePreviewRecuPDF();
  const hardDelete = useHardDeleteRecu();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDownload = (format: FormatImpression) => {
    if (!recu) return;
    downloadPDF.mutate({
      id: recu.id,
      numeroRecu: recu.numeroRecu,
      format,
    });
  };

  const handlePreview = (format: FormatImpression) => {
    if (!recu) return;
    previewPDF.mutate({ id: recu.id, format });
  };

  const handleDelete = async () => {
    if (!recu) return;
    try {
      await hardDelete.mutateAsync(recu.id);
      navigate('/dashboard/recus');
    } catch {
      /* toasté */
    }
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
  if (isError || !recu) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Reçu introuvable</p>
        <Link
          to="/dashboard/recus"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour aux reçus
        </Link>
      </div>
    );
  }

  const devise = resolveDevise(recu);

  const details: any = (recu as any).detailsFinanciers ?? null;
  const pourcentagePaye: number | null = details?.pourcentagePaye ?? null;
  const estSolde: boolean = !!details?.estSolde;
  const estEnRetard: boolean = !!details?.estEnRetard;
  const montantTotalPlan: number | null = details?.montantTotalPlan ?? null;
  const montantPayeApres: number | null =
    details?.montantPayeApres ?? recu.montantPaye;

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 p-6">
      {/* ═══════════════════════════════════════════
          BREADCRUMB + ACTIONS
          ═══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard/recus"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Link to="/dashboard/recus" className="hover:text-gray-700">
                Reçus
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium font-mono truncate">
                {recu.numeroRecu}
              </span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 truncate">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                <DocumentTextIcon className="w-6 h-6" />
              </div>
              Détail du reçu
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          LAYOUT 2 COLONNES
          ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─────────── COLONNE PRINCIPALE ─────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête du reçu (VERT) */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-emerald-100 text-xs uppercase font-semibold tracking-wider">
                  {recu.etablissementNom}
                </p>
                <p className="text-3xl font-bold mt-1 truncate">
                  {formatMoney(recu.montantPaye, devise)}
                </p>
                <p className="text-emerald-100 text-sm mt-1">
                  Payé le{' '}
                  {new Date(recu.datePaiement).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-emerald-100 uppercase font-semibold">
                  N° Reçu
                </p>
                <p className="font-mono font-bold text-sm mt-1">
                  {recu.numeroRecu}
                </p>
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wide">
                  <CheckCircleIcon className="w-3 h-3" />
                  Validé
                </span>
              </div>
            </div>

            {/* Statut financier global */}
            {(estSolde || estEnRetard) && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2">
                  {estSolde ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase">
                      <CheckCircleIcon className="w-3 h-3" /> Soldé
                    </span>
                  ) : estEnRetard ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/80 text-white text-[10px] font-bold uppercase">
                      <ExclamationTriangleIcon className="w-3 h-3" /> En retard
                    </span>
                  ) : null}
                  {pourcentagePaye != null && (
                    <span className="text-xs text-emerald-100">
                      Progression : <strong>{pourcentagePaye}%</strong>
                    </span>
                  )}
                </div>
                {pourcentagePaye != null && (
                  <div className="mt-2 h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        estEnRetard
                          ? 'bg-gradient-to-r from-orange-400 to-red-500'
                          : 'bg-gradient-to-r from-emerald-300 to-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pourcentagePaye)}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Élève */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <UserCircleIcon className="w-4 h-4 text-emerald-500" />
                Élève
              </h2>
              {recu.eleveId && (
                <Link
                  to={`/dashboard/eleves/${recu.eleveId}`}
                  className="text-xs text-emerald-600 hover:underline font-medium transition-colors"
                >
                  Voir la fiche
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                {recu.elevePrenom?.[0] ?? recu.nomEleve?.[0]}
                {recu.eleveNom?.[0] ?? ''}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {recu.nomEleve}
                </p>
                <p className="text-sm text-gray-500">
                  Matricule : {recu.eleveMatricule}
                </p>
                {recu.eleveSexe && (
                  <p className="text-sm text-gray-500">
                    Sexe : {recu.eleveSexe}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Classe / Année */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Classe
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {recu.nomClasse}
              </p>
              {recu.classeCode && (
                <p className="text-sm text-gray-500">
                  Code : {recu.classeCode}
                </p>
              )}
              {recu.niveauNom && (
                <p className="text-sm text-gray-500">
                  Niveau : {recu.niveauNom}
                </p>
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Année scolaire
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {recu.anneeScolaireNom ?? '—'}
              </p>
            </div>
          </div>

          {/* Détails financiers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BanknotesIcon className="w-4 h-4 text-emerald-500" />
              Détails financiers
            </h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Montant payé
                </dt>
                <dd className="font-bold text-emerald-700 text-lg mt-0.5">
                  {formatMoney(recu.montantPaye, devise)}
                </dd>
              </div>

              {montantTotalPlan != null && (
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">
                    Total du plan
                  </dt>
                  <dd className="font-semibold text-gray-900 mt-0.5">
                    {formatMoney(montantTotalPlan, devise)}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Réduction appliquée
                </dt>
                <dd className="font-medium text-gray-900 mt-0.5">
                  {formatMoney(recu.montantReduction, devise)}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Solde restant
                </dt>
                <dd
                  className={`font-semibold mt-0.5 ${
                    (recu.montantRestant ?? 0) <= 0.01
                      ? 'text-emerald-700'
                      : 'text-red-600'
                  }`}
                >
                  {formatMoney(recu.montantRestant, devise)}
                </dd>
              </div>

              {montantPayeApres != null && (
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">
                    Total payé (cumulé)
                  </dt>
                  <dd className="font-semibold text-gray-900 mt-0.5">
                    {formatMoney(montantPayeApres, devise)}
                  </dd>
                </div>
              )}

              {pourcentagePaye != null && (
                <div>
                  <dt className="text-xs text-gray-500 uppercase tracking-wider">
                    Progression
                  </dt>
                  <dd className="font-semibold text-gray-900 mt-0.5">
                    {pourcentagePaye}%
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Moyen de paiement
                </dt>
                <dd className="font-medium text-gray-900 mt-0.5">
                  {recu.moyenPaiementLabel}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-500 uppercase tracking-wider">
                  Référence paiement
                </dt>
                <dd className="font-mono text-gray-900 break-all mt-0.5">
                  {recu.referencePaiement}
                </dd>
              </div>
            </dl>
          </div>

          {/* Échéances couvertes */}
          {recu.echeancesCouvertes && recu.echeancesCouvertes.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Échéances couvertes
                </h2>
                <span className="text-xs text-gray-500">
                  {recu.echeancesCouvertes.length} échéance(s)
                </span>
              </div>
              <ul className="space-y-2">
                {recu.echeancesCouvertes.map((e: any, idx: number) => (
                  <li
                    key={e.echeanceId ?? idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-emerald-50/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-sm text-gray-900 truncate block">
                        {e.nom ?? e.echeance?.nom ?? `Échéance ${idx + 1}`}
                      </span>
                      {e.dateLimite && (
                        <span className="text-xs text-gray-500">
                          Échéance :{' '}
                          {new Date(e.dateLimite).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-emerald-700 shrink-0">
                      {formatMoney(e.montant ?? e.montantPaye ?? 0, devise)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Vérification */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4" />
              Vérification du reçu
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1">
                <p className="text-xs text-emerald-700 uppercase font-semibold">
                  Code de vérification
                </p>
                <p className="font-mono font-bold text-xl text-emerald-900 mt-1 break-all">
                  {recu.codeVerification}
                </p>
                {recu.urlVerification && (
                  <p className="text-xs text-emerald-700 mt-2 break-all">
                    Vérifiable sur : {recu.urlVerification}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─────────── SIDEBAR — IMPRESSION ─────────── */}
        <div className="space-y-6">
          {/* Impression */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <PrinterIcon className="w-4 h-4 text-emerald-500" />
              Imprimer / Télécharger
            </h3>

            <div className="space-y-2">
              {FORMATS.map((f) => (
                <div
                  key={f.value}
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50 space-y-2 hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{f.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {f.label}
                        </p>
                        <p className="text-xs text-gray-500">{f.desc}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePreview(f.value)}
                      disabled={previewPDF.isPending}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium disabled:opacity-50 transition-colors"
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                      Aperçu
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(f.value)}
                      disabled={downloadPDF.isPending}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium disabled:opacity-50 shadow-sm shadow-emerald-500/20 transition-all"
                    >
                      <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats impression */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Impressions</span>
                <span className="font-medium text-gray-900">
                  {recu.nombreImpressions}
                </span>
              </div>
              {recu.derniereImpression && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Dernière</span>
                  <span className="font-medium text-gray-900">
                    {new Date(recu.derniereImpression).toLocaleDateString(
                      'fr-FR'
                    )}
                  </span>
                </div>
              )}
              {recu.formatImprime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Dernier format</span>
                  <span className="font-medium text-gray-900">
                    {recu.formatImprime}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Établissement (snapshot) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AcademicCapIcon className="w-4 h-4 text-emerald-500" />
              Établissement
            </h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-900">
                {recu.etablissementNom}
              </p>
              {recu.etablissementAdresse && (
                <p className="text-xs text-gray-600">
                  {recu.etablissementAdresse}
                </p>
              )}
              {(recu.etablissementVille || recu.etablissementPays) && (
                <p className="text-xs text-gray-600">
                  {[recu.etablissementVille, recu.etablissementPays]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {recu.etablissementTelephone && (
                <p className="text-xs text-gray-600">
                  📞 {recu.etablissementTelephone}
                </p>
              )}
              {recu.etablissementEmail && (
                <p className="text-xs text-gray-600 break-all">
                  ✉ {recu.etablissementEmail}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Code : {recu.etablissementCode}
              </p>
              {recu.etablissementAgrement && (
                <p className="text-xs text-gray-500">
                  Agrément : {recu.etablissementAgrement}
                </p>
              )}
              <p className="text-xs text-gray-500">Devise : {devise}</p>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-emerald-500" />
              Métadonnées
            </h3>
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="text-gray-500">ID Reçu</dt>
                <dd className="font-mono text-gray-900 break-all mt-0.5">
                  {recu.id}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Paiement ID</dt>
                <dd className="font-mono text-gray-900 break-all mt-0.5">
                  {recu.paiementId}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Généré le</dt>
                <dd className="text-gray-900 mt-0.5">
                  {new Date(recu.createdAt).toLocaleString('fr-FR')}
                </dd>
              </div>
              {recu.generateur && (
                <div>
                  <dt className="text-gray-500">Généré par</dt>
                  <dd className="text-gray-900 mt-0.5">
                    {recu.generateur.prenom} {recu.generateur.nom}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Dialog suppression */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Supprimer le reçu
                </h2>
                <p className="text-xs text-gray-500">
                  Cette action est irréversible.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              Le reçu <strong>{recu.numeroRecu}</strong> sera supprimé
              définitivement, ainsi que tous les PDF associés.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={hardDelete.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {hardDelete.isPending ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecuDetailPage;