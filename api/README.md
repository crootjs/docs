## 1. API (`api.js`)

*[English](../en/api/)*

Modul `api.js` menyediakan fungsi-fungsi *wrapper* di atas **Fetch API** bawaan browser untuk mempermudah komunikasi HTTP dengan backend. Setiap fungsi menggunakan pola **callback** — Anda menyediakan sebuah fungsi yang akan dipanggil saat respons diterima dari server, beserta informasi HTTP status code. Fungsi JSON-nya juga bisa di-`await` (lihat [Gaya `await`](#gaya-await)).

### Pola Umum Response

Semua fungsi JSON pada modul ini (`getJSON`, `postJSON`, `deleteJSON`, `putJSON`) mengembalikan respons ke callback function dengan format objek yang konsisten:

```javascript
{
  status: Number,   // HTTP status code (200, 201, 400, 404, 500, dst.); 0 kalau request gagal total
  data: Object,     // Body respons yang sudah di-parse dari JSON (null kalau bukan JSON)
  headers: Headers, // header respons, misalnya headers.get("X-RateLimit-Remaining") (sejak 0.0.29)
  error: String,    // null, atau "timeout" / "offline" / "network" saat status 0 (sejak 0.0.29)
  cached: Boolean   // true kalau data diambil dari cache (opsi cache, sejak 0.0.29)
}
```

#### Menangani Kegagalan Jaringan/Timeout

`responseFunction` **selalu** dipanggil, termasuk saat request gagal total (bukan cuma saat server merespons dengan status error seperti 404/500). Kalau jaringan gagal (offline, DNS gagal, CORS ditolak) atau server tidak merespons sama sekali dalam 15 detik (request otomatis dibatalkan lewat timeout; bisa diubah dengan [opsi `timeout`](#opsi-header-timeout-dan-cache)), `responseFunction` dipanggil dengan:

```javascript
{ status: 0, data: null, headers: Headers /* kosong */, error: "timeout" | "offline" | "network", cached: false }
```

`error` menjelaskan jenisnya: `"timeout"` (server tidak menjawab dalam batas waktu), `"offline"` (browser sedang tidak tersambung internet), atau `"network"` (selain itu). CORS ditolak dan server yang tidak terjangkau sama-sama `"network"`, karena browser sengaja tidak memberi tahu JavaScript bedanya; alasan persisnya ada di console. Kegagalan dicatat dengan `console.warn`, jadi bisa disembunyikan dengan filter level di DevTools.

`status: 0` bukan kode HTTP asli (kode HTTP asli selalu >= 100) — jadi aman dipakai sebagai penanda "request gagal total", terpisah dari status error dari server seperti 404/500 yang tetap membawa `data` dari body respons server.

```javascript
getJSON("https://api.example.com/data", (res) => {
    if (res.status === 0) {
        console.log("Request gagal — cek koneksi internet atau server sedang down");
    } else if (res.status >= 400) {
        console.log("Server merespons dengan error:", res.status, res.data);
    } else {
        console.log("Berhasil:", res.data);
    }
});
```

### Gaya `await`

Sejak versi 0.0.26, `getJSON`, `postJSON`, `putJSON`, dan `deleteJSON` juga **mengembalikan Promise** berisi objek `{ status, data }` yang sama. Callback tetap jalan seperti biasa; kalau memakai `await`, isi `responseFunction` dengan `null`:

```javascript
import { getJSON, postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/api.js";
import { getCookie } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/cookie.js";

const { status, data } = await getJSON("https://api.example.com/produk");
if (status === 200) console.log(data);

// token tetap di dua argumen terakhir
const hasil = await postJSON("https://api.example.com/pesanan", { id: 7 }, null, "login", getCookie("login"));
```

Promise-nya tidak pernah *reject*, jadi tidak perlu `try/catch`: cek `status` seperti biasa (`0` = jaringan gagal atau timeout).

### Opsi: header, timeout, dan cache

Sejak 0.0.29, argumen sesudah `responseFunction` boleh berupa **satu object opsi**, sebagai ganti pasangan `tokenkey, tokenvalue` (yang tetap didukung):

```javascript
getJSON(url, responseFunction, { headers, timeout, cache })
postJSON(url, data, responseFunction, { headers, timeout })
```

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `headers` | — | Object header tambahan, misalnya `{ Authorization: "Bearer ...", "X-Client": "web" }`. Token bisa ditaruh di sini |
| `timeout` | `15000` | Milidetik sebelum request dibatalkan (`error: "timeout"`) |
| `cache` | — | Hanya `getJSON`: `{ key, ttl }`. Hasil yang berhasil disimpan di `localStorage` dengan nama `key`; selama `ttl` detik tidak ada request sama sekali (`cached: true`). Sesudahnya, kalau server memberi `ETag`, request membawa `If-None-Match`; balasan `304` memakai data yang tersimpan, dengan status saat disimpan (`200`) dan `cached: true` |

`Content-Type: application/json` hanya dikirim kalau ada body (`postJSON`/`putJSON`/`deleteJSON`). `getJSON` tanpa header tambahan tidak memicu *preflight* CORS, jadi bisa membaca JSON dari host statis seperti GitHub Pages dan `raw.githubusercontent.com`. Header tambahan (termasuk token dan `If-None-Match` dari opsi `cache`) tetap memicu preflight, sehingga servernya harus mengizinkan header itu.

Contoh: versi rilis terbaru dari GitHub API, disimpan 1 jam. Sesudah satu jam, GitHub menjawab `304` kalau belum ada rilis baru, dan balasan `304` tidak memotong kuota 60 request per jam.

```javascript
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/api.js";
import { setInnerText } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/element.js";

const { status, data, headers, error } = await getJSON(
    "https://api.github.com/repos/crootjs/lib/releases/latest",
    null,
    { timeout: 8000, cache: { key: "rilis-crootjs", ttl: 3600 } }
);
if (status === 200) setInnerText("versi", data.tag_name);
else if (status === 403) setInnerText("versi", "Kuota habis, coba lagi pukul " + new Date(headers.get("X-RateLimit-Reset") * 1000).toLocaleTimeString());
else if (error === "offline") setInnerText("versi", "Tidak ada internet");
```

### 1.1 `getJSON()`

Melakukan **HTTP GET** request ke URL yang ditentukan dan mengembalikan respons dalam format JSON ke callback function.

#### Signature

```javascript
getJSON(target_url, responseFunction, tokenkey?, tokenvalue?)
getJSON(target_url, responseFunction, options?)   // sejak 0.0.29
```

#### Parameter

| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|:-----:|-----------|
| `target_url` | `string` | ✅ | URL tujuan HTTP GET request |
| `responseFunction` | `function` | ✅ | Callback function yang menerima objek `{ status, data }` |
| `tokenkey` | `string` | ❌ | Nama header untuk autentikasi (misal: `"Authorization"`, `"token"`, `"Login"`) |
| `tokenvalue` | `string` | ❌ | Nilai token autentikasi (misal: `"Bearer eyJhbGci..."`) |
| `options` | `object` | ❌ | Ganti `tokenkey, tokenvalue`: `{ headers, timeout, cache }` (lihat [Opsi](#opsi-header-timeout-dan-cache)) |

#### Return Value

`Promise<{ status, data, headers, error, cached }>` — hasil yang sama dengan yang dikirim ke `responseFunction`. Promise ini tidak pernah *reject*; kegagalan jaringan juga berupa `{ status: 0, data: null, error }`. `responseFunction` boleh `null` kalau Anda memakai `await` (lihat [Gaya `await`](#gaya-await)).

#### Contoh Penggunaan

**Tanpa Token (Public API):**

```javascript
import { getJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/api.js';

// Ambil data dari API publik
getJSON(
  'https://api.example.com/users',
  function(response) {
    console.log('Status:', response.status); // 200
    console.log('Data:', response.data);     // [{id: 1, name: "Andi"}, ...]

    if (response.status === 200) {
      // Proses data berhasil
      response.data.forEach(user => {
        console.log(user.name);
      });
    }
  }
);
```

**Dengan Token Autentikasi:**

```javascript
import { getJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/api.js';
import { getCookie } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/cookie.js';

// Ambil token dari cookie
const token = getCookie('user_token');

// Request ke API yang membutuhkan autentikasi
getJSON(
  'https://api.example.com/profile',
  function(response) {
    if (response.status === 200) {
      document.getElementById('nama').innerText = response.data.name;
      document.getElementById('email').innerText = response.data.email;
    } else if (response.status === 401) {
      console.log('Token tidak valid, silakan login ulang.');
    }
  },
  'Authorization',
  'Bearer ' + token
);
```

---

### 1.2 `postJSON()`

Melakukan **HTTP POST** request ke URL yang ditentukan dengan mengirimkan data dalam format JSON pada body request. Digunakan untuk **membuat data baru** di server (Create).

#### Signature

```javascript
postJSON(target_url, datajson, responseFunction, tokenkey?, tokenvalue?)
```

#### Parameter

| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|:-----:|-----------|
| `target_url` | `string` | ✅ | URL tujuan HTTP POST request |
| `datajson` | `object` | ✅ | Objek JavaScript yang akan dikirim sebagai body JSON |
| `responseFunction` | `function` | ✅ | Callback function yang menerima objek `{ status, data }` |
| `tokenkey` | `string` | ❌ | Nama header untuk autentikasi |
| `tokenvalue` | `string` | ❌ | Nilai token autentikasi |

#### Return Value

`Promise<{ status, data, headers, error, cached }>` — hasil yang sama dengan yang dikirim ke `responseFunction`. Promise ini tidak pernah *reject*; kegagalan jaringan juga berupa `{ status: 0, data: null, error }`. `responseFunction` boleh `null` kalau Anda memakai `await` (lihat [Gaya `await`](#gaya-await)).

#### Contoh Penggunaan

**Membuat Data Baru (Tanpa Token):**

```javascript
import { postJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/api.js';

// Data yang akan dikirim ke server
const dataMahasiswa = {
  nama: 'Budi Santoso',
  nim: '1234567890',
  jurusan: 'Teknik Informatika'
};

postJSON(
  'https://api.example.com/mahasiswa',
  dataMahasiswa,
  function(response) {
    if (response.status === 201) {
      console.log('Mahasiswa berhasil ditambahkan!');
      console.log('ID baru:', response.data.id);
    } else if (response.status === 400) {
      console.log('Validasi gagal:', response.data.message);
    }
  }
);
```

**Dengan Token Autentikasi:**

```javascript
import { postJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/api.js';
import { getCookie } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/cookie.js';

const token = getCookie('user_token');

const dataPeminjaman = {
  ruangan_id: 'R-101',
  tanggal: '2026-03-15',
  jam_mulai: '08:00',
  jam_selesai: '10:00',
  keperluan: 'Rapat organisasi'
};

postJSON(
  'https://api.example.com/peminjaman',
  dataPeminjaman,
  function(response) {
    if (response.status === 201) {
      alert('Peminjaman berhasil diajukan!');
    } else {
      alert('Gagal: ' + response.data.message);
    }
  },
  'Login',
  token
);
```

---

### 1.3 `deleteJSON()`

Melakukan **HTTP DELETE** request ke URL yang ditentukan dengan mengirimkan data identifikasi dalam format JSON pada body request. Digunakan untuk **menghapus data** di server (Delete).

#### Signature

```javascript
deleteJSON(target_url, datajson, responseFunction, tokenkey?, tokenvalue?)
```

#### Parameter

| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|:-----:|-----------|
| `target_url` | `string` | ✅ | URL tujuan HTTP DELETE request |
| `datajson` | `object` | ✅ | Objek JavaScript berisi data identifikasi item yang akan dihapus |
| `responseFunction` | `function` | ✅ | Callback function yang menerima objek `{ status, data }` |
| `tokenkey` | `string` | ❌ | Nama header untuk autentikasi |
| `tokenvalue` | `string` | ❌ | Nilai token autentikasi |

#### Return Value

`Promise<{ status, data, headers, error, cached }>` — hasil yang sama dengan yang dikirim ke `responseFunction`. Promise ini tidak pernah *reject*; kegagalan jaringan juga berupa `{ status: 0, data: null, error }`. `responseFunction` boleh `null` kalau Anda memakai `await` (lihat [Gaya `await`](#gaya-await)).

#### Contoh Penggunaan

**Menghapus Data dengan Konfirmasi:**

```javascript
import { deleteJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/api.js';
import { getCookie } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/cookie.js';

const token = getCookie('user_token');

function hapusMahasiswa(mahasiswaId) {
  // Konfirmasi sebelum menghapus
  if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    return;
  }

  const dataHapus = {
    id: mahasiswaId
  };

  deleteJSON(
    'https://api.example.com/mahasiswa',
    dataHapus,
    function(response) {
      if (response.status === 200) {
        alert('Data berhasil dihapus!');
        // Refresh tampilan tabel
        location.reload();
      } else if (response.status === 404) {
        alert('Data tidak ditemukan.');
      } else if (response.status === 403) {
        alert('Anda tidak memiliki izin untuk menghapus data ini.');
      }
    },
    'Login',
    token
  );
}
```
## 1.4 `putJSON`

Sends a **PUT** request with a JSON body to the specified URL and passes the response (status + parsed data) to a callback function.

```javascript
putJSON(target_url, datajson, responseFunction, tokenkey?, tokenvalue?)
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target_url` | `string` | ✅ | The endpoint URL to send the PUT request to |
| `datajson` | `object` | ✅ | The JavaScript object to be sent as the JSON body |
| `responseFunction` | `function` | ✅ | Callback receiving `{ status, data }` from the response |
| `tokenkey` | `string` | ❌ | Header key name for authorization token (e.g. `"Authorization"`) |
| `tokenvalue` | `string` | ❌ | Header value for the token (e.g. `"Bearer abc123"`) |

**Response Callback Shape**

```javascript
responseFunction({ status: number, data: object })
```

**Example**

```javascript
import { putJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/api.js';

const payload = { name: "Alice", age: 30 };

putJSON(
  "https://api.example.com/users/1",
  payload,
  ({ status, data }) => {
    console.log("Status:", status); // e.g. 200
    console.log("Data:", data);     // parsed JSON response
  },
  "Authorization",
  "Bearer my-secret-token"
);
```

---

## 1.5  `insertHTML`

Fetches raw HTML from a URL and **injects it into a DOM element** by its `id`, then runs a callback function after rendering.

```javascript
insertHTML(target_url, id, runFunction, errorFunction?)
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target_url` | `string` | ✅ | The URL to fetch HTML content from |
| `id` | `string` | ✅ | The `id` of the DOM element where the HTML will be injected |
| `runFunction` | `function` | ✅ | Callback executed after the HTML has been inserted |
| `errorFunction` | `function` | ❌ | Called with an `Error` if the element doesn't exist, the server replies with a non-2xx status, the network fails, or the request times out (15s). On failure the element's content is left unchanged and `runFunction` is not called. |

**Example**

```javascript
import { insertHTML } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/api.js';

insertHTML(
  "https://example.com/partials/navbar.html",
  "navbar-container",
  () => {
    console.log("Navbar has been loaded and rendered!");
    // Initialize dropdown menus, event listeners, etc.
  }
);
```
---

## 1.6 `getDomHTML`

Fetches HTML from a URL and returns it as a **parsed DOM object** via a callback, allowing you to query and manipulate elements programmatically before rendering.

```javascript
getDomHTML(target_url, domFunction)
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target_url` | `string` | ✅ | The URL to fetch HTML content from |
| `domFunction` | `function` | ✅ | Callback receiving the parsed `Document` object |

**Example**

```javascript
import { getDomHTML } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/api.js';

getDomHTML(
  "https://example.com/partials/card.html",
  (htmlDom) => {
    const title = htmlDom.querySelector(".card-title");
    console.log("Card title:", title?.textContent);

    // You can then append or modify elements before inserting into the page
    document.getElementById("content").appendChild(
      document.importNode(htmlDom.body, true)
    );
  }
);
```


## Usage Examples

### Updating a resource with authentication

```javascript
import { putJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/api.js';

putJSON(
  "/api/products/42",
  { price: 99.99, stock: 150 },
  ({ status, data }) => {
    if (status === 200) {
      alert("Product updated successfully!");
    } else {
      console.error("Update failed:", data);
    }
  },
  "x-api-key",
  "your-api-key-here"
);
```

### Loading a page section dynamically

```javascript
import { insertHTML } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.29/api.js';

document.addEventListener("DOMContentLoaded", () => {
  insertHTML("/components/footer.html", "footer", () => {
    console.log("Footer loaded.");
  });
});
```

---

 Dokumentasi Upload File - api.js

Dokumentasi ini menjelaskan fungsi-fungsi upload file yang tersedia di `api.js`
menggunakan `fetch()` dan `FormData`.

---

# 📌 PERILAKU SAAT GAGAL

Source code lengkap ada di [`api.js`](https://github.com/crootjs/lib/blob/main/api.js) — sengaja tidak disalin ke sini supaya tidak basi saat kodenya berubah.

Semua fungsi upload **selalu** memanggil `responseFunction`, termasuk saat request gagal, dan membatalkan request otomatis setelah 15 detik kalau server tidak merespons:

| Fungsi | Sukses | Body bukan JSON | Jaringan gagal / timeout |
|---|---|---|---|
| `postFile`, `postFileWithHeader` | body JSON yang sudah di-parse | `null` | `null` |
| `postFileJSON` | `{ status, data }` | `{ status, data: null }` | `{ status: 0, data: null }` |

---

# 📌 PENJELASAN FUNGSI

## 1️⃣ postFile()

Digunakan untuk upload file tanpa header tambahan.

### Parameter:
- `target_url` → endpoint backend
- `id` → id input file di HTML
- `formdataname` → nama field file di backend
- `responseFunction` → callback untuk menerima response

### Contoh penggunaan:

```javascript
postFile(
    "https://example.com/upload",
    "fileInput",
    "file",
    function(response){
        console.log(response);
    }
);
```

---

## 2️⃣ postFileWithHeader()

Digunakan untuk upload file dengan header (biasanya token authentication).

### Parameter tambahan:
- `tokenkey` → contoh: "Authorization"
- `tokenvalue` → contoh: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

### Contoh penggunaan:

```javascript
postFileWithHeader(
    "https://example.com/upload",
    "Authorization",
    "Bearer TOKEN_KAMU",
    "fileInput",
    "file",
    function(response){
        console.log(response);
    }
);
```

---

## 3️⃣ postFileJSON()

Digunakan untuk upload file dan mengembalikan:
- HTTP Status Code
- Data JSON

### Contoh response handler:

```javascript
function responseHandler(response) {
    console.log("HTTP Status:", response.status);
    console.log("Response Data:", response.data);
}
```

---

# ⚠️ CATATAN PENTING

- Pastikan `formdataname` sama dengan nama field di backend.
- Input HTML harus memiliki `type="file"`.
- Jangan set `Content-Type` manual jika menggunakan `FormData`.

Contoh HTML:

```html
<input type="file" id="fileInput">
```