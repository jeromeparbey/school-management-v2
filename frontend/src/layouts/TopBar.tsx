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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ============ GAUCHE ============ */}
          <div className="flex items-center gap-4">
            {/* Hamburger mobile (inchangé) */}
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* 🆕 Bouton plier/déplier (desktop uniquement) */}
            {onSidebarToggle && (
              <button
                onClick={onSidebarToggle}
                className="hidden md:inline-flex p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={
                  isSidebarCollapsed
                    ? 'Déplier le menu'
                    : 'Replier le menu'
                }
                title={
                  isSidebarCollapsed
                    ? 'Déplier le menu'
                    : 'Replier le menu'
                }
              >
                <Bars3BottomLeftIcon className="w-6 h-6" />
              </button>
            )}

            <div>
              <h1 className="text-lg font-bold text-gray-900">{title}</h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {subtitle ?? `Bienvenue, ${user?.prenom} 👋`}
              </p>
            </div>
          </div>

          {/* ============ DROITE ============ */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Recherche */}
            <div className="hidden sm:flex relative items-center">
              <MagnifyingGlassIcon className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-9 pr-4 py-2 w-48 lg:w-64 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
              />
            </div>

            {/* Période */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="hidden sm:block px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>

            {/* 🆕 Toggle Dark Mode */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={
                resolvedTheme === 'dark'
                  ? 'Passer en mode clair'
                  : 'Passer en mode sombre'
              }
              title={resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={resolvedTheme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {resolvedTheme === 'dark' ? (
                    <SunIcon className="w-5 h-5" />
                  ) : (
                    <MoonIcon className="w-5 h-5" />
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
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
                aria-label="Notifications"
              >
                <BellIcon className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {notificationCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationsDropdown
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>

            {/* Menu utilisateur */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu((s) => !s);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 pr-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border border-white shadow-sm">
                  <span className="text-xs font-bold text-blue-600">
                    {user?.prenom?.[0]}
                    {user?.nom?.[0]}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.prenom}
                </span>
                <ChevronDownIcon className="hidden md:block w-4 h-4 text-gray-400" />
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