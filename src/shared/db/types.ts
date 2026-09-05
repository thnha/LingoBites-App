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

/**
 * Local lifecycle of one downloaded chapter-audio file (ADR-3, REQ-9).
 *
 * `pending`  - listed in the chapter manifest, not downloaded yet.
 * `downloading` - a download is in flight; on app restart this is reset to
 *                 `pending` so a crashed download is retried, never stuck.
 * `ready`    - file exists at `local_path`, bytes recorded, checksum verified.
 * `failed`   - last attempt failed (network / checksum / storage). Keeps the
 *              manifest `url` + `checksum` so the UI can offer a retry.
 */
export type AudioDownloadStatus =
  | 'pending'
  | 'downloading'
  | 'ready'
  | 'failed';

/** One entry from the server-delivered per-chapter audio manifest (ADR-3). */
export type ChapterAudioAsset = {
  id: string;
  url: string;
  bytes: number;
  checksum: string;
};

export type AudioAssetRecord = {
  id: string;
  chapterId: string;
  url: string;
  localPath: string | null;
  bytes: number;
  checksum: string;
  downloadStatus: AudioDownloadStatus;
  updatedAt: string;
};

export type AudioCacheStats = {
  chapterCount: number;
  assetCount: number;
  readyBytes: number;
};

/** Per-chapter rollup of downloaded (ready) audio used for eviction decisions. */
export type ChapterAudioSummary = {
  chapterId: string;
  readyBytes: number;
  assetCount: number;
  lastOpenedAt: string | null;
};

/**
 * Types of events stored in the local `gamification_events` log (ADR-4, REQ-11).
 *
 * `review_session_completed` - one per finished review session that rated at
 *   least one card. Its `points` are the XP the session earned. A day only
 *   counts toward the streak when it contains one of these events.
 * `review_on_time` - one per card reviewed on or before the day it was due
 *   (see `isOnTimeReview`). Its `points` accrue as pet water; this is what
 *   makes pet resources depend on timely review behaviour, not wall-clock time.
 */
export type GamificationEventType =
  | 'review_session_completed'
  | 'review_on_time';

/** Input for appending a single row to the gamification event log. */
export type GamificationEventInput = {
  eventType: GamificationEventType;
  sourceEventId: string;
  points: number;
  createdAt: string;
};

/** A stored gamification event row (ADR-4 single source of truth). */
export type GamificationEventRecord = GamificationEventInput & {
  id: string;
 * Wire payload of a single review event sent to the server outbox endpoint.
 * Versioned so the server can reject unknown shapes instead of guessing.
 */
export type ReviewEventPayload = {
  schema_version: 1;
  anonymous_user_id: string;
  card_id: string;
  lesson_id: string;
  rating: ReviewRating;
  reviewed_at: string;
  interval_days: number;
  next_review_at: string;
  ease_factor: number;
  repetitions: number;
};

export const REVIEW_EVENT_SCHEMA_VERSION = 1 as const;
export const REVIEW_EVENT_TYPE = 'review' as const;

export type SyncOutboxEventType = typeof REVIEW_EVENT_TYPE;

/** Row of the local `sync_outbox` table (see migrations.ts). */
export type SyncOutboxRow = {
  id: string;
  event_type: SyncOutboxEventType;
  entity_id: string;
  payload_json: string;
  created_at: string;
  attempt_count: number;
  last_error: string | null;
  synced_at: string | null;
};

/** Parsed representation of an outbox row as used by the drain worker. */
export type SyncOutboxRecord = {
  id: string;
  eventType: SyncOutboxEventType;
  entityId: string;
  payload: ReviewEventPayload;
  createdAt: string;
  attemptCount: number;
  lastError: string | null;
  syncedAt: string | null;
};
