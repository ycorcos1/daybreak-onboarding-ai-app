# Daybreak Onboarding AI App

## Table of Contents
- [Overview](#overview)
- [Architecture at a Glance](#architecture-at-a-glance)
- [Prerequisites](#prerequisites)
- [Setup (Local Development)](#setup-local-development)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Sample Data Integration](#sample-data-integration)
  - [Source](#source)
  - [What’s Imported](#whats-imported)
  - [How to Re-import](#how-to-re-import)
- [Backend Details](#backend-details)
  - [GraphQL Schema Highlights](#graphql-schema-highlights)
  - [Key Models & Associations](#key-models--associations)
  - [Import Task Notes](#import-task-notes)
- [Frontend Details](#frontend-details)
  - [Key Pages](#key-pages)
  - [GraphQL Queries Used](#graphql-queries-used)
  - [Routing & Static Export](#routing--static-export)
- [Deployment](#deployment)
  - [Backend (ECR/ECS)](#backend-ecrecs)
  - [Frontend (Amplify)](#frontend-amplify)
  - [SPA Rewrites / Static Assets](#spa-rewrites--static-assets)
- [Testing & Validation](#testing--validation)
  - [Rails Console Checks](#rails-console-checks)
  - [GraphQL Checks](#graphql-checks)
  - [UI Smoke Checks](#ui-smoke-checks)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)
- [License / Contact](#license--contact)

---

## Overview
This app integrates the “Daybreak Health Test Cases 2” sample data to deliver a realistic demo for both parent-facing and admin dashboards. Backend is Ruby on Rails with GraphQL; frontend is Next.js. Production runs on AWS ECS (backend) and Amplify (frontend).

## Architecture at a Glance
- **Backend:** Rails + GraphQL, PostgreSQL, hosted on ECS/Fargate.
- **Frontend:** Next.js (static export) hosted on AWS Amplify.
- **Storage:** S3 for sample CSVs and frontend artifacts.
- **Networking:** ALB → ECS for backend; Amplify CDN for frontend.

## Prerequisites
- Node.js / npm
- Ruby / Bundler
- Docker (for backend build)
- AWS CLI with credentials to ECR/ECS/Amplify/S3
- PostgreSQL client (optional, for local DB access)

## Setup (Local Development)

### Backend
```bash
cd backend
bundle install
cp .env.example .env   # set DB and secrets
rails db:create db:migrate
rails s
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Set frontend env vars (GraphQL endpoint, auth) as needed.

## Sample Data Integration

### Source
“Daybreak Health Test Cases 2” (CSV set in `docs/Daybreak Health Test Cases 2/`).

### What’s Imported
- Organizations, contracts, org_contracts
- Credentialed insurances
- Clinicians and clinician_credentialed_insurances
- Clinician availabilities
- (Coverages/referrals/patient data where applicable; user account creation is intentionally skipped)

### How to Re-import
- CSVs are synced to S3: `s3://daybreak-dev-bucket/fixtures/daybreak-test-cases-2/`
- Rake task (idempotent) preserves IDs and respects FK order:
  ```bash
  bundle exec rake daybreak:import_test_cases[s3://daybreak-dev-bucket/fixtures/daybreak-test-cases-2]
  ```
- Import order follows FKs (orgs → contracts → joins → credentialed_insurances → clinicians → availabilities, etc.).

## Backend Details

### GraphQL Schema Highlights
- Admin queries: `adminOrganizations`, `adminClinicians` (with credentialedInsurances, availabilities), `adminCredentialedInsurances`, `adminInsuranceCoverages`.
- Parent/consumer queries: organizations, clinicians, credentialed insurances; current user context where applicable.

### Key Models & Associations
- Organization, Contract, OrgContract
- Clinician, CredentialedInsurance, ClinicianCredentialedInsurance
- ClinicianAvailability
- InsuranceCoverage (user-bound; demo import may skip users)
- Referral/ReferralMember (if present in data)

### Import Task Notes
- Idempotent upserts; preserves UUIDs
- FK-safe ordering; skips user creation/passwords from sample data
- JSON/JSONB parsing where needed

## Frontend Details

### Key Pages
- Parent: `/parent/dashboard` (orgs/clinicians/insurances), related parent flows
- Admin: `/admin/organizations`, `/admin/clinicians`, `/admin/clinicians/[id]`, `/admin/insurance`

### GraphQL Queries Used
- Admin: `adminOrganizations`, `adminClinicians`, `adminClinician`, `adminCredentialedInsurances`, `adminInsuranceCoverages`
- Parent: organizations, clinicians, credentialed insurances queries

### Routing & Static Export
- Next.js `output: export`, hosted on Amplify
- SPA rewrites required to route all paths to `index.html` while allowing static assets under `/_next/static/*` and public files like `/logo.svg`.

## Deployment

### Backend (ECR/ECS)
- Build and push:
  ```bash
  cd backend
  aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 971422717446.dkr.ecr.us-east-1.amazonaws.com
  docker buildx build --platform linux/amd64 -t 971422717446.dkr.ecr.us-east-1.amazonaws.com/daybreak-backend:latest --push .
  ```
- Redeploy ECS services:
  ```bash
  aws ecs update-service --cluster daybreak-cluster --service daybreak-web --force-new-deployment --region us-east-1
  aws ecs update-service --cluster daybreak-cluster --service daybreak-worker --force-new-deployment --region us-east-1
  ```

### Frontend (Amplify)
- Static export:
  ```bash
  cd frontend
  npm run export
  cd out && zip -r ../frontend-export.zip .
  ```
- Upload and deploy via Amplify CLI (create-deployment → curl upload → start-deployment) or Amplify console.

### SPA Rewrites / Static Assets
Ensure custom rules (Amplify) include passthrough for:
- `/_next/static/<*>`, `/_next/image`
- `favicon.ico`, `manifest.webmanifest`, `asset-manifest.json`, `build-manifest.json`
- Public assets: `logo.svg`, `logo.png`, `globe.svg`, `file.svg`, `window.svg`, `vercel.svg`
- Catch-all: `/<*> -> /index.html` (200)

## Testing & Validation

### Rails Console Checks
```ruby
Organization.count
Contract.count
Clinician.count
CredentialedInsurance.count
ClinicianAvailability.count
InsuranceCoverage.count
Referral.count
```
Spot-check associations:
```ruby
Organization.first&.contracts&.count
Clinician.first&.credentialed_insurances&.count
Clinician.first&.availabilities&.first
```

### GraphQL Checks
Run against prod GraphQL endpoint:
- Admin orgs: `adminOrganizations { id name kind slug contracts { id services } }`
- Admin clinicians: `adminClinicians { id firstName lastName licenseState active credentialedInsurances { id name state } availabilities { dayOfWeek startTime endTime timezone } }`
- Admin insurances: `adminCredentialedInsurances { id name state lineOfBusiness networkStatus } adminInsuranceCoverages { id insuranceCompanyName planName inNetwork }`

### UI Smoke Checks
- Parent: `/` and `/parent/dashboard` show real orgs/clinicians/insurances; no stub data; no console errors.
- Admin: `/admin/organizations`, `/admin/clinicians`, `/admin/clinicians/<id>`, `/admin/insurance` render real data; no console errors.
- Static assets load (logo visible) after rewrites are set.

## Troubleshooting
- Amplify deploy issues: ensure service role has S3 GetObject and the artifact zip is at the expected path; pending jobs must be stopped before new deployments.
- SPA 404s: verify rewrites include catch-all and allow `/_next/static/*`.
- Static assets (logo): ensure rewrite passthrough rules and that the asset exists in the export zip.

## Maintenance
- To update sample data: refresh CSVs in S3, rerun the rake import task.
- To redeploy frontend: `npm run export`, re-zip `out`, upload, and trigger Amplify deployment.
- To redeploy backend: rebuild/push to ECR, force-new-deployment on ECS services.

## License / Contact
- Add your project license and contact details as appropriate.

