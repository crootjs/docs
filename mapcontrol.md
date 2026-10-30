# Dokumentasi Modul `mapcontrol.js`

`mapcontrol.js` adalah modul tambahan untuk [`map.js`](map) berisi kontrol yang paling sering diminta dari sebuah peta: **garis skala**, **lokasi saya**, **live tracking** (mengikuti lokasi terus-menerus), **pilihan peta dasar**, dan **daftar centang lapisan**. Terpisah dari `map.js` supaya halaman yang tidak memakainya tidak ikut mengunduhnya (sekitar 3 KB gzip).

## Cara Penggunaan (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.17/map.js";
import { addScaleBar, addLocateButton, locateUser, addTrackButton, trackUser, addBasemapControl, addLayerControl } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.17/mapcontrol.js";
```

Petanya harus sudah dibuat dengan `createMap` lebih dulu.

## `addScaleBar(id, corner = "bottom-left")`

Menampilkan garis skala — misalnya "50 m" atau "2 km" — yang ikut berubah saat peta di-zoom atau digeser. `corner` boleh `"bottom-left"` (bawaan), `"bottom-right"`, `"top-left"`, atau `"top-right"`.

Mengembalikan function `remove()` untuk mencabutnya lagi.

```javascript
createMap("peta", { center: [107.5759, -6.8736], zoom: 17 });
addScaleBar("peta");
```

Panjang garisnya dihitung untuk lintang di tengah peta. Di proyeksi Web Mercator skala berubah menurut lintang, jadi pada zoom yang sama garis "5 km" di Norwegia sama panjangnya di layar dengan garis "10 km" di khatulistiwa.

## `addLocateButton(id, responseFunction, corner = "top-left")`

Menambahkan tombol "lokasi saya" ke peta (bawaan: di bawah tombol zoom). Saat diklik, tombol itu menjalankan `locateUser` di bawah ini. `responseFunction` opsional dan menerima hasil yang sama.

Mengembalikan function `remove()` untuk mencabut tombolnya.

```javascript
addLocateButton("peta");
```

## `locateUser(id, responseFunction)`

Menanyakan lokasi perangkat ke browser (sekali), lalu:

1. menandainya di peta dengan titik biru dan lingkaran ketelitian,
2. memindahkan tampilan ke sana — peta yang sedang jauh didekatkan ke zoom 16, peta yang sudah lebih dekat dibiarkan di zoom-nya,
3. memanggil `responseFunction` (opsional) dengan hasilnya.

| Kejadian | Yang diterima `responseFunction` |
|---|---|
| Lokasi didapat | `{ position: [lng, lat], accuracy }` — `accuracy` dalam meter |
| Izin ditolak, perangkat tidak mendukung, atau lewat 15 detik | `null` |

```javascript
import { locateUser } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.17/mapcontrol.js";
import { getDistance } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.17/geomeasure.js";

const kampus = [107.575914, -6.8732098];

