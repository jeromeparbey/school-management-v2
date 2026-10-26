// backend/src/modules/recu/recu-pdf.service.ts

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { AppError } from '../../utils/AppError';

type FormatImpression = 'A4' | 'A5' | '80MM';

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
}

// ──────────────────────────────────────────
// CONFIGURATION DES FORMATS
// ──────────────────────────────────────────

const FORMAT_CONFIG: Record<
  FormatImpression,
  {
    size: [number, number];
    margin: number;
    fontSize: { title: number; h1: number; h2: number; body: number; small: number };
    headerHeight: number;
  }
> = {
  A4: {
    size: [595.28, 841.89],           // 210 × 297 mm en points
    margin: 50,
    fontSize: { title: 24, h1: 16, h2: 12, body: 10, small: 8 },
    headerHeight: 100,
  },
  A5: {
    size: [419.53, 595.28],           // 148 × 210 mm
    margin: 30,
    fontSize: { title: 18, h1: 13, h2: 10, body: 9, small: 7 },
    headerHeight: 80,
  },
  '80MM': {
    size: [226.77, 800],              // 80mm largeur, hauteur variable
    margin: 10,
    fontSize: { title: 14, h1: 11, h2: 9, body: 8, small: 7 },
    headerHeight: 60,
  },
};

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

const formatMoney = (amount: number, devise: string) =>
  `${new Intl.NumberFormat('fr-FR').format(amount)} ${devise}`;

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ──────────────────────────────────────────
// GÉNÉRATION PDF
// ──────────────────────────────────────────

