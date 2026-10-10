// frontend2/src/App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/AuthContext';

// ============================================
// PAGES PUBLIQUES
// ============================================
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';

// ============================================
// LAYOUT PROTÉGÉ
// ============================================
import DashboardLayout from './layouts/DashboardLayout';

// ============================================
// DISPATCHER DASHBOARD (par rôle)
// ============================================
import RoleDashboard from './layouts/RoleDashboard';

// ============================================
// PAGES DASHBOARD — DIRECTEUR (nouvelles) ✅
// ============================================
import StatistiquesPage from './pages/dashboard/directeur/statistiques/StatistiquesPage';
import ElevesPage from './pages/dashboard/directeur/eleves/ElevesPage';
import ClassesPage from './pages/dashboard/directeur/classes/ClassesPage';
import MatieresPage from './pages/dashboard/directeur/matieres/MatieresPage';
import NotesPage from './pages/dashboard/directeur/notes/NotesPage';
import BulletinsPage from './pages/dashboard/directeur/notes/BulletinsPage';
import EnseignantsPage from './pages/dashboard/directeur/enseignants/EnseignantsPage';
import PaiementsPage from './pages/dashboard/directeur/paiements/PaiementsPage';
import PaiePage from './pages/dashboard/directeur/paie/PaiePage';

// ============================================
// PAGES DASHBOARD — À VENIR (Directeur)
// ============================================

// --- Élèves (détails) ---
// import EleveDetailPage from './pages/dashboard/directeur/eleves/EleveDetailPage';
// import NouvelElevePage from './pages/dashboard/directeur/eleves/NouvelElevePage';
// import InscriptionsPage from './pages/dashboard/directeur/eleves/InscriptionsPage';
// import ResponsablesPage from './pages/dashboard/directeur/eleves/ResponsablesPage';

// --- Niveaux ---
// import NiveauxPage from './pages/dashboard/directeur/niveaux/NiveauxPage';

// --- Appréciations ---
// import AppreciationsPage from './pages/dashboard/directeur/notes/AppreciationsPage';

// --- Emploi du temps ---
// import EmploiTempsPage from './pages/dashboard/directeur/emploi-temps/EmploiTempsPage';

// --- Affectations ---
// import AffectationsPage from './pages/dashboard/directeur/enseignants/AffectationsPage';

// --- RH : présences / heures supp / absences / avances / réclamations ---
// import PresencesPage from './pages/dashboard/directeur/presences/PresencesPage';
// import HeuresSuppPage from './pages/dashboard/directeur/heures-supp/HeuresSuppPage';
// import AbsencesPage from './pages/dashboard/directeur/absences/AbsencesPage';
// import AvancesPage from './pages/dashboard/directeur/avances/AvancesPage';
// import ReclamationsPage from './pages/dashboard/directeur/reclamations/ReclamationsPage';

// --- Finances : reçus / échéances / plans / réductions ---
// import NouveauPaiementPage from './pages/dashboard/directeur/paiements/NouveauPaiementPage';
// import RecusPage from './pages/dashboard/directeur/recus/RecusPage';
// import EcheancesPage from './pages/dashboard/directeur/echeances/EcheancesPage';
// import PlansScolaritePage from './pages/dashboard/directeur/plans-scolarite/PlansScolaritePage';
// import ReductionsPage from './pages/dashboard/directeur/reductions/ReductionsPage';

// --- Administration ---
// import AnneesScolairesPage from './pages/dashboard/directeur/admin/AnneesScolairesPage';
// import PeriodesPage from './pages/dashboard/directeur/admin/PeriodesPage';
// import ReglesEvaluationPage from './pages/dashboard/directeur/admin/ReglesEvaluationPage';
// import UtilisateursPage from './pages/dashboard/directeur/admin/UtilisateursPage';
// import AuditPage from './pages/dashboard/directeur/admin/AuditPage';
// import ParametresPage from './pages/dashboard/directeur/admin/ParametresPage';

