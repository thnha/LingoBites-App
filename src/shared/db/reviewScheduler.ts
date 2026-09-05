import type {
  ReviewRating,
  ReviewRatingScale,
  ReviewScheduleRecord,
} from './types';

export const DEFAULT_REVIEW_INTERVAL_DAYS = 1;
/** SM-2: fixed interval after the second successful recall. */
export const SECOND_REVIEW_INTERVAL_DAYS = 6;

export const DEFAULT_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;
export const MAX_EASE_FACTOR = 2.5;

export const RATING_SCALE_V1: ReviewRatingScale = 'v1';
export const RATING_SCALE_V2: ReviewRatingScale = 'v2';

const FIXED_INTERVAL_DAYS = [1, 3, 7, 14, 30, 60, 120];

/** Legacy two-rating scale kept only for rows still flagged `v1`. */
export type LegacyReviewRating = 'remembered' | 'forgot';

/** Maps the four-rating scale to SM-2 quality grades (0-5). */
const SM2_QUALITY: Record<ReviewRating, number> = {
  forgot: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

type CalculateNextReviewStateInput = {
  rating: ReviewRating;
  easeFactor: number;
  repetitions: number;
  intervalDays: number;
  reviewedAt?: string;
};

type NextReviewState = {
  easeFactor: number;
  repetitions: number;
  intervalDays: number;
  nextReviewAt: string;
};

type SelectDueReviewCardsOptions = {
  today?: string;
  limit?: number;
};

type LegacyCalculateNextReviewStateInput = {
  rating: LegacyReviewRating;
  currentIntervalDays: number;
  reviewedAt?: string;
};

type LegacyNextReviewState = {
  intervalDays: number;
  nextReviewAt: string;
};

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function endOfUtcDay(isoDate: string): number {
  const date = new Date(isoDate);
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    23,
    59,
    59,
    999,
  );
}

function clampEaseFactor(easeFactor: number): number {
  return Math.min(MAX_EASE_FACTOR, Math.max(MIN_EASE_FACTOR, easeFactor));
}

function nextRememberedInterval(currentIntervalDays: number): number {
  const next = FIXED_INTERVAL_DAYS.find(days => days > currentIntervalDays);
  return next ?? FIXED_INTERVAL_DAYS[FIXED_INTERVAL_DAYS.length - 1];
}

/**
 * Legacy fixed-interval two-rating scheduler (`remembered | forgot`).
 *
 * Kept behind the per-row `ratingScale` version flag so rows that have not yet
 * been backfilled to `v2` keep working during rollout. New code should call
 * `calculateNextReviewStateV2` instead.
 */
export function calculateNextReviewStateV1({
  rating,
  currentIntervalDays,
  reviewedAt = new Date().toISOString(),
}: LegacyCalculateNextReviewStateInput): LegacyNextReviewState {
  const intervalDays =
    rating === 'remembered'
      ? nextRememberedInterval(currentIntervalDays)
      : DEFAULT_REVIEW_INTERVAL_DAYS;

  return {
    intervalDays,
    nextReviewAt: addDays(reviewedAt, intervalDays),
  };
}

/** Backward-compatible alias for callers still using the legacy name. */
export const calculateNextReviewState = calculateNextReviewStateV1;

/**
 * SM-2 scheduler over the four-rating scale (`forgot | hard | good | easy`).
 *
 * Grade mapping to SM-2 quality: forgot=0 (fail), hard=3, good=4, easy=5.
 * - `forgot` resets repetitions and schedules the minimum interval; ease factor
 *   is left unchanged (classic SM-2 does not penalise ease on failure).
 * - Successful ratings increment repetitions; intervals follow 1, 6, then
 *   `round(intervalDays * easeFactor)`.
 * - Ease factor is adjusted after each successful recall and clamped to
 *   `[MIN_EASE_FACTOR, MAX_EASE_FACTOR]`.
 */
export function calculateNextReviewStateV2({
  rating,
  easeFactor,
  repetitions,
  intervalDays,
  reviewedAt = new Date().toISOString(),
}: CalculateNextReviewStateInput): NextReviewState {
  if (rating === 'forgot') {
    return {
      easeFactor,
      repetitions: 0,
      intervalDays: DEFAULT_REVIEW_INTERVAL_DAYS,
      nextReviewAt: addDays(reviewedAt, DEFAULT_REVIEW_INTERVAL_DAYS),
    };
  }

  const quality = SM2_QUALITY[rating];
  const qualityDelta = 5 - quality;
  const nextEaseFactor = clampEaseFactor(
    easeFactor + (0.1 - qualityDelta * (0.08 + qualityDelta * 0.02)),
  );

  const nextRepetitions = repetitions + 1;
  const nextIntervalDays =
    repetitions <= 0
      ? DEFAULT_REVIEW_INTERVAL_DAYS
      : repetitions === 1
        ? SECOND_REVIEW_INTERVAL_DAYS
        : Math.max(1, Math.round(intervalDays * nextEaseFactor));

  return {
    easeFactor: nextEaseFactor,
    repetitions: nextRepetitions,
    intervalDays: nextIntervalDays,
    nextReviewAt: addDays(reviewedAt, nextIntervalDays),
  };
}

/**
 * Derives the SM-2 repetition count for a legacy fixed-interval row during the
 * one-time `v1 -> v2` backfill: a row sitting on a fixed-interval bucket at
 * index `n` was reached after `n` "remembered" ratings.
 */
export function legacyRepetitionsFromInterval(intervalDays: number): number {
  const index = FIXED_INTERVAL_DAYS.indexOf(intervalDays);
  return index > 0 ? index : 0;
}

export function selectDueReviewCards(
  schedules: ReviewScheduleRecord[],
  { today = new Date().toISOString(), limit }: SelectDueReviewCardsOptions = {},
): ReviewScheduleRecord[] {
  const dueBy = endOfUtcDay(today);
  const due = schedules
    .filter(schedule => new Date(schedule.nextReviewAt).getTime() <= dueBy)
    .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt));

  if (!limit || limit <= 0) {
    return due;
  }

  return due.slice(0, limit);
}
