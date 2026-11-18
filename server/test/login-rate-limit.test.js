import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import bcrypt from 'bcryptjs';
import { createAdmin } from '../src/services/admins.js';
import { resetLoginRateLimiter } from '../src/services/loginRateLimit.js';
import { startTestServer } from '../test-support/testServer.js';

const ADMIN_EMAIL = 'admin-rate-limit@test.local';
const ADMIN_PASSWORD = 'PasswordRateLimit123!';
const WRONG_PASSWORD = 'PasswordSalah123!';

let server;
let baseUrl;

before(async () => {
  server = await startTestServer();
  baseUrl = server.baseUrl;

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  createAdmin({
    name: 'Admin Rate Limit',
    email: ADMIN_EMAIL,
    passwordHash,
  });
});

beforeEach(() => {
  resetLoginRateLimiter();
});

after(async () => {
  await server.close();
});

async function attemptLogin(password, email = ADMIN_EMAIL) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json();

  return {
    response,
    body,
    setCookie: response.headers.get('set-cookie'),
  };
}

test('login dibatasi setelah lima kegagalan dan mengirim Retry-After', async () => {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const result = await attemptLogin(WRONG_PASSWORD);

    assert.equal(result.response.status, 401, `percobaan ke-${attempt}`);
    assert.equal(result.body.message, 'Email atau password salah');
  }

  const blocked = await attemptLogin(WRONG_PASSWORD);

  assert.equal(blocked.response.status, 429);
  assert.match(blocked.body.message, /^Terlalu banyak percobaan login/);
  assert.equal(blocked.setCookie, null);
  assert.equal(blocked.response.headers.get('cache-control'), 'no-store');

  const retryAfter = Number(blocked.response.headers.get('retry-after'));
  assert.ok(Number.isInteger(retryAfter));
  assert.ok(retryAfter >= 1 && retryAfter <= 15 * 60);

  const correctWhileBlocked = await attemptLogin(ADMIN_PASSWORD);
  assert.equal(correctWhileBlocked.response.status, 429);
  assert.equal(correctWhileBlocked.setCookie, null);

  resetLoginRateLimiter();

  const allowed = await attemptLogin(ADMIN_PASSWORD);
  assert.equal(allowed.response.status, 200);
  assert.match(allowed.setCookie, /^mini_cms_session=/);
});

test('login berhasil mereset hitungan kegagalan', async () => {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const result = await attemptLogin(WRONG_PASSWORD);
    assert.equal(result.response.status, 401);
  }

  const success = await attemptLogin(ADMIN_PASSWORD);
  assert.equal(success.response.status, 200);

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const result = await attemptLogin(WRONG_PASSWORD);
    assert.equal(result.response.status, 401, `percobaan setelah reset ke-${attempt}`);
  }

  const blocked = await attemptLogin(WRONG_PASSWORD);
  assert.equal(blocked.response.status, 429);

  const otherEmail = await attemptLogin(WRONG_PASSWORD, 'lain@test.local');
  assert.equal(otherEmail.response.status, 401);
});
