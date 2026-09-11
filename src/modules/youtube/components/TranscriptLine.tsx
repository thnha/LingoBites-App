import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AppText} from '@components/AppText';
import {useAppTheme, type AppTheme} from '@theme';
import type {YouTubeSegment} from '@shared/schemas/youtube-transcript-v1';

export type TranscriptLineProps = {
  segment: YouTubeSegment;
  isActive: boolean;
  showVietnamese: boolean;
  showIpa: boolean;
  onPress: (segment: YouTubeSegment) => void;
  testID?: string;
};

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      borderRadius: theme.radius.md,
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    ipaText: {
      fontStyle: 'italic',
    },
  });
}

export function TranscriptLine({
  segment,
  isActive,
  showVietnamese,
  showIpa,
  onPress,
  testID,
}: TranscriptLineProps) {
  const {theme} = useAppTheme();
  const {t} = useTranslation();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('youtube.segment_a11y', {
        index: segment.index + 1,
        text: segment.en,
      })}
      accessibilityHint={t('youtube.segment_a11y_hint')}
      accessibilityState={{selected: isActive}}
      onPress={() => onPress(segment)}
      testID={testID}
      style={({pressed}) => [
        styles.container,
        {
          backgroundColor: isActive
            ? theme.colors.primaryContainer
            : 'transparent',
        },
        pressed ? {opacity: theme.states.pressedOpacity} : null,
      ]}
    >
      <AppText
        variant="bodyLg"
        style={isActive ? {color: theme.colors.onPrimaryContainer} : null}
        testID={testID ? `${testID}-en` : undefined}
      >
        {segment.en}
      </AppText>
      {showVietnamese && segment.vi ? (
        <AppText
          color={isActive ? 'primary' : 'secondary'}
          style={isActive ? {color: theme.colors.onPrimaryContainer} : null}
          testID={testID ? `${testID}-vi` : undefined}
        >
          {segment.vi}
        </AppText>
      ) : null}
      {showIpa && segment.ipa ? (
        <AppText
          color={isActive ? undefined : 'muted'}
          variant="caption"
          style={[
            styles.ipaText,
            isActive ? {color: theme.colors.onPrimaryContainer} : null,
          ]}
          testID={testID ? `${testID}-ipa` : undefined}
        >
          {`/${segment.ipa}/`}
        </AppText>
      ) : null}
    </Pressable>
  );
}
