import {getDatabase} from './database';
import {clearLessonTokens} from '../security/lessonTokenStore';
import {listSpeakingRecordingFilePaths} from './SpeakingRepository';
import {deleteLocalFiles} from '../localData/localFileCleanup';

export const LEGACY_CLEAR_MARKER = 'account.legacy_clear_completed_v1';

export async function executeLegacyClear(): Promise<void> {
  const db = getDatabase();

  const marker = db.execute('SELECT value FROM app_settings WHERE key = ? LIMIT 1;', [LEGACY_CLEAR_MARKER]);
  if (marker.rows?.length) {
    return; // Already cleared
  }

  // 1. Gather all lesson IDs for token cleanup
  const lessonIds = new Set<string>();
  for (const table of ['lessons', 'lesson_v2', 'youtube_lessons', 'practice_sets']) {
    try {
      const idCol = table === 'lessons' || table === 'youtube_lessons' ? 'id' : 'lesson_id';
      const rows = db.execute(`SELECT ${idCol} AS lesson_id FROM ${table};`).rows;
      for (let i = 0; i < (rows?.length ?? 0); i++) {
        const row = rows?.item(i) as {lesson_id?: string} | undefined;
        if (row?.lesson_id) lessonIds.add(row.lesson_id);
      }
    } catch {
      // ignore missing tables
    }
  }

  await clearLessonTokens(Array.from(lessonIds));

  // 2. Clear user-created files
  const recordingFiles = listSpeakingRecordingFilePaths();
  await deleteLocalFiles(recordingFiles);

  // 3. Clear DB tables
  db.execute('BEGIN');
  try {
    // V1 Analysis Surface
    db.execute('DELETE FROM lessons;');
    db.execute('DELETE FROM flashcards;');
    db.execute('DELETE FROM review_schedule;');
    db.execute('DELETE FROM review_sessions;');

    // V2 Analysis Surface
    db.execute('DELETE FROM lesson_v2;');
    db.execute('DELETE FROM lesson_v2_sentences;');
    db.execute('DELETE FROM lesson_v2_chunks;');
    db.execute('DELETE FROM lesson_v2_vocabulary;');
    db.execute('DELETE FROM lesson_v2_grammar;');
    db.execute('DELETE FROM lesson_v2_units;');

    // Practice Surface
    db.execute('DELETE FROM practice_sets;');
    db.execute('DELETE FROM practice_questions;');
    db.execute('DELETE FROM practice_sessions;');
    db.execute('DELETE FROM practice_events;');

    // YouTube Progress
    db.execute('DELETE FROM youtube_progress;');

    // Outbox (Legacy events)
    db.execute('DELETE FROM sync_outbox;');

    // Speaking / Error Notebook (user-created Analysis)
    db.execute('DELETE FROM speaking_recordings;');
    db.execute('DELETE FROM error_events;');
    db.execute("DELETE FROM content_review_items WHERE item_type = 'speaking_error';");

    // Clear settings, preserving approved keys + the new marker
    db.execute(`
      DELETE FROM app_settings 
      WHERE key NOT IN (
        'account.install_completed_v1',
        'account.fallback_device_id',
        'account.signup_idempotency_key',
        'current_account_id',
        'account.legacy_clear_completed_v1'
      );
    `);

    // Mark completed
    db.execute(
      'INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?);',
      [LEGACY_CLEAR_MARKER, '1', new Date().toISOString()]
    );

    db.execute('COMMIT');
  } catch (error) {
    db.execute('ROLLBACK');
    throw error;
  }
}
