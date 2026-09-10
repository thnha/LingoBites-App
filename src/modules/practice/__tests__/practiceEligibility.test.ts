import type {LessonV2} from '@shared/schemas/lesson-v2';
import {
  countValidatedSources,
  hasMinimumValidatedSource,
  isLessonEligibleForPractice,
  isTerminalLessonForPractice,
} from '../practiceEligibility';

function baseLesson(overrides: Partial<LessonV2> = {}): LessonV2 {
  return {
    schema_version: 'lesson-v2',
    lesson_id: 'lesson-1',
    request_id: 'req-1',
    revision: 1,
    status: 'ready',
    level: 'beginner',
    title: 'Test',
    source: {
      text: 'Hello world',
      word_count: 2,
      char_count: 11,
      detected_language: 'en',
    },
    chunks: [],
    sentences: [],
    vocabulary: [],
    grammar: [],
    practice: [],
    units: {
      vocabulary: {status: 'ready', attempts: 1, error_code: null, retryable: false},
      grammar: {status: 'ready', attempts: 1, error_code: null, retryable: false},
      ipa_resolve: {status: 'ready', attempts: 1, error_code: null, retryable: false},
      practice: {status: 'ready', attempts: 1, error_code: null, retryable: false},
    },
    warnings: [],
    saved: false,
    ...overrides,
  } as LessonV2;
}

describe('practiceEligibility', () => {
  it('requires terminal lesson status and minimum validated source', () => {
    const eligible = baseLesson({
      vocabulary: Array.from({length: 4}, (_, index) => ({
        id: `v${index}`,
        word: `word${index}`,
        phrase_from_text: null,
        word_type: null,
        meaning_vi: `nghĩa ${index}`,
        ipa: null,
        ipa_source: 'none',
        source_sentence_id: 's1',
        example: 'ex',
        example_translation: 'dịch',
        tts: {text: 'word', locale: 'en-US', rate: 1},
      })),
    });
    expect(isTerminalLessonForPractice(eligible)).toBe(true);
    expect(hasMinimumValidatedSource(eligible)).toBe(true);
    expect(isLessonEligibleForPractice(eligible)).toBe(true);
  });

  it('accepts partially_ready lessons with enough source', () => {
    const lesson = baseLesson({
      status: 'partially_ready',
      sentences: [
        {
          id: 's1',
          index: 0,
          text: 'Hello',
          char_start: 0,
          char_end: 5,
          chunk_id: 'c1',
          status: 'ready',
          translation: 'Xin chào',
          simple_meaning: 'Chào',
          phrases: [],
          tts: {text: 'Hello', locale: 'en-US', rate: 1},
          related_vocabulary_ids: [],
          related_grammar_ids: [],
        },
      ],
    });
    expect(countValidatedSources(lesson).sentencesWithTranslation).toBe(1);
    expect(isLessonEligibleForPractice(lesson)).toBe(true);
  });

  it('rejects non-terminal lessons even with enough source', () => {
    const lesson = baseLesson({
      status: 'skeleton_ready',
      vocabulary: Array.from({length: 4}, (_, index) => ({
        id: `v${index}`,
        word: `word${index}`,
        phrase_from_text: null,
        word_type: null,
        meaning_vi: `nghĩa ${index}`,
        ipa: null,
        ipa_source: 'none',
        source_sentence_id: 's1',
        example: 'ex',
        example_translation: 'dịch',
        tts: {text: 'word', locale: 'en-US', rate: 1},
      })),
    });
    expect(isLessonEligibleForPractice(lesson)).toBe(false);
  });
});
