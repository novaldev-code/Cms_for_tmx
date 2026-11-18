import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../src/db/index.js';
import { createAdmin } from '../src/services/admins.js';
import { startTestServer } from '../test-support/testServer.js';

const ADMIN_EMAIL = 'admin@test.local';
const ADMIN_PASSWORD = 'PasswordUji123!';

let server;
let baseUrl;

before(async () => {
  server = await startTestServer();
  baseUrl = server.baseUrl;

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  createAdmin({
    name: 'Admin Pengujian',
    email: ADMIN_EMAIL,
    passwordHash,
  });
});

after(async () => {
  await server.close();
});

async function postJson(path, body, headers = {}) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

async function login(email = ADMIN_EMAIL, password = ADMIN_PASSWORD) {
  const response = await postJson('/api/auth/login', { email, password });
  const body = await response.json();
  const setCookie = response.headers.get('set-cookie');
  const cookie = setCookie ? setCookie.split(';')[0] : null;

  return { response, body, setCookie, cookie };
}

function sessionTokenFromCookie(cookie) {
  return cookie.slice(cookie.indexOf('=') + 1);
}

test('password admin disimpan sebagai hash bcrypt', () => {
  const admin = getDatabase()
    .prepare('SELECT password_hash FROM admins WHERE email = ?')
    .get(ADMIN_EMAIL);

  assert.ok(admin);
  assert.match(admin.password_hash, /^\$2[aby]\$/);
  assert.notEqual(admin.password_hash, ADMIN_PASSWORD);
});

test('login menolak input tidak valid dan kredensial salah secara generik', async () => {
  const empty = await postJson('/api/auth/login', {});
  assert.equal(empty.status, 400);

  const emptyBody = await empty.json();
  assert.ok(emptyBody.errors.email);
  assert.ok(emptyBody.errors.password);

  const invalidEmail = await postJson('/api/auth/login', {
    email: 'bukan-email',
    password: 'apapun',
  });
  assert.equal(invalidEmail.status, 400);

  const invalidEmailBody = await invalidEmail.json();
  assert.ok(invalidEmailBody.errors.email);

  const unknownEmail = await login('tidak-ada@test.local', ADMIN_PASSWORD);
  assert.equal(unknownEmail.response.status, 401);
  assert.equal(unknownEmail.body.message, 'Email atau password salah');
  assert.equal(unknownEmail.setCookie, null);
  assert.equal(unknownEmail.response.headers.get('cache-control'), 'no-store');

  const wrongPassword = await login(ADMIN_EMAIL, 'PasswordSalah123!');
  assert.equal(wrongPassword.response.status, 401);
  assert.equal(wrongPassword.body.message, unknownEmail.body.message);
  assert.equal(wrongPassword.setCookie, null);
  assert.equal(wrongPassword.response.headers.get('cache-control'), 'no-store');

  const malformed = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{',
  });
  assert.equal(malformed.status, 400);
  assert.equal(malformed.headers.get('cache-control'), 'no-store');
});

