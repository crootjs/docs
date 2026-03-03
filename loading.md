## Dokumentasi: loading.js
Modul `loading.js`   menyediakan aset visual berupa animasi loading berbasis SVG yang ringan dan elegan. Modul ini dirancang untuk memberikan umpan balik visual (visual feedback) kepada pengguna saat aplikasi sedang melakukan proses asinkron (seperti pengambilan data dari API).

## Fitur Utama
-Vector Based: Animasi tetap tajam dan jernih pada resolusi layar apa pun (Retina/4K).
-Zero Dependencies: Tidak memerlukan file gambar eksternal (.gif/.png) atau library CSS tambahan.
-Microsoft Style: Menggunakan animasi 8 titik melingkar dengan transisi spline yang halus.
-Performance: Karena berupa string teks SVG, proses rendering hampir instan.

## Struktur Variabel
Variabel loading mengekspor string HTML yang berisi elemen <svg>.
Spesifikasi Teknis
ID: loading
-Dimensi Default: 80px x 80px
-ViewBox: 0 0 100 100
-Warna Lingkaran: Multi-warna (#e15b64, #f47e60, #f8b26a, #abbd81, #849b87).

## Mekanisme Animasi
Animasi ini tidak menggunakan CSS Animation eksternal, melainkan menggunakan fitur SMIL (Synchronized Multimedia Integration Language) yang tertanam langsung di dalam SVG melalui tag <animateTransform>.

-Tipe Gerakan: rotate (Rotasi 360 derajat).
-Durasi: 1.5 detik per siklus.
-Calc Mode: spline (Menghasilkan efek percepatan dan perlambatan yang halus/smooth, tidak kaku seperti linear).
-Interaktivitas: Animasi berjalan secara indefinite (terus-menerus) segera setelah elemen dimasukkan ke dalam DOM.
