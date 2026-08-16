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
| 3 | IA, task/user/screen flows, states, exception/recovery paths | UX Flow & IA Designer | **done** |
| 4a | Wireframe + state matrix + responsive | UI & Wireframe Designer | **done** |
| 4b | Content copy deck + error matrix | Content Designer | **done** |
| 5 | **Human Gate 2** — wireframe business/usability approval | TranHoangNha | **done — approved (defaults accepted)** |
| 6 | UI spec, design-system gap list, HTML handoff, motion spec | UI & Wireframe Designer | **done — round 2, fixes verified independently** |
| 7 | Heuristic review, contrast check, a11y checklist, issue log | UX & Accessibility Critic | **todo (round 2 re-review, promoted)** |
| 8 | Synthesis: final handoff package, traceability matrix, logs | Design Lead | **held — not promoted, see below** |
| 9 | **Human Gate 3** — final handoff approval | TranHoangNha | backlog |

## Screen Inventory

**Updated by Stage 3 (VIB-127) — now 11 screens/states, refined from Stage 1's 9.** SCR-01 split into 1a/1b once Stage 3 traced it to real code: `WordDetailScreen.tsx:34` already renders an unwired `bookmark` `IconButton` — SCR-01b just wires it, no new component.

| Screen ID | Screen Name | Type | Notes |
|---|---|---|---|
| SCR-01a | Vocabulary list row — save affordance | Modified | Inline on `LessonResultScreen`/`SavedLessonDetailScreen` vocabulary section. Reuse `WordCard` (needs saved-state prop). FR-FLASH-001/002. |
| SCR-01b | Word Detail — save/unsave toggle | Modified | Wires the existing unwired `bookmark` `IconButton` at `WordDetailScreen.tsx:34`. No new component. FR-FLASH-001/002. |
| SCR-02 | Flashcard List | New | All saved flashcards across lessons. **Entry point confirmed (Design Lead, DA-IA-01): new header action on `LessonsHistoryScreen`** — no nav-structure change. Candidate reuse: `ListRow`, `LessonCard` pattern. FR-FLASH-003. Must visually disambiguate same-word-different-lesson (E2). |
| SCR-03 | Flashcard Detail / Flip Card | New | Front/back flip, unsave entry point. FR-FLASH-004/007. No existing flip-card component — likely design-system gap, flag at Stage 6. |
| SCR-04 | Daily Review entry point | New | **Resolved at Gate 1: Home widget/card** (Q-DESIGN-01 = Option A). Due-count indicator (FR-REVIEW-005, Should) lives on Home, not a new tab. No 3→4-tab nav change needed. |
| SCR-05 | Daily Review Session | New | Card-by-card flip + rate/skip. FR-REVIEW-001/002. **Resolved at Gate 1: Fixed-interval SRS (Q-DESIGN-03 = Option 3)** — rating control is rate/skip, not a 4-level SM-2 control. Also needs a "N left, continue tomorrow" state per Q-DESIGN-04 = Option 2 (soft cap). |
| SCR-06a | Daily Review — empty state: never saved | New (state) | Distinct copy/illustration from SCR-06b. FR-REVIEW-004, AC-REV-007. |
| SCR-06b | Daily Review — empty state: done for today | New (state) | Must not reuse SCR-06a's empty state per BA note (E4). |
| SCR-07 | Daily Review — Session Summary | New | Shown when snapshot fully processed. FR-REVIEW-003. |
| SCR-08 | Unsave confirmation | New (modal, Should) | Only for cards with review history. FR-FLASH-010. |
| SCR-09 | Lesson delete guard | New — **in scope** | **Resolved at Gate 1: block/RESTRICT (Q-DESIGN-02 = Option A).** Confirmed in scope — blocking dialog/guidance screen required before a lesson with active flashcards can be deleted. |

## State Matrix

