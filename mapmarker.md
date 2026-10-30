# Dokumentasi Modul `mapmarker.js`

`mapmarker.js` adalah modul tambahan untuk [`map.js`](map): marker berbentuk pin, ikon gambar, atau elemen HTML buatan sendiri — dengan label, popup, dan bisa digeser. Modul ini terpisah dari `map.js` supaya halaman yang tidak butuh marker tidak ikut mengunduhnya (sekitar 2 KB gzip).

Titik di dalam data GeoJSON sudah digambar `addGeoJSON` sebagai lingkaran kecil. `addMarker` dipakai kalau butuh lebih dari itu: pin yang menonjol, ikon sendiri, label nama, atau penanda yang digeser user untuk memilih lokasi.

## Cara Penggunaan (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.18/map.js";
import { addMarker } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.18/mapmarker.js";
```

Petanya harus sudah dibuat dengan `createMap` sebelum `addMarker` dipanggil.

## `addMarker(id, position, options)`

Menaruh marker di `position` (`[lng, lat]`) pada peta ber-ID `id`. Tanpa `options`, hasilnya pin merah.

```javascript
createMap("peta", { center: [107.5759, -6.8736], zoom: 17 });

addMarker("peta", [107.575914, -6.8732098]);
addMarker("peta", [107.5757, -6.8738], { label: "Rektorat", popup: "Gedung Rektorat" });
```

`options` (semuanya opsional):

| Opsi | Keterangan |
|---|---|
| `color` | Warna pin bawaan (nilai CSS apa pun). Bawaan: merah |
| `icon` | URL gambar sebagai pengganti pin |
| `size` | `[lebar, tinggi]` gambar `icon` dalam piksel. Bawaan: `[32, 32]` |
| `element` | Elemen DOM buatan sendiri sebagai pengganti pin/ikon |
| `anchor` | Bagian marker yang menempel di posisinya: `"bottom"` (bawaan — ujung bawah di tengah, cocok untuk pin), `"center"` (cocok untuk ikon bulat), `"top"`, `"left"`, `"right"`, `"top-left"`, `"top-right"`, `"bottom-left"`, atau `"bottom-right"` |
| `offset` | `[dx, dy]` — geser tambahan dalam piksel dari titik jangkarnya (`dy` positif = ke bawah). Bawaan: `[0, 0]` |
| `label` | Teks yang selalu tampil di bawah marker |
| `title` | Teks bantuan saat kursor berada di atas marker |
| `popup` | Teks atau elemen DOM yang ditampilkan saat marker diklik |
| `onClick` | Function `(position)` yang dipanggil saat marker diklik |
| `draggable` | `true` = marker bisa digeser dengan mouse atau jari |
| `onDragEnd` | Function `(position)` yang dipanggil setelah marker selesai digeser |

Yang dikembalikan adalah object pengendali marker itu:

| Method | Kegunaan |
|---|---|
| `getPosition()` | Posisi marker sekarang, `[lng, lat]` |
| `setPosition(position)` | Memindahkan marker |
| `remove()` | Menghapus marker dari peta |

## Ikon dan Elemen Sendiri

```javascript
// ikon gambar, ditengahkan di posisinya
addMarker("peta", [107.5757, -6.8738], { icon: "kampus.png", size: [28, 28], anchor: "center" });

// elemen buatan sendiri: tampilannya sepenuhnya dari CSS halamanmu
const lencana = document.createElement("span");
lencana.className = "lencana";
lencana.textContent = "12";
addMarker("peta", [107.5762, -6.8734], { element: lencana, anchor: "center" });
```

## Anchor dan Offset

`anchor` menentukan bagian marker yang menempel tepat di posisinya, dan `offset` menggesernya sedikit dari situ. Contohnya, label nomor tiang yang ditaruh di kanan titiknya, berjarak 6 piksel:

```javascript
const nomor = document.createElement("span");
nomor.className = "nomor-tiang"; // tampilannya dari CSS halamanmu
nomor.textContent = "T-12";
addMarker("peta", [107.5757, -6.8738], { element: nomor, anchor: "left", offset: [6, 0] });
```

Popup marker tetap muncul di atas tepi atas marker, di mana pun anchor-nya.

## Marker yang Bisa Digeser

Kegunaan paling umum: user menggeser pin ke lokasi yang tepat, lalu koordinatnya masuk ke form.

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.18/map.js";
import { addMarker } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.18/mapmarker.js";
import { setValue } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.18/element.js";

createMap("peta", { center: [107.5759, -6.8736], zoom: 17 });

addMarker("peta", [107.5759, -6.8736], {
    draggable: true,
    title: "Geser ke lokasi yang tepat",
    onDragEnd: (position) => {
        setValue("longitude", position[0]);
        setValue("latitude", position[1]);
    },
});
```

Untuk memindahkan marker dari kode — misalnya ke titik yang diklik di peta — pakai `setPosition`:

```javascript
import { onMapClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.18/map.js";

const pin = addMarker("peta", [107.5759, -6.8736]);
onMapClick("peta", (position) => pin.setPosition(position));
```

## Perilaku

- **Klik pada marker milik marker.** `onClick` dan `popup` marker yang jalan; `onMapClick` peta tidak dipanggil, dan klik ganda pada marker tidak men-zoom peta.
- **Menggeser marker yang tidak `draggable` menggeser petanya.** Jadi peta yang penuh marker tetap enak digeser walaupun jari mendarat di atas marker.
- Marker ikut bergerak bersama peta saat digeser dan di-zoom, tetapi ukurannya di layar tetap.
- Marker yang punya `popup`, `onClick`, atau `draggable` bisa dicapai dengan tombol Tab dan diaktifkan dengan Enter.
- Teks `popup` dan `label` dipasang sebagai teks, bukan HTML. Untuk isi berformat, berikan elemen DOM sebagai `popup`.
- Marker ikut hilang kalau petanya dihapus (`removeMap`) atau dibuat ulang (`createMap` dengan ID yang sama).

## Catatan

- `clearMap` hanya menghapus lapisan GeoJSON; marker tidak ikut terhapus. Hapus marker dengan `remove()`-nya sendiri.
- Setiap marker adalah satu elemen HTML. Untuk ratusan marker ini nyaman; untuk ribuan titik, gambar sebagai data GeoJSON dengan `addGeoJSON` (lebih ringan), dan pakai marker hanya untuk yang perlu menonjol.
