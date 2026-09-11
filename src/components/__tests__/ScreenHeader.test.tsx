import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import {ScreenHeader} from '../ScreenHeader';

async function renderHeader(title: string) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>
          <ScreenHeader onBack={() => {}} title={title} />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  return tree;
}

describe('ScreenHeader', () => {
  it('allows lesson titles to scale and wrap at large text sizes', async () => {
    const tree = await renderHeader(
      'Bài học tiếng Anh với tiêu đề rất dài để kiểm tra Dynamic Type',
    );

    const title = tree.root.findAll(
      node =>
        node.type === Text &&
        typeof node.props.children === 'string' &&
        node.props.children.includes('Bài học tiếng Anh'),
    )[0];

    expect(title.props.numberOfLines).toBe(2);
    expect(title.props.adjustsFontSizeToFit).toBe(true);
    expect(title.props.minimumFontScale).toBe(0.85);
    expect(title.props.maxFontSizeMultiplier).toBe(1.5);
  });

  it('uses a flexible header height instead of a fixed 56px cap', async () => {
    const tree = await renderHeader('Ngắn');

    const {StyleSheet} = require('react-native');
    const headerStyle = StyleSheet.flatten(
      tree.root.findByProps({testID: 'screen-header'}).props.style,
    );
    expect(headerStyle.minHeight).toBe(56);
    expect(headerStyle.height).toBeUndefined();
  });
});
