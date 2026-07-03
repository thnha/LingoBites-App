# Tagged Task Prompt

Generic template. Replace `[ADD TAGS HERE]` with the tags for your task. See `rules/index.md` for available tags.

```txt
You must work with tag-based rules.

First, read:

rules/index.md

Then apply only the following rule tags:

[ADD TAGS HERE]

Task file:

docs/tasks/current-task.md

Rules:
- Only apply the rules listed above.
- Do not apply unrelated rules.
- If a required rule file is missing, stop and report it.
- If the task spec is unclear, document the assumption before coding.
- Do not refactor unrelated code.
- Do not mark the task complete until all active rules are satisfied.

After implementation, report:
1. Root cause, if this is a bug
2. Fix / implementation summary
3. Files changed
4. Tests / verification
5. Risks / review notes
```
