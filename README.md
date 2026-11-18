# Mini CMS

Aplikasi web full-stack untuk landing page publik bergaya SaaS, dashboard admin, dan manajemen artikel.
Implementasi mengikuti `PRD.md` dan dikerjakan secara bertahap.

## Status

**Tahap 1 — Fondasi** selesai:

- Workspace npm untuk `client` dan `server`.
- API Express dengan endpoint `GET /api/health`.
- Koneksi SQLite memakai modul bawaan Node.js (`node:sqlite`).
- Frontend React + Vite dengan routing dasar dan halaman 404.
- Konfigurasi environment, pengujian smoke test, dan dokumentasi awal.

**Tahap 2 — Database dan API Artikel** selesai:

- Migration SQLite untuk tabel `admins`, `articles`, dan `schema_migrations`.
- API publik untuk daftar dan detail artikel, hanya artikel `published`.
- API admin untuk dashboard dan CRUD artikel lengkap dengan validasi.
- Pencarian judul, filter status, pagination, serta pengujian API.

**Tahap 3 — Autentikasi** selesai:

- Sesi admin berbasis token acak yang disimpan sebagai hash SHA-256 di SQLite.
- Cookie sesi `HttpOnly`, `SameSite=Lax`, dan `Secure` otomatis pada produksi.
- Endpoint login, logout, dan `me`, plus proteksi CSRF untuk semua mutasi admin.
- Seed admin eksplisit dengan password yang di-hash memakai bcrypt.
- Pengujian login, sesi kedaluwarsa, token CSRF, dan akses tanpa sesi.

**Tahap 4 — Landing Page** selesai:

- Layout publik dengan navbar, footer, dan navigasi yang responsif.
- Landing page berisi hero, pengenalan, artikel terbaru dari API, dan CTA.
- Halaman `/artikel` dengan pagination, loading, error, dan empty state.
- Halaman detail `/artikel/:slug` dengan penanganan 404 untuk artikel draft.
- Seluruh konten artikel berasal dari API dan hanya artikel `published` yang
  ditampilkan.

**Tahap 5 — Antarmuka Admin** selesai:

- Halaman login standalone dengan validasi, pesan gagal generik, dan state loading.
- Rute `/admin` dan seluruh turunannya dilindungi; sesi kedaluwarsa diarahkan
  kembali ke halaman login.
- Dashboard berisi statistik total/terbit/draf dan lima artikel terbaru.
- CRUD artikel lengkap: daftar, pencarian judul, filter status, pagination,
  form tambah, form sunting, dan dialog konfirmasi hapus.
- Notifikasi global untuk keberhasilan dan kegagalan aksi.
- Loading skeleton, error state dengan tombol coba lagi, dan empty state di
  setiap halaman admin.
- Seluruh mutasi mengirim token CSRF; token dan data admin disimpan di memori,
  bukan di `localStorage`.

**Tahap 6 — Pengujian dan Penyempurnaan** selesai:

- Seluruh 17 kriteria penerimaan MVP diverifikasi pada database sementara,
  termasuk persistensi data dan sesi setelah server dimulai ulang.
- 27 test API lulus, build produksi berhasil (71 modul), dan verifikasi E2E
  sementara menjalankan 216 pemeriksaan terhadap API, keamanan, SSR, serta
  build.
- Path tambah artikel diselaraskan dengan PRD menjadi `/admin/artikel/tambah`.
- Audit keamanan endpoint admin mencakup proteksi sesi, cookie flags, CSRF pada
  semua mutasi, validasi backend, batas body, query parameterized, dan
  pencegahan XSS. Respons `/api/auth` dan `/api/admin` kini memakai
  `Cache-Control: no-store`, ditambah header `X-Content-Type-Options`,
  `X-Frame-Options`, dan `Referrer-Policy`.
- Login dibatasi maksimal 5 kegagalan per 15 menit untuk kombinasi IP + email.
  Percobaan berikutnya menerima `429` dengan header `Retry-After`, dan hitungan
  direset setelah login berhasil.
