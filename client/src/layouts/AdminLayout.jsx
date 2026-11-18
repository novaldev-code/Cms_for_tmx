import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SITE_NAME } from '../config/site.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

function DashboardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ArticlesIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h7M9 17h5" />
    </svg>
  );
}

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/admin/artikel', label: 'Artikel', icon: ArticlesIcon },
];

export default function AdminLayout() {
  const { admin, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  async function handleSignOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      await signOut();
      showToast('Anda telah keluar dari area admin.');
      navigate('/login', { replace: true });
    } catch {
      showToast('Gagal keluar. Periksa koneksi lalu coba lagi.', 'error');
    } finally {
      setSigningOut(false);
    }
  }

  const initial = admin?.name?.trim().charAt(0).toUpperCase() || 'A';

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-content">
        Lewati ke konten
      </a>

      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/admin" aria-label={`${SITE_NAME} admin`}>
          <span className="admin-brand__mark" aria-hidden="true">
            M
          </span>
          <span className="admin-brand__text">
            <strong>{SITE_NAME}</strong>
            <span>Area admin</span>
          </span>
        </Link>

        <nav className="admin-nav" aria-label="Navigasi admin">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `admin-nav__link${isActive ? ' is-active' : ''}`
                }
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar__foot">
          <Link className="admin-site-link" to="/">
            Lihat situs publik <span aria-hidden="true">↗</span>
          </Link>

          <div className="admin-account">
            <span className="admin-account__avatar" aria-hidden="true">
              {initial}
            </span>
            <div className="admin-account__text">
              <strong>{admin?.name}</strong>
              <span>{admin?.email}</span>
            </div>
          </div>

          <button
            className="admin-logout"
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? 'Keluar…' : 'Keluar'}
          </button>
        </div>
      </aside>

      <main className="admin-main" id="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
