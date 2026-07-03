import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '../../../release';
import {NETWORK_LOST_MESSAGE} from '../../../shared/copy/userMessages';
import {AppThemeProvider} from '../../../theme';
import {AnalyzingScreen} from '../AnalyzingScreen';

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

describe('AnalyzingScreen', () => {
  beforeEach(() => {
    mockAnalyzeText.mockReset();
    mockReset.mockReset();
    mockDispatch.mockReset();
    mockGoBack.mockReset();
  });

  it('runs analyzeText and resets to LessonResult on success', async () => {
    const lesson = {title: 'Lesson', original_text: 'Hello world'};
    mockAnalyzeText.mockResolvedValue({ok: true, lesson});

    await act(async () => {
      renderScreen('PasteText');
    });
    // Let analyzeText resolve, then clear the short completion hold timer.
    await act(async () => {
      await flushPromises();
      await wait(300);
    });

    expect(mockAnalyzeText).toHaveBeenCalledWith('Hello world', {
      sourceType: 'paste_text',
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
});
