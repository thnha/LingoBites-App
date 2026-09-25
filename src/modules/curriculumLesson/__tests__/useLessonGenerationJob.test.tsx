import * as AuthSession from '@shared/auth/authSession';
import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {
  useLessonGenerationJob,
  type LessonGenerationState,
} from '../useLessonGenerationJob';

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
const LESSON_ID = '00000000-0000-4000-8000-000000000071';

function jobEnvelope(status: string, overrides: Record<string, unknown> = {}) {
  return {
    request_id: 'req-1',
    status: 'success',
    job: {
      id: JOB_ID,
      status,
      revision: 2,
      pollAfterMs: 500,
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

function Probe({
  jobId,
  fetchImpl,
  capture,
}: {
  jobId: string;
  fetchImpl?: typeof fetch;
  capture: (state: LessonGenerationState) => void;
}) {
  const state = useLessonGenerationJob({jobId, fetchImpl});
  capture(state);
  return null;
}

describe('useLessonGenerationJob', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(AuthSession, 'ensureValidSession')
      .mockResolvedValue(validSession);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  async function renderProbe(fetchImpl: jest.Mock) {
    let latest!: LessonGenerationState;
    await act(async () => {
      ReactTestRenderer.create(
        <Probe
          jobId={JOB_ID}
          fetchImpl={fetchImpl as unknown as typeof fetch}
          capture={state => (latest = state)}
        />,
      );
    });
    return {latest: () => latest};
  }

  it('polls until the materialized lesson id is stable', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(jobEnvelope('partially_ready')))
      .mockResolvedValueOnce(
        jsonResponse(jobEnvelope('ready', {revision: 4, lessonId: LESSON_ID})),
      );
    const probe = await renderProbe(fetchImpl);
    expect(probe.latest().status).toBe('polling');

    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(probe.latest()).toMatchObject({
      status: 'succeeded',
      lessonId: LESSON_ID,
    });
  });

  it('maps a terminal failure to a retryable failed state', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(
        jsonResponse(
          jobEnvelope('failed', {error: {code: 'X', message: 'Boom.'}}),
        ),
      );
    const probe = await renderProbe(fetchImpl);
    const latest = probe.latest();
    expect(latest.status).toBe('failed');
    if (latest.status !== 'failed') return;
    expect(latest.error.retryable).toBe(true);
    expect(latest.error.message).toBe('Boom.');
  });

  it('treats a foreign job as failed without crashing', async () => {
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
    const probe = await renderProbe(fetchImpl);
    expect(probe.latest().status).toBe('failed');
  });
});
