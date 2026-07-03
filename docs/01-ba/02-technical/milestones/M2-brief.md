# M2 Brief — Backend Proxy and Real AI

> Session contract: `../10-ai-session-contract.md` · Full plan: `../02-implementation-plan-m1-m5.md §6`

## Goal

Real AI via Fastify `/v1/ai/analyze` with schema validation and single retry.

## In scope

- `/health` (if not done)
- `/v1/ai/analyze` — input validation, provider adapter, Zod validation
- Prompt builder per `03-ai-output-requirements.md`
- Retry invalid output **at most once** → then `AI_INVALID_OUTPUT`
- Mobile API client + `USE_MOCK_AI` env flag
- No logging of raw `confirmed_text`

## Out of scope

- OCR routes (M3)
- SQLite save (M4)
- Analytics/crash reporting (M5)
- Auth, rate limiting beyond basic (unless in technical-spec)

## Canonical reads (session)

1. `AGENTS.md`
2. This file
3. `12-api-backend-development-rules.md` (LingoBites-Server repo) — contract, tests, security, env
4. `01-schema/01-ai-output-v1.ts`
5. `../01-technical-implementation-spec.md` — API/AI sections only
6. `../03-ai-output-requirements.md`
7. `../04-ai-ocr-integration.md` — AI provider parts only

## Allowed write paths

```text
LingoBites-Server/src/routes/**
LingoBites-Server/src/providers/ai/**
LingoBites-Server/src/schemas/**
LingoBites-Server/src/services/**
LingoBites-Server/src/observability/**
LingoBites-Server/test/**
src/shared/api/**
src/modules/ai-analysis/**
.env.example
LingoBites-Server/.env.example
```

## Forbidden

- `LingoBites-Server/src/routes/ocr.ts`
- `src/modules/ocr/**`
- API keys in mobile bundle
- Custom AI output schema separate from canonical
- More than one retry on invalid output

## Exit tests

- `npm run api:test` passes (see `12-api-backend-development-rules.md` §5, LingoBites-Server repo)
- API: valid provider output passes schema (`INT-AI-001`)
- API: invalid → retry once → still invalid → `AI_INVALID_OUTPUT` (`INT-AI-002`, `INT-AI-003`)
- Response envelope `{ request_id, status }` — not `{ ok, error_code }`
- Mobile: `USE_MOCK_AI=true` still works (M1 path)
- Mobile: `USE_MOCK_AI=false` renders real AI result
- Invalid response does not crash app

## STOP triggers

- Locking AI provider without user/env decision
- Adding OCR endpoint
- Skipping `validateAIOutput()` on backend
