// frontend2/src/config/navigation.types.ts

import type { ComponentType, SVGProps } from 'react';

// ═══════════════════════════════════════════════════════════
// RÔLES UTILISATEUR (9 rôles alignés avec le backend Prisma)
// ═══════════════════════════════════════════════════════════

/**
 * Rôles disponibles dans l'application.
 * Chaque rôle détermine les menus accessibles et les permissions.
 */
export type RoleUtilisateur =
  | 'SUPER_ADMIN'      // Administrateur global multi-tenant (catalogue)
  | 'ADMIN'            // Administrateur système de l'établissement
  | 'DIRECTEUR'        // Directeur d'établissement
  | 'SECRETAIRE'       // Secrétaire
  | 'ENSEIGNANT'       // Enseignant
  | 'SURVEILLANT'      // Surveillant
  | 'PARENT'           // Parent d'élève
  | 'ELEVE'            // Élève
  | 'BIBLIOTHECAIRE';  // Bibliothécaire

// ═══════════════════════════════════════════════════════════
// PERMISSIONS FINES
// ═══════════════════════════════════════════════════════════

/**
 * Permissions granulaires pour un contrôle fin d'accès.
 * Un item peut être conditionné par une permission (en plus du rôle).
 *
 * Convention : `<entité>.<action>` (ex: `eleve.create`, `note.validate`)
 */
export type Permission =
  // ─── Élèves ───
  | 'eleve.read'
  | 'eleve.create'
  | 'eleve.update'
  | 'eleve.delete'
  | 'eleve.import'
  | 'eleve.export'
  // ─── Enseignants ───
  | 'enseignant.read'
  | 'enseignant.create'
  | 'enseignant.update'
  | 'enseignant.delete'
  // ─── Surveillants ───
  | 'surveillant.read'
  | 'surveillant.create'
  | 'surveillant.update'
  // ─── Notes ───
  | 'note.read'
  | 'note.create'
  | 'note.update'
  | 'note.validate'
  // ─── Bulletins ───
  | 'bulletin.read'
  | 'bulletin.generate'
  | 'bulletin.validate'
  // ─── Paiements ───
  | 'paiement.read'
  | 'paiement.create'
  | 'paiement.cancel'
  // ─── Paie ───
  | 'paie.read'
  | 'paie.create'
  | 'paie.approve'
  // ─── Incidents ───
  | 'incident.read'
  | 'incident.create'
  | 'incident.resolve'
  // ─── Bibliothèque ───
  | 'livre.read'
  | 'livre.create'
  | 'emprunt.create'
  | 'emprunt.return'
  // ─── Communication ───
  | 'message.send'
  | 'communique.create'
  | 'communique.publish'
  // ─── Administration ───
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'role.manage'
  | 'audit.read'
  | 'setting.manage'
  // ─── Multi-tenant (SUPER_ADMIN) ───
  | 'etablissement.create'
  | 'etablissement.read'
  | 'etablissement.update'
  | 'etablissement.delete'
  | 'provisioning.run'
  | 'abonnement.manage';

// ═══════════════════════════════════════════════════════════
// CLÉS DE BADGE (compteurs dynamiques)
// ═══════════════════════════════════════════════════════════

/**
 * Clés de badge connues. Chaque clé correspond à un compteur
 * hydraté dynamiquement côté application (ex: nombre de messages non lus).
 */
export type BadgeKey =
  // ─── Communication ───
  | 'notifications'
  | 'messages'
  | 'chat'
  | 'communiques'
  // ─── Scolarité ───
  | 'echeances'
  | 'paiements'
  | 'absences'
  | 'presences'
  // ─── Personnel ───
  | 'heuresSupp'
  | 'avances'
  | 'reclamations'
  // ─── Pédagogie ───
  | 'devoirs'
  | 'evaluations'
  // ─── Vie scolaire ───
  | 'incidents'
  | 'surveillances'
  // ─── Bibliothèque ───
  | 'emprunts'
  | 'retards'
  // ─── Finances ───
  | 'reductions'
  // ─── Système ───
  | 'audit'
  | 'backups';

/** Variantes visuelles de badge */
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

/** Configuration d'un badge affiché sur un item */
export interface BadgeConfig {
  /** Valeur numérique affichée */
  value: number;
  /** Variante visuelle (couleur) */
  variant?: BadgeVariant;
  /** Afficher un point pulsant au lieu d'un nombre */
  dot?: boolean;
}

// ═══════════════════════════════════════════════════════════
// ICÔNE
// ═══════════════════════════════════════════════════════════

/**
 * Type d'une icône Heroicons (composant SVG).
 */
export type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

// ═══════════════════════════════════════════════════════════
// ITEM DE NAVIGATION
// ═══════════════════════════════════════════════════════════

/**
 * Un élément du menu latéral.
 * Peut être simple (lien direct) ou avoir des enfants (sous-menu).
 */
