import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {ActivityIndicator, Text} from 'react-native';
import {FeatureFlagProvider} from '../../../release';
import {NETWORK_LOST_MESSAGE} from '../../../shared/copy/userMessages';
import type {AnalysisJobStage} from '../../../shared/api/types';
import {AppThemeProvider} from '../../../theme';
import {AnalyzingScreen} from '../AnalyzingScreen';
import type {AnalysisProgress, AnalyzeTextResult} from '../types';

const mockAnalyzeText = jest.fn();
const mockReset = jest.fn();
const mockDispatch = jest.fn();
const mockGoBack = jest.fn();

jest.mock('../AIAnalysisService', () => ({
  analyzeText: (...args: unknown[]) => mockAnalyzeText(...args),
}));

// The global jest setup stubs @react-navigation/native without CommonActions,
// which AnalyzingScreen uses for the error -> origin navigation.
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: () => ({goBack: jest.fn(), navigate: jest.fn()}),
  CommonActions: {
    navigate: (options: unknown) => ({type: 'NAVIGATE', payload: options}),
  },
}));

const navigation = {
  reset: mockReset,
  dispatch: mockDispatch,
  goBack: mockGoBack,
} as unknown as React.ComponentProps<typeof AnalyzingScreen>['navigation'];

function makeRoute(origin: 'PasteText' | 'OCRReview') {
  return {
    key: 'Analyzing',
    name: 'Analyzing',
    params: {
      confirmedText: 'Hello world',
      sourceType: 'paste_text' as const,
      origin,
    },
  } as React.ComponentProps<typeof AnalyzingScreen>['route'];
}

