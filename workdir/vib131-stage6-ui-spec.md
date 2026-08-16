# Stage 6 — UI Spec, Design-System Gap List, Motion Spec
## P1 Flashcards / SRS / Daily Review

> Issue: VIB-131. Builds on Stage 4a wireframes/state matrix (`vib128-stage4a-wireframes.md`) and Stage 4b copy deck (`vib129-stage4b-content-copy.md`), both approved at Gate 2 (VIB-130, 2026-08-16).
> Labels: `FACT` / `ASSUMPTION` / `QUESTION` / `RISK` / `DECISION`. Unlabeled prose is structural description.
> Scope: component-level UI spec (token mapping, props, states) + final gap-list resolution + motion spec. HTML handoff is the companion file `vib131-html-handoff.html`. Screen inventory, ASCII wireframes, and state matrix are not repeated here — see Stage 4a.
> Token source verified at commit `f719a97`: `src/theme/tokens.ts`, `src/theme/themes/default.ts`, `src/components/*`.

## Round 2 revision log (2026-08-17)

Stage 7's review (VIB-132) found 0 Critical / 2 High / 2 Medium and recommended revise-before-approval. All four are fixed in this revision; contrast recalculated for all 7 shipped themes, not just Dark, per the review's explicit ask.

| ID | Finding | Fix | Where |
|---|---|---|---|
| H1 | Dark "Chưa nhớ" contrast 2.82:1, fails AA | `RatingControl`'s negative button now pairs `surfaceHigh` with `theme.colors.text.secondary` (existing token) instead of `theme.colors.primary`. Recalculated: 6.97:1–9.70:1 across all 7 themes. | §2.2, HTML §2 |
| H2 | SCR-05 capped-queue header showed "Thẻ 2/20" against an "8 thẻ" banner | Locked an explicit invariant: progress denominator is always the session-snapshot size, never the pre-cap due total. HTML corrected to "Thẻ 2/8". | §2.1, HTML §4.3 |
| M1 | `FlipCard` heights drifted (220/200/160/140) across HTML states | Locked 220 as the one floor value for every instance/state; HTML normalized. | §2.1, HTML §1/§4.3/§4.5 |
| M2 | `Banner` text was 12px in screen mocks vs. 14sp (`label`) in the spec | Locked `label`/14sp as the only size; HTML normalized. | §2.3, HTML §3/§4.3/§4.5 |

---

## 1. Design-system gap list — final resolution

Stage 4a (VIB-128 §3) narrowed the candidate list to 4 items. This stage resolves each to an implementation decision.

| Item | Resolution | `DECISION` |
|---|---|---|
| Flip-card | **New component** `FlipCard` | Confirmed genuine gap — no existing component does a front/back reveal (`QuizOption` is single-state select, `WordCard` is static, neither flips). Spec at §2.1. |
| Rating control | **New component** `RatingControl` | Confirmed genuine gap — needs 2 primary graded actions + 1 low-emphasis skip in one unit; no existing component composes that. Spec at §2.2. |
| 2 new icons (`check_circle`, `refresh`) | **Add to `HANDOFF_ICONS`** | Not a component gap — an icon-registry addition. Spec at §3. |
| Capped-queue banner | **New component** `Banner` (not an `ErrorCard` variant) | See rationale at §2.3 — reusing `ErrorCard` would borrow error/danger color semantics for a non-error, non-actionable, expected state. |

Everything else in the P1 inventory reuses existing components as-is or via a prop addition (`WordCard.saved`/`onToggleSave`, native `Alert.alert`) — see Stage 4a §2, unchanged by this stage.

---

## 2. New component specs

### 2.1 `FlipCard`

Used by SCR-03 (Flashcard Detail) and reused inside SCR-05 (Daily Review Session).

```ts
type Props = {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped: boolean;
  onPress: () => void;
  disabled?: boolean;
  frontAccessibilityLabel?: string; // default: 'Lật thẻ để xem nghĩa'
  backAccessibilityLabel?: string;  // default: 'Lật thẻ để xem từ'
};
```

