# QA Test Plan

## 1. Test objectives

Ensure Phase 0 runs stably for the core flow:

```text
Input image/text → OCR/edit → AI analysis → result display → save lesson → review lesson
```

---

## 2. Test scope

### In scope

- Camera/photo upload.
- Paste text.
- OCR success/fail.
- Edit OCR text.
- AI analysis response handling.
- Result UI rendering.
- Grammar/vocabulary/sentence display.
- Pronunciation basic behavior.
- Save lesson and lesson history.
- Error states.
- Basic validation tracking events.

### Out of scope

- Payment.
- User subscription.
- Advanced speaking score.
- Community.
- Full offline mode.

---

## 3. Test types

| Test type | Purpose |
|---|---|
| Functional test | Verify features work as expected |
| UI test | Verify layout and states |
| Integration test | Verify OCR/AI/TTS/backend integration |
| Regression test | Ensure existing flow not broken |
| Error handling test | Verify retry and failure states |
| Performance test | Check OCR/AI waiting time |
| Privacy test | Check sensitive data handling basics |

---

## 4. Functional test cases

### TC-001: Take photo successfully

| Item | Detail |
|---|---|
| Preconditions | Camera permission granted |
| Steps | Open app → Tap "Chụp ảnh" → Take photo → Confirm |
| Expected result | Image preview is shown before OCR; user confirms/continues before OCR starts |
| Priority | P0 |

---

### TC-002: Camera permission denied

| Item | Detail |
|---|---|
| Preconditions | Camera permission denied |
| Steps | Tap "Chụp ảnh" |
| Expected result | App shows permission message and alternative input options |
| Priority | P0 |

---

### TC-003: Upload image successfully

| Item | Detail |
|---|---|
| Preconditions | Photo permission granted |
| Steps | Tap "Upload ảnh" → Select image |
| Expected result | Selected image preview is shown |
| Priority | P0 |

---

### TC-004: OCR succeeds with clear text image

| Item | Detail |
|---|---|
| Test data | Clear flyer image with English sentences |
| Steps | Upload image → Run OCR |
| Expected result | Extracted text appears in editable text area |
| Priority | P0 |

---

### TC-005: OCR fails with image containing no text

| Item | Detail |
|---|---|
| Test data | Image with no text |
| Steps | Upload image → Run OCR |
| Expected result | App shows no text detected message and retry/manual input options |
| Priority | P0 |

---

### TC-006: Edit OCR text before analysis

| Item | Detail |
|---|---|
| Steps | OCR image → Edit extracted text → Tap "Phân tích" |
| Expected result | AI receives edited text, not raw OCR text |
| Priority | P0 |

---

### TC-007: Paste text and analyze

| Item | Detail |
|---|---|
| Steps | Select "Dán text" → Enter English text → Tap "Phân tích" |
| Expected result | App creates learning result |
| Priority | P0 |

---

### TC-008: Validation when text is empty

| Item | Detail |
|---|---|
| Steps | Open paste text → Leave empty → Tap "Phân tích" |
| Expected result | App prevents submission and shows validation message |
| Priority | P0 |

---

### TC-009: Render AI result

| Item | Detail |
|---|---|
| Steps | Analyze valid English text |
| Expected result | Result screen shows original text, Vietnamese translation, sentence analysis, vocabulary, grammar |
| Priority | P0 |

---

### TC-010: Handle invalid AI JSON

| Item | Detail |
|---|---|
| Setup | Mock AI returns invalid JSON |
| Steps | Analyze text |
| Expected result | App/backend retries or shows friendly error without crash |
| Priority | P0 |

---

### TC-011: Save lesson

| Item | Detail |
|---|---|
| Steps | Open result → Tap "Lưu bài học" |
| Expected result | Lesson is saved and saved state is shown |
| Priority | P1 |

---

### TC-012: Open saved lesson

| Item | Detail |
|---|---|
| Preconditions | At least one saved lesson exists |
| Steps | Open Lessons → Tap lesson |
| Expected result | Lesson detail opens without new AI analysis |
| Priority | P1 |

---

### TC-013: Prevent duplicate save

| Item | Detail |
|---|---|
| Steps | Tap "Lưu bài học" multiple times in a row |
| Expected result | Only one lesson is created |
| Priority | P1 |

---

### TC-014: Play pronunciation audio

