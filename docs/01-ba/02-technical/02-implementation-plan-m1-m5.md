# Implementation Plan — Phase 0 M1-M5

## 1. Purpose

This document turns the BA/spec set into a concrete implementation plan for **LingoBites Phase 0**.

This plan uses the stack locked in `02-technical/01-technical-implementation-spec.md`:

- React Native CLI + TypeScript for mobile.
- Fastify + TypeScript for backend API proxy.
- SQLite local-first for saved lessons via `react-native-quick-sqlite`.
- Backend protects OCR/AI provider keys.
- No Expo.

When implementing M2/M3, use `02-technical/04-ai-ocr-integration.md` as the detailed source for provider abstraction, quality gates, retry/fallback, and eval suite.

---

## 2. Implementation Principles

1. Build core learning result before connecting real OCR.
2. AI output must always validate with runtime schema.
3. Do not render or save invalid AI output.
4. Do not put OCR/AI API keys in the mobile app.
5. Saved lesson detail does not call AI again.
6. Each milestone must have a demo and clear test gate.
7. Do not add gamification, payment, account, or sync in Phase 0.

---

## 3. Repo Structure (Standalone Mobile App)

This repository contains only the mobile client codebase. The backend API proxy is developed and maintained in the separate `LingoBites-Server` repository.

### Mobile App Repository Layout

```text
android/                     # Android native folder
ios/                         # iOS native folder
src/                         # App source code
  app/
    navigation/              # Navigation system
  components/                # Shared custom components
  data/                      # Constants
  modules/                   # Modules/Features
    input/                   # Paste & capture screens
    ocr/                     # Text review/correct screen
    ai-analysis/             # AI generation & analyzing view
    lesson/                  # Result view & saved lessons
    vocabulary/              # Vocabulary sections
    grammar/                 # Grammar highlights
    pronunciation/           # Pronunciation
    practice/                # Exercises
    analytics/               # Analytics adaptor
  release/                   # Release config
  shared/                    # Shareable helpers/seams
    api/                     # REST api client
    copy/                    # User messaging
    db/                      # Local SQLite database
    errors/                  # Shared errors definitions
    fixtures/                # Mock AI output JSONs
    schemas/                 # Client validator schemas
    utils/                   # General utils
__tests__/                   # Unit/Integration tests
.env.example                 # Environment template
docs/                        # BA/Technical documentation (this folder)
```

The split into two separate repositories (`LingoBites-App` and `LingoBites-Server`) has been executed. All references to backend source files (`LingoBites-Server/*`) in the milestone scopes below are for integration reference only; backend code must be implemented in the server repository.

---

## 4. M0 — Project Setup

### Goal

Create repo foundation so mobile and API can develop in parallel.

### Work

- Scaffold React Native CLI app with TypeScript.
- Scaffold Fastify API with TypeScript.
- Add formatter/linter.
- Add `.env.example` for mobile and API.
- Add shared convention for request id, error code, schema version.
- Create mock fixtures for valid and invalid AI output.

### Recommended mobile dependencies

```text
@react-navigation/native
@react-navigation/native-stack
react-native-screens
react-native-safe-area-context
react-native-config
react-native-quick-sqlite
react-native-keychain
zustand
zod
uuid
```

Camera/gallery dependencies are added in M3 to avoid native complexity too early.

### Recommended API dependencies

```text
fastify
zod
dotenv
uuid
pino
```

### Exit criteria

- Mobile app opens placeholder screen on iOS simulator and Android emulator.
- API `/health` runs locally.
- Test runner works for mobile logic and API.

---

## 5. M1 — Local UI Prototype

### Goal

Validate learning experience before connecting real OCR/AI.

### Scope

- Paste text screen.
- Mock AI analysis service.
- AI output schema validator.
- Lesson result screen.
- Basic empty/error/loading states.

### Key files/modules

```text
src/modules/input/
src/modules/ai-analysis/
src/modules/lesson/
src/shared/fixtures/
src/shared/schemas/
src/shared/components/
```

### Work

1. Copy/import `AIOutputSchema`, `AIOutput`, and `validateAIOutput()` from `docs/01-ba/01-schema/01-ai-output-v1.ts` into app shared schema. Do not redefine fields from descriptive docs.
2. Copy/import valid and invalid fixtures from `docs/01-ba/01-schema/fixtures/`.
3. Create `MockAIAnalysisService`.
4. Create Paste Text screen with empty and max length validation.
5. Create Loading screen/state.
6. Create Result screen rendering:
   - title
   - original text
   - Vietnamese translation
   - summary
   - sentence analysis
   - vocabulary
   - grammar
   - pronunciation guide
   - practice
