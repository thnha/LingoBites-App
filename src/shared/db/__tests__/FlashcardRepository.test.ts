import { validFullOutput } from '../../fixtures';
import { __resetMockDatabases } from '../../../../test-utils/sqliteMock';
import { resetDatabaseForTests } from '../database';
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
      rating: 'remembered',
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

  it('records remembered rating and pushes the card out of today due queue', () => {
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
      rating: 'remembered',
      reviewedAt: '2026-08-17T12:00:00.000Z',
    });

    expect(result.ok).toBe(true);
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
});
