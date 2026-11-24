# Dokumentasi API dengan `openapi.js`

*[English](en/openapi)*

`openapi.js` menampilkan dokumentasi API dari berkas OpenAPI 3.0 atau 3.1 (`openapi.yaml` atau `openapi.json`), pengganti Swagger UI yang ditulis sendiri. Setiap operasi menampilkan parameter, body, respons, dan skemanya, lengkap dengan **kode CrootJS** untuk memanggilnya (`getJSON`, `postJSON`, `putJSON`, `deleteJSON`, `uploadFile` dari [api.js](api/)). Operasinya juga bisa dicoba langsung dari halaman.

Ukurannya sekitar 11 KB gzip. Swagger UI sekitar 464 KB gzip (JS dan CSS). Pengurai YAML (`yaml.js`, sekitar 3 KB) dan Markdown untuk deskripsi ([markdown.js](markdown), sekitar 6 KB) baru diunduh kalau dibutuhkan.

## Cara Penggunaan (Import)

```javascript
import { renderOpenAPI, loadOpenAPI, openAPIExample } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/openapi.js";
import { parseYAML } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/yaml.js";
```

## Halaman dokumentasi di GitHub Pages

Empat berkas dalam satu folder, misalnya `docs-api/` di repo GitHub Pages backend Anda:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dokumentasi API Catatan</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/croot.min.css">
  <link rel="stylesheet" href="style.css">
  <script type="module" src="index.js"></script>
</head>
<body>
  <main>
    <div id="dokumentasi"></div>
  </main>
</body>
</html>
```

```javascript
// index.js
import { renderOpenAPI } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/openapi.min.js";

renderOpenAPI("dokumentasi", "./openapi.yaml");
```

```css
/* style.css */
main { max-width: 64rem; margin: 0 auto; padding: 1rem; }
```

Berkas keempat adalah `openapi.yaml` (lihat bagian berikut). Tanpa croot.css pun tampilannya tetap rapi; dengan croot.css warnanya mengikuti tema dan mode gelap.

## Menulis `openapi.yaml`

Spesifikasi bisa ditulis tangan, dibuat dari kode backend (banyak framework punya generatornya), atau diminta ke AI dari daftar endpoint. Supaya halamannya berguna:

- **Isi `servers`** dengan URL backend. Kalau lebih dari satu (mis. produksi dan pengembangan), pembaca bisa memilihnya.
- **Beri setiap operasi `operationId`, `summary`, dan `tags`.** Tag mengelompokkan operasi. `operationId` menjadi alamat tautan (`#listNotes`), jadi satu operasi bisa ditautkan langsung.
- **Taruh skema di `components.schemas`** dan rujuk dengan `$ref`, supaya tidak ditulis berulang.
- **Tambahkan `example`** di skema atau media type. Tanpa itu, contoh dibuat otomatis dari tipe dan formatnya (`"string"`, `0`, `"user@example.com"` untuk `format: email`), yang benar bentuknya tapi kurang bermakna.
- **Deklarasikan login di `components.securitySchemes`** (`bearer` atau `apiKey`). Halaman lalu menyediakan isian token untuk "Coba", dan kode CrootJS-nya ikut mengirim header itu.
- **Deskripsi boleh Markdown** (`description`). HTML mentah di dalamnya ditampilkan sebagai teks, tidak dijalankan.

```yaml
openapi: 3.0.3
info:
  title: API Catatan
  version: 1.0.0
servers:
  - url: https://api.example.com
paths:
  /notes:
    get:
      tags: [notes]
      operationId: listNotes
      summary: Daftar catatan
      responses:
        "200":
          description: Semua catatan
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Note"
components:
  schemas:
    Note:
      type: object
      required: [title]
      properties:
        id: { type: string, readOnly: true, example: 64f1a2b3c4d5e6f708192a3b }
        title: { type: string, example: Beli sayur }
        done: { type: boolean, example: false }
```

Swagger 2.0 (`swagger: "2.0"`) tidak didukung. Ubah dulu ke OpenAPI 3, misalnya di converter.swagger.io.

## Kode CrootJS untuk setiap operasi

Setiap operasi menampilkan kode yang siap disalin ke frontend:

| Operasi | Kode |
|---|---|
| `GET` | `getJSON(url, responseFunction)` |
| `POST`, `PUT` dengan body JSON | `postJSON(url, body, responseFunction)` / `putJSON(...)` |
| `DELETE` | `deleteJSON(url, body, responseFunction)` (`undefined` kalau tanpa body) |
| `POST`, `PUT` dengan `multipart/form-data` | `uploadFile(url, "file", responseFunction, { field })` |
| `PATCH`, metode lain, body bukan JSON | `fetch` biasa, dengan komentar alasannya |

Parameter path menjadi variabel (`${id}`), parameter query dirangkai dengan `URLSearchParams`, dan login bearer/apiKey dikirim lewat opsi `{ headers }`. Kalau `openapi.js` dimuat dari jsDelivr, alamat impor `api.js` di kode itu memakai versi dan akhiran (`.min.js`) yang sama.

## "Coba" dan CORS

Tombol **Kirim** mengirim permintaan sungguhan dari browser ke server di `servers`, lalu menampilkan status, lama, header, dan body jawabannya. Token yang diisi hanya disimpan di memori halaman, tidak di localStorage.

Karena permintaannya datang dari halaman dokumentasi (mis. `https://akun.github.io`), server harus mengizinkan origin itu lewat `Access-Control-Allow-Origin`. Kalau tidak, browser memblokirnya dan halaman menampilkan pesan soal CORS. Matikan dengan `tryIt: false` kalau server memang tidak boleh dipanggil dari halaman dokumentasi.

## Daftar Fungsi

### `renderOpenAPI(id, source, options?)`

Mengganti isi elemen ber-`id` dengan dokumentasi API. `source` adalah URL berkas spesifikasi (JSON atau YAML) atau object spesifikasi yang sudah jadi.

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `tryIt` | `true` | Tampilkan form "Coba" di setiap operasi |
| `snippets` | `true` | Tampilkan kode CrootJS di setiap operasi |
| `server` | — | URL dasar pengganti `servers` di spesifikasi, mis. server lokal saat pengembangan |
| `expand` | `false` | Buka semua operasi sejak awal |
| `timeout` | `15000` | Batas waktu (ms) untuk memuat spesifikasi dan untuk "Coba" |
| `texts` | teks Indonesia | Teks tampilan, mis. `{ send: "Send", tryIt: "Try it" }`. Daftar lengkapnya di awal `openapi.js` (`TEXTS`); beberapa berupa fungsi, mis. `status: (status, ms) => ...` |
| `onError` | — | `onError(hasil)` kalau spesifikasi gagal dimuat; `hasil` sama dengan `loadOpenAPI` |

Mengembalikan Promise berisi `{ spec, element, remove() }`, atau `null` kalau elemen tidak ada atau spesifikasi gagal dimuat (pesannya tampil di dalam elemen). Promise-nya tidak pernah *reject*. `remove()` membatalkan permintaan "Coba" yang masih berjalan dan menghapus tampilannya.

Saring operasi berdasarkan path, ringkasan, atau `operationId` lewat kolom di atas daftar. Isi operasi baru dibuat saat pertama dibuka, jadi spesifikasi besar tetap cepat tampil. Membuka operasi memperbarui alamat (`#operationId`), dan membuka halaman dengan alamat itu langsung membuka operasinya.

### `loadOpenAPI(source, options?)`

Mengambil dan memeriksa spesifikasi tanpa menampilkannya. Promise berisi `{ spec, error, message }` dan tidak pernah *reject*. `error` adalah `null`, atau `"network"`, `"timeout"`, `"http"`, `"parse"`, `"swagger2"`, `"version"`, dengan `message` yang bisa ditampilkan. Opsi: `texts`, `timeout`.

```javascript
const { spec, error, message } = await loadOpenAPI("./openapi.yaml");
if (error) console.warn(message);
else console.log(Object.keys(spec.paths));
```

### `openAPIExample(schema, spec?, direction?)`

Membuat contoh nilai dari sebuah skema: `example`, `default`, atau `enum` pertama kalau ada, selain itu dibuat dari tipe dan formatnya. `$ref` dicari di `spec`. `direction` `"response"` (bawaan) melewatkan properti `readOnly`; `"request"` melewatkan `writeOnly`.

```javascript
openAPIExample({ $ref: "#/components/schemas/Note" }, spec, "request"); // { title: "Beli sayur", done: false }
```

## Yang didukung

- OpenAPI 3.0 dan 3.1, JSON atau YAML.
- `$ref` lokal (`#/components/...`), termasuk skema yang merujuk dirinya sendiri (ditampilkan sebagai `↻ Nama`). `allOf` digabung; `oneOf` dan `anyOf` ditampilkan sebagai pilihan.
- Login: HTTP bearer, OAuth2 dan OpenID Connect (dikirim sebagai bearer), apiKey di header atau query.

Belum didukung: `$ref` ke berkas lain (ditampilkan sebagai "`$ref` tidak ditemukan"), `servers` per path atau per operasi, `webhooks` (3.1), login HTTP basic, dan apiKey di cookie. Operasi dengan beberapa tag hanya muncul di tag pertamanya.

## `yaml.js`: `parseYAML(text)`

Pengurai YAML kecil yang dipakai `openapi.js`, bisa juga dipakai sendiri untuk berkas konfigurasi. Mengubah teks YAML menjadi nilai JavaScript, atau melempar `SyntaxError` dengan nomor baris (juga di `error.line`).

```javascript
import { parseYAML } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/yaml.min.js";

parseYAML("nama: Sari\nhobi: [baca, lari]"); // { nama: "Sari", hobi: ["baca", "lari"] }
```

Didukung: mapping dan sequence blok, skalar polos dan berkutip, skalar blok `|` dan `>`, koleksi flow `[...]` dan `{...}`, komentar, satu dokumen, anchor `&a` dan alias `*a`, dan tag inti `!!str` dan kawan-kawannya. Ditolak dengan pesan yang jelas: kunci merge `<<`, tag lain, kunci kompleks `?`, lebih dari satu dokumen, kunci ganda, dan tab sebagai indentasi.

## Dari Swagger UI

Ganti tag `<script>` dan `<link>` swagger-ui-dist dengan satu impor `openapi.js`, dan panggilan `SwaggerUIBundle({ url, dom_id })` dengan `renderOpenAPI(id, url)`. Berkas `openapi.yaml`-nya tetap sama.

## Untuk AI

Minta AI (Claude, ChatGPT, dan sejenisnya) membaca https://croot.js.org/llms.txt lebih dulu. Contoh perintah:

- "Tulis `openapi.yaml` (OpenAPI 3.0) untuk endpoint backend ini, dengan `operationId`, `tags`, `example`, dan `securitySchemes` bearer."
- "Buat halaman dokumentasi API dengan `renderOpenAPI` dari CrootJS untuk `openapi.yaml` ini, ikuti konvensi CrootJS."
- "Dari `openapi.yaml` ini, tulis fungsi frontend dengan `api.js` CrootJS untuk setiap `operationId`."

Contoh lengkap yang tayang: [examples/api/openapi](https://croot.js.org/examples/api/openapi/).
