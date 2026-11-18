import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDatabase } from './index.js';

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'migrations',
);

export function runMigrations() {
  const database = getDatabase();

  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set(
    database
      .prepare('SELECT name FROM schema_migrations')
      .all()
      .map((row) => row.name),
  );

  const migrationFiles = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort();

  const appliedNow = [];

  for (const fileName of migrationFiles) {
    if (applied.has(fileName)) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, fileName), 'utf8');
    const appliedAt = new Date().toISOString();

    database.exec('BEGIN IMMEDIATE');

    try {
      database.exec(sql);
      database
        .prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)')
        .run(fileName, appliedAt);
      database.exec('COMMIT');
      appliedNow.push(fileName);
    } catch (error) {
      try {
        database.exec('ROLLBACK');
      } catch {
        // Abaikan kegagalan rollback agar error asli tetap dilaporkan.
      }

      throw new Error(`Migration ${fileName} gagal: ${error.message}`, {
        cause: error,
      });
    }
  }

  return appliedNow;
}
