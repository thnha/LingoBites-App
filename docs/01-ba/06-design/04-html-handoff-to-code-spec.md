# HTML Handoff to Code Spec - Phase 0

> Source handoff: `/Users/coins/Desktop/LingoScan Handoff.html`
> Status: extraction spec only. This document does not change schema, API, navigation, or milestone scope.
> Canonical priority still follows `AGENTS.md`: schema -> technical spec -> requirements/business rules -> design.

## 1. Purpose

This spec defines how to convert the bundled HTML handoff into React Native code for Phase 0 without drifting from the canonical app plan.

The HTML handoff is useful for visual language, component inventory, layout rhythm, state patterns, and design tokens. It is not a contract for data shape, stack choices, routes, milestone order, or feature scope.

## 2. Non-negotiable Overrides

When the HTML conflicts with repo docs, use the repo docs.

| Handoff item | Phase 0 decision |
|---|---|
| App name `LingoScan` | App/brand name is `LingoBites`. Treat `LingoScan` as legacy handoff wording only. |
| React Native via Expo references | Use React Native CLI + TypeScript. Do not add Expo dependencies. |
| `@expo/vector-icons`, `expo-font`, `expo-blur`, `expo-speech`, `expo-image` | Do not add these in Phase 0 without a separate dependency decision. M1 may use text-only UI or existing dependencies. |
| Material Symbols icon font | Icons/assets/fonts are deferred. If icon support is added later, use the repo-approved library and a wrapper. |
| UI chrome in English | App shell supports `en` and `vi` UI locales. Do not hard-code English-only copy from the handoff. |
| Custom camera screen | Phase 0 camera/gallery uses `react-native-image-picker` native UI only. No custom in-app live camera. |
| 12-screen separate lesson experience | Phase 0 result is a single scroll screen. Separate Sentence/Word/Grammar screens are post-P0 polish. |
| `Lesson`, `Word`, `GrammarNote` sample types | Do not use these as canonical models. Use `01-ai-output-v1.ts` and validated fixtures. |
| OCR/AI service snippets | Follow M2/M3 backend proxy specs. Do not put OCR/AI provider calls in mobile. |
| Zustand for all app state | Local component state first. Use Zustand only for shared state when the technical spec calls for it. |
| Profile target language setting | UI locale may be `en` or `vi`. AI lesson direction remains English source content with Vietnamese learning support unless schema/API specs are explicitly changed. |

## 3. Extraction Workflow

Use this sequence before implementing any UI from the handoff.

1. Identify the handoff screen or component.
2. Classify it as M1, M2, M3, M4, M5, or Post-P0 using the table in section 4.
3. Check the active milestone brief allowlist before editing code.
4. Check `01-ai-output-v1.ts` before rendering any lesson field.
5. Convert visual structure to React Native primitives or approved shared components.
6. Replace handoff copy with locale-aware app strings for `en` and `vi`; do not leave English-only literals in reusable UI.
7. Add loading, error, empty, and disabled states for every screen/flow.
8. Verify against fixtures and milestone exit tests.

If a handoff element needs a field, route, dependency, tab, or feature not present in canonical docs, stop and raise it as a spec-change question.

## 4. Handoff Scope Mapping

