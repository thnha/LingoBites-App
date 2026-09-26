import { AppState, type AppStateStatus } from 'react-native';
import { syncPull } from '@shared/api/syncClient';
import { getDatabase, withTransaction } from '@shared/db/database';
import type { SyncRecord } from '@shared/schemas/sync';

let isRunning = false;
let isEnabled = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let subscription: { remove: () => void } | null = null;

function getCursor(): string {
  const db = getDatabase();
  const res = db.execute("SELECT value FROM app_settings WHERE key = 'sync_cursor' LIMIT 1;");
  if (res.rows && res.rows.length > 0) {
    return res.rows.item(0).value as string;
  }
  return '';
}

function saveCursor(cursor: string) {
  const db = getDatabase();
  db.execute("INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('sync_cursor', ?, ?);", [cursor, new Date().toISOString()]);
}

function mapToSnakeCase(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  const res: any = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    res[snakeKey] = obj[key];
  }
  return res;
}

function applySyncRecord(record: SyncRecord) {
  const db = getDatabase();
  const table = record.collection === 'content_review_state' ? 'content_lesson_state' : record.collection;
  
  // Get table info
  const pragmaRes = db.execute(`PRAGMA table_info(${table});`);
  if (!pragmaRes.rows || pragmaRes.rows.length === 0) return;
  
  const columns: string[] = [];
  const pks: string[] = [];
  for (let i = 0; i < pragmaRes.rows.length; i++) {
    const row = pragmaRes.rows.item(i);
    columns.push(row.name);
    if (row.pk > 0) pks.push(row.name);
  }
  
  if (pks.length === 0) return;
  
  const payload = mapToSnakeCase(record.payload);
  
  // Extract PK values from payload or entity_id
  // If entity_id is composite (e.g. lessonId:grammarId), we split it.
  // Actually, let's just use entity_id if there's only 1 PK.
  const pkValues = pks.length === 1 ? [record.entity_id] : pks.map(pk => payload[pk]);
  
  // Check local revision
  const pkWhere = pks.map(pk => `${pk} = ?`).join(' AND ');
  const existingRes = db.execute(`SELECT revision FROM ${table} WHERE ${pkWhere} LIMIT 1;`, pkValues);
  
  if (existingRes.rows && existingRes.rows.length > 0) {
    const localRev = existingRes.rows.item(0).revision;
    if (localRev === 0) {
      // Local changes pending sync, do not overwrite (local-first)
      return;
    }
    if (localRev >= record.revision) {
      // Stale record
      return;
    }
  }
  
  if (record.tombstone) {
    // apply tombstone
    if (columns.includes('tombstone')) {
      db.execute(`UPDATE ${table} SET tombstone = 1, revision = ?, updated_at = ? WHERE ${pkWhere};`, [record.revision, new Date().toISOString(), ...pkValues]);
    } else {
      db.execute(`DELETE FROM ${table} WHERE ${pkWhere};`, pkValues);
    }
    return;
  }
  
  // Insert or Replace
  const insertCols: string[] = [];
  const insertVals: any[] = [];
  
  for (const col of columns) {
    if (col === 'revision') {
      insertCols.push(col);
      insertVals.push(record.revision);
    } else if (col === 'tombstone') {
      insertCols.push(col);
      insertVals.push(record.tombstone ? 1 : 0);
    } else if (col === 'updated_at') {
      insertCols.push(col);
      insertVals.push(record.updated_at || new Date().toISOString());
    } else if (payload[col] !== undefined) {
      insertCols.push(col);
      insertVals.push(payload[col]);
    } else if (pks.includes(col)) {
      insertCols.push(col);
      insertVals.push(pkValues[pks.indexOf(col)]);
    }
  }
  
  const placeholders = insertCols.map(() => '?').join(', ');
  db.execute(`INSERT OR REPLACE INTO ${table} (${insertCols.join(', ')}) VALUES (${placeholders});`, insertVals);
}

export async function runPullWorker() {
  if (isRunning || !isEnabled) return;
  isRunning = true;
  
  try {
    let cursor = getCursor();
    let hasMore = true;
    
    while (hasMore && isEnabled) {
      const res = await syncPull(cursor, 100);
      if (!res.ok) {
        retryTimer = setTimeout(runPullWorker, 5000);
        break;
      }
      
      const db = getDatabase();
      withTransaction(db, () => {
        for (const record of res.data.records) {
          try { applySyncRecord(record); } catch (_e) {}
        }
        cursor = res.data.next_cursor;
        saveCursor(cursor);
      });
      
      hasMore = res.data.has_more;
    }
  } finally {
    isRunning = false;
  }
}

export function startPullWorker() {
  if (isEnabled) return;
  isEnabled = true;
  runPullWorker();
  subscription?.remove();
  subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active' || state === 'background') {
      runPullWorker();
    }
  });
}

export function stopPullWorker() {
  isEnabled = false;
  if (retryTimer) clearTimeout(retryTimer);
  subscription?.remove();
}
