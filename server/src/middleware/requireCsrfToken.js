import { timingSafeEqual } from 'node:crypto';
import { sendError } from '../utils/http.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function tokensMatch(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string') {
    return false;
  }

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export function requireCsrfToken(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const provided = req.get('x-csrf-token');
  const expected = req.session?.csrfToken;

  if (!tokensMatch(provided, expected)) {
    sendError(res, 403, 'Token CSRF tidak valid');
    return;
  }

  next();
}
