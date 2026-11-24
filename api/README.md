# Dokumentasi Modul `api.js`

*[English](../en/api/)*

`api.js` membungkus Fetch API bawaan browser untuk berkomunikasi dengan backend: kirim dan ambil JSON, unggah dan unduh file, serta memuat potongan HTML. Setiap fungsi JSON bisa dipakai dengan callback maupun `await`, dan **tidak pernah melempar error**: kegagalan jaringan juga berupa hasil biasa yang bisa diperiksa.

## Cara Penggunaan (Import)

```javascript
import { getJSON, postJSON, putJSON, deleteJSON, uploadFile, downloadFile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";
```

## Bentuk Hasil

`getJSON`, `postJSON`, `putJSON`, `deleteJSON`, `uploadFile`, dan `downloadFile` memberi object yang sama bentuknya, ke `responseFunction` dan sebagai isi Promise yang dikembalikan:

```javascript
{
  status: Number,   // status HTTP (200, 201, 400, 404, 500, ...); 0 kalau request gagal total
  data: Object,     // body yang di-parse dari JSON (null kalau bukan JSON); Blob untuk downloadFile 2xx
  headers: Headers, // header respons, misalnya headers.get("X-RateLimit-Remaining")
  error: String,    // null, atau jenis kegagalan saat status 0 (lihat di bawah)
  cached: Boolean   // getJSON saja: true kalau data dari cache
}
```

`headers`, `error`, dan `cached` ada sejak 0.0.29.

### Saat Request Gagal Total

`responseFunction` **selalu** dipanggil, termasuk saat request tidak pernah sampai ke server atau server tidak menjawab. Hasilnya `status: 0` (kode HTTP asli selalu ≥ 100), `data: null`, `headers` kosong, dan `error` berisi jenisnya:

| `error` | Artinya |
|---|---|
| `"timeout"` | Server tidak menjawab dalam batas waktu (bawaan 15 detik, lihat opsi `timeout`) |
| `"offline"` | Browser sedang tidak tersambung ke internet |
| `"network"` | Selain itu: server tidak terjangkau, DNS gagal, atau CORS ditolak. Browser sengaja tidak memberi tahu JavaScript bedanya; alasan persisnya ada di console |
| `"abort"` | Dibatalkan lewat opsi `signal` (sejak 0.0.30) |
| `"nofile"` | `uploadFile` saja: tidak ada file yang dipilih, request tidak dikirim (sejak 0.0.30) |

Server yang menjawab dengan status error (400, 404, 500) bukan kegagalan total: `status` berisi kode aslinya dan `data` berisi body error dari server. Kegagalan total dicatat dengan `console.warn` (kecuali `"abort"`, yang memang disengaja).

```javascript
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";

const { status, data, error } = await getJSON("https://api.example.com/produk");
if (status === 200) {
    console.log(data);
} else if (status === 0) {
    console.log(error === "offline" ? "Tidak ada internet" : "Server tidak bisa dihubungi");
} else {
    console.log("Server menolak:", status, data);
}
```

## Gaya `await` dan Callback

Sejak 0.0.26 fungsi-fungsi ini mengembalikan Promise. Promise-nya tidak pernah *reject*, jadi tidak perlu `try/catch`. Kalau memakai `await`, isi `responseFunction` dengan `null`:

```javascript
const { status, data } = await getJSON("https://api.example.com/produk");
const hasil = await postJSON("https://api.example.com/pesanan", { id: 7 }, null);
```

Gaya callback tetap jalan dan memberi object yang sama:

```javascript
getJSON("https://api.example.com/produk", ({ status, data }) => {
    if (status === 200) console.log(data);
});
```

## Opsi: header, timeout, signal, dan cache

