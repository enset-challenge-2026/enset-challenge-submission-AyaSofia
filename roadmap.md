# Roadmap : InternMatch AI

Ce document détaille les phases de développement pour transformer le prototype actuel en une plateforme complète de matching stages/étudiants.

---

## État Actuel du Projet

### Fonctionnalités Implémentées
- [x] Interface utilisateur React (Tailwind CSS)
- [x] Authentification JWT (inscription/connexion)
- [x] Upload et analyse de CV par IA (Google Gemini)
- [x] Extraction automatique des compétences
- [x] Matching intelligent avec score de pertinence
- [x] Suivi des candidatures (Postulé, Entretien, Refusé, Accepté)
- [x] Backend Node.js/Express + PostgreSQL + Prisma
- [x] Dockerisation complète (frontend, backend, BDD)

### Ce qui reste à faire (Nouveau Cahier des Charges)
- [x] Espace Entreprise complet ✅
- [x] Analyseur de Performance CV (StageMatch IA) ✅
- [ ] Administration avancée
- [ ] Fonctionnalités innovantes (Auto-Apply, Simulateur, Badges, etc.)
- [ ] Vector Database pour matching sémantique

---

## Phase 1 : Consolidation Espace Étudiant ✅ (Complété)

- [x] Interface utilisateur React
- [x] Intégration API Gemini pour analyse CV
- [x] Moteur de matching intelligent
- [x] Persistance PostgreSQL
- [x] Authentification JWT

---

## Phase 2 : Backend & Infrastructure ✅ (Complété)

- [x] API REST Express/TypeScript
- [x] Authentification JWT sécurisée
- [x] Upload sécurisé des fichiers (Multer)
- [x] Validation Zod + gestion d'erreurs
- [x] Rate limiting + Helmet.js
- [x] Docker Compose (PostgreSQL, Backend, Frontend/Nginx)

---

## Phase 3 : Enrichissement Espace Étudiant

Amélioration de l'expérience étudiant selon le nouveau cahier des charges.

### 3.1 Onboarding Amélioré
- [ ] Questionnaire aspirations à l'inscription :
  - Secteur d'activité souhaité
  - Zone géographique préférée
  - Type de stage (temps plein, alternance, remote)
  - Durée souhaitée
- [ ] Wizard d'onboarding étape par étape
- [ ] Indicateur de complétion du profil

### 3.2 Analyse IA Enrichie
- [ ] Séparation Hard Skills / Soft Skills
- [ ] Score de qualité du CV
- [ ] Suggestions d'amélioration concrètes
- [ ] Comparaison avec les profils similaires

### 3.3 Pipeline Visuel de Suivi
- [ ] Vue Kanban drag & drop pour les candidatures
- [ ] Historique des actions par candidature
- [ ] Notes personnelles sur chaque candidature
- [ ] Rappels et dates clés (entretiens)

### Modèle de données (mise à jour Profile)
```prisma
model Profile {
  // ... existant
  preferredSectors    String[]
  preferredLocations  String[]
  stageType           StageType?
  availabilityDate    DateTime?
  desiredDuration     Int?        // en mois
  videoPitchUrl       String?
}

enum StageType {
  FULL_TIME
  PART_TIME
  ALTERNANCE
  REMOTE
}
```

---

## Phase 4 : Espace Entreprise ✅ (Complété)

Création complète de l'espace recruteur.

### 4.1 Authentification Entreprise
- [x] Inscription entreprise (SIRET, nom, secteur)
- [x] Connexion entreprise avec JWT (userType: 'company')
- [x] Séparation des espaces étudiant/entreprise
- [ ] Validation manuelle par admin
- [ ] Multi-utilisateurs par entreprise

### 4.2 Gestion des Offres de Stage
- [x] Formulaire de création d'offre
- [x] Liste des offres avec statistiques
- [x] Activation/désactivation des offres
- [x] Modification et suppression
- [ ] Aide à la rédaction par IA (génération description)
- [ ] Duplication d'offres existantes

### 4.3 Navigation Étudiants
- [x] Parcours des offres réelles publiées
- [x] Filtres (recherche, localisation, type, compétences)
- [x] Candidature avec lettre de motivation
- [x] Suivi des candidatures soumises
- [x] Retrait de candidature

