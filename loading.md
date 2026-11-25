# Dokumentasi Modul `loading.js`

*[English](en/loading)*

`loading.js` tidak berisi fungsi. Modul ini mengekspor satu konstanta, `loading`, yaitu string HTML berisi sebuah `<svg>` animasi *spinner* (8 titik berwarna yang berputar mengelilingi pusat). Tempelkan string itu ke elemen mana pun selama proses asinkron berjalan, lalu ganti dengan konten aslinya setelah selesai.

## Cara Penggunaan (Import)

```javascript
import { loading } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/loading.js";
```

## `loading`

| Properti SVG | Nilai |
|---|---|
| `id` | `loading` |
| `class` | `lds-microsoft` |
| `width` × `height` | `80px` × `80px` |
| `viewBox` | `0 0 100 100` |
| Warna titik | `#e15b64`, `#f47e60`, `#f8b26a`, `#abbd81`, `#849b87` |

Animasinya memakai `<animateTransform>` (SMIL) di dalam SVG: rotasi satu putaran setiap 1,5 detik dengan `calcMode="spline"`, berulang terus. Tidak perlu CSS atau file gambar tambahan.

```javascript
import { loading } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/loading.js";
import { setInner } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/element.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/api.js";

setInner("daftar-produk", loading);

const { status, data } = await getJSON("https://api.example.com/produk", null);
setInner("daftar-produk", status === 200 ? `${data.length} produk` : "Gagal memuat data");
```

## Catatan

- Karena `id="loading"` tertulis tetap di string, memasang spinner di dua tempat sekaligus menghasilkan ID ganda di halaman. Pilih elemen lewat class `lds-microsoft` jika perlu menata atau menghapusnya.
- Ukuran 80px ditulis sebagai atribut `width`/`height`; aturan CSS pada `.lds-microsoft` bisa menimpanya.
- Spinner yang hanya berupa gambar tidak terbaca oleh pembaca layar. Tambahkan teks status, misalnya di elemen dengan `aria-live="polite"`, jika pengguna perlu tahu bahwa data sedang dimuat.
