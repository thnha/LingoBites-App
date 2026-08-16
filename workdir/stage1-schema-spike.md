## Goal

Verify DR-02 requirement from parent issue VIB-135: confirm that the `review_schedule` migration schema supports the 2-outcome rating shape (`'remembered' | 'forgot'`) required by the `RatingControl` component.

This is a **blocking prerequisite** for all data layer work. Stage 2 cannot start until this spike confirms the schema or identifies required adjustments.

## Context

- Recent migration fix at commit `6e1f830` corrected SQLite syntax
- The `RatingControl` component will use a 2-outcome rating system (not SM-2's 4 levels, per decision D3)
- Need to verify that existing migration tables (`flashcards`, `review_schedule`, `review_sessions`) support this shape

## Tasks

**Required:**

1. Read the current migration file(s) in the repo that define:
   - `flashcards` table structure
   - `review_schedule` table structure  
   - `review_sessions` table structure
2. Verify that the rating column (or equivalent) can store the 2-outcome values: `'remembered'` | `'forgot'`
3. Check SQLite column types and constraints are correct for the fixed-interval SRS algorithm
4. Document findings in a comment on this sub-issue with:
   - Exact file path(s) and line numbers
   - Current schema shape (column names, types, constraints)
   - Whether it supports 2-outcome rating (YES/NO)
   - Any required adjustments (if NO)

**NOT in scope:**
- Creating new migrations (that's Stage 2)
- Modifying existing code
- Implementing SRS logic

## Acceptance Criteria

- [ ] All 3 table schemas are read from actual migration files (not docs/memory)
- [ ] Rating column shape is confirmed to support `'remembered'` | `'forgot'` OR gaps are documented
- [ ] Findings posted as comment with file paths and line numbers as evidence
- [ ] Clear GO/NO-GO verdict for Stage 2 to proceed

## Repository & Branch

- **Repo**: local_directory `/Users/nha-tran/Data/projects/LingoBites-App`
- **Base branch**: `main`
- **PR target**: N/A (spike only, no code changes expected)

## Estimated Effort

Small (investigation only, ~30 minutes)
