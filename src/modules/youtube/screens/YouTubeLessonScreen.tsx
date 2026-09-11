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
import {
  YouTubePlayer,
  type YouTubePlayerErrorCode,
  type YouTubePlayerRef,
} from '../components/YouTubePlayer';
import {TranscriptLine} from '../components/TranscriptLine';
import {useTranscriptSync} from '../sync/useTranscriptSync';
import type {HomeStackParamList} from '@/app/navigation/types';
import {useFloatingTabBarClearance} from '@/app/navigation/tabBarMetrics';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

const AUTOSCROLL_RESUME_DELAY_MS = 5_000;

export type YouTubeLessonScreenProps = {
  lesson: YouTubeTranscript;
  onBack?: () => void;
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
    errorBanner: {
      paddingHorizontal: theme.gutter,
      paddingVertical: theme.spacing.sm,
    },
    list: {
      paddingBottom: theme.spacing.xl,
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
  });
}

export function YouTubeLessonScreen({
  lesson,
  onBack,
}: YouTubeLessonScreenProps) {
  const {theme} = useAppTheme();
  const {t} = useTranslation();
  const feedClearance = useFloatingTabBarClearance();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const playerRef = useRef<YouTubePlayerRef>(null);
  const listRef = useRef<FlatList<YouTubeSegment>>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevActiveIndexRef = useRef(-1);

  const [showTranslation, setShowTranslation] = useState(true);
  const [repeatIndex, setRepeatIndex] = useState<number | null>(null);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const [playerError, setPlayerError] = useState<YouTubePlayerErrorCode | null>(
    null,
  );

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
      seekToIndex(segment.index);
      setRepeatIndex(current => (current == null ? null : segment.index));
    },
    [seekToIndex],
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

  const toggleTranslation = useCallback(() => {
    setShowTranslation(current => !current);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatIndex(current =>
      current !== null ? null : activeIndex >= 0 ? activeIndex : 0,
    );
  }, [activeIndex]);

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<YouTubeSegment>) => (
      <TranscriptLine
        isActive={item.index === activeIndex}
        onPress={handleLinePress}
        segment={item}
        showTranslation={showTranslation}
        testID={`transcript-line-${item.id}`}
      />
    ),
    [activeIndex, handleLinePress, showTranslation],
  );

  const headerActions = (
    <View style={styles.headerActions}>
      <IconButton
        accessibilityHint={t('youtube.translation_toggle_hint')}
        accessibilityLabel={
          showTranslation
            ? t('youtube.translation_hide_a11y')
            : t('youtube.translation_show_a11y')
        }
        icon="translate"
        onPress={toggleTranslation}
        testID="youtube-toggle-translation"
        tone={showTranslation ? 'accent' : 'surface'}
      />
      <IconButton
        accessibilityHint={t('youtube.repeat_toggle_hint')}
        accessibilityLabel={
          repeatIndex !== null
            ? t('youtube.repeat_off_a11y')
            : t('youtube.repeat_on_a11y')
        }
        icon="repeat"
        onPress={toggleRepeat}
        testID="youtube-toggle-repeat"
        tone={repeatIndex !== null ? 'accent' : 'surface'}
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
      <View style={styles.playerWrap}>
        <YouTubePlayer
          onError={setPlayerError}
          ref={playerRef}
          videoId={lesson.video.id}
        />
      </View>
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
  return (
    <YouTubeLessonScreen
      lesson={route.params.lesson}
      onBack={() => navigation.goBack()}
    />
  );
}
