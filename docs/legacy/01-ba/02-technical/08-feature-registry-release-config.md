# Feature Registry, Dependencies & Release Config

## 1. Purpose

Operational spec for **Layer B release feature flags** (module visibility). Implements the rules in
`07-modular-architecture-and-release.md`.

Use this document when:

- Adding a new feature module post-P0.
- Creating or validating a release config.
- Wiring navigation, tabs, or backend route guards.
- Writing QA test matrix for flag combinations.

**Not in scope here:** provider env flags (`USE_MOCK_AI`, etc.) — see `01-technical-implementation-spec.md §11`.

---

## 2. Feature registry

Single source of declared modules. Implementation:

```txt
src/release/feature-registry.ts
```

### Registry entries

| key | module path | required | releaseGroup | productPhase |
|---|---|---|---|---|
| `pasteTextInput` | `modules/input` | yes | foundation | P0 |
| `imageInput` | `modules/input` | yes | foundation | P0 |
| `ocrScanner` | `modules/ocr` | yes | foundation | P0 |
| `ocrReviewEdit` | `modules/ocr` | yes | foundation | P0 |
| `aiLessonAnalysis` | `modules/ai-analysis` | yes | foundation | P0 |
| `lessonResultView` | `modules/lesson` | yes | foundation | P0 |
| `lessonSave` | `modules/lesson` | yes | foundation | P0 |
| `lessonHistory` | `modules/lesson` | yes | foundation | P0 |
| `shortPractice` | `modules/practice` | no | foundation | P0 |
| `pronunciationSupport` | `modules/pronunciation` | no | foundation | P0 |
| `themeSystem` | `theme` | no | ui | cross-cutting |
| `themeSwitcher` | `theme` | no | ui | cross-cutting |
| `darkTheme` | `theme` | no | ui | cross-cutting |
| `pastelKidsTheme` | `theme` | no | ui | cross-cutting |
| `reviewSystem` | `features/lesson-review` | no | practice | P1 |
| `miniGame` | `features/mini-games` | no | practice | P1 |
| `wordMatchGame` | `features/mini-games/word-match` | no | practice | P1 |
| `fillBlankGame` | `features/mini-games/fill-blank` | no | practice | P1 |
| `tenseQuizGame` | `features/mini-games/tense-quiz` | no | practice | P1 |
| `sentenceOrderGame` | `features/mini-games/sentence-order` | no | practice | P1 |
| `flashcardChallenge` | `features/mini-games/flashcard-challenge` | no | practice | P1 |
| `situationLearning` | `features/situation-learning` | no | expansion | future |
| `dialogueGenerator` | `features/situation-learning` | no | expansion | future |
| `phraseExtractor` | `features/situation-learning` | no | expansion | future |
| `situationPractice` | `features/situation-learning` | no | expansion | future |

### TypeScript reference (spec)

```ts
export type FeatureReleaseGroup =
  | 'foundation'
  | 'ui'
  | 'practice'
  | 'expansion';

export type FeatureRegistryEntry = {
  key: string;
  module: string;
  required: boolean;
  releaseGroup: FeatureReleaseGroup;
  description?: string;
};

export const featureRegistry: FeatureRegistryEntry[] = [
  {
    key: 'pasteTextInput',
    module: 'modules/input',
    required: true,
    releaseGroup: 'foundation',
  },
  {
    key: 'aiLessonAnalysis',
    module: 'modules/ai-analysis',
    required: true,
    releaseGroup: 'foundation',
  },
  {
    key: 'lessonSave',
    module: 'modules/lesson',
    required: true,
    releaseGroup: 'foundation',
  },
  {
    key: 'themeSystem',
    module: 'theme',
    required: false,
    releaseGroup: 'ui',
  },
  {
    key: 'miniGame',
    module: 'features/mini-games',
    required: false,
    releaseGroup: 'practice',
  },
  {
    key: 'situationLearning',
    module: 'features/situation-learning',
    required: false,
    releaseGroup: 'expansion',
  },
  // ... full list maintained in code when scaffolded
];
```

---

## 3. Feature dependencies

File (when scaffolded): `src/release/feature-dependencies.ts`