| Handoff section/screen | Ship phase | Code target | Instruction |
|---|---:|---|---|
| Home | M3-M4 | `src/modules/input/**`, later navigation | Use only as visual reference for entry CTAs. M1 does not require full Home tab. |
| Camera Scan | M3 | `src/modules/ocr/**` and image picker flow | Do not implement custom camera UI. Use native picker/camera selection. |
| Upload | M3 | `src/modules/ocr/**` | Use native gallery picker, preview, retry/error states. |
| Paste Text | M1 | `src/modules/input/**` | Primary M1 target. Implement empty state, max length validation, loading, invalid schema error. |
| Scan Result | M3 | OCR review/confirm flow | Must include user confirmation before AI call. Do not send OCR text automatically. |
| Lesson Detail | M1/M4 | `src/modules/lesson/**` | M1 renders mock result. M4 reopens saved lesson without AI call. |
| Sentence Breakdown | Post-P0 for separate screen | Inline section in `LessonResultView` for P0 | Do not create separate pushed screen in M1-M4. |
| Word Detail | Post-P0 | Inline vocabulary rows/cards in `LessonResultView` | Do not add standalone word detail screen in P0. |
| Grammar | Post-P0 for separate screen | Inline grammar section in `LessonResultView` | Show max 3 grammar points for P0. |
| Quick Practice | M1 inline, richer later | Inline practice section | Render practice from schema only. Empty arrays must not crash. |
| Library | M4 | `src/modules/lesson/**` history | Use for saved lesson history only after SQLite. |
| Profile | M5 | profile/settings/privacy | Use only for privacy note and delete local data in P0. No account/payment. |
| Component list | M1-M5 | `src/components/**` where useful | Extract only components needed by the active milestone. |
| Design tokens | M5 | `src/theme/**` | M1-M3 may use temporary StyleSheet. M5 must migrate to tokens. |
| UI states | M1-M5 | feature screens | Required in every milestone. Copy must have `en` and `vi` variants when localization infrastructure exists; before that, prefer `vi` for P0 learner-facing copy. |
| Safe area notes | M1-M5 | screen layout | Use SafeAreaProvider/insets. Pinned footers stay outside ScrollView. |

## 5. M1 Code Extraction Spec

M1 uses the handoff only for `Paste Text` and a single-scroll lesson result.

### 5.1 Paste Text

Required behavior:

- Text area for manual/pasted English input.
- Empty input disables the generate/analyze CTA.
- Over max length shows validation error and disables submission.
- Submit calls `MockAIAnalysisService`, not the network.
- Loading state appears during mock analysis.
- Invalid fixture response shows a friendly Vietnamese error and does not render/save.

Preferred Vietnamese UI copy:

| State | Copy |
|---|---|
| Empty prompt | `Dán hoặc nhập đoạn tiếng Anh bạn muốn học.` |
| CTA enabled | `Tạo bài học` |
| CTA disabled empty | `Nhập nội dung để tiếp tục` |
| Loading | `Đang tạo bài học...` |
| Invalid schema error | `Bài học tạo ra chưa đúng định dạng. Vui lòng thử lại.` |
| Too long | `Đoạn văn quá dài. Vui lòng rút ngắn còn tối đa 3000 ký tự.` |

English UI variants for the same keys may be added when the localization layer is implemented. Do not duplicate screens or branch layout by language.

### 5.2 Lesson Result

Render only validated `AIOutput`. Section order is locked:

1. Title and meta.
2. Original text.
3. Vietnamese translation.
4. Summary.
5. Sentence analysis.
6. Vocabulary.
7. Grammar.
8. Pronunciation.
9. Practice.
10. Disabled save placeholder.

Extraction rules:

- Use one `ScrollView`.
- Do not push separate screens for sentence, word, grammar, or practice.
- Vocabulary initially shows at most 5 items. If more exist, show `Xem thêm`.
- Grammar initially shows at most 3 items.
- Empty vocabulary, grammar, pronunciation, or practice arrays render Vietnamese empty states.
- Save button exists as a disabled placeholder in M1. Real save starts in M4.

Preferred empty copy:

| Section | Copy |
|---|---|
| Summary empty | `Chưa có tóm tắt cho bài này.` |
| Vocabulary empty | `Chưa tìm thấy từ vựng mới trong đoạn này.` |
| Grammar empty | `Chưa có điểm ngữ pháp nổi bật.` |
| Pronunciation empty | `Chưa có gợi ý phát âm cho bài này.` |
| Practice empty | `Chưa có bài luyện tập cho đoạn này.` |

## 6. Component Extraction Rules

Extract shared components only when they reduce duplication in the active milestone.

| Handoff component | P0 component decision |
|---|---|
| Text presets | M1 may use local styles. M5 migrates to `AppText` and theme typography. |
| Button | Use local `Pressable` or existing `AppButton` if present. M5 must use theme component tokens. |
| IconButton | Defer until approved icon library exists. Use text buttons in M1 if needed. |
| Card | Use simple `View`/shared card in M1. M5 uses `AppCard`. |
| Chip/Tag | Use only for schema-backed metadata such as level/language/POS. |
| TextField/TextArea | M1 text input can be local. Must support keyboard and validation. |
| ProgressTrack | Defer unless required by active milestone. |
| BottomActionBar | Use for pinned footer only if needed. Must be sibling of `ScrollView`, not inside it. |
| WordCard | Allowed in M1 vocabulary section if it uses schema fields only. |
| ChunkRow | Allowed in M1 sentence breakdown if it uses schema fields only. |
| QuizOption | Allowed in M1 practice if it uses schema fields only. |
| ScanFrame/ImagePlaceholder | Defer to M3, and only within native image picker constraints. |
| LessonCard/StatTile | Defer to M4/M5. |

## 7. Visual Tokens to Preserve

The handoff visual direction is a warm, pastel, beginner-friendly mobile app. Preserve the feel without breaking Phase 0 theme rules.

### 7.1 Color Intent

Handoff colors:

| Role | Handoff value |
|---|---|
| Background | `#fcfae6` |
| Surface | `#ffffff` |
| Surface low | `#f6f4e1` |
| Surface container | `#f0efdb` |
| Surface high | `#ebe9d5` |
| Text primary | `#1c1c10` |
| Text secondary | `#3c4a46` |
| Outline | `#6b7a76` |
| Primary | `#006b5f` |
| Primary container | `#2dd4bf` |
| On primary container | `#00574d` |
| Coral accent | `#fe7488` |
| Coral text | `#730425` |
| Yellow accent | `#ffe24c` |
| Yellow text | `#6d5e00` |
| Error | `#ba1a1a` |

M1-M3 may use temporary StyleSheet values if needed. M5 must map these into `AppTheme` semantic tokens or a `pastel-kids` theme, not hard-code them in screens.

### 7.2 Typography Intent

The handoff uses Lexend for headings/labels and Quicksand for body. Current repo decision defers custom font binaries and uses system font in the theme iteration.

Implementation rule:

- Keep the hierarchy and line-height feel.
- Do not add custom font dependencies in M1-M5 unless the theme spec is updated.
- Use theme typography tokens in M5.
- Avoid negative letter spacing in app code unless the theme spec explicitly allows it.

Suggested hierarchy to preserve:

| Role | Size/line height intent |
|---|---|
| Display | 32 / 38 |
| H1 | 28 / 34 |
| H2 | 22 / 28 |
| H3 | 18 / 24 |
| Body large | 18 / 28 |
| Body | 16 / 24 |
| Label | 14 / 18 |
| Caption | 12 / 16 |

### 7.3 Spacing and Radius

Preserve the rhythm:

| Token intent | Value |
|---|---:|
| `xs` | 4 |
| `s` | 8 |
| `sm` | 12 |
| `m` | 16 |
| `md` | 24 |
| `lg` | 32 |
| `xl` | 48 |

Layout rules:

- Screen horizontal padding: 16.
- Section gap: 24.
- Card padding: 20-24.
- In-card gaps: 8-12.
- Minimum touch target: 44 x 44.
- Use fluid layouts. Avoid fixed screen widths.

Radius intent:

| Role | Value |
|---|---:|
| Pill | 999 |
| Large feature card | 32 |
| Card | 24 |
| Row | 18 |
| Icon tile/medallion | 14 |

M5 token migration may adjust these to match `03-theme-system.md`; app code should not depend on exact literals after that migration.

## 8. State Requirements from Handoff

Every converted screen must define loading, empty, error, and disabled states.

Phase 0 adaptations:

| State | M1 adaptation |
|---|---|
| Loading | `Đang tạo bài học...`; no network wording. |
| Empty | Empty text disables CTA; empty result sections render inline empty copy. |
| Error | Invalid schema or mock failure renders recoverable inline error. |
| Disabled | Disabled CTA uses accessibility disabled state and cannot submit. |

