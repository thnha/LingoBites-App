# Technical Implementation Spec — Phase 0

## 1. Purpose

This document locks in default technical decisions so developers or AI coding agents can start implementing **LingoBites Phase 0** without re-asking foundational questions.

This document supplements:

- `04-product/04-phase0-prd.md`
- `03-requirements/01-functional-requirements.md`
- `02-technical/03-ai-output-requirements.md`
- `02-technical/05-data-model.md`
- `05-qa/01-qa-test-plan.md`
- `02-technical/06-ai-agent-implementation-guide.md`

If there is a conflict, prioritize in this order:

1. Technical decisions in this file.
2. PRD and Functional Requirements.
3. Business Rules.
4. Wireframes and UX copy.

---

## 2. Phase 0 Default Decisions

| Topic                 | Decision                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------- |
| App target             | Mobile app iOS and Android                                                          |
| Mobile stack           | React Native CLI + TypeScript                                                       |
| Navigation             | React Navigation                                                                    |
| State management       | Local component state first; Zustand only for shared state                          |
| Local storage          | SQLite via `react-native-quick-sqlite`; `react-native-keychain` for tokens/sensitive config if needed |
| Camera/gallery         | `react-native-image-picker` for Phase 0; no custom native camera                    |
| Backend                | Thin Node.js API proxy                                                              |
| API framework          | Fastify                                                                             |
| Auth Phase 0           | Login not required                                                                  |
| User identity          | Anonymous local user id generated on device                                         |
| Lesson storage Phase 0 | Local-first on device                                                               |
| Multi-device sync      | Out of scope for Phase 0                                                            |
| OCR                    | Called via backend proxy to OCR provider                                            |
| AI analysis            | Called via backend proxy to LLM provider with structured output                     |
| TTS                    | Native/device TTS or pronunciation guide; cloud TTS not required in Phase 0       |
| Image retention        | Do not store original images by default                                             |
| Analytics              | Do not log full scanned text or full AI output                                      |
| Feature flags          | Layer A (env): OCR, TTS, mock AI. Layer B (release): module visibility — see `07-modular-architecture-and-release.md` |

---

## 3. Architecture Overview

```text
Mobile App
  ├─ Input module
  ├─ OCR review module
  ├─ AI result renderer
  ├─ Lesson repository
  ├─ Analytics adapter
  └─ API client

Backend API Proxy
  ├─ OCR endpoint
  ├─ AI analysis endpoint
  ├─ TTS endpoint optional
  ├─ Provider adapters
  ├─ Schema validation
  └─ Request logging without sensitive content

External Providers
  ├─ OCR provider
  ├─ LLM provider
  └─ TTS provider optional
```

The mobile app is responsible for UI, local persistence, basic validation, and rendering. The backend proxy is responsible for protecting API keys, calling external providers, strict output validation, and normalizing errors.

---

## 4. Phase 0 Technical Scope

### In scope

- Paste text prototype.
- Camera/gallery image input.
- Temporary image upload for OCR.
- OCR text review and editing.
- AI structured lesson generation.
- Validate AI output before returning to mobile or before rendering.
- Render result sections per wireframe.
- Save lesson locally.
- Lesson history and lesson detail.
- Retry OCR/AI.
- Basic analytics events.
- Privacy note and delete local data.

### Out of scope

- Required account/login.
- Cloud lesson sync.
- Subscription/payment.
- Full offline OCR/AI.
- Pronunciation scoring.
- Full admin dashboard.
- Multi-language output beyond Vietnamese.
- Multi-page PDF or long documents.

---

## 5. Recommended Directory Structure

```text
apps/
  mobile/
    ios/
    android/
    src/
      app/
        App.tsx
        navigation/
      modules/
        input/
        ocr/
        ai-analysis/
        lesson/
        vocabulary/
        grammar/
        pronunciation/
        practice/
        analytics/
      shared/
        api/
        components/
        config/
        db/
        errors/
        types/
        utils/

  api/
    src/
      routes/
        health.ts
        ocr.ts
        aiAnalysis.ts
        tts.ts
      providers/
        ocr/
        ai/
        tts/
      schemas/
      services/
      config/
      observability/
```

If not using a monorepo, keep the same module boundaries in one repo:

```text
mobile/
api/
docs/
```

---

## 6. Mobile Module Contract

### `input`

Responsibilities:

- Take photo.
- Pick image from gallery.
- Manual text entry/paste.
- Validate empty input and text that is too long.

Must not:

- Call AI directly.
- Analyze grammar/vocabulary on its own.

