import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SITE_NAME } from '../config/site.js';

const NAV_ITEMS = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/#fitur', label: 'Fitur', hash: true },
  { to: '/#cara-kerja', label: 'Cara kerja', hash: true },
  { to: '/artikel', label: 'Artikel' },
  { to: '/#faq', label: 'FAQ', hash: true },
];

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link
          className="brand"
          to="/"
          aria-label={`${SITE_NAME} beranda`}
          onClick={closeMenu}
        >
          <span className="brand__mark" aria-hidden="true">
            M
          </span>
          <span>{SITE_NAME}</span>
        </Link>

        <button
          ref={toggleRef}
          type="button"
          className="site-nav-toggle"
          aria-expanded={isOpen}
          aria-controls="site-navigation"
          aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <nav
          id="site-navigation"
          className={`site-nav${isOpen ? ' is-open' : ''}`}
          aria-label="Navigasi utama"
        >
          <div className="site-nav__links">
            {NAV_ITEMS.map((item) =>
              item.hash ? (
                <Link
                  key={item.to}
                  className="site-nav__link"
                  to={item.to}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ) : (
                <NavLink
                  key={item.to}
                  className={({ isActive }) =>
                    `site-nav__link${isActive ? ' is-active' : ''}`
                  }
                  to={item.to}
                  end={item.end}
                  onClick={closeMenu}
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </div>

          <div className="site-nav__actions">
            <Link
              className="site-header__cta"
              to="/login"
              onClick={closeMenu}
            >
              Masuk admin
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
