import React from 'react';
import {Pressable} from 'react-native';
import {AppText} from './AppText';
import {useAppTheme} from '../theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function QuizOption({label, selected = false, onPress}: Props) {
  const {theme} = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{selected}}
      onPress={onPress}
      style={{
        backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        minHeight: 48,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
      }}>
      <AppText color={selected ? 'inverse' : 'primary'}>{label}</AppText>
    </Pressable>
  );
}
