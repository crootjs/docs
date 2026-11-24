# Dokumentasi Modul `router.js`

*[English](en/router)*

`router.js` mengatur halaman di aplikasi satu halaman (SPA), misalnya dashboard: setiap alamat dipetakan ke satu function atau potongan HTML, isi wadah berganti tanpa memuat ulang halaman, dan alamatnya tetap bisa di-bookmark serta dipakai tombol back browser.

- **Mode hash** (bawaan): alamatnya `index.html#/mahasiswa/7`. Jalan di hosting statis mana pun, termasuk GitHub Pages, tanpa konfigurasi server.
- **Mode history**: alamatnya `/app/mahasiswa/7` lewat `history.pushState`. Lebih rapi, tetapi server harus mengirim `index.html` untuk semua path di bawah `base` (GitHub Pages tidak bisa tanpa trik 404.html, jadi di sana pakai mode hash).

Sesudah pindah halaman, fokus keyboard dipindah ke judul konten baru dan judulnya diumumkan ke pembaca layar; tautan menu yang cocok diberi `aria-current="page"`.

## Cara Penggunaan (Import)

```javascript
import { startRouter } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.36/router.js";
```

## `startRouter(routes, options)`

Memasang router dan menampilkan rute dari URL sekarang (pada microtask berikutnya, jadi handler boleh memakai objek `router` yang dikembalikan).

```html
<nav class="nav" aria-label="Menu utama">
  <ul>
    <li><a href="#/">Beranda</a></li>
    <li><a href="#/mahasiswa">Mahasiswa</a></li>
  </ul>
</nav>
<main id="konten"></main>
<script type="module" src="app.js"></script>
```

