// frontend2/src/pages/dashboard/directeur/eleves/EleveEditerPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  HeartIcon,
  PlusCircleIcon,
  PhoneIcon,
  IdentificationIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import {
  useEleve,
  useUpdateEleve,
} from '../../../../hooks/useEleves';
import { useClasses } from '../../../../hooks/useClasses';
import { useToast } from '../../../../context/ToastContext';
import type {
  UpdateElevePayload,
  StatutEleve,
} from '../../../../types/eleve.types';

const STATUTS: { value: StatutEleve; label: string }[] = [
  { value: 'ACTIF', label: 'Actif' },
  { value: 'SUSPENDU', label: 'Suspendu' },
  { value: 'TRANSFERE', label: 'Transféré' },
  { value: 'SORTI', label: 'Sorti' },
  { value: 'ARCHIVE', label: 'Archivé' },
];

const GROUPES_SANGUINS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const EleveEditerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  // ✅ useEleve retourne directement un Eleve
  const { data: eleve, isLoading } = useEleve(id);
  const updateMutation = useUpdateEleve();

  // ✅ useClasses retourne { classes, pagination } (ClassesListResult)
  const { data: classesData, isLoading: classesLoading } = useClasses({
    limit: 200,
  });
  const classes = classesData?.classes ?? [];

  const [form, setForm] = useState<UpdateElevePayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);
  const [createCompte, setCreateCompte] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🆕 Changement de classe
  const [selectedClasseId, setSelectedClasseId] = useState<string | null>(null);
  const [classeChanged, setClasseChanged] = useState(false);

  // Classe actuellement active de l'élève
  const currentInscription = useMemo(() => {
    return eleve?.inscriptions?.find((i) => i.estActive) ?? null;
  }, [eleve]);

  // Pré-remplissage
  useEffect(() => {
    if (eleve && !initialized) {
      setForm({
        prenom: eleve.prenom,
        nom: eleve.nom,
        sexe: eleve.sexe,
        dateNaissance: eleve.dateNaissance,
        lieuNaissance: eleve.lieuNaissance,
        nationalite: eleve.nationalite,
        adresse: eleve.adresse,
        telephone: eleve.telephone,
        email: eleve.email,
        photo: eleve.photo,
        infoMedicale: eleve.infoMedicale,
        groupeSanguin: eleve.groupeSanguin,
        allergies: eleve.allergies,
        statut: eleve.statut,
        motDePasse: null,
      });
      setSelectedClasseId(currentInscription?.classeId ?? null);
      setInitialized(true);
    }
  }, [eleve, initialized, currentInscription]);

  const updateField = <K extends keyof UpdateElevePayload>(
    field: K,
    value: UpdateElevePayload[K]
  ) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as string]: '' }));
  };

  const handleClasseChange = (classeId: string) => {
    setSelectedClasseId(classeId || null);
    setClasseChanged(
      (classeId || null) !== (currentInscription?.classeId ?? null)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !eleve) return;

    const errs: Record<string, string> = {};
    if (!form.prenom?.trim()) errs.prenom = 'Le prénom est obligatoire';
    if (!form.nom?.trim()) errs.nom = 'Le nom est obligatoire';

    if (createCompte && !eleve.utilisateur) {
      if (!form.email?.trim()) {
        errs.email = 'Email requis pour créer un compte';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errs.email = 'Email invalide';
      }
    }

    if (
      form.motDePasse &&
      form.motDePasse.length > 0 &&
      form.motDePasse.length < 8
    ) {
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
          createCompte: createCompte && !eleve.utilisateur,
          prenom: form.prenom?.trim(),
          nom: form.nom?.trim(),
          lieuNaissance: form.lieuNaissance?.trim() || null,
          nationalite: form.nationalite?.trim() || null,
          adresse: form.adresse?.trim() || null,
          telephone: form.telephone?.trim() || null,
          infoMedicale: form.infoMedicale?.trim() || null,
          allergies: form.allergies?.trim() || null,
          // 🆕 Changement de classe : null si retiré, cuid si réinscrit
          ...(classeChanged && { classeId: selectedClasseId }),
        },
      });
      navigate(`/dashboard/eleves/${id}`);
    } catch {
      /* toast géré par le hook */
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-500 mt-4">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!eleve) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Élève introuvable</p>
        <Link
          to="/dashboard/eleves"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </Link>
      </div>
    );
  }

  const hasCompte = !!eleve.utilisateur;
  const currentAssignment = eleve.assignmentsScolarite?.[0] ?? null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to={`/dashboard/eleves/${id}`}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserGroupIcon className="w-7 h-7 text-amber-600" />
            Modifier l'élève
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {eleve.prenom} {eleve.nom} — {eleve.matricule}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* ─── Section Scolarité (changement de classe) ─── */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AcademicCapIcon className="w-4 h-4 text-indigo-500" />
            Scolarité
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Classe actuelle
              </label>
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                {currentInscription?.classe ? (
                  <span className="text-sm text-gray-900 font-medium">
                    {currentInscription.classe.nom}{' '}
                    <span className="text-gray-500">
                      ({currentInscription.classe.code})
                    </span>
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">
                    Aucune classe active
                  </span>
                )}
              </div>
              {currentInscription?.anneeScolaire && (
                <p className="text-xs text-gray-500 mt-1">
                  Année : {currentInscription.anneeScolaire.nom}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Changer de classe
              </label>
              <select
                value={selectedClasseId ?? ''}
                onChange={(e) => handleClasseChange(e.target.value)}
                disabled={classesLoading}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">— Retirer de la classe —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} ({c.code})
                  </option>
                ))}
              </select>
              {classeChanged && (
                <p className="text-xs text-indigo-600 mt-1.5 flex items-center gap-1">
                  <InformationCircleIcon className="w-3.5 h-3.5" />
                  L'ancienne inscription sera désactivée. Un assignment de
                  scolarité sera créé si un plan existe.
                </p>
              )}
            </div>
          </div>

          {/* Plan de scolarité actuel */}
          {currentAssignment?.planScolarite && (
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-2">
              <BanknotesIcon className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-800">
                  Plan actuel : {currentAssignment.planScolarite.nom}
                </p>
                <p className="text-xs text-indigo-700">
                  Montant total :{' '}
                  {currentAssignment.planScolarite.montantTotal.toLocaleString()}{' '}
                  {currentAssignment.planScolarite.devise}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── Section Identité ─── */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UserCircleIcon className="w-4 h-4 text-blue-500" />
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
                        ? 'bg-blue-600 text-white'
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
                onChange={(e) => updateField('dateNaissance', e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lieu de naissance
              </label>
              <input
                type="text"
                value={form.lieuNaissance ?? ''}
                onChange={(e) =>
                  updateField('lieuNaissance', e.target.value || null)
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
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
                  updateField('nationalite', e.target.value || null)
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* ─── Section Contact ─── */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <PhoneIcon className="w-4 h-4 text-blue-500" />
            Contact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Téléphone
              </label>
              <input
                type="tel"
                value={form.telephone ?? ''}
                onChange={(e) =>
                  updateField('telephone', e.target.value || null)
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
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

        {/* ─── Section Médicale ─── */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <HeartIcon className="w-4 h-4 text-red-500" />
            Informations médicales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Groupe sanguin
              </label>
              <select
                value={form.groupeSanguin ?? ''}
                onChange={(e) =>
                  updateField('groupeSanguin', e.target.value || null)
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
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
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* ─── Section Statut ─── */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <IdentificationIcon className="w-4 h-4 text-blue-500" />
            Statut
          </h2>

          <select
            value={form.statut ?? 'ACTIF'}
            onChange={(e) =>
              updateField('statut', e.target.value as StatutEleve)
            }
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
          >
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* ─── Section Compte utilisateur ─── */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UserCircleIcon className="w-4 h-4 text-blue-500" />
            Compte utilisateur
          </h2>

          {hasCompte ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800">
                    Compte existant
                  </p>
                  <p className="text-xs text-emerald-700">
                    Email : {eleve.utilisateur?.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <p className="text-xs text-red-600 mt-1.5">
                      {errors.email}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Laisser vide pour ne pas modifier
                  </p>
                </div>

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
                      Minimum 8 caractères
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
                <InformationCircleIcon className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-800">
                  Modifier l'email révoquera la vérification. Modifier le mot de
                  passe révoquera toutes les sessions actives.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    Aucun compte utilisateur
                  </p>
                  <p className="text-xs text-amber-700">
                    Cet élève ne peut pas se connecter à l'application.
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
                    Permettra à l'élève de se connecter.
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
                        placeholder="Laisser vide pour générer"
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
            to={`/dashboard/eleves/${id}`}
            className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
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

export default EleveEditerPage;