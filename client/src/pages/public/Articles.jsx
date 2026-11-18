import { Link, useSearchParams } from 'react-router-dom';
import ArticleCard from '../../components/ArticleCard.jsx';
import ArticleCardSkeleton from '../../components/ArticleCardSkeleton.jsx';
import Pagination from '../../components/Pagination.jsx';
import StatePanel from '../../components/StatePanel.jsx';
import { SITE_NAME } from '../../config/site.js';
import { useApiResource } from '../../hooks/useApiResource.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

const PAGE_SIZE = 6;

function parsePage(value) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default function Articles() {
  useDocumentTitle(`Artikel · ${SITE_NAME}`);

  const [searchParams] = useSearchParams();
  const page = parsePage(searchParams.get('page') ?? '1');
  const { status, data, error, reload } = useApiResource(
    `/api/articles?page=${page}&limit=${PAGE_SIZE}`,
  );

  const articles = data?.items ?? [];
  const pagination = data?.pagination;
  const isOutOfRange =
    status === 'success' &&
    articles.length === 0 &&
    (pagination?.total ?? 0) > 0;

  return (
    <>
      <section className="page-hero" aria-labelledby="archive-title">
        <div className="container page-hero__inner">
          <div>
            <p className="eyebrow">Arsip</p>
            <h1 id="archive-title">Semua artikel</h1>
            <p className="lead">
              Kumpulan tulisan yang sudah diterbitkan. Pilih satu dan baca
              selengkapnya tanpa gangguan.
            </p>
          </div>

          {status === 'success' && pagination?.total > 0 ? (
            <p className="archive-count">
              <strong>{pagination.total}</strong> artikel
            </p>
          ) : null}
        </div>
      </section>

      <section className="section section--archive">
        <div className="container">
          {status === 'loading' ? (
            <>
              <p className="sr-only" role="status">
                Memuat daftar artikel…
              </p>
              <div className="article-grid" aria-hidden="true">
                {Array.from({ length: PAGE_SIZE }, (_, index) => (
                  <ArticleCardSkeleton key={index} />
                ))}
              </div>
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

          {status === 'success' && pagination?.total === 0 ? (
            <StatePanel
              eyebrow="Arsip kosong"
              title="Belum ada artikel yang diterbitkan"
              description="Tulisan pertama sedang disiapkan. Sementara itu, Anda bisa kembali ke beranda."
              action={
                <Link className="button button--secondary" to="/">
                  Kembali ke beranda
                </Link>
              }
            />
          ) : null}

          {isOutOfRange ? (
            <StatePanel
              eyebrow="Halaman tidak tersedia"
              title="Belum ada artikel di halaman ini"
              description="Jumlah halaman mungkin berubah karena artikel baru atau yang dihapus."
              action={
                <Link className="button button--secondary" to="/artikel">
                  Ke halaman pertama
                </Link>
              }
            />
          ) : null}

          {status === 'success' && articles.length > 0 ? (
            <>
              <div className="article-grid">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    titleAs="h2"
                  />
                ))}
              </div>

              <Pagination
                page={pagination.page}
                totalPages={pagination.total_pages}
              />
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
