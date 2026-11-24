# Dokumentasi Modul `mapoffline.js`

*[English](en/mapoffline)*

`mapoffline.js` adalah modul tambahan untuk [`map.js`](map) yang menampilkan peta dasar dari **satu file [PMTiles](https://docs.protomaps.com/pmtiles/)** — format satu-file untuk tile peta. File itu bisa:

- ditaruh di server biasa (Cloudflare R2, S3, nginx) tanpa server tile: browser hanya membaca potongan yang dibutuhkan lewat HTTP Range; atau
- dipilih dari perangkat dengan `<input type="file">` — peta lalu jalan **tanpa internet sama sekali**, cocok untuk survei di daerah tanpa sinyal.

PMTiles versi 3 berisi tile **raster** (PNG, JPEG, WebP, AVIF) atau, sejak 0.0.30, tile **vektor** (MVT). Tile vektor digambar di browser oleh [`mapvector.js`](mapvector): file jauh lebih kecil untuk area yang sama, dan peta tetap tajam di atas zoom terbesar file.

## Cara Penggunaan (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/map.js";
import { openPMTiles } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/mapoffline.js";
```

## `openPMTiles(source, responseFunction, options)`

Membuka file PMTiles. `source`: URL, atau `File`/`Blob`.

`responseFunction(archive, error)` dipanggil sekali; fungsi ini juga mengembalikan Promise berisi `archive`. Kalau gagal (bukan PMTiles, versi lain, kompresi yang belum didukung, server menolak), `archive` = `null` dan `error` berisi alasannya.

`options` (opsional, hanya berpengaruh untuk tile vektor):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `language` | — | Kode bahasa nama tempat, misalnya `"id"`: dipakai `name:id` kalau ada di data, selain itu `name` |
| `style` | gaya bawaan | Aturan gaya sendiri (lihat [`mapvector.js`](mapvector#gaya)) |
| `tileSize` | `512` | Resolusi gambar tiap tile dalam piksel; 512 tajam di layar retina |
| `overzoom` | `4` | Berapa level di atas zoom terbesar file masih digambar |

`archive` bisa langsung dipakai sebagai opsi `tiles` di [`createMap`](map#createmapid-options) atau [`setTiles`](map#settilesid-tiles-options):

| Kunci | Isi |
|---|---|
| `getTile(z, x, y)` | Promise berisi `Blob` gambar tile, atau `null` kalau file tidak punya tile di sana |
| `minZoom`, `maxZoom` | Rentang zoom. Untuk tile vektor `maxZoom` sudah termasuk `overzoom` |
| `fileMaxZoom` | Zoom terbesar yang ada di file |
| `bounds` | `[minLng, minLat, maxLng, maxLat]` cakupan file |
| `center`, `centerZoom` | Titik tengah dan zoom yang disarankan file |
| `tileType` | `"image/png"`, `"image/jpeg"`, `"image/webp"`, `"image/avif"`, atau `"mvt"` (vektor) |
| `metadata`, `attribution` | Metadata JSON di dalam file, dan atribusinya sebagai teks (tag HTML dibuang) kalau ada |

Sejak 0.0.30 `map.js` memasang `archive.attribution` sendiri kalau opsi `attribution` tidak diisi.

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

### Tile vektor

```javascript
const arsip = await openPMTiles("https://contoh.id/peta/bandung-vektor.pmtiles", null, { language: "id" });
createMap("peta", {
    tiles: arsip,
    maxZoom: arsip.maxZoom, // file sampai z15 tetap tajam sampai z19
    center: arsip.center,
    zoom: arsip.centerZoom,
});
```

Gaya bawaannya untuk skema [Protomaps Basemap](https://docs.protomaps.com/basemaps/layers), yang dipakai file dari `pmtiles extract` peta dunia Protomaps. File berskema lain tetap tampil dengan gaya umum (area abu-abu, garis, label titik). Untuk warna sendiri, lihat [`mapvector.js`](mapvector).

### Tanpa internet

```html
<input type="file" id="berkas" accept=".pmtiles">
<div id="peta" class="peta"></div>
```

```javascript
import { onChange } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/element.js";
import { setTiles } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/map.js";

createMap("peta", { tiles: false, center: [107.6, -6.9], zoom: 12 });
onChange("berkas", async () => {
    const arsip = await openPMTiles(document.getElementById("berkas").files[0]);
    if (arsip) setTiles("peta", arsip, { maxNativeZoom: arsip.maxZoom });
});
```

File dari `<input type="file">` dibaca langsung dari perangkat, jadi setelah halamannya terbuka peta tetap jalan walau sinyal hilang. Supaya halamannya sendiri juga bisa dibuka tanpa internet, pasang *service worker* atau simpan halaman sebagai PWA.

## Membuat file PMTiles

- [`pmtiles extract`](https://docs.protomaps.com/pmtiles/cli) memotong satu kota atau provinsi dari peta dunia vektor Protomaps (`pmtiles extract https://build.protomaps.com/<tanggal>.pmtiles bandung.pmtiles --bbox=107.5,-7.0,107.75,-6.8`). Sebagai gambaran, contoh resmi kota Firenze sampai zoom 15 berukuran 6,6 MB.
- [`pmtiles convert`](https://docs.protomaps.com/pmtiles/cli) mengubah file MBTiles (raster atau vektor) menjadi PMTiles.
- Tile hasil unduhan dari alat seperti QGIS ("Generate XYZ tiles" ke MBTiles) bisa diubah dengan cara yang sama.
- Pastikan lisensi tile sumbernya mengizinkan disimpan untuk pemakaian offline.

## Catatan

- Kompresi yang didukung: tanpa kompresi dan gzip (bawaan `pmtiles`). Brotli dan zstd belum.
- Tile vektor digambar di browser setiap kali tile tampil. Label hanya untuk titik (nama tempat, POI), tidak mengikuti garis jalan, dan label yang terpotong tepi tile tidak digambar.
- Server harus mengizinkan header `Range` dan, untuk domain lain, CORS. Server yang mengabaikan `Range`, atau melayaninya dengan salah, tetap bisa dipakai: seluruh file diunduh sekali lalu dibaca dari memori (dengan peringatan di console).
- **GitHub Pages** termasuk yang salah: file `.pmtiles` dikompres gzip lalu dipotong dari hasil kompresinya, sehingga potongannya rusak. Di sana file diunduh utuh — tidak masalah untuk file kecil seperti contoh (sekitar 700 KB), tetapi untuk file besar taruh di Cloudflare R2, S3, atau server sendiri.
- Tile ditampilkan lewat *object URL* yang dilepas lagi saat tile keluar dari layar, jadi memori tidak terus bertambah.
