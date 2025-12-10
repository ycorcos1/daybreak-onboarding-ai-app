# Aptible Deployment Skeleton

This document outlines the baseline Aptible configuration for the Daybreak Parent Onboarding Microsite. It is a skeleton only; no live deployment is performed in this task.

## Required Environment Variables

- `DATABASE_URL` — Postgres connection string (provided by Aptible)
- `RAILS_ENV=production`
- `RACK_ENV=production`
- `RAILS_MASTER_KEY` — Rails credentials key
- `S3_BUCKET` — AWS S3 bucket for PHI storage
- `S3_REGION` — AWS region for S3 bucket
- `AWS_ACCESS_KEY_ID` — IAM user/role credentials for S3/Textract
- `AWS_SECRET_ACCESS_KEY` — IAM secret for S3/Textract
- `TEXTRACT_REGION` — AWS region for OCR
- `OPENAI_API_KEY` — OpenAI API key
- `AWS_BEDROCK_REGION` — (optional) region for future Bedrock provider
- `AWS_BEDROCK_MODEL_ID` — (optional) default model id for Bedrock
- `FRONTEND_URL` — Deployed frontend origin (for CORS)
- `CORS_ORIGINS` — Comma-separated allowed origins

## Process Roles

- `web`: Rails API (Puma)
- `worker`: background jobs (ActiveJob/Sidekiq or similar)

## Deployment Notes

1. Create an Aptible app and provision a Postgres database.
2. Set all environment variables above.
3. Deploy the Rails app using the `Procfile` in this directory.
4. Run database migrations after deploy (e.g., `aptible db:execute` or a release task).
5. Scale `web` and `worker` dynos as needed.

