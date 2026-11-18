import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { allowAllAdmin, startTestServer, TEST_CSRF_TOKEN } from '../test-support/testServer.js';

let server;
let baseUrl;

before(async () => {
  server = await startTestServer({ adminGuard: allowAllAdmin });
  baseUrl = server.baseUrl;
});

after(async () => {
  await server.close();
});

function request(path, { method = 'GET', body } = {}) {
  const options = {
    method,
    headers: { 'x-csrf-token': TEST_CSRF_TOKEN },
  };

  if (body !== undefined) {
    options.headers['content-type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  return fetch(`${baseUrl}${path}`, options);
}

test('POST /api/admin/articles membuat draft dengan slug otomatis', async () => {
  const response = await request('/api/admin/articles', {
    method: 'POST',
    body: {
      title: 'Panduan Menulis: Cepat & Rapi!',
      content: 'Isi panduan menulis.',
    },
  });

  assert.equal(response.status, 201);

  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.message, 'Artikel berhasil dibuat');
  assert.equal(body.data.title, 'Panduan Menulis: Cepat & Rapi!');
  assert.equal(body.data.slug, 'panduan-menulis-cepat-rapi');
  assert.equal(body.data.status, 'draft');
  assert.equal(body.data.published_at, null);
  assert.equal(body.data.excerpt, null);
  assert.equal(body.data.cover_image_url, null);
  assert.ok(body.data.id > 0);
  assert.equal(typeof body.data.created_at, 'string');
  assert.equal(typeof body.data.updated_at, 'string');
});

test('slug manual dinormalisasi dan slug duplikat ditolak', async () => {
  const manual = await request('/api/admin/articles', {
    method: 'POST',
    body: {
      title: 'Artikel Dengan Slug Manual',
      slug: '  Slug Manual Unik  ',
      content: 'Isi artikel slug manual.',
    },
  });

  assert.equal(manual.status, 201);

  const manualBody = await manual.json();
  assert.equal(manualBody.data.slug, 'slug-manual-unik');

  const duplicate = await request('/api/admin/articles', {
    method: 'POST',
    body: {
      title: 'Artikel Duplikat',
      slug: 'slug-manual-unik',
      content: 'Isi artikel duplikat.',
    },
  });

  assert.equal(duplicate.status, 400);

  const duplicateBody = await duplicate.json();
  assert.equal(duplicateBody.success, false);
  assert.equal(duplicateBody.message, 'Slug sudah digunakan');
  assert.ok(duplicateBody.errors.slug);

  const first = await request('/api/admin/articles', {
    method: 'POST',
    body: {
      title: 'Artikel Unik Pertama',
      slug: 'slug-unik-pertama',
      content: 'Isi pertama.',
    },
  });
  const firstBody = await first.json();

  const second = await request('/api/admin/articles', {
    method: 'POST',
    body: {
      title: 'Artikel Unik Kedua',
      slug: 'slug-unik-kedua',
      content: 'Isi kedua.',
    },
  });
  const secondBody = await second.json();

  const conflict = await request(`/api/admin/articles/${secondBody.data.id}`, {
    method: 'PUT',
    body: {
      title: 'Artikel Unik Kedua',
      slug: 'slug-unik-pertama',
      content: 'Isi kedua.',
      status: 'draft',
    },
  });

  assert.equal(conflict.status, 400);

  const conflictBody = await conflict.json();
  assert.ok(conflictBody.errors.slug);
  assert.ok(firstBody.data.id > 0);
});

test('validasi input dan parameter admin berjalan di backend', async () => {
  const missingFields = await request('/api/admin/articles', {
    method: 'POST',
    body: {},
  });

  assert.equal(missingFields.status, 400);

  const missingBody = await missingFields.json();
  assert.equal(missingBody.success, false);
  assert.ok(missingBody.errors.title);
  assert.ok(missingBody.errors.content);

  const invalidUrl = await request('/api/admin/articles', {
    method: 'POST',
    body: {
      title: 'Artikel URL Salah',
      content: 'Isi artikel.',
      cover_image_url: 'ftp://example.com/gambar.jpg',
    },
  });

  assert.equal(invalidUrl.status, 400);

  const invalidUrlBody = await invalidUrl.json();
  assert.ok(invalidUrlBody.errors.cover_image_url);

  const invalidStatus = await request('/api/admin/articles', {
    method: 'POST',
    body: {
      title: 'Artikel Status Salah',
      content: 'Isi artikel.',
      status: 'arsip',
    },
  });

  assert.equal(invalidStatus.status, 400);

  const invalidStatusBody = await invalidStatus.json();
  assert.ok(invalidStatusBody.errors.status);

  const invalidLimit = await request('/api/admin/articles?limit=51');
  assert.equal(invalidLimit.status, 400);

  const invalidLimitBody = await invalidLimit.json();
  assert.ok(invalidLimitBody.errors.limit);

  const invalidId = await request('/api/admin/articles/abc');
  assert.equal(invalidId.status, 400);

  const invalidIdBody = await invalidId.json();
  assert.ok(invalidIdBody.errors.id);

  const missingUpdate = await request('/api/admin/articles/999999', {
    method: 'PUT',
    body: {
      title: 'Tidak Ada',
      content: 'Tidak ada.',
      status: 'draft',
    },
  });

  assert.equal(missingUpdate.status, 404);
});

test('daftar admin mendukung pencarian, filter status, dan pagination', async () => {
  const drafts = [
    ['Zebra Satu', 'Isi zebra satu.'],
    ['Zebra Tiga', 'Isi zebra tiga.'],
  ];

  for (const [title, content] of drafts) {
    const response = await request('/api/admin/articles', {
      method: 'POST',
      body: { title, content, status: 'draft' },
    });
    assert.equal(response.status, 201);
  }

  const published = await request('/api/admin/articles', {
    method: 'POST',
    body: {
      title: 'Zebra Dua',
      content: 'Isi zebra dua.',
      status: 'published',
    },
  });
  assert.equal(published.status, 201);

  const filtered = await request(
    '/api/admin/articles?q=Zebra&status=draft&page=1&limit=1',
  );
  assert.equal(filtered.status, 200);

  const filteredBody = await filtered.json();
  assert.equal(filteredBody.data.items.length, 1);
  assert.equal(filteredBody.data.items[0].status, 'draft');
  assert.match(filteredBody.data.items[0].title, /Zebra/);
  assert.equal(filteredBody.data.pagination.total, 2);
  assert.equal(filteredBody.data.pagination.total_pages, 2);
  assert.ok(!('content' in filteredBody.data.items[0]));

  const secondPage = await request(
    '/api/admin/articles?q=Zebra&status=draft&page=2&limit=1',
  );
  const secondPageBody = await secondPage.json();
  assert.equal(secondPageBody.data.items.length, 1);

  const publishedOnly = await request(
    '/api/admin/articles?q=Zebra&status=published&limit=10',
  );
  const publishedOnlyBody = await publishedOnly.json();
  assert.equal(publishedOnlyBody.data.pagination.total, 1);
  assert.equal(publishedOnlyBody.data.items[0].title, 'Zebra Dua');
  assert.equal(typeof publishedOnlyBody.data.items[0].published_at, 'string');

  const caseInsensitive = await request('/api/admin/articles?q=zebra');
  const caseInsensitiveBody = await caseInsensitive.json();
  assert.equal(caseInsensitiveBody.data.pagination.total, 3);

  const noMatches = await request('/api/admin/articles?q=TidakAdaHasil');
  const noMatchesBody = await noMatches.json();
  assert.equal(noMatchesBody.data.pagination.total, 0);
  assert.deepEqual(noMatchesBody.data.items, []);
});

test('siklus publish, draft, ubah slug, dan hapus berjalan konsisten', async () => {
  const created = await request('/api/admin/articles', {
    method: 'POST',
    body: {
      title: 'Artikel Siklus Hidup',
      slug: 'artikel-siklus-hidup',
      excerpt: 'Ringkasan awal.',
      content: 'Isi versi publik awal.',
      cover_image_url: '  https://example.com/cover.jpg  ',
      status: 'published',
    },
  });

  assert.equal(created.status, 201);

  const createdBody = await created.json();
  const articleId = createdBody.data.id;
  const firstPublishedAt = createdBody.data.published_at;

  assert.equal(createdBody.data.status, 'published');
  assert.equal(createdBody.data.cover_image_url, 'https://example.com/cover.jpg');
  assert.equal(typeof firstPublishedAt, 'string');

  const adminDetail = await request(`/api/admin/articles/${articleId}`);
  assert.equal(adminDetail.status, 200);

  const adminDetailBody = await adminDetail.json();
  assert.equal(adminDetailBody.data.content, 'Isi versi publik awal.');

  const publicDetail = await request('/api/articles/artikel-siklus-hidup');
  assert.equal(publicDetail.status, 200);

  const draftUpdate = await request(`/api/admin/articles/${articleId}`, {
    method: 'PUT',
    body: {
      title: 'Artikel Siklus Hidup',
      content: 'Isi versi draft.',
      status: 'draft',
    },
  });

  assert.equal(draftUpdate.status, 200);

  const draftBody = await draftUpdate.json();
  assert.equal(draftBody.data.slug, 'artikel-siklus-hidup');
  assert.equal(draftBody.data.status, 'draft');
  assert.equal(draftBody.data.published_at, null);
  assert.equal(draftBody.data.excerpt, null);
  assert.equal(draftBody.data.cover_image_url, null);

  const hiddenDetail = await request('/api/articles/artikel-siklus-hidup');
  assert.equal(hiddenDetail.status, 404);

  const publicList = await request('/api/articles?limit=24');
  const publicListBody = await publicList.json();
  assert.ok(
    !publicListBody.data.items.some((item) => item.id === articleId),
  );

  const republished = await request(`/api/admin/articles/${articleId}`, {
    method: 'PUT',
    body: {
      title: 'Artikel Siklus Hidup',
      content: 'Isi versi publik kedua.',
      status: 'published',
    },
  });

  assert.equal(republished.status, 200);

  const republishedBody = await republished.json();
  assert.equal(republishedBody.data.status, 'published');
  assert.equal(typeof republishedBody.data.published_at, 'string');
  assert.notEqual(republishedBody.data.published_at, null);

  const newSlug = await request(`/api/admin/articles/${articleId}`, {
    method: 'PUT',
    body: {
      title: 'Artikel Siklus Hidup',
      slug: 'artikel-siklus-baru',
      content: 'Isi versi publik kedua.',
      status: 'published',
    },
  });

  assert.equal(newSlug.status, 200);

  const newSlugBody = await newSlug.json();
  assert.equal(newSlugBody.data.slug, 'artikel-siklus-baru');
  assert.equal(newSlugBody.data.published_at, republishedBody.data.published_at);

  const oldRoute = await request('/api/articles/artikel-siklus-hidup');
  assert.equal(oldRoute.status, 404);

  const newRoute = await request('/api/articles/artikel-siklus-baru');
  assert.equal(newRoute.status, 200);

  const removed = await request(`/api/admin/articles/${articleId}`, {
    method: 'DELETE',
  });
  assert.equal(removed.status, 200);

  const removedBody = await removed.json();
  assert.equal(removedBody.success, true);
  assert.equal(removedBody.data, null);

  const deletedAdmin = await request(`/api/admin/articles/${articleId}`);
  assert.equal(deletedAdmin.status, 404);

  const deletedPublic = await request('/api/articles/artikel-siklus-baru');
  assert.equal(deletedPublic.status, 404);

  const deleteAgain = await request(`/api/admin/articles/${articleId}`, {
    method: 'DELETE',
  });
  assert.equal(deleteAgain.status, 404);
});

test('dashboard menghitung statistik dari database', async () => {
  const dashboard = await request('/api/admin/dashboard');
  assert.equal(dashboard.status, 200);

  const dashboardBody = await dashboard.json();
  assert.equal(dashboardBody.success, true);
  assert.ok(dashboardBody.data.stats.total >= 2);
  assert.ok(dashboardBody.data.stats.published >= 1);
  assert.ok(dashboardBody.data.stats.draft >= 1);
  assert.equal(
    dashboardBody.data.stats.total,
    dashboardBody.data.stats.published + dashboardBody.data.stats.draft,
  );
  assert.ok(Array.isArray(dashboardBody.data.latest_articles));
  assert.ok(dashboardBody.data.latest_articles.length <= 5);

  for (const article of dashboardBody.data.latest_articles) {
    assert.ok(!('content' in article));
  }

  const all = await request('/api/admin/articles?limit=50');
  const allBody = await all.json();
  assert.equal(
    dashboardBody.data.stats.total,
    allBody.data.pagination.total,
  );

  const published = await request(
    '/api/admin/articles?status=published&limit=50',
  );
  const publishedBody = await published.json();
  assert.equal(
    dashboardBody.data.stats.published,
    publishedBody.data.pagination.total,
  );

  const drafts = await request('/api/admin/articles?status=draft&limit=50');
  const draftsBody = await drafts.json();
  assert.equal(dashboardBody.data.stats.draft, draftsBody.data.pagination.total);
});
