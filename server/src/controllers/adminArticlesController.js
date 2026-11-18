import {
  createArticle,
  deleteArticle,
  getAdminArticleById,
  getDashboardData,
  listAdminArticles,
  updateArticle,
} from '../services/articles.js';
import { ApiError, sendSuccess } from '../utils/http.js';
import { parseInput } from '../utils/validation.js';
import {
  adminArticlesQuerySchema,
  articleIdParamsSchema,
  createArticleSchema,
  updateArticleSchema,
} from '../validators/articles.js';

export function getDashboard(req, res) {
  const data = getDashboardData();
  sendSuccess(res, data, 'Statistik dashboard berhasil diambil');
}

export function listArticles(req, res) {
  const query = parseInput(
    adminArticlesQuerySchema,
    req.query,
    'Parameter daftar artikel tidak valid',
  );
  const result = listAdminArticles(query);

  sendSuccess(res, result, 'Daftar artikel berhasil diambil');
}

export function getArticle(req, res) {
  const { id } = parseInput(
    articleIdParamsSchema,
    req.params,
    'ID artikel tidak valid',
  );
  const article = getAdminArticleById(id);

  if (!article) {
    throw new ApiError(404, 'Artikel tidak ditemukan');
  }

  sendSuccess(res, article, 'Detail artikel berhasil diambil');
}

export function createArticleHandler(req, res) {
  const input = parseInput(createArticleSchema, req.body);
  const article = createArticle(input);

  sendSuccess(res, article, 'Artikel berhasil dibuat', 201);
}

export function updateArticleHandler(req, res) {
  const { id } = parseInput(
    articleIdParamsSchema,
    req.params,
    'ID artikel tidak valid',
  );
  const input = parseInput(updateArticleSchema, req.body);
  const article = updateArticle(id, input);

  sendSuccess(res, article, 'Artikel berhasil diperbarui');
}

export function deleteArticleHandler(req, res) {
  const { id } = parseInput(
    articleIdParamsSchema,
    req.params,
    'ID artikel tidak valid',
  );

  deleteArticle(id);
  sendSuccess(res, null, 'Artikel berhasil dihapus');
}