M2-M5 may add richer OCR, network, permission, history, privacy, and analytics state copy from canonical docs.

## 9. Localization Rules

The app supports two UI locales: `en` and `vi`.

Scope:

- This is UI/app-shell localization, not a change to AI output schema.
- The learning flow still accepts English source content and presents Vietnamese learning support unless the canonical schema/API docs are changed.
- Screen layout must not fork by language. The same component tree renders both locales.
- UI text must come from stable string keys once localization infrastructure exists.
- Before localization infrastructure exists, M1-M3 may keep Vietnamese literals for learner-facing UI, but code should avoid making English handoff copy the default source of truth.

Required locale behavior when implemented:

| Locale | App shell copy | Lesson content |
|---|---|---|
| `vi` | Vietnamese labels, buttons, errors, empty states | English source + Vietnamese translation/explanations |
| `en` | English labels, buttons, errors, empty states | English source + Vietnamese translation/explanations unless schema/API changes |

Do not add a target-language setting that changes AI output language without following `11-spec-change-protocol.md`, because that would affect schema, prompts, fixtures, and acceptance tests.

## 10. Safe Area and Layout Rules

Use these rules whenever translating a handoff screen:

- Wrap app with safe area support according to existing app setup.
- Header/tab/footer use safe area insets. Do not hard-code iPhone status bar or home indicator values.
- Pinned tab bars and bottom action bars must be outside the scroll view.
- Paste text screens must keep the CTA reachable above the keyboard.
- Test narrow mobile widths before accepting UI.
- Honor reduced motion for scan-line or entrance animations if those are implemented later.

## 11. Dependency Gate

Do not add dependencies just because the handoff mentions them.

| Dependency mentioned | Phase 0 action |
|---|---|
| `expo-font` | Do not add. Custom fonts deferred. |
| `react-native-google-fonts` | Do not add. Custom fonts deferred. |
| `@expo/vector-icons` | Do not add. Icon library decision deferred. |
| `expo-blur` | Do not add. Custom camera UI out of scope. |
| `expo-speech` | Do not add from handoff. TTS is optional per technical spec. |
| `expo-image` | Do not add. |
| `i18next` | Do not add from handoff alone. If localization infrastructure is implemented, first approve the technical approach and canonical docs for `en`/`vi` string management. |
| `AsyncStorage`/`MMKV` | Do not use for saved lessons. M4 uses SQLite for lesson storage. |

Allowed existing stack remains React Native CLI, TypeScript, React Navigation, `react-native-config`, backend proxy, and SQLite when M4 starts.

## 12. Theme Extensibility Rules

The HTML handoff palette is one theme candidate, not the only app identity. Future theme templates must be added through the theme architecture in `03-theme-system.md`, not by branching screen styles.

### 12.1 Theme Template Definition

A theme template is a complete visual package that maps into `AppTheme`:

- semantic colors;
- typography scale;
- spacing scale;
- radius scale;
- shadow styles;
- component tokens for buttons, cards, inputs, and other shared UI primitives.

Screens and feature components must not know which theme is active. They read only `useAppTheme()` and reusable components such as `AppText`, `AppButton`, `AppCard`, and `AppScreen` after the theme skeleton exists.

### 12.2 Adding a New Theme Template

If a future handoff provides another theme, use this workflow:

1. Create a theme intake note that names the template, audience, and source file.
2. Extract raw palette, typography, spacing, radius, shadow, and component examples from the handoff.
3. Map raw values to semantic `AppTheme` roles. Do not introduce palette-specific names into screens.
4. Add missing semantic tokens to `AppTheme` only when they represent reusable UI meaning; update all existing themes at the same time.
5. Create the concrete theme file under `src/theme/themes/`.
6. Add the theme to `themeRegistry.ts`; derive `ThemeId` from the registry.
7. Add or reuse a release feature flag for visibility in `ThemePicker`.
8. Add QA coverage that renders representative screens under every registered theme.
9. Update `03-theme-system.md` if the theme contract changes.
10. Update traceability and ship tracker if the work touches M5 theme FRs.