### `ocr`

Responsibilities:

- Send image to backend OCR endpoint.
- Show loading/error state.
- Show editable OCR text.
- Record `ocr_raw_text`.
- Create `confirmed_text` only after user taps confirm.

### `ai-analysis`

Responsibilities:

- Send `confirmed_text` to backend AI endpoint.
- Validate response shape on client with schema compatible with backend.
- Render fallback when section is empty.
- Do not render raw invalid response.

### `lesson`

Responsibilities:

- Map AI output to `Lesson`.
- Save and read local lesson.
- Open saved lesson without calling AI again.
- Prevent double-save.

### `analytics`

Responsibilities:

- Track funnel events.
- Do not send full user text, image, or AI output.
- Use anonymous id.

---

## 7. API Contract

Base URL is configured via env:

```text
API_BASE_URL=https://api.example.com
```

### `GET /health`

Response:

```json
{
  "ok": true,
  "service": "scan-learn-api",
  "version": "0.1.0"
}
```

### `POST /v1/ocr`

Request uses `multipart/form-data` to avoid base64 overhead with large images.

```text
POST /v1/ocr
Content-Type: multipart/form-data

fields:
  request_id: uuid
  source_type: camera | gallery
  platform: ios | android
  app_version: 0.1.0
  anonymous_user_id: local-user-id
  image_width: 1280
  image_height: 960
  image: binary file, jpeg/png/heic where supported
```

Base64 JSON upload is only for small prototype/internal tests. Closed beta/public beta must use `multipart/form-data` or equivalent streaming upload.

Response success:

```json
{
  "request_id": "uuid",
  "status": "success",
  "provider": "configured-ocr-provider",
  "ocr_raw_text": "We are offering a special discount...",
  "extracted_text": "We are offering a special discount...",
  "confidence": 0.92,
  "quality": {
    "text_length": 58,
    "text_length_bucket": "1-100",
    "line_count": 1,
    "has_english_signal": true,
    "low_confidence": false
  },
  "warnings": []
}
```

Response no text:

```json
{
  "request_id": "uuid",
  "status": "failed",
  "error": {
    "code": "OCR_NO_TEXT",
    "message": "No readable text was detected."
  },
  "warnings": ["Try a clearer image or paste text manually."]
}
```

Rules:

- Backend does not store original images by default.
- Backend may compress images or reject images that are too large.
- Backend must reject images exceeding `MAX_IMAGE_BYTES`.
- Mobile must let user paste text if OCR fails.
- Mobile displays `extracted_text` in the review editor. `ocr_raw_text` is for debug/internal review only; do not send it directly to AI.
- `quality` is non-sensitive metadata for UI warnings, QA, and analytics buckets; it does not contain raw text.

### `POST /v1/ai/analyze`

Request:

```json
{
  "request_id": "uuid",
  "confirmed_text": "We are offering a special discount for new customers.",
  "level": "Beginner",
  "native_language": "Vietnamese",
  "source_type": "paste_text",
  "prompt_version": "lesson-analysis-v1",
  "client_context": {
    "platform": "android",
    "app_version": "0.1.0",
    "anonymous_user_id": "local-user-id"
  }
}
```

Response success:

```json
{
  "request_id": "uuid",
  "status": "success",
  "model": "configured-llm-model",
  "schema_version": "ai-output-v1",
  "prompt_version": "lesson-analysis-v1",
  "usage": {
    "input_tokens": 350,
    "output_tokens": 1200
  },
  "data": {
    "title": "Special Discount Flyer",
    "detected_language": "English",
    "level": "Beginner",
    "original_text": "We are offering a special discount for new customers.",
    "vietnamese_translation": "Chúng tôi đang cung cấp một chương trình giảm giá đặc biệt cho khách hàng mới.",
    "summary": "Đoạn này nói về một ưu đãi giảm giá cho khách hàng mới.",
    "sentences": [],
    "grammar_points": [],
    "vocabulary": [],
    "pronunciation": {},
    "practice": [],
    "warnings": []
  }
}
```

Response invalid provider output:

```json
{
  "request_id": "uuid",
  "status": "failed",
  "error": {
    "code": "AI_INVALID_OUTPUT",
    "message": "AI response did not match the required schema."
  },
  "retryable": true
}
```

Rules:

- Backend must validate `confirmed_text` length before calling AI.
- Backend must validate AI output schema before returning success.
- Backend retries at most once when provider returns invalid JSON or missing required fields.
- If still invalid, return `AI_INVALID_OUTPUT`.
- Do not log full `confirmed_text` in production logs.
- `schema_version` belongs in the response envelope; `data` is the canonical AI output object and must pass `AIOutputSchema`.

