## Gate checkpoint

Approve wireframe business/usability fit for P1 Flashcards/SRS/Daily Review before Stage 6 (UI spec + HTML handoff + motion) invests in high-fidelity work. Full artifacts attached: `vib128-stage4a-wireframes.md` (wireframes, state matrix, responsive rules — 11 screens/states) and `vib129-stage4b-content-copy.md` (Vietnamese copy deck + error matrix). Both build on the approved Gate 1 defaults and Stage 3's IA/flows.

## What's in the artifacts, briefly

- All 11 screens/states from the Stage 3 inventory are wireframed with Normal/Loading/Empty/Error/Success/Disabled/Other states.
- Design-system gap list shrank from 4 candidates to 2 confirmed: a flip-card component and a 2-outcome rating control (plus 2 new icons and one banner-shape decision) — everything else reuses existing components (`WordCard`, `Alert.alert`, `ErrorCard`, `Medallion`, `AppCard`).
- Final Vietnamese copy for every screen/state, with terminology decisions (no stale "Again"/SM-2 language reached the UI), an error-message matrix, and a two-placement local-only-data disclosure (A-02).
- Every item Stage 3 flagged as "don't silently resolve" was resolved explicitly with rationale (SCR-09's CTA destination, capped-queue banner shape, nav-stack behavior, rating-write error handling).

## Decisions needed at this gate

Two items the designers themselves flagged as needing your confirmation rather than deciding on your behalf. Same format as Gate 1: each is a choice with a marked default — "Approve" with no further detail accepts both defaults.

### D5 — SCR-05 exit mid-session (the `×` button)

Stage 4a assumed this needs no confirmation dialog, since exiting isn't destructive (unrated cards simply keep their current `due_at`, same as Skip — no progress or data is lost).

- **Option A — No confirmation, exits immediately.** Matches Stage 4a's wireframe as submitted. Consistent with how the session snapshot is framed throughout — a working set, not a commitment device.
- **Option B — Confirm-to-exit if ≥1 card was already rated this session.** Adds friction but makes "you're leaving before finishing" explicit.
- **DEFAULT: Option A.** There's no data-loss consequence to warn about (unlike SCR-09's lesson-delete guard, which blocks an actually-destructive action) — a confirmation dialog here would be friction without a real risk behind it.

### D6 — First-save disclosure pattern (A-02 local-only data communication)

Stage 4b designed a one-time **blocking** dialog before the user's first flashcard save commits ("Flashcard được lưu trên thiết bị này" / "Đã hiểu" / "Huỷ lưu"), plus a persistent Settings note.

- **Option A — Blocking, with cancel** (as designed). User sees the local-only disclosure before their first save commits, can back out via "Huỷ lưu." Ensures informed consent happens before any local-only data exists, at the cost of one interruption the first time only.
- **Option B — Non-blocking.** Save proceeds immediately; disclosure appears as a one-time toast/banner after the first successful save, no cancel option. Zero interruption, but consent is after-the-fact.
- **DEFAULT: Option A.** A-02 explicitly calls for explicit, user-facing communication of a real limitation (no backup, data loss on reinstall) — a one-time proceed/cancel moment is proportionate to that, and only fires once ever.
- **Engineering note (not a design decision, flagging for handoff):** Option A requires persisting an acknowledgement flag locally so the dialog doesn't re-show on every save — carried into the Stage 6/8 handoff notes regardless of which option you pick.

## Informational only — not blocking this gate

- **Stale PRD wording:** the canonical `07-phase1-prd-draft.md` BR-REVIEW-002 still says "Again → relearning" (SM-2 language) even though Gate 1's D3 replaced that with fixed-interval. No UI string uses "Again" — this is resolved at the copy layer — but the PRD document itself wasn't corrected post-gate. Flagging since you're effectively the PRD's approver; Design can't edit it. No action needed for this gate to proceed.
- **Carry-over wording says "lần ôn sau" (next review), not "ngày mai" (tomorrow)** — deliberate, because the approved business rule doesn't guarantee next-day timing. If you want a firm "tomorrow" guarantee, that's a business-rule change (BR-REVIEW-003), not a copy change — flag separately if desired.

## Approval

- [ ] Wireframes (11 screens/states) reflect the intended structure and interactions
- [ ] State matrix and responsive rules look complete
- [ ] Content copy deck — terminology, tone, and error messages look right
- [ ] D5 exit-mid-session — approve default (no confirmation) or specify override
- [ ] D6 first-save disclosure — approve default (blocking, with cancel) or specify override

**Approve** (accepts both defaults above) — Design Lead promotes Stage 6 from `backlog` to `todo`.
**Reject** — name what needs to change; Design Lead sends back to Stage 4a/4b for a revision round.