Argumen sesudah `responseFunction` boleh berupa pasangan token lama `tokenkey, tokenvalue` (satu header), atau **satu object opsi** (sejak 0.0.29):

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `headers` | — | Object header tambahan, misalnya `{ Authorization: "Bearer ...", "X-Client": "web" }` |
| `timeout` | `15000` | Milidetik sebelum request dibatalkan (`error: "timeout"`) |
| `signal` | — | `AbortSignal` dari `AbortController`; `controller.abort()` membatalkan request (`error: "abort"`). Sejak 0.0.30 |
| `cache` | — | Hanya `getJSON`: `{ key, ttl }`. Hasil yang berhasil disimpan di `localStorage` dengan nama `key`; selama `ttl` detik tidak ada request sama sekali (`cached: true`). Sesudahnya, kalau server memberi `ETag`, request membawa `If-None-Match`; jawaban `304` memakai data tersimpan dengan status saat disimpan (`200`) dan `cached: true` |

```javascript
// pasangan token lama
await getJSON(url, null, "login", token);
// object opsi
await getJSON(url, null, { headers: { login: token }, timeout: 8000 });
```

`Content-Type: application/json` hanya dikirim kalau ada body (`postJSON`, `putJSON`, `deleteJSON`). `getJSON` tanpa header tambahan tidak memicu *preflight* CORS, jadi bisa membaca JSON dari host statis seperti GitHub Pages dan `raw.githubusercontent.com`. Header tambahan, termasuk token dan `If-None-Match` dari opsi `cache`, tetap memicu preflight, jadi servernya harus mengizinkan header itu.

### Membatalkan request

Berguna untuk pencarian saat mengetik: request lama dibatalkan begitu pengguna mengetik lagi, supaya hasil lama tidak menimpa hasil baru.

```javascript
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";
import { onInput, getValue } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/element.js";

let pencarian = null;
onInput("cari", async () => {
    if (pencarian) pencarian.abort();
    pencarian = new AbortController();
    const { status, data, error } = await getJSON(
        "https://api.example.com/cari?q=" + encodeURIComponent(getValue("cari")),
        null,
        { signal: pencarian.signal }
    );
    if (error === "abort") return; // sudah diganti ketikan baru
    if (status === 200) console.log(data);
});
```

### Cache dengan ETag

Contoh: versi rilis terbaru dari GitHub API, disimpan 1 jam. Sesudah satu jam GitHub menjawab `304` kalau belum ada rilis baru, dan jawaban `304` tidak memotong kuota 60 request per jam.

```javascript
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";
import { setInnerText } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/element.js";

const { status, data, headers, error } = await getJSON(
    "https://api.github.com/repos/crootjs/lib/releases/latest",
    null,
    { timeout: 8000, cache: { key: "rilis-crootjs", ttl: 3600 } }
);
if (status === 200) setInnerText("versi", data.tag_name);
else if (status === 403) setInnerText("versi", "Kuota habis, coba lagi pukul " + new Date(headers.get("X-RateLimit-Reset") * 1000).toLocaleTimeString());
else if (error === "offline") setInnerText("versi", "Tidak ada internet");
```

## `getJSON`, `postJSON`, `putJSON`, `deleteJSON`

```javascript
getJSON(url, responseFunction, tokenkey?, tokenvalue?)          // atau (url, responseFunction, options)
postJSON(url, data, responseFunction, tokenkey?, tokenvalue?)   // atau (url, data, responseFunction, options)
putJSON(url, data, responseFunction, tokenkey?, tokenvalue?)
deleteJSON(url, data, responseFunction, tokenkey?, tokenvalue?)
```

Perhatikan urutannya: `responseFunction` **bukan** argumen terakhir, dan untuk `postJSON`/`putJSON`/`deleteJSON` letaknya sesudah `data`.

