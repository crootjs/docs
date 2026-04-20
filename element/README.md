📂 Dokumentasi Module: element.js 

1. Pendahuluan
Modul element.js merupakan komponen inti dalam ekosistem CrootJS yang dirancang untuk menjembatani interaksi antara logika JavaScript dan struktur DOM (Document Object Model). Fokus utama modul ini adalah memberikan abstraksi pada perintah-perintah manipulasi elemen yang seringkali repetitif dan kompleks dalam Vanilla JavaScript.
Dengan menggunakan modul ini, pengembang dapat meminimalisir penggunaan sintaks standar yang panjang seperti:
 - Seleksi elemen manual (document.getElementById).
 - Pengaturan event listener yang berulang.
 - Penulisan konten dinamis yang rawan kesalahan pengetikan.
Tujuannya adalah menciptakan alur kerja pengembangan web yang lebih elegan, mempercepat proses coding, dan memastikan struktur kode tetap bersih.

2. Ruang Lingkup Modul
Modul element.js mencakup berbagai utilitas penting untuk mengelola antarmuka pengguna secara programatik:

  2.1 Pengelolaan Struktur & Konten :
      - Fasilitas untuk memperbarui isi elemen secara instan.
      - Pembuatan node atau elemen baru tanpa menulis sintaks HTML mentah yang panjang.
      - Sinkronisasi atribut elemen agar sesuai dengan logika aplikasi.

  2.2 Sistem Interaksi (Event Handling) :
      - Penyederhanaan penangkapan aksi pengguna (seperti klik, ketik, atau perubahan input).
      - Manajemen fungsi callback yang lebih tertata untuk setiap interaksi.

  2.3 Kontrol Dinamika Visual :
      - Pengaturan status tampilan elemen (muncul/sembunyi) secara efisien.
      - Manipulasi kelas CSS untuk mendukung animasi atau perubahan tema secara on-the-fly.

  2.4 Integrasi Konten Eksternal :
      - Kemampuan untuk memuat modul atau fragmen HTML dari sumber luar secara asinkron.
      - Mendukung arsitektur Single Page Application (SPA) sederhana dengan sistem pemuatan komponen.
  Salah satu fitur unggulan untuk menangani interaksi pengguna adalah fungsi onClick.

3. Dokumentasi Fungsi onClick
   
  3.1 Deskripsi :
      Fungsi onClick digunakan untuk memberikan aksi atau perintah tertentu ketika sebuah elemen HTML diklik oleh pengguna. Fungsi ini menyederhanakan metode standar addEventListener("click", ...) menjadi lebih ringkas, sehingga memudahkan interaksi UI. 
      
  3.2 Sintaks :
      onClick(id, action)
      
  3.3 Parameter :
      - id ID unik dari elemen HTML yang ingin dipasangkan event klik (seperti ID pada tombol atau div).
      - action Fungsi (callback) yang berisi logika atau perintah yang akan dieksekusi saat elemen tersebut diklik.

  3.4 Cara Kerja :
      - Mencari elemen target di dalam dokumen menggunakan document.getElementById(id).
      - Jika elemen ditemukan, sistem akan menempelkan event listener khusus untuk tipe "click".
      - Menunggu interaksi pengguna (klik).
      - Menjalankan fungsi action yang telah didefinisikan segera setelah klik terdeteksi.
      - Jika elemen tidak ditemukan, sistem biasanya memberikan peringatan agar dapat di periksa kembali ID elemen tersebut.

  3.5 Contoh Penggunaan :
      HTML : <button id="btn-alert">Klik Saya! 🚀</button>
      JavaScript : // Menggunakan onClick untuk memunculkan notifikasi
      onClick("btn-alert", () => {
          alert("Tombol berhasil diklik menggunakan CrootJS!");
          console.log("Interaksi user terekam.");
      });
      
  Pada contoh di atas, ketika tombol dengan ID btn-alert diklik, sebuah pesan peringatan (alert) akan muncul di layar pengguna tanpa perlu menulis sintaks addEventListener yang panjang.

  3.6 Kegunaan :
      - Mempermudah pembuatan tombol interaktif.
      - Mengelola navigasi antar bagian halaman tanpa reload.
      - Menjalankan fungsi validasi form saat tombol submit ditekan.
      - Membuat elemen dekoratif (seperti gambar atau div) menjadi bisa diklik.
      - Mendukung penulisan kode yang lebih bersih dalam arsitektur modular.

4. Kesimpulan
Modul element.js membantu pengelolaan elemen dan event secara lebih efisien. 🚀
Fungsi onClick memungkinkan pengembang untuk membangun interaksi pengguna dengan kode yang sangat minimalis namun tetap fungsional. Hal ini mendukung pengembangan website yang responsif dan interaktif tanpa harus bergantung pada library besar atau framework yang kompleks.

🌟 Kontributor: AL YASMIN ASSA'DIYAH - 714240014

# Dokumentasi Fungsi show, hide, dan textFocus

Module: **element.js**
Module element.js menyediakan fungsi manipulasi elemen DOM untuk mengatur visibilitas dan fokus elemen secara modular dalam CrootJS.

