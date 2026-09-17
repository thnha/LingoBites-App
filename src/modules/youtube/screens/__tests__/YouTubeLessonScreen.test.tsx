import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Alert} from 'react-native';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import {ScreenHeader} from '@components/ScreenHeader';
import {DB_NAME} from '@shared/db/constants';
import {getDatabase, resetDatabaseForTests} from '@shared/db/database';
import {runMigrations} from '@shared/db/migrations';
import {
  getYouTubeProgress,
  saveYouTubeProgress,
} from '@shared/db/YouTubeProgressRepository';
import {saveYouTubeLesson} from '@shared/db/YoutubeLessonRepository';
import type {YouTubeTranscript} from '@shared/schemas/youtube-transcript-v1';
import {__resetMockDatabases} from '../../../../../test-utils/sqliteMock';
import {
  YouTubeLessonRouteScreen,
  YouTubeLessonScreen,
} from '../YouTubeLessonScreen';
import {YouTubeTranscriptPopup} from '../YouTubeTranscriptPopup';
import {TranscriptLine} from '../../components/TranscriptLine';
import {speak} from '@modules/audio';

jest.mock('@modules/audio', () => ({
  isEnUsVoiceAvailable: jest.fn(),
  speak: jest.fn(),
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

function makeLesson(): YouTubeTranscript {
  return {
    schema_version: 'youtube-transcript-v1',
    video: {
      id: 'dQw4w9WgXcQ',
      title: 'Sample video',
      channel_title: 'Sample channel',
      duration_seconds: 20,
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
        en: 'First sentence',
        vi: 'Câu đầu tiên',
        ipa: 'fɜːrst ˈsɛntəns',
      },
      {
        id: 'dQw4w9WgXcQ-1',
        index: 1,
        start_ms: 3_000,
        end_ms: 6_000,
        en: 'Second sentence',
        vi: 'Câu thứ hai',
        ipa: 'ˈsɛkənd ˈsɛntəns',
      },
      {
        id: 'dQw4w9WgXcQ-2',
        index: 2,
        start_ms: 6_000,
        end_ms: 9_000,
        en: 'Third sentence',
        vi: 'Câu thứ ba',
        ipa: 'θɜːrd ˈsɛntəns',
      },
    ],
    warnings: [],
  };
}

async function openOverflowMenu(tree: renderer.ReactTestRenderer) {
  await act(async () => {
    tree.root.findByProps({testID: 'youtube-more-options'}).props.onPress();
    await Promise.resolve();
  });
}

async function renderScreen(
  lesson: YouTubeTranscript = makeLesson(),
  extraProps: Partial<React.ComponentProps<typeof YouTubeLessonScreen>> = {},
) {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>
          <YouTubeLessonScreen lesson={lesson} {...extraProps} />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
    await Promise.resolve();
  });
  return tree;
}

