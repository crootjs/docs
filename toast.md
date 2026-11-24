# Dokumentasi Modul `toast.js`

*[English](en/toast)*

`toast.js` menampilkan notifikasi singkat (*toast*) di pojok kanan atas layar, tanpa dependency eksternal. CSS-nya disisipkan oleh modul ini sendiri saat toast pertama muncul, jadi cukup import satu file ini.

## Cara Penggunaan (Import)

```javascript
import { toast, toastSuccess, toastError, toastWarning, toastInfo } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.36/toast.js";
```

## `toast(message, type = "info", duration = 3000)`

Menampilkan satu toast. Toast baru ditumpuk di bawah toast yang masih tampil.

| Parameter | Bawaan | Keterangan |
|---|---|---|
| `message` | — | Teks pesan. Dipasang sebagai `textContent`, jadi tag HTML tampil apa adanya, tidak dijalankan |
| `type` | `"info"` | `"info"` (biru), `"success"` (hijau), `"error"` (merah), `"warning"` (kuning tua). Nilai lain tidak punya warna latar |
| `duration` | `3000` | Lama tampil dalam milidetik. `0` (atau negatif) berarti tidak hilang sendiri |

Mengembalikan function `dismiss()` untuk menutup toast itu kapan saja, juga sebelum `duration` habis. Memanggilnya lebih dari sekali tidak berpengaruh.

```javascript
toast("Data tersimpan");                // info, hilang setelah 3 detik
toast("Profil diperbarui", "success", 2000);
toast("Gagal mengirim data", "error");
```

## `toastSuccess(message, duration)`, `toastError(message, duration)`, `toastWarning(message, duration)`, `toastInfo(message, duration)`

Sama dengan `toast()` dengan `type` yang sudah ditentukan. `duration` opsional (bawaan 3000 ms), dan nilai kembaliannya juga `dismiss()`.

```javascript
toastSuccess("Berhasil disimpan");
toastError("Terjadi kesalahan, coba lagi.");
toastWarning("Koneksi lambat");
toastInfo("Memuat data");
```

### Contoh: toast yang ditutup manual

Untuk proses yang lamanya tidak bisa ditebak, misalnya unggahan, pakai `duration` `0` lalu tutup sendiri setelah selesai:

```javascript
import { toastInfo, toastSuccess, toastError } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.36/toast.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.36/api.js";

const tutup = toastInfo("Mengirim...", 0);
const { status } = await postJSON("https://api.example.com/laporan", { judul: "Jalan rusak" }, null);
tutup();

if (status === 200) {
    toastSuccess("Laporan terkirim");
} else {
    toastError("Gagal mengirim laporan");
}
```

## Catatan

- Style toast disisipkan sekali sebagai `<style id="crootjs-toast-style">` di awal `<head>`, dan wadahnya `<div id="crootjs-toast-container">` di akhir `<body>`. Ini bagian dari cara kerja modul, bukan CSS yang perlu kamu tulis. Karena `<style>` itu ada di awal `<head>`, aturan di CSS proyekmu untuk `.crootjs-toast` dan kelas warnanya langsung menang (sejak 0.0.34).
- Warnanya diambil dari variabel [croot.css](css) (`--croot-success`, `--croot-danger`, `--croot-warning`, `--croot-info`, teks `--croot-accent-text`), jadi ikut mode gelap kalau halaman memakai croot.css. Tanpa croot.css dipakai warna terangnya. Semua kombinasi memenuhi kontras WCAG AA. Ganti variabel itu untuk mengubah warna.
- Pembaca layar membacakan setiap toast: wadahnya `aria-live="polite"`, dan toast `"error"` memakai `role="alert"` sehingga dibacakan segera. Supaya toast pertama ikut terbaca, toast yang muncul dalam 100 ms setelah wadah dibuat ditunda sampai 100 ms itu lewat (urutannya tetap).
- Dengan `prefers-reduced-motion` toast muncul tanpa animasi.
- Toast tidak punya tombol dan tidak bisa diklik untuk ditutup. Untuk dialog konfirmasi (OK/Batal) pakai elemen `<dialog>` atau library lain.
