# AI & OCR Integration Deep Dive — Phase 0

## 1. Purpose

AI and OCR are the technical core of **LingoBites**. This document goes deep on integration so the pipeline is stable, easy to debug, cost-controlled, and produces learning output good enough for Vietnamese beginners.

This document supplements:

- `03-requirements/02-business-rules.md`
- `02-technical/03-ai-output-requirements.md`
- `05-qa/01-qa-test-plan.md`
- `02-technical/01-technical-implementation-spec.md`
- `02-technical/02-implementation-plan-m1-m5.md`
- `01-schema/01-ai-output-v1.ts`

The most important principle:

```text
OCR creates draft text → user confirm → AI analyzes confirmed_text only → schema validate → UI render/save.
```

Do not skip the user OCR confirm step.

---

## 2. End-to-End Pipeline

```text
Image/text input
  → input validation
  → image preprocessing
  → OCR provider
  → OCR normalization
  → OCR quality assessment
  → OCR review/edit screen
  → confirmed_text
  → AI request builder
  → AI provider
  → JSON parse
  → schema validation
  → content quality checks
  → lesson mapper
  → result UI
  → local save
```

Each step must have:

- clear input
- clear output
- clear error code
- log metadata without raw content
- corresponding test fixture

---

## 3. OCR Integration Architecture

### OCR provider interface

Backend exposes only one internal interface; routes must not depend on a specific provider:

```ts
type OCRInput = {
  requestId: string;
  imageBuffer: Buffer;
  mimeType: "image/jpeg" | "image/png" | "image/heic";
  sourceType: "camera" | "gallery";
  imageWidth?: number;
  imageHeight?: number;
};

type OCRTextBlock = {
  text: string;
  confidence?: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

type OCRResult = {
  provider: string;
  rawText: string;
  normalizedText: string;
  confidence?: number;
  blocks: OCRTextBlock[];
  warnings: string[];
};

interface OCRProvider {
  extractText(input: OCRInput): Promise<OCRResult>;
}
```

Phase 0 UI only needs `normalizedText`, `confidence`, `warnings`. `blocks` is kept in backend response or debug mode for future text-region highlighting if needed.

### OCR route normalized response

```json
{
  "request_id": "uuid",
  "status": "success",
  "provider": "configured-ocr-provider",
  "ocr_raw_text": "SPECIAL\\nDISCOUNT",
  "extracted_text": "SPECIAL DISCOUNT",
  "confidence": 0.91,
  "quality": {
    "text_length": 16,
    "text_length_bucket": "1-100",
    "line_count": 2,
    "has_english_signal": true,
    "low_confidence": false
  },
  "warnings": []
}
```

Mobile displays `extracted_text` in the OCR review editor. For internal debug, `ocr_raw_text` may be shown, but do not send raw OCR directly to AI.

---

## 4. Image Preprocessing

Preprocessing goal is to improve OCR success without distorting images or losing text.

### Camera capture strategy

Phase 0 does not need a custom native camera.

Decisions:

- Use `react-native-image-picker` to open native camera UI and photo library.
- OCR runs after image is taken/selected and user sees preview.
- Do not run OCR live on camera preview in Phase 0.
- Do not use `react-native-camera` because it is deprecated.
- Do not use `react-native-vision-camera` in Phase 0 to reduce native complexity.

Only switch to `react-native-vision-camera` in Phase 1+ if needed for:

- custom in-app camera preview
- crop/scan frame overlay
- live OCR/frame processor
- real-time framing guidance
- deep control of focus, exposure, zoom

### Mobile preprocessing

Mobile should:

- Resize image if long edge > 2,000 px.
- Compress JPEG reasonably so processed file <= 5 MB.
- Keep correct orientation.
- Keep color or grayscale per provider; do not over-threshold.
- Send `image_width`, `image_height`, `mime_type`, `source_type`.

Mobile should not:

- Auto-crop without confirmation UI.
- Apply strong filters that lose accents/small text.
- Store original image long-term.

### Backend preprocessing

Backend should:

- Validate real MIME, not only trust header.
- Reject files exceeding `MAX_IMAGE_BYTES`.
- Normalize orientation if provider needs it.
- Create short-lived temp file if provider SDK needs file path.
- Delete temp file after request.

