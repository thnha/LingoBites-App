import React from 'react';
import {Pressable, View} from 'react-native';
import {AppText} from './AppText';
import {Chip} from './Chip';
import type {HandoffIconName} from './icons/iconRegistry';
import {MaterialIcon} from './MaterialIcon';
import {useAppTheme} from '../theme';

type MedallionTone = 'teal' | 'coral' | 'gold';

type Props = {
  icon: HandoffIconName;
  title: string;
  subtitle: string;
  medallionTone?: MedallionTone;
  badge?: string;
  onPress?: () => void;
  disabled?: boolean;
};

function medallionColors(theme: ReturnType<typeof useAppTheme>['theme'], tone: MedallionTone) {
  switch (tone) {
    case 'coral':
      return {bg: theme.colors.secondarySoft, fg: theme.colors.secondary};
    case 'gold':
      return {bg: theme.colors.tertiarySoft, fg: theme.colors.tertiary};
    default:
      return {bg: theme.colors.accentSoft, fg: theme.colors.primary};
  }
}

export function LessonExploreRow({
  icon,
  title,
  subtitle,
  medallionTone = 'teal',
  badge,
  onPress,
  disabled = false,
}: Props) {
  const {theme} = useAppTheme();
  const medallion = medallionColors(theme, medallionTone);

  const row = (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 18,
        flexDirection: 'row',
        gap: 14,
        opacity: disabled ? theme.states.disabledOpacity : 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        position: 'relative',
        ...theme.shadow.soft,
      }}>
      {badge ? (
        <View style={{position: 'absolute', right: 14, top: 10, zIndex: 1}}>
          <Chip label={badge} tone="coral" />
        </View>
      ) : null}
      <View
        style={{
          alignItems: 'center',
          backgroundColor: medallion.bg,
          borderRadius: 14,
          height: 46,
          justifyContent: 'center',
          width: 46,
        }}>
        <MaterialIcon color={medallion.fg} name={icon} size={22} />
      </View>
      <View style={{flex: 1, gap: 2, minWidth: 0, paddingRight: badge ? 48 : 0}}>
        <AppText style={{fontSize: 16, fontWeight: '600'}}>{title}</AppText>
        <AppText color="muted" variant="caption">
          {subtitle}
        </AppText>
      </View>
      {onPress && !disabled ? (
        <MaterialIcon color={theme.colors.text.secondary} name="chevron_right" size={22} />
      ) : null}
    </View>
  );

  if (!onPress || disabled) {
    return row;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [{opacity: pressed ? theme.states.pressedOpacity : 1}]}>
      {row}
    </Pressable>
  );
}
