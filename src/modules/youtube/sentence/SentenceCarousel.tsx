import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  useWindowDimensions,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {useAppTheme, type AppTheme} from '@theme';
import type {SentenceEnrichment} from '@shared/schemas/sentence-contract';
import type {
  GrammarPoint,
  VocabEntry,
} from '@shared/schemas/sentence-contract';
import {SentenceCard, type SentenceCardSegment} from './SentenceCard';
import type {RetryBlockFn} from './useSentenceEnrichment';
import {
  CARD_SPACING_PT,
  calculateNearestCardIndex,
  getCardSnapInterval,
  getCardWidth,
} from './sentenceCardGeometry';

export type SentenceCarouselProps = {
  videoId: string;
  segments: readonly SentenceCardSegment[];
  /** Map of segment index to its known enrichment. */
  enrichmentMap?: Record<number, SentenceEnrichment | null>;
  /** Currently active sentence index (0-based). */
  activeIndex: number;
  /** Callback when user swipes/selects a different sentence card. */
  onSelectIndex: (index: number) => void;
  /** Proficiency level label (e.g. B1, Intermediate), null/omitted = hidden. */
  level?: string | null;
  /** Injectable per-block retry fetcher for tests. */
  retryBlock?: RetryBlockFn;
  /** Controlled translation visibility (true = show VI, false = hide VI). */
  showTranslation?: boolean;
  onToggleTranslation?: () => void;
  /** Set of saved segment IDs / indices. */
  savedSegmentIds?: Set<string | number>;
  onToggleSaveSegment?: (segment: SentenceCardSegment) => void;
  onPlaySentenceAudio?: (segment: SentenceCardSegment) => void;
  onPressWord?: (word: string) => void;
  onPracticeSentence?: (segment: SentenceCardSegment) => void;
  /** Saved word keys (lowercased) shared across cards for ★ sync. */
  savedWordIds?: Set<string>;
  onToggleWordSave?: (word: string, entry?: VocabEntry) => void;
  /** Saved grammar keys (point name). */
  savedGrammarIds?: Set<string>;
  onToggleGrammarSave?: (point: GrammarPoint) => void;
  testID?: string;
};

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      paddingBottom: theme.spacing.md,
      paddingTop: theme.spacing.xs,
    },
    cardWrap: {
      marginRight: CARD_SPACING_PT,
    },
  });
}

/**
 * SETE-330 (TASK-3, Stage 2): Horizontal carousel for sentence cards.
 *
 * Sizing:
 * - Card width: `screenWidth - 27pt`
 * - Gap: `10pt`
 * - Snap interval: `screenWidth - 17pt`
 * - Next card peek: `12–17pt` on trailing edge
 * - Snaps per card (35% threshold / 0.5 pt/ms velocity)
 * - Remembers vertical scroll position per card in session memory
 */
