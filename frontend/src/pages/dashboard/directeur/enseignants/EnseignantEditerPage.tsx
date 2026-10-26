// frontend2/src/pages/dashboard/directeur/enseignants/EnseignantEditerPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  InformationCircleIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useEnseignant,
  useUpdateEnseignant,
} from '../../../../hooks/useEnseignants';
import { useToast } from '../../../../context/ToastContext';
import type { UpdateEnseignantPayload } from '../../../../types/enseignant.types';

const CONTRATS = ['CDI', 'CDD', 'VACATAIRE', 'STAGE'];

const EnseignantEditerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: enseignantData, isLoading } = useEnseignant(id);
  const updateMutation = useUpdateEnseignant();

  const enseignant = enseignantData?.data;

  const [form, setForm] = useState<UpdateEnseignantPayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);
  const [createCompte, setCreateCompte] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Pré-remplissage
  useEffect(() => {
    if (enseignant && !initialized) {
      setForm({
        prenom: enseignant.prenom,
        nom: enseignant.nom,
        sexe: enseignant.sexe,
        dateNaissance: enseignant.dateNaissance,
        telephone: enseignant.telephone,
        adresse: enseignant.adresse,
        dateEmbauche: enseignant.dateEmbauche,
        typeContrat: enseignant.typeContrat,
        qualification: enseignant.qualification,
        specialite: enseignant.specialite,
        salaireBase: enseignant.salaireBase,
        estActif: enseignant.estActif,
        estArchive: enseignant.estArchive,
        email: enseignant.email,
        motDePasse: null,
      });
      setInitialized(true);
    }
  }, [enseignant, initialized]);

  // Créer compte a posteriori
  useEffect(() => {
    if (enseignant && !enseignant.utilisateur && initialized) {
      setCreateCompte(false);
    }
  }, [enseignant, initialized]);

  const updateField = <K extends keyof UpdateEnseignantPayload>(
    field: K,
    value: UpdateEnseignantPayload[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !enseignant) return;

    const errs: Record<string, string> = {};
    if (!form.prenom?.trim()) errs.prenom = 'Le prénom est obligatoire';
    if (!form.nom?.trim()) errs.nom = 'Le nom est obligatoire';
    if (!form.telephone?.trim())
      errs.telephone = 'Le téléphone est obligatoire';
    if (form.salaireBase !== undefined && form.salaireBase < 0)
      errs.salaireBase = 'Le salaire doit être positif';

    // Si création de compte demandée
    if (createCompte && !enseignant.utilisateur) {
      if (!form.email?.trim()) {
        errs.email = 'Email requis pour créer un compte';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errs.email = 'Email invalide';
      }
    }

    // Validation mot de passe si fourni
    if (form.motDePasse && form.motDePasse.length > 0 && form.motDePasse.length < 8) {
      errs.motDePasse = 'Minimum 8 caractères';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.warning('Formulaire incomplet', 'Vérifiez les champs en rouge.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          ...form,
          email: form.email?.trim() || null,
          motDePasse: form.motDePasse?.trim() || null,
          createCompte: createCompte && !enseignant.utilisateur,
          prenom: form.prenom?.trim(),
          nom: form.nom?.trim(),
          telephone: form.telephone?.trim(),
          adresse: form.adresse?.trim() || null,
          qualification: form.qualification?.trim() || null,
          specialite: form.specialite?.trim() || null,
        },
      });
      navigate(`/dashboard/enseignants/${id}`);
    } catch {
      /* toast géré */
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="text-gray-500 mt-4">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!enseignant) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Enseignant introuvable</p>
        <Link
          to="/dashboard/enseignants"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </Link>
      </div>
    );
  }

  const hasCompte = !!enseignant.utilisateur;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to={`/dashboard/enseignants/${id}`}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AcademicCapIcon className="w-7 h-7 text-amber-600" />
            Modifier l'enseignant
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {enseignant.prenom} {enseignant.nom} — {enseignant.matricule}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* ─── Section Identité ─── */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UserCircleIcon className="w-4 h-4 text-indigo-500" />
            Identité
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.prenom ?? ''}
                onChange={(e) => updateField('prenom', e.target.value)}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                  errors.prenom ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.prenom && (
                <p className="text-xs text-red-600 mt-1.5">{errors.prenom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nom ?? ''}
                onChange={(e) => updateField('nom', e.target.value)}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                  errors.nom ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.nom && (
                <p className="text-xs text-red-600 mt-1.5">{errors.nom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sexe
              </label>
              <div className="flex gap-2">
                {(['M', 'F'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateField('sexe', s)}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      form.sexe === s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {s === 'M' ? '♂ Masculin' : '♀ Féminin'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date de naissance
              </label>
              <input
                type="date"
                value={form.dateNaissance?.slice(0, 10) ?? ''}
                onChange={(e) =>
                  updateField('dateNaissance', e.target.value)
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.telephone ?? ''}
                onChange={(e) => updateField('telephone', e.target.value)}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                  errors.telephone
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
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
              <input
                type="text"
                value={form.adresse ?? ''}
                onChange={(e) =>
                  updateField('adresse', e.target.value || null)
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* ─── Section Contrat ─── */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BriefcaseIcon className="w-4 h-4 text-indigo-500" />
            Contrat & rémunération
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date d'embauche
              </label>
              <input
                type="date"
                value={form.dateEmbauche?.slice(0, 10) ?? ''}
                onChange={(e) =>
                  updateField('dateEmbauche', e.target.value)
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Type de contrat
              </label>
              <select
                value={form.typeContrat ?? ''}
                onChange={(e) =>
                  updateField('typeContrat', e.target.value)
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {CONTRATS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
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
                  updateField('specialite', e.target.value || null)
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Salaire de base (XOF)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={form.salaireBase ?? 0}
                onChange={(e) =>
                  updateField('salaireBase', Number(e.target.value) || 0)
                }
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                  errors.salaireBase
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              {(form.salaireBase ?? 0) > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Intl.NumberFormat('fr-FR').format(
                    form.salaireBase ?? 0
                  )}{' '}
                  F CFA / mois
                </p>
              )}
            </div>
          </div>

          {/* Toggles actif/archivé */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={form.estActif ?? true}
                onChange={(e) =>
                  updateField('estActif', e.target.checked)
                }
                className="w-5 h-5 rounded text-emerald-600"
              />
              <span className="text-sm text-gray-700">
                Enseignant actif
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={form.estArchive ?? false}
                onChange={(e) =>
                  updateField('estArchive', e.target.checked)
                }
                className="w-5 h-5 rounded text-orange-600"
              />
              <span className="text-sm text-gray-700">
                Enseignant archivé
              </span>
            </label>
          </div>
        </div>

        {/* ─── Section Compte utilisateur ─── */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UserCircleIcon className="w-4 h-4 text-indigo-500" />
            Compte utilisateur
          </h2>

          {hasCompte ? (
            // Compte existant
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800">
                    Compte existant
                  </p>
                  <p className="text-xs text-emerald-700">
                    Email : {enseignant.utilisateur?.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email de connexion
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={form.email ?? ''}
                      onChange={(e) =>
                        updateField('email', e.target.value || null)
                      }
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
                        errors.email
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1.5">{errors.email}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Laisser vide pour ne pas modifier
                  </p>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.motDePasse ?? ''}
                      onChange={(e) =>
                        updateField('motDePasse', e.target.value || null)
                      }
                      placeholder="Laisser vide pour conserver"
                      className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${
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
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 8 caractères. Laisser vide pour conserver
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
                <InformationCircleIcon className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-800">
                  Si vous modifiez l'email, l'utilisateur devra revérifier son
                  adresse. Si vous modifiez le mot de passe, toutes les sessions
                  actives seront révoquées.
                </p>
              </div>
            </div>
          ) : (
            // Pas de compte
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    Aucun compte utilisateur
                  </p>
                  <p className="text-xs text-amber-700">
                    Cet enseignant ne peut pas se connecter à l'application.
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-100/50">
                <input
                  type="checkbox"
                  checked={createCompte}
                  onChange={(e) => setCreateCompte(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded text-indigo-600"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <PlusCircleIcon className="w-4 h-4 text-indigo-600" />
                    Créer un compte maintenant
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Permettra à l'enseignant de se connecter avec un email et
                    un mot de passe.
                  </p>
                </div>
              </label>

              {createCompte && (
                <div className="space-y-4 pl-4 border-l-2 border-indigo-200">
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
                      Mot de passe
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
                        className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to={`/dashboard/enseignants/${id}`}
            className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {updateMutation.isPending ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Enregistrement…
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnseignantEditerPage;