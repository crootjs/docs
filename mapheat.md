# Dokumentasi Modul `mapheat.js`

`mapheat.js` adalah modul tambahan untuk [`map.js`](map) yang menggambar data titik sebagai **heatmap** (gradasi kepadatan yang halus) atau **peta petak** (petak persegi/heksagon berwarna menurut nilai rata-ratanya, seperti peta cakupan sinyal nPerf). Keduanya digambar di satu canvas di atas peta dasar dan di bawah lapisan data, jadi tetap ringan untuk puluhan ribu titik: pada pengujian, 50.000 titik digambar ulang dalam sekitar 15–25 ms.

Terpisah dari `map.js` supaya halaman yang tidak memakainya tidak ikut mengunduhnya (sekitar 6 KB gzip, ditambah [`geo.js`](geo) untuk membaca GeoJSON).

## Cara Penggunaan (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.22/map.js";
import { addHeatmap, addGridMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.22/mapheat.js";
```

Petanya harus sudah dibuat dengan `createMap` lebih dulu.

**Data** untuk kedua fungsi boleh berupa:

- GeoJSON apa pun yang diterima [`parseGeoJSON`](geo) — yang dipakai hanya fitur `Point` dan `MultiPoint`, fitur lain dilewati; atau
- array `[lng, lat]`, atau `[lng, lat, nilai]` — lebih hemat untuk data besar dari server sendiri.

## `addHeatmap(id, data, options)`

Menggambar kepadatan titik sebagai gradasi warna: biru di tempat yang sepi, merah di tempat yang paling padat. Tiap titik "memanaskan" sekitarnya, penuh di titiknya dan memudar sampai habis di jarak `radius`.

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `weight` | `1` | Bobot tiap titik: nama properti, atau `function(feature) => angka`. Untuk data array: elemen ketiga kalau ada. Titik berbobot 0, negatif, atau bukan angka dilewati |
| `radius` | `30` | Jarak pengaruh tiap titik, dalam piksel layar. Tetap sama di semua zoom |
| `radiusMeters` | — | Jarak pengaruh dalam meter (menggantikan `radius`): ikut membesar saat di-zoom, cocok kalau "panas" punya arti jarak di lapangan |
| `max` | otomatis | Kepadatan yang dianggap paling panas. Bawaan: kepadatan tertinggi di layar saat itu, seperti heatmap Google Maps. Isi angka tetap supaya warnanya bisa dibandingkan antar-tempat dan antar-waktu |
| `scale` | `"linear"` | `"linear"`, `"sqrt"`, atau `"log"`: cara kepadatan dipetakan ke warna. `"sqrt"`/`"log"` menonjolkan tempat yang sepi kalau datanya menumpuk di beberapa titik saja |
| `gradient` | biru → merah | `{ posisi 0..1: warna }`, misalnya `{ 0.4: "blue", 0.7: "lime", 1: "red" }` |
| `opacity` | `0.8` | Keburaman seluruh lapisan (0–1) |
| `legend` | `false` | `true`, atau `{ title, corner, low, high }`: legenda gradasi di pojok peta (bawaan `"bottom-right"`, teks `"Kepadatan"`, `"Rendah"`, `"Tinggi"`) |

Mengembalikan `{ setData(data), setOptions(options), show(), hide(), remove() }`.

```javascript
createMap("peta", { center: [107.6, -6.9], zoom: 13 });

// Laporan gangguan dari pelanggan; bobot = jumlah keluhan di lokasi itu.
const heat = addHeatmap("peta", laporan, {
    weight: "keluhan",
    radius: 35,
    legend: { title: "Keluhan pelanggan" },
});

heat.setOptions({ scale: "sqrt" }); // tonjolkan area yang keluhannya sedikit
heat.setData(laporanBaru);          // ganti datanya tanpa membuat ulang lapisan
```

## `addGridMap(id, data, options)`

Mengelompokkan titik ke petak-petak persegi atau heksagon, lalu mewarnai tiap petak menurut nilai gabungan titik-titik di dalamnya — misalnya rata-rata RSRP hasil drive test, seperti peta cakupan nPerf. Klik sebuah petak untuk melihat nilainya.

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `value` | — | Nilai tiap titik: nama properti, atau `function(feature) => angka`. Untuk data array: elemen ketiga. Titik tanpa nilai angka dilewati. Tanpa `value`, petak dihitung dari banyaknya titik |
| `aggregate` | `"mean"` | Cara menggabungkan nilai di satu petak: `"mean"`, `"max"`, `"min"`, `"sum"`, atau `"count"`. Tanpa `value`, selalu `"count"` |
| `shape` | `"square"` | `"square"` atau `"hex"` (heksagon) |
| `cellSize` | `32` | Lebar petak dalam piksel layar. Petaknya dikelompokkan ulang di tiap level zoom, jadi ukurannya di layar tetap: di-zoom keluar, satu petak mencakup area yang lebih luas |
| `cellMeters` | — | Lebar petak dalam meter (menggantikan `cellSize`, minimal 2): petaknya tetap di lapangan dan ikut membesar saat di-zoom, seperti peta cakupan. Hitungan meternya memakai lintang rata-rata data |
| `breaks` | otomatis | `[{ value, color, label }]`: petak bernilai `>= value` memakai `color` itu; petak di bawah break pertama memakai warna pertama. `label` opsional, untuk legenda |
| `colors` | merah → hijau | Warna untuk batas otomatis, dari nilai rendah ke tinggi. Bawaan 5 warna merah–kuning–hijau, cocok untuk nilai yang makin tinggi makin baik (sinyal, kecepatan) |
| `opacity` | `0.7` | Keburaman lapisan (0–1) |
| `stroke` | — | Warna garis tepi petak. Bawaan tanpa garis |
| `popup` | nilai + banyak titik | `function(cell) => teks atau elemen` saat petak diklik; `false` = tanpa popup |
| `onClick` | — | `function(cell)` yang dipanggil saat petak diklik |
| `legend` | `false` | `true`, atau `{ title, corner }`: legenda warna di pojok peta (bawaan `"bottom-right"`) |

Tanpa `breaks`, rentang nilai petak dibagi rata ke `colors`. Batas otomatis dihitung dari petak di level zoom yang sedang tampil, jadi dengan `cellSize` legendanya bisa berubah saat di-zoom. Isi `breaks` sendiri supaya warnanya tetap dan bisa dibandingkan, misalnya ambang RSRP baku.

`cell` yang diterima `popup` dan `onClick`:

| Kunci | Isi |
|---|---|
| `value` | Nilai petak menurut `aggregate` |
| `count` | Banyak titik di petak |
| `mean`, `min`, `max`, `sum` | Ringkasan nilai titik-titiknya |
| `center` | `[lng, lat]` titik tengah petak |
| `color`, `label` | Warna petak dan label legendanya |

Mengembalikan `{ setData(data), setOptions(options), show(), hide(), remove() }`.

```javascript
// Hasil drive test: setiap titik punya properti rsrp (dBm).
addGridMap("peta", driveTest, {
    value: "rsrp",
    shape: "hex",
    cellMeters: 100,
    breaks: [
        { value: -140, color: "#d7191c", label: "Sangat lemah (< -110)" },
        { value: -110, color: "#fdae61", label: "Lemah" },
        { value: -100, color: "#ffffbf", label: "Sedang" },
        { value: -90, color: "#a6d96a", label: "Baik" },
        { value: -80, color: "#1a9641", label: "Sangat baik (≥ -80)" },
    ],
    legend: { title: "RSRP (dBm)" },
    popup: (cell) => `RSRP rata-rata ${cell.value.toFixed(1)} dBm dari ${cell.count} pengukuran`,
});
```

Data array juga bisa langsung dipakai — elemen ketiganya menjadi nilai:

```javascript
addGridMap("peta", [[107.601, -6.902, -87], [107.603, -6.901, -95] /* ... */], { legend: true });
```

## Tampilan

Legenda memakai kelas berikut, dan bisa ditimpa dari CSS halaman tanpa `!important`:

| Kelas | Elemen |
|---|---|
| `.crootjs-heat-legend` | Kotak legenda |
| `.crootjs-heat-legend-title` | Judul legenda |
| `.crootjs-heat-legend-row`, `.crootjs-heat-legend-swatch` | Baris warna dan kotak warnanya (`addGridMap`) |
| `.crootjs-heat-legend-bar`, `.crootjs-heat-legend-ends` | Batang gradasi dan teks "Rendah"/"Tinggi" (`addHeatmap`) |
| `canvas.crootjs-heat-canvas` | Canvas lapisannya |

## Catatan

- Selama peta digeser atau di-zoom, gambar yang sudah ada hanya ikut bergeser dan membesar; begitu peta berhenti sejenak (sekitar 0,1 detik), lapisannya digambar ulang dengan tepat. Saat zoom, gradasinya sempat terlihat buram sesaat — itu normal.
- Heatmap dan peta petak selalu di bawah lapisan `addGeoJSON` dan marker. Klik pada fitur `addGeoJSON` membuka popup fitur itu, bukan popup petak di bawahnya.
- Ikut terekspor oleh [`exportMapImage`](maptools#exportmapimageid-responsefunction-options-dan-downloadmapimageid-filename-responsefunction-options) di `maptools.js`. Legendanya tidak, karena kontrol peta tidak ikut diekspor.
- Data yang sangat besar (ratusan ribu titik) tetap bisa, tapi kirim sebagai array `[lng, lat, nilai]` alih-alih GeoJSON supaya hemat memori dan cepat dibaca.
- Heatmap menunjukkan **kepadatan** (di mana titiknya banyak). Untuk menunjukkan **nilai** di suatu tempat (misalnya kekuatan sinyal), pakai `addGridMap` dengan `value` — heatmap berbobot nilai sinyal akan menyesatkan, karena tempat dengan banyak pengukuran tampak "panas" walau sinyalnya lemah.
