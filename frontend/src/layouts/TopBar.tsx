// frontend2/src/components/layout/TopBar.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/AuthContext';
import { useTheme } from '../context/ThemeContext';
import UserMenu from './UserMenu';
import NotificationsDropdown from './NotificationsDropdown';

interface TopBarProps {
  onMenuClick: () => void;
  onSidebarToggle?: () => void;
  isSidebarCollapsed?: boolean;
  title?: string;
  subtitle?: string;
}

const TopBar: React.FC<TopBarProps> = ({
  onMenuClick,
  onSidebarToggle,
  isSidebarCollapsed = false,
  title = 'Tableau de bord',
  subtitle,
}) => {
  const { user } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const notificationCount = 3; // TODO: brancher sur un store/API

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-black/[0.06]">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ============ GAUCHE ============ */}
          <div className="flex items-center gap-4">
            {/* Hamburger mobile */}
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 text-black/50 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>

            {/* Bouton plier/déplier (desktop) */}
            {onSidebarToggle && (
              <button
                onClick={onSidebarToggle}
                className="hidden md:inline-flex p-2 text-black/50 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors"
                aria-label={
                  isSidebarCollapsed ? 'Déplier le menu' : 'Replier le menu'
                }
                title={
                  isSidebarCollapsed ? 'Déplier le menu' : 'Replier le menu'
                }
              >
                <Bars3BottomLeftIcon className="w-5 h-5" />
              </button>
            )}

            <div className="flex flex-col min-w-0">
              <h1 className="text-[15px] font-bold tracking-tight text-[#0A0A0A] leading-tight truncate">
                {title}
              </h1>
              <p className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-black/40 hidden sm:block mt-0.5 truncate">
                {subtitle ?? `Bienvenue, ${user?.prenom}`}
              </p>
            </div>
          </div>

          {/* ============ DROITE ============ */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Recherche — underline éditoriale */}
            <div className="hidden sm:flex relative items-center">
              <MagnifyingGlassIcon className="absolute left-0 w-4 h-4 text-black/30 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher…"
                className="pl-6 pr-3 py-2 w-44 lg:w-60 bg-transparent border-0 border-b border-black/10 focus:border-[#10B981] text-[13px] text-[#0A0A0A] placeholder:text-black/30 outline-none transition-colors"
              />
            </div>

            {/* Période — select sobre */}
            <div className="hidden sm:block relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-transparent border-0 border-b border-black/10 focus:border-[#10B981] text-[12.5px] text-black/60 outline-none transition-colors cursor-pointer"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
              <ChevronDownIcon className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-black/30 pointer-events-none" />
            </div>

            {/* Séparateur vertical discret */}
            <span className="hidden sm:block w-px h-5 bg-black/[0.08] mx-1" />

            {/* Toggle thème — icône simple */}
            <button
              onClick={toggleTheme}
              className="p-2 text-black/50 hover:text-[#10B981] hover:bg-black/[0.04] rounded-lg transition-colors"
              aria-label={resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              title={resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={resolvedTheme}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {resolvedTheme === 'dark' ? (
                    <SunIcon className="w-4 h-4" />
                  ) : (
                    <MoonIcon className="w-4 h-4" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications((s) => !s);
                  setShowUserMenu(false);
                }}
                className="relative p-2 text-black/50 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <BellIcon className="w-4.5 h-4.5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                )}
              </button>
              {showNotifications && (
                <NotificationsDropdown
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>

            {/* Menu utilisateur — avatar NOIR */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu((s) => !s);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 pr-2 hover:bg-black/[0.04] rounded-lg transition-colors"
              >
                {/* ⚠️ SEUL CHANGEMENT : avatar noir au lieu d'émeraude */}
                <div className="w-8 h-8 bg-[#0A0A0A] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-[#F5F2EA] tracking-wide">
                    {user?.prenom?.[0]}
                    {user?.nom?.[0]}
                  </span>
                </div>
                <span className="hidden md:block text-[13px] font-medium text-[#0A0A0A]">
                  {user?.prenom}
                </span>
                <ChevronDownIcon className="hidden md:block w-3.5 h-3.5 text-black/30" />
              </button>
              {showUserMenu && (
                <UserMenu onClose={() => setShowUserMenu(false)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;