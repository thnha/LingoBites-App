import { createRequestId } from '../api/requestId';
import { getDatabase } from './database';
import type {
  GamificationEventInput,
  GamificationEventRecord,
} from './types';

type GamificationEventRow = {
  id: string;
  event_type: string;
  source_event_id: string | null;
  points: number;
  created_at: string;
};

function mapGamificationEventRow(
  row: GamificationEventRow,
): GamificationEventRecord {
  return {
    id: row.id,
    eventType: row.event_type as GamificationEventRecord['eventType'],
    sourceEventId: row.source_event_id ?? '',
    points: row.points,
    createdAt: row.created_at,
  };
}

function rowsToRecords(result: {
  rows?: { length: number; item: (index: number) => unknown };
}): GamificationEventRecord[] {
  const rows = result.rows;
  const items: GamificationEventRecord[] = [];
  if (!rows) {
    return items;
  }
  for (let index = 0; index < rows.length; index += 1) {
    items.push(mapGamificationEventRow(rows.item(index) as GamificationEventRow));
  }
  return items;
}

/**
 * Appends one row to the gamification event log. Row ids are generated here so
 * callers can treat an event as a pure description of what happened.
 */
export function insertGamificationEvent(
  input: GamificationEventInput,
): GamificationEventRecord {
  const db = getDatabase();
  const id = createRequestId();
  db.execute(
    `INSERT INTO gamification_events (
      id, event_type, source_event_id, points, created_at
    ) VALUES (?, ?, ?, ?, ?);`,
    [
      id,
      input.eventType,
      input.sourceEventId || null,
      input.points,
      input.createdAt,
    ],
  );
  return { id, ...input };
}

/** All stored gamification events, oldest first. Used for state derivation. */
export function listGamificationEvents(): GamificationEventRecord[] {
  const db = getDatabase();
  const result = db.execute(
    `SELECT * FROM gamification_events ORDER BY datetime(created_at) ASC, id ASC;`,
  );
  return rowsToRecords(result);
}