| Parameter | Keterangan |
|---|---|
| `url` | Alamat tujuan |
| `data` | Object yang dikirim sebagai body JSON (`postJSON`, `putJSON`, `deleteJSON`). Untuk `deleteJSON` tanpa body, isi `undefined` |
| `responseFunction` | `function (hasil)`, atau `null` kalau memakai `await` |
| `tokenkey`, `tokenvalue` | Nama dan nilai satu header token, misalnya `"Authorization"`, `"Bearer eyJ..."` |
| `options` | Pengganti `tokenkey, tokenvalue`: `{ headers, timeout, signal, cache }` (lihat [Opsi](#opsi-header-timeout-signal-dan-cache)) |

```javascript
import { getJSON, postJSON, putJSON, deleteJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";
import { getCookie } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/cookie.js";

const auth = { headers: { login: getCookie("login") } };

const daftar = await getJSON("https://api.example.com/produk", null, auth);
const baru = await postJSON("https://api.example.com/produk", { nama: "Kopi", harga: 25000 }, null, auth);
await putJSON("https://api.example.com/produk/7", { harga: 27000 }, null, auth);
await deleteJSON("https://api.example.com/produk/7", undefined, null, auth);
```

## `uploadFile`

Mengunggah file dengan `multipart/form-data` dan melaporkan kemajuannya (sejak 0.0.30). Hasilnya berbentuk sama dengan `getJSON`: `data` adalah body JSON jawaban server.

```javascript
uploadFile(url, source, responseFunction, options)
```

`source` bisa berupa:

- id `<input type="file">`, dan semua file yang dipilih ikut terkirim (input dengan `multiple` boleh);
- `File` atau `Blob`, misalnya hasil kamera atau kanvas;
- `FileList` atau array `File`;
- `FormData` yang sudah jadi.

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `field` | `"file"` | Nama field file di form; samakan dengan yang dibaca backend |
| `data` | — | Object field tambahan, misalnya `{ judul: "Foto KTP" }`. Nilai object dikirim sebagai JSON |
| `method` | `"POST"` | |
| `headers` | — | Header tambahan (token). Jangan isi `Content-Type`; browser mengisinya beserta *boundary* |
| `timeout` | `15000` | Milidetik **tanpa kemajuan** sebelum dibatalkan. Dihitung ulang setiap ada data terkirim, jadi file besar di jaringan lambat tetap bisa selesai |
| `signal` | — | `AbortSignal` untuk membatalkan, misalnya tombol Batal |
| `onProgress` | — | `function (fraksi, terkirim, total)` selama mengunggah; `fraksi` dari 0 sampai 1 |

```html
<label for="berkas">Foto KTP</label>
<input type="file" id="berkas" accept="image/*">
<progress id="kemajuan" max="1" value="0"></progress>
<button type="button" id="unggah">Unggah</button>
<button type="button" id="batal">Batal</button>
```

```javascript
import { uploadFile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";
import { onClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/element.js";

let unggahan = null;
onClick("unggah", async () => {
    unggahan = new AbortController();
    const { status, data, error } = await uploadFile("https://api.example.com/ktp", "berkas", null, {
        field: "foto",
        data: { nik: "3273..." },
        headers: { login: "token-anda" },
        signal: unggahan.signal,
        onProgress: (fraksi) => { document.getElementById("kemajuan").value = fraksi; },
    });
    if (status === 200) console.log("Tersimpan:", data);
    else if (error === "nofile") console.log("Pilih file dulu");
    else if (error !== "abort") console.log("Gagal:", status, error);
});
onClick("batal", () => unggahan && unggahan.abort());
```

`uploadFile` memakai `XMLHttpRequest`, karena `fetch()` belum bisa melaporkan kemajuan unggahan.

## `downloadFile`

Mengunduh file (sejak 0.0.30). Untuk status 2xx, `data` berisi `Blob`; untuk status lain, `data` berisi body error dari server yang di-parse dari JSON (atau `null`).

```javascript
downloadFile(url, responseFunction, options)
```

Opsinya `headers`, `timeout`, `signal` (sama dengan `getJSON`), ditambah `fileName`: kalau diisi, file 2xx langsung disimpan browser dengan nama itu.

```javascript
import { downloadFile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";

// langsung disimpan
const { status, data } = await downloadFile("https://api.example.com/laporan/7.pdf", null, {
    headers: { login: "token-anda" },
    fileName: "laporan-7.pdf",
});
if (status !== 200) console.log("Gagal:", status, data);

// atau dipakai di halaman tanpa disimpan
const gambar = await downloadFile("https://api.example.com/foto/7");
if (gambar.status === 200) document.getElementById("foto").src = URL.createObjectURL(gambar.data);
```

## `insertHTML`

```javascript
insertHTML(url, id, runFunction, errorFunction?)
```

Mengambil HTML dari `url` dan memasangnya sebagai isi elemen `id`, lalu memanggil `runFunction()`. `errorFunction` (opsional) dipanggil dengan sebuah `Error` kalau elemennya tidak ada, server menjawab selain 2xx, jaringan gagal, atau request melewati 15 detik. Saat gagal, isi elemen tidak diubah dan `runFunction` tidak dipanggil.

```javascript
import { insertHTML } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";

insertHTML("./bagian/navbar.html", "navbar", () => {
    console.log("Navbar terpasang");
}, (error) => {
    console.log("Navbar gagal dimuat:", error.message);
});
```

`renderHTML(id, url, callback?, errorCallback?)` di [`element.js`](../element/) melakukan hal yang sama dengan urutan argumen berbeda. Keduanya memasang HTML lewat `innerHTML`, jadi `<script>` di dalamnya tidak dijalankan.

## `getDomHTML`

```javascript
getDomHTML(url, domFunction)
```

Mengambil HTML dari `url` dan memberikannya ke `domFunction(htmlDom)` sebagai `Document` hasil parse, untuk dibaca atau diubah dulu sebelum dipasang. Status jawaban tidak diperiksa: halaman error 404/500 juga diberikan sebagai `Document`. Hanya saat jaringan gagal atau lewat 15 detik `domFunction` tidak dipanggil (alasannya di console).

```javascript
import { getDomHTML } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";

getDomHTML("./bagian/kartu.html", (htmlDom) => {
    const judul = htmlDom.querySelector(".judul");
    console.log(judul ? judul.textContent : "tanpa judul");
});
```

## Fungsi File Lama

Fungsi-fungsi ini tetap ada supaya kode lama tidak rusak, dengan bentuk hasil seperti dulu. Untuk kode baru, pakai [`uploadFile`](#uploadfile) dan [`downloadFile`](#downloadfile), yang hasilnya seragam, bisa di-`await`, dan punya opsi.

| Fungsi | Hasil ke `responseFunction` | Saat jaringan gagal / 15 detik |
|---|---|---|
| `postFile(url, id, formdataname, responseFunction)` | Body JSON jawaban (atau `null` kalau bukan JSON) | `null` |
| `postFileWithHeader(url, tokenkey, tokenvalue, id, formdataname, responseFunction)` | Sama dengan `postFile`, plus satu header token | `null` |
| `postFileJSON(url, tokenkey, tokenvalue, id, formdataname, responseFunction)` | `{ status, data }` | `{ status: 0, data: null }` |
| `getFileWithHeader(url, tokenkey, tokenvalue, responseFunction, fileName)` | Status 200: file langsung diunduh dengan nama `fileName`, `responseFunction` tidak dipanggil. Selain 200: body error (atau `null`) | `{ status: 0 }` |
| `getFileBytesWithHeader(url, tokenkey, tokenvalue, responseFunction)` | Status 200: `ArrayBuffer` isi file. Selain 200: body error (atau `null`) | `{ status: 0 }` |

`id` adalah id `<input type="file">`; hanya file pertamanya yang dikirim. `formdataname` harus sama dengan nama field yang dibaca backend.

## Catatan

- Kode sumber lengkap: [`api.js`](https://github.com/crootjs/lib/blob/main/api.js).
- Semua request di modul ini dibatalkan setelah 15 detik tanpa jawaban kecuali opsinya diubah (`uploadFile`: 15 detik tanpa kemajuan).
- Token di `localStorage` atau cookie yang bisa dibaca JavaScript rentan dicuri lewat XSS. Kalau backend Anda bisa, pakai cookie `HttpOnly`.
