import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY NOT NULL,
    anonymous_user_id TEXT NOT NULL,
    lesson_input_hash TEXT NOT NULL,
    title TEXT NOT NULL,
    source_type TEXT NOT NULL,
    ocr_raw_text TEXT,
    confirmed_text TEXT NOT NULL,
    vietnamese_translation TEXT NOT NULL,
    summary TEXT,
    level TEXT NOT NULL,
    ai_output_json TEXT NOT NULL,
    is_saved INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_lessons_input_hash ON lessons (lesson_input_hash);`,
  `CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON lessons (created_at DESC);`,
  `CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `ALTER TABLE lessons ADD COLUMN category TEXT NOT NULL DEFAULT 'vocabulary';`,
  `CREATE TABLE IF NOT EXISTS flashcards (
    id TEXT PRIMARY KEY NOT NULL,
    lesson_id TEXT NOT NULL,
    vocabulary_id TEXT NOT NULL,
    word TEXT NOT NULL,
    phrase_from_text TEXT,
    word_type TEXT,
    meaning_vi TEXT NOT NULL,
    pronunciation_guide_vi TEXT,
    ipa TEXT,
    cefr_level TEXT,
    source_sentence TEXT,
    example TEXT,
    example_translation TEXT,
    is_saved INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (lesson_id, vocabulary_id)
  );`,
  `CREATE INDEX IF NOT EXISTS idx_flashcards_lesson_id ON flashcards (lesson_id);`,
  `CREATE INDEX IF NOT EXISTS idx_flashcards_is_saved ON flashcards (is_saved);`,
  `CREATE TABLE IF NOT EXISTS review_schedule (
    card_id TEXT PRIMARY KEY NOT NULL,
    lesson_id TEXT NOT NULL,
    interval_days INTEGER NOT NULL,
    next_review_at TEXT NOT NULL,
    last_reviewed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_review_schedule_due ON review_schedule (next_review_at);`,
  `CREATE TABLE IF NOT EXISTS review_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    card_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    rating TEXT NOT NULL,
    reviewed_at TEXT NOT NULL,
    interval_days INTEGER NOT NULL,
    next_review_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_review_sessions_card_id ON review_sessions (card_id);`,
  `CREATE INDEX IF NOT EXISTS idx_review_sessions_reviewed_at ON review_sessions (reviewed_at DESC);`,
];

export function runMigrations(db: QuickSQLiteConnection): void {
  for (const sql of MIGRATIONS) {
    try {
      db.execute(sql);
    } catch (error) {
      // Ignore "duplicate column name" errors for ALTER TABLE ADD COLUMN
      // This makes migrations idempotent since they run on every app launch
      if (
        error instanceof Error &&
        error.message.includes('duplicate column name')
      ) {
        continue;
      }
      throw error;
    }
  }
}
