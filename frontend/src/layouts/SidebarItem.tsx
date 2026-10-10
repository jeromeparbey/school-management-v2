// frontend2/src/components/layout/SidebarItem.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import type { NavItem } from '../config/navigation.types';

interface Props {
  item: NavItem;
  currentPath: string;
  level?: number;
}

const SidebarItem: React.FC<Props> = ({ item, currentPath, level = 0 }) => {
  const hasChildren = !!item.children?.length;
  const isActive =
    item.href === currentPath ||
    (item.href && currentPath.startsWith(item.href + '/')) ||
    item.children?.some((c) => c.href === currentPath);

  const [open, setOpen] = useState(isActive);
  const Icon = item.icon;

  // -------- ITEM AVEC SOUS-MENU --------
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
            isActive
              ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
          }`}
          style={{ paddingLeft: `${12 + level * 12}px` }}
        >
          <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
          <span className="flex-1 text-left truncate">{item.label}</span>
          <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-0.5 space-y-0.5">
                {item.children!.map((child) => (
                  <SidebarItem
                    key={child.label}
                    item={child}
                    currentPath={currentPath}
                    level={level + 1}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // -------- ITEM SIMPLE --------
  return (
    <Link
      to={item.href!}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
        isActive
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-medium shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
      }`}
      style={{ paddingLeft: `${12 + level * 12}px` }}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badgeKey && (
        <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">
          {/* TODO: brancher sur un compteur réel */}
          3
        </span>
      )}
    </Link>
  );
};

export default SidebarItem;