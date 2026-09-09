# Dokumentasi Modul `validate.js`
`validate.js` dalam library croot.js berfungsi sebagai input transformer. Berbeda dengan validasi biasa yang hanya memberikan pesan error, modul ini secara aktif memanipulasi input pengguna agar sesuai dengan standar format database (seperti memaksa huruf kecil, menghapus spasi, atau memformat mata uang).

# Cara Penggunaan (Import)
import fungsi dari CDN jsDelivr ke dalam file JavaScript kamu yang bertipe `module`.

```javascript
import { validateUserName, formatRupiah } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.5/validate.js";
```

# Daftar Fungsi
### `validateUserName(input)`
Fungsi ini memastikan username seragam dan bersih dari karakter aneh.
* **Aksi**: Mengubah ke huruf kecil, menghapus spasi, dan hanya mengizinkan huruf, angka, `_`, serta `-`.
* **Kegunaan**: Sangat penting untuk URL profil atau sistem login agar tidak ada duplikasi karena perbedaan huruf kapital.

### `validatePhoneNumber(input)`
Fungsi ini melakukan otomatisasi konversi nomor telepon lokal ke format internasional.
* **Aksi**: Menghapus semua karakter non-angka. Jika user mengetik `0812...`, otomatis diubah menjadi `62812...`.
* **Kegunaan**: Menstandarisasi data untuk integrasi API WhatsApp atau SMS Gateway.

### `formatRupiah(input)`
Fungsi yang paling kompleks dalam modul ini, digunakan untuk memformat angka menjadi format mata uang Rupiah secara real-time.
* **Fitur Unggul**: Menambahkan `Rp.` dan pemisah ribuan (titik).
* Menyimpan nilai asli (tanpa titik/Rp) di atribut data-value agar mudah dihitung secara matematis.

# Contoh Implementasi
Berikut adalah cara menerapkannya pada elemen HTML menggunakan Event Listener:

### HTML

 ```html
<label>Username:</label>
<input type="text" id="uname" oninput="validateUserName(this)">

<label>Harga Barang:</label>
<input type="text" id="harga" oninput="formatRupiah(this)">
```
### JavaScript

```javascript
import { validateUserName, formatRupiah } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.5/validate.js";
```

# Kesimpulan
Modul `validate.js` di croot.js bukan sekadar pengecek data, tapi merupakan alat Sanitasi Data. Hal ini membuat aplikasi lebih aman dari serangan injection dan memastikan data di database selalu konsisten.