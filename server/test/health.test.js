import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import { closeDatabase, getDatabase, pingDatabase } from '../src/db/index.js';

let server;
let baseUrl;

before(async () => {
  server = createApp().listen(0, '127.0.0.1');

  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  closeDatabase();
});

test('pengujian memakai database in-memory', () => {
  assert.equal(env.databasePath, ':memory:');
});

test('database dapat diakses', () => {
  assert.equal(pingDatabase(), true);
});

test('koneksi database memakai foreign key dan busy timeout', () => {
  const database = getDatabase();

  assert.equal(database.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
  assert.equal(database.prepare('PRAGMA busy_timeout').get().timeout, 5000);
});

test('GET /api/health mengembalikan status server dan database', async () => {
  const response = await fetch(`${baseUrl}/api/health`);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(response.headers.get('x-powered-by'), null);

  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.status, 'ok');
  assert.equal(body.data.database, 'ok');
  assert.equal(body.message, 'Server dan database berjalan dengan baik');
  assert.ok(!Number.isNaN(Date.parse(body.data.timestamp)));
});

test('endpoint API yang tidak dikenal mengembalikan 404 JSON', async () => {
  const response = await fetch(`${baseUrl}/api/tidak-ada`);

  assert.equal(response.status, 404);

  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.message, 'Endpoint API tidak ditemukan');
});

test('body JSON tidak valid mengembalikan 400', async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{',
  });

  assert.equal(response.status, 400);

  const body = await response.json();
  assert.equal(body.success, false);
  assert.match(body.message, /JSON/);
});
