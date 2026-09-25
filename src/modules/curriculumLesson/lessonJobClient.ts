/**
 * Unified generation job client: job-only `POST/GET /api/v1/lesson-jobs`.
 *
 * Mirrors the Server `LessonJobStatusDtoSchema` /
 * `LessonJobStatusEnvelopeSchema` from LingoBites-Server
 * `src/modules/lessons/model/lessonJobStatus.ts` (TASK-004). Job-only:
 * no lesson content is ever returned from these endpoints — `lessonId`
 * is null while generation is active and equals the canonical lesson ID
 * after materialization. Follows the `curriculumLessonClient`
 * conventions (`authenticatedFetch`, `getAppConfig`, injected
 * `fetchImpl`, `AbortSignal`).
 */
import {authenticatedFetch} from '@shared/api/authenticatedFetch';
import {getAppConfig} from '@shared/api/appConfig';
import {createRequestId} from '@shared/api/requestId';
import {z} from 'zod';

const LESSON_JOBS_PATH = '/api/v1/lesson-jobs';

export const LessonGenerationJobStatusValues = [
  'skeleton_ready',
  'partially_ready',
  'ready',
  'ready_with_warnings',
  'failed',
] as const;

export const LessonGenerationWarningSchema = z.object({
  code: z.string(),
  unit: z.string().nullable(),
  message_vi: z.string(),
});

export const LessonGenerationErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const LessonGenerationJobSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(LessonGenerationJobStatusValues),
  revision: z.number().int(),
  pollAfterMs: z.number().int(),
  lessonId: z.string().uuid().nullable(),
  error: LessonGenerationErrorSchema.nullable(),
  warnings: z.array(LessonGenerationWarningSchema),
});

export const LessonGenerationJobEnvelopeSchema = z.object({
  request_id: z.string(),
  status: z.literal('success'),
  job: LessonGenerationJobSchema,
});

export type LessonGenerationJob = z.infer<typeof LessonGenerationJobSchema>;
export type LessonGenerationJobStatus =
  (typeof LessonGenerationJobStatusValues)[number];

export function isLessonGenerationTerminal(job: LessonGenerationJob): boolean {
  return (
    job.status === 'ready' ||
    job.status === 'ready_with_warnings' ||
    job.status === 'failed'
  );
}

export type LessonJobErrorKind =
  | 'not-found'
  | 'invalid-input'
  | 'auth-error'
  | 'network-error'
  | 'server-error'
  | 'content-error';

export type LessonJobError = {
  ok: false;
  kind: LessonJobErrorKind;
  errorCode: string;
  message: string;
  retryable: boolean;
  cancelled?: boolean;
  status?: number;
};

export type LessonJobResult =
  | {ok: true; requestId: string; job: LessonGenerationJob}
  | LessonJobError;

export type LessonJobClientOptions = {
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
};

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function cancelledError(): LessonJobError {
  return {
    ok: false,
    kind: 'network-error',
    errorCode: 'CANCELLED',
    message: 'Request cancelled.',
    retryable: false,
    cancelled: true,
  };
}

function networkError(): LessonJobError {
  return {
    ok: false,
    kind: 'network-error',
    errorCode: 'NETWORK_ERROR',
    message: 'Network connection lost.',
    retryable: true,
  };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function errorDetails(body: unknown): {code: string; message: string} | null {
  if (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as {error?: unknown}).error === 'object' &&
    (body as {error?: unknown}).error !== null
  ) {
    const error = (body as {error: {code?: unknown; message?: unknown}}).error;
    if (typeof error.code === 'string' && typeof error.message === 'string') {
      return {code: error.code, message: error.message};
    }
  }
  return null;
}

