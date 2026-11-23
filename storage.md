# Dokumentasi Modul `storage.js`

*[English](en/storage)*

`storage.js` menyimpan, mengambil, dan menghapus data di `localStorage` dan `sessionStorage` browser. Berbeda dari API bawaan, nilai otomatis di-`JSON.stringify`/`JSON.parse` (jadi object dan array bisa disimpan langsung), dan data `localStorage` bisa diberi masa berlaku dalam hari, jam, atau detik.

## Cara Penggunaan (Import)

```javascript
import { setLocal, getLocal, deleteLocal } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/storage.js";
```

## `setLocal(key, value)`

Menyimpan `value` ke `localStorage` tanpa masa berlaku: tetap ada sampai dihapus atau data situs dibersihkan. `value` boleh apa saja yang bisa diubah ke JSON (string, number, boolean, `null`, object, array).

Mengembalikan `true` kalau tersimpan, `false` kalau penyimpanan diblokir atau penuh.

```javascript
setLocal("prefs", { theme: "dark", fontSize: 16 });
```

## `setLocalWithExpireDay(key, value, exdays)`

## `setLocalWithExpireHour(key, value, exhour)`

## `setLocalWithExpireSecond(key, value, exsecs)`

Sama dengan `setLocal`, dengan masa berlaku `exdays` hari, `exhour` jam, atau `exsecs` detik dihitung dari sekarang. Setelah lewat, `getLocal` memberi `null` dan menghapus key itu dari storage. Data kadaluwarsa tidak dihapus sebelum dibaca.

```javascript
setLocalWithExpireHour("draftArtikel", { judul: "Banjir di Dayeuhkolot" }, 2); // berlaku 2 jam
```

## `getLocal(key)`

Mengambil nilai dari `localStorage`, sudah di-parse dari JSON. Mengembalikan `null` kalau key tidak ada, sudah kadaluwarsa, isinya bukan JSON, atau storage diblokir.

```javascript
const prefs = getLocal("prefs"); // { theme: "dark", fontSize: 16 } atau null
```

`getLocal` hanya untuk key yang ditulis lewat modul ini. Nilai yang ditulis dengan `localStorage.setItem` biasa memberi `null` (kalau bukan JSON) atau `undefined`.

## `deleteLocal(key)`

Menghapus key dari `localStorage`. Tidak mengembalikan apa-apa.

## `setSession(key, value)`

## `getSession(key)`

## `deleteSession(key)`

Sama dengan `setLocal`, `getLocal`, dan `deleteLocal`, tapi untuk `sessionStorage`: data hilang saat tab ditutup. Tidak ada varian dengan masa berlaku.

```javascript
setSession("langkahForm", 2);
const langkah = getSession("langkahForm"); // 2
```

## Catatan

- **Penyimpanan diblokir** (sebagian mode privat, pengaturan privasi ketat, atau iframe pihak ketiga) atau **penuh**: sejak 0.0.29 modul ini tidak melempar error. `getLocal`/`getSession` memberi `null`, `setLocal*`/`setSession` memberi `false`, `deleteLocal`/`deleteSession` tidak melakukan apa-apa, dan peringatan muncul sekali per jenis storage di console. Halaman tetap jalan; datanya saja yang tidak tersimpan.
- Nilai melewati `JSON.stringify`: `Date` menjadi string, sedangkan `undefined`, function, `Map`, dan `Set` tidak tersimpan utuh.
- `localStorage` dan `sessionStorage` terpisah per origin (protokol + domain + port).
- Browser tetap bisa menghapus data ini kapan saja (storage penuh, mode privat, atau pengguna membersihkan data situs). Jangan jadikan satu-satunya tempat data penting.
- Data yang perlu ikut terkirim ke server di setiap request disimpan di cookie ([`cookie.js`](cookie)); `localStorage`/`sessionStorage` hanya bisa dibaca JavaScript.
