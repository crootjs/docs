# Dokumentasi Modul `cookie.js`

*[English](en/cookie)*

`cookie.js` menyimpan, membaca, dan menghapus cookie browser. Masa berlaku cookie diatur dalam hari, jam, atau detik. Semua cookie ditulis dengan `path=/`, jadi terbaca di seluruh halaman situs, dan ikut terkirim ke server di setiap request ke domain yang sama.

## Cara Penggunaan (Import)

```javascript
import { setCookieWithExpireHour, getCookie, deleteCookie } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/cookie.js";
```

## `setCookieWithExpireDay(cname, cvalue, exdays)`

## `setCookieWithExpireHour(cname, cvalue, exhour)`

## `setCookieWithExpireSecond(cname, cvalue, exsecs)`

Menyimpan cookie `cname` berisi `cvalue` yang kadaluwarsa `exdays` hari, `exhour` jam, atau `exsecs` detik dari sekarang. Nama dan nilai di-*encode* dengan `encodeURIComponent`. Tidak mengembalikan apa-apa.

| Parameter | Keterangan |
|---|---|
| `cname` | Nama cookie. Pakai huruf, angka, `-`, dan `_` saja (lihat Catatan) |
| `cvalue` | Nilai cookie, diubah ke string. Object perlu `JSON.stringify` dulu, kalau tidak tersimpan sebagai `"[object Object]"` |
| `exdays` / `exhour` / `exsecs` | Masa berlaku. `0` atau negatif membuat cookie langsung kadaluwarsa, sama dengan menghapusnya |

```javascript
setCookieWithExpireDay("bahasa", "id", 30);
setCookieWithExpireHour("token", "eyJhbGciOiJIUzI1NiJ9.contoh", 2);
setCookieWithExpireSecond("kodeOTPTerkirim", "1", 60);
```

## `getCookie(cname)`

Mengembalikan nilai cookie `cname` sebagai string, atau `""` (string kosong) kalau cookie itu tidak ada atau sudah kadaluwarsa.

```javascript
const token = getCookie("token");
if (token === "") {
    console.log("Belum login");
}
```

## `deleteCookie(cname)`

Menghapus cookie `cname` dengan mengatur kadaluwarsanya ke 1 Januari 1970. Hanya menghapus cookie dengan `path=/`, yaitu cookie yang dibuat modul ini.

### Contoh: login dan logout

```javascript
import { setCookieWithExpireHour, getCookie, deleteCookie } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/cookie.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";
import { onClick, getValue } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/element.js";

onClick("tombolLogin", async () => {
    const { status, data } = await postJSON("https://api.example.com/login", { user: getValue("user"), password: getValue("password") }, null);
    if (status === 200) setCookieWithExpireHour("token", data.token, 2);
});

onClick("tombolLogout", () => deleteCookie("token"));

console.log(getCookie("token") ? "Sudah login" : "Belum login");
```

## Catatan

- Cookie tidak diberi atribut `Secure` atau `SameSite`, jadi browser memakai bawaannya. Cookie yang dibuat dari JavaScript tidak bisa `HttpOnly`, sehingga token di sini bisa dibaca script mana pun di halaman.
- Sejak 0.0.30 `getCookie` membaca nama berisi spasi atau karakter khusus, dan nilai berisi `;` atau `%`, dengan benar. Versi sebelumnya men-*decode* dua kali: nilai seperti itu terpotong atau membuatnya melempar `URIError`.
- Browser membatasi ukuran satu cookie sekitar 4 KB. Data yang lebih besar dan tidak perlu dikirim ke server lebih cocok di [`storage.js`](storage).
