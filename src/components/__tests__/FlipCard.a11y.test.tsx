import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FlipCard} from '../FlipCard';
import {AppThemeProvider} from '../../theme';
import {FeatureFlagProvider} from '../../release';
import {
  hasAccessibilityLabel,
  hasAccessibilityRole,
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

describe('FlipCard - Accessibility', () => {
  it('has accessibility label that changes based on flip state', async () => {
    const tree = await render(
      <FlipCard
        back={<Text>Back content</Text>}
        flipped={false}
        front={<Text>Front content</Text>}
        onFlip={jest.fn()}
      />,
    );

    const cardButton = tree.root.findByProps({testID: 'flip-card'});
    expect(hasAccessibilityLabel(cardButton)).toBe(true);
    expect(cardButton.props.accessibilityLabel).toBe('Mặt trước flashcard');

    // Re-render with flipped=true
    const flippedTree = await render(
      <FlipCard
        back={<Text>Back content</Text>}
        flipped={true}
        front={<Text>Front content</Text>}
        onFlip={jest.fn()}
      />,
    );

    const flippedCardButton = flippedTree.root.findByProps({testID: 'flip-card'});
    expect(hasAccessibilityLabel(flippedCardButton)).toBe(true);
    expect(flippedCardButton.props.accessibilityLabel).toBe('Mặt sau flashcard');
  });

  it('has accessibility hint for flip action', async () => {
    const tree = await render(
      <FlipCard
        back={<Text>Back content</Text>}
        flipped={false}
        front={<Text>Front content</Text>}
        onFlip={jest.fn()}
      />,
    );

    const cardButton = tree.root.findByProps({testID: 'flip-card'});
    expect(cardButton.props.accessibilityHint).toBe('Chạm để lật thẻ');
  });

  it('has accessibility role set to button', async () => {
    const tree = await render(
      <FlipCard
        back={<Text>Back content</Text>}
        flipped={false}
        front={<Text>Front content</Text>}
        onFlip={jest.fn()}
      />,
    );

    const cardButton = tree.root.findByProps({testID: 'flip-card'});
    expect(hasAccessibilityRole(cardButton)).toBe(true);
    expect(cardButton.props.accessibilityRole).toBe('button');
  });

  it('triggers onFlip when pressed (supports screen reader double-tap)', async () => {
    const onFlip = jest.fn();
    const tree = await render(
      <FlipCard
        back={<Text>Back content</Text>}
        flipped={false}
        front={<Text>Front content</Text>}
        onFlip={onFlip}
      />,
    );

    const cardButton = tree.root.findByProps({testID: 'flip-card'});
    await act(async () => {
      cardButton.props.onPress();
    });

    expect(onFlip).toHaveBeenCalledTimes(1);
  });
});