### API response type conventions

Phase 0 routes use a consistent envelope:

```ts
type ApiSuccess<T> = {
  request_id: string;
  status: "success";
} & T;

type ApiError = {
  request_id: string;
  status: "failed";
  error: {
    code: string;
    message: string;
  };
  retryable?: boolean;
  warnings?: string[];
};

type OCRSuccess = ApiSuccess<{
  provider: string;
  ocr_raw_text: string;
  extracted_text: string;
  confidence?: number;
  quality: {
    text_length: number;
    text_length_bucket: "1-100" | "101-500" | "501-1000" | "1001-2000" | "2001-3000" | "3000+";
    line_count: number;
    has_english_signal: boolean;
    low_confidence: boolean;
  };
  warnings: string[];
}>;

type AIAnalyzeSuccess = ApiSuccess<{
  model: string;
  schema_version: "ai-output-v1";
  prompt_version: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  data: AIOutput;
}>;
```

### `POST /v1/tts`

This endpoint is optional in Phase 0. If cloud TTS is not available, mobile uses native TTS or pronunciation guide.

Request:

```json
{
  "request_id": "uuid",
  "text": "discount",
  "voice": "en-US",
  "speed": 0.9
}
```

Response:

```json
{
  "request_id": "uuid",
  "status": "success",
  "audio_url": "https://temporary-signed-url.example/audio.mp3",
  "expires_in_seconds": 3600
}
```

---

## 8. Standard Error Codes

| Code | Layer | Retryable | Mobile behavior |
|---|---|---|---|
| `VALIDATION_EMPTY_TEXT` | Mobile/API | No | Show empty input error |
| `VALIDATION_TEXT_TOO_LONG` | Mobile/API | No | Ask user to shorten text |
| `IMAGE_TOO_LARGE` | API | No | Compress image or choose another |
| `OCR_NO_TEXT` | API/OCR | Yes | Offer retry or paste text |
| `OCR_PROVIDER_ERROR` | OCR | Yes | Offer retry |
| `AI_TIMEOUT` | AI | Yes | Offer retry, keep `confirmed_text` |
| `AI_INVALID_OUTPUT` | AI | Yes | Offer retry or show friendly error |
| `AI_PROVIDER_ERROR` | AI | Yes | Offer retry |
| `NETWORK_ERROR` | Mobile | Yes | Offer retry when network is available |
| `LOCAL_DB_ERROR` | Mobile | Maybe | Show save/open lesson error |

---

## 9. Data Persistence

### Local-first

Phase 0 stores lessons on device.

Minimum SQLite tables:

```text
lessons
  id text primary key
  anonymous_user_id text not null
  lesson_input_hash text not null
  title text not null
  source_type text not null
  ocr_raw_text text
  confirmed_text text not null
  vietnamese_translation text not null
  summary text
  level text not null
  ai_output_json text not null
  is_saved integer not null
  created_at text not null
  updated_at text not null

app_settings
  key text primary key
  value text not null
  updated_at text not null
```

No need to split `SentenceAnalysis`, `VocabularyItem`, `GrammarPoint` into separate tables in Phase 0 if advanced search/filter is not needed yet. Store full `ai_output_json` and derive UI when rendering.

Duplicate-save prevention rule:

- `lesson_input_hash = sha256(normalized confirmed_text + level + prompt_version + schema_version)`.
- `normalized confirmed_text` is trimmed text with light whitespace normalization; do not log raw values.
- When user taps save multiple times or saves the same input/version again, repository must reuse existing lesson or reject duplicate with `saved` state; do not create a new row.

### When to split tables

Split into separate tables in Phase 1 when needed for:

- Vocabulary search.
- Flashcards.
- Spaced repetition review.
- Cross-lesson grammar analytics.
- Cloud sync.

---

## 10. AI Schema Versioning

Schema must have a version:

```text
ai-output-v1
```

In API response, `schema_version` is in the `/v1/ai/analyze` response envelope, not inside `data`. The `data` object must validate directly with `AIOutputSchema`.

Backend and mobile use the same schema logic. Source of truth is `docs/01-ba/01-schema/01-ai-output-v1.ts`; do not redefine fields from descriptive docs. If using TypeScript, prefer:

```text
Zod schema → inferred TypeScript type → runtime validation
```

Required fields per canonical schema:

- `title`
- `detected_language`
- `level`
- `original_text`
- `vietnamese_translation`
- `sentences`
- `grammar_points`
- `vocabulary`
- `warnings`

