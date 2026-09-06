# M2 Brief — Backend Proxy and Real AI

> Session contract: `../10-ai-session-contract.md` · Full plan: `../02-implementation-plan-m1-m5.md §6`

## Goal

Connect mobile app to backend API (`/v1/ai/analyze`) and handle responses/errors.

## In scope

- Mobile API client to communicate with Fastify backend proxy endpoint `/v1/ai/analyze`
- Client-side error mapping and schema validation check for robustness
- Support switching between Mock AI and real API via `USE_MOCK_AI` env flag
- (The corresponding backend setup, including API endpoints, Gemini/OpenAI provider adapters, prompt building, and backend retries, is developed in `LingoBites-Server`)

## Out of scope

- OCR API wiring on client (M3)
- SQLite save/history (M4)
- Client-side analytics/crash reporting (M5)

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
src/shared/api/**
src/modules/ai-analysis/**
.env.example
```

## Forbidden

- `src/modules/ocr/**`
- API keys in mobile bundle
- Custom AI output schema separate from canonical
- Writing files in backend server repo

## Exit tests

- Mobile: `USE_MOCK_AI=true` still works (M1 path)
- Mobile: `USE_MOCK_AI=false` properly connects to local/staging Fastify proxy API and displays real AI result
- Mobile client maps API error codes (e.g., `VALIDATION_EMPTY_TEXT`, `VALIDATION_TEXT_TOO_LONG`, `AI_INVALID_OUTPUT`) to correct user-facing messages
- Invalid API response or schema validation failure does not crash the mobile app

## STOP triggers

- Storing API keys directly in mobile bundle
- Implementing OCR UI or OCR services (belongs to M3)
- Skipping client-side schema validation via `validateAIOutput()`
