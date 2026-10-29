// frontend2/src/pages/dashboard/directeur/import/ImportElevesPage.tsx

import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ReceiptPercentIcon,
  CalendarDaysIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../../../../context/ToastContext';
import {
  useImportEleves,
  useDownloadImportTemplate,
} from '../../../../hooks/useImport';
import type {
  EleveImportRow,
  ImportOptions,
  ImportResult,
} from '../../../../types/import.types';

// ═══════════════════════════════════════════════════════════
// CSV PARSER (simple, sans dépendance)
// ═══════════════════════════════════════════════════════════

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length === 0) return [];

  // Détecter séparateur (virgule vs point-virgule)
  const firstLine = lines[0];
  const separator = firstLine.includes(';') ? ';' : ',';

  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === separator && !inQuotes) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  };

  const headers = parseLine(lines[0]).map((h) => h.trim());

  return lines
    .slice(1)
    .filter((l) => l.trim() !== '')
    .map((line) => {
      const values = parseLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = (values[i] ?? '').trim();
      });
      return row;
    });
}

function csvToLignes(rows: Record<string, string>[]): EleveImportRow[] {
  return rows.map((r) => {
    const num = (v: string | undefined) => {
      if (!v) return undefined;
      const n = Number(v);
      return isNaN(n) ? undefined : n;
    };
    const str = (v: string | undefined) => {
      const s = (v ?? '').trim();
      return s === '' ? undefined : s;
    };

    const sexe = (str(r.sexe) ?? 'M').toUpperCase() === 'F' ? 'F' : 'M';

    return {
      prenom: str(r.prenom) ?? '',
      nom: str(r.nom) ?? '',
      sexe: sexe as 'M' | 'F',
      dateNaissance: str(r.dateNaissance) ?? '',

      lieuNaissance: str(r.lieuNaissance),
      nationalite: str(r.nationalite),
      adresse: str(r.adresse),
      telephone: str(r.telephone),
      email: str(r.email),
      photo: str(r.photo),
      infoMedicale: str(r.infoMedicale),
      groupeSanguin: str(r.groupeSanguin),
      allergies: str(r.allergies),

      classeNom: str(r.classeNom),
      classeCode: str(r.classeCode),
      classeCapacite: num(r.classeCapacite),
      classeSalle: str(r.classeSalle),
      niveauCode: str(r.niveauCode),
      niveauNom: str(r.niveauNom),

      anneeScolaireNom: str(r.anneeScolaireNom),
      anneeScolaireDebut: str(r.anneeScolaireDebut),
      anneeScolaireFin: str(r.anneeScolaireFin),

      planNom: str(r.planNom),
      planFraisInscription: num(r.planFraisInscription),
      planFraisScolarite: num(r.planFraisScolarite),
      planDevise: str(r.planDevise),

      echeance1Nom: str(r.echeance1Nom),
      echeance1Montant: num(r.echeance1Montant),
      echeance1DateLimite: str(r.echeance1DateLimite),
      echeance2Nom: str(r.echeance2Nom),
      echeance2Montant: num(r.echeance2Montant),
      echeance2DateLimite: str(r.echeance2DateLimite),
      echeance3Nom: str(r.echeance3Nom),
      echeance3Montant: num(r.echeance3Montant),
      echeance3DateLimite: str(r.echeance3DateLimite),
      echeance4Nom: str(r.echeance4Nom),
      echeance4Montant: num(r.echeance4Montant),
      echeance4DateLimite: str(r.echeance4DateLimite),
      echeance5Nom: str(r.echeance5Nom),
      echeance5Montant: num(r.echeance5Montant),
      echeance5DateLimite: str(r.echeance5DateLimite),

      responsablePrenom: str(r.responsablePrenom),
      responsableNom: str(r.responsableNom),
      responsableLien: str(r.responsableLien),
      responsableTelephone: str(r.responsableTelephone),
      responsableEmail: str(r.responsableEmail),
      responsableProfession: str(r.responsableProfession),
    };
  });
}

// ═══════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════

const ImportElevesPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportEleves();
  const downloadTemplate = useDownloadImportTemplate();

  const [fileName, setFileName] = useState<string>('');
  const [rows, setRows] = useState<EleveImportRow[]>([]);
  const [parseError, setParseError] = useState<string>('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [options, setOptions] = useState<ImportOptions>({
    creerClassesAuto: true,
    creerAnneeAuto: true,
    creerPlanAuto: true,
    creerEcheancesAuto: true,
    creerResponsables: true,
    ignorerErreurs: true,
    dryRun: false,
  });

  // ─── Handlers ───

  const handleFile = async (file: File) => {
    setParseError('');
    setResult(null);
    setRows([]);
    setFileName(file.name);

    try {
      const text = await file.text();
      const raw = parseCSV(text);
      const lignes = csvToLignes(raw);

      if (lignes.length === 0) {
        setParseError('Le fichier ne contient aucune ligne valide.');
        return;
      }

      // Validation basique
      const invalides = lignes.filter(
        (l) => !l.prenom || !l.nom || !l.dateNaissance
      );
      if (invalides.length > 0) {
        toast.warning(
          `${invalides.length} ligne(s) sans prénom / nom / date naissance`
        );
      }

      setRows(lignes);
      toast.success(`${lignes.length} ligne(s) chargée(s)`);
    } catch (err) {
      console.error(err);
      setParseError('Impossible de lire le fichier.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setFileName('');
    setRows([]);
    setResult(null);
    setParseError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = async () => {
    if (rows.length === 0) {
      toast.warning('Aucune ligne à importer');
      return;
    }

    try {
      const res = await importMutation.mutateAsync({
        lignes: rows,
        options,
      });
      setResult(res);
    } catch {
      /* toast géré par le hook */
    }
  };

  // ─── Stats dérivées ───

  const stats = useMemo(() => {
    const total = rows.length;
    const avecClasse = rows.filter((r) => r.classeCode || r.classeNom).length;
    const avecPlan = rows.filter(
      (r) => r.planNom || r.planFraisInscription || r.planFraisScolarite
    ).length;
    const avecEcheances = rows.filter(
      (r) => r.echeance1Nom || r.echeance2Nom || r.echeance3Nom
    ).length;
    const avecResponsable = rows.filter(
      (r) => r.responsableNom && r.responsablePrenom
    ).length;
    return { total, avecClasse, avecPlan, avecEcheances, avecResponsable };
  }, [rows]);

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="space-y-6 w-full max-w-[1200px] mx-auto pb-12">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <Link to="/dashboard/eleves" className="hover:text-gray-900">
          Élèves
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Import</span>
      </nav>

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6"
      >
        <div className="flex items-start gap-4">
          <Link
            to="/dashboard/eleves"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <CloudArrowUpIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CloudArrowUpIcon className="w-7 h-7 text-emerald-600" />
              Importer des élèves
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Importez un fichier CSV contenant les élèves, leurs classes,
              plans de scolarité et échéances.
            </p>
          </div>
          <button
            type="button"
            onClick={() => downloadTemplate.mutate()}
            disabled={downloadTemplate.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 font-medium disabled:opacity-60 shrink-0"
          >
            {downloadTemplate.isPending ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowDownTrayIcon className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Template CSV</span>
          </button>
        </div>
      </motion.div>

      {/* Zone d'upload */}
      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 space-y-4"
        >
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <DocumentArrowUpIcon className="w-4 h-4 text-emerald-600" />
            1. Charger le fichier
          </h2>

          {rows.length === 0 ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-2xl p-10 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
            >
              <CloudArrowUpIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900">
                Glissez votre fichier CSV ici
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ou cliquez pour parcourir
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Format accepté : CSV (séparateur , ou ;)
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                  <DocumentArrowUpIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {fileName}
                  </p>
                  <p className="text-xs text-gray-600">
                    {rows.length} ligne(s) chargée(s) ·{' '}
                    {stats.avecClasse} avec classe · {stats.avecPlan} avec
                    plan · {stats.avecEcheances} avec échéances
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="p-2 text-gray-500 hover:bg-white rounded-lg"
                  aria-label="Retirer le fichier"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50"
                >
                  <EyeIcon className="w-3.5 h-3.5" />
                  {showPreview ? 'Masquer' : 'Aperçu'} ({rows.length} lignes)
                </button>
              </div>

              {parseError && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{parseError}</p>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.div>
      )}

      {/* Aperçu */}
      <AnimatePresence>
        {showPreview && rows.length > 0 && !result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <EyeIcon className="w-4 h-4 text-emerald-600" />
                Aperçu des données
              </h2>
              <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-lg border border-gray-200">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold text-gray-700">
                        #
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-700">
                        Prénom
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-700">
                        Nom
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-700">
                        Sexe
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-700">
                        Naissance
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-700">
                        Classe
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-700">
                        Plan
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-700">
                        Éch.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 100).map((r, i) => {
                      const nbEch = [
                        r.echeance1Nom,
                        r.echeance2Nom,
                        r.echeance3Nom,
                        r.echeance4Nom,
                        r.echeance5Nom,
                      ].filter(Boolean).length;
                      return (
                        <tr
                          key={i}
                          className={
                            i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }
                        >
                          <td className="px-2 py-1.5 text-gray-400">{i + 1}</td>
                          <td className="px-2 py-1.5 font-medium">
                            {r.prenom || '—'}
                          </td>
                          <td className="px-2 py-1.5 font-medium">
                            {r.nom || '—'}
                          </td>
                          <td className="px-2 py-1.5">{r.sexe}</td>
                          <td className="px-2 py-1.5 text-gray-500">
                            {r.dateNaissance || '—'}
                          </td>
                          <td className="px-2 py-1.5">
                            {r.classeCode || r.classeNom || (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-2 py-1.5">
                            {r.planNom || (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            {nbEch > 0 ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                                {nbEch}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {rows.length > 100 && (
                  <p className="text-center text-xs text-gray-500 py-2 bg-gray-50">
                    + {rows.length - 100} ligne(s) supplémentaire(s)…
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options */}
      {rows.length > 0 && !result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 space-y-4"
        >
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <InformationCircleIcon className="w-4 h-4 text-emerald-600" />
            2. Options d'import
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OptionToggle
              label="Créer les classes manquantes"
              description="Si le code classe n'existe pas, il sera créé"
              checked={options.creerClassesAuto ?? false}
              onChange={(v) =>
                setOptions((o) => ({ ...o, creerClassesAuto: v }))
              }
              icon={AcademicCapIcon}
            />
            <OptionToggle
              label="Créer l'année scolaire"
              description="Si le nom d'année n'existe pas, elle sera créée"
              checked={options.creerAnneeAuto ?? false}
              onChange={(v) =>
                setOptions((o) => ({ ...o, creerAnneeAuto: v }))
              }
              icon={CalendarDaysIcon}
            />
            <OptionToggle
              label="Créer les plans de scolarité"
              description="Crée un plan pour chaque classe si absent"
              checked={options.creerPlanAuto ?? false}
              onChange={(v) => setOptions((o) => ({ ...o, creerPlanAuto: v }))}
              icon={ReceiptPercentIcon}
            />
            <OptionToggle
              label="Créer les échéances"
              description="Crée les échéances 1-5 renseignées dans le fichier"
              checked={options.creerEcheancesAuto ?? false}
              onChange={(v) =>
                setOptions((o) => ({ ...o, creerEcheancesAuto: v }))
              }
              icon={CalendarDaysIcon}
            />
            <OptionToggle
              label="Créer les responsables"
              description="Enregistre les parents/tuteurs renseignés"
              checked={options.creerResponsables ?? false}
              onChange={(v) =>
                setOptions((o) => ({ ...o, creerResponsables: v }))
              }
              icon={UserGroupIcon}
            />
            <OptionToggle
              label="Ignorer les erreurs"
              description="Continue l'import malgré les lignes en erreur"
              checked={options.ignorerErreurs ?? false}
              onChange={(v) =>
                setOptions((o) => ({ ...o, ignorerErreurs: v }))
              }
              icon={ExclamationTriangleIcon}
            />
          </div>

          {/* Bouton Import */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={clearFile}
              className="px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={importMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {importMutation.isPending ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Import en cours… ({rows.length} lignes)
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-4 h-4" />
                  Lancer l'import ({rows.length} ligne
                  {rows.length > 1 ? 's' : ''})
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Résultat */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 space-y-4"
        >
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            {result.erreurs === 0 ? (
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            ) : (
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
            )}
            3. Résultat de l'import
          </h2>

          {/* Bannière statut */}
          <div
            className={`rounded-xl p-4 border ${
              result.erreurs === 0
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.erreurs === 0 ? (
                <CheckCircleIcon className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`font-semibold ${
                    result.erreurs === 0
                      ? 'text-emerald-800'
                      : 'text-amber-800'
                  }`}
                >
                  {result.erreurs === 0
                    ? `Import réussi : ${result.succes}/${result.totalLignes} élèves créés`
                    : `Import partiel : ${result.succes}/${result.totalLignes} réussies`}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    result.erreurs === 0
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {result.erreurs > 0 &&
                    `${result.erreurs} ligne(s) en erreur · `}
                  {result.warnings} avertissement(s)
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <ResultStat
              label="Élèves"
              value={result.elevesCrees}
              icon={UserGroupIcon}
              color="text-emerald-600"
              bgColor="bg-emerald-50"
            />
            <ResultStat
              label="Classes"
              value={result.classesCreees}
              icon={AcademicCapIcon}
              color="text-teal-600"
              bgColor="bg-teal-50"
            />
            <ResultStat
              label="Plans"
              value={result.plansCrees}
              icon={ReceiptPercentIcon}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <ResultStat
              label="Échéances"
              value={result.echeancesCreees}
              icon={CalendarDaysIcon}
              color="text-lime-600"
              bgColor="bg-lime-50"
            />
            <ResultStat
              label="Inscriptions"
              value={result.inscriptionsCreees}
              icon={AcademicCapIcon}
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
            <ResultStat
              label="Responsables"
              value={result.responsablesCrees}
              icon={UserGroupIcon}
              color="text-rose-600"
              bgColor="bg-rose-50"
            />
          </div>

          {/* Détails par ligne */}
          {(result.details.length > 0 || result.erreursDetaillees.length > 0) && (
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Détails par ligne
              </h3>
              <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                {result.details.map((d) => (
                  <div
                    key={`ok-${d.ligne}`}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-50/40 text-xs"
                  >
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-mono text-gray-500 w-10 shrink-0">
                      L.{d.ligne}
                    </span>
                    <span className="text-gray-900 font-medium truncate flex-1">
                      {d.eleve?.prenom} {d.eleve?.nom}
                    </span>
                    {d.eleve?.matricule && (
                      <span className="text-gray-500 font-mono">
                        {d.eleve.matricule}
                      </span>
                    )}
                    {d.warnings && d.warnings.length > 0 && (
                      <span className="text-amber-600 font-medium shrink-0">
                        {d.warnings.length} warning(s)
                      </span>
                    )}
                  </div>
                ))}
                {result.erreursDetaillees.map((e) => (
                  <div
                    key={`err-${e.ligne}`}
                    className="flex items-start gap-2 px-3 py-2 bg-red-50/60 text-xs"
                  >
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="font-mono text-gray-500 w-10 shrink-0">
                      L.{e.ligne}
                    </span>
                    <span className="text-red-700 flex-1 break-words">
                      {e.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions finales */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={clearFile}
              className="px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
            >
              Nouvel import
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/eleves')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
            >
              Voir les élèves
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════════════════

interface OptionToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const OptionToggle: React.FC<OptionToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
}) => (
  <label
    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
      checked
        ? 'bg-emerald-50 border-emerald-200'
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 w-4 h-4 text-emerald-600 rounded"
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
        <Icon
          className={`w-3.5 h-3.5 ${
            checked ? 'text-emerald-600' : 'text-gray-400'
          }`}
        />
        {label}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
  </label>
);

interface ResultStatProps {
  label: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
}

const ResultStat: React.FC<ResultStatProps> = ({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
}) => (
  <div className="bg-white rounded-xl border border-gray-100 p-3">
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
      <div className={`p-1.5 rounded-lg ${bgColor} shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
    </div>
  </div>
);

export default ImportElevesPage;