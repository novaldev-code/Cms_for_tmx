import {
  getPublishedArticleBySlug,
  listPublishedArticles,
} from '../services/articles.js';
import { ApiError, sendSuccess } from '../utils/http.js';
import { parseInput } from '../utils/validation.js';
import {
  articleSlugParamsSchema,
  publicArticlesQuerySchema,
} from '../validators/articles.js';

export function listPublicArticles(req, res) {
  const query = parseInput(
    publicArticlesQuerySchema,
    req.query,
    'Parameter daftar artikel tidak valid',
  );
  const result = listPublishedArticles(query);

  sendSuccess(res, result, 'Daftar artikel berhasil diambil');
}

export function getPublicArticle(req, res) {
  const { slug } = parseInput(
    articleSlugParamsSchema,
    req.params,
    'Slug artikel tidak valid',
  );
  const article = getPublishedArticleBySlug(slug);

  if (!article) {
    throw new ApiError(404, 'Artikel tidak ditemukan');
  }

  sendSuccess(res, article, 'Detail artikel berhasil diambil');
}
