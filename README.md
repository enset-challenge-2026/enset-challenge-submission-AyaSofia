# InternMatch AI - Documentation Technique

Plateforme intelligente de matching stages/étudiants avec **IA Agentique**.

---

## ENSET Challenge 2026 - Phase Finale

**Objectif** : Écosystème intelligent et interactif capable de raisonner, planifier et exécuter des tâches complexes de manière autonome ou semi-autonome.

### Critères d'Évaluation
| Critère | Poids | Statut |
|---------|-------|--------|
| Innovation & Impacts | 30% | ✅ |
| Qualité Technique & Orchestration | 25% | ✅ |
| Sécurité & Fiabilité (Guardrails/HITL) | 20% | ✅ |
| Interfaces (UI Web & Mobile) | 15% | ✅ Web / ✅ PWA Mobile |
| Présentation & Démo Live | 10% | ✅ |

---

## Fonctionnalités Implémentées

### Espace Étudiant
- ✅ Interface utilisateur React + Tailwind CSS
- ✅ Authentification JWT (inscription/connexion)
- ✅ Upload et analyse de CV par IA (Google Gemini)
- ✅ Extraction automatique des compétences
- ✅ Matching intelligent avec score de pertinence
- ✅ Suivi des candidatures (Postulé, Entretien, Refusé, Accepté)
- ✅ Analyseur de Performance CV (StageMatch IA)
  - Audit ATS (Score 0-100)
  - Diagnostic de Contenu
  - Recommandations Dynamiques
  - Score de Match Marché
  - Actions Concrètes prioritaires
- ✅ **Agent InternCoach — Chatbot Mistral + RAG** (page Profile)
  - Conversation guidée pour enrichir le profil étudiant
  - Questions progressives (formation → compétences → stage recherché → objectifs)
  - Retrieval sémantique des offres pertinentes (mistral-embed + cosine similarity)
  - Guardrails stricts (liste blanche/noire de sujets, anti prompt-injection)
  - Tolérance aux fautes d'orthographe, argot, franglais, darija

### Espace Entreprise
- ✅ Authentification entreprise (SIRET, nom, secteur)
- ✅ Formulaire de création d'offre de stage
- ✅ Liste des offres avec statistiques
- ✅ Activation/désactivation des offres
- ✅ Vue Kanban des candidatures (Nouveau → Accepté)
- ✅ Drag & drop pour changer de statut
- ✅ Notes internes par candidat
- ✅ Vue détail profil candidat

### Espace Admin
- ✅ Dashboard administrateur
- ✅ Vue des utilisateurs
- ✅ Vue des entreprises
- ✅ Vue des stages

### Backend & Infrastructure
- ✅ API REST Express/TypeScript
- ✅ Authentification JWT sécurisée
- ✅ Upload sécurisé des fichiers (Multer)
- ✅ Validation Zod + gestion d'erreurs
- ✅ Rate limiting + Helmet.js
- ✅ PostgreSQL + Prisma ORM
- ✅ Docker Compose (PostgreSQL, ChromaDB, Redis, Backend, Frontend)
- ✅ Versions npm lockées (reproductibilité)
- ✅ Script de seeding ChromaDB (`npm run seed:chroma`)

### PWA Mobile
- ✅ `manifest.json` (icônes, shortcuts, theme color)
- ✅ `service-worker.js` (cache offline, notifications push, background sync)
- ✅ Installation automatique via `index.html`
- ✅ Stratégies de cache (Cache-First pour assets, Network-First pour API)

---

## Agent InternCoach (Mistral + RAG) — Détails

Agent conversationnel dédié à l'espace étudiant, intégré sur la page **Profile** (désormais consacrée au chatbot).

### Pipeline de traitement d'un message

```
Étudiant (UI Profile)
      │
      ▼
POST /api/ai/profile-chat  ── (auth JWT)
      │
      ▼
┌────────────────────────────────────┐
│  profileChatController             │
│  • Valide la requête (Zod)         │
│  • Charge profil + dernière        │
│    CVAnalysis depuis Postgres      │
└─────────────┬──────────────────────┘
              │
              ▼
┌────────────────────────────────────┐
│  embeddingService.retrieve...      │
│  • Embed du dernier message user   │
│    + hints du profil (mistral-embed│
│  • Cosine vs index in-memory       │
│    des Internship actifs           │
│  • top-3 (seuil 0.25)              │
└─────────────┬──────────────────────┘
              │
              ▼
┌────────────────────────────────────┐
│  mistralService.chatWithStudent    │
│  • Build system prompt :           │
│    - Mission stricte               │
│    - Portée autorisée / interdite  │
│    - Politique de refus            │
│    - Tolérance linguistique        │
│    - Profil connu (anti-redondance)│
│    - Contexte RAG (top-3 stages)   │
│  • mistral-small-latest, T=0.3     │
└─────────────┬──────────────────────┘
              │
              ▼
   { reply, retrieved[] }  ── UI
```

