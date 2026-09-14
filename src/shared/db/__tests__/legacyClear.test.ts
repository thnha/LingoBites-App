import {getDatabase, wipeDatabase} from '../database';
import {executeLegacyClear} from '../legacyClear';
import {clearLessonTokens} from '../../security/lessonTokenStore';
import {deleteLocalFiles} from '../../localData/localFileCleanup';
import {listSpeakingRecordingFilePaths} from '../SpeakingRepository';

jest.mock('../../security/lessonTokenStore');
jest.mock('../../localData/localFileCleanup');
jest.mock('../SpeakingRepository', () => ({
  listSpeakingRecordingFilePaths: jest.fn(),
}));

function getCount(db: any, query: string, params: any[] = []): number {
  const result = db.execute(query, params);
  const row = result.rows?.item(0);
  return row?.count ?? 0;
}

describe('executeLegacyClear', () => {
  beforeEach(() => {
    const db = getDatabase();
    wipeDatabase(db);
    jest.clearAllMocks();
  });

  it('performs exhaustive idempotent clear', async () => {
    const db = getDatabase();
    
    db.execute("INSERT INTO lessons (id, anonymous_user_id, lesson_input_hash, title, source_type, confirmed_text, vietnamese_translation, level, ai_output_json, is_saved, created_at, updated_at, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", 
      ['l1', 'anon1', 'hash1', 'title', 'paste_text', 'text', 'trans', 'A1', '{}', 0, '2026-09-14T00:00:00Z', '2026-09-14T00:00:00Z', 'vocabulary']);
    db.execute("INSERT OR REPLACE INTO practice_sets (id, contract_version, status, lesson_id, lesson_revision, source_fingerprint, config_hash, seed, difficulty, requested_count, set_revision, generator_json, validation_summary_json, created_at, ready_at, error_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
      ['ps1', 1, 'ready', 'l1', 1, 'hash', 'hash', null, 'A1', 10, 1, '{}', null, '2026-09-14T00:00:00Z', '2026-09-14T00:00:00Z', null]);
    db.execute("INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?);", ['legacy_key', '1', '2026-09-14T00:00:00Z']);
    db.execute("INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?);", ['current_account_id', 'user1', '2026-09-14T00:00:00Z']);

    (listSpeakingRecordingFilePaths as jest.Mock).mockReturnValue(['/path/to/file.mp4']);

    await executeLegacyClear();

    expect(getCount(db, 'SELECT COUNT(*) as count FROM lessons')).toBe(0);
    expect(getCount(db, 'SELECT COUNT(*) as count FROM practice_sets')).toBe(0);
    expect(getCount(db, "SELECT COUNT(*) as count FROM app_settings WHERE key = ?", ['legacy_key'])).toBe(0);
    
    expect(getCount(db, "SELECT COUNT(*) as count FROM app_settings WHERE key = ?", ['current_account_id'])).toBe(1);
    expect(getCount(db, "SELECT COUNT(*) as count FROM app_settings WHERE key = ?", ['account.legacy_clear_completed_v1'])).toBe(1);

    expect(clearLessonTokens).toHaveBeenCalled();
    expect(deleteLocalFiles).toHaveBeenCalledWith(['/path/to/file.mp4']);
    
    jest.clearAllMocks();
    await executeLegacyClear();
    expect(clearLessonTokens).not.toHaveBeenCalled();
    expect(deleteLocalFiles).not.toHaveBeenCalled();
  });
});