// ============================================
// PAGES DASHBOARD — ENSEIGNANT (vues personnelles)
// ============================================
// import EnseignantDashboardPage from './pages/dashboard/enseignant/EnseignantDashboardPage';
// import MesClassesPage from './pages/dashboard/enseignant/MesClassesPage';
// import MonEmploiTempsPage from './pages/dashboard/enseignant/MonEmploiTempsPage';
// import MesPresencesPage from './pages/dashboard/enseignant/MesPresencesPage';
// import MesHeuresSuppPage from './pages/dashboard/enseignant/MesHeuresSuppPage';
// import MesAbsencesPage from './pages/dashboard/enseignant/MesAbsencesPage';
// import MesAvancesPage from './pages/dashboard/enseignant/MesAvancesPage';
// import MaPaiePage from './pages/dashboard/enseignant/MaPaiePage';
// import MesReclamationsPage from './pages/dashboard/enseignant/MesReclamationsPage';

// ============================================
// PAGES DASHBOARD — PARENT (vues personnelles)
// ============================================
// import ParentDashboardPage from './pages/dashboard/parent/ParentDashboardPage';
// import MesEnfantsPage from './pages/dashboard/parent/MesEnfantsPage';
// import BulletinsEnfantPage from './pages/dashboard/parent/BulletinsEnfantPage';
// import MesPaiementsPage from './pages/dashboard/parent/MesPaiementsPage';
// import MesRecusPage from './pages/dashboard/parent/MesRecusPage';

// ============================================
// PAGES DASHBOARD — ADMIN (système)
// ============================================
// import AdminDashboardPage from './pages/dashboard/admin/AdminDashboardPage';

// ============================================
// PAGES DASHBOARD — SECRÉTAIRE
// ============================================
// (Rien à importer ici : SecretaireDashboardPage est utilisé dans RoleDashboard)

