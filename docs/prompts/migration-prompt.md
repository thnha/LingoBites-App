# Migration Prompt

```txt
Apply these rules:

@migration
@safe-production
@impl-notes
@react-native-standard
@typescript-standard
@test-required
@architecture-review
@pr-summary

Task:
Read docs/tasks/current-task.md and execute the migration.

Requirements:
- Migrate incrementally.
- Preserve existing UI and behavior unless the spec says otherwise.
- Document old path, new path, and behavior parity checks.
- Keep old and new paths compatible during transition when needed.
- Update a task-specific implementation note under docs/implementation-notes/.
- Run available tests/typecheck/lint if possible.
- If a check cannot be run, explain why.

Final output must include:
- Migrated scope
- Old files/modules affected
- New files/modules created
- Behavior parity check
- Rollback risk
```
