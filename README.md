# InternMatch AI - Documentation Technique

Plateforme intelligente de matching stages/étudiants avec **IA Agentique**.

---

## ENSET Challenge 2026 - Phase Finale

**Objectif** : Écosystème intelligent et interactif capable de raisonner, planifier et exécuter des tâches complexes de manière autonome ou semi-autonome.





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
  - Persistance de la conversation en `localStorage` (survit au reload)
- ✅ **Pipeline Multi-Agents Mistral** (page CV Analyzer)
  - **CV Analyzer** (Few-shot + ATS) : vérifie si le CV est lisible par un ATS, extrait nom/formation/compétences/expérience
  - **Recommander** (Constrained) : enchaîné automatiquement si ATS OK, suggère ressources gratuites ou &lt; 500 MAD sur plateformes Maroc
  - **Matcher** (Chain-of-Thought) : scoring pondéré 50/30/20 (compétences/expérience/formation) vs offres
  - OCR hybride : PDF via `pdf-parse`, images via Pixtral vision
  - Injection automatique de la conversation InternCoach dans le contexte des agents
- ✅ **AI Matcher End-to-End** (page Finder)
  - Merge automatique de 3 sources : profil DB + CV Analyzer + conversation InternCoach
  - Stratégie à deux étages : RAG `mistral-embed` pour shortlister top 10 → Matcher CoT pour scorer précisément
  - Top 5 offres ranked avec justification Chain-of-Thought dépliable
  - Badges d'état "Analyse CV disponible" / "Conversation InternCoach disponible" pour transparence
  - Garde-fou : refus si profil trop vide (invite à uploader CV ou discuter avec InternCoach)
- ✅ **Human-in-the-Loop — Candidature assistée** (page Finder)
  - Agent Mistral rédige une lettre de motivation personnalisée (profil + CV + chat + offre)
  - Modal dédié avec édition libre, regénération, restauration de l'original
  - **Validation humaine obligatoire** avant envoi — aucune candidature sans click explicite
  - Badges visibles `Human-in-the-Loop` + `Agent Mistral` + bandeau d'information
  - Coexiste avec le flux manuel classique (double bouton par carte)
- ✅ **Guardrails de Sécurité IA** (infrastructure transverse)
  - **Input Guardrails** : détection prompt injection, SQLi, XSS, path traversal avant l'appel aux agents
  - **Output Filter** : masquage auto PII (`[MASKED_EMAIL]` / `[MASKED_PHONE]` / `[MASKED_CIN]` / `[MASKED_IBAN]` / `[MASKED_CARD]`)
  - **Détection de biais** : 7 catégories (GENDER, AGE, ORIGIN, DISABILITY, RELIGION, APPEARANCE, MARITAL_STATUS) avec sévérité + confidence
  - **Blocage d'actions sensibles** : l'agent ne peut pas suggérer une suppression CV/candidature/compte
  - **Confirmation destructive obligatoire** : DELETE sur candidatures/stages renvoie 428 sans header explicite

### Espace Entreprise
- ✅ Authentification entreprise (SIRET, nom, secteur)
- ✅ Formulaire de création d'offre de stage
- ✅ Liste des offres avec statistiques
- ✅ Activation/désactivation des offres
- ✅ Vue Kanban des candidatures (Nouveau → Accepté)
- ✅ Drag & drop pour changer de statut
- ✅ Notes internes par candidat
- ✅ Vue détail profil candidat
- ✅ **Agent Candidate Ranker — Classement IA automatique** (Point 2)
  - Bouton "Classer par IA" par offre
  - Matcher Chain-of-Thought exécuté en parallèle sur toutes les candidatures
  - Badge score coloré (vert/ambre/gris) sur chaque carte candidat
  - Tri automatique du plus pertinent au moins pertinent dans chaque colonne Kanban
- ✅ **Agent Contact Message — Contact en un clic** (Point 3)
  - Bouton "Contacter" sur chaque carte candidat
  - Modal avec 5 types de messages prédéfinis (invitation entretien, proposition, demande infos, relance, refus poli)
  - Message généré en un clic par l'agent Mistral, éditable avant envoi
  - Copie dans presse-papier OU enregistrement comme note interne
  - Sans formulaire complexe : manager choisit un type → message prêt

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

