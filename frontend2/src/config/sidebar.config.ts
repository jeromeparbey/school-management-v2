// frontend2/src/config/sidebar.config.ts
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  CogIcon,
  BookOpenIcon,
  PencilSquareIcon,
  FolderOpenIcon,
  InboxIcon,
  BuildingOfficeIcon,
  ReceiptPercentIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { NavGroup, RoleUtilisateur } from './navigation.types';

// ============================================================
// GROUPE "PRINCIPAL" — commun à tous (dashboard)
// ============================================================
const dashboardItem = {
  label: 'Tableau de bord',
  href: '/dashboard',
  icon: HomeIcon,
};

// ============================================================
// SIDEBAR : DIRECTEUR
// ============================================================
const directeurSidebar: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      dashboardItem,
      { label: 'Statistiques', href: '/dashboard/statistiques', icon: ChartBarIcon },
    ],
  },
  {
    title: 'Scolarité',
    items: [
      {
        label: 'Élèves',
        icon: UserGroupIcon,
        href: '/dashboard/eleves',
        children: [
          { label: 'Liste des élèves', href: '/dashboard/eleves', icon: UserGroupIcon },
          { label: 'Inscriptions', href: '/dashboard/eleves/inscriptions', icon: ClipboardDocumentCheckIcon },
          { label: 'Responsables', href: '/dashboard/eleves/responsables', icon: UserCircleIcon },
        ],
      },
      { label: 'Classes', href: '/dashboard/classes', icon: BuildingOfficeIcon },
      { label: 'Matières', href: '/dashboard/matieres', icon: BookOpenIcon },
      {
        label: 'Notes & Bulletins',
        icon: DocumentTextIcon,
        href: '/dashboard/notes',
        children: [
          { label: 'Saisie des notes', href: '/dashboard/notes', icon: PencilSquareIcon },
          { label: 'Bulletins', href: '/dashboard/notes/bulletins', icon: DocumentTextIcon },
          { label: 'Appréciations', href: '/dashboard/notes/appreciations', icon: ChatBubbleLeftRightIcon },
        ],
      },
      { label: 'Emploi du temps', href: '/dashboard/emploi-temps', icon: CalendarIcon },
    ],
  },
  {
    title: 'Personnel',
    items: [
      {
        label: 'Enseignants',
        icon: AcademicCapIcon,
        href: '/dashboard/enseignants',
        children: [
          { label: 'Liste', href: '/dashboard/enseignants', icon: AcademicCapIcon },
          { label: 'Affectations', href: '/dashboard/enseignants/affectations', icon: ClipboardDocumentCheckIcon },
        ],
      },
      { label: 'Présences', href: '/dashboard/presences', icon: ClockIcon, badgeKey: 'presences' },
      { label: 'Heures supp.', href: '/dashboard/heures-supp', icon: ClockIcon, badgeKey: 'heuresSupp' },
      { label: 'Absences', href: '/dashboard/absences', icon: ExclamationTriangleIcon, badgeKey: 'absences' },
      { label: 'Réclamations', href: '/dashboard/reclamations', icon: ChatBubbleLeftRightIcon, badgeKey: 'reclamations' },
    ],
  },
  {
    title: 'Finances',
    items: [
      { label: 'Paiements', href: '/dashboard/paiements', icon: CurrencyDollarIcon },
      { label: 'Reçus', href: '/dashboard/recus', icon: InboxIcon },
      { label: 'Plans de scolarité', href: '/dashboard/plans-scolarite', icon: FolderOpenIcon },
      { label: 'Réductions', href: '/dashboard/reductions', icon: ReceiptPercentIcon, badgeKey: 'reductions' },
      { label: 'Avances', href: '/dashboard/avances', icon: BanknotesIcon, badgeKey: 'avances' },
      { label: 'Paie', href: '/dashboard/paie', icon: BanknotesIcon },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Années scolaires', href: '/dashboard/annees', icon: CalendarIcon },
      { label: 'Périodes', href: '/dashboard/periodes', icon: CalendarIcon },
      { label: 'Niveaux', href: '/dashboard/niveaux', icon: ChartBarIcon },
      { label: 'Règles d\'évaluation', href: '/dashboard/regles-evaluation', icon: ClipboardDocumentCheckIcon },
      { label: 'Utilisateurs', href: '/dashboard/utilisateurs', icon: UserGroupIcon },
      { label: 'Audit & Logs', href: '/dashboard/audit', icon: ShieldCheckIcon },
      { label: 'Paramètres', href: '/dashboard/parametres', icon: Cog6ToothIcon },
    ],
  },
];

