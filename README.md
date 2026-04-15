# InternMatch AI
**ENSET Challenge 2026 — IA Agentique pour l'Éducation**  
Équipe AyaSofia — Aya YOUSSFI & Sofia EL HARRASSE

---

## 🎯 C'est quoi ?

InternMatch AI est un **écosystème intelligent** qui connecte étudiants et entreprises grâce à une architecture multi-agents orchestrée par LangChain.js. Le système raisonne, planifie et exécute des tâches complexes de manière autonome ou semi-autonome : analyse de CV, audit ATS, matching sémantique par RAG, et recommandations de carrière personnalisées.

---

## 🤖 Architecture Agentique

### Workflow Multi-Agents

```
┌─────────────────┐
│   Utilisateur   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│        ORCHESTRATEUR        │
│        (LangChain.js)       │
│  • Classifie la requête     │
│  • Route vers l'agent       │
│  • Gère l'état global       │
└──────────────┬──────────────┘
               │
    ┌──────────┼──────────┬──────────────┐
    ▼          ▼          ▼              ▼
┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐
│  CV    │ │Matcher │ │Recomm-   │ │Recruiter │
│Analyzer│ │ Agent  │ │ender     │ │  Agent   │
│        │ │  +RAG  │ │  Agent   │ │          │
└────────┘ └────────┘ └──────────┘ └──────────┘
               │
   ┌───────────┴───────────┐
   ▼                       ▼
┌──────────────┐    ┌─────────────┐
│  GUARDRAILS  │    │    HITL     │
│ Input/Output │    │  Approvals  │
└──────────────┘    └─────────────┘
```

### Les 5 Agents

| Agent | Rôle | Capacités |
|-------|------|-----------|
| **Orchestrator** | Coordinateur | Classifie requêtes, route vers agents, gère état |
| **CVAnalyzerAgent** | Analyse CV | Parse CV multimodal (PDF/image), score ATS, forces/faiblesses |
| **MatcherAgent** | Matching RAG | Recherche sémantique ChromaDB, score pertinence 0-100 |
| **RecommenderAgent** | Conseiller | Compétences manquantes, parcours carrière, ressources |
| **RecruiterAgent** | Assistant RH | Filtre candidats, génère descriptions, prépare entretiens |

---

## 🔒 Sécurité & Fiabilité

### Human-in-the-Loop (HITL)

Points de contrôle humains pour les actions critiques :

| Action | Niveau de Risque | Comportement |
|--------|------------------|--------------|
| Lecture de données | Low | Auto-approuvé |
| Analyse CV | Low | Auto-approuvé |
| Recommandations | Medium | Notification |
| Modification profil | Medium | Approbation requise |
| Envoi de candidature | **High** | **Approbation obligatoire** |
| Contact entreprise | **High** | **Approbation obligatoire** |

### Guardrails (Garde-fous IA)

**Input Validator**
- Détection d'injection de prompts
- Filtrage de contenu malveillant
- Détection de données personnelles (PII)
- Rate limiting par utilisateur
- Sanitization des entrées

**Output Filter**
- Détection d'hallucinations avec score de confiance
- Filtrage de contenu inapproprié
- Masquage automatique des PII
- Ajout de disclaimers si nécessaire

---

## 🔍 RAG Agentique (ChromaDB)

Système de Retrieval-Augmented Generation pour un matching sémantique :

- Indexation vectorielle des offres de stages
- Embedding des profils étudiants
- Recherche sémantique (similarité cosinus)
- Fallback automatique vers SQL si ChromaDB indisponible
- Mise à jour dynamique des embeddings à chaque nouvelle offre

---

## ✨ Fonctionnalités

**Espace Étudiant**
- Authentification sécurisée JWT
- Profil enrichi (secteurs préférés, type de stage, disponibilité)
- Upload et analyse de CV par IA (PDF, PNG, JPG)
- Audit de performance CV avec score ATS (0-100)
- Matching intelligent sémantique avec les offres publiées
- Suivi des candidatures en temps réel

**Espace Entreprise**
- Gestion des offres de stage
- Pipeline Kanban de candidatures (7 statuts)
- Drag and drop + notes internes par candidat
- Dashboard avec statistiques temps réel

**Espace Administration**
- KPIs globaux de la plateforme
- Gestion des utilisateurs et entreprises
- Analytiques et journal d'activité
- Stats du système agentique (`/api/agent/admin/stats`)

---

## 🌍 Analyse des 4 Impacts

