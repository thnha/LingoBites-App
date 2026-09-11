import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {AppButton} from '@components/AppButton';
import {HandoffProgressTrack} from '@components/HandoffProgressTrack';
import {ScreenHeader} from '@components/ScreenHeader';
import type {CreateStackParamList} from '@/app/navigation/types';
import {runYouTubeJob, type YouTubeJobProgress} from '../api/youtubeApi';
import {useTranslation} from 'react-i18next';
import {saveYouTubeLesson} from '@shared/db/YoutubeLessonRepository';
import {useAppTheme} from '@theme';

type Props = NativeStackScreenProps<CreateStackParamList, 'YouTubeProcessing'>;

export function YouTubeProcessingScreen({navigation, route}: Props) {
  const {t} = useTranslation();
  const {theme} = useAppTheme();
  const [runKey, setRunKey] = useState(0);
  const [progress, setProgress] = useState<YouTubeJobProgress>({
    percent: 0,
    stage: null,
  });
  const [error, setError] = useState<{code: string; message: string} | null>(
    null,
  );

  useEffect(() => {
    setError(null);
    setProgress({percent: 0, stage: null});
    const controller = new AbortController();
    void runYouTubeJob(
      route.params.url,
      route.params.manualCues,
      setProgress,
      controller.signal,
    ).then(result => {
      if (result.ok) {
        saveYouTubeLesson({lesson: result.lesson});
        navigation.replace('YouTubeLesson', {lesson: result.lesson});
      } else if ('cancelled' in result && result.cancelled) {
        return;
      } else {
        if (!('errorCode' in result)) return;
        if (
          result.errorCode === 'TRANSCRIPT_UNAVAILABLE' ||
          result.errorCode === 'TRANSCRIPT_SOURCE_BLOCKED'
        )
          navigation.replace('YouTubeManualTranscript', {
            url: route.params.url,
            errorCode: result.errorCode,
          });
        else setError({code: result.errorCode, message: result.message});
      }
    });
    return () => controller.abort();
  }, [navigation, route.params, runKey]);

  const stageLabel =
    progress.stage ?? (error ? null : t('youtube.processing_wait'));
  const progressLabel = t('youtube.processing_progress', {
    percent: Math.round(progress.percent),
  });

  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        title={t('youtube.processing_title')}
      />
      <View
        style={{
          flex: 1,
          gap: theme.spacing.lg,
          padding: theme.gutter,
        }}
      >
        {error ? (
          <>
            <AppText variant="h2">
              {t('youtube.processing_failed_title')}
            </AppText>
            <AppText color="secondary" testID="youtube-processing-url">
              {route.params.url}
            </AppText>
            <AppText color="danger" accessibilityRole="alert">
              {error.message}
            </AppText>
            <AppButton
              onPress={() => setRunKey(key => key + 1)}
              testID="youtube-processing-retry"
              title={t('youtube.processing_retry')}
            />
            <AppButton
              onPress={() => navigation.goBack()}
              testID="youtube-processing-back"
              title={t('youtube.processing_change_url')}
              variant="secondary"
            />
          </>
        ) : (
          <>
            <AppText variant="h2">{t('youtube.processing')}</AppText>
            <AppText color="secondary" testID="youtube-processing-url">
              {route.params.url}
            </AppText>
            {stageLabel ? (
              <AppText color="secondary" testID="youtube-processing-stage">
                {stageLabel}
              </AppText>
            ) : null}
            <HandoffProgressTrack
              label={progressLabel}
              progress={progress.percent / 100}
            />
            <AppText testID="youtube-progress">
              {Math.round(progress.percent)}%
            </AppText>
          </>
        )}
      </View>
    </AppScreen>
  );
}
