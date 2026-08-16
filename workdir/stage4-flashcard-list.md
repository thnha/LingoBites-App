## Goal

Implement Flashcard List screen (SCR-02) with lesson filter variant, FlipCard component (SCR-03), and unsave confirmation (SCR-08). Support E2 edge case: differentiate identical words from different lessons.

## Context

- **Depends on**: Stage 2 (data layer)
- **Can run parallel with**: Stage 3, Stage 5 (after Stage 2 merges)
- Reuses existing components: `WordCard`, `ListRow`, `ErrorCard`, `Alert.alert`
- Creates 1 new component: `FlipCard`

## Tasks

**Required:**

1. Create `FlipCard` component (SCR-03):
   - `flipped` prop is **controlled** (parent manages state, not internal)
   - `minHeight: 220` in all states (flipped/unflipped)
   - Shows word on front, definition/example on back
   - Tap to flip (triggers parent callback to toggle state)
2. Implement Flashcard List screen (SCR-02):
   - Displays all saved flashcards
   - Supports filter by lesson (for E2 and delete guard CTA from Stage 3)
   - Differentiates same word from different lessons (E2 requirement)
   - Uses existing `ListRow` or `WordCard` for list items
   - Opens FlipCard view when item tapped
3. Implement unsave confirmation (SCR-08):
   - Use `Alert.alert` (do NOT create new modal component)
   - Confirm before removing flashcard
4. Wire feature flag `reviewSystem` to gate access
5. Add tests:
   - FlipCard toggles between front/back
   - List shows all flashcards
   - Filter by lesson works
   - Same word from 2 lessons appears as 2 separate items
   - Unsave confirmation works

**NOT in scope:**
- Daily review session (Stage 5)
- RatingControl, Banner (Stage 5)
- Home widget (Stage 5)

## Acceptance Criteria

- [ ] FlipCard component: controlled flip state, minHeight 220, tappable
- [ ] Flashcard List displays all saved cards
- [ ] Filter by lesson works (needed for delete guard CTA)
- [ ] Same word from different lessons shows as 2 distinct items (E2)
- [ ] Unsave uses `Alert.alert`, removes card on confirm
- [ ] Feature flag `reviewSystem` gates access
- [ ] Tests pass for FlipCard, list, filter, E2 edge case, unsave
- [ ] No regressions

## Repository & Branch

- **Repo**: local_directory `/Users/nha-tran/Data/projects/LingoBites-App`
- **Base branch**: `main` (ensure Stage 2 is merged first)
- **PR target**: `main`
- **Create branch**: Sync `main` with `git pull --rebase` immediately before creating feature branch

## Component Spec: FlipCard

**New component (1 of 3 total new components in this feature):**

```typescript
interface FlipCardProps {
  flipped: boolean;        // controlled prop
  onFlip: () => void;      // parent toggles state
  front: ReactNode;        // word
  back: ReactNode;         // definition/example
}
```

- `minHeight: 220` always
- Smooth flip animation
- No internal state for flip (parent controls)

## Reuse

- `WordCard` for list items (if suitable)
- `ListRow` for list structure
- `ErrorCard` for errors
- `Alert.alert` for unsave confirmation
- All existing typography, spacing, theming

## Out of Scope

- Daily review (Stage 5)
- New modal component (use Alert.alert)
- Rating/scheduling logic (Stage 2 handles this)

## Estimated Effort

Medium (~3-4 hours)
