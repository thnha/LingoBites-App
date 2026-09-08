import React from 'react';
import {Pressable, View} from 'react-native';
import {AppText} from './AppText';
import {useAppTheme} from '../theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function QuizOption({label, selected = false, onPress}: Props) {
  const {theme} = useAppTheme();
  const style = {
    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
    borderColor: selected ? theme.colors.primary : theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center' as const,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  };

  if (!onPress) {
    return (
      <View style={style}>
        <AppText color={selected ? 'inverse' : 'primary'}>{label}</AppText>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{selected}}
      onPress={onPress}
      style={style}
    >
      <AppText color={selected ? 'inverse' : 'primary'}>{label}</AppText>
    </Pressable>
  );
}
