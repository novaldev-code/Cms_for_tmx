import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ArticleCover from '../../components/ArticleCover.jsx';
import StatePanel from '../../components/StatePanel.jsx';
import { SITE_NAME } from '../../config/site.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useApiResource } from '../../hooks/useApiResource.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import {
  createAdminArticle,
  updateAdminArticle,
} from '../../services/api.js';
import { createSlug } from '../../utils/slug.js';

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  status: 'draft',
};

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateForm(form) {
  const errors = {};

  if (!form.title.trim()) {
    errors.title = 'Judul wajib diisi';
  } else if (form.title.trim().length > 200) {
    errors.title = 'Judul maksimal 200 karakter';
  }

  if (!form.content.trim()) {
    errors.content = 'Isi artikel wajib diisi';
  } else if (form.content.trim().length > 100000) {
    errors.content = 'Isi artikel maksimal 100.000 karakter';
  }

  if (form.slug.trim().length > 160) {
    errors.slug = 'Slug maksimal 160 karakter';
  }

  if (form.excerpt.trim().length > 500) {
    errors.excerpt = 'Excerpt maksimal 500 karakter';
  }

  if (form.cover_image_url.trim() && !isHttpUrl(form.cover_image_url.trim())) {
    errors.cover_image_url =
      'URL gambar harus berupa URL http atau https yang valid';
  }

  if (form.cover_image_url.trim().length > 2048) {
    errors.cover_image_url = 'URL gambar maksimal 2048 karakter';
  }

  return errors;
}

function resolveReturnTo(from) {
  if (
    typeof from === 'string' &&
    (from === '/admin/artikel' || from.startsWith('/admin/artikel?'))
  ) {
    return from;
  }

  return '/admin/artikel';
}

