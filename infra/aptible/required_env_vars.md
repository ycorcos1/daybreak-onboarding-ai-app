# Required Environment Variables for Aptible Deployment

## Database
- `DATABASE_URL` – Provided by Aptible Postgres

## Rails
- `RAILS_ENV=production`
- `RAILS_MASTER_KEY` – From `config/master.key` (never commit)
- `SECRET_KEY_BASE` – Generate with `rails secret`

## AWS / S3 / Textract
- `AWS_ACCESS_KEY_ID` – IAM access key
- `AWS_SECRET_ACCESS_KEY` – IAM secret
- `AWS_REGION` – e.g., `us-east-1`
- `S3_BUCKET` – Bucket used for uploads and packets
- `S3_INSURANCE_PREFIX` – e.g., `insurance/`
- `S3_PACKETS_PREFIX` – e.g., `packets/`
- `AWS_KMS_KEY_ID` – (optional) KMS key ARN if the bucket is KMS-encrypted
- `AWS_TEXTRACT_REGION` – (optional) if different from `AWS_REGION`

## OpenAI / AI
- `OPENAI_API_KEY` – API key for AI provider
- `OPENAI_MODEL` – (optional) overrides default model

## Frontend (Next.js)
- `NEXT_PUBLIC_API_URL` – Backend GraphQL/API base URL

## Puma / Concurrency (optional)
- `WEB_CONCURRENCY` – Puma workers (e.g., 2)
- `RAILS_MAX_THREADS` – Puma threads (e.g., 5)
- `RAILS_MIN_THREADS` – Defaults to `RAILS_MAX_THREADS` if unset

