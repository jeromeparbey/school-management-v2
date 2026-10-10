// frontend2/src/pages/dashboard/super-admin/EtablissementNouveauPage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  KeyIcon,
  UserIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { useCreateEtablissement } from '../../../hooks/useEtablissements';
import { useToast } from '../../../context/ToastContext';
import type {
  CreateEtablissementPayload,
  TypeEtablissement,
  PlanAbonnement,
} from '../../../types/etablissement.api';

// ============================================
// CONSTANTES
// ============================================
const JOURS_SEMAINE = [
  'LUNDI',
  'MARDI',
  'MERCREDI',
  'JEUDI',
  'VENDREDI',
  'SAMEDI',
  'DIMANCHE',
] as const;

const TYPES_ETABLISSEMENT: { value: TypeEtablissement; label: string }[] = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'PRIVE', label: 'Privé' },
  { value: 'PRIVE_LAIQUE', label: 'Privé laïque' },
  { value: 'PRIVE_CONFESSIONNEL', label: 'Privé confessionnel' },
  { value: 'INTERNATIONAL', label: 'International' },
];

const PLANS_ABONNEMENT: { value: PlanAbonnement; label: string }[] = [
  { value: 'GRATUIT', label: 'Gratuit' },
  { value: 'BASIQUE', label: 'Basique' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'ENTERPRISE', label: 'Enterprise' },
];

// ============================================
// HELPERS DE NORMALISATION
// ============================================
const normalizeCode = (value: string): string => {
  return value
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 50);
};

const normalizePhone = (value: string): string => {
  return value.replace(/[^+0-9 ()-]/g, '').slice(0, 30);
};

// ============================================
// ÉTAT INITIAL
// ============================================
const initialForm: CreateEtablissementPayload = {
  nom: '',
  code: '',
  ville: '',
  email: '',
  telephone: '',
  type: 'PRIVE',
  pays: "Côte d'Ivoire",
  adresse: '',
  devise: 'XOF',
  fuseauHoraire: 'Africa/Abidjan',
  formatDate: 'DD/MM/YYYY',
  joursOuvrables: ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'],
  heureDebut: '08:00',
  heureFin: '17:00',
  toleranceRetard: 15,
  tauxHeureSup: 1.5,
  planAbonnement: 'STANDARD',
  maxUtilisateurs: 1000,
  directeur: {
    email: '',
    motDePasse: '',
    prenom: '',
    nom: '',
    telephone: '',
  },
};

