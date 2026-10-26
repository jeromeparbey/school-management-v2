// frontend2/src/pages/dashboard/directeur/utilisateurs/UtilisateursPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon,
  PowerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  useUtilisateurs,
  useToggleUtilisateur,
  useSoftDeleteUtilisateur,
  useHardDeleteUtilisateur,
} from '../../../../hooks/useUtilisateurs';
import { useToast } from '../../../../context/ToastContext';
import type {
  ListUtilisateursParams,
  RoleUtilisateur,
  Utilisateur,
} from '../../../../types/utilisateur.types';

// ============================================
// CONSTANTES
// ============================================
const ROLES: { value: RoleUtilisateur; label: string; color: string }[] = [
  { value: 'DIRECTEUR',      label: 'Directeur',      color: 'bg-rose-100 text-rose-700' },
  { value: 'ADMIN',          label: 'Administrateur', color: 'bg-red-100 text-red-700' },
  { value: 'ENSEIGNANT',     label: 'Enseignant',     color: 'bg-blue-100 text-blue-700' },
  { value: 'ELEVE',          label: 'Élève',          color: 'bg-emerald-100 text-emerald-700' },
  { value: 'SURVEILLANT',    label: 'Surveillant',    color: 'bg-amber-100 text-amber-700' },
  { value: 'SECRETAIRE',     label: 'Secrétaire',     color: 'bg-violet-100 text-violet-700' },
  { value: 'PARENT',         label: 'Parent',         color: 'bg-pink-100 text-pink-700' },
  { value: 'BIBLIOTHECAIRE', label: 'Bibliothécaire', color: 'bg-orange-100 text-orange-700' },
];

function roleBadge(role: RoleUtilisateur): string {
  return ROLES.find((r) => r.value === role)?.color ?? 'bg-gray-100 text-gray-700';
}
function roleLabel(role: RoleUtilisateur): string {
  return ROLES.find((r) => r.value === role)?.label ?? role;
}

// ============================================
// HELPER : initiales sécurisées
// ============================================
function safeInitials(prenom?: string | null, nom?: string | null): string {
  const p = (prenom ?? '').trim();
  const n = (nom ?? '').trim();
  const i1 = p.length > 0 ? p.charAt(0).toUpperCase() : '?';
  const i2 = n.length > 0 ? n.charAt(0).toUpperCase() : '';
  return (i1 + i2) || '?';
}

// ============================================
// HELPER : extraction robuste des items
// Accepte plusieurs structures backend :
//   { data: { items: [...], pagination } }   ← structure standard
//   { items: [...], pagination }             ← sans wrapper data
//   { data: [...], pagination }              ← data = tableau
// ============================================
function extractListPayload(raw: any): {
  items: Utilisateur[];
  pagination: any;
} {
  if (!raw) return { items: [], pagination: undefined };

  // Cas 1 : { data: { items: [...] } }
  if (raw.data && Array.isArray(raw.data.items)) {
    return { items: raw.data.items, pagination: raw.data.pagination };
  }

  // Cas 2 : { items: [...] }
  if (Array.isArray(raw.items)) {
    return { items: raw.items, pagination: raw.pagination };
  }

  // Cas 3 : { data: [...] }
  if (Array.isArray(raw.data)) {
    return { items: raw.data, pagination: raw.pagination };
  }

  // Cas 4 : réponse directe en tableau
  if (Array.isArray(raw)) {
    return { items: raw, pagination: undefined };
  }

  // Cas 5 : { data: { data: { items: [...] } } } (double wrap)
  if (raw.data?.data && Array.isArray(raw.data.data.items)) {
    return { items: raw.data.data.items, pagination: raw.data.data.pagination };
  }

  return { items: [], pagination: undefined };
}

