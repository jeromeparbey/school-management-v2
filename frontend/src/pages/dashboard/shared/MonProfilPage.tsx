// frontend2/src/pages/dashboard/shared/MonProfilPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  KeyIcon,
  ChevronRightIcon,
  IdentificationIcon,
  LockClosedIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { AvatarUpload } from '../../../components/ui/AvatarUpload';
import {
  useCurrentUtilisateur,
  useUpdateUtilisateur,
  useUploadMyPhoto,
  useDeleteMyPhoto,
  useChangePasswordUtilisateur,
} from '../../../hooks/useUtilisateurs';
import { useAuth } from '../../../hooks/AuthContext';
import { useToast } from '../../../context/ToastContext';
import type {
  UpdateUtilisateurPayload,
  Utilisateur,
} from '../../../types/utilisateur.types';

// ═══════════════════════════════════════════════════════════
// 🔍 LOG HELPERS
// ═══════════════════════════════════════════════════════════

const PAGE = 'MonProfilPage';

const log = (msg: string, detail?: any) => {
  const ts = new Date().toLocaleTimeString('fr-FR');
  console.log(`%c[${PAGE}] ${ts} — ${msg}`, 'color:#2563eb;font-weight:bold', detail ?? '');
};

const logWarn = (msg: string, detail?: any) => {
  const ts = new Date().toLocaleTimeString('fr-FR');
  console.warn(`%c[${PAGE}] ${ts} ⚠️ ${msg}`, 'color:#d97706;font-weight:bold', detail ?? '');
};

const logErr = (msg: string, detail?: any) => {
  const ts = new Date().toLocaleTimeString('fr-FR');
  console.error(`%c[${PAGE}] ${ts} ❌ ${msg}`, 'color:#dc2626;font-weight:bold', detail ?? '');
};

const logOk = (msg: string, detail?: any) => {
  const ts = new Date().toLocaleTimeString('fr-FR');
  console.log(`%c[${PAGE}] ${ts} ✅ ${msg}`, 'color:#16a34a;font-weight:bold', detail ?? '');
};

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

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  DIRECTEUR: { bg: 'bg-rose-100', text: 'text-rose-700' },
  ADMIN: { bg: 'bg-red-100', text: 'text-red-700' },
  ENSEIGNANT: { bg: 'bg-blue-100', text: 'text-blue-700' },
  ELEVE: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  SURVEILLANT: { bg: 'bg-amber-100', text: 'text-amber-700' },
  SECRETAIRE: { bg: 'bg-violet-100', text: 'text-violet-700' },
  PARENT: { bg: 'bg-pink-100', text: 'text-pink-700' },
  BIBLIOTHECAIRE: { bg: 'bg-orange-100', text: 'text-orange-700' },
};

const ROLES_WITH_DETAIL_ACCESS = [
  'DIRECTEUR',
  'ADMIN',
  'SECRETAIRE',
  'SUPER_ADMIN',
  'ADMIN_SYSTEME',
];

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

function getPasswordStrength(pwd: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const capped = Math.min(score, 4);

  if (capped <= 1) return { score: capped, label: 'Faible', color: 'bg-red-500' };
  if (capped === 2) return { score: capped, label: 'Moyen', color: 'bg-amber-500' };
  if (capped === 3) return { score: capped, label: 'Bon', color: 'bg-lime-500' };
  return { score: capped, label: 'Fort', color: 'bg-emerald-500' };
}

