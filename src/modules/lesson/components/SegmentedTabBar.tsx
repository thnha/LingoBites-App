import React, {useMemo} from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import {AppText} from '@components/AppText';
import {useAppTheme} from '@theme';
import type {AppTheme} from '@theme/types';

export interface SegmentedTabBarProps {
  activeTab: 'lessons' | 'vocabulary' | 'grammar';
  onTabChange: (tab: 'lessons' | 'vocabulary' | 'grammar') => void;
}

const TABS = [
  {id: 'lessons' as const, label: 'Bài học'},
  {id: 'vocabulary' as const, label: 'Từ vựng'},
  {id: 'grammar' as const, label: 'Ngữ pháp'},
];

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}

export function SegmentedTabBar({
  activeTab,
  onTabChange,
}: SegmentedTabBarProps) {
  const {theme} = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            testID={`tab-${tab.id}`}
            accessibilityRole="tab"
            accessibilityState={{selected: isActive}}
            accessibilityLabel={tab.label}
            accessibilityHint={`Chạm để xem ${tab.label}`}
            onPress={() => onTabChange(tab.id)}
            style={({pressed}) => [
              styles.tab,
              isActive && {
                borderBottomColor: theme.colors.primary,
                borderBottomWidth: 2,
              },
              !isActive && {
                borderBottomColor: theme.colors.border,
                borderBottomWidth: 1,
              },
              pressed && {opacity: theme.states.pressedOpacity},
            ]}
          >
            <AppText
              variant="label"
              color={isActive ? 'primary' : 'secondary'}
              style={{fontWeight: theme.typography.weight.medium}}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
