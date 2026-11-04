// backend/src/modules/recu/recu-pdf.service.ts

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

type FormatImpression = 'A4' | 'A5' | '80MM';

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────

type EcheanceType = 'FRAIS_INSCRIPTION' | 'SCOLARITE' | 'AUTRE_FRAIS';

type EcheanceItem = {
  echeanceId: string;
  nom: string;
  ordre: number;
  montant: number;
  montantPaye: number;
  montantPayeApres: number;
  montantRestant: number;
  dateLimite: string;
  estPayee: boolean;
  estPartielle: boolean;
  estEnRetard: boolean;
  joursRestants: number;
  type?: EcheanceType; // 🆕 optionnel
};

interface DetailsFinanciers {
  planNom?: string;
  montantTotalPlan?: number;
  montantReduction?: number;
  montantNet?: number;
  devise?: string;
  montantPayeAvant?: number;
  montantRestantAvant?: number;
  montantPayeApres?: number;
  montantRestantApres?: number;
  pourcentagePaye?: number;
  estSolde?: boolean;
  estAJour?: boolean;
  estEnRetard?: boolean;
  echeancesEnRetard?: number;
  prochaineEcheance?: {
    nom: string;
    montant: number;
    dateLimite: string;
    joursRestants: number;
  } | null;
  echeances?: EcheanceItem[];
}

interface RecuData {
  numeroRecu: string;
  etablissementNom: string;
  etablissementLogo: string | null;
  etablissementAdresse: string | null;
  etablissementVille: string | null;
  etablissementPays: string | null;
  etablissementTelephone: string | null;
  etablissementEmail: string | null;
  etablissementSiteWeb: string | null;
  etablissementCode: string;
  etablissementAgrement: string | null;
  etablissementDevise: string;
  eleveMatricule: string;
  elevePrenom: string;
  eleveNom: string;
  nomEleve: string;
  nomClasse: string;
  classeCode: string | null;
  niveauNom: string | null;
  anneeScolaireNom: string | null;
  montantPaye: number;
  montantReduction: number;
  montantRestant: number;
  devise: string;
  moyenPaiementLabel: string;
  referencePaiement: string;
  datePaiement: Date;
  echeancesCouvertes: unknown[];
  codeVerification: string;
  urlVerification: string | null;
  generateur: { prenom: string; nom: string };
  detailsFinanciers?: DetailsFinanciers | null;
}

// ──────────────────────────────────────────
// CONTEXTE INTERNE
// ──────────────────────────────────────────

interface PdfContext {
  doc: PDFKit.PDFDocument;
  recu: RecuData;
  config: (typeof FORMAT_CONFIG)[FormatImpression];
  contentX: number;
  contentW: number;
  devise: string;
}

// ──────────────────────────────────────────
// CONFIG FORMATS
// ──────────────────────────────────────────

const FORMAT_CONFIG = {
  A4: {
    width: 595.28,
    height: 841.89,
    margin: 40,
    fontSize: { title: 22, h1: 14, h2: 10, h3: 9, body: 9, small: 7.5 },
    isThermique: false,
    footerHeight: 50,
    rowHeight: 20,
  },
  A5: {
    width: 419.53,
    height: 595.28,
    margin: 26,
    fontSize: { title: 16, h1: 11, h2: 8.5, h3: 8, body: 8, small: 6.5 },
    isThermique: false,
    footerHeight: 42,
    rowHeight: 16,
  },
  '80MM': {
    width: 226.77,
    height: 1200,
    margin: 8,
    fontSize: { title: 12, h1: 10, h2: 8, h3: 7.5, body: 7, small: 6 },
    isThermique: true,
    footerHeight: 0,
    rowHeight: 14,
  },
} as const;

// ──────────────────────────────────────────
// COULEURS
// ──────────────────────────────────────────

const COLORS = {
  primary: '#1e40af',
  primaryLight: '#dbeafe',
  success: '#059669',
  successLight: '#d1fae5',
  warning: '#d97706',
  warningLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  info: '#0369a1',
  infoLight: '#e0f2fe',
  text: '#111827',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  bgLight: '#f9fafb',
  white: '#ffffff',
};

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

/**
 * ✅ FIX #1 : Remplace l'espace fine insécable (U+202F) produite par
 * Intl.NumberFormat('fr-FR') par une espace normale, sinon pdfkit
 * affiche "/" à la place.
 */
const fmtMoney = (amount: number, devise: string): string => {
  const raw = new Intl.NumberFormat('fr-FR').format(Math.round(amount));
  const value = raw.replace(/[\u202F\u00A0]/g, ' ');
  const upper = (devise || '').toUpperCase();

  if (upper === 'XOF' || upper === 'XAF') return `${value} F CFA`;
  if (upper === 'EUR') return `${value} €`;
  if (upper === 'USD') return `${value} $`;
  if (upper === 'GBP') return `${value} £`;
  if (upper === 'MAD') return `${value} DH`;
  if (upper === 'NGN') return `${value} ₦`;
  if (upper === 'GHS') return `${value} GH₵`;
  if (upper === 'CAD') return `${value} $ CA`;

  return devise ? `${value} ${devise}` : `${value} F CFA`;
};

