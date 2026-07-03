import React from 'react';
import {View} from 'react-native';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import {useAppTheme} from '../../theme';

type Props = {
  title: string;
  message: string;
};

export function PlaceholderTabScreen({title, message}: Props) {
  const {theme} = useAppTheme();
  return (
    <AppScreen>
      <View style={{flex: 1, gap: theme.spacing.md, justifyContent: 'center', padding: theme.spacing.xl}}>
        <AppText variant="h1">{title}</AppText>
        <AppText color="secondary">{message}</AppText>
      </View>
    </AppScreen>
  );
}
