import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AppButton} from '@components/AppButton';
import {AppText} from '@components/AppText';
import {Chip} from '@components/Chip';
import {IconButton} from '@components/IconButton';
import {useAppTheme, type AppTheme} from '@theme';
import type {
  SentenceEnrichment,
  VocabEntry,
} from '@shared/schemas/sentence-contract';
import {
  useSentenceEnrichment,
  type RetryBlockFn,
} from './useSentenceEnrichment';
import {resolveKeyword, type SentenceBlockId} from './sentencePipeline';
import {
  CARD_BORDER_RADIUS_PT,
  CARD_HEADER_HEIGHT_PT,
  PINNED_AUDIO_BUTTON_SIZE_PT,
  formatCardHeaderTitle,
  formatGrammarBottomHint,
  formatNextSentencePrompt,
  getCardWidth,
  shouldShowPinnedSentence,
} from './sentenceCardGeometry';

export type SentenceCardSegment = {
  index: number;
  en: string;
  vi: string;
};

export type SentenceCardProps = {
  videoId: string;
  /**
   * C-01: the English sentence renders from `segment.en` only. This card
   * never keeps or derives a second copy of the sentence text.
   */
  segment: SentenceCardSegment;
  /** Enrichment known so far; `null` renders the 3-block skeleton. */
  enrichment: SentenceEnrichment | null;
  /** Injectable per-block fetcher for tests; defaults to the retry API. */
  retryBlock?: RetryBlockFn;
  testID?: string;
  /** Total number of sentences (M in `Câu N/M`). */
  totalSegments?: number;
  /** Lesson-level proficiency label (D-1), null/empty = omitted. */
  level?: string | null;
  /** Initial or controlled translation visibility. Defaults to true. */
  showTranslation?: boolean;
  onToggleTranslation?: () => void;
  /** Bookmark/save status of this card. */
  isSaved?: boolean;
  onToggleSave?: () => void;
  /** Play audio for the sentence (used by pinned audio button). */
  onPlaySentenceAudio?: (segment: SentenceCardSegment) => void;
  /** Tapping a word token. */
  onPressWord?: (word: string) => void;
  /** Practice action handler. */
  onPracticeSentence?: (segment: SentenceCardSegment) => void;
  /** Next sentence prompt tap handler. */
  onNextSentence?: () => void;
  /** Initial vertical scroll offset to restore from session memory. */
  initialScrollOffset?: number;
  /** Called when vertical scroll position changes to update session memory. */
  onScrollOffsetChange?: (segmentIndex: number, offset: number) => void;
  /** Custom width for the card (defaults to screen width - 27pt). */
  width?: number;
};

/** Runs an async side effect without returning its promise to the caller. */
function fireAndForget(task: Promise<unknown>): void {
  task.catch(() => undefined);
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: CARD_BORDER_RADIUS_PT,
      overflow: 'hidden',
    },
    header: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderBottomColor: theme.colors.surfaceHigh,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      height: CARD_HEADER_HEIGHT_PT,
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
    },
    headerLeft: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    headerRight: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    pinnedBar: {
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceHigh,
      borderBottomColor: theme.colors.surfaceMuted,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      height: 44,
      paddingHorizontal: theme.spacing.md,
      position: 'absolute',
      left: 0,
      right: 0,
      top: CARD_HEADER_HEIGHT_PT,
      zIndex: 10,
    },
    pinnedText: {
      flex: 1,
    },
    pinnedAudioBtn: {
      alignItems: 'center',
      borderRadius: PINNED_AUDIO_BUTTON_SIZE_PT / 2,
      height: PINNED_AUDIO_BUTTON_SIZE_PT,
      justifyContent: 'center',
      minHeight: PINNED_AUDIO_BUTTON_SIZE_PT,
      minWidth: PINNED_AUDIO_BUTTON_SIZE_PT,
      width: PINNED_AUDIO_BUTTON_SIZE_PT,
    },
    scrollContent: {
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    sentenceBlock: {
      gap: theme.spacing.xs,
    },
    translationRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    viBadge: {
      backgroundColor: theme.colors.surfaceHigh,
      borderRadius: theme.radius.sm,
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
    skeleton: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: theme.radius.md,
      height: 44,
    },
    blockError: {
      gap: theme.spacing.xs,
    },
    vocabRow: {
      gap: 2,
    },
    grammarPoint: {
      gap: 2,
    },
    practiceWrap: {
      marginTop: theme.spacing.xs,
    },
    bottomBar: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.surfaceHigh,
      borderTopWidth: StyleSheet.hairlineWidth,
      justifyContent: 'center',
      minHeight: 36,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
  });
}

function BlockSkeleton({
  testID,
  label,
  hint,
}: {
  testID: string;
  label: string;
  hint: string;
}) {
  const {theme} = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      style={styles.skeleton}
      testID={testID}
    />
  );
}

function BlockError({
  message,
  onRetry,
  retrying,
  retryLabel,
  testID,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
  retryLabel: string;
  testID: string;
}) {
  const {theme} = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.blockError} testID={testID}>
      <AppText color="danger">{message}</AppText>
      <AppButton
        loading={retrying}
        onPress={onRetry}
        testID={`${testID}-retry`}
        title={retryLabel}
        variant="secondary"
      />
    </View>
  );
}

function VocabRow({entry}: {entry: VocabEntry}) {
  const {theme} = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const note = entry.tip ?? entry.inSentenceNote;
  return (
    <View style={styles.vocabRow}>
      <AppText variant="bodyLg">
        {entry.word}
        <AppText color="muted"> · {entry.pos}</AppText>
      </AppText>
      <AppText color="secondary">
        {entry.meaning}
        {entry.ipa ? ` /${entry.ipa}/` : ''}
      </AppText>
      {note ? (
        <AppText color="muted" variant="caption">
          {note}
        </AppText>
      ) : null}
    </View>
  );
}

/**
 * SETE-329 (TASK-2) + SETE-330 (TASK-3): Sentence card with fixed 48pt header,
 * vertical scroll region, sticky pinned sentence on scroll past sentence,
 * bottom hint/prompt, and session scroll position memory.
 */
