import { env } from '../src/config/env.js';
import { closeDatabase } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrate.js';

try {
  const applied = runMigrations();

  if (applied.length === 0) {
    console.log('Tidak ada migration baru.');
  } else {
    console.log(`Migration diterapkan: ${applied.join(', ')}`);
  }

  console.log(`Database: ${env.databasePath}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  closeDatabase();
}
