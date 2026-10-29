// frontend2/src/components/layout/DashboardLayout.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

// ═══════════════════════════════════════════════════════════
// STORAGE KEY
// ═══════════════════════════════════════════════════════════

const SIDEBAR_COLLAPSED_KEY = 'edumanage-sidebar-collapsed';

// ═══════════════════════════════════════════════════════════
// TITRES DES PAGES
// ═══════════════════════════════════════════════════════════

const PAGE_TITLES: Array<{ path: string; title: string }> = [
  { path: '/dashboard/eleves/inscriptions', title: 'Inscriptions' },
  { path: '/dashboard/eleves/nouveau', title: 'Nouvel élève' },
  { path: '/dashboard/eleves/:id', title: 'Détail élève' },
  { path: '/dashboard/enseignants/nouveau', title: 'Nouvel enseignant' },
  { path: '/dashboard/classes/nouveau', title: 'Nouvelle classe' },
  { path: '/dashboard/matieres/nouveau', title: 'Nouvelle matière' },
  { path: '/dashboard/import/eleves', title: 'Import des élèves' },
  { path: '/dashboard/plans-scolarite/nouveau', title: 'Nouveau plan de scolarité' },
  { path: '/dashboard/echeances/nouveau', title: 'Nouvelle échéance' },
  { path: '/dashboard/statistiques', title: 'Statistiques' },
  { path: '/dashboard/eleves', title: 'Élèves' },
  { path: '/dashboard/enseignants', title: 'Enseignants' },
  { path: '/dashboard/classes', title: 'Classes' },
  { path: '/dashboard/matieres', title: 'Matières' },
  { path: '/dashboard/niveaux', title: 'Niveaux' },
  { path: '/dashboard/affectations', title: 'Affectations' },
  { path: '/dashboard/emploi-temps', title: 'Emploi du temps' },
  { path: '/dashboard/notes', title: 'Notes & Bulletins' },
  { path: '/dashboard/bulletins', title: 'Bulletins' },
  { path: '/dashboard/paiements', title: 'Paiements' },
  { path: '/dashboard/recus', title: 'Reçus' },
  { path: '/dashboard/plans-scolarite', title: 'Plans de scolarité' },
  { path: '/dashboard/echeances', title: 'Échéances' },
  { path: '/dashboard/periodes', title: 'Périodes' },
  { path: '/dashboard/annees', title: 'Années scolaires' },
  { path: '/dashboard/annees-scolaires', title: 'Années scolaires' },
  { path: '/dashboard/inscriptions', title: 'Inscriptions' },
  { path: '/dashboard/paie', title: 'Paie' },
  { path: '/dashboard/utilisateurs', title: 'Utilisateurs' },
  { path: '/dashboard/mon-etablissement', title: 'Mon établissement' },
  { path: '/dashboard/mon-profil', title: 'Mon profil' },
  { path: '/dashboard/profil', title: 'Mon profil' },
  { path: '/dashboard', title: 'Tableau de bord' },
];

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function resolvePageTitle(pathname: string): string {
  const sorted = [...PAGE_TITLES].sort(
    (a, b) => b.path.length - a.path.length
  );
  const match = sorted.find(({ path }) => {
    if (path.includes(':')) return false;
    return pathname === path || pathname.startsWith(path + '/');
  });
  return match?.title ?? 'Tableau de bord';
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // ─── Restaurer l'état collapsed depuis localStorage ───
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (saved === 'true') setIsSidebarCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  // ─── Persister l'état collapsed ───
  useEffect(() => {
    try {
      localStorage.setItem(
        SIDEBAR_COLLAPSED_KEY,
        String(isSidebarCollapsed)
      );
    } catch {
      /* ignore */
    }
  }, [isSidebarCollapsed]);

  // ─── Détection mobile ───
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

  // ─── Fermer sidebar au changement de route (mobile) ───
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((v) => !v);
  };

  const currentTitle = useMemo(
    () => resolvePageTitle(location.pathname),
    [location.pathname]
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-teal-50/30 to-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          onMenuClick={() => setIsSidebarOpen(true)}
          onSidebarToggle={toggleSidebarCollapsed}
          isSidebarCollapsed={isSidebarCollapsed}
          title={currentTitle}
        />

        {/* ═══════════ CONTENU PRINCIPAL ═══════════ */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="border-t border-emerald-100 bg-white/60 backdrop-blur-sm">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <p className="text-emerald-700/70 font-medium">
                © {new Date().getFullYear()}{' '}
                <span className="font-semibold text-emerald-700">
                  EduManage
                </span>{' '}
                — Tous droits réservés.
              </p>
              <p className="text-emerald-600/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Version 1.0.0 · Édition Pro
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;