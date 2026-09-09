import fixture from '@shared/schemas/__tests__/fixtures/lesson-v2-envelope.json';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {open} from 'react-native-quick-sqlite';
import {DB_NAME} from '../constants';
import {runMigrations} from '../migrations';
import {resetDatabaseForTests, getDatabase} from '../database';
import {getLessonV2ById, upsertLessonV2, isLessonV2Saved, setLessonV2Saved, listSavedLessonV2Summaries} from '../LessonV2Repository';

const lesson = fixture.lesson;

describe('LessonV2Repository', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
    runMigrations(getDatabase());
  });

  it('persists and reconstructs a partial lesson with normalized entities', () => {
    const partial = {
      ...lesson,
      status: 'partially_ready' as const,
      revision: 4,
      title: null,
      sentences: lesson.sentences.map(sentence => ({
        ...sentence,
        translation: null,
        simple_meaning: null,
        phrases: [],
      })),
      vocabulary: [],
      grammar: [],
    };

    expect(upsertLessonV2(partial)).toEqual({
      ok: true,
      accepted: true,
      revision: 4,
    });
    expect(getLessonV2ById(lesson.lesson_id)).toMatchObject({
      lesson_id: lesson.lesson_id,
      revision: 4,
      status: 'partially_ready',
      title: null,
      sentences: [{translation: null, phrases: []}],
      vocabulary: [],
      grammar: [],
    });
  });

  it('ignores an older revision and keeps the newer child entities', () => {
    expect(upsertLessonV2(lesson)).toMatchObject({ok: true, accepted: true});

    const stale = {
      ...lesson,
      revision: lesson.revision - 1,
      title: 'stale title',
      sentences: [],
    };
    expect(upsertLessonV2(stale)).toEqual({
      ok: true,
      accepted: false,
      revision: lesson.revision,
    });
    expect(getLessonV2ById(lesson.lesson_id)?.title).toBe(lesson.title);
    expect(getLessonV2ById(lesson.lesson_id)?.sentences).toHaveLength(
      lesson.sentences.length,
    );
  });

  it('accepts equal-shaped v1 data remaining in the legacy lessons table', () => {
    const db = open({name: DB_NAME});
    db.execute(
      `INSERT INTO lessons (
        id, anonymous_user_id, lesson_input_hash, title, source_type,
        ocr_raw_text, confirmed_text, vietnamese_translation, summary, level,
        ai_output_json, is_saved, created_at, updated_at, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        'v1',
        'user',
        'hash',
        'Old',
        'paste_text',
        null,
        'Old text',
        'Cũ',
        null,
        'A1',
        '{}',
        1,
        '2026-01-01',
        '2026-01-01',
        'vocabulary',
      ],
    );

    expect(upsertLessonV2(lesson).ok).toBe(true);
    expect(
      db.execute('SELECT * FROM lessons WHERE id = ?;', ['v1']).rows?.length,
    ).toBe(1);
  });

  describe('save actions', () => {
    it('returns false when checking unsaved lesson', () => {
      upsertLessonV2(lesson);
      expect(isLessonV2Saved(lesson.lesson_id)).toBe(false);
    });

    it('can set and get saved status', () => {
      upsertLessonV2(lesson);
      expect(setLessonV2Saved(lesson.lesson_id, true)).toBe(true);
      expect(isLessonV2Saved(lesson.lesson_id)).toBe(true);

      expect(setLessonV2Saved(lesson.lesson_id, false)).toBe(true);
      expect(isLessonV2Saved(lesson.lesson_id)).toBe(false);
    });

    it('lists saved lessons with limited hydration', () => {
      upsertLessonV2(lesson);
      expect(listSavedLessonV2Summaries()).toHaveLength(0);

      setLessonV2Saved(lesson.lesson_id, true);
      const summaries = listSavedLessonV2Summaries();
      expect(summaries).toHaveLength(1);
      expect(summaries[0]).toMatchObject({
        lesson_id: lesson.lesson_id,
        title: lesson.title,
        source_text: lesson.source.text,
        word_count: lesson.source.word_count,
        status: lesson.status,
      });
    });

    it('preserves is_saved flag across upserts', () => {
      upsertLessonV2(lesson);
      setLessonV2Saved(lesson.lesson_id, true);

      // Modify revision and upsert again
      const newRevision = {
        ...lesson,
        revision: lesson.revision + 1,
      };
      upsertLessonV2(newRevision);

      expect(isLessonV2Saved(lesson.lesson_id)).toBe(true);
    });
  });
});
