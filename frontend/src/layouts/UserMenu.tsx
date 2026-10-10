// frontend2/src/components/layout/UserMenu.tsx
import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/AuthContext';

const UserMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">
          {user?.prenom} {user?.nom}
        </p>
        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-50 text-blue-600 rounded-full">
          {user?.role}
        </span>
      </div>

      <div className="py-1">
        <Link
          to="/dashboard/profil"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <UserCircleIcon className="w-4 h-4 text-gray-400" />
          Mon profil
        </Link>
        <Link
          to="/dashboard/parametres"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
          Paramètres
        </Link>
        <Link
          to="/dashboard/aide"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400" />
          Aide
        </Link>
      </div>

      <div className="border-t border-gray-100 pt-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </motion.div>
  );
};

export default UserMenu;