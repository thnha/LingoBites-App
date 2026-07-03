# LingoBites — BA Documentation

## 1. Purpose

This directory is the primary BA documentation source for **LingoBites**. Documentation is organized by role so readers do not have to load the entire context at once.

The core loop must not be built differently:

```text
Scan/Input → Confirm Text → Generate Lesson → Learn → Save → Review
```

Do not load `90-archive/MASTER.md` for AI coding agents because it is a very long consolidated document.

**Ship / tiến độ:** [`00-ship-trackers/`](00-ship-trackers/) — hub mỏng theo product phase (`p0-ship-tracker.md`, …). Quy ước tài liệu: [`00-DOC-CONVENTION.md`](00-DOC-CONVENTION.md).

---

## 2. Quick reading by role

### Founder / Product Owner

| Read | Purpose |
|---|---|
| `04-product/01-product-brief.md` | Vision, problem, users |
| `04-product/04-phase0-prd.md` | Phase 0 PRD |
| `04-product/05-phase0-feature-scope.md` | MVP scope |
| `04-product/06-roadmap-release-plan.md` | Product phases P0–P3 + release configs |
| `02-technical/07-modular-architecture-and-release.md` | Module tracks, release strategy, folder target |
| `02-technical/08-feature-registry-release-config.md` | Feature flags, dependencies, QA matrix |
| `02-technical/09-phase-n-workflow-and-release-governance.md` | Standard workflow from idea to release for future phases/modules |
| `02-technical/10-ai-session-contract.md` | AI session boundaries — read every coding session |
| `02-technical/milestones/M?-brief.md` | Per-milestone in/out scope for AI |
| `02-technical/11-spec-change-protocol.md` | Order when spec/design changes |
| `DECISIONS.md` | Recent intentional changes — read before coding |
| `00-ship-trackers/p0-ship-tracker.md` | P0 milestone status, gaps, FR/release gates |
| `00-DOC-CONVENTION.md` | Naming, folders, kickoff P1/P2 — tránh lung tung |
| `08-operations/03-ai-key-strategy-byok-paid-managed.md` | AI cost reduction strategy and paid managed mode |
| `07-release/01-release-production-readiness.md` | Beta/public ship criteria |

### BA / PM

| Read | Purpose |
|---|---|
| `03-requirements/01-functional-requirements.md` | Product FRs |
| `03-requirements/02-business-rules.md` | Business rules |
| `03-requirements/03-user-stories-acceptance.md` | User stories + acceptance criteria |
| `03-requirements/05-traceability-matrix.md` | FR → US → TC → module |
| `08-operations/02-risks-assumptions-dependencies.md` | Risks, assumptions, dependencies |

### Developer / AI Coding Agent

Read only the critical path group first:

| Read | Purpose |
|---|---|
| `04-product/04-phase0-prd.md` | Phase 0 goals |
| `03-requirements/01-functional-requirements.md` | Features to build |
| `03-requirements/02-business-rules.md` | Rules that must not be violated |
| `05-qa/01-qa-test-plan.md` | Test gate |
| `02-technical/01-technical-implementation-spec.md` | Stack, API, persistence, env |
| `02-technical/02-implementation-plan-m1-m5.md` | Build order M0–M5 |
| `03-requirements/05-traceability-matrix.md` | Checklist to prevent shipping incomplete work |
| `01-schema/01-ai-output-v1.ts` | Canonical AI output schema |

Open additionally only when needed:

| When needed | Read more |
|---|---|
| Prompt/output quality | `02-technical/03-ai-output-requirements.md` |
| Real OCR/AI provider | `02-technical/04-ai-ocr-integration.md` |
| AI coding agent workflow | `02-technical/06-ai-agent-implementation-guide.md` |
| AI session guardrails | `02-technical/10-ai-session-contract.md`, `02-technical/milestones/M?-brief.md` |
| Spec change / anti-drift | `02-technical/11-spec-change-protocol.md`, `DECISIONS.md` |
| API backend (test, security, contract) | `02-technical/12-api-backend-development-rules.md` (LingoBites-Server repo) |
| Modular architecture / feature flags | `02-technical/07-modular-architecture-and-release.md`, `02-technical/08-feature-registry-release-config.md` |
| Future phase/module workflow | `02-technical/09-phase-n-workflow-and-release-governance.md` |
| Named release presets | `02-technical/release-configs/*.json` |
| BYOK / paid managed AI | `08-operations/03-ai-key-strategy-byok-paid-managed.md` |
| Security/key/data protection | `08-operations/04-security-key-and-data-protection.md` |
| Release/store/privacy | `07-release/*` |
| Public app setup: env/store/Firebase/services/accounts | `07-release/04-public-app-setup-checklist.md` |
| UI/theme work | `06-design/*` |

### QA

| Read | Purpose |
|---|---|
| `05-qa/01-qa-test-plan.md` | Test cases and strategy |
| `03-requirements/05-traceability-matrix.md` | FR/US/TC coverage |
| `07-release/01-release-production-readiness.md` | Release blockers/gates |
| `02-technical/01-technical-implementation-spec.md` | Integration/API behavior to test |

