# M4 Brief — Save / History / Detail

> Session contract: `../10-ai-session-contract.md` · Full plan: `../02-implementation-plan-m1-m5.md §8`

## Goal

Local retention: save, list, reopen, delete — **reopen does not call AI**.

## In scope

- SQLite via `react-native-quick-sqlite`
- Migrations: `lessons`, `app_settings`
- `LessonRepository` — save full `ai_output_json`
- Save button states: unsaved / saving / saved / error
- Double-save prevention (dedup)
- History list + empty state
- Lesson detail from DB
- Delete lesson + clear local data (settings)

## Out of scope

- Cloud sync, account (post-P0)
- Re-generate AI on open
- Analytics (M5)
- Post-P0 vocabulary store separate from lesson JSON

## Canonical reads (session)

1. `AGENTS.md`
2. This file
3. `../05-data-model.md`
4. `../01-technical-implementation-spec.md` §9 persistence
5. `03-requirements/02-business-rules.md` — BR-LES-*

## Allowed write paths

```text
src/shared/db/**
src/modules/lesson/**
src/app/navigation/**
src/modules/settings/**   (clear data only)
__tests__/**
```

## Forbidden

- Calling AI in lesson detail load
- Separate grammar/vocab tables (store `ai_output_json` per spec)
- Sync endpoints
- Storing original images in DB

## Exit tests

- Save persists after app restart
- Double tap save → one lesson
- Open saved lesson → no AI network call
- Delete removes from history
- History empty state works

## STOP triggers

- `lesson.open` triggers `/v1/ai/analyze`
- Schema fields on Lesson entity not in data-model / technical-spec
