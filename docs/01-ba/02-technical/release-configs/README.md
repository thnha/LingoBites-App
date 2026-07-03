# Release Config Presets

JSON presets for **Layer B** release feature flags. Spec: `08-feature-registry-release-config.md`.

## Files

| File | When to use |
|---|---|
| `close-beta-1.json` | P0 / M5 closed beta — core loop only |
| `theme-release.json` | Ship theme switcher + variants |
| `mini-game-release.json` | Ship word-match game (+ review system) |
| `situation-learning-release.json` | Ship situation-based lesson generation |

## Validation

Before using in CI or app bootstrap, run dependency validation per
`08-feature-registry-release-config.md §3`. Invalid example:

```txt
wordMatchGame=true, lessonSave=false → ERROR
```

## Implementation status

Bundled copies live in `src/release/configs/`. `FeatureFlagProvider` loads presets via
`release-manifest.ts` and validates on startup.

When editing JSON here, **sync both locations** and run:

```bash
npm test -- --testPathPattern=validate-release-config
```

## Env vs release config

| Layer | Example | Purpose |
|---|---|---|
| Env (build) | `USE_MOCK_AI`, `API_BASE_URL` | Provider wiring |
| Release JSON | `miniGame`, `lessonSave` | User-visible modules |

Both must be consistent for a given deployment.
