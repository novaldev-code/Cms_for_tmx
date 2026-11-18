import { Link } from 'react-router-dom';
import ArticleCard from '../../components/ArticleCard.jsx';
import ArticleCardSkeleton from '../../components/ArticleCardSkeleton.jsx';
import StatePanel from '../../components/StatePanel.jsx';
import {
  ArrowRightIcon,
  CheckIcon,
  DevicesIcon,
  GaugeIcon,
  LayersIcon,
  PenIcon,
  SearchIcon,
  ShieldIcon,
} from '../../components/landing/LandingIcons.jsx';
import { SITE_NAME } from '../../config/site.js';
import { useApiResource } from '../../hooks/useApiResource.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

const LATEST_ARTICLES_PATH = '/api/articles?page=1&limit=3';

const FEATURES = [
  {
    id: 'editor',
    icon: PenIcon,
    title: 'Editor yang fokus',
    description:
      'Tulis judul, ringkasan, dan isi artikel dalam satu formulir yang bersih. Slug dibuat otomatis dari judul dan tetap bisa disesuaikan.',
    size: 'editor',
    visual: (
      <div className="bento-editor" aria-hidden="true">
        <div className="bento-editor__bar">
          <span />
          <span />
          <span />
        </div>
        <span className="bento-editor__line bento-editor__line--title" />
        <span className="bento-editor__line" />
        <span className="bento-editor__line bento-editor__line--short" />
        <span className="bento-editor__caret" />
      </div>
    ),
  },
  {
    id: 'draft',
    icon: LayersIcon,
    title: 'Draf dan publikasi',
    description:
      'Simpan sebagai draf, lalu terbitkan saat sudah siap. Pengunjung hanya melihat artikel yang berstatus published.',
    size: 'draft',
    visual: (
      <div className="bento-status" aria-hidden="true">
        <span className="bento-status__pill bento-status__pill--draft">
          Draf
        </span>
        <span className="bento-status__pill bento-status__pill--published">
          Terbit
        </span>
        <span className="bento-status__hint">Status artikel</span>
      </div>
    ),
  },
  {
    id: 'search',
    icon: SearchIcon,
    title: 'Cari dan filter',
    description:
      'Temukan artikel lewat pencarian, filter status, dan pagination yang tetap nyaman di layar kecil.',
    size: 'small',
    visual: (
      <>
        <div className="bento-search" aria-hidden="true">
          <SearchIcon />
          <span>Cari judul atau isi…</span>
        </div>
        <div className="bento-chips" aria-hidden="true">
          <span>Semua</span>
          <span className="is-active">Terbit</span>
          <span>Draf</span>
        </div>
      </>
    ),
  },
  {
    id: 'security',
    icon: ShieldIcon,
    title: 'Keamanan admin',
    description:
      'Password di-hash dengan bcrypt, sesi HttpOnly, dan token CSRF untuk setiap perubahan data.',
    size: 'small',
    visual: (
      <div className="bento-tags" aria-hidden="true">
        <span>HttpOnly</span>
        <span>SameSite</span>
        <span>CSRF</span>
        <span>bcrypt</span>
      </div>
    ),
  },
  {
    id: 'responsive',
    icon: DevicesIcon,
    title: 'Nyaman di semua layar',
    description:
      'Dari 360px sampai desktop, tabel admin berubah menjadi kartu dan formulir tetap mudah digunakan.',
    size: 'small',
    visual: (
      <div className="bento-devices" aria-hidden="true">
        <span className="bento-device bento-device--desktop">
          <span />
          <span />
        </span>
        <span className="bento-device bento-device--phone">
          <span />
        </span>
      </div>
    ),
  },
  {
    id: 'rate-limit',
    icon: GaugeIcon,
    title: 'Login yang dibatasi',
    description:
      'Maksimal 5 percobaan per 15 menit untuk kombinasi IP dan email. Percobaan berlebih menerima 429 dengan header Retry-After.',
    size: 'full',
    visual: (
      <div className="limit-visual" aria-hidden="true">
        <div className="limit-visual__top">
          <span>Percobaan login</span>
          <strong>Batas 5</strong>
        </div>
        <div className="limit-meter">
          <span />
          <span />
          <span />
          <span />
          <span className="is-blocked" />
        </div>
        <div className="limit-visual__footer">
          <span className="limit-dot" />
          Percobaan ke-6 ditolak
        </div>
      </div>
    ),
  },
];

const STEPS = [
  {
    title: 'Tulis',
    description:
      'Mulai dari judul, ringkasan, dan isi. Editor menyimpan slug otomatis agar URL tetap rapi.',
  },
  {
    title: 'Rapikan',
    description:
      'Simpan sebagai draf, tinjau ulang, dan atur sampul artikel sebelum dipublikasikan.',
  },
  {
    title: 'Terbitkan',
    description:
      'Ubah status menjadi published. Artikel langsung muncul di arsip publik dan halaman terbaru.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Apakah pengunjung perlu akun untuk membaca?',
    answer:
      'Tidak. Seluruh artikel yang sudah diterbitkan bisa dibaca langsung tanpa registrasi.',
  },
  {
    question: 'Siapa yang bisa masuk ke area admin?',
    answer:
      'Hanya akun admin yang dibuat melalui perintah seed. Tidak ada pendaftaran publik, sehingga area pengelolaan tetap tertutup.',
  },
  {
    question: 'Apakah draf bisa dilihat pengunjung?',
    answer:
      'Tidak. API publik hanya mengembalikan artikel berstatus published. Draf hanya terlihat di dashboard admin.',
  },
  {
    question: 'Di mana data artikel disimpan?',
    answer:
      'Di database SQLite pada server. Lokasinya dapat diatur lewat DATABASE_PATH, dan file database sebaiknya di-backup secara berkala.',
  },
  {
    question: 'Bagaimana keamanan login admin?',
    answer:
      'Password disimpan sebagai hash bcrypt, sesi memakai cookie HttpOnly, mutasi dilindungi CSRF, dan login dibatasi 5 percobaan per 15 menit.',
  },
  {
    question: 'Apakah tampilannya nyaman di HP?',
    answer:
      'Ya. Navigasi, kartu artikel, formulir, dan tabel admin dirancang responsif mulai dari lebar 360px.',
  },
];

export default function Landing() {
  useDocumentTitle(`${SITE_NAME} — CMS ringan untuk menerbitkan artikel`);

  const { status, data, error, reload } = useApiResource(LATEST_ARTICLES_PATH);
  const articles = data?.items ?? [];

  return (
    <div className="landing">
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="landing-container landing-hero__inner">
          <div className="landing-hero__copy">
            <p className="landing-badge">
              <span className="landing-badge__dot" aria-hidden="true" />
              CMS ringan untuk penerbitan modern
            </p>

            <h1 id="hero-title">
              Konten rapi.
              <br />
              <span className="landing-gradient-text">Tanpa ribet.</span>
            </h1>

            <p className="landing-hero__lead">
              {SITE_NAME} membantu tim kecil menulis, mengelola draf, dan
              menerbitkan artikel dari satu dashboard yang sederhana. Pengunjung
              cukup datang dan membaca.
            </p>

            <div className="landing-actions">
              <Link className="button button--large" to="/artikel">
                Jelajahi artikel
                <ArrowRightIcon />
              </Link>
              <Link
                className="button button--secondary button--large"
                to="/login"
              >
                Masuk admin
              </Link>
            </div>

            <ul className="landing-hero__points">
              <li>
                <CheckIcon />
                Dibaca tanpa akun
              </li>
              <li>
                <CheckIcon />
                Draf aman sampai siap
              </li>
              <li>
                <CheckIcon />
                Nyaman di HP dan desktop
              </li>
            </ul>
          </div>

          <div className="landing-hero__visual" aria-hidden="true">
            <div className="dashboard-mockup">
              <div className="dashboard-mockup__chrome">
                <span className="chrome-dot chrome-dot--red" />
                <span className="chrome-dot chrome-dot--amber" />
                <span className="chrome-dot chrome-dot--green" />
                <span className="dashboard-mockup__url">
                  mini-cms.local/admin
                </span>
              </div>

              <div className="dashboard-mockup__body">
                <div className="mock-sidebar">
                  <div className="mock-sidebar__brand">
                    <span>M</span>
                    Mini CMS
                  </div>
                  <div className="mock-nav-item is-active">
                    <span className="mock-dot" />
                    Dashboard
                  </div>
                  <div className="mock-nav-item">
                    <span className="mock-dot" />
                    Artikel
                  </div>
                  <div className="mock-nav-item">
                    <span className="mock-dot" />
                    Pengaturan
                  </div>
                  <div className="mock-sidebar__spacer" />
                  <div className="mock-nav-item">
                    <span className="mock-dot" />
                    Admin
                  </div>
                </div>

                <div className="mock-main">
                  <div className="mock-topbar">
                    <strong>Ringkasan</strong>
                    <span className="mock-pill">Live</span>
                  </div>

                  <div className="mock-stats">
                    <div className="mock-stat">
                      <span>Artikel</span>
                      <strong>24</strong>
                    </div>
                    <div className="mock-stat">
                      <span>Draf</span>
                      <strong>4</strong>
                    </div>
                    <div className="mock-stat">
                      <span>Terbit</span>
                      <strong>20</strong>
                    </div>
                  </div>

                  <div className="mock-chart">
                    <span className="mock-chart__bar" />
                    <span className="mock-chart__bar" />
                    <span className="mock-chart__bar" />
                    <span className="mock-chart__bar" />
                    <span className="mock-chart__bar" />
                    <span className="mock-chart__bar" />
                    <span className="mock-chart__bar" />
                  </div>

                  <div className="mock-table">
                    <div className="mock-row">
                      <span className="mock-row__dot" />
                      <span className="mock-row__lines">
                        <span className="mock-row__line" />
                        <span className="mock-row__line mock-row__line--short" />
                      </span>
                      <span className="mock-row__badge" />
                    </div>
                    <div className="mock-row">
                      <span className="mock-row__dot" />
                      <span className="mock-row__lines">
                        <span className="mock-row__line" />
                        <span className="mock-row__line mock-row__line--short" />
                      </span>
                      <span className="mock-row__badge" />
                    </div>
                    <div className="mock-row">
                      <span className="mock-row__dot" />
                      <span className="mock-row__lines">
                        <span className="mock-row__line" />
                        <span className="mock-row__line mock-row__line--short" />
                      </span>
                      <span className="mock-row__badge" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="floating-card floating-card--publish">
              <span className="floating-card__icon">
                <CheckIcon />
              </span>
              <span>
                <strong>Artikel diterbitkan</strong>
                <small>Langsung tampil di arsip</small>
              </span>
            </div>

            <div className="floating-card floating-card--secure">
              <span className="floating-card__icon">
                <ShieldIcon />
              </span>
              <span>
                <strong>Sesi terlindungi</strong>
                <small>HttpOnly + CSRF</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-strip" aria-label="Teknologi yang digunakan">
        <div className="landing-container landing-strip__inner">
          <p>Dibangun untuk sederhana</p>
          <ul>
            <li>
              <CheckIcon />
              React
            </li>
            <li>
              <CheckIcon />
              Express
            </li>
            <li>
              <CheckIcon />
              SQLite
            </li>
            <li>
              <CheckIcon />
              Termux-ready
            </li>
            <li>
              <CheckIcon />
              Responsif
            </li>
          </ul>
        </div>
      </section>

      <section
        className="landing-section"
        id="fitur"
        aria-labelledby="fitur-title"
      >
        <div className="landing-container">
          <div className="landing-section__heading">
            <div>
              <p className="landing-eyebrow">Fitur</p>
              <h2 id="fitur-title">Semua yang perlu. Tanpa yang tidak.</h2>
              <p>
                Alur konten yang jelas untuk menulis, menyimpan draf, dan
                menerbitkan artikel tanpa distraksi.
              </p>
            </div>
            <Link className="landing-section__link" to="/artikel">
              Lihat artikel
              <ArrowRightIcon />
            </Link>
          </div>

          <div className="landing-bento">
            {FEATURES.map(
              ({ id, icon: Icon, title, description, size, visual }) => (
                <article
                  key={id}
                  className={`bento-card bento-card--${size}`}
                >
                  <span className="bento-card__icon">
                    <Icon />
                  </span>
                  <div className="bento-card__copy">
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                  {visual ? (
                    <div className="bento-card__visual">{visual}</div>
                  ) : null}
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        className="landing-section landing-section--tinted"
        id="cara-kerja"
        aria-labelledby="cara-kerja-title"
      >
        <div className="landing-container">
          <div className="landing-section__heading">
            <div>
              <p className="landing-eyebrow">Cara kerja</p>
              <h2 id="cara-kerja-title">
                Dari ide sampai terbit, dalam tiga langkah.
              </h2>
              <p>
                Tidak perlu alur yang rumit. Fokus pada tulisan, bukan pada
                pengaturannya.
              </p>
            </div>
          </div>

          <ol className="landing-steps">
            {STEPS.map((step, index) => (
              <li className="landing-step" key={step.title}>
                <span className="landing-step__number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="latest-title">
        <div className="landing-container">
          <div className="landing-section__heading">
            <div>
              <p className="landing-eyebrow">Dari arsip</p>
              <h2 id="latest-title">Artikel terbaru</h2>
              <p>
                Tulisan yang baru saja diterbitkan, siap dibaca tanpa akun.
              </p>
            </div>
            <Link className="landing-section__link" to="/artikel">
              Lihat semua artikel
              <ArrowRightIcon />
            </Link>
          </div>

          {status === 'loading' ? (
            <>
              <p className="sr-only" role="status">
                Memuat artikel terbaru…
              </p>
              <div className="article-grid" aria-hidden="true">
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
              </div>
            </>
          ) : null}

          {status === 'error' ? (
            <StatePanel
              tone="error"
              eyebrow="Koneksi"
              title="Artikel belum dapat dimuat"
              description={error?.message}
              action={
                <button className="button" type="button" onClick={reload}>
                  Coba lagi
                </button>
              }
            />
          ) : null}

          {status === 'success' && articles.length === 0 ? (
            <StatePanel
              eyebrow="Arsip"
              title="Belum ada artikel yang diterbitkan"
              description="Tulisan pertama sedang disiapkan. Silakan kembali lagi nanti."
              action={
                <Link className="button button--secondary" to="/artikel">
                  Buka arsip
                </Link>
              }
            />
          ) : null}

          {status === 'success' && articles.length > 0 ? (
            <div className="article-grid">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section
        className="landing-section landing-section--tinted"
        id="faq"
        aria-labelledby="faq-title"
      >
        <div className="landing-container landing-faq">
          <div className="landing-faq__intro">
            <p className="landing-eyebrow">FAQ</p>
            <h2 id="faq-title">Pertanyaan yang sering muncul.</h2>
            <p>
              Hal-hal dasar tentang cara membaca, mengelola, dan mengamankan
              konten di {SITE_NAME}.
            </p>
            <Link className="landing-section__link" to="/login">
              Masuk ke dashboard
              <ArrowRightIcon />
            </Link>
          </div>

          <div className="landing-faq__list">
            {FAQ_ITEMS.map((item) => (
              <details className="faq-item" key={item.question}>
                <summary>
                  <span>{item.question}</span>
                  <span className="faq-item__icon" aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-cta-wrap" aria-labelledby="cta-title">
        <div className="landing-container">
          <div className="landing-cta">
            <div className="landing-cta__inner">
              <div>
                <p className="landing-eyebrow">Siap mulai?</p>
                <h2 id="cta-title">Rapikan konten, lalu terbitkan.</h2>
                <p>
                  Buka arsip untuk melihat hasilnya, atau masuk ke dashboard
                  untuk mulai menulis.
                </p>
              </div>
              <div className="landing-cta__actions">
                <Link className="button button--inverse" to="/artikel">
                  Jelajahi artikel
                </Link>
                <Link className="button button--ghost-light" to="/login">
                  Masuk admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
