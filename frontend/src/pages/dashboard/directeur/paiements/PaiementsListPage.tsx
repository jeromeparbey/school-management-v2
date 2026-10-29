// frontend2/src/pages/dashboard/directeur/paiements/PaiementsListPage.tsx

import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowPathIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  ReceiptPercentIcon,
  ExclamationTriangleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  PrinterIcon,
  ClockIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import {
  usePaiements,
  useAnnulerPaiement,
} from '../../../../hooks/usePaiements';
import {
  useDownloadRecuPDF,
  usePreviewRecuPDF,
  useGenererRecu,
} from '../../../../hooks/useRecus';
import { useClasses } from '../../../../hooks/useClasses';
import { useToast } from '../../../../context/ToastContext';
import type {
  ListPaiementsParams,
  MoyenPaiement,
  StatutPaiement,
} from '../../../../types/paiement.types';

// ══════════════════════════════════════════════
// CONSTANTES
// ══════════════════════════════════════════════

const MOYENS: { value: MoyenPaiement; label: string; color: string }[] = [
  { value: 'ESPECES', label: 'Espèces', color: 'bg-emerald-50 text-emerald-700' },
  { value: 'VIREMENT', label: 'Virement', color: 'bg-blue-50 text-blue-700' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money', color: 'bg-amber-50 text-amber-700' },
  { value: 'CARTE', label: 'Carte', color: 'bg-indigo-50 text-indigo-700' },
  { value: 'CHEQUE', label: 'Chèque', color: 'bg-purple-50 text-purple-700' },
  { value: 'AUTRE', label: 'Autre', color: 'bg-gray-100 text-gray-700' },
];

const STATUTS: { value: StatutPaiement; label: string }[] = [
  { value: 'COMPLET', label: 'Complet' },
  { value: 'ANNULE', label: 'Annulé' },
  { value: 'REMBOURSE', label: 'Remboursé' },
];

const moyenLabel = (m: MoyenPaiement) =>
  MOYENS.find((x) => x.value === m)?.label ?? m;
const moyenColor = (m: MoyenPaiement) =>
  MOYENS.find((x) => x.value === m)?.color ?? 'bg-gray-100 text-gray-700';

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════

/** 💰 F CFA */
const formatMoney = (n: number | null | undefined) => {
  if (n == null) return '0 F CFA';
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' F CFA';
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return {
    dateStr: d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    heureStr: d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

/** Jours de retard à partir d'aujourd'hui */
const joursDepuis = (dateLimite: string): number => {
  const diff = new Date(dateLimite).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/** Extrait toutes les tranches d'un paiement avec leur résumé */
function getTranches(p: any) {
  if (!Array.isArray(p.allocations)) return [];
  return p.allocations.map((alloc: any) => {
    const tranche = alloc.tranche ?? null;
    return {
      id: alloc.id,
      echeanceId: alloc.echeanceId,
      nom: tranche?.nom ?? alloc.echeance?.nom ?? '—',
      ordre: tranche?.ordre ?? alloc.echeance?.ordre ?? 0,
      dateLimite: tranche?.dateLimite ?? alloc.echeance?.dateLimite,
      montantTotal: tranche?.montantTotal ?? alloc.echeance?.montant ?? 0,
      totalPaye: tranche?.totalPaye ?? alloc.montant ?? 0,
      restant: tranche?.restant ?? 0,
      statut: tranche?.statut ?? 'IMPAYEE',
      enRetard: tranche?.enRetard ?? false,
      joursRetard: tranche?.joursRetard ?? 0,
      montantAlloue: alloc.montant ?? 0,
      historique: tranche?.historique ?? [],
    };
  });
}

/** Calcule le résumé global d'un paiement */
function getResumePaiement(p: any) {
  const tranches = getTranches(p);
  const totalPaye = tranches.reduce(
    (s: number, t: any) => s + t.montantAlloue,
    0
  );
  const restantTotal = tranches.reduce(
    (s: number, t: any) => s + t.restant,
    0
  );
  const enRetard = tranches.some((t: any) => t.enRetard);
  const joursRetardMax = tranches.reduce(
    (max: number, t: any) => Math.max(max, t.joursRetard),
    0
  );
  return {
    tranches,
    totalPaye,
    restantTotal,
    enRetard,
    joursRetardMax,
    nombreTranches: tranches.length,
  };
}

// ══════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════

const PaiementsListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // ─── Filtres ───
  const [search, setSearch] = useState('');
  const [classeId, setClasseId] = useState('');
  const [searchClasse, setSearchClasse] = useState('');
  const [showClasseDropdown, setShowClasseDropdown] = useState(false);
  const [moyen, setMoyen] = useState<MoyenPaiement | ''>('');
  const [statut, setStatut] = useState<StatutPaiement | ''>('COMPLET');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  // 🆕 Filtres additionnels
  const [filterRetard, setFilterRetard] = useState(false);
  const [filterAvecReste, setFilterAvecReste] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<
    'datePaiement' | 'montant' | 'createdAt'
  >('datePaiement');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ─── Expansion d'une ligne ───
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ─── Dialog annulation ───
  const [annulerId, setAnnulerId] = useState<string | null>(null);
  const [motifAnnulation, setMotifAnnulation] = useState('');
  const annulerMutation = useAnnulerPaiement();

  // Reçus
  const genererRecu = useGenererRecu();
  const downloadPDF = useDownloadRecuPDF();
  const previewPDF = usePreviewRecuPDF();

  // Classes
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

  // ─── Params ───
  const params: ListPaiementsParams = useMemo(
    () => ({
      page,
      limit,
      search: search.trim() || undefined,
      classeId: classeId || undefined,
      moyen: moyen || undefined,
      statut: statut || undefined,
      dateDebut: dateDebut ? new Date(dateDebut).toISOString() : undefined,
      dateFin: dateFin
        ? new Date(dateFin + 'T23:59:59').toISOString()
        : undefined,
      sortBy,
      sortOrder,
    }),
    [
      page,
      limit,
      search,
      classeId,
      moyen,
      statut,
      dateDebut,
      dateFin,
      sortBy,
      sortOrder,
    ]
  );

  const { data, isLoading, isFetching, isError, refetch } = usePaiements(params);

  const paiementsBruts = data?.paiements ?? [];
  const pagination = data?.pagination;
  const summary = data?.summary ?? { totalMontant: 0 };

  // ─── Filtres client (retard / reste) ───
  const paiements = useMemo(() => {
    let result = paiementsBruts;
    if (filterRetard) {
      result = result.filter((p: any) => getResumePaiement(p).enRetard);
    }
    if (filterAvecReste) {
      result = result.filter(
        (p: any) => getResumePaiement(p).restantTotal > 0.01
      );
    }
    return result;
  }, [paiementsBruts, filterRetard, filterAvecReste]);

  // ─── Stats locales enrichies ───
  const pageStats = useMemo(() => {
    let complets = 0;
    let annules = 0;
    let montantPage = 0;
    let enRetard = 0;
    let avecReste = 0;
    let resteTotal = 0;

    for (const p of paiements as any[]) {
      if (p.statut === 'COMPLET') {
        complets++;
        montantPage += p.montant ?? 0;
      } else if (p.statut === 'ANNULE') {
        annules++;
      }
      const resume = getResumePaiement(p);
      if (resume.enRetard) enRetard++;
      if (resume.restantTotal > 0.01) avecReste++;
      resteTotal += resume.restantTotal;
    }

    return {
      complets,
      annules,
      montantPage,
      enRetard,
      avecReste,
      resteTotal,
    };
  }, [paiements]);

  // ─── Reset ───
  const resetFilters = () => {
    setSearch('');
    setClasseId('');
    setSearchClasse('');
    setMoyen('');
    setStatut('COMPLET');
    setDateDebut('');
    setDateFin('');
    setFilterRetard(false);
    setFilterAvecReste(false);
    setPage(1);
  };

  const hasActiveFilters =
    !!search.trim() ||
    !!classeId ||
    !!moyen ||
    statut !== 'COMPLET' ||
    !!dateDebut ||
    !!dateFin ||
    filterRetard ||
    filterAvecReste;

  const toggleSort = (key: typeof sortBy) => {
    if (sortBy === key) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(key);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // ─── Handlers classe ───
  const handleSelectClasse = (c: any) => {
    setClasseId(c.id);
    setSearchClasse(`${c.nom} (${c.code})`);
    setShowClasseDropdown(false);
    setPage(1);
  };
  const handleClearClasse = () => {
    setClasseId('');
    setSearchClasse('');
    setPage(1);
  };

  // ─── Handlers annulation ───
  const handleAnnuler = async () => {
    if (!annulerId) return;
    if (motifAnnulation.trim().length < 3) {
      toast.warning('Motif trop court', 'Minimum 3 caractères.');
      return;
    }
    try {
      await annulerMutation.mutateAsync({
        id: annulerId,
        payload: { motifAnnulation: motifAnnulation.trim() },
      });
      setAnnulerId(null);
      setMotifAnnulation('');
    } catch {
      /* toasté */
    }
  };

  // ─── Gestion reçu ───
  const ensureRecu = async (
    paiementId: string,
    existingRecu: any | null | undefined
  ): Promise<{ id: string; numeroRecu: string } | null> => {
    if (existingRecu?.id && existingRecu?.numeroRecu) {
      return { id: existingRecu.id, numeroRecu: existingRecu.numeroRecu };
    }
    try {
      const res = await genererRecu.mutateAsync({ paiementId });
      const created = (res as any)?.data ?? res;
      if (created?.id && created?.numeroRecu) {
        return { id: created.id, numeroRecu: created.numeroRecu };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handlePrintDirect = async (
    p: (typeof paiementsBruts)[number],
    format: 'A4' | 'A5' | '80MM' = 'A4'
  ) => {
    const recu = await ensureRecu(p.id, p.recu);
    if (!recu) return;
    downloadPDF.mutate({ id: recu.id, numeroRecu: recu.numeroRecu, format });
  };

  const handlePreviewDirect = async (
    p: (typeof paiementsBruts)[number]
  ) => {
    const recu = await ensureRecu(p.id, p.recu);
    if (!recu) return;
    previewPDF.mutate({ id: recu.id, format: 'A4' });
  };

  // Récupère la classe du paiement
  const getClasseOfPaiement = (p: (typeof paiementsBruts)[number]) => {
    const anyP = p as any;
    if (anyP.classeNom) {
      return { nom: anyP.classeNom, code: anyP.classeCode };
    }
    const ins =
      anyP.eleve?.inscriptions?.find((i: any) => i.estActive) ??
      anyP.eleve?.inscriptions?.[0];
    return ins?.classe ?? null;
  };

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* ─── En-tête ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BanknotesIcon className="w-7 h-7 text-emerald-600" />
            Paiements
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination?.total ?? 0} paiement(s) au total
            {hasActiveFilters && (
              <span className="ml-2 text-emerald-600 font-medium">
                ({paiements.length} filtré{paiements.length > 1 ? 's' : ''})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            title="Rafraîchir"
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
            />
          </button>
          <Link
            to="/dashboard/recus"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-blue-700 rounded-lg hover:bg-blue-50 text-sm font-medium"
          >
            <DocumentTextIcon className="w-4 h-4" />
            Reçus
          </Link>
          <Link
            to="/dashboard/paiements/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg"
          >
            <PlusIcon className="w-4 h-4" />
            Nouveau paiement
          </Link>
        </div>
      </div>

      {/* ─── KPI (6 cartes) ─── */}
      {!isLoading && !isError && paiementsBruts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Total global"
            value={formatMoney(summary.totalMontant)}
            icon={BanknotesIcon}
            color="emerald"
            hint="tous filtres"
          />
          <StatCard
            label="Page courante"
            value={formatMoney(pageStats.montantPage)}
            icon={ReceiptPercentIcon}
            color="blue"
            hint={`${pageStats.complets} paiement(s)`}
          />
          <StatCard
            label="Complets"
            value={pageStats.complets}
            icon={CheckCircleIcon}
            color="emerald"
            hint={
              paiements.length > 0
                ? `${Math.round(
                    (pageStats.complets / paiements.length) * 100
                  )}%`
                : undefined
            }
          />
          <StatCard
            label="Annulés"
            value={pageStats.annules}
            icon={XCircleIcon}
            color="red"
          />
          <StatCard
            label="En retard"
            value={pageStats.enRetard}
            icon={ExclamationTriangleIcon}
            color="amber"
            hint={`${pageStats.avecReste} avec reste`}
          />
          <StatCard
            label="Reste à payer"
            value={formatMoney(pageStats.resteTotal)}
            icon={ArrowTrendingDownIcon}
            color="red"
            hint="cumulé page"
          />
        </div>
      )}

      {/* ─── Recherche + filtres ─── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher (référence, nom, matricule, classe)…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setFilterRetard((v) => !v)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              filterRetard
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ExclamationTriangleIcon className="w-4 h-4" />
            En retard
          </button>

          <button
            onClick={() => setFilterAvecReste((v) => !v)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              filterAvecReste
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ArrowTrendingDownIcon className="w-4 h-4" />
            Avec reste
          </button>

          <button
            onClick={resetFilters}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              hasActiveFilters
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <XMarkIcon className="w-4 h-4" />
            Effacer
          </button>
        </div>

        {/* Filtres avancés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100">
          {/* Classe */}
          {!selectedClasse ? (
            <div className="relative">
              <AcademicCapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher une classe…"
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
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-60 text-sm"
              />
              {classesLoading && (
                <ArrowPathIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
              {showClasseDropdown && !classesLoading && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {filteredClasses.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      {searchClasse.trim()
                        ? 'Aucune classe ne correspond'
                        : 'Aucune classe'}
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
                        className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 border-b last:border-b-0"
                      >
                        <div className="w-7 h-7 rounded bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs shrink-0">
                          <AcademicCapIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {c.nom}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {c.code}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
              <AcademicCapIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedClasse.nom}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {selectedClasse.code}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearClasse}
                className="p-1 text-gray-500 hover:bg-white rounded"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Moyen */}
          <select
            value={moyen}
            onChange={(e) => {
              setMoyen(e.target.value as MoyenPaiement | '');
              setPage(1);
            }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          >
            <option value="">Tous les moyens</option>
            {MOYENS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Statut */}
          <select
            value={statut}
            onChange={(e) => {
              setStatut(e.target.value as StatutPaiement | '');
              setPage(1);
            }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          >
            <option value="">Tous les statuts</option>
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Dates */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Du</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => {
                  setDateDebut(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Au</label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => {
                  setDateFin(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Indicateur refresh ─── */}
      {isFetching && !isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <ArrowPathIcon className="h-4 w-4 animate-spin text-emerald-600" />
          Actualisation…
        </div>
      )}

      {/* ─── Tableau ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="py-16 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 font-medium">
              Erreur de chargement des paiements
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-sm text-emerald-600 hover:underline font-medium"
            >
              Réessayer
            </button>
          </div>
        ) : paiements.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8" />
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Élève / Classe
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tranche(s)
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort('montant')}
                      className="inline-flex items-center gap-1 hover:text-gray-700"
                    >
                      Montant
                      {sortBy === 'montant' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUpIcon className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDownIcon className="w-3.5 h-3.5" />
                        ))}
                    </button>
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payé / Restant
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Moyen
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => toggleSort('datePaiement')}
                      className="inline-flex items-center gap-1 hover:text-gray-700"
                    >
                      Date
                      {sortBy === 'datePaiement' &&
                        (sortOrder === 'asc' ? (
                          <ChevronUpIcon className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDownIcon className="w-3.5 h-3.5" />
                        ))}
                    </button>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paiements.map((p: any) => {
                  const resume = getResumePaiement(p);
                  const hasRecu = !!p.recu?.id;
                  const isPendingPDF =
                    downloadPDF.isPending || previewPDF.isPending;
                  const { dateStr, heureStr } = formatDate(p.datePaiement);
                  const classe = getClasseOfPaiement(p);
                  const isExpanded = expandedId === p.id;

                  return (
                    <React.Fragment key={p.id}>
                      <tr
                        className={`hover:bg-gray-50/50 transition-colors ${
                          resume.enRetard ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {/* Expand */}
                        <td className="px-2 py-3">
                          {resume.nombreTranches > 0 && (
                            <button
                              onClick={() =>
                                setExpandedId(isExpanded ? null : p.id)
                              }
                              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                              title={
                                isExpanded ? 'Réduire' : 'Voir les tranches'
                              }
                            >
                              {isExpanded ? (
                                <ChevronUpIcon className="w-4 h-4" />
                              ) : (
                                <ChevronDownIcon className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </td>

                        {/* Référence */}
                        <td className="px-3 py-3">
                          <p className="font-mono text-xs font-medium text-gray-900 truncate">
                            {p.reference}
                          </p>
                          {hasRecu && (
                            <p className="text-[10px] text-blue-600 truncate flex items-center gap-1 mt-0.5">
                              <DocumentTextIcon className="w-3 h-3 shrink-0" />
                              {p.recu.numeroRecu}
                            </p>
                          )}
                        </td>

                        {/* Élève / Classe */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs shrink-0">
                              {p.eleve?.prenom?.[0]}
                              {p.eleve?.nom?.[0]}
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/dashboard/eleves/${p.eleveId}`}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
                              >
                                {p.eleve?.prenom} {p.eleve?.nom}
                              </Link>
                              <p className="text-xs text-gray-500 truncate">
                                {p.eleve?.matricule}
                                {classe && (
                                  <>
                                    {' '}—{' '}
                                    <span className="text-blue-600 font-medium">
                                      {classe.nom}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Tranches */}
                        <td className="px-3 py-3">
                          {resume.nombreTranches === 0 ? (
                            <span className="text-xs text-gray-400">—</span>
                          ) : resume.nombreTranches === 1 ? (
                            <div className="text-xs">
                              <p className="font-medium text-gray-900 truncate">
                                {resume.tranches[0].nom}
                              </p>
                              <p className="text-gray-500">
                                Total :{' '}
                                {formatMoney(resume.tranches[0].montantTotal)}
                              </p>
                            </div>
                          ) : (
                            <div className="text-xs">
                              <p className="font-medium text-gray-900">
                                {resume.nombreTranches} tranches
                              </p>
                              <p className="text-gray-500 truncate">
                                {resume.tranches
                                  .map((t: any) => t.nom)
                                  .join(', ')}
                              </p>
                            </div>
                          )}
                        </td>

                        {/* Montant */}
                        <td className="px-3 py-3 text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {formatMoney(p.montant)}
                          </p>
                        </td>

                        {/* Payé / Restant */}
                        <td className="px-3 py-3 text-right">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-xs text-emerald-700 font-semibold">
                              Payé : {formatMoney(resume.totalPaye)}
                            </span>
                            {resume.restantTotal > 0.01 && (
                              <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                                <ArrowTrendingDownIcon className="w-3 h-3" />
                                Reste : {formatMoney(resume.restantTotal)}
                              </span>
                            )}
                            {resume.enRetard && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 mt-0.5">
                                <ClockIcon className="w-3 h-3" />
                                +{resume.joursRetardMax}j
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Moyen */}
                        <td className="px-3 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${moyenColor(
                              p.moyen
                            )}`}
                          >
                            {moyenLabel(p.moyen)}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-3 py-3">
                          <div className="text-sm text-gray-900">
                            {dateStr}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {heureStr}
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="px-3 py-3 text-center">
                          {p.statut === 'COMPLET' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              Complet
                            </span>
                          )}
                          {p.statut === 'ANNULE' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                              <XCircleIcon className="w-3.5 h-3.5" />
                              Annulé
                            </span>
                          )}
                          {p.statut === 'REMBOURSE' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                              <XCircleIcon className="w-3.5 h-3.5" />
                              Remboursé
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3 text-right">
                          <div className="inline-flex items-center gap-0.5">
                            <button
                              onClick={() =>
                                navigate(`/dashboard/paiements/${p.id}`)
                              }
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                              title="Voir le paiement"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            {hasRecu && (
                              <button
                                onClick={() =>
                                  navigate(`/dashboard/recus/${p.recu.id}`)
                                }
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Voir le reçu"
                              >
                                <DocumentTextIcon className="w-4 h-4" />
                              </button>
                            )}
                            {p.statut === 'COMPLET' && (
                              <>
                                <button
                                  onClick={() => handlePreviewDirect(p)}
                                  disabled={isPendingPDF}
                                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"
                                  title="Aperçu du reçu"
                                >
                                  <PrinterIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handlePrintDirect(p, 'A4')}
                                  disabled={isPendingPDF}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50"
                                  title="Télécharger A4"
                                >
                                  <ArrowDownTrayIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handlePrintDirect(p, '80MM')
                                  }
                                  disabled={isPendingPDF}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50"
                                  title="Ticket 80mm"
                                >
                                  <ReceiptPercentIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setAnnulerId(p.id);
                                    setMotifAnnulation('');
                                  }}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                  title="Annuler"
                                >
                                  <XCircleIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Détail expandable des tranches */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan={10} className="p-0">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-gray-50/60"
                              >
                                <div className="px-6 py-3">
                                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Détail des tranches payées
                                  </p>
                                  <div className="space-y-2">
                                    {resume.tranches.map(
                                      (t: any, i: number) => (
                                        <div
                                          key={t.id}
                                          className="bg-white rounded-lg border border-gray-200 p-3"
                                        >
                                          <div className="flex items-start justify-between gap-3 flex-wrap">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                {i + 1}
                                              </div>
                                              <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <p className="text-sm font-semibold text-gray-900">
                                                    {t.nom}
                                                  </p>
                                                  {t.enRetard && (
                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                                                      <ClockIcon className="w-3 h-3" />
                                                      +{t.joursRetard}j
                                                    </span>
                                                  )}
                                                  {t.statut ===
                                                    'PARTIELLE' && (
                                                    <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                                      Partielle
                                                    </span>
                                                  )}
                                                  {t.statut === 'PAYEE' && (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                                      <CheckCircleIcon className="w-3 h-3" />
                                                      Payée
                                                    </span>
                                                  )}
                                                </div>
                                                {t.dateLimite && (
                                                  <p className="text-xs text-gray-500 mt-0.5">
                                                    Limite :{' '}
                                                    {new Date(
                                                      t.dateLimite
                                                    ).toLocaleDateString(
                                                      'fr-FR'
                                                    )}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-xs">
                                              <div>
                                                <p className="text-gray-500">
                                                  Total tranche
                                                </p>
                                                <p className="font-bold text-gray-900">
                                                  {formatMoney(t.montantTotal)}
                                                </p>
                                              </div>
                                              <div>
                                                <p className="text-gray-500">
                                                  Payé (cumulé)
                                                </p>
                                                <p className="font-bold text-emerald-700">
                                                  {formatMoney(t.totalPaye)}
                                                </p>
                                              </div>
                                              <div>
                                                <p className="text-gray-500">
                                                  Reste
                                                </p>
                                                <p
                                                  className={`font-bold ${
                                                    t.restant > 0.01
                                                      ? 'text-red-600'
                                                      : 'text-gray-400'
                                                  }`}
                                                >
                                                  {formatMoney(t.restant)}
                                                </p>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Historique détaillé */}
                                          {t.historique?.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                                Paiements sur cette tranche
                                              </p>
                                              <div className="space-y-1">
                                                {t.historique.map(
                                                  (h: any) => (
                                                    <div
                                                      key={h.paiementId}
                                                      className="flex items-center justify-between text-xs"
                                                    >
                                                      <div className="flex items-center gap-2">
                                                        <span className="font-mono text-gray-700">
                                                          {h.reference}
                                                        </span>
                                                        <span className="text-gray-400">
                                                          •
                                                        </span>
                                                        <span className="text-gray-500">
                                                          {new Date(
                                                            h.datePaiement
                                                          ).toLocaleDateString(
                                                            'fr-FR'
                                                          )}
                                                        </span>
                                                        {h.caissier && (
                                                          <>
                                                            <span className="text-gray-400">
                                                              •
                                                            </span>
                                                            <span className="text-gray-500">
                                                              {h.caissier}
                                                            </span>
                                                          </>
                                                        )}
                                                      </div>
                                                      <span className="font-bold text-emerald-700">
                                                        {formatMoney(h.montant)}
                                                      </span>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-600">
              <strong>{pagination.total}</strong> paiement(s) — page{' '}
              <strong>{pagination.page}</strong> sur {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-600 px-2">
                {page} / {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog annulation */}
      {annulerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Annuler le paiement
                </h2>
                <p className="text-xs text-gray-500">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Motif d'annulation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motifAnnulation}
                onChange={(e) => setMotifAnnulation(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Expliquez la raison de l'annulation (min 3 caractères)…"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {motifAnnulation.length}/500
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setAnnulerId(null);
                  setMotifAnnulation('');
                }}
                className="px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleAnnuler}
                disabled={
                  annulerMutation.isPending ||
                  motifAnnulation.trim().length < 3
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {annulerMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Annulation…
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-4 h-4" />
                    Confirmer l'annulation
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

// ══════════════════════════════════════════════
// SOUS-COMPOSANTS
// ══════════════════════════════════════════════

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'blue' | 'red' | 'indigo' | 'amber';
  hint?: string;
}> = ({ label, value, icon: Icon, color, hint }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
  }[color];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-base font-bold text-gray-900 mt-1 truncate">
            {value}
          </p>
          {hint && (
            <p className="text-[10px] text-gray-400 mt-0.5 truncate">
              {hint}
            </p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-lg ${colorClasses} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const TableSkeleton: React.FC = () => (
  <div className="p-4 space-y-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 animate-pulse">
        <div className="w-16 h-3 bg-gray-200 rounded" />
        <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-2 bg-gray-100 rounded w-1/4" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-6 bg-gray-100 rounded-full w-16" />
      </div>
    ))}
  </div>
);

const EmptyState: React.FC<{
  hasFilters: boolean;
  onResetFilters: () => void;
}> = ({ hasFilters, onResetFilters }) => (
  <div className="py-16 text-center">
    <BanknotesIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
    <p className="text-gray-600 font-medium">
      {hasFilters
        ? 'Aucun paiement ne correspond aux filtres'
        : "Aucun paiement pour l'instant"}
    </p>
    <p className="text-xs text-gray-500 mt-1">
      {hasFilters
        ? "Essayez d'ajuster vos critères de recherche."
        : 'Enregistrez le premier paiement pour commencer.'}
    </p>
    <div className="mt-4 flex items-center justify-center gap-3">
      {hasFilters && (
        <button
          onClick={onResetFilters}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium hover:underline"
        >
          Réinitialiser les filtres
        </button>
      )}
      <Link
        to="/dashboard/paiements/nouveau"
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
      >
        <PlusIcon className="w-4 h-4" />
        Nouveau paiement
      </Link>
    </div>
  </div>
);

export default PaiementsListPage;