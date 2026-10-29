// frontend2/src/App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// ═══════════════════════════════════════════════════════════
// PAGES PUBLIQUES
// ═══════════════════════════════════════════════════════════
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';

// ═══════════════════════════════════════════════════════════
// LAYOUTS
// ═══════════════════════════════════════════════════════════
import DashboardLayout from './layouts/DashboardLayout';
import RoleDashboard from './layouts/RoleDashboard';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — ÉLÈVES
// ═══════════════════════════════════════════════════════════
import ElevesPage from './pages/dashboard/directeur/eleves/ElevesPage';
import EleveNouvellePage from './pages/dashboard/directeur/eleves/EleveNouvellePage';
import EleveDetailPage from './pages/dashboard/directeur/eleves/EleveDetailPage';
import EleveEditerPage from './pages/dashboard/directeur/eleves/EleveEditerPage';
import ImportElevesPage from './pages/dashboard/directeur/import/ImportElevesPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — INSCRIPTIONS
// ═══════════════════════════════════════════════════════════
import InscriptionsListPage from './pages/dashboard/directeur/inscriptions/InscriptionsListPage';
import InscriptionNouvellePage from './pages/dashboard/directeur/inscriptions/InscriptionNouvellePage';
import InscriptionDetailPage from './pages/dashboard/directeur/inscriptions/InscriptionDetailPage';
import InscriptionEditerPage from './pages/dashboard/directeur/inscriptions/InscriptionEditerPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — CLASSES & NIVEAUX
// ═══════════════════════════════════════════════════════════
import ClassesPage from './pages/dashboard/directeur/classes/ClassesPage';
import ClasseNouvellePage from './pages/dashboard/directeur/classes/ClasseNouvellePage';
import ClasseDetailPage from './pages/dashboard/directeur/classes/ClasseDetailPage';
import ClasseEditerPage from './pages/dashboard/directeur/classes/ClasseEditerPage';

