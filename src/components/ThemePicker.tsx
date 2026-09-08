import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useFeatureFlags} from '../release';
import {useAppTheme} from '../theme';
import {
  themeIds,
  themeReleaseFlag,
  themes,
} from '../theme/themeRegistry';

export function ThemePicker() {
  const {theme, themeId, setThemeId} = useAppTheme();
  const {isFeatureEnabled} = useFeatureFlags();

  if (!isFeatureEnabled('themeSwitcher')) {
    return null;
  }

  const visibleIds = themeIds.filter(id => {
    const flag = themeReleaseFlag[id];
    return flag === undefined || isFeatureEnabled(flag);
  });

  return (
    <View style={styles.row}>
      {visibleIds.map(id => {
        const selected = id === themeId;
        return (
          <Pressable
            key={id}
            testID={`theme-option-${id}`}
            accessibilityRole="button"
            accessibilityLabel={themes[id].name}
            accessibilityState={{selected}}
            onPress={() => setThemeId(id)}
            style={[
              styles.chip,
              {
                borderColor: theme.colors.border,
                borderRadius: theme.radius.pill,
                minHeight: 44,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
              },
              selected && {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary,
              },
            ]}
          >
            <Text
              style={{
                color: selected
                  ? theme.colors.text.inverse
                  : theme.colors.text.secondary,
                fontSize: theme.typography.size.sm,
                fontWeight: theme.typography.weight.medium,
              }}
            >
              {themes[id].name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
  },
});
