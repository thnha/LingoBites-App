# Feature Prompt

```txt
Apply these rules:

@feature
@safe-production
@impl-notes
@react-native-standard
@typescript-standard
@test-required
@pr-summary

Task:
Read docs/tasks/current-task.md and implement the feature.

Requirements:
- Read the full spec before coding.
- Implement the smallest complete version that satisfies acceptance criteria.
- Preserve existing behavior outside the feature scope.
- Handle loading, empty, error, and success states.
- Update a task-specific implementation note under docs/implementation-notes/.
- Run available tests/typecheck/lint if possible.
- If a check cannot be run, explain why.

Final output must include:
- Feature summary
- Acceptance criteria status
- Files changed
- Tests / evidence
- Risks / follow-ups
```
