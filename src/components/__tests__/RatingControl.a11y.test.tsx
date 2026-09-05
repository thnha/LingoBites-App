import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {RatingControl} from '../RatingControl';
import {AppThemeProvider} from '../../theme';
import {FeatureFlagProvider} from '../../release';
import {
  hasAccessibilityLabel,
  hasAccessibilityRole,
  hasIconAndTextLabel,
} from '../../../test-utils/a11yTestUtils';

const RATING_BUTTONS = [
  {testID: 'rating-forgot', label: 'Không nhớ - ôn lại sau 1 ngày'},
  {testID: 'rating-hard', label: 'Nhớ nhưng khó - ôn sớm hơn'},
  {testID: 'rating-good', label: 'Nhớ - lên lịch ôn sau'},
  {testID: 'rating-easy', label: 'Rất dễ - lên lịch ôn lâu hơn'},
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
      <RatingControl onRate={mockHandlers.onRate} onSkip={mockHandlers.onSkip} />,
    );

    const skipButton = tree.root.findByProps({testID: 'rating-skip'});
    expect(hasAccessibilityLabel(skipButton)).toBe(true);
    expect(skipButton.props.accessibilityLabel).toBe('Bỏ qua thẻ này');

    for (const button of RATING_BUTTONS) {
      const node = tree.root.findByProps({testID: button.testID});
      expect(hasAccessibilityLabel(node)).toBe(true);
      expect(node.props.accessibilityLabel).toBe(button.label);
    }
  });

  it('has accessibility roles for all buttons', async () => {
    const tree = await render(
      <RatingControl onRate={mockHandlers.onRate} onSkip={mockHandlers.onSkip} />,
    );

    const skipButton = tree.root.findByProps({testID: 'rating-skip'});
    expect(hasAccessibilityRole(skipButton)).toBe(true);
    expect(skipButton.props.accessibilityRole).toBe('button');

    for (const button of RATING_BUTTONS) {
      const node = tree.root.findByProps({testID: button.testID});
      expect(hasAccessibilityRole(node)).toBe(true);
      expect(node.props.accessibilityRole).toBe('button');
    }
  });

  it('has icon+text label pairing for all buttons (NFR-ACC-004)', async () => {
    const tree = await render(
      <RatingControl onRate={mockHandlers.onRate} onSkip={mockHandlers.onSkip} />,
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

    for (const button of RATING_BUTTONS) {
      const node = tree.root.findByProps({testID: button.testID});
      expect(node.props.disabled).toBe(true);
    }
  });
});
