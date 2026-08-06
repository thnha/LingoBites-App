import {Platform} from 'react-native';
import {createRequestId} from './requestId';
import {getAppConfig} from './appConfig';
import {validateAIOutput} from '../schemas/ai-output-v1';
import {
  AI_ANALYSIS_FAILED_MESSAGE,
  EMPTY_INPUT_MESSAGE,
  NETWORK_LOST_MESSAGE,
  TEXT_TOO_LONG_MESSAGE,
} from '../copy/userMessages';
import type {
  AnalysisJobProgressBody,
  AnalysisJobStatusBody,
  AnalyzeTextRequestBody,
  ApiErrorBody,
  CreateAnalysisJobSuccessBody,
} from './types';
import type {
  AnalysisProgress,
  AnalysisProgressCallback,
  AnalyzeTextResult,
} from '../../modules/ai-analysis/types';

const CREATE_PATH = '/v1/ai/analyses';
const DEFAULT_PROMPT_VERSION = 'lesson-analysis-v1';
const DEFAULT_LEVEL = 'Beginner';
const DEFAULT_RETRY_AFTER_MS = 1_000;
const MAX_RETRY_AFTER_MS = 10_000;
const POLL_INTERVAL_MS = 1_500;
const POLL_DEADLINE_MS = 75_000;
const FETCH_TIMEOUT_MS = 10_000;

const cancelledResult = (): AnalyzeTextResult => ({ok: false, cancelled: true});

function isAborted(signal?: AbortSignal): boolean {
  return signal?.aborted === true;
}

function parseRetryAfter(value: string | null): number {
  if (value === null || value.trim() === '') {
    return DEFAULT_RETRY_AFTER_MS;
  }
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) {
    return DEFAULT_RETRY_AFTER_MS;
  }
  return Math.min(seconds * 1_000, MAX_RETRY_AFTER_MS);
}

/**
 * Bounds a single fetch call so a hung request can't outlive the overall
 * poll deadline. The returned signal aborts when either the caller's own
 * `externalSignal` aborts (user cancellation) or `timeoutMs` elapses
 * (internal watchdog) — callers distinguish the two after the fact by
 * checking whether `externalSignal` itself is aborted.
 */
function withTimeout(
  timeoutMs: number,
  externalSignal: AbortSignal | undefined,
): {signal: AbortSignal; cleanup: () => void} {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort();
  externalSignal?.addEventListener('abort', onExternalAbort, {once: true});
  const cleanup = () => {
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  };
  return {signal: controller.signal, cleanup};
}

function resolveStatusUrl(apiBaseUrl: string, statusUrl: string): string {
  if (/^https?:\/\//i.test(statusUrl)) {
    return statusUrl;
  }
  return `${apiBaseUrl}${statusUrl.startsWith('/') ? '' : '/'}${statusUrl}`;
}