Backend should not:

- Store original images by default.
- Log binary image or OCR raw text.

---

## 5. OCR Quality Assessment

OCR is not only success/fail. Quality must be classified so UX can choose messages.

| Signal | Rule | Action |
|---|---|---|
| Empty text | `normalizedText.trim().length === 0` | `OCR_NO_TEXT`, offer retry/paste |
| Too short | 1-2 characters | Warning, let user edit or paste |
| Low confidence | provider confidence < 0.65 if available | Warning blurry/hard-to-read image |
| Too long | text > 3,000 characters | Warn to shorten or require trimming |
| Not English signal | few Latin letters or much Vietnamese | Warning but still allow analyze if user wants |
| Many line breaks | many short lines | Preserve line breaks in editor |

Suggested quality object:

```ts
type OCRQuality = {
  textLength: number;
  textLengthBucket: TextLengthBucket;
  lineCount: number;
  hasEnglishSignal: boolean;
  lowConfidence: boolean;
  tooLong: boolean;
  warnings: string[];
};
```

---

## 6. OCR Normalization Rules

Normalization must be light-handed so user content is not wrongly changed.

Should do:

- Convert CRLF to LF.
- Trim start/end.
- Collapse more than 3 consecutive blank lines to 1 blank line.
- Normalize smart quotes if provider returns odd characters.
- Keep bullets/line breaks if text has menu/sign/email structure.

Should not do:

- Auto-fix spelling with AI before user confirm.
- Auto-translate or paraphrase OCR text.
- Bulk-remove punctuation.
- Drop lines if meaning could change.

Rule:

```text
ocr_raw_text = provider output near-original
extracted_text = lightly normalized for user review
confirmed_text = text user confirms/edits, source of truth for AI
```

---

## 7. OCR Error Taxonomy

| Error code | Cause | Retry | UX |
|---|---|---|---|
| `OCR_NO_TEXT` | No text recognized | Yes | Try clearer image or enter text |
| `OCR_LOW_QUALITY_IMAGE` | Blurry/dark/low contrast image | Yes | Suggest retake |
| `OCR_UNSUPPORTED_IMAGE_TYPE` | MIME not supported | No | Choose JPG/PNG/HEIC image |
| `IMAGE_TOO_LARGE` | File too large | No | Compress/choose another image |
| `OCR_PROVIDER_TIMEOUT` | Provider timeout | Yes | Retry |
| `OCR_PROVIDER_ERROR` | General provider error | Yes | Retry |

Mobile copy must be friendly and always offer paste text fallback.

---

## 8. AI Integration Architecture

### AI provider interface

```ts
type AIAnalysisInput = {
  requestId: string;
  confirmedText: string;
  level: "Beginner" | "Elementary" | "Intermediate";
  nativeLanguage: "Vietnamese";
  sourceType: "camera" | "gallery" | "paste_text";
  promptVersion: "lesson-analysis-v1";
  schemaVersion: "ai-output-v1";
};

type AIProviderResult = {
  provider: string;
  model: string;
  rawText: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
};

interface AIProvider {
  analyze(input: AIAnalysisInput): Promise<AIProviderResult>;
}
```

`AIProvider` only calls the model. `AIAnalysisService` is responsible for parse, validate, retry, normalize, and error mapping.

### AI analysis service flow

```text
validate confirmed_text
  → build prompt
  → call provider
  → parse JSON
  → validate AIOutputSchema
  → check original_text ~= confirmed_text
  → check output limits
  → return normalized data
```

Do not put prompt logic or provider-specific parsing in route controllers.

---

## 9. Prompt Strategy

Prompt must be versioned:

```text
lesson-analysis-v1
```

Prompt must include:

- role: English teacher for Vietnamese beginners
- target user: Vietnamese beginner
- source text
- strict output instruction
- schema summary
- constraints:
  - no markdown outside JSON
  - grammar/vocabulary must come from input
  - max grammar points: 3
  - default vocabulary target: 5-8 items, max 12
  - simple Vietnamese explanation
  - practice questions based only on lesson

Prompt should not:

- Ask AI to silently fix OCR.
- Request too many sections outside schema.
- Tell AI to invent knowledge not in input.

---

## 10. Structured Output and Validation

