import bcrypt from 'bcryptjs';
import { z } from 'zod';
import '../src/config/env.js';
import { closeDatabase } from '../src/db/index.js';
import { runMigrations } from '../src/db/migrate.js';
import { createAdmin, findAdminByEmail } from '../src/services/admins.js';

const seedSchema = z.object({
  ADMIN_NAME: z
    .string({ error: 'ADMIN_NAME wajib diisi' })
    .trim()
    .min(1, 'ADMIN_NAME wajib diisi')
    .max(100, 'ADMIN_NAME maksimal 100 karakter'),
  ADMIN_EMAIL: z
    .string({ error: 'ADMIN_EMAIL wajib diisi' })
    .trim()
    .toLowerCase()
    .max(254, 'ADMIN_EMAIL maksimal 254 karakter')
    .email('ADMIN_EMAIL tidak valid'),
  ADMIN_PASSWORD: z
    .string({ error: 'ADMIN_PASSWORD wajib diisi' })
    .min(12, 'ADMIN_PASSWORD minimal 12 karakter')
    .max(200, 'ADMIN_PASSWORD maksimal 200 karakter'),
});

const parsed = seedSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Konfigurasi seed admin tidak valid:');

  for (const issue of parsed.error.issues) {
    console.error(`- ${issue.path.join('.') || 'environment'}: ${issue.message}`);
  }

  process.exitCode = 1;
} else {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = parsed.data;

  try {
    runMigrations();

    const existing = findAdminByEmail(ADMIN_EMAIL);

    if (existing) {
      console.log(`Admin dengan email ${ADMIN_EMAIL} sudah ada. Seed dilewati.`);
    } else {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      const admin = createAdmin({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash,
      });

      console.log(`Admin berhasil dibuat: ${admin.email} (${admin.name})`);
    }
  } catch (error) {
    console.error(`Seed admin gagal: ${error.message}`);
    process.exitCode = 1;
  } finally {
    closeDatabase();
  }
}
