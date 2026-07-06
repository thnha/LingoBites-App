# Modular Architecture & Release Strategy

## 1. Purpose

This document defines how **LingoBites** should be built and released as a
**one codebase, many feature modules, feature-flag controlled** system.

It adapts the modular release model for this repo and **reconciles terminology** with existing BA docs
so teams and AI agents do not confuse:

- **Product Phase** (business roadmap)
- **Module Track** (development architecture)
- **Milestone M0–M5** (sequential build order for core loop)

Read together with:

- `02-technical/08-feature-registry-release-config.md` — registry, dependencies, release JSON, DoD, test matrix
- `02-technical/01-technical-implementation-spec.md` — stack, API, persistence
- `02-technical/02-implementation-plan-m1-m5.md` — current build order
- `04-product/06-roadmap-release-plan.md` — product phases P0–P3
- `01-schema/01-ai-output-v1.ts` — canonical AI output (do not invent alternate contracts)
- `06-design/03-theme-system.md` — theme module (MT-Theme)

---

## 2. Terminology (must use consistently)

| Term | Meaning | Examples |
|---|---|---|
| **Product Phase (P0–P3)** | Business roadmap: what value we ship to users over time | P0 = MVP Scan & Learn; P1 = Review & Retention |
| **Module Track (MT)** | Architecture group: code organized by capability, can develop in parallel | MT-Core, MT-Theme, MT-Practice, MT-Situation |
| **Milestone (M0–M5)** | Sequential **implementation** order for MT-Core foundation | M1 = paste + mock AI; M4 = save/history |
| **Release** | Named bundle of enabled feature flags, validated against dependencies | `close-beta-1`, `mini-game-release` |
| **Feature flag** | Boolean switch controlling module visibility, routes, API guards | `lessonSave`, `miniGame` |

### Critical rule

```text
Phase (in this doc) ≠ Product Phase number in roadmap unless explicitly mapped.

Module Track ≠ Milestone.
Milestone orders MT-Core build; Module Tracks can proceed in parallel after MT-Core is stable.
Release does NOT follow Module Track number order after P0.
```

### Mapping table

| Module Track | Maps to Product Phase | Maps to Milestones | Release priority |
|---|---|---|---|
| **MT-Core** | P0 (required) | M0–M5 | **First** — foundation |
| **MT-Theme** | Cross-cutting UI | Parallel with M1–M5 (see `06-design/03-theme-system.md`) | Early recommended, not blocking P0 logic |
| **MT-Practice** | P1 (flashcards, games) + P0 short practice | After M4 (needs saved lessons) | Per-game / per-feature release |
| **MT-Situation** | Future expansion | After MT-Core + `aiLessonAnalysis` | Independent of MT-Practice |
| **MT-Speaking** | P2 | After MT-Core | Future |
| **MT-Monetization** | P3 | After MT-Core stable | Future |

---

## 3. Design mindset

Do **not** treat module tracks as a rigid release sequence.

```txt
Module Track = development group / capability boundary
Release      = pick modules that are done + QA pass + dependencies satisfied → enable flags
```

Target properties:

```txt
One Codebase
Many Feature Modules
Feature Flag Controlled
Release Config Based
Dependency Validated
Rollback Friendly
```

Meaning:

- Code can merge to `main` before a feature is user-visible.
- Incomplete features stay **flag off**.
- Production issues → turn off flag, not full app rollback when possible.
- Multiple teams work in separate `features/` (or `modules/`) folders with declared dependencies.

---

## 4. Core product loop (unchanged)

```txt
Scan/Input → Confirm Text → Generate Lesson → Learn → Save → Review
```

All Module Tracks must **extend** this loop, not replace it.

Absolute rules (from `AGENTS.md`):

- `confirmed_text` is source of truth before AI.
- AI output passes `validateAIOutput()` before render/save.
- Reopening saved lesson does **not** call AI again.
- Schema fields only from `01-ai-output-v1.ts`.

---

## 5. Module Track definitions

### MT-Core — Core Learning Foundation (P0)

**Goal:** Input → OCR/edit → AI analysis → result → save → basic review/practice.

**User inputs:** dialogue, short article, image scan, paste text.

**AI output sections:** per `01-ai-output-v1.ts` — translation, sentences, vocabulary, grammar,
pronunciation, practice (not a separate invented JSON contract).

**Feature keys (release flags):**

| Key | Description |
|---|---|
| `pasteTextInput` | Manual text entry |
| `imageInput` | Camera/gallery |
| `ocrScanner` | OCR via backend |
| `ocrReviewEdit` | User confirms/edits before AI |
| `aiLessonAnalysis` | Backend AI analyze |
| `lessonResultView` | Render validated AI output |
| `lessonSave` | Persist lesson locally |
| `lessonHistory` | List/open saved lessons |
| `shortPractice` | Inline practice from AI output (P0 scope) |
| `pronunciationSupport` | TTS / pronunciation guide |

**Milestone alignment:**

| Milestone | MT-Core deliverable |
|---|---|
| M1 | `pasteTextInput`, `aiLessonAnalysis` (mock), `lessonResultView` |
| M2 | Real AI via `/v1/ai/analyze` |
| M3 | `imageInput`, `ocrScanner`, `ocrReviewEdit` |
| M4 | `lessonSave`, `lessonHistory` |
| M5 | Analytics, polish, beta readiness |

MT-Core is **required** for every release config.

---

### MT-Theme — Theme Foundation

**Goal:** Centralized design tokens; no hard-coded colors/fonts in screens.

**Source of truth:** `06-design/03-theme-system.md`, `docs/superpowers/specs/2026-06-05-theme-driven-architecture-design.md`.

**Feature keys:**

| Key | Description |
|---|---|
| `themeSystem` | `AppTheme`, `useAppTheme()`, base components |
| `themeSwitcher` | Runtime theme picker + persistence |
| `darkTheme` | Dark theme variant |
| `pastelKidsTheme` | Pastel-kids variant |

**Note:** MT-Theme does not change business logic. Recommended early to avoid mass UI refactors.

---

### MT-Practice — Practice & Mini Games (P1+)

**Goal:** Turn saved lesson data into engaging practice (flashcards, mini games, spaced repetition).

**Data rule:** Practice modules **consume** saved lessons and `ai_output_json` — they do not create
parallel lesson vocab/grammar stores.

**Feature keys:**

| Key | Description |
|---|---|
| `reviewSystem` | Flashcards, due reviews, spaced repetition |
| `miniGame` | Parent flag for game hub |
| `wordMatchGame` | Match word ↔ meaning |
| `fillBlankGame` | Fill in the blank |
| `tenseQuizGame` | Tense selection quiz |
| `sentenceOrderGame` | Reorder sentence chunks |
| `flashcardChallenge` | Timed flashcard challenge |

**Release rule:** Each game can ship independently when its flag + dependencies pass QA.

---

### MT-Situation — Situation Learning (future)

**Goal:** User describes a situation → app generates dialogue, phrases, grammar, saves as lesson.

**Feature keys:** `situationLearning`, `dialogueGenerator`, `phraseExtractor`, `situationPractice`.

**Dependency:** `aiLessonAnalysis`, `lessonSave`. Optional: `miniGame` for extra practice.

Can release **without** MT-Practice if dialogue + save-as-lesson work.

---

### MT-Speaking / MT-Monetization (future)

Mapped to Product Phase P2 and P3 in `04-product/06-roadmap-release-plan.md`. Out of scope until
MT-Core exit criteria pass. Each future capability gets its own feature keys in
`08-feature-registry-release-config.md` when scoped.

---

## 6. Architecture overview

```txt
LingoBites-App (Mobile Client)
│
├── Core Platform (src/core/ / src/shared/ + API Integration)
│   ├── API client (rest client communicating with server)
│   ├── Local storage (SQLite)
│   ├── AI output validation (01-ai-output-v1.ts)
│   ├── Analytics adapter
│   ├── Feature flag service
│   ├── Theme engine (MT-Theme)
│   └── Permissions / errors / logger
│
├── Feature Modules (src/modules/ → migrate to features/)
│   ├── input (paste, image)
│   ├── ocr
│   ├── ai-analysis
│   ├── lesson (result, save, history)
│   ├── vocabulary / grammar / pronunciation / practice (render sections)
│   ├── theme-system
│   ├── mini-games (future)
│   └── situation-learning (future)
│
├── External Backend Integration
│   └── Communicates via HTTPS with LingoBites-Server API proxy (separate repository)
│       ├── /health
│       ├── /v1/ocr
│       └── /v1/ai/analyze
│
└── Release Config (docs/ + src/release/)
    ├── release-manifest
    ├── feature-registry
    ├── feature-dependencies
    └── validate-release-config
```

---

## 7. Folder structure

### Current (M1–M5 — keep until M5 done)

Per `02-technical/02-implementation-plan-m1-m5.md`:

```txt
src/
  app/
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
```

### Target (post-M5 or when starting MT-Practice)

```txt
src/
  app/
    navigation/
    providers/
    bootstrap.ts

  core/
    api/
    storage/
    analytics/
    feature-flags/
    permissions/
    errors/

  theme/                    # MT-Theme (see 06-design/03-theme-system.md)
    themes/
    ThemeProvider.tsx
    useAppTheme.ts

  features/                 # or keep name modules/ — one convention only
    input/
      screens/
      services/
      feature.config.ts
    ocr/
    lesson-analysis/
    lesson-review/
    theme-system/
    mini-games/             # future
    situation-learning/     # future

  release/
    feature-registry.ts
    feature-dependencies.ts
    release-manifest.ts
    validate-release-config.ts
    configs/                # JSON presets (see release-configs/)

  shared/
    components/
    schemas/                # ai-output-v1 copy from docs schema
    fixtures/
    utils/
```

**Migration rule:** Do not rename `modules/` → `features/` during active M1–M5 unless a task
explicitly includes architecture migration. New post-P0 work uses `features/` + `feature.config.ts`.

---

## 8. Two layers of configuration

### Layer A — Build / provider flags (env)

Existing in `01-technical-implementation-spec.md §11`:

```txt
USE_MOCK_AI, USE_MOCK_OCR, ENABLE_TTS, ENABLE_PRACTICE, API_BASE_URL, MAX_TEXT_LENGTH
```

Purpose: dev/staging/prod provider wiring, not user-facing module toggles.

### Layer B — Release feature flags (module visibility)

Declared in `08-feature-registry-release-config.md`.

Purpose: which screens, tabs, and API routes exist for a given release.

**Both layers must be consistent.** Example: `miniGame=true` but `lessonSave=false` → invalid config.

---

## 9. Release rules

### P0 / close beta

- MT-Core flags on (per `close-beta-1.json`).
- MT-Theme optional but recommended.
- MT-Practice / MT-Situation off unless explicitly in scope.

### After P0

```txt
Module finished first + QA pass + valid dependencies → release first
```

Examples:

- Ship `theme-release` before any mini game.
- Ship `wordMatchGame` only — other games stay off.
- Ship `situationLearning` without `miniGame`.

### Rollback

Prefer flag off over store rollback. See `07-release/01-release-production-readiness.md §18` and
`08-feature-registry-release-config.md §9`.

---

## 10. Backend API by module track

### MT-Core (implemented M2–M4)

```txt
GET  /health
POST /v1/ocr
POST /v1/ai/analyze
```

Persistence is **local-first** on mobile in P0 (no cloud lesson API required).

### MT-Practice (future)

```txt
POST /v1/games/generate
POST /v1/games/result
GET  /v1/games/history
```

### MT-Situation (future)

```txt
POST /v1/situations/generate
POST /v1/situations/save-as-lesson
POST /v1/situations/generate-practice
```

Backend must enforce feature guards when routes are added.

---

## 11. Data model alignment

**Phase 0 persistence:** one `lessons` table + `ai_output_json` per `01-technical-implementation-spec.md §9`.

Logical entities in `02-technical/05-data-model.md` apply to P1+ when splitting tables for
flashcards/search/sync.

Future entities (MT-Practice / MT-Situation) — document only until scoped:

- `ReviewItem` — spaced repetition queue
- `GameSession` — mini game attempt
- `SituationLesson` — generated situation content linked to `lessonId`

Do not add DB tables or schema fields until FR/US exists and `01-ai-output-v1.ts` is unaffected.

---

## 12. Team ownership (suggested)

| Team | Owns |
|---|---|
| Core | API proxy, storage, validation, feature flags, analytics |
| Learning | input, ocr, ai-analysis, lesson render/save |
| UI / Theme | design system, theme, `AppText`/`AppButton`/… |
| Practice | mini games, flashcards, review engine |
| Situation | dialogue generation, situation practice |
| QA | flag matrix, regression, release validation |
| Release | release config, CI validation, rollout |

---

## 13. Definition of Done (module level)

Before a module flag turns **on** in a production release:

### Functional

- Matches FR/US for that module.
- Loading, empty, error states (Vietnamese copy).
- Offline/retry where applicable.

### Technical

- Code in correct module folder.
- `feature.config.ts` present.
- Registered in feature registry + dependencies.
- Does not break MT-Core regression.
- API contract documented if new endpoints.

### QA

- Test cases pass for flag on and off.
- Release config validation pass.
- Rollback test (flag off) pass.

Details: `08-feature-registry-release-config.md §7–8`.

---

## 14. When to implement this architecture in code

| Timing | Action |
|---|---|
| **M1–M4** | Keep `modules/` structure; use env flags only; document release configs as specs |
| **M5** | `release/` scaffold + `FeatureFlagProvider` + `useFeatureEnabled()` — **done**; dynamic navigation when tabs ship |
| **Post P0 beta** | Full feature registry, dependency validator, per-game flags |
| **P1 kickoff** | `reviewSystem`, first mini game behind flags |

Do not block M1–M4 core loop on full feature-flag infrastructure.

---

## 15. AI agent rules (summary)

1. Do not modify `core/` when task is scoped to one feature module.
2. Do not hardcode feature state in screens — use `isFeatureEnabled()`.
3. Every new feature module needs `feature.config.ts`.
4. Register routes via feature registry, not ad-hoc navigation edits.
5. Declare dependencies in `feature-dependencies.ts`.
6. Reuse `Lesson` / `ai_output_json` — no duplicate vocab stores.
7. Do not break MT-Core / P0 backward compatibility.
8. Test feature on/off.
9. Loading, empty, error states required.
10. AI schema changes only in `01-ai-output-v1.ts`.

Full list: `08-feature-registry-release-config.md §10`.

---

## 16. Related documents

| Document | Role |
|---|---|
| `08-feature-registry-release-config.md` | Registry, deps, JSON configs, navigation, CI, test matrix |
| `release-configs/*.json` | Named release presets |
| `06-roadmap-release-plan.md` | Product phases P0–P3 |
| `02-implementation-plan-m1-m5.md` | Build order now |
| `06-ai-agent-implementation-guide.md` | Agent workflow updated for modular rules |