### Agents IA côté Entreprise — Candidate Ranker & Contact Message

Deux agents Mistral dédiés à l'espace recruteur, orchestrés sur la vue Kanban des candidatures.

**Candidate Ranker** (`backend/src/services/agents/candidateRankerAgent.ts`)
- Charge toutes les candidatures actives d'une offre (ownership check côté controller)
- Construit le profil étudiant depuis `user.profile` (fullName, education, skills, interests, location)
- Appelle le **Matcher Chain-of-Thought** en parallèle via `Promise.all` pour chaque couple (profil, offre)
- Trie décroissant par score, retourne `{ ranked: [...], failures, totalApplications }`
- Les échecs isolés sont loggés et filtrés — la liste reste exploitable même en cas de timeout partiel
- Pondération héritée du Matcher : compétences 50%, expérience 30%, formation 20%

**Contact Message** (`backend/src/services/agents/contactMessageAgent.ts`)
- Mode JSON strict : `response_format: { type: 'json_object' }` pour garantir `{ subject, body }` parseables
- 5 types avec `intent` / `tone` / `instructions` spécifiques :

| Type | Ton | Objectif |
|------|-----|----------|
| `INVITATION_INTERVIEW` | Chaleureux, professionnel | Inviter à un entretien sans fixer de date précise |
| `MAKE_OFFER` | Enthousiaste, clair | Proposer le stage sans inventer de chiffres |
| `REQUEST_INFO` | Poli, concis | Poser 1-2 questions ouvertes ciblées |
| `FOLLOW_UP` | Courtois, léger | Relancer sans s'excuser longuement |
| `POLITE_REJECTION` | Respectueux, bienveillant | Remercier + encourager sans critiquer |

- 8 contraintes permanentes dans le system prompt (longueur 80-150 mots, interdiction de promettre salaire/date/poste, signature générique `[Équipe {company}]`, anti-biais, etc.)
- Champ `extraNote` optionnel passé par le recruteur pour guider la rédaction
- **Input Guardrails** appliqués sur `extraNote`, **Output Filter** sur `subject` ET `body` (PII masking, bias detection, sensitive action blocking)

**UI entreprise** (`components/company/`)
- `ApplicationKanban.tsx` : sélecteur d'offre + bouton "Classer par IA" en header, tri auto par score dans chaque colonne
- `ApplicationCard.tsx` : badge score coloré (🟢 ≥75 · 🟡 ≥50 · ⚪ <50) + bouton "Contacter" discret
- `ContactCandidateModal.tsx` : grille de 5 boutons typés → génération immédiate → édition → copie ou enregistrement comme note (merge avec notes existantes)
- Badges `Agent Mistral · Contact` + `HITL` toujours visibles pour transparence

**Principe de design "un clic, sans formulaire complexe"** :
1. Le manager voit la carte du candidat, clique "Contacter"
2. Choisit le type de message dans une grille visuelle (pas de formulaire à remplir)
3. L'agent génère immédiatement, pas de champs obligatoires à renseigner
4. Note facultative possible avant génération pour orienter l'agent

---

### Guardrails de Sécurité IA — Détails

Trois modules indépendants dans `backend/src/guardrails/` pour sécuriser toutes les interactions LLM et les opérations destructrices. Conçus comme des checkpoints obligatoires autour de chaque appel agent.

```
Client  ───(input)──▶  Input Guardrails  ───▶  Agent Mistral  ───▶  Output Filter  ───▶  Client
                        ├─ Prompt injection                         ├─ PII masking
                        ├─ SQL injection                            ├─ Bias detection
                        ├─ XSS                                      ├─ Sensitive action block
                        └─ Path traversal                           └─ Warnings[]
```

**Input Guardrails** (`inputGuardrails.ts`)
- Détection par regex à plusieurs niveaux de sévérité (`low` / `medium` / `high` / `critical`)
- `severity >= high` → blocage immédiat avec erreur 400 contenant le détail de la menace
- `low/medium` → warning remonté au client dans le champ `guardrails.inputWarnings`
- Sanitization HTML systématique (escape `<>&"'`) sur toute entrée
- Patterns multilingues (français + anglais) pour le prompt injection

