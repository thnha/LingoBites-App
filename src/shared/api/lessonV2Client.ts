import {AppState, Platform} from 'react-native';
import {createRequestId} from './requestId';
import {getAppConfig} from './appConfig';
import {
  LESSON_V2_TIME_CONSTANTS,
  LessonV2CreateEnvelopeSchema,
  LessonV2Schema,
  type LessonV2,
} from '../schemas/lesson-v2';
import {
  upsertLessonV2,
  deleteLessonV2 as deleteLocalLessonV2,
} from '../db/LessonV2Repository';
import {
  deleteLessonToken,
  getLessonToken,
  saveLessonToken,
} from '../security/lessonTokenStore';

const CREATE_PATH = '/v2/lessons';
const DEFAULT_LEVEL = 'Beginner';
const DEFAULT_PROMPT_VERSION = 'lesson-v2';
const FETCH_TIMEOUT_MS =
  LESSON_V2_TIME_CONSTANTS.MOBILE_POST_TIMEOUT_SEC * 1_000;
const POLL_DEADLINE_MS =
  LESSON_V2_TIME_CONSTANTS.MOBILE_ENRICH_DEADLINE_SEC * 1_000;

export type LessonV2CreateInput = {
  confirmedText: string;
  level?: string;
  promptVersion?: string;
  sourceType?: 'paste_text' | 'camera' | 'gallery';
  idempotencyKey?: string;
  anonymousUserId?: string;
};

export type LessonV2ClientErrorCode =
  | 'NETWORK_ERROR'
  | 'MISSING_TOKEN'
  | 'KEYCHAIN_ERROR'
  | 'INVALID_RESPONSE'
  | 'POLLING_STOPPED'
  | 'LESSON_NOT_FOUND'
  | 'RETRY_NOT_ALLOWED'
  | string;

export type LessonV2ClientError = {
  ok: false;
  status?: 'polling_stopped';
  errorCode: LessonV2ClientErrorCode;
  message: string;
  lesson?: LessonV2 | null;
  retryable?: boolean;
};

export type LessonV2ClientSuccess = {
  ok: true;
  lesson: LessonV2;
  completed: boolean;
};

export type LessonV2ClientResult = LessonV2ClientSuccess | LessonV2ClientError;

type FetchImpl = typeof fetch;
type ClientOptions = {
  fetchImpl?: FetchImpl;
  signal?: AbortSignal;
  now?: () => number;
};

type ProgressListener = (lesson: LessonV2) => void;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function waitFor(ms: number, signal?: AbortSignal): Promise<boolean> {
  if (signal?.aborted) return Promise.resolve(false);
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve(true);
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      resolve(false);
    };
    signal?.addEventListener('abort', onAbort, {once: true});
  });
}

function withTimeout(timeoutMs: number, externalSignal?: AbortSignal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(0, timeoutMs));
  const onAbort = () => controller.abort();
  externalSignal?.addEventListener('abort', onAbort, {once: true});
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      externalSignal?.removeEventListener('abort', onAbort);
    },
  };
}

