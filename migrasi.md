# Dari JSCroot ke CrootJS

*[English](en/migrasi)*

CrootJS adalah penerus **JSCroot**. Modulnya sama asalnya (`jscroot/lib`), lalu dikembangkan di `crootjs/lib`. Situs lama (jscroot.github.io dan repo-repo jscroot) sekarang mengalihkan ke croot.js.org. File `.js` lama di jsDelivr tetap ada dan tidak diubah, jadi proyek yang masih memakai JSCroot tidak tiba-tiba rusak. Hanya saja, versi lama itu tidak mendapat perbaikan lagi.

## Langkah pindah

1. Ganti alamat impor. Nomor versi CrootJS dimulai ulang dari `0.0.x`, jadi `crootjs/lib@0.0.42` **lebih baru** daripada `jscroot/lib@0.2.8`.

   ```javascript
   // sebelum
   import { getJSON } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.8/api.js";
   // sesudah
   import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/api.min.js";
   ```

   Selalu patok versi (`@0.0.33`). Alamat tanpa versi (`jscroot/lib/api.js`, yang dipakai sebagian contoh lama) bisa berubah sewaktu-waktu. Untuk produksi pakai `.min.js`.
2. Kalau kode Anda berasal dari JSCroot **0.2.0 atau lebih lama**, sesuaikan urutan argumen dan fungsi yang sudah dihapus (tabel di bawah).
3. Uji halamannya, termasuk saat server mati atau internet putus: perilaku kegagalan jaringan sudah berubah (lihat bagian terakhir).

Kode dari JSCroot 0.2.1–0.2.8 umumnya langsung jalan setelah langkah 1: semua fungsi yang ada di 0.2.8 masih ada di CrootJS dengan urutan argumen yang sama. Beberapa hanya mendapat parameter opsional tambahan di belakang.

## Urutan argumen `api.js` (JSCroot 0.2.0 ke bawah)

Sejak JSCroot 0.2.1, callback ditaruh sebelum token:

| JSCroot ≤ 0.2.0 | CrootJS |
|---|---|
| `getJSON(url, tokenkey, tokenvalue, fn)` | `getJSON(url, fn, tokenkey, tokenvalue)` |
| `postJSON(url, tokenkey, tokenvalue, data, fn)` | `postJSON(url, data, fn, tokenkey, tokenvalue)` |
| `putJSON(url, tokenkey, tokenvalue, data, fn)` | `putJSON(url, data, fn, tokenkey, tokenvalue)` |
| `deleteJSON(url, tokenkey, tokenvalue, data, fn)` | `deleteJSON(url, data, fn, tokenkey, tokenvalue)` |

`fn` tetap menerima `{ status, data }`.

## Fungsi yang dihapus dan penggantinya

| JSCroot | Terakhir ada di | Pengganti di CrootJS |
|---|---|---|
| `get(url, fn)` (`fn` menerima JSON-nya langsung) | 0.2.0 | `getJSON(url, result => fn(result.data))` |
| `getWithHeader(url, key, value, fn)` | 0.2.0 | `getJSON(url, result => fn(result.data), key, value)` |
| `postWithBearer(url, token, data, fn)` | 0.2.0 | `postJSON(url, data, result => fn(result.data), "Authorization", "Bearer " + token)` |
| `addCSSIn(href, id)` | 0.1.3 | `addCSSInHead(href)` atau `addCSS(href)` (tidak dimuat dua kali). Stylesheet tidak perlu berada di dalam elemen tertentu. |
| `addScriptInBody(src)` | 0.1.3 | `addJSInHead(src)` atau `addJS(src)`. Keduanya mengembalikan Promise yang selesai saat skrip termuat. |
| `addScriptInHead(src)` | 0.1.4 | `addJSInHead(src)` (nama baru, perilaku sama) |

Semua pengganti di atas ada di [api.js](api/) dan [element.js](element/).

## Perilaku yang berubah

- **Kegagalan jaringan tidak lagi diam.** Di JSCroot, request yang gagal hanya ditulis ke console dan callback tidak pernah dipanggil, sehingga halaman menunggu selamanya. Di CrootJS callback **selalu** dipanggil: server mati, internet putus, atau batas waktu habis menghasilkan `status: 0` dengan `error` = `"offline"`, `"network"`, atau `"timeout"`. Tangani `status === 0`, misalnya dengan pesan "periksa koneksi". Fungsi-fungsi itu juga mengembalikan Promise yang tidak pernah *reject*, jadi bisa dipakai dengan `await`.
- **Jawaban yang bukan JSON** tidak lagi membuat error di console. `data` berisi `null`, dan `status` tetap kode dari server.
- `openWebSocketSetId(id, url, onMessage?)` dan `connectws(id, url, onMessage?)` mendapat parameter `onMessage` opsional. `openWebSocketSetId` berbasis Promise, jadi tidak mengembalikan `WebSocket` secara langsung.
- `insertHTML(url, id, fn, errorFn?)` dan `renderHTML(id, url, callback?, errorCallback?)` mendapat callback kesalahan opsional.

## Yang baru sejak JSCroot

Di luar modul lama, CrootJS menambah antara lain: peta tanpa Leaflet ([map.js](map) dan modul tambahannya), penampil 3D tanpa Three.js ([model3d.js](model3d)), validasi form ([form.js](form)), unggah/unduh berkas dengan progres ([api.js](api/)), kode QR ([qr.js](qr)), notifikasi ([toast.js](toast)), dan framework CSS kecil ([croot.css](css)). Daftar lengkapnya di [halaman utama docs](./) dan perubahan per versi di [CHANGELOG](https://github.com/crootjs/lib/blob/main/CHANGELOG.md).

Aturan penulisan kodenya juga lebih ketat: HTML, CSS, dan JS dipisah, tanpa `onclick` atau `style=""` ([konvensi](conventions)).
