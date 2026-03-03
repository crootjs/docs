# Dokumentasi Module url.js

## 1. Deskripsi Umum

Module `url.js` adalah bagian dari pustaka JavaScript ringan (CrootJS) yang dirancang khusus untuk mempermudah operasi terkait URL pada lingkungan sisi klien (*client-side*).

- **Tujuan module**: Menyediakan kumpulan fungsi utilitas (*helper functions*) yang membungkus objek bawaan browser untuk memanipulasi, membaca, dan mengubah perilaku URL atau riwayat peramban tanpa perlu menulis ulang konfigurasi objek manual berulang-ulang.
- **Ketergantungan pada window.location**: Module ini secara ketat membungkus dan memodifikasi properti dari objek global `window.location` dan `window` (termasuk antarmuka `eventListener`). 
- **Lingkungan eksekusi (browser-only)**: Karena bergantung secara eksklusif pada ketersediaan objek `window` (yang merepresentasikan jendela *tab* dari peramban web), module ini **hanya dapat dieksekusi di dalam lingkungan browser** dan tidak didukung pada sisi komputasi peladen (*server-side*).

---

## 2. Spesifikasi Fungsi

### getProtocol()

**Deskripsi:**  
Menghasilkan nilai protokol jaringan (skema) dari URL saat ini, namun tanpa menyertakan karakter titik dua (`:`) di akhir.

**Parameter:**  
Tidak ada.

**Nilai Kembalian:**  
`String` - Mengembalikan nilai protokol seperti `"http"` atau `"https"`.

**Cara Kerja Internal:**  
Memanggil `window.location.protocol` yang standarnya mengembalikan nilai dengan akhiran titik dua (contoh: `"https:"`), kemudian diiris dengan metode `.slice(0, -1)` untuk menghapus satu karakter terakhir tersebut.

**Contoh Penggunaan:**  
```javascript
import { getProtocol } from './url.js';
console.log(getProtocol()); // Output: "https"
```

**Catatan Penting / Efek Samping:**  
Fungsi ini aman digunakan karena hanya membaca (*read-only*) dan tidak mengubah status halaman.

---

### getHost()

**Deskripsi:**  
Menghasilkan nama host beserta port (bila eksplisit) dari URL saat ini.

**Parameter:**  
Tidak ada.

**Nilai Kembalian:**  
`String` - Contoh: `"www.example.com"` atau `"localhost:8080"`.

**Cara Kerja Internal:**  
Secara langsung mengembalikan nilai dari `window.location.host`.

**Contoh Penggunaan:**  
```javascript
import { getHost } from './url.js';
console.log(getHost()); // Output: "localhost:3000"
```

**Catatan Penting / Efek Samping:**  
Aman digunakan karena operasi bersifat *read-only*.

---

### fullPath()

**Deskripsi:**  
Mengambil seluruh string *pathname* atau jalur relatif URL, mulai dari setelah domain (host) hingga sesaat sebelum *query string* (`?`) atau *hash* (`#`).

**Parameter:**  
Tidak ada.

**Nilai Kembalian:**  
`String` - *Pathname* diawali dengan garis miring `/`. Contoh: `"/folder/halaman.html"`.

**Cara Kerja Internal:**  
Mengembalikan nilai dari `window.location.pathname`.

**Contoh Penggunaan:**  
```javascript
import { fullPath } from './url.js';
console.log(fullPath()); // Output: "/kelas/materi/pendahuluan.php"
```

**Catatan Penting / Efek Samping:**  
Aman digunakan (*read-only*).

---

### folderPath()

**Deskripsi:**  
Mendapatkan jalur *pathname* (seperti `fullPath()`) tetapi menghapus referensi nama file beserta ekstensinya, sehingga hanya menghasilkan jalur map/direktori utamanya.

**Parameter:**  
Tidak ada.

**Nilai Kembalian:**  
`String` - Jalur direktori saja, misalnya `"/materi/"`. Mengembalikan seluruh string `pathname` bilamana URL tidak merujuk pada format file yang berekstensi.

