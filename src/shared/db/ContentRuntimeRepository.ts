/**
 * Repository for the lesson runtime (SETE-108 / M3).
 *
 * Reads denormalized lesson content back out of the tables the M2 importer
 * wrote (`content_lessons`, `content_items`, `content_activities`,
 * `content_audio_assets`, `content_units`) and writes the SRS review items
 * the runtime creates on lesson exit (`content_review_items`).
 *
 * Type-only imports from the schema barrel are erased by TypeScript, so this
 * file — like `importer/types.ts` — never pulls the schema module's
 * `node:crypto` import into the RN bundle.
 */

import {getDatabase} from './database';
import {getActivePackage} from './ContentPackageRepository';
import type {ContentReviewItemRecord} from './types';
import type {
  AudioAsset,
  DialogueTurn,
  QAItem,
  SrsItem,
} from '../../modules/content/schema';

export type ContentChunkRow = {
  id: string;
  lessonId: string;
  packageId: string;
  slug: string;
  order: number;
  phraseEn: string;
  phraseVi: string;
  explanationVi: string;
  contextSentenceEn: string | null;
  contextSentenceVi: string | null;
  grammarRefIds: string[];
  vocabRefIds: string[];
  dialogueTurns: DialogueTurn[];
  qaItems: QAItem[];
  audioRefIds: string[];
  srsRefIds: string[];
};

export type ContentActivityRow = {
  id: string;
  lessonId: string;
  packageId: string;
  slug: string;
  type: string;
  titleVi: string;
  chunkRefIds: string[];
  qaRefIds: string[];
  instructionsVi: string | null;
};

export type ContentLessonRow = {
  id: string;
  packageId: string;
  slug: string;
  titleEn: string;
  titleVi: string;
  blurbVi: string;
  level: string;
  targetSkills: string[];
  estimatedDurationMinutes: number;
};

export type ContentLessonListItem = {
  id: string;
  titleEn: string;
  titleVi: string;
  blurbVi: string;
  level: string;
  estimatedDurationMinutes: number;
};

type ChunkPayload = {
  grammar_ref_ids?: string[];
  vocab_ref_ids?: string[];
  dialogue_turns?: DialogueTurn[];
  qa_items?: QAItem[];
  audio_ref_ids?: string[];
  srs_ref_ids?: string[];
};

type ContentLessonDbRow = {
  id: string;
  package_id: string;
  slug: string;
  title_en: string;
  title_vi: string;
  blurb_vi: string;
  level: string;
  target_skills_json: string;
  estimated_duration_minutes: number;
};

type ContentItemDbRow = {
  id: string;
  lesson_id: string;
  package_id: string;
  slug: string;
  chunk_order: number;
  phrase_en: string;
  phrase_vi: string;
  explanation_vi: string;
  context_sentence_en: string | null;
  context_sentence_vi: string | null;
  payload_json: string;
};

type ContentActivityDbRow = {
  id: string;
  lesson_id: string;
  package_id: string;
  slug: string;
  activity_type: string;
  title_vi: string;
  chunk_ref_ids_json: string;
  qa_ref_ids_json: string;
  instructions_vi: string | null;
};

type ContentAudioAssetDbRow = {
  id: string;
  lesson_id: string;
  package_id: string;
  slug: string;
  url: string;
  checksum: string;
  bytes: number;
  locale: string | null;
  transcript: string | null;
};

type ContentUnitDbRow = {
  id: string;
  lesson_id: string;
  package_id: string;
  unit_type: string;
  slug: string;
  payload_json: string;
};

type ContentReviewItemDbRow = {
  id: string;
  srs_item_id: string;
  lesson_id: string;
  package_id: string;
  item_type: string;
  source_ref_id: string;
  front: string;
  back: string;
  hint_vi: string | null;
  mastery_state: string;
  next_review_at: string;
  created_at: string;
  updated_at: string;
};

function mapLessonRow(row: ContentLessonDbRow): ContentLessonRow {
  return {
    id: row.id,
    packageId: row.package_id,
    slug: row.slug,
    titleEn: row.title_en,
    titleVi: row.title_vi,
    blurbVi: row.blurb_vi,
    level: row.level,
    targetSkills: JSON.parse(row.target_skills_json) as string[],
    estimatedDurationMinutes: row.estimated_duration_minutes,
  };
}

function mapChunkRow(row: ContentItemDbRow): ContentChunkRow {
  const payload = JSON.parse(row.payload_json) as ChunkPayload;
  return {
    id: row.id,
    lessonId: row.lesson_id,
    packageId: row.package_id,
    slug: row.slug,
    order: row.chunk_order,
    phraseEn: row.phrase_en,
    phraseVi: row.phrase_vi,
    explanationVi: row.explanation_vi,
    contextSentenceEn: row.context_sentence_en,
    contextSentenceVi: row.context_sentence_vi,
    grammarRefIds: payload.grammar_ref_ids ?? [],
    vocabRefIds: payload.vocab_ref_ids ?? [],
    dialogueTurns: payload.dialogue_turns ?? [],
    qaItems: payload.qa_items ?? [],
    audioRefIds: payload.audio_ref_ids ?? [],
    srsRefIds: payload.srs_ref_ids ?? [],
  };
}

function mapActivityRow(row: ContentActivityDbRow): ContentActivityRow {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    packageId: row.package_id,
    slug: row.slug,
    type: row.activity_type,
    titleVi: row.title_vi,
    chunkRefIds: JSON.parse(row.chunk_ref_ids_json) as string[],
    qaRefIds: JSON.parse(row.qa_ref_ids_json) as string[],
    instructionsVi: row.instructions_vi,
  };
}

function mapAudioAssetRow(row: ContentAudioAssetDbRow): AudioAsset {
  return {
    id: row.id,
    slug: row.slug,
    url: row.url,
    checksum: row.checksum,
    locale: row.locale ?? undefined,
    transcript: row.transcript ?? undefined,
  };
}

