// frontend2/src/pages/dashboard/directeur/reductions/ReductionDetailPage.tsx

import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ReceiptPercentIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  TrashIcon,
  UserCircleIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  useReduction,
  useHardDeleteReduction,
} from '../../../../hooks/useReduction';
import { useToast } from '../../../../context/ToastContext';

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const formatMoney = (
  amount: number | null | undefined,
  devise = 'F CFA'
): string => {
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

const formatDate = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTime = (date: string | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

const ReductionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: reductionData, isLoading, isError } = useReduction(id);
  const hardDelete = useHardDeleteReduction();

  const reduction: any = (reductionData as any)?.data ?? reductionData;

  const handleDelete = async () => {
    if (!reduction) return;
    const confirmed = window.confirm(
      `⚠️ SUPPRESSION DÉFINITIVE\n\nRéduction : ${reduction.motif}\nÉlève : ${reduction.eleve?.prenom} ${reduction.eleve?.nom}\n\nCette action est IRRÉVERSIBLE.\n\nContinuer ?`
    );
    if (!confirmed) return;

    try {
      await hardDelete.mutateAsync(reduction.id);
      navigate('/dashboard/reductions');
    } catch {
      /* toasté */
    }
  };

  // ─────────── Loading ───────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="text-gray-500 mt-4">Chargement…</p>
        </div>
      </div>
    );
  }

  // ─────────── Erreur ───────────
  if (isError || !reduction) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Réduction introuvable</p>
        <p className="text-sm text-gray-500 mt-1">
          Cette réduction a peut-être été supprimée.
        </p>
        <Link
          to="/dashboard/reductions"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour aux réductions
        </Link>
      </div>
    );
  }

  const devise =
    reduction.assignmentScolarite?.planScolarite?.devise ?? 'XOF';
  const typeLabel =
    reduction.type === 'FIXE' ? 'Montant fixe' : 'Pourcentage';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6 pb-12">
      {/* ═══════════ BREADCRUMB ═══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard/reductions"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Link to="/dashboard/reductions" className="hover:text-gray-700">
                Réductions
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate">
                {reduction.eleve?.prenom} {reduction.eleve?.nom}
              </span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 truncate">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                <ReceiptPercentIcon className="w-6 h-6" />
              </div>
              Détail de la réduction
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/dashboard/reductions/${reduction.id}/editer`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <PencilSquareIcon className="w-4 h-4" />
            Modifier
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={hardDelete.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-colors"
          >
            {hardDelete.isPending ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
            Supprimer
          </button>
        </div>
      </div>

      {/* ═══════════ CARTE MONTANT RÉDUIT ═══════════ */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-emerald-100 text-xs uppercase font-semibold tracking-wider">
              Montant réduit
            </p>
            <p className="text-3xl font-bold mt-1 truncate">
              {formatMoney(reduction._meta?.montantReduction ?? 0, devise)}
            </p>
            <p className="text-emerald-100 text-sm mt-1">
              {typeLabel} :{' '}
              {reduction.type === 'POURCENTAGE'
                ? `${reduction.valeur}%`
                : formatMoney(reduction.valeur, devise)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-emerald-100 uppercase font-semibold">
              Statut
            </p>
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wide">
              <CheckCircleIcon className="w-3 h-3" />
              Approuvée
            </span>
          </div>
        </div>

        {/* Progression financière */}
        {reduction._meta?.montantPlan && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="opacity-80">Montant du plan</p>
                <p className="font-bold mt-0.5">
                  {formatMoney(reduction._meta.montantPlan, devise)}
                </p>
              </div>
              <div>
                <p className="opacity-80">Réduction</p>
                <p className="font-bold mt-0.5 text-amber-200">
                  - {formatMoney(reduction._meta.montantReduction ?? 0, devise)}
                </p>
              </div>
              <div>
                <p className="opacity-80">Net à payer</p>
                <p className="font-bold mt-0.5 text-emerald-200">
                  {formatMoney(reduction._meta.montantNet ?? 0, devise)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ GRILLE 2 COLONNES ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Élève */}
        {reduction.eleve && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserCircleIcon className="w-4 h-4 text-emerald-500" />
              Élève
            </h2>
            <Link
              to={`/dashboard/eleves/${reduction.eleve.id}`}
              className="flex items-center gap-3 hover:bg-emerald-50/30 -m-2 p-2 rounded-lg transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                {reduction.eleve.prenom?.[0]}
                {reduction.eleve.nom?.[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {reduction.eleve.prenom} {reduction.eleve.nom}
                </p>
                <p className="text-xs text-gray-500">
                  {reduction.eleve.matricule}
                </p>
                {reduction.eleve.sexe && (
                  <p className="text-xs text-gray-500">
                    Sexe : {reduction.eleve.sexe}
                  </p>
                )}
              </div>
            </Link>
          </div>
        )}

        {/* Plan de scolarité */}
        {reduction.assignmentScolarite?.planScolarite && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BanknotesIcon className="w-4 h-4 text-emerald-500" />
              Plan de scolarité
            </h2>
            <Link
              to={`/dashboard/plans-scolarite/${reduction.assignmentScolarite.planScolarite.id}`}
              className="block hover:bg-emerald-50/30 -m-2 p-2 rounded-lg transition-colors"
            >
              <p className="text-base font-semibold text-gray-900">
                {reduction.assignmentScolarite.planScolarite.nom}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Montant total :{' '}
                <strong className="text-gray-900">
                  {formatMoney(
                    reduction.assignmentScolarite.planScolarite.montantTotal,
                    devise
                  )}
                </strong>
              </p>
            </Link>
          </div>
        )}
      </div>

      {/* ═══════════ INFORMATIONS DÉTAILLÉES ═══════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <IdentificationIcon className="w-4 h-4 text-emerald-500" />
          Informations
        </h2>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wider">
              Type
            </dt>
            <dd className="font-semibold text-gray-900 mt-0.5">{typeLabel}</dd>
          </div>

          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wider">
              Valeur
            </dt>
            <dd className="font-semibold text-gray-900 mt-0.5">
              {reduction.type === 'POURCENTAGE'
                ? `${reduction.valeur}%`
                : formatMoney(reduction.valeur, devise)}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wider">
              Approuvé par
            </dt>
            <dd className="font-medium text-gray-900 mt-0.5">
              {reduction.approbateur
                ? `${reduction.approbateur.prenom} ${reduction.approbateur.nom}`
                : '—'}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wider">
              Approuvé le
            </dt>
            <dd className="font-medium text-gray-900 mt-0.5">
              {formatDate(reduction.approuveLe)}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-xs text-gray-500 uppercase tracking-wider">
              Motif
            </dt>
            <dd className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
              {reduction.motif}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wider">
              Créée le
            </dt>
            <dd className="text-sm text-gray-900 mt-0.5">
              {formatDateTime(reduction.createdAt)}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wider">
              ID
            </dt>
            <dd className="font-mono text-xs text-gray-900 mt-0.5 break-all">
              {reduction.id}
            </dd>
          </div>
        </dl>
      </div>

      {/* ═══════════ ACTIONS BAS DE PAGE ═══════════ */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          to="/dashboard/reductions"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour à la liste
        </Link>
        <Link
          to={`/dashboard/reductions/${reduction.id}/editer`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium border border-amber-200 transition-colors"
        >
          <PencilSquareIcon className="w-4 h-4" />
          Modifier
        </Link>
      </div>
    </div>
  );
};

export default ReductionDetailPage;