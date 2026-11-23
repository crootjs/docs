# Dokumentasi Modul `url.js`

*[English](en/url)*

`url.js` berisi function pendek untuk membaca bagian-bagian URL halaman saat ini (protokol, host, path, query string, hash), mengubah query string dan hash, berpindah halaman, dan mendengarkan perubahan hash. Semuanya membaca atau mengubah `window.location`, jadi hanya jalan di browser.

## Cara Penggunaan (Import)

```javascript
import { getQueryString, getHash, setHash, onHashChange } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.32/url.js";
```

## Ringkasan

Contoh nilai di tabel ini untuk URL `https://contoh.id:8080/kelas/materi/bab1.html?user=102#latihan`.

| Function | Hasil / efek |
|---|---|
| `getProtocol()` | `"https"` |
| `getHost()` | `"contoh.id:8080"` |
| `fullPath()` | `"/kelas/materi/bab1.html"` |
| `folderPath()` | `"/kelas/materi/"` |
| `getPath()` | `"kelas/materi/bab1.html"` |
| `getQueryString()` | Proxy: `getQueryString().user` → `"102"` |
| `getHash()` | `"latihan"` |
| `setQueryString(key, value)` | Mengubah query string, halaman dimuat ulang |
| `setHash(hashvalue)` | Mengubah hash, tanpa muat ulang |
| `redirect(URL)` | Pindah halaman, halaman sekarang tidak bisa dikembalikan dengan tombol Back |
| `onHashChange(runFunctionEvent)` | Memanggil function setiap hash berubah |

## `getProtocol()`

Mengembalikan protokol halaman tanpa titik dua, misalnya `"https"`, `"http"`, atau `"file"`.

## `getHost()`

Mengembalikan nama host beserta port kalau port-nya ditulis di URL, misalnya `"contoh.id"` atau `"localhost:8080"`.

## `fullPath()`

Mengembalikan path URL (`window.location.pathname`), diawali `/`, tanpa query string dan hash. Misalnya `"/kelas/materi/bab1.html"`.

## `folderPath()`

Mengembalikan path tanpa nama file di ujungnya, misalnya `"/kelas/materi/bab1.html"` menjadi `"/kelas/materi/"`.

Bagian terakhir path dianggap nama file kalau mengandung titik (`.`):

| Path | Hasil |
|---|---|
| `/kelas/materi/bab1.html` | `/kelas/materi/` |
| `/js/app.min.js` | `/js/` |
| `/kelas/materi/` | `/kelas/materi/` (tidak berubah) |
| `/kelas/materi` | `/kelas/materi` (tanpa titik, tidak dianggap file) |
| `/v1.2/halaman` | `/v1.2/halaman` (titik hanya di nama folder) |

Sebelum 0.0.30, `/js/app.min.js` tidak berubah dan `/v1.2/halaman` menjadi `/`.

## `getPath()`

Sama dengan `fullPath()` tanpa `/` di depan, misalnya `"kelas/materi/bab1.html"`. Di halaman root hasilnya `""`.

## `getQueryString()`

Mengembalikan Proxy di atas `URLSearchParams` dari query string saat ini, sehingga parameter dibaca seperti properti object. Nilainya selalu string, atau `null` kalau parameter itu tidak ada.

```javascript
import { getQueryString } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.32/url.js";

// URL: https://contoh.id/produk.html?id=102&tab=ulasan
const query = getQueryString();
const id = Number(query.id);  // 102
const tab = query.tab;        // "ulasan"
const halaman = query.page;   // null
```

Proxy ini hanya untuk membaca. Setiap nama properti diteruskan ke `searchParams.get()`, jadi method `URLSearchParams` seperti `has()` atau `forEach()` tidak bisa dipakai lewat objek ini, dan menulis properti tidak mengubah URL. Isinya juga tidak ikut berubah kalau URL berubah setelah objek dibuat; panggil `getQueryString()` lagi.

## `setQueryString(key, value)`

Mengisi atau mengganti satu parameter query string, mempertahankan parameter lainnya, lalu menulis hasilnya ke `window.location.search`. Akibatnya browser **memuat ulang halaman** dengan URL baru dan menambah satu entri riwayat. Untuk mengubah URL tanpa muat ulang, pakai `history.replaceState` atau `history.pushState` langsung.

```javascript
import { setQueryString } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.32/url.js";

setQueryString("kategori", "buku"); // ...?kategori=buku, halaman dimuat ulang
```

## `getHash()`

Mengembalikan hash URL tanpa `#`, misalnya `"latihan"`. Kalau URL tidak punya hash, hasilnya `""`.

## `setHash(hashvalue)`

Mengganti hash URL menjadi `hashvalue` (tanpa `#`). Halaman tidak dimuat ulang. Browser menambah entri riwayat, menggulir ke elemen yang `id`-nya sama dengan `hashvalue` kalau ada, dan memicu event `hashchange` kalau nilainya berbeda dari hash sebelumnya.

## `redirect(URL)`

Pindah ke `URL` (absolut atau relatif) dengan `window.location.replace`. Halaman sekarang **diganti** di riwayat, bukan ditambah, jadi tombol Back tidak kembali ke halaman ini. Cocok setelah logout atau setelah form terkirim. Untuk tautan biasa yang boleh di-Back, pakai `window.location.href = URL`.

`URL` tidak divalidasi. Jangan teruskan nilai dari query string atau input pengguna langsung ke `redirect` tanpa memeriksa tujuannya, supaya halamanmu tidak bisa dipakai untuk mengarahkan orang ke situs lain.

```javascript
import { redirect } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.32/url.js";
import { deleteCookie } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.32/cookie.js";

deleteCookie("token");
redirect("/login.html");
```

## `onHashChange(runFunctionEvent)`

Mendaftarkan `runFunctionEvent(event)` ke event `hashchange` di `window`. `event` adalah `HashChangeEvent` dengan `oldURL` dan `newURL`. Function ini tidak dipanggil saat halaman pertama dimuat, hanya saat hash berubah.

Tidak ada cara melepas listener ini, dan setiap panggilan `onHashChange` menambah listener baru, jadi panggil sekali saja.

```javascript
import { getHash, onHashChange } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.32/url.js";
import { renderHTML } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.32/element.js";

function tampilkanHalaman() {
    renderHTML("konten", `halaman/${getHash() || "beranda"}.html`);
}

tampilkanHalaman();              // hash saat halaman dibuka
onHashChange(tampilkanHalaman);  // hash berikutnya
```
