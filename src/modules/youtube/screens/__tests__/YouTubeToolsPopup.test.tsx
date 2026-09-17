import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import type {YouTubeSegment} from '@shared/schemas/youtube-transcript-v1';
import {
  YouTubeToolsPopup,
  type YouTubeToolsPopupProps,
} from '../YouTubeToolsPopup';

function makeSegments(): YouTubeSegment[] {
  return [
    {
      id: 'seg-0',
      index: 0,
      start_ms: 0,
      end_ms: 3000,
      en: 'First sentence',
      vi: 'Câu đầu tiên',
      ipa: 'fɜːrst',
    },
    {
      id: 'seg-1',
      index: 1,
      start_ms: 3000,
      end_ms: 6000,
      en: 'Second sentence',
      vi: 'Câu thứ hai',
      ipa: 'ˈsɛkənd',
    },
    {
      id: 'seg-2',
      index: 2,
      start_ms: 6000,
      end_ms: 9000,
      en: 'Third sentence',
      vi: 'Câu thứ ba',
      ipa: 'θɜːrd',
    },
  ];
}

describe('YouTubeToolsPopup (SETE-332, TASK-5)', () => {
  let activeTree: renderer.ReactTestRenderer | null = null;

  async function renderPopup(props: Partial<YouTubeToolsPopupProps> = {}) {
    const defaultProps: YouTubeToolsPopupProps = {
      visible: true,
      onClose: jest.fn(),
      segments: makeSegments(),
      activeIndex: 1,
      durationS: 10,
      getCurrentTimeS: jest.fn(async () => 4),
      playing: false,
      onTogglePlay: jest.fn(),
      onReplay: jest.fn(),
      onPrevSentence: jest.fn(),
      onNextSentence: jest.fn(),
      onSeekToIndex: jest.fn(),
      onSeekToSeconds: jest.fn(),
      playbackRate: 1,
      onSelectPlaybackRate: jest.fn(),
      loopCount: 1,
      onSelectLoopCount: jest.fn(),
      abLoopStartIndex: null,
      abLoopEndIndex: null,
      abLoopActive: false,
      onToggleAbLoop: jest.fn(),
      onOpenTranscript: jest.fn(),
      ...props,
    };

    await act(async () => {
      activeTree = renderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <YouTubeToolsPopup {...defaultProps} />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
      await Promise.resolve();
    });
    return {tree: activeTree!, props: defaultProps};
  }

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    if (activeTree) {
      act(() => {
        activeTree?.unmount();
      });
      activeTree = null;
    }
    act(() => {
      jest.clearAllTimers();
    });
    jest.useRealTimers();
  });

  it('renders nothing when visible is false', async () => {
    const {tree} = await renderPopup({visible: false});
    expect(tree.toJSON()).toBeNull();
  });

  it('renders seek track, controls, loop, speed, dictation, and transcript options', async () => {
    const {tree} = await renderPopup();

    expect(tree.root.findByProps({testID: 'youtube-tools-popup'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'youtube-tools-close'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'youtube-tools-seek'})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: 'youtube-tools-sentence-label'}).props
        .children,
    ).toBe('Câu 2/3');
    expect(tree.root.findByProps({testID: 'youtube-tools-prev'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'youtube-tools-replay'})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: 'youtube-tools-play-toggle'}),
    ).toBeTruthy();
    expect(tree.root.findByProps({testID: 'youtube-tools-ab'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'youtube-tools-next'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'youtube-tools-loop-1'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'youtube-tools-loop-3'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'youtube-tools-loop-5'})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: 'youtube-tools-loop-inf'}),
    ).toBeTruthy();
    expect(
      tree.root.findByProps({testID: 'youtube-tools-speed-0.5'}),
    ).toBeTruthy();
    expect(
      tree.root.findByProps({testID: 'youtube-tools-speed-0.75'}),
    ).toBeTruthy();
    expect(tree.root.findByProps({testID: 'youtube-tools-speed-1'})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: 'youtube-tools-speed-1.25'}),
    ).toBeTruthy();
    expect(
      tree.root.findByProps({testID: 'youtube-tools-dictation-toggle'}),
    ).toBeTruthy();
    expect(
      tree.root.findByProps({testID: 'youtube-tools-open-transcript'}),
    ).toBeTruthy();
  });

  it('calls playback control callbacks when pressed', async () => {
    const onPrev = jest.fn();
    const onNext = jest.fn();
    const onReplay = jest.fn();
    const onTogglePlay = jest.fn();
    const onToggleAb = jest.fn();

    const {tree} = await renderPopup({
      onPrevSentence: onPrev,
      onNextSentence: onNext,
      onReplay: onReplay,
      onTogglePlay: onTogglePlay,
      onToggleAbLoop: onToggleAb,
    });

    await act(async () => {
      tree.root.findByProps({testID: 'youtube-tools-prev'}).props.onPress();
      tree.root.findByProps({testID: 'youtube-tools-next'}).props.onPress();
      tree.root.findByProps({testID: 'youtube-tools-replay'}).props.onPress();
      tree.root
        .findByProps({testID: 'youtube-tools-play-toggle'})
        .props.onPress();
      tree.root.findByProps({testID: 'youtube-tools-ab'}).props.onPress();
      await Promise.resolve();
    });

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onReplay).toHaveBeenCalledTimes(1);
    expect(onTogglePlay).toHaveBeenCalledTimes(1);
    expect(onToggleAb).toHaveBeenCalledTimes(1);
  });

  it('handles loop selection and speed selection', async () => {
    const onSelectLoop = jest.fn();
    const onSelectSpeed = jest.fn();

    const {tree} = await renderPopup({
      onSelectLoopCount: onSelectLoop,
      onSelectPlaybackRate: onSelectSpeed,
    });

    await act(async () => {
      tree.root.findByProps({testID: 'youtube-tools-loop-3'}).props.onPress();
      tree.root
        .findByProps({testID: 'youtube-tools-speed-1.25'})
        .props.onPress();
      await Promise.resolve();
    });

    expect(onSelectLoop).toHaveBeenCalledWith(3);
    expect(onSelectSpeed).toHaveBeenCalledWith(1.25);
  });

  it('opens dictation box, types text, and checks correctness', async () => {
    const {tree} = await renderPopup({activeIndex: 1});

    // Toggle dictation box open
    await act(async () => {
      tree.root
        .findByProps({testID: 'youtube-tools-dictation-toggle'})
        .props.onPress();
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({testID: 'youtube-tools-dictation-box'}),
    ).toBeTruthy();

    // Type incorrect text
    await act(async () => {
      tree.root
        .findByProps({testID: 'youtube-tools-dictation-input'})
        .props.onChangeText('wrong text');
      await Promise.resolve();
    });
    await act(async () => {
      tree.root
        .findByProps({testID: 'youtube-tools-dictation-check'})
        .props.onPress();
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({testID: 'youtube-tools-dictation-result'}).props
        .children,
    ).toBe('Chưa đúng, nghe lại và thử tiếp.');

    // Type correct text (matches 'Second sentence')
    await act(async () => {
      tree.root
        .findByProps({testID: 'youtube-tools-dictation-input'})
        .props.onChangeText('second sentence');
      await Promise.resolve();
    });
    await act(async () => {
      tree.root
        .findByProps({testID: 'youtube-tools-dictation-check'})
        .props.onPress();
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({testID: 'youtube-tools-dictation-result'}).props
        .children,
    ).toBe('✓ Chính xác!');
  });

  it('opens transcript popup when transcript button is pressed', async () => {
    const onOpenTranscript = jest.fn();
    const {tree} = await renderPopup({onOpenTranscript});

    await act(async () => {
      tree.root
        .findByProps({testID: 'youtube-tools-open-transcript'})
        .props.onPress();
      await Promise.resolve();
    });

    expect(onOpenTranscript).toHaveBeenCalledTimes(1);
  });

  it('renders seek ticks correctly even with duplicate start_ms (SETE-337)', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const segmentsWithDupes = [
      ...makeSegments(),
      {
        id: 'seg-dupe',
        index: 3,
        start_ms: 6000,
        end_ms: 10000,
        en: 'Duplicate',
        vi: 'Trùng',
        ipa: '',
      },
    ];

    const {tree} = await renderPopup({segments: segmentsWithDupes});
    expect(tree.root.findByProps({testID: 'youtube-tools-seek'})).toBeTruthy();

    const duplicateKeyErrors = errorSpy.mock.calls.filter(args =>
      typeof args[0] === 'string' && args[0].includes('Encountered two children with the same key')
    );
    expect(duplicateKeyErrors.length).toBe(0);

    errorSpy.mockRestore();
  });
});
