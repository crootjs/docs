# Dokumentasi Modul `mapcache.js`

*[English](en/mapcache)*

`mapcache.js` adalah modul tambahan untuk [`map.js`](map) yang menyimpan **setiap tile peta dasar yang pernah dilihat** di Cache Storage browser. Saat sinyal hilang, atau server tile tidak menjawab, area itu tetap tampil dari tile yang tersimpan. Cocok untuk petugas lapangan yang membuka peta di kantor lalu berangkat ke daerah tanpa sinyal.

Berbeda dari [`mapoffline.js`](mapoffline), di sini tidak perlu menyiapkan file PMTiles: peta OpenStreetMap biasa langsung bisa dipakai, dan yang tersimpan hanya area yang benar-benar pernah dibuka.

## Cara Penggunaan (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/map.js";
import { cachedTiles } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/mapcache.js";

createMap("peta", { tiles: cachedTiles(), center: [107.6, -6.9], zoom: 14 });
```

Atribusi OpenStreetMap tetap terpasang otomatis.

## `cachedTiles(template, options)`

Membuat sumber tile yang tersimpan di cache, untuk opsi `tiles` di [`createMap`](map#createmapid-options) atau [`setTiles`](map#settilesid-tiles-options).

`template`: pola URL tile seperti opsi `tiles` di `createMap` (`{z}`, `{x}`, `{y}`, `{s}`, `{-y}`). Bawaan: OpenStreetMap. Server tile-nya harus mengizinkan CORS; OpenStreetMap dan Esri mengizinkan.

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `name` | `"crootjs-tiles"` | Nama cache. Bedakan untuk tiap peta dasar |
| `maxAge` | `7` | Hari sebelum tile dianggap lama dan diambil ulang saat online. Untuk server OpenStreetMap jangan kurang dari 7, sesuai [kebijakan penggunaannya](https://operations.osmfoundation.org/policies/tiles/) |
| `maxTiles` | `5000` | Jumlah tile terbanyak yang disimpan; yang paling lama dibuang. Satu tile OSM umumnya belasan KB |
| `subdomains` | `["a", "b", "c"]` | Sama dengan opsi `createMap` |
| `attribution` | — | Atribusi peta dasar (teks atau elemen). Untuk template bawaan, atribusi OpenStreetMap dipasang `map.js` |

Cara mengambil tile:

1. Tile yang tersimpan dan belum lebih tua dari `maxAge` dipakai langsung, tanpa request.
2. Selain itu tile diambil dari server lalu disimpan.
3. Kalau server tidak terjangkau atau browser offline, tile lama tetap dipakai walau sudah lewat `maxAge`.

Hasilnya object dengan fungsi tambahan:

| Fungsi | Keterangan |
|---|---|
| `count()` | Promise jumlah tile yang tersimpan |
| `clear()` | Menghapus semua tile di cache ini |
| `downloadArea(bounds, minZoom, maxZoom, onProgress)` | Mengunduh semua tile di suatu area lebih dulu (lihat di bawah) |

```javascript
const tiles = cachedTiles();
createMap("peta", { tiles, center: [107.6, -6.9], zoom: 14 });

console.log(await tiles.count(), "tile tersimpan");
```

### `downloadArea(bounds, minZoom, maxZoom, onProgress)`

Mengunduh tile di `bounds` `[minLng, minLat, maxLng, maxLat]` dari `minZoom` sampai `maxZoom` sebelum berangkat, jadi seluruh area tersedia tanpa harus dibuka satu per satu. Paling banyak 10.000 tile per panggilan. `onProgress(selesai, total)` dipanggil setiap tile selesai. Mengembalikan Promise `{ total, saved, failed, error }`.

**Hanya untuk server tile milik sendiri atau penyedia yang mengizinkan.** Kebijakan OpenStreetMap melarang unduhan massal dari `tile.openstreetmap.org`, jadi template bawaan ditolak (`error` berisi alasannya, tanpa request).

```javascript
import { getMapBounds } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/map.js";
import { onClick, setInnerText } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/element.js";

const tiles = cachedTiles("https://tiles.contoh.id/{z}/{x}/{y}.png", { name: "peta-dinas", attribution: "© Dinas PU" });
createMap("peta", { tiles, center: [107.6, -6.9], zoom: 14 });

onClick("simpan-area", async () => {
    const hasil = await tiles.downloadArea(getMapBounds("peta"), 12, 17, (selesai, total) => {
        setInnerText("status", `${selesai} / ${total} tile`);
    });
    setInnerText("status", hasil.error || `${hasil.saved} tile tersimpan, ${hasil.failed} gagal`);
});
```

## Catatan

- Yang dijamin modul ini hanya tile-nya. Halaman, CSS, dan JS Anda sendiri harus tetap bisa dibuka tanpa internet: dari cache browser, aplikasi WebView, atau *service worker*. Untuk itu pakai [`pwa.js`](pwa): `sw.js` kecil di domain Anda sendiri (service worker tidak bisa didaftarkan dari jsDelivr) yang memuat `serviceworker.js` CrootJS. Service worker itu tidak menyentuh tile dari domain lain, jadi tidak bertabrakan dengan cache modul ini.
- Cache Storage hanya ada di halaman `https` dan `localhost`. Di tempat lain tile dimuat biasa tanpa disimpan, dengan peringatan di console.
- Browser bisa menghapus cache kalau ruang penyimpanan perangkat hampir penuh. `navigator.storage.persist()` meminta browser tidak menghapusnya.
- Tile tersimpan per URL, jadi `{s}` yang berbeda-beda tetap tile yang sama hanya kalau subdomainnya sama. Untuk OpenStreetMap (tanpa `{s}`) tidak masalah.