export function SentenceCard({
  videoId,
  segment,
  enrichment: initialEnrichment,
  retryBlock,
  testID,
  totalSegments,
  level,
  showTranslation: controlledShowTranslation,
  onToggleTranslation,
  isSaved = false,
  onToggleSave,
  onPlaySentenceAudio,
  onPressWord: _onPressWord,
  onPracticeSentence,
  onNextSentence,
  initialScrollOffset = 0,
  onScrollOffsetChange,
  width: customWidth,
}: SentenceCardProps) {
  const {theme} = useAppTheme();
  const {t} = useTranslation();
  const windowWidth = useWindowDimensions().width;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const cardWidth = customWidth ?? getCardWidth(windowWidth);

  const scrollViewRef = useRef<ScrollView>(null);
  const [internalShowTranslation, setInternalShowTranslation] = useState(true);
  const translationVisible =
    controlledShowTranslation !== undefined
      ? controlledShowTranslation
      : internalShowTranslation;

  const [scrollY, setScrollY] = useState(0);
  const [sentenceBlockHeight, setSentenceBlockHeight] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Restore scroll offset from session memory on mount
  useEffect(() => {
    if (initialScrollOffset > 0) {
      scrollViewRef.current?.scrollTo({
        y: initialScrollOffset,
        animated: false,
      });
    }
  }, [initialScrollOffset]);

  const {enrichment, states, errors, retrying, retry} = useSentenceEnrichment({
    videoId,
    segmentIndex: segment.index,
    initialEnrichment,
    retryBlock,
  });

  const blockTestID = useCallback(
    (block: SentenceBlockId, suffix?: string) =>
      testID
        ? `${testID}-block-${block}${suffix ? `-${suffix}` : ''}`
        : undefined,
    [testID],
  );

  const retryLabel = t('youtube.sentence_retry', {defaultValue: 'Thử lại'});
  const blockErrorMessage = (block: SentenceBlockId) =>
    errors[block] ??
    t('youtube.sentence_block_error', {
      defaultValue: 'Không tải được khối này',
    });
  const skeletonHint = t('youtube.sentence_loading_hint', {
    defaultValue: 'Nội dung sẽ hiện khi tải xong',
  });
  const skeletonLabel = (block: SentenceBlockId) =>
    t('youtube.sentence_loading_block', {
      block: t(`youtube.sentence_${block}`, {defaultValue: block}),
      defaultValue: 'Đang tải…',
    });

  const keyword = resolveKeyword(segment.en, enrichment);

  const handleToggleTranslation = useCallback(() => {
    if (onToggleTranslation) {
      onToggleTranslation();
    } else {
      setInternalShowTranslation(prev => !prev);
    }
  }, [onToggleTranslation]);

  const handleSentenceBlockLayout = useCallback((e: LayoutChangeEvent) => {
    setSentenceBlockHeight(e.nativeEvent.layout.height);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = event.nativeEvent.contentOffset.y;
      setScrollY(currentY);
      onScrollOffsetChange?.(segment.index, currentY);

      const layoutHeight = event.nativeEvent.layoutMeasurement.height;
      const contentHeight = event.nativeEvent.contentSize.height;
      const reachedBottom =
        contentHeight > 0 && currentY + layoutHeight >= contentHeight - 20;
      setIsAtBottom(reachedBottom);
    },
    [onScrollOffsetChange, segment.index],
  );

  const handleScrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({y: 0, animated: true});
  }, []);

  const isPinnedVisible = shouldShowPinnedSentence(
    scrollY,
    sentenceBlockHeight,
  );

  const grammarPoints = enrichment?.grammar ?? [];
  const grammarCount = grammarPoints.length;

  const headerTitle = formatCardHeaderTitle(segment.index + 1, totalSegments);

  const hasLevelBadge = level != null && level.trim() !== '';

  return (
    <View style={[styles.card, {width: cardWidth}]} testID={testID}>
      {/* 48pt Fixed Header */}
      <View
        style={styles.header}
        testID={testID ? `${testID}-header` : undefined}
      >
        <View style={styles.headerLeft}>
          <AppText
            testID={testID ? `${testID}-header-title` : undefined}
            variant="label"
          >
            {headerTitle}
          </AppText>
          {hasLevelBadge ? (
            <Chip
              label={level}
              testID={testID ? `${testID}-level` : undefined}
              tone="neutral"
            />
          ) : null}
        </View>
        <View style={styles.headerRight}>
          <IconButton
            accessibilityHint={t('youtube.display_vietnamese_hint')}
            accessibilityLabel={
              translationVisible
                ? t('youtube.translation_hide_a11y', {
                    defaultValue: 'Ẩn dịch',
                  })
                : t('youtube.translation_show_a11y', {
                    defaultValue: 'Hiện dịch',
                  })
            }
            icon="translate"
            onPress={handleToggleTranslation}
            testID={
              testID ? `${testID}-toggle-translation` : 'toggle-translation'
            }
            tone={translationVisible ? 'accent' : 'surface'}
          />
          <IconButton
            accessibilityHint={t('youtube.save_sentence_hint', {
              defaultValue: 'Lưu hoặc bỏ lưu câu này',
            })}
            accessibilityLabel={
              isSaved
                ? t('youtube.unsave_sentence_a11y', {
                    defaultValue: 'Bỏ lưu câu này',
                  })
                : t('youtube.save_sentence_a11y', {
                    defaultValue: 'Lưu câu này',
                  })
            }
            icon={isSaved ? 'bookmark' : 'bookmark_add'}
            onPress={onToggleSave}
            testID={testID ? `${testID}-toggle-save` : 'toggle-save'}
            tone={isSaved ? 'accent' : 'surface'}
          />
        </View>
      </View>

      {/* Sticky Pinned Sentence (shows when scrolled past sentence block) */}
      {isPinnedVisible ? (
        <Pressable
          accessibilityHint={t('youtube.sentence_scroll_to_top_hint', {
            defaultValue: 'Chạm để cuộn về đầu thẻ',
          })}
          accessibilityLabel={t('youtube.sentence_scroll_to_top_a11y', {
            defaultValue: 'Cuộn về đầu thẻ',
          })}
          accessibilityRole="button"
          onPress={handleScrollToTop}
          style={styles.pinnedBar}
          testID={testID ? `${testID}-pinned-sentence` : 'pinned-sentence'}
        >
          <AppText
            ellipsizeMode="tail"
            numberOfLines={1}
            style={styles.pinnedText}
            testID={
              testID ? `${testID}-pinned-sentence-text` : 'pinned-sentence-text'
            }
          >
            {segment.en}
          </AppText>
          <IconButton
            accessibilityHint={t('youtube.sentence_pinned_audio_hint', {
              defaultValue: 'Nghe phát âm cả câu',
            })}
            accessibilityLabel={t('youtube.sentence_pinned_audio_a11y', {
              defaultValue: 'Nghe câu này',
            })}
            icon="volume_up"
            onPress={() => onPlaySentenceAudio?.(segment)}
            size={PINNED_AUDIO_BUTTON_SIZE_PT}
            style={styles.pinnedAudioBtn}
            testID={testID ? `${testID}-pinned-audio` : 'pinned-audio'}
            tone="surface"
          />
        </Pressable>
      ) : null}

      {/* Vertical Scroll Region */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={false}
        onScroll={handleScroll}
        ref={scrollViewRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        testID={testID ? `${testID}-scroll` : undefined}
      >
        {/* 1. Sentence Block */}
        <View
          onLayout={handleSentenceBlockLayout}
          style={styles.sentenceBlock}
          testID={testID ? `${testID}-sentence-block` : undefined}
        >
          <AppText
            testID={testID ? `${testID}-en` : undefined}
            variant="bodyLg"
          >
            {segment.en}
          </AppText>
        </View>

        {/* 2. Translation Block (VI) */}
        {translationVisible && segment.vi !== '' ? (
          <View
            style={styles.translationRow}
            testID={testID ? `${testID}-vi-wrap` : undefined}
          >
            <View style={styles.viBadge}>
              <AppText color="muted" variant="caption">
                VI
              </AppText>
            </View>
            <AppText
              color="secondary"
              testID={testID ? `${testID}-vi` : undefined}
            >
              {segment.vi}
            </AppText>
          </View>
        ) : null}

        {/* 3. Selected Keyword Block */}
        {states.keyword === 'pending' ? (
          <BlockSkeleton
            hint={skeletonHint}
            label={skeletonLabel('keyword')}
            testID={blockTestID('keyword', 'skeleton') ?? 'keyword-skeleton'}
          />
        ) : states.keyword === 'failed' ? (
          <BlockError
            message={blockErrorMessage('keyword')}
            onRetry={() => fireAndForget(retry('keyword'))}
            retrying={retrying.keyword}
            retryLabel={retryLabel}
            testID={blockTestID('keyword', 'error') ?? 'keyword-error'}
          />
        ) : (
          <View testID={blockTestID('keyword', 'value')}>
            <Chip label={keyword} tone="accent" />
          </View>
        )}

        {/* 4. Vocab Block */}
        {states.vocab === 'pending' ? (
          <BlockSkeleton
            hint={skeletonHint}
            label={skeletonLabel('vocab')}
            testID={blockTestID('vocab', 'skeleton') ?? 'vocab-skeleton'}
          />
        ) : states.vocab === 'failed' ? (
          <BlockError
            message={blockErrorMessage('vocab')}
            onRetry={() => fireAndForget(retry('vocab'))}
            retrying={retrying.vocab}
            retryLabel={retryLabel}
            testID={blockTestID('vocab', 'error') ?? 'vocab-error'}
          />
        ) : states.vocab === 'ready' ? (
          <View testID={blockTestID('vocab', 'value')}>
            {(enrichment?.vocab ?? []).map(entry => (
              <VocabRow entry={entry} key={entry.word} />
            ))}
          </View>
        ) : null}

        {/* 5. Grammar Block */}
        {states.grammar === 'pending' ? (
          <BlockSkeleton
            hint={skeletonHint}
            label={skeletonLabel('grammar')}
            testID={blockTestID('grammar', 'skeleton') ?? 'grammar-skeleton'}
          />
        ) : states.grammar === 'failed' ? (
          <BlockError
            message={blockErrorMessage('grammar')}
            onRetry={() => fireAndForget(retry('grammar'))}
            retrying={retrying.grammar}
            retryLabel={retryLabel}
            testID={blockTestID('grammar', 'error') ?? 'grammar-error'}
          />
        ) : states.grammar === 'ready' ? (
          <View testID={blockTestID('grammar', 'value')}>
            {grammarPoints.map(point => (
              <View key={point.name} style={styles.grammarPoint}>
                <AppText variant="bodyLg">{point.name}</AppText>
                <AppText color="secondary">{point.analysis}</AppText>
              </View>
            ))}
          </View>
        ) : null}

        {/* 6. Practice Block */}
        {onPracticeSentence ? (
          <View
            style={styles.practiceWrap}
            testID={testID ? `${testID}-practice-wrap` : undefined}
          >
            <AppButton
              onPress={() => onPracticeSentence(segment)}
              testID={testID ? `${testID}-practice-button` : undefined}
              title={t('youtube.practice_title', {
                defaultValue: 'Luyện tập',
              })}
              variant="secondary"
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom Hint / Next Sentence Prompt */}
      <View
        style={styles.bottomBar}
        testID={testID ? `${testID}-bottom-bar` : undefined}
      >
        {totalSegments && segment.index < totalSegments - 1 ? (
          isAtBottom || grammarCount === 0 ? (
            <Pressable
              accessibilityHint={t('youtube.next_sentence_hint', {
                defaultValue: 'Chuyển sang câu kế tiếp',
              })}
              accessibilityLabel={formatNextSentencePrompt(segment.index + 2)}
              accessibilityRole="button"
              onPress={onNextSentence}
              testID={
                testID ? `${testID}-bottom-next-prompt` : 'bottom-next-prompt'
              }
            >
              <AppText color="muted" variant="caption">
                {formatNextSentencePrompt(segment.index + 2)}
              </AppText>
            </Pressable>
          ) : (
            <AppText
              color="muted"
              testID={
                testID ? `${testID}-bottom-grammar-hint` : 'bottom-grammar-hint'
              }
              variant="caption"
            >
              {formatGrammarBottomHint(grammarCount)}
            </AppText>
          )
        ) : totalSegments && segment.index === totalSegments - 1 ? (
          <AppText
            color="muted"
            testID={testID ? `${testID}-bottom-completed` : 'bottom-completed'}
            variant="caption"
          >
            {t('youtube.sentence_bottom_completed', {
              defaultValue: 'Hoàn thành bài',
            })}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