```javascript
// app.js
import { startRouter } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.36/router.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.36/api.js";

const router = startRouter({
    "/": "pages/beranda.html",
    "/mahasiswa": {
        html: "pages/mahasiswa.html",
        run: ({ query }) => tampilkanDaftar(query.get("q")),
    },
    "/mahasiswa/:nim": async ({ params, signal }) => {
        const { status, data, error } = await getJSON(`https://api.example.com/mahasiswa/${encodeURIComponent(params.nim)}`, null, { signal });
        if (error === "abort") return;          // pengguna sudah pindah halaman
        const judul = document.createElement("h1");
        judul.textContent = status === 200 ? data.nama : "Mahasiswa tidak ditemukan";
        return judul;
    },
}, {
    outlet: "konten",
    notFound: () => "<h1>Halaman tidak ditemukan</h1>",
});
```

### `routes`

Object `{ pola: tampilan }`.

**Pola** dimulai dengan `/`. Segmen `:nama` adalah parameter (`/mahasiswa/:nim` cocok dengan `/mahasiswa/2301001`, `params.nim = "2301001"`, sudah di-*decode*). Garis miring di akhir path diabaikan. Rute dengan parameter lebih sedikit dicoba lebih dulu, jadi `/mahasiswa/baru` menang atas `/mahasiswa/:nim` apa pun urutan penulisannya. Query string tidak ikut dicocokkan; isinya ada di `ctx.query`.

**Tampilan** salah satu dari:

| Bentuk | Yang terjadi |
|---|---|
| `function (ctx)` | Dipanggil, boleh `async`. Kalau mengembalikan teks, teks itu dipasang sebagai HTML ke `outlet`; kalau mengembalikan `Node` (elemen atau `DocumentFragment`), node itu menggantikan isi `outlet`. Kalau tidak mengembalikan apa-apa, dianggap handler sudah menulis DOM sendiri |
| `"pages/x.html"` | Potongan HTML diunduh lalu dipasang ke `outlet` |
| `{ html, run }` | Keduanya opsional: potongan HTML dipasang dulu, lalu `run(ctx)` dipanggil (boleh `async`) untuk mengisi atau memasang event |

Teks HTML dipasang dengan `innerHTML`: data dari pengguna atau URL (termasuk `params`) harus di-*escape* atau dipasang lewat `textContent`. `<script>` di dalam potongan HTML tidak dijalankan; taruh kodenya di `run`. URL potongan HTML yang relatif dihitung dari halaman ini (mode hash) atau dari `base` (mode history), bukan dari path rute.

### `ctx`

| Properti | Isi |
|---|---|
| `path` | Path rute, misalnya `"/mahasiswa/7"` |
| `params` | Parameter dari pola, misalnya `{ nim: "7" }`; `{}` untuk `notFound` |
| `query` | `URLSearchParams` dari query string: `query.get("q")`, `query.getAll("tag")` |
| `pattern` | Pola yang cocok, atau `null` untuk `notFound` |
| `signal` | `AbortSignal` yang dibatalkan begitu pengguna pindah lagi. Teruskan ke `getJSON(url, null, { signal })` atau `fetch` |

### Handler async yang balapan

Kalau pengguna pindah lagi sebelum handler selesai, `signal` handler lama dibatalkan dan hasilnya diabaikan: nilai yang dikembalikannya tidak dipasang, `run` tidak dipanggil, dan fokus tidak dipindah. Handler yang menulis DOM sendiri sesudah `await` perlu memeriksa `signal.aborted` dulu, karena router tidak bisa mencegah tulisan itu.

### `options`

Semuanya opsional.

| Opsi | Keterangan |
|---|---|
| `mode` | `"hash"` (bawaan) atau `"history"` |
| `base` | Mode history saja: path awal aplikasi, misalnya `"/app"`. Path di luar `base` bukan milik router |
| `outlet` | ID wadah konten. Tanpa ini, handler menulis DOM sendiri |
| `notFound` | Tampilan (bentuk yang sama dengan rute) untuk path yang tidak cocok. Tanpa ini, `outlet` dikosongkan |
| `links` | Selektor CSS tautan yang diberi `aria-current="page"` saat path-nya sama dengan rute sekarang (query diabaikan). Bawaan `"nav a[href]"` |
| `focus` | `false` supaya fokus tidak dipindah dan tidak ada pengumuman, atau selektor CSS elemen yang difokus. Bawaan: `<h1>` pertama di `outlet`, atau `outlet` itu sendiri |
| `onError` | `(error, ctx) => {}` saat handler melempar error atau potongan HTML gagal diunduh. Bawaan `console.error` |

### Nilai kembali

| Anggota | Keterangan |
|---|---|
| `navigate(path, { replace })` | Pindah ke `path` (boleh dengan query, `"/mahasiswa?q=sari"`). `replace: true` mengganti entri riwayat sekarang, jadi tombol back tidak kembali ke sana. Mengembalikan Promise yang selesai sesudah handler selesai (tidak pernah *reject*) |
| `href(path)` | `href` untuk tautan ke `path` di mode yang dipakai: `"#/mahasiswa/7"` atau `"/app/mahasiswa/7"` |
| `current()` | Rute sekarang `{ path, params, query, pattern }`, atau `null` sebelum rute pertama tampil |
| `stop()` | Melepas semua pendengar event, membatalkan handler yang berjalan, dan membuang wilayah pengumuman |

## Tautan

- **Mode hash**: tulis tautan biasa `<a href="#/mahasiswa">`. Hash yang tidak diawali `/`, misalnya skip link `#konten`, bukan rute dan dibiarkan ke browser.
- **Mode history**: tautan `<a href="/app/mahasiswa">` di halaman yang sama dicegat dan dijalankan lewat router tanpa memuat ulang. Yang tidak dicegat: tautan ke situs lain atau path di luar `base`, `target="_blank"` (atau target lain selain `_self`), `download`, klik dengan Ctrl/Cmd/Shift/Alt atau tombol tengah, tautan `#bagian` di halaman yang sama, dan klik yang sudah di-`preventDefault()`. Buat `href` dengan `router.href(...)` supaya `base` selalu benar.

Di mode history, path CSS, JS, dan gambar di `index.html` harus absolut (`/app/style.css`), karena halaman bisa dibuka langsung dari `/app/mahasiswa/7`.

## Aksesibilitas

- Saat halaman pertama dibuka, fokus tidak dipindah (pembaca layar sudah membaca halaman dari atas).
- Sesudah setiap perpindahan: halaman digulir ke atas (kecuali dari tombol back/forward; juga dengan `focus: false`), fokus pindah ke judul (`tabindex="-1"` ditambahkan bila perlu), dan teks judul (atau `document.title`) diumumkan lewat `<div role="status" class="crootjs-router-status">` yang tersembunyi secara visual.
- Ubah `document.title` di handler supaya judul tab dan riwayat browser ikut sesuai.
- Judul yang difokus mungkin menampilkan cincin fokus; hilangkan dengan CSS halaman, misalnya `main h1:focus { outline: none; }`, karena judul bukan kontrol.

## Hubungan dengan modul lain

- `onHashChange` dari [`url.js`](url) cukup untuk satu-dua hash sederhana. `router.js` menambah pola dengan parameter, query, rute cadangan, pembatalan handler lama, dan aksesibilitas.
- `router.js` tidak mengimpor [`element.js`](element/): `renderHTML` menulis `innerHTML` sendiri tanpa `AbortSignal`, jadi hasil yang terlambat tidak bisa diabaikan. Router mengunduh potongan HTML dengan `fetch` sendiri supaya tetap satu file berdiri sendiri.

Contoh lengkap: [dashboard dengan router](https://croot.js.org/examples/element/router/).
