*[English](en/mapmodel)*

# Dokumentasi Modul `mapmodel.js`

`mapmodel.js` adalah modul tambahan untuk [`map.js`](map) yang menaruh **model 3D glTF/GLB di lokasinya di peta** — misalnya menara BTS di koordinat sebenarnya — dengan ukuran sesuai meter di lapangan, dilihat miring dari selatan.

Peta CrootJS dilihat tegak dari atas, jadi setiap model digambar di kanvas WebGL-nya sendiri (lewat [`model3d.js`](model3d)) lalu ditempel di titiknya. Saat peta di-zoom, ukurannya ikut berubah. Ukuran modul ini sekitar 2 KB gzip, ditambah `model3d.js` yang diimpornya.

## Cara Penggunaan (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";
import { addModel, setPartColor, highlightPart } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/mapmodel.js";
```

`mapmodel.js` **mengekspor ulang semua fungsi [`model3d.js`](model3d)**. Untuk model di peta, impor fungsi-fungsi itu (`setPartColor`, `highlightPart`, `setPartTransform`, ...) dari `mapmodel.js`, bukan dari `model3d.js` terpisah: modul yang diimpor dari URL lain (misalnya `model3d.min.js`) adalah salinan lain dengan daftar penampil sendiri, sehingga `viewerId` model di peta tidak dikenalnya.

## `addModel(id, position, source, options)`

Menaruh model di `position` `[lng, lat]`. `source`: URL `.glb`/`.gltf`, File/Blob, atau ArrayBuffer — sama dengan [`loadModel`](model3d#loadmodelid-source-responsefunction).

**Titik asal model (0, 0, 0)** — di glTF biasanya tengah dasar model — jatuh tepat di `position`. Sumbu model mengikuti glTF: +Y ke atas, **−Z menghadap utara**, +X ke timur.

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `heading` | `0` | Putaran model searah jarum jam dari utara, derajat. Untuk BTS: arah hadap sektor pertama |
| `pitch` | `50` | Sudut pandang di atas cakrawala, derajat (`90` = tegak dari atas) |
| `scale` | `1` | Meter per satuan model. glTF memakai meter; isi lebih dari 1 untuk membesarkan model kecil supaya terlihat |
| `minZoom` | `13` | Di bawah zoom ini model disembunyikan (terlalu kecil untuk dilihat) |
| `onClick` | — | `function (hit)` saat model diklik; `hit` sama dengan [`onModelClick`](model3d#onmodelclickid-runfunction). Klik sampai 8 piksel dari model masih dihitung, karena model di peta biasanya kecil |
| `responseFunction` | — | `function (info, error)` setelah model dimuat, sama dengan `loadModel` |

Mengembalikan:

| Anggota | Kegunaan |
|---|---|
| `setPosition([lng, lat])`, `setHeading(derajat)` | Memindah atau memutar model |
| `viewerId` | ID penampilnya, untuk fungsi `model3d.js` lain — misalnya `setPartColor(model.viewerId, "Antena_1", "red")` |
| `loaded` | Promise hasil `loadModel` |
| `remove()` | Menghapus model dan konteks WebGL-nya |

```javascript
createMap("peta", { center: [107.6, -6.9], zoom: 18 });

const bts = addModel("peta", [107.6, -6.9], "models/bts.glb", {
    heading: 30,
    onClick: (hit) => setInnerText("info", hit.path.join(" › ")),
});
await bts.loaded;
setPartColor(bts.viewerId, "Antena_1", "#f59e0b"); // sektor 1 disorot
```

## Catatan

- **Ukurannya nyata.** Menara 30 m di zoom 18 hanya sekitar 50 piksel. Pakai `scale` untuk melebihkan ukuran kalau tujuannya penanda visual, bukan ukuran sebenarnya.
- **Setiap model memakai satu konteks WebGL**, dan browser membatasi jumlahnya (biasanya 8–16 per halaman). Untuk banyak lokasi, tampilkan model hanya untuk yang dipilih, dan pakai marker biasa untuk sisanya.
- Kanvas model tidak menangkap klik dan geser, jadi peta tetap bisa digeser dari atas model. Klik dicek sendiri ke bentuk modelnya.
- Model selalu di atas lapisan data peta dan tidak ikut [`exportMapImage`](maptools).
- `mapmodel.js` mengimpor `model3d.js` sendiri. Kalau halaman juga butuh penampil 3D biasa, buat dengan `createViewer` yang diimpor dari `mapmodel.js` supaya `model3d.js` tidak terunduh dua kali.
