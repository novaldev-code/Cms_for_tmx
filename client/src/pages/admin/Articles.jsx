import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Pagination from '../../components/Pagination.jsx';
import StatePanel from '../../components/StatePanel.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { SITE_NAME } from '../../config/site.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useApiResource } from '../../hooks/useApiResource.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { deleteAdminArticle } from '../../services/api.js';
import { formatDate } from '../../utils/formatDate.js';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: '', label: 'Semua status' },
  { value: 'published', label: 'Terbit' },
  { value: 'draft', label: 'Draf' },
];

function parsePage(value) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function TableSkeleton() {
  return (
    <div className="admin-table-wrapper" aria-hidden="true">
      <table className="admin-table">
        <tbody>
          {Array.from({ length: 5 }, (_, index) => (
            <tr key={index}>
              <td>
                <div className="skeleton skeleton--line skeleton--title" />
                <div className="skeleton skeleton--line skeleton--date" />
              </td>
              <td>
                <div className="skeleton skeleton--line skeleton--badge" />
              </td>
              <td>
                <div className="skeleton skeleton--line skeleton--date" />
              </td>
              <td>
                <div className="skeleton skeleton--line skeleton--date" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminArticles() {
  useDocumentTitle(`Kelola artikel · ${SITE_NAME}`);

  const { csrfToken } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parsePage(searchParams.get('page') ?? '1');
  const q = searchParams.get('q')?.trim() ?? '';
  const rawStatus = searchParams.get('status') ?? '';
  const statusFilter =
    rawStatus === 'published' || rawStatus === 'draft' ? rawStatus : '';

  const [searchTerm, setSearchTerm] = useState(q);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setSearchTerm(q);
  }, [q]);

  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });

  if (q) {
    params.set('q', q);
  }

  if (statusFilter) {
    params.set('status', statusFilter);
  }

  const { status, data, error, reload } = useApiResource(
    `/api/admin/articles?${params}`,
  );

  const articles = data?.items ?? [];
  const pagination = data?.pagination;
  const hasFilter = Boolean(q || statusFilter);
  const listUrl = `/admin/artikel${location.search}`;
  const linkState = { from: listUrl };

  function updateQuery(changes) {
    const next = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(changes)) {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }

    if (!('page' in changes)) {
      next.delete('page');
    }

    setSearchParams(next);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    updateQuery({ q: searchTerm.trim() });
  }

  function handleStatusChange(event) {
    updateQuery({ status: event.target.value });
  }

  function resetFilters() {
    setSearchTerm('');
    setSearchParams({});
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) {
      return;
    }

    setDeleting(true);

    try {
      await deleteAdminArticle(deleteTarget.id, csrfToken);
      showToast('Artikel berhasil dihapus.');
      setDeleteTarget(null);

      if (articles.length === 1 && page > 1) {
        updateQuery({ page: String(page - 1) });
      } else {
        reload();
      }
    } catch (deleteError) {
      showToast(deleteError.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  function getPageHref(target) {
    const next = new URLSearchParams();

    if (q) {
      next.set('q', q);
    }

    if (statusFilter) {
      next.set('status', statusFilter);
    }

    if (target > 1) {
      next.set('page', String(target));
    }

    const query = next.toString();
    return query ? `/admin/artikel?${query}` : '/admin/artikel';
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="eyebrow">Artikel</p>
          <h1>Kelola artikel</h1>
          <p className="admin-page__lead">
            Cari, saring, dan sunting tulisan yang sudah ada di arsip.
          </p>
        </div>

        <div className="admin-page__actions">
          <Link
            className="button"
            to="/admin/artikel/tambah"
            state={linkState}
          >
            Artikel baru
          </Link>
        </div>
      </header>

      <section className="admin-panel" aria-labelledby="article-list-title">
        <div className="admin-panel__header">
          <div>
            <h2 id="article-list-title">Daftar artikel</h2>
            <p>
              {status === 'success'
                ? `${pagination?.total ?? 0} artikel ditemukan${
                    hasFilter ? ' dengan filter aktif' : ''
                  }.`
                : 'Memuat arsip artikel…'}
            </p>
          </div>
        </div>

        <div className="admin-toolbar">
          <form className="admin-search" role="search" onSubmit={handleSearchSubmit}>
            <label className="sr-only" htmlFor="article-search">
              Cari artikel berdasarkan judul
            </label>
            <input
              className="input"
              id="article-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari judul artikel…"
              maxLength={100}
            />
            <button className="button button--secondary" type="submit">
              Cari
            </button>
          </form>

          <div className="admin-toolbar__filters">
            <label className="sr-only" htmlFor="article-status">
              Filter status artikel
            </label>
            <select
              className="input select"
              id="article-status"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {hasFilter ? (
              <button
                className="button button--ghost"
                type="button"
                onClick={resetFilters}
              >
                Reset
              </button>
            ) : null}

            <button
              className="button button--ghost"
              type="button"
              onClick={reload}
              disabled={status === 'loading'}
            >
              Muat ulang
            </button>
          </div>
        </div>

        {status === 'loading' ? (
          <>
            <p className="sr-only" role="status">
              Memuat daftar artikel…
            </p>
            <TableSkeleton />
          </>
        ) : null}

        {status === 'error' ? (
          <StatePanel
            tone="error"
            eyebrow="Koneksi"
            title="Daftar artikel belum dapat dimuat"
            description={error?.message}
            action={
              <button className="button" type="button" onClick={reload}>
                Coba lagi
              </button>
            }
          />
        ) : null}

        {status === 'success' &&
        articles.length === 0 &&
        (pagination?.total ?? 0) === 0 ? (
          <StatePanel
            eyebrow={hasFilter ? 'Tidak ditemukan' : 'Arsip kosong'}
            title={
              hasFilter
                ? 'Tidak ada artikel yang cocok'
                : 'Belum ada artikel'
            }
            description={
              hasFilter
                ? 'Coba kata kunci lain atau ubah filter status untuk melihat artikel lainnya.'
                : 'Mulai arsip Anda dengan menulis artikel pertama. Simpan sebagai draf atau terbitkan langsung.'
            }
            action={
              hasFilter ? (
                <>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={resetFilters}
                  >
                    Reset filter
                  </button>
                  <Link className="button" to="/admin/artikel/tambah" state={linkState}>
                    Tulis artikel
                  </Link>
                </>
              ) : (
                <Link className="button" to="/admin/artikel/tambah" state={linkState}>
                  Tulis artikel
                </Link>
              )
            }
          />
        ) : null}

        {status === 'success' &&
        articles.length === 0 &&
        (pagination?.total ?? 0) > 0 ? (
          <StatePanel
            eyebrow="Halaman tidak tersedia"
            title="Halaman ini tidak memiliki artikel"
            description="Jumlah halaman berubah karena artikel baru atau yang dihapus. Kembali ke halaman pertama untuk melanjutkan."
            action={
              <button
                className="button button--secondary"
                type="button"
                onClick={() => navigate(getPageHref(1))}
              >
                Ke halaman pertama
              </button>
            }
          />
        ) : null}

        {status === 'success' && articles.length > 0 ? (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">Artikel</th>
                    <th scope="col">Status</th>
                    <th scope="col">Diperbarui</th>
                    <th scope="col">
                      <span className="sr-only">Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id}>
                      <td data-label="Artikel">
                        <Link
                          className="table-title"
                          to={`/admin/artikel/${article.id}/edit`}
                          state={linkState}
                        >
                          {article.title}
                        </Link>
                        <span className="table-subtitle">
                          {article.excerpt || `/artikel/${article.slug}`}
                        </span>
                      </td>
                      <td data-label="Status">
                        <StatusBadge status={article.status} />
                      </td>
                      <td data-label="Diperbarui">
                        <time dateTime={article.updated_at}>
                          {formatDate(article.updated_at)}
                        </time>
                      </td>
                      <td className="table-actions" data-label="Aksi">
                        {article.status === 'published' ? (
                          <Link
                            className="table-action"
                            to={`/artikel/${article.slug}`}
                          >
                            Lihat
                          </Link>
                        ) : null}
                        <Link
                          className="table-action"
                          to={`/admin/artikel/${article.id}/edit`}
                          state={linkState}
                        >
                          Sunting
                        </Link>
                        <button
                          className="table-action table-action--danger"
                          type="button"
                          onClick={() => setDeleteTarget(article)}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={pagination.page}
              totalPages={pagination.total_pages}
              getHref={getPageHref}
              ariaLabel="Navigasi halaman daftar artikel admin"
            />
          </>
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus artikel?"
        description={
          deleteTarget
            ? `Artikel "${deleteTarget.title}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`
            : ''
        }
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
