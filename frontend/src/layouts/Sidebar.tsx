// frontend2/src/components/layout/Sidebar.tsx
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ArrowRightOnRectangleIcon,
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

  const sidebarWidth = isCollapsed ? 72 : 272;

  return (
    <>
      {/* Overlay mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? 272 : sidebarWidth,
          x: isMobile ? (isOpen ? 0 : -320) : 0,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="
          fixed md:sticky top-0 left-0 z-50 md:z-20
          h-screen flex-shrink-0
          bg-[#EDE9DE] text-[#0A0A0A]
          flex flex-col
          border-r border-black/[0.10]
          overflow-visible
          relative
        "
      >
        {/* ───── GRILLE DÉCORATIVE ───── */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #0A0A0A 1px, transparent 1px), linear-gradient(to bottom, #0A0A0A 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* ───── LOGO (CARTE) ───── */}
        <div
          className={`
            relative z-10 m-3 mb-2 rounded-xl
            bg-[#FCFBF7] border border-black/[0.10]
            shadow-[0_1px_2px_rgba(10,10,10,0.04)]
            flex items-center flex-shrink-0
            transition-all duration-300
            ${
              isCollapsed && !isMobile
                ? 'justify-center px-2 py-3'
                : 'justify-between px-4 py-3.5'
            }
          `}
        >
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 group ${
              isCollapsed && !isMobile ? 'justify-center' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-[#0A0A0A] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-6">
              <span className="text-[#F5F2EA] font-black text-base leading-none">
                E
              </span>
            </div>

            <AnimatePresence initial={false}>
              {(!isCollapsed || isMobile) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col overflow-hidden whitespace-nowrap leading-none"
                >
                  <span className="text-[15px] font-bold tracking-tight text-[#0A0A0A]">
                    EduManage
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F59E0B] mt-0.5">
                    Pro
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 text-black/50 hover:text-black hover:bg-black/[0.05] rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <XMarkIcon className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* ───── PROFIL (CARTE) ───── */}
        <div
          className={`
            relative z-10 mx-3 mb-2 rounded-xl
            bg-[#FCFBF7] border border-black/[0.10]
            shadow-[0_1px_2px_rgba(10,10,10,0.04)]
            flex-shrink-0
            transition-all duration-300
            ${isCollapsed && !isMobile ? 'p-1.5' : 'p-1.5'}
          `}
        >
          <Link
            to="/dashboard/mon-profil"
            className={`
              flex items-center rounded-lg
              hover:bg-black/[0.04]
              transition-colors duration-200 group
              ${
                isCollapsed && !isMobile
                  ? 'justify-center p-2'
                  : 'gap-3 px-2 py-2'
              }
            `}
            title={
              isCollapsed && !isMobile
                ? `${user?.prenom} ${user?.nom} · ${roleLabel}`
                : undefined
            }
          >
            <div className="w-9 h-9 rounded-full bg-[#0A0A0A] flex items-center justify-center shrink-0">
              <span className="text-[11.5px] font-bold text-[#F5F2EA] tracking-wide">
                {initials}
              </span>
            </div>

            {(!isCollapsed || isMobile) && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#0A0A0A] truncate leading-tight">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-black/50 truncate mt-1">
                    {roleLabel}
                  </p>
                </div>
                <ChevronRightIcon className="w-3.5 h-3.5 text-black/30 group-hover:text-[#F59E0B] transition-colors shrink-0" />
              </>
            )}
          </Link>
        </div>

        {/* ───── NAVIGATION ───── */}
        <nav
          className={`
            relative z-10 flex-1 overflow-y-auto overflow-x-visible sidebar-scroll
            transition-all duration-300
            ${isCollapsed && !isMobile ? 'px-2 py-2' : 'px-3 py-2'}
            space-y-2
          `}
        >
          {groups.map((group) => (
            <SidebarGroup
              key={group.title}
              group={group}
              currentPath={location.pathname}
              isCollapsed={isCollapsed && !isMobile}
              isMobile={isMobile}
            />
          ))}
        </nav>

        {/* ───── DÉCONNEXION (CARTE) ───── */}
        <div
          className={`
            relative z-10 mx-3 mb-3 mt-2 rounded-xl
            bg-[#FCFBF7] border border-black/[0.10]
            shadow-[0_1px_2px_rgba(10,10,10,0.04)]
            flex-shrink-0
            transition-all duration-300
            ${isCollapsed && !isMobile ? 'p-1.5' : 'p-1.5'}
          `}
        >
          <button
            onClick={onLogout}
            className={`
              group flex items-center w-full text-black/55
              hover:text-[#DC2626] hover:bg-red-50 rounded-lg
              transition-all duration-200
              ${
                isCollapsed && !isMobile
                  ? 'justify-center p-2'
                  : 'gap-3 px-2.5 py-2.5'
              }
            `}
            title={isCollapsed && !isMobile ? 'Déconnexion' : undefined}
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobile) && (
              <>
                <span className="text-[13px] font-medium">Déconnexion</span>
                <ChevronRightIcon className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </button>

          {(!isCollapsed || isMobile) && (
            <p className="mb-1 text-center text-[9.5px] font-mono uppercase tracking-[0.15em] text-black/35">
              © {new Date().getFullYear()} EduManage Pro
            </p>
          )}
        </div>
      </motion.aside>

      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(10, 10, 10, 0.12);
          border-radius: 2px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.5);
        }
      `}</style>
    </>
  );
};

export default Sidebar;