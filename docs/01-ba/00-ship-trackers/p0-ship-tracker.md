# P0 Ship Tracker — MVP Scan & Learn (MT-Core)

> **Hub mỏng** — chỉ trạng thái, link, và gate ship. **Không** copy spec/FR/API vào đây.
> Chi tiết luôn sửa ở file canonical; đổi spec → [`11-spec-change-protocol.md`](../02-technical/11-spec-change-protocol.md) + [`DECISIONS.md`](../DECISIONS.md).

**Product phase:** P0 · **Module track:** MT-Core · **Cập nhật:** 2026-06-05 · **Milestone:** M5 (next)

Index tất cả phase: [README.md](Project/LingoBites/docs/01-ba/00-ship-trackers/README.md)

---

## 1. Core loop (không đổi)

```text
Scan/Input → Confirm Text → Generate Lesson → Learn → Save → Review
```

**UI P0 (D-002):** 3 tab `Home | Lessons | Profile` · lesson result **single scroll** §14 · camera = `react-native-image-picker` native UI.

---

## 2. Milestone status (M0–M5)

| M | Tên | Trạng thái | Exit gate | Brief |
|---|---|---|---|---|
| M0 | Project setup | ✅ Done | App iOS/Android mở; `/health`; test runner | [M0-brief](../02-technical/milestones/M0-brief.md) |
| M1 | Local UI prototype | ✅ Done | Paste → mock → validate → result; unit tests schema + text | [M1-brief](../02-technical/milestones/M1-brief.md) |
| M2 | Backend + real AI | ✅ Done | `/v1/ai/analyze` thật; retry 1×; `USE_MOCK_AI` | [M2-brief](../02-technical/milestones/M2-brief.md) |
| M3 | OCR flow | ✅ Done | Camera/gallery → OCR → review → `confirmed_text` | [M3-brief](../02-technical/milestones/M3-brief.md) |
| M4 | Save / history | ✅ Done | SQLite; reopen **không** gọi AI | [M4-brief](../02-technical/milestones/M4-brief.md) |
| M5 | Beta polish | 🔄 In progress | Analytics; privacy; QA P0; closed beta checklist | [M5-brief](../02-technical/milestones/M5-brief.md) |

**Thứ tự:** M0 → M1 → M2 → M3 → M4 → M5 → closed beta. Plan: [`02-implementation-plan-m1-m5.md`](../02-technical/02-implementation-plan-m1-m5.md)

---

## 3. M1 exit tests — ✅ Done (2026-06-05)

- [x] `AIOutputSchema` + `validateAIOutput()` từ `01-ai-output-v1.ts`
- [x] `PasteTextScreen` + loading + error
- [x] `MockAIAnalysisService` (full / minimal / `forceInvalid`)
- [x] `LessonResultView` — §14 order (incl. pronunciation, practice, save disabled)
- [x] `textValidation` — empty + `MAX_TEXT_LENGTH=3000`
- [x] Section **Luyện phát âm** (§14 bước 8)
- [x] **Save placeholder** disabled (§14 bước 10)
- [x] Vocab ≤5 + "xem thêm" (TC-021)
- [x] Grammar ≤3 (TC-020)
- [x] Fixture `valid-minimal.json` — empty arrays, no crash
- [x] Fixture `invalid-missing-field.json` — friendly error, no render
- [x] Unit test schema validator (`mobile:test` 23/23)
- [x] Unit test text length validator

**Còn lại (không block M1):** manual smoke iOS/Android simulator (paste → result).

---

## 4. M2 exit tests — ✅ Done (2026-06-05)

- [x] `npm run api:test` — 22/22 pass (`AI_PROVIDER=mock` in test runner; no real LLM in CI)
- [x] `POST /v1/ai/analyze` canonical envelope (`request_id`, `status`) — INT-AI-001
- [x] Invalid output → retry once → `AI_INVALID_OUTPUT` — INT-AI-002, INT-AI-003
- [x] Empty / too-long input → `VALIDATION_EMPTY_TEXT` / `VALIDATION_TEXT_TOO_LONG`
- [x] Gemini/OpenAI adapters + `promptBuilder` (`lesson-analysis-v1`, repair suffix attempt 2)
- [x] Mobile `USE_MOCK_AI=true` — M1 mock path (29/29 `mobile:test`)
- [x] Mobile `USE_MOCK_AI=false` — `analyzeClient` + `validateAIOutput()` on API response
- [x] Invalid API response — friendly error, no crash

**Còn lại (không block M2):** manual E2E paste → real Gemini (`USE_MOCK_AI=false` + `AI_PROVIDER=gemini` + key).

---

## 5. M3 exit tests — ✅ Done (2026-06-05)

