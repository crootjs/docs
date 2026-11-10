*[English](en/mapdraw)*

# Dokumentasi Modul `mapdraw.js`

`mapdraw.js` adalah modul tambahan untuk [`map.js`](map) untuk **membuat data** di peta, bukan hanya menampilkannya: menggambar titik, garis, dan poligon dengan klik atau tap, lalu mengubah bentuknya — geser simpul, tambah simpul di tengah ruas, hapus simpul. Hasilnya GeoJSON biasa, siap dikirim ke server dengan [`postJSON`](api/) atau diukur dengan [`geomeasure.js`](geomeasure).

Cocok untuk survei lapangan, menandai area cakupan, menggambar rute, atau batas kavling. Bekerja dengan mouse dan layar sentuh.

## Cara Penggunaan (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";
import { addDrawControl, startDrawing, editFeature } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/mapdraw.js";
```

Petanya harus sudah dibuat dengan `createMap` lebih dulu.

## `addDrawControl(id, options)`

Cara paling cepat: tombol-tombol siap pakai di pojok peta, beserta lapisan yang menampilkan hasilnya.

| Tombol | Fungsi |
|---|---|
| Titik | Klik peta untuk menaruh titik. Alatnya tetap aktif untuk titik berikutnya |
| Garis | Klik titik-titik garis; klik ganda atau **Selesai** untuk mengakhiri |
| Area | Klik titik-titik batas; klik titik pertama, klik ganda, atau **Selesai** untuk menutup |
| Ubah | Klik sebuah fitur, lalu geser pegangannya (lihat [`editFeature`](#editfeatureid-feature-options)) |
| Hapus | Klik sebuah fitur untuk menghapusnya |

Panel di bawah tombol menampilkan petunjuk dan tombol **Selesai**, **Hapus titik**, dan **Batal** — wajib untuk layar sentuh yang tidak punya klik ganda. Esc membatalkan.

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `data` | — | GeoJSON awal yang bisa diubah dan dihapus |
| `tools` | semua | Daftar tombol: `["point", "line", "polygon", "edit", "delete"]` |
| `properties` | `{}` | Properties untuk fitur baru: object, atau `function (type) => object` |
| `corner` | `"top-left"` | Pojok peta |
| `onChange` | — | `function (featureCollection)` setiap data berubah: ditambah, diubah, atau dihapus |

Mengembalikan `{ getData(), setData(geojson), clear(), remove() }`. `getData()` memberi salinan FeatureCollection-nya.

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";
import { addDrawControl } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/mapdraw.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/api.js";
import { onClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/element.js";

createMap("peta", { center: [107.6, -6.9], zoom: 16 });
const gambar = addDrawControl("peta", {
    properties: (type) => ({ jenis: type, dibuat: new Date().toISOString() }),
});

onClick("simpan", async () => {
    const { status } = await postJSON("https://api.example.com/survei", gambar.getData(), null);
    console.log(status === 200 ? "Tersimpan" : "Gagal: " + status);
});
```

## `startDrawing(id, type, responseFunction, options)`

Menggambar **satu** geometri, untuk antarmuka buatan sendiri. `type`: `"point"`, `"line"`, atau `"polygon"` (atau nama GeoJSON-nya: `"Point"`, `"LineString"`, `"Polygon"`).

| Aksi | Hasil |
|---|---|
| Klik / tap peta | Menambah titik. Titik (`"point"`) langsung selesai |
| Klik titik pertama poligon | Menutup poligon |
| Klik ganda, atau Enter | Selesai |
| Backspace | Menghapus titik terakhir |
| Esc | Batal |

Selama menggambar, klik peta tidak membuka popup dan tidak diteruskan ke `onMapClick`; menggeser peta tetap bisa.

`responseFunction(feature)` dipanggil sekali: Feature GeoJSON hasilnya, atau `null` kalau dibatalkan. Koordinat dibulatkan ke 7 angka di belakang koma (sekitar 1 cm), dan poligon selalu ditutup (titik terakhir = titik pertama).

