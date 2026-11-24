# Dokumentasi `croot.css`

*[English](en/css)*

`croot.css` adalah framework CSS CrootJS: **satu file, tanpa JavaScript, tanpa web font dan gambar**, sekitar 2 KB setelah gzip. HTML biasa (judul, paragraf, tautan, form, tombol, tabel, dialog) langsung rapi tanpa kelas apa pun. Beberapa kelas tersedia untuk tata letak dan komponen yang sering dipakai.

Dibuat dengan prinsip yang sama dengan modul JS CrootJS: kecil dan hemat (tidak ada font atau ikon yang harus diunduh, latar gelap di mode gelap), mudah ditimpa, dan aksesibel (fokus keyboard selalu terlihat, menghormati pengaturan kurangi gerakan).

## Cara Pemakaian

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/croot.min.css">
<link rel="stylesheet" href="style.css">
```

`croot.min.css` diperkecil otomatis oleh jsDelivr. Taruh CSS halaman Anda **sesudahnya**, walau sebenarnya urutan tidak menentukan: semua aturan `croot.css` ada di dalam `@layer croot`, dan CSS tanpa layer selalu menang atas layer, jadi Anda bisa menimpa apa pun tanpa `!important`.

Contoh lengkap semua elemen dan komponen: [croot.js.org/examples/css](https://croot.js.org/examples/css/).

## Tanpa Kelas

Elemen ini sudah diberi gaya begitu file dimuat:

| Elemen | Tampilan |
|---|---|
| `body`, judul, paragraf, daftar | Font sistem, jarak baris nyaman, warna dari tema |
| `a` | Warna aksen, garis bawah sedikit renggang |
| `code`, `pre`, `kbd` | Font monospace; `pre` bergulir ke samping kalau panjang |
| `table` | Lebar penuh, garis antarbaris |
| `blockquote`, `hr`, `details`/`summary` | Garis dan jarak yang rapi |
| `label`, `input`, `select`, `textarea` | Lebar penuh, label tebal di atasnya |
| `label` berisi checkbox/radio | Sebaris dengan isiannya |
| `fieldset`, `legend` | Kotak bergaris dengan judul |
| `[aria-invalid="true"]` | Garis tepi merah (dipasang otomatis oleh [`form.js`](form)) |
| `button` | Tombol utama berwarna aksen, tinggi minimal 40 px supaya mudah disentuh |
| `dialog` | Kotak di tengah dengan latar redup |
| `progress`, checkbox, radio, range | Warna aksen |
| Fokus keyboard (`:focus-visible`) | Cincin biru yang selalu terlihat |

## Tombol

```html
<button>Simpan</button>
<button class="secondary">Batal</button>
<button class="danger">Hapus</button>
<button class="ghost">Lainnya</button>
<a class="button" href="/daftar">Daftar</a>
```

`.button` memberi tautan tampilan tombol. Tombol `disabled` (atau `.button[aria-disabled="true"]`) tampil pudar.

## Tata Letak

| Kelas | Fungsi |
|---|---|
| `.container` | Lebar maksimal 72rem di tengah, jarak tepi 16 px |
| `.stack` | Anak-anak bertumpuk ke bawah dengan jarak sama |
| `.cluster` | Anak-anak berjajar dan turun baris kalau tidak muat (tombol, tag) |
| `.grid` | Kolom otomatis sebanyak yang muat, masing-masing minimal 16rem |
| `.center`, `.muted`, `.visually-hidden` | Rata tengah, warna redup, tersembunyi tapi tetap dibacakan pembaca layar |

Jarak dan lebar kolom diatur per elemen dengan variabel:

```css
.daftar-produk { --croot-min: 12rem; --croot-gap: 2rem; }
```

`--croot-gap` dan `--croot-min` tidak diwariskan, jadi `.grid` atau `.stack` di dalam elemen itu tetap memakai jarak bawaannya sendiri.

## Komponen

```html
<article class="card">
  <h3>Judul <span class="badge">baru</span></h3>
  <p>Isi kartu.</p>
</article>

<div class="alert">Informasi.</div>
<div class="alert success">Berhasil disimpan.</div>
<div class="alert warning">Kuota hampir habis.</div>
<div class="alert danger">Gagal mengirim.</div>

