import React from 'react';
import {StyleSheet} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {ThemeContext} from '@theme/useAppTheme';
import {coreTheme} from '@theme/themes/core';
import {darkTheme} from '@theme/themes/dark';
import {defaultTheme} from '@theme/themes/default';
import type {AppTheme} from '@theme/types';
import {TabBar, resolveTabGlass} from '../TabBar';
import {
  FLOATING_TAB_BAR_BOTTOM_GAP,
  FLOATING_TAB_BAR_CONTENT_GAP,
  FLOATING_TAB_BAR_HEIGHT,
  getFloatingTabBarClearance,
} from '../tabBarMetrics';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 20, left: 0, right: 0}),
}));

type BarProps = React.ComponentProps<typeof TabBar>;

function makeProps(): BarProps {
  const routes = [
    {key: 'home', name: 'Home'},
    {key: 'lessons', name: 'Lessons'},
    {key: 'profile', name: 'Profile'},
  ];
  return {
    state: {
      index: 0,
      routes,
      key: 'tab',
      routeNames: routes.map(r => r.name),
      history: [],
      type: 'tab',
      stale: false,
    },
    descriptors: {
      home: {options: {}},
      lessons: {options: {}},
      profile: {options: {}},
    },
    navigation: {
      emit: jest.fn(() => ({defaultPrevented: false})),
      navigate: jest.fn(),
    },
  } as unknown as BarProps;
}

function renderBar(
  theme: AppTheme,
  props: BarProps = makeProps(),
  extra: Partial<BarProps> = {},
) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(
      <ThemeContext.Provider
        value={{theme, themeId: 'default' as never, setThemeId: jest.fn()}}
      >
        <TabBar {...props} {...extra} />
      </ThemeContext.Provider>,
    );
  });
  return {tree, props};
}

describe('TabBar floating liquid-glass (SETE-214)', () => {
  it('floats as an absolute overlay so the feed scrolls behind the glass', () => {
    const {tree} = renderBar(defaultTheme);
    const wrap = StyleSheet.flatten(
      tree.root.findByProps({testID: 'tab-bar-float-wrap'}).props.style,
    );
    expect(wrap.position).toBe('absolute');
    expect(wrap.bottom).toBe(0);
    expect(wrap.left).toBe(0);
    expect(wrap.right).toBe(0);
    // 12px gap + bottom safe-area, like `.tabwrap` in the v3 preview.
    expect(wrap.paddingBottom).toBe(
      FLOATING_TAB_BAR_BOTTOM_GAP + 20,
    );
    // The overlay (including the bottom safe-area strip) paints nothing
    // itself — the screen's theme background flows edge-to-edge behind it.
    expect(wrap.backgroundColor).toBe('transparent');
    // Only 3 tabs → pill is ~2/3 width and centered, not full-width.
    expect(wrap.alignItems).toBe('center');
  });

  it('sizes the pill at ~3/4 width (compact for 3 tabs)', () => {
    const {tree} = renderBar(defaultTheme);
    const pill = StyleSheet.flatten(
      tree.root.findByProps({testID: 'tab-bar-glass'}).props.style,
    );
    expect(pill.width).toBe('75%');
    expect(pill.minWidth).toBe(240);
    expect(pill.maxWidth).toBe(340);
  });

  it('keeps a visible lift shadow (no overflow clipping on iOS)', () => {
    const {tree} = renderBar(defaultTheme);
    const pill = StyleSheet.flatten(
      tree.root.findByProps({testID: 'tab-bar-glass'}).props.style,
    );
    // `overflow: hidden` clips shadows on iOS and makes the pill blend
    // into the feed — it must stay off so the shadow renders.
    expect(pill.overflow).not.toBe('hidden');
    expect(pill.shadowOpacity).toBeGreaterThanOrEqual(0.2);
    expect(pill.elevation).toBeGreaterThanOrEqual(12);
  });

  it('renders the 3 current tabs with labels and selected state', () => {
    const {tree} = renderBar(defaultTheme);
    for (const testID of [
      'tab-bar-item-Home',
      'tab-bar-item-Lessons',
      'tab-bar-item-Profile',
    ]) {
      expect(tree.root.findByProps({testID}).props.accessibilityRole).toBe(
        'button',
      );
    }
    expect(
      tree.root.findByProps({testID: 'tab-bar-item-Home'}).props
        .accessibilityState,
    ).toEqual({selected: true});
    expect(
      tree.root.findByProps({testID: 'tab-bar-item-Lessons'}).props
        .accessibilityState,
    ).toEqual({selected: false});
    const labels = tree.root
      .findAllByType('Text' as never)
      .map((n: {props: {children?: unknown}}) => n.props.children);
    expect(labels).toEqual(
      expect.arrayContaining(['Trang chủ', 'Thư viện', 'Hồ sơ']),
    );
  });

  it('navigates on inactive tab press and ignores the focused tab', () => {
    const {tree, props} = renderBar(defaultTheme);
    const nav = props.navigation as unknown as {
      emit: jest.Mock;
      navigate: jest.Mock;
    };
    act(() => {
      tree.root
        .findByProps({testID: 'tab-bar-item-Lessons'})
        .props.onPress();
    });
    expect(nav.emit).toHaveBeenCalledWith({
      type: 'tabPress',
      target: 'lessons',
      canPreventDefault: true,
    });
    expect(nav.navigate).toHaveBeenCalledWith('Lessons');

    nav.navigate.mockClear();
    act(() => {
      tree.root.findByProps({testID: 'tab-bar-item-Home'}).props.onPress();
    });
    expect(nav.navigate).not.toHaveBeenCalled();
  });

  it('uses accent pill + accentInk for active and secondary text for inactive', () => {
    const {tree} = renderBar(defaultTheme);
    const active = tree.root.findByProps({testID: 'tab-bar-item-Home'});
    const inactive = tree.root.findByProps({
      testID: 'tab-bar-item-Lessons',
    });
    expect(active.props.style.backgroundColor).toBe(defaultTheme.colors.accent);
    expect(inactive.props.style.backgroundColor).toBe('transparent');
    // Visual is compact but the touch target stays >= 48px via hitSlop.
    expect(active.props.hitSlop).toBeDefined();
    expect(inactive.props.hitSlop).toBeDefined();
  });

  it.each([
    ['default', defaultTheme, 'rgba(255,255,255,0.55)'],
    ['core', coreTheme, 'rgba(255,255,255,0.55)'],
    ['dark', darkTheme, 'rgba(30,41,59,0.48)'],
  ])('tints the glass per theme (%s)', (_id, theme, tint) => {
    expect(resolveTabGlass(theme).tint).toBe(tint);
    const {tree} = renderBar(theme);
    const glass = tree.root.findByProps({testID: 'tab-bar-glass'});
    expect(StyleSheet.flatten(glass.props.style).backgroundColor).toBe(tint);
  });

  it('falls back to opaque surface when glass is disabled', () => {
    const {tree} = renderBar(defaultTheme, makeProps(), {
      glassFallback: true,
    });
    const fallback = tree.root.findByProps({testID: 'tab-bar-fallback'});
    expect(StyleSheet.flatten(fallback.props.style).backgroundColor).toBe(
      defaultTheme.colors.surface,
    );
  });

  it('reserves bar height + bottom gap + safe-area + gap in feeds', () => {
    expect(getFloatingTabBarClearance(20)).toBe(
      FLOATING_TAB_BAR_HEIGHT +
        FLOATING_TAB_BAR_BOTTOM_GAP +
        20 +
        FLOATING_TAB_BAR_CONTENT_GAP,
    );
  });
});
