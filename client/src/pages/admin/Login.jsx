import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SITE_NAME } from '../../config/site.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

function resolveRedirect(location) {
  const from = location.state?.from;

  if (
    from &&
    typeof from.pathname === 'string' &&
    from.pathname.startsWith('/admin')
  ) {
    return `${from.pathname}${from.search ?? ''}`;
  }

  return '/admin';
}

export default function Login() {
  useDocumentTitle(`Masuk admin · ${SITE_NAME}`);

  const { status, signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = resolveRedirect(location);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={redirectTo} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));

    if (error) {
      setError('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const data = await signIn({
        email: form.email.trim(),
        password: form.password,
      });

      showToast(`Selamat datang, ${data.admin.name}.`);
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
      setForm((current) => ({ ...current, password: '' }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login">
      <section className="login__brand" aria-labelledby="login-brand-title">
        <div className="login__brand-inner">
          <Link className="login__brand-link" to="/">
            <span className="login__mark" aria-hidden="true">
              M
            </span>
            <span>{SITE_NAME}</span>
          </Link>

          <div className="login__brand-copy">
            <p className="eyebrow">Ruang kerja editorial</p>
            <h1 id="login-brand-title">
              Kelola tulisan tanpa mengalihkan perhatian.
            </h1>
            <p>
              Masuk untuk menulis, menyunting, dan menerbitkan artikel dari satu
              tempat yang tenang.
            </p>
          </div>

          <ul className="login__facts">
            <li>
              <span aria-hidden="true">01</span>
              Tulis dan simpan draf kapan saja
            </li>
            <li>
              <span aria-hidden="true">02</span>
              Atur status terbit dengan jelas
            </li>
            <li>
              <span aria-hidden="true">03</span>
              Pantau isi arsip dari dashboard
            </li>
          </ul>

          <p className="login__brand-note">
            Area khusus admin. Sesi berakhir otomatis demi keamanan.
          </p>
        </div>
      </section>

      <section className="login__panel" aria-labelledby="login-title">
        <div className="login__card">
          <Link className="login__back" to="/">
            <span aria-hidden="true">←</span> Kembali ke situs
          </Link>

          <p className="eyebrow">Admin</p>
          <h2 id="login-title">Masuk ke dashboard</h2>
          <p className="login__intro">
            Gunakan email dan password admin yang sudah terdaftar.
          </p>

          {error ? (
            <div className="login__error" role="alert">
              <strong>Login gagal.</strong>
              <span>{error}</span>
            </div>
          ) : null}

          <form className="login__form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                className="input"
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                value={form.email}
                onChange={handleChange}
                placeholder="nama@contoh.com"
                required
                autoFocus
              />
            </div>

            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input
                className="input"
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                required
              />
            </div>

            <button
              className="button login__submit"
              type="submit"
              disabled={submitting || !form.email || !form.password}
            >
              {submitting ? 'Memeriksa…' : 'Masuk'}
            </button>
          </form>

          <p className="login__help">
            Belum punya akun? Admin dibuat melalui perintah seed di server.
          </p>
        </div>
      </section>
    </main>
  );
}
