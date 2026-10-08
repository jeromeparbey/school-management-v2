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
  // Nouveaux imports
  BellIcon,
  ClipboardDocumentListIcon,
  FlagIcon,
  Squares2X2Icon,
  QueueListIcon,
  MegaphoneIcon,
  PaperClipIcon,
  TrophyIcon,
  BeakerIcon,
  LightBulbIcon,
  LifebuoyIcon,
  ArchiveBoxIcon,
  UsersIcon,
  GlobeAltIcon,
  CreditCardIcon,
  LockClosedIcon,
  ServerIcon,
  PresentationChartLineIcon,
  PhoneIcon,
  MapPinIcon,
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
      { label: 'Rapports', href: '/dashboard/rapports', icon: PresentationChartLineIcon },
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
          { label: 'Bulletins', href: '/dashboard/eleves/bulletins', icon: DocumentTextIcon },
        ],
      },
      { label: 'Classes', href: '/dashboard/classes', icon: BuildingOfficeIcon },
      { label: 'Matières', href: '/dashboard/matieres', icon: BookOpenIcon },
      { label: 'Niveaux', href: '/dashboard/niveaux', icon: Squares2X2Icon },
      {
        label: 'Notes & Bulletins',
        icon: DocumentTextIcon,
        href: '/dashboard/notes',
        children: [
          { label: 'Saisie des notes', href: '/dashboard/notes', icon: PencilSquareIcon },
          { label: 'Bulletins', href: '/dashboard/notes/bulletins', icon: DocumentTextIcon },
          { label: 'Appréciations', href: '/dashboard/notes/appreciations', icon: ChatBubbleLeftRightIcon },
          { label: 'Règles d\'évaluation', href: '/dashboard/notes/regles', icon: ClipboardDocumentListIcon },
        ],
      },
      { label: 'Emploi du temps', href: '/dashboard/emploi-temps', icon: CalendarIcon },
      { label: 'Documents', href: '/dashboard/documents', icon: FolderOpenIcon },
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
          { label: 'Historique salaires', href: '/dashboard/enseignants/salaires', icon: BanknotesIcon },
        ],
      },
      {
        label: 'Surveillants',
        icon: ShieldCheckIcon,
        href: '/dashboard/surveillants',
        children: [
          { label: 'Liste', href: '/dashboard/surveillants', icon: ShieldCheckIcon },
          { label: 'Zones', href: '/dashboard/surveillants/zones', icon: MapPinIcon },
        ],
      },
      { label: 'Présences', href: '/dashboard/presences', icon: ClockIcon, badgeKey: 'presences' },
      { label: 'Heures supp.', href: '/dashboard/heures-supp', icon: ClockIcon, badgeKey: 'heuresSupp' },
      { label: 'Absences', href: '/dashboard/absences', icon: ExclamationTriangleIcon, badgeKey: 'absences' },
      { label: 'Réclamations', href: '/dashboard/reclamations', icon: ChatBubbleLeftRightIcon, badgeKey: 'reclamations' },
      { label: 'Avances', href: '/dashboard/avances', icon: BanknotesIcon, badgeKey: 'avances' },
    ],
  },
  {
    title: 'Finances',
    items: [
      { label: 'Paiements', href: '/dashboard/paiements', icon: CurrencyDollarIcon },
      { label: 'Reçus', href: '/dashboard/recus', icon: InboxIcon },
      { label: 'Plans de scolarité', href: '/dashboard/plans-scolarite', icon: FolderOpenIcon },
      { label: 'Échéances', href: '/dashboard/echeances', icon: CalendarIcon, badgeKey: 'echeances' },
      { label: 'Réductions', href: '/dashboard/reductions', icon: ReceiptPercentIcon, badgeKey: 'reductions' },
      { label: 'Paie', href: '/dashboard/paie', icon: BanknotesIcon },
      { label: 'Historique salaires', href: '/dashboard/historique-salaires', icon: ChartBarIcon },
    ],
  },
  {
    title: 'Pédagogie',
    items: [
      { label: 'Groupes TD', href: '/dashboard/groupes-td', icon: UsersIcon },
      { label: 'Objectifs', href: '/dashboard/objectifs', icon: FlagIcon },
      { label: 'Bibliothèque', href: '/dashboard/bibliotheque', icon: BookOpenIcon },
      { label: 'Emprunts', href: '/dashboard/emprunts', icon: ArchiveBoxIcon },
    ],
  },
  {
    title: 'Vie scolaire',
    items: [
      { label: 'Incidents', href: '/dashboard/incidents', icon: ExclamationTriangleIcon, badgeKey: 'incidents' },
      { label: 'Surveillances', href: '/dashboard/surveillances', icon: ShieldCheckIcon },
      { label: 'Communiqués', href: '/dashboard/communiques', icon: MegaphoneIcon },
      { label: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, badgeKey: 'messages' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Années scolaires', href: '/dashboard/annees', icon: CalendarIcon },
      { label: 'Périodes', href: '/dashboard/periodes', icon: CalendarIcon },
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
      { label: 'Communiqués', href: '/dashboard/communiques', icon: MegaphoneIcon },
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
    title: 'Mes activités',
    items: [
      { label: 'Mes groupes TD', href: '/dashboard/mes-groupes-td', icon: UsersIcon },
      { label: 'Mes objectifs', href: '/dashboard/mes-objectifs', icon: FlagIcon },
      { label: 'Mes documents', href: '/dashboard/mes-documents', icon: FolderOpenIcon },
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
  {
    title: 'Communication',
    items: [
      { label: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, badgeKey: 'messages' },
      { label: 'Communiqués', href: '/dashboard/communiques', icon: MegaphoneIcon },
      { label: 'Chat', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon, badgeKey: 'chat' },
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
      { label: 'Absences', href: '/dashboard/absences', icon: ExclamationTriangleIcon, badgeKey: 'absences' },
      { label: 'Appréciations', href: '/dashboard/appreciations', icon: ChatBubbleLeftRightIcon },
      { label: 'Objectifs', href: '/dashboard/objectifs', icon: FlagIcon },
      { label: 'Incidents', href: '/dashboard/incidents', icon: ExclamationTriangleIcon, badgeKey: 'incidents' },
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
      { label: 'Notifications', href: '/dashboard/notifications', icon: BellIcon, badgeKey: 'notifications' },
      { label: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, badgeKey: 'messages' },
      { label: 'Communiqués', href: '/dashboard/communiques', icon: MegaphoneIcon },
      { label: 'Chat', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon, badgeKey: 'chat' },
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
      { label: 'Permissions', href: '/dashboard/permissions', icon: LockClosedIcon },
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
      { label: 'Périodes', href: '/dashboard/periodes', icon: CalendarIcon },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { label: 'Logs d\'audit', href: '/dashboard/audit', icon: ShieldCheckIcon },
      { label: 'Logs emails', href: '/dashboard/logs-email', icon: EnvelopeIcon },
      { label: 'Statistiques serveur', href: '/dashboard/stats-serveur', icon: ServerIcon },
      { label: 'Sauvegardes', href: '/dashboard/sauvegardes', icon: ArrowPathIcon },
    ],
  },
  {
    title: 'Multi-tenant',
    items: [
      { label: 'Établissements', href: '/dashboard/etablissements', icon: BuildingOfficeIcon },
      { label: 'Schémas', href: '/dashboard/schemas', icon: CogIcon },
      { label: 'Provisioning', href: '/dashboard/provisioning', icon: ServerIcon },
    ],
  },
];

// ============================================================
// SIDEBAR : SUPER_ADMIN
// ============================================================
const superAdminSidebar: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      dashboardItem,
      { label: 'Statistiques globales', href: '/dashboard/statistiques-globales', icon: ChartBarIcon },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { label: 'Établissements', href: '/dashboard/etablissements', icon: BuildingOfficeIcon },
      { label: 'Nouvel établissement', href: '/dashboard/etablissements/nouveau', icon: BuildingOfficeIcon },
      { label: 'Provisioning', href: '/dashboard/provisioning', icon: ServerIcon },
      { label: 'Abonnements', href: '/dashboard/abonnements', icon: CreditCardIcon },
      { label: 'Factures', href: '/dashboard/factures', icon: CurrencyDollarIcon },
    ],
  },
  {
    title: 'Super Admins',
    items: [
      { label: 'Utilisateurs globaux', href: '/dashboard/utilisateurs-globaux', icon: UserGroupIcon },
      { label: 'Rôles globaux', href: '/dashboard/roles-globaux', icon: ShieldCheckIcon },
    ],
  },
  {
    title: 'Système',
    items: [
      { label: 'Logs d\'audit', href: '/dashboard/audit', icon: ShieldCheckIcon },
      { label: 'Statistiques serveur', href: '/dashboard/stats-serveur', icon: ServerIcon },
      { label: 'Sauvegardes', href: '/dashboard/sauvegardes', icon: ArrowPathIcon },
      { label: 'Configuration', href: '/dashboard/config', icon: CogIcon },
    ],
  },
];

