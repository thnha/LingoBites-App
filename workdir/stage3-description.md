## Work

Produce IA, task/user/screen flows, states, and exception/recovery paths for P1 Flashcards/SRS/Daily Review, building on the Stage 1 brief and Gate 1 approval on the parent issue [VIB-125](mention://issue/fa472275-4099-4dfe-a898-9dc298129bbf).

## Blocked on

Do not start until [VIB-126](mention://issue/6e4c65c6-2242-47e3-a7bb-3182a14147e9) (Gate 1) is approved. The entry-point flow specifically depends on Gate 1's D1 answer (default: Home widget). The lesson-delete exception flow depends on D2 (default: block/RESTRICT).

## Inputs

- Screen inventory, state matrix skeleton, clarification log, traceability skeleton on VIB-125.
- Edge cases E1–E7 from the BA input package (`design-team-input-package.md` §6, attached on [VIB-115](mention://issue/6edf1ca8-c90d-4dec-a9d9-57ab1811e412)).
- Gate 1 decisions (VIB-126) for entry point and delete-guard flow shape.

## Expected output

- Mermaid user/task flows covering: save flashcard, view/flip flashcard list, unsave/re-save, daily review session (including resume-after-crash per A-03, capped-queue per D4 once known), both empty states (E4), lesson-delete guard (if D2 = Option A).
- State inventory per screen (expands the Stage 1 skeleton).

Self-close to `done` when submitted; do not promote Stage 4 yourself — Design Lead promotes after reviewing.
