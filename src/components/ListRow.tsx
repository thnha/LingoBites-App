import React from 'react';
import {Pressable, View} from 'react-native';
import {AppText} from './AppText';
import {useAppTheme} from '../theme';

type Props = {
  label: string;
  value?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function ListRow({label, value, onPress, accessibilityLabel}: Props) {
  const {theme} = useAppTheme();
  const content = (
    <View
      style={{
        alignItems: 'center',
        borderBottomColor: theme.colors.border,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: 48,
        paddingVertical: theme.spacing.sm,
      }}>
      <AppText variant="label">{label}</AppText>
      {value ? <AppText color="secondary">{value}</AppText> : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      onPress={onPress}>
      {content}
    </Pressable>
  );
}
