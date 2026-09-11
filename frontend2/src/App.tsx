// frontend2/src/App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/AuthContext';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import DashboardPage from './pages/dashboard/DashboardPage';

// ============================================
// COMPOSANT PROTECTED ROUTE
// ============================================
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitializing } = useAuth();

  // Afficher un loader pendant la restauration de session
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers login si non authentifié
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// ============================================
// COMPOSANT PUBLIC ROUTE
// ============================================
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitializing } = useAuth();

  // Afficher un loader pendant la restauration de session
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers dashboard si déjà connecté
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ============================================
// APP PRINCIPALE
// ============================================
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ============================================
              ROUTES PUBLIQUES
              ============================================ */}

          {/* Page d'accueil */}
          <Route path="/" element={<HomePage />} />

          {/* Connexion */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Inscription */}
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Vérification OTP */}
          <Route
            path="/verify-otp"
            element={
              <PublicRoute>
                <VerifyOtpPage />
              </PublicRoute>
            }
          />

          {/* Mot de passe oublié */}
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />

          {/* Réinitialisation du mot de passe */}
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            }
          />

          {/* ============================================
              ROUTES PROTÉGÉES
              ============================================ */}

          {/* Tableau de bord */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* ============================================
              404 → Redirection vers l'accueil
              ============================================ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;