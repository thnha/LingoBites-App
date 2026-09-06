import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
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
  labelKey: string;
  accessibilityKey: string;
  icon: 'refresh' | 'bolt' | 'check_circle' | 'auto_awesome';
};

const RATING_OPTIONS: RatingOption[] = [
  {
    rating: 'forgot',
    labelKey: 'rating.forgot_label',
    accessibilityKey: 'rating.forgot_a11y',
    icon: 'refresh',
  },
  {
    rating: 'hard',
    labelKey: 'rating.hard_label',
    accessibilityKey: 'rating.hard_a11y',
    icon: 'bolt',
  },
  {
    rating: 'good',
    labelKey: 'rating.good_label',
    accessibilityKey: 'rating.good_a11y',
    icon: 'check_circle',
  },
  {
    rating: 'easy',
    labelKey: 'rating.easy_label',
    accessibilityKey: 'rating.easy_a11y',
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
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      {RATING_OPTIONS.map(option => {
        const tone = ratingTone(theme, option.rating);
        return (
          <Pressable
            accessibilityLabel={t(option.accessibilityKey)}
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
              {t(option.labelKey)}
            </AppText>
          </Pressable>
        );
      })}

      <Pressable
        accessibilityLabel={t('rating.skip_a11y')}
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
        <AppText color="secondary" variant="label">{t('rating.skip_label')}</AppText>
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
