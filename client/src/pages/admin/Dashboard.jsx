import { Link } from 'react-router-dom';
import StatePanel from '../../components/StatePanel.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { SITE_NAME } from '../../config/site.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useApiResource } from '../../hooks/useApiResource.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { formatDate } from '../../utils/formatDate.js';

function StatSkeleton() {
  return (
    <div className="stat-grid" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div className="stat-card stat-card--skeleton" key={index}>
          <div className="skeleton skeleton--line skeleton--date" />
          <div className="skeleton skeleton--line skeleton--stat" />
          <div className="skeleton skeleton--line skeleton--line-short" />
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  useDocumentTitle(`Dashboard · ${SITE_NAME}`);

  const { admin } = useAuth();
  const { status, data, error, reload } = useApiResource('/api/admin/dashboard');

  const stats = data?.stats;
  const latestArticles = data?.latest_articles ?? [];
  const firstName = admin?.name?.trim().split(/\s+/)[0] || 'Admin';

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Selamat datang, {firstName}.</h1>
          <p className="admin-page__lead">
            Ringkasan arsip dan artikel terbaru Anda dalam satu tampilan.
          </p>
        </div>

        <div className="admin-page__actions">
          <Link className="button" to="/admin/artikel/tambah">
            Tulis artikel
          </Link>
        </div>
      </header>

      {status === 'loading' ? (
        <>
          <p className="sr-only" role="status">
            Memuat statistik dashboard…
          </p>
          <StatSkeleton />
          <section className="admin-panel" aria-hidden="true">
            <div className="skeleton skeleton--line skeleton--headline" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--line-short" />
          </section>
        </>
      ) : null}

      {status === 'error' ? (
        <StatePanel
          tone="error"
          eyebrow="Koneksi"
          title="Dashboard belum dapat dimuat"
          description={error?.message}
          action={
            <button className="button" type="button" onClick={reload}>
              Coba lagi
            </button>
          }
        />
      ) : null}

      {status === 'success' ? (
        <>
          <div className="stat-grid">
            <Link
              className="stat-card"
              to="/admin/artikel"
              aria-label={`Lihat semua artikel, total ${stats.total}`}
            >
              <span className="stat-card__label">Total artikel</span>
              <strong className="stat-card__value">{stats.total}</strong>
              <span className="stat-card__note">
                Seluruh tulisan di arsip, termasuk draf.
              </span>
            </Link>

            <Link
              className="stat-card stat-card--published"
              to="/admin/artikel?status=published"
              aria-label={`Lihat artikel terbit, total ${stats.published}`}
            >
              <span className="stat-card__label">Terbit</span>
              <strong className="stat-card__value">{stats.published}</strong>
              <span className="stat-card__note">
                Tampil di halaman publik saat ini.
              </span>
            </Link>

            <Link
              className="stat-card stat-card--draft"
              to="/admin/artikel?status=draft"
              aria-label={`Lihat artikel draf, total ${stats.draft}`}
            >
              <span className="stat-card__label">Draf</span>
              <strong className="stat-card__value">{stats.draft}</strong>
              <span className="stat-card__note">
                Masih disimpan dan belum dibaca publik.
              </span>
            </Link>
          </div>

          <section className="admin-panel" aria-labelledby="latest-articles-title">
            <div className="admin-panel__header">
              <div>
                <h2 id="latest-articles-title">Artikel terbaru</h2>
                <p>Lima artikel yang paling akhir dibuat.</p>
              </div>
              <Link className="text-link" to="/admin/artikel">
                Kelola semua <span aria-hidden="true">→</span>
              </Link>
            </div>

            {latestArticles.length === 0 ? (
              <StatePanel
                eyebrow="Arsip kosong"
                title="Belum ada artikel"
                description="Mulai dengan menulis artikel pertama Anda. Simpan sebagai draf atau terbitkan langsung."
                action={
                  <Link className="button" to="/admin/artikel/tambah">
                    Tulis artikel
                  </Link>
                }
              />
            ) : (
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
                    {latestArticles.map((article) => (
                      <tr key={article.id}>
                        <td data-label="Artikel">
                          <Link
                            className="table-title"
                            to={`/admin/artikel/${article.id}/edit`}
                          >
                            {article.title}
                          </Link>
                          <span className="table-subtitle">
                            /artikel/{article.slug}
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
                          <Link
                            className="table-action"
                            to={`/admin/artikel/${article.id}/edit`}
                          >
                            Sunting
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
