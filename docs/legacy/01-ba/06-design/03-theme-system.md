# Theme System & Theme-driven Architecture

## 1. Purpose

This document specifies the **theme system** for `this repo`: a centralized architecture layer for all presentation (colors, fonts, spacing, radius, shadow, component styles) so screens and feature components **do not hard-code** styles.

This is UI foundation/polish, not a standalone product feature, and it does not block the M1–M4 core loop. Use it as a gate only when the current task is theme iteration or M5 polish.

Goals:

- Separate style from business logic; screens render only through tokens.
- Change the global theme through a single Provider; add or remove themes via checklist without editing screens.
- Let AI/dev build UI consistently using **semantic tokens**.

This file is the **canonical theme spec** for `this repo`. Implement per milestone: **M1–M3** may use temporary `StyleSheet` until theme skeleton exists; **M5** gate requires full token migration (TC-024..030).

---

## 2. Scope

### In scope (theme iteration)

- `colors`, `typography` (system font), `spacing`, `radius`, `shadow`, `components` tokens.
- Theme Provider + `useAppTheme` hook + theme registry.
- 3 themes: `default` (light, keep current blue identity), `dark`, `pastel-kids`.
- Reusable components: `AppText`, `AppButton`, `AppCard`, `AppScreen`, `ThemePicker`.
- Runtime theme switching + persist selection via AsyncStorage.
- Refactor 2 existing screens (`PasteTextScreen`, `LessonResultView`) to use the theme.

### Out of scope (deferred — same batch as real assets)

- Sellable/premium theme behavior: premium locks, purchase stubs, entitlement storage, auth/account, payment/receipt validation, and backend entitlement API. This requires a separate Post-P0 spec before implementation.
- `'system'` (OS-following) pseudo-theme.
- `AppIcon`, `AppImage`, `icons`/`assets`/`fonts` tokens, custom font (.ttf) + native linking.
- Themes other than the 3 above.
- Theming for screens not yet built (Scan, Result, Profile per `06`).

---

## 3. Architecture

```text
Design Tokens (base)
→ Semantic Theme (AppTheme)
→ Theme Registry
→ Theme Provider (context + persistence)
→ useAppTheme hook
→ Reusable UI Components
→ Screens
```

Screens read only through: `theme.colors`, `theme.typography`, `theme.spacing`, `theme.radius`, `theme.shadow`, `theme.components`.

Directory structure (`src/`):

```text
theme/
  types.ts          # AppTheme type (id: plain string) — ThemeId derives in themeRegistry, not here (§12)
  tokens.ts         # shared base scale
  themes/
    default.ts      # id 'default'
    dark.ts         # id 'dark'
    pastelKids.ts   # id 'pastel-kids'
  themeRegistry.ts  # SINGLE SOURCE OF TRUTH: themes map, ThemeId = keyof, themeList, defaultThemeId, isThemeId()
  themeStorage.ts   # getSavedThemeId()/saveThemeId() via AsyncStorage
  ThemeProvider.tsx # context, load+validate, save on change, memoized value
  useAppTheme.ts    # hook, throws if used outside Provider
  index.ts
components/
  AppText.tsx
  AppButton.tsx
  AppCard.tsx
  AppScreen.tsx
  ThemePicker.tsx   # registry themes allowed by release flags; tap -> setThemeId
```

---

## 4. Token model (`AppTheme`)

