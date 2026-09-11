import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import type {YouTubeTranscript} from '@shared/schemas/youtube-transcript-v1';
import {YouTubeLessonScreen} from '../YouTubeLessonScreen';

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

async function renderScreen(lesson: YouTubeTranscript = makeLesson()) {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>
          <YouTubeLessonScreen lesson={lesson} />
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

    const lineMatches = tree.root.findAll(
      node => node.props?.testID === 'transcript-line-dQw4w9WgXcQ-1',
    );
    // index 0 is the TranscriptLine wrapper; index 1 is the inner Pressable.
    await act(async () => {
      lineMatches[1].props.onPress();
      await Promise.resolve();
    });

    expect(mockSeekTo).toHaveBeenCalledWith(3); // 3_000ms / 1000
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

    // Move playback into segment 0, then enable repeat for it.
    mockCurrentTimeSeconds = 0.1;
    await act(async () => {
      jest.advanceTimersByTime(250);
      await Promise.resolve();
    });

    await act(async () => {
      tree.root.findByProps({testID: 'youtube-toggle-repeat'}).props.onPress();
      await Promise.resolve();
    });

    mockSeekTo.mockClear();

    // Advance playback past segment 0's end into segment 1 — repeat should
    // immediately seek back to segment 0's start (0s).
    mockCurrentTimeSeconds = 3.5;
    await act(async () => {
      jest.advanceTimersByTime(250);
      await Promise.resolve();
    });

    expect(mockSeekTo).toHaveBeenCalledWith(0);
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
});
