import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppText} from '@components/AppText';
import type {HandoffIconName} from '@components/icons/iconRegistry';
import {MaterialIcon} from '@components/MaterialIcon';
import {useAppTheme, type AppTheme} from '@theme';
import {useTranslation} from 'react-i18next';
import {
  FLOATING_TAB_BAR_BOTTOM_GAP,
  FLOATING_TAB_BAR_HORIZONTAL_MARGIN,
  withAlpha,
} from './tabBarMetrics';

const TAB_ITEMS: Record<string, {labelKey: string; icon: HandoffIconName}> = {
  Home: {labelKey: 'nav.tab.home', icon: 'home'},
  Lessons: {labelKey: 'nav.tab.library', icon: 'school'},
  Profile: {labelKey: 'nav.tab.profile', icon: 'person'},
};

const TAB_ITEM_HIT_SLOP = {top: 8, bottom: 8, left: 8, right: 8};
const TAB_ICON_SIZE = 21;

type TabBarProps = BottomTabBarProps & {
  /**
   * Forces the opaque fallback (solid `surface` background) used on devices
   * without blur/translucency support. Defaults to the translucent
   * liquid-glass treatment.
   */
  glassFallback?: boolean;
};

/**
 * Resolves the theme-tinted glass colors for the floating pill.
 * Light themes use `surface` at ~55%, dark themes at ~48% (SETE-213 v3).
 */
export function resolveTabGlass(theme: AppTheme) {
  const isDark = theme.id === 'dark';
  return {
    isDark,
    tint: withAlpha(theme.colors.surface, isDark ? 0.48 : 0.55),
    // Slightly stronger than the v3 spec's 50% so the pill edge reads
    // against light feeds (see SETE-214 screenshot feedback).
    border: withAlpha(theme.colors.outlineVariant, 0.6),
    gloss: 'rgba(255,255,255,0.12)',
    innerHighlight: 'rgba(255,255,255,0.5)',
    fallback: theme.colors.surface,
  };
}

export function TabBar({
  state,
  descriptors,
  navigation,
  glassFallback = false,
}: TabBarProps) {
  const {theme} = useAppTheme();
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const glass = resolveTabGlass(theme);
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.floatWrap,
        {
          paddingBottom: FLOATING_TAB_BAR_BOTTOM_GAP + insets.bottom,
        },
      ]}
      testID="tab-bar-float-wrap"
    >
      <View
        style={[
          styles.pill,
          {
            borderColor: glass.border,
            backgroundColor: glassFallback ? glass.fallback : glass.tint,
          },
        ]}
        testID={glassFallback ? 'tab-bar-fallback' : 'tab-bar-glass'}
      >
        {!glassFallback ? (
          <>
            {/* Top gloss: white 12% fading down (gradient stand-in;
                install @react-native-community/blur + a gradient layer for
                true native blur — see SETE-214 handoff). */}
            <View
              pointerEvents="none"
              style={[styles.gloss, {backgroundColor: glass.gloss}]}
            />
            {/* Inner top highlight line. */}
            <View
              pointerEvents="none"
              style={[
                styles.innerHighlight,
                {borderTopColor: glass.innerHighlight},
              ]}
            />
          </>
        ) : null}
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const item = TAB_ITEMS[route.name] ?? {
            labelKey: '',
            icon: 'circle',
          };
          const label = item.labelKey
            ? t(item.labelKey)
            : descriptors[route.key].options.title ?? route.name;

          return (
            <Pressable
              key={route.key}
              accessibilityLabel={label}
              accessibilityRole="button"
              accessibilityState={{selected: focused}}
              hitSlop={TAB_ITEM_HIT_SLOP}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={{
                alignItems: 'center',
                backgroundColor: focused ? theme.colors.accent : 'transparent',
                borderRadius: theme.radius.pill,
                flex: 1,
                gap: 1,
                justifyContent: 'center',
                minWidth: 76,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
              testID={`tab-bar-item-${route.name}`}
            >
              <MaterialIcon
                color={
                  focused ? theme.colors.accentInk : theme.colors.text.secondary
                }
                name={item.icon}
                size={TAB_ICON_SIZE}
              />
              <AppText
                variant="caption"
                numberOfLines={1}
                style={{
                  color: focused
                    ? theme.colors.accentInk
                    : theme.colors.text.secondary,
                  fontSize: 10.5,
                  fontWeight: focused ? '700' : '600',
                  lineHeight: 13,
                }}
              >
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    floatWrap: {
      // Absolute overlay (like `.tabwrap` in the SETE-213 v3 preview):
      // the feed scrolls *behind* the pill so the glass has content to
      // show through. Feed screens reserve clearance via
      // useFloatingTabBarClearance() so the last row is never covered.
      // Only 3 tabs → the pill is ~2/3 width and centered instead of
      // stretching full width (which looked sparse).
      alignItems: 'center',
      backgroundColor: 'transparent',
      bottom: 0,
      left: 0,
      paddingHorizontal: FLOATING_TAB_BAR_HORIZONTAL_MARGIN,
      paddingTop: 8,
      position: 'absolute',
      right: 0,
    },
    pill: {
      alignItems: 'center',
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      elevation: 16,
      flexDirection: 'row',
      justifyContent: 'space-around',
      // ~3/4 screen width for 3 tabs: compact, not sparse.
      // minWidth keeps the v3 76px-per-tab floor on narrow screens,
      // maxWidth stops it stretching on tablets.
      maxWidth: 340,
      minWidth: 240,
      width: '75%',
      // NOTE: no `overflow: 'hidden'` here — on iOS it clips the shadow
      // and the pill loses all lift (SETE-214 screenshot feedback).
      // Children are all inside the bounds so nothing needs clipping.
      paddingHorizontal: 6,
      paddingVertical: 5,
      shadowColor: '#0a0a28',
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.22,
      shadowRadius: 28,
    },
    gloss: {
      borderTopLeftRadius: theme.radius.pill,
      borderTopRightRadius: theme.radius.pill,
      height: '55%',
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    innerHighlight: {
      borderTopLeftRadius: theme.radius.pill,
      borderTopRightRadius: theme.radius.pill,
      borderTopWidth: 1,
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
  });
}
