# Environment, Git, and Deployment Workflow

> Scope: Phase 0 onward. This document defines how LingoBites organizes local development,
> staging, production, Git branches, GitHub environments, secrets, and deployment gates.

## 1. Recommended Setup

Use three logical environments:

```text
local development
  -> developer machine
  -> self-test, mock AI, optional local real provider key

staging
  -> Google Cloud project: lingobites-staging
  -> Cloud Run service: lingobites-api-staging
  -> integration testing before production

production
  -> Google Cloud project: lingobites-production
  -> Cloud Run service: lingobites-api-production
  -> real users
```

Use two long-lived Git branches:

```text
develop -> staging
main    -> production
```

Do not create long-lived `staging` or `production` branches unless release management becomes more
complex. The environment mapping is handled by GitHub Actions and GitHub Environments.

## 2. Environment Responsibilities

| Environment | Purpose | Users | Data/key policy |
|---|---|---|---|
| Local | Build, fix bugs, self-test | Developers only | Local `.env`; mock AI by default |
| Staging | Verify bugfixes/features before production | Developers, QA, beta testers | Separate Cloud project, secrets, provider keys |
| Production | Serve real users | Public/beta users | Separate Cloud project, secrets, budgets, release gates |

Local is not a substitute for staging. Staging is the final test environment before production.

## 3. Branch Model

```text
main
  production-ready branch
  deploys production
  protected, reviewed, approval required for deployment

develop
  integration branch
  deploys staging
  protected, CI required

feature/*
  feature or normal bugfix work
  merges into develop first

hotfix/*
  urgent production fixes
  merges into main first, then back into develop
```

Examples:

```text
feature/m2-ai-api
feature/fix-invalid-ai-output
hotfix/fix-api-timeout
```

## 4. Normal Feature or Bugfix Flow

Use this flow for most work:

```text
1. Create feature/fix branch from develop
2. Implement locally
3. Run local tests
4. Open PR into develop
5. CI must pass
6. Merge into develop
7. Auto deploy staging
8. Test staging
9. Open PR develop -> main
10. CI must pass
11. Production deploy requires approval
12. Deploy production
```

Local self-test (API and mobile are separate repos, not a shared workspace):

```bash
# In LingoBites-Server
npm run api:test
npm run api:build

# In LingoBites-App
npm test
```

Staging verification should test the real app against staging API:

```text
API_BASE_URL=https://api-staging.<domain>
USE_MOCK_AI=false
```

## 5. Hotfix Flow

Use this only for urgent production issues.

```text
1. Create hotfix/* branch from main
2. Fix locally
3. Run tests
4. Open PR into main
5. CI must pass
6. Production deploy requires approval
7. Merge main back into develop
8. Confirm staging still contains the fix
```

Do not leave production-only fixes outside `develop`.

## 6. GitHub Environments

Create two GitHub Environments:

```text
staging
production
```

Staging environment:

```text
Source branch: develop
Deployment: automatic after CI passes
Approval: optional
Secrets: staging only
```

Production environment:

```text
Source branch: main
Deployment: manual approval required
Approval: required
Secrets: production only
```

This keeps staging/production clear without adding extra Git branches.

## 7. Google Cloud Organization

Use separate Google Cloud projects:

```text
lingobites-staging
lingobites-production
```

Each project has its own:

- Cloud Run service.
- Secret Manager secrets.
- Artifact Registry.
- Budget alerts.
- IAM service accounts.
- Logs and monitoring.
- Provider API keys.

Recommended region:

```text
asia-southeast1
```

Service names:

```text
lingobites-api-staging
lingobites-api-production
```

Optional custom domains:

```text
api-staging.<domain>
api.<domain>
```

## 8. Backend Environment Variables

Local default:

```text
APP_ENV=local
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
AI_PROVIDER=mock
AI_API_KEY=
AI_MODEL=
OCR_ENABLED=false
OCR_PROVIDER=mock
OCR_API_KEY=
MAX_TEXT_LENGTH=3000
MAX_IMAGE_BYTES=5242880
LOG_SENSITIVE_CONTENT=false
LOG_LEVEL=info
AI_SCHEMA_VERSION=ai-output-v1
```

Staging:

```text
APP_ENV=staging
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
AI_PROVIDER=gemini
AI_MODEL=gemini-2.0-flash
OCR_ENABLED=false
MAX_TEXT_LENGTH=3000
MAX_IMAGE_BYTES=5242880
LOG_SENSITIVE_CONTENT=false
LOG_LEVEL=info
AI_SCHEMA_VERSION=ai-output-v1
```

Production:

```text
APP_ENV=production
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
AI_PROVIDER=gemini
AI_MODEL=gemini-2.0-flash
OCR_ENABLED=false
MAX_TEXT_LENGTH=3000
MAX_IMAGE_BYTES=5242880
LOG_SENSITIVE_CONTENT=false
LOG_LEVEL=info
AI_SCHEMA_VERSION=ai-output-v1
```

Production and staging must not share provider keys.

## 9. Mobile Environment Variables

Local mobile:

```text
API_BASE_URL=http://localhost:3000
USE_MOCK_AI=true
```

Staging mobile:

```text
API_BASE_URL=https://api-staging.<domain>
USE_MOCK_AI=false
```

Production mobile:

```text
API_BASE_URL=https://api.<domain>
USE_MOCK_AI=false
```

Forbidden in mobile:

