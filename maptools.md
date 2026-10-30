# Dokumentasi Modul `maptools.js`

`maptools.js` adalah modul tambahan untuk [`map.js`](map) berisi alat untuk peta teknis dan survei: **alat ukur jarak dan luas**, **gambar bergeoreferensi** (misalnya master plan atau scan denah, bisa diputar), dan **ekspor tampilan peta ke PNG** untuk laporan. Terpisah dari `map.js` supaya halaman yang tidak memakainya tidak ikut mengunduhnya (sekitar 5 KB gzip, ditambah [`geomeasure.js`](geomeasure) untuk hitungan jarak dan luasnya).

## Cara Penggunaan (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.19/map.js";
import { addMeasureControl, measure, addImageOverlay, exportMapImage, downloadMapImage } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.19/maptools.js";
```

Petanya harus sudah dibuat dengan `createMap` lebih dulu.

## `addMeasureControl(id, options)`

Menambahkan dua tombol — **ukur jarak** dan **ukur luas** — beserta kotak hasilnya. Setelah tombol diklik, klik titik-titik di peta; hasilnya diperbarui di setiap titik. Selesaikan dengan klik ganda, Enter, atau tombol **Selesai** (wajib di layar sentuh, yang tidak punya klik ganda). **Hapus titik** (atau Backspace) membuang titik terakhir; **Tutup** (atau Esc) menghapus pengukurannya.

Selama mengukur, klik peta tidak membuka popup dan tidak diteruskan ke `onMapClick`, dan klik ganda tidak men-zoom.

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `corner` | `"top-left"` | Pojok peta |
| `onResult` | — | Function `(result)` yang dipanggil setiap kali pengukuran selesai; `result` sama seperti di `measure` |

Mengembalikan function `remove()`.

```javascript
createMap("peta", { center: [107.5759, -6.8736], zoom: 17 });
addMeasureControl("peta", {
    onResult: (result) => console.log(result.text), // "886 m" atau "19,64 ha · keliling 1,77 km"
});
```

## `measure(id, type, responseFunction, options)`

Alat ukur tanpa tombol, untuk antarmuka buatan sendiri. `type` adalah `"distance"` (jarak di sepanjang titik-titik) atau `"area"` (luas polygon dari titik-titik itu). Cara memakainya di peta sama dengan `addMeasureControl`.

`responseFunction` (opsional) dipanggil sekali saat pengukuran selesai, dengan:

| Kunci | Isi |
|---|---|
| `type` | `"distance"` atau `"area"` |
| `feature` | Feature GeoJSON `LineString` atau `Polygon` hasil ukur — bisa langsung disimpan atau digambar dengan `addGeoJSON` |
| `length` | Panjang (jarak), atau keliling (luas), dalam meter |
| `area` | Luas dalam meter persegi (`0` untuk jarak) |
| `text` | Teks siap tampil, misalnya `"1,25 km"` atau `"850 m² · keliling 120 m"` |

…atau `null` kalau pengukurannya dibatalkan (Esc, `stop()`, atau pengukuran lain dimulai).

`options.onChange` (opsional) dipanggil dengan isi yang sama setiap kali titiknya bertambah atau berkurang.

Mengembalikan `{ finish(), undo(), stop() }`. Bentuk hasil ukur tetap tergambar setelah selesai, sampai `stop()` dipanggil atau pengukuran baru dimulai.

```javascript
const pengukur = measure("peta", "distance", (result) => {
    if (!result) return; // dibatalkan
    setValue("panjang-fiber", Math.round(result.length));
});
// ...
pengukur.stop();
```

`formatLength(meters)` dan `formatArea(squareMeters)` — yang dipakai untuk `text` — ikut diekspor: `formatLength(12345)` → `"12,35 km"`, `formatArea(24500)` → `"2,45 ha"`.

## `addImageOverlay(id, url, options)`

Menempelkan gambar (PNG, JPG, SVG) di peta: di atas peta dasar, di bawah data. Gambar ikut bergeser dan di-zoom bersama peta. Letaknya ditentukan salah satu dari:

| Opsi | Keterangan |
|---|---|
| `bounds` + `rotation` | `[minLng, minLat, maxLng, maxLat]`, ditambah `rotation` dalam derajat (searah jarum jam, berputar di tengah gambar). Cocok kalau gambarnya sudah kira-kira lurus utara |
| `corners` | `[kiriAtas, kananAtas, kiriBawah]` gambar, masing-masing `[lng, lat]`. Tiga titik ini menentukan rotasi, skala, dan kemiringan sekaligus |

Opsi lain: `opacity` (0–1, bawaan 1), `alt`, dan `crossOrigin: true` (lihat ekspor PNG di bawah).

Mengembalikan `{ setCorners(corners), setBounds(bounds, rotation), setOpacity(opacity), remove() }` — misalnya untuk penggeser transparansi.

```javascript
const masterPlan = addImageOverlay("peta", "img/master-plan.png", {
    bounds: [107.5735, -6.8760, 107.5785, -6.8712],
    rotation: 12,
    opacity: 0.7,
});
masterPlan.setOpacity(0.4);
```

**Dari titik kontrol.** Kalau yang diketahui adalah beberapa titik di gambar (piksel) beserta lng/lat-nya, buat transformasinya dengan [`createAffineTransform`](geomeasure#createaffinetransformfrom-to) lalu hitung ketiga sudutnya:

```javascript
import { createAffineTransform } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.19/geomeasure.js";

// Gambar 2400 x 1600 piksel; tiga titik yang dikenali di gambar dan di peta.
const piksel = [[310, 220], [2105, 260], [400, 1390]];
const lokasi = [[107.57402, -6.87188], [107.57791, -6.87201], [107.57417, -6.87458]];
const pikselKeLokasi = createAffineTransform(piksel, lokasi);

addImageOverlay("peta", "img/denah.png", {
    corners: [pikselKeLokasi([0, 0]), pikselKeLokasi([2400, 0]), pikselKeLokasi([0, 1600])],
});
```

**PDF.** Browser tidak bisa menempelkan PDF langsung sebagai gambar. Ubah halamannya ke PNG lebih dulu — dengan aplikasi PDF apa pun, atau di browser dengan pdf.js — lalu tempelkan PNG-nya.

## `exportMapImage(id, responseFunction, options)` dan `downloadMapImage(id, filename, responseFunction, options)`

`exportMapImage` mengubah tampilan peta saat ini menjadi gambar PNG. `responseFunction(blob, info)` dipanggil sekali: `blob` berisi PNG (atau `null` kalau gagal), dan `info` = `{ width, height, missingImages }` — `missingImages` adalah jumlah gambar yang terpaksa dilewati.

`downloadMapImage` melakukan hal yang sama lalu langsung mengunduhnya sebagai file (bawaan `"peta.png"`).

```javascript
downloadMapImage("peta", "lokasi-proyek.png");

exportMapImage("peta", (blob, info) => {
    if (!blob) return;
    if (info.missingImages > 0) console.log(info.missingImages, "gambar tidak ikut (server tanpa CORS)");
    // misalnya kirim ke server sebagai lampiran laporan
});
```

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `scale` | `devicePixelRatio` | Kelipatan resolusi. `2` = gambar dua kali lebih tajam (dan lebih besar) |
| `attribution` | `true` | `false` = tanpa teks atribusi. Lisensi OpenStreetMap mewajibkan atribusi pada gambar yang dipublikasikan |

Yang **ikut**: peta dasar, gambar overlay, semua lapisan GeoJSON (SVG dan canvas), label fitur, marker (pin bawaan, ikon gambar, atau elemen sendiri) beserta labelnya, gelembung [`mapcluster.js`](mapcluster), penanda lokasi, hasil alat ukur, garis skala, dan atribusi.
Yang **tidak ikut**: popup, serta tombol dan panel kontrol.

Label dan elemen HTML digambar dari **CSS hasil hitungan browser**, jadi label berlatar kotak tampil seperti di layar: `background-color`, `border`, `border-radius`, `padding`, perataan, teks beberapa baris (`white-space: pre`), `opacity`, dan isi `::before`/`::after` (misalnya ikon 📷). `text-shadow` menjadi halo di sekeliling teks; kalau warnanya terlalu mirip warna teks (misalnya teks putih dengan bayangan putih), halonya diganti warna yang kontras supaya tetap terbaca. Yang belum ikut digambar: `box-shadow`, latar gradien atau gambar, dan elemen yang diputar dengan `transform`.

Browser hanya mengizinkan gambar dari domain lain masuk ke PNG kalau servernya mengizinkan **CORS**. Tile OpenStreetMap dan Esri mengizinkan. Tile dari server yang tidak mengizinkan dilewati (dihitung di `missingImages`) — sisanya tetap jadi. Untuk gambar overlay dari domain lain, beri `crossOrigin: true` di `addImageOverlay`, dan servernya harus mengirim header CORS.

## Catatan

- Alat ukur dan `exportMapImage` memakai antarmuka `crootjsMap` dari `map.js` yang sama versinya. Impor semua modul peta dari tag versi yang sama.
- Jarak dan luas dihitung di atas bola bumi seperti di [`geomeasure.js`](geomeasure) — hasilnya cocok dengan Turf.js, dan cukup teliti untuk perencanaan (panjang kabel, luas zona), bukan untuk pengukuran batas tanah resmi.
- Hanya satu pengukuran berjalan pada satu waktu per peta; memulai yang baru membatalkan yang lama.
