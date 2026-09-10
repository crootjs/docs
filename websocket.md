# Dokumentasi & Panduan Penggunaan `websocket.js`

bagian ini digunakan untuk mempermudah koneksi dan komunikasi dua arah antara aplikasi web (*client*) dengan server menggunakan protokol WebSocket. 

Berikut adalah penjelasan detail masing-masing fungsi beserta langkah-langkah cara menggunakannya:

---

## 1. Persiapan: Import Modul
Langkah pertama sebelum menggunakan fungsi-fungsi di bawah ini adalah mengimpornya ke dalam file JavaScript utama Anda.

```javascript
import { 
  openWebSocketSetId, 
  connectws,
  sendMessagetoWebSocket, 
  closeWebSocket 
} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.8/websocket.js";
```
## 2. Membuka Koneksi & Menangkap Pesan

Untuk membuka koneksi, modul ini menggunakan dua fungsi yang saling terhubung: `openWebSocketSetId` dan `connectws`.

### Penjelasan Fungsi:

* **`openWebSocketSetId(id, url_ws, onMessage?)`**: Fungsi utama untuk membuka koneksi. Mengecek dukungan browser, lalu memanggil `connectws()`. Mengembalikan sebuah **Promise** yang resolve dengan objek `WebSocket` begitu koneksi terbuka (koneksi WebSocket selalu asinkron, jadi tidak mungkin dikembalikan secara langsung/sinkron).
  * **`id`** *(String/Number)*: Identitas unik *user* yang dikirim saat terhubung.
  * **`url_ws`** *(String)*: URL endpoint WebSocket yang **harus** di-enkode Base64.
  * **`onMessage`** *(Function, opsional)*: Callback yang dipanggil setiap pesan masuk, menerima data pesan (`onMessage(pesan)`). Kalau tidak diisi, modul ini akan otomatis memanggil `window.catcher(pesan)` jika Anda sudah mendefinisikannya (lihat opsi B di bawah) — untuk kompatibilitas dengan kode lama.
* **`connectws(id, url_ws, onMessage?)`**: Fungsi *Promise* di belakang layar yang mendekode URL (`atob()`) dan membuka koneksi. Parameternya sama seperti `openWebSocketSetId`.

### Cara Penggunaan:

**Opsi A — Callback eksplisit (direkomendasikan):**

```javascript
// A. Siapkan data koneksi
const idPengguna = "User_714240001";
const urlServer = btoa("wss://contoh-server-websocket.com"); // Wajib di-enkode Base64

// B. Buka koneksi dan tangkap pesan lewat callback
openWebSocketSetId(idPengguna, urlServer, (pesanMasuk) => {
    console.log("Pesan baru dari server: ", pesanMasuk);
    // Tulis logika Anda di sini (misal: tampilkan ke HTML)
}).then((koneksiWs) => {
    // koneksiWs baru tersedia setelah Promise ini resolve —
    // simpan untuk dipakai nanti di sendMessagetoWebSocket/closeWebSocket
    window.koneksiWs = koneksiWs;
});
```

**Opsi B — `window.catcher` global (gaya lama, tetap didukung):**

```javascript
// A. Buat penangkap pesan (Catcher) dari server
window.catcher = function(pesanMasuk) {
    console.log("Pesan baru dari server: ", pesanMasuk);
};

// B. Siapkan data koneksi
const idPengguna = "User_714240001";
const urlServer = btoa("wss://contoh-server-websocket.com"); // Wajib di-enkode Base64

// C. Buka Koneksi — tanpa argumen ke-3, otomatis pakai window.catcher
openWebSocketSetId(idPengguna, urlServer).then((koneksiWs) => {
    window.koneksiWs = koneksiWs;
});
```
## 3. Mengirim Pesan ke Server

Setelah koneksi berhasil dibuka, Anda bisa mengirimkan data menggunakan fungsi `sendMessagetoWebSocket`.

### Penjelasan Fungsi:

* **`sendMessagetoWebSocket(msg, wsocket)`**: Mengirimkan data ke server dengan memastikan status koneksi saat ini sudah `OPEN`.
  * **`msg`** *(String/Object)*: Pesan atau data yang ingin dikirim.
  * **`wsocket`** *(WebSocket Object)*: Variabel penampung koneksi yang didapat dari `openWebSocketSetId`.

### Cara Penggunaan:

Pastikan Anda memberi sedikit jeda waktu (atau letakkan di dalam *event listener* tombol) agar koneksi benar-benar sudah terbuka sebelum pesan dikirim.

```javascript
// Contoh mengirim pesan setelah jeda 2 detik
setTimeout(() => {
    let pesanSaya = "Halo, ini pesan dari Front-End!";

    // Kirim pesan menggunakan koneksi yang disimpan di langkah 2 (window.koneksiWs)
    sendMessagetoWebSocket(pesanSaya, window.koneksiWs);

}, 2000);
```
## 4. Menutup Koneksi

Jika sesi pengguna sudah selesai (misalnya *Log Out* atau berpindah halaman), biasakan untuk menutup jalur komunikasi agar memori tidak bocor.

### Penjelasan Fungsi:

* **`closeWebSocket(wsocket)`**: Mengecek apakah variabel koneksi ada nilainya, lalu menutup jalur WebSocket tersebut secara aman.
  * **`wsocket`** *(WebSocket Object)*: Variabel penampung koneksi yang sedang aktif.

### Cara Penggunaan:

Panggil fungsi ini di dalam *event* tertentu, misalnya saat tombol "Tutup Koneksi" diklik.

```javascript
// Contoh jika dimasukkan ke dalam fungsi tombol
function akhiriSesi() {
    closeWebSocket(window.koneksiWs);
    console.log("Koneksi berhasil diputus.");
}
```