<header class="container nav">
  <strong>Nama Situs</strong>
  <ul>
    <li><a href="/" aria-current="page">Beranda</a></li>
    <li><a href="/tentang">Tentang</a></li>
  </ul>
</header>
```

## Ikon

Set ikon kecil di file terpisah, `icons.css` (sekitar 2 KB gzip), pengganti Boxicons atau Font Awesome untuk dashboard. Halaman yang tidak memakai ikon cukup memuat `croot.css` saja.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/croot.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/icons.min.css">

<button><span class="icon icon-download" aria-hidden="true"></span> Unduh</button>

<button class="secondary">
  <span class="icon icon-search" aria-hidden="true"></span>
  <span class="visually-hidden">Cari</span>
</button>
```

- Setiap ikon adalah elemen kosong dengan kelas `icon` dan `icon-<nama>`. Ikon hanya hiasan, jadi beri `aria-hidden="true"` dan pastikan tombolnya tetap punya teks, kalau perlu teks `.visually-hidden`.
- Warna mengikuti warna teks (`currentColor`), ukurannya `1em`. Ubah dengan `font-size`, atau `width`/`height` di CSS Anda.
- Ikon digambar sendiri untuk CrootJS di grid 24x24 dengan garis 2 px, berupa SVG di data-URI yang dipakai sebagai `mask-image`. Jadi tidak ada request tambahan per ikon, dan tetap bekerja dari jsDelivr (SVG `<use href>` ke domain lain diblokir browser).
- Aturannya di `@layer croot.icons`, jadi CSS halaman Anda tetap menang. `icons.css` juga bisa dipakai tanpa `croot.css`.

| Kelompok | Nama (`icon-...`) |
|---|---|
| Navigasi | `menu`, `close`, `search`, `home`, `dashboard`, `more`, `arrow-up`, `arrow-down`, `arrow-left`, `arrow-right`, `chevron-up`, `chevron-down`, `chevron-left`, `chevron-right` |
| Aksi | `plus`, `minus`, `edit`, `trash`, `download`, `upload`, `copy`, `link`, `refresh`, `filter`, `sort`, `login`, `logout`, `settings` |
| Status | `check`, `warning`, `info`, `bell`, `star`, `eye`, `eye-off`, `lock`, `unlock` |
| Benda | `user`, `users`, `calendar`, `clock`, `mail`, `phone`, `pin`, `map`, `file`, `folder`, `chart`, `table` |

Galeri semua ikon: [croot.js.org/examples/css/#ikon](https://croot.js.org/examples/css/#ikon).

## Tema

Warna, sudut, jarak, dan font adalah variabel di `:root`. Ganti di CSS halaman Anda:

```css
:root {
    --croot-accent: #7c3aed;     /* warna utama */
    --croot-accent-text: #fff;   /* teks di atas warna utama */
    --croot-radius: 4px;
    --croot-font: "Inter", system-ui, sans-serif;
}
```

| Variabel | Isi |
|---|---|
| `--croot-bg`, `--croot-surface` | Latar halaman, dan latar kartu/isian |
| `--croot-text`, `--croot-muted`, `--croot-border` | Teks, teks redup, garis |
| `--croot-accent`, `--croot-accent-text` | Warna utama dan teks di atasnya |
| `--croot-danger`, `--croot-warning`, `--croot-success`, `--croot-info`, `--croot-focus` | Warna status dan cincin fokus |
| `--croot-radius`, `--croot-space`, `--croot-max` | Sudut, jarak dasar, lebar `.container` |
| `--croot-font`, `--croot-mono` | Font teks dan kode |

**Mode gelap** mengikuti pengaturan perangkat. Untuk memaksa, pasang `data-theme="light"` atau `data-theme="dark"` di `<html>`, misalnya dari tombol tema:

```javascript
document.documentElement.dataset.theme = "dark";   // gelap
delete document.documentElement.dataset.theme;      // ikut perangkat
```

## Catatan

- Butuh browser yang mendukung `@layer`, `:has()`, `color-mix()`, dan `@property` (Chrome/Edge 111+, Firefox 128+, Safari 16.4+). Di browser lebih lama halaman tetap terbaca, tetapi sebagian gaya hilang.
- Gaya ini sengaja sedikit. Untuk tampilan khusus, tulis di `style.css` halaman Anda; aturan Anda selalu menang.
