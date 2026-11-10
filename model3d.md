*[English](en/model3d)*

# Dokumentasi Modul `model3d.js`

`model3d.js` menampilkan model 3D **glTF 2.0** (`.glb` dan `.gltf`) langsung di browser: putar, zoom, klik sebuah bagian, ganti warnanya, sembunyikan, atau ubah posisi dan rotasinya lewat kode. Semuanya ditulis dari nol di atas WebGL — parser biner GLB, matriks, shader, dan kontrol orbit sendiri — tanpa Three.js (sekitar 600 KB) atau library lain. Ukurannya sekitar 16 KB gzip.

Merender dengan **WebGL2**, dan otomatis turun ke **WebGL1** di browser lama. Gizmo geser/putar di layar, label HTML yang menempel di model, animasi, tampilan meledak, potongan melintang, dan ekspor `.glb` ada di modul tambahan [`model3dtools.js`](model3dtools).

## Cara Penggunaan (Import)

```javascript
import { createViewer, loadModel } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/model3d.js";
```

## Contoh Minimal

```html
<!-- index.html -->
<link rel="stylesheet" href="style.css">
<div id="model" class="model"></div>
<output id="status"></output>
<script type="module" src="index.js"></script>
```

```css
/* style.css — penampil mengisi elemennya, jadi tingginya wajib ditentukan */
.model { height: 420px; }
```

```javascript
// index.js
import { createViewer, loadModel, onModelClick, highlightPart } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/model3d.js";
import { setInnerText } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/element.js";

createViewer("model");
loadModel("model", "models/bts.glb", (info, error) => {
    if (!info) return setInnerText("status", "Gagal: " + error);
    setInnerText("status", `${info.parts.length} bagian, ${info.triangles} segitiga`);
});

onModelClick("model", (hit) => {
    highlightPart("model", hit ? hit.part : null);
    setInnerText("status", hit ? hit.path.join(" › ") : "—");
});
```

## `createViewer(id, options)`

Membuat penampil di dalam elemen `id` (biasanya `<div>`). Elemennya harus punya tinggi dari CSS. Memanggil lagi dengan `id` yang sama membuat ulang penampilnya.

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `background` | abu-abu terang bergradasi | Latar, nilai CSS `background` apa pun (`"#1a1a1a"`, gradasi, `"transparent"`) |
| `autoRotate` | `0` | Derajat per detik model berputar sendiri. Berhenti begitu pengguna menyentuhnya |
| `fov` | `45` | Sudut pandang vertikal kamera, derajat |
| `controls` | `true` | `false` = tanpa putar/zoom/geser dari pengguna, misalnya untuk tampilan produk yang diam |
| `webgl` | `2` | `1` = paksa WebGL1, untuk menguji tampilan di browser lama |
| `dracoDecoder` | dari `www.gstatic.com` | Folder dekoder Draco (`draco_wasm_wrapper_gltf.js` + `draco_decoder_gltf.wasm`) untuk model terkompresi Draco. Isi dengan folder sendiri kalau aplikasinya tidak boleh bergantung pada server Google |

Kalau browser tidak punya WebGL sama sekali, penampil menampilkan pesan dan semua fungsi lain tidak melakukan apa-apa.

## `loadModel(id, source, responseFunction)`

Memuat model dan menggantikan model sebelumnya. Kamera otomatis diatur supaya seluruh model terlihat.

- `source` — URL file `.glb`/`.gltf`, **File/Blob** (misalnya dari `<input type="file">`), atau `ArrayBuffer`.
- `responseFunction(info, error)` — dipanggil setelah model tampil. `info` berisi:

| Kunci | Isi |
|---|---|
| `parts` | Nama semua bagian (node), urut seperti pohonnya |
| `triangles` | Jumlah segitiga |
| `bounds` | `{ min, max, center, size }` kotak pembatas model, dalam satuan model (glTF memakai meter) |

Kalau gagal, `info` = `null` dan `error` berisi alasannya (juga dicetak di console). `loadModel` juga mengembalikan Promise berisi `info` yang sama, jadi bisa di-`await`.

