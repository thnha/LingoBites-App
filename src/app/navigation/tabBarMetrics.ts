/**
 * Shared metrics for the floating bottom tab bar (SETE-214, Option C v3).
 *
 * The bar is a floating pill: horizontal margin 14–16px, 12px above the
 * bottom safe-area, ~60px visual height (container vertical padding 5px,
 * item padding 4–5px, icon 21px, label 10.5px/13px).
 *
 * Screens with feeds under the tabs must reserve
 * `getFloatingTabBarClearance(insets.bottom)` as bottom padding so the
 * floating pill never covers the last row.
 */
import {useContext} from 'react';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
export const FLOATING_TAB_BAR_HEIGHT = 60;
// Small lift above the bottom safe-area so the pill breathes —
// per SETE-214 review feedback.
export const FLOATING_TAB_BAR_BOTTOM_GAP = 8;
export const FLOATING_TAB_BAR_HORIZONTAL_MARGIN = 16;
/** Breathing room between the last feed row and the floating pill. */
export const FLOATING_TAB_BAR_CONTENT_GAP = 16;

export function getFloatingTabBarClearance(bottomInset: number): number {
  return (
    FLOATING_TAB_BAR_HEIGHT +
    FLOATING_TAB_BAR_BOTTOM_GAP +
    bottomInset +
    FLOATING_TAB_BAR_CONTENT_GAP
  );
}

/**
 * Safe `useSafeAreaInsets().bottom`-based clearance for feed screens.
 * Reads `SafeAreaInsetsContext` directly so screens render outside a
 * `SafeAreaProvider` (e.g. Jest) fall back to a zero inset instead of
 * throwing like `useSafeAreaInsets()` does.
 */
export function useFloatingTabBarClearance(): number {
  const insets = useContext(SafeAreaInsetsContext);
  return getFloatingTabBarClearance(insets?.bottom ?? 0);
}

/**
 * Applies an alpha channel to an `#rgb` / `#rrggbb` theme color.
 * Falls back to the solid color when the value cannot be parsed, so
 * non-hex theme tokens keep rendering instead of breaking.
 */
export function withAlpha(color: string, alpha: number): string {
  const hex = color.startsWith('#') ? color.slice(1) : color;
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map(part => part + part)
          .join('')
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return color;
  }
  const red = parseInt(full.slice(0, 2), 16);
  const green = parseInt(full.slice(2, 4), 16);
  const blue = parseInt(full.slice(4, 6), 16);
  return `rgba(${red},${green},${blue},${alpha})`;
}
