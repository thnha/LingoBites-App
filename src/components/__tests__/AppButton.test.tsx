import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import {defaultThemeId, themes} from '@theme/themeRegistry';
import {AppButton} from '../AppButton';

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

describe('AppButton', () => {
  it('primary variant uses components.button.primary-accent background', async () => {
    const tree = await render(<AppButton title="Go" onPress={() => {}} />);
    const pressable = tree.root.findByProps({testID: 'app-button'});
    const flattened = Object.assign(
      {},
      ...[].concat(pressable.props.style({pressed: false})),
    );
    expect(flattened.backgroundColor).toBe(
      themes[defaultThemeId].components.button['primary-accent'].background,
    );
  });

  it('outline variant uses a border', async () => {
    const tree = await render(
      <AppButton title="Back" variant="outline" onPress={() => {}} />,
    );
    const pressable = tree.root.findByProps({testID: 'app-button'});
    const flattened = Object.assign(
      {},
      ...[].concat(pressable.props.style({pressed: false})),
    );
    expect(flattened.borderColor).toBe(
      themes[defaultThemeId].components.button.outline.border,
    );
    expect(flattened.borderWidth).toBe(2);
  });

  it('fires onPress', async () => {
    const onPress = jest.fn();
    const tree = await render(<AppButton title="Go" onPress={onPress} />);
    await act(async () => {
      tree.root.findByProps({testID: 'app-button'}).props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
