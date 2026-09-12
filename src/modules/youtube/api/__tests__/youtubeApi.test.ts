import i18n from '@/i18n';
import {parseYouTubeVideoId, runYouTubeJob} from '../youtubeApi';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const VIDEO_ID = 'dQw4w9WgXcQ';

describe('parseYouTubeVideoId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', VIDEO_ID],
    ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', VIDEO_ID],
    ['https://youtu.be/dQw4w9WgXcQ', VIDEO_ID],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', VIDEO_ID],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', VIDEO_ID],
    ['https://music.youtube.com/watch?v=dQw4w9WgXcQ', VIDEO_ID],
    ['https://www.music.youtube.com/watch?v=dQw4w9WgXcQ', VIDEO_ID],
    ['https://www.youtube-nocookie.com/watch?v=dQw4w9WgXcQ', VIDEO_ID],
    ['https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', VIDEO_ID],
  ])('parses %s', (url, expected) => {
    expect(parseYouTubeVideoId(url)).toBe(expected);
  });

  it('rejects invalid ids and hosts', () => {
    expect(parseYouTubeVideoId('https://example.com/watch?v=dQw4w9WgXcQ')).toBe(
      null,
    );
    expect(parseYouTubeVideoId('not-a-url')).toBe(null);
    expect(
      parseYouTubeVideoId('https://www.youtube.com/watch?v=tooshort'),
    ).toBe(null);
  });
});

const URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

const created = () => ({
  request_id: 'req-1',
  job_id: 'job-1',
  status: 'processing',
  progress: {percent: 0, stage: null},
});

const inProgress = (percent: number) => ({
  request_id: 'req-1',
  status: 'processing',
  progress: {percent, stage: 'transcript_acquire'},
});

const lessonData = () => ({
  schema_version: 'youtube-transcript-v1',
  video: {
    id: VIDEO_ID,
    title: 'Sample video',
    channel_title: 'Sample channel',
    duration_seconds: 120,
    language: 'en',
    embeddable: true,
  },
  transcript_source: 'auto_caption',
  segments: [
    {
      id: 'seg-0',
      index: 0,
      start_ms: 0,
      end_ms: 1000,
      en: 'Hello world',
      vi: 'Xin chào thế giới',
      ipa: 'həˈloʊ wɜːrld',
    },
  ],
  warnings: [],
});

const completedBody = () => ({
  request_id: 'req-1',
  status: 'completed',
  progress: {percent: 100, stage: null},
  data: lessonData(),
});

const failedBody = (code: string) => ({
  request_id: 'req-1',
  status: 'failed',
  progress: {percent: 100, stage: null},
  error: {code, message: 'server'},
});

const response = (
  body: unknown,
  options: {ok?: boolean; status?: number} = {},
) => ({
  ok: options.ok ?? true,
  status: options.status ?? 200,
  json: jest.fn().mockResolvedValue(body),
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
  mockFetch.mockReset();
});

afterEach(() => {
  jest.useRealTimers();
});

// A fetch issued from a timer callback can land one scheduler step after the
// exact timer boundary under fake timers, so tests step forward in small
// increments until the expected fetch count is reached instead of advancing
// an exact total in a single call.
async function advanceUntilCalls(count: number, maxSteps = 40): Promise<void> {
  for (
    let step = 0;
    step < maxSteps && mockFetch.mock.calls.length < count;
    step++
  ) {
    await jest.advanceTimersByTimeAsync(500);
  }
}

