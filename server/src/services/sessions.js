import { createHash, randomBytes } from 'node:crypto';
import { SESSION_TTL_MS } from '../config/session.js';
import { getDatabase } from '../db/index.js';

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function createSession(adminId) {
  const database = getDatabase();
  const token = randomBytes(32).toString('base64url');
  const csrfToken = randomBytes(32).toString('base64url');
  const now = new Date();
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();

  database
    .prepare('DELETE FROM sessions WHERE expires_at <= ?')
    .run(createdAt);

  database
    .prepare(`
      INSERT INTO sessions (admin_id, token_hash, csrf_token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(adminId, hashToken(token), csrfToken, expiresAt, createdAt);

  return { token, csrfToken, expiresAt };
}

export function getSessionByToken(token) {
  if (typeof token !== 'string' || token.length < 20 || token.length > 200) {
    return null;
  }

  const row = getDatabase()
    .prepare(`
      SELECT
        s.id AS session_id,
        s.csrf_token,
        a.id,
        a.name,
        a.email
      FROM sessions s
      JOIN admins a ON a.id = s.admin_id
      WHERE s.token_hash = ? AND s.expires_at > ?
    `)
    .get(hashToken(token), new Date().toISOString());

  if (!row) {
    return null;
  }

  return {
    id: row.session_id,
    csrfToken: row.csrf_token,
    admin: {
      id: row.id,
      name: row.name,
      email: row.email,
    },
  };
}

export function deleteSessionById(id) {
  getDatabase().prepare('DELETE FROM sessions WHERE id = ?').run(id);
}
