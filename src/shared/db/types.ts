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

export type ReviewRating = 'remembered' | 'forgot';

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
  | { ok: true; intervalDays: number; nextReviewAt: string }
  | {
      ok: false;
      errorCode: 'FLASHCARD_NOT_FOUND' | 'LOCAL_DB_ERROR';
      message: string;
    };