test('login berhasil membuat sesi HttpOnly dan melindungi endpoint admin', async () => {
  const result = await login();
  assert.equal(result.response.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(result.body.data.admin.email, ADMIN_EMAIL);
  assert.equal(result.body.data.admin.name, 'Admin Pengujian');
  assert.ok(!('password_hash' in result.body.data.admin));
  assert.equal(typeof result.body.data.csrfToken, 'string');

  assert.match(result.setCookie, /^mini_cms_session=/);
  assert.match(result.setCookie, /HttpOnly/i);
  assert.match(result.setCookie, /SameSite=Lax/i);
  assert.match(result.setCookie, /Path=\//i);
  assert.match(result.setCookie, /Max-Age=\d+/i);
  assert.doesNotMatch(result.setCookie, /;\s*Secure(?:;|$)/i);
  assert.equal(result.response.headers.get('cache-control'), 'no-store');

  const session = getDatabase()
    .prepare('SELECT token_hash, csrf_token FROM sessions ORDER BY id DESC LIMIT 1')
    .get();
  const rawToken = sessionTokenFromCookie(result.cookie);

  assert.match(session.token_hash, /^[a-f0-9]{64}$/);
  assert.notEqual(session.token_hash, rawToken);
  assert.equal(session.csrf_token, result.body.data.csrfToken);

  const me = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { cookie: result.cookie },
  });
  assert.equal(me.status, 200);
  assert.equal(me.headers.get('cache-control'), 'no-store');

  const meBody = await me.json();
  assert.equal(meBody.data.admin.email, ADMIN_EMAIL);
  assert.equal(meBody.data.csrfToken, result.body.data.csrfToken);

  const dashboard = await fetch(`${baseUrl}/api/admin/dashboard`, {
    headers: { cookie: result.cookie },
  });
  assert.equal(dashboard.status, 200);

  const invalidSession = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { cookie: 'mini_cms_session=token-tidak-valid' },
  });
  assert.equal(invalidSession.status, 401);

  const invalidBody = await invalidSession.json();
  assert.equal(invalidBody.message, 'Autentikasi diperlukan');
  assert.match(invalidSession.headers.get('set-cookie'), /mini_cms_session=;/);
});

test('mutasi admin dan logout mewajibkan token CSRF', async () => {
  const result = await login();
  assert.equal(result.response.status, 200);

  const payload = {
    title: 'Artikel Dengan Autentikasi',
    content: 'Isi artikel dengan autentikasi.',
    status: 'draft',
  };

  const withoutToken = await fetch(`${baseUrl}/api/admin/articles`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: result.cookie,
    },
    body: JSON.stringify(payload),
  });
  assert.equal(withoutToken.status, 403);

  const withoutTokenBody = await withoutToken.json();
  assert.equal(withoutTokenBody.message, 'Token CSRF tidak valid');

  const wrongToken = await fetch(`${baseUrl}/api/admin/articles`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: result.cookie,
      'x-csrf-token': 'token-salah',
    },
    body: JSON.stringify(payload),
  });
  assert.equal(wrongToken.status, 403);

  const withToken = await fetch(`${baseUrl}/api/admin/articles`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: result.cookie,
      'x-csrf-token': result.body.data.csrfToken,
    },
    body: JSON.stringify(payload),
  });
  assert.equal(withToken.status, 201);

  const withTokenBody = await withToken.json();
  assert.equal(withTokenBody.data.status, 'draft');

  const logoutWithoutToken = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { cookie: result.cookie },
  });
  assert.equal(logoutWithoutToken.status, 403);

  const logout = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: {
      cookie: result.cookie,
      'x-csrf-token': result.body.data.csrfToken,
    },
  });
  assert.equal(logout.status, 200);

  const logoutBody = await logout.json();
  assert.equal(logoutBody.message, 'Logout berhasil');
  assert.match(logout.headers.get('set-cookie'), /mini_cms_session=;/);

  const meAfterLogout = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { cookie: result.cookie },
  });
  assert.equal(meAfterLogout.status, 401);

  const dashboardAfterLogout = await fetch(`${baseUrl}/api/admin/dashboard`, {
    headers: { cookie: result.cookie },
  });
  assert.equal(dashboardAfterLogout.status, 401);
});

test('sesi kedaluwarsa ditolak dan sesi baru tetap dapat dibuat', async () => {
  const first = await login();
  assert.equal(first.response.status, 200);

  getDatabase()
    .prepare("UPDATE sessions SET expires_at = '2000-01-01T00:00:00.000Z'")
    .run();

  const expired = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { cookie: first.cookie },
  });
  assert.equal(expired.status, 401);

  const second = await login();
  assert.equal(second.response.status, 200);

  const active = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { cookie: second.cookie },
  });
  assert.equal(active.status, 200);

  const activeBody = await active.json();
  assert.equal(activeBody.data.admin.email, ADMIN_EMAIL);
});
