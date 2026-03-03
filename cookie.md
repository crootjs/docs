# setCookieWithExpireHour – CrootJS Cookie Module

`cookie.js` adalah modul dari CrootJS yang digunakan untuk mengelola cookie pada browser. Modul ini menyediakan fungsi untuk menyimpan, mengambil, dan menghapus cookie dengan berbagai pilihan masa berlaku (hari, jam, atau detik).

`setCookieWithExpireHour` adalah fungsi dari modul `cookie.js` (CrootJS) yang digunakan untuk menyimpan cookie dengan masa berlaku dalam hitungan **jam**.

Fungsi ini cocok digunakan untuk:

- Session login sementara  
- Token autentikasi  
- Status pengguna aktif  
- Preferensi sementara  

Modul ini menggunakan **ES Module (ESM)** sehingga harus diimpor menggunakan `type="module"`.

---

## Installation (CDN)

Import langsung dari jsDelivr:

```javascript
import { setCookieWithExpireHour } 
from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.1/cookie.js";

```

## Function

`setCookieWithExpireHour(name, value, hour)`

Menyimpan cookie dengan masa berlaku dalam hitungan jam.

| Parameter | Type   |Description            |
| --------- | ------ |---------------------- |
| `name`    | String |Nama cookie            |
| `value`   | String |Nilai cookie           |
| `hour`    | Number |Masa berlaku dalam jam |

Contoh 

Menyimpan Session Selama 2 Jam

`setCookieWithExpireHour("loginUser", "user_714240003", 2);`

```javascript
import { setCookieWithExpireHour } 
from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.1/cookie.js";
function login() {
  let username = "Zahra";
setCookieWithExpireHour("loginUser", "user_714240003", 2);
  console.log("Login berhasil, berlaku 2 jam.");
}

function logout() {
  document.cookie = "loginUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  console.log("Logout berhasil.");
}
```

## Note :
-Cookie hanya tersimpan pada domain yang sama.
-Jika nilai hour bernilai 0 atau negatif, cookie akan langsung kadaluarsa.