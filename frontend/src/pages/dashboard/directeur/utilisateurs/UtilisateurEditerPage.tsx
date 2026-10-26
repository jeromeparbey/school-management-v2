// frontend2/src/pages/dashboard/directeur/utilisateurs/UtilisateurEditerPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  IdentificationIcon,
  AcademicCapIcon,
  KeyIcon,
  LockClosedIcon,
  XMarkIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { AvatarUpload } from '../../../../components/ui/AvatarUpload';
import {
  useUtilisateur,
  useUpdateUtilisateur,
  useUploadUserPhoto,
  useDeleteUserPhoto,
  useUploadMyPhoto,
  useDeleteMyPhoto,
  useResetPasswordUtilisateur,
} from '../../../../hooks/useUtilisateurs';
import { useAuth } from '../../../../hooks/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import type {
  UpdateUtilisateurPayload,
  Utilisateur,
} from '../../../../types/utilisateur.types';

// ============================================
// CONSTANTES
// ============================================
const ROLE_LABELS: Record<string, string> = {
  DIRECTEUR: 'Directeur',
  ADMIN: 'Administrateur',
  ENSEIGNANT: 'Enseignant',
  ELEVE: 'Élève',
  SURVEILLANT: 'Surveillant',
  SECRETAIRE: 'Secrétaire',
  PARENT: 'Parent',
  BIBLIOTHECAIRE: 'Bibliothécaire',
};

// ============================================
// HELPERS
// ============================================
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  if (!phone) return true;
  return /^[+0-9\s\-().]{6,20}$/.test(phone);
}

function safeInitials(prenom?: string | null, nom?: string | null): string {
  const p = (prenom ?? '').trim();
  const n = (nom ?? '').trim();
  const i1 = p.length > 0 ? p.charAt(0).toUpperCase() : '?';
  const i2 = n.length > 0 ? n.charAt(0).toUpperCase() : '';
  return i1 + i2 || '?';
}

