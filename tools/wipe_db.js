const fs = require('fs');
let content = fs.readFileSync('src/shared/db/database.ts', 'utf8');

if (!content.includes('wipeDatabase')) {
  content += `\nexport function wipeDatabase(db: QuickSQLiteConnection): void {
  // Disables foreign keys temporarily to truncate all tables
  db.execute('PRAGMA foreign_keys = OFF;');
  const result = db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
  );
  if (result.rows) {
    db.execute('BEGIN');
    for (let i = 0; i < result.rows.length; i++) {
      const tableName = result.rows.item(i).name;
      db.execute(\`DELETE FROM \${tableName};\`);
    }
    db.execute('COMMIT');
  }
  db.execute('PRAGMA foreign_keys = ON;');
}
`;
  fs.writeFileSync('src/shared/db/database.ts', content);
}