```ts
// ThemeId is NOT a hand-written union. It is derived from the registry so the
// registry is the single source of truth (see §12). `id` is therefore a plain
// string on the contract; the concrete union is produced by `keyof typeof themes`.
type AppTheme = {
  id: string;
  name: string;
  colors: {
    background: string;
    surface: string;
    border: string;
    primary: string;
    primaryPressed: string;
    danger: string;
    text: { primary: string; secondary: string; inverse: string; muted: string };
  };
  // Interaction states so components never hard-code opacity/pressed values.
  states: { disabledOpacity: number; pressedOpacity: number };
  typography: {
    fontFamily: { primary?: string; display?: string }; // system font in this iteration
    size: { xs; sm; md; lg; xl; xxl };                   // number
    weight: { regular: '400'; medium: '600'; bold: '700' | '800' };
  };
  spacing: { xs; sm; md; lg; xl; xxl };  // number
  radius: { sm; md; lg; xl; pill };      // number
  shadow: { soft; medium; strong };      // ViewStyle (shadow* + elevation)
  components: {
    button: {
      primary:   { background; text; height; radius };
      secondary: { background; text; border; height; radius };
    };
    card:  { background; radius; padding; shadow };  // shadow: keyof AppTheme['shadow']
    input: { background; text; placeholder; border; radius };
  };
};
```

Convention: use **semantic tokens** (`colors.text.primary`), not raw palette names in screens.

The contract must be **closed**: every visual value a component needs must map to a token. Concretely, the current screens require these to be tokens (not literals): button spinner color → `colors.text.inverse`; disabled/pressed opacity → `states.*`; input placeholder → `components.input.placeholder`. If a value has no token, add one to `AppTheme` and update **all** themes (BR-THEME-004) — never reach for a literal.

---

## 5. UI Foundation / Polish Requirements (FR)

| ID | Requirement | Priority |
|---|---|---|
| FR-THEME-001 | System shall expose a centralized theme object (colors, typography, spacing, radius, shadow, component tokens) via a single Theme Provider | Foundation |
| FR-THEME-002 | Screens and feature components shall read styling from theme tokens, not hard-code colors/fonts/spacing | Foundation |
| FR-THEME-003 | System shall provide reusable themed components: AppText, AppButton, AppCard, AppScreen | Foundation |
| FR-THEME-004 | System shall register multiple themes (default, dark, pastel-kids) via theme registry | Polish |
| FR-THEME-005 | User can switch theme at runtime via ThemePicker, applied globally immediately | Should |
| FR-THEME-006 | System shall persist the selected theme and restore it when the app reopens | Should |
| FR-THEME-007 | `useAppTheme()` called outside Theme Provider shall throw a clear error | Should |
| FR-THEME-008 | Each theme shall fully implement the `AppTheme` type with no TypeScript errors | Foundation |
| FR-THEME-009 | Screens shall use semantic tokens (colors.text.primary), not raw palette names | Foundation |
| FR-THEME-010 | System shall allow adding a new theme without editing screens | Should |
| FR-THEME-011 | (Deferred) Icon/asset/font resolver per theme (AppIcon, AppImage, custom font) | Deferred |
| FR-THEME-012 | The theme registry shall be the single source of truth: `ThemeId`, `themeList`, and `ThemePicker` options are all derived from it. Adding a theme = adding one registry entry, with no edits to `types.ts` or `ThemePicker` | Foundation |
| FR-THEME-013 | On load, a persisted theme id that no longer exists in the registry (theme removed/flag off) shall fall back to `defaultThemeId` without crashing | Foundation |
| FR-THEME-014 | `ThemePicker` shall list only themes that exist in the registry **and** whose feature flag is enabled (`darkTheme`, `pastelKidsTheme`, …); `default` is always available | Should |
| FR-THEME-015 | An ESLint rule (`react-native/no-color-literals`, `no-inline-styles`) shall fail the build on hard-coded colors/inline styles under `screens/` and `components/` | Should |

---

## 6. Business / Design Rules (BR)

