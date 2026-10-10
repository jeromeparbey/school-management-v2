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
import MonEtablissementPage from './pages/dashboard/directeur/mon-etablissement/MonEtablissementPage';
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
// 🆕 PAGES DASHBOARD — SUPER_ADMIN
// ============================================
// ✅ SEUL LE DASHBOARD PRINCIPAL EXISTE POUR L'INSTANT
import SuperAdminDashboardPage from './pages/dashboard/super-admin/SuperAdminDashboardPage';

// ⏳ À créer — Décommenter au fur et à mesure
import SuperAdminEtablissementsPage from './pages/dashboard/super-admin/EtablissementsPage';
import SuperAdminEtablissementNouveauPage from './pages/dashboard/super-admin/EtablissementNouveauPage';
import SuperAdminEtablissementDetailPage from './pages/dashboard/super-admin/EtablissementDetailPage';
// import SuperAdminProvisioningPage from './pages/dashboard/super-admin/ProvisioningPage';
// import SuperAdminAbonnementsPage from './pages/dashboard/super-admin/AbonnementsPage';
// import SuperAdminFacturesPage from './pages/dashboard/super-admin/FacturesPage';
// import SuperAdminUtilisateursGlobauxPage from './pages/dashboard/super-admin/UtilisateursGlobauxPage';
// import SuperAdminRolesGlobauxPage from './pages/dashboard/super-admin/RolesGlobauxPage';
// import SuperAdminStatistiquesGlobalesPage from './pages/dashboard/super-admin/StatistiquesGlobalesPage';
// import SuperAdminStatsServeurPage from './pages/dashboard/super-admin/StatsServeurPage';
// import SuperAdminSauvegardesPage from './pages/dashboard/super-admin/SauvegardesPage';
// import SuperAdminSchemasPage from './pages/dashboard/super-admin/SchemasPage';
// import SuperAdminConfigPage from './pages/dashboard/super-admin/ConfigPage';

// ============================================
// 🆕 PAGES DASHBOARD — ELEVE
// ============================================
// ⏳ À créer — Décommenter au fur et à mesure
// import EleveMesNotesPage from './pages/dashboard/eleve/MesNotesPage';
// import EleveMesBulletinsPage from './pages/dashboard/eleve/MesBulletinsPage';
// import EleveMonEmploiTempsPage from './pages/dashboard/eleve/MonEmploiTempsPage';
// import EleveMesMatieresPage from './pages/dashboard/eleve/MesMatieresPage';
// import EleveMesProfesseursPage from './pages/dashboard/eleve/MesProfesseursPage';
// import EleveMesObjectifsPage from './pages/dashboard/eleve/MesObjectifsPage';
// import EleveMesGroupesTDPage from './pages/dashboard/eleve/MesGroupesTDPage';
// import EleveMesDocumentsPage from './pages/dashboard/eleve/MesDocumentsPage';
// import EleveMesEpreuvesPage from './pages/dashboard/eleve/MesEpreuvesPage';
// import EleveMesCorrectionsPage from './pages/dashboard/eleve/MesCorrectionsPage';
// import EleveMesPresencesPage from './pages/dashboard/eleve/MesPresencesPage';
// import EleveMesAbsencesPage from './pages/dashboard/eleve/MesAbsencesPage';
// import EleveMesAppreciationsPage from './pages/dashboard/eleve/MesAppreciationsPage';
// import EleveBibliothequePage from './pages/dashboard/eleve/BibliothequePage';
// import EleveMesEmpruntsPage from './pages/dashboard/eleve/MesEmpruntsPage';
// import EleveMonProfilPage from './pages/dashboard/eleve/MonProfilPage';
// import EleveSupportPage from './pages/dashboard/eleve/SupportPage';
// import EleveFaqPage from './pages/dashboard/eleve/FaqPage';

// ============================================
// 🆕 PAGES DASHBOARD — SURVEILLANT
// ============================================
// ⏳ À créer — Décommenter au fur et à mesure
// import SurveillantMesZonesPage from './pages/dashboard/surveillant/MesZonesPage';
// import SurveillantSurveillancesPage from './pages/dashboard/surveillant/SurveillancesPage';
// import SurveillantMonPlanningPage from './pages/dashboard/surveillant/MonPlanningPage';
// import SurveillantSignalerIncidentPage from './pages/dashboard/surveillant/SignalerIncidentPage';
// import SurveillantMesIncidentsPage from './pages/dashboard/surveillant/MesIncidentsPage';
// import SurveillantIncidentsTraitesPage from './pages/dashboard/surveillant/IncidentsTraitesPage';
// import SurveillantRechercheElevePage from './pages/dashboard/surveillant/RechercheElevePage';
// import SurveillantPresencesElevesPage from './pages/dashboard/surveillant/PresencesElevesPage';
// import SurveillantAbsencesElevesPage from './pages/dashboard/surveillant/AbsencesElevesPage';
// import SurveillantMesStatistiquesPage from './pages/dashboard/surveillant/MesStatistiquesPage';

