import React from 'react';
import {Pressable, View} from 'react-native';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppText} from '../../components/AppText';
import type {HandoffIconName} from '../../components/icons/iconRegistry';
import {MaterialIcon} from '../../components/MaterialIcon';
import {useAppTheme} from '../../theme';

const TAB_ITEMS: Record<string, {label: string; icon: HandoffIconName}> = {
  Home: {label: 'Trang chủ', icon: 'home'},
  Lessons: {label: 'Bài học', icon: 'school'},
  Profile: {label: 'Hồ sơ', icon: 'person'},
};

export function TabBar({state, descriptors, navigation}: BottomTabBarProps) {
  const {theme} = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingBottom: Math.max(insets.bottom, 10),
        paddingHorizontal: 12,
        paddingTop: 10,
        shadowColor: theme.colors.primary,
        shadowOffset: {width: 0, height: -6},
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 12,
      }}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const item = TAB_ITEMS[route.name] ?? {
          label: descriptors[route.key].options.title ?? route.name,
          icon: 'circle',
        };

        return (
          <Pressable
            key={route.key}
            accessibilityLabel={item.label}
            accessibilityRole="button"
            accessibilityState={{selected: focused}}
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
              gap: 3,
              justifyContent: 'center',
              minHeight: 48,
              paddingHorizontal: 16,
              paddingVertical: 6,
            }}>
            <MaterialIcon
              color={focused ? theme.colors.accentInk : theme.colors.text.secondary}
              filled={focused}
              name={item.icon}
              size={24}
            />
            <AppText
              variant="caption"
              style={{
                color: focused ? theme.colors.accentInk : theme.colors.text.secondary,
                fontWeight: focused ? '700' : '600',
              }}>
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
