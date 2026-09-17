import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {FlatList} from 'react-native';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import {DB_NAME} from '@shared/db/constants';
import {getDatabase, resetDatabaseForTests} from '@shared/db/database';
import {runMigrations} from '@shared/db/migrations';
import type {YouTubeTranscript} from '@shared/schemas/youtube-transcript-v1';
import {__resetMockDatabases} from '../../../../../test-utils/sqliteMock';
import {YouTubeLessonScreen} from '../YouTubeLessonScreen';
import {SentenceCarousel} from '../../sentence/SentenceCarousel';
import {SentenceCard} from '../../sentence/SentenceCard';
import {makeEnrichment} from '../../sentence/__tests__/fixtures/sentenceFixtures';
import {speak} from '@modules/audio';

jest.mock('@modules/audio', () => ({
  isEnUsVoiceAvailable: jest.fn(),
  speak: jest.fn(async () => ({ok: true})),
  stop: jest.fn(),
}));

const mockSpeak = speak as jest.Mock;

let mockCurrentTimeSeconds = 0;
const mockSeekTo = jest.fn((seconds: number) => {
  mockCurrentTimeSeconds = seconds;
});

jest.mock('react-native-youtube-iframe', () => {
  const ReactModule = require('react');
  const {View: RNView} = require('react-native');

  const PLAYER_ERRORS = {
    HTML5_ERROR: 'HTML5_error',
    VIDEO_NOT_FOUND: 'video_not_found',
    EMBED_NOT_ALLOWED: 'embed_not_allowed',
    INVALID_PARAMETER: 'invalid_parameter',
  };

  const YoutubeIframe = ReactModule.forwardRef(
    (_props: unknown, ref: unknown) => {
      ReactModule.useImperativeHandle(ref, () => ({
        seekTo: (seconds: number) => mockSeekTo(seconds),
        getCurrentTime: jest.fn(async () => mockCurrentTimeSeconds),
      }));

      return ReactModule.createElement(RNView, {
        testID: 'youtube-iframe',
        ...(_props as object),
        ref,
      });
    },
  );

  return {
    __esModule: true,
    default: YoutubeIframe,
    PLAYER_ERRORS,
  };
});

function makeTestLesson(): YouTubeTranscript {
  return {
    schema_version: 'youtube-transcript-v1',
    video: {
      id: 'dQw4w9WgXcQ',
      title: 'Carousel Integration Lesson',
      channel_title: 'English Bites',
      duration_seconds: 30,
      language: 'en',
      embeddable: true,
    },
    transcript_source: 'auto_caption',
    segments: [
      {
        id: 'dQw4w9WgXcQ-0',
        index: 0,
        start_ms: 0,
        end_ms: 3_000,
        en: 'First learning sentence text',
        vi: 'Câu học đầu tiên',
        ipa: 'fɜːrst ˈlɜːnɪŋ ˈsɛntəns tɛkst',
      },
      {
        id: 'dQw4w9WgXcQ-1',
        index: 1,
        start_ms: 3_000,
        end_ms: 6_000,
        en: 'Second practice sentence text',
        vi: 'Câu luyện tập thứ hai',
        ipa: 'ˈsɛkənd ˈpræktɪs ˈsɛntəns tɛkst',
      },
      {
        id: 'dQw4w9WgXcQ-2',
        index: 2,
        start_ms: 6_000,
        end_ms: 9_000,
        en: 'Third finished sentence text',
        vi: 'Câu kết thúc thứ ba',
        ipa: 'θɜːrd ˈfɪnɪʃt ˈsɛntəns tɛkst',
      },
    ],
    warnings: [],
  };
}

async function renderScreen(
  lesson: YouTubeTranscript = makeTestLesson(),
  extraProps: Partial<React.ComponentProps<typeof YouTubeLessonScreen>> = {},
) {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>
          <YouTubeLessonScreen
            enrichmentMap={{
              0: makeEnrichment(),
              1: makeEnrichment(),
              2: makeEnrichment(),
            }}
            lesson={lesson}
            level="Intermediate"
            {...extraProps}
          />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
    await Promise.resolve();
  });
  return tree;
}

