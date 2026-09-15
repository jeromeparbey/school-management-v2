// frontend2/src/components/layout/DashboardLayout.tsx
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/dashboard/eleves': 'Élèves',
  '/dashboard/enseignants': 'Enseignants',
  '/dashboard/paiements': 'Paiements',
  '/dashboard/classes': 'Classes',
  '/dashboard/notes': 'Notes & Bulletins',
  '/dashboard/emploi-temps': 'Emploi du temps',
  '/dashboard/statistiques': 'Statistiques',
  '/dashboard/parametres': 'Paramètres',
};

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détection mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fermer sidebar au changement de route (mobile)
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Titre dynamique basé sur la route
  const currentTitle =
    Object.entries(PAGE_TITLES).find(([path]) =>
      location.pathname.startsWith(path)
    )?.[1] ?? 'Tableau de bord';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} title={currentTitle} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
          © {new Date().getFullYear()} EduManage. Tous droits réservés.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;