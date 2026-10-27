// backend/src/modules/recu/recu-pdf.service.ts

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

type FormatImpression = 'A4' | 'A5' | '80MM';

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────

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
  echeances?: Array<{
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
  }>;
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
  echeancesCouvertes: any[];
  codeVerification: string;
  urlVerification: string | null;
  generateur: { prenom: string; nom: string };
  detailsFinanciers?: DetailsFinanciers | null;
}
// backend/src/modules/recu/recu-pdf.service.ts

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
};
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

const fmtMoney = (amount: number, devise: string) =>
  `${new Intl.NumberFormat('fr-FR').format(Math.round(amount))} ${devise}`;

const fmtDate = (date: Date | string) =>
  new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const fmtDateTime = (date: Date | string) =>
  new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/** Raccourcit un texte trop long (ellipsis manuel) */
const truncate = (text: string, maxChars: number) =>
  text.length <= maxChars ? text : text.slice(0, maxChars - 1) + '…';

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

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: [config.width, config.height],
          margin: 0,
          autoFirstPage: true,
          bufferPages: true, // ✅ nécessaire pour numéroter les pages
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

        const ctx = {
          doc,
          recu,
          config,
          contentX: config.margin,
          contentW: config.width - config.margin * 2,
        };

        // Rendu séquentiel — chaque bloc lit/écrit doc.y
        doc.y = config.margin;

        this.drawHeader(ctx);
        this.drawTitleBlock(ctx);
        this.drawEleveBlock(ctx);
        this.drawPaiementBlock(ctx);
        this.drawFinancierBlock(ctx);
        this.drawEcheancesTable(ctx);
        this.drawProchaineEcheance(ctx);

        // Footer ancré en bas sur chaque page
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

  /** Réserve `needed` pts de hauteur. Si insuffisant → nouvelle page + header rappelé. */
  private ensureSpace(ctx: any, needed: number) {
    const { doc, config } = ctx;
    const bottomLimit = config.height - config.margin - config.footerHeight;
    if (doc.y + needed > bottomLimit) {
      doc.addPage({ size: [config.width, config.height], margin: 0 });
      doc.y = config.margin;
      // Sur les pages suivantes, on ne redessine pas le header complet,
      // juste un mini rappel pour l'identification du document.
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

  /** Titre de section avec filet de séparation. */
  private sectionTitle(ctx: any, title: string) {
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

  /** Ligne label / valeur sur une colonne. */
  private fieldRow(
    ctx: any,
    label: string,
    value: string,
    x: number,
    y: number,
    w: number
  ) {
    const { doc, config } = ctx;
    const labelW = Math.min(80, w * 0.45);

    doc
      .fontSize(config.fontSize.body)
      .font('Helvetica-Bold')
      .fillColor(COLORS.textMuted)
      .text(`${label}`, x, y, { width: labelW, lineBreak: false });

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
  // HEADER — Établissement
  // ══════════════════════════════════════════

  private drawHeader(ctx: any) {
    const { doc, recu, config, contentX, contentW } = ctx;

    if (config.isThermique) {
      // ─── Format thermique : centré, minimal ───
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

      const adresse = [
        recu.etablissementAdresse,
        recu.etablissementVille,
      ]
        .filter(Boolean)
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

    // ─── A4 / A5 : bandeau structuré ───
    const headerH = 90;
    const headerY = config.margin;

    doc
      .rect(contentX, headerY, contentW, headerH)
      .fill(COLORS.primaryLight)
      .stroke(COLORS.primary);

    // Logo
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
      .filter(Boolean)
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
      .filter(Boolean)
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
          `${recu.etablissementAgrement ? `Agrément : ${recu.etablissementAgrement}  ·  ` : ''}Code : ${recu.etablissementCode}`,
          textX,
          y,
          { width: textW, lineBreak: false, ellipsis: true }
        );
    }

    doc.y = headerY + headerH + 14;
  }

  // ══════════════════════════════════════════
  // TITRE + N° + DATE
  // ══════════════════════════════════════════

  private drawTitleBlock(ctx: any) {
    const { doc, recu, config, contentX, contentW } = ctx;

    this.ensureSpace(ctx, 70);

    doc
      .fontSize(config.isThermique ? config.fontSize.h1 : config.fontSize.title)
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

  private drawEleveBlock(ctx: any) {
    const { doc, recu, config, contentX, contentW } = ctx;

    this.sectionTitle(ctx, 'ÉLÈVE');

    if (config.isThermique) {
      const rows: Array<[string, string]> = [
        ['Matricule', recu.eleveMatricule],
        ['Nom', recu.nomEleve],
        ['Classe', recu.nomClasse],
        ['Année', recu.anneeScolaireNom ?? '—'],
      ];
      this.ensureSpace(ctx, rows.length * config.rowHeight + 6);
      rows.forEach(([l, v]) => {
        const y = doc.y;
        this.fieldRow(ctx, l, v, contentX, y, contentW);
        doc.y = y + config.rowHeight;
      });
    } else {
      // 2 colonnes × 3 lignes
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
        ['Devise', recu.devise],
      ];

      left.forEach(([l, v], i) => {
        this.fieldRow(ctx, l, v, leftX, startY + i * rowH, colW);
      });
      right.forEach(([l, v], i) => {
        this.fieldRow(ctx, l, v, rightX, startY + i * rowH, colW);
      });

      doc.y = startY + rowH * 3;
    }

    doc.moveDown(0.7);
  }

  // ══════════════════════════════════════════
  // BLOC PAIEMENT
  // ══════════════════════════════════════════

  private drawPaiementBlock(ctx: any) {
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
      rows.forEach(([l, v]) => {
        const y = doc.y;
        this.fieldRow(ctx, l, v, contentX, y, contentW);
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

      left.forEach(([l, v], i) => {
        this.fieldRow(ctx, l, v, leftX, startY + i * rowH, colW);
      });
      right.forEach(([l, v], i) => {
        this.fieldRow(ctx, l, v, rightX, startY + i * rowH, colW);
      });

      doc.y = startY + rowH * 2;
    }

    doc.moveDown(0.7);
  }

  // ══════════════════════════════════════════
  // BLOC FINANCIER
  // ══════════════════════════════════════════

  private drawFinancierBlock(ctx: any) {
    const { doc, recu, config, contentX, contentW } = ctx;
    const details = recu.detailsFinanciers;

    this.sectionTitle(ctx, 'DÉTAILS FINANCIERS');

    // Bandeau "MONTANT PAYÉ"
    const bandH = config.isThermique ? 42 : 56;
    this.ensureSpace(ctx, bandH + 8);
    const bandY = doc.y;

    doc
      .rect(contentX, bandY, contentW, bandH)
      .fill(COLORS.successLight)
      .stroke(COLORS.success);

    doc
      .fontSize(config.isThermique ? config.fontSize.h1 : config.fontSize.title - 4)
      .font('Helvetica-Bold')
      .fillColor(COLORS.success)
      .text(fmtMoney(recu.montantPaye, recu.devise), contentX, bandY + 10, {
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

    // Tableau montants
    const rows: Array<[string, string, string?]> = [];
    if (details?.montantTotalPlan != null) {
      rows.push(['Total du plan', fmtMoney(details.montantTotalPlan, recu.devise)]);
    }
    if (recu.montantReduction > 0) {
      rows.push([
        'Réduction appliquée',
        `- ${fmtMoney(recu.montantReduction, recu.devise)}`,
        'warning',
      ]);
    }
    if (details?.montantPayeApres != null) {
      rows.push([
        'Total payé (cumulé)',
        fmtMoney(details.montantPayeApres, recu.devise),
        'success',
      ]);
    }
    rows.push([
      'Solde restant',
      fmtMoney(recu.montantRestant, recu.devise),
      recu.montantRestant <= 0.01 ? 'success' : 'danger',
    ]);
    if (details?.pourcentagePaye != null) {
      rows.push(['Progression', `${details.pourcentagePaye}%`]);
    }

    this.drawSimpleTable(ctx, rows);

    // Bandeau statut global
    this.drawStatutBadge(ctx);
  }

  // ══════════════════════════════════════════
  // TABLEAU ÉCHÉANCES
  // ══════════════════════════════════════════
private drawEcheancesTable(ctx: any) {
  const { doc, recu, config, contentX, contentW } = ctx;
  const echeances: EcheanceItem[] | undefined =
    recu.detailsFinanciers?.echeances;
  if (!echeances || echeances.length === 0) return;

  // ⇩ cast local pour que TypeScript sache que c'est bien un tableau
  // (évite le "possibly undefined" dans les closures imbriquées)
  const list: EcheanceItem[] = echeances;

  this.sectionTitle(ctx, 'ÉCHÉANCES DU PLAN');

  if (config.isThermique) {
    // ─── 80 MM : format vertical compact ───
    for (const e of list) {  // ✅ e typé automatiquement
      const blockH = config.rowHeight * 3 + 4;
      this.ensureSpace(ctx, blockH);
      const y0 = doc.y;

      doc
        .fontSize(config.fontSize.body)
        .font('Helvetica-Bold')
        .fillColor(COLORS.text)
        .text(
          truncate(`${e.ordre}. ${e.nom}`, 32),
          contentX,
          y0,
          { width: contentW, lineBreak: false, ellipsis: true }
        );

      doc
        .fontSize(config.fontSize.small)
        .font('Helvetica')
        .fillColor(COLORS.textMuted)
        .text(
          `Dû : ${fmtMoney(e.montant, recu.devise)}   Payé : ${fmtMoney(
            e.montantPayeApres,
            recu.devise
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
            ? `${statutLabel} · Reste ${fmtMoney(e.montantRestant, recu.devise)}`
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

    // Totaux — ✅ typage explicite de (s, e)
    this.ensureSpace(ctx, 18);
    const totalDu = list.reduce(
      (s: number, e: EcheanceItem) => s + e.montant,
      0
    );
    const totalPaye = list.reduce(
      (s: number, e: EcheanceItem) => s + e.montantPayeApres,
      0
    );
    const totalReste = list.reduce(
      (s: number, e: EcheanceItem) => s + e.montantRestant,
      0
    );
    doc
      .fontSize(config.fontSize.small)
      .font('Helvetica-Bold')
      .fillColor(COLORS.text)
      .text(
        `TOTAL · Dû ${fmtMoney(totalDu, recu.devise)} · Payé ${fmtMoney(
          totalPaye,
          recu.devise
        )} · Reste ${fmtMoney(totalReste, recu.devise)}`,
        contentX,
        doc.y,
        { width: contentW, align: 'right', lineBreak: false }
      );
    doc.moveDown(0.6);
    return;
  }

  // ─── A4 / A5 : vrai tableau ───
  const headerH = 22;
  const rowH = config.rowHeight;
  const cols = [
    { key: 'ordre', label: '#', width: 24, align: 'center' as const },
    { key: 'nom', label: 'Échéance', width: 0, align: 'left' as const },
    { key: 'montant', label: 'Montant', width: 72, align: 'right' as const },
    { key: 'paye', label: 'Payé', width: 72, align: 'right' as const },
    { key: 'reste', label: 'Reste', width: 72, align: 'right' as const },
    { key: 'statut', label: 'Statut', width: 66, align: 'center' as const },
  ];
  const fixed = cols
    .filter((c) => c.width > 0)
    .reduce((s: number, c) => s + c.width, 0);
  cols[1].width = contentW - fixed;

  // Header
  this.ensureSpace(
    ctx,
    headerH + rowH * Math.min(list.length, 4) + 30
  );

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

  // Lignes — ✅ (e, idx) typés explicitement
  list.forEach((e: EcheanceItem, idx: number) => {
    if (
      doc.y + rowH >
      config.height - config.margin - config.footerHeight - 20
    ) {
      doc.addPage({ size: [config.width, config.height], margin: 0 });
      doc.y = config.margin;
      if (!config.isThermique) {
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
      }
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
      fmtMoney(e.montant, recu.devise),
      fmtMoney(e.montantPayeApres, recu.devise),
      fmtMoney(e.montantRestant, recu.devise),
      statutLabel,
    ];

    let cellX = contentX;
    cols.forEach((col, ci) => {
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

  // Total — ✅ typage explicite
  doc.y += 4;
  const totalDu = list.reduce(
    (s: number, e: EcheanceItem) => s + e.montant,
    0
  );
  const totalPaye = list.reduce(
    (s: number, e: EcheanceItem) => s + e.montantPayeApres,
    0
  );
  const totalReste = list.reduce(
    (s: number, e: EcheanceItem) => s + e.montantRestant,
    0
  );
  doc
    .fontSize(config.fontSize.small)
    .font('Helvetica-Bold')
    .fillColor(COLORS.text)
    .text(
      `TOTAL · Dû : ${fmtMoney(totalDu, recu.devise)}   ·   Payé : ${fmtMoney(
        totalPaye,
        recu.devise
      )}   ·   Reste : ${fmtMoney(totalReste, recu.devise)}`,
      contentX,
      doc.y,
      { width: contentW, align: 'right', lineBreak: false }
    );

  doc.moveDown(0.7);
}

  // ══════════════════════════════════════════
  // PROCHAINE ÉCHÉANCE
  // ══════════════════════════════════════════

  private drawProchaineEcheance(ctx: any) {
    const { doc, recu, config, contentX, contentW } = ctx;
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
        `${fmtMoney(prochaine.montant, recu.devise)} · ${joursLabel} · ${fmtDate(
          prochaine.dateLimite
        )}`,
        contentX + 10,
        boxY + 38,
        { width: contentW - 20, lineBreak: false, ellipsis: true }
      );

    doc.y = boxY + boxH + 8;
  }

  // ══════════════════════════════════════════
  // FOOTER (ancré en bas de chaque page)
  // ══════════════════════════════════════════

  private drawFootersOnAllPages(ctx: any) {
    const { doc, recu, config, contentX, contentW } = ctx;
    const range = doc.bufferedPageRange();

    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      const isLast = i === range.start + range.count - 1;

      if (config.isThermique) {
        // Thermique : juste un mini footer sur la dernière page
        if (isLast) {
          doc.y = doc.page.height - 30;
          doc
            .fontSize(config.fontSize.small - 1)
            .font('Helvetica')
            .fillColor(COLORS.textMuted)
            .text(
              `Code : ${recu.codeVerification}`,
              contentX,
              doc.y,
              { width: contentW, align: 'center', lineBreak: false }
            );
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

      // ─── A4 / A5 : footer pro ancré ───
      const footerH = config.footerHeight;
      const footerY = config.height - config.margin - footerH;

      // Filet séparateur
      doc
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .moveTo(contentX, footerY - 4)
        .lineTo(contentX + contentW, footerY - 4)
        .stroke();

      // Bloc vérification
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

      // Ligne mention
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

      // Mention copyright + pagination
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
  // TABLEAU SIMPLE (montants)
  // ══════════════════════════════════════════

  private drawSimpleTable(
    ctx: any,
    rows: Array<[string, string, string?]>
  ) {
    const { doc, config, contentX, contentW } = ctx;
    const rowH = config.rowHeight;
    const labelW = contentW * 0.6;
    const valueW = contentW * 0.4;

    this.ensureSpace(ctx, rowH * rows.length + 4);

    rows.forEach(([label, value, colorKey], idx) => {
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
  // BANDEAU STATUT GLOBAL
  // ══════════════════════════════════════════

  private drawStatutBadge(ctx: any) {
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
      label = `EN RETARD · ${details.echeancesEnRetard ?? 0} échéance(s) dépassée(s)`;
      bg = COLORS.dangerLight;
      border = COLORS.danger;
      fg = COLORS.danger;
    }

    doc.rect(contentX, boxY, contentW, boxH).fill(bg).stroke(border);
    doc
      .fontSize(config.fontSize.h3)
      .font('Helvetica-Bold')
      .fillColor(fg)
      .text(`● ${label}`, contentX, boxY + 8, {
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