import NiveauxPage from './pages/dashboard/directeur/niveaux/NiveauxPage';
import NiveauNouvellePage from './pages/dashboard/directeur/niveaux/NiveauNouvellePage';
import NiveauDetailPage from './pages/dashboard/directeur/niveaux/NiveauDetailPage';
import NiveauEditerPage from './pages/dashboard/directeur/niveaux/NiveauEditerPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — MATIÈRES
// ═══════════════════════════════════════════════════════════
import MatieresPage from './pages/dashboard/directeur/matieres/MatieresPage';
import MatiereNouvellePage from './pages/dashboard/directeur/matieres/MatiereNouvellePage';
import MatiereDetailPage from './pages/dashboard/directeur/matieres/MatiereDetailPage';
import MatiereEditerPage from './pages/dashboard/directeur/matieres/MatiereEditerPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — EMPLOI DU TEMPS
// ═══════════════════════════════════════════════════════════
import EmploiTempsPage from './pages/dashboard/directeur/emploi-temps/EmploiTempsPage';
import EmploiTempsNouvellePage from './pages/dashboard/directeur/emploi-temps/EmploiTempsNouvellePage';
import EmploiTempsDetailPage from './pages/dashboard/directeur/emploi-temps/EmploiTempsDetailPage';
import EmploiTempsEditerPage from './pages/dashboard/directeur/emploi-temps/EmploiTempsEditerPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — NOTES & BULLETINS
// ═══════════════════════════════════════════════════════════
import NotesPage from './pages/dashboard/directeur/notes/NotesPage';
import BulletinsPage from './pages/dashboard/directeur/notes/BulletinsPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — ENSEIGNANTS
// ═══════════════════════════════════════════════════════════
import EnseignantsPage from './pages/dashboard/directeur/enseignants/EnseignantsPage';
import EnseignantNouvellePage from './pages/dashboard/directeur/enseignants/EnseignantNouvellePage';
import EnseignantDetailPage from './pages/dashboard/directeur/enseignants/EnseignantDetailPage';
import EnseignantEditerPage from './pages/dashboard/directeur/enseignants/EnseignantEditerPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — AFFECTATIONS
// ═══════════════════════════════════════════════════════════
import AffectationsPage from './pages/dashboard/directeur/affectations/AffectationsPage';
import AffectationNouvellePage from './pages/dashboard/directeur/affectations/AffectationNouvellePage';
import AffectationDetailPage from './pages/dashboard/directeur/affectations/AffectationDetailPage';
import AffectationEditerPage from './pages/dashboard/directeur/affectations/AffectationEditerPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — ANNÉES SCOLAIRES
// ═══════════════════════════════════════════════════════════
import AnneesScolairesPage from './pages/dashboard/directeur/annees-scolaires/AnneesScolairesPage';
import AnneeScolaireNouvellePage from './pages/dashboard/directeur/annees-scolaires/AnneeScolaireNouvellePage';
import AnneeScolaireDetailPage from './pages/dashboard/directeur/annees-scolaires/AnneeScolaireDetailPage';
import AnneeScolaireEditerPage from './pages/dashboard/directeur/annees-scolaires/AnneeScolaireEditerPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — PÉRIODES
// ═══════════════════════════════════════════════════════════
import PeriodesPage from './pages/dashboard/directeur/periodes/PeriodesPage';
import PeriodeNouvellePage from './pages/dashboard/directeur/periodes/PeriodeNouvellePage';
import PeriodeDetailPage from './pages/dashboard/directeur/periodes/PeriodeDetailPage';
import PeriodeEditerPage from './pages/dashboard/directeur/periodes/PeriodeEditerPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — PLANS DE SCOLARITÉ
// ═══════════════════════════════════════════════════════════
import PlansScolaritePage from './pages/dashboard/directeur/plans-scolarite/PlansScolaritePage';
import PlanScolariteNouvellePage from './pages/dashboard/directeur/plans-scolarite/PlanScolariteNouvellePage';
import PlanScolariteDetailPage from './pages/dashboard/directeur/plans-scolarite/PlanScolariteDetailPage';
import PlanScolariteEditerPage from './pages/dashboard/directeur/plans-scolarite/PlanScolariteEditerPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — ÉCHÉANCES
// ═══════════════════════════════════════════════════════════
import EcheancesPage from './pages/dashboard/directeur/echeances/EcheancesPage';
import EcheanceNouvellePage from './pages/dashboard/directeur/echeances/EcheanceNouvellePage';
import EcheanceEditerPage from './pages/dashboard/directeur/echeances/EcheanceEditerPage';
import EcheanceDetailPage from './pages/dashboard/directeur/echeances/EcheanceDetailPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — PAIEMENTS & REÇUS
// ═══════════════════════════════════════════════════════════
import PaiementsListPage from './pages/dashboard/directeur/paiements/PaiementsListPage';
import PaiementNouveauPage from './pages/dashboard/directeur/paiements/PaiementNouveauPage';
import PaiementDetailPage from './pages/dashboard/directeur/paiements/PaiementDetailPage';
import RecusListPage from './pages/dashboard/directeur/recus/RecusListPage';
import RecuDetailPage from './pages/dashboard/directeur/recus/RecuDetailPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — PAIE & STATISTIQUES
// ═══════════════════════════════════════════════════════════
import PaiePage from './pages/dashboard/directeur/paie/PaiePage';
import StatistiquesPage from './pages/dashboard/directeur/statistiques/StatistiquesPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — UTILISATEURS
// ═══════════════════════════════════════════════════════════
import UtilisateursPage from './pages/dashboard/directeur/utilisateurs/UtilisateursPage';
import UtilisateurNouveauPage from './pages/dashboard/directeur/utilisateurs/UtilisateurNouveauPage';
import UtilisateurDetailPage from './pages/dashboard/directeur/utilisateurs/UtilisateurDetailPage';
import UtilisateurEditerPage from './pages/dashboard/directeur/utilisateurs/UtilisateurEditerPage';

// ═══════════════════════════════════════════════════════════
// DIRECTEUR — ÉTABLISSEMENT & PROFIL
// ═══════════════════════════════════════════════════════════
import MonEtablissementPage from './pages/dashboard/directeur/mon-etablissement/MonEtablissementPage';
import MonProfilPage from './pages/dashboard/shared/MonProfilPage';

// ═══════════════════════════════════════════════════════════
// SUPER_ADMIN — MULTI-TENANT
// ═══════════════════════════════════════════════════════════
import SuperAdminEtablissementsPage from './pages/dashboard/super-admin/EtablissementsPage';
import SuperAdminEtablissementNouveauPage from './pages/dashboard/super-admin/EtablissementNouveauPage';
import SuperAdminEtablissementDetailPage from './pages/dashboard/super-admin/EtablissementDetailPage';

