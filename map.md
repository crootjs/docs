# Dokumentasi Modul `map.js`

`map.js` menampilkan peta interaktif dan menggambar data GeoJSON di atasnya — ditulis dari nol, tanpa Leaflet atau library peta lain. Peta dasarnya berupa tile raster (bawaan: OpenStreetMap), datanya digambar sebagai SVG, dan semuanya bisa digeser, di-zoom, dan diklik, baik dengan mouse maupun jari.

CSS-nya di-*inject* otomatis oleh modul ini sendiri (seperti [`toast.js`](toast)), jadi tidak ada file CSS yang perlu ditautkan. Yang diunduh browser sekitar 13 KB (gzip): `map.min.js` beserta [`geo.js`](geo) yang dipakainya. Sebagai pembanding, Leaflet sekitar 46 KB (gzip) untuk JS dan CSS-nya.

Marker ikon, skala, "lokasi saya", live tracking, koordinat, layar penuh, alat ukur, gambar overlay, ekspor PNG, pengelompokan titik, dan rute ada di [modul tambahan](#modul-tambahan) yang terpisah, masing-masing 1–6 KB, supaya halaman hanya mengunduh yang dipakainya.

## Cara Penggunaan (Import)

```javascript
import { createMap, addGeoJSON, fitMap, getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.20/map.js";
```

Semua fungsi [`geo.js`](geo) (`getGeoJSON`, `readGeoJSONFile`, `parseGeoJSON`, `getBBox`, dan lainnya) ikut diekspor dari `map.js`. Halaman yang menampilkan peta cukup mengimpor dari `map.js` saja.

## Contoh Minimal

Elemen tempat peta **wajib punya tinggi** dari CSS. Peta mengisi elemen itu sepenuhnya; elemen tanpa tinggi berarti peta setinggi 0 piksel (modul ini menulis peringatan di console kalau itu terjadi).

```html
<!-- index.html -->
<link rel="stylesheet" href="style.css">
<div id="peta" class="peta"></div>
<script type="module" src="index.js"></script>
```

```css
/* style.css */
.peta {
    height: 360px;
}
```

```javascript
// index.js
import { createMap, addGeoJSON, fitMap, getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.20/map.js";

createMap("peta");

getGeoJSON("https://github.com/petapedia/geojson/blob/main/contoh.geojson", (response) => {
    if (!response.data) {
        console.log("gagal membaca GeoJSON, status:", response.status);
        return;
    }
    addGeoJSON("peta", response.data); // gambar datanya
    fitMap("peta", response.data);     // paskan tampilan ke datanya
});
```

Hasilnya: peta dengan dua polygon gedung dan satu titik; klik salah satunya untuk melihat `properties`-nya di popup.

Semua fungsi `map.js` menerima **ID elemen** sebagai parameter pertama, sama seperti fungsi-fungsi [`element.js`](element/). Tidak ada object peta yang perlu disimpan.

## `createMap(id, options)`

Membuat peta di dalam elemen ber-ID `id`. Memanggilnya lagi untuk ID yang sama mengganti peta yang lama.

`options` (semuanya opsional):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `center` | `[118, -2.5]` (Indonesia) | Pusat tampilan, `[lng, lat]` |
| `zoom` | `4` | Level zoom awal |
| `minZoom` | `1` | Zoom terjauh yang diizinkan |
| `maxZoom` | `19` | Zoom terdekat yang diizinkan |
| `tiles` | tile OpenStreetMap | Pola URL tile raster dengan `{z}`, `{x}`, `{y}` — lihat [pola URL](#pola-url-tile). `false` = tanpa peta dasar |
| `attribution` | — | Atribusi untuk `tiles` buatan sendiri: teks, elemen DOM (untuk tautan), atau array-nya kalau sumbernya lebih dari satu |
| `attributionPrefix` | `true` | `false` = tanpa tautan "CrootJS" di depan atribusi |
| `maxNativeZoom` | sama dengan `maxZoom` | Level tile tertinggi yang ada di server. Di atasnya tile level itu diperbesar (*overzoom*), jadi `maxZoom` boleh lebih tinggi |
| `labels` | — | Pola URL (atau array pola) tile label transparan yang digambar di atas `tiles` — untuk citra satelit + nama jalan (*hybrid*) |
| `subdomains` | `"abc"` | Pengganti `{s}` di pola URL: string atau array |
| `errorTiles` | — | URL gambar pengganti tile yang gagal dimuat |
| `zoomControl` | `true` | `false` = tanpa tombol + / − |
| `scrollZoom` | `true` | `false` = roda mouse tetap menggulung halaman, tidak men-zoom peta |

```javascript
createMap("peta", { center: [107.5759, -6.8736], zoom: 17 });
```

## `addGeoJSON(id, geojson, options)`

Menggambar GeoJSON di atas peta. `geojson` boleh berupa apa pun yang diterima [`parseGeoJSON`](geo): `FeatureCollection`, satu `Feature`, satu geometri polos, array-nya, atau teks JSON. Semua tipe geometri didukung (`Point`, `LineString`, `Polygon`, versi `Multi`-nya, dan `GeometryCollection`).

Mengembalikan function `remove()` untuk menghapus lapisan itu lagi — pola yang sama dengan `dismiss()` di [`toast.js`](toast). Function itu juga punya `remove.show()`, `remove.hide()`, `remove.setStyle(style)`, dan `remove.setOrder(order)` untuk lapisan yang tidak diberi nama (lihat [Lapisan Bernama](#lapisan-bernama)).

```javascript
const hapusGedung = addGeoJSON("peta", dataGedung);
// ...
hapusGedung.hide(); // sembunyikan sementara
hapusGedung.show();
hapusGedung();      // lapisan ini saja yang hilang
```

`options` (semuanya opsional):

**`style`** — tampilan fitur. Berupa object, atau function `(feature) => object` untuk membedakan tiap fitur:

| Kunci | Berlaku untuk | Bawaan |
|---|---|---|
| `stroke` | garis, tepi polygon, tepi titik | biru `#2563eb` (titik: putih) |
| `strokeWidth` | garis, tepi polygon, tepi titik | garis 3, polygon 2, titik 2 |
| `strokeOpacity` | garis, tepi polygon, tepi titik | 1 |
| `fill` | polygon, titik | biru `#2563eb` |
| `fillOpacity` | polygon, titik | polygon 0.25, titik 1 |
| `radius` | titik | 7 (piksel) |
| `strokeDasharray` | garis, tepi polygon, tepi titik | garis utuh. `"6 4"` atau `[6, 4]` = 6 piksel garis, 4 piksel celah |
| `lineCap` | ujung garis | `"round"` (lainnya `"butt"`, `"square"`) |
| `lineJoin` | sudut garis | `"round"` (lainnya `"miter"`, `"bevel"`) |

```javascript
// semua fitur merah
addGeoJSON("peta", data, { style: { stroke: "#dc2626", fill: "#dc2626" } });

// warna tergantung properti; null = pakai tampilan bawaan
addGeoJSON("peta", data, {
    style: (feature) => feature.properties.Gedung === "Rektorat" ? { fill: "#16a34a", stroke: "#16a34a" } : null,
});
```

Ketebalan garis, panjang putus-putus, dan ukuran titik tetap sama di layar pada zoom berapa pun.

```javascript
// jalur indikatif: garis putus-putus
addGeoJSON("peta", jalurRencana, { style: { stroke: "#ea580c", strokeDasharray: [8, 6], lineCap: "butt" } });
```

**`popup`** — isi popup saat sebuah fitur diklik:

| Nilai | Hasil |
|---|---|
| tidak diisi | daftar `nama: nilai` dari `properties` fitur itu (fitur tanpa properti tidak punya popup) |
| function `(feature) => teks` | teks itu, ditampilkan apa adanya |
| function `(feature) => elemen DOM` | elemen itu |
| function yang mengembalikan `null` | tanpa popup untuk fitur itu |
| `false` | tanpa popup sama sekali |

```javascript
addGeoJSON("peta", data, { popup: (feature) => "Gedung " + feature.properties.Gedung });
```

Teks popup dipasang sebagai teks, **bukan HTML** — tag di dalam data atau di teks yang kamu kembalikan tampil apa adanya dan tidak dieksekusi. Kalau butuh tautan atau format, kembalikan elemen DOM:

```javascript
addGeoJSON("peta", data, {
    popup: (feature) => {
        const link = document.createElement("a");
        link.href = "/gedung?nama=" + encodeURIComponent(feature.properties.Gedung);
        link.textContent = "Detail " + feature.properties.Gedung;
        return link;
    },
});
```

**`hoverStyle`** dan **`tooltip`** — umpan balik saat kursor mouse berada di atas sebuah fitur (layar sentuh tidak punya *hover*, jadi di sana keduanya tidak muncul):

- `hoverStyle` — object gaya (kunci sama dengan `style`) yang ditimpakan selama kursor di atas fitur itu.
- `tooltip` — function `(feature) => teks atau elemen DOM` (atau `null`); hasilnya tampil di kotak kecil yang mengikuti kursor. Popup saat diklik tetap berjalan seperti biasa.

```javascript
addGeoJSON("peta", zona, {
    hoverStyle: { stroke: "#dc2626", strokeWidth: 4 },
    tooltip: (feature) => "Zona " + feature.properties.nomor,
});
```

**`label`** — teks yang selalu tampil di atas fitur: nama properti, atau function `(feature) => teks` (`null` = tanpa label). Label sebuah titik ada di titiknya, label garis di tengah panjang garisnya, dan label polygon di titik beratnya. Label yang bertabrakan dengan label lain disembunyikan, lalu muncul lagi saat peta di-zoom dan ruangnya cukup — lapisan yang di atas didahulukan, lalu urutan fitur di datanya.

`labelOptions` (opsional): `minZoom` / `maxZoom` (label hanya tampil di rentang zoom ini), `className` (kelas CSS tambahan untuk elemen labelnya), `overlap: true` (tanpa penghindaran tabrakan).

```javascript
addGeoJSON("peta", kontur, {
    label: (feature) => feature.properties.elevasi + " m",
    labelOptions: { minZoom: 16, className: "label-kontur" },
});
```

**`name`, `minZoom`, `maxZoom`, `order`, `visible`, `attribution`** — lihat [Lapisan Bernama](#lapisan-bernama).

**`renderer`** dan **`simplify`** — lihat [Data Besar](#data-besar-canvas-dan-penyederhanaan).

## Data Besar: Canvas dan Penyederhanaan

Secara bawaan setiap bentuk digambar sebagai satu elemen SVG. Itu nyaman sampai beberapa ribu bentuk, tetapi mulai berat di ponsel kalau garisnya ribuan. Dua opsi `addGeoJSON` untuk data seperti itu:

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `renderer` | `"svg"` | `"canvas"` = seluruh lapisan digambar di satu `<canvas>`, tanpa elemen per bentuk. Gaya (termasuk putus-putus), popup, `hoverStyle`, `tooltip`, label, dan `onMapClick` tetap berlaku — klik dan *hover* dihitung sendiri dari geometrinya |
| `simplify` | `0` | Toleransi penyederhanaan dalam piksel layar, misalnya `1`. Per level zoom, titik yang menyimpang kurang dari itu dari garis lurus dibuang (Douglas-Peucker), jadi saat zoom jauh garis berisi ribuan titik cukup digambar dengan puluhan titik. Berlaku untuk SVG dan canvas |

```javascript
addGeoJSON("peta", jaringanFiber, {    // misalnya 5.600 garis
    name: "fiber",
    renderer: "canvas",
    simplify: 1,
    style: { stroke: "#ea580c", strokeWidth: 2 },
    tooltip: (feature) => feature.properties.kode,
});
```

Lapisan canvas selalu berada **di bawah** semua lapisan SVG, apa pun `order`-nya (`order` tetap mengatur urutan di antara sesama lapisan canvas). Jadi lapisan latar yang besar cocok di canvas, sedangkan lapisan kecil yang harus tampil di atasnya tetap di SVG.

## Lapisan Bernama

Lapisan yang diberi `name` di `addGeoJSON` bisa diatur tanpa digambar ulang:

| Fungsi | Hasil |
|---|---|
| `showLayer(id, name)` / `hideLayer(id, name)` | Menampilkan / menyembunyikan lapisan. Popup dan *hover* miliknya ikut ditutup saat disembunyikan |
| `setLayerStyle(id, name, style)` | Mengganti gaya seluruh lapisan; `style` object atau function, sama seperti di `addGeoJSON` |
| `setLayerOrder(id, name, order)` | Urutan tumpuk: makin besar makin di atas |
| `removeLayer(id, name)` | Menghapus lapisan |
| `getLayers(id)` | Daftar lapisan bernama dari bawah ke atas: `[{ name, visible, order }]` |

Opsi `addGeoJSON` yang terkait:

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `name` | — | Nama lapisan. Lapisan baru dengan nama yang sudah dipakai **menggantikan** lapisan lama itu — cara mudah memperbarui data |
| `minZoom`, `maxZoom` | semua zoom | Lapisan hanya tampil di rentang zoom ini, misalnya denah blok yang baru berguna di zoom 18 ke atas |
| `order` | `0` | Urutan tumpuk. Lapisan dengan `order` sama ditumpuk menurut urutan ditambahkan |
| `visible` | `true` | `false` = ditambahkan dalam keadaan tersembunyi |
| `attribution` | — | Sumber data lapisan ini; ditambahkan ke atribusi peta selama lapisannya ada |

```javascript
addGeoJSON("peta", batasZona, { name: "zona", order: 1, style: { strokeDasharray: "4 4" } });
addGeoJSON("peta", denahBlok, { name: "blok", minZoom: 18 });

hideLayer("peta", "zona");
setLayerStyle("peta", "blok", (feature) => ({ fill: feature.properties.terisi ? "#16a34a" : "#9ca3af" }));
```

Untuk daftar centang siap pakai, lihat `addLayerControl` di [`mapcontrol.js`](mapcontrol).

## `setTiles(id, tiles, options)`

Mengganti peta dasar **tanpa membuat ulang peta**: lapisan, marker, popup yang terbuka, dan tampilan tetap di tempatnya. Tile peta dasar lama dibiarkan sampai tile baru selesai dimuat, jadi peta tidak berkedip kosong.

`tiles` sama seperti opsi `tiles` di `createMap` (tanpa nilai = OpenStreetMap, `false` = tanpa peta dasar). `options` berisi `labels`, `maxNativeZoom`, `subdomains`, `errorTiles`, dan `attribution`, sama seperti di `createMap`; yang tidak disebut kembali ke bawaannya. `minZoom` dan `maxZoom` juga boleh disebut — misalnya peta dasar yang tidak boleh di-zoom lewat level 17 — tetapi berbeda dari opsi lain, yang tidak disebut **tetap** seperti sebelumnya (lihat `setZoomRange` di bawah).

```javascript
// ke citra satelit + label (hybrid)
setTiles("peta", "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    maxNativeZoom: 18,
    attribution: "Tiles © Esri",
});

setTiles("peta"); // kembali ke OpenStreetMap
```

Untuk pilihan peta dasar siap pakai, lihat `addBasemapControl` di [`mapcontrol.js`](mapcontrol).

## `setZoomRange(id, minZoom, maxZoom)`

Mengubah rentang zoom yang diizinkan tanpa membuat ulang peta. `minZoom` atau `maxZoom` yang tidak diisi (`undefined`/`null`) dibiarkan. Kalau zoom sekarang di luar rentang baru, peta langsung di-zoom ke batas terdekat, dan tombol + / − ikut menyesuaikan.

```javascript
setZoomRange("peta", null, 17); // jangan lebih dekat dari zoom 17
setZoomRange("peta", 10);       // jangan lebih jauh dari zoom 10, batas atas tetap
```

## `fitMap(id, geojson, padding = 24)`

Memaskan tampilan ke seluruh data. `geojson` sama fleksibelnya dengan di `addGeoJSON`, atau langsung sebuah kotak pembatas `[minLng, minLat, maxLng, maxLat]`. `padding` adalah jarak kosong (piksel) antara data dan tepi peta — satu angka untuk semua sisi, atau per sisi `{ top, right, bottom, left }` (sisi yang tidak disebut tetap 24), misalnya supaya data tidak tertutup panel.

```javascript
fitMap("peta", data);
fitMap("peta", [95, -11, 141, 6]);         // seluruh Indonesia
fitMap("peta", data, { left: 320 });       // panel selebar 300 piksel di kiri peta
```

Padding per sisi juga cocok untuk tombol "zoom ke" yang responsif — panel di kiri pada layar lebar, di bawah pada ponsel:

```javascript
const sempit = window.matchMedia("(max-width: 640px)").matches;
fitMap("peta", getBBox(dataLokasi), sempit ? { bottom: 260 } : { left: 340 });
```

- Data yang hanya berupa satu titik ditampilkan pada zoom 17.
- Data tanpa koordinat (atau bukan GeoJSON) tidak mengubah tampilan.
- Dengan peta dasar, zoom dibulatkan ke bawah ke level bulat supaya gambar tile tetap tajam, jadi data bisa tampak lebih kecil daripada ruang yang tersedia. Dengan `tiles: false` data dipaskan persis.
- Peta yang elemennya masih `display: none` belum punya ukuran, jadi belum bisa dipaskan. Panggil `fitMap` setelah elemennya ditampilkan.

## `setMapView(id, center, zoom)` dan `getMapView(id)`

`setMapView` memindahkan tampilan ke `center` (`[lng, lat]`). `zoom` opsional; kalau tidak diisi, level zoom sekarang dipertahankan.

`getMapView` mengembalikan tampilan sekarang: `{ center: [lng, lat], zoom }`.

```javascript
setMapView("peta", [106.8272, -6.1754], 12); // Jakarta
setMapView("peta", [107.6191, -6.9175]);     // pindah ke Bandung, zoom tetap 12

getMapView("peta"); // { center: [107.6191, -6.917499999999983], zoom: 12 }
```

Nilai `center` yang dikembalikan bisa berbeda di digit-digit terakhir dari yang kamu masukkan (pembulatan bilangan pecahan saat proyeksi); selisihnya jauh di bawah satu milimeter di lapangan.

`zoom` selalu dibatasi ke `minZoom`..`maxZoom`. Saat sebuah gestur (roda mouse, pinch) sedang berlangsung, `zoom` bisa berupa pecahan.

## `onMapClick(id, runFunction)`

`runFunction(position, feature)` dipanggil setiap kali peta diklik atau di-*tap* (menggeser peta tidak dihitung klik):

- `position` — `[lng, lat]` titik yang diklik.
- `feature` — fitur GeoJSON yang kena klik, atau `null` kalau yang diklik peta dasarnya.

Kegunaan paling umum: memilih lokasi untuk sebuah form.

```javascript
import { createMap, addGeoJSON, onMapClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.20/map.js";
import { setValue } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.20/element.js";

createMap("peta", { center: [107.5759, -6.8736], zoom: 17 });

let hapusPenanda = () => {};
onMapClick("peta", (position) => {
    setValue("longitude", position[0]);
    setValue("latitude", position[1]);

    // penanda lama diganti dengan yang baru di titik yang diklik
    hapusPenanda();
    hapusPenanda = addGeoJSON("peta", { type: "Point", coordinates: position });
});
```

## `onMapMove(id, runFunction)` dan `getMapBounds(id)`

`runFunction({ center, zoom })` dipanggil setiap kali tampilan berubah: digeser, di-zoom, atau ukuran petanya berubah. Selama sebuah gestur berlangsung ia dipanggil di setiap frame. Mengembalikan function `stop()` untuk berhenti mendengarkan.

`getMapBounds(id)` mengembalikan bagian dunia yang sedang terlihat sebagai kotak pembatas `[minLng, minLat, maxLng, maxLat]`.

Keduanya biasa dipakai bersama untuk meminta ke backend **hanya data di area yang tampak**. Karena `onMapMove` terpanggil sangat sering, bungkus dengan [`debounce`](debounce) supaya request baru dikirim setelah peta berhenti bergerak:

```javascript
import { createMap, addGeoJSON, clearMap, onMapMove, getMapBounds, getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.20/map.js";
import { debounce } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.20/debounce.js";

createMap("peta", { center: [107.5759, -6.8736], zoom: 16 });

onMapMove("peta", debounce(() => {
    const bbox = getMapBounds("peta");
    getGeoJSON("https://api.example.com/lokasi?bbox=" + bbox.join(","), (response) => {
        if (!response.data) return;
        clearMap("peta");
        addGeoJSON("peta", response.data);
    });
}, 400));
```

## `mapToPoint(id, position)` dan `pointToPosition(id, point)`

Mengubah posisi `[lng, lat]` menjadi titik `[x, y]` dalam piksel (dihitung dari pojok kiri-atas peta), dan sebaliknya. Hasil `mapToPoint` bisa berada di luar ukuran peta kalau posisinya sedang tidak terlihat.

```javascript
mapToPoint("peta", [107.575914, -6.8732098]); // misalnya [412.6, 180.3]
pointToPosition("peta", [0, 0]);              // [lng, lat] di pojok kiri-atas peta
```

Bersama `onMapMove`, kedua fungsi ini cukup untuk membuat elemen HTML sendiri yang mengikuti peta. Untuk marker, pakai [`mapmarker.js`](mapmarker) yang sudah mengurus itu.

## `addMapControl(id, element, corner = "top-right")`

Menaruh elemen buatanmu — tombol, legenda, kotak info — di pojok peta: `"top-left"`, `"top-right"`, `"bottom-left"`, atau `"bottom-right"`. Beberapa kontrol di pojok yang sama ditumpuk rapi, dan klik di dalamnya tidak ikut menggeser atau mengklik peta. Mengembalikan function `remove()`.

```javascript
const legenda = document.createElement("div");
legenda.className = "legenda"; // tampilannya dari CSS halamanmu
legenda.textContent = "Biru: gedung kampus";
addMapControl("peta", legenda, "bottom-right");
```

## `showPopup(id, position, content)` dan `closePopup(id)`

Menampilkan popup di `position` (`[lng, lat]`) tanpa harus ada fitur di sana. `content` berupa teks (ditampilkan apa adanya, bukan HTML) atau elemen DOM. Hanya ada satu popup per peta; popup baru menggantikan yang lama.

```javascript
showPopup("peta", [107.575914, -6.8732098], "Kampus ULBI");
closePopup("peta");
```

Kalau popup terpotong tepi peta, petanya digeser sedikit supaya popup terlihat utuh. Ini hanya berlaku kalau `position`-nya sedang terlihat; `showPopup` di tempat yang jauh tidak membuat peta melompat ke sana (pakai `setMapView` lebih dulu).

## `clearMap(id)` dan `removeMap(id)`

- `clearMap(id)` menghapus semua lapisan GeoJSON dan menutup popup. Peta dasarnya tetap. Pakai ini sebelum menggambar data baru sebagai pengganti data lama.
- `removeMap(id)` menghapus petanya dari elemen dan menghentikan semua listener-nya. Elemennya sendiri tetap ada dan bisa dipakai `createMap` lagi.

## Interaksi Bawaan

| Aksi | Hasil |
|---|---|
| Geser dengan mouse atau satu jari | menggeser peta |
| Roda mouse / pinch di trackpad | zoom di posisi kursor |
| Pinch dua jari | zoom di antara kedua jari |
| Klik ganda | zoom satu level di posisi kursor |
| Tombol + / − | zoom satu level di tengah peta |
| Tombol panah (saat peta terfokus) | menggeser peta |
| Tombol `+` / `-` (saat peta terfokus) | zoom |
| Klik / tap sebuah fitur | membuka popup-nya |
| Kursor di atas fitur (mouse) | `hoverStyle` dan `tooltip`, kalau lapisannya memakainya |

Pengguna yang mengaktifkan *reduce motion* di sistemnya mendapat zoom tanpa animasi.

## Peta Dasar

**OpenStreetMap (bawaan).** Tile diambil dari `tile.openstreetmap.org`, dan atribusi "CrootJS | © OpenStreetMap contributors" otomatis ditampilkan di pojok kanan bawah — lisensi datanya mewajibkan itu, jadi jangan disembunyikan. Server tile OpenStreetMap gratis tetapi dijalankan relawan dan punya [kebijakan pemakaian](https://operations.osmfoundation.org/policies/tiles/): cocok untuk belajar dan situs dengan trafik kecil. Untuk aplikasi dengan trafik besar, pakai penyedia tile sendiri.

**Penyedia tile lain.** Isi `tiles` dengan pola URL-nya dan `attribution` dengan teks atribusi yang diminta penyedianya:

```javascript
createMap("peta", {
    tiles: "https://tiles.example.com/{z}/{x}/{y}.png",
    attribution: "© Example Maps",
});
```

Atribusi selalu diawali tautan "CrootJS" ke situs ini, lalu sumber peta dasar, lalu `attribution` tiap lapisan data — sumber yang sama cukup ditulis sekali. Isinya diperbarui setiap kali peta dasar diganti atau lapisan ditambah/dihapus. `attributionPrefix: false` di `createMap` menghilangkan tautan "CrootJS"; atribusi penyedia tile tetap tampil.

### Pola URL Tile

| Penanda | Diganti dengan |
|---|---|
| `{z}`, `{x}`, `{y}` | level zoom, kolom, dan baris tile |
| `{-y}` | baris tile skema TMS (dihitung dari bawah), untuk server seperti GeoServer/TileCache |
| `{s}` | subdomain, bergiliran dari `subdomains` (bawaan `"abc"`) supaya beban tersebar |
| `{r}` | `@2x` di layar retina, kosong di layar biasa |

```javascript
createMap("peta", {
    tiles: "https://{s}.tiles.example.com/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    errorTiles: "/img/tile-kosong.png", // pengganti tile yang gagal dimuat
    attribution: "© Example Maps",
});
```

### Citra Satelit, Overzoom, dan Hybrid

Banyak penyedia citra hanya punya tile sampai zoom 18 di sebagian besar wilayah. `maxNativeZoom: 18` membuat peta tetap bisa di-zoom sampai `maxZoom` — tile level 18 diperbesar, bukan kosong. `labels` menumpuk tile label transparan (nama jalan dan tempat) di atas citranya:

```javascript
createMap("peta", {
    maxZoom: 21,
    maxNativeZoom: 18,
    tiles: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri",
});
```

**Tanpa peta dasar.** Dengan `tiles: false` hanya datamu yang digambar, di atas latar polos — tidak ada request ke server tile sama sekali:

```javascript
createMap("peta", { tiles: false });
```

## Modul Tambahan

Fitur yang tidak dibutuhkan semua peta dipisahkan ke modul sendiri. Impor hanya yang kamu pakai:

| Modul | Isi |
|---|---|
| [`mapmarker.js`](mapmarker) | Marker pin, ikon gambar, atau elemen sendiri — dengan label, popup, dan bisa digeser (`addMarker`) |
| [`mapcontrol.js`](mapcontrol) | Garis skala, "lokasi saya", live tracking, pilihan peta dasar (daftar atau kartu bergambar), daftar centang lapisan, koordinat kursor, dan layar penuh (`addScaleBar`, `addLocateButton`, `locateUser`, `addTrackButton`, `trackUser`, `addBasemapControl`, `setBasemap`, `addLayerControl`, `addCoordinateControl`, `addFullscreenButton`) |
| [`maptools.js`](maptools) | Alat ukur jarak dan luas, gambar bergeoreferensi dengan rotasi, ekspor tampilan ke PNG (`addMeasureControl`, `measure`, `addImageOverlay`, `exportMapImage`, `downloadMapImage`) |
| [`mapcluster.js`](mapcluster) | Pengelompokan titik untuk data titik yang sangat banyak (`addCluster`) |
| [`geomeasure.js`](geomeasure) | Jarak, panjang, luas, titik-di-dalam-area, titik terdekat, lingkaran radius |
| [`georoute.js`](georoute) | Rute terpendek di sepanjang garis-garis di dalam data GeoJSON (`findRoute`) |

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.20/map.js";
import { addMarker } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.20/mapmarker.js";
import { addScaleBar, addLocateButton } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.20/mapcontrol.js";

createMap("peta", { center: [107.5759, -6.8736], zoom: 17 });
addMarker("peta", [107.575914, -6.8732098], { label: "ULBI", popup: "Kampus ULBI" });
addScaleBar("peta");
addLocateButton("peta");
```

## Membuat Modul Tambahan Sendiri

`createMap` menitipkan sebuah antarmuka kecil di elemen petanya, di properti `crootjsMap`. Lewat itulah `mapmarker.js` dan `mapcontrol.js` bekerja, dan modul buatanmu bisa memakai jalan yang sama:

```javascript
// penanda.js - modul tambahan sederhana: sebuah teks yang menempel di satu posisi
export function addText(id, position, text) {
    const map = document.getElementById(id).crootjsMap; // undefined kalau petanya belum dibuat

    const element = document.createElement("div");
    element.className = "penanda"; // butuh position: absolute dari CSS-mu
    element.textContent = text;
    map.overlay.appendChild(element);

    const place = () => {
        const point = map.toPoint(position);
        element.style.transform = `translate(${point[0]}px, ${point[1]}px)`;
    };
    place();
    map.onMove(place); // dipanggil setiap kali peta bergerak
}
```

| Anggota `crootjsMap` | Kegunaan |
|---|---|
| `overlay` | Elemen tempat menaruh elemen HTML-mu: di atas data, di bawah popup, terpotong di tepi peta |
| `toPoint(position)` / `toPosition(point)` | `[lng, lat]` ke piksel dan sebaliknya |
| `getView()` | `{ center, zoom }` |
| `setView(center, zoom)` | Memindahkan tampilan |
| `panBy(dx, dy)` | Menggeser peta sejauh sekian piksel |
| `onMove(runFunction)` | Mendengarkan perubahan tampilan; mengembalikan `stop()` |
| `onTap(element, runFunction)` | Menangani tap pada sebuah elemen di `overlay`: peta tidak menganggapnya klik peta (`onMapClick` tidak dipanggil), sedangkan geseran yang berawal di elemen itu tetap menggeser peta |
| `addControl(element, corner)` | Menaruh elemen di pojok peta; mengembalikan `remove()` |
| `showPopup(position, content, offset)` / `closePopup()` | Popup; `offset` = jarak ke atas dari posisinya, dalam piksel |
| `setTiles(tiles, options)` | Sama dengan `setTiles(id, ...)` |
| `getLayers()` / `setLayerVisible(name, visible)` | Daftar lapisan bernama; menampilkan/menyembunyikan satu lapisan |
| `setZoomRange(minZoom, maxZoom)` | Sama dengan `setZoomRange(id, ...)` |
| `root` | Elemen peta itu sendiri (berisi semua lapisan) — misalnya untuk mendengarkan `pointermove` |
| `underlay` | Elemen tempat gambar di atas peta dasar dan di bawah data (dipakai `addImageOverlay`) |
| `onClick(runFunction)` | Sama dengan `onMapClick`; mengembalikan `stop()` |
| `captureClick(runFunction)` | Meminjam klik peta: selama aktif, klik dan klik ganda hanya diteruskan ke `runFunction(position, "click" \| "dblclick")` — tanpa popup, tanpa zoom klik ganda, tanpa `onMapClick`. Mengembalikan `release()`. Dipakai alat ukur |

**Modul tambahan jangan mengimpor `map.js`.** Halaman biasanya memuat `map.min.js`, sedangkan `import "./map.js"` dari modul lain memuat *salinan kedua* dengan daftar petanya sendiri — dan peta yang dibuat halaman tidak akan ditemukan. Antarmuka di elemen ini menghindari itu: modulmu bekerja dengan salinan `map.js` mana pun yang dipakai halaman.

## Catatan

- **Semua posisi memakai urutan GeoJSON: `[longitude, latitude]`** — `center`, `position` di `onMapClick`, `showPopup`, dan `getMapView`. Jadi koordinat dari data GeoJSON bisa langsung dipakai tanpa dibalik.
- Dalam satu lapisan, titik selalu digambar paling atas, apa pun urutannya di data, supaya tidak tertutup polygon. Lapisan yang ditambahkan belakangan berada di atas lapisan sebelumnya, kecuali diatur dengan `order`.
- Garis tipis punya area klik selebar 20 piksel yang tidak terlihat. Lapisan garis yang rapat (misalnya kontur) di atas polygon bisa menutupi klik dan *hover* polygon itu; taruh lapisan garisnya di bawah dengan `order`.
- Peta menyesuaikan diri sendiri kalau ukuran elemennya berubah, termasuk saat elemen yang tadinya `display: none` (misalnya isi tab) ditampilkan.
- Tampilan bawaan peta (tombol, popup, label, marker) di-*inject* sebagai `<style>` di **awal** `<head>`, jadi CSS halamanmu menimpanya tanpa `!important` — misalnya `.crootjs-marker-label { color: #fff; text-shadow: 0 0 3px #000; }` untuk label marker putih di atas citra satelit.
- Boleh ada beberapa peta dalam satu halaman, masing-masing dengan ID elemennya sendiri.
- Fungsi yang dipanggil dengan ID yang belum di-`createMap` tidak melempar error; ia menulis peringatan di console dan tidak melakukan apa-apa.

### Batasan

- Proyeksinya Web Mercator saja (yang dipakai hampir semua peta web), dengan lintang dibatasi ±85,05°.
- Peta dasar hanya tile raster (gambar). Vector tile tidak didukung.
- Peta tidak berulang ke kiri-kanan melewati garis bujur 180°.
- Data digambar sebagai SVG, satu elemen per bentuk, kecuali lapisan `renderer: "canvas"`. SVG nyaman untuk ratusan sampai beberapa ribu fitur; untuk ribuan garis pakai canvas (lihat [Data Besar](#data-besar-canvas-dan-penyederhanaan)), dan untuk puluhan ribu titik pakai [`mapcluster.js`](mapcluster) yang mengelompokkannya.
- Label fitur ditulis mendatar; label garis tidak mengikuti arah garisnya.
- Belum ada alat untuk menggambar atau mengedit bentuk langsung di peta.