// ============================================
// COMPOSANT PROTECTED ROUTE
// ============================================
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitializing } = useAuth();

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

          <Route path="/" element={<HomePage />} />

          <Route
            path="/login"
            element={<PublicRoute><LoginPage /></PublicRoute>}
          />

          <Route
            path="/register"
            element={<PublicRoute><RegisterPage /></PublicRoute>}
          />

          <Route
            path="/verify-otp"
            element={<PublicRoute><VerifyOtpPage /></PublicRoute>}
          />

          <Route
            path="/forgot-password"
            element={<PublicRoute><ForgotPasswordPage /></PublicRoute>}
          />

          <Route
            path="/reset-password"
            element={<PublicRoute><ResetPasswordPage /></PublicRoute>}
          />

          {/* ============================================
              ROUTES PROTÉGÉES (avec layout imbriqué)
              ============================================ */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* -------- TABLEAU DE BORD (dispatché par rôle) -------- */}
            <Route index element={<RoleDashboard />} />

            {/* ============================================
                DIRECTEUR — STATISTIQUES ✅
                ============================================ */}
            <Route path="statistiques" element={<StatistiquesPage />} />

            {/* ============================================
                DIRECTEUR — SCOLARITÉ : ÉLÈVES ✅
                ============================================ */}
            <Route path="eleves" element={<ElevesPage />} />
            {/* <Route path="eleves/nouveau" element={<NouvelElevePage />} /> */}
            {/* <Route path="eleves/:id" element={<EleveDetailPage />} /> */}
            {/* <Route path="eleves/inscriptions" element={<InscriptionsPage />} /> */}
            {/* <Route path="eleves/responsables" element={<ResponsablesPage />} /> */}

            {/* ============================================
                DIRECTEUR — SCOLARITÉ : CLASSES & MATIÈRES ✅
                ============================================ */}
            <Route path="classes" element={<ClassesPage />} />
            <Route path="matieres" element={<MatieresPage />} />
            {/* <Route path="niveaux" element={<NiveauxPage />} /> */}

            {/* ============================================
                DIRECTEUR — SCOLARITÉ : NOTES & BULLETINS ✅
                ============================================ */}
            <Route path="notes" element={<NotesPage />} />
            <Route path="notes/saisie" element={<NotesPage />} />
            <Route path="notes/bulletins" element={<BulletinsPage />} />
            <Route path="bulletins" element={<BulletinsPage />} />
            {/* <Route path="notes/appreciations" element={<AppreciationsPage />} /> */}
            {/* <Route path="appreciations" element={<AppreciationsPage />} /> */}

            {/* ============================================
                DIRECTEUR — SCOLARITÉ : EMPLOI DU TEMPS
                ============================================ */}
            {/* <Route path="emploi-temps" element={<EmploiTempsPage />} /> */}

            {/* ============================================
                DIRECTEUR — PERSONNEL : ENSEIGNANTS ✅
                ============================================ */}
            <Route path="enseignants" element={<EnseignantsPage />} />
            {/* <Route path="enseignants/affectations" element={<AffectationsPage />} /> */}

            {/* ============================================
                DIRECTEUR — PERSONNEL : PRÉSENCES & RH
                ============================================ */}
            {/* <Route path="presences" element={<PresencesPage />} /> */}
            {/* <Route path="presences-eleves" element={<PresencesPage />} /> */}
            {/* <Route path="heures-supp" element={<HeuresSuppPage />} /> */}
            {/* <Route path="absences" element={<AbsencesPage />} /> */}
            {/* <Route path="avances" element={<AvancesPage />} /> */}
            {/* <Route path="reclamations" element={<ReclamationsPage />} /> */}

            {/* ============================================
                DIRECTEUR — FINANCES : PAIEMENTS & PAIE ✅
                ============================================ */}
            <Route path="paiements" element={<PaiementsPage />} />
            {/* <Route path="paiements/nouveau" element={<NouveauPaiementPage />} /> */}
            {/* <Route path="recus" element={<RecusPage />} /> */}
            {/* <Route path="recus/:id" element={<RecusPage />} /> */}
            {/* <Route path="echeances" element={<EcheancesPage />} /> */}
            {/* <Route path="echeances/:id" element={<EcheancesPage />} /> */}
            {/* <Route path="plans-scolarite" element={<PlansScolaritePage />} /> */}
            {/* <Route path="reductions" element={<ReductionsPage />} /> */}
            {/* <Route path="relances" element={<EcheancesPage />} /> */}
            <Route path="paie" element={<PaiePage />} />

            {/* ============================================
                DIRECTEUR — ADMINISTRATION
                ============================================ */}
            {/* <Route path="annees" element={<AnneesScolairesPage />} /> */}
            {/* <Route path="periodes" element={<PeriodesPage />} /> */}
            {/* <Route path="regles-evaluation" element={<ReglesEvaluationPage />} /> */}
            {/* <Route path="utilisateurs" element={<UtilisateursPage />} /> */}
            {/* <Route path="roles" element={<RolesPage />} /> */}
            {/* <Route path="audit" element={<AuditPage />} /> */}
            {/* <Route path="logs-email" element={<LogsEmailPage />} /> */}
            {/* <Route path="sauvegardes" element={<SauvegardesPage />} /> */}
            {/* <Route path="parametres" element={<ParametresPage />} /> */}
            {/* <Route path="etablissement" element={<EtablissementPage />} /> */}

            {/* ============================================
                ENSEIGNANT — VUES PERSONNELLES
                ============================================ */}
            {/* <Route path="mes-classes" element={<MesClassesPage />} /> */}
            {/* <Route path="mon-emploi-temps" element={<MonEmploiTempsPage />} /> */}
            {/* <Route path="mes-presences" element={<MesPresencesPage />} /> */}
            {/* <Route path="mes-heures-supp" element={<MesHeuresSuppPage />} /> */}
            {/* <Route path="mes-absences" element={<MesAbsencesPage />} /> */}
            {/* <Route path="mes-avances" element={<MesAvancesPage />} /> */}
            {/* <Route path="ma-paie" element={<MaPaiePage />} /> */}
            {/* <Route path="mes-reclamations" element={<MesReclamationsPage />} /> */}

            {/* ============================================
                PARENT — VUES PERSONNELLES
                ============================================ */}
            {/* <Route path="mes-enfants" element={<MesEnfantsPage />} /> */}
            {/* <Route path="mes-paiements" element={<MesPaiementsPage />} /> */}
            {/* <Route path="mes-recus" element={<MesRecusPage />} /> */}

            {/* ============================================
                COMMUNICATION & PROFIL
                ============================================ */}
            {/* <Route path="notifications" element={<NotificationsPage />} /> */}
            {/* <Route path="emails" element={<LogsEmailPage />} /> */}
            {/* <Route path="profil" element={<ProfilPage />} /> */}
            {/* <Route path="aide" element={<ProfilPage />} /> */}

            {/* ============================================
                404 DANS LE DASHBOARD
                ============================================ */}
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center py-20">
                  <h2 className="text-4xl font-bold text-gray-900">404</h2>
                  <p className="text-gray-500 mt-2">Page introuvable dans le dashboard</p>
                </div>
              }
            />
          </Route>

          {/* ============================================
              404 GLOBAL → Redirection vers l'accueil
              ============================================ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;