export default function ArticleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { csrfToken } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useDocumentTitle(
    `${isEdit ? 'Sunting artikel' : 'Artikel baru'} · ${SITE_NAME}`,
  );

  const resource = useApiResource(
    isEdit ? `/api/admin/articles/${encodeURIComponent(id)}` : null,
  );
  const returnTo = resolveReturnTo(location.state?.from);

  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit || resource.status !== 'success' || !resource.data) {
      return;
    }

    const article = resource.data;

    setForm({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt ?? '',
      content: article.content,
      cover_image_url: article.cover_image_url ?? '',
      status: article.status,
    });
    setSlugTouched(true);
  }, [isEdit, resource.status, resource.data]);

  function clearFieldError(name) {
    setFieldErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => {
      if (name === 'title') {
        return {
          ...current,
          title: value,
          slug: slugTouched ? current.slug : createSlug(value),
        };
      }

      return { ...current, [name]: value };
    });

    if (name === 'slug') {
      setSlugTouched(value.trim().length > 0);
    }

    clearFieldError(name);

    if (formError) {
      setFormError('');
    }
  }

  function handleRegenerateSlug() {
    setSlugTouched(true);
    setForm((current) => ({ ...current, slug: createSlug(current.title) }));
    clearFieldError('slug');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim(),
      cover_image_url: form.cover_image_url.trim() || null,
      status: form.status,
    };

    const clientErrors = validateForm(form);

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setFormError('Periksa kembali isian yang ditandai.');
      return;
    }

    setSaving(true);
    setFormError('');
    setFieldErrors({});

    try {
      if (isEdit) {
        await updateAdminArticle(id, payload, csrfToken);
      } else {
        await createAdminArticle(payload, csrfToken);
      }

      const successMessage = isEdit
        ? 'Perubahan artikel berhasil disimpan.'
        : form.status === 'published'
          ? 'Artikel berhasil diterbitkan.'
          : 'Draf artikel berhasil disimpan.';

      showToast(successMessage);
      navigate(returnTo, { replace: true });
    } catch (submitError) {
      if (submitError.status === 401) {
        return;
      }

      const errors = submitError.errors ?? {};
      setFieldErrors(errors);

      if (Object.keys(errors).length > 0) {
        setFormError('Periksa kembali isian yang ditandai.');
      } else {
        setFormError(submitError.message);
        showToast(submitError.message, 'error');
      }
    } finally {
      setSaving(false);
    }
  }

  if (isEdit && resource.status === 'loading') {
    return (
      <div className="admin-page" aria-busy="true">
        <p className="sr-only" role="status">
          Memuat artikel…
        </p>
        <div aria-hidden="true">
          <div className="skeleton skeleton--line skeleton--back" />
          <div className="skeleton skeleton--line skeleton--headline" />
          <div className="skeleton skeleton--line skeleton--excerpt" />
          <div className="form-skeleton-grid">
            <div className="skeleton skeleton--form-panel" />
            <div className="skeleton skeleton--form-side" />
          </div>
        </div>
      </div>
    );
  }

  if (isEdit && resource.status === 'error') {
    const notFound = resource.error?.status === 404;

    return (
      <div className="admin-page">
        <StatePanel
          tone="error"
          eyebrow={notFound ? '404 · Artikel' : 'Gagal memuat'}
          title={
            notFound
              ? 'Artikel tidak ditemukan'
              : 'Artikel belum dapat dimuat'
          }
          description={
            notFound
              ? 'Artikel mungkin sudah dihapus atau alamatnya tidak lagi tersedia.'
              : resource.error?.message
          }
          action={
            <>
              <Link className="button button--secondary" to={returnTo}>
                Kembali ke daftar
              </Link>
              {notFound ? null : (
                <button
                  className="button"
                  type="button"
                  onClick={resource.reload}
                >
                  Coba lagi
                </button>
              )}
            </>
          }
        />
      </div>
    );
  }

  const slugPreview =
    createSlug(form.slug.trim()) || createSlug(form.title) || 'slug-artikel';
  const titleCount = form.title.length;
  const excerptCount = form.excerpt.length;
  const contentCount = form.content.length;

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <Link className="back-link" to={returnTo}>
            <span aria-hidden="true">←</span> Kembali ke daftar artikel
          </Link>
          <p className="eyebrow">{isEdit ? 'Sunting artikel' : 'Artikel baru'}</p>
          <h1>{isEdit ? 'Sunting artikel' : 'Tulis artikel baru'}</h1>
          <p className="admin-page__lead">
            {isEdit
              ? 'Perbarui isi, sampul, atau status terbit artikel ini.'
              : 'Susun tulisan, atur sampul, lalu simpan sebagai draf atau terbitkan.'}
          </p>
        </div>
      </header>

      {formError ? (
        <div className="form-alert" role="alert">
          <strong>Artikel belum tersimpan.</strong>
          <span>{formError}</span>
        </div>
      ) : null}

      <form className="article-form" onSubmit={handleSubmit} noValidate>
        <div className="article-form__main">
          <section className="admin-panel" aria-labelledby="article-content-title">
            <div className="admin-panel__header">
              <div>
                <h2 id="article-content-title">Isi artikel</h2>
                <p>Judul dan isi wajib diisi sebelum artikel disimpan.</p>
              </div>
            </div>

            <div className="field">
              <div className="field__label-row">
                <label htmlFor="article-title">Judul</label>
                <span className="field-counter">{titleCount} / 200</span>
              </div>
              <input
                className="input"
                id="article-title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                maxLength={200}
                placeholder="Judul artikel yang jelas dan menarik"
                aria-invalid={fieldErrors.title ? 'true' : undefined}
                aria-describedby={
                  fieldErrors.title ? 'article-title-error' : undefined
                }
                autoFocus={!isEdit}
                required
              />
              {fieldErrors.title ? (
                <p className="field-error" id="article-title-error">
                  {fieldErrors.title}
                </p>
              ) : null}
            </div>

            <div className="field">
              <div className="field__label-row">
                <label htmlFor="article-slug">Slug</label>
                <span className="field-counter">{form.slug.length} / 160</span>
              </div>
              <div className="field-inline">
                <input
                  className="input"
                  id="article-slug"
                  name="slug"
                  type="text"
                  value={form.slug}
                  onChange={handleChange}
                  maxLength={160}
                  placeholder="slug-otomatis-dari-judul"
                  aria-invalid={fieldErrors.slug ? 'true' : undefined}
                  aria-describedby={
                    fieldErrors.slug ? 'article-slug-error' : 'article-slug-hint'
                  }
                />
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={handleRegenerateSlug}
                  disabled={!form.title.trim()}
                >
                  Buat dari judul
                </button>
              </div>
              <p className="field-hint" id="article-slug-hint">
                Alamat publik: <code>/artikel/{slugPreview}</code>. Kosongkan
                untuk membuat slug dari judul.
              </p>
              {fieldErrors.slug ? (
                <p className="field-error" id="article-slug-error">
                  {fieldErrors.slug}
                </p>
              ) : null}
            </div>

            <div className="field">
              <div className="field__label-row">
                <label htmlFor="article-excerpt">Ringkasan</label>
                <span className="field-counter">{excerptCount} / 500</span>
              </div>
              <textarea
                className="input textarea"
                id="article-excerpt"
                name="excerpt"
                rows={3}
                value={form.excerpt}
                onChange={handleChange}
                maxLength={500}
                placeholder="Ringkasan singkat yang tampil di kartu artikel (opsional)"
                aria-invalid={fieldErrors.excerpt ? 'true' : undefined}
                aria-describedby={
                  fieldErrors.excerpt ? 'article-excerpt-error' : undefined
                }
              />
              {fieldErrors.excerpt ? (
                <p className="field-error" id="article-excerpt-error">
                  {fieldErrors.excerpt}
                </p>
              ) : null}
            </div>

            <div className="field">
              <div className="field__label-row">
                <label htmlFor="article-content">Isi artikel</label>
                <span className="field-counter">
                  {contentCount.toLocaleString('id-ID')} / 100.000
                </span>
              </div>
              <textarea
                className="input textarea textarea--content"
                id="article-content"
                name="content"
                rows={18}
                value={form.content}
                onChange={handleChange}
                maxLength={100000}
                placeholder="Tulis isi artikel di sini. Pisahkan paragraf dengan baris baru."
                aria-invalid={fieldErrors.content ? 'true' : undefined}
                aria-describedby="article-content-hint"
                required
              />
              <p className="field-hint" id="article-content-hint">
                Baris baru akan dipertahankan sebagai paragraf saat artikel
                dibaca.
              </p>
              {fieldErrors.content ? (
                <p className="field-error">{fieldErrors.content}</p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="article-form__side">
          <section className="admin-panel" aria-labelledby="publish-title">
            <h2 id="publish-title">Publikasi</h2>

            <fieldset className="field status-fieldset">
              <legend className="sr-only">Status artikel</legend>

              <label
                className={`status-option${
                  form.status === 'draft' ? ' is-selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={form.status === 'draft'}
                  onChange={handleChange}
                />
                <span className="status-option__body">
                  <strong>Draf</strong>
                  <small>Hanya terlihat di area admin.</small>
                </span>
                <span className="status-option__dot" aria-hidden="true" />
              </label>

              <label
                className={`status-option${
                  form.status === 'published' ? ' is-selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={form.status === 'published'}
                  onChange={handleChange}
                />
                <span className="status-option__body">
                  <strong>Terbit</strong>
                  <small>Tampil di halaman publik.</small>
                </span>
                <span className="status-option__dot" aria-hidden="true" />
              </label>
            </fieldset>

            <div className="form-actions">
              <button className="button" type="submit" disabled={saving}>
                {saving
                  ? 'Menyimpan…'
                  : isEdit
                    ? 'Simpan perubahan'
                    : form.status === 'published'
                      ? 'Terbitkan artikel'
                      : 'Simpan draf'}
              </button>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => navigate(returnTo)}
                disabled={saving}
              >
                Batal
              </button>
            </div>
          </section>

          <section className="admin-panel" aria-labelledby="cover-title">
            <h2 id="cover-title">Sampul</h2>

            <div className="field">
              <label htmlFor="article-cover">URL gambar sampul</label>
              <input
                className="input"
                id="article-cover"
                name="cover_image_url"
                type="url"
                value={form.cover_image_url}
                onChange={handleChange}
                maxLength={2048}
                placeholder="https://contoh.com/gambar.jpg"
                aria-invalid={fieldErrors.cover_image_url ? 'true' : undefined}
                aria-describedby={
                  fieldErrors.cover_image_url
                    ? 'article-cover-error'
                    : 'article-cover-hint'
                }
              />
              <p className="field-hint" id="article-cover-hint">
                Opsional. Gunakan URL http atau https. Tanpa sampul, artikel
                memakai ilustrasi bawaan.
              </p>
              {fieldErrors.cover_image_url ? (
                <p className="field-error" id="article-cover-error">
                  {fieldErrors.cover_image_url}
                </p>
              ) : null}
            </div>

            <div className="form-cover">
              <ArticleCover
                src={form.cover_image_url.trim() || null}
                title={form.title || 'Pratinjau artikel'}
              />
            </div>
          </section>

          <section className="admin-panel admin-panel--muted">
            <h2>Catatan</h2>
            <p className="admin-note">
              Slug dipakai pada alamat artikel publik. Jika judul berubah, slug
              lama tetap dipertahankan agar tautan yang sudah dibagikan tidak
              rusak. Gunakan tombol <strong>Buat dari judul</strong> bila ingin
              menggantinya.
            </p>
          </section>
        </aside>
      </form>
    </div>
  );
}
