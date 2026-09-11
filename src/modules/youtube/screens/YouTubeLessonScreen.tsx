import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {IconButton} from '@components/IconButton';
import {ScreenHeader} from '@components/ScreenHeader';
import {useAppTheme, type AppTheme} from '@theme';
import type {
  YouTubeSegment,
  YouTubeTranscript,
} from '@shared/schemas/youtube-transcript-v1';
import {getYouTubeLesson} from '@shared/db/YoutubeLessonRepository';
import {
  YouTubePlayer,
  type YouTubePlayerErrorCode,
  type YouTubePlayerRef,
} from '../components/YouTubePlayer';
import {TranscriptLine} from '../components/TranscriptLine';
import {useTranscriptSync, TRANSCRIPT_SYNC_POLL_INTERVAL_MS} from '../sync/useTranscriptSync';
import type {HomeStackParamList} from '@/app/navigation/types';
import {useFloatingTabBarClearance} from '@/app/navigation/tabBarMetrics';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useBookmarkOptimistic} from '../../lesson/useBookmarkOptimistic';
import {useFlashcardLibrary} from '../../lesson/useFlashcardLibrary';
import {mapTranscriptToPractice} from '../utils/practiceMapper';
import {
  formatYouTubePlaybackRate,
  nextYouTubePlaybackRate,
  type YouTubePlaybackRate,
} from '../utils/playbackRate';

const AUTOSCROLL_RESUME_DELAY_MS = 5_000;

export type YouTubeLessonScreenProps = {
  lesson: YouTubeTranscript;
  onBack?: () => void;
  onStartPractice?: () => void;
};

function ListSeparator() {
  const {theme} = useAppTheme();
  return <View style={{height: theme.spacing.xs}} />;
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    headerActions: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    playerWrap: {
      backgroundColor: theme.colors.surface,
    },
    playerControls: {
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      paddingHorizontal: theme.gutter,
      paddingVertical: theme.spacing.sm,
    },
    errorBanner: {
      paddingHorizontal: theme.gutter,
      paddingVertical: theme.spacing.sm,
    },
    offlineBanner: {
      gap: theme.spacing.xs,
      paddingHorizontal: theme.gutter,
      paddingVertical: theme.spacing.sm,
    },
    list: {
      paddingBottom: theme.spacing.xl,
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
    notFoundWrap: {
      flex: 1,
      justifyContent: 'center',
      padding: theme.gutter,
    },
  });
}