**Full matrix delivered by Stage 4a ([VIB-128](mention://issue/4faef63a-6c8a-45ac-b241-e6fdf85453a8) §5, attached to Gate 2) — supersedes this Stage 1 skeleton.** Notable resolutions: SCR-05 gained an explicit non-blocking inline **Error** state for atomic rating-write failure (reuses `ErrorCard` as-is); SCR-02 gained a lesson-filtered variant (serves SCR-09's recovery CTA); capped-queue banner locked as a persistent **Other** state on SCR-05, echoed on SCR-07.

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
| DA-IA-01 (from Stage 3, VIB-127 §5/§8) | Flashcard List (SCR-02) entry point = new header action on `LessonsHistoryScreen` — Gate 1's D1–D4 never covered this destination, only the Daily Review entry | **Confirmed by Design Lead** (2026-08-16) — no nav-structure change, not a critical product decision requiring TranHoangNha | Design Lead |
| DA-IA-02 (from Stage 3) | Local-write failures on save/unsave/rate are silent (consistent with existing `deleteLesson` swallow-and-return-false pattern), not surfaced as user-facing errors | Pending — flagged to Stage 4a to decide if an explicit error state is warranted | UI & Wireframe Designer |

### Questions
| ID | Question | Target | Answer | Status |
|---|---|---|---|---|
| Q-DESIGN-01 (= inherited Q8 / Q-GATE-04) | Daily Review entry point: 4th tab, Home widget, or Lessons sub-item? | TranHoangNha | **Home widget (Option A)** | Answered — Gate 1 (VIB-126), bare "Approve" = default accepted |
| Q-DESIGN-02 (= inherited §9.1 CRIT-002) | Lesson-delete-with-active-flashcards policy | TranHoangNha | **Block/RESTRICT (Option A)** — SCR-09 in scope | Answered — Gate 1, default accepted |
| Q-DESIGN-03 (= inherited §9.2 Q1) | SRS algorithm | TranHoangNha | **Fixed interval (Option 3)** | Answered — Gate 1, default accepted |
| Q-DESIGN-04 (= inherited §9.3 MED-006) | Daily queue cap | TranHoangNha | **Soft cap with carry-over (Option 2)** | Answered — Gate 1, default accepted |
| Q-FLOW-01 (from Stage 3) | Exact carry-over wording/UX for D4's soft cap | UI & Wireframe Designer / Content Designer | State = persistent banner on SCR-05, echoed on SCR-07; copy = `"Hôm nay ôn {sessionCount} thẻ. {remainingCount} thẻ còn lại sẽ được để dành cho lần ôn sau"` (deliberately "lần ôn sau," not "ngày mai" — see RISK-CT-01) | Answered — Stage 4a (state) + Stage 4b (copy) |
| Q-FLOW-02 (from Stage 3) | BR-REVIEW-002's "Again → relearning" wording is SM-2-flavored but D3 resolved to fixed-interval — PRD text is stale relative to the Gate 1 decision | Content Designer (Stage 4b) | UI copy uses "Nhớ" / "Chưa nhớ" / "Bỏ qua" only, no "Again" anywhere visible. Canonical PRD text itself is still stale — see CONFLICT-01 below | Answered for UI; PRD correction still owned by Product |
| Q-FLOW-03 (from Stage 3) | SCR-09's "Xem flashcard" CTA — lesson-filtered flashcard list vs. deep-link into lesson vocabulary section | UI & Wireframe Designer | **Lesson-filtered SCR-02** (reuses the E2 lesson-source query SCR-02 already needs) | Answered — Stage 4a |
| Q-GATE2-01 (from Stage 4a §8) | SCR-05 `×` exit mid-session — confirm no-penalty, no confirmation dialog is correct | TranHoangNha | **No confirmation (Option A)** | Answered — Gate 2 (VIB-130), bare "Approve" accepted default |
| Q-GATE2-02 (from Stage 4b §6) | Confirm the one-time first-save disclosure pattern (blocking dialog, "Đã hiểu" / "Huỷ lưu") is the right shape | TranHoangNha | **Blocking, with cancel (Option A)** | Answered — Gate 2, default accepted. Engineering note stands: needs a persisted local acknowledgement flag so it doesn't re-show. |

### Risks
| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| DR-01 | Repeated bare "Approve" pattern seen on all 3 BA gates recurred at Gate 1 (VIB-126: bare "Approve", 2026-08-16) — mitigation held: because each item had a marked default, the bare approval still resolved Q-DESIGN-01..04 cleanly instead of stalling. Same risk applies to Gates 2 and 3 — keep every future gate question in choice-with-default form. | Medium | High (mitigated) | Continue presenting every gate question as an explicit choice with a marked default | Design Lead |
| DR-02 (inherited R2) | New review/schedule tables ride on the same migration layer that just had a SQLite syntax fix (`6e1f830`). Stage 6 confirmed the UI only needs a 2-outcome shape (`'remembered' \| 'forgot'`, plus skip = no write) for `RatingControl` — still needs sign-off from the schema owner that this matches the actual migration before implementation. | Low | Medium | Confirm 2-outcome shape against migration before implementation | Mobile Tech Lead |
| DR-03 (from Stage 4b) | Content copy says carry-over cards go to "lần ôn sau" (next review), deliberately not "ngày mai" (tomorrow), because the approved rules don't guarantee next-day timing. If Product later wants a "tomorrow" guarantee, BR-REVIEW-003 needs to say so explicitly before copy changes. | Low | Low | No action needed now — copy correctly matches current rules; revisit only if BR-REVIEW-003 changes | Product Owner |
| DR-04 (from Stage 4b) | First-save disclosure requires a persisted local acknowledgement flag, or the one-time dialog would re-show on every save (friction). Engineering-level requirement, not yet an implementation ticket. | Low | Medium | Carry into Stage 6/8 handoff as an explicit implementation note | Design Lead (to hand off) |
| DR-05 (from Stage 7, [VIB-132](mention://issue/fa3e1b8d-340c-4e23-ae0e-8c0d5a73f8e8)) — H1 | Dark theme's `RatingControl` "Chưa nhớ" pairing (`surfaceHigh`/`primary`) measures 2.82:1, below WCAG AA's 4.5:1; all 6 other shipped themes pass (5.23–6.73:1) | Confirmed (verified contrast) | High | Sent back to Stage 6 round 2 ([VIB-131](mention://issue/58e3a917-c023-4347-93d5-648865def4d1)) — define a token pair that passes in all 7 themes, recheck all 7 after fix | UI & Wireframe Designer |
| DR-06 (from Stage 7) — H2 | HTML handoff's SCR-05 capped-queue variant shows progress "2/20" (total due) while the banner separately states 8 this session/12 deferred — denominator should be the 8-card session snapshot, not the 20-card total | Confirmed (internal contradiction) | High | Sent back to Stage 6 round 2 — fix denominator, add explicit invariant to the spec | UI & Wireframe Designer |
| DR-07 (from Stage 7) — M1/M2 | `FlipCard` sizing (220/200/160/140px across states, undocumented) and `Banner` typography (14sp spec vs. 12px in HTML) are inconsistent between the component spec and the HTML handoff examples | Confirmed | Medium | Sent back to Stage 6 round 2 alongside H1/H2 (same revision pass) | UI & Wireframe Designer |
| DR-08 (from Stage 7) | Human-only checks not verifiable from a static HTML artifact: VoiceOver/TalkBack announcement of flip state and card content, focus order, Dynamic Type wrapping at large scale, disabled/retry state announcement | Unverified — explicitly out of scope for a WCAG-*informed* review per L2 | Medium | Log as an implementation-QA checklist item, verify on simulator/device before release | Engineering / QA (at implementation) |
| DR-09 (round 2 no-op) | Stage 6's first round-2 attempt self-closed `done` with no completion comment and byte-identical attachments to round 1 — none of H1/H2/M1/M2 were fixed. | Confirmed — verified by diff | High | **Resolved** — re-triggered VIB-131 a second time; that attempt delivered a genuine revision (23:26 attachments, verified different by diff). | Design Lead — closed |
| DR-10 (round 2, verified) | H1 fix independently re-checked: Design Lead recomputed WCAG contrast directly from `src/theme/themes/dark.ts` hex values (`surfaceHigh` `#334155` vs `text.secondary` `#cbd5e1`) — got **6.97:1**, matching Stage 6's claim exactly, and matching the original 2.82:1 failure for the old `primary` token too. H2 (progress denominator "2/8" not "2/20"), M1 (220px `FlipCard` height everywhere), M2 (14px `Banner` text everywhere) spot-checked directly in the HTML source, all confirmed present. | Verified by Design Lead, not just claimed by Stage 6 | — | Sent to Stage 7 ([VIB-132](mention://issue/fa3e1b8d-340c-4e23-ae0e-8c0d5a73f8e8)) for a full round-2 re-review (Design Lead's spot-check covered the highest-risk item and 3 others, not a substitute for the Critic's complete pass — e.g. other themes' recalculated contrast, `Banner`'s own pairing, motion-spec regression check) | UX & Accessibility Critic |

### Conflicts
| ID | Conflict | Parties | Resolution | Status |
|---|---|---|---|---|
| CONFLICT-01 (from Stage 4b) | Canonical `07-phase1-prd-draft.md` BR-REVIEW-002 still reads "Again → relearning" (SM-2 language), but Gate 1 D3 approved fixed-interval (2-outcome). No visible UI string uses "Again" — resolved at the copy layer — but the canonical business-rule text itself is stale and Design cannot edit the PRD. | Design (resolved for UI) vs. PRD document (unedited) | Not resolved at the document level — flagged for Product/BA to correct the canonical PRD wording; does not block this design session | Open — owner: Product/BA, not blocking |

### Decisions
| ID | Decision | Rationale | Date | Decider |
|---|---|---|---|---|
| DD-01 | Full Lane confirmed independently for Design (see rationale above) | ≥3 new screens alone satisfies the trigger | 2026-08-16 | Design Lead |
| DD-02 (Gate 1) | D1 Entry point = **Option A, Home widget/card** | Bare "Approve" on [VIB-126](mention://issue/6e4c65c6-2242-47e3-a7bb-3182a14147e9) — accepted stated default | 2026-08-16 | TranHoangNha |
| DD-03 (Gate 1) | D2 Lesson delete = **Option A, block/RESTRICT** (SCR-09 is in scope) | Bare "Approve" on VIB-126 — accepted stated default | 2026-08-16 | TranHoangNha |
| DD-04 (Gate 1) | D3 SRS algorithm = **Option 3, Fixed interval** (rating control: rate/skip, not 4-level) | Bare "Approve" on VIB-126 — accepted stated default | 2026-08-16 | TranHoangNha |
| DD-05 (Gate 1) | D4 Daily queue cap = **Option 2, soft cap with carry-over** (SCR-05/07 need a "N left, continue tomorrow" state) | Bare "Approve" on VIB-126 — accepted stated default | 2026-08-16 | TranHoangNha |
| DD-06 (Gate 2) | D5 SCR-05 exit mid-session = **Option A, no confirmation dialog** | Bare "Approve" on [VIB-130](mention://issue/a56bcabd-503d-4766-8d8b-e1e599afb4d7) — accepted stated default | 2026-08-16 | TranHoangNha |
| DD-07 (Gate 2) | D6 First-save disclosure = **Option A, blocking dialog with cancel** | Bare "Approve" on VIB-130 — accepted stated default | 2026-08-16 | TranHoangNha |

## Traceability Matrix (skeleton — populated fully by Stage 8; see VIB-127 §9 and VIB-128 §7 for interim additions)

| Requirement ID | User Story / Use Case | Flow Step | Screen | Component | State | Acceptance Criteria | Status |
|---|---|---|---|---|---|---|---|
| FR-FLASH-001/002/005/006 | US-016 | Save vocab from lesson | SCR-01a, SCR-01b | `WordCard` (+saved-state prop), existing `IconButton` | Normal/Saved | AC-FLASH-001..003 | Mapped |
| FR-FLASH-003/004 | US-017, US-018 | View list / flip card | SCR-02, SCR-03 | `ListRow`-derived row, new flip component (gap) | Normal/Empty/Loading | AC-FLASH-004..008 | Mapped |
| FR-FLASH-007/008/009/010 | US-021 | Unsave / re-save | SCR-03, SCR-08 | `Alert.alert` (reused, no new modal) | Success | AC-FLASH-009+ | Mapped |
| FR-SRS-001/002/003 | — | Rating write | SCR-05 | New rating control (gap), `ErrorCard` (reused) | Normal/Error/Disabled | AC-SRS-* | Mapped |
| FR-REVIEW-001..003 | US-019 | Daily review session | SCR-05, SCR-07 | New rating control (gap) | Normal/Success/Other (capped) | AC-REV-001..006 | Mapped |
| FR-REVIEW-004 | US-019 | Empty states | SCR-06a, SCR-06b | `Medallion`, `AppText`, `AppButton` (reused) | Empty (×2, distinct) | AC-REV-007 | Mapped |
| FR-REVIEW-005 | US-020 | Due count | SCR-04 | `AppCard`, `AppText`, `MaterialIcon` (reused, no new component) | Normal | — | Mapped |
| CRIT-002 / E1 | — | Lesson delete guard | SCR-09 | `Alert.alert` (reused) | Normal (blocking) | — | Mapped |

## Design System Changes

**Tokens Modified:** None.

**New Components — finalized by Stage 6 ([VIB-131](mention://issue/58e3a917-c023-4347-93d5-648865def4d1) §1–§3), full prop specs in the attachment:**
- **`FlipCard`** — front/back reveal, controlled `flipped` prop (parent-owned, not internal state), no fixed height (responsive floor `minHeight: 220`). Used by SCR-03 and reused inside SCR-05.
- **`RatingControl`** — `onRate('remembered' | 'forgot')` + `onSkip()`, icon+label always paired (NFR-ACC-004), "Chưa nhớ" deliberately styled neutral not danger (it's an expected SRS outcome, not an error).
- **`Banner`** — resolved to a **new lightweight component**, not an `ErrorCard` variant: `ErrorCard`'s danger/coral styling would wrongly flag the capped-queue state as an error when it's expected and non-actionable. Used by SCR-05 (persistent) and SCR-07 (summary line).
- **2 new icons** (`check_circle`, `refresh`) — add to `HANDOFF_ICONS`, no aliases needed. Build step required after adding: `npm run icons:subset` then `npm run assets:link`.

**Everything else Stage 1 flagged as a possible gap turned out not to be one:** `WordCard` gets a prop addition (not a new component); SCR-08/SCR-09 reuse the existing native `Alert.alert` pattern already in `ProfileScreen.tsx`. Final gap list: 3 new components + 2 icons, down from an initial 4 open candidates.

**Component Modifications:** `WordCard.tsx` — add `saved?: boolean` + `onToggleSave?: () => void`.

**Engineering notes carried into handoff (Stage 6 §4, §6):**
- D6's first-save acknowledgement flag should follow `src/theme/themeStorage.ts`'s existing `AsyncStorage` + best-effort try/catch pattern (a single boolean flag, doesn't conflict with the "no AsyncStorage for saved lessons" rule, which targets SQLite-backed lesson data specifically).
- `RatingControl`'s 2-outcome shape (`'remembered' | 'forgot'`) needs confirming against the actual `review_schedule` migration before implementation (ties to DR-02 below).

## Handoff Artifacts

- [x] User flows (Mermaid diagrams) — Stage 3 (VIB-127)
- [x] Wireframes — Stage 4a (VIB-128)
- [ ] UI specifications — Stage 6 (VIB-131) delivered, **round 2 revision in progress** (Stage 7 findings H1/H2/M1/M2)
- [ ] HTML handoff files (with header: date, issue, "artifact trung gian") — same round-2 revision as above; L1 header already compliant, content needs H2/M1/M2 fixes
- [x] Content copy deck — Stage 4b (VIB-129)
- [x] Error message matrix — Stage 4b (VIB-129)
- [x] Motion specifications — Stage 6 (VIB-131), text-only per L3, unaffected by round 2 findings
- [x] Accessibility checklist — Stage 7 (VIB-132), round 1 delivered (0 Critical/2 High/2 Medium); round 2 re-check pending Stage 6 fixes
- [x] Review findings log — Stage 7 (VIB-132) §2–§4
- [ ] Traceability matrix
- [ ] Final synthesis document

## Completion Checklist

Per Design Team Completion Rule:

- [x] User flow passed Human Gate 1
- [x] Wireframes passed Human Gate 2 ([VIB-130](mention://issue/a56bcabd-503d-4766-8d8b-e1e599afb4d7), approved 2026-08-16)
- [ ] Every critical requirement and state represented in design or documented as non-visual
- [ ] No critical usability/accessibility/traceability issues remain unresolved
- [ ] All open risks and questions have owners
- [ ] Final handoff package passed Human Gate 3

---

**Note:** Stage 1 authored by Design Lead, 2026-08-16. Gate 1 ([VIB-126](mention://issue/6e4c65c6-2242-47e3-a7bb-3182a14147e9)) and Gate 2 ([VIB-130](mention://issue/a56bcabd-503d-4766-8d8b-e1e599afb4d7)) both approved with all stated defaults accepted. Stage 3 ([VIB-127](mention://issue/7e4baeed-e7cc-446d-aad1-59b865d6b981)), 4a/4b ([VIB-128](mention://issue/4faef63a-6c8a-45ac-b241-e6fdf85453a8)/[VIB-129](mention://issue/76b1d934-fac9-444c-b336-f5d8e2d42f89)), and Stage 6 round 1 ([VIB-131](mention://issue/58e3a917-c023-4347-93d5-648865def4d1)) all delivered.

**Stage 8 is still NOT promoted.** Stage 6's second round-2 attempt delivered a genuine revision (DR-10) — Design Lead independently verified the highest-risk fix (Dark-theme contrast) against the actual theme source and spot-checked the other 3. Sent to Stage 7 for a full round-2 re-review rather than skip straight to synthesis on a designer's self-report plus a partial spot-check. Stage 8 promotes once Stage 7 confirms round 2 passes.