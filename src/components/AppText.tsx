import React from 'react';
import {StyleSheet, Text, type TextProps} from 'react-native';
import {useAppTheme} from '../theme';

type Variant =
  | 'title'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bodyLg'
  | 'label';
type ColorToken = 'primary' | 'secondary' | 'muted' | 'inverse' | 'danger';

type Props = TextProps & {
  variant?: Variant;
  color?: ColorToken;
};

export function AppText({
  variant = 'body',
  color = 'primary',
  style,
  ...rest
}: Props) {
  const {theme} = useAppTheme();

  const presetVariants = new Set([
    'display',
    'h1',
    'h2',
    'h3',
    'bodyLg',
    'body',
    'label',
    'caption',
  ]);

  const variantStyle = presetVariants.has(variant)
    ? {
        fontSize: theme.typography.presets[variant as keyof typeof theme.typography.presets]
          .fontSize,
        lineHeight:
          theme.typography.presets[variant as keyof typeof theme.typography.presets].lineHeight,
        fontWeight:
          theme.typography.presets[variant as keyof typeof theme.typography.presets].fontWeight,
      }
    : {
        title: {
          fontSize: theme.typography.size.xxl,
          fontWeight: theme.typography.weight.bold,
        },
        subtitle: {
          fontSize: theme.typography.size.md,
          fontWeight: theme.typography.weight.regular,
        },
      }[variant as 'title' | 'subtitle'];

  const colorValue =
    color === 'danger' ? theme.colors.danger : theme.colors.text[color];

  return (
    <Text
      style={StyleSheet.flatten([
        {color: colorValue, fontFamily: theme.typography.fontFamily.primary},
        variantStyle,
        style,
      ])}
      {...rest}
    />
  );
}
