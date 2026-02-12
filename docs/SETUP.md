# Setup & Troubleshooting

This document covers detailed setup for Docker and local development, plus common issues and fixes.

---

## Running with Docker

### Requirements

- Docker Desktop (or Docker Engine + Docker Compose)
- Git (to clone the repo)

### Steps

1. **Clone and enter the project**
   ```bash
   git clone https://github.com/sahilnazar/polling_app.git
   cd polling_app
   ```

2. **Build and start**
   ```bash
   docker-compose up --build
   ```

3. **Open the app**
   - **Frontend (UI):** http://localhost:3000 or http://127.0.0.1:3000
   - **Backend (API):** http://localhost:4000 (e.g. http://localhost:4000/health)

### What runs

| Service   | Image / Build      | Port  | Description                    |
|-----------|--------------------|-------|--------------------------------|
| db        | postgres:16-alpine| 5432  | PostgreSQL database           |
| backend   | Built from ./backend | 4000 | Express API + Prisma          |
| frontend  | Built from ./frontend | 3000 | Nginx serving React app       |

- The backend runs migrations on startup (`prisma migrate deploy`).
- The frontend container proxies `/api/*` to the backend, so the UI and API appear on the same origin (port 3000).

### Stopping

- **Stop containers:** `Ctrl+C` in the terminal where `docker-compose up` is running.
- **Remove containers and volumes:** `docker-compose down`  
  Use `docker-compose down -v` to also remove the database volume (all data is lost).

---

## Local Development (No Docker)

### Requirements

- Node.js 22+
- PostgreSQL 16+ (running and reachable)
- npm (comes with Node)

### 1. Database

- Create a database, e.g. `polling_app`.
- Create `backend/.env` (copy from `backend/.env.example` if needed):
  ```env
  DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/polling_app?schema=public"
  ```
  Replace `USER`, `PASSWORD`, and `HOST` with your PostgreSQL credentials and host (use `localhost` if Postgres is on the same machine).

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

- Backend runs at **http://localhost:4000**.
- Use `npm run db:migrate` for creating new migrations during development (requires DB URL in `backend/.env` and in `prisma.config.ts`).

### 3. Frontend

In a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

- Frontend runs at **http://localhost:5173**.
- Vite proxies `/api` to `http://localhost:4000`, so the app can call the API without CORS issues.

### 4. Optional: Run both from root

From the project root (after running `npm install` once at root):

```bash
npm run dev
```

This uses `concurrently` to start both frontend and backend.

---

## Troubleshooting

### Nothing shows on http://localhost:3000 (Docker)

1. **Check that containers are running**
   ```bash
   docker ps
   ```
   You should see `polling_app-frontend-1`, `polling_app-backend-1`, and `polling_app-db-1` with ports like `0.0.0.0:3000->80/tcp` and `0.0.0.0:4000->4000/tcp`.

2. **Try explicit host**
   - Use http://127.0.0.1:3000 instead of http://localhost:3000.

3. **Check API**
   - Open http://localhost:4000/health. You should get `{"status":"ok",...}`.  
   - If the API works but the app page is blank, hard refresh (Ctrl+Shift+R) and check the browser console (F12) for errors.

4. **Inspect logs**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```
   Ensure the backend shows “Backend running at http://localhost:4000” and that migrations completed. Ensure the frontend shows nginx “ready for start up”.

5. **Rebuild**
   ```bash
   docker-compose down
   docker-compose up --build
   ```
   Wait until the backend reports it is running, then try http://127.0.0.1:3000 again.

### Backend fails to start (Docker)

- **DATABASE_URL / connection errors**  
  The backend expects Postgres at `db:5432` when using Docker. Do not override `DATABASE_URL` for the backend service unless you know what you’re doing. Ensure the `db` service is healthy (`docker-compose ps`).

- **Prisma / migrations**  
  If migrations fail, check `docker-compose logs backend`. Fix any schema or DB connectivity issues, then run `docker-compose up --build` again.

### Local: “DATABASE_URL is required”

- Create `backend/.env` with a valid `DATABASE_URL` (see “Local Development” above).
- Run backend commands (`npm run dev`, `prisma migrate`, etc.) from the `backend` directory so `dotenv` can load `.env`.

### Local: Port already in use

- Change the port in:
  - **Frontend:** `frontend/vite.config.js` → `server.port` (default 5173).
  - **Backend:** set `PORT=4001` (or another port) in the environment or in `backend/src/index.ts`.
- Or stop the process that is using the port (e.g. another Docker run or Node server).

### CI (GitHub Actions) fails

- **Frontend:** Ensure `npm run lint` and `npm run build` pass locally (`cd frontend && npm run lint && npm run build`).
- **Backend:** Ensure `npx prisma generate` runs without errors (no need for a real DB in CI).
- **Docker job:** Uses the same Dockerfiles as local; if Docker build fails locally, fix the Dockerfile or build context before pushing.

---

## Environment Variables

| Variable       | Where     | Description |
|----------------|-----------|-------------|
| DATABASE_URL   | backend   | PostgreSQL connection string (required for backend). |
| PORT           | backend   | Optional; default 4000. |
| VITE_API_URL   | frontend  | Optional; leave unset for dev (Vite proxies /api). For production build, set to the API base URL if not using the same origin. |

For Docker, `DATABASE_URL` is set in `docker-compose.yml` for the backend service. For local runs, use `backend/.env` and do not commit it (it’s in `.gitignore`).
