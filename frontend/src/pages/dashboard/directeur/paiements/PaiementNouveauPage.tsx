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
} from '@heroicons/react/24/outline';
import { useCreatePaiement } from '../../../../hooks/usePaiements';
import { useEleves } from '../../../../hooks/useEleves';
import { useEcheances } from '../../../../hooks/useEcheance';
import { useToast } from '../../../../context/ToastContext';
import type { Eleve } from '../../../../types/eleve.types';
import type {
  CreatePaiementPayload,
  MoyenPaiement,
  AllocationInput,
} from '../../../../types/paiement.types';

const MOYENS: { value: MoyenPaiement; label: string }[] = [
  { value: 'ESPECES', label: 'Espèces' },
  { value: 'VIREMENT', label: 'Virement bancaire' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'CARTE', label: 'Carte bancaire' },
  { value: 'CHEQUE', label: 'Chèque' },
  { value: 'AUTRE', label: 'Autre' },
];

const formatMontant = (n: number) =>
  n.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const PaiementNouveauPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const eleveIdFromQuery = searchParams.get('eleveId') ?? '';

  // Champs
  const [eleveId, setEleveId] = useState(eleveIdFromQuery);
  const [searchEleve, setSearchEleve] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [montant, setMontant] = useState<number>(0);
  const [moyen, setMoyen] = useState<MoyenPaiement>('ESPECES');
  const [referenceMoyen, setReferenceMoyen] = useState('');
  const [datePaiement, setDatePaiement] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');
  const [allocations, setAllocations] = useState<AllocationInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreatePaiement();

  // ─────────── Lookup élèves ───────────
  const { data: elevesData } = useEleves({
    limit: 200,
    sortBy: 'nom',
    sortOrder: 'asc',
  });
  const eleves: Eleve[] = useMemo(() => {
    if (!elevesData) return [];
    const any = elevesData as any;
    if (Array.isArray(any.eleves)) return any.eleves;
    if (Array.isArray(any.data)) return any.data;
    return [];
  }, [elevesData]);

  // ─────────── Lookup échéances impayées de l'élève ───────────
  // ✅ Plus de `as any` : eleveId est typé dans ListEcheancesParams
  const { data: echeancesData, isLoading: echeancesLoading } = useEcheances(
    eleveId
      ? {
          eleveId,
          estPayee: false,
          limit: 100,
          sortBy: 'dateLimite',
          sortOrder: 'asc',
        }
      : undefined
  );

  const echeances: any[] = useMemo(() => {
    if (!echeancesData) return [];
    const any = echeancesData as any;
    if (Array.isArray(any.echeances)) return any.echeances;
    if (Array.isArray(any.data)) return any.data;
    return [];
  }, [echeancesData]);

  // ─────────── Filtre élèves ───────────
  const filteredEleves = useMemo(() => {
    const q = searchEleve.trim().toLowerCase();
    if (!q) return eleves.slice(0, 50);
    return eleves
      .filter((e) => {
        const hay = `${e.prenom} ${e.nom} ${e.matricule}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [eleves, searchEleve]);

  const selectedEleve = useMemo(
    () => eleves.find((e) => e.id === eleveId) ?? null,
    [eleves, eleveId]
  );

  // Auto-sélection élève via query
  useEffect(() => {
    if (eleveIdFromQuery && !eleveId) {
      setEleveId(eleveIdFromQuery);
    }
  }, [eleveIdFromQuery, eleveId]);

  // ─────────── Handlers ───────────
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

  const addAllocation = (echeanceId: string) => {
    const echeance = echeances.find((e: any) => e.id === echeanceId);
    if (!echeance) return;
    if (allocations.some((a) => a.echeanceId === echeanceId)) return;
    const newAlloc = { echeanceId, montant: echeance.montant };
    setAllocations((prev) => [...prev, newAlloc]);
    setMontant((prev) => prev + echeance.montant);
  };

  const removeAllocation = (echeanceId: string) => {
    const alloc = allocations.find((a) => a.echeanceId === echeanceId);
    if (!alloc) return;
    setAllocations((prev) => prev.filter((a) => a.echeanceId !== echeanceId));
    setMontant((prev) => Math.max(0, prev - alloc.montant));
  };

  const updateAllocationMontant = (echeanceId: string, newMontant: number) => {
    const old = allocations.find((a) => a.echeanceId === echeanceId);
    if (!old) return;
    const delta = newMontant - old.montant;
    setAllocations((prev) =>
      prev.map((a) =>
        a.echeanceId === echeanceId ? { ...a, montant: newMontant } : a
      )
    );
    setMontant((prev) => Math.max(0, prev + delta));
  };

  // ─────────── Validation ───────────
  const totalAllocations = allocations.reduce((s, a) => s + a.montant, 0);
  const ecartAllocations = Math.abs(totalAllocations - montant);
  const allocationsValides =
    allocations.length === 0 || ecartAllocations < 0.01;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!eleveId) errs.eleveId = 'Sélectionnez un élève';
    if (!montant || montant <= 0) errs.montant = 'Montant invalide';
    if (!allocationsValides) {
      errs.allocations = `Le total des allocations (${formatMontant(
        totalAllocations
      )}) doit égaler le montant (${formatMontant(montant)})`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

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
      ...(allocations.length > 0 && { allocations }),
    };

    try {
      await createMutation.mutateAsync(payload);
      navigate('/dashboard/paiements');
    } catch {
      /* toasté par le hook */
    }
  };

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* En-tête */}
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
            Enregistrer un encaissement pour un élève
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-6"
      >
        {/* ═══════════ ÉLÈVE ═══════════ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Élève <span className="text-red-500">*</span>
          </label>

          {!selectedEleve ? (
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, matricule…"
                value={searchEleve}
                onChange={(e) => {
                  setSearchEleve(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ${
                  errors.eleveId
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />

              {showDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                  {filteredEleves.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Aucun élève trouvé
                    </div>
                  ) : (
                    filteredEleves.map((e) => (
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
                step="0.01"
                value={montant || ''}
                onChange={(e) => {
                  setMontant(Number(e.target.value));
                  setErrors((x) => ({ ...x, montant: '' }));
                }}
                placeholder="0"
                className={`w-full pl-10 pr-16 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none ${
                  errors.montant
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                XOF
              </span>
            </div>
            {errors.montant && (
              <p className="text-xs text-red-600 mt-1.5">{errors.montant}</p>
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
              max={new Date().toISOString().slice(0, 10)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* ═══════════ ALLOCATIONS ═══════════ */}
        {selectedEleve && (
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <ReceiptPercentIcon className="w-4 h-4 text-indigo-500" />
                Allocations aux échéances
              </h3>
              <p className="text-xs text-gray-500">
                {allocations.length} / {echeances.length} sélectionnée(s)
              </p>
            </div>

            {echeancesLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Chargement des échéances…
              </div>
            ) : echeances.length === 0 ? (
              <p className="text-xs text-gray-500">
                Aucune échéance impayée pour cet élève.
              </p>
            ) : (
              <div className="space-y-2">
                {echeances.map((e: any) => {
                  const isAllocated = allocations.some(
                    (a) => a.echeanceId === e.id
                  );
                  const alloc = allocations.find(
                    (a) => a.echeanceId === e.id
                  );
                  return (
                    <div
                      key={e.id}
                      className={`p-3 rounded-lg border ${
                        isAllocated
                          ? 'bg-indigo-50 border-indigo-200'
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
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {e.nom}
                          </p>
                          <p className="text-xs text-gray-500">
                            Échéance :{' '}
                            {new Date(e.dateLimite).toLocaleDateString(
                              'fr-FR'
                            )}
                            {' — '}
                            Montant : {formatMontant(e.montant)} XOF
                          </p>
                        </div>
                        {isAllocated && alloc && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              max={e.montant}
                              value={alloc.montant}
                              onChange={(ev) =>
                                updateAllocationMontant(
                                  e.id,
                                  Number(ev.target.value)
                                )
                              }
                              className="w-24 px-2 py-1 text-sm bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <span className="text-xs text-gray-500">XOF</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {allocations.length > 0 && (
              <div
                className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
                  allocationsValides
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {allocationsValides ? (
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 text-xs">
                  <p
                    className={`font-semibold ${
                      allocationsValides
                        ? 'text-emerald-800'
                        : 'text-red-800'
                    }`}
                  >
                    Total alloué : {formatMontant(totalAllocations)} XOF
                  </p>
                  {!allocationsValides && (
                    <p className="text-red-700 mt-0.5">
                      Doit égaler le montant du paiement (
                      {formatMontant(montant)} XOF)
                    </p>
                  )}
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

        {/* Info */}
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
          <InformationCircleIcon className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-800">
            Un reçu sera généré automatiquement. Le paiement peut être annulé
            depuis la page de détail.
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
              !eleveId ||
              montant <= 0 ||
              !allocationsValides
            }
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Enregistrement…
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                Enregistrer le paiement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaiementNouveauPage;