# Dokumentasi Module: element.js

## 1. Pendahuluan

Modul `element.js` merupakan komponen inti dalam ekosistem CrootJS yang dirancang untuk menjembatani interaksi antara logika JavaScript dan struktur DOM (Document Object Model). Fokus utama modul ini adalah memberikan abstraksi pada perintah-perintah manipulasi elemen yang seringkali repetitif dan kompleks dalam Vanilla JavaScript.

Dengan menggunakan modul ini, pengembang dapat meminimalisir penggunaan sintaks standar yang panjang seperti:

- Seleksi elemen manual (`document.getElementById`)
- Pengaturan event listener yang berulang
- Penulisan konten dinamis yang rawan kesalahan pengetikan

Tujuannya adalah menciptakan alur kerja pengembangan web yang lebih elegan, mempercepat proses coding, dan memastikan struktur kode tetap bersih.

---

## 2. Ruang Lingkup Modul

Modul `element.js` mencakup berbagai utilitas penting untuk mengelola antarmuka pengguna secara programatik:

### 2.1 Pengelolaan Struktur dan Konten

- Memperbarui isi elemen secara instan
- Membuat node atau elemen baru tanpa sintaks HTML panjang
- Sinkronisasi atribut elemen dengan logika aplikasi

### 2.2 Sistem Interaksi (Event Handling)

- Penyederhanaan event seperti klik, input, dan perubahan
- Manajemen callback yang lebih terstruktur

### 2.3 Kontrol Dinamika Visual

- Menampilkan dan menyembunyikan elemen
- Manipulasi class CSS untuk animasi dan tema

### 2.4 Integrasi Konten Eksternal

- Memuat HTML secara asynchronous
- Mendukung Single Page Application (SPA) sederhana

Salah satu fitur unggulan adalah fungsi `onClick`.

---

## 3. Dokumentasi Fungsi onClick

### 3.1 Deskripsi

Fungsi `onClick` digunakan untuk memberikan aksi ketika elemen HTML diklik. Fungsi ini menyederhanakan penggunaan `addEventListener("click")`.

### 3.2 Sintaks

```javascript
onClick(id, action)

### 3.3 Parameter

- `id` : ID elemen HTML target  
- `action` : fungsi callback yang dijalankan saat klik  

---

### 3.4 Cara Kerja

1. Mencari elemen dengan `document.getElementById(id)`  
2. Menambahkan event listener `click`  
3. Menunggu interaksi pengguna  
4. Menjalankan callback saat klik terjadi  
5. Memberikan peringatan jika elemen tidak ditemukan

### 3.5 Contoh Penggunaan
HTML:
<button id="btn-alert">Klik Saya!</button>

JavaScript:
onClick("btn-alert", () => {
    alert("Tombol berhasil diklik menggunakan CrootJS");
    console.log("Interaksi user terekam");
});

### 3.3 Parameter

- `id` : ID elemen HTML target  
- `action` : fungsi callback yang dijalankan saat klik  

---

### 3.4 Cara Kerja

1. Mencari elemen dengan `document.getElementById(id)`  
2. Menambahkan event listener `click`  
3. Menunggu interaksi pengguna  
4. Menjalankan callback saat klik terjadi  
5. Memberikan peringatan jika elemen tidak ditemukan

### 3.6 Kegunaan

- Tombol interaktif  
- Navigasi tanpa reload  
- Validasi form  
- Elemen dekoratif yang dapat diklik  
- Penulisan kode modular  

---

### 4. Kesimpulan

Modul `element.js` membantu pengelolaan elemen dan event secara efisien.

Fungsi `onClick` memungkinkan pengembang membangun interaksi dengan kode minimalis tanpa bergantung pada framework besar.

Kontributor: AL YASMIN ASSA'DIYAH - 714240014

# Dokumentasi Fungsi Tambahan element.js

## 1. onChange(id, actionFunction)

Menambahkan event listener `change` pada elemen target. Fungsi callback akan dieksekusi saat pengguna selesai mengubah nilai dan elemen kehilangan fokus. Callback langsung menerima referensi elemen target. Sebaiknya dipanggil di dalam `runAfterDOM()`.

**Contoh Penggunaan:**
```javascript
import { onChange } from './element.js';

onChange('pilihLevel', (target) => {
    console.log('Terpilih:', target.value);
});
```

## 2. getValue(id)

Mengambil nilai berupa teks (string) dari elemen formulir seperti input, select, dan textarea. Mengembalikan string kosong jika nilai tidak ada. Catatan penting: nilai yang dikembalikan selalu berjenis teks, diperlukan konversi eksplisit dengan `Number()` untuk isian bertipe angka.

**Contoh Penggunaan:**
```javascript
import { getValue } from './element.js';

const usia = Number(getValue('fieldUmur'));
const nama = getValue('fieldSiswa');
```

## 3. setInner(id, content)

Secara langsung mengganti isi (innerHTML) dari elemen HTML target dengan konten baru. Biasa dimanfaatkan untuk proses perubahan tampilan dinamis tanpa me-muat ulang halaman. Penting: Pastikan bahwa teks atau string HTML masukan telah melalui tahap sanitasi guna mencegah bahaya Cross Site Scripting (XSS).

**Contoh Penggunaan:**
```javascript
import { setInner } from './element.js';

setInner('boxStatus', 'Data berhasil diperbarui.');

