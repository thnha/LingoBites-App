# M1 Brief — Local UI Prototype

> Session contract: `../10-ai-session-contract.md` · Full plan: `../02-implementation-plan-m1-m5.md §5`

## Goal

Paste text → mock AI → validate schema → lesson result screen. **No backend required.**

## In scope

- Copy `AIOutputSchema`, `validateAIOutput()` from `01-schema/01-ai-output-v1.ts`
- Fixtures: `valid-full.json`, `valid-minimal.json`, `invalid-missing-field.json`
- `PasteTextScreen` (empty + max length validation)
- `MockAIAnalysisService`
- Loading state
- `LessonResultView` — sections in order per technical-spec §14
- Empty states for empty vocabulary/grammar/practice
- Error state on invalid schema (no crash)
- Unit tests: schema + text length validator

## Out of scope

- Real AI / API client (M2)
- OCR, camera, gallery (M3)
- SQLite, save, history (M4)
- Analytics, privacy screen (M5)
- Navigation beyond paste → result (minimal stack OK; no bottom tabs required in M1)
- Full theme system (M5) — **M1 may use temporary StyleSheet** per `AGENTS.md`

## Canonical reads (session)

1. `AGENTS.md`
2. This file
3. `01-schema/01-ai-output-v1.ts`
4. `01-schema/fixtures/*`
5. `../01-technical-implementation-spec.md` §14 only
6. `../06-ai-agent-implementation-guide.md` §5–8

## Allowed write paths

```text
src/modules/input/**
src/modules/ai-analysis/**
src/modules/lesson/**
src/shared/schemas/**
src/shared/fixtures/**
src/shared/components/**
App.tsx
__tests__/**
```

## Forbidden

- `src/modules/ocr/**`
- `src/shared/db/**`
- Writing backend files (managed in separate `LingoBites-Server` repo)
- New fields on `AIOutput` not in canonical schema
- Sending text to network

## Render order (result screen)

1. Title · 2. Original · 3. Translation · 4. Summary · 5. Sentences · 6. Vocabulary · 7. Grammar · 8. Pronunciation · 9. Practice · 10. Save placeholder (disabled OK)

## Exit tests

- `valid-full.json` renders all sections
- `valid-minimal.json` renders with empty arrays (no crash)
- `invalid-missing-field.json` → friendly error, no render/save
- Paste text → mock → result smoke test
- Text length validator unit test

## STOP triggers

- Adding OCR or image picker
- Calling `/v1/ai/analyze`
- Implementing SQLite save
- Inventing AI output fields
