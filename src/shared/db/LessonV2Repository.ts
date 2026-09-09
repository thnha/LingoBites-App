import {LessonV2Schema, type LessonV2} from '../schemas/lesson-v2';
import {getOrCreateAnonymousUserId} from './anonymousUserId';
import {getDatabase, withTransaction} from './database';
import {computeLessonInputHash} from './lessonInputHash';

type LessonV2Row = {
  lesson_id: string;
  anonymous_user_id: string;
  input_hash: string;
  schema_version: string;
  request_id: string;
  status: LessonV2['status'];
  revision: number;
  source_text: string;
  word_count: number;
  char_count: number;
  detected_language: string;
  title: string | null;
  level: string;
  prompt_version: string;
  is_saved: number;
  warnings_json: string;
  error_json: string | null;
  practice_json: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

type SentenceRow = {
  sentence_id: string;
  idx: number;
  text: string;
  char_start: number;
  char_end: number;
  chunk_id: string;
  status: LessonV2['sentences'][number]['status'];
  translation: string | null;
  simple_meaning: string | null;
  phrases_json: string;
  tts_json: string;
  related_vocabulary_ids_json: string;
  related_grammar_ids_json: string;
};

type ChunkRow = {
  chunk_id: string;
  sentence_ids_json: string;
  idx: number;
  status: LessonV2['chunks'][number]['status'];
  attempts: number;
  error_code: string | null;
  retryable: number;
};

type VocabularyRow = {
  vocab_id: string;
  word: string;
  phrase_from_text: string | null;
  word_type: string | null;
  meaning_vi: string;
  ipa: string | null;
  ipa_source: LessonV2['vocabulary'][number]['ipa_source'];
  source_sentence_id: string;
  example: string;
  example_translation: string;
  tts_json: string;
};

type GrammarRow = {
  grammar_id: string;
  name: string;
  name_vi: string;
  pattern: string;
  found_in_sentence_id: string;
  found_in_text: string;
  explanation_vi: string;
  beginner_tip: string;
  examples_json: string;
};

type UnitRow = {
  unit_key: keyof LessonV2['units'];
  status: LessonV2['units'][keyof LessonV2['units']]['status'];
  attempts: number;
  error_code: string | null;
  retryable: number;
};

export type LessonV2UpsertResult =
  | {ok: true; accepted: boolean; revision: number}
  | {ok: false; errorCode: 'INVALID_PAYLOAD' | 'LOCAL_DB_ERROR'};

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function rows<T>(result: {
  rows?: {length: number; item(index: number): unknown};
}): T[] {
  const output: T[] = [];
  for (let index = 0; index < (result.rows?.length ?? 0); index += 1) {
    output.push(result.rows?.item(index) as T);
  }
  return output;
}

function getStoredRevision(lessonId: string): number | null {
  const result = getDatabase().execute(
    'SELECT revision FROM lesson_v2 WHERE lesson_id = ? LIMIT 1;',
    [lessonId],
  );
  const row = result.rows?.item(0) as {revision: number} | undefined;
  return row?.revision ?? null;
}

/** Upsert a complete server snapshot while preserving the newest revision. */
export function upsertLessonV2(payload: unknown): LessonV2UpsertResult {
  const parsed = LessonV2Schema.safeParse(payload);
  if (!parsed.success) {
    return {ok: false, errorCode: 'INVALID_PAYLOAD'};
  }

  const lesson = parsed.data;
  const db = getDatabase();
  const existingRevision = getStoredRevision(lesson.lesson_id);
  if (existingRevision !== null && lesson.revision <= existingRevision) {
    return {ok: true, accepted: false, revision: existingRevision};
  }

  try {
    const now = new Date().toISOString();
    const inputHash = computeLessonInputHash({
      confirmedText: lesson.source.text,
      level: lesson.level,
      promptVersion: lesson.prompt_version,
    });

    withTransaction(db, () => {
      db.execute(
        `INSERT OR REPLACE INTO lesson_v2 (
          lesson_id, anonymous_user_id, input_hash, schema_version, request_id,
          status, revision, source_text, word_count, char_count,
          detected_language, title, level, prompt_version, is_saved,
          warnings_json, error_json, practice_json, expires_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          COALESCE((SELECT is_saved FROM lesson_v2 WHERE lesson_id = ?), 0),
          ?, ?, ?, ?, COALESCE((SELECT created_at FROM lesson_v2 WHERE lesson_id = ?), ?), ?);`,
        [
          lesson.lesson_id,
          getOrCreateAnonymousUserId(),
          inputHash,
          lesson.schema_version,
          lesson.request_id,
          lesson.status,
          lesson.revision,
          lesson.source.text,
          lesson.source.word_count,
          lesson.source.char_count,
          lesson.source.detected_language,
          lesson.title,
          lesson.level,
          lesson.prompt_version,
          lesson.lesson_id,
          JSON.stringify(lesson.warnings),
          lesson.error ? JSON.stringify(lesson.error) : null,
          JSON.stringify(lesson.practice),
          lesson.expires_at,
          lesson.lesson_id,
          lesson.created_at || now,
          lesson.updated_at || now,
        ],
      );

      const childTables = [
        'lesson_v2_sentences',
        'lesson_v2_chunks',
        'lesson_v2_vocabulary',
        'lesson_v2_grammar',
        'lesson_v2_units',
      ];
      for (const table of childTables) {
        db.execute(`DELETE FROM ${table} WHERE lesson_id = ?;`, [
          lesson.lesson_id,
        ]);
      }

      for (const sentence of lesson.sentences) {
        db.execute(
          `INSERT INTO lesson_v2_sentences (
            lesson_id, sentence_id, idx, text, char_start, char_end, chunk_id,
            status, translation, simple_meaning, phrases_json, tts_json,
            related_vocabulary_ids_json, related_grammar_ids_json, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            lesson.lesson_id,
            sentence.id,
            sentence.index,
            sentence.text,
            sentence.char_start,
            sentence.char_end,
            sentence.chunk_id,
            sentence.status,
            sentence.translation,
            sentence.simple_meaning,
            JSON.stringify(sentence.phrases),
            JSON.stringify(sentence.tts),
            JSON.stringify(sentence.related_vocabulary_ids),
            JSON.stringify(sentence.related_grammar_ids),
            lesson.updated_at || now,
          ],
        );
      }
      for (const chunk of lesson.chunks) {
        db.execute(
          `INSERT INTO lesson_v2_chunks (
            lesson_id, chunk_id, idx, sentence_ids_json, status, attempts,
            error_code, retryable
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            lesson.lesson_id,
            chunk.id,
            chunk.index,
            JSON.stringify(chunk.sentence_ids),
            chunk.status,
            chunk.attempts,
            chunk.error_code,
            chunk.retryable ? 1 : 0,
          ],
        );
      }
      for (const vocabulary of lesson.vocabulary) {
        db.execute(
          `INSERT INTO lesson_v2_vocabulary (
            lesson_id, vocab_id, word, phrase_from_text, word_type, meaning_vi,
            ipa, ipa_source, source_sentence_id, example, example_translation, tts_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            lesson.lesson_id,
            vocabulary.id,
            vocabulary.word,
            vocabulary.phrase_from_text,
            vocabulary.word_type,
            vocabulary.meaning_vi,
            vocabulary.ipa,
            vocabulary.ipa_source,
            vocabulary.source_sentence_id,
            vocabulary.example,
            vocabulary.example_translation,
            JSON.stringify(vocabulary.tts),
          ],
        );
      }
      for (const grammar of lesson.grammar) {
        db.execute(
          `INSERT INTO lesson_v2_grammar (
            lesson_id, grammar_id, name, name_vi, pattern, found_in_sentence_id,
            found_in_text, explanation_vi, beginner_tip, examples_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            lesson.lesson_id,
            grammar.id,
            grammar.name,
            grammar.name_vi,
            grammar.pattern,
            grammar.found_in_sentence_id,
            grammar.found_in_text,
            grammar.explanation_vi,
            grammar.beginner_tip,
            JSON.stringify(grammar.examples),
          ],
        );
      }
      for (const [unitKey, unit] of Object.entries(lesson.units)) {
        db.execute(
          `INSERT INTO lesson_v2_units (
            lesson_id, unit_key, status, attempts, error_code, retryable
          ) VALUES (?, ?, ?, ?, ?, ?);`,
          [
            lesson.lesson_id,
            unitKey,
            unit.status,
            unit.attempts,
            unit.error_code,
            unit.retryable ? 1 : 0,
          ],
        );
      }
    });
    return {ok: true, accepted: true, revision: lesson.revision};
  } catch {
    return {ok: false, errorCode: 'LOCAL_DB_ERROR'};
  }
}

export const saveLessonV2 = upsertLessonV2;

/** Reconstructs the latest progressive lesson snapshot from its normalized rows. */
export function getLessonV2ById(lessonId: string): LessonV2 | null {
  const db = getDatabase();
  const main = db.execute(
    'SELECT * FROM lesson_v2 WHERE lesson_id = ? LIMIT 1;',
    [lessonId],
  );
  const row = main.rows?.item(0) as LessonV2Row | undefined;
  if (!row) return null;

  const sentenceRows = rows<SentenceRow>(
    db.execute(
      'SELECT * FROM lesson_v2_sentences WHERE lesson_id = ? ORDER BY idx;',
      [lessonId],
    ),
  );
  const chunkRows = rows<ChunkRow>(
    db.execute(
      'SELECT * FROM lesson_v2_chunks WHERE lesson_id = ? ORDER BY idx;',
      [lessonId],
    ),
  );
  const vocabularyRows = rows<VocabularyRow>(
    db.execute('SELECT * FROM lesson_v2_vocabulary WHERE lesson_id = ?;', [
      lessonId,
    ]),
  );
  const grammarRows = rows<GrammarRow>(
    db.execute('SELECT * FROM lesson_v2_grammar WHERE lesson_id = ?;', [
      lessonId,
    ]),
  );
  const unitRows = rows<UnitRow>(
    db.execute('SELECT * FROM lesson_v2_units WHERE lesson_id = ?;', [
      lessonId,
    ]),
  );

  const units = {} as LessonV2['units'];
  for (const unit of unitRows) {
    units[unit.unit_key] = {
      status: unit.status,
      attempts: unit.attempts,
      error_code: unit.error_code,
      retryable: unit.retryable === 1,
    };
  }
  const fallbackUnit = {
    status: 'pending' as const,
    attempts: 0,
    error_code: null,
    retryable: true,
  };
  for (const key of [
    'vocabulary',
    'grammar',
    'practice',
    'ipa_resolve',
  ] as const) {
    units[key] ??= fallbackUnit;
  }

  return LessonV2Schema.parse({
    schema_version: row.schema_version,
    lesson_id: row.lesson_id,
    request_id: row.request_id,
    revision: row.revision,
    status: row.status,
    level: row.level,
    prompt_version: row.prompt_version,
    title: row.title,
    source: {
      text: row.source_text,
      word_count: row.word_count,
      char_count: row.char_count,
      detected_language: row.detected_language,
    },
    sentences: sentenceRows.map(sentence => ({
      id: sentence.sentence_id,
      index: sentence.idx,
      text: sentence.text,
      char_start: sentence.char_start,
      char_end: sentence.char_end,
      chunk_id: sentence.chunk_id,
      status: sentence.status,
      translation: sentence.translation,
      simple_meaning: sentence.simple_meaning,
      phrases: parseJson(sentence.phrases_json),
      tts: parseJson(sentence.tts_json),
      related_vocabulary_ids: parseJson(sentence.related_vocabulary_ids_json),
      related_grammar_ids: parseJson(sentence.related_grammar_ids_json),
    })),
    chunks: chunkRows.map(chunk => ({
      id: chunk.chunk_id,
      index: chunk.idx,
      sentence_ids: parseJson(chunk.sentence_ids_json),
      status: chunk.status,
      attempts: chunk.attempts,
      error_code: chunk.error_code,
      retryable: chunk.retryable === 1,
    })),
    units,
    vocabulary: vocabularyRows.map(vocabulary => ({
      id: vocabulary.vocab_id,
      word: vocabulary.word,
      phrase_from_text: vocabulary.phrase_from_text,
      word_type: vocabulary.word_type,
      meaning_vi: vocabulary.meaning_vi,
      ipa: vocabulary.ipa,
      ipa_source: vocabulary.ipa_source,
      source_sentence_id: vocabulary.source_sentence_id,
      example: vocabulary.example,
      example_translation: vocabulary.example_translation,
      tts: parseJson(vocabulary.tts_json),
    })),
    grammar: grammarRows.map(grammar => ({
      id: grammar.grammar_id,
      name: grammar.name,
      name_vi: grammar.name_vi,
      pattern: grammar.pattern,
      found_in_sentence_id: grammar.found_in_sentence_id,
      found_in_text: grammar.found_in_text,
      explanation_vi: grammar.explanation_vi,
      beginner_tip: grammar.beginner_tip,
      examples: parseJson(grammar.examples_json),
    })),
    practice: parseJson(row.practice_json),
    warnings: parseJson(row.warnings_json),
    error: row.error_json ? parseJson(row.error_json) : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    expires_at: row.expires_at,
  });
}

export const getLessonV2 = getLessonV2ById;

export function deleteLessonV2(lessonId: string): boolean {
  try {
    const result = getDatabase().execute(
      'DELETE FROM lesson_v2 WHERE lesson_id = ?;',
      [lessonId],
    );
    return (result.rowsAffected ?? 0) > 0;
  } catch {
    return false;
  }
}

export function isLessonV2Saved(lessonId: string): boolean {
  const db = getDatabase();
  const result = db.execute(
    'SELECT is_saved FROM lesson_v2 WHERE lesson_id = ? LIMIT 1;',
    [lessonId]
  );
  const row = result.rows?.item(0) as {is_saved: number} | undefined;
  return row?.is_saved === 1;
}

export function setLessonV2Saved(lessonId: string, saved: boolean, updatedAt = new Date().toISOString()): boolean {
  try {
    const db = getDatabase();
    const result = db.execute(
      'UPDATE lesson_v2 SET is_saved = ?, updated_at = ? WHERE lesson_id = ?;',
      [saved ? 1 : 0, updatedAt, lessonId]
    );
    return (result.rowsAffected ?? 0) > 0;
  } catch (err) {
    console.error('setLessonV2Saved error:', err);
    return false;
  }
}

export type SavedLessonV2Summary = {
  lesson_id: string;
  title: string | null;
  source_text: string;
  word_count: number;
  status: LessonV2['status'];
  updated_at: string;
};

export function listSavedLessonV2Summaries(): SavedLessonV2Summary[] {
  const db = getDatabase();
  const result = db.execute(
    'SELECT lesson_id, title, source_text, word_count, status, updated_at FROM lesson_v2 WHERE is_saved = 1 ORDER BY datetime(updated_at) DESC;',
    []
  );

  const items: SavedLessonV2Summary[] = [];
  const rows = result.rows;
  if (!rows) {
    return items;
  }

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows.item(index) as SavedLessonV2Summary;
    items.push({
      lesson_id: row.lesson_id,
      title: row.title,
      source_text: row.source_text,
      word_count: row.word_count,
      status: row.status,
      updated_at: row.updated_at,
    });
  }

  return items;
}
