// frontend2/src/components/layout/SidebarGroup.tsx
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import type { NavGroup } from '../config/navigation.types';
import { isNavItemActive, hasActiveChild } from '../config/navigation.types';

interface Props {
  group: NavGroup;
  currentPath: string;
  isCollapsed?: boolean;
  isMobile?: boolean;
}

const SidebarGroup: React.FC<Props> = ({
  group,
  currentPath,
  isCollapsed = false,
  isMobile = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [popoverTop, setPopoverTop] = useState(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const hasActiveItem = useMemo(
    () =>
      group.items.some(
        (item) =>
          isNavItemActive(item, currentPath) || hasActiveChild(item, currentPath)
      ),
    [group.items, currentPath]
  );

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const updatePopoverPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPopoverTop(rect.top);
    }
  }, []);

  const openPopover = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    updatePopoverPosition();
    setIsOpen(true);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setIsOpen(false), 150);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handler = () => updatePopoverPosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [isOpen, updatePopoverPosition]);

  // ═══════════════════════════════════════════════════════════
  // MODE PLIÉ : icônes seules
  // ═══════════════════════════════════════════════════════════
  if (isCollapsed) {
    return (
      <div className="space-y-0.5">
        <div className="h-px bg-black/[0.10] mx-1 mb-2" />

        {group.items.map((item) => {
          const Icon = item.icon;
          const path = item.path ?? item.href ?? '#';
          const isActive =
            isNavItemActive(item, currentPath) ||
            hasActiveChild(item, currentPath);

          return (
            <Link
              key={item.label}
              to={path}
              title={item.label}
              className={`
                group relative flex items-center justify-center
                w-full h-10 rounded-lg
                transition-colors duration-200
                ${
                  isActive
                    ? 'bg-[#EDE9DE] text-[#0A0A0A] border border-black/[0.12]'
                    : 'text-black/55 hover:bg-black/[0.06] hover:text-black border border-transparent'
                }
              `}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#10B981] rounded-r-full" />
              )}
              {Icon && (
                <Icon
                  className={`w-[18px] h-[18px] ${
                    isActive ? 'text-[#10B981]' : ''
                  }`}
                />
              )}
              {item.badgeKey && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F59E0B] ring-2 ring-[#FCFBF7]" />
              )}
              {item.isNew && !item.badgeKey && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F59E0B] ring-2 ring-[#FCFBF7]" />
              )}
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
        })}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // MOBILE : accordéon
  // ═══════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setMobileExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/[0.05] transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-black/70 truncate">
              {group.title}
            </span>
            {hasActiveItem && (
              <span className="w-1 h-1 rounded-full bg-[#F59E0B] shrink-0" />
            )}
          </div>
          <motion.div
            animate={{ rotate: mobileExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRightIcon className="w-3 h-3 text-black/40" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {mobileExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-0.5 pl-2">
                {group.items.map((item) => (
                  <MobileItem
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
  }

  // ═══════════════════════════════════════════════════════════
  // DESKTOP : trigger + popover en portail
  // ═══════════════════════════════════════════════════════════
  const sidebarWidth = 272;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        onMouseEnter={openPopover}
        onMouseLeave={scheduleClose}
        className={`
          w-full flex items-center justify-between px-3 py-2 rounded-lg
          transition-colors duration-200 group/header
          ${
            isOpen || hasActiveItem
              ? 'bg-black/[0.05] text-[#0A0A0A]'
              : 'text-black/70 hover:bg-black/[0.05] hover:text-black'
          }
        `}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] truncate">
            {group.title}
          </span>
          {hasActiveItem && (
            <span className="w-1 h-1 rounded-full bg-[#F59E0B] shrink-0" />
          )}
        </div>
        <ChevronRightIcon
          className={`
            w-3 h-3 shrink-0 transition-transform duration-200
            ${isOpen ? 'rotate-90' : ''}
            ${
              hasActiveItem
                ? 'text-[#F59E0B]'
                : 'text-black/40 group-hover/header:text-black/60'
            }
          `}
        />
      </button>

      {/* ═══════ POPOVER EN PORTAIL — CARTE COMME LA SIDEBAR ═══════ */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={openPopover}
                onMouseLeave={scheduleClose}
                style={{
                  position: 'fixed',
                  top: popoverTop,
                  left: sidebarWidth + 8,
                  zIndex: 60,
                }}
                className="
                  w-[260px]
                  bg-[#FCFBF7] rounded-xl
                  border border-black/[0.12]
                  shadow-[0_4px_12px_rgba(10,10,10,0.08),0_1px_2px_rgba(10,10,10,0.04)]
                  py-1.5
                "
              >
                {/* Titre du popover */}
                <div className="px-3 py-2 border-b border-black/[0.08] mb-1">
                  <p className="text-[9.5px] font-mono uppercase tracking-[0.18em] text-black/50">
                    {group.title}
                  </p>
                </div>

                {/* Items */}
                <div className="max-h-[70vh] overflow-y-auto sidebar-scroll px-1.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const path = item.path ?? item.href ?? '#';
                    const isActive =
                      isNavItemActive(item, currentPath) ||
                      hasActiveChild(item, currentPath);

                    return (
                      <Link
                        key={item.label}
                        to={path}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center gap-2.5 px-2.5 py-2 my-0.5 rounded-lg
                          transition-colors duration-150
                          border
                          ${
                            isActive
                              ? 'bg-[#EDE9DE] text-[#0A0A0A] font-semibold border-black/[0.12]'
                              : 'text-black/80 hover:bg-black/[0.05] hover:text-black border-transparent'
                          }
                        `}
                      >
                        {Icon && (
                          <Icon
                            className={`
                              w-[15px] h-[15px] shrink-0
                              ${
                                isActive
                                  ? 'text-[#10B981]'
                                  : 'text-black/55'
                              }
                            `}
                          />
                        )}
                        <span className="text-[12.5px] flex-1 truncate">
                          {item.label}
                        </span>
                        {item.badgeKey && (
                          <span
                            className={`
                              px-1.5 min-w-[18px] h-[18px] text-[10px] font-mono font-semibold rounded-full
                              flex items-center justify-center shrink-0
                              ${
                                isActive
                                  ? 'bg-[#10B981] text-white'
                                  : 'bg-[#F59E0B] text-[#0A0A0A]'
                              }
                            `}
                          >
                            {item.badgeKey}
                          </span>
                        )}
                        {item.isNew && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

// ─── Composant interne pour mobile ───
const MobileItem: React.FC<{ item: any; currentPath: string }> = ({
  item,
  currentPath,
}) => {
  const Icon = item.icon;
  const path = item.path ?? item.href ?? '#';
  const isActive =
    isNavItemActive(item, currentPath) || hasActiveChild(item, currentPath);

  return (
    <Link
      to={path}
      className={`
        flex items-center gap-2.5 px-3 py-2 rounded-lg
        transition-colors duration-150
        border
        ${
          isActive
            ? 'bg-[#EDE9DE] text-[#0A0A0A] font-semibold border-black/[0.12]'
            : 'text-black/80 hover:bg-black/[0.05] hover:text-black border-transparent'
        }
      `}
    >
      {Icon && (
        <Icon
          className={`w-[16px] h-[16px] shrink-0 ${
            isActive ? 'text-[#10B981]' : 'text-black/55'
          }`}
        />
      )}
      <span className="text-[13px] flex-1 truncate">{item.label}</span>
      {item.badgeKey && (
        <span
          className={`
            px-1.5 min-w-[18px] h-[18px] text-[10px] font-mono font-semibold rounded-full
            flex items-center justify-center shrink-0
            ${
              isActive
                ? 'bg-[#10B981] text-white'
                : 'bg-[#F59E0B] text-[#0A0A0A]'
            }
          `}
        >
          {item.badgeKey}
        </span>
      )}
      {item.isNew && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
      )}
    </Link>
  );
};

export default SidebarGroup;