function errorFromResponse(
  status: number,
  body: unknown,
  notFoundCode: string,
): LessonJobError {
  const details = errorDetails(body);
  const code = details?.code ?? `HTTP_${status}`;
  const message = details?.message ?? 'Request failed.';
  const base = {errorCode: code, message, status} as const;
  if (status === 401 || status === 403) {
    return {ok: false, kind: 'auth-error', ...base, retryable: false};
  }
  if (status === 404 || code === notFoundCode) {
    return {ok: false, kind: 'not-found', ...base, retryable: false};
  }
  if (status === 400 || status === 409 || status === 422) {
    return {ok: false, kind: 'invalid-input', ...base, retryable: false};
  }
  if (status >= 500 || status === 429) {
    return {ok: false, kind: 'server-error', ...base, retryable: true};
  }
  return {ok: false, kind: 'server-error', ...base, retryable: false};
}

function parseJobEnvelope(
  status: number,
  body: unknown,
  notFoundCode: string,
): LessonJobResult {
  if (status < 200 || status >= 300) {
    return errorFromResponse(status, body, notFoundCode);
  }
  const parsed = LessonGenerationJobEnvelopeSchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      kind: 'content-error',
      errorCode: 'INVALID_RESPONSE',
      message: 'Server returned an invalid job.',
      retryable: false,
      status,
    };
  }
  return {
    ok: true,
    requestId: parsed.data.request_id,
    job: parsed.data.job,
  };
}

export type CreateLessonGenerationJobInput = {
  confirmedText: string;
  level?: string;
  idempotencyKey?: string;
};

/**
 * Create one AI lesson generation job. Each call mints a fresh
 * idempotency key unless the caller passes one, so a user-initiated
 * retry after a failure creates a new job instead of replaying the
 * failed one. The response carries job status only — never content.
 */
export async function createLessonGenerationJob(
  input: CreateLessonGenerationJobInput,
  options: LessonJobClientOptions = {},
): Promise<LessonJobResult> {
  if (options.signal?.aborted) return cancelledError();
  const confirmedText = input.confirmedText?.trim() ?? '';
  if (!confirmedText) {
    return {
      ok: false,
      kind: 'invalid-input',
      errorCode: 'VALIDATION_EMPTY_TEXT',
      message: 'Lesson text must not be empty.',
      retryable: false,
    };
  }
  const {apiBaseUrl} = getAppConfig();
  let response: Response;
  try {
    response = await authenticatedFetch(
      `${apiBaseUrl}${LESSON_JOBS_PATH}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Idempotency-Key': input.idempotencyKey ?? createRequestId(),
        },
        body: JSON.stringify({
          request_id: createRequestId(),
          confirmed_text: confirmedText,
          ...(input.level ? {level: input.level} : {}),
        }),
        signal: options.signal,
      },
      options.fetchImpl,
    );
  } catch (error) {
    return isAbortError(error) || options.signal?.aborted
      ? cancelledError()
      : networkError();
  }
  return parseJobEnvelope(
    response.status,
    await readJson(response),
    'LESSON_NOT_FOUND',
  );
}

/**
 * Poll one generation job by ID. Returns the current job snapshot; the
 * caller decides pacing via `job.pollAfterMs`. A foreign or missing job
 * answers 404 (`not-found`) — never a distinguishable error.
 */
export async function fetchLessonGenerationJob(
  jobId: string,
  options: LessonJobClientOptions = {},
): Promise<LessonJobResult> {
  if (options.signal?.aborted) return cancelledError();
  const {apiBaseUrl} = getAppConfig();
  let response: Response;
  try {
    response = await authenticatedFetch(
      `${apiBaseUrl}${LESSON_JOBS_PATH}/${encodeURIComponent(jobId)}`,
      {
        method: 'GET',
        headers: {Accept: 'application/json'},
        signal: options.signal,
      },
      options.fetchImpl,
    );
  } catch (error) {
    return isAbortError(error) || options.signal?.aborted
      ? cancelledError()
      : networkError();
  }
  return parseJobEnvelope(
    response.status,
    await readJson(response),
    'LESSON_NOT_FOUND',
  );
}
