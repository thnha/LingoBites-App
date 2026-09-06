/**
 * Tests for the lesson-runtime repository (SETE-108 / M3).
 *
 * Pins the row-mapping and the `content_review_items` upsert-on-conflict
 * behaviour the runtime engine depends on.
 */

import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {open} from 'react-native-quick-sqlite';
import {DB_NAME} from '../constants';
import {resetDatabaseForTests} from '../database';
import {runMigrations} from '../migrations';
import {insertPackageRecord} from '../ContentPackageRepository';
import {
  getContentLessonById,
  getLessonActivities,
  getLessonAudioAssets,
  getLessonChunks,
  getLessonSrsItems,
  insertContentReviewItems,
  listActivePackageLessons,
  listContentReviewItems,
} from '../ContentRuntimeRepository';

const NOW = '2026-09-06T12:00:00.000Z';

function setup() {
  __resetMockDatabases();
  const db = open({name: DB_NAME});
  resetDatabaseForTests(db);
  runMigrations(db);
  return db;
}

function insertLesson(db: ReturnType<typeof open>, id: string, packageId: string) {
  db.execute(
    `INSERT INTO content_lessons (
      id, package_id, slug, schema_version, title_en, title_vi, blurb_vi,
      level, target_skills_json, estimated_duration_minutes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [id, packageId, id, '0.1.0', `Title ${id}`, `Tiêu đề ${id}`, 'blurb', 'A2', JSON.stringify(['speaking']), 15],
  );
}

describe('ContentRuntimeRepository', () => {
  let db: ReturnType<typeof open>;

  beforeEach(() => {
    db = setup();
  });

  it('returns null for a missing lesson and empty arrays for its children', () => {
    expect(getContentLessonById('missing')).toBeNull();
    expect(getLessonChunks('missing')).toEqual([]);
    expect(getLessonActivities('missing')).toEqual([]);
    expect(getLessonSrsItems('missing')).toEqual([]);
    expect(getLessonAudioAssets('missing').size).toBe(0);
  });

  it('lists only lessons belonging to the active package', () => {
    insertPackageRecord({
      id: 'pkg-active',
      slug: 'active',
      schemaVersion: '0.1.0',
      sourceUrl: 'https://example.com/a.zip',
      sha256: 'a',
      importedAt: NOW,
      isActive: true,
    });
    insertPackageRecord({
      id: 'pkg-old',
      slug: 'old',
      schemaVersion: '0.1.0',
      sourceUrl: 'https://example.com/b.zip',
      sha256: 'b',
      importedAt: NOW,
      isActive: false,
    });
    insertLesson(db, 'lesson-active', 'pkg-active');
    insertLesson(db, 'lesson-old', 'pkg-old');

    const listed = listActivePackageLessons();
    expect(listed.map(l => l.id)).toEqual(['lesson-active']);
  });

  it('insertContentReviewItems upserts on srs_item_id and reports the created count', () => {
    const items = [
      {
        id: 'srs-1',
        slug: 'srs-1',
        item_type: 'vocabulary' as const,
        source_ref_id: 'chunk-1',
        front: 'Front',
        back: 'Back',
      },
    ];
    const first = insertContentReviewItems('lesson-1', 'pkg-1', items, NOW);
    expect(first.createdCount).toBe(1);

    const second = insertContentReviewItems('lesson-1', 'pkg-1', items, NOW);
    expect(second.createdCount).toBe(0);

    const rows = listContentReviewItems('lesson-1');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      srsItemId: 'srs-1',
      sourceRefId: 'chunk-1',
      masteryState: 'new',
    });
  });
});
