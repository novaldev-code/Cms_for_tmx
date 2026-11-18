import { Router } from 'express';
import {
  createArticleHandler,
  deleteArticleHandler,
  getArticle,
  getDashboard,
  listArticles,
  updateArticleHandler,
} from '../controllers/adminArticlesController.js';
import { requireCsrfToken } from '../middleware/requireCsrfToken.js';

export function createAdminRouter({ guard }) {
  const router = Router();

  router.use(guard);
  router.use(requireCsrfToken);

  router.get('/dashboard', getDashboard);

  router.get('/articles', listArticles);
  router.post('/articles', createArticleHandler);
  router.get('/articles/:id', getArticle);
  router.put('/articles/:id', updateArticleHandler);
  router.delete('/articles/:id', deleteArticleHandler);

  return router;
}