// ============================================================
// SIDEBAR : SURVEILLANT
// ============================================================
const surveillantSidebar: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      dashboardItem,
      { label: 'Mes statistiques', href: '/dashboard/mes-statistiques', icon: ChartBarIcon },
    ],
  },
  {
    title: 'Ma surveillance',
    items: [
      { label: 'Mes zones', href: '/dashboard/mes-zones', icon: MapPinIcon },
      { label: 'Surveillances', href: '/dashboard/surveillances', icon: ShieldCheckIcon },
      { label: 'Planning', href: '/dashboard/mon-planning', icon: CalendarIcon },
    ],
  },
  {
    title: 'Incidents',
    items: [
      { label: 'Signaler un incident', href: '/dashboard/incidents/signaler', icon: ExclamationTriangleIcon },
      { label: 'Mes incidents', href: '/dashboard/mes-incidents', icon: ExclamationTriangleIcon, badgeKey: 'incidents' },
      { label: 'Incidents traités', href: '/dashboard/incidents/traites', icon: ClipboardDocumentCheckIcon },
    ],
  },
  {
    title: 'Élèves',
    items: [
      { label: 'Rechercher un élève', href: '/dashboard/eleves/recherche', icon: UserGroupIcon },
      { label: 'Présences élèves', href: '/dashboard/presences-eleves', icon: ClipboardDocumentCheckIcon },
      { label: 'Absences', href: '/dashboard/absences-eleves', icon: ExclamationTriangleIcon },
    ],
  },
  {
    title: 'Ma carrière',
    items: [
      { label: 'Mes présences', href: '/dashboard/mes-presences', icon: ClockIcon },
      { label: 'Mes absences', href: '/dashboard/mes-absences', icon: ExclamationTriangleIcon, badgeKey: 'absences' },
      { label: 'Mes réclamations', href: '/dashboard/mes-reclamations', icon: ChatBubbleLeftRightIcon, badgeKey: 'reclamations' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, badgeKey: 'messages' },
      { label: 'Communiqués', href: '/dashboard/communiques', icon: MegaphoneIcon },
    ],
  },
];