```ts
export const featureDependencies: Record<string, string[]> = {
  // MT-Core
  pasteTextInput: [],
  imageInput: [],
  ocrScanner: ['imageInput'],
  ocrReviewEdit: ['ocrScanner'],
  aiLessonAnalysis: ['pasteTextInput'], // or ocrReviewEdit when from image
  lessonResultView: ['aiLessonAnalysis'],
  lessonSave: ['lessonResultView'],
  lessonHistory: ['lessonSave'],
  shortPractice: ['lessonResultView'],
  pronunciationSupport: ['lessonResultView'],

  // MT-Theme
  themeSystem: [],
  themeSwitcher: ['themeSystem'],
  darkTheme: ['themeSystem'],
  pastelKidsTheme: ['themeSystem'],

  // MT-Practice
  reviewSystem: ['lessonSave'],
  miniGame: ['lessonSave', 'reviewSystem'],
  wordMatchGame: ['miniGame', 'lessonSave'],
  fillBlankGame: ['miniGame', 'lessonSave'],
  tenseQuizGame: ['miniGame', 'lessonSave'],
  sentenceOrderGame: ['miniGame', 'lessonSave'],
  flashcardChallenge: ['miniGame', 'reviewSystem'],

  // MT-Situation
  situationLearning: ['aiLessonAnalysis', 'lessonSave'],
  dialogueGenerator: ['situationLearning'],
  phraseExtractor: ['situationLearning'],
  situationPractice: ['situationLearning', 'reviewSystem'],
};
```

### Validation rules

1. Every `true` flag must have all dependencies also `true`.
2. All `required: true` registry entries must be `true` in every production release.
3. Unknown keys in release JSON → build/CI error.
4. Circular dependencies → build/CI error.

### Validator (spec)

```ts
// src/release/validate-release-config.ts

export type ReleaseConfig = {
  releaseName: string;
  features: Record<string, boolean>;
};

export function validateReleaseConfig(
  config: ReleaseConfig,
  registry: FeatureRegistryEntry[],
  dependencies: Record<string, string[]>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const enabled = config.features;

  for (const entry of registry) {
    if (entry.required && !enabled[entry.key]) {
      errors.push(`Required feature "${entry.key}" must be enabled.`);
    }
  }

  for (const [key, isOn] of Object.entries(enabled)) {
    if (!isOn) continue;
    const deps = dependencies[key] ?? [];
    for (const dep of deps) {
      if (!enabled[dep]) {
        errors.push(
          `Invalid release config: "${key}" requires "${dep}" to be enabled.`,
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
```

---

## 4. Release config files

Presets live in:

```txt
docs/01-ba/02-technical/release-configs/
```

At implementation time, copy or symlink to:

```txt
src/release/configs/
```

| File | Purpose |
|---|---|
| `close-beta-1.json` | P0 / M5 closed beta — MT-Core only |
| `theme-release.json` | MT-Core + MT-Theme |
| `mini-game-release.json` | MT-Core + theme + word match game |
| `situation-learning-release.json` | MT-Core + situation module |
| `production.json` | Current production flag set (maintained by release owner) |

Load order at app bootstrap:

```txt
1. Read bundled default release config (build-time or assets).
2. Optional: override via remote config (Firebase Remote Config — see 07-release/04-public-app-setup-checklist.md).
3. validateReleaseConfig() before registering routes.
4. Expose isFeatureEnabled(key) via React context or Zustand store.
```

---

## 5. Per-module `feature.config.ts`

Every feature module (post-P0) includes:

```txt
features/<name>/feature.config.ts
```

Example:

```ts
import type { FeatureRegistryEntry } from '../../release/feature-registry';

export const featureConfig: FeatureRegistryEntry[] = [
  {
    key: 'wordMatchGame',
    module: 'features/mini-games/word-match',
    required: false,
    releaseGroup: 'practice',
    description: 'Match English word to Vietnamese meaning from saved lessons',
  },
];

export const featureDependencies: Record<string, string[]> = {
  wordMatchGame: ['miniGame', 'lessonSave'],
};
```

Module `index.ts` exports screens/services only; navigation registration happens in
`app/navigation/registerFeatureRoutes.ts` using registry.

---

## 6. Navigation by feature flag

Do not hardcode full tab/stack lists in `App.tsx`.

```ts
function buildRoutes(features: Record<string, boolean>) {
  const routes = [];

  if (features.pasteTextInput || features.imageInput) {
    routes.push(InputStack);
  }
  if (features.lessonHistory) {
    routes.push(HistoryStack);
  }
  if (features.reviewSystem) {
    routes.push(ReviewStack);
  }
  if (features.miniGame) {
    routes.push(MiniGameStack);
  }
  if (features.situationLearning) {
    routes.push(SituationStack);
  }
  if (features.themeSwitcher) {
    routes.push(ThemeSettingsScreen);
  }

  return routes;
}
```

**P0 minimum:** static navigation is acceptable until M5; refactor when adding second tab gated by flags.

---

## 7. Backend feature guards

When adding practice/situation routes, mirror mobile flags server-side.

