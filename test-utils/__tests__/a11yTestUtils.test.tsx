import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text, View} from 'react-native';
import {hasIconAndTextLabel} from '../a11yTestUtils';
import {MaterialIcon} from '../../src/components/MaterialIcon';
import {AppThemeProvider} from '../../src/theme';
import {FeatureFlagProvider} from '../../src/release';

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

describe('a11yTestUtils', () => {
  it('detects React Native text children inside icon buttons', async () => {
    const tree = await render(
      <View testID="icon-text-button">
        <MaterialIcon name="check_circle" />
        <Text>Đã nhớ</Text>
      </View>,
    );

    expect(hasIconAndTextLabel(tree.root).hasText).toBe(true);
  });
});