const infoList = dataMap.map(x => `<li>${x.teks}</li>`).join('');
setInner('ulDaftar', infoList);
```

---
## Affifah Putri Deza
# Dokumentasi Modul element.js

## 1. Pendahuluan

`element.js` merupakan salah satu modul dalam CrootJS yang berfungsi untuk membantu manipulasi DOM dan pengelolaan elemen HTML secara lebih sederhana dan modular.

Modul ini mengurangi penulisan kode DOM yang berulang seperti:

- `document.getElementById()`
- `document.querySelector()`
- `addEventListener()`
- manipulasi `innerHTML`
- pengaturan class dan visibilitas elemen

Dengan adanya modul ini, proses pengembangan website menjadi lebih rapi, efisien, dan terstruktur.

---

## 2. Ruang Lingkup Modul

Secara umum, `element.js` menyediakan fitur berikut:

### 2.1 Manipulasi Elemen
- Mengubah isi elemen (`innerHTML`, `innerText`)
- Mengatur atribut
- Mengelola class

### 2.2 Event Handling
- Menambahkan event listener (click, input, change, dan lainnya)
- Mengelola interaksi pengguna

### 2.3 Kontrol Visibilitas
- Menampilkan elemen
- Menyembunyikan elemen
- Toggle tampilan

### 2.4 Render Konten Dinamis
- Memuat file HTML secara dinamis
- Membuat sistem partial page
- Mendukung pendekatan modular

Salah satu fungsi dalam kategori ini adalah `renderHTML`.

---

# 3. Dokumentasi Fungsi renderHTML

## 3.1 Deskripsi

Fungsi `renderHTML` digunakan untuk mengambil file HTML dari sebuah URL, lalu menampilkannya ke dalam elemen tertentu berdasarkan ID.

Fungsi ini memungkinkan halaman web memuat konten secara dinamis tanpa perlu melakukan reload halaman.

---

## 3.2 Sintaks

```javascript
renderHTML(id, urlHTML, callback = null)
```

---

## 3.3 Parameter

- **`id`**  
  ID elemen HTML yang menjadi tempat render konten.

- **`urlHTML`**  
  URL atau path file HTML yang ingin dimuat.

- **`callback` (opsional)**  
  Fungsi yang dijalankan setelah konten berhasil dimuat.

---

## 3.4 Cara Kerja

1. Mencari elemen dengan `document.getElementById()`.
2. Jika elemen tidak ditemukan, sistem menampilkan error di console.
3. Mengambil file menggunakan `fetch()`.
4. Mengubah response menjadi teks HTML.
5. Memasukkan HTML ke elemen menggunakan `innerHTML`.
6. Menjalankan `callback` jika tersedia.

---

## 3.5 Contoh Penggunaan

### HTML

```html
<div id="content"></div>
```

### JavaScript

```javascript
renderHTML("content", "about.html", () => {
    console.log("Konten berhasil dimuat");
});
```

Pada contoh di atas, file `about.html` akan dimuat dan ditampilkan di dalam elemen dengan ID `content`. Setelah proses selesai, callback akan dijalankan.

---

## 3.6 Kegunaan

- Membuat sistem partial page
- Memuat komponen HTML secara modular
- Mengurangi reload halaman
- Membangun website dinamis berbasis ES6 Modules

---

## 4. Kesimpulan

Modul `element.js` membantu pengelolaan elemen dan event secara lebih efisien.

Fungsi `renderHTML` memungkinkan pemuatan konten HTML secara dinamis menggunakan asynchronous JavaScript dan manipulasi DOM, sehingga mendukung pengembangan website yang modular, ringan, dan tidak bergantung pada framework kompleks.


-------------------------- 
## Muhammad Rashid Al Savero (714240006)
# 3. Dokumentasi Fungsi onInput

## 3.1 Deskripsi

Fungsi `onInput` digunakan untuk menambahkan event listener pada elemen HTML yang akan dijalankan setiap kali terjadi perubahan input dari pengguna.

Event ini biasanya digunakan pada elemen seperti:
- `<input>`
- `<textarea>`
- `<select>`

Fungsi ini mempermudah penanganan event `input` tanpa perlu menuliskan `addEventListener` secara manual.

---

## 3.2 Sintaks

```javascript
onInput(id, callback)
```

---

## 3.3 Parameter

- **`id`**  
  ID elemen HTML yang ingin dipasangkan event input.

- **`callback`**  
  Fungsi yang akan dijalankan setiap kali terjadi perubahan nilai pada elemen.

---

## 3.4 Cara Kerja

1. Mencari elemen menggunakan `document.getElementById()`.
2. Jika elemen tidak ditemukan, sistem akan menampilkan error di console.
3. Menambahkan event listener `input` ke elemen tersebut.
4. Setiap kali pengguna mengetik atau mengubah nilai, fungsi `callback` akan dijalankan.
5. Nilai terbaru dari input dapat diakses melalui `event.target.value`.

---

## 3.5 Contoh Penggunaan

### HTML

```html
<input type="text" id="username" placeholder="Masukkan nama">
<p id="output"></p>
```

### JavaScript

```javascript
onInput("username", (event) => {
    const value = event.target.value;
    document.getElementById("output").innerText = value;
});
```

Pada contoh di atas, setiap kali pengguna mengetik pada input, teks akan langsung ditampilkan di elemen `<p>`.

---

## 3.6 Kegunaan

- Validasi input secara real-time
- Menampilkan preview teks secara langsung
- Membuat fitur pencarian live (live search)
- Meningkatkan interaktivitas user interface

---

## 4. Kesimpulan

Fungsi `onInput` mempermudah pengelolaan event input pada elemen HTML dengan cara yang lebih ringkas dan terstruktur.

Dengan fungsi ini, developer dapat membuat interaksi real-time tanpa harus menulis kode event listener secara berulang, sehingga kode menjadi lebih bersih, modular, dan mudah dipahami.
