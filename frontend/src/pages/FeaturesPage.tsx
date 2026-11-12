// frontend2/src/pages/FeaturesPage.tsx

import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon,
  CheckIcon,
  Bars3Icon,
  XMarkIcon,
  PhoneIcon,
  UserGroupIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

// ═══════════════════════════════════════════════
// IMAGES — Unsplash (scolaires, stables)
// ═══════════════════════════════════════════════

const IMG = {
  hero: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
  eleves:
    'https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1200&q=80',
  enseignants:
    'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1200&q=80',
  notes:
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
  scolarite:
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
  planning:
    'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80',
  communication:
    'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=1200&q=80',
  bibliotheque:
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
  surveillance:
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
};

// ═══════════════════════════════════════════════
// NAVIGATION — SIMPLIFIÉE
// ═══════════════════════════════════════════════

const NAV_LINKS = [
  { label: 'Fonctionnalités', to: '/features' },
  { label: 'Tarifs', to: '/tarifs' },
  { label: 'Contact', to: '/contact' },
];

// ═══════════════════════════════════════════════
// DONNÉES — MODULES
// ═══════════════════════════════════════════════

type FeatureModule = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  features: { title: string; desc: string }[];
  reverse?: boolean;
};

const MODULES: FeatureModule[] = [
  {
    id: 'eleves',
    icon: UserGroupIcon,
    image: IMG.eleves,
    title: 'Élèves & familles',
    subtitle: 'Dossier unique, parents connectés, inscriptions fluides',
    description:
      "Chaque élève a sa fiche vivante. Les parents ont leur propre accès pour suivre leur enfant. Tout est centralisé, rien n'est perdu.",
    features: [
      { title: 'Dossier élève complet', desc: 'Matricule, état civil, photo, adresse, groupe sanguin, allergies, statut.' },
      { title: 'Inscriptions multi-années', desc: 'Un élève inscrit à plusieurs classes et années scolaires, historique conservé.' },
      { title: 'Parents rattachés', desc: 'Plusieurs parents par élève, contact principal, droit de récupération.' },
      { title: 'Responsables légaux', desc: 'Personnes à contacter en urgence, avec profession et adresse.' },
      { title: 'Espace parent', desc: 'Notes, absences, paiements, communiqués — depuis le téléphone.' },
      { title: 'Alertes automatiques', desc: 'Absence, échéance, bulletin : parents notifiés en temps réel.' },
    ],
  },
  {
    id: 'enseignants',
    icon: AcademicCapIcon,
    image: IMG.enseignants,
    title: 'Enseignants & RH',
    subtitle: 'De la fiche au bulletin de paie, sans Excel',
    description:
      "Tout le cycle de vie de l'enseignant : embauche, affectations, présence, heures supp, absences, avances, réclamations, paie.",
    features: [
      { title: 'Fiche enseignant complète', desc: 'Matricule, qualification, spécialité, contrat, salaire, infos bancaires.' },
      { title: 'Affectations multiples', desc: 'Plusieurs classes, matières, années. Titulaire détecté automatiquement.' },
      { title: 'Présences enseignants', desc: 'Pointage avec heure d\'arrivée/départ, statut, latitude/longitude.' },
      { title: 'Demandes d\'absence', desc: 'Congés, maladie, maternité… workflow de validation intégré.' },
      { title: 'Heures supplémentaires', desc: 'Déclaration, motif, validation, intégration automatique dans la paie.' },
      { title: 'Avances & réclamations', desc: 'Demande, approbation, remboursement, suivi RH complet.' },
      { title: 'Paie mensuelle', desc: 'Salaire + heures supp + primes - retenues - avances = net.' },
      { title: 'Historique salaires', desc: 'Toute augmentation tracée avec date, motif et approbateur.' },
    ],
    reverse: true,
  },
  {
    id: 'notes',
    icon: DocumentTextIcon,
    image: IMG.notes,
    title: 'Notes & bulletins',
    subtitle: 'Saisie rapide, moyennes calculées, bulletins en 3 minutes',
    description:
      "Fini les bulletins calculés à la main le dernier jour. Règles d'évaluation paramétrables, moyennes pondérées, bulletins générés en un clic.",
    features: [
      { title: 'Règles d\'évaluation', desc: 'Devoir, test, examen, TP, projet — coefficient, barème, seuil de réussite.' },
      { title: 'Notes par période', desc: 'Saisie trimestre par trimestre. Chaque note validée par le professeur.' },
      { title: 'Appréciations', desc: 'Générales, par matière, sur le comportement ou la progression.' },
      { title: 'Bulletins automatiques', desc: 'Moyenne, rang, effectif, mentions, décision — tout calculé et figé.' },
      { title: 'PDF signés', desc: 'Chaque bulletin généré en PDF, validé par la direction, téléchargeable.' },
      { title: 'Validation en 2 étapes', desc: 'Généré par un utilisateur, validé par un autre. Traçabilité complète.' },
    ],
  },
  {
    id: 'scolarite',
    icon: BanknotesIcon,
    image: IMG.scolarite,
    title: 'Scolarité & paiements',
    subtitle: 'Mobile Money, reçus automatiques, zéro impayé oublié',
    description:
      "Plans de scolarité paramétrables, échéances suivies, paiements Mobile Money, reçus PDF avec QR de vérification. Vos finances sont enfin claires.",
    features: [
      { title: 'Plans de scolarité', desc: 'Par niveau, classe ou élève. Frais inscription + scolarité + autres frais.' },
      { title: 'Échéances multiples', desc: 'Découpez le montant en 1, 2, 3 ou 10 échéances. Chacune a sa date limite.' },
      { title: 'Réductions', desc: 'Bourse, fratrie, personnel. En montant fixe ou pourcentage. Approuvées.' },
      { title: 'Mobile Money natif', desc: 'Flooz, T-Money, MTN MoMo, Orange Money. Paiements reçus sur votre compte.' },
      { title: 'Allocation automatique', desc: 'Chaque paiement ventilé sur les échéances dans l\'ordre. Fini les doutes.' },
      { title: 'Reçus PDF + QR', desc: 'Numéro unique, code de vérification, URL publique. Preuve à tout moment.' },
      { title: 'Snapshot établissement', desc: 'Chaque reçu fige le nom, logo, adresse de l\'école au moment de l\'émission.' },
      { title: 'Annulation tracée', desc: 'Un paiement annulé uniquement avec motif, par un responsable identifié.' },
    ],
    reverse: true,
  },
  {
    id: 'planning',
    icon: CalendarDaysIcon,
    image: IMG.planning,
    title: 'Emplois du temps & TD',
    subtitle: 'Planning clair, cours de soutien facturables',
    description:
      "Emplois du temps visuels pour chaque classe, et gestion complète des groupes de TD (cours de soutien payants) avec présences et paiements.",
    features: [
      { title: 'Emplois du temps par classe', desc: 'Jour, heure, salle, enseignant, matière. Valable du… au… pour les changements.' },
      { title: 'Vue enseignant', desc: 'Chaque prof voit son planning complet. Notification quand un cours approche.' },
      { title: 'Groupes de TD', desc: 'Cours de soutien, petits groupes. Capacité max, jour/heure, tarif.' },
      { title: 'Membres & paiements TD', desc: 'Adhésion par élève, montant payé, mensuel ou total, statut.' },
      { title: 'Séances de TD', desc: 'Date, heure, salle, thème. Annulation possible avec motif.' },
      { title: 'Gratuit ou payant', desc: 'Un groupe TD peut être gratuit (soutien interne) ou payant (cours du soir).' },
    ],
  },
  {
    id: 'communication',
    icon: ChatBubbleLeftRightIcon,
    image: IMG.communication,
    title: 'Communication',
    subtitle: 'Messages, communiqués, chat en direct — tout est tracé',
    description:
      "La communication école-parents-enseignants est structurée : messages internes, communiqués officiels, conversations de groupe, chat en temps réel, notifications.",
    features: [
      { title: 'Messagerie interne', desc: 'Messages avec sujet, priorité, pièces jointes, accusés de lecture.' },
      { title: 'Communiqués officiels', desc: 'Publication aux rôles entiers, dates de publication et d\'expiration.' },
      { title: 'Suivi des lectures', desc: 'Qui a lu, qui n\'a pas lu. La direction sait qui est informé.' },
      { title: 'Chat temps réel', desc: 'Conversations privées, groupe, classe, matière. Texte, image, audio, fichier.' },
      { title: 'Communication école-parents', desc: 'Canal dédié entre l\'école et la famille, rattaché à un élève.' },
      { title: 'Notifications centralisées', desc: 'Plus de 25 types : paiement, absence, bulletin, incident, note…' },
    ],
    reverse: true,
  },
  {
    id: 'bibliotheque',
    icon: BookOpenIcon,
    image: IMG.bibliotheque,
    title: 'Bibliothèque',
    subtitle: 'Catalogue, prêts, retards, pénalités — automatisés',
    description:
      "Fini le cahier de prêt papier. Cataloguez vos livres, laissez élèves et enseignants emprunter, le système gère les retours et les retards.",
    features: [
      { title: 'Catalogue structuré', desc: 'Catégories, ISBN, titre, auteur, éditeur, année, langue, couverture, cote.' },
      { title: 'Gestion des exemplaires', desc: 'Total et disponible en temps réel. Emplacement physique du livre.' },
      { title: 'Emprunts', desc: 'À un élève ou à un enseignant. Date de retour prévue et réelle.' },
      { title: 'Retards & pénalités', desc: 'En cours, retourné, en retard, perdu, endommagé. Pénalité calculable.' },
      { title: 'Notifications automatiques', desc: 'Rappel avant retour, alerte en cas de retard — élève et parents.' },
      { title: 'Traçabilité', desc: 'Chaque emprunt enregistré par un bibliothécaire identifié. Auditable.' },
    ],
  },
  {
    id: 'vie-scolaire',
    icon: ShieldCheckIcon,
    image: IMG.surveillance,
    title: 'Vie scolaire & surveillance',
    subtitle: 'Présences, absences, incidents, objectifs — tout tracé',
    description:
      "Le surveillant pointe, signale un incident, le directeur suit. Les objectifs pédagogiques sont assignés et suivis. Rien ne passe entre les mailles.",
    features: [
      { title: 'Présences élèves', desc: 'Pointage par classe : présent, absent, retard, excusé, sortie anticipée.' },
      { title: 'Absences élèves', desc: 'Déclaration sur plusieurs jours, type, workflow d\'approbation.' },
      { title: 'Surveillance des zones', desc: 'Cour, récréation, cantine, entrée, sortie, examen. Zones paramétrables.' },
      { title: 'Incidents', desc: 'Type, gravité, description, pièces jointes, sanction, notification parents.' },
      { title: 'Workflow incident', desc: 'Ouvert → En cours → Résolu → Fermé. Escalade possible.' },
      { title: 'Objectifs pédagogiques', desc: 'Moyenne, assiduité, comportement, progression. Valeur cible suivie.' },
      { title: 'Documents pédagogiques', desc: 'Cours, exercices, corrections, épreuves, annales. Classés et téléchargeables.' },
    ],
    reverse: true,
  },
];