function waitFor(ms: number, signal?: AbortSignal): Promise<boolean> {
  if (isAborted(signal)) return Promise.resolve(false);
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

type WaitOutcome = 'continue' | 'cancelled' | 'timeout';

/**
 * Waits up to `ms` (clamped to the remaining time before `deadline`) before
 * the next poll attempt. Every caller in the polling loop needs the same
 * "did the deadline already pass / did the caller cancel" decision, so this
 * is the single place that makes it.
 */
async function waitBeforeNextAttempt(
  ms: number,
  deadline: number,
  signal?: AbortSignal,
): Promise<WaitOutcome> {
  if (Date.now() >= deadline) {
    return 'timeout';
  }
  const clamped = Math.min(ms, deadline - Date.now());
  const completed = await waitFor(clamped, signal);
  return completed ? 'continue' : 'cancelled';
}

function buildRequestBody(
  confirmedText: string,
  sourceType: AnalyzeTextRequestBody['source_type'],
): AnalyzeTextRequestBody {
  const platform =
    Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : undefined;

  return {
    request_id: createRequestId(),
    confirmed_text: confirmedText,
    level: DEFAULT_LEVEL,
    native_language: 'Vietnamese',
    source_type: sourceType,
    prompt_version: DEFAULT_PROMPT_VERSION,
    client_context: platform ? {platform} : undefined,
  };
}

function mapApiErrorToMessage(code: string): string {
  switch (code) {
    case 'VALIDATION_EMPTY_TEXT':
      return EMPTY_INPUT_MESSAGE;
    case 'VALIDATION_TEXT_TOO_LONG':
      return TEXT_TOO_LONG_MESSAGE;
    case 'NETWORK_ERROR':
      return NETWORK_LOST_MESSAGE;
    case 'VALIDATION_MISSING_IDEMPOTENCY_KEY':
    case 'IDEMPOTENCY_CONFLICT':
    case 'AI_TIMEOUT':
    case 'AI_INVALID_OUTPUT':
    case 'AI_PROVIDER_ERROR':
    case 'AI_STAGE_PROVIDER_ERROR':
    case 'AI_STAGE_INVALID_OUTPUT':
    case 'AI_STAGE_TIMEOUT':
    case 'AI_JOB_TIMEOUT':
    case 'AI_FINAL_VALIDATION_FAILED':
    case 'AI_JOB_NOT_FOUND':
    case 'AI_POLL_GIVE_UP':
      return AI_ANALYSIS_FAILED_MESSAGE;
    default:
      return AI_ANALYSIS_FAILED_MESSAGE;
  }
}

// ---- Envelope guards -------------------------------------------------
//
// These are intentionally loose (they check the discriminator plus only the
// fields the corresponding branch reads), matching the existing convention
// in analyzeClient.ts/ocrClient.ts. Any HTTP-success body that satisfies
// none of them falls through to AI_INVALID_OUTPUT.

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isErrorEnvelope(body: unknown): body is ApiErrorBody {
  return (
    isObject(body) &&
    body.status === 'failed' &&
    isObject(body.error) &&
    typeof body.error.code === 'string' &&
    typeof body.error.message === 'string'
  );
}

function isCreateSuccessBody(body: unknown): body is CreateAnalysisJobSuccessBody {
  return (
    isObject(body) &&
    typeof body.analysis_id === 'string' &&
    typeof body.status === 'string' &&
    typeof body.created_at === 'string' &&
    typeof body.status_url === 'string'
  );
}

function isProgressBody(value: unknown): value is AnalysisJobProgressBody {
  return (
    isObject(value) &&
    typeof value.percent === 'number' &&
    (typeof value.current_stage === 'string' || value.current_stage === null) &&
    (typeof value.message === 'string' || value.message === null) &&
    Array.isArray(value.stages) &&
    value.stages.every(
      stage =>
        isObject(stage) &&
        typeof stage.name === 'string' &&
        typeof stage.status === 'string' &&
        typeof stage.attempts === 'number',
    )
  );
}

type InProgressBody = Extract<
  AnalysisJobStatusBody,
  {status: 'queued' | 'processing' | 'paused'}
>;

function isInProgressBody(body: unknown): body is InProgressBody {
  return (
    isObject(body) &&
    (body.status === 'queued' || body.status === 'processing' || body.status === 'paused') &&
    isProgressBody(body.progress)
  );
}

type CompletedBody = Extract<AnalysisJobStatusBody, {status: 'completed'}>;

function isCompletedBody(body: unknown): body is CompletedBody {
  return isObject(body) && body.status === 'completed' && 'data' in body;
}

function toAnalysisProgress(body: AnalysisJobProgressBody): AnalysisProgress {
  return {
    percent: body.percent,
    stage: body.current_stage,
    message: body.message,
    stages: body.stages.map(stage => ({...stage})),
  };
}

function isTransientStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

export async function runAnalysisJob(
  confirmedText: string,
  sourceType: AnalyzeTextRequestBody['source_type'] = 'paste_text',
  onProgress?: AnalysisProgressCallback,
  signal?: AbortSignal,
): Promise<AnalyzeTextResult> {
  const startedAt = Date.now();
  const deadline = startedAt + POLL_DEADLINE_MS;
  if (isAborted(signal)) return cancelledResult();

  const {apiBaseUrl} = getAppConfig();
  const idempotencyKey = createRequestId();
  const requestBody = buildRequestBody(confirmedText, sourceType);

  let createResponse: Response;
  try {
    const {signal: fetchSignal, cleanup} = withTimeout(
      Math.min(FETCH_TIMEOUT_MS, deadline - Date.now()),
      signal,
    );
    try {
      createResponse = await fetch(`${apiBaseUrl}${CREATE_PATH}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(requestBody),
        signal: fetchSignal,
      });
    } finally {
      cleanup();
    }
  } catch {
    if (isAborted(signal)) return cancelledResult();
    return {ok: false, errorCode: 'NETWORK_ERROR', message: NETWORK_LOST_MESSAGE};
  }
  if (isAborted(signal)) return cancelledResult();

  let createBody: unknown;
  try {
    createBody = await createResponse.json();
  } catch {
    if (isAborted(signal)) return cancelledResult();
    return {ok: false, errorCode: 'NETWORK_ERROR', message: NETWORK_LOST_MESSAGE};
  }
  if (isAborted(signal)) return cancelledResult();

  if (!createResponse.ok || isErrorEnvelope(createBody)) {
    const errorBody = isErrorEnvelope(createBody) ? createBody : undefined;
    const code = errorBody?.error.code ?? 'AI_PROVIDER_ERROR';
    return {ok: false, errorCode: code, message: mapApiErrorToMessage(code)};
  }

  if (!isCreateSuccessBody(createBody)) {
    return {ok: false, errorCode: 'AI_INVALID_OUTPUT', message: AI_ANALYSIS_FAILED_MESSAGE};
  }

  const statusUrl = resolveStatusUrl(apiBaseUrl, createBody.status_url);
  const retryAfterMs = parseRetryAfter(createResponse.headers.get('Retry-After'));

  const initialWait = await waitBeforeNextAttempt(retryAfterMs, deadline, signal);
  if (initialWait === 'cancelled') return cancelledResult();

  while (Date.now() < deadline) {
    if (isAborted(signal)) return cancelledResult();

    let pollResponse: Response;
    try {
      const {signal: fetchSignal, cleanup} = withTimeout(
        Math.min(FETCH_TIMEOUT_MS, deadline - Date.now()),
        signal,
      );
      try {
        pollResponse = await fetch(statusUrl, {
          method: 'GET',
          headers: {Accept: 'application/json'},
          signal: fetchSignal,
        });
      } finally {
        cleanup();
      }
    } catch {
      if (isAborted(signal)) return cancelledResult();
      const outcome = await waitBeforeNextAttempt(POLL_INTERVAL_MS, deadline, signal);
      if (outcome === 'cancelled') return cancelledResult();
      if (outcome === 'timeout') break;
      continue;
    }
    if (isAborted(signal)) return cancelledResult();

    if (!pollResponse.ok && isTransientStatus(pollResponse.status)) {
      const outcome = await waitBeforeNextAttempt(POLL_INTERVAL_MS, deadline, signal);
      if (outcome === 'cancelled') return cancelledResult();
      if (outcome === 'timeout') break;
      continue;
    }

    let pollBody: unknown;
    try {
      pollBody = await pollResponse.json();
    } catch {
      if (isAborted(signal)) return cancelledResult();
      const outcome = await waitBeforeNextAttempt(POLL_INTERVAL_MS, deadline, signal);
      if (outcome === 'cancelled') return cancelledResult();
      if (outcome === 'timeout') break;
      continue;
    }
    if (isAborted(signal)) return cancelledResult();

    if (!pollResponse.ok) {
      const errorBody = isErrorEnvelope(pollBody) ? pollBody : undefined;
      const code = errorBody?.error.code ?? 'AI_PROVIDER_ERROR';
      return {ok: false, errorCode: code, message: mapApiErrorToMessage(code)};
    }

    if (isInProgressBody(pollBody)) {
      onProgress?.(toAnalysisProgress(pollBody.progress));
    } else if (isCompletedBody(pollBody)) {
      const validation = validateAIOutput(pollBody.data);
      if (!validation.valid) {
        return {ok: false, errorCode: 'AI_INVALID_OUTPUT', message: AI_ANALYSIS_FAILED_MESSAGE};
      }
      return {ok: true, lesson: validation.data};
    } else if (isErrorEnvelope(pollBody)) {
      const code = pollBody.error.code;
      return {ok: false, errorCode: code, message: mapApiErrorToMessage(code)};
    } else {
      return {ok: false, errorCode: 'AI_INVALID_OUTPUT', message: AI_ANALYSIS_FAILED_MESSAGE};
    }

    const outcome = await waitBeforeNextAttempt(POLL_INTERVAL_MS, deadline, signal);
    if (outcome === 'cancelled') return cancelledResult();
    if (outcome === 'timeout') break;
  }

  return {
    ok: false,
    errorCode: 'AI_POLL_GIVE_UP',
    message: AI_ANALYSIS_FAILED_MESSAGE,
  };
}
