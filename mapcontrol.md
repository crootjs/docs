# Dokumentasi Modul `mapcontrol.js`

`mapcontrol.js` adalah modul tambahan untuk [`map.js`](map) berisi kontrol yang paling sering diminta dari sebuah peta: **garis skala**, **lokasi saya**, **live tracking** (mengikuti lokasi terus-menerus), **pilihan peta dasar** (daftar atau kartu bergambar), **daftar centang lapisan**, **koordinat kursor**, dan **layar penuh**. Terpisah dari `map.js` supaya halaman yang tidak memakainya tidak ikut mengunduhnya (sekitar 6 KB gzip).

## Cara Penggunaan (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.21/map.js";
import { addScaleBar, addLocateButton, locateUser, addTrackButton, trackUser, addBasemapControl, setBasemap, addLayerControl, addCoordinateControl, addFullscreenButton } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.21/mapcontrol.js";
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
import { locateUser } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.21/mapcontrol.js";
import { getDistance } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.21/geomeasure.js";

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
import { createMap, addGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.21/map.js";
import { trackUser } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.21/mapcontrol.js";

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

Menambahkan pilihan peta dasar ke peta. Memilih salah satu memanggil [`setTiles`](map#settilesid-tiles-options) — lapisan, marker, popup, dan tampilan tetap di tempatnya. Ada dua gaya:

- **`"list"`** (bawaan): panel tombol radio.
- **`"cards"`**: satu kartu bergambar berisi peta dasar yang sedang aktif, seperti pemilih lapisan Google Maps. Diarahkan kursor (atau diklik/diketuk) menjadi kisi kartu semua pilihan; kartu yang aktif berbingkai warna aksen.

`basemaps` adalah array `{ name, tiles, labels, maxNativeZoom, subdomains, errorTiles, attribution, minZoom, maxZoom, thumbnail }`; semua kunci kecuali `name` dan `thumbnail` sama dengan opsi `setTiles`. Dengan `maxZoom`, tiap peta dasar bisa punya batas zoom sendiri; peta langsung di-zoom keluar kalau sedang lebih dekat dari batas peta dasar yang dipilih.

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `style` | `"list"` | `"list"` atau `"cards"` |
| `selected` | `0` | Indeks atau `name` peta dasar yang langsung dipasang |
| `title` | `"Peta dasar"` | Judul panel atau kisi (`""` = tanpa judul) |
| `corner` | `"top-right"` | Pojok peta. Kisi kartu terbuka dari pojok yang sama |
| `onChange` | — | Function `(basemap)` yang dipanggil setelah peta dasar diganti, termasuk lewat `setBasemap` |
| `collapsed` | `false` | Khusus `"list"`: `true` = panel disimpan di balik tombol ikon lapisan, dibuka-tutup dengan klik |
| `trigger` | otomatis | Khusus `"cards"`: `"hover"` (kisi terbuka saat diarahkan kursor) atau `"click"`. Bawaan `"hover"` di perangkat ber-mouse dan `"click"` di layar sentuh |
| `columns` | `3` | Khusus `"cards"`: jumlah kolom kisi. Di layar 640 px ke bawah paling banyak 2 |
| `thumbnailCenter` | pusat peta | Khusus `"cards"`: titik `[lng, lat]` yang ditampilkan di gambar kartu |
| `thumbnailZoom` | zoom peta | Khusus `"cards"`: zoom gambar kartu |

Mengembalikan function `remove()` untuk mencabut kontrolnya; peta dasar yang terakhir dipilih tetap terpasang.

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

### Gaya kartu

```javascript
addBasemapControl("peta", basemaps, {
    style: "cards",
    thumbnailCenter: [125.8959, -9.014],
    thumbnailZoom: 14,
    selected: "Hybrid",
    onChange: (basemap) => console.log("Peta dasar:", basemap.name),
});
```

**Gambar kartu.** Isi `thumbnail` dengan URL gambar kalau ingin gambar sendiri. Tanpa `thumbnail`, gambarnya satu tile dari peta dasar itu sendiri: tile yang memuat `thumbnailCenter` pada `thumbnailZoom`, dengan pola URL yang sama seperti peta (`{z}`, `{x}`, `{y}`, `{-y}`, `{s}`, `{r}`, dan `maxNativeZoom` dihormati). Kalau peta dasarnya punya `labels`, tile label ditumpuk di atas gambar dasarnya — kartu Hybrid tampil sebagai citra beserta labelnya. Bawaan `thumbnailCenter` dan `thumbnailZoom` adalah pusat dan zoom peta saat kontrol dipasang, jadi pasang kontrolnya sesudah peta diarahkan ke lokasi kerja, atau isi keduanya.

**Membuka dan menutup.** Kisi tertutup saat diklik di luar, saat Esc ditekan, setelah sebuah kartu dipilih, atau (dengan `"hover"`) saat kursor meninggalkannya. Dengan `"hover"`, kartu pembuka tetap bisa diklik, jadi pemakai keyboard tetap bisa membukanya.

**Aksesibilitas.** Kartu pembuka adalah `<button>` dengan `aria-haspopup` dan `aria-expanded`; setiap kartu pilihan adalah `<button aria-pressed>`. Saat kisi dibuka dengan klik atau keyboard, fokus pindah ke kartu yang aktif; saat ditutup, fokus kembali ke kartu pembuka.

**Tampilan.** Warna kartu mengikuti `prefers-color-scheme` (terang/gelap). Warna aksen dan lebar kartu bisa diganti lewat variabel CSS `--crootjs-map-accent` dan `--crootjs-map-card-width`, dan semua kelasnya bisa ditimpa dari CSS halaman tanpa `!important`:

```css
#peta {
    --crootjs-map-accent: #16a34a;     /* warna aksen */
    --crootjs-map-card-width: 104px;   /* lebar kartu, bawaan 92px; kisi ikut menyesuaikan */
}
.crootjs-map-card-thumb { width: 84px; height: 84px; }   /* ukuran gambar, bawaan 72px */
```

Lebar bawaan 92 px cukup untuk nama satu kata sepanjang "OpenStreetMap", juga saat bercetak tebal di kartu aktif. Nama yang lebih panjang turun ke baris berikutnya di antara kata; sebuah kata baru dipotong kalau tidak muat satu baris penuh (dengan tanda hubung di browser yang mendukung `hyphens`).

| Kelas | Elemen |
|---|---|
| `.crootjs-map-cards` | Pembungkus kontrol |
| `.crootjs-map-cards-toggle` | Kartu pembuka (peta dasar aktif) |
| `.crootjs-map-cards-grid` | Kisi pilihan |
| `.crootjs-map-cards-title` | Judul kisi |
| `.crootjs-map-card` | Setiap kartu, termasuk kartu pembuka; yang aktif `[aria-pressed="true"]` |
| `.crootjs-map-card-thumb`, `.crootjs-map-card-name` | Gambar dan nama di dalam kartu |

## `setBasemap(id, name)`

Mengganti peta dasar dari kode lewat pemilih `addBasemapControl` yang terakhir dipasang di peta itu, sehingga radio atau kartunya ikut berpindah dan `onChange` ikut dipanggil. `name` adalah `name` atau indeks peta dasarnya. Mengembalikan `true` kalau berhasil, `false` kalau petanya belum punya pemilih atau nama peta dasarnya tidak ada.

```javascript
setBasemap("peta", "Satelit");
```

Untuk mengganti peta dasar tanpa pemilih, pakai [`setTiles`](map#settilesid-tiles-options) dari `map.js`.

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

## `addCoordinateControl(id, options)`

Menampilkan koordinat di bawah kursor mouse. Klik (atau tap) di peta **menahan** koordinat titik itu dan memunculkan tombol salin di sebelahnya. Di layar sentuh tidak ada kursor, jadi yang tampil hanya koordinat yang di-tap.

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `format` | `"lat, lng"` | Function `(position) => teks` yang ditampilkan dan disalin. Ini kait untuk sistem koordinat lokal |
| `precision` | `6` | Angka di belakang koma untuk format bawaan (6 ≈ 10 cm) |
| `corner` | `"bottom-left"` | Pojok peta |
| `onClick` | — | Function `(position, text)` yang dipanggil saat koordinat ditahan |

Mengembalikan function `remove()`.

Format bawaan berurutan **lat, lng** (`-6.873600, 107.575900`) — urutan yang diterima kotak pencarian Google Maps dan kebanyakan GPS — walaupun `position` tetap `[lng, lat]`.

Tombol salin memakai Clipboard API, yang hanya tersedia di halaman HTTPS (atau `localhost`). Di halaman `http://` biasa teksnya diblok, jadi tinggal tekan Ctrl+C.

**Grid lokal (CAD).** Dengan [`createAffineTransform`](geomeasure#createaffinetransformfrom-to) dari `geomeasure.js`, koordinat bisa ditampilkan dalam grid proyek. Contohnya, tiga titik patok yang diketahui koordinat grid dan lng/lat-nya:

```javascript
import { createAffineTransform } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.21/geomeasure.js";

const grid = [[1000, 2000], [1500, 2000], [1000, 2400]];                  // meter, grid CAD
const wgs84 = [[107.57520, -6.87410], [107.57974, -6.87407], [107.57517, -6.87048]];
const gridToWgs = createAffineTransform(grid, wgs84);

addCoordinateControl("peta", {
    format: (position) => {
        const [x, y] = gridToWgs.inverse(position);
        return `X ${x.toFixed(2)}  Y ${y.toFixed(2)}`;
    },
});
```

## `addFullscreenButton(id, corner = "top-left")`

Menambahkan tombol layar penuh: peta memenuhi seluruh layar, klik lagi (atau Esc) untuk kembali. Browser tanpa Fullscreen API untuk elemen — Safari di iPhone — mendapat tiruannya: peta memenuhi jendela browser. Ukuran peta menyesuaikan sendiri di kedua arah.

Mengembalikan function `remove()`, yang juga keluar dari layar penuh.

```javascript
addFullscreenButton("peta");
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