describe('YouTubeLessonScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-10T10:00:00.000Z'));
    mockCurrentTimeSeconds = 0;
    mockSeekTo.mockClear();
    mockSpeak.mockClear();
    mockSpeak.mockResolvedValue({ok: true});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders all three lines (English, Vietnamese, IPA) for every segment', async () => {
    const tree = await renderScreen();

    for (const id of ['dQw4w9WgXcQ-0', 'dQw4w9WgXcQ-1', 'dQw4w9WgXcQ-2']) {
      expect(
        tree.root.findByProps({testID: `transcript-line-${id}-en`}).props
          .children,
      ).toBeTruthy();
      expect(
        tree.root.findByProps({testID: `transcript-line-${id}-vi`}).props
          .children,
      ).toBeTruthy();
      expect(
        tree.root.findByProps({testID: `transcript-line-${id}-ipa`}).props
          .children,
      ).toBeTruthy();
    }
  });

  it('tapping a line seeks the player to that segment start, in seconds', async () => {
    const tree = await renderScreen();

    const enLine = tree.root.findByProps({
      testID: 'transcript-line-dQw4w9WgXcQ-1-en',
    });
    let pressable: renderer.ReactTestInstance | null = enLine;
    while (pressable && typeof pressable.props?.onPress !== 'function') {
      pressable = pressable.parent;
    }
    await act(async () => {
      pressable!.props.onPress();
      await Promise.resolve();
    });

    // SETE-325 (C-1): 300ms early-start compensation → (3_000 − 300) / 1000
    expect(mockSeekTo).toHaveBeenCalledWith(2.7);
  });

  it('speaks the tapped word via TTS (SETE-325, C-2)', async () => {
    const tree = await renderScreen();

    await act(async () => {
      tree.root
        .findByProps({testID: 'transcript-line-dQw4w9WgXcQ-1-word-0'})
        .props.onPress();
      await Promise.resolve();
    });

    expect(mockSpeak).toHaveBeenCalledWith('Second');
  });

  it('alerts the service message when TTS fails (SETE-325, C-2)', async () => {
    mockSpeak.mockResolvedValue({
      ok: false,
      errorCode: 'VOICE_UNAVAILABLE',
      message: 'missing voice',
    });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    try {
      const tree = await renderScreen();

      await act(async () => {
        tree.root
          .findByProps({testID: 'transcript-line-dQw4w9WgXcQ-1-word-0'})
          .props.onPress();
        await Promise.resolve();
      });

      expect(alertSpy).toHaveBeenCalledWith(expect.anything(), 'missing voice');
    } finally {
      alertSpy.mockRestore();
    }
  });

  it('forwards per-sentence practice taps (SETE-325, C-3)', async () => {
    const onPracticeSentence = jest.fn();
    const tree = await renderScreen(makeLesson(), {onPracticeSentence});

    await act(async () => {
      tree.root
        .findByProps({testID: 'transcript-line-dQw4w9WgXcQ-2-practice'})
        .props.onPress();
      await Promise.resolve();
    });

    expect(onPracticeSentence).toHaveBeenCalledWith(
      expect.objectContaining({id: 'dQw4w9WgXcQ-2'}),
    );
  });

  it('opens the transcript popup from the menu and seeks without closing (SETE-325, C-4)', async () => {
    const tree = await renderScreen();

    expect(tree.root.findByType(YouTubeTranscriptPopup).props.visible).toBe(false);
    await openOverflowMenu(tree);
    await act(async () => {
      tree.root.findByProps({testID: 'youtube-open-transcript'}).props.onPress();
      await Promise.resolve();
    });

    expect(tree.root.findByType(YouTubeTranscriptPopup).props.visible).toBe(true);
    const popupLines = tree.root
      .findAllByType(TranscriptLine)
      .filter(node => String(node.props.testID).startsWith('youtube-popup-line-'));
    expect(popupLines).toHaveLength(3);

    mockSeekTo.mockClear();
    await act(async () => {
      popupLines[2].props.onPress(makeLesson().segments[2]);
      await Promise.resolve();
    });

    // (6_000 − 300) / 1000 with C-1 compensation, popup stays open.
    expect(mockSeekTo).toHaveBeenCalledWith(5.7);
    expect(tree.root.findByType(YouTubeTranscriptPopup).props.visible).toBe(true);

    await act(async () => {
      tree.root
        .findByProps({testID: 'youtube-transcript-popup-close'})
        .props.onPress();
      await Promise.resolve();
    });
    expect(tree.root.findByType(YouTubeTranscriptPopup).props.visible).toBe(false);
  });

  it('toggles Vietnamese and IPA display independently', async () => {
    const tree = await renderScreen();

    await act(async () => {
      tree.root
        .findByProps({testID: 'youtube-toggle-vietnamese'})
        .props.onPress();
      await Promise.resolve();
    });

    expect(() =>
      tree.root.findByProps({testID: 'transcript-line-dQw4w9WgXcQ-0-vi'}),
    ).toThrow();
    expect(() =>
      tree.root.findByProps({testID: 'transcript-line-dQw4w9WgXcQ-0-ipa'}),
    ).not.toThrow();

    await act(async () => {
      tree.root.findByProps({testID: 'youtube-toggle-ipa'}).props.onPress();
      await Promise.resolve();
    });

    expect(() =>
      tree.root.findByProps({testID: 'transcript-line-dQw4w9WgXcQ-0-ipa'}),
    ).toThrow();
  });

  it('follows and re-seeks the active sentence while repeat is on', async () => {
    const tree = await renderScreen();

    mockCurrentTimeSeconds = 0.1;
    await act(async () => {
      jest.advanceTimersByTime(250);
      await Promise.resolve();
    });

    await openOverflowMenu(tree);
    await act(async () => {
      tree.root.findByProps({testID: 'youtube-toggle-repeat'}).props.onPress();
      await Promise.resolve();
    });

    mockSeekTo.mockClear();

    mockCurrentTimeSeconds = 3.5;
    await act(async () => {
      jest.advanceTimersByTime(250);
      await Promise.resolve();
    });

    expect(mockSeekTo).toHaveBeenCalledWith(0);
  });

  it('passes playback rate to the iframe', async () => {
    const tree = await renderScreen();

    expect(
      tree.root.findByProps({testID: 'youtube-iframe'}).props.playbackRate,
    ).toBe(1);

    await openOverflowMenu(tree);
    await act(async () => {
      tree.root.findByProps({testID: 'youtube-playback-rate'}).props.onPress();
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({testID: 'youtube-iframe'}).props.playbackRate,
    ).toBe(1.25);
  });

  it('loops between A and B segment markers', async () => {
    const tree = await renderScreen();

    mockCurrentTimeSeconds = 0.1;
    await act(async () => {
      jest.advanceTimersByTime(250);
      await Promise.resolve();
    });

    await openOverflowMenu(tree);
    await act(async () => {
      tree.root.findByProps({testID: 'youtube-ab-loop-a'}).props.onPress();
      await Promise.resolve();
    });

    mockCurrentTimeSeconds = 3.5;
    await act(async () => {
      jest.advanceTimersByTime(250);
      await Promise.resolve();
    });

    // Selecting A closes the menu, so reopen it before setting B.
    await openOverflowMenu(tree);
    await act(async () => {
      tree.root.findByProps({testID: 'youtube-ab-loop-b'}).props.onPress();
      await Promise.resolve();
    });

    mockSeekTo.mockClear();
    mockCurrentTimeSeconds = 6.5;

    await act(async () => {
      jest.advanceTimersByTime(250);
      await Promise.resolve();
    });

    expect(mockSeekTo).toHaveBeenCalledWith(0);
    expect(
      tree.root.findByProps({testID: 'youtube-ab-loop-status'}),
    ).toBeTruthy();
  });

  it('shows an inline error when the player reports a playback error', async () => {
    const tree = await renderScreen();

    const iframe = tree.root.findByProps({testID: 'youtube-iframe'});
    await act(async () => {
      iframe.props.onError('embed_not_allowed');
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({testID: 'youtube-player-error'}),
    ).toBeTruthy();
  });

  it('enters offline reading mode with the full cached transcript when the player errors', async () => {
    const tree = await renderScreen();

    const iframe = tree.root.findByProps({testID: 'youtube-iframe'});
    await act(async () => {
      iframe.props.onError('embed_not_allowed');
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({testID: 'youtube-offline-banner'}),
    ).toBeTruthy();
    expect(
      tree.root.findByProps({testID: 'youtube-player-error'}),
    ).toBeTruthy();

    for (const id of ['dQw4w9WgXcQ-0', 'dQw4w9WgXcQ-1', 'dQw4w9WgXcQ-2']) {
      expect(
        tree.root.findByProps({testID: `transcript-line-${id}-en`}),
      ).toBeTruthy();
      expect(
        tree.root.findByProps({testID: `transcript-line-${id}-vi`}),
      ).toBeTruthy();
      expect(
        tree.root.findByProps({testID: `transcript-line-${id}-ipa`}),
      ).toBeTruthy();
    }
  });

  it('disables playback controls in offline reading mode', async () => {
    const tree = await renderScreen();

    const iframe = tree.root.findByProps({testID: 'youtube-iframe'});
    await act(async () => {
      iframe.props.onError('video_not_found');
      await Promise.resolve();
    });

    await openOverflowMenu(tree);
    for (const testID of [
      'youtube-playback-rate',
      'youtube-toggle-repeat',
      'youtube-ab-loop-a',
      'youtube-ab-loop-b',
    ]) {
      expect(tree.root.findByProps({testID}).props.disabled).toBe(true);
    }

    const enLine = tree.root.findByProps({
      testID: 'transcript-line-dQw4w9WgXcQ-1-en',
    });
    let pressable: renderer.ReactTestInstance | null = enLine;
    while (pressable && typeof pressable.props?.onPress !== 'function') {
      pressable = pressable.parent;
    }
    expect(pressable!.props.disabled).toBe(true);
    await act(async () => {
      pressable!.props.onPress();
      await Promise.resolve();
    });

    expect(mockSeekTo).not.toHaveBeenCalled();
  });

  it('disables VI/IPA toggles when their content is empty (SETE-290)', async () => {
    const lesson = makeLesson();
    const empty = {
      ...lesson,
      segments: lesson.segments.map(segment => ({
        ...segment,
        vi: '',
        ipa: '',
      })),
    };
    const tree = await renderScreen(empty);

    expect(
      tree.root.findByProps({testID: 'youtube-toggle-vietnamese'}).props
        .disabled,
    ).toBe(true);
    expect(
      tree.root.findByProps({testID: 'youtube-toggle-ipa'}).props.disabled,
    ).toBe(true);
  });

  it('shows lesson warnings when the payload carries them (SETE-290)', async () => {
    const tree = await renderScreen({
      ...makeLesson(),
      warnings: ['partial audio'],
    });

    expect(
      tree.root.findByProps({testID: 'youtube-lesson-warnings'}),
    ).toBeTruthy();
  });

  it('shows no warnings banner for a clean lesson', async () => {
    const tree = await renderScreen();

    expect(() =>
      tree.root.findByProps({testID: 'youtube-lesson-warnings'}),
    ).toThrow();
  });
});

describe('YouTubeLessonRouteScreen save warning (SETE-283, HVB-07)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-10T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  async function renderRoute(params: unknown, navigationOverrides = {}) {
    const tabNavigate = jest.fn();
    const navigation: {
      goBack: jest.Mock;
      navigate: jest.Mock;
      reset: jest.Mock;
      getParent: jest.Mock;
      addListener: jest.Mock;
    } = {
      goBack: jest.fn(),
      navigate: jest.fn(),
      reset: jest.fn(),
      getParent: jest.fn(() => ({navigate: tabNavigate})),
      addListener: jest.fn(() => jest.fn()),
      ...navigationOverrides,
    };
    const route = {key: 'YouTubeLesson', name: 'YouTubeLesson', params};
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <YouTubeLessonRouteScreen
              navigation={navigation as never}
              route={route as never}
            />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
      await Promise.resolve();
    });
    return {tree, navigation, tabNavigate};
  }

  function pressRouteBack(tree: renderer.ReactTestRenderer) {
    const header = tree.root.findByType(ScreenHeader);
    if (typeof header.props.onBack !== 'function') {
      throw new Error('No route back handler');
    }
    return act(async () => {
      header.props.onBack();
      await Promise.resolve();
    });
  }

  it('warns that the lesson was not saved when saveFailed is set', async () => {
    const {tree} = await renderRoute({lesson: makeLesson(), saveFailed: true});

    expect(
      tree.root.findByProps({testID: 'youtube-lesson-save-warning'}),
    ).toBeTruthy();
    // The lesson itself still opens — content is not blocked.
    expect(
      tree.root.findByProps({testID: 'youtube-transcript-list'}),
    ).toBeTruthy();
  });

  it('shows no warning for a normally saved lesson', async () => {
    const {tree} = await renderRoute({lesson: makeLesson()});

    expect(() =>
      tree.root.findByProps({testID: 'youtube-lesson-save-warning'}),
    ).toThrow();
    expect(
      tree.root.findByProps({testID: 'youtube-transcript-list'}),
    ).toBeTruthy();
  });

  it('exits a fresh lesson to Home, never back to the URL input (SETE-290)', async () => {
    const {tree, navigation, tabNavigate} = await renderRoute({
      lesson: makeLesson(),
    });

    await pressRouteBack(tree);

    expect(navigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{name: 'CreateMain'}],
    });
    expect(tabNavigate).toHaveBeenCalledWith('Home');
    expect(navigation.goBack).not.toHaveBeenCalled();
  });

  it('intercepts system Back on a fresh lesson and exits to Home (SETE-290)', async () => {
    const {navigation, tabNavigate} = await renderRoute({
      lesson: makeLesson(),
    });

    expect(navigation.addListener).toHaveBeenCalledWith(
      'beforeRemove',
      expect.any(Function),
    );
    const listener = navigation.addListener.mock.calls[0]?.[1] as
      | ((event: {data: {action: {type: string}}; preventDefault: () => void}) => void)
      | undefined;
    if (!listener) throw new Error('beforeRemove listener not registered');
    const preventDefault = jest.fn();
    listener({data: {action: {type: 'POP'}}, preventDefault});

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(navigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{name: 'CreateMain'}],
    });
    expect(tabNavigate).toHaveBeenCalledWith('Home');
  });

  it('keeps plain goBack for a saved lesson (SETE-289 preserved)', async () => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
    runMigrations(getDatabase());
    expect(saveYouTubeLesson({lesson: makeLesson()}).ok).toBe(true);

    const {tree, navigation} = await renderRoute({lessonId: 'dQw4w9WgXcQ'});

    expect(
      tree.root.findByProps({testID: 'youtube-transcript-list'}),
    ).toBeTruthy();
    await pressRouteBack(tree);

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
    expect(navigation.reset).not.toHaveBeenCalled();
  });

  it('opens SpeakingRoom with the tapped sentence via the tab parent (SETE-325, C-3)', async () => {
    const {tree, tabNavigate} = await renderRoute({lesson: makeLesson()});

    await act(async () => {
      tree.root
        .findByProps({testID: 'transcript-line-dQw4w9WgXcQ-0-practice'})
        .props.onPress();
      await Promise.resolve();
    });

    expect(tabNavigate).toHaveBeenCalledWith('Lessons', {
      screen: 'SpeakingRoom',
      params: {sentenceText: 'First sentence'},
    });
  });

  it('falls back to Tabs > Lessons > SpeakingRoom from History (SETE-325, C-3)', async () => {
    const rootNavigate = jest.fn();
    const {tree} = await renderRoute(
      {lesson: makeLesson()},
      {
        getParent: jest.fn(() => ({
          getState: () => ({
            routeNames: ['Tabs', 'YouTubeHistory', 'YouTubeLesson'],
          }),
          navigate: rootNavigate,
        })),
      },
    );

    await act(async () => {
      tree.root
        .findByProps({testID: 'transcript-line-dQw4w9WgXcQ-1-practice'})
        .props.onPress();
      await Promise.resolve();
    });

    expect(rootNavigate).toHaveBeenCalledWith('Tabs', {
      screen: 'Lessons',
      params: {screen: 'SpeakingRoom', params: {sentenceText: 'Second sentence'}},
    });
  });
});