**Output Filter** (`outputFilter.ts`)
- **PII masking** : 5 types (`EMAIL`, `PHONE_MA`, `PHONE_FR`, `CIN_MA`, `IBAN`, `CREDIT_CARD`) masqués systématiquement dans la sortie LLM
- **Détection de biais** : 7 catégories avec `{ type, severity, confidence, snippet, explanation }`
  - Confidence calculée selon la spécificité du match (0.5 à 1.0)
  - Overall severity = max des findings individuelles
- **Sensitive action blocker** : si l'agent tente de recommander une action destructive (supprimer CV/candidature, bannir compte, drop table), la sortie est remplacée par un message générique et `sensitiveActionBlocked: true`

Retour structuré :
```ts
{
  cleanedOutput: string,
  piiMasked: PIIMatch[],
  biasReport: {
    detected: boolean,
    findings: BiasFinding[],
    overallSeverity: Severity | null
  },
  warnings: string[],
  sensitiveActionBlocked: boolean
}
```

**Sensitive Actions Middleware** (`sensitiveActions.ts`)
- Express middleware `requireDestructiveConfirmation`
- Applique aux routes DELETE : `/api/applications/:id`, `/api/company/internships/:id`
- Retour HTTP **428 Precondition Required** si aucune confirmation fournie
- 3 canaux de confirmation acceptés :
  - Header `x-confirm-destructive: true`
  - Body `{ confirmDestructive: true }`
  - Query `?confirm=true`
- Log console systématique (audit trail)
- Côté client : `api.deleteApplication` / `api.deleteInternship` envoient automatiquement le header

**Points d'intégration**
| Service | Input | Output |
|---------|-------|--------|
| `profileChatController` (chatbot) | ✅ scan chaque message user | ✅ filter reply |
| `mistralJsonClient` (CV Analyzer / Matcher / Recommender) | ✅ scan tous les messages | — (JSON validé par les schémas Zod en aval) |
| `coverLetterAgent` (HITL) | ✅ scan chatContext | ✅ filter draft |

Les résultats des guardrails sont exposés côté API dans la clé `guardrails` de la réponse, permettant au frontend de les afficher pour transparence.

---

### Migration Gemini → Mistral

- `backend/src/config/env.ts` : `GEMINI_API_KEY` passé en `z.string().optional()`
- L'analyse CV / matching / CV performance (Gemini) restent fonctionnels si `GEMINI_API_KEY` est fournie, sinon désactivés
- Objectif à terme : tout migrer sur Mistral (Pixtral pour la vision CV, mistral-small pour le chat/matching)

---

## Pipeline Multi-Agents Mistral (CV Analyzer + Matcher + Recommender)

Trois agents IA spécialisés chaînés après l'upload du CV, chacun utilisant une technique de *prompt engineering* différente.

### Techniques de prompting

| Agent | Technique | Why |
|-------|-----------|-----|
| **CV Analyzer** | **Few-shot learning** (2 exemples inline) | Force le modèle à copier la forme exacte attendue (JSON strict, détection ATS) |
| **Matcher** | **Chain-of-Thought** (4 étapes explicites) | Force un raisonnement auditable avec pondération compétences 50 / expérience 30 / formation 20 |
| **Recommender** | **Constrained prompting** (5 contraintes absolues) | Garantit ressources gratuites/<500 MAD, plateformes Maroc-friendly, anti-hallucination |

Tous les agents utilisent `response_format: { type: 'json_object' }` pour garantir un JSON parseable, avec une température basse (0.1–0.3) pour un output déterministe.

### Orchestrateur — flux `cv-pipeline`

```
Upload CV (PDF/image)
      │
      ▼
┌────────────────────────────────────┐
│  cvExtractorService                │
│  • PDF → pdf-parse (local)         │
│  • Image → Pixtral 12B (vision)    │
└──────────────┬─────────────────────┘
               │
               ▼ texte CV
┌────────────────────────────────────┐
│  Agent 1 — CV Analyzer (Few-shot)  │
│  → { ats_detectable, score_ats,    │
│      nom, competences, formation,  │
│      experience, raison... }       │
└──────────────┬─────────────────────┘
               │
               ├── ats_detectable = false → STOP
               │   (Recommender non exécuté)
               │
               ▼ ats_detectable = true
┌────────────────────────────────────┐
│  Agent 2 — Recommender (Constraints│
│  + transcript InternCoach chat)    │
│  → { competences_a_acquérir[],     │
│      ressources_gratuites[],       │
│      alternatives_locales[] }      │
└──────────────┬─────────────────────┘
               │
               ▼
  { analysis, recommendations, recommendationsSkipped }
```

