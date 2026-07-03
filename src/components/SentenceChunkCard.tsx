import React from 'react';
import {View} from 'react-native';
import {AppText} from './AppText';
import {Chip} from './Chip';
import {useAppTheme} from '../theme';

type Props = {
  text: string;
  meaning: string;
  roleLabel?: string;
  accentBar?: boolean;
};

export function SentenceChunkCard({text, meaning, roleLabel, accentBar = true}: Props) {
  const {theme} = useAppTheme();
  const barColor = accentBar ? theme.colors.accent : theme.colors.secondaryContainer;

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderLeftColor: barColor,
        borderLeftWidth: 4,
        borderRadius: 18,
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        ...theme.shadow.soft,
      }}>
      <View style={{flex: 1, gap: 3}}>
        <View style={{alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
          <AppText style={{fontSize: 18, fontWeight: '700'}}>{text}</AppText>
          {roleLabel ? (
            <Chip label={roleLabel} tone={accentBar ? 'gold' : 'coralSoft'} />
          ) : null}
        </View>
        <AppText color="muted" variant="caption">
          {meaning}
        </AppText>
      </View>
    </View>
  );
}
