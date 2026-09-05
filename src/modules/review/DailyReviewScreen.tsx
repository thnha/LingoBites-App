import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {AppButton} from '../../components/AppButton';
import {AppCard} from '../../components/AppCard';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import {Banner} from '../../components/Banner';
import {ErrorCard} from '../../components/ErrorCard';
import {FlipCard} from '../../components/FlipCard';
import {MaterialIcon} from '../../components/MaterialIcon';
import {Medallion} from '../../components/Medallion';
import {RatingControl} from '../../components/RatingControl';
import {useFeatureEnabled} from '../../release';
import {
  getCardDueAt,
  getDueFlashcards,
  listFlashcards,
  recordFlashcardRating,
} from '../../shared/db/FlashcardRepository';
import type {FlashcardRecord, ReviewRating} from '../../shared/db/types';
import {startReviewSession} from '../engagement/reviewSession';
import type {ReviewSession} from '../engagement/reviewSession';
import {reconcileReminders} from '../engagement/reminderService';
import {useAppTheme} from '../../theme';

const DEFAULT_SOFT_CAP = 10;

type Props = {
  navigation?: {
    goBack?: () => void;
    navigate?: (screen: string) => void;
    popToTop?: () => void;
  };
  softCap?: number;
};

type Summary = {
  reviewed: number;
  forgot: number;
  hard: number;
  good: number;
  easy: number;
};

function carryOverMessage(count: number): string {
  return `còn ${count} thẻ để dành lần ôn sau`;
}

