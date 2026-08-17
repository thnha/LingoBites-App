import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {AppText} from './AppText';
import {MaterialIcon} from './MaterialIcon';
import {useAppTheme} from '../theme';
import type {ReviewRating} from '../shared/db/types';

type Props = {
  onRate: (outcome: ReviewRating) => void;
  onSkip: () => void;
  disabled?: boolean;
};

export function RatingControl({onRate, onSkip, disabled = false}: Props) {
  const {theme} = useAppTheme();

  const neutralButton = [
    styles.button,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      opacity: disabled ? theme.states.disabledOpacity : 1,
    },
  ];

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Đánh dấu đã nhớ"
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => onRate('remembered')}
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.accentSoft,
            borderColor: theme.colors.primary,
            opacity: disabled ? theme.states.disabledOpacity : 1,
          },
        ]}
        testID="rating-remembered">
        <MaterialIcon color={theme.colors.primary} name="check_circle" size={22} />
        <AppText color="primary" variant="label">Đã nhớ</AppText>
      </Pressable>

      <Pressable
        accessibilityLabel="Đánh dấu chưa nhớ"
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => onRate('forgot')}
        style={neutralButton}
        testID="rating-forgot">
        <MaterialIcon color={theme.colors.text.secondary} name="refresh" size={22} />
        <AppText color="secondary" variant="label">Chưa nhớ</AppText>
      </Pressable>

      <Pressable
        accessibilityLabel="Bỏ qua thẻ này"
        accessibilityRole="button"
        disabled={disabled}
        onPress={onSkip}
        style={neutralButton}
        testID="rating-skip">
        <MaterialIcon color={theme.colors.text.secondary} name="chevron_right" size={22} />
        <AppText color="secondary" variant="label">Bỏ qua</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  container: {
    flexDirection: 'row',
    gap: 10,
  },
});
