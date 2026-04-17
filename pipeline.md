# Pipeline Architecture — InternMatch AI

---

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        COUCHE PRÉSENTATION                             │
│                                                                         │
│   ┌──────────────────────┐         ┌──────────────────────┐            │
│   │  INTERFACE ÉTUDIANT  │         │ INTERFACE ENTREPRISE │            │
│   │     (React 19)       │         │     (React 19)       │            │
│   │                      │         │                      │            │
│   │ • Profile (Chatbot)  │         │ • Dashboard          │            │
│   │ • CV Analyzer        │         │ • Gestion Offres     │            │
│   │ • AI Matcher         │         │ • Kanban Candidats   │            │
│   │ • Browse Internships │         │ • Classement IA      │            │
│   │ • HITL Candidature   │         │ • Contact 1 clic     │            │
│   └──────────┬───────────┘         └──────────┬───────────┘            │
│              │                                │                         │
│              │         REST API               │                         │
│              │     (JSON + JWT)               │                         │
│              └───────────┬────────────────────┘                         │
└──────────────────────────┼──────────────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   NGINX     │
                    │  (proxy)    │
                    └──────┬──────┘
                           │
┌──────────────────────────┼──────────────────────────────────────────────┐
│                          │     COUCHE BACKEND                           │
│                   ┌──────▼──────┐                                       │
│                   │   EXPRESS   │                                       │
│                   │ TypeScript  │                                       │
│                   └──────┬──────┘                                       │
│                          │                                              │
│          ┌───────────────┼────────────────────┐                         │
│          │               │                    │                         │
│    ┌─────▼─────┐   ┌─────▼──────┐   ┌────────▼────────┐               │
│    │   AUTH    │   │ GUARDRAILS │   │   RATE LIMIT    │               │
│    │   JWT    │   │Input/Output│   │  Helmet/CORS    │               │
│    └─────┬─────┘   └─────┬──────┘   └────────┬────────┘               │
│          │               │                    │                         │
│          └───────────────┼────────────────────┘                         │
│                          │                                              │
│              ┌───────────▼────────────┐                                 │
│              │     ORCHESTRATEUR      │                                 │
│              │    (Controllers +      │                                 │
│              │     Routes Express)    │                                 │
│              └───────────┬────────────┘                                 │
│                          │                                              │
│     ┌────────┬───────────┼───────────┬────────────┐                    │
│     │        │           │           │            │                    │
│  ┌──▼──┐ ┌───▼───┐ ┌────▼────┐ ┌────▼────┐ ┌────▼─────┐             │
│  │AGENT│ │ AGENT │ │ AGENT  │ │ AGENT  │ │  AGENT   │             │
│  │  1  │ │   2   │ │   3    │ │   4    │ │    5     │             │
│  │     │ │       │ │        │ │        │ │          │             │
│  │Inter│ │  CV   │ │Matcher │ │Recom-  │ │ Contact  │             │
│  │Coach│ │Analy- │ │  +     │ │mender  │ │ Message  │             │
│  │     │ │ zer   │ │Cover   │ │        │ │    +     │             │
│  │(RAG)│ │(Few-  │ │Letter  │ │(Con-   │ │ Ranker   │             │
│  │     │ │shot)  │ │(CoT)   │ │strained│ │(Parallel)│             │
│  └──┬──┘ └───┬───┘ └───┬────┘ └───┬────┘ └────┬─────┘             │
│     │        │         │          │            │                    │
│     └────────┴─────────┼──────────┴────────────┘                    │
│                        │                                              │
│              ┌─────────▼──────────┐                                   │
│              │   MISTRAL AI API   │                                   │
│              │                    │                                   │
│              │ • mistral-small    │                                   │
│              │ • mistral-embed    │                                   │
│              │ • pixtral-12b      │                                   │
│              └────────────────────┘                                   │
│                                                                       │
│     ┌──────────────────────────────────────────────┐                  │
│     │              COUCHE DONNÉES                   │                  │
│     │                                               │                  │
│     │  ┌──────────────┐      ┌──────────────────┐  │                  │
│     │  │ POSTGRESQL   │      │  RAG IN-MEMORY   │  │                  │
│     │  │              │      │  (ChromaDB-like)  │  │                  │
│     │  │ • User       │      │                   │  │                  │
│     │  │ • Profile    │      │ • mistral-embed   │  │                  │
│     │  │ • Company    │      │ • Cosine Sim.     │  │                  │
│     │  │ • Internship │      │ • Top-200 stages  │  │                  │
│     │  │ • Application│      │ • TTL 10 min      │  │                  │
│     │  │ • CVAnalysis │      │ • Batch 32        │  │                  │
│     │  └──────────────┘      └──────────────────┘  │                  │
│     └──────────────────────────────────────────────┘                  │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Pipeline détaillé — Flux par flux

---

### FLUX 1 : Authentification (JWT)

```
┌──────────┐    POST /api/auth/login     ┌───────────┐    bcryptjs     ┌────────────┐
│          │  ──────────────────────────▶ │           │  ────────────▶  │            │
│ React UI │    { email, password }       │  Express  │   compare()    │ PostgreSQL │
│          │                              │ Controller│                 │  (User)    │
│          │  ◀────────────────────────── │           │  ◀──────────── │            │
│          │    { token, user }           │           │   user found   │            │
└──────────┘                              └─────┬─────┘                └────────────┘
                                                │
                                         ┌──────▼──────┐
                                         │  JWT Sign   │
                                         │ { userId,   │
                                         │   email,    │
                                         │   userType }│
                                         │ secret 32+  │
                                         │ expire 7d   │
                                         └─────────────┘

Toutes les requêtes suivantes :
┌──────────┐   Authorization: Bearer {token}   ┌──────────────┐
│ React UI │ ─────────────────────────────────▶ │ authMiddleware│
│          │                                    │ • verifyToken │
│          │   401 si token invalide/expiré     │ • set req.user│
│          │ ◀───────────────────────────────── │ • userType    │
└──────────┘                                    └──────────────┘
```

---

### FLUX 2 : Agent InternCoach (Chatbot + RAG)

```
┌────────────────────┐
│ INTERFACE ÉTUDIANT │
│ ProfileChatbot.tsx │
│                    │
│ [Message user]     │
│ "je cherche un     │
│  stage data science│
│  remote 6 mois"   │
└────────┬───────────┘
         │
         │  POST /api/ai/profile-chat
         │  { messages: [{role, content}] }
         │  Authorization: Bearer {JWT}
         ▼
┌────────────────────────────────────────────────┐
│              BACKEND EXPRESS                    │
│                                                 │
│  ┌─────────────────────────────────────┐       │
│  │     profileChatController.ts        │       │
│  │                                     │       │
│  │  1. Valide body (Zod)               │       │
│  │  2. ▼ Input Guardrails              │       │
│  │     scanInput() sur chaque message  │       │
│  │     → bloque si injection détectée  │       │
│  └──────────────┬──────────────────────┘       │
│                 │                                │
│    ┌────────────▼─────────────┐                 │
│    │  Charge données Postgres │                 │
│    │  • profileService        │                 │
│    │    .getProfile(userId)   │─────────┐       │
│    │  • profileService        │         │       │
│    │    .getLatestCVAnalysis() │         │       │
│    └────────────┬─────────────┘         │       │
│                 │                        │       │
│    ┌────────────▼─────────────┐         │       │
│    │     RAG RETRIEVAL        │         │       │
│    │                          │         │       │
│    │  1. Embed message user   │         │       │
│    │     via mistral-embed    │◀────────┘       │
│    │     API                  │                  │
│    │  2. Cosine vs index      │                  │
│    │     in-memory (200       │                  │
│    │     stages, TTL 10min)   │                  │
│    │  3. Top-3 (seuil 0.25)  │                  │
│    └────────────┬─────────────┘                  │
│                 │                                 │
│    ┌────────────▼─────────────┐                  │
│    │   AGENT 1 : InternCoach  │                  │
│    │                          │                  │
│    │  Mistral Chat API        │                  │
│    │  model: mistral-small    │                  │
│    │  temp: 0.3               │                  │
│    │  max_tokens: 400         │                  │
│    │  mode: texte             │                  │
│    │                          │                  │
│    │  System prompt :         │                  │
│    │  • Mission stricte       │                  │
│    │  • Portée autorisée      │                  │
│    │  • Portée interdite      │                  │
│    │  • Tolérance linguistique│                  │
│    │  • Profil connu injecté  │                  │
│    │  • Contexte RAG injecté  │                  │
│    └────────────┬─────────────┘                  │
│                 │                                 │
│    ┌────────────▼─────────────┐                  │
│    │    Output Filter         │                  │
│    │  • maskPII()             │                  │
│    │  • detectBias()          │                  │
│    │  • detectSensitiveAction │                  │
│    └────────────┬─────────────┘                  │
│                 │                                 │
└─────────────────┼─────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────┐
│ { reply, retrieved[],          │
│   guardrails: {                │
│     inputWarnings,             │
│     outputWarnings,            │
│     biasReport,                │
│     piiMaskedCount,            │
│     sensitiveActionBlocked     │
│   }                            │
│ }                              │
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│ INTERFACE ÉTUDIANT             │
│ • Bulle réponse agent          │
│ • Encart "Offres pertinentes"  │
│   (titre + entreprise + score) │
│ • Sauvegarde localStorage      │
└────────────────────────────────┘
```

---

### FLUX 3 : Pipeline CV Analyzer + Recommender

```
┌────────────────────┐
│ INTERFACE ÉTUDIANT │
│ CVAnalyzerPipeline │
│                    │
│ [Upload CV.pdf]    │
└────────┬───────────┘
         │
         │  POST /api/ai/agents/cv-pipeline
         │  multipart/form-data { cv: File }
         │  Authorization: Bearer {JWT}
         ▼
┌──────────────────────────────────────────────────────────┐
│                    BACKEND EXPRESS                         │
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │         cvPipelineOrchestrator.ts                  │    │
│  │                                                    │    │
│  │  ÉTAPE 1 — Extraction texte                        │    │
│  │  ┌────────────────────────────────────────────┐   │    │
│  │  │ cvExtractorService.ts                       │   │    │
│  │  │                                             │   │    │
│  │  │  PDF → pdf-parse (local, rapide)            │   │    │
│  │  │  Image → Pixtral 12B (Mistral Vision API)  │   │    │
│  │  │           temp: 0, max_tokens: 2000         │   │    │
│  │  └─────────────────┬──────────────────────────┘   │    │
│  │                    │ texte brut (min 30 chars)     │    │
│  │                    ▼                               │    │
│  │  ÉTAPE 2 — Agent CV Analyzer                      │    │
│  │  ┌────────────────────────────────────────────┐   │    │
│  │  │ AGENT 2 : cvAnalyzerAgent.ts               │   │    │
│  │  │                                             │   │    │
│  │  │  Mistral Chat API (JSON mode)               │   │    │
│  │  │  temp: 0.1 | max_tokens: 600                │   │    │
│  │  │  Technique : Few-shot (2 exemples)          │   │    │
│  │  │                                             │   │    │
│  │  │  Input Guardrails via mistralJsonClient     │   │    │
│  │  └─────────────────┬──────────────────────────┘   │    │
│  │                    │                               │    │
│  │                    ▼                               │    │
│  │            ats_detectable ?                        │    │
│  │            ┌───────┴────────┐                     │    │
│  │            │                │                     │    │
│  │          FALSE            TRUE                    │    │
│  │            │                │                     │    │
│  │            ▼                ▼                     │    │
│  │   STOP + raison    ÉTAPE 3 — Recommender         │    │
│  │   (recommendations  ┌──────────────────────┐     │    │
│  │    = null)           │ AGENT 4 :            │     │    │
│  │                      │ recommenderAgent.ts  │     │    │
│  │                      │                      │     │    │
│  │                      │ JSON mode            │     │    │
│  │                      │ temp: 0.3            │     │    │
│  │                      │ max_tokens: 700      │     │    │
│  │                      │ Technique: Constrained│    │    │
│  │                      │ 5 contraintes:       │     │    │
│  │                      │ • Gratuit/<500 MAD   │     │    │
│  │                      │ • Plateformes Maroc  │     │    │
│  │                      │ • 2 alternatives     │     │    │
│  │                      │ • Anti-hallucination │     │    │
│  │                      │ • GMT+1              │     │    │
│  │                      │                      │     │    │
│  │                      │ + chatContext         │     │    │
│  │                      │   (localStorage)     │     │    │
│  │                      └──────────┬───────────┘     │    │
│  │                                 │                  │    │
│  └─────────────────────────────────┼──────────────────┘    │
│                                    │                        │
└────────────────────────────────────┼────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────┐
│ { extractedText,                                  │
│   analysis: { nom, competences[], score_ats,     │
│               ats_detectable, ... },              │
│   recommendations: { competences_a_acquérir[],   │
│                      ressources_gratuites[],      │
│                      alternatives_locales[] }     │
│ }                                                 │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ INTERFACE ÉTUDIANT                                │
│ • Score ATS (badge vert/rouge)                    │
│ • Profil extrait (nom, formation, skills)         │
│ • Compétences à acquérir                          │
│ • Ressources gratuites (Coursera, YouTube...)     │
│ • Sauvegarde analyse en localStorage              │
└──────────────────────────────────────────────────┘
```

---

### FLUX 4 : AI Matcher + HITL Candidature

```
┌────────────────────┐
│ INTERFACE ÉTUDIANT │
│ InternshipFinder   │
│                    │
│ [Lancer matching]  │
└────────┬───────────┘
         │
         │  POST /api/ai/agents/find-matches
         │  { cvAnalysis?, chatContext?, limit: 5 }
         │  (cvAnalysis + chatContext auto-injectés
         │   depuis localStorage par api.ts)
         ▼
┌──────────────────────────────────────────────────────────┐
│                    BACKEND EXPRESS                         │
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │        findMatchesOrchestrator.ts                  │    │
│  │                                                    │    │
│  │  1. MERGE profil étudiant                          │    │
│  │     ┌──────────┬──────────┬──────────┐            │    │
│  │     │ Profil DB│CV Analyzer│ Chat     │            │    │
│  │     │(Postgres)│(localStorage)│(localStorage)│     │    │
│  │     └──────────┴──────────┴──────────┘            │    │
│  │     → union des skills, fallback education/name    │    │
│  │                                                    │    │
│  │  2. RAG SHORTLIST (top 10)                         │    │
│  │     ┌──────────────────────────────────────┐      │    │
│  │     │ embeddingService.ts                   │      │    │
│  │     │ • Build query = skills + chat         │      │    │
│  │     │ • mistral-embed → vector              │      │    │
│  │     │ • Cosine vs index in-memory           │      │    │
│  │     │ • Top 10 stages                       │      │    │
│  │     │ • Fallback SQL si RAG vide            │      │    │
│  │     └──────────────────┬───────────────────┘      │    │
│  │                        │                           │    │
│  │  3. SCORING PARALLÈLE                              │    │
│  │     ┌──────────────────▼───────────────────┐      │    │
│  │     │         Promise.all([                 │      │    │
│  │     │                                       │      │    │
│  │     │   ┌─────────┐ ┌─────────┐ ┌────────┐│      │    │
│  │     │   │ AGENT 3 │ │ AGENT 3 │ │AGENT 3 ││      │    │
│  │     │   │ Matcher │ │ Matcher │ │Matcher ││      │    │
│  │     │   │ Offre 1 │ │ Offre 2 │ │Offre N ││      │    │
│  │     │   │         │ │         │ │        ││      │    │
│  │     │   │CoT 4 ét.│ │CoT 4 ét.│ │CoT 4 é││      │    │
│  │     │   │50/30/20 │ │50/30/20 │ │50/30/20││      │    │
│  │     │   └────┬────┘ └────┬────┘ └───┬────┘│      │    │
│  │     │        │           │          │      │      │    │
│  │     │   score:75    score:65   score:40    │      │    │
│  │     │                                       │      │    │
│  │     │         ])                            │      │    │
│  │     └──────────────────┬───────────────────┘      │    │
│  │                        │                           │    │
│  │  4. TRI + LIMIT                                    │    │
│  │     sort(score desc) → slice(0, limit)             │    │
│  └────────────────────────┼───────────────────────────┘    │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────┐
│ { matches: [                                      │
│   { title, company, score: 75,                    │
│     justification: "Étape 1: skills... " },       │
│   { title, company, score: 65, ... },             │
│   ...                                             │
│ ], usedProfile: { skills, education, ... } }      │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│ INTERFACE ÉTUDIANT                                │
│ • Cartes offres triées par score                  │
│ • Badge % coloré (vert/ambre/gris)                │
│ • Justification CoT dépliable                     │
│ • 2 boutons par carte :                           │
│   ┌────────────────────┐ ┌──────────────────┐    │
│   │ Candidater avec    │ │ Postuler         │    │
│   │ l'agent (HITL)     │ │ manuellement     │    │
│   └────────┬───────────┘ └──────────────────┘    │
│            │                                      │
└────────────┼──────────────────────────────────────┘
             │
             │  POST /api/ai/agents/draft-cover-letter
             │  { internshipId }
             │  (+ chatContext + cvAnalysis auto)
             ▼
┌──────────────────────────────────────────────────┐
│  AGENT 3b : Cover Letter Writer                   │
│                                                   │
│  Mistral Chat API (texte)                         │
│  temp: 0.5 | max_tokens: 600                      │
│  8 contraintes (150-250 mots, anti-invention...)  │
│  + Input Guardrails (scanInput chatContext)        │
│  + Output Filter (PII + biais)                    │
│                                                   │
│  → { draft, guardrails }                          │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│ HITLApplyModal.tsx                                │
│                                                   │
│ ┌─────────────────────────────────────────────┐  │
│ │  [Human-in-the-Loop] [Agent Mistral]         │  │
│ │                                               │  │
│ │  Lettre proposée : ____________________      │  │
│ │  |                                    |      │  │
│ │  | Madame, Monsieur,                  |      │  │
│ │  | Étudiant en Master Informatique... |      │  │
│ │  |____________________________________|      │  │
│ │                                               │  │
│ │  [Regénérer]  [Restaurer]                     │  │
│ │                                               │  │
│ │  [Annuler]          [✓ Approuver et envoyer]  │  │
│ └─────────────────────────────────────────────┘  │
│                                                   │
│  ▼ (approbation humaine OBLIGATOIRE)              │
│                                                   │
│  POST /api/internships/:id/apply                  │
│  { coverLetter: "texte approuvé" }                │
└──────────────────────────────────────────────────┘
```

---

### FLUX 5 : Agents Entreprise (Ranker + Contact)

```
┌───────────────────────┐
│ INTERFACE ENTREPRISE  │
│ ApplicationKanban.tsx │
│                       │
│ [Sélectionner offre ▼]│
│ [⚡ Classer par IA]   │
└────────┬──────────────┘
         │
         │  POST /api/company/agents/rank-candidates
         │  { internshipId }
         │  Authorization: Bearer {JWT company}
         ▼
┌──────────────────────────────────────────────────────────┐
│                    BACKEND EXPRESS                         │
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │     companyAgentsController.ts                     │    │
│  │                                                    │    │
│  │  1. Vérifie ownership (offre appartient à          │    │
│  │     l'entreprise connectée, sinon 403)             │    │
│  │                                                    │    │
│  │  2. Charge toutes les candidatures + profils       │    │
│  │     depuis PostgreSQL                              │    │
│  └──────────────────┬────────────────────────────────┘    │
│                     │                                      │
│  ┌──────────────────▼────────────────────────────────┐    │
│  │     candidateRankerAgent.ts                        │    │
│  │                                                    │    │
│  │            Promise.all([                           │    │
│  │                                                    │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │ Matcher  │  │ Matcher  │  │ Matcher  │        │    │
│  │  │Ahmed vs  │  │Sara vs   │  │Youssef vs│        │    │
│  │  │Offre X   │  │Offre X   │  │Offre X   │        │    │
│  │  │          │  │          │  │          │        │    │
│  │  │score: 82 │  │score: 45 │  │score: 71 │        │    │
│  │  └──────────┘  └──────────┘  └──────────┘        │    │
│  │                                                    │    │
│  │            ])                                      │    │
│  │                                                    │    │
│  │  Sort: 82 → 71 → 45                               │    │
│  └──────────────────┬────────────────────────────────┘    │
│                     │                                      │
└─────────────────────┼──────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│ INTERFACE ENTREPRISE                              │
│                                                   │
│ Kanban (colonnes triées par score) :              │
│                                                   │
│  NEW          │ REVIEWING     │ SHORTLISTED       │
│  ┌──────────┐ │ ┌──────────┐ │                   │
│  │ Ahmed    │ │ │ Youssef  │ │                   │
│  │ ⚡82%    │ │ │ ⚡71%    │ │                   │
│  │ [Contact]│ │ │ [Contact]│ │                   │
│  └──────────┘ │ └──────────┘ │                   │
│  ┌──────────┐ │              │                   │
│  │ Sara     │ │              │                   │
│  │ ⚡45%    │ │              │                   │
│  │ [Contact]│ │              │                   │
│  └────┬─────┘ │              │                   │
│       │       │              │                   │
└───────┼───────┴──────────────┴───────────────────┘
        │
        │  Click [Contacter]
        ▼
┌──────────────────────────────────────────────────┐
│ ContactCandidateModal.tsx                         │
│                                                   │
│  ┌──────────────┐ ┌──────────────┐               │
│  │📅 Inviter à  │ │🎁 Proposer   │               │
│  │  un entretien│ │   le stage   │               │
│  └──────────────┘ └──────────────┘               │
│  ┌──────────────┐ ┌──────────────┐               │
│  │❓ Demander   │ │🔄 Relancer   │               │
│  │  des infos   │ │              │               │
│  └──────────────┘ └──────────────┘               │
│  ┌──────────────┐                                 │
│  │😐 Refus poli │                                 │
│  └──────┬───────┘                                 │
│         │  Click (ex: Inviter entretien)           │
│         │                                         │
│         │  POST /api/company/agents/               │
│         │        draft-contact-message              │
│         │  { applicationId, type:                   │
│         │    "INVITATION_INTERVIEW" }               │
│         ▼                                          │
│  ┌──────────────────────────────────────────┐     │
│  │ AGENT 5 : contactMessageAgent.ts         │     │
│  │                                           │     │
│  │ Mistral Chat API (JSON mode)              │     │
│  │ temp: 0.4 | max_tokens: 500               │     │
│  │ Intent: "inviter à un entretien"          │     │
│  │ Tone: "chaleureux et professionnel"       │     │
│  │                                           │     │
│  │ + Input Guardrails (scanInput extraNote)  │     │
│  │ + Output Filter (PII + biais)             │     │
│  │                                           │     │
│  │ → { subject, body }                       │     │
│  └──────────────────┬───────────────────────┘     │
│                     │                              │
│  Objet: Invitation entretien — Stage Dev Full-Stack│
│  Corps: Bonjour Ahmed, ...                         │
│                                                    │
│  [📋 Copier]        [📝 Enregistrer comme note]    │
└────────────────────────────────────────────────────┘
```

---

### FLUX TRANSVERSAL : Guardrails

```
┌─────────────────────────────────────────────────────────────────┐
│                    PIPELINE GUARDRAILS                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ COUCHE 1 — INPUT GUARDRAILS (avant l'agent)              │    │
│  │                                                           │    │
│  │  Chaque message user / chatContext / extraNote passe par: │    │
│  │                                                           │    │
│  │  scanInput(text)                                          │    │
│  │  ├── Prompt injection (14 patterns fr/en)  → high/block  │    │
│  │  ├── SQL injection (7 patterns)            → high/block  │    │
│  │  ├── XSS (8 patterns)                     → critical/block│   │
│  │  └── Path traversal (1 pattern)           → high/block   │    │
│  │                                                           │    │
│  │  Si severity >= high → HTTP 400 + détail de la menace    │    │
│  │  Si severity low/medium → warning loggé, requête continue │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ COUCHE 2 — OUTPUT FILTER (après l'agent)                  │    │
│  │                                                           │    │
│  │  filterOutput(rawResponse)                                │    │
│  │  ├── maskPII()                                            │    │
│  │  │   ├── email → [MASKED_EMAIL]                           │    │
│  │  │   ├── téléphone MA → [MASKED_PHONE]                    │    │
│  │  │   ├── téléphone FR → [MASKED_PHONE]                    │    │
│  │  │   ├── CIN marocain → [MASKED_CIN]                     │    │
│  │  │   ├── IBAN → [MASKED_IBAN]                             │    │
│  │  │   └── carte bancaire → [MASKED_CARD]                   │    │
│  │  │                                                        │    │
│  │  ├── detectBias()                                         │    │
│  │  │   ├── GENDER (high)                                    │    │
│  │  │   ├── AGE (high)                                       │    │
│  │  │   ├── ORIGIN (high)                                    │    │
│  │  │   ├── DISABILITY (high)                                │    │
│  │  │   ├── RELIGION (high)                                  │    │
│  │  │   ├── APPEARANCE (medium)                              │    │
│  │  │   └── MARITAL_STATUS (high)                            │    │
│  │  │                                                        │    │
│  │  └── detectSensitiveAction()                              │    │
│  │      Si "supprimer CV/candidature/compte" détecté →       │    │
│  │      réponse remplacée par message générique              │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ COUCHE 3 — SENSITIVE ACTIONS (routes DELETE)              │    │
│  │                                                           │    │
│  │  requireDestructiveConfirmation middleware                 │    │
│  │  ├── DELETE /api/applications/:id                         │    │
│  │  └── DELETE /api/company/internships/:id                  │    │
│  │                                                           │    │
│  │  Sans header x-confirm-destructive: true → HTTP 428      │    │
│  │  Avec header → log audit + next()                         │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

### COUCHE DONNÉES — PostgreSQL + RAG

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ┌─────────────────────────────┐  ┌────────────────────────────┐ │
│  │      POSTGRESQL 16          │  │    RAG IN-MEMORY           │ │
│  │      (Prisma ORM)           │  │    (embeddingService.ts)   │ │
│  │                             │  │                            │ │
│  │  ┌───────┐   ┌──────────┐  │  │  Source: Internship table  │ │
│  │  │ User  │──▶│ Profile   │  │  │  Modèle: mistral-embed    │ │
│  │  │       │   │ • fullName│  │  │  Index: top 200 actifs     │ │
│  │  │       │   │ • skills[]│  │  │  Batch: 32 par requête     │ │
│  │  │       │   │ • education│  │  │  Cache TTL: 10 min        │ │
│  │  │       │   │ • location│  │  │  Similarité: cosine        │ │
│  │  └───┬───┘   └──────────┘  │  │  Seuil: > 0.25            │ │
│  │      │                      │  │                            │ │
│  │      ▼                      │  │  Utilisé par:              │ │
│  │  ┌───────────┐              │  │  • InternCoach (top 3)     │ │
│  │  │CVAnalysis │              │  │  • findMatches (top 10)    │ │
│  │  │ • summary │              │  │                            │ │
│  │  │ • skills[]│              │  │  Fallback:                 │ │
│  │  │ • career[]│              │  │  SQL récents si vide       │ │
│  │  └───────────┘              │  └────────────────────────────┘ │
│  │                             │                                  │
│  │  ┌──────────┐               │                                  │
│  │  │ Company  │               │                                  │
│  │  │ • name   │               │                                  │
│  │  │ • siret  │               │                                  │
│  │  │ • sector │               │                                  │
│  │  └────┬─────┘               │                                  │
│  │       │                     │                                  │
│  │       ▼                     │                                  │
│  │  ┌──────────┐               │                                  │
│  │  │Internship│───────────────┼─── données → RAG embedding      │
│  │  │ • title  │               │                                  │
│  │  │ • skills[]│              │                                  │
│  │  │ • location│              │                                  │
│  │  │ • duration│              │                                  │
│  │  └────┬─────┘               │                                  │
│  │       │                     │                                  │
│  │       ▼                     │                                  │
│  │  ┌────────────────┐         │                                  │
│  │  │CompanyApplication│       │                                  │
│  │  │ • userId        │        │                                  │
│  │  │ • internshipId  │        │                                  │
│  │  │ • status (7 val)│        │                                  │
│  │  │ • coverLetter   │        │                                  │
│  │  │ • notes         │        │                                  │
│  │  └────────────────┘         │                                  │
│  └─────────────────────────────┘                                  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Résumé : Agent → Interface → Données

| Agent | Interface | Endpoint | Base de données | Modèle Mistral |
|-------|-----------|----------|----------------|----------------|
| **1. InternCoach** | Étudiant (Profile) | `POST /api/ai/profile-chat` | Profile, CVAnalysis, Internship (RAG) | mistral-small + mistral-embed |
| **2. CV Analyzer** | Étudiant (CV Analyzer) | `POST /api/ai/agents/cv-pipeline` | — | mistral-small + pixtral-12b |
| **3. Matcher + Cover Letter** | Étudiant (Finder) | `POST /api/ai/agents/find-matches` + `draft-cover-letter` | Profile, Internship (RAG + direct) | mistral-small + mistral-embed |
| **4. Recommender** | Étudiant (CV Analyzer) | `POST /api/ai/agents/cv-pipeline` | — | mistral-small |
| **5. Contact + Ranker** | Entreprise (Applications) | `POST /api/company/agents/rank-candidates` + `draft-contact-message` | CompanyApplication, Internship, Profile | mistral-small |