### Composants techniques

| Composant | Fichier | Rôle |
|-----------|---------|------|
| Client Mistral Chat | `backend/src/services/mistralService.ts` | Appel direct `/v1/chat/completions` + system prompt |
| Service RAG | `backend/src/services/embeddingService.ts` | `mistral-embed` + index in-memory + cosine |
| Controller | `backend/src/controllers/profileChatController.ts` | Validation + orchestration |
| Route | `backend/src/routes/aiRoutes.ts` | `POST /api/ai/profile-chat` |
| UI chatbot | `components/ProfileChatbot.tsx` | Chat + affichage offres RAG |
| Page Profile | `components/Profile.tsx` | Page dédiée (CV upload / personal info retirés) |
| Client API | `services/api.ts` | `api.profileChat(messages)` |

### Configuration

```env
MISTRAL_API_KEY=xxxx              # obligatoire
MISTRAL_MODEL=mistral-small-latest  # par défaut
GEMINI_API_KEY=xxxx               # désormais optionnel
```

Variables injectées dans `docker-compose.yml` (service `backend`).

### Caractéristiques RAG

- **Backend vectoriel** : in-memory (pas de ChromaDB requis pour cet agent)
- **Modèle d'embedding** : `mistral-embed`
- **Index** : top 200 Internship actifs, rebuild par batch de 32, cache TTL 10 min
- **Recherche** : cosine similarity, seuil `score > 0.25`, top-3
- **Requête composée** : dernier message user + hints profil (skills, interests, education, cvSkills)
- **Fallback** : si retrieval échoue, le chat continue sans contexte (erreur loggée)

### Guardrails (prompt engineering strict)

Le system prompt impose :
1. **Mission unique** : aide à la construction du profil + recherche de stage
2. **Portée autorisée** explicitée (liste blanche) — profil, compétences, stage, carrière
3. **Portée interdite** explicitée (liste noire) — devoirs, politique, santé, recettes, écriture créative, etc.
4. **Format de refus fixe** : `"Désolé, je suis InternCoach... Je ne peux pas t'aider sur [X]. 👉 Revenons à ta recherche: ..."`
5. **Anti prompt-injection** : refus explicite des tentatives de contournement
6. **Anti-hallucination** : interdiction d'inventer des offres/entreprises hors contexte RAG
7. **Tolérance linguistique** : comprend fautes, argot, darija, franglais — refus sur le sujet, pas sur la forme
8. **Anti-redondance** : n'interroge pas sur des infos déjà présentes dans le profil

### Endpoint

| Méthode | Endpoint | Auth | Body | Réponse |
|---------|----------|------|------|---------|
| POST | `/api/ai/profile-chat` | JWT student | `{ messages: [{role, content}] }` | `{ success, data: { reply, retrieved[] } }` |

### Migration Gemini → Mistral

- `backend/src/config/env.ts` : `GEMINI_API_KEY` passé en `z.string().optional()`
- L'analyse CV / matching / CV performance (Gemini) restent fonctionnels si `GEMINI_API_KEY` est fournie, sinon désactivés
- Objectif à terme : tout migrer sur Mistral (Pixtral pour la vision CV, mistral-small pour le chat/matching)

---

## Architecture Agentique (LangChain.js)

### Structure du Projet

