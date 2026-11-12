// frontend/src/pages/auth/RegisterPage.tsx
// → Rôle : page de bienvenue (accès via "Essayer gratuitement")

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ClockIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Si déjà connecté → dashboard
  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const reassurances = [
    {
      icon: ClockIcon,
      title: 'Prêt en 48h',
      desc: 'Import de vos données inclus',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Aucun engagement',
      desc: 'Annulable à tout moment',
    },
    {
      icon: UsersIcon,
      title: '250+ écoles',
      desc: 'Nous font déjà confiance',
    },
    {
      icon: ChartBarIcon,
      title: '40% de temps gagné',
      desc: 'Sur les tâches administratives',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F2EA] text-[#0A0A0A] antialiased relative flex items-center justify-center p-4 sm:p-6">
      {/* Fond : grille discrète centrée */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #0A0A0A 1px, transparent 1px), linear-gradient(to bottom, #0A0A0A 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      {/* Carte centrale compacte */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[520px]"
      >
        {/* Logo au-dessus */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 bg-[#0A0A0A] rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-6">
              <span className="text-[#F5F2EA] font-black text-xl leading-none">
                E
              </span>
            </div>
            <div className="leading-none text-left">
              <span className="text-[17px] font-bold tracking-tight block text-[#0A0A0A]">
                EduManage
              </span>
              <span className="text-[10px] text-[#F59E0B] font-mono tracking-[0.25em] font-semibold">
                PRO
              </span>
            </div>
          </Link>
        </div>

        {/* Carte principale */}
        <div className="bg-[#FCFBF7] rounded-2xl border border-black/[0.08] shadow-[0_24px_60px_-24px_rgba(10,10,10,0.18),0_2px_8px_-2px_rgba(10,10,10,0.06)] p-8 sm:p-10">
          {/* Tag + Titre */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/10 rounded-full mb-5">
              <SparklesIcon className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-[#10B981] font-semibold">
                Bienvenue
              </span>
            </div>

            <h1 className="text-[clamp(1.75rem,3vw,2.15rem)] font-black leading-[1.1] tracking-[-0.03em] text-[#0A0A0A]">
              Vous avez fait
              <br />
              <span className="text-[#10B981]">le meilleur choix.</span>
            </h1>

            <p className="mt-4 text-[14px] text-black/60 leading-relaxed max-w-sm mx-auto">
              Bienvenue dans <span className="font-semibold text-[#0A0A0A]">EduManage Pro</span> — la
              plateforme de gestion scolaire pensée pour l'Afrique de l'Ouest.
            </p>
          </div>

          {/* Message principal */}
          <div className="bg-white border border-black/[0.06] rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircleIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[13.5px] font-bold text-[#0A0A0A] leading-snug">
                  Vous n'avez rien à perdre.
                </p>
                <p className="text-[12.5px] text-black/55 leading-relaxed mt-1">
                  Essai gratuit 30 jours, sans carte bancaire, sans engagement.
                  Connectez-vous pour accéder à votre espace.
                </p>
              </div>
            </div>
          </div>

          {/* 4 réassurances */}
          <div className="grid grid-cols-2 gap-2 mb-8">
            {reassurances.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-2 p-2.5 rounded-lg border border-black/[0.05] bg-[#F5F2EA]/30"
              >
                <item.icon className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11.5px] font-semibold text-[#0A0A0A] leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[10.5px] text-black/50 leading-tight mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA principal — SE CONNECTER */}
          <Link
            to="/login"
            className="group w-full inline-flex items-center justify-center gap-2 bg-[#0A0A0A] text-[#F5F2EA] text-[14px] font-semibold py-4 rounded-full hover:bg-[#10B981] transition-all duration-300"
          >
            Se connecter à mon espace
            <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {/* Lien secondaire — contact */}
          <div className="mt-5 pt-5 border-t border-black/[0.06] text-center">
            <p className="text-[12px] text-black/50">
              Pas encore de compte ?{' '}
              <a
                href="tel:+22892438582"
                className="font-semibold text-[#0A0A0A] hover:text-[#10B981] transition-colors inline-flex items-center gap-0.5 group"
              >
                Contactez-nous
                <ArrowUpRightIcon className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </p>
            <p className="mt-2 text-[11px] font-mono uppercase tracking-[0.12em] text-black/35">
              +228 92 43 85 82
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

      {/* Lien retour discret */}
      <Link
        to="/"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 text-[12px] font-medium text-black/40 hover:text-[#10B981] transition-colors z-20"
      >
        ← Accueil
      </Link>
    </div>
  );
};

export default RegisterPage;