// ============================================
// COMPOSANT
// ============================================
const UtilisateursPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [params, setParams] = useState<ListUtilisateursParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    nom: string;
    hard: boolean;
  } | null>(null);

  // ─────────────────────────────────────────
  // QUERIES & MUTATIONS
  // ─────────────────────────────────────────
  const { data, isLoading, isError, error, isFetching, refetch } =
    useUtilisateurs(params);

  const toggleMutation = useToggleUtilisateur();
  const softDeleteMutation = useSoftDeleteUtilisateur();
  const hardDeleteMutation = useHardDeleteUtilisateur();

  // ─────────────────────────────────────────
  // LOGS DE DEBUG — à chaque changement
  // ─────────────────────────────────────────
  useEffect(() => {
    console.group('═══════════ [UtilisateursPage] DEBUG ═══════════');
    console.log('1️⃣ Params envoyés :', params);
    console.log('2️⃣ isLoading :', isLoading);
    console.log('3️⃣ isFetching :', isFetching);
    console.log('4️⃣ isError :', isError);
    if (isError) {
      const e: any = error;
      console.error('   ❌ Statut HTTP :', e?.response?.status);
      console.error('   ❌ Message backend :', e?.response?.data?.message);
      console.error('   ❌ Erreur complète :', e);
      if (e?.response?.status === 401) {
        console.error('   💡 Token manquant/expiré → reconnectez-vous');
      } else if (e?.response?.status === 403) {
        console.error('   💡 Rôle non autorisé → vérifiez votre JWT (scope TENANT ?)');
      } else if (e?.response?.status === 500) {
        console.error('   💡 Bug backend → voir terminal backend');
      }
    }
    console.log('5️⃣ data brut (data) :', data);
    console.log('   └─ data.data :', (data as any)?.data);
    console.log('   └─ data.data.items :', (data as any)?.data?.items);
    console.log('   └─ data.items :', (data as any)?.items);
    console.groupEnd();
  }, [params, isLoading, isFetching, isError, error, data]);

  // ─────────────────────────────────────────
  // EXTRACTION ROBUSTE DES DONNÉES
  // ─────────────────────────────────────────
  const { items, pagination } = extractListPayload(data);

  // Log du résultat de l'extraction
  useEffect(() => {
    if (!isLoading) {
      console.group('═══════════ [UtilisateursPage] EXTRACTION ═══════════');
      console.log('✅ Items extraits :', items.length);
      console.log('✅ Pagination :', pagination);
      if (items.length > 0) {
        console.log(
          '📋 Premiers items :',
          items.slice(0, 3).map((u) => ({
            email: u.email,
            role: u.role,
            actif: u.estActif,
          }))
        );
      } else if (!isError && !isLoading) {
        console.warn(
          '⚠️ Aucun item trouvé. Vérifiez la structure de data ci-dessus.'
        );
      }
      console.groupEnd();
    }
  }, [items, pagination, isLoading, isError]);

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams((p) => ({
      ...p,
      page: 1,
      search: searchInput.trim() || undefined,
    }));
  };

  const handleToggle = async (u: Utilisateur) => {
    try {
      await toggleMutation.mutateAsync({
        id: u.id,
        payload: { estActif: !u.estActif },
      });
    } catch {
      /* toast déjà géré par le hook */
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.hard) {
        await hardDeleteMutation.mutateAsync(confirmDelete.id);
      } else {
        await softDeleteMutation.mutateAsync(confirmDelete.id);
      }
      setConfirmDelete(null);
    } catch {
      /* toast déjà géré */
    }
  };

  // ─────────────────────────────────────────
  // EXTRACTION DE L'ERREUR (pour affichage)
  // ─────────────────────────────────────────
  const errorAny: any = error;
  const errorStatus = errorAny?.response?.status;
  const errorMessage =
    errorAny?.response?.data?.message ??
    errorAny?.message ??
    'Réessayez plus tard.';

  // ─────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────
  return (
    <div className="space-y-6 pb-12">
      {/* EN-TÊTE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCircleIcon className="w-7 h-7 text-blue-600" />
            Utilisateurs
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination
              ? `${pagination.total} utilisateur${pagination.total > 1 ? 's' : ''} au total`
              : 'Gestion des comptes de votre établissement'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Rafraîchir"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          <Link
            to="/dashboard/utilisateurs/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
          >
            <UserPlusIcon className="w-4 h-4" />
            Nouvel utilisateur
          </Link>
        </div>
      </div>

     

      {/* BARRE DE RECHERCHE + FILTRES */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={applySearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Rechercher par nom, email, téléphone…"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Rechercher
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
              showFilters
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filtres
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Rôle
              </label>
              <select
                value={params.role ?? ''}
                onChange={(e) =>
                  setParams((p) => ({
                    ...p,
                    page: 1,
                    role: (e.target.value || undefined) as
                      | RoleUtilisateur
                      | undefined,
                  }))
                }
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Tous les rôles</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Statut
              </label>
              <select
                value={
                  params.estActif === undefined
                    ? ''
                    : params.estActif
                    ? 'true'
                    : 'false'
                }
                onChange={(e) =>
                  setParams((p) => ({
                    ...p,
                    page: 1,
                    estActif:
                      e.target.value === ''
                        ? undefined
                        : e.target.value === 'true',
                  }))
                }
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Tous</option>
                <option value="true">Actifs</option>
                <option value="false">Inactifs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Trier par
              </label>
              <select
                value={`${params.sortBy ?? 'createdAt'}:${params.sortOrder ?? 'desc'}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split(':') as [
                    ListUtilisateursParams['sortBy'],
                    ListUtilisateursParams['sortOrder']
                  ];
                  setParams((p) => ({ ...p, sortBy, sortOrder }));
                }}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="createdAt:desc">Plus récents</option>
                <option value="createdAt:asc">Plus anciens</option>
                <option value="nom:asc">Nom (A→Z)</option>
                <option value="nom:desc">Nom (Z→A)</option>
                <option value="email:asc">Email (A→Z)</option>
                <option value="role:asc">Rôle</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-sm text-gray-500">Chargement…</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto" />
            <p className="mt-3 text-sm text-gray-700 font-medium">
              Erreur de chargement
            </p>
            <p className="text-xs text-gray-600 mt-1 font-semibold">
              {errorStatus ? `HTTP ${errorStatus}` : 'Erreur réseau'}
            </p>
            <p className="text-xs text-gray-500 mt-1">{errorMessage}</p>
            {errorStatus === 401 && (
              <p className="text-xs text-red-600 mt-2">
                💡 Votre session a peut-être expiré.{' '}
                <Link to="/login" className="underline font-semibold">
                  Se reconnecter
                </Link>
              </p>
            )}
            {errorStatus === 403 && (
              <p className="text-xs text-red-600 mt-2">
                💡 Vous n'avez pas les droits nécessaires (rôle ou scope TENANT).
              </p>
            )}
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <UserCircleIcon className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="mt-3 text-sm text-gray-700 font-medium">
              Aucun utilisateur trouvé
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {params.search || params.role || params.estActif !== undefined
                ? 'Essayez de modifier vos filtres.'
                : 'Commencez par créer un utilisateur.'}
            </p>
            {import.meta.env.DEV && (
              <p className="text-xs text-yellow-600 mt-3">
                🔍 Debug : data = {JSON.stringify(data, null, 2).slice(0, 200)}…
                {' '}(voir console)
              </p>
            )}
            <Link
              to="/dashboard/utilisateurs/nouveau"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <UserPlusIcon className="w-4 h-4" />
              Créer un utilisateur
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3 font-semibold">Utilisateur</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Rôle</th>
                    <th className="px-4 py-3 font-semibold">Téléphone</th>
                    <th className="px-4 py-3 font-semibold">Statut</th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((u) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {u.photoProfil ? (
                            <img
                              src={u.photoProfil}
                              alt={`${u.prenom ?? ''} ${u.nom ?? ''}`}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                              {safeInitials(u.prenom, u.nom)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {u.prenom ?? '—'} {u.nom ?? ''}
                            </p>
                            <p className="text-xs text-gray-500">
                              {u.emailVerifie
                                ? '✅ Email vérifié'
                                : '⏳ Non vérifié'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${roleBadge(
                            u.role
                          )}`}
                        >
                          {roleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {u.telephone ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        {u.estActif ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                            <XCircleIcon className="w-3.5 h-3.5" />
                            Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/dashboard/utilisateurs/${u.id}`}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                            title="Éditer"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            disabled={
                              toggleMutation.isPending || u.role === 'DIRECTEUR'
                            }
                            onClick={() => handleToggle(u)}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
                              u.estActif
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={
                              u.role === 'DIRECTEUR'
                                ? 'Directeur non modifiable'
                                : u.estActif
                                ? 'Désactiver'
                                : 'Activer'
                            }
                          >
                            <PowerIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={
                              softDeleteMutation.isPending ||
                              u.role === 'DIRECTEUR'
                            }
                            onClick={() =>
                              setConfirmDelete({
                                id: u.id,
                                nom: `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || u.email,
                                hard: false,
                              })
                            }
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                            title={
                              u.role === 'DIRECTEUR'
                                ? 'Directeur non supprimable'
                                : 'Supprimer'
                            }
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Page {pagination.page} sur {pagination.totalPages} ·{' '}
                  {pagination.total} résultat
                  {pagination.total > 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() =>
                      setParams((p) => ({
                        ...p,
                        page: Math.max(1, (p.page ?? 1) - 1),
                      }))
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Précédent
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() =>
                      setParams((p) => ({
                        ...p,
                        page: (p.page ?? 1) + 1,
                      }))
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Suivant
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL CONFIRMATION SUPPRESSION */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Confirmer la suppression
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Voulez-vous vraiment supprimer{' '}
                  <strong>{confirmDelete.nom}</strong> ? Cette action
                  désactivera le compte (soft delete).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={
                  softDeleteMutation.isPending || hardDeleteMutation.isPending
                }
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {softDeleteMutation.isPending || hardDeleteMutation.isPending
                  ? 'Suppression…'
                  : 'Supprimer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UtilisateursPage;