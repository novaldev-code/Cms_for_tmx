# Product Requirements Document (PRD)

## Mini CMS --- Landing Page, Admin Dashboard, dan Manajemen Artikel

-   **Versi:** 1.0
-   **Status:** Draft untuk MVP
-   **Target lingkungan:** Android Termux + OpenCode
-   **Bahasa antarmuka:** Bahasa Indonesia
-   **Jenis aplikasi:** Web full-stack

------------------------------------------------------------------------

## 1. Ringkasan Produk

Mini CMS adalah aplikasi pengelolaan konten berbasis web. Pengunjung
dapat melihat landing page dan artikel yang sudah dipublikasikan. Admin
dapat masuk ke dashboard untuk membuat, membaca, memperbarui, mencari,
dan menghapus artikel.

Produk ini menggabungkan tiga bagian utama:

1.  **Landing page publik** untuk memperkenalkan situs dan menampilkan
    konten.
2.  **Dashboard admin** sebagai area pengelolaan yang dilindungi
    autentikasi.
3.  **Modul CRUD artikel** untuk mengelola konten yang tampil di halaman
    publik.

MVP harus sederhana untuk dikembangkan dan dijalankan secara lokal
melalui Termux, tetapi struktur kode tetap rapi agar dapat dikembangkan
dan dideploy ke server di kemudian hari.

## 2. Tujuan Produk

-   Menyediakan landing page publik yang profesional dan responsif.
-   Menyediakan dashboard admin yang mudah digunakan.
-   Memungkinkan admin mengelola artikel tanpa mengubah kode.
-   Menampilkan artikel berstatus `published` secara otomatis di halaman
    publik.
-   Menyediakan fondasi aplikasi yang aman dan mudah dikembangkan.

### 2.1 Indikator keberhasilan

MVP dianggap berhasil apabila:

-   Pengunjung dapat membuka landing page tanpa login.
-   Pengunjung dapat melihat daftar dan detail artikel yang
    dipublikasikan.
-   Admin dapat login dan logout.
-   Admin dapat melakukan seluruh operasi CRUD artikel.
-   Artikel berstatus draft tidak terlihat oleh pengunjung.
-   Perubahan artikel di dashboard tercermin pada halaman publik.
-   Aplikasi dapat dijalankan secara lokal di Termux dan dibuka melalui
    browser HP.

## 3. Target Pengguna dan Hak Akses

### 3.1 Pengunjung

Pengunjung adalah pengguna publik yang tidak perlu memiliki akun.

Hak akses: - Melihat landing page. - Melihat daftar artikel yang
dipublikasikan. - Membuka detail artikel yang dipublikasikan. -
Menjelajahi artikel melalui pagination.

Pengunjung tidak boleh: - Membuka dashboard admin. - Membuat, mengubah,
atau menghapus artikel. - Melihat artikel draft.

### 3.2 Admin

Admin adalah pengguna yang memiliki akun dan dapat mengakses dashboard.

Hak akses: - Login dan logout. - Melihat ringkasan dashboard. - Melihat
daftar artikel. - Membuat artikel. - Mengubah artikel. - Menghapus
artikel. - Mengubah status artikel antara draft dan published.

MVP hanya membutuhkan satu peran, yaitu `admin`. Registrasi publik tidak
disediakan.

## 4. Ruang Lingkup MVP

### 4.1 Termasuk dalam MVP

-   Landing page publik.
-   Halaman daftar artikel.
-   Halaman detail artikel.
-   Login dan logout admin.
-   Dashboard admin.
-   CRUD artikel.
-   Status artikel: draft dan published.
-   Pencarian artikel di dashboard.
-   Filter status artikel.
-   Pagination daftar artikel.
-   Validasi input di frontend dan backend.
-   Penyimpanan data menggunakan SQLite.
-   Tampilan responsif untuk HP dan desktop.
-   Seed atau mekanisme awal untuk membuat akun admin.

### 4.2 Tidak termasuk dalam MVP

Fitur berikut tidak perlu dibuat pada tahap pertama:

-   Multi-user dengan role dan permission kompleks.
-   Registrasi akun publik.
-   Komentar dan moderasi komentar.
-   Editor kolaboratif.
-   Upload media ke cloud.
-   Integrasi AI.
-   Newsletter dan email marketing.
-   Analytics tingkat lanjut.
-   Multi-bahasa.
-   Pembayaran atau langganan.
-   Aplikasi mobile native.

Fitur di luar ruang lingkup tidak boleh ditambahkan tanpa persetujuan.

## 5. Struktur Halaman dan Navigasi

