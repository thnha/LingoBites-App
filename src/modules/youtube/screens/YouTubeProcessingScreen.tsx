import React, {useEffect, useState} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {ScreenHeader} from '@components/ScreenHeader';
import type {HomeStackParamList} from '@/app/navigation/types';
import {runYouTubeJob, type YouTubeJobProgress} from '../api/youtubeApi';
import {useTranslation} from 'react-i18next';
import {saveYouTubeLesson} from '@shared/db/YoutubeLessonRepository';

type Props = NativeStackScreenProps<HomeStackParamList, 'YouTubeProcessing'>;
export function YouTubeProcessingScreen({navigation, route}: Props) {
  const {t} = useTranslation();
  const [progress, setProgress] = useState<YouTubeJobProgress>({
    percent: 0,
    stage: null,
  });
  const [error, setError] = useState<{code: string; message: string} | null>(
    null,
  );
  useEffect(() => {
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
  }, [navigation, route.params]);
  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        title={t('youtube.processing_title')}
      />
      <AppText variant="h2">{t('youtube.processing')}</AppText>
      <AppText color="secondary">
        {progress.stage ?? t('youtube.processing_wait')}
      </AppText>
      <AppText testID="youtube-progress">
        {Math.round(progress.percent)}%
      </AppText>
      {error ? (
        <AppText color="danger" accessibilityRole="alert">
          {error.message}
        </AppText>
      ) : null}
    </AppScreen>
  );
}
