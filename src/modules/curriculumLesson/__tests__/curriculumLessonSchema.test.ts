import {
  CURRICULUM_LESSON_FIXTURE_REVISION,
  CURRICULUM_LESSON_SERVER_FIXTURE_SHA,
  CurriculumLessonAggregateSuccessResponseSchema,
  CurriculumLessonBlockSchema,
  CurriculumLessonCheckRequestBodySchema,
  CurriculumLessonErrorCodeSchema,
  parseCurriculumLessonAggregateResponse,
  parseCurriculumLessonBlock,
  parseCurriculumLessonCheckResponse,
} from '../curriculumLessonSchema';
import aggregateFixture from './fixtures/valid-learner-lesson-aggregate.json';
import aggregateResponseFixture from './fixtures/valid-lesson-aggregate-response.json';
import checkResponseFixture from './fixtures/valid-exercise-check-response.json';
import provenance from './fixtures/provenance.json';

describe('curriculumLessonSchema provenance', () => {
  it('records the originating Server SHA and fixture revision', () => {
    expect(provenance.serverCommitSha).toBe(
      '7681bb9fb9970af9972b9ca9a1eb63c73386b33b',
    );
    expect(provenance.fixtureRevision).toBe('ling-18-task-001-r1');
    expect(provenance.serverCommitSha).toBe(
      CURRICULUM_LESSON_SERVER_FIXTURE_SHA,
    );
    expect(provenance.fixtureRevision).toBe(CURRICULUM_LESSON_FIXTURE_REVISION);
    expect(provenance.files).toEqual([
      'valid-learner-lesson-aggregate.json',
      'valid-lesson-aggregate-response.json',
      'valid-exercise-check-response.json',
    ]);
  });
});

describe('curriculumLessonSchema canonical fixtures', () => {
  it('accepts the canonical learner aggregate with all five block variants', () => {
    const parsed = parseCurriculumLessonAggregateResponse({
      request_id: 'req-1',
      status: 'success',
      lesson: aggregateFixture,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.requestId).toBe('req-1');
    expect(parsed.lesson.id).toBe(aggregateFixture.id);
    expect(parsed.lesson.blocks.map(block => block.type)).toEqual([
      'text',
      'example',
      'vocabulary',
      'media',
      'exercise',
    ]);
  });

  it('keeps vocabulary items in fixture order with nullable media fields', () => {
    const parsed = parseCurriculumLessonAggregateResponse({
      request_id: 'req-1',
      status: 'success',
      lesson: aggregateFixture,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const vocabulary = parsed.lesson.blocks[2];
    expect(vocabulary?.type).toBe('vocabulary');
    if (vocabulary?.type !== 'vocabulary') return;
    expect(vocabulary.items).toHaveLength(1);
    expect(vocabulary.items[0]).toMatchObject({
      lemma: 'name',
      meaning: 'tên',
      ipa: '/neɪm/',
      audio: null,
      image: null,
    });
  });

  it('accepts the canonical aggregate success envelope strictly', () => {
    expect(
      CurriculumLessonAggregateSuccessResponseSchema.safeParse(
        aggregateResponseFixture,
      ).success,
    ).toBe(true);
  });

  it('accepts the canonical exercise-check success envelope', () => {
    const parsed = parseCurriculumLessonCheckResponse(checkResponseFixture);
    expect(parsed).toMatchObject({ok: true, correct: true});
    if (!parsed.ok) return;
    expect(parsed.explanation).toMatchObject({en: 'Correct!'});
  });

  it('accepts the strict check request body shape', () => {
    expect(
      CurriculumLessonCheckRequestBodySchema.safeParse({
        answer: {optionId: 'a'},
      }).success,
    ).toBe(true);
    expect(
      CurriculumLessonCheckRequestBodySchema.safeParse({answer: {}}).success,
    ).toBe(false);
    expect(
      CurriculumLessonCheckRequestBodySchema.safeParse({
        answer: {optionId: 'a', extra: 1},
      }).success,
    ).toBe(false);
  });

  it('recognises the four learner error codes', () => {
    for (const code of [
      'LESSON_NOT_FOUND',
      'LESSON_CONTENT_INVALID',
      'EXERCISE_NOT_FOUND',
      'INVALID_EXERCISE_ANSWER',
    ]) {
      expect(CurriculumLessonErrorCodeSchema.safeParse(code).success).toBe(
        true,
      );
    }
  });

  it.each([
    ['valid-learner-lesson-aggregate.json', aggregateFixture],
    ['valid-lesson-aggregate-response.json', aggregateResponseFixture],
    ['valid-exercise-check-response.json', checkResponseFixture],
  ])(
    'fixture %s leaks no answer_key, object_key, or admin fields',
    (_name, fixture) => {
      const serialised = JSON.stringify(fixture);
      expect(serialised).not.toContain('answer_key');
      expect(serialised).not.toContain('object_key');
      expect(serialised).not.toContain('credentials');
    },
  );
});

describe('parseCurriculumLessonBlock fallback', () => {
  it('degrades an unknown block type to unsupported and keeps the rest', () => {
    const lesson = {
      ...(aggregateFixture as {blocks: unknown[]}),
      blocks: [
        ...(aggregateFixture as {blocks: unknown[]}).blocks,
        {id: 'block-x', type: 'quiz', position: 9, data: {}},
      ],
    };
    const parsed = parseCurriculumLessonAggregateResponse({
      request_id: 'req-1',
      status: 'success',
      lesson,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.lesson.blocks).toHaveLength(6);
    expect(parsed.lesson.blocks[5]).toMatchObject({
      type: 'unsupported',
      blockId: 'block-x',
      position: 9,
    });
  });

  it('degrades a malformed known block without losing its identity', () => {
    const fallback = parseCurriculumLessonBlock({
      id: 'block-bad',
      type: 'text',
      position: 3,
      data: {},
    });
    expect(fallback).toMatchObject({
      type: 'unsupported',
      blockId: 'block-bad',
      position: 3,
    });
  });

  it('nulls identity fields the payload does not provide as strings', () => {
    expect(parseCurriculumLessonBlock({type: 'mystery'})).toMatchObject({
      type: 'unsupported',
      blockId: null,
      position: null,
    });
  });

  it('rejects an exercise block with fewer than two options', () => {
    const raw = {
      id: '00000000-0000-4000-8000-000000000015',
      type: 'exercise',
      position: 4,
      exercise: {
        id: '00000000-0000-4000-8000-000000000040',
        type: 'multiple_choice',
        instruction: 'Choose one.',
        prompt: 'Pick.',
        config: {options: [{id: 'a', label: 'Only'}]},
      },
    };
    expect(CurriculumLessonBlockSchema.safeParse(raw).success).toBe(false);
    expect(parseCurriculumLessonBlock(raw).type).toBe('unsupported');
  });

  it('treats a malformed envelope as a content error, not a lesson', () => {
    expect(parseCurriculumLessonAggregateResponse({nope: true}).ok).toBe(false);
    expect(
      parseCurriculumLessonAggregateResponse({
        request_id: 'req-1',
        status: 'success',
        lesson: {...aggregateFixture, blocks: 'not-an-array'},
      }).ok,
    ).toBe(false);
  });

  it('treats a malformed check envelope as a failure', () => {
    expect(parseCurriculumLessonCheckResponse({correct: 'yes'}).ok).toBe(false);
  });
});
