# Documentation

This directory contains documentation for **LingoBites**.

## Structure

| Path | Purpose |
|---|---|
| `01_Product_Overview.md` | Short product overview |
| `01-ba/README.md` | Entry point for the BA set by role and milestone |
| `01-ba/01-schema/` | Canonical AI output schema and fixtures |
| `01-ba/02-technical/` | Technical spec, implementation plan, modular architecture, feature flags, AI/OCR |
| `01-ba/02-technical/release-configs/` | Named release presets (JSON) for feature-flag rollouts |
| `01-ba/03-requirements/` | FR, BR, user stories, NFR, traceability |
| `01-ba/04-product/` | Product, business, phase scope, roadmap |
| `01-ba/05-qa/` | QA plan |
| `01-ba/06-design/` | User flow, wireframes, theme system |
| `01-ba/07-release/` | Production readiness, privacy, store assets |
| `01-ba/08-operations/` | Analytics, risks, AI key/security strategy |
| `02-investor/` | Investor-facing overview, pitch outline, business model, GTM, FAQ |
| `03-operations/` | Cost estimate and operational notes outside BA |
| `superpowers/` | Supporting specs and implementation plans, not part of the main reading flow |

## How to read

Start with `01_Product_Overview.md` for context.

When implementing or reviewing requirements, read `01-ba/README.md` and choose a flow by role.

When preparing for beta/public app, read:

1. `01-ba/07-release/01-release-production-readiness.md`
2. `01-ba/07-release/04-public-app-setup-checklist.md`
3. `01-ba/08-operations/04-security-key-and-data-protection.md`

## Rules to avoid duplication

Overview files must stay short. Product requirements, business rules, schema, test cases, analytics events, release gates, and detailed implementation guidance live in `01-ba/`.
