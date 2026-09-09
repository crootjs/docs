# Dokumentasi Modul `mongo.js`

`mongo.js` adalah modul kecil untuk lingkungan **browser** yang membantu bekerja dengan MongoDB `ObjectId` di sisi client — tanpa perlu MongoDB driver dan tanpa koneksi database sama sekali. Modul ini murni fungsi utilitas string/date.

---

## Cara Penggunaan (Import)

```javascript
import { generateObjectId, getDateFromObjectId } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.5/mongo.js";
```

## Daftar Fungsi

### `generateObjectId()`

Membuat string 24-karakter yang menyerupai format MongoDB `ObjectId` (4 byte timestamp + 12 hex karakter acak), langsung di browser, tanpa perlu memanggil server atau library `mongodb`.

**Contoh Penggunaan:**

```javascript
import { generateObjectId } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.5/mongo.js";

const id = generateObjectId();
console.log(id); // contoh: "65f1a2b3c4d5e6f708192a3b"
```

### `getDateFromObjectId(stringID)`

Mengambil kembali waktu pembuatan (timestamp) yang tertanam di 8 karakter pertama sebuah `ObjectId`, dan mengembalikannya sebagai objek `Date`.

**Parameter:**
- `stringID` (`string`) — string ObjectId (24 karakter hex, atau minimal 8 karakter pertama).

**Contoh Penggunaan:**

```javascript
import { getDateFromObjectId } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.5/mongo.js";

const tanggalDibuat = getDateFromObjectId("65f1a2b3c4d5e6f708192a3b");
console.log(tanggalDibuat); // Date object sesuai 8 karakter pertama ObjectId
```

## Catatan

- Modul ini **tidak** membuka koneksi ke MongoDB — hanya menghasilkan/membaca string yang kompatibel dengan format `ObjectId` MongoDB, cocok dipakai di frontend untuk generate ID sementara sebelum data dikirim ke backend.
- Untuk koneksi MongoDB sesungguhnya (driver `mongodb`, `MongoClient`, dll), itu adalah kode **server-side (Node.js)** dan berada di luar cakupan `crootjs/lib`, bukan di modul ini.
