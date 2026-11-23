# Dokumentasi Modul `form.js`

*[English](en/form)*

`form.js` memvalidasi form dan menampilkan pesan kesalahan **di bawah setiap field yang salah**, bukan gelembung bawaan browser yang hilang sendiri dan berbeda-beda di tiap browser. Aturannya diambil dari atribut HTML biasa (`required`, `type="email"`, `minlength`, `maxlength`, `min`, `max`, `pattern`, `step`), ditambah aturan sendiri per field bila perlu. Pesan bawaannya berbahasa Indonesia dan bisa diganti.

Pesannya juga terbaca pembaca layar: field yang salah diberi `aria-invalid="true"`, pesannya disambungkan lewat `aria-describedby`, dan fokus pindah ke field salah yang pertama.

## Cara Penggunaan (Import)

```javascript
import { handleForm, validateForm, clearFormErrors } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.30/form.js";
```

## `handleForm(id, onSubmit, options)`

Cara paling cepat. Menangani submit form `id`: halaman tidak di-reload, form divalidasi, dan `onSubmit(data, event)` hanya dipanggil kalau semuanya benar. `data` berasal dari [`serializeForm`](element/#serializeformid). Setelah percobaan submit pertama, setiap field diperiksa ulang begitu diubah, jadi pesannya hilang begitu diperbaiki.

```html
<form id="daftar">
  <label for="nama">Nama</label>
  <input id="nama" name="nama" required minlength="3">

  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>

  <label for="sandi">Kata sandi</label>
  <input id="sandi" name="sandi" type="password" required minlength="8">

  <label for="ulang">Ulangi kata sandi</label>
  <input id="ulang" name="ulang" type="password" required>

  <label for="hp">Nomor HP</label>
  <input id="hp" name="hp" required pattern="62[0-9]{9,13}" title="Awali dengan 62, contoh 6281234567890.">

  <button type="submit">Daftar</button>
</form>
```

```javascript
import { handleForm } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.30/form.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.30/api.js";

handleForm("daftar", async (data) => {
    const { status } = await postJSON("https://api.example.com/daftar", data, null);
    console.log(status === 200 ? "Terdaftar" : "Gagal: " + status);
}, {
    rules: {
        ulang: (value, all) => value !== all.sandi ? "Kata sandi tidak sama." : null,
    },
    messages: {
        email: { valueMissing: "Email wajib diisi untuk menerima tautan aktivasi." },
    },
});
```

Mengembalikan `{ validate(), clear(), remove() }`. `remove()` melepas penanganan submit dan menghapus pesan yang tampil.

Pesan bawaan browser dimatikan dengan `novalidate` selama `handleForm` aktif.

## `validateForm(id, options)`

Memeriksa form sekali, misalnya sebelum pindah langkah di form bertahap. Pesan ditampilkan atau dihapus, lalu mengembalikan `true` kalau semuanya benar.

```javascript
import { validateForm } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.30/form.js";
import { onClick, show, hide } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.30/element.js";

onClick("lanjut", () => {
    if (!validateForm("langkah-1")) return;
    hide("langkah-1");
    show("langkah-2");
});
```

## `clearFormErrors(id)`

Menghapus semua pesan validasi di form, misalnya setelah form dikosongkan.

## Opsi

`options` sama untuk `handleForm` dan `validateForm`. Semuanya opsional.

| Opsi | Keterangan |
|---|---|
| `rules` | `{ namaField: (nilai, semuaNilai) => "pesan" \| null }`. Aturan tambahan; dijalankan sebelum aturan atribut HTML. `nilai` dan `semuaNilai` dari `serializeForm` |
| `messages` | Mengganti pesan bawaan: `{ namaField: "pesan" }` untuk semua jenis kesalahan field itu, atau `{ namaField: { valueMissing: "...", tooShort: "..." } }` per jenis |
| `focus` | `false` supaya fokus tidak dipindah ke field yang salah. Bawaan `true` |

## Pesan Bawaan

| Jenis | Atribut | Pesan |
|---|---|---|
| `valueMissing` | `required` | Wajib diisi. |
| `typeMismatch` | `type="email"` / `type="url"` / lainnya | Format email tidak valid. / Format URL tidak valid. / Format tidak valid. |
| `tooShort` | `minlength` | Minimal *n* karakter. |
| `tooLong` | `maxlength` | Maksimal *n* karakter. |
| `rangeUnderflow` | `min` | Minimal *n*. |
| `rangeOverflow` | `max` | Maksimal *n*. |
| `stepMismatch` | `step` | Nilainya tidak sesuai kelipatan yang diizinkan. |
| `badInput` | `type="number"` | Isi dengan angka. |
| `patternMismatch` | `pattern` | Isi atribut `title` field, atau "Format tidak sesuai." |

`minlength` dan `maxlength` juga diperiksa untuk nilai yang diisi lewat kode (misalnya [`fillForm`](element/#fillformid-data)); browser sendiri hanya memeriksanya untuk ketikan pengguna.

## Tempat dan Tampilan Pesan

- Field biasa: tepat sesudah field, atau sesudah `<label>` kalau field-nya dibungkus label.
- Kelompok radio atau checkbox dengan `name` yang sama: di akhir `<fieldset>` yang membungkusnya.
- Pesannya `<p class="crootjs-field-error">` berwarna merah. Bisa ditimpa dari CSS halaman, misalnya `.crootjs-field-error { color: #9f1239; }`, dan field yang salah bisa diberi gaya lewat `[aria-invalid="true"]`.

## Catatan

- Validasi di browser hanya untuk kenyamanan pengguna. Server tetap harus memeriksa ulang data yang diterima.
- Field `disabled`, tombol, dan field tanpa `name` tidak divalidasi.
