# Design Session: Flashcards / SRS / Daily Review — Phase 1

## Lane Selection

**Lane:** Full

**Rationale:** Independently confirmed against the Design Team lane criteria (not inherited blindly from BA's Full Lane call, which was for a different process). Full Lane triggers because: (1) ≥3 new screens — Flashcard List, Flashcard Detail/Flip, Daily Review Session, Daily Review Summary, plus 2 new empty states and a possible entry-point widget/tab; (2) a shared component gap is likely — flip-card interaction and 4-way rating buttons have no existing equivalent in `src/components/` (closest are `WordCard.tsx`, `QuizOption.tsx`, but neither does a flip or graded-recall interaction); (3) `04-html-handoff-to-code-spec.md`/theme changes are not expected, but the new SRS/review data touches all 3 personas (Minh, An, Lan) per the BA input package §3.

## Stage Plan

### Full Lane (9 stages, 3 gates)
| Stage | Work | Assignee | Status |
|---|---|---|---|
| 1 | Design brief, scope, screen inventory, clarification log, traceability register | Design Lead | **done (this run)** |
| 2 | **Human Gate 1** — user flow approval | TranHoangNha | **done — approved (defaults accepted)** |
| 3 | IA, task/user/screen flows, states, exception/recovery paths | UX Flow & IA Designer | **todo (promoted)** |
| 4a | Wireframe + state matrix + responsive | UI & Wireframe Designer | backlog |
| 4b | Content copy deck + error matrix | Content Designer | backlog |
| 5 | **Human Gate 2** — wireframe business/usability approval | TranHoangNha | backlog |
| 6 | UI spec, design-system gap list, HTML handoff, motion spec | UI & Wireframe Designer | backlog |
| 7 | Heuristic review, contrast check, a11y checklist, issue log | UX & Accessibility Critic | backlog |
| 8 | Synthesis: final handoff package, traceability matrix, logs | Design Lead | backlog |
| 9 | **Human Gate 3** — final handoff approval | TranHoangNha | backlog |

## Screen Inventory

| Screen ID | Screen Name | Type | Notes |
|---|---|---|---|
| SCR-01 | Vocabulary item — save-to-flashcard affordance | Modified | Lives on the existing vocabulary list within `LessonResultScreen`/`SavedLessonDetailScreen` (`lesson.vocabulary`) and `WordDetailScreen`. Add saved/unsaved toggle. Reuse `WordCard`, `Chip`. FR-FLASH-001/002. |
| SCR-02 | Flashcard List | New | All saved flashcards across lessons. Candidate reuse: `ListRow`, `LessonCard` pattern. FR-FLASH-003. Must visually disambiguate same-word-different-lesson (E2). |
| SCR-03 | Flashcard Detail / Flip Card | New | Front/back flip, unsave entry point. FR-FLASH-004/007. No existing flip-card component — likely design-system gap, flag at Stage 6. |
| SCR-04 | Daily Review entry point | New | **Resolved at Gate 1: Home widget/card** (Q-DESIGN-01 = Option A). Due-count indicator (FR-REVIEW-005, Should) lives on Home, not a new tab. No 3→4-tab nav change needed. |
| SCR-05 | Daily Review Session | New | Card-by-card flip + rate/skip. FR-REVIEW-001/002. **Resolved at Gate 1: Fixed-interval SRS (Q-DESIGN-03 = Option 3)** — rating control is rate/skip, not a 4-level SM-2 control. Also needs a "N left, continue tomorrow" state per Q-DESIGN-04 = Option 2 (soft cap). |
| SCR-06a | Daily Review — empty state: never saved | New (state) | Distinct copy/illustration from SCR-06b. FR-REVIEW-004, AC-REV-007. |
| SCR-06b | Daily Review — empty state: done for today | New (state) | Must not reuse SCR-06a's empty state per BA note (E4). |
| SCR-07 | Daily Review — Session Summary | New | Shown when snapshot fully processed. FR-REVIEW-003. |
| SCR-08 | Unsave confirmation | New (modal, Should) | Only for cards with review history. FR-FLASH-010. |
| SCR-09 | Lesson delete guard | New — **in scope** | **Resolved at Gate 1: block/RESTRICT (Q-DESIGN-02 = Option A).** Confirmed in scope — blocking dialog/guidance screen required before a lesson with active flashcards can be deleted. |

## State Matrix (Stage 1 skeleton — full matrix owned by Stage 4a)

| Screen | Normal | Loading | Empty | Error | Success | Disabled | Other |
|---|---|---|---|---|---|---|---|
| SCR-02 Flashcard List | ☐ | ☐ (local DB read, brief) | ☐ (no flashcards saved yet) | — (offline-first, no network error per NFR-AVAIL-01) | — | — | — |
| SCR-03 Flip Card | ☐ (front/back) | — | — | — | ☐ (unsaved confirmation toast) | — | — |
| SCR-04 Entry point | ☐ (due count > 0) | — | ☐ (due count = 0) | — | — | — | Blocked by Q8 |
| SCR-05 Review Session | ☐ | ☐ (resume after crash, A-03) | ☐→SCR-06a/b | — | — | ☐ (rating buttons mid-transition) | — |
| SCR-07 Summary | ☐ | — | — | — | ☐ | — | — |

## Input Package from BA Team

**Source Issue:** [VIB-115](mention://issue/6edf1ca8-c90d-4dec-a9d9-57ab1811e412) — attachments `07-phase1-prd-draft.md`, `design-team-input-package.md`. Status: done, passed all 3 Human Gates (VIB-116, VIB-123, VIB-124 — note all three were approved with bare "Approve", no per-option detail).

**Included (all 13 items present):**
- [x] Problem statement and scope
- [x] Personas or user groups (Minh, An, Lan)
- [x] User goals / JTBD
- [x] Prioritized user stories or use cases (US-016..021, VIB-117 §6, VIB-120 US-021)
- [x] Main, alternative, exception, edge-case flows (E1–E7)
- [x] Business rules (BR-FLASH-*, BR-SRS-*, BR-REVIEW-*)
- [x] Data and validation rules (§10 — `flashcards`, `review_schedule`, `review_sessions`)
- [x] Roles and permissions (none new — inherits P0 anonymous-user model)
- [x] Acceptance criteria (~30 AC at VIB-122 §2)
- [x] Non-functional requirements (§11)
- [x] Technical constraints (§12 — 3-tab nav, feature flag `reviewSystem`, component reuse list)
- [x] Assumption / question / risk / decision logs (§13)

**Missing or unclear:** Nothing missing structurally — package is complete per the 13-item checklist. What blocks Design specifically is that **5 of the BA's open decisions were never actually resolved** at any of the 3 BA gates (all three approvals were bare "Approve," no option selected). Per L4, Design Team does not self-fill these — they go to Clarification Log below and Gate 1.

## Design Logs

### Assumptions
| ID | Assumption | Validation Status | Owner |
|---|---|---|---|
| DA-01 | Rating control for SRS review will need at least 2 and at most 4 discrete actions (skip + N rating levels) regardless of which §9.2 algorithm is picked — safe to start IA on this basis | Validated — resolved to rate/skip by Gate 1 (Q-DESIGN-03) | Design Lead |
| DA-02 | SCR-09 (lesson delete guard) is out of this design session's screen budget unless §9.1 resolves to Option A before Stage 3 starts | Validated — Gate 1 confirmed Option A, SCR-09 is in scope | Design Lead |

### Questions
| ID | Question | Target | Answer | Status |
|---|---|---|---|---|
| Q-DESIGN-01 (= inherited Q8 / Q-GATE-04) | Daily Review entry point: 4th tab, Home widget, or Lessons sub-item? | TranHoangNha | **Home widget (Option A)** | Answered — Gate 1 (VIB-126), bare "Approve" = default accepted |
| Q-DESIGN-02 (= inherited §9.1 CRIT-002) | Lesson-delete-with-active-flashcards policy | TranHoangNha | **Block/RESTRICT (Option A)** — SCR-09 in scope | Answered — Gate 1, default accepted |
| Q-DESIGN-03 (= inherited §9.2 Q1) | SRS algorithm | TranHoangNha | **Fixed interval (Option 3)** | Answered — Gate 1, default accepted |
| Q-DESIGN-04 (= inherited §9.3 MED-006) | Daily queue cap | TranHoangNha | **Soft cap with carry-over (Option 2)** | Answered — Gate 1, default accepted |

### Risks
| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| DR-01 | Repeated bare "Approve" pattern seen on all 3 BA gates recurred at Gate 1 (VIB-126: bare "Approve", 2026-08-16) — mitigation held: because each item had a marked default, the bare approval still resolved Q-DESIGN-01..04 cleanly instead of stalling. Same risk applies to Gates 2 and 3 — keep every future gate question in choice-with-default form. | Medium | High (mitigated) | Continue presenting every gate question as an explicit choice with a marked default | Design Lead |
| DR-02 (inherited R2) | New review/schedule tables ride on the same migration layer that just had a SQLite syntax fix (`6e1f830`) — no design impact directly, but Stage 6 HTML handoff should not imply data shapes the migration can't yet support | Low | Medium | Flag to UI & Wireframe Designer at Stage 6; confirm with Mobile Tech Lead before implementation | Mobile Tech Lead (inherited) |

### Decisions
| ID | Decision | Rationale | Date | Decider |
|---|---|---|---|---|
| DD-01 | Full Lane confirmed independently for Design (see rationale above) | ≥3 new screens alone satisfies the trigger | 2026-08-16 | Design Lead |
| DD-02 (Gate 1) | D1 Entry point = **Option A, Home widget/card** | Bare "Approve" on [VIB-126](mention://issue/6e4c65c6-2242-47e3-a7bb-3182a14147e9) — accepted stated default | 2026-08-16 | TranHoangNha |
| DD-03 (Gate 1) | D2 Lesson delete = **Option A, block/RESTRICT** (SCR-09 is in scope) | Bare "Approve" on VIB-126 — accepted stated default | 2026-08-16 | TranHoangNha |
| DD-04 (Gate 1) | D3 SRS algorithm = **Option 3, Fixed interval** (rating control: rate/skip, not 4-level) | Bare "Approve" on VIB-126 — accepted stated default | 2026-08-16 | TranHoangNha |
| DD-05 (Gate 1) | D4 Daily queue cap = **Option 2, soft cap with carry-over** (SCR-05/07 need a "N left, continue tomorrow" state) | Bare "Approve" on VIB-126 — accepted stated default | 2026-08-16 | TranHoangNha |

## Traceability Matrix (skeleton — populated fully by Stage 8)

| Requirement ID | User Story / Use Case | Flow Step | Screen | Component | State | Acceptance Criteria | Status |
|---|---|---|---|---|---|---|---|
| FR-FLASH-001/002 | US-016 | Save vocab from lesson | SCR-01 | `WordCard`, `Chip` | Normal/Saved | AC-FLASH-001..003 | Pending |
| FR-FLASH-003/004 | US-017, US-018 | View list / flip card | SCR-02, SCR-03 | `ListRow` (candidate), new flip component (gap) | Normal/Empty | AC-FLASH-004..008 | Pending |
| FR-FLASH-007/008/009 | US-021 | Unsave / re-save | SCR-03, SCR-08 | — | Success | AC-FLASH-009, AC-FLASH-... | Pending |
| FR-REVIEW-001..003 | US-019 | Daily review session | SCR-05, SCR-07 | new rating control (gap) | Normal/Success | AC-REV-001..006 | Pending |
| FR-REVIEW-004 | US-019 | Empty states | SCR-06a, SCR-06b | — | Empty (×2) | AC-REV-007 | Pending |
| FR-REVIEW-005 | US-020 | Due count | SCR-04 | badge (candidate: existing badge pattern, TBD) | Normal | — | Pending — blocked by Q-DESIGN-01 |

## Design System Changes

**Tokens Modified:** None expected.

**New Components:** Candidate gap — flip-card component (front/back reveal) and SRS rating control (2–4 buttons, accessible per NFR-ACC-004: color + label/icon, not color alone). Final call at Stage 6 gap list, after UI & Wireframe Designer evaluates whether `QuizOption`/`WordCard` can be extended instead of net-new.

**Component Modifications:** `WordCard.tsx` likely needs a saved-state prop/variant (SCR-01). To confirm at Stage 4a.

**Design System Gaps Identified:** Deferred to Stage 6 per lane stage table.

## Handoff Artifacts

- [ ] User flows (Mermaid diagrams) — light version below for Gate 1; full IA at Stage 3
- [ ] Wireframes
- [ ] UI specifications
- [ ] HTML handoff files (with header: date, issue, "artifact trung gian")
- [ ] Content copy deck
- [ ] Error message matrix
- [ ] Motion specifications
- [ ] Accessibility checklist
- [ ] Review findings log
- [ ] Traceability matrix
- [ ] Final synthesis document

## Completion Checklist

Per Design Team Completion Rule:

- [ ] User flow passed Human Gate 1
- [ ] Wireframes passed Human Gate 2
- [ ] Every critical requirement and state represented in design or documented as non-visual
- [ ] No critical usability/accessibility/traceability issues remain unresolved
- [ ] All open risks and questions have owners
- [ ] Final handoff package passed Human Gate 3

---

**Note:** Stage 1 (this document) authored by Design Lead, 2026-08-16. Gate 1 ([VIB-126](mention://issue/6e4c65c6-2242-47e3-a7bb-3182a14147e9)) approved same day (bare "Approve") — all 4 defaults accepted (Home widget entry point, block/RESTRICT lesson delete, fixed-interval SRS, soft-cap daily queue). Stage 3 ([VIB-127](mention://issue/7e4baeed-e7cc-446d-aad1-59b865d6b981)) promoted to `todo` for UX Flow & IA Designer.
