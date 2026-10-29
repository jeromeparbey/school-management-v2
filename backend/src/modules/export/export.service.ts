// backend/src/modules/import/export.service.ts

import ExcelJS from 'exceljs';
import { getTenantClient } from '../../config/tenant-db';
import { AppError } from '../../utils/AppError';
import {
  IMPORT_HEADERS,
  HEADER_DESCRIPTIONS,
} from '../import/import.excel.template';
import type {
  ExportElevesOptions,
  ExportFormat,
} from './export.types';

// ═══════════════════════════════════════════════════════════
// TYPES INTERNES
// ═══════════════════════════════════════════════════════════

export interface ExportContext {
  schemaName: string;
  etablissementId: string;
}

interface EcheanceLike {
  nom: string;
  montant: number;
  dateLimite: Date | string;
}

type RowData = Record<string, string>;

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function safe(v: unknown): string {
  if (v == null) return '';
  return String(v);
}

// ═══════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════

export class ExportService {
  async exportEleves(
    ctx: ExportContext,
    options: ExportElevesOptions = {},
    format: ExportFormat = 'xlsx'
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const client = await getClient(ctx.schemaName);

    const opts = {
      inclureArchives: options.inclureArchives ?? false,
      inclureIdentite: options.inclureIdentite ?? true,
      inclureClasse: options.inclureClasse ?? true,
      inclurePlan: options.inclurePlan ?? true,
      inclureEcheances: options.inclureEcheances ?? true,
      inclureResponsables: options.inclureResponsables ?? true,
      lignesVides: options.lignesVides ?? 20,
      limite: options.limite ?? 5000,
      classeId: options.classeId,
      anneeScolaireId: options.anneeScolaireId,
    };

    // ─── Récupération des élèves ───
    const where: any = {};
    if (!opts.inclureArchives) where.statut = { not: 'ARCHIVE' };

    if (opts.classeId || opts.anneeScolaireId) {
      where.inscriptions = {
        some: {
          estActive: true,
          ...(opts.classeId && { classeId: opts.classeId }),
          ...(opts.anneeScolaireId && {
            anneeScolaireId: opts.anneeScolaireId,
          }),
        },
      };
    }

    const eleves = await client.eleve.findMany({
      where,
      take: opts.limite,
      orderBy: [{ nom: 'asc' as const }, { prenom: 'asc' as const }],
      include: {
        inscriptions: {
          where: { estActive: true },
          include: {
            classe: {
              include: {
                niveau: { select: { code: true, nom: true } },
              },
            },
            anneeScolaire: true,
          },
          orderBy: { dateInscription: 'desc' as const },
          take: 1,
        },
        // ✅ CORRIGÉ : `responsables` (pluriel, relation array dans le schéma)
        responsables: {
          orderBy: [
            { estPrincipal: 'desc' as const },
            { createdAt: 'asc' as const },
          ],
          take: 1,
        },
        assignmentsScolarite: {
          where: { statut: { in: ['ACTIF', 'EN_RETARD'] } },
          orderBy: { createdAt: 'desc' as const },
          take: 1,
          include: {
            planScolarite: {
              include: {
                echeances: {
                  orderBy: { ordre: 'asc' as const },
                  take: 5,
                },
              },
            },
            anneeScolaire: true,
          },
        },
      },
    });

    // ─── Construction des lignes ───
    const rows: RowData[] = [];

    for (const eleve of eleves) {
      const inscription = eleve.inscriptions?.[0];
      const classe = inscription?.classe;
      const anneeScolaire = inscription?.anneeScolaire;
      const assignment = eleve.assignmentsScolarite?.[0];
      const plan = assignment?.planScolarite;

      // ✅ CORRIGÉ : responsables est un array, on prend le premier
      const responsable = eleve.responsables?.[0];

      const row: RowData = {};

      // ─── Identité ───
      if (opts.inclureIdentite) {
        row.prenom = safe(eleve.prenom);
        row.nom = safe(eleve.nom);
        row.sexe = safe(eleve.sexe);
        row.dateNaissance = formatDate(eleve.dateNaissance);
        row.lieuNaissance = safe(eleve.lieuNaissance);
        row.nationalite = safe(eleve.nationalite);
        row.adresse = safe(eleve.adresse);
        row.telephone = safe(eleve.telephone);
        row.email = safe(eleve.email);
        row.photo = safe(eleve.photo);
        row.infoMedicale = safe(eleve.infoMedicale);
        row.groupeSanguin = safe(eleve.groupeSanguin);
        row.allergies = safe(eleve.allergies);
      }

      // ─── Classe ───
      if (opts.inclureClasse && classe) {
        row.classeNom = safe(classe.nom);
        row.classeCode = safe(classe.code);
        row.classeCapacite = safe(classe.capacite);
        row.classeSalle = safe(classe.salle);
        row.niveauCode = safe(classe.niveau?.code);
        row.niveauNom = safe(classe.niveau?.nom);
      }

      // ─── Année scolaire ───
      if (opts.inclureClasse && anneeScolaire) {
        row.anneeScolaireNom = safe(anneeScolaire.nom);
        row.anneeScolaireDebut = formatDate(anneeScolaire.dateDebut);
        row.anneeScolaireFin = formatDate(anneeScolaire.dateFin);
      }

      // ─── Plan de scolarité ───
      if (opts.inclurePlan && plan) {
        row.planNom = safe(plan.nom);
        row.planFraisInscription = safe(plan.fraisInscription);
        row.planFraisScolarite = safe(plan.fraisScolarite);
        row.planDevise = safe(plan.devise);
      }

      // ─── Échéances (1 à 5) ───
      if (opts.inclureEcheances && plan?.echeances) {
        const echeances = plan.echeances as EcheanceLike[];
        echeances.forEach((ech: EcheanceLike, i: number) => {
          const n = i + 1;
          if (n > 5) return;
          row[`echeance${n}Nom`] = safe(ech.nom);
          row[`echeance${n}Montant`] = safe(ech.montant);
          row[`echeance${n}DateLimite`] = formatDate(ech.dateLimite);
        });
      }

      // ─── Responsable ───
      if (opts.inclureResponsables && responsable) {
        row.responsablePrenom = safe(responsable.prenom);
        row.responsableNom = safe(responsable.nom);
        row.responsableLien = safe(responsable.lien);
        row.responsableTelephone = safe(responsable.telephone);
        row.responsableEmail = safe(responsable.email);
        row.responsableProfession = safe(responsable.profession);
      }

      rows.push(row);
    }

    // ─── Lignes vides ───
    const emptyRow: RowData = {};
    IMPORT_HEADERS.forEach((h: string) => {
      emptyRow[h] = '';
    });
    for (let i = 0; i < opts.lignesVides; i++) {
      rows.push({ ...emptyRow });
    }

    // ─── Génération du fichier ───
    const date = new Date().toISOString().slice(0, 10);
    const filename = `eleves-export-${date}.${format}`;

    if (format === 'csv') {
      const csv = this.buildCsv(rows);
      return {
        buffer: Buffer.from(csv, 'utf-8'),
        filename,
        mimeType: 'text/csv; charset=utf-8',
      };
    }

    const buffer = await this.buildXlsx(rows);
    return {
      buffer,
      filename,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  // ═══════════════════════════════════════════════════════════
  // CSV
  // ═══════════════════════════════════════════════════════════

  private buildCsv(rows: RowData[]): string {
    const SEP = ';';

    const escape = (v: unknown): string => {
      const s = v == null ? '' : String(v);
      if (
        s.includes(SEP) ||
        s.includes('"') ||
        s.includes('\n') ||
        s.includes('\r')
      ) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines = [
      IMPORT_HEADERS.map((h: string) => escape(h)).join(SEP),
      ...rows.map((row: RowData) =>
        IMPORT_HEADERS.map((h: string) => escape(row[h] ?? '')).join(SEP)
      ),
    ];

    return '\uFEFF' + lines.join('\r\n') + '\r\n';
  }

  // ═══════════════════════════════════════════════════════════
  // XLSX
  // ═══════════════════════════════════════════════════════════

  private async buildXlsx(rows: RowData[]): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'School Management';
    wb.created = new Date();

    // ═══ Feuille 1 : Élèves ═══
    const sheet = wb.addWorksheet('Élèves', {
      views: [{ state: 'frozen', ySplit: 1 }],
      properties: { defaultRowHeight: 20 },
    });

    sheet.columns = IMPORT_HEADERS.map((h: string) => ({
      header: h,
      key: h,
      width: Math.max(h.length + 4, 14),
    }));

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 24;

    rows.forEach((row: RowData, idx: number) => {
      const added = sheet.addRow(row);
      if (idx % 2 === 1) {
        added.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        };
      }
    });

    // ═══ Feuille 2 : Guide ═══
    const guideSheet = wb.addWorksheet('Guide');
    guideSheet.columns = [
      { header: 'Colonne', key: 'colonne', width: 25 },
      { header: 'Obligatoire', key: 'obligatoire', width: 12 },
      { header: 'Description', key: 'description', width: 55 },
      { header: 'Exemple', key: 'exemple', width: 25 },
    ];

    const guideHeader = guideSheet.getRow(1);
    guideHeader.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    guideHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' },
    };
    guideHeader.alignment = { vertical: 'middle', horizontal: 'center' };
    guideHeader.height = 24;

    IMPORT_HEADERS.forEach((h: string) => {
      const info = HEADER_DESCRIPTIONS[h as keyof typeof HEADER_DESCRIPTIONS];
      if (!info) return;
      const row = guideSheet.addRow({
        colonne: h,
        obligatoire: info.obligatoire ? '✅ Oui' : 'Non',
        description: info.description,
        exemple: info.exemple,
      });
      if (info.obligatoire) row.font = { bold: true };
    });

    // ═══ Feuille 3 : À propos ═══
    const infoSheet = wb.addWorksheet('À propos');
    infoSheet.columns = [{ key: 'ligne', width: 100 }];
    const infoLines: string[] = [
      '📤 EXPORT DES ÉLÈVES — School Management',
      '',
      `Date d'export : ${new Date().toLocaleString('fr-FR')}`,
      `Nombre d'élèves exportés : ${rows.length}`,
      '',
      '⚠️ CE FICHIER EST RÉ-IMPORTABLE TEL QUEL',
      '',
      'Comment ré-importer :',
      '  1. Modifiez ou ajoutez des lignes dans l\'onglet "Élèves"',
      '  2. Ne changez PAS les en-têtes de colonnes',
      '  3. Enregistrez au format .xlsx ou .csv',
      '  4. Allez dans "Import élèves" et chargez ce fichier',
      '',
      'Les colonnes vides à la fin peuvent être remplies',
      'pour ajouter de nouveaux élèves.',
      '',
      'Support : consultez l\'onglet "Guide" pour la description',
      'de chaque colonne.',
    ];
    infoLines.forEach((line: string) => infoSheet.addRow({ ligne: line }));

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

export const exportService = new ExportService();