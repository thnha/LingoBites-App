import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type DimensionValue,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type NativeTouchEvent,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AppText} from '@components/AppText';
import {IconButton} from '@components/IconButton';
import {MaterialIcon} from '@components/MaterialIcon';
import {useAppTheme, type AppTheme} from '@theme';
import type {YouTubeSegment} from '@shared/schemas/youtube-transcript-v1';
import {
  formatRemaining,
  formatSentenceLabel,
  snapSeekToSentence,
} from '../utils/sentenceSeek';
import {
  formatYouTubePlaybackRate,
  YOUTUBE_PLAYBACK_RATES,
  type YouTubePlaybackRate,
} from '../utils/playbackRate';
import {
  checkDictation,
  formatLoopLabel,
  SENTENCE_LOOP_OPTIONS,
  type SentenceLoopCount,
} from '../utils/toolsLogic';

const MIN_TOUCH_PT = 44;
const SCRUB_POLL_INTERVAL_MS = 500;
const SWIPE_DISMISS_THRESHOLD_PT = 50;

export type YouTubeToolsPopupProps = {
  visible: boolean;
  onClose: () => void;
  topOffset?: number;
  segments: readonly YouTubeSegment[];
  activeIndex: number;
  durationS: number;
  getCurrentTimeS: () => Promise<number>;
  playing: boolean;
  disabled?: boolean;
  onTogglePlay: () => void;
  onReplay: () => void;
  onPrevSentence: () => void;
  onNextSentence: () => void;
  onSeekToIndex: (index: number) => void;
  onSeekToSeconds: (seconds: number) => void;
  playbackRate: YouTubePlaybackRate;
  onSelectPlaybackRate: (rate: YouTubePlaybackRate) => void;
  loopCount: SentenceLoopCount;
  onSelectLoopCount: (count: SentenceLoopCount) => void;
  abLoopStartIndex: number | null;
  abLoopEndIndex: number | null;
  abLoopActive: boolean;
  onToggleAbLoop: () => void;
  onOpenTranscript: () => void;
};

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.surfaceHigh,
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      borderTopWidth: 1,
      bottom: 0,
      elevation: 12,
      left: 0,
      position: 'absolute',
      right: 0,
      shadowColor: theme.colors.text.primary,
      shadowOffset: {width: 0, height: -3},
      shadowOpacity: 0.15,
      shadowRadius: 8,
      zIndex: 100,
    },
    header: {
      alignItems: 'center',
      borderBottomColor: theme.colors.surfaceHigh,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.gutter,
      paddingVertical: theme.spacing.xs,
    },
    handleBar: {
      alignSelf: 'center',
      backgroundColor: theme.colors.surfaceHigh,
      borderRadius: theme.radius.pill,
      height: 4,
      marginBottom: theme.spacing.xs,
      width: 40,
    },
    title: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xxl,
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
    section: {
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      marginBottom: theme.spacing.xs,
    },
    seekTrack: {
      backgroundColor: theme.colors.surfaceHigh,
      borderRadius: theme.radius.pill,
      height: 28,
      justifyContent: 'center',
      width: '100%',
    },
    seekFill: {
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.pill,
      height: 4,
    },
    seekThumb: {
      backgroundColor: theme.colors.accentInk,
      borderRadius: theme.radius.pill,
      height: 12,
      position: 'absolute',
      width: 12,
    },
    seekTick: {
      backgroundColor: theme.colors.text.muted,
      height: 8,
      position: 'absolute',
      width: 2,
    },
    abRangeHighlight: {
      backgroundColor: theme.colors.accent,
      height: 6,
      opacity: 0.35,
      position: 'absolute',
    },
    seekMetaRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xs,
    },
    playbackRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.xs,
      justifyContent: 'space-between',
      marginTop: theme.spacing.xs,
    },
    actionButton: {
      alignItems: 'center',
      borderColor: theme.colors.surfaceHigh,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 4,
      justifyContent: 'center',
      minHeight: MIN_TOUCH_PT,
      minWidth: MIN_TOUCH_PT,
      paddingHorizontal: theme.spacing.sm,
    },
    actionButtonActive: {
      borderColor: theme.colors.accent,
    },
    pillsRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs,
    },
    pillButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceHigh,
      borderColor: theme.colors.surfaceHigh,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      flex: 1,
      justifyContent: 'center',
      minHeight: MIN_TOUCH_PT,
      paddingHorizontal: theme.spacing.xs,
    },
    pillButtonActive: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.accent,
    },
    dictationBox: {
      backgroundColor: theme.colors.surfaceHigh,
      borderRadius: theme.radius.md,
      marginTop: theme.spacing.xs,
      padding: theme.spacing.sm,
    },
    dictationInput: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.surfaceHigh,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      color: theme.colors.text.primary,
      fontSize: 15,
      minHeight: 44,
      marginTop: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    dictationActions: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.xs,
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
    },
    dictationResult: {
      marginTop: theme.spacing.xs,
    },
    transcriptButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceHigh,
      borderColor: theme.colors.surfaceHigh,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      minHeight: MIN_TOUCH_PT,
      paddingHorizontal: theme.spacing.md,
    },
  });
}

