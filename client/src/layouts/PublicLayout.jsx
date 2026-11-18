import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter.jsx';
import SiteHeader from '../components/SiteHeader.jsx';

export default function PublicLayout() {
  const location = useLocation();
  const { pathname, search, hash } = location;

  useEffect(() => {
    if (hash) {
      let targetId = hash.slice(1);

      try {
        targetId = decodeURIComponent(targetId);
      } catch {
        targetId = '';
      }

      const target = targetId ? document.getElementById(targetId) : null;

      if (target) {
        const reduceMotion =
          window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ??
          false;

        target.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start',
        });
        return;
      }
    }

    window.scrollTo(0, 0);
  }, [location.key, pathname, search, hash]);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Lewati ke konten
      </a>
      <SiteHeader />
      <main className="site-main" id="main-content">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
