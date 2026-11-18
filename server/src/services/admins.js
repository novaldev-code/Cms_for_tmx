import { getDatabase } from '../db/index.js';

export function findAdminByEmail(email) {
  return getDatabase()
    .prepare('SELECT id, name, email, password_hash FROM admins WHERE email = ?')
    .get(email);
}

export function createAdmin({ name, email, passwordHash }) {
  const now = new Date().toISOString();
  const result = getDatabase()
    .prepare(`
      INSERT INTO admins (name, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(name, email, passwordHash, now, now);

  return {
    id: Number(result.lastInsertRowid),
    name,
    email,
  };
}

export function toPublicAdmin(admin) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
  };
}
