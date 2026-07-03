# M5 Brief — Beta Polish

> Session contract: `../10-ai-session-contract.md` · Full plan: `../02-implementation-plan-m1-m5.md §9`

## Goal

Closed beta readiness: analytics, errors, privacy, QA P0 pass.

## In scope

- Analytics adapter — core funnel events per `08-operations/01-analytics-kpi-events.md`
- No full text / AI output in analytics payload
- Crash/error reporting hook (tool TBD by team)
- Privacy note screen/section
- Support/feedback entry
- Loading/error/retry polish
- Accessibility pass (baseline)
- Release config validation (already scaffolded under `src/release/`)
- QA P0 cases TC-001..023
- Closed beta checklist: `07-release/01-release-production-readiness.md`

## Out of scope

- Public store launch (until checklist pass)
- Payment, subscription, gamification
- Enabling post-P0 feature flags in production release
- Full theme iteration (TC-024..028 — polish, not M1–M4 blocker)

## Canonical reads (session)

1. `AGENTS.md`
2. This file
3. `07-release/01-release-production-readiness.md`
4. `05-qa/01-qa-test-plan.md` — P0 cases only
5. `08-operations/01-analytics-kpi-events.md`
6. `08-operations/04-security-key-and-data-protection.md`

## Allowed write paths

```text
src/modules/analytics/**
src/modules/settings/**
src/shared/errors/**
src/release/**
LingoBites-Server/src/observability/**
docs/01-ba/03-requirements/05-traceability-matrix.md  (Status updates)
```

## Forbidden

- New product features without FR + traceability update
- Turning on post-P0 modules in `close-beta-1.json` without QA matrix
- Logging PII in analytics/crash reports

## Exit tests

- Core funnel events fire (no raw text in payload)
- Privacy note visible
- Network fail → retry, input preserved
- QA P0 pass
- Closed beta checklist pass

## STOP triggers

- Shipping without QA sign-off items
- Adding monetization/auth “while we’re here”
