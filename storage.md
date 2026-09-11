# Dokumentasi Modul `storage.js`

`storage.js` adalah modul dari CrootJS untuk menyimpan, mengambil, dan menghapus data di `localStorage` dan `sessionStorage` browser. Berbeda dari `localStorage`/`sessionStorage` bawaan, modul ini otomatis melakukan `JSON.stringify`/`JSON.parse` (jadi bisa langsung simpan object/array, bukan cuma string), dan `localStorage` mendukung kadaluwarsa opsional (hari/jam/detik) — sesuatu yang tidak dimiliki `localStorage` bawaan.

## Cara Penggunaan (Import)

```javascript
import { setLocal, getLocal, deleteLocal } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.11/storage.js";
```

## localStorage

### `setLocal(key, value)`
Menyimpan data ke `localStorage` tanpa kadaluwarsa (tersimpan sampai dihapus manual atau storage browser dibersihkan). `value` boleh berupa string, number, boolean, object, atau array.

```javascript
setLocal("prefs", { theme: "dark", fontSize: 16 });
```

### `setLocalWithExpireDay(key, value, exdays)` / `setLocalWithExpireHour(key, value, exhour)` / `setLocalWithExpireSecond(key, value, exsecs)`
Menyimpan data ke `localStorage` dengan masa berlaku. Setelah lewat waktunya, `getLocal` otomatis menganggapnya tidak ada (dan langsung menghapusnya dari storage).

```javascript
setLocalWithExpireHour("draftArtikel", { judul: "..." }, 2); // berlaku 2 jam
```

### `getLocal(key)`
Mengambil data dari `localStorage`. Mengembalikan `null` jika key tidak ada, sudah kadaluwarsa, atau datanya korup.

```javascript
const prefs = getLocal("prefs"); // { theme: "dark", fontSize: 16 } atau null
```

### `deleteLocal(key)`
Menghapus data dari `localStorage`.

## sessionStorage

Sama seperti di atas, tapi untuk `sessionStorage` (otomatis hilang saat tab ditutup) dan tanpa opsi kadaluwarsa (tidak relevan, karena `sessionStorage` sudah otomatis dibersihkan browser):

- `setSession(key, value)`
- `getSession(key)`
- `deleteSession(key)`

```javascript
setSession("langkahForm", 2);
const langkah = getSession("langkahForm"); // 2
```

## Catatan

- `localStorage` dan `sessionStorage` berjalan per-origin (domain) dan tidak bisa diakses lintas domain.
- Data yang disimpan dengan modul ini (termasuk yang tanpa kadaluwarsa via `setLocal`) tetap bisa dihapus browser kapan saja (mode private/incognito, storage penuh, atau user membersihkan data situs) — jangan jadikan satu-satunya sumber data penting.
- Kalau butuh cookie (dikirim ke server via HTTP header), pakai [`cookie.js`](cookie), bukan modul ini — `localStorage`/`sessionStorage` cuma bisa diakses lewat JavaScript, tidak otomatis terkirim ke backend.
