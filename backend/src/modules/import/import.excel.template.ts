// backend/src/modules/import/import.excel.template.ts

import ExcelJS from 'exceljs';

// ═══════════════════════════════════════════════════════════
// CONSTANTES EXPORTÉES
// ═══════════════════════════════════════════════════════════

/**
 * Liste COMPLÈTE des colonnes d'import d'élèves.
 * L'ordre est CRITIQUE — il doit correspondre à celui utilisé
 * par `export.service.ts` pour permettre le ré-import.
 */
export const IMPORT_HEADERS = [
  // ─── Élève ───
  'prenom',
  'nom',
  'sexe',
  'dateNaissance',
  'lieuNaissance',
  'nationalite',
  'adresse',
  'telephone',
  'email',
  'photo',
  'infoMedicale',
  'groupeSanguin',
  'allergies',

  // ─── Classe ───
  'classeNom',
  'classeCode',
  'classeCapacite',
  'classeSalle',
  'niveauCode',
  'niveauNom',

  // ─── Année scolaire ───
  'anneeScolaireNom',
  'anneeScolaireDebut',
  'anneeScolaireFin',

  // ─── Plan de scolarité ───
  'planNom',
  'planFraisInscription',
  'planFraisScolarite',
  'planDevise',

  // ─── Échéances 1 à 5 ───
  'echeance1Nom',
  'echeance1Montant',
  'echeance1DateLimite',
  'echeance2Nom',
  'echeance2Montant',
  'echeance2DateLimite',
  'echeance3Nom',
  'echeance3Montant',
  'echeance3DateLimite',
  'echeance4Nom',
  'echeance4Montant',
  'echeance4DateLimite',
  'echeance5Nom',
  'echeance5Montant',
  'echeance5DateLimite',

  // ─── Responsable ───
  'responsablePrenom',
  'responsableNom',
  'responsableLien',
  'responsableTelephone',
  'responsableEmail',
  'responsableProfession',
] as const;

export type ImportHeader = (typeof IMPORT_HEADERS)[number];

/**
 * Métadonnées de chaque colonne : description, exemple, obligatoire.
 * Utilisé pour générer la feuille "Guide" du fichier XLSX.
 */
export const HEADER_DESCRIPTIONS: Record<
  ImportHeader,
  { description: string; exemple: string; obligatoire: boolean }
