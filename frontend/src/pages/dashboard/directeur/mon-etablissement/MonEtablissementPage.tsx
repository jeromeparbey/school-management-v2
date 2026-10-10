// frontend2/src/pages/dashboard/directeur/mon-etablissement/MonEtablissementPage.tsx

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PencilSquareIcon,
  CheckCircleIcon,
  XMarkIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import {
  useMonEtablissement,
  useUpdateMonEtablissement,
} from '../../../../hooks/useMonEtablissement';
import { useToast } from '../../../../context/ToastContext';
import type { UpdateMonEtablissementPayload } from '../../../../api/mon-etablissement.api';

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

/** Labels lisibles pour les types d'établissement (lecture seule) */
const TYPE_LABELS: Record<string, string> = {
  PUBLIC: 'Public',
  PRIVE: 'Privé',
  PRIVE_LAIQUE: 'Privé laïque',
  PRIVE_CONFESSIONNEL: 'Privé confessionnel',
  INTERNATIONAL: 'International',
};

/** Labels lisibles pour les plans d'abonnement (lecture seule) */
const PLAN_LABELS: Record<string, string> = {
  GRATUIT: 'Gratuit',
  BASIQUE: 'Basique',
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
  ENTERPRISE: 'Enterprise',
};

/** Couleurs par plan */
const PLAN_COLORS: Record<string, string> = {
  ENTERPRISE: 'bg-purple-50 text-purple-700 border-purple-200',
  PREMIUM: 'bg-red-50 text-red-700 border-red-200',
  STANDARD: 'bg-amber-50 text-amber-700 border-amber-200',
  BASIQUE: 'bg-blue-50 text-blue-700 border-blue-200',
  GRATUIT: 'bg-gray-100 text-gray-700 border-gray-200',
};

const normalizePhone = (value: string): string =>
  value.replace(/[^+0-9 ()-]/g, '').slice(0, 30);

// ============================================
// HELPERS DE NETTOYAGE (typés)
// ============================================
const cleanString = (
  v: string | null | undefined
): string | null | undefined => {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const trimmed = v.trim();
  return trimmed === '' ? null : trimmed;
};

