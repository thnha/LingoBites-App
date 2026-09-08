import React from 'react';
import {StyleSheet} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import {themeIds, themes} from '@theme/themeRegistry';
import {ThemePicker} from '../ThemePicker';

async function render(releaseName: 'full-feature-showcase' | 'theme-release' | 'close-beta-1' | 'lingobites-mvp') {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider releaseName={releaseName}>
        <AppThemeProvider>
          <ThemePicker />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  await act(async () => {
    await Promise.resolve();
  });
  return tree;
}

function labelsOf(tree: ReactTestRenderer.ReactTestRenderer): string[] {
  const seen = new Set<string>();
  return tree.root
    .findAll(node => {
      const testID = String(node.props.testID ?? '');
      if (!testID.startsWith('theme-option-') || seen.has(testID)) {
        return false;
      }
      seen.add(testID);
      return true;
    })
    .map(n => n.props.accessibilityLabel);
}

describe('ThemePicker', () => {
  it('renders nothing when themeSwitcher is disabled', async () => {
    const tree = await render('lingobites-mvp');
    expect(labelsOf(tree)).toEqual([]);
  });

  it('shows all seven themes in full-feature-showcase', async () => {
    const labels = labelsOf(await render('full-feature-showcase'));
    expect(labels).toHaveLength(7);
    expect(labels).toEqual(themeIds.map(id => themes[id].name));
  });

  it('hides dark when its flag is off (close-beta-1)', async () => {
    const labels = labelsOf(await render('close-beta-1'));
    expect(labels).toContain(themes.default.name);
    expect(labels).toContain(themes['pastel-kids'].name);
    expect(labels).not.toContain(themes.dark.name);
  });

  it('applies a theme on tap', async () => {
    const tree = await render('theme-release');
    const darkOption = tree.root
      .findAll(node =>
        String(node.props.testID ?? '').startsWith('theme-option-'),
      )
      .find(n => n.props.accessibilityLabel === themes.dark.name)!;
    await act(async () => {
      darkOption.props.onPress();
    });
    expect(darkOption.props.accessibilityState.selected).toBe(true);
  });

  it('uses stable per-theme test ids and a 44px minimum target', async () => {
    const tree = await render('theme-release');
    const darkOption = tree.root.findByProps({testID: 'theme-option-dark'});
    const flattened = StyleSheet.flatten(darkOption.props.style);

    expect(darkOption.props.accessibilityLabel).toBe(themes.dark.name);
    expect(flattened.minHeight).toBe(44);
  });
});
