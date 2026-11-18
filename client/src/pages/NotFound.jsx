import { Link } from 'react-router-dom';
import { SITE_NAME } from '../config/site.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle(`Halaman tidak ditemukan · ${SITE_NAME}`);

  return (
    <section className="state-page" aria-labelledby="not-found-title">
      <div className="container state-page__inner">
        <p className="eyebrow">404</p>
        <h1 className="state-page__title" id="not-found-title">
          Halaman tidak ditemukan.
        </h1>
        <p className="lead">
          Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.
        </p>
        <div className="actions">
          <Link className="button" to="/">
            Kembali ke beranda
          </Link>
          <Link className="button button--secondary" to="/artikel">
            Lihat artikel
          </Link>
        </div>
      </div>
    </section>
  );
}