### Impact Scientifique
Orchestration hiérarchique multi-agents avec raisonnement chaîné (Chain-of-Thought via Gemini). Chaque agent décompose une tâche complexe en sous-tâches spécialisées, permettant un raisonnement structuré impossible avec un appel LLM unique.

### Impact Académique
Réduction significative du temps de recherche de stage pour les étudiants. Le feedback IA personnalisé améliore la qualité des CVs et augmente les chances d'acceptation. Les recommandations de compétences orientent les étudiants vers des formations complémentaires adaptées au marché.

### Impact Technologique
Intégration d'un RAG agentique, d'un système HITL et de Guardrails dans une seule plateforme éducative. Architecture multi-agents LangChain.js + ChromaDB + Redis inédite dans le domaine de l'insertion professionnelle au Maroc.

### Impact Socio-Économique
Meilleure insertion professionnelle des étudiants marocains. Gain de temps pour les recruteurs grâce à un filtrage intelligent des candidats. Accessibilité à un outil d'orientation professionnelle de qualité sans coût pour l'étudiant.

---

## 📡 API Agentique

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/agent/chat` | Chat avec l'orchestrateur |
| POST | `/api/agent/analyze-cv` | Analyse CV via agent |
| POST | `/api/agent/match-internships` | Matching sémantique RAG |
| POST | `/api/agent/recommend` | Recommandations carrière |
| GET | `/api/agent/approvals` | Liste approbations HITL |
| POST | `/api/agent/approvals/:id/respond` | Approuver / Rejeter |
| DELETE | `/api/agent/approvals/:id` | Annuler une approbation |
| GET | `/api/agent/admin/stats` | Stats du système agentique |

---

## 🛠 Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | React 19 + Vite + TypeScript + Tailwind CSS |
| **Backend** | Node.js + Express + TypeScript |
| **IA Principale** | Google Gemini API (multimodal) |
| **Framework Agentique** | LangChain.js |
| **Orchestration** | Multi-agents (Orchestrator pattern) |
| **Base de données** | PostgreSQL + Prisma ORM |
| **Vector Database** | ChromaDB (open source) |
| **Cache / Queue** | Redis |
| **Sécurité IA** | Guardrails (Input/Output validators) |
| **Contrôle Humain** | Human-in-the-Loop system |
| **Déploiement** | Docker Compose + Nginx |

### Services Docker

```yaml
services:
  db:        # PostgreSQL 16
  chromadb:  # Vector Database (RAG)
  redis:     # Cache / Queue (HITL)
  backend:   # API Node.js — port 5000
  frontend:  # React + Nginx — port 80
```

---

## 🚀 Lancer le projet

**Prérequis**
- [Docker Desktop](https://www.docker.com/get-started)
- [Clé API Gemini](https://aistudio.google.com/apikey) (gratuit)

**Installation**

```bash
git clone https://github.com/enset-challenge-2026/enset-challenge-submission-AyaSofia.git
cd enset-challenge-submission-AyaSofia
cp .env.example .env
# Ajouter GEMINI_API_KEY dans .env
docker compose up --build
```

Ouvrir [http://localhost](http://localhost) dans le navigateur.

---

## 🔑 Comptes de test

👤 **Étudiant**
| Champ | Valeur |
|-------|--------|
| Email | student@test.com |
| Mot de passe | student123 |

🏢 **Entreprise**
| Champ | Valeur |
|-------|--------|
| Email | company@test.com |
| Mot de passe | company123 |

🔧 **Administrateur**
| Champ | Valeur |
|-------|--------|
| Email | admin@internmatch.com |
| Mot de passe | admin123 |

---

## 📁 Structure du Projet

```
backend/src/
├── agents/
│   ├── orchestrator.ts       # Coordinateur principal (LangChain)
│   ├── cvAnalyzerAgent.ts    # Agent analyse CV
│   ├── matcherAgent.ts       # Agent matching + RAG
│   ├── recommenderAgent.ts   # Agent recommandations carrière
│   └── recruiterAgent.ts     # Agent assistant recruteur
├── tools/
│   ├── humanInTheLoop.ts     # Validation humaine (HITL)
│   └── searchInternships.ts  # Recherche sémantique ChromaDB
├── guardrails/
│   ├── inputValidator.ts     # Anti-injection de prompts
│   └── outputFilter.ts       # Anti-hallucination
└── routes/
    └── agentRoutes.ts        # Endpoints API agentiques
```

---

## 👩‍💻 Équipe AyaSofia — ENSET Challenge 2026

**Aya YOUSSFI & Sofia EL HARRASSE**  
École Normale Supérieure de l'Enseignement Technique de Mohammedia  
Université Hassan II de Casablanca
