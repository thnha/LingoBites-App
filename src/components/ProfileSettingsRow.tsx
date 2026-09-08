import React from 'react';
import {Pressable, View} from 'react-native';
import {AppText} from './AppText';
import {Chip, type ChipTone} from './Chip';
import type {HandoffIconName} from './icons/iconRegistry';
import {MaterialIcon} from './MaterialIcon';
import {useAppTheme} from '../theme';

type MedallionTone = 'teal' | 'coral' | 'gold';

type Props = {
  icon: HandoffIconName;
  label: string;
  medallionTone?: MedallionTone;
  trailing?: 'chevron' | {text: string} | {chip: string; chipTone?: ChipTone};
  onPress?: () => void;
  accessibilityLabel?: string;
};

function medallionColors(
  theme: ReturnType<typeof useAppTheme>['theme'],
  tone: MedallionTone,
) {
  switch (tone) {
    case 'coral':
      return {bg: theme.colors.secondarySoft, fg: theme.colors.secondary};
    case 'gold':
      return {bg: theme.colors.tertiarySoft, fg: theme.colors.tertiary};
    default:
      return {bg: theme.colors.accentSoft, fg: theme.colors.primary};
  }
}

export function ProfileSettingsRow({
  icon,
  label,
  medallionTone = 'teal',
  trailing,
  onPress,
  accessibilityLabel,
}: Props) {
  const {theme} = useAppTheme();
  const medallion = medallionColors(theme, medallionTone);
  const trailingNode = (() => {
    if (trailing === 'chevron') {
      return onPress ? (
        <MaterialIcon
          color={theme.colors.text.secondary}
          name="chevron_right"
          size={22}
        />
      ) : null;
    }
    if (trailing && 'chip' in trailing) {
      return (
        <Chip label={trailing.chip} tone={trailing.chipTone ?? 'accentSoft'} />
      );
    }
    if (trailing && 'text' in trailing) {
      return (
        <AppText color="muted" variant="caption">
          {trailing.text}
        </AppText>
      );
    }
    return null;
  })();

  const row = (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 18,
        flexDirection: 'row',
        gap: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        ...theme.shadow.soft,
      }}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: medallion.bg,
          borderRadius: 14,
          height: 46,
          justifyContent: 'center',
          width: 46,
        }}
      >
        <MaterialIcon color={medallion.fg} name={icon} size={22} />
      </View>
      <AppText style={{flex: 1, fontSize: 16, fontWeight: '600'}}>
        {label}
      </AppText>
      {trailingNode}
    </View>
  );

  if (!onPress) {
    return row;
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        {opacity: pressed ? theme.states.pressedOpacity : 1},
      ]}
    >
      {row}
    </Pressable>
  );
}
