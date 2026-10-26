// frontend2/src/pages/dashboard/directeur/utilisateurs/UtilisateurNouveauPage.tsx

import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  UserPlusIcon,
  UserCircleIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  UserIcon,
  CalendarIcon,
  BriefcaseIcon,
  BanknotesIcon,
  BookOpenIcon,
  HeartIcon,
  BuildingOfficeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useCreateUtilisateur } from '../../../../hooks/useUtilisateurs';
import { useToast } from '../../../../context/ToastContext';
import type {
  CreateUtilisateurPayload,
  RoleUtilisateur,
  Sexe,
  TypeContrat,
  GroupeSanguin,
} from '../../../../types/utilisateur.types';

// ============================================
// CONSTANTES
// ============================================
const ROLES: {
  value: RoleUtilisateur;
  label: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  { value: 'ENSEIGNANT',      label: 'Enseignant',      desc: 'Donne des cours, saisit des notes',   icon: AcademicCapIcon },
  { value: 'ELEVE',           label: 'Élève',           desc: 'Suivi scolaire, notes, bulletins',    icon: UserIcon },
  { value: 'SURVEILLANT',     label: 'Surveillant',     desc: 'Discipline et incidents',             icon: ShieldCheckIcon },
  { value: 'SECRETAIRE',      label: 'Secrétaire',      desc: 'Gestion administrative',              icon: BriefcaseIcon },
  { value: 'PARENT',          label: 'Parent',          desc: 'Suivi de ses enfants',                icon: HeartIcon },
  { value: 'BIBLIOTHECAIRE',  label: 'Bibliothécaire',  desc: 'Gestion de la bibliothèque',          icon: BookOpenIcon },
  { value: 'ADMIN',           label: 'Administrateur',  desc: 'Administration de l\'établissement',  icon: ShieldCheckIcon },
  { value: 'DIRECTEUR',       label: 'Directeur',       desc: 'Direction de l\'établissement',       icon: BuildingOfficeIcon },
];

const SEXES: { value: Sexe; label: string }[] = [
  { value: 'M',     label: 'Masculin' },
  { value: 'F',     label: 'Féminin' },
  { value: 'AUTRE', label: 'Autre' },
];

