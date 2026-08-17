import type { ReviewRating, ReviewScheduleRecord } from './types';

export const DEFAULT_REVIEW_INTERVAL_DAYS = 1;

const FIXED_INTERVAL_DAYS = [1, 3, 7, 14, 30, 60, 120];

type CalculateNextReviewStateInput = {
  rating: ReviewRating;
  currentIntervalDays: number;
  reviewedAt?: string;
};

type NextReviewState = {
  intervalDays: number;
  nextReviewAt: string;
};

type SelectDueReviewCardsOptions = {
  today?: string;
  limit?: number;
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

function nextRememberedInterval(currentIntervalDays: number): number {
  const next = FIXED_INTERVAL_DAYS.find(days => days > currentIntervalDays);
  return next ?? FIXED_INTERVAL_DAYS[FIXED_INTERVAL_DAYS.length - 1];
}

export function calculateNextReviewState({
  rating,
  currentIntervalDays,
  reviewedAt = new Date().toISOString(),
}: CalculateNextReviewStateInput): NextReviewState {
  const intervalDays =
    rating === 'remembered'
      ? nextRememberedInterval(currentIntervalDays)
      : DEFAULT_REVIEW_INTERVAL_DAYS;

  return {
    intervalDays,
    nextReviewAt: addDays(reviewedAt, intervalDays),
  };
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
