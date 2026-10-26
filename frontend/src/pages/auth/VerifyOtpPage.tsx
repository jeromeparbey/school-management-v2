// frontend/src/pages/auth/VerifyResetOtpPage.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/AuthContext';

// ⭐ Extraction robuste d'un message d'erreur.
const getErrorMessage = (err: unknown, fallback: string): string => {
  if (typeof err === 'object' && err !== null) {
    const e = err as {
      response?: { data?: { message?: string }; status?: number };
      message?: string;
      name?: string;
    };

    if (e.response?.data?.message) return e.response.data.message;

    if (e.response?.status === 429) {
      return 'Trop de tentatives. Réessayez dans quelques minutes.';
    }

    if (e.name === 'SyntaxError' && e.message?.includes('JSON')) {
      return "Une erreur de données locales est survenue. Veuillez rafraîchir la page (F5).";
    }

    if (e.message) return e.message;
  }
  return fallback;
};

const sanitizeLocalStorage = (): void => {
  const JSON_KEYS = ['etablissement', 'auth_user', 'auth_scope'];
  for (const k of JSON_KEYS) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    try {
      JSON.parse(raw);
    } catch {
      localStorage.removeItem(k);
    }
  }
};

// ⭐ Clés partagées avec /forgot-password et /reset-password
const RESET_KEYS = {
  EMAIL: 'resetEmail',
  ETABLISSEMENT_ID: 'resetEtablissementId',
  RESET_TOKEN: 'resetToken',
} as const;

const VerifyResetOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const { verifyResetOtp, forgotPassword } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [etablissementId, setEtablissementId] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem(RESET_KEYS.EMAIL);
    const storedEtabId = localStorage.getItem(RESET_KEYS.ETABLISSEMENT_ID) ?? undefined;

    if (storedEmail) {
      setEmail(storedEmail);
      setEtablissementId(storedEtabId);
    } else {
      setError('Session expirée. Veuillez refaire une demande.');
    }
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const digits = pastedData.replace(/\D/g, '').split('');
    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    setOtp(newOtp);
    if (digits.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const otpString = otp.join('');

    try {
      sanitizeLocalStorage();

      // ⭐ verifyResetOtp → { resetToken, etablissementId }
      const res = await verifyResetOtp({
        email,
        otp: otpString,
        etablissementId: etablissementId ?? '',
      });

      const data = (res as any)?.data ?? res;
      const resetToken: string = data?.resetToken ?? '';
      const finalEtabId: string = data?.etablissementId ?? etablissementId ?? '';

      if (!resetToken) {
        throw new Error('Réponse invalide du serveur.');
      }

      localStorage.setItem(RESET_KEYS.RESET_TOKEN, resetToken);
      localStorage.setItem(RESET_KEYS.ETABLISSEMENT_ID, finalEtabId);

      setSuccess(true);

      // ⭐ Redirection vers /reset-password
      setTimeout(() => {
        navigate(
          `/reset-password?token=${encodeURIComponent(resetToken)}&etablissementId=${encodeURIComponent(finalEtabId)}`
        );
      }, 1500);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Code OTP invalide. Veuillez réessayer.'));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      sanitizeLocalStorage();

      // ⭐ On renvoie un OTP via forgotPassword
      const res = await forgotPassword({ email });
      const data = (res as any)?.data ?? res;
      const newEtabId = data?.etablissementId ?? etablissementId ?? '';
      setEtablissementId(newEtabId);
      localStorage.setItem(RESET_KEYS.ETABLISSEMENT_ID, newEtabId);

      setResendCooldown(60);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erreur lors du renvoi du code.'));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
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
              <span className="text-xs text-gray-400 block -mt-0.5">Vérification</span>
            </div>
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50"
        >
          {!success ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Vérifiez votre email</h2>
                <p className="text-gray-600 mt-1 text-sm">
                  Nous avons envoyé un code de vérification à <strong>{email}</strong>.
                  Saisissez-le ci-dessous pour réinitialiser votre mot de passe.
                </p>
              </div>

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
                  <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                    Code de vérification
                  </label>
                  <div className="flex justify-center gap-3" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`w-14 h-16 text-center text-2xl font-bold border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none bg-gray-50 ${
                          error ? 'border-red-300' : 'border-gray-200'
                        } ${digit ? 'border-blue-500 bg-blue-50' : ''}`}
                        disabled={isSubmitting}
                        autoFocus={index === 0}
                      />
                    ))}
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
                          Vérification en cours...
                        </>
                      ) : (
                        'Vérifier le code'
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </motion.div>
              </form>

              <motion.div variants={itemVariants} className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Vous n'avez pas reçu le code ?{' '}
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className={`text-blue-600 font-semibold transition-colors flex items-center gap-1.5 mx-auto ${
                      resendCooldown > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
                    }`}
                  >
                    <ArrowPathIcon className={`w-4 h-4 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer le code'}
                  </button>
                </p>
              </motion.div>
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Code vérifié !</h3>
              <p className="text-gray-600 mb-6">
                Vous allez être redirigé vers la page de réinitialisation du mot de passe.
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </motion.div>
          )}

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

export default VerifyResetOtpPage;