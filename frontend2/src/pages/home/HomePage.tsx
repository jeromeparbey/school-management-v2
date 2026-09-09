import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChevronRightIcon,
  SparklesIcon,
  TrophyIcon,
  BuildingLibraryIcon,
  UsersIcon,
 
  RocketLaunchIcon,
  ArrowTrendingUpIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const HomePage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.98]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 50]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: UserGroupIcon,
      title: 'Gestion des élèves',
      description: 'Suivi personnalisé de chaque élève avec tableau de bord intelligent et alertes en temps réel.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      delay: 0.1,
    },
    {
      icon: AcademicCapIcon,
      title: 'Gestion des enseignants',
      description: 'Plateforme collaborative pour enseignants avec planification automatique et évaluations.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      delay: 0.2,
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Paiements & Scolarité',
      description: 'Système de paiement sécurisé avec facturation automatique et suivi des échéances.',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      delay: 0.3,
    },
    {
      icon: CalendarIcon,
      title: 'Emploi du temps',
      description: 'Planning intelligent avec synchronisation multi-plateformes et notifications.',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      delay: 0.4,
    },
    {
      icon: DocumentTextIcon,
      title: 'Bulletins scolaires',
      description: 'Génération automatique de bulletins personnalisés avec analyses de performance.',
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50',
      delay: 0.5,
    },
    {
      icon: ClockIcon,
      title: 'Présence & Pointage',
      description: 'Système de suivi des présences avec reconnaissance faciale et rapports détaillés.',
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      delay: 0.6,
    },
    {
      icon: ShieldCheckIcon,
      title: 'Sécurité & Conformité',
      description: 'Protection des données avec chiffrement avancé et conformité RGPD certifiée.',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      delay: 0.7,
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile Responsive',
      description: 'Application mobile native avec synchronisation en temps réel et push notifications.',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      delay: 0.8,
    },
  ];

  const stats = [
    { label: 'Écoles actives', value: '250+', icon: BuildingLibraryIcon, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Élèves gérés', value: '50K+', icon: UsersIcon, gradient: 'from-purple-500 to-pink-500' },
    { label: 'Transactions', value: '150K+', icon: CloudArrowUpIcon, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Satisfaction', value: '98%', icon: ChartBarIcon, gradient: 'from-orange-500 to-amber-500' },
  ];

  const testimonials = [
    {
      name: 'Jean Dupont',
      role: 'Directeur, Lycée International de Paris',
      content: 'Cette solution a révolutionné la gestion de notre établissement. Nous avons gagné 40% de temps administratif et nos équipes sont plus sereines.',
      rating: 5,
      image: 'https://ui-avatars.com/api/?name=Jean+Dupont&background=2563eb&color=fff&size=80&font-size=0.5',
    },
    {
      name: 'Marie Martin',
      role: 'Secrétaire Générale, Collège Saint-Joseph',
      content: 'L\'interface est remarquablement intuitive. La gestion des paiements et des bulletins est devenue un jeu d\'enfant !',
      rating: 5,
      image: 'https://ui-avatars.com/api/?name=Marie+Martin&background=7c3aed&color=fff&size=80&font-size=0.5',
    },
    {
      name: 'Pierre Leblanc',
      role: 'Enseignant, École Primaire des Lilas',
      content: 'Le suivi des présences et des évaluations est un véritable gain de temps. Je peux me concentrer sur l\'essentiel : enseigner.',
      rating: 5,
      image: 'https://ui-avatars.com/api/?name=Pierre+Leblanc&background=059669&color=fff&size=80&font-size=0.5',
    },
    {
      name: 'Sophie Dubois',
      role: 'Directrice, Institut Sainte-Marie',
      content: 'Un outil exceptionnel qui a modernisé notre établissement. La communication avec les parents n\'a jamais été aussi fluide.',
      rating: 5,
      image: 'https://ui-avatars.com/api/?name=Sophie+Dubois&background=dc2626&color=fff&size=80&font-size=0.5',
    },
  ];

  const partners = [
    { name: 'UNESCO', icon: '🏛️' },
    { name: 'Ministère Éducation', icon: '📚' },
    { name: 'Google for Education', icon: '🎯' },
    { name: 'Microsoft Education', icon: '💻' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-white overflow-x-hidden">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-50"
        style={{ scaleX, transformOrigin: '0% 0%' }}
      />

      {/* ============ NAVBAR ============ */}
      <motion.nav
        className={`fixed top-0 w-full z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-2xl py-3 border-b border-gray-100'
            : 'bg-transparent py-5'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                className="w-11 h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300"
                whileHover={{ rotate: 10, scale: 1.05 }}
              >
                <span className="text-white font-bold text-2xl">E</span>
              </motion.div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  EduManage
                </span>
                <span className="text-xs text-gray-400 block -mt-0.5">Pro</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-10">
              {['Fonctionnalités', 'Tarifs', 'À propos', 'Contact'].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/${item.toLowerCase().replace(' ', '')}`}
                    className="text-gray-600 hover:text-blue-600 transition-all duration-300 text-sm font-medium relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/login">
                <motion.button
                  className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Connexion
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Essayer gratuitement
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ============ HERO SECTION ============ */}
      <motion.section
        className="relative overflow-hidden min-h-screen flex items-center pt-20"
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        {/* Background avec particles */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-900">
          {/* Grille animée */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M50 40v-8h-8v8h-8v8h8v8h8v-8h8v-8h-8zM20 40v-8h-8v8H4v8h8v8h8v-8h8v-8h-8zm0-20v-8h-8v8H4v8h8v8h8v-8h8v-8h-8zm0-20V0h-8v8H4v8h8v8h8V8h8V0h-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          {/* Orbes animés */}
          <motion.div
            className="absolute top-20 right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.25, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
          />

          {/* Étoiles flottantes */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="text-white"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
                  <SparklesIcon className="w-4 h-4 mr-2 animate-pulse" />
                  🚀 Gestion Scolaire 4.0
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mt-6"
              >
                Gérez votre
                <span className="block bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  établissement
                </span>
                <span className="text-white">en toute simplicité</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-blue-100 mb-10 max-w-2xl leading-relaxed"
              >
                Une solution tout-en-un pour gérer élèves, enseignants, paiements, 
                bulletins et plus encore. La plateforme qui fait gagner du temps à toute votre équipe.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-5"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/register">
                    <button className="px-10 py-4.5 bg-white text-blue-700 font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-3 text-lg group">
                      Commencer maintenant
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRightIcon className="w-5 h-5" />
                      </motion.div>
                    </button>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/demo">
                    <button className="px-10 py-4.5 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm flex items-center gap-3 text-lg">
                      Voir la démo
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 flex flex-wrap items-center gap-8"
              >
                {[
                  { text: 'Gratuit 30 jours', icon: CheckCircleIcon },
                  { text: 'Sans engagement', icon: CheckCircleIcon },
                  { text: 'Support 24/7', icon: CheckCircleIcon },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-blue-100"
                  >
                    <item.icon className="w-5 h-5 text-blue-300" />
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right content - Dashboard preview */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
              className="hidden lg:block"
            >
              <motion.div
                className="relative"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="absolute -inset-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-30 animate-pulse" />
                <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                    {/* Dashboard header */}
                    <div className="bg-gray-50 p-5 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-200" />
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-400" />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>👋 Bonjour, Admin</span>
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            A
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dashboard content */}
                    <div className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-800">Tableau de bord</h3>
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                          Dernières 24h
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'Élèves', value: '1,284', color: 'blue', trend: '+12%' },
                          { label: 'Enseignants', value: '48', color: 'purple', trend: '+3%' },
                          { label: 'Paiements', value: '€12.5K', color: 'emerald', trend: '+8%' },
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            className={`bg-${item.color}-50 p-5 rounded-xl border border-${item.color}-100`}
                            whileHover={{ scale: 1.03, y: -2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className={`text-sm text-${item.color}-600 font-medium`}>{item.label}</p>
                            <p className={`text-2xl font-bold text-${item.color}-700 mt-1`}>{item.value}</p>
                            <p className={`text-xs text-${item.color}-500 mt-1 flex items-center gap-1`}>
                              <ArrowTrendingUpIcon className="w-3 h-3" />
                              {item.trend}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      <motion.div
                        className="bg-gradient-to-r from-blue-50 to-purple-50 h-32 rounded-xl flex items-center justify-center p-6 border border-blue-100"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-6 w-full">
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 font-medium">Performance globale</p>
                            <div className="mt-3 flex items-end gap-1 h-12">
                              {[65, 78, 82, 70, 92, 85, 88, 76, 95, 82].map((h, i) => (
                                <motion.div
                                  key={i}
                                  className={`w-6 ${h > 80 ? 'bg-blue-500' : 'bg-blue-300'} rounded-t`}
                                  style={{ height: `${h * 0.6}px` }}
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h * 0.6}px` }}
                                  transition={{ delay: i * 0.1, duration: 0.5 }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">92%</p>
                            <p className="text-xs text-gray-500">Taux de réussite</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Floating badges */}
                  <motion.div
                    className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-2xl p-5"
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                        <TrophyIcon className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">250+ écoles</p>
                        <p className="text-sm text-gray-500">nous font confiance</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-2xl p-4"
                    animate={{
                      x: [0, -3, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <RocketLaunchIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">+40%</p>
                        <p className="text-xs text-gray-500">de productivité</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ============ PARTNERS SECTION ============ */}
      <motion.section
        className="py-12 bg-gray-50 border-t border-gray-100"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">
              Ils nous font confiance
            </p>
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 text-gray-400"
                whileHover={{ scale: 1.05, color: '#2563eb' }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-2xl">{partner.icon}</span>
                <span className="text-sm font-medium">{partner.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ============ STATS SECTION ============ */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative text-center bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100/50">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg mb-5`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <motion.p
                    className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
                    initial={{ scale: 0.5 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: index * 0.15 + 0.2, type: "spring" }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm text-gray-600 mt-2 font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full filter blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-50 rounded-full filter blur-3xl opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm uppercase tracking-wider bg-blue-50 px-5 py-2 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <SparklesIcon className="w-4 h-4" />
              Fonctionnalités exclusives
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-6 leading-tight">
              Tout ce dont vous avez besoin
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                pour une gestion optimale
              </span>
            </h2>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              Une suite complète d'outils intelligents pour moderniser votre établissement scolaire
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay, type: "spring", stiffness: 100 }}
                whileHover={{ 
                  y: -12,
                  transition: { duration: 0.2 }
                }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className={`relative ${feature.bgColor} rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100/50 group-hover:border-blue-100/50`}>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS SECTION ============ */}
      <section className="py-28 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider bg-blue-50 px-5 py-2 rounded-full inline-block">
              Témoignages
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-6">
              Ce que disent nos
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> utilisateurs</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.slice(0, 2).map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.15, type: "spring" }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100"
              >
                <div className="flex items-start gap-5 mb-5">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-50"
                  />
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <div className="flex mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarSolidIcon key={i} className="w-4 h-4 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>

          {/* Testimonial carousel for mobile */}
          <div className="md:hidden mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
              >
                <div className="flex items-start gap-5 mb-5">
                  <img
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-50"
                  />
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{testimonials[activeTestimonial].name}</p>
                    <p className="text-sm text-gray-500">{testimonials[activeTestimonial].role}</p>
                    <div className="flex mt-1">
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                        <StarSolidIcon key={i} className="w-4 h-4 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">"{testimonials[activeTestimonial].content}"</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    activeTestimonial === index ? 'w-8 bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <motion.section
        className="py-28 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-900 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat" />
        </div>
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full border border-white/20 mb-8"
            >
              <RocketLaunchIcon className="w-5 h-5 text-white animate-pulse" />
              <span className="text-white font-medium">Offre limitée</span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Prêt à transformer
              <span className="block text-blue-200">votre établissement ?</span>
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Rejoignez plus de 250 écoles qui ont déjà choisi notre solution pour moderniser leur gestion.
            </p>
            <div className="flex flex-wrap justify-center gap-5">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register">
                  <button className="px-10 py-4.5 bg-white text-blue-700 font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-3 text-lg group">
                    Essayer gratuitement
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRightIcon className="w-5 h-5" />
                    </motion.div>
                  </button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/contact">
                  <button className="px-10 py-4.5 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm flex items-center gap-3 text-lg">
                    Nous contacter
                  </button>
                </Link>
              </motion.div>
            </div>
            <motion.p
              className="mt-8 text-sm text-blue-200"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔒 Essai gratuit de 30 jours. Aucune carte bancaire requise.
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-gray-900 text-gray-300 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                  <span className="text-white font-bold text-2xl">E</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">EduManage</span>
                  <span className="text-xs text-gray-500 block -mt-0.5">Pro</span>
                </div>
              </Link>
              <p className="text-sm text-gray-400 mt-6 leading-relaxed">
                La solution complète de gestion d'établissement scolaire. Modernisez votre école avec nos outils intelligents.
              </p>
              <div className="flex space-x-4 mt-6">
                {[
                  { icon: '📘', label: 'Facebook' },
                  { icon: '🐦', label: 'Twitter' },
                  { icon: '💼', label: 'LinkedIn' },
                  { icon: '📷', label: 'Instagram' },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-700 transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </motion.a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Produit</h4>
              <ul className="space-y-3 text-sm">
                {['Fonctionnalités', 'Tarifs', 'Démo', 'FAQ', 'Mises à jour'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors hover:pl-2 duration-300 block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Entreprise</h4>
              <ul className="space-y-3 text-sm">
                {['À propos', 'Blog', 'Carrières', 'Contact', 'Presse'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors hover:pl-2 duration-300 block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Contact</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400">contact@edumanage.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <PhoneIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400">+33 1 23 45 67 89</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400">Paris, France</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p>&copy; 2024 EduManage. Tous droits réservés.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
                <a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;