import {validateAIOutput} from '../schemas/ai-output-v1';
import {createRequestId} from '../api/requestId';
import {getOrCreateAnonymousUserId} from './anonymousUserId';
import {getDatabase} from './database';
import {computeLessonInputHash} from './lessonInputHash';
import type {
  LessonListItem,
  SaveLessonInput,
  SaveLessonResult,
  SavedLessonRecord,
} from './types';

type LessonRow = {
  id: string;
  anonymous_user_id: string;
  lesson_input_hash: string;
  title: string;
  source_type: string;
  ocr_raw_text: string | null;
  confirmed_text: string;
  vietnamese_translation: string;
  summary: string | null;
  level: string;
  ai_output_json: string;
  is_saved: number;
  created_at: string;
  updated_at: string;
};

function mapRowToRecord(row: LessonRow): SavedLessonRecord | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(row.ai_output_json);
  } catch {
    return null;
  }

  const validation = validateAIOutput(parsed);
  if (!validation.valid) {
    return null;
  }

  return {
    id: row.id,
    anonymousUserId: row.anonymous_user_id,
    lessonInputHash: row.lesson_input_hash,
    title: row.title,
    sourceType: row.source_type as SavedLessonRecord['sourceType'],
    ocrRawText: row.ocr_raw_text,
    confirmedText: row.confirmed_text,
    vietnameseTranslation: row.vietnamese_translation,
    summary: row.summary,
    level: row.level,
    aiOutput: validation.data,
    isSaved: row.is_saved === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function previewText(text: string, maxLength = 80): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

export function findLessonByInputHash(hash: string): SavedLessonRecord | null {
  const db = getDatabase();
  const result = db.execute(
    'SELECT * FROM lessons WHERE lesson_input_hash = ? LIMIT 1;',
    [hash],
  );

  const row = result.rows?.item(0) as LessonRow | undefined;
  if (!row) {
    return null;
  }

  return mapRowToRecord(row);
}

export function saveLesson(input: SaveLessonInput): SaveLessonResult {
  const validation = validateAIOutput(input.lesson);
  if (!validation.valid) {
    return {
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: 'Không thể lưu bài học vì dữ liệu không hợp lệ.',
    };
  }

  const lesson = validation.data;
  const lessonInputHash = computeLessonInputHash({
    confirmedText: input.confirmedText,
    level: lesson.level,
    promptVersion: input.promptVersion,
  });

  const existing = findLessonByInputHash(lessonInputHash);
  if (existing) {
    return {ok: true, lessonId: existing.id, duplicate: true};
  }

  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    const lessonId = createRequestId();
    const anonymousUserId = getOrCreateAnonymousUserId();

    db.execute(
      `INSERT INTO lessons (
        id, anonymous_user_id, lesson_input_hash, title, source_type,
        ocr_raw_text, confirmed_text, vietnamese_translation, summary, level,
        ai_output_json, is_saved, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        lessonId,
        anonymousUserId,
        lessonInputHash,
        lesson.title,
        input.sourceType,
        input.ocrRawText ?? null,
        input.confirmedText.trim(),
        lesson.vietnamese_translation,
        lesson.summary ?? null,
        lesson.level,
        JSON.stringify(lesson),
        1,
        now,
        now,
      ],
    );

    return {ok: true, lessonId, duplicate: false};
  } catch {
    return {
      ok: false,
      errorCode: 'LOCAL_DB_ERROR',
      message: 'Không thể lưu bài học. Vui lòng thử lại.',
    };
  }
}

export function getLessonById(lessonId: string): SavedLessonRecord | null {
  const db = getDatabase();
  const result = db.execute('SELECT * FROM lessons WHERE id = ? LIMIT 1;', [
    lessonId,
  ]);

  const row = result.rows?.item(0) as LessonRow | undefined;
  if (!row) {
    return null;
  }

  return mapRowToRecord(row);
}

export function listLessons(limit?: number): LessonListItem[] {
  const db = getDatabase();
  const sql =
    limit && limit > 0
      ? 'SELECT * FROM lessons ORDER BY datetime(created_at) DESC LIMIT ?;'
      : 'SELECT * FROM lessons ORDER BY datetime(created_at) DESC;';
  const params = limit && limit > 0 ? [limit] : [];
  const result = db.execute(sql, params);

  const items: LessonListItem[] = [];
  const rows = result.rows;
  if (!rows) {
    return items;
  }

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows.item(index) as LessonRow;
    const record = mapRowToRecord(row);
    if (!record) {
      continue;
    }

    items.push({
      id: record.id,
      title: record.title,
      summary: record.summary,
      previewText: previewText(record.confirmedText),
      vocabularyCount: record.aiOutput.vocabulary?.length ?? 0,
      createdAt: record.createdAt,
    });
  }

  return items;
}

export function deleteLesson(lessonId: string): boolean {
  try {
    const db = getDatabase();
    const result = db.execute('DELETE FROM lessons WHERE id = ?;', [lessonId]);
    return (result.rowsAffected ?? 0) > 0;
  } catch {
    return false;
  }
}

export function clearAllLocalData(): void {
  const db = getDatabase();
  db.execute('DELETE FROM lessons;');
  db.execute('DELETE FROM app_settings;');
}