**Cara Kerja Internal:**  
Fungsi ini memecah `window.location.pathname` berdasar karakter ekstensinya (`.`). Jika terdapat setidaknya satu pecahan (menandakan file berekstensi), fungsi akan melakukan pemotongan dengan mengidentifikasi eksistensi ekstensi (ujung array bertitik) dan memotong string path dipisahkan oleh tanda (`/`) untuk mendapatkan nama file mutlak. Nama file beserta ekstensi hasil deteksi tadi lalu disingkirkan dari string dasar target pengembalian fungsi menggunakan metode `.replace()`.

**Contoh Penggunaan:**  
```javascript
import { folderPath } from './url.js';
// Jika URL saat ini: https://api.example.com/assets/img/logo.png
console.log(folderPath()); // Output: "/assets/img/"
```

**Catatan Penting / Efek Samping:**  
Aman digunakan (*read-only*). Logika internal tidak akan memotong apapun apabila URL berformat *REST API* yang tidak diakhiri oleh atribut berformat ekstensi file.

---

### getPath()

**Deskripsi:**  
Menghasilkan string *pathname* URL layaknya `fullPath()`, tetapi menghilangkan karakter garis miring pertama (`/`) dari jalur.

**Parameter:**  
Tidak ada.

**Nilai Kembalian:**  
`String` - Jalur tanpa prefix `/`. Misalnya: `"admin/dashboard"`.

**Cara Kerja Internal:**  
Memanggil `window.location.pathname.substring(1)` untuk mengiris string terhitung mulai dari index 1.

**Contoh Penggunaan:**  
```javascript
import { getPath } from './url.js';
console.log(getPath()); // Output: "katalog/produk/123"
```

**Catatan Penting / Efek Samping:**  
Aman digunakan (*read-only*).

---

### getQueryString()

**Deskripsi:**  
Menghasilkan *object Proxy* pintar yang membolehkan manipulasi pemanggilan akses kunci *query parameters* (parameter dalam URL setelah tanda `?`) secara dinamis bagaikan objek JavaScript normal (*Object Notation*).

**Parameter:**  
Tidak ada.

**Nilai Kembalian:**  
`Proxy Object` - Proksi di atas kelas instance `URLSearchParams`.

**Cara Kerja Internal:**  
Fungsi ini menginisialisasi `new URLSearchParams(window.location.search)` lalu membungkusnya dalam objek global `Proxy`. Objek perantara interseptor (melalui handler `get`) diterjemahkan kembali menjadi abstraksi aslinya (`searchParams.get(prop)`). Mekanisme ini melegitimasi *dot notation* terhadap bacaan parameter.

**Contoh Penggunaan:**  
```javascript
import { getQueryString } from './url.js';
// Misalkan URL: https://example.com/page?user=102&status=active
const qs = getQueryString();
console.log(qs.user);   // Output: "102"
console.log(qs.status); // Output: "active"
```

**Catatan Penting / Efek Samping:**  
Bersifat aman (*read-only*). Penentuan properti dari objek ini tidak memperbarui URL *query* secara aktual pada browser (Hanya bersifat memanggil instance GET statis).

---

### setQueryString(key, value)

**Deskripsi:**  
Memodifikasi URL *query parameters* saat ini dari tab yang aktif dengan menetapkan atau menimpa pasangan kunci dan nilainya, kemudian menerapkannya ke browser secara absolut. 

**Parameter:**  
- `key` (*String*): Nama atau indikator identitas dari parameter URL.
- `value` (*String* | *Number* | *Boolean*): Nilai dari parameter bersangkutan.

**Nilai Kembalian:**  
Tidak ada (`undefined`).

**Cara Kerja Internal:**  
Merepresentasikan rantai kueri eksisting lewat `URLSearchParams`, menetapkan `params.set(key, value)`, lalu secara eksplisit menyimpan nilainya kembali padanan mutan target ke utilitas asli di `window.location.search = params`.

**Contoh Penggunaan:**  
```javascript
import { setQueryString } from './url.js';
setQueryString("filter", "terbaru");
// Menambah/mengubah URL menjadi ...?filter=terbaru  lalu menyegarkan halaman.
```

**Catatan Penting / Efek Samping:**  
**WARNING / PERHATIAN**: Pelaksanaan metode ini bersifat *destructive* pada *lifecycle* peramban. Modifikasi atribut `window.location.search` secara asali **menyebabkan peramban menyegarkan pemuatan ulang halaman (Trigger Page Reload)** secara paksa. Peramban mencatat entri halaman ke riwayat (*history*).

