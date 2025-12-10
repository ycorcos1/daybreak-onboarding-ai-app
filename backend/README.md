# Daybreak Onboarding API (Rails)

API-only Rails app backing the Daybreak Parent Onboarding Microsite.

## Prerequisites
- Ruby 3.4+
- Bundler
- PostgreSQL 14+

## Setup
```bash
bundle install
bin/rails db:create db:migrate
```

## Run
```bash
bin/rails s -p 3001
# Health check
curl http://localhost:3001/health
```

## Tests
```bash
bundle exec rails test
```

## Configuration
- Database config uses environment variables: `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_URL` (production).
- API-only mode; no views or asset pipeline are enabled.

## Notes
- Health endpoint is available at `/health`.
- Default `/up` route remains for Rails health check tooling.
