import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { env } from '../config/env.js';

let database = null;

function openDatabase() {
  if (env.databasePath !== ':memory:') {
    fs.mkdirSync(path.dirname(env.databasePath), { recursive: true });
  }

  const connection = new DatabaseSync(env.databasePath);

  connection.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
  `);

  return connection;
}

export function getDatabase() {
  if (!database) {
    database = openDatabase();
  }

  return database;
}

export function pingDatabase() {
  const row = getDatabase().prepare('SELECT 1 AS ok').get();
  return row?.ok === 1;
}

export function closeDatabase() {
  if (!database) {
    return;
  }

  database.close();
  database = null;
}
