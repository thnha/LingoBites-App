import type { AIOutput } from '../schemas/ai-output-v1';
import type { VocabularyItem } from '../schemas/ai-output-v1';
import type { LessonSubjectKey } from '../../types/lesson';

export type LessonSourceType = 'camera' | 'gallery' | 'paste_text';

export type SavedLessonRecord = {
  id: string;
  anonymousUserId: string;
  lessonInputHash: string;
  title: string;
  sourceType: LessonSourceType;
  ocrRawText: string | null;
  confirmedText: string;
  vietnameseTranslation: string;
  summary: string | null;
  level: string;
  aiOutput: AIOutput;
  category: LessonSubjectKey;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LessonListItem = {
  id: string;
  title: string;
  summary: string | null;
  previewText: string;
  vocabularyCount: number;
  category: LessonSubjectKey;
  createdAt: string;
};

export type SaveLessonInput = {
  confirmedText: string;
  sourceType: LessonSourceType;
  ocrRawText?: string;
  lesson: AIOutput;
  promptVersion?: string;
};

export type SaveLessonResult =
  | { ok: true; lessonId: string; duplicate: boolean }
  | {
      ok: false;
      errorCode: 'LOCAL_DB_ERROR' | 'AI_INVALID_OUTPUT';
      message: string;
    };

export type ReviewRating = 'forgot' | 'hard' | 'good' | 'easy';

/**
 * Version flag for the scheduling model a schedule row is tracked under.
 * `v1` = legacy fixed-interval two-rating scheme (`remembered | forgot`);
 * `v2` = SM-2 four-rating scheme. Existing rows are one-time backfilled to `v2`
 * during the migration so old history is not silently reinterpreted.
 */
export type ReviewRatingScale = 'v1' | 'v2';

export type FlashcardRecord = {
  id: string;
  lessonId: string;
  vocabularyId: string;
  word: string;
  phraseFromText: string | null;
  wordType: string | null;
  meaningVi: string;
  pronunciationGuideVi: string | null;
  ipa: string | null;
  cefrLevel: string | null;
  sourceSentence: string | null;
  example: string | null;
  exampleTranslation: string | null;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReviewScheduleRecord = {
  cardId: string;
  lessonId: string;
  intervalDays: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  /** SM-2 ease factor (clamped to [1.3, 2.5]); default 2.5. */
  easeFactor: number;
  /** SM-2 repetition count of successful recalls. */
  repetitions: number;
  /** Scheduling model version this row is tracked under (see `ReviewRatingScale`). */
  ratingScale: ReviewRatingScale;
  createdAt: string;
  updatedAt: string;
};

export type SaveFlashcardInput = {
  lessonId: string;
  vocabulary: VocabularyItem;
  now?: string;
};

export type SaveFlashcardResult =
  | { ok: true; flashcardId: string; duplicate: boolean }
  | { ok: false; errorCode: 'LOCAL_DB_ERROR'; message: string };

export type ListFlashcardsOptions = {
  lessonId?: string;
  includeUnsaved?: boolean;
};

export type GetDueFlashcardsOptions = {
  today?: string;
  limit?: number;
};

export type RecordFlashcardRatingInput = {
  flashcardId: string;
  rating: ReviewRating;
  reviewedAt?: string;
};

export type RecordFlashcardRatingResult =
  | {
      ok: true;
      intervalDays: number;
      nextReviewAt: string;
      easeFactor: number;
      repetitions: number;
    }
  | {
      ok: false;
      errorCode: 'FLASHCARD_NOT_FOUND' | 'LOCAL_DB_ERROR';
      message: string;
    };
