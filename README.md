<div align="center">

# HealthAI

**Your health, organized in one place.**

A personal health workspace that helps you track vitals and medications, keep medical documents organized, get educational AI-assisted insight into symptoms, and see your health history as one connected story instead of scattered records.

[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-8E75B2?logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

![HealthAI landing page](docs/screenshots/landing/landing-page-light.png)

</div>

---

## Overview

HealthAI is a full-stack healthcare workspace built as a monorepo (`apps/web` + `apps/api`). It's not a diagnostic tool and doesn't claim to be one — it's a place to keep your health information organized (profile, vitals, medications, documents, AI analyses, comprehensive reports) and to understand it better over time, with an AI layer that helps make sense of information you've already provided rather than predicting or diagnosing anything.

Every number, score, or status shown in the app is either something the user entered directly or computed deterministically from data already on file. Nothing is fabricated to make a screen look more complete than the underlying data actually is — empty states say "not enough data" instead of inventing a plausible-looking placeholder.

## Why HealthAI

- **Real data only.** No fabricated health scores, risk percentages, diagnoses, or statistics anywhere in the product — including on this landing page.
- **AI as a supporting layer, not a gimmick.** Gemini is used for educational analysis and report generation grounded only in the data the user provided, never as a stand-in for a doctor.
- **Defense-in-depth safety.** Every hard AI safety rule (no drug names, no diagnosis claims, escalate on emergency keywords) is backed by a deterministic code-level check — a system prompt alone is never trusted to enforce it.
- **Free-tier friendly.** Built entirely on free-tier infrastructure (Google Gemini's free tier, self-hosted Postgres, Tesseract.js for OCR) — no paid APIs required to run it.
- **One connected story.** Profile, vitals, medications, documents, analyses, and reports all feed into one searchable history and one set of AI-generated reports, instead of living in disconnected screens.

## Core Features

- **Authentication** — Register/login, JWT access + refresh tokens, bcrypt password hashing, log out of all devices, account deletion (password-confirmed, cascades all owned data).
- **Personalized Dashboard** — wellness indicator, quick symptom check, daily planner, real recent-activity feed pulled from actual records.
- **Health Profile** — the 13-field foundation (demographics, lifestyle, allergies, conditions, medications, emergency contact) that everything else personalizes against.
- **Medication Reminder** — daily dose schedule and tracking.
- **Vitals & Trends** — heart rate, blood pressure, SpO2 logging with trend charts.
- **Emergency / Medical ID** — up to 3 emergency contacts with a one-tap SOS.
- **Preventive Wellness** — a transparent, lifestyle-based wellness indicator (explicitly labeled as a lifestyle signal, not a medical diagnosis).
- **Medical Vault** — upload medical documents/prescriptions with automatic OCR text extraction (Tesseract.js).
- **AI Health Analysis** — structured symptom analysis via Gemini, with photo upload support, deterministic emergency-keyword escalation, and drug-name redaction on every AI response.
- **Quick Symptom Check** — a lightweight triage box on the dashboard that short-circuits to a full analysis recommendation for anything vague or concerning.
- **Comprehensive Health Reports** — a multi-step AI report workflow: pick a period → answer adaptive follow-up questions about active medications/prior concerns → attach Medical Vault documents → get a 16-section educational report → ask follow-up questions about that specific report → print/export to PDF.
- **Health History & Analytics** — one unified, searchable, filterable timeline across every event type, plus longitudinal analytics (vital trends, medication tracking, concern-status breakdown, an optional AI-generated activity summary).
- **Settings** — account details, password change, "log out everywhere," a full personal-data export (JSON), feedback submission, and account deletion.
- **Landing page** — dark/light mode (persisted, respects system preference on first load), a dynamic language selector (detects browser locale via `Intl`), and fully responsive layout.

## Product Walkthrough

### Authentication

Registration and login, JWT-backed, with the same glass/editorial visual language as the rest of the app.

| Login | Register |
|---|---|
| ![Login](docs/screenshots/auth/login-page.png.png) | ![Register](docs/screenshots/auth/registration-page.png.png) |

### Dashboard

The personalized overview — wellness indicator, medications and vitals at a glance, trend charts, emergency card, Medical Vault, and real recent activity.

![Dashboard overview](docs/screenshots/dashboard/dashboard-overview.png.png)

<details>
<summary>More dashboard widgets</summary>

| Medications & Vitals | Vitals Trends |
|---|---|
| ![Medication and vitals](docs/screenshots/dashboard/dashboard-medication-vitals.png.png) | ![Vitals trends](docs/screenshots/dashboard/dashboard-vitals-trends.png.png) |

| Wellness & Emergency | Medical Vault & Recent Activity |
|---|---|
| ![Wellness and emergency](docs/screenshots/dashboard/dashboard-wellness-emergency.png.png) | ![Vault and recent activity](docs/screenshots/dashboard/dashboard-medical-vault-recent-activity.png.png) |

</details>

### Profile

The 13-field Health Profile that drives personalization everywhere else in the app — its completion percentage is real, computed from actual filled fields, never hardcoded.

![Health profile](docs/screenshots/profile/health-profile.png.png)

### AI Analysis

A structured symptom questionnaire (concern, duration, severity, optional photo) produces an educational result — considerations, self-care ideas (category-only, never a named drug), when to seek care, and questions for your doctor.

| Analysis form | Analysis result |
|---|---|
| ![Analysis form](docs/screenshots/analysis/health-analysis-form.png.png) | ![Analysis result](docs/screenshots/analysis/health-analysis-result.png.png) |

### Medical Vault

Upload a prescription or lab report and get its text extracted automatically via OCR — reviewable, never silently trusted as ground truth elsewhere in the app.

![Medical Vault OCR result](docs/screenshots/medical-vault/medical-vault-ocr-result.png.png)

### Reports

A multi-step, AI-generated comprehensive health report grounded in your real profile, vitals, medications, analysis history, and any documents you attach — plus a report-specific "Ask HealthAI" that only answers from that report's own content.

![Reports dashboard](docs/screenshots/reports/reports-dashboard.png.png)

<details>
<summary>Report detail &amp; Q&amp;A</summary>

| Report overview | Report details |
|---|---|
| ![Report overview](docs/screenshots/reports/health-report-overview.png.png) | ![Report details](docs/screenshots/reports/health-report-details.png.png) |

![Ask HealthAI about this report](docs/screenshots/reports/health-report-ai-qa.png.png)

</details>

### History & Analytics

Every meaningful event — profile updates, analyses, reports, vitals, medications, documents, follow-ups — in one searchable, filterable, date-ranged timeline, plus real analytics computed from that same data.

![Health history timeline](docs/screenshots/history/health-history-timeline.png.png)

<details>
<summary>Filters &amp; analytics</summary>

| Filters | Analytics |
|---|---|
| ![History filters](docs/screenshots/history/health-history-filters.png.png) | ![History analytics](docs/screenshots/history/health-history-analytics.png.png) |

![Longitudinal analytics](docs/screenshots/history/longitudinal-analytics.png)

</details>

### Settings

Account details, password change (which revokes every other active session), "log out of all devices," a full data export, feedback, and a password-confirmed account-deletion flow.

| Account & Security | Password & Sessions |
|---|---|
| ![Account and security](docs/screenshots/settings/settings-account-security.png.png) | ![Password and sessions](docs/screenshots/settings/settings-password-sessions.png.png) |

| Privacy & Feedback | Danger Zone |
|---|---|
| ![Privacy and feedback](docs/screenshots/settings/settings-privacy-feedback.png.png) | ![Danger zone](docs/screenshots/settings/settings-danger-zone.png.png) |

### Landing page — light & dark

The marketing page itself follows the same "no fabricated numbers" rule — no invented user counts or accuracy percentages anywhere.

| Light | Dark |
|---|---|
| ![Landing page light mode](docs/screenshots/landing/landing-page-light.png) | ![Landing page dark mode](docs/screenshots/landing/landing-page-dark.png.png) |

## How It Works

```
Register / Login
      │
      ▼
Build your Health Profile  ──────────┐
      │                              │
      ▼                              ▼
Track vitals & medications     Personalizes AI Analysis,
      │                        Reports, and the Dashboard
      ▼                              │
Run a Health Analysis  ◄─────────────┘
      │
      ▼
Generate a Comprehensive Report
 (adaptive follow-ups + Medical Vault documents)
      │
      ▼
Everything lands in Health History
 (searchable, filterable, with real analytics)
```

## AI Capabilities

AI features are powered by **Google Gemini** (`gemini-2.5-flash` by default, configurable), called directly via `fetch` with a `responseSchema` so every response is structured JSON validated against a Zod schema server-side before it's ever stored or shown.

- **Health Analysis** — takes a structured symptom questionnaire (and an optional photo) and returns an educational result: summary, considerations, self-care ideas, things to monitor, when to seek care, and questions for a doctor.
- **Quick Symptom Check** — a lighter-weight variant for the dashboard; recognizes common symptoms with a short note, or honestly says it needs a full analysis instead of guessing.
- **Comprehensive Reports** — a single structured call producing a 16-section report from real profile/vitals/medication/analysis/document data — never from invented information, and explicitly instructed to write "Not available" rather than fabricate a section.
- **Report Q&A** — answers are grounded strictly in that report's own saved content; if the answer isn't in the report, it says so instead of guessing.
- **Longitudinal insight** — an optional short, purely descriptive summary of recorded activity, gated so it's never called when there isn't enough real activity to describe.

**Deterministic safety backstops** (the part a system prompt alone can't guarantee):

- A regex-based scrubber redacts ~50 known drug/brand names from every AI response before it's stored, after live testing showed prompt-only instructions weren't sufficient on their own.
- An emergency-keyword scan on user input can only ever *escalate* urgency toward "seek care now" — never override the model's own assessment downward.
- No AI output is ever allowed to introduce a numeric health score or risk percentage; the one wellness indicator in the app is a transparent, deterministic formula over real profile fields, not an AI invention.

## Architecture

```
apps/web  (React + TypeScript + Vite)
   │  axios ── JWT bearer + auto refresh-on-401
   ▼
apps/api  (Express + TypeScript)
   Route → Controller → Service → Repository → Prisma
   │
   ├── PostgreSQL (via Prisma ORM)
   ├── Tesseract.js (OCR, local — no external service)
   └── Google Gemini API (structured JSON output)
```

Every authenticated endpoint derives the acting user from the verified JWT, never from a client-supplied ID, and every query is scoped to `userId` at the repository layer — there is no cross-user data access path in the API.

## Tech Stack

| | |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, React Router 7, Tailwind CSS 4, Recharts, Lucide Icons, Axios |
| **Backend** | Node.js, Express 5, TypeScript, Prisma ORM, Zod validation, JWT (access + refresh), bcrypt, Multer, Tesseract.js |
| **Database** | PostgreSQL 16 (Dockerized) |
| **AI** | Google Gemini (`gemini-2.5-flash`), structured JSON output |
| **Tooling** | Turborepo (monorepo scripts), ESLint |

## Project Structure

```
AI-Healthcare-System/
├── apps/
│   ├── web/                 # React frontend
│   │   └── src/
│   │       ├── api/         # Typed API clients (one file per resource)
│   │       ├── components/  # Shared UI + landing-page components
│   │       ├── context/     # Auth + Theme React contexts
│   │       ├── hooks/       # Shared hooks (e.g. scroll-reveal)
│   │       ├── layouts/     # Authenticated dashboard shell
│   │       ├── pages/       # Route-level pages, grouped by feature
│   │       ├── routes/      # Router config + protected-route guard
│   │       └── styles/      # Hand-rolled CSS design system
│   │
│   └── api/                 # Express backend
│       ├── prisma/          # schema.prisma + migrations
│       └── src/
│           ├── routes/        controllers/     services/
│           ├── repositories/  validations/      middleware/
│           └── utils/       # response helpers, JWT, hashing, AI safety nets
│
├── docker/                  # docker-compose.yml (Postgres)
├── docs/screenshots/        # README screenshots, grouped by feature
└── uploads/                 # Local file storage for Medical Vault (gitignored)
```

Both apps follow the same layered pattern on the backend: **Route → Controller → Service → Repository → Prisma** — controllers only parse/respond, services hold business logic, repositories are the only layer that touches Prisma directly.

## Getting Started

**Prerequisites:** Node.js 18+, Docker, a free [Google AI Studio](https://aistudio.google.com/) API key for Gemini (optional — the app runs without it, AI features just return "temporarily unavailable").

```bash
# 1. Clone
git clone https://github.com/Prasoon005/AI-Healthcare-Assistant.git
cd AI-Healthcare-System

# 2. Start PostgreSQL
cd docker
docker compose up -d
cd ..

# 3. Configure the API
cd apps/api
cp .env.example .env
# edit .env: set DATABASE_URL to match docker-compose (see below), add GEMINI_API_KEY if you have one

npm install
npx prisma migrate dev
npm run dev          # → http://localhost:5000

# 4. In a second terminal, start the frontend
cd apps/web
npm install
npm run dev           # → http://localhost:5173
```

## Environment Variables

Set in `apps/api/.env` (see `apps/api/.env.example`):

| Variable | Description |
|---|---|
| `PORT` | API server port (default `5000`) |
| `DATABASE_URL` | Postgres connection string. With the bundled `docker/docker-compose.yml` as-is, this is `postgresql://postgres:postgres@localhost:5433/ai_healthcare?schema=public` |
| `JWT_ACCESS_SECRET` | Secret for signing short-lived (15m) access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing longer-lived (7d) refresh tokens |
| `GEMINI_API_KEY` | Google Gemini API key — leave empty to run with AI features gracefully disabled |
| `GEMINI_MODEL` | Gemini model name (default `gemini-2.5-flash`) |

## Security & Privacy

- Passwords are hashed with bcrypt; the API never returns a password hash in any response.
- JWT access tokens (15 minutes) + refresh tokens (7 days), stored per-session so any device can be revoked individually or all at once ("log out of all devices").
- Changing your password revokes every other active session automatically.
- Every resource endpoint is ownership-scoped by the authenticated user's ID from the verified JWT — never from a client-supplied ID.
- Account deletion is password-confirmed, removes every owned database row via cascading relations, and separately cleans up uploaded files from disk.
- HealthAI does **not** claim HIPAA compliance, medical certification, or any clinical partnership — none of those exist, and the product doesn't pretend otherwise anywhere in its UI or copy.

## Future Improvements

- Full end-to-end regression test suite across every feature (planned as its own dedicated pass, deliberately kept separate from feature work).
- Production build, hosting, and CI/CD setup (also deliberately deferred — nothing here has been deployed yet).
- Full UI translation behind the existing language selector (today it's a working, persisted locale *display* preference — not yet a full i18n system).
- Optional two-factor authentication.
- A richer medication lifecycle (the current model tracks active/inactive; a fuller "course completed vs. discontinued" history is only inferred today from report follow-up answers).

## License

No license has been formally chosen for this project yet — there's currently no `LICENSE` file in the repository. Add one (MIT is a common default for a portfolio project like this) before treating any part of this code as reusable by others.

---

<div align="center">

Built as a full-stack learning project — architecture, safety design, and every feature above were built and verified incrementally, phase by phase, against a real running database.

</div>