- [x] `POST /v1/ocr` multipart + canonical envelope — INT-OCR-001..003 (`api:test` 31/31)
- [x] Mock OCR provider + quality metadata (`extracted_text`, `ocr_raw_text` not sent to AI)
- [x] `react-native-image-picker` camera/gallery + iOS/Android permission strings
- [x] Image preview → OCR → `OCRReviewScreen` (edit before analyze)
- [x] OCR fail / no-text → retry + paste fallback (canonical copy §13)
- [x] Edited OCR text → `analyzeText` with `sourceType` camera/gallery (TC-006)
- [x] Mobile `USE_MOCK_OCR=true` + API client tests (`mobile:test` 34/34)
- [x] Home tab CTAs + 3-tab shell (Lessons/Profile placeholder until M4/M5)

**Còn lại (không block M3):** manual 20-sample image checklist; real OCR provider lock; `pod install` after adding image-picker.

---

## 6. M4 exit tests — ✅ Done (2026-06-05)

- [x] SQLite `lessons` + `app_settings` migrations (`react-native-quick-sqlite`)
- [x] `LessonRepository` — save full `ai_output_json`, dedup via `lesson_input_hash`
- [x] Save button states: unsaved / saving / saved / error
- [x] Double-save → one row (duplicate hash reuse)
- [x] Lessons tab — history list + empty state
- [x] Saved lesson detail — load DB only, **no** `/v1/ai/analyze`
- [x] Delete lesson + Profile clear local data
- [x] Home recent lessons (top 3)
- [x] `mobile:test` 41/41 (repository, saved detail, save UI)

**Còn lại (không block M4):** manual verify persist after app restart on device.

---

## 7. M5 exit tests — 🔄 In progress (2026-06-05)

- [x] Analytics adapter + funnel events (`modules/analytics/`, TC-023 unit test)
- [x] No raw text in analytics payload (`sanitizeAnalyticsPayload`)
- [x] Privacy note visible (Profile + `PrivacyNoteScreen`)
- [x] Support/feedback entry (mailto `SUPPORT_EMAIL`)
- [x] Network fail → retry + input preserved (PasteText + OCRReview)
- [x] API request outcome logging (`observability/requestOutcome.ts`)
- [x] Crash/error reporting hook (console adapter + `ErrorUtils` handler)
- [x] `npm run qa:p0:automated` — mobile + API test gate (see `05-qa/02-p0-manual-qa-runbook.md`)

**Còn lại (block closed beta):** manual QA TC-001..023 on device (`05-qa/02-p0-manual-qa-runbook.md`); wire real Firebase when project ready (`ANALYTICS_PROVIDER=firebase-stub` → RN Firebase); closed beta checklist in `07-release/01-release-production-readiness.md`; manual TC-024 on device (theme switch — see §7b).

---

## 7b. Superpowers UI gates — ✅ Automated pass (2026-06-05)

> Plans: [superpowers/README.md](../../superpowers/README.md) · Phase 0 theme → Phase 1 UI handoff.

### Phase 0 — Theme system

| Gate | Status | Evidence |
|---|---|---|
| Tasks 0–16 (`theme-system.md`) | ✅ | `src/theme/`, `AppThemeProvider`, `ThemePicker` on Profile |
| FR-THEME-001..015 (except 011) | ✅ | [traceability §3](../03-requirements/05-traceability-matrix.md) |
| TC-025..030 automated | ✅ | `theme/__tests__/*`, `ThemePicker.test.tsx` |
| TC-027 parametrized render | ✅ | `themes.render.test.tsx` |

### Phase 1 — UI handoff

| Gate | Status | Evidence |
|---|---|---|
| Handoff components + `TabBar` | ✅ | `src/components/*`, `TabBar.tsx` |
| All `modules/*` screens tokenized | ✅ | ESLint `no-color-literals` — 0 errors |
| Stores + mock data tests | ✅ | `useScanStore.test.ts`, `mockLessons.test.ts`, `handoffComponents.test.tsx` |
| `npx jest` (mobile) | ✅ | 81/81 (2026-06-05) |
| M2–M4 real services | ✅ | AI/OCR/SQLite unchanged; `services/ai.ts` seam |
| Manual TC-024 (device) | ☐ | ThemePicker → verify all tabs/screens update |

**Phase 1 UI plan** unblocks [lingobites-ui.md](../../superpowers/plans/2026-06-05-lingobites-ui.md) Done criteria for automated gates; product §2 FR Must still require TC-001..023 device pass.

---

## 8. FR / QA gate (P0)