7. Create empty state for empty vocabulary/grammar/practice.
8. Create error state when schema is invalid.

### Test gate

- Unit test `AIOutputSchema` with valid/invalid fixtures.
- Unit test text length validator.
- UI smoke test: paste text -> mock result.
- UI smoke test: invalid mock -> friendly error, no crash.

### Exit criteria

- Demo paste text -> lesson result without backend.
- Result screen works when optional sections are empty.
- No crash with invalid AI output.

---

## 6. M2 — Backend Proxy and Real AI

### Goal

Connect real backend AI after UI rendering is stable.

### Scope

- Fastify API.
- `/health`.
- `/v1/ai/analyze`.
- AI provider adapter.
- Prompt builder.
- Backend Zod validation.
- Retry invalid output at most once.
- Error code mapping.

### Key files/modules

```text
LingoBites-Server/src/routes/health.ts
LingoBites-Server/src/routes/aiAnalysis.ts
LingoBites-Server/src/providers/ai/
LingoBites-Server/src/schemas/aiOutputSchema.ts
LingoBites-Server/src/services/promptBuilder.ts
LingoBites-Server/src/services/aiAnalysisService.ts
LingoBites-Server/src/observability/logger.ts
src/shared/api/
src/modules/ai-analysis/
```

### Work

1. Implement `/health`.
2. Port `AIOutputSchema` to API or create shared package if using monorepo.
3. Implement prompt builder from `02-technical/03-ai-output-requirements.md`.
4. Implement AI provider interface:

```text
analyzeLesson(input) -> raw provider response
```

5. Implement `AIAnalysisService`:
   - validate input length
   - call provider
   - parse JSON
   - validate schema
   - retry once if invalid
   - return normalized response
6. Implement API client in mobile.
7. Add feature flag `USE_MOCK_AI`.
8. Do not log raw confirmed text.

### Test gate

- API integration test valid provider output.
- API integration test invalid provider output -> retry.
- API integration test invalid after retry -> `AI_INVALID_OUTPUT`.
- Mobile can switch mock/real AI by env.

### Exit criteria

- Real AI produces output that renders on mobile.
- Schema valid >= 95% with sample text suite after retry.
- Invalid provider response does not crash app.

---

## 7. M3 — OCR Flow

### Goal

Complete scan/upload -> OCR -> review/edit -> AI analysis.

### Scope

- Camera input.
- Gallery input.
- Image preview.
- `/v1/ocr`.
- OCR provider adapter.
- OCR review/edit screen.
- Retry OCR.
- Paste fallback.

### Mobile dependencies to add

```text
react-native-image-picker
react-native-permissions
```

Phase 0 uses `react-native-image-picker` to open native camera UI/photo library. No custom native camera and no `react-native-vision-camera` in Phase 0. If live OCR, crop overlay, or custom camera preview is needed later, consider `react-native-vision-camera` in Phase 1+.

### Key files/modules

```text
src/modules/input/
src/modules/ocr/
LingoBites-Server/src/routes/ocr.ts
LingoBites-Server/src/providers/ocr/
LingoBites-Server/src/services/ocrService.ts
```

### Work

1. Add permission copy to native config:
   - `ios/Info.plist`
   - `android/app/src/main/AndroidManifest.xml`
2. Implement image picker/camera flow with `react-native-image-picker`.
3. Implement image preview and replace image.
4. Implement `/v1/ocr` with `multipart/form-data`; use base64 only for internal prototype if needed.
5. Implement OCR provider interface:

```text
extractText(image) -> extracted_text, confidence, warnings
```

6. Implement OCR no-text/error mapping.
7. Implement OCR review screen with editable text.
8. Ensure AI receives `confirmed_text`, not `ocr_raw_text`.

### Test gate

- Permission denied path.
- Gallery image success.
- OCR success with clear image.
- OCR no text -> paste fallback.
- Edit OCR text -> AI request uses edited text.

### Exit criteria

- 20 sample images pass internal OCR flow.
- User always has a chance to edit text before AI analysis.

---

## 8. M4 — Save/History/Detail

### Goal

Create minimum retention loop: user saves and reopens lessons.

### Scope

- SQLite setup.
- Lesson repository.
- Save lesson.
- Lesson history.
- Lesson detail.
- Delete lesson/local data.
- Double-save prevention.

