## Gate checkpoint

Approve the **high-level user flow and screen inventory** for P1 Flashcards/SRS/Daily Review before Stage 3 (UX Flow & IA Designer) begins detailed IA and flow work. Full Stage 1 content — lane rationale, screen inventory, state matrix skeleton, clarification log, traceability skeleton — is on the parent issue [VIB-125](mention://issue/fa472275-4099-4dfe-a898-9dc298129bbf).

## Why this gate exists before Stage 3 (not after)

Per the Full Lane stage table, Gate 1 sits before Stage 3 IA work is invested — so the flow shape and entry point get approved before detailed flows are built on top of them, not after.

## High-level flow (Gate 1 level of detail)

```text
User opens a lesson (result or saved) → Vocabulary section
  → taps "Save flashcard" on a VocabularyItem
  → flashcard created (idempotent if already saved), due immediately
  → [later] user reaches Daily Review via <ENTRY POINT — Q-DESIGN-01>
  → app builds a fixed snapshot of due cards for this session
  → user flips each card, rates or skips
  → schedule updates; card doesn't repeat within this session
  → when snapshot fully processed → session summary shown
```

Two branch points not yet drawn because they depend on decisions below: entry-point navigation (Q-DESIGN-01) and the "lesson has active flashcards, user tries to delete it" exception path (Q-DESIGN-02).

## Decisions needed at this gate

Each item below is a **choice with a default marked**. Per this team's gate rules, replying "Approve" with no further detail means **accepting every default as-is**. If you want something other than the default, say which item and which option.

### D1 — Daily Review entry point (Q-DESIGN-01) — BLOCKING for Stage 3

This is the one PRD left genuinely unresolved through all 3 BA gates (VIB-116/123/124 were all approved as bare "Approve"). Current nav is 3 tabs `Home | Lessons | Profile` (confirmed in `src/app/navigation/AppNavigator.tsx` — no 4th tab exists today). Per the original BA issue's constraint, adding a 4th tab is a navigation-structure change and must be an explicit product decision, not something Design or BA pick on your behalf.

- **Option A — Home widget/card** (e.g. "N cards due today" card near the top of Home, tappable into the review session). Cheapest to reach, but competes for Home's limited space (already houses the scan/save entry points) and moves further away as Home's content grows in later phases.
- **Option B — Sub-item inside Lessons tab** (e.g. a "Review" row/section at the top of the Lessons list). No nav restructure, keeps review adjacent to saved content, but is one tap deeper and less visible for a daily-habit feature.
- **Option C — 4th tab** (`Home | Lessons | Review | Profile` or similar). Most visible/habit-forming for a daily feature, but changes the P0 3-tab structure everywhere (tab bar component, any place that assumes 3 tabs) — real cost, not just a layout tweak.
- **DEFAULT (Design Lead recommendation): Option A (Home widget).** Daily Review is meant to be a lightweight daily touchpoint, not a primary destination — a tab implies permanence P1's scope doesn't yet justify, and Option B under-serves the "daily habit" goal from the PRD's retention objective (§2). Option A can be promoted to a tab later (P1-next) once usage data justifies it, without having shipped and then had to remove a tab.

### D2 — Lesson delete with active flashcards (Q-DESIGN-02 / inherited CRIT-002)

`deleteLesson()` already exists in `LessonRepository.ts:206` today with no flashcard-awareness — this is a real gap, not a hypothetical.

- **Option A — Block delete (`ON DELETE RESTRICT`)**, require unsaving all flashcards from that lesson first. Needs SCR-09 (blocking dialog/guidance screen).
- **Option B — Cascade delete** flashcards + their review history when the lesson is deleted. No new screen; silent data loss risk for a card the user actively reviews.
- **Option C — Snapshot** minimal content into the flashcard so it survives lesson deletion (card becomes independent of the lesson). Violates the PRD's "no parallel vocab store" principle (§4.2) unless explicitly excepted.
- **DEFAULT (BA's own technical analysts leaned here too): Option A.** Blocking is the safest default for a P1 slice — it avoids silent loss of review history and avoids a principle exception. Not blocking for Stage 3 to start on other screens, but needed before Stage 3 finalizes IA for the lesson-detail exception path, and before Stage 4a can decide if SCR-09 exists.

### D3 — SRS algorithm shape (Q-DESIGN-03 / inherited §9.2 Q1)

Only affects the **rating control's shape** on the Daily Review Session screen, not the overall flow.

- **Option 1 — SM-2 (4 levels: Again/Hard/Good/Easy).** Best personalization, most complex control (4 buttons, accessible labels per NFR-ACC-004), highest test/migration cost.
- **Option 2 — Leitner box.** Simpler, still multi-level.
- **Option 3 — Fixed interval.** Simplest — closest to what the issue's own wording ("SRS cơ bản") implies.
- **DEFAULT: Option 3 (Fixed interval).** Matches the "cơ bản" (basic) framing in the original scope and keeps the rating control to the minimum viable shape (e.g. rate/skip) for a P1 slice. Technical & Risk Analyst on the BA side explicitly declined to default to Option 1 themselves — escalating that same caution here.
- Not blocking Gate 1 — needed before Stage 4a wireframes.

### D4 — Daily queue cap (Q-DESIGN-04 / inherited §9.3 MED-006)

- **Option 1 — No cap**, full overdue backlog shown in one queue.
- **Option 2 — Soft cap of N cards/session**, oldest-due-first, carry over the rest with a "N left, continue tomorrow" indicator.
- **DEFAULT: Option 2 (soft cap).** Directly serves NFR-USE-004 (avoid overload) which the PRD explicitly calls out for this exact edge case (E3, queue buildup after inactivity). Uncapped risks a wall of cards on first return after days away, which undercuts the "review, not another chore" positioning.
- Not blocking Gate 1 — needed before Stage 4a state matrix (determines whether the capped/continue-tomorrow state exists on SCR-05/07).

## Approval

- [ ] High-level flow above reflects the intended product behavior
- [ ] Screen inventory (parent issue) — 9 screens/states, 1 conditional on D2 — looks right
- [ ] D1 entry point — approve default (Home widget) or specify override
- [ ] D2 lesson-delete guard — approve default (block/RESTRICT) or specify override
- [ ] D3 SRS algorithm — approve default (fixed interval) or specify override
- [ ] D4 daily cap — approve default (soft cap) or specify override

**Approve** (accepts all 4 defaults above) — Design Lead promotes Stage 3 from `backlog` to `todo`.
**Reject** — name which D-item and what you want instead; Design Lead updates Stage 1 on the parent issue and re-submits this gate.
