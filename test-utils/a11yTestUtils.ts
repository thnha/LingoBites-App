/**
 * Accessibility testing utilities for React Native components
 */

import type {ReactTestInstance} from 'react-test-renderer';

/**
 * Checks if a component has proper accessibility label
 */
export function hasAccessibilityLabel(
  instance: ReactTestInstance,
): boolean {
  return (
    typeof instance.props.accessibilityLabel === 'string' &&
    instance.props.accessibilityLabel.length > 0
  );
}

/**
 * Checks if a component has proper accessibility role
 */
export function hasAccessibilityRole(
  instance: ReactTestInstance,
): boolean {
  return (
    typeof instance.props.accessibilityRole === 'string' &&
    instance.props.accessibilityRole.length > 0
  );
}

/**
 * Checks if interactive component has both icon and text label (NFR-ACC-004)
 */
export function hasIconAndTextLabel(
  instance: ReactTestInstance,
): {hasIcon: boolean; hasText: boolean; passes: boolean} {
  let hasIcon = false;
  let hasText = false;

  // Recursively check children
  function checkChildren(node: ReactTestInstance) {
    if (!node) {
      return;
    }

    // Check for MaterialIcon or any icon component
    if (
      typeof node.type === 'function' &&
      (node.type.name === 'MaterialIcon' || node.type.displayName === 'MaterialIcon')
    ) {
      hasIcon = true;
    }

    // Check for AppText or Text with content
    if (
      (node.type === 'Text' ||
        (typeof node.type === 'function' &&
          (node.type.name === 'AppText' || node.type.displayName === 'AppText'))) &&
      node.props.children
    ) {
      hasText = true;
    }

    if (node.children) {
      node.children.forEach(child => {
        if (typeof child === 'object' && child !== null) {
          checkChildren(child);
        }
      });
    }
  }

  checkChildren(instance);

  return {
    hasIcon,
    hasText,
    passes: hasIcon && hasText,
  };
}

/**
 * Calculate relative luminance for a color
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getRelativeLuminance(color: string): number {
  // Parse hex color
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(foreground: string, background: string): number {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard
 * @param ratio - Contrast ratio
 * @param largeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns true if meets WCAG AA standard
 */
export function meetsWCAG_AA(ratio: number, largeText: boolean = false): boolean {
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standard
 * @param ratio - Contrast ratio
 * @param largeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns true if meets WCAG AAA standard
 */
export function meetsWCAG_AAA(ratio: number, largeText: boolean = false): boolean {
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Verify contrast for a color pair and return detailed result
 */
export function checkContrast(
  foreground: string,
  background: string,
  options: {largeText?: boolean; minLevel?: 'AA' | 'AAA'} = {},
): {
  ratio: number;
  passes: boolean;
  level: 'AA' | 'AAA' | 'fail';
  foreground: string;
  background: string;
} {
  const {largeText = false, minLevel = 'AA'} = options;
  const ratio = getContrastRatio(foreground, background);
  const passesAA = meetsWCAG_AA(ratio, largeText);
  const passesAAA = meetsWCAG_AAA(ratio, largeText);

  const passes = minLevel === 'AAA' ? passesAAA : passesAA;
  const level = passesAAA ? 'AAA' : passesAA ? 'AA' : 'fail';

  return {
    ratio,
    passes,
    level,
    foreground,
    background,
  };
}
