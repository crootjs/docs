*[English](en/mapoffline)*

# Dokumentasi Modul `mapoffline.js`

`mapoffline.js` adalah modul tambahan untuk [`map.js`](map) yang menampilkan peta dasar dari **satu file [PMTiles](https://docs.protomaps.com/pmtiles/)** — format satu-file untuk tile peta. File itu bisa:

- ditaruh di server biasa (Cloudflare R2, S3, nginx) tanpa server tile: browser hanya membaca potongan yang dibutuhkan lewat HTTP Range; atau
- dipilih dari perangkat dengan `<input type="file">` — peta lalu jalan **tanpa internet sama sekali**, cocok untuk survei di daerah tanpa sinyal.

Hanya PMTiles versi 3 berisi tile **raster** (PNG, JPEG, WebP, AVIF). Tile vektor (MVT) belum didukung. Ukurannya sekitar 2 KB gzip.

## Cara Penggunaan (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";
import { openPMTiles } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/mapoffline.js";
```

## `openPMTiles(source, responseFunction)`

Membuka file PMTiles. `source`: URL, atau `File`/`Blob`.

`responseFunction(archive, error)` dipanggil sekali; fungsi ini juga mengembalikan Promise berisi `archive`. Kalau gagal (bukan PMTiles, versi lain, tile vektor, kompresi yang belum didukung, server menolak), `archive` = `null` dan `error` berisi alasannya.

`archive` bisa langsung dipakai sebagai opsi `tiles` di [`createMap`](map#createmapid-options) atau [`setTiles`](map#settilesid-tiles-options):

| Kunci | Isi |
|---|---|
| `getTile(z, x, y)` | Promise berisi `Blob` gambar tile, atau `null` kalau file tidak punya tile di sana |
| `minZoom`, `maxZoom` | Rentang zoom yang ada di file |
| `bounds` | `[minLng, minLat, maxLng, maxLat]` cakupan file |
| `center`, `centerZoom` | Titik tengah dan zoom yang disarankan file |
| `tileType` | `"image/png"`, `"image/jpeg"`, `"image/webp"`, atau `"image/avif"` |
| `metadata`, `attribution` | Metadata JSON di dalam file, dan atribusinya kalau ada |

```javascript
const arsip = await openPMTiles("https://contoh.id/peta/bandung.pmtiles");
createMap("peta", {
    tiles: arsip,
    maxNativeZoom: arsip.maxZoom, // di atasnya tile terakhir diperbesar
    maxZoom: arsip.maxZoom + 2,
    center: arsip.center,
    zoom: arsip.centerZoom,
    attribution: arsip.attribution || "© OpenStreetMap contributors",
});
```

### Tanpa internet

```html
<input type="file" id="berkas" accept=".pmtiles">
<div id="peta" class="peta"></div>
```

```javascript
import { onChange } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/element.js";
import { setTiles } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";

createMap("peta", { tiles: false, center: [107.6, -6.9], zoom: 12 });
onChange("berkas", async () => {
    const arsip = await openPMTiles(document.getElementById("berkas").files[0]);
    if (arsip) setTiles("peta", arsip, { maxNativeZoom: arsip.maxZoom });
});
```

File dari `<input type="file">` dibaca langsung dari perangkat, jadi setelah halamannya terbuka peta tetap jalan walau sinyal hilang. Supaya halamannya sendiri juga bisa dibuka tanpa internet, pasang *service worker* atau simpan halaman sebagai PWA.

## Membuat file PMTiles

- [`pmtiles convert`](https://docs.protomaps.com/pmtiles/cli) mengubah file MBTiles raster menjadi PMTiles.
- Tile hasil unduhan dari alat seperti QGIS ("Generate XYZ tiles" ke MBTiles) bisa diubah dengan cara yang sama.
- Pastikan lisensi tile sumbernya mengizinkan disimpan untuk pemakaian offline.

## Catatan

- Kompresi directory yang didukung: tanpa kompresi dan gzip (bawaan `pmtiles`). Brotli dan zstd belum.
- Server harus mengizinkan header `Range` dan, untuk domain lain, CORS. Server yang mengabaikan `Range`, atau melayaninya dengan salah, tetap bisa dipakai: seluruh file diunduh sekali lalu dibaca dari memori (dengan peringatan di console).
- **GitHub Pages** termasuk yang salah: file `.pmtiles` dikompres gzip lalu dipotong dari hasil kompresinya, sehingga potongannya rusak. Di sana file diunduh utuh — tidak masalah untuk file kecil seperti contoh (sekitar 700 KB), tetapi untuk file besar taruh di Cloudflare R2, S3, atau server sendiri.
- Tile ditampilkan lewat *object URL* yang dilepas lagi saat tile keluar dari layar, jadi memori tidak terus bertambah.
