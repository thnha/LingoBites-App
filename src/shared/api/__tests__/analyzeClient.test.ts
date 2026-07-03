import {validFullOutput} from '../../fixtures';
import {AI_ANALYSIS_FAILED_MESSAGE, NETWORK_LOST_MESSAGE} from '../../copy/userMessages';
import {analyzeTextWithApi} from '../analyzeClient';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('analyzeTextWithApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns validated lesson on success envelope', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        request_id: '00000000-0000-0000-0000-000000000001',
        status: 'success',
        model: 'mock',
        schema_version: 'ai-output-v1',
        prompt_version: 'lesson-analysis-v1',
        data: {
          ...validFullOutput,
          original_text: 'Sample confirmed text.',
        },
      }),
    });

    const result = await analyzeTextWithApi('Sample confirmed text.');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lesson.original_text).toBe('Sample confirmed text.');
    }

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/v1/ai/analyze',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('returns friendly error for AI_INVALID_OUTPUT', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        request_id: '00000000-0000-0000-0000-000000000002',
        status: 'failed',
        error: {
          code: 'AI_INVALID_OUTPUT',
          message: 'AI response did not match the required schema.',
        },
        retryable: true,
      }),
    });

    const result = await analyzeTextWithApi('Sample text.');

    expect(result).toEqual({
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });
  });

  it('returns network message when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('Network request failed'));

    const result = await analyzeTextWithApi('Sample text.');

    expect(result).toEqual({
      ok: false,
      errorCode: 'NETWORK_ERROR',
      message: NETWORK_LOST_MESSAGE,
    });
  });

  it('rejects success body that fails validateAIOutput', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        request_id: '00000000-0000-0000-0000-000000000003',
        status: 'success',
        model: 'mock',
        schema_version: 'ai-output-v1',
        prompt_version: 'lesson-analysis-v1',
        data: {title: 'missing required fields'},
      }),
    });

    const result = await analyzeTextWithApi('Sample text.');

    expect(result).toEqual({
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });
  });
});
