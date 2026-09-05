import {
  DEFAULT_EASE_FACTOR,
  DEFAULT_REVIEW_INTERVAL_DAYS,
  RATING_SCALE_V1,
  RATING_SCALE_V2,
  calculateNextReviewStateV1,
  calculateNextReviewStateV2,
  legacyRepetitionsFromInterval,
  selectDueReviewCards,
} from '../reviewScheduler';
import type { ReviewScheduleRecord } from '../types';

function schedule(
  overrides: Partial<ReviewScheduleRecord>,
): ReviewScheduleRecord {
  return {
    cardId: overrides.cardId ?? 'card-1',
    lessonId: overrides.lessonId ?? 'lesson-1',
    intervalDays: overrides.intervalDays ?? DEFAULT_REVIEW_INTERVAL_DAYS,
    nextReviewAt: overrides.nextReviewAt ?? '2026-08-17T00:00:00.000Z',
    lastReviewedAt: overrides.lastReviewedAt ?? null,
    easeFactor: overrides.easeFactor ?? DEFAULT_EASE_FACTOR,
    repetitions: overrides.repetitions ?? 0,
    ratingScale: overrides.ratingScale ?? RATING_SCALE_V2,
    createdAt: overrides.createdAt ?? '2026-08-10T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-08-10T00:00:00.000Z',
  };
}

describe('reviewScheduler V2 (SM-2 four-rating)', () => {
  it('resets repetitions to a 1-day relearn when forgot', () => {
    const result = calculateNextReviewStateV2({
      rating: 'forgot',
      easeFactor: 2.5,
      repetitions: 4,
      intervalDays: 30,
      reviewedAt: '2026-08-17T12:00:00.000Z',
    });

    expect(result.repetitions).toBe(0);
    expect(result.easeFactor).toBeCloseTo(2.5);
    expect(result.intervalDays).toBe(1);
    expect(result.nextReviewAt).toBe('2026-08-18T12:00:00.000Z');
  });

  it('keeps the first successful interval at 1 day regardless of rating', () => {
    for (const rating of ['hard', 'good', 'easy'] as const) {
      const result = calculateNextReviewStateV2({
        rating,
        easeFactor: 2.5,
        repetitions: 0,
        intervalDays: 1,
        reviewedAt: '2026-08-17T12:00:00.000Z',
      });

      expect(result.repetitions).toBe(1);
      expect(result.intervalDays).toBe(1);
      expect(result.nextReviewAt).toBe('2026-08-18T12:00:00.000Z');
    }
  });

  it('uses the SM-2 six-day interval on the second successful recall', () => {
    const result = calculateNextReviewStateV2({
      rating: 'good',
      easeFactor: 2.5,
      repetitions: 1,
      intervalDays: 1,
      reviewedAt: '2026-08-17T12:00:00.000Z',
    });

    expect(result.repetitions).toBe(2);
    expect(result.intervalDays).toBe(6);
    expect(result.nextReviewAt).toBe('2026-08-23T12:00:00.000Z');
  });

  it('good keeps ease factor unchanged and grows the interval by ease', () => {
    const result = calculateNextReviewStateV2({
      rating: 'good',
      easeFactor: 2.5,
      repetitions: 4,
      intervalDays: 3,
      reviewedAt: '2026-08-17T12:00:00.000Z',
    });

    expect(result.repetitions).toBe(5);
    expect(result.easeFactor).toBeCloseTo(2.5);
    expect(result.intervalDays).toBe(8);
    expect(result.nextReviewAt).toBe('2026-08-25T12:00:00.000Z');
  });

  it('hard lowers the ease factor and shortens the next interval', () => {
    const result = calculateNextReviewStateV2({
      rating: 'hard',
      easeFactor: 2.5,
      repetitions: 4,
      intervalDays: 3,
      reviewedAt: '2026-08-17T12:00:00.000Z',
    });

    expect(result.repetitions).toBe(5);
    expect(result.easeFactor).toBeCloseTo(2.36);
    expect(result.intervalDays).toBe(7);
    expect(result.nextReviewAt).toBe('2026-08-24T12:00:00.000Z');
  });

  it('easy raises the ease factor toward the upper clamp', () => {
    const result = calculateNextReviewStateV2({
      rating: 'easy',
      easeFactor: 2.4,
      repetitions: 4,
      intervalDays: 3,
      reviewedAt: '2026-08-17T12:00:00.000Z',
    });

    expect(result.repetitions).toBe(5);
    expect(result.easeFactor).toBeCloseTo(2.5);
    expect(result.intervalDays).toBe(8);
  });

  it('clamps the ease factor to [1.3, 2.5]', () => {
    const hardAtFloor = calculateNextReviewStateV2({
      rating: 'hard',
      easeFactor: 1.3,
      repetitions: 2,
      intervalDays: 3,
      reviewedAt: '2026-08-17T12:00:00.000Z',
    });
    expect(hardAtFloor.easeFactor).toBeCloseTo(1.3);

    const easyAtCap = calculateNextReviewStateV2({
      rating: 'easy',
      easeFactor: 2.5,
      repetitions: 2,
      intervalDays: 3,
      reviewedAt: '2026-08-17T12:00:00.000Z',
    });
    expect(easyAtCap.easeFactor).toBeCloseTo(2.5);
  });
});

