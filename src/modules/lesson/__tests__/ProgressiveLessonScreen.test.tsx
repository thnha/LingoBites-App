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
import {
  isLessonV2Saved,
  setLessonV2Saved,
} from '@shared/db/LessonV2Repository';
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

async function openHubSection(
  tree: ReactTestRenderer.ReactTestRenderer,
  sectionTestID: string,
) {
  const wrapper = tree.root.findByProps({testID: sectionTestID});
  const pressable = wrapper.findAll(
    node =>
      typeof node.props?.onPress === 'function' &&
      node.props.accessibilityRole === 'button',
  )[0];
  await ReactTestRenderer.act(async () => {
    pressable.props.onPress();
    await Promise.resolve();
  });
}

async function goBackToHub(tree: ReactTestRenderer.ReactTestRenderer) {
  const back = tree.root.findAll(
    node =>
      node.props?.accessibilityLabel === 'Quay lại' &&
      typeof node.props?.onPress === 'function',
  )[0];
  await ReactTestRenderer.act(async () => {
    back.props.onPress();
    await Promise.resolve();
  });
}

async function pressByTestID(
  tree: ReactTestRenderer.ReactTestRenderer,
  testID: string,
) {
  const node = tree.root.findByProps({testID});
  await ReactTestRenderer.act(async () => {
    node.props.onPress();
    await Promise.resolve();
  });
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

    await openHubSection(tree, 'v2hub-explore-sentences');
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

    await openHubSection(tree, 'v2hub-explore-sentences');
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
    await openHubSection(tree, 'v2hub-explore-sentences');
    expect(
      tree.root.findByProps({testID: `sentence-card-${partial.sentences[0].id}`}),
    ).toBeTruthy();
  });

  it('opens ready_with_warnings from local storage without network (AC19)', async () => {
    const failed = failedChunkLesson();
    expect(upsertLessonV2(failed).ok).toBe(true);
    const tree = await renderScreen(routeFor(failed.lesson_id));

    expect(mockResume).not.toHaveBeenCalled();
    await openHubSection(tree, 'v2hub-explore-sentences');
    expect(
      tree.root.findByProps({testID: `sentence-card-${failed.sentences[0].id}`}),
    ).toBeTruthy();
    await goBackToHub(tree);
    expect(tree.root.findByProps({testID: 'lesson-warnings'})).toBeTruthy();
  });

  it('disables TTS with an explanation when en-US voice is missing (AC20)', async () => {
    mockVoice.mockResolvedValue({ok: true, available: false});
    const skeleton = skeletonLesson();
    const tree = await renderScreen(routeFor(skeleton.lesson_id, skeleton));

    await openHubSection(tree, 'v2hub-explore-sentences');
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

    await openHubSection(tree, 'v2hub-explore-sentences');
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

    await goBackToHub(tree);
    await openHubSection(tree, 'v2hub-explore-vocabulary');
    await ReactTestRenderer.act(async () => {
      tree.root.findByProps({testID: 'vocab-tts-v1'}).props.onPress();
      await Promise.resolve();
    });
    expect(mockSpeak).toHaveBeenCalledWith('cafe', 'en-US');
  });

  it('shows vocabulary IPA and never sentence-level IPA', async () => {
    const withVocab = vocabLesson();
    const tree = await renderScreen(routeFor(withVocab.lesson_id, withVocab));

    await openHubSection(tree, 'v2hub-explore-vocabulary');
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
  it('deduplicates simple_meaning if it matches translation (AC-14)', async () => {
    const lesson = {
      ...baseLesson,
      sentences: [
        {
          ...baseLesson.sentences[0],
          status: 'ready' as const,
          translation: ' Xin chào ',
          simple_meaning: 'Xin chào',
          phrases: [],
        }
      ]
    };
    expect(upsertLessonV2(lesson).ok).toBe(true);
    const tree = await renderScreen(routeFor(lesson.lesson_id));

    await openHubSection(tree, 'v2hub-explore-sentences');
    const card = tree.root.findByProps({testID: `sentence-card-${lesson.sentences[0].id}`});
    const texts = card.findAll(node => node.props.testID === undefined && typeof node.type !== 'string' && (node.type as any).name === 'AppText' && typeof node.props.children === 'string' && node.props.children.trim() === 'Xin chào');
    expect(texts.length).toBe(1);
  });

  it('renders hub with start-learning CTA and bookmark instead of save buttons (SETE-212)', async () => {
    const lesson = {
      ...baseLesson,
      status: 'ready' as const,
      title: 'My Lesson',
    };
    expect(upsertLessonV2(lesson).ok).toBe(true);
    const tree = await renderScreen(routeFor(lesson.lesson_id));

    expect(tree.root.findByProps({testID: 'v2hub-hero'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'v2hub-start-learning'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'v2hub-bookmark'})).toBeTruthy();
    expect(
      tree.root.findAll(node => node.props.testID === 'lesson-ready-cta'),
    ).toHaveLength(0);
    expect(
      tree.root.findAll(node => node.props.testID === 'lesson-progress-header'),
    ).toHaveLength(0);
  });

  it('renders practice entry card instead of embedded answers (SETE-207)', async () => {
    const lesson = {
      ...vocabLesson(),
      status: 'ready' as const,
      vocabulary: Array.from({length: 4}, (_, index) => ({
        id: `v${index}`,
        word: `word${index}`,
        phrase_from_text: null,
        word_type: 'noun',
        meaning_vi: `nghĩa ${index}`,
        ipa: null,
        ipa_source: 'none' as const,
        source_sentence_id: 's0',
        example: 'example',
        example_translation: 'dịch',
        tts: {text: 'word', locale: 'en-US' as const, rate: 1},
      })),
    };
    expect(upsertLessonV2(lesson).ok).toBe(true);
    const tree = await renderScreen(routeFor(lesson.lesson_id));

    await openHubSection(tree, 'v2hub-explore-practice');
    expect(tree.root.findByProps({testID: 'practice-entry-card'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'practice-create-button'})).toBeTruthy();
    expect(
      tree.root.findAll(node => node.props.testID === 'practice-card-p1'),
    ).toHaveLength(0);
  });

  it('asserts style badge, icon name, and string deduplication (AC-15, AC-19, AC-20)', async () => {
    const lesson = {
      ...vocabLesson(),
      grammar: [
        {
          id: 'g1',
          name: 'Thì Present Simple',
          name_vi: 'Thì Present Simple',
          pattern: '',
          found_in_sentence_id: 's0',
          found_in_text: '',
          explanation_vi: '...',
          beginner_tip: '',
          examples: [],
        }
      ]
    };
    lesson.sentences[0].text = 'She works at a small cafe.';
    expect(upsertLessonV2(lesson).ok).toBe(true);
    const tree = await renderScreen(routeFor(lesson.lesson_id));

    await openHubSection(tree, 'v2hub-explore-sentences');
    const badge = tree.root.findByProps({testID: `sentence-status-${lesson.sentences[0].id}`}).parent;
    expect(badge?.props.style).toEqual(expect.objectContaining({ alignSelf: 'flex-start' }));

    await goBackToHub(tree);
    await openHubSection(tree, 'v2hub-explore-vocabulary');
    const vocabTts = tree.root.findByProps({testID: 'vocab-tts-v1'});
    expect(vocabTts.props.icon).toBe('play_circle');

    const vocabCard = tree.root.findByProps({testID: 'vocab-card-v1'});
    const exampleTexts = vocabCard.findAll(node => typeof node.type !== 'string' && (node.type as any).name === 'AppText' && typeof node.props.children === 'string' && node.props.children.includes('She works at a small cafe.'));
    expect(exampleTexts.length).toBe(0);

    await goBackToHub(tree);
    await openHubSection(tree, 'v2hub-explore-grammar');
    const grammarCard = tree.root.findByProps({testID: 'grammar-card-g1'});
    const nameViTexts = grammarCard.findAll(node => typeof node.type !== 'string' && (node.type as any).name === 'AppText' && typeof node.props.children === 'string' && node.props.children.includes('Thì Present Simple'));
    // 1 match expected because it should render `name` but NOT `name_vi`.
    expect(nameViTexts.length).toBe(1);
  });

  describe('Lesson V2 hub (SETE-212)', () => {
    function multiSentenceLesson(): LessonV2 {
      return {
        ...baseLesson,
        revision: 10,
        status: 'ready',
        title: 'Hub Lesson',
        sentences: Array.from({length: 5}, (_, index) => ({
          ...baseLesson.sentences[0],
          id: `hs${index}`,
          index,
          text: `Sentence number ${index + 1}.`,
          translation: `Câu số ${index + 1}.`,
          status: 'ready' as const,
        })),
        chunks: [
          {
            ...baseLesson.chunks[0],
            sentence_ids: ['hs0', 'hs1', 'hs2', 'hs3', 'hs4'],
          },
        ],
      };
    }

    it('renders hero, 3-sentence preview with see-all, 5 explore rows, and bottom CTA', async () => {
      const lesson = multiSentenceLesson();
      expect(upsertLessonV2(lesson).ok).toBe(true);
      const tree = await renderScreen(routeFor(lesson.lesson_id));

      expect(tree.root.findByProps({testID: 'v2hub-hero'})).toBeTruthy();
      expect(tree.root.findByProps({testID: 'v2hub-original-preview'})).toBeTruthy();
      expect(tree.root.findByProps({testID: 'v2hub-translation-preview'})).toBeTruthy();

      const preview = tree.root.findByProps({testID: 'v2hub-original-preview'});
      const previewTexts = preview.findAll(
        node =>
          typeof node.type !== 'string' &&
          (node.type as any).name === 'AppText' &&
          typeof node.props.children === 'string',
      );
      expect(previewTexts).toHaveLength(3);

      const seeAll = tree.root.findByProps({testID: 'v2hub-see-all-sentences'});
      expect(seeAll.props.accessibilityLabel).toContain('5 câu');

      for (const section of [
        'v2hub-explore-sentences',
        'v2hub-explore-vocabulary',
        'v2hub-explore-grammar',
        'v2hub-explore-pronunciation',
        'v2hub-explore-practice',
      ]) {
        expect(tree.root.findByProps({testID: section})).toBeTruthy();
      }
      expect(tree.root.findByProps({testID: 'v2hub-start-learning'})).toBeTruthy();
      expect(tree.root.findByProps({testID: 'v2hub-share'})).toBeTruthy();
    });

    it('shows creating subtitles while the lesson is still generating', async () => {
      const skeletonBase = skeletonLesson();
      const skeleton: LessonV2 = {
        ...skeletonBase,
        units: {
          vocabulary: {status: 'pending', attempts: 0, error_code: null, retryable: false},
          grammar: {status: 'pending', attempts: 0, error_code: null, retryable: false},
          ipa_resolve: skeletonBase.units.ipa_resolve,
          practice: {status: 'pending', attempts: 0, error_code: null, retryable: false},
        },
      };
      mockResume.mockImplementation(() => new Promise(() => {}));
      const tree = await renderScreen(routeFor(skeleton.lesson_id, skeleton));

      const vocabRow = tree.root
        .findByProps({testID: 'v2hub-explore-vocabulary'})
        .findAll(node => node.props?.title === 'Từ vựng chính')[0];
      expect(vocabRow.props.subtitle).toBe('Đang tạo…');

      const sentencesRow = tree.root
        .findByProps({testID: 'v2hub-explore-sentences'})
        .findAll(node => node.props?.title === 'Học từng câu')[0];
      expect(sentencesRow.props.subtitle).toContain('đang tạo');
    });

    it('routes start-learning to practice when eligible, sentences otherwise', async () => {
      const eligible = vocabLesson();
      expect(upsertLessonV2(eligible).ok).toBe(true);
      const eligibleTree = await renderScreen(routeFor(eligible.lesson_id));
      await pressByTestID(eligibleTree, 'v2hub-start-learning');
      expect(
        eligibleTree.root.findByProps({testID: 'practice-entry-card'}),
      ).toBeTruthy();

      const skeleton = skeletonLesson();
      mockResume.mockImplementation(() => new Promise(() => {}));
      const skeletonTree = await renderScreen(
        routeFor(skeleton.lesson_id, skeleton),
      );
      await pressByTestID(skeletonTree, 'v2hub-start-learning');
      expect(
        skeletonTree.root.findByProps({
          testID: `sentence-card-${skeleton.sentences[0].id}`,
        }),
      ).toBeTruthy();
    });

    it('toggles save from the header bookmark', async () => {
      const lesson = {
        ...baseLesson,
        revision: 11,
        status: 'ready' as const,
        title: 'Bookmark Lesson',
      };
      expect(upsertLessonV2(lesson).ok).toBe(true);
      expect(setLessonV2Saved(lesson.lesson_id, false)).toBe(true);
      const tree = await renderScreen(routeFor(lesson.lesson_id));

      expect(isLessonV2Saved(lesson.lesson_id)).toBe(false);
      await ReactTestRenderer.act(async () => {
        tree.root.findByProps({testID: 'v2hub-bookmark'}).props.onPress();
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(isLessonV2Saved(lesson.lesson_id)).toBe(true);
      expect(
        tree.root.findByProps({testID: 'v2hub-bookmark'}).props
          .accessibilityLabel,
      ).toBe('Bỏ lưu bài học');
    });
  });
});