`options` (semuanya opsional):

| Opsi | Keterangan |
|---|---|
| `properties` | Properties Feature hasilnya: object, atau `function (type) => object` |
| `onChange` | `function (feature)` setiap titik ditambah atau dihapus — `null` selama titiknya belum cukup |

Mengembalikan `{ finish(), undo(), stop() }` untuk tombol Selesai, Hapus titik, dan Batal buatan sendiri.

```javascript
import { getArea } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/geomeasure.js";

onClick("gambar-kavling", () => {
    startDrawing("peta", "polygon", (feature) => {
        if (!feature) return; // dibatalkan
        setInnerText("luas", Math.round(getArea(feature)) + " m²");
    });
});
```

## `editFeature(id, feature, options)`

Menampilkan pegangan untuk mengubah sebuah geometri:

| Pegangan | Aksi |
|---|---|
| Bulat putih di setiap simpul | Geser untuk memindahkan simpul |
| Bulat kecil oranye di tengah ruas | Geser untuk menambah simpul di situ |
| Klik ganda simpul (mouse), atau tekan lama 0,5 detik (layar sentuh) | Menghapus simpul — garis paling sedikit 2 simpul, area 3 |

`feature` boleh Feature atau geometri saja: `Point`, `LineString`, `Polygon`, atau versi `Multi`-nya, termasuk poligon berlubang. Data aslinya tidak diubah. Menggeser pegangan tidak ikut menggeser peta.

`options.onChange(feature)` dipanggil setiap selesai menggeser, menambah, atau menghapus simpul, dengan bentuk yang sama seperti masukannya (Feature tetap Feature, properties ikut).

Mengembalikan `{ getFeature(), stop() }`. Hanya satu `editFeature` aktif per peta; memanggil lagi menghentikan yang lama.

```javascript
const editor = editFeature("peta", batasKavling, {
    onChange: (feature) => postJSON("https://api.example.com/kavling/7", feature, null),
});
onClick("selesai", () => editor.stop());
```

## Tampilan

Semua bisa ditimpa dari CSS halaman tanpa `!important`.

| Kelas | Elemen |
|---|---|
| `svg.crootjs-draw` | Lapisan gambar (satu untuk gambar yang sedang dibuat, satu untuk hasil `addDrawControl`, satu untuk pegangan ubah) |
| `.crootjs-draw-shape`, `.crootjs-draw-line` | Area/garis; garis tanpa isian |
| `.crootjs-draw-preview` | Garis bantu putus-putus ke posisi kursor |
| `.crootjs-draw-editing` | Bentuk yang sedang diubah |
| `circle.crootjs-draw-point` | Titik hasil `addDrawControl` |
| `circle.crootjs-draw-vertex`, `-vertex-first` | Simpul; simpul pertama poligon (klik untuk menutup) |
| `circle.crootjs-draw-midpoint` | Titik tengah ruas |
| `.crootjs-map-draw`, `.crootjs-map-draw-tool`, `.crootjs-map-draw-panel`, `.crootjs-map-draw-actions` | Kotak kontrol, tombol alat (`aria-pressed="true"` yang aktif), panel petunjuk, dan tombol aksinya |

Di layar sentuh pegangannya otomatis lebih besar.

## Catatan

- Gambar ikut bergeser dan di-zoom bersama peta. Lapisannya SVG di atas data `addGeoJSON`, sehingga belum ikut terekspor oleh `exportMapImage`.
- Untuk menampilkan data yang sudah final dengan gaya, popup, dan label, kirim hasilnya ke [`addGeoJSON`](map#addgeojsonid-geojson-options). `mapdraw.js` untuk membuat dan mengubah data.
- Alat ukur [`maptools.js`](maptools) dan `startDrawing` sama-sama "meminjam" klik peta; hanya satu yang aktif pada satu waktu.
