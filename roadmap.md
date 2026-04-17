# Roadmap : InternMatch AI

Plateforme de matching stages/étudiants propulsée par Mistral AI.

---

## État Actuel

### Complété
- [x] Interface React 19 + TypeScript + Tailwind CSS
- [x] Authentification JWT multi-rôles (étudiant, entreprise, admin)
- [x] Backend Express/TypeScript + PostgreSQL + Prisma ORM
- [x] Docker Compose (PostgreSQL + Backend + Frontend/Nginx)
- [x] PWA (manifest + service worker)
- [x] Espace Entreprise complet (CRUD offres, Kanban candidatures)
- [x] Agent InternCoach — chatbot Mistral + RAG
- [x] Pipeline CV Analyzer (OCR + ATS + Recommandations)
- [x] AI Matcher end-to-end (RAG shortlist + CoT scoring)
- [x] Human-in-the-Loop (candidature assistée)
- [x] Guardrails de sécurité IA (Input + Output + Sensitive Actions)
- [x] Agents IA entreprise (classement candidats + contact en un clic)
- [x] Script de seeding (5 entreprises, 12 offres, 5 étudiants, 9 candidatures)
- [x] Quick-login démo (pré-remplissage des identifiants de test)

### À faire
- [ ] Administration avancée (modération, KPIs, exports)
- [ ] Auto-Apply intelligent
- [ ] Simulateur d'entretien IA
- [ ] Badges de compétences
- [ ] Déploiement production (VPS, SSL, CI/CD)

---

## Phase 1 : Infrastructure de base ✅

- [x] API REST Express/TypeScript
- [x] PostgreSQL + Prisma ORM (8 modèles, 3 enums)
- [x] Authentification JWT (étudiant + entreprise + admin)
- [x] Upload sécurisé (Multer)
- [x] Validation Zod + gestion d'erreurs centralisée
- [x] Rate limiting + Helmet.js
- [x] Docker Compose (3 services)
- [x] Proxy Vite `/api` → backend

---

## Phase 2 : Espace Entreprise ✅

- [x] Inscription/connexion entreprise (SIRET, nom, secteur)
- [x] Gestion des offres (CRUD + activation/désactivation)
- [x] Navigation publique des offres pour étudiants (filtres)
- [x] Candidature avec lettre de motivation
- [x] Vue Kanban 7 colonnes (NEW → ACCEPTED/REJECTED)
- [x] Drag & drop pour changer de statut
- [x] Notes internes par candidat
- [x] Vue détail profil candidat

---

## Phase 3 : Agent InternCoach (Chatbot Mistral + RAG) ✅

### Chatbot conversationnel
- [x] Client Mistral (`mistralService.ts`) — appel direct `/v1/chat/completions`
- [x] System prompt strict avec mission, portée autorisée/interdite, politique de refus, tolérance linguistique
- [x] Historique multi-tours (40 messages max), température 0.3
- [x] Injection du profil DB pour éviter les questions redondantes
- [x] Persistance chat en localStorage (`chatStore.ts`)

### RAG (Retrieval-Augmented Generation)
- [x] Embeddings via `mistral-embed` API (`embeddingService.ts`)
- [x] Index in-memory des stages actifs (top 200, batch de 32, TTL 10 min)
- [x] Cosine similarity, seuil > 0.25, top-3
- [x] Requête composée : message user + hints profil
- [x] Fallback si retrieval échoue

### Guardrails du chatbot
- [x] Portée autorisée : profil, compétences, stage, carrière
- [x] Portée interdite : devoirs, politique, santé, recettes, prompt injection
- [x] Format de refus fixe avec relance
- [x] Tolérance aux fautes d'orthographe, argot, darija, franglais

---

## Phase 4 : Pipeline Multi-Agents Mistral ✅

### Techniques de prompting

| Agent | Technique | Modèle |
|-------|-----------|--------|
| CV Analyzer | Few-shot (2 exemples) + JSON mode | mistral-small-latest |
| Matcher | Chain-of-Thought (4 étapes, pondération 50/30/20) | mistral-small-latest |
| Recommender | Constrained (5 contraintes : gratuit, Maroc, anti-hallucination) | mistral-small-latest |

### Helper partagé
- [x] `mistralJsonClient.ts` — `response_format: { type: 'json_object' }`, température basse, parsing + validation, Input Guardrails intégré

### Pipeline CV
- [x] Extracteur texte : `pdf-parse` (PDF) + Pixtral 12B (images)
- [x] Orchestrateur : extraction → CV Analyzer → (si ATS OK) Recommender
- [x] Short-circuit si CV non lisible par ATS
- [x] Injection automatique du chat InternCoach en contexte

### Pipeline AI Matcher
- [x] Merge 3 sources : profil DB + CV Analyzer (localStorage) + chat InternCoach (localStorage)
- [x] RAG shortlist top 10 → Matcher CoT en parallèle
- [x] Fallback SQL si RAG vide
- [x] Tri score desc → top N (défaut 5, max 10)
- [x] Justification formatée (string ou objet → string)
- [x] Garde-fou : erreur 400 si profil trop vide

---

## Phase 5 : Human-in-the-Loop ✅