```ts
if (!featureFlags.isEnabled('miniGame', { releaseName, userSegment })) {
  throw new FeatureNotAvailableError('mini_game_disabled');
}
```

P0 endpoints (`/v1/ocr`, `/v1/ai/analyze`) are always available when MT-Core is on.

---

## 8. Test matrix (QA)

Test **flag combinations**, not only individual screens.

| Case ID | Config | Expected |
|---|---|---|
| TC-FLAG-001 | P0 only (`close-beta-1`) | Full scan/learn/save flow; no game/situation tabs |
| TC-FLAG-002 | Theme on | Themes switch; lesson flow unchanged |
| TC-FLAG-003 | `miniGame` + `wordMatchGame` on | Game playable from saved lesson vocab |
| TC-FLAG-004 | `miniGame` on, `lessonSave` off | **Invalid config** — CI must fail |
| TC-FLAG-005 | `situationLearning` on, `miniGame` off | Situation lesson works; no game entry |
| TC-FLAG-006 | Both situation + mini game on | Situation lesson + optional game practice |
| TC-FLAG-007 | Rollback: `miniGame` off after on | Game tab hidden; lessons/history intact |
| TC-FLAG-008 | `USE_MOCK_AI=true` + P0 flags | Mock path works for dev |
| TC-FLAG-009 | Required feature off | Validator rejects config |

Add rows to `05-qa/01-qa-test-plan.md` when flag infrastructure ships (M5+).

---

## 9. Rollback strategy

### Prefer flag rollback

```txt
Production issue in word match only:
  wordMatchGame = false
  (miniGame can stay true if other games work, or miniGame = false to hide entire hub)
```

Preserves: lesson input, AI, save, history, theme.

### Env rollback (providers)

```txt
AI provider outage:
  USE_MOCK_AI=false + show maintenance OR suspend analyze button with message
OCR outage:
  Disable ocrScanner flag + keep pasteTextInput
```

See `07-release/01-release-production-readiness.md §18`.

### Store rollback

Last resort — app store rollback is slow. Feature flags exist primarily to avoid this.

---

## 10. CI/CD integration

### Pipeline steps (when release infra exists)

```txt
1. Load release config JSON for target environment.
2. Run validateReleaseConfig() — fail build on invalid deps.
3. Unit tests.
4. Feature flag matrix tests (on/off).
5. MT-Core regression suite.
6. Build mobile (react-native-config embeds RELEASE_CONFIG_NAME).
7. Deploy API with matching feature guard config.
8. Staging QA sign-off.
9. Production rollout.
```

### Suggested env

```txt
RELEASE_CONFIG_NAME=close-beta-1
```

Mobile maps `RELEASE_CONFIG_NAME` → load matching JSON from `release/configs/`.

---

## 11. Definition of Done — release infrastructure

| Item | Status |
|---|---|
| `feature-registry.ts` matches registry table | Done |
| `feature-dependencies.ts` matches §3 | Done |
| `validate-release-config.ts` + unit tests | Done (`src/release/__tests__/`) |
| `close-beta-1.json` loaded at bootstrap via `FeatureFlagProvider` | Done |
| `isFeatureEnabled()` / `useFeatureEnabled()` hook | Done — wire navigation when tabs ship |
| CI runs validator on PR touching release configs | Pending |
| QA TC-FLAG-001 through TC-FLAG-007 | Pending (add to `05-qa/01-qa-test-plan.md`) |

---

## 12. Rules for AI coding agents

```txt
1. Do not edit core/release when task is a single feature screen.
2. Do not hardcode if (true) for experimental modules — use isFeatureEnabled().
3. New module → add feature.config.ts + registry entry + dependencies.
4. New route → register via buildRoutes / registerFeatureRoutes, not inline Stack.Screen spam.
5. Do not duplicate Lesson/Vocabulary storage for games — read from saved lesson / ai_output_json.
6. Do not add AI output fields outside 01-ai-output-v1.ts.
7. Do not break close-beta-1 regression (MT-Core).
8. Ship with flag default off until QA signs release config.
9. Include loading/empty/error for every new screen.
10. Update traceability matrix Status when FR is addressed.
```

---

## 13. Checklist: adding a new feature module

```txt
[ ] FR/US entry in 03-requirements/
[ ] feature.config.ts in module folder
[ ] Registry entry in feature-registry.ts
[ ] Dependencies in feature-dependencies.ts
[ ] Release config JSON updated (default false for new key)
[ ] Navigation guarded by isFeatureEnabled()
[ ] Backend route guard if API added
[ ] QA test rows for on/off
[ ] Traceability matrix updated
[ ] 07-modular-architecture-and-release.md mapping table updated if new Module Track
```