// ============================================================
// SIDEBAR : ELEVE
// ============================================================
const eleveSidebar: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      dashboardItem,
      { label: 'Mon profil', href: '/dashboard/mon-profil', icon: UserCircleIcon },
    ],
  },
  {
    title: 'Ma scolarité',
    items: [
      { label: 'Mes notes', href: '/dashboard/mes-notes', icon: DocumentTextIcon },
      { label: 'Mes bulletins', href: '/dashboard/mes-bulletins', icon: DocumentTextIcon },
      { label: 'Mon emploi du temps', href: '/dashboard/mon-emploi-temps', icon: CalendarIcon },
      { label: 'Mes matières', href: '/dashboard/mes-matieres', icon: BookOpenIcon },
      { label: 'Mes professeurs', href: '/dashboard/mes-professeurs', icon: AcademicCapIcon },
    ],
  },
  {
    title: 'Mes activités',
    items: [
      { label: 'Mes objectifs', href: '/dashboard/mes-objectifs', icon: FlagIcon },
      { label: 'Mes groupes TD', href: '/dashboard/mes-groupes-td', icon: UsersIcon },
      { label: 'Mes documents', href: '/dashboard/mes-documents', icon: FolderOpenIcon },
      { label: 'Mes épreuves', href: '/dashboard/mes-epreuves', icon: PencilSquareIcon },
      { label: 'Mes corrections', href: '/dashboard/mes-corrections', icon: ClipboardDocumentListIcon },
    ],
  },
  {
    title: 'Ma scolarité pratique',
    items: [
      { label: 'Mes présences', href: '/dashboard/mes-presences', icon: ClockIcon },
      { label: 'Mes absences', href: '/dashboard/mes-absences', icon: ExclamationTriangleIcon },
      { label: 'Mes appréciations', href: '/dashboard/mes-appreciations', icon: ChatBubbleLeftRightIcon },
    ],
  },
  {
    title: 'Bibliothèque',
    items: [
      { label: 'Catalogue', href: '/dashboard/bibliotheque', icon: BookOpenIcon },
      { label: 'Mes emprunts', href: '/dashboard/mes-emprunts', icon: ArchiveBoxIcon },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, badgeKey: 'messages' },
      { label: 'Communiqués', href: '/dashboard/communiques', icon: MegaphoneIcon },
      { label: 'Chat', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon, badgeKey: 'chat' },
    ],
  },
  {
    title: 'Aide',
    items: [
      { label: 'Support', href: '/dashboard/support', icon: LifebuoyIcon },
      { label: 'FAQ', href: '/dashboard/faq', icon: LightBulbIcon },
    ],
  },
];

