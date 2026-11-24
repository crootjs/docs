# Dokumentasi Modul `pwa.js` dan `serviceworker.js`

*[English](en/pwa)*

Dua file untuk membuat aplikasi web CrootJS **tetap terbuka tanpa internet** dan **bisa dipasang** seperti aplikasi (PWA):

- `pwa.js`, modul halaman: mendaftarkan service worker, memberi tahu saat versi baru siap, status online/offline, tombol "Pasang aplikasi", dan deteksi aplikasi terpasang.
- `serviceworker.js`, inti service worker: menyimpan halaman, CSS, JS, dan gambar Anda di Cache Storage dan menyajikannya saat offline.

Service worker harus berada di domain situs Anda sendiri; browser tidak mengizinkan service worker didaftarkan dari jsDelivr. Karena itu Anda membuat satu file `sw.js` kecil di situs sendiri, yang memuat `serviceworker.js` dari jsDelivr dengan `importScripts()`.

[`mapcache.js`](mapcache) menyimpan tile peta; `pwa.js` melengkapinya dengan menyimpan halamannya sendiri, jadi aplikasi peta lapangan bisa dibuka utuh tanpa sinyal.

Contoh lengkap: [croot.js.org/examples/pwa/](https://croot.js.org/examples/pwa/).

## Langkah singkat

Struktur folder aplikasi:

```
index.html
index.js
style.css
manifest.webmanifest
sw.js
icons/icon-192.png
icons/icon-512.png
```

### 1. `sw.js` (di folder yang sama dengan `index.html`)

```javascript
importScripts("https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.37/serviceworker.min.js");

crootjsServiceWorker({
    version: "1",
    precache: [
        "./",
        "style.css",
        "index.js",
        "manifest.webmanifest",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.37/pwa.min.js"
    ]
});
```

`sw.js` adalah script klasik, bukan ES module, jadi memakai `importScripts`, bukan `import`. Panggil `crootjsServiceWorker` langsung di tingkat atas file, bukan di dalam fungsi async atau event: browser hanya mendengarkan event `fetch` yang dipasang saat file pertama kali dijalankan.

### 2. `manifest.webmanifest`

```json
{
  "name": "Catatan Lapangan",
  "short_name": "Catatan",
  "lang": "id",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#f8fafc",
  "theme_color": "#15803d",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Ikon PNG 192 dan 512 px dibutuhkan Chrome supaya aplikasi bisa dipasang. Ikon `maskable` dipotong Android menjadi lingkaran atau bentuk lain, jadi gambar pentingnya harus berada di 80% bagian tengah dengan latar penuh sampai tepi.

### 3. `index.html`

```html
<meta name="theme-color" content="#15803d">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-192.png">
...
<button type="button" id="pasang" hidden>Pasang aplikasi</button>
<span id="jaringan" role="status"></span>
<script type="module" src="index.js"></script>
```

### 4. `index.js`

```javascript
import { registerServiceWorker, onNetworkChange, installButton } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.37/pwa.min.js";

registerServiceWorker("sw.js");
installButton("pasang");
onNetworkChange(online => {
    document.getElementById("jaringan").textContent = online ? "Online" : "Offline";
});
```

## `pwa.js`

### `registerServiceWorker(url, options)`

Mendaftarkan service worker situs Anda. `url` bawaan `"sw.js"`, relatif terhadap halaman.

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `scope` | folder tempat file service worker | Folder yang dikendalikan service worker |
| `onUpdate` | pemberitahuan bawaan | `function({ registration, activate })` saat versi baru sudah terpasang dan menunggu. `activate()` mengaktifkan versi itu lalu memuat ulang halaman |

Tanpa `onUpdate`, saat versi baru siap tampil pemberitahuan kecil di bawah layar ("Versi baru aplikasi siap.") dengan tombol **Muat ulang** dan **Nanti** (`role="status"`, kelas `crootjs-pwa-update`, warnanya mengikuti variabel `--croot-*` dari [croot.css](css)). Versi baru tidak diaktifkan tanpa persetujuan pengguna, supaya isian form yang belum disimpan tidak hilang karena muat ulang mendadak.

Mengembalikan Promise `{ ok, registration, error }` yang tidak pernah *reject*:

| `error` | Arti |
|---|---|
| `null` | Terdaftar; `registration` berisi `ServiceWorkerRegistration` |
| `"insecure"` | Halaman bukan `https` atau `localhost`. Peringatan di console; halaman tetap jalan, hanya tanpa mode offline |
| `"unsupported"` | Browser tanpa service worker |
| `"failed"` | File tidak ditemukan atau ada error di dalamnya; detailnya di console |

Pemberitahuan sendiri:

```javascript
import { registerServiceWorker } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.37/pwa.min.js";

const hasil = await registerServiceWorker("sw.js", {
    onUpdate: ({ activate }) => {
        if (confirm("Versi baru tersedia. Muat ulang sekarang?")) activate();
    }
});
if (!hasil.ok) console.log("Mode offline tidak aktif:", hasil.error);
```

Browser memeriksa versi baru `sw.js` setiap kali halaman di dalam scope-nya dibuka. Aplikasi yang dibiarkan terbuka berjam-jam bisa memeriksa sendiri dengan `hasil.registration.update()`.

### `onNetworkChange(callback)`

Memanggil `callback(online)` sekarang juga, lalu setiap kali koneksi putus atau tersambung lagi. Mengembalikan function untuk berhenti mendengarkan.

`online` hanya `false` kalau perangkat benar-benar tanpa jaringan. Tersambung ke Wi-Fi yang tidak punya akses internet tetap dianggap online oleh browser; hasil `status: 0` dari [api.js](api) adalah tanda yang lebih pasti bahwa server tidak terjangkau.

### `isStandalone()`

`true` kalau halaman dibuka sebagai aplikasi terpasang (jendela sendiri, bukan tab browser), termasuk "Tambahkan ke Layar Utama" di Safari iOS.

### `installButton(id, options)`

Menjadikan tombol `#id` sebagai tombol "Pasang aplikasi". Tombol disembunyikan (atribut `hidden`) dan hanya tampil saat browser menyatakan aplikasi bisa dipasang (event `beforeinstallprompt`). Klik membuka dialog pasang dari browser; sesudahnya tombol disembunyikan lagi.

`options.onChoice(outcome)` dipanggil setelah dialog ditutup, dengan `"accepted"` atau `"dismissed"`.

- Event `beforeinstallprompt` hanya ada di Chrome, Edge, dan browser berbasis Chromium lain. Di Firefox dan Safari tombolnya tetap tersembunyi; pengguna memasang lewat menu browser (Safari iOS: Bagikan → Tambahkan ke Layar Utama).
- Browser baru mengirim event itu kalau syaratnya terpenuhi: `https`/`localhost`, manifest dengan `name`, `start_url`, `display` `standalone` (atau `fullscreen`/`minimal-ui`), ikon 192 dan 512 px, dan aplikasi belum terpasang.
- Event ditangkap sejak `pwa.js` dimuat, jadi tidak apa-apa kalau `installButton` dipanggil belakangan.

## `serviceworker.js`

### `crootjsServiceWorker(options)`

Dipanggil di `sw.js` Anda setelah `importScripts`.

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `version` | — (wajib) | Teks versi aplikasi. Lihat [Memperbarui versi](#memperbarui-versi) |
| `precache` | `[]` | File yang diunduh dan disimpan saat pemasangan, relatif terhadap `sw.js`. Boleh URL lengkap jsDelivr. Kalau satu saja gagal diunduh, versi ini tidak dipasang dan versi lama tetap dipakai |
| `offlinePage` | — | Halaman cadangan (mis. `"offline.html"`) saat offline dan halaman yang dituju belum pernah disimpan. Otomatis ikut di-precache |
| `maxEntries` | `100` | Jumlah respons terbanyak di cache runtime (yang tidak ada di `precache`); yang paling lama disimpan dibuang |
| `networkTimeout` | `5000` | Milidetik menunggu server untuk navigasi halaman sebelum memakai halaman tersimpan, untuk sinyal yang ada tapi sangat lambat. Respons server yang datang terlambat tetap disimpan untuk kunjungan berikutnya |
| `name` | `"crootjs-pwa"` | Awalan nama cache |

Cara setiap request ditangani:

| Request | Strategi |
|---|---|
| Navigasi halaman di domain sendiri | **Network-first**: halaman terbaru dari server lalu disimpan; kalau gagal atau lewat `networkTimeout`, halaman tersimpan (URL yang sama, lalu URL yang sama tanpa `?query`); kalau tidak ada, `offlinePage`; kalau tidak ada juga, halaman error offline bawaan browser |
| CSS, JS, gambar, font, manifest di domain sendiri | **Stale-while-revalidate**: langsung dari cache, sambil diambil ulang di latar untuk kunjungan berikutnya; yang belum tersimpan diambil dari server |
| File jsDelivr dengan versi pasti (`@0.0.33`, atau hash commit) | **Cache-first**: isinya tidak pernah berubah, jadi sekali tersimpan tidak diminta lagi. Diambil dengan mode CORS walaupun halaman memintanya tanpa CORS (mis. `<link rel="stylesheet">` tanpa `crossorigin`), supaya yang disimpan bukan respons *opaque* |
| Lainnya | Tidak disentuh, langsung ke jaringan |

Yang disimpan hanya respons yang berhasil (status 2xx) dan tidak berisi `Cache-Control: no-store`. Respons error (404, 500) dan respons *opaque* tidak pernah disimpan.

Nama cache memuat `scope` service worker, jadi beberapa aplikasi di domain yang sama (misalnya folder berbeda di GitHub Pages) tidak saling menghapus cache.

### Yang tidak ditangani

- **Request selain GET** (POST, PUT, DELETE) dan request dengan header `Range` (video, PMTiles) selalu langsung ke jaringan. Saat offline request itu gagal seperti biasa (`api.js` memberi `status: 0`); antrean kirim-ulang (*background sync*) tidak disediakan.
- **`fetch()` dan `XMLHttpRequest` dari kode halaman**, termasuk `getJSON` di [api.js](api), tidak disimpan walaupun ke domain sendiri, supaya data tidak basi tanpa disadari. Untuk data yang perlu ada saat offline, simpan sendiri dengan [storage.js](storage) atau opsi `cache` di `api.js`.
- **Domain lain** selain file jsDelivr berversi pasti: API, font Google, CDN lain, dan tile peta tidak disimpan. Tile peta ditangani [mapcache.js](mapcache) atau [mapoffline.js](mapoffline). Untuk jsDelivr dengan `@latest` atau versi tidak lengkap (`@0`) juga tidak disimpan, karena isinya bisa berubah.
- **Halaman yang belum pernah dibuka** tidak bisa ditampilkan offline kecuali tercantum di `precache` atau ada `offlinePage`.
- **Push notification** dan *periodic sync* tidak disediakan.
- Browser bisa menghapus Cache Storage kalau ruang penyimpanan perangkat hampir habis. `navigator.storage.persist()` meminta browser tidak menghapusnya.

## Memperbarui versi

Browser menganggap ada versi baru kalau isi `sw.js` berubah satu byte saja. Jadi setiap kali merilis:

1. Naikkan `version` di `sw.js` (mis. `"1"` → `"2"`). Wajib kalau daftar `precache` berubah atau pin CrootJS naik (pin di URL `importScripts` atau di `precache`; mengganti pin saja sudah mengubah `sw.js`).
2. Saat pengguna membuka aplikasi, versi baru diunduh di latar dan seluruh `precache`-nya disimpan di cache baru.
3. `registerServiceWorker` memanggil `onUpdate` (atau menampilkan pemberitahuan bawaan). Setelah `activate()`/tombol **Muat ulang**, versi baru aktif, cache versi lama dihapus, dan halaman dimuat ulang.

CSS, JS, dan gambar Anda sendiri tetap diperiksa di latar setiap kali dipakai (stale-while-revalidate), jadi perubahan file tanpa menaikkan `version` tetap sampai ke pengguna, terlambat satu kali buka. Menaikkan `version` membuat semuanya diunduh ulang sekaligus.

Pastikan server tidak menyimpan `sw.js` di cache HTTP terlalu lama. Browser sudah mengabaikan cache HTTP untuk `sw.js` itu sendiri saat memeriksa pembaruan, tetapi beberapa CDN di depan situs bisa menyimpannya; GitHub Pages memakai `max-age=600` (10 menit).

## Menguji di DevTools (Chrome/Edge)

1. Buka situs lewat `https` atau `http://localhost` (mis. `python3 -m http.server 8000` lalu `http://localhost:8000/`). Alamat IP jaringan lokal seperti `http://192.168.x.x` tidak dianggap aman, jadi service worker ditolak (`error: "insecure"`).
2. **Application → Service workers**: status harus *activated and is running*. Centang **Update on reload** selama mengembangkan supaya setiap muat ulang memakai `sw.js` terbaru, dan matikan lagi untuk menguji alur pemberitahuan versi baru.
3. **Application → Cache storage**: terlihat cache `crootjs-pwa <scope> precache <versi>` dan `... runtime <versi>`, beserta isinya.
4. **Network → Offline** (atau **Application → Service workers → Offline**), lalu muat ulang: halaman harus tetap tampil. Kolom *Size* menunjukkan `(ServiceWorker)` untuk respons dari cache.
5. **Application → Manifest**: memeriksa manifest dan ikon, dan memberi tahu kalau ada syarat pemasangan yang belum terpenuhi. Tombol pasang aplikasi juga muncul di bilah alamat.
6. Untuk mulai dari awal: **Application → Storage → Clear site data**.

Di Firefox: `about:debugging#/runtime/this-firefox` → Service Workers, dan **Storage → Cache Storage** di DevTools.

## Catatan

- Service worker hanya mengendalikan halaman di folder tempat `sw.js` berada dan subfoldernya. Letakkan `sw.js` di folder teratas aplikasi.
- Pada kunjungan pertama, halaman dimuat sebelum service worker terpasang; `serviceworker.js` mengambil alih halaman itu begitu aktif (`clients.claim()`), jadi file yang dimuat sesudahnya (gambar, modul yang di-`import` belakangan) sudah lewat cache.
- Data aplikasi (catatan, isian form) tidak disimpan oleh service worker. Simpan dengan [storage.js](storage) (`localStorage`) atau IndexedDB.
- Respons hasil *redirect* disalin menjadi respons biasa sebelum disimpan, karena Safari menolak respons redirect untuk navigasi dari service worker.
