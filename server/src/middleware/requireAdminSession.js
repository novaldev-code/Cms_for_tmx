import {
  clearSessionCookie,
  SESSION_COOKIE_NAME,
} from '../config/session.js';
import { getSessionByToken } from '../services/sessions.js';
import { sendError } from '../utils/http.js';

export function requireAdminSession(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token) {
    sendError(res, 401, 'Autentikasi diperlukan');
    return;
  }

  const session = getSessionByToken(token);

  if (!session) {
    clearSessionCookie(res);
    sendError(res, 401, 'Autentikasi diperlukan');
    return;
  }

  req.admin = session.admin;
  req.session = {
    id: session.id,
    csrfToken: session.csrfToken,
  };

  next();
}
