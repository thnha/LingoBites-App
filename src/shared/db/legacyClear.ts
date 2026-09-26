import {getDatabase} from './database';
import {listSpeakingRecordingFilePaths} from './SpeakingRepository';
import {deleteLocalFiles} from '../localData/localFileCleanup';

export const LEGACY_CLEAR_MARKER = 'account.legacy_clear_completed_v1';

/**
 * Reserved for the future canonical cleanup (Checkpoint B).
 *
 * No pre-parity boot path may read or write this marker: the legacy
 * `account.legacy_clear_completed_v1` marker cannot prove canonical cleanup
 * because it may have run before parity. The gated cleanup task owns the
 * first (and only) write of this marker alongside the lesson token clear
 * and the seven v1/v2 lesson table drops.
 */
export const CANONICAL_LEGACY_CLEAR_MARKER =
  'lesson.canonical_legacy_clear_v1';

export async function executeLegacyClear(): Promise<void> {
  const db = getDatabase();

  const marker = db.execute('SELECT value FROM app_settings WHERE key = ? LIMIT 1;', [LEGACY_CLEAR_MARKER]);
  if (marker.rows?.length) {
    return; // Already cleared
  }

  // 1. Clear user-created files
  const recordingFiles = listSpeakingRecordingFilePaths();
  await deleteLocalFiles(recordingFiles);

  // 2. Clear DB tables
  //
  // Checkpoint A quarantine (NFR-002): v1/v2 lesson data is intentionally
  // NOT touched here. The seven lesson tables (`lessons`, `lesson_v2`,
  // `lesson_v2_sentences`, `lesson_v2_chunks`, `lesson_v2_vocabulary`,
  // `lesson_v2_grammar`, `lesson_v2_units`) and the per-lesson capability
  // tokens survive every pre-parity boot; only the gated canonical cleanup
  // may clear them and record CANONICAL_LEGACY_CLEAR_MARKER.
  db.execute('BEGIN');
  try {
    // V1 Analysis Surface (lesson rows quarantined — see above)
    db.execute('DELETE FROM flashcards;');
    db.execute('DELETE FROM review_schedule;');
    db.execute('DELETE FROM review_sessions;');

    // V2 Analysis Surface (lesson rows quarantined — see above)

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
