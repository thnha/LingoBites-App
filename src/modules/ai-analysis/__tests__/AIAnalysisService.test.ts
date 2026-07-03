import {AI_ANALYSIS_FAILED_MESSAGE} from '../../../shared/copy/userMessages';
import {analyzeText} from '../AIAnalysisService';

const mockGetAppConfig = jest.fn();
const mockAnalyzeTextWithMock = jest.fn();
const mockAnalyzeTextWithApi = jest.fn();

jest.mock('../../../shared/api/appConfig', () => ({
  getAppConfig: () => mockGetAppConfig(),
}));

jest.mock('../MockAIAnalysisService', () => ({
  analyzeTextWithMock: (...args: unknown[]) => mockAnalyzeTextWithMock(...args),
}));

jest.mock('../../analytics', () => ({
  trackEvent: jest.fn(),
  getTextLengthBucket: (length: number) =>
    length <= 100 ? '1-100' : '101-500',
}));

jest.mock('../../../shared/api/analyzeClient', () => ({
  analyzeTextWithApi: (...args: unknown[]) => mockAnalyzeTextWithApi(...args),
}));

describe('analyzeText', () => {
  beforeEach(() => {
    mockGetAppConfig.mockReset();
    mockAnalyzeTextWithMock.mockReset();
    mockAnalyzeTextWithApi.mockReset();
  });

  it('uses mock path when USE_MOCK_AI is true', async () => {
    mockGetAppConfig.mockReturnValue({useMockAi: true, apiBaseUrl: 'http://localhost:3001'});
    mockAnalyzeTextWithMock.mockResolvedValue({ok: true, lesson: {title: 'Mock lesson'}});

    const result = await analyzeText('Sample text.', {fixture: 'minimal'});

    expect(mockAnalyzeTextWithMock).toHaveBeenCalledWith('Sample text.', {
      fixture: 'minimal',
    });
    expect(mockAnalyzeTextWithApi).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
  });

  it('uses API path when USE_MOCK_AI is false', async () => {
    mockGetAppConfig.mockReturnValue({useMockAi: false, apiBaseUrl: 'http://localhost:3001'});
    mockAnalyzeTextWithApi.mockResolvedValue({
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });

    const result = await analyzeText('Sample text.');

    expect(mockAnalyzeTextWithApi).toHaveBeenCalledWith(
      'Sample text.',
      'paste_text',
    );
    expect(mockAnalyzeTextWithMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });
  });
});
