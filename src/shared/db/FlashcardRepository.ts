import { createRequestId } from '../api/requestId';
import { getDatabase } from './database';
import {
  DEFAULT_REVIEW_INTERVAL_DAYS,
  calculateNextReviewState,
} from './reviewScheduler';
import type {
  FlashcardRecord,
  GetDueFlashcardsOptions,
  ListFlashcardsOptions,
  RecordFlashcardRatingInput,
  RecordFlashcardRatingResult,
  SaveFlashcardInput,
  SaveFlashcardResult,
} from './types';

type FlashcardRow = {
  id: string;
  lesson_id: string;
  vocabulary_id: string;
  word: string;
  phrase_from_text: string | null;
  word_type: string | null;
  meaning_vi: string;
  pronunciation_guide_vi: string | null;
  ipa: string | null;
  cefr_level: string | null;
  source_sentence: string | null;
  example: string | null;
  example_translation: string | null;
  is_saved: number;
  created_at: string;
  updated_at: string;
};

type ReviewScheduleRow = {
  card_id: string;
  lesson_id: string;
  interval_days: number;
  next_review_at: string;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapFlashcardRow(row: FlashcardRow): FlashcardRecord {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    vocabularyId: row.vocabulary_id,
    word: row.word,
    phraseFromText: row.phrase_from_text,
    wordType: row.word_type,
    meaningVi: row.meaning_vi,
    pronunciationGuideVi: row.pronunciation_guide_vi,
    ipa: row.ipa,
    cefrLevel: row.cefr_level,
    sourceSentence: row.source_sentence,
    example: row.example,
    exampleTranslation: row.example_translation,
    isSaved: row.is_saved === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function firstRow<T>(result: {
  rows?: { item: (index: number) => unknown };
}): T | null {
  return (result.rows?.item(0) as T | undefined) ?? null;
}

export function saveFlashcard(input: SaveFlashcardInput): SaveFlashcardResult {
  try {
    const db = getDatabase();
    const now = input.now ?? new Date().toISOString();
    const existing = firstRow<FlashcardRow>(
      db.execute(
        'SELECT * FROM flashcards WHERE lesson_id = ? AND vocabulary_id = ? LIMIT 1;',
        [input.lessonId, input.vocabulary.id],
      ),
    );

    if (existing) {
      db.execute(
        'UPDATE flashcards SET is_saved = 1, updated_at = ? WHERE id = ?;',
        [now, existing.id],
      );
      return { ok: true, flashcardId: existing.id, duplicate: true };
    }

    const flashcardId = createRequestId();
    db.execute(
      `INSERT INTO flashcards (
        id, lesson_id, vocabulary_id, word, phrase_from_text, word_type,
        meaning_vi, pronunciation_guide_vi, ipa, cefr_level, source_sentence,
        example, example_translation, is_saved, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        flashcardId,
        input.lessonId,
        input.vocabulary.id,
        input.vocabulary.word,
        input.vocabulary.phrase_from_text ?? null,
        input.vocabulary.word_type ?? null,
        input.vocabulary.meaning_vi,
        input.vocabulary.pronunciation_guide_vi ?? null,
        input.vocabulary.ipa ?? null,
        input.vocabulary.cefr_level ?? null,
        input.vocabulary.source_sentence ?? null,
        input.vocabulary.example ?? null,
        input.vocabulary.example_translation ?? null,
        1,
        now,
        now,
      ],
    );
    db.execute(
      `INSERT INTO review_schedule (
        card_id, lesson_id, interval_days, next_review_at, last_reviewed_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        flashcardId,
        input.lessonId,
        DEFAULT_REVIEW_INTERVAL_DAYS,
        now,
        null,
        now,
        now,
      ],
    );

    return { ok: true, flashcardId, duplicate: false };
  } catch {
    return {
      ok: false,
      errorCode: 'LOCAL_DB_ERROR',
      message: 'Không thể lưu flashcard. Vui lòng thử lại.',
    };
  }
}

export function listFlashcards({
  lessonId,
  includeUnsaved = false,
}: ListFlashcardsOptions = {}): FlashcardRecord[] {
  const db = getDatabase();
  const clauses: string[] = [];
  const params: string[] = [];

  if (!includeUnsaved) {
    clauses.push('is_saved = 1');
  }
  if (lessonId) {
    clauses.push('lesson_id = ?');
    params.push(lessonId);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = db.execute(
    `SELECT * FROM flashcards ${where} ORDER BY datetime(created_at) ASC;`,
    params,
  );
  const rows = result.rows;
  const items: FlashcardRecord[] = [];

  if (!rows) {
    return items;
  }

  for (let index = 0; index < rows.length; index += 1) {
    items.push(mapFlashcardRow(rows.item(index) as FlashcardRow));
  }

  return items;
}

export function unsaveFlashcard(
  flashcardId: string,
  updatedAt = new Date().toISOString(),
): boolean {
  const db = getDatabase();
  const result = db.execute(
    'UPDATE flashcards SET is_saved = 0, updated_at = ? WHERE id = ?;',
    [updatedAt, flashcardId],
  );
  return (result.rowsAffected ?? 0) > 0;
}

export function getDueFlashcards({
  today = new Date().toISOString(),
  limit,
}: GetDueFlashcardsOptions = {}): FlashcardRecord[] {
  const end = new Date(today);
  end.setUTCHours(23, 59, 59, 999);

  const params: Array<string | number> = [end.toISOString()];
  const limitClause = limit && limit > 0 ? ' LIMIT ?' : '';
  if (limit && limit > 0) {
    params.push(limit);
  }

  const db = getDatabase();
  const result = db.execute(
    `SELECT flashcards.* FROM flashcards
      INNER JOIN review_schedule ON review_schedule.card_id = flashcards.id
      WHERE flashcards.is_saved = 1 AND review_schedule.next_review_at <= ?
      ORDER BY datetime(review_schedule.next_review_at) ASC${limitClause};`,
    params,
  );
  const rows = result.rows;
  const due: FlashcardRecord[] = [];

  if (!rows) {
    return due;
  }

  for (let index = 0; index < rows.length; index += 1) {
    due.push(mapFlashcardRow(rows.item(index) as FlashcardRow));
  }

  return due;
}

export function recordFlashcardRating(
  input: RecordFlashcardRatingInput,
): RecordFlashcardRatingResult {
  try {
    const db = getDatabase();
    const schedule = firstRow<ReviewScheduleRow>(
      db.execute('SELECT * FROM review_schedule WHERE card_id = ? LIMIT 1;', [
        input.flashcardId,
      ]),
    );

    if (!schedule) {
      return {
        ok: false,
        errorCode: 'FLASHCARD_NOT_FOUND',
        message: 'Không tìm thấy flashcard để ôn tập.',
      };
    }

    const reviewedAt = input.reviewedAt ?? new Date().toISOString();
    const next = calculateNextReviewState({
      rating: input.rating,
      currentIntervalDays: schedule.interval_days,
      reviewedAt,
    });
    const sessionId = createRequestId();

    db.execute(
      `INSERT INTO review_sessions (
        id, card_id, lesson_id, rating, reviewed_at, interval_days,
        next_review_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        sessionId,
        input.flashcardId,
        schedule.lesson_id,
        input.rating,
        reviewedAt,
        next.intervalDays,
        next.nextReviewAt,
        reviewedAt,
      ],
    );
    db.execute(
      `UPDATE review_schedule
        SET interval_days = ?, next_review_at = ?, last_reviewed_at = ?, updated_at = ?
        WHERE card_id = ?;`,
      [
        next.intervalDays,
        next.nextReviewAt,
        reviewedAt,
        reviewedAt,
        input.flashcardId,
      ],
    );

    return { ok: true, ...next };
  } catch {
    return {
      ok: false,
      errorCode: 'LOCAL_DB_ERROR',
      message: 'Không thể lưu kết quả ôn tập. Vui lòng thử lại.',
    };
  }
}
