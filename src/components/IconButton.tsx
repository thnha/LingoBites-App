import React from 'react';
import {Pressable, type ViewStyle} from 'react-native';
import type {HandoffIconName} from './icons/iconRegistry';
import {MaterialIcon} from './MaterialIcon';
import {useAppTheme} from '../theme';
import type {AppTheme} from '../theme/types';

export type IconButtonTone =
  | 'accent'
  | 'coral'
  | 'ghost'
  | 'surface'
  | 'danger'
  | 'tertiary'
  | 'bare';

type Props = {
  icon: HandoffIconName;
  accessibilityLabel: string;
  tone?: IconButtonTone;
  size?: number;
  iconSize?: number;
  filled?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

function resolveTone(
  theme: AppTheme,
  tone: IconButtonTone,
): {background: string; icon: string} {
  switch (tone) {
    case 'accent':
      return {background: theme.colors.accent, icon: theme.colors.accentInk};
    case 'coral':
      return {background: theme.colors.secondaryContainer, icon: theme.colors.text.inverse};
    case 'ghost':
      return {background: theme.colors.surfaceHigh, icon: theme.colors.primary};
    case 'danger':
      return {background: theme.colors.surfaceHigh, icon: theme.colors.danger};
    case 'tertiary':
      return {background: theme.colors.tertiaryFixed, icon: theme.colors.onTertiaryContainer};
    case 'bare':
      return {background: 'transparent', icon: theme.colors.primary};
    default:
      return {background: theme.colors.surfaceHigh, icon: theme.colors.primary};
  }
}

export function IconButton({
  icon,
  accessibilityLabel,
  tone = 'surface',
  size = 40,
  iconSize = 22,
  filled = false,
  onPress,
  disabled = false,
  style,
}: Props) {
  const {theme} = useAppTheme();
  const colors = resolveTone(theme, tone);
  const isInteractive = typeof onPress === 'function';

  const buttonStyle: ViewStyle = {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: tone === 'bare' ? theme.radius.md : theme.radius.pill,
    height: size,
    justifyContent: 'center',
    opacity: disabled ? theme.states.disabledOpacity : 1,
    width: size,
    ...style,
  };

  const iconNode = (
    <MaterialIcon color={colors.icon} filled={filled} name={icon} size={iconSize} />
  );

  if (!isInteractive) {
    return iconNode;
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{disabled}}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        buttonStyle,
        pressed && !disabled && {opacity: theme.states.pressedOpacity},
      ]}>
      {iconNode}
    </Pressable>
  );
}
