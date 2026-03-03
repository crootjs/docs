# Dokumentasi Modul `trace.js`
Modul `trace.js` pada library croot.js berfungsi untuk melakukan pelacakan atau *tracking* interaksi yang dilakukan pengguna pada halaman web. Fungsi utama yang ada dalam modul ini yaitu mendeteksi elemen apa yang diklik atau disentuh oleh pengguna. Fungsi lainnya yaitu mencatat koordinat posisinya di layar berupa koordinat (X, Y) dari klik mouse atau sentuhan jari jika pada layar perangkat mobile.

## Cara Penggunaan (Import)
Import fungsi dari `trace.js` melalui CDN jsDelivr. Pastikan dipanggil di dalam *script* HTML kamu yang bertipe `module`.

```javascript
import { tapClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.1/trace.js";
```

## Daftar Fungsi
### `tapClick(event)`
Fungsi ini berfungsi untuk mendeteksi interaksi mouse berupa klik atau *touch* untuk sentuhan layar. Saat adanya interaksi pengguna, fungsi ini akan mencetak *log* data berikut ke dalam console browser:
* **Target Element**: Menampilkan elemen HTML yang sedang diklik atau disentuh.
* **Touch Event**: Jika diakses elalui layar sentuh, maka akan menampilkan jumlah sentuhan dan letak koordinat sentuhan pertama.
* **Mouse Event**: Jika diklik menggunakan *mouse* di PC/Laptop, maka akan menampilkan koordinat `clientX` dan `clientY` dari kursor.

## Contoh Implementasi
Untuk menggunakan fungsi `tapClick`, pasangkan pada `EventListener` untuk *event* yang ingin dilacak, seperti `click`, `touchstart`, atau `touchmove`.

```javascript
import { tapClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.1/trace.js";

// Melacak interaksi klik (Mouse)
document.addEventListener('click', tapClick);

// Melacak interaksi sentuhan di layar (Touchscreen)
document.addEventListener('touchstart', tapClick);
document.addEventListener('touchmove', tapClick);
```

## Referensi Source Code
Untuk melihat pengaplikasiannya, silakan klik tautan berikut:
[Source Code trace.js di jsDelivr](https://www.jsdelivr.com/package/gh/crootjs/lib?tab=files)