import { Router } from 'express';
import { login, logout, me } from '../controllers/authController.js';
import { requireAdminSession } from '../middleware/requireAdminSession.js';
import { requireCsrfToken } from '../middleware/requireCsrfToken.js';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/me', requireAdminSession, me);
authRouter.post('/logout', requireAdminSession, requireCsrfToken, logout);
