# Traceability Matrix — Phase 0

## 1. Purpose

This table links **FR → US → TC → Module/Screen → Status** to prevent **shipping incomplete features**.

Core product gate: if any product `Must` FR in section 2 does not have Status = ✅, the Phase 0 core loop is **not complete**.

The theme system is a separate UI foundation/polish checklist in section 3. Theme must not block the M1–M4 core loop unless the current task is UI/theme refactor.

- FR source: `03-requirements/01-functional-requirements.md`
- US source: `03-requirements/03-user-stories-acceptance.md`
- TC source: `05-qa/01-qa-test-plan.md`
- Module: per `02-technical/06-ai-agent-implementation-guide.md` section 3 and `02-technical/01-technical-implementation-spec.md` sections 5–6.

Status legend: ☐ not started · ◐ in progress · ✅ done & test pass.
TC `—` means **no test case yet** for that FR (see section 4).

---

## 2. Matrix

### Input

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-IN-001 | Take photo with camera | Must | US-001 | TC-001, TC-002 | input/CameraInput | ☐ |
| FR-IN-002 | Upload image from gallery | Must | US-002 | TC-003 | input/GalleryInput | ☐ |
| FR-IN-003 | Paste/enter text manually | Must | US-003 | TC-007 | input/PasteTextInput | ☐ |
| FR-IN-004 | Image preview before OCR | Must | US-001, US-002 | TC-001, TC-003 | input | ☐ |
| FR-IN-005 | Replace selected image | Must | US-002 | TC-016 | input | ☐ |
| FR-IN-006 | Validate empty text | Must | US-003 | TC-008 | input | ☐ |
| FR-IN-007 | Warn when text exceeds max length | Should | — | Edge (text too long) | input | ☐ |

### OCR

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-OCR-001 | Extract text from image | Must | US-004 | TC-004 | ocr/OCRService | ◐ |
| FR-OCR-002 | Display OCR loading state | Must | US-004 | TC-017 | ocr | ☐ |
| FR-OCR-003 | Display extracted text | Must | US-004 | TC-004 | ocr | ☐ |
| FR-OCR-004 | Retry OCR | Should | US-004 | TC-005 | ocr | ☐ |
| FR-OCR-005 | Notify when no text detected | Must | US-004 | TC-005 | ocr | ☐ |
| FR-OCR-006 | Preserve line breaks reasonably | Should | — | Edge (bullet points) | ocr | ☐ |
| FR-OCR-007 | Support common image formats | Must | US-002 | TC-018 | ocr | ☐ |

### OCR text review

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-REV-001 | Edit extracted text | Must | US-005 | TC-006 | ocr/OCRReviewScreen | ☐ |
| FR-REV-002 | Use edited text as AI input | Must | US-005 | TC-006 | review | ☐ |
| FR-REV-003 | Do not send to AI before user confirms | Must | US-005 | TC-006 | review | ☐ |
| FR-REV-004 | Display character count | Should | — | — | review | ☐ |
| FR-REV-005 | Warn if text may not be English | Nice | — | Edge (mixed EN/VI) | review | ☐ |

### AI analysis

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-AI-001 | Send confirmed text to AI | Must | US-003, US-006 | TC-007, TC-009 | ai-analysis | ☑ |
| FR-AI-002 | AI returns structured output | Must | US-006 | TC-009 | ai-analysis | ☑ |
| FR-AI-003 | Validate AI schema before render | Must | US-014 | TC-010 | ai-analysis/AIOutputValidator | ☑ |
| FR-AI-004 | Retry when output invalid | Should | US-014 | TC-010 | ai-analysis | ☑ |
| FR-AI-005 | Friendly loading messages | Should | — | — | ai-analysis | ☐ |
| FR-AI-006 | Handle AI timeout, preserve input | Must | US-014, US-015 | TC-019, Edge (network lost) | ai-analysis | ☐ |