// ============================================================
// SIDEBAR : BIBLIOTHECAIRE
// ============================================================
const bibliothecaireSidebar: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      dashboardItem,
      { label: 'Statistiques', href: '/dashboard/statistiques', icon: ChartBarIcon },
    ],
  },
  {
    title: 'Bibliothèque',
    items: [
      { label: 'Livres', href: '/dashboard/livres', icon: BookOpenIcon },
      { label: 'Nouveau livre', href: '/dashboard/livres/nouveau', icon: BookOpenIcon },
      { label: 'Catégories', href: '/dashboard/categories-livres', icon: Squares2X2Icon },
      { label: 'Auteurs', href: '/dashboard/auteurs', icon: UserCircleIcon },
    ],
  },
  {
    title: 'Emprunts',
    items: [
      { label: 'Emprunts en cours', href: '/dashboard/emprunts', icon: ArchiveBoxIcon, badgeKey: 'emprunts' },
      { label: 'Nouvel emprunt', href: '/dashboard/emprunts/nouveau', icon: ArchiveBoxIcon },
      { label: 'Retours', href: '/dashboard/retours', icon: ArrowPathIcon },
      { label: 'Emprunts en retard', href: '/dashboard/emprunts/retard', icon: ExclamationTriangleIcon, badgeKey: 'retards' },
      { label: 'Pénalités', href: '/dashboard/penalites', icon: CurrencyDollarIcon },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, badgeKey: 'messages' },
      { label: 'Communiqués', href: '/dashboard/communiques', icon: MegaphoneIcon },
    ],
  },
];

// ============================================================
// MAP GLOBAL
// ============================================================

export const SIDEBAR_CONFIG: Record<RoleUtilisateur, NavGroup[]> = {
  SUPER_ADMIN: superAdminSidebar,
  DIRECTEUR: directeurSidebar,
  SECRETAIRE: secretaireSidebar,
  ENSEIGNANT: enseignantSidebar,
  SURVEILLANT: surveillantSidebar,
  PARENT: parentSidebar,
  ELEVE: eleveSidebar,
  ADMIN: adminSidebar,
  BIBLIOTHECAIRE: bibliothecaireSidebar,
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