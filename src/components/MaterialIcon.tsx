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
};

export function MaterialIcon({name, size = 24, color}: Props) {
  const {theme} = useAppTheme();
  const glyph = resolveHandoffIconName(name);

  if (__DEV__ && !isValidMaterialIconGlyph(glyph)) {
    console.warn(
      `[MaterialIcon] Missing glyph "${glyph}" for handoff icon "${name}".`,
    );
  }

  return (
    <MaterialIcons
      accessibilityElementsHidden
      importantForAccessibility="no"
      name={glyph}
      size={size}
      color={color ?? theme.colors.primary}
    />
  );
}