### Translation

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-TR-001 | Full Vietnamese translation | Must | US-006 | TC-009 | lesson/result | ☐ |
| FR-TR-002 | Translation per sentence | Must | US-006 | TC-009 | lesson | ☐ |
| FR-TR-003 | Natural, beginner-friendly translation | Must | US-006 | Manual QA | lesson | ☐ |
| FR-TR-004 | Literal phrase translation | Should | — | — | lesson | ☐ |

### Sentence analysis

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-SA-001 | Split into sentences | Must | US-007 | TC-009 | lesson | ☐ |
| FR-SA-002 | Display original sentence + translation | Must | US-007 | TC-009 | lesson | ☐ |
| FR-SA-003 | Break down sentence into parts | Must | US-007 | TC-009 | lesson | ☐ |
| FR-SA-004 | Simple role for each part | Should | US-007 | — | lesson | ☐ |
| FR-SA-005 | Display pattern when available | Should | US-007 | — | lesson | ☐ |
| FR-SA-006 | Similar example sentences | Should | US-007 | — | lesson | ☐ |

### Grammar

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-GR-001 | Identify grammar points | Must | US-008 | TC-009 | grammar | ☐ |
| FR-GR-002 | Explain grammar in Vietnamese | Must | US-008 | TC-009 | grammar | ☐ |
| FR-GR-003 | Pattern/formula | Must | US-008 | — | grammar | ☐ |
| FR-GR-004 | Example sentences | Should | US-008 | — | grammar | ☐ |
| FR-GR-005 | Limit number of grammar points | Must | US-008 | TC-020, Edge (no grammar → empty) | grammar | ☐ |

### Vocabulary

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-VOC-001 | Extract important vocabulary | Must | US-009 | TC-009 | vocabulary | ☐ |
| FR-VOC-002 | Vietnamese meaning per word | Must | US-009 | TC-009 | vocabulary | ☐ |
| FR-VOC-003 | Word type | Should | US-009 | — | vocabulary | ☐ |
| FR-VOC-004 | Pronunciation guide | Should | US-009, US-010 | — | vocabulary | ☐ |
| FR-VOC-005 | Example sentence | Should | US-009 | — | vocabulary | ☐ |
| FR-VOC-006 | Avoid overly common words | Must | US-009 | Manual QA | vocabulary | ☐ |
| FR-VOC-007 | Limit vocabulary count per lesson | Must | US-009 | TC-021 | vocabulary | ☐ |

### Pronunciation

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-PRO-001 | Pronunciation support for vocabulary | Should | US-010 | TC-014 | pronunciation | ☐ |
| FR-PRO-002 | Pronunciation support for sentences | Should | US-010 | TC-014 | pronunciation | ☐ |
| FR-PRO-003 | Play audio if TTS available | Should | US-010 | TC-014 | pronunciation | ☐ |
| FR-PRO-004 | Vietnamese-friendly pronunciation guide | Should | US-010 | — | pronunciation | ☐ |
| FR-PRO-005 | IPA for advanced learners | Nice | US-010 | — | pronunciation | ☐ |

### Lesson & history

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-LES-001 | Create lesson after each successful AI analysis | Must | US-011 | TC-009 | lesson/LessonRepository | ☐ |
| FR-LES-002 | Save lesson (prevent duplicates) | Should | US-011 | TC-011, TC-013 | lesson | ☐ |
| FR-LES-003 | Open saved lesson | Should | US-012 | TC-012 | history | ☐ |
| FR-LES-004 | Display lesson title | Must | US-012 | TC-012 | history | ☐ |
| FR-LES-005 | Display created date | Should | US-012 | TC-012 | history | ☐ |
| FR-LES-006 | Persist AI result, no re-analyze on open | Should | US-012 | TC-012 | lesson | ☐ |

### Practice

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-PRAC-001 | Generate practice questions from lesson | Nice | US-013 | TC-015 | practice | ☐ |
| FR-PRAC-002 | Support multiple choice | Nice | US-013 | TC-015 | practice | ☐ |
| FR-PRAC-003 | Show correct answer after selection | Nice | US-013 | TC-015 | practice | ☐ |
| FR-PRAC-004 | Questions from lesson vocabulary/grammar | Nice | US-013 | TC-015 | practice | ☐ |

