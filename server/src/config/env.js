import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const configDir = path.dirname(fileURLToPath(import.meta.url));

export const serverRoot = path.resolve(configDir, '../..');
export const projectRoot = path.resolve(serverRoot, '..');

dotenv.config({
  path: path.join(projectRoot, '.env'),
  quiet: true,
});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  SITE_NAME: z.string().trim().min(1).default('Mini CMS'),
  DATABASE_PATH: z.string().trim().optional(),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(720).default(168),
  COOKIE_SECURE: z.enum(['true', 'false']).optional(),
  TRUST_PROXY: z.enum(['true', 'false']).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Konfigurasi environment tidak valid:');
  for (const issue of parsed.error.issues) {
    console.error(`- ${issue.path.join('.') || 'environment'}: ${issue.message}`);
  }
  process.exit(1);
}

function resolveDatabasePath(value) {
  if (value === ':memory:') {
    return value;
  }

  if (!value) {
    return path.join(serverRoot, 'data', 'mini-cms.db');
  }

  return path.resolve(projectRoot, value);
}

export const env = Object.freeze({
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  siteName: parsed.data.SITE_NAME,
  databasePath: resolveDatabasePath(parsed.data.DATABASE_PATH),
  sessionTtlHours: parsed.data.SESSION_TTL_HOURS,
  cookieSecure:
    parsed.data.COOKIE_SECURE === undefined
      ? parsed.data.NODE_ENV === 'production'
      : parsed.data.COOKIE_SECURE === 'true',
  trustProxy: parsed.data.TRUST_PROXY === 'true',
  projectRoot,
  serverRoot,
  isProduction: parsed.data.NODE_ENV === 'production',
});