| Metric | Target | Hiện tại | File |
|---|---|---|---|
| FR Must P0 (33) | Tất cả ✅ | 0 / 33 | [traceability-matrix §2](../03-requirements/05-traceability-matrix.md) |
| TC P0 (TC-001..023) | Pass | Chưa chạy | [qa-test-plan](../05-qa/01-qa-test-plan.md) |
| Theme FR (M5) | TC-024..030 | 14/15 FR ✅ · automated TC ✅ · manual TC-024 ☐ | [theme-system](../06-design/03-theme-system.md) · [traceability §3](../03-requirements/05-traceability-matrix.md) |
| UI handoff (Superpowers P1) | UI plan Done (auto) | 10/11 ✅ · manual TC-024 ☐ | [lingobites-ui plan](../../superpowers/plans/2026-06-05-lingobites-ui.md) |

**P0 core loop complete** khi: mọi FR **Must** §2 traceability = ✅ + TC-001..023 P0 pass.

---

## 9. Release gate (closed beta)

[01-release-production-readiness.md](../07-release/01-release-production-readiness.md)

**Blockers — không ship nếu còn:**

- [ ] Crash core flow
- [ ] Invalid AI output crash UI
- [ ] Gửi OCR raw text trước user confirm
- [x] Reopen saved lesson gọi AI lại — **blocked at M4** (loads `ai_output_json` only)
- [ ] API keys trong mobile
- [x] Không có retry AI/OCR — **retry UI on paste/OCR review + backend retry (M2/M5)**
- [x] Không có privacy note — **Profile + PrivacyNoteScreen (M5)**
- [ ] Log full text / AI output
- [x] Không có crash reporting tối thiểu (M5) — **console error-report adapter + global handler**

**Sau M5:** [04-public-app-setup-checklist.md](../07-release/04-public-app-setup-checklist.md)

---

## 10. Quyết định cần lock

| Quyết định | Lock trước | Trạng thái |
|---|---|---|
| AI provider / model | M2 | ✅ D-007 — `gemini` + `gemini-2.0-flash` (default) |
| OCR provider | M3 | ☐ Chưa lock |
| Backend hosting (HTTPS) | M2 | ✅ Lock — Cloud Run (https://lingobites-api-staging-513229900509.asia-southeast1.run.app) |
| Analytics tool | M5 | 🔄 Adapter ready — vendor TBD (console sink in dev) |
| Crash reporting | M5 | 🔄 Adapter ready — vendor TBD (console sink in dev) |

[04-ai-ocr-integration.md](../02-technical/04-ai-ocr-integration.md)

---

## 11. Link nhanh (P0)

| Đang làm | Đọc |
|---|---|
| Bắt session code | [DECISIONS.md](../DECISIONS.md) → [10-ai-session-contract.md](../02-technical/10-ai-session-contract.md) → `milestones/M?-brief.md` |
| **Superpowers roadmap** | [superpowers/README.md](../../superpowers/README.md) — thứ tự: theme plan → UI plan |
| Theme (Phase 0) | [theme plan](../../superpowers/plans/2026-06-05-theme-system.md) · [theme spec](../../superpowers/specs/2026-06-05-theme-driven-architecture-design.md) · [03-theme-system.md](../06-design/03-theme-system.md) |
| UI handoff (Phase 1) | [UI plan](../../superpowers/plans/2026-06-05-lingobites-ui.md) · [UI spec](../../superpowers/specs/2026-06-05-lingobites-ui-design.md) — **automated gate ✅** (§7b); manual TC-024 ☐ |
| Env / build matrix | [env plan](../../superpowers/plans/2026-06-05-environment-setup.md) (song song, không block theme/UI) |
| Schema | [01-ai-output-v1.ts](../01-schema/01-ai-output-v1.ts) · [fixtures](../01-schema/fixtures/) |
| API / DB | [01-technical-implementation-spec.md](../02-technical/01-technical-implementation-spec.md) · `12-api-backend-development-rules.md` (LingoBites-Server repo) |
| FR / BR | [01-functional-requirements.md](../03-requirements/01-functional-requirements.md) · [02-business-rules.md](../03-requirements/02-business-rules.md) |
| UI / copy | [01-user-flow-screen-spec.md](../06-design/01-user-flow-screen-spec.md) §13 |
| PRD P0 | [04-phase0-prd.md](../04-product/04-phase0-prd.md) |

---

## 12. Repo map

```text
LingoBites-App/    This repository (React Native CLI mobile client + documentation)
  ├── android/     Android project files
  ├── ios/         iOS project files
  ├── src/         Source code — modules: input, ocr, ai-analysis, lesson, shared/db, etc.
  └── docs/        BA & Technical documentation (this folder)
LingoBites-Server/ External repository (Fastify backend — /health, /v1/ai/analyze, /v1/ocr)
```
