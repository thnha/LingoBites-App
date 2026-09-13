import {validFullOutput} from '@shared/fixtures';
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
import {
  saveYouTubeLesson,
  listYouTubeLessons,
} from '../YoutubeLessonRepository';
import type {YouTubeTranscript} from '../../schemas/youtube-transcript-v1';
import {getDatabase} from '../database';

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

  it('clears all local data including YouTube lessons', () => {
    saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });

    const transcript: YouTubeTranscript = {
      schema_version: 'youtube-transcript-v1',
      video: {
        id: 'test_vid',
        title: 'Test',
        channel_title: 'Test',
        duration_seconds: 100,
        language: 'en',
        embeddable: true,
      },
      transcript_source: 'manual',
      segments: [
        {
          id: 'test_vid-0',
          index: 0,
          start_ms: 0,
          end_ms: 1000,
          en: 'Hello',
          vi: 'Xin chào',
          ipa: '',
        },
      ],
      warnings: [],
    };
    saveYouTubeLesson({lesson: transcript});

    clearAllLocalData();
    
    expect(listLessons()).toHaveLength(0);
    expect(listYouTubeLessons()).toHaveLength(0);
    
    const sentenceCount = getDatabase().execute(
      'SELECT COUNT(*) AS count FROM youtube_sentences;',
    );
    expect(sentenceCount.rows?.item(0)).toEqual({count: 0});
  });

  it('derives vocabulary category when vocabulary count >= grammar count', () => {
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
    expect(loaded?.category).toBe('vocabulary');
  });

  it('derives grammar category when grammar_points outnumber vocabulary', () => {
    const grammarHeavy = {
      ...validFullOutput,
      grammar_points: [
        ...validFullOutput.grammar_points,
        ...validFullOutput.grammar_points,
        ...validFullOutput.grammar_points,
      ],
    };

    const result = saveLesson({
      confirmedText: grammarHeavy.original_text,
      sourceType: 'paste_text',
      lesson: grammarHeavy,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const loaded = getLessonById(result.lessonId);
    expect(loaded?.category).toBe('grammar');
  });

  it('exposes category on listLessons() items', () => {
    saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });

    const items = listLessons();
    expect(items).toHaveLength(1);
    expect(items[0].category).toBe('vocabulary');
  });
});
