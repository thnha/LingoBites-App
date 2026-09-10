import {
  countPendingSyncEvents,
  listPendingSyncEvents,
  markSyncEventsFailed,
  markSyncEventsSynced,
} from '@shared/db/SyncOutboxRepository';
import {markPracticeEventsSynced} from '@shared/db/PracticeRepository';
import type {
  PracticeEventPayload,
  ReviewEventPayload,
  SyncOutboxRecord,
} from '@shared/db/types';
import {PRACTICE_EVENT_TYPE, REVIEW_EVENT_TYPE} from '@shared/db/types';
import {
  pushReviewEvents,
  type SyncReviewEvent,
} from '@shared/api/reviewEventsClient';
import {
  pushPracticeEvents,
  type SyncPracticeEvent,
} from '@shared/api/practiceEventsClient';
import {SYNC_BATCH_LIMIT, isSyncStuck} from './syncPolicy';

export type SyncDrainOutcome =
  | {status: 'idle'}
  | {status: 'stuck'}
  | {status: 'synced'; syncedIds: string[]}
  | {
      status: 'failed';
      errorCode: string;
      message: string;
      retryable: boolean;
    };

type DrainDeps = {
  fetchImpl?: typeof fetch;
  /**
   * When true, rows that already reached the attempt cap are retried anyway.
   * Used by explicit, human/event-paced triggers (a rating write, an app
   * foreground) so a reconnect can still drain a "stuck" queue — the cap only
   * stops the automatic backoff timer from retrying forever.
   */
  includeStuck?: boolean;
};

function toReviewWireEvent(event: SyncOutboxRecord): SyncReviewEvent {
  return {
    id: event.id,
    event_type: REVIEW_EVENT_TYPE,
    entity_id: event.entityId,
    payload: event.payload as ReviewEventPayload,
    created_at: event.createdAt,
  };
}

function isPracticePayload(
  payload: unknown,
): payload is PracticeEventPayload {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const p = payload as Record<string, unknown>;
  return (
    typeof p.session_id === 'string' &&
    typeof p.sequence === 'number' &&
    typeof p.question_id === 'string' &&
    typeof p.event_id === 'string'
  );
}

function toPracticeWireEvent(event: SyncOutboxRecord): SyncPracticeEvent | null {
  if (!isPracticePayload(event.payload)) {
    return null;
  }
  const payload = event.payload;
  return {
    event_id: event.id,
    event_type: 'practice_answered',
    session_id: payload.session_id,
    sequence: payload.sequence,
    occurred_at: payload.answered_at ?? event.createdAt,
    payload,
  };
}

/**
 * Sends one batch of pending outbox rows to the server and reconciles local
 * state: rows acknowledged by the server (accepted or reported as duplicates)
 * are marked `synced_at`; failures increment `attempt_count` and record the
 * error so a later drain retries them with backoff.
 *
 * P12: the queue is mixed — review rows go to `/v1/review-events`, practice
 * rows go to `/v1/practice-events:batch` (D4: practice-only, no SRS writes).
 * Practice `accepted` + `duplicate` both mark synced (and mirror
 * `practice_events.sync_status`); per-event permanent rejections keep their
 * audit (`last_error`) and are not auto-retried forever — the attempt cap
 * plus a non-retryable drain outcome stops the backoff storm.
 */