// ============================================
// COMPOSANT
// ============================================
const EtablissementNouveauPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast(); // 🎯 Toast context

  const [form, setForm] = useState<CreateEtablissementPayload>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateEtablissement();

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const updateField = <K extends keyof CreateEtablissementPayload>(
    field: K,
    value: CreateEtablissementPayload[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  const updateDirecteur = (
    field: keyof CreateEtablissementPayload['directeur'],
    value: string
  ) => {
    setForm((f) => ({
      ...f,
      directeur: { ...f.directeur, [field]: value },
    }));
    setErrors((e) => ({ ...e, [`directeur.${field}`]: '' }));
  };

  const toggleJour = (jour: string) => {
    setForm((f) => {
      const jours = f.joursOuvrables ?? [];
      return {
        ...f,
        joursOuvrables: jours.includes(jour)
          ? jours.filter((j) => j !== jour)
          : [...jours, jour],
      };
    });
  };

  // ─────────────────────────────────────────
  // VALIDATION STEP 1
  // ─────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};

    // Nom
    if (!form.nom.trim()) {
      errs.nom = "Le nom de l'établissement est obligatoire";
    } else if (form.nom.trim().length < 2) {
      errs.nom = 'Minimum 2 caractères';
    } else if (form.nom.trim().length > 200) {
      errs.nom = 'Maximum 200 caractères';
    }

    // Code : MAJUSCULES
    if (!form.code.trim()) {
      errs.code = 'Le code est obligatoire';
    } else if (!/^[A-Z0-9_-]+$/.test(form.code)) {
      errs.code = 'Majuscules, chiffres, _ ou - uniquement';
    } else if (form.code.length < 2) {
      errs.code = 'Minimum 2 caractères';
    } else if (form.code.length > 50) {
      errs.code = 'Maximum 50 caractères';
    }

    // Email
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Email invalide';
    }

    // Téléphone
    if (form.telephone && !/^[+0-9 ()-]+$/.test(form.telephone)) {
      errs.telephone = 'Format de téléphone invalide';
    }

    // Devise
    if (form.devise && form.devise.length !== 3) {
      errs.devise = 'La devise doit faire 3 caractères';
    }

    // Jours ouvrables
    if (!form.joursOuvrables || form.joursOuvrables.length === 0) {
      errs.joursOuvrables = 'Au moins 1 jour ouvrable';
    }

    // Heures
    if (
      form.heureDebut &&
      !/^([01]\d|2[0-3]):([0-5]\d)$/.test(form.heureDebut)
    ) {
      errs.heureDebut = 'Format HH:MM requis';
    }
    if (
      form.heureFin &&
      !/^([01]\d|2[0-3]):([0-5]\d)$/.test(form.heureFin)
    ) {
      errs.heureFin = 'Format HH:MM requis';
    }

    // Tolérance retard
    if (
      form.toleranceRetard !== undefined &&
      (form.toleranceRetard < 0 || form.toleranceRetard > 120)
    ) {
      errs.toleranceRetard = 'Entre 0 et 120 minutes';
    }

    // Taux heure supp
    if (
      form.tauxHeureSup !== undefined &&
      (form.tauxHeureSup < 1 || form.tauxHeureSup > 3)
    ) {
      errs.tauxHeureSup = 'Entre 1.0 et 3.0';
    }

    // Max utilisateurs
    if (
      form.maxUtilisateurs !== undefined &&
      (form.maxUtilisateurs < 1 || form.maxUtilisateurs > 1000000)
    ) {
      errs.maxUtilisateurs = 'Entre 1 et 1 000 000';
    }

    setErrors(errs);

    // 🎯 Toast si erreurs
    if (Object.keys(errs).length > 0) {
      toast.warning(
        'Formulaire incomplet',
        `${Object.keys(errs).length} champ(s) nécessitent votre attention.`
      );
    }

    return Object.keys(errs).length === 0;
  };

  // ─────────────────────────────────────────
  // VALIDATION STEP 2
  // ─────────────────────────────────────────
  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    const d = form.directeur;

    if (!d.prenom.trim()) {
      errs['directeur.prenom'] = 'Prénom obligatoire';
    } else if (d.prenom.trim().length < 2) {
      errs['directeur.prenom'] = 'Minimum 2 caractères';
    } else if (d.prenom.trim().length > 100) {
      errs['directeur.prenom'] = 'Maximum 100 caractères';
    }

    if (!d.nom.trim()) {
      errs['directeur.nom'] = 'Nom obligatoire';
    } else if (d.nom.trim().length < 2) {
      errs['directeur.nom'] = 'Minimum 2 caractères';
    } else if (d.nom.trim().length > 100) {
      errs['directeur.nom'] = 'Maximum 100 caractères';
    }

    if (!d.email.trim()) {
      errs['directeur.email'] = 'Email obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
      errs['directeur.email'] = 'Email invalide';
    } else if (d.email.length > 150) {
      errs['directeur.email'] = 'Maximum 150 caractères';
    }

    if (!d.motDePasse) {
      errs['directeur.motDePasse'] = 'Mot de passe obligatoire';
    } else if (d.motDePasse.length < 8) {
      errs['directeur.motDePasse'] = 'Minimum 8 caractères';
    } else if (d.motDePasse.length > 128) {
      errs['directeur.motDePasse'] = 'Maximum 128 caractères';
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\;'`~])/.test(
        d.motDePasse
      )
    ) {
      errs['directeur.motDePasse'] =
        'Doit contenir majuscule, minuscule, chiffre et caractère spécial';
    }

    if (d.telephone && !/^[+0-9 ()-]+$/.test(d.telephone)) {
      errs['directeur.telephone'] = 'Format de téléphone invalide';
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
  // CONSTRUCTION DU PAYLOAD NETTOYÉ
  // ─────────────────────────────────────────
  const buildCleanPayload = (): CreateEtablissementPayload => {
    return {
      nom: form.nom.trim(),
      code: form.code.trim().toUpperCase(),
      ville: form.ville?.trim() || undefined,
      email: form.email?.trim() || undefined,
      telephone: form.telephone?.trim() || undefined,
      adresse: form.adresse?.trim() || undefined,
      siteWeb: form.siteWeb?.trim() || undefined,
      numeroAgrement: form.numeroAgrement?.trim() || undefined,
      dateExpiration: form.dateExpiration || undefined,
      type: form.type,
      pays: form.pays?.trim() || "Côte d'Ivoire",
      devise: (form.devise || 'XOF').toUpperCase().slice(0, 3),
      fuseauHoraire: form.fuseauHoraire || 'Africa/Abidjan',
      formatDate: form.formatDate || 'DD/MM/YYYY',
      joursOuvrables: form.joursOuvrables ?? [],
      heureDebut: form.heureDebut || '08:00',
      heureFin: form.heureFin || '17:00',
      toleranceRetard: form.toleranceRetard ?? 15,
      tauxHeureSup: form.tauxHeureSup ?? 1.5,
      planAbonnement: form.planAbonnement,
      maxUtilisateurs: form.maxUtilisateurs ?? 1000,
      directeur: {
        email: form.directeur.email.trim().toLowerCase(),
        motDePasse: form.directeur.motDePasse,
        prenom: form.directeur.prenom.trim(),
        nom: form.directeur.nom.trim(),
        telephone: form.directeur.telephone?.trim() || undefined,
      },
    };
  };

  // ─────────────────────────────────────────
  // SOUMISSION
  // ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    try {
      const cleanPayload = buildCleanPayload();

      // Toast "en cours"
      const loadingToastId = toast.info(
        'Création en cours...',
        'Le provisioning du tenant peut prendre quelques secondes.',
        { duration: 0 } // persistant jusqu'à la fin
      );

      const res = await createMutation.mutateAsync(cleanPayload);

      // Fermer le toast de chargement
      toast.dismiss(loadingToastId);

      if (res.success && res.data) {
        // ✅ Toast succès avec action
        toast.success(
          'Établissement créé ! 🎉',
          `"${res.data.nom}" a été créé avec succès.\nDirecteur : ${res.data.directeur.prenom} ${res.data.directeur.nom}`,
          {
            duration: 5000,
            action: {
              label: 'Voir le détail',
              onClick: () =>
                navigate(`/dashboard/etablissements/${res.data!.id}`),
            },
          }
        );

        // Redirection auto après 2s
        setTimeout(() => {
          navigate('/dashboard/etablissements');
        }, 2000);
      } else {
        // ⚠️ success=false
        toast.error(
          'Échec de la création',
          res.message ?? 'Le serveur a renvoyé une réponse invalide.'
        );
      }
    } catch (err) {
      // ❌ Erreur API → extraction automatique
      toast.fromApiError(err, 'Erreur lors de la création');
    }
  };

  // ─────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* ============================================
          EN-TÊTE
          ============================================ */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/etablissements"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          title="Retour"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BuildingOfficeIcon className="w-7 h-7 text-red-600" />
            Nouvel établissement
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Créer un tenant + son directeur initial
          </p>
        </div>
      </div>

      {/* ============================================
          INDICATEUR D'ÉTAPES
          ============================================ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6">
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {[
            { n: 1, label: 'Établissement', icon: BuildingOfficeIcon },
            { n: 2, label: 'Directeur', icon: UserCircleIcon },
          ].map((s, idx) => (
            <React.Fragment key={s.n}>
              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step > s.n
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : step === s.n
                      ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30 scale-110'
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

      {/* ============================================
          FORMULAIRE
          ============================================ */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8"
      >
        <AnimatePresence mode="wait">
          {/* ═══════════════════════════════════════
              ÉTAPE 1 : ÉTABLISSEMENT
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
                <div className="p-2 bg-red-50 rounded-lg">
                  <BuildingOfficeIcon className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Informations de l'établissement
                  </h2>
                  <p className="text-xs text-gray-500">
                    Identité et coordonnées
                  </p>
                </div>
              </div>

              {/* ─── Identité ─── */}
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Identité
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nom de l'établissement{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.nom}
                        onChange={(e) => updateField('nom', e.target.value)}
                        placeholder="Ex: École Victor Hugo"
                        maxLength={200}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                          errors.nom
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.nom && (
                      <p className="text-xs text-red-600 mt-1.5">{errors.nom}</p>
                    )}
                  </div>

                  {/* Code : MAJUSCULES */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Code unique <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.code}
                        onChange={(e) =>
                          updateField('code', normalizeCode(e.target.value))
                        }
                        placeholder="ex: VICTOR-HUGO"
                        maxLength={50}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-mono uppercase transition-all ${
                          errors.code
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      MAJUSCULES, chiffres, tirets et underscores uniquement
                      (2-50 caractères)
                    </p>
                    {errors.code && (
                      <p className="text-xs text-red-600 mt-1.5">
                        {errors.code}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── Localisation ─── */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Localisation
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ville
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.ville ?? ''}
                        onChange={(e) => updateField('ville', e.target.value)}
                        placeholder="Ex: Abidjan"
                        maxLength={100}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Pays
                    </label>
                    <div className="relative">
                      <GlobeAltIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.pays ?? ''}
                        onChange={(e) => updateField('pays', e.target.value)}
                        maxLength={100}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={form.adresse ?? ''}
                      onChange={(e) => updateField('adresse', e.target.value)}
                      placeholder="Ex: 12 rue des Écoles, Cocody"
                      maxLength={300}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ─── Contact ─── */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Contact
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={form.email ?? ''}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="contact@ecole.com"
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Téléphone
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={form.telephone ?? ''}
                        onChange={(e) =>
                          updateField(
                            'telephone',
                            normalizePhone(e.target.value)
                          )
                        }
                        placeholder="+225 07 00 00 00 00"
                        maxLength={30}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
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

              {/* ─── Configuration ─── */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Configuration
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Type d'établissement
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        updateField(
                          'type',
                          e.target.value as TypeEtablissement
                        )
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    >
                      {TYPES_ETABLISSEMENT.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Plan d'abonnement
                    </label>
                    <select
                      value={form.planAbonnement}
                      onChange={(e) =>
                        updateField(
                          'planAbonnement',
                          e.target.value as PlanAbonnement
                        )
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    >
                      {PLANS_ABONNEMENT.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Devise
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={form.devise}
                        onChange={(e) =>
                          updateField('devise', e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                      >
                        <option value="XOF">XOF (FCFA)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="MAD">MAD (Dirham)</option>
                        <option value="GHS">GHS (Cedi)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Max utilisateurs
                    </label>
                    <input
                      type="number"
                      value={form.maxUtilisateurs ?? 1000}
                      onChange={(e) =>
                        updateField(
                          'maxUtilisateurs',
                          Number(e.target.value) || 0
                        )
                      }
                      min={1}
                      max={1000000}
                      className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                        errors.maxUtilisateurs
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    />
                    {errors.maxUtilisateurs && (
                      <p className="text-xs text-red-600 mt-1.5">
                        {errors.maxUtilisateurs}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Heure début
                    </label>
                    <div className="relative">
                      <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="time"
                        value={form.heureDebut ?? '08:00'}
                        onChange={(e) =>
                          updateField('heureDebut', e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Heure fin
                    </label>
                    <div className="relative">
                      <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="time"
                        value={form.heureFin ?? '17:00'}
                        onChange={(e) =>
                          updateField('heureFin', e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Jours ouvrables */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jours ouvrables
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {JOURS_SEMAINE.map((jour) => {
                      const isActive =
                        form.joursOuvrables?.includes(jour) ?? false;
                      return (
                        <button
                          key={jour}
                          type="button"
                          onClick={() => toggleJour(jour)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {jour.charAt(0) + jour.slice(1, 3).toLowerCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
              ÉTAPE 2 : DIRECTEUR
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
              {/* Récapitulatif */}
              <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                <div className="flex items-start gap-3">
                  <SparklesIcon className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Compte directeur initial
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Ce compte sera créé dans le tenant{' '}
                      <strong className="font-mono">{form.code}</strong> pour
                      l'établissement <strong>{form.nom}</strong>. Le directeur
                      pourra se connecter immédiatement avec ces identifiants.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <UserCircleIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Informations du directeur
                  </h2>
                  <p className="text-xs text-gray-500">
                    Identité et identifiants de connexion
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
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={form.directeur.prenom}
                      onChange={(e) =>
                        updateDirecteur('prenom', e.target.value)
                      }
                      placeholder="Ex: Jean"
                      maxLength={100}
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                        errors['directeur.prenom']
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors['directeur.prenom'] && (
                    <p className="text-xs text-red-600 mt-1.5">
                      {errors['directeur.prenom']}
                    </p>
                  )}
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={form.directeur.nom}
                      onChange={(e) => updateDirecteur('nom', e.target.value)}
                      placeholder="Ex: Dupont"
                      maxLength={100}
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                        errors['directeur.nom']
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors['directeur.nom'] && (
                    <p className="text-xs text-red-600 mt-1.5">
                      {errors['directeur.nom']}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email du directeur <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={form.directeur.email}
                      onChange={(e) =>
                        updateDirecteur('email', e.target.value)
                      }
                      placeholder={`directeur@${form.code.toLowerCase() || 'etablissement'}.edu`}
                      maxLength={150}
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                        errors['directeur.email']
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Servira d'identifiant de connexion pour le directeur
                  </p>
                  {errors['directeur.email'] && (
                    <p className="text-xs text-red-600 mt-1.5">
                      {errors['directeur.email']}
                    </p>
                  )}
                </div>

                {/* Téléphone */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Téléphone du directeur
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={form.directeur.telephone ?? ''}
                      onChange={(e) =>
                        updateDirecteur(
                          'telephone',
                          normalizePhone(e.target.value)
                        )
                      }
                      placeholder="+225 07 00 00 00 00"
                      maxLength={30}
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                        errors['directeur.telephone']
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors['directeur.telephone'] && (
                    <p className="text-xs text-red-600 mt-1.5">
                      {errors['directeur.telephone']}
                    </p>
                  )}
                </div>

                {/* Mot de passe */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.directeur.motDePasse}
                      onChange={(e) =>
                        updateDirecteur('motDePasse', e.target.value)
                      }
                      placeholder="••••••••"
                      maxLength={128}
                      className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                        errors['directeur.motDePasse']
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
                  {errors['directeur.motDePasse'] ? (
                    <p className="text-xs text-red-600 mt-1.5">
                      {errors['directeur.motDePasse']}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1.5">
                      Minimum 8 caractères, avec majuscule, minuscule, chiffre et
                      caractère spécial
                    </p>
                  )}
                </div>
              </div>

              {/* Info box */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Compte pré-vérifié
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Le compte directeur sera automatiquement activé et son email
                    marqué comme vérifié. Aucun OTP ne sera nécessaire pour la
                    première connexion.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================
            ACTIONS
            ============================================ */}
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
              to="/dashboard/etablissements"
              className="hidden sm:inline-flex px-4 py-2.5 text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Annuler
            </Link>

            {step === 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
              >
                Suivant
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                    Création en cours...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    Créer l'établissement
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* ============================================
          INFO BAS DE PAGE
          ============================================ */}
      <div className="text-center text-xs text-gray-400">
        <p>
          💡 Le provisioning peut prendre quelques secondes. La création inclut
          le schéma PostgreSQL, les tables, et le compte directeur.
        </p>
      </div>
    </div>
  );
};

export default EtablissementNouveauPage;