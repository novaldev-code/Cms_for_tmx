import assert from 'node:assert/strict';
import { test } from 'node:test';
import { closeDatabase, getDatabase } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrate.js';

test('migration berjalan, membuat tabel, dan idempoten', () => {
  try {
    const firstRun = runMigrations();

    assert.ok(firstRun.includes('001_initial.sql'));
    assert.ok(firstRun.includes('002_sessions.sql'));

    const secondRun = runMigrations();
    assert.deepEqual(secondRun, []);

    const database = getDatabase();
    const tables = database
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((row) => row.name);

    assert.ok(tables.includes('admins'));
    assert.ok(tables.includes('articles'));
    assert.ok(tables.includes('sessions'));
    assert.ok(tables.includes('schema_migrations'));

    const indexes = database
      .prepare("SELECT name FROM sqlite_master WHERE type = 'index' ORDER BY name")
      .all()
      .map((row) => row.name);

    assert.ok(indexes.includes('idx_articles_status_published_at'));
    assert.ok(indexes.includes('idx_articles_created_at'));
    assert.ok(indexes.includes('idx_sessions_expires_at'));

    const { total } = database
      .prepare('SELECT COUNT(*) AS total FROM schema_migrations')
      .get();

    assert.equal(total, firstRun.length);
  } finally {
    closeDatabase();
  }
});
