// frontend2/src/components/layout/SidebarItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { NavItem } from '../config/navigation.types';
import { isNavItemActive, hasActiveChild } from '../config/navigation.types';

interface Props {
  item: NavItem;
  currentPath: string;
  isCollapsed?: boolean;
}

const SidebarItem: React.FC<Props> = ({
  item,
  currentPath,
  isCollapsed = false,
}) => {
  const isActive = isNavItemActive(item, currentPath);
  const hasActiveChildItem = hasActiveChild(item, currentPath);
  const isParentActive = isActive || hasActiveChildItem;

  const Icon = item.icon;
  const path = item.path ?? item.href ?? '#';

  // ═══════════════════════════════════════════════════════════
  // MODE PLIÉ : icône seule + tooltip au survol
  // ═══════════════════════════════════════════════════════════
  if (isCollapsed) {
    return (
      <Link
        to={path}
        title={item.label}
        className={`
          group relative flex items-center justify-center
          w-full h-11 rounded-xl
          transition-all duration-200
          ${
            isParentActive
              ? 'bg-white text-emerald-800 shadow-md shadow-emerald-900/20'
              : 'text-emerald-50 hover:bg-white/10 hover:text-white'
          }
        `}
      >
        {/* Barre latérale ambre si actif */}
        {isParentActive && (
          <motion.span
            layoutId="sidebar-active-bar"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full shadow-sm"
          />
        )}

        {/* Icône */}
        <Icon className="w-5 h-5" />

        {/* Badge (point discret en mode plié) */}
        {item.badgeKey && (
          <span
            className={`
              absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full
              ring-2
              ${
                isParentActive
                  ? 'bg-emerald-600 ring-emerald-800'
                  : 'bg-amber-400 ring-emerald-900'
              }
            `}
          />
        )}

        {/* Point "New" discret */}
        {item.isNew && !item.badgeKey && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-emerald-900 animate-pulse" />
        )}

        {/* 🆕 Tooltip au survol */}
        <span
          className="
            absolute left-full ml-3 px-3 py-1.5 rounded-lg
            bg-emerald-950 text-white text-xs font-medium
            whitespace-nowrap opacity-0 invisible
            group-hover:opacity-100 group-hover:visible
            transition-all duration-150
            shadow-xl shadow-emerald-950/40
            border border-emerald-800/50
            pointer-events-none z-50
          "
        >
          {item.label}
          {/* Flèche du tooltip */}
          <span
            className="
              absolute right-full top-1/2 -translate-y-1/2
              w-0 h-0
              border-y-4 border-y-transparent
              border-r-4 border-r-emerald-950
            "
          />
        </span>
      </Link>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // MODE NORMAL : icône + label + badges
  // ═══════════════════════════════════════════════════════════
  return (
    <Link
      to={path}
      className={`
        group relative flex items-center gap-3
        px-3 py-2.5 rounded-xl
        transition-all duration-200
        ${
          isParentActive
            ? 'bg-white text-emerald-800 font-semibold shadow-md shadow-emerald-900/20'
            : 'text-emerald-50 hover:bg-white/10 hover:text-white border border-transparent'
        }
      `}
    >
      {/* Barre latérale animée quand actif (ambre pour contraste) */}
      {isParentActive && (
        <motion.span
          layoutId="sidebar-active-bar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full shadow-sm"
        />
      )}

      {/* Icône */}
      <div
        className={`
          w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all
          ${
            isParentActive
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white/10 text-emerald-100 group-hover:bg-white/20 group-hover:text-white'
          }
        `}
      >
        {Icon && <Icon className="w-4 h-4" />}
      </div>

      {/* Label */}
      <span className="text-sm flex-1 truncate">{item.label}</span>

      {/* Badge */}
      {item.badgeKey && (
        <span
          className={`
            px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0
            ${
              isParentActive
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-400 text-emerald-900'
            }
          `}
        >
          {item.badgeKey}
        </span>
      )}

      {/* Indicateur NOUVEAU */}
      {item.isNew && (
        <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase bg-amber-400 text-emerald-900 rounded shrink-0">
          New
        </span>
      )}
    </Link>
  );
};

export default SidebarItem;