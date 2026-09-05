import { validFullOutput } from '../../fixtures';
import { __resetMockDatabases } from '../../../../test-utils/sqliteMock';
import { getDatabase, resetDatabaseForTests } from '../database';
import { open } from 'react-native-quick-sqlite';
import { DB_NAME } from '../constants';
import { saveLesson } from '../LessonRepository';
import {
  getDueFlashcards,
  listFlashcards,
  recordFlashcardRating,
  saveFlashcard,
  unsaveFlashcard,
} from '../FlashcardRepository';

function saveFixtureLesson(): string {
  const result = saveLesson({
    confirmedText: validFullOutput.original_text,
    sourceType: 'paste_text',
    lesson: validFullOutput,
  });

  if (!result.ok) {
    throw new Error(result.message);
  }

  return result.lessonId;
}

function insertLegacyScheduleRow({
  cardId,
  intervalDays,
  updatedAt = '2026-08-10T00:00:00.000Z',
}: {
  cardId: string;
  intervalDays: number;
  updatedAt?: string;
}): void {
  const db = open({ name: DB_NAME });
  db.execute(
    `INSERT INTO review_schedule (
      card_id, lesson_id, interval_days, next_review_at, last_reviewed_at,
      created_at, updated_at, ease_factor, repetitions, rating_scale
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      cardId,
      'legacy-lesson',
      intervalDays,
      '2026-08-10T00:00:00.000Z',
      null,
      updatedAt,
      updatedAt,
      2.5,
      0,
      'v1',
    ],
  );
}

function readScheduleRow(cardId: string) {
  const result = getDatabase().execute(
    'SELECT * FROM review_schedule WHERE card_id = ? LIMIT 1;',
    [cardId],
  );
  return (result.rows?.item(0) as
    | {
        card_id: string;
        interval_days: number;
        next_review_at: string;
        ease_factor: number;
        repetitions: number;
        rating_scale: string;
        updated_at: string;
      }
    | undefined) ?? null;
}

describe('FlashcardRepository', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({ name: DB_NAME }));
  });

  it('saves flashcard vocabulary with a lesson reference and lists it', () => {
    const lessonId = saveFixtureLesson();
    const saved = saveFlashcard({
      lessonId,
      vocabulary: validFullOutput.vocabulary[0],
      now: '2026-08-17T00:00:00.000Z',
    });

    expect(saved.ok).toBe(true);
    if (!saved.ok) {
      return;
    }

    const cards = listFlashcards();
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      id: saved.flashcardId,
      lessonId,
      vocabularyId: 'v1',
      word: 'offer',
      meaningVi: 'cung cấp, đề nghị',
      isSaved: true,
    });
  });

  it('filters flashcards by lesson id', () => {
    const firstLessonId = saveFixtureLesson();
    const secondLessonId = `${firstLessonId}-second`;

    saveFlashcard({
      lessonId: firstLessonId,
      vocabulary: validFullOutput.vocabulary[0],
      now: '2026-08-17T00:00:00.000Z',
    });
    saveFlashcard({
      lessonId: secondLessonId,
      vocabulary: {
        ...validFullOutput.vocabulary[0],
        id: 'v2',
        word: 'discount',
      },
      now: '2026-08-17T00:01:00.000Z',
    });

    expect(
      listFlashcards({ lessonId: firstLessonId }).map(card => card.word),
    ).toEqual(['offer']);
  });

  it('unsaves a flashcard without deleting its review history', () => {
    const lessonId = saveFixtureLesson();
    const saved = saveFlashcard({
      lessonId,
      vocabulary: validFullOutput.vocabulary[0],
      now: '2026-08-17T00:00:00.000Z',
    });
    expect(saved.ok).toBe(true);
    if (!saved.ok) {
      return;
    }

    recordFlashcardRating({
      flashcardId: saved.flashcardId,
      rating: 'good',
      reviewedAt: '2026-08-17T09:00:00.000Z',
    });

    expect(unsaveFlashcard(saved.flashcardId, '2026-08-17T10:00:00.000Z')).toBe(
      true,
    );
    expect(listFlashcards()).toHaveLength(0);
    expect(listFlashcards({ includeUnsaved: true })[0]).toMatchObject({
      id: saved.flashcardId,
      isSaved: false,
    });
  });

  it('records a good rating and pushes the card out of today due queue', () => {
    const lessonId = saveFixtureLesson();
    const saved = saveFlashcard({
      lessonId,
      vocabulary: validFullOutput.vocabulary[0],
      now: '2026-08-17T00:00:00.000Z',
    });
    expect(saved.ok).toBe(true);
    if (!saved.ok) {
      return;
    }

    expect(
      getDueFlashcards({ today: '2026-08-17T12:00:00.000Z' }),
    ).toHaveLength(1);

    const result = recordFlashcardRating({
      flashcardId: saved.flashcardId,
      rating: 'good',
      reviewedAt: '2026-08-17T12:00:00.000Z',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.intervalDays).toBe(1);
    expect(result.easeFactor).toBeCloseTo(2.5);
    expect(result.repetitions).toBe(1);
    expect(
      getDueFlashcards({ today: '2026-08-17T12:01:00.000Z' }),
    ).toHaveLength(0);
  });

  it('respects due queue soft cap and carries overflow to later calls', () => {
    const lessonId = saveFixtureLesson();

    for (let index = 0; index < 3; index += 1) {
      saveFlashcard({
        lessonId,
        vocabulary: {
          ...validFullOutput.vocabulary[0],
          id: `v${index}`,
          word: `word-${index}`,
        },
        now: `2026-08-1${index}T00:00:00.000Z`,
      });
    }

    const due = getDueFlashcards({
      today: '2026-08-17T12:00:00.000Z',
      limit: 2,
    });

    expect(due.map(card => card.word)).toEqual(['word-0', 'word-1']);
    expect(
      getDueFlashcards({ today: '2026-08-18T12:00:00.000Z' }),
    ).toHaveLength(3);
  });

  it('forgot rating resets the card to a 1-day relearn', () => {
    const lessonId = saveFixtureLesson();
    const saved = saveFlashcard({
      lessonId,
      vocabulary: validFullOutput.vocabulary[0],
      now: '2026-08-17T00:00:00.000Z',
    });
    expect(saved.ok).toBe(true);
    if (!saved.ok) {
      return;
    }

    recordFlashcardRating({
      flashcardId: saved.flashcardId,
      rating: 'good',
      reviewedAt: '2026-08-17T12:00:00.000Z',
    });
    const result = recordFlashcardRating({
      flashcardId: saved.flashcardId,
      rating: 'forgot',
      reviewedAt: '2026-08-18T12:00:00.000Z',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.intervalDays).toBe(1);
    expect(result.repetitions).toBe(0);

    const row = readScheduleRow(saved.flashcardId);
    expect(row?.interval_days).toBe(1);
    expect(row?.repetitions).toBe(0);
    expect(row?.rating_scale).toBe('v2');
    expect(row?.next_review_at).toBe('2026-08-19T12:00:00.000Z');
  });

  it('persists SM-2 ease and repetitions for hard, good and easy ratings', () => {
    const lessonId = saveFixtureLesson();

    const cases: Array<{
      rating: 'hard' | 'good' | 'easy';
      intervalDays: number;
      easeFactor: number;
      repetitions: number;
    }> = [
      { rating: 'hard', intervalDays: 7, easeFactor: 2.5, repetitions: 2 },
      { rating: 'good', intervalDays: 7, easeFactor: 2.5, repetitions: 2 },
      { rating: 'easy', intervalDays: 7, easeFactor: 2.5, repetitions: 2 },
    ];

    for (const testCase of cases) {
      const saved = saveFlashcard({
        lessonId,
        vocabulary: {
          ...validFullOutput.vocabulary[0],
          id: `sm2-${testCase.rating}`,
          word: `sm2-${testCase.rating}`,
        },
        now: '2026-08-17T00:00:00.000Z',
      });
      expect(saved.ok).toBe(true);
      if (!saved.ok) {
        return;
      }

      // Move the row to a mature SM-2 state so the rating produces a growth step.
      const db = getDatabase();
      db.execute(
        `UPDATE review_schedule
          SET interval_days = ?, ease_factor = ?, repetitions = ?, rating_scale = 'v2', updated_at = ?
          WHERE card_id = ?;`,
        [
          testCase.intervalDays,
          testCase.easeFactor,
          testCase.repetitions,
          '2026-08-17T00:00:00.000Z',
          saved.flashcardId,
        ],
      );

      const result = recordFlashcardRating({
        flashcardId: saved.flashcardId,
        rating: testCase.rating,
        reviewedAt: '2026-08-17T12:00:00.000Z',
      });
      expect(result.ok).toBe(true);
      if (!result.ok) {
        return;
      }

      const row = readScheduleRow(saved.flashcardId);
      expect(row?.rating_scale).toBe('v2');
      expect(row?.interval_days).toBe(result.intervalDays);
      expect(row?.ease_factor).toBeCloseTo(result.easeFactor);
      expect(row?.repetitions).toBe(result.repetitions);
    }
  });

  it('backfills pre-existing fixed-interval rows into SM-2 during migration', () => {
    insertLegacyScheduleRow({ cardId: 'legacy-new', intervalDays: 1 });
    insertLegacyScheduleRow({ cardId: 'legacy-7d', intervalDays: 7 });
    insertLegacyScheduleRow({ cardId: 'legacy-120d', intervalDays: 120 });

    // First database access applies migrations + one-time backfill.
    resetDatabaseForTests(getDatabase());

    expect(readScheduleRow('legacy-new')).toMatchObject({
      rating_scale: 'v2',
      ease_factor: 2.5,
      repetitions: 0,
    });
    expect(readScheduleRow('legacy-7d')).toMatchObject({
      rating_scale: 'v2',
      ease_factor: 2.5,
      repetitions: 2,
    });
    expect(readScheduleRow('legacy-120d')).toMatchObject({
      rating_scale: 'v2',
      ease_factor: 2.5,
      repetitions: 6,
    });
  });

  it('upgrades a still-v1 schedule row on its first SM-2 rating', () => {
    // Migrations have already run, then a legacy-v1 row appears (e.g. written by
    // an older code path mid-rollout). Rating must upgrade it before scheduling.
    getDatabase();
    insertLegacyScheduleRow({ cardId: 'late-v1', intervalDays: 7 });

    const result = recordFlashcardRating({
      flashcardId: 'late-v1',
      rating: 'good',
      reviewedAt: '2026-08-17T12:00:00.000Z',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.intervalDays).toBe(18); // round(7 * 2.5)
    expect(result.repetitions).toBe(3); // backfill(7) = 2, plus the good recall

    const row = readScheduleRow('late-v1');
    expect(row?.rating_scale).toBe('v2');
    expect(row?.interval_days).toBe(18);
    expect(row?.repetitions).toBe(3);
    expect(row?.next_review_at).toBe('2026-09-04T12:00:00.000Z');
  });
});
