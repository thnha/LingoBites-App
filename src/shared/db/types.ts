import type {AIOutput} from '../schemas/ai-output-v1';
import type {VocabularyItem} from '../schemas/ai-output-v1';
import type {LessonSubjectKey} from '../../types/lesson';
import type {ContentMasteryState} from '../../modules/content/srs/contentScheduler';

export type {ContentMasteryState};

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
  | {ok: true; lessonId: string; duplicate: boolean}
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
  | {ok: true; flashcardId: string; duplicate: boolean}
  | {ok: false; errorCode: 'LOCAL_DB_ERROR'; message: string};

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
  | {ok: true; intervalDays: number; nextReviewAt: string}
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
};

/**
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

/**
 * A row of the `content_review_items` table (SETE-108 / M3, scheduled by
 * SETE-109 / M4). Created when the lesson runtime exits and a declared SRS
 * item (M1 `content_units` where `unit_type = 'srs'`) was backed by content
 * the learner actually completed. `mastery_state` and `next_review_at` are
 * owned by the fixed-interval scheduler in `modules/content/srs/contentScheduler`.
 */
export type ContentReviewItemMasteryState = ContentMasteryState;

export type ContentReviewItemRecord = {
  id: string;
  srsItemId: string;
  lessonId: string;
  packageId: string;
  itemType: string;
  sourceRefId: string;
  front: string;
  back: string;
  hintVi: string | null;
  masteryState: ContentReviewItemMasteryState;
  nextReviewAt: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * `item_type` tag used on `content_review_items` rows created by the Error
 * Notebook (SETE-110 / M5), so delete-my-data and other M5-scoped queries
 * can select just this milestone's contribution without touching M3/M4 rows.
 */
export const SPEAKING_ERROR_REVIEW_ITEM_TYPE = 'speaking_error' as const;

/** Speaking Room mode that produced a recording or a captured error event. */
export type SpeakingMode =
  | 'shadowing'
  | 'quick_answer'
  | 'standup'
  | 'app_description'
  | 'bug_report'
  | 'mock_interview';

/** A row of the `speaking_recordings` table (SETE-110 / M5, REQ-20/21). */
export type SpeakingRecordingRecord = {
  id: string;
  activityId: string | null;
  lessonId: string | null;
  mode: SpeakingMode;
  filePath: string;
  durationMs: number;
  createdAt: string;
};

export type InsertSpeakingRecordingInput = {
  id: string;
  activityId?: string | null;
  lessonId?: string | null;
  mode: SpeakingMode;
  filePath: string;
  durationMs: number;
  createdAt?: string;
};

/**
 * Six required error categories (REQ-28). CON-6: only this category code,
 * timestamps, and outcome flags may ever leave the device in a sync payload
 * — never the raw sentence the learner spoke/typed, and never audio bytes.
 */
export type ErrorEventCategory =
  | 'vocabulary'
  | 'structure'
  | 'listening'
  | 'pronunciation_affecting_meaning'
  | 'slow_response'
  | 'context_mismatch';

export type ErrorEventSource = 'lesson_runtime' | 'speaking' | 'speaking_room';

/** A row of the `error_events` table (SETE-110 / M5, REQ-28/29). */
export type ErrorEventRecord = {
  id: string;
  source: ErrorEventSource;
  category: ErrorEventCategory;
  activityId: string | null;
  lessonId: string | null;
  reviewItemId: string | null;
  createdAt: string;
};

export type CaptureErrorEventInput = {
  id: string;
  source: ErrorEventSource;
  category: ErrorEventCategory;
  activityId?: string | null;
  lessonId?: string | null;
  /** Front/back copy for the review item created for this error, if any. */
  reviewFront?: string;
  reviewBack?: string;
  reviewHintVi?: string | null;
  createdAt?: string;
};
