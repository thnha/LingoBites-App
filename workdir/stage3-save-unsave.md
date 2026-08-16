## Goal

Enable users to save/unsave vocabulary as flashcards from Word Detail screen and vocabulary lists, with first-time disclosure and lesson deletion guard.

## Context

- **Depends on**: Stage 2 (data layer must be merged first)
- Reuses existing bookmark `IconButton` at `WordDetailScreen.tsx:34`
- Disclosure pattern follows `src/theme/themeStorage.ts` for persistence
- Lesson delete guard hooks into `SavedLessonDetailScreen.tsx:66`

## Tasks

**Required:**

1. Update `WordCard` component:
   - Add optional `saved?: boolean` prop
   - Add optional `onToggleSave?: () => void` callback
2. Wire bookmark `IconButton` in `WordDetailScreen.tsx:34`:
   - Connect to repository save/unsave methods
   - Update icon state based on saved status
3. Implement disclosure dialog (DR-04, D6):
   - Show blocking dialog with cancel button on **first save only**
   - Persist acknowledgement flag (follow pattern in `src/theme/themeStorage.ts`)
   - Never show again after acknowledgement
4. Implement lesson delete guard (SCR-09):
   - Hook into delete flow at `SavedLessonDetailScreen.tsx:66`
   - Block deletion if lesson has active flashcards
   - Show dialog with CTA linking to flashcard list filtered by that lesson
5. Wire feature flag `reviewSystem` to hide/show save UI
6. Add tests:
   - Save/unsave toggle updates state correctly
   - Disclosure shows once only
   - Delete guard blocks when flashcards exist
   - Delete guard allows when no flashcards

**NOT in scope:**
- Flashcard list screen (Stage 4)
- Daily review (Stage 5)
- Icon asset generation (do that in this stage: add `check_circle`, `refresh` to `HANDOFF_ICONS`, then run `npm run icons:subset` and `npm run assets:link`)

## Acceptance Criteria

- [ ] Bookmark icon in Word Detail toggles save state (persists after app restart)
- [ ] Saving vocabulary works from vocabulary list and detail screen
- [ ] Disclosure dialog shows exactly once on first save
- [ ] Lesson with active flashcards cannot be deleted (blocked by dialog)
- [ ] Delete guard dialog CTA opens flashcard list filtered to that lesson
- [ ] Feature flag `reviewSystem` controls visibility of save UI
- [ ] Tests pass for save/unsave, disclosure, and delete guard
- [ ] No regressions in existing lesson management

## Repository & Branch

- **Repo**: local_directory `/Users/nha-tran/Data/projects/LingoBites-App`
- **Base branch**: `main` (ensure Stage 2 is merged first)
- **PR target**: `main`
- **Create branch**: Sync `main` with `git pull --rebase` immediately before creating feature branch

## Files to Edit

Likely paths (verify before editing):
- `src/screens/WordDetailScreen.tsx` (~line 34)
- `src/screens/SavedLessonDetailScreen.tsx` (~line 66)
- `src/components/WordCard.tsx` (or similar)
- Storage/persistence layer (follow `src/theme/themeStorage.ts` pattern)

## Out of Scope

- Flashcard list UI
- FlipCard component
- Daily review session

## Estimated Effort

Medium (~2-3 hours)