describe('YouTubeLessonScreen resume (SETE-290 DEV-3)', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
    runMigrations(getDatabase());
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-10T10:00:00.000Z'));
    mockCurrentTimeSeconds = 0;
    mockSeekTo.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('seeks to the saved position on ready and stays paused', async () => {
    saveYouTubeProgress({
      lessonId: 'dQw4w9WgXcQ',
      positionMs: 4500,
      segmentIndex: 1,
    });
    const tree = await renderScreen();
    expect(mockSeekTo).not.toHaveBeenCalled();

    await act(async () => {
      tree.root.findByProps({testID: 'youtube-iframe'}).props.onReady();
      await Promise.resolve();
    });

    expect(mockSeekTo).toHaveBeenCalledWith(4.5);
    // The contract is seek-but-paused: the user presses Play to continue.
    expect(
      tree.root.findByProps({testID: 'youtube-iframe'}).props.play,
    ).toBe(false);
  });

  it('does not seek when there is no saved progress', async () => {
    const tree = await renderScreen();

    await act(async () => {
      tree.root.findByProps({testID: 'youtube-iframe'}).props.onReady();
      await Promise.resolve();
    });

    expect(mockSeekTo).not.toHaveBeenCalled();
  });

  it('clears progress when the video ends so the next open starts over', async () => {
    saveYouTubeProgress({
      lessonId: 'dQw4w9WgXcQ',
      positionMs: 4500,
      segmentIndex: 1,
    });
    const tree = await renderScreen();

    await act(async () => {
      tree.root
        .findByProps({testID: 'youtube-iframe'})
        .props.onChangeState('ended');
      await Promise.resolve();
    });

    expect(getYouTubeProgress('dQw4w9WgXcQ')).toBeNull();
  });
});