locateUser("peta", (lokasi) => {
    if (!lokasi) {
        console.log("Lokasi tidak didapat. Pastikan izin lokasi diberikan.");
        return;
    }
    const jarak = getDistance(lokasi.position, kampus);
    console.log(`Kamu ${Math.round(jarak)} m dari kampus (ketelitian ${Math.round(lokasi.accuracy)} m).`);
});
```

Lingkaran di sekitar titik biru menunjukkan ketelitian: lokasi sebenarnya berada di suatu tempat di dalam lingkaran itu. Ukurannya dalam meter, jadi ikut membesar saat peta di-zoom; titik birunya sendiri tetap sama besar.

Satu peta hanya punya satu penanda lokasi. Pemanggilan berikutnya memindahkan penanda yang sama.

## `trackUser(id, responseFunction, options)`

*Live tracking*: mengikuti lokasi perangkat **terus-menerus**. Bedanya dengan `locateUser` yang mengambil lokasi sekali: di sini penanda lokasi di peta ikut berpindah setiap kali browser melaporkan posisi baru, sampai kamu menghentikannya.

Mengembalikan function `stop()` untuk menghentikan pelacakan.

`responseFunction` (opsional) dipanggil di **setiap** pembaruan dengan:

| Isi | Keterangan |
|---|---|
| `position` | `[lng, lat]` |
| `accuracy` | Ketelitian, dalam meter |
| `speed` | Kecepatan dalam meter per detik, atau `null` kalau perangkat tidak melaporkannya |
| `heading` | Arah gerak dalam derajat dari utara, atau `null` kalau perangkat tidak melaporkannya |
| `timestamp` | Waktu pembacaan, dalam milidetik |

Kalau izin lokasi ditolak atau perangkat tidak mendukung, `responseFunction` dipanggil **sekali** dengan `null` dan pelacakan berhenti sendiri. Gangguan sementara seperti sinyal hilang tidak menghentikan pelacakan; browser mencoba lagi.

```javascript
import { createMap, addGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.17/map.js";
import { trackUser } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.17/mapcontrol.js";

createMap("peta");

// Jejak perjalanan: setiap posisi baru ditambahkan ke sebuah garis yang digambar ulang.
const jejak = [];
let hapusJejak = () => {};

const stop = trackUser("peta", (lokasi) => {
    if (!lokasi) {
        console.log("Pelacakan tidak bisa dijalankan. Pastikan izin lokasi diberikan.");
        return;
    }
    jejak.push(lokasi.position);
    if (jejak.length > 1) {
        hapusJejak();
        hapusJejak = addGeoJSON("peta", { type: "LineString", coordinates: jejak }, { popup: false });
    }
});

// nanti, untuk berhenti:
// stop();
```

**Peta ikut bergeser** supaya lokasinya tetap di tengah. Pembaruan pertama mendekatkan peta yang masih jauh ke zoom 16; sesudahnya zoom pilihan user dipertahankan. Begitu user menggeser peta sendiri, peta berhenti mengikuti — penandanya tetap diperbarui — supaya peta tidak melompat kembali saat user sedang melihat tempat lain.

Kalau petanya tidak boleh bergerak sama sekali, matikan dengan `options`:

```javascript
trackUser("peta", tampilkan, { follow: false });
```

## `addTrackButton(id, responseFunction, options, corner = "top-left")`

Menambahkan tombol live tracking ke peta. Klik pertama memulai `trackUser`, klik berikutnya menghentikannya; tombolnya berwarna biru selama pelacakan berjalan. `responseFunction` dan `options` diteruskan ke `trackUser`.

Mengembalikan function `remove()` yang menghentikan pelacakan dan mencabut tombolnya.

```javascript
addTrackButton("peta");
```

## `addBasemapControl(id, basemaps, options)`

Menambahkan pilihan peta dasar (tombol radio) ke peta. Memilih salah satu memanggil [`setTiles`](map#settilesid-tiles-options) — lapisan, marker, popup, dan tampilan tetap di tempatnya.

`basemaps` adalah array `{ name, tiles, labels, maxNativeZoom, subdomains, errorTiles, attribution }`; semua kunci kecuali `name` sama dengan opsi `setTiles`.

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `selected` | `0` | Indeks atau `name` peta dasar yang langsung dipasang |
| `title` | `"Peta dasar"` | Judul panel (`""` = tanpa judul) |
| `corner` | `"top-right"` | Pojok peta |
| `collapsed` | `false` | `true` = panel disimpan di balik tombol ikon lapisan, dibuka-tutup dengan klik — cocok untuk layar sempit |
| `onChange` | — | Function `(basemap)` yang dipanggil setelah peta dasar diganti |

Mengembalikan function `remove()` untuk mencabut panelnya; peta dasar yang terakhir dipilih tetap terpasang.

```javascript
addBasemapControl("peta", [
    { name: "Jalan" }, // tanpa tiles = OpenStreetMap
    {
        name: "Satelit",
        tiles: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        maxNativeZoom: 18,
        attribution: "Tiles © Esri",
    },
    {
        name: "Hybrid",
        tiles: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        maxNativeZoom: 18,
        attribution: "Tiles © Esri",
    },
]);
```

## `addLayerControl(id, layers, options)`

Menambahkan daftar centang untuk menampilkan/menyembunyikan lapisan bernama (opsi `name` di [`addGeoJSON`](map#lapisan-bernama)). Mencentang hanya mengubah visibilitas — lapisannya tidak digambar ulang, dan popup yang terbuka di lapisan lain tetap terbuka.

`layers` adalah array nama, atau array `{ name, label }` kalau teks di daftar berbeda dari namanya. `null` = semua lapisan bernama yang sudah ada saat fungsi ini dipanggil, dari bawah ke atas.

`options` (semuanya opsional): `title` (bawaan `"Lapisan"`), `corner` (bawaan `"top-right"`), `collapsed`, dan `onChange` — function `(name, visible)` yang dipanggil setiap kali sebuah centang diubah.

Mengembalikan function `remove()` untuk mencabut panelnya.

```javascript
addGeoJSON("peta", jalurFiber, { name: "fiber" });
addGeoJSON("peta", batasZona, { name: "zona" });

addLayerControl("peta", [
    { name: "fiber", label: "Jalur fiber" },
    { name: "zona", label: "Batas zona" },
]);
```

## Catatan

- **Lokasi hanya tersedia di halaman HTTPS** (atau `localhost` saat pengembangan). Di halaman `http://` biasa browser menolak tanpa bertanya ke user, dan hasilnya `null`.
- User harus menyetujui permintaan izin lokasi dari browser. Kalau pernah menolak, browser tidak bertanya lagi sampai izinnya diubah di pengaturan situs.
- Ketelitian tergantung perangkat: ponsel dengan GPS bisa beberapa meter, laptop yang menebak dari Wi-Fi bisa ratusan meter. Selalu periksa `accuracy` sebelum memakai posisinya untuk keputusan seperti presensi.
- `locateUser` mengambil lokasi sekali; `trackUser` mengikutinya terus-menerus. Keduanya memakai penanda lokasi yang sama.
- Pelacakan terus-menerus menguras baterai, terutama dengan GPS. Hentikan dengan `stop()` begitu tidak diperlukan lagi.
- Pelacakan hanya berjalan selama halamannya terbuka. Browser memperlambat atau menghentikan pembaruan lokasi saat tab berada di latar belakang atau layar ponsel mati, jadi ini bukan untuk merekam perjalanan dengan layar tertutup.
- Seberapa sering posisi baru datang ditentukan perangkat dan browser, bukan modul ini.
- Untuk kontrol buatan sendiri (tombol, legenda), pakai [`addMapControl`](map) dari `map.js`.
- `addLayerControl` membaca keadaan awal tiap centang dari lapisannya. Kalau lapisan disembunyikan lewat `hideLayer` setelah panelnya dibuat, centangnya tidak ikut berubah.