/**
 * SETE-332 (TASK-5): Tools popup sheet under the video player.
 * Contains scrubbing, prev/replay/play/AB/next, loop (1,3,5,inf), speed (0.5-1.25x),
 * dictation on-the-spot check, and transcript popup trigger.
 * Never darkens the video above, video remains playing.
 */
export function YouTubeToolsPopup({
  visible,
  onClose,
  topOffset = 220,
  segments,
  activeIndex,
  durationS,
  getCurrentTimeS,
  playing,
  disabled = false,
  onTogglePlay,
  onReplay,
  onPrevSentence,
  onNextSentence,
  onSeekToIndex,
  onSeekToSeconds,
  playbackRate,
  onSelectPlaybackRate,
  loopCount,
  onSelectLoopCount,
  abLoopStartIndex,
  abLoopEndIndex,
  abLoopActive,
  onToggleAbLoop,
  onOpenTranscript,
}: YouTubeToolsPopupProps) {
  const {theme} = useAppTheme();
  const {t} = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [currentS, setCurrentS] = useState(0);
  const [scrubS, setScrubS] = useState<number | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const scrubbingRef = useRef(false);

  // Dictation state (D-2)
  const [dictationOpen, setDictationOpen] = useState(false);
  const [dictationText, setDictationText] = useState('');
  const [dictationFeedback, setDictationFeedback] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);

  const getCurrentTimeSRef = useRef(getCurrentTimeS);
  getCurrentTimeSRef.current = getCurrentTimeS;

  // Poll current time when tools popup is open
  useEffect(() => {
    if (!visible || disabled) {
      return undefined;
    }
    let cancelled = false;
    const poll = async () => {
      if (scrubbingRef.current) {
        return;
      }
      try {
        const timeS = await getCurrentTimeSRef.current();
        if (!cancelled) {
          setCurrentS(Math.max(0, timeS));
        }
      } catch {
        // Keep last known position
      }
    };
    poll().catch(() => undefined);
    const intervalId = setInterval(() => {
      poll().catch(() => undefined);
    }, SCRUB_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [disabled, visible]);

  // Reset dictation feedback when sentence changes
  useEffect(() => {
    setDictationFeedback(null);
    setDictationText('');
  }, [activeIndex]);

  // Swipe-down to close pan responder on the header
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > SWIPE_DISMISS_THRESHOLD_PT) {
            onClose();
          }
        },
      }),
    [onClose],
  );

  if (!visible) {
    return null;
  }

  const shownS = scrubS ?? currentS;
  const fraction =
    durationS > 0 ? Math.min(1, Math.max(0, shownS / durationS)) : 0;

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const scrubToNativeX = (nativeX: number) => {
    if (trackWidth <= 0 || durationS <= 0) {
      return;
    }
    const next = Math.min(1, Math.max(0, nativeX / trackWidth)) * durationS;
    setScrubS(next);
  };

  const handleResponderGrant = (
    event: NativeSyntheticEvent<NativeTouchEvent>,
  ) => {
    scrubbingRef.current = true;
    scrubToNativeX(event.nativeEvent.locationX);
  };

  const handleResponderMove = (
    event: NativeSyntheticEvent<NativeTouchEvent>,
  ) => {
    scrubToNativeX(event.nativeEvent.locationX);
  };

  const handleResponderRelease = () => {
    scrubbingRef.current = false;
    setScrubS(current => {
      if (current == null) {
        return current;
      }
      const snapped = snapSeekToSentence(current, segments);
      const snappedIndex = segments.findIndex(
        segment => segment.start_ms / 1000 === snapped,
      );
      if (snappedIndex >= 0) {
        onSeekToIndex(snappedIndex);
      } else {
        onSeekToSeconds(snapped);
      }
      return null;
    });
  };

  const handleCheckDictation = () => {
    const currentSegment = segments[activeIndex];
    if (!currentSegment) {
      return;
    }
    const result = checkDictation(dictationText, currentSegment.en);
    setDictationFeedback(result);
  };

  const handleReplayForDictation = () => {
    onReplay();
  };

  const seekable = !disabled && durationS > 0;

  // A-B region calculation on the track
  const abHighlightStyle: {left: DimensionValue; width: DimensionValue} | null =
    abLoopActive &&
    abLoopStartIndex != null &&
    abLoopEndIndex != null &&
    durationS > 0
      ? {
          left: `${(segments[abLoopStartIndex].start_ms / 1000 / durationS) * 100}%` as DimensionValue,
          width: `${
            Math.max(
              0,
              ((segments[abLoopEndIndex].end_ms -
                segments[abLoopStartIndex].start_ms) /
                1000 /
                durationS) *
                100,
            )
          }%` as DimensionValue,
        }
      : null;

  return (
    <View
      accessibilityLabel="Bảng công cụ"
      accessibilityRole="none"
      style={[styles.container, {top: topOffset}]}
      testID="youtube-tools-popup"
    >
      <View {...panResponder.panHandlers} style={styles.header}>
        <View style={{flex: 1}}>
          <View style={styles.handleBar} />
          <AppText style={styles.title} testID="youtube-tools-title" variant="title">
            {t('youtube.tools_title', {defaultValue: 'Công cụ'})}
          </AppText>
        </View>
        <IconButton
          accessibilityHint="Đóng bảng công cụ"
          accessibilityLabel="Đóng công cụ"
          icon="close"
          onPress={onClose}
          testID="youtube-tools-close"
          tone="surface"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tua (Seek Section) */}
        <View style={styles.section}>
          <View
            accessibilityActions={[
              {name: 'increment', label: 'Câu sau'},
              {name: 'decrement', label: 'Câu trước'},
            ]}
            accessibilityHint="Chạm hoặc vuốt để tua tới câu"
            accessibilityLabel="Thanh tua câu"
            accessibilityRole="adjustable"
            accessibilityValue={{
              text:
                segments.length > 0
                  ? formatSentenceLabel(Math.max(0, activeIndex), segments.length)
                  : 'Câu –/–',
            }}
            onAccessibilityAction={event => {
              if (disabled || segments.length === 0) return;
              if (event.nativeEvent.actionName === 'increment') {
                const next = Math.min(segments.length - 1, Math.max(0, activeIndex) + 1);
                onSeekToIndex(next);
              } else if (event.nativeEvent.actionName === 'decrement') {
                const prev = Math.max(0, activeIndex - 1);
                onSeekToIndex(prev);
              }
            }}
            onLayout={handleTrackLayout}
            onResponderGrant={handleResponderGrant}
            onResponderMove={handleResponderMove}
            onResponderRelease={handleResponderRelease}
            onStartShouldSetResponder={() => seekable}
            style={styles.seekTrack}
            testID="youtube-tools-seek"
          >
            {abHighlightStyle ? (
              <View style={[styles.abRangeHighlight, abHighlightStyle]} />
            ) : null}
            <View
              style={[
                styles.seekFill,
                {width: `${fraction * 100}%` as DimensionValue},
              ]}
            />
            {segments.map(
              segment =>
                durationS > 0 && (
                  <View
                    key={segment.start_ms}
                    style={[
                      styles.seekTick,
                      {
                        left: `${(segment.start_ms / 1000 / durationS) * 100}%` as DimensionValue,
                      },
                    ]}
                  />
                ),
            )}
            <View
              style={[
                styles.seekThumb,
                {left: `${fraction * 100}%` as DimensionValue},
              ]}
            />
          </View>

          <View style={styles.seekMetaRow}>
            <AppText
              testID="youtube-tools-sentence-label"
              variant="label"
            >
              {segments.length > 0
                ? formatSentenceLabel(Math.max(0, activeIndex), segments.length)
                : 'Câu –/–'}
            </AppText>
            <AppText
              color="secondary"
              testID="youtube-tools-remaining"
              variant="body"
            >
              {formatRemaining(durationS, shownS)}
            </AppText>
          </View>

          {/* Controls Row: Prev, Replay, Play, A-B, Next */}
          <View style={styles.playbackRow}>
            <Pressable
              accessibilityHint="Chuyển về câu trước đó"
              accessibilityLabel="Câu trước"
              accessibilityRole="button"
              accessibilityState={{disabled: activeIndex <= 0 || disabled}}
              disabled={activeIndex <= 0 || disabled}
              onPress={onPrevSentence}
              style={[
                styles.actionButton,
                (activeIndex <= 0 || disabled) && {opacity: 0.4},
              ]}
              testID="youtube-tools-prev"
            >
              <MaterialIcon name="chevron_left" size={20} />
              <AppText variant="caption">Trước</AppText>
            </Pressable>

            <Pressable
              accessibilityHint="Nghe lại câu hiện tại"
              accessibilityLabel="Nghe lại"
              accessibilityRole="button"
              accessibilityState={{disabled}}
              disabled={disabled}
              onPress={onReplay}
              style={styles.actionButton}
              testID="youtube-tools-replay"
            >
              <MaterialIcon name="refresh" size={20} />
              <AppText variant="caption">Nghe lại</AppText>
            </Pressable>

            <Pressable
              accessibilityHint="Phát hoặc dừng video"
              accessibilityLabel={playing ? 'Dừng' : 'Phát'}
              accessibilityRole="button"
              accessibilityState={{disabled}}
              disabled={disabled}
              onPress={onTogglePlay}
              style={styles.actionButton}
              testID="youtube-tools-play-toggle"
            >
              <MaterialIcon name={playing ? 'play_circle' : 'play_circle'} size={20} />
              <AppText variant="label">{playing ? 'Dừng' : 'Phát'}</AppText>
            </Pressable>

            <Pressable
              accessibilityHint="Bật hoặc tắt lặp đoạn A-B"
              accessibilityLabel={
                abLoopActive
                  ? `A-B đang bật câu ${activeIndex + 1}`
                  : 'Lặp A-B'
              }
              accessibilityRole="button"
              accessibilityState={{selected: abLoopActive, checked: abLoopActive}}
              aria-pressed={abLoopActive}
              onPress={onToggleAbLoop}
              style={[
                styles.actionButton,
                abLoopActive && styles.actionButtonActive,
              ]}
              testID="youtube-tools-ab"
            >
              <MaterialIcon name="repeat" size={18} />
              <AppText
                style={abLoopActive ? {color: theme.colors.accent} : undefined}
                variant="label"
              >
                {abLoopActive ? `A–B ✓ ${activeIndex + 1}` : 'A–B'}
              </AppText>
            </Pressable>

            <Pressable
              accessibilityHint="Chuyển sang câu kế tiếp"
              accessibilityLabel="Câu sau"
              accessibilityRole="button"
              accessibilityState={{
                disabled: activeIndex >= segments.length - 1 || disabled,
              }}
              disabled={activeIndex >= segments.length - 1 || disabled}
              onPress={onNextSentence}
              style={[
                styles.actionButton,
                (activeIndex >= segments.length - 1 || disabled) && {
                  opacity: 0.4,
                },
              ]}
              testID="youtube-tools-next"
            >
              <AppText variant="caption">Sau</AppText>
              <MaterialIcon name="chevron_right" size={20} />
            </Pressable>
          </View>
        </View>

        {/* Lặp câu (Sentence Repeat Options: 1, 3, 5, inf) */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle} variant="label">
            {t('youtube.loop_section_title', {defaultValue: 'Lặp câu'})}
          </AppText>
          <View style={styles.pillsRow}>
            {SENTENCE_LOOP_OPTIONS.map(opt => {
              const active = loopCount === opt;
              const testIdSuffix = opt === Infinity ? 'inf' : String(opt);
              return (
                <Pressable
                  accessibilityLabel={`Lặp ${formatLoopLabel(opt)} lần`}
                  accessibilityRole="button"
                  accessibilityState={{selected: active, checked: active}}
                  aria-pressed={active}
                  key={String(opt)}
                  onPress={() => onSelectLoopCount(opt)}
                  style={[styles.pillButton, active && styles.pillButtonActive]}
                  testID={`youtube-tools-loop-${testIdSuffix}`}
                >
                  <AppText
                    style={active ? {color: theme.colors.accent} : undefined}
                    variant="label"
                  >
                    {formatLoopLabel(opt)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Tốc độ (Playback Speed Options: 0.5, 0.75, 1.0, 1.25) */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle} variant="label">
            {t('youtube.speed_section_title', {defaultValue: 'Tốc độ'})}
          </AppText>
          <View style={styles.pillsRow}>
            {YOUTUBE_PLAYBACK_RATES.map(rate => {
              const active = playbackRate === rate;
              return (
                <Pressable
                  accessibilityLabel={`Tốc độ ${formatYouTubePlaybackRate(rate)}`}
                  accessibilityRole="button"
                  accessibilityState={{selected: active}}
                  key={String(rate)}
                  onPress={() => onSelectPlaybackRate(rate)}
                  style={[styles.pillButton, active && styles.pillButtonActive]}
                  testID={`youtube-tools-speed-${rate}`}
                >
                  <AppText
                    style={active ? {color: theme.colors.accent} : undefined}
                    variant="label"
                  >
                    {formatYouTubePlaybackRate(rate)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Chép chính tả (Dictation - D-2 Bản tối thiểu) */}
        <View style={styles.section}>
          <Pressable
            accessibilityHint="Mở hoặc thu gọn phần chép chính tả"
            accessibilityLabel="Chép chính tả"
            accessibilityRole="button"
            onPress={() => setDictationOpen(o => !o)}
            style={[
              styles.actionButton,
              {width: '100%', justifyContent: 'space-between'},
            ]}
            testID="youtube-tools-dictation-toggle"
          >
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <MaterialIcon name="edit" size={20} />
              <AppText variant="label">
                {t('youtube.dictation_title', {
                  defaultValue: 'Chép chính tả',
                })}
              </AppText>
            </View>
            <MaterialIcon
              name={dictationOpen ? 'chevron_left' : 'chevron_right'}
              size={22}
            />
          </Pressable>

          {dictationOpen ? (
            <View style={styles.dictationBox} testID="youtube-tools-dictation-box">
              <AppText color="secondary" variant="caption">
                {t('youtube.dictation_hint', {
                  defaultValue: 'Nghe câu hiện tại và gõ lại tiếng Anh:',
                })}
              </AppText>
              <TextInput
                accessibilityLabel="Ô nhập chép chính tả"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setDictationText}
                placeholder="Gõ lại câu tiếng Anh..."
                placeholderTextColor={theme.colors.text.muted}
                style={styles.dictationInput}
                testID="youtube-tools-dictation-input"
                value={dictationText}
              />
              <View style={styles.dictationActions}>
                <Pressable
                  accessibilityHint="Nghe lại câu hiện tại"
                  accessibilityLabel="Nghe lại"
                  accessibilityRole="button"
                  onPress={handleReplayForDictation}
                  style={styles.actionButton}
                  testID="youtube-tools-dictation-replay"
                >
                  <MaterialIcon name="volume_up" size={18} />
                  <AppText variant="caption">Nghe</AppText>
                </Pressable>
                <Pressable
                  accessibilityHint="Kiểm tra nội dung đã gõ"
                  accessibilityLabel="Kiểm tra"
                  accessibilityRole="button"
                  onPress={handleCheckDictation}
                  style={[
                    styles.actionButton,
                    {backgroundColor: theme.colors.accent},
                  ]}
                  testID="youtube-tools-dictation-check"
                >
                  <AppText style={{color: theme.colors.accentInk}} variant="label">
                    Kiểm tra
                  </AppText>
                </Pressable>
              </View>
              {dictationFeedback ? (
                <AppText
                  style={[
                    styles.dictationResult,
                    {
                      color: dictationFeedback.correct
                        ? theme.colors.accent
                        : theme.colors.danger,
                    },
                  ]}
                  testID="youtube-tools-dictation-result"
                  variant="label"
                >
                  {dictationFeedback.message}
                </AppText>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Xem transcript (Transcript button) */}
        <View style={styles.section}>
          <Pressable
            accessibilityHint="Mở danh sách transcript đầy đủ"
            accessibilityLabel="Xem transcript"
            accessibilityRole="button"
            onPress={onOpenTranscript}
            style={styles.transcriptButton}
            testID="youtube-tools-open-transcript"
          >
            <MaterialIcon name="subtitles" size={20} />
            <AppText variant="label">
              {t('youtube.overflow_transcript', {
                defaultValue: 'Xem transcript',
              })}
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
