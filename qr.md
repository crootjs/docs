# Dokumentasi Modul `qr.js`

*[English](en/qr)*

`qr.js` membuat kode QR sebagai SVG, ditulis sendiri tanpa library lain (sekitar 6 KB setelah diperkecil, 3 KB gzip). Teks apa pun (URL, teks dengan huruf non-Latin, emoji) dikodekan sebagai byte UTF-8, dan ukuran QR (versi 1–40) dipilih otomatis: yang terkecil yang masih muat. Hasilnya satu elemen `<svg>` dengan satu `<path>`, jadi tetap tajam di ukuran berapa pun dan ringan untuk dicetak.

## Cara Penggunaan (Import)

```javascript
import { renderQR, qrSVG, qrMatrix } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.35/qr.js";
```

## Contoh

```html
<div id="qr" class="qr"></div>
```

```css
.qr svg { width: 12rem; }
```

```javascript
import { renderQR } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.35/qr.min.js";

renderQR("qr", "https://croot.js.org", { label: "Kode QR ke croot.js.org" });
```

Ukuran QR di layar diatur lewat CSS (`width` pada `svg`); SVG-nya tidak punya ukuran tetap.

## Daftar Fungsi

### `renderQR(id, text, options?)`

Mengganti isi elemen ber-`id` dengan kode QR, lalu mengembalikan elemen `<svg>`-nya.

### `qrSVG(text, options?)`

Mengembalikan kode QR sebagai teks SVG, misalnya untuk disimpan sebagai berkas:

```javascript
const blob = new Blob([qrSVG(alamat)], { type: "image/svg+xml" });
```

### `qrMatrix(text, options?)`

Mengembalikan matriks modul tanpa margin: array baris, setiap baris array `true` (gelap) / `false` (terang). Berguna untuk menggambar sendiri, misalnya ke `<canvas>`.

## Opsi

| Opsi | Bawaan | Keterangan |
|---|---|---|
| `ecc` | `"M"` | Tingkat koreksi kesalahan: `"L"` (±7% QR boleh rusak), `"M"` (±15%), `"Q"` (±25%), `"H"` (±30%). Makin tinggi, makin tahan coretan atau logo di tengah, tapi QR makin rapat. |
| `margin` | `4` | Zona kosong di sekeliling QR, dalam modul. Standar meminta 4; sebagian pemindai gagal kalau terlalu sempit. (Hanya `qrSVG`/`renderQR`.) |
| `color` | `"#000"` | Warna modul gelap. |
| `background` | `"#fff"` | Warna latar; `"transparent"` tanpa latar. Pemindai butuh kontras tinggi, dan QR terbalik (terang di atas gelap) tidak terbaca semua pemindai, jadi di mode gelap pun sebaiknya tetap hitam di atas putih. |
| `label` | teks QR | Teks `aria-label` untuk pembaca layar. Ganti dengan keterangan singkat kalau isi QR panjang atau tidak bermakna dibacakan. |

## Batas

- Teks terlalu panjang untuk satu QR (lebih dari 2953 byte UTF-8 di tingkat `"L"`, 1273 byte di `"H"`) melempar `RangeError`. `ecc` selain L/M/Q/H juga melempar `RangeError`.
- Hanya mode byte: teks yang seluruhnya angka atau huruf besar tidak dimampatkan ke mode numerik/alfanumerik, jadi QR-nya bisa satu-dua versi lebih besar dari yang paling minimal. Semua pemindai tetap membacanya.
- Tidak ada pembaca/pemindai QR; modul ini hanya membuat.

Hasilnya diuji sama persis dengan encoder lain (python-qrcode) pada contoh ukuran dari versi 1 sampai 40, di keempat tingkat koreksi.
