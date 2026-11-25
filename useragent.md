# Dokumentasi Modul `useragent.js`

*[English](en/useragent)*

`useragent.js` berisi satu fungsi untuk menebak apakah halaman dibuka dari perangkat mobile, dengan mencocokkan `navigator.userAgent` terhadap sebuah regex. Tidak ada library pihak ketiga.

## Cara Penggunaan (Import)

```javascript
import { isMobile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/useragent.js";
```

## `isMobile()`

Mengembalikan `true` jika `navigator.userAgent` mengandung salah satu dari `Android`, `webOS`, `iPhone`, `iPad`, `iPod`, `BlackBerry`, `IEMobile`, atau `Opera Mini` (tanpa membedakan huruf besar/kecil), dan `false` jika tidak. Tidak menerima parameter.

```javascript
import { isMobile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/useragent.js";
import { show, hide } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/element.js";

if (isMobile()) {
    show("tombol-buka-app");
    hide("tombol-download-desktop");
}
```

## Catatan

- iPad dengan iPadOS 13 ke atas secara bawaan memakai user agent Safari desktop (Mac), sehingga `isMobile()` mengembalikan `false`.
- User agent bisa diubah oleh pengguna atau ekstensi browser. Pakai hasilnya hanya untuk menyesuaikan tampilan, bukan untuk keamanan. Untuk tata letak, media query CSS biasanya lebih tepat.