### Settings

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-SET-001 | Default level = Beginner | Must | — | TC-022 | settings | ✅ |
| FR-SET-002 | Allow changing learning level | Nice | — | — | settings | ☐ |
| FR-SET-003 | Configure TTS voice/speed | Nice | — | — | settings | ☐ |
| FR-SET-004 | Display privacy note for uploaded content | Should | — | — | settings | ✅ |

### Ops & analytics

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-OPS-001 | Log OCR/AI status for debugging | Should | — | Integration test (`02-technical/01-technical-implementation-spec.md §15`) | api/observability | ✅ |
| FR-OPS-002 | Do not log sensitive content unless anonymized | Must | — | Privacy test (13 §3) | analytics, api | ✅ |
| FR-OPS-003 | Track basic funnel events | Must | — | TC-023 | analytics | ✅ |
| FR-OPS-004 | Feature flag for AI/TTS provider | Should | — | — | shared/config | ☐ |

## 3. UI foundation / polish — Theme system (`06-design/03-theme-system.md`)

Theme is a cross-cutting technical requirement to reduce hard-coded UI and improve design consistency. It does not count toward the Phase 0 M1–M4 core product gate. Use as a gate only when implementing theme iteration or M5 polish.

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-THEME-001 | Centralized theme object via Provider | Foundation | US-018 | TC-027 | theme/ThemeProvider | ✅ |
| FR-THEME-002 | Screens read styles from tokens, no hard-coding | Foundation | US-018 | TC-028 | theme, all `modules/*` screens | ✅ |
| FR-THEME-003 | Reusable components AppText/AppButton/AppCard/AppScreen | Foundation | US-018 | TC-027 | components | ✅ |
| FR-THEME-004 | Register multiple themes (default/dark/pastel-kids) | Polish | US-016 | TC-027 | theme/themeRegistry | ✅ |
| FR-THEME-005 | Runtime theme switch via ThemePicker | Should | US-016 | TC-024 | components/ThemePicker | ✅ |
| FR-THEME-006 | Persist & restore theme | Should | US-017 | TC-025 | theme/themeStorage | ✅ |
| FR-THEME-007 | useAppTheme outside Provider → throw | Should | US-018 | TC-026 | theme/useAppTheme | ✅ |
| FR-THEME-008 | Each theme fully implements AppTheme (TS no error) | Foundation | US-016 | TC-027 | theme/themes | ✅ |
| FR-THEME-009 | Use semantic tokens, not raw palette | Foundation | US-018 | TC-028 | theme, all `modules/*` screens | ✅ |
| FR-THEME-010 | Add new theme without modifying screens | Should | US-016 | TC-027 | theme | ✅ |
| FR-THEME-011 | (Deferred) Icon/asset/font resolver per theme | Deferred | — | — | theme | ☐ |
| FR-THEME-012 | Theme registry is single source of truth for ThemeId/themeList/ThemePicker | Foundation | US-018 | TC-027 | theme/themeRegistry | ✅ |
| FR-THEME-013 | Unknown persisted theme id falls back to default without crash | Foundation | US-017 | TC-029 | theme/themeStorage | ✅ |
| FR-THEME-014 | ThemePicker lists only registry themes with enabled flags | Should | US-016 | TC-030 | components/ThemePicker | ✅ |
| FR-THEME-015 | ESLint fails build on hard-coded colors in screens/components | Should | US-018 | TC-028 | tooling/eslint | ✅ |

### UI handoff polish (`superpowers/plans/2026-06-05-lingobites-ui.md`)

Cross-cutting presentation layer on top of theme (Phase 1). Does **not** replace product FR verification in §2; gates automated tests + lint only.

| Deliverable | Spec / decision | Automated gate | Status |
|---|---|---|---|
| Phase 0 theme prerequisite | UI plan Task 0 | `npx jest` theme + provider tests | ✅ |
| 3-tab shell (`Home \| Lessons \| Profile`) | D-002, UI spec §7 | `AppNavigator` + `TabBar.tsx`; no Scan/Vocab tab | ✅ |
| Single-scroll lesson result | D-002, technical-spec §14 | `LessonResultView` — no hub screens | ✅ |
| Handoff component library | UI spec §4 | `handoffComponents.test.tsx` (× `themeList`) | ✅ |
| Extended `AppTheme` presets | UI spec §8 | `themes.render.test.tsx` + 3 theme files | ✅ |
| `useScanStore` async job | UI spec §6 | `useScanStore.test.ts` | ✅ |
| Mock lessons valid schema | UI spec §5 | `mockLessons.test.ts` + `validateAIOutput()` | ✅ |
| All listed screens tokenized | UI plan File structure | `eslint src/components src/modules` — 0 `no-color-literals` errors | ✅ |
| `useProgressStore` / Review CTA | UI spec §11 out-of-P0 | Not present in codebase | ✅ |
| Real M2–M4 services preserved | M2/M3/M4 briefs | AI/OCR/SQLite paths unchanged; `services/ai.ts` seam only | ✅ |
| Manual theme switch all screens | TC-024 | Device/simulator — ThemePicker on Profile | ☐ |

---

## 4. Test gaps (Must group addressed)

### Must — ✅ TESTS ADDED (TC-016..TC-023 in `05-qa/01-qa-test-plan.md`)

| FR | TC | Content |
|---|---|---|
| FR-IN-005 | TC-016 | Replace image → new image replaces old |
| FR-OCR-002 | TC-017 | OCR loading; prevent double-submit |
| FR-OCR-007 | TC-018 | Valid jpg/png/heic; unsupported file → clear error |
| FR-AI-006 | TC-019 | Mock AI timeout → retry → confirmed_text preserved |
| FR-GR-005 | TC-020 | Many grammar points → UI shows max 3 |
| FR-VOC-007 | TC-021 | Many words → UI defaults to ≤5, with "xem thêm" |
| FR-SET-001 | TC-022 | Fresh install → default level Beginner |
| FR-OPS-003 | TC-023 | Funnel events correct name + payload, no raw content |

> 2 remaining `Must` FRs verified by other methods (no new functional TC needed):
> FR-OPS-002 (no sensitive logging) → privacy test `05-qa/01-qa-test-plan.md §3` + integration `02-technical/01-technical-implementation-spec.md §15`;
> FR-VOC-006 (avoid common words) → Manual QA of AI quality with sample input in `02-technical/04-ai-ocr-integration.md §14`.

### Should/Nice — add if time permits

FR-IN-007, FR-OCR-006, FR-AI-005, FR-REV-004, FR-REV-005, FR-TR-004, FR-SA-004/005/006, FR-GR-003/004, FR-VOC-003/004/005, FR-PRO-004/005, FR-SET-004, FR-OPS-001/004.

> Many `Should` FRs depend on AI quality (FR-TR-003, FR-VOC-006) → verify via **Manual QA + sample input** in `02-technical/04-ai-ocr-integration.md §14`, no automated TC needed.

---

## 5. Coverage summary

- Total FR (Phase 0 product, `03-requirements/01-functional-requirements.md`): **71** (Must: 33 · Should: 30 · Nice: 8).
- Theme FR (UI foundation/polish, `06-design/03-theme-system.md`): **15** (Foundation: 7 · Polish: 1 · Should: 6 · Deferred: 1) — **14 ✅**, FR-THEME-011 deferred.
- UI handoff (§3 UI handoff table): **11** automated deliverables — **10 ✅**, manual TC-024 on device ☐.
- US: 18 (US-001..015 product + US-016..018 theme) · TC: **30** (TC-001..023 product + TC-024..030 theme per `06-design/03-theme-system.md` §8).
- Product `Must` FRs without dedicated functional test: **0** (Phase 0: 8 supplemental TCs, 2 FRs verified via privacy/manual — see §4).

Update the Status column during build. When all product `Must` FRs = ✅ and TC-001..023 P0/P1 pass → aligns with the Definition of Done in `02-technical/02-implementation-plan-m1-m5.md §12` and release gate in `07-release/01-release-production-readiness.md`. TC-024..030 are for theme iteration/M5 polish and do not block the M1–M4 core loop.
