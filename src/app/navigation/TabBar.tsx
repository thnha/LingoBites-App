import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type {HandoffIconName} from '@components/icons/iconRegistry';
import {AnimatedMaterialIcon} from '@components/MaterialIcon';
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
const INDICATOR_DURATION_MS = 200;

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

type TabBarItemProps = {
  index: number;
  route: BottomTabBarProps['state']['routes'][number];
  focused: boolean;
  label: string;
  icon: HandoffIconName;
  progress: SharedValue<number>;
  theme: AppTheme;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

function TabBarItem({
  index,
  route,
  focused,
  label,
  icon,
  progress,
  theme,
  onPress,
  onLayout,
}: TabBarItemProps) {
  const secondary = theme.colors.text.secondary;
  const accentInk = theme.colors.accentInk;
  const captionPreset = theme.typography.presets.caption;

  const animatedColorStyle = useAnimatedStyle(
    () => ({
      color: interpolateColor(
        progress.value,
        [index - 1, index, index + 1],
        [secondary, accentInk, secondary],
      ),
    }),
    [accentInk, index, secondary],
  );

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{selected: focused}}
      hitSlop={TAB_ITEM_HIT_SLOP}
      onLayout={onLayout}
      onPress={onPress}
      style={{
        alignItems: 'center',
        borderRadius: theme.radius.pill,
        flex: 1,
        gap: 1,
        justifyContent: 'center',
        minWidth: 76,
        paddingHorizontal: 10,
        paddingVertical: 4,
        zIndex: 1,
      }}
      testID={`tab-bar-item-${route.name}`}
    >
      <AnimatedMaterialIcon
        name={icon}
        size={TAB_ICON_SIZE}
        style={animatedColorStyle}
      />
      <Animated.Text
        maxFontSizeMultiplier={captionPreset.maxFontSizeMultiplier}
        numberOfLines={1}
        style={[
          {
            fontFamily: theme.typography.fontFamily.display,
            fontSize: 10.5,
            fontWeight: focused ? '700' : '600',
            lineHeight: 13,
          },
          animatedColorStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
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
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(state.index);
  const tabWidth = useSharedValue(0);
  const hasAnimated = useRef(false);
  const [indicatorReady, setIndicatorReady] = useState(false);

  useEffect(() => {
    if (reducedMotion || !hasAnimated.current) {
      progress.value = state.index;
      hasAnimated.current = true;
      return;
    }
    progress.value = withTiming(state.index, {
      duration: INDICATOR_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, reducedMotion, state.index]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    width: tabWidth.value,
    transform: [{translateX: progress.value * tabWidth.value}],
  }));

  const handleTabLayout = (event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    if (width <= 0 || tabWidth.value > 0) {
      return;
    }
    tabWidth.value = width;
    setIndicatorReady(true);
  };

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
        accessibilityRole="tablist"
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
        {indicatorReady ? (
          <Animated.View
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
            style={[styles.indicator, indicatorAnimatedStyle]}
            testID="tab-bar-indicator"
          />
        ) : null}
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const item = TAB_ITEMS[route.name] ?? {
            labelKey: '',
            icon: 'circle' as HandoffIconName,
          };
          const label = item.labelKey
            ? t(item.labelKey)
            : descriptors[route.key].options.title ?? route.name;

          return (
            <TabBarItem
              key={route.key}
              focused={focused}
              icon={item.icon}
              index={index}
              label={label}
              onLayout={index === 0 ? handleTabLayout : undefined}
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
              progress={progress}
              route={route}
              theme={theme}
            />
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
    indicator: {
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.pill,
      bottom: 5,
      left: 6,
      position: 'absolute',
      top: 5,
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
