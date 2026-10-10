// frontend/src/pages/auth/ForgotPasswordPage.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  AcademicCapIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { authService } from '../../services/auth.service';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'email.');
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
              <span className="text-xs text-gray-400 block -mt-0.5">Mot de passe oublié</span>
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
                <h2 className="text-2xl font-bold text-gray-900">Mot de passe oublié ?</h2>
                <p className="text-gray-600 mt-1 text-sm">
                  Entrez votre adresse email et nous vous enverrons un lien de réinitialisation.
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
                      disabled={isSubmitting}
                    />
                  </div>
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
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          Envoyer le lien
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Email envoyé !</h3>
              <p className="text-gray-600 mb-6">
                Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>. 
                Veuillez vérifier votre boîte de réception.
              </p>
              <Link to="/login">
                <button className="text-blue-600 font-semibold hover:underline flex items-center gap-2 mx-auto">
                  <ArrowLeftIcon className="w-4 h-4" />
                  Retour à la connexion
                </button>
              </Link>
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

export default ForgotPasswordPage;