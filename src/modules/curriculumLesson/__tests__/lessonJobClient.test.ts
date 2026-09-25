import * as AuthSession from '@shared/auth/authSession';
import {
  createLessonGenerationJob,
  fetchLessonGenerationJob,
  isLessonGenerationTerminal,
  LessonGenerationJobSchema,
} from '../lessonJobClient';

const validSession = {
  status: 'valid' as const,
  session: {
    access_token: 'test-token',
    session_id: '1',
    refresh_token: '2',
    access_expires_at: '2050',
    refresh_expires_at: '2050',
  },
  userId: 'user1',
};

const JOB_ID = '00000000-0000-4000-8000-000000000070';

function jobEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    request_id: 'req-job',
    status: 'success',
    job: {
      id: JOB_ID,
      status: 'skeleton_ready',
      revision: 1,
      pollAfterMs: 1000,
      lessonId: null,
      error: null,
      warnings: [],
      ...overrides,
    },
  };
}

const jsonResponse = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers(),
  json: jest.fn().mockResolvedValue(body),
});

describe('createLessonGenerationJob', () => {
  beforeEach(() => {
    jest
      .spyOn(AuthSession, 'ensureValidSession')
      .mockResolvedValue(validSession);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('posts the job-only create path with idempotency key and text body', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(jobEnvelope()));
    const result = await createLessonGenerationJob(
      {confirmedText: 'Hello world', idempotencyKey: 'key-1'},
      {fetchImpl},
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.job.id).toBe(JOB_ID);
    expect(result.job.lessonId).toBeNull();
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:3000/api/v1/lesson-jobs');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toBe(
      'key-1',
    );
    expect(JSON.parse(init.body as string)).toMatchObject({
      confirmed_text: 'Hello world',
    });
  });

  it('mints an idempotency key when the caller passes none', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(jobEnvelope()));
    const result = await createLessonGenerationJob(
      {confirmedText: 'Hello world'},
      {fetchImpl},
    );
    expect(result.ok).toBe(true);
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toMatch(
      /.+/,
    );
  });

  it('rejects empty text locally without a network call', async () => {
    const fetchImpl = jest.fn();
    await expect(
      createLessonGenerationJob({confirmedText: '   '}, {fetchImpl}),
    ).resolves.toMatchObject({ok: false, kind: 'invalid-input'});
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('maps 409 to non-retryable invalid-input', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      jsonResponse(
        {
          request_id: 'r1',
          status: 'failed',
          error: {code: 'IDEMPOTENCY_CONFLICT', message: 'Reuse.'},
        },
        409,
      ),
    );
    await expect(
      createLessonGenerationJob({confirmedText: 'Hi'}, {fetchImpl}),
    ).resolves.toMatchObject({
      ok: false,
      kind: 'invalid-input',
      errorCode: 'IDEMPOTENCY_CONFLICT',
      retryable: false,
    });
  });
});

describe('fetchLessonGenerationJob', () => {
  beforeEach(() => {
    jest
      .spyOn(AuthSession, 'ensureValidSession')
      .mockResolvedValue(validSession);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('polls the job path and returns the materialized lesson id', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(
        jsonResponse(
          jobEnvelope({status: 'ready', revision: 4, lessonId: JOB_ID}),
        ),
      );
    const result = await fetchLessonGenerationJob(JOB_ID, {fetchImpl});
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.job.status).toBe('ready');
    expect(result.job.lessonId).toBe(JOB_ID);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`http://localhost:3000/api/v1/lesson-jobs/${JOB_ID}`);
    expect(init.method).toBe('GET');
  });

  it('maps a foreign or missing job to not-found', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      jsonResponse(
        {
          request_id: 'r1',
          status: 'failed',
          error: {code: 'LESSON_NOT_FOUND', message: 'Gone.'},
        },
        404,
      ),
    );
    await expect(
      fetchLessonGenerationJob(JOB_ID, {fetchImpl}),
    ).resolves.toMatchObject({ok: false, kind: 'not-found'});
  });

  it('maps an invalid envelope to content-error without content', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(jsonResponse({job: {id: JOB_ID, status: 'ready'}}));
    const result = await fetchLessonGenerationJob(JOB_ID, {fetchImpl});
    expect(result).toMatchObject({ok: false, kind: 'content-error'});
  });
});

describe('isLessonGenerationTerminal', () => {
  it('treats ready, ready_with_warnings, and failed as terminal', () => {
    const base = {
      id: JOB_ID,
      revision: 2,
      pollAfterMs: 1000,
      lessonId: JOB_ID,
      error: null,
      warnings: [],
    };
    expect(
      isLessonGenerationTerminal(
        LessonGenerationJobSchema.parse({...base, status: 'ready'}),
      ),
    ).toBe(true);
    expect(
      isLessonGenerationTerminal(
        LessonGenerationJobSchema.parse({
          ...base,
          status: 'ready_with_warnings',
        }),
      ),
    ).toBe(true);
    expect(
      isLessonGenerationTerminal(
        LessonGenerationJobSchema.parse({
          ...base,
          status: 'failed',
          lessonId: null,
          error: {code: 'X', message: 'Y'},
        }),
      ),
    ).toBe(true);
    expect(
      isLessonGenerationTerminal(
        LessonGenerationJobSchema.parse({...base, status: 'partially_ready'}),
      ),
    ).toBe(false);
  });
});
