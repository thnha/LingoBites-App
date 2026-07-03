import React from 'react';
import {View} from 'react-native';
import {AppText} from './AppText';
import {useAppTheme} from '../theme';

type Props = {
  label: string;
  size?: number;
};

export function Medallion({label, size = 72}: Props) {
  const {theme} = useAppTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceMuted,
        borderColor: theme.colors.border,
        borderRadius: size / 2,
        borderWidth: 1,
        height: size,
        justifyContent: 'center',
        width: size,
      }}>
      <AppText variant="h3" style={{textAlign: 'center'}}>
        {label}
      </AppText>
    </View>
  );
}
