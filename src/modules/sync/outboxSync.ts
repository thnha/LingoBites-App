import {
  countPendingSyncEvents,
  listPendingSyncEvents,
  markSyncEventsFailed,
  markSyncEventsSynced,
} from '../../shared/db/SyncOutboxRepository';
import type {SyncOutboxRecord} from '../../shared/db/types';
import {
  pushReviewEvents,
  type SyncReviewEvent,
} from '../../shared/api/reviewEventsClient';
import {
  SYNC_BATCH_LIMIT,
  isSyncStuck,
} from './syncPolicy';

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

function toWireEvent(event: SyncOutboxRecord): SyncReviewEvent {
  return {
    id: event.id,
    event_type: event.eventType,
    entity_id: event.entityId,
    payload: event.payload,
    created_at: event.createdAt,
  };
}

/**
 * Sends one batch of pending outbox rows to the server and reconciles local
 * state: rows acknowledged by the server (accepted or reported as duplicates)
 * are marked `synced_at`; failures increment `attempt_count` and record the
 * error so a later drain retries them with backoff.
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

  const result = await pushReviewEvents(
    eligible.map(toWireEvent),
    deps,
  );

  if (result.ok) {
    const syncedIds = [...result.acceptedIds, ...result.duplicateIds];
    markSyncEventsSynced(syncedIds);
    return {status: 'synced', syncedIds};
  }

  markSyncEventsFailed(
    eligible.map(event => event.id),
    result.message,
  );
  return {
    status: 'failed',
    errorCode: result.errorCode,
    message: result.message,
    retryable: result.retryable,
  };
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
