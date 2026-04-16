# Roadmap : InternMatch AI

Ce document détaille les phases de développement pour transformer le prototype actuel en une plateforme complète de matching stages/étudiants.

---

## État Actuel du Project

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
- [x] Agent Étudiant InternCoach (Chatbot Mistral + RAG) ✅
- [x] Pipeline Multi-Agents Mistral (CV Analyzer + Matcher + Recommender) ✅
- [ ] Administration avancée
- [ ] Fonctionnalités innovantes (Auto-Apply, Simulateur, Badges, etc.)
- [ ] Vector Database pour matching sémantique (ChromaDB — actuellement RAG in-memory via mistral-embed)

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

## Phase 4.6 : Agent Étudiant — InternCoach (Chatbot Mistral + RAG) ✅ (Complété)

Premier agent IA conversationnel intégré à l'espace étudiant, entièrement propulsé par **Mistral AI**.

### Objectif
Discuter avec l'étudiant pour enrichir son profil (formation, compétences, intérêts, type de stage recherché, objectifs de carrière, contraintes) via une conversation guidée, puis remonter des offres de stages pertinentes par similarité sémantique (RAG).

### 4.6.1 Chatbot conversationnel (Mistral Chat)
- [x] Service `backend/src/services/mistralService.ts` : client direct API Mistral `/v1/chat/completions`
- [x] Modèle par défaut : `mistral-small-latest` (configurable via `MISTRAL_MODEL`)
- [x] Endpoint authentifié : `POST /api/ai/profile-chat`
- [x] Historique multi-tours, température 0.3 pour plus de rigueur
- [x] Injection automatique du profil connu dans le system prompt (évite les questions redondantes)

### 4.6.2 RAG (Retrieval-Augmented Generation) — sans ChromaDB
- [x] Service `backend/src/services/embeddingService.ts`
- [x] Embeddings via `mistral-embed` API
- [x] Index in-memory des stages actifs (top 200, rebuild batch de 32)
- [x] Cache avec TTL 10 min + rebuild concurrent-safe
- [x] Cosine similarity, seuil `score > 0.25`, top-3
- [x] Requête composite : dernier message user + compétences/intérêts/formation du profil
- [x] Fallback silencieux si retrieval échoue (chat reste fonctionnel)
- [x] Injection des offres retrouvées dans le system prompt comme "Contexte RAG"

### 4.6.3 Guardrails stricts (Prompt Engineering)
Le system prompt contient :
- [x] **MISSION STRICTE** : rôle unique défini
- [x] **PORTÉE AUTORISÉE** : liste blanche des sujets (profil, formation, compétences, stage, carrière, candidature)
- [x] **PORTÉE INTERDITE** : liste noire explicite (devoirs, politique, santé, recettes, écriture créative, etc.)
- [x] **COMPORTEMENT DE REFUS** : format de réponse fixe avec relance vers le profil/stage
- [x] **Anti prompt-injection** : refus explicite des tentatives ("ignore tes instructions", "joue le rôle de...")
- [x] **TOLÉRANCE LINGUISTIQUE** : compréhension des fautes d'orthographe, argot, darija, franglais — refus uniquement sur le sujet, jamais sur la forme
- [x] Anti-hallucination : interdiction d'inventer des offres/entreprises absentes du contexte RAG

### 4.6.4 Interface utilisateur
- [x] Composant `components/ProfileChatbot.tsx`
- [x] Intégré dans la page **Profile** étudiant (page dédiée au chatbot, upload CV et personal info retirés)
- [x] UI : bulles de messages, loader animé, Entrée pour envoyer, Maj+Entrée pour nouvelle ligne
- [x] Bouton "Recommencer" pour reset
- [x] Encart **"Offres pertinentes (RAG)"** affichant titre + entreprise + localisation + score de similarité en %
- [x] Client API `api.profileChat(messages)` dans `services/api.ts`

### 4.6.5 Configuration & Sécurité
- [x] `MISTRAL_API_KEY` dans `backend/src/config/env.ts` (validation Zod, obligatoire)
- [x] `MISTRAL_MODEL` configurable (`mistral-small-latest` par défaut)
- [x] `GEMINI_API_KEY` devenue optionnelle (migration progressive vers tout-Mistral)
- [x] `docker-compose.yml` mis à jour (injection des variables Mistral)
- [x] `backend/.env.example` documenté
- [x] Rate limiting desserré en dev (1000 req / 15 min) vs prod (100 req / 15 min)
- [x] Validation Zod des messages côté controller (max 40 messages, 4000 chars)

