# Dokumentasi Modul `toast.js`

`toast.js` menampilkan notifikasi kecil (*toast*) di pojok kanan atas layar — tanpa dependency eksternal apa pun. CSS-nya di-*inject* otomatis oleh modul ini sendiri sekali saja (bukan ditulis manual di HTML/CSS proyekmu), jadi cukup import satu file ini untuk langsung bisa dipakai.

## Cara Penggunaan (Import)

```javascript
import { toast, toastSuccess, toastError, toastWarning, toastInfo } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.11/toast.js";
```

## `toast(message, type = "info", duration = 3000)`

Menampilkan satu toast. `type` menentukan warna: `"info"` (biru, default), `"success"` (hijau), `"error"` (merah), `"warning"` (kuning). `duration` dalam milidetik — toast otomatis hilang setelahnya. Kalau `duration` diisi `0`, toast **tidak** otomatis hilang (harus di-dismiss manual).

Mengembalikan function `dismiss()` — panggil kapan saja untuk menutup toast itu secara manual, walau sebelum `duration` habis.

```javascript
toast("Data berhasil disimpan"); // info, hilang otomatis 3 detik
toast("Berhasil!", "success", 2000);
toast("Gagal mengirim data", "error");
```

## Fungsi Pintas

Sama seperti `toast()` tapi type-nya sudah ditentukan — cuma perlu isi `message` dan (opsional) `duration`:

```javascript
toastSuccess("Berhasil disimpan!");
toastError("Terjadi kesalahan, coba lagi.");
toastWarning("Koneksi lambat...");
toastInfo("Memuat data...");
```

## Toast yang di-dismiss manual (misal loading state)

```javascript
import { toastInfo } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.11/toast.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.11/api.js";

const tutupLoading = toastInfo("Mengunggah...", 0); // duration 0 = tidak hilang sendiri

postJSON("https://api.example.com/upload", data, (res) => {
    tutupLoading(); // tutup toast loading setelah selesai
    if (res.status === 200) {
        toastSuccess("Berhasil diunggah!");
    } else {
        toastError("Gagal mengunggah.");
    }
});
```

## Catatan

- Style toast (warna, posisi, animasi) di-*inject* otomatis sebagai satu `<style id="crootjs-toast-style">` di `<head>` saat toast pertama dipanggil — ini bagian dari cara kerja modul, bukan style yang perlu (atau boleh) kamu tulis manual di file CSS proyekmu.
- Kalau butuh dialog konfirmasi (dengan tombol OK/Cancel), modul ini bukan untuk itu — `toast.js` cuma untuk notifikasi sekilas yang tidak butuh interaksi user.
