# Development Plan: Full-Stack Polling App

This plan is derived from the Technical Requirements Document and outlines a phased approach to building a production-ready Polling Application.

---

## 1. Overview

| Item | Detail |
|------|--------|
| **Goal** | Build a robust, production-ready Polling Application |
| **Frontend** | React (Vite) + Tailwind CSS |
| **Backend** | Node.js (Express) + Prisma ORM |
| **Database** | PostgreSQL |
| **DevOps** | Docker, Docker Compose, GitHub Actions (CI/CD) |
| **UI** | Strict dark theme (Zinc/Slate 950, Violet accent) |

---

## 2. Phase 1: Project Setup & Monorepo Structure

**Objective:** Create a clean monorepo with frontend and backend, shared tooling, and basic run scripts.

| Task | Details |
|------|---------|
| 1.1 | Create root folder structure: `/frontend`, `/backend` |
| 1.2 | Initialize root `package.json` with workspaces (optional) or separate scripts to run frontend/backend |
| 1.3 | Add root `.gitignore` (node_modules, .env, dist, build, etc.) and optional `.env.example` |
| 1.4 | **Frontend:** Scaffold React app with Vite (`npm create vite@latest frontend -- --template react`) |
| 1.5 | **Frontend:** Install and configure Tailwind CSS with dark-mode-first config (Zinc-950 background, Violet-500 accent, Zinc-100 text) |
| 1.6 | **Backend:** Initialize Node.js project (`npm init -y`), install Express, Prisma, CORS, dotenv |
| 1.7 | **Backend:** Basic Express server with health check route (e.g. `GET /health`) |

**Deliverables:** Monorepo with runnable frontend (dev server) and backend (API server).

---

## 3. Phase 2: Database Schema & Prisma

**Objective:** Define and migrate the data model for polls, options, and votes.

| Task | Details |
|------|---------|
| 2.1 | Create Prisma schema with: **Poll** (id, question, createdAt, etc.), **Option** (id, pollId, text, voteCount), **Vote** (id, optionId, createdAt — optional for analytics) |
| 2.2 | Add relation: Poll has many Options; Option has many Votes (or store vote count on Option only for simplicity) |
| 2.3 | Configure Prisma to use PostgreSQL (DATABASE_URL in .env) |
| 2.4 | Run `prisma generate` and `prisma migrate dev` (with local Postgres or Docker Postgres) |
| 2.5 | Optionally add seed script for development (sample poll) |

**Deliverables:** Working Prisma schema, migrations, and ability to run migrations against PostgreSQL.

---

## 4. Phase 3: Backend API Development

**Objective:** Implement REST API for creating polls, fetching a poll, and submitting a vote.

| Task | Details |
|------|---------|
| 3.1 | **POST /api/polls** — Create poll with question and options. Validate **minimum 2 options**; return 400 if invalid. Return created poll with options. |
| 3.2 | **GET /api/polls/:id** — Fetch poll by ID with options (and vote counts). Return 404 if not found. |
| 3.3 | **POST /api/polls/:id/vote** — Body: `{ optionId: string }`. Validate option belongs to poll; increment vote count (Option or Vote table). Return updated poll/options. |
| 3.4 | Add request validation (e.g. express-validator or Zod) and consistent error responses (JSON with message/code) |
| 3.5 | Add CORS for frontend origin (e.g. `http://localhost:5173`) |
| 3.6 | Optional: GET /api/polls — List recent polls (for a “browse polls” page) |

**Deliverables:** All API endpoints working and testable (e.g. via Postman/curl or integration tests).

---

## 5. Phase 4: Frontend Implementation

**Objective:** Build Create Poll form, Poll View with voting, and Live Results with bar chart/percentages. Enforce dark theme.

| Task | Details |
|------|---------|
| 4.1 | **Theme & config** — Ensure Tailwind dark theme: background `#09090b` (Zinc-950), primary accent `#8b5cf6` (Violet-500), text `#f4f4f5` (Zinc-100). Use `border-zinc-800`, `rounded-xl` for components. |
| 4.2 | **Create Poll page** — Form with: poll question (input), dynamic option fields (add/remove), minimum 2 options enforced. Submit to POST /api/polls; on success redirect to poll view (e.g. `/polls/:id`). |
| 4.3 | **Poll View page** — Fetch poll via GET /api/polls/:id. Show question and options. If user has not voted: show radio/buttons to select one option and “Vote” button; on submit call POST /api/polls/:id/vote. |
| 4.4 | **Live Results** — After voting (or when opening a poll that was already voted), show bar chart or percentage breakdown of votes. Use clean, animated result bars (e.g. CSS width transition or a small chart library). |
| 4.5 | **Routing** — Set up React Router: home/create poll, poll view by id, optional list of polls. |
| 4.6 | **API client** — Centralized fetch/axios calls to backend (base URL from env). Handle loading and error states in UI. |

