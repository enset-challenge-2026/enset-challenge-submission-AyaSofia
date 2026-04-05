# InternMatch AI

**ENSET Challenge 2026 — IA Agentique pour l'Education**
Equipe AyaSofia — Aya YOUSSFI & Sofia EL HARRASSE

---

## C'est quoi ?

InternMatch AI connecte etudiants et entreprises grace a 3 agents IA autonomes bases sur Google Gemini. L'IA analyse le CV, identifie les lacunes, et recommande les offres les plus adaptees au profil de l'etudiant — de facon autonome.

---

## Les 3 Agents IA

| Agent | Role |
|-------|------|
| CVAnalysisAgent | Analyse multimodale du CV (PDF/image) — extraction des competences, resume de profil, suggestions de carriere |
| CVPerformanceAgent | Audit ATS complet (score 0-100), diagnostic de contenu, recommandations basees sur les offres reelles du marche |
| InternshipMatchingAgent | Matching intelligent avec score de pertinence (0-100) et explication du raisonnement pour chaque recommandation |

---

## Fonctionnalites

**Espace Etudiant**
- Authentification securisee JWT
- Profil enrichi (secteurs preferes, type de stage, disponibilite)
- Upload et analyse de CV par IA (PDF, PNG, JPG)
- Audit de performance CV avec score ATS
- Matching intelligent avec les offres publiees
- Suivi des candidatures en temps reel

**Espace Entreprise**
- Gestion des offres de stage
- Pipeline Kanban de candidatures (7 statuts)
- Drag and drop + notes internes par candidat
- Dashboard avec statistiques temps reel

**Espace Administration**
- KPIs globaux de la plateforme
- Gestion des utilisateurs et entreprises
- Analytiques et journal d'activite

---

## Stack Technique

- Frontend : React + Vite + TypeScript + Tailwind CSS
- Backend : Node.js + Express + TypeScript
- Base de donnees : PostgreSQL + Prisma ORM
- IA : Google Gemini API (multimodal + JSON structure)
- Deploiement : Docker Compose + Nginx

---

## Lancer le projet

**Prerequis**
- Docker Desktop : https://www.docker.com/get-started
- Cle API Gemini : https://aistudio.google.com/apikey (gratuit)

**Installation**

```bash
git clone https://github.com/enset-challenge-2026/enset-challenge-submission-AyaSofia.git
cd enset-challenge-submission-AyaSofia
cp .env.example .env
# Ajouter GEMINI_API_KEY dans .env
docker compose up --build
```

Ouvre http://localhost dans le navigateur.

**Comptes de test**

| Role | Email | Mot de passe |
|------|-------|--------------|
| Etudiant | etudiant@test.com | password123 |
| Entreprise | rh@techmaroc.ma | password123 |

---

## Equipe AyaSofia — ENSET Challenge 2026

- Aya YOUSSFI
- Sofia EL HARRASSE
