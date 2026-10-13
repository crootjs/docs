# Dokumentasi Modul `geomeasure.js`

`geomeasure.js` berisi perhitungan yang paling sering dibutuhkan dari data geospasial: jarak, panjang, luas, titik-di-dalam-area, titik terdekat, dan lingkaran radius. Semuanya fungsi murni — tidak butuh peta, tidak butuh DOM — jadi bisa dipakai dengan atau tanpa [`map.js`](map).

Posisi selalu `[lng, lat]` seperti di GeoJSON, dan hasil selalu dalam **meter** (atau meter persegi).

## Cara Penggunaan (Import)

```javascript
import { getDistance, getArea, isInside } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.15/geomeasure.js";
```

Fungsi yang menerima `geojson` sama fleksibelnya dengan [`parseGeoJSON`](geo): `FeatureCollection`, satu `Feature`, satu geometri polos, array-nya, atau teks JSON. Contoh-contoh di bawah memakai `data` dari [contoh.geojson](https://github.com/petapedia/geojson/blob/main/contoh.geojson).

## `getDistance(from, to)`

Jarak antara dua posisi, mengikuti lengkung bumi.

```javascript
getDistance([106.8272, -6.1754], [107.6191, -6.9175]); // 120258.27... (Monas ke alun-alun Bandung, sekitar 120 km)
```

## `getLength(geojson)`

Panjang semua garis di dalam data. Untuk polygon, yang dihitung kelilingnya (termasuk tepi lubang). Titik tidak punya panjang.

```javascript
getLength({ type: "LineString", coordinates: [[107.60, -6.90], [107.61, -6.90], [107.61, -6.91]] }); // 2215.84...
getLength(data.features[0]); // 110.70... (keliling gedung Rektorat)
```

## `getArea(geojson)`

Luas semua polygon di dalam data, dalam meter persegi. Lubang dikurangkan. Titik dan garis tidak punya luas.

```javascript
getArea(data.features[0]); // 710.28... (gedung Rektorat)
getArea(data);             // 1980.88... (kedua gedung)
```

## `isInside(position, geojson)` dan `getFeaturesAt(position, geojson)`

`isInside` menjawab `true`/`false`: apakah posisi itu berada di dalam salah satu polygon di dalam data. `getFeaturesAt` mengembalikan fitur-fitur polygon yang memuatnya (array kosong kalau tidak ada), untuk tahu *di polygon yang mana*.

```javascript
isInside([107.5761, -6.8735], data); // true
isInside([107.5759, -6.8736], data); // false (di antara kedua gedung)

getFeaturesAt([107.5761, -6.8735], data).map((feature) => feature.properties.Gedung); // ["Auditorium"]
```

Titik yang jatuh di dalam lubang sebuah polygon dihitung berada di luar polygon itu.

## `getNearest(position, geojson)`

Fitur titik (`Point`/`MultiPoint`) yang paling dekat dengan posisi itu. Mengembalikan `{ feature, distance }`, atau `null` kalau datanya tidak punya fitur titik. Garis dan polygon tidak ikut dibandingkan.

```javascript
const terdekat = getNearest([107.5761, -6.8735], data);
terdekat.feature.properties.Gedung; // "ULBI"
terdekat.distance;                  // 38.24...
```

## `createCircle(center, radius, steps = 64)`

Membuat Feature polygon berbentuk lingkaran dengan pusat `center` dan jari-jari `radius` meter. GeoJSON tidak mengenal lingkaran, jadi hasilnya segi banyak dengan `steps` sisi.

```javascript
const radiusPresensi = createCircle([107.575914, -6.8732098], 100); // lingkaran 100 m
```

## Contoh: Presensi Berbasis Lokasi

Gabungan yang paling sering dipakai: gambar radiusnya, ambil lokasi user, lalu periksa apakah ia di dalamnya.

```javascript
import { createMap, addGeoJSON, fitMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.15/map.js";
import { locateUser } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.15/mapcontrol.js";
import { createCircle, isInside, getDistance } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.15/geomeasure.js";

const kampus = [107.575914, -6.8732098];
const area = createCircle(kampus, 100);

createMap("peta");
addGeoJSON("peta", area);
fitMap("peta", area);

locateUser("peta", (lokasi) => {
    if (!lokasi) {
        console.log("Lokasi tidak didapat.");
        return;
    }
    if (isInside(lokasi.position, area)) {
        console.log("Di dalam area presensi.");
    } else {
        console.log(`Di luar area, ${Math.round(getDistance(lokasi.position, kampus))} m dari kampus.`);
    }
});
```

Untuk area yang bentuknya bukan lingkaran, ganti `area` dengan polygon batas kampus dari data GeoJSON-mu; `isInside` bekerja sama.

## Catatan

- Semua perhitungan menganggap bumi bola dengan jari-jari rata-rata 6.371.008,8 m — nilai yang sama dengan Turf.js, sehingga angkanya cocok dengan Turf. Bumi sebenarnya agak pepat, jadi hasilnya bisa meleset beberapa persepuluh persen dari pengukuran geodesi teliti. Untuk jarak dan luas di aplikasi sehari-hari ini lebih dari cukup; untuk batas tanah atau keperluan hukum, pakai alat ukur yang semestinya.
- Lokasi dari perangkat punya ketelitian terbatas (lihat `accuracy` di [`mapcontrol.js`](mapcontrol)). Untuk keputusan seperti presensi, beri kelonggaran: titik yang 5 m di luar batas dengan ketelitian 30 m belum tentu benar-benar di luar.
- Data yang melintasi garis bujur 180° (antimeridian) tidak ditangani khusus.
- Untuk rute di sepanjang jalan (bukan garis lurus), lihat [`georoute.js`](georoute).