> = {
  // ─── Élève ───
  prenom: {
    description: "Prénom de l'élève",
    exemple: 'Koffi',
    obligatoire: true,
  },
  nom: {
    description: 'Nom de famille',
    exemple: 'AYI',
    obligatoire: true,
  },
  sexe: {
    description: 'Sexe : M (masculin) ou F (féminin)',
    exemple: 'M',
    obligatoire: true,
  },
  dateNaissance: {
    description: 'Date de naissance (format YYYY-MM-DD)',
    exemple: '2010-05-15',
    obligatoire: true,
  },
  lieuNaissance: {
    description: 'Lieu de naissance',
    exemple: 'Lomé',
    obligatoire: false,
  },
  nationalite: {
    description: 'Nationalité',
    exemple: 'Togolaise',
    obligatoire: false,
  },
  adresse: {
    description:
      "Adresse complète (utiliser des guillemets si contient ';')",
    exemple: '"Rue 12, Lomé"',
    obligatoire: false,
  },
  telephone: {
    description: 'Numéro de téléphone',
    exemple: '90123456',
    obligatoire: false,
  },
  email: {
    description: 'Adresse email',
    exemple: 'koffi.ayi@email.com',
    obligatoire: false,
  },
  photo: {
    description: 'URL de la photo (optionnel)',
    exemple: 'https://...',
    obligatoire: false,
  },
  infoMedicale: {
    description: 'Informations médicales',
    exemple: 'Asthme',
    obligatoire: false,
  },
  groupeSanguin: {
    description: 'Groupe sanguin',
    exemple: 'O+',
    obligatoire: false,
  },
  allergies: {
    description: 'Allergies connues',
    exemple: 'Arachides',
    obligatoire: false,
  },

  // ─── Classe ───
  classeNom: {
    description:
      'Nom de la classe (sera créée si absente et options activées)',
    exemple: '6ème A',
    obligatoire: false,
  },
  classeCode: {
    description:
      'Code UNIQUE de la classe (sert de référence pour éviter les doublons)',
    exemple: '6A',
    obligatoire: false,
  },
  classeCapacite: {
    description: 'Capacité maximale de la classe',
    exemple: '30',
    obligatoire: false,
  },
  classeSalle: {
    description: 'Salle attribuée',
    exemple: 'Salle 12',
    obligatoire: false,
  },
  niveauCode: {
    description: 'Code du niveau (ex: 6EME, 5EME)',
    exemple: '6EME',
    obligatoire: false,
  },
  niveauNom: {
    description: 'Nom du niveau',
    exemple: 'Sixième',
    obligatoire: false,
  },

  // ─── Année scolaire ───
  anneeScolaireNom: {
    description: "Nom de l'année scolaire (ex: 2025-2026)",
    exemple: '2025-2026',
    obligatoire: false,
  },
  anneeScolaireDebut: {
    description: "Date de début de l'année",
    exemple: '2025-09-01',
    obligatoire: false,
  },
  anneeScolaireFin: {
    description: "Date de fin de l'année",
    exemple: '2026-06-30',
    obligatoire: false,
  },

  // ─── Plan de scolarité ───
  planNom: {
    description: 'Nom du plan de scolarité',
    exemple: 'Plan 6ème',
    obligatoire: false,
  },
  planFraisInscription: {
    description: "Frais d'inscription (montant en chiffres)",
    exemple: '15000',
    obligatoire: false,
  },
  planFraisScolarite: {
    description: 'Frais de scolarité',
    exemple: '250000',
    obligatoire: false,
  },
  planDevise: {
    description: 'Devise (XOF, EUR, USD…)',
    exemple: 'XOF',
    obligatoire: false,
  },

  // ─── Échéances ───
  echeance1Nom: {
    description: 'Nom de la 1ère échéance',
    exemple: 'Inscription',
    obligatoire: false,
  },
  echeance1Montant: {
    description: 'Montant de la 1ère échéance',
    exemple: '15000',
    obligatoire: false,
  },
  echeance1DateLimite: {
    description: 'Date limite de la 1ère échéance',
    exemple: '2025-09-15',
    obligatoire: false,
  },
  echeance2Nom: {
    description: 'Nom de la 2ème échéance',
    exemple: '1er versement',
    obligatoire: false,
  },
  echeance2Montant: {
    description: 'Montant de la 2ème échéance',
    exemple: '100000',
    obligatoire: false,
  },
  echeance2DateLimite: {
    description: 'Date limite de la 2ème échéance',
    exemple: '2025-11-30',
    obligatoire: false,
  },
  echeance3Nom: {
    description: 'Nom de la 3ème échéance',
    exemple: '2ème versement',
    obligatoire: false,
  },
  echeance3Montant: {
    description: 'Montant de la 3ème échéance',
    exemple: '100000',
    obligatoire: false,
  },
  echeance3DateLimite: {
    description: 'Date limite de la 3ème échéance',
    exemple: '2026-02-28',
    obligatoire: false,
  },
  echeance4Nom: {
    description: 'Nom de la 4ème échéance',
    exemple: '3ème versement',
    obligatoire: false,
  },
  echeance4Montant: {
    description: 'Montant de la 4ème échéance',
    exemple: '50000',
    obligatoire: false,
  },
  echeance4DateLimite: {
    description: 'Date limite de la 4ème échéance',
    exemple: '2026-05-30',
    obligatoire: false,
  },
  echeance5Nom: {
    description: 'Nom de la 5ème échéance (optionnelle)',
    exemple: '',
    obligatoire: false,
  },
  echeance5Montant: {
    description: 'Montant de la 5ème échéance',
    exemple: '',
    obligatoire: false,
  },
  echeance5DateLimite: {
    description: 'Date limite de la 5ème échéance',
    exemple: '',
    obligatoire: false,
  },

  // ─── Responsable ───
  responsablePrenom: {
    description: 'Prénom du parent/tuteur',
    exemple: 'Kodjo',
    obligatoire: false,
  },
  responsableNom: {
    description: 'Nom du parent/tuteur',
    exemple: 'AYI',
    obligatoire: false,
  },
  responsableLien: {
    description: "Lien avec l'élève (Père, Mère, Tuteur…)",
    exemple: 'Père',
    obligatoire: false,
  },
  responsableTelephone: {
    description: 'Téléphone du responsable',
    exemple: '90123456',
    obligatoire: false,
  },
  responsableEmail: {
    description: 'Email du responsable',
    exemple: 'kodjo.ayi@email.com',
    obligatoire: false,
  },
  responsableProfession: {
    description: 'Profession du responsable',
    exemple: 'Commerçant',
    obligatoire: false,
  },
};

