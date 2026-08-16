## Goal

Implement the complete SRS data layer: database migrations for the 3 tables (`flashcards`, `review_schedule`, `review_sessions`), fixed-interval scheduling algorithm, repository/store pattern, and feature flag `reviewSystem`.

This provides the foundation for all UI work in Stages 3-5.

## Context

- **Depends on**: Stage 1 spike confirmation (DR-02 verified)
- **Algorithm**: Fixed-interval SRS with 2-outcome rating (`'remembered'` | `'forgot'`), NOT SM-2 (per decision D3)
- **Soft cap + carry-over**: Daily queue has a cap but unreviewed cards carry to next day (per decision D4)
- All data is **local SQLite only** — no API, no server sync

## Tasks

**Required:**

1. Create/update migrations for 3 tables:
   - `flashcards`: stores saved vocabulary with lesson reference
   - `review_schedule`: tracks next review date per card, interval state
   - `review_sessions`: logs review history (card, rating, timestamp)
2. Implement fixed-interval scheduler:
   - 2-outcome rating: 'remembered' → increase interval, 'forgot' → reset/shorten
   - Soft cap logic with carry-over for daily queue
   - Query for due cards
3. Create repository/store pattern:
   - Save/unsave flashcard
   - Record rating
   - Get due cards for today (respecting soft cap)
   - Get all flashcards (with lesson filter support)
4. Add feature flag `reviewSystem` (follow existing pattern in `src/theme/themeStorage.ts` or equivalent)
5. Write unit tests for:
   - Interval calculation logic (both outcomes)
   - Soft cap + carry-over behavior
   - Repository methods

**NOT in scope:**
- UI components (Stages 3-5)
- Icon assets (handled in Stage 3)
- Accessibility testing (Stage 6)

## Acceptance Criteria

- [ ] Migrations run successfully on fresh SQLite database
- [ ] Fixed-interval algorithm increases interval on 'remembered', resets on 'forgot'
- [ ] Soft cap respected: due queue stops at cap, overflow carries to next day
- [ ] Repository methods work: save, unsave, record rating, query due cards, query all cards
- [ ] Feature flag `reviewSystem` can be toggled to enable/disable the feature
- [ ] Unit tests pass with >80% coverage on scheduler and repository
- [ ] Test suite remains green (no regressions)

## Repository & Branch

- **Repo**: local_directory `/Users/nha-tran/Data/projects/LingoBites-App`
- **Base branch**: `main`
- **PR target**: `main`
- **Create branch**: Sync `main` with `git pull --rebase` immediately before creating feature branch

## Out of Scope

- Server-side API changes
- Cloud sync
- SM-2 algorithm (rejected per D3)
- UI implementation

## Estimated Effort

Large (full data layer, ~4-6 hours)
