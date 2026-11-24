# Komponen Aplikasi (`ui.css`), Tema (`themes.css`), dan Pola Halaman

*[English](en/ui)*

[croot.css](css) merapikan HTML biasa. Untuk halaman aplikasi (dashboard, back office, formulir panjang) ada dua file tambahan yang **opsional** dan terpisah, supaya halaman biasa tidak ikut mengunduhnya:

- `ui.css` (sekitar 3 KB gzip): kerangka aplikasi dengan sidebar, breadcrumb, tab, menu, popover, akordeon, skeleton, angka ringkasan, avatar, sakelar, langkah, grup tombol, keadaan kosong, toolbar, daftar keterangan, dan footer. Semuanya di atas HTML asli (`<details>`, `popover`, peran ARIA); hanya tab yang butuh JavaScript (`tabs.js`, sekitar 0,6 KB gzip).
- `themes.css` (sekitar 1,2 KB gzip): empat tema berkarakter, masing-masing terang dan gelap, tanpa web font.

Daripada mulai dari halaman kosong (dan berakhir dengan tampilan khas AI), salin salah satu [pola halaman](https://croot.js.org/examples/pola/): aplikasi dengan sidebar, login, daftar dan detail, formulir bertahap, pengaturan, halaman kosong dan 404, serta landing page. Lihat juga [Tanpa tampilan khas AI](conventions#5-no-ai-look).

## Cara Pemakaian

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/croot.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/ui.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/themes.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/icons.min.css">
<link rel="stylesheet" href="style.css">
```

Muat yang dibutuhkan saja. `ui.css` memakai layer `croot.ui` (sesudah semua layer croot.css) dan `themes.css` memakai `croot.themes`, jadi CSS halaman Anda tetap menang tanpa `!important`.

## Tema

Pilih tema dengan atribut di `<html>`:

```html
<html lang="id" data-croot-theme="kampus">
```

| Tema | Karakter | Cocok untuk |
|---|---|---|
| `kampus` | Biru tua dan kuning tembaga, judul serif, sudut 4px | Kampus, sekolah, lembaga |
| `kertas` | Kertas hangat dan tinta cokelat, huruf serif, sudut tegak | Dokumen, arsip, tulisan panjang |
| `kontras` | Hitam-putih dengan fokus kuning tebal, huruf 112,5%, tautan bergaris bawah | Layanan publik, aksesibilitas |
| `niaga` | Hijau toska dan bata, judul sempit, sudut 3px, jarak rapat | Kasir, gudang, aplikasi kantor |

Tanpa `data-croot-theme`, tampilan croot.css bawaan (hijau) yang dipakai. Setiap tema punya versi gelap yang mengikuti sistem, dan `data-theme="light"` / `"dark"` tetap memaksanya seperti di croot.css. Semua pasangan teks dan latar memenuhi kontras WCAG AA (minimal 4,5:1), termasuk teks di atas warna aksen dan warna status yang dipakai tombol dan [toast.js](toast).

Tema hanya mengubah variabel `--croot-*` (ditambah `--croot-heading-font` untuk huruf judul), jadi tema sendiri cukup ditulis dengan variabel yang sama:

```css
:root[data-croot-theme="desa"] {
    --croot-accent: #7c2d12;
    --croot-heading-font: Georgia, serif;
}
```

## Kerangka aplikasi

```html
<div class="app">
  <header class="app-header">
    <button type="button" class="button secondary app-toggle" popovertarget="menu-utama">Menu</button>
    <nav class="breadcrumb" aria-label="Lokasi">
      <ol><li><a href="/">Beranda</a></li><li><span aria-current="page">Ringkasan</span></li></ol>
    </nav>
  </header>
  <nav class="app-sidebar" id="menu-utama" popover aria-label="Menu utama">
    <ul>
      <li><a href="/" aria-current="page"><span class="icon icon-home" aria-hidden="true"></span> Ringkasan</a></li>
      <li><a href="/barang">Barang</a></li>
    </ul>
    <h2>Laporan</h2>
    <ul><li><a href="/laporan">Laporan bulanan</a></li></ul>
  </nav>
  <main class="app-main">...</main>
</div>
```

Di layar lebar (mulai 60rem) sidebar selalu tampil sebagai kolom kiri dan tombol `.app-toggle` disembunyikan. Di ponsel sidebar menjadi laci (`popover`) yang dibuka tombol itu dan ditutup dengan Escape atau ketuk di luar, tanpa JavaScript. Tautan aktif ditandai `aria-current="page"` (garis, latar, dan huruf tebal, bukan warna saja).

## Komponen

| Komponen | HTML |
|---|---|
| Breadcrumb | `<nav class="breadcrumb" aria-label="Lokasi"><ol><li><a>…</a></li><li><span aria-current="page">…</span></li></ol></nav>` |
| Tab | `<div role="tablist" id="t" aria-label="…">` berisi `<button type="button" role="tab" id="…" aria-controls="p1" aria-selected="true">`, lalu `<div role="tabpanel" id="p1" aria-labelledby="…">` (panel lain `hidden`), dan `initTabs("t")` |
| Menu | `<details class="menu"><summary>Akun</summary><ul><li><a>…</a></li><li><hr></li><li><button class="danger">Keluar</button></li></ul></details>`; `.end` meratakan panel ke kanan. Atau `<div popover class="menu">` dibuka dengan `popovertarget` (tertutup sendiri dengan Escape dan klik di luar) |
| Keterangan singkat | `<button popovertarget="info" aria-label="Penjelasan">?</button><div id="info" popover class="tooltip">…</div>`: bisa dibuka dengan keyboard dan sentuhan |
| Tombol aksi | `<div class="actions">` berisi tombol, rata kanan, untuk kaki dialog dan formulir |
| Akordeon | `<div class="accordion"><details name="faq"><summary>…</summary>…</details>…</div>`; `name` yang sama membuat hanya satu yang terbuka |
| Skeleton | `<span class="skeleton" aria-hidden="true"></span>` di wadah ber-`aria-busy="true"`; diam kalau pengguna memilih kurangi gerakan |
| Angka ringkasan | `<section class="stats" aria-label="Ringkasan"><div class="stat"><p class="stat-label">Penjualan</p><p class="stat-value">Rp4.320.000</p><p class="stat-change up">Naik 6% dari kemarin</p></div></section>`; arah wajib ditulis di teks (`up`/`down` hanya menambah panah dan warna) |
| Badge status | `<span class="badge success">Lunas</span>`, juga `warning`, `danger`, `info` |
| Avatar | `<span class="avatar" aria-hidden="true">DW</span>`, atau berisi `<img>` |
| Sakelar | `<label><input type="checkbox" role="switch" name="notif"> Notifikasi email</label>`; tetap checkbox biasa |
| Langkah | `<ol class="steps" aria-label="Tahap pengisian"><li>Data diri</li><li aria-current="step">Alamat</li><li>Berkas</li></ol>`; langkah sebelumnya otomatis ditandai selesai |
| Grup tombol | `<div class="button-group" role="group" aria-label="Tampilan">` berisi tombol; yang terpilih `aria-pressed="true"` |
| Keadaan kosong | `<div class="empty"><span class="icon icon-folder" aria-hidden="true"></span><h2>Belum ada transaksi</h2><p>…</p><p class="cluster"><a class="button">…</a></p></div>` |
| Toolbar | `<div class="toolbar"><h2>Barang</h2><div><a class="button">Tambah</a></div></div>` |
| Tabel lebar | `<div class="table-wrap" role="region" aria-label="Daftar barang" tabindex="0"><table>…</table></div>` |
| Daftar keterangan | `<dl class="meta"><div><dt>Nomor</dt><dd>TRX-0412</dd></div>…</dl>`; dua kolom kalau wadahnya cukup lebar |
| Footer | `<footer class="site-footer"><p>…</p><ul><li><a>…</a></li></ul></footer>` |

Dialog (`<dialog>`) sudah ditata croot.css; taruh tombolnya di `<div class="actions">`.

## `tabs.js`

```javascript
import { initTabs } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/tabs.min.js";

const tabs = initTabs("tab-detail");
tabs.select(2); // pindah ke tab ketiga dari kode
```

### `initTabs(id)`

Mengaktifkan tab di dalam elemen `role="tablist"` dengan ID `id`, mengikuti pola ARIA: hanya tab aktif yang masuk urutan Tab, panah kiri/kanan berpindah tab dan langsung menampilkan panelnya (terbalik di halaman kanan-ke-kiri), Home/End ke tab pertama/terakhir. Tab awal adalah yang `aria-selected="true"`, atau yang pertama. `aria-selected`, `tabindex`, dan `hidden` pada panel dijaga sinkron; panel tanpa elemen yang bisa difokus diberi `tabindex="0"`.

Mengembalikan `{ select(index), remove() }`, atau `null` (dengan peringatan di console) kalau elemen tidak ada. `select()` mengabaikan indeks di luar jangkauan; `remove()` melepas pendengar keyboard dan klik. Hanya tab mendatar.

## Pola halaman

| Pola | Isi |
|---|---|
| [Galeri](https://croot.js.org/examples/pola/) | Semua pola, dengan pemilih tema dan mode terang/gelap |
| [Aplikasi](https://croot.js.org/examples/pola/aplikasi/) | Kerangka dengan sidebar, angka ringkasan, grafik ([chart.js](chart)), dan tabel ([table.js](table)) |
| [Login](https://croot.js.org/examples/pola/login/) | Validasi [form.js](form), tombol tampilkan kata sandi |
| [Daftar dan detail](https://croot.js.org/examples/pola/daftar-detail/) | Tabel, daftar keterangan, tab, dialog hapus |
| [Formulir](https://croot.js.org/examples/pola/formulir/) | Langkah, fieldset, sakelar, unggah berkas |
| [Pengaturan](https://croot.js.org/examples/pola/pengaturan/) | Akordeon, sakelar, pilihan tema |
| [Kosong dan 404](https://croot.js.org/examples/pola/kosong-404/) | Keadaan kosong dan halaman tidak ditemukan |
| [Landing](https://croot.js.org/examples/pola/landing/) | Landing page tanpa gradien, kartu fitur seragam, atau kalimat pemasaran |

Setiap pola memakai data contoh yang ditandai, impor yang dipatok, dan `<link rel="modulepreload">`. Pola-pola ini membaca tema yang dipilih di galeri lewat `../tema.js`; hapus impor itu kalau menyalin satu pola ke proyek Anda.
