import React from 'react';
import { useAuth } from '../hooks/AuthContext';
import DashboardPage from '../pages/dashboard/DashboardPage';
import SecretaireDashboardPage from '../pages/dashboard/secretaire/SecretaireDashboardPage';
 import EnseignantDashboardPage from '../pages/dashboard/enseignant/EnseignantDashboardPage';
 import ParentDashboardPage from '../pages/dashboard/parent/ParentDashboardPage';
import AdminDashboardPage from '../pages/dashboard/admin/AdminDashboardPage';

const RoleDashboard: React.FC = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'SECRETAIRE':
      return <SecretaireDashboardPage />;
    case 'DIRECTEUR':
      return <DashboardPage />;
    case 'ENSEIGNANT':
      return <EnseignantDashboardPage />;
    case 'PARENT':
    return <ParentDashboardPage />;
     case 'ADMIN':
    return <AdminDashboardPage />;
    default:
      return <DashboardPage />;
  }
};

export default RoleDashboard;