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