- Audit responsif memperbaiki target sentuh navigasi, pagination, aksi tabel,
  tombol tutup toast, dan tautan footer pada layar sempit. Tabel admin berubah
  menjadi kartu pada lebar <=720px, form menjadi satu kolom, dan login menjadi
  satu panel.
- Pemeriksaan visual interaktif di browser fisik tetap disarankan sebelum demo;
  lingkungan pengembangan ini tidak menyediakan browser headless maupun ADB.
  Layout telah diperiksa melalui breakpoint CSS, render SSR, dan preview build.

**Penyempurnaan — Landing Page SaaS** selesai:

- Halaman `/` memakai layout marketing SaaS: hero dengan mockup dashboard CSS,
  tech strip, bento fitur, langkah kerja, artikel terbaru, FAQ, CTA, dan footer
  empat kolom.
- Header publik baru dilengkapi menu mobile yang accessible, anchor scroll untuk
  `Fitur`, `Cara kerja`, dan `FAQ`, serta CTA masuk admin.
- Seluruh visual dibuat dengan CSS dan inline SVG tanpa dependency baru.
- Build produksi menghasilkan 73 modul, dan 27 test API tetap lulus.

Dengan demikian MVP berada pada kondisi stabil untuk demo lokal sesuai keluaran
Tahap 6 di PRD.

Seluruh endpoint admin memerlukan sesi yang valid. Permintaan tanpa sesi
ditolak dengan `401 Autentikasi diperlukan`, dan mutasi tanpa token CSRF
ditolak dengan `403 Token CSRF tidak valid`.

### Hasil verifikasi Tahap 6

| Kriteria penerimaan | Cakupan verifikasi | Status |
| --- | --- | --- |
| 1–2 | Landing page tampil tanpa login dan mengambil artikel published dari API | Lulus |
| 3–5 | Daftar dan detail publik hanya memuat artikel published; draft 404 | Lulus |
| 6–7 | Login benar berhasil; credential salah ditolak dengan pesan generik | Lulus |
| 8 | Seluruh endpoint admin menolak pengguna tanpa sesi | Lulus |
| 9–10 | Artikel draft dapat dibuat dan tidak muncul di halaman publik | Lulus |
| 11–12 | Draft dapat diterbitkan dan langsung muncul di publik | Lulus |
| 13 | Perubahan artikel tersimpan dan slug lama dipertahankan | Lulus |
| 14 | Hapus artikel memerlukan konfirmasi UI dan token CSRF | Lulus |
| 15 | Pencarian, filter status, dan pagination publik/admin berjalan | Lulus |
| 16 | Logout menghapus sesi dan menolak akses dashboard berikutnya | Lulus |
| 17 | Artikel, akun admin, dan sesi aktif bertahan setelah restart server | Lulus |

Verifikasi dijalankan dengan database sementara, sehingga database lokal tidak
terisi data uji. Perintah utama:

```bash
npm test
npm run build
```

Selain suite API, verifikasi Tahap 6 mencakup pemeriksaan cookie flags, CSRF
pada `POST`/`PUT`/`DELETE`, batas body 1MB, JSON tidak valid, rate limiting
login, SQL injection pada pencarian/slug, escaping konten oleh React, SSR rute
publik/admin, fallback SPA, proxy preview ke API, serta pemindaian bundle
produksi untuk rute lama dan credential.

Respons `/api/auth` dan `/api/admin` memakai `Cache-Control: no-store` agar data
sesi dan draft tidak disimpan cache. API juga mengirim `X-Content-Type-Options:
nosniff`, `X-Frame-Options: DENY`, dan `Referrer-Policy: no-referrer`.

## Teknologi

- React 19 + Vite 7 + React Router
- Express 5 + Zod
- SQLite melalui `node:sqlite` (tanpa dependency native)
- bcryptjs untuk hashing password dan cookie-parser untuk sesi
- JavaScript ESM dan npm workspaces

## Prasyarat

- Node.js 24 atau lebih baru (diuji pada 24.22.3)
- npm 12 atau lebih baru
- Termux Android ARM64 untuk lingkungan pengembangan awal

## Menjalankan

```bash
npm install
npm run dev
```

Setelah kedua proses berjalan:

- Frontend: <http://localhost:5173>
- Landing page: <http://localhost:5173/>
- Daftar artikel: <http://localhost:5173/artikel>
- Login admin: <http://localhost:5173/login>
- Dashboard admin: <http://localhost:5173/admin>
- API health: <http://localhost:3000/api/health>

Vite mem-proxy `/api` ke server Express, jadi browser cukup membuka port `5173`.

## Script

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan API dan frontend sekaligus |
| `npm run dev:server` | Menjalankan API dengan watch mode |
| `npm run dev:client` | Menjalankan Vite dev server |
| `npm run build` | Build frontend untuk produksi |
| `npm run preview -w client` | Menjalankan preview build frontend di port `4173` |
| `npm run db:migrate` | Menerapkan migration database yang belum dijalankan |
| `npm run seed:admin` | Membuat akun admin awal dari environment |
| `npm test` | Menjalankan seluruh test API |

## Struktur

```text
client/                 Frontend React + Vite
client/src/components/  Komponen UI publik dan admin
client/src/contexts/    AuthContext dan ToastContext
client/src/hooks/       Hook pengambilan data dan judul halaman
client/src/layouts/     Layout publik dan admin
client/src/pages/       Halaman publik, admin, dan 404
client/src/services/    Klien API frontend
client/src/styles/      Design token, gaya publik, dan gaya admin
client/src/utils/       Format tanggal dan pembuat slug
server/                 API Express + akses SQLite
server/data/            Database lokal (diabaikan Git)
PRD.md                  Dokumen kebutuhan produk
```

## Halaman publik

| Path | Keterangan |
| --- | --- |
| `/` | Landing page SaaS: hero, mockup dashboard, fitur, cara kerja, artikel terbaru, FAQ, dan CTA |
| `/artikel` | Daftar artikel published dengan pagination 6 per halaman |
| `/artikel/:slug` | Detail artikel published; draft dan slug tidak dikenal menghasilkan 404 |
| `/login` | Halaman login admin (tanpa layout publik) |
| `*` | Halaman 404 |

Daftar dan detail artikel mengambil data dari API. Halaman menampilkan loading,
error dengan tombol coba lagi, serta empty state jika belum ada artikel. Draft
tidak pernah ditampilkan karena endpoint publik hanya membaca `published`.

Artikel dibuat dan diterbitkan melalui antarmuka admin. Setelah diterbitkan,
artikel langsung tersedia di halaman publik.

## Halaman admin

| Path | Keterangan |
| --- | --- |
| `/login` | Login admin; pengguna yang sudah masuk diarahkan ke dashboard |
| `/admin` | Dashboard: statistik dan lima artikel terbaru |
| `/admin/artikel` | Daftar artikel dengan pencarian, filter status, dan pagination 10 per halaman |
| `/admin/artikel/tambah` | Form artikel baru; slug dibuat otomatis dari judul |
| `/admin/artikel/:id/edit` | Form sunting artikel |

Semua rute `/admin` berada di balik `RequireAdmin`. Saat halaman dimuat,
frontend memeriksa sesi melalui `GET /api/auth/me`; jika sesi tidak valid,
pengguna diarahkan ke `/login` dan kembali ke halaman tujuan setelah berhasil
masuk.

Perilaku penting:

- Judul dan isi wajib diisi; batas panjang mengikuti validasi backend.
- Slug otomatis mengikuti judul sampai slug disunting manual. Pada mode sunting,
  slug lama dipertahankan agar tautan publik tidak berubah.
- Status dapat disimpan sebagai `draft` atau `published`.
- Pencarian dan filter disimpan di query string sehingga dapat dibagikan atau
  dimuat ulang tanpa kehilangan konteks.
- Tombol hapus selalu membuka dialog konfirmasi dan membutuhkan token CSRF.
- Notifikasi sukses/gagal tampil di kanan bawah dan hilang otomatis.
- Data autentikasi hanya disimpan di memori; memuat ulang halaman akan memeriksa
  ulang sesi melalui cookie `HttpOnly`.

## Konfigurasi

Aplikasi berjalan dengan nilai default tanpa file `.env`. Untuk mengubah konfigurasi:

```bash
cp .env.example .env
```

File `.env` diabaikan Git dan tidak boleh berisi credential yang di-commit.

Variabel yang tersedia:

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `PORT` | `3000` | Port API Express |
| `SITE_NAME` | `Mini CMS` | Nama situs pada API |
| `DATABASE_PATH` | `server/data/mini-cms.db` | Lokasi file SQLite |
| `SESSION_TTL_HOURS` | `168` | Masa berlaku sesi admin (jam) |
| `COOKIE_SECURE` | `true` di produksi | Kirim cookie hanya melalui HTTPS |
| `TRUST_PROXY` | `false` | Percayai header `X-Forwarded-*` dari reverse proxy tepercaya; aktifkan hanya jika API tidak dapat diakses langsung |
| `ADMIN_NAME` | — | Nama admin untuk seed |
| `ADMIN_EMAIL` | — | Email admin untuk seed |
| `ADMIN_PASSWORD` | — | Password seed, minimal 12 karakter |
| `VITE_API_PROXY_TARGET` | `http://127.0.0.1:3000` | Target proxy `/api` untuk Vite dev/preview |

## Seed admin awal

Akun admin tidak dibuat otomatis. Isi kredensial pada `.env` lokal atau
environment, lalu jalankan:

```bash
ADMIN_NAME="Admin" \
ADMIN_EMAIL="admin@example.com" \
ADMIN_PASSWORD="ganti-dengan-password-kuat" \
npm run seed:admin
```

Password di-hash dengan bcrypt sebelum disimpan; nilai asli tidak pernah masuk
database. Seed bersifat idempoten: jika email sudah terdaftar, seed dilewati dan
password lama tidak ditimpa. Perintah ini tidak boleh dijalankan dengan password
contoh di database produksi.

## API

Semua endpoint memakai prefix `/api` dan respons JSON dengan bentuk
`{ success, data, message }` atau `{ success, message, errors }`.

### Endpoint publik

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/api/articles` | Daftar artikel published; query `page`, `limit` |
| `GET` | `/api/articles/:slug` | Detail artikel published |
| `GET` | `/api/site` | Informasi dasar situs |
| `GET` | `/api/health` | Status server dan database |

### Endpoint autentikasi

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Login dengan `email` dan `password` |
| `GET` | `/api/auth/me` | Data admin dan token CSRF untuk sesi aktif |
| `POST` | `/api/auth/logout` | Mengakhiri sesi; wajib menyertakan token CSRF |

Login yang berhasil mengembalikan data admin dan `csrfToken`, serta mengeset
cookie `mini_cms_session`. Cookie bersifat `HttpOnly`, `SameSite=Lax`, dan
`Secure` ketika `COOKIE_SECURE=true`. Kegagalan login selalu memakai pesan
generik `Email atau password salah`.

Untuk mencegah brute force, login dibatasi maksimal 5 kegagalan per 15 menit
untuk kombinasi IP + email. Setelah batas tercapai, server membalas `429` dengan
header `Retry-After` dan pesan `Terlalu banyak percobaan login...`. Login yang
berhasil mereset hitungan untuk kombinasi tersebut.

### Endpoint admin

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/api/admin/dashboard` | Statistik dan artikel terbaru |
| `GET` | `/api/admin/articles` | Semua artikel; query `page`, `limit`, `q`, `status` |
| `POST` | `/api/admin/articles` | Membuat artikel |
| `GET` | `/api/admin/articles/:id` | Detail artikel untuk admin |
| `PUT` | `/api/admin/articles/:id` | Memperbarui artikel |
| `DELETE` | `/api/admin/articles/:id` | Menghapus artikel |

Endpoint admin dilindungi sesi admin dan CSRF. Klien mengirim cookie sesi dan
header `X-CSRF-Token` untuk setiap `POST`, `PUT`, dan `DELETE`. Token diperoleh
dari respons login atau `GET /api/auth/me`. Request `GET` tidak memerlukan token.

## Database

Database default berada di `server/data/mini-cms.db` dan dibuat otomatis.
Migration dijalankan saat server mulai, atau secara manual dengan
`npm run db:migrate`. WAL, foreign key, dan busy timeout sudah diaktifkan.

Tabel yang tersedia:

- `articles` — data artikel dengan status `draft` atau `published`.
- `admins` — akun admin dengan password ter-hash.
- `sessions` — sesi aktif; token disimpan sebagai hash dan memiliki masa berlaku.
- `schema_migrations` — riwayat migration yang sudah diterapkan.

## Pengujian manual

```bash
npm test
npm run build
curl http://127.0.0.1:3000/api/health
curl http://127.0.0.1:3000/api/articles
curl -i http://127.0.0.1:3000/api/admin/dashboard
```

Buka `http://localhost:5173/`, `/artikel`, dan detail salah satu artikel untuk
memeriksa tampilan publik. Buka `http://localhost:5173/login`, masuk dengan akun
hasil seed, lalu periksa dashboard, tambah artikel, pencarian, filter status,
pagination, sunting, dan hapus. Endpoint admin harus mengembalikan `401` tanpa
cookie sesi. Untuk menguji alur API secara langsung, simpan cookie login:

```bash
curl -c cookies.txt -H 'content-type: application/json' \
  -d '{"email":"admin@example.com","password":"password-anda"}' \
  http://127.0.0.1:3000/api/auth/login

curl -b cookies.txt http://127.0.0.1:3000/api/auth/me
```

Untuk menguji rate limiting, kirim enam percobaan login dengan password salah
dari IP yang sama. Lima percobaan pertama menghasilkan `401`, percobaan keenam
menghasilkan `429` dengan header `Retry-After`. Login dengan password benar juga
tetap ditolak sampai jendela 15 menit berakhir atau server dimulai ulang.

Pemeriksaan responsif manual disarankan pada lebar 360px, 720px, 960px, dan
desktop:

- Header publik tetap muat tanpa overflow; navigasi dan tautan footer nyaman
  disentuh.
- Tabel admin berubah menjadi daftar kartu pada lebar <=720px dan aksi
  sunting/hapus tetap terlihat.
- Form artikel, field slug, pratinjau sampul, dan tombol aksi tidak melebar
  keluar layar; textarea tetap dapat digulir.
- Dialog konfirmasi hapus, toast, pagination, dan halaman login dapat digunakan
  dengan satu tangan.
- Tidak ada teks panjang, judul artikel, atau URL sampul yang memotong layout.

Jangan menyimpan file cookie atau kredensial asli di dalam repositori. Restart
server setelah pengujian untuk memastikan sesi dan data tetap tersimpan.

## Batasan dan risiko yang tersisa

- Rate limiter login disimpan di memori per proses, sehingga hitungan kembali
  ke nol saat server dimulai ulang. Untuk deployment multi-instance, gunakan
  penyimpanan bersama atau rate limiter di edge. Jika API berada di belakang
  reverse proxy tepercaya, aktifkan `TRUST_PROXY=true` agar `req.ip` memakai IP
  klien; jangan aktifkan opsi ini bila API dapat diakses langsung dari publik.
- Header keamanan HTML, CSP, dan TLS tidak diatur oleh Vite dev/preview. Gunakan
  reverse proxy produksi untuk menambahkan header tersebut dan mengaktifkan
  HTTPS; cookie produksi sudah memakai `Secure` secara default.
- Verifikasi visual interaktif membutuhkan browser fisik atau browser headless
  yang tidak tersedia di lingkungan pengembangan ini. Layout telah diaudit lewat
  breakpoint CSS, render SSR, dan preview build.
- SQLite cocok untuk demo lokal satu proses. Untuk trafik produksi, siapkan
  backup database, monitoring ukuran file, dan strategi deployment yang sesuai.

## Catatan Termux

npm 12 dapat memblokir postinstall `esbuild` melalui kebijakan `allowScripts`.
Pada lingkungan ini build dan dev server tetap berjalan karena paket binary
`@esbuild/android-arm64` terpasang sebagai optional dependency. Jika suatu saat
Vite gagal menemukan binary esbuild, tinjau script dengan
`npm install-scripts ls` sebelum memberikan izin.
