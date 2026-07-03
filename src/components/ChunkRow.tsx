import React from 'react';
import {View} from 'react-native';
import {AppText} from './AppText';
import {useAppTheme} from '../theme';

type Props = {
  original: string;
  translation: string;
  hint?: string;
};

export function ChunkRow({original, translation, hint}: Props) {
  const {theme} = useAppTheme();
  return (
    <View style={{gap: theme.spacing.xs}}>
      <AppText variant="label">{original}</AppText>
      <AppText>{translation}</AppText>
      {hint ? <AppText color="muted">{hint}</AppText> : null}
    </View>
  );
}
