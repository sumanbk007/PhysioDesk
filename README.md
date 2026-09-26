# PhysioDesk

Clinic management system for **Sahayatri Physio** — digitizes the front-desk
and clinical workflow of a physiotherapy clinic.

**Monorepo layout:**

- `server/` — FastAPI backend (Python 3.12 + PostgreSQL 16)
- `client/` — Next.js 15 frontend (TypeScript + App Router)
- `docker-compose.yml` — one-command startup for Postgres and the backend

---

## What This Is

A full-stack implementation of the PhysioDesk clinic management system
covering six modules from the assignment brief:

1. **Dashboard** — today's stats, therapist capacity, recent patients
2. **Patients** — CRUD, filters, and a routed 6-tab profile
3. **Schedule** — day-view grid derived from working hours; book / cancel / reschedule
4. **Billing** — invoices, partial payments, refunds, printable receipts
5. **Notifications** — reminders with simulated delivery via an abstract sender
6. **Therapists** — CRUD, per-date schedule overrides, delete guard

The front desk (single role) uses it to register patients, book appointments,
record clinical notes and payments, and send reminders.

---

## Tech Stack

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| Frontend     | Next.js 15 (App Router) + TypeScript        |
| UI           | Ant Design 5 + Tailwind CSS + SCSS modules  |
| Server state | TanStack Query                              |
| Client state | Zustand (auth token only)                   |
| Forms        | React Hook Form + Zod                       |
| Charts       | Recharts                                    |
| Backend      | FastAPI + Pydantic v2                       |
| Database     | PostgreSQL 16                               |
| ORM          | SQLAlchemy 2.x                              |
| Migrations   | Alembic                                     |
| Auth         | JWT (HS256) + bcrypt                        |
| Dev deps     | Poetry                                      |
| Docker build | pip + `requirements.txt`                    |
| Testing      | Pytest + FastAPI TestClient                 |
| Container    | Docker + Docker Compose (backend + DB only) |

---

## Requirements

- **Docker** and **Docker Compose** — for the backend and database
- **Node.js 18+** and **npm** — for the frontend
- Optionally for backend dev on the host: **Python 3.11+** and **Poetry**

---

## Quick Start

Two terminals. That's it.

### Terminal 1 — Backend + Database (Docker)

```bash
git clone <this-repo>
cd physiodesk

# Start Postgres + backend
docker compose up -d

# Wait for both containers to be healthy (~15s)
docker compose ps

# Seed demo data (first time only)
docker compose exec backend python -m scripts.seed
```

Backend runs on http://localhost:8000.

- **API docs:** http://localhost:8000/docs
- **Health:** http://localhost:8000/health

### Terminal 2 — Frontend (host)

```bash
cd physiodesk/client
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on http://localhost:3000.

**Login credentials** (from the seed):

- Username: `frontdesk`
- Password: `frontdesk123`

---

## What You Should See

After logging in, the sidebar has six links:

- **Dashboard** — today's numbers + therapist capacity strip + recent patients
- **Patients** — searchable/filterable table; click any row for the profile
- **Schedule** — day grid; click an empty slot to book, a booked slot to
  view / cancel / reschedule
- **Billing** — billing stats + invoice list with search and filters
- **Notifications** — reminders list with type/status/channel filters
- **Therapists** — searchable list; click a therapist for their profile

Try this flow to see everything:

1. **Patients** → click a patient → tabs: Overview / Reports / Sessions /
   Notes / Progress / Billing
2. **Schedule** → navigate a day → click a `+ Book` slot → book an appointment
3. **Patients** → patient profile → **Notes** tab → **New** → create a note
4. Same patient → **Progress** tab → see pain / ROM / strength charts
5. **Billing** → open an invoice → **Record payment**
6. **Notifications** → **New reminder**

---

## Running the Backend Without Docker

If you prefer to run the backend on the host while Postgres stays in Docker:

```bash
# 1. Start Postgres only
docker compose up -d db

