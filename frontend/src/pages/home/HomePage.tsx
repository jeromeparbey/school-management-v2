import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  PlusIcon,
  MinusIcon,
  StarIcon,
  ChevronDownIcon,
  PhoneIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// ═══════════════════════════════════════════════
// IMAGES
// ═══════════════════════════════════════════════

const IMG = {
  hero: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1400&q=80',
  school:
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
  students:
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
  classroom:
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80',
  testimonial:
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
};

// ═══════════════════════════════════════════════
// NAVIGATION — MENUS DÉROULANTS
// ═══════════════════════════════════════════════

type NavMenu = {
  label: string;
  items: { label: string; desc?: string; to: string }[];
};

const NAV_MENUS: NavMenu[] = [
  {
    label: 'Produit',
    items: [
      { label: 'Fonctionnalités', desc: 'Tous les modules en détail', to: '/features' },
      { label: 'Tarifs', desc: 'Plans et prix', to: '/tarifs' },
      { label: 'Démo', desc: 'Essayer sans compte', to: '/demo' },
      { label: 'Sécurité', desc: 'Chiffrement & conformité', to: '/security' },
    ],
  },
  {
    label: 'Entreprise',
    items: [
      { label: 'À propos', desc: 'Notre mission', to: '/about' },
      { label: 'Clients', desc: 'Écoles qui nous font confiance', to: '/clients' },
      { label: 'Carrières', desc: 'Rejoindre le projet', to: '/careers' },
      { label: 'Contact', desc: 'Parler à un humain', to: '/contact' },
    ],
  },
  {
    label: 'Ressources',
    items: [
      { label: "Centre d'aide", desc: 'Réponses rapides', to: '/help' },
      { label: 'Documentation', desc: 'Guides détaillés', to: '/docs' },
      { label: 'API Développeurs', desc: 'Intégrer EduManage', to: '/api' },
      { label: 'Statut', desc: 'Disponibilité en direct', to: '/status' },
    ],
  },
];

// ═══════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════

