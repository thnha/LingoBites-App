## Work

Wireframes + full state matrix + responsive rules for all screens in the P1 Flashcards/SRS/Daily Review inventory (parent issue [VIB-125](mention://issue/fa472275-4099-4dfe-a898-9dc298129bbf)).

## Blocked on

Stage 3 ([VIB-127](mention://issue/7e4baeed-e7cc-446d-aad1-59b865d6b981)) flows/IA must be `done`. Also needs Gate 1 D3 (SRS algorithm — rating control shape) and D4 (daily cap — capped-queue state) answers, since bare "Approve" would apply the stated defaults (fixed interval, soft cap) — confirm on VIB-125 clarification log before finalizing the rating control and queue-cap states.

## Reuse constraint

Reuse existing `src/components/` before proposing new ones (`WordCard`, `Chip`, `ListRow`, `LessonCard`, `QuizOption`, `SectionHeader`, `BottomActionBar` are known candidates per the BA input package). Flag genuine gaps (flip-card, rating control) for the Stage 6 gap list rather than designing them as bespoke one-offs now.

Runs in parallel with Stage 4b (Content Designer). Self-close to `done` when submitted.

## Carried forward from Stage 3 (VIB-127 §8) — do not silently resolve

- **DA-IA-01 (confirmed by Design Lead):** Flashcard List (SCR-02) entry point = new header action on `LessonsHistoryScreen`, same pattern as the existing `bookmark` `IconButton` on `WordDetailScreen`. Gate 1's D1–D4 only covered the Daily Review entry point, not this one — Design Lead confirms this placement now since it adds no nav-structure change and doesn't rise to a "critical product decision" requiring TranHoangNha. Wireframe on this basis.
- **Q-FLOW-03 (blocking SCR-09 wireframe):** pick one — SCR-09's "Xem flashcard" CTA opens a lesson-filtered flashcard list view, or deep-links into the lesson's vocabulary section highlighting saved items. Stage 3 intentionally left this for you to decide; don't invent silently, state which you picked and why.
- **Q-FLOW-01 (blocking state matrix):** finalize the exact carry-over state/wording for D4's soft cap ("N thẻ, còn lại M thẻ mai ôn tiếp" per VIB-127 §4.2) — coordinate with Stage 4b on final copy, but the state itself (visible banner on SCR-05/07) is yours to lock into the state matrix.
- **§4.4 navigation-stack decision:** Stage 3 proposed `navigation.replace` (not `.push`) for Session → Summary so back-navigation returns to Home, not a spent session. Confirm or override in your wireframe/flow notes.
- **RISK (rating-write failure, VIB-127 §4.2):** no Error state currently planned for a failed atomic rating transaction (FR-SRS-003 requires atomicity). Decide whether SCR-05 needs a non-blocking retry affordance for this case.
