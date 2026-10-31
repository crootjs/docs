# Dokumentasi Modul `mapcluster.js`

`mapcluster.js` adalah modul tambahan untuk [`map.js`](map) yang membuat **data titik yang sangat banyak** tetap ringan di peta. Titik-titik yang berdekatan di layar digabung menjadi satu gelembung berangka; makin peta di-zoom, gelembungnya pecah menjadi kelompok yang lebih kecil, sampai akhirnya titik satuan.

Tanpa pengelompokan, 20.000 titik berarti 20.000 elemen di halaman dan peta yang berat digeser. Dengan modul ini jumlah elemen ditentukan ukuran layar, bukan jumlah data: pada pengujian dengan 100.000 titik, yang tampil di layar tidak pernah lebih dari sekitar 180 elemen.

## Cara Penggunaan (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.22/map.js";
import { addCluster } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.22/mapcluster.js";
```

Petanya harus sudah dibuat dengan `createMap` lebih dulu.

## `addCluster(id, geojson, options)`

Menggambar fitur-fitur titik (`Point` dan `MultiPoint`) di dalam `geojson` sebagai kelompok. `geojson` boleh berupa apa pun yang diterima [`parseGeoJSON`](geo). Fitur yang bukan titik dilewati — gambar garis dan polygon dengan `addGeoJSON` dari `map.js`.

Mengembalikan function `remove()` untuk menghapus semuanya dari peta.

```javascript
import { createMap, fitMap, getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.22/map.js";
import { addCluster } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.22/mapcluster.js";

createMap("peta");

getGeoJSON("https://api.example.com/sekolah.geojson", (response) => {
    if (!response.data) return;
    addCluster("peta", response.data);
    fitMap("peta", response.data);
});
```

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `radius` | `60` | Jarak pengelompokan dalam piksel: titik-titik dalam satu kotak selebar ini digabung. Makin besar, makin sedikit gelembung di layar |
| `color` | biru | Warna gelembung dan titik (nilai CSS apa pun) |
| `popup` | daftar `properties` | Function `(feature) => teks atau elemen DOM` untuk isi popup sebuah titik satuan; mengembalikan `null` = tanpa popup untuk titik itu. `false` = tanpa popup sama sekali |
| `onClick` | — | Function `(feature)` yang dipanggil saat sebuah titik satuan diklik |

```javascript
addCluster("peta", data, {
    radius: 80,
    color: "#dc2626",
    popup: (feature) => feature.properties.nama,
});
```

## Yang Terjadi Saat Diklik

- **Gelembung** — peta di-zoom ke titik tengah kelompok itu, secukupnya sampai kelompoknya pecah menjadi beberapa bagian.
- **Gelembung yang tidak bisa dipecah** — kalau semua anggotanya berada di posisi yang persis sama (atau baru terpisah di luar zoom terdekat peta), tidak ada zoom yang bisa memisahkannya. Sebagai gantinya muncul popup berisi jumlahnya dan rincian lima titik pertama.
- **Titik satuan** — muncul popup berisi `properties`-nya (atau isi dari opsi `popup`), dan `onClick` dipanggil.

Klik pada gelembung atau titik tidak memanggil `onMapClick` peta. Menggeser dengan menekan gelembung tetap menggeser petanya.

Angka di gelembung diringkas kalau besar: `1,2rb` untuk 1.234, `15rb` untuk 15.400, `2,3jt` untuk 2.300.000. Ukuran gelembungnya ikut membesar pada 100 dan 1.000 titik.

## Cara Kerjanya

Pada tiap level zoom, dunia dibagi menjadi kotak-kotak selebar `radius` piksel. Semua titik di satu kotak menjadi satu kelompok, dan gelembungnya digambar di titik tengah (rata-rata posisi) anggotanya — bukan di tengah kotak — supaya letaknya mengikuti datanya.

Itu berarti satu kali jalan melewati semua titik per level zoom, tanpa membandingkan titik satu per satu. Kelompok sebuah level baru dihitung saat level itu pertama kali dibutuhkan, lalu disimpan.

Pada pengujian di sebuah laptop dengan 100.000 titik: persiapan awal sekitar 30 milidetik, kunjungan pertama ke level zoom baru di bawah 10 milidetik, dan geser tetap 60 frame per detik. Ponsel lebih lambat, tetapi polanya sama.

## Catatan

- Karena pembagiannya kotak-kotak, dua titik yang berdekatan tetapi jatuh di kotak yang bersebelahan tidak digabung, jadi kadang dua gelembung tampak cukup dekat. Itu harga dari kecepatannya; naikkan `radius` kalau ingin lebih sedikit gelembung.
- Susunan kelompok berubah per level zoom, jadi angka sebuah gelembung tidak selalu sama dengan jumlah gelembung-gelembung pecahannya di level berikutnya (titik di tepi kotak bisa pindah kelompok). Jumlah keseluruhannya selalu tetap.
- `clearMap` tidak menghapus kelompok; pakai `remove()` yang dikembalikan `addCluster`. Untuk mengganti datanya, panggil `remove()` lalu `addCluster` lagi.
- Datanya tetap harus diunduh dan diurai browser seluruhnya. Untuk ratusan ribu titik, ukuran file GeoJSON-nya sendiri (puluhan megabyte) yang biasanya menjadi penghambat, bukan pengelompokannya. Kalau datanya sebesar itu, minta backend mengirim hanya titik di area yang tampak (lihat `onMapMove` dan `getMapBounds` di [`map.js`](map)).
- Tampilan gelembung bisa diubah dari CSS halamanmu lewat kelas `crootjs-cluster` (gelembung) dan `crootjs-cluster-point` (titik satuan).

Contoh lengkap dengan 1.000 sampai 100.000 titik: [demo](https://croot.js.org/examples/geo/cluster/) · [source](https://github.com/crootjs/examples/tree/main/geo/cluster).
