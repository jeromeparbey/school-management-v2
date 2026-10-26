// frontend2/src/pages/dashboard/directeur/paiements/PaiementDetailPage.tsx

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  TrashIcon,
  BanknotesIcon,
  UserCircleIcon,
  CalendarDaysIcon,
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
} from '@heroicons/react/24/outline';
import {
  usePaiement,
  useAnnulerPaiement,
  useHardDeletePaiement,
} from '../../../../hooks/usePaiements';
import { useToast } from '../../../../context/ToastContext';

const MOYENS_LABEL: Record<string, string> = {
  ESPECES: 'Espèces',
  VIREMENT: 'Virement',
  MOBILE_MONEY: 'Mobile Money',
  CARTE: 'Carte',
  CHEQUE: 'Chèque',
  AUTRE: 'Autre',
};

const formatMontant = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const PaiementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: paiement, isLoading, isError } = usePaiement(id);
  const annulerMutation = useAnnulerPaiement();
  const hardDeleteMutation = useHardDeletePaiement();

  const [showAnnuler, setShowAnnuler] = useState(false);
  const [motifAnnulation, setMotifAnnulation] = useState('');
  const [showHardDelete, setShowHardDelete] = useState(false);

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

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Breadcrumb + actions */}
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

        <div className="flex items-center gap-2 shrink-0">
          {paiement.recu?.cheminPDF && (
            <a
              href={paiement.recu.cheminPDF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Reçu PDF
            </a>
          )}
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

      {/* Layout 2 colonnes */}
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
                    `Annulé le ${new Date(
                      paiement.annuleLe!
                    ).toLocaleDateString('fr-FR')} pour motif : ${
                      paiement.motifAnnulation ?? '—'
                    }`}
                  {paiement.statut === 'REMBOURSE' &&
                    'Le montant a été remboursé à l\'élève ou sa famille.'}
                </p>
              </div>
            </div>
          </div>

          {/* Montant & référence */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ReceiptPercentIcon className="w-4 h-4 text-emerald-500" />
              Montant & Référence
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Montant encaissé</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">
                  {formatMontant(paiement.montant)}{' '}
                  <span className="text-sm font-medium text-gray-500">XOF</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Référence</p>
                <p className="text-lg font-mono font-semibold text-gray-900 mt-1">
                  {paiement.reference}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Moyen de paiement</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {MOYENS_LABEL[paiement.moyen] ?? paiement.moyen}
                </p>
              </div>
              {paiement.referenceMoyen && (
                <div>
                  <p className="text-xs text-gray-500">
                    Référence du moyen
                  </p>
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
              <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {paiement.eleve?.prenom?.[0]}
                {paiement.eleve?.nom?.[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {eleveNom}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                    <IdentificationIcon className="w-3.5 h-3.5" />
                    {paiement.eleve?.matricule}
                  </span>
                  {paiement.eleve?.statut && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                      {paiement.eleve.statut}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Allocations */}
          {paiement.allocations && paiement.allocations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4 text-indigo-500" />
                Allocations aux échéances
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                      <th className="text-left py-2 font-semibold">Échéance</th>
                      <th className="text-left py-2 font-semibold">
                        Date limite
                      </th>
                      <th className="text-right py-2 font-semibold">
                        Montant échéance
                      </th>
                      <th className="text-right py-2 font-semibold">
                        Alloué
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paiement.allocations.map((a) => (
                      <tr key={a.id}>
                        <td className="py-2 text-gray-900">
                          {a.echeance?.nom ?? '—'}
                        </td>
                        <td className="py-2 text-gray-600">
                          {a.echeance?.dateLimite
                            ? new Date(
                                a.echeance.dateLimite
                              ).toLocaleDateString('fr-FR')
                            : '—'}
                        </td>
                        <td className="py-2 text-right text-gray-600">
                          {formatMontant(a.echeance?.montant ?? 0)} XOF
                        </td>
                        <td className="py-2 text-right font-medium text-gray-900">
                          {formatMontant(a.montant)} XOF
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              Historique
            </h2>
            <ol className="relative border-l-2 border-gray-200 ml-2 space-y-6">
              <li className="ml-6">
                <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    Paiement créé
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(paiement.createdAt).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Encaissé par{' '}
                  <strong>
                    {paiement.caissier?.prenom} {paiement.caissier?.nom}
                  </strong>{' '}
                  le{' '}
                  {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
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
                      {new Date(paiement.annuleLe).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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
              {paiement.recu?.cheminPDF && (
                <a
                  href={paiement.recu.cheminPDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 font-medium"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 text-blue-600" />
                  Télécharger le reçu
                </a>
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