### Endpoints
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/ai/profile-chat` | Envoi d'un historique de messages, retour `{ reply, retrieved[] }` |

### Fichiers ajoutés / modifiés
- `backend/src/services/mistralService.ts` (nouveau)
- `backend/src/services/embeddingService.ts` (nouveau)
- `backend/src/controllers/profileChatController.ts` (nouveau)
- `backend/src/routes/aiRoutes.ts` (ajout route)
- `backend/src/config/env.ts` (Mistral + Gemini optionnel)
- `backend/src/app.ts` (rate limit dev)
- `backend/.env.example` (documentation)
- `components/ProfileChatbot.tsx` (nouveau)
- `components/Profile.tsx` (page simplifiée, chatbot uniquement)
- `services/api.ts` (méthode `profileChat`)
- `docker-compose.yml` (variables Mistral)

---

## Phase 4.7 : Pipeline Multi-Agents Mistral (CV Analyzer + Matcher + Recommender) ✅ (Complété)

Trois agents IA spécialisés orchestrés en pipeline, chacun exploitant une technique de *prompt engineering* différente.

### Techniques de prompting utilisées

| Agent | Technique | Paramètres |
|-------|-----------|------------|
| **CV Analyzer** | Few-shot learning + détection ATS | Temp 0.1, JSON mode, 2 exemples inline |
| **Matcher** | Chain-of-Thought (CoT) | Temp 0.2, scoring pondéré 50/30/20 |
| **Recommender** | Constrained prompting | Temp 0.3, 5 contraintes absolues (ressources gratuites/<500 MAD, plateformes Maroc, anti-hallucination, GMT+1) |

### 4.7.1 Agent CV Analyzer (Few-shot + ATS)
- [x] Service `backend/src/services/agents/cvAnalyzerAgent.ts`
- [x] System prompt avec 2 exemples inline (CV bien formaté vs CV image-only)
- [x] Sortie JSON strict : `{ nom, competences[], experience, formation, ats_detectable, score_ats, raison_non_detectable }`
- [x] Détection des points bloquants ATS (tableaux, images, format non standard)

### 4.7.2 Agent Matcher (Chain-of-Thought)
- [x] Service `backend/src/services/agents/matcherAgent.ts`
- [x] Prompt forçant un raisonnement en 4 étapes : compétences → expérience → formation → score pondéré
- [x] Enrichissement par la transcription de la conversation InternCoach (contexte profilage)
- [x] Sortie JSON strict : `{ score, justification }`

### 4.7.3 Agent Recommender (Constrained)
- [x] Service `backend/src/services/agents/recommenderAgent.ts`
- [x] 5 contraintes absolues dans le system prompt
- [x] Utilise la transcription InternCoach comme source principale d'aspirations
- [x] Sortie JSON strict : `{ competences_a_acquérir[], ressources_gratuites[], alternatives_locales[] }`

### 4.7.4 Orchestrateur Pipeline CV
- [x] Service `backend/src/services/agents/cvPipelineOrchestrator.ts`
- [x] Flux : **Upload → OCR (pdf-parse ou Pixtral) → CV Analyzer → (si ATS OK) Recommender**
- [x] Short-circuit si `ats_detectable = false` (pas de reco sur un CV cassé)
- [x] Injection automatique du chat InternCoach en contexte

### 4.7.5 Extracteur texte CV
- [x] Service `backend/src/services/agents/cvExtractorService.ts`
- [x] PDF → `pdf-parse` (extraction locale, rapide, zéro appel API)
- [x] Image (JPG/PNG) → **Pixtral 12B** (`pixtral-12b-2409`) via Mistral Vision
- [x] Minimum 30 caractères extraits sinon erreur

### 4.7.6 Infrastructure partagée
- [x] Helper `backend/src/services/agents/mistralJsonClient.ts`
  - Appel Mistral avec `response_format: { type: 'json_object' }`
  - Temperature basse (0.1-0.3) pour output déterministe
  - Parsing + validation du JSON retourné
  - Gestion d'erreurs centralisée (401, 502, parse fail)

### 4.7.7 Interface utilisateur
- [x] Composant `components/CVAnalyzerPipeline.tsx` (remplace l'ancien CVPerformanceAnalyzer sur l'onglet CV Analyzer)
- [x] Upload drag & drop (PDF, PNG, JPG)
- [x] Bloc Agent 1 : score ATS coloré + détection + profil extrait (nom, formation, expérience, compétences)
- [x] Bloc Agent 2 : compétences à acquérir + ressources gratuites + alternatives locales
- [x] Si ATS NOK : message d'explication, pas de reco

### 4.7.8 Persistance conversation InternCoach
- [x] `services/chatStore.ts` : localStorage (max 40 messages)
- [x] `formatChatAsTranscript()` — transcrit la conversation pour l'injecter dans les prompts
- [x] Injection automatique dans `api.runMatcherAgent()`, `api.runRecommenderAgent()`, `api.runCvPipeline()`
- [x] Opt-out possible via `{ includeChat: false }`

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/ai/agents/cv-analyzer` | Agent seul — body `{ cvContent: string }` |
| POST | `/api/ai/agents/matcher` | Agent seul — body `{ jobOffer, studentProfile?, chatContext? }` |
| POST | `/api/ai/agents/recommender` | Agent seul — body `{ studentProfile?, chatContext? }` |
| POST | `/api/ai/agents/cv-pipeline` | **Pipeline complet** — multipart upload `cv` + `chatContext` optionnel |

### Dépendances ajoutées
- `pdf-parse` (^1.1.1) — extraction texte PDF
- `@types/pdf-parse` (^1.1.4)

### Fichiers ajoutés / modifiés
- `backend/src/services/agents/mistralJsonClient.ts` (nouveau)
- `backend/src/services/agents/cvAnalyzerAgent.ts` (nouveau)
- `backend/src/services/agents/matcherAgent.ts` (nouveau)
- `backend/src/services/agents/recommenderAgent.ts` (nouveau)
- `backend/src/services/agents/cvExtractorService.ts` (nouveau)
- `backend/src/services/agents/cvPipelineOrchestrator.ts` (nouveau)
- `backend/src/controllers/agentsController.ts` (nouveau)
- `backend/src/routes/aiRoutes.ts` (routes `/agents/*`)
- `backend/package.json` (`pdf-parse`)
- `services/chatStore.ts` (nouveau — persistance chat localStorage)
- `services/api.ts` (4 méthodes `runCvAnalyzerAgent`, `runMatcherAgent`, `runRecommenderAgent`, `runCvPipeline`)
- `components/CVAnalyzerPipeline.tsx` (nouveau)
- `components/ProfileChatbot.tsx` (sauvegarde localStorage)
- `App.tsx` (tab CV Analyzer → `CVAnalyzerPipeline`)

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
