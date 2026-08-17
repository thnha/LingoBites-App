import {themes} from '../themeRegistry';
import {checkContrast} from '../../../test-utils/a11yTestUtils';

/**
 * WCAG AA Contrast Compliance Tests for All Themes
 *
 * Tests verify that all flashcard UI components meet WCAG AA contrast requirements
 * across all 7 themes: default, dark, pastel-kids, core, neo, comic, cartoon
 */

describe('Flashcard UI - WCAG AA Contrast Compliance', () => {
  const themeIds = Object.keys(themes) as Array<keyof typeof themes>;

  describe.each(themeIds)('Theme: %s', themeId => {
    const theme = themes[themeId];

    describe('RatingControl Buttons', () => {
      it('Remembered button: icon+text on accentSoft background', () => {
        // RatingControl uses accentSoft background with primary color for icon/text
        const result = checkContrast(theme.colors.primary, theme.colors.accentSoft);

        expect(result.passes).toBe(true);
        expect(result.level).toMatch(/^(AA|AAA)$/);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });

      it('Forgot button: icon+text on surface background', () => {
        // Forgot button uses surface background with text.secondary
        const result = checkContrast(theme.colors.text.secondary, theme.colors.surface);

        expect(result.passes).toBe(true);
        expect(result.level).toMatch(/^(AA|AAA)$/);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });

      it('Skip button: icon+text on surface background', () => {
        // Skip button uses surface background with text.secondary
        const result = checkContrast(theme.colors.text.secondary, theme.colors.surface);

        expect(result.passes).toBe(true);
        expect(result.level).toMatch(/^(AA|AAA)$/);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });

      it('Remembered button border on accentSoft background', () => {
        // Border uses primary color on accentSoft background
        const result = checkContrast(theme.colors.primary, theme.colors.accentSoft);

        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(3); // Borders need 3:1 for WCAG AA
      });

      it('Forgot/Skip button border on surface background', () => {
        // Border uses border color on surface background
        const result = checkContrast(theme.colors.border, theme.colors.surface);

        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(3); // Borders need 3:1 for WCAG AA
      });
    });

    describe('Banner Text', () => {
      it('Info variant: text on accentSoft background', () => {
        // Banner info variant uses text.secondary on accentSoft background
        const result = checkContrast(theme.colors.text.secondary, theme.colors.accentSoft);

        expect(result.passes).toBe(true);
        expect(result.level).toMatch(/^(AA|AAA)$/);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });

      it('Info variant: icon on accentSoft background', () => {
        // Banner info variant uses primary color for icon on accentSoft background
        const result = checkContrast(theme.colors.primary, theme.colors.accentSoft);

        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(3); // Icons need 3:1 for WCAG AA
      });

      it('Neutral variant: text on surfaceMuted background', () => {
        // Banner neutral variant uses text.secondary on surfaceMuted background
        const result = checkContrast(theme.colors.text.secondary, theme.colors.surfaceMuted);

        expect(result.passes).toBe(true);
        expect(result.level).toMatch(/^(AA|AAA)$/);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });

      it('Neutral variant: icon on surfaceMuted background', () => {
        // Banner neutral variant uses text.secondary for icon on surfaceMuted background
        const result = checkContrast(theme.colors.text.secondary, theme.colors.surfaceMuted);

        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(3); // Icons need 3:1 for WCAG AA
      });
    });

    describe('FlipCard Text', () => {
      it('Primary text on card background', () => {
        // FlipCard uses text.primary on card background
        const result = checkContrast(
          theme.colors.text.primary,
          theme.components.card.background,
        );

        expect(result.passes).toBe(true);
        expect(result.level).toMatch(/^(AA|AAA)$/);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });

      it('Secondary text (meaning) on card background', () => {
        // FlipCard meaning uses primary color on card background
        const result = checkContrast(theme.colors.primary, theme.components.card.background);

        expect(result.passes).toBe(true);
        expect(result.level).toMatch(/^(AA|AAA)$/);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });

      it('Muted text (hint) on card background', () => {
        // FlipCard hint uses text.muted on card background
        const result = checkContrast(theme.colors.text.muted, theme.components.card.background);

        expect(result.passes).toBe(true);
        expect(result.level).toMatch(/^(AA|AAA)$/);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });

      it('Border on background when flipped', () => {
        // FlipCard flipped state uses primary border on card background
        const result = checkContrast(theme.colors.primary, theme.components.card.background);

        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(3); // Borders need 3:1 for WCAG AA
      });

      it('Border on background when not flipped', () => {
        // FlipCard normal state uses border color on card background
        const result = checkContrast(theme.colors.border, theme.components.card.background);

        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(3); // Borders need 3:1 for WCAG AA
      });
    });

    describe('Summary Screen', () => {
      it('Summary title on background', () => {
        // Summary screen title uses text.primary on background
        const result = checkContrast(theme.colors.text.primary, theme.colors.background);

        expect(result.passes).toBe(true);
        expect(result.level).toMatch(/^(AA|AAA)$/);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });

      it('Stats count text on card background', () => {
        // Stats numbers use text.primary on card background
        const result = checkContrast(
          theme.colors.text.primary,
          theme.components.card.background,
        );

        expect(result.passes).toBe(true);
        expect(result.level).toMatch(/^(AA|AAA)$/);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });

      it('Stats label text on card background', () => {
        // Stats labels use text.secondary on card background
        const result = checkContrast(
          theme.colors.text.secondary,
          theme.components.card.background,
        );

        expect(result.passes).toBe(true);
        expect(result.level).toMatch(/^(AA|AAA)$/);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });
});
