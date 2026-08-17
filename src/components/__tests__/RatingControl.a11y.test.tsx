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

    const rememberedButton = tree.root.findByProps({testID: 'rating-remembered'});
    const forgotButton = tree.root.findByProps({testID: 'rating-forgot'});
    const skipButton = tree.root.findByProps({testID: 'rating-skip'});

    expect(hasAccessibilityLabel(rememberedButton)).toBe(true);
    expect(hasAccessibilityLabel(forgotButton)).toBe(true);
    expect(hasAccessibilityLabel(skipButton)).toBe(true);

    expect(rememberedButton.props.accessibilityLabel).toBe('Đánh dấu đã nhớ');
    expect(forgotButton.props.accessibilityLabel).toBe('Đánh dấu chưa nhớ');
    expect(skipButton.props.accessibilityLabel).toBe('Bỏ qua thẻ này');
  });

  it('has accessibility roles for all buttons', async () => {
    const tree = await render(
      <RatingControl onRate={mockHandlers.onRate} onSkip={mockHandlers.onSkip} />,
    );

    const rememberedButton = tree.root.findByProps({testID: 'rating-remembered'});
    const forgotButton = tree.root.findByProps({testID: 'rating-forgot'});
    const skipButton = tree.root.findByProps({testID: 'rating-skip'});

    expect(hasAccessibilityRole(rememberedButton)).toBe(true);
    expect(hasAccessibilityRole(forgotButton)).toBe(true);
    expect(hasAccessibilityRole(skipButton)).toBe(true);

    expect(rememberedButton.props.accessibilityRole).toBe('button');
    expect(forgotButton.props.accessibilityRole).toBe('button');
    expect(skipButton.props.accessibilityRole).toBe('button');
  });

  it('has icon+text label pairing for all buttons (NFR-ACC-004)', async () => {
    const tree = await render(
      <RatingControl onRate={mockHandlers.onRate} onSkip={mockHandlers.onSkip} />,
    );

    const rememberedButton = tree.root.findByProps({testID: 'rating-remembered'});
    const forgotButton = tree.root.findByProps({testID: 'rating-forgot'});
    const skipButton = tree.root.findByProps({testID: 'rating-skip'});

    const rememberedCheck = hasIconAndTextLabel(rememberedButton);
    const forgotCheck = hasIconAndTextLabel(forgotButton);
    const skipCheck = hasIconAndTextLabel(skipButton);

    expect(rememberedCheck.passes).toBe(true);
    expect(rememberedCheck.hasIcon).toBe(true);
    expect(rememberedCheck.hasText).toBe(true);

    expect(forgotCheck.passes).toBe(true);
    expect(forgotCheck.hasIcon).toBe(true);
    expect(forgotCheck.hasText).toBe(true);

    expect(skipCheck.passes).toBe(true);
    expect(skipCheck.hasIcon).toBe(true);
    expect(skipCheck.hasText).toBe(true);
  });

  it('respects disabled state for accessibility', async () => {
    const tree = await render(
      <RatingControl
        disabled={true}
        onRate={mockHandlers.onRate}
        onSkip={mockHandlers.onSkip}
      />,
    );

    const rememberedButton = tree.root.findByProps({testID: 'rating-remembered'});
    const forgotButton = tree.root.findByProps({testID: 'rating-forgot'});
    const skipButton = tree.root.findByProps({testID: 'rating-skip'});

    expect(rememberedButton.props.disabled).toBe(true);
    expect(forgotButton.props.disabled).toBe(true);
    expect(skipButton.props.disabled).toBe(true);
  });
});