# 2. Set up and run the backend
cd server
poetry install
cp .env.example .env
poetry run alembic upgrade head
poetry run python -m scripts.seed
poetry run uvicorn app.main:app --reload
```

The frontend runs the same as before (`cd client && npm run dev`).

---

## Environment Variables

### Backend — `server/.env`

Copy from `server/.env.example`.

| Variable                      | Purpose                           | Default                      |
| ----------------------------- | --------------------------------- | ---------------------------- |
| `APP_NAME`                    | Display name                      | `PhysioDesk`                 |
| `ENVIRONMENT`                 | `development` / `production`      | `development`                |
| `DEBUG`                       | SQL echo + verbose logs           | `true`                       |
| `SECRET_KEY`                  | JWT signing key (min 16 chars)    | (required)                   |
| `ALGORITHM`                   | JWT algorithm                     | `HS256`                      |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime                    | `1440`                       |
| `DATABASE_URL`                | SQLAlchemy connection string      | `postgresql+psycopg2://...`  |
| `CORS_ORIGINS`                | Comma-separated allowed origins   | `http://localhost:3000`      |
| `SEED_ADMIN_USERNAME`         | Username for the seeded admin     | `frontdesk`                  |
| `SEED_ADMIN_PASSWORD`         | Password for the seeded admin     | `frontdesk123`               |
| `SEED_ADMIN_FULLNAME`         | Display name for the seeded admin | `Sunita (Front Desk)`        |
| `UPLOAD_DIR`                  | Directory for uploaded reports    | `app/static/uploads/reports` |
| `MAX_UPLOAD_MB`               | File size limit (MB)              | `10`                         |

### Frontend — `client/.env.local`

Copy from `client/.env.example`.

| Variable                   | Purpose              | Default                        |
| -------------------------- | -------------------- | ------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

---

## Seed Script

Idempotent — running it twice will not create duplicates.

```bash
# If backend runs in Docker:
docker compose exec backend python -m scripts.seed

# If backend runs on host:
cd server
poetry run python -m scripts.seed
```

### Reset and re-seed

```bash
docker compose exec backend python -m scripts.reset
docker compose exec backend python -m scripts.seed
```

The seed creates:

- 1 front-desk user (`frontdesk` / `frontdesk123`)
- 3 therapists with different specialties and working hours
- 5 patients with varied conditions and packages
- Appointments across past, present, and future dates
- Clinical notes with pain / ROM / strength trends (some with milestones)
- Invoices with paid / partial / due statuses and a payment ledger
- Notification reminders in various states

---

## API Reference

FastAPI generates interactive documentation automatically:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI spec:** http://localhost:8000/openapi.json

Every route is grouped by tag (Auth, Patients, Therapists, Schedule,
Billing, Notifications, Clinical Notes, Progress, Dashboard). Only
`/health` and `POST /api/v1/auth/login` are public; all other routes
require a Bearer token issued by the login endpoint.

### Sample requests

