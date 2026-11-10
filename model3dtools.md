# Dokumentasi Modul `model3dtools.js`

`model3dtools.js` adalah modul tambahan untuk [`model3d.js`](model3d) berisi alat untuk aplikasi yang mengubah model, bukan sekadar menampilkannya:

- **Hotspot** — label HTML yang menempel di sebuah titik atau bagian model, ikut bergerak saat model diputar, dan meredup kalau tertutup.
- **Gizmo** — pegangan geser, putar, dan skala untuk mengubah bagian langsung di layar dengan mouse atau jari.
- **Animasi** — memutar animasi yang tersimpan di file glTF, dengan kontrol putar/jeda/geser waktu.
- **Tampilan meledak** — memisahkan bagian-bagian model menjauh dari pusatnya, seperti gambar perakitan.
- **Potongan melintang** — membelah model dengan sebuah bidang untuk melihat bagian dalamnya.
- **Ekspor GLB** — menyimpan model beserta semua perubahannya sebagai file `.glb` baru.

Tiga di tengah itu cocok untuk materi pembelajaran: anatomi, mesin, bangunan, alat praktikum. Modul ini terpisah dari `model3d.js` supaya halaman yang hanya menampilkan model tidak ikut mengunduhnya (sekitar 7 KB gzip).

## Cara Penggunaan (Import)

```javascript
import { createViewer, loadModel } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.25/model3d.js";
import { addHotspot, enableTransform, getAnimations, playAnimation, explodeModel, addSection, exportGLB, downloadGLB } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.25/model3dtools.js";
```

Penampilnya harus sudah dibuat dengan `createViewer` lebih dulu. Hotspot dan gizmo yang menyebut nama bagian butuh modelnya sudah dimuat, jadi panggil di dalam `responseFunction` `loadModel`.

## `addHotspot(id, anchor, content, options)`

Menempelkan elemen HTML atau teks ke model.

- `anchor` — **nama bagian** (menempel di tengah bagian itu, dan ikut kalau bagiannya dipindah), atau **`[x, y, z]`** koordinat model.
- `content` — elemen DOM (dipindah ke atas penampil), atau teks.

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `at` | `"center"` | `"top"` = tengah sisi atas bagian itu, cocok untuk label di atas benda |
| `offset` | `[0, 0, 0]` | Geseran tambahan dalam satuan model, misalnya `[0, 0.5, 0]` sedikit di atasnya |
| `occlude` | `true` | Label diredupkan (kelas `.crootjs-3d-hotspot-hidden`) saat titiknya tertutup bagian lain model. `false` = selalu jelas |
| `onClick` | — | Function yang dipanggil saat label diklik |
| `className` | — | Kelas CSS tambahan |

Mengembalikan function `remove()`. Hotspot ikut tersembunyi kalau bagiannya disembunyikan dengan `setPartVisible`.

```javascript
loadModel("model", "models/bts.glb", () => {
    addHotspot("model", "Antena_1", "Sektor 1 · 0°", { at: "top" });
    addHotspot("model", "Kabinet", "Kabinet BBU", { onClick: () => tampilkanDetail("Kabinet") });
    addHotspot("model", [0, 30, 0], "Puncak 30 m");
});
```

Untuk label yang isinya berubah (misalnya nilai sensor), berikan elemen sendiri lalu ubah isinya kapan saja — hotspotnya tidak perlu dibuat ulang:

```javascript
const nilai = document.createElement("span");
addHotspot("model", "Antena_1", nilai, { at: "top" });
nilai.textContent = "RSRP -87 dBm";
```

## `enableTransform(id, name, mode, onChange)`

Menampilkan gizmo di bagian `name` supaya bisa diubah langsung di layar. Hanya ada satu gizmo per penampil: memanggil lagi memindahkan gizmo ke bagian lain.

| `mode` | Pegangan | Hasil |
|---|---|---|
| `"translate"` | Panah merah/hijau/biru untuk sumbu X/Y/Z | Menggeser sepanjang sumbu itu |
| `"rotate"` | Tiga cincin | Memutar di sumbu itu. Tahan **Shift** untuk kelipatan 15° |
| `"scale"` | Kotak di ujung sumbu, plus kotak oranye di tengah | Menskala satu sumbu, atau seragam |

