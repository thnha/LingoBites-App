/**
 * Unified generation-job polling hook over `fetchLessonGenerationJob`.
 *
 * Polls only job status (never content) pacing each round by the
 * server's `pollAfterMs` clamped to sane bounds, with an overall
 * deadline. Stops at terminal status (`ready`, `ready_with_warnings`
 * with a materialized `lessonId`, or `failed`). Stale-poll safe: only
 * the latest in-flight round can commit state, and unmount/cancel
 * aborts the loop without committing.
 */
import {useCallback, useEffect, useRef, useState} from 'react';
import {
  fetchLessonGenerationJob,
  isLessonGenerationTerminal,
  type LessonGenerationJob,
  type LessonJobError,
} from './lessonJobClient';

const POLL_AFTER_MIN_MS = 500;
const POLL_AFTER_MAX_MS = 15_000;
const POLL_DEADLINE_MS = 5 * 60_000;

export type LessonGenerationState =
  | {status: 'polling'; job: LessonGenerationJob | null}
  | {status: 'succeeded'; job: LessonGenerationJob; lessonId: string}
  | {status: 'failed'; job: LessonGenerationJob | null; error: LessonJobError};

export type UseLessonGenerationJobOptions = {
  jobId: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
};

function clampPollAfterMs(pollAfterMs: number): number {
  if (!Number.isFinite(pollAfterMs)) return POLL_AFTER_MIN_MS;
  return Math.min(POLL_AFTER_MAX_MS, Math.max(POLL_AFTER_MIN_MS, pollAfterMs));
}

function waitFor(ms: number, signal: AbortSignal): Promise<boolean> {
  if (signal.aborted) return Promise.resolve(false);
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve(true);
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      resolve(false);
    };
    signal.addEventListener('abort', onAbort, {once: true});
  });
}

export function useLessonGenerationJob(
  options: UseLessonGenerationJobOptions,
): LessonGenerationState {
  const {jobId, fetchImpl, now = Date.now} = options;
  const [state, setState] = useState<LessonGenerationState>({
    status: 'polling',
    job: null,
  });
  const roundRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const poll = useCallback(async () => {
    const round = roundRef.current + 1;
    roundRef.current = round;
    const controller = new AbortController();
    controllerRef.current = controller;
    const deadline = now() + POLL_DEADLINE_MS;
    let delay = POLL_AFTER_MIN_MS;
    const isCurrent = () => roundRef.current === round;

    // First snapshot immediately; subsequent rounds wait first.
    let first = true;
    while (now() < deadline) {
      if (!first) {
        const waited = await waitFor(
          Math.min(delay, Math.max(0, deadline - now())),
          controller.signal,
        );
        if (!waited || !isCurrent()) return;
      }
      first = false;
      const result = await fetchLessonGenerationJob(jobId, {
        fetchImpl,
        signal: controller.signal,
      });
      if (!isCurrent()) return;
      if (!result.ok) {
        if (result.cancelled) return;
        setState({
          status: 'failed',
          job: null,
          error: result.retryable
            ? result
            : {
                ...result,
                retryable: true,
              },
        });
        return;
      }
      const {job} = result;
      if (isLessonGenerationTerminal(job)) {
        if (job.status === 'failed' || !job.lessonId) {
          setState({
            status: 'failed',
            job,
            error: {
              ok: false,
              kind: 'server-error',
              errorCode: job.error?.code ?? 'GENERATION_FAILED',
              message:
                job.error?.message ?? 'Lesson generation failed. Try again.',
              retryable: true,
            },
          });
          return;
        }
        setState({status: 'succeeded', job, lessonId: job.lessonId});
        return;
      }
      delay = clampPollAfterMs(job.pollAfterMs);
      setState({status: 'polling', job});
    }
    if (isCurrent()) {
      setState({
        status: 'failed',
        job: null,
        error: {
          ok: false,
          kind: 'network-error',
          errorCode: 'POLLING_TIMEOUT',
          message: 'Generation is taking too long. Try again.',
          retryable: true,
        },
      });
    }
  }, [jobId, fetchImpl, now]);

  useEffect(() => {
    setState({status: 'polling', job: null});
    void poll();
    return () => {
      roundRef.current += 1;
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, [poll]);

  return state;
}
