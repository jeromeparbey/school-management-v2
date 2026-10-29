// frontend2/src/pages/dashboard/directeur/paiements/PaiementNouveauPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ReceiptPercentIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useCreatePaiement } from '../../../../hooks/usePaiements';
import { useEleves } from '../../../../hooks/useEleves';
import { useClasses } from '../../../../hooks/useClasses';
import { useEcheancesByPlan } from '../../../../hooks/useEcheance';
import { useGenererRecu, useDownloadRecuPDF } from '../../../../hooks/useRecus';
import { useToast } from '../../../../context/ToastContext';
import type { Eleve } from '../../../../types/eleve.types';
import type {
  CreatePaiementPayload,
  MoyenPaiement,
  AllocationInput,
} from '../../../../types/paiement.types';

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const MOYENS: { value: MoyenPaiement; label: string }[] = [
  { value: 'ESPECES', label: 'Espèces' },
  { value: 'VIREMENT', label: 'Virement bancaire' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'CARTE', label: 'Carte bancaire' },
  { value: 'CHEQUE', label: 'Chèque' },
  { value: 'AUTRE', label: 'Autre' },
];

/** 💰 Formate en F CFA (jamais XOF) */
const formatMoney = (n: number | null | undefined) => {
  if (n == null) return '0 F CFA';
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' F CFA';
};

