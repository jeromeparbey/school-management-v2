// frontend2/src/components/layout/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/AuthContext';
import { getSidebarForRole } from '../config/sidebar.config';
import SidebarGroup from './SidebarGroup';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile, onClose, onLogout }) => {
  const { user } = useAuth();
  const location = useLocation();
  const groups = getSidebarForRole(user?.role as any);

  return (
    <>
      {/* Overlay mobile */}
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: isMobile ? (isOpen ? 0 : -300) : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          fixed md:sticky top-0 left-0 z-50 md:z-20
          w-72 h-screen flex-shrink-0
          bg-white border-r border-gray-200
          flex flex-col
        `}
      >
        {/* ============ LOGO ============ */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">EduManage</span>
              <span className="text-xs text-gray-400 block -mt-0.5">Pro</span>
            </div>
          </Link>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* ============ PROFIL ============ */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-white shadow">
              <span className="text-sm font-bold text-blue-600">
                {user?.prenom?.[0]}
                {user?.nom?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-[10px] font-bold uppercase text-blue-600">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* ============ NAVIGATION (SCROLLABLE) ============ */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-4">
          {groups.map((group) => (
            <SidebarGroup
              key={group.title}
              group={group}
              currentPath={location.pathname}
            />
          ))}
        </nav>

        {/* ============ DÉCONNEXION ============ */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all group"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;