### 4.4 Gestion des Candidatures (Recruteur)
- [x] Vue Kanban par offre (Nouveau, En revue, Présélectionné, Entretien, Offre, Accepté, Refusé)
- [x] Drag & drop pour changer de statut
- [x] Notes internes par candidat
- [x] Vue détail du profil candidat
- [ ] Emails automatiques selon le statut

### 4.5 Messagerie Intégrée
- [ ] Chat temps réel (WebSocket)
- [ ] Prise de rendez-vous intégrée
- [ ] Notifications push/email
- [ ] Historique des conversations

---

## Phase 4.5 : Analyseur de Performance CV (StageMatch IA) ✅ (Complété)

Module d'analyse intelligente pour optimiser les CV avant candidature.

### Fonctionnalités Implémentées
- [x] **Audit ATS (Technique)** : Vérifie si le CV est lisible par les logiciels ATS
  - Score de compatibilité ATS (0-100)
  - Détection des problèmes de formatage
  - Recommandations de correction
- [x] **Diagnostic de Contenu (Qualitatif)** : Analyse qualitative du CV
  - Identification des points forts
  - Détection des faiblesses
  - Liste des éléments manquants
  - Suggestions d'amélioration
- [x] **Recommandations Dynamiques** : Basées sur le marché actuel
  - Compétences à ajouter selon les offres populaires
  - Score de demande par compétence
  - Nombre d'offres requérant chaque compétence
- [x] **Score de Match Marché** : Adéquation CV/marché (0-100)
- [x] **Actions Concrètes** : Liste de 5-7 actions prioritaires

### Interface Utilisateur
- [x] Upload drag & drop (PDF, PNG, JPG)
- [x] Jauges de score animées (Overall, ATS, Match)
- [x] Navigation par onglets (ATS, Contenu, Compétences, Actions)
- [x] Historique des analyses précédentes
- [x] Design responsive et moderne

### Backend
- [x] Intégration Gemini AI pour analyse complète
- [x] Modèle Prisma `CVPerformanceAnalysis`
- [x] Endpoints API : POST/GET `/api/ai/cv-performance`
- [x] Historique : GET `/api/ai/cv-performance/history`