const TYPES_CONTRAT: TypeContrat[] = ['CDI', 'CDD', 'VACATAIRE', 'STAGIAIRE', 'BENEVOLE'];
const GROUPES_SANGUINS: GroupeSanguin[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Champs requis selon le rôle (aligné sur le backend Zod)
const ROLE_REQUIREMENTS: Record<RoleUtilisateur, {
  needsSexe: boolean;
  needsDateNaissance: boolean;
  needsTelephone: boolean;
  needsDateEmbauche: boolean;
  needsSalaire: boolean;
}> = {
  ELEVE:          { needsSexe: true,  needsDateNaissance: true,  needsTelephone: false, needsDateEmbauche: false, needsSalaire: false },
  ENSEIGNANT:     { needsSexe: true,  needsDateNaissance: true,  needsTelephone: true,  needsDateEmbauche: true,  needsSalaire: true  },
  SURVEILLANT:    { needsSexe: true,  needsDateNaissance: false, needsTelephone: true,  needsDateEmbauche: true,  needsSalaire: false },
  SECRETAIRE:     { needsSexe: false, needsDateNaissance: false, needsTelephone: false, needsDateEmbauche: false, needsSalaire: false },
  PARENT:         { needsSexe: false, needsDateNaissance: false, needsTelephone: false, needsDateEmbauche: false, needsSalaire: false },
  BIBLIOTHECAIRE: { needsSexe: false, needsDateNaissance: false, needsTelephone: false, needsDateEmbauche: false, needsSalaire: false },
  ADMIN:          { needsSexe: false, needsDateNaissance: false, needsTelephone: false, needsDateEmbauche: false, needsSalaire: false },
  DIRECTEUR:      { needsSexe: false, needsDateNaissance: false, needsTelephone: false, needsDateEmbauche: false, needsSalaire: false },
};

// ============================================
// HELPERS
// ============================================
const normalizePhone = (v: string): string =>
  v.replace(/[^+0-9 ()-]/g, '').slice(0, 30);

const initialForm: CreateUtilisateurPayload = {
  email: '',
  motDePasse: '',
  prenom: '',
  nom: '',
  role: 'ENSEIGNANT',
  telephone: '',
  photoProfil: null,
  sexe: 'M',
  dateNaissance: '',
  adresse: '',
  lieuNaissance: '',
  nationalite: '',
  groupeSanguin: null,
  allergies: '',
  infoMedicale: '',
  dateEmbauche: '',
  typeContrat: 'CDI',
  qualification: '',
  specialite: '',
  salaireBase: 0,
  zoneSurveillance: '',
};

// ============================================
// COMPOSANT
// ============================================
const UtilisateurNouveauPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<CreateUtilisateurPayload>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateUtilisateur();

  const req = ROLE_REQUIREMENTS[form.role];

  const selectedRole = useMemo(
    () => ROLES.find((r) => r.value === form.role)!,
    [form.role]
  );

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const update = <K extends keyof CreateUtilisateurPayload>(
    field: K,
    value: CreateUtilisateurPayload[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  const handleRoleChange = (role: RoleUtilisateur) => {
    setForm((f) => ({ ...f, role }));
    setErrors({});
  };

  // ─────────────────────────────────────────
  // VALIDATION STEP 1
  // ─────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.email.trim()) errs.email = 'Email obligatoire';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Email invalide';

    if (!form.motDePasse) errs.motDePasse = 'Mot de passe obligatoire';
    else if (form.motDePasse.length < 8)
      errs.motDePasse = 'Minimum 8 caractères';
    else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\;'`~])/.test(
        form.motDePasse
      )
    )
      errs.motDePasse =
        'Doit contenir majuscule, minuscule, chiffre et caractère spécial';

    if (!form.prenom.trim()) errs.prenom = 'Prénom obligatoire';
    else if (form.prenom.trim().length < 2)
      errs.prenom = 'Minimum 2 caractères';

    if (!form.nom.trim()) errs.nom = 'Nom obligatoire';
    else if (form.nom.trim().length < 2) errs.nom = 'Minimum 2 caractères';

    if (req.needsTelephone && !form.telephone?.trim()) {
      errs.telephone = 'Téléphone obligatoire pour ce rôle';
    } else if (form.telephone && !/^[+0-9 ()-]+$/.test(form.telephone)) {
      errs.telephone = 'Format de téléphone invalide';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning(
        'Étape incomplète',
        `${Object.keys(errs).length} champ(s) à corriger.`
      );
    }
    return Object.keys(errs).length === 0;
  };

  // ─────────────────────────────────────────
  // VALIDATION STEP 2
  // ─────────────────────────────────────────
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};

    if (req.needsSexe && !form.sexe) errs.sexe = 'Sexe obligatoire';
    if (req.needsDateNaissance && !form.dateNaissance)
      errs.dateNaissance = 'Date de naissance obligatoire';
    if (req.needsDateEmbauche && !form.dateEmbauche)
      errs.dateEmbauche = "Date d'embauche obligatoire";

    if (req.needsSalaire) {
      if (form.salaireBase === undefined || form.salaireBase === null)
        errs.salaireBase = 'Salaire obligatoire';
      else if (form.salaireBase < 0)
        errs.salaireBase = 'Le salaire doit être positif';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning(
        'Étape incomplète',
        `${Object.keys(errs).length} champ(s) à corriger.`
      );
    }
    return Object.keys(errs).length === 0;
  };

  // ─────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────
  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─────────────────────────────────────────
  // PAYLOAD NETTOYÉ
  // ─────────────────────────────────────────
  const buildCleanPayload = (): CreateUtilisateurPayload => {
    const payload: CreateUtilisateurPayload = {
      email: form.email.trim().toLowerCase(),
      motDePasse: form.motDePasse,
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      role: form.role,
      telephone: form.telephone?.trim() || undefined,
      photoProfil: form.photoProfil || undefined,
    };

    if (form.role === 'ELEVE') {
      payload.sexe = form.sexe;
      payload.dateNaissance = form.dateNaissance;
      payload.lieuNaissance = form.lieuNaissance?.trim() || undefined;
      payload.nationalite = form.nationalite?.trim() || undefined;
      payload.adresse = form.adresse?.trim() || undefined;
      payload.groupeSanguin = form.groupeSanguin || undefined;
      payload.allergies = form.allergies?.trim() || undefined;
      payload.infoMedicale = form.infoMedicale?.trim() || undefined;
    }

    if (form.role === 'ENSEIGNANT') {
      payload.sexe = form.sexe;
      payload.dateNaissance = form.dateNaissance;
      payload.adresse = form.adresse?.trim() || undefined;
      payload.dateEmbauche = form.dateEmbauche;
      payload.typeContrat = form.typeContrat;
      payload.qualification = form.qualification?.trim() || undefined;
      payload.specialite = form.specialite?.trim() || undefined;
      payload.salaireBase = form.salaireBase;
    }

    if (form.role === 'SURVEILLANT') {
      payload.sexe = form.sexe;
      payload.dateNaissance = form.dateNaissance || undefined;
      payload.adresse = form.adresse?.trim() || undefined;
      payload.dateEmbauche = form.dateEmbauche;
      payload.typeContrat = form.typeContrat;
      payload.zoneSurveillance = form.zoneSurveillance?.trim() || undefined;
    }

    if (form.role === 'PARENT') {
      payload.adresse = form.adresse?.trim() || undefined;
    }

    return payload;
  };

  // ─────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    try {
      const payload = buildCleanPayload();

      const loadingToastId = toast.info(
        'Création en cours…',
        'Enregistrement du compte et du profil métier.'
      );

      const res = await createMutation.mutateAsync(payload);

      toast.dismiss?.(loadingToastId);

      if (res.success && res.data) {
        toast.success(
          'Utilisateur créé ! 🎉',
          `${res.data.prenom} ${res.data.nom} (${res.data.role}) a été créé.`
        );

        setTimeout(() => {
          navigate('/dashboard/utilisateurs');
        }, 1500);
      } else {
        toast.error(
          'Échec de la création',
          res.message ?? 'Réponse invalide du serveur.'
        );
      }
    } catch (err) {
      toast.error(
        'Erreur lors de la création',
        (err as any)?.response?.data?.message ??
          (err as any)?.message ??
          'Impossible de créer l\'utilisateur.'
      );
    }
  };

  // ─────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* EN-TÊTE */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/utilisateurs"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlusIcon className="w-7 h-7 text-blue-600" />
            Nouvel utilisateur
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Créer un compte avec profil métier adapté au rôle
          </p>
        </div>
      </div>

      {/* STEP INDICATOR */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6">
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {[
            { n: 1, label: 'Compte',        icon: UserCircleIcon },
            { n: 2, label: 'Profil métier', icon: IdentificationIcon },
          ].map((s, idx) => (
            <React.Fragment key={s.n}>
              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step > s.n
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : step === s.n
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s.n ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <s.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-400 font-medium">
                    Étape {s.n}
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      step >= s.n ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
              </div>
              {idx === 0 && (
                <div
                  className={`w-8 md:w-16 h-1 rounded-full transition-all ${
                    step > 1 ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8"
      >
        <AnimatePresence mode="wait">
          {/* ═══════════ STEP 1 ═══════════ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Rôle */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Rôle de l'utilisateur
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ROLES.map((r) => {
                    const active = form.role === r.value;
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => handleRoleChange(r.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          active
                            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-sm'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mb-2 ${
                            active ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        />
                        <p
                          className={`text-sm font-semibold ${
                            active ? 'text-blue-900' : 'text-gray-700'
                          }`}
                        >
                          {r.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {r.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compte */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Identifiants de connexion
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="utilisateur@ecole.ci"
                        maxLength={150}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                          errors.email
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1.5">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.motDePasse}
                        onChange={(e) => update('motDePasse', e.target.value)}
                        placeholder="••••••••"
                        maxLength={128}
                        className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                          errors.motDePasse
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.motDePasse ? (
                      <p className="text-xs text-red-600 mt-1.5">
                        {errors.motDePasse}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1.5">
                        Min. 8 caractères avec majuscule, minuscule, chiffre et
                        caractère spécial
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Identité */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Identité
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.prenom}
                        onChange={(e) => update('prenom', e.target.value)}
                        maxLength={100}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                          errors.prenom
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.prenom && (
                      <p className="text-xs text-red-600 mt-1.5">
                        {errors.prenom}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.nom}
                        onChange={(e) => update('nom', e.target.value)}
                        maxLength={100}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                          errors.nom
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.nom && (
                      <p className="text-xs text-red-600 mt-1.5">
                        {errors.nom}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Téléphone{' '}
                      {req.needsTelephone && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={form.telephone ?? ''}
                        onChange={(e) =>
                          update('telephone', normalizePhone(e.target.value))
                        }
                        placeholder="+225 07 00 00 00 00"
                        maxLength={30}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                          errors.telephone
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.telephone && (
                      <p className="text-xs text-red-600 mt-1.5">
                        {errors.telephone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════ STEP 2 ═══════════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Récap */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <SparklesIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Profil {selectedRole.label}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Renseignez les informations métier spécifiques au rôle{' '}
                      <strong>{selectedRole.label}</strong>. Ces données seront
                      enregistrées dans la table dédiée.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <IdentificationIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Profil métier
                  </h2>
                  <p className="text-xs text-gray-500">
                    Champs spécifiques au rôle {selectedRole.label}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sexe */}
                {req.needsSexe && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Sexe <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.sexe ?? 'M'}
                      onChange={(e) => update('sexe', e.target.value as Sexe)}
                      className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none ${
                        errors.sexe
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      {SEXES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    {errors.sexe && (
                      <p className="text-xs text-red-600 mt-1.5">
                        {errors.sexe}
                      </p>
                    )}
                  </div>
                )}

                {/* Date naissance */}
                {req.needsDateNaissance && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date de naissance{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={form.dateNaissance ?? ''}
                        onChange={(e) =>
                          update('dateNaissance', e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none ${
                          errors.dateNaissance
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.dateNaissance && (
                      <p className="text-xs text-red-600 mt-1.5">
                        {errors.dateNaissance}
                      </p>
                    )}
                  </div>
                )}

                {/* Date embauche */}
                {req.needsDateEmbauche && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date d'embauche{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={form.dateEmbauche ?? ''}
                        onChange={(e) =>
                          update('dateEmbauche', e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none ${
                          errors.dateEmbauche
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.dateEmbauche && (
                      <p className="text-xs text-red-600 mt-1.5">
                        {errors.dateEmbauche}
                      </p>
                    )}
                  </div>
                )}

                {/* Type contrat */}
                {(form.role === 'ENSEIGNANT' ||
                  form.role === 'SURVEILLANT') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Type de contrat{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.typeContrat ?? 'CDI'}
                      onChange={(e) =>
                        update('typeContrat', e.target.value as TypeContrat)
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      {TYPES_CONTRAT.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Salaire */}
                {req.needsSalaire && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Salaire de base (FCFA){' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={form.salaireBase ?? 0}
                        onChange={(e) =>
                          update('salaireBase', Number(e.target.value) || 0)
                        }
                        min={0}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none ${
                          errors.salaireBase
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.salaireBase && (
                      <p className="text-xs text-red-600 mt-1.5">
                        {errors.salaireBase}
                      </p>
                    )}
                  </div>
                )}

                {/* Qualification / spécialité (enseignant) */}
                {form.role === 'ENSEIGNANT' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Qualification
                      </label>
                      <input
                        type="text"
                        value={form.qualification ?? ''}
                        onChange={(e) =>
                          update('qualification', e.target.value)
                        }
                        placeholder="Ex: Master, CAPES…"
                        maxLength={200}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Spécialité
                      </label>
                      <input
                        type="text"
                        value={form.specialite ?? ''}
                        onChange={(e) =>
                          update('specialite', e.target.value)
                        }
                        placeholder="Ex: Mathématiques"
                        maxLength={200}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Zone surveillance (surveillant) */}
                {form.role === 'SURVEILLANT' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Zone de surveillance
                    </label>
                    <input
                      type="text"
                      value={form.zoneSurveillance ?? ''}
                      onChange={(e) =>
                        update('zoneSurveillance', e.target.value)
                      }
                      placeholder="Ex: Bâtiment A, Cour principale…"
                      maxLength={100}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                )}

                {/* Élève : lieu naissance / nationalité */}
                {form.role === 'ELEVE' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Lieu de naissance
                      </label>
                      <input
                        type="text"
                        value={form.lieuNaissance ?? ''}
                        onChange={(e) =>
                          update('lieuNaissance', e.target.value)
                        }
                        maxLength={100}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nationalité
                      </label>
                      <input
                        type="text"
                        value={form.nationalite ?? ''}
                        onChange={(e) =>
                          update('nationalite', e.target.value)
                        }
                        maxLength={100}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Élève : groupe sanguin + allergies */}
                {form.role === 'ELEVE' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Groupe sanguin
                      </label>
                      <select
                        value={form.groupeSanguin ?? ''}
                        onChange={(e) =>
                          update(
                            'groupeSanguin',
                            (e.target.value || null) as GroupeSanguin | null
                          )
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      >
                        <option value="">—</option>
                        {GROUPES_SANGUINS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Allergies
                      </label>
                      <input
                        type="text"
                        value={form.allergies ?? ''}
                        onChange={(e) =>
                          update('allergies', e.target.value)
                        }
                        maxLength={500}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Adresse */}
                {(form.role === 'ELEVE' ||
                  form.role === 'ENSEIGNANT' ||
                  form.role === 'SURVEILLANT' ||
                  form.role === 'PARENT') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Adresse
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.adresse ?? ''}
                        onChange={(e) => update('adresse', e.target.value)}
                        maxLength={300}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Info box */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Compte non vérifié
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    L'utilisateur devra vérifier son email via OTP à la première
                    connexion. Un matricule sera généré automatiquement pour les
                    profils élève / enseignant / surveillant.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTIONS */}
        <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-100">
          <div>
            {step === 2 && (
              <button
                type="button"
                onClick={handlePrev}
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Précédent
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/utilisateurs"
              className="hidden sm:inline-flex px-4 py-2.5 text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Annuler
            </Link>

            {step === 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
              >
                Suivant
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Création…
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    Créer l'utilisateur
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* INFO BAS DE PAGE */}
      <div className="text-center text-xs text-gray-400">
        <p>
          💡 Le compte sera créé avec son profil métier et un matricule
          auto-généré selon le rôle.
        </p>
      </div>
    </div>
  );
};

export default UtilisateurNouveauPage;