# Polling App

A full-stack polling application: create polls, vote, and view live results. Built with React (Vite), Tailwind CSS, Node.js (Express), Prisma, PostgreSQL, Docker, and GitHub Actions CI/CD.

---

## Features

- **Create polls** — Add a question and at least 2 options (add/remove options dynamically).
- **Vote** — Select one option per poll and submit a vote.
- **Live results** — See vote counts and percentages with animated bars after voting.
- **Dark theme** — Zinc-950 background and Violet-500 accent (per requirements).
- **Docker** — Run the full stack with one command.
- **CI/CD** — GitHub Actions runs tests, lint, build, and Docker build on every push to `main`/`master`.

---

## Tech Stack

| Layer     | Technology                |
|----------|---------------------------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, React Router |
| Backend  | Node.js 22, Express 5, Prisma 7, TypeScript   |
| Database | PostgreSQL 16            |
| DevOps   | Docker, Docker Compose, GitHub Actions        |

---

## Quick Start (Docker)

1. Clone the repository and go to the project folder:
   ```bash
   git clone https://github.com/sahilnazar/polling_app.git
   cd polling_app
   ```

2. Start the app:
   ```bash
   docker-compose up --build
   ```

3. Open in your browser:
   - **App:** http://localhost:3000 (or http://127.0.0.1:3000)
   - **API health:** http://localhost:4000/health

Migrations run automatically when the backend starts. Stop with `Ctrl+C`; run `docker-compose down` to remove containers.

---

## How to View / Use the App

1. **Home** — From the landing page you can:
   - **Create a poll** — Go to the form, enter a question and at least 2 options, then submit.
   - **Browse polls** — See a list of recent polls and open any to view or vote.

2. **Create a poll** — Enter the question, add/remove options (minimum 2), then click **Create poll**. You are redirected to the new poll page.

3. **Vote** — On a poll page, select one option and click **Vote**. Results (bars and percentages) appear immediately.

4. **Results** — After voting, the same page shows live results. You can also open a poll from **Browse polls** to view results without voting.

---

## Local Development (Without Docker)

### Prerequisites

- Node.js 22+
- PostgreSQL 16+ (running locally or elsewhere)

### 1. Database

Create a database (e.g. `polling_app`) and set the connection URL in `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/polling_app?schema=public"
```

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Backend runs at **http://localhost:4000**.

### 3. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** and proxies `/api` to the backend.

### 4. Run Both from Root (Optional)

From the project root (after `npm install` once):

```bash
npm run dev
```

This starts both frontend and backend using `concurrently`.

---

## Project Structure

```
polling_app/
├── frontend/                 # React (Vite) + Tailwind
│   ├── src/
│   │   ├── pages/            # Home, CreatePoll, PollList, PollView
│   │   ├── api.js            # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile            # Multi-stage: Node build → Nginx
│   └── nginx.conf            # SPA + /api proxy
├── backend/                  # Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma     # Poll, Option models
│   │   └── migrations/
│   ├── src/index.ts          # API routes
│   ├── prisma.config.ts      # Prisma 7 config (DB URL)
│   └── Dockerfile
├── docker-compose.yml        # db, backend, frontend
├── .github/workflows/ci.yml  # CI: lint, build, Docker build
├── DEVELOPMENT_PLAN.md       # Development plan and checklist
└── docs/                     # Additional documentation
    ├── API.md                # API reference
    └── SETUP.md              # Setup and troubleshooting
```

---

## API Overview

| Method | Path                  | Description                |
|--------|-----------------------|----------------------------|
| GET    | /health               | Health check               |
| GET    | /api/polls            | List recent polls (up to 50) |
| GET    | /api/polls/:id        | Get a single poll by ID    |
| POST   | /api/polls            | Create a poll (body: `question`, `options[]`) |
| POST   | /api/polls/:id/vote   | Vote (body: `optionId`)    |

See **[docs/API.md](docs/API.md)** for request/response details and examples.

---

## Testing

- **Backend:** Vitest + Supertest. API routes are tested with a mocked Prisma client (no database required).
  ```bash
  cd backend && npm test
  ```
- **Frontend:** Vitest + React Testing Library. Component tests for Home and CreatePoll.
  ```bash
  cd frontend && npm test
  ```

CI runs both test suites on every push and pull request; the workflow fails if any test fails.

---

## CI/CD

- **Workflow:** `.github/workflows/ci.yml`
- **Triggers:** Push or pull request to `main` or `master`
- **Jobs:**
  - **frontend** — `npm ci`, `npm run lint`, `npm test`, `npm run build`
  - **backend** — `npm ci`, `npx prisma generate`, `npm test`
  - **docker** — Build frontend and backend Docker images (no push)

Check run status under the **Actions** tab in the GitHub repository.

---

## Troubleshooting

- **Nothing on port 3000 (Docker)** — See [docs/SETUP.md](docs/SETUP.md#troubleshooting).
- **API or DB errors** — Ensure `DATABASE_URL` is correct and PostgreSQL is reachable; run `docker-compose logs backend` when using Docker.

---

## Documentation

- **[README.md](README.md)** (this file) — Overview, quick start, usage
- **[docs/API.md](docs/API.md)** — API reference with examples
- **[docs/SETUP.md](docs/SETUP.md)** — Detailed setup and troubleshooting
- **[DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)** — Development plan and phase checklist
