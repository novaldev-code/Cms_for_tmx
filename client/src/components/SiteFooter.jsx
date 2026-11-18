import { Link } from 'react-router-dom';
import { SITE_DESCRIPTION, SITE_NAME } from '../config/site.js';

const EXPLORE_LINKS = [
  { to: '/', label: 'Beranda' },
  { to: '/artikel', label: 'Artikel' },
  { to: '/#fitur', label: 'Fitur' },
  { to: '/#cara-kerja', label: 'Cara kerja' },
  { to: '/#faq', label: 'FAQ' },
];

const PRODUCT_LINKS = [
  { to: '/login', label: 'Masuk admin' },
  { to: '/admin', label: 'Panel admin' },
];

const TECH_ITEMS = ['React 19', 'Express 5', 'SQLite', 'Termux-ready'];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Link className="brand" to="/">
            <span className="brand__mark" aria-hidden="true">
              M
            </span>
            <span>{SITE_NAME}</span>
          </Link>
          <p>{SITE_DESCRIPTION}</p>
        </div>

        <nav className="site-footer__column" aria-labelledby="footer-explore">
          <h2 id="footer-explore" className="site-footer__heading">
            Jelajahi
          </h2>
          <ul>
            {EXPLORE_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="site-footer__column" aria-labelledby="footer-product">
          <h2 id="footer-product" className="site-footer__heading">
            Produk
          </h2>
          <ul>
            {PRODUCT_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__column">
          <h2 className="site-footer__heading">Teknologi</h2>
          <ul className="site-footer__tech">
            {TECH_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <span>
          &copy; {new Date().getFullYear()} {SITE_NAME}
        </span>
        <span>Dibangun dengan React, Express, dan SQLite.</span>
      </div>
    </footer>
  );
}