### Modèles de données
```prisma
model Company {
  id          String    @id @default(uuid())
  name        String
  siret       String    @unique
  sector      String
  description String?
  logoUrl     String?
  website     String?
  verified    Boolean   @default(false)
  createdAt   DateTime  @default(now())
  users       CompanyUser[]
  internships Internship[]
}

model CompanyUser {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(...)
  companyId String
  company   Company  @relation(...)
  role      CompanyRole @default(RECRUITER)
}

enum CompanyRole {
  ADMIN
  RECRUITER
}

model Internship {
  id            String   @id @default(uuid())
  companyId     String
  company       Company  @relation(...)
  title         String
  description   String
  requirements  String[]
  location      String
  remote        Boolean  @default(false)
  duration      Int      // en mois
  startDate     DateTime?
  salary        String?
  status        InternshipStatus @default(DRAFT)
  createdAt     DateTime @default(now())
  expiresAt     DateTime?
  applications  Application[]
}

enum InternshipStatus {
  DRAFT
  PUBLISHED
  CLOSED
  ARCHIVED
}

model Message {
  id          String   @id @default(uuid())
  senderId    String
  receiverId  String
  content     String
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

---

## Phase 5 : Administration Avancée

### 5.1 Modération
- [ ] Validation des nouvelles entreprises
- [ ] Modération des offres de stage
- [ ] Signalement et suspension de comptes
- [ ] Logs d'activité

### 5.2 Statistiques Globales
- [ ] Dashboard avec KPIs :
  - Nombre d'étudiants / entreprises
  - Taux de matching réussi
  - Secteurs les plus demandés
  - Temps moyen de recrutement
- [ ] Graphiques et exports CSV
- [ ] Alertes sur anomalies

### 5.3 Configuration Plateforme
- [ ] Gestion des catégories/secteurs
- [ ] Templates d'emails
- [ ] Paramètres de matching IA

---

## Phase 6 : Fonctionnalités Innovantes

### 6.1 Auto-Apply Intelligent
- [ ] Configuration des critères par l'étudiant
- [ ] Sélection automatique des 5 meilleures offres/semaine
- [ ] Génération de lettre de motivation personnalisée par IA
- [ ] Validation avant envoi (ou envoi automatique)
- [ ] Rapport hebdomadaire des candidatures auto

### 6.2 Simulateur d'Entretien IA
- [ ] Génération de questions basées sur la fiche de poste
- [ ] Interface chat ou vocale (Text-to-Speech / Speech-to-Text)
- [ ] Évaluation des réponses par l'IA
- [ ] Conseils d'amélioration personnalisés
- [ ] Historique des simulations

### 6.3 Badges de Compétences
- [ ] Mini-tests techniques générés par IA
- [ ] Système de certification (badge sur le profil)
- [ ] Niveaux : Débutant, Intermédiaire, Expert
- [ ] Expiration et revalidation des badges
- [ ] Visibilité pour les recruteurs

### 6.4 Matching par Culture d'Entreprise
- [ ] Questionnaire personnalité entreprise
- [ ] Questionnaire personnalité étudiant
- [ ] Score de compatibilité culturelle
- [ ] Affichage dans les résultats de matching

### 6.5 Vidéo Pitch 30 secondes
- [ ] Capture vidéo intégrée (WebRTC)
- [ ] Stockage et transcodage (S3 + FFmpeg)
- [ ] Affichage sur le profil étudiant
- [ ] Visionnage par les recruteurs

---

## Phase 7 : Matching IA Avancé (Vector Database)

### 7.1 Infrastructure
- [ ] Intégration Pinecone ou Qdrant
- [ ] Embeddings des profils étudiants
- [ ] Embeddings des offres de stage
- [ ] API de recherche sémantique

### 7.2 Matching Sémantique
- [ ] Recherche par similarité vectorielle
- [ ] Prise en compte du contexte (pas juste les mots-clés)
- [ ] Score hybride : sémantique + critères durs
- [ ] Mise à jour temps réel des embeddings

---

## Phase 8 : Déploiement Production

### 8.1 Infrastructure
- [ ] VPS Ubuntu 22.04 LTS
- [ ] Nginx reverse proxy
- [ ] SSL Let's Encrypt
- [ ] PM2 ou Docker Swarm
- [ ] Backup automatique PostgreSQL

### 8.2 CI/CD
- [ ] GitHub Actions
- [ ] Tests automatisés
- [ ] Déploiement automatique sur push main
- [ ] Environnements staging/production

### 8.3 Monitoring
- [ ] Logs centralisés (ELK ou Loki)
- [ ] Alerting (Uptime, erreurs)
- [ ] Métriques performance (Prometheus/Grafana)

---

## Stack Technique Cible

| Composant | Technologie |
| :--- | :--- |
| **Frontend** | React + Tailwind CSS (ou Next.js pour SEO) |
| **Backend** | Node.js (Express) + TypeScript |
| **IA Principale** | Google Gemini API |
| **IA Alternative** | OpenAI GPT-4o / Claude 3.5 (selon besoins) |
| **Base de données** | PostgreSQL + Prisma |
| **Vector Database** | Pinecone ou Qdrant |
| **Cache** | Redis |
| **Stockage fichiers** | S3 (AWS/MinIO) |
| **Temps réel** | WebSocket (Socket.io) |
| **OS Serveur** | Ubuntu Server 22.04 LTS |
| **Proxy/SSL** | Nginx + Certbot |
| **Conteneurisation** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

---

## Priorisation Suggérée

| Priorité | Phase | Statut |
|----------|-------|--------|
| ✅ Complété | Phase 4 (Espace Entreprise) | Implémenté |
| ✅ Complété | Phase 4.5 (CV Performance Analyzer) | Implémenté |
| 🔴 Haute | Phase 3 (Enrichissement Étudiant) | À faire |
| 🟠 Moyenne | Phase 5 (Administration) | À faire |
| 🟠 Moyenne | Phase 8 (Déploiement) | À faire |
| 🟢 Basse | Phase 6 (Fonctionnalités Innovantes) | À faire |
| 🟢 Basse | Phase 7 (Vector DB) | À faire |

---

## Estimation Globale

- **MVP (Phases 3-5)** : Plateforme fonctionnelle avec étudiants + entreprises
- **V1 (+ Phase 8)** : Déploiement production
- **V2 (+ Phases 6-7)** : Fonctionnalités innovantes et IA avancée