export function YouTubeLessonScreen({
  lesson,
  onBack,
  onStartPractice,
}: YouTubeLessonScreenProps) {
  const {theme} = useAppTheme();
  const {t} = useTranslation();
  const feedClearance = useFloatingTabBarClearance();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const playerRef = useRef<YouTubePlayerRef>(null);
  const listRef = useRef<FlatList<YouTubeSegment>>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevActiveIndexRef = useRef(-1);

  const [showVietnamese, setShowVietnamese] = useState(true);
  const [showIpa, setShowIpa] = useState(true);
  const [repeatIndex, setRepeatIndex] = useState<number | null>(null);
  const [abLoopStartIndex, setAbLoopStartIndex] = useState<number | null>(
    null,
  );
  const [abLoopEndIndex, setAbLoopEndIndex] = useState<number | null>(null);
  const [playbackRate, setPlaybackRate] = useState<YouTubePlaybackRate>(1);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const [playerError, setPlayerError] = useState<YouTubePlayerErrorCode | null>(
    null,
  );

  // A player error (e.g. no network / airplane mode) switches the screen to
  // offline reading mode: the cached EN + VI + IPA transcript stays fully
  // readable while every playback-dependent control is disabled.
  const isOfflineReading = playerError != null;

  const {vocabularySaveState, onVocabularySave, onVocabularyUnsave} =
    useBookmarkOptimistic(lesson.video.id);
  const {listFlashcards} = useFlashcardLibrary();
  const [savedVocabularyIds, setSavedVocabularyIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    const saved = listFlashcards({lessonId: lesson.video.id}).map(
      c => c.vocabularyId,
    );
    setSavedVocabularyIds(new Set(saved));
  }, [lesson.video.id, listFlashcards]);

  const handleSeek = useCallback((timeMs: number) => {
    playerRef.current?.seekTo(timeMs / 1000);
  }, []);

  const getCurrentTimeMs = useCallback(async () => {
    const seconds = await playerRef.current?.getCurrentTime();
    return (seconds ?? 0) * 1000;
  }, []);

  const {activeIndex, seekToIndex} = useTranscriptSync({
    segments: lesson.segments,
    getCurrentTimeMs,
    onSeek: handleSeek,
    enabled: !isOfflineReading,
  });

  // Repeat mode: once the active segment moves past the one being repeated,
  // jump straight back to its start rather than waiting for the next sentence.
  useEffect(() => {
    const previous = prevActiveIndexRef.current;
    prevActiveIndexRef.current = activeIndex;
    if (repeatIndex == null || previous !== repeatIndex) {
      return;
    }
    if (activeIndex !== repeatIndex) {
      seekToIndex(repeatIndex);
    }
  }, [activeIndex, repeatIndex, seekToIndex]);

  const abLoopActive =
    abLoopStartIndex != null &&
    abLoopEndIndex != null &&
    abLoopStartIndex <= abLoopEndIndex;

  useEffect(() => {
    if (!abLoopActive || isOfflineReading) {
      return undefined;
    }
    const startIndex = abLoopStartIndex;
    const endIndex = abLoopEndIndex;
    const endMs = lesson.segments[endIndex]?.end_ms;
    if (endMs == null) {
      return undefined;
    }

    let cancelled = false;
    const intervalId = setInterval(() => {
      void (async () => {
        const timeMs = await getCurrentTimeMs();
        if (cancelled || timeMs < endMs) {
          return;
        }
        seekToIndex(startIndex);
      })();
    }, TRANSCRIPT_SYNC_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [
    abLoopActive,
    abLoopEndIndex,
    abLoopStartIndex,
    getCurrentTimeMs,
    isOfflineReading,
    lesson.segments,
    seekToIndex,
  ]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (autoScrollPaused || activeIndex < 0) {
      return;
    }
    listRef.current?.scrollToIndex({
      animated: true,
      index: activeIndex,
      viewPosition: 0.5,
    });
  }, [activeIndex, autoScrollPaused]);

  const handleLinePress = useCallback(
    (segment: YouTubeSegment) => {
      if (isOfflineReading) {
        return;
      }
      seekToIndex(segment.index);
      setRepeatIndex(current => (current == null ? null : segment.index));
    },
    [isOfflineReading, seekToIndex],
  );

  const pauseAutoScroll = useCallback(() => {
    setAutoScrollPaused(true);
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
  }, []);

  const scheduleAutoScrollResume = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = setTimeout(() => {
      setAutoScrollPaused(false);
    }, AUTOSCROLL_RESUME_DELAY_MS);
  }, []);

  const handleScrollToIndexFailed = useCallback((info: {index: number}) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        animated: true,
        index: info.index,
        viewPosition: 0.5,
      });
    });
  }, []);

  const toggleVietnamese = useCallback(() => {
    setShowVietnamese(current => !current);
  }, []);

  const toggleIpa = useCallback(() => {
    setShowIpa(current => !current);
  }, []);

  const toggleRepeat = useCallback(() => {
    setAbLoopStartIndex(null);
    setAbLoopEndIndex(null);
    setRepeatIndex(current =>
      current !== null ? null : activeIndex >= 0 ? activeIndex : 0,
    );
  }, [activeIndex]);

  const setAbLoopPointA = useCallback(() => {
    setRepeatIndex(null);
    const index = activeIndex >= 0 ? activeIndex : 0;
    setAbLoopStartIndex(index);
    setAbLoopEndIndex(current =>
      current != null && current < index ? null : current,
    );
  }, [activeIndex]);

  const setAbLoopPointB = useCallback(() => {
    setRepeatIndex(null);
    const index = activeIndex >= 0 ? activeIndex : 0;
    setAbLoopStartIndex(start => {
      const startIndex = start ?? index;
      if (index < startIndex) {
        return index;
      }
      return startIndex;
    });
    setAbLoopEndIndex(index);
  }, [activeIndex]);

  const clearAbLoop = useCallback(() => {
    setAbLoopStartIndex(null);
    setAbLoopEndIndex(null);
  }, []);

  const cyclePlaybackRate = useCallback(() => {
    setPlaybackRate(current => nextYouTubePlaybackRate(current));
  }, []);

  const handleToggleSave = useCallback(
    async (segment: YouTubeSegment) => {
      const dbValue = savedVocabularyIds.has(segment.id);
      const isSaved = vocabularySaveState.getIsSaved(segment.id, dbValue);
      if (isSaved) {
        await onVocabularyUnsave(segment.id);
      } else {
        await onVocabularySave(segment.id, {
          lessonId: lesson.video.id,
          vocabulary: {
            id: segment.id,
            word: segment.en,
            phrase_from_text: segment.en,
            meaning_vi: segment.vi || '',
            ipa: segment.ipa || undefined,
            source_sentence: segment.en,
          },
        });
      }
    },
    [
      lesson.video.id,
      onVocabularySave,
      onVocabularyUnsave,
      savedVocabularyIds,
      vocabularySaveState,
    ],
  );

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<YouTubeSegment>) => (
      <TranscriptLine
        disabled={isOfflineReading}
        isActive={item.index === activeIndex}
        onPress={handleLinePress}
        segment={item}
        showIpa={showIpa}
        showVietnamese={showVietnamese}
        isSaved={vocabularySaveState.getIsSaved(
          item.id,
          savedVocabularyIds.has(item.id),
        )}
        onToggleSave={handleToggleSave}
        testID={`transcript-line-${item.id}`}
      />
    ),
    [
      activeIndex,
      handleLinePress,
      isOfflineReading,
      showIpa,
      showVietnamese,
      vocabularySaveState,
      savedVocabularyIds,
      handleToggleSave,
    ],
  );

  const headerActions = (
    <View style={styles.headerActions}>
      <IconButton
        accessibilityHint={t('youtube.display_vietnamese_hint')}
        accessibilityLabel={
          showVietnamese
            ? t('youtube.translation_hide_a11y')
            : t('youtube.translation_show_a11y')
        }
        icon="translate"
        onPress={toggleVietnamese}
        testID="youtube-toggle-vietnamese"
        tone={showVietnamese ? 'accent' : 'surface'}
      />
      <IconButton
        accessibilityHint={t('youtube.display_ipa_hint')}
        accessibilityLabel={
          showIpa ? t('youtube.ipa_hide_a11y') : t('youtube.ipa_show_a11y')
        }
        icon="subtitles"
        onPress={toggleIpa}
        testID="youtube-toggle-ipa"
        tone={showIpa ? 'accent' : 'surface'}
      />
      <IconButton
        accessibilityHint={t('youtube.playback_rate_hint')}
        accessibilityLabel={t('youtube.playback_rate_a11y', {
          rate: formatYouTubePlaybackRate(playbackRate),
        })}
        disabled={isOfflineReading}
        icon="schedule"
        onPress={cyclePlaybackRate}
        testID="youtube-playback-rate"
        tone={playbackRate === 1 ? 'surface' : 'accent'}
      />
      <IconButton
        accessibilityHint={t('youtube.ab_loop_a_hint')}
        accessibilityLabel={t('youtube.ab_loop_a_a11y', {
          index:
            abLoopStartIndex != null
              ? abLoopStartIndex + 1
              : t('youtube.ab_loop_unset'),
        })}
        disabled={isOfflineReading}
        icon="flag"
        onPress={setAbLoopPointA}
        testID="youtube-ab-loop-a"
        tone={abLoopStartIndex != null ? 'accent' : 'surface'}
      />
      <IconButton
        accessibilityHint={t('youtube.ab_loop_b_hint')}
        accessibilityLabel={t('youtube.ab_loop_b_a11y', {
          index:
            abLoopEndIndex != null
              ? abLoopEndIndex + 1
              : t('youtube.ab_loop_unset'),
        })}
        disabled={isOfflineReading}
        icon="compare"
        onPress={setAbLoopPointB}
        testID="youtube-ab-loop-b"
        tone={abLoopActive ? 'accent' : 'surface'}
      />
      {abLoopStartIndex != null || abLoopEndIndex != null ? (
        <IconButton
          accessibilityHint={t('youtube.ab_loop_clear_hint')}
          accessibilityLabel={t('youtube.ab_loop_clear_a11y')}
          disabled={isOfflineReading}
          icon="close"
          onPress={clearAbLoop}
          testID="youtube-ab-loop-clear"
          tone="surface"
        />
      ) : null}
      <IconButton
        accessibilityHint={t('youtube.repeat_toggle_hint')}
        accessibilityLabel={
          repeatIndex !== null
            ? t('youtube.repeat_off_a11y')
            : t('youtube.repeat_on_a11y')
        }
        disabled={isOfflineReading}
        icon="repeat"
        onPress={toggleRepeat}
        testID="youtube-toggle-repeat"
        tone={repeatIndex !== null ? 'accent' : 'surface'}
      />
      {onStartPractice && (
        <IconButton
          accessibilityHint={t('youtube.practice_hint', {defaultValue: 'Luyện tập câu'})}
          accessibilityLabel={t('youtube.practice_title', {defaultValue: 'Luyện tập'})}
          icon="school"
          onPress={onStartPractice}
          testID="youtube-start-practice"
          tone="surface"
        />
      )}
    </View>
  );

  return (
    <AppScreen>
      <ScreenHeader
        onBack={onBack}
        rightAction={headerActions}
        title={lesson.video.title}
      />
      <View style={styles.playerWrap}>
        <YouTubePlayer
          onError={setPlayerError}
          playbackRate={playbackRate}
          ref={playerRef}
          videoId={lesson.video.id}
        />
      </View>
      {isOfflineReading ? (
        <View style={styles.offlineBanner} testID="youtube-offline-banner">
          <AppText accessibilityRole="alert" variant="label">
            {t('youtube.offline_banner_title')}
          </AppText>
          <AppText color="secondary">
            {t('youtube.offline_banner_body')}
          </AppText>
        </View>
      ) : null}
      {abLoopActive ? (
        <View style={styles.playerControls}>
          <AppText color="secondary" testID="youtube-ab-loop-status" variant="caption">
            {t('youtube.ab_loop_active', {
              from: abLoopStartIndex! + 1,
              to: abLoopEndIndex! + 1,
            })}
          </AppText>
        </View>
      ) : null}
      {playerError ? (
        <View style={styles.errorBanner}>
          <AppText color="danger" testID="youtube-player-error">
            {t('youtube.player_error')}
          </AppText>
        </View>
      ) : null}
      <FlatList
        contentContainerStyle={[styles.list, {paddingBottom: feedClearance}]}
        data={lesson.segments}
        ItemSeparatorComponent={ListSeparator}
        keyExtractor={item => item.id}
        onScrollBeginDrag={pauseAutoScroll}
        onScrollEndDrag={scheduleAutoScrollResume}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        ref={listRef}
        renderItem={renderItem}
        testID="youtube-transcript-list"
      />
    </AppScreen>
  );
}

