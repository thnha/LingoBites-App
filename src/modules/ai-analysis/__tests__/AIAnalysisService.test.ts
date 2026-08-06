import {AI_ANALYSIS_FAILED_MESSAGE} from '../../../shared/copy/userMessages';
import {analyzeText} from '../AIAnalysisService';

const mockGetAppConfig = jest.fn();
const mockSimulateAnalysisJob = jest.fn();
const mockRunAnalysisJob = jest.fn();
const mockTrackEvent = jest.fn();

jest.mock('../../../shared/api/appConfig', () => ({
  getAppConfig: () => mockGetAppConfig(),
}));

jest.mock('../MockAIAnalysisService', () => ({
  simulateAnalysisJob: (...args: unknown[]) => mockSimulateAnalysisJob(...args),
}));

jest.mock('../../analytics', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
  getTextLengthBucket: (length: number) =>
    length <= 100 ? '1-100' : '101-500',
}));

jest.mock('../../../shared/api/analysisJobClient', () => ({
  runAnalysisJob: (...args: unknown[]) => mockRunAnalysisJob(...args),
}));

describe('analyzeText', () => {
  beforeEach(() => {
    mockGetAppConfig.mockReset();
    mockSimulateAnalysisJob.mockReset();
    mockRunAnalysisJob.mockReset();
    mockTrackEvent.mockReset();
  });

  it('uses mock path when USE_MOCK_AI is true', async () => {
    mockGetAppConfig.mockReturnValue({useMockAi: true, apiBaseUrl: 'http://localhost:3001'});
    mockSimulateAnalysisJob.mockResolvedValue({ok: true, lesson: {title: 'Mock lesson'}});

    const result = await analyzeText('Sample text.', {fixture: 'minimal'});

    expect(mockSimulateAnalysisJob).toHaveBeenCalledWith(
      'Sample text.',
      {fixture: 'minimal'},
      undefined,
      undefined,
    );
    expect(mockRunAnalysisJob).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
  });

  it('uses API path when USE_MOCK_AI is false', async () => {
    mockGetAppConfig.mockReturnValue({useMockAi: false, apiBaseUrl: 'http://localhost:3001'});
    mockRunAnalysisJob.mockResolvedValue({
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });

    const result = await analyzeText('Sample text.');

    expect(mockRunAnalysisJob).toHaveBeenCalledWith(
      'Sample text.',
      'paste_text',
      undefined,
      undefined,
    );
    expect(mockSimulateAnalysisJob).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });
  });

  it('forwards the progress callback and abort signal to the real client on the API path', async () => {
    mockGetAppConfig.mockReturnValue({useMockAi: false, apiBaseUrl: 'http://localhost:3001'});
    mockRunAnalysisJob.mockResolvedValue({ok: true, lesson: {title: 'Real lesson'}});
    const onProgress = jest.fn();
    const controller = new AbortController();

    await analyzeText(
      ' Sample text. ',
      {sourceType: 'camera'},
      onProgress,
      controller.signal,
    );

    expect(mockRunAnalysisJob).toHaveBeenCalledWith(
      'Sample text.',
      'camera',
      onProgress,
      controller.signal,
    );
  });

  it('forwards the progress callback and abort signal to the mock simulator on the mock path', async () => {
    mockGetAppConfig.mockReturnValue({useMockAi: true, apiBaseUrl: 'http://localhost:3001'});
    mockSimulateAnalysisJob.mockResolvedValue({ok: true, lesson: {title: 'Mock lesson'}});
    const onProgress = jest.fn();
    const controller = new AbortController();

    await analyzeText(
      ' Sample text. ',
      {sourceType: 'camera'},
      onProgress,
      controller.signal,
    );

    expect(mockSimulateAnalysisJob).toHaveBeenCalledWith(
      'Sample text.',
      {sourceType: 'camera'},
      onProgress,
      controller.signal,
    );
  });

  it('returns cancelled result without emitting a completion analytics event', async () => {
    mockGetAppConfig.mockReturnValue({useMockAi: false, apiBaseUrl: 'http://localhost:3001'});
    mockRunAnalysisJob.mockResolvedValue({ok: false, cancelled: true});
    const controller = new AbortController();

    const result = await analyzeText(
      'Sample text.',
      undefined,
      undefined,
      controller.signal,
    );

    expect(result).toEqual({ok: false, cancelled: true});
    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith(
      'ai_analysis_started',
      expect.any(Object),
    );
    expect(mockTrackEvent).not.toHaveBeenCalledWith(
      'ai_analysis_completed',
      expect.anything(),
    );
  });

  it('still emits one ai_analysis_completed event with success payload shape on success', async () => {
    mockGetAppConfig.mockReturnValue({useMockAi: false, apiBaseUrl: 'http://localhost:3001'});
    mockRunAnalysisJob.mockResolvedValue({
      ok: true,
      lesson: {
        sentences: [{id: 1}],
        vocabulary: [{id: 1}, {id: 2}],
        grammar_points: [{id: 1}],
      },
    });

    await analyzeText('Sample text.');

    expect(mockTrackEvent).toHaveBeenCalledTimes(2);
    expect(mockTrackEvent).toHaveBeenNthCalledWith(
      2,
      'ai_analysis_completed',
      expect.objectContaining({
        status: 'success',
        schema_valid: true,
        sentence_count: 1,
        vocabulary_count: 2,
        grammar_count: 1,
      }),
    );
  });

  it('still emits one ai_analysis_completed event with failure payload shape on ordinary failure', async () => {
    mockGetAppConfig.mockReturnValue({useMockAi: false, apiBaseUrl: 'http://localhost:3001'});
    mockRunAnalysisJob.mockResolvedValue({
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });

    await analyzeText('Sample text.');

    expect(mockTrackEvent).toHaveBeenCalledTimes(2);
    expect(mockTrackEvent).toHaveBeenNthCalledWith(
      2,
      'ai_analysis_completed',
      expect.objectContaining({
        status: 'failed',
        error_code: 'AI_INVALID_OUTPUT',
      }),
    );
  });
});
