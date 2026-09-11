# Dokumentasi Modul `useragent.js`

`useragent.js` adalah modul kecil dari CrootJS untuk mendeteksi apakah pengunjung mengakses halaman dari perangkat mobile, berdasarkan `navigator.userAgent` bawaan browser. Modul ini **tidak** memakai library pihak ketiga (bukan UAParser.js atau sejenisnya) — murni satu fungsi regex.

## Cara Penggunaan (Import)

```javascript
import { isMobile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.11/useragent.js";
```

## Daftar Fungsi

### `isMobile()`

Mengembalikan `true` jika `navigator.userAgent` cocok dengan pola perangkat mobile umum (Android, webOS, iPhone, iPad, iPod, BlackBerry, IEMobile, Opera Mini), dan `false` jika tidak.

**Parameter:** Tidak ada.

**Nilai Kembalian:** `Boolean`.

**Contoh Penggunaan:**

```javascript
import { isMobile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.11/useragent.js";

if (isMobile()) {
    console.log("Diakses dari perangkat mobile");
} else {
    console.log("Diakses dari desktop");
}
```

**Contoh: menampilkan tombol berbeda untuk mobile**

```javascript
import { isMobile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.11/useragent.js";
import { show, hide } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.11/element.js";

if (isMobile()) {
    show("tombol-buka-app");
    hide("tombol-download-desktop");
}
```

## Catatan

- Deteksi berbasis `navigator.userAgent` bisa saja tidak akurat 100% (user agent dapat dipalsukan/diubah oleh pengguna atau ekstensi browser), jadi jangan dipakai untuk kebutuhan keamanan — cocoknya untuk penyesuaian tampilan (progressive enhancement) saja.
