# InternMatch AI - Documentation Technique

Plateforme intelligente de matching stages/étudiants propulsée par **Mistral AI**.

---

## ENSET Challenge 2026

**Objectif** : Ecosystème intelligent capable de raisonner, planifier et exécuter des tâches complexes de manière autonome ou semi-autonome.

| Critère | Poids |
|---------|-------|
| Innovation & Impacts | 30% |
| Qualité Technique & Orchestration | 25% |
| Sécurité & Fiabilité (Guardrails/HITL) | 20% |
| Interfaces (UI Web & Mobile) | 15% |
| Présentation & Démo Live | 10% |

---

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | React 19 + TypeScript + Tailwind CSS + Vite |
| **Backend** | Node.js (Express 4.21) + TypeScript |
| **IA Principale** | Mistral AI (`mistral-small-latest` + `mistral-embed` + `pixtral-12b-2409`) |
| **Base de données** | PostgreSQL 16 + Prisma ORM |
| **RAG vectoriel** | In-memory cosine similarity + `mistral-embed` |
| **OCR CV** | `pdf-parse` (PDF) + Pixtral vision (images) |
| **Sécurité API** | Helmet.js + Rate limiting + JWT + Zod |
| **Sécurité IA** | Input Guardrails + Output Filter + Sensitive Actions middleware |
| **Conteneurisation** | Docker + Docker Compose |
| **PWA** | manifest.json + service-worker.js |

---

## Fonctionnalités Implémentées

### Espace Étudiant
- Authentification JWT (inscription/connexion)
- **Agent InternCoach** — chatbot Mistral conversationnel pour enrichir le profil (RAG intégré)
- **Pipeline CV Analyzer** — upload CV (PDF/image) → OCR → analyse ATS (Few-shot) → recommandations (Constrained)
- **AI Matcher** — scoring pondéré des offres (Chain-of-Thought) avec shortlist RAG
- **HITL Candidature** — lettre de motivation générée par agent, validée par l'étudiant avant envoi
- Navigation des offres publiques avec filtres
- Suivi des candidatures

### Espace Entreprise
- Authentification entreprise (SIRET, nom, secteur)
- Gestion des offres (CRUD + activation/désactivation)
- Vue Kanban des candidatures (drag & drop, 7 statuts)
- **Agent Candidate Ranker** — classement automatique des candidats par score IA
- **Agent Contact Message** — rédaction en un clic (5 types : entretien, offre, infos, relance, refus)
- Notes internes par candidat

### Espace Admin
- Dashboard avec statistiques
- Gestion des utilisateurs, entreprises et stages

### Sécurité IA (Guardrails)
- **Input Guardrails** : détection prompt injection, SQLi, XSS, path traversal
- **Output Filter** : masquage PII (`[MASKED_EMAIL]`, `[MASKED_PHONE]`, `[MASKED_CIN]`, `[MASKED_IBAN]`, `[MASKED_CARD]`), détection de biais (7 catégories), blocage d'actions destructrices
- **Sensitive Actions** : middleware de confirmation sur routes DELETE (HTTP 428 sans header)

### Infrastructure
- API REST Express/TypeScript avec validation Zod
- Upload sécurisé (Multer)
- Rate limiting adaptatif (dev 1000 / prod 100 req/15min)
- Docker Compose (PostgreSQL + Backend + Frontend/Nginx)
- PWA (cache offline, notifications)

---

## Architecture des Agents IA

Tous les agents utilisent **Mistral AI** via l'API REST (`/v1/chat/completions` ou `/v1/embeddings`).

### Agents implémentés

| Agent | Technique de prompting | Fichier |
|-------|----------------------|---------|
| **InternCoach** (chatbot) | System prompt strict + RAG | `services/mistralService.ts` |
| **CV Analyzer** | Few-shot (2 exemples) + JSON mode | `services/agents/cvAnalyzerAgent.ts` |
| **Matcher** | Chain-of-Thought (4 étapes, pondération 50/30/20) | `services/agents/matcherAgent.ts` |
| **Recommender** | Constrained (5 contraintes : gratuit, Maroc, anti-hallucination) | `services/agents/recommenderAgent.ts` |
| **Cover Letter Writer** | Texte libre, 8 contraintes | `services/agents/coverLetterAgent.ts` |
| **Candidate Ranker** | Matcher en parallèle sur N candidats | `services/agents/candidateRankerAgent.ts` |
| **Contact Message** | JSON mode, 5 types avec tone/intent spécifiques | `services/agents/contactMessageAgent.ts` |

### Pipeline InternCoach (chatbot + RAG)

```
Étudiant tape un message
      │
      ▼
Input Guardrails (scan prompt injection/XSS/SQLi)
      │
      ▼
Charge profil + CV depuis Postgres
      │
      ▼
RAG : embed message (mistral-embed) → cosine vs index stages → top-3
      │
      ▼
System prompt (mission stricte + portée autorisée/interdite
              + tolérance linguistique + profil connu + contexte RAG)
      │
      ▼
mistral-small-latest (T=0.3)
      │
      ▼
Output Filter (PII masking + bias detection + action blocking)
      │
      ▼
{ reply, retrieved[], guardrails }
```

### Pipeline CV Analyzer

```
Upload CV (PDF/image)
      │
      ▼
Extraction texte : pdf-parse (PDF) ou Pixtral 12B (image)
      │
      ▼
Agent CV Analyzer (Few-shot + ATS check)
→ { nom, competences[], experience, formation, ats_detectable, score_ats }
      │
      ├── ATS NOK → STOP + raison
      │
      ▼  ATS OK
Agent Recommender (Constrained, + contexte chat InternCoach)
→ { competences_a_acquérir[], ressources_gratuites[], alternatives_locales[] }
```

### Pipeline AI Matcher

```
Étudiant clique "Lancer le matching"
      │
      ▼
Merge profil : DB + CV Analyzer (localStorage) + chat InternCoach (localStorage)
      │
      ▼
RAG shortlist : mistral-embed → cosine → top 10 stages
      │
      ▼
Matcher Chain-of-Thought en parallèle (Promise.all) sur chaque offre
  Pondération : compétences 50% / expérience 30% / formation 20%
      │
      ▼
Tri score desc → top 5
→ { matches: [{ score, justification, title, company, ... }] }
```

### HITL — Candidature assistée

```
Étudiant clique "Candidater avec l'agent (HITL)"
      │
      ▼
Agent Cover Letter Writer (profil + CV + chat + offre)
      │
      ▼
Output Filter (PII + biais)
      │
      ▼
Modal : lettre éditable + Approuver/Regénérer/Annuler
      │
      ▼ (approbation humaine obligatoire)
POST /api/internships/:id/apply avec coverLetter
```

---

## Guardrails de Sécurité

### Input Guardrails

| Menace | Sévérité | Action |
|--------|----------|--------|
| Prompt injection (fr/en) | high | Bloqué (400) |
| SQL injection | high | Bloqué (400) |
| XSS (`<script>`, event handlers) | critical | Bloqué (400) |
| Path traversal (`../`) | high | Bloqué (400) |
| Jailbreak, DAN mode | medium | Warning |

### Output Filter

| Fonction | Détail |
|----------|--------|
| PII masking | EMAIL, PHONE_MA, PHONE_FR, CIN_MA, IBAN, CREDIT_CARD |
| Détection biais | GENDER, AGE, ORIGIN, DISABILITY, RELIGION, APPEARANCE, MARITAL_STATUS |
| Action blocking | Suppression CV/candidature/compte → sortie remplacée par message générique |

### Sensitive Actions Middleware

Routes DELETE protégées par `requireDestructiveConfirmation` :
- `DELETE /api/applications/:id`
- `DELETE /api/company/internships/:id`

Renvoie 428 sans header `x-confirm-destructive: true`.

---

## Endpoints API

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription étudiant |
| POST | `/api/auth/login` | Connexion étudiant |
| POST | `/api/company/auth/register` | Inscription entreprise |
| POST | `/api/company/auth/login` | Connexion entreprise |
| POST | `/api/admin/auth/login` | Connexion admin |

### Agents IA (étudiants)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/ai/profile-chat` | Chatbot InternCoach + RAG |
| POST | `/api/ai/agents/cv-analyzer` | Analyse ATS d'un CV (texte) |
| POST | `/api/ai/agents/matcher` | Score de matching profil vs offre |
| POST | `/api/ai/agents/recommender` | Recommandations skills + ressources |
| POST | `/api/ai/agents/cv-pipeline` | Pipeline complet (upload → ATS → reco) |
| POST | `/api/ai/agents/find-matches` | Matching end-to-end (RAG + CoT) |
| POST | `/api/ai/agents/draft-cover-letter` | Brouillon lettre de motivation (HITL) |

### Agents IA (entreprise)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/company/agents/rank-candidates` | Classement candidats par score IA |
| POST | `/api/company/agents/draft-contact-message` | Message de contact en un clic |

### Données
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET/PUT | `/api/profile` | Profil étudiant |
| GET | `/api/internships` | Browse offres publiques |
| POST | `/api/internships/:id/apply` | Postuler à une offre |
| GET | `/api/company/internships` | Offres de l'entreprise |
| GET | `/api/company/applications` | Candidatures reçues |

---

## Structure du Projet