const resolveDevise = (recu: RecuData): string =>
  recu.detailsFinanciers?.devise ||
  recu.devise ||
  recu.etablissementDevise ||
  'F CFA';

const fmtDate = (date: Date | string): string =>
  new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const fmtDateTime = (date: Date | string): string =>
  new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const truncate = (text: string, maxChars: number): string =>
  text.length <= maxChars ? text : text.slice(0, maxChars - 1) + '…';

/**
 * ✅ FIX #3 : Détermine si une échéance est de type inscription,
 * scolarité ou autre frais — pour les séparer dans le tableau.
 */
const classifyEcheance = (
  e: EcheanceItem,
  autresFraisLibelles: string[]
): EcheanceType => {
  if (e.type === 'FRAIS_INSCRIPTION') return 'FRAIS_INSCRIPTION';
  if (e.type === 'AUTRE_FRAIS') return 'AUTRE_FRAIS';
  if (e.type === 'SCOLARITE') return 'SCOLARITE';

  const nomLower = (e.nom ?? '').toLowerCase().trim();

  if (nomLower.includes('inscription') || e.ordre === 0) {
    return 'FRAIS_INSCRIPTION';
  }

  if (autresFraisLibelles.some((l) => nomLower.includes(l))) {
    return 'AUTRE_FRAIS';
  }

  return 'SCOLARITE';
};

// ──────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────

