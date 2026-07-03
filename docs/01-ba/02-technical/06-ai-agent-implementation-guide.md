# AI Agent Implementation Guide

## 1. Purpose

This document is for AI coding agents or developers using AI to implement the app correctly.

Agent should read documents in this minimum order:

1. `README.md`
2. `01-schema/01-ai-output-v1.ts`
3. `02-technical/01-technical-implementation-spec.md`
4. `02-technical/02-implementation-plan-m1-m5.md`
5. `04-product/04-phase0-prd.md`
6. `03-requirements/01-functional-requirements.md`
7. `03-requirements/02-business-rules.md`
8. `05-qa/01-qa-test-plan.md`
9. `03-requirements/05-traceability-matrix.md`

Open additionally only when needed:

- `02-technical/07-modular-architecture-and-release.md` when adding post-P0 modules or understanding release strategy.
- `02-technical/08-feature-registry-release-config.md` when adding feature flags, release configs, or navigation guards.
- `02-technical/03-ai-output-requirements.md` when prompt/output quality detail is needed.
- `02-technical/05-data-model.md` when entity/persistence detail beyond `02-technical/01-technical-implementation-spec.md §9` is needed.
- `03-requirements/03-user-stories-acceptance.md` when acceptance wording is needed.
- `07-release/01-release-production-readiness.md`, `07-release/02-privacy-policy-draft.md`, `07-release/03-store-listing-design-assets.md` before beta/store release.
- `02-technical/04-ai-ocr-integration.md` when implementing real OCR/AI providers in M2/M3.
- `06-design/03-theme-system.md` when doing UI foundation/polish; does not block Phase 0 core loop.

---

## 2. Implementation Principles

Do not build the app as a simple translation app. Build according to the core loop:

```text
Scan/Input → Confirm Text → Generate Lesson → Learn → Save → Review
```

---

## 3. Recommended Module Structure

**M1–M5 (current):** use `src/modules/` per `02-implementation-plan-m1-m5.md`.

**Post-P0 / new capabilities:** add under `features/` with `feature.config.ts` per
`07-modular-architecture-and-release.md §7`.

```text
src/
  modules/                    # MT-Core (P0) — current
    input/
    ocr/
    ai-analysis/
    lesson/
    vocabulary/
    grammar/
    pronunciation/
    practice/
    analytics/
  theme/                      # MT-Theme
  features/                   # MT-Practice, MT-Situation (post-P0)
    mini-games/
      feature.config.ts
    situation-learning/
      feature.config.ts
  release/                    # M5+ scaffold
    feature-registry.ts
    feature-dependencies.ts
    validate-release-config.ts
    configs/                  # from docs/.../release-configs/
  shared/
    components/
    schemas/
    fixtures/
    utils/
```

Do not rename `modules/` → `features/` during M1–M4 unless the task explicitly includes migration.

---

## 4. Recommended Development Order

### Step 1: Types & schema

Create types for:

- Lesson
- SentenceAnalysis
- VocabularyItem
- GrammarPoint
- PracticeQuestion
- AIOutput

Do this before UI.

### Step 2: Paste Text Prototype

Build:

- PasteTextScreen
- Analyze button
- Mock AI output
- Result screen

Purpose:

- Validate output rendering without OCR complexity yet.

### Step 3: AI Integration

Build:

- PromptBuilder
- AIAnalysisService
- AIOutputValidator
- Error handling

### Step 4: OCR Integration

Build:

- Image input
- OCR service
- OCR review/edit screen

### Step 5: Save Lesson

Build:

- Lesson repository
- Save button
- Lesson list
- Lesson detail

### Step 6: Pronunciation & Practice

Build:

- TTS/play audio
- Practice section

### Step 7: QA & Polish

Build:

- Empty states
- Loading states
- Error states
- Analytics events
- Regression tests

---

## 5. Validate AI Output

Do not write manual validators in app or backend.

The only source of truth for AI output schema is:

```text
docs/01-ba/01-schema/01-ai-output-v1.ts
```

Use directly:

```ts
import { AIOutputSchema, validateAIOutput, type AIOutput } from "./01-ai-output-v1";

const result = validateAIOutput(raw);
if (!result.valid) {
  // Backend: retry at most once then return AI_INVALID_OUTPUT.
  // Mobile: do not render/save, show friendly error.
}
```

Do not re-describe AI output fields in docs or separate code without importing from this schema.

---

## 6. Important Rules for Agent

### Do

- Keep UI beginner-friendly.
- Use Vietnamese labels and explanations.
- Render empty states instead of crashing.
- Keep OCR text editable.
- Store confirmed text as source of truth.
- Validate AI output with `validateAIOutput()`.
- Save full AI output for saved lessons.
- Track core funnel events.

### Do not

- Send OCR text to AI if user has not confirmed.
- Hardcode assumptions about AI response without validation.
- Display too many grammar points by default.
- Log full user text to analytics.
- Call AI again every time a saved lesson is opened.
- Build payment/gamification before core learning flow works.
- Hardcode post-P0 features as always visible — use `isFeatureEnabled()` when release infra exists.
- Add feature modules without registry + dependency entries (`08-feature-registry-release-config.md`).
- Create separate vocab/grammar stores for mini games — reuse saved lesson `ai_output_json`.

---

## 7. UI Render Rules

Result screen should render sections in this order:

```text
1. Title
2. Original text
3. Vietnamese translation
4. Sentence analysis
5. Vocabulary
6. Grammar
7. Pronunciation
8. Practice
9. Save lesson
```

If section is empty:

- Vocabulary empty → show friendly message.
- Grammar empty → show friendly message.
- Practice empty → hide section or show “Coming soon”.

---

## 8. Definition of Done for Agent

A task is done only when:

- Requirement is implemented.
- Loading state exists.
- Error state exists.
- Empty state exists if applicable.
- Basic tests/manual test steps pass.
- No requirement is silently skipped.
- Code follows project structure.
- UI text is in Vietnamese for user-facing labels.

**Post-P0 modules additionally:**

- `feature.config.ts` + registry/dependency updates if user-visible flag applies.
- Feature on/off behavior documented or tested.
- `05-traceability-matrix.md` Status updated.

---

## 9. Recommended Prompt for AI Coding Agent

```text
You are implementing Phase 0 of LingoBites.
Read the BA documentation first.
Focus only on Phase 0 MVP.

Core flow:
Input image/text → OCR/edit → AI structured analysis → result screen → save lesson.

Rules:
- Beginner Vietnamese learner first.
- OCR text must be editable before AI analysis.
- AI output must be validated before render.
- Saved lessons must open without re-calling AI.
- Implement loading, error, and empty states.
- Do not add out-of-scope features unless requested.

Start by importing/copying the canonical AI schema from `docs/01-ba/01-schema/01-ai-output-v1.ts`, then create mock AI output wiring and result screen.
Use `02-technical/01-technical-implementation-spec.md` for stack, API, persistence, env, and milestone decisions.
Use `07-release/01-release-production-readiness.md` before preparing beta/public release.
Use `02-technical/02-implementation-plan-m1-m5.md` to execute implementation in milestone order.
```

---

## 10. Recommended Prompt for QA Agent

```text
Act as senior QA for LingoBites Phase 0.
Use the BA documentation and test plan.
Create test cases for:
- image input
- OCR success/fail
- edit OCR text
- paste text
- AI output rendering
- invalid AI output
- save lesson
- lesson history
- network failure
- empty states

Return test cases as a table with:
ID, title, precondition, steps, expected result, priority.
```