// ═══════════════════════════════════════════════════════════
// ROUTES PROTECTED / SUPER_ADMIN / PUBLIC
// ═══════════════════════════════════════════════════════════

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-emerald-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-emerald-200 font-medium">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isInitializing, isSuperAdmin } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-emerald-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-emerald-200 font-medium">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-emerald-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-emerald-200 font-medium">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ═══════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* ═══════════════════════════════════════════
                ROUTES PUBLIQUES
                ═══════════════════════════════════════════ */}
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/verify-otp"
              element={
                <PublicRoute>
                  <VerifyOtpPage />
                </PublicRoute>
              }
            />
            <Route
              path="/verify-reset-otp"
              element={
                <PublicRoute>
                  <VerifyOtpPage />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />

            {/* ═══════════════════════════════════════════
                DASHBOARD PROTÉGÉ
                ═══════════════════════════════════════════ */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dispatch par rôle */}
              <Route index element={<RoleDashboard />} />

              {/* ─── Statistiques ─── */}
              <Route path="statistiques" element={<StatistiquesPage />} />

              {/* ─── Élèves ─── */}
              <Route path="eleves" element={<ElevesPage />} />
              <Route path="eleves/nouveau" element={<EleveNouvellePage />} />
              <Route path="eleves/:id/editer" element={<EleveEditerPage />} />
              <Route path="eleves/:id" element={<EleveDetailPage />} />
              <Route path="import/eleves" element={<ImportElevesPage />} />

              {/* ─── Inscriptions ─── */}
              <Route
                path="eleves/inscriptions"
                element={<InscriptionsListPage />}
              />
              <Route
                path="inscriptions/nouvelle"
                element={<InscriptionNouvellePage />}
              />
              <Route
                path="inscriptions/:id/editer"
                element={<InscriptionEditerPage />}
              />
              <Route
                path="inscriptions/:id"
                element={<InscriptionDetailPage />}
              />

              {/* ─── Classes ─── */}
              <Route path="classes" element={<ClassesPage />} />
              <Route path="classes/nouveau" element={<ClasseNouvellePage />} />
              <Route path="classes/:id/editer" element={<ClasseEditerPage />} />
              <Route path="classes/:id" element={<ClasseDetailPage />} />

              {/* ─── Niveaux ─── */}
              <Route path="niveaux" element={<NiveauxPage />} />
              <Route path="niveaux/nouveau" element={<NiveauNouvellePage />} />
              <Route path="niveaux/:id/editer" element={<NiveauEditerPage />} />
              <Route path="niveaux/:id" element={<NiveauDetailPage />} />

              {/* ─── Matières ─── */}
              <Route path="matieres" element={<MatieresPage />} />
              <Route
                path="matieres/nouveau"
                element={<MatiereNouvellePage />}
              />
              <Route
                path="matieres/:id/editer"
                element={<MatiereEditerPage />}
              />
              <Route path="matieres/:id" element={<MatiereDetailPage />} />

              {/* ─── Emploi du temps ─── */}
              <Route path="emploi-temps" element={<EmploiTempsPage />} />
              <Route
                path="emploi-temps/nouveau"
                element={<EmploiTempsNouvellePage />}
              />
              <Route
                path="emploi-temps/:id/editer"
                element={<EmploiTempsEditerPage />}
              />
              <Route
                path="emploi-temps/:id"
                element={<EmploiTempsDetailPage />}
              />

              {/* ─── Notes & Bulletins ─── */}
              <Route path="notes" element={<NotesPage />} />
              <Route path="notes/saisie" element={<NotesPage />} />
              <Route path="notes/bulletins" element={<BulletinsPage />} />
              <Route path="bulletins" element={<BulletinsPage />} />

              {/* ─── Enseignants ─── */}
              <Route path="enseignants" element={<EnseignantsPage />} />
              <Route
                path="enseignants/nouveau"
                element={<EnseignantNouvellePage />}
              />
              <Route
                path="enseignants/:id/editer"
                element={<EnseignantEditerPage />}
              />
              <Route path="enseignants/:id" element={<EnseignantDetailPage />} />

              {/* ─── Affectations ─── */}
              <Route path="affectations" element={<AffectationsPage />} />
              <Route
                path="affectations/nouveau"
                element={<AffectationNouvellePage />}
              />
              <Route
                path="affectations/:id/editer"
                element={<AffectationEditerPage />}
              />
              <Route
                path="affectations/:id"
                element={<AffectationDetailPage />}
              />

              {/* ─── Années scolaires ─── */}
              <Route path="annees" element={<AnneesScolairesPage />} />
              <Route
                path="annees-scolaires/nouveau"
                element={<AnneeScolaireNouvellePage />}
              />
              <Route
                path="annees-scolaires/:id/editer"
                element={<AnneeScolaireEditerPage />}
              />
              <Route
                path="annees-scolaires/:id"
                element={<AnneeScolaireDetailPage />}
              />

              {/* ─── Périodes ─── */}
              <Route path="periodes" element={<PeriodesPage />} />
              <Route
                path="periodes/nouveau"
                element={<PeriodeNouvellePage />}
              />
              <Route
                path="periodes/:id/editer"
                element={<PeriodeEditerPage />}
              />
              <Route path="periodes/:id" element={<PeriodeDetailPage />} />

              {/* ─── Plans de scolarité ─── */}
              <Route path="plans-scolarite" element={<PlansScolaritePage />} />
              <Route
                path="plans-scolarite/nouveau"
                element={<PlanScolariteNouvellePage />}
              />
              <Route
                path="plans-scolarite/:id/editer"
                element={<PlanScolariteEditerPage />}
              />
              <Route
                path="plans-scolarite/:id"
                element={<PlanScolariteDetailPage />}
              />

              {/* ─── Échéances ─── */}
              <Route path="echeances" element={<EcheancesPage />} />
              <Route
                path="echeances/nouveau"
                element={<EcheanceNouvellePage />}
              />
              <Route
                path="echeances/:id/editer"
                element={<EcheanceEditerPage />}
              />
              <Route path="echeances/:id" element={<EcheanceDetailPage />} />

              {/* ─── Paiements & Reçus ─── */}
              <Route path="paiements" element={<PaiementsListPage />} />
              <Route
                path="paiements/nouveau"
                element={<PaiementNouveauPage />}
              />
              <Route path="paiements/:id" element={<PaiementDetailPage />} />
              <Route path="recus" element={<RecusListPage />} />
              <Route path="recus/:id" element={<RecuDetailPage />} />

              {/* ─── Paie ─── */}
              <Route path="paie" element={<PaiePage />} />

              {/* ─── Utilisateurs ─── */}
              <Route path="utilisateurs" element={<UtilisateursPage />} />
              <Route
                path="utilisateurs/nouveau"
                element={<UtilisateurNouveauPage />}
              />
              <Route
                path="utilisateurs/:id/editer"
                element={<UtilisateurEditerPage />}
              />
              <Route
                path="utilisateurs/:id"
                element={<UtilisateurDetailPage />}
              />

              {/* ─── Établissement ─── */}
              <Route
                path="mon-etablissement"
                element={<MonEtablissementPage />}
              />

              {/* ─── Profil (tous rôles) ─── */}
              <Route path="mon-profil" element={<MonProfilPage />} />
              <Route path="profil" element={<MonProfilPage />} />

              {/* ═══════════════════════════════════════════
                  SUPER_ADMIN — MULTI-TENANT
                  ═══════════════════════════════════════════ */}
              <Route
                path="etablissements"
                element={
                  <SuperAdminRoute>
                    <SuperAdminEtablissementsPage />
                  </SuperAdminRoute>
                }
              />
              <Route
                path="etablissements/nouveau"
                element={
                  <SuperAdminRoute>
                    <SuperAdminEtablissementNouveauPage />
                  </SuperAdminRoute>
                }
              />
              <Route
                path="etablissements/:id"
                element={
                  <SuperAdminRoute>
                    <SuperAdminEtablissementDetailPage />
                  </SuperAdminRoute>
                }
              />

              {/* ─── 404 Dashboard ─── */}
              <Route
                path="*"
                element={
                  <div className="flex flex-col items-center justify-center py-20">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                      404
                    </h2>
                    <p className="text-gray-500 dark:text-emerald-200/60 mt-2">
                      Page introuvable dans le dashboard
                    </p>
                  </div>
                }
              />
            </Route>

            {/* ─── 404 Global ─── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;