export class RecuPDFService {
  async genererPDF(
    recu: RecuData,
    format: FormatImpression,
    outputDir: string
  ): Promise<string> {
    const config = FORMAT_CONFIG[format];

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `${recu.numeroRecu}-${format}.pdf`;
    const filePath = path.join(outputDir, fileName);

    return new Promise<string>((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: [config.width, config.height],
          margin: 0,
          autoFirstPage: true,
          bufferPages: true,
          info: {
            Title: `Reçu ${recu.numeroRecu}`,
            Author: recu.etablissementNom,
            Subject: `Reçu de paiement - ${recu.nomEleve}`,
            Keywords: `reçu, paiement, ${recu.numeroRecu}`,
            Creator: 'School Management API',
          },
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        const ctx: PdfContext = {
          doc,
          recu,
          config,
          contentX: config.margin,
          contentW: config.width - config.margin * 2,
          devise: resolveDevise(recu),
        };

        doc.y = config.margin;

        this.drawHeader(ctx);
        this.drawTitleBlock(ctx);
        this.drawEleveBlock(ctx);
        this.drawPaiementBlock(ctx);
        this.drawFinancierBlock(ctx);
        this.drawEcheancesTable(ctx);
        this.drawProchaineEcheance(ctx);
        this.drawFootersOnAllPages(ctx);

        doc.end();
        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  // ══════════════════════════════════════════
  // UTILITAIRES DE MISE EN PAGE
  // ══════════════════════════════════════════

  private ensureSpace(ctx: PdfContext, needed: number): void {
    const { doc, config } = ctx;
    const bottomLimit = config.height - config.margin - config.footerHeight;
    if (doc.y + needed > bottomLimit) {
      doc.addPage({ size: [config.width, config.height], margin: 0 });
      doc.y = config.margin;
      if (!config.isThermique) {
        doc
          .fontSize(config.fontSize.small)
          .font('Helvetica-Bold')
          .fillColor(COLORS.primary)
          .text(
            `${ctx.recu.etablissementNom} · Reçu N° ${ctx.recu.numeroRecu} (suite)`,
            config.margin,
            config.margin,
            { width: ctx.contentW, align: 'right' }
          );
        doc
          .strokeColor(COLORS.border)
          .lineWidth(0.5)
          .moveTo(config.margin, doc.y + 2)
          .lineTo(config.width - config.margin, doc.y + 2)
          .stroke();
        doc.y += 10;
      }
    }
  }

  private sectionTitle(ctx: PdfContext, title: string): void {
    const { doc, config, contentX, contentW } = ctx;
    this.ensureSpace(ctx, 24);

    doc
      .fontSize(config.fontSize.h2)
      .font('Helvetica-Bold')
      .fillColor(COLORS.primary)
      .text(title, contentX, doc.y, { width: contentW });

    doc.moveDown(0.15);
    doc
      .strokeColor(COLORS.primary)
      .lineWidth(0.6)
      .moveTo(contentX, doc.y)
      .lineTo(contentX + contentW, doc.y)
      .stroke();
    doc.moveDown(0.4);
  }

  private fieldRow(
    ctx: PdfContext,
    label: string,
    value: string,
    x: number,
    y: number,
    w: number
  ): void {
    const { doc, config } = ctx;
    const labelW = Math.min(80, w * 0.45);

    doc
      .fontSize(config.fontSize.body)
      .font('Helvetica-Bold')
      .fillColor(COLORS.textMuted)
      .text(label, x, y, { width: labelW, lineBreak: false });

    doc
      .font('Helvetica')
      .fillColor(COLORS.text)
      .text(value, x + labelW + 4, y, {
        width: w - labelW - 4,
        lineBreak: false,
        ellipsis: true,
      });
  }

  // ══════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════

  private drawHeader(ctx: PdfContext): void {
    const { doc, recu, config, contentX, contentW } = ctx;

    if (config.isThermique) {
      let y = config.margin;
      doc
        .fontSize(config.fontSize.h1)
        .font('Helvetica-Bold')
        .fillColor(COLORS.primary)
        .text(recu.etablissementNom, contentX, y, {
          width: contentW,
          align: 'center',
        });
      y = doc.y + 2;

      const adresse = [recu.etablissementAdresse, recu.etablissementVille]
        .filter((v): v is string => Boolean(v))
        .join(', ');
      if (adresse) {
        doc
          .fontSize(config.fontSize.small)
          .font('Helvetica')
          .fillColor(COLORS.textMuted)
          .text(adresse, contentX, y, { width: contentW, align: 'center' });
        y = doc.y + 1;
      }
      if (recu.etablissementTelephone) {
        doc
          .fontSize(config.fontSize.small)
          .fillColor(COLORS.textMuted)
          .text(`Tél : ${recu.etablissementTelephone}`, contentX, y, {
            width: contentW,
            align: 'center',
          });
        y = doc.y + 1;
      }

      doc.y = y + 6;
      return;
    }

    const headerH = 90;
    const headerY = config.margin;

    doc
      .rect(contentX, headerY, contentW, headerH)
      .fill(COLORS.primaryLight)
      .stroke(COLORS.primary);

    let textX = contentX + 12;
    const logoSize = 54;
    if (recu.etablissementLogo) {
      try {
        const logoPath = path.join(
          process.cwd(),
          'uploads',
          recu.etablissementLogo.replace(/^\/uploads\//, '')
        );
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, contentX + 10, headerY + 12, {
            fit: [logoSize, logoSize],
          });
          textX = contentX + 10 + logoSize + 14;
        }
      } catch {
        /* ignore */
      }
    }

    const textW = contentX + contentW - textX - 12;
    let y = headerY + 12;

    doc
      .fontSize(config.fontSize.title)
      .font('Helvetica-Bold')
      .fillColor(COLORS.primary)
      .text(recu.etablissementNom, textX, y, {
        width: textW,
        lineBreak: false,
        ellipsis: true,
      });
    y += 24;

    const adresse = [
      recu.etablissementAdresse,
      recu.etablissementVille,
      recu.etablissementPays,
    ]
      .filter((v): v is string => Boolean(v))
      .join(', ');
    if (adresse) {
      doc
        .fontSize(config.fontSize.small)
        .font('Helvetica')
        .fillColor(COLORS.textMuted)
        .text(adresse, textX, y, {
          width: textW,
          lineBreak: false,
          ellipsis: true,
        });
      y += 12;
    }

    const contacts = [
      recu.etablissementTelephone,
      recu.etablissementEmail,
      recu.etablissementSiteWeb,
    ]
      .filter((v): v is string => Boolean(v))
      .join('   ·   ');
    if (contacts) {
      doc
        .fontSize(config.fontSize.small)
        .fillColor(COLORS.textMuted)
        .text(contacts, textX, y, {
          width: textW,
          lineBreak: false,
          ellipsis: true,
        });
      y += 12;
    }

    if (recu.etablissementAgrement || recu.etablissementCode) {
      doc
        .fontSize(config.fontSize.small - 0.5)
        .fillColor(COLORS.textMuted)
        .text(
          `${
            recu.etablissementAgrement
              ? `Agrément : ${recu.etablissementAgrement}  ·  `
              : ''
          }Code : ${recu.etablissementCode}`,
          textX,
          y,
          { width: textW, lineBreak: false, ellipsis: true }
        );
    }

    doc.y = headerY + headerH + 14;
  }

  // ══════════════════════════════════════════
  // TITRE
  // ══════════════════════════════════════════

  private drawTitleBlock(ctx: PdfContext): void {
    const { doc, recu, config, contentX, contentW } = ctx;

    this.ensureSpace(ctx, 70);

    doc
      .fontSize(
        config.isThermique ? config.fontSize.h1 : config.fontSize.title
      )
      .font('Helvetica-Bold')
      .fillColor(COLORS.text)
      .text('REÇU DE PAIEMENT', contentX, doc.y, {
        width: contentW,
        align: 'center',
      });
    doc.moveDown(0.25);

    doc
      .fontSize(config.fontSize.h1)
      .font('Helvetica-Bold')
      .fillColor(COLORS.primary)
      .text(`N° ${recu.numeroRecu}`, contentX, doc.y, {
        width: contentW,
        align: 'center',
      });
    doc.moveDown(0.2);

    doc
      .fontSize(config.fontSize.small)
      .font('Helvetica')
      .fillColor(COLORS.textMuted)
      .text(`Émis le ${fmtDateTime(recu.datePaiement)}`, contentX, doc.y, {
        width: contentW,
        align: 'center',
      });

    doc.moveDown(0.6);
    doc
      .strokeColor(COLORS.border)
      .lineWidth(1)
      .moveTo(contentX, doc.y)
      .lineTo(contentX + contentW, doc.y)
      .stroke();
    doc.moveDown(0.8);
  }

  // ══════════════════════════════════════════
  // BLOC ÉLÈVE
  // ══════════════════════════════════════════

  private drawEleveBlock(ctx: PdfContext): void {
    const { doc, recu, config, contentX, contentW, devise } = ctx;

    this.sectionTitle(ctx, 'ÉLÈVE');

    if (config.isThermique) {
      const rows: Array<[string, string]> = [
        ['Matricule', recu.eleveMatricule],
        ['Nom', recu.nomEleve],
        ['Classe', recu.nomClasse],
        ['Année', recu.anneeScolaireNom ?? '—'],
      ];
      this.ensureSpace(ctx, rows.length * config.rowHeight + 6);
      rows.forEach(([label, value]: [string, string]) => {
        const y = doc.y;
        this.fieldRow(ctx, label, value, contentX, y, contentW);
        doc.y = y + config.rowHeight;
      });
    } else {
      const colW = (contentW - 12) / 2;
      const leftX = contentX;
      const rightX = contentX + colW + 12;
      const rowH = 18;
      const startY = doc.y;

      this.ensureSpace(ctx, rowH * 3 + 8);

      const left: Array<[string, string]> = [
        ['Matricule', recu.eleveMatricule],
        ['Nom complet', recu.nomEleve],
        [
          'Classe',
          recu.classeCode
            ? `${recu.nomClasse} (${recu.classeCode})`
            : recu.nomClasse,
        ],
      ];
      const right: Array<[string, string]> = [
        ['Niveau', recu.niveauNom ?? '—'],
        ['Année scolaire', recu.anneeScolaireNom ?? '—'],
        ['Devise', devise],
      ];

      left.forEach((item: [string, string], i: number) => {
        this.fieldRow(ctx, item[0], item[1], leftX, startY + i * rowH, colW);
      });
      right.forEach((item: [string, string], i: number) => {
        this.fieldRow(ctx, item[0], item[1], rightX, startY + i * rowH, colW);
      });

      doc.y = startY + rowH * 3;
    }

    doc.moveDown(0.7);
  }

  // ══════════════════════════════════════════
  // BLOC PAIEMENT
  // ══════════════════════════════════════════

  private drawPaiementBlock(ctx: PdfContext): void {
    const { doc, recu, config, contentX, contentW } = ctx;

    this.sectionTitle(ctx, 'DÉTAILS DU PAIEMENT');

    if (config.isThermique) {
      const rows: Array<[string, string]> = [
        ['Date', fmtDateTime(recu.datePaiement)],
        ['Moyen', recu.moyenPaiementLabel],
        ['Référence', recu.referencePaiement],
        ['Caissier', `${recu.generateur.prenom} ${recu.generateur.nom}`],
      ];
      this.ensureSpace(ctx, rows.length * config.rowHeight + 6);
      rows.forEach(([label, value]: [string, string]) => {
        const y = doc.y;
        this.fieldRow(ctx, label, value, contentX, y, contentW);
        doc.y = y + config.rowHeight;
      });
    } else {
      const colW = (contentW - 12) / 2;
      const leftX = contentX;
      const rightX = contentX + colW + 12;
      const rowH = 18;
      const startY = doc.y;

      this.ensureSpace(ctx, rowH * 2 + 8);

      const left: Array<[string, string]> = [
        ['Date & heure', fmtDateTime(recu.datePaiement)],
        ['Moyen', recu.moyenPaiementLabel],
      ];
      const right: Array<[string, string]> = [
        ['Référence', recu.referencePaiement],
        ['Caissier', `${recu.generateur.prenom} ${recu.generateur.nom}`],
      ];

      left.forEach((item: [string, string], i: number) => {
        this.fieldRow(ctx, item[0], item[1], leftX, startY + i * rowH, colW);
      });
      right.forEach((item: [string, string], i: number) => {
        this.fieldRow(ctx, item[0], item[1], rightX, startY + i * rowH, colW);
      });

      doc.y = startY + rowH * 2;
    }

    doc.moveDown(0.7);
  }

  // ══════════════════════════════════════════
  // BLOC FINANCIER
  // ══════════════════════════════════════════

  private drawFinancierBlock(ctx: PdfContext): void {
    const { doc, recu, config, contentX, contentW, devise } = ctx;
    const details = recu.detailsFinanciers;

    this.sectionTitle(ctx, 'DÉTAILS FINANCIERS');

    const bandH = config.isThermique ? 42 : 56;
    this.ensureSpace(ctx, bandH + 8);
    const bandY = doc.y;

    doc
      .rect(contentX, bandY, contentW, bandH)
      .fill(COLORS.successLight)
      .stroke(COLORS.success);

    doc
      .fontSize(
        config.isThermique ? config.fontSize.h1 : config.fontSize.title - 4
      )
      .font('Helvetica-Bold')
      .fillColor(COLORS.success)
      .text(fmtMoney(recu.montantPaye, devise), contentX, bandY + 10, {
        width: contentW,
        align: 'center',
        lineBreak: false,
      });

    doc
      .fontSize(config.fontSize.small)
      .font('Helvetica')
      .fillColor(COLORS.success)
      .text('MONTANT PAYÉ', contentX, bandY + bandH - 16, {
        width: contentW,
        align: 'center',
        lineBreak: false,
      });

    doc.y = bandY + bandH + 10;

    const rows: Array<[string, string, string?]> = [];
    if (details?.montantTotalPlan != null) {
      rows.push([
        'Total du plan',
        fmtMoney(details.montantTotalPlan, devise),
      ]);
    }
    if (recu.montantReduction > 0) {
      rows.push([
        'Réduction appliquée',
        `- ${fmtMoney(recu.montantReduction, devise)}`,
        'warning',
      ]);
    }
    if (details?.montantPayeApres != null) {
      rows.push([
        'Total payé (cumulé)',
        fmtMoney(details.montantPayeApres, devise),
        'success',
      ]);
    }
    rows.push([
      'Solde restant',
      fmtMoney(recu.montantRestant, devise),
      recu.montantRestant <= 0.01 ? 'success' : 'danger',
    ]);
    if (details?.pourcentagePaye != null) {
      rows.push(['Progression', `${details.pourcentagePaye}%`]);
    }

    this.drawSimpleTable(ctx, rows);
    this.drawStatutBadge(ctx);
  }

  // ══════════════════════════════════════════
  // ✅ TABLEAU ÉCHÉANCES (corrigé & séparé)
  // ══════════════════════════════════════════

  private drawEcheancesTable(ctx: PdfContext): void {
    const { doc, recu, config, contentX, contentW, devise } = ctx;
    const echeances = recu.detailsFinanciers?.echeances;
    if (!echeances || echeances.length === 0) return;

    // 🔥 Classification des échéances
    const autresFraisLibelles = echeances
      .filter((e) => e.type === 'AUTRE_FRAIS')
      .map((e) => (e.nom ?? '').toLowerCase().trim());

    const classifiees = echeances.map((e) => ({
      ...e,
      type: classifyEcheance(e, autresFraisLibelles),
    }));

    const inscription = classifiees.filter(
      (e) => e.type === 'FRAIS_INSCRIPTION'
    );
    const scolarite = classifiees.filter((e) => e.type === 'SCOLARITE');
    const autresFrais = classifiees.filter((e) => e.type === 'AUTRE_FRAIS');

    // Total global (utilise les montants backend si dispo)
    const totalDu =
      recu.detailsFinanciers?.montantTotalPlan ??
      classifiees.reduce((s, e) => s + e.montant, 0);
    const totalPaye =
      recu.detailsFinanciers?.montantPayeApres ??
      classifiees.reduce((s, e) => s + e.montantPayeApres, 0);
    const totalReste =
      recu.detailsFinanciers?.montantRestantApres ??
      Math.max(0, totalDu - totalPaye);

    // ── AFFICHAGE 3 BLOCS SÉPARÉS ──
    const renderSection = (
      titre: string,
      items: EcheanceItem[]
    ) => {
      if (items.length === 0) return;

      this.sectionTitle(ctx, titre);

      const list: EcheanceItem[] = items;

      if (config.isThermique) {
        // Format thermique
        for (const e of list) {
          const blockH = config.rowHeight * 3 + 4;
          this.ensureSpace(ctx, blockH);
          const y0 = doc.y;

          doc
            .fontSize(config.fontSize.body)
            .font('Helvetica-Bold')
            .fillColor(COLORS.text)
            .text(truncate(`${e.ordre}. ${e.nom}`, 32), contentX, y0, {
              width: contentW,
              lineBreak: false,
              ellipsis: true,
            });

          doc
            .fontSize(config.fontSize.small)
            .font('Helvetica')
            .fillColor(COLORS.textMuted)
            .text(
              `Dû : ${fmtMoney(e.montant, devise)}   Payé : ${fmtMoney(
                e.montantPayeApres,
                devise
              )}`,
              contentX,
              y0 + config.rowHeight,
              { width: contentW, lineBreak: false }
            );

          const statutLabel = this.getEcheanceStatutLabel(e);
          const statutColor = this.getStatutColor(e);
          doc
            .fontSize(config.fontSize.small)
            .fillColor(statutColor)
            .text(
              e.montantRestant > 0.01
                ? `${statutLabel} · Reste ${fmtMoney(e.montantRestant, devise)}`
                : statutLabel,
              contentX,
              y0 + config.rowHeight * 2,
              { width: contentW, lineBreak: false, ellipsis: true }
            );

          doc.y = y0 + blockH;
          doc
            .strokeColor(COLORS.border)
            .lineWidth(0.3)
            .moveTo(contentX, doc.y)
            .lineTo(contentX + contentW, doc.y)
            .stroke();
          doc.y += 4;
        }

        // Sous-total
        this.ensureSpace(ctx, 18);
        const sDu = list.reduce((s, e) => s + e.montant, 0);
        const sPaye = list.reduce((s, e) => s + e.montantPayeApres, 0);
        const sReste = list.reduce((s, e) => s + e.montantRestant, 0);
        doc
          .fontSize(config.fontSize.small)
          .font('Helvetica-Bold')
          .fillColor(COLORS.text)
          .text(
            `Sous-total · Dû ${fmtMoney(sDu, devise)} · Payé ${fmtMoney(
              sPaye,
              devise
            )} · Reste ${fmtMoney(sReste, devise)}`,
            contentX,
            doc.y,
            { width: contentW, align: 'right', lineBreak: false }
          );
        doc.moveDown(0.6);
        return;
      }

      // Format A4/A5
      const headerH = 22;
      const rowH = config.rowHeight;
      const cols = [
        { key: 'ordre', label: '#', width: 24, align: 'center' as const },
        { key: 'nom', label: 'Échéance', width: 0, align: 'left' as const },
        {
          key: 'montant',
          label: 'Montant',
          width: 72,
          align: 'right' as const,
        },
        { key: 'paye', label: 'Payé', width: 72, align: 'right' as const },
        { key: 'reste', label: 'Reste', width: 72, align: 'right' as const },
        { key: 'statut', label: 'Statut', width: 66, align: 'center' as const },
      ];
      const fixed = cols
        .filter((c) => c.width > 0)
        .reduce((s, c) => s + c.width, 0);
      cols[1].width = contentW - fixed;

      this.ensureSpace(ctx, headerH + rowH * Math.min(list.length, 4) + 30);

      const headerY = doc.y;
      doc.rect(contentX, headerY, contentW, headerH).fill(COLORS.primary);
      let cx = contentX;
      doc
        .fillColor(COLORS.white)
        .fontSize(config.fontSize.small)
        .font('Helvetica-Bold');
      cols.forEach((col) => {
        doc.text(col.label, cx + 4, headerY + 7, {
          width: col.width - 8,
          align: col.align,
          lineBreak: false,
        });
        cx += col.width;
      });
      doc.y = headerY + headerH;

      list.forEach((e: EcheanceItem, idx: number) => {
        if (
          doc.y + rowH >
          config.height - config.margin - config.footerHeight - 20
        ) {
          doc.addPage({ size: [config.width, config.height], margin: 0 });
          doc.y = config.margin;
          doc
            .fontSize(config.fontSize.small)
            .font('Helvetica-Bold')
            .fillColor(COLORS.primary)
            .text(
              `${recu.etablissementNom} · Reçu N° ${recu.numeroRecu} (suite)`,
              config.margin,
              config.margin,
              { width: contentW, align: 'right' }
            );
          doc.y += 12;
          const newHeaderY = doc.y;
          doc
            .rect(contentX, newHeaderY, contentW, headerH)
            .fill(COLORS.primary);
          let chx = contentX;
          doc
            .fillColor(COLORS.white)
            .fontSize(config.fontSize.small)
            .font('Helvetica-Bold');
          cols.forEach((col) => {
            doc.text(col.label, chx + 4, newHeaderY + 7, {
              width: col.width - 8,
              align: col.align,
              lineBreak: false,
            });
            chx += col.width;
          });
          doc.y = newHeaderY + headerH;
        }

        const rowY = doc.y;
        const bg = idx % 2 === 0 ? COLORS.white : COLORS.bgLight;
        doc
          .rect(contentX, rowY, contentW, rowH)
          .fill(bg)
          .stroke(COLORS.border)
          .lineWidth(0.3);

        const statutLabel = this.getEcheanceStatutLabel(e);
        const statutColor = this.getStatutColor(e);
        const values = [
          String(e.ordre),
          e.nom,
          fmtMoney(e.montant, devise),
          fmtMoney(e.montantPayeApres, devise),
          fmtMoney(e.montantRestant, devise),
          statutLabel,
        ];

        let cellX = contentX;
        cols.forEach((col, ci: number) => {
          const isStatut = ci === 5;
          doc
            .fontSize(config.fontSize.small)
            .font(isStatut ? 'Helvetica-Bold' : 'Helvetica')
            .fillColor(isStatut ? statutColor : COLORS.text)
            .text(values[ci], cellX + 4, rowY + 5, {
              width: col.width - 8,
              align: col.align,
              lineBreak: false,
              ellipsis: true,
            });
          cellX += col.width;
        });

        doc.y = rowY + rowH;
      });

      // Sous-total par section
      doc.y += 4;
      const sDu = list.reduce((s, e) => s + e.montant, 0);
      const sPaye = list.reduce((s, e) => s + e.montantPayeApres, 0);
      const sReste = list.reduce((s, e) => s + e.montantRestant, 0);
      doc
        .fontSize(config.fontSize.small)
        .font('Helvetica-Bold')
        .fillColor(COLORS.text)
        .text(
          `Sous-total · Dû : ${fmtMoney(sDu, devise)}   ·   Payé : ${fmtMoney(
            sPaye,
            devise
          )}   ·   Reste : ${fmtMoney(sReste, devise)}`,
          contentX,
          doc.y,
          { width: contentW, align: 'right', lineBreak: false }
        );

      doc.moveDown(0.7);
    };

    // Afficher les 3 sections
    renderSection("FRAIS D'INSCRIPTION", inscription);
    renderSection('FRAIS DE SCOLARITÉ', scolarite);

    // Autres frais : un bloc par libellé
    if (autresFrais.length > 0) {
      const groups = autresFrais.reduce(
        (acc, e) => {
          const key = e.nom;
          if (!acc[key]) acc[key] = [];
          acc[key].push(e);
          return acc;
        },
        {} as Record<string, EcheanceItem[]>
      );

      Object.entries(groups).forEach(([libelle, items]) => {
        renderSection(`AUTRE FRAIS — ${libelle.toUpperCase()}`, items);
      });
    }

    // ── TOTAL GÉNÉRAL ──
    this.ensureSpace(ctx, 24);
    doc
      .fontSize(config.fontSize.h3)
      .font('Helvetica-Bold')
      .fillColor(COLORS.primary)
      .text(
        `TOTAL GÉNÉRAL · Dû : ${fmtMoney(totalDu, devise)}   ·   Payé : ${fmtMoney(
          totalPaye,
          devise
        )}   ·   Reste : ${fmtMoney(totalReste, devise)}`,
        contentX,
        doc.y,
        { width: contentW, align: 'center', lineBreak: false }
      );

    doc.moveDown(0.8);
  }

  // ══════════════════════════════════════════
  // PROCHAINE ÉCHÉANCE
  // ══════════════════════════════════════════

  private drawProchaineEcheance(ctx: PdfContext): void {
    const { doc, recu, config, contentX, contentW, devise } = ctx;
    const prochaine = recu.detailsFinanciers?.prochaineEcheance;
    if (!prochaine) return;

    const isEnRetard = prochaine.joursRestants < 0;
    const bg = isEnRetard ? COLORS.dangerLight : COLORS.infoLight;
    const border = isEnRetard ? COLORS.danger : COLORS.info;
    const fg = isEnRetard ? COLORS.danger : COLORS.info;

    const boxH = config.isThermique ? 48 : 60;
    this.ensureSpace(ctx, boxH + 8);
    const boxY = doc.y;

    doc.rect(contentX, boxY, contentW, boxH).fill(bg).stroke(border);

    doc
      .fontSize(config.fontSize.small)
      .font('Helvetica-Bold')
      .fillColor(fg)
      .text(
        isEnRetard ? 'PROCHAINE ÉCHÉANCE EN RETARD' : 'PROCHAINE ÉCHÉANCE',
        contentX + 10,
        boxY + 8,
        { width: contentW - 20, lineBreak: false }
      );

    doc
      .fontSize(config.fontSize.h3)
      .font('Helvetica-Bold')
      .fillColor(COLORS.text)
      .text(truncate(prochaine.nom, 40), contentX + 10, boxY + 22, {
        width: contentW - 20,
        lineBreak: false,
        ellipsis: true,
      });

    const joursLabel =
      prochaine.joursRestants === 0
        ? "Aujourd'hui"
        : prochaine.joursRestants < 0
        ? `${Math.abs(prochaine.joursRestants)}j de retard`
        : `Dans ${prochaine.joursRestants}j`;

    doc
      .fontSize(config.fontSize.small)
      .font('Helvetica')
      .fillColor(fg)
      .text(
        `${fmtMoney(prochaine.montant, devise)} · ${joursLabel} · ${fmtDate(
          prochaine.dateLimite
        )}`,
        contentX + 10,
        boxY + 38,
        { width: contentW - 20, lineBreak: false, ellipsis: true }
      );

    doc.y = boxY + boxH + 8;
  }

  // ══════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════

  private drawFootersOnAllPages(ctx: PdfContext): void {
    const { doc, recu, config, contentX, contentW } = ctx;
    const range = doc.bufferedPageRange();

    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      const isLast = i === range.start + range.count - 1;

      if (config.isThermique) {
        if (isLast) {
          doc.y = doc.page.height - 30;
          doc
            .fontSize(config.fontSize.small - 1)
            .font('Helvetica')
            .fillColor(COLORS.textMuted)
            .text(`Code : ${recu.codeVerification}`, contentX, doc.y, {
              width: contentW,
              align: 'center',
              lineBreak: false,
            });
          doc.y += 8;
          doc
            .fontSize(config.fontSize.small - 1)
            .text(
              `Généré le ${fmtDateTime(new Date())}`,
              contentX,
              doc.y,
              { width: contentW, align: 'center', lineBreak: false }
            );
        }
        continue;
      }

      const footerH = config.footerHeight;
      const footerY = config.height - config.margin - footerH;

      doc
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .moveTo(contentX, footerY - 4)
        .lineTo(contentX + contentW, footerY - 4)
        .stroke();

      doc
        .rect(contentX, footerY, contentW, 32)
        .fill(COLORS.infoLight)
        .stroke(COLORS.info);

      doc
        .fontSize(config.fontSize.small - 0.5)
        .font('Helvetica-Bold')
        .fillColor(COLORS.info)
        .text('CODE DE VÉRIFICATION', contentX, footerY + 4, {
          width: contentW,
          align: 'center',
          lineBreak: false,
        });

      doc
        .fontSize(config.fontSize.h2)
        .font('Courier-Bold')
        .fillColor(COLORS.primary)
        .text(recu.codeVerification, contentX, footerY + 14, {
          width: contentW,
          align: 'center',
          lineBreak: false,
        });

      let mentionY = footerY + 36;
      if (recu.urlVerification) {
        doc
          .fontSize(config.fontSize.small - 1)
          .font('Helvetica')
          .fillColor(COLORS.textMuted)
          .text(`Vérifiable sur : ${recu.urlVerification}`, contentX, mentionY, {
            width: contentW,
            align: 'center',
            lineBreak: false,
          });
        mentionY += 10;
      }

      doc
        .fontSize(config.fontSize.small - 1)
        .font('Helvetica')
        .fillColor(COLORS.textMuted)
        .text(
          `Généré le ${fmtDateTime(new Date())} · Document électronique valable sans signature`,
          contentX,
          mentionY,
          { width: contentW, align: 'center', lineBreak: false }
        );
      mentionY += 9;

      const pageLabel =
        range.count > 1 ? ` · Page ${i - range.start + 1}/${range.count}` : '';
      doc.text(
        `© ${new Date().getFullYear()} ${recu.etablissementNom}${pageLabel}`,
        contentX,
        mentionY,
        { width: contentW, align: 'center', lineBreak: false }
      );
    }
  }

  // ══════════════════════════════════════════
  // TABLEAU SIMPLE
  // ══════════════════════════════════════════

  private drawSimpleTable(
    ctx: PdfContext,
    rows: Array<[string, string, string?]>
  ): void {
    const { doc, config, contentX, contentW } = ctx;
    const rowH = config.rowHeight;
    const labelW = contentW * 0.6;
    const valueW = contentW * 0.4;

    this.ensureSpace(ctx, rowH * rows.length + 4);

    rows.forEach((row: [string, string, string?], idx: number) => {
      const [label, value, colorKey] = row;
      const rowY = doc.y;
      const bg = idx % 2 === 0 ? COLORS.white : COLORS.bgLight;
      doc
        .rect(contentX, rowY, contentW, rowH)
        .fill(bg)
        .stroke(COLORS.border)
        .lineWidth(0.3);

      doc
        .fontSize(config.fontSize.body)
        .font('Helvetica')
        .fillColor(COLORS.textMuted)
        .text(label, contentX + 6, rowY + 5, {
          width: labelW - 8,
          lineBreak: false,
          ellipsis: true,
        });

      const valueColor =
        colorKey === 'success'
          ? COLORS.success
          : colorKey === 'warning'
          ? COLORS.warning
          : colorKey === 'danger'
          ? COLORS.danger
          : COLORS.text;

      doc
        .font('Helvetica-Bold')
        .fillColor(valueColor)
        .text(value, contentX + labelW + 4, rowY + 5, {
          width: valueW - 8,
          align: 'right',
          lineBreak: false,
          ellipsis: true,
        });

      doc.y = rowY + rowH;
    });
  }

  // ══════════════════════════════════════════
  // ✅ FIX #2 : BANDEAU STATUT (sans ●)
  // ══════════════════════════════════════════

  private drawStatutBadge(ctx: PdfContext): void {
    const { doc, recu, config, contentX, contentW } = ctx;
    const details = recu.detailsFinanciers;
    if (!details) return;

    const boxH = 28;
    this.ensureSpace(ctx, boxH + 8);
    const boxY = doc.y + 4;

    let label = 'À JOUR · AUCUN RETARD';
    let bg = COLORS.infoLight;
    let border = COLORS.info;
    let fg = COLORS.info;

    if (details.estSolde) {
      label = 'SOLDÉ · PLAN ENTIÈREMENT PAYÉ';
      bg = COLORS.successLight;
      border = COLORS.success;
      fg = COLORS.success;
    } else if (details.estEnRetard) {
      label = `EN RETARD · ${
        details.echeancesEnRetard ?? 0
      } échéance(s) dépassée(s)`;
      bg = COLORS.dangerLight;
      border = COLORS.danger;
      fg = COLORS.danger;
    }

    doc.rect(contentX, boxY, contentW, boxH).fill(bg).stroke(border);
    doc
      .fontSize(config.fontSize.h3)
      .font('Helvetica-Bold')
      .fillColor(fg)
      .text(label, contentX, boxY + 8, {
        // ✅ FIX : plus de "●" qui cassait le rendu en "%Ï"
        width: contentW,
        align: 'center',
        lineBreak: false,
      });

    doc.y = boxY + boxH + 6;
  }

  // ══════════════════════════════════════════
  // HELPERS STATUT ÉCHÉANCE
  // ══════════════════════════════════════════

  private getEcheanceStatutLabel(e: EcheanceItem): string {
    if (e.estPayee) return 'Payée';
    if (e.estEnRetard) return 'Retard';
    if (e.estPartielle) return 'Partielle';
    return 'Impayée';
  }

  private getStatutColor(e: EcheanceItem): string {
    if (e.estPayee) return COLORS.success;
    if (e.estEnRetard) return COLORS.danger;
    if (e.estPartielle) return COLORS.warning;
    return COLORS.textMuted;
  }
}

export const recuPDFService = new RecuPDFService();