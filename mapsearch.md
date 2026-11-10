*[English](en/mapsearch)*

# Dokumentasi Modul `mapsearch.js`

`mapsearch.js` adalah modul tambahan untuk [`map.js`](map) untuk **mencari tempat dari nama atau alamat** (geocoding), **mencari alamat dari sebuah titik** (reverse geocoding), dan **kotak pencarian** siap pakai di peta. Ukurannya sekitar 3 KB gzip.

Bawaannya memakai [Nominatim](https://nominatim.org) dari OpenStreetMap. Server publiknya gratis tetapi dijalankan relawan, dengan [aturan pemakaian](https://operations.osmfoundation.org/policies/nominatim/):

- paling banyak **1 permintaan per detik** — modul ini otomatis memberi jeda;
- **tidak boleh mencari otomatis setiap huruf diketik** — kotak pencarian hanya mencari saat Enter atau tombol cari ditekan;
- hasilnya wajib diberi **atribusi OpenStreetMap** — kotak pencarian menampilkannya di bawah hasil.

Untuk aplikasi dengan banyak pengguna, pasang Nominatim sendiri (opsi `url`) atau pakai penyedia lain (opsi `provider`).

## Cara Penggunaan (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";
import { searchPlace, reverseGeocode, addSearchControl } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/mapsearch.js";
```

## `addSearchControl(id, options)`

Kotak pencarian di pojok peta. Ketik lalu Enter (atau tombol cari); pilih hasil dengan klik, atau panah atas/bawah lalu Enter. Peta pindah ke tempat itu — seluruh area kalau hasilnya berupa wilayah — dan memberi tanda merah.

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `placeholder` | `"Cari tempat atau alamat"` | Teks petunjuk di kotak |
| `corner` | `"top-right"` | Pojok peta |
| `marker` | `true` | `false` = tanpa tanda merah |
| `maxZoom` | `17` | Zoom terdekat saat pindah ke hasil |
| `onSelect` | — | `function (result)` saat sebuah hasil dipilih |
| `limit`, `countryCodes`, `language`, `viewbox`, `url`, `provider` | | Sama dengan [`searchPlace`](#searchplacequery-responsefunction-options) |

Mengembalikan `{ search(text), clear(), remove() }` — `search` menjalankan pencarian dari kode.

```javascript
createMap("peta", { center: [107.6, -6.9], zoom: 12 });
addSearchControl("peta", {
    countryCodes: "id",
    onSelect: (result) => setInnerText("lokasi", result.name),
});
```

## `searchPlace(query, responseFunction, options)`

Mencari tempat dari teks: nama tempat, alamat, atau nama jalan. `responseFunction(results)` dipanggil sekali, dan fungsinya juga mengembalikan Promise berisi `results`:

- array hasil (kosong kalau tidak ada yang cocok), atau
- `null` kalau permintaannya gagal (jaringan, server menolak).

Satu hasil:

| Kunci | Isi |
|---|---|
| `name` | Nama lengkap tempat |
| `position` | `[lng, lat]` |
| `bbox` | `[minLng, minLat, maxLng, maxLat]` area tempat itu, atau `null` |
| `type` | Jenisnya, misalnya `"amenity:university"` |
| `address` | Rincian alamat dari Nominatim (`road`, `city`, `postcode`, ...), atau `null` |
| `raw` | Data asli dari penyedia |

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `limit` | `5` | Banyak hasil |
| `countryCodes` | — | Batasi negara, misalnya `"id"` atau `"id,my"` |
| `language` | bahasa browser | Bahasa nama tempat, misalnya `"id"` |
| `viewbox` | — | `[minLng, minLat, maxLng, maxLat]` untuk mengutamakan hasil di area itu |
| `url` | server publik OSM | Alamat server Nominatim sendiri |
| `provider` | — | `function (query, options) => Promise<results>` untuk penyedia lain; hasilnya harus berbentuk seperti tabel di atas |

```javascript
const hasil = await searchPlace("Jalan Asia Afrika Bandung", null, { countryCodes: "id" });
if (hasil && hasil.length) setMapView("peta", hasil[0].position, 17);
```

## `reverseGeocode(position, responseFunction, options)`

Alamat di titik `[lng, lat]`. `responseFunction(result)` menerima satu hasil berbentuk sama dengan di atas, atau `null` kalau tidak ada alamat di sana atau permintaannya gagal. Juga mengembalikan Promise.

`options`: `zoom` (detail alamat 3–18, bawaan 18 = tingkat bangunan), `language`, `url`, `provider` (`function (position, options) => Promise<result>`).

```javascript
onMapClick("peta", async (position) => {
    const alamat = await reverseGeocode(position);
    showPopup("peta", position, alamat ? alamat.name : "Alamat tidak ditemukan");
});
```

## Tampilan

| Kelas | Elemen |
|---|---|
| `.crootjs-map-search` | Kotak pencarian |
| `.crootjs-map-search-button` | Tombol cari |
| `.crootjs-map-search-results` | Daftar hasil (`role="listbox"`); hasil yang disorot `[aria-selected="true"]` |
| `.crootjs-map-search-type` | Jenis tempat di bawah nama |
| `.crootjs-map-search-credit` | Atribusi OpenStreetMap |
| `.crootjs-map-search-pin` | Tanda merah di tempat yang dipilih |