// ============================================================
// SIDEBAR : SECRETAIRE
// ============================================================
const secretaireSidebar: NavGroup[] = [
  {
    title: 'Principal',
    items: [dashboardItem],
  },
  {
    title: 'Scolarité',
    items: [
      { label: 'Élèves', href: '/dashboard/eleves', icon: UserGroupIcon },
      { label: 'Inscriptions', href: '/dashboard/inscriptions', icon: ClipboardDocumentCheckIcon },
      { label: 'Responsables', href: '/dashboard/responsables', icon: UserCircleIcon },
      { label: 'Classes', href: '/dashboard/classes', icon: BuildingOfficeIcon },
      { label: 'Emploi du temps', href: '/dashboard/emploi-temps', icon: CalendarIcon },
    ],
  },
  {
    title: 'Finances',
    items: [
      { label: 'Paiements', href: '/dashboard/paiements', icon: CurrencyDollarIcon },
      { label: 'Nouveau paiement', href: '/dashboard/paiements/nouveau', icon: CurrencyDollarIcon },
      { label: 'Reçus', href: '/dashboard/recus', icon: InboxIcon },
      { label: 'Échéances', href: '/dashboard/echeances', icon: CalendarIcon, badgeKey: 'echeances' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Notifications', href: '/dashboard/notifications', icon: ChatBubbleLeftRightIcon, badgeKey: 'notifications' },
      { label: 'Emails envoyés', href: '/dashboard/emails', icon: EnvelopeIcon },
    ],
  },
];

// ============================================================
// SIDEBAR : ENSEIGNANT
// ============================================================
const enseignantSidebar: NavGroup[] = [
  {
    title: 'Principal',
    items: [dashboardItem],
  },
  {
    title: 'Ma pédagogie',
    items: [
      { label: 'Mes classes', href: '/dashboard/mes-classes', icon: BuildingOfficeIcon },
      { label: 'Mon emploi du temps', href: '/dashboard/mon-emploi-temps', icon: CalendarIcon },
      { label: 'Saisie des notes', href: '/dashboard/notes/saisie', icon: PencilSquareIcon },
      { label: 'Appréciations', href: '/dashboard/appreciations', icon: ChatBubbleLeftRightIcon },
      { label: 'Présences élèves', href: '/dashboard/presences-eleves', icon: ClipboardDocumentCheckIcon },
    ],
  },
  {
    title: 'Ma carrière',
    items: [
      { label: 'Mes présences', href: '/dashboard/mes-presences', icon: ClockIcon },
      { label: 'Mes heures supp.', href: '/dashboard/mes-heures-supp', icon: ClockIcon, badgeKey: 'heuresSupp' },
      { label: 'Mes absences', href: '/dashboard/mes-absences', icon: ExclamationTriangleIcon, badgeKey: 'absences' },
      { label: 'Mes avances', href: '/dashboard/mes-avances', icon: BanknotesIcon, badgeKey: 'avances' },
      { label: 'Ma paie', href: '/dashboard/ma-paie', icon: BanknotesIcon },
      { label: 'Mes réclamations', href: '/dashboard/mes-reclamations', icon: ChatBubbleLeftRightIcon, badgeKey: 'reclamations' },
    ],
  },
];

// ============================================================
// SIDEBAR : PARENT
// ============================================================
const parentSidebar: NavGroup[] = [
  {
    title: 'Principal',
    items: [dashboardItem],
  },
  {
    title: 'Mes enfants',
    items: [
      { label: 'Mes enfants', href: '/dashboard/mes-enfants', icon: UserGroupIcon },
      { label: 'Notes & Bulletins', href: '/dashboard/bulletins', icon: DocumentTextIcon },
      { label: 'Emploi du temps', href: '/dashboard/emploi-temps', icon: CalendarIcon },
      { label: 'Absences', href: '/dashboard/absences', icon: ExclamationTriangleIcon },
      { label: 'Appréciations', href: '/dashboard/appreciations', icon: ChatBubbleLeftRightIcon },
    ],
  },
  {
    title: 'Finances',
    items: [
      { label: 'Mes paiements', href: '/dashboard/mes-paiements', icon: CurrencyDollarIcon },
      { label: 'Échéances', href: '/dashboard/echeances', icon: CalendarIcon, badgeKey: 'echeances' },
      { label: 'Mes reçus', href: '/dashboard/mes-recus', icon: InboxIcon },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Notifications', href: '/dashboard/notifications', icon: ChatBubbleLeftRightIcon, badgeKey: 'notifications' },
      { label: 'Réclamations', href: '/dashboard/reclamations', icon: ChatBubbleLeftRightIcon },
    ],
  },
];

// ============================================================
// SIDEBAR : ADMIN
// ============================================================
const adminSidebar: NavGroup[] = [
  {
    title: 'Principal',
    items: [dashboardItem],
  },
  {
    title: 'Système',
    items: [
      { label: 'Utilisateurs', href: '/dashboard/utilisateurs', icon: UserGroupIcon },
      { label: 'Rôles & Permissions', href: '/dashboard/roles', icon: ShieldCheckIcon },
      { label: 'Sessions', href: '/dashboard/sessions', icon: UserCircleIcon },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Établissement', href: '/dashboard/etablissement', icon: BuildingOfficeIcon },
      { label: 'Paramètres système', href: '/dashboard/parametres', icon: CogIcon },
      { label: 'Années scolaires', href: '/dashboard/annees', icon: CalendarIcon },
      { label: 'Niveaux', href: '/dashboard/niveaux', icon: ChartBarIcon },
      { label: 'Matières', href: '/dashboard/matieres', icon: BookOpenIcon },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { label: 'Logs d\'audit', href: '/dashboard/audit', icon: ShieldCheckIcon },
      { label: 'Logs emails', href: '/dashboard/logs-email', icon: EnvelopeIcon },
      { label: 'Sauvegardes', href: '/dashboard/sauvegardes', icon: ArrowPathIcon },
    ],
  },
];

// ============================================================
// MAP GLOBAL
// ============================================================
export const SIDEBAR_CONFIG: Record<RoleUtilisateur, NavGroup[]> = {
  DIRECTEUR: directeurSidebar,
  SECRETAIRE: secretaireSidebar,
  ENSEIGNANT: enseignantSidebar,
  PARENT: parentSidebar,
  ADMIN: adminSidebar,
};

/**
 * Récupère la config sidebar pour un rôle donné.
 * Filtre aussi les items selon `roles` si défini.
 */
export function getSidebarForRole(role?: RoleUtilisateur): NavGroup[] {
  if (!role) return [];
  const groups = SIDEBAR_CONFIG[role] ?? [];
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => !it.roles || it.roles.includes(role)),
    }))
    .filter((g) => (!g.roles || g.roles.includes(role)) && g.items.length > 0);
}