---

### getHash()

**Deskripsi:**  
Mengambil nilai cuplikan (*hash*) dari URL (nilai setelah tanda pagar `#`), tetapi tanpa menyertakan tanda `#` itu sendiri.

**Parameter:**  
Tidak ada.

**Nilai Kembalian:**  
`String` - Teks atau nilai hash murni.

**Cara Kerja Internal:**  
Membaca `window.location.hash`, kemudian memotong urutan karakternya menggunakan metode `.substring(1)` agar karakter nomor indeks ke-0 (yaitu tanda `#`) ditiadakan dari pelaporan data.

**Contoh Penggunaan:**  
```javascript
import { getHash } from './url.js';
// Asumsikan URL: https://example.com/artikel#referensi
console.log(getHash()); // Output: "referensi"
```

**Catatan Penting / Efek Samping:**  
Aman digunakan (*read-only*). Jika hash URL kosong, ini akan mengembalikan string kosong.

---

### setHash(hashvalue)

**Deskripsi:**  
Menetapkan atau menimpa identifier ruas lokal (*hash fragment*) bagi URL yang sedang berjalan di jendela peramban.

**Parameter:**  
- `hashvalue` (*String*): Nilai teks identifier yang ingin ditetapkan sebagai hash ujung URI.

**Nilai Kembalian:**  
Tidak ada (`undefined`).

**Cara Kerja Internal:**  
Melakukan injeksi asignment sepihak pada parameter global ke dalam eksekusi variabel di dalam `window.location.hash = hashvalue`.

**Contoh Penggunaan:**  
```javascript
import { setHash } from './url.js';
setHash("bab-2"); // Menambahkan #bab-2 di akhir URL
```

**Catatan Penting / Efek Samping:**  
Merubah hash browser **TIDAK AKAN mensimulasikan pemuatan ulang halaman (No Reload)** (kecuali memang difungsikan manual via router), melainkan, ia sekadar memerintahkan halaman untuk bergeser (*scroll*) ke elemen bermarkah persis, dan hal tindakan inisiasi fungsional ini akan mencatatkan langkah histori perambatan belakang baru pada memori alur riwayat browser (*adds a new history entry*).

---

### redirect(URL)

**Deskripsi:**  
Memberlakukan navigasi paksa antar halaman atau interupsi *hypertext* menuju URL destinasi yang diminta secara mutlak, mereposisi arah perpindahan pengguna.

**Parameter:**  
- `URL` (*String*): String lengkap lintasan tujuan, bisa memuat URL domain mutlak (misalnya: `"https://google.com"`) mapun navigasi jalur relatif (misalnya: `"/dashboard"`).

**Nilai Kembalian:**  
Tidak ada (`undefined`).

**Cara Kerja Internal:**  
Fungsi memfasilitasi pengeksekusian metode bawaan dari objek peramban aslinya, yakni `window.location.replace(URL)`.

**Contoh Penggunaan:**  
```javascript
import { redirect } from './url.js';
redirect("https://www.google.com");
```

**Catatan Penting / Efek Samping:**  
Berbeda dari asignment rekayasa reguler semacam (`window.location.href = ...`), fungsi pemanggil eksekutor mutan (*replace*) menetapkan ulang navigasi penjelajahan **tanpa ditambahkan ke tumpukan riwayat browser (Does NOT push into history stack)**. Akibatnya, usai dieksekusi, pengguna tidak dapat menekan memori navigasi mundur ("*Back Button*") perambannya untuk dapat mampir maupun balik kembali pada letak sesi sebelum instrumensi fungsi pelompat transisi rute diputuskan (mematikan kapabilitas navigasi mundur). 

---

### onHashChange(callback)

**Deskripsi:**  
Fungsi utilitas registrasi asinkron ini mendengarkan kejadian perubahan status nilai (*hash fragment*) di peramban, dan akan menjalankan suatu alur eksekutor program (*callback function*) secara otomatis di saat pergantian nilai pemicu parameter bersangkutan terjadi.

