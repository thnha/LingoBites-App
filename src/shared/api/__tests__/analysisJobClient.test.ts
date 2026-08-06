import {validFullOutput} from '../../fixtures';
import {
  AI_ANALYSIS_FAILED_MESSAGE,
  EMPTY_INPUT_MESSAGE,
  NETWORK_LOST_MESSAGE,
} from '../../copy/userMessages';
import {runAnalysisJob} from '../analysisJobClient';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const progress = (percent: number, status = 'processing') => ({
  percent,
  current_stage: percent < 100 ? 'sentence_analysis' : null,
  message: percent < 100 ? 'Đang phân tích từng câu' : null,
  stages: [
    {name: 'source_analysis', status: 'completed', attempts: 1},
    {name: 'sentence_analysis', status, attempts: 1},
  ],
});

const response = (
  body: unknown,
  options: {ok?: boolean; status?: number; retryAfter?: string | null} = {},
) => ({
  ok: options.ok ?? true,
  status: options.status ?? 200,
  headers: {get: () => options.retryAfter ?? null},
  json: jest.fn().mockResolvedValue(body),
});

const created = (statusUrl = '/v1/ai/analyses/job-1') => ({
  request_id: 'mock-uuid',
  analysis_id: 'job-1',
  status: 'queued',
  created_at: '2026-08-06T00:00:00.000Z',
  status_url: statusUrl,
});

const inProgress = (status: 'queued' | 'processing' | 'paused', percent: number) => ({
  analysis_id: 'job-1',
  request_id: 'mock-uuid',
  status,
  progress: progress(percent),
  partial_data: null,
  created_at: '2026-08-06T00:00:00.000Z',
  updated_at: '2026-08-06T00:00:01.000Z',
  expires_at: '2026-08-07T00:00:00.000Z',
});

const completedBody = (data: unknown, percent = 100) => ({
  ...inProgress('processing', percent),
  status: 'completed',
  model: 'staged-pipeline',
  schema_version: 'ai-output-v1',
  prompt_version: 'lesson-analysis-v1',
  data,
});

const failedBody = (code: string, message = 'server') => ({
  analysis_id: 'job-1',
  status: 'failed',
  progress: progress(100, 'failed'),
  partial_data: null,
  created_at: '2026-08-06T00:00:00.000Z',
  updated_at: '2026-08-06T00:00:01.000Z',
  expires_at: '2026-08-07T00:00:00.000Z',
  error: {code, message},
});

const lessonData = () => ({...validFullOutput, original_text: 'Sample text.'});

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
  mockFetch.mockReset();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('runAnalysisJob - create + happy-path polling', () => {
  it('creates a job, polls its relative status_url, and resolves with the lesson', async () => {
    mockFetch
      .mockResolvedValueOnce(response(created(), {status: 202, retryAfter: '1'}))
      .mockResolvedValueOnce(response(inProgress('queued', 0)))
      .mockResolvedValueOnce(response(inProgress('processing', 40)))
      .mockResolvedValueOnce(response(completedBody(lessonData())));

    const onProgress = jest.fn();
    const pending = runAnalysisJob('Sample text.', 'paste_text', onProgress);
    await jest.advanceTimersByTimeAsync(1_000 + 1_500 + 1_500);
    await expect(pending).resolves.toEqual(expect.objectContaining({ok: true}));

    // Note: global.crypto.randomUUID is present natively in this Node
    // version, so jest.setup.js's `!global.crypto` mock guard never
    // triggers and createRequestId() returns a real random UUID rather
    // than the literal 'mock-uuid' the fixtures use for server-side ids.
    // Assert the header carries *a* fresh id rather than that literal.
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3000/v1/ai/analyses',
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
      'http://localhost:3000/v1/ai/analyses/job-1',
      expect.objectContaining({method: 'GET'}),
    );
    expect(onProgress).toHaveBeenCalledWith({
      percent: 40,
      stage: 'sentence_analysis',
      message: 'Đang phân tích từng câu',
      stages: expect.any(Array),
    });
  });

  it('polls an absolute status_url unchanged', async () => {
    mockFetch
      .mockResolvedValueOnce(
        response(created('https://jobs.example.test/status/job-1'), {status: 202}),
      )
      .mockResolvedValueOnce(response(completedBody(lessonData())));

    const pending = runAnalysisJob('Sample text.');
    await jest.advanceTimersByTimeAsync(1_000);
    await expect(pending).resolves.toEqual(expect.objectContaining({ok: true}));

    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://jobs.example.test/status/job-1',
      expect.objectContaining({method: 'GET'}),
    );
  });

  it.each([
    ['0', 0],
    ['2.5', 2_500],
    [null, 1_000],
    ['-5', 1_000],
    ['NaN', 1_000],
    ['Infinity', 1_000],
    ['200', 10_000], // capped at MAX_RETRY_AFTER_MS, not the full 200_000ms
  ])('waits %s -> %ims before the first poll', async (retryAfter, expectedDelayMs) => {
    mockFetch
      .mockResolvedValueOnce(response(created(), {status: 202, retryAfter}))
      .mockResolvedValueOnce(response(completedBody(lessonData())));

    const pending = runAnalysisJob('Sample text.');

    if (expectedDelayMs > 0) {
      await jest.advanceTimersByTimeAsync(expectedDelayMs - 1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      await jest.advanceTimersByTimeAsync(1);
    } else {
      await jest.advanceTimersByTimeAsync(0);
    }

    expect(mockFetch).toHaveBeenCalledTimes(2);
    await expect(pending).resolves.toEqual(expect.objectContaining({ok: true}));
  });
});

