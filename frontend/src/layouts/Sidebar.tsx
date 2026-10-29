// frontend2/src/components/layout/Sidebar.tsx
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  SparklesIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/AuthContext';
import { getSidebarForRole } from '../config/sidebar.config';
import SidebarGroup from './SidebarGroup';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  isCollapsed?: boolean;
  onClose: () => void;
  onLogout: () => void;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const ROLE_LABELS: Record<string, string> = {
  DIRECTEUR: 'Directeur',
  SECRETAIRE: 'Secrétaire',
  ENSEIGNANT: 'Enseignant',
  SURVEILLANT: 'Surveillant',
  PARENT: 'Parent',
  ELEVE: 'Élève',
  ADMIN: 'Administrateur',
  ADMIN_SYSTEME: 'Super Admin',
  BIBLIOTHECAIRE: 'Bibliothécaire',
  SUPER_ADMIN: 'Super Admin',
};

const getRoleLabel = (role?: string) =>
  role ? ROLE_LABELS[role] ?? role : 'Utilisateur';

// ═══════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isMobile,
  isCollapsed = false,
  onClose,
  onLogout,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const groups = useMemo(
    () => getSidebarForRole(user?.role as any),
    [user?.role]
  );

  const roleLabel = getRoleLabel(user?.role);
  const initials = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase();

  // Largeur : plié = 80px, déplié = 288px
  const sidebarWidth = isCollapsed ? 80 : 288;

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          OVERLAY MOBILE
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? 288 : sidebarWidth,
          x: isMobile ? (isOpen ? 0 : -320) : 0,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="
          fixed md:sticky top-0 left-0 z-50 md:z-20
          h-screen flex-shrink-0
          bg-gradient-to-b from-emerald-700 via-emerald-800 to-teal-900
          flex flex-col
          shadow-xl shadow-emerald-900/30
          border-r border-emerald-600/30
          overflow-hidden
        "
      >
        {/* ═══════════════════════════════════════════════════════
            LOGO + BRANDING
            ═══════════════════════════════════════════════════════ */}
        <div
          className={`
            flex items-center border-b border-emerald-500/20 flex-shrink-0
            transition-all duration-300
            ${
              isCollapsed && !isMobile
                ? 'justify-center px-2 py-5'
                : 'justify-between px-5 py-5'
            }
          `}
        >
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 group ${
              isCollapsed && !isMobile ? 'justify-center' : ''
            }`}
          >
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative w-11 h-11 rounded-xl bg-white/95 flex items-center justify-center shadow-lg shadow-emerald-900/30 shrink-0"
            >
              <AcademicCapIcon className="w-6 h-6 text-emerald-700" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-emerald-800 animate-pulse" />
            </motion.div>

            {/* Texte — masqué si plié (desktop) */}
            <AnimatePresence initial={false}>
              {(!isCollapsed || isMobile) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <span className="text-base font-bold text-white tracking-tight">
                    EduManage
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-200 -mt-0.5 flex items-center gap-1">
                    <SparklesIcon className="w-2.5 h-2.5" />
                    Pro
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* Bouton fermer — mobile uniquement */}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 text-emerald-100 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            PROFIL UTILISATEUR
            ═══════════════════════════════════════════════════════ */}
        <div
          className={`
            border-b border-emerald-500/20 flex-shrink-0
            transition-all duration-300
            ${isCollapsed && !isMobile ? 'px-2 py-4' : 'px-4 py-4'}
          `}
        >
          <Link
            to="/dashboard/mon-profil"
            className={`
              flex items-center rounded-xl bg-white/10 hover:bg-white/15
              border border-white/10 hover:border-white/20
              transition-all group backdrop-blur-sm
              ${isCollapsed && !isMobile ? 'justify-center p-2' : 'gap-3 p-3'}
            `}
            title={
              isCollapsed && !isMobile
                ? `${user?.prenom} ${user?.nom} · ${roleLabel}`
                : undefined
            }
          >
            <div className="relative w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md">
              <span className="text-sm font-bold text-emerald-700">
                {initials}
              </span>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-emerald-800" />
            </div>

            {/* Info — masquée si plié */}
            {(!isCollapsed || isMobile) && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 truncate">
                    {roleLabel}
                  </p>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-emerald-200 group-hover:text-white transition-colors shrink-0" />
              </>
            )}
          </Link>
        </div>

        {/* ═══════════════════════════════════════════════════════
            NAVIGATION
            ═══════════════════════════════════════════════════════ */}
        <nav
          className={`
            flex-1 overflow-y-auto sidebar-scroll
            transition-all duration-300
            ${isCollapsed && !isMobile ? 'px-1.5 py-4' : 'px-3 py-4'}
            space-y-4
          `}
        >
          {groups.map((group) => (
            <SidebarGroup
              key={group.title}
              group={group}
              currentPath={location.pathname}
              isCollapsed={isCollapsed && !isMobile}
            />
          ))}
        </nav>

        {/* ═══════════════════════════════════════════════════════
            DÉCONNEXION
            ═══════════════════════════════════════════════════════ */}
        <div
          className={`
            border-t border-emerald-500/20 flex-shrink-0
            transition-all duration-300
            ${isCollapsed && !isMobile ? 'p-2' : 'p-3'}
          `}
        >
          <button
            onClick={onLogout}
            className={`
              group flex items-center w-full text-emerald-100
              hover:text-rose-100 hover:bg-rose-500/20 rounded-xl
              transition-all border border-transparent hover:border-rose-400/30
              ${
                isCollapsed && !isMobile
                  ? 'justify-center p-3'
                  : 'gap-3 px-4 py-3'
              }
            `}
            title={isCollapsed && !isMobile ? 'Déconnexion' : undefined}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1" />
            {(!isCollapsed || isMobile) && (
              <>
                <span className="text-sm font-medium">Déconnexion</span>
                <ChevronRightIcon className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </button>

          {(!isCollapsed || isMobile) && (
            <p className="mt-2 text-center text-[10px] text-emerald-300/70 font-medium">
              © {new Date().getFullYear()} EduManage Pro
            </p>
          )}
        </div>
      </motion.aside>

      {/* ═══════════════════════════════════════════════════════
          SCROLLBAR CUSTOM
          ═══════════════════════════════════════════════════════ */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.25);
          border-radius: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </>
  );
};

export default Sidebar;