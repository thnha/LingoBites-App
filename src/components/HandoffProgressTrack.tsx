import React from 'react';
import {View} from 'react-native';
import {AppText} from './AppText';
import {useAppTheme} from '../theme';

type Props = {
  progress: number;
  label: string;
};

export function HandoffProgressTrack({progress, label}: Props) {
  const {theme} = useAppTheme();
  const width = `${Math.round(Math.min(Math.max(progress, 0), 1) * 100)}%`;

  return (
    <View style={{alignItems: 'center', flexDirection: 'row', gap: 12}}>
      <View
        style={{
          backgroundColor: theme.colors.surfaceHigh,
          borderRadius: theme.radius.pill,
          flex: 1,
          height: 12,
          overflow: 'hidden',
        }}>
        <View
          style={{
            backgroundColor: theme.colors.primary,
            height: '100%',
            width,
          }}
        />
      </View>
      <AppText color="secondary" variant="caption">
        {label}
      </AppText>
    </View>
  );
}