// ═══════════════════════════════════════════════════════════
// EXEMPLES
// ═══════════════════════════════════════════════════════════

/**
 * Exemple 1 : élève COMPLET (classe + plan + 4 échéances + responsable).
 */
export const EXEMPLE_COMPLET: Record<ImportHeader, string> = {
  prenom: 'Koffi',
  nom: 'AYI',
  sexe: 'M',
  dateNaissance: '2010-05-15',
  lieuNaissance: 'Lomé',
  nationalite: 'Togolaise',
  adresse: 'Rue 12, Lomé',
  telephone: '90123456',
  email: 'koffi.ayi@email.com',
  photo: '',
  infoMedicale: '',
  groupeSanguin: 'O+',
  allergies: '',

  classeNom: '6ème A',
  classeCode: '6A',
  classeCapacite: '30',
  classeSalle: 'Salle 12',
  niveauCode: '6EME',
  niveauNom: 'Sixième',

  anneeScolaireNom: '2025-2026',
  anneeScolaireDebut: '2025-09-01',
  anneeScolaireFin: '2026-06-30',

  planNom: 'Plan 6ème',
  planFraisInscription: '15000',
  planFraisScolarite: '250000',
  planDevise: 'XOF',

  echeance1Nom: 'Inscription',
  echeance1Montant: '15000',
  echeance1DateLimite: '2025-09-15',
  echeance2Nom: '1er versement',
  echeance2Montant: '100000',
  echeance2DateLimite: '2025-11-30',
  echeance3Nom: '2ème versement',
  echeance3Montant: '100000',
  echeance3DateLimite: '2026-02-28',
  echeance4Nom: '3ème versement',
  echeance4Montant: '50000',
  echeance4DateLimite: '2026-05-30',
  echeance5Nom: '',
  echeance5Montant: '',
  echeance5DateLimite: '',

  responsablePrenom: 'Kodjo',
  responsableNom: 'AYI',
  responsableLien: 'Père',
  responsableTelephone: '90123456',
  responsableEmail: 'kodjo.ayi@email.com',
  responsableProfession: 'Commerçant',
};

/**
 * Exemple 2 : élève MINIMAL (classe + responsable, sans plan).
 */
export const EXEMPLE_MINIMAL: Record<ImportHeader, string> = {
  prenom: 'Ama',
  nom: 'DOSSOU',
  sexe: 'F',
  dateNaissance: '2011-08-20',
  lieuNaissance: 'Kpalimé',
  nationalite: 'Togolaise',
  adresse: 'Rue 5',
  telephone: '91234567',
  email: '',
  photo: '',
  infoMedicale: '',
  groupeSanguin: '',
  allergies: '',

  classeNom: '6ème B',
  classeCode: '6B',
  classeCapacite: '28',
  classeSalle: 'Salle 14',
  niveauCode: '6EME',
  niveauNom: 'Sixième',

  anneeScolaireNom: '',
  anneeScolaireDebut: '',
  anneeScolaireFin: '',

  planNom: '',
  planFraisInscription: '',
  planFraisScolarite: '',
  planDevise: '',

  echeance1Nom: '',
  echeance1Montant: '',
  echeance1DateLimite: '',
  echeance2Nom: '',
  echeance2Montant: '',
  echeance2DateLimite: '',
  echeance3Nom: '',
  echeance3Montant: '',
  echeance3DateLimite: '',
  echeance4Nom: '',
  echeance4Montant: '',
  echeance4DateLimite: '',
  echeance5Nom: '',
  echeance5Montant: '',
  echeance5DateLimite: '',

  responsablePrenom: 'Yawa',
  responsableNom: 'DOSSOU',
  responsableLien: 'Mère',
  responsableTelephone: '91234567',
  responsableEmail: '',
  responsableProfession: 'Enseignante',
};

