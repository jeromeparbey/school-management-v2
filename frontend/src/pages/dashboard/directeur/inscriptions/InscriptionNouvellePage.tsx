// frontend2/src/pages/dashboard/directeur/inscriptions/InscriptionNouvellePage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useCreateInscription } from '../../../../hooks/useInscriptions';
import { useEleves, useCreateEleve } from '../../../../hooks/useEleves';
import { useClasses } from '../../../../hooks/useClasses';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import { useInscriptions } from '../../../../hooks/useInscriptions';
import { useToast } from '../../../../context/ToastContext';
import type { AnneeScolaire } from '../../../../types/anneeScolaire.types';
import type { Eleve } from '../../../../types/eleve.types';

const InscriptionNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // ─────────── Sélection principale ───────────
  const [eleveId, setEleveId] = useState('');
  const [classeId, setClasseId] = useState('');
  const [anneeScolaireId, setAnneeScolaireId] = useState('');
  const [dateInscription, setDateInscription] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─────────── Recherche élève ───────────
  const [searchEleve, setSearchEleve] = useState('');
  const [showEleveDropdown, setShowEleveDropdown] = useState(false);

  // ─────────── Modal création rapide élève ───────────
  const [showCreateEleve, setShowCreateEleve] = useState(false);
  const [newEleve, setNewEleve] = useState({
    prenom: '',
    nom: '',
    sexe: 'M' as 'M' | 'F',
    dateNaissance: '',
    email: '',
    telephone: '',
  });
  const [newEleveErrors, setNewEleveErrors] = useState<
    Record<string, string>
  >({});

  const createMutation = useCreateInscription();
  const createEleveMutation = useCreateEleve();

  // ─────────── Lookups ───────────
  const {
    data: elevesData,
    isLoading: elevesLoading,
    refetch: refetchEleves,
  } = useEleves({ sortBy: 'nom', sortOrder: 'asc' });
  const eleves = elevesData?.eleves ?? [];

  const { data: classesData, isLoading: classesLoading } = useClasses({
    limit: 200,
  });
  const classes = classesData?.classes ?? [];

  const { data: anneesData } = useAnneesScolaires({ limit: 50 });
  const annees: AnneeScolaire[] = anneesData?.annees ?? [];

  // ─────────── Places restantes ───────────
  const selectedClasse = useMemo(
    () => classes.find((c) => c.id === classeId),
    [classes, classeId]
  );

  // Compte des inscriptions actives pour la classe + année sélectionnées
  const { data: inscriptionsClasseData, isLoading: inscriptionsClasseLoading } =
    useInscriptions({
      classeId: classeId || undefined,
      anneeScolaireId: anneeScolaireId || undefined,
      estActive: true,
      limit: 1, // on n'a besoin que du total
    });

  const nbInscrits = inscriptionsClasseData?.pagination?.total ?? 0;
  const capacite = selectedClasse?.capacite ?? null;
  const placesRestantes =
    capacite != null ? Math.max(0, capacite - nbInscrits) : null;
  const classePleine = placesRestantes === 0;

  // ─────────── Année active par défaut ───────────
  useEffect(() => {
    if (!anneeScolaireId && annees.length > 0) {
      const active = annees.find((a) => a.estActive);
      if (active) setAnneeScolaireId(active.id);
    }
  }, [annees, anneeScolaireId]);

  // ─────────── Filtre élèves ───────────
  const filteredEleves = useMemo(() => {
    const q = searchEleve.trim().toLowerCase();
    if (!q) return eleves.slice(0, 50); // limite l'affichage initial
    return eleves
      .filter((e) => {
        const hay = `${e.prenom} ${e.nom} ${e.matricule} ${e.email ?? ''}`
          .toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [eleves, searchEleve]);

  const selectedEleve = useMemo(
    () => eleves.find((e) => e.id === eleveId) ?? null,
    [eleves, eleveId]
  );

  const selectedAnnee = useMemo(
    () => annees.find((a) => a.id === anneeScolaireId) ?? null,
    [annees, anneeScolaireId]
  );

  // ─────────── Sélection ───────────
  const handleSelectEleve = (e: Eleve) => {
    setEleveId(e.id);
    setSearchEleve(`${e.prenom} ${e.nom}`);
    setShowEleveDropdown(false);
    setErrors((x) => ({ ...x, eleveId: '' }));
  };

  const handleClearEleve = () => {
    setEleveId('');
    setSearchEleve('');
  };

  // ─────────── Validation ───────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!eleveId) errs.eleveId = 'Sélectionnez un élève';
    if (!classeId) errs.classeId = 'Sélectionnez une classe';
    if (!anneeScolaireId) errs.anneeScolaireId = 'Sélectionnez une année';
    if (classePleine) errs.classeId = 'La classe est pleine';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.warning('Formulaire incomplet');
      return;
    }

    try {
      await createMutation.mutateAsync({
        eleveId,
        classeId,
        anneeScolaireId,
        dateInscription: new Date(dateInscription).toISOString(),
        estActive: true,
      });
      navigate('/dashboard/eleves/inscriptions');
    } catch {
      /* toast géré par le hook */
    }
  };

  // ─────────── Création rapide élève ───────────
  const handleCreateEleve = async () => {
    const errs: Record<string, string> = {};
    if (!newEleve.prenom.trim()) errs.prenom = 'Prénom requis';
    if (!newEleve.nom.trim()) errs.nom = 'Nom requis';
    if (!newEleve.dateNaissance)
      errs.dateNaissance = 'Date de naissance requise';
    setNewEleveErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const res = await createEleveMutation.mutateAsync({
        prenom: newEleve.prenom.trim(),
        nom: newEleve.nom.trim(),
        sexe: newEleve.sexe,
        dateNaissance: newEleve.dateNaissance,
        email: newEleve.email.trim() || null,
        telephone: newEleve.telephone.trim() || null,
        statut: 'ACTIF',
      });

      const createdEleve: Eleve | undefined = res?.data;
      if (createdEleve) {
        await refetchEleves();
        setEleveId(createdEleve.id);
        setSearchEleve(`${createdEleve.prenom} ${createdEleve.nom}`);
        setShowCreateEleve(false);
        setNewEleve({
          prenom: '',
          nom: '',
          sexe: 'M',
          dateNaissance: '',
          email: '',
          telephone: '',
        });
        toast.success(
          `Élève créé : ${createdEleve.prenom} ${createdEleve.nom}`
        );
      }
    } catch {
      /* toast géré par le hook */
    }
  };

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/inscriptions"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AcademicCapIcon className="w-7 h-7 text-blue-600" />
            Nouvelle inscription
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Inscrire un élève dans une classe pour une année scolaire
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* ═══════════ ÉLÈVE (recherche) ═══════════ */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Élève <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowCreateEleve(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Créer un élève
            </button>
          </div>

          {!selectedEleve ? (
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, matricule…"
                value={searchEleve}
                onChange={(e) => {
                  setSearchEleve(e.target.value);
                  setShowEleveDropdown(true);
                }}
                onFocus={() => setShowEleveDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowEleveDropdown(false), 150)
                }
                className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  errors.eleveId
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              {elevesLoading && (
                <ArrowPathIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}

              {/* Dropdown */}
              {showEleveDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                  {filteredEleves.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      {searchEleve.trim() ? (
                        <>
                          Aucun élève ne correspond à «&nbsp;
                          <strong>{searchEleve}</strong>&nbsp;».
                          <button
                            type="button"
                            onClick={() => setShowCreateEleve(true)}
                            className="block mx-auto mt-2 text-blue-600 font-medium hover:underline text-xs"
                          >
                            + Créer cet élève
                          </button>
                        </>
                      ) : (
                        'Aucun élève enregistré'
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50 sticky top-0">
                        {filteredEleves.length} résultat(s)
                        {eleves.length > filteredEleves.length &&
                          ` sur ${eleves.length}`}
                      </div>
                      {filteredEleves.map((e) => {
                        const currentInscription = e.inscriptions?.find(
                          (i) => i.estActive
                        );
                        return (
                          <button
                            key={e.id}
                            type="button"
                            onMouseDown={(ev) => {
                              ev.preventDefault();
                              handleSelectEleve(e);
                            }}
                            className="w-full text-left px-3 py-2.5 hover:bg-blue-50 flex items-center gap-3 border-b last:border-b-0"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
                              {e.prenom[0]}
                              {e.nom[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {e.prenom} {e.nom}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {e.matricule}
                                {currentInscription?.classe && (
                                  <>
                                    {' — '}
                                    <span className="text-amber-600">
                                      {currentInscription.classe.nom}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                e.statut === 'ACTIF'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {e.statut}
                            </span>
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Élève sélectionné
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {selectedEleve.prenom[0]}
                {selectedEleve.nom[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">
                  {selectedEleve.prenom} {selectedEleve.nom}
                </p>
                <p className="text-xs text-gray-600">
                  {selectedEleve.matricule}
                  {selectedEleve.email && ` — ${selectedEleve.email}`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearEleve}
                className="p-1.5 text-gray-500 hover:bg-white rounded-lg"
                title="Changer d'élève"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {errors.eleveId && (
            <p className="text-xs text-red-600 mt-1.5">{errors.eleveId}</p>
          )}
        </div>

        {/* ═══════════ CLASSE ═══════════ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Classe <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <AcademicCapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={classeId}
              onChange={(e) => {
                setClasseId(e.target.value);
                setErrors((x) => ({ ...x, classeId: '' }));
              }}
              disabled={classesLoading}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                errors.classeId ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <option value="">— Sélectionner une classe —</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom} ({c.code})
                  {c.capacite != null ? ` — ${c.capacite} places` : ''}
                </option>
              ))}
            </select>
          </div>
          {errors.classeId && (
            <p className="text-xs text-red-600 mt-1.5">{errors.classeId}</p>
          )}

          {/* Places restantes */}
          {selectedClasse && capacite != null && (
            <div
              className={`mt-2 p-3 rounded-lg flex items-start gap-2 border ${
                classePleine
                  ? 'bg-red-50 border-red-200'
                  : placesRestantes != null && placesRestantes <= 3
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              {classePleine ? (
                <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              ) : (
                <CheckCircleIcon
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    placesRestantes != null && placesRestantes <= 3
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                />
              )}
              <div className="flex-1 text-xs">
                <p
                  className={`font-semibold ${
                    classePleine
                      ? 'text-red-800'
                      : placesRestantes != null && placesRestantes <= 3
                      ? 'text-amber-800'
                      : 'text-emerald-800'
                  }`}
                >
                  {classePleine
                    ? 'Classe pleine'
                    : `${placesRestantes} place(s) restante(s)`}
                </p>
                <p
                  className={
                    classePleine
                      ? 'text-red-700'
                      : placesRestantes != null && placesRestantes <= 3
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }
                >
                  {inscriptionsClasseLoading
                    ? 'Calcul en cours…'
                    : `${nbInscrits} / ${capacite} inscrit(s)`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ ANNÉE ═══════════ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Année scolaire <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={anneeScolaireId}
              onChange={(e) => {
                setAnneeScolaireId(e.target.value);
                setErrors((x) => ({ ...x, anneeScolaireId: '' }));
              }}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                errors.anneeScolaireId
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200'
              }`}
            >
              <option value="">— Sélectionner une année —</option>
              {annees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nom} {a.estActive ? '(active)' : ''}
                </option>
              ))}
            </select>
          </div>
          {errors.anneeScolaireId && (
            <p className="text-xs text-red-600 mt-1.5">
              {errors.anneeScolaireId}
            </p>
          )}
        </div>

        {/* ═══════════ DATE ═══════════ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Date d'inscription
          </label>
          <div className="relative">
            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateInscription}
              onChange={(e) => setDateInscription(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* ═══════════ RÉCAP ═══════════ */}
        {selectedEleve && selectedClasse && (
          <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-blue-600" />
              Récapitulatif
            </p>
            <p className="text-xs text-gray-700 mt-1">
              <strong>
                {selectedEleve.prenom} {selectedEleve.nom}
              </strong>{' '}
              sera inscrit en <strong>{selectedClasse.nom}</strong>
              {selectedAnnee && (
                <>
                  {' '}
                  pour <strong>{selectedAnnee.nom}</strong>
                </>
              )}
              {capacite != null && placesRestantes != null && (
                <>
                  {' '}
                  — <strong>{placesRestantes}</strong> place(s) restante(s)
                </>
              )}
              .
            </p>
          </div>
        )}

        {/* Info capacité */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <InformationCircleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            L'inscription sera refusée si la classe est pleine ou si l'élève y
            est déjà inscrit pour cette année.
          </p>
        </div>

        {/* ═══════════ ACTIONS ═══════════ */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to="/dashboard/inscriptions"
            className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={
              createMutation.isPending || classePleine || !eleveId || !classeId
            }
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Création…
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                Créer l'inscription
              </>
            )}
          </button>
        </div>
      </form>

      {/* ═══════════ MODAL CRÉATION RAPIDE ÉLÈVE ═══════════ */}
      {showCreateEleve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
                Création rapide d'élève
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateEleve(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Créez un élève avec les informations minimales. Vous pourrez
              compléter plus tard.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={newEleve.prenom}
                  onChange={(e) =>
                    setNewEleve((f) => ({ ...f, prenom: e.target.value }))
                  }
                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg ${
                    newEleveErrors.prenom
                      ? 'border-red-300'
                      : 'border-gray-200'
                  }`}
                />
                {newEleveErrors.prenom && (
                  <p className="text-xs text-red-600 mt-1">
                    {newEleveErrors.prenom}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={newEleve.nom}
                  onChange={(e) =>
                    setNewEleve((f) => ({ ...f, nom: e.target.value }))
                  }
                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg ${
                    newEleveErrors.nom ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {newEleveErrors.nom && (
                  <p className="text-xs text-red-600 mt-1">
                    {newEleveErrors.nom}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Sexe
                </label>
                <div className="flex gap-2">
                  {(['M', 'F'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setNewEleve((f) => ({ ...f, sexe: s }))
                      }
                      className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium ${
                        newEleve.sexe === s
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {s === 'M' ? '♂ M' : '♀ F'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  value={newEleve.dateNaissance}
                  onChange={(e) =>
                    setNewEleve((f) => ({
                      ...f,
                      dateNaissance: e.target.value,
                    }))
                  }
                  max={new Date().toISOString().slice(0, 10)}
                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg ${
                    newEleveErrors.dateNaissance
                      ? 'border-red-300'
                      : 'border-gray-200'
                  }`}
                />
                {newEleveErrors.dateNaissance && (
                  <p className="text-xs text-red-600 mt-1">
                    {newEleveErrors.dateNaissance}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={newEleve.email}
                  onChange={(e) =>
                    setNewEleve((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={newEleve.telephone}
                  onChange={(e) =>
                    setNewEleve((f) => ({ ...f, telephone: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateEleve(false)}
                className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleCreateEleve}
                disabled={createEleveMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {createEleveMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Création…
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    Créer et sélectionner
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InscriptionNouvellePage;