```
backend/src/
├── agents/                          # Système Multi-Agents
│   ├── index.ts                     # Exports centralisés
│   ├── orchestrator.ts              # Coordinateur principal
│   ├── cvAnalyzerAgent.ts           # Agent analyse CV
│   ├── matcherAgent.ts              # Agent matching stages
│   ├── recommenderAgent.ts          # Agent recommandations carrière
│   └── recruiterAgent.ts            # Agent assistant recruteur
│
├── tools/                           # Outils pour les agents
│   ├── index.ts                     # Registre des outils
│   ├── humanInTheLoop.ts            # Validation humaine (HITL)
│   └── searchInternships.ts         # Recherche RAG ChromaDB
│
├── guardrails/                      # Garde-fous de sécurité
│   ├── index.ts                     # Manager centralisé
│   ├── inputValidator.ts            # Anti-injection de prompts
│   └── outputFilter.ts              # Anti-hallucination
│
├── scripts/
│   └── seedChroma.ts                # Indexation PostgreSQL → ChromaDB
│
├── routes/
│   └── agentRoutes.ts               # API agentique
│
├── controllers/                     # Contrôleurs REST
├── services/                        # Logique métier
├── middleware/                      # Auth, errors, upload
└── config/                          # Database, env
```

### Structure Frontend

```
/
├── components/
│   ├── HumanInTheLoop.tsx           # UI approbations HITL (NEW)
│   ├── Dashboard.tsx
│   ├── CVPerformanceAnalyzer.tsx
│   ├── RealInternshipBrowser.tsx
│   ├── Sidebar.tsx
│   ├── admin/                       # Composants admin
│   ├── company/                     # Composants entreprise
│   └── ui/                          # Composants réutilisables
│
├── services/
│   └── api.ts                       # Client API (+ endpoints agent)
│
├── manifest.json                    # PWA manifest
├── service-worker.js                # PWA service worker
└── index.html                       # Point d'entrée (PWA-ready)
```

### Workflow Agentique

```
┌─────────────────┐
│   Utilisateur   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│     ORCHESTRATEUR       │
│      (LangChain)        │
│  • Classifie la requête │
│  • Route vers l'agent   │
└───────────┬─────────────┘
            │
     ┌──────┴──────┬──────────────┬──────────────┐
     ▼             ▼              ▼              ▼
┌─────────┐  ┌─────────┐   ┌───────────┐  ┌───────────┐
│   CV    │  │ Matcher │   │Recommender│  │ Recruiter │
│Analyzer │  │  Agent  │   │   Agent   │  │   Agent   │
└────┬────┘  └────┬────┘   └─────┬─────┘  └─────┬─────┘
     │            │              │              │
     └────────────┴──────────────┴──────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
      ┌─────────────┐         ┌─────────────┐
      │  GUARDRAILS │         │    HITL     │
      │ Input/Output│         │  Approvals  │
      └─────────────┘         └─────────────┘
```

### Agents Implémentés

| Agent | Rôle | Capacités |
|-------|------|-----------|
| **Orchestrator** | Coordinateur | Classifie requêtes, route vers agents, gère état |
| **CV Analyzer** | Analyse CV | Parse CV, score ATS, identifie forces/faiblesses |
| **Matcher** | Matching | Recherche stages, calcule compatibilité, explique matchs |
| **Recommender** | Conseiller | Recommande compétences, parcours carrière, ressources |
| **Recruiter** | Assistant RH | Filtre candidats, génère descriptions, prépare entretiens |

### API Endpoints Agentiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/agent/chat` | Chat avec l'orchestrateur |
| POST | `/api/agent/analyze-cv` | Analyse CV via agent |
| POST | `/api/agent/match-internships` | Matching avec RAG |
| POST | `/api/agent/recommend` | Recommandations carrière |
| GET | `/api/agent/approvals` | Liste approbations HITL |
| POST | `/api/agent/approvals/:id/respond` | Répondre à une approbation |
| DELETE | `/api/agent/approvals/:id` | Annuler une approbation |
| GET | `/api/agent/admin/stats` | Stats du système agentique |

---

## Human-in-the-Loop (HITL)

Système de validation humaine pour les actions critiques.

### Backend
- ✅ File d'attente des approbations
- ✅ Niveaux de risque (low, medium, high)
- ✅ Audit trail complet
- ✅ Timeout et expiration automatique
- ✅ Statistiques et historique

### Frontend
- ✅ Composant `HumanInTheLoop.tsx` avec vue Pending + History
- ✅ Boutons Approuver / Rejeter avec motif obligatoire
- ✅ Polling auto toutes les 5 secondes
- ✅ Badges de risque colorés (low/medium/high)
- ✅ Table historique avec statuts
- ✅ Méthodes API dédiées (`getPendingApprovals`, `respondToApproval`, `cancelApproval`, `getApprovalHistory`)