| ID | Rule |
|---|---|
| BR-THEME-001 | Do not hard-code colors/fonts in screens or feature components. |
| BR-THEME-002 | Use `useAppTheme()` for colors, spacing, radius, typography, shadow, and component tokens. |
| BR-THEME-003 | Use `AppText`/`AppButton`/`AppCard`/`AppScreen` instead of raw `Text`/`Pressable`/`View`/`SafeAreaView` when possible. |
| BR-THEME-004 | If a token is missing, add it to `AppTheme` and update **all** themes; do not use one-off styles that break the design system. |
| BR-THEME-005 | Each new theme must implement `AppTheme` correctly with no TypeScript errors. |
| BR-THEME-006 | Prefer semantic tokens and component tokens (button, card, input); do not use raw palette names. |
| BR-THEME-007 | The `default` theme must keep the current identity (blue tone) so UX does not break during refactor. |
| BR-THEME-008 | This iteration uses system font; custom font and icon/asset binaries are deferred until real assets are available. |
| BR-THEME-009 | Theme changes must apply globally immediately without restarting the app. |
| BR-THEME-010 | The theme **registry is the single source of truth**. `ThemeId = keyof typeof themes`; `types.ts` must not declare a hand-written id union. `themeList` and `ThemePicker` options derive from the registry. |
| BR-THEME-011 | A persisted theme id is validated against the registry on load (`isThemeId()`); an unknown id (removed theme / disabled flag) falls back to `defaultThemeId` instead of throwing. |
| BR-THEME-012 | The `default` theme must always be present and must never be removed; it is the guaranteed fallback. `defaultThemeId` must point to a theme that exists in the registry. |
| BR-THEME-013 | A theme is visible in `ThemePicker` only when its feature flag is enabled (`darkTheme`, `pastelKidsTheme`, …). Removing a theme from production = turning its flag off; the registry entry may remain. |
| BR-THEME-014 | The Provider context value (`{ theme, themeId, setThemeId }`) must be memoized (`useMemo`) so switching theme does not cause unrelated re-renders and the `theme` object keeps a stable identity. |

---

## 7. User Stories & Acceptance Criteria

### US-016 — Switch app theme

As a user, I want to switch the app theme so that I can use a look I prefer.

```gherkin
Given the app is open
When I select a theme in the ThemePicker
Then all screens immediately use that theme's colors, spacing, and styles
And no app restart is required
```

### US-017 — Theme is remembered

As a user, I want the app to remember my chosen theme so that it stays after I reopen the app.

```gherkin
Given I selected a non-default theme
When I close and reopen the app
Then the app restores my previously selected theme

Given no theme was ever selected
When I open the app
Then the app uses the default theme
```

### US-018 — Unified style source for dev/AI

As a developer or AI coding agent, I want a single theme source and reusable components so that I can build UI consistently without hard-coded styles.

```gherkin
Given I build or edit a screen
When I need colors, spacing, typography, or component styles
Then I read them from useAppTheme() or use App* components
And I do not introduce hard-coded color/font values
```

---

## 8. QA Test Cases

| ID | Title | Expected |
|---|---|---|
| TC-024 | Runtime theme switch | Select a different theme in ThemePicker → all screens change colors/spacing immediately, no restart |
| TC-025 | Theme persistence | Select theme → reload app (mock AsyncStorage) → theme is restored; never selected → default |
| TC-026 | Provider guard | Call `useAppTheme()` outside Theme Provider → throws a clear error |
| TC-027 | Render all themes | **Parametrized over `themeList`** — every registry theme renders App* without errors; AppButton primary/secondary match `components.button`; AppText matches typography/colors. New themes are covered with no test edit |
| TC-028 | No hard-coded styles | Review/lint: `PasteTextScreen` and `LessonResultView` have no hard-coded color/font values, only tokens/App*; ESLint color-literal rule fails the build on violations |
| TC-029 | Removed-theme fallback | Persist an id not in the registry (mock AsyncStorage) → app loads with `default`, no crash (BR-THEME-011) |
| TC-030 | Flag-filtered picker | Disable `pastelKidsTheme` flag → `ThemePicker` omits pastel-kids but still shows default/dark (BR-THEME-013) |

---

## 9. Technical Impact & Dependencies

