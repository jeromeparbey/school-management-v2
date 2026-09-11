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
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ⚠️ On récupère TOUT depuis le context — pas de state local pour l'erreur
  const { login, user, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirection après connexion (vers la page demandée initialement ou /dashboard)
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  // Nettoyer l'erreur quand on quitte la page
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      // ⚠️ On passe un OBJET LoginPayload, pas deux arguments
      await login({ email, motDePasse: password });

      // Si "se souvenir de moi" est coché, on persiste le flag
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      // Le useEffect ci-dessus gère la redirection
    } catch {
      // L'erreur est déjà dans le context via `error`
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <motion.div
              className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30"
              whileHover={{ rotate: 10, scale: 1.05 }}
            >
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                EduManage
              </span>
              <span className="text-xs text-gray-400 block -mt-0.5">Connexion</span>
            </div>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Bienvenue !</h2>
            <p className="text-gray-600 mt-1">Connectez-vous pour accéder à votre espace</p>
          </div>

          {/* Error message — vient du context */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Erreur de connexion</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none"
                  placeholder="exemple@email.com"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
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
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Se souvenir de moi
              </label>
            </motion.div>

            {/* Submit button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </motion.div>

          {/* Register link */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-gray-600">
              Pas encore de compte ?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline"
              >
                Créer un compte
              </Link>
            </p>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex justify-center gap-6 text-xs text-gray-400"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>Chiffré SSL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>Conforme RGPD</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>Support 24/7</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;