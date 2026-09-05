import {
  countPendingSyncEvents,
  listPendingSyncEvents,
} from '../../shared/db/SyncOutboxRepository';
import {
  drainOutboxOnce,
} from './outboxSync';
import {
  SYNC_MAX_ROUNDS_PER_REQUEST,
  isSyncStuck,
  syncRetryDelayMs,
} from './syncPolicy';

/**
 * Foreground sync manager for the review outbox.
 *
 * Owns the retry schedule: after a failed drain it re-arms a backoff timer
 * (`syncRetryDelayMs`), a new `requestSync()` cancels any pending timer and
 * tries immediately (this is the "network came back" / app-foreground trigger),
 * and rows that hit the attempt cap are left alone instead of retried forever.
 * Everything is best-effort and never throws.
 */
export type SyncManager = {
  start(): void;
  stop(): void;
  requestSync(): void;
  isRunning(): boolean;
};

export type SyncManagerDeps = {
  fetchImpl?: typeof fetch;
};

export function createSyncManager(deps: SyncManagerDeps = {}): SyncManager {
  let enabled = false;
  let busy = false;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  function clearRetryTimer(): void {
    if (retryTimer !== null) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  }

  function scheduleRetry(): void {
    const pending = listPendingSyncEvents().filter(
      event => !isSyncStuck(event.attemptCount),
    );
    if (pending.length === 0) {
      return;
    }
    const maxAttempt = Math.max(
      0,
      ...pending.map(event => event.attemptCount),
    );
    const delayMs = syncRetryDelayMs(maxAttempt + 1);
    retryTimer = setTimeout(() => {
      retryTimer = null;
      run(false).catch(() => {});
    }, delayMs);
  }

  async function run(includeStuck: boolean): Promise<void> {
    if (busy) {
      return;
    }
    busy = true;
    try {
      for (
        let round = 0;
        round < SYNC_MAX_ROUNDS_PER_REQUEST;
        round += 1
      ) {
        const outcome = await drainOutboxOnce({
          fetchImpl: deps.fetchImpl,
          includeStuck,
        });
        if (outcome.status === 'idle' || outcome.status === 'stuck') {
          clearRetryTimer();
          return;
        }
        if (outcome.status === 'failed') {
          if (outcome.retryable) {
            scheduleRetry();
          } else {
            // Permanent rejection (e.g. bad payload): no point auto-retrying.
            // A future foreground/requestSync will still attempt rows again.
            clearRetryTimer();
          }
          return;
        }
        // synced: keep draining while rows remain.
        if (countPendingSyncEvents() === 0) {
          clearRetryTimer();
          return;
        }
      }
      // More rows than the per-request round cap allows: keep the backoff
      // schedule alive instead of dropping them.
      scheduleRetry();
    } catch {
      scheduleRetry();
    } finally {
      busy = false;
    }
  }

  function requestSync(): void {
    if (!enabled || busy) {
      return;
    }
    clearRetryTimer();
    // Explicit triggers may retry capped ("stuck") rows: the cap only governs
    // the automatic backoff timer, so a reconnect still drains a stuck queue.
    run(true).catch(() => {});
  }

  return {
    start() {
      if (enabled) {
        return;
      }
      enabled = true;
      requestSync();
    },

    stop() {
      enabled = false;
      clearRetryTimer();
    },

    requestSync,

    isRunning() {
      return enabled;
    },
  };
}