export async function drainOutboxOnce(
  deps: DrainDeps = {},
): Promise<SyncDrainOutcome> {
  const events = listPendingSyncEvents({limit: SYNC_BATCH_LIMIT});
  if (events.length === 0) {
    return {status: 'idle'};
  }

  const eligible = deps.includeStuck
    ? events
    : events.filter(event => !isSyncStuck(event.attemptCount));
  if (eligible.length === 0) {
    return {status: 'stuck'};
  }

  const reviewEvents = eligible.filter(
    event => event.eventType === REVIEW_EVENT_TYPE,
  );
  const practiceEvents = eligible.filter(
    event => event.eventType === PRACTICE_EVENT_TYPE,
  );
  // Forward-compat: rows with an unknown type drain through the review
  // endpoint so they are never silently stuck.
  const unknownEvents = eligible.filter(
    event =>
      event.eventType !== REVIEW_EVENT_TYPE &&
      event.eventType !== PRACTICE_EVENT_TYPE,
  );
  const reviewBatch = [...reviewEvents, ...unknownEvents];

  const syncedIds: string[] = [];
  let firstRetryableFailure:
    | {errorCode: string; message: string}
    | undefined;
  let firstPermanentFailure:
    | {errorCode: string; message: string}
    | undefined;

  if (reviewBatch.length > 0) {
    const result = await pushReviewEvents(
      reviewBatch.map(toReviewWireEvent),
      deps,
    );
    if (result.ok) {
      const ids = [...result.acceptedIds, ...result.duplicateIds];
      markSyncEventsSynced(ids);
      syncedIds.push(...ids);
    } else {
      markSyncEventsFailed(
        reviewBatch.map(event => event.id),
        result.message,
      );
      const failure = {errorCode: result.errorCode, message: result.message};
      if (result.retryable) {
        firstRetryableFailure ??= failure;
      } else {
        firstPermanentFailure ??= failure;
      }
    }
  }

  if (practiceEvents.length > 0) {
    const malformed = practiceEvents.filter(
      event => toPracticeWireEvent(event) === null,
    );
    if (malformed.length > 0) {
      // Payload that cannot be shaped into the P7 allowlist will never
      // succeed — record audit and let the cap stop retries.
      for (const event of malformed) {
        markSyncEventsFailed([event.id], 'INVALID_PRACTICE_PAYLOAD');
      }
      firstPermanentFailure ??= {
        errorCode: 'INVALID_PRACTICE_PAYLOAD',
        message: 'Invalid practice event payload',
      };
    }

    const wellFormed = practiceEvents.filter(
      event => toPracticeWireEvent(event) !== null,
    );
    if (wellFormed.length > 0) {
      const wire = wellFormed.map(
        event => toPracticeWireEvent(event) as SyncPracticeEvent,
      );
      const result = await pushPracticeEvents(wire, deps);
      if (result.ok) {
        const ids = [...result.acceptedIds, ...result.duplicateIds];
        if (ids.length > 0) {
          markSyncEventsSynced(ids);
          markPracticeEventsSynced(ids);
          syncedIds.push(...ids);
        }
        for (const rejection of result.rejected) {
          markSyncEventsFailed([rejection.event_id], rejection.code);
          const failure = {
            errorCode: rejection.code,
            message: rejection.code,
          };
          if (rejection.retryable) {
            firstRetryableFailure ??= failure;
          } else {
            firstPermanentFailure ??= failure;
          }
        }
      } else {
        markSyncEventsFailed(
          wellFormed.map(event => event.id),
          result.message,
        );
        const failure = {errorCode: result.errorCode, message: result.message};
        if (result.retryable) {
          firstRetryableFailure ??= failure;
        } else {
          firstPermanentFailure ??= failure;
        }
      }
    }
  }

  if (syncedIds.length > 0) {
    return {status: 'synced', syncedIds};
  }
  if (firstRetryableFailure) {
    return {
      status: 'failed',
      errorCode: firstRetryableFailure.errorCode,
      message: firstRetryableFailure.message,
      retryable: true,
    };
  }
  if (firstPermanentFailure) {
    return {
      status: 'failed',
      errorCode: firstPermanentFailure.errorCode,
      message: firstPermanentFailure.message,
      retryable: false,
    };
  }
  // No rows synced and no failures recorded (e.g. only malformed rows that
  // were already handled) — report progress-less drain as stuck-safe idle.
  return {status: 'idle'};
}

export type SyncOutboxStatus = {
  pending: number;
  stuck: number;
};

/**
 * Current outbox health. `stuck` counts rows that hit the attempt cap and are
 * no longer auto-retried; a UI/settings surface can use this to show a
 * "sync stuck" state.
 */
export function getSyncOutboxStatus(): SyncOutboxStatus {
  const pending = countPendingSyncEvents();
  const stuck = listPendingSyncEvents().filter(event =>
    isSyncStuck(event.attemptCount),
  ).length;
  return {pending, stuck};
}
