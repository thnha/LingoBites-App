# M0 Brief — Project Setup

> Session contract: `../10-ai-session-contract.md` · Full plan: `../02-implementation-plan-m1-m5.md §4`

## Goal

Repo foundation so mobile and API can develop in parallel.

## In scope

- React Native CLI + TypeScript scaffold (`this repo`)
- Linter/formatter, `.env.example` (mobile client configuration)
- Request id, error code, schema version conventions on client
- Copy AI fixtures from `01-schema/fixtures/` into mobile shared fixtures
- (The corresponding backend setup is developed in `LingoBites-Server`)

## Out of scope

- Paste text flow, result UI (M1)
- Real AI, OCR (M2/M3)
- SQLite, save/history (M4)
- `react-native-image-picker` (M3)

## Canonical reads (session)

1. `AGENTS.md`
2. `../02-implementation-plan-m1-m5.md` §4
3. `../01-technical-implementation-spec.md` §2–3
4. `01-schema/fixtures/*`

## Allowed write paths

```text
**          (scaffold, config — not feature modules yet)
.env.example
Root tooling config (eslint, prettier, etc.)
```

## Forbidden

- Expo
- OCR/AI provider keys in mobile
- Feature modules beyond placeholder screen
- Duplicate schema definitions (import from `01-ai-output-v1.ts` when needed)

## Exit tests

- Mobile opens on iOS simulator and Android emulator
- `GET /health` returns OK locally
- Mobile + API test runners execute

## STOP triggers

- Adding camera/gallery deps → belongs to M3
- Implementing `/v1/ai/analyze` → belongs to M2
