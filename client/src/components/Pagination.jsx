import { Link } from 'react-router-dom';

function buildPages(page, totalPages) {
  const windowSize = 5;
  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + windowSize - 1);

  start = Math.max(1, end - windowSize + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function defaultHref(page) {
  return page <= 1 ? '/artikel' : `/artikel?page=${page}`;
}

export default function Pagination({
  page,
  totalPages,
  getHref = defaultHref,
  ariaLabel = 'Navigasi halaman artikel',
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPages(page, totalPages);

  return (
    <nav className="pagination" aria-label={ariaLabel}>
      {page > 1 ? (
        <Link className="pagination__arrow" to={getHref(page - 1)}>
          <span aria-hidden="true">←</span> Sebelumnya
        </Link>
      ) : (
        <span className="pagination__arrow pagination__arrow--disabled">
          <span aria-hidden="true">←</span> Sebelumnya
        </span>
      )}

      <div className="pagination__pages">
        {pages.map((item) => (
          <Link
            key={item}
            className={`pagination__page${item === page ? ' is-active' : ''}`}
            to={getHref(item)}
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Halaman ${item}`}
          >
            {item}
          </Link>
        ))}
      </div>

      {page < totalPages ? (
        <Link className="pagination__arrow" to={getHref(page + 1)}>
          Berikutnya <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span className="pagination__arrow pagination__arrow--disabled">
          Berikutnya <span aria-hidden="true">→</span>
        </span>
      )}
    </nav>
  );
}