// ============================================
// COMPOSANT
// ============================================
const MonProfilPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user: authUser } = useAuth();

  log('🟢 Composant monté', { authUser: authUser?.email });

  // ─── Data ───
  const { data, isLoading, isError, error, refetch } = useCurrentUtilisateur();
  const updateMutation = useUpdateUtilisateur();
  const uploadPhoto = useUploadMyPhoto();
  const deletePhoto = useDeleteMyPhoto();
  const changePassword = useChangePasswordUtilisateur();

  // Extraction robuste
  const u: Utilisateur | undefined =
    (data as any)?.data?.utilisateur ?? (data as any)?.data ?? (data as any);

  // 🔍 LOG — Données reçues
  useEffect(() => {
    log('📥 Données profil reçues', {
      isLoading,
      isError,
      hasData: !!data,
      extracted: u
        ? { email: u.email, role: u.role, photoProfil: u.photoProfil }
        : null,
      rawData: data,
    });
  }, [data, isLoading, isError, u]);

  // ─── Form state ───
  const [form, setForm] = useState<UpdateUtilisateurPayload>({});
  const [initialForm, setInitialForm] = useState<UpdateUtilisateurPayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mot de passe
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmation: '',
  });
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // ─── Pré-remplir ───
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
          ? new Date((u as any).enseignant.dateNaissance)
              .toISOString()
              .slice(0, 10)
          : undefined,
        adresse: (u as any).enseignant?.adresse ?? '',
      }),
      ...(u.role === 'SURVEILLANT' && {
        sexe: (u as any).surveillant?.sexe ?? 'M',
        dateNaissance: (u as any).surveillant?.dateNaissance
          ? new Date((u as any).surveillant.dateNaissance)
              .toISOString()
              .slice(0, 10)
          : undefined,
        adresse: (u as any).surveillant?.adresse ?? '',
      }),
      ...(u.role === 'PARENT' && {
        adresse: (u as any).parent?.adresse ?? '',
      }),
    };
    log('📝 Formulaire pré-rempli', initial);
    setForm(initial);
    setInitialForm(initial);
  }, [u]);

  // ─── Détection "dirty" ───
  const isDirty = useMemo(() => {
    const dirty = JSON.stringify(form) !== JSON.stringify(initialForm);
    if (dirty) {
      log('⚠️ Formulaire modifié (dirty)', {
        champsModifies: Object.keys(form).filter(
          (k) => (form as any)[k] !== (initialForm as any)[k]
        ),
      });
    }
    return dirty;
  }, [form, initialForm]);

  // ─── Force du mot de passe ───
  const pwdStrength = useMemo(
    () => getPasswordStrength(pwdForm.nouveauMotDePasse),
    [pwdForm.nouveauMotDePasse]
  );

  const handleChange = (field: keyof UpdateUtilisateurPayload, value: any) => {
    log('✏️ Changement de champ', { field, value });
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
    log('🔍 Validation du formulaire');
    const e: Record<string, string> = {};
    if (!form.prenom?.trim()) e.prenom = 'Prénom requis';
    if (!form.nom?.trim()) e.nom = 'Nom requis';
    if (!form.email?.trim()) e.email = 'Email requis';
    else if (!isValidEmail(form.email)) e.email = 'Email invalide';
    if (form.telephone && !isValidPhone(form.telephone)) {
      e.telephone = 'Téléphone invalide';
    }
    setErrors(e);

    const isValid = Object.keys(e).length === 0;
    if (isValid) {
      logOk('Validation réussie');
    } else {
      logErr('Validation échouée', e);
    }
    return isValid;
  };

  // ─── Photo ───
  const handlePhotoSelected = async (file: File) => {
    log('📸 Photo sélectionnée', {
      name: file.name,
      type: file.type,
      sizeKB: (file.size / 1024).toFixed(1),
    });
    try {
      log('🚀 Upload photo en cours...');
      const result = await uploadPhoto.mutateAsync(file);
      logOk('Upload terminé', result);
    } catch (err) {
      logErr('Upload échoué', err);
    }
  };

  const handleRemovePhoto = async () => {
    log('🗑️ Suppression photo demandée');
    if (!confirm('Supprimer votre photo de profil ?')) {
      log('Annulation suppression');
      return;
    }
    try {
      await deletePhoto.mutateAsync();
      logOk('Photo supprimée');
    } catch (err) {
      logErr('Suppression échouée', err);
    }
  };

  // ─── Submit profil ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    log('💾 Soumission formulaire profil');
    if (!u) {
      logErr('Utilisateur non défini');
      return;
    }
    if (!validate()) {
      logErr('Formulaire invalide');
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }
    try {
      log('🚀 Envoi update...', { id: u.id, champs: Object.keys(form) });
      await updateMutation.mutateAsync({ id: u.id, payload: form });
      logOk('Mise à jour réussie');
      setInitialForm(form);
    } catch (err) {
      logErr('Échec mise à jour', err);
    }
  };

  // ─── Mot de passe ───
  const handleOpenPwdModal = () => {
    log('🔐 Ouverture modal mot de passe');
    setShowPwdModal(true);
    setPwdError(null);
  };

  const handleClosePwdModal = () => {
    log('🔐 Fermeture modal mot de passe');
    setShowPwdModal(false);
    setPwdError(null);
    setPwdForm({
      ancienMotDePasse: '',
      nouveauMotDePasse: '',
      confirmation: '',
    });
    setShowOldPwd(false);
    setShowNewPwd(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    log('🔐 Tentative changement mot de passe');
    setPwdError(null);

    if (pwdForm.nouveauMotDePasse !== pwdForm.confirmation) {
      logErr('Mots de passe non identiques');
      setPwdError('Les mots de passe ne correspondent pas');
      return;
    }

    if (pwdForm.nouveauMotDePasse.length < 8) {
      logErr('Mot de passe trop court');
      setPwdError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (pwdForm.ancienMotDePasse === pwdForm.nouveauMotDePasse) {
      logErr('Nouveau = ancien');
      setPwdError("Le nouveau mot de passe doit être différent de l'ancien");
      return;
    }

    try {
      log('🚀 Envoi changement pwd...');
      await changePassword.mutateAsync({
        ancienMotDePasse: pwdForm.ancienMotDePasse,
        nouveauMotDePasse: pwdForm.nouveauMotDePasse,
      });
      logOk('Mot de passe changé');
      handleClosePwdModal();
      toast.success('Mot de passe modifié avec succès');
    } catch (err: any) {
      logErr('Échec changement pwd', err);
      setPwdError(
        err?.response?.data?.message ??
          'Erreur lors du changement de mot de passe'
      );
    }
  };

  // ─── Loading ───
  if (isLoading) {
    log('⏳ Loading en cours...');
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-24 bg-blue-100 rounded-2xl" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  // ─── Error ───
  if (isError || !u) {
    logErr('❌ Erreur de chargement', {
      isError,
      hasU: !!u,
      error: (error as any)?.response?.data ?? (error as any)?.message,
    });
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Profil introuvable</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message ?? 'Réessayez plus tard.'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Retour au dashboard
            </Link>
            <button
              onClick={() => {
                log('🔄 Refetch demandé');
                refetch();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Dérivés ───
  const initials = safeInitials(u.prenom, u.nom);
  const roleStyle = ROLE_COLORS[u.role] ?? {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
  };
  const isEleve = u.role === 'ELEVE';
  const isEnseignant = u.role === 'ENSEIGNANT';
  const isSurveillant = u.role === 'SURVEILLANT';
  const isParent = u.role === 'PARENT';
  const canSeeAdminDetail = ROLES_WITH_DETAIL_ACCESS.includes(u.role);

  log('🎨 Rendu formulaire', {
    role: u.role,
    isEleve,
    isEnseignant,
    isSurveillant,
    isParent,
    canSeeAdminDetail,
    isDirty,
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* ═══════════════════════════════════════
          BREADCRUMB
          ═══════════════════════════════════════ */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Mon profil</span>
      </nav>

      {/* ═══════════════════════════════════════
          HEADER
          ═══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 right-8 w-24 h-24 bg-white/5 rounded-full -mb-12" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <UserCircleIcon className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold">Mon profil</h1>
              <p className="text-blue-100 text-sm mt-0.5 flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${roleStyle.bg} ${roleStyle.text}`}
                >
                  {ROLE_LABELS[u.role] ?? u.role}
                </span>
                <span className="opacity-80">{u.email}</span>
              </p>
            </div>
          </div>

          {canSeeAdminDetail && (
            <Link
              to={`/dashboard/utilisateurs/${u.id}`}
              onClick={() => log('🔗 Navigation vers détail admin', { id: u.id })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-lg transition-colors border border-white/20"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              Voir mon profil complet
            </Link>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════
          INFO BAND
          ═══════════════════════════════════════ */}
      <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <strong>Ceci est votre profil personnel.</strong> Vous pouvez modifier
          vos informations de contact et votre photo. Les champs contractuels
          (salaire, contrat, etc.) sont gérés par la direction.
        </div>
      </div>

      {/* ═══════════════════════════════════════
          FORMULAIRE
          ═══════════════════════════════════════ */}
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
            <div className="flex flex-col items-center">
              <AvatarUpload
                currentUrl={u.photoProfil}
                initials={initials}
                onFileSelected={handlePhotoSelected}
                onRemove={handleRemovePhoto}
                isUploading={uploadPhoto.isPending || deletePhoto.isPending}
                maxSizeMB={5}
              />
            </div>

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
                    autoComplete="given-name"
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
                    autoComplete="family-name"
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
                    autoComplete="email"
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
                    autoComplete="tel"
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

              <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <ShieldCheckIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="text-xs text-gray-600">
                  <strong>Rôle :</strong> {ROLE_LABELS[u.role] ?? u.role} — Non
                  modifiable
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
              Mon profil élève
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
                  onChange={(e) => handleChange('dateNaissance', e.target.value)}
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
                  onChange={(e) => handleChange('lieuNaissance', e.target.value)}
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
                  onChange={(e) => handleChange('nationalite', e.target.value)}
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
                  onChange={(e) => handleChange('groupeSanguin', e.target.value)}
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
              Mon profil enseignant
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
                  onChange={(e) => handleChange('dateNaissance', e.target.value)}
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
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2">
              <LockClosedIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                Les informations contractuelles (salaire, type de contrat,
                qualification) sont gérées par la direction.
              </div>
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
              Mon profil surveillant
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
                  onChange={(e) => handleChange('dateNaissance', e.target.value)}
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
              <UserCircleIcon className="w-4 h-4 text-pink-500" />
              Mon profil parent
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

        {/* ─── MOT DE PASSE ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <KeyIcon className="w-4 h-4 text-red-500" />
              Mot de passe
            </h2>
            <button
              type="button"
              onClick={handleOpenPwdModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
            >
              <LockClosedIcon className="w-4 h-4" />
              Changer le mot de passe
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Pour des raisons de sécurité, vous pouvez modifier votre mot de
            passe à tout moment. Votre ancien mot de passe sera requis.
          </p>
        </motion.div>

        {/* ─── BOUTON SUBMIT (sticky) ─── */}
        <div className="flex items-center justify-between gap-3 sticky bottom-4 bg-white/80 backdrop-blur rounded-xl p-3 shadow-lg border border-gray-100">
          <AnimatePresence>
            {isDirty && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xs text-amber-700 flex items-center gap-1.5"
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
                Modifications non enregistrées
              </motion.span>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 ml-auto">
            <Link
              to="/dashboard"
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
        </div>
      </form>

      {/* ═══════════════════════════════════════
          MODAL CHANGEMENT MOT DE PASSE
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showPwdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleClosePwdModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
                    <KeyIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Changer le mot de passe
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Votre ancien mot de passe est requis
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClosePwdModal}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Ancien mot de passe */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPwd ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={pwdForm.ancienMotDePasse}
                      onChange={(e) => {
                        setPwdForm((f) => ({
                          ...f,
                          ancienMotDePasse: e.target.value,
                        }));
                        setPwdError(null);
                      }}
                      className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPwd((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
                    >
                      {showOldPwd ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={pwdForm.nouveauMotDePasse}
                      onChange={(e) => {
                        setPwdForm((f) => ({
                          ...f,
                          nouveauMotDePasse: e.target.value,
                        }));
                        setPwdError(null);
                      }}
                      className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPwd ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {pwdForm.nouveauMotDePasse && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${pwdStrength.color} transition-all`}
                            style={{
                              width: `${(pwdStrength.score / 4) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 min-w-[50px]">
                          {pwdStrength.label}
                        </span>
                      </div>
                      <ul className="text-[10px] text-gray-500 space-y-0.5">
                        <li
                          className={
                            pwdForm.nouveauMotDePasse.length >= 8
                              ? 'text-emerald-600'
                              : ''
                          }
                        >
                          ✓ Au moins 8 caractères
                        </li>
                        <li
                          className={
                            /[A-Z]/.test(pwdForm.nouveauMotDePasse) &&
                            /[a-z]/.test(pwdForm.nouveauMotDePasse)
                              ? 'text-emerald-600'
                              : ''
                          }
                        >
                          ✓ Majuscule et minuscule
                        </li>
                        <li
                          className={
                            /[0-9]/.test(pwdForm.nouveauMotDePasse)
                              ? 'text-emerald-600'
                              : ''
                          }
                        >
                          ✓ Au moins un chiffre
                        </li>
                        <li
                          className={
                            /[^A-Za-z0-9]/.test(pwdForm.nouveauMotDePasse)
                              ? 'text-emerald-600'
                              : ''
                          }
                        >
                          ✓ Un caractère spécial
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirmation */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={pwdForm.confirmation}
                    onChange={(e) => {
                      setPwdForm((f) => ({
                        ...f,
                        confirmation: e.target.value,
                      }));
                      setPwdError(null);
                    }}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      pwdForm.confirmation &&
                      pwdForm.confirmation !== pwdForm.nouveauMotDePasse
                        ? 'border-red-400'
                        : 'border-gray-200'
                    }`}
                    required
                  />
                  {pwdForm.confirmation &&
                    pwdForm.confirmation !== pwdForm.nouveauMotDePasse && (
                      <p className="text-xs text-red-600 mt-1">
                        Les mots de passe ne correspondent pas
                      </p>
                    )}
                </div>

                {pwdError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-700">{pwdError}</p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleClosePwdModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={
                      changePassword.isPending ||
                      pwdForm.nouveauMotDePasse.length < 8 ||
                      pwdForm.nouveauMotDePasse !== pwdForm.confirmation
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changePassword.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                        Changement…
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-4 h-4" />
                        Changer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MonProfilPage;