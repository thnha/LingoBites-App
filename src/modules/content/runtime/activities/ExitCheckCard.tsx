import React, {useState} from 'react';
import {View} from 'react-native';
import {AppCard} from '../../../../components/AppCard';
import {AppButton} from '../../../../components/AppButton';
import {AppText} from '../../../../components/AppText';
import {useAppTheme} from '../../../../theme';
import type {ExitCheckStepData} from '../types';
import {StepActions} from './StepActions';

type Props = {
  data: ExitCheckStepData;
  onComplete: () => void;
  onSkip: () => void;
};

/** Exit check: a short 2-3 item assessment covering the lesson just seen. */
export function ExitCheckCard({data, onComplete, onSkip}: Props) {
  const {theme} = useAppTheme();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  return (
    <View style={{gap: theme.spacing.lg}}>
      <AppText color="secondary" variant="label">
        Kiểm tra nhanh cuối bài
      </AppText>
      {data.items.map(item => {
        const isRevealed = revealed.has(item.id);
        return (
          <AppCard key={item.id} style={{gap: theme.spacing.sm}}>
            <AppText variant="h3">{item.question}</AppText>
            {isRevealed ? (
              <AppText color="primary" testID={`exit-check-answer-${item.id}`}>
                {item.answer}
              </AppText>
            ) : (
              <AppButton
                onPress={() => setRevealed(prev => new Set(prev).add(item.id))}
                title="Xem đáp án"
                variant="secondary"
              />
            )}
          </AppCard>
        );
      })}
      <StepActions
        completeLabel="Hoàn thành bài kiểm tra"
        onComplete={onComplete}
        onSkip={onSkip}
      />
    </View>
  );
}
