import React from 'react';
import {AppCard} from './AppCard';
import {AppText} from './AppText';
import {useAppTheme} from '../theme';

type Props = {
  word: string;
  meaning: string;
  example?: string;
};

export function WordCard({word, meaning, example}: Props) {
  const {theme} = useAppTheme();
  return (
    <AppCard style={{gap: theme.spacing.xs}}>
      <AppText variant="h3">{word}</AppText>
      <AppText>{meaning}</AppText>
      {example ? <AppText color="muted">{example}</AppText> : null}
    </AppCard>
  );
}
