/**
 * Accessibility testing utilities for React Native components
 */

import type {ReactTestInstance} from 'react-test-renderer';

function getComponentName(type: ReactTestInstance['type']): string | null {
  if (typeof type === 'string') {
    return type;
  }
  if (typeof type === 'function') {
    return type.displayName ?? type.name ?? null;
  }
  return null;
}

/**
 * Components React Native treats as `accessible: true` by default even when
 * the prop isn't set explicitly (see node_modules/react-native/Libraries/Components/Pressable/Pressable.js
 * and the Touchable* wrappers built on the same default).
 */
const IMPLICITLY_ACCESSIBLE_COMPONENTS = new Set([
  'Pressable',
  'TouchableOpacity',
  'TouchableHighlight',
  'TouchableWithoutFeedback',
  'TouchableNativeFeedback',
]);

function isAccessibleNode(instance: ReactTestInstance): boolean {
  if (instance.props.accessible === false) {
    return false;
  }
  if (instance.props.accessible === true) {
    return true;
  }
  const name = getComponentName(instance.type);
  return name !== null && IMPLICITLY_ACCESSIBLE_COMPONENTS.has(name);
}

function isHiddenFromAccessibility(instance: ReactTestInstance): boolean {
  return (
    instance.props.accessibilityElementsHidden === true ||
    instance.props.importantForAccessibility === 'no-hide-descendants'
  );
}

function childInstances(instance: ReactTestInstance): ReactTestInstance[] {
  return (instance.children ?? []).filter(
    (child): child is ReactTestInstance =>
      typeof child === 'object' && child !== null,
  );
}

/**
 * Flattens the string/number leaves rendered under a Text/AppText node,
 * e.g. `<Text>{'a'}{1}</Text>` -> "a1".
 */
function extractStringContent(instance: ReactTestInstance): string {
  const parts: string[] = [];
  function walk(node: ReactTestInstance) {
    (node.children ?? []).forEach(child => {
      if (typeof child === 'string' || typeof child === 'number') {
        parts.push(String(child));
      } else if (child !== null && typeof child === 'object') {
        walk(child);
      }
    });
  }
  walk(instance);
  return parts.join('');
}

/**
 * Collects every Text/AppText leaf under `instance`, without regard to
 * accessibility grouping. Used by `findMaskedContent` to see everything a
 * sighted user can read, so it can be compared against what a static
 * accessibilityLabel actually announces.
 */
function collectAllTextLeaves(instance: ReactTestInstance): string[] {
  const texts: string[] = [];
  function walk(node: ReactTestInstance) {
    const name = getComponentName(node.type);
    if (name === 'Text' || name === 'AppText') {
      const content = extractStringContent(node);
      if (content.trim().length > 0) {
        texts.push(content);
      }
      return;
    }
    childInstances(node).forEach(walk);
  }
  walk(instance);
  return texts;
}

/**
 * Mirrors RN's announcement grouping: a nested node that is itself
 * accessible with its own label contributes that label (not its children's
 * text) to the ancestor's announced content.
 */
function collectAnnouncedDescendantText(instance: ReactTestInstance): string {
  return childInstances(instance)
    .map(child => {
      if (isHiddenFromAccessibility(child)) {
        return '';
      }
      const name = getComponentName(child.type);
      if (name === 'Text' || name === 'AppText') {
        return extractStringContent(child);
      }
      const label = child.props.accessibilityLabel;
      if (isAccessibleNode(child) && typeof label === 'string' && label) {
        return label;
      }
      return collectAnnouncedDescendantText(child);
    })
    .filter(text => text.trim().length > 0)
    .join(' ');
}

/**
 * Simulates the string a screen reader announces for `instance`, following
 * React Native's grouping rules:
 * 1. `accessible === true` + `accessibilityLabel` -> the label REPLACES all
 *    descendant content.
 * 2. `accessible === true` + no label -> descendant Text content is
 *    concatenated in tree order.
 * 3. `accessibilityElementsHidden` / `importantForAccessibility="no-hide-descendants"`
 *    -> announces nothing.
 * 4. `accessibilityValue.text`, if present, is appended.
 */
