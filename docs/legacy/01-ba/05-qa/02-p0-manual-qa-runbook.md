# P0 Manual QA Runbook — Phase 0 Closed Beta Gate

> **Canonical test definitions:** `01-qa-test-plan.md` (TC-001..023)  
> **Automated gate first:** from repo root run `npm run qa:p0:automated` (mobile + API unit/integration tests).  
> **This runbook:** device/simulator steps for cases that still need human verification.

**Sign-off target:** all **P0** rows below = Pass before closed beta (`07-release/01-release-production-readiness.md` §5).

---

## 0. Test environment

| Item | Closed beta (recommended) | Quick dev smoke |
|---|---|---|
| Mobile env | `.env.staging` or `.env.production` | `.env.development` |
| `USE_MOCK_AI` | `false` | `true` (UI-only) |
| `USE_MOCK_OCR` | `false` | `true` (UI-only) |
| API | Staging HTTPS `/health` OK | `localhost:3001` + `npm run api:dev` |
| AI provider | `AI_PROVIDER=gemini` + key on backend | `mock` |
| Analytics | Metro/Xcode log: `[analytics]` events | Same (console adapter) |
| Devices | 1× iOS + 1× Android minimum | Simulator OK for first pass |

**Sample English text (paste/OCR check):**

```text
We are offering a special discount for new customers.
Please visit our store before Friday.
```

---

## 1. P0 functional checklist

Mark: ☐ Pass · ☐ Fail · ☐ Skip (note reason)

| ID | Summary | Steps (short) | Expected |
|---|---|---|---|
| TC-001 | Camera capture | Home → Chụp ảnh → take/select → preview → Tiếp tục | Preview before OCR; OCR review screen after |
| TC-002 | Camera denied | Deny permission → Chụp ảnh | Permission copy + Thử lại + Nhập text thủ công |
| TC-003 | Gallery upload | Home → Upload ảnh → pick image | Preview shown |
| TC-004 | OCR success | Clear English image → OCR | Editable extracted text |
| TC-005 | OCR no text | Blank/no-text image | Error + retry + paste fallback |
| TC-006 | Edit OCR | OCR review → edit text → Phân tích | AI uses edited text (not raw OCR) |
| TC-007 | Paste analyze | Dán text → Tạo bài học | Lesson result §14 sections |
| TC-008 | Empty paste | Clear input → Tạo bài học | Validation message, no API call |
| TC-009 | Result render | After analyze | Original, translation, sentences, vocab, grammar visible |
| TC-010 | Invalid AI | Backend mock invalid / force invalid | Friendly error, no crash (auto: INT-AI-003) |
| TC-016 | Replace image | Preview → Chọn ảnh khác | New image used |
| TC-017 | OCR loading | Select image → continue | Spinner; no double submit |
| TC-018 | Image formats | jpg, png, heic | OCR works; unsupported → clear error |
| TC-019 | AI fail retry | Airplane mode or stop API → analyze | Error + **Thử lại**; text preserved |
| TC-020 | Grammar ≤3 | Full fixture / long input | Max 3 grammar cards |
| TC-021 | Vocab ≤5 | Full fixture / long input | ≤5 + "xem thêm" |

**P1 (run before beta if time):** TC-011 save · TC-012 reopen (no AI) · TC-013 dedup save · TC-022 Beginner in Profile · TC-023 analytics (see §2).

---

## 2. Analytics verification (TC-023 / FR-OPS-003)

1. Run app in **Debug** with Metro or Xcode console visible.
2. Complete flow: Home → paste text → analyze → result → save.
3. Confirm `[analytics]` log lines appear in order (names only):

```text
app_opened
input_method_selected (paste_text)
text_entered
text_confirmed
ai_analysis_started
ai_analysis_completed (status success|failed)
result_viewed
lesson_saved
```

4. **Privacy (FR-OPS-002):** Inspect log payloads — must **not** contain full user sentences, `confirmed_text`, image URIs, or AI JSON.

**Automated:** `src/modules/analytics/__tests__/analytics.test.ts` (TC-023 unit).

**Production analytics:** swap console adapter → Firebase (or chosen vendor) per `07-release/04-public-app-setup-checklist.md` §12 when project is created.

---

## 3. Privacy & settings (release blockers)

| Check | Steps | Expected |
|---|---|---|
| Privacy note | Profile → Xem chi tiết | Full note matches `07-release/02-privacy-policy-draft.md` §3 |
| Support | Profile → support email | Mail composer opens |
| Clear data | Profile → Xóa dữ liệu | Confirm → lessons removed; Home/Lessons empty |
| Reopen saved | Lessons → open lesson | Loads from SQLite; **no** new `/v1/ai/analyze` (network off test) |

---

## 4. Regression smoke (5 min)

After any fix, re-run:

1. Paste → result → save → reopen from Lessons tab.
2. Profile privacy + support links.
3. `npm run qa:p0:automated`.

---

## 5. Sign-off log

| Field | Value |
|---|---|
| Build | e.g. iOS 0.0.1 (staging) / Android stagingDebug |
| Tester | |
| Date | |
| API env | |
| P0 passed | /11 (TC-001..010, 016..021) |
| P1 passed | /5 (011, 012, 013, 022, 023) |
| Blockers | |
| Approved for closed beta | ☐ Yes ☐ No |

---

## 6. Known automated coverage map

| TC | Automated? | Where |
|---|---|---|
| TC-006 | ✅ | `OCRReviewScreen.test.tsx` |
| TC-008 | ✅ | `PasteTextScreen.test.tsx` |
| TC-010 | ✅ | `api:test` INT-AI-002/003, `PasteTextScreen.test.tsx` |
| TC-019 | ✅ | `PasteTextScreen.test.tsx` (retry + preserved text) |
| TC-020/021 | ✅ | `LessonResultView.test.tsx` |
| TC-022 | ✅ | `ProfileScreen.test.tsx` |
| TC-023 | ✅ | `analytics.test.ts` |
| TC-011–013 | Partial | `LessonRepository.test.tsx`, `SavedLessonDetailScreen.test.tsx` |
| TC-001–005, 016–018 | Manual | Camera/gallery/OCR on device |