// ═══════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════

const FeaturesPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F7F4EB] text-[#0A0A0A] overflow-x-hidden antialiased">
      {/* ═══════════════════════════════════════════════
          NAVBAR
          ═══════════════════════════════════════════════ */}
      <motion.nav
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

            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-[13.5px] font-medium text-black/65 hover:text-black transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#10B981] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-[#0A0A0A] text-[#F7F4EB] text-[13px] font-semibold px-5 py-2.5 rounded-full hover:bg-[#10B981] transition-all duration-300"
              >
                Connexion
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>

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

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden bg-[#F7F4EB] border-t border-black/5"
            >
              <div className="px-6 py-5 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="block py-3 text-[14px] font-semibold text-[#0A0A0A]"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-black/10">
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

      {/* ═══════════════════════════════════════════════
          HERO — AVEC GRANDE IMAGE
          ═══════════════════════════════════════════════ */}
      <section className="relative pt-14 lg:pt-20 pb-16 lg:pb-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="grid lg:grid-cols-12 gap-12 items-center"
          >
            <div className="lg:col-span-6">
              <span className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-[#10B981]">
                — Fonctionnalités
              </span>
              <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-black leading-[0.95] tracking-[-0.04em] mt-4">
                Tout ce que votre
                <br />
                <span className="text-[#10B981]">école</span> peut faire
                <br />
                sur une plateforme.
              </h1>
              <p className="mt-7 text-[16px] lg:text-[17px] text-black/60 max-w-xl leading-relaxed">
                Huit modules connectés entre eux. Zéro Excel. Zéro cahier. Zéro doublon.
                Chaque fonctionnalité décrite ici existe dans le produit — pas dans une roadmap.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-black/55">
                {['Testé sur le terrain', 'Conçu pour l\'Afrique', '100% connecté'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckIcon className="w-4 h-4 text-[#10B981]" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-[0_30px_80px_-30px_rgba(10,10,10,0.35)]">
                <img
                  src={IMG.hero}
                  alt="Salle de classe en Afrique"
                  className="w-full h-[420px] lg:h-[520px] object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="bg-[#F7F4EB]/95 backdrop-blur-md rounded-2xl px-5 py-4">
                    <p className="text-[10.5px] font-mono uppercase tracking-[0.15em] text-black/40">
                      Huit modules · Une plateforme
                    </p>
                    <p className="text-[14px] font-bold text-[#0A0A0A] mt-1">
                      Élèves · Enseignants · Notes · Scolarité · Planning · Communication · Bibliothèque · Vie scolaire
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          MODULES — ALTERNANCE IMAGE / CONTENU
          ═══════════════════════════════════════════════ */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 space-y-24 lg:space-y-32">
          {MODULES.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.id}
                id={module.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="scroll-mt-28"
              >
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                  {/* Image */}
                  <div className={`lg:col-span-6 ${module.reverse ? 'lg:order-2' : ''}`}>
                    <div className="relative rounded-3xl overflow-hidden shadow-[0_24px_60px_-24px_rgba(10,10,10,0.25)] group">
                      <img
                        src={module.image}
                        alt={module.title}
                        className="w-full h-[340px] lg:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4 bg-[#0A0A0A]/85 backdrop-blur-sm text-[#F7F4EB] rounded-xl px-3 py-2 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#10B981]" />
                        <span className="text-[11.5px] font-semibold">{module.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className={`lg:col-span-6 ${module.reverse ? 'lg:order-1' : ''}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#0A0A0A] rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#F7F4EB]" />
                      </div>
                      <span className="text-[11.5px] font-mono uppercase tracking-[0.15em] text-black/40">
                        Module
                      </span>
                    </div>

                    <h2 className="text-[clamp(1.9rem,3.5vw,2.8rem)] font-black leading-[1.05] tracking-[-0.03em]">
                      {module.title}
                    </h2>
                    <p className="text-[14.5px] text-[#10B981] font-medium mt-2">
                      {module.subtitle}
                    </p>
                    <p className="text-[14.5px] text-black/60 mt-4 leading-relaxed">
                      {module.description}
                    </p>

                    <div className="mt-7 space-y-3">
                      {module.features.map((f) => (
                        <div
                          key={f.title}
                          className="flex items-start gap-3 pb-3 border-b border-black/5 last:border-0"
                        >
                          <CheckIcon
                            className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0"
                            strokeWidth={3}
                          />
                          <div>
                            <p className="text-[13.5px] font-bold text-[#0A0A0A] leading-snug">
                              {f.title}
                            </p>
                            <p className="text-[12.5px] text-black/55 leading-relaxed mt-0.5">
                              {f.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {index < MODULES.length - 1 && (
                  <div className="mt-24 lg:mt-32 h-px bg-black/5" />
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA FINAL
          ═══════════════════════════════════════════════ */}
      <section className="py-24 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="relative bg-[#0A0A0A] rounded-[2rem] overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #10B981 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}
            />
            <div
              className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#10B981] rounded-full opacity-[0.15] blur-[120px]"
            />

            <div className="relative grid lg:grid-cols-12 gap-10 items-center p-10 lg:p-16">
              <div className="lg:col-span-7">
                <span className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-[#10B981]">
                  — Prêt à commencer ?
                </span>
                <h2 className="text-[clamp(2rem,4.5vw,3.8rem)] font-black leading-[0.95] tracking-[-0.04em] text-white mt-4">
                  Voyez tout ça
                  <br />
                  <span className="text-[#10B981]">en action.</span>
                </h2>
                <p className="mt-5 text-white/60 text-[15px] max-w-lg leading-relaxed">
                  Connectez-vous à votre espace ou contactez-nous pour découvrir
                  la plateforme sur votre propre établissement.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/login"
                    className="group inline-flex items-center gap-3 bg-[#10B981] text-white text-[14.5px] font-semibold px-7 py-4 rounded-full hover:bg-white hover:text-[#0A0A0A] transition-all duration-300"
                  >
                    Se connecter
                    <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="tel:+22892438582"
                    className="inline-flex items-center gap-2 text-white text-[14.5px] font-semibold px-4 py-4 hover:text-[#10B981] transition-colors"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    +228 92 43 85 82
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 hidden lg:block">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src={IMG.eleves}
                    alt="Élèves en classe"
                    className="w-full h-[280px] object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════ */}
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
                items: ['Fonctionnalités', 'Tarifs', 'Sécurité'],
              },
              {
                title: 'Entreprise',
                items: ['À propos', 'Clients', 'Contact'],
              },
              {
                title: 'Ressources',
                items: ["Centre d'aide", 'Documentation', 'Statut'],
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

export default FeaturesPage;