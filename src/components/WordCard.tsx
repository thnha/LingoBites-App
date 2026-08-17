import React from 'react';
import {View} from 'react-native';
import {useFeatureEnabled} from '../release';
import {AppCard} from './AppCard';
import {AppText} from './AppText';
import {IconButton} from './IconButton';
import {useAppTheme} from '../theme';

type Props = {
  word: string;
  meaning: string;
  example?: string;
  saved?: boolean;
  onToggleSave?: () => void;
  saveTestID?: string;
};

export function WordCard({
  word,
  meaning,
  example,
  saved = false,
  onToggleSave,
  saveTestID,
}: Props) {
  const {theme} = useAppTheme();
  const reviewSystemEnabled = useFeatureEnabled('reviewSystem');
  const showSave = reviewSystemEnabled && Boolean(onToggleSave);

  return (
    <AppCard style={{gap: theme.spacing.xs}}>
      <View style={{alignItems: 'center', flexDirection: 'row', gap: theme.spacing.sm}}>
        <View style={{flex: 1}}>
          <AppText variant="h3">{word}</AppText>
        </View>
        {showSave ? (
          <IconButton
            accessibilityLabel={saved ? 'Bỏ lưu từ' : 'Lưu từ'}
            filled={saved}
            icon="bookmark"
            onPress={onToggleSave}
            size={36}
            testID={saveTestID}
            tone={saved ? 'accent' : 'surface'}
          />
        ) : null}
      </View>
      <AppText>{meaning}</AppText>
      {example ? <AppText color="muted">{example}</AppText> : null}
    </AppCard>
  );
}