function FlashcardFace({
  card,
  side,
}: {
  card: FlashcardRecord;
  side: 'front' | 'back';
}) {
  if (side === 'back') {
    return (
      <View style={styles.cardFace}>
        <AppText style={styles.word} variant="h2">{card.word}</AppText>
        <AppText color="primary" style={styles.meaning} variant="h3">
          {card.meaningVi}
        </AppText>
        {card.example ? (
          <AppText color="secondary" style={styles.example}>
            {card.example}
          </AppText>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.cardFace}>
      <AppText style={styles.word} variant="h2">{card.word}</AppText>
      {card.wordType || card.ipa ? (
        <AppText color="secondary">
          {card.wordType ? `[${card.wordType}] ` : ''}
          {card.ipa ? `/${card.ipa}/` : ''}
        </AppText>
      ) : null}
      {card.sourceSentence ? (
        <AppText color="muted" style={styles.example}>
          {card.sourceSentence}
        </AppText>
      ) : null}
    </View>
  );
}

export function DailyReviewScreen({
  navigation,
  softCap = DEFAULT_SOFT_CAP,
}: Props) {
  const {theme} = useAppTheme();
  const reviewSystemEnabled = useFeatureEnabled('reviewSystem');
  const [allDueCount] = useState(() => getDueFlashcards().length);
  const [sessionCards] = useState(() => getDueFlashcards({limit: softCap}));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary>({
    reviewed: 0,
    forgot: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [complete, setComplete] = useState(false);
  // Engagement session (SETE-89): records the rated cards and, when the session
  // ends, writes the gamification events that drive streak/XP/badges/pet state.
  const [session] = useState<ReviewSession>(() => startReviewSession());
  const [sessionXpEarned, setSessionXpEarned] = useState<number | null>(null);

  const savedCardCount = useMemo(() => listFlashcards().length, []);
  const carryOverCount = Math.max(0, allDueCount - sessionCards.length);
  const activeCard = sessionCards[currentIndex] ?? null;

  function finishNext(nextSummary: Summary) {
    setRatingError(null);
    setFlipped(false);
    if (currentIndex + 1 >= sessionCards.length) {
      setSummary(nextSummary);
      setComplete(true);
      finalizeSession();
      return;
    }
    setSummary(nextSummary);
    setCurrentIndex(index => index + 1);
  }

  /** Persists the session's gamification events (idempotent, no-op if empty). */
  function finalizeSession() {
    const outcome = session.finish();
    if (outcome?.ok) {
      setSessionXpEarned(outcome.xpEarned);
      // Ratings just moved several due times: reconcile reminders so stale ones
      // are cancelled and the new due times are scheduled (REQ-10 / VC-5).
      reconcileReminders();
    }
  }

  function handleRate(rating: ReviewRating) {
    const card = sessionCards[currentIndex];
    if (!card) {
      return;
    }

    const reviewedAt = new Date().toISOString();
    // Due instant before rating — needed to tell whether this was on time.
    const dueAt = getCardDueAt(card.id);
    const result = recordFlashcardRating({flashcardId: card.id, rating});
    const nextSummary = {
      reviewed: summary.reviewed + 1,
      forgot: summary.forgot + (rating === 'forgot' ? 1 : 0),
      hard: summary.hard + (rating === 'hard' ? 1 : 0),
      good: summary.good + (rating === 'good' ? 1 : 0),
      easy: summary.easy + (rating === 'easy' ? 1 : 0),
    };

    if (!result.ok) {
      setRatingError(result.message);
    } else {
      session.record({
        flashcardId: card.id,
        rating,
        dueAt,
        reviewedAt,
      });
    }
    finishNext(nextSummary);
  }

  function handleSkip() {
    finishNext({
      ...summary,
      reviewed: summary.reviewed + 1,
    });
  }

  function handleClose() {
    // Leave after rating at least one card still closes the session.
    finalizeSession();
    navigation?.goBack?.();
  }

  if (!reviewSystemEnabled) {
    return (
      <AppScreen>
        <View style={styles.centered}>
          <ErrorCard message="Tính năng ôn tập hiện chưa được bật." />
        </View>
      </AppScreen>
    );
  }

  if (sessionCards.length === 0) {
    return (
      <AppScreen>
        <View style={[styles.header, {paddingHorizontal: theme.gutter}]}>
          <AppText variant="h2">Ôn tập hôm nay</AppText>
          <Pressable
            accessibilityLabel="Đóng phiên ôn tập"
            accessibilityRole="button"
            onPress={handleClose}
            style={styles.closeButton}
            testID="review-close">
            <MaterialIcon name="close" size={22} />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Medallion label={savedCardCount === 0 ? '0' : '✓'} />
          <AppText style={styles.emptyTitle} variant="h2">
            {savedCardCount === 0 ? 'Chưa có flashcard' : 'Hoàn thành hôm nay'}
          </AppText>
          <AppText color="secondary" style={styles.emptyCopy}>
            {savedCardCount === 0
              ? 'Lưu flashcard đầu tiên để bắt đầu ôn mỗi ngày.'
              : 'Bạn đã ôn xong tất cả thẻ đến hạn hôm nay.'}
          </AppText>
        </View>
      </AppScreen>
    );
  }

  if (complete) {
    return (
      <AppScreen>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {paddingHorizontal: theme.gutter},
          ]}
          testID="review-summary">
          <AppText variant="h1">Tổng kết ôn tập</AppText>
          {carryOverCount > 0 ? (
            <Banner message={carryOverMessage(carryOverCount)} variant="neutral" />
          ) : null}
          <AppCard style={styles.summaryCard}>
            <View style={styles.statRow}>
              <Medallion label={`${summary.reviewed}`} size={76} />
              <View style={styles.statText}>
                <AppText color="secondary" variant="label">Đã ôn</AppText>
                <AppText testID="summary-reviewed-count" variant="h2">
                  {summary.reviewed}
                </AppText>
              </View>
            </View>
            <View style={styles.breakdown}>
              <View style={styles.breakdownItem}>
                <AppText color="secondary" variant="label">Quên</AppText>
                <AppText testID="summary-forgot-count" variant="h3">
                  {summary.forgot}
                </AppText>
              </View>
              <View style={styles.breakdownItem}>
                <AppText color="secondary" variant="label">Khó</AppText>
                <AppText testID="summary-hard-count" variant="h3">
                  {summary.hard}
                </AppText>
              </View>
              <View style={styles.breakdownItem}>
                <AppText color="secondary" variant="label">Tốt</AppText>
                <AppText testID="summary-good-count" variant="h3">
                  {summary.good}
                </AppText>
              </View>
              <View style={styles.breakdownItem}>
                <AppText color="secondary" variant="label">Dễ</AppText>
                <AppText testID="summary-easy-count" variant="h3">
                  {summary.easy}
                </AppText>
              </View>
            </View>
            {sessionXpEarned != null && sessionXpEarned > 0 ? (
              <View
                style={[
                  styles.xpRow,
                  {backgroundColor: theme.colors.accentSoft},
                ]}>
                <AppText
                  style={[styles.xpText, {color: theme.colors.primary}]}
                  testID="summary-xp-earned">
                  {`+${sessionXpEarned} XP hôm nay`}
                </AppText>
              </View>
            ) : null}
          </AppCard>
          <AppButton
            accessibilityLabel="Quay về Home"
            onPress={() => navigation?.popToTop?.() ?? navigation?.goBack?.()}
            title="Quay về Home"
          />
        </ScrollView>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={[styles.header, {paddingHorizontal: theme.gutter}]}>
        <View>
          <AppText color="secondary" variant="label">Ôn tập hôm nay</AppText>
          <AppText testID="review-progress" variant="h2">
            {`${currentIndex + 1} / ${sessionCards.length}`}
          </AppText>
        </View>
        <Pressable
          accessibilityLabel="Đóng phiên ôn tập"
          accessibilityRole="button"
          onPress={() => navigation?.goBack?.()}
          style={styles.closeButton}
          testID="review-close">
          <MaterialIcon name="close" size={22} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {paddingHorizontal: theme.gutter},
        ]}>
        {carryOverCount > 0 ? (
          <Banner message={carryOverMessage(carryOverCount)} variant="neutral" />
        ) : null}
        {ratingError ? <ErrorCard message={ratingError} /> : null}
        {activeCard ? (
          <FlipCard
            back={<FlashcardFace card={activeCard} side="back" />}
            flipped={flipped}
            front={<FlashcardFace card={activeCard} side="front" />}
            onFlip={() => setFlipped(value => !value)}
            testID="daily-review-flip-card"
          />
        ) : null}
        <RatingControl onRate={handleRate} onSkip={handleSkip} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  breakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  breakdownItem: {
    flexBasis: '46%',
    flexGrow: 1,
    gap: 4,
  },
  cardFace: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  closeButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  content: {
    gap: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  emptyCopy: {
    maxWidth: 280,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  example: {
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingVertical: 8,
  },
  meaning: {
    textAlign: 'center',
  },
  statRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  statText: {
    flex: 1,
    gap: 4,
  },
  summaryCard: {
    gap: 16,
  },
  word: {
    textAlign: 'center',
  },
  xpRow: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  xpText: {
    fontWeight: '700',
  },
});
