## Work

UI spec, design-system gap list, HTML handoff, motion spec for P1 Flashcards/SRS/Daily Review — parent issue [VIB-125](mention://issue/fa472275-4099-4dfe-a898-9dc298129bbf).

## Blocked on

Human Gate 2 approval — **satisfied**, [VIB-130](mention://issue/a56bcabd-503d-4766-8d8b-e1e599afb4d7) approved 2026-08-16.

## Confirmed inputs from Gate 2 (VIB-130) and Stage 4a/4b — build the UI spec on this basis

- **D5**: SCR-05's `×` exit is a plain, no-confirmation exit (approved default). Don't add a confirm dialog.
- **D6**: first-save local-only-data disclosure is a **blocking** one-time dialog with "Đã hiểu"/"Huỷ lưu" (approved default). Needs a persisted local acknowledgement flag so it never re-shows after the first accept — call this out explicitly in the UI spec/handoff notes as an implementation requirement, not just a design decision.
- Design-system gap list is already narrowed by Stage 4a (VIB-128 §3) to: flip-card component, 2-outcome rating control ("Nhớ"/"Chưa nhớ" + "Bỏ qua"), 2 new icons (`check_circle`/`refresh` or equivalent, not yet in `src/components/icons/iconRegistry.ts`), and one open call — whether the capped-queue banner is a new `Banner` component or an `ErrorCard` variant. Confirm/finalize these rather than re-deriving from scratch.
- Final Vietnamese copy for every screen/state is in VIB-129's attachment (`vib129-stage4b-content-copy.md`) — use it verbatim in the HTML handoff, don't re-draft copy at this stage.

## Rules that apply here specifically

- **L1 (anti prototype-drift):** HTML handoff is a one-shot intermediate artifact for the coder, thrown away once screens are built in React Native. Do not maintain HTML and RN in parallel. Every HTML handoff file must open with: creation date, source issue, and the line "artifact trung gian — không maintain sau khi code xong."
- **L3 (motion is spec, not design):** motion output is text-only — trigger, duration, easing, animated property, reduce-motion behavior — sufficient for Reanimated implementation. Do not claim to have "designed motion."
- **Design-system gap list:** resolve the flip-card and rating-control candidates flagged at Stage 1 — confirm whether they're genuinely new components or extensions of `WordCard`/`QuizOption`.

Self-close to `done` when submitted.
