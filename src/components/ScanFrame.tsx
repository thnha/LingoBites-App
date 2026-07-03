import React from 'react';
import {View} from 'react-native';
import {useAppTheme} from '../theme';

type Props = {
  children?: React.ReactNode;
};

export function ScanFrame({children}: Props) {
  const {theme} = useAppTheme();
  return (
    <View
      style={{
        borderColor: theme.colors.primary,
        borderRadius: theme.radius.lg,
        borderWidth: 2,
        overflow: 'hidden',
        padding: theme.spacing.sm,
      }}>
      {children}
    </View>
  );
}
