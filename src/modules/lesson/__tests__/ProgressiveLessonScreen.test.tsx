import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {LessonsStackParamList} from '@/app/navigation/types';
import {AppThemeProvider} from '@theme';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {open} from 'react-native-quick-sqlite';
import {DB_NAME} from '@shared/db/constants';
import {resetDatabaseForTests} from '@shared/db/database';
import {upsertLessonV2} from '@shared/db/LessonV2Repository';
import type {LessonV2} from '@shared/schemas/lesson-v2';
import fixture from '@shared/schemas/__tests__/fixtures/lesson-v2-envelope.json';
import {
  resumeLessonV2,
  retryLessonV2Chunk,
  retryLessonV2Unit,
} from '@shared/api/lessonV2Client';
import {isEnUsVoiceAvailable, speak} from '@modules/audio';
import {ProgressiveLessonScreen} from '../ProgressiveLessonScreen';

jest.mock('@shared/api/lessonV2Client', () => ({
  resumeLessonV2: jest.fn(),
  retryLessonV2Chunk: jest.fn(),
  retryLessonV2Unit: jest.fn(),
}));

jest.mock('@modules/audio', () => ({
  isEnUsVoiceAvailable: jest.fn(),
  speak: jest.fn(),
  stop: jest.fn(),
}));

const mockResume = resumeLessonV2 as jest.Mock;
const mockRetryChunk = retryLessonV2Chunk as jest.Mock;
const mockRetryUnit = retryLessonV2Unit as jest.Mock;
const mockVoice = isEnUsVoiceAvailable as jest.Mock;
const mockSpeak = speak as jest.Mock;

const baseLesson = fixture.lesson as unknown as LessonV2;

function skeletonLesson(): LessonV2 {
  return {
    ...baseLesson,
    revision: 1,
    status: 'skeleton_ready',
    title: null,
    sentences: baseLesson.sentences.map(sentence => ({
      ...sentence,
      status: 'pending' as const,
      translation: null,
      simple_meaning: null,
      phrases: [],
    })),
    chunks: baseLesson.chunks.map(chunk => ({
      ...chunk,
      status: 'pending' as const,
    })),
    vocabulary: [],
    grammar: [],
  };
}

function enrichedLesson(): LessonV2 {
  return {
    ...baseLesson,
    revision: 2,
    status: 'partially_ready',
  };
}

function failedChunkLesson(): LessonV2 {
  return {
    ...baseLesson,
    revision: 3,
    status: 'ready_with_warnings',
    chunks: baseLesson.chunks.map(chunk => ({
      ...chunk,
      status: 'failed' as const,
      error_code: 'AI_UNIT_INVALID_OUTPUT',
      retryable: true,
    })),
    sentences: baseLesson.sentences.map(sentence => ({
      ...sentence,
      status: 'failed' as const,
      translation: null,
    })),
    warnings: [
      {
        code: 'CHUNK_FAILED',
        unit: 'c0',
        message_vi: 'Một phần chưa xong.',
      },
    ],
  };
}

function vocabLesson(): LessonV2 {
  return {
    ...baseLesson,
    revision: 4,
    status: 'ready',
    vocabulary: [
      {
        id: 'v1',
        word: 'cafe',
        phrase_from_text: null,
        word_type: 'noun',
        meaning_vi: 'quán cà phê',
        ipa: 'kæˈfeɪ',
        ipa_source: 'dictionary' as const,
        source_sentence_id: 's0',
        example: 'She works at a small cafe.',
        example_translation: 'Cô ấy làm ở quán cà phê nhỏ.',
        tts: {text: 'cafe', locale: 'en-US' as const, rate: 1},
      },
    ],
  };
}

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
} as unknown as NativeStackNavigationProp<
  LessonsStackParamList,
  'ProgressiveLesson'
>;

function routeFor(lessonId: string, initialLesson?: LessonV2) {
  return {
    key: 'ProgressiveLesson',
    name: 'ProgressiveLesson',
    params: {lessonId, initialLesson},
  } as React.ComponentProps<typeof ProgressiveLessonScreen>['route'];
}

async function renderScreen(route: ReturnType<typeof routeFor>) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>
          <ProgressiveLessonScreen navigation={navigation} route={route} />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });
  return tree;
}