**Deliverables:** Full user flow: create poll → view poll → vote → see live results. UI strictly dark theme with specified “vibe”.

---

## 6. Phase 5: Dockerization

**Objective:** Containerize frontend and backend and run the stack with Docker Compose (including PostgreSQL).

| Task | Details |
|------|---------|
| 5.1 | **Frontend Dockerfile** — Multi-stage: build React app (npm run build), then serve with Nginx. Copy built assets and Nginx config (e.g. SPA fallback to index.html). |
| 5.2 | **Backend Dockerfile** — Node.js image; copy package files; npm install (production); copy source; run migrations on startup or via entrypoint; start Express server. Use ENV for DATABASE_URL. |
| 5.3 | **docker-compose.yml** — Define services: `frontend` (build from frontend Dockerfile), `backend` (build from backend Dockerfile), `db` (PostgreSQL image). Backend depends on db; frontend can depend on backend. Expose ports (e.g. 80 or 3000 for frontend, 4000 or 5000 for API). Set DATABASE_URL for backend to point to `db` service. |
| 5.4 | **Nginx** — Ensure API requests from browser are proxied to backend (or frontend uses backend URL via env). If frontend and backend are same origin in production, configure Nginx to proxy /api to backend. |
| 5.5 | Verify full stack runs with `docker-compose up --build`. |

**Deliverables:** One-command run of app + DB via Docker Compose; production-like build for frontend (Nginx).

---

## 7. Phase 6: CI/CD (GitHub Actions)

**Objective:** Automate install, lint, and Docker build on every push.

| Task | Details |
|------|---------|
| 6.1 | Create `.github/workflows/ci.yml`. |
| 6.2 | Trigger on push (and optionally PR) to main (or default branch). |
| 6.3 | Jobs: (1) Frontend: checkout, setup Node, npm install, npm run lint (if script exists), npm run build. (2) Backend: same for backend folder. (3) Docker: build frontend and backend images (and optionally run docker-compose build). |
| 6.4 | Use matrix or separate jobs for frontend/backend; fail pipeline if lint or build fails. |
| 6.5 | Optional: add test job if you add unit/integration tests later. |

**Deliverables:** On every push, CI runs install, lint, and Docker build; pipeline status visible in GitHub.

---

## 8. Phase 7: Polish & Production Readiness (Optional)

| Task | Details |
|------|---------|
| 7.1 | Add basic tests: API route tests (e.g. Supertest), frontend component or E2E tests (e.g. Vitest, React Testing Library, Playwright). |
| 7.2 | Environment config: separate .env for dev vs prod; document required env vars in README. |
| 7.3 | README: how to run locally (npm install, env setup, migrate), how to run with Docker, link to CI. |
| 7.4 | Security: rate limiting on vote endpoint, input sanitization, ensure no sensitive data in client. |

---

## 9. Suggested Order of Implementation

1. **Phase 1** — Project setup  
2. **Phase 2** — Database schema (needed for API)  
3. **Phase 3** — Backend API (needed for frontend)  
4. **Phase 4** — Frontend (can develop in parallel with Phase 3 once API contract is defined)  
5. **Phase 5** — Docker (after app works locally)  
6. **Phase 6** — CI/CD (once repo is on GitHub)  
7. **Phase 7** — As time permits  

---

## 10. Checklist Summary

- [ ] Monorepo with `/frontend` and `/backend`
- [ ] React (Vite) + Tailwind, dark theme (Zinc-950, Violet-500, Zinc-100)
- [ ] Node.js + Express + Prisma + PostgreSQL
- [ ] Prisma schema: Poll, Option, Vote (or vote count on Option)
- [ ] POST /api/polls (min 2 options), GET /api/polls/:id, POST /api/polls/:id/vote
- [ ] Create Poll form (dynamic options), Poll View, Live Results (bar/percentage)
- [ ] Dockerfiles (frontend multi-stage + Nginx, backend Node), docker-compose.yml with Postgres
- [ ] GitHub Actions: npm install, lint, docker build on push

This plan aligns with your **app_requirement.docx** and can be used as a single source of truth for development and handoff.