```
/
├── App.tsx                          # Routage React par userType
├── index.tsx                        # Point d'entrée
├── types.ts                         # Types TypeScript partagés
├── vite.config.ts                   # Vite + proxy API
├── docker-compose.yml               # PostgreSQL + Backend + Frontend
│
├── components/
│   ├── Auth.tsx                     # Login/register + quick-login démo
│   ├── Profile.tsx                  # Page chatbot InternCoach
│   ├── ProfileChatbot.tsx           # UI chatbot + affichage RAG
│   ├── CVAnalyzerPipeline.tsx       # Upload CV + ATS + recommandations
│   ├── InternshipFinder.tsx         # AI Matcher + cartes résultats
│   ├── HITLApplyModal.tsx           # Modal candidature assistée
│   ├── RealInternshipBrowser.tsx    # Browse offres publiques
│   ├── Dashboard.tsx                # Dashboard étudiant
│   ├── History.tsx                  # Historique candidatures
│   ├── Sidebar.tsx / Header.tsx     # Navigation
│   ├── company/
│   │   ├── ApplicationKanban.tsx    # Kanban + classement IA
│   │   ├── ApplicationCard.tsx      # Carte candidat + score + contacter
│   │   ├── ContactCandidateModal.tsx # Message en un clic
│   │   ├── CompanyDashboard.tsx     # Dashboard entreprise
│   │   ├── InternshipList.tsx       # CRUD offres
│   │   └── InternshipForm.tsx       # Formulaire offre
│   └── admin/
│       ├── AdminUsers.tsx
│       ├── AdminCompanies.tsx
│       └── AdminInternships.tsx
│
├── services/
│   ├── api.ts                       # Client API (toutes les méthodes)
│   ├── chatStore.ts                 # Persistance chat localStorage
│   └── cvAnalysisStore.ts           # Persistance CV localStorage
│
├── contexts/
│   └── AuthContext.tsx               # State auth + quickLogin
│
└── backend/
    ├── prisma/schema.prisma          # 8 modèles + 3 enums
    └── src/
        ├── app.ts                    # Express server
        ├── config/
        │   ├── env.ts                # Validation Zod des variables
        │   └── database.ts           # Client Prisma
        ├── controllers/              # 13 handlers
        ├── routes/                   # 8 fichiers de routage
        ├── middleware/               # Auth JWT, erreurs, upload
        ├── services/
        │   ├── mistralService.ts     # Client Mistral Chat (InternCoach)
        │   ├── embeddingService.ts   # RAG in-memory (mistral-embed)
        │   └── agents/              # 10 agents spécialisés
        ├── guardrails/              # Input/Output/SensitiveActions
        ├── utils/                   # JWT, password hashing
        └── scripts/
            └── seedData.ts          # Seeding DB (5 entreprises, 12 offres, 5 étudiants)
```

---

## Modèles de Données (Prisma)

| Modèle | Rôle |
|--------|------|
| `User` | Étudiant (email, passwordHash) |
| `Profile` | Profil étudiant (fullName, education, skills[], interests[], location) |
| `Company` | Entreprise (email, passwordHash, name, siret, sector, location, verified) |
| `Internship` | Offre de stage (title, description, requirements[], skills[], locationType, duration, compensation) |
| `CVAnalysis` | Résultat analyse CV (summary, extractedSkills[], careerSuggestions[], weaknesses[]) |
| `CVPerformanceAnalysis` | Analyse ATS détaillée (overallScore, atsScore, matchScore, fullAnalysis JSON) |
| `Application` | Candidature étudiant (userId, internshipId, status) |
| `CompanyApplication` | Candidature vue entreprise (userId, internshipId, status enum 7 valeurs, coverLetter, notes) |

---

## Configuration

### Variables d'environnement

```env
# Backend (.env)
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://internmatch:password@localhost:5432/internmatch
JWT_SECRET=minimum-32-caracteres
JWT_EXPIRES_IN=7d
MISTRAL_API_KEY=your-mistral-api-key
MISTRAL_MODEL=mistral-small-latest
FRONTEND_URL=http://localhost:3000
```

### Docker Compose

```yaml
services:
  db:        # PostgreSQL 16-alpine (port 5432)
  backend:   # Node.js (port 5000)
  frontend:  # React + Nginx (port 80)
```

### Commandes

```bash
# Démarrage dev local
docker compose up db              # Terminal 1 — base de données
cd backend && npm install && npx prisma db push && npm run dev  # Terminal 2
npm install && npm run dev         # Terminal 3 — frontend (port 3000)

# Seeding base de données
cd backend && npx ts-node src/scripts/seedData.ts

# Docker complet
docker compose up --build
```

### Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Étudiant | `student@test.com` | `student123` |
| Étudiant | `ahmed@test.com` | `student123` |
| Étudiant | `sara@test.com` | `student123` |
| Entreprise | `company@test.com` | `company123` |
| Admin | `admin@internmatch.com` | `admin123` |

---

## Impacts du Projet

### Impact Scientifique
- Orchestration multi-agents Mistral avec techniques de prompting spécialisées (Few-shot, Chain-of-Thought, Constrained)
- RAG in-memory avec `mistral-embed` pour la recherche sémantique
- Guardrails multicouches (input/output) pour la sécurité des LLM
- Human-in-the-Loop pour les actions critiques (candidatures)

### Impact Académique
- Facilite l'insertion professionnelle des étudiants via matching intelligent
- Analyse objective des CVs avec feedback structuré (ATS, recommandations)
- Recommandations de ressources gratuites adaptées au Maroc

### Impact Technologique
- Stack 100% open source (hors API Mistral)
- Architecture microservices conteneurisée
- 7 agents IA spécialisés avec guardrails
- PWA mobile-ready

### Impact Socio-économique
- Réduction du chômage des jeunes diplômés au Maroc/Afrique
- Accessibilité 24/7, gratuite pour les étudiants
- Optimisation du recrutement pour les entreprises
