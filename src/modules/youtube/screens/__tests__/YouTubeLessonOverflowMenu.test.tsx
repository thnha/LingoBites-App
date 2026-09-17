import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Modal} from 'react-native';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import {ScreenHeader} from '@components/ScreenHeader';
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

async function renderScreen(
  lesson: YouTubeTranscript = makeLesson(),
  overrides: {onBack?: () => void; onStartPractice?: () => void} = {},
) {
  const onBack = overrides.onBack ?? jest.fn();
  const onStartPractice = overrides.onStartPractice ?? jest.fn();
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>
          <YouTubeLessonScreen
            lesson={lesson}
            onBack={onBack}
            onStartPractice={onStartPractice}
          />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
    await Promise.resolve();
  });
  return {tree, onBack, onStartPractice};
}

function headerActionChildren(tree: renderer.ReactTestRenderer) {
  const header = tree.root.findByType(ScreenHeader);
  const rightAction = header.props.rightAction as React.ReactElement<{
    children?: React.ReactNode;
  }>;
  return React.Children.toArray(rightAction.props.children);
}

function isMenuOpen(tree: renderer.ReactTestRenderer) {
  // SETE-325 (C-4): the screen now hosts two Modals (overflow menu +
  // transcript popup), so locate the menu by its content, not by type.
  const menuModal = tree.root.findAllByType(Modal).find(modal => {
    try {
      modal.findByProps({testID: 'youtube-overflow-menu'});
      return true;
    } catch {
      return false;
    }
  });
  return menuModal?.props.visible === true;
}

async function openMenu(tree: renderer.ReactTestRenderer) {
  await act(async () => {
    tree.root.findByProps({testID: 'youtube-more-options'}).props.onPress();
    await Promise.resolve();
  });
}

describe('YouTubeLessonScreen overflow menu (SETE-305, Option B)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-10T10:00:00.000Z'));
    mockCurrentTimeSeconds = 0;
    mockSeekTo.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps exactly 4 header controls so Back can never be squeezed out', async () => {
    const {tree} = await renderScreen();

    expect(headerActionChildren(tree)).toHaveLength(4);
    expect(
      tree.root.findByProps({testID: 'youtube-toggle-vietnamese'}),
    ).toBeTruthy();
    expect(tree.root.findByProps({testID: 'youtube-toggle-ipa'})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: 'youtube-start-practice'}),
    ).toBeTruthy();
    expect(
      tree.root.findByProps({testID: 'youtube-more-options'}),
    ).toBeTruthy();
  });

  it('still shows exactly 4 header controls after A-B loop points are set', async () => {
    const {tree} = await renderScreen();

    await openMenu(tree);
    await act(async () => {
      tree.root.findByProps({testID: 'youtube-ab-loop-a'}).props.onPress();
      await Promise.resolve();
    });
    await openMenu(tree);
    await act(async () => {
      tree.root.findByProps({testID: 'youtube-ab-loop-b'}).props.onPress();
      await Promise.resolve();
    });

    // The clear control lives in the menu, never as a fifth header button.
    expect(headerActionChildren(tree)).toHaveLength(4);
    await openMenu(tree);
    expect(
      tree.root.findByProps({testID: 'youtube-ab-loop-clear'}),
    ).toBeTruthy();
  });

  it('opens a labelled menu with Speed, A, B and Repeat (no Clear yet)', async () => {
    const {tree} = await renderScreen();

    expect(isMenuOpen(tree)).toBe(false);
    await openMenu(tree);

    expect(isMenuOpen(tree)).toBe(true);
    expect(
      tree.root.findByProps({testID: 'youtube-overflow-menu'}),
    ).toBeTruthy();
    for (const testID of [
      'youtube-playback-rate',
      'youtube-ab-loop-a',
      'youtube-ab-loop-b',
      'youtube-toggle-repeat',
      // SETE-325 (C-4): the transcript popup entry lives here too.
      'youtube-open-transcript',
    ]) {
      expect(tree.root.findByProps({testID})).toBeTruthy();
    }
    expect(() =>
      tree.root.findByProps({testID: 'youtube-ab-loop-clear'}),
    ).toThrow();
  });

  it('runs a menu action exactly once and closes the menu', async () => {
    const {tree} = await renderScreen();

    await openMenu(tree);
    await act(async () => {
      tree.root.findByProps({testID: 'youtube-playback-rate'}).props.onPress();
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({testID: 'youtube-iframe'}).props.playbackRate,
    ).toBe(1.25);
    expect(isMenuOpen(tree)).toBe(false);
  });

  it('closes the menu when the backdrop is tapped', async () => {
    const {tree} = await renderScreen();

    await openMenu(tree);
    expect(isMenuOpen(tree)).toBe(true);

    await act(async () => {
      tree.root
        .findByProps({testID: 'youtube-overflow-backdrop'})
        .props.onPress();
      await Promise.resolve();
    });

    expect(isMenuOpen(tree)).toBe(false);
  });

  it('keeps playback actions visible but disabled in offline reading mode', async () => {
    const {tree} = await renderScreen();

    await act(async () => {
      tree.root
        .findByProps({testID: 'youtube-iframe'})
        .props.onError('video_not_found');
      await Promise.resolve();
    });

    await openMenu(tree);
    for (const testID of [
      'youtube-playback-rate',
      'youtube-ab-loop-a',
      'youtube-ab-loop-b',
      'youtube-toggle-repeat',
    ]) {
      expect(tree.root.findByProps({testID}).props.disabled).toBe(true);
    }
    // Disabled controls cannot change playback state.
    expect(
      tree.root.findByProps({testID: 'youtube-iframe'}).props.playbackRate,
    ).toBe(1);
    // SETE-325 (C-4): reading the transcript needs no player, so its row
    // stays enabled in offline reading mode.
    expect(
      tree.root.findByProps({testID: 'youtube-open-transcript'}).props.disabled,
    ).toBe(false);
  });

  it('exposes labelled, non-color-only controls for assistive tech', async () => {
    const {tree} = await renderScreen();

    const more = tree.root.findByProps({testID: 'youtube-more-options'});
    expect(typeof more.props.accessibilityLabel).toBe('string');
    expect(more.props.accessibilityLabel.length).toBeGreaterThan(0);

    await openMenu(tree);
    for (const testID of [
      'youtube-playback-rate',
      'youtube-ab-loop-a',
      'youtube-ab-loop-b',
      'youtube-toggle-repeat',
    ]) {
      const item = tree.root.findByProps({testID});
      expect(item.props.accessibilityRole).toBe('button');
      expect(typeof item.props.accessibilityLabel).toBe('string');
      expect(item.props.accessibilityLabel.length).toBeGreaterThan(0);
    }

    // Repeat on: state is announced by more than color (checkmark + label).
    await act(async () => {
      tree.root.findByProps({testID: 'youtube-toggle-repeat'}).props.onPress();
      await Promise.resolve();
    });
    await openMenu(tree);
    expect(
      tree.root.findByProps({testID: 'youtube-toggle-repeat-active-mark'}),
    ).toBeTruthy();
  });

  it('keeps the header Back action wired to onBack', async () => {
    const onBack = jest.fn();
    const {tree} = await renderScreen(makeLesson(), {onBack});

    const header = tree.root.findByType(ScreenHeader);
    expect(typeof header.props.onBack).toBe('function');
    await act(async () => {
      header.props.onBack();
      await Promise.resolve();
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
