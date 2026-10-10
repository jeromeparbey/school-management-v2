// frontend2/src/config/navigation.types.ts

import type { ComponentType, SVGProps } from 'react';

// ============================================================
// RÔLES UTILISATEUR (9 rôles alignés avec le backend Prisma)
// ============================================================

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

// ============================================================
// PERMISSIONS (optionnel, pour un contrôle fin)
// ============================================================

export type Permission =
  // Élèves
  | 'eleve.read'
  | 'eleve.create'
  | 'eleve.update'
  | 'eleve.delete'
  // Enseignants
  | 'enseignant.read'
  | 'enseignant.create'
  | 'enseignant.update'
  | 'enseignant.delete'
  // Surveillants
  | 'surveillant.read'
  | 'surveillant.create'
  | 'surveillant.update'
  // Notes
  | 'note.read'
  | 'note.create'
  | 'note.update'
  | 'note.validate'
  // Bulletins
  | 'bulletin.read'
  | 'bulletin.generate'
  | 'bulletin.validate'
  // Paiements
  | 'paiement.read'
  | 'paiement.create'
  | 'paiement.cancel'
  // Paie
  | 'paie.read'
  | 'paie.create'
  | 'paie.approve'
  // Incidents
  | 'incident.read'
  | 'incident.create'
  | 'incident.resolve'
  // Bibliothèque
  | 'livre.read'
  | 'livre.create'
  | 'emprunt.create'
  | 'emprunt.return'
  // Communication
  | 'message.send'
  | 'communique.create'
  | 'communique.publish'
  // Administration
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'role.manage'
  | 'audit.read'
  | 'setting.manage'
  // Multi-tenant (SUPER_ADMIN)
  | 'etablissement.create'
  | 'etablissement.read'
  | 'etablissement.update'
  | 'etablissement.delete'
  | 'provisioning.run'
  | 'abonnement.manage';

// ============================================================
// TYPES DE BADGE (compteur dynamique)
// ============================================================

export type BadgeKey =
  // Communication
  | 'notifications'
  | 'messages'
  | 'chat'
  | 'communiques'
  // Scolarité
  | 'echeances'
  | 'paiements'
  | 'absences'
  | 'presences'
  // Personnel
  | 'heuresSupp'
  | 'avances'
  | 'reclamations'
  // Pédagogie
  | 'devoirs'
  | 'evaluations'
  // Vie scolaire
  | 'incidents'
  | 'surveillances'
  // Bibliothèque
  | 'emprunts'
  | 'retards'
  // Finances
  | 'reductions'
  // Système
  | 'audit'
  | 'backups';

// ============================================================
// INTERFACE : ITEM DE NAVIGATION
// ============================================================

export interface NavItem {
  /** Libellé affiché dans le menu */
  label: string;

  /** URL cible (optionnel si l'item a des enfants) */
  href?: string;

  /** Icône Heroicons */
  icon: ComponentType<SVGProps<SVGSVGElement>>;

  /**
   * Clé de badge pour afficher un compteur dynamique.
   * Ex: 'notifications', 'messages', 'absences'
   */
  badgeKey?: BadgeKey | string;

  /** Sous-menu (optionnel) */
  children?: NavItem[];

  /** Rôles autorisés (si absent = tous) */
  roles?: RoleUtilisateur[];

  /** Permission fine requise (ex: 'eleve.create') */
  permission?: Permission | string;

  /** Marquer comme "nouveau" (badge spécial) */
  isNew?: boolean;

  /** Désactiver l'item (grisé) */
  disabled?: boolean;

  /** Ouvrir dans un nouvel onglet */
  external?: boolean;

  /** Tooltip au survol */
  tooltip?: string;
}

// ============================================================
// INTERFACE : GROUPE DE NAVIGATION
// ============================================================

export interface NavGroup {
  /** Titre du groupe (section) */
  title: string;

  /** Items du groupe */
  items: NavItem[];

  /** Rôles autorisés (si absent = tous) */
  roles?: RoleUtilisateur[];

  /** Icône optionnelle du groupe */
  icon?: ComponentType<SVGProps<SVGSVGElement>>;

  /** Description du groupe (tooltip) */
  description?: string;

  /** Ordre d'affichage (optionnel, tri auto si absent) */
  order?: number;
}

// ============================================================
// INTERFACE : CONFIGURATION SIDEBAR COMPLÈTE
// ============================================================

export interface SidebarConfig {
  /** Map de rôles → groupes */
  groups: Record<RoleUtilisateur, NavGroup[]>;

  /** Badges dynamiques (à hydrater côté app) */
  badges?: Record<string, number>;

  /** Rôles actuels de l'utilisateur (un utilisateur peut avoir plusieurs rôles) */
  userRoles?: RoleUtilisateur[];
}

// ============================================================
// INTERFACE : ITEM DE NAVIGATION HYDRATÉ (avec badge calculé)
// ============================================================

export interface HydratedNavItem extends Omit<NavItem, 'children'> {
  /** Valeur du badge (0 = masqué) */
  badgeValue?: number;

  /** Enfants hydratés récursivement */
  children?: HydratedNavItem[];

  /** Item actif (route actuelle) */
  isActive?: boolean;

  /** Item ouvert (sous-menu déployé) */
  isOpen?: boolean;
}

// ============================================================
// HELPERS DE TYPE
// ============================================================

/** Vérifie si un rôle est valide */
export type IsValidRole<R> = R extends RoleUtilisateur ? true : false;

/** Map rôle → libellé lisible */
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

/** Map rôle → couleur (pour badges/ronds) */
export const ROLE_COLORS: Record<RoleUtilisateur, string> = {
  SUPER_ADMIN: 'bg-red-500',
  ADMIN: 'bg-purple-500',
  DIRECTEUR: 'bg-blue-600',
  SECRETAIRE: 'bg-cyan-500',
  ENSEIGNANT: 'bg-green-600',
  SURVEILLANT: 'bg-yellow-600',
  PARENT: 'bg-orange-500',
  ELEVE: 'bg-indigo-500',
  BIBLIOTHECAIRE: 'bg-pink-500',
};

/** Map rôle → description */
export const ROLE_DESCRIPTIONS: Record<RoleUtilisateur, string> = {
  SUPER_ADMIN: 'Accès total au système multi-tenant',
  ADMIN: 'Administration système de l\'établissement',
  DIRECTEUR: 'Direction et gestion de l\'établissement',
  SECRETAIRE: 'Gestion administrative et scolarité',
  ENSEIGNANT: 'Enseignement et évaluation des élèves',
  SURVEILLANT: 'Surveillance et discipline des élèves',
  PARENT: 'Suivi de la scolarité des enfants',
  ELEVE: 'Consultation des notes, devoirs et emploi du temps',
  BIBLIOTHECAIRE: 'Gestion de la bibliothèque et des emprunts',
};