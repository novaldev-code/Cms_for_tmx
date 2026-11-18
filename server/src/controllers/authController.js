import bcrypt from 'bcryptjs';
import {
  clearSessionCookie,
  setSessionCookie,
} from '../config/session.js';
import { findAdminByEmail, toPublicAdmin } from '../services/admins.js';
import {
  buildLoginRateLimitKey,
  clearLoginFailures,
  getLoginRetryAfterMs,
  recordLoginAttempt,
} from '../services/loginRateLimit.js';
import {
  createSession,
  deleteSessionById,
} from '../services/sessions.js';
import { ApiError, sendSuccess } from '../utils/http.js';
import { parseInput } from '../utils/validation.js';
import { loginSchema } from '../validators/auth.js';

// Hash dummy agar waktu verifikasi email tidak dikenal tidak jauh berbeda.
const DUMMY_PASSWORD_HASH =
  '$2b$12$5Wuzgijw1MSe8sTxEMcnn.Nlcn6c/.CzlKZgdfNCHosl8rg5o0wbm';

export async function login(req, res) {
  const { email, password } = parseInput(loginSchema, req.body);
  const rateLimitKey = buildLoginRateLimitKey(req.ip, email);
  const retryAfterMs = getLoginRetryAfterMs(rateLimitKey);

  if (retryAfterMs > 0) {
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    const retryAfterMinutes = Math.max(1, Math.ceil(retryAfterMs / 60000));

    res.setHeader('Retry-After', String(retryAfterSeconds));
    throw new ApiError(
      429,
      `Terlalu banyak percobaan login. Coba lagi dalam ${retryAfterMinutes} menit.`,
    );
  }

  const admin = findAdminByEmail(email);
  const passwordHash = admin?.password_hash ?? DUMMY_PASSWORD_HASH;

  // Catat sebelum verifikasi agar burst paralel tetap dibatasi. Login yang
  // berhasil akan menghapus catatan percobaan untuk kombinasi ini.
  recordLoginAttempt(rateLimitKey);

  const passwordMatches = await bcrypt.compare(password, passwordHash);

  if (!admin || !passwordMatches) {
    throw new ApiError(401, 'Email atau password salah');
  }

  clearLoginFailures(rateLimitKey);

  const session = createSession(admin.id);

  setSessionCookie(res, session.token);

  sendSuccess(
    res,
    {
      admin: toPublicAdmin(admin),
      csrfToken: session.csrfToken,
    },
    'Login berhasil',
  );
}

export function logout(req, res) {
  deleteSessionById(req.session.id);
  clearSessionCookie(res);
  sendSuccess(res, null, 'Logout berhasil');
}

export function me(req, res) {
  sendSuccess(
    res,
    {
      admin: req.admin,
      csrfToken: req.session.csrfToken,
    },
    'Sesi admin aktif',
  );
}