// ============================================
// COMPOSANT
// ============================================
const UtilisateurEditerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  // ⭐ Détection self : l'utilisateur modifie SON propre profil
  const { user: authUser } = useAuth();
  const isSelf = authUser?.id === id;

  // ─── Data ───
  const { data, isLoading, isError, error } = useUtilisateur(id);
  const updateMutation = useUpdateUtilisateur();
  const resetPasswordMutation = useResetPasswordUtilisateur();

  // ⭐ Choisir le bon hook photo selon self vs admin
  const uploadUserPhoto = useUploadUserPhoto();
  const deleteUserPhoto = useDeleteUserPhoto();
  const uploadMyPhoto = useUploadMyPhoto();
  const deleteMyPhoto = useDeleteMyPhoto();

  // Extraction robuste
  const u: Utilisateur | undefined =
    (data as any)?.data?.utilisateur ?? (data as any)?.data ?? (data as any);

  // ─── Form state ───
  const [form, setForm] = useState<UpdateUtilisateurPayload>({});
  const [initialForm, setInitialForm] = useState<UpdateUtilisateurPayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Pré-remplir
  useEffect(() => {
    if (!u) return;
    const initial: UpdateUtilisateurPayload = {
      prenom: u.prenom,
      nom: u.nom,
      email: u.email,
      telephone: u.telephone ?? '',
      ...(u.role === 'ELEVE' && {
        sexe: (u as any).eleve?.sexe ?? 'M',
        dateNaissance: (u as any).eleve?.dateNaissance
          ? new Date((u as any).eleve.dateNaissance).toISOString().slice(0, 10)
          : undefined,
        lieuNaissance: (u as any).eleve?.lieuNaissance ?? '',
        nationalite: (u as any).eleve?.nationalite ?? '',
        adresse: (u as any).eleve?.adresse ?? '',
        groupeSanguin: (u as any).eleve?.groupeSanguin ?? '',
        allergies: (u as any).eleve?.allergies ?? '',
        infoMedicale: (u as any).eleve?.infoMedicale ?? '',
      }),
      ...(u.role === 'ENSEIGNANT' && {
        sexe: (u as any).enseignant?.sexe ?? 'M',
        dateNaissance: (u as any).enseignant?.dateNaissance
          ? new Date((u as any).enseignant.dateNaissance).toISOString().slice(0, 10)
          : undefined,
        adresse: (u as any).enseignant?.adresse ?? '',
        typeContrat: (u as any).enseignant?.typeContrat ?? 'CDI',
        qualification: (u as any).enseignant?.qualification ?? '',
        specialite: (u as any).enseignant?.specialite ?? '',
        salaireBase: (u as any).enseignant?.salaireBase ?? 0,
      }),
      ...(u.role === 'SURVEILLANT' && {
        sexe: (u as any).surveillant?.sexe ?? 'M',
        dateNaissance: (u as any).surveillant?.dateNaissance
          ? new Date((u as any).surveillant.dateNaissance).toISOString().slice(0, 10)
          : undefined,
        adresse: (u as any).surveillant?.adresse ?? '',
        typeContrat: (u as any).surveillant?.typeContrat ?? 'CDI',
        zoneSurveillance: (u as any).surveillant?.zoneSurveillance ?? '',
      }),
      ...(u.role === 'PARENT' && {
        adresse: (u as any).parent?.adresse ?? '',
      }),
    };
    setForm(initial);
    setInitialForm(initial);
  }, [u]);

  // ⭐ Détection "dirty" : a-t-on changé quelque chose ?
  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

  const handleChange = (field: keyof UpdateUtilisateurPayload, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((e) => {
        const copy = { ...e };
        delete copy[field];
        return copy;
      });
    }
  };

  // ─── Validation ───
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.prenom?.trim()) e.prenom = 'Prénom requis';
    if (!form.nom?.trim()) e.nom = 'Nom requis';
    if (!form.email?.trim()) e.email = 'Email requis';
    else if (!isValidEmail(form.email)) e.email = 'Email invalide';
    if (form.telephone && !isValidPhone(form.telephone)) {
      e.telephone = 'Téléphone invalide';
    }
    if ((form as any).salaireBase !== undefined && (form as any).salaireBase < 0) {
      e.salaireBase = 'Salaire doit être positif';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Photo ───
  const handlePhotoSelected = async (file: File) => {
    if (!u) return;
    try {
      if (isSelf) {
        await uploadMyPhoto.mutateAsync(file);
      } else {
        await uploadUserPhoto.mutateAsync({ id: u.id, file });
      }
    } catch {
      /* toast géré par le hook */
    }
  };

  const handleRemovePhoto = async () => {
    if (!u) return;
    try {
      if (isSelf) {
        await deleteMyPhoto.mutateAsync();
      } else {
        await deleteUserPhoto.mutateAsync(u.id);
      }
    } catch {
      /* toast géré */
    }
  };

  // ─── Reset password (modal) ───
  const handleOpenResetModal = () => {
    setNewPassword('');
    setShowResetModal(true);
  };

  const handleConfirmReset = async () => {
    if (!u) return;
    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync({
        id: u.id,
        payload: { nouveauMotDePasse: newPassword },
      });
      setShowResetModal(false);
      setNewPassword('');
      toast.success(
        'Mot de passe réinitialisé. Communiquez-le à l\'utilisateur.'
      );
    } catch {
      /* toast géré */
    }
  };

  // ─── Submit ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!u) return;
    if (!validate()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: u.id, payload: form });
      navigate(
        isSelf ? '/dashboard/mon-profil' : `/dashboard/utilisateurs/${u.id}`
      );
    } catch {
      /* toast géré */
    }
  };

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-64 bg-gray-200 rounded" />
        <div className="h-20 bg-gray-100 rounded-2xl" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  // ─── Error ───
  if (isError || !u) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Utilisateur introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ??
              'Une erreur est survenue lors du chargement.'}
          </p>
          <Link
            to="/dashboard/utilisateurs"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  // ─── Dérivés ───
  const initials = safeInitials(u.prenom, u.nom);
  const isEleve = u.role === 'ELEVE';
  const isEnseignant = u.role === 'ENSEIGNANT';
  const isSurveillant = u.role === 'SURVEILLANT';
  const isParent = u.role === 'PARENT';
  const isDirecteur = u.role === 'DIRECTEUR';

  const isUploadingPhoto =
    uploadUserPhoto.isPending ||
    deleteUserPhoto.isPending ||
    uploadMyPhoto.isPending ||
    deleteMyPhoto.isPending;

  const returnUrl = isSelf
    ? '/dashboard/mon-profil'
    : `/dashboard/utilisateurs/${u.id}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ============================================
          BREADCRUMB
          ============================================ */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        {!isSelf && (
          <>
            <Link
              to="/dashboard/utilisateurs"
              className="hover:text-gray-900"
            >
              Utilisateurs
            </Link>
            <ChevronRightIcon className="w-4 h-4" />
          </>
        )}
        <Link to={returnUrl} className="hover:text-gray-900 truncate">
          {u.prenom} {u.nom}
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Éditer</span>
      </nav>

      {/* ============================================
          HEADER
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex items-start gap-4">
          <Link
            to={returnUrl}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            title="Retour"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserIcon className="w-7 h-7 text-blue-600" />
              {isSelf ? 'Modifier mon profil' : "Modifier l'utilisateur"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {u.prenom} {u.nom} · {ROLE_LABELS[u.role] ?? u.role}
            </p>
          </div>
        </div>

        {/* ⭐ Bandeau "self" */}
        {isSelf && (
          <div className="mt-4 flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <strong>Vous modifiez votre propre profil.</strong> Certains champs
              sensibles (rôle, salaire, statut) sont gérés par la direction et
              ne sont pas modifiables ici.
            </div>
          </div>
        )}

        {/* ⭐ Bandeau "directeur protégé" */}
        {isDirecteur && !isSelf && (
          <div className="mt-4 flex items-start gap-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
            <ShieldCheckIcon className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-orange-800">
              Ce compte est un <strong>Directeur</strong>. Certaines actions
              (désactivation, suppression) sont protégées.
            </div>
          </div>
        )}

        {/* ⭐ Indicateur modifications non sauvegardées */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800"
            >
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
              Modifications non enregistrées
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ============================================
          FORMULAIRE
          ============================================ */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── PHOTO + IDENTITÉ ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
        >
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <IdentificationIcon className="w-4 h-4 text-blue-500" />
            Photo & Identité
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo */}
            <div className="flex flex-col items-center">
              <AvatarUpload
                currentUrl={u.photoProfil}
                initials={initials}
                onFileSelected={handlePhotoSelected}
                onRemove={handleRemovePhoto}
                isUploading={isUploadingPhoto}
                maxSizeMB={5}
              />
            </div>

            {/* Champs */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="prenom"
                    className="block text-xs font-medium text-gray-600 mb-1.5"
                  >
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="prenom"
                    type="text"
                    value={form.prenom ?? ''}
                    onChange={(e) => handleChange('prenom', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.prenom ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.prenom && (
                    <p className="text-xs text-red-600 mt-1">{errors.prenom}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="nom"
                    className="block text-xs font-medium text-gray-600 mb-1.5"
                  >
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nom"
                    type="text"
                    value={form.nom ?? ''}
                    onChange={(e) => handleChange('nom', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.nom ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.nom && (
                    <p className="text-xs text-red-600 mt-1">{errors.nom}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-gray-600 mb-1.5"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email ?? ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.email ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="telephone"
                    className="block text-xs font-medium text-gray-600 mb-1.5"
                  >
                    Téléphone
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    value={form.telephone ?? ''}
                    onChange={(e) => handleChange('telephone', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.telephone ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.telephone && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.telephone}
                    </p>
                  )}
                </div>
              </div>

              {/* Rôle lecture seule */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <ShieldCheckIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <strong>Rôle :</strong> {ROLE_LABELS[u.role] ?? u.role} — Non
                  modifiable via ce formulaire.
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── PROFIL ÉLÈVE ─── */}
        {isEleve && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
          >
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AcademicCapIcon className="w-4 h-4 text-emerald-500" />
              Profil élève
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Sexe
                </label>
                <select
                  value={form.sexe ?? 'M'}
                  onChange={(e) => handleChange('sexe', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={(form.dateNaissance as string) ?? ''}
                  onChange={(e) =>
                    handleChange('dateNaissance', e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Lieu de naissance
                </label>
                <input
                  type="text"
                  value={form.lieuNaissance ?? ''}
                  onChange={(e) =>
                    handleChange('lieuNaissance', e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Nationalité
                </label>
                <input
                  type="text"
                  value={form.nationalite ?? ''}
                  onChange={(e) =>
                    handleChange('nationalite', e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Adresse
                </label>
                <input
                  type="text"
                  value={form.adresse ?? ''}
                  onChange={(e) => handleChange('adresse', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Groupe sanguin
                </label>
                <select
                  value={form.groupeSanguin ?? ''}
                  onChange={(e) =>
                    handleChange('groupeSanguin', e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">—</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                    (g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Allergies
                </label>
                <input
                  type="text"
                  value={form.allergies ?? ''}
                  onChange={(e) => handleChange('allergies', e.target.value)}
                  placeholder="Aucune"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Informations médicales
                </label>
                <textarea
                  rows={2}
                  value={form.infoMedicale ?? ''}
                  onChange={(e) =>
                    handleChange('infoMedicale', e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── PROFIL ENSEIGNANT ─── */}
        {isEnseignant && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
          >
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AcademicCapIcon className="w-4 h-4 text-blue-500" />
              Profil enseignant
            </h2>

            {isSelf && (
              <div className="mb-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <LockClosedIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800">
                  Les informations contractuelles (salaire, type de contrat,
                  qualification) sont gérées par la direction.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Sexe
                </label>
                <select
                  value={form.sexe ?? 'M'}
                  onChange={(e) => handleChange('sexe', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={(form.dateNaissance as string) ?? ''}
                  onChange={(e) =>
                    handleChange('dateNaissance', e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Adresse
                </label>
                <input
                  type="text"
                  value={form.adresse ?? ''}
                  onChange={(e) => handleChange('adresse', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Champs admin-only */}
              {!isSelf && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Type de contrat
                    </label>
                    <select
                      value={form.typeContrat ?? 'CDI'}
                      onChange={(e) =>
                        handleChange('typeContrat', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="VACATAIRE">Vacataire</option>
                      <option value="STAGIAIRE">Stagiaire</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Qualification
                    </label>
                    <input
                      type="text"
                      value={form.qualification ?? ''}
                      onChange={(e) =>
                        handleChange('qualification', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Spécialité
                    </label>
                    <input
                      type="text"
                      value={form.specialite ?? ''}
                      onChange={(e) =>
                        handleChange('specialite', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Salaire de base (XOF)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.salaireBase ?? 0}
                      onChange={(e) =>
                        handleChange('salaireBase', Number(e.target.value))
                      }
                      className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                        errors.salaireBase
                          ? 'border-red-400'
                          : 'border-gray-200'
                      }`}
                    />
                    {errors.salaireBase && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.salaireBase}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── PROFIL SURVEILLANT ─── */}
        {isSurveillant && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
          >
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
              Profil surveillant
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Sexe
                </label>
                <select
                  value={form.sexe ?? 'M'}
                  onChange={(e) => handleChange('sexe', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={(form.dateNaissance as string) ?? ''}
                  onChange={(e) =>
                    handleChange('dateNaissance', e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Adresse
                </label>
                <input
                  type="text"
                  value={form.adresse ?? ''}
                  onChange={(e) => handleChange('adresse', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {!isSelf && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Type de contrat
                    </label>
                    <select
                      value={form.typeContrat ?? 'CDI'}
                      onChange={(e) =>
                        handleChange('typeContrat', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Zone de surveillance
                    </label>
                    <input
                      type="text"
                      value={form.zoneSurveillance ?? ''}
                      onChange={(e) =>
                        handleChange('zoneSurveillance', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── PROFIL PARENT ─── */}
        {isParent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
          >
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-pink-500" />
              Profil parent
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Adresse
                </label>
                <input
                  type="text"
                  value={form.adresse ?? ''}
                  onChange={(e) => handleChange('adresse', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── SÉCURITÉ (admin only, masqué pour self) ─── */}
        {!isSelf && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
          >
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <KeyIcon className="w-4 h-4 text-red-500" />
              Sécurité (action séparée)
            </h2>

            <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Réinitialiser le mot de passe
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Génère un nouveau mot de passe hashé et révoque les sessions
                  actives.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenResetModal}
                disabled={resetPasswordMutation.isPending}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <KeyIcon className="w-4 h-4" />
                Reset mot de passe
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── BOUTONS ─── */}
        <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white/80 backdrop-blur rounded-xl p-3 shadow-lg border border-gray-100">
          <Link
            to={returnUrl}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending || !isDirty}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!isDirty ? 'Aucune modification à enregistrer' : ''}
          >
            {updateMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Enregistrement…
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>

      {/* ============================================
          MODAL RESET PASSWORD
          ============================================ */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                  <KeyIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    Réinitialiser le mot de passe
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Nouveau mot de passe pour{' '}
                    <strong>
                      {u.prenom} {u.nom}
                    </strong>
                    . Min. 8 caractères.
                  </p>
                </div>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Nouveau mot de passe
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 caractères"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  autoFocus
                />
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <InformationCircleIcon className="w-3.5 h-3.5" />
                  Notez-le et communiquez-le à l'utilisateur.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  disabled={
                    resetPasswordMutation.isPending ||
                    newPassword.length < 8
                  }
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {resetPasswordMutation.isPending
                    ? 'Enregistrement…'
                    : 'Confirmer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UtilisateurEditerPage;