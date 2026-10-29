// frontend2/src/pages/auth/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  BoltIcon,
  ChartBarIcon,
  UsersIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/AuthContext';

// ═══════════════════════════════════════════════
// ARGUMENTS POUR LA COLONNE GAUCHE
// ═══════════════════════════════════════════════

const FEATURES = [
  {
    icon: UsersIcon,
    title: 'Gestion des élèves',
    description: 'Inscriptions, dossiers, bulletins, présences — centralisés.',
  },
  {
    icon: BanknotesIcon,
    title: 'Suivi financier précis',
    description: 'Paiements, tranches, reçus et relances en quelques clics.',
  },
  {
    icon: DocumentTextIcon,
    title: 'Notes & évaluations',
    description: 'Saisie, moyennes, classements et bulletins automatiques.',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Emplois du temps',
    description: 'Planification claire pour enseignants et élèves.',
  },
];

const STATS = [
  { value: '5 000+', label: 'élèves gérés' },
  { value: '200+', label: 'établissements' },
  { value: '99.9%', label: 'de disponibilité' },
];

// ═══════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, user, isAuthenticated, isLoading, error, clearError } =
    useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? '/dashboard';

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, motDePasse: password });

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
    } catch {
      /* erreur gérée par le context */
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4 sm:p-6">
      {/* Décors de fond */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </div>

      {/* Conteneur principal compact et centré */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-2"
      >
        {/* ═══════════════════════════════════════════════════════════
            COLONNE GAUCHE — Présentation (VERTE)
            ═══════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-10 xl:p-12 relative overflow-hidden text-white">
          {/* Décors animés */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-32 -right-32 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute -bottom-32 -left-32 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl"
            />
          </div>

          <div className="relative z-10">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-3 group">
              <motion.div
                className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/30"
                whileHover={{ rotate: 8, scale: 1.05 }}
              >
                <AcademicCapIcon className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <span className="text-xl font-bold text-white">EduManage</span>
                <span className="text-xs text-emerald-200 block -mt-0.5">
                  Plateforme scolaire
                </span>
              </div>
            </Link>

            {/* Titre */}
            <div className="mt-10">
              <motion.h1
                variants={itemVariants}
                className="text-3xl xl:text-4xl font-bold leading-tight"
              >
                Toute votre école,
                <br />
                <span className="text-emerald-200">dans une seule plateforme.</span>
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="mt-4 text-emerald-100 text-sm leading-relaxed"
              >
                Gérez élèves, enseignants, notes, paiements et emplois du temps
                depuis un espace unique, sécurisé et intuitif.
              </motion.p>
            </div>

            {/* Features */}
            <div className="mt-8 space-y-4">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-9 h-9 bg-white/15 backdrop-blur-lg rounded-lg flex items-center justify-center shrink-0 border border-white/20">
                    <feature.icon className="w-5 h-5 text-emerald-100" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {feature.title}
                    </p>
                    <p className="text-xs text-emerald-100/80 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats footer */}
          <motion.div
            variants={itemVariants}
            className="relative z-10 mt-10 pt-6 border-t border-white/20 grid grid-cols-3 gap-3"
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-xl xl:text-2xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="text-[11px] text-emerald-200 mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            COLONNE DROITE — Formulaire (BLANC)
            ═══════════════════════════════════════════════════════════ */}
        <div className="p-8 sm:p-10 xl:p-12 flex flex-col justify-center">
          {/* Header mobile */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">
                  EduManage
                </span>
                <span className="text-xs text-gray-400 block -mt-0.5">
                  Connexion
                </span>
              </div>
            </Link>
          </div>

          {/* Titre */}
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Bon retour ! 👋
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Connectez-vous à votre espace établissement.
            </p>
          </motion.div>

          {/* Erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
            >
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-red-800">
                  Erreur de connexion
                </p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="exemple@email.com"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            {/* Mot de passe */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Mot de passe
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={
                    showPassword ? 'Masquer' : 'Afficher'
                  }
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Remember me */}
            <motion.div variants={itemVariants}>
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                Se souvenir de moi
              </label>
            </motion.div>

            {/* Submit */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Connexion en cours…
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

         
          
          {/* Trust badges */}
          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-wrap justify-center gap-3 text-[11px] text-gray-400"
          >
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>Chiffré SSL</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>RGPD</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>Support 24/7</span>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-center text-[11px] text-gray-400"
          >
            © {new Date().getFullYear()} EduManage — Tous droits réservés
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;