export interface NavItem {
  /** Libellé affiché dans le menu */
  label: string;

  /** Chemin de la route (obligatoire si pas d'enfants) */
  path?: string;

  /** Alias pour `path` — utilisé dans certains anciens codes */
  href?: string;

  /** Icône Heroicons */
  icon: NavIcon;

  /**
   * Clé de badge pour afficher un compteur dynamique.
   * Ex: 'notifications', 'messages', 'absences'
   */
  badgeKey?: BadgeKey | string;

  /** Sous-menu (optionnel) */
  children?: NavItem[];

  /** Rôles autorisés (si absent = tous les rôles) */
  roles?: RoleUtilisateur[];

  /** Permission fine requise (ex: 'eleve.create') */
  permission?: Permission | string;

  /** Marquer comme "nouveau" (badge spécial NOUVEAU) */
  isNew?: boolean;

  /** Désactiver l'item (grisé, non cliquable) */
  disabled?: boolean;

  /** Ouvrir dans un nouvel onglet */
  external?: boolean;

  /** Tooltip au survol */
  tooltip?: string;

  /** Description longue (page d'aide, breadcrumb) */
  description?: string;

  /** Ordre d'affichage (tri auto si absent) */
  order?: number;
}

// ═══════════════════════════════════════════════════════════
// GROUPE DE NAVIGATION
// ═══════════════════════════════════════════════════════════

/**
 * Un groupe de navigation (section du sidebar).
 * Regroupe plusieurs `NavItem` sous un même titre.
 */
export interface NavGroup {
  /** Titre du groupe (section) */
  title: string;

  /** Items du groupe */
  items: NavItem[];

  /** Rôles autorisés (si absent = tous) */
  roles?: RoleUtilisateur[];

  /** Icône optionnelle du groupe */
  icon?: NavIcon;

  /** Description du groupe (tooltip) */
  description?: string;

  /** Ordre d'affichage (tri auto si absent) */
  order?: number;

  /** Groupe ouvert par défaut (si un item n'est pas actif) */
  defaultOpen?: boolean;

  /** Masquer le titre du groupe (afficher uniquement les items) */
  hideTitle?: boolean;
}

// ═══════════════════════════════════════════════════════════
// CONFIGURATION SIDEBAR
// ═══════════════════════════════════════════════════════════

/**
 * Configuration complète du sidebar pour un ou plusieurs rôles.
 */
export interface SidebarConfig {
  /** Map de rôles → groupes */
  groups: Record<RoleUtilisateur, NavGroup[]>;

  /** Badges dynamiques (à hydrater côté app) */
  badges?: Record<string, number>;

  /** Rôles actuels de l'utilisateur (multi-rôles supporté) */
  userRoles?: RoleUtilisateur[];
}

// ═══════════════════════════════════════════════════════════
// ITEM HYDRATÉ (avec état calculé)
// ═══════════════════════════════════════════════════════════

/**
 * Item de navigation après hydratation :
 * - Le badge est calculé (valeur numérique)
 * - L'état actif est déterminé (route actuelle)
 * - L'état ouvert est déterminé (sous-menu)
 */
export interface HydratedNavItem extends Omit<NavItem, 'children'> {
  /** Valeur du badge (0 = masqué) */
  badgeValue?: number;

  /** Configuration complète du badge */
  badge?: BadgeConfig;

  /** Enfants hydratés récursivement */
  children?: HydratedNavItem[];

  /** Item actif (route actuelle) */
  isActive?: boolean;

  /** Item ouvert (sous-menu déployé) */
  isOpen?: boolean;

  /** Item visible (filtrage par rôle/permission) */
  isVisible?: boolean;
}

/**
 * Groupe après hydratation.
 */
export interface HydratedNavGroup extends Omit<NavGroup, 'items'> {
  items: HydratedNavItem[];
  isOpen?: boolean;
}

// ═══════════════════════════════════════════════════════════
// BREADCRUMB
// ═══════════════════════════════════════════════════════════

/**
 * Élément de breadcrumb (fil d'Ariane).
 */
export interface NavBreadcrumb {
  label: string;
  path?: string;
  icon?: NavIcon;
}

// ═══════════════════════════════════════════════════════════
// HELPERS DE TYPE
// ═══════════════════════════════════════════════════════════

/** Vérifie qu'un rôle est valide (type guard) */
export type IsValidRole<R> = R extends RoleUtilisateur ? true : false;

/** Rôle considéré comme "staff" (accès dashboard admin) */
export type StaffRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'DIRECTEUR'
  | 'SECRETAIRE'
  | 'ENSEIGNANT'
  | 'SURVEILLANT'
  | 'BIBLIOTHECAIRE';

/** Rôle considéré comme "utilisateur final" (accès dashboard personnel) */
export type PersonalRole = 'PARENT' | 'ELEVE';