function renderScreen(origin: 'PasteText' | 'OCRReview' = 'PasteText') {
  return ReactTestRenderer.create(
    <FeatureFlagProvider>
      <AppThemeProvider>
        <AnalyzingScreen navigation={navigation} route={makeRoute(origin)} />
      </AppThemeProvider>
    </FeatureFlagProvider>,
  );
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

async function wait(ms: number) {
  await new Promise<void>(resolve => setTimeout(resolve, ms));
}

function textContent(root: ReactTestRenderer.ReactTestInstance): string {
  return root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat(Infinity)
    .join(' ');
}

function stage(name: string, status: AnalysisJobStage['status']): AnalysisJobStage {
  return {name, status, attempts: status === 'pending' ? 0 : 1};
}

// A deferred promise plus the resolver, so tests can drive the onProgress
// callback (captured from the mocked analyzeText call) before deciding how
// analyzeText itself ultimately resolves.
function deferredAnalyzeTextResult() {
  let resolve!: (value: AnalyzeTextResult) => void;
  const promise = new Promise<AnalyzeTextResult>(res => {
    resolve = res;
  });
  return {promise, resolve};
}

const STAGE_LABELS = [
  'Đang dịch và sắp xếp nội dung',
  'Đang phân tích từng câu',
  'Đang tìm ngữ pháp và từ vựng',
  'Đang chuẩn bị hướng dẫn phát âm',
  'Đang tạo bài luyện tập',
  'Đang kiểm tra bài học',
];

const FALLBACK_SUBTITLE =
  'App đang phân tích đoạn text bạn xác nhận. Giữ app mở một chút nhé.';

describe('AnalyzingScreen', () => {
  beforeEach(() => {
    mockAnalyzeText.mockReset();
    mockReset.mockReset();
    mockDispatch.mockReset();
    mockGoBack.mockReset();
  });

  it('runs analyzeText and resets to LessonResult on success', async () => {
    const lesson = {title: 'Lesson', original_text: 'Hello world'};
    const {promise, resolve} = deferredAnalyzeTextResult();
    mockAnalyzeText.mockReturnValue(promise);

    await act(async () => {
      renderScreen('PasteText');
    });

    resolve({ok: true, lesson: lesson as never});

    // Let analyzeText resolve, then clear the short completion hold timer.
    await act(async () => {
      await flushPromises();
      await wait(300);
    });

    expect(mockAnalyzeText).toHaveBeenCalledWith(
      'Hello world',
      {sourceType: 'paste_text'},
      expect.any(Function),
      expect.any(AbortSignal),
    );
    expect(mockReset).toHaveBeenCalledWith({
      index: 1,
      routes: [
        {name: 'HomeMain'},
        {
          name: 'LessonResult',
          params: {
            lesson,
            confirmedText: 'Hello world',
            sourceType: 'paste_text',
          },
        },
      ],
    });
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('returns to the origin screen with an error message on failure', async () => {
    mockAnalyzeText.mockResolvedValue({
      ok: false,
      errorCode: 'NETWORK_ERROR',
      message: NETWORK_LOST_MESSAGE,
    });

    await act(async () => {
      renderScreen('OCRReview');
    });
    await act(async () => {
      await flushPromises();
      await wait(0);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    const action = mockDispatch.mock.calls[0][0] as {
      payload?: {name?: string; params?: unknown; merge?: boolean};
    };
    expect(action.payload).toEqual(
      expect.objectContaining({
        name: 'OCRReview',
        params: {analyzeError: NETWORK_LOST_MESSAGE},
        merge: true,
      }),
    );
    expect(mockReset).not.toHaveBeenCalled();
  });

  describe('backend progress rendering', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    let onProgress: (progress: AnalysisProgress) => void;

    beforeEach(async () => {
      const {promise} = deferredAnalyzeTextResult();
      mockAnalyzeText.mockReturnValue(promise);

      await act(async () => {
        renderer = renderScreen('PasteText');
      });

      onProgress = mockAnalyzeText.mock.calls[0][2];
    });

    it('shows the fallback subtitle before any progress callback has fired', () => {
      expect(textContent(renderer.root)).toContain(FALLBACK_SUBTITLE);
    });

    it('renders the six static stage labels in source order regardless of stages payload', () => {
      act(() => {
        onProgress({
          percent: 10,
          stage: 'source_analysis',
          message: null,
          stages: [stage('finalizing', 'processing'), stage('source_analysis', 'processing')],
        });
      });

      const content = textContent(renderer.root);
      const positions = STAGE_LABELS.map(label => content.indexOf(label));
      expect(positions.every(index => index >= 0)).toBe(true);
      for (let i = 1; i < positions.length; i += 1) {
        expect(positions[i]).toBeGreaterThan(positions[i - 1]);
      }
    });

    it('updates the percent label and progress track from a server snapshot', () => {
      act(() => {
        onProgress({
          percent: 40,
          stage: 'sentence_analysis',
          message: 'Đang phân tích từng câu',
          stages: [stage('source_analysis', 'completed'), stage('sentence_analysis', 'processing')],
        });
      });

      expect(textContent(renderer.root)).toContain('40%');

      const track = renderer.root.findByProps({label: '40%'});
      expect(track.props.progress).toBe(0.4);
    });

    it.each([
      [-10, '0%', 0],
      [150, '100%', 1],
    ])(
      'clamps an out-of-range percent (%i) to %s for display without altering the raw snapshot',
      (percent, expectedLabel, expectedTrackProgress) => {
        act(() => {
          onProgress({
            percent,
            stage: 'sentence_analysis',
            message: 'Đang phân tích từng câu',
            stages: [stage('sentence_analysis', 'processing')],
          });
        });

        expect(textContent(renderer.root)).toContain(expectedLabel);
        expect(textContent(renderer.root)).not.toContain(`${percent}%`);
        const track = renderer.root.findByProps({label: expectedLabel});
        expect(track.props.progress).toBe(expectedTrackProgress);

        // Only the display is clamped: a subsequent in-range snapshot still
        // renders its own real percent, proving no clamped value stuck around.
        act(() => {
          onProgress({
            percent: 55,
            stage: 'sentence_analysis',
            message: 'Đang phân tích từng câu',
            stages: [stage('sentence_analysis', 'processing')],
          });
        });
        expect(textContent(renderer.root)).toContain('55%');
      },
    );

    it('shows the server message as the subtitle when present', () => {
      act(() => {
        onProgress({
          percent: 40,
          stage: 'sentence_analysis',
          message: 'Đang phân tích từng câu',
          stages: [stage('sentence_analysis', 'processing')],
        });
      });

      expect(textContent(renderer.root)).toContain('Đang phân tích từng câu');
      expect(textContent(renderer.root)).not.toContain(FALLBACK_SUBTITLE);
    });

    it('falls back to the static subtitle when the server message is null', () => {
      act(() => {
        onProgress({
          percent: 0,
          stage: null,
          message: null,
          stages: [],
        });
      });

      expect(textContent(renderer.root)).toContain(FALLBACK_SUBTITLE);
    });

    it('renders done indicators (check marks) for completed and skipped stages', () => {
      act(() => {
        onProgress({
          percent: 30,
          stage: 'learning_points',
          message: null,
          stages: [
            stage('source_analysis', 'completed'),
            stage('sentence_analysis', 'skipped'),
            stage('learning_points', 'processing'),
          ],
        });
      });

      const checkMarks = renderer.root
        .findAllByType(Text)
        .filter(node => node.props.children === '✓');
      expect(checkMarks.length).toBe(2);
    });

    it('renders active indicators (ActivityIndicator) for processing, retrying, and failed stages, allowing more than one active at once', () => {
      act(() => {
        onProgress({
          percent: 50,
          stage: 'pronunciation',
          message: null,
          stages: [
            stage('source_analysis', 'completed'),
            stage('sentence_analysis', 'processing'),
            stage('learning_points', 'retrying'),
            stage('pronunciation', 'failed'),
          ],
        });
      });

      const activeIndicators = renderer.root.findAllByType(ActivityIndicator);
      // sentence_analysis (processing) + learning_points (retrying) +
      // pronunciation (failed) => three simultaneously active rows.
      expect(activeIndicators.length).toBe(3);
    });

    it('renders pending indicators for pending and omitted stages (no check mark, no activity indicator)', () => {
      act(() => {
        onProgress({
          percent: 10,
          stage: 'source_analysis',
          message: null,
          stages: [stage('source_analysis', 'processing'), stage('sentence_analysis', 'pending')],
        });
      });

      // Only source_analysis is active; the remaining five (sentence_analysis
      // explicitly pending, and four more entirely omitted from the payload)
      // must render as pending: no check mark, no ActivityIndicator.
      const activeIndicators = renderer.root.findAllByType(ActivityIndicator);
      expect(activeIndicators.length).toBe(1);
      const checkMarks = renderer.root
        .findAllByType(Text)
        .filter(node => node.props.children === '✓');
      expect(checkMarks.length).toBe(0);
    });
  });

  it('forces 100% and marks all six stages done on success before the completion hold, then navigates', async () => {
    const lesson = {title: 'Lesson', original_text: 'Hello world'};
    const {promise, resolve} = deferredAnalyzeTextResult();
    mockAnalyzeText.mockReturnValue(promise);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderScreen('PasteText');
    });

    const onProgress = mockAnalyzeText.mock.calls[0][2];
    act(() => {
      onProgress({
        percent: 40,
        stage: 'sentence_analysis',
        message: 'Đang phân tích từng câu',
        stages: [stage('source_analysis', 'completed'), stage('sentence_analysis', 'processing')],
      });
    });

    resolve({ok: true, lesson: lesson as never});

    // Flush the resolved analyzeText promise but not yet the completion hold
    // timer, so we can observe the "forced complete" render before navigation.
    await act(async () => {
      await flushPromises();
    });

    expect(textContent(renderer.root)).toContain('100%');
    const checkMarks = renderer.root
      .findAllByType(Text)
      .filter(node => node.props.children === '✓');
    expect(checkMarks.length).toBe(STAGE_LABELS.length);
    expect(mockReset).not.toHaveBeenCalled();

    await act(async () => {
      await wait(300);
    });

    expect(mockReset).toHaveBeenCalledWith({
      index: 1,
      routes: [
        {name: 'HomeMain'},
        {
          name: 'LessonResult',
          params: {
            lesson,
            confirmedText: 'Hello world',
            sourceType: 'paste_text',
          },
        },
      ],
    });
  });

  it('aborts the in-flight controller on unmount and leaves navigation untouched', async () => {
    const {promise} = deferredAnalyzeTextResult();
    mockAnalyzeText.mockReturnValue(promise);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderScreen('PasteText');
    });

    const signal = mockAnalyzeText.mock.calls[0][3] as AbortSignal;
    expect(signal.aborted).toBe(false);

    await act(async () => renderer.unmount());

    expect(signal.aborted).toBe(true);
    expect(mockReset).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('ignores a cancelled result that resolves after unmount', async () => {
    const {promise, resolve} = deferredAnalyzeTextResult();
    mockAnalyzeText.mockReturnValue(promise);

    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = renderScreen('PasteText');
    });

    await act(async () => renderer.unmount());

    resolve({ok: false, cancelled: true});

    await act(async () => {
      await flushPromises();
      await wait(300);
    });

    expect(mockReset).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
