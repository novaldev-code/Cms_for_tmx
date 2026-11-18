import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { startTestServer } from '../test-support/testServer.js';

let server;
let baseUrl;

before(async () => {
  server = await startTestServer();
  baseUrl = server.baseUrl;
});

after(async () => {
  await server.close();
});

test('seluruh endpoint admin menolak akses tanpa sesi', async () => {
  const cases = [
    ['GET', '/api/admin/dashboard'],
    ['GET', '/api/admin/articles'],
    ['POST', '/api/admin/articles'],
    ['GET', '/api/admin/articles/1'],
    ['PUT', '/api/admin/articles/1'],
    ['DELETE', '/api/admin/articles/1'],
  ];

  for (const [method, path] of cases) {
    const options = { method };

    if (method === 'POST' || method === 'PUT') {
      options.headers = { 'content-type': 'application/json' };
      options.body = JSON.stringify({});
    }

    const response = await fetch(`${baseUrl}${path}`, options);
    assert.equal(response.status, 401, `${method} ${path}`);

    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.message, 'Autentikasi diperlukan');
    assert.deepEqual(body.errors, {});
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
});

test('endpoint publik tetap dapat diakses tanpa sesi', async () => {
  const response = await fetch(`${baseUrl}/api/articles`);
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.success, true);
  assert.deepEqual(body.data.items, []);
});