```javascript
// Membuka file dari komputer pengguna
import { onChange } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/element.js";

onChange("file", () => {
    loadModel("model", document.getElementById("file").files[0], (info, error) => {
        console.log(info || error);
    });
});
```

Untuk `.gltf` yang memakai file `.bin` dan gambar terpisah, file-file itu diunduh dari folder yang sama dengan URL `.gltf`-nya. Dari `<input type="file">`, hanya `.glb` atau `.gltf` dengan data tertanam (*embedded*) yang bisa dibuka, karena file pendampingnya tidak ikut terpilih.

## Bagian Model

Model glTF tersusun dari **node** bertingkat — misalnya `Menara` › `Sektor_1` › `Antena_1`. Di modul ini node disebut **bagian**, dan dicari lewat namanya (nama node, atau nama mesh-nya kalau node tidak bernama). Perubahan pada sebuah bagian (warna, sembunyi, posisi) ikut berlaku untuk semua bagian di bawahnya. Kalau beberapa node bernama sama, semuanya ikut berubah.

### `getParts(id)`

Daftar semua bagian, urut seperti pohonnya: `[{ name, mesh, parent, depth, visible }]`. `depth` = kedalaman di pohon (0 = paling atas), berguna untuk membuat daftar menjorok.

### `setPartColor(id, name, color)`

Mengganti warna bagian. `color`: warna CSS apa pun (`"#ff0000"`, `"red"`, `"rgba(255, 0, 0, 0.5)"`) atau `[r, g, b, a]` 0..1. Alpha di bawah 1 membuatnya transparan. `null` = kembali ke warna aslinya. Warna baru menggantikan tekstur bagian itu. Mengembalikan `false` kalau bagiannya tidak ada.

### `setPartVisible(id, name, visible)`

Menampilkan (`true`) atau menyembunyikan (`false`) bagian.

### `highlightPart(id, name)`

Menandai bagian yang sedang dipilih dengan warna biru. `null` = hapus tanda. Hanya satu nama yang ditandai sekaligus.

### `getPartTransform(id, name)` dan `setPartTransform(id, name, transform)`

Posisi, rotasi, dan skala bagian **relatif terhadap induknya** — sama dengan nilai `translation`, `rotation`, dan `scale` di file glTF.

`getPartTransform` mengembalikan:

| Kunci | Isi |
|---|---|
| `position` | `[x, y, z]` |
| `rotation` | `[x, y, z]` derajat, Euler urutan XYZ (sama dengan Blender dan Three.js) |
| `quaternion` | `[x, y, z, w]` rotasi yang sama |
| `scale` | `[x, y, z]` |

`setPartTransform` mengubah yang diisi saja: `position`, `rotation` (`[x, y, z]` derajat, atau quaternion `[x, y, z, w]`), dan `scale` (angka, atau `[x, y, z]`).

```javascript
// Azimuth 150° dan downtilt 6° untuk antena sektor 2. Sumbu Y glTF mengarah ke atas.
setPartTransform("model", "Sektor_2", { rotation: [0, -150, 0] });
setPartTransform("model", "Antena_2", { rotation: [6, 0, 0] });
```

## `onModelClick(id, runFunction)`

`runFunction(hit)` dipanggil setiap kali model diklik atau di-*tap* (memutar tidak dihitung klik):

| Kunci | Isi |
|---|---|
| `part` | Nama bagian paling bawah yang kena |
| `mesh` | Nama mesh-nya, atau `null` |
| `path` | Nama-nama bagian dari yang teratas sampai `part`, misalnya `["BTS", "Menara", "Sektor_1", "Lengan_1", "Antena_1"]` — untuk memilih kelompoknya, bukan potongan kecilnya |
| `position` | `[x, y, z]` titik yang kena, dalam koordinat model |
| `distance` | Jarak dari kamera |

`hit` = `null` kalau yang diklik latarnya. Mengembalikan function `stop()`.

## Kamera

### `fitView(id, name)`

Menggerakkan kamera dengan halus supaya seluruh model pas di layar. Dengan `name`, hanya bagian itu; `name` juga boleh array nama, misalnya `["Sektor_1", "Sektor_2", "Sektor_3"]`.

### `setCameraView(id, view, animate = true)` dan `getCameraView(id)`

`view` = `{ yaw, pitch, distance, target }`, yang diisi saja:

- `yaw` — sudut keliling, derajat. 0 = dari depan (arah +Z).
- `pitch` — sudut dari atas, derajat, -89 sampai 89.
- `distance` — jarak kamera ke `target`, satuan model.
- `target` — `[x, y, z]` titik yang dilihat.

`getCameraView` mengembalikan nilai yang sama. Simpan lalu pasang lagi untuk "bookmark" sudut pandang.

### `setAutoRotate(id, degreesPerSecond)`

Memutar model terus-menerus; `0` = berhenti. Berhenti juga begitu pengguna menyentuh model.

## `clearModel(id)` dan `removeViewer(id)`

`clearModel` menghapus model, penampilnya tetap. `removeViewer` menghapus penampil beserta konteks WebGL-nya; elemennya tetap ada.

## Interaksi Bawaan

| Aksi | Hasil |
|---|---|
| Geser dengan mouse atau satu jari | memutar model |
| Klik kanan + geser, Shift/Ctrl + geser, atau geser dua jari | menggeser pandangan |
| Roda mouse / pinch | zoom |
| Klik ganda | memusatkan kamera di titik itu dan mendekat |
| Klik / tap | `onModelClick` |
| Panah (saat penampil difokus) | memutar 10° |
| `+` / `-` (saat penampil difokus) | zoom |

Pengguna yang mengaktifkan *reduce motion* di sistemnya mendapat perpindahan kamera tanpa animasi dan tanpa putaran otomatis.

## Dukungan glTF

| Didukung | Belum didukung |
|---|---|
| `.glb` dan `.gltf` (buffer tertanam, `data:` URI, atau file `.bin` terpisah) | Kompresi meshopt — ekspor ulang tanpa kompresi |
| Kompresi **Draco** (`KHR_draco_mesh_compression`), lihat [catatan Draco](#draco) | |
| Node bertingkat dengan `matrix` atau translation/rotation/scale | |
| ***Skinning*** — karakter atau organ yang permukaannya melentur mengikuti tulang, sampai 64 tulang per mesh | Lebih dari 64 tulang (atau lebih dari kemampuan GPU) — tampil dalam pose diam, dengan peringatan |
| Animasi node, diputar dengan [`playAnimation`](model3dtools#getanimationsid-dan-playanimationid-animation-options) di `model3dtools.js` | |
| Warna dasar, tekstur warna (PNG/JPEG), warna per titik (`COLOR_0`) | Peta normal, *occlusion*, dan tekstur logam/kekasaran |
| `metallicFactor`, `roughnessFactor`, `emissiveFactor` | *Morph target*, kamera dan lampu dari file |
| Transparan (`BLEND`) dan potong (`MASK`), dua sisi | `KHR_texture_transform` dan ekstensi material lain |
| Semua tipe accessor (Float32, Int8/16, Uint8/16/32), data berselang-seling, sparse | |
| `KHR_materials_unlit`, `KHR_materials_emissive_strength`, `KHR_mesh_quantization` | |

### Draco

Model terkompresi Draco (banyak model dari Sketchfab dan alat ekspor yang mengecilkan file) diurai dengan **dekoder resmi Google** dalam WebAssembly. Dekoder itu (sekitar 300 KB) hanya diunduh saat model yang memakainya dimuat — halaman dengan model biasa tidak mengunduh apa pun tambahan. Bawaannya dari `www.gstatic.com`; untuk aplikasi yang harus jalan tanpa server Google, salin kedua file dekodernya ke server sendiri dan isi opsi `dracoDecoder`.

### Skinning

Mesh ber-*skin* digerakkan oleh tulang-tulangnya (node glTF), jadi animasi dari [`playAnimation`](model3dtools#getanimationsid-dan-playanimationid-animation-options) atau `setPartTransform` pada tulang langsung membengkokkan permukaannya. Klik dan kotak pembatas (`fitView`, hotspot) memakai posisi yang sudah digerakkan tulang.

Pencahayaannya sederhana: cahaya langit/tanah ditambah satu lampu searah yang ikut kamera, dengan kilap menurut `roughness`. Cukup untuk melihat bentuk dan warna dengan jelas, tetapi bukan PBR penuh dengan peta lingkungan seperti Three.js atau `<model-viewer>`.

## Tampilan

| Kelas | Elemen |
|---|---|
| `.crootjs-3d` | Penampil (berisi kanvas dan overlay). Latar bawaannya di sini, bisa ditimpa dari CSS halaman |
| `.crootjs-3d-loading` | Ditambahkan ke `.crootjs-3d` selama model dimuat, misalnya untuk memunculkan *spinner* |
| `.crootjs-3d-dragging` | Ditambahkan selama model diputar/digeser |
| `canvas.crootjs-3d-canvas` | Kanvas WebGL |
| `.crootjs-3d-overlay` | Lapisan HTML di atas kanvas (tempat hotspot dan gizmo) |

## Membuat Modul Tambahan Sendiri

`createViewer` menitipkan antarmuka kecil di elemennya, di properti `crootjs3d`. Lewat itulah [`model3dtools.js`](model3dtools) bekerja tanpa mengimpor `model3d.js` (yang akan memuat salinan kedua dengan daftar penampil yang terpisah).

| Anggota `crootjs3d` | Kegunaan |
|---|---|
| `root`, `canvas`, `overlay` | Elemen penampil, kanvasnya, dan lapisan HTML di atasnya |
| `requestRender()` | Meminta gambar ulang di frame berikutnya |
| `onRender(runFunction)` | Dipanggil setiap selesai menggambar; mengembalikan `stop()` |
| `onModel(runFunction)` | Dipanggil setiap model diganti atau dihapus; mengembalikan `stop()` |
| `camera()` | `{ eye, target, forward, right, up, viewProj, fov, width, height }` |
| `toScreen([x, y, z])` | Titik model → `[x, y, kedalaman]` piksel di kanvas, atau `null` kalau di belakang kamera |
| `rayAt([x, y])`, `raycast(origin, direction, skip?)` | Sinar dari kamera lewat titik layar, dan permukaan pertama yang kena: `{ node, t, position }` |
| `findParts(name)`, `isShown(node)`, `boundsOf(nodes)` | Node bernama `name`, apakah tampil, dan kotak pembatasnya |
| `getTransform(node)`, `setTransform(node, transform)` | Sama dengan `getPartTransform`/`setPartTransform`, untuk satu node |
| `getModel()` | Model yang dimuat: `{ source: { json, buffers, images }, nodes, roots }` |
| `readAccessor(index)` | Data accessor glTF: `{ array, size, componentType, normalized, count }` |
| `update()` | Setelah `translation`/`rotation`/`scale` sebuah node diubah langsung (misalnya animasi), hitung ulang dan gambar |
| `setClip(plane, cap)` | Bidang potong `[nx, ny, nz, w]` (titik dengan `n·p + w > 0` dibuang) dan warna permukaan potongnya; `null` = tanpa potongan |
| `parseColor(color)` | Warna CSS → `[r, g, b, a]` linear |

## Catatan

- **Tidak memakai WebGPU.** Backend kedua akan menggandakan ukuran modul, sedangkan WebGL2 sudah tersedia di hampir semua browser dan WebGL1 menutup sisanya.
- Model dari domain lain harus mengizinkan CORS. File yang dibuka langsung dari disk (`file://`) tidak bisa di-`fetch`; jalankan lewat server lokal, atau buka file-nya dengan `<input type="file">`.
- Satuan glTF adalah meter dengan sumbu Y ke atas. Model dari aplikasi CAD yang memakai milimeter akan tampak 1000× lebih besar — kameranya tetap menyesuaikan, tapi `position` dan `bounds` dalam satuan itu.
- Klik dihitung di CPU terhadap setiap segitiga. Model sejuta segitiga butuh sekitar 1 ms per klik; tidak ada masalah untuk model biasa.