const HomePage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer les menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fermer au changement de route
  useEffect(() => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
    setMobileSubmenu(null);
  }, [location.pathname]);

  // Fermer au scroll (uniquement pour le dropdown desktop)
  useEffect(() => {
    if (openMenu) {
      const close = () => setOpenMenu(null);
      window.addEventListener('scroll', close, { once: true });
      return () => window.removeEventListener('scroll', close);
    }
  }, [openMenu]);

  const features = [
    {
      num: '01',
      title: 'Élèves',
      desc: 'Dossiers centralisés, historique complet, alertes automatiques. Chaque élève a sa fiche vivante.',
    },
    {
      num: '02',
      title: 'Enseignants',
      desc: 'Planning, évaluations, communication interne. Vos équipes travaillent ensemble, sans friction.',
    },
    {
      num: '03',
      title: 'Scolarité',
      desc: 'Paiements Mobile Money, reçus automatiques, relances intelligentes. Fini les impayés oubliés.',
    },
    {
      num: '04',
      title: 'Bulletins',
      desc: 'Génération en un clic, moyennes calculées, PDF signés. Vos bulletins en 3 minutes, pas 3 jours.',
    },
    {
      num: '05',
      title: 'Présences',
      desc: 'Pointage rapide, notifications parents en temps réel, rapports mensuels automatiques.',
    },
    {
      num: '06',
      title: 'Sécurité',
      desc: 'Chiffrement AES-256, hébergement souverain, conformité RGPD. Vos données vous appartiennent.',
    },
  ];

  const stats = [
    { value: '250+', label: 'écoles' },
    { value: '50K', label: 'élèves gérés' },
    { value: '99.9%', label: 'disponibilité' },
    { value: '40%', label: 'temps gagné' },
  ];

  const testimonials = [
    {
      quote:
        'On a divisé par trois le temps passé sur la paperasse. Nos secrétaires respirent enfin.',
      name: 'Jean Dupont',
      role: 'Directeur, Lycée International de Lomé',
      initials: 'JD',
    },
    {
      quote:
        "La gestion des paiements Mobile Money a changé notre quotidien. Plus de files d'attente, plus d'erreurs.",
      name: 'Marie Martin',
      role: 'Secrétaire Générale, Collège Saint-Joseph',
      initials: 'MM',
    },
    {
      quote:
        "Un outil pensé pour l'Afrique, pas adapté après coup. Ça se sent dans chaque détail.",
      name: 'Sophie Dubois',
      role: 'Directrice, Institut Sainte-Marie',
      initials: 'SD',
    },
  ];

  const faqs = [
    {
      q: 'Combien de temps pour démarrer ?',
      a: 'Moins de 48h. Nous importons vos données existantes (Excel, papier, autre logiciel) et formons votre équipe gratuitement.',
    },
    {
      q: 'Fonctionne-t-il avec Mobile Money ?',
      a: 'Oui. Intégration native avec Flooz, T-Money, MTN MoMo et Orange Money. Les paiements sont reçus directement sur votre compte école.',
    },
    {
      q: 'Mes données sont-elles en sécurité ?',
      a: 'Chiffrement AES-256, hébergement au Togo et en Europe, sauvegardes quotidiennes. Conformité RGPD et ISO 27001.',
    },
    {
      q: 'Y a-t-il un engagement ?',
      a: 'Aucun. Essai gratuit 30 jours, sans carte bancaire. Vous pouvez annuler en un clic à tout moment.',
    },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#F7F4EB] text-[#0A0A0A] overflow-x-hidden antialiased"
    >
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#10B981] z-50 origin-left"
        style={{ scaleX }}
      />

  

      {/* ============ NAVBAR ============ */}
      <motion.nav
        ref={navRef}
        className={`sticky top-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F7F4EB]/90 backdrop-blur-md border-b border-black/5 py-3'
            : 'bg-[#F7F4EB] py-4'
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-[#0A0A0A] rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-6">
                <span className="text-[#F7F4EB] font-black text-lg leading-none">E</span>
              </div>
              <div className="leading-none">
                <span className="text-[15px] font-bold tracking-tight block">EduManage</span>
                <span className="text-[10px] text-[#10B981] font-mono tracking-[0.2em] font-semibold">
                  PRO
                </span>
              </div>
            </Link>

            {/* Menus desktop */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_MENUS.map((menu) => {
                const isOpen = openMenu === menu.label;
                return (
                  <div key={menu.label} className="relative">
                    <button
                      onClick={() => setOpenMenu(isOpen ? null : menu.label)}
                      onMouseEnter={() => setOpenMenu(menu.label)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium transition-colors rounded-lg ${
                        isOpen
                          ? 'text-[#0A0A0A] bg-black/5'
                          : 'text-black/65 hover:text-black'
                      }`}
                    >
                      {menu.label}
                      <ChevronDownIcon
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                          onMouseLeave={() => setOpenMenu(null)}
                          className="absolute top-full left-0 mt-2 w-[300px] bg-white rounded-xl border border-black/[0.07] shadow-[0_20px_60px_-20px_rgba(10,10,10,0.25)] overflow-hidden"
                        >
                          <div className="p-2">
                            {menu.items.map((item) => (
                              <Link
                                key={item.label}
                                to={item.to}
                                className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F7F4EB] transition-colors group"
                              >
                                <div className="w-1 h-1 rounded-full bg-[#10B981] mt-2 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                                <div className="min-w-0">
                                  <p className="text-[13px] font-semibold text-[#0A0A0A] group-hover:text-[#10B981] transition-colors">
                                    {item.label}
                                  </p>
                                  {item.desc && (
                                    <p className="text-[11.5px] text-black/50 leading-snug mt-0.5">
                                      {item.desc}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden sm:inline-flex text-[13px] font-medium text-black/60 hover:text-black transition-colors px-3 py-2"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 bg-[#0A0A0A] text-[#F7F4EB] text-[13px] font-semibold px-5 py-2.5 rounded-full hover:bg-[#10B981] transition-all duration-300"
              >
                Démarrer
                <ArrowUpRightIcon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              {/* Burger mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-full border border-black/10 flex items-center justify-center ml-1"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-5 h-5" />
                ) : (
                  <Bars3Icon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ============ MENU MOBILE ============ */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden bg-[#F7F4EB] border-t border-black/5"
            >
              <div className="px-6 py-5 space-y-1">
                {NAV_MENUS.map((menu) => {
                  const isOpen = mobileSubmenu === menu.label;
                  return (
                    <div key={menu.label}>
                      <button
                        onClick={() =>
                          setMobileSubmenu(isOpen ? null : menu.label)
                        }
                        className="w-full flex items-center justify-between py-3 text-[14px] font-semibold text-[#0A0A0A]"
                      >
                        {menu.label}
                        <ChevronDownIcon
                          className={`w-4 h-4 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-3 pb-2 space-y-1 border-l border-black/10 ml-1">
                              {menu.items.map((item) => (
                                <Link
                                  key={item.label}
                                  to={item.to}
                                  className="block py-2 pl-3 text-[13px] text-black/60 hover:text-[#10B981] transition-colors"
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                <div className="pt-4 border-t border-black/10 space-y-2">
                  <Link
                    to="/login"
                    className="block py-2.5 text-[13.5px] font-medium text-black/70"
                  >
                    Connexion
                  </Link>
                  <a
                    href="tel:+22892438582"
                    className="flex items-center gap-2 py-2 text-[13px] text-black/60"
                  >
                    <PhoneIcon className="w-4 h-4 text-[#10B981]" />
                    +228 92 43 85 82
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ============ HERO ============ */}
      <section className="relative pt-20 lg:pt-28 pb-20 lg:pb-28 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #0A0A0A 1px, transparent 1px), linear-gradient(to bottom, #0A0A0A 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at top, black 40%, transparent 80%)',
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3 mb-7">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-black/50">
                  Gestion scolaire · Afrique de l'Ouest
                </span>
              </div>

              <h1 className="text-[clamp(2.5rem,6.5vw,5.5rem)] font-black leading-[0.95] tracking-[-0.04em]">
                L'école,
                <br />
                <span className="text-[#10B981]">réinventée</span>
                <br />
                pour l'Afrique.
              </h1>

              <p className="mt-7 text-[16px] lg:text-[17px] text-black/60 max-w-lg leading-relaxed">
                EduManage Pro remplace vos fichiers Excel, vos cahiers de présence et vos relances
                manuelles par une plateforme unique, rapide et pensée pour le terrain.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-3 bg-[#10B981] text-white text-[14.5px] font-semibold px-7 py-4 rounded-full hover:bg-[#0A0A0A] transition-all duration-300"
                >
                  Essayer gratuitement
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </span>
                </Link>
                <Link
                  to="/demo"
                  className="inline-flex items-center gap-2 text-[14.5px] font-semibold text-black/80 hover:text-[#10B981] transition-colors px-4 py-4"
                >
                  Voir la démo
                  <ArrowUpRightIcon className="w-4 h-4" />
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12.5px] text-black/50">
                {['30 jours gratuits', 'Sans carte bancaire', 'Support 24/7'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckIcon className="w-4 h-4 text-[#10B981]" />
                    {t}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="lg:col-span-5 relative"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-[0_30px_80px_-30px_rgba(10,10,10,0.4)]">
                <img
                  src={IMG.hero}
                  alt="Élèves en classe en Afrique de l'Ouest"
                  className="w-full h-[420px] lg:h-[520px] object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-[#F7F4EB]/95 backdrop-blur-md rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-black/40">
                      En direct · Lomé
                    </p>
                    <p className="text-[13px] font-bold text-[#0A0A0A] mt-0.5">
                      1 284 élèves connectés
                    </p>
                  </div>
                  <div className="flex -space-x-2">
                    {['JD', 'MM', 'SD', 'AK'].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-[#0A0A0A] border-2 border-[#F7F4EB] flex items-center justify-center text-[#F7F4EB] text-[10px] font-bold"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="hidden lg:flex absolute -right-4 top-6 bg-[#0A0A0A] text-[#F7F4EB] rounded-2xl px-4 py-3 shadow-xl items-center gap-3"
              >
                <StarIcon className="w-4 h-4 text-[#10B981]" />
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.1em] text-white/40">
                    Satisfaction
                  </p>
                  <p className="text-[14px] font-bold leading-none mt-0.5">98%</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ BANDEAU PARTENAIRES ============ */}
      <section className="py-7 border-y border-black/5 bg-white/50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[11.5px] font-mono uppercase tracking-[0.15em] text-black/40">
            <span className="text-black/70">Ils nous font confiance :</span>
            {[
              'UNESCO',
              'Ministère Éducation',
              'Google for Education',
              'Microsoft Education',
              'AUF',
            ].map((p) => (
              <span key={p} className="hover:text-[#10B981] transition-colors cursor-default">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 mb-14">
            <div className="lg:col-span-6">
              <span className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-[#10B981]">
                — 01 / Produit
              </span>
              <h2 className="text-[clamp(2rem,4vw,3.4rem)] font-black leading-[1.05] tracking-[-0.03em] mt-4">
                Six modules.
                <br />
                Une seule école.
              </h2>
            </div>
            <div className="lg:col-span-5 lg:col-start-8 flex items-end">
              <p className="text-black/60 text-[15px] leading-relaxed">
                Pas de features inutiles. Chaque module résout un problème réel que nous avons vu
                dans les écoles de Lomé, Cotonou et Accra.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/10 border border-black/10 rounded-2xl overflow-hidden">
            {features.slice(0, 3).map((f, i) => (
              <motion.div
                key={f.num}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="group bg-[#F7F4EB] p-8 lg:p-9 hover:bg-white transition-colors duration-300 relative"
              >
                <div className="flex items-start justify-between mb-7">
                  <span className="text-[11px] font-mono text-black/30 tracking-wider">
                    {f.num}
                  </span>
                  <ArrowUpRightIcon className="w-5 h-5 text-black/20 group-hover:text-[#10B981] group-hover:rotate-45 transition-all duration-300" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2.5 group-hover:text-[#10B981] transition-colors">
                  {f.title}
                </h3>
                <p className="text-[13.5px] text-black/60 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}

            <div className="md:col-span-2 lg:col-span-3 grid lg:grid-cols-2 gap-px bg-black/10">
              <div className="relative overflow-hidden bg-[#F7F4EB]">
                <img
                  src={IMG.students}
                  alt="Élèves concentrés en classe"
                  className="w-full h-[280px] lg:h-[320px] object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 bg-[#0A0A0A]/80 backdrop-blur-sm text-[#F7F4EB] text-[10.5px] font-mono uppercase tracking-[0.15em] px-2.5 py-1 rounded-full">
                  École primaire · Lomé
                </div>
              </div>
              <div className="bg-[#0A0A0A] text-[#F7F4EB] p-8 lg:p-10 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#10B981]">
                    — Focus terrain
                  </span>
                  <h3 className="text-[clamp(1.4rem,2.2vw,2rem)] font-black leading-[1.1] tracking-[-0.03em] mt-3">
                    Testé dans les
                    <br />
                    <span className="text-[#10B981]">vraies écoles.</span>
                  </h3>
                  <p className="mt-4 text-white/50 text-[13.5px] leading-relaxed max-w-sm">
                    Chaque fonctionnalité a été validée par des directeurs, secrétaires et
                    enseignants sur le terrain. Pas dans un bureau.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-3">
                  {stats.slice(0, 3).map((s) => (
                    <div key={s.label}>
                      <p className="text-xl font-black tracking-tight">{s.value}</p>
                      <p className="text-[9.5px] font-mono uppercase tracking-[0.15em] text-white/40 mt-0.5">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {features.slice(3, 6).map((f, i) => (
              <motion.div
                key={f.num}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="group bg-[#F7F4EB] p-8 lg:p-9 hover:bg-white transition-colors duration-300 relative"
              >
                <div className="flex items-start justify-between mb-7">
                  <span className="text-[11px] font-mono text-black/30 tracking-wider">
                    {f.num}
                  </span>
                  <ArrowUpRightIcon className="w-5 h-5 text-black/20 group-hover:text-[#10B981] group-hover:rotate-45 transition-all duration-300" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2.5 group-hover:text-[#10B981] transition-colors">
                  {f.title}
                </h3>
                <p className="text-[13.5px] text-black/60 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-24 lg:py-28 bg-[#0A0A0A] text-[#F7F4EB] rounded-[2rem] mx-4 lg:mx-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10B981] rounded-full opacity-10 blur-[120px]" />
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <span className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-[#10B981]">
                — 02 / Process
              </span>
              <h2 className="text-[clamp(2rem,4vw,3.4rem)] font-black leading-[1.05] tracking-[-0.03em] mt-4">
                Opérationnel
                <br />
                en 48h.
              </h2>
              <p className="mt-6 text-white/50 text-[14.5px] leading-relaxed max-w-sm">
                Pas de projet sur 6 mois. Pas de consultant. Vous importez, on forme, vous
                démarrez.
              </p>

              <div className="mt-8 rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={IMG.classroom}
                  alt="Salle de classe moderne"
                  className="w-full h-[220px] object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 space-y-8">
              {[
                {
                  step: '01',
                  title: 'Import de vos données',
                  desc: 'Excel, papier, autre logiciel — notre équipe migre tout gratuitement en 24h.',
                },
                {
                  step: '02',
                  title: 'Formation de votre équipe',
                  desc: '2 sessions live (1h chacune) pour secrétaires, enseignants et direction. En français.',
                },
                {
                  step: '03',
                  title: 'Vous êtes opérationnels',
                  desc: 'Premier paiement encaissé, premier bulletin généré. Le reste suit naturellement.',
                },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="flex gap-6 lg:gap-8 border-t border-white/10 pt-7 first:border-0 first:pt-0"
                >
                  <span className="text-[12.5px] font-mono text-[#10B981] pt-1 shrink-0">
                    {s.step}
                  </span>
                  <div>
                    <h3 className="text-[19px] font-bold mb-2">{s.title}</h3>
                    <p className="text-white/50 text-[13.5px] leading-relaxed max-w-md">
                      {s.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 items-end mb-14">
            <div className="lg:col-span-6">
              <span className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-[#10B981]">
                — 03 / Clients
              </span>
              <h2 className="text-[clamp(2rem,4vw,3.4rem)] font-black leading-[1.05] tracking-[-0.03em] mt-4">
                Ils gèrent
                <br />
                avec nous.
              </h2>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <p className="text-black/50 text-[14px] leading-relaxed">
                Des établissements de Lomé à Abidjan, du primaire au lycée.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.slice(0, 3).map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-black/5 rounded-2xl p-7 hover:border-[#10B981]/30 transition-colors duration-300 flex flex-col"
              >
                <div className="text-[#10B981] text-[34px] font-black leading-none mb-5">"</div>
                <p className="text-[14px] text-black/70 leading-relaxed mb-6 flex-1">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 pt-5 border-t border-black/5">
                  <div className="w-9 h-9 rounded-full bg-[#0A0A0A] text-[#F7F4EB] flex items-center justify-center text-[11px] font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[12.5px] font-bold">{t.name}</p>
                    <p className="text-[10.5px] text-black/50">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative rounded-2xl overflow-hidden group"
            >
              <img
                src={IMG.school}
                alt="Bâtiment scolaire en Afrique"
                className="w-full h-full min-h-[240px] object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/60">
                  Client depuis 2022
                </p>
                <p className="text-[13px] font-bold text-white mt-1">
                  Institut Sainte-Marie
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <span className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-[#10B981]">
                — 04 / FAQ
              </span>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[1.05] tracking-[-0.03em] mt-4">
                Questions
                <br />
                fréquentes.
              </h2>
            </div>

            <div className="lg:col-span-7 lg:col-start-6">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-black/10">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between text-left py-6 group"
                  >
                    <span className="text-[15.5px] font-semibold pr-4 group-hover:text-[#10B981] transition-colors">
                      {faq.q}
                    </span>
                    <span className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#10B981] transition-colors">
                      {openFaq === i ? (
                        <MinusIcon className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <PlusIcon className="w-4 h-4 text-black/40" />
                      )}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 text-[14px] text-black/60 leading-relaxed max-w-xl">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="py-24 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="relative bg-[#10B981] rounded-[2rem] overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}
            />
            <div className="relative grid lg:grid-cols-12 gap-8 items-center p-10 lg:p-16">
              <div className="lg:col-span-7">
                <h2 className="text-[clamp(2rem,4.5vw,3.8rem)] font-black leading-[0.95] tracking-[-0.04em] text-white">
                  Prêt à simplifier
                  <br />
                  votre école ?
                </h2>
                <p className="mt-5 text-white/80 text-[15px] max-w-lg leading-relaxed">
                  30 jours gratuits. Sans carte bancaire. Sans engagement. Rejoignez 250+
                  établissements qui ont déjà fait le saut.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-3 bg-[#0A0A0A] text-white text-[14.5px] font-semibold px-7 py-4 rounded-full hover:bg-white hover:text-[#0A0A0A] transition-all duration-300"
                  >
                    Démarrer maintenant
                    <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="tel:+22892438582"
                    className="inline-flex items-center gap-2 text-white text-[14.5px] font-semibold px-4 py-4 hover:text-[#0A0A0A] transition-colors"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    +228 92 43 85 82
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 hidden lg:block">
                <div className="rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
                  <img
                    src={IMG.testimonial}
                    alt="Directeur d'école souriant"
                    className="w-full h-[280px] object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-black/10 bg-[#F7F4EB]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-[#0A0A0A] rounded-lg flex items-center justify-center">
                  <span className="text-[#F7F4EB] font-black text-lg leading-none">E</span>
                </div>
                <div className="leading-none">
                  <span className="text-[15px] font-bold tracking-tight block">EduManage</span>
                  <span className="text-[10px] text-[#10B981] font-mono tracking-[0.2em] font-semibold">
                    PRO
                  </span>
                </div>
              </Link>
              <p className="text-[13px] text-black/50 max-w-sm leading-relaxed">
                La plateforme de gestion scolaire pensée pour l'Afrique de l'Ouest. Conçue à Lomé,
                utilisée partout.
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                {['🇹🇬 Togo', "🇨🇮 Côte d'Ivoire", '🇧🇯 Bénin', '🇬🇭 Ghana', '🇸🇳 Sénégal'].map(
                  (c) => (
                    <span
                      key={c}
                      className="text-[11px] bg-black/5 text-black/60 px-2.5 py-1 rounded-full"
                    >
                      {c}
                    </span>
                  ),
                )}
              </div>
              <a
                href="tel:+22892438582"
                className="inline-flex items-center gap-2 mt-6 text-[13px] text-black/60 hover:text-[#10B981] transition-colors"
              >
                <PhoneIcon className="w-4 h-4 text-[#10B981]" />
                +228 92 43 85 82
              </a>
            </div>

            {[
              {
                title: 'Produit',
                items: ['Fonctionnalités', 'Tarifs', 'Démo', 'Sécurité'],
              },
              {
                title: 'Entreprise',
                items: ['À propos', 'Clients', 'Carrières', 'Contact'],
              },
              {
                title: 'Ressources',
                items: ["Centre d'aide", 'Documentation', 'API', 'Statut'],
              },
            ].map((col) => (
              <div key={col.title} className="lg:col-span-2">
                <h4 className="text-[11.5px] font-mono uppercase tracking-[0.15em] text-black/40 mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item}>
                      <Link
                        to={`/${item.toLowerCase().replace(/\s/g, '-')}`}
                        className="text-[13px] text-black/60 hover:text-[#10B981] transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between gap-4 text-[11.5px] text-black/40">
            <p>© {new Date().getFullYear()} EduManage Pro — Lomé, Togo 🇹🇬</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {['Confidentialité', 'Conditions', 'Cookies', 'Mentions légales'].map((l) => (
                <Link
                  key={l}
                  to={`/${l.toLowerCase()}`}
                  className="hover:text-[#10B981] transition-colors"
                >
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;