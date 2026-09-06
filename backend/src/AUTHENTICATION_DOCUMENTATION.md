# 📚 DOCUMENTATION COMPLÈTE DU SYSTÈME D'AUTHENTIFICATION

## SCHOOL MANAGEMENT API - AUTH MODULE

**Version:** 1.0.0  
**Date:** 2024  
**Statut:** Production Ready

---

## 📋 TABLE DES MATIÈRES

1. [Présentation Générale](#1-présentation-générale)
2. [Architecture du Système](#2-architecture-du-système)
3. [Installation et Configuration](#3-installation-et-configuration)
4. [Structure des Fichiers](#4-structure-des-fichiers)
5. [Configuration de la Base de Données (Prisma)](#5-configuration-de-la-base-de-données-prisma)
6. [Sécurité et Protection](#6-sécurité-et-protection)
7. [Endpoints API](#7-endpoints-api)
8. [Flux de Travail](#8-flux-de-travail)
9. [Codes d'Erreur](#9-codes-derreur)
10. [Exemples d'Utilisation](#10-exemples-dutilisation)
11. [Tests et Validation](#11-tests-et-validation)
12. [Déploiement](#12-déploiement)
13. [FAQ et Dépannage](#13-faq-et-dépannage)

---

## 1. PRÉSENTATION GÉNÉRALE

### 1.1 Objectif du Module

Le module d'authentification de School Management est un système complet, sécurisé et scalable conçu pour gérer l'ensemble du cycle de vie des utilisateurs.

#### Fonctionnalités Principales

| # | Fonctionnalité | Description |
|---|---------------|-------------|
| 1 | **Inscription** | Création de compte avec vérification par email (OTP) |
| 2 | **Connexion** | Authentification sécurisée avec JWT |
| 3 | **Gestion des tokens** | Access token (7d) + Refresh token (30d) |
| 4 | **Vérification OTP** | Validation de l'email avec code à 6 chiffres |
| 5 | **Réinitialisation** | Mot de passe oublié avec lien par email |
| 6 | **Changement** | Modification du mot de passe pour utilisateur connecté |
| 7 | **Profil** | Consultation et mise à jour des informations |
| 8 | **Sécurité** | Rate limiting, validation, chiffrement, protection CSRF |

### 1.2 Technologies Utilisées

| Catégorie | Technologie | Version | Utilisation |
|-----------|-------------|---------|-------------|
| **Runtime** | Node.js | ≥ 18.x | Environnement d'exécution |
| **Framework** | Express | 4.x | Serveur HTTP |
| **Langage** | TypeScript | 5.x | Typage statique |
| **ORM** | Prisma | 5.x | Accès aux données |
| **Base de données** | PostgreSQL | 14.x | Stockage persistant |
| **Authentification** | JWT | 9.x | Tokens d'accès |
| **Hashage** | bcrypt | 5.x | Mots de passe |
| **Validation** | Zod | 3.x | Validation des données |
| **Emails** | Nodemailer | 6.x | Notifications |
| **Sécurité** | Helmet | 7.x | Protection HTTP |
| **Compression** | Compression | 1.x | Optimisation |
| **Logging** | Morgan | 1.x | Journalisation |
| **Rate Limiting** | express-rate-limit | 6.x | Protection contre les attaques |

### 1.3 Architecture Globale
