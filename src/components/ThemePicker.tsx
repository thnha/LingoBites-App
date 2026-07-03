import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useFeatureFlags} from '../release';
import {useAppTheme} from '../theme';
import {
  defaultThemeId,
  themeIds,
  themeReleaseFlag,
  themes,
} from '../theme/themeRegistry';

export function ThemePicker() {
  const {theme, themeId, setThemeId} = useAppTheme();
  const {isFeatureEnabled} = useFeatureFlags();

  // The default theme is the baseline look, so it is not offered as a
  // switchable option in the picker.
  const visibleIds = themeIds.filter(id => {
    if (id === defaultThemeId) {
      return false;
    }
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
            testID="theme-option"
            accessibilityRole="button"
            accessibilityLabel={themes[id].name}
            accessibilityState={{selected}}
            onPress={() => setThemeId(id)}
            style={[
              styles.chip,
              {
                borderColor: theme.colors.border,
                borderRadius: theme.radius.pill,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
              },
              selected && {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary,
              },
            ]}>
            <Text
              style={{
                color: selected ? theme.colors.text.inverse : theme.colors.text.secondary,
                fontSize: theme.typography.size.sm,
                fontWeight: theme.typography.weight.medium,
              }}>
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
