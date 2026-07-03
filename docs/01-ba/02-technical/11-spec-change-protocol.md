# Spec Change Protocol

## 1. Purpose

When requirements, schema, API, or design change, this order prevents code and documentation from
diverging across sessions.

---

## 2. Mandatory order

```text
1. Update canonical source document(s)
2. Update fixtures and tests
3. Update implementation code
4. Update traceability matrix Status
5. Append entry to docs/01-ba/DECISIONS.md
```

**Forbidden:** change code first and “update docs later”.

---

## 3. Which file is canonical for what

| Change type | Canonical file(s) first |
|---|---|
| AI output field add/rename/remove | `01-schema/01-ai-output-v1.ts` |
| API request/response shape | `02-technical/01-technical-implementation-spec.md` |
| API test/security/contract rules | `02-technical/12-api-backend-development-rules.md` (LingoBites-Server repo) |
| New FR or rule | `03-requirements/01-functional-requirements.md` and/or `02-business-rules.md` |
| Milestone scope shift | `02-implementation-plan-m1-m5.md` + affected milestone brief |
| UI section order / empty states | `01-technical-implementation-spec.md §14` or `06-design/*` |
| Post-P0 module | `08-feature-registry-release-config.md` + release config JSON |
| Theme token | `06-design/03-theme-system.md` |

After editing `01-ai-output-v1.ts`, sync copies under:

- `src/shared/schemas/ai-output-v1.ts`
- `LingoBites-Server/src/schemas/ai-output-v1.ts`

---

## 4. DECISIONS.md entry template

```markdown
## YYYY-MM-DD — D-NNN
- **Change:** one sentence
- **Reason:** why
- **Canonical files:** list paths
- **Code impact:** modules/routes affected
- **Milestone:** M? (or post-P0)
- **Out of scope until:** …
```

---

## 5. Agent behavior on user change requests

1. Identify change type (schema / API / FR / UI / milestone).
2. Propose canonical file edits **before** code edits.
3. If change crosses milestones → confirm with user which milestone owns the work.
4. Never add “temporary” fields only in app code.

---

## 6. Drift detection checklist

Before closing a change session, verify:

- [ ] Fixtures in `01-schema/fixtures/` still pass `validateAIOutput()`
- [ ] Mobile and API schema files match canonical `01-ai-output-v1.ts`
- [ ] Traceability matrix reflects new/changed FRs
- [ ] `DECISIONS.md` has an entry
- [ ] Active milestone brief still accurate (update if scope moved)