- **Ownership**: `flipped` is controlled by the parent screen, not internal state — SCR-05 needs to reset it to `front` on every card advance, and the rating control needs to know when the back face is showing (rating buttons only render/enable once flipped).
- **Container**: `theme.colors.surface` background, `theme.components.card.radius` (24) corners, `theme.shadow.soft`, `padding: theme.spacing.xl` (24 in the default theme's handoff spacing scale).
- **Sizing** (`FACT`, Stage 4a §6 responsive rule): no fixed pixel height. Use `minHeight` as a content floor only (**220, one value, every state**) plus `flex`/intrinsic content sizing, so the smallest supported device (iPhone SE, ~568pt) still fits rating control + skip below the card without scrolling. Full width minus the screen's horizontal gutter (`theme.gutter`, 16) on each side.

  `DECISION` (round 2, fixes Stage 7 M1): 220 is a single floor constant used identically by every `FlipCard` instance and every screen state (front, back, capped-queue, error-retry) — it is not state-dependent. The component never shrinks its floor because a banner or an `ErrorCard` is also on screen; the screen composes around a constant-floor card, not the other way around. The round-1 HTML handoff mock had drifted into using 220/200/160/140 across different screen states, which reads as an undocumented "the card shrinks when other content appears" rule that was never intended and isn't in this spec — corrected in the HTML (§4.3, §4.5) to 220 everywhere.
- **Front content**: word in `AppText variant="h1"`, centered; helper text below in `AppText variant="caption" color="muted"` reading the front helper copy (`Chạm để xem nghĩa` — SCR-05) or `Chạm để xem nghĩa` (SCR-03, same copy per VIB-129 §2).
- **Back content**: word in `AppText variant="h3"`, meaning in `AppText variant="body"`, example (SCR-03 only) in `AppText variant="caption" color="muted"`, helper text `Chạm để xem từ` (SCR-05) / same (SCR-03).
- **Interaction**: the entire card is one `Pressable` (`accessibilityRole="button"`), not a separate flip icon — matches the wireframe's "chạm để lật thẻ" affordance. `accessibilityLabel` switches between `frontAccessibilityLabel`/`backAccessibilityLabel` based on `flipped`.
- **Disabled**: dim to `theme.states.disabledOpacity` (0.38) and ignore presses — only used by SCR-05 while a rating write is retrying (§1.5 of Stage 4a), not by static SCR-03.
- **Touch target**: card footprint vastly exceeds the 48dp floor; no separate check needed.
- **Progress invariant** (`DECISION`, round 2, fixes Stage 7 H2): SCR-05's header progress readout (`{current}/{total}` per VIB-129 §2) must use the **active session snapshot size** as `total` — the post-cap count the user is actually working through this session (e.g. 8) — never the pre-cap total-due count (e.g. 20). The capped-queue `Banner` and the header progress counter describe the same session from two angles; showing "Thẻ 2/20" next to "hôm nay ôn 8 thẻ" contradicts the banner within the same screen. This is a hard invariant, not a per-state choice: `total` in the progress readout is always `session.length`, whether or not the cap applied. The HTML handoff's capped-queue mock is corrected to `Thẻ 2/8` accordingly (§4.3 there).

### 2.2 `RatingControl`

Used by SCR-05 only, revealed after `FlipCard` shows its back face.

```ts
type Props = {
  onRate: (outcome: 'remembered' | 'forgot') => void;
  onSkip: () => void;
  disabled?: boolean;
};
```

- **Layout**: row of 2 buttons (`flexDirection: 'row'`, `gap: theme.spacing.sm`, each `flex: 1`), with the skip action on its own line below.
- **"Nhớ" button** (`onRate('remembered')`): icon `check_circle` (filled) + label `Nhớ`. Background `theme.colors.accent` (#2dd4bf), icon/text color `theme.colors.accentInk` (#00574d) — same accent pairing `IconButton`'s `tone="accent"` already uses, so "positive outcome" reads consistently with the saved-flashcard accent elsewhere in the flow (§SCR-01a).
- **"Chưa nhớ" button** (`onRate('forgot')`): icon `refresh` (outline) + label `Chưa nhớ`. Background `theme.colors.surfaceHigh`, icon/text `theme.colors.text.secondary`. **Not** `danger`/red — "chưa nhớ" is a normal, expected SRS outcome, not an error (matches Q-FLOW-02 / CT-04's rejection of alarming SM-2-style framing).

  `DECISION` (round 2, fixes Stage 7 H1): the original draft paired `surfaceHigh` with `theme.colors.primary`, mirroring `IconButton`'s `tone="ghost"`. That pairing is not a load-bearing contract anywhere in the codebase — it happens to pass contrast in 6 of the 7 shipped themes by coincidence, and fails outright in Dark (2.82:1, needs ≥4.5:1 for WCAG AA). `theme.colors.text.secondary` is the theme's designed secondary-ink token — it is built to read against surface-family backgrounds in every theme, and it fits "Chưa nhớ" semantically better anyway (a neutral secondary action, not a `primary`-brand-colored one). This is an existing token, not a new one — no `AppTheme` type change needed. **Do not reuse `IconButton`'s `tone="ghost"` for this control**; `RatingControl` is a bespoke pair of buttons, not an `IconButton` instance.

  Recalculated contrast, `surfaceHigh` background vs. `text.secondary` foreground, all 7 shipped themes (WCAG AA text threshold 4.5:1):

  | Theme | Old (`primary` on `surfaceHigh`) | New (`text.secondary` on `surfaceHigh`) |
  |---|---:|---:|
  | default | 5.25:1 ✅ | 7.59:1 ✅ |
  | dark | **2.82:1 ❌** | **6.97:1 ✅** |
  | core | 5.46:1 ✅ | 7.58:1 ✅ |
  | cartoon | 5.23:1 ✅ | 7.56:1 ✅ |
  | comic | 5.91:1 ✅ | 7.62:1 ✅ |
  | neo | 6.73:1 ✅ | 9.70:1 ✅ |
  | pastelKids | 5.25:1 ✅ | 7.59:1 ✅ |

  All 7 themes now clear WCAG AA with margin (minimum 6.97:1, Dark). Computed via the standard WCAG relative-luminance formula against each theme's actual shipped hex values in `src/theme/themes/*.ts` (verified at commit `f719a97`), not estimated.
- **Button shape**: `minHeight: 48`, `borderRadius: theme.radius.md` (18), `paddingVertical: theme.spacing.sm`, `paddingHorizontal: theme.spacing.md`, icon+label centered horizontally with `theme.spacing.xs` gap. Per NFR-ACC-004 (Stage 4a §3), the two outcomes are always distinguished by icon+label together, never by color alone — satisfied by construction since both buttons always render icon+label.
- **"Bỏ qua" skip action**: `Pressable` below the two buttons, `AppText variant="label" color="muted"`, centered, no background/border — low emphasis by design (Stage 4a wireframe). `minHeight: 48` touch target via padding even though the text itself is short, per the responsive-rules floor.
- **Disabled state**: while a rating write is in flight or retrying (§1.5 of Stage 4a), all three actions (`Nhớ`/`Chưa nhớ`/`Bỏ qua`) get `opacity: theme.states.disabledOpacity` and become non-interactive — prevents a double-submit against the atomic rating transaction (FR-SRS-003).
- **Accessibility labels**: `Nhớ từ này` / `Chưa nhớ từ này` per VIB-129 §5 suggested spoken labels (override the visible short labels via `accessibilityLabel`, keep visible text short).

### 2.3 `Banner`

Used by SCR-05 (persistent, pinned below header) and SCR-07 (static summary line). Resolves the "ErrorCard variant vs. new component" open call from Stage 4a §3.

```ts
type Props = {
  message: string;
  icon?: HandoffIconName; // default: 'info'
};
```

`DECISION`: build as a small new component, not an `ErrorCard` prop variant.

Rationale: `ErrorCard` (`src/components/ErrorCard.tsx`) is bound to error/danger semantics — `theme.colors.secondaryContainer` (coral) background, `AppText color="danger"`, and an `onRetry` affordance. The capped-queue message is not an error: it is expected, informational, and has no action to retry. Stretching `ErrorCard` for this case would (a) visually flag "something went wrong" on a habit-forming feature where users should feel good about finishing a session, contradicting the reassuring tone Stage 4b explicitly chose for "lần ôn sau" copy, and (b) leave an irrelevant `onRetry?` prop on the call site. A ~15-line component is cheaper than that ambiguity.

- **Visual**: `flexDirection: 'row'`, `alignItems: 'center'`, `gap: theme.spacing.sm`, `paddingVertical: theme.spacing.sm`, `paddingHorizontal: theme.spacing.lg`. Background `theme.colors.tertiarySoft` (soft gold — the theme's existing "informational" register, distinct from `surface`/`primary`/`danger`), icon colored `theme.colors.onTertiaryContainer`, text `AppText variant="label"` (14sp/18 line-height, per `theme.typography.presets.label`) with `style={{color: theme.colors.onTertiaryContainer}}` (same pattern `Chip.tsx` uses to override `AppText`'s fixed color-token set for a non-standard tone). Allow wrapping to 2 lines (`RISK`, VIB-129 §5 — carry-over strings run long); never truncate.

  `DECISION` (round 2, fixes Stage 7 M2): `label` (14sp) is the one size for every `Banner` instance, SCR-05's persistent strip and SCR-07's inline summary line alike — there is no smaller/`caption` (12sp) variant. The round-1 HTML handoff had drifted to 12px in both screen-level mocks while the component showcase correctly used 14px; corrected in the HTML (§4.3, §4.5) to match the spec.
- **Placement on SCR-05**: pinned full-width strip directly below the header, no radius (edge-to-edge), non-dismissible — matches the wireframe's persistent-banner intent.
- **Placement on SCR-07**: same component, rendered inline in the summary card's flow (inherits the card's radius via clipping/margin, not edge-to-edge) — the visual difference is layout context, not a variant prop.
- **Non-dismissible by design**: no close icon, no `onDismiss` — both instances show only when the capped-queue condition is true and disappear when the parent stops rendering them, per Stage 4a §1.3/§4.3/§4.6.

---

## 3. Icon additions

Add to `HANDOFF_ICONS` in `src/components/icons/iconRegistry.ts`:

```ts
'check_circle',
'refresh',
```

- `refresh` needs no alias — the default `name.replace(/_/g, '-')` already yields `refresh`, a valid `MaterialIcons` glyph.
- `check_circle` needs no alias either — the default replace yields `check-circle`, a valid `MaterialIcons` glyph. No `ICON_ALIASES`/`ICON_FALLBACKS` entry required for either.

`RISK` (engineering, per the file's own header comment): after adding these names, run `npm run icons:subset` then `npm run assets:link` before the icons render — this is a build step, not a design decision, flagging so it isn't missed during implementation.

---

## 4. D6 implementation note — first-save disclosure acknowledgement flag

`DECISION` carried forward from Gate 2 (VIB-130 D6, approved Option A — blocking dialog): the one-time "Đã hiểu"/"Huỷ lưu" dialog must not re-show after the first acceptance. This needs a persisted local boolean flag.

`FACT`: the codebase already has exactly this shape for a different one-time-preference case — `src/theme/themeStorage.ts` persists the selected theme ID via `@react-native-async-storage/async-storage` with a best-effort try/catch (failure never crashes the app). Recommend the identical pattern for the flashcard disclosure flag: a small `flashcardStorage.ts` (or equivalent) exporting `saveFirstSaveAck()` / `getFirstSaveAck()` against a dedicated key (e.g. `flashcard_local_data_ack`), same try/catch-and-ignore shape as `themeStorage.ts`. This is a single boolean flag, not saved-lesson data, so it does not conflict with `04-html-handoff-to-code-spec.md §11`'s "no `AsyncStorage`/`MMKV` for saved lessons" rule (that rule targets lesson storage, which is SQLite-backed via `LessonRepository`).

No new dependency — `@react-native-async-storage/async-storage` is already in use.

---

## 5. Motion spec

Per L3, this is implementation-ready text spec only (trigger / duration / easing / properties / reduce-motion), for Reanimated. No motion has been "designed" beyond what's specified here.

### 5.1 Card flip (`FlipCard`, SCR-03 and SCR-05)

- **Trigger**: tap on the card (front or back face).
- **Duration**: 350ms.
- **Easing**: `Easing.inOut(Easing.cubic)`.
- **Properties**: `rotateY` interpolated 0deg → 180deg on the front-face layer; back-face layer counter-rotated 180deg → 360deg, both layers absolutely stacked with `backfaceVisibility: 'hidden'` so only one face is visible at a time; no separate opacity cross-fade needed if `backfaceVisibility` is used correctly.
- **Reduce-motion**: skip the 3D rotation. Swap front/back content with a 150ms opacity cross-fade instead (`Easing.linear`), or an instant swap if `prefers-reduced-motion` maps to zero-duration in the app's motion config.

### 5.2 Rating button press feedback (`RatingControl`)

- **Trigger**: press-in / press-out on the "Nhớ" or "Chưa nhớ" button.
- **Duration**: 100ms press-in, 100ms press-out.
- **Easing**: `Easing.linear`.
- **Properties**: `opacity` → `theme.states.pressedOpacity` (0.85) on press-in, back to 1 on press-out; `scale` 1 → 0.97 on press-in, back to 1 on press-out.
- **Reduce-motion**: opacity change only, no `scale` transform.

### 5.3 Card-to-card advance (SCR-05, after a rating write succeeds or skip is tapped)

- **Trigger**: successful rating write, or skip action, advancing to the next card in the session.
- **Duration**: 220ms exit, 220ms enter (sequential, not overlapping, to avoid a jarring double-card moment).
- **Easing**: `Easing.out(Easing.quad)` for exit, `Easing.in(Easing.quad)` for enter.
- **Properties**: outgoing `FlipCard` — `translateX` 0 → -40, `opacity` 1 → 0; incoming `FlipCard` — `translateX` 40 → 0, `opacity` 0 → 1. `flipped` resets to `false` before the enter animation starts.
- **Reduce-motion**: cross-fade only (`opacity`), no `translateX`.

### 5.4 Capped-queue banner entrance (`Banner`, SCR-05)

- **Trigger**: SCR-05 mounts with the capped-queue condition already true (banner is not something that animates in mid-session — it's known at session start).
- **Duration**: 200ms.
- **Easing**: `Easing.out(Easing.quad)`.
- **Properties**: `opacity` 0 → 1 only. Do not animate height/layout — the banner's presence should not cause the card below it to visibly jump.
- **Reduce-motion**: no animation, banner appears instantly at full opacity.

### 5.5 Session Summary entrance (SCR-07)

- **Trigger**: screen mounts (arrived via `navigation.replace`, §1.4 of Stage 4a).
- **Duration**: 400ms.
- **Easing**: spring (`damping: 14, stiffness: 120` — Reanimated `withSpring` defaults in that range).
- **Properties**: `scale` 0.8 → 1 and `opacity` 0 → 1 on the completion medallion/emoji element only; surrounding text is static.
- **Reduce-motion**: static 150ms `opacity` fade-in only, no `scale`/spring.

### 5.6 First-save disclosure dialog presentation

- **Trigger**: user's first flashcard save is about to commit (before the write, per D6 — blocking).
- **Duration**: 250ms.
- **Easing**: `Easing.out(Easing.quad)`.
- **Properties**: `opacity` 0 → 1 and `scale` 0.95 → 1 on the dialog container (centered modal, not a bottom sheet — the copy is a title + body + two buttons, no sheet-specific affordance was specified).
- **Reduce-motion**: `opacity`-only fade, no `scale`.

### 5.7 Rating-write error appearance (`ErrorCard`, SCR-05 — reused as-is per Stage 4a §1.5)

- **Trigger**: atomic rating write fails.
- **Duration**: 200ms.
- **Easing**: `Easing.out(Easing.quad)`.
- **Properties**: `opacity` 0 → 1 and `translateY` -8 → 0, as the `ErrorCard` is inserted above the (now disabled) `RatingControl`.
- **Reduce-motion**: `opacity`-only.

---

## 6. Engineering notes carried into handoff (non-design, flagged for implementation)

- **D6 ack flag** — §4 above.
- **Icon subset build step** — §3 above.
- **DR-02** (inherited, VIB-125): the new `review_schedule`/`review_sessions` tables ride the same migration layer that had a SQLite syntax fix (`6e1f830`). This UI spec does not imply any data shape beyond what SCR-05's rating control needs (`outcome: 'remembered' | 'forgot'`, plus skip = no write) — confirm with the schema owner before implementation that this 2-outcome shape matches the actual migration.
- **Rating-write failure retry** reuses `ErrorCard` exactly as shipped today (`message`, `onRetry`, `retryLabel` props) — no changes needed to that component.

---

## 7. Traceability (additions to Stage 4a §7)

| Requirement | Screen(s) | Resolution in this stage |
|---|---|---|
| FR-FLASH-003/004 | SCR-02, SCR-03 | `FlipCard` spec finalized (§2.1) |
| FR-SRS-001/002/003 | SCR-05 | `RatingControl` spec finalized (§2.2); reuses `ErrorCard` unchanged |
| FR-REVIEW-001..003 | SCR-05, SCR-07 | `Banner` component finalized, resolves open gap-list call (§2.3) |
| A-02 / D6 | Save flow (SCR-01a/b, SCR-03) | Ack-flag persistence approach specified (§4) |

---

**Self-status:** Per Design Team Sub-issue Status Rule, VIB-131 is self-closed to `done` on submission.
