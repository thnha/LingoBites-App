import {validFullOutput} from '../../fixtures';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {resetDatabaseForTests} from '../database';
import {open} from 'react-native-quick-sqlite';
import {DB_NAME} from '../constants';
import {
  clearAllLocalData,
  deleteLesson,
  getLessonById,
  listLessons,
  saveLesson,
} from '../LessonRepository';

describe('LessonRepository', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
  });

  it('saves lesson and reloads from SQLite', () => {
    const result = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const loaded = getLessonById(result.lessonId);
    expect(loaded?.title).toBe(validFullOutput.title);
    expect(loaded?.aiOutput.original_text).toBe(validFullOutput.original_text);
  });

  it('prevents duplicate save for same input hash', () => {
    const input = {
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text' as const,
      lesson: validFullOutput,
    };

    const first = saveLesson(input);
    const second = saveLesson(input);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.duplicate).toBe(true);
      expect(second.lessonId).toBe(first.lessonId);
    }

    expect(listLessons()).toHaveLength(1);
  });

  it('deletes lesson from history', () => {
    const saved = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });

    expect(saved.ok).toBe(true);
    if (!saved.ok) {
      return;
    }

    expect(deleteLesson(saved.lessonId)).toBe(true);
    expect(getLessonById(saved.lessonId)).toBeNull();
    expect(listLessons()).toHaveLength(0);
  });

  it('clears all local data', () => {
    saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });

    clearAllLocalData();
    expect(listLessons()).toHaveLength(0);
  });
});
