import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
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
  clearYouTubeProgress,
  getYouTubeProgress,
  saveYouTubeProgress,
} from '@shared/db/YouTubeProgressRepository';
import {
  YouTubePlayer,
  type YouTubePlayerErrorCode,
  type YouTubePlayerRef,
} from '../components/YouTubePlayer';
import {CompactControlBar} from '../components/CompactControlBar';
import {YouTubeMiniPlayer} from '../components/YouTubeMiniPlayer';
import {shouldShowMiniPlayer} from '../utils/sentenceSeek';
import {TranscriptLine} from '../components/TranscriptLine';
import {YouTubeLessonOverflowMenu} from './YouTubeLessonOverflowMenu';
import {YouTubeTranscriptPopup} from './YouTubeTranscriptPopup';
import {speak} from '@modules/audio';
import {
  useTranscriptSync,
  TRANSCRIPT_SYNC_POLL_INTERVAL_MS,
} from '../sync/useTranscriptSync';
import type {NavigationProp} from '@react-navigation/native';
import type {
  CreateStackParamList,
  RootStackParamList,
  RootTabParamList,
} from '@/app/navigation/types';
import {useFloatingTabBarClearance} from '@/app/navigation/tabBarMetrics';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useBookmarkOptimistic} from '../../lesson/useBookmarkOptimistic';
import {useFlashcardLibrary} from '../../lesson/useFlashcardLibrary';
import {mapTranscriptToPractice} from '../utils/practiceMapper';
import {
  nextYouTubePlaybackRate,
  type YouTubePlaybackRate,
} from '../utils/playbackRate';

const AUTOSCROLL_RESUME_DELAY_MS = 5_000;

export type YouTubeLessonScreenProps = {
  lesson: YouTubeTranscript;
  onBack?: () => void;
  onStartPractice?: () => void;
  /**
   * SETE-283 (HVB-07): the lesson opened even though the local save failed.
   * Shows a persistent not-saved warning instead of any saved state.
   */
  saveWarning?: boolean;
  /**
   * SETE-325 (C-3): when set, each line shows a mic button that reports
   * the tapped sentence (the route screen navigates it to SpeakingRoom).
   * The route screen owns navigation, so this screen only forwards taps.
   */
  onPracticeSentence?: (segment: YouTubeSegment) => void;
};

function ListSeparator() {
  const {theme} = useAppTheme();
  return <View style={{height: theme.spacing.xs}} />;
}

/** Runs an async side effect without returning its promise to the caller. */
function fireAndForget(task: Promise<unknown>): void {
  task.catch(() => undefined);
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
    saveWarningBanner: {
      gap: theme.spacing.xs,
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
    miniWrap: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
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
  saveWarning = false,
  onPracticeSentence,
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
  const [abLoopStartIndex, setAbLoopStartIndex] = useState<number | null>(null);
  const [abLoopEndIndex, setAbLoopEndIndex] = useState<number | null>(null);
  const [playbackRate, setPlaybackRate] = useState<YouTubePlaybackRate>(1);
  // SETE-305 (Option B): playback controls live in the overflow menu, so the
  // header always holds exactly 4 controls (VI, IPA, Practice, More) and Back
  // can never be squeezed out no matter how many loop points are set.
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false);
  // SETE-325 (C-4): transcript popup visibility.
  const [isTranscriptPopupOpen, setIsTranscriptPopupOpen] = useState(false);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const [playerError, setPlayerError] = useState<YouTubePlayerErrorCode | null>(
    null,
  );

  // SETE-328 (TASK-1): player shell state. `playing` mirrors the native
  // player (frame taps included) via onPlayingChange; `durationS` starts
  // from lesson metadata and upgrades to the real media duration on ready.
  const windowHeightPt = useWindowDimensions().height;
  const [playing, setPlaying] = useState(false);
  const [durationS, setDurationS] = useState(lesson.video.duration_seconds);
  const [playerBlockHeight, setPlayerBlockHeight] = useState(0);
  const [miniVisible, setMiniVisible] = useState(false);

  // A player error (e.g. no network / airplane mode) switches the screen to
  // offline reading mode: the cached EN + VI + IPA transcript stays fully
  // readable while every playback-dependent control is disabled.
  const isOfflineReading = playerError != null;

  // SETE-290 (DEV-2/DEV-4): a toggle must never present itself as on while
  // its content is empty — partial enrichment is a failed job upstream, but
  // the UI still fails closed for any lesson that carries empty fields.
  const hasVietnamese = lesson.segments.some(segment => segment.vi !== '');
  const hasIpa = lesson.segments.some(segment => segment.ipa !== '');
  const showVietnameseEffective = showVietnamese && hasVietnamese;
  const showIpaEffective = showIpa && hasIpa;

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

  // SETE-290 (DEV-3): resume progress — timestamp + active sentence, saved
  // per video and surviving app restarts. Reopening seeks to the saved
  // position but stays paused; the user presses Play to continue. Unsaved
  // lessons (saveWarning) never persist progress.
  const progressEnabled = !saveWarning;
  const [resume] = useState(() =>
    progressEnabled ? getYouTubeProgress(lesson.video.id) : null,
  );
  const progressRef = useRef({
    positionMs: resume?.positionMs ?? 0,
    segmentIndex: resume?.segmentIndex ?? 0,
  });

  const persistProgress = useCallback(() => {
    if (!progressEnabled) {
      return;
    }
    const {positionMs, segmentIndex} = progressRef.current;
    // Never create a row for a lesson that was opened but never played.
    if (
      positionMs <= 0 &&
      segmentIndex <= 0 &&
      getYouTubeProgress(lesson.video.id) == null
    ) {
      return;
    }
    saveYouTubeProgress({
      lessonId: lesson.video.id,
      positionMs,
      segmentIndex,
    });
  }, [lesson.video.id, progressEnabled]);

  const handlePlayerReady = useCallback(() => {
    if (resume && resume.positionMs > 0) {
      playerRef.current?.seekTo(resume.positionMs / 1000);
    }
    // SETE-328: upgrade the seek bar to the real media duration.
    const refreshDuration = async () => {
      try {
        const duration = await playerRef.current?.getDuration();
        if (duration != null && duration > 0) {
          setDurationS(duration);
        }
      } catch {
        // Keep the lesson metadata fallback.
      }
    };
    fireAndForget(refreshDuration());
  }, [resume]);

  const handlePlayingChange = useCallback((nextPlaying: boolean) => {
    setPlaying(nextPlaying);
  }, []);

  const handlePlayerEnded = useCallback(() => {
    // Completed: the next open starts from 0:00, first sentence, paused.
    progressRef.current = {positionMs: 0, segmentIndex: 0};
    if (progressEnabled) {
      clearYouTubeProgress(lesson.video.id);
    }
  }, [lesson.video.id, progressEnabled]);

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

  // SETE-328 (TASK-1): shell controls. Frame taps toggle play/pause
  // natively inside the iframe (no overlay is ever placed above it); these
  // buttons cover every other context — after seek, after ended, mini.
  const togglePlayPause = useCallback(() => {
    if (isOfflineReading) {
      return;
    }
    if (playing) {
      playerRef.current?.pause();
    } else {
      playerRef.current?.play();
    }
  }, [isOfflineReading, playing]);

  const replayActiveSentence = useCallback(() => {
    if (isOfflineReading) {
      return;
    }
    seekToIndex(activeIndex >= 0 ? activeIndex : 0);
  }, [activeIndex, isOfflineReading, seekToIndex]);

  const seekToSeconds = useCallback(
    (seconds: number) => {
      if (isOfflineReading) {
        return;
      }
      playerRef.current?.seekTo(seconds);
    },
    [isOfflineReading],
  );

  const getCurrentTimeS = useCallback(async () => {
    const seconds = await playerRef.current?.getCurrentTime();
    return seconds ?? 0;
  }, []);

  const handlePlayerBlockLayout = useCallback((event: LayoutChangeEvent) => {
    setPlayerBlockHeight(event.nativeEvent.layout.height);
  }, []);

  const handleListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrolledPastPx = event.nativeEvent.contentOffset.y;
      setMiniVisible(previous => {
        const next = shouldShowMiniPlayer({
          scrolledPastPx,
          playerHeightPx: playerBlockHeight,
          windowHeightPt,
        });
        return previous === next ? previous : next;
      });
    },
    [playerBlockHeight, windowHeightPt],
  );

  const scrollBackToPlayer = useCallback(() => {
    listRef.current?.scrollToOffset({animated: true, offset: 0});
  }, []);

  const abLoopActive =
    abLoopStartIndex != null &&
    abLoopEndIndex != null &&
    abLoopStartIndex <= abLoopEndIndex;

  // SETE-328: the Tools button highlights while a loop is armed or the rate
  // differs from 1× (the full tools popup itself belongs to TASK-5).
  const toolsArmed = abLoopActive || playbackRate !== 1;

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

  // Persist progress as the active sentence advances, and flush the latest
  // known position on unmount (exit mid-video).
  useEffect(() => {
    if (!progressEnabled || activeIndex < 0) {
      return;
    }
    progressRef.current.segmentIndex = activeIndex;
    void (async () => {
      const timeMs = await getCurrentTimeMs();
      progressRef.current.positionMs = Math.max(0, Math.floor(timeMs));
      persistProgress();
    })();
  }, [activeIndex, getCurrentTimeMs, persistProgress, progressEnabled]);

  useEffect(() => {
    return () => {
      persistProgress();
    };
  }, [persistProgress]);

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

  // SETE-325 (C-4): popup taps seek the video but never close the popup,
  // and never touch repeat mode — the popup is for hopping between
  // sentences, not for arming loops.
  const handlePopupSeek = useCallback(
    (segment: YouTubeSegment) => {
      if (isOfflineReading) {
        return;
      }
      seekToIndex(segment.index);
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

  const openOverflowMenu = useCallback(() => {
    setIsOverflowMenuOpen(true);
  }, []);

  const closeOverflowMenu = useCallback(() => {
    setIsOverflowMenuOpen(false);
  }, []);

  const openTranscriptPopup = useCallback(() => {
    setIsTranscriptPopupOpen(true);
  }, []);

  const closeTranscriptPopup = useCallback(() => {
    setIsTranscriptPopupOpen(false);
  }, []);

  // SETE-325 (C-2): tapping a word speaks it. The service defaults already
  // match the spec (locale en-US, rate 0.5). Failures surface the service's
  // own message (VOICE_UNAVAILABLE included) via an alert.
  const handlePressWord = useCallback(
    (word: string) => {
      async function speakWord(): Promise<void> {
        const result = await speak(word);
        if (!result.ok) {
          Alert.alert(
            t('youtube.tts_error_title', {
              defaultValue: 'Không phát được âm thanh',
            }),
            result.message,
          );
        }
      }
      fireAndForget(speakWord());
    },
    [t],
  );

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
        onPracticeSentence={onPracticeSentence}
        onPress={handleLinePress}
        onPressWord={handlePressWord}
        segment={item}
        showIpa={showIpaEffective}
        showVietnamese={showVietnameseEffective}
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
      handlePressWord,
      isOfflineReading,
      onPracticeSentence,
      showIpaEffective,
      showVietnameseEffective,
      vocabularySaveState,
      savedVocabularyIds,
      handleToggleSave,
    ],
  );

  // SETE-328 (TASK-1): the player block lives in the list header so it
  // scrolls with the transcript — the mini player takes over once it
  // scrolls strictly past 50% (immediately on compact screens).
  const playerHeader = useMemo(
    () => (
      <View onLayout={handlePlayerBlockLayout} testID="youtube-player-block">
        <View style={styles.playerWrap}>
          <YouTubePlayer
            onEnded={handlePlayerEnded}
            onError={setPlayerError}
            onPlayingChange={handlePlayingChange}
            onReady={handlePlayerReady}
            playbackRate={playbackRate}
            ref={playerRef}
            videoId={lesson.video.id}
          />
        </View>
        <CompactControlBar
          activeIndex={activeIndex}
          disabled={isOfflineReading}
          durationS={durationS}
          getCurrentTimeS={getCurrentTimeS}
          onOpenTools={openOverflowMenu}
          onReplay={replayActiveSentence}
          onSeekToIndex={seekToIndex}
          onSeekToSeconds={seekToSeconds}
          onTogglePlay={togglePlayPause}
          playing={playing}
          segments={lesson.segments}
          toolsArmed={toolsArmed}
        />
      </View>
    ),
    [
      activeIndex,
      durationS,
      getCurrentTimeS,
      handlePlayerBlockLayout,
      handlePlayerEnded,
      handlePlayerReady,
      handlePlayingChange,
      isOfflineReading,
      lesson.segments,
      lesson.video.id,
      openOverflowMenu,
      playbackRate,
      playing,
      replayActiveSentence,
      seekToIndex,
      seekToSeconds,
      styles,
      togglePlayPause,
      toolsArmed,
    ],
  );

  const headerActions = (
    <View style={styles.headerActions}>
      <IconButton
        accessibilityHint={t('youtube.display_vietnamese_hint')}
        accessibilityLabel={
          showVietnameseEffective
            ? t('youtube.translation_hide_a11y')
            : t('youtube.translation_show_a11y')
        }
        disabled={!hasVietnamese}
        icon="translate"
        onPress={toggleVietnamese}
        testID="youtube-toggle-vietnamese"
        tone={showVietnameseEffective ? 'accent' : 'surface'}
      />
      <IconButton
        accessibilityHint={t('youtube.display_ipa_hint')}
        accessibilityLabel={
          showIpaEffective
            ? t('youtube.ipa_hide_a11y')
            : t('youtube.ipa_show_a11y')
        }
        disabled={!hasIpa}
        icon="subtitles"
        onPress={toggleIpa}
        testID="youtube-toggle-ipa"
        tone={showIpaEffective ? 'accent' : 'surface'}
      />
      <IconButton
        accessibilityHint={t('youtube.practice_hint', {
          defaultValue: 'Luyện tập câu',
        })}
        accessibilityLabel={t('youtube.practice_title', {
          defaultValue: 'Luyện tập',
        })}
        disabled={!onStartPractice}
        icon="school"
        onPress={() => onStartPractice?.()}
        testID="youtube-start-practice"
        tone="surface"
      />
      <IconButton
        accessibilityHint={t('youtube.more_options_hint')}
        accessibilityLabel={t('youtube.more_options_a11y')}
        icon="more_vert"
        onPress={openOverflowMenu}
        testID="youtube-more-options"
        tone={isOverflowMenuOpen ? 'accent' : 'surface'}
      />
    </View>
  );

  return (
    <AppScreen>
      <ScreenHeader
        onBack={onBack}
        rightAction={headerActions}
        title={lesson.video.title}
      />
      <YouTubeLessonOverflowMenu
        abLoopActive={abLoopActive}
        abLoopEndIndex={abLoopEndIndex}
        abLoopStartIndex={abLoopStartIndex}
        disabledOffline={isOfflineReading}
        onClearAbLoop={clearAbLoop}
        onClose={closeOverflowMenu}
        onCyclePlaybackRate={cyclePlaybackRate}
        onOpenTranscript={openTranscriptPopup}
        onSetAbLoopPointA={setAbLoopPointA}
        onSetAbLoopPointB={setAbLoopPointB}
        onToggleRepeat={toggleRepeat}
        playbackRate={playbackRate}
        repeatActive={repeatIndex !== null}
        visible={isOverflowMenuOpen}
      />
      <YouTubeTranscriptPopup
        activeIndex={activeIndex}
        disabled={isOfflineReading}
        onClose={closeTranscriptPopup}
        onPracticeSentence={onPracticeSentence}
        onPressWord={handlePressWord}
        onSeekSegment={handlePopupSeek}
        segments={lesson.segments}
        showIpa={showIpaEffective}
        showVietnamese={showVietnameseEffective}
        visible={isTranscriptPopupOpen}
      />
      {saveWarning ? (
        <View
          style={styles.saveWarningBanner}
          testID="youtube-lesson-save-warning"
        >
          <AppText accessibilityRole="alert" variant="label">
            {t('youtube.save_failed_title')}
          </AppText>
          <AppText color="secondary">{t('youtube.save_failed_body')}</AppText>
        </View>
      ) : null}
      {!saveWarning && lesson.warnings.length > 0 ? (
        <View style={styles.saveWarningBanner} testID="youtube-lesson-warnings">
          <AppText variant="label">
            {t('youtube.lesson_warnings_title')}
          </AppText>
          {lesson.warnings.map(warning => (
            <AppText color="secondary" key={warning}>
              {warning}
            </AppText>
          ))}
        </View>
      ) : null}
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
          <AppText
            color="secondary"
            testID="youtube-ab-loop-status"
            variant="caption"
          >
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
        ListHeaderComponent={playerHeader}
        contentContainerStyle={[styles.list, {paddingBottom: feedClearance}]}
        data={lesson.segments}
        ItemSeparatorComponent={ListSeparator}
        keyExtractor={item => item.id}
        onScroll={handleListScroll}
        onScrollBeginDrag={pauseAutoScroll}
        onScrollEndDrag={scheduleAutoScrollResume}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        ref={listRef}
        renderItem={renderItem}
        scrollEventThrottle={16}
        testID="youtube-transcript-list"
      />
      {miniVisible && !isOfflineReading ? (
        <View style={[styles.miniWrap, {bottom: feedClearance}]}>
          <YouTubeMiniPlayer
            activeIndex={activeIndex}
            disabled={isOfflineReading}
            durationS={durationS}
            getCurrentTimeS={getCurrentTimeS}
            onOpenTools={openOverflowMenu}
            onPress={scrollBackToPlayer}
            onReplay={replayActiveSentence}
            onTogglePlay={togglePlayPause}
            playing={playing}
            totalSegments={lesson.segments.length}
            videoId={lesson.video.id}
          />
        </View>
      ) : null}
    </AppScreen>
  );
}