### Key files/modules

```text
src/shared/db/
src/modules/lesson/
src/app/navigation/
```

### Work

1. Create SQLite migration for `lessons` and `app_settings`.
2. Implement `LessonRepository`.
3. Map AI output + source metadata into `Lesson`.
4. Save full `ai_output_json`.
5. Implement save button state:
   - unsaved
   - saving
   - saved
   - error
6. Implement history list.
7. Implement lesson detail from local DB.
8. Implement delete lesson.
9. Implement clear local data in settings.

### Test gate

- Save lesson persists after app restart.
- Tap save multiple times creates only one lesson.
- Open saved lesson does not call AI.
- Delete lesson removes it from history.

### Exit criteria

- User can save, reopen, and delete lessons locally.
- Lesson history is usable with empty state.

---

## 9. M5 — Beta Polish

### Goal

Bring app to closed beta readiness.

### Scope

- Analytics.
- Crash/error reporting.
- Privacy note.
- Support/feedback entry.
- Loading/error polish.
- Accessibility pass.
- Release checklist.

### Key files/modules

```text
src/modules/analytics/
src/modules/settings/
src/shared/errors/
LingoBites-Server/src/observability/
docs/01-ba/07-release/01-release-production-readiness.md
```

### Work

1. Implement analytics adapter.
2. Track core funnel events from `08-operations/01-analytics-kpi-events.md`.
3. Ensure analytics payload never includes raw text.
4. Add crash/error reporting tool selected by team.
5. Add privacy note screen/section.
6. Add support feedback entry.
7. Polish loading messages and retry states.
8. Run accessibility checklist.
9. Run closed beta release checklist.

### Test gate

- Analytics events fire for core funnel.
- No full text in analytics payload.
- Privacy note visible.
- Network fail shows retry and preserves input.
- QA P0 pass.

### Exit criteria

- Closed beta checklist in `07-release/01-release-production-readiness.md` passes.
- No known P0/P1 blocker remains.

---

## 10. Provider Decisions to Lock Before M2/M3

| Decision | Lock before | Notes |
|---|---|---|
| AI provider/model | M2 | Must support structured JSON or be stable enough with prompt + validation |
| OCR provider | M3 | Prefer provider with good quality on real-world images |
| Analytics tool | M5 | May use adapter to swap later |
| Crash reporting | M5 | Required before closed beta |
| Backend hosting | M2 | Needs HTTPS public endpoint for real mobile |

M1 does not need real providers.
AI/OCR providers must be evaluated per scorecard in `02-technical/04-ai-ocr-integration.md` before closed beta.

---

## 11. Recommended Execution Order

```text
M0 setup
→ M1 local UI prototype
→ M2 real AI through backend
→ M3 OCR flow
→ M4 local save/history
→ M5 beta polish
→ closed beta
→ public beta readiness review
```

Do not swap M3 before M1 unless the goal is a standalone OCR proof-of-concept. For this product, result screen quality and schema are the foundation for a polished ship.

---

## 12. Definition of Done for Entire Phase 0

Phase 0 implementation is complete when:

- App runs on iOS and Android via React Native CLI.
- User can paste text and create a lesson.
- User can scan/upload image, review OCR text, and create a lesson.
- AI output is validated before render/save.
- User can save, reopen, and delete lessons.
- Saved lesson detail does not call AI again.
- API keys live only on backend.
- Core funnel analytics works.
- Privacy note and support path are in the app.
- QA P0 pass.
- Closed beta checklist pass.

---

## 13. Prompt for Coding Agent

```text
You are implementing LingoBites Phase 0.

Use React Native CLI + TypeScript, not Expo.
Use Fastify + TypeScript for the backend API proxy.
Follow docs/01-ba/02-technical/01-technical-implementation-spec.md and docs/01-ba/02-technical/02-implementation-plan-m1-m5.md.

Start with M0 and M1 only:
1. Scaffold React Native CLI mobile app.
2. Scaffold Fastify API.
3. Copy/import canonical AI output Zod schema from `docs/01-ba/01-schema/01-ai-output-v1.ts`.
4. Copy/import valid and invalid AI fixtures from `docs/01-ba/01-schema/fixtures/`.
5. Build paste text screen.
6. Build mock AI service.
7. Build lesson result screen.
8. Add tests for schema validation and text length validation.

Do not implement OCR, real AI, save/history, auth, subscription, or gamification until M1 passes.
```
