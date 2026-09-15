// frontend2/src/config/navigation.types.ts
import type { ComponentType, SVGProps } from 'react';

export type RoleUtilisateur =
  | 'DIRECTEUR'
  | 'SECRETAIRE'
  | 'ENSEIGNANT'
  | 'PARENT'
  | 'ADMIN';

export interface NavItem {
  label: string;
  href?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Clé de badge : 'notifications' | 'absences' | 'paiements' | ... */
  badgeKey?: string;
  /** Sous-menu (optionnel) */
  children?: NavItem[];
  /** Rôles autorisés (si absent = tous) */
  roles?: RoleUtilisateur[];
  /** Permission fine (ex: 'eleve.create') */
  permission?: string;
  /** Marquer comme "nouveau" */
  isNew?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
  /** Rôles autorisés (si absent = tous) */
  roles?: RoleUtilisateur[];
}