### Helper partagé

`backend/src/services/agents/mistralJsonClient.ts` — client Mistral avec :
- `response_format: { type: 'json_object' }` (JSON mode)
- `max_tokens` adaptatifs par agent
- Parsing + validation
- Gestion d'erreurs centralisée (`AppError`)

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/ai/agents/cv-analyzer` | Agent seul — body JSON `{ cvContent }` |
| POST | `/api/ai/agents/matcher` | Agent seul — body `{ jobOffer, studentProfile?, chatContext? }` |
| POST | `/api/ai/agents/recommender` | Agent seul — body `{ studentProfile?, chatContext? }` |
| POST | `/api/ai/agents/cv-pipeline` | Pipeline complet — `multipart/form-data` avec champ `cv` |
| POST | `/api/ai/agents/find-matches` | **AI Matcher end-to-end** — RAG shortlist + CoT parallèle, body `{ cvAnalysis?, chatContext?, limit? }` |
| POST | `/api/ai/agents/draft-cover-letter` | **Agent HITL** — rédige une lettre de motivation pour validation humaine, body `{ internshipId, cvAnalysis?, chatContext? }` |
| POST | `/api/company/agents/rank-candidates` | **Ranker entreprise** — classe toutes les candidatures d'une offre par score Matcher, body `{ internshipId }` |
| POST | `/api/company/agents/draft-contact-message` | **Contact entreprise** — génère un message (5 types), body `{ applicationId, type, extraNote? }` |

Tous sont authentifiés par JWT.

### Human-in-the-Loop — Candidature assistée

Pour chaque offre matchée sur le Finder, l'étudiant a le choix entre :
- **"Postuler manuellement"** — flux standard sans lettre
- **"Candidater avec l'agent (HITL)"** — ouvre un modal où l'agent Cover Letter Writer rédige une proposition

Étapes du flux HITL :
1. Frontend appelle `POST /api/ai/agents/draft-cover-letter` avec `internshipId` (+ injection auto du CV analysis + transcript chat en localStorage)
2. Agent Mistral génère une lettre (150-250 mots, 8 contraintes strictes : structure, ton, anti-invention, pas de formules creuses)
3. Output passe par Output Filter (PII masking, détection de biais) avant retour au client
4. Modal affiche la lettre dans un textarea éditable + 4 actions : **Approuver et envoyer**, **Regénérer**, **Restaurer l'original**, **Annuler**
5. Sur approbation, le frontend appelle `POST /api/internships/:id/apply` avec la cover letter validée

**Garantie clé** : aucune candidature n'est envoyée sans click explicite de l'utilisateur sur "Approuver et envoyer". L'agent propose, l'humain dispose.

### AI Matcher End-to-End — stratégie à deux étages

L'endpoint `find-matches` combine retrieval rapide + scoring précis :

1. **Merge du profil étudiant** côté serveur : union de (profil DB) + (résultats CV Analyzer) + (interests).
2. **Shortlist** (~10 offres) via `mistral-embed` cosine similarity sur l'index in-memory des stages actifs. Fallback SQL si le RAG échoue.
3. **Scoring précis** en parallèle (`Promise.all`) : appel au Matcher agent (Chain-of-Thought, pondération 50/30/20) sur chaque offre shortlistée, avec le transcript chat injecté.
4. **Tri décroissant** + slice top N (1–10, défaut 5).
5. Retour : `{ matches: [{ id, title, companyName, score, justification, ... }], usedProfile }` (`usedProfile` = profil mergé utilisé, pour transparence côté UI).

**Garde-fou** : si le profil mergé est vide (pas de compétences, pas de formation, pas d'intérêts), erreur 400 invitant l'étudiant à uploader un CV ou discuter avec InternCoach.

### Flux de données — conversation InternCoach → agents

```
ProfileChatbot (React state)
     │
     ▼ (à chaque message)
