// frontend2/src/components/layout/SidebarGroup.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { NavGroup } from '../config/navigation.types';
import { isNavItemActive, hasActiveChild } from '../config/navigation.types';
import SidebarItem from './SidebarItem';

interface Props {
  group: NavGroup;
  currentPath: string;
  isCollapsed?: boolean;
}

const SidebarGroup: React.FC<Props> = ({
  group,
  currentPath,
  isCollapsed = false,
}) => {
  // ✅ Détection robuste d'item actif (helpers gèrent path undefined)
  const hasActiveItem = useMemo(
    () =>
      group.items.some(
        (item) =>
          isNavItemActive(item, currentPath) || hasActiveChild(item, currentPath)
      ),
    [group.items, currentPath]
  );

  const [isOpen, setIsOpen] = useState(hasActiveItem);

  // ═══════════════════════════════════════════════════════════
  // MODE PLIÉ : pas de titre, items en icônes seules avec tooltips
  // ═══════════════════════════════════════════════════════════
  if (isCollapsed) {
    return (
      <div className="space-y-1">
        {/* Séparateur visuel subtil entre groupes en mode plié */}
        <div className="h-px bg-white/10 mx-1 mb-2" />

        {group.items.map((item) => (
          <SidebarItem
            key={item.label}
            item={item}
            currentPath={currentPath}
            isCollapsed
          />
        ))}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // MODE NORMAL : accordion complet avec titre
  // ═══════════════════════════════════════════════════════════
  return (
    <div>
      {/* ═══════════ EN-TÊTE DU GROUPE ═══════════ */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 mb-1 group/header rounded-lg hover:bg-white/5 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Titre — vert clair lisible sur fond vert sombre */}
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200/80 group-hover/header:text-white transition-colors truncate">
            {group.title}
          </span>
          {/* Point pulsant si item actif */}
          {hasActiveItem && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          )}
        </div>

        {/* Chevron rotatif */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="shrink-0 text-emerald-200/70 group-hover/header:text-white transition-colors"
        >
          <ChevronDownIcon className="w-3.5 h-3.5" />
        </motion.div>
      </button>

      {/* ═══════════ ITEMS ═══════════ */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.label}
                  item={item}
                  currentPath={currentPath}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SidebarGroup;