/**
 * Exemple 3 : élève SANS classe ni plan (juste identité).
 */
export const EXEMPLE_SANS_CLASSE: Record<ImportHeader, string> = {
  prenom: 'Sena',
  nom: 'KOFFI',
  sexe: 'F',
  dateNaissance: '2012-03-10',
  lieuNaissance: 'Atakpamé',
  nationalite: 'Togolaise',
  adresse: '',
  telephone: '',
  email: '',
  photo: '',
  infoMedicale: '',
  groupeSanguin: '',
  allergies: '',

  classeNom: '',
  classeCode: '',
  classeCapacite: '',
  classeSalle: '',
  niveauCode: '',
  niveauNom: '',

  anneeScolaireNom: '',
  anneeScolaireDebut: '',
  anneeScolaireFin: '',

  planNom: '',
  planFraisInscription: '',
  planFraisScolarite: '',
  planDevise: '',

  echeance1Nom: '',
  echeance1Montant: '',
  echeance1DateLimite: '',
  echeance2Nom: '',
  echeance2Montant: '',
  echeance2DateLimite: '',
  echeance3Nom: '',
  echeance3Montant: '',
  echeance3DateLimite: '',
  echeance4Nom: '',
  echeance4Montant: '',
  echeance4DateLimite: '',
  echeance5Nom: '',
  echeance5Montant: '',
  echeance5DateLimite: '',

  responsablePrenom: '',
  responsableNom: '',
  responsableLien: '',
  responsableTelephone: '',
  responsableEmail: '',
  responsableProfession: '',
};

// ═══════════════════════════════════════════════════════════
// HELPERS CSV
// ═══════════════════════════════════════════════════════════

