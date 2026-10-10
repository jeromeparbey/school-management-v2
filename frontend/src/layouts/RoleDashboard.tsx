// frontend2/src/layouts/RoleDashboard.tsx

import React from 'react';
import { useAuth } from '../hooks/AuthContext';

// ============================================
// DASHBOARDS PAR RÔLE
// ============================================
import DashboardPage from '../pages/dashboard/DashboardPage';
import SecretaireDashboardPage from '../pages/dashboard/secretaire/SecretaireDashboardPage';
import EnseignantDashboardPage from '../pages/dashboard/directeur/enseignant/EnseignantDashboardPage';
import ParentDashboardPage from '../pages/dashboard/parent/ParentDashboardPage';
import AdminDashboardPage from '../pages/dashboard/admin/AdminDashboardPage';

// 🆕 Dashboards manquants
import SuperAdminDashboardPage from '../pages/dashboard/super-admin/SuperAdminDashboardPage';
import EleveDashboardPage from '../pages/dashboard/eleve/EleveDashboardPage';
import SurveillantDashboardPage from '../pages/dashboard/surveillant/SurveillantDashboardPage';
import BibliothecaireDashboardPage from '../pages/dashboard/bibliothecaire/BibliothecaireDashboardPage';

// ============================================
// FALLBACK (si dashboard introuvable pour un rôle)
// ============================================
import DashboardFallbackPage from '../pages/dashboard/DashboardFallbackPage';

const RoleDashboard: React.FC = () => {
  const { user } = useAuth();

  switch (user?.role) {
    // ─────────────────────────────────────────
    // SUPER_ADMIN (catalogue global multi-tenant)
    // ─────────────────────────────────────────
    case 'SUPER_ADMIN':
      return <SuperAdminDashboardPage />;

    // ─────────────────────────────────────────
    // ADMIN (système de l'établissement)
    // ─────────────────────────────────────────
    case 'ADMIN':
      return <AdminDashboardPage />;

    // ─────────────────────────────────────────
    // DIRECTEUR
    // ─────────────────────────────────────────
    case 'DIRECTEUR':
      return <DashboardPage />;

    // ─────────────────────────────────────────
    // SECRETAIRE
    // ─────────────────────────────────────────
    case 'SECRETAIRE':
      return <SecretaireDashboardPage />;

    // ─────────────────────────────────────────
    // ENSEIGNANT
    // ─────────────────────────────────────────
    case 'ENSEIGNANT':
      return <EnseignantDashboardPage />;

    // ─────────────────────────────────────────
    // SURVEILLANT
    // ─────────────────────────────────────────
    case 'SURVEILLANT':
      return <SurveillantDashboardPage />;

    // ─────────────────────────────────────────
    // PARENT
    // ─────────────────────────────────────────
    case 'PARENT':
      return <ParentDashboardPage />;

    // ─────────────────────────────────────────
    // ELEVE
    // ─────────────────────────────────────────
    case 'ELEVE':
      return <EleveDashboardPage />;

    // ─────────────────────────────────────────
    // BIBLIOTHECAIRE
    // ─────────────────────────────────────────
    case 'BIBLIOTHECAIRE':
      return <BibliothecaireDashboardPage />;

    // ─────────────────────────────────────────
    // FALLBACK (rôle inconnu ou non connecté)
    // ─────────────────────────────────────────
    default:
      return <DashboardFallbackPage />;
  }
};

export default RoleDashboard;