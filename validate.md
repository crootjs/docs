# Dokumentasi Modul `validate.js`

*[English](en/validate)*

`validate.js` merapikan isi `<input>` saat pengguna mengetik: mengubah huruf besar/kecil, membuang karakter yang tidak diizinkan, mengubah nomor telepon lokal ke format `62`, dan memformat angka menjadi Rupiah. Fungsinya tidak menolak input dan tidak menampilkan pesan error — nilai `input.value` langsung ditimpa dengan hasil yang sudah dibersihkan. Untuk validasi form dengan pesan error per field, pakai [`form.js`](form).

Setiap fungsi menerima **elemen input** (bukan ID) dan tidak mengembalikan nilai. Karena itu fungsi-fungsi ini pas dipasang dengan `onInput` dari [`element.js`](element/), yang memanggil fungsinya dengan `event.target`.

## Cara Penggunaan (Import)

```javascript
import { validateUserName, validateHouseNumber, validatePhoneNumber, formatRupiah } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.37/validate.js";
```

## `validateUserName(input)`

Berurutan: mengubah ke huruf kecil, menghapus semua spasi, lalu menghapus semua karakter selain `a-z`, `0-9`, `_`, dan `-`.

| Diketik | Hasil |
|---|---|
| `Budi Santoso` | `budisantoso` |
| `user.name@01` | `username01` |
| `Andi_Pratama-2` | `andi_pratama-2` |

## `validateHouseNumber(input)`

Mengubah ke huruf besar, lalu menghapus semua karakter selain `A-Z` dan `0-9` — termasuk spasi, `_`, `-`, `/`, dan titik.

| Diketik | Hasil |
|---|---|
| `12a` | `12A` |
| `Blok C-7` | `BLOKC7` |
| `No. 5/B` | `NO5B` |

## `validatePhoneNumber(input)`

Menghapus semua karakter selain angka. Jika hasilnya lebih dari satu digit dan diawali `0`, angka `0` itu diganti `62`.

| Diketik | Hasil |
|---|---|
| `0812-3456-7890` | `6281234567890` |
| `+62 812 3456 7890` | `6281234567890` |
| `0` | `0` (satu digit belum diubah) |

Fungsi ini tidak memeriksa panjang nomor. Fungsi internal di [`stp.js`](stp) yang mewajibkan `62` diikuti 9–15 digit bukan fungsi ini dan tidak diekspor.

## `formatRupiah(input)`

Menghapus semua karakter selain angka dan koma, lalu menampilkan hasilnya dengan awalan `Rp. ` dan titik sebagai pemisah ribuan. Koma dipakai sebagai pemisah desimal; angka setelah koma tidak diformat.

Nilai tanpa format (angka dan koma saja) disimpan di atribut `data-value` elemen input, sebagai string.

| Diketik | `input.value` | `data-value` |
|---|---|---|
| `1500000` | `Rp. 1.500.000` | `1500000` |
| `2500,50` | `Rp. 2.500,50` | `2500,50` |

Awalan `Rp. ` ikut terhapus saat fungsi dipanggil lagi, jadi aman dipasang di event `input`. Untuk dihitung, ubah dulu `data-value` menjadi angka; kalau ada koma, ganti dengan titik sebelum `Number()`.

## Contoh

```html
<label for="uname">Username</label>
<input type="text" id="uname">

<label for="telepon">Nomor WhatsApp</label>
<input type="tel" id="telepon">

<label for="harga">Harga</label>
<input type="text" id="harga" inputmode="numeric">

<script type="module" src="script.js"></script>
```

```javascript
// script.js
import { validateUserName, validatePhoneNumber, formatRupiah } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.37/validate.js";
import { onInput } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.37/element.js";

onInput("uname", validateUserName);
onInput("telepon", validatePhoneNumber);
onInput("harga", (input) => {
    formatRupiah(input);
    const harga = Number(input.getAttribute("data-value").replace(",", "."));
    console.log(harga); // 1500000 untuk "Rp. 1.500.000"
});
```

## Catatan

- Karena `input.value` ditimpa, kursor teks biasanya pindah ke akhir isi input setiap kali nilainya berubah.
- Membersihkan input di browser hanya untuk kenyamanan pengguna. Backend tetap harus memvalidasi data yang diterima.