function mapReviewItemRow(row: ContentReviewItemDbRow): ContentReviewItemRecord {
  return {
    id: row.id,
    srsItemId: row.srs_item_id,
    lessonId: row.lesson_id,
    packageId: row.package_id,
    itemType: row.item_type,
    sourceRefId: row.source_ref_id,
    front: row.front,
    back: row.back,
    hintVi: row.hint_vi,
    masteryState: row.mastery_state as ContentReviewItemRecord['masteryState'],
    nextReviewAt: row.next_review_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** All lessons belonging to the currently active content package. */
export function listActivePackageLessons(): ContentLessonListItem[] {
  const active = getActivePackage();
  if (!active) {
    return [];
  }
  const db = getDatabase();
  const result = db.execute(
    'SELECT * FROM content_lessons WHERE package_id = ?;',
    [active.id],
  );
  const rows = result.rows;
  const items: ContentLessonListItem[] = [];
  if (!rows) {
    return items;
  }
  for (let i = 0; i < rows.length; i += 1) {
    const lesson = mapLessonRow(rows.item(i) as ContentLessonDbRow);
    items.push({
      id: lesson.id,
      titleEn: lesson.titleEn,
      titleVi: lesson.titleVi,
      blurbVi: lesson.blurbVi,
      level: lesson.level,
      estimatedDurationMinutes: lesson.estimatedDurationMinutes,
    });
  }
  items.sort((a, b) => a.titleEn.localeCompare(b.titleEn));
  return items;
}

export function getContentLessonById(lessonId: string): ContentLessonRow | null {
  const db = getDatabase();
  const result = db.execute('SELECT * FROM content_lessons WHERE id = ?;', [lessonId]);
  const row = result.rows?.item(0) as ContentLessonDbRow | undefined;
  return row ? mapLessonRow(row) : null;
}

export function getLessonChunks(lessonId: string): ContentChunkRow[] {
  const db = getDatabase();
  const result = db.execute(
    'SELECT * FROM content_items WHERE lesson_id = ? ORDER BY chunk_order ASC;',
    [lessonId],
  );
  const rows = result.rows;
  const chunks: ContentChunkRow[] = [];
  if (!rows) {
    return chunks;
  }
  for (let i = 0; i < rows.length; i += 1) {
    chunks.push(mapChunkRow(rows.item(i) as ContentItemDbRow));
  }
  return chunks;
}

export function getLessonActivities(lessonId: string): ContentActivityRow[] {
  const db = getDatabase();
  const result = db.execute(
    'SELECT * FROM content_activities WHERE lesson_id = ?;',
    [lessonId],
  );
  const rows = result.rows;
  const activities: ContentActivityRow[] = [];
  if (!rows) {
    return activities;
  }
  for (let i = 0; i < rows.length; i += 1) {
    activities.push(mapActivityRow(rows.item(i) as ContentActivityDbRow));
  }
  return activities;
}

/** Audio asset metadata for a lesson, keyed by id for O(1) renderer lookup. */
export function getLessonAudioAssets(lessonId: string): Map<string, AudioAsset> {
  const db = getDatabase();
  const result = db.execute(
    'SELECT * FROM content_audio_assets WHERE lesson_id = ?;',
    [lessonId],
  );
  const rows = result.rows;
  const map = new Map<string, AudioAsset>();
  if (!rows) {
    return map;
  }
  for (let i = 0; i < rows.length; i += 1) {
    const asset = mapAudioAssetRow(rows.item(i) as ContentAudioAssetDbRow);
    map.set(asset.id, asset);
  }
  return map;
}

/** M1-declared SRS items for a lesson (`content_units` where `unit_type = 'srs'`). */
export function getLessonSrsItems(lessonId: string): SrsItem[] {
  const db = getDatabase();
  const result = db.execute(
    `SELECT * FROM content_units WHERE lesson_id = ? AND unit_type = 'srs';`,
    [lessonId],
  );
  const rows = result.rows;
  const items: SrsItem[] = [];
  if (!rows) {
    return items;
  }
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows.item(i) as ContentUnitDbRow;
    items.push(JSON.parse(row.payload_json) as SrsItem);
  }
  return items;
}

/**
 * Inserts one `content_review_items` row per given SRS item, skipping any
 * whose `srsItemId` already has a row (replaying a lesson never duplicates
 * or resets progress on content already reviewed once).
 */
export function insertContentReviewItems(
  lessonId: string,
  packageId: string,
  items: SrsItem[],
  now: string,
): {createdCount: number} {
  if (items.length === 0) {
    return {createdCount: 0};
  }
  const db = getDatabase();
  let createdCount = 0;
  for (const item of items) {
    const result = db.execute(
      `INSERT OR IGNORE INTO content_review_items (
        id, srs_item_id, lesson_id, package_id, item_type, source_ref_id,
        front, back, hint_vi, mastery_state, next_review_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?);`,
      [
        `review-${item.id}`,
        item.id,
        lessonId,
        packageId,
        item.item_type,
        item.source_ref_id,
        item.front,
        item.back,
        item.hint_vi ?? null,
        addDaysIso(now, 1),
        now,
        now,
      ],
    );
    if ((result.rowsAffected ?? 0) > 0) {
      createdCount += 1;
    }
  }
  return {createdCount};
}

function addDaysIso(iso: string, days: number): string {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export function listContentReviewItems(lessonId?: string): ContentReviewItemRecord[] {
  const db = getDatabase();
  const result = lessonId
    ? db.execute('SELECT * FROM content_review_items WHERE lesson_id = ?;', [lessonId])
    : db.execute('SELECT * FROM content_review_items;');
  const rows = result.rows;
  const items: ContentReviewItemRecord[] = [];
  if (!rows) {
    return items;
  }
  for (let i = 0; i < rows.length; i += 1) {
    items.push(mapReviewItemRow(rows.item(i) as ContentReviewItemDbRow));
  }
  return items;
}