export function SentenceCarousel({
  videoId,
  segments,
  enrichmentMap = {},
  activeIndex,
  onSelectIndex,
  level,
  retryBlock,
  showTranslation,
  onToggleTranslation,
  savedSegmentIds,
  onToggleSaveSegment,
  onPlaySentenceAudio,
  onPressWord,
  onPracticeSentence,
  savedWordIds,
  onToggleWordSave,
  savedGrammarIds,
  onToggleGrammarSave,
  testID,
}: SentenceCarouselProps) {
  const {theme} = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const windowWidth = useWindowDimensions().width;

  const cardWidth = getCardWidth(windowWidth);
  const snapInterval = getCardSnapInterval(windowWidth);

  const flatListRef = useRef<FlatList<SentenceCardSegment>>(null);
  const scrollMemoryRef = useRef<Map<number, number>>(new Map());
  const isUserScrollingRef = useRef(false);

  // Sync horizontal carousel position when activeIndex changes externally
  useEffect(() => {
    if (isUserScrollingRef.current || segments.length === 0) {
      return;
    }
    const targetOffset = activeIndex * snapInterval;
    flatListRef.current?.scrollToOffset({
      animated: true,
      offset: targetOffset,
    });
  }, [activeIndex, segments.length, snapInterval]);

  const handleScrollOffsetChange = useCallback(
    (segmentIndex: number, offset: number) => {
      scrollMemoryRef.current.set(segmentIndex, offset);
    },
    [],
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isUserScrollingRef.current = false;
      const scrollX = event.nativeEvent.contentOffset.x;
      const nextIndex = calculateNearestCardIndex(
        scrollX,
        windowWidth,
        segments.length,
      );
      if (nextIndex !== activeIndex) {
        onSelectIndex(nextIndex);
      }
    },
    [activeIndex, onSelectIndex, segments.length, windowWidth],
  );

  const handleScrollBeginDrag = useCallback(() => {
    isUserScrollingRef.current = true;
  }, []);

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollX = event.nativeEvent.contentOffset.x;
      const nextIndex = calculateNearestCardIndex(
        scrollX,
        windowWidth,
        segments.length,
      );
      if (nextIndex !== activeIndex) {
        onSelectIndex(nextIndex);
      }
      isUserScrollingRef.current = false;
    },
    [activeIndex, onSelectIndex, segments.length, windowWidth],
  );

  const handleNextSentence = useCallback(
    (currentIndex: number) => {
      if (currentIndex < segments.length - 1) {
        onSelectIndex(currentIndex + 1);
      }
    },
    [onSelectIndex, segments.length],
  );

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<SentenceCardSegment>) => {
      const enrichment = enrichmentMap[item.index] ?? null;
      const initialScrollOffset = scrollMemoryRef.current.get(item.index) ?? 0;
      const isSaved = savedSegmentIds?.has(item.index) ?? false;

      return (
        <View style={styles.cardWrap}>
          <SentenceCard
            enrichment={enrichment}
            initialScrollOffset={initialScrollOffset}
            isSaved={isSaved}
            level={level}
            onNextSentence={() => handleNextSentence(item.index)}
            onPlaySentenceAudio={onPlaySentenceAudio}
            onPracticeSentence={onPracticeSentence}
            onPressWord={onPressWord}
            onScrollOffsetChange={handleScrollOffsetChange}
            onToggleSave={() => onToggleSaveSegment?.(item)}
            onToggleWordSave={onToggleWordSave}
            onToggleGrammarSave={onToggleGrammarSave}
            onToggleTranslation={onToggleTranslation}
            retryBlock={retryBlock}
            savedGrammarIds={savedGrammarIds}
            savedWordIds={savedWordIds}
            segment={item}
            showTranslation={showTranslation}
            testID={
              testID
                ? `${testID}-card-${item.index}`
                : `sentence-card-${item.index}`
            }
            totalSegments={segments.length}
            videoId={videoId}
            width={cardWidth}
          />
        </View>
      );
    },
    [
      cardWidth,
      enrichmentMap,
      handleNextSentence,
      handleScrollOffsetChange,
      level,
      onPlaySentenceAudio,
      onPracticeSentence,
      onPressWord,
      onToggleSaveSegment,
      onToggleTranslation,
      onToggleWordSave,
      onToggleGrammarSave,
      retryBlock,
      savedGrammarIds,
      savedSegmentIds,
      savedWordIds,
      segments.length,
      showTranslation,
      styles.cardWrap,
      testID,
      videoId,
    ],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: snapInterval,
      offset: snapInterval * index,
      index,
    }),
    [snapInterval],
  );

  return (
    <View style={styles.container} testID={testID}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={segments as SentenceCardSegment[]}
        decelerationRate="fast"
        disableIntervalMomentum={true}
        getItemLayout={getItemLayout}
        horizontal={true}
        keyExtractor={item => String(item.index)}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        ref={flatListRef}
        renderItem={renderItem}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={snapInterval}
        testID={testID ? `${testID}-list` : 'sentence-carousel-list'}
      />
    </View>
  );
}
