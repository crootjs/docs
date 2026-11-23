# Dokumentasi Modul `stp.js`

*[English](en/stp)*

`stp.js` berisi tiga fungsi untuk alur login dengan nomor telepon: meminta kode STP dikirim ke nomor pengguna, memverifikasinya, dan meminta kode dikirim ulang. Setiap fungsi mengirim `POST` JSON ke endpoint yang **ditulis tetap di dalam modul** dan tidak bisa diganti:

| Fungsi | Endpoint | Body |
|---|---|---|
| `sendSTP` | `https://asia-southeast2-awangga.cloudfunctions.net/domyid/auth/login` | `{ phonenumber, captcha }` |
| `verifySTP` | `https://asia-southeast2-awangga.cloudfunctions.net/domyid/auth/verify` | `{ phonenumber, password }` |
| `resendSTP` | `https://asia-southeast2-awangga.cloudfunctions.net/domyid/auth/resend` | `{ phonenumber }` |

Jadi modul ini hanya berguna untuk aplikasi yang memakai backend tersebut. Untuk backend sendiri, pakai [`postJSON`](api/) dari `api.js`.

## Cara Penggunaan (Import)

```javascript
import { sendSTP, verifySTP, resendSTP } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/stp.js";
```

## Perilaku Bersama

Ketiga fungsi bersifat `async` dan mengembalikan Promise berisi body respons yang sudah di-parse dari JSON. Promise **reject** (berbeda dari `api.js` yang tidak pernah melempar error) dalam keadaan berikut:

| Keadaan | Error |
|---|---|
| `phoneNumber` kosong | `Phone number is required` |
| `phoneNumber` tidak cocok dengan `/^62\d{9,15}$/` (diawali `62`, lalu 9–15 digit, tanpa spasi atau `+`) | `Invalid phone number format. It should start with 62 and followed by 9 to 15 digits.` |
| Status HTTP bukan 2xx | `Failed to send STP` / `Failed to verify STP` / `Failed to resend STP`; body respons dari server tidak diteruskan |
| Jaringan gagal | `TypeError` dari `fetch` |

Pemeriksaan nomor terjadi sebelum request dikirim. Untuk mengubah input `08...` menjadi `628...` saat pengguna mengetik, pakai `validatePhoneNumber` dari [`validate.js`](validate).

## `sendSTP(phoneNumber, captchaToken)`

Meminta kode dikirim ke `phoneNumber`. `captchaToken` adalah token CAPTCHA yang diperiksa oleh backend; modul tidak membuat token ini.

## `verifySTP(phoneNumber, password)`

Mengirim kode yang dimasukkan pengguna (`password`) untuk diverifikasi. Isi respons sepenuhnya ditentukan backend.

## `resendSTP(phoneNumber)`

Meminta kode dikirim ulang ke `phoneNumber`.

## Contoh

```javascript
import { sendSTP, verifySTP } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/stp.js";
import { getValue, onClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/element.js";

onClick("kirim-kode", async () => {
    try {
        await sendSTP(getValue("telepon"), getValue("captcha-token"));
        console.log("Kode terkirim");
    } catch (err) {
        console.error(err.message);
    }
});

onClick("verifikasi", async () => {
    try {
        const hasil = await verifySTP(getValue("telepon"), getValue("kode"));
        console.log(hasil);
    } catch (err) {
        console.error(err.message);
    }
});
```