### Niveaux de Risque

| Action | Niveau | Comportement |
|--------|--------|--------------|
| Lecture de données | Low | Auto-approuvé |
| Analyse CV | Low | Auto-approuvé |
| Recommandations | Medium | Notification |
| Modification profil | Medium | Approbation requise |
| Envoi de candidature | High | **Approbation requise** |
| Contact entreprise | High | **Approbation requise** |

---

## Guardrails (Sécurité IA)

### Input Validator
- ✅ Détection d'injection de prompts
- ✅ Filtrage de contenu malveillant
- ✅ Détection de données personnelles (PII)
- ✅ Rate limiting par utilisateur
- ✅ Sanitization des entrées

### Output Filter
- ✅ Détection d'hallucinations
- ✅ Filtrage de contenu inapproprié
- ✅ Masquage automatique des PII
- ✅ Score de confiance
- ✅ Ajout de disclaimers si nécessaire

---

## RAG (Retrieval-Augmented Generation)

### ChromaDB Integration
- ✅ Connexion à ChromaDB
- ✅ Structure d'indexation des stages
- ✅ Recherche sémantique
- ✅ Fallback SQL si ChromaDB indisponible
- ✅ Script de seeding PostgreSQL → ChromaDB (`seedChroma.ts`)
- ✅ Indexation en batch (50 docs/batch)
- ✅ Enrichissement des descriptions pour embeddings
- ✅ Support `--reset` pour réinitialiser l'index

---

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | React 19 + TypeScript + Tailwind CSS |
| **Backend** | Node.js (Express) + TypeScript |
| **IA Principale (Agent InternCoach)** | **Mistral AI** (`mistral-small-latest` + `mistral-embed`) |
| **IA héritée (CV Analyzer, Matching legacy)** | Google Gemini API (optionnel) |
| **Framework Agentique** | LangChain.js |
| **Orchestration** | Multi-agents (Orchestrator pattern) |
| **Base de données** | PostgreSQL + Prisma |
| **RAG vectoriel (agent InternCoach)** | In-memory cosine + `mistral-embed` |
| **Vector Database (agents legacy)** | ChromaDB (open source) |
| **Cache/Queue** | Redis |
| **Conteneurisation** | Docker + Docker Compose |
| **Sécurité IA** | Guardrails (Input/Output validators) + system prompt strict (InternCoach) |
| **Contrôle Humain** | Human-in-the-Loop system |

---

## Docker Compose Services

```yaml
services:
  db:           # PostgreSQL 16
  chromadb:     # Vector Database (RAG)
  redis:        # Cache/Queue (HITL)
  backend:      # API Node.js (port 5000)
  frontend:     # React + Nginx (port 80)
```

---

## Dépendances Principales

### Backend
```json
{
  "express": "^4.21.2",
  "@prisma/client": "^6.2.1",
  "langchain": "latest",
  "@langchain/core": "latest",
  "@langchain/google-genai": "latest",
  "chromadb": "latest",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "zod": "^3.24.1",
  "helmet": "^8.0.0",
  "multer": "^1.4.5"
}
```

### Frontend
```json
{
  "react": "^19.2.3",
  "typescript": "^5.8",
  "vite": "^6.2.0"
}
```

---

## Les 4 Impacts du Projet

### 1. Impact Scientifique
InternMatch AI contribue à la recherche en intelligence artificielle appliquée à l'éducation et au recrutement :
- **Orchestration Multi-Agents** : Démonstration pratique du pattern orchestrator avec LangChain.js pour décomposer des tâches complexes en sous-tâches spécialisées
- **RAG (Retrieval-Augmented Generation)** : Utilisation de ChromaDB pour enrichir les réponses de l'IA avec un contexte factuel, réduisant les hallucinations
- **Human-in-the-Loop** : Implémentation d'un système de validation humaine pour les décisions critiques, contribuant à la recherche sur l'IA responsable
- **Guardrails** : Mise en œuvre de mécanismes anti-injection et anti-hallucination, avançant l'état de l'art en sécurité des LLMs
- Publication potentielle des résultats et méthodologies utilisées

