// frontend2/src/pages/dashboard/directeur/eleves/EleveNouvellePage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ArrowPathIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  IdentificationIcon,
  HeartIcon,
  AcademicCapIcon,
  BanknotesIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useCreateEleve } from '../../../../hooks/useEleves';
import { useClasses } from '../../../../hooks/useClasses';
import { useToast } from '../../../../context/ToastContext';
import type {
  CreateElevePayload,
  StatutEleve,
} from '../../../../types/eleve.types';

const initialForm: CreateElevePayload = {
  email: null,
  motDePasse: null,
  prenom: '',
  nom: '',
  sexe: 'M',
  dateNaissance: '',
  lieuNaissance: null,
  nationalite: null,
  adresse: null,
  telephone: null,
  photo: null,
  infoMedicale: null,
  groupeSanguin: null,
  allergies: null,
  statut: 'ACTIF',
  classeId: null,
  anneeScolaireId: null,
};

const STATUTS: { value: StatutEleve; label: string }[] = [
  { value: 'ACTIF', label: 'Actif' },
  { value: 'SUSPENDU', label: 'Suspendu' },
  { value: 'TRANSFERE', label: 'Transféré' },
  { value: 'SORTI', label: 'Sorti' },
];

const GROUPES_SANGUINS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const EleveNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState<CreateElevePayload>(initialForm);
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [withAccount, setWithAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const createMutation = useCreateEleve();

  const { data: classesData, isLoading: classesLoading } = useClasses({
    limit: 200,
  });
  const classes = classesData?.classes ?? [];

  const updateField = <K extends keyof CreateElevePayload>(
    field: K,
    value: CreateElevePayload[K]
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
    else if (form.prenom.trim().length < 2)
      errs.prenom = 'Minimum 2 caractères';

    if (!form.nom.trim()) errs.nom = 'Le nom est obligatoire';
    else if (form.nom.trim().length < 2) errs.nom = 'Minimum 2 caractères';

    if (!form.dateNaissance)
      errs.dateNaissance = 'La date de naissance est obligatoire';
    else if (new Date(form.dateNaissance) > new Date())
      errs.dateNaissance = 'La date ne peut pas être dans le futur';

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

    if (form.telephone && form.telephone.trim().length > 0) {
      if (form.telephone.trim().length < 8) {
        errs.telephone = 'Téléphone trop court';
      }
    }

    if (withAccount) {
      if (!form.email?.trim()) {
        errs.email = 'Email requis pour créer un compte';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errs.email = 'Email invalide';
      }
      if (
        form.motDePasse &&
        form.motDePasse.length > 0 &&
        form.motDePasse.length < 8
      ) {
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
  // NAVIGATION
  // ─────────────────────────────────────────
  const handleNext = (e?: React.FormEvent) => {
    e?.preventDefault();
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
  // SOUMISSION FINALE (uniquement depuis l'étape 2)
  // ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    try {
      const payload: CreateElevePayload = {
        email: withAccount ? form.email : null,
        motDePasse: withAccount ? form.motDePasse : null,
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        sexe: form.sexe,
        dateNaissance: form.dateNaissance,
        lieuNaissance: form.lieuNaissance?.trim() || null,
        nationalite: form.nationalite?.trim() || null,
        adresse: form.adresse?.trim() || null,
        telephone: form.telephone?.trim() || null,
        photo: form.photo,
        infoMedicale: form.infoMedicale?.trim() || null,
        groupeSanguin: form.groupeSanguin || null,
        allergies: form.allergies?.trim() || null,
        statut: form.statut ?? 'ACTIF',
        classeId: form.classeId ?? null,
        anneeScolaireId: form.anneeScolaireId ?? null,
      };

      const res = await createMutation.mutateAsync(payload);
      const eleve = res?.data;

      if (eleve) {
        toast.success(
          'Élève créé ! 🎉',
          `"${eleve.prenom} ${eleve.nom}" (${eleve.matricule}) a été créé.`,
          {
            duration: 4000,
            action: {
              label: 'Voir le détail',
              onClick: () => navigate(`/dashboard/eleves/${eleve.id}`),
            },
          }
        );

        setTimeout(() => navigate('/dashboard/eleves'), 1500);
      }
    } catch {
      /* toast géré par le hook */
    }
  };

  const selectedClasse = classes.find((c) => c.id === form.classeId);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/eleves"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            title="Retour"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserGroupIcon className="w-7 h-7 text-blue-600" />
              Nouvel élève
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Créez un nouvel élève et son compte utilisateur
            </p>
          </div>
        </div>
      </div>

      {/* Indicateur d'étapes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6">
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {[
            { n: 1, label: 'Identité', icon: UserCircleIcon },
            { n: 2, label: 'Contact & compte', icon: EnvelopeIcon },
          ].map((s, idx) => (
            <React.Fragment key={s.n}>
              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step > s.n
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : step === s.n
                      ? 'bg-linear-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 scale-110'
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

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════
            ÉTAPE 1 : FORMULAIRE DÉDIÉ (soumet → handleNext)
            ═══════════════════════════════════════════════════ */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <form
              onSubmit={handleNext}
              className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <IdentificationIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Identité de l'élève
                    </h2>
                    <p className="text-xs text-gray-500">
                      Informations personnelles
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        placeholder="Ex: Aminata"
                        maxLength={100}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
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
                      <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.nom}
                        onChange={(e) => updateField('nom', e.target.value)}
                        placeholder="Ex: Diallo"
                        maxLength={100}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {s === 'M' ? '♂ Masculin' : '♀ Féminin'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date de naissance <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={form.dateNaissance?.slice(0, 10) ?? ''}
                        onChange={(e) =>
                          updateField('dateNaissance', e.target.value)
                        }
                        max={new Date().toISOString().slice(0, 10)}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Lieu de naissance
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.lieuNaissance ?? ''}
                        onChange={(e) =>
                          updateField('lieuNaissance', e.target.value || null)
                        }
                        placeholder="Ex: Abidjan"
                        maxLength={100}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nationalité
                    </label>
                    <input
                      type="text"
                      value={form.nationalite ?? ''}
                      onChange={(e) =>
                        updateField('nationalite', e.target.value || null)
                      }
                      placeholder="Ex: Ivoirienne"
                      maxLength={100}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Statut initial
                  </label>
                  <select
                    value={form.statut}
                    onChange={(e) =>
                      updateField('statut', e.target.value as StatutEleve)
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {STATUTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions étape 1 */}
              <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                <Link
                  to="/dashboard/eleves"
                  className="hidden sm:inline-flex px-4 py-2.5 text-gray-500 hover:text-gray-700 font-medium"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg"
                >
                  Suivant
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════
            ÉTAPE 2 : FORMULAIRE DÉDIÉ (soumet → handleSubmit)
            ═══════════════════════════════════════════════════ */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8"
            >
              <div className="space-y-6">
                {/* Récap */}
                <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <SparklesIcon className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Récapitulatif
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>
                          {form.prenom} {form.nom}
                        </strong>{' '}
                        — {form.sexe === 'M' ? 'Garçon' : 'Fille'},{' '}
                        {form.dateNaissance &&
                          new Date(form.dateNaissance).toLocaleDateString(
                            'fr-FR',
                            { day: 'numeric', month: 'long', year: 'numeric' }
                          )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section Scolarité */}
                <div>
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        Scolarité
                      </h2>
                      <p className="text-xs text-gray-500">
                        Inscription et plan de scolarité automatiques
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Classe (optionnel)
                    </label>
                    <select
                      value={form.classeId ?? ''}
                      onChange={(e) =>
                        updateField('classeId', e.target.value || null)
                      }
                      disabled={classesLoading}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">— Aucune classe pour l'instant —</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom} ({c.code})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1">
                      <InformationCircleIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      Si une classe est sélectionnée, l'élève sera
                      automatiquement inscrit et le plan de scolarité associé
                      lui sera assigné.
                    </p>
                  </div>

                  {selectedClasse && (
                    <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-2">
                      <BanknotesIcon className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-indigo-800">
                          Inscription dans : {selectedClasse.nom} (
                          {selectedClasse.code})
                        </p>
                        <p className="text-xs text-indigo-700">
                          Un assignment de scolarité sera créé si un plan actif
                          existe pour cette classe ou son niveau.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <PhoneIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Contact & informations complémentaires
                    </h2>
                    <p className="text-xs text-gray-500">
                      Coordonnées et données médicales
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          updateField('telephone', e.target.value || null)
                        }
                        placeholder="+225 07 00 00 00 00"
                        maxLength={30}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
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
                        placeholder="Ex: 12 rue des Écoles, Cocody"
                        maxLength={300}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section médicale */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <HeartIcon className="w-4 h-4 text-red-500" />
                    Informations médicales
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Groupe sanguin
                      </label>
                      <select
                        value={form.groupeSanguin ?? ''}
                        onChange={(e) =>
                          updateField('groupeSanguin', e.target.value || null)
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">—</option>
                        {GROUPES_SANGUINS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Allergies
                      </label>
                      <input
                        type="text"
                        value={form.allergies ?? ''}
                        onChange={(e) =>
                          updateField('allergies', e.target.value || null)
                        }
                        placeholder="Ex: Arachides, pénicilline…"
                        maxLength={500}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Notes médicales
                    </label>
                    <textarea
                      value={form.infoMedicale ?? ''}
                      onChange={(e) =>
                        updateField('infoMedicale', e.target.value || null)
                      }
                      rows={2}
                      maxLength={1000}
                      placeholder="Informations médicales utiles (asthme, traitement en cours…)"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Toggle Compte */}
                <div className="border-t border-gray-100 pt-4">
                  <label className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-100/50">
                    <input
                      type="checkbox"
                      checked={withAccount}
                      onChange={(e) => setWithAccount(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded text-indigo-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Créer un compte utilisateur
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Permet à l'élève de se connecter à l'application pour
                        consulter ses notes, bulletins et paiements.
                      </p>
                    </div>
                  </label>

                  {withAccount && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 space-y-4 pl-4 border-l-2 border-indigo-200"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={form.email ?? ''}
                            onChange={(e) =>
                              updateField('email', e.target.value || null)
                            }
                            placeholder={`${form.prenom.toLowerCase() || 'prenom'}.${form.nom.toLowerCase() || 'nom'}@eleve.ci`}
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
                            placeholder="Laisser vide pour générer"
                            className={`w-full pl-10 pr-12 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                              errors.motDePasse
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-200'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                            Minimum 8 caractères. Vide = généré automatiquement.
                          </p>
                        )}
                      </div>

                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-800">
                          Les parents devront recevoir les identifiants de
                          connexion.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Actions étape 2 */}
              <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={createMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Précédent
                </button>

                <div className="flex items-center gap-3">
                  <Link
                    to="/dashboard/eleves"
                    className="hidden sm:inline-flex px-4 py-2.5 text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Annuler
                  </Link>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
                  >
                    {createMutation.isPending ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        Création…
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-4 h-4" />
                        Créer l'élève
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EleveNouvellePage;