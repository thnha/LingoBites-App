import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {open} from 'react-native-quick-sqlite';
import {getDatabase, resetDatabaseForTests} from '../database';
import {DB_NAME} from '../constants';
import {
  countPendingSyncEvents,
  deleteSyncEvents,
  enqueueSyncOutboxEvent,
  listPendingSyncEvents,
  markSyncEventsFailed,
  markSyncEventsSynced,
} from '../SyncOutboxRepository';
import type {ReviewEventPayload} from '../types';

const payload: ReviewEventPayload = {
  schema_version: 1,
  anonymous_user_id: 'user-1',
  card_id: 'card-1',
  lesson_id: 'lesson-1',
  rating: 'good',
  reviewed_at: '2026-09-05T12:00:00.000Z',
  interval_days: 7,
  next_review_at: '2026-09-12T12:00:00.000Z',
  ease_factor: 2.5,
  repetitions: 2,
};

describe('SyncOutboxRepository', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
    getDatabase();
  });

  it('enqueues an event as pending with default attempts and no error', () => {
    enqueueSyncOutboxEvent({
      id: 'event-1',
      entityId: 'card-1',
      payload,
      createdAt: '2026-09-05T12:00:00.000Z',
    });

    const pending = listPendingSyncEvents();
    expect(pending).toHaveLength(1);
    expect(pending[0]).toMatchObject({
      id: 'event-1',
      eventType: 'review',
      entityId: 'card-1',
      attemptCount: 0,
      lastError: null,
      syncedAt: null,
      createdAt: '2026-09-05T12:00:00.000Z',
    });
    expect(pending[0].payload).toEqual(payload);
    expect(countPendingSyncEvents()).toBe(1);
  });

  it('lists pending events oldest-first and respects the limit', () => {
    for (const [id, createdAt] of [
      ['event-2', '2026-09-05T13:00:00.000Z'],
      ['event-1', '2026-09-05T12:00:00.000Z'],
      ['event-3', '2026-09-05T14:00:00.000Z'],
    ]) {
      enqueueSyncOutboxEvent({
        id,
        entityId: 'card-1',
        payload,
        createdAt,
      });
    }

    expect(listPendingSyncEvents().map(event => event.id)).toEqual([
      'event-1',
      'event-2',
      'event-3',
    ]);
    expect(
      listPendingSyncEvents({limit: 2}).map(event => event.id),
    ).toEqual(['event-1', 'event-2']);
  });

  it('marks only pending ids as synced', () => {
    enqueueSyncOutboxEvent({id: 'event-1', entityId: 'c', payload});
    enqueueSyncOutboxEvent({id: 'event-2', entityId: 'c', payload});
    enqueueSyncOutboxEvent({id: 'event-3', entityId: 'c', payload});
    markSyncEventsSynced(['event-1', 'event-3'], '2026-09-05T15:00:00.000Z');

    expect(listPendingSyncEvents().map(event => event.id)).toEqual([
      'event-2',
    ]);
    expect(countPendingSyncEvents()).toBe(1);
  });

  it('records a failed attempt by incrementing attempt_count and storing the error', () => {
    enqueueSyncOutboxEvent({id: 'event-1', entityId: 'c', payload});

    markSyncEventsFailed(['event-1'], 'network down');
    markSyncEventsFailed(['event-1'], 'network down again');

    const pending = listPendingSyncEvents();
    expect(pending).toHaveLength(1);
    expect(pending[0].attemptCount).toBe(2);
    expect(pending[0].lastError).toBe('network down again');
  });

  it('does not increment attempts for an already-synced row', () => {
    enqueueSyncOutboxEvent({id: 'event-1', entityId: 'c', payload});
    markSyncEventsSynced(['event-1'], '2026-09-05T15:00:00.000Z');

    expect(markSyncEventsFailed(['event-1'], 'late failure')).toBe(0);
    expect(listPendingSyncEvents()).toHaveLength(0);
  });

  it('deletes rows by id', () => {
    enqueueSyncOutboxEvent({id: 'event-1', entityId: 'c', payload});
    enqueueSyncOutboxEvent({id: 'event-2', entityId: 'c', payload});

    expect(deleteSyncEvents(['event-1'])).toBe(1);
    expect(countPendingSyncEvents()).toBe(1);
    expect(listPendingSyncEvents()[0].id).toBe('event-2');
  });
});
