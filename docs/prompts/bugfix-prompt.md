# Bugfix Production Prompt

```txt
Apply these rules:

@bugfix
@safe-production
@impl-notes
@react-native-standard
@test-required
@no-unrelated-change
@evidence-required
@pr-summary

Task:
Read docs/tasks/current-task.md and implement the fix.

Requirements:
- Find the root cause before changing code.
- Make the smallest safe change.
- Preserve existing behavior outside the bug scope.
- Update a task-specific implementation note under docs/implementation-notes/.
- Run available tests/typecheck/lint if possible.
- If a check cannot be run, explain why.

Final output must include:
- Root cause
- Fix summary
- Files changed
- Tests / evidence
- Risks / reviewer notes
```