describe('ProgressiveLessonScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
    mockVoice.mockResolvedValue({ok: true, available: true});
    mockSpeak.mockResolvedValue({ok: true});
    mockResume.mockResolvedValue({ok: true, lesson: baseLesson, completed: true});
    mockRetryChunk.mockResolvedValue({ok: true, lesson: baseLesson, completed: false});
    mockRetryUnit.mockResolvedValue({ok: true, lesson: baseLesson, completed: false});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('opens immediately from skeleton with per-sentence state (AC17)', async () => {
    const skeleton = skeletonLesson();
    mockResume.mockImplementation(() => new Promise(() => {}));
    const tree = await renderScreen(routeFor(skeleton.lesson_id, skeleton));

    expect(
      tree.root.findByProps({testID: `sentence-card-${skeleton.sentences[0].id}`}),
    ).toBeTruthy();
    expect(
      tree.root.findByProps({testID: `sentence-status-${skeleton.sentences[0].id}`})
        .props.children,
    ).toBe('Chờ');
    expect(
      tree.root.findByProps({
        testID: `sentence-skeleton-${skeleton.sentences[0].id}`,
      }),
    ).toBeTruthy();
    expect(mockResume).toHaveBeenCalledWith(
      skeleton.lesson_id,
      expect.objectContaining({initialLesson: skeleton}),
    );
  });

  it('applies progressive updates without losing the skeleton (AC17)', async () => {
    const skeleton = skeletonLesson();
    const enriched = enrichedLesson();
    mockResume.mockImplementation(
      async (_id: string, options?: {onLesson?: (lesson: LessonV2) => void}) => {
        options?.onLesson?.(enriched);
        return {ok: true, lesson: enriched, completed: false};
      },
    );
    const tree = await renderScreen(routeFor(skeleton.lesson_id, skeleton));

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });
    expect(
      tree.root.findByProps({testID: `sentence-status-${enriched.sentences[0].id}`})
        .props.children,
    ).toBe('Xong');
  });

  it('exposes retry for failed chunks and refreshes after retry', async () => {
    const failed = failedChunkLesson();
    expect(upsertLessonV2(failed).ok).toBe(true);
    const tree = await renderScreen(routeFor(failed.lesson_id));

    const retryButton = tree.root.findByProps({
      testID: `chunk-retry-${failed.chunks[0].id}`,
    });
    expect(retryButton).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      retryButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockRetryChunk).toHaveBeenCalledWith(
      failed.lesson_id,
      failed.chunks[0].id,
    );
    expect(mockResume).toHaveBeenCalled();
  });

  it('exposes retry for failed units where allowed', async () => {
    const withFailedUnit: LessonV2 = {
      ...baseLesson,
      revision: 5,
      status: 'ready_with_warnings',
      units: {
        ...baseLesson.units,
        vocabulary: {
          status: 'failed',
          attempts: 3,
          error_code: 'AI_UNIT_INVALID_OUTPUT',
          retryable: true,
        },
      },
    };
    expect(upsertLessonV2(withFailedUnit).ok).toBe(true);
    const tree = await renderScreen(routeFor(withFailedUnit.lesson_id));

    const retryButton = tree.root.findByProps({testID: 'unit-retry-vocabulary'});
    await ReactTestRenderer.act(async () => {
      retryButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockRetryUnit).toHaveBeenCalledWith(
      withFailedUnit.lesson_id,
      'vocabulary',
    );
  });

  it('reads partial lessons offline with a banner (AC19)', async () => {
    const partial: LessonV2 = {
      ...baseLesson,
      revision: 2,
      status: 'partially_ready',
      title: null,
      sentences: baseLesson.sentences.map(sentence => ({
        ...sentence,
        status: 'pending' as const,
        translation: null,
        simple_meaning: null,
        phrases: [],
      })),
      vocabulary: [],
      grammar: [],
    };
    expect(upsertLessonV2(partial).ok).toBe(true);
    mockResume.mockResolvedValue({
      ok: false,
      status: 'polling_stopped',
      errorCode: 'POLLING_STOPPED',
      message: 'Lesson polling paused because the device is offline.',
      lesson: partial,
      retryable: true,
    });
    const tree = await renderScreen(routeFor(partial.lesson_id));

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });
    expect(tree.root.findByProps({testID: 'offline-banner'})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: `sentence-card-${partial.sentences[0].id}`}),
    ).toBeTruthy();
  });

  it('opens ready_with_warnings from local storage without network (AC19)', async () => {
    const failed = failedChunkLesson();
    expect(upsertLessonV2(failed).ok).toBe(true);
    const tree = await renderScreen(routeFor(failed.lesson_id));

    expect(mockResume).not.toHaveBeenCalled();
    expect(
      tree.root.findByProps({testID: `sentence-card-${failed.sentences[0].id}`}),
    ).toBeTruthy();
    expect(tree.root.findByProps({testID: 'lesson-warnings'})).toBeTruthy();
  });

  it('disables TTS with an explanation when en-US voice is missing (AC20)', async () => {
    mockVoice.mockResolvedValue({ok: true, available: false});
    const skeleton = skeletonLesson();
    const tree = await renderScreen(routeFor(skeleton.lesson_id, skeleton));

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });
    const ttsButton = tree.root.findByProps({
      testID: `sentence-tts-${skeleton.sentences[0].id}`,
    });
    expect(ttsButton.props.disabled).toBe(true);
    expect(tree.root.findByProps({testID: 'tts-unavailable-hint'})).toBeTruthy();
  });

  it('speaks sentences and vocabulary through the TTS service (AC20)', async () => {
    const withVocab = vocabLesson();
    const tree = await renderScreen(routeFor(withVocab.lesson_id, withVocab));

    await ReactTestRenderer.act(async () => {
      tree.root
        .findByProps({testID: `sentence-tts-${withVocab.sentences[0].id}`})
        .props.onPress();
      await Promise.resolve();
    });
    expect(mockSpeak).toHaveBeenCalledWith(
      withVocab.sentences[0].tts.text,
      'en-US',
    );

    await ReactTestRenderer.act(async () => {
      tree.root.findByProps({testID: 'vocab-tts-v1'}).props.onPress();
      await Promise.resolve();
    });
    expect(mockSpeak).toHaveBeenCalledWith('cafe', 'en-US');
  });

  it('shows vocabulary IPA and never sentence-level IPA', async () => {
    const withVocab = vocabLesson();
    const tree = await renderScreen(routeFor(withVocab.lesson_id, withVocab));

    expect(tree.root.findByProps({testID: 'vocab-ipa-v1'}).props.children).toEqual([
      '/',
      'kæˈfeɪ',
      '/',
    ]);
    expect(
      tree.root.findAll(
        node =>
          typeof node.props?.testID === 'string' &&
          node.props.testID.startsWith('sentence-ipa-'),
      ),
    ).toHaveLength(0);
  });
});