describe('runYouTubeJob - create + happy-path polling', () => {
  it('creates a job, polls it, and resolves with the lesson', async () => {
    mockFetch
      .mockResolvedValueOnce(response(created()))
      .mockResolvedValueOnce(response(inProgress(40)))
      .mockResolvedValueOnce(response(completedBody()));

    const onProgress = jest.fn();
    const pending = runYouTubeJob(URL, undefined, onProgress);
    await advanceUntilCalls(3);
    await expect(pending).resolves.toEqual(expect.objectContaining({ok: true}));

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3000/v1/youtube/transcripts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Idempotency-Key': expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
          ),
        }),
      }),
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3000/v1/youtube/transcripts/job-1',
      expect.objectContaining({headers: {Accept: 'application/json'}}),
    );
    expect(onProgress).toHaveBeenCalledWith({
      percent: 40,
      stage: 'transcript_acquire',
    });
  });

  it('maps a create rejection to NETWORK_ERROR without polling', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'));

    await expect(runYouTubeJob(URL)).resolves.toEqual({
      ok: false,
      errorCode: 'NETWORK_ERROR',
      message: i18n.t('errors.network_lost'),
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('maps a terminal create error to its exact code', async () => {
    mockFetch.mockResolvedValueOnce(
      response(
        {
          request_id: 'req-1',
          status: 'failed',
          error: {code: 'YOUTUBE_NOT_EMBEDDABLE', message: 'blocked'},
        },
        {ok: false, status: 422},
      ),
    );

    const result = await runYouTubeJob(URL);
    expect(result).toEqual({
      ok: false,
      errorCode: 'YOUTUBE_NOT_EMBEDDABLE',
      message: expect.any(String),
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('runYouTubeJob - transient poll failures recover', () => {
  it.each([
    [
      'HTTP 429',
      () =>
        mockFetch.mockResolvedValueOnce(response({}, {ok: false, status: 429})),
    ],
    [
      'HTTP 500',
      () =>
        mockFetch.mockResolvedValueOnce(response({}, {ok: false, status: 500})),
    ],
    [
      'fetch rejection',
      () => mockFetch.mockRejectedValueOnce(new Error('network blip')),
    ],
    [
      'JSON parse rejection',
      () =>
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockRejectedValue(new Error('bad json')),
        }),
    ],
  ])(
    'treats a poll %s as transient and recovers on the next interval',
    async (_label, queueTransientPoll) => {
      mockFetch.mockResolvedValueOnce(response(created()));
      queueTransientPoll();
      mockFetch.mockResolvedValueOnce(response(completedBody()));

      const pending = runYouTubeJob(URL);
      await advanceUntilCalls(3);
      await expect(pending).resolves.toEqual(
        expect.objectContaining({ok: true}),
      );
      expect(mockFetch).toHaveBeenCalledTimes(3);
    },
  );
});

describe('runYouTubeJob - terminal poll errors', () => {
  it('preserves TRANSCRIPT_UNAVAILABLE so the manual-transcript fallback can trigger', async () => {
    mockFetch
      .mockResolvedValueOnce(response(created()))
      .mockResolvedValueOnce(response(failedBody('TRANSCRIPT_UNAVAILABLE')));

    const pending = runYouTubeJob(URL);
    await advanceUntilCalls(2);
    await expect(pending).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        errorCode: 'TRANSCRIPT_UNAVAILABLE',
      }),
    );
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('maps a terminal RATE_LIMIT_EXCEEDED job failure to its exact code', async () => {
    mockFetch
      .mockResolvedValueOnce(response(created()))
      .mockResolvedValueOnce(response(failedBody('RATE_LIMIT_EXCEEDED')));

    const pending = runYouTubeJob(URL);
    await advanceUntilCalls(2);
    await expect(pending).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        errorCode: 'RATE_LIMIT_EXCEEDED',
      }),
    );
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe('runYouTubeJob - poll deadline', () => {
  it('gives up after the 75s poll deadline without issuing a fetch after it', async () => {
    mockFetch.mockResolvedValueOnce(response(created()));
    mockFetch.mockResolvedValue(response({}, {ok: false, status: 500}));

    const pending = runYouTubeJob(URL);
    await jest.advanceTimersByTimeAsync(75_000);
    await expect(pending).resolves.toEqual({
      ok: false,
      errorCode: 'NETWORK_ERROR',
      message: i18n.t('errors.youtube_timeout'),
    });

    const callsAtDeadline = mockFetch.mock.calls.length;
    await jest.advanceTimersByTimeAsync(10_000);
    expect(mockFetch).toHaveBeenCalledTimes(callsAtDeadline);
  });
});

describe('runYouTubeJob - per-request timeout', () => {
  it('abandons a poll GET that never resolves once the per-request timeout fires, retries at the next interval, and completes normally', async () => {
    mockFetch
      .mockResolvedValueOnce(response(created()))
      .mockImplementationOnce(
        (_url: string, options: {signal: AbortSignal}) =>
          new Promise((_resolve, reject) => {
            options.signal.addEventListener('abort', () => {
              const err = new Error('The operation was aborted.');
              err.name = 'AbortError';
              reject(err);
            });
          }),
      )
      .mockResolvedValueOnce(response(completedBody()));

    const pending = runYouTubeJob(URL);
    await advanceUntilCalls(2);

    // Still within the 10s per-request timeout: the hung poll is not
    // abandoned yet, so no retry has been issued. The watchdog fires 10s
    // after the hung poll started, so 8s of extra headroom stays safely
    // inside it regardless of scheduler-step lag.
    await jest.advanceTimersByTimeAsync(8_000);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Past the per-request timeout the hung fetch is aborted, which is
    // treated as a transient failure — the retry follows after the next
    // 1s poll interval.
    await advanceUntilCalls(3);
    expect(mockFetch).toHaveBeenCalledTimes(3);

    await expect(pending).resolves.toEqual(expect.objectContaining({ok: true}));
  });
});

describe('runYouTubeJob - cancellation', () => {
  it('returns cancelled immediately when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    const result = await runYouTubeJob(
      URL,
      undefined,
      undefined,
      controller.signal,
    );

    expect(result).toEqual({ok: false, cancelled: true});
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