export function YouTubeLessonRouteScreen({
  navigation,
  route,
}: NativeStackScreenProps<HomeStackParamList, 'YouTubeLesson'>) {
  const {t} = useTranslation();
  const {theme} = useAppTheme();
  const fallbackStyles = useMemo(() => createStyles(theme), [theme]);
  const params = route.params;
  const lesson =
    'lesson' in params && params.lesson
      ? params.lesson
      : getYouTubeLesson('lessonId' in params ? params.lessonId : '');

  const handleStartPractice = useCallback(() => {
    if (!lesson) return;
    const questions = mapTranscriptToPractice(lesson.segments, 10);
    if (questions.length > 0) {
      navigation.navigate('Practice', {
        questions,
        title: t('youtube.practice_title', {defaultValue: 'Luyện tập'}),
      });
    }
  }, [lesson, navigation, t]);

  if (!lesson) {
    return (
      <AppScreen>
        <ScreenHeader
          onBack={() => navigation.goBack()}
          title={t('youtube.lesson_not_found_title')}
        />
        <View style={fallbackStyles.notFoundWrap}>
          <AppText
            color="danger"
            testID="youtube-lesson-not-found"
            variant="h2">
            {t('youtube.lesson_not_found_body')}
          </AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <YouTubeLessonScreen
      lesson={lesson}
      onBack={() => navigation.goBack()}
      onStartPractice={handleStartPractice}
    />
  );
}
