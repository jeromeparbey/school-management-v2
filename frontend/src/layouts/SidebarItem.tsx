// frontend2/src/components/layout/SidebarItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
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
  // MODE PLIÉ : icône seule + tooltip
  // ═══════════════════════════════════════════════════════════
  if (isCollapsed) {
    return (
      <Link
        to={path}
        title={item.label}
        className={`
          group relative flex items-center justify-center
          w-full h-10 rounded-lg
          transition-colors duration-200
          ${
            isParentActive
              ? 'bg-[#10B981]/10 text-[#0A0A0A]'
              : 'text-black/50 hover:bg-black/[0.06] hover:text-black'
          }
        `}
      >
        {/* Trait émeraude à gauche si actif */}
        {isParentActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#10B981] rounded-r-full" />
        )}

        {/* Icône */}
        <Icon
          className={`w-[18px] h-[18px] ${
            isParentActive ? 'text-[#10B981]' : ''
          }`}
        />

        {/* Badge AMBRE */}
        {item.badgeKey && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F59E0B] ring-2 ring-[#FCFBF7]" />
        )}

        {/* Point "New" AMBRE */}
        {item.isNew && !item.badgeKey && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F59E0B] ring-2 ring-[#FCFBF7]" />
        )}

        {/* Tooltip */}
        <span
          className="
            absolute left-full ml-3 px-2.5 py-1.5 rounded-md
            bg-[#0A0A0A] text-[#F5F2EA] text-[11.5px] font-medium
            whitespace-nowrap opacity-0 invisible
            group-hover:opacity-100 group-hover:visible
            transition-all duration-150
            shadow-lg shadow-black/20
            pointer-events-none z-50
          "
        >
          {item.label}
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
        px-3 py-2 rounded-lg
        transition-colors duration-200
        ${
          isParentActive
            ? 'bg-[#10B981]/10 text-[#0A0A0A] font-semibold'
            : 'text-black/65 hover:bg-black/[0.06] hover:text-black'
        }
      `}
    >
      {/* Trait émeraude à gauche si actif */}
      {isParentActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#10B981] rounded-r-full" />
      )}

      {/* Icône nue */}
      <Icon
        className={`
          w-[17px] h-[17px] shrink-0 transition-colors
          ${
            isParentActive
              ? 'text-[#10B981]'
              : 'text-black/45 group-hover:text-black/75'
          }
        `}
      />

      {/* Label */}
      <span className="text-[13px] flex-1 truncate">{item.label}</span>

      {/* Badge numérique mono */}
      {item.badgeKey && (
        <span
          className={`
            px-1.5 min-w-[18px] h-[18px] text-[10px] font-mono font-semibold rounded-full shrink-0
            flex items-center justify-center
            ${
              isParentActive
                ? 'bg-[#10B981] text-white'
                : 'bg-[#F59E0B] text-[#0A0A0A]'
            }
          `}
        >
          {item.badgeKey}
        </span>
      )}

      {/* Indicateur NOUVEAU — point ambre */}
      {item.isNew && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0"
          title="Nouveau"
        />
      )}
    </Link>
  );
};

export default SidebarItem;