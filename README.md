# Dokumentasi Human in The Loop

*[English](en/)*

Dokumentasi Pemakaian CrootJS dengan AI Companion dan Human in the loop.

Pindah dari **JSCroot**? Baca [Dari JSCroot ke CrootJS](migrasi): alamat impor baru, fungsi yang dihapus beserta penggantinya, dan perilaku yang berubah.

Impor setiap modul dari versi yang dipatok, mis. `https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/api.min.js`. Untuk produksi pakai `.min.js` untuk **semua** impor CrootJS di satu halaman, jangan dicampur dengan `.js`: `api.min.js` dan `storage.js` adalah alamat modul yang berbeda, jadi modul yang diimpor keduanya termuat dua kali dengan state masing-masing. Sejak 0.0.38 berkas `.min.js` di setiap rilis mengimpor `.min.js` modul pendampingnya.

Patok versi ke **tag** (`@0.0.39`), bukan ke SHA commit dari `main`. Berkas `.min.js` buatan kita hanya ada di commit rilis (di branch `dist`, sejak 0.0.40); untuk SHA dari `main`, jsDelivr memperkecil sendiri dan `api.min.js`-nya kembali mengimpor `"./storage.js"`.

### Memuat lebih cepat dengan `modulepreload`

Browser baru tahu sebuah modul butuh modul lain setelah modul itu selesai diunduh, jadi setiap tingkat impor menambah satu kali bolak-balik ke server (sekitar 150 ms di jaringan seluler). Modul berikut mengimpor modul lain:

| Modul | Ikut dimuat | Tingkat |
|---|---|---|
| `api.js` | `storage.js` | 1 |
| `auth.js` | `cookie.js`, `api.js`, `storage.js`, `url.js`, `element.js`, `template.js`, `useragent.js`, `qr.js` | 2 |
| `config.js` | `auth.js`, `cookie.js`, `api.js`, `storage.js`, `url.js`, `element.js`, `template.js`, `useragent.js`, `qr.js` | 3 |
| `form.js` | `element.js` | 1 |
| `geomeasure.js` | `geo.js` | 1 |
| `georoute.js` | `geo.js`, `geomeasure.js` | 2 |
| `map.js` | `geo.js` | 1 |
| `mapcluster.js` | `geo.js` | 1 |
| `mapdraw.js` | `geo.js` | 1 |
| `mapheat.js` | `geo.js` | 1 |
| `mapmodel.js` | `model3d.js` | 1 |
| `mapoffline.js` | `mapvector.js` | 1 |
| `maptools.js` | `geomeasure.js`, `geo.js` | 2 |

Tambahkan `<link rel="modulepreload">` di `<head>` untuk modul yang Anda impor **dan** modul di kolom "Ikut dimuat", dengan versi dan akhiran `.min.js` yang sama. Semuanya lalu diunduh bersamaan sejak awal. Contoh untuk halaman yang mengimpor `api.min.js`:

```html
<link rel="modulepreload" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/api.min.js">
<link rel="modulepreload" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/storage.min.js">
<script type="module" src="index.js"></script>
```

Di landing page croot.js.org, cara ini memajukan request API pertama sekitar 300 ms pada latensi 150 ms. Tabel di atas dibuat dari kode dengan `python3 tools/module-deps.py` di repo `lib`.

## Referensi Modul

Dokumentasi per-modul dari `crootjs/lib`:

