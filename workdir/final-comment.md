**Lane: Full** — confirmed independently (≥3 new screens, likely component gaps for flip-card/rating-control, touches all 3 personas). Details and rationale in the issue description.

Stage 1 complete: design brief, 9-screen inventory, state-matrix skeleton, clarification log, and traceability skeleton are filled into this issue's description, grounded against the actual input package ([VIB-115](mention://issue/6edf1ca8-c90d-4dec-a9d9-57ab1811e412) attachments) and the real codebase (`src/components/`, `src/app/navigation/AppNavigator.tsx` confirms the current 3-tab nav, `LessonRepository.ts:206` confirms `deleteLesson()` exists today).

**Gate 1** ([VIB-126](mention://issue/6e4c65c6-2242-47e3-a7bb-3182a14147e9)) already came back approved — TranHoangNha replied bare "Approve." Since every question was framed as a choice with a marked default (per this team's gate rules), that resolved cleanly instead of stalling like all 3 BA gates did:

- **Entry point → Home widget/card** (not a 4th tab, not buried in Lessons)
- **Lesson delete with active flashcards → block/RESTRICT** (guard screen SCR-09 is in scope)
- **SRS algorithm → fixed interval** (rate/skip control, not 4-level SM-2)
- **Daily queue cap → soft cap with carry-over** ("N left, continue tomorrow" state needed)

Stage 3 ([VIB-127](mention://issue/7e4baeed-e7cc-446d-aad1-59b865d6b981), IA/flows) is promoted to `todo` for the UX Flow & IA Designer. Stages 4a/4b, Gate 2, Stage 6, Stage 7, Stage 8, and Gate 3 are created as `backlog` sub-issues (VIB-128 through VIB-134) and will be promoted in order as each stage completes.