function resolveUrl(baseUrl: string, path: string): string {
  return /^https?:\/\//i.test(path)
    ? path
    : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

function parsePollDelay(headers: Headers, lesson?: LessonV2): number {
  const header = Number(headers.get('x-poll-after-ms'));
  if (Number.isFinite(header) && header >= 0) return header;
  if (lesson?.status === 'skeleton_ready')
    return LESSON_V2_TIME_CONSTANTS.MOBILE_POLL_INTERVAL_BASE_MS;
  if (lesson?.status === 'partially_ready')
    return LESSON_V2_TIME_CONSTANTS.MOBILE_POLL_INTERVAL_STAGE2_MS;
  return LESSON_V2_TIME_CONSTANTS.MOBILE_POLL_INTERVAL_STAGE3_MS;
}

function errorFromBody(response: Response, body: unknown): LessonV2ClientError {
  const error = isObject(body) && isObject(body.error) ? body.error : undefined;
  const code =
    typeof error?.code === 'string'
      ? error.code
      : response.status === 404
      ? 'LESSON_NOT_FOUND'
      : 'INVALID_RESPONSE';
  return {
    ok: false,
    errorCode: code,
    message:
      typeof error?.message === 'string'
        ? error.message
        : 'Unable to load lesson.',
    retryable: response.status >= 500 || response.status === 429,
  };
}

function networkError(): LessonV2ClientError {
  return {
    ok: false,
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

async function request(
  fetchImpl: FetchImpl,
  url: string,
  init: RequestInit,
  signal: AbortSignal | undefined,
  timeoutMs: number,
): Promise<{response?: Response; error?: LessonV2ClientError}> {
  const timeout = withTimeout(timeoutMs, signal);
  try {
    return {response: await fetchImpl(url, {...init, signal: timeout.signal})};
  } catch {
    return {
      error: signal?.aborted
        ? {ok: false, errorCode: 'CANCELLED', message: 'Request cancelled.'}
        : networkError(),
    };
  } finally {
    timeout.cleanup();
  }
}

async function tokenFor(
  lessonId: string,
): Promise<{token?: string; error?: LessonV2ClientError}> {
  const result = await getLessonToken(lessonId);
  if (!result.ok)
    return {
      error: {
        ok: false,
        errorCode: result.errorCode,
        message: 'Secure token storage is unavailable.',
      },
    };
  return result.token
    ? {token: result.token}
    : {
        error: {
          ok: false,
          errorCode: 'MISSING_TOKEN',
          message: 'This lesson is not available for resume.',
          retryable: false,
        },
      };
}

async function persistLesson(
  lesson: LessonV2,
): Promise<LessonV2ClientError | null> {
  const result = upsertLessonV2(lesson);
  return result.ok
    ? null
    : {
        ok: false,
        errorCode: result.errorCode,
        message: 'Unable to save lesson progress.',
        retryable: true,
      };
}

export async function createLessonV2(
  input: LessonV2CreateInput,
  options: ClientOptions & {onLesson?: ProgressListener} = {},
): Promise<LessonV2ClientResult> {
  const {apiBaseUrl} = getAppConfig();
  const requestId = createRequestId();
  const idempotencyKey = input.idempotencyKey ?? createRequestId();
  const platform =
    Platform.OS === 'ios' || Platform.OS === 'android'
      ? Platform.OS
      : undefined;
  const requestResult = await request(
    options.fetchImpl ?? fetch,
    `${apiBaseUrl}${CREATE_PATH}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        request_id: requestId,
        confirmed_text: input.confirmedText,
        level: input.level ?? DEFAULT_LEVEL,
        native_language: 'Vietnamese',
        source_type: input.sourceType ?? 'paste_text',
        prompt_version: input.promptVersion ?? DEFAULT_PROMPT_VERSION,
        client_context: {platform, anonymous_user_id: input.anonymousUserId},
      }),
    },
    options.signal,
    FETCH_TIMEOUT_MS,
  );
  if (requestResult.error) return requestResult.error;
  const response = requestResult.response!;
  const body = await readJson(response);
  if (!response.ok) return errorFromBody(response, body);
  const parsed = LessonV2CreateEnvelopeSchema.safeParse(body);
  if (!parsed.success)
    return {
      ok: false,
      errorCode: 'INVALID_RESPONSE',
      message: 'Server returned an invalid lesson.',
    };

  const tokenResult = await saveLessonToken(
    parsed.data.lesson.lesson_id,
    parsed.data.access_token,
  );
  if (!tokenResult.ok)
    return {
      ok: false,
      errorCode: tokenResult.errorCode,
      message: 'Secure token storage is unavailable.',
    };
  const persistError = await persistLesson(parsed.data.lesson);
  if (persistError) return persistError;
  options.onLesson?.(parsed.data.lesson);
  if (
    parsed.data.lesson.status === 'ready' ||
    parsed.data.lesson.status === 'ready_with_warnings' ||
    parsed.data.lesson.status === 'failed'
  ) {
    return {ok: true, lesson: parsed.data.lesson, completed: true};
  }
  return pollLessonV2(parsed.data.lesson.lesson_id, {
    ...options,
    initialLesson: parsed.data.lesson,
    initialPollDelayMs: parsePollDelay(response.headers, parsed.data.lesson),
  });
}

type PollOptions = ClientOptions & {
  onLesson?: ProgressListener;
  initialLesson?: LessonV2;
  initialPollDelayMs?: number;
};

export async function pollLessonV2(
  lessonId: string,
  options: PollOptions = {},
): Promise<LessonV2ClientResult> {
  const token = await tokenFor(lessonId);
  if (token.error) return token.error;
  const {apiBaseUrl} = getAppConfig();
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const deadline = now() + POLL_DEADLINE_MS;
  let lesson = options.initialLesson ?? null;
  let etag: string | undefined = lesson ? `"${lesson.revision}"` : undefined;
  let delay =
    options.initialPollDelayMs ??
    parsePollDelay(new Headers(), lesson ?? undefined);

  while (now() < deadline) {
    if (options.signal?.aborted)
      return {ok: false, errorCode: 'CANCELLED', message: 'Request cancelled.'};
    if (!isLessonV2PollingActive()) {
      return {
        ok: false,
        status: 'polling_stopped',
        errorCode: 'POLLING_STOPPED',
        message: 'Lesson polling paused while the app is in the background.',
        lesson,
        retryable: true,
      };
    }
    const waited = await waitFor(
      Math.min(delay, Math.max(0, deadline - now())),
      options.signal,
    );
    if (!waited)
      return options.signal?.aborted
        ? {ok: false, errorCode: 'CANCELLED', message: 'Request cancelled.'}
        : {
            ok: false,
            status: 'polling_stopped',
            errorCode: 'POLLING_STOPPED',
            message: 'Lesson polling stopped at the client deadline.',
            lesson,
            retryable: true,
          };
    const headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: `Bearer ${token.token}`,
    };
    if (etag) headers['If-None-Match'] = etag;
    const result = await request(
      fetchImpl,
      resolveUrl(apiBaseUrl, `${CREATE_PATH}/${lessonId}`),
      {method: 'GET', headers},
      options.signal,
      FETCH_TIMEOUT_MS,
    );
    if (result.error) {
      return {
        ok: false,
        status: 'polling_stopped',
        errorCode: 'POLLING_STOPPED',
        message: 'Lesson polling paused because the device is offline.',
        lesson,
        retryable: true,
      };
    }
    const response = result.response!;
    if (response.status === 304) {
      delay = parsePollDelay(response.headers, lesson ?? undefined);
      continue;
    }
    const body = await readJson(response);
    if (!response.ok) return errorFromBody(response, body);
    const parsed = LessonV2Schema.safeParse(body);
    if (!parsed.success)
      return {
        ok: false,
        errorCode: 'INVALID_RESPONSE',
        message: 'Server returned an invalid lesson.',
      };
    lesson = parsed.data;
    etag = response.headers.get('etag') ?? `"${lesson.revision}"`;
    const persistError = await persistLesson(lesson);
    if (persistError) return persistError;
    options.onLesson?.(lesson);
    if (
      lesson.status === 'ready' ||
      lesson.status === 'ready_with_warnings' ||
      lesson.status === 'failed'
    ) {
      return {ok: true, lesson, completed: true};
    }
    delay = parsePollDelay(response.headers, lesson);
  }
  return {
    ok: false,
    status: 'polling_stopped',
    errorCode: 'POLLING_STOPPED',
    message: 'Lesson polling stopped at the client deadline.',
    lesson,
    retryable: true,
  };
}

export async function resumeLessonV2(
  lessonId: string,
  options: PollOptions = {},
): Promise<LessonV2ClientResult> {
  const local = options.initialLesson ?? undefined;
  return pollLessonV2(lessonId, {...options, initialLesson: local});
}

async function mutateLessonV2(
  lessonId: string,
  path: string,
  options: ClientOptions = {},
): Promise<LessonV2ClientResult> {
  const token = await tokenFor(lessonId);
  if (token.error) return token.error;
  const {apiBaseUrl} = getAppConfig();
  const result = await request(
    options.fetchImpl ?? fetch,
    `${apiBaseUrl}${path}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token.token}`,
        'Idempotency-Key': createRequestId(),
      },
    },
    options.signal,
    FETCH_TIMEOUT_MS,
  );
  if (result.error) return result.error;
  const response = result.response!;
  const body = await readJson(response);
  if (!response.ok) return errorFromBody(response, body);
  const parsed = LessonV2Schema.safeParse(body);
  if (!parsed.success)
    return {
      ok: false,
      errorCode: 'INVALID_RESPONSE',
      message: 'Server returned an invalid lesson.',
    };
  const persistError = await persistLesson(parsed.data);
  if (persistError) return persistError;
  return {ok: true, lesson: parsed.data, completed: false};
}

export function retryLessonV2Chunk(
  lessonId: string,
  chunkId: string,
  options?: ClientOptions,
) {
  return mutateLessonV2(
    lessonId,
    `${CREATE_PATH}/${lessonId}/chunks/${encodeURIComponent(chunkId)}/retry`,
    options,
  );
}

export function retryLessonV2Unit(
  lessonId: string,
  unitKey: 'vocabulary' | 'grammar' | 'ipa_resolve' | 'practice',
  options?: ClientOptions,
) {
  return mutateLessonV2(
    lessonId,
    `${CREATE_PATH}/${lessonId}/units/${unitKey}/retry`,
    options,
  );
}

export async function deleteLessonV2(
  lessonId: string,
  options: ClientOptions = {},
): Promise<{ok: true} | LessonV2ClientError> {
  const token = await tokenFor(lessonId);
  if (token.error) return token.error;
  const {apiBaseUrl} = getAppConfig();
  const result = await request(
    options.fetchImpl ?? fetch,
    `${apiBaseUrl}${CREATE_PATH}/${lessonId}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token.token}`,
      },
    },
    options.signal,
    FETCH_TIMEOUT_MS,
  );
  if (result.error) return result.error;
  if (!result.response!.ok && result.response!.status !== 404)
    return errorFromBody(result.response!, await readJson(result.response!));
  const keychainResult = await deleteLessonToken(lessonId);
  deleteLocalLessonV2(lessonId);
  if (!keychainResult.ok)
    return {
      ok: false,
      errorCode: keychainResult.errorCode,
      message: 'Secure token storage is unavailable.',
    };
  return {ok: true};
}

export function isLessonV2PollingActive(): boolean {
  return AppState.currentState === 'active';
}
