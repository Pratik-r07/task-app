# Task Ledger — 3-Tier Reference App

A working example of the classic 3-tier architecture:

| Tier | Tech | Responsibility |
|---|---|---|
| **Presentation** | React (Vite) | UI, calls the API, renders state |
| **Application / Logic** | Flask + SQLAlchemy | REST API, validation, business rules |
| **Data** | PostgreSQL | Persistent storage |

The example app is a task manager ("Task Ledger") with full CRUD, status/priority fields, and filtering — enough surface area to show how the tiers talk to each other. Swap the `tasks` table and routes for your own domain and the rest of the wiring (CORS, env config, Docker, the API client pattern in React) carries over directly.

## Project layout

```
task-app/
├── backend/                 # Flask API (tier 2)
│   ├── app/
│   │   ├── __init__.py      # app factory
│   │   ├── extensions.py    # db = SQLAlchemy()
│   │   ├── models.py        # Task model
│   │   └── routes.py        # /api/tasks endpoints
│   ├── migrations/
│   │   └── init.sql         # schema + seed data
│   ├── config.py
│   ├── run.py                # entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                 # React app (tier 1)
│   ├── src/
│   │   ├── api/tasks.js      # fetch wrapper for the Flask API
│   │   ├── components/       # TaskForm, TaskEntry, FilterBar
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
└── docker-compose.yml         # runs all three tiers together
```

## Option A — Run everything with Docker (easiest)

Requires Docker + Docker Compose.

```bash
cd task-app
docker compose up --build
```

This starts:
- **PostgreSQL** on `localhost:5432`, auto-seeded from `backend/migrations/init.sql`
- **Flask API** on `http://localhost:5000`
- **React app** on `http://localhost:5173`

Open `http://localhost:5173`. That's it.

To stop: `docker compose down` (add `-v` to also wipe the database volume).

## Option B — Run each tier manually

### 1. PostgreSQL

Install Postgres locally or run just the DB container:

```bash
docker run --name taskdb -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=taskdb -p 5432:5432 -d postgres:16-alpine
psql -h localhost -U postgres -d taskdb -f backend/migrations/init.sql
```

### 2. Flask backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # adjust DB credentials if needed
export $(cat .env | xargs)  # or use python-dotenv / your shell's env loading
python run.py
```

API now runs at `http://localhost:5000`. Sanity check:

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/tasks
```

### 3. React frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. It talks to the API at `http://localhost:5000/api` by default — override with a `.env` file containing `VITE_API_URL=http://your-api-host/api` if needed.

## API reference

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | List tasks. Optional `?status=` and `?priority=` filters |
| GET | `/api/tasks/<id>` | Get one task |
| POST | `/api/tasks` | Create a task — body: `{title, description?, status?, priority?}` |
| PATCH/PUT | `/api/tasks/<id>` | Update a task (any subset of fields) |
| DELETE | `/api/tasks/<id>` | Delete a task |

`status` ∈ `pending | in_progress | completed`. `priority` ∈ `low | medium | high`.

## Why this structure

- **Tiers are physically separable.** The frontend only knows the API's base URL; the API only knows the DB connection string. You can scale, redeploy, or swap any one tier without touching the others.
- **The Flask app uses the factory pattern** (`create_app()`) so config and the database can be swapped per-environment (tests use SQLite in-memory, exactly as was done to verify this build).
- **CORS is explicit and configurable** via `CORS_ORIGINS`, not wide open — tighten it to your real frontend origin before deploying.
- **Validation lives in the API**, not just the UI, since the UI is not the only possible client.

## Next steps you'll likely want

- Add authentication (Flask-JWT-Extended or session-based) before exposing this beyond local use.
- Add Alembic for schema migrations instead of the single `init.sql` once the schema needs to evolve.
- Add pagination to `GET /api/tasks` once the table grows.
- Put the frontend behind a real web server / CDN and the API behind a WSGI server (the Dockerfile already uses `gunicorn`) plus a reverse proxy (nginx/Caddy) for TLS.
