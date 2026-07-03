import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '../../release';
import {AppThemeProvider} from '../../theme';
import {themes} from '../../theme/themeRegistry';
import {ThemePicker} from '../ThemePicker';

async function render(releaseName: 'theme-release' | 'close-beta-1') {
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
  return tree.root
    .findAllByProps({testID: 'theme-option'})
    .map(n => n.props.accessibilityLabel);
}

describe('ThemePicker', () => {
  it('shows the enabled themes but hides the default (pastel-kids) in theme-release', async () => {
    const labels = labelsOf(await render('theme-release'));
    expect(labels).toContain(themes.default.name);
    expect(labels).toContain(themes.dark.name);
    // pastel-kids is the default theme, so it is not offered as an option.
    expect(labels).not.toContain(themes['pastel-kids'].name);
  });

  it('hides the default (pastel-kids) and hides dark when its flag is off (close-beta-1)', async () => {
    const labels = labelsOf(await render('close-beta-1'));
    expect(labels).toContain(themes.default.name);
    expect(labels).not.toContain(themes['pastel-kids'].name);
    expect(labels).not.toContain(themes.dark.name);
  });

  it('applies a theme on tap', async () => {
    const tree = await render('theme-release');
    const darkOption = tree.root
      .findAllByProps({testID: 'theme-option'})
      .find(n => n.props.accessibilityLabel === themes.dark.name)!;
    await act(async () => {
      darkOption.props.onPress();
    });
    expect(darkOption.props.accessibilityState.selected).toBe(true);
  });
});