const formatDate = (d: string | null | undefined) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const joursRestants = (dateLimite: string): number => {
  const diff = new Date(dateLimite).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

const TOLERANCE = 0.01;

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

const PaiementNouveauPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const eleveIdFromQuery = searchParams.get('eleveId') ?? '';
  const classeIdFromQuery = searchParams.get('classeId') ?? '';
  const autoPrint = searchParams.get('autoPrint') === '1';

  // ─────────── Filtre classe ───────────
  const [classeId, setClasseId] = useState(classeIdFromQuery);
  const [searchClasse, setSearchClasse] = useState('');
  const [showClasseDropdown, setShowClasseDropdown] = useState(false);

  // ─────────── Élève ───────────
  const [eleveId, setEleveId] = useState(eleveIdFromQuery);
  const [searchEleve, setSearchEleve] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // ─────────── Champs paiement ───────────
  const [montant, setMontant] = useState<number>(0);
  const [moyen, setMoyen] = useState<MoyenPaiement>('ESPECES');
  const [referenceMoyen, setReferenceMoyen] = useState('');
  const [datePaiement, setDatePaiement] = useState(toDateInput(new Date()));
  const [notes, setNotes] = useState('');
  const [allocations, setAllocations] = useState<AllocationInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🆕 Option : masquer les tranches en retard
  const [hideRetards, setHideRetards] = useState(false);

  const createMutation = useCreatePaiement();
  const genererRecu = useGenererRecu();
  const downloadPDF = useDownloadRecuPDF();

  // ─────────── Classes ───────────
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

  // ─────────── Élèves ───────────
  const { data: elevesData } = useEleves({
    limit: 200,
    sortBy: 'nom',
    sortOrder: 'asc',
    ...(classeId && { classeId }),
  });

  const elevesInscrits: Eleve[] = useMemo(() => {
    if (!elevesData) return [];
    const any = elevesData as any;
    const list: Eleve[] = Array.isArray(any.eleves)
      ? any.eleves
      : Array.isArray(any.data)
      ? any.data
      : [];

    return list.filter((e) => {
      const activeIns = e.inscriptions?.filter((i) => i.estActive) ?? [];
      if (activeIns.length === 0) return false;
      if (classeId) {
        return activeIns.some((i) => i.classeId === classeId);
      }
      return true;
    });
  }, [elevesData, classeId]);

  const filteredEleves = useMemo(() => {
    const q = searchEleve.trim().toLowerCase();
    if (!q) return elevesInscrits.slice(0, 50);
    return elevesInscrits
      .filter((e) => {
        const hay = `${e.prenom} ${e.nom} ${e.matricule}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [elevesInscrits, searchEleve]);

  const selectedEleve = useMemo(
    () => elevesInscrits.find((e) => e.id === eleveId) ?? null,
    [elevesInscrits, eleveId]
  );

  // ─────────── Assignment actif ───────────
  const activeAssignment = useMemo(() => {
    if (!selectedEleve) return null;
    const any = selectedEleve as any;
    const list = any.assignmentsScolarite ?? any.assignments ?? [];
    return list.find((a: any) => a.statut === 'ACTIF') ?? null;
  }, [selectedEleve]);

  const planScolariteId = activeAssignment?.planScolariteId ?? null;

  // ─────────── Échéances ───────────
  const { data: echeancesData, isLoading: echeancesLoading } =
    useEcheancesByPlan(planScolariteId ?? undefined);

  const echeances: any[] = useMemo(() => {
    if (!echeancesData) return [];
    const any = echeancesData as any;
    if (Array.isArray(any?.data?.echeances)) return any.data.echeances;
    if (Array.isArray(any?.echeances)) return any.echeances;
    if (Array.isArray(any?.data)) return any.data;
    return [];
  }, [echeancesData]);

  /**
   * Enrichit les échéances avec montantPaye / montantRestant / retards.
   */
  const echeancesAvecEtat = useMemo(() => {
    return echeances.map((e: any) => {
      const allocationsExistantes = Array.isArray(e.allocationsPaiement)
        ? e.allocationsPaiement
        : Array.isArray(e.allocations)
        ? e.allocations
        : [];

      const montantPaye = allocationsExistantes
        .filter((a: any) => !a.paiement || a.paiement.statut === 'COMPLET')
        .reduce((s: number, a: any) => s + (a.montant ?? 0), 0);

      const montantRestant = Math.max(0, (e.montant ?? 0) - montantPaye);
      const estPayeeCompletement = montantRestant <= TOLERANCE;
      const estPartielle = montantPaye > TOLERANCE && montantRestant > TOLERANCE;

      const jours = joursRestants(e.dateLimite);
      const estEnRetard = !estPayeeCompletement && jours < 0;

      return {
        ...e,
        montantPaye,
        montantRestant,
        estPayeeCompletement,
        estPartielle,
        estEnRetard,
        joursRetard: estEnRetard ? Math.abs(jours) : 0,
        joursRestants: jours,
      };
    });
  }, [echeances]);

  const echeancesImpayees = useMemo(
    () =>
      echeancesAvecEtat.filter(
        (e: any) => !e.estPayeeCompletement && e.montantRestant > TOLERANCE
      ),
    [echeancesAvecEtat]
  );

  const echeancesAffichees = useMemo(() => {
    if (hideRetards) {
      return echeancesImpayees.filter((e: any) => !e.estEnRetard);
    }
    return echeancesImpayees;
  }, [echeancesImpayees, hideRetards]);

  // ─────────── Auto-sélection via query ───────────
  useEffect(() => {
    if (classeIdFromQuery && !classeId) setClasseId(classeIdFromQuery);
  }, [classeIdFromQuery, classeId]);

  useEffect(() => {
    if (eleveIdFromQuery && !eleveId) setEleveId(eleveIdFromQuery);
  }, [eleveIdFromQuery, eleveId]);

  // ─────────── Handlers classe ───────────
  const handleSelectClasse = (c: any) => {
    setClasseId(c.id);
    setSearchClasse(`${c.nom} (${c.code})`);
    setShowClasseDropdown(false);
    setEleveId('');
    setSearchEleve('');
    setAllocations([]);
    setMontant(0);
    setErrors((x) => ({ ...x, eleveId: '', classeId: '' }));
  };

  const handleClearClasse = () => {
    setClasseId('');
    setSearchClasse('');
    setEleveId('');
    setSearchEleve('');
    setAllocations([]);
    setMontant(0);
  };

  // ─────────── Handlers élève ───────────
  const handleSelectEleve = (e: Eleve) => {
    setEleveId(e.id);
    setSearchEleve(`${e.prenom} ${e.nom}`);
    setShowDropdown(false);
    setErrors((x) => ({ ...x, eleveId: '' }));
    setAllocations([]);
    setMontant(0);
  };

  const handleClearEleve = () => {
    setEleveId('');
    setSearchEleve('');
    setAllocations([]);
    setMontant(0);
  };

  // ══════════════════════════════════════════════════════════
  // 🆕 SYNCHRONISATION BIDIRECTIONNELLE montant ⟷ allocations
  // ══════════════════════════════════════════════════════════

  /**
   * Coche une échéance :
   *  → elle prend son restant dû COMPLET
   *  → montant = somme des allocations (recalculé)
   */
  const addAllocation = (echeanceId: string) => {
    const echeance = echeancesImpayees.find((e: any) => e.id === echeanceId);
    if (!echeance) return;
    if (allocations.some((a) => a.echeanceId === echeanceId)) return;

    const nouvelles = [
      ...allocations,
      { echeanceId, montant: echeance.montantRestant },
    ];

    setAllocations(nouvelles);
    // 🆕 Synchronisation : montant = total des allocations
    setMontant(nouvelles.reduce((s, a) => s + a.montant, 0));
    setErrors((x) => ({ ...x, montant: '', allocations: '' }));
  };

  /**
   * Décoche une échéance :
   *  → retirée des allocations
   *  → montant = somme des allocations restantes
   */
  const removeAllocation = (echeanceId: string) => {
    const nouvelles = allocations.filter((a) => a.echeanceId !== echeanceId);
    setAllocations(nouvelles);
    // 🆕 Synchronisation
    setMontant(nouvelles.reduce((s, a) => s + a.montant, 0));
    setErrors((x) => ({ ...x, montant: '', allocations: '' }));
  };

  /**
   * L'utilisateur modifie une allocation :
   *  → clampée sur le restant dû de l'échéance
   *  → montant = somme des allocations
   */
  const updateAllocationMontant = (
    echeanceId: string,
    newMontant: number
  ) => {
    const echeance = echeancesImpayees.find((e: any) => e.id === echeanceId);
    if (!echeance) return;

    const clamped = Math.min(
      Math.max(0, newMontant),
      echeance.montantRestant
    );

    const nouvelles = allocations.map((a) =>
      a.echeanceId === echeanceId ? { ...a, montant: clamped } : a
    );
    setAllocations(nouvelles);
    // 🆕 Synchronisation
    setMontant(nouvelles.reduce((s, a) => s + a.montant, 0));
    setErrors((x) => ({ ...x, montant: '', allocations: '' }));
  };

  /**
   * 🆕 L'utilisateur modifie le montant total :
   *  → si augmentation : répartir le surplus sur les échéances cochées
   *    (jusqu'à leur restant dû)
   *  → si diminution : réduire les allocations (dernières d'abord)
   */
  const handleMontantChange = (newMontant: number) => {
    const montantCible = Math.max(0, newMontant);

    if (allocations.length === 0) {
      setMontant(montantCible);
      setErrors((x) => ({ ...x, montant: '', allocations: '' }));
      return;
    }

    const totalActuel = allocations.reduce((s, a) => s + a.montant, 0);
    const delta = montantCible - totalActuel;

    // Pas de changement significatif
    if (Math.abs(delta) <= TOLERANCE) {
      setMontant(montantCible);
      return;
    }

    const nouvelles = allocations.map((a) => ({ ...a }));

    // ── Cas 1 : AUGMENTER (delta > 0) ──
    if (delta > 0) {
      let resteARepartir = delta;
      for (let i = 0; i < nouvelles.length && resteARepartir > TOLERANCE; i++) {
        const ech = echeancesImpayees.find(
          (e: any) => e.id === nouvelles[i].echeanceId
        );
        if (!ech) continue;
        const restantDu = Math.max(
          0,
          ech.montantRestant - nouvelles[i].montant
        );
        const ajout = Math.min(restantDu, resteARepartir);
        nouvelles[i].montant += ajout;
        resteARepartir -= ajout;
      }

      setAllocations(nouvelles);
      const nouveauTotal = nouvelles.reduce((s, a) => s + a.montant, 0);
      setMontant(nouveauTotal);

      // Si on n'a pas pu tout répartir → warning
      if (resteARepartir > TOLERANCE) {
        toast.warning(
          'Montant non réparti',
          `${formatMoney(
            resteARepartir
          )} n'ont pas pu être alloués (plafond des échéances atteint). Cochez d'autres échéances.`
        );
      }
      return;
    }

    // ── Cas 2 : RÉDUIRE (delta < 0) ──
    let resteARetirer = -delta;
    for (let i = nouvelles.length - 1; i >= 0 && resteARetirer > TOLERANCE; i--) {
      const retrait = Math.min(nouvelles[i].montant, resteARetirer);
      nouvelles[i].montant -= retrait;
      resteARetirer -= retrait;
    }

    // Retirer les allocations tombées à 0
    const filtrees = nouvelles.filter((a) => a.montant > TOLERANCE);
    setAllocations(filtrees);
    const nouveauTotal = filtrees.reduce((s, a) => s + a.montant, 0);
    setMontant(nouveauTotal);
    setErrors((x) => ({ ...x, montant: '', allocations: '' }));
  };

  // ─────────── Totaux & équilibre ───────────
  const totalAllocations = allocations.reduce((s, a) => s + a.montant, 0);
  const ecart = montant - totalAllocations;
  const estEquilibre = Math.abs(ecart) <= TOLERANCE;
  const allocationsValides = estEquilibre && allocations.length > 0;

  // ─────────── Validation ───────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!classeId) errs.classeId = 'Sélectionnez une classe';
    if (!eleveId) errs.eleveId = 'Sélectionnez un élève';
    if (!montant || montant <= 0) errs.montant = 'Montant invalide';
    if (!activeAssignment) {
      errs.eleveId =
        "Cet élève n'a pas d'assignement de scolarité actif. Vérifiez son inscription.";
    }
    if (!estEquilibre) {
      errs.allocations = `Le total alloué (${formatMoney(
        totalAllocations
      )}) ne correspond pas au montant du paiement (${formatMoney(montant)})`;
    }
    for (const alloc of allocations) {
      const ech = echeancesImpayees.find((e: any) => e.id === alloc.echeanceId);
      if (ech && alloc.montant > ech.montantRestant + TOLERANCE) {
        errs.allocations = `L'allocation sur "${ech.nom}" dépasse le restant dû`;
        break;
      }
      if (alloc.montant <= 0) {
        errs.allocations = `Le montant alloué sur "${ech?.nom ?? '—'}" doit être supérieur à 0`;
        break;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─────────── Submit ───────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.warning('Formulaire incomplet');
      return;
    }

    const payload: CreatePaiementPayload = {
      eleveId,
      montant,
      moyen,
      referenceMoyen: referenceMoyen.trim() || null,
      notes: notes.trim() || null,
      datePaiement: new Date(datePaiement).toISOString(),
      assignmentId: activeAssignment?.id ?? null,
      ...(allocations.length > 0 && { allocations }),
    };

    try {
      const res = await createMutation.mutateAsync(payload);
      const paiement = (res as any)?.data ?? res;
      const paiementId = paiement?.id;

      if (!paiementId) {
        navigate('/dashboard/paiements');
        return;
      }

      try {
        const recuRes = await genererRecu.mutateAsync({ paiementId });
        const recu = (recuRes as any)?.data ?? recuRes;
        const recuId = recu?.id;
        const numeroRecu = recu?.numeroRecu;

        if (!recuId) {
          navigate(`/dashboard/paiements/${paiementId}`);
          return;
        }

        if (autoPrint && numeroRecu) {
          downloadPDF.mutate({ id: recuId, numeroRecu, format: 'A4' });
        }

        toast.success('Paiement enregistré et reçu généré');
        navigate(`/dashboard/recus/${recuId}`);
      } catch {
        toast.warning(
          'Paiement enregistré',
          "Le reçu n'a pas pu être généré automatiquement."
        );
        navigate(`/dashboard/paiements/${paiementId}`);
      }
    } catch {
      /* toasté par le hook */
    }
  };

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/paiements"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BanknotesIcon className="w-7 h-7 text-emerald-600" />
            Nouveau paiement
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Sélectionnez une classe puis un élève inscrit
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* ═══════════ CLASSE ═══════════ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Classe <span className="text-red-500">*</span>
          </label>

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
                disabled={classesLoading}
                className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-60 ${
                  errors.classeId
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />

              {classesLoading && (
                <ArrowPathIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}

              {showClasseDropdown && !classesLoading && (
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
                title="Changer de classe"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {errors.classeId && (
            <p className="text-xs text-red-600 mt-1.5">{errors.classeId}</p>
          )}
          {selectedClasse && !classesLoading && (
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
              <InformationCircleIcon className="w-3.5 h-3.5" />
              {elevesInscrits.length} élève(s) inscrit(s) dans cette classe
            </p>
          )}
        </div>

        {/* ═══════════ ÉLÈVE ═══════════ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Élève inscrit <span className="text-red-500">*</span>
          </label>

          {!selectedEleve ? (
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder={
                  classeId
                    ? 'Rechercher dans cette classe…'
                    : "Sélectionnez d'abord une classe"
                }
                value={searchEleve}
                onChange={(e) => {
                  setSearchEleve(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                disabled={!classeId}
                className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.eleveId
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />

              {showDropdown && classeId && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                  {filteredEleves.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      {searchEleve.trim()
                        ? 'Aucun élève ne correspond'
                        : 'Aucun élève inscrit dans cette classe'}
                    </div>
                  ) : (
                    filteredEleves.map((e) => {
                      const ins = e.inscriptions?.find(
                        (i) => i.estActive && i.classeId === classeId
                      );
                      return (
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
                              {ins?.classe && <> — {ins.classe.nom}</>}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
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
                    {activeAssignment?.planScolarite && (
                      <>
                        {' — '}
                        <span className="font-medium text-emerald-700">
                          {activeAssignment.planScolarite.nom}
                        </span>
                      </>
                    )}
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

              {!activeAssignment && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800">
                    Cet élève n'a pas d'assignement de scolarité actif. Vérifiez
                    son inscription et le plan de scolarité associé.
                  </p>
                </div>
              )}
            </div>
          )}
          {errors.eleveId && (
            <p className="text-xs text-red-600 mt-1.5">{errors.eleveId}</p>
          )}
        </div>

        {/* ═══════════ MONTANT & MOYEN ═══════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Montant <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                min={0}
                step="1"
                value={montant || ''}
                onChange={(e) => handleMontantChange(Number(e.target.value))}
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
              <p className="text-xs text-red-600 mt-1.5">{errors.montant}</p>
            )}
            {/* 🆕 Indicateur de synchronisation */}
            {montant > 0 && allocations.length > 0 && (
              <p
                className={`text-xs mt-1 font-medium flex items-center gap-1 ${
                  estEquilibre ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {estEquilibre ? (
                  <>
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Synchronisé avec le total alloué
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                    Écart de {formatMoney(Math.abs(ecart))}
                  </>
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Moyen de paiement <span className="text-red-500">*</span>
            </label>
            <select
              value={moyen}
              onChange={(e) => setMoyen(e.target.value as MoyenPaiement)}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Référence du moyen (optionnel)
            </label>
            <input
              type="text"
              value={referenceMoyen}
              onChange={(e) => setReferenceMoyen(e.target.value)}
              placeholder="Ex: N° de transaction, chèque…"
              maxLength={100}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date du paiement
            </label>
            <input
              type="date"
              value={datePaiement}
              onChange={(e) => setDatePaiement(e.target.value)}
              max={toDateInput(new Date())}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* ═══════════ ALLOCATIONS ═══════════ */}
        {selectedEleve && activeAssignment && (
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <ReceiptPercentIcon className="w-4 h-4 text-indigo-500" />
                Échéances impayées
              </h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hideRetards}
                    onChange={(e) => setHideRetards(e.target.checked)}
                    className="w-3.5 h-3.5 rounded"
                  />
                  Masquer les tranches en retard
                </label>
                <p className="text-xs text-gray-500">
                  {allocations.length} / {echeancesAffichees.length} sélectionnée(s)
                </p>
              </div>
            </div>

            {echeancesLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Chargement des échéances…
              </div>
            ) : echeancesAffichees.length === 0 ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-800">
                  {hideRetards
                    ? 'Aucune échéance impayée hors retard.'
                    : 'Toutes les échéances sont déjà payées pour cet élève.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {echeancesAffichees.map((e: any) => {
                  const isAllocated = allocations.some(
                    (a) => a.echeanceId === e.id
                  );
                  const alloc = allocations.find(
                    (a) => a.echeanceId === e.id
                  );
                  // 🆕 Nouveau restant après ce paiement
                  const nouveauRestant = alloc
                    ? Math.max(0, e.montantRestant - alloc.montant)
                    : e.montantRestant;

                  return (
                    <div
                      key={e.id}
                      className={`p-3 rounded-lg border ${
                        isAllocated
                          ? 'bg-indigo-50 border-indigo-200'
                          : e.estEnRetard
                          ? 'bg-rose-50/50 border-rose-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isAllocated}
                          onChange={(ev) => {
                            if (ev.target.checked) addAllocation(e.id);
                            else removeAllocation(e.id);
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {e.nom}
                            </p>
                            {e.estPartielle && (
                              <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                Partielle
                              </span>
                            )}
                            {e.estEnRetard && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                                <ClockIcon className="w-3 h-3" />
                                +{e.joursRetard}j
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Limite : {formatDate(e.dateLimite)}
                            {' — '}
                            Restant :{' '}
                            <strong className="text-gray-900">
                              {formatMoney(e.montantRestant)}
                            </strong>
                            {e.montantPaye > 0 && (
                              <>
                                {' '}
                                (déjà payé {formatMoney(e.montantPaye)})
                              </>
                            )}
                          </p>
                          {/* 🆕 Aperçu du nouveau restant */}
                          {isAllocated && alloc && alloc.montant > 0 && (
                            <p className="text-xs text-indigo-700 mt-1 font-medium">
                              → Après ce paiement :{' '}
                              {nouveauRestant <= TOLERANCE ? (
                                <span className="text-emerald-700">
                                  ✓ Soldée
                                </span>
                              ) : (
                                <span>
                                  restera{' '}
                                  <strong>{formatMoney(nouveauRestant)}</strong>
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        {isAllocated && alloc && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              step="1"
                              max={e.montantRestant}
                              value={alloc.montant}
                              onChange={(ev) =>
                                updateAllocationMontant(
                                  e.id,
                                  Number(ev.target.value)
                                )
                              }
                              className="w-24 px-2 py-1 text-sm bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <span className="text-xs text-gray-500">F CFA</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 🆕 Résumé ALLOCATIONS / MONTANT (synchronisés) */}
            {allocations.length > 0 && (
              <div
                className={`mt-3 p-3 rounded-lg flex items-start gap-2 border ${
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
                <div className="flex-1 text-xs space-y-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-500">Montant payé</p>
                      <p className="font-bold text-gray-900 text-sm">
                        {formatMoney(montant)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total alloué</p>
                      <p
                        className={`font-bold text-sm ${
                          estEquilibre ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {formatMoney(totalAllocations)}
                      </p>
                    </div>
                  </div>
                  {estEquilibre ? (
                    <p className="text-emerald-700 font-medium pt-1 border-t border-emerald-200">
                      ✅ Montant entièrement alloué sur les échéances
                    </p>
                  ) : (
                    <p className="text-red-700 font-medium pt-1 border-t border-red-200">
                      ⚠️ Écart de {formatMoney(Math.abs(ecart))} — vérifiez votre
                      saisie
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 🆕 Message si aucune allocation */}
            {allocations.length === 0 && montant > 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-amber-800">
                    Cochez au moins une échéance
                  </p>
                  <p className="text-amber-700 mt-0.5">
                    Le montant de {formatMoney(montant)} doit être réparti sur
                    les échéances impayées.
                  </p>
                </div>
              </div>
            )}

            {errors.allocations && (
              <p className="text-xs text-red-600 mt-1.5">
                {errors.allocations}
              </p>
            )}
          </div>
        )}

        {/* ═══════════ NOTES ═══════════ */}
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

        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
          <DocumentTextIcon className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-800">
            Après validation, un reçu sera généré automatiquement et vous serez
            redirigé vers sa page de détail pour impression.
          </p>
        </div>

        {/* ═══════════ ACTIONS ═══════════ */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to="/dashboard/paiements"
            className="px-4 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={
              createMutation.isPending ||
              genererRecu.isPending ||
              !classeId ||
              !eleveId ||
              montant <= 0 ||
              !estEquilibre ||
              allocations.length === 0 ||
              !activeAssignment
            }
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {createMutation.isPending || genererRecu.isPending ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                {createMutation.isPending
                  ? 'Enregistrement…'
                  : 'Génération du reçu…'}
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                Enregistrer et imprimer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaiementNouveauPage;