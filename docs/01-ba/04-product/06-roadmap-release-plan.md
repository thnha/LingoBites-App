# Roadmap & Release Plan

## 0. How to read this document (terminology)

This file describes **Product Phases (P0–P3)** — business value over time.

For **how we build and ship** (module tracks, feature flags, release configs), read:

- `02-technical/07-modular-architecture-and-release.md`
- `02-technical/08-feature-registry-release-config.md`
- `02-technical/release-configs/*.json`

| Concept | Doc | Meaning |
|---|---|---|
| **Product Phase P0–P3** | This file | What users get (MVP → retention → speaking → monetization) |
| **Module Track MT-*** | `07-modular-architecture-and-release.md` | Code groups: Core, Theme, Practice, Situation, … |
| **Milestone M0–M5** | `02-implementation-plan-m1-m5.md` | Build order for MT-Core (current work) |
| **Release** | `08-feature-registry-release-config.md` | Named flag bundle (`close-beta-1`, …) |

**Release rule after P0:** modules that finish first + pass QA + satisfy dependencies can ship first —
not necessarily in Product Phase number order. Example: theme release before mini games; one mini game
before the rest; situation learning without mini games.

---

## 1. Product Roadmap Overview

```text
P0 (Phase 0): MVP Scan & Learn        → MT-Core (M0–M5)
P1 (Phase 1): Review & Retention      → MT-Practice (flashcards, games, SRS)
P2 (Phase 2): Speaking & Tutor        → MT-Speaking (future)
P3 (Phase 3): Expansion & Monetization → MT-Monetization + content expansion
```

Cross-cutting: **MT-Theme** (theme system) — recommended early; see `06-design/03-theme-system.md`.

---

## 2. Phase 0 — MVP Scan & Learn

### Goal

Prove core value: user scans English text and receives an easy-to-understand lesson in Vietnamese.

### Main Features

- Camera/gallery/paste text input.
- OCR.
- OCR review/edit.
- AI translation.
- Sentence breakdown.
- Grammar points.
- Vocabulary extraction.
- Basic pronunciation support.
- Save lesson.
- Lesson history.
- Basic analytics.

### Phase Exit Criteria

- Core flow complete.
- AI output stable per schema.
- User testing finds it easy to understand.
- Basic tracking works.

---

## 3. Phase 1 — Review & Retention

### Goal

Increase user return and retention.

### Features

- Vocabulary flashcards.
- Save vocabulary separately.
- Basic spaced repetition.
- Daily review.
- Streak.
- Quiz history.
- Favorite lessons.
- Search lessons/vocabulary.
- Level setting.

### Success Metrics

- Lesson reopen rate increases.
- Vocabulary review rate increases.
- D7 retention improves.

---

## 4. Phase 2 — Speaking Practice & Personal Tutor

### Goal

Help users practice speaking from sentences in the lesson.

### Features

- Listen and repeat.
- Record voice.
- Basic pronunciation feedback.
- Sentence shadowing.
- AI tutor Q&A based on lesson.
- Generate more examples.
- Explain again simpler.
- Roleplay mini conversation based on scanned content.

### Success Metrics

- Audio play rate.
- Speaking practice completion rate.
- Repeat session rate.

---

## 5. Phase 3 — Content Expansion & Monetization

### Goal

Expand input/content sources and build revenue model.

### Features

- PDF scan/import.
- Website/article import.
- Browser/share extension.
- Multi-page document analysis.
- Premium analysis.
- Personalized learning path.
- Subscription.
- Offline saved lessons.
- Advanced grammar course generated from user scans.

### Success Metrics

- Conversion to paid.
- Average lessons per user.
- Long-term retention.
- Cost per AI analysis.

---

## 6. Proposed MVP Release Milestones

### Milestone 1: Prototype

Scope:

- Paste text input.
- Mock AI output from canonical fixtures.
- Result screen.

Goal:

- Validate learning output UX before handling OCR complexity.

---

### Milestone 2: OCR MVP

Scope:

- Image upload.
- OCR.
- Edit extracted text.
- Send text to AI.

Goal:

- Complete scan → analysis flow.

---

### Milestone 3: Save Lesson

Scope:

- Save lesson.
- Lesson history.
- Open lesson detail.

Goal:

- Validate retention loop.

---

### Milestone 4: Polish Beta

Scope:

- Error states.
- Loading states.
- Analytics.
- AI schema validation.
- QA test pass.

Goal:

- Internal/TestFlight beta ready.

---

## 7. Release configs (feature-flag based)

Named presets (spec — implement at M5+):

| Release | Config file | Scope |
|---|---|---|
| Closed beta 1 | `release-configs/close-beta-1.json` | P0 / MT-Core only |
| Theme | `release-configs/theme-release.json` | + MT-Theme |
| Mini game (first) | `release-configs/mini-game-release.json` | + word match + review |
| Situation learning | `release-configs/situation-learning-release.json` | + MT-Situation |

Validate dependencies before every release. Rollback by turning flags off — see
`08-feature-registry-release-config.md §9`.

---

## 8. Release Checklist

Before releasing Phase 0 beta:

- [ ] Core flow works on real devices.
- [ ] Camera permission handled.
- [ ] Gallery permission handled.
- [ ] OCR works with clear images.
- [ ] User can edit OCR text.
- [ ] AI output schema validation works.
- [ ] Result UI handles empty vocabulary/grammar/practice.
- [ ] Save lesson works.
- [ ] Lesson history works.
- [ ] Network/OCR/AI errors have retry.
- [ ] Basic analytics events are tracked.
- [ ] Privacy note is available.
- [ ] QA P0 test cases pass.

---

## 9. Prioritization Framework

Use this order when cutting scope:

1. Paste text + AI result.
2. Image upload + OCR.
3. OCR edit.
4. Sentence/vocabulary/grammar result UI.
5. Save lesson.
6. Pronunciation.
7. Practice.
8. Advanced retention/gamification.

Do not build gamification before learning output is genuinely useful.