| Item | Detail |
|---|---|
| Preconditions | TTS/audio available |
| Steps | Tap play on sentence or word |
| Expected result | Audio plays successfully |
| Priority | P1 |

---

### TC-015: Answer practice question

| Item | Detail |
|---|---|
| Steps | Open Quick Practice → Select answer |
| Expected result | App shows correct/incorrect and explanation |
| Priority | P2 |

---

### TC-016: Replace selected image (FR-IN-005)

| Item | Detail |
|---|---|
| Preconditions | An image has been selected or captured |
| Steps | On preview screen → Tap "Đổi ảnh" → Select another image |
| Expected result | New image replaces old one; OCR/analyze uses new image, not old image |
| Priority | P0 |

---

### TC-017: OCR loading state (FR-OCR-002)

| Item | Detail |
|---|---|
| Steps | Select image → Trigger OCR |
| Expected result | Loading shown while OCR runs; cannot submit/OCR again while running; loading disappears on success/error |
| Priority | P0 |

---

### TC-018: Common image formats (FR-OCR-007)

| Item | Detail |
|---|---|
| Test data | Valid jpg, png, heic images; one non-image file or unsupported format |
| Steps | Upload each file in turn |
| Expected result | jpg/png/heic: OCR runs normally. Unsupported file: clear error, no crash |
| Priority | P0 |

---

### TC-019: AI timeout preserves input (FR-AI-006)

| Item | Detail |
|---|---|
| Setup | Mock AI returns timeout (or exceeds time threshold) |
| Steps | Enter/confirm text → Analyze → Wait for timeout |
| Expected result | App shows error + Retry button; `confirmed_text` remains intact, user does not need to re-enter; Retry calls again with same text |
| Priority | P0 |

---

### TC-020: Grammar point limit (FR-GR-005)

| Item | Detail |
|---|---|
| Test data | Input with many sentences containing >3 grammar structures |
| Steps | Analyze → Open Grammar section |
| Expected result | UI shows at most 3 grammar points (per `02-technical/01-technical-implementation-spec.md §14`), not overwhelming |
| Priority | P0 |

---

### TC-021: Vocabulary limit (FR-VOC-007)

| Item | Detail |
|---|---|
| Test data | Long input with many important vocabulary items (>5) |
| Steps | Analyze → Open Vocabulary section |
| Expected result | UI shows ≤5 items by default, with "xem thêm" to expand (per `02-technical/01-technical-implementation-spec.md §14`) |
| Priority | P0 |

---

### TC-022: Default level Beginner (FR-SET-001)

| Item | Detail |
|---|---|
| Preconditions | Fresh install / settings never changed |
| Steps | Open Profile/Settings |
| Expected result | Learning level defaults to Beginner; AI request sends `level: "Beginner"` |
| Priority | P1 |

---

### TC-023: Funnel events (FR-OPS-003)

| Item | Detail |
|---|---|
| Setup | Enable analytics capture (debug/mock sink) |
| Steps | Complete core flow: input → analyze → result → save |
| Expected result | Funnel events fire with correct names + minimal payload (per `08-operations/01-analytics-kpi-events.md` and `02-technical/01-technical-implementation-spec.md §13`); NO raw text/image/AI output in payload (FR-OPS-002) |
| Priority | P1 |

---

## 5. Edge cases

| Case | Expected behavior |
|---|---|
| Image is blurry | Show OCR low quality/no text message |
| Text contains mixed English/Vietnamese | Analyze English parts or warn user |
| Text is too long | Show length warning |
| Text has bullet points | Preserve structure as much as possible |
| Text has all caps | OCR/AI still works |
| AI returns empty vocabulary | Show friendly empty state |
| AI returns no grammar | Show friendly empty state |
| User exits during loading | Preserve draft if possible |
| Network lost during AI call | Show retry and keep text |
| App restarted after saved lesson | Lesson still exists |

---

## 6. Suggested test data

### Simple flyer

```text
We are offering a special discount for new customers.
Please visit our store before Friday.
```

### Menu

```text
Today's special: grilled chicken with rice.
Free drink for orders over $20.
```

### Sign

```text
Please keep the door closed.
Staff only.
```

### Email

```text
Your appointment has been confirmed.
Please arrive 10 minutes early.
```

### Short article excerpt

```text
Many people are learning English online because it is flexible and affordable.
```

---

## 7. QA exit criteria

Phase 0 test can pass if:

- All P0 test cases pass.
- No critical crash in core flow.
- AI invalid response does not crash app.
- Save/open lesson works.
- OCR fail has recovery path.
- Result UI displays all required sections correctly.

---

## 8. Integration test cases — AI/OCR

These tests verify core integration described in `02-technical/04-ai-ocr-integration.md`. Run from M2/M3 onward with mock provider first, then re-run with real provider before closed beta.

### INT-OCR-001: Upload clear-text image via multipart

| Item | Detail |
|---|---|
| Setup | Backend `/v1/ocr` running with mock or real OCR provider |
| Test data | Clear-text image, size <= 5 MB |
| Steps | Mobile/API test sends image via `multipart/form-data` |
| Expected result | Response `status=success`, has `extracted_text`, `quality.text_length_bucket`, original image not stored |
| Priority | P0 |

---

### INT-OCR-002: Upload image with no text

| Item | Detail |
|---|---|
| Test data | Image with no text |
| Steps | Send image to `/v1/ocr` |
| Expected result | Error response `OCR_NO_TEXT`; mobile shows retry or paste text fallback |
| Priority | P0 |

---

### INT-OCR-003: Reject oversized image

| Item | Detail |
|---|---|
| Test data | Image exceeding `MAX_IMAGE_BYTES` |
| Steps | Send image to `/v1/ocr` |
| Expected result | Error response `IMAGE_TOO_LARGE`; backend does not call OCR provider |
| Priority | P0 |

---

### INT-OCR-004: OCR low confidence warning

| Item | Detail |
|---|---|
| Setup | Mock OCR returns low confidence or real provider returns low confidence |
| Steps | Send blurry/low-contrast image |
| Expected result | Response includes warning; OCR review screen shows suggestion to capture more clearly but still allows user to edit text |
| Priority | P1 |

---

### INT-AI-001: Valid confirmed text

| Item | Detail |
|---|---|
| Setup | Backend `/v1/ai/analyze` running with mock or real AI provider |
| Steps | Send English `confirmed_text` <= 3,000 characters |
| Expected result | Response `status=success`, `schema_version=ai-output-v1`, data passes `AIOutputSchema` |
| Priority | P0 |

---

### INT-AI-002: Provider returns invalid JSON

| Item | Detail |
|---|---|
| Setup | Mock AI returns invalid JSON on first attempt |
| Steps | Send analyze request |
| Expected result | Backend retries exactly once with repair/strict prompt; request does not crash |
| Priority | P0 |

---

### INT-AI-003: Invalid after retry

| Item | Detail |
|---|---|
| Setup | Mock AI returns invalid output on both attempts |
| Steps | Send analyze request |
| Expected result | Error response `AI_INVALID_OUTPUT`; mobile shows friendly error + retry, preserves `confirmed_text` |
| Priority | P0 |

---

### INT-AI-004: AI timeout

| Item | Detail |
|---|---|
| Setup | Mock AI timeout or delay exceeds threshold |
| Steps | Send analyze request |
| Expected result | Response/UX timeout error; input not lost; retry uses same `confirmed_text` |
| Priority | P0 |

---

### INT-E2E-001: OCR edited text → AI

| Item | Detail |
|---|---|
| Steps | OCR image → Edit text in review → Confirm → Analyze |
| Expected result | AI request uses edited text, not `ocr_raw_text`; analytics does not contain raw text |
| Priority | P0 |

---

### INT-E2E-002: Saved lesson reopen

| Item | Detail |
|---|---|
| Preconditions | Saved lesson from valid AI output exists |
| Steps | Close/open app → Open lesson detail |
| Expected result | Lesson renders from local `ai_output_json`; does not call `/v1/ai/analyze` again |
| Priority | P0 |

---

## 9. Theme system test cases (M5 / theme iteration)

Full definitions: `06-design/03-theme-system.md` §8. These do **not** block M1–M4 core loop.

| ID | Title | Priority |
|---|---|---|
| TC-024 | Runtime theme switch | P2 |
| TC-025 | Theme persistence | P2 |
| TC-026 | Provider guard (`useAppTheme` outside Provider throws) | P2 |
| TC-027 | Parametrized render all registry themes | P2 |
| TC-028 | No hard-coded styles + ESLint color-literal rule | P2 |
| TC-029 | Removed/unknown persisted theme → fallback `default` | P2 |
| TC-030 | ThemePicker omits themes when feature flag off | P2 |