**Parameter:**  
- `runFunctionEvent` (*Function*): Fungsi (*callback*) yang bakal dieksekusi secara masif di masa depan saban waktu identitas hash terganti. Fungsi eksekutor mewarisi parameter muatan tunggal berisikan metadata *event* aslinya.

**Nilai Kembalian:**  
Tidak ada (`undefined`).

**Cara Kerja Internal:**  
Melibatkan registrasi terhadap pendengar kejadian peramban via `window.addEventListener('hashchange', ...)` dan melekatkan fungsi yang didefinisikan ke struktur fungsional internal bawaannya sembari mendistribusikan metadata *Event* parametrik pada fungsinya.

**Contoh Penggunaan:**  
```javascript
import { onHashChange } from './url.js';
onHashChange((event) => {
    console.log("Hash URL berubah. Cek tab yang terbuka!");
    console.log(event);
});
```

**Catatan Penting / Efek Samping:**  
Berpotensi mendaftarkan tumpukan fungsi memori berkelipatan bila dieksekusi berulang-ulang, menumpuk jumlah listener memori komputasi peramban web pada objek `window`. Listener yang sudah menempel bertugas secara laten mengawasi (*listen*) seumur instansi durasi penjelajahan situs berlangsung atau minimal hingga pemuatan ulang total (*reload*) mendistruksi seluruh instance listener. Fitur esensial dalam rancangan arsitektur *Single Page Application* (SPA).

---

## 3. Efek Samping & Perilaku Khusus

- **Fungsi yang menyebabkan reload (*pembaruan halaman*)**:
  - `setQueryString(key, value)` (terjadi pemaksaan beban ulang karena parameter dasar halaman diubah).
  - `redirect(URL)` (browser mengunduh dan menyapu layar target laman ganti).
- **Fungsi yang mengubah *History* (riwayat pencarian)**:
  - `setHash(hashvalue)` secara default akan menambahkan entri log riwayat ke penjelajah (*pushState* virtual/back behavior taburan).
  - Pengecualian pada `redirect(URL)` yang menggantikan sejarah halamannya alih-alih menambahkan riwayat barunya, sehingga fitur "*Back*" di peramban dilewatkan dan tak berfungsi.
- **Fungsi yang hanya membaca nilai (*Read-Only*)**:
  Aman digunakan kapan saja dan tidak berikatan pada resiko anomali muat siklus, di antaranya adalah: `getProtocol`, `getHost`, `fullPath`, `folderPath`, `getPath`, `getQueryString`, dan `getHash`. Fungsi ini tidak memberikan efek samping modifikasi apa-apa pada instansi komputasi web pengguna.

---

## 4. Keterbatasan

- **Tidak bisa digunakan di Node.js**: Karena Node.js terisolir dan berbasis perangkat peladen untuk abstraksi berkas dan penjelajah C++, platform ini tidak bisa membangkitkan dan tidak memahami hierarki hierodul sentris global bernama `window`, apalagi membongkarnya menjadi entitas properti penunjuk antarmuka peramban layaknya `location` dan rentetan modifikasi parametriknya.
- **Tidak *Server-Side Rendering* (SSR) compatible**: Rata-rata *framework* reaktivitas moderen yang merakit aplikasi *Isomorphic* berwawasan (*Next.js/Nuxt.js* pada kondisi pelembagaan utilitas fungsi `url.js` perintis awal) pastinya mutlak mengalami resiko kebobolan pelaporan galat peramban memicu error logikal karena rujukan referensi objeknya bernilai tak terkonfigurasi pada mesinnya ("`window is not defined`"). Karenanya modul utilitas wajib ditempatkan di dalam cakupan *hook lifecycle browser* seperti `useEffect`.
- **Bergantung mutlak pada window object**: Operasi logis fungsional menuntut keterikatan murni atas variabel mutlak `window` alias antarmuka global asali, dan tidak menyediakan mekanisme modifikasi untuk merujuk pada objek konfigurasi kustom (*Inversion of Control* rekayasa yang spesifik atau mock-up khusus), mengharuskannya tunduk utuh bersama konfigurasi peramban berplatform murni untuk mensurvensi properti semacam `location.host, location.pathname, location.protocol` berikut interseptor kejadian DOM semacam integrasi *Event Listener*.