function escapeCsv(value: unknown, separator: string = ';'): string {
  const s = value == null ? '' : String(value);
  if (
    s.includes(separator) ||
    s.includes('"') ||
    s.includes('\n') ||
    s.includes('\r')
  ) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// ═══════════════════════════════════════════════════════════
// GÉNÉRATION CSV
// ═══════════════════════════════════════════════════════════

/**
 * Génère le template CSV (Excel FR compatible).
 *
 * - BOM UTF-8 (accents)
 * - Séparateur `;`
 * - Sauts de ligne CRLF
 * - 3 exemples + 3 lignes vides
 */
export function getImportTemplateCsv(): string {
  const SEP = ';';

  // En-tête
  const headerLine = IMPORT_HEADERS.map((h) => escapeCsv(h, SEP)).join(SEP);

  // Exemples
  const exemples = [EXEMPLE_COMPLET, EXEMPLE_MINIMAL, EXEMPLE_SANS_CLASSE];
  const exempleLines = exemples.map((ex) =>
    IMPORT_HEADERS.map((h) => escapeCsv(ex[h] ?? '', SEP)).join(SEP)
  );

  // Lignes vides pour permettre la saisie
  const emptyLine = IMPORT_HEADERS.map(() => '').join(SEP);
  const emptyLines = [emptyLine, emptyLine, emptyLine];

  const lines = [headerLine, ...exempleLines, ...emptyLines];

  // BOM UTF-8 + CRLF
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}

// ═══════════════════════════════════════════════════════════
// GÉNÉRATION XLSX (Excel natif, thème vert)
// ═══════════════════════════════════════════════════════════

/**
 * Couleurs du thème (emerald/green — cohérent avec l'app).
 */
const THEME = {
  headerBg: 'FF10B981', // emerald-500
  headerFg: 'FFFFFFFF', // blanc
  altRowBg: 'FFF9FAFB', // gris très clair
  obligatoireBg: 'FFFEF3C7', // amber-100 (colonne obligatoire)
  obligatoireFg: 'FF92400E', // amber-800
  guideHeaderBg: 'FF10B981',
  guideHeaderFg: 'FFFFFFFF',
  infoBg: 'FFECFDF5', // emerald-50
  infoBorder: 'FF10B981',
  requiredYes: 'FFEF4444', // red-500
  requiredNo: 'FF6B7280', // gray-500
} as const;

/**
 * Génère le fichier XLSX avec 3 feuilles :
 * - "Élèves"     : données + 3 exemples + 50 lignes vides
 * - "Guide"      : description de chaque colonne (thème vert)
 * - "À propos"   : instructions d'utilisation
 */
export async function generateExcelTemplate(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'School Management';
  wb.created = new Date();

  // ═══════════════════════════════════════════════════════
  // FEUILLE 1 : ÉLÈVES
  // ═══════════════════════════════════════════════════════

  const sheet = wb.addWorksheet('Élèves', {
    views: [{ state: 'frozen', ySplit: 1 }],
    properties: { defaultRowHeight: 20 },
  });

  // Colonnes avec largeur adaptée
  sheet.columns = IMPORT_HEADERS.map((h) => ({
    header: h,
    key: h,
    width: Math.max(h.length + 4, 14),
  }));

  // En-tête stylisé (fond vert, texte blanc, gras, centré)
  const headerRow = sheet.getRow(1);
  headerRow.font = {
    bold: true,
    size: 11,
    color: { argb: THEME.headerFg },
  };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: THEME.headerBg },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 28;

  // Bordures légères
  headerRow.eachCell((cell) => {
    cell.border = {
      bottom: { style: 'medium', color: { argb: THEME.headerBg } },
    };
  });

  // Ajouter les 3 exemples avec style
  const exemples = [EXEMPLE_COMPLET, EXEMPLE_MINIMAL, EXEMPLE_SANS_CLASSE];
  exemples.forEach((ex) => {
    const row = sheet.addRow(ex);
    row.font = { italic: true, color: { argb: 'FF6B7280' } };
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: THEME.altRowBg },
    };
  });

  // 50 lignes vides pour la saisie
  for (let i = 0; i < 50; i++) {
    sheet.addRow({});
  }

  // ═══════════════════════════════════════════════════════
  // FEUILLE 2 : GUIDE
  // ═══════════════════════════════════════════════════════

  const guideSheet = wb.addWorksheet('Guide');
  guideSheet.columns = [
    { header: 'Colonne', key: 'colonne', width: 25 },
    { header: 'Obligatoire', key: 'obligatoire', width: 14 },
    { header: 'Description', key: 'description', width: 60 },
    { header: 'Exemple', key: 'exemple', width: 28 },
  ];

  const guideHeader = guideSheet.getRow(1);
  guideHeader.font = {
    bold: true,
    size: 11,
    color: { argb: THEME.guideHeaderFg },
  };
  guideHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: THEME.guideHeaderBg },
  };
  guideHeader.alignment = { vertical: 'middle', horizontal: 'center' };
  guideHeader.height = 28;

  // Remplir le guide
  IMPORT_HEADERS.forEach((h) => {
    const info = HEADER_DESCRIPTIONS[h];
    const row = guideSheet.addRow({
      colonne: h,
      obligatoire: info.obligatoire ? '✅ Oui' : 'Non',
      description: info.description,
      exemple: info.exemple,
    });

    // Ligne obligatoire : texte en gras + fond ambré léger
    if (info.obligatoire) {
      row.font = { bold: true, size: 10 };
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFBEB' }, // amber-50
      };
    }

    // Colorer la cellule "Obligatoire"
    const obligatoireCell = row.getCell('obligatoire');
    obligatoireCell.alignment = { horizontal: 'center' };
    if (info.obligatoire) {
      obligatoireCell.font = {
        bold: true,
        color: { argb: THEME.requiredYes },
      };
    } else {
      obligatoireCell.font = { color: { argb: THEME.requiredNo } };
    }
  });

  // ═══════════════════════════════════════════════════════
  // FEUILLE 3 : À PROPOS
  // ═══════════════════════════════════════════════════════

  const infoSheet = wb.addWorksheet('À propos');
  infoSheet.columns = [{ key: 'ligne', width: 110 }];

  const infoLines: Array<{
    text: string;
    bold?: boolean;
    italic?: boolean;
    size?: number;
    color?: string;
    bg?: string;
  }> = [
    {
      text: '📤 IMPORT D\'ÉLÈVES — Guide de remplissage',
      bold: true,
      size: 16,
      color: 'FF10B981',
    },
    { text: '' },
    {
      text: 'Ce fichier permet d\'importer plusieurs élèves en une seule fois.',
      size: 11,
    },
    {
      text: 'Il peut aussi être utilisé pour exporter / ré-importer vos données.',
      size: 11,
    },
    { text: '' },
    {
      text: '⚠️ RÈGLES IMPORTANTES',
      bold: true,
      size: 13,
      color: 'FFDC2626',
    },
    {
      text: '  1. Ne modifiez JAMAIS les noms de colonnes (ligne 1)',
      size: 11,
    },
    {
      text: '  2. Les colonnes marquées "✅ Oui" dans le Guide sont OBLIGATOIRES',
      size: 11,
    },
    {
      text: '  3. Les colonnes vides à la fin peuvent être remplies pour ajouter des élèves',
      size: 11,
    },
    {
      text: '  4. Le sexe doit être "M" (masculin) ou "F" (féminin)',
      size: 11,
    },
    {
      text: '  5. Les dates doivent être au format YYYY-MM-DD (ex: 2010-05-15)',
      size: 11,
    },
    { text: '' },
    {
      text: '📋 COLONNES OBLIGATOIRES',
      bold: true,
      size: 13,
      color: 'FF10B981',
    },
    { text: '  - prenom', size: 11 },
    { text: '  - nom', size: 11 },
    { text: '  - sexe', size: 11 },
    { text: '  - dateNaissance', size: 11 },
    { text: '' },
    {
      text: '💡 COLONNES OPTIONNELLES UTILES',
      bold: true,
      size: 13,
      color: 'FF10B981',
    },
    {
      text: '  - classeCode : si la classe n\'existe pas, elle sera créée',
      size: 11,
    },
    {
      text: '  - anneeScolaireNom : si l\'année n\'existe pas, elle sera créée',
      size: 11,
    },
    {
      text: '  - planNom + planFraisInscription + planFraisScolarite : plan de scolarité',
      size: 11,
    },
    {
      text: '  - echeance1..5 : échéances du plan (nom + montant + date limite)',
      size: 11,
    },
    {
      text: '  - responsablePrenom + responsableNom : parent/tuteur',
      size: 11,
    },
    { text: '' },
    {
      text: '📥 COMMENT IMPORTER',
      bold: true,
      size: 13,
      color: 'FF10B981',
    },
    {
      text: '  1. Remplissez les lignes dans l\'onglet "Élèves"',
      size: 11,
    },
    {
      text: '  2. Enregistrez le fichier au format .xlsx',
      size: 11,
    },
    {
      text: '  3. Allez dans le tableau de bord → "Import élèves"',
      size: 11,
    },
    {
      text: '  4. Chargez ce fichier et lancez l\'import',
      size: 11,
    },
    { text: '' },
    {
      text: '❓ SUPPORT',
      bold: true,
      size: 13,
      color: 'FF10B981',
    },
    {
      text: '  Consultez l\'onglet "Guide" pour la description de chaque colonne.',
      size: 11,
      italic: true,
    },
  ];

  infoLines.forEach((line) => {
    const row = infoSheet.addRow({ ligne: line.text });
    const cell = row.getCell('ligne');

    if (line.bold) cell.font = { bold: true };
    if (line.italic) cell.font = { ...cell.font, italic: true };
    if (line.size) cell.font = { ...cell.font, size: line.size };
    if (line.color) {
      cell.font = { ...cell.font, color: { argb: line.color } };
    }
    if (line.bg) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: line.bg },
      };
    }
    cell.alignment = { vertical: 'middle', wrapText: true };
  });

  // Style de la première ligne (titre principal)
  const titleRow = infoSheet.getRow(1);
  titleRow.height = 30;

  // Retourner le buffer
  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}