import React from 'react';
import {View} from 'react-native';
import {AppButton} from '@components/AppButton';
import {useAppTheme} from '@theme';

type Props = {
  onComplete: () => void;
  onSkip?: () => void;
  completeLabel?: string;
};

/** Shared complete/skip action row used by every activity card. */
export function StepActions({
  onComplete,
  onSkip,
  completeLabel = 'Hoàn thành',
}: Props) {
  const {theme} = useAppTheme();
  return (
    <View style={{gap: theme.spacing.sm}}>
      <AppButton onPress={onComplete} title={completeLabel} />
      {onSkip ? (
        <AppButton onPress={onSkip} title="Bỏ qua" variant="secondary" />
      ) : null}
    </View>
  );
}