- **New dependency:** `@react-native-async-storage/async-storage` (native). After adding: `npm install`, `cd ios && pod install`, rebuild app. (RN CLI, not Expo.)
- **Refactor:** Wrap `App.tsx` with `<AppThemeProvider>`; migrate `PasteTextScreen` + `LessonResultView` to App* + `useAppTheme`, remove hard-coded `StyleSheet`; add `ThemePicker` to `ProfileScreen` (Settings — the product home for theme switching per `01-user-flow` §12), not the input screen.
- **No impact** on API/backend, AI output schema, or OCR/AI flow.

---

## 10. Checklist for Adding / Removing a Theme

**Add a theme — touch only the registry + (optionally) one flag:**

- [ ] Create `theme/themes/<name>.ts` fully implementing `AppTheme` (TypeScript enforces every token — `colors` / `states` / `typography` / `spacing` / `radius` / `shadow` / `components`).
- [ ] Add **one entry** to the `themes` map in `themeRegistry.ts`. `ThemeId`, `themeList`, and `ThemePicker` update automatically (BR-THEME-010). Do **not** edit `types.ts` or `ThemePicker`.
- [ ] (If it should be flag-gated) add a feature flag in `feature-registry.ts` + `feature-dependencies.ts` (depends on `themeSystem`) and gate it in the picker (BR-THEME-013).
- [ ] No screen/component edits. The parametrized render test (TC-027) covers the new theme automatically.
- [ ] (When assets are available) add `icons`/`assets`/`fonts` for the theme.

**Remove a theme:**

- [ ] Turn its feature flag off (preferred) — it disappears from `ThemePicker`; any user who had it selected falls back to `default` on next load (BR-THEME-011). Or delete the registry entry; the fallback path is the same. `default` can never be removed (BR-THEME-012).

---

## 11. Definition of Done (theme system iteration)

- Theme Provider + registry + `useAppTheme` working; 3 themes fully implement `AppTheme` with no TypeScript errors.
- Registry is the single source of truth: `ThemeId = keyof typeof themes`, `themeList`/`ThemePicker` derived (BR-THEME-010).
- Removed/unknown persisted theme falls back to `default` without crashing (TC-029).
- `ThemePicker` filters by feature flag (TC-030).
- 2 existing screens have no hard-coded styles (TC-028); ESLint color-literal rule active (FR-THEME-015).
- Runtime theme switch + persistence working (TC-024, TC-025).
- TC-024..030 pass.

This Definition of Done applies only when implementing the theme iteration. Phase 0 core loop still follows `03-requirements/05-traceability-matrix.md` section 2 and is not blocked by theme if theme is not in the current task.

> Post-P0 note: sellable/premium themes require a separate monetization/account spec, feature registry entries, entitlement/payment decisions, QA cases, and traceability rows. Do not implement premium locks or purchase stubs as part of the Phase 0 theme iteration.

---

## 12. Extensibility & Enforcement (single source of truth)

These patterns are what make the three goals — easy switching, friction-free add/remove, and "any theme applies to all UI" — actually hold over time, instead of only on paper.

**Registry derives everything (A, B):**

```ts
// themeRegistry.ts — the ONLY place that lists themes.
export const themes = {
  default:       defaultTheme,
  dark:          darkTheme,
  'pastel-kids': pastelKids,
} satisfies Record<string, AppTheme>;

export type ThemeId = keyof typeof themes;        // no hand-written union
export const themeList = Object.values(themes);    // ThemePicker maps over this
export const defaultThemeId: ThemeId = 'default';
export const isThemeId = (v: unknown): v is ThemeId =>
  typeof v === 'string' && v in themes;
```

**Load with validation + fallback (C, D):**

```ts
// in ThemeProvider mount effect
const saved = await getSavedThemeId();
setThemeIdState(isThemeId(saved) ? saved : defaultThemeId); // removed theme → default
```

**Picker is dynamic and flag-filtered (B, E):**