Recommended fields:

- `summary`
- `pronunciation`
- `practice`

Rules:

- `sentences`, `grammar_points`, `vocabulary`, `practice`, `warnings` are always arrays.
- `pronunciation` is always an object; may be empty.
- `original_text` in AI output must match `confirmed_text` or differ only insignificantly due to whitespace trim.
- `detected_language` in Phase 0 is expected to be `English`.

---

## 11. Feature Flags and Env

### Layer A — Build / provider flags (env)

Mobile env:

```text
API_BASE_URL=
USE_MOCK_AI=false
USE_MOCK_OCR=false
ENABLE_TTS=true
ENABLE_PRACTICE=true
MAX_TEXT_LENGTH=3000
```

API env:

```text
NODE_ENV=development
PORT=3000
AI_PROVIDER=
AI_API_KEY=
AI_MODEL=
OCR_PROVIDER=
OCR_API_KEY=
MAX_TEXT_LENGTH=3000
MAX_IMAGE_BYTES=5242880
LOG_SENSITIVE_CONTENT=false
```

Rules:

- Do not commit `.env`.
- Phase 0 locks `MAX_TEXT_LENGTH=3000` characters for mobile and API. If changing, update `.env.example`, validators, QA tests, and related business rules.
- Mobile env is read via `react-native-config` or equivalent build config.
- Do not expose provider API keys in mobile env.
- Mobile only knows backend URL, not OCR/AI keys.

Native setup notes:

- iOS requires running CocoaPods after adding native dependencies.
- Android requires checking Gradle config after adding native dependencies.
- Camera/photo permission must be declared in `Info.plist` and `AndroidManifest.xml`.
- Release build needs separate signing config for iOS and Android.

Camera strategy:

- Phase 0 uses `react-native-image-picker` to open native camera UI or photo library.
- Do not write custom native camera module in Phase 0.
- Do not use `react-native-camera` because the library is deprecated.
- Only consider `react-native-vision-camera` in Phase 1+ if custom camera preview, crop overlay, live OCR, frame processor, or real-time framing guidance is needed.
- OCR in Phase 0 runs after user takes/picks image; not live on camera preview.

### Layer B — Release module flags

Module visibility (navigation, tabs, optional API routes) is controlled by **release config JSON**,
not env vars. Spec:

- `07-modular-architecture-and-release.md`
- `08-feature-registry-release-config.md`
- `release-configs/close-beta-1.json` (P0 default)

Scaffold `src/release/` at M5. Until then, all MT-Core features are implicitly on;
post-P0 modules stay unbuilt or flag-off per task scope.

---

## 12. Privacy and Logging

Do not log:

- Full scanned image.
- Full OCR text.
- Full confirmed text.
- Full AI output.

May log:

- `request_id`
- anonymous user id
- event name
- provider name
- model name
- status
- error code
- duration
- token usage
- character count
- app version
- platform

Image handling:

- Mobile sends image to API via `multipart/form-data` in closed beta/public beta.
- Base64 only for small prototype/internal tests if simplification is needed.
- API processes image in memory or short-lived temp file.
- API deletes temp file after OCR.
- Do not store `original_image_url` in Phase 0 unless user/PO decides otherwise.

---

## 13. Analytics Implementation

Mobile tracks events in `08-operations/01-analytics-kpi-events.md`.

Minimum required payload:

```json
{
  "event_name": "ai_analysis_completed",
  "anonymous_user_id": "local-user-id",
  "timestamp": "2026-06-04T14:00:00.000Z",
  "platform": "ios",
  "app_version": "0.1.0",
  "properties": {
    "source_type": "paste_text",
    "status": "success",
    "duration_ms": 8400,
    "text_length_bucket": "501-1000"
  }
}
```

Text length bucket:

```text
1-100
101-500
501-1000
1001-2000
2001-3000
3000+
```

Do not send raw text in event properties.

---

## 14. UI Implementation Rules

**Phase 0 layout (locked):** lesson result is a **single scrollable screen** with sections below — not a hub that navigates to separate full screens. See `06-design/01-user-flow-screen-spec.md` §7 and `06-design/02-ui-wireframes.md` §5. Section detail wireframes (§6–9) describe **inline** content within the scroll.

Lesson result renders in this order:

1. Title.
2. Original text.
3. Vietnamese translation.
4. Summary.
5. Sentence analysis.
6. Vocabulary.
7. Grammar.
8. Pronunciation.
9. Practice.
10. Save action.

Rules:

