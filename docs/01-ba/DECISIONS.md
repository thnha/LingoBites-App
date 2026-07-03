# Decision Log

Short log of intentional spec/design changes. AI agents must read this file at session start
(after `AGENTS.md`) to avoid implementing against outdated assumptions.

Format: `11-spec-change-protocol.md §4`.

---

<!-- Add newest entries at the top -->

## 2026-06-06 — D-010

- **Change:** Enabled auto-generated API documentation using `@fastify/swagger`, `@fastify/swagger-ui`, and `fastify-type-provider-zod`, serving the interactive docs at `/docs`.
- **Reason:** The user requested API documentation for the staging environment. Tying OpenAPI specs directly to Zod validation schemas guarantees 100% accurate, drift-free API docs.
- **Canonical files:** `02-technical/12-api-backend-development-rules.md` (LingoBites-Server repo), `LingoBites-Server/src/server.ts`
- **Code impact:** Integrated swagger plugins in `buildServer`, registered Zod compilers, and updated route files to document health, OCR, and AI analysis routes.
- **Milestone:** M5 (Staging Polish)
- **Out of scope until:** Custom theme customization for Swagger UI, API authentication headers documentation (since app auth isn't built yet).

## 2026-06-06 — D-009

- **Change:** Backend deployment path now uses an explicit Docker image (`deploy/api/Dockerfile`) pushed to Artifact Registry, then Cloud Run deploys with `--image`; Cloud Run `--source .` is only a prototype fallback.
- **Reason:** The repository is a monorepo (`this repo`, `LingoBites-Server`), so explicit Docker builds are easier to reproduce, debug, and maintain across local, CI, staging, and production than buildpack/source detection.
- **Canonical files:** `07-release/05-backend-deploy-google-cloud-run.md`, `08-operations/06-backend-gcloud-setup-deploy-spec.md` (both LingoBites-Server repo), `08-operations/05-environment-git-deployment-workflow.md`
- **Code impact:** Future deployment setup should add/maintain `deploy/api/Dockerfile`, `.dockerignore`, Artifact Registry image naming, and GitHub Actions image build/push/deploy steps.
- **Milestone:** M2+ deployment and release operations
- **Out of scope until:** Immutable image promotion from staging to production by digest; advanced blue/green or canary automation.

## 2026-06-06 — D-008

- **Change:** Locked the baseline DevOps workflow: `develop` deploys to staging, `main` deploys to production, normal work goes through `feature/* -> develop -> main`, urgent fixes use `hotfix/* -> main -> develop`; staging and production use separate Google Cloud projects, Cloud Run services, secrets, budgets, and GitHub Environments.
- **Reason:** Keep the workflow simple for a small team while preserving staging verification, production approval, secret isolation, and cost controls.
- **Canonical files:** `08-operations/05-environment-git-deployment-workflow.md`, `08-operations/06-backend-gcloud-setup-deploy-spec.md`, `07-release/05-backend-deploy-google-cloud-run.md` (latter two: LingoBites-Server repo)
- **Code impact:** Future CI/CD workflows should map `develop` to `lingobites-api-staging` and `main` to `lingobites-api-production`; no current app code impact.
- **Milestone:** M2+ deployment and release operations
- **Out of scope until:** Advanced release promotion by immutable image digest, multi-region production, blue/green rollout automation.

## 2026-06-05 — D-007

- **Change:** Locked Q-010 for Phase 0 dev: real AI via `AI_PROVIDER=gemini` + default model `gemini-2.0-flash`; `openai` adapter also available (`gpt-4o-mini` default). Unified env `AI_API_KEY` + `AI_MODEL` on backend; prompt `lesson-analysis-v1` in `promptBuilder.ts`; retry attempt 2 uses repair suffix.
- **Reason:** Prototype validated Gemini path; M2 exit needs real provider without blocking on second vendor choice.
- **Canonical files:** `milestones/M2-brief.md`, `12-api-backend-development-rules.md` (LingoBites-Server repo), `03-ai-output-requirements.md`, `04-ai-ocr-integration.md`, `LingoBites-Server/.env.example`
- **Code impact:** `LingoBites-Server/src/providers/ai/openai.ts`, `gemini.ts`, `services/promptBuilder.ts`, `config/env.ts`
- **Milestone:** M2
- **Out of scope until:** Production model tuning, BYOK, managed-key billing (`08-operations/03-ai-key-strategy-byok-paid-managed.md`)

## 2026-06-05 — D-006

- **Change:** Locked app/brand name as `LingoBites`; clarified UI locale support for `en`/`vi` while keeping Phase 0 lesson content as English source with Vietnamese learning support unless schema/API changes.
- **Reason:** Align HTML handoff extraction and future implementation guardrails with product naming and multi-language app-shell requirement.
- **Canonical files:** `AGENTS.md`, `02-technical/10-ai-session-contract.md`, `06-design/01-user-flow-screen-spec.md`, `06-design/04-html-handoff-to-code-spec.md`
- **Code impact:** None yet (documentation only); future localization work must use stable string keys and include both `en` and `vi` values.
- **Milestone:** M1-M5 UI/app shell; localization infrastructure timing remains separate from AI schema.
- **Out of scope until:** Changing AI output language/target translation beyond current schema/API requires `11-spec-change-protocol.md`.

## 2026-06-05 — D-005

- **Change:** Added API backend development rules (`12-api-backend-development-rules.md` in LingoBites-Server repo, `.cursor/rules/api-backend.mdc`); aligned `LingoBites-Server` scaffold to canonical envelope (`request_id` + `status`), `MAX_TEXT_LENGTH=3000`, `providers/ai/`, retry service, integration tests.
- **Reason:** Test/security/contract rules existed only scattered in BA docs; API code used legacy `{ ok, error_code }` shape diverging from technical-spec §7.
- **Canonical files:** `12-api-backend-development-rules.md` (LingoBites-Server repo), `01-technical-implementation-spec.md` §15 (cross-ref), `milestones/M2-brief.md`, `11-spec-change-protocol.md`, `AGENTS.md`
- **Code impact:** `LingoBites-Server/src/routes/aiAnalysis.ts`, `providers/ai/*`, `services/aiAnalysisService.ts`, `types/apiEnvelope.ts`, `LingoBites-Server/test/*`, `.env.example`
- **Milestone:** M2 prep; security gates M5 unchanged.
- **Out of scope until:** Real OpenAI/Gemini adapters (Q-010), OCR routes (M3), rate limit prod (M5).

## 2026-06-05 — D-004

- **Change:** Chuẩn hóa ship tracker — `PHASE0-SHIP-TRACKER.md` → `00-ship-trackers/p0-ship-tracker.md`; thêm `00-DOC-CONVENTION.md`, stub `p1`/`p2` trackers.
- **Reason:** Tên/vị trí file không khớp quy ước folder; cần mở rộng P1/P2 mà không gộp spec lung tung.
- **Canonical files:** `00-DOC-CONVENTION.md`, `00-ship-trackers/*`, `README.md`, `AGENTS.md`
- **Code impact:** None (documentation only).
- **Milestone:** Cross-cutting.
- **Out of scope until:** Kickoff P1 — follow `00-DOC-CONVENTION.md` §6.

## 2026-06-05 — D-003

- **Change:** Clarified Phase 0 theme scope: registry/flag/persistence stay in scope; sellable/premium themes, entitlement, purchase stubs, account, and payment are Post-P0 only.
- **Reason:** Prevent theme work from violating the Phase 0 rule against building payment/account behavior before the core loop is complete.
- **Canonical files:** `06-design/03-theme-system.md`, `03-requirements/05-traceability-matrix.md`, `docs/superpowers/specs/2026-06-05-theme-driven-architecture-design.md`
- **Code impact:** None yet (documentation and scope guardrails only).
- **Milestone:** M5 / theme iteration; monetization is Post-P0.
- **Out of scope until:** Separate Phase N monetization/account spec is approved.

## 2026-06-05 — D-002

- **Change:** Locked Phase 0 UI design — 3-tab nav, single-scroll lesson result, native image picker, canonical empty states, theme timing M1–M3 vs M5.
- **Reason:** Remove ambiguity between wireframes, technical-spec, and implementation (hub vs scroll; 5 vs 3 tabs).
- **Canonical files:** `06-design/01-user-flow-screen-spec.md`, `06-design/02-ui-wireframes.md`, `01-technical-implementation-spec.md` §14, `AGENTS.md`, `05-traceability-matrix.md`
- **Code impact:** `LessonResultView` should follow single-scroll §14; no separate stack screens until post-P0.
- **Milestone:** M1–M4 layout; M5 theme gate unchanged.
- **Out of scope until:** Post-P0 — hub navigation, Vocabulary tab, flashcard save on vocab items.

## 2026-06-05 — D-001

- **Change:** Added AI session guardrails (session contract, milestone briefs, cursor rules).
- **Reason:** Reduce AI context overload, guessing, and spec drift.
- **Canonical files:** `02-technical/10-ai-session-contract.md`, `02-technical/11-spec-change-protocol.md`, `02-technical/milestones/*`, `.cursor/rules/*`, `AGENTS.md`
- **Code impact:** None (documentation and tooling only).
- **Milestone:** Cross-cutting.
- **Out of scope until:** N/A