// ============================================
// COMPOSANT
// ============================================
const MonEtablissementPage: React.FC = () => {
  const toast = useToast();
  const { data: etab, isLoading, isError, error, refetch } =
    useMonEtablissement();
  const updateMutation = useUpdateMonEtablissement();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateMonEtablissementPayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─────────────────────────────────────────
  // INITIALISATION DU FORM
  // ─────────────────────────────────────────
  useEffect(() => {
    if (etab) {
      setForm({
        nom: etab.nom,
        logo: etab.logo,
        adresse: etab.adresse,
        ville: etab.ville,
        pays: etab.pays,
        telephone: etab.telephone,
        email: etab.email,
        siteWeb: etab.siteWeb,
        numeroAgrement: etab.numeroAgrement,
        devise: etab.devise,
        fuseauHoraire: etab.fuseauHoraire,
        formatDate: etab.formatDate,
        joursOuvrables: etab.joursOuvrables,
        heureDebut: etab.heureDebut,
        heureFin: etab.heureFin,
        toleranceRetard: etab.toleranceRetard,
        tauxHeureSup: etab.tauxHeureSup,
        // ⚠️ PAS de `type`, `planAbonnement`, `maxUtilisateurs` (non modifiables)
      });
    }
  }, [etab]);

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const updateField = <K extends keyof UpdateMonEtablissementPayload>(
    field: K,
    value: UpdateMonEtablissementPayload[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
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
  // VALIDATION
  // ─────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (form.nom !== undefined && form.nom.trim().length < 2) {
      errs.nom = 'Minimum 2 caractères';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Email invalide';
    }

    if (form.telephone && !/^[+0-9 ()-]+$/.test(form.telephone)) {
      errs.telephone = 'Format invalide';
    }

    if (form.joursOuvrables && form.joursOuvrables.length === 0) {
      errs.joursOuvrables = 'Au moins 1 jour';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─────────────────────────────────────────
  // SUBMIT — 🔥 CONSTRUCTION TYPÉE (corrige erreur 7053)
  // ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.warning('Formulaire incomplet', 'Veuillez corriger les erreurs.');
      return;
    }

    try {
      // 🎯 Construction typée — pas de `as any`
      const cleanPayload: UpdateMonEtablissementPayload = {};

      // ─── Champs string ───
      if (form.nom !== undefined) cleanPayload.nom = form.nom.trim();
      if (form.logo !== undefined) cleanPayload.logo = cleanString(form.logo);
      if (form.adresse !== undefined)
        cleanPayload.adresse = cleanString(form.adresse);
      if (form.ville !== undefined) cleanPayload.ville = cleanString(form.ville);
      if (form.pays !== undefined) cleanPayload.pays = form.pays.trim();
      if (form.telephone !== undefined)
        cleanPayload.telephone = cleanString(form.telephone);
      if (form.email !== undefined) cleanPayload.email = cleanString(form.email);
      if (form.siteWeb !== undefined)
        cleanPayload.siteWeb = cleanString(form.siteWeb);
      if (form.numeroAgrement !== undefined)
        cleanPayload.numeroAgrement = cleanString(form.numeroAgrement);
      if (form.devise !== undefined) cleanPayload.devise = form.devise;
      if (form.fuseauHoraire !== undefined)
        cleanPayload.fuseauHoraire = form.fuseauHoraire;
      if (form.formatDate !== undefined)
        cleanPayload.formatDate = form.formatDate;
      if (form.heureDebut !== undefined)
        cleanPayload.heureDebut = cleanString(form.heureDebut);
      if (form.heureFin !== undefined)
        cleanPayload.heureFin = cleanString(form.heureFin);

      // ─── Champs tableau ───
      if (form.joursOuvrables !== undefined)
        cleanPayload.joursOuvrables = form.joursOuvrables;

      // ─── Champs number ───
      if (form.toleranceRetard !== undefined)
        cleanPayload.toleranceRetard = form.toleranceRetard;
      if (form.tauxHeureSup !== undefined)
        cleanPayload.tauxHeureSup = form.tauxHeureSup;

      await updateMutation.mutateAsync(cleanPayload);

      toast.success(
        'Établissement mis à jour !',
        'Vos modifications ont été enregistrées.'
      );

      setIsEditing(false);
    } catch (err) {
      toast.fromApiError(err, 'Erreur lors de la mise à jour');
    }
  };

  const handleCancel = () => {
    if (etab) {
      setForm({
        nom: etab.nom,
        logo: etab.logo,
        adresse: etab.adresse,
        ville: etab.ville,
        pays: etab.pays,
        telephone: etab.telephone,
        email: etab.email,
        siteWeb: etab.siteWeb,
        numeroAgrement: etab.numeroAgrement,
        devise: etab.devise,
        fuseauHoraire: etab.fuseauHoraire,
        formatDate: etab.formatDate,
        joursOuvrables: etab.joursOuvrables,
        heureDebut: etab.heureDebut,
        heureFin: etab.heureFin,
        toleranceRetard: etab.toleranceRetard,
        tauxHeureSup: etab.tauxHeureSup,
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  // ─────────────────────────────────────────
  // RENDU : Loading
  // ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // RENDU : Erreur
  // ─────────────────────────────────────────
  if (isError || !etab) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Erreur de chargement</p>
        <p className="text-gray-500 text-sm mt-1">
          {(error as any)?.response?.data?.message ?? 'Une erreur est survenue'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // RENDU PRINCIPAL
  // ─────────────────────────────────────────
  const planColors = PLAN_COLORS[etab.planAbonnement] ?? PLAN_COLORS.GRATUIT;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* ============================================
          EN-TÊTE
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {etab.logo ? (
              <img
                src={etab.logo}
                alt={etab.nom}
                className="w-16 h-16 rounded-2xl object-cover border border-gray-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                {etab.nom.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{etab.nom}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                  {etab.code}
                </span>
                {etab.estActif ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4" />
                    Actif
                  </span>
                ) : (
                  <span className="text-gray-400">Inactif</span>
                )}
              </div>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Modifier
            </button>
          )}
        </div>
      </motion.div>

      {/* ============================================
          FORMULAIRE / LECTURE
          ============================================ */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* ─── Identité ─── */}
        <section>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <IdentificationIcon className="w-4 h-4 text-blue-500" />
            Identité
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom — MODIFIABLE */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                Nom de l'établissement
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.nom ?? ''}
                  onChange={(e) => updateField('nom', e.target.value)}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.nom ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              ) : (
                <p className="text-gray-900 font-medium py-2.5">{etab.nom}</p>
              )}
            </div>

            {/* Type — 🔒 NON MODIFIABLE */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                Type
              </label>
              <div className="flex items-center gap-2 py-2.5">
                <p className="text-gray-900">
                  {TYPE_LABELS[etab.type] ?? etab.type}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                  <ShieldCheckIcon className="w-3 h-3" />
                  Verrouillé
                </span>
              </div>
            </div>

            {/* Plan d'abonnement — 🔒 NON MODIFIABLE */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                Plan d'abonnement
              </label>
              <div className="flex items-center gap-2 py-2.5">
                <span
                  className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${planColors}`}
                >
                  {PLAN_LABELS[etab.planAbonnement] ?? etab.planAbonnement}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                  <ShieldCheckIcon className="w-3 h-3" />
                  Verrouillé
                </span>
              </div>
            </div>

            {/* Max utilisateurs — 🔒 NON MODIFIABLE */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                Nombre max d'utilisateurs
              </label>
              <div className="flex items-center gap-2 py-2.5">
                <p className="text-gray-900 font-medium">
                  {etab.maxUtilisateurs.toLocaleString('fr-FR')} utilisateurs
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                  <ShieldCheckIcon className="w-3 h-3" />
                  Verrouillé
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Localisation ─── */}
        <section className="pt-6 border-t border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-blue-500" />
            Localisation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                Ville
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.ville ?? ''}
                  onChange={(e) => updateField('ville', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-gray-900 py-2.5">{etab.ville ?? '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                Pays
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.pays ?? ''}
                  onChange={(e) => updateField('pays', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-gray-900 py-2.5">{etab.pays}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                Adresse
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.adresse ?? ''}
                  onChange={(e) => updateField('adresse', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-gray-900 py-2.5">{etab.adresse ?? '—'}</p>
              )}
            </div>
          </div>
        </section>

        {/* ─── Contact ─── */}
        <section className="pt-6 border-t border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <PhoneIcon className="w-4 h-4 text-blue-500" />
            Contact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.email ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              ) : (
                <p className="text-gray-900 py-2.5">{etab.email ?? '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                Téléphone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={form.telephone ?? ''}
                  onChange={(e) =>
                    updateField('telephone', normalizePhone(e.target.value))
                  }
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.telephone ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              ) : (
                <p className="text-gray-900 py-2.5">{etab.telephone ?? '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                Site web
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={form.siteWeb ?? ''}
                  onChange={(e) => updateField('siteWeb', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-gray-900 py-2.5">
                  {etab.siteWeb ? (
                    <a
                      href={etab.siteWeb}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {etab.siteWeb}
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                N° Agrément
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.numeroAgrement ?? ''}
                  onChange={(e) =>
                    updateField('numeroAgrement', e.target.value)
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-gray-900 py-2.5">
                  {etab.numeroAgrement ?? '—'}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ─── Configuration ─── */}
        <section className="pt-6 border-t border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-blue-500" />
            Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                Devise
              </label>
              {isEditing ? (
                <select
                  value={form.devise ?? 'XOF'}
                  onChange={(e) => updateField('devise', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="XOF">XOF (FCFA)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="MAD">MAD (Dirham)</option>
                  <option value="GHS">GHS (Cedi)</option>
                </select>
              ) : (
                <p className="text-gray-900 py-2.5">{etab.devise}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                Tolérance retard (min)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={form.toleranceRetard ?? 15}
                  onChange={(e) =>
                    updateField('toleranceRetard', Number(e.target.value))
                  }
                  min={0}
                  max={120}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-gray-900 py-2.5">
                  {etab.toleranceRetard} minutes
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                Heure début
              </label>
              {isEditing ? (
                <input
                  type="time"
                  value={form.heureDebut ?? '08:00'}
                  onChange={(e) => updateField('heureDebut', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-gray-900 py-2.5">{etab.heureDebut ?? '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                Heure fin
              </label>
              {isEditing ? (
                <input
                  type="time"
                  value={form.heureFin ?? '17:00'}
                  onChange={(e) => updateField('heureFin', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-gray-900 py-2.5">{etab.heureFin ?? '—'}</p>
              )}
            </div>
          </div>

          {/* Jours ouvrables */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">
              Jours ouvrables
            </label>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {JOURS_SEMAINE.map((jour) => {
                  const isActive = form.joursOuvrables?.includes(jour) ?? false;
                  return (
                    <button
                      key={jour}
                      type="button"
                      onClick={() => toggleJour(jour)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {jour.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {etab.joursOuvrables.map((j) => (
                  <span
                    key={j}
                    className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {j.slice(0, 3)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── Info champs verrouillés ─── */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1 flex items-center gap-2">
              Champs verrouillés (gérés par l'administrateur)
            </p>
            <ul className="space-y-0.5 text-blue-700">
              <li className="flex items-center gap-1.5">
                <BriefcaseIcon className="w-3.5 h-3.5" />
                <span><strong>Type d'établissement</strong> : Public, Privé, etc.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <IdentificationIcon className="w-3.5 h-3.5" />
                <span><strong>Plan d'abonnement</strong> : Gratuit, Standard, Premium, etc.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <UsersIcon className="w-3.5 h-3.5" />
                <span><strong>Nombre max d'utilisateurs</strong> : quota du plan</span>
              </li>
            </ul>
            <p className="text-blue-700 mt-2">
              Pour toute modification de ces champs, veuillez contacter le
              support technique.
            </p>
          </div>
        </div>

        {/* ─── Actions ─── */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-4 h-4" />
              Annuler
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {updateMutation.isPending ? (
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
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default MonEtablissementPage;