describe('reviewScheduler V1 (legacy fixed interval)', () => {
  it('increases interval and moves the next review date when remembered', () => {
    const result = calculateNextReviewStateV1({
      rating: 'remembered',
      currentIntervalDays: 1,
      reviewedAt: '2026-08-17T12:00:00.000Z',
    });

    expect(result.intervalDays).toBe(3);
    expect(result.nextReviewAt).toBe('2026-08-20T12:00:00.000Z');
  });

  it('resets interval to tomorrow when forgot', () => {
    const result = calculateNextReviewStateV1({
      rating: 'forgot',
      currentIntervalDays: 14,
      reviewedAt: '2026-08-17T12:00:00.000Z',
    });

    expect(result.intervalDays).toBe(1);
    expect(result.nextReviewAt).toBe('2026-08-18T12:00:00.000Z');
  });
});

describe('reviewScheduler backfill derivation', () => {
  it('derives repetitions from the legacy interval bucket', () => {
    expect(legacyRepetitionsFromInterval(1)).toBe(0);
    expect(legacyRepetitionsFromInterval(3)).toBe(1);
    expect(legacyRepetitionsFromInterval(7)).toBe(2);
    expect(legacyRepetitionsFromInterval(14)).toBe(3);
    expect(legacyRepetitionsFromInterval(30)).toBe(4);
    expect(legacyRepetitionsFromInterval(60)).toBe(5);
    expect(legacyRepetitionsFromInterval(120)).toBe(6);
  });

  it('falls back to a fresh state for unrecognised intervals', () => {
    expect(legacyRepetitionsFromInterval(0)).toBe(0);
    expect(legacyRepetitionsFromInterval(2)).toBe(0);
    expect(legacyRepetitionsFromInterval(-5)).toBe(0);
  });

  it('leaves a legacy v1 row schedulable under SM-2 after upgrade', () => {
    const v1Result = calculateNextReviewStateV1({
      rating: 'remembered',
      currentIntervalDays: 1,
      reviewedAt: '2026-08-17T12:00:00.000Z',
    });
    expect(v1Result.intervalDays).toBe(3);
    expect(RATING_SCALE_V1).toBe('v1');
    expect(RATING_SCALE_V2).toBe('v2');
  });
});

describe('selectDueReviewCards', () => {
  it('selects due cards up to the soft cap and leaves overflow eligible for carry-over', () => {
    const cards = [
      schedule({
        cardId: 'due-oldest',
        nextReviewAt: '2026-08-14T00:00:00.000Z',
      }),
      schedule({
        cardId: 'due-yesterday',
        nextReviewAt: '2026-08-16T00:00:00.000Z',
      }),
      schedule({
        cardId: 'due-today',
        nextReviewAt: '2026-08-17T23:59:59.000Z',
      }),
      schedule({ cardId: 'future', nextReviewAt: '2026-08-18T00:00:00.000Z' }),
    ];

    const due = selectDueReviewCards(cards, {
      today: '2026-08-17T12:00:00.000Z',
      limit: 2,
    });

    expect(due.map(card => card.cardId)).toEqual([
      'due-oldest',
      'due-yesterday',
    ]);
  });
});
