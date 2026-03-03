
## 1. Pendahuluan

`useragent.js` adalah file JavaScript yang digunakan untuk mendeteksi informasi browser, sistem operasi, dan perangkat pengguna berdasarkan nilai `navigator.userAgent`. Dokumentasi ini menjelaskan cara menggunakan library melalui CDN jsDelivr serta contoh implementasinya.

Library yang digunakan pada dokumentasi ini adalah **UAParser.js**, yang memungkinkan parsing User-Agent menjadi informasi yang lebih terstruktur.

## 2. Menggunakan Library dari jsDelivr

Tambahkan script berikut ke dalam file HTML sebelum menutup tag `</body>`:

```html
<script src="https://cdn.jsdelivr.net/npm/ua-parser-js@1.0.37/dist/ua-parser.min.js"></script>
<script src="useragent.js"></script>
```

Penjelasan:

* Script pertama mengambil library `UAParser.js` dari CDN jsDelivr.
* Script kedua adalah file lokal `useragent.js` yang akan kita buat untuk mengelola hasil parsing.

## 3. Struktur File

Contoh struktur folder proyek:

```
project-folder/
│── index.html
│── useragent.js
│── useragent.md
```

## 4. Contoh Implementasi useragent.js

Buat file bernama `useragent.js` dengan isi berikut:

```javascript
// Membuat instance parser
const parser = new UAParser();

// Mendapatkan hasil parsing
const result = parser.getResult();

// Menampilkan hasil ke console
console.log("Browser:", result.browser.name, result.browser.version);
console.log("OS:", result.os.name, result.os.version);
console.log("Device:", result.device.model || "Desktop");

// Menampilkan hasil ke halaman HTML
document.addEventListener("DOMContentLoaded", function () {
    const infoDiv = document.getElementById("user-info");

    infoDiv.innerHTML = `
        <p><strong>Browser:</strong> ${result.browser.name} ${result.browser.version}</p>
        <p><strong>Operating System:</strong> ${result.os.name} ${result.os.version}</p>
        <p><strong>Device:</strong> ${result.device.model || "Desktop"}</p>
    `;
});
```

## 5. Contoh index.html

Berikut contoh file HTML sederhana untuk menampilkan informasi User-Agent:

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Deteksi User Agent</title>
</head>
<body>
    <h1>Informasi Perangkat Pengguna</h1>
    <div id="user-info"></div>

    <script src="https://cdn.jsdelivr.net/npm/ua-parser-js@1.0.37/dist/ua-parser.min.js"></script>
    <script src="useragent.js"></script>
</body>
</html>
```

## 6. Penjelasan Kode

### a. UAParser()

Digunakan untuk membuat instance parser yang akan membaca nilai `navigator.userAgent` secara otomatis.

### b. parser.getResult()

Menghasilkan object berisi informasi terstruktur seperti:

* `browser` → nama dan versi browser
* `os` → sistem operasi dan versinya
* `device` → tipe perangkat (mobile, tablet, desktop)

### c. DOMContentLoaded

Event ini memastikan bahwa elemen HTML sudah dimuat sebelum JavaScript mencoba memanipulasi DOM.

---

## 7. Contoh Output

Jika pengguna membuka halaman menggunakan Google Chrome di Windows 10, maka output yang ditampilkan:

```
Browser: Chrome 120.0.0
Operating System: Windows 10
Device: Desktop
```

---

## 8. Kelebihan Menggunakan Library

1. Parsing lebih akurat dibandingkan membaca `navigator.userAgent` secara manual.
2. Mendukung banyak browser dan perangkat.
3. Mudah diintegrasikan dengan proyek frontend maupun backend.

## 9. Kesimpulan

File `useragent.js` dapat digunakan untuk mendeteksi informasi perangkat pengguna secara otomatis menggunakan library dari CDN jsDelivr. Implementasi ini cocok digunakan untuk:

* Analisis statistik pengguna
* Personalisasi tampilan berdasarkan perangkat
* Logging informasi client-side
