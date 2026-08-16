## Work

Content copy deck + error message matrix for P1 Flashcards/SRS/Daily Review screens (parent issue [VIB-125](mention://issue/fa472275-4099-4dfe-a898-9dc298129bbf)).

## Blocked on

Stage 3 ([VIB-127](mention://issue/7e4baeed-e7cc-446d-aad1-59b865d6b981)) flows/IA must be `done`.

## Notable copy requirements from the BA input package

- Two genuinely distinct empty-state messages for Daily Review — "never saved a flashcard yet" vs. "all done for today" (E4/AC-REV-007). Do not reuse one message for both.
- A-02 (limitation) requires explicit, user-facing copy communicating that P1 data is local-only — no backup/restore, lost on reinstall/device loss. Needs a home (onboarding and/or a settings note) — propose placement.
- If Gate 1 D2 defaults to block/RESTRICT, the lesson-delete guard needs clear, non-scary guidance copy (what to unsave, why).

Runs in parallel with Stage 4a (UI & Wireframe Designer). Self-close to `done` when submitted.

## Carried forward from Stage 3 (VIB-127 §8) — do not silently resolve

- **Q-FLOW-02:** BR-REVIEW-002's business-rule text says "Again → relearning," which is SM-2-flavored language, but Gate 1's D3 resolved to **fixed-interval** (a 2-outcome rate/skip control, not 4-level SM-2). Do not carry "Again" into rating-button copy — write copy for the actual 2-outcome interaction (e.g. "Nhớ" / "Chưa nhớ" or equivalent), not SM-2 terminology. This is a wording mismatch left over in the PRD from before D3 was decided, not a new requirement.
- **Q-FLOW-01:** final wording for the D4 soft-cap carry-over message ("N thẻ, còn lại M thẻ mai ôn tiếp" is Stage 3's placeholder, not final copy) — coordinate with Stage 4a on where it appears (banner on SCR-05/07).
- **A-02 local-only data-loss copy** (already listed above) should use plain, non-alarming language — this is a disclosure, not a warning that should scare users away from using the feature.