describe('runAnalysisJob - terminal create errors', () => {
  it.each([
    ['VALIDATION_EMPTY_TEXT', EMPTY_INPUT_MESSAGE],
    ['VALIDATION_MISSING_IDEMPOTENCY_KEY', AI_ANALYSIS_FAILED_MESSAGE],
    ['IDEMPOTENCY_CONFLICT', AI_ANALYSIS_FAILED_MESSAGE],
  ])('maps create error %s', async (code, message) => {
    mockFetch.mockResolvedValue(
      response(
        {request_id: 'r', status: 'failed', error: {code, message: 'server'}},
        {ok: false, status: code === 'IDEMPOTENCY_CONFLICT' ? 409 : 400},
      ),
    );

    await expect(runAnalysisJob('Sample text.')).resolves.toEqual({
      ok: false,
      errorCode: code,
      message,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('maps create fetch rejection to NETWORK_ERROR', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'));

    await expect(runAnalysisJob('Sample text.')).resolves.toEqual({
      ok: false,
      errorCode: 'NETWORK_ERROR',
      message: NETWORK_LOST_MESSAGE,
    });
  });

  it('maps create JSON parse rejection to NETWORK_ERROR', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 202,
      headers: {get: () => null},
      json: jest.fn().mockRejectedValue(new Error('bad json')),
    });

    await expect(runAnalysisJob('Sample text.')).resolves.toEqual({
      ok: false,
      errorCode: 'NETWORK_ERROR',
      message: NETWORK_LOST_MESSAGE,
    });
  });
});

