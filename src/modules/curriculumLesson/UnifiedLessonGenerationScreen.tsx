/**
 * Unified generation progress screen: job-only UI for AI lesson creation.
 *
 * Polls `GET /api/v1/lesson-jobs/:id` via `useLessonGenerationJob` and
 * renders progress only — never lesson content. On a materialized
 * `lessonId` it replaces itself with the canonical
 * `CurriculumLesson({lessonId})` route. A failed job offers retry,
 * which creates a fresh job (new idempotency key) and swaps the route
 * to the new job ID; the failed job row stays untouched for the server
 * to expire per BR-003.
 */
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import type {LessonsStackParamList} from '@/app/navigation/types';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {trackEvent} from '@modules/analytics';
import {useAppTheme, type AppTheme} from '@theme';
import {createLessonGenerationJob} from './lessonJobClient';
import {
  useLessonGenerationJob,
  type LessonGenerationState,
} from './useLessonGenerationJob';

type Props = NativeStackScreenProps<
  LessonsStackParamList,
  'UnifiedLessonGeneration'
>;

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    center: {
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.md,
      justifyContent: 'center',
      padding: theme.gutter,
    },
    title: {
      textAlign: 'center',
    },
    message: {
      textAlign: 'center',
    },
    retry: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.md,
      justifyContent: 'center',
      minHeight: 44,
      paddingHorizontal: theme.spacing.lg,
    },
    retryText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.medium,
    },
    back: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      paddingHorizontal: theme.spacing.lg,
    },
  });
}

export type UnifiedLessonGenerationViewProps = {
  generation: LessonGenerationState;
  canRetry: boolean;
  retrying: boolean;
  notice: string | null;
  onRetry: () => void;
  onBack: () => void;
};

export function UnifiedLessonGenerationView({
  generation,
  canRetry,
  retrying,
  notice,
  onRetry,
  onBack,
}: UnifiedLessonGenerationViewProps) {
  const {theme} = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (generation.status === 'succeeded') {
    return (
      <View style={styles.center} testID="unified-generation-opening">
        <ActivityIndicator color={theme.colors.primary} />
        <AppText variant="label" color="secondary">
          Opening your lesson…
        </AppText>
      </View>
    );
  }

  if (generation.status === 'failed') {
    return (
      <View style={styles.center} testID="unified-generation-failed">
        <AppText variant="h3" style={styles.title}>
          Lesson generation failed.
        </AppText>
        <AppText
          variant="label"
          color="secondary"
          style={styles.message}
          testID="unified-generation-error"
        >
          {generation.error.message}
        </AppText>
        {generation.job?.warnings?.length ? (
          <AppText
            variant="caption"
            color="secondary"
            testID="unified-generation-warnings"
          >
            {`${generation.job.warnings.length} warning(s) reported.`}
          </AppText>
        ) : null}
        {canRetry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry lesson generation"
            accessibilityState={{disabled: retrying}}
            disabled={retrying}
            onPress={onRetry}
            testID="unified-generation-retry"
            style={styles.retry}
          >
            <AppText style={styles.retryText}>
              {retrying ? 'Retrying…' : 'Try again'}
            </AppText>
          </Pressable>
        ) : null}
        {notice ? (
          <AppText
            variant="label"
            color="secondary"
            style={styles.message}
            testID="unified-generation-notice"
          >
            {notice}
          </AppText>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          testID="unified-generation-back"
          style={styles.back}
        >
          <AppText variant="label">Go back</AppText>
        </Pressable>
      </View>
    );
  }

  const statusLabel =
    generation.job?.status === 'partially_ready'
      ? 'Building your lesson…'
      : 'Starting generation…';
  return (
    <View style={styles.center} testID="unified-generation-progress">
      <ActivityIndicator color={theme.colors.primary} />
      <AppText variant="h3" style={styles.title}>
        {statusLabel}
      </AppText>
      <AppText variant="label" color="secondary" style={styles.message}>
        This usually takes under a minute. You can wait here.
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        testID="unified-generation-cancel"
        style={styles.back}
      >
        <AppText variant="label">Go back</AppText>
      </Pressable>
    </View>
  );
}

export function UnifiedLessonGenerationScreen({navigation, route}: Props) {
  const {jobId, confirmedText, level} = route.params;
  const generation = useLessonGenerationJob({jobId});
  const [retrying, setRetrying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const openedRef = useRef<string | null>(null);
  const startedRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent('unified_generation_started', {job_id: jobId});
    }
  }, [jobId]);

  useEffect(() => {
    if (generation.status === 'succeeded') {
      if (!completedRef.current) {
        completedRef.current = true;
        trackEvent('unified_generation_completed', {
          job_id: jobId,
          lesson_id: generation.lessonId,
          outcome: 'materialized',
        });
      }
      if (openedRef.current !== generation.lessonId) {
        openedRef.current = generation.lessonId;
        navigation.replace('CurriculumLesson', {lessonId: generation.lessonId});
      }
    } else if (generation.status === 'failed' && !completedRef.current) {
      completedRef.current = true;
      trackEvent('unified_generation_completed', {
        job_id: jobId,
        outcome: 'failed',
      });
    }
  }, [generation, navigation, jobId]);

  const handleRetry = useCallback(async () => {
    if (retrying || !confirmedText) return;
    setRetrying(true);
    setNotice(null);
    try {
      const result = await createLessonGenerationJob({confirmedText, level});
      if (result.ok) {
        openedRef.current = null;
        navigation.replace('UnifiedLessonGeneration', {
          jobId: result.job.id,
          confirmedText,
          level,
        });
      } else if (!result.cancelled) {
        setNotice(result.message);
      }
    } finally {
      setRetrying(false);
    }
  }, [retrying, confirmedText, level, navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <AppScreen>
      <UnifiedLessonGenerationView
        generation={generation}
        canRetry={confirmedText != null && confirmedText.length > 0}
        retrying={retrying}
        notice={notice}
        onRetry={() => void handleRetry()}
        onBack={handleBack}
      />
    </AppScreen>
  );
}