export function getAnnouncedText(instance: ReactTestInstance): string {
  if (isHiddenFromAccessibility(instance)) {
    return '';
  }

  const label = instance.props.accessibilityLabel;
  const hasLabel = typeof label === 'string' && label.length > 0;
  const base =
    isAccessibleNode(instance) && hasLabel
      ? label
      : collectAnnouncedDescendantText(instance);

  const value = instance.props.accessibilityValue?.text;
  const hasValue = typeof value === 'string' && value.length > 0;
  return hasValue ? [base, value].filter(Boolean).join(' ') : base;
}

export interface MaskedNode {
  path: string;
  label: string;
  maskedText: string[];
}

/**
 * Scans the tree under `root` for nodes where a static accessibilityLabel
 * silently swallows real, visible text content — the FlipCard bug class
 * (SETE-122). A node is reported when it is accessible, has a non-empty
 * accessibilityLabel, AND has at least one Text/AppText descendant whose
 * content is not already a substring of that label.
 */
export function findMaskedContent(root: ReactTestInstance): MaskedNode[] {
  const results: MaskedNode[] = [];

  function visit(instance: ReactTestInstance, path: string) {
    const name = getComponentName(instance.type) ?? 'Unknown';
    const currentPath = `${path}/${name}`;

    if (isAccessibleNode(instance)) {
      // An accessible node is an accessibility boundary: RN exposes it as
      // one opaque unit to screen readers, so descendants (including the
      // wrapper Views Pressable/Touchable* render internally with the same
      // forwarded props) are never independently reachable. Recursing past
      // it would re-report the same masking once per wrapper layer.
      const label = instance.props.accessibilityLabel;
      const hasLabel = typeof label === 'string' && label.length > 0;
      if (hasLabel) {
        // Case-insensitive: screen readers pronounce text the same
        // regardless of capitalization, so a label that re-cases the same
        // word mid-sentence (e.g. "Nhớ" -> "Đã nhớ - ...") isn't masking.
        const lowerLabel = label.toLowerCase();
        const maskedText = collectAllTextLeaves(instance).filter(
          text => !lowerLabel.includes(text.toLowerCase()),
        );
        if (maskedText.length > 0) {
          results.push({path: currentPath, label, maskedText});
        }
      }
      return;
    }

    childInstances(instance).forEach(child => visit(child, currentPath));
  }

  visit(root, '');
  return results;
}

/**
 * SETE-122 Việc 6.2 (warning mode): logs a readable report via
 * console.warn when `findMaskedContent` finds candidates, but never throws
 * or fails the test. Intended for a global regression scan across
 * a11y-sensitive components — start in warning mode until Việc 5's known
 * candidates are cleaned up, then switch call sites to assert
 * `findMaskedContent(...)` is empty once they are.
 */
export function warnOnMaskedContent(
  root: ReactTestInstance,
  componentLabel: string,
): void {
  const masked = findMaskedContent(root);
  if (masked.length === 0) {
    return;
  }
  console.warn(
    `[a11y-masking] ${componentLabel}: ${masked.length} candidate(s) found\n` +
      masked
        .map(
          node =>
            `  - ${node.path}\n    label: "${
              node.label
            }"\n    masked text: ${node.maskedText
              .map(text => `"${text}"`)
              .join(', ')}`,
        )
        .join('\n'),
  );
}

/**
 * Checks if interactive component has both icon and text label (NFR-ACC-004)
 */
export function hasIconAndTextLabel(instance: ReactTestInstance): {
  hasIcon: boolean;
  hasText: boolean;
  passes: boolean;
} {
  let hasIcon = false;
  let hasText = false;

  // Recursively check children
  function checkChildren(node: ReactTestInstance) {
    if (!node) {
      return;
    }

    const componentName = getComponentName(node.type);

    // Check for MaterialIcon or any icon component
    if (componentName === 'MaterialIcon') {
      hasIcon = true;
    }

    // Check for AppText or Text with content
    if (
      (componentName === 'Text' || componentName === 'AppText') &&
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
export function getContrastRatio(
  foreground: string,
  background: string,
): number {
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
export function meetsWCAG_AA(
  ratio: number,
  largeText: boolean = false,
): boolean {
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standard
 * @param ratio - Contrast ratio
 * @param largeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns true if meets WCAG AAA standard
 */
export function meetsWCAG_AAA(
  ratio: number,
  largeText: boolean = false,
): boolean {
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
