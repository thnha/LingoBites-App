import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {AppText} from './AppText';
import {MaterialIcon} from './MaterialIcon';
import {useAppTheme} from '../theme';
import type {AppTheme} from '../theme';
import type {ReviewRating} from '../shared/db/types';

type Props = {
  onRate: (rating: ReviewRating) => void;
  onSkip: () => void;
  disabled?: boolean;
};

type RatingOption = {
  rating: ReviewRating;
  label: string;
  accessibilityLabel: string;
  icon: 'refresh' | 'bolt' | 'check_circle' | 'auto_awesome';
};

const RATING_OPTIONS: RatingOption[] = [
  {
    rating: 'forgot',
    label: 'Quên',
    accessibilityLabel: 'Không nhớ - ôn lại sau 1 ngày',
    icon: 'refresh',
  },
  {
    rating: 'hard',
    label: 'Khó',
    accessibilityLabel: 'Nhớ nhưng khó - ôn sớm hơn',
    icon: 'bolt',
  },
  {
    rating: 'good',
    label: 'Tốt',
    accessibilityLabel: 'Nhớ - lên lịch ôn sau',
    icon: 'check_circle',
  },
  {
    rating: 'easy',
    label: 'Dễ',
    accessibilityLabel: 'Rất dễ - lên lịch ôn lâu hơn',
    icon: 'auto_awesome',
  },
];

function ratingTone(
  theme: AppTheme,
  rating: ReviewRating,
): {background: string; border: string; ink: string} {
  switch (rating) {
    case 'hard':
      return {
        background: theme.colors.secondarySoft,
        border: theme.colors.outlineVariant,
        ink: theme.colors.secondary,
      };
    case 'good':
      return {
        background: theme.colors.accentSoft,
        border: theme.colors.primary,
        ink: theme.colors.primary,
      };
    case 'easy':
      return {
        background: theme.colors.tertiarySoft,
        border: theme.colors.outlineVariant,
        ink: theme.colors.tertiary,
      };
    case 'forgot':
    default:
      return {
        background: theme.colors.surface,
        border: theme.colors.danger,
        ink: theme.colors.danger,
      };
  }
}

export function RatingControl({onRate, onSkip, disabled = false}: Props) {
  const {theme} = useAppTheme();

  return (
    <View style={styles.container}>
      {RATING_OPTIONS.map(option => {
        const tone = ratingTone(theme, option.rating);
        return (
          <Pressable
            accessibilityLabel={option.accessibilityLabel}
            accessibilityRole="button"
            disabled={disabled}
            key={option.rating}
            onPress={() => onRate(option.rating)}
            style={[
              styles.button,
              {
                backgroundColor: tone.background,
                borderColor: tone.border,
                opacity: disabled ? theme.states.disabledOpacity : 1,
              },
            ]}
            testID={`rating-${option.rating}`}>
            <MaterialIcon color={tone.ink} name={option.icon} size={22} />
            <AppText style={{color: tone.ink}} variant="label">
              {option.label}
            </AppText>
          </Pressable>
        );
      })}

      <Pressable
        accessibilityLabel="Bỏ qua thẻ này"
        accessibilityRole="button"
        disabled={disabled}
        onPress={onSkip}
        style={[
          styles.skipButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            opacity: disabled ? theme.states.disabledOpacity : 1,
          },
        ]}
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
    flexBasis: '46%',
    flexGrow: 1,
    gap: 6,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skipButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: '100%',
    gap: 6,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
});
