// frontend2/src/pages/dashboard/DashboardFallbackPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/AuthContext';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  HomeIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline';

// ============================================
// TYPES
// ============================================
interface RoleInfo {
  label: string;
  description: string;
}

// ============================================
// HELPERS
// ============================================

/**
 * Retourne une description lisible pour chaque rôle connu.
 * Si le rôle n'est pas reconnu, on affiche un texte générique.
 */
const getRoleInfo = (role?: string): RoleInfo => {
  const map: Record<string, RoleInfo> = {
    SUPER_ADMIN: {
      label: 'Super Administrateur',
      description:
        'Accès total au système multi-tenant. Votre tableau de bord est en cours de configuration.',
    },
    ADMIN: {
      label: 'Administrateur',
      description:
        'Administration système de l\'établissement. Votre tableau de bord est en cours de configuration.',
    },
    DIRECTEUR: {
      label: 'Directeur',
      description:
        'Direction et gestion de l\'établissement. Votre tableau de bord est en cours de configuration.',
    },
    SECRETAIRE: {
      label: 'Secrétaire',
      description:
        'Gestion administrative et scolarité. Votre tableau de bord est en cours de configuration.',
    },
    ENSEIGNANT: {
      label: 'Enseignant',
      description:
        'Enseignement et évaluation des élèves. Votre tableau de bord est en cours de configuration.',
    },
    SURVEILLANT: {
      label: 'Surveillant',
      description:
        'Surveillance et discipline des élèves. Votre tableau de bord est en cours de configuration.',
    },
    PARENT: {
      label: 'Parent',
      description:
        'Suivi de la scolarité des enfants. Votre tableau de bord est en cours de configuration.',
    },
    ELEVE: {
      label: 'Élève',
      description:
        'Consultation des notes, devoirs et emploi du temps. Votre tableau de bord est en cours de configuration.',
    },
    BIBLIOTHECAIRE: {
      label: 'Bibliothécaire',
      description:
        'Gestion de la bibliothèque et des emprunts. Votre tableau de bord est en cours de configuration.',
    },
  };

  if (!role) {
    return {
      label: 'Utilisateur',
      description:
        'Votre rôle n\'a pas pu être identifié. Contactez l\'administrateur.',
    };
  }

  return (
    map[role] ?? {
      label: role,
      description:
        'Votre rôle n\'est pas encore supporté par le tableau de bord. Contactez l\'administrateur.',
    }
  );
};

/**
 * Animation variants réutilisables.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const DashboardFallbackPage: React.FC = () => {
  const { user, logout } = useAuth();

  const roleInfo = getRoleInfo(user?.role);

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-2xl"
      >
        {/* ============================================
            CARTE PRINCIPALE
            ============================================ */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative"
        >
          {/* Bande décorative supérieure */}
          <div className="h-2 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400" />

          {/* Décorations en arrière-plan */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50" />

          <div className="p-8 md:p-10 relative">
            {/* ============================================
                ICÔNE D'AVERTISSEMENT
                ============================================ */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center mb-6"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-orange-200 rounded-2xl blur-xl opacity-60 animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <ExclamationTriangleIcon className="w-10 h-10 text-white" />
                </div>
              </motion.div>
            </motion.div>

            {/* ============================================
                TITRE + MESSAGE
                ============================================ */}
            <motion.div variants={itemVariants} className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Tableau de bord indisponible
              </h1>
              <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto">
                Bonjour <strong>{user?.prenom ?? 'utilisateur'}</strong>, nous
                n'avons pas pu charger votre tableau de bord pour le moment.
              </p>
            </motion.div>

            {/* ============================================
                CARTE INFO RÔLE
                ============================================ */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100 mb-6"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm flex-shrink-0">
                  <ShieldCheckIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold mb-1">
                    Votre rôle
                  </p>
                  <p className="text-base font-bold text-gray-900 mb-1">
                    {roleInfo.label}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {roleInfo.description}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-gray-400 mt-2 truncate">
                      Compte : {user.email}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ============================================
                CAUSES POSSIBLES
                ============================================ */}
            <motion.div variants={itemVariants} className="mb-6">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">
                Causes possibles
              </p>
              <ul className="space-y-2">
                {[
                  'Votre rôle est en cours de configuration par un administrateur',
                  'Une maintenance est en cours sur votre espace',
                  'Votre compte vient d\'être créé et n\'est pas encore activé',
                  'Un problème technique temporaire est survenu',
                ].map((cause, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                    <span>{cause}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* ============================================
                ACTIONS PRINCIPALES
                ============================================ */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
            >
              {/* Bouton : Rafraîchir */}
              <motion.button
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Réessayer
              </motion.button>

              {/* Bouton : Support */}
              <motion.a
                href="mailto:support@edu-manage.com"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all"
              >
                <LifebuoyIcon className="w-5 h-5" />
                Contacter le support
              </motion.a>
            </motion.div>

            {/* ============================================
                LIENS SECONDAIRES
                ============================================ */}
            <motion.div
              variants={itemVariants}
              className="pt-6 border-t border-gray-100"
            >
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3 text-center">
                Accès rapides
              </p>
              <div className="grid grid-cols-3 gap-3">
                {/* Accueil */}
                <Link
                  to="/"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-orange-100 transition-colors">
                    <HomeIcon className="w-5 h-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-orange-600 transition-colors">
                    Accueil
                  </span>
                </Link>

                {/* Mon profil */}
                <Link
                  to="/dashboard/mon-profil"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-orange-100 transition-colors">
                    <UserCircleIcon className="w-5 h-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-orange-600 transition-colors">
                    Mon profil
                  </span>
                </Link>

                {/* Support */}
                <a
                  href="mailto:support@edu-manage.com"
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-orange-100 transition-colors">
                    <EnvelopeIcon className="w-5 h-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-orange-600 transition-colors">
                    Email
                  </span>
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ============================================
            BOUTON DÉCONNEXION (sous la carte)
            ============================================ */}
        <motion.div
          variants={itemVariants}
          className="mt-6 text-center"
        >
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors group"
          >
            <span>Se déconnecter et changer de compte</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* ============================================
            FOOTER
            ============================================ */}
        <motion.div
          variants={itemVariants}
          className="mt-8 text-center text-xs text-gray-400"
        >
          <p>© 2024 EduManage. Tous droits réservés.</p>
          <p className="mt-1">
            Version 1.0.0 •{' '}
            {new Date().toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardFallbackPage;