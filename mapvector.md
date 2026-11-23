# Dokumentasi Modul `mapvector.js`

*[English](en/mapvector)*

`mapvector.js` menggambar **tile vektor** ([Mapbox Vector Tile](https://github.com/mapbox/vector-tile-spec), MVT) menjadi gambar PNG langsung di browser, supaya bisa ditampilkan [`map.js`](map) seperti tile biasa. Biasanya tidak perlu diimpor sendiri: [`mapoffline.js`](mapoffline) memakainya otomatis untuk file PMTiles vektor. Impor langsung kalau ingin **mengganti gaya peta** atau menggambar MVT dari sumber lain.

## Cara Penggunaan (Import)

```javascript
import { decodeMVT, renderVectorTile, DEFAULT_VECTOR_STYLE } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/mapvector.js";
```

## Gaya

Gaya adalah array **aturan** yang digambar berurutan; aturan yang belakangan tampil di atas. Gaya bawaan (`DEFAULT_VECTOR_STYLE`) untuk skema [Protomaps Basemap](https://docs.protomaps.com/basemaps/layers), versi lama (`pmap:kind`) maupun baru (`kind`), dengan warna yang mirip peta OpenStreetMap. File berskema lain digambar dengan gaya umum: area abu-abu, garis gelap, dan label untuk titik bernama.

| Kunci aturan | Keterangan |
|---|---|
| `layer` | Nama layer MVT, misalnya `"roads"`, `"water"`, `"buildings"`. Kosong = semua layer |
| `type` | `"fill"` (poligon), `"line"` (garis), atau `"label"` (titik bernama) |
| `filter` | `function (properties, zoom) => boolean`; hanya fitur yang lolos yang digambar |
| `minZoom`, `maxZoom` | Rentang zoom aturan ini |
| `color` | Warna CSS isi, garis, atau teks |
| `width` | Tebal garis dalam piksel (untuk tile 256 px), atau `function (zoom) => angka` |
| `casing` | Warna tepi garis, digambar sedikit lebih tebal di bawahnya (seperti tepi jalan) |
| `dash` | Pola putus-putus, misalnya `[4, 3]` |
| `outline` | Warna garis tepi poligon |
| `size`, `bold`, `halo` | Ukuran huruf (atau `function (zoom)`), huruf tebal, dan warna halo label |

Contoh: peta dengan jalan utama lebih menonjol dan nama tempat berbahasa Indonesia. Aturan bawaan disalin, lalu satu aturan ditambahkan di akhir supaya tampil paling atas:

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/map.js";
import { openPMTiles } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/mapoffline.js";
import { DEFAULT_VECTOR_STYLE } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/mapvector.js";

const style = [
    ...DEFAULT_VECTOR_STYLE,
    { layer: "roads", type: "line", filter: (p) => (p.kind || p["pmap:kind"]) === "highway", color: "#dc2626", width: (z) => z - 9 },
];
const arsip = await openPMTiles("bandung.pmtiles", null, { style, language: "id" });
createMap("peta", { tiles: arsip, maxZoom: arsip.maxZoom, center: arsip.center, zoom: 13 });
```

## `decodeMVT(bytes)`

Mengurai satu tile MVT (`Uint8Array`, sudah tidak terkompresi) menjadi:

```javascript
{
  namaLayer: {
    extent: 4096,                     // ukuran kisi koordinat tile
    features: [{ type, properties, geometry }]
  }
}
```

`type`: `1` titik, `2` garis, `3` poligon. `geometry`: array garis atau cincin, masing-masing array `[x, y]` dalam koordinat tile (0 sampai `extent`).

## `renderVectorTile(layers, zoom, area, options)`

Menggambar hasil `decodeMVT` menjadi Promise berisi `Blob` PNG.

- `zoom`: zoom tile yang ditampilkan; dipakai oleh `minZoom`, `maxZoom`, dan fungsi di gaya.
- `area` (opsional): `{ scale, dx, dy }` untuk menggambar sebagian tile, yaitu kotak `[dx, dy]` dari kisi `scale × scale`. Dipakai saat zoom melebihi isi file, supaya garis tetap tajam.
- `options`: `style` (bawaan `DEFAULT_VECTOR_STYLE`), `size` (piksel, bawaan 512), `language`, dan `background` (warna latar; bawaan transparan).

Contoh: tile MVT dari server tile vektor biasa, digambar untuk `map.js`.

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/map.js";
import { decodeMVT, renderVectorTile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/mapvector.js";

const vektor = {
    async getTile(z, x, y) {
        const response = await fetch(`https://tiles.contoh.id/${z}/${x}/${y}.mvt`);
        if (!response.ok) return null;
        const layers = decodeMVT(new Uint8Array(await response.arrayBuffer()));
        return renderVectorTile(layers, z, null, { language: "id" });
    },
    attribution: "© OpenStreetMap contributors",
};
createMap("peta", { tiles: vektor, center: [107.6, -6.9], zoom: 13 });
```

Server yang mengirim tile dengan `Content-Encoding: gzip` sudah dibuka kompresinya oleh browser.

## Catatan

- Label hanya untuk titik (nama kota, kampung, POI). Nama jalan yang mengikuti garis belum digambar, dan label yang terpotong tepi tile dilewati supaya tidak tampil setengah.
- Setiap tile digambar di browser saat tampil. Di ponsel lama, peta vektor terasa sedikit lebih lambat muncul daripada tile gambar.
- `OffscreenCanvas` dipakai kalau ada; kalau tidak, kanvas biasa.
