// frontend2/src/pages/dashboard/directeur/inscriptions/InscriptionDetailPage.tsx

import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
} from '@heroicons/react/24/outline';
import {
  useInscription,
  useSoftDeleteInscription,
} from '../../../../hooks/useInscriptions';

const InscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: inscription, isLoading, isError } = useInscription(id);
  const softDelete = useSoftDeleteInscription();

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

  // ─────────── Erreur / introuvable ───────────
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

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* ═══════════ BREADCRUMB + ACTIONS ═══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard/inscriptions"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
            title="Retour"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Link
                to="/dashboard/inscriptions"
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
              <AcademicCapIcon className="w-7 h-7 text-blue-600 shrink-0" />
              Détail de l'inscription
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/dashboard/inscriptions/${inscription.id}/editer`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600"
          >
            <PencilSquareIcon className="w-4 h-4" />
            Éditer
          </Link>
          {inscription.estActive && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={softDelete.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              Désactiver
            </button>
          )}
        </div>
      </div>

      {/* ═══════════ LAYOUT 2 COLONNES ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─────────── COLONNE PRINCIPALE (2/3) ─────────── */}
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
                <div className="flex items-center gap-2">
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

          {/* ─── Élève ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <UserCircleIcon className="w-4 h-4 text-blue-500" />
                Élève
              </h2>
              {inscription.eleve?.id && (
                <Link
                  to={`/dashboard/eleves/${inscription.eleve.id}`}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                >
                  Voir la fiche
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                {inscription.eleve?.prenom?.[0]}
                {inscription.eleve?.nom?.[0]}
              </div>
              <div className="min-w-0">
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
          </div>

          {/* ─── Classe + Année ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Classe */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <BuildingOffice2Icon className="w-3.5 h-3.5" />
                  Classe
                </h3>
                {inscription.classe?.id && (
                  <Link
                    to={`/dashboard/classes/${inscription.classe.id}`}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Voir
                  </Link>
                )}
              </div>
              <p className="text-xl font-bold text-gray-900">
                {inscription.classe?.nom ?? '—'}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Code : {inscription.classe?.code ?? '—'}
              </p>
              {inscription.classe?.capacite != null && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Capacité :{' '}
                    <strong className="text-gray-900">
                      {inscription.classe.capacite} places
                    </strong>
                  </p>
                </div>
              )}
            </div>

            {/* Année */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CalendarDaysIcon className="w-3.5 h-3.5" />
                Année scolaire
              </h3>
              <p className="text-xl font-bold text-gray-900">
                {inscription.anneeScolaire?.nom ?? '—'}
              </p>
              {inscription.anneeScolaire?.estActive ? (
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Année active
                </span>
              ) : (
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                  Année clôturée
                </span>
              )}
            </div>
          </div>

          {/* ─── Timeline ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-blue-500" />
              Historique
            </h2>

            <ol className="relative border-l-2 border-gray-200 ml-2 space-y-6">
              {/* Création */}
              <li className="ml-6">
                <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    Inscription créée
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(inscription.createdAt).toLocaleDateString(
                      'fr-FR',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }
                    )}
                  </p>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Date d'inscription effective :{' '}
                  <strong>
                    {new Date(inscription.dateInscription).toLocaleDateString(
                      'fr-FR',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </strong>
                </p>
              </li>

              {/* Modification (si applicable) */}
              {hasBeenUpdated && (
                <li className="ml-6">
                  <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow" />
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      Dernière modification
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(inscription.updatedAt).toLocaleDateString(
                        'fr-FR',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                </li>
              )}

              {/* État actuel */}
              <li className="ml-6">
                <div
                  className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 border-white shadow ${
                    inscription.estActive ? 'bg-emerald-500' : 'bg-gray-400'
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
          </div>
        </div>

        {/* ─────────── SIDEBAR (1/3) ─────────── */}
        <div className="space-y-6">
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

          {/* Récap technique */}
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