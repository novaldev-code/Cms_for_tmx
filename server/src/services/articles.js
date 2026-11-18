import { getDatabase } from '../db/index.js';
import { ApiError } from '../utils/http.js';
import { createSlug } from '../utils/slug.js';

const ARTICLE_SUMMARY_COLUMNS = `
  id, title, slug, excerpt, cover_image_url, status,
  published_at, created_at, updated_at
`;

const ARTICLE_DETAIL_COLUMNS = `
  id, title, slug, excerpt, content, cover_image_url, status,
  published_at, created_at, updated_at
`;

function mapPublicArticle(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    cover_image_url: row.cover_image_url,
    published_at: row.published_at,
  };
}

function mapPublicArticleDetail(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    cover_image_url: row.cover_image_url,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapAdminArticle(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    cover_image_url: row.cover_image_url,
    status: row.status,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapAdminArticleDetail(row) {
  return {
    ...mapAdminArticle(row),
    content: row.content,
  };
}

function buildPagination(total, page, limit) {
  return {
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
  };
}

function escapeLike(value) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function isSlugConflict(error) {
  return (
    typeof error?.message === 'string' &&
    error.message.includes('UNIQUE constraint failed: articles.slug')
  );
}

function duplicateSlugError() {
  return new ApiError(400, 'Slug sudah digunakan', {
    slug: 'Slug sudah digunakan oleh artikel lain',
  });
}

function normalizeSlug(value, fallbackTitle) {
  const slug = createSlug(value || fallbackTitle);

  if (!slug) {
    throw new ApiError(400, 'Slug tidak valid', {
      slug: 'Slug tidak dapat dibuat. Silakan isi slug secara manual.',
    });
  }

  return slug;
}

function ensureSlugAvailable(slug, excludeId = null) {
  const database = getDatabase();
  const existing = excludeId
    ? database
        .prepare('SELECT id FROM articles WHERE slug = ? AND id <> ?')
        .get(slug, excludeId)
    : database.prepare('SELECT id FROM articles WHERE slug = ?').get(slug);

  if (existing) {
    throw duplicateSlugError();
  }
}

function getArticleRowById(id) {
  return getDatabase()
    .prepare(`SELECT ${ARTICLE_DETAIL_COLUMNS} FROM articles WHERE id = ?`)
    .get(id);
}

export function listPublishedArticles({ page, limit }) {
  const database = getDatabase();
  const offset = (page - 1) * limit;
  const { total } = database
    .prepare("SELECT COUNT(*) AS total FROM articles WHERE status = 'published'")
    .get();

  const rows = database
    .prepare(`
      SELECT id, title, slug, excerpt, cover_image_url, published_at
      FROM articles
      WHERE status = 'published'
      ORDER BY published_at DESC, id DESC
      LIMIT ? OFFSET ?
    `)
    .all(limit, offset);

  return {
    items: rows.map(mapPublicArticle),
    pagination: buildPagination(Number(total), page, limit),
  };
}

export function getPublishedArticleBySlug(slug) {
  const row = getDatabase()
    .prepare(`
      SELECT ${ARTICLE_DETAIL_COLUMNS}
      FROM articles
      WHERE slug = ? AND status = 'published'
    `)
    .get(slug);

  return row ? mapPublicArticleDetail(row) : null;
}

export function listAdminArticles({ page, limit, q, status }) {
  const database = getDatabase();
  const conditions = [];
  const parameters = [];

  if (status) {
    conditions.push('status = ?');
    parameters.push(status);
  }

  if (q) {
    conditions.push("title LIKE ? ESCAPE '\\'");
    parameters.push(`%${escapeLike(q)}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const { total } = database
    .prepare(`SELECT COUNT(*) AS total FROM articles ${whereClause}`)
    .get(...parameters);

  const rows = database
    .prepare(`
      SELECT ${ARTICLE_SUMMARY_COLUMNS}
      FROM articles
      ${whereClause}
      ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?
    `)
    .all(...parameters, limit, offset);

  return {
    items: rows.map(mapAdminArticle),
    pagination: buildPagination(Number(total), page, limit),
  };
}

export function getAdminArticleById(id) {
  const row = getArticleRowById(id);
  return row ? mapAdminArticleDetail(row) : null;
}

export function createArticle(input) {
  const database = getDatabase();
  const slug = normalizeSlug(input.slug, input.title);
  ensureSlugAvailable(slug);

  const now = new Date().toISOString();
  const status = input.status ?? 'draft';
  const publishedAt = status === 'published' ? now : null;

  try {
    const result = database
      .prepare(`
        INSERT INTO articles (
          title, slug, excerpt, content, cover_image_url,
          status, published_at, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        input.title,
        slug,
        input.excerpt ?? null,
        input.content,
        input.cover_image_url ?? null,
        status,
        publishedAt,
        now,
        now,
      );

    return getAdminArticleById(Number(result.lastInsertRowid));
  } catch (error) {
    if (isSlugConflict(error)) {
      throw duplicateSlugError();
    }

    throw error;
  }
}

export function updateArticle(id, input) {
  const database = getDatabase();
  const existing = getArticleRowById(id);

  if (!existing) {
    throw new ApiError(404, 'Artikel tidak ditemukan');
  }

  const slug =
    input.slug === undefined
      ? existing.slug
      : normalizeSlug(input.slug, input.title);

  ensureSlugAvailable(slug, id);

  const now = new Date().toISOString();
  const status = input.status ?? existing.status;
  let publishedAt = existing.published_at;

  if (status === 'draft') {
    publishedAt = null;
  } else if (!publishedAt) {
    publishedAt = now;
  }

  try {
    database
      .prepare(`
        UPDATE articles
        SET title = ?,
            slug = ?,
            excerpt = ?,
            content = ?,
            cover_image_url = ?,
            status = ?,
            published_at = ?,
            updated_at = ?
        WHERE id = ?
      `)
      .run(
        input.title,
        slug,
        input.excerpt ?? null,
        input.content,
        input.cover_image_url ?? null,
        status,
        publishedAt,
        now,
        id,
      );

    return getAdminArticleById(id);
  } catch (error) {
    if (isSlugConflict(error)) {
      throw duplicateSlugError();
    }

    throw error;
  }
}

export function deleteArticle(id) {
  const result = getDatabase()
    .prepare('DELETE FROM articles WHERE id = ?')
    .run(id);

  if (result.changes === 0) {
    throw new ApiError(404, 'Artikel tidak ditemukan');
  }
}

export function getDashboardData() {
  const database = getDatabase();
  const stats = database
    .prepare(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END), 0) AS published,
        COALESCE(SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END), 0) AS draft
      FROM articles
    `)
    .get();

  const latestArticles = database
    .prepare(`
      SELECT ${ARTICLE_SUMMARY_COLUMNS}
      FROM articles
      ORDER BY created_at DESC, id DESC
      LIMIT 5
    `)
    .all();

  return {
    stats: {
      total: Number(stats.total),
      published: Number(stats.published),
      draft: Number(stats.draft),
    },
    latest_articles: latestArticles.map(mapAdminArticle),
  };
}