Schema source of truth is:

```text
docs/01-ba/01-schema/01-ai-output-v1.ts
```

Backend must:

1. Parse provider response into object.
2. Validate with `AIOutputSchema`.
3. Apply defaults via Zod if valid.
4. Verify `original_text.trim() === confirmed_text.trim()` or differ only by light whitespace.
5. Retry at most once if parse/validate fails.
6. Return `AI_INVALID_OUTPUT` if still fails.

Mobile must:

1. Re-validate response before render.
2. Render empty state for empty arrays.
3. Not crash if optional field is missing because schema already normalizes.

---

## 11. AI Content Quality Checks

Valid schema is not enough. Content must be checked before ship.

### Automatic checks

| Check | Rule | Failure handling |
|---|---|---|
| Original text match | `data.original_text` matches `confirmed_text` after trim | Retry or fail |
| Grammar count | `grammar_points.length <= 3` | Trim UI or ask model retry |
| Vocabulary count | `vocabulary.length <= 12` | Trim UI or ask model retry |
| Vocabulary source | `word` or `phrase_from_text` should appear in input | Warning/manual QA |
| Language | translation/explanation in Vietnamese | Warning/manual QA |
| Practice count | 0-3 questions Phase 0 | Trim UI |

### Manual QA checks

- Translation is natural.
- Explanation is not overly academic.
- Grammar point actually appears in input.
- Vocabulary is not all overly common words.
- Pronunciation guide does not cause serious misunderstanding.

---

## 12. Retry and Fallback Strategy

### OCR

| Failure | Retry strategy | Fallback |
|---|---|---|
| No text | User-triggered retry | Paste text |
| Low confidence | User-triggered retry | Edit OCR text |
| Provider timeout | Retry button | Paste text |
| Unsupported image | No retry same file | Choose another image |

### AI

| Failure | Retry strategy | Fallback |
|---|---|---|
| Invalid JSON | Backend auto retry once with stricter repair prompt | Friendly error + retry |
| Schema missing field | Backend auto retry once | Friendly error + retry |
| Timeout | No infinite auto retry | Preserve confirmed text |
| Provider down | Retry later | Keep input and saved draft if available |
| Content too long | No provider call | Ask user shorten text |

Rule:

```text
Auto retry only for provider/format errors that user cannot fix.
User-triggered retry for OCR quality and network-like failures.
```

---

## 13. Provider Selection Criteria

Do not choose provider only because demo looks good. Choose by scorecard.

### OCR scorecard

| Criterion | Weight | Notes |
|---|---:|---|
| Accuracy on real-world images | 35% | menu, signs, flyer, screenshot, email |
| Latency | 15% | P50/P95 per NFR |
| Cost | 15% | cost per OCR request |
| Language/text layout support | 10% | English, mixed symbols, line breaks |
| API stability | 10% | timeout/error behavior |
| Privacy/data retention terms | 10% | do not use data for training without consent |
| SDK/API simplicity | 5% | easy backend integration |

### AI scorecard

| Criterion | Weight | Notes |
|---|---:|---|
| Schema validity | 25% | valid >= 95% after retry |
| Vietnamese explanation quality | 25% | beginner-friendly |
| Grammar/vocab faithfulness | 20% | do not invent beyond input |
| Latency | 10% | P50/P95 per NFR |
| Cost | 10% | cost per generated lesson |
| Safety/privacy terms | 5% | data handling |
| Observability/usage data | 5% | token usage, error info |

First provider must pass minimum scorecard before closed beta.

---

## 14. Evaluation Suite

### OCR sample set

Need at least 30 images before closed beta:

| Group | Sample count | Examples |
|---|---:|---|
| Flyer/discount | 5 | poster, promotions |
| Menu/restaurant | 5 | menu, price board |
| Signage | 5 | staff only, open/closed |
| Screenshot | 5 | email, app text |
| Long paragraph | 5 | short article excerpt |
| Hard cases | 5 | slight blur, tilt, weak lighting |

Metrics:

- OCR success rate.
- Manual character error rate on samples with ground truth.
- No-text false negative.
- Average latency.
- User edit distance if tested with beta users.

### AI sample set

Need at least 30 texts before closed beta:

