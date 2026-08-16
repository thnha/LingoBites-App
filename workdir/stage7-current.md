## Work

Heuristic review, contrast check, accessibility checklist, issue log for P1 Flashcards/SRS/Daily Review — parent issue [VIB-125](mention://issue/fa472275-4099-4dfe-a898-9dc298129bbf).

## Blocked on

Stage 6 (UI spec + HTML handoff) must be `done` — **satisfied**, [VIB-131](mention://issue/58e3a917-c023-4347-93d5-648865def4d1) delivered `vib131-stage6-ui-spec.md` and `vib131-html-handoff.html`, self-closed 2026-08-16.

## What to review

Stage 6's 3 new components, spec'd with token references in `vib131-stage6-ui-spec.md` §2:
- `FlipCard` (§2.1) — front/back reveal, `minHeight: 220` floor, `Pressable` with `accessibilityRole="button"`.
- `RatingControl` (§2.2) — "Nhớ"/"Chưa nhớ" buttons + "Bỏ qua". Per this Stage's own brief, give NFR-ACC-004 specific scrutiny here: verify the spec's claim that icon+label pairing (not color alone) is "satisfied by construction," and independently check the contrast ratio of both button token pairs (`accent`/`accentInk` for "Nhớ"; `surfaceHigh`/`primary` for "Chưa nhớ") against the actual `default.ts` theme values, and ideally 1-2 other shipped themes (`dark`, `cartoon`, etc.) since this component must work across all 7.
- `Banner` (§2.3) — new component, not an `ErrorCard` variant; check its `tertiarySoft`/`onTertiaryContainer` contrast pairing too.
- Motion spec (§5) — every entry has a stated reduce-motion fallback; confirm none were missed.

Also check the HTML handoff (`vib131-html-handoff.html`) directly — it's the visual reference, not just the written spec.

## Rules that apply here specifically

- **L2 (call it a "WCAG-informed review," not a "WCAG audit"):** you can assert conclusions computable from tokens (contrast ratio, text size, touch target vs. spec). You cannot assert focus order, screen-reader behavior, or real-device behavior — those go in a `QUESTION` checklist for a human to verify on a simulator/device, not stated as fact.
- Pay specific attention to NFR-ACC-004 (rating buttons must be distinguishable by color AND label/icon, never color alone) and NFR-USE-004 (queue/list overload).
- Max 2 rounds of critique with the Stage 6 designer; unresolved usability/accessibility/scope conflicts escalate to TranHoangNha with documented rationale rather than looping indefinitely.

Self-close to `done` when submitted.