```bash
# Log in
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"frontdesk","password":"frontdesk123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# List patients
curl -s "http://localhost:8000/api/v1/patients?page=1&page_size=10" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## Testing

The backend has a pytest suite that hits a real Postgres database.

```bash
cd server
poetry run pytest                         # full suite
poetry run pytest tests/test_patients.py  # one file
poetry run pytest -k billing              # filter by name
```

Make sure Postgres is running first (`docker compose up -d db`). Tests use
a transactional session and roll back.

---

## Common Tasks

| Task                        | Command                                               |
| --------------------------- | ----------------------------------------------------- |
| Start DB + backend          | `docker compose up -d`                                |
| Stop everything (keep data) | `docker compose down`                                 |
| Stop and wipe data          | `docker compose down -v`                              |
| View backend logs           | `docker compose logs -f backend`                      |
| Shell into the backend      | `docker compose exec backend bash`                    |
| Seed demo data              | `docker compose exec backend python -m scripts.seed`  |
| Reset DB                    | `docker compose exec backend python -m scripts.reset` |
| Rebuild the backend image   | `docker compose build --no-cache backend`             |
| Run migrations (host)       | `cd server && poetry run alembic upgrade head`        |
| Run tests (host)            | `cd server && poetry run pytest`                      |
| Start frontend dev server   | `cd client && npm run dev`                            |

---

## Architecture

```
physiodesk/
├── server/           FastAPI backend
├── client/           Next.js frontend
└── docker-compose.yml
```

### Backend layers

```
routes        → HTTP endpoints (thin)
services      → business logic, testable without HTTP
repositories  → DB queries only
models        → SQLAlchemy ORM
schemas       → Pydantic v2 request/response shapes
```

### Frontend structure

```
app/            Next.js routing only
features/*/     one folder per domain (api, queries, components)
components/ui/  design system primitives wrapping Ant Design
services/       HTTP client, query keys, storage
```

### Business invariants (enforced in the service layer)

- `patient.sessions_used` equals `COUNT(clinical_notes)` for that patient,
  recomputed on every note create/delete.
- `invoice.paid_amount` equals `SUM(payments.amount)`, recomputed on every
  payment create/delete.
- `invoice.status` (`Due` / `Partial` / `Paid` / `Refunded`) is derived from
  the payment ledger, never edited directly.

---

## Assumptions & Design Decisions

1. **Single clinic, single role** (`front_desk`). No multi-tenancy or RBAC.
2. **One assigned therapist per patient.** Reassignment is a manual edit.
3. **Package is free text** on `patients.package`. No separate table.
4. **`sessions_used` and `paid_amount` are denormalized.** Recomputed on
   every mutation, never incremented, so they cannot drift.
5. **`invoice.status` is derived**, never user-editable.
6. **Payments are append-only.** Refunds are negative-amount rows with a
   reason note. Rows are never edited.
7. **Clinical notes may exist without an appointment** (walk-ins, phone
   consults); `appointment_id` is nullable.
8. **All timestamps are stored as UTC.** Frontend renders in the browser's
   timezone.
9. **Money uses `NUMERIC(10, 2)`**, never float.
10. **Report files are stored on local disk**, behind a
    `file_storage_service` abstraction that can be swapped for S3/R2 later.
11. **Notification delivery is simulated.** The default `ConsoleSender`
    logs to stdout. The `NotificationSender` interface lets a real provider
    (Twilio, Sparrow SMS, etc.) be plugged in by changing one line.
12. **Enums are stored as `VARCHAR`**, validated by Pydantic, not as
    PostgreSQL native enums. Keeps migrations additive.
13. **`bcrypt` is pinned to `<4.1`** because `passlib` 1.7.4 reads
    `bcrypt.__about__`, removed in bcrypt 4.1.
14. **Schedule slots are derived, never stored.** Computed on demand from
    therapist working hours, per-date overrides, and existing bookings.
15. **Two dependency managers.** Poetry for local development; pip +
    `requirements.txt` in the Docker build. Poetry in a container hit
    lock-file and keyring issues; pip is more predictable at build time.
16. **Reserved email TLDs are accepted.** A custom `DemoEmail` type runs
    `email-validator` with `test_environment=True` so seeded
    `@physiodesk.test` addresses validate.
17. **Frontend is not containerized.** It runs on the host with
    `npm run dev`. `docker compose` starts the DB and backend only.
    Rationale: Next.js inlines `NEXT_PUBLIC_*` vars at build time (forcing
    rebuilds on every API URL change), and static prerendering during
    `next build` hits `useSearchParams` errors on several pages. Keeping
    the frontend on the host gives faster iteration without sacrificing
    the one-command backend setup.

---

## Known Limitations

- **No refresh tokens.** JWT expires after 24h; the user logs in again.
- **Notification delivery is simulated.** No real SMS / WhatsApp / Viber.
- **Report uploads are local disk only.** No virus scan or image processing.
- **No email verification or password reset.**
- **Invoice number generation** could theoretically race under high
  concurrency. A DB unique constraint prevents duplicates, but a
  service-level retry loop would be needed for full safety.
- **Report file deletion is not atomic with the DB row deletion.** A
  crash between the two leaves an orphan file on disk.
- **No rate limiting.**

---

## What I'd Do With More Time

- Add refresh tokens with short-lived access tokens.
- Soft delete for patients and invoices.
- Server-side caching for dashboard aggregates.
- S3-backed report storage with signed download URLs.
- Real notification providers behind the existing interface.
- Playwright end-to-end tests covering login → book → pay → notify.
- GitHub Actions CI: lint, test, build, deploy on push.
- Structured logging, metrics, and tracing.
- Frontend containerization via Next.js standalone output, with the API
  URL supplied through a runtime config endpoint rather than a build arg.

---
