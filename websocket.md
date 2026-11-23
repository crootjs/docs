# Dokumentasi Modul `websocket.js`

*[English](en/websocket)*

`websocket.js` membuka koneksi WebSocket yang langsung mengirim sebuah ID begitu tersambung, meneruskan setiap pesan masuk ke sebuah callback, serta menyediakan fungsi kecil untuk mengirim pesan dan menutup koneksi. Modul ini cocok untuk server yang mengharapkan pesan pertama dari client berupa identitas pengguna.

Hal yang perlu diketahui sebelum memakai modul ini:

- URL server **wajib** di-enkode Base64 (`btoa("wss://...")`); modul mendekodenya dengan `atob()`.
- Modul mencetak log ke console: `connected and set id`, `socket error rejected`, `connection closed`, dan `incoming message` untuk **setiap** pesan masuk.
- Tidak ada reconnect otomatis. Saat koneksi putus, hanya log `connection closed` yang muncul.

## Cara Penggunaan (Import)

```javascript
import { openWebSocketSetId, connectws, sendMessagetoWebSocket, closeWebSocket } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.32/websocket.js";
```

## `openWebSocketSetId(id, url_ws, onMessage)`

Mengecek dukungan WebSocket di browser, lalu memanggil `connectws`. Mengembalikan Promise yang resolve dengan objek `WebSocket` setelah koneksi terbuka dan `id` sudah terkirim.

Jika browser tidak mendukung WebSocket, fungsi ini memanggil `alert("Please Update Your browser to the latest version.")` lalu mengembalikan Promise yang reject dengan `Error("WebSocket not supported")`.

| Parameter | Keterangan |
|---|---|
| `id` | Dikirim apa adanya lewat `send()` sebagai pesan pertama setelah koneksi terbuka |
| `url_ws` | URL WebSocket dalam bentuk Base64 |
| `onMessage` | Opsional. `function (data)` yang dipanggil untuk setiap pesan masuk dengan `event.data`. Kalau tidak diisi, modul memanggil `window.catcher(data)` jika fungsi itu ada (gaya lama); kalau keduanya tidak ada, pesan diabaikan |

```javascript
import { openWebSocketSetId, sendMessagetoWebSocket, closeWebSocket } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.32/websocket.js";
import { onClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.32/element.js";

const ws = await openWebSocketSetId("user-714240001", btoa("wss://chat.example.com/ws"), (data) => {
    const pesan = JSON.parse(data);
    console.log(pesan.dari, pesan.isi);
});

sendMessagetoWebSocket(JSON.stringify({ isi: "Halo" }), ws);
onClick("keluar", () => closeWebSocket(ws));
```

Promise reject (dengan event `error` dari WebSocket) jika koneksi gagal dibuka. Error yang terjadi setelah koneksi terbuka tidak dilaporkan ke kode Anda.

## `connectws(id, url_ws, onMessage)`

Fungsi yang dipakai `openWebSocketSetId` untuk membuka koneksi. Parameter dan nilai kembaliannya sama, hanya tanpa pengecekan dukungan browser (dan tanpa `alert`). Pakai `openWebSocketSetId` kecuali Anda sudah tahu browser mendukung WebSocket.

## `sendMessagetoWebSocket(msg, wsocket)`

Memanggil `wsocket.send(msg)` jika `wsocket.readyState` adalah `OPEN`. Jika koneksi belum terbuka atau sudah tertutup, pesan **dibuang tanpa error dan tanpa log**.

`msg` dikirim apa adanya. Objek biasa tidak di-serialize (akan terkirim sebagai `"[object Object]"`), jadi ubah dulu dengan `JSON.stringify()`.

## `closeWebSocket(wsocket)`

Menutup koneksi dengan `wsocket.close()`. Fungsi ini hanya melewati nilai `0`; jika `wsocket` bernilai `undefined` atau `null`, akan terjadi `TypeError`.