services/chatStore.ts — localStorage
     │
     ▼ (au moment de l'appel agent)
api.runCvPipeline(file) / runMatcherAgent(...) / runRecommenderAgent(...)
     │
     ▼ (auto-injection du transcript formaté)
Backend agent service
     │
     ▼
System prompt enrichi : "Conversation InternCoach: [...]"
```

**Contrats** :
- Matcher utilise le chat comme *source complémentaire* (aspirations, contraintes, soft skills exprimées)
- Recommender utilise le chat comme *source principale* (domaine visé, lacunes évoquées par l'étudiant lui-même)
- Les deux peuvent être appelés sans chat (`{ includeChat: false }`) — fonctionnent alors sur le profil DB seul

### Fichiers clés du pipeline

| Fichier | Rôle |
|---|---|
| `backend/src/services/agents/mistralJsonClient.ts` | Helper JSON mode partagé |
| `backend/src/services/agents/cvAnalyzerAgent.ts` | Few-shot ATS |
| `backend/src/services/agents/matcherAgent.ts` | Chain-of-Thought scoring |
| `backend/src/services/agents/recommenderAgent.ts` | Constrained recommendations |
| `backend/src/services/agents/cvExtractorService.ts` | OCR hybride (pdf-parse + Pixtral) |
| `backend/src/services/agents/cvPipelineOrchestrator.ts` | Orchestrateur (extract → analyze → reco) |
| `backend/src/services/agents/findMatchesOrchestrator.ts` | Orchestrateur Matcher (RAG shortlist + CoT scoring parallèle) |
| `backend/src/controllers/agentsController.ts` | Handlers + validation Zod |
| `components/CVAnalyzerPipeline.tsx` | UI upload + affichage résultats |
| `components/InternshipFinder.tsx` | UI AI Matcher (badges + score + justification CoT dépliable) |
| `services/chatStore.ts` | Persistance localStorage conversation + formatage transcript |
| `services/cvAnalysisStore.ts` | Persistance localStorage analyse CV |

### Dépendances ajoutées

```json
{
  "pdf-parse": "^1.1.1",
  "@types/pdf-parse": "^1.1.4"
}
```

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
| `backend/src/guardrails/inputGuardrails.ts` | Input Guardrails (prompt injection, SQLi, XSS, path traversal) |
| `backend/src/guardrails/outputFilter.ts` | Output Filter (PII masking, bias detection, sensitive action block) |
| `backend/src/guardrails/sensitiveActions.ts` | Middleware confirmation destructive |
| `backend/src/guardrails/types.ts` | Enums Severity, BiasType, ThreatType, PIIKind |
| `backend/src/services/agents/coverLetterAgent.ts` | Agent HITL — lettre de motivation + filtrage |
| `backend/src/services/agents/candidateRankerAgent.ts` | Agent entreprise — classement automatique candidats (parallèle) |
| `backend/src/services/agents/contactMessageAgent.ts` | Agent entreprise — contact en 1 clic (5 types, JSON mode) |
| `backend/src/controllers/companyAgentsController.ts` | Handlers + ownership checks des agents entreprise |
| `components/HITLApplyModal.tsx` | UI validation humaine avant envoi de candidature |
| `components/company/ContactCandidateModal.tsx` | UI contact en un clic + édition + copie/note |
| `backend/src/services/agents/mistralJsonClient.ts` | Helper JSON mode partagé par les 3 agents |
| `backend/src/services/agents/cvAnalyzerAgent.ts` | Agent Few-shot + ATS |
| `backend/src/services/agents/matcherAgent.ts` | Agent Chain-of-Thought |
| `backend/src/services/agents/recommenderAgent.ts` | Agent Constrained |
| `backend/src/services/agents/cvExtractorService.ts` | OCR hybride (pdf-parse + Pixtral) |
| `backend/src/services/agents/cvPipelineOrchestrator.ts` | Orchestrateur du pipeline CV |
| `backend/src/controllers/profileChatController.ts` | Controller du chatbot (validation Zod + orchestration RAG→chat) |
| `backend/src/controllers/agentsController.ts` | Controllers des 3 agents + pipeline |
| `services/chatStore.ts` | Persistance conversation InternCoach (localStorage) |
| `components/ProfileChatbot.tsx` | UI chatbot InternCoach + affichage offres RAG |
| `components/Profile.tsx` | Page Profile simplifiée (chatbot uniquement) |
| `components/CVAnalyzerPipeline.tsx` | UI pipeline multi-agents (upload + ATS + recommandations) |
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