export class RecuPDFService {
  /**
   * Génère un PDF de reçu au format spécifié.
   * Retourne le chemin du fichier généré.
   */
  async genererPDF(
    recu: RecuData,
    format: FormatImpression,
    outputDir: string
  ): Promise<string> {
    const config = FORMAT_CONFIG[format];
    const isThermique = format === '80MM';

    // S'assurer que le dossier existe
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `${recu.numeroRecu}-${format}.pdf`;
    const filePath = path.join(outputDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: config.size,
          margin: config.margin,
          info: {
            Title: `Reçu ${recu.numeroRecu}`,
            Author: recu.etablissementNom,
            Subject: `Reçu de paiement - ${recu.nomEleve}`,
            Keywords: `reçu, paiement, ${recu.numeroRecu}, ${recu.etablissementCode}`,
            Creator: 'School Management API',
          },
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // ═══════════════════════════════════════
        // EN-TÊTE
        // ═══════════════════════════════════════
        this.drawHeader(doc, recu, config, isThermique);

        // ═══════════════════════════════════════
        // TITRE "REÇU DE PAIEMENT"
        // ═══════════════════════════════════════
        doc
          .moveDown(1)
          .fontSize(config.fontSize.title)
          .fillColor('#1a1a1a')
          .font('Helvetica-Bold')
          .text('REÇU DE PAIEMENT', { align: 'center' });

        doc
          .moveDown(0.3)
          .fontSize(config.fontSize.h2)
          .fillColor('#666')
          .font('Helvetica')
          .text(`N° ${recu.numeroRecu}`, { align: 'center' });

        doc.moveDown(1);

        // Ligne de séparation
        doc
          .strokeColor('#e0e0e0')
          .lineWidth(1)
          .moveTo(config.margin, doc.y)
          .lineTo(config.size[0] - config.margin, doc.y)
          .stroke();

        doc.moveDown(0.8);

        // ═══════════════════════════════════════
        // INFOS ÉLÈVE
        // ═══════════════════════════════════════
        this.sectionTitle(doc, 'INFORMATIONS DE L\'ÉLÈVE', config);
        this.field(doc, 'Matricule', recu.eleveMatricule, config);
        this.field(doc, 'Nom complet', recu.nomEleve, config);
        if (recu.classeCode) {
          this.field(
            doc,
            'Classe',
            `${recu.nomClasse} (${recu.classeCode})`,
            config
          );
        }
        if (recu.niveauNom) {
          this.field(doc, 'Niveau', recu.niveauNom, config);
        }
        if (recu.anneeScolaireNom) {
          this.field(doc, 'Année scolaire', recu.anneeScolaireNom, config);
        }

        doc.moveDown(0.8);

        // ═══════════════════════════════════════
        // DÉTAILS DU PAIEMENT
        // ═══════════════════════════════════════
        this.sectionTitle(doc, 'DÉTAILS DU PAIEMENT', config);
        this.field(doc, 'Date du paiement', formatDate(recu.datePaiement), config);
        this.field(doc, 'Moyen de paiement', recu.moyenPaiementLabel, config);
        this.field(doc, 'Référence', recu.referencePaiement, config);

        if (recu.echeancesCouvertes.length > 0) {
          doc.moveDown(0.5);
          doc
            .fontSize(config.fontSize.h2)
            .fillColor('#1a1a1a')
            .font('Helvetica-Bold')
            .text('Échéances couvertes :');
          doc.moveDown(0.3);
          recu.echeancesCouvertes.forEach((e: any) => {
            doc
              .fontSize(config.fontSize.body)
              .fillColor('#333')
              .font('Helvetica')
              .text(
                `• ${e.nom} : ${formatMoney(e.montant, recu.devise)}`,
                { indent: 10 }
              );
          });
        }

        doc.moveDown(0.8);

        // ═══════════════════════════════════════
        // DÉTAILS FINANCIERS
        // ═══════════════════════════════════════
        this.sectionTitle(doc, 'DÉTAILS FINANCIERS', config);

        const boxY = doc.y;
        const boxX = config.margin;
        const boxW = config.size[0] - config.margin * 2;

        // Fond coloré
        doc
          .rect(boxX, boxY, boxW, isThermique ? 80 : 100)
          .fill('#f0f9ff')
          .stroke('#bae6fd');

        doc.fillColor('#1a1a1a').font('Helvetica');

        let currentY = boxY + 10;
        const padding = 10;

        // Montant payé (en GROS)
        doc
          .fontSize(isThermique ? config.fontSize.h1 : config.fontSize.title)
          .font('Helvetica-Bold')
          .fillColor('#059669')
          .text(
            formatMoney(recu.montantPaye, recu.devise),
            boxX + padding,
            currentY,
            { width: boxW - padding * 2, align: 'center' }
          );

        currentY += isThermique ? 20 : 30;

        doc
          .fontSize(config.fontSize.small)
          .font('Helvetica')
          .fillColor('#666')
          .text('Montant payé', boxX + padding, currentY, {
            width: boxW - padding * 2,
            align: 'center',
          });

        // Détails restants (A4/A5 uniquement)
        if (!isThermique) {
          currentY += 20;
          doc
            .fontSize(config.fontSize.body)
            .fillColor('#333')
            .text(
              `Réduction appliquée : ${formatMoney(
                recu.montantReduction,
                recu.devise
              )}`,
              boxX + padding,
              currentY,
              { width: boxW - padding * 2 }
            );

          currentY += 15;
          doc.text(
            `Solde restant après paiement : ${formatMoney(
              recu.montantRestant,
              recu.devise
            )}`,
            boxX + padding,
            currentY,
            { width: boxW - padding * 2 }
          );
        }

        doc.y = boxY + (isThermique ? 90 : 110);
        doc.moveDown(1);

        // ═══════════════════════════════════════
        // PIED DE PAGE
        // ═══════════════════════════════════════
        this.drawFooter(doc, recu, config, isThermique);

        // Finalisation
        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  // ──────────────────────────────────────────
  // DESSIN DE L'EN-TÊTE
  // ──────────────────────────────────────────

  private drawHeader(
    doc: any,
    recu: RecuData,
    config: any,
    isThermique: boolean
  ) {
    const headerY = config.margin;

    // Logo (si présent)
    if (recu.etablissementLogo && !isThermique) {
      try {
        const logoPath = path.join(
          process.cwd(),
          'uploads',
          recu.etablissementLogo.replace(/^\/uploads\//, '')
        );
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, config.margin, headerY, {
            width: 60,
            height: 60,
          });
        }
      } catch {
        // Ignorer les erreurs de logo
      }
    }

    const textX = recu.etablissementLogo && !isThermique
      ? config.margin + 75
      : config.margin;
    const textWidth = config.size[0] - textX - config.margin;

    // Nom établissement
    doc
      .fontSize(isThermique ? config.fontSize.h2 : config.fontSize.h1)
      .font('Helvetica-Bold')
      .fillColor('#1a1a1a')
      .text(recu.etablissementNom, textX, headerY, {
        width: textWidth,
        align: isThermique ? 'center' : 'left',
      });

    // Adresse
    doc.fontSize(config.fontSize.small).font('Helvetica').fillColor('#666');

    const adresse = [
      recu.etablissementAdresse,
      recu.etablissementVille,
      recu.etablissementPays,
    ]
      .filter(Boolean)
      .join(', ');

    if (adresse) {
      doc.text(adresse, textX, doc.y + 2, {
        width: textWidth,
        align: isThermique ? 'center' : 'left',
      });
    }

    // Contact
    const contacts = [
      recu.etablissementTelephone && `📞 ${recu.etablissementTelephone}`,
      recu.etablissementEmail && `✉ ${recu.etablissementEmail}`,
    ]
      .filter(Boolean)
      .join('  |  ');

    if (contacts) {
      doc.text(contacts, textX, doc.y + 2, {
        width: textWidth,
        align: isThermique ? 'center' : 'left',
      });
    }

    // Agrément
    if (recu.etablissementAgrement && !isThermique) {
      doc.text(
        `N° Agrément : ${recu.etablissementAgrement}  |  Code : ${recu.etablissementCode}`,
        textX,
        doc.y + 2,
        { width: textWidth, align: 'left' }
      );
    }
  }

  // ──────────────────────────────────────────
  // TITRE DE SECTION
  // ──────────────────────────────────────────

  private sectionTitle(doc: any, title: string, config: any) {
    doc
      .fontSize(config.fontSize.h2)
      .font('Helvetica-Bold')
      .fillColor('#1a1a1a')
      .text(title);
    doc.moveDown(0.3);

    // Ligne sous le titre
    doc
      .strokeColor('#e0e0e0')
      .lineWidth(0.5)
      .moveTo(config.margin, doc.y)
      .lineTo(config.size[0] - config.margin, doc.y)
      .stroke();

    doc.moveDown(0.4);
  }

  // ──────────────────────────────────────────
  // CHAMP (label + valeur)
  // ──────────────────────────────────────────

  private field(doc: any, label: string, value: string, config: any) {
    const labelWidth = 100;

    doc
      .fontSize(config.fontSize.body)
      .font('Helvetica-Bold')
      .fillColor('#666')
      .text(`${label} :`, config.margin, doc.y, {
        width: labelWidth,
        continued: true,
      });

    doc
      .font('Helvetica')
      .fillColor('#1a1a1a')
      .text(` ${value}`);
  }

  // ──────────────────────────────────────────
  // PIED DE PAGE
  // ──────────────────────────────────────────

  private drawFooter(
    doc: any,
    recu: RecuData,
    config: any,
    isThermique: boolean
  ) {
    doc.moveDown(1);

    // Ligne de séparation
    doc
      .strokeColor('#e0e0e0')
      .lineWidth(1)
      .moveTo(config.margin, doc.y)
      .lineTo(config.size[0] - config.margin, doc.y)
      .stroke();

    doc.moveDown(0.8);

    // Code de vérification
    doc
      .fontSize(config.fontSize.small)
      .font('Helvetica-Bold')
      .fillColor('#666')
      .text('Code de vérification :', { align: 'center' });

    doc
      .fontSize(config.fontSize.h2)
      .font('Helvetica-Bold')
      .fillColor('#0369a1')
      .text(recu.codeVerification, { align: 'center' });

    if (recu.urlVerification && !isThermique) {
      doc
        .fontSize(config.fontSize.small)
        .font('Helvetica')
        .fillColor('#666')
        .text(`Vérifiable sur : ${recu.urlVerification}`, {
          align: 'center',
        });
    }

    doc.moveDown(0.8);

    // Généré par
    doc
      .fontSize(config.fontSize.small)
      .font('Helvetica')
      .fillColor('#999')
      .text(
        `Généré par ${recu.generateur.prenom} ${recu.generateur.nom} le ${formatDate(new Date())}`,
        { align: 'center' }
      );

    doc.moveDown(0.3);

    // Mentions légales
    doc
      .fontSize(config.fontSize.small - 1)
      .fillColor('#999')
      .text(
        'Ce reçu est généré électroniquement et ne nécessite pas de signature manuscrite.',
        { align: 'center' }
      );

    doc.moveDown(0.2);

    doc.text(
      `© ${new Date().getFullYear()} ${recu.etablissementNom} — Tous droits réservés`,
      { align: 'center' }
    );
  }
}

export const recuPDFService = new RecuPDFService();