# Dokumentasi Modul `georoute.js`

`georoute.js` mencari **rute terpendek di sepanjang garis-garis di dalam data GeoJSON**-mu sendiri — jalan, gang, jalur kampus, koridor gedung. Rutenya dihitung di browser: tidak ada layanan rute yang dipanggil, tidak perlu API key, dan tetap jalan tanpa internet selama datanya sudah termuat.

Modul ini murni perhitungan. Ia tidak butuh peta; hasilnya GeoJSON biasa yang bisa digambar dengan [`map.js`](map) atau dipakai begitu saja untuk tahu jarak tempuhnya.

## Cara Penggunaan (Import)

```javascript
import { findRoute } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.22/georoute.js";
```

Semua fungsi [`geomeasure.js`](geomeasure) (`getDistance`, `getLength`, `isInside`, dan lainnya) ikut diekspor dari `georoute.js`, jadi halaman yang menghitung rute cukup mengimpor dari sini.

## `findRoute(from, to, geojson, options)`

Mencari rute terpendek dari `from` ke `to` (keduanya `[lng, lat]`) di sepanjang `LineString` dan `MultiLineString` di dalam `geojson`. Titik dan polygon di dalam data diabaikan.

Mengembalikan sebuah `Feature` bergeometri `LineString` dengan `properties.distance` berisi panjang rute dalam meter — atau `null` kalau datanya tidak punya garis, atau kedua titik tidak terhubung.

```javascript
const jalan = {
    type: "FeatureCollection",
    features: [
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[107.60, -6.90], [107.61, -6.90]] } },
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[107.61, -6.90], [107.61, -6.91]] } },
    ],
};

const rute = findRoute([107.604, -6.898], [107.612, -6.907], jalan);

rute.properties.distance;  // 1440.70... (meter)
rute.geometry.coordinates; // [[107.604, -6.9], [107.61, -6.9], [107.61, -6.907]]
```

Di contoh itu kedua titik tidak berada tepat di atas jalan. **`from` dan `to` boleh di mana saja**: masing-masing ditempelkan ke titik terdekat pada garis terdekat, dan rutenya mulai dan berakhir di titik tempel itu. Jadi koordinat klik atau lokasi user bisa langsung dipakai.

## Menggambar Rutenya di Peta

Karena hasilnya Feature biasa, `addGeoJSON` langsung bisa menggambarnya:

```javascript
import { createMap, addGeoJSON, fitMap, getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.22/map.js";
import { findRoute } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.22/georoute.js";

createMap("peta");

getGeoJSON("jalan.geojson", (response) => {
    if (!response.data) return;

    const rute = findRoute([107.575914, -6.8732098], [107.5772, -6.8752], response.data);
    if (!rute) {
        console.log("Kedua titik tidak terhubung.");
        return;
    }
    addGeoJSON("peta", rute, { style: { stroke: "#2563eb", strokeWidth: 5 } });
    fitMap("peta", rute);
    console.log(`Panjang rute: ${Math.round(rute.properties.distance)} m`);
});
```

Contoh lengkap dengan pin A dan B yang bisa digeser: [demo](https://croot.js.org/examples/geo/route/) · [source](https://github.com/crootjs/examples/tree/main/geo/route).

## Syarat Data: Garis Harus Bertemu di Koordinat yang Sama

Dua garis dianggap tersambung **hanya kalau keduanya punya koordinat yang sama** — di ujung atau di tengah garis. Begitulah data jalan dari OpenStreetMap disusun: setiap persimpangan adalah satu titik yang dipakai bersama oleh jalan-jalan yang bertemu di sana.

Akibatnya:

- Dua garis yang hanya **bersilangan** tanpa titik bersama tidak tersambung. Ini disengaja: jembatan layang dan jalan di bawahnya juga bersilangan di peta, padahal tidak bisa dilewati dari satu ke yang lain.
- Dua garis yang ujungnya hanya **berdekatan** (biasa terjadi pada data yang digambar tangan) tidak tersambung.

Untuk kasus kedua ada opsi `precision`: jumlah angka desimal yang dipakai saat membandingkan koordinat. Makin kecil nilainya, makin longgar dua titik dianggap sama.

| `precision` | Titik dianggap sama kalau berjarak kira-kira |
|---|---|
| `6` (bawaan) | 11 cm |
| `5` | 1 m |
| `4` | 11 m |

```javascript
findRoute(from, to, jalanGambarTangan, { precision: 5 });
```

Kalau `findRoute` mengembalikan `null` padahal di peta garisnya tampak tersambung, hampir selalu ini penyebabnya. Cara paling rapi tetap memperbaiki datanya: saat menggambar, pastikan garis yang bertemu benar-benar berbagi satu titik.

## Catatan

- **Semua garis dianggap dua arah**, dan yang dicari **jarak terpendek** — bukan waktu tercepat. Jalan satu arah, larangan belok, dan kecepatan tidak diperhitungkan. Modul ini cocok untuk jalur pejalan kaki, kawasan kampus, atau jaringan milik sendiri; ia bukan pengganti navigasi kendaraan.
- `properties.distance` adalah panjang di sepanjang garis, dari titik tempel awal sampai titik tempel akhir. Jarak dari `from`/`to` yang kamu berikan ke titik tempelnya tidak termasuk; hitung dengan [`getDistance`](geomeasure) kalau perlu (misalnya untuk memberi tahu "titikmu 300 m dari jalan terdekat").
- Jaringan dibangun ulang di setiap pemanggilan. Pada pengujian, potongan jalan 252 ruas dihitung dalam beberapa milidetik dan jaringan 22.500 persimpangan dalam sekitar 0,1 detik di sebuah laptop; ponsel lebih lambat. Untuk data se-kota, potong datanya ke area yang diperlukan.
- Kalau memakai data OpenStreetMap, cantumkan atribusinya ("© OpenStreetMap contributors"); lisensinya mewajibkan itu juga untuk data, bukan hanya untuk gambar petanya.
