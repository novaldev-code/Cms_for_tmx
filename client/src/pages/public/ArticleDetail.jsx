import { Link, useParams } from 'react-router-dom';
import ArticleCover from '../../components/ArticleCover.jsx';
import { SITE_NAME } from '../../config/site.js';
import { useApiResource } from '../../hooks/useApiResource.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { formatDate } from '../../utils/formatDate.js';

export default function ArticleDetail() {
  const { slug } = useParams();
  const { status, data, error, reload } = useApiResource(
    `/api/articles/${encodeURIComponent(slug ?? '')}`,
  );

  const isNotFound = status === 'error' && error?.status === 404;

  useDocumentTitle(
    status === 'success' && data
      ? `${data.title} · ${SITE_NAME}`
      : isNotFound
        ? `Artikel tidak ditemukan · ${SITE_NAME}`
        : `Artikel · ${SITE_NAME}`,
  );

  if (status === 'loading') {
    return (
      <div className="container article-page" aria-busy="true">
        <p className="sr-only" role="status">
          Memuat artikel…
        </p>

        <div aria-hidden="true">
          <div className="skeleton skeleton--line skeleton--back" />
          <div className="article-page__header">
            <div className="skeleton skeleton--line skeleton--date" />
            <div className="skeleton skeleton--line skeleton--headline" />
            <div className="skeleton skeleton--line skeleton--headline skeleton--headline-short" />
            <div className="skeleton skeleton--line skeleton--excerpt" />
          </div>
          <div className="skeleton skeleton--article-cover" />
          <div className="article-page__content">
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--line-short" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--line-short" />
          </div>
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <section className="state-page" aria-labelledby="article-missing-title">
        <div className="container state-page__inner">
          <p className="eyebrow">404 · Artikel</p>
          <h1 className="state-page__title" id="article-missing-title">
            Tulisan ini tidak tersedia.
          </h1>
          <p className="lead">
            Artikel mungkin belum diterbitkan atau alamatnya sudah berubah.
          </p>
          <div className="actions">
            <Link className="button" to="/artikel">
              Lihat semua artikel
            </Link>
            <Link className="button button--secondary" to="/">
              Kembali ke beranda
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="state-page" aria-labelledby="article-error-title">
        <div className="container state-page__inner">
          <p className="eyebrow">Gagal memuat</p>
          <h1 className="state-page__title" id="article-error-title">
            Artikel tidak dapat dibuka.
          </h1>
          <p className="lead">{error?.message}</p>
          <div className="actions">
            <button className="button" type="button" onClick={reload}>
              Coba lagi
            </button>
            <Link className="button button--secondary" to="/artikel">
              Kembali ke arsip
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <article className="article-page">
      <div className="container">
        <Link className="back-link" to="/artikel">
          <span aria-hidden="true">←</span> Kembali ke arsip
        </Link>

        <header className="article-page__header">
          <p className="eyebrow">
            Artikel
            {data.published_at ? (
              <>
                <span aria-hidden="true"> · </span>
                <time dateTime={data.published_at}>
                  {formatDate(data.published_at)}
                </time>
              </>
            ) : null}
          </p>
          <h1 className="article-page__title">{data.title}</h1>
          {data.excerpt ? (
            <p className="article-page__excerpt">{data.excerpt}</p>
          ) : null}
        </header>

        {data.cover_image_url ? (
          <div className="article-page__cover">
            <ArticleCover
              src={data.cover_image_url}
              title={data.title}
              className="article-page__cover-image"
              eager
            />
          </div>
        ) : null}

        <div className="article-page__content">{data.content}</div>

        <footer className="article-page__footer">
          <p>
            Diterbitkan
            {data.published_at ? (
              <>
                {' '}
                pada{' '}
                <time dateTime={data.published_at}>
                  {formatDate(data.published_at)}
                </time>
              </>
            ) : null}
          </p>
          <Link className="button button--secondary" to="/artikel">
            Kembali ke arsip
          </Link>
        </footer>
      </div>
    </article>
  );
}
