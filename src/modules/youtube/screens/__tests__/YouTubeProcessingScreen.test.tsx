import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import {YouTubeProcessingScreen} from '../YouTubeProcessingScreen';

const mockRunYouTubeJob = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();

jest.mock('../../api/youtubeApi', () => ({
  runYouTubeJob: (...args: unknown[]) => mockRunYouTubeJob(...args),
}));

jest.mock('@shared/db/YoutubeLessonRepository', () => ({
  saveYouTubeLesson: jest.fn(),
}));

const navigation = {
  replace: mockReplace,
  goBack: mockGoBack,
} as unknown as React.ComponentProps<typeof YouTubeProcessingScreen>['navigation'];

const route = {
  key: 'YouTubeProcessing',
  name: 'YouTubeProcessing',
  params: {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
} as React.ComponentProps<typeof YouTubeProcessingScreen>['route'];

function renderScreen() {
  return ReactTestRenderer.create(
    <FeatureFlagProvider>
      <AppThemeProvider>
        <YouTubeProcessingScreen navigation={navigation} route={route} />
      </AppThemeProvider>
    </FeatureFlagProvider>,
  );
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('YouTubeProcessingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('surfaces job stage and percent while the job is running', async () => {
    mockRunYouTubeJob.mockImplementation(
      (
        _url: string,
        _cues: unknown,
        onProgress: (p: {percent: number; stage: string | null}) => void,
      ) => {
        onProgress({percent: 40, stage: 'Đang dịch transcript'});
        return new Promise(() => {});
      },
    );

    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = renderScreen();
    });
    await act(async () => {
      await flushPromises();
    });

    expect(
      tree.root.findByProps({testID: 'youtube-processing-stage'}).props
        .children,
    ).toBe('Đang dịch transcript');
    expect(tree.root.findByProps({testID: 'youtube-progress'}).props.children).toEqual(
      [40, '%'],
    );
  });

  it('offers retry with the same URL after failure', async () => {
    mockRunYouTubeJob.mockResolvedValue({
      ok: false,
      errorCode: 'NETWORK_ERROR',
      message: 'Mất kết nối',
    });

    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = renderScreen();
    });
    await act(async () => {
      await flushPromises();
    });

    const retry = tree.root.findByProps({testID: 'youtube-processing-retry'});
    expect(mockRunYouTubeJob).toHaveBeenCalledTimes(1);

    await act(async () => {
      retry.props.onPress();
      await flushPromises();
    });

    expect(mockRunYouTubeJob).toHaveBeenCalledTimes(2);
    expect(mockRunYouTubeJob.mock.calls[1][0]).toBe(route.params.url);
  });
});
