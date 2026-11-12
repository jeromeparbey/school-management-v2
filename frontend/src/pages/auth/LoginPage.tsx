// frontend2/src/pages/auth/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/AuthContext';

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
      if (rememberMe) localStorage.setItem('rememberMe', 'true');
      else localStorage.removeItem('rememberMe');
    } catch {
      /* erreur gérée par le context */
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 antialiased bg-[#EDEAE0] text-[#0A0A0A]">
      {/* Fond : dégradé chaud + grille subtile */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, #F7F4EB 0%, #EDEAE0 55%, #E4E0D3 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #0A0A0A 1px, transparent 1px), linear-gradient(to bottom, #0A0A0A 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage:
            'radial-gradient(ellipse at center, black 20%, transparent 65%)',
        }}
      />

      {/* Lien retour discret */}
      <Link
        to="/"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 text-[12px] font-medium text-black/45 hover:text-[#10B981] transition-colors z-20"
      >
        ← Accueil
      </Link>

      {/* Carte principale — centrée, compacte */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Logo hors carte, centré au-dessus */}
        <div className="flex flex-col items-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-3 group"
          >
            <div className="w-11 h-11 bg-[#0A0A0A] rounded-xl flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(10,10,10,0.4)] transition-transform duration-300 group-hover:rotate-6">
              <span className="text-[#FAF9F6] font-black text-xl leading-none">
                E
              </span>
            </div>
            <div className="leading-none text-left">
              <span className="text-[17px] font-bold tracking-tight block text-[#0A0A0A]">
                EduManage
              </span>
              <span className="text-[10px] text-[#10B981] font-mono tracking-[0.25em] font-semibold">
                PRO
              </span>
            </div>
          </Link>
        </div>

        {/* Carte formulaire */}
        <div className="bg-[#FCFBF7] rounded-2xl border border-black/[0.07] shadow-[0_24px_60px_-24px_rgba(10,10,10,0.18),0_2px_8px_-2px_rgba(10,10,10,0.06)] p-8 sm:p-10">
          {/* En-tête */}
          <div className="mb-8">
            <span className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-[#10B981]">
              — Connexion
            </span>
            <h1 className="text-[1.75rem] font-black leading-[1.1] tracking-[-0.035em] mt-2.5 text-[#0A0A0A]">
              Bon retour.
            </h1>
            <p className="text-[13px] text-black/50 mt-1.5 leading-relaxed">
              Entrez vos identifiants pour accéder à votre espace.
            </p>
          </div>

          {/* Erreur */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 18 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-red-50/80 border border-red-200/70 rounded-lg flex items-start gap-2">
                  <ExclamationCircleIcon className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-bold text-red-800">
                      Échec de la connexion
                    </p>
                    <p className="text-[11.5px] text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-black/55 mb-1.5"
              >
                Email
              </label>
              <div className="relative group">
                <EnvelopeIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 pointer-events-none transition-colors group-focus-within:text-[#10B981]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-7 pr-2 py-2.5 bg-transparent border-0 border-b border-black/15 focus:border-[#10B981] text-[14px] outline-none transition-colors placeholder:text-black/25"
                  placeholder="vous@ecole.tg"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-black/55"
                >
                  Mot de passe
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-medium text-[#10B981] hover:text-[#0A0A0A] transition-colors"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative group">
                <LockClosedIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 pointer-events-none transition-colors group-focus-within:text-[#10B981]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-7 pr-9 py-2.5 bg-transparent border-0 border-b border-black/15 focus:border-[#10B981] text-[14px] outline-none transition-colors placeholder:text-black/25"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-black/30 hover:text-[#10B981] transition-colors"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2.5 text-[12.5px] text-black/55 cursor-pointer select-none pt-0.5">
              <span className="relative inline-flex items-center justify-center w-4 h-4 shrink-0">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="w-4 h-4 border border-black/25 rounded-[4px] peer-checked:bg-[#10B981] peer-checked:border-[#10B981] transition-colors flex items-center justify-center">
                  <CheckIcon
                    className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100"
                    strokeWidth={3}
                  />
                </span>
              </span>
              Se souvenir de moi
            </label>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full mt-2 py-3.5 bg-[#0A0A0A] text-[#FAF9F6] text-[13.5px] font-semibold rounded-full hover:bg-[#10B981] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5"
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
                  Connexion…
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </form>

          {/* Inscription */}
          <div className="mt-8 pt-6 border-t border-black/[0.06]">
            <p className="text-[12.5px] text-black/50 text-center">
              Pas encore de compte ?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#0A0A0A] hover:text-[#10B981] transition-colors"
              >
                Essayer gratuitement
              </Link>
            </p>
          </div>
        </div>

        {/* Footer trust hors carte */}
        <div className="mt-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10.5px] font-mono uppercase tracking-[0.12em] text-black/35">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#10B981]" />
              SSL
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#10B981]" />
              RGPD
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#10B981]" />
              Support 24/7
            </span>
          </div>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.15em] text-black/30">
            © {new Date().getFullYear()} EduManage Pro · Lomé
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;