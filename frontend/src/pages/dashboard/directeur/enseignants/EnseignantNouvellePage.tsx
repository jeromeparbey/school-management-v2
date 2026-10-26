// frontend2/src/pages/dashboard/directeur/enseignants/EnseignantNouvellePage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  SparklesIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { useCreateEnseignant } from '../../../../hooks/useEnseignants';
import { useToast } from '../../../../context/ToastContext';
import type { CreateEnseignantPayload } from '../../../../types/enseignant.types';

// ============================================
// ÉTAT INITIAL
// ============================================
const initialForm: CreateEnseignantPayload = {
  email: null,
  motDePasse: null,
  prenom: '',
  nom: '',
  sexe: 'M',
  dateNaissance: '',
  telephone: '',
  adresse: null,
  photo: null,
  dateEmbauche: new Date().toISOString().slice(0, 10),
  typeContrat: 'CDI',
  qualification: null,
  specialite: null,
  salaireBase: 0,
  infosBancaires: null,
  estActif: true,
};

const CONTRATS = ['CDI', 'CDD', 'VACATAIRE', 'STAGE'];

// ============================================
// COMPOSANT
// ============================================
const EnseignantNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<CreateEnseignantPayload>(initialForm);
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [withAccount, setWithAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const createMutation = useCreateEnseignant();

  // ─────────────────────────────────────────
  const updateField = <K extends keyof CreateEnseignantPayload>(
    field: K,
    value: CreateEnseignantPayload[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  // ─────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.prenom.trim()) errs.prenom = 'Le prénom est obligatoire';
    else if (form.prenom.trim().length < 2) errs.prenom = 'Minimum 2 caractères';

    if (!form.nom.trim()) errs.nom = 'Le nom est obligatoire';
    else if (form.nom.trim().length < 2) errs.nom = 'Minimum 2 caractères';

    if (!form.dateNaissance) errs.dateNaissance = 'Date de naissance obligatoire';

    if (!form.telephone.trim())
      errs.telephone = 'Le téléphone est obligatoire';

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning(
        'Formulaire incomplet',
        `${Object.keys(errs).length} champ(s) nécessitent votre attention.`
      );
    }
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.dateEmbauche) errs.dateEmbauche = "Date d'embauche obligatoire";
    if (!form.typeContrat.trim()) errs.typeContrat = 'Type de contrat requis';
    if (form.salaireBase < 0)
      errs.salaireBase = 'Le salaire doit être positif ou nul';

    if (withAccount) {
      if (!form.email?.trim()) {
        errs.email = 'Email requis pour créer un compte';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errs.email = 'Email invalide';
      }
      if (form.motDePasse && form.motDePasse.length > 0 && form.motDePasse.length < 8) {
        errs.motDePasse = 'Minimum 8 caractères';
      }
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning(
        'Formulaire incomplet',
        `${Object.keys(errs).length} champ(s) nécessitent votre attention.`
      );
    }
    return Object.keys(errs).length === 0;
  };

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    try {
      const payload: CreateEnseignantPayload = {
        email: withAccount ? form.email : null,
        motDePasse: withAccount ? form.motDePasse : null,
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        sexe: form.sexe,
        dateNaissance: form.dateNaissance,
        telephone: form.telephone.trim(),
        adresse: form.adresse?.trim() || null,
        photo: form.photo,
        dateEmbauche: form.dateEmbauche,
        typeContrat: form.typeContrat.trim(),
        qualification: form.qualification?.trim() || null,
        specialite: form.specialite?.trim() || null,
        salaireBase: form.salaireBase,
        infosBancaires: form.infosBancaires,
        estActif: form.estActif ?? true,
      };

      const res = await createMutation.mutateAsync(payload);

      if (res.success && res.data) {
        const enseignant = res.data;

        if (enseignant.motDePasseTemporaire) {
          toast.warning(
            'Enseignant créé — mot de passe temporaire généré',
            `Communiquez les identifiants manuellement à ${enseignant.prenom} ${enseignant.nom}.`,
            { duration: 6000 }
          );
        } else {
          toast.success(
            'Enseignant créé ! 🎉',
            `"${enseignant.prenom} ${enseignant.nom}" (${enseignant.matricule}) a été créé.`,
            {
              duration: 4000,
              action: {
                label: 'Voir le détail',
                onClick: () =>
                  navigate(`/dashboard/enseignants/${enseignant.id}`),
              },
            }
          );
        }

        setTimeout(() => navigate('/dashboard/enseignants'), 1500);
      }
    } catch {
      /* toast géré par le hook */
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/enseignants"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            title="Retour"
            aria-label="Retour à la liste"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AcademicCapIcon className="w-7 h-7 text-indigo-600" />
              Nouvel enseignant
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Créez un nouvel enseignant et son compte utilisateur
            </p>
          </div>
        </div>
      </div>

      {/* Étapes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6">
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {[
            { n: 1, label: 'Identité', icon: UserCircleIcon },
            { n: 2, label: 'Contrat & compte', icon: BriefcaseIcon },
          ].map((s, idx) => (
            <React.Fragment key={s.n}>
              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step > s.n
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : step === s.n
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 scale-110'
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

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8"
      >
        <AnimatePresence mode="wait">
          {/* ═══════════════════════════════════════
              ÉTAPE 1 : IDENTITÉ
              ═══════════════════════════════════════ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <IdentificationIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Identité de l'enseignant
                  </h2>
                  <p className="text-xs text-gray-500">
                    Informations personnelles
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prénom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={form.prenom}
                      onChange={(e) => updateField('prenom', e.target.value)}
                      placeholder="Ex: Jean"
                      maxLength={100}
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
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

                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={form.nom}
                      onChange={(e) => updateField('nom', e.target.value)}
                      placeholder="Ex: Dupont"
                      maxLength={100}
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                        errors.nom ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.nom && (
                    <p className="text-xs text-red-600 mt-1.5">{errors.nom}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sexe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Sexe <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {(['M', 'F'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateField('sexe', s)}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                          form.sexe === s
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {s === 'M' ? '♂ Masculin' : '♀ Féminin'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date naissance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date de naissance <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={form.dateNaissance.slice(0, 10)}
                      onChange={(e) =>
                        updateField('dateNaissance', e.target.value)
                      }
                      max={new Date().toISOString().slice(0, 10)}
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
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
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => updateField('telephone', e.target.value)}
                    placeholder="+225 07 00 00 00 00"
                    maxLength={30}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
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

              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.adresse ?? ''}
                    onChange={(e) =>
                      updateField('adresse', e.target.value || null)
                    }
                    placeholder="Ex: 12 rue des Écoles, Abidjan"
                    maxLength={300}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ÉTAPE 2 : CONTRAT & COMPTE
              ═══════════════════════════════════════ */}
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
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex items-start gap-3">
                  <SparklesIcon className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Récapitulatif
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      <strong>{form.prenom} {form.nom}</strong> — {form.sexe === 'M' ? 'Homme' : 'Femme'}, {form.telephone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <BriefcaseIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Contrat & rémunération
                  </h2>
                  <p className="text-xs text-gray-500">
                    Informations professionnelles
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date embauche */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date d'embauche <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.dateEmbauche.slice(0, 10)}
                    onChange={(e) =>
                      updateField('dateEmbauche', e.target.value)
                    }
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                      errors.dateEmbauche
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  />
                  {errors.dateEmbauche && (
                    <p className="text-xs text-red-600 mt-1.5">
                      {errors.dateEmbauche}
                    </p>
                  )}
                </div>

                {/* Type contrat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Type de contrat <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.typeContrat}
                    onChange={(e) => updateField('typeContrat', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {CONTRATS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Qualification */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={form.qualification ?? ''}
                    onChange={(e) =>
                      updateField('qualification', e.target.value || null)
                    }
                    placeholder="Ex: Master en Mathématiques"
                    maxLength={200}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Spécialité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Spécialité
                  </label>
                  <input
                    type="text"
                    value={form.specialite ?? ''}
                    onChange={(e) =>
                      updateField('specialite', e.target.value || null)
                    }
                    placeholder="Ex: Mathématiques"
                    maxLength={200}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Salaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Salaire de base (XOF) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={form.salaireBase}
                    onChange={(e) =>
                      updateField('salaireBase', Number(e.target.value) || 0)
                    }
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                      errors.salaireBase
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  />
                </div>
                {form.salaireBase > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Intl.NumberFormat('fr-FR').format(form.salaireBase)} F CFA
                  </p>
                )}
              </div>

              {/* ─── Toggle Compte ─── */}
              <div className="border-t border-gray-100 pt-4">
                <label className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={withAccount}
                    onChange={(e) => setWithAccount(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Créer un compte utilisateur
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Permet à l'enseignant de se connecter à l'application.
                      Sans compte, il ne pourra pas accéder à son espace.
                    </p>
                  </div>
                </label>

                {withAccount && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 space-y-4 pl-4 border-l-2 border-indigo-200"
                  >
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email de connexion <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={form.email ?? ''}
                          onChange={(e) =>
                            updateField('email', e.target.value || null)
                          }
                          placeholder={`${form.prenom.toLowerCase() || 'prenom'}.${form.nom.toLowerCase() || 'nom'}@ecole.ci`}
                          className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
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

                    {/* Mot de passe */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mot de passe temporaire
                      </label>
                      <div className="relative">
                        <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={form.motDePasse ?? ''}
                          onChange={(e) =>
                            updateField('motDePasse', e.target.value || null)
                          }
                          placeholder="Laisser vide pour générer automatiquement"
                          className={`w-full pl-10 pr-12 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
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
                          Minimum 8 caractères. Vide = mot de passe généré
                          automatiquement.
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-800">
                        Si vous générez le mot de passe automatiquement, vous
                        devrez le communiquer manuellement à l'enseignant.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-100">
          <div>
            {step === 2 && (
              <button
                type="button"
                onClick={handlePrev}
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Précédent
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/enseignants"
              className="hidden sm:inline-flex px-4 py-2.5 text-gray-500 hover:text-gray-700 font-medium"
            >
              Annuler
            </Link>

            {step === 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg"
              >
                Suivant
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
              >
                {createMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Création…
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    Créer l'enseignant
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EnseignantNouvellePage;