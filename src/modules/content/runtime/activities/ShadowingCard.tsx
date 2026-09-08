import React, {useState} from 'react';
import {View} from 'react-native';
import {AppCard} from '@components/AppCard';
import {AppText} from '@components/AppText';
import {IconButton} from '@components/IconButton';
import {useAppTheme} from '@theme';
import type {ShadowingStepData} from '../types';
import {StepActions} from './StepActions';

type Props = {
  data: ShadowingStepData;
  onPlayAudio: (assetId: string | null) => void;
  onComplete: () => void;
  onSkip: () => void;
};

/** Shadowing: play the audio, then the learner confirms they repeated it. */
export function ShadowingCard({data, onPlayAudio, onComplete, onSkip}: Props) {
  const {theme} = useAppTheme();
  const [repeated, setRepeated] = useState(false);

  return (
    <View style={{gap: theme.spacing.lg}}>
      {data.instructionsVi ? (
        <AppText color="secondary">{data.instructionsVi}</AppText>
      ) : null}
      {data.lines.map((line, index) => (
        <AppCard
          key={`${line.textEn}-${index}`}
          style={{gap: theme.spacing.sm}}
        >
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: theme.spacing.sm,
            }}
          >
            <AppText variant="h3">{line.textEn}</AppText>
            <IconButton
              accessibilityLabel="Nghe phát âm"
              icon="volume_up"
              onPress={() => onPlayAudio(line.audioAssetId)}
              tone="ghost"
            />
          </View>
          <AppText color="primary">{line.textVi}</AppText>
        </AppCard>
      ))}
      <AppText
        color={repeated ? 'primary' : 'secondary'}
        onPress={() => setRepeated(true)}
        testID="shadowing-confirm"
      >
        {repeated ? '✓ Tôi đã lặp lại' : 'Tôi đã lặp lại'}
      </AppText>
      <StepActions onComplete={onComplete} onSkip={onSkip} />
    </View>
  );
}
