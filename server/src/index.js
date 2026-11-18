import { createApp } from './app.js';
import { env } from './config/env.js';
import { closeDatabase } from './db/index.js';
import { runMigrations } from './db/migrate.js';

try {
  const applied = runMigrations();

  if (applied.length > 0) {
    console.log(`[server] Migration diterapkan: ${applied.join(', ')}`);
  }
} catch (error) {
  console.error('[server] Gagal menyiapkan database:', error.message);
  closeDatabase();
  process.exit(1);
}

const app = createApp();
const server = app.listen(env.port, '127.0.0.1', () => {
  console.log(`[server] ${env.siteName} API berjalan di http://127.0.0.1:${env.port}`);
  console.log(`[server] Database: ${env.databasePath}`);
});

server.on('error', (error) => {
  console.error('[server] Gagal menjalankan server:', error.message);
  closeDatabase();
  process.exitCode = 1;
});

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`[server] ${signal} diterima, menutup server...`);

  const forceExit = setTimeout(() => {
    console.error('[server] Penutupan server melewati batas waktu.');
    closeDatabase();
    process.exit(1);
  }, 5000);
  forceExit.unref();

  server.close(() => {
    clearTimeout(forceExit);
    closeDatabase();
    process.exit(0);
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