describe('YouTubeLessonScreen + SentenceCarousel Integration (SETE-334, TASK-7)', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
    runMigrations(getDatabase());
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-10T10:00:00.000Z'));
    mockCurrentTimeSeconds = 0;
    mockSeekTo.mockClear();
    mockSpeak.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders SentenceCarousel directly inside YouTubeLessonScreen (regression barrier)', async () => {
    const tree = await renderScreen();

    // Must mount SentenceCarousel component
    const carousel = tree.root.findByType(SentenceCarousel);
    expect(carousel).toBeTruthy();

    // Must have horizontal carousel FlatList with snapInterval
    const carouselList = tree.root.findByProps({
      testID: 'sentence-carousel-list',
    });
    expect(carouselList).toBeTruthy();
    expect(carouselList.props.horizontal).toBe(true);
    expect(carouselList.props.snapToInterval).toBeGreaterThan(0);

    // Must NOT have old vertical transcript-list or TranscriptLine items
    expect(() =>
      tree.root.findByProps({testID: 'youtube-transcript-list'}),
    ).toThrow();
    expect(() =>
      tree.root.findByProps({testID: 'transcript-line-dQw4w9WgXcQ-0'}),
    ).toThrow();
  });

  it('renders SentenceCard for all segments with header titles and proficiency level', async () => {
    const tree = await renderScreen();

    const cards = tree.root.findAllByType(SentenceCard);
    expect(cards).toHaveLength(3);

    for (let i = 0; i < 3; i++) {
      expect(
        tree.root.findByProps({testID: `sentence-card-${i}`}),
      ).toBeTruthy();
      expect(
        tree.root.findByProps({testID: `sentence-card-${i}-header-title`})
          .props.children,
      ).toBe(`Câu ${i + 1}/3`);
      expect(
        tree.root.findByProps({testID: `sentence-card-${i}-level`}).props.label,
      ).toBe('Intermediate');
      expect(
        tree.root.findByProps({testID: `sentence-card-${i}-en`}),
      ).toBeTruthy();
      expect(
        tree.root.findByProps({testID: `sentence-card-${i}-vi`}),
      ).toBeTruthy();
    }
  });

  it('swiping/selecting a sentence card seeks the video player', async () => {
    const tree = await renderScreen();

    const carouselList = tree.root.findByProps({
      testID: 'sentence-carousel-list',
    });
    const snapInterval = carouselList.props.snapToInterval;

    mockSeekTo.mockClear();

    // Swipe to card 1 (index 1)
    await act(async () => {
      carouselList.props.onMomentumScrollEnd({
        nativeEvent: {contentOffset: {x: snapInterval, y: 0}},
      });
      await Promise.resolve();
    });

    // 3_000ms start time - 300ms compensation = 2.7s
    expect(mockSeekTo).toHaveBeenCalledWith(2.7);
  });

  it('tapping next sentence prompt in SentenceCard advances carousel and seeks video', async () => {
    const tree = await renderScreen();

    mockSeekTo.mockClear();

    // Scroll card 0 to bottom to reveal next sentence prompt
    await act(async () => {
      tree.root
        .findByProps({testID: 'sentence-card-0-scroll'})
        .props.onScroll({
          nativeEvent: {
            contentOffset: {y: 400, x: 0},
            layoutMeasurement: {height: 400, width: 300},
            contentSize: {height: 600, width: 300},
          },
        });
      await Promise.resolve();
    });

    // Card 0 bottom next prompt
    const nextPrompt = tree.root.findByProps({
      testID: 'sentence-card-0-bottom-next-prompt',
    });
    expect(nextPrompt).toBeTruthy();

    await act(async () => {
      nextPrompt.props.onPress();
      await Promise.resolve();
    });

    expect(mockSeekTo).toHaveBeenCalledWith(2.7);
  });

  it('tapping word token on SentenceCard triggers TTS speak', async () => {
    const tree = await renderScreen();

    const wordToken = tree.root.findByProps({
      testID: 'sentence-card-0-word-0',
    });
    expect(wordToken).toBeTruthy();

    await act(async () => {
      wordToken.props.onPress();
      await Promise.resolve();
    });

    expect(mockSpeak).toHaveBeenCalledWith('First');
  });

  it('forwards practice sentence action from SentenceCard to onPracticeSentence handler', async () => {
    const onPracticeSentence = jest.fn();
    const tree = await renderScreen(makeTestLesson(), {onPracticeSentence});

    const practiceBtn = tree.root.findByProps({
      testID: 'sentence-card-1-practice-button',
    });
    expect(practiceBtn).toBeTruthy();

    await act(async () => {
      practiceBtn.props.onPress();
      await Promise.resolve();
    });

    expect(onPracticeSentence).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'dQw4w9WgXcQ-1',
        index: 1,
        en: 'Second practice sentence text',
      }),
    );
  });

  it('renders dots indicator for <= 10 segments and syncs active dot with active sentence', async () => {
    const tree = await renderScreen();

    expect(
      tree.root.findByProps({testID: 'youtube-dots-indicator'}),
    ).toBeTruthy();
    expect(tree.root.findByProps({testID: 'youtube-dot-0'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'youtube-dot-1'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'youtube-dot-2'})).toBeTruthy();
  });
});