```text
AI_API_KEY
OCR_API_KEY
Firebase service account JSON
Store signing secrets
```

## 10. Secrets Policy

Secrets live in Secret Manager, not in GitHub repo files.

Staging secrets:

```text
AI_API_KEY
OCR_API_KEY  # M3+
```

Production secrets:

```text
AI_API_KEY
OCR_API_KEY  # M3+
```

Do not paste real secrets into:

- Chat.
- Docs.
- GitHub issue comments.
- Pull request descriptions.
- Source code.
- Mobile `.env`.

GitHub Actions should authenticate to Google Cloud through Workload Identity Federation. Avoid service
account JSON keys.

## 11. IAM Policy

Create one deploy service account per environment:

```text
github-deploy-staging@lingobites-staging.iam.gserviceaccount.com
github-deploy-production@lingobites-production.iam.gserviceaccount.com
```

Minimum practical roles per project:

```text
Cloud Run Developer
Artifact Registry Writer
Service Account User
Secret Manager Secret Accessor
```

Do not grant GitHub Actions:

```text
Owner
Editor
Billing Admin
Organization Admin
```

Production deploy service account must not have access to staging unless explicitly needed, and staging
deploy service account must not have access to production.

## 12. CI/CD Rules

Create three workflows:

```text
.github/workflows/ci.yml
.github/workflows/deploy-staging.yml
.github/workflows/deploy-production.yml
```

CI runs on pull requests, scoped to whichever repo changed (API and mobile are separate repos, each with their own `npm ci`):

```text
# LingoBites-Server CI
npm ci
npm run api:test
npm run api:build
docker build --platform linux/amd64 -f deploy/api/Dockerfile -t lingobites-api:test .

# LingoBites-App CI
npm ci
npm test
```

Staging deploy:

```text
Trigger: push to develop
Environment: staging
Deployment: automatic
Target: lingobites-api-staging
Build: deploy/api/Dockerfile
Push: Artifact Registry staging image
Deploy: Cloud Run --image
```

Production deploy:

```text
Trigger: push to main or manual workflow_dispatch
Environment: production
Deployment: manual approval required
Target: lingobites-api-production
Build: deploy/api/Dockerfile or promote approved image
Push: Artifact Registry production image
Deploy: Cloud Run --image
```

## 13. Branch Protection

Protect `develop`:

```text
Require pull request before merging
Require CI checks to pass
Disallow force push
Disallow direct push except maintainers if absolutely needed
```

Protect `main`:

```text
Require pull request before merging
Require CI checks to pass
Require review approval
Require production environment approval
Disallow force push
Disallow direct push
```

## 14. Release Gates

Before staging deploy:

- API tests pass.
- API builds.
- Docker image builds.
- No secrets committed.
- No raw text/image/AI output logging.

Before production deploy:

- Staging has been tested.
- Critical user flows pass.
- `/health` passes.
- `/v1/ai/analyze` returns canonical `{ request_id, status }` envelope.
- AI output passes `validateAIOutput()`.
- Production image was built by CI or promoted from an approved staging image.
- Mobile points to production `API_BASE_URL`.
- Budget alert exists.
- Production deploy approval is recorded.

## 15. Cost Controls

Staging Cloud Run:

```text
min-instances=0
max-instances=2
budget alert: 10-20 USD
```

Production Cloud Run initial:

```text
min-instances=0
max-instances=5
budget alert: 50 USD
```

Increase `min-instances` only when cold start latency becomes a real user problem. Keeping one warm
production instance improves latency but creates idle cost.

AI provider cost controls:

- Use separate staging and production keys.
- Set provider-side quota where available.
- Use short sample text for smoke tests.
- Do not load-test real AI without explicit approval.

## 16. Deployment Commands

Staging deploy details live in the LingoBites-Server repo:

```text
docs/01-ba/07-release/05-backend-deploy-google-cloud-run.md
```

Use that runbook for Cloud Run commands, Secret Manager setup, and verification.

## 17. Failure and Rollback

If staging fails:

- Fix on feature branch.
- PR into `develop`.
- Redeploy staging.

If production fails after deploy:

1. Check Cloud Run logs without exposing sensitive content.
2. If bug is severe, rollback Cloud Run to previous revision.
3. Create `hotfix/*` from `main`.
4. Fix, test, PR into `main`.
5. Merge `main` back into `develop`.

Do not patch production manually in a way that cannot be reproduced from Git.

## 18. Team Working Agreement

Rules:

- All normal work starts from `develop`.
- All normal work reaches staging before production.
- Production deploy comes only from `main`.
- No direct production deploy from local machine after CI/CD is configured.
- No production secret is used for local development.
- No feature outside Phase 0 is shipped without feature registry/release config.
- Any API contract or schema change must follow the spec change protocol.

## 19. Final Checklist

- [ ] `develop` exists and maps to staging.
- [ ] `main` exists and maps to production.
- [ ] GitHub Environments `staging` and `production` exist.
- [ ] Production environment requires approval.
- [ ] `lingobites-staging` Google Cloud project exists.
- [ ] `lingobites-production` Google Cloud project exists.
- [ ] Secrets are separate per project.
- [ ] GitHub Actions uses Workload Identity Federation.
- [ ] Branch protection is enabled for `develop` and `main`.
- [ ] Cloud Run staging deploy has passed `/health`.
- [ ] Production deploy is blocked until staging pass.
