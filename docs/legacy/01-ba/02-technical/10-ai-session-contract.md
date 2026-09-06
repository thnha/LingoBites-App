# AI Session Contract — Phase 0

## 1. Purpose

This contract prevents AI coding agents from guessing, scope-creeping, or drifting when context is
overloaded. **No implementation work starts until this contract is filled for the session.**

Full milestone detail lives in `02-implementation-plan-m1-m5.md`. This file defines **session boundaries only**.

---

## 2. Session preamble (required)

Before writing or editing code, the agent must state:

```text
Milestone: M?
Canonical reads: (max 7 files, list paths)
Allowed write paths: (from milestone brief allowlist)
Out of scope this session: (from milestone brief)
Open questions: (empty = proceed)
```

If any item is unknown → **STOP and ask the user**. Do not assume.

---

## 3. Canonical source priority

When documents conflict, use this order (do not invent a fourth source):

| Priority | Source | Use for |
|---|---|---|
| 1 | `01-schema/01-ai-output-v1.ts` | AI output fields, validation |
| 2 | `02-technical/01-technical-implementation-spec.md` | Stack, API, persistence, env |
| 3 | `03-requirements/01-functional-requirements.md` + `02-business-rules.md` | Product behavior |
| 4 | `06-design/*` | UX copy, wireframes, theme |

**Never load** `90-archive/MASTER.md` — outdated merged copy, causes overload and drift.

Recent intentional changes: read `docs/01-ba/DECISIONS.md` first.

---

## 4. STOP rules (must ask user)

| Trigger | Action |
|---|---|
| Field/type not in `01-ai-output-v1.ts` | STOP — do not add to app-only types |
| API route not in technical-spec or current milestone brief | STOP |
| Work belongs to a later milestone (e.g. OCR in M1) | STOP |
| FR vs design doc conflict | STOP — cite both files |
| Post-P0 feature without feature flag + registry entry | STOP |
| Missing theme token | STOP — extend `AppTheme` for all themes, or ask |
| User asks to change schema/flow | STOP — follow `11-spec-change-protocol.md` first |

---

## 5. During implementation

- Import/copy schema from `01-ai-output-v1.ts`; do not re-describe fields in new interfaces.
- `confirmed_text` is the only text sent to AI after user confirms (M3+).
- Call `validateAIOutput()` before render or save.
- Every new screen/flow: loading + error + empty state.
- User-facing UI text: locale-aware for `en`/`vi` when localization exists; otherwise Vietnamese learner-facing copy during M1-M3.
- Do not log full text, images, or raw AI output.

---

## 6. Session close (required)

Before marking work done:

1. Run the **test gate** from the active milestone brief.
2. Update `03-requirements/05-traceability-matrix.md` Status for touched FRs.
3. If spec/design changed → update canonical doc + `DECISIONS.md` per `11-spec-change-protocol.md`.
4. List what remains **out of scope** for the next session.

A task is **not done** if only code changed but traceability or canonical docs were skipped.

---

## 7. Context budget

| Load | Do not load in same session |
|---|---|
| Active milestone brief (`milestones/M?-brief.md`) | Other milestone briefs |
| `01-ai-output-v1.ts` + relevant fixtures | Full `01-functional-requirements.md` (71 FR) |
| Technical-spec sections cited in brief | Entire 900-line technical-spec |
| QA cases for current milestone only | Full QA plan unless M5 |

---

## 8. Quick links

| Milestone | Brief |
|---|---|
| M0 | `milestones/M0-brief.md` |
| M1 | `milestones/M1-brief.md` |
| M2 | `milestones/M2-brief.md` |
| M3 | `milestones/M3-brief.md` |
| M4 | `milestones/M4-brief.md` |
| M5 | `milestones/M5-brief.md` |

Spec changes: `11-spec-change-protocol.md` · Decision log: `../DECISIONS.md`
