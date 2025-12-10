# Daybreak Parent Onboarding AI Microsite

Monorepo for the Daybreak Parent Onboarding Microsite. This project provides a Next.js frontend and a Rails API backend to support the parent onboarding flow, referral packet creation, and admin operations described in the PRD.

## Repository Layout

- `frontend/` — Next.js (TypeScript) app
- `backend/` — Rails API-only app (PostgreSQL)
- `infra/` — Infra notes and deployment skeleton (Aptible)
- `docs/` — Product, architecture, design, and task list (authoritative)

## Prerequisites

- Node.js 18+
- npm (bundled with Node)
- Ruby 3.4+ (Homebrew ruby recommended)
- Bundler (`gem install bundler`)
- PostgreSQL 14+

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000
```

### Backend
```bash
cd backend
bundle install
bin/rails db:create db:migrate
bin/rails s -p 3001
# Health check: http://localhost:3001/health
```

### CI
GitHub Actions workflow lives in `.github/workflows/ci.yml` and runs frontend lint/type-check/tests and backend tests.

## Docs

Authoritative references are in `docs/`:
- `daybreak_onboarding_ai_prd.md`
- `daybreak_onboarding_ai_architecture_doc.md`
- `daybreak_onboarding_ai_design_spec.md`
- `daybreak_onboarding_ai_tasklist.md`

