// frontend2/src/pages/dashboard/directeur/inscriptions/InscriptionNouvellePage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  useCreateInscription,
  usePreviewInscription,
  useInscrireEtPayer,
} from '../../../../hooks/useInscriptions';
import { useEleves, useCreateEleve } from '../../../../hooks/useEleves';
import { useClasses } from '../../../../hooks/useClasses';
import { useAnneesScolaires } from '../../../../hooks/useAnneesScolaires';
import { useToast } from '../../../../context/ToastContext';
import type { AnneeScolaire } from '../../../../types/anneeScolaire.types';
import type { Eleve } from '../../../../types/eleve.types';
import type {
  AllocationPaiementInput,
  MoyenPaiement,
} from '../../../../types/inscription.types';

// ═══════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════

const MOYENS: { value: MoyenPaiement; label: string }[] = [
  { value: 'ESPECES', label: 'Espèces' },
  { value: 'VIREMENT', label: 'Virement bancaire' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'CARTE', label: 'Carte bancaire' },
  { value: 'CHEQUE', label: 'Chèque' },
  { value: 'AUTRE', label: 'Autre' },
];

const TOLERANCE = 0.01;

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const formatMoney = (n: number | null | undefined) => {
  if (n == null) return '0 F CFA';
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' F CFA';
};

const formatDateStr = (d: string | null | undefined): string => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

const InscriptionNouvellePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // ─── Sélection principale ───
  const [eleveId, setEleveId] = useState('');
  const [classeId, setClasseId] = useState('');
  const [anneeScolaireId, setAnneeScolaireId] = useState('');
  const [dateInscription, setDateInscription] = useState(
    toDateInput(new Date())
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Recherches ───
  const [searchEleve, setSearchEleve] = useState('');
  const [showEleveDropdown, setShowEleveDropdown] = useState(false);
  const [searchClasse, setSearchClasse] = useState('');
  const [showClasseDropdown, setShowClasseDropdown] = useState(false);

  // ─── Mode paiement ───
  const [modePaiement, setModePaiement] = useState(false);
  const [montantPaiement, setMontantPaiement] = useState<number>(0);
  const [moyen, setMoyen] = useState<MoyenPaiement>('ESPECES');
  const [referenceMoyen, setReferenceMoyen] = useState('');
  const [notes, setNotes] = useState('');
  const [allocations, setAllocations] = useState<AllocationPaiementInput[]>([]);

  // ─── Modal création rapide élève ───
  const [showCreateEleve, setShowCreateEleve] = useState(false);
  const [newEleve, setNewEleve] = useState({
    prenom: '',
    nom: '',
    sexe: 'M' as 'M' | 'F',
    dateNaissance: '',
    email: '',
    telephone: '',
  });
  const [newEleveErrors, setNewEleveErrors] = useState<Record<string, string>>(
    {}
  );

  const createMutation = useCreateInscription();
  const inscrireEtPayerMutation = useInscrireEtPayer();
  const createEleveMutation = useCreateEleve();

  // ══════════════════════════════════════════
  // LOOKUPS
  // ══════════════════════════════════════════

  const {
    data: elevesData,
    isLoading: elevesLoading,
    refetch: refetchEleves,
  } = useEleves({ limit: 500, sortBy: 'nom', sortOrder: 'asc' });
  const eleves = useMemo(() => {
    if (!elevesData) return [];
    const any = elevesData as any;
    if (Array.isArray(any.eleves)) return any.eleves as Eleve[];
    if (Array.isArray(any.data)) return any.data as Eleve[];
    return [];
  }, [elevesData]);

  const { data: classesData, isLoading: classesLoading } = useClasses({
    limit: 200,
  });
  const classes = useMemo(() => {
    if (!classesData) return [];
    const any = classesData as any;
    if (Array.isArray(any.classes)) return any.classes;
    if (Array.isArray(any.data)) return any.data;
    return [];
  }, [classesData]);

  const { data: anneesData } = useAnneesScolaires({ limit: 50 });
  const annees: AnneeScolaire[] = useMemo(() => {
    if (!anneesData) return [];
    const any = anneesData as any;
    if (Array.isArray(any.annees)) return any.annees;
    if (Array.isArray(any.data)) return any.data;
    return [];
  }, [anneesData]);

  // ─── Classes filtrées ───
  const filteredClasses = useMemo(() => {
    const q = searchClasse.trim().toLowerCase();
    if (!q) return classes.slice(0, 50);
    return classes
      .filter((c: any) => {
        const hay = `${c.nom} ${c.code}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [classes, searchClasse]);

  const selectedClasse = useMemo(
    () => classes.find((c: any) => c.id === classeId) ?? null,
    [classes, classeId]
  );

  const selectedEleve = useMemo(
    () => eleves.find((e) => e.id === eleveId) ?? null,
    [eleves, eleveId]
  );

  const selectedAnnee = useMemo(
    () => annees.find((a) => a.id === anneeScolaireId) ?? null,
    [annees, anneeScolaireId]
  );

  // ─── Année active par défaut ───
  useEffect(() => {
    if (!anneeScolaireId && annees.length > 0) {
      const active = annees.find((a) => a.estActive);
      if (active) setAnneeScolaireId(active.id);
    }
  }, [annees, anneeScolaireId]);

  // ══════════════════════════════════════════
  // ✅ APERÇU INSCRIPTION (source de vérité pour les places restantes)
  // ══════════════════════════════════════════

  const {
    data: preview,
    isLoading: previewLoading,
    isError: previewError,
    isFetching: previewFetching,
  } = usePreviewInscription({
    eleveId,
    classeId,
    anneeScolaireId,
  });

  const plan = preview?.planScolarite ?? null;
  const resumeFinancier = preview?.resumeFinancier ?? null;
  const fraisInscription = plan?.fraisInscription ?? 0;
  const fraisScolarite = plan?.fraisScolarite ?? 0;
  const montantTotalPlan = plan?.montantTotal ?? 0;
  const dejaInscrit = preview?.dejaInscrit ?? false;

  // ✅ Places restantes calculées par le BACKEND
  const nbInscrits = preview?.classe?.nbInscrits ?? 0;
  const capacite = preview?.classe?.capacite ?? selectedClasse?.capacite ?? null;
  const placesRestantes = preview?.classe?.placesRestantes ?? null;
  const classePleine = preview?.classe?.classePleine ?? false;

  // ══════════════════════════════════════════
  // ✅ ÉLÈVES ÉLIGIBLES = sans inscription active pour cette année
  // ══════════════════════════════════════════
  // On utilise le `dejaInscrit` du preview pour l'élève sélectionné.
  // Pour filtrer la LISTE, on utilise la présence dans une inscription active
  // (via le hook useEleves qui ne contient pas cette info directement,
  // donc on charge toutes les inscriptions actives de l'année à part).

  // Option 1 : ne pas filtrer (laisser l'utilisateur voir tous les élèves).
  // Option 2 : filtrer via un tableau d'IDs déjà inscrits.
  // ⚠️ Ici on filtre via le preview quand un élève est sélectionné,
  // et on affiche un avertissement si déjà inscrit.
  const filteredEleves = useMemo(() => {
    const q = searchEleve.trim().toLowerCase();
    const base = eleves.filter(
      (e) => e.statut !== 'ARCHIVE' && e.statut !== 'SORTI'
    );
    if (!q) return base.slice(0, 50);
    return base
      .filter((e) => {
        const hay = `${e.prenom} ${e.nom} ${e.matricule} ${
          e.email ?? ''
        }`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [eleves, searchEleve]);

  // ══════════════════════════════════════════
  // ✅ ÉCHÉANCES ENRICHIES (frais d'inscription + autres frais + échéances)
  // ══════════════════════════════════════════

  const echeances = useMemo(() => {
    if (!plan) return [];

    const base = plan.echeances ?? [];
    const extra: any[] = [];

    // Frais d'inscription (toujours payable)
    if (fraisInscription > 0) {
      const hasInscriptionEcheance = base.some(
        (e: any) =>
          e.nom?.toLowerCase().includes('inscription') || e.ordre === 0
      );

      if (!hasInscriptionEcheance) {
        const paiementInscription = resumeFinancier?.echeances?.find(
          (e: any) =>
            e.nom?.toLowerCase().includes('inscription') || e.ordre === 0
        );

        extra.push({
          id: '__frais_inscription__',
          nom: "Frais d'inscription",
          ordre: -1,
          montant: fraisInscription,
          dateLimite: new Date().toISOString(),
          paye: paiementInscription?.paye ?? 0,
          restant: paiementInscription?.restant ?? fraisInscription,
          statut: paiementInscription?.statut ?? 'IMPAYEE',
          isFraisInscription: true,
        });
      }
    }

    // Autres frais (toujours payables)
    if (plan.autresFrais && typeof plan.autresFrais === 'object') {
      Object.entries(plan.autresFrais).forEach(([nom, montant], index) => {
        const m = Number(montant);
        if (m > 0) {
          extra.push({
            id: `__autre_frais_${index}__`,
            nom,
            ordre: -2 - index,
            montant: m,
            dateLimite: new Date().toISOString(),
            paye: 0,
            restant: m,
            statut: 'IMPAYEE',
            isAutreFrais: true,
          });
        }
      });
    }

    return [...extra, ...base];
  }, [plan, fraisInscription, resumeFinancier]);

  // ══════════════════════════════════════════
  // TOTAUX PAIEMENT
  // ══════════════════════════════════════════

  const totalAllocations = allocations.reduce((s, a) => s + a.montant, 0);
  const ecart = montantPaiement - totalAllocations;
  const estEquilibre = Math.abs(ecart) <= TOLERANCE;
  const paiementValide =
    !modePaiement ||
    (montantPaiement > 0 && estEquilibre && allocations.length > 0);

  // ══════════════════════════════════════════
  // HANDLERS SÉLECTION
  // ══════════════════════════════════════════

  const handleSelectClasse = (c: any) => {
    setClasseId(c.id);
    setSearchClasse(`${c.nom} (${c.code})`);
    setShowClasseDropdown(false);
    setErrors((x) => ({ ...x, classeId: '' }));
  };

  const handleClearClasse = () => {
    setClasseId('');
    setSearchClasse('');
  };

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

  // ══════════════════════════════════════════
  // ALLOCATIONS
  // ══════════════════════════════════════════

  const addAllocation = (echeanceId: string) => {
    const ech = echeances.find((e: any) => e.id === echeanceId);
    if (!ech) return;
    if (allocations.some((a) => a.echeanceId === echeanceId)) return;

    const restant = (ech.montant ?? 0) - (ech.paye ?? 0);
    const nouvelles = [
      ...allocations,
      { echeanceId, montant: Math.max(0, restant) },
    ];
    setAllocations(nouvelles);
    setMontantPaiement(nouvelles.reduce((s, a) => s + a.montant, 0));
  };

  const removeAllocation = (echeanceId: string) => {
    const nouvelles = allocations.filter((a) => a.echeanceId !== echeanceId);
    setAllocations(nouvelles);
    setMontantPaiement(nouvelles.reduce((s, a) => s + a.montant, 0));
  };

  const updateAllocationMontant = (echeanceId: string, m: number) => {
    const ech = echeances.find((e: any) => e.id === echeanceId);
    if (!ech) return;
    const restant = (ech.montant ?? 0) - (ech.paye ?? 0);
    const clamped = Math.min(Math.max(0, m), Math.max(0, restant));
    const nouvelles = allocations.map((a) =>
      a.echeanceId === echeanceId ? { ...a, montant: clamped } : a
    );
    setAllocations(nouvelles);
    setMontantPaiement(nouvelles.reduce((s, a) => s + a.montant, 0));
  };

  const handleMontantChange = (newMontant: number) => {
    const cible = Math.max(0, newMontant);
    if (allocations.length === 0) {
      setMontantPaiement(cible);
      return;
    }
    const totalActuel = allocations.reduce((s, a) => s + a.montant, 0);
    const delta = cible - totalActuel;
    if (Math.abs(delta) <= TOLERANCE) {
      setMontantPaiement(cible);
      return;
    }
    const nouvelles = allocations.map((a) => ({ ...a }));
    if (delta > 0) {
      let reste = delta;
      for (let i = 0; i < nouvelles.length && reste > TOLERANCE; i++) {
        const ech = echeances.find(
          (e: any) => e.id === nouvelles[i].echeanceId
        );
        if (!ech) continue;
        const restantDu = Math.max(
          0,
          (ech.montant ?? 0) - (ech.paye ?? 0) - nouvelles[i].montant
        );
        const ajout = Math.min(restantDu, reste);
        nouvelles[i].montant += ajout;
        reste -= ajout;
      }
      setAllocations(nouvelles);
      setMontantPaiement(nouvelles.reduce((s, a) => s + a.montant, 0));
    } else {
      let reste = -delta;
      for (let i = nouvelles.length - 1; i >= 0 && reste > TOLERANCE; i--) {
        const retrait = Math.min(nouvelles[i].montant, reste);
        nouvelles[i].montant -= retrait;
        reste -= retrait;
      }
      const filtrees = nouvelles.filter((a) => a.montant > TOLERANCE);
      setAllocations(filtrees);
      setMontantPaiement(filtrees.reduce((s, a) => s + a.montant, 0));
    }
  };

  // ══════════════════════════════════════════
  // VALIDATION
  // ══════════════════════════════════════════

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!eleveId) errs.eleveId = 'Sélectionnez un élève';
    if (!classeId) errs.classeId = 'Sélectionnez une classe';
    if (!anneeScolaireId) errs.anneeScolaireId = 'Sélectionnez une année';
    if (classePleine) errs.classeId = 'La classe est pleine';
    if (dejaInscrit) {
      errs.eleveId = 'Cet élève est déjà inscrit pour cette année scolaire';
    }
    if (modePaiement) {
      if (montantPaiement <= 0)
        errs.montant = 'Montant de paiement invalide';
      if (!estEquilibre)
        errs.allocations = `Le total alloué (${formatMoney(
          totalAllocations
        )}) ne correspond pas au montant (${formatMoney(montantPaiement)})`;
      if (allocations.length === 0)
        errs.allocations = 'Sélectionnez au moins une échéance';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ══════════════════════════════════════════
  // SUBMIT
  // ══════════════════════════════════════════

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.warning('Formulaire incomplet');
      return;
    }

    try {
      if (modePaiement) {
        const result = await inscrireEtPayerMutation.mutateAsync({
          eleveId,
          classeId,
          anneeScolaireId,
          dateInscription: new Date(dateInscription).toISOString(),
          montantPaiement,
          moyen,
          referenceMoyen: referenceMoyen.trim() || null,
          notes: notes.trim() || null,
          allocations,
        });

        toast.success(
          `Inscription + paiement : ${formatMoney(
            result.paiement?.montant ?? 0
          )}`
        );
        navigate(`/dashboard/inscriptions/${result.inscription.id}`);
      } else {
        await createMutation.mutateAsync({
          eleveId,
          classeId,
          anneeScolaireId,
          dateInscription: new Date(dateInscription).toISOString(),
          estActive: true,
        });
        navigate('/dashboard/eleves/inscriptions');
      }
    } catch {
      /* toasté */
    }
  };

  // ══════════════════════════════════════════
  // CRÉATION RAPIDE ÉLÈVE
  // ══════════════════════════════════════════

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

      const createdEleve: Eleve | undefined = (res as any)?.data ?? res;
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
      /* toasté */
    }
  };

  const isPending =
    createMutation.isPending || inscrireEtPayerMutation.isPending;

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/eleves/inscriptions"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AcademicCapIcon className="w-7 h-7 text-emerald-600" />
            Nouvelle inscription
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Inscrire un élève et éventuellement encaisser les frais
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══════════ COLONNE FORMULAIRE ═══════════ */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
        >
          {/* ═══ Année ═══ */}
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
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ${
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

          {/* ═══ Classe ═══ */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Classe <span className="text-red-500">*</span>
              </label>
              <Link
                to="/dashboard/plans-scolarite/nouveau"
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Créer un plan
              </Link>
            </div>

            {!selectedClasse ? (
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rechercher une classe (nom, code)…"
                  value={searchClasse}
                  onChange={(e) => {
                    setSearchClasse(e.target.value);
                    setShowClasseDropdown(true);
                  }}
                  onFocus={() => setShowClasseDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowClasseDropdown(false), 150)
                  }
                  disabled={classesLoading || !anneeScolaireId}
                  className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                    errors.classeId
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                />
                {classesLoading && (
                  <ArrowPathIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}

                {showClasseDropdown && anneeScolaireId && !classesLoading && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    {filteredClasses.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        {searchClasse.trim()
                          ? 'Aucune classe ne correspond'
                          : 'Aucune classe disponible'}
                      </div>
                    ) : (
                      filteredClasses.map((c: any) => (
                        <button
                          key={c.id}
                          type="button"
                          onMouseDown={(ev) => {
                            ev.preventDefault();
                            handleSelectClasse(c);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 flex items-center gap-3 border-b last:border-b-0"
                        >
                          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                            <AcademicCapIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {c.nom}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {c.code}
                              {c.capacite != null && (
                                <> — {c.capacite} places</>
                              )}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                  <AcademicCapIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {selectedClasse.nom}
                  </p>
                  <p className="text-xs text-gray-600">
                    {selectedClasse.code}
                    {selectedClasse.capacite != null && (
                      <> — {selectedClasse.capacite} places</>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearClasse}
                  className="p-1.5 text-gray-500 hover:bg-white rounded-lg"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {errors.classeId && (
              <p className="text-xs text-red-600 mt-1.5">{errors.classeId}</p>
            )}

            {/* ✅ Places restantes (depuis le BACKEND) */}
            {selectedClasse && capacite != null && anneeScolaireId && (
              <div
                className={`mt-2 p-3 rounded-lg flex items-start gap-2 border ${
                  classePleine
                    ? 'bg-red-50 border-red-200'
                    : placesRestantes != null && placesRestantes <= 3
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                {previewFetching || previewLoading ? (
                  <ArrowPathIcon className="w-4 h-4 text-gray-500 mt-0.5 shrink-0 animate-spin" />
                ) : classePleine ? (
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
                    {previewFetching || previewLoading
                      ? 'Calcul en cours…'
                      : classePleine
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
                    {previewFetching || previewLoading
                      ? 'Chargement…'
                      : `${nbInscrits} / ${capacite} inscrit(s) pour cette année`}
                  </p>
                </div>
              </div>
            )}

            {/* Alerte plan manquant */}
            {selectedClasse &&
              anneeScolaireId &&
              !previewLoading &&
              preview &&
              !plan && (
                <div className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1 text-xs text-amber-800">
                    <p className="font-semibold">
                      Aucun plan de scolarité actif pour cette classe
                    </p>
                    <p className="mt-0.5">
                      L'élève sera inscrit sans paiement associé.
                    </p>
                    <Link
                      to="/dashboard/plans-scolarite/nouveau"
                      className="inline-flex items-center gap-1 mt-1 text-emerald-600 hover:underline font-medium"
                    >
                      <PlusIcon className="w-3 h-3" />
                      Créer un plan maintenant
                    </Link>
                  </div>
                </div>
              )}
          </div>

          {/* ═══ Élève ═══ */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Élève <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCreateEleve(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
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
                  placeholder="Rechercher un élève…"
                  value={searchEleve}
                  onChange={(e) => {
                    setSearchEleve(e.target.value);
                    setShowEleveDropdown(true);
                  }}
                  onFocus={() => setShowEleveDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowEleveDropdown(false), 150)
                  }
                  className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ${
                    errors.eleveId
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                />
                {elevesLoading && (
                  <ArrowPathIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}

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
                              className="block mx-auto mt-2 text-emerald-600 font-medium hover:underline text-xs"
                            >
                              + Créer cet élève
                            </button>
                          </>
                        ) : (
                          'Aucun élève disponible'
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50 sticky top-0">
                          {filteredEleves.length} élève(s) affiché(s)
                          {eleves.length > filteredEleves.length &&
                            ` sur ${eleves.length}`}
                        </div>
                        {filteredEleves.map((e) => (
                          <button
                            key={e.id}
                            type="button"
                            onMouseDown={(ev) => {
                              ev.preventDefault();
                              handleSelectEleve(e);
                            }}
                            className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 flex items-center gap-3 border-b last:border-b-0"
                          >
                            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm shrink-0">
                              {e.prenom[0]}
                              {e.nom[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {e.prenom} {e.nom}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {e.matricule}
                                {e.email && <> — {e.email}</>}
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
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
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
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {errors.eleveId && (
              <p className="text-xs text-red-600 mt-1.5">{errors.eleveId}</p>
            )}

            {/* ✅ Alerte si déjà inscrit (via preview) */}
            {selectedEleve && dejaInscrit && (
              <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1 text-xs text-red-800">
                  <p className="font-semibold">Élève déjà inscrit</p>
                  <p className="mt-0.5">
                    Cet élève a déjà une inscription active pour cette année
                    scolaire. Choisissez une autre classe ou une autre année.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ═══ Date ═══ */}
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
                max={toDateInput(new Date())}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* ═══ MODE PAIEMENT ═══ */}
          {plan && !dejaInscrit && (
            <div className="border-t border-gray-100 pt-5">
              <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={modePaiement}
                  onChange={(e) => setModePaiement(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <BanknotesIcon className="w-4 h-4 text-emerald-600" />
                    Encaisser un paiement maintenant
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Réglez les frais d'inscription, autres frais et/ou les
                    échéances immédiatement.
                  </p>
                </div>
              </label>

              <AnimatePresence>
                {modePaiement && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-4">
                      {/* Montant + moyen */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Montant à encaisser{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              min={0}
                              step="1"
                              value={montantPaiement || ''}
                              onChange={(e) =>
                                handleMontantChange(Number(e.target.value))
                              }
                              placeholder="0"
                              className={`w-full pl-10 pr-20 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ${
                                errors.montant
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-gray-200'
                              }`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                              F CFA
                            </span>
                          </div>
                          {errors.montant && (
                            <p className="text-xs text-red-600 mt-1">
                              {errors.montant}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Moyen de paiement
                          </label>
                          <select
                            value={moyen}
                            onChange={(e) =>
                              setMoyen(e.target.value as MoyenPaiement)
                            }
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            {MOYENS.map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Référence moyen */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Référence du moyen (optionnel)
                        </label>
                        <input
                          type="text"
                          value={referenceMoyen}
                          onChange={(e) => setReferenceMoyen(e.target.value)}
                          placeholder="Ex: N° de transaction…"
                          maxLength={100}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      {/* Échéances */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <ReceiptPercentIcon className="w-4 h-4 text-indigo-500" />
                            Échéances à régler
                          </h3>
                          <Link
                            to="/dashboard/echeances/nouveau"
                            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
                          >
                            <PlusIcon className="w-3 h-3" />
                            Gérer les échéances
                          </Link>
                        </div>

                        {echeances.length === 0 ? (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-800">
                              Aucune échéance définie pour ce plan.{' '}
                              <Link
                                to="/dashboard/echeances/nouveau"
                                className="text-emerald-600 hover:underline font-medium"
                              >
                                Créer une échéance →
                              </Link>
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {echeances.map((e: any) => {
                              const isAllocated = allocations.some(
                                (a) => a.echeanceId === e.id
                              );
                              const alloc = allocations.find(
                                (a) => a.echeanceId === e.id
                              );
                              const restant =
                                (e.montant ?? 0) - (e.paye ?? 0);

                              return (
                                <div
                                  key={e.id}
                                  className={`p-3 rounded-lg border ${
                                    isAllocated
                                      ? 'bg-emerald-50 border-emerald-200'
                                      : e.isFraisInscription
                                      ? 'bg-amber-50 border-amber-200'
                                      : e.isAutreFrais
                                      ? 'bg-purple-50 border-purple-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={isAllocated}
                                      onChange={(ev) => {
                                        if (ev.target.checked)
                                          addAllocation(e.id);
                                        else removeAllocation(e.id);
                                      }}
                                      className="w-4 h-4 rounded"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-medium text-gray-900">
                                          {e.nom}
                                        </p>
                                        {e.isFraisInscription && (
                                          <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                            Inscription
                                          </span>
                                        )}
                                        {e.isAutreFrais && (
                                          <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                                            Autre frais
                                          </span>
                                        )}
                                        {e.ordre === 0 &&
                                          !e.isFraisInscription && (
                                            <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                              Inscription
                                            </span>
                                          )}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        Limite :{' '}
                                        {formatDateStr(e.dateLimite)}
                                        {' — '}
                                        Total : {formatMoney(e.montant)}
                                        {e.paye > 0 && (
                                          <>
                                            {' '}
                                            (payé {formatMoney(e.paye)})
                                          </>
                                        )}
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-xs text-gray-500">
                                        Restant
                                      </p>
                                      <p className="text-sm font-bold text-red-600">
                                        {formatMoney(Math.max(0, restant))}
                                      </p>
                                    </div>
                                  </div>
                                  {isAllocated && alloc && (
                                    <div className="mt-2 pl-7">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          min={0}
                                          step="1"
                                          max={restant}
                                          value={alloc.montant}
                                          onChange={(ev) =>
                                            updateAllocationMontant(
                                              e.id,
                                              Number(ev.target.value)
                                            )
                                          }
                                          className="w-32 px-2 py-1 text-sm bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                        <span className="text-xs text-gray-500">
                                          F CFA alloués
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {errors.allocations && (
                          <p className="text-xs text-red-600 mt-1.5">
                            {errors.allocations}
                          </p>
                        )}
                      </div>

                      {/* Résumé */}
                      {allocations.length > 0 && (
                        <div
                          className={`p-3 rounded-lg flex items-start gap-2 border ${
                            estEquilibre
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          {estEquilibre ? (
                            <CheckCircleIcon className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          ) : (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-gray-500">Montant payé</p>
                                <p className="font-bold text-gray-900 text-sm">
                                  {formatMoney(montantPaiement)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Total alloué</p>
                                <p
                                  className={`font-bold text-sm ${
                                    estEquilibre
                                      ? 'text-emerald-700'
                                      : 'text-red-700'
                                  }`}
                                >
                                  {formatMoney(totalAllocations)}
                                </p>
                              </div>
                            </div>
                            {estEquilibre ? (
                              <p className="text-emerald-700 font-medium pt-1 mt-1 border-t border-emerald-200">
                                ✅ Montant entièrement alloué
                              </p>
                            ) : (
                              <p className="text-red-700 font-medium pt-1 mt-1 border-t border-red-200">
                                ⚠️ Écart de {formatMoney(Math.abs(ecart))}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Notes (optionnel)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          maxLength={500}
                          placeholder="Informations complémentaires…"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              to="/dashboard/eleves/inscriptions"
              className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={
                isPending ||
                classePleine ||
                dejaInscrit ||
                !eleveId ||
                !classeId ||
                !anneeScolaireId ||
                (modePaiement && !paiementValide)
              }
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  {modePaiement ? 'Inscription + paiement…' : 'Création…'}
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  {modePaiement
                    ? 'Inscrire et encaisser'
                    : "Créer l'inscription"}
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* ═══════════ COLONNE RÉCAP LATÉRALE ═══════════ */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-5 text-white sticky top-4"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-90 mb-3 flex items-center gap-1.5">
              <ChartBarIcon className="w-4 h-4" />
              Récapitulatif
            </h3>

            {!selectedEleve || !selectedClasse ? (
              <p className="text-sm text-white/70 italic">
                Sélectionnez un élève et une classe pour voir le récapitulatif…
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <UserCircleIcon className="w-4 h-4 mt-0.5 shrink-0 opacity-80" />
                  <div className="min-w-0">
                    <p className="text-xs opacity-70">Élève</p>
                    <p className="font-semibold truncate">
                      {selectedEleve.prenom} {selectedEleve.nom}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <AcademicCapIcon className="w-4 h-4 mt-0.5 shrink-0 opacity-80" />
                  <div className="min-w-0">
                    <p className="text-xs opacity-70">Classe</p>
                    <p className="font-semibold truncate">
                      {selectedClasse.nom}
                      {selectedAnnee && (
                        <span className="text-xs opacity-80">
                          {' '}
                          — {selectedAnnee.nom}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {previewLoading ? (
                  <div className="flex items-center gap-2 text-white/70 text-xs py-2">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Chargement du plan…
                  </div>
                ) : previewError ? (
                  <div className="text-xs text-red-200">
                    Erreur de chargement du plan
                  </div>
                ) : plan ? (
                  <>
                    <div className="pt-3 border-t border-white/20 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="opacity-80">Frais d'inscription</span>
                        <span className="font-semibold">
                          {formatMoney(fraisInscription)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="opacity-80">Frais de scolarité</span>
                        <span className="font-semibold">
                          {formatMoney(fraisScolarite)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-white/20">
                        <span className="font-medium">Total plan</span>
                        <span className="font-bold text-lg">
                          {formatMoney(montantTotalPlan)}
                        </span>
                      </div>
                    </div>

                    {resumeFinancier && (
                      <div className="pt-3 border-t border-white/20 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="opacity-80">Déjà payé</span>
                          <span className="font-semibold text-emerald-200">
                            {formatMoney(resumeFinancier.totalPaye)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-80">Restant</span>
                          <span className="font-semibold text-amber-200">
                            {formatMoney(resumeFinancier.restant)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="opacity-80">Taux</span>
                          <div className="flex items-center gap-2 flex-1 ml-3">
                            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-400 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    resumeFinancier.tauxPaiement
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="font-bold text-white text-xs shrink-0">
                              {resumeFinancier.tauxPaiement}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {modePaiement && montantPaiement > 0 && (
                      <div className="pt-3 border-t border-white/20">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">💵 À encaisser</span>
                          <span className="font-bold text-lg">
                            {formatMoney(montantPaiement)}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="pt-3 border-t border-white/20 text-xs text-amber-200">
                    ⚠️ Aucun plan de scolarité pour cette classe
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Aide */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Aide
            </h4>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold shrink-0">•</span>
                <span>
                  L'année scolaire <strong>active</strong> est pré-sélectionnée.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold shrink-0">•</span>
                <span>
                  Les places restantes sont calculées par le serveur.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold shrink-0">•</span>
                <span>
                  Les <strong>frais d'inscription</strong> et autres frais
                  sont directement payables.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold shrink-0">•</span>
                <span>
                  Cochez <strong>"Encaisser un paiement"</strong> pour régler
                  immédiatement.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ═══════════ MODAL CRÉATION RAPIDE ÉLÈVE ═══════════ */}
      {showCreateEleve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-emerald-600" />
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
                      onClick={() => setNewEleve((f) => ({ ...f, sexe: s }))}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium ${
                        newEleve.sexe === s
                          ? 'bg-emerald-600 text-white'
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
                  max={toDateInput(new Date())}
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
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-60"
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