### Agent Cover Letter Writer
- [x] `coverLetterAgent.ts` — texte libre, 8 contraintes (ton, longueur 150-250 mots, anti-invention, pas de formules creuses)
- [x] Input Guardrails sur chatContext + Output Filter sur le brouillon

### Flux HITL
- [x] Endpoint `POST /api/ai/agents/draft-cover-letter`
- [x] Modal `HITLApplyModal.tsx` : édition libre, regénération, restauration, annulation
- [x] Badges "Human-in-the-Loop" + "Agent Mistral" visibles
- [x] Aucune candidature envoyée sans click "Approuver et envoyer"
- [x] Coexistence avec flux manuel ("Postuler manuellement")

---

## Phase 6 : Guardrails de Sécurité IA ✅

### Input Guardrails (`inputGuardrails.ts`)
- [x] 14 patterns prompt injection (fr/en), 7 SQLi, 8 XSS, 1 path traversal
- [x] Sévérité low → critical, blocage si >= high
- [x] Sanitization HTML (escape `<>&"'`)
- [x] Intégré dans : profileChatController, mistralJsonClient, coverLetterAgent

### Output Filter (`outputFilter.ts`)
- [x] PII masking : 6 types (EMAIL, PHONE_MA, PHONE_FR, CIN_MA, IBAN, CREDIT_CARD)
- [x] Détection biais : 7 catégories (GENDER, AGE, ORIGIN, DISABILITY, RELIGION, APPEARANCE, MARITAL_STATUS)
- [x] Blocage actions sensibles : suppression CV/candidature/compte, bannissement
- [x] Retour structuré : `{ cleanedOutput, piiMasked[], biasReport, warnings[], sensitiveActionBlocked }`
- [x] Intégré dans : profileChatController, coverLetterAgent, contactMessageAgent

### Sensitive Actions Middleware (`sensitiveActions.ts`)
- [x] `requireDestructiveConfirmation` sur DELETE routes
- [x] HTTP 428 sans header `x-confirm-destructive: true`
- [x] Audit trail console

---

## Phase 7 : Agents IA Entreprise ✅

### Agent Candidate Ranker
- [x] `candidateRankerAgent.ts` — charge candidatures Postgres, Matcher CoT en parallèle
- [x] Ownership check (offre appartient à l'entreprise connectée)
- [x] Badge score coloré sur cartes Kanban (vert ≥75%, ambre ≥50%, gris <50%)
- [x] Tri automatique dans chaque colonne

### Agent Contact Message
- [x] `contactMessageAgent.ts` — JSON mode, 5 types prédéfinis
  - INVITATION_INTERVIEW (chaleureux)
  - MAKE_OFFER (enthousiaste)
  - REQUEST_INFO (concis)
  - FOLLOW_UP (courtois)
  - POLITE_REJECTION (respectueux)
- [x] 8 contraintes permanentes (longueur, anti-promesses, anti-biais, signature générique)
- [x] Note optionnelle du recruteur pour guider l'agent
- [x] Output Filter appliqué sur subject + body
- [x] Modal `ContactCandidateModal.tsx` : grille 5 boutons → génération → copier/enregistrer comme note

---

## Phase 8 : Données de Test & UX ✅

### Seeding (`seedData.ts`)
- [x] 5 entreprises (TechMaroc, DataLab, GreenFinance, DigitAgency, CyberProtect)
- [x] 12 offres variées (Full-Stack, DevOps, Data Science, NLP, Java, Flutter, UX/UI, SEO, Cybersécurité, Pentest)
- [x] 5 étudiants avec profils diversifiés (dev web, data science, cybersécurité, backend, marketing)
- [x] 9 candidatures auto-générées (basées sur overlap skills)
- [x] Commande : `npx ts-node src/scripts/seedData.ts`

### Quick-login
- [x] 3 boutons de pré-remplissage (Student, Entreprise, Admin) sur la page Auth
- [x] Affichage des emails de test sous chaque bouton

---

## Phases futures

### Administration avancée
- [ ] Validation des nouvelles entreprises
- [ ] Modération des offres
- [ ] Dashboard KPIs (taux de matching, secteurs, temps de recrutement)
- [ ] Exports CSV

### Fonctionnalités innovantes
- [ ] Auto-Apply intelligent (top 5 offres/semaine, lettre auto, validation HITL)
- [ ] Simulateur d'entretien IA (questions contextuelles, évaluation réponses)
- [ ] Badges de compétences (mini-tests IA, certification, expiration)
- [ ] Matching culture d'entreprise (questionnaire personnalité)

### Déploiement production
- [ ] VPS + Nginx + SSL (Let's Encrypt)
- [ ] CI/CD (GitHub Actions)
- [ ] Monitoring (logging centralisé, alerting)
- [ ] Backup automatique PostgreSQL

---

## Dépendances

### Backend
```json
{
  "express": "^4.21.2",
  "@prisma/client": "^6.2.1",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "zod": "^3.24.1",
  "helmet": "^8.0.0",
  "multer": "^1.4.5",
  "express-rate-limit": "^7.5.0",
  "pdf-parse": "^1.1.4",
  "dotenv": "^16.4.7",
  "cors": "^2.8.5"
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