/**
 * SETE-289: registered on both the Create stack (fresh-create flow:
 * `YouTubeProcessing.replace('YouTubeLesson')`) and the RootStack
 * (opening a saved lesson from `YouTubeHistory` above the tabs).
 */
type YouTubeLessonRouteProps =
  | NativeStackScreenProps<CreateStackParamList, 'YouTubeLesson'>
  | NativeStackScreenProps<RootStackParamList, 'YouTubeLesson'>;

export function YouTubeLessonRouteScreen({
  navigation,
  route,
}: YouTubeLessonRouteProps) {
  // Same convention as GrammarDetailScreen: the union navigation prop is
  // only directly callable for shared signatures (goBack); narrow to one
  // stack for navigate — both stacks register Practice with identical
  // params, so the call behaves the same at either level.
  const nav = navigation as NativeStackScreenProps<
    CreateStackParamList,
    'YouTubeLesson'
  >['navigation'];
  const {t} = useTranslation();
  const {theme} = useAppTheme();
  const fallbackStyles = useMemo(() => createStyles(theme), [theme]);
  const params = route.params;
  const lesson =
    'lesson' in params && params.lesson
      ? params.lesson
      : getYouTubeLesson('lessonId' in params ? params.lessonId : '');
  // SETE-283 (HVB-07): the lesson opened even though the local save failed —
  // warn instead of presenting it as saved. Nothing was written, so History
  // gains no phantom row.
  const saveFailed =
    'lesson' in params && params.lesson && params.saveFailed === true;

  // SETE-290 (DEV-4): a freshly created lesson ends at Home — every Back
  // path (header, Android system, gesture) leaves the entry flow instead of
  // returning to the URL input. Saved lessons (lessonId, either stack) keep
  // the plain goBack contract owned by SETE-289.
  const isFreshLesson = 'lesson' in params && params.lesson != null;
  const exitToHome = useCallback(() => {
    // Same reset-then-tab pattern as YouTubeInputScreen.exitToHome
    // (SETE-287): no stale nested state, land on the Home tab. Only
    // reachable for fresh lessons, which live on the Create stack — hence
    // the Create-stack narrowing (same convention as `nav` above).
    const createNav = navigation as NativeStackScreenProps<
      CreateStackParamList,
      'YouTubeLesson'
    >['navigation'];
    createNav.reset({
      index: 0,
      routes: [{name: 'CreateMain'}],
    });
    createNav.getParent<NavigationProp<RootTabParamList>>()?.navigate('Home');
  }, [navigation]);

  useEffect(() => {
    if (!isFreshLesson) {
      return undefined;
    }
    return navigation.addListener('beforeRemove', e => {
      if (e.data.action.type !== 'POP') {
        return;
      }
      e.preventDefault();
      exitToHome();
    });
  }, [navigation, isFreshLesson, exitToHome]);

  const handleBack = useCallback(() => {
    if (isFreshLesson) {
      exitToHome();
      return;
    }
    navigation.goBack();
  }, [navigation, isFreshLesson, exitToHome]);

  const handleStartPractice = useCallback(() => {
    if (!lesson) return;
    const questions = mapTranscriptToPractice(lesson.segments, 10);
    if (questions.length > 0) {
      nav.navigate('Practice', {
        questions,
        title: t('youtube.practice_title', {defaultValue: 'Luyện tập'}),
      });
    }
  }, [lesson, nav, t]);

  // SETE-325 (C-3): "Luyện nói câu này" opens the Speaking Room with the
  // tapped sentence. Fresh lessons sit on the Create stack under the tabs,
  // so the room is reached through the tab parent; lessons opened from
  // History sit on the RootStack above the tabs and go through
  // Tabs > Lessons instead. The tab navigator is identified by its route
  // names (only the RootStack carries a navigator id), so a parent without
  // 'Lessons' among its routes is the RootStack navigator itself.
  // (A parent without getState only happens in test doubles, which stand
  // in for the tab parent.)
  const handlePracticeSentence = useCallback(
    (segment: YouTubeSegment) => {
      const sentenceText = segment.en;
      const tabParent = nav.getParent<NavigationProp<RootTabParamList>>();
      const tabRoutes = tabParent?.getState?.()?.routeNames;
      if (tabParent && (tabRoutes == null || tabRoutes.includes('Lessons'))) {
        tabParent.navigate('Lessons', {
          screen: 'SpeakingRoom',
          params: {sentenceText},
        });
        return;
      }
      const rootNav = tabParent as unknown as
        | NavigationProp<RootStackParamList>
        | undefined;
      rootNav?.navigate('Tabs', {
        screen: 'Lessons',
        params: {screen: 'SpeakingRoom', params: {sentenceText}},
      });
    },
    [nav],
  );

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
            variant="h2"
          >
            {t('youtube.lesson_not_found_body')}
          </AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <YouTubeLessonScreen
      lesson={lesson}
      onBack={handleBack}
      onPracticeSentence={handlePracticeSentence}
      onStartPractice={handleStartPractice}
      saveWarning={saveFailed === true}
    />
  );
}