### Design / UX

| Read | Purpose |
|---|---|
| `04-product/02-personas-journey.md` | Personas and journey |
| `06-design/01-user-flow-screen-spec.md` | Navigation (3-tab P0), screens, canonical empty/error copy (§13) |
| `06-design/02-ui-wireframes.md` | Wireframes — single-scroll lesson result for P0 |
| `06-design/03-theme-system.md` | Theme system (M5 gate; M1–M3 temporary StyleSheet OK) |
| `07-release/03-store-listing-design-assets.md` | Store screenshots, visual direction, assets |

### Release / Ops / Privacy

| Read | Purpose |
|---|---|
| `07-release/01-release-production-readiness.md` | Release gate, blockers, cost/security readiness |
| `07-release/02-privacy-policy-draft.md` | Privacy policy draft |
| `07-release/03-store-listing-design-assets.md` | Store listing and assets |
| `07-release/04-public-app-setup-checklist.md` | Accounts, env, store, Firebase/services setup |
| `08-operations/01-analytics-kpi-events.md` | KPI/events |
| `08-operations/03-ai-key-strategy-byok-paid-managed.md` | AI key, quota, BYOK/paid managed |
| `08-operations/04-security-key-and-data-protection.md` | Security/key/data protection baseline |

---

## 3. Consistent feature roadmap

| Milestone | Main scope | Source documents |
|---|---|---|
| M0 | Project setup, mobile/API scaffold, env, fixtures | `02-technical/02-implementation-plan-m1-m5.md` |
| M1 | Paste text → mock AI fixture → validate schema → result screen | `02-technical/02-implementation-plan-m1-m5.md`, `01-schema/01-ai-output-v1.ts` |
| M2 | Fastify backend proxy + real AI + schema validation + retry invalid output | `02-technical/01-technical-implementation-spec.md`, `02-technical/03-ai-output-requirements.md` |
| M3 | Camera/gallery → OCR → review/edit confirmed text | `02-technical/04-ai-ocr-integration.md`, `03-requirements/02-business-rules.md` |
| M4 | Save/history/detail/delete local data, no AI recall for saved lesson | `02-technical/05-data-model.md`, `02-technical/01-technical-implementation-spec.md` |
| M5 | Analytics, loading/error/empty states, privacy note, cost guard, beta readiness | `08-operations/01-analytics-kpi-events.md`, `07-release/01-release-production-readiness.md` |
| Post Phase 0 | Account/sync, subscription, full BYOK rollout, advanced review/practice | `04-product/06-roadmap-release-plan.md`, `08-operations/03-ai-key-strategy-byok-paid-managed.md` |
| Release infra (M5+) | Feature registry, validate config, dynamic navigation | `02-technical/07-modular-architecture-and-release.md §14`, `02-technical/08-feature-registry-release-config.md` |
| Phase N workflow | Idea → requirements → technical design → feature flags → QA → release → rollback | `02-technical/09-phase-n-workflow-and-release-governance.md` |

The theme system is UI foundation/polish; it does not block the M1–M4 core loop if the current task is not theme-related.

**Terminology:** Product Phase (P0–P3) ≠ Module Track (MT-Core, MT-Theme, …) ≠ Milestone (M1–M5). See `02-technical/07-modular-architecture-and-release.md §2`.

---

## 4. Directories

| Folder | Role |
|---|---|
| `00-ship-trackers/` | Thin ship hubs per product phase (P0, P1, …) |
| `00-DOC-CONVENTION.md` | Doc naming and phase kickoff rules |
| `01-schema/` | Canonical machine-readable AI schema |
| `02-technical/` | Architecture, API, AI/OCR integration, implementation plan |
| `03-requirements/` | FR, BR, US/AC, NFR, traceability |
| `04-product/` | Product, business, roadmap, scope |
| `05-qa/` | QA strategy and test cases |
| `06-design/` | UX flow, screen spec, wireframes, theme |
| `07-release/` | Production readiness, privacy, store assets |
| `08-operations/` | Analytics, risk, AI key strategy |
| `90-archive/` | Generated/large reference docs, not for coding-agent context |

---

## 5. Source of truth

When documentation conflicts:

1. `01-schema/01-ai-output-v1.ts` for everything related to AI output.
2. `02-technical/01-technical-implementation-spec.md` for technical decisions.
3. `02-technical/02-implementation-plan-m1-m5.md` for implementation order.
4. `03-requirements/01-functional-requirements.md` + `03-requirements/02-business-rules.md` for product behavior.
5. `06-design/*` for UX/copy/wireframe when not conflicting with core rules.

---

## 6. Absolute rules

- Do not send raw OCR text to AI before the user confirms.
- `confirmed_text` is the source of truth for AI analysis and saved lessons.
- AI output must pass through `validateAIOutput()` before render or save.
- Reopening a saved lesson must not call AI again.
- Mobile must not contain system OCR/AI provider keys.
- Do not store original images by default.
- Do not log full scanned text, images, or full AI output.
- Do not build payment/gamification/sync before the core loop works.
