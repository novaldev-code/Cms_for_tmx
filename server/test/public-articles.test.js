import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createArticle } from '../src/services/articles.js';
import { startTestServer } from '../test-support/testServer.js';

let server;
let baseUrl;

before(async () => {
  server = await startTestServer();
  baseUrl = server.baseUrl;

  createArticle({
    title: 'Artikel Alpha',
    slug: 'artikel-alpha',
    excerpt: 'Ringkasan artikel alpha.',
    content: 'Isi lengkap artikel alpha.',
    cover_image_url: 'https://example.com/alpha.jpg',
    status: 'published',
  });

  createArticle({
    title: 'Artikel Beta',
    slug: 'artikel-beta',
    excerpt: 'Ringkasan artikel beta.',
    content: 'Isi lengkap artikel beta.',
    status: 'published',
  });

  createArticle({
    title: 'Artikel Gamma',
    slug: 'artikel-gamma',
    excerpt: null,
    content: 'Isi lengkap artikel gamma.',
    status: 'published',
  });

  createArticle({
    title: 'Artikel Draft Rahasia',
    slug: 'artikel-draft-rahasia',
    excerpt: 'Tidak boleh terlihat publik.',
    content: 'Konten draft.',
    status: 'draft',
  });
});

after(async () => {
  await server.close();
});

test('GET /api/articles hanya mengembalikan artikel published', async () => {
  const response = await fetch(`${baseUrl}/api/articles`);
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.pagination.page, 1);
  assert.equal(body.data.pagination.limit, 6);
  assert.equal(body.data.pagination.total, 3);
  assert.equal(body.data.pagination.total_pages, 1);
  assert.equal(body.data.items.length, 3);

  const slugs = body.data.items.map((item) => item.slug);
  assert.ok(slugs.includes('artikel-alpha'));
  assert.ok(slugs.includes('artikel-beta'));
  assert.ok(slugs.includes('artikel-gamma'));
  assert.ok(!slugs.includes('artikel-draft-rahasia'));

  for (const item of body.data.items) {
    assert.equal(typeof item.title, 'string');
    assert.equal(typeof item.published_at, 'string');
    assert.ok(!('status' in item));
    assert.ok(!('content' in item));
  }

  const alpha = body.data.items.find((item) => item.slug === 'artikel-alpha');
  assert.equal(alpha.excerpt, 'Ringkasan artikel alpha.');
  assert.equal(alpha.cover_image_url, 'https://example.com/alpha.jpg');
});

test('GET /api/articles mendukung pagination', async () => {
  const secondPage = await fetch(`${baseUrl}/api/articles?page=2&limit=2`);
  assert.equal(secondPage.status, 200);

  const secondBody = await secondPage.json();
  assert.equal(secondBody.data.items.length, 1);
  assert.equal(secondBody.data.pagination.page, 2);
  assert.equal(secondBody.data.pagination.limit, 2);
  assert.equal(secondBody.data.pagination.total, 3);
  assert.equal(secondBody.data.pagination.total_pages, 2);

  const emptyPage = await fetch(`${baseUrl}/api/articles?page=3&limit=2`);
  assert.equal(emptyPage.status, 200);

  const emptyBody = await emptyPage.json();
  assert.deepEqual(emptyBody.data.items, []);
  assert.equal(emptyBody.data.pagination.total, 3);
});

test('GET /api/articles menolak parameter pagination tidak valid', async () => {
  const invalidPage = await fetch(`${baseUrl}/api/articles?page=0`);
  assert.equal(invalidPage.status, 400);

  const pageBody = await invalidPage.json();
  assert.equal(pageBody.success, false);
  assert.ok(pageBody.errors.page);

  const invalidLimit = await fetch(`${baseUrl}/api/articles?limit=99`);
  assert.equal(invalidLimit.status, 400);

  const limitBody = await invalidLimit.json();
  assert.equal(limitBody.success, false);
  assert.ok(limitBody.errors.limit);
});

test('GET /api/articles/:slug hanya membuka artikel published', async () => {
  const published = await fetch(`${baseUrl}/api/articles/artikel-alpha`);
  assert.equal(published.status, 200);

  const publishedBody = await published.json();
  assert.equal(publishedBody.success, true);
  assert.equal(publishedBody.data.slug, 'artikel-alpha');
  assert.equal(publishedBody.data.content, 'Isi lengkap artikel alpha.');

  const draft = await fetch(`${baseUrl}/api/articles/artikel-draft-rahasia`);
  assert.equal(draft.status, 404);

  const draftBody = await draft.json();
  assert.equal(draftBody.success, false);
  assert.equal(draftBody.message, 'Artikel tidak ditemukan');

  const missing = await fetch(`${baseUrl}/api/articles/tidak-ada`);
  assert.equal(missing.status, 404);
});

test('GET /api/site mengembalikan informasi dasar situs', async () => {
  const response = await fetch(`${baseUrl}/api/site`);
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.name, 'Mini CMS');
  assert.equal(typeof body.data.description, 'string');
});