// ═══════════════════════════════════════════════════════════
// MAPPINGS : RÔLES
// ═══════════════════════════════════════════════════════════

/** Libellé lisible d'un rôle */
export const ROLE_LABELS: Record<RoleUtilisateur, string> = {
  SUPER_ADMIN: 'Super Administrateur',
  ADMIN: 'Administrateur',
  DIRECTEUR: 'Directeur',
  SECRETAIRE: 'Secrétaire',
  ENSEIGNANT: 'Enseignant',
  SURVEILLANT: 'Surveillant',
  PARENT: 'Parent',
  ELEVE: 'Élève',
  BIBLIOTHECAIRE: 'Bibliothécaire',
};

/** Couleur principale d'un rôle (Tailwind, compatible thème sombre) */
export const ROLE_COLORS: Record<RoleUtilisateur, string> = {
  SUPER_ADMIN: 'bg-rose-500',
  ADMIN: 'bg-violet-500',
  DIRECTEUR: 'bg-emerald-500',
  SECRETAIRE: 'bg-teal-500',
  ENSEIGNANT: 'bg-green-500',
  SURVEILLANT: 'bg-amber-500',
  PARENT: 'bg-orange-500',
  ELEVE: 'bg-sky-500',
  BIBLIOTHECAIRE: 'bg-fuchsia-500',
};

/** Couleur texte d'un rôle (pour badges sur fond sombre) */
export const ROLE_TEXT_COLORS: Record<RoleUtilisateur, string> = {
  SUPER_ADMIN: 'text-rose-300',
  ADMIN: 'text-violet-300',
  DIRECTEUR: 'text-emerald-300',
  SECRETAIRE: 'text-teal-300',
  ENSEIGNANT: 'text-green-300',
  SURVEILLANT: 'text-amber-300',
  PARENT: 'text-orange-300',
  ELEVE: 'text-sky-300',
  BIBLIOTHECAIRE: 'text-fuchsia-300',
};

/** Description courte d'un rôle */
export const ROLE_DESCRIPTIONS: Record<RoleUtilisateur, string> = {
  SUPER_ADMIN: 'Accès total au système multi-tenant',
  ADMIN: "Administration système de l'établissement",
  DIRECTEUR: "Direction et gestion de l'établissement",
  SECRETAIRE: 'Gestion administrative et scolarité',
  ENSEIGNANT: 'Enseignement et évaluation des élèves',
  SURVEILLANT: 'Surveillance et discipline des élèves',
  PARENT: 'Suivi de la scolarité des enfants',
  ELEVE: 'Consultation des notes, devoirs et emploi du temps',
  BIBLIOTHECAIRE: 'Gestion de la bibliothèque et des emprunts',
};

/** Ordre d'affichage des rôles (du plus privilégié au moins privilégié) */
export const ROLE_HIERARCHY: RoleUtilisateur[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'DIRECTEUR',
  'SECRETAIRE',
  'ENSEIGNANT',
  'SURVEILLANT',
  'BIBLIOTHECAIRE',
  'PARENT',
  'ELEVE',
];

// ═══════════════════════════════════════════════════════════
// HELPERS FONCTIONNELS
// ═══════════════════════════════════════════════════════════

/** Vérifie si un item est actif pour un chemin donné */
export function isNavItemActive(item: NavItem, currentPath: string): boolean {
  const path = item.path ?? item.href;
  if (!path) return false;
  if (path === '/dashboard') return currentPath === '/dashboard';
  return currentPath === path || currentPath.startsWith(path + '/');
}

/** Vérifie si un item a un sous-menu actif */
export function hasActiveChild(item: NavItem, currentPath: string): boolean {
  if (!item.children || item.children.length === 0) return false;
  return item.children.some(
    (child) => isNavItemActive(child, currentPath) || hasActiveChild(child, currentPath)
  );
}

/** Vérifie si un item est visible pour un rôle donné */
export function isNavItemVisible(
  item: NavItem,
  role: RoleUtilisateur | undefined
): boolean {
  if (item.disabled) return false;
  if (!item.roles || item.roles.length === 0) return true;
  if (!role) return false;
  return item.roles.includes(role);
}

/** Vérifie si un groupe est visible pour un rôle donné */
export function isNavGroupVisible(
  group: NavGroup,
  role: RoleUtilisateur | undefined
): boolean {
  if (group.roles && group.roles.length > 0) {
    if (!role) return false;
    if (!group.roles.includes(role)) return false;
  }
  return group.items.some((item) => isNavItemVisible(item, role));
}

/** Compte le nombre d'items dans un groupe (récursif) */
export function countNavItems(items: NavItem[]): number {
  return items.reduce(
    (sum, item) => sum + 1 + (item.children ? countNavItems(item.children) : 0),
    0
  );
}