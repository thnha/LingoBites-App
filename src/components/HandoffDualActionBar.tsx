import React from 'react';
import {Pressable, View} from 'react-native';
import {AppText} from './AppText';
import {BottomActionBar} from './BottomActionBar';
import {MaterialIcon} from './MaterialIcon';
import {useAppTheme} from '../theme';

type Props = {
  backLabel?: string;
  continueLabel?: string;
  onBack: () => void;
  onContinue?: () => void;
  continueDisabled?: boolean;
};

export function HandoffDualActionBar({
  backLabel = 'Quay lại',
  continueLabel = 'Tiếp tục',
  onBack,
  onContinue,
  continueDisabled = false,
}: Props) {
  const {theme} = useAppTheme();

  return (
    <BottomActionBar
      style={{
        backgroundColor: theme.colors.background,
        borderTopColor: theme.colors.outlineVariant,
        paddingBottom: theme.spacing.lg,
      }}>
      <View style={{flexDirection: 'row', gap: theme.spacing.sm}}>
        <Pressable
          accessibilityLabel={backLabel}
          accessibilityRole="button"
          onPress={onBack}
          style={({pressed}) => [
            {
              alignItems: 'center',
              backgroundColor: theme.colors.surfaceHigh,
              borderRadius: theme.radius.lg,
              flex: 1,
              flexDirection: 'row',
              gap: 4,
              justifyContent: 'center',
              minHeight: 52,
              opacity: pressed ? theme.states.pressedOpacity : 1,
            },
          ]}>
          <MaterialIcon color={theme.colors.primary} name="chevron_left" size={22} />
          <AppText style={{color: theme.colors.primary, fontWeight: '600'}}>{backLabel}</AppText>
        </Pressable>
        {onContinue ? (
          <Pressable
            accessibilityLabel={continueLabel}
            accessibilityRole="button"
            disabled={continueDisabled}
            onPress={onContinue}
            style={({pressed}) => [
              {
                alignItems: 'center',
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.lg,
                flex: 1.6,
                flexDirection: 'row',
                gap: 4,
                justifyContent: 'center',
                minHeight: 52,
                opacity:
                  continueDisabled || pressed ? theme.states.pressedOpacity : 1,
              },
            ]}>
            <AppText style={{color: theme.colors.text.inverse, fontWeight: '600'}}>
              {continueLabel}
            </AppText>
            <MaterialIcon color={theme.colors.text.inverse} name="chevron_right" size={22} />
          </Pressable>
        ) : null}
      </View>
    </BottomActionBar>
  );
}
