# Dokumentasi Modul `geo.js`

`geo.js` adalah modul CrootJS untuk membaca data geospasial. Format yang didukung saat ini adalah **GeoJSON** ([RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946)): mengambilnya dari URL, membacanya dari file yang dipilih user, memvalidasinya, lalu meringkas isinya (kotak pembatas, titik tengah, nama-nama properti).

Apa pun sumber dan bentuk datanya, hasil yang kamu terima selalu sama: sebuah `FeatureCollection` yang setiap fiturnya punya `properties` berupa object. Jadi kode setelahnya cukup ditulis untuk satu bentuk saja.

## Cara Penggunaan (Import)

```javascript
import { getGeoJSON, getBBox, getPropertyKeys } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.23/geo.js";
```

## Mengambil dari URL

### `getGeoJSON(target_url, responseFunction, tokenkey?, tokenvalue?)`

Mengambil GeoJSON dari `target_url`. Urutan parameternya sama dengan `getJSON` di [`api.js`](api/), dan `responseFunction` **selalu** dipanggil dengan `{ status, data }`:

| Kejadian | `status` | `data` |
|---|---|---|
| Berhasil, isinya GeoJSON | kode HTTP (mis. `200`) | `FeatureCollection` |
| Server membalas, tapi isinya bukan GeoJSON | kode HTTP (mis. `200`, `404`) | `null` |
| Jaringan gagal, CORS ditolak, atau lewat 15 detik | `0` | `null` |

```javascript
import { getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.23/geo.js";

getGeoJSON("https://github.com/petapedia/geojson/blob/main/contoh.geojson", (response) => {
    if (response.status === 0) {
        console.log("Request gagal: cek koneksi, atau server tidak mengizinkan CORS.");
        return;
    }
    if (!response.data) {
        console.log("Bukan GeoJSON, status:", response.status);
        return;
    }
    response.data.features.forEach((feature) => {
        console.log(feature.geometry.type, feature.properties.Gedung);
    });
    // Polygon Rektorat
    // Point ULBI
    // Polygon Auditorium
});
```

**Link halaman file GitHub boleh dipakai langsung.** Alamat berbentuk `https://github.com/<owner>/<repo>/blob/<ref>/<path>` (yang kamu salin dari address bar) sebenarnya membalas halaman HTML, bukan isi filenya. `getGeoJSON` otomatis mengubahnya ke alamat `raw.githubusercontent.com` sebelum mengambil datanya.

**Kenapa bukan `getJSON` dari `api.js`?** `getJSON` selalu mengirim header `Content-Type`, sehingga browser lebih dulu mengirim *preflight* CORS. Host file statis seperti `raw.githubusercontent.com` menolak preflight itu, jadi `getJSON` berakhir dengan `status: 0` walaupun filenya ada. `getGeoJSON` tidak mengirim header tambahan apa pun — kecuali kamu mengisi `tokenkey` dan `tokenvalue` — sehingga file statis bisa diambil langsung.

Dengan token (untuk backend milikmu sendiri):

```javascript
import { getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.23/geo.js";
import { getCookie } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.23/cookie.js";

getGeoJSON("https://api.example.com/lokasi", tampilkan, "login", getCookie("login"));

function tampilkan(response) {
    console.log(response.status, response.data);
}
```

## Membaca file lokal

### `readGeoJSONFile(id, responseFunction)`

Membaca file yang dipilih user di `<input type="file" id="...">`. File dibaca langsung di browser, tidak diunggah ke mana pun. `responseFunction` dipanggil dengan `FeatureCollection`, atau `null` kalau belum ada file yang dipilih, file gagal dibaca, atau isinya bukan GeoJSON.

```html
<!-- index.html -->
<input id="berkas" type="file" accept=".geojson,.json">
<script type="module" src="index.js"></script>
```

```javascript
// index.js
import { readGeoJSONFile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.23/geo.js";
import { onChange } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.23/element.js";

onChange("berkas", () => {
    readGeoJSONFile("berkas", (data) => {
        if (!data) {
            console.log("File itu bukan GeoJSON.");
            return;
        }
        console.log(data.features.length, "fitur");
    });
});
```

## Mengurai data yang sudah ada

### `parseGeoJSON(input)`

Dipakai kalau datanya sudah ada di tangan — misalnya teks dari sebuah `<textarea>`, atau object dari respons API lain. `input` boleh berupa teks JSON atau object hasil `JSON.parse`. Mengembalikan `FeatureCollection`, atau `null` kalau `input` bukan GeoJSON. `getGeoJSON` dan `readGeoJSONFile` memakai fungsi ini di dalamnya.

Bentuk masukan yang diterima:

| Masukan | Hasil |
|---|---|
| `FeatureCollection` | `FeatureCollection` yang sama (member lain seperti `name` ikut dipertahankan) |
| Satu `Feature` | `FeatureCollection` berisi satu fitur itu |
| Satu geometri polos (`Point`, `LineString`, `Polygon`, `Multi*`, `GeometryCollection`) | `FeatureCollection` berisi satu fitur dengan `properties: {}` |
| Array berisi `Feature`/geometri (bentuk yang biasa dibalas backend dari query MongoDB) | `FeatureCollection` berisi semuanya |