## 1. `show()`

Fungsi show() digunakan untuk menampilkan elemen yang sebelumnya tersembunyi `(misalnya memiliki display: none)` tanpa menghapusnya dari **struktur DOM.**

### Contoh

```js
import { show } from './element.js';

show('box');
// Elemen dengan id="box" akan ditampilkan


2. `hide()`

Fungsi hide() digunakan untuk menyembunyikan elemen dari tampilan halaman tanpa menghapusnya dari DOM, sehingga elemen masih bisa dimanipulasi kembali.

### Contoh

import { hide } from './element.js';

hide('box');
// Elemen dengan id="box" akan disembunyikan

3. `textfocus()`

Fungsi textFocus() digunakan untuk memberikan fokus otomatis pada elemen input teks, sehingga pengguna dapat langsung mengetik tanpa perlu klik manual.


 ### Contoh
 
 import { textFocus } from './element.js';

textFocus('username');
// Input dengan id="username" akan langsung mendapat fokus


# 📦 CrootJs — Dokumentasi `element.js`

> **CrootJs** adalah library JavaScript ringan untuk menyederhanakan manipulasi DOM dan event handling di sisi klien.

---
## Muhammad Arif Rivaldi
## 📋 Daftar Isi

- [Instalasi & Import](#instalasi--import)
- [1. onChange()](#1-onchangeid-actionfunctionname)
- [2. getValue()](#2-getvalueid)
- [3. setInner()](#3-setinnerid-content)
---

## Instalasi & Import

```js
import { onChange, getValue, setInner } from './element.js';
```

---

## 1. `onChange(id, actionfunctionname)`

Mendaftarkan event listener `change` pada elemen berdasarkan `id`. Callback dipanggil setiap kali nilai elemen **berubah dan kehilangan fokus**.

### Parameter

| Parameter            | Tipe       | Wajib | Deskripsi                                          |
|----------------------|------------|-------|----------------------------------------------------|
| `id`                 | `string`   | ✅    | ID elemen target (`<input>`, `<select>`, `<textarea>`) |
| `actionfunctionname` | `Function` | ✅    | Fungsi callback; menerima `event.target` sebagai argumen |

### Catatan

- Gunakan di dalam `runAfterDOM()` agar elemen sudah tersedia saat listener didaftarkan.
- Callback menerima `target` (bukan `event`), sehingga langsung bisa akses `target.value`.
- Berbeda dengan `onInput()` yang aktif setiap ketukan, `onChange()` hanya aktif setelah elemen kehilangan fokus.

### Contoh

```js
import { onChange } from './element.js';

onChange('selectKota', (target) => {
    console.log('Kota dipilih:', target.value);
    // Output: "Kota dipilih: Bandung"
});
```

---

## 2. `getValue(id)`

Mengambil nilai properti `value` dari elemen input berdasarkan `id`. Cocok untuk membaca data dari `<input>`, `<textarea>`, maupun `<select>`.

### Parameter

| Parameter | Tipe     | Wajib | Deskripsi              |
|-----------|----------|-------|------------------------|
| `id`      | `string` | ✅    | ID elemen input target |

### Return Value

| Tipe     | Deskripsi                                             |
|----------|-------------------------------------------------------|
| `string` | Nilai dari properti `value` elemen. Mengembalikan string kosong `""` jika input belum diisi. |

### Catatan

- Hasil selalu bertipe `string`. Gunakan `Number()` atau `parseInt()` jika membutuhkan angka.
- Jika elemen tidak ditemukan, akan melempar error `Cannot read properties of null`.

### Contoh

```js
import { getValue } from './element.js';

const nama  = getValue('txtNama');     // → "Saripudin"
const umur  = Number(getValue('txtUmur')); // → 21
const email = getValue('txtEmail');   // → "saripudin@mail.com"
```

---

## 3. `setInner(id, content)`

Mengubah `innerHTML` dari elemen berdasarkan `id`. Digunakan untuk **merender konten HTML secara dinamis** ke dalam elemen tanpa perlu reload halaman.

### Parameter

| Parameter | Tipe     | Wajib | Deskripsi                                              |
|-----------|----------|-------|--------------------------------------------------------|
| `id`      | `string` | ✅    | ID elemen target                                       |
| `content` | `string` | ✅    | String HTML yang akan dirender sebagai konten elemen   |

### Catatan

- Mendukung tag HTML penuh — teks, tabel, gambar, dan elemen lainnya.
- Konten lama **akan ditimpa** sepenuhnya. Gunakan `addInner()` jika ingin menambahkan tanpa menghapus yang lama.
- Hati-hati terhadap **XSS** jika `content` berasal langsung dari input pengguna yang tidak disanitasi.

### Contoh

```js
import { setInner } from './element.js';

// Pesan status
setInner('divPesan', '<span class="sukses">✅ Data berhasil disimpan!</span>');

// Render tabel dari data
const rows = data.map(d => `<tr><td>${d.nama}</td><td>${d.nilai}</td></tr>`).join('');
setInner('tbodyHasil', rows);
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