### 2. Impact Académique
La plateforme sert directement l'écosystème éducatif :
- **Insertion professionnelle des étudiants** : Facilite le passage du monde académique au monde professionnel via un matching intelligent
- **Analyse objective des CVs** : Fournit aux étudiants un feedback structuré (score ATS, diagnostic de contenu) pour améliorer leur candidature
- **Recommandations pédagogiques** : Suggère des compétences à développer basées sur le marché réel, orientant les choix de cours
- **Outil d'étude de cas** : Sert d'exemple concret pour l'enseignement de l'IA agentique, des guardrails et du HITL dans les cursus universitaires
- **Ouverture open source** : Encourage la collaboration étudiante et l'apprentissage par la pratique

### 3. Impact Technologique
Le projet démontre l'intégration de technologies de pointe dans une application production-ready :
- **Stack 100% open source** : LangChain.js, ChromaDB, PostgreSQL, Redis, Docker
- **Architecture microservices conteneurisée** : Docker Compose orchestrant 5 services (backend, frontend, DB, vector DB, cache)
- **IA Agentique Moderne** : Premier cas d'usage concret de multi-agents avec LangChain.js dans le contexte du recrutement
- **Sécurité avancée** : Protection contre l'injection de prompts, rate limiting, JWT, Helmet, guardrails
- **Scalabilité** : Architecture prête pour la production avec cache Redis et indexation vectorielle
- **Standards modernes** : TypeScript strict, Prisma ORM, REST API, PWA-ready

### 4. Impact Socio-économique
InternMatch AI adresse un enjeu sociétal majeur au Maroc et en Afrique :
- **Réduction du chômage des jeunes diplômés** : Facilite l'accès aux stages, première étape cruciale vers l'emploi
- **Égalité des chances** : Accessibilité 24/7, gratuite pour les étudiants, sans barrière géographique
- **Optimisation du recrutement** : Gain de temps et d'argent pour les entreprises (screening automatique, filtrage intelligent)
- **Transparence du marché du travail** : Données agrégées sur les compétences les plus demandées
- **Inclusion numérique** : Interface mobile-first (PWA) pour atteindre les étudiants sans ordinateur
- **Création de valeur locale** : Solution souveraine, données hébergées localement, sans dépendance aux géants du web
- **Employabilité améliorée** : Les recommandations guidées aident les étudiants à combler leurs lacunes pour répondre aux besoins réels du marché

---

## Commandes

```bash
# Lancer le projet
docker-compose up -d

# Vérifier les services
docker-compose ps

# Logs backend
docker-compose logs -f backend

# Compiler le backend
cd backend && npm run build

# Développement
cd backend && npm run dev

# Seeder ChromaDB avec les offres PostgreSQL
cd backend && npm run seed:chroma

# Reset + seed complet ChromaDB
cd backend && npm run seed:chroma:reset
```

---

## Fichiers Clés Récemment Ajoutés

| Fichier | Rôle |
|---------|------|
| `backend/src/services/mistralService.ts` | Client Mistral Chat + system prompt InternCoach (guardrails + tolérance linguistique) |
| `backend/src/services/embeddingService.ts` | RAG in-memory : `mistral-embed` + index stages + cosine similarity |
| `backend/src/controllers/profileChatController.ts` | Controller du chatbot (validation Zod + orchestration RAG→chat) |
| `components/ProfileChatbot.tsx` | UI chatbot InternCoach + affichage offres RAG |
| `components/Profile.tsx` | Page Profile simplifiée (chatbot uniquement) |
| `backend/src/agents/orchestrator.ts` | Orchestrateur LangChain |
| `backend/src/agents/cvAnalyzerAgent.ts` | Agent analyse CV |
| `backend/src/agents/matcherAgent.ts` | Agent matching |
| `backend/src/agents/recommenderAgent.ts` | Agent recommandations |
| `backend/src/agents/recruiterAgent.ts` | Agent recruteur |
| `backend/src/tools/humanInTheLoop.ts` | Logique HITL |
| `backend/src/tools/searchInternships.ts` | Recherche RAG |
| `backend/src/guardrails/inputValidator.ts` | Validation entrées |
| `backend/src/guardrails/outputFilter.ts` | Filtrage sorties |
| `backend/src/scripts/seedChroma.ts` | Script seeding |
| `backend/src/routes/agentRoutes.ts` | API agentique |
| `components/HumanInTheLoop.tsx` | UI approbations HITL |
| `manifest.json` | PWA manifest |
| `service-worker.js` | PWA service worker |