- [api.js](api/) — `getJSON`, `postJSON`, `putJSON`, `deleteJSON` (callback atau `await`, header, timeout, batal, cache ETag), `uploadFile` dengan kemajuan, `downloadFile`
- [element.js](element/) — `onClick`, `setInner`, `getValue`, `serializeForm`, `fillForm`, dan helper DOM lainnya
- [croot.css](css) — framework CSS kecil dan hijau (~2 KB gzip): HTML biasa langsung rapi tanpa kelas, plus tata letak (`.container`, `.stack`, `.cluster`, `.grid`), kartu, badge, alert, navigasi, mode gelap, dan tema lewat variabel CSS; ikon opsional `icons.css` (49 ikon, ~1,9 KB gzip)
- [ui.css, themes.css, tabs.js](ui) — komponen aplikasi opsional (kerangka dengan sidebar, tab, menu, akordeon, angka ringkasan, sakelar, langkah, dan lainnya), empat tema berkarakter (`kampus`, `kertas`, `kontras`, `niaga`), `initTabs`, dan [pola halaman](https://croot.js.org/examples/pola/) siap salin
- [form.js](form) — validasi form dengan pesan di bawah setiap field, ramah pembaca layar (`handleForm`, `validateForm`, `clearFormErrors`)
- [router.js](router) — router aplikasi satu halaman: mode hash/history, parameter `:id`, query, halaman 404, handler async, fokus dan `aria-current` (`startRouter`)
- [table.js](table) — tabel data: urut per kolom, cari, halaman, mode server; pengganti jQuery DataTables (`createTable`)
- [chart.js](chart) — grafik SVG batang, garis, dan donat yang ditulis sendiri: skala angka bulat, format angka Indonesia, mode gelap, tabel dan tooltip keyboard untuk aksesibilitas (`createChart`)
- [markdown.js](markdown) — Markdown menjadi HTML yang aman (HTML mentah di-escape, URL berbahaya ditolak), render ke elemen, muat file `.md` (`markdownToHTML`, `renderMarkdown`, `getMarkdown`)
- [qr.js](qr) — kode QR sebagai SVG, ditulis sendiri (`renderQR`, `qrSVG`, `qrMatrix`)
- [openapi.js](openapi) — dokumentasi API dari `openapi.yaml`/`.json`, pengganti Swagger UI, dengan kode `api.js` dan tombol coba per operasi (`renderOpenAPI`, `loadOpenAPI`, `openAPIExample`); pengurai YAML-nya `yaml.js` (`parseYAML`)
- [cookie.js](cookie) — simpan/ambil/hapus cookie
- [storage.js](storage) — simpan/ambil/hapus data di localStorage & sessionStorage (dengan opsi kadaluwarsa)
- [debounce.js](debounce) — `debounce`/`throttle` untuk membatasi frekuensi eksekusi function (search-as-you-type, scroll, dsb)
- [toast.js](toast) — notifikasi ringan tanpa dependency eksternal (`toast`, `toastSuccess`, `toastError`, `toastWarning`, `toastInfo`)
- [pwa.js dan serviceworker.js](pwa) — aplikasi yang bisa dipasang dan tetap terbuka tanpa internet: service worker di domain sendiri, pemberitahuan versi baru, status online/offline, tombol pasang aplikasi (`registerServiceWorker`, `installButton`, `crootjsServiceWorker`)
- [geo.js](geo) — baca data geospasial GeoJSON dari URL atau file lokal (`getGeoJSON`, `readGeoJSONFile`, `parseGeoJSON`), plus kotak pembatas, titik tengah, dan daftar properti
- [map.js](map) — peta interaktif tanpa library eksternal: peta dasar tile (OpenStreetMap), gambar GeoJSON, popup, klik koordinat, klik kanan, lapisan bernama, label, hover, ganti peta dasar, renderer canvas (`createMap`, `addGeoJSON`, `fitMap`, `onMapClick`, `onMapContextMenu`, `showLayer`, `setTiles`)
- [mapmarker.js](mapmarker) — modul tambahan `map.js`: marker pin, ikon, atau elemen sendiri, dengan label, popup, dan bisa digeser (`addMarker`)
- [mapcontrol.js](mapcontrol) — modul tambahan `map.js`: garis skala, "lokasi saya", live tracking, pilihan peta dasar (daftar atau kartu bergambar), daftar centang lapisan, koordinat, menu klik kanan, dan layar penuh (`addScaleBar`, `addLocateButton`, `locateUser`, `addTrackButton`, `trackUser`, `addBasemapControl`, `setBasemap`, `addLayerControl`, `addCoordinateControl`, `addContextMenu`, `addFullscreenButton`)
- [maptools.js](maptools) — modul tambahan `map.js`: alat ukur jarak dan luas (juga dengan keyboard), gambar bergeoreferensi dengan rotasi, ekspor PNG (`addMeasureControl`, `addImageOverlay`, `exportMapImage`)
- [mapcluster.js](mapcluster) — modul tambahan `map.js`: pengelompokan titik untuk data titik yang sangat banyak (`addCluster`)
- [mapsearch.js](mapsearch) — modul tambahan `map.js`: cari tempat dari nama/alamat dan alamat dari titik (Nominatim/OSM atau penyedia sendiri), plus kotak pencarian (`searchPlace`, `reverseGeocode`, `addSearchControl`)
- [mapoffline.js](mapoffline) — modul tambahan `map.js`: peta dasar dari satu file PMTiles raster atau vektor, dari server atau dari file di perangkat tanpa internet (`openPMTiles`)
- [mapcache.js](mapcache) — modul tambahan `map.js`: tile yang pernah dilihat tersimpan di browser dan tetap tampil saat offline, plus unduh area untuk server tile sendiri (`cachedTiles`)
- [mapvector.js](mapvector) — tile vektor MVT digambar di browser, dengan gaya yang bisa diganti (`decodeMVT`, `renderVectorTile`, `DEFAULT_VECTOR_STYLE`)
- [mapmodel.js](mapmodel) — modul tambahan `map.js`: model 3D glTF/GLB di lokasinya di peta, ukuran sesuai meter (`addModel`)
- [mapdraw.js](mapdraw) — modul tambahan `map.js`: menggambar titik, garis, dan poligon (juga dengan keyboard), lalu mengubah bentuknya (geser, tambah, hapus simpul); hasilnya GeoJSON (`addDrawControl`, `startDrawing`, `editFeature`)
- [mapheat.js](mapheat) — modul tambahan `map.js`: heatmap kepadatan titik dan peta petak persegi/heksagon berwarna menurut nilai, seperti peta cakupan sinyal (`addHeatmap`, `addGridMap`)
- [model3d.js](model3d) — penampil model 3D glTF/GLB tanpa Three.js (WebGL2, cadangan WebGL1): putar/zoom, klik bagian, ganti warna, sembunyikan, posisi/rotasi lewat kode (`createViewer`, `loadModel`, `onModelClick`, `setPartColor`, `setPartVisible`, `setPartTransform`, `fitView`)
- [model3dtools.js](model3dtools) — modul tambahan `model3d.js`: label HTML yang menempel di model, gizmo geser/putar/skala, animasi glTF, tampilan meledak, potongan melintang, ukur jarak dan sudut, AR di dalam halaman (WebXR) atau Scene Viewer/Quick Look, ekspor `.glb` (`addHotspot`, `enableTransform`, `playAnimation`, `explodeModel`, `addSection`, `measureModel`, `startAR`, `addARButton`, `exportGLB`, `downloadGLB`)
- [geomeasure.js](geomeasure) — jarak, panjang, luas, titik-di-dalam-area, titik terdekat, lingkaran radius, konversi dari grid lokal (`getDistance`, `getArea`, `isInside`, `createCircle`, `createAffineTransform`, ...)
- [georoute.js](georoute) — rute terpendek di sepanjang garis-garis di dalam data GeoJSON, dihitung di browser (`findRoute`)
- [url.js](url) — protokol, host, path, query string, hash, redirect
- [validate.js](validate) — validasi & format input (username, nomor telepon, Rupiah)
- [websocket.js](websocket) — buka/tutup koneksi WebSocket
- [stp.js](stp) — kirim/verifikasi/kirim ulang OTP WhatsApp
- [useragent.js](useragent) — deteksi perangkat mobile
- [trace.js](trace) — lacak koordinat klik/sentuhan
- [image.js](image) — warna acak (hex & nama warna)
- [loading.js](loading) — aset SVG loading spinner
- [mongo.js](mongo) — helper `ObjectId` MongoDB (browser-only, tanpa koneksi DB)

Lihat juga: [source code lib](https://github.com/crootjs/lib) dan [contoh implementasi](https://github.com/crootjs/examples).

## Coding Conventions (Wajib)

Semua kode yang memakai CrootJS — ditulis manusia maupun AI coding agent — **wajib** memisahkan HTML, CSS, dan JS ke file terpisah, dan JS wajib dimuat sebagai `type="module"`. Tidak boleh ada `<style>`/`<script>` inline atau atribut `onclick`/`style=""` di HTML.

Baca aturan lengkap & alasannya: **[conventions.md](conventions)**.

Pakai AI coding agent? Unduh [`CLAUDE.md`](https://raw.githubusercontent.com/crootjs/lib/main/CLAUDE.md) dan taruh di root project kamu — Claude Code otomatis mengikuti aturan ini.

## Landing Page

Pembuatan landing page awal pada alamat.github.io

Buka prompt
```txt
buatkan landing page yang responsif untuk platform digital kampus dengan menggunakan HTML, CSS dan JS ES6+ Module dilengkapi dengan meta tag untuk sosial media (termasuk sharing whatsapp yang tampil gambar, judul dan deskripsinya ketika di share)
```

Human in the loop:
1. Pastikan terdapat meta tag
   ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CrootSS | CSS Mobile Friendly Responsive Component and Template</title>
    <link rel="stylesheet" href="croot.css">

        <meta name="description" content="CrootSS: CSS Mobile Friendly Responsive Component and Template." />
        <meta name="keywords" content="CrootSS, CSS, Template, Responsive, Template, Vanilla, html, CSS lib" />
        <meta property="og:image" content="/crootss.png" />
        <!-- Meta Tags untuk Open Graph -->
        <meta property="og:title" content="CrootSS: CSS Mobile Friendly Responsive Component and Template" />
        <meta property="og:description" content="CSS Mobile Friendly Responsive Component and Template" />
        <meta property="og:image" content="https://crootss.if.co.id/crootss.jpeg" />
        <meta property="og:url" content="https://crootss.if.co.id" />
        <meta property="og:type" content="website" />

        <!-- Meta Tags untuk Twitter (opsional) -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CrootSS: CSS Mobile Friendly Responsive Component and Template" />
        <meta name="twitter:description" content="CSS Mobile Friendly Responsive Component and Template" />
        <meta name="twitter:image" content="https://www.do.my.id/crootss.jpeg" />
    
    </head>
    <body>
    </body>
    </html>
   ```
2. Pastikan terdapat robots.txt
   ```txt
   User-agent: *
   Allow: /
   Sitemap: https://alamat.github.io/sitemap.xml
   ```
3. Pastikan terdapat sitemap.xml
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
    <urlset
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

    <url>
    <loc>https://www.bukupedia.co.id/</loc>
    <lastmod>2022-10-18T09:47:19+00:00</lastmod>
    <priority>1.00</priority>
    </url>
    <url>
    <loc>https://katalog.bukupedia.co.id/</loc>
    <lastmod>2022-10-18T09:47:19+00:00</lastmod>
    <priority>0.80</priority>
    </url>
    <url>
    <loc>https://penulis.bukupedia.co.id/</loc>
    <lastmod>2022-10-18T09:47:19+00:00</lastmod>
    <priority>0.80</priority>
    </url>
    <url>
    <loc>https://www.bukupedia.co.id/p/layanan.html</loc>
    <lastmod>2022-10-18T09:47:19+00:00</lastmod>
    <priority>0.80</priority>
    </url>

    </urlset>
   ```
4. Pastikan terlebih dahulu anda mengunggah file favicon.ico
5. Pastikan anda membuat file [404.html](404.html)

## Login Menggunakan WhatsAuth

API whatsauth dapat digunakan untuk pengembangan implementasi SSO, login menggunakan QR dan Google SignIn. Buat repo baru yang berisi:
1. index.html : File html utama yang memanggil js qr dan gsi
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta http-equiv="X-UA-Compatible" content="IE=edge">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>WhatsAuth | Free WhatsApp API OTP Notif Broadcast Gratis</title>
       <link href="style.css" rel="stylesheet">
   	<script src="main.js" type="module"></script>
   </head>
   <body>
    <div id="hasphonenumber" class="w-full h-screen bg-blue-100 flex items-center justify-center">
        <div class="w-96 bg-white rounded-xl">
            <p class="font-bold text-center mb-4" id="useracclog">Tap/Scan dengan <a href="./camwab.jpg" target="_blank">Camera WA</a></p>
            <div class="flex justify-center mt-2 mb-4" id="whatsauthqr">
                <img src="loading.svg">
            </div>
            <p class="font-bold text-center mb-4" id="whatsauthcounter">counter</p>
            <p class="font-bold text-center mb-4" id="logs"><a href="https://wa.my.id">WhatsAuth Free WhatsApp Notif, OTP, API Gateway Gratis</a></p>
        </div>
    </div>
   </body>
   </html>   
   ```
2. main.js : pengaturan login menggunakan crootjs
   ```js
   import {qrController,deleteCookie,appendGoogleSignin} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/auth.js";
   import { wauthparam } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/config.js";
   
   wauthparam.auth_ws="d3NzOi8vYXBpLndhLm15LmlkL3dzL3doYXRzYXV0aC9wdWJsaWM=";
   wauthparam.keyword="aHR0cHM6Ly93YS5tZS82MjgzMTMxODk1MDAwP3RleHQ9d2g0dDVhdXRoMA==";
   wauthparam.tokencookiehourslifetime=18;
   wauthparam.redirect ="/auth"
   deleteCookie(wauthparam.tokencookiename);
   qrController(wauthparam);
   
   const url="https://asia-southeast2-awangga.cloudfunctions.net/bukupedia/auth/users";

   const client_id="239713755402-4hr2cva377m43rsqs2dk0c7f7cktfeph.apps.googleusercontent.com";

   // Panggil fungsi untuk menambahkan elemen
   appendGoogleSignin(client_id,url);
   ```
   Ubah variabel `wauthparam.keyword` disesuaikan dengan nomor yang di daftarkan di WhatsAuth. Gunakan Base64 Decode dan Encode dengan melakukan update dari string keyword diatas untuk di update.
   ![image](https://github.com/user-attachments/assets/8e24a1ac-7249-45d3-8823-ee7f07c82058)  

Untuk file-file tambahan:
1. [style.css](style.css)
2. [loading.svg](loading.svg)

Jangan lupa untuk menambahkan domainnya di Console APIs&Services - Client ID for Web application  
![image](https://github.com/user-attachments/assets/12191720-6f6c-4155-bf75-d966b0f60c4c)

## Repo Auth

Untuk melakukan otorisasi antara frontend dan backend maka diperlukan satu repo tambahan bernama auth(ada di settingan qr.js yaitu /auth).
Pada file index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="index.js" type="module"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selamat Datang di Naskah Bukupedia</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="scene">
        <div class="shadow"></div>
        <div class="jumper">
          <div class="spinner">
            <div class="scaler">
              <div class="loader">
                <div class="cuboid">
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      
      </div>
</body>
</html>
```

Pada file index.js
```js
import {getCookie} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/cookie.js";
import {getJSON} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/api.js";
import {redirect} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/url.js";

if (getCookie("login")){
    getJSON("https://asia-southeast2-awangga.cloudfunctions.net/florka/data/user",responseFunction,"login",getCookie("login"));
}else{
    redirect("/login");
}


function responseFunction(result){
    console.log(result);
    if (result.status === 200){
        redirect("/dashboard");
    }else{
        redirect("/daftar");
    }
}
```
dan file [style.css](./auth/style.css)

## Integrasi WhatsAuth dengan JSCroot dan GOCroot

[![Tutorial Web](https://img.youtube.com/vi/LDQ8Ty8B9eM/0.jpg)](https://www.youtube.com/watch?v=LDQ8Ty8B9eM)  

Untuk pengembangan sendiri. Silahkan buka [Panduan Deployment WebHook](/webhook)