| Group | Sample count | Goal |
|---|---:|---|
| Short sign | 5 | short text, little grammar |
| Marketing/flyer | 5 | practical vocabulary |
| Menu/service | 5 | noun phrases |
| Email/notice | 5 | polite requests |
| Paragraph | 5 | multi-sentence |
| Edge/mixed text | 5 | mixed EN/VI, bullet, noisy OCR |

Metrics:

- Schema valid rate.
- Retry rate.
- Grammar faithfulness.
- Vocabulary source correctness.
- Beginner clarity score.
- Cost per lesson.
- Latency P50/P95.

---

## 15. Observability for AI/OCR

Minimum log metadata:

```json
{
  "request_id": "uuid",
  "operation": "ai_analysis",
  "provider": "provider-name",
  "model": "model-name",
  "status": "success",
  "duration_ms": 12400,
  "error_code": null,
  "text_length_bucket": "501-1000",
  "schema_version": "ai-output-v1",
  "prompt_version": "lesson-analysis-v1",
  "retry_count": 0,
  "timestamp": "2026-06-04T14:00:00.000Z"
}
```

Do not log:

- raw image
- full OCR text
- confirmed text
- full AI output

Internal debug may use fixtures or consent/anonymized samples.

---

## 16. Caching and Idempotency

### Request id

Mobile creates `request_id` for OCR/AI requests. Backend logs by `request_id`.

### Lesson hash

To avoid duplicate AI calls in the same session:

```text
lesson_input_hash = sha256(normalized confirmed_text + level + prompt_version + schema_version)
```

Phase 0 may cache in-memory or local-only. No global backend cache needed if privacy is not yet reviewed.

### Saved lesson

Saved lesson always uses local `ai_output_json`. Reopening lesson does not call AI.

---

## 17. Security and Privacy Controls

AI/OCR integration must have:

- Provider keys only on backend.
- HTTPS required.
- Request size limit.
- Text length limit.
- Rate limit.
- No raw content logs.
- Temp image cleanup.
- Privacy note before or on first camera/upload use.
- Support path for user questions/delete local data.

If provider has option to not use data for training, enable it when available.

---

## 18. Implementation Order for Integration

Do not connect OCR and AI at the same time.

```text
1. Mock AI result screen
2. Real AI with typed text only
3. OCR provider with manual review
4. OCR → confirmed_text → AI
5. Save/reopen result
6. Analytics + quality metrics
```

Reasons:

- If result UI is not stable, real OCR/AI only makes debugging harder.
- If AI schema is not stable, real OCR does not improve the product.
- If OCR has no review, AI analyzes wrong text and users lose trust.

---

## 19. Integration Test Cases to Add

| ID | Test | Expected |
|---|---|---|
| INT-OCR-001 | Upload clear-text image via multipart | OCR success, has extracted_text |
| INT-OCR-002 | Upload image with no text | `OCR_NO_TEXT`, paste fallback available |
| INT-OCR-003 | Upload image > 5 MB | `IMAGE_TOO_LARGE` |
| INT-OCR-004 | OCR low confidence | Warning shown on review screen |
| INT-AI-001 | Valid confirmed_text | AI success, schema valid |
| INT-AI-002 | Provider returns invalid JSON | backend retries once |
| INT-AI-003 | Invalid after retry | `AI_INVALID_OUTPUT` |
| INT-AI-004 | AI timeout | keeps confirmed_text, offers retry |
| INT-E2E-001 | OCR edited text → AI | AI receives edited text |
| INT-E2E-002 | Saved lesson reopen | Does not call AI again |

These tests should be added to `05-qa/01-qa-test-plan.md` or technical test suite when starting M2/M3.

---

## 20. Definition of Integration Ready

AI/OCR integration is ready for closed beta when:

- `/v1/ocr` uses multipart upload and rejects oversized images.
- OCR result has quality assessment and warnings.
- OCR review is required before AI.
- `/v1/ai/analyze` validates with `AIOutputSchema`.
- Backend retries invalid AI output at most once.
- Mobile re-validates before render.
- Confirmed text is not lost after AI/OCR/network errors.
- Logs do not contain raw content.
- Sample OCR set and AI set have been run.
- AI/OCR latency, error, retry, cost metrics are measured.
