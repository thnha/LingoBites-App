import {open, type QuickSQLiteConnection} from 'react-native-quick-sqlite';
import {DB_NAME} from './constants';
import {runMigrations} from './migrations';

let dbInstance: QuickSQLiteConnection | null = null;
let migrationsApplied = false;

export function getDatabase(): QuickSQLiteConnection {
  if (!dbInstance) {
    dbInstance = open({name: DB_NAME});
  }

  if (!migrationsApplied) {
    runMigrations(dbInstance);
    migrationsApplied = true;
  }

  return dbInstance;
}

export function resetDatabaseForTests(connection: QuickSQLiteConnection | null): void {
  dbInstance = connection;
  migrationsApplied = false;
}

/**
 * Runs `run` between `BEGIN`/`COMMIT`, rolling back when it throws.
 *
 * `react-native-quick-sqlite` exposes a callback-style `transaction()`, but it
 * returns a promise; keeping the raw-BEGIN form lets repository functions stay
 * synchronous (the current codebase contract) while still giving the atomicity
 * the outbox design (ADR-2) relies on for the review write + outbox insert.
 */
export function withTransaction<T>(
  db: QuickSQLiteConnection,
  run: () => T,
): T {
  db.execute('BEGIN');
  try {
    const result = run();
    db.execute('COMMIT');
    return result;
  } catch (error) {
    try {
      db.execute('ROLLBACK');
    } catch {
      // Rollback failure leaves the connection unusable; the original error is
      // what matters and will surface to the caller.
    }
    throw error;
  }
}
