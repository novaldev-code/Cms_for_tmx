import cookieParser from 'cookie-parser';
import express from 'express';
import { env } from './config/env.js';
import { pingDatabase } from './db/index.js';
import { requireAdminSession } from './middleware/requireAdminSession.js';
import { createAdminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { publicArticlesRouter } from './routes/publicArticles.js';
import { siteRouter } from './routes/site.js';
import { ApiError, sendError, sendSuccess } from './utils/http.js';

export function createApp({ adminGuard = requireAdminSession } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.trustProxy);
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');

    if (
      req.path.startsWith('/api/auth') ||
      req.path.startsWith('/api/admin')
    ) {
      res.setHeader('Cache-Control', 'no-store');
    }

    next();
  });
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/api/health', (req, res) => {
    let databaseOk = false;

    try {
      databaseOk = pingDatabase();
    } catch (error) {
      console.error('[api] Pemeriksaan database gagal:', error);
    }

    if (!databaseOk) {
      sendError(res, 503, 'Database tidak dapat diakses', {
        database: 'Database tidak dapat diakses',
      });
      return;
    }

    sendSuccess(
      res,
      {
        status: 'ok',
        database: 'ok',
        site: env.siteName,
        environment: env.nodeEnv,
        timestamp: new Date().toISOString(),
      },
      'Server dan database berjalan dengan baik',
    );
  });

  app.use('/api/site', siteRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/articles', publicArticlesRouter);
  app.use('/api/admin', createAdminRouter({ guard: adminGuard }));

  app.use('/api', (req, res) => {
    sendError(res, 404, 'Endpoint API tidak ditemukan');
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    if (error instanceof ApiError) {
      sendError(res, error.status, error.message, error.errors);
      return;
    }

    let status = 500;
    let message = 'Terjadi kesalahan pada server';

    if (error.type === 'entity.parse.failed') {
      status = 400;
      message = 'Body permintaan harus berupa JSON yang valid';
    } else if (error.type === 'entity.too.large') {
      status = 413;
      message = 'Ukuran permintaan terlalu besar';
    } else if (
      Number.isInteger(error.status) &&
      error.status >= 400 &&
      error.status < 600
    ) {
      status = error.status;
      message = 'Permintaan tidak valid';
    }

    if (status >= 500) {
      console.error('[api] Kesalahan tidak tertangani:', error);
    }

    sendError(res, status, message);
  });

  return app;
}
