## Work

**Round 2 — revision requested by Stage 7's review.** UI spec, design-system gap list, HTML handoff, motion spec for P1 Flashcards/SRS/Daily Review — parent issue [VIB-125](mention://issue/fa472275-4099-4dfe-a898-9dc298129bbf).

## Why this is reopened

Stage 7 ([VIB-132](mention://issue/fa3e1b8d-340c-4e23-ae0e-8c0d5a73f8e8)) completed its WCAG-informed review: 0 Critical, 2 High, 2 Medium findings, with an explicit recommendation to **Revise before design approval**. Per the team's escalation rules (max 2 rounds of critique before escalating to TranHoangNha), this is round 1 feedback — fix these and resubmit, no escalation needed yet.

## Required fixes

### H1 — Dark theme "Chưa nhớ" contrast fails WCAG AA (2.82:1, needs ≥4.5:1)

`RatingControl`'s `surfaceHigh`/`primary` pairing passes in all 6 other shipped themes (5.23–6.73:1) but fails in Dark (2.82:1). Define a semantic token pair for the negative-rating state that passes in every theme — either a different Dark-specific foreground token, or a new semantic pair used consistently across all 7 themes. Recalculate and report contrast for all 7 themes after the fix (not just Dark).

### H2 — Capped-session progress counter contradicts the queue message

HTML handoff's SCR-05 capped-queue variant shows header "Thẻ 2/20" while the banner says 8 cards this session, 12 deferred. The denominator must be the **active session snapshot size** (8), never the total due-before-cap (20) — show "Thẻ 2/8". Add this as an explicit invariant in the UI spec so it can't regress: progress denominator = session snapshot size, always.

### M1 — FlipCard sizing inconsistent across HTML handoff states

Component spec (§2.1) says `minHeight: 220` content floor with intrinsic sizing, but the HTML handoff's screen-state examples use 220/200/160/140 — undocumented state-dependent shrinking. Use one consistent intrinsic/floor sizing rule across every state; don't encode state-specific fixed heights.

### M2 — Banner typography inconsistent between component spec and screen examples

Component spec (§2.3) specifies `AppText variant="label"` (14sp), but SCR-05/SCR-07 HTML examples use 12px. Standardize on the 14sp label token everywhere, allow wrapping without truncation.

## Not required this round (informational only, from Stage 7 §4)

Two `RISK`/`QUESTION` items — no explicit accessibility state/hint contract for flip announcements, and a human-testing checklist (VoiceOver/TalkBack, focus order, Dynamic Type) — don't need action in this HTML-handoff artifact; they're implementation-QA concerns already logged on the parent issue.

Self-close to `done` when resubmitted. Stage 7 will re-review before Stage 8 synthesis proceeds.