```ts
const { isFeatureEnabled } = useFeatureFlags();
const visible = themeIds.filter(id => {
  const flag = themeReleaseFlag[id];           // undefined for ungated themes (e.g. default)
  return flag === undefined || isFeatureEnabled(flag);
});
// render one button per `visible` id — never hard-code theme buttons
```

**Memoized context (H):**

```ts
const value = useMemo(() => ({ theme: themes[themeId], themeId, setThemeId }), [themeId]);
```

**Enforcement so the contract can't rot (F, G):**

- TypeScript: `themes satisfies Record<string, AppTheme>` → a new theme missing any token fails to compile.
- ESLint `react-native/no-color-literals` + `no-inline-styles` on `screens/` + `components/` → no literal colors slip in (FR-THEME-015).
- Parametrized Jest test loops `themeList`, so every current and future theme is render-tested without editing the test:

```ts
themeList.forEach(t =>
  it(`renders App* components under "${t.id}"`, () => { /* render in Provider */ }));
```

---

## 13. Post-P0 Monetization Note

Themes may become sellable later, but that is outside this iteration and outside Phase 0 unless explicitly approved through the Phase N workflow. A future monetization spec must define account identity, payment/receipt validation, entitlement storage, premium lock UI, QA cases, feature flags, rollback, and traceability rows before implementation.

---

## 14. Concrete theme palettes (implementation values)

Semantic-token values for the 3 launch themes. Screens still read only semantic tokens (§4) — these
tables are the source for the `theme/themes/*.ts` files, not for hard-coding into screens.

### 14.1 `default` (light, current app identity — blue)

Extracted from the existing app's literals so the refactor does not change the look (BR-THEME-007).

| Token | Value |
|---|---|
| `colors.background` | `#f8fafc` |
| `colors.surface` | `#ffffff` |
| `colors.border` | `#e5e7eb` |
| `colors.primary` | `#2563eb` |
| `colors.primaryPressed` | `#1d4ed8` |
| `colors.danger` | `#b91c1c` |
| `colors.text.primary` | `#111827` |
| `colors.text.secondary` | `#4b5563` |
| `colors.text.muted` | `#6b7280` |
| `colors.text.inverse` | `#ffffff` |

### 14.2 `pastel-kids` (from the `LingoScan` handoff — teal/coral/gold)

The handoff palette becomes this theme (per `04-html-handoff-to-code-spec.md` §12.4), **not** `default`.

| Token | Value |
|---|---|
| `colors.background` | `#fcfae6` |
| `colors.surface` | `#ffffff` |
| `colors.border` | `#3c4a46` (outline) |
| `colors.primary` | `#006b5f` |
| `colors.primaryPressed` | `#00574d` |
| `colors.danger` | `#ba1a1a` |
| `colors.text.primary` | `#1c1c10` |
| `colors.text.secondary` | `#3c4a46` |
| `colors.text.inverse` | `#ffffff` |
| accent (container) | `#2dd4bf` teal · `#fe7488` coral · `#ffe24c` yellow |

Shadows in this theme are colored/ambient (teal/coral), never black (handoff §7).

### 14.3 `dark` — **DRAFT, needs design sign-off**

Placeholder values so the registry/test can include `dark`; confirm with design before ship.

| Token | Value (draft) |
|---|---|
| `colors.background` | `#0b1220` |
| `colors.surface` | `#1f2937` |
| `colors.border` | `#374151` |
| `colors.primary` | `#3b82f6` |
| `colors.primaryPressed` | `#2563eb` |
| `colors.danger` | `#f87171` |
| `colors.text.primary` | `#f8fafc` |
| `colors.text.secondary` | `#cbd5e1` |
| `colors.text.muted` | `#94a3b8` |
| `colors.text.inverse` | `#0b1220` |

> `states`, `typography`, `spacing`, `radius`, `shadow`, and `components` tokens are shared from
> `tokens.ts` unless a theme deliberately overrides them (e.g. `pastel-kids` larger `radius`).
