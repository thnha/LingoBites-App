import {buildRetryUrl, retrySentenceBlock} from '../sentenceEnrichmentApi';
import {
  makeEnrichment,
  VIDEO_ID,
} from '../../sentence/__tests__/fixtures/sentenceFixtures';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const response = (
  body: unknown,
  options: {ok?: boolean; status?: number} = {},
) => ({
  ok: options.ok ?? true,
  status: options.status ?? 200,
  json: jest.fn().mockResolvedValue(body),
});

beforeEach(() => {
  mockFetch.mockReset();
});

describe('buildRetryUrl', () => {
  it('addresses one segment inside the video-scoped lesson cache', () => {
    expect(buildRetryUrl(VIDEO_ID, 3, 'http://localhost:3000')).toBe(
      'http://localhost:3000/v1/youtube/transcripts/dQw4w9WgXcQ/segments/3/enrichment:retry',
    );
  });
});

describe('retrySentenceBlock', () => {
  it('retries exactly one block and resolves its enrichment', async () => {
    const enrichment = makeEnrichment();
    mockFetch.mockResolvedValueOnce(response(enrichment));

    const result = await retrySentenceBlock(
      {videoId: VIDEO_ID, segmentIndex: 2, block: 'vocab'},
      mockFetch as unknown as typeof fetch,
    );

    expect(result).toEqual({ok: true, enrichment});
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/segments/2/enrichment:retry'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({block: 'vocab'}),
      }),
    );
  });

  it('maps a server error code to its message', async () => {
    mockFetch.mockResolvedValueOnce(
      response(
        {error: {code: 'ENRICHMENT_AI_QUOTA_EXCEEDED', message: 'quota'}},
        {ok: false, status: 429},
      ),
    );

    const result = await retrySentenceBlock(
      {videoId: VIDEO_ID, segmentIndex: 0, block: 'grammar'},
      mockFetch as unknown as typeof fetch,
    );

    expect(result).toEqual({
      ok: false,
      message: 'ENRICHMENT_AI_QUOTA_EXCEEDED',
    });
  });

  it('maps a network failure without throwing', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'));

    const result = await retrySentenceBlock(
      {videoId: VIDEO_ID, segmentIndex: 0, block: 'keyword'},
      mockFetch as unknown as typeof fetch,
    );

    expect(result).toEqual({ok: false, message: 'network down'});
  });

  it('rejects a malformed enrichment payload', async () => {
    mockFetch.mockResolvedValueOnce(response({keyWord: 42}));

    const result = await retrySentenceBlock(
      {videoId: VIDEO_ID, segmentIndex: 0, block: 'vocab'},
      mockFetch as unknown as typeof fetch,
    );

    expect(result).toEqual({ok: false, message: 'RETRY_FAILED'});
  });
});