`onChange(info)` dipanggil terus selama digeser, dan sekali lagi saat dilepas. `info` sama dengan [`getPartTransform`](model3d#getparttransformid-name-dan-setparttransformid-name-transform) ditambah `part` (nama bagian) dan `dragging` (`false` pada panggilan terakhir — saat yang tepat untuk menyimpan ke server).

Sumbu geser dan putar mengikuti sumbu **induk** bagiannya, jadi sama dengan nilai `position` dan `rotation` yang dilaporkan. Sumbu skala mengikuti bagian itu sendiri. Selama sebuah pegangan digeser, kamera tidak ikut berputar.

Mengembalikan `{ setMode(mode), remove() }`. Gizmo hilang sendiri kalau modelnya diganti.

```javascript
let gizmo = null;

onModelClick("model", (hit) => {
    if (gizmo) gizmo.remove();
    gizmo = hit ? enableTransform("model", hit.part, "rotate", (info) => {
        if (!info.dragging) simpanKeServer(info.part, info.rotation);
    }) : null;
});

onClick("mode-geser", () => gizmo && gizmo.setMode("translate"));
```

## `getAnimations(id)` dan `playAnimation(id, animation, options)`

`getAnimations` memberi daftar animasi di file model: `[{ index, name, duration }]`, `duration` dalam detik. Model tanpa animasi memberi `[]`.

`playAnimation` memutar sebuah animasi. `animation` = nama atau nomor urutnya (bawaan `0`, yang pertama).

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `loop` | `true` | `false` = berhenti di akhir |
| `speed` | `1` | Kecepatan: `0.5` = setengah, `2` = dua kali, negatif = mundur |
| `autoplay` | `true` | `false` = disiapkan tapi belum jalan, misalnya untuk dikendalikan slider |
| `onUpdate` | — | Function `(time, duration)` setiap frame, misalnya untuk menggerakkan slider waktu |
| `onEnd` | — | Function yang dipanggil saat animasi selesai (hanya kalau `loop: false`) |

Mengembalikan pengendali:

| Anggota | Kegunaan |
|---|---|
| `play()`, `pause()` | Jalan dan jeda |
| `stop()` | Berhenti dan mengembalikan bagian-bagiannya ke posisi sebelum animasi |
| `seek(seconds)` | Lompat ke detik tertentu, termasuk saat dijeda — untuk slider waktu |
| `setSpeed(speed)`, `isPlaying()`, `time()`, `duration` | Kecepatan, sedang jalan atau tidak, waktu sekarang, dan panjang animasinya |

```javascript
loadModel("model", "models/mesin.glb", () => {
    const animasi = playAnimation("model", "Langkah_Hisap", {
        loop: false,
        onUpdate: (time) => setValue("waktu", time),
    });
    onInput("waktu", () => animasi.seek(Number(getValue("waktu"))));
});
```

Yang diputar adalah gerak **node** (posisi, rotasi, skala) dengan interpolasi `STEP`, `LINEAR`, dan `CUBICSPLINE` — cukup untuk mesin, roda gigi, pintu, perakitan, atau planet yang mengorbit. Animasi yang membengkokkan permukaan (*skinning*, misalnya karakter berjalan, dan *morph target*) belum didukung: tulangnya bergerak, tetapi permukaannya tetap diam.

## `explodeModel(id, amount, options)`

Memisahkan bagian-bagian model menjauh dari pusatnya. `amount`: `0` = rapat (posisi semula), `1` = terpisah penuh, nilai di antaranya boleh — cocok untuk slider.

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `part` | otomatis | Nama bagian yang **anak-anaknya** dipisahkan. Bawaan: tingkat pertama dari atas yang bercabang |
| `distance` | `1` | Pengali jarak. Dengan `1`, pada `amount` 1 jarak tiap bagian dari pusat menjadi dua kali |
| `animate` | `true` | `false` = langsung pindah. Pakai `false` untuk nilai dari slider, supaya mengikuti jari tanpa jeda |

Tiap bagian bergerak lurus menjauhi pusat kelompoknya. Kembali ke `0` mengembalikan posisi semula persis; posisi saat itu juga menjadi acuan untuk pemisahan berikutnya.

```javascript
onInput("pisah", () => {
    explodeModel("model", Number(getValue("pisah")), { part: "Mesin", animate: false });
});
```

Animasi, gizmo, dan tampilan meledak sama-sama mengubah posisi bagian. Kembalikan tampilan meledak ke `0` sebelum memutar animasi atau memakai gizmo pada bagian yang sama.

## `addSection(id, options)`

Membelah model dengan sebuah bidang. Sisi yang terpotong tidak digambar dan tidak bisa diklik; permukaan potongnya diwarnai rata, sehingga benda yang berongga tampak seperti padat terbelah. Hotspot yang titiknya ikut terpotong disembunyikan.

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `axis` | `"x"` | `"x"` = bidang tegak membelah kiri-kanan, `"z"` = tegak depan-belakang, `"y"` = mendatar; atau `[x, y, z]` arah bidang miring |
| `position` | `0.5` | Letak bidang di sepanjang sumbu itu: `0` = ujung bawah model (model utuh), `1` = ujung atas (model hilang) |
| `flip` | `false` | `true` = sisi sebaliknya yang dibuang |
| `color` | warna bagiannya, digelapkan | Warna CSS permukaan potong, misalnya `"#facc15"` supaya irisannya mencolok |

Hanya satu potongan per penampil; memanggil lagi menggantikan yang lama. Mengembalikan `{ set(options), remove() }` — `set` mengubah sebagian opsi, misalnya dari slider:

```javascript
const potongan = addSection("model", { axis: "x", color: "#facc15" });
onInput("letak", () => potongan.set({ position: Number(getValue("letak")) }));
onClick("utuh", () => potongan.remove());
```

## `exportGLB(id, responseFunction)` dan `downloadGLB(id, filename, responseFunction)`

Menyusun model yang sedang tampil menjadi satu file `.glb`, dengan semua perubahannya:

- posisi, rotasi, dan skala dari gizmo atau `setPartTransform`;
- warna dari `setPartColor` (bagian itu mendapat material baru, sehingga bagian lain yang memakai material yang sama tidak ikut berubah);
- bagian yang disembunyikan dengan `setPartVisible` dikeluarkan dari scene;
- buffer dan tekstur eksternal model `.gltf` ikut dibungkus ke dalam satu file.

`exportGLB` memberi `Blob` (tipe `model/gltf-binary`) ke `responseFunction(blob)` dan juga mengembalikannya sebagai Promise — misalnya untuk diunggah ke server. `downloadGLB` langsung mengunduhnya sebagai `filename` (bawaan `"model.glb"`). Kalau belum ada model, `blob` = `null`.

```javascript
onClick("unduh", () => downloadGLB("model", "bts-editan.glb"));

// atau unggah ke server
onClick("simpan", async () => {
    const form = new FormData();
    form.append("model", await exportGLB("model"), "bts.glb");
    fetch("https://contoh.server/api/model", { method: "POST", body: form });
});
```

File hasilnya bisa dibuka lagi dengan `loadModel`, di Blender, atau di penampil glTF lain.

## Tampilan

Semua bisa ditimpa dari CSS halaman tanpa `!important`.

| Kelas | Elemen |
|---|---|
| `.crootjs-3d-hotspot` | Label hotspot. Titik biru di bawahnya adalah `::after` |
| `.crootjs-3d-hotspot-hidden` | Hotspot yang titiknya tertutup model (bawaan: redup) |
| `.crootjs-3d-hotspot-clickable` | Hotspot yang punya `onClick` |
| `svg.crootjs-3d-gizmo` | Gizmo |
| `.crootjs-3d-gizmo-x`, `-y`, `-z`, `-all` | Warna tiap sumbu (lewat `color`), dan pegangan skala seragam |
| `.crootjs-3d-gizmo-line`, `-knob`, `-hit` | Garis/cincin yang terlihat, ujung pegangan, dan area klik yang lebih lebar dari garisnya |

## Catatan

- Gizmo dan hotspot digambar sebagai SVG/HTML di atas kanvas, jadi tetap tajam dan mudah diberi gaya, dan gizmo selalu terlihat walau bagiannya tertutup bagian lain.
- Bagian yang namanya dipakai beberapa node: gizmo memegang yang pertama, hotspot menempel di tengah semuanya.
- Ekspor menyalin data model asli apa adanya; mesh dan material lama yang tidak dipakai lagi tetap ikut di file (tetap valid, hanya sedikit lebih besar).