- Empty sections must render empty state; no crash.
- Vocabulary shows at most 5 items initially; expand if more.
- Grammar shows at most 3 points.
- AI loading must preserve `confirmed_text`.
- Back from loading requires confirmation if request is in progress.
- Saved lesson detail does not call AI again.

---

## 15. Test Strategy

API proxy test, security, and contract enforcement: `02-technical/12-api-backend-development-rules.md` (LingoBites-Server repo).

### Unit test

Required for:

- AI output schema validator.
- Lesson mapper.
- Text length validator.
- Error code mapper.
- Local lesson repository.

### Integration test

Required for:

- `/v1/ocr` mock provider success/fail.
- `/v1/ai/analyze` mock provider valid/invalid output.
- Retry invalid AI output.
- No sensitive logging mode.

### Mobile UI test

P0 priority:

- Paste text → mock AI → result screen.
- OCR failed → paste fallback.
- Edit OCR → analyze uses edited text.
- Save lesson → history → detail.
- Invalid AI output → friendly error.

### Manual QA

Per `05-qa/01-qa-test-plan.md`, minimum pass:

- TC-001 through TC-010 for P0.
- TC-011 through TC-013 if save lesson is enabled in beta.

---

## 16. Technical Milestones

### M1 — Local UI prototype

Deliverable:

- React Native app runs on iOS simulator and Android emulator.
- Paste text screen.
- Mock AI output.
- Result renderer.
- AI schema validator.

Exit criteria:

- Renders full result and result with missing optional sections.
- No real OCR/backend required.

### M2 — Backend proxy and real AI

Deliverable:

- Fastify API.
- `/health`.
- `/v1/ai/analyze`.
- AI provider adapter.
- Zod validation.

Exit criteria:

- AI output valid schema >= 95% with sample test suite.
- Invalid output does not crash mobile.

### M3 — OCR flow

Deliverable:

- Camera/gallery input.
- `/v1/ocr`.
- OCR review/edit.

Exit criteria:

- 20 sample images pass internal OCR flow.
- User can edit OCR text before AI analysis.

### M4 — Save/history beta

Deliverable:

- SQLite lesson repository.
- Save lesson.
- History.
- Lesson detail.
- Delete local data.

Exit criteria:

- Saved lessons persist after app restart.
- Detail does not call AI again.

### M5 — Beta polish

Deliverable:

- Analytics.
- Error states.
- Loading states.
- Privacy note.
- QA P0 pass.

Exit criteria:

- Release checklist in `04-product/06-roadmap-release-plan.md` passes.

---

## 17. Decisions That May Still Change

The following decisions may change before significant coding:

| Topic | Default | May change to |
|---|---|---|
| Backend framework | Fastify | NestJS, Supabase Edge Functions |
| OCR | Cloud OCR via proxy | On-device OCR if team accepts native setup |
| Local DB | `react-native-quick-sqlite` | `react-native-sqlite-storage`, Realm, WatermelonDB |
| State management | Local state + Zustand | Redux Toolkit |
| TTS | Native TTS | Cloud TTS cached |
| Auth | No login | Supabase/Firebase Auth |

If changed, update this file before implementation to avoid doc drift.

---

## 18. Definition of Ready for Development

Coding can start when:

- App repo has chosen React Native CLI + TypeScript or alternative stack is documented.
- `.env.example` has sufficient mobile and API variables.
- AI output schema v1 exists as runtime validator.
- Valid mock AI output is available.
- At least 5 sample input texts exist to test result renderer.
- First OCR/AI provider decision exists or mock provider is ready for M1.

---

## 19. Updated Implementation Prompt

```text
You are implementing LingoBites Phase 0.

Read these docs first:
1. docs/01-ba/04-product/04-phase0-prd.md
2. docs/01-ba/03-requirements/01-functional-requirements.md
3. docs/01-ba/02-technical/03-ai-output-requirements.md
4. docs/01-ba/02-technical/05-data-model.md
5. docs/01-ba/05-qa/01-qa-test-plan.md
6. docs/01-ba/02-technical/06-ai-agent-implementation-guide.md
7. docs/01-ba/02-technical/01-technical-implementation-spec.md

Default technical decisions:
- React Native CLI + TypeScript.
- Local-first lesson storage using SQLite.
- No required login in Phase 0.
- Backend API proxy protects OCR/AI keys.
- Do not store original images by default.
- Validate AI output before rendering or saving.
- Saved lesson detail must not call AI again.

Start with M1:
Paste text screen → mock AI output → schema validation → result screen.
```
