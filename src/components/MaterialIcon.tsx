import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  type HandoffIconName,
  isValidMaterialIconGlyph,
  resolveHandoffIconName,
} from './icons/iconRegistry';
import {useAppTheme} from '../theme';

type Props = {
  name: HandoffIconName;
  size?: number;
  color?: string;
  filled?: boolean;
};

export function MaterialIcon({name, size = 24, color, filled = false}: Props) {
  const {theme} = useAppTheme();
  const glyph = resolveHandoffIconName(name);

  if (__DEV__ && !isValidMaterialIconGlyph(glyph)) {
    console.warn(`[MaterialIcon] Missing glyph "${glyph}" for handoff icon "${name}".`);
  }

  return (
    <MaterialIcons
      name={glyph}
      size={size}
      color={color ?? theme.colors.primary}
      style={filled ? {fontWeight: '700'} : undefined}
    />
  );
}
