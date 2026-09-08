import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {RatingControl} from '../RatingControl';
import {AppThemeProvider} from '../../theme';
import {FeatureFlagProvider} from '../../release';
import {
  findMaskedContent,
  hasIconAndTextLabel,
} from '../../../test-utils/a11yTestUtils';

const RATING_BUTTONS = [
  {testID: 'rating-remembered', label: 'Đã nhớ - lên lịch ôn sau'},
  {testID: 'rating-forgot', label: 'Không nhớ - ôn lại sau 1 ngày'},
];

async function render(ui: React.ReactElement) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>{ui}</AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  return tree;
}

describe('RatingControl - Accessibility (NFR-ACC-004)', () => {
  const mockHandlers = {
    onRate: jest.fn(),
    onSkip: jest.fn(),
  };

  it('has accessibility labels for all buttons', async () => {
    const tree = await render(
      <RatingControl
        onRate={mockHandlers.onRate}
        onSkip={mockHandlers.onSkip}
      />,
    );

    const skipButton = tree.root.findByProps({testID: 'rating-skip'});
    expect(skipButton.props.accessibilityLabel).toBe('Bỏ qua thẻ này');

    for (const button of RATING_BUTTONS) {
      const node = tree.root.findByProps({testID: button.testID});
      expect(node.props.accessibilityLabel).toBe(button.label);
    }
  });

  it('has no unreviewed accessibility-label candidates beyond the known paraphrase (SETE-122)', async () => {
    const tree = await render(
      <RatingControl
        onRate={mockHandlers.onRate}
        onSkip={mockHandlers.onSkip}
      />,
    );

    // findMaskedContent can't judge semantic equivalence: it flags any
    // visible text that isn't a literal substring of the accessibilityLabel.
    // The "forgot" button intentionally paraphrases "Quên" as "Không nhớ -
    // ôn lại sau 1 ngày" (rating.forgot_label vs rating.forgot_a11y in
    // src/i18n/vi.json) — a richer description, not lost content, confirmed
    // by manual reading during the SETE-122 audit. If this list grows
    // beyond that one known case, a new candidate needs the same manual
    // review before being added here.
    const masked = findMaskedContent(tree.root);
    expect(masked.map(node => node.label)).toEqual([
      'Không nhớ - ôn lại sau 1 ngày',
    ]);
  });

  it('has accessibility roles for all buttons', async () => {
    const tree = await render(
      <RatingControl
        onRate={mockHandlers.onRate}
        onSkip={mockHandlers.onSkip}
      />,
    );

    const skipButton = tree.root.findByProps({testID: 'rating-skip'});
    expect(skipButton.props.accessibilityRole).toBe('button');

    for (const button of RATING_BUTTONS) {
      const node = tree.root.findByProps({testID: button.testID});
      expect(node.props.accessibilityRole).toBe('button');
    }
  });

  it('has icon+text label pairing for all buttons (NFR-ACC-004)', async () => {
    const tree = await render(
      <RatingControl
        onRate={mockHandlers.onRate}
        onSkip={mockHandlers.onSkip}
      />,
    );

    const skipButton = tree.root.findByProps({testID: 'rating-skip'});
    const skipCheck = hasIconAndTextLabel(skipButton);
    expect(skipCheck.passes).toBe(true);
    expect(skipCheck.hasIcon).toBe(true);
    expect(skipCheck.hasText).toBe(true);

    for (const button of RATING_BUTTONS) {
      const node = tree.root.findByProps({testID: button.testID});
      const check = hasIconAndTextLabel(node);
      expect(check.passes).toBe(true);
      expect(check.hasIcon).toBe(true);
      expect(check.hasText).toBe(true);
    }
  });

  it('respects disabled state for accessibility', async () => {
    const tree = await render(
      <RatingControl
        disabled={true}
        onRate={mockHandlers.onRate}
        onSkip={mockHandlers.onSkip}
      />,
    );

    const skipButton = tree.root.findByProps({testID: 'rating-skip'});
    expect(skipButton.props.disabled).toBe(true);
    expect(skipButton.props.accessibilityState).toEqual({disabled: true});

    for (const button of RATING_BUTTONS) {
      const node = tree.root.findByProps({testID: button.testID});
      expect(node.props.disabled).toBe(true);
      expect(node.props.accessibilityState).toEqual({disabled: true});
    }
  });
});
