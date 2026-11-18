import { createApp } from '../src/app.js';
import { closeDatabase } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrate.js';

export const TEST_CSRF_TOKEN = 'test-csrf-token';

export function allowAllAdmin(req, res, next) {
  req.admin = {
    id: 1,
    name: 'Admin Pengujian',
    email: 'admin@test.local',
  };
  req.session = {
    id: 1,
    csrfToken: TEST_CSRF_TOKEN,
  };
  next();
}

export async function startTestServer(options = {}) {
  runMigrations();

  const app = createApp(options);
  const server = app.listen(0, '127.0.0.1');

  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    async close() {
      if (server.listening) {
        await new Promise((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        });
      }

      closeDatabase();
    },
  };
}
