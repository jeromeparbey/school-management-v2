// frontend/src/pages/auth/ResetPasswordPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  AcademicCapIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { authService } from '../../services/auth.service';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
  }>({ score: 0, label: 'Faible', color: 'red' });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!token) {
      setError('Token de réinitialisation invalide. Veuillez refaire une demande.');
    }
  }, [token]);

  // Vérifier la force du mot de passe
  useEffect(() => {
    const checkPasswordStrength = (password: string) => {
      const errors: string[] = [];
      let score = 0;

      if (password.length >= 8) score++;
      else errors.push('Au moins 8 caractères');

      if (/[a-z]/.test(password)) score++;
      else errors.push('Une minuscule');

      if (/[A-Z]/.test(password)) score++;
      else errors.push('Une majuscule');

      if (/[0-9]/.test(password)) score++;
      else errors.push('Un chiffre');

      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
      else errors.push('Un caractère spécial');

      setPasswordErrors(errors);

      const levels = [
        { score: 0, label: 'Très faible', color: 'red' },
        { score: 1, label: 'Faible', color: 'orange' },
        { score: 2, label: 'Moyen', color: 'yellow' },
        { score: 3, label: 'Fort', color: 'green' },
        { score: 4, label: 'Très fort', color: 'green' },
        { score: 5, label: 'Excellent', color: 'emerald' },
      ];

      const level = levels.find(l => l.score === score) || levels[0];
      setPasswordStrength(level);
    };

    checkPasswordStrength(newPassword);
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Token de réinitialisation invalide.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordStrength.score < 3) {
      setError('Le mot de passe est trop faible. Veuillez choisir un mot de passe plus fort.');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationCircleIcon className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Token invalide</h3>
          <p className="text-gray-600 mb-6">
            Le lien de réinitialisation est invalide ou a expiré.
          </p>
          <Link to="/forgot-password">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300">
              Demander un nouveau lien
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
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
              <span className="text-xs text-gray-400 block -mt-0.5">Réinitialisation</span>
            </div>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50"
        >
          {!success ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h2>
                <p className="text-gray-600 mt-1 text-sm">
                  Choisissez un mot de passe sécurisé pour votre compte.
                </p>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                >
                  <ExclamationCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Erreur</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none"
                      placeholder="••••••••"
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password strength */}
                  {newPassword && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600">Force :</span>
                          <span className={`text-xs font-semibold text-${passwordStrength.color}-600`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{passwordErrors.length} critères manquants</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-${passwordStrength.color}-500 rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      {passwordErrors.length > 0 && (
                        <ul className="text-xs text-gray-500 space-y-0.5">
                          {passwordErrors.map((err, index) => (
                            <li key={index} className="flex items-center gap-1.5">
                              <span className="text-red-400">•</span>
                              {err}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none"
                      placeholder="••••••••"
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <ExclamationCircleIcon className="w-4 h-4" />
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Réinitialisation en cours...
                        </>
                      ) : (
                        <>
                          Réinitialiser le mot de passe
                          <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </motion.div>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe réinitialisé !</h3>
              <p className="text-gray-600 mb-6">
                Votre mot de passe a été modifié avec succès. 
                Vous allez être redirigé vers la page de connexion.
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </motion.div>
          )}

          {/* Back to login */}
          {!success && (
            <motion.div variants={itemVariants} className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;