describe('runAnalysisJob - terminal poll errors', () => {
  it('maps a poll 404 AI_JOB_NOT_FOUND envelope to a terminal generic message without further polling', async () => {
    mockFetch
      .mockResolvedValueOnce(response(created(), {status: 202}))
      .mockResolvedValueOnce(
        response(
          {request_id: 'r', status: 'failed', error: {code: 'AI_JOB_NOT_FOUND', message: 'gone'}},
          {ok: false, status: 404},
        ),
      );

    const pending = runAnalysisJob('Sample text.');
    await jest.advanceTimersByTimeAsync(1_000);
    await expect(pending).resolves.toEqual({
      ok: false,
      errorCode: 'AI_JOB_NOT_FOUND',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('maps another poll 4xx error envelope to a terminal generic message', async () => {
    mockFetch
      .mockResolvedValueOnce(response(created(), {status: 202}))
      .mockResolvedValueOnce(
        response(
          {request_id: 'r', status: 'failed', error: {code: 'AI_FINAL_VALIDATION_FAILED', message: 'bad'}},
          {ok: false, status: 422},
        ),
      );

    const pending = runAnalysisJob('Sample text.');
    await jest.advanceTimersByTimeAsync(1_000);
    await expect(pending).resolves.toEqual({
      ok: false,
      errorCode: 'AI_FINAL_VALIDATION_FAILED',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('maps a terminal failed job body to its exact error code without issuing another GET', async () => {
    mockFetch
      .mockResolvedValueOnce(response(created(), {status: 202}))
      .mockResolvedValueOnce(response(failedBody('AI_PROVIDER_ERROR')));

    const pending = runAnalysisJob('Sample text.');
    await jest.advanceTimersByTimeAsync(1_000);
    await expect(pending).resolves.toEqual({
      ok: false,
      errorCode: 'AI_PROVIDER_ERROR',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe('runAnalysisJob - transient poll failures recover', () => {
  it.each([
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
          headers: {get: () => null},
          json: jest.fn().mockRejectedValue(new Error('bad json')),
        }),
    ],
    ['HTTP 429', () => mockFetch.mockResolvedValueOnce(response({}, {ok: false, status: 429}))],
    ['HTTP 500', () => mockFetch.mockResolvedValueOnce(response({}, {ok: false, status: 500}))],
  ])('treats a poll %s as transient and recovers on the next interval', async (_label, queueTransientPoll) => {
    mockFetch.mockResolvedValueOnce(response(created(), {status: 202}));
    queueTransientPoll();
    mockFetch.mockResolvedValueOnce(response(completedBody(lessonData())));

    const pending = runAnalysisJob('Sample text.');
    await jest.advanceTimersByTimeAsync(1_000 + 1_500);
    await expect(pending).resolves.toEqual(expect.objectContaining({ok: true}));
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});

describe('runAnalysisJob - malformed successful bodies', () => {
  it.each([
    ['an unrecognized status value', {...inProgress('processing', 50), status: 'cancelled'}],
    [
      'a missing status field',
      (() => {
        const body: Record<string, unknown> = {...inProgress('processing', 50)};
        delete body.status;
        return body;
      })(),
    ],
    [
      'a completed body missing the data field',
      {
        analysis_id: 'job-1',
        request_id: 'mock-uuid',
        status: 'completed',
        model: 'm',
        schema_version: 'ai-output-v1',
        prompt_version: 'p',
        progress: progress(100),
        partial_data: null,
        created_at: '2026-08-06T00:00:00.000Z',
        updated_at: '2026-08-06T00:00:01.000Z',
        expires_at: '2026-08-07T00:00:00.000Z',
      },
    ],
    [
      'a failed body missing the error field',
      {
        analysis_id: 'job-1',
        status: 'failed',
        progress: progress(100),
        partial_data: null,
        created_at: '2026-08-06T00:00:00.000Z',
        updated_at: '2026-08-06T00:00:01.000Z',
        expires_at: '2026-08-07T00:00:00.000Z',
      },
    ],
  ])('returns AI_INVALID_OUTPUT for %s', async (_label, malformedBody) => {
    mockFetch
      .mockResolvedValueOnce(response(created(), {status: 202}))
      .mockResolvedValueOnce(response(malformedBody));

    const pending = runAnalysisJob('Sample text.');
    await jest.advanceTimersByTimeAsync(1_000);
    await expect(pending).resolves.toEqual({
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('returns AI_INVALID_OUTPUT when completed data fails schema validation', async () => {
    mockFetch
      .mockResolvedValueOnce(response(created(), {status: 202}))
      .mockResolvedValueOnce(
        response(completedBody({title: 'missing required fields'})),
      );

    const pending = runAnalysisJob('Sample text.');
    await jest.advanceTimersByTimeAsync(1_000);
    await expect(pending).resolves.toEqual({
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });
  });
});

describe('runAnalysisJob - poll deadline', () => {
  it('gives up after the 75s poll deadline without issuing a fetch after it', async () => {
    mockFetch.mockResolvedValueOnce(response(created(), {status: 202, retryAfter: '0'}));
    mockFetch.mockResolvedValue(response({}, {ok: false, status: 500}));

    const pending = runAnalysisJob('Sample text.');
    await jest.advanceTimersByTimeAsync(75_000);
    await expect(pending).resolves.toEqual({
      ok: false,
      errorCode: 'AI_POLL_GIVE_UP',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });

    const callsAtDeadline = mockFetch.mock.calls.length;
    await jest.advanceTimersByTimeAsync(10_000);
    expect(mockFetch).toHaveBeenCalledTimes(callsAtDeadline);
  });
});

describe('runAnalysisJob - per-request timeout', () => {
  it('abandons a poll GET that never resolves once the per-request timeout fires, retries at the next interval, and completes normally', async () => {
    mockFetch
      .mockResolvedValueOnce(response(created(), {status: 202, retryAfter: '0'}))
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
      .mockResolvedValueOnce(response(completedBody(lessonData())));

    const pending = runAnalysisJob('Sample text.');
    await jest.advanceTimersByTimeAsync(0);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Still within the 10s per-request timeout: the hung poll is not
    // abandoned yet, so no retry has been issued.
    await jest.advanceTimersByTimeAsync(10_000 - 1);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Crossing the per-request timeout aborts the hung fetch, which is
    // treated as a transient failure — the retry waits a full poll
    // interval rather than firing immediately.
    await jest.advanceTimersByTimeAsync(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    await jest.advanceTimersByTimeAsync(1_500 - 1);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(1);
    expect(mockFetch).toHaveBeenCalledTimes(3);

    await expect(pending).resolves.toEqual(expect.objectContaining({ok: true}));
  });
});

describe('runAnalysisJob - cancellation', () => {
  it('returns cancelled immediately when the signal is already aborted before create', async () => {
    const controller = new AbortController();
    controller.abort();

    const result = await runAnalysisJob(
      'Sample text.',
      'paste_text',
      undefined,
      controller.signal,
    );

    expect(result).toEqual({ok: false, cancelled: true});
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns cancelled when the signal aborts while the create request is in flight', async () => {
    const controller = new AbortController();
    let resolveCreate: (value: unknown) => void = () => {};
    mockFetch.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveCreate = resolve;
        }),
    );

    const pending = runAnalysisJob(
      'Sample text.',
      'paste_text',
      undefined,
      controller.signal,
    );
    await jest.advanceTimersByTimeAsync(0);
    controller.abort();
    resolveCreate(response(created(), {status: 202}));

    await expect(pending).resolves.toEqual({ok: false, cancelled: true});
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns cancelled when the signal aborts during the initial Retry-After wait', async () => {
    const controller = new AbortController();
    mockFetch.mockResolvedValueOnce(response(created(), {status: 202, retryAfter: '5'}));

    const pending = runAnalysisJob(
      'Sample text.',
      'paste_text',
      undefined,
      controller.signal,
    );
    await jest.advanceTimersByTimeAsync(2_000);
    controller.abort();
    await jest.advanceTimersByTimeAsync(0);

    await expect(pending).resolves.toEqual({ok: false, cancelled: true});
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(10_000);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns cancelled when the signal aborts during a later poll interval', async () => {
    const controller = new AbortController();
    const onProgress = jest.fn();
    mockFetch
      .mockResolvedValueOnce(response(created(), {status: 202, retryAfter: '0'}))
      .mockResolvedValueOnce(response(inProgress('processing', 40)));

    const pending = runAnalysisJob(
      'Sample text.',
      'paste_text',
      onProgress,
      controller.signal,
    );
    await jest.advanceTimersByTimeAsync(0);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenCalledTimes(1);

    controller.abort();
    await jest.advanceTimersByTimeAsync(0);

    await expect(pending).resolves.toEqual({ok: false, cancelled: true});

    await jest.advanceTimersByTimeAsync(10_000);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenCalledTimes(1);
  });
});

describe('runAnalysisJob - progress snapshot immutability', () => {
  it('never hands out or mutates a previously delivered progress snapshot', async () => {
    mockFetch
      .mockResolvedValueOnce(response(created(), {status: 202, retryAfter: '1'}))
      .mockResolvedValueOnce(response(inProgress('paused', 0)))
      .mockResolvedValueOnce(response(inProgress('processing', 40)))
      .mockResolvedValueOnce(response(completedBody(lessonData())));

    const onProgress = jest.fn();
    const pending = runAnalysisJob('Sample text.', 'paste_text', onProgress);
    await jest.advanceTimersByTimeAsync(1_000 + 1_500 + 1_500);
    await pending;

    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress.mock.calls[0][0]).not.toBe(onProgress.mock.calls[1][0]);
    expect(onProgress.mock.calls[0][0].stages).not.toBe(
      onProgress.mock.calls[1][0].stages,
    );
    expect(onProgress.mock.calls[0][0].stages[0]).not.toBe(
      onProgress.mock.calls[1][0].stages[0],
    );
  });
});