```javascript
import { parseGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.23/geo.js";

parseGeoJSON('{"type":"Point","coordinates":[107.575914,-6.8732098]}');
// { type: "FeatureCollection", features: [
//     { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [107.575914, -6.8732098] } }
// ] }

parseGeoJSON('{"error":"not found"}'); // null
parseGeoJSON("bukan json");            // null
```

Yang dijamin pada hasilnya:

- `feature.properties` selalu object. `properties: null` (sah di GeoJSON) diubah menjadi `{}`, jadi `feature.properties.nama` tidak pernah melempar error.
- `feature.geometry` bisa `null` — GeoJSON mengizinkan fitur tanpa lokasi. Cek dulu sebelum membaca `feature.geometry.type`.
- Setiap geometri punya `type` yang dikenal dan `coordinates` berisi angka dengan kedalaman array yang sesuai tipenya.
- Object masukan tidak diubah; hasilnya object baru.

Item yang tidak valid di dalam sebuah `FeatureCollection` atau array (misalnya koordinat berupa teks `"107.5"` alih-alih angka) **dilewati**, tidak menggagalkan seluruh data. Indeks item yang dilewati ditulis ke console.

## Membaca isi data

Semua fungsi di bawah menerima bentuk masukan yang sama dengan `parseGeoJSON` — hasil `getGeoJSON`, satu `Feature`, atau satu geometri. Contoh-contohnya memakai `data` dari [contoh.geojson](https://github.com/petapedia/geojson/blob/main/contoh.geojson).

### `getBBox(geojson)`

Kotak pembatas seluruh data: `[minLng, minLat, maxLng, maxLat]`. Mengembalikan `null` kalau datanya tidak punya koordinat sama sekali.

```javascript
getBBox(data); // [107.5755063, -6.8739195, 107.5762898, -6.8732098]
```

### `getCenter(geojson)`

Titik tengah kotak pembatas sebagai `[lng, lat]`, atau `null` kalau datanya tidak punya koordinat. Cocok untuk memusatkan peta. Ini titik tengah kotaknya, bukan *centroid* (titik berat) geometrinya.

```javascript
getCenter(data); // [107.57589805, -6.8735646500000005]
```

### `getPropertyKeys(geojson)`

Nama-nama properti yang dipakai fitur di dalam data, tanpa duplikat, urut sesuai kemunculan pertama. Berguna untuk membuat header tabel ketika tidak semua fitur punya properti yang sama.

```javascript
getPropertyKeys(data); // ["Gedung", "Kampus"]
```

### `getCoordinates(geojson)`

Semua posisi di dalam data, diratakan menjadi satu array `[[lng, lat], ...]`, apa pun tipe geometrinya.

```javascript
getCoordinates(data).length; // 11
```

### `toLatLng(position)`

Membalik satu posisi `[lng, lat]` menjadi `[lat, lng]`.

```javascript
toLatLng([107.575914, -6.8732098]); // [-6.8732098, 107.575914]
```

## Contoh: menampilkan di peta

Untuk menggambar datanya di peta, pakai [`map.js`](map) — modul peta CrootJS sendiri, tanpa library eksternal. Semua fungsi `geo.js` ikut diekspor dari `map.js`, jadi cukup satu import:

```javascript
import { createMap, addGeoJSON, fitMap, getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.23/map.js";

createMap("peta"); // elemen <div id="peta"> harus punya tinggi dari CSS

getGeoJSON("https://github.com/petapedia/geojson/blob/main/contoh.geojson", (response) => {
    if (!response.data) return;
    addGeoJSON("peta", response.data);
    fitMap("peta", response.data);
});
```

Contoh lengkap (URL, file lokal, peta, dan tabel properti): [demo](https://croot.js.org/examples/geo/geojson/) · [source](https://github.com/crootjs/examples/tree/main/geo/geojson).

## Catatan

- **Urutan koordinat GeoJSON adalah `[longitude, latitude]`** — terbalik dari yang biasa ditulis orang ("lat, long"). [`map.js`](map) memakai urutan yang sama, jadi koordinat dari data bisa langsung dipakai. Leaflet dan Google Maps meminta `[lat, lng]`; kalau memakai salah satunya, balik dulu dengan `toLatLng()`.
- `getGeoJSON` tunduk pada CORS. Server tempat file itu berada harus mengirim header `Access-Control-Allow-Origin`; kalau tidak, hasilnya `status: 0`. GitHub (`raw.githubusercontent.com`), GitHub Pages, dan jsDelivr mengirimkannya.
- Validasinya hanya memeriksa bentuk data (tipe geometri dan struktur `coordinates`). Modul ini tidak memeriksa apakah ring polygon tertutup, atau apakah nilai koordinat masuk akal (misalnya latitude di luar -90..90).
- `getBBox` menghitung nilai minimum dan maksimum apa adanya, jadi data yang melintasi garis bujur 180° (antimeridian) akan menghasilkan kotak yang membentang mengelilingi dunia.
- Untuk menghitung dari datanya — jarak, luas, titik di dalam area, titik terdekat — lihat [`geomeasure.js`](geomeasure); untuk rute di sepanjang garis-garisnya, [`georoute.js`](georoute).
- Data yang ditampilkan ke halaman berasal dari luar. Pasang nilai properti lewat `textContent`/`setInnerText`, bukan `innerHTML`/`setInner`, supaya isinya tidak ikut dieksekusi sebagai HTML.
