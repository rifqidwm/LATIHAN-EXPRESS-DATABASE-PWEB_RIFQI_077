# DompetKos

Aplikasi pencatat pengeluaran anak kos. Back-end memakai **Express 5 + TypeScript**, data disimpan di **Neon PostgreSQL** melalui **Prisma ORM 7**, dan front-end memakai **HTML, CSS, dan JavaScript** murni yang disajikan langsung oleh Express.

## Persiapan database Neon

1. Buat project baru di [console.neon.tech](https://console.neon.tech).
2. Klik tombol **Connect** di dashboard project, lalu salin dua connection string:
   - **Connection pooling aktif** (host mengandung `-pooler`) untuk `DATABASE_URL`.
   - **Connection pooling nonaktif** untuk `DIRECT_URL`.
3. Salin `.env.example` menjadi `.env`, lalu tempel kedua connection string tadi.

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxxxxx.REGION.aws.neon.tech/neondb?sslmode=require"
```

> `DATABASE_URL` dipakai aplikasi saat berjalan, `DIRECT_URL` dipakai Prisma CLI untuk migrasi. File `.env` **jangan ikut dikumpulkan** karena berisi password database.

## Cara menjalankan

```bash
npm install             # sekaligus menjalankan prisma generate
npm run db:migrate      # membuat tabel di Neon, isi nama migrasi misalnya: init
npm run db:seed         # mengisi 5 data contoh (ID direset mulai dari 1)
npm run dev
```

Buka **http://localhost:3000** di browser. Untuk versi build:

```bash
npm run build
npm start
```

Perintah tambahan:

| Perintah | Fungsi |
|---|---|
| `npm run db:studio` | Membuka Prisma Studio untuk melihat isi tabel |
| `npm run db:seed` | Mengembalikan data ke 5 data contoh, berguna sebelum tes Postman |

## Struktur folder

```
dompetkos/
├── prisma/
│   ├── schema.prisma              model Expense dan enum Kategori
│   ├── seed.ts                    data contoh
│   └── migrations/                dibuat otomatis oleh npm run db:migrate
├── public/                        front-end
│   ├── index.html
│   ├── style.css
│   └── app.js
├── src/
│   ├── controllers/
│   │   └── expense.controller.ts  query Prisma, membaca request, mengirim response
│   ├── generated/prisma/          Prisma Client hasil generate (tidak perlu diedit)
│   ├── lib/
│   │   └── prisma.ts              koneksi Prisma Client ke Neon (adapter pg)
│   ├── middleware/
│   │   ├── request-logger.ts      mencatat setiap request
│   │   ├── validate-expense.ts    validasi body POST dan PUT
│   │   ├── not-found.ts           404 untuk route tidak terdaftar
│   │   └── error-handler.ts       400 untuk JSON rusak, 500 untuk error server
│   ├── routes/
│   │   └── expense.routes.ts      memasangkan method + path ke controller
│   ├── types/
│   │   └── expense.ts
│   ├── app.ts                     memasang middleware dan router
│   └── index.ts                   menjalankan server (app.listen)
├── postman/
│   └── DompetKos.postman_collection.json
├── prisma.config.ts               konfigurasi Prisma CLI (schema, migrasi, seed, URL)
└── .env.example
```

## Skema database

Tabel `expenses` di Neon dibuat dari model berikut (`prisma/schema.prisma`):

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `SERIAL` | Primary key, auto increment |
| `kategori` | enum `Kategori` | makan, transport, kos, belanja, hiburan, lainnya |
| `nominal` | `INTEGER` | Rupiah, 1 sampai 100.000.000 |
| `tanggal` | `DATE` | Dikirim dan diterima API sebagai `YYYY-MM-DD` |
| `catatan` | `VARCHAR(60)` | Opsional, default teks kosong |
| `createdAt`, `updatedAt` | `TIMESTAMP` | Diisi otomatis oleh Prisma |

## Endpoint

Base URL: `http://localhost:3000/api/expenses`

| Method | Path | Keterangan | Status |
|---|---|---|---|
| GET | `/api/expenses` | Ambil semua pengeluaran | 200 |
| GET | `/api/expenses?kategori=makan` | Filter berdasarkan kategori | 200 |
| GET | `/api/expenses/:id` | Ambil satu pengeluaran | 200 / 404 |
| POST | `/api/expenses` | Tambah pengeluaran | 201 / 400 |
| PUT | `/api/expenses/:id` | Ubah pengeluaran | 200 / 400 / 404 |
| DELETE | `/api/expenses/:id` | Hapus pengeluaran | 200 / 404 |
| * | route lain | Route tidak terdaftar | 404 |

Kategori yang diterima: `makan`, `transport`, `kos`, `belanja`, `hiburan`, `lainnya`.

### Contoh body POST / PUT

```json
{
  "kategori": "makan",
  "nominal": 12000,
  "tanggal": "2026-11-03",
  "catatan": "Es teh dan gorengan"
}
```

Aturan validasi: `kategori` wajib salah satu dari daftar di atas, `nominal` bilangan bulat lebih dari 0, `tanggal` berformat `YYYY-MM-DD`, `catatan` opsional maksimal 60 karakter.

### Contoh response

```json
{
  "message": "Pengeluaran berhasil ditambahkan",
  "data": { "id": 6, "kategori": "makan", "nominal": 12000, "tanggal": "2026-11-03", "catatan": "Es teh dan gorengan" }
}
```

## Pengujian dengan Postman

1. Jalankan `npm run db:seed` supaya data kembali ke kondisi awal (ID 1 sampai 5), lalu jalankan server dengan `npm run dev`.
2. Di Postman pilih **Import**, lalu pilih file `postman/DompetKos.postman_collection.json`.
3. Variabel `baseUrl` sudah berisi `http://localhost:3000`.
4. Jalankan request per folder: GET, POST, PUT, DELETE, lalu request 404.

## Fitur di halaman web

- **GET**: ringkasan total, kartu per kategori, dan daftar riwayat. Kartu kategori bisa diklik untuk filter.
- **POST**: form *Catat pengeluaran*.
- **PUT**: tombol ikon pensil membuka dialog *Ubah pengeluaran*.
- **DELETE**: tombol ikon tempat sampah membuka dialog konfirmasi hapus.

Semua perubahan dari halaman web maupun Postman tersimpan permanen di Neon, jadi data tetap ada walaupun server dinyalakan ulang.

## Screenshot

Data disimpan di Neon PostgreSQL. Screenshot diambil berurutan setelah menjalankan `npm run db:seed`, yaitu dari kondisi 5 data contoh.

---

### 1. Tampilan web (GET)

Halaman utama memuat ringkasan total, kartu per kategori, dan riwayat. Semua data diambil dari `GET /api/expenses`.

<p align="center">
  <img src="docs/screenshots/01-tampilan-web-get.png" alt="Halaman utama" width="90%">
  <br>
  <em>Gambar 1. Halaman utama DompetKos</em>
</p>

<br>

---

### 2. Tambah data lewat form (POST)

Form <b>Catat pengeluaran</b> mengirim `POST /api/expenses`. Setelah berhasil, data baru muncul paling atas di riwayat dan total ikut bertambah.

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/02-post-isi-form.png" alt="Isi form" width="100%">
      <br><em>Gambar 2. Form diisi sebelum disimpan</em>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/03-post-berhasil.png" alt="Berhasil ditambahkan" width="100%">
      <br><em>Gambar 3. Data berhasil ditambahkan</em>
    </td>
  </tr>
</table>

<br>

---

### 3. Filter kategori (GET dengan query)

Klik kartu kategori akan mengirim `GET /api/expenses?kategori=makan`.

<p align="center">
  <img src="docs/screenshots/04-get-filter-kategori.png" alt="Filter kategori" width="90%">
  <br>
  <em>Gambar 4. Riwayat setelah difilter kategori Makan</em>
</p>

<br>

---

### 4. Ubah data lewat fitur Edit (PUT)

Tombol ikon pensil membuka dialog edit. Tombol <b>Simpan perubahan</b> mengirim `PUT /api/expenses/:id`.

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/05-put-dialog-edit.png" alt="Dialog edit" width="100%">
      <br><em>Gambar 5. Dialog edit terbuka</em>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/06-put-berhasil.png" alt="Berhasil diubah" width="100%">
      <br><em>Gambar 6. Data berhasil diperbarui</em>
    </td>
  </tr>
</table>

<br>

---

### 5. Hapus data lewat tombol Hapus (DELETE)

Tombol ikon tempat sampah membuka dialog konfirmasi. Tombol <b>Hapus</b> mengirim `DELETE /api/expenses/:id`.

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/07-delete-konfirmasi.png" alt="Konfirmasi hapus" width="100%">
      <br><em>Gambar 7. Dialog konfirmasi hapus</em>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/08-delete-berhasil.png" alt="Berhasil dihapus" width="100%">
      <br><em>Gambar 8. Data berhasil dihapus</em>
    </td>
  </tr>
</table>

<br>

---

### 6. Pengujian dengan Postman

| No | Request | Hasil yang diharapkan |
|---|---|---|
| 9 | `GET /api/expenses` | 200 OK, array data |
| 10 | `POST /api/expenses` | 201 Created, data baru |
| 11 | `PUT /api/expenses/2` | 200 OK, data terbaru |
| 12 | `DELETE /api/expenses/3` | 200 OK, data yang dihapus |
| 13 | `GET /alamat-lain` | 404 Not Found |

<br>

<p align="center">
  <img src="docs/screenshots/09-postman-get.png" alt="Postman GET" width="85%">
  <br>
  <em>Gambar 9. GET semua data, status 200</em>
</p>

<br>

<p align="center">
  <img src="docs/screenshots/10-postman-post.png" alt="Postman POST" width="85%">
  <br>
  <em>Gambar 10. POST tambah data, status 201</em>
</p>

<br>

<p align="center">
  <img src="docs/screenshots/11-postman-put.png" alt="Postman PUT" width="85%">
  <br>
  <em>Gambar 11. PUT ubah data, status 200</em>
</p>

<br>

<p align="center">
  <img src="docs/screenshots/12-postman-delete.png" alt="Postman DELETE" width="85%">
  <br>
  <em>Gambar 12. DELETE hapus data, status 200</em>
</p>

<br>

<p align="center">
  <img src="docs/screenshots/13-postman-404.png" alt="Postman 404" width="85%">
  <br>
  <em>Gambar 13. Route tidak terdaftar, status 404</em>
</p>