Example:

```text
New handoff: "Minimal Ink"
→ Extract raw palette: black/white/gray with one blue accent
→ Map to AppTheme:
   colors.background
   colors.surface
   colors.primary
   colors.text.primary
   colors.text.secondary
   components.button.primary
   components.card
→ Add src/theme/themes/minimalInk.ts
→ Register id: minimal-ink
→ Gate with release flag: minimalInkTheme
→ ThemePicker shows it only when flag is enabled
```

### 12.3 What Must Not Happen

- Do not add `if (themeId === 'x')` branches inside feature screens.
- Do not duplicate `PasteTextScreen`, `LessonResultView`, or other screens per theme.
- Do not hard-code a future handoff color directly in a screen after theme skeleton lands.
- Do not add a theme that only partially implements `AppTheme`.
- Do not let a theme change AI output schema, navigation, feature visibility, or milestone scope.
- Do not ship paid/premium theme behavior in P0. Monetization/account entitlement remains Post-P0 unless a separate approved spec exists.

### 12.4 Relationship to This Handoff

The current `LingoScan Handoff.html` palette can become a LingoBites theme template, likely `pastel-kids`, during M5 theme work. Until then:

- M1-M3 may copy limited visual values into temporary local styles if needed.
- M5 must migrate those values into semantic theme tokens.
- Future handoffs follow the same extraction process and never bypass `AppTheme`.

## 13. Acceptance Checklist

Use this checklist before claiming an HTML-to-code extraction is shippable.

- [ ] The work belongs to the active milestone brief.
- [ ] No HTML-only or Expo dependency was added.
- [ ] No AI output field was invented outside `01-ai-output-v1.ts`.
- [ ] User-facing UI copy is locale-aware for `en`/`vi` when localization exists; otherwise P0 learner-facing copy is Vietnamese.
- [ ] Result screen is single scroll in M1-M4.
- [ ] Navigation remains `Home | Lessons | Profile` for Phase 0.
- [ ] Camera/gallery work, if any, uses native image picker only.
- [ ] OCR text is never sent to AI before user confirmation.
- [ ] `validateAIOutput()` runs before render or save.
- [ ] Saved lesson reopen, if touched, does not call AI again.
- [ ] Loading, error, empty, and disabled states exist.
- [ ] Full user text/images/raw AI output are not logged.
- [ ] Tests from the active milestone brief pass.
- [ ] Traceability matrix status is updated for touched FRs at session close.
- [ ] If theme work is touched, every registered theme still fully implements `AppTheme`.
- [ ] If a new theme template is added, visibility goes through registry + feature flag, not screen code.
- [ ] If localization is touched, both `en` and `vi` strings exist for all new UI keys.

## 14. Recommended Implementation Order from Handoff

1. Finish M1 gaps in `LessonResultView`: pronunciation, disabled save placeholder, vocab limit, grammar limit, fixture error/minimal states, unit tests.
2. Use handoff state patterns to improve M1 loading/error/empty visuals without adding new dependencies.
3. In M3, use Home/Upload/Paste visual guidance for input entry, but keep camera/gallery native.
4. In M4, use Library/LessonCard visual guidance for saved lesson history.
5. In M5, map handoff colors/spacing/radius into theme tokens if they still match product direction.

## 15. STOP Cases

Stop and ask before implementation if the HTML handoff suggests:

- A field not present in `01-ai-output-v1.ts`.
- An API route not present in the technical spec or active milestone.
- OCR/camera work during M1.
- SQLite/history work before M4.
- Analytics/theme/payment/account work before its milestone or without a feature flag.
- Separate lesson sub-screens for P0 result sections.
- A fourth bottom tab, Scan tab, or Vocabulary tab.
- Any dependency not already approved by the repo docs.
- Theme-specific branches inside feature screens instead of `AppTheme` tokens.
- A locale change that alters AI output language without schema/API/prompt/fixture updates.