// ============================================
// 🆕 PAGES DASHBOARD — BIBLIOTHECAIRE
// ============================================
// ⏳ À créer — Décommenter au fur et à mesure
// import BibliothecaireLivresPage from './pages/dashboard/bibliothecaire/LivresPage';
// import BibliothecaireLivreNouveauPage from './pages/dashboard/bibliothecaire/LivreNouveauPage';
// import BibliothecaireCategoriesPage from './pages/dashboard/bibliothecaire/CategoriesPage';
// import BibliothecaireAuteursPage from './pages/dashboard/bibliothecaire/AuteursPage';
// import BibliothecaireEmpruntsPage from './pages/dashboard/bibliothecaire/EmpruntsPage';
// import BibliothecaireEmpruntNouveauPage from './pages/dashboard/bibliothecaire/EmpruntNouveauPage';
// import BibliothecaireRetoursPage from './pages/dashboard/bibliothecaire/RetoursPage';
// import BibliothecaireEmpruntsRetardPage from './pages/dashboard/bibliothecaire/EmpruntsRetardPage';
// import BibliothecairePenalitesPage from './pages/dashboard/bibliothecaire/PenalitesPage';

// ============================================
// 🆕 PAGES PARTAGÉES (Messages, Communiqués, Chat, Notifications)
// ============================================
// ⏳ À créer — Décommenter au fur et à mesure
// import MessagesPage from './pages/dashboard/shared/MessagesPage';
// import CommuniquesPage from './pages/dashboard/shared/CommuniquesPage';
// import ChatPage from './pages/dashboard/shared/ChatPage';
// import NotificationsPage from './pages/dashboard/shared/NotificationsPage';
// import MonProfilPage from './pages/dashboard/shared/MonProfilPage';

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
// 🆕 COMPOSANT SUPER_ADMIN ROUTE
// ============================================
const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitializing, isSuperAdmin } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
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
             <Route path="mon-etablissement" element={<MonEtablissementPage />} />

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

            {/* ════════════════════════════════════════════
                🆕 SUPER_ADMIN — CATALOGUE MULTI-TENANT
                ⏳ À DÉCOMMENTER AU FUR ET À MESURE
                ════════════════════════════════════════════ */}

            {/* Statistiques globales */}
            {/* <Route
              path="statistiques-globales"
              element={
                <SuperAdminRoute>
                  <SuperAdminStatistiquesGlobalesPage />
                </SuperAdminRoute>
              }
            /> */}

            {/* Établissements */}
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
            {/* Provisioning */}
            {/* <Route
              path="provisioning"
              element={
                <SuperAdminRoute>
                  <SuperAdminProvisioningPage />
                </SuperAdminRoute>
              }
            /> */}

            {/* Abonnements & Factures */}
            {/* <Route
              path="abonnements"
              element={
                <SuperAdminRoute>
                  <SuperAdminAbonnementsPage />
                </SuperAdminRoute>
              }
            /> */}
            {/* <Route
              path="factures"
              element={
                <SuperAdminRoute>
                  <SuperAdminFacturesPage />
                </SuperAdminRoute>
              }
            /> */}

            {/* Utilisateurs & rôles globaux */}
            {/* <Route
              path="utilisateurs-globaux"
              element={
                <SuperAdminRoute>
                  <SuperAdminUtilisateursGlobauxPage />
                </SuperAdminRoute>
              }
            /> */}
            {/* <Route
              path="roles-globaux"
              element={
                <SuperAdminRoute>
                  <SuperAdminRolesGlobauxPage />
                </SuperAdminRoute>
              }
            /> */}

            {/* Monitoring & système */}
            {/* <Route
              path="stats-serveur"
              element={
                <SuperAdminRoute>
                  <SuperAdminStatsServeurPage />
                </SuperAdminRoute>
              }
            /> */}
            {/* <Route
              path="sauvegardes"
              element={
                <SuperAdminRoute>
                  <SuperAdminSauvegardesPage />
                </SuperAdminRoute>
              }
            /> */}
            {/* <Route
              path="schemas"
              element={
                <SuperAdminRoute>
                  <SuperAdminSchemasPage />
                </SuperAdminRoute>
              }
            /> */}
            {/* <Route
              path="config"
              element={
                <SuperAdminRoute>
                  <SuperAdminConfigPage />
                </SuperAdminRoute>
              }
            /> */}

            {/* ════════════════════════════════════════════
                🆕 ELEVE — VUES PERSONNELLES
                ⏳ À DÉCOMMENTER AU FUR ET À MESURE
                ════════════════════════════════════════════ */}

            {/* Profil */}
            {/* <Route path="mon-profil" element={<EleveMonProfilPage />} /> */}

            {/* Scolarité */}
            {/* <Route path="mes-notes" element={<EleveMesNotesPage />} /> */}
            {/* <Route path="mes-bulletins" element={<EleveMesBulletinsPage />} /> */}
            {/* <Route path="mon-emploi-temps" element={<EleveMonEmploiTempsPage />} /> */}
            {/* <Route path="mes-matieres" element={<EleveMesMatieresPage />} /> */}
            {/* <Route path="mes-professeurs" element={<EleveMesProfesseursPage />} /> */}

            {/* Activités */}
            {/* <Route path="mes-objectifs" element={<EleveMesObjectifsPage />} /> */}
            {/* <Route path="mes-groupes-td" element={<EleveMesGroupesTDPage />} /> */}
            {/* <Route path="mes-documents" element={<EleveMesDocumentsPage />} /> */}
            {/* <Route path="mes-epreuves" element={<EleveMesEpreuvesPage />} /> */}
            {/* <Route path="mes-corrections" element={<EleveMesCorrectionsPage />} /> */}

            {/* Présences */}
            {/* <Route path="mes-presences" element={<EleveMesPresencesPage />} /> */}
            {/* <Route path="mes-absences" element={<EleveMesAbsencesPage />} /> */}
            {/* <Route path="mes-appreciations" element={<EleveMesAppreciationsPage />} /> */}

            {/* Bibliothèque */}
            {/* <Route path="bibliotheque" element={<EleveBibliothequePage />} /> */}
            {/* <Route path="mes-emprunts" element={<EleveMesEmpruntsPage />} /> */}

            {/* Aide */}
            {/* <Route path="support" element={<EleveSupportPage />} /> */}
            {/* <Route path="faq" element={<EleveFaqPage />} /> */}

            {/* ════════════════════════════════════════════
                🆕 SURVEILLANT — VUES PERSONNELLES
                ⏳ À DÉCOMMENTER AU FUR ET À MESURE
                ════════════════════════════════════════════ */}

            {/* Statistiques */}
            {/* <Route path="mes-statistiques" element={<SurveillantMesStatistiquesPage />} /> */}

            {/* Surveillance */}
            {/* <Route path="mes-zones" element={<SurveillantMesZonesPage />} /> */}
            {/* <Route path="surveillances" element={<SurveillantSurveillancesPage />} /> */}
            {/* <Route path="mon-planning" element={<SurveillantMonPlanningPage />} /> */}

            {/* Incidents */}
            {/* <Route path="incidents/signaler" element={<SurveillantSignalerIncidentPage />} /> */}
            {/* <Route path="mes-incidents" element={<SurveillantMesIncidentsPage />} /> */}
            {/* <Route path="incidents/traites" element={<SurveillantIncidentsTraitesPage />} /> */}

            {/* Élèves */}
            {/* <Route path="eleves/recherche" element={<SurveillantRechercheElevePage />} /> */}
            {/* <Route path="presences-eleves" element={<SurveillantPresencesElevesPage />} /> */}
            {/* <Route path="absences-eleves" element={<SurveillantAbsencesElevesPage />} /> */}

            {/* ════════════════════════════════════════════
                🆕 BIBLIOTHECAIRE — GESTION BIBLIOTHÈQUE
                ⏳ À DÉCOMMENTER AU FUR ET À MESURE
                ════════════════════════════════════════════ */}

            {/* Livres */}
            {/* <Route path="livres" element={<BibliothecaireLivresPage />} /> */}
            {/* <Route path="livres/nouveau" element={<BibliothecaireLivreNouveauPage />} /> */}
            {/* <Route path="categories-livres" element={<BibliothecaireCategoriesPage />} /> */}
            {/* <Route path="auteurs" element={<BibliothecaireAuteursPage />} /> */}

            {/* Emprunts */}
            {/* <Route path="emprunts" element={<BibliothecaireEmpruntsPage />} /> */}
            {/* <Route path="emprunts/nouveau" element={<BibliothecaireEmpruntNouveauPage />} /> */}
            {/* <Route path="emprunts/retard" element={<BibliothecaireEmpruntsRetardPage />} /> */}
            {/* <Route path="retours" element={<BibliothecaireRetoursPage />} /> */}
            {/* <Route path="penalites" element={<BibliothecairePenalitesPage />} /> */}

            {/* ════════════════════════════════════════════
                🆕 ROUTES PARTAGÉES (tous rôles)
                ⏳ À DÉCOMMENTER AU FUR ET À MESURE
                ════════════════════════════════════════════ */}

            {/* <Route path="messages" element={<MessagesPage />} /> */}
            {/* <Route path="communiques" element={<CommuniquesPage />} /> */}
            {/* <Route path="chat" element={<ChatPage />} /> */}
            {/* <Route path="notifications" element={<NotificationsPage />} /> */}
            {/* <Route path="profil" element={<MonProfilPage />} /> */}

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