### 5.1 Halaman publik

  Halaman           Path               Keterangan
  ----------------- ------------------ ----------------------------------------------
  Landing page      `/`                Hero, pengenalan situs, artikel terbaru, CTA
  Daftar artikel    `/artikel`         Daftar artikel yang published
  Detail artikel    `/artikel/:slug`   Konten lengkap berdasarkan slug
  Login admin       `/login`           Form login admin
  Tidak ditemukan   `*`                Halaman 404

### 5.2 Halaman admin

Semua halaman admin, kecuali login, wajib dilindungi autentikasi.

  ---------------------------------------------------------------------------
  Halaman                 Path                        Keterangan
  ----------------------- --------------------------- -----------------------
  Dashboard               `/admin`                    Ringkasan statistik dan
                                                      artikel terbaru

  Daftar artikel          `/admin/artikel`            Tabel artikel,
                                                      pencarian, filter,
                                                      pagination

  Tambah artikel          `/admin/artikel/tambah`     Form pembuatan artikel

  Edit artikel            `/admin/artikel/:id/edit`   Form pengubahan artikel
  ---------------------------------------------------------------------------

Navigasi admin minimal: - Dashboard - Artikel - Lihat situs - Logout

## 6. Kebutuhan Fungsional

### FR-01 --- Landing Page

Landing page harus: - Memiliki navbar dengan identitas/nama situs. -
Memiliki hero section berisi headline, deskripsi singkat, dan CTA. -
Memiliki bagian pengenalan atau keunggulan situs. - Menampilkan beberapa
artikel terbaru yang berstatus published. - Memiliki footer. -
Menyediakan navigasi menuju daftar artikel. - Memiliki layout responsif
untuk layar HP dan desktop.

Konten artikel pada landing page harus berasal dari API, bukan ditulis
statis di komponen frontend.

### FR-02 --- Daftar Artikel Publik

Halaman `/artikel` harus: - Hanya menampilkan artikel berstatus
published. - Menampilkan judul, excerpt, tanggal publikasi, dan gambar
sampul jika tersedia. - Menyediakan pagination. - Menampilkan empty
state jika belum ada artikel. - Mengarahkan pengguna ke halaman detail
saat artikel dipilih.

### FR-03 --- Detail Artikel

Halaman `/artikel/:slug` harus: - Mengambil artikel berdasarkan slug. -
Hanya menampilkan artikel published. - Menampilkan judul, tanggal
publikasi, gambar sampul jika tersedia, dan isi artikel. - Menampilkan
halaman 404 jika artikel tidak ditemukan atau masih draft.

### FR-04 --- Autentikasi Admin

Sistem harus: - Menyediakan form login dengan email/username dan
password. - Memverifikasi password menggunakan password hashing yang
aman. - Membuat sesi login setelah autentikasi berhasil. - Menyediakan
logout yang mengakhiri sesi. - Menolak akses ke seluruh endpoint admin
tanpa sesi valid. - Mengarahkan admin yang sudah login agar tidak perlu
kembali ke halaman login. - Tidak menyediakan registrasi publik.

Keamanan minimum: - Password tidak boleh disimpan dalam bentuk
plaintext. - Cookie sesi harus menggunakan `HttpOnly`. - Gunakan
`SameSite` yang sesuai dan `Secure` pada lingkungan HTTPS. - Terapkan
validasi input di server. - Pesan login gagal tidak boleh membocorkan
apakah username atau password yang salah. - Rahasia aplikasi disimpan
melalui environment variable, bukan di repository.

### FR-05 --- Dashboard Admin

Dashboard harus menampilkan: - Jumlah seluruh artikel. - Jumlah artikel
published. - Jumlah artikel draft. - Daftar artikel terbaru. - Tombol
atau tautan untuk menambah artikel. - Navigasi menuju manajemen artikel.

Angka statistik harus berasal dari database/API.

### FR-06 --- Manajemen Artikel

Admin dapat melakukan operasi berikut:

**Create** - Membuat artikel baru. - Mengisi judul, slug, excerpt, isi,
URL gambar sampul, dan status. - Slug dibuat otomatis dari judul, tetapi
tetap dapat disunting. - Sistem menolak slug duplikat.

**Read** - Melihat daftar artikel. - Melihat status dan tanggal
pembuatan/pembaruan. - Membuka halaman edit artikel.

**Update** - Mengubah seluruh informasi artikel. - Mengubah status
draft/published. - Menyimpan perubahan ke database.

**Delete** - Menghapus artikel melalui konfirmasi. - Setelah berhasil,
artikel tidak lagi tersedia di dashboard maupun halaman publik.

Daftar artikel admin harus mendukung: - Pencarian berdasarkan judul. -
Filter berdasarkan status. - Pagination. - Indikator loading, error, dan
empty state.

### FR-07 --- Status Publikasi

Status yang didukung: - `draft`: hanya dapat dilihat admin. -
`published`: dapat dilihat publik.

Aturan: - Artikel baru secara default berstatus draft. - Artikel hanya
tampil di halaman publik jika statusnya published. - Ketika artikel
published diubah menjadi draft, halaman publik tidak boleh lagi
menampilkannya. - `published_at` diisi saat artikel pertama kali
dipublikasikan atau ketika dipublikasikan kembali sesuai implementasi
yang konsisten.

### FR-08 --- Validasi dan Umpan Balik

-   Field wajib harus divalidasi.
-   Judul dan slug tidak boleh kosong.
-   Slug harus unik.
-   URL gambar, jika diisi, harus memiliki format URL yang valid.
-   Isi artikel tidak boleh kosong.
-   Tampilkan pesan sukses setelah operasi berhasil.
-   Tampilkan pesan error yang mudah dipahami jika operasi gagal.
-   Tombol submit harus memiliki kondisi loading untuk mencegah
    pengiriman berulang.

## 7. Model Data

### 7.1 Tabel `admins`

  Kolom             Tipe       Aturan
  ----------------- ---------- ---------------
  `id`              Integer    Primary key
  `name`            Text       Wajib
  `email`           Text       Wajib, unique
  `password_hash`   Text       Wajib
  `created_at`      Datetime   Wajib
  `updated_at`      Datetime   Wajib

### 7.2 Tabel `articles`

  Kolom               Tipe       Aturan
  ------------------- ---------- --------------------------
  `id`                Integer    Primary key
  `title`             Text       Wajib
  `slug`              Text       Wajib, unique
  `excerpt`           Text       Opsional
  `content`           Text       Wajib
  `cover_image_url`   Text       Opsional
  `status`            Text       `draft` atau `published`
  `published_at`      Datetime   Opsional
  `created_at`        Datetime   Wajib
  `updated_at`        Datetime   Wajib

Catatan: - Gunakan foreign key jika nanti artikel memiliki relasi ke
admin pembuat. - Simpan tanggal dalam format yang konsisten, idealnya
ISO 8601. - Gunakan migration atau mekanisme inisialisasi database yang
dapat diulang dengan aman. - Jangan menyimpan password asli di database.

## 8. Kebutuhan API

Prefix API: `/api`

### 8.1 Endpoint publik

  Method   Endpoint                Fungsi
  -------- ----------------------- --------------------------------------------
  GET      `/api/articles`         Daftar artikel published dengan pagination
  GET      `/api/articles/:slug`   Detail artikel published
  GET      `/api/site`             Informasi dasar situs jika diperlukan

### 8.2 Endpoint autentikasi

  Method   Endpoint             Fungsi
  -------- -------------------- ----------------------
  POST     `/api/auth/login`    Login admin
  POST     `/api/auth/logout`   Logout admin
  GET      `/api/auth/me`       Memeriksa sesi admin

### 8.3 Endpoint admin

Semua endpoint berikut wajib membutuhkan sesi admin yang valid.

  Method   Endpoint                    Fungsi
  -------- --------------------------- ----------------------------
  GET      `/api/admin/dashboard`      Statistik dashboard
  GET      `/api/admin/articles`       Daftar seluruh artikel
  POST     `/api/admin/articles`       Membuat artikel
  GET      `/api/admin/articles/:id`   Detail artikel untuk admin
  PUT      `/api/admin/articles/:id`   Memperbarui artikel
  DELETE   `/api/admin/articles/:id`   Menghapus artikel

Ketentuan API: - Gunakan status HTTP yang sesuai, misalnya `200`, `201`,
`400`, `401`, `404`, dan `500`. - Respons JSON harus konsisten. -
Validasi dan otorisasi wajib dilakukan di backend, bukan hanya
frontend. - Endpoint publik tidak boleh mengembalikan artikel draft.

Contoh bentuk respons sukses:

``` json
{
  "success": true,
  "data": {},
  "message": "Data berhasil diproses"
}
```

Contoh bentuk respons error:

``` json
{
  "success": false,
  "message": "Permintaan tidak valid",
  "errors": {}
}
```

## 9. Teknologi yang Digunakan

Pilihan awal untuk MVP:

  Bagian             Teknologi
  ------------------ --------------------------
  Frontend           React
  Build tool         Vite
  Styling            CSS atau Tailwind CSS
  Routing frontend   React Router
  Backend            Node.js + Express
  Database           SQLite
  Validasi           Zod atau validasi setara
  Autentikasi        Session berbasis cookie
  Password hashing   Argon2id atau bcrypt
  Version control    Git

Catatan kompatibilitas Termux: - Periksa kompatibilitas dependency pada
Android ARM64 sebelum mengunci pilihan package. - Hindari dependency
native yang tidak diperlukan. - Jika driver SQLite pilihan pertama gagal
dipasang di Termux, pilih driver alternatif yang kompatibel tanpa
mengubah kebutuhan produk. - Jangan menganggap aplikasi sudah berjalan
hanya karena proses build berhasil; lakukan pengujian API dan browser.

## 10. Kebutuhan UI/UX

Arah desain: - Modern, profesional, bersih, dan terasa seperti produk
SaaS sungguhan. - Hindari tampilan generik, dekorasi berlebihan, dan
gradient yang tidak memiliki fungsi. - Gunakan tipografi dengan hierarki
yang jelas. - Gunakan spacing dan ukuran komponen secara konsisten. -
Gunakan warna dengan kontras yang baik. - Landing page harus menarik
tetapi tetap mudah dibaca. - Dashboard harus mengutamakan keterbacaan
dan efisiensi kerja.

### 10.1 Landing page

Komponen utama: - Navbar. - Hero section. - CTA utama. - Bagian
keunggulan atau pengenalan. - Artikel terbaru. - Footer.

### 10.2 Dashboard

Komponen utama: - Sidebar pada desktop. - Navigasi yang nyaman pada
layar kecil. - Header halaman. - Kartu statistik. - Tabel atau daftar
artikel. - Form artikel. - Dialog konfirmasi penghapusan. - Toast atau
notifikasi. - Loading, error, dan empty state.

### 10.3 Responsivitas

-   Prioritaskan pengalaman mobile karena pengembangan dan pengujian
    awal dilakukan dari HP.
-   Tabel admin harus tetap dapat digunakan pada layar sempit, misalnya
    melalui horizontal scroll atau layout alternatif.
-   Form tidak boleh melebar keluar layar.
-   Tombol dan input harus nyaman disentuh.

## 11. Kebutuhan Non-Fungsional

### Performa

-   Halaman publik harus memuat data seperlunya.
-   Daftar artikel menggunakan pagination dari backend.
-   Hindari mengambil seluruh artikel sekaligus.

### Keamanan

-   Password wajib di-hash.
-   Endpoint admin wajib dilindungi middleware autentikasi.
-   Validasi dilakukan di backend.
-   Gunakan parameterized query atau mekanisme ORM yang aman.
-   Terapkan proteksi CSRF yang sesuai dengan strategi autentikasi
    cookie.
-   Jangan mengirim secret atau password ke frontend.
-   Jangan commit file `.env`, database produksi, atau credential.

### Maintainability

-   Pisahkan frontend dan backend secara jelas.
-   Pisahkan route, controller/handler, middleware, validasi, dan akses
    database.
-   Gunakan penamaan file dan fungsi yang konsisten.
-   Hindari membuat abstraksi berlebihan untuk MVP.

### Reliability

-   Tangani error API dengan konsisten.
-   Pastikan database tetap tersimpan setelah server dimulai ulang.
-   Sediakan cara membuat akun admin pertama dengan aman.
-   Sediakan `.env.example` tanpa credential asli.

## 12. Struktur Proyek yang Disarankan

Struktur awal yang disarankan:

``` text
mini-cms/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   └── admin/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── styles/
│   └── package.json
├── server/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── db/
│   │   ├── validators/
│   │   └── app.js
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── PRD.md
```

Struktur boleh disesuaikan setelah OpenCode memeriksa repository. Jangan
memindahkan atau menghapus file yang sudah ada tanpa alasan yang jelas.

## 13. Kriteria Penerimaan MVP

MVP dinyatakan selesai jika seluruh skenario berikut berhasil:

1.  Pengunjung membuka `/` dan landing page tampil tanpa login.
2.  Landing page menampilkan artikel published dari database.
3.  Pengunjung membuka `/artikel` dan hanya melihat artikel published.
4.  Pengunjung membuka detail artikel berdasarkan slug.
5.  Pengunjung tidak dapat melihat artikel draft melalui endpoint
    publik.
6.  Admin dapat login dengan credential yang benar.
7.  Login dengan credential salah ditolak.
8.  Pengguna tanpa sesi tidak dapat mengakses dashboard dan endpoint
    admin.
9.  Admin dapat membuat artikel draft.
10. Artikel draft tidak muncul di halaman publik.
11. Admin dapat mengubah draft menjadi published.
12. Artikel published muncul di halaman publik.
13. Admin dapat mengubah artikel dan perubahan tersimpan.
14. Admin dapat menghapus artikel setelah konfirmasi.
15. Pencarian, filter status, dan pagination daftar artikel berjalan.
16. Logout mengakhiri sesi dan akses dashboard ditolak setelah logout.
17. Aplikasi tetap dapat dijalankan kembali dan data tidak hilang
    setelah server direstart.

## 14. Tahapan Implementasi

Kerjakan secara bertahap. Jangan membangun semua fitur sekaligus.

### Tahap 1 --- Fondasi

-   Periksa lingkungan Termux dan versi Node.js.
-   Buat struktur project.
-   Siapkan React + Vite dan Express.
-   Siapkan SQLite dan konfigurasi environment.
-   Pastikan frontend dan backend dapat dijalankan.

**Output:** aplikasi dasar berjalan lokal.

### Tahap 2 --- Database dan API Artikel

-   Buat tabel dan inisialisasi database.
-   Buat endpoint publik.
-   Buat endpoint CRUD admin tanpa membuka akses publik.
-   Uji validasi dan respons API.

**Output:** API artikel berfungsi dan data tersimpan.

### Tahap 3 --- Autentikasi

-   Buat mekanisme akun admin awal.
-   Implementasikan login, logout, sesi, dan middleware.
-   Uji akses tanpa sesi dan sesi tidak valid.

**Output:** area admin terlindungi.

### Tahap 4 --- Landing Page

-   Implementasikan layout publik.
-   Hubungkan daftar artikel dan detail artikel ke API.
-   Pastikan hanya artikel published yang terlihat.

**Output:** website publik siap digunakan.

### Tahap 5 --- Dashboard dan CRUD

-   Implementasikan dashboard.
-   Implementasikan daftar, tambah, edit, dan hapus artikel.
-   Tambahkan pencarian, filter, pagination, dan notifikasi.

**Output:** admin dapat mengelola konten.

### Tahap 6 --- Pengujian dan Penyempurnaan

-   Uji seluruh kriteria penerimaan.
-   Periksa tampilan mobile dan desktop.
-   Periksa keamanan endpoint admin.
-   Perbaiki bug sebelum menambah fitur baru.

**Output:** MVP stabil untuk demo lokal.

## 15. Instruksi Kerja untuk OpenCode

Gunakan dokumen ini sebagai sumber kebutuhan utama proyek.

Aturan kerja: 1. Baca `PRD.md` sebelum membuat perubahan. 2. Periksa isi
repository dan kondisi project terlebih dahulu. 3. Jangan langsung
menulis seluruh aplikasi dalam satu langkah. 4. Implementasikan satu
tahap pada satu waktu sesuai bagian 14. 5. Sebelum mengubah file, pahami
struktur dan teknologi yang sudah ada. 6. Jangan mengganti stack atau
menambah fitur di luar PRD tanpa alasan teknis dan persetujuan. 7.
Prioritaskan kompatibilitas Termux Android ARM64. 8. Setelah setiap
tahap, jalankan pemeriksaan atau pengujian yang relevan. 9. Laporkan
file yang dibuat/diubah, perintah yang dijalankan, hasil pengujian, dan
kendala yang belum selesai. 10. Jangan mengklaim fitur selesai jika
belum diuji. 11. Jangan menampilkan, menyalin, atau memasukkan
credential asli ke source code, log, dokumentasi, atau Git. 12. Jika ada
keputusan penting yang belum ditentukan atau dependency tidak kompatibel
dengan Termux, jelaskan masalah dan ajukan pilihan sebelum melanjutkan.

**Langkah pertama OpenCode:** lakukan inspeksi repository dan lingkungan
Termux, lalu berikan rencana implementasi Tahap 1. Jangan langsung
mengimplementasikan seluruh PRD.

------------------------------------------------------------------------

## 16. Keputusan yang Bisa Ditentukan Setelah MVP

Hal-hal berikut sengaja ditunda agar MVP tidak melebar: - Nama dan
branding final situs. - Editor artikel rich-text atau Markdown. - Upload
gambar lokal. - Kategori dan tag artikel. - Multi-admin dan role
tambahan. - Deployment publik dan domain. - Backup dan restore database.
