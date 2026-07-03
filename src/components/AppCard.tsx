import React from 'react';
import {StyleSheet, View, type ViewProps} from 'react-native';
import {useAppTheme} from '../theme';

export function AppCard({style, ...rest}: ViewProps) {
  const {theme} = useAppTheme();
  const spec = theme.components.card;

  return (
    <View
      style={StyleSheet.flatten([
        {
          backgroundColor: spec.background,
          borderRadius: spec.radius,
          padding: spec.padding,
        },
        theme.shadow[spec.shadow],
        style,
      ])}
      {...rest}
    />
  );
}
