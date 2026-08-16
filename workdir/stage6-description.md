## Work

UI spec, design-system gap list, HTML handoff, motion spec for P1 Flashcards/SRS/Daily Review — parent issue [VIB-125](mention://issue/fa472275-4099-4dfe-a898-9dc298129bbf).

## Blocked on

Human Gate 2 approval.

## Rules that apply here specifically

- **L1 (anti prototype-drift):** HTML handoff is a one-shot intermediate artifact for the coder, thrown away once screens are built in React Native. Do not maintain HTML and RN in parallel. Every HTML handoff file must open with: creation date, source issue, and the line "artifact trung gian — không maintain sau khi code xong."
- **L3 (motion is spec, not design):** motion output is text-only — trigger, duration, easing, animated property, reduce-motion behavior — sufficient for Reanimated implementation. Do not claim to have "designed motion."
- **Design-system gap list:** resolve the flip-card and rating-control candidates flagged at Stage 1 — confirm whether they're genuinely new components or extensions of `WordCard`/`QuizOption